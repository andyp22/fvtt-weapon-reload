import ModuleManager from './ModuleManager';
export default class FeatureManager {
    private _moduleManager;
    private _features;
    constructor(moduleManager: ModuleManager);
    init(): void;
    getFeature(id: string): any;
    get moduleManager(): ModuleManager;
    toString(): string;
}
