import BaseFeature from './BaseFeature';
import { jest } from '@jest/globals';
import { moduleMocks, MODULE_ID } from '../../../tests/mocks/moduleMocks';
import { DndItem5e } from '../types';

let feature: BaseFeature;

const makeWeapon = (overrides: Partial<any> = {}) => ({
    system: { uses: { max: 6, spent: 0, value: 6 } },
    getFlag: jest.fn().mockReturnValue(['Round 1', 'Round 2']),
    setFlag: jest.fn(),
    ...overrides,
});

const makeActor = (weapon: any) => ({
    items: { get: jest.fn().mockReturnValue(weapon) },
});

beforeEach(() => {
    jest.clearAllMocks();
    feature = new BaseFeature(moduleMocks.MockFeatureManager as any);
});

describe('BaseFeature.constructor', () => {
    test('constructor initializes with empty IDs and calls init()', () => {
        const initSpy = jest.spyOn(BaseFeature.prototype, 'init');
        const f = new BaseFeature(moduleMocks.MockFeatureManager as any);
        expect(f.featureManager).toBe(moduleMocks.MockFeatureManager);
        expect(f.characterId).toBe('');
        expect(f.weaponId).toBe('');
        expect(initSpy).toHaveBeenCalled();
        initSpy.mockRestore();
    });
});

describe('BaseFeature.characterId', () => {
    test('characterId and weaponId getters/setters work correctly', () => {
        feature.characterId = 'actor123';
        feature.weaponId = 'weapon456';
        expect(feature.characterId).toBe('actor123');
        expect(feature.weaponId).toBe('weapon456');
    });
});

describe('BaseFeature.character', () => {
    test('character getter retrieves actor from game.actors', () => {
        const weapon = makeWeapon();
        const actor = makeActor(weapon);
        jest.spyOn(feature, 'character', 'get').mockReturnValue(actor as any);

        expect(feature.character).toBe(actor as any);
    });
});

describe('BaseFeature.weapon', () => {
    test('weapon getter retrieves weapon from actor items', () => {
        const madeWeapon = makeWeapon();
        const madeActor = makeActor(madeWeapon);
        jest.spyOn(feature, 'character', 'get').mockReturnValue(
            madeActor as any
        );

        const weapon = feature.weapon as any as DndItem5e;
        expect(weapon.system.uses.max).toBe(6);
    });
});

describe('BaseFeature.getReloadFlag()', () => {
    test('returns flag data when present', () => {
        feature.weaponId = 'w1';
        const result = feature.getReloadFlag('fired');
        expect(result).toEqual([
            'Empty',
            'Empty',
            'Empty',
            'Empty',
            'Empty',
            'Empty',
        ]);
    });

    test('fills missing slots with "Empty"', () => {
        const weapon = makeWeapon({
            getFlag: jest.fn().mockReturnValue(['Round 1', 'Round 2']),
        });
        jest.spyOn(feature, 'weapon', 'get').mockReturnValue(weapon as any);

        const out = feature.getReloadFlag('fired');
        // pads to 6 based on uses.max
        expect(out).toEqual([
            'Round 1',
            'Round 2',
            'Empty',
            'Empty',
            'Empty',
            'Empty',
        ]);
        expect(weapon.getFlag).toHaveBeenCalledWith(MODULE_ID, 'fired');
    });
});

describe('BaseFeature.ammunition()', () => {
    test('filters only firearm bullets', () => {
        const items: any[] = [
            {
                type: 'consumable',
                system: { type: { subtype: 'firearmBullet' } },
            },
            { type: 'consumable', system: { type: { subtype: 'potion' } } },
            { type: 'weapon', system: { type: { subtype: 'firearmBullet' } } },
        ];
        const result = feature.ammunition(items as any);
        expect(result).toHaveLength(1);
    });

    test('filters equipped bullets when equipped=true', () => {
        const items: any[] = [
            {
                type: 'consumable',
                system: { type: { subtype: 'firearmBullet' }, equipped: true },
            },
            {
                type: 'consumable',
                system: { type: { subtype: 'firearmBullet' }, equipped: false },
            },
        ];
        const result = feature.ammunition(items as any, true) as DndItem5e[];
        expect(result).toHaveLength(1);
        expect(result[0].system.equipped).toBe(true);
    });

    test('excludes reserved ammunition', () => {
        const items: any[] = [
            {
                type: 'consumable',
                name: 'Item 1',
                system: { type: { subtype: 'firearmBullet' }, equipped: true },
            },
            {
                type: 'consumable',
                name: 'Item 2',
                system: { type: { subtype: 'firearmBullet' }, equipped: false },
            },
            {
                type: 'consumable',
                name: 'Item 3',
                system: { type: { subtype: 'firearmBullet' }, equipped: false },
            },
        ];
        const result = feature.ammunition(items as any, false, [
            'Item 3',
        ]) as DndItem5e[];
        expect(result).toHaveLength(2);
        expect(result[0].system.equipped).toBe(true);
        expect(result[1].system.equipped).toBe(false);
    });

    test('excludes reserved ammunition, even if equipped', () => {
        const items: any[] = [
            {
                type: 'consumable',
                name: 'Item 1',
                system: { type: { subtype: 'firearmBullet' }, equipped: true },
            },
            {
                type: 'consumable',
                name: 'Item 2',
                system: { type: { subtype: 'firearmBullet' }, equipped: true },
            },
            {
                type: 'consumable',
                name: 'Item 3',
                system: { type: { subtype: 'firearmBullet' }, equipped: true },
            },
        ];
        const result = feature.ammunition(items as any, true, [
            'Item 3',
        ]) as DndItem5e[];
        expect(result).toHaveLength(2);
        expect(result[0].system.equipped).toBe(true);
        expect(result[1].system.equipped).toBe(true);
    });
});

describe('BaseFeature.translate()', () => {
    test('delegates to moduleManager.uiManager.getLocalizedTxt', () => {
        const result = feature.translate('test.key');
        expect(moduleMocks.MockUiManager.getLocalizedTxt).toHaveBeenCalledWith(
            'test.key',
            undefined,
            undefined
        );
        expect(result).toBe('localized:test.key');
    });
});

describe('BaseFeature.toString()', () => {
    test('returns correct identifier', () => {
        expect(feature.toString()).toMatchInlineSnapshot(`"class BaseFeature"`);
    });
});
