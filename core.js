// temporary image for processing
let tmpImg = new Image();
// rendered index of effect
let renderedIndex = 0;
// now rendering index of effect
let renderingIndex = 0;

export let state = {

    // plugins for effects
    effectRegistry: {},

    // pipeline for effects
    /*
    example a pipeline object:
    {
        id: "gaussian-blur",
        params: {
            value: 5
        },
        enabled: true
    }
    */
    pipeline: [],

    // source image
    sourceCanvas: null,

    // image for processing
    processingSourceCanvas: null,

    // preview scale
    previewWidth: 0,
    previewHeight: 0,

}
export async function registerEffects(registry) {

    state.effectRegistry = registry;
    console.log("loaded: " + state.effectRegistry['gaussian-blur'].id);
    return 0;

}

export function getPreviewScale(width, height) {

    /*
    if (!state.sourceCanvas || !state.sourceCanvas.width || !state.sourceCanvas.height) {
    return 1;
    }

    if (state.sourceCanvas.width > 2000 || state.sourceCanvas.height > 1500) {
    return 0.25;
    }

    if (state.sourceCanvas.width > 1500 || state.sourceCanvas.height > 1100) {
    return 0.35;
    }

    if (state.sourceCanvas.width > 1000 || state.sourceCanvas.height > 800) {
    return 0.45;
    }

    if (state.sourceCanvas.width > 700 || state.sourceCanvas.height > 600) {
    return 0.6;
    }

    return 0.8;
    */

    const average = (width + height) / 2.0;

    // 対数ロジスティック分布

    // スケールが半分となる基準値
    const alpha = 300;
    // 減衰率
    const beta = 1.2;

    // 最大縮小率
    const reduceMax = 1.0;
    // 最小縮小率
    const reduceMin = 0.1;

    const f = 1 / (1 + Math.pow(average / alpha, beta));

    return reduceMin + (reduceMax - reduceMin) * f;

}

// index : Rerendering image for index of effects in pipeline
export function updatePipeline(index = 0) {



}

export function render(imgObj) {

    if (state.pipeline.length === 0) return;

    if (state.pipeline.length >= renderedIndex) {

        for (let i = renderedIndex; i < state.pipeline.length; i++) {

            

        }
    }

}

// draw sourceCanvas by procImg
export function syncSourceCanvas(procImg) {
  
    if (!procImg.width || !procImg.height) {
        return;
    }

    if (!state.sourceCanvas || state.sourceCanvas.width !== procImg.width || state.sourceCanvas.height !== procImg.height) {
        state.sourceCanvas = document.createElement('canvas');
        state.sourceCanvas.width = procImg.width;
        state.sourceCanvas.height = procImg.height;
    }

    const sourceCtx = state.sourceCanvas.getContext('2d');
    sourceCtx.clearRect(0, 0, state.sourceCanvas.width, state.sourceCanvas.height);
    sourceCtx.drawImage(procImg, 0, 0);

}