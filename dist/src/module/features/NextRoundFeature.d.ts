import { UtilityActivity } from '../types';
import BaseFeature from './BaseFeature';
export declare class NextRoundFeature extends BaseFeature {
    init(): void;
    onUseActivity(activity: UtilityActivity): boolean;
    nextRound(): Promise<void>;
    toString(): string;
}
