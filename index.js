const carousel = document.getElementById('carousel');

let scrollPos = 0,
    imgPos = 0;
const gap = 90,
    imgWidth = 200,
    margin = 0;
const setImagePos = () => {
    for (let i = 0; i < carousel.childElementCount; i++) {
        const img = carousel.children[i];
        img.style.transform = `translateX(${imgPos + i * (imgWidth + gap) + margin}px)`;
    }
};

setImagePos();

carousel.onwheel = e => {
    if (e.deltaX !== 0)
        e.preventDefault();

    scrollPos -= e.deltaX;
};

const templateCardHTML = `
<img>
<div class='label' data-type='loading'>
    <div class='loading-dot'></div>
    <div class='loading-dot' style='animation-delay: -0.8333s;'></div>
    <div class='loading-dot' style='animation-delay: -0.6667s;'></div>
</div>`;

const addImageCard = file => {
    const div = document.createElement('div');
    div.className = 'image';

    div.innerHTML = templateCardHTML;
    div.children[0].src = URL.createObjectURL(file);

    carousel.appendChild(div);

    return div;
    // window.setTimeout(() => {
    //     setLabelType(div.children[1], 0);
    // }, 700);
};

const setLabelType = (label, type) => {
    label.dataset.type = type;

    label.innerHTML = type === 'ai' ? 'AI' : 'Real';
    label.style.color = 'white';
};

const testImage = (card, file) => {
    run(file).then(result => {
        const {output, time} = result;
        const type = output[0] < output[1] ? 'ai' : 'real';
        console.log(time, type);
        setLabelType(card.children[1], type);

        if (jobs.length) {
            const j = jobs.shift();
            testImage(j.el, j.file);
        }
    });
};

const jobs = [];
const startJobs = () => {
    if (jobs.length) {
        const j = jobs.shift();
        testImage(j.el, j.file);
    }

    // for (const job of jobs) {
    //     testImage(job.el, job.file);
    // }
};

const imgInput = document.getElementById('img-input');
imgInput.onchange = async e => {
    for (const file of e.target.files) {
        jobs.push({
            el: addImageCard(file),
            file: file,
        });
    }
    if (ready) startJobs();
};


// imgInput.addEventListener('change', e => {
//     if (!ready) {
//         job = e.target.files[0];
//     } else {
//         reader.readAsArrayBuffer(e.target.files[0]);
//     }
// });


const loop = () => {
    imgPos += (scrollPos - imgPos) / 4;
    setImagePos();

    window.requestAnimationFrame(loop);
};
loop();


// window.setTimeout(() => {
//     const width = (container.children.length - 1) * 200 + (container.children.length - 1) * 40 + 150;
//     container.style.width = width + 'px';
//     console.log(width);
// }, 400);



init().then(startJobs);