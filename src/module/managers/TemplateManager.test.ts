import TemplateManager from './TemplateManager';
import { jest } from '@jest/globals';

let loadTemplatesMock: jest.Mock;

beforeEach(() => {
    jest.clearAllMocks();
    loadTemplatesMock = jest.fn();

    global.foundry = {
        applications: {
            handlebars: {
                loadTemplates: loadTemplatesMock,
            },
        },
    } as any;
});

describe('TemplateManager.init()', () => {
    test('calls handlebars.loadTemplates with TemplateManager.paths', () => {
        const manager = new TemplateManager();
        const spy = jest.spyOn(TemplateManager, 'paths', 'get');
        manager.init();
        expect(loadTemplatesMock).toHaveBeenCalledWith(TemplateManager.paths);
        expect(spy).toHaveBeenCalled();
    });
});

describe('TemplateManager.paths', () => {
    test('maps all .hbs templates to .html keys', () => {
        // Temporarily override String.prototype.split is messy — instead, just mock the property
        const originalSplit = String.prototype.split;
        (String.prototype as any).split = function (this: string, sep: any) {
            if (this === '__ALL_TEMPLATES__') return ['one.hbs', 'two.hbs'];
            return originalSplit.call(this, sep);
        };

        const result = TemplateManager.paths;

        // Restore afterwards
        (String.prototype as any).split = originalSplit;

        expect(result).toEqual({
            'one.html': 'one.hbs',
            'two.html': 'two.hbs',
        });

        (String.prototype.split as any).mockRestore?.();
    });
});

describe('TemplateManager.toString()', () => {
    test('returns class identifier', () => {
        const manager = new TemplateManager();
        expect(manager.toString()).toMatchInlineSnapshot(
            `"class TemplateManager"`
        );
    });
});
