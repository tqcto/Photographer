import * as core from './core.js';
import * as ui from './ui.js';
import * as plg from './effects/index.js';

async function init() {
    core.test('Hello World!');

    const registry = await plg.loadPlugins();
    core.registerEffects(registry);
    ui.renderPluginEffects(registry);
}

window.addEventListener('load', () => {
    init();
});