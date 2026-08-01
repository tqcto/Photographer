export const effect = {

    id: "gaussian-blur",
    label: "ガウシアンブラー",

    controls: [
        {
            key: "value",
            label: "強さ",
            type: "range",
            min: 0,
            max: 20,
            step: 1,
            default: 5
        }
    ],

    render: (input, output, params) => {

        const src = input.data;
        const dst = output.data;

    }

}