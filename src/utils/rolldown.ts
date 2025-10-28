const MODULE_ID = 'fvtt-weapon-reload';
/**
 * Rolls down global/system settings to world scope if missing or outdated.
 * Typically called on `ready`.
 */
export async function rollDownSettings(): Promise<void> {
    const globalDefaults = {
        unstableAmmo: true,
        unstableAmmoFailureThreshhold: 2,
        useMisfires: true,
        filterAmmunitionByEquipped: false,
        repeaterRoundUUID:
            'Compendium.fvtt-weapon-reload.weapon-reload-item-pack.Item.GQzRN4amlRZX7k0V',
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
 * Watch for system-level setting changes and propagate them.
 */
export function listenForSystemChanges(): void {
    Hooks.on(
        'updateSetting',
        async (setting: { key: string; value: unknown }) => {
            if (
                setting.key?.startsWith('system.') &&
                setting.key.includes(MODULE_ID)
            ) {
                const [, , key] = setting.key.split('.');
                console.log(
                    `[${MODULE_ID}] Detected system-level change: ${key}`
                );
                await game.settings.set(MODULE_ID, key, setting.value);
            }
        }
    );
}
