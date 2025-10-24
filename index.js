
const aiWorker = new Worker('ai.js');

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
        img.style.transform = `translateX(${
            center +
            imgPos + i * (imgWidth + gap) + margin
        }px)`;
    }
};

setImagePos();


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

const setScrollVisibility = visible => {
    leftScroll.style.display = rightScroll.style.display = visible ? 'flex' : 'none';
};
setScrollVisibility(false);

let hiddenScroll = null;
const checkScroll = () => {
    const center = window.innerWidth / 2 - imgWidth / 2,
        width = numImages * (imgWidth + gap);

    const pastHidden = hiddenScroll;
    hiddenScroll = null;

    const farLeft = -center + gap;
    if (scrollPos > farLeft) scrollPos = farLeft, hiddenScroll = 'left';
    if (scrollPos > farLeft - 5) hiddenScroll = 'left';

    const farRight = -center + window.innerWidth - width;
    if (scrollPos < farRight) scrollPos = farRight, hiddenScroll = 'right';
    if (scrollPos < farRight + 5) hiddenScroll = 'right';

    const fits = width < window.innerWidth;
    if (fits) {
        scrollPos = -(
            (numImages - 1) * imgWidth + // Accounts for offset in setImagePos
            (numImages - 1) * gap
        ) / 2;
    }
    setScrollVisibility(!fits);

    if (pastHidden !== hiddenScroll) {
        if (hiddenScroll === 'left') {
            leftScroll.style.opacity = '0';
            rightScroll.style.opacity = '1';
        } else if (hiddenScroll === 'right') {
            leftScroll.style.opacity = '1';
            rightScroll.style.opacity = '0';
        } else {
            leftScroll.style.opacity = '1';
            rightScroll.style.opacity = '1';
        }
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
    carousel.style.display = 'block';

    const div = document.createElement('div');
    div.className = 'image';

    div.innerHTML = templateCardHTML;
    div.children[0].src = URL.createObjectURL(file);

    childImages.push(div);
    carousel.appendChild(div);

    if (numImages++ !== 0)
        scrollPos -= imgWidth / 2 + gap / 2;

    checkScroll();

    return div;
};

const setLabelType = (label, type) => {
    label.dataset.type = type;

    label.innerHTML = type === 'ai' ? 'AI' : 'Real';
    label.style.color = 'white';
};

let id = 0;
const elements = [];

const imgInput = document.getElementById('img-input');
imgInput.oninput = async e => {
    const message = [];
    for (const file of e.target.files) {
        message.push({ // Assigne ID to image
            id: id,
            file: file,
        });

        // Associate image card element to ID
        elements[id] = addImageCard(file);

        id ++;
    }
    
    // Send image off to worker to be classified
    aiWorker.postMessage(message);
};

// Once type is received from worker
aiWorker.onmessage = e => {
    setLabelType(elements[e.data.id].children[1], e.data.type);
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



// init().then(startJobs);


/*

                <!-- <svg id='logo' xmlns="http://www.w3.org/2000/svg" viewBox="0 -19 18 19">
                    <path d="M 0 0 L 7 -19 L 18 -19 L 16.8947368 -16 L 8.8947368 -16 L 3 0 L 0 0" fill="white"/>
                    <path d="M 0 0 L 7 -19 L 8.8947368 -16 L 3 0 L 0 0" fill="white"/>
                    <path d="M 7 -19 L 18 -19 L 16.8947368 -16 L 8.8947368 -16" fill="white"/>

                    <circle cx='12.5' cy='-7' r='1.7' fill='white'/>
                </svg> -->
*/