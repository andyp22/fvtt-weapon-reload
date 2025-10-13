import { makeMockReloadableWeaponAttackFeature, mocks } from '../../../tests/mocks/ConsumableDataMock';

describe('ReloadableWeaponAttackFeature', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('registers hook on init()', () => {
    const feature = makeMockReloadableWeaponAttackFeature();
    feature.init();

    expect(mocks.Hooks.on).toHaveBeenCalledWith(
      'dnd5e.postRollConfiguration',
      expect.any(Function)
    );
  });

  test('calls dryfireWeapon when next round is empty', () => {
    const feature = makeMockReloadableWeaponAttackFeature();
    feature.getNextRound = jest.fn(() => ({ name: 'Empty' }) as any);
    feature.dryfireWeapon = jest.fn();

    feature.weapon.system.uses = { spent: 5, max: 6, recovery: [], value: 5, label: '' };
    const result = feature.reloadableWeaponAttack();

    expect(feature.dryfireWeapon).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  test('calls fireRound for valid bullet', () => {
    const feature = makeMockReloadableWeaponAttackFeature();
    const bullet = { name: 'Round 1', id: 'id123', type: 'ammo', use: jest.fn() } as any;

    feature.getNextRound = jest.fn(() => bullet);
    feature.fireRound = jest.fn();

    feature.reloadableWeaponAttack();

    expect(feature.fireRound).toHaveBeenCalledWith(bullet);
  });
});
