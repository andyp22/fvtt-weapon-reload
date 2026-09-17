import { ReloadableWeaponCreationFeature } from './ReloadableWeaponCreationFeature';
import { moduleMocks, MODULE_ID } from '../../../tests/mocks/module-mocks';
import { jest } from '@jest/globals';

let feature: ReloadableWeaponCreationFeature;

beforeEach(() => {
    jest.clearAllMocks();
    feature = new ReloadableWeaponCreationFeature(
        moduleMocks.MockFeatureManager as any
    );
});

describe('ReloadableWeaponCreationFeature.init()', () => {
    test('registers preCreateItem hook', () => {
        feature.init();
        expect((global as any).Hooks.on).toHaveBeenCalledWith(
            'preCreateItem',
            expect.any(Function)
        );
    });
});

describe('ReloadableWeaponCreationFeature.onPreCreateItem()', () => {
    test('does nothing if item.baseItem is not reloadableWeapon', async () => {
        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        const item = { system: { type: { baseItem: 'sword' } } } as any;
        await feature.onPreCreateItem(item);

        expect(logSpy).not.toHaveBeenCalled();
        expect(feature['_creatingReloadableWeapon']).toBe(false);
        logSpy.mockRestore();
    });

    test('sets up creation tracking and hook when reloadableWeapon', async () => {
        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        const mockHookId = 42;
        jest.spyOn((global as any).Hooks, 'on').mockReturnValue(mockHookId);

        const item = {
            id: 'item123',
            actor: { id: 'actor123' },
            system: { type: { baseItem: 'reloadableWeapon' } },
        } as any;

        await feature.onPreCreateItem(item);

        expect(logSpy).toHaveBeenCalledWith(
            'Weapon Reload | Triggered Pre-Creation'
        );
        expect(feature['weaponId']).toBe('item123');
        expect(feature['characterId']).toBe('actor123');
        expect(feature['_creatingReloadableWeapon']).toBe(true);
        expect(feature['_createItemHookId']).toBe(mockHookId);
        expect((global as any).Hooks.on).toHaveBeenCalledWith(
            'createItem',
            expect.any(Function)
        );

        logSpy.mockRestore();
    });
});

describe('ReloadableWeaponCreationFeature.onCreateItem()', () => {
    test('returns early if not creating reloadable weapon', async () => {
        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        const item = { id: 'someId' } as any;

        await feature.onCreateItem(item);

        expect(logSpy).not.toHaveBeenCalled();
        logSpy.mockRestore();
    });

    test('returns early if item.id does not match weaponId', async () => {
        feature['_creatingReloadableWeapon'] = true;
        feature['weaponId'] = 'expectedId';
        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        const item = { id: 'differentId' } as any;

        await feature.onCreateItem(item);
        expect(logSpy).not.toHaveBeenCalled();
        logSpy.mockRestore();
    });

    test('updates weapon flags and resets state when valid', async () => {
        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        const offSpy = jest
            .spyOn((global as any).Hooks, 'off')
            .mockImplementation(() => {});

        const weaponMock = {
            system: { uses: { max: 6 } },
            update: jest.fn(),
            setFlag: jest.fn(),
        };
        jest.spyOn(feature, 'weapon', 'get').mockReturnValue(weaponMock as any);

        feature['_creatingReloadableWeapon'] = true;
        feature['_createItemHookId'] = 999;
        feature['weaponId'] = 'w1';
        feature['characterId'] = 'a1';

        const item = { id: 'w1' } as any;

        await feature.onCreateItem(item);

        // Logs correctly
        expect(logSpy).toHaveBeenCalledWith(
            'Weapon Reload | Triggered ReloadableWeapon Creation'
        );

        // Updates + flags
        expect(weaponMock.update).toHaveBeenCalledWith({
            'system.uses.spent': 6,
            'system.uses.value': 0,
        });
        expect(weaponMock.setFlag).toHaveBeenCalledTimes(2);
        expect(weaponMock.setFlag).toHaveBeenCalledWith(
            MODULE_ID,
            'chambered',
            new Array(6).fill('Empty')
        );
        expect(weaponMock.setFlag).toHaveBeenCalledWith(
            MODULE_ID,
            'fired',
            new Array(6).fill('Empty')
        );

        // State reset
        expect(feature['weaponId']).toBe('');
        expect(feature['characterId']).toBe('');
        expect(feature['_creatingReloadableWeapon']).toBe(false);
        expect(offSpy).toHaveBeenCalledWith('createItem', 999);
        expect(feature['_createItemHookId']).toBe(-1);

        logSpy.mockRestore();
    });
});

describe('ReloadableWeaponCreationFeature.toString()', () => {
    test('returns correct identifier', () => {
        expect(feature.toString()).toMatchInlineSnapshot(
            `"class ReloadableWeaponCreationFeature"`
        );
    });
});
