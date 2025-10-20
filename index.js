const carousel = document.getElementById('carousel');

let scrollPos = 0,
    imgPos = 0;
const gap = 90,
    imgWidth = 200,
    margin = 0;
let childImages = [];
const setImagePos = () => {
    const center = window.innerWidth / 2 - imgWidth / 2;
    for (let i = 0; i < childImages.length; i++) {
        const img = childImages[i];
        // console.log(img);
        img.style.transform = `translateX(${
            center +
            imgPos + i * (imgWidth + gap) + margin
        }px)`;
    }
};

setImagePos();

const checkScroll = () => {
    const center = window.innerWidth / 2 - imgWidth / 2,
        width = numImages * (imgWidth + gap);

    const farLeft = -center + gap;
    if (scrollPos > farLeft) scrollPos = farLeft;

    const farRight = -center + window.innerWidth - width;
    if (scrollPos < farRight) scrollPos = farRight;

    if (width < window.innerWidth) {
        console.log('center');
        scrollPos = -(
            (numImages - 1) * imgWidth + // Accounts for offset in setImagePos
            (numImages - 1) * gap
        ) / 2;
    }
};
const onScroll = e => {
    if (e.deltaX !== 0)
        e.preventDefault?.();

    scrollPos -= e.deltaX || 0;

    checkScroll();
};
carousel.onwheel = onScroll;

window.onresize = checkScroll;

const templateCardHTML = `
<img>
<div class='label' data-type='loading'>
    <div class='loading-dot'></div>
    <div class='loading-dot' style='animation-delay: -0.8333s;'></div>
    <div class='loading-dot' style='animation-delay: -0.6667s;'></div>
</div>`;

let numImages = 0;
const addImageCard = file => {
    const div = document.createElement('div');
    div.className = 'image';

    div.innerHTML = templateCardHTML;
    div.children[0].src = URL.createObjectURL(file);

    childImages.push(div);
    carousel.appendChild(div);

    if (numImages++ !== 0)
        scrollPos -= imgWidth / 2 + gap / 2;

    console.log('Added');

    return div;
    // window.setTimeout(() => {
    //     setLabelType(div.children[1], 0);
    // }, 700);
};

fetch('assets/japanese-temple1-small.jpeg').then(async file => {
    const img = await file.blob()
    addImageCard(img);
    addImageCard(img);
    addImageCard(img);

    onScroll({});
});

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
imgInput.oninput = async e => {
    for (const file of e.target.files) {
        jobs.push({
            el: addImageCard(file),
            file: file,
        });
    }
    console.log('file', ready, jobs);
    if (ready) startJobs();
};


let scrollDir = 0;
const leftScroll = document.getElementById('left-scroll');
leftScroll.onmouseover = () => {
    scrollDir = 3;
};
leftScroll.onmouseout = () => {
    scrollDir = 0;
};

const rightScroll = document.getElementById('right-scroll');
rightScroll.onmouseover = () => {
    scrollDir = -3;
};
rightScroll.onmouseout = () => {
    scrollDir = 0;
};

// imgInput.addEventListener('change', e => {
//     if (!ready) {
//         job = e.target.files[0];
//     } else {
//         reader.readAsArrayBuffer(e.target.files[0]);
//     }
// });


const loop = () => {
    if (scrollDir !== 0) {
        scrollPos += scrollDir;
        checkScroll();
    }

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