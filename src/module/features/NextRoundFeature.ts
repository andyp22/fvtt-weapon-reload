import { type foundryApplications, UtilityActivity } from '../types';
import BaseFeature from './BaseFeature';

export class NextRoundFeature extends BaseFeature {
    init() {
        Hooks.on('dnd5e.preUseActivity', this.onUseActivity.bind(this));
    }

    onUseActivity(activity: UtilityActivity) {
        if (activity.type === 'utility' && activity.name == 'Next Round') {
            console.log('Weapon Reload | Triggered Next Round');

            this.characterId = activity.actor.id;
            this.weaponId = activity.item.id;
            this.nextRound();
            return false;
        }
        return true;
    }

    async nextRound() {
        const nextRound = this.loadout[0];
        const actor = this.character;

        // Notify the user what the next round is
        const htmlTemplate = await (
            foundry.applications as foundryApplications
        ).handlebars.renderTemplate(
            'modules/fvtt-weapon-reload/templates/ammoRefundNoticeTemplate.hbs',
            {
                item: {
                    img: 'systems/dnd5e/icons/svg/damage/piercing.svg',
                    name: nextRound,
                },
                description: this.translate(
                    'WEAPON_RELOAD.Features.NextRound.Description',
                    { bullet: nextRound, weapon: this.weapon.name },
                    true
                ),
                title: this.translate('WEAPON_RELOAD.Features.NextRound.Title'),
            }
        );
        const chatType = this.moduleManager.version === 13 ? 4 : 0;
        this.moduleManager.uiManager.sendChat(
            actor,
            htmlTemplate,
            undefined,
            undefined,
            [actor.id],
            chatType
        );
    }

    toString() {
        return 'class NextRoundFeature';
    }
}
