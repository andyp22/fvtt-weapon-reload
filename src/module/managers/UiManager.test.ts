import UiManager from './UiManager';
import ModuleManager from './ModuleManager';
import { jest } from '@jest/globals';

let uiManager: UiManager;
let moduleManager: ModuleManager;

beforeEach(() => {
    jest.clearAllMocks();

    moduleManager = { id: 'fvtt-weapon-reload' } as any as ModuleManager;
    uiManager = new UiManager(moduleManager);
});

describe('UiManager.constructor', () => {
    test('stores moduleManager and getter returns it', () => {
        expect(uiManager.moduleManager).toBe(moduleManager);
    });
});

describe('UiManager.buildDialog()', () => {
    test('constructs DialogV2 with expected parameters', () => {
        const mockDialog = {};
        (
            (global as any).foundry.applications.api.DialogV2 as jest.Mock
        ).mockReturnValue(mockDialog);

        const options = {
            title: 'Test Title',
            content: '<p>test</p>',
            buttons: [{ label: 'OK', action: 'ok' }],
            onSubmit: jest.fn(),
        };

        const result = uiManager.buildDialog(options as any, 'dialog-id');

        expect(
            (global as any).foundry.applications.api.DialogV2
        ).toHaveBeenCalledWith({
            window: { title: 'Test Title', contentClasses: [] },
            content: '<p>test</p>',
            buttons: options.buttons,
            submit: options.onSubmit,
            id: 'dialog-id',
        });
        expect(result).toBe(mockDialog);
    });
});

describe('UiManager.uiNotification()', () => {
    test('calls ui.notifications.error for type="error"', () => {
        uiManager.uiNotification('bad', 'error');
        expect((global as any).ui.notifications.error).toHaveBeenCalledWith(
            'bad'
        );
    });

    test('calls ui.notifications.warn for type="warn"', () => {
        uiManager.uiNotification('warned', 'warn');
        expect((global as any).ui.notifications.warn).toHaveBeenCalledWith(
            'warned'
        );
    });

    test('calls ui.notifications.info for type="info" or default', () => {
        uiManager.uiNotification('info');
        expect((global as any).ui.notifications.info).toHaveBeenCalledWith(
            'info'
        );

        uiManager.uiNotification('implicit-default');
        expect((global as any).ui.notifications.info).toHaveBeenCalledWith(
            'implicit-default'
        );
    });

    test('does nothing if ui.notifications is undefined', () => {
        (globalThis as any).ui = {};
        expect(() => uiManager.uiNotification('test')).not.toThrow();
    });
});

describe('UiManager.sendChat()', () => {
    test('creates a ChatMessage with correct data', () => {
        const actor = { name: 'Hero' } as any;
        const content = '<p>Hello world</p>';

        uiManager.sendChat(actor, content);

        expect((global as any).ChatMessage.getSpeaker).toHaveBeenCalledWith({
            actor,
        });
        expect((global as any).ChatMessage.create).toHaveBeenCalledWith({
            speaker: { alias: 'Speaker' },
            content,
            whisper: [],
        });
    });
});

describe('UiManager.getLocalizedTxt()', () => {
    test('calls game.i18n.localize by default', () => {
        const result = uiManager.getLocalizedTxt('KEY');
        expect((global as any).game.i18n.localize).toHaveBeenCalledWith(
            'KEY',
            undefined
        );
        expect(result).toBe('localized:KEY');
    });

    test('calls game.i18n.format when format=true', () => {
        const result = uiManager.getLocalizedTxt('KEY', { x: '1' }, true);
        expect((global as any).game.i18n.format).toHaveBeenCalledWith('KEY', {
            x: '1',
        });
        expect(result).toContain('formatted:KEY');
    });
});

describe('UiManager.toString()', () => {
    test('returns class identifier', () => {
        expect(uiManager.toString()).toMatchInlineSnapshot(`"class UiManager"`);
    });
});
