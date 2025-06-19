import DialogV2 from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/client-esm/applications/api/dialog.mjs';
import FeatureManager from '../managers/FeatureManager';
import { DndActor5e, DndItem5e } from '../types/dnd.types';
import BaseFeature from './BaseFeature';

interface AmmoItemOption {
    name: string;
    value: string;
    count: number;
    equipped: boolean;
}

export class ReloadFeature extends BaseFeature {
    private _hookId: number;
    private _handleChoiceDialogClose: boolean;

    constructor(featureManager: FeatureManager) {
        super(featureManager);
        this._hookId = -1;
        this._handleChoiceDialogClose = false;
    }

    init() {
        Hooks.on('dnd5e.preUseActivity', this.onUseActivity.bind(this));
    }

    onUseActivity(activity: any) {
        if (activity.type === 'utility' && activity.name == 'Reload') {
            console.log('Weapon Reload | Triggered Reload');

            this.characterId = activity.actor.id;
            this.weaponId = activity.item.id;
            this.weaponReload();
            return false;
        }
        return true;
    }

    weaponReload(refundAmmo: boolean = true) {
        const items = this.character?.items;
        const currentLoadout = this.loadout;
        const inventoryAmmunition = this.ammunition(items) as DndItem5e[];
        let ammunitionChoices: AmmoItemOption[] = [];

        if (refundAmmo) {
            ammunitionChoices = this.refundChamberedAmmo(inventoryAmmunition);
        } else {
            ammunitionChoices = inventoryAmmunition.map(
                (ammo: DndItem5e): AmmoItemOption => {
                    return {
                        name: ammo.name,
                        value: ammo.name,
                        count: ammo.system.quantity,
                        equipped: ammo.system.equipped,
                    };
                }
            );
        }

        const checkEquipped = game.settings.get(
            this.moduleManager.id,
            'filterAmmunitionByEquipped'
        ) as boolean;

        this.chooseAmmunition(
            ammunitionChoices.filter((ammoItem: AmmoItemOption) => {
                if (ammoItem.count > 0) {
                    if (
                        (checkEquipped && ammoItem.equipped) ||
                        !checkEquipped
                    ) {
                        return true;
                    }
                }
                return false;
            }),
            currentLoadout
        );
    }

    refundChamberedAmmo(inventoryAmmunition: DndItem5e[]): AmmoItemOption[] {
        const loadoutCounts = this.getLoadoutCounts(this.loadout);
        const availableAmmunition: AmmoItemOption[] = [];
        inventoryAmmunition.forEach((ammo: DndItem5e) => {
            const name = ammo.name;
            const ammoInfo: AmmoItemOption = {
                name: ammo.name,
                value: ammo.name,
                count: ammo.system.quantity,
                equipped: ammo.system.equipped,
            };
            if (loadoutCounts[name]) {
                ammoInfo.count = ammo.system.quantity + loadoutCounts[name];
                ammo.update({
                    'system.quantity': ammoInfo.count,
                });
            }
            availableAmmunition.push(ammoInfo);
        });
        return availableAmmunition;
    }

    async chooseAmmunition(
        ammoOptions: AmmoItemOption[],
        currentLoadout: string[]
    ) {
        const dialogContent = await (
            foundry.applications as any
        ).handlebars.renderTemplate(
            'modules/fvtt-weapon-reload/templates/ammoSelectionDialogTemplate.hbs',
            {
                loadoutSlots: new Array(
                    parseInt(this.weapon.system.uses.max)
                ).fill('Empty'),
                ammoOptions,
            }
        );

        const dialogButtons = [
            {
                action: 'load',
                label: this.translate(
                    'WEAPON_RELOAD.Features.Reload.Ammunition.ChoiceDialogButtonTxtLoad'
                ),
                callback: (
                    _event: PointerEvent | SubmitEvent,
                    button: HTMLButtonElement
                ) => {
                    this._handleChoiceDialogClose = false;
                    const loadout: string[] = [];
                    for (
                        let i = 0;
                        i < (button.form?.elements?.length as number);
                        i++
                    ) {
                        const elm = button.form?.elements.item(
                            i
                        ) as HTMLSelectElement;
                        if (elm?.name == 'ammo-select') {
                            loadout.push(elm.value);
                        }
                    }
                    return { loadout, reloadCanceled: false };
                },
            },
            {
                action: 'cancel',
                label: this.translate(
                    'WEAPON_RELOAD.Features.Reload.Ammunition.ChoiceDialogButtonTxtCancel'
                ),
                callback: () => {
                    this._handleChoiceDialogClose = false;
                    return { loadout: currentLoadout, reloadCanceled: true };
                },
            },
        ];

        this._handleChoiceDialogClose = true;
        this._hookId = Hooks.on('closeDialogV2', (dialogV2: DialogV2) => {
            if (dialogV2.id === 'ammo-choice-dialog') {
                this.onCloseChoiceDialog(currentLoadout);
            }
        });

        this.moduleManager.uiManager
            .buildDialog(
                {
                    title: this.translate(
                        'WEAPON_RELOAD.Features.Reload.Ammunition.ChoiceDialogTitle'
                    ),
                    content: dialogContent,
                    buttons: dialogButtons,
                    onSubmit: ({
                        loadout,
                        reloadCanceled,
                    }: {
                        loadout: string[];
                        reloadCanceled: boolean;
                    }): Promise<void> => {
                        return this.reloadReloadableWeapon(
                            loadout,
                            reloadCanceled
                        );
                    },
                },
                'ammo-choice-dialog'
            )
            .render({ force: true });
    }

    onCloseChoiceDialog(loadout: string[]) {
        Hooks.off('closeDialogV2', this._hookId);
        this._hookId = -1;

        if (this._handleChoiceDialogClose) {
            this._handleChoiceDialogClose = false;
            this.reloadReloadableWeapon(loadout, true);
        }
    }

    async reloadReloadableWeapon(
        loadout: string[],
        reloadCanceled: boolean = false
    ) {
        const reloadableWeapon = this.weapon;
        const ammoCounts = this.getLoadoutCounts(loadout);

        if (this.removeLoadout(ammoCounts)) {
            // Update the reloadableWeapon uses
            let qty = 0;
            if (ammoCounts['Empty'] > 0) {
                // Adjust spent uses by the number of Empty slots
                qty += ammoCounts['Empty'];
            }
            await reloadableWeapon.update({
                'system.uses.spent': qty,
                'system.uses.value':
                    parseInt(reloadableWeapon.system.uses.max) - qty,
            });
            await reloadableWeapon.setFlag(
                this.moduleManager.id,
                'chambered',
                loadout
            );
            await reloadableWeapon.setFlag(
                this.moduleManager.id,
                'fired',
                new Array(parseInt(this.weapon.system.uses.max)).fill('Empty')
            );

            const htmlTemplate = await (
                foundry.applications as any
            ).handlebars.renderTemplate(
                'modules/fvtt-weapon-reload/templates/reloadableWeaponReloadTemplate.hbs',
                {
                    item: {
                        img: reloadableWeapon.img,
                        name: reloadableWeapon.name,
                    },
                    flavor: this.translate(
                        reloadCanceled
                            ? 'WEAPON_RELOAD.Features.Reload.Weapon.WeaponReloadedChatFlavorCanceled'
                            : 'WEAPON_RELOAD.Features.Reload.Weapon.WeaponReloadedChatFlavor'
                    ),
                    title: this.translate(
                        reloadCanceled
                            ? 'WEAPON_RELOAD.Features.Reload.Weapon.WeaponReloadedChatMsgCanceled'
                            : 'WEAPON_RELOAD.Features.Reload.Weapon.WeaponReloadedChatMsg',
                        { reloadableWeapon: reloadableWeapon.name },
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
        return;
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
        const loadout: { [key: string]: number } = {};
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
