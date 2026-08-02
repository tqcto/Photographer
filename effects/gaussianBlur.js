function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

function buildGaussianKernel(radius, sigma) {
    const kernel = [];
    let sum = 0;

    for (let offset = -radius; offset <= radius; offset += 1) {
        const weight = Math.exp(-(offset * offset) / (2 * sigma * sigma));
        kernel.push(weight);
        sum += weight;
    }

    return kernel.map(weight => weight / sum);
}

function applyCanvasGaussianBlur(input, output, strength = 5) {
    const radius = Math.max(1, Math.floor(Number(strength) / 2));
    const sigma = Math.max(0.5, Number(strength) / 3);
    const kernel = buildGaussianKernel(radius, sigma);

    const ctx = input.getContext('2d');
    const sourceData = ctx.getImageData(0, 0, input.width, input.height);
    const width = input.width;
    const height = input.height;
    const source = sourceData.data;
    const temp = new Uint8ClampedArray(source.length);
    const result = new Uint8ClampedArray(source.length);

    const convolveAxis = (sourcePixels, targetPixels, axis) => {
        for (let y = 0; y < height; y += 1) {
            for (let x = 0; x < width; x += 1) {
                let r = 0;
                let g = 0;
                let b = 0;
                let a = 0;
                let totalWeight = 0;

                for (let offset = -radius; offset <= radius; offset += 1) {
                    const kernelIndex = offset + radius;
                    const weight = kernel[kernelIndex];
                    const sampleX = axis === 'x' ? clamp(x + offset, 0, width - 1) : x;
                    const sampleY = axis === 'y' ? clamp(y + offset, 0, height - 1) : y;
                    const index = ((sampleY * width) + sampleX) * 4;

                    r += sourcePixels[index] * weight;
                    g += sourcePixels[index + 1] * weight;
                    b += sourcePixels[index + 2] * weight;
                    a += sourcePixels[index + 3] * weight;
                    totalWeight += weight;
                }

                const outputIndex = (y * width + x) * 4;
                targetPixels[outputIndex] = Math.round(r / totalWeight);
                targetPixels[outputIndex + 1] = Math.round(g / totalWeight);
                targetPixels[outputIndex + 2] = Math.round(b / totalWeight);
                targetPixels[outputIndex + 3] = Math.round(a / totalWeight);
            }
        }
    };

    convolveAxis(source, temp, 'x');
    convolveAxis(temp, result, 'y');

    const outputContext = output.getContext('2d');
    outputContext.putImageData(new ImageData(result, width, height), 0, 0);
    return output;
}

export const effect = {
    id: 'gaussian-blur',
    label: 'ガウシアンブラー',

    controls: [
        {
            key: 'value',
            label: '強さ',
            type: 'range',
            min: 0,
            max: 20,
            step: 0.1,
            default: 5
        }
    ],

    render: (input, output, params = {}) => {
        if (!(input instanceof HTMLCanvasElement)) {
            throw new Error('gaussian-blur expects an HTMLCanvasElement input.');
        }

        const outputCanvas = output instanceof HTMLCanvasElement ? output : document.createElement('canvas');
        outputCanvas.width = input.width;
        outputCanvas.height = input.height;

        const strength = Number(params.value ?? 5);
        if (window.cv && typeof window.cv.imread === 'function' && typeof window.cv.GaussianBlur === 'function' && typeof window.cv.imshow === 'function') {
            const kernel = Math.max(1, Math.min(31, strength * 2 + 1));
            const sigma = Math.max(0.1, strength);

            const src = cv.imread(input);
            const dst = new cv.Mat();
            cv.GaussianBlur(src, dst, new cv.Size(kernel, kernel), sigma, sigma, cv.BORDER_DEFAULT);
            cv.imshow(outputCanvas, dst);

            src.delete();
            dst.delete();
            return outputCanvas;
        }

        return applyCanvasGaussianBlur(input, outputCanvas, strength);
    }
};