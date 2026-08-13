function gammaFunction(input, output, gamma) {
    
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
                
                const index = ((y * width) + x) << 2;
                const exp = 1.0 / gamma;

                let r = 255.0 * Math.pow(sourcePixels[index] / 255.0, exp);
                let g = 255.0 * Math.pow(sourcePixels[index + 1] / 255.0, exp);
                let b = 255.0 * Math.pow(sourcePixels[index + 2] / 255.0, exp);
                let a = 255.0 * Math.pow(sourcePixels[index + 3] / 255.0, exp);
                
                targetPixels[index] = Math.round(r);
                targetPixels[index + 1] = Math.round(g);
                targetPixels[index + 2] = Math.round(b);
                targetPixels[index + 3] = Math.round(a);
            
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
    id: 'contrast',
    label: 'コントラスト',

    controls: [
        {
            key: 'value',
            label: 'γ',
            type: 'range',
            min: 0.1,
            max: 6,
            step: 0.01,
            default: 1
        }
    ],

    render: (input, output, params = {}, details) => {
        if (!(input instanceof HTMLCanvasElement)) {
            throw new Error('gaussian-blur expects an HTMLCanvasElement input.');
        }

        const outputCanvas = output instanceof HTMLCanvasElement ? output : document.createElement('canvas');
        outputCanvas.width = input.width;
        outputCanvas.height = input.height;

        const strength = Number(params.value ?? 1);

        return gammaFunction(input, outputCanvas, strength);
    }
};