import FeatureManager from '../managers/FeatureManager';
import BaseFeature from './BaseFeature';

import {
    ActivityCardChatType,
    ChatMessage5e,
    DndItem5e,
    DndD20Roll,
    DndAttackEvent,
} from '../types';

export class ReloadableWeaponAttackFeature extends BaseFeature {
    private _nextRound: {
        id: string;
        type: string;
    };
    private _hookId: number;

    constructor(featureManager: FeatureManager) {
        super(featureManager);
        this._nextRound = { id: '', type: '' };
        this._hookId = -1;
    }

    init() {
        Hooks.on('dnd5e.postRollConfiguration', this.onUseActivity.bind(this));
    }

    onUseActivity(d20Roll: DndD20Roll[], event: DndAttackEvent) {
        const roll = d20Roll[0];
        const weaponData = roll?.data?.item;
        if (weaponData?.type?.baseItem !== 'reloadableWeapon') return;

        console.log('Weapon Reload | Triggered Attack');
        this.weaponId = event.subject.item.id;
        this.characterId = event.subject.actor.id;

        return this.reloadableWeaponAttack();
    }

    reloadableWeaponAttack() {
        const bullet = this.getNextRound();

        if (bullet.name == 'Empty') {
            this.dryfireWeapon();

            // Stop the attack if Dry firing the weapon and there are no other bullets left
            if (this.weapon.system.uses.spent == this.weapon.system.uses.max) {
                return false;
            }
        }

        if (bullet.name !== 'Empty') {
            this._nextRound = {
                id: bullet.id,
                type: bullet.type,
            };

            this._hookId = Hooks.on(
                'dnd5e.renderChatMessage',
                this.onRenderChatMessage.bind(this)
            );
        }

        return this.fireRound(bullet);
    }

    async onRenderChatMessage(message: ChatMessage5e, html: HTMLElement) {
        const itemId = message.flags.dnd5e?.item.id;
        const itemType = message.flags.dnd5e?.item.type;
        if (
            this._nextRound.id === itemId &&
            this._nextRound.type === itemType
        ) {
            Hooks.off('dnd5e.renderChatMessage', this._hookId);
            this._nextRound = { id: '', type: '' };

            const bullet = this.character.items.get(itemId) as DndItem5e;

            const activationCard = html.querySelector('.activation-card');
            const itemcard = html.querySelector('.item-card');
            const parentElement = activationCard || itemcard;

            // Grab module configurations
            const checkUnstableAmmo = game.settings.get(
                this.moduleManager.id,
                'unstableAmmo'
            ) as boolean;

            const checkMisfire = game.settings.get(
                this.moduleManager.id,
                'useMisfires'
            ) as boolean;

            const unstableAmmoFailureThreshold = game.settings.get(
                this.moduleManager.id,
                'unstableAmmoFailureThreshhold'
            ) as number;

            // Add the misfire message
            if (checkMisfire) {
                const criticalFailureMsg =
                    checkUnstableAmmo &&
                    bullet?.system.properties.find((prop: string) => {
                        return prop === 'unstable';
                    })
                        ? this.translate(
                              'WEAPON_RELOAD.Features.ReloadableWeaponAttack.MisfireUnstable',
                              { failure: `${unstableAmmoFailureThreshold}` },
                              true
                          )
                        : this.translate(
                              'WEAPON_RELOAD.Features.ReloadableWeaponAttack.MisfireNatOne'
                          );

                const cardContentElement =
                    parentElement?.querySelector('.card-content');
                const wrapperElement =
                    cardContentElement?.querySelector('.wrapper');
                wrapperElement?.insertAdjacentHTML(
                    'beforeend',
                    `<p>${criticalFailureMsg}</p>`
                );
            }

            // Add card button container if missing
            if (itemcard && !activationCard) {
                const referenceElement =
                    parentElement?.querySelector('.card-header');
                const buttonContainer = document.createElement('div');
                buttonContainer.className = 'card-buttons';
                referenceElement?.after(buttonContainer);
            }

            const cardButtonsElement =
                parentElement?.querySelector('.card-buttons');

            // Add Misfire button
            if (checkMisfire) {
                const misfireBtn = document.createElement('button');
                misfireBtn.onclick = this.onClickMisfire.bind(this);
                misfireBtn.innerHTML = `${this.makeIcon('fa-burst')}${this.translate(
                    'WEAPON_RELOAD.Features.ReloadableWeaponAttack.MisfiredBtnTxt'
                )}`;
                cardButtonsElement?.append(misfireBtn);
            }

            // Add ammo refund button
            const refundBtn = document.createElement('button');
            refundBtn.onclick = this.onClickRefund.bind(this);
            refundBtn.innerHTML = `${this.makeIcon('fa-undo')}${this.translate(
                'WEAPON_RELOAD.Features.ReloadableWeaponAttack.RefundBtnTxt'
            )}`;
            cardButtonsElement?.append(refundBtn);
        }
    }

    getNextRound(): DndItem5e {
        const character = this.character;
        const weapon = this.weapon;

        const loadout = this.loadout;
        loadout.push('Empty');
        const nextRound = loadout.shift();

        // Remove the bullet from the reloadableWeapon ammunition
        weapon.setFlag(this.moduleManager.id, 'chambered', loadout);

        const inventoryAmmunition = this.ammunition(
            character.items
        ) as DndItem5e[];
        return (
            inventoryAmmunition.find((ammo: DndItem5e) => {
                const name = ammo.name;
                if (name == nextRound) {
                    return ammo;
                }
                return null;
            }) || ({ name: 'Empty' } as DndItem5e)
        );
    }

    dryfireWeapon() {
        const character = this.character;
        const weapon = this.weapon;

        const renderHookId = Hooks.on(
            'renderChatMessage',
            (_chatItem, html) => {
                const reloadBtn = html[0].querySelector('.reload-ammo');
                reloadBtn?.addEventListener('click', () => {
                    this.reload(character, weapon);
                });

                if (reloadBtn) {
                    Hooks.off('renderChatMessage', renderHookId);
                }
            }
        );

        const templateData: ActivityCardChatType = {
            description: {
                chat: `<p>${this.translate(
                    'WEAPON_RELOAD.Features.ReloadableWeaponAttack.DryFireDescription',
                    { name: character.name, reloadableWeapon: weapon.name },
                    true
                )}</p>`,
            },
            item: {
                img: weapon.img,
                name: this.translate(
                    'WEAPON_RELOAD.Features.ReloadableWeaponAttack.DryFireTitle'
                ),
            },
            subtitle: weapon.name,
            buttons: [
                {
                    dataset: {
                        visibility: 'all',
                    },
                    icon: this.makeIcon('fa-rotate-right'),
                    label: this.translate('WEAPON_RELOAD.Features.Reload.Text'),
                    classes: 'reload-ammo',
                },
            ],
        };

        this.renderCard(templateData, character);
    }

    async renderCard(templateData: ActivityCardChatType, character: Actor5e) {
        const htmlTemplate = await (
            foundry.applications as any
        ).handlebars.renderTemplate(
            'modules/fvtt-weapon-reload/templates/activity-card.hbs',
            templateData
        );
        this.moduleManager.uiManager.sendChat(character, htmlTemplate);
    }

    fireRound(bullet: DndItem5e) {
        const reloadableWeapon = this.weapon;
        const maxShots = reloadableWeapon.system.uses.max;
        const firedLoadout =
            (reloadableWeapon.getFlag(
                this.moduleManager.id,
                'fired'
            ) as string[]) || new Array(maxShots).fill('Empty');

        firedLoadout.unshift(bullet.name);
        firedLoadout.splice(-1);
        reloadableWeapon.setFlag(this.moduleManager.id, 'fired', firedLoadout);

        if (bullet.name !== 'Empty') {
            const uses = reloadableWeapon.system.uses;
            const qty: number =
                uses.spent + 1 <= uses.max ? uses.spent + 1 : uses.max;

            reloadableWeapon.update({
                'system.uses.spent': qty,
                'system.uses.value': uses.max - qty,
            });

            bullet.use();
        }
        return true;
    }

    reload(actor: Actor5e, reloadableWeapon: DndItem5e) {
        this.featureManager
            .getFeature('reload')
            .onReloadCallback(actor, reloadableWeapon);
    }

    async onClickRefund() {
        const actor = this.character;
        const reloadableWeapon = this.weapon;
        const inventoryAmmunition = this.ammunition(actor.items);

        const fired = this.fired;
        const refund: string = fired.splice(0, 1)[0] as string;
        fired.push('Empty');

        if (refund == 'Empty') {
            // Notify the user that there is no ammunition to refund
            this.moduleManager.uiManager.uiNotification(
                this.translate(
                    'WEAPON_RELOAD.Features.ReloadableWeaponAttack.Refund.RefundNoMoreMsg',
                    {
                        name: actor.name,
                        reloadableWeapon: reloadableWeapon.name,
                    },
                    true
                ),
                'warn'
            );
            return;
        }

        await reloadableWeapon.setFlag(this.moduleManager.id, 'fired', fired);

        let bullet = { name: refund } as DndItem5e;
        inventoryAmmunition.forEach((ammo: Item5e) => {
            const name = ammo.name;
            if (name == refund) {
                bullet = ammo as DndItem5e;
            }
        });

        // Refund the non-Empty ammunition
        const ammoLoadout = this.loadout;
        ammoLoadout.unshift(refund);
        ammoLoadout.splice(-1);
        await reloadableWeapon.setFlag(
            this.moduleManager.id,
            'chambered',
            ammoLoadout
        );

        // Update the reloadableWeapon uses
        const uses = reloadableWeapon.system.uses;
        const qty: number = uses.spent - 1 >= 0 ? uses.spent - 1 : 0;
        reloadableWeapon.update({
            'system.uses.spent': qty,
            'system.uses.value': uses.max - qty,
        });

        // Notify the user that the refund was a success
        const htmlTemplate = await (
            foundry.applications as any
        ).handlebars.renderTemplate(
            'modules/fvtt-weapon-reload/templates/ammoRefundNoticeTemplate.hbs',
            {
                item: {
                    img: bullet.img,
                    name: bullet.name,
                },
                description: this.translate(
                    'WEAPON_RELOAD.Features.ReloadableWeaponAttack.Refund.RefundCompleteMsg',
                    { bullet: refund, name: reloadableWeapon.name },
                    true
                ),
                title: this.translate(
                    'WEAPON_RELOAD.Features.ReloadableWeaponAttack.Refund.RefundCompleteTitle'
                ),
            }
        );
        this.moduleManager.uiManager.sendChat(actor, htmlTemplate);
    }

    async onClickMisfire() {
        const actor = this.character;
        const roll = await new Roll('1d6').roll();
        await roll.toMessage({
            speaker: {
                alias: actor.name,
            },
        });
    }

    makeIcon(icon: string) {
        return `<i class="fas ${icon}"></i>`;
    }

    toString() {
        return 'class ReloadableWeaponAttackFeature';
    }
}
