export default class TemplateManager {
    init(): void;
    static get paths(): Record<string, string>;
    static onHotReload(): void;
    toString(): string;
}
