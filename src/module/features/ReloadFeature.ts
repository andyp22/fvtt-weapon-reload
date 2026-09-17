import DialogV2 from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/client-esm/applications/api/dialog.mjs';
import FeatureManager from '../managers/FeatureManager';
import BaseFeature from './BaseFeature';
import {
    AmmoItemOption,
    DndItem5e,
    type foundryApplications,
    UtilityActivity,
} from '../types';

export class ReloadFeature extends BaseFeature {
    private _hookId: number;
    private _handleChoiceDialogClose: boolean;
    private _repeaterRound: DndItem5e;

    constructor(featureManager: FeatureManager) {
        super(featureManager);
        this._hookId = -1;
        this._handleChoiceDialogClose = false;
        this._repeaterRound = {} as DndItem5e;
    }

    init() {
        Hooks.on('dnd5e.preUseActivity', this.onUseActivity.bind(this));
        Hooks.on('ready', this.getRepeaterAmmo.bind(this));
    }

    async getRepeaterAmmo() {
        const repeater_round_uuid = game.settings.get(
            this.moduleManager.id,
            'repeaterRoundUUID'
        ) as string;
        this._repeaterRound = (await fromUuid(
            repeater_round_uuid
        )) as unknown as DndItem5e;
    }

    onUseActivity(activity: UtilityActivity) {
        if (activity.type === 'utility' && activity.name == 'Reload') {
            console.log('Weapon Reload | Triggered Reload');

            this.characterId = activity.actor.id;
            this.weaponId = activity.item.id;
            this.weaponReload();
            return false;
        }
        return true;
    }

    weaponReload(refundAmmo = true) {
        const items = this.character?.items;
        const currentLoadout = this.loadout;
        const inventoryAmmunition = this.ammunition(items, false, [
            this._repeaterRound.name,
        ]) as DndItem5e[];
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

    onSubmitChooseAmmunition(data: unknown): Promise<void> {
        const { loadout, reloadCanceled } = data as {
            loadout: string[];
            reloadCanceled: boolean;
        };
        return this.reloadReloadableWeapon(loadout, reloadCanceled);
    }

    async chooseAmmunition(
        ammoOptions: AmmoItemOption[],
        currentLoadout: string[]
    ) {
        const dialogContent = await (
            foundry.applications as foundryApplications
        ).handlebars.renderTemplate(
            'modules/fvtt-weapon-reload/templates/ammoSelectionDialogTemplate.hbs',
            {
                loadoutSlots: new Array(this.weapon.system.uses.max).fill(
                    'Empty'
                ),
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

        const onCloseDialogHook = (dialogV2: DialogV2) => {
            if (dialogV2.id === 'ammo-choice-dialog') {
                this.onCloseChoiceDialog(currentLoadout);
            }
        };

        this._handleChoiceDialogClose = true;
        this._hookId = Hooks.on('closeDialogV2', onCloseDialogHook.bind(this));

        this.moduleManager.uiManager
            .buildDialog(
                {
                    title: this.translate(
                        'WEAPON_RELOAD.Features.Reload.Ammunition.ChoiceDialogTitle'
                    ),
                    content: dialogContent,
                    buttons: dialogButtons,
                    onSubmit: this.onSubmitChooseAmmunition.bind(this),
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

    async buildReloadChat(
        reloadableWeapon: Item5e,
        reloadCanceled: boolean,
        loadout: string[]
    ) {
        return await (
            foundry.applications as foundryApplications
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
    }

    async reloadReloadableWeapon(loadout: string[], reloadCanceled = false) {
        const reloadableWeapon = this.weapon;
        const ammoCounts = this.getLoadoutCounts(loadout);
        const canceledLoadout = new Array(this.weapon.system.uses.max).fill(
            'Empty'
        );
        let htmlTemplate;

        if (this.removeLoadout(ammoCounts)) {
            // Update the reloadableWeapon uses
            let qty = 0;
            if (ammoCounts['Empty'] > 0) {
                // Adjust spent uses by the number of Empty slots
                qty += ammoCounts['Empty'];
            }
            await reloadableWeapon.update({
                'system.uses.spent': qty,
                'system.uses.value': reloadableWeapon.system.uses.max - qty,
            });
            await reloadableWeapon.setFlag(
                this.moduleManager.id,
                'chambered',
                loadout
            );

            htmlTemplate = await this.buildReloadChat(
                reloadableWeapon,
                reloadCanceled,
                loadout
            );
        } else {
            Hooks.off('closeDialogV2', this._hookId);
            this._hookId = -1;
            await reloadableWeapon.setFlag(
                this.moduleManager.id,
                'chambered',
                canceledLoadout
            );
            htmlTemplate = await this.buildReloadChat(
                reloadableWeapon,
                reloadCanceled,
                canceledLoadout
            );
        }
        await reloadableWeapon.setFlag(
            this.moduleManager.id,
            'fired',
            canceledLoadout
        );

        this.moduleManager.uiManager.sendChat(this.character, htmlTemplate);
        this.characterId = '';
        this.weaponId = '';

        return;
    }

    removeLoadout(counts: Record<string, number>): boolean {
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

    async onReloadCallback(actor: Actor5e, weapon: DndItem5e) {
        this.characterId = actor.id;
        this.weaponId = weapon.id;

        this.weaponReload();
    }

    getLoadoutCounts(currentLoadout: string[]): Record<string, number> {
        const loadout: Record<string, number> = {};
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
