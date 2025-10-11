let ready = false;
let job = null;
let session;


const toTensor = img => {
    console.log('toTensor');
    let index = 0;
    const data = new Float32Array(3 * 224 * 224);

    for (let i = 0; i < img.bitmap.data.length; i += 4) {
        data[index    ] = img.bitmap.data[i    ] / 255;
        data[index + 1] = img.bitmap.data[i + 1] / 255;
        data[index + 2] = img.bitmap.data[i + 2] / 255;

        index += 3;
    }

    return new ort.Tensor('float32', data, [1, 3, 224, 224]);
};
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


const reader = new FileReader();
reader.onload = async e => {
    console.log('onload');
    start = performance.now();
    
    const output = await runInference(e.target?.result);
    console.log(output);
    console.log('done', (performance.now() - start) / 1000);
};

let start;
const init = async () => {
    session = await ort.InferenceSession.create('model.onnx', {
        executionProviders: ['webgpu', 'wasm']
    });

    ready = true;
    if (job) reader.readAsArrayBuffer(job);
};