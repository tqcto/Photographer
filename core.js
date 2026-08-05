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
}
export async function registerEffects(registry) {

    state.effectRegistry = registry;
    console.log("loaded: " + state.effectRegistry['gaussian-blur'].id);
    return 0;

}

export function getPreviewScale() {
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

export function test(sample) {

    console.log(sample);
    
}