import { RepeatingShotFeature } from './RepeatingShotFeature';
import { moduleMocks } from '../../../tests/mocks/module-mocks';
import { jest } from '@jest/globals';
import { DndItem5e } from '../types';

const makeAmmo = (name: string, subtype = 'firearmBullet') => ({
    name,
    type: 'consumable',
    system: { type: { subtype }, equipped: false },
    use: jest.fn(),
});

const mockActor = {
    id: 'actor123',
    name: 'Hero',
    items: [] as any[],
    createEmbeddedDocuments: jest.fn(),
};

const mockFromUuid = jest.fn();

const mockGameSettings = {
    get: jest
        .fn()
        .mockReturnValue('Compendium.fvtt-weapon-reload.items.repeater'),
};

let feature: RepeatingShotFeature;

beforeEach(() => {
    jest.clearAllMocks();

    (global as any).game = { settings: mockGameSettings };
    (global as any).fromUuid = mockFromUuid;

    // Mock BaseFeature.character getter dynamically
    feature = new RepeatingShotFeature(moduleMocks.MockFeatureManager as any);
    Object.defineProperty(feature, 'character', {
        get: () => mockActor as any,
    });
    Object.defineProperty(feature, 'moduleManager', {
        get: () => moduleMocks.MockFeatureManager.moduleManager,
    });
});

describe('RepeatingShotFeature.init()', () => {
    test('registers hook for dnd5e.postRollConfiguration', () => {
        feature.init();
        expect((global as any).Hooks.on).toHaveBeenCalledWith(
            'dnd5e.postRollConfiguration',
            expect.any(Function)
        );
    });
});

describe('RepeatingShotFeature.onUseActivity()', () => {
    test('returns early if hookNames does not include "attack"', () => {
        const result = feature.onUseActivity(
            [] as any,
            {
                hookNames: ['damage'],
                subject: { name: 'Repeating Shot' },
            } as any
        );
        expect(result).toBeUndefined();
    });

    test('returns early if subject.name is not "Repeating Shot"', () => {
        const result = feature.onUseActivity(
            [] as any,
            { hookNames: ['attack'], subject: { name: 'Not It' } } as any
        );
        expect(result).toBeUndefined();
    });

    test('returns early if weaponData.baseItem is not reloadableWeapon', () => {
        const roll = { data: { item: { type: { baseItem: 'sword' } } } };
        const result = feature.onUseActivity(
            [roll] as any,
            {
                hookNames: ['attack'],
                subject: { name: 'Repeating Shot' },
            } as any
        );
        expect(result).toBeUndefined();
    });

    test('sets ids and calls fireRound for valid repeating shot', () => {
        const consoleSpy = jest
            .spyOn(console, 'log')
            .mockImplementation(() => {});
        const roll = {
            data: { item: { type: { baseItem: 'reloadableWeapon' } } },
        };
        const event = {
            hookNames: ['attack'],
            subject: {
                name: 'Repeating Shot',
                item: { id: 'weaponId' },
                actor: { id: 'actorId' },
            },
        };
        const fireSpy = jest
            .spyOn(feature, 'fireRound')
            .mockResolvedValue(true as any);

        feature.onUseActivity([roll] as any, event as any);

        expect(consoleSpy).toHaveBeenCalledWith(
            'Weapon Reload | Triggered Repeating Shot'
        );
        expect(feature.weaponId).toBe('weaponId');
        expect(feature.characterId).toBe('actorId');
        expect(fireSpy).toHaveBeenCalled();

        consoleSpy.mockRestore();
    });
});

describe('RepeatingShotFeature.fireRound()', () => {
    test('returns false when ammo not loaded', async () => {
        feature.loadAmmo = jest.fn(() => {
            return Promise.resolve();
        });
        (feature as any)._ammo = undefined;
        const result = await feature.fireRound();
        expect(result).toBe(false);
    });

    test('calls ammo.use() and returns true when ammo present', async () => {
        const ammo = makeAmmo('Round 1');
        feature.loadAmmo = jest.fn(() => {
            return Promise.resolve();
        });
        (feature as any)._ammo = ammo;
        const result = await feature.fireRound();
        expect(ammo.use).toHaveBeenCalled();
        expect(result).toBe(true);
    });
});

describe('RepeatingShotFeature.findAmmo()', () => {
    test('returns matching ammo item', () => {
        const ammo1 = makeAmmo('A');
        const ammo2 = makeAmmo('B');
        mockActor.items = [ammo1, ammo2];
        const result = feature.findAmmo('B');
        expect(result).toBe(ammo2);
    });

    test('returns undefined if no match', () => {
        mockActor.items = [makeAmmo('C')];
        const result = feature.findAmmo('Z');
        expect(result).toBeUndefined();
    });
});

describe('RepeatingShotFeature.hasAmmo()', () => {
    test('returns true when ammo exists', () => {
        mockActor.items = [makeAmmo('Repeater Round')];
        expect(feature.hasAmmo('Repeater Round')).toBe(true);
    });

    test('returns false when ammo missing', () => {
        mockActor.items = [makeAmmo('X')];
        expect(feature.hasAmmo('Repeater Round')).toBe(false);
    });
});

describe('RepeatingShotFeature.loadAmmo()', () => {
    test('creates embedded document if ammo missing', async () => {
        const compendiumAmmo = makeAmmo(
            'Repeater Round'
        ) as unknown as DndItem5e;
        (mockFromUuid as jest.Mock).mockResolvedValue({
            ...compendiumAmmo,
            toObject: jest.fn().mockReturnValue({ name: 'Repeater Round' }),
        } as never);
        jest.spyOn(feature, 'hasAmmo').mockReturnValue(false);
        jest.spyOn(feature, 'findAmmo').mockReturnValue(compendiumAmmo);

        await feature.loadAmmo();

        expect(mockGameSettings.get).toHaveBeenCalledWith(
            'fvtt-weapon-reload',
            'repeaterRoundUUID'
        );
        expect(mockFromUuid).toHaveBeenCalled();
        expect(mockActor.createEmbeddedDocuments).toHaveBeenCalledWith('Item', [
            { name: 'Repeater Round' },
        ]);
        expect((feature as any)._ammo).toBe(compendiumAmmo);
    });

    test('does not create document if ammo already exists', async () => {
        const compendiumAmmo = makeAmmo('Repeater Round');
        (mockFromUuid as jest.Mock).mockResolvedValue(compendiumAmmo as never);
        jest.spyOn(feature, 'hasAmmo').mockReturnValue(true);
        jest.spyOn(feature, 'findAmmo').mockReturnValue(
            compendiumAmmo as never
        );

        await feature.loadAmmo();

        expect(mockActor.createEmbeddedDocuments).not.toHaveBeenCalled();
        expect((feature as any)._ammo).toBe(compendiumAmmo);
    });
});

describe('RepeatingShotFeature.toString()', () => {
    test('returns identifier', () => {
        expect(feature.toString()).toMatchInlineSnapshot(
            `"class RepeatingShotFeature"`
        );
    });
});
