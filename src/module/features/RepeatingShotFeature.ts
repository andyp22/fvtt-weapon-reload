import FeatureManager from '../managers/FeatureManager';
import { DndAttackEvent, DndD20Roll, DndItem5e } from '../types';
import BaseFeature from './BaseFeature';

export class RepeatingShotFeature extends BaseFeature {
    private _ammo: DndItem5e;

    constructor(featureManager: FeatureManager) {
        super(featureManager);
        this._ammo = {} as DndItem5e;
    }

    init() {
        Hooks.on('dnd5e.postRollConfiguration', this.onUseActivity.bind(this));
    }

    onUseActivity(d20Roll: DndD20Roll[], event: DndAttackEvent) {
        if (
            !event.hookNames.includes('attack') ||
            event.subject.name !== 'Repeating Shot'
        )
            return;

        const roll = d20Roll[0];
        const weaponData = roll?.data?.item;
        if (weaponData?.type?.baseItem !== 'reloadableWeapon') return;

        console.log('Weapon Reload | Triggered Repeating Shot');
        this.weaponId = event.subject.item.id;
        this.characterId = event.subject.actor.id;

        return this.fireRound();
    }

    async fireRound() {
        await this.loadAmmo();
        if (!this._ammo) return false;
        this._ammo.use();
        return true;
    }

    findAmmo(name: string): DndItem5e {
        const ammo = this.character.items.filter((item: Item5e) => {
            const gameSystem = (item as DndItem5e).system;

            return (
                item.type == 'consumable' &&
                gameSystem.type.subtype == 'firearmBullet' &&
                item.name == name
            );
        });

        return ammo[0] as DndItem5e;
    }

    hasAmmo(name: string): boolean {
        const ammo = this.character.items.filter((item: Item5e) => {
            const gameSystem = (item as DndItem5e).system;

            return (
                item.type == 'consumable' &&
                gameSystem.type.subtype == 'firearmBullet' &&
                item.name == name
            );
        });

        if (ammo.length > 0) return true;

        return false;
    }

    async loadAmmo() {
        const repeater_round_uuid = game.settings.get(
            this.moduleManager.id,
            'repeaterRoundUUID'
        ) as string;
        const compendiumAmmo = (await fromUuid(
            repeater_round_uuid
        )) as unknown as DndItem5e;

        if (!this.hasAmmo(compendiumAmmo.name)) {
            await this.character.createEmbeddedDocuments('Item', [
                compendiumAmmo.toObject(),
            ]);
        }

        this._ammo = this.findAmmo(compendiumAmmo.name);
    }

    toString() {
        return 'class RepeatingShotFeature';
    }
}
