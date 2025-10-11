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

const addImageCard = file => {
    const div = document.createElement('div');
    div.className = 'image';
};

const jobs = [];

const imgInput = document.getElementById('img-input');
imgInput.onchange = async e => {
    for (const f of e.target.files) {
        jobs.push(f);

    }
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



init();