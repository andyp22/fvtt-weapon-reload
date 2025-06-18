import FeatureManager from '../managers/FeatureManager';
import BaseFeature from './BaseFeature';

export class NextRoundFeature extends BaseFeature {
    constructor(featureManager: FeatureManager) {
        super(featureManager);
    }

    init() {
        Hooks.on('dnd5e.preUseActivity', this.onUseActivity.bind(this));
    }

    onUseActivity(activity: any) {
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
            foundry.applications as any
        ).handlebars.renderTemplate(
            'modules/fvtt-weapon-reload/templates/ammoRefundNoticeTemplate.hbs',
            {
                item: {
                    img: 'modules/fvtt-weapon-reload/assets/icons/bullets_bw_icon.png',
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
        this.moduleManager.uiManager.sendChat(
            actor,
            htmlTemplate,
            undefined,
            undefined,
            [actor.id],
            CONST.CHAT_MESSAGE_TYPES.WHISPER
        );
    }

    toString() {
        return 'class NextRoundFeature';
    }
}
