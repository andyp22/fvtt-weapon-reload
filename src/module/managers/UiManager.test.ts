import UiManager from './UiManager';
import ModuleManager from './ModuleManager';
import { jest } from '@jest/globals';

let uiManager: UiManager;

const createModuleManagerMock = (version: 13 | 14) =>
    ({
        id: 'fvtt-weapon-reload',
        get version() {
            return version;
        },
    }) as ModuleManager;

beforeEach(() => {
    jest.clearAllMocks();

    uiManager = new UiManager(createModuleManagerMock(13));
});

describe('UiManager.constructor', () => {
    test('stores moduleManager and getter returns it', () => {
        expect(uiManager.moduleManager).toBeDefined();
        expect(uiManager.moduleManager.id).toBe('fvtt-weapon-reload');
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
            window: {
                title: 'Test Title',
                contentClasses: [],
            },
            content: '<p>test</p>',
            buttons: options.buttons,
            submit: options.onSubmit,
            id: 'dialog-id',
        });

        expect(result).toBe(mockDialog);
    });

    test('uses provided contentClasses', () => {
        const mockDialog = {};

        (
            (global as any).foundry.applications.api.DialogV2 as jest.Mock
        ).mockReturnValue(mockDialog);

        const contentClasses = ['weapon-reload-dialog', 'custom-class'];

        const options = {
            title: 'Test Title',
            content: '<p>test</p>',
            contentClasses,
            buttons: [],
            onSubmit: jest.fn(),
        };

        uiManager.buildDialog(options as any, 'dialog-id');

        expect(
            (global as any).foundry.applications.api.DialogV2
        ).toHaveBeenCalledWith({
            window: {
                title: 'Test Title',
                contentClasses,
            },
            content: '<p>test</p>',
            buttons: [],
            submit: options.onSubmit,
            id: 'dialog-id',
        });
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

    test('calls ui.notifications.info for type="info"', () => {
        uiManager.uiNotification('info', 'info');

        expect((global as any).ui.notifications.info).toHaveBeenCalledWith(
            'info'
        );
    });

    test('uses info when type is omitted', () => {
        uiManager.uiNotification('implicit-default');

        expect((global as any).ui.notifications.info).toHaveBeenCalledWith(
            'implicit-default'
        );
    });

    test('uses info for an unknown notification type', () => {
        uiManager.uiNotification('unknown', 'something-else');

        expect((global as any).ui.notifications.info).toHaveBeenCalledWith(
            'unknown'
        );
    });

    test('does nothing if ui.notifications is undefined', () => {
        (globalThis as any).ui = {};

        expect(() => uiManager.uiNotification('test')).not.toThrow();
    });
});

describe('UiManager.sendChat()', () => {
    const actor = { name: 'Hero' } as any;

    test('includes type for Foundry v13', () => {
        uiManager = new UiManager(createModuleManagerMock(13));

        uiManager.sendChat(actor, '<p>Hello world</p>');

        expect((global as any).ChatMessage.getSpeaker).toHaveBeenCalledWith({
            actor,
        });

        expect((global as any).ChatMessage.create).toHaveBeenCalledWith({
            speaker: { alias: 'Speaker' },
            content: '<p>Hello world</p>',
            whisper: [],
            type: 0,
        });
    });

    test('does not include type for Foundry v14', () => {
        uiManager = new UiManager(createModuleManagerMock(14));

        uiManager.sendChat(actor, '<p>Hello world</p>');

        expect((global as any).ChatMessage.create).toHaveBeenCalledWith({
            speaker: { alias: 'Speaker' },
            content: '<p>Hello world</p>',
            whisper: [],
        });
    });

    test('includes flavor when provided', () => {
        uiManager = new UiManager(createModuleManagerMock(14));

        uiManager.sendChat(actor, '<p>Hello world</p>', 'Weapon Reload');

        expect((global as any).ChatMessage.create).toHaveBeenCalledWith({
            speaker: { alias: 'Speaker' },
            content: '<p>Hello world</p>',
            flavor: 'Weapon Reload',
            whisper: [],
        });
    });

    test('includes sound when provided', () => {
        uiManager = new UiManager(createModuleManagerMock(14));

        uiManager.sendChat(
            actor,
            '<p>Hello world</p>',
            undefined,
            'sounds/weapon.wav'
        );

        expect((global as any).ChatMessage.create).toHaveBeenCalledWith({
            speaker: { alias: 'Speaker' },
            content: '<p>Hello world</p>',
            sound: 'sounds/weapon.wav',
            whisper: [],
        });
    });

    test('includes flavor and sound when provided', () => {
        uiManager = new UiManager(createModuleManagerMock(14));

        uiManager.sendChat(
            actor,
            '<p>Hello world</p>',
            'Weapon Reload',
            'sounds/weapon.wav'
        );

        expect((global as any).ChatMessage.create).toHaveBeenCalledWith({
            speaker: { alias: 'Speaker' },
            content: '<p>Hello world</p>',
            flavor: 'Weapon Reload',
            sound: 'sounds/weapon.wav',
            whisper: [],
        });
    });

    test('uses provided whisper recipients', () => {
        uiManager = new UiManager(createModuleManagerMock(14));

        const whisper = ['user-1', 'user-2'];

        uiManager.sendChat(
            actor,
            '<p>Secret message</p>',
            undefined,
            undefined,
            whisper
        );

        expect((global as any).ChatMessage.create).toHaveBeenCalledWith({
            speaker: { alias: 'Speaker' },
            content: '<p>Secret message</p>',
            whisper,
        });
    });

    test('uses provided type for Foundry v13', () => {
        uiManager = new UiManager(createModuleManagerMock(13));

        uiManager.sendChat(
            actor,
            '<p>Message</p>',
            undefined,
            undefined,
            [],
            3
        );

        expect((global as any).ChatMessage.create).toHaveBeenCalledWith({
            speaker: { alias: 'Speaker' },
            content: '<p>Message</p>',
            whisper: [],
            type: 3,
        });
    });

    test('ignores provided type for Foundry v14', () => {
        uiManager = new UiManager(createModuleManagerMock(14));

        uiManager.sendChat(
            actor,
            '<p>Message</p>',
            undefined,
            undefined,
            [],
            3
        );

        expect((global as any).ChatMessage.create).toHaveBeenCalledWith({
            speaker: { alias: 'Speaker' },
            content: '<p>Message</p>',
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

    test('passes options to game.i18n.localize', () => {
        const options = { x: '1' };

        const result = uiManager.getLocalizedTxt('KEY', options);

        expect((global as any).game.i18n.localize).toHaveBeenCalledWith(
            'KEY',
            options
        );

        expect(result).toBe('localized:KEY');
    });

    test('calls game.i18n.format when format=true', () => {
        const options = { x: '1' };
        const format = (global as any).game.i18n.format;

        const result = uiManager.getLocalizedTxt('KEY', options, true);

        expect(format).toHaveBeenCalledWith('KEY', options);
        expect(result).toBe(format.mock.results[0].value);
    });

    test('does not call localize when format=true', () => {
        uiManager.getLocalizedTxt('KEY', { x: '1' }, true);

        expect((global as any).game.i18n.localize).not.toHaveBeenCalled();
    });
});

describe('UiManager.toString()', () => {
    test('returns class identifier', () => {
        expect(uiManager.toString()).toBe('class UiManager');
    });
});
