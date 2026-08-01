import * as core from './core.js';
import * as plg from './effects/index.js'

// initialize
async function init() {

    core.test("Hello World!");

    const registry = await plg.loadPlugins();
    core.registerEffects(registry);

}
//document.addEventListener('DOMContentLoaded', init);
init();