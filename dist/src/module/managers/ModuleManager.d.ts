import FeatureManager from './FeatureManager';
import UiManager from './UiManager';
import TemplateManager from './TemplateManager';
export default class ModuleManager {
    private _moduleId;
    private _featureManager;
    private _uiManager;
    private _templateManager;
    constructor(id: string);
    get id(): string;
    get featureManager(): FeatureManager;
    get uiManager(): UiManager;
    get templateManager(): TemplateManager;
    init(): void;
    systemOverrides(): void;
    moduleConfigurations(): void;
    debug(hooks?: boolean): void;
    toString(): string;
}
