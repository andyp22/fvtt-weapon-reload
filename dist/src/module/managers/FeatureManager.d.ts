import ModuleManager from './ModuleManager';
import BaseFeature from '../features/BaseFeature';
export default class FeatureManager {
    private _moduleManager;
    private _features;
    constructor(moduleManager: ModuleManager);
    init(): void;
    getFeature(id: string): BaseFeature | null;
    get moduleManager(): ModuleManager;
    toString(): string;
}
