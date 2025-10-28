import { ReloadFeature } from './ReloadFeature';
import { moduleMocks } from '../../../tests/mocks/module-mocks';
import { jest } from '@jest/globals';
import { DndItem5e, UtilityActivity } from '../types';

let feature: ReloadFeature;

beforeEach(() => {
    jest.clearAllMocks();
    feature = new ReloadFeature(moduleMocks.MockFeatureManager as any);
});

describe('ReloadFeature.init()', () => {
    test('registers preUseActivity hook', () => {
        feature.init();
        expect((global as any).Hooks.on).toHaveBeenCalledWith(
            'dnd5e.preUseActivity',
            expect.any(Function)
        );
    });
});

describe('ReloadFeature.onUseActivity()', () => {
    test('returns true for non-reload activity', () => {
        const result = feature.onUseActivity({
            type: 'attack',
            name: 'Shoot',
            actor: { id: 'a1' },
            item: { id: 'w1' },
        } as unknown as UtilityActivity);
        expect(result).toBe(true);
    });

    test('logs and triggers weaponReload for Reload activity', () => {
        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        const reloadSpy = jest
            .spyOn(feature, 'weaponReload')
            .mockReturnValue(undefined as any);

        const result = feature.onUseActivity({
            type: 'utility',
            name: 'Reload',
            actor: { id: 'a1' },
            item: { id: 'w1' },
        } as unknown as UtilityActivity);

        expect(logSpy).toHaveBeenCalledWith('Weapon Reload | Triggered Reload');
        expect(feature.characterId).toBe('a1');
        expect(feature.weaponId).toBe('w1');
        expect(reloadSpy).toHaveBeenCalled();
        expect(result).toBe(false);

        logSpy.mockRestore();
    });
});

describe('ReloadFeature.getLoadoutCounts()', () => {
    test('tallies duplicates correctly', () => {
        const counts = feature.getLoadoutCounts(['A', 'B', 'A', 'Empty']);
        expect(counts).toEqual({ A: 2, B: 1, Empty: 1 });
    });
});

describe('ReloadFeature.refundChamberedAmmo()', () => {
    test('increments matching ammo quantities', () => {
        const mockAmmo = {
            name: 'Bullet',
            system: { quantity: 3, equipped: false },
            update: jest.fn(),
        } as any;

        jest.spyOn(feature, 'loadout', 'get').mockReturnValue([
            'Bullet',
            'Bullet',
        ]);
        const result = feature.refundChamberedAmmo([mockAmmo]);

        expect(result[0].count).toBe(5); // 3 + 2 returned
        expect(mockAmmo.update).toHaveBeenCalledWith({ 'system.quantity': 5 });
    });
});

describe('ReloadFeature.weaponReload()', () => {
    test('builds ammo list and filters by equipped when setting enabled', () => {
        jest.spyOn(game.settings, 'get').mockReturnValue(true);
        const mockAmmo = [
            { name: 'A', system: { quantity: 2, equipped: true } },
            { name: 'B', system: { quantity: 0, equipped: false } },
        ] as any;
        jest.spyOn(feature, 'character', 'get').mockReturnValue({
            items: mockAmmo,
        } as any);
        jest.spyOn(feature, 'loadout', 'get').mockReturnValue(['Empty']);
        jest.spyOn(feature, 'refundChamberedAmmo').mockReturnValue([
            { name: 'A', value: 'A', count: 2, equipped: true },
            { name: 'B', value: 'B', count: 0, equipped: false },
        ]);
        const chooseSpy = jest
            .spyOn(feature, 'chooseAmmunition')
            .mockReturnValue(undefined as any);

        feature.weaponReload(true);
        expect(chooseSpy).toHaveBeenCalledWith(
            [{ name: 'A', value: 'A', count: 2, equipped: true }],
            ['Empty']
        );
    });
});

describe('ReloadFeature.chooseAmmunition()', () => {
    test('renders template, builds dialog, and registers close hook', async () => {
        const renderSpy = jest
            .spyOn(
                (global as any).foundry.applications.handlebars,
                'renderTemplate'
            )
            .mockResolvedValue('<dialog>mock</dialog>');

        const buildSpy = jest
            .spyOn(moduleMocks.MockUiManager, 'buildDialog')
            .mockReturnValue({
                render: jest.fn(),
            } as any);

        jest.spyOn(feature, 'weapon', 'get').mockReturnValue({
            system: { uses: { max: 6 } },
        } as any);
        const ammoOpts = [{ name: 'A', count: 2, equipped: true }] as any;

        await feature.chooseAmmunition(ammoOpts, ['Empty']);

        expect(renderSpy).toHaveBeenCalled();
        expect((global as any).Hooks.on).toHaveBeenCalledWith(
            'closeDialogV2',
            expect.any(Function)
        );
        expect(buildSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                title: expect.stringContaining(
                    'WEAPON_RELOAD.Features.Reload.Ammunition.ChoiceDialogTitle'
                ),
            }),
            'ammo-choice-dialog'
        );
    });
});

describe('ReloadFeature.onCloseChoiceDialog()', () => {
    test('removes hook and triggers reloadReloadableWeapon if dialog still flagged', () => {
        const offSpy = jest
            .spyOn((global as any).Hooks, 'off')
            .mockImplementation(() => {});
        const reloadSpy = jest
            .spyOn(feature, 'reloadReloadableWeapon')
            .mockResolvedValue(undefined);
        feature['_handleChoiceDialogClose'] = true;
        feature['_hookId'] = 123;

        feature.onCloseChoiceDialog(['A', 'B']);
        expect(offSpy).toHaveBeenCalledWith('closeDialogV2', 123);
        expect(reloadSpy).toHaveBeenCalledWith(['A', 'B'], true);
        expect(feature['_handleChoiceDialogClose']).toBe(false);
    });
});

describe('ReloadFeature.removeLoadout()', () => {
    test('warns and returns false if ammo below zero', () => {
        const uiNotify = moduleMocks.MockUiManager.uiNotification;
        const mockAmmo = [
            { name: 'A', system: { quantity: 1 } },
        ] as DndItem5e[];
        jest.spyOn(feature, 'character', 'get').mockReturnValue({
            items: mockAmmo,
        } as any);
        const ammoSpy = jest
            .spyOn(feature, 'ammunition')
            .mockReturnValue(mockAmmo);
        const result = feature.removeLoadout({ A: 2 });
        expect(ammoSpy).toHaveBeenCalled();
        expect(result).toBe(false);
        expect(uiNotify).toHaveBeenCalled();
    });

    test('updates ammo quantities when available', async () => {
        const mockAmmo = [
            { name: 'A', system: { quantity: 5 }, update: jest.fn() },
        ] as any;
        jest.spyOn(feature, 'character', 'get').mockReturnValue({
            items: mockAmmo,
        } as any);
        const ammoSpy = jest
            .spyOn(feature, 'ammunition')
            .mockReturnValue(mockAmmo);
        const result = feature.removeLoadout({ A: 2 });
        expect(ammoSpy).toHaveBeenCalled();
        expect(result).toBe(true);
        expect(mockAmmo[0].update).toHaveBeenCalledWith({
            'system.quantity': 3,
        });
    });
});

describe('ReloadFeature.buildReloadChat()', () => {
    test('renders correct template with localized fields', async () => {
        const renderSpy = jest
            .spyOn(
                (global as any).foundry.applications.handlebars,
                'renderTemplate'
            )
            .mockResolvedValue('<chat>reload</chat>');
        const weapon = { img: 'img', name: 'Gun' } as any;

        const result = await feature.buildReloadChat(weapon, false, ['A']);
        expect(renderSpy).toHaveBeenCalledWith(
            'modules/fvtt-weapon-reload/templates/reloadableWeaponReloadTemplate.hbs',
            expect.objectContaining({
                item: { img: 'img', name: 'Gun' },
                loadout: ['A'],
            })
        );
        expect(result).toBe('<chat>reload</chat>');
    });
});

describe('ReloadFeature.reloadReloadableWeapon()', () => {
    test('updates flags and sends chat', async () => {
        const weapon = {
            system: { uses: { max: 6 } },
            update: jest.fn(),
            setFlag: jest.fn(),
        } as any;
        const actor = { id: 'actor1' } as any;
        jest.spyOn(feature, 'weapon', 'get').mockReturnValue(weapon);
        jest.spyOn(feature, 'character', 'get').mockReturnValue(actor);
        jest.spyOn(feature, 'getLoadoutCounts').mockReturnValue({ Empty: 3 });
        jest.spyOn(feature, 'removeLoadout').mockReturnValue(true);
        jest.spyOn(feature, 'buildReloadChat').mockResolvedValue(
            '<html>chat</html>'
        );
        const sendSpy = moduleMocks.MockUiManager.sendChat;

        await feature.reloadReloadableWeapon(['Empty'], false);

        expect(weapon.update).toHaveBeenCalled();
        expect(weapon.setFlag).toHaveBeenCalledTimes(2);
        expect(sendSpy).toHaveBeenCalledWith(actor, '<html>chat</html>');
        expect(feature.characterId).toBe('');
        expect(feature.weaponId).toBe('');
    });
});

describe('ReloadFeature.onReloadCallback()', () => {
    test('sets ids and calls weaponReload', () => {
        const reloadSpy = jest
            .spyOn(feature, 'weaponReload')
            .mockReturnValue(undefined as any);
        const actor = { id: 'a' } as any;
        const weapon = { id: 'w' } as any;
        feature.onReloadCallback(actor, weapon);
        expect(feature.characterId).toBe('a');
        expect(feature.weaponId).toBe('w');
        expect(reloadSpy).toHaveBeenCalled();
    });
});

describe('ReloadFeature.toString()', () => {
    test('returns correct string', () => {
        expect(feature.toString()).toMatchInlineSnapshot(
            `"class ReloadFeature"`
        );
    });
});
