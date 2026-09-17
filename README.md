# Weapon Reload Module

The Weapon Reload module adds reload functionality to weapons so they can behave more like firearms. It provides system overrides, module settings, coded features, and a compendium containing base and variant items.

## Supported Systems

This module supports the following systems:

- Foundry VTT v13.x
- Dungeons and Dragons Fifth Edition v5.x

### Dependencies

The only dependencies at this time are Foundry and a supported game system.

## System overrides

### Base items

- `reloadableWeapon`: A new base weapon type to provide better classification.

### Feature types

- `Item Feature` - A new feature type meant to be used along with items for better classification.

### Item properties

- `Concealable`: A flag for weapons to indicate whether they are concealable.
- `Unstable`: A flag for ammunition to indicate whether they are unstable.

## Module settings

The Weapon Reload module provides the following configurable settings:

- `Enable Misfires` (World): A flag to indicate whether the optional rule for using misfiring weapons is enabled.
- `Repeating Shot Ammunition UUID` (World): The UUID of a consumable firearm bullet that will be used as ammunition for Repeating Shot.
- `Unstable Ammunition Failure Threshold` (World): When using unstable ammunition, a roll of this or lower results in critical failure.
- `Use Unstable Ammunition` (World): A flag to indicate whether the optional rule for using unstable ammunition is enabled.
- `Filter Ammunition By Equipped` (User): A flag to indicate whether filtering of ammunition should include checking to see if it is also equipped.

## Features

### Reloadable Weapons

Reloable Weapons are things like firearms that use ammunition but can have more than one bullet/projectile loaded into it at a time. In order for a weapon to be reloadable it must have the following configured:

- `Reload` Activity: This feature mimics the behavior inherent in reloading a firearm. This is a utility type activity renamed to be `Reload`. Beyond the name and activity type it can be configured however else you would like.
- `Next Round` Activity: This feature informs the user of what the next piece of ammunition in the reloadable weapon is. This is a utility type activity renamed to be `Next Round`. Beyond the name and activity type it can be configured however else you would like.
- `Base Weapon Type`: `Reloadable Weapon` (Martial Ranged)
- Limited Uses: The number of limited uses allowed by the weapon represents the number of bullets that can be loaded at once.

Reloadable weapons are empty when first acquired and must be loaded using the `Reload` feature.

### Ammunition

Ammunition must have a `Base Weapon Type` of `Bullet, Firearm`. If a piece of ammunition can be marked `Unstable` using the item's `Ammunition Properties`.

### Firearm attacks

Firearms have a limited amount of ammunition before they must be reloaded. While the default attack behavior does most of the heavy lifting for a firearm attack, some supplemental behavior is needed in order to be able to:

- Use and display information about the correct bullet, based on order and how many you have left
- Update uses left
- Handle attack refund behavior
- Notify the user if they fire an empty weapon or try to load too many bullets
- Provide a misfire roller

#### How it works

1. The player clicks on a firearm in their inventory and completes an attack roll.
2. A bullet is pulled from the firearm's loadout stored in the item's flags and an `Empty` bullet is added to the end of the loadout.
3. The fired bullet is added to the front of a `fired` flag and the last item is removed.
4. The player is notified which bullet was fired along with details about the item and two buttons:
    - **Refund:** This button allows the player to refund the last shot. It can be used until there are no more bullets to refund.
    - **Misfire:** This button rolls a 1d6 for the player in the event the roll a critical failure when firing a firearm.
5. If a player fired an empty weapon by mistake, they are notified and presented a button that will trigger the `Reload` feature.

### Reload feature

The Reload feature is an `Item Activity` meant to be used with items that have the base type of `reloadableWeapon` as a way to eliminate any need for manual tracking of ammunition on the user's part.

#### How it works

**Note:** The player must have some ammunition in their inventory.

1. The player clicks the `Reload` feature on their reloadable weapon.
2. The player selects a loadout from ammunition in their inventory using a dialog and the ammunition is loaded in the selected order.

From a developer point of view, the flow is:

1. The player clicks the `Reload` activity on one of their character's `reloadableWeapon`s.
2. The current loadout, from the `chambered` flag, is refunded to the player.
3. The `fired` flag is reset.
4. The player selects a loadout from ammunition in their inventory.
5. The ammunition is loaded in the selected order and removed from inventory counts.
6. The player is notified what ammunition has been loaded into which firearm.

### Artificer Infusion: Repeating Shot

The Repeating Shot feature is a named `Attack Activity` meant to be used in place of the regular firearm attack. It behaves the way the [Artificer's Repeating Shot infusion](https://dnd5e.wikidot.com/artificer:infusions) would work by using a special type of ammunition and not consuming any bullets from the weapon's loadout. The ammunition type that is used for the repeating shot can be configured via the module setting, `Repeating Shot Ammunition UUID`, and by default is the `Repeater Round` found in the modules compendiums.

**Note:** Any ammunition that shares the same name as the configured `Repeating Shot Ammunition UUID` will be excluded from user's reload options, even if they have it equipped and in their inventory.

## Compendiums

The following compendiums are provided:

- Name: Items - Contains base items, preconfigured reloadable weapons, variant reloadable weapons, and ammunition types.

## Possible Features

- Foundry v14
- More system support (Pathfinder 2E and 1E, etc)
- Giving an item the `Reload` weapon property prior to adding it to an actor would automatically configure the `Reload` and `Next Round` activities
- Vehicle support
- Ammo cartridges
- Bulk ammo loading (choose one and have all slots filled with the same)

## Development Status

This module is in alpha release.

## License

Licensed under the GPLv3 License (see [LICENSE](LICENSE)).

## Disclaimer

Art used for item icons/tokens was generated by AI.
