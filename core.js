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