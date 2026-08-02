import * as core from './core.js';
import * as ui from './ui.js';
import * as plg from './effects/index.js';

async function init() {
    core.test('Hello World!');

    const registry = await plg.loadPlugins();
    core.registerEffects(registry);
    ui.renderPluginEffects(registry);

    try {
        await window.cvReady;
        if (window.cv && typeof window.cv.imread === 'function') {
            console.log('OpenCV runtime ready.');
        }
    } catch (error) {
        console.warn('OpenCV runtime is unavailable, using the built-in canvas fallback for effects.', error);
    }
}

window.addEventListener('load', () => {
    init();
});