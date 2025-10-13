import FeatureManager from '../managers/FeatureManager';
import BaseFeature from './BaseFeature';
export declare class NextRoundFeature extends BaseFeature {
    constructor(featureManager: FeatureManager);
    init(): void;
    onUseActivity(activity: any): boolean;
    nextRound(): Promise<void>;
    toString(): string;
}
