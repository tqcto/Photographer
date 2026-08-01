export async function loadPlugins() {

    // if add plugins, add here
    const pluginList = [
        "./gaussianBlur.js"
    ];

    const modules = await Promise.all(
        pluginList.map(file => import(file))
    );

    let effectRegistry = {};
    modules.forEach(mod => {

        try {
            if (mod.effect && mod.effect.id) {
                effectRegistry[mod.effect.id] = mod.effect;
                console.log("add plg id: " + mod.effect.id);
            }
        }
        catch (err) {
            console.error("[${file} can't loaded]", err);
        }

    });

    return effectRegistry;

}