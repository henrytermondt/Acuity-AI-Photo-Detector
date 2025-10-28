// Import the ONNX Runtime and Jimp
importScripts(
    'https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/ort.webgpu.min.js',
    'https://cdn.jsdelivr.net/npm/jimp@0.22.12/browser/lib/jimp.min.js',
);

let ready = false;
let session;

const toTensor = img => {
    let index = 0;
    const data = new Float32Array(3 * 224 * 224);

    // Organize pixels correctly
    for (let i = 0; i < img.bitmap.data.length; i += 4) {
        data[index    ] = img.bitmap.data[i    ] / 255;
        data[index + 1] = img.bitmap.data[i + 1] / 255;
        data[index + 2] = img.bitmap.data[i + 2] / 255;

        index += 3;
    }

    return new ort.Tensor('float32', data, [1, 3, 224, 224]);
};

// Get how confident the AI is in its predictions
const runInference = async bufferData => {
    const img = await Jimp.read(bufferData);
    img.resize(224, 224);
    img.normalize();
    
    const feeds = {};
    feeds[session.inputNames[0]] = toTensor(img);

    const output = (await session.run(feeds))[session.outputNames[0]].cpuData;
    
    // Softmax function
    const sum = Math.exp(output[0]) + Math.exp(output[1]);
    return [Math.exp(output[0]) / sum, Math.exp(output[1]) / sum];
};

// Read file and run prediction
const run = async file => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async e => {
            const start = performance.now();
            
            const output = await runInference(e.target?.result);

            resolve({
                output: output,
                time: performance.now() - start,
            });
        };
        reader.readAsArrayBuffer(file);
    });
};

// Test an image, get the prediction, and send the result out of the worker
const testImage = (id, file) => {
    run(file).then(result => {
        const {output, time} = result;
        const type = output[0] < output[1] ? 'ai' : 'real';
        
        // Test has ran, send back type and which element to change
        self.postMessage({
            id: id,
            type: type,
        });

        if (jobs.length) {
            const j = jobs.shift();
            testImage(j.id, j.file);
        }
    });
};

const jobs = [];
const startJobs = () => {
    if (jobs.length) {
        const j = jobs.shift();
        testImage(j.id, j.file);
    }
};

// Create AI
const init = async () => {
    session = await ort.InferenceSession.create('model.onnx', {
        executionProviders: ['webgpu']
    });
    ready = true;
};

onmessage = e => {
    jobs.push(...e.data);
    if (ready) startJobs();
}

init().then(startJobs);