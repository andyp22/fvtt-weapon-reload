import ModuleManager from './module/managers/ModuleManager';
import TemplateManager from './module/managers/TemplateManager';

import moduleJson from '../module.json';

Hooks.once('init', async () => {
    console.log('Weapon Reload | Foundry VTT Module');

    const weapon_reload = new ModuleManager(moduleJson.id);
    weapon_reload.init();
});

if (process.env.NODE_ENV === 'development') {
    if (module.hot) {
        module.hot.accept();

        if (module.hot.status() === 'apply') {
            TemplateManager.onHotReload();
        }
    }
}
