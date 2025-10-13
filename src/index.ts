import ModuleManager from './module/managers/ModuleManager';
import { rollDownSettings, listenForSystemChanges } from './utils/rolldown';

import moduleJson from '../module.json';

Hooks.once('init', async () => {
    console.log('Weapon Reload | Foundry VTT Module');

    const weapon_reload = new ModuleManager(moduleJson.id);
    weapon_reload.init();
});

Hooks.once('ready', async () => {
    await rollDownSettings();
    listenForSystemChanges();
});
