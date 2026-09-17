# User Guide - Weapon Reload module

A comprehensive guide to using the Weapon Reload module in Foundry VTT.

## Table of Contents

- [Getting Started](#getting-started)
- [Settings & Configuration](#settings--configuration)
- [Features](#features)
- [Troubleshooting](#troubleshooting)
- [Support This Project](#support-this-project)

## Getting Started

### Installation

#### Option 1: Foundry Module Browser (Recommended)

1. Open Foundry VTT and navigate to **Add-on Modules**
2. Search for "Weapon Reload" in the module browser
3. Click **Install** and enable the module in your world
4. Refresh your browser and the module will be available

#### Option 2: Manual Installation via Manifest URL

If the module is not yet available in the browser (during initial release):

1. Open Foundry VTT and navigate to **Add-on Modules**
2. Click **Install Module** at the bottom
3. Paste this manifest URL: `https://github.com/andyp22/fvtt-weapon-reload/releases/latest/download/module.json`
4. Click **Install** and enable the module in your world
5. Refresh your browser and the module will be available

### First Launch

When you first enable the module:

- The module defaults world settings to the following:
    - `Use Unstable Ammunition`: _enabled_
    - `Unstable Ammunition Failure Threshold`: _2_
    - `Enable Misfires`: _enabled_
    - `Repeating Shot Ammunition UUID`: _Compendium.fvtt-weapon-reload.weapon-reload-item-pack.Item.GQzRN4amlRZX7k0V_
- If starting a new world, it automatically sets to today's real-world date
- The time widget appears in the UI (can be disabled in settings)

## Settings & Configuration

### Module Settings

Access via **Game Settings → Module Settings → Weapon Reload**:

#### Client Settings (Per User)

- **Filter Ammunition By Equipped**: A flag to indicate whether filtering of ammunition for the reload popup should include checking to see if the ammunition is also equipped. If this is selected, only equipped ammunition will be listed.

#### World Settings (GM Only)

- **Use Unstable Ammunition**: A flag to indicate whether the optional rule for using unstable ammunition is enabled.
- **Unstable Ammunition Failure Threshold**: When using unstable ammunition, a roll of this number or lower should result in a critical failure.
- **Enable Misfires**: A flag to indicate whether the optional rule for using misfiring weapons is enabled.
- **Repeating Shot Ammunition UUID**: The UUID of a consumable firearm bullet that will be used as ammunition for the Repeating Shot feature.

## Features

### Reloadable Weapons

#### Base Reloadable Weapon

The Weapon Reload module comes with a pre-configured item that can be duplicated to quickly create new reloadable weapon types. The `Reloadable Weapon` item is found in the `Base Items` folder of the Weapon Reload `Item Pack` compendium. This item is used to define the `Reloadable Weapon` `Base Weapon` type found on the `Details` tab and should not be modified.

#### Reloadable Weapon Type

Reloable Weapons are items like firearms that use ammunition but must be reloaded once all of its ammunition stores have been exhausted. Reloadable weapons can have one or more bullet/projectile loaded into it at a time. In order for a weapon to be reloadable it must have the following configured:

- `Reload` Activity: This feature mimics the behavior inherent in reloading a firearm. This is a utility type activity renamed to be `Reload`. Beyond the name and activity type it can be configured however else you would like.
- `Next Round` Activity: This feature informs the user of what the next piece of ammunition in the reloadable weapon is. This is a utility type activity renamed to be `Next Round`. Beyond the name and activity type it can be configured however else you would like.
- `Base Weapon Type`: `Reloadable Weapon` (Martial Ranged)
- Limited Uses: The number of limited uses allowed by the weapon represents the number of bullets that can be loaded into the weapon at one time.

The Weapon Reload module comes with several firearms already configured:

- Musket
- Pepperbox
- Pocket Pistol
- Revolver
- Rifle
- Shotgun
- Snubnose

### `Reload` Activity

The `Reload` feature is an `Utility Activity` meant to be used with items that have the base type of `Reloadable Weapon` as a way to eliminate any need for manual tracking of ammunition on the user's part.

**Note:** Reloadable weapons are empty when first acquired and must be loaded using the `Reload` activity feature.

#### How it works

**Note:** The player must have some ammunition in their inventory.

1. The player clicks the `Reload` feature on their reloadable weapon.
2. The player selects a loadout from ammunition in their inventory using a dialog and the ammunition is loaded in the selected order.

From a developer point of view, the flow is:

1. The player clicks the `Reload` activity on one of their character's `Reloadable Weapon`s.
2. The current loadout, from the `chambered` flag, is refunded to the player.
3. The `fired` flag is reset.
4. The player selects a loadout from ammunition in their inventory. This may or may not be limited to only equipped ammunition based on user module configurations.
5. The ammunition is loaded in the selected order and removed from inventory counts.
6. The player is notified what ammunition has been loaded into which firearm.

### `Next Round` Activity

The `Next Round` feature is an `Utility Activity` meant to be used with items that have the base type of `Reloadable Weapon` as a way to inform the player what the name round of ammunition to fired from a `Reloadable Weapon` will be.

#### How it works

1. The player clicks the `Next Round` feature on their reloadable weapon.
2. Information about the next round loaded into the weapon is displayed to the user in the chat panel.

From a developer point of view, the flow is:

1. The player clicks the `Next Round` activity on one of their character's `Reloadable Weapon`s.
2. The next round of loaded ammunition, from the `chambered` flag, is read.
3. Data about the ammunition is loaded.
4. Ammunition data is displayed via the chat panel to the user who clicked the activity button.

### `Attack` Activity Hook

When a `Reloadable Weapon` is used via the `Attack` activity

#### How it works

The `Weapon Reload` module utilizes the `dnd5e.postRollConfiguration` hook to:

1. If there is ammunition in the weapon, selects the next type of ammunition chambered in the weapon
2. Asks the player to roll for attack
3. Allows the player to roll for damage, using the weapon's damage die for damage calculation
4. Removes the spent ammunition charge from the weapon, decreasing the count by one
5. If no ammunition is loaded, the weapon dry-fires

### `Repeating Shot` Activity Hook

When an actor has a skill like the [Artificer's Repeating Shot infusion](https://dnd5e.wikidot.com/artificer:infusions), this attack can be used in place of the regular `Attack` and will fire the `Repeater Round` ammunition type and not consume ammunition from the actor's inventory.

#### How it works

1. Asks the player to roll for attack
2. Allows the player to roll for damage, using the weapon's damage die for damage calculation
3. No ammunition is consumed

#### Add it to a Reloadable Weapon

Weapons must be configured to utilize the `Repeating Shot`. To configure a weapon:

1. Edit the weapon
2. Under `Activities`, add a new `Attack` type actitivy
3. Give the new activity the name `Repeating Shot`
4. Deselct the `Measured Template Prompt` checkbox
5. Close the activity edit popup
6. Make sure that the **Repeating Shot Ammunition UUID** World Setting for the `Weapon Reload` module is set to use the correct UUID
7. Player should use the `Repeating Shot` attack instead of the regular `Atack`

## Troubleshooting

### Getting Help

1. **Check Console**: F12 → Console for error messages
2. **Module Conflicts**: Temporarily disable other modules to test
3. **Known Issues**: Review [Known Issues](../KNOWN-ISSUES.md) for documented limitations (none at this time)
4. **Report Issues**: Use GitHub Issues with error details and module list
5. **Community Support**: Ask in Foundry Discord #modules channel

## Support This Project

Enjoying the Weapon Reload module? Consider supporting continued development:

[![Patreon](https://img.shields.io/badge/Patreon-Support%20Development-ff424d?style=for-the-badge&logo=patreon)](https://patreon.com/cw/andyp22)

Your support helps fund new features, bug fixes, and comprehensive documentation.
