export default class TemplateManager {
    constructor() {}

    init() {
        (foundry.applications as any).handlebars.loadTemplates(
            TemplateManager.paths
        );
    }

    static get paths() {
        const paths: Record<string, string> = {};
        const templatePaths = '__ALL_TEMPLATES__'.split(',');
        for (const path of templatePaths) {
            paths[path.replace('.hbs', '.html')] = path;
        }
        return paths;
    }

    static onHotReload() {
        for (const template in _templateCache) {
            if (
                Object.prototype.hasOwnProperty.call(_templateCache, template)
            ) {
                delete _templateCache[template];
            }
        }

        (foundry.applications as any).handlebars
            .loadTemplates(this.paths)
            .then(() => {
                for (const application in ui.windows) {
                    if (
                        Object.prototype.hasOwnProperty.call(
                            ui.windows,
                            application
                        )
                    ) {
                        ui.windows[application].render(true);
                    }
                }
            });
    }

    toString() {
        return 'class TemplateManager';
    }
}
