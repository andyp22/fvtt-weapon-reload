import FeatureManager from '../managers/FeatureManager';
import { DndActor5e, DndItem5e } from '../types/dnd.types';
import BaseFeature from './BaseFeature';

export class ReloadFeature extends BaseFeature {
    constructor(featureManager: FeatureManager) {
        super(featureManager);
    }

    init() {
        Hooks.on('dnd5e.postUseActivity', this.onUseActivity.bind(this));
    }

    async onUseActivity(activity: any) {
        if (activity.type === 'utility' && activity.name == 'Reload') {
            console.log('Weapon Reload | Triggered Reload: ', activity);

            this.characterId = activity.actor.id;
            this.weaponId = activity.item.id;
            this.weaponReload();
        }
    }

    async weaponReload(refundAmmo: boolean = true) {
        const items = this.character?.items;
        const checkEquipped = game.settings.get(
            this.moduleManager.id,
            'filterAmmunitionByEquipped'
        ) as boolean;
        const currentLoadout = this.loadout;

        if (refundAmmo) {
            this.refundChamberedAmmo(this.ammunition(items) as DndItem5e[]);
        }

        const ammo = this.ammunition(items, checkEquipped) as DndItem5e[];
        const inventoryAmmunition: DndItem5e[] = [];

        ammo.forEach((ammoItem: DndItem5e) => {
            if (ammoItem.system.quantity > 0) {
                inventoryAmmunition.push(ammoItem);
            }
        });

        await this.chooseAmmunition(inventoryAmmunition, currentLoadout);
    }

    refundChamberedAmmo(availableAmmunition: DndItem5e[]) {
        const loadoutCounts = this.getLoadoutCounts(this.loadout);
        availableAmmunition.forEach(async (ammo: DndItem5e) => {
            const name = ammo.name;
            if (loadoutCounts[name]) {
                await ammo.update({
                    'system.quantity':
                        ammo.system.quantity + loadoutCounts[name],
                });
            }
        });
    }

    async chooseAmmunition(
        availableAmmunition: DndItem5e[],
        currentLoadout: string[]
    ) {
        const dialogContent = await (
            foundry.applications as any
        ).handlebars.renderTemplate(
            'modules/foundry-vtt-eberron-west-module/templates/ammoSelectionDialogTemplate.hbs',
            {
                loadoutSlots: new Array(
                    parseInt(this.weapon.system.uses.max)
                ).fill(this.EMPTY),
                ammoOptions: availableAmmunition.map((ammoType: DndItem5e) => {
                    return {
                        name: ammoType.name,
                        value: ammoType.name,
                        count: ammoType.system.quantity,
                    };
                }),
            }
        );

        const dialogButtons = [
            {
                action: 'load',
                label: this.translate(
                    'WEAPON_RELOAD.Features.Reload.Ammunition.ChoiceDialogButtonTxtLoad'
                ),
                callback: (_event, button) => {
                    const loadout: string[] = [];
                    for (let i = 0; i < button.form.elements.length; i++) {
                        const elm = button.form.elements.item(i);
                        if (elm.name == 'ammo-select') {
                            loadout.push(elm.value);
                        }
                    }
                    return loadout;
                },
            },
            {
                action: 'cancel',
                label: this.translate(
                    'WEAPON_RELOAD.Features.Reload.Ammunition.ChoiceDialogButtonTxtCancel'
                ),
                callback: () => {
                    return currentLoadout;
                },
            },
        ];

        this.moduleManager.uiManager
            .buildDialog(
                {
                    title: this.translate(
                        'WEAPON_RELOAD.Features.Reload.Ammunition.ChoiceDialogTitle'
                    ),
                    content: dialogContent,
                    buttons: dialogButtons,
                    onSubmit: this.reloadFirearm.bind(this),
                },
                'ammo-choice-dialog'
            )
            .render({ force: true });
    }

    async reloadFirearm(loadout: string[]) {
        const firearm = this.weapon;
        const ammoCounts = this.getLoadoutCounts(loadout);

        if (this.removeLoadout(ammoCounts)) {
            // Update the firearm uses
            let qty = 0;
            if (ammoCounts[this.EMPTY] > 0) {
                // Adjust spent uses by the number of Empty slots
                qty += ammoCounts[this.EMPTY];
            }
            await firearm.update({
                'system.uses.spent': qty,
                'system.uses.value': parseInt(firearm.system.uses.max) - qty,
            });
            await firearm.setFlag(this.moduleManager.id, 'chambered', loadout);
            await firearm.setFlag(
                this.moduleManager.id,
                'fired',
                new Array(parseInt(this.weapon.system.uses.max)).fill(
                    this.EMPTY
                )
            );

            const htmlTemplate = await (
                foundry.applications as any
            ).handlebars.renderTemplate(
                'modules/foundry-vtt-eberron-west-module/templates/firearmReloadTemplate.hbs',
                {
                    item: {
                        img: firearm.img,
                        name: firearm.name,
                    },
                    flavor: this.translate(
                        'WEAPON_RELOAD.Features.Reload.Weapon.WeaponReloadedChatFlavor'
                    ),
                    title: this.translate(
                        'WEAPON_RELOAD.Features.Reload.Weapon.WeaponReloadedChatMsg',
                        { firearm: firearm.name },
                        true
                    ),
                    loadout: loadout,
                }
            );
            // Notify the peeps
            this.moduleManager.uiManager.sendChat(this.character, htmlTemplate);
            this.characterId = '';
            this.weaponId = '';
        } else {
            await this.weaponReload(false);
        }
    }

    removeLoadout(counts: { [key: string]: number }): boolean {
        let ammunitionAvailable = true;
        const inventoryAmmunition = this.ammunition(
            this.character?.items
        ) as DndItem5e[];
        inventoryAmmunition.forEach((ammo: DndItem5e) => {
            const name = ammo.name;
            const qty = ammo.system.quantity - counts[name];

            // If any bullet is added beyond the quantity the player actually has then throw an error and return false
            if (qty < 0) {
                this.moduleManager.uiManager.uiNotification(
                    this.translate(
                        'WEAPON_RELOAD.Features.Reload.Weapon.LoadingErrorMsg',
                        { name: ammo.name },
                        true
                    ),
                    'error'
                );
                ammunitionAvailable = false;
            }
        });

        if (ammunitionAvailable) {
            inventoryAmmunition.forEach(async (ammo: DndItem5e) => {
                const name = ammo.name;
                if (counts[name]) {
                    await ammo.update({
                        'system.quantity': ammo.system.quantity - counts[name],
                    });
                }
            });
        }

        return ammunitionAvailable;
    }

    async onReloadCallback(actor: DndActor5e, weapon: DndItem5e) {
        this.characterId = actor.id;
        this.weaponId = weapon.id;

        this.weaponReload();
    }

    getLoadoutCounts(currentLoadout: string[]): {
        [key: string]: number;
    } {
        const loadout = {};
        currentLoadout.forEach((ammo: string) => {
            if (!loadout[ammo]) loadout[ammo] = 0;
            loadout[ammo] = loadout[ammo] + 1;
        });
        return loadout;
    }

    toString() {
        return 'class ReloadFeature';
    }
}
