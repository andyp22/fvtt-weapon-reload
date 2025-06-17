import FeatureManager from '../managers/FeatureManager';

import {
    DndActor5e,
    DndItem5e,
    DndD20Roll,
    DndAttackEvent,
} from '../types/dnd.types';

import { ActivityCardChatType } from '../types/chat.types';
import BaseFeature from './BaseFeature';

export class FirearmAttackFeature extends BaseFeature {
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

    async onUseActivity(d20Roll: DndD20Roll[], event: DndAttackEvent) {
        const roll = d20Roll[0];
        const weaponData = roll?.data?.item;
        if (weaponData?.type?.baseItem !== 'firearm') return;

        console.log('Weapon Reload | Triggered Firearm Attack');
        this.weaponId = event.subject.item.id;
        this.characterId = event.subject.actor.id;

        return await this.firearmAttack();
    }

    async firearmAttack() {
        const bullet = await this.getNextBullet();

        if (bullet.name == this.EMPTY) {
            await this.dryfireWeapon();

            // Stop the attack if Dryfiring the weapon
            return false;
        }

        this._nextRound = {
            id: bullet.id,
            type: bullet.type,
        };

        this._hookId = Hooks.on(
            'dnd5e.renderChatMessage',
            this.onRenderChatMessage.bind(this)
        );

        return await this.fireBullet(bullet);
    }

    async onRenderChatMessage(message, html) {
        const itemId = message.flags.dnd5e?.item.id;
        const itemType = message.flags.dnd5e?.item.type;
        if (
            this._nextRound.id === itemId &&
            this._nextRound.type === itemType
        ) {
            Hooks.off('dnd5e.renderChatMessage', this._hookId);
            this._nextRound = { id: '', type: '' };

            const activationCard = html.querySelector('.activation-card');
            const itemcard = html.querySelector('.item-card');
            const parentElement = activationCard || itemcard;

            // Unstable ammo message
            const checkUnstableAmmo = game.settings.get(
                this.moduleManager.id,
                'unstableAmmo'
            ) as boolean;

            const bullet = this.character.items.get(itemId) as DndItem5e;
            const criticalFailureMsg =
                checkUnstableAmmo &&
                bullet?.system.properties.find((prop: string) => {
                    return prop === 'unstable';
                })
                    ? this.translate(
                          'WEAPON_RELOAD.Features.FirearmAttack.MisfireUnstable'
                      )
                    : this.translate(
                          'WEAPON_RELOAD.Features.FirearmAttack.MisfireNatOne'
                      );

            const cardContentElement =
                parentElement.querySelector('.card-content');
            const wrapperElement = cardContentElement.querySelector('.wrapper');
            wrapperElement.insertAdjacentHTML(
                'beforeend',
                `<p>${criticalFailureMsg}</p>`
            );

            // Add Misfire and ammo refund buttons
            if (itemcard && !activationCard) {
                const referenceElement =
                    parentElement.querySelector('.card-header');
                const buttonContainer = document.createElement('div');
                buttonContainer.className = 'card-buttons';
                referenceElement.after(buttonContainer);
            }

            const cardButtonsElement =
                parentElement.querySelector('.card-buttons');

            const misfireBtn = document.createElement('button');
            misfireBtn.onclick = this.onClickMisfire.bind(this);
            misfireBtn.innerHTML = `${this.makeIcon('fa-burst')}${this.translate(
                'EBERRON_WEST.features.firearmAttack.misfiredBtnTxt'
            )}`;
            cardButtonsElement.append(misfireBtn);

            const refundBtn = document.createElement('button');
            refundBtn.onclick = this.onClickRefund.bind(this);
            refundBtn.innerHTML = `${this.makeIcon('fa-undo')}${this.translate(
                'EBERRON_WEST.features.firearmAttack.refundBtnTxt'
            )}`;
            cardButtonsElement.append(refundBtn);
        }
    }

    async getNextBullet(): Promise<DndItem5e> {
        const character = this.character;
        const weapon = this.weapon;

        const loadout = this.loadout;
        loadout.push(this.EMPTY);
        const nextBullet = loadout.shift();

        // Remove the bullet from the firearm ammunition
        await weapon.setFlag(this.moduleManager.id, 'chambered', loadout);

        const inventoryAmmunition = this.ammunition(
            character.items
        ) as DndItem5e[];
        return (
            inventoryAmmunition.find((ammo: DndItem5e) => {
                const name = ammo.name;
                if (name == nextBullet) {
                    return ammo;
                }
                return null;
            }) || ({ name: this.EMPTY } as DndItem5e)
        );
    }

    async dryfireWeapon() {
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
                    'WEAPON_RELOAD.Features.FirearmAttack.DryFireDescription',
                    { name: character.name, firearm: weapon.name },
                    true
                )}</p>`,
            },
            item: {
                img: weapon.img,
                name: this.translate(
                    'WEAPON_RELOAD.Features.FirearmAttack.DryFireTitle'
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

        const htmlTemplate = await (
            foundry.applications as any
        ).handlebars.renderTemplate(
            'modules/foundry-vtt-eberron-west-module/templates/overrides/activity-card.hbs',
            templateData
        );
        this.moduleManager.uiManager.sendChat(character, htmlTemplate);
    }

    async fireBullet(bullet: DndItem5e) {
        const firearm = this.weapon;
        const maxShots = parseInt(firearm.system.uses.max);
        const firedLoadout =
            (firearm.getFlag(this.moduleManager.id, 'fired') as string[]) ||
            new Array(maxShots).fill(this.EMPTY);

        firedLoadout.unshift(bullet.name);
        firedLoadout.splice(-1);
        await firearm.setFlag(this.moduleManager.id, 'fired', firedLoadout);

        const uses = firearm.system.uses;
        const qty: number =
            uses.spent + 1 <= parseInt(uses.max)
                ? uses.spent + 1
                : parseInt(uses.max);

        await firearm.update({
            'system.uses.spent': qty,
            'system.uses.value': parseInt(uses.max) - qty,
        });

        return bullet.use();
    }

    reload(actor: DndActor5e, firearm: DndItem5e) {
        this.featureManager
            .getFeature('reload')
            .onReloadCallback(actor, firearm);
    }

    async onClickRefund() {
        const actor = this.character;
        const firearm = this.weapon;
        const inventoryAmmunition = this.ammunition(actor.items);

        const fired = this.fired;
        const refund: string = fired.splice(0, 1)[0] as string;
        fired.push(this.EMPTY);

        if (refund == this.EMPTY) {
            // Notify the user that there is no ammunition to refund
            this.moduleManager.uiManager.uiNotification(
                this.translate(
                    'WEAPON_RELOAD.Features.FirearmAttack.Refund.RefundNoMoreMsg',
                    { name: actor.name, firearm: firearm.name },
                    true
                ),
                'warn'
            );
            return;
        }

        await firearm.setFlag(this.moduleManager.id, 'fired', fired);

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
        await firearm.setFlag(this.moduleManager.id, 'chambered', ammoLoadout);

        // Update the firearm uses
        const uses = firearm.system.uses;
        const qty: number = uses.spent - 1 >= 0 ? uses.spent - 1 : 0;
        firearm.update({
            'system.uses.spent': qty,
            'system.uses.value': parseInt(uses.max) - qty,
        });

        // Notify the user that the refund was a success
        const htmlTemplate = await (
            foundry.applications as any
        ).handlebars.renderTemplate(
            'modules/foundry-vtt-eberron-west-module/templates/ammoRefundNoticeTemplate.hbs',
            {
                item: {
                    img: bullet.img,
                    name: bullet.name,
                },
                description: this.translate(
                    'WEAPON_RELOAD.Features.FirearmAttack.Refund.RefundCompleteMsg',
                    { bullet: refund, name: firearm.name },
                    true
                ),
                title: this.translate(
                    'WEAPON_RELOAD.Features.FirearmAttack.Refund.RefundCompleteTitle'
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
        return 'class FirearmAttackFeature';
    }
}
