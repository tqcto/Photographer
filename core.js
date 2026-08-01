// temporary image for processing
let tmpImg = new Image();
// rendered index of effect
let renderedIndex = 0;
// now rendering index of effect
let renderingIndex = 0;

// plugins for effects
let effectPlugins = [];

// pipeline list for effects
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
let pipelineList = [];

// index : Rerendering image for index of effects in pipeline
export function updatePipeline(index = 0) {



}

export function render(imgObj) {

    if (pipelineList.length === 0) return;

    if (pipelineList.length >= renderedIndex) {

        for (let i = renderedIndex; i < pipelineList.length; i++) {

            

        }
    }

}

export function test(sample) {

    console.log(sample);
    
}