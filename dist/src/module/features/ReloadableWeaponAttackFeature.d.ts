import FeatureManager from '../managers/FeatureManager';
import BaseFeature from './BaseFeature';
import { ActivityCardChatType, ChatMessage5e, DndItem5e, DndD20Roll, DndAttackEvent } from '../types';
export declare class ReloadableWeaponAttackFeature extends BaseFeature {
    private _nextRound;
    private _hookId;
    constructor(featureManager: FeatureManager);
    init(): void;
    onUseActivity(d20Roll: DndD20Roll[], event: DndAttackEvent): boolean | undefined;
    reloadableWeaponAttack(): boolean;
    onRenderChatMessage(message: ChatMessage5e, html: HTMLElement): Promise<void>;
    getNextRound(): DndItem5e;
    dryfireWeapon(): void;
    renderCard(templateData: ActivityCardChatType, character: Actor5e): Promise<void>;
    fireRound(bullet: DndItem5e): boolean;
    reload(actor: Actor5e, reloadableWeapon: DndItem5e): void;
    onClickRefund(): Promise<void>;
    onClickMisfire(): Promise<void>;
    makeIcon(icon: string): string;
    toString(): string;
}
