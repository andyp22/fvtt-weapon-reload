import { foundryApplications } from '../types';

export default class TemplateManager {
    init() {
        (foundry.applications as foundryApplications).handlebars.loadTemplates(
            TemplateManager.paths
        );
    }

    static get paths(): Record<string, string> {
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
                Reflect.deleteProperty(_templateCache, template);
            }
        }

        (foundry.applications as foundryApplications).handlebars
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
