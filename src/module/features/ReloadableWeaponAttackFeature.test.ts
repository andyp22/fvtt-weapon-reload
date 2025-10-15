import {
    makeMockReloadableWeaponAttackFeature,
    mockReloadFeature,
} from '../../../tests/mocks/moduleMocks';
import { DndItem5e } from '../types';

let feature: ReturnType<typeof makeMockReloadableWeaponAttackFeature>;

beforeEach(() => {
    jest.clearAllMocks();
    feature = makeMockReloadableWeaponAttackFeature();
});

describe('ReloadableWeaponAttackFeature.init()', () => {
    test('registers hook', () => {
        feature.init();

        expect((global as any).Hooks.on).toHaveBeenCalledWith(
            'dnd5e.postRollConfiguration',
            expect.any(Function)
        );
    });
});

describe('ReloadableWeaponAttackFeature.onUseActivity()', () => {
    test('returns early when weaponData is missing', () => {
        feature.reloadableWeaponAttack = jest.fn();

        const result = feature.onUseActivity(
            [{ data: {} }] as any, // roll missing data.item
            { hookNames: ['attack'], subject: { item: {}, actor: {} } } as any
        );

        expect(result).toBeUndefined();
        expect(feature.reloadableWeaponAttack).not.toHaveBeenCalled?.();
    });

    test('returns early when weaponData.type.baseItem is not reloadableWeapon', () => {
        const roll = { data: { item: { type: { baseItem: 'sword' } } } };
        const result = feature.onUseActivity(
            [roll] as any,
            { hookNames: ['attack'], subject: { item: {}, actor: {} } } as any
        );

        expect(result).toBeUndefined();
    });

    test('returns early when event.hookNames does not include "attack"', () => {
        const roll = {
            data: { item: { type: { baseItem: 'reloadableWeapon' } } },
        };
        const result = feature.onUseActivity(
            [roll] as any,
            { hookNames: ['damage'], subject: { item: {}, actor: {} } } as any
        );

        expect(result).toBeUndefined();
    });

    test('sets IDs and calls reloadableWeaponAttack when conditions are met', () => {
        const roll = {
            data: { item: { type: { baseItem: 'reloadableWeapon' } } },
        };
        const event = {
            hookNames: ['attack'],
            subject: {
                item: { id: 'item123' },
                actor: { id: 'actor456' },
                name: 'Attack',
            },
        };

        const mockReloadCall = jest.fn();
        feature.reloadableWeaponAttack = mockReloadCall as any;

        const result = feature.onUseActivity([roll] as any, event as any);

        expect(feature.weaponId).toBe('item123');
        expect(feature.characterId).toBe('actor456');
        expect(mockReloadCall).toHaveBeenCalled();
        expect(result).toBeUndefined(); // function doesn't explicitly return a value
    });

    test('logs trigger message to console', () => {
        const consoleSpy = jest
            .spyOn(console, 'log')
            .mockImplementation(() => {});
        const roll = {
            data: { item: { type: { baseItem: 'reloadableWeapon' } } },
        };
        const event = {
            hookNames: ['attack'],
            subject: {
                item: { id: 'itm' },
                actor: { id: 'act' },
                name: 'Attack',
            },
        };

        feature.reloadableWeaponAttack = jest.fn();

        feature.onUseActivity([roll] as any, event as any);

        expect(consoleSpy).toHaveBeenCalledWith(
            'Weapon Reload | Triggered Attack'
        );
        consoleSpy.mockRestore();
    });
});

describe('ReloadableWeaponAttackFeature.reloadableWeaponAttack()', () => {
    test('calls dryfireWeapon when next round is empty', () => {
        feature.getNextRound = jest.fn(() => ({ name: 'Empty' }) as any);
        feature.dryfireWeapon = jest.fn();

        feature.weapon.system.uses = {
            spent: 5,
            max: 6,
            recovery: [],
            value: 5,
            label: '',
        };
        const result = feature.reloadableWeaponAttack();

        expect(feature.dryfireWeapon).toHaveBeenCalled();
        expect(result).toBe(true);
    });

    test('calls fireRound for valid bullet', () => {
        const bullet = {
            name: 'Round 1',
            id: 'id123',
            type: 'ammo',
            use: jest.fn(),
        } as any;

        feature.getNextRound = jest.fn(() => bullet);
        feature.fireRound = jest.fn();

        feature.reloadableWeaponAttack();

        expect(feature.fireRound).toHaveBeenCalledWith(bullet);
    });
});

describe('ReloadableWeaponAttackFeature.onRenderChatMessage()', () => {
    let message: any;
    let html: HTMLElement;

    beforeEach(() => {
        // Basic DOM setup (jsdom handles document/window automatically)
        html = document.createElement('div');
        html.innerHTML = `
      <div class="item-card">
        <div class="card-header"></div>
        <div class="card-content"><div class="wrapper"></div></div>
      </div>
    `;

        // Default mock message
        message = {
            flags: {
                dnd5e: { item: { id: 'bullet123', type: 'ammo' } },
            },
        };

        // Make sure _nextRound matches so logic proceeds
        (feature as any)._nextRound = { id: 'bullet123', type: 'ammo' };

        // Required mocks
        jest.spyOn((global as any).Hooks, 'off').mockImplementation(() => {});
        jest.spyOn((global as any).game.settings, 'get').mockReturnValue(false);
        feature.translate = jest.fn((k: string) => k);
        feature.makeIcon = jest.fn((icon: string) => `<i>${icon}</i>`);
    });

    test('calls Hooks.off when message matches _nextRound', async () => {
        await feature.onRenderChatMessage(message, html);

        expect((global as any).Hooks.off).toHaveBeenCalledWith(
            'dnd5e.renderChatMessage',
            (feature as any)._hookId
        );
    });

    test('always adds refund button', async () => {
        await feature.onRenderChatMessage(message, html);

        const buttons = html.querySelectorAll('.card-buttons button');
        const refundBtn = Array.from(buttons).find((b) =>
            b.innerHTML.includes('RefundBtnTxt')
        );

        expect(refundBtn).toBeTruthy();
    });

    test('adds misfire button only when useMisfires is true', async () => {
        jest.spyOn((global as any).game.settings, 'get').mockImplementation(
            (_mod, key) => {
                if (key === 'useMisfires') return true;
                return false;
            }
        );

        await feature.onRenderChatMessage(message, html);

        const buttons = html.querySelectorAll('.card-buttons button');
        const misfireBtn = Array.from(buttons).find((b) =>
            b.innerHTML.includes('MisfiredBtnTxt')
        );

        expect(misfireBtn).toBeTruthy();
    });

    test('adds misfire unstable text when unstable ammo is active', async () => {
        jest.spyOn((global as any).game.settings, 'get').mockImplementation(
            (_mod, key) => {
                if (key === 'useMisfires') return true;
                if (key === 'unstableAmmo') return true;
                if (key === 'unstableAmmoFailureThreshhold') return 2;
                return false;
            }
        );

        // mock the bullet returned by character.items.get()
        const mockBullet = {
            system: { properties: ['unstable'] },
        } as any;
        jest.spyOn(feature.character.items, 'get').mockReturnValue(mockBullet);

        await feature.onRenderChatMessage(message, html);

        const content = html.querySelector('.card-content')?.innerHTML;
        expect(content).toContain('MisfireUnstable');
    });
});

describe('ReloadableWeaponAttackFeature.getNextRound()', () => {
    test('returns matching ammo and updates chambered flag', () => {
        const weapon = {
            setFlag: jest.fn(),
        } as any;

        jest.spyOn(feature, 'weapon', 'get').mockReturnValue(weapon);
        jest.spyOn(feature, 'character', 'get').mockReturnValue({
            items: [],
        } as any);
        jest.spyOn(feature, 'loadout', 'get').mockReturnValue([
            'Round 1',
            'Round 2',
        ]);

        const ammo1 = {
            name: 'Round 1',
            id: 'ammo1',
            use: jest.fn(),
        } as any as DndItem5e;
        const ammo2 = {
            name: 'Round 2',
            id: 'ammo2',
            use: jest.fn(),
        } as any as DndItem5e;
        feature.ammunition = jest.fn(() => [ammo1, ammo2]);

        // Act
        const result = feature.getNextRound();

        // Assert
        expect(weapon.setFlag).toHaveBeenCalledWith(
            feature.moduleManager.id,
            'chambered',
            expect.any(Array)
        );
        expect(result).toEqual(ammo1);
    });

    test('returns Empty when no matching ammo found', () => {
        const weapon = { setFlag: jest.fn() } as any;

        jest.spyOn(feature, 'weapon', 'get').mockReturnValue(weapon);
        jest.spyOn(feature, 'character', 'get').mockReturnValue({
            items: [],
        } as any);
        jest.spyOn(feature, 'loadout', 'get').mockReturnValue(['Nonexistent']);

        feature.ammunition = jest.fn(() => []);

        const result = feature.getNextRound();

        expect(result).toEqual(expect.objectContaining({ name: 'Empty' }));
    });
});

describe('ReloadableWeaponAttackFeature.dryfireWeapon()', () => {
    test('registers renderChatMessage hook and calls renderCard', async () => {
        // Spy on Hooks
        const onSpy = jest.spyOn((global as any).Hooks, 'on');
        const offSpy = jest.spyOn((global as any).Hooks, 'off');

        // Mock required weapon/character getters
        const weapon = {
            name: 'Mock Gun',
            img: 'gun.png',
            system: { uses: { spent: 1, max: 6 } },
        } as any as DndItem5e;
        const character = { name: 'Shooter' } as any;

        jest.spyOn(feature, 'weapon', 'get').mockReturnValue(weapon);
        jest.spyOn(feature, 'character', 'get').mockReturnValue(character);

        // Spy on translate and renderCard
        const renderSpy = jest
            .spyOn(feature, 'renderCard')
            .mockResolvedValue(undefined as any);
        const translateSpy = jest
            .spyOn(feature, 'translate')
            .mockImplementation((k) => k);

        // Act
        feature.dryfireWeapon();

        // Assert
        // Hook is registered
        expect(onSpy).toHaveBeenCalledWith(
            'renderChatMessage',
            expect.any(Function)
        );

        // RenderCard called with proper structure
        expect(renderSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                item: expect.objectContaining({
                    name: 'WEAPON_RELOAD.Features.ReloadableWeaponAttack.DryFireTitle',
                }),
                buttons: expect.arrayContaining([
                    expect.objectContaining({ classes: 'reload-ammo' }),
                ]),
            }),
            character
        );

        // Optional: ensure translate is used multiple times
        expect(translateSpy).toHaveBeenCalled();

        // Cleanup spies
        onSpy.mockRestore();
        offSpy.mockRestore();
    });
});

describe('ReloadableWeaponAttackFeature.renderCard()', () => {
    test('renders template and sends chat with rendered HTML', async () => {
        const mockCharacter = { name: 'Shooter' } as any;
        const mockTemplateData = {
            item: { name: 'Mock Weapon', img: 'gun.png' },
            description: { chat: '<p>Bang</p>' },
        };

        await feature.renderCard(mockTemplateData as any, mockCharacter);

        const uiManager = feature.moduleManager.uiManager;
        expect(
            (global as any).foundry.applications.handlebars.renderTemplate
        ).toHaveBeenCalled();

        expect(uiManager.sendChat).toHaveBeenCalledWith(
            mockCharacter,
            '<div>Rendered Template</div>'
        );
    });
});

describe('ReloadableWeaponAttackFeature.fireRound()', () => {
    test('updates weapon flags and calls bullet.use for non-empty bullet', () => {
        const bullet = { name: 'Round 1', use: jest.fn() } as any;
        const weapon = {
            system: { uses: { max: 6, spent: 2, value: 4 } },
            getFlag: jest
                .fn()
                .mockReturnValue([
                    'Empty',
                    'Empty',
                    'Empty',
                    'Empty',
                    'Empty',
                    'Empty',
                ]),
            setFlag: jest.fn(),
            update: jest.fn(),
        } as any as DndItem5e;

        jest.spyOn(feature, 'weapon', 'get').mockReturnValue(weapon);

        const result = feature.fireRound(bullet);

        // Verify flag update
        expect(weapon.setFlag).toHaveBeenCalledWith(
            feature.moduleManager.id,
            'fired',
            expect.any(Array)
        );

        // Verify weapon system update
        expect(weapon.update).toHaveBeenCalledWith({
            'system.uses.spent': 3,
            'system.uses.value': 3,
        });

        // Verify bullet.use() was called
        expect(bullet.use).toHaveBeenCalled();

        // Should return true
        expect(result).toBe(true);
    });

    test('updates fired flag but does not call bullet.use for Empty bullet', () => {
        const bullet = { name: 'Empty', use: jest.fn() } as any;
        const weapon = {
            system: { uses: { max: 6, spent: 5, value: 1 } },
            getFlag: jest
                .fn()
                .mockReturnValue([
                    'Round 1',
                    'Round 2',
                    'Empty',
                    'Empty',
                    'Empty',
                    'Empty',
                ]),
            setFlag: jest.fn(),
            update: jest.fn(),
        } as any as DndItem5e;

        jest.spyOn(feature, 'weapon', 'get').mockReturnValue(weapon);

        const result = feature.fireRound(bullet);

        // Fired flag should still update
        expect(weapon.setFlag).toHaveBeenCalledWith(
            feature.moduleManager.id,
            'fired',
            expect.any(Array)
        );

        // Weapon should not be updated for an empty bullet
        expect(weapon.update).not.toHaveBeenCalled();

        // Bullet.use() should not be called
        expect(bullet.use).not.toHaveBeenCalled();

        expect(result).toBe(true);
    });
});

describe('ReloadableWeaponAttackFeature.reload()', () => {
    test('calls reload feature onReloadCallback with correct parameters', () => {
        const internalManager = feature.featureManager;

        const mockActor = { name: 'Shooter' } as any;
        const mockWeapon = { name: 'Mock Gun' } as any;

        feature.reload(mockActor, mockWeapon);

        expect(internalManager.getFeature).toHaveBeenCalledWith('reload');
        expect(mockReloadFeature.onReloadCallback).toHaveBeenCalled();
    });
});

describe('ReloadableWeaponAttackFeature.onClickRefund()', () => {
    let weapon: any;
    let actor: any;

    beforeEach(() => {
        weapon = {
            name: 'Mock Gun',
            img: 'gun.png',
            system: {
                uses: { max: 6, spent: 3, value: 3 },
            },
            setFlag: jest.fn().mockResolvedValue(undefined),
            update: jest.fn().mockResolvedValue(undefined),
        };

        actor = {
            name: 'Shooter',
            items: { forEach: jest.fn() },
        };

        jest.spyOn(feature, 'weapon', 'get').mockReturnValue(weapon);
        jest.spyOn(feature, 'character', 'get').mockReturnValue(actor);
    });

    test('shows warning and exits when refund = "Empty"', async () => {
        (feature as any).getReloadFlag = jest.fn(() => ['Empty']);

        await feature.onClickRefund();

        const uiManager = feature.moduleManager.uiManager;
        expect(uiManager.uiNotification).toHaveBeenCalledWith(
            expect.stringContaining('Refund.RefundNoMoreMsg'),
            'warn'
        );

        // No further updates or render calls
        expect(weapon.setFlag).not.toHaveBeenCalled();
        expect(weapon.update).not.toHaveBeenCalled();
        expect(uiManager.sendChat).not.toHaveBeenCalled();
    });

    test('updates flags, adjusts uses, and sends chat for valid refund', async () => {
        (feature as any).getReloadFlag = jest.fn((name: string) => {
            let flags: string[] = [];
            switch (name) {
                case 'fired':
                    flags = ['Round 1', 'Round 2', 'Empty', 'Empty'];
                    break;
                case 'loadout':
                    flags = ['Empty', 'Empty', 'Empty', 'Empty'];
                    break;
            }

            return flags;
        });

        // Mock ammunition list
        const ammoItem = {
            name: 'Round 1',
            img: 'bullet.png',
        } as unknown as DndItem5e;
        feature.ammunition = jest.fn(() => [ammoItem]);

        await feature.onClickRefund();

        // Fired flag should be updated
        expect(weapon.setFlag).toHaveBeenCalledWith(
            feature.moduleManager.id,
            'fired',
            expect.any(Array)
        );

        // Chambered flag should be updated
        expect(weapon.setFlag).toHaveBeenCalledWith(
            feature.moduleManager.id,
            'chambered',
            expect.any(Array)
        );

        // Weapon uses reduced by one
        expect(weapon.update).toHaveBeenCalledWith({
            'system.uses.spent': 2,
            'system.uses.value': 4,
        });

        // Chat message rendered and sent
        const uiManager = feature.moduleManager.uiManager;
        expect(
            ((global as any).foundry.applications as any).handlebars
                .renderTemplate
        ).toHaveBeenCalled();
        expect(uiManager.sendChat).toHaveBeenCalledWith(
            actor,
            '<div>Rendered Template</div>'
        );
    });
});

describe('ReloadableWeaponAttackFeature.onClickMisfire()', () => {
    let rollInstance: any;
    let RollMock: jest.Mock;

    beforeEach(() => {
        jest.spyOn(feature, 'character', 'get').mockReturnValue({
            name: 'Shooter',
        } as any);

        RollMock = jest.fn().mockImplementation(() => {
            rollInstance = {
                roll: jest.fn().mockImplementation(function (
                    this: any
                ): Promise<any> {
                    return Promise.resolve(this);
                }),
                toMessage: jest.fn().mockResolvedValue(undefined),
            };
            return rollInstance;
        });

        (global as any).Roll = RollMock;
    });

    test('creates a new Roll with "1d6"', async () => {
        await feature.onClickMisfire();

        expect(RollMock).toHaveBeenCalledWith('1d6');
    });

    test('calls roll() and toMessage() with actor alias', async () => {
        await feature.onClickMisfire();

        expect(rollInstance.roll).toHaveBeenCalled();
        expect(rollInstance.toMessage).toHaveBeenCalledWith({
            speaker: { alias: 'Shooter' },
        });
    });
});

describe('ReloadableWeaponAttackFeature.makeIcon()', () => {
    test('returns correct HTML icon string', () => {
        const icon = feature.makeIcon('fa-gun');
        expect(icon).toBe('<i class="fas fa-gun"></i>');
    });
});

describe('ReloadableWeaponAttackFeature.toString()', () => {
    test('returns class name string', () => {
        expect(feature.toString()).toMatchInlineSnapshot(
            `"class ReloadableWeaponAttackFeature"`
        );
    });
});
