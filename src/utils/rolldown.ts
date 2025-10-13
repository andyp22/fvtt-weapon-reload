const MODULE_ID = 'fvtt-weapon-reload';
/**
 * Rolls down global/system settings to world scope if missing or outdated.
 * Typically called on `ready`.
 */
export async function rollDownSettings(): Promise<void> {
    // Pretend we have a global defaults object (could also come from a compendium or system setting)
    const globalDefaults = {
        enableFeature: true,
        colorTheme: 'sepia',
    };

    for (const [key, value] of Object.entries(globalDefaults)) {
        const current = game.settings.get(MODULE_ID, key);
        if (current === undefined || current === null) {
            console.log(
                `[${MODULE_ID}] Rolling down default for ${key}: ${value}`
            );
            await game.settings.set(MODULE_ID, key, value);
        }
    }
}

/**
 * Optional advanced: watch for system-level setting changes and propagate them.
 */
export function listenForSystemChanges(): void {
    Hooks.on('updateSetting', async (setting: any) => {
        if (
            setting.key?.startsWith('system.') &&
            setting.key.includes(MODULE_ID)
        ) {
            const [, , key] = setting.key.split('.');
            console.log(`[${MODULE_ID}] Detected system-level change: ${key}`);
            await game.settings.set(MODULE_ID, key, setting.value);
        }
    });
}
