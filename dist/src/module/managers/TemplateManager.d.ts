export default class TemplateManager {
    constructor();
    init(): void;
    static get paths(): {
        [key: string]: string;
    };
    static onHotReload(): void;
    toString(): string;
}
