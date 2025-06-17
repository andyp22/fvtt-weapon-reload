/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./module.json":
/*!*********************!*\
  !*** ./module.json ***!
  \*********************/
/***/ ((module) => {

module.exports = /*#__PURE__*/JSON.parse('{"id":"fvtt-weapon-reload","title":"Weapon Reload","version":"0.0.1","compatibility":{"minimum":"13","verified":"13"},"authors":[{"name":"Andrew Page","email":"andrew.page32@gmail.com","discord":"andyp22#1298"}],"relationships":{"systems":[{"id":"dnd5e","type":"system","compatibility":{"minimum":"5","verified":"5"}}]},"conflicts":[],"esmodules":["build/index.mjs"],"scripts":[],"styles":["build/styles/module.css"],"languages":[{"lang":"en","name":"English","path":"languages/en.json"}],"packs":[{"name":"journal-pack","label":"Journal Pack","path":"packs/journal-pack","type":"JournalEntry","ownership":{"PLAYER":"OBSERVER","ASSISTANT":"OWNER"},"system":"dnd5e","flags":{}},{"name":"actor-pack","label":"Actor Pack","path":"packs/actor-pack","type":"Actor","ownership":{"PLAYER":"OBSERVER","ASSISTANT":"OWNER"},"system":"dnd5e","flags":{}},{"name":"item-pack","label":"Item Pack","path":"packs/item-pack","type":"Item","ownership":{"PLAYER":"OBSERVER","ASSISTANT":"OWNER"},"system":"dnd5e","flags":{"dnd5e":{"sorting":"m","sourceBooks":{"EbW":"EWEAPON_RELOAD.Title"},"types":["item"]}}},{"name":"macro-pack","label":"Macro Pack","path":"packs/macro-pack","type":"Macro","ownership":{"PLAYER":"OBSERVER","ASSISTANT":"OWNER"},"system":"dnd5e","flags":{}},{"name":"rollable-table-pack","label":"Rollable Table Pack","path":"packs/rollable-table-pack","type":"RollTable","ownership":{"PLAYER":"OBSERVER","ASSISTANT":"OWNER"},"system":"dnd5e","flags":{}}],"packFolders":[{"name":"Weapon Reload","sorting":"a","color":"#8b5e3c","ownership":{"PLAYER":"NONE"},"packs":["journal-pack","actor-pack","item-pack","macro-pack","rollable-table-pack"]}]}');

/***/ }),

/***/ "./src/module/features/BaseFeature.ts":
/*!********************************************!*\
  !*** ./src/module/features/BaseFeature.ts ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ BaseFeature)
/* harmony export */ });
class BaseFeature {
    _featureManager;
    _actorId;
    _weaponId;
    constructor(featureManager) {
        this._featureManager = featureManager;
        this._actorId = '';
        this._weaponId = '';
        this.init();
    }
    get featureManager() {
        return this._featureManager;
    }
    get moduleManager() {
        return this._featureManager.moduleManager;
    }
    get character() {
        return game?.actors?.get(this._actorId);
    }
    get characterId() {
        return this._actorId;
    }
    set characterId(id) {
        this._actorId = id;
    }
    get weapon() {
        return this.character.items.get(this._weaponId);
    }
    get weaponId() {
        return this._weaponId;
    }
    set weaponId(id) {
        this._weaponId = id;
    }
    get loadout() {
        const reloadableWeapon = this.weapon;
        const maxShots = parseInt(reloadableWeapon.system.uses.max);
        const currentLoadout = reloadableWeapon.getFlag(this.moduleManager.id, 'chambered') || new Array(maxShots).fill('Empty');
        if (currentLoadout.length < maxShots) {
            const missing = maxShots - currentLoadout.length;
            for (let i = 0; i < missing; i++) {
                currentLoadout.push('Empty');
            }
        }
        return currentLoadout;
    }
    get fired() {
        const reloadableWeapon = this.weapon;
        const maxShots = parseInt(reloadableWeapon.system.uses.max);
        const fired = reloadableWeapon.getFlag(this.moduleManager.id, 'fired') || new Array(maxShots).fill('Empty');
        if (fired.length < maxShots) {
            const missing = maxShots - fired.length;
            for (let i = 0; i < missing; i++) {
                fired.push('Empty');
            }
        }
        return fired;
    }
    ammunition(items, equipped = false) {
        return items.filter((item) => {
            const gameSystem = item.system;
            if (equipped) {
                return (item.type == 'consumable' &&
                    gameSystem.type.subtype == 'firearmBullet' &&
                    gameSystem.equipped);
            }
            return (item.type == 'consumable' &&
                gameSystem.type.subtype == 'firearmBullet');
        });
    }
    init() { }
    translate(key, opts, format) {
        return this.moduleManager.uiManager.getLocalizedTxt(key, opts, format);
    }
    toString() {
        return 'class BaseFeature';
    }
}


/***/ }),

/***/ "./src/module/features/ReloadFeature.ts":
/*!**********************************************!*\
  !*** ./src/module/features/ReloadFeature.ts ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ReloadFeature: () => (/* binding */ ReloadFeature)
/* harmony export */ });
/* harmony import */ var _BaseFeature__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./BaseFeature */ "./src/module/features/BaseFeature.ts");

class ReloadFeature extends _BaseFeature__WEBPACK_IMPORTED_MODULE_0__["default"] {
    _hookId;
    _handleChoiceDialogClose;
    constructor(featureManager) {
        super(featureManager);
        this._hookId = -1;
        this._handleChoiceDialogClose = false;
    }
    init() {
        Hooks.on('dnd5e.postUseActivity', this.onUseActivity.bind(this));
    }
    onUseActivity(activity) {
        if (activity.type === 'utility' && activity.name == 'Reload') {
            console.log('Weapon Reload | Triggered Reload');
            this.characterId = activity.actor.id;
            this.weaponId = activity.item.id;
            this.weaponReload();
        }
    }
    weaponReload(refundAmmo = true) {
        const items = this.character?.items;
        const currentLoadout = this.loadout;
        const inventoryAmmunition = this.ammunition(items);
        let ammunitionChoices = [];
        if (refundAmmo) {
            ammunitionChoices = this.refundChamberedAmmo(inventoryAmmunition);
        }
        else {
            ammunitionChoices = inventoryAmmunition.map((ammo) => {
                return {
                    name: ammo.name,
                    value: ammo.name,
                    count: ammo.system.quantity,
                    equipped: ammo.system.equipped,
                };
            });
        }
        const checkEquipped = game.settings.get(this.moduleManager.id, 'filterAmmunitionByEquipped');
        this.chooseAmmunition(ammunitionChoices.filter((ammoItem) => {
            if (ammoItem.count > 0) {
                if ((checkEquipped && ammoItem.equipped) ||
                    !checkEquipped) {
                    return true;
                }
            }
            return false;
        }), currentLoadout);
    }
    refundChamberedAmmo(inventoryAmmunition) {
        const loadoutCounts = this.getLoadoutCounts(this.loadout);
        const availableAmmunition = [];
        inventoryAmmunition.forEach((ammo) => {
            const name = ammo.name;
            const ammoInfo = {
                name: ammo.name,
                value: ammo.name,
                count: ammo.system.quantity,
                equipped: ammo.system.equipped,
            };
            if (loadoutCounts[name]) {
                ammoInfo.count = ammo.system.quantity + loadoutCounts[name];
                ammo.update({
                    'system.quantity': ammoInfo.count,
                });
            }
            availableAmmunition.push(ammoInfo);
        });
        return availableAmmunition;
    }
    async chooseAmmunition(ammoOptions, currentLoadout) {
        const dialogContent = await foundry.applications.handlebars.renderTemplate('modules/fvtt-weapon-reload/templates/ammoSelectionDialogTemplate.hbs', {
            loadoutSlots: new Array(parseInt(this.weapon.system.uses.max)).fill('Empty'),
            ammoOptions,
        });
        const dialogButtons = [
            {
                action: 'load',
                label: this.translate('WEAPON_RELOAD.Features.Reload.Ammunition.ChoiceDialogButtonTxtLoad'),
                callback: (_event, button) => {
                    this._handleChoiceDialogClose = false;
                    const loadout = [];
                    for (let i = 0; i < button.form.elements.length; i++) {
                        const elm = button.form.elements.item(i);
                        if (elm.name == 'ammo-select') {
                            loadout.push(elm.value);
                        }
                    }
                    return loadout;
                },
            },
            {
                action: 'cancel',
                label: this.translate('WEAPON_RELOAD.Features.Reload.Ammunition.ChoiceDialogButtonTxtCancel'),
                callback: () => {
                    this._handleChoiceDialogClose = false;
                    return currentLoadout;
                },
            },
        ];
        this._handleChoiceDialogClose = true;
        this._hookId = Hooks.on('closeDialogV2', (dialogV2) => {
            if (dialogV2.id === 'ammo-choice-dialog') {
                this.onCloseChoiceDialog(currentLoadout);
            }
        });
        this.moduleManager.uiManager
            .buildDialog({
            title: this.translate('WEAPON_RELOAD.Features.Reload.Ammunition.ChoiceDialogTitle'),
            content: dialogContent,
            buttons: dialogButtons,
            onSubmit: this.reloadReloadableWeapon.bind(this),
        }, 'ammo-choice-dialog')
            .render({ force: true });
    }
    onCloseChoiceDialog(loadout) {
        Hooks.off('closeDialogV2', this._hookId);
        this._hookId = -1;
        if (this._handleChoiceDialogClose) {
            this._handleChoiceDialogClose = false;
            this.reloadReloadableWeapon(loadout);
        }
    }
    async reloadReloadableWeapon(loadout) {
        const reloadableWeapon = this.weapon;
        const ammoCounts = this.getLoadoutCounts(loadout);
        if (this.removeLoadout(ammoCounts)) {
            let qty = 0;
            if (ammoCounts['Empty'] > 0) {
                qty += ammoCounts['Empty'];
            }
            await reloadableWeapon.update({
                'system.uses.spent': qty,
                'system.uses.value': parseInt(reloadableWeapon.system.uses.max) - qty,
            });
            await reloadableWeapon.setFlag(this.moduleManager.id, 'chambered', loadout);
            await reloadableWeapon.setFlag(this.moduleManager.id, 'fired', new Array(parseInt(this.weapon.system.uses.max)).fill('Empty'));
            const htmlTemplate = await foundry.applications.handlebars.renderTemplate('modules/fvtt-weapon-reload/templates/reloadableWeaponReloadTemplate.hbs', {
                item: {
                    img: reloadableWeapon.img,
                    name: reloadableWeapon.name,
                },
                flavor: this.translate('WEAPON_RELOAD.Features.Reload.Weapon.WeaponReloadedChatFlavor'),
                title: this.translate('WEAPON_RELOAD.Features.Reload.Weapon.WeaponReloadedChatMsg', { reloadableWeapon: reloadableWeapon.name }, true),
                loadout: loadout,
            });
            this.moduleManager.uiManager.sendChat(this.character, htmlTemplate);
            this.characterId = '';
            this.weaponId = '';
        }
        else {
            await this.weaponReload(false);
        }
    }
    removeLoadout(counts) {
        let ammunitionAvailable = true;
        const inventoryAmmunition = this.ammunition(this.character?.items);
        inventoryAmmunition.forEach((ammo) => {
            const name = ammo.name;
            const qty = ammo.system.quantity - counts[name];
            if (qty < 0) {
                this.moduleManager.uiManager.uiNotification(this.translate('WEAPON_RELOAD.Features.Reload.Weapon.LoadingErrorMsg', { name: ammo.name }, true), 'error');
                ammunitionAvailable = false;
            }
        });
        if (ammunitionAvailable) {
            inventoryAmmunition.forEach(async (ammo) => {
                const name = ammo.name;
                if (counts[name]) {
                    await ammo.update({
                        'system.quantity': ammo.system.quantity - counts[name],
                    });
                }
            });
        }
        return ammunitionAvailable;
    }
    async onReloadCallback(actor, weapon) {
        this.characterId = actor.id;
        this.weaponId = weapon.id;
        this.weaponReload();
    }
    getLoadoutCounts(currentLoadout) {
        const loadout = {};
        currentLoadout.forEach((ammo) => {
            if (!loadout[ammo])
                loadout[ammo] = 0;
            loadout[ammo] = loadout[ammo] + 1;
        });
        return loadout;
    }
    toString() {
        return 'class ReloadFeature';
    }
}


/***/ }),

/***/ "./src/module/features/ReloadableWeaponAttackFeature.ts":
/*!**************************************************************!*\
  !*** ./src/module/features/ReloadableWeaponAttackFeature.ts ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ReloadableWeaponAttackFeature: () => (/* binding */ ReloadableWeaponAttackFeature)
/* harmony export */ });
/* harmony import */ var _BaseFeature__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./BaseFeature */ "./src/module/features/BaseFeature.ts");

class ReloadableWeaponAttackFeature extends _BaseFeature__WEBPACK_IMPORTED_MODULE_0__["default"] {
    _nextRound;
    _hookId;
    constructor(featureManager) {
        super(featureManager);
        this._nextRound = { id: '', type: '' };
        this._hookId = -1;
    }
    init() {
        Hooks.on('dnd5e.postRollConfiguration', this.onUseActivity.bind(this));
    }
    async onUseActivity(d20Roll, event) {
        const roll = d20Roll[0];
        const weaponData = roll?.data?.item;
        if (weaponData?.type?.baseItem !== 'reloadableWeapon')
            return;
        console.log('Weapon Reload | Triggered Attack');
        this.weaponId = event.subject.item.id;
        this.characterId = event.subject.actor.id;
        return await this.reloadableWeaponAttack();
    }
    async reloadableWeaponAttack() {
        const bullet = await this.getNextRound();
        if (bullet.name == 'Empty') {
            await this.dryfireWeapon();
            return false;
        }
        this._nextRound = {
            id: bullet.id,
            type: bullet.type,
        };
        this._hookId = Hooks.on('dnd5e.renderChatMessage', this.onRenderChatMessage.bind(this));
        return await this.fireRound(bullet);
    }
    async onRenderChatMessage(message, html) {
        const itemId = message.flags.dnd5e?.item.id;
        const itemType = message.flags.dnd5e?.item.type;
        if (this._nextRound.id === itemId &&
            this._nextRound.type === itemType) {
            Hooks.off('dnd5e.renderChatMessage', this._hookId);
            this._nextRound = { id: '', type: '' };
            const bullet = this.character.items.get(itemId);
            const activationCard = html.querySelector('.activation-card');
            const itemcard = html.querySelector('.item-card');
            const parentElement = activationCard || itemcard;
            const checkUnstableAmmo = game.settings.get(this.moduleManager.id, 'unstableAmmo');
            const checkMisfire = game.settings.get(this.moduleManager.id, 'useMisfires');
            const unstableAmmoFailureThreshold = game.settings.get(this.moduleManager.id, 'unstableAmmoFailureThreshhold');
            if (checkMisfire) {
                const criticalFailureMsg = checkUnstableAmmo &&
                    bullet?.system.properties.find((prop) => {
                        return prop === 'unstable';
                    })
                    ? this.translate('WEAPON_RELOAD.Features.ReloadableWeaponAttack.MisfireUnstable', { failure: `${unstableAmmoFailureThreshold}` }, true)
                    : this.translate('WEAPON_RELOAD.Features.ReloadableWeaponAttack.MisfireNatOne');
                const cardContentElement = parentElement.querySelector('.card-content');
                const wrapperElement = cardContentElement.querySelector('.wrapper');
                wrapperElement.insertAdjacentHTML('beforeend', `<p>${criticalFailureMsg}</p>`);
            }
            if (itemcard && !activationCard) {
                const referenceElement = parentElement.querySelector('.card-header');
                const buttonContainer = document.createElement('div');
                buttonContainer.className = 'card-buttons';
                referenceElement.after(buttonContainer);
            }
            const cardButtonsElement = parentElement.querySelector('.card-buttons');
            if (checkMisfire) {
                const misfireBtn = document.createElement('button');
                misfireBtn.onclick = this.onClickMisfire.bind(this);
                misfireBtn.innerHTML = `${this.makeIcon('fa-burst')}${this.translate('WEAPON_RELOAD.Features.ReloadableWeaponAttack.MisfiredBtnTxt')}`;
                cardButtonsElement.append(misfireBtn);
            }
            const refundBtn = document.createElement('button');
            refundBtn.onclick = this.onClickRefund.bind(this);
            refundBtn.innerHTML = `${this.makeIcon('fa-undo')}${this.translate('WEAPON_RELOAD.Features.ReloadableWeaponAttack.RefundBtnTxt')}`;
            cardButtonsElement.append(refundBtn);
        }
    }
    async getNextRound() {
        const character = this.character;
        const weapon = this.weapon;
        const loadout = this.loadout;
        loadout.push('Empty');
        const nextRound = loadout.shift();
        await weapon.setFlag(this.moduleManager.id, 'chambered', loadout);
        const inventoryAmmunition = this.ammunition(character.items);
        return (inventoryAmmunition.find((ammo) => {
            const name = ammo.name;
            if (name == nextRound) {
                return ammo;
            }
            return null;
        }) || { name: 'Empty' });
    }
    async dryfireWeapon() {
        const character = this.character;
        const weapon = this.weapon;
        const renderHookId = Hooks.on('renderChatMessage', (_chatItem, html) => {
            const reloadBtn = html[0].querySelector('.reload-ammo');
            reloadBtn?.addEventListener('click', () => {
                this.reload(character, weapon);
            });
            if (reloadBtn) {
                Hooks.off('renderChatMessage', renderHookId);
            }
        });
        const templateData = {
            description: {
                chat: `<p>${this.translate('WEAPON_RELOAD.Features.ReloadableWeaponAttack.DryFireDescription', { name: character.name, reloadableWeapon: weapon.name }, true)}</p>`,
            },
            item: {
                img: weapon.img,
                name: this.translate('WEAPON_RELOAD.Features.ReloadableWeaponAttack.DryFireTitle'),
            },
            subtitle: weapon.name,
            buttons: [
                {
                    dataset: {
                        visibility: 'all',
                    },
                    icon: this.makeIcon('fa-rotate-right'),
                    label: this.translate('WEAPON_RELOAD.Features.Reload.Text'),
                    classes: 'reload-ammo',
                },
            ],
        };
        const htmlTemplate = await foundry.applications.handlebars.renderTemplate('modules/fvtt-weapon-reload/templates/overrides/activity-card.hbs', templateData);
        this.moduleManager.uiManager.sendChat(character, htmlTemplate);
    }
    async fireRound(bullet) {
        const reloadableWeapon = this.weapon;
        const maxShots = parseInt(reloadableWeapon.system.uses.max);
        const firedLoadout = reloadableWeapon.getFlag(this.moduleManager.id, 'fired') || new Array(maxShots).fill('Empty');
        firedLoadout.unshift(bullet.name);
        firedLoadout.splice(-1);
        await reloadableWeapon.setFlag(this.moduleManager.id, 'fired', firedLoadout);
        const uses = reloadableWeapon.system.uses;
        const qty = uses.spent + 1 <= parseInt(uses.max)
            ? uses.spent + 1
            : parseInt(uses.max);
        await reloadableWeapon.update({
            'system.uses.spent': qty,
            'system.uses.value': parseInt(uses.max) - qty,
        });
        return bullet.use();
    }
    reload(actor, reloadableWeapon) {
        this.featureManager
            .getFeature('reload')
            .onReloadCallback(actor, reloadableWeapon);
    }
    async onClickRefund() {
        const actor = this.character;
        const reloadableWeapon = this.weapon;
        const inventoryAmmunition = this.ammunition(actor.items);
        const fired = this.fired;
        const refund = fired.splice(0, 1)[0];
        fired.push('Empty');
        if (refund == 'Empty') {
            this.moduleManager.uiManager.uiNotification(this.translate('WEAPON_RELOAD.Features.ReloadableWeaponAttack.Refund.RefundNoMoreMsg', {
                name: actor.name,
                reloadableWeapon: reloadableWeapon.name,
            }, true), 'warn');
            return;
        }
        await reloadableWeapon.setFlag(this.moduleManager.id, 'fired', fired);
        let bullet = { name: refund };
        inventoryAmmunition.forEach((ammo) => {
            const name = ammo.name;
            if (name == refund) {
                bullet = ammo;
            }
        });
        const ammoLoadout = this.loadout;
        ammoLoadout.unshift(refund);
        ammoLoadout.splice(-1);
        await reloadableWeapon.setFlag(this.moduleManager.id, 'chambered', ammoLoadout);
        const uses = reloadableWeapon.system.uses;
        const qty = uses.spent - 1 >= 0 ? uses.spent - 1 : 0;
        reloadableWeapon.update({
            'system.uses.spent': qty,
            'system.uses.value': parseInt(uses.max) - qty,
        });
        const htmlTemplate = await foundry.applications.handlebars.renderTemplate('modules/fvtt-weapon-reload/templates/ammoRefundNoticeTemplate.hbs', {
            item: {
                img: bullet.img,
                name: bullet.name,
            },
            description: this.translate('WEAPON_RELOAD.Features.ReloadableWeaponAttack.Refund.RefundCompleteMsg', { bullet: refund, name: reloadableWeapon.name }, true),
            title: this.translate('WEAPON_RELOAD.Features.ReloadableWeaponAttack.Refund.RefundCompleteTitle'),
        });
        this.moduleManager.uiManager.sendChat(actor, htmlTemplate);
    }
    async onClickMisfire() {
        const actor = this.character;
        const roll = await new Roll('1d6').roll();
        await roll.toMessage({
            speaker: {
                alias: actor.name,
            },
        });
    }
    makeIcon(icon) {
        return `<i class="fas ${icon}"></i>`;
    }
    toString() {
        return 'class ReloadableWeaponAttackFeature';
    }
}


/***/ }),

/***/ "./src/module/features/ReloadableWeaponCreationFeature.ts":
/*!****************************************************************!*\
  !*** ./src/module/features/ReloadableWeaponCreationFeature.ts ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ReloadableWeaponCreationFeature: () => (/* binding */ ReloadableWeaponCreationFeature)
/* harmony export */ });
/* harmony import */ var _BaseFeature__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./BaseFeature */ "./src/module/features/BaseFeature.ts");

class ReloadableWeaponCreationFeature extends _BaseFeature__WEBPACK_IMPORTED_MODULE_0__["default"] {
    _creatingReloadableWeapon;
    _createItemHookId;
    constructor(featureManager) {
        super(featureManager);
        this._creatingReloadableWeapon = false;
        this._createItemHookId = -1;
    }
    init() {
        Hooks.on('preCreateItem', this.onPreCreateItem.bind(this));
    }
    async onPreCreateItem(item) {
        if (item.system.type.baseItem == 'reloadableWeapon') {
            console.log('Weapon Reload | Triggered Pre-Creation');
            this.weaponId = item.id;
            this.characterId = item.actor?.id;
            this._creatingReloadableWeapon = true;
            this._createItemHookId = Hooks.on('createItem', this.onCreateItem.bind(this));
        }
    }
    async onCreateItem(item) {
        if (!this._creatingReloadableWeapon || item.id !== this.weaponId)
            return;
        console.log('Weapon Reload | Triggered ReloadableWeapon Creation');
        const reloadableWeapon = this.weapon;
        const ammoQty = parseInt(reloadableWeapon.system.uses.max);
        await reloadableWeapon.update({
            'system.uses.spent': ammoQty,
            'system.uses.value': 0,
        });
        await reloadableWeapon.setFlag(this.moduleManager.id, 'chambered', new Array(ammoQty).fill('Empty'));
        await reloadableWeapon.setFlag(this.moduleManager.id, 'fired', new Array(ammoQty).fill('Empty'));
        this.weaponId = '';
        this.characterId = '';
        this._creatingReloadableWeapon = false;
        Hooks.off('createItem', this._createItemHookId);
        this._createItemHookId = -1;
    }
    toString() {
        return 'class ReloadableWeaponCreationFeature';
    }
}


/***/ }),

/***/ "./src/module/features/index.ts":
/*!**************************************!*\
  !*** ./src/module/features/index.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ReloadFeature: () => (/* reexport safe */ _ReloadFeature__WEBPACK_IMPORTED_MODULE_2__.ReloadFeature),
/* harmony export */   ReloadableWeaponAttackFeature: () => (/* reexport safe */ _ReloadableWeaponAttackFeature__WEBPACK_IMPORTED_MODULE_0__.ReloadableWeaponAttackFeature),
/* harmony export */   ReloadableWeaponCreationFeature: () => (/* reexport safe */ _ReloadableWeaponCreationFeature__WEBPACK_IMPORTED_MODULE_1__.ReloadableWeaponCreationFeature)
/* harmony export */ });
/* harmony import */ var _ReloadableWeaponAttackFeature__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ReloadableWeaponAttackFeature */ "./src/module/features/ReloadableWeaponAttackFeature.ts");
/* harmony import */ var _ReloadableWeaponCreationFeature__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ReloadableWeaponCreationFeature */ "./src/module/features/ReloadableWeaponCreationFeature.ts");
/* harmony import */ var _ReloadFeature__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./ReloadFeature */ "./src/module/features/ReloadFeature.ts");





/***/ }),

/***/ "./src/module/managers/FeatureManager.ts":
/*!***********************************************!*\
  !*** ./src/module/managers/FeatureManager.ts ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ FeatureManager)
/* harmony export */ });
/* harmony import */ var _features__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../features */ "./src/module/features/index.ts");

class FeatureManager {
    _moduleManager;
    _features;
    constructor(moduleManager) {
        this._moduleManager = moduleManager;
        this._features = {};
    }
    init() {
        this._features = {
            reload: new _features__WEBPACK_IMPORTED_MODULE_0__.ReloadFeature(this),
            reloadableWeaponAttack: new _features__WEBPACK_IMPORTED_MODULE_0__.ReloadableWeaponAttackFeature(this),
            reloadableWeaponCreation: new _features__WEBPACK_IMPORTED_MODULE_0__.ReloadableWeaponCreationFeature(this),
        };
    }
    getFeature(id) {
        if (this._features[id]) {
            return this._features[id];
        }
        return null;
    }
    get moduleManager() {
        return this._moduleManager;
    }
    toString() {
        return `class FeatureManager: ${this._features.length}`;
    }
}


/***/ }),

/***/ "./src/module/managers/ModuleManager.ts":
/*!**********************************************!*\
  !*** ./src/module/managers/ModuleManager.ts ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ ModuleManager)
/* harmony export */ });
/* harmony import */ var _FeatureManager__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./FeatureManager */ "./src/module/managers/FeatureManager.ts");
/* harmony import */ var _UiManager__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./UiManager */ "./src/module/managers/UiManager.ts");
/* harmony import */ var _TemplateManager__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./TemplateManager */ "./src/module/managers/TemplateManager.ts");



class ModuleManager {
    _moduleId;
    _featureManager;
    _uiManager;
    _templateManager;
    constructor(id) {
        this._moduleId = id;
        this._featureManager = new _FeatureManager__WEBPACK_IMPORTED_MODULE_0__["default"](this);
        this._uiManager = new _UiManager__WEBPACK_IMPORTED_MODULE_1__["default"](this);
        this._templateManager = new _TemplateManager__WEBPACK_IMPORTED_MODULE_2__["default"]();
    }
    get id() {
        return this._moduleId;
    }
    get featureManager() {
        return this._featureManager;
    }
    get uiManager() {
        return this._uiManager;
    }
    get templateManager() {
        return this._templateManager;
    }
    init() {
        this.systemOverrides();
        this.moduleConfigurations();
        this._featureManager.init();
        this._uiManager.init();
        this._templateManager.init();
    }
    systemOverrides() {
        CONFIG.DND5E.featureTypes.item = {
            label: this.uiManager.getLocalizedTxt('WEAPON_RELOAD.ItemFeature'),
        };
        CONFIG.DND5E.itemProperties.concealable = {
            label: this.uiManager.getLocalizedTxt('WEAPON_RELOAD.Concealable'),
        };
        CONFIG.DND5E.validProperties.weapon.add('concealable');
        CONFIG.DND5E.itemProperties.unstable = {
            label: this.uiManager.getLocalizedTxt('WEAPON_RELOAD.Unstable'),
            isPhysical: true,
        };
        CONFIG.DND5E.weaponIds.reloadableWeapon =
            'Compendium.fvtt-weapon-reload.item-pack.Item.lE60QaS1sctb3OAd';
    }
    moduleConfigurations() {
        const moduleName = 'fvtt-weapon-reload';
        game.settings.register(moduleName, 'unstableAmmo', {
            scope: 'world',
            name: 'SETTINGS.WEAPON_RELOAD.UnstableAmmo.Name',
            hint: 'SETTINGS.WEAPON_RELOAD.UnstableAmmo.Hint',
            type: Boolean,
            config: true,
            default: true,
        });
        game.settings.register(moduleName, 'unstableAmmoFailureThreshhold', {
            scope: 'world',
            name: 'SETTINGS.WEAPON_RELOAD.UnstableAmmoFailureThreshold.Name',
            hint: 'SETTINGS.WEAPON_RELOAD.UnstableAmmoFailureThreshold.Hint',
            type: Number,
            config: true,
            default: 2,
        });
        game.settings.register(moduleName, 'useMisfires', {
            scope: 'world',
            name: 'SETTINGS.WEAPON_RELOAD.UseMisfires.Name',
            hint: 'SETTINGS.WEAPON_RELOAD.UseMisfires.Hint',
            type: Boolean,
            config: true,
            default: true,
        });
        game.settings.register(moduleName, 'filterAmmunitionByEquipped', {
            scope: 'user',
            name: 'SETTINGS.WEAPON_RELOAD.FilterAmmunitionByEquipped.Name',
            hint: 'SETTINGS.WEAPON_RELOAD.FilterAmmunitionByEquipped.Hint',
            type: Boolean,
            config: true,
            default: false,
        });
    }
    debug(hooks = false) {
        CONFIG.debug.hooks = hooks;
        console.log('CONFIG: ', CONFIG);
        console.log('CONFIG.DND5E: ', CONFIG.DND5E);
    }
    toString() {
        return 'class ModuleManager';
    }
}


/***/ }),

/***/ "./src/module/managers/TemplateManager.ts":
/*!************************************************!*\
  !*** ./src/module/managers/TemplateManager.ts ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ TemplateManager)
/* harmony export */ });
class TemplateManager {
    constructor() { }
    init() {
        foundry.applications.handlebars.loadTemplates(TemplateManager.paths);
    }
    static get paths() {
        const paths = {};
        const templatePaths = 'modules/fvtt-weapon-reload/templates/reloadableWeaponReloadTemplate.hbs,modules/fvtt-weapon-reload/templates/basicMessage.hbs,modules/fvtt-weapon-reload/templates/ammoSelectionDialogTemplate.hbs,modules/fvtt-weapon-reload/templates/ammoRefundNoticeTemplate.hbs,modules/fvtt-weapon-reload/templates/activity-card.hbs'.split(',');
        for (const path of templatePaths) {
            paths[path.replace('.hbs', '.html')] = path;
        }
        return paths;
    }
    static onHotReload() {
        for (const template in _templateCache) {
            if (Object.prototype.hasOwnProperty.call(_templateCache, template)) {
                delete _templateCache[template];
            }
        }
        foundry.applications.handlebars
            .loadTemplates(this.paths)
            .then(() => {
            for (const application in ui.windows) {
                if (Object.prototype.hasOwnProperty.call(ui.windows, application)) {
                    ui.windows[application].render(true);
                }
            }
        });
    }
    toString() {
        return 'class TemplateManager';
    }
}


/***/ }),

/***/ "./src/module/managers/UiManager.ts":
/*!******************************************!*\
  !*** ./src/module/managers/UiManager.ts ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ UiManager)
/* harmony export */ });
class UiManager {
    _moduleManager;
    constructor(moduleManager) {
        this._moduleManager = moduleManager;
    }
    init() {
    }
    get moduleManager() {
        return this._moduleManager;
    }
    buildDialog(options, id) {
        return new foundry.applications.api.DialogV2({
            window: {
                title: options.title,
                contentClasses: options.contentClasses || [],
            },
            content: options.content,
            buttons: options.buttons,
            submit: options.onSubmit,
            id: id,
        });
    }
    uiNotification(msg, type = 'info') {
        if (ui.notifications) {
            switch (type) {
                case 'error':
                    ui.notifications.error(msg);
                    break;
                case 'warn':
                    ui.notifications.warn(msg);
                    break;
                case 'info':
                default:
                    ui.notifications.info(msg);
            }
        }
    }
    sendChat(speaker, content, flavor, sound, type = CONST.CHAT_MESSAGE_TYPES.OOC) {
        const ChatData = {
            speaker: ChatMessage.getSpeaker({ actor: speaker }),
            type,
            flavor,
            sound,
            content,
        };
        ChatMessage.create(ChatData);
    }
    getLocalizedTxt(key, opts, format = false) {
        if (format) {
            return game.i18n.format(key, opts);
        }
        return game.i18n.localize(key, opts);
    }
    toString() {
        return 'class UiManager';
    }
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		__webpack_require__.p = "";
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other entry modules.
(() => {
var __webpack_exports__ = {};
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _module_managers_ModuleManager__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./module/managers/ModuleManager */ "./src/module/managers/ModuleManager.ts");
/* harmony import */ var _module_managers_TemplateManager__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./module/managers/TemplateManager */ "./src/module/managers/TemplateManager.ts");
/* harmony import */ var _module_json__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../module.json */ "./module.json");



Hooks.once('init', async () => {
    console.log('Eberron West | Foundry VTT Module');
    const weapon_reload = new _module_managers_ModuleManager__WEBPACK_IMPORTED_MODULE_0__["default"](_module_json__WEBPACK_IMPORTED_MODULE_2__.id);
    weapon_reload.debug(true);
    weapon_reload.init();
});
if (true) {
    if (false) // removed by dead control flow
{}
}

})();

// This entry needs to be wrapped in an IIFE because it needs to be isolated against other entry modules.
(() => {
/*!********************************!*\
  !*** ./src/styles/module.scss ***!
  \********************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "styles/module.css");
})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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T0FBUSxJQUFZLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDbEQsQ0FBQztJQUVELFFBQVE7UUFDSixPQUFPLGlCQUFpQixDQUFDO0lBQzdCLENBQUM7Q0FDSjs7Ozs7OztVQzlFRDtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7OztXQ3RCQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLHlDQUF5Qyx3Q0FBd0M7V0FDakY7V0FDQTtXQUNBOzs7OztXQ1BBOzs7OztXQ0FBO1dBQ0E7V0FDQTtXQUNBLHVEQUF1RCxpQkFBaUI7V0FDeEU7V0FDQSxnREFBZ0QsYUFBYTtXQUM3RDs7Ozs7V0NOQTs7Ozs7Ozs7Ozs7Ozs7O0FDQTREO0FBQ0k7QUFFeEI7QUFFeEMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsS0FBSyxJQUFJLEVBQUU7SUFDMUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDO0lBRWpELE1BQU0sYUFBYSxHQUFHLElBQUksc0VBQWEsQ0FBQyw0Q0FBYSxDQUFDLENBQUM7SUFDdkQsYUFBYSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMxQixhQUFhLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDekIsQ0FBQyxDQUFDLENBQUM7QUFFSCxJQUFJLElBQXNDLEVBQUUsQ0FBQztJQUN6QyxJQUFJLEtBQVUsRUFBRTtBQUFBLEVBTWY7QUFDTCxDQUFDOzs7Ozs7Ozs7Ozs7O0FDckJELGlFQUFlLHFCQUF1QixzQkFBc0IsRSIsInNvdXJjZXMiOlsid2VicGFjazovL2Z2dHQtd2VhcG9uLXJlbG9hZC8uL3NyYy9tb2R1bGUvZmVhdHVyZXMvQmFzZUZlYXR1cmUudHMiLCJ3ZWJwYWNrOi8vZnZ0dC13ZWFwb24tcmVsb2FkLy4vc3JjL21vZHVsZS9mZWF0dXJlcy9SZWxvYWRGZWF0dXJlLnRzIiwid2VicGFjazovL2Z2dHQtd2VhcG9uLXJlbG9hZC8uL3NyYy9tb2R1bGUvZmVhdHVyZXMvUmVsb2FkYWJsZVdlYXBvbkF0dGFja0ZlYXR1cmUudHMiLCJ3ZWJwYWNrOi8vZnZ0dC13ZWFwb24tcmVsb2FkLy4vc3JjL21vZHVsZS9mZWF0dXJlcy9SZWxvYWRhYmxlV2VhcG9uQ3JlYXRpb25GZWF0dXJlLnRzIiwid2VicGFjazovL2Z2dHQtd2VhcG9uLXJlbG9hZC8uL3NyYy9tb2R1bGUvZmVhdHVyZXMvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vZnZ0dC13ZWFwb24tcmVsb2FkLy4vc3JjL21vZHVsZS9tYW5hZ2Vycy9GZWF0dXJlTWFuYWdlci50cyIsIndlYnBhY2s6Ly9mdnR0LXdlYXBvbi1yZWxvYWQvLi9zcmMvbW9kdWxlL21hbmFnZXJzL01vZHVsZU1hbmFnZXIudHMiLCJ3ZWJwYWNrOi8vZnZ0dC13ZWFwb24tcmVsb2FkLy4vc3JjL21vZHVsZS9tYW5hZ2Vycy9UZW1wbGF0ZU1hbmFnZXIudHMiLCJ3ZWJwYWNrOi8vZnZ0dC13ZWFwb24tcmVsb2FkLy4vc3JjL21vZHVsZS9tYW5hZ2Vycy9VaU1hbmFnZXIudHMiLCJ3ZWJwYWNrOi8vZnZ0dC13ZWFwb24tcmVsb2FkL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2Z2dHQtd2VhcG9uLXJlbG9hZC93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vZnZ0dC13ZWFwb24tcmVsb2FkL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vZnZ0dC13ZWFwb24tcmVsb2FkL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vZnZ0dC13ZWFwb24tcmVsb2FkL3dlYnBhY2svcnVudGltZS9wdWJsaWNQYXRoIiwid2VicGFjazovL2Z2dHQtd2VhcG9uLXJlbG9hZC8uL3NyYy9pbmRleC50cyIsIndlYnBhY2s6Ly9mdnR0LXdlYXBvbi1yZWxvYWQvLi9zcmMvc3R5bGVzL21vZHVsZS5zY3NzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBGZWF0dXJlTWFuYWdlciBmcm9tICcuLi9tYW5hZ2Vycy9GZWF0dXJlTWFuYWdlcic7XG5cbmltcG9ydCB7IERuZEFjdG9yNWUsIERuZEl0ZW01ZSB9IGZyb20gJy4uL3R5cGVzL2RuZC50eXBlcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJhc2VGZWF0dXJlIHtcbiAgICBwcml2YXRlIF9mZWF0dXJlTWFuYWdlcjogRmVhdHVyZU1hbmFnZXI7XG4gICAgcHJpdmF0ZSBfYWN0b3JJZDogc3RyaW5nO1xuICAgIHByaXZhdGUgX3dlYXBvbklkOiBzdHJpbmc7XG5cbiAgICBjb25zdHJ1Y3RvcihmZWF0dXJlTWFuYWdlcjogRmVhdHVyZU1hbmFnZXIpIHtcbiAgICAgICAgdGhpcy5fZmVhdHVyZU1hbmFnZXIgPSBmZWF0dXJlTWFuYWdlcjtcbiAgICAgICAgdGhpcy5fYWN0b3JJZCA9ICcnO1xuICAgICAgICB0aGlzLl93ZWFwb25JZCA9ICcnO1xuICAgICAgICB0aGlzLmluaXQoKTtcbiAgICB9XG5cbiAgICBnZXQgZmVhdHVyZU1hbmFnZXIoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9mZWF0dXJlTWFuYWdlcjtcbiAgICB9XG5cbiAgICBnZXQgbW9kdWxlTWFuYWdlcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ZlYXR1cmVNYW5hZ2VyLm1vZHVsZU1hbmFnZXI7XG4gICAgfVxuXG4gICAgZ2V0IGNoYXJhY3RlcigpOiBEbmRBY3RvcjVlIHtcbiAgICAgICAgcmV0dXJuIGdhbWU/LmFjdG9ycz8uZ2V0KHRoaXMuX2FjdG9ySWQpIGFzIERuZEFjdG9yNWU7XG4gICAgfVxuXG4gICAgZ2V0IGNoYXJhY3RlcklkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWN0b3JJZDtcbiAgICB9XG5cbiAgICBzZXQgY2hhcmFjdGVySWQoaWQ6IHN0cmluZykge1xuICAgICAgICB0aGlzLl9hY3RvcklkID0gaWQ7XG4gICAgfVxuXG4gICAgZ2V0IHdlYXBvbigpOiBEbmRJdGVtNWUge1xuICAgICAgICByZXR1cm4gdGhpcy5jaGFyYWN0ZXIuaXRlbXMuZ2V0KHRoaXMuX3dlYXBvbklkKSBhcyBEbmRJdGVtNWU7XG4gICAgfVxuXG4gICAgZ2V0IHdlYXBvbklkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fd2VhcG9uSWQ7XG4gICAgfVxuXG4gICAgc2V0IHdlYXBvbklkKGlkOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5fd2VhcG9uSWQgPSBpZDtcbiAgICB9XG5cbiAgICBnZXQgbG9hZG91dCgpIHtcbiAgICAgICAgY29uc3QgcmVsb2FkYWJsZVdlYXBvbiA9IHRoaXMud2VhcG9uO1xuICAgICAgICBjb25zdCBtYXhTaG90cyA9IHBhcnNlSW50KHJlbG9hZGFibGVXZWFwb24uc3lzdGVtLnVzZXMubWF4KTtcbiAgICAgICAgY29uc3QgY3VycmVudExvYWRvdXQgPVxuICAgICAgICAgICAgKHJlbG9hZGFibGVXZWFwb24uZ2V0RmxhZyhcbiAgICAgICAgICAgICAgICB0aGlzLm1vZHVsZU1hbmFnZXIuaWQsXG4gICAgICAgICAgICAgICAgJ2NoYW1iZXJlZCdcbiAgICAgICAgICAgICkgYXMgc3RyaW5nW10pIHx8IG5ldyBBcnJheShtYXhTaG90cykuZmlsbCgnRW1wdHknKTtcblxuICAgICAgICBpZiAoY3VycmVudExvYWRvdXQubGVuZ3RoIDwgbWF4U2hvdHMpIHtcbiAgICAgICAgICAgIGNvbnN0IG1pc3NpbmcgPSBtYXhTaG90cyAtIGN1cnJlbnRMb2Fkb3V0Lmxlbmd0aDtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbWlzc2luZzsgaSsrKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudExvYWRvdXQucHVzaCgnRW1wdHknKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBjdXJyZW50TG9hZG91dDtcbiAgICB9XG5cbiAgICBnZXQgZmlyZWQoKSB7XG4gICAgICAgIGNvbnN0IHJlbG9hZGFibGVXZWFwb24gPSB0aGlzLndlYXBvbjtcbiAgICAgICAgY29uc3QgbWF4U2hvdHMgPSBwYXJzZUludChyZWxvYWRhYmxlV2VhcG9uLnN5c3RlbS51c2VzLm1heCk7XG4gICAgICAgIGNvbnN0IGZpcmVkID1cbiAgICAgICAgICAgIChyZWxvYWRhYmxlV2VhcG9uLmdldEZsYWcoXG4gICAgICAgICAgICAgICAgdGhpcy5tb2R1bGVNYW5hZ2VyLmlkLFxuICAgICAgICAgICAgICAgICdmaXJlZCdcbiAgICAgICAgICAgICkgYXMgc3RyaW5nW10pIHx8IG5ldyBBcnJheShtYXhTaG90cykuZmlsbCgnRW1wdHknKTtcblxuICAgICAgICBpZiAoZmlyZWQubGVuZ3RoIDwgbWF4U2hvdHMpIHtcbiAgICAgICAgICAgIGNvbnN0IG1pc3NpbmcgPSBtYXhTaG90cyAtIGZpcmVkLmxlbmd0aDtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbWlzc2luZzsgaSsrKSB7XG4gICAgICAgICAgICAgICAgZmlyZWQucHVzaCgnRW1wdHknKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmaXJlZDtcbiAgICB9XG5cbiAgICBhbW11bml0aW9uKGl0ZW1zOiBDb2xsZWN0aW9uPEl0ZW01ZT4sIGVxdWlwcGVkOiBib29sZWFuID0gZmFsc2UpOiBJdGVtNWVbXSB7XG4gICAgICAgIHJldHVybiBpdGVtcy5maWx0ZXIoKGl0ZW06IEl0ZW01ZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZ2FtZVN5c3RlbSA9IChpdGVtIGFzIERuZEl0ZW01ZSkuc3lzdGVtO1xuICAgICAgICAgICAgaWYgKGVxdWlwcGVkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgICAgaXRlbS50eXBlID09ICdjb25zdW1hYmxlJyAmJlxuICAgICAgICAgICAgICAgICAgICBnYW1lU3lzdGVtLnR5cGUuc3VidHlwZSA9PSAnZmlyZWFybUJ1bGxldCcgJiZcbiAgICAgICAgICAgICAgICAgICAgZ2FtZVN5c3RlbS5lcXVpcHBlZFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgIGl0ZW0udHlwZSA9PSAnY29uc3VtYWJsZScgJiZcbiAgICAgICAgICAgICAgICBnYW1lU3lzdGVtLnR5cGUuc3VidHlwZSA9PSAnZmlyZWFybUJ1bGxldCdcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGluaXQoKSB7fVxuXG4gICAgdHJhbnNsYXRlKGtleTogc3RyaW5nLCBvcHRzPzogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfSwgZm9ybWF0PzogYm9vbGVhbikge1xuICAgICAgICByZXR1cm4gdGhpcy5tb2R1bGVNYW5hZ2VyLnVpTWFuYWdlci5nZXRMb2NhbGl6ZWRUeHQoa2V5LCBvcHRzLCBmb3JtYXQpO1xuICAgIH1cblxuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gJ2NsYXNzIEJhc2VGZWF0dXJlJztcbiAgICB9XG59XG4iLCJpbXBvcnQgRGlhbG9nVjIgZnJvbSAnQGxlYWd1ZS1vZi1mb3VuZHJ5LWRldmVsb3BlcnMvZm91bmRyeS12dHQtdHlwZXMvc3JjL2ZvdW5kcnkvY2xpZW50LWVzbS9hcHBsaWNhdGlvbnMvYXBpL2RpYWxvZy5tanMnO1xuaW1wb3J0IEZlYXR1cmVNYW5hZ2VyIGZyb20gJy4uL21hbmFnZXJzL0ZlYXR1cmVNYW5hZ2VyJztcbmltcG9ydCB7IERuZEFjdG9yNWUsIERuZEl0ZW01ZSB9IGZyb20gJy4uL3R5cGVzL2RuZC50eXBlcyc7XG5pbXBvcnQgQmFzZUZlYXR1cmUgZnJvbSAnLi9CYXNlRmVhdHVyZSc7XG5cbmludGVyZmFjZSBBbW1vSXRlbU9wdGlvbiB7XG4gICAgbmFtZTogc3RyaW5nO1xuICAgIHZhbHVlOiBzdHJpbmc7XG4gICAgY291bnQ6IG51bWJlcjtcbiAgICBlcXVpcHBlZDogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGNsYXNzIFJlbG9hZEZlYXR1cmUgZXh0ZW5kcyBCYXNlRmVhdHVyZSB7XG4gICAgcHJpdmF0ZSBfaG9va0lkOiBudW1iZXI7XG4gICAgcHJpdmF0ZSBfaGFuZGxlQ2hvaWNlRGlhbG9nQ2xvc2U6IGJvb2xlYW47XG5cbiAgICBjb25zdHJ1Y3RvcihmZWF0dXJlTWFuYWdlcjogRmVhdHVyZU1hbmFnZXIpIHtcbiAgICAgICAgc3VwZXIoZmVhdHVyZU1hbmFnZXIpO1xuICAgICAgICB0aGlzLl9ob29rSWQgPSAtMTtcbiAgICAgICAgdGhpcy5faGFuZGxlQ2hvaWNlRGlhbG9nQ2xvc2UgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBpbml0KCkge1xuICAgICAgICBIb29rcy5vbignZG5kNWUucG9zdFVzZUFjdGl2aXR5JywgdGhpcy5vblVzZUFjdGl2aXR5LmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIG9uVXNlQWN0aXZpdHkoYWN0aXZpdHk6IGFueSkge1xuICAgICAgICBpZiAoYWN0aXZpdHkudHlwZSA9PT0gJ3V0aWxpdHknICYmIGFjdGl2aXR5Lm5hbWUgPT0gJ1JlbG9hZCcpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdXZWFwb24gUmVsb2FkIHwgVHJpZ2dlcmVkIFJlbG9hZCcpO1xuXG4gICAgICAgICAgICB0aGlzLmNoYXJhY3RlcklkID0gYWN0aXZpdHkuYWN0b3IuaWQ7XG4gICAgICAgICAgICB0aGlzLndlYXBvbklkID0gYWN0aXZpdHkuaXRlbS5pZDtcbiAgICAgICAgICAgIHRoaXMud2VhcG9uUmVsb2FkKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB3ZWFwb25SZWxvYWQocmVmdW5kQW1tbzogYm9vbGVhbiA9IHRydWUpIHtcbiAgICAgICAgY29uc3QgaXRlbXMgPSB0aGlzLmNoYXJhY3Rlcj8uaXRlbXM7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRMb2Fkb3V0ID0gdGhpcy5sb2Fkb3V0O1xuICAgICAgICBjb25zdCBpbnZlbnRvcnlBbW11bml0aW9uID0gdGhpcy5hbW11bml0aW9uKGl0ZW1zKSBhcyBEbmRJdGVtNWVbXTtcbiAgICAgICAgbGV0IGFtbXVuaXRpb25DaG9pY2VzOiBBbW1vSXRlbU9wdGlvbltdID0gW107XG5cbiAgICAgICAgaWYgKHJlZnVuZEFtbW8pIHtcbiAgICAgICAgICAgIGFtbXVuaXRpb25DaG9pY2VzID0gdGhpcy5yZWZ1bmRDaGFtYmVyZWRBbW1vKGludmVudG9yeUFtbXVuaXRpb24pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYW1tdW5pdGlvbkNob2ljZXMgPSBpbnZlbnRvcnlBbW11bml0aW9uLm1hcChcbiAgICAgICAgICAgICAgICAoYW1tbzogRG5kSXRlbTVlKTogQW1tb0l0ZW1PcHRpb24gPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogYW1tby5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGFtbW8ubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50OiBhbW1vLnN5c3RlbS5xdWFudGl0eSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVxdWlwcGVkOiBhbW1vLnN5c3RlbS5lcXVpcHBlZCxcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgY2hlY2tFcXVpcHBlZCA9IGdhbWUuc2V0dGluZ3MuZ2V0KFxuICAgICAgICAgICAgdGhpcy5tb2R1bGVNYW5hZ2VyLmlkLFxuICAgICAgICAgICAgJ2ZpbHRlckFtbXVuaXRpb25CeUVxdWlwcGVkJ1xuICAgICAgICApIGFzIGJvb2xlYW47XG5cbiAgICAgICAgdGhpcy5jaG9vc2VBbW11bml0aW9uKFxuICAgICAgICAgICAgYW1tdW5pdGlvbkNob2ljZXMuZmlsdGVyKChhbW1vSXRlbTogQW1tb0l0ZW1PcHRpb24pID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoYW1tb0l0ZW0uY291bnQgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgIChjaGVja0VxdWlwcGVkICYmIGFtbW9JdGVtLmVxdWlwcGVkKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgIWNoZWNrRXF1aXBwZWRcbiAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIGN1cnJlbnRMb2Fkb3V0XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcmVmdW5kQ2hhbWJlcmVkQW1tbyhpbnZlbnRvcnlBbW11bml0aW9uOiBEbmRJdGVtNWVbXSk6IEFtbW9JdGVtT3B0aW9uW10ge1xuICAgICAgICBjb25zdCBsb2Fkb3V0Q291bnRzID0gdGhpcy5nZXRMb2Fkb3V0Q291bnRzKHRoaXMubG9hZG91dCk7XG4gICAgICAgIGNvbnN0IGF2YWlsYWJsZUFtbXVuaXRpb246IEFtbW9JdGVtT3B0aW9uW10gPSBbXTtcbiAgICAgICAgaW52ZW50b3J5QW1tdW5pdGlvbi5mb3JFYWNoKChhbW1vOiBEbmRJdGVtNWUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5hbWUgPSBhbW1vLm5hbWU7XG4gICAgICAgICAgICBjb25zdCBhbW1vSW5mbzogQW1tb0l0ZW1PcHRpb24gPSB7XG4gICAgICAgICAgICAgICAgbmFtZTogYW1tby5uYW1lLFxuICAgICAgICAgICAgICAgIHZhbHVlOiBhbW1vLm5hbWUsXG4gICAgICAgICAgICAgICAgY291bnQ6IGFtbW8uc3lzdGVtLnF1YW50aXR5LFxuICAgICAgICAgICAgICAgIGVxdWlwcGVkOiBhbW1vLnN5c3RlbS5lcXVpcHBlZCxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpZiAobG9hZG91dENvdW50c1tuYW1lXSkge1xuICAgICAgICAgICAgICAgIGFtbW9JbmZvLmNvdW50ID0gYW1tby5zeXN0ZW0ucXVhbnRpdHkgKyBsb2Fkb3V0Q291bnRzW25hbWVdO1xuICAgICAgICAgICAgICAgIGFtbW8udXBkYXRlKHtcbiAgICAgICAgICAgICAgICAgICAgJ3N5c3RlbS5xdWFudGl0eSc6IGFtbW9JbmZvLmNvdW50LFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYXZhaWxhYmxlQW1tdW5pdGlvbi5wdXNoKGFtbW9JbmZvKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBhdmFpbGFibGVBbW11bml0aW9uO1xuICAgIH1cblxuICAgIGFzeW5jIGNob29zZUFtbXVuaXRpb24oXG4gICAgICAgIGFtbW9PcHRpb25zOiBBbW1vSXRlbU9wdGlvbltdLFxuICAgICAgICBjdXJyZW50TG9hZG91dDogc3RyaW5nW11cbiAgICApIHtcbiAgICAgICAgY29uc3QgZGlhbG9nQ29udGVudCA9IGF3YWl0IChcbiAgICAgICAgICAgIGZvdW5kcnkuYXBwbGljYXRpb25zIGFzIGFueVxuICAgICAgICApLmhhbmRsZWJhcnMucmVuZGVyVGVtcGxhdGUoXG4gICAgICAgICAgICAnbW9kdWxlcy9mdnR0LXdlYXBvbi1yZWxvYWQvdGVtcGxhdGVzL2FtbW9TZWxlY3Rpb25EaWFsb2dUZW1wbGF0ZS5oYnMnLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGxvYWRvdXRTbG90czogbmV3IEFycmF5KFxuICAgICAgICAgICAgICAgICAgICBwYXJzZUludCh0aGlzLndlYXBvbi5zeXN0ZW0udXNlcy5tYXgpXG4gICAgICAgICAgICAgICAgKS5maWxsKCdFbXB0eScpLFxuICAgICAgICAgICAgICAgIGFtbW9PcHRpb25zLFxuICAgICAgICAgICAgfVxuICAgICAgICApO1xuXG4gICAgICAgIGNvbnN0IGRpYWxvZ0J1dHRvbnMgPSBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYWN0aW9uOiAnbG9hZCcsXG4gICAgICAgICAgICAgICAgbGFiZWw6IHRoaXMudHJhbnNsYXRlKFxuICAgICAgICAgICAgICAgICAgICAnV0VBUE9OX1JFTE9BRC5GZWF0dXJlcy5SZWxvYWQuQW1tdW5pdGlvbi5DaG9pY2VEaWFsb2dCdXR0b25UeHRMb2FkJ1xuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgY2FsbGJhY2s6IChfZXZlbnQsIGJ1dHRvbikgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9oYW5kbGVDaG9pY2VEaWFsb2dDbG9zZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBsb2Fkb3V0OiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGJ1dHRvbi5mb3JtLmVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBlbG0gPSBidXR0b24uZm9ybS5lbGVtZW50cy5pdGVtKGkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVsbS5uYW1lID09ICdhbW1vLXNlbGVjdCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2Fkb3V0LnB1c2goZWxtLnZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbG9hZG91dDtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBhY3Rpb246ICdjYW5jZWwnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiB0aGlzLnRyYW5zbGF0ZShcbiAgICAgICAgICAgICAgICAgICAgJ1dFQVBPTl9SRUxPQUQuRmVhdHVyZXMuUmVsb2FkLkFtbXVuaXRpb24uQ2hvaWNlRGlhbG9nQnV0dG9uVHh0Q2FuY2VsJ1xuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgY2FsbGJhY2s6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5faGFuZGxlQ2hvaWNlRGlhbG9nQ2xvc2UgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnRMb2Fkb3V0O1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICBdO1xuXG4gICAgICAgIHRoaXMuX2hhbmRsZUNob2ljZURpYWxvZ0Nsb3NlID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5faG9va0lkID0gSG9va3Mub24oJ2Nsb3NlRGlhbG9nVjInLCAoZGlhbG9nVjI6IERpYWxvZ1YyKSA9PiB7XG4gICAgICAgICAgICBpZiAoZGlhbG9nVjIuaWQgPT09ICdhbW1vLWNob2ljZS1kaWFsb2cnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vbkNsb3NlQ2hvaWNlRGlhbG9nKGN1cnJlbnRMb2Fkb3V0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5tb2R1bGVNYW5hZ2VyLnVpTWFuYWdlclxuICAgICAgICAgICAgLmJ1aWxkRGlhbG9nKFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IHRoaXMudHJhbnNsYXRlKFxuICAgICAgICAgICAgICAgICAgICAgICAgJ1dFQVBPTl9SRUxPQUQuRmVhdHVyZXMuUmVsb2FkLkFtbXVuaXRpb24uQ2hvaWNlRGlhbG9nVGl0bGUnXG4gICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGRpYWxvZ0NvbnRlbnQsXG4gICAgICAgICAgICAgICAgICAgIGJ1dHRvbnM6IGRpYWxvZ0J1dHRvbnMsXG4gICAgICAgICAgICAgICAgICAgIG9uU3VibWl0OiB0aGlzLnJlbG9hZFJlbG9hZGFibGVXZWFwb24uYmluZCh0aGlzKSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICdhbW1vLWNob2ljZS1kaWFsb2cnXG4gICAgICAgICAgICApXG4gICAgICAgICAgICAucmVuZGVyKHsgZm9yY2U6IHRydWUgfSk7XG4gICAgfVxuXG4gICAgb25DbG9zZUNob2ljZURpYWxvZyhsb2Fkb3V0OiBzdHJpbmdbXSkge1xuICAgICAgICBIb29rcy5vZmYoJ2Nsb3NlRGlhbG9nVjInLCB0aGlzLl9ob29rSWQpO1xuICAgICAgICB0aGlzLl9ob29rSWQgPSAtMTtcblxuICAgICAgICBpZiAodGhpcy5faGFuZGxlQ2hvaWNlRGlhbG9nQ2xvc2UpIHtcbiAgICAgICAgICAgIHRoaXMuX2hhbmRsZUNob2ljZURpYWxvZ0Nsb3NlID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLnJlbG9hZFJlbG9hZGFibGVXZWFwb24obG9hZG91dCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhc3luYyByZWxvYWRSZWxvYWRhYmxlV2VhcG9uKGxvYWRvdXQ6IHN0cmluZ1tdKSB7XG4gICAgICAgIGNvbnN0IHJlbG9hZGFibGVXZWFwb24gPSB0aGlzLndlYXBvbjtcbiAgICAgICAgY29uc3QgYW1tb0NvdW50cyA9IHRoaXMuZ2V0TG9hZG91dENvdW50cyhsb2Fkb3V0KTtcblxuICAgICAgICBpZiAodGhpcy5yZW1vdmVMb2Fkb3V0KGFtbW9Db3VudHMpKSB7XG4gICAgICAgICAgICAvLyBVcGRhdGUgdGhlIHJlbG9hZGFibGVXZWFwb24gdXNlc1xuICAgICAgICAgICAgbGV0IHF0eSA9IDA7XG4gICAgICAgICAgICBpZiAoYW1tb0NvdW50c1snRW1wdHknXSA+IDApIHtcbiAgICAgICAgICAgICAgICAvLyBBZGp1c3Qgc3BlbnQgdXNlcyBieSB0aGUgbnVtYmVyIG9mIEVtcHR5IHNsb3RzXG4gICAgICAgICAgICAgICAgcXR5ICs9IGFtbW9Db3VudHNbJ0VtcHR5J107XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhd2FpdCByZWxvYWRhYmxlV2VhcG9uLnVwZGF0ZSh7XG4gICAgICAgICAgICAgICAgJ3N5c3RlbS51c2VzLnNwZW50JzogcXR5LFxuICAgICAgICAgICAgICAgICdzeXN0ZW0udXNlcy52YWx1ZSc6XG4gICAgICAgICAgICAgICAgICAgIHBhcnNlSW50KHJlbG9hZGFibGVXZWFwb24uc3lzdGVtLnVzZXMubWF4KSAtIHF0eSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYXdhaXQgcmVsb2FkYWJsZVdlYXBvbi5zZXRGbGFnKFxuICAgICAgICAgICAgICAgIHRoaXMubW9kdWxlTWFuYWdlci5pZCxcbiAgICAgICAgICAgICAgICAnY2hhbWJlcmVkJyxcbiAgICAgICAgICAgICAgICBsb2Fkb3V0XG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgYXdhaXQgcmVsb2FkYWJsZVdlYXBvbi5zZXRGbGFnKFxuICAgICAgICAgICAgICAgIHRoaXMubW9kdWxlTWFuYWdlci5pZCxcbiAgICAgICAgICAgICAgICAnZmlyZWQnLFxuICAgICAgICAgICAgICAgIG5ldyBBcnJheShwYXJzZUludCh0aGlzLndlYXBvbi5zeXN0ZW0udXNlcy5tYXgpKS5maWxsKCdFbXB0eScpXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICBjb25zdCBodG1sVGVtcGxhdGUgPSBhd2FpdCAoXG4gICAgICAgICAgICAgICAgZm91bmRyeS5hcHBsaWNhdGlvbnMgYXMgYW55XG4gICAgICAgICAgICApLmhhbmRsZWJhcnMucmVuZGVyVGVtcGxhdGUoXG4gICAgICAgICAgICAgICAgJ21vZHVsZXMvZnZ0dC13ZWFwb24tcmVsb2FkL3RlbXBsYXRlcy9yZWxvYWRhYmxlV2VhcG9uUmVsb2FkVGVtcGxhdGUuaGJzJyxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW06IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGltZzogcmVsb2FkYWJsZVdlYXBvbi5pbWcsXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiByZWxvYWRhYmxlV2VhcG9uLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGZsYXZvcjogdGhpcy50cmFuc2xhdGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAnV0VBUE9OX1JFTE9BRC5GZWF0dXJlcy5SZWxvYWQuV2VhcG9uLldlYXBvblJlbG9hZGVkQ2hhdEZsYXZvcidcbiAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IHRoaXMudHJhbnNsYXRlKFxuICAgICAgICAgICAgICAgICAgICAgICAgJ1dFQVBPTl9SRUxPQUQuRmVhdHVyZXMuUmVsb2FkLldlYXBvbi5XZWFwb25SZWxvYWRlZENoYXRNc2cnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyByZWxvYWRhYmxlV2VhcG9uOiByZWxvYWRhYmxlV2VhcG9uLm5hbWUgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRydWVcbiAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgbG9hZG91dDogbG9hZG91dCxcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgLy8gTm90aWZ5IHRoZSBwZWVwc1xuICAgICAgICAgICAgdGhpcy5tb2R1bGVNYW5hZ2VyLnVpTWFuYWdlci5zZW5kQ2hhdCh0aGlzLmNoYXJhY3RlciwgaHRtbFRlbXBsYXRlKTtcbiAgICAgICAgICAgIHRoaXMuY2hhcmFjdGVySWQgPSAnJztcbiAgICAgICAgICAgIHRoaXMud2VhcG9uSWQgPSAnJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMud2VhcG9uUmVsb2FkKGZhbHNlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlbW92ZUxvYWRvdXQoY291bnRzOiB7IFtrZXk6IHN0cmluZ106IG51bWJlciB9KTogYm9vbGVhbiB7XG4gICAgICAgIGxldCBhbW11bml0aW9uQXZhaWxhYmxlID0gdHJ1ZTtcbiAgICAgICAgY29uc3QgaW52ZW50b3J5QW1tdW5pdGlvbiA9IHRoaXMuYW1tdW5pdGlvbihcbiAgICAgICAgICAgIHRoaXMuY2hhcmFjdGVyPy5pdGVtc1xuICAgICAgICApIGFzIERuZEl0ZW01ZVtdO1xuICAgICAgICBpbnZlbnRvcnlBbW11bml0aW9uLmZvckVhY2goKGFtbW86IERuZEl0ZW01ZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbmFtZSA9IGFtbW8ubmFtZTtcbiAgICAgICAgICAgIGNvbnN0IHF0eSA9IGFtbW8uc3lzdGVtLnF1YW50aXR5IC0gY291bnRzW25hbWVdO1xuXG4gICAgICAgICAgICAvLyBJZiBhbnkgYnVsbGV0IGlzIGFkZGVkIGJleW9uZCB0aGUgcXVhbnRpdHkgdGhlIHBsYXllciBhY3R1YWxseSBoYXMgdGhlbiB0aHJvdyBhbiBlcnJvciBhbmQgcmV0dXJuIGZhbHNlXG4gICAgICAgICAgICBpZiAocXR5IDwgMCkge1xuICAgICAgICAgICAgICAgIHRoaXMubW9kdWxlTWFuYWdlci51aU1hbmFnZXIudWlOb3RpZmljYXRpb24oXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudHJhbnNsYXRlKFxuICAgICAgICAgICAgICAgICAgICAgICAgJ1dFQVBPTl9SRUxPQUQuRmVhdHVyZXMuUmVsb2FkLldlYXBvbi5Mb2FkaW5nRXJyb3JNc2cnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBuYW1lOiBhbW1vLm5hbWUgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRydWVcbiAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgJ2Vycm9yJ1xuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgYW1tdW5pdGlvbkF2YWlsYWJsZSA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoYW1tdW5pdGlvbkF2YWlsYWJsZSkge1xuICAgICAgICAgICAgaW52ZW50b3J5QW1tdW5pdGlvbi5mb3JFYWNoKGFzeW5jIChhbW1vOiBEbmRJdGVtNWUpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBuYW1lID0gYW1tby5uYW1lO1xuICAgICAgICAgICAgICAgIGlmIChjb3VudHNbbmFtZV0pIHtcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgYW1tby51cGRhdGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgJ3N5c3RlbS5xdWFudGl0eSc6IGFtbW8uc3lzdGVtLnF1YW50aXR5IC0gY291bnRzW25hbWVdLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBhbW11bml0aW9uQXZhaWxhYmxlO1xuICAgIH1cblxuICAgIGFzeW5jIG9uUmVsb2FkQ2FsbGJhY2soYWN0b3I6IERuZEFjdG9yNWUsIHdlYXBvbjogRG5kSXRlbTVlKSB7XG4gICAgICAgIHRoaXMuY2hhcmFjdGVySWQgPSBhY3Rvci5pZDtcbiAgICAgICAgdGhpcy53ZWFwb25JZCA9IHdlYXBvbi5pZDtcblxuICAgICAgICB0aGlzLndlYXBvblJlbG9hZCgpO1xuICAgIH1cblxuICAgIGdldExvYWRvdXRDb3VudHMoY3VycmVudExvYWRvdXQ6IHN0cmluZ1tdKToge1xuICAgICAgICBba2V5OiBzdHJpbmddOiBudW1iZXI7XG4gICAgfSB7XG4gICAgICAgIGNvbnN0IGxvYWRvdXQgPSB7fTtcbiAgICAgICAgY3VycmVudExvYWRvdXQuZm9yRWFjaCgoYW1tbzogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICBpZiAoIWxvYWRvdXRbYW1tb10pIGxvYWRvdXRbYW1tb10gPSAwO1xuICAgICAgICAgICAgbG9hZG91dFthbW1vXSA9IGxvYWRvdXRbYW1tb10gKyAxO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGxvYWRvdXQ7XG4gICAgfVxuXG4gICAgdG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiAnY2xhc3MgUmVsb2FkRmVhdHVyZSc7XG4gICAgfVxufVxuIiwiaW1wb3J0IEZlYXR1cmVNYW5hZ2VyIGZyb20gJy4uL21hbmFnZXJzL0ZlYXR1cmVNYW5hZ2VyJztcblxuaW1wb3J0IHtcbiAgICBEbmRBY3RvcjVlLFxuICAgIERuZEl0ZW01ZSxcbiAgICBEbmREMjBSb2xsLFxuICAgIERuZEF0dGFja0V2ZW50LFxufSBmcm9tICcuLi90eXBlcy9kbmQudHlwZXMnO1xuXG5pbXBvcnQgeyBBY3Rpdml0eUNhcmRDaGF0VHlwZSB9IGZyb20gJy4uL3R5cGVzL2NoYXQudHlwZXMnO1xuaW1wb3J0IEJhc2VGZWF0dXJlIGZyb20gJy4vQmFzZUZlYXR1cmUnO1xuXG5leHBvcnQgY2xhc3MgUmVsb2FkYWJsZVdlYXBvbkF0dGFja0ZlYXR1cmUgZXh0ZW5kcyBCYXNlRmVhdHVyZSB7XG4gICAgcHJpdmF0ZSBfbmV4dFJvdW5kOiB7XG4gICAgICAgIGlkOiBzdHJpbmc7XG4gICAgICAgIHR5cGU6IHN0cmluZztcbiAgICB9O1xuICAgIHByaXZhdGUgX2hvb2tJZDogbnVtYmVyO1xuXG4gICAgY29uc3RydWN0b3IoZmVhdHVyZU1hbmFnZXI6IEZlYXR1cmVNYW5hZ2VyKSB7XG4gICAgICAgIHN1cGVyKGZlYXR1cmVNYW5hZ2VyKTtcbiAgICAgICAgdGhpcy5fbmV4dFJvdW5kID0geyBpZDogJycsIHR5cGU6ICcnIH07XG4gICAgICAgIHRoaXMuX2hvb2tJZCA9IC0xO1xuICAgIH1cblxuICAgIGluaXQoKSB7XG4gICAgICAgIEhvb2tzLm9uKCdkbmQ1ZS5wb3N0Um9sbENvbmZpZ3VyYXRpb24nLCB0aGlzLm9uVXNlQWN0aXZpdHkuYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgYXN5bmMgb25Vc2VBY3Rpdml0eShkMjBSb2xsOiBEbmREMjBSb2xsW10sIGV2ZW50OiBEbmRBdHRhY2tFdmVudCkge1xuICAgICAgICBjb25zdCByb2xsID0gZDIwUm9sbFswXTtcbiAgICAgICAgY29uc3Qgd2VhcG9uRGF0YSA9IHJvbGw/LmRhdGE/Lml0ZW07XG4gICAgICAgIGlmICh3ZWFwb25EYXRhPy50eXBlPy5iYXNlSXRlbSAhPT0gJ3JlbG9hZGFibGVXZWFwb24nKSByZXR1cm47XG5cbiAgICAgICAgY29uc29sZS5sb2coJ1dlYXBvbiBSZWxvYWQgfCBUcmlnZ2VyZWQgQXR0YWNrJyk7XG4gICAgICAgIHRoaXMud2VhcG9uSWQgPSBldmVudC5zdWJqZWN0Lml0ZW0uaWQ7XG4gICAgICAgIHRoaXMuY2hhcmFjdGVySWQgPSBldmVudC5zdWJqZWN0LmFjdG9yLmlkO1xuXG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnJlbG9hZGFibGVXZWFwb25BdHRhY2soKTtcbiAgICB9XG5cbiAgICBhc3luYyByZWxvYWRhYmxlV2VhcG9uQXR0YWNrKCkge1xuICAgICAgICBjb25zdCBidWxsZXQgPSBhd2FpdCB0aGlzLmdldE5leHRSb3VuZCgpO1xuXG4gICAgICAgIGlmIChidWxsZXQubmFtZSA9PSAnRW1wdHknKSB7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLmRyeWZpcmVXZWFwb24oKTtcblxuICAgICAgICAgICAgLy8gU3RvcCB0aGUgYXR0YWNrIGlmIERyeWZpcmluZyB0aGUgd2VhcG9uXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9uZXh0Um91bmQgPSB7XG4gICAgICAgICAgICBpZDogYnVsbGV0LmlkLFxuICAgICAgICAgICAgdHlwZTogYnVsbGV0LnR5cGUsXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5faG9va0lkID0gSG9va3Mub24oXG4gICAgICAgICAgICAnZG5kNWUucmVuZGVyQ2hhdE1lc3NhZ2UnLFxuICAgICAgICAgICAgdGhpcy5vblJlbmRlckNoYXRNZXNzYWdlLmJpbmQodGhpcylcbiAgICAgICAgKTtcblxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5maXJlUm91bmQoYnVsbGV0KTtcbiAgICB9XG5cbiAgICBhc3luYyBvblJlbmRlckNoYXRNZXNzYWdlKG1lc3NhZ2UsIGh0bWwpIHtcbiAgICAgICAgY29uc3QgaXRlbUlkID0gbWVzc2FnZS5mbGFncy5kbmQ1ZT8uaXRlbS5pZDtcbiAgICAgICAgY29uc3QgaXRlbVR5cGUgPSBtZXNzYWdlLmZsYWdzLmRuZDVlPy5pdGVtLnR5cGU7XG4gICAgICAgIGlmIChcbiAgICAgICAgICAgIHRoaXMuX25leHRSb3VuZC5pZCA9PT0gaXRlbUlkICYmXG4gICAgICAgICAgICB0aGlzLl9uZXh0Um91bmQudHlwZSA9PT0gaXRlbVR5cGVcbiAgICAgICAgKSB7XG4gICAgICAgICAgICBIb29rcy5vZmYoJ2RuZDVlLnJlbmRlckNoYXRNZXNzYWdlJywgdGhpcy5faG9va0lkKTtcbiAgICAgICAgICAgIHRoaXMuX25leHRSb3VuZCA9IHsgaWQ6ICcnLCB0eXBlOiAnJyB9O1xuXG4gICAgICAgICAgICBjb25zdCBidWxsZXQgPSB0aGlzLmNoYXJhY3Rlci5pdGVtcy5nZXQoaXRlbUlkKSBhcyBEbmRJdGVtNWU7XG5cbiAgICAgICAgICAgIGNvbnN0IGFjdGl2YXRpb25DYXJkID0gaHRtbC5xdWVyeVNlbGVjdG9yKCcuYWN0aXZhdGlvbi1jYXJkJyk7XG4gICAgICAgICAgICBjb25zdCBpdGVtY2FyZCA9IGh0bWwucXVlcnlTZWxlY3RvcignLml0ZW0tY2FyZCcpO1xuICAgICAgICAgICAgY29uc3QgcGFyZW50RWxlbWVudCA9IGFjdGl2YXRpb25DYXJkIHx8IGl0ZW1jYXJkO1xuXG4gICAgICAgICAgICAvLyBHcmFiIG1vZHVsZSBjb25maWd1cmF0aW9uc1xuICAgICAgICAgICAgY29uc3QgY2hlY2tVbnN0YWJsZUFtbW8gPSBnYW1lLnNldHRpbmdzLmdldChcbiAgICAgICAgICAgICAgICB0aGlzLm1vZHVsZU1hbmFnZXIuaWQsXG4gICAgICAgICAgICAgICAgJ3Vuc3RhYmxlQW1tbydcbiAgICAgICAgICAgICkgYXMgYm9vbGVhbjtcblxuICAgICAgICAgICAgY29uc3QgY2hlY2tNaXNmaXJlID0gZ2FtZS5zZXR0aW5ncy5nZXQoXG4gICAgICAgICAgICAgICAgdGhpcy5tb2R1bGVNYW5hZ2VyLmlkLFxuICAgICAgICAgICAgICAgICd1c2VNaXNmaXJlcydcbiAgICAgICAgICAgICkgYXMgYm9vbGVhbjtcblxuICAgICAgICAgICAgY29uc3QgdW5zdGFibGVBbW1vRmFpbHVyZVRocmVzaG9sZCA9IGdhbWUuc2V0dGluZ3MuZ2V0KFxuICAgICAgICAgICAgICAgIHRoaXMubW9kdWxlTWFuYWdlci5pZCxcbiAgICAgICAgICAgICAgICAndW5zdGFibGVBbW1vRmFpbHVyZVRocmVzaGhvbGQnXG4gICAgICAgICAgICApIGFzIG51bWJlcjtcblxuICAgICAgICAgICAgLy8gQWRkIHRoZSBtaXNmaXJlIG1lc3NhZ2VcbiAgICAgICAgICAgIGlmIChjaGVja01pc2ZpcmUpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjcml0aWNhbEZhaWx1cmVNc2cgPVxuICAgICAgICAgICAgICAgICAgICBjaGVja1Vuc3RhYmxlQW1tbyAmJlxuICAgICAgICAgICAgICAgICAgICBidWxsZXQ/LnN5c3RlbS5wcm9wZXJ0aWVzLmZpbmQoKHByb3A6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHByb3AgPT09ICd1bnN0YWJsZSc7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICA/IHRoaXMudHJhbnNsYXRlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1dFQVBPTl9SRUxPQUQuRmVhdHVyZXMuUmVsb2FkYWJsZVdlYXBvbkF0dGFjay5NaXNmaXJlVW5zdGFibGUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBmYWlsdXJlOiBgJHt1bnN0YWJsZUFtbW9GYWlsdXJlVGhyZXNob2xkfWAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgOiB0aGlzLnRyYW5zbGF0ZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdXRUFQT05fUkVMT0FELkZlYXR1cmVzLlJlbG9hZGFibGVXZWFwb25BdHRhY2suTWlzZmlyZU5hdE9uZSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IGNhcmRDb250ZW50RWxlbWVudCA9XG4gICAgICAgICAgICAgICAgICAgIHBhcmVudEVsZW1lbnQucXVlcnlTZWxlY3RvcignLmNhcmQtY29udGVudCcpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHdyYXBwZXJFbGVtZW50ID1cbiAgICAgICAgICAgICAgICAgICAgY2FyZENvbnRlbnRFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy53cmFwcGVyJyk7XG4gICAgICAgICAgICAgICAgd3JhcHBlckVsZW1lbnQuaW5zZXJ0QWRqYWNlbnRIVE1MKFxuICAgICAgICAgICAgICAgICAgICAnYmVmb3JlZW5kJyxcbiAgICAgICAgICAgICAgICAgICAgYDxwPiR7Y3JpdGljYWxGYWlsdXJlTXNnfTwvcD5gXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gQWRkIGNhcmQgYnV0dG9uIGNvbnRhaW5lciBpZiBtaXNzaW5nXG4gICAgICAgICAgICBpZiAoaXRlbWNhcmQgJiYgIWFjdGl2YXRpb25DYXJkKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVmZXJlbmNlRWxlbWVudCA9XG4gICAgICAgICAgICAgICAgICAgIHBhcmVudEVsZW1lbnQucXVlcnlTZWxlY3RvcignLmNhcmQtaGVhZGVyJyk7XG4gICAgICAgICAgICAgICAgY29uc3QgYnV0dG9uQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICAgICAgYnV0dG9uQ29udGFpbmVyLmNsYXNzTmFtZSA9ICdjYXJkLWJ1dHRvbnMnO1xuICAgICAgICAgICAgICAgIHJlZmVyZW5jZUVsZW1lbnQuYWZ0ZXIoYnV0dG9uQ29udGFpbmVyKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgY2FyZEJ1dHRvbnNFbGVtZW50ID1cbiAgICAgICAgICAgICAgICBwYXJlbnRFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jYXJkLWJ1dHRvbnMnKTtcblxuICAgICAgICAgICAgLy8gQWRkIE1pc2ZpcmUgYnV0dG9uXG4gICAgICAgICAgICBpZiAoY2hlY2tNaXNmaXJlKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbWlzZmlyZUJ0biA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgICAgICAgICAgICAgIG1pc2ZpcmVCdG4ub25jbGljayA9IHRoaXMub25DbGlja01pc2ZpcmUuYmluZCh0aGlzKTtcbiAgICAgICAgICAgICAgICBtaXNmaXJlQnRuLmlubmVySFRNTCA9IGAke3RoaXMubWFrZUljb24oJ2ZhLWJ1cnN0Jyl9JHt0aGlzLnRyYW5zbGF0ZShcbiAgICAgICAgICAgICAgICAgICAgJ1dFQVBPTl9SRUxPQUQuRmVhdHVyZXMuUmVsb2FkYWJsZVdlYXBvbkF0dGFjay5NaXNmaXJlZEJ0blR4dCdcbiAgICAgICAgICAgICAgICApfWA7XG4gICAgICAgICAgICAgICAgY2FyZEJ1dHRvbnNFbGVtZW50LmFwcGVuZChtaXNmaXJlQnRuKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gQWRkIGFtbW8gcmVmdW5kIGJ1dHRvblxuICAgICAgICAgICAgY29uc3QgcmVmdW5kQnRuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAgICAgICByZWZ1bmRCdG4ub25jbGljayA9IHRoaXMub25DbGlja1JlZnVuZC5iaW5kKHRoaXMpO1xuICAgICAgICAgICAgcmVmdW5kQnRuLmlubmVySFRNTCA9IGAke3RoaXMubWFrZUljb24oJ2ZhLXVuZG8nKX0ke3RoaXMudHJhbnNsYXRlKFxuICAgICAgICAgICAgICAgICdXRUFQT05fUkVMT0FELkZlYXR1cmVzLlJlbG9hZGFibGVXZWFwb25BdHRhY2suUmVmdW5kQnRuVHh0J1xuICAgICAgICAgICAgKX1gO1xuICAgICAgICAgICAgY2FyZEJ1dHRvbnNFbGVtZW50LmFwcGVuZChyZWZ1bmRCdG4pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgYXN5bmMgZ2V0TmV4dFJvdW5kKCk6IFByb21pc2U8RG5kSXRlbTVlPiB7XG4gICAgICAgIGNvbnN0IGNoYXJhY3RlciA9IHRoaXMuY2hhcmFjdGVyO1xuICAgICAgICBjb25zdCB3ZWFwb24gPSB0aGlzLndlYXBvbjtcblxuICAgICAgICBjb25zdCBsb2Fkb3V0ID0gdGhpcy5sb2Fkb3V0O1xuICAgICAgICBsb2Fkb3V0LnB1c2goJ0VtcHR5Jyk7XG4gICAgICAgIGNvbnN0IG5leHRSb3VuZCA9IGxvYWRvdXQuc2hpZnQoKTtcblxuICAgICAgICAvLyBSZW1vdmUgdGhlIGJ1bGxldCBmcm9tIHRoZSByZWxvYWRhYmxlV2VhcG9uIGFtbXVuaXRpb25cbiAgICAgICAgYXdhaXQgd2VhcG9uLnNldEZsYWcodGhpcy5tb2R1bGVNYW5hZ2VyLmlkLCAnY2hhbWJlcmVkJywgbG9hZG91dCk7XG5cbiAgICAgICAgY29uc3QgaW52ZW50b3J5QW1tdW5pdGlvbiA9IHRoaXMuYW1tdW5pdGlvbihcbiAgICAgICAgICAgIGNoYXJhY3Rlci5pdGVtc1xuICAgICAgICApIGFzIERuZEl0ZW01ZVtdO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgaW52ZW50b3J5QW1tdW5pdGlvbi5maW5kKChhbW1vOiBEbmRJdGVtNWUpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBuYW1lID0gYW1tby5uYW1lO1xuICAgICAgICAgICAgICAgIGlmIChuYW1lID09IG5leHRSb3VuZCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYW1tbztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9KSB8fCAoeyBuYW1lOiAnRW1wdHknIH0gYXMgRG5kSXRlbTVlKVxuICAgICAgICApO1xuICAgIH1cblxuICAgIGFzeW5jIGRyeWZpcmVXZWFwb24oKSB7XG4gICAgICAgIGNvbnN0IGNoYXJhY3RlciA9IHRoaXMuY2hhcmFjdGVyO1xuICAgICAgICBjb25zdCB3ZWFwb24gPSB0aGlzLndlYXBvbjtcblxuICAgICAgICBjb25zdCByZW5kZXJIb29rSWQgPSBIb29rcy5vbihcbiAgICAgICAgICAgICdyZW5kZXJDaGF0TWVzc2FnZScsXG4gICAgICAgICAgICAoX2NoYXRJdGVtLCBodG1sKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVsb2FkQnRuID0gaHRtbFswXS5xdWVyeVNlbGVjdG9yKCcucmVsb2FkLWFtbW8nKTtcbiAgICAgICAgICAgICAgICByZWxvYWRCdG4/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbG9hZChjaGFyYWN0ZXIsIHdlYXBvbik7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBpZiAocmVsb2FkQnRuKSB7XG4gICAgICAgICAgICAgICAgICAgIEhvb2tzLm9mZigncmVuZGVyQ2hhdE1lc3NhZ2UnLCByZW5kZXJIb29rSWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcblxuICAgICAgICBjb25zdCB0ZW1wbGF0ZURhdGE6IEFjdGl2aXR5Q2FyZENoYXRUeXBlID0ge1xuICAgICAgICAgICAgZGVzY3JpcHRpb246IHtcbiAgICAgICAgICAgICAgICBjaGF0OiBgPHA+JHt0aGlzLnRyYW5zbGF0ZShcbiAgICAgICAgICAgICAgICAgICAgJ1dFQVBPTl9SRUxPQUQuRmVhdHVyZXMuUmVsb2FkYWJsZVdlYXBvbkF0dGFjay5EcnlGaXJlRGVzY3JpcHRpb24nLFxuICAgICAgICAgICAgICAgICAgICB7IG5hbWU6IGNoYXJhY3Rlci5uYW1lLCByZWxvYWRhYmxlV2VhcG9uOiB3ZWFwb24ubmFtZSB9LFxuICAgICAgICAgICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICAgICAgKX08L3A+YCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBpdGVtOiB7XG4gICAgICAgICAgICAgICAgaW1nOiB3ZWFwb24uaW1nLFxuICAgICAgICAgICAgICAgIG5hbWU6IHRoaXMudHJhbnNsYXRlKFxuICAgICAgICAgICAgICAgICAgICAnV0VBUE9OX1JFTE9BRC5GZWF0dXJlcy5SZWxvYWRhYmxlV2VhcG9uQXR0YWNrLkRyeUZpcmVUaXRsZSdcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHN1YnRpdGxlOiB3ZWFwb24ubmFtZSxcbiAgICAgICAgICAgIGJ1dHRvbnM6IFtcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGFzZXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZpc2liaWxpdHk6ICdhbGwnLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBpY29uOiB0aGlzLm1ha2VJY29uKCdmYS1yb3RhdGUtcmlnaHQnKSxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6IHRoaXMudHJhbnNsYXRlKCdXRUFQT05fUkVMT0FELkZlYXR1cmVzLlJlbG9hZC5UZXh0JyksXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzZXM6ICdyZWxvYWQtYW1tbycsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgaHRtbFRlbXBsYXRlID0gYXdhaXQgKFxuICAgICAgICAgICAgZm91bmRyeS5hcHBsaWNhdGlvbnMgYXMgYW55XG4gICAgICAgICkuaGFuZGxlYmFycy5yZW5kZXJUZW1wbGF0ZShcbiAgICAgICAgICAgICdtb2R1bGVzL2Z2dHQtd2VhcG9uLXJlbG9hZC90ZW1wbGF0ZXMvb3ZlcnJpZGVzL2FjdGl2aXR5LWNhcmQuaGJzJyxcbiAgICAgICAgICAgIHRlbXBsYXRlRGF0YVxuICAgICAgICApO1xuICAgICAgICB0aGlzLm1vZHVsZU1hbmFnZXIudWlNYW5hZ2VyLnNlbmRDaGF0KGNoYXJhY3RlciwgaHRtbFRlbXBsYXRlKTtcbiAgICB9XG5cbiAgICBhc3luYyBmaXJlUm91bmQoYnVsbGV0OiBEbmRJdGVtNWUpIHtcbiAgICAgICAgY29uc3QgcmVsb2FkYWJsZVdlYXBvbiA9IHRoaXMud2VhcG9uO1xuICAgICAgICBjb25zdCBtYXhTaG90cyA9IHBhcnNlSW50KHJlbG9hZGFibGVXZWFwb24uc3lzdGVtLnVzZXMubWF4KTtcbiAgICAgICAgY29uc3QgZmlyZWRMb2Fkb3V0ID1cbiAgICAgICAgICAgIChyZWxvYWRhYmxlV2VhcG9uLmdldEZsYWcoXG4gICAgICAgICAgICAgICAgdGhpcy5tb2R1bGVNYW5hZ2VyLmlkLFxuICAgICAgICAgICAgICAgICdmaXJlZCdcbiAgICAgICAgICAgICkgYXMgc3RyaW5nW10pIHx8IG5ldyBBcnJheShtYXhTaG90cykuZmlsbCgnRW1wdHknKTtcblxuICAgICAgICBmaXJlZExvYWRvdXQudW5zaGlmdChidWxsZXQubmFtZSk7XG4gICAgICAgIGZpcmVkTG9hZG91dC5zcGxpY2UoLTEpO1xuICAgICAgICBhd2FpdCByZWxvYWRhYmxlV2VhcG9uLnNldEZsYWcoXG4gICAgICAgICAgICB0aGlzLm1vZHVsZU1hbmFnZXIuaWQsXG4gICAgICAgICAgICAnZmlyZWQnLFxuICAgICAgICAgICAgZmlyZWRMb2Fkb3V0XG4gICAgICAgICk7XG5cbiAgICAgICAgY29uc3QgdXNlcyA9IHJlbG9hZGFibGVXZWFwb24uc3lzdGVtLnVzZXM7XG4gICAgICAgIGNvbnN0IHF0eTogbnVtYmVyID1cbiAgICAgICAgICAgIHVzZXMuc3BlbnQgKyAxIDw9IHBhcnNlSW50KHVzZXMubWF4KVxuICAgICAgICAgICAgICAgID8gdXNlcy5zcGVudCArIDFcbiAgICAgICAgICAgICAgICA6IHBhcnNlSW50KHVzZXMubWF4KTtcblxuICAgICAgICBhd2FpdCByZWxvYWRhYmxlV2VhcG9uLnVwZGF0ZSh7XG4gICAgICAgICAgICAnc3lzdGVtLnVzZXMuc3BlbnQnOiBxdHksXG4gICAgICAgICAgICAnc3lzdGVtLnVzZXMudmFsdWUnOiBwYXJzZUludCh1c2VzLm1heCkgLSBxdHksXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBidWxsZXQudXNlKCk7XG4gICAgfVxuXG4gICAgcmVsb2FkKGFjdG9yOiBEbmRBY3RvcjVlLCByZWxvYWRhYmxlV2VhcG9uOiBEbmRJdGVtNWUpIHtcbiAgICAgICAgdGhpcy5mZWF0dXJlTWFuYWdlclxuICAgICAgICAgICAgLmdldEZlYXR1cmUoJ3JlbG9hZCcpXG4gICAgICAgICAgICAub25SZWxvYWRDYWxsYmFjayhhY3RvciwgcmVsb2FkYWJsZVdlYXBvbik7XG4gICAgfVxuXG4gICAgYXN5bmMgb25DbGlja1JlZnVuZCgpIHtcbiAgICAgICAgY29uc3QgYWN0b3IgPSB0aGlzLmNoYXJhY3RlcjtcbiAgICAgICAgY29uc3QgcmVsb2FkYWJsZVdlYXBvbiA9IHRoaXMud2VhcG9uO1xuICAgICAgICBjb25zdCBpbnZlbnRvcnlBbW11bml0aW9uID0gdGhpcy5hbW11bml0aW9uKGFjdG9yLml0ZW1zKTtcblxuICAgICAgICBjb25zdCBmaXJlZCA9IHRoaXMuZmlyZWQ7XG4gICAgICAgIGNvbnN0IHJlZnVuZDogc3RyaW5nID0gZmlyZWQuc3BsaWNlKDAsIDEpWzBdIGFzIHN0cmluZztcbiAgICAgICAgZmlyZWQucHVzaCgnRW1wdHknKTtcblxuICAgICAgICBpZiAocmVmdW5kID09ICdFbXB0eScpIHtcbiAgICAgICAgICAgIC8vIE5vdGlmeSB0aGUgdXNlciB0aGF0IHRoZXJlIGlzIG5vIGFtbXVuaXRpb24gdG8gcmVmdW5kXG4gICAgICAgICAgICB0aGlzLm1vZHVsZU1hbmFnZXIudWlNYW5hZ2VyLnVpTm90aWZpY2F0aW9uKFxuICAgICAgICAgICAgICAgIHRoaXMudHJhbnNsYXRlKFxuICAgICAgICAgICAgICAgICAgICAnV0VBUE9OX1JFTE9BRC5GZWF0dXJlcy5SZWxvYWRhYmxlV2VhcG9uQXR0YWNrLlJlZnVuZC5SZWZ1bmROb01vcmVNc2cnLFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBhY3Rvci5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVsb2FkYWJsZVdlYXBvbjogcmVsb2FkYWJsZVdlYXBvbi5uYW1lLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAnd2FybidcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBhd2FpdCByZWxvYWRhYmxlV2VhcG9uLnNldEZsYWcodGhpcy5tb2R1bGVNYW5hZ2VyLmlkLCAnZmlyZWQnLCBmaXJlZCk7XG5cbiAgICAgICAgbGV0IGJ1bGxldCA9IHsgbmFtZTogcmVmdW5kIH0gYXMgRG5kSXRlbTVlO1xuICAgICAgICBpbnZlbnRvcnlBbW11bml0aW9uLmZvckVhY2goKGFtbW86IEl0ZW01ZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbmFtZSA9IGFtbW8ubmFtZTtcbiAgICAgICAgICAgIGlmIChuYW1lID09IHJlZnVuZCkge1xuICAgICAgICAgICAgICAgIGJ1bGxldCA9IGFtbW8gYXMgRG5kSXRlbTVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBSZWZ1bmQgdGhlIG5vbi1FbXB0eSBhbW11bml0aW9uXG4gICAgICAgIGNvbnN0IGFtbW9Mb2Fkb3V0ID0gdGhpcy5sb2Fkb3V0O1xuICAgICAgICBhbW1vTG9hZG91dC51bnNoaWZ0KHJlZnVuZCk7XG4gICAgICAgIGFtbW9Mb2Fkb3V0LnNwbGljZSgtMSk7XG4gICAgICAgIGF3YWl0IHJlbG9hZGFibGVXZWFwb24uc2V0RmxhZyhcbiAgICAgICAgICAgIHRoaXMubW9kdWxlTWFuYWdlci5pZCxcbiAgICAgICAgICAgICdjaGFtYmVyZWQnLFxuICAgICAgICAgICAgYW1tb0xvYWRvdXRcbiAgICAgICAgKTtcblxuICAgICAgICAvLyBVcGRhdGUgdGhlIHJlbG9hZGFibGVXZWFwb24gdXNlc1xuICAgICAgICBjb25zdCB1c2VzID0gcmVsb2FkYWJsZVdlYXBvbi5zeXN0ZW0udXNlcztcbiAgICAgICAgY29uc3QgcXR5OiBudW1iZXIgPSB1c2VzLnNwZW50IC0gMSA+PSAwID8gdXNlcy5zcGVudCAtIDEgOiAwO1xuICAgICAgICByZWxvYWRhYmxlV2VhcG9uLnVwZGF0ZSh7XG4gICAgICAgICAgICAnc3lzdGVtLnVzZXMuc3BlbnQnOiBxdHksXG4gICAgICAgICAgICAnc3lzdGVtLnVzZXMudmFsdWUnOiBwYXJzZUludCh1c2VzLm1heCkgLSBxdHksXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIE5vdGlmeSB0aGUgdXNlciB0aGF0IHRoZSByZWZ1bmQgd2FzIGEgc3VjY2Vzc1xuICAgICAgICBjb25zdCBodG1sVGVtcGxhdGUgPSBhd2FpdCAoXG4gICAgICAgICAgICBmb3VuZHJ5LmFwcGxpY2F0aW9ucyBhcyBhbnlcbiAgICAgICAgKS5oYW5kbGViYXJzLnJlbmRlclRlbXBsYXRlKFxuICAgICAgICAgICAgJ21vZHVsZXMvZnZ0dC13ZWFwb24tcmVsb2FkL3RlbXBsYXRlcy9hbW1vUmVmdW5kTm90aWNlVGVtcGxhdGUuaGJzJyxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBpdGVtOiB7XG4gICAgICAgICAgICAgICAgICAgIGltZzogYnVsbGV0LmltZyxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogYnVsbGV0Lm5hbWUsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogdGhpcy50cmFuc2xhdGUoXG4gICAgICAgICAgICAgICAgICAgICdXRUFQT05fUkVMT0FELkZlYXR1cmVzLlJlbG9hZGFibGVXZWFwb25BdHRhY2suUmVmdW5kLlJlZnVuZENvbXBsZXRlTXNnJyxcbiAgICAgICAgICAgICAgICAgICAgeyBidWxsZXQ6IHJlZnVuZCwgbmFtZTogcmVsb2FkYWJsZVdlYXBvbi5uYW1lIH0sXG4gICAgICAgICAgICAgICAgICAgIHRydWVcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIHRpdGxlOiB0aGlzLnRyYW5zbGF0ZShcbiAgICAgICAgICAgICAgICAgICAgJ1dFQVBPTl9SRUxPQUQuRmVhdHVyZXMuUmVsb2FkYWJsZVdlYXBvbkF0dGFjay5SZWZ1bmQuUmVmdW5kQ29tcGxldGVUaXRsZSdcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgfVxuICAgICAgICApO1xuICAgICAgICB0aGlzLm1vZHVsZU1hbmFnZXIudWlNYW5hZ2VyLnNlbmRDaGF0KGFjdG9yLCBodG1sVGVtcGxhdGUpO1xuICAgIH1cblxuICAgIGFzeW5jIG9uQ2xpY2tNaXNmaXJlKCkge1xuICAgICAgICBjb25zdCBhY3RvciA9IHRoaXMuY2hhcmFjdGVyO1xuICAgICAgICBjb25zdCByb2xsID0gYXdhaXQgbmV3IFJvbGwoJzFkNicpLnJvbGwoKTtcbiAgICAgICAgYXdhaXQgcm9sbC50b01lc3NhZ2Uoe1xuICAgICAgICAgICAgc3BlYWtlcjoge1xuICAgICAgICAgICAgICAgIGFsaWFzOiBhY3Rvci5uYW1lLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgbWFrZUljb24oaWNvbjogc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiBgPGkgY2xhc3M9XCJmYXMgJHtpY29ufVwiPjwvaT5gO1xuICAgIH1cblxuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gJ2NsYXNzIFJlbG9hZGFibGVXZWFwb25BdHRhY2tGZWF0dXJlJztcbiAgICB9XG59XG4iLCJpbXBvcnQgRmVhdHVyZU1hbmFnZXIgZnJvbSAnLi4vbWFuYWdlcnMvRmVhdHVyZU1hbmFnZXInO1xuXG5pbXBvcnQgeyBEbmRJdGVtNWUgfSBmcm9tICcuLi90eXBlcy9kbmQudHlwZXMnO1xuaW1wb3J0IEJhc2VGZWF0dXJlIGZyb20gJy4vQmFzZUZlYXR1cmUnO1xuXG5leHBvcnQgY2xhc3MgUmVsb2FkYWJsZVdlYXBvbkNyZWF0aW9uRmVhdHVyZSBleHRlbmRzIEJhc2VGZWF0dXJlIHtcbiAgICBwcml2YXRlIF9jcmVhdGluZ1JlbG9hZGFibGVXZWFwb246IGJvb2xlYW47XG4gICAgcHJpdmF0ZSBfY3JlYXRlSXRlbUhvb2tJZDogbnVtYmVyO1xuXG4gICAgY29uc3RydWN0b3IoZmVhdHVyZU1hbmFnZXI6IEZlYXR1cmVNYW5hZ2VyKSB7XG4gICAgICAgIHN1cGVyKGZlYXR1cmVNYW5hZ2VyKTtcbiAgICAgICAgdGhpcy5fY3JlYXRpbmdSZWxvYWRhYmxlV2VhcG9uID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX2NyZWF0ZUl0ZW1Ib29rSWQgPSAtMTtcbiAgICB9XG5cbiAgICBpbml0KCkge1xuICAgICAgICBIb29rcy5vbigncHJlQ3JlYXRlSXRlbScsIHRoaXMub25QcmVDcmVhdGVJdGVtLmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIGFzeW5jIG9uUHJlQ3JlYXRlSXRlbShpdGVtOiBEbmRJdGVtNWUpIHtcbiAgICAgICAgaWYgKGl0ZW0uc3lzdGVtLnR5cGUuYmFzZUl0ZW0gPT0gJ3JlbG9hZGFibGVXZWFwb24nKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnV2VhcG9uIFJlbG9hZCB8IFRyaWdnZXJlZCBQcmUtQ3JlYXRpb24nKTtcblxuICAgICAgICAgICAgdGhpcy53ZWFwb25JZCA9IGl0ZW0uaWQ7XG4gICAgICAgICAgICB0aGlzLmNoYXJhY3RlcklkID0gaXRlbS5hY3Rvcj8uaWQgYXMgc3RyaW5nO1xuICAgICAgICAgICAgdGhpcy5fY3JlYXRpbmdSZWxvYWRhYmxlV2VhcG9uID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuX2NyZWF0ZUl0ZW1Ib29rSWQgPSBIb29rcy5vbihcbiAgICAgICAgICAgICAgICAnY3JlYXRlSXRlbScsXG4gICAgICAgICAgICAgICAgdGhpcy5vbkNyZWF0ZUl0ZW0uYmluZCh0aGlzKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFzeW5jIG9uQ3JlYXRlSXRlbShpdGVtOiBEbmRJdGVtNWUpIHtcbiAgICAgICAgaWYgKCF0aGlzLl9jcmVhdGluZ1JlbG9hZGFibGVXZWFwb24gfHwgaXRlbS5pZCAhPT0gdGhpcy53ZWFwb25JZClcbiAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICBjb25zb2xlLmxvZygnV2VhcG9uIFJlbG9hZCB8IFRyaWdnZXJlZCBSZWxvYWRhYmxlV2VhcG9uIENyZWF0aW9uJyk7XG5cbiAgICAgICAgY29uc3QgcmVsb2FkYWJsZVdlYXBvbiA9IHRoaXMud2VhcG9uO1xuICAgICAgICBjb25zdCBhbW1vUXR5ID0gcGFyc2VJbnQocmVsb2FkYWJsZVdlYXBvbi5zeXN0ZW0udXNlcy5tYXgpO1xuXG4gICAgICAgIGF3YWl0IHJlbG9hZGFibGVXZWFwb24udXBkYXRlKHtcbiAgICAgICAgICAgICdzeXN0ZW0udXNlcy5zcGVudCc6IGFtbW9RdHksXG4gICAgICAgICAgICAnc3lzdGVtLnVzZXMudmFsdWUnOiAwLFxuICAgICAgICB9KTtcbiAgICAgICAgYXdhaXQgcmVsb2FkYWJsZVdlYXBvbi5zZXRGbGFnKFxuICAgICAgICAgICAgdGhpcy5tb2R1bGVNYW5hZ2VyLmlkLFxuICAgICAgICAgICAgJ2NoYW1iZXJlZCcsXG4gICAgICAgICAgICBuZXcgQXJyYXkoYW1tb1F0eSkuZmlsbCgnRW1wdHknKVxuICAgICAgICApO1xuICAgICAgICBhd2FpdCByZWxvYWRhYmxlV2VhcG9uLnNldEZsYWcoXG4gICAgICAgICAgICB0aGlzLm1vZHVsZU1hbmFnZXIuaWQsXG4gICAgICAgICAgICAnZmlyZWQnLFxuICAgICAgICAgICAgbmV3IEFycmF5KGFtbW9RdHkpLmZpbGwoJ0VtcHR5JylcbiAgICAgICAgKTtcblxuICAgICAgICB0aGlzLndlYXBvbklkID0gJyc7XG4gICAgICAgIHRoaXMuY2hhcmFjdGVySWQgPSAnJztcbiAgICAgICAgdGhpcy5fY3JlYXRpbmdSZWxvYWRhYmxlV2VhcG9uID0gZmFsc2U7XG4gICAgICAgIEhvb2tzLm9mZignY3JlYXRlSXRlbScsIHRoaXMuX2NyZWF0ZUl0ZW1Ib29rSWQpO1xuICAgICAgICB0aGlzLl9jcmVhdGVJdGVtSG9va0lkID0gLTE7XG4gICAgfVxuXG4gICAgdG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiAnY2xhc3MgUmVsb2FkYWJsZVdlYXBvbkNyZWF0aW9uRmVhdHVyZSc7XG4gICAgfVxufVxuIiwiZXhwb3J0IHsgUmVsb2FkYWJsZVdlYXBvbkF0dGFja0ZlYXR1cmUgfSBmcm9tICcuL1JlbG9hZGFibGVXZWFwb25BdHRhY2tGZWF0dXJlJztcbmV4cG9ydCB7IFJlbG9hZGFibGVXZWFwb25DcmVhdGlvbkZlYXR1cmUgfSBmcm9tICcuL1JlbG9hZGFibGVXZWFwb25DcmVhdGlvbkZlYXR1cmUnO1xuZXhwb3J0IHsgUmVsb2FkRmVhdHVyZSB9IGZyb20gJy4vUmVsb2FkRmVhdHVyZSc7XG4iLCJpbXBvcnQgTW9kdWxlTWFuYWdlciBmcm9tICcuL01vZHVsZU1hbmFnZXInO1xuaW1wb3J0IHtcbiAgICBSZWxvYWRhYmxlV2VhcG9uQXR0YWNrRmVhdHVyZSxcbiAgICBSZWxvYWRhYmxlV2VhcG9uQ3JlYXRpb25GZWF0dXJlLFxuICAgIFJlbG9hZEZlYXR1cmUsXG59IGZyb20gJy4uL2ZlYXR1cmVzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRmVhdHVyZU1hbmFnZXIge1xuICAgIHByaXZhdGUgX21vZHVsZU1hbmFnZXI6IE1vZHVsZU1hbmFnZXI7XG4gICAgcHJpdmF0ZSBfZmVhdHVyZXM6IHsgW2tleTogc3RyaW5nXTogYW55IH07XG5cbiAgICBjb25zdHJ1Y3Rvcihtb2R1bGVNYW5hZ2VyOiBNb2R1bGVNYW5hZ2VyKSB7XG4gICAgICAgIHRoaXMuX21vZHVsZU1hbmFnZXIgPSBtb2R1bGVNYW5hZ2VyO1xuICAgICAgICB0aGlzLl9mZWF0dXJlcyA9IHt9O1xuICAgIH1cblxuICAgIGluaXQoKSB7XG4gICAgICAgIHRoaXMuX2ZlYXR1cmVzID0ge1xuICAgICAgICAgICAgcmVsb2FkOiBuZXcgUmVsb2FkRmVhdHVyZSh0aGlzKSxcbiAgICAgICAgICAgIHJlbG9hZGFibGVXZWFwb25BdHRhY2s6IG5ldyBSZWxvYWRhYmxlV2VhcG9uQXR0YWNrRmVhdHVyZSh0aGlzKSxcbiAgICAgICAgICAgIHJlbG9hZGFibGVXZWFwb25DcmVhdGlvbjogbmV3IFJlbG9hZGFibGVXZWFwb25DcmVhdGlvbkZlYXR1cmUodGhpcyksXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZ2V0RmVhdHVyZShpZDogc3RyaW5nKSB7XG4gICAgICAgIGlmICh0aGlzLl9mZWF0dXJlc1tpZF0pIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9mZWF0dXJlc1tpZF07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgZ2V0IG1vZHVsZU1hbmFnZXIoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9tb2R1bGVNYW5hZ2VyO1xuICAgIH1cblxuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gYGNsYXNzIEZlYXR1cmVNYW5hZ2VyOiAke3RoaXMuX2ZlYXR1cmVzLmxlbmd0aH1gO1xuICAgIH1cbn1cbiIsImltcG9ydCBGZWF0dXJlTWFuYWdlciBmcm9tICcuL0ZlYXR1cmVNYW5hZ2VyJztcbmltcG9ydCBVaU1hbmFnZXIgZnJvbSAnLi9VaU1hbmFnZXInO1xuaW1wb3J0IFRlbXBsYXRlTWFuYWdlciBmcm9tICcuL1RlbXBsYXRlTWFuYWdlcic7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1vZHVsZU1hbmFnZXIge1xuICAgIHByaXZhdGUgX21vZHVsZUlkOiBzdHJpbmc7XG4gICAgcHJpdmF0ZSBfZmVhdHVyZU1hbmFnZXI6IEZlYXR1cmVNYW5hZ2VyO1xuICAgIHByaXZhdGUgX3VpTWFuYWdlcjogVWlNYW5hZ2VyO1xuICAgIHByaXZhdGUgX3RlbXBsYXRlTWFuYWdlcjogVGVtcGxhdGVNYW5hZ2VyO1xuXG4gICAgY29uc3RydWN0b3IoaWQ6IHN0cmluZykge1xuICAgICAgICB0aGlzLl9tb2R1bGVJZCA9IGlkO1xuICAgICAgICB0aGlzLl9mZWF0dXJlTWFuYWdlciA9IG5ldyBGZWF0dXJlTWFuYWdlcih0aGlzKTtcbiAgICAgICAgdGhpcy5fdWlNYW5hZ2VyID0gbmV3IFVpTWFuYWdlcih0aGlzKTtcbiAgICAgICAgdGhpcy5fdGVtcGxhdGVNYW5hZ2VyID0gbmV3IFRlbXBsYXRlTWFuYWdlcigpO1xuICAgIH1cblxuICAgIGdldCBpZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX21vZHVsZUlkO1xuICAgIH1cblxuICAgIGdldCBmZWF0dXJlTWFuYWdlcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ZlYXR1cmVNYW5hZ2VyO1xuICAgIH1cblxuICAgIGdldCB1aU1hbmFnZXIoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl91aU1hbmFnZXI7XG4gICAgfVxuXG4gICAgZ2V0IHRlbXBsYXRlTWFuYWdlcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3RlbXBsYXRlTWFuYWdlcjtcbiAgICB9XG5cbiAgICBpbml0KCkge1xuICAgICAgICB0aGlzLnN5c3RlbU92ZXJyaWRlcygpO1xuICAgICAgICB0aGlzLm1vZHVsZUNvbmZpZ3VyYXRpb25zKCk7XG4gICAgICAgIHRoaXMuX2ZlYXR1cmVNYW5hZ2VyLmluaXQoKTtcbiAgICAgICAgdGhpcy5fdWlNYW5hZ2VyLmluaXQoKTtcbiAgICAgICAgdGhpcy5fdGVtcGxhdGVNYW5hZ2VyLmluaXQoKTtcbiAgICB9XG5cbiAgICBzeXN0ZW1PdmVycmlkZXMoKSB7XG4gICAgICAgIChDT05GSUcgYXMgYW55KS5ETkQ1RS5mZWF0dXJlVHlwZXMuaXRlbSA9IHtcbiAgICAgICAgICAgIGxhYmVsOiB0aGlzLnVpTWFuYWdlci5nZXRMb2NhbGl6ZWRUeHQoJ1dFQVBPTl9SRUxPQUQuSXRlbUZlYXR1cmUnKSxcbiAgICAgICAgfTtcblxuICAgICAgICAoQ09ORklHIGFzIGFueSkuRE5ENUUuaXRlbVByb3BlcnRpZXMuY29uY2VhbGFibGUgPSB7XG4gICAgICAgICAgICBsYWJlbDogdGhpcy51aU1hbmFnZXIuZ2V0TG9jYWxpemVkVHh0KCdXRUFQT05fUkVMT0FELkNvbmNlYWxhYmxlJyksXG4gICAgICAgIH07XG4gICAgICAgIChDT05GSUcgYXMgYW55KS5ETkQ1RS52YWxpZFByb3BlcnRpZXMud2VhcG9uLmFkZCgnY29uY2VhbGFibGUnKTtcblxuICAgICAgICAoQ09ORklHIGFzIGFueSkuRE5ENUUuaXRlbVByb3BlcnRpZXMudW5zdGFibGUgPSB7XG4gICAgICAgICAgICBsYWJlbDogdGhpcy51aU1hbmFnZXIuZ2V0TG9jYWxpemVkVHh0KCdXRUFQT05fUkVMT0FELlVuc3RhYmxlJyksXG4gICAgICAgICAgICBpc1BoeXNpY2FsOiB0cnVlLFxuICAgICAgICB9O1xuXG4gICAgICAgIChDT05GSUcgYXMgYW55KS5ETkQ1RS53ZWFwb25JZHMucmVsb2FkYWJsZVdlYXBvbiA9XG4gICAgICAgICAgICAnQ29tcGVuZGl1bS5mdnR0LXdlYXBvbi1yZWxvYWQuaXRlbS1wYWNrLkl0ZW0ubEU2MFFhUzFzY3RiM09BZCc7XG4gICAgfVxuXG4gICAgbW9kdWxlQ29uZmlndXJhdGlvbnMoKSB7XG4gICAgICAgIGNvbnN0IG1vZHVsZU5hbWUgPSAnZnZ0dC13ZWFwb24tcmVsb2FkJztcblxuICAgICAgICBnYW1lLnNldHRpbmdzLnJlZ2lzdGVyKG1vZHVsZU5hbWUsICd1bnN0YWJsZUFtbW8nLCB7XG4gICAgICAgICAgICBzY29wZTogJ3dvcmxkJyxcbiAgICAgICAgICAgIG5hbWU6ICdTRVRUSU5HUy5XRUFQT05fUkVMT0FELlVuc3RhYmxlQW1tby5OYW1lJyxcbiAgICAgICAgICAgIGhpbnQ6ICdTRVRUSU5HUy5XRUFQT05fUkVMT0FELlVuc3RhYmxlQW1tby5IaW50JyxcbiAgICAgICAgICAgIHR5cGU6IEJvb2xlYW4sXG4gICAgICAgICAgICBjb25maWc6IHRydWUsXG4gICAgICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICB9KTtcblxuICAgICAgICBnYW1lLnNldHRpbmdzLnJlZ2lzdGVyKG1vZHVsZU5hbWUsICd1bnN0YWJsZUFtbW9GYWlsdXJlVGhyZXNoaG9sZCcsIHtcbiAgICAgICAgICAgIHNjb3BlOiAnd29ybGQnLFxuICAgICAgICAgICAgbmFtZTogJ1NFVFRJTkdTLldFQVBPTl9SRUxPQUQuVW5zdGFibGVBbW1vRmFpbHVyZVRocmVzaG9sZC5OYW1lJyxcbiAgICAgICAgICAgIGhpbnQ6ICdTRVRUSU5HUy5XRUFQT05fUkVMT0FELlVuc3RhYmxlQW1tb0ZhaWx1cmVUaHJlc2hvbGQuSGludCcsXG4gICAgICAgICAgICB0eXBlOiBOdW1iZXIsXG4gICAgICAgICAgICBjb25maWc6IHRydWUsXG4gICAgICAgICAgICBkZWZhdWx0OiAyLFxuICAgICAgICB9KTtcblxuICAgICAgICBnYW1lLnNldHRpbmdzLnJlZ2lzdGVyKG1vZHVsZU5hbWUsICd1c2VNaXNmaXJlcycsIHtcbiAgICAgICAgICAgIHNjb3BlOiAnd29ybGQnLFxuICAgICAgICAgICAgbmFtZTogJ1NFVFRJTkdTLldFQVBPTl9SRUxPQUQuVXNlTWlzZmlyZXMuTmFtZScsXG4gICAgICAgICAgICBoaW50OiAnU0VUVElOR1MuV0VBUE9OX1JFTE9BRC5Vc2VNaXNmaXJlcy5IaW50JyxcbiAgICAgICAgICAgIHR5cGU6IEJvb2xlYW4sXG4gICAgICAgICAgICBjb25maWc6IHRydWUsXG4gICAgICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICB9KTtcblxuICAgICAgICBnYW1lLnNldHRpbmdzLnJlZ2lzdGVyKG1vZHVsZU5hbWUsICdmaWx0ZXJBbW11bml0aW9uQnlFcXVpcHBlZCcsIHtcbiAgICAgICAgICAgIHNjb3BlOiAndXNlcicsXG4gICAgICAgICAgICBuYW1lOiAnU0VUVElOR1MuV0VBUE9OX1JFTE9BRC5GaWx0ZXJBbW11bml0aW9uQnlFcXVpcHBlZC5OYW1lJyxcbiAgICAgICAgICAgIGhpbnQ6ICdTRVRUSU5HUy5XRUFQT05fUkVMT0FELkZpbHRlckFtbXVuaXRpb25CeUVxdWlwcGVkLkhpbnQnLFxuICAgICAgICAgICAgdHlwZTogQm9vbGVhbixcbiAgICAgICAgICAgIGNvbmZpZzogdHJ1ZSxcbiAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBkZWJ1Zyhob29rczogYm9vbGVhbiA9IGZhbHNlKSB7XG4gICAgICAgIENPTkZJRy5kZWJ1Zy5ob29rcyA9IGhvb2tzO1xuICAgICAgICBjb25zb2xlLmxvZygnQ09ORklHOiAnLCBDT05GSUcpO1xuICAgICAgICBjb25zb2xlLmxvZygnQ09ORklHLkRORDVFOiAnLCAoQ09ORklHIGFzIGFueSkuRE5ENUUpO1xuICAgIH1cblxuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gJ2NsYXNzIE1vZHVsZU1hbmFnZXInO1xuICAgIH1cbn1cbiIsImV4cG9ydCBkZWZhdWx0IGNsYXNzIFRlbXBsYXRlTWFuYWdlciB7XG4gICAgY29uc3RydWN0b3IoKSB7fVxuXG4gICAgaW5pdCgpIHtcbiAgICAgICAgKGZvdW5kcnkuYXBwbGljYXRpb25zIGFzIGFueSkuaGFuZGxlYmFycy5sb2FkVGVtcGxhdGVzKFxuICAgICAgICAgICAgVGVtcGxhdGVNYW5hZ2VyLnBhdGhzXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgc3RhdGljIGdldCBwYXRocygpIHtcbiAgICAgICAgY29uc3QgcGF0aHMgPSB7fTtcbiAgICAgICAgY29uc3QgdGVtcGxhdGVQYXRocyA9ICdtb2R1bGVzL2Z2dHQtd2VhcG9uLXJlbG9hZC90ZW1wbGF0ZXMvcmVsb2FkYWJsZVdlYXBvblJlbG9hZFRlbXBsYXRlLmhicyxtb2R1bGVzL2Z2dHQtd2VhcG9uLXJlbG9hZC90ZW1wbGF0ZXMvYmFzaWNNZXNzYWdlLmhicyxtb2R1bGVzL2Z2dHQtd2VhcG9uLXJlbG9hZC90ZW1wbGF0ZXMvYW1tb1NlbGVjdGlvbkRpYWxvZ1RlbXBsYXRlLmhicyxtb2R1bGVzL2Z2dHQtd2VhcG9uLXJlbG9hZC90ZW1wbGF0ZXMvYW1tb1JlZnVuZE5vdGljZVRlbXBsYXRlLmhicyxtb2R1bGVzL2Z2dHQtd2VhcG9uLXJlbG9hZC90ZW1wbGF0ZXMvYWN0aXZpdHktY2FyZC5oYnMnLnNwbGl0KCcsJyk7XG4gICAgICAgIGZvciAoY29uc3QgcGF0aCBvZiB0ZW1wbGF0ZVBhdGhzKSB7XG4gICAgICAgICAgICBwYXRoc1twYXRoLnJlcGxhY2UoJy5oYnMnLCAnLmh0bWwnKV0gPSBwYXRoO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwYXRocztcbiAgICB9XG5cbiAgICBzdGF0aWMgb25Ib3RSZWxvYWQoKSB7XG4gICAgICAgIGZvciAoY29uc3QgdGVtcGxhdGUgaW4gX3RlbXBsYXRlQ2FjaGUpIHtcbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoX3RlbXBsYXRlQ2FjaGUsIHRlbXBsYXRlKVxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgZGVsZXRlIF90ZW1wbGF0ZUNhY2hlW3RlbXBsYXRlXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIChmb3VuZHJ5LmFwcGxpY2F0aW9ucyBhcyBhbnkpLmhhbmRsZWJhcnNcbiAgICAgICAgICAgIC5sb2FkVGVtcGxhdGVzKHRoaXMucGF0aHMpXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBhcHBsaWNhdGlvbiBpbiB1aS53aW5kb3dzKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1aS53aW5kb3dzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcGxpY2F0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdWkud2luZG93c1thcHBsaWNhdGlvbl0ucmVuZGVyKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgdG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiAnY2xhc3MgVGVtcGxhdGVNYW5hZ2VyJztcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBEbmRBY3RvcjVlIH0gZnJvbSAnLi4vdHlwZXMvZG5kLnR5cGVzJztcbmltcG9ydCBNb2R1bGVNYW5hZ2VyIGZyb20gJy4vTW9kdWxlTWFuYWdlcic7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFVpTWFuYWdlciB7XG4gICAgcHJpdmF0ZSBfbW9kdWxlTWFuYWdlcjogTW9kdWxlTWFuYWdlcjtcblxuICAgIGNvbnN0cnVjdG9yKG1vZHVsZU1hbmFnZXI6IE1vZHVsZU1hbmFnZXIpIHtcbiAgICAgICAgdGhpcy5fbW9kdWxlTWFuYWdlciA9IG1vZHVsZU1hbmFnZXI7XG4gICAgfVxuXG4gICAgaW5pdCgpIHtcbiAgICAgICAgLy8gRU1QVFkgRk9SIE5PV1xuICAgIH1cblxuICAgIGdldCBtb2R1bGVNYW5hZ2VyKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fbW9kdWxlTWFuYWdlcjtcbiAgICB9XG5cbiAgICBidWlsZERpYWxvZyhvcHRpb25zLCBpZCkge1xuICAgICAgICByZXR1cm4gbmV3IGZvdW5kcnkuYXBwbGljYXRpb25zLmFwaS5EaWFsb2dWMih7XG4gICAgICAgICAgICB3aW5kb3c6IHtcbiAgICAgICAgICAgICAgICB0aXRsZTogb3B0aW9ucy50aXRsZSxcbiAgICAgICAgICAgICAgICBjb250ZW50Q2xhc3Nlczogb3B0aW9ucy5jb250ZW50Q2xhc3NlcyB8fCBbXSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjb250ZW50OiBvcHRpb25zLmNvbnRlbnQsXG4gICAgICAgICAgICBidXR0b25zOiBvcHRpb25zLmJ1dHRvbnMsXG4gICAgICAgICAgICBzdWJtaXQ6IG9wdGlvbnMub25TdWJtaXQsXG4gICAgICAgICAgICBpZDogaWQsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHVpTm90aWZpY2F0aW9uKG1zZzogc3RyaW5nLCB0eXBlOiBzdHJpbmcgPSAnaW5mbycpIHtcbiAgICAgICAgaWYgKHVpLm5vdGlmaWNhdGlvbnMpIHtcbiAgICAgICAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ2Vycm9yJzpcbiAgICAgICAgICAgICAgICAgICAgdWkubm90aWZpY2F0aW9ucy5lcnJvcihtc2cpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICd3YXJuJzpcbiAgICAgICAgICAgICAgICAgICAgdWkubm90aWZpY2F0aW9ucy53YXJuKG1zZyk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2luZm8nOlxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIHVpLm5vdGlmaWNhdGlvbnMuaW5mbyhtc2cpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgc2VuZENoYXQoXG4gICAgICAgIHNwZWFrZXI6IERuZEFjdG9yNWUsXG4gICAgICAgIGNvbnRlbnQ6IHN0cmluZyxcbiAgICAgICAgZmxhdm9yPzogc3RyaW5nLFxuICAgICAgICBzb3VuZD86IHN0cmluZyxcbiAgICAgICAgdHlwZTogMCB8IDEgfCAyIHwgMyB8IDQgfCA1ID0gQ09OU1QuQ0hBVF9NRVNTQUdFX1RZUEVTLk9PQ1xuICAgICkge1xuICAgICAgICBjb25zdCBDaGF0RGF0YSA9IHtcbiAgICAgICAgICAgIHNwZWFrZXI6IENoYXRNZXNzYWdlLmdldFNwZWFrZXIoeyBhY3Rvcjogc3BlYWtlciB9KSxcbiAgICAgICAgICAgIHR5cGUsXG4gICAgICAgICAgICBmbGF2b3IsXG4gICAgICAgICAgICBzb3VuZCxcbiAgICAgICAgICAgIGNvbnRlbnQsXG4gICAgICAgIH07XG4gICAgICAgIENoYXRNZXNzYWdlLmNyZWF0ZShDaGF0RGF0YSk7XG4gICAgfVxuXG4gICAgZ2V0TG9jYWxpemVkVHh0KFxuICAgICAgICBrZXk6IHN0cmluZyxcbiAgICAgICAgb3B0cz86IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH0sXG4gICAgICAgIGZvcm1hdDogYm9vbGVhbiA9IGZhbHNlXG4gICAgKSB7XG4gICAgICAgIGlmIChmb3JtYXQpIHtcbiAgICAgICAgICAgIHJldHVybiAoZ2FtZSBhcyBhbnkpLmkxOG4uZm9ybWF0KGtleSwgb3B0cyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIChnYW1lIGFzIGFueSkuaTE4bi5sb2NhbGl6ZShrZXksIG9wdHMpO1xuICAgIH1cblxuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gJ2NsYXNzIFVpTWFuYWdlcic7XG4gICAgfVxufVxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiOyIsImltcG9ydCBNb2R1bGVNYW5hZ2VyIGZyb20gJy4vbW9kdWxlL21hbmFnZXJzL01vZHVsZU1hbmFnZXInO1xuaW1wb3J0IFRlbXBsYXRlTWFuYWdlciBmcm9tICcuL21vZHVsZS9tYW5hZ2Vycy9UZW1wbGF0ZU1hbmFnZXInO1xuXG5pbXBvcnQgbW9kdWxlSnNvbiBmcm9tICcuLi9tb2R1bGUuanNvbic7XG5cbkhvb2tzLm9uY2UoJ2luaXQnLCBhc3luYyAoKSA9PiB7XG4gICAgY29uc29sZS5sb2coJ0ViZXJyb24gV2VzdCB8IEZvdW5kcnkgVlRUIE1vZHVsZScpO1xuXG4gICAgY29uc3Qgd2VhcG9uX3JlbG9hZCA9IG5ldyBNb2R1bGVNYW5hZ2VyKG1vZHVsZUpzb24uaWQpO1xuICAgIHdlYXBvbl9yZWxvYWQuZGVidWcodHJ1ZSk7XG4gICAgd2VhcG9uX3JlbG9hZC5pbml0KCk7XG59KTtcblxuaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAnZGV2ZWxvcG1lbnQnKSB7XG4gICAgaWYgKG1vZHVsZS5ob3QpIHtcbiAgICAgICAgbW9kdWxlLmhvdC5hY2NlcHQoKTtcblxuICAgICAgICBpZiAobW9kdWxlLmhvdC5zdGF0dXMoKSA9PT0gJ2FwcGx5Jykge1xuICAgICAgICAgICAgVGVtcGxhdGVNYW5hZ2VyLm9uSG90UmVsb2FkKCk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJleHBvcnQgZGVmYXVsdCBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyArIFwic3R5bGVzL21vZHVsZS5jc3NcIjsiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=