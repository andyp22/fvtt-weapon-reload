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
    constructor(featureManager) {
        super(featureManager);
    }
    init() {
        Hooks.on('dnd5e.postUseActivity', this.onUseActivity.bind(this));
    }
    async onUseActivity(activity) {
        if (activity.type === 'utility' && activity.name == 'Reload') {
            console.log('Weapon Reload | Triggered Reload');
            this.characterId = activity.actor.id;
            this.weaponId = activity.item.id;
            this.weaponReload();
        }
    }
    async weaponReload(refundAmmo = true) {
        const items = this.character?.items;
        const checkEquipped = game.settings.get(this.moduleManager.id, 'filterAmmunitionByEquipped');
        const currentLoadout = this.loadout;
        if (refundAmmo) {
            this.refundChamberedAmmo(this.ammunition(items));
        }
        const ammo = this.ammunition(items, checkEquipped);
        const inventoryAmmunition = [];
        ammo.forEach((ammoItem) => {
            if (ammoItem.system.quantity > 0) {
                inventoryAmmunition.push(ammoItem);
            }
        });
        await this.chooseAmmunition(inventoryAmmunition, currentLoadout);
    }
    refundChamberedAmmo(availableAmmunition) {
        const loadoutCounts = this.getLoadoutCounts(this.loadout);
        availableAmmunition.forEach(async (ammo) => {
            const name = ammo.name;
            if (loadoutCounts[name]) {
                await ammo.update({
                    'system.quantity': ammo.system.quantity + loadoutCounts[name],
                });
            }
        });
    }
    async chooseAmmunition(availableAmmunition, currentLoadout) {
        const dialogContent = await foundry.applications.handlebars.renderTemplate('modules/fvtt-weapon-reload/templates/ammoSelectionDialogTemplate.hbs', {
            loadoutSlots: new Array(parseInt(this.weapon.system.uses.max)).fill('Empty'),
            ammoOptions: availableAmmunition.map((ammoType) => {
                return {
                    name: ammoType.name,
                    value: ammoType.name,
                    count: ammoType.system.quantity,
                };
            }),
        });
        const dialogButtons = [
            {
                action: 'load',
                label: this.translate('WEAPON_RELOAD.Features.Reload.Ammunition.ChoiceDialogButtonTxtLoad'),
                callback: (_event, button) => {
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
                    return currentLoadout;
                },
            },
        ];
        this.moduleManager.uiManager
            .buildDialog({
            title: this.translate('WEAPON_RELOAD.Features.Reload.Ammunition.ChoiceDialogTitle'),
            content: dialogContent,
            buttons: dialogButtons,
            onSubmit: this.reloadReloadableWeapon.bind(this),
        }, 'ammo-choice-dialog')
            .render({ force: true });
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
        console.log('getLoadoutCounts: ', currentLoadout, loadout);
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
            const activationCard = html.querySelector('.activation-card');
            const itemcard = html.querySelector('.item-card');
            const parentElement = activationCard || itemcard;
            const checkUnstableAmmo = game.settings.get(this.moduleManager.id, 'unstableAmmo');
            const bullet = this.character.items.get(itemId);
            const criticalFailureMsg = checkUnstableAmmo &&
                bullet?.system.properties.find((prop) => {
                    return prop === 'unstable';
                })
                ? this.translate('WEAPON_RELOAD.Features.ReloadableWeaponAttack.MisfireUnstable')
                : this.translate('WEAPON_RELOAD.Features.ReloadableWeaponAttack.MisfireNatOne');
            const cardContentElement = parentElement.querySelector('.card-content');
            const wrapperElement = cardContentElement.querySelector('.wrapper');
            wrapperElement.insertAdjacentHTML('beforeend', `<p>${criticalFailureMsg}</p>`);
            if (itemcard && !activationCard) {
                const referenceElement = parentElement.querySelector('.card-header');
                const buttonContainer = document.createElement('div');
                buttonContainer.className = 'card-buttons';
                referenceElement.after(buttonContainer);
            }
            const cardButtonsElement = parentElement.querySelector('.card-buttons');
            const misfireBtn = document.createElement('button');
            misfireBtn.onclick = this.onClickMisfire.bind(this);
            misfireBtn.innerHTML = `${this.makeIcon('fa-burst')}${this.translate('WEAPON_RELOAD.Features.ReloadableWeaponAttack.MisfiredBtnTxt')}`;
            cardButtonsElement.append(misfireBtn);
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
            label: this.uiManager.getLocalizedTxt('ItemFeature'),
        };
        CONFIG.DND5E.itemProperties.concealable = {
            label: this.uiManager.getLocalizedTxt('Concealable'),
        };
        CONFIG.DND5E.validProperties.weapon.add('concealable');
        CONFIG.DND5E.itemProperties.unstable = {
            label: this.uiManager.getLocalizedTxt('Unstable'),
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
            default: true,
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
            window: { title: options.title },
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Ozs7Ozs7QUNyQkQsaUVBQWUscUJBQXVCLHNCQUFzQixFIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZnZ0dC13ZWFwb24tcmVsb2FkLy4vc3JjL21vZHVsZS9mZWF0dXJlcy9CYXNlRmVhdHVyZS50cyIsIndlYnBhY2s6Ly9mdnR0LXdlYXBvbi1yZWxvYWQvLi9zcmMvbW9kdWxlL2ZlYXR1cmVzL1JlbG9hZEZlYXR1cmUudHMiLCJ3ZWJwYWNrOi8vZnZ0dC13ZWFwb24tcmVsb2FkLy4vc3JjL21vZHVsZS9mZWF0dXJlcy9SZWxvYWRhYmxlV2VhcG9uQXR0YWNrRmVhdHVyZS50cyIsIndlYnBhY2s6Ly9mdnR0LXdlYXBvbi1yZWxvYWQvLi9zcmMvbW9kdWxlL2ZlYXR1cmVzL1JlbG9hZGFibGVXZWFwb25DcmVhdGlvbkZlYXR1cmUudHMiLCJ3ZWJwYWNrOi8vZnZ0dC13ZWFwb24tcmVsb2FkLy4vc3JjL21vZHVsZS9mZWF0dXJlcy9pbmRleC50cyIsIndlYnBhY2s6Ly9mdnR0LXdlYXBvbi1yZWxvYWQvLi9zcmMvbW9kdWxlL21hbmFnZXJzL0ZlYXR1cmVNYW5hZ2VyLnRzIiwid2VicGFjazovL2Z2dHQtd2VhcG9uLXJlbG9hZC8uL3NyYy9tb2R1bGUvbWFuYWdlcnMvTW9kdWxlTWFuYWdlci50cyIsIndlYnBhY2s6Ly9mdnR0LXdlYXBvbi1yZWxvYWQvLi9zcmMvbW9kdWxlL21hbmFnZXJzL1RlbXBsYXRlTWFuYWdlci50cyIsIndlYnBhY2s6Ly9mdnR0LXdlYXBvbi1yZWxvYWQvLi9zcmMvbW9kdWxlL21hbmFnZXJzL1VpTWFuYWdlci50cyIsIndlYnBhY2s6Ly9mdnR0LXdlYXBvbi1yZWxvYWQvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vZnZ0dC13ZWFwb24tcmVsb2FkL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9mdnR0LXdlYXBvbi1yZWxvYWQvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9mdnR0LXdlYXBvbi1yZWxvYWQvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9mdnR0LXdlYXBvbi1yZWxvYWQvd2VicGFjay9ydW50aW1lL3B1YmxpY1BhdGgiLCJ3ZWJwYWNrOi8vZnZ0dC13ZWFwb24tcmVsb2FkLy4vc3JjL2luZGV4LnRzIiwid2VicGFjazovL2Z2dHQtd2VhcG9uLXJlbG9hZC8uL3NyYy9zdHlsZXMvbW9kdWxlLnNjc3MiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEZlYXR1cmVNYW5hZ2VyIGZyb20gJy4uL21hbmFnZXJzL0ZlYXR1cmVNYW5hZ2VyJztcblxuaW1wb3J0IHsgRG5kQWN0b3I1ZSwgRG5kSXRlbTVlIH0gZnJvbSAnLi4vdHlwZXMvZG5kLnR5cGVzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQmFzZUZlYXR1cmUge1xuICAgIHByaXZhdGUgX2ZlYXR1cmVNYW5hZ2VyOiBGZWF0dXJlTWFuYWdlcjtcbiAgICBwcml2YXRlIF9hY3RvcklkOiBzdHJpbmc7XG4gICAgcHJpdmF0ZSBfd2VhcG9uSWQ6IHN0cmluZztcblxuICAgIGNvbnN0cnVjdG9yKGZlYXR1cmVNYW5hZ2VyOiBGZWF0dXJlTWFuYWdlcikge1xuICAgICAgICB0aGlzLl9mZWF0dXJlTWFuYWdlciA9IGZlYXR1cmVNYW5hZ2VyO1xuICAgICAgICB0aGlzLl9hY3RvcklkID0gJyc7XG4gICAgICAgIHRoaXMuX3dlYXBvbklkID0gJyc7XG4gICAgICAgIHRoaXMuaW5pdCgpO1xuICAgIH1cblxuICAgIGdldCBmZWF0dXJlTWFuYWdlcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ZlYXR1cmVNYW5hZ2VyO1xuICAgIH1cblxuICAgIGdldCBtb2R1bGVNYW5hZ2VyKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZmVhdHVyZU1hbmFnZXIubW9kdWxlTWFuYWdlcjtcbiAgICB9XG5cbiAgICBnZXQgY2hhcmFjdGVyKCk6IERuZEFjdG9yNWUge1xuICAgICAgICByZXR1cm4gZ2FtZT8uYWN0b3JzPy5nZXQodGhpcy5fYWN0b3JJZCkgYXMgRG5kQWN0b3I1ZTtcbiAgICB9XG5cbiAgICBnZXQgY2hhcmFjdGVySWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hY3RvcklkO1xuICAgIH1cblxuICAgIHNldCBjaGFyYWN0ZXJJZChpZDogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuX2FjdG9ySWQgPSBpZDtcbiAgICB9XG5cbiAgICBnZXQgd2VhcG9uKCk6IERuZEl0ZW01ZSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNoYXJhY3Rlci5pdGVtcy5nZXQodGhpcy5fd2VhcG9uSWQpIGFzIERuZEl0ZW01ZTtcbiAgICB9XG5cbiAgICBnZXQgd2VhcG9uSWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl93ZWFwb25JZDtcbiAgICB9XG5cbiAgICBzZXQgd2VhcG9uSWQoaWQ6IHN0cmluZykge1xuICAgICAgICB0aGlzLl93ZWFwb25JZCA9IGlkO1xuICAgIH1cblxuICAgIGdldCBsb2Fkb3V0KCkge1xuICAgICAgICBjb25zdCByZWxvYWRhYmxlV2VhcG9uID0gdGhpcy53ZWFwb247XG4gICAgICAgIGNvbnN0IG1heFNob3RzID0gcGFyc2VJbnQocmVsb2FkYWJsZVdlYXBvbi5zeXN0ZW0udXNlcy5tYXgpO1xuICAgICAgICBjb25zdCBjdXJyZW50TG9hZG91dCA9XG4gICAgICAgICAgICAocmVsb2FkYWJsZVdlYXBvbi5nZXRGbGFnKFxuICAgICAgICAgICAgICAgIHRoaXMubW9kdWxlTWFuYWdlci5pZCxcbiAgICAgICAgICAgICAgICAnY2hhbWJlcmVkJ1xuICAgICAgICAgICAgKSBhcyBzdHJpbmdbXSkgfHwgbmV3IEFycmF5KG1heFNob3RzKS5maWxsKCdFbXB0eScpO1xuXG4gICAgICAgIGlmIChjdXJyZW50TG9hZG91dC5sZW5ndGggPCBtYXhTaG90cykge1xuICAgICAgICAgICAgY29uc3QgbWlzc2luZyA9IG1heFNob3RzIC0gY3VycmVudExvYWRvdXQubGVuZ3RoO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBtaXNzaW5nOyBpKyspIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50TG9hZG91dC5wdXNoKCdFbXB0eScpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGN1cnJlbnRMb2Fkb3V0O1xuICAgIH1cblxuICAgIGdldCBmaXJlZCgpIHtcbiAgICAgICAgY29uc3QgcmVsb2FkYWJsZVdlYXBvbiA9IHRoaXMud2VhcG9uO1xuICAgICAgICBjb25zdCBtYXhTaG90cyA9IHBhcnNlSW50KHJlbG9hZGFibGVXZWFwb24uc3lzdGVtLnVzZXMubWF4KTtcbiAgICAgICAgY29uc3QgZmlyZWQgPVxuICAgICAgICAgICAgKHJlbG9hZGFibGVXZWFwb24uZ2V0RmxhZyhcbiAgICAgICAgICAgICAgICB0aGlzLm1vZHVsZU1hbmFnZXIuaWQsXG4gICAgICAgICAgICAgICAgJ2ZpcmVkJ1xuICAgICAgICAgICAgKSBhcyBzdHJpbmdbXSkgfHwgbmV3IEFycmF5KG1heFNob3RzKS5maWxsKCdFbXB0eScpO1xuXG4gICAgICAgIGlmIChmaXJlZC5sZW5ndGggPCBtYXhTaG90cykge1xuICAgICAgICAgICAgY29uc3QgbWlzc2luZyA9IG1heFNob3RzIC0gZmlyZWQubGVuZ3RoO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBtaXNzaW5nOyBpKyspIHtcbiAgICAgICAgICAgICAgICBmaXJlZC5wdXNoKCdFbXB0eScpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZpcmVkO1xuICAgIH1cblxuICAgIGFtbXVuaXRpb24oaXRlbXM6IENvbGxlY3Rpb248SXRlbTVlPiwgZXF1aXBwZWQ6IGJvb2xlYW4gPSBmYWxzZSk6IEl0ZW01ZVtdIHtcbiAgICAgICAgcmV0dXJuIGl0ZW1zLmZpbHRlcigoaXRlbTogSXRlbTVlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBnYW1lU3lzdGVtID0gKGl0ZW0gYXMgRG5kSXRlbTVlKS5zeXN0ZW07XG4gICAgICAgICAgICBpZiAoZXF1aXBwZWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICBpdGVtLnR5cGUgPT0gJ2NvbnN1bWFibGUnICYmXG4gICAgICAgICAgICAgICAgICAgIGdhbWVTeXN0ZW0udHlwZS5zdWJ0eXBlID09ICdmaXJlYXJtQnVsbGV0JyAmJlxuICAgICAgICAgICAgICAgICAgICBnYW1lU3lzdGVtLmVxdWlwcGVkXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgaXRlbS50eXBlID09ICdjb25zdW1hYmxlJyAmJlxuICAgICAgICAgICAgICAgIGdhbWVTeXN0ZW0udHlwZS5zdWJ0eXBlID09ICdmaXJlYXJtQnVsbGV0J1xuICAgICAgICAgICAgKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgaW5pdCgpIHt9XG5cbiAgICB0cmFuc2xhdGUoa2V5OiBzdHJpbmcsIG9wdHM/OiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9LCBmb3JtYXQ/OiBib29sZWFuKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1vZHVsZU1hbmFnZXIudWlNYW5hZ2VyLmdldExvY2FsaXplZFR4dChrZXksIG9wdHMsIGZvcm1hdCk7XG4gICAgfVxuXG4gICAgdG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiAnY2xhc3MgQmFzZUZlYXR1cmUnO1xuICAgIH1cbn1cbiIsImltcG9ydCBGZWF0dXJlTWFuYWdlciBmcm9tICcuLi9tYW5hZ2Vycy9GZWF0dXJlTWFuYWdlcic7XG5pbXBvcnQgeyBEbmRBY3RvcjVlLCBEbmRJdGVtNWUgfSBmcm9tICcuLi90eXBlcy9kbmQudHlwZXMnO1xuaW1wb3J0IEJhc2VGZWF0dXJlIGZyb20gJy4vQmFzZUZlYXR1cmUnO1xuXG5leHBvcnQgY2xhc3MgUmVsb2FkRmVhdHVyZSBleHRlbmRzIEJhc2VGZWF0dXJlIHtcbiAgICBjb25zdHJ1Y3RvcihmZWF0dXJlTWFuYWdlcjogRmVhdHVyZU1hbmFnZXIpIHtcbiAgICAgICAgc3VwZXIoZmVhdHVyZU1hbmFnZXIpO1xuICAgIH1cblxuICAgIGluaXQoKSB7XG4gICAgICAgIEhvb2tzLm9uKCdkbmQ1ZS5wb3N0VXNlQWN0aXZpdHknLCB0aGlzLm9uVXNlQWN0aXZpdHkuYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgYXN5bmMgb25Vc2VBY3Rpdml0eShhY3Rpdml0eTogYW55KSB7XG4gICAgICAgIGlmIChhY3Rpdml0eS50eXBlID09PSAndXRpbGl0eScgJiYgYWN0aXZpdHkubmFtZSA9PSAnUmVsb2FkJykge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1dlYXBvbiBSZWxvYWQgfCBUcmlnZ2VyZWQgUmVsb2FkJyk7XG5cbiAgICAgICAgICAgIHRoaXMuY2hhcmFjdGVySWQgPSBhY3Rpdml0eS5hY3Rvci5pZDtcbiAgICAgICAgICAgIHRoaXMud2VhcG9uSWQgPSBhY3Rpdml0eS5pdGVtLmlkO1xuICAgICAgICAgICAgdGhpcy53ZWFwb25SZWxvYWQoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFzeW5jIHdlYXBvblJlbG9hZChyZWZ1bmRBbW1vOiBib29sZWFuID0gdHJ1ZSkge1xuICAgICAgICBjb25zdCBpdGVtcyA9IHRoaXMuY2hhcmFjdGVyPy5pdGVtcztcbiAgICAgICAgY29uc3QgY2hlY2tFcXVpcHBlZCA9IGdhbWUuc2V0dGluZ3MuZ2V0KFxuICAgICAgICAgICAgdGhpcy5tb2R1bGVNYW5hZ2VyLmlkLFxuICAgICAgICAgICAgJ2ZpbHRlckFtbXVuaXRpb25CeUVxdWlwcGVkJ1xuICAgICAgICApIGFzIGJvb2xlYW47XG4gICAgICAgIGNvbnN0IGN1cnJlbnRMb2Fkb3V0ID0gdGhpcy5sb2Fkb3V0O1xuXG4gICAgICAgIGlmIChyZWZ1bmRBbW1vKSB7XG4gICAgICAgICAgICB0aGlzLnJlZnVuZENoYW1iZXJlZEFtbW8odGhpcy5hbW11bml0aW9uKGl0ZW1zKSBhcyBEbmRJdGVtNWVbXSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBhbW1vID0gdGhpcy5hbW11bml0aW9uKGl0ZW1zLCBjaGVja0VxdWlwcGVkKSBhcyBEbmRJdGVtNWVbXTtcbiAgICAgICAgY29uc3QgaW52ZW50b3J5QW1tdW5pdGlvbjogRG5kSXRlbTVlW10gPSBbXTtcblxuICAgICAgICBhbW1vLmZvckVhY2goKGFtbW9JdGVtOiBEbmRJdGVtNWUpID0+IHtcbiAgICAgICAgICAgIGlmIChhbW1vSXRlbS5zeXN0ZW0ucXVhbnRpdHkgPiAwKSB7XG4gICAgICAgICAgICAgICAgaW52ZW50b3J5QW1tdW5pdGlvbi5wdXNoKGFtbW9JdGVtKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgYXdhaXQgdGhpcy5jaG9vc2VBbW11bml0aW9uKGludmVudG9yeUFtbXVuaXRpb24sIGN1cnJlbnRMb2Fkb3V0KTtcbiAgICB9XG5cbiAgICByZWZ1bmRDaGFtYmVyZWRBbW1vKGF2YWlsYWJsZUFtbXVuaXRpb246IERuZEl0ZW01ZVtdKSB7XG4gICAgICAgIGNvbnN0IGxvYWRvdXRDb3VudHMgPSB0aGlzLmdldExvYWRvdXRDb3VudHModGhpcy5sb2Fkb3V0KTtcbiAgICAgICAgYXZhaWxhYmxlQW1tdW5pdGlvbi5mb3JFYWNoKGFzeW5jIChhbW1vOiBEbmRJdGVtNWUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5hbWUgPSBhbW1vLm5hbWU7XG4gICAgICAgICAgICBpZiAobG9hZG91dENvdW50c1tuYW1lXSkge1xuICAgICAgICAgICAgICAgIGF3YWl0IGFtbW8udXBkYXRlKHtcbiAgICAgICAgICAgICAgICAgICAgJ3N5c3RlbS5xdWFudGl0eSc6XG4gICAgICAgICAgICAgICAgICAgICAgICBhbW1vLnN5c3RlbS5xdWFudGl0eSArIGxvYWRvdXRDb3VudHNbbmFtZV0sXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGFzeW5jIGNob29zZUFtbXVuaXRpb24oXG4gICAgICAgIGF2YWlsYWJsZUFtbXVuaXRpb246IERuZEl0ZW01ZVtdLFxuICAgICAgICBjdXJyZW50TG9hZG91dDogc3RyaW5nW11cbiAgICApIHtcbiAgICAgICAgY29uc3QgZGlhbG9nQ29udGVudCA9IGF3YWl0IChcbiAgICAgICAgICAgIGZvdW5kcnkuYXBwbGljYXRpb25zIGFzIGFueVxuICAgICAgICApLmhhbmRsZWJhcnMucmVuZGVyVGVtcGxhdGUoXG4gICAgICAgICAgICAnbW9kdWxlcy9mdnR0LXdlYXBvbi1yZWxvYWQvdGVtcGxhdGVzL2FtbW9TZWxlY3Rpb25EaWFsb2dUZW1wbGF0ZS5oYnMnLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGxvYWRvdXRTbG90czogbmV3IEFycmF5KFxuICAgICAgICAgICAgICAgICAgICBwYXJzZUludCh0aGlzLndlYXBvbi5zeXN0ZW0udXNlcy5tYXgpXG4gICAgICAgICAgICAgICAgKS5maWxsKCdFbXB0eScpLFxuICAgICAgICAgICAgICAgIGFtbW9PcHRpb25zOiBhdmFpbGFibGVBbW11bml0aW9uLm1hcCgoYW1tb1R5cGU6IERuZEl0ZW01ZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogYW1tb1R5cGUubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBhbW1vVHlwZS5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgY291bnQ6IGFtbW9UeXBlLnN5c3RlbS5xdWFudGl0eSxcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcblxuICAgICAgICBjb25zdCBkaWFsb2dCdXR0b25zID0gW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGFjdGlvbjogJ2xvYWQnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiB0aGlzLnRyYW5zbGF0ZShcbiAgICAgICAgICAgICAgICAgICAgJ1dFQVBPTl9SRUxPQUQuRmVhdHVyZXMuUmVsb2FkLkFtbXVuaXRpb24uQ2hvaWNlRGlhbG9nQnV0dG9uVHh0TG9hZCdcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIGNhbGxiYWNrOiAoX2V2ZW50LCBidXR0b24pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbG9hZG91dDogc3RyaW5nW10gPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBidXR0b24uZm9ybS5lbGVtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZWxtID0gYnV0dG9uLmZvcm0uZWxlbWVudHMuaXRlbShpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlbG0ubmFtZSA9PSAnYW1tby1zZWxlY3QnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9hZG91dC5wdXNoKGVsbS52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxvYWRvdXQ7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYWN0aW9uOiAnY2FuY2VsJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogdGhpcy50cmFuc2xhdGUoXG4gICAgICAgICAgICAgICAgICAgICdXRUFQT05fUkVMT0FELkZlYXR1cmVzLlJlbG9hZC5BbW11bml0aW9uLkNob2ljZURpYWxvZ0J1dHRvblR4dENhbmNlbCdcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIGNhbGxiYWNrOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjdXJyZW50TG9hZG91dDtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgXTtcblxuICAgICAgICB0aGlzLm1vZHVsZU1hbmFnZXIudWlNYW5hZ2VyXG4gICAgICAgICAgICAuYnVpbGREaWFsb2coXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICB0aXRsZTogdGhpcy50cmFuc2xhdGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAnV0VBUE9OX1JFTE9BRC5GZWF0dXJlcy5SZWxvYWQuQW1tdW5pdGlvbi5DaG9pY2VEaWFsb2dUaXRsZSdcbiAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgY29udGVudDogZGlhbG9nQ29udGVudCxcbiAgICAgICAgICAgICAgICAgICAgYnV0dG9uczogZGlhbG9nQnV0dG9ucyxcbiAgICAgICAgICAgICAgICAgICAgb25TdWJtaXQ6IHRoaXMucmVsb2FkUmVsb2FkYWJsZVdlYXBvbi5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgJ2FtbW8tY2hvaWNlLWRpYWxvZydcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgIC5yZW5kZXIoeyBmb3JjZTogdHJ1ZSB9KTtcbiAgICB9XG5cbiAgICBhc3luYyByZWxvYWRSZWxvYWRhYmxlV2VhcG9uKGxvYWRvdXQ6IHN0cmluZ1tdKSB7XG4gICAgICAgIGNvbnN0IHJlbG9hZGFibGVXZWFwb24gPSB0aGlzLndlYXBvbjtcbiAgICAgICAgY29uc3QgYW1tb0NvdW50cyA9IHRoaXMuZ2V0TG9hZG91dENvdW50cyhsb2Fkb3V0KTtcblxuICAgICAgICBpZiAodGhpcy5yZW1vdmVMb2Fkb3V0KGFtbW9Db3VudHMpKSB7XG4gICAgICAgICAgICAvLyBVcGRhdGUgdGhlIHJlbG9hZGFibGVXZWFwb24gdXNlc1xuICAgICAgICAgICAgbGV0IHF0eSA9IDA7XG4gICAgICAgICAgICBpZiAoYW1tb0NvdW50c1snRW1wdHknXSA+IDApIHtcbiAgICAgICAgICAgICAgICAvLyBBZGp1c3Qgc3BlbnQgdXNlcyBieSB0aGUgbnVtYmVyIG9mIEVtcHR5IHNsb3RzXG4gICAgICAgICAgICAgICAgcXR5ICs9IGFtbW9Db3VudHNbJ0VtcHR5J107XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhd2FpdCByZWxvYWRhYmxlV2VhcG9uLnVwZGF0ZSh7XG4gICAgICAgICAgICAgICAgJ3N5c3RlbS51c2VzLnNwZW50JzogcXR5LFxuICAgICAgICAgICAgICAgICdzeXN0ZW0udXNlcy52YWx1ZSc6XG4gICAgICAgICAgICAgICAgICAgIHBhcnNlSW50KHJlbG9hZGFibGVXZWFwb24uc3lzdGVtLnVzZXMubWF4KSAtIHF0eSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYXdhaXQgcmVsb2FkYWJsZVdlYXBvbi5zZXRGbGFnKFxuICAgICAgICAgICAgICAgIHRoaXMubW9kdWxlTWFuYWdlci5pZCxcbiAgICAgICAgICAgICAgICAnY2hhbWJlcmVkJyxcbiAgICAgICAgICAgICAgICBsb2Fkb3V0XG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgYXdhaXQgcmVsb2FkYWJsZVdlYXBvbi5zZXRGbGFnKFxuICAgICAgICAgICAgICAgIHRoaXMubW9kdWxlTWFuYWdlci5pZCxcbiAgICAgICAgICAgICAgICAnZmlyZWQnLFxuICAgICAgICAgICAgICAgIG5ldyBBcnJheShwYXJzZUludCh0aGlzLndlYXBvbi5zeXN0ZW0udXNlcy5tYXgpKS5maWxsKCdFbXB0eScpXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICBjb25zdCBodG1sVGVtcGxhdGUgPSBhd2FpdCAoXG4gICAgICAgICAgICAgICAgZm91bmRyeS5hcHBsaWNhdGlvbnMgYXMgYW55XG4gICAgICAgICAgICApLmhhbmRsZWJhcnMucmVuZGVyVGVtcGxhdGUoXG4gICAgICAgICAgICAgICAgJ21vZHVsZXMvZnZ0dC13ZWFwb24tcmVsb2FkL3RlbXBsYXRlcy9yZWxvYWRhYmxlV2VhcG9uUmVsb2FkVGVtcGxhdGUuaGJzJyxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW06IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGltZzogcmVsb2FkYWJsZVdlYXBvbi5pbWcsXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiByZWxvYWRhYmxlV2VhcG9uLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGZsYXZvcjogdGhpcy50cmFuc2xhdGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAnV0VBUE9OX1JFTE9BRC5GZWF0dXJlcy5SZWxvYWQuV2VhcG9uLldlYXBvblJlbG9hZGVkQ2hhdEZsYXZvcidcbiAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IHRoaXMudHJhbnNsYXRlKFxuICAgICAgICAgICAgICAgICAgICAgICAgJ1dFQVBPTl9SRUxPQUQuRmVhdHVyZXMuUmVsb2FkLldlYXBvbi5XZWFwb25SZWxvYWRlZENoYXRNc2cnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyByZWxvYWRhYmxlV2VhcG9uOiByZWxvYWRhYmxlV2VhcG9uLm5hbWUgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRydWVcbiAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgbG9hZG91dDogbG9hZG91dCxcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgLy8gTm90aWZ5IHRoZSBwZWVwc1xuICAgICAgICAgICAgdGhpcy5tb2R1bGVNYW5hZ2VyLnVpTWFuYWdlci5zZW5kQ2hhdCh0aGlzLmNoYXJhY3RlciwgaHRtbFRlbXBsYXRlKTtcbiAgICAgICAgICAgIHRoaXMuY2hhcmFjdGVySWQgPSAnJztcbiAgICAgICAgICAgIHRoaXMud2VhcG9uSWQgPSAnJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMud2VhcG9uUmVsb2FkKGZhbHNlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlbW92ZUxvYWRvdXQoY291bnRzOiB7IFtrZXk6IHN0cmluZ106IG51bWJlciB9KTogYm9vbGVhbiB7XG4gICAgICAgIGxldCBhbW11bml0aW9uQXZhaWxhYmxlID0gdHJ1ZTtcbiAgICAgICAgY29uc3QgaW52ZW50b3J5QW1tdW5pdGlvbiA9IHRoaXMuYW1tdW5pdGlvbihcbiAgICAgICAgICAgIHRoaXMuY2hhcmFjdGVyPy5pdGVtc1xuICAgICAgICApIGFzIERuZEl0ZW01ZVtdO1xuICAgICAgICBpbnZlbnRvcnlBbW11bml0aW9uLmZvckVhY2goKGFtbW86IERuZEl0ZW01ZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbmFtZSA9IGFtbW8ubmFtZTtcbiAgICAgICAgICAgIGNvbnN0IHF0eSA9IGFtbW8uc3lzdGVtLnF1YW50aXR5IC0gY291bnRzW25hbWVdO1xuXG4gICAgICAgICAgICAvLyBJZiBhbnkgYnVsbGV0IGlzIGFkZGVkIGJleW9uZCB0aGUgcXVhbnRpdHkgdGhlIHBsYXllciBhY3R1YWxseSBoYXMgdGhlbiB0aHJvdyBhbiBlcnJvciBhbmQgcmV0dXJuIGZhbHNlXG4gICAgICAgICAgICBpZiAocXR5IDwgMCkge1xuICAgICAgICAgICAgICAgIHRoaXMubW9kdWxlTWFuYWdlci51aU1hbmFnZXIudWlOb3RpZmljYXRpb24oXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudHJhbnNsYXRlKFxuICAgICAgICAgICAgICAgICAgICAgICAgJ1dFQVBPTl9SRUxPQUQuRmVhdHVyZXMuUmVsb2FkLldlYXBvbi5Mb2FkaW5nRXJyb3JNc2cnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBuYW1lOiBhbW1vLm5hbWUgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRydWVcbiAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgJ2Vycm9yJ1xuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgYW1tdW5pdGlvbkF2YWlsYWJsZSA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoYW1tdW5pdGlvbkF2YWlsYWJsZSkge1xuICAgICAgICAgICAgaW52ZW50b3J5QW1tdW5pdGlvbi5mb3JFYWNoKGFzeW5jIChhbW1vOiBEbmRJdGVtNWUpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBuYW1lID0gYW1tby5uYW1lO1xuICAgICAgICAgICAgICAgIGlmIChjb3VudHNbbmFtZV0pIHtcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgYW1tby51cGRhdGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgJ3N5c3RlbS5xdWFudGl0eSc6IGFtbW8uc3lzdGVtLnF1YW50aXR5IC0gY291bnRzW25hbWVdLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBhbW11bml0aW9uQXZhaWxhYmxlO1xuICAgIH1cblxuICAgIGFzeW5jIG9uUmVsb2FkQ2FsbGJhY2soYWN0b3I6IERuZEFjdG9yNWUsIHdlYXBvbjogRG5kSXRlbTVlKSB7XG4gICAgICAgIHRoaXMuY2hhcmFjdGVySWQgPSBhY3Rvci5pZDtcbiAgICAgICAgdGhpcy53ZWFwb25JZCA9IHdlYXBvbi5pZDtcblxuICAgICAgICB0aGlzLndlYXBvblJlbG9hZCgpO1xuICAgIH1cblxuICAgIGdldExvYWRvdXRDb3VudHMoY3VycmVudExvYWRvdXQ6IHN0cmluZ1tdKToge1xuICAgICAgICBba2V5OiBzdHJpbmddOiBudW1iZXI7XG4gICAgfSB7XG4gICAgICAgIGNvbnN0IGxvYWRvdXQgPSB7fTtcbiAgICAgICAgY3VycmVudExvYWRvdXQuZm9yRWFjaCgoYW1tbzogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICBpZiAoIWxvYWRvdXRbYW1tb10pIGxvYWRvdXRbYW1tb10gPSAwO1xuICAgICAgICAgICAgbG9hZG91dFthbW1vXSA9IGxvYWRvdXRbYW1tb10gKyAxO1xuICAgICAgICB9KTtcbiAgICAgICAgY29uc29sZS5sb2coJ2dldExvYWRvdXRDb3VudHM6ICcsIGN1cnJlbnRMb2Fkb3V0LCBsb2Fkb3V0KTtcbiAgICAgICAgcmV0dXJuIGxvYWRvdXQ7XG4gICAgfVxuXG4gICAgdG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiAnY2xhc3MgUmVsb2FkRmVhdHVyZSc7XG4gICAgfVxufVxuIiwiaW1wb3J0IEZlYXR1cmVNYW5hZ2VyIGZyb20gJy4uL21hbmFnZXJzL0ZlYXR1cmVNYW5hZ2VyJztcblxuaW1wb3J0IHtcbiAgICBEbmRBY3RvcjVlLFxuICAgIERuZEl0ZW01ZSxcbiAgICBEbmREMjBSb2xsLFxuICAgIERuZEF0dGFja0V2ZW50LFxufSBmcm9tICcuLi90eXBlcy9kbmQudHlwZXMnO1xuXG5pbXBvcnQgeyBBY3Rpdml0eUNhcmRDaGF0VHlwZSB9IGZyb20gJy4uL3R5cGVzL2NoYXQudHlwZXMnO1xuaW1wb3J0IEJhc2VGZWF0dXJlIGZyb20gJy4vQmFzZUZlYXR1cmUnO1xuXG5leHBvcnQgY2xhc3MgUmVsb2FkYWJsZVdlYXBvbkF0dGFja0ZlYXR1cmUgZXh0ZW5kcyBCYXNlRmVhdHVyZSB7XG4gICAgcHJpdmF0ZSBfbmV4dFJvdW5kOiB7XG4gICAgICAgIGlkOiBzdHJpbmc7XG4gICAgICAgIHR5cGU6IHN0cmluZztcbiAgICB9O1xuICAgIHByaXZhdGUgX2hvb2tJZDogbnVtYmVyO1xuXG4gICAgY29uc3RydWN0b3IoZmVhdHVyZU1hbmFnZXI6IEZlYXR1cmVNYW5hZ2VyKSB7XG4gICAgICAgIHN1cGVyKGZlYXR1cmVNYW5hZ2VyKTtcbiAgICAgICAgdGhpcy5fbmV4dFJvdW5kID0geyBpZDogJycsIHR5cGU6ICcnIH07XG4gICAgICAgIHRoaXMuX2hvb2tJZCA9IC0xO1xuICAgIH1cblxuICAgIGluaXQoKSB7XG4gICAgICAgIEhvb2tzLm9uKCdkbmQ1ZS5wb3N0Um9sbENvbmZpZ3VyYXRpb24nLCB0aGlzLm9uVXNlQWN0aXZpdHkuYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgYXN5bmMgb25Vc2VBY3Rpdml0eShkMjBSb2xsOiBEbmREMjBSb2xsW10sIGV2ZW50OiBEbmRBdHRhY2tFdmVudCkge1xuICAgICAgICBjb25zdCByb2xsID0gZDIwUm9sbFswXTtcbiAgICAgICAgY29uc3Qgd2VhcG9uRGF0YSA9IHJvbGw/LmRhdGE/Lml0ZW07XG4gICAgICAgIGlmICh3ZWFwb25EYXRhPy50eXBlPy5iYXNlSXRlbSAhPT0gJ3JlbG9hZGFibGVXZWFwb24nKSByZXR1cm47XG5cbiAgICAgICAgY29uc29sZS5sb2coJ1dlYXBvbiBSZWxvYWQgfCBUcmlnZ2VyZWQgQXR0YWNrJyk7XG4gICAgICAgIHRoaXMud2VhcG9uSWQgPSBldmVudC5zdWJqZWN0Lml0ZW0uaWQ7XG4gICAgICAgIHRoaXMuY2hhcmFjdGVySWQgPSBldmVudC5zdWJqZWN0LmFjdG9yLmlkO1xuXG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnJlbG9hZGFibGVXZWFwb25BdHRhY2soKTtcbiAgICB9XG5cbiAgICBhc3luYyByZWxvYWRhYmxlV2VhcG9uQXR0YWNrKCkge1xuICAgICAgICBjb25zdCBidWxsZXQgPSBhd2FpdCB0aGlzLmdldE5leHRSb3VuZCgpO1xuXG4gICAgICAgIGlmIChidWxsZXQubmFtZSA9PSAnRW1wdHknKSB7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLmRyeWZpcmVXZWFwb24oKTtcblxuICAgICAgICAgICAgLy8gU3RvcCB0aGUgYXR0YWNrIGlmIERyeWZpcmluZyB0aGUgd2VhcG9uXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9uZXh0Um91bmQgPSB7XG4gICAgICAgICAgICBpZDogYnVsbGV0LmlkLFxuICAgICAgICAgICAgdHlwZTogYnVsbGV0LnR5cGUsXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5faG9va0lkID0gSG9va3Mub24oXG4gICAgICAgICAgICAnZG5kNWUucmVuZGVyQ2hhdE1lc3NhZ2UnLFxuICAgICAgICAgICAgdGhpcy5vblJlbmRlckNoYXRNZXNzYWdlLmJpbmQodGhpcylcbiAgICAgICAgKTtcblxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5maXJlUm91bmQoYnVsbGV0KTtcbiAgICB9XG5cbiAgICBhc3luYyBvblJlbmRlckNoYXRNZXNzYWdlKG1lc3NhZ2UsIGh0bWwpIHtcbiAgICAgICAgY29uc3QgaXRlbUlkID0gbWVzc2FnZS5mbGFncy5kbmQ1ZT8uaXRlbS5pZDtcbiAgICAgICAgY29uc3QgaXRlbVR5cGUgPSBtZXNzYWdlLmZsYWdzLmRuZDVlPy5pdGVtLnR5cGU7XG4gICAgICAgIGlmIChcbiAgICAgICAgICAgIHRoaXMuX25leHRSb3VuZC5pZCA9PT0gaXRlbUlkICYmXG4gICAgICAgICAgICB0aGlzLl9uZXh0Um91bmQudHlwZSA9PT0gaXRlbVR5cGVcbiAgICAgICAgKSB7XG4gICAgICAgICAgICBIb29rcy5vZmYoJ2RuZDVlLnJlbmRlckNoYXRNZXNzYWdlJywgdGhpcy5faG9va0lkKTtcbiAgICAgICAgICAgIHRoaXMuX25leHRSb3VuZCA9IHsgaWQ6ICcnLCB0eXBlOiAnJyB9O1xuXG4gICAgICAgICAgICBjb25zdCBhY3RpdmF0aW9uQ2FyZCA9IGh0bWwucXVlcnlTZWxlY3RvcignLmFjdGl2YXRpb24tY2FyZCcpO1xuICAgICAgICAgICAgY29uc3QgaXRlbWNhcmQgPSBodG1sLnF1ZXJ5U2VsZWN0b3IoJy5pdGVtLWNhcmQnKTtcbiAgICAgICAgICAgIGNvbnN0IHBhcmVudEVsZW1lbnQgPSBhY3RpdmF0aW9uQ2FyZCB8fCBpdGVtY2FyZDtcblxuICAgICAgICAgICAgLy8gVW5zdGFibGUgYW1tbyBtZXNzYWdlXG4gICAgICAgICAgICBjb25zdCBjaGVja1Vuc3RhYmxlQW1tbyA9IGdhbWUuc2V0dGluZ3MuZ2V0KFxuICAgICAgICAgICAgICAgIHRoaXMubW9kdWxlTWFuYWdlci5pZCxcbiAgICAgICAgICAgICAgICAndW5zdGFibGVBbW1vJ1xuICAgICAgICAgICAgKSBhcyBib29sZWFuO1xuXG4gICAgICAgICAgICBjb25zdCBidWxsZXQgPSB0aGlzLmNoYXJhY3Rlci5pdGVtcy5nZXQoaXRlbUlkKSBhcyBEbmRJdGVtNWU7XG4gICAgICAgICAgICBjb25zdCBjcml0aWNhbEZhaWx1cmVNc2cgPVxuICAgICAgICAgICAgICAgIGNoZWNrVW5zdGFibGVBbW1vICYmXG4gICAgICAgICAgICAgICAgYnVsbGV0Py5zeXN0ZW0ucHJvcGVydGllcy5maW5kKChwcm9wOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHByb3AgPT09ICd1bnN0YWJsZSc7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgPyB0aGlzLnRyYW5zbGF0ZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgJ1dFQVBPTl9SRUxPQUQuRmVhdHVyZXMuUmVsb2FkYWJsZVdlYXBvbkF0dGFjay5NaXNmaXJlVW5zdGFibGUnXG4gICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICA6IHRoaXMudHJhbnNsYXRlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAnV0VBUE9OX1JFTE9BRC5GZWF0dXJlcy5SZWxvYWRhYmxlV2VhcG9uQXR0YWNrLk1pc2ZpcmVOYXRPbmUnXG4gICAgICAgICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgY29uc3QgY2FyZENvbnRlbnRFbGVtZW50ID1cbiAgICAgICAgICAgICAgICBwYXJlbnRFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jYXJkLWNvbnRlbnQnKTtcbiAgICAgICAgICAgIGNvbnN0IHdyYXBwZXJFbGVtZW50ID0gY2FyZENvbnRlbnRFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy53cmFwcGVyJyk7XG4gICAgICAgICAgICB3cmFwcGVyRWxlbWVudC5pbnNlcnRBZGphY2VudEhUTUwoXG4gICAgICAgICAgICAgICAgJ2JlZm9yZWVuZCcsXG4gICAgICAgICAgICAgICAgYDxwPiR7Y3JpdGljYWxGYWlsdXJlTXNnfTwvcD5gXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAvLyBBZGQgTWlzZmlyZSBhbmQgYW1tbyByZWZ1bmQgYnV0dG9uc1xuICAgICAgICAgICAgaWYgKGl0ZW1jYXJkICYmICFhY3RpdmF0aW9uQ2FyZCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlZmVyZW5jZUVsZW1lbnQgPVxuICAgICAgICAgICAgICAgICAgICBwYXJlbnRFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jYXJkLWhlYWRlcicpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGJ1dHRvbkNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgICAgIGJ1dHRvbkNvbnRhaW5lci5jbGFzc05hbWUgPSAnY2FyZC1idXR0b25zJztcbiAgICAgICAgICAgICAgICByZWZlcmVuY2VFbGVtZW50LmFmdGVyKGJ1dHRvbkNvbnRhaW5lcik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IGNhcmRCdXR0b25zRWxlbWVudCA9XG4gICAgICAgICAgICAgICAgcGFyZW50RWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuY2FyZC1idXR0b25zJyk7XG5cbiAgICAgICAgICAgIGNvbnN0IG1pc2ZpcmVCdG4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgICAgICAgICAgIG1pc2ZpcmVCdG4ub25jbGljayA9IHRoaXMub25DbGlja01pc2ZpcmUuYmluZCh0aGlzKTtcbiAgICAgICAgICAgIG1pc2ZpcmVCdG4uaW5uZXJIVE1MID0gYCR7dGhpcy5tYWtlSWNvbignZmEtYnVyc3QnKX0ke3RoaXMudHJhbnNsYXRlKFxuICAgICAgICAgICAgICAgICdXRUFQT05fUkVMT0FELkZlYXR1cmVzLlJlbG9hZGFibGVXZWFwb25BdHRhY2suTWlzZmlyZWRCdG5UeHQnXG4gICAgICAgICAgICApfWA7XG4gICAgICAgICAgICBjYXJkQnV0dG9uc0VsZW1lbnQuYXBwZW5kKG1pc2ZpcmVCdG4pO1xuXG4gICAgICAgICAgICBjb25zdCByZWZ1bmRCdG4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgICAgICAgICAgIHJlZnVuZEJ0bi5vbmNsaWNrID0gdGhpcy5vbkNsaWNrUmVmdW5kLmJpbmQodGhpcyk7XG4gICAgICAgICAgICByZWZ1bmRCdG4uaW5uZXJIVE1MID0gYCR7dGhpcy5tYWtlSWNvbignZmEtdW5kbycpfSR7dGhpcy50cmFuc2xhdGUoXG4gICAgICAgICAgICAgICAgJ1dFQVBPTl9SRUxPQUQuRmVhdHVyZXMuUmVsb2FkYWJsZVdlYXBvbkF0dGFjay5SZWZ1bmRCdG5UeHQnXG4gICAgICAgICAgICApfWA7XG4gICAgICAgICAgICBjYXJkQnV0dG9uc0VsZW1lbnQuYXBwZW5kKHJlZnVuZEJ0bik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhc3luYyBnZXROZXh0Um91bmQoKTogUHJvbWlzZTxEbmRJdGVtNWU+IHtcbiAgICAgICAgY29uc3QgY2hhcmFjdGVyID0gdGhpcy5jaGFyYWN0ZXI7XG4gICAgICAgIGNvbnN0IHdlYXBvbiA9IHRoaXMud2VhcG9uO1xuXG4gICAgICAgIGNvbnN0IGxvYWRvdXQgPSB0aGlzLmxvYWRvdXQ7XG4gICAgICAgIGxvYWRvdXQucHVzaCgnRW1wdHknKTtcbiAgICAgICAgY29uc3QgbmV4dFJvdW5kID0gbG9hZG91dC5zaGlmdCgpO1xuXG4gICAgICAgIC8vIFJlbW92ZSB0aGUgYnVsbGV0IGZyb20gdGhlIHJlbG9hZGFibGVXZWFwb24gYW1tdW5pdGlvblxuICAgICAgICBhd2FpdCB3ZWFwb24uc2V0RmxhZyh0aGlzLm1vZHVsZU1hbmFnZXIuaWQsICdjaGFtYmVyZWQnLCBsb2Fkb3V0KTtcblxuICAgICAgICBjb25zdCBpbnZlbnRvcnlBbW11bml0aW9uID0gdGhpcy5hbW11bml0aW9uKFxuICAgICAgICAgICAgY2hhcmFjdGVyLml0ZW1zXG4gICAgICAgICkgYXMgRG5kSXRlbTVlW107XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICBpbnZlbnRvcnlBbW11bml0aW9uLmZpbmQoKGFtbW86IERuZEl0ZW01ZSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5hbWUgPSBhbW1vLm5hbWU7XG4gICAgICAgICAgICAgICAgaWYgKG5hbWUgPT0gbmV4dFJvdW5kKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhbW1vO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH0pIHx8ICh7IG5hbWU6ICdFbXB0eScgfSBhcyBEbmRJdGVtNWUpXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgYXN5bmMgZHJ5ZmlyZVdlYXBvbigpIHtcbiAgICAgICAgY29uc3QgY2hhcmFjdGVyID0gdGhpcy5jaGFyYWN0ZXI7XG4gICAgICAgIGNvbnN0IHdlYXBvbiA9IHRoaXMud2VhcG9uO1xuXG4gICAgICAgIGNvbnN0IHJlbmRlckhvb2tJZCA9IEhvb2tzLm9uKFxuICAgICAgICAgICAgJ3JlbmRlckNoYXRNZXNzYWdlJyxcbiAgICAgICAgICAgIChfY2hhdEl0ZW0sIGh0bWwpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCByZWxvYWRCdG4gPSBodG1sWzBdLnF1ZXJ5U2VsZWN0b3IoJy5yZWxvYWQtYW1tbycpO1xuICAgICAgICAgICAgICAgIHJlbG9hZEJ0bj8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVsb2FkKGNoYXJhY3Rlciwgd2VhcG9uKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGlmIChyZWxvYWRCdG4pIHtcbiAgICAgICAgICAgICAgICAgICAgSG9va3Mub2ZmKCdyZW5kZXJDaGF0TWVzc2FnZScsIHJlbmRlckhvb2tJZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICApO1xuXG4gICAgICAgIGNvbnN0IHRlbXBsYXRlRGF0YTogQWN0aXZpdHlDYXJkQ2hhdFR5cGUgPSB7XG4gICAgICAgICAgICBkZXNjcmlwdGlvbjoge1xuICAgICAgICAgICAgICAgIGNoYXQ6IGA8cD4ke3RoaXMudHJhbnNsYXRlKFxuICAgICAgICAgICAgICAgICAgICAnV0VBUE9OX1JFTE9BRC5GZWF0dXJlcy5SZWxvYWRhYmxlV2VhcG9uQXR0YWNrLkRyeUZpcmVEZXNjcmlwdGlvbicsXG4gICAgICAgICAgICAgICAgICAgIHsgbmFtZTogY2hhcmFjdGVyLm5hbWUsIHJlbG9hZGFibGVXZWFwb246IHdlYXBvbi5uYW1lIH0sXG4gICAgICAgICAgICAgICAgICAgIHRydWVcbiAgICAgICAgICAgICAgICApfTwvcD5gLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGl0ZW06IHtcbiAgICAgICAgICAgICAgICBpbWc6IHdlYXBvbi5pbWcsXG4gICAgICAgICAgICAgICAgbmFtZTogdGhpcy50cmFuc2xhdGUoXG4gICAgICAgICAgICAgICAgICAgICdXRUFQT05fUkVMT0FELkZlYXR1cmVzLlJlbG9hZGFibGVXZWFwb25BdHRhY2suRHJ5RmlyZVRpdGxlJ1xuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc3VidGl0bGU6IHdlYXBvbi5uYW1lLFxuICAgICAgICAgICAgYnV0dG9uczogW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YXNldDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmlzaWJpbGl0eTogJ2FsbCcsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGljb246IHRoaXMubWFrZUljb24oJ2ZhLXJvdGF0ZS1yaWdodCcpLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogdGhpcy50cmFuc2xhdGUoJ1dFQVBPTl9SRUxPQUQuRmVhdHVyZXMuUmVsb2FkLlRleHQnKSxcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NlczogJ3JlbG9hZC1hbW1vJyxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBodG1sVGVtcGxhdGUgPSBhd2FpdCAoXG4gICAgICAgICAgICBmb3VuZHJ5LmFwcGxpY2F0aW9ucyBhcyBhbnlcbiAgICAgICAgKS5oYW5kbGViYXJzLnJlbmRlclRlbXBsYXRlKFxuICAgICAgICAgICAgJ21vZHVsZXMvZnZ0dC13ZWFwb24tcmVsb2FkL3RlbXBsYXRlcy9vdmVycmlkZXMvYWN0aXZpdHktY2FyZC5oYnMnLFxuICAgICAgICAgICAgdGVtcGxhdGVEYXRhXG4gICAgICAgICk7XG4gICAgICAgIHRoaXMubW9kdWxlTWFuYWdlci51aU1hbmFnZXIuc2VuZENoYXQoY2hhcmFjdGVyLCBodG1sVGVtcGxhdGUpO1xuICAgIH1cblxuICAgIGFzeW5jIGZpcmVSb3VuZChidWxsZXQ6IERuZEl0ZW01ZSkge1xuICAgICAgICBjb25zdCByZWxvYWRhYmxlV2VhcG9uID0gdGhpcy53ZWFwb247XG4gICAgICAgIGNvbnN0IG1heFNob3RzID0gcGFyc2VJbnQocmVsb2FkYWJsZVdlYXBvbi5zeXN0ZW0udXNlcy5tYXgpO1xuICAgICAgICBjb25zdCBmaXJlZExvYWRvdXQgPVxuICAgICAgICAgICAgKHJlbG9hZGFibGVXZWFwb24uZ2V0RmxhZyhcbiAgICAgICAgICAgICAgICB0aGlzLm1vZHVsZU1hbmFnZXIuaWQsXG4gICAgICAgICAgICAgICAgJ2ZpcmVkJ1xuICAgICAgICAgICAgKSBhcyBzdHJpbmdbXSkgfHwgbmV3IEFycmF5KG1heFNob3RzKS5maWxsKCdFbXB0eScpO1xuXG4gICAgICAgIGZpcmVkTG9hZG91dC51bnNoaWZ0KGJ1bGxldC5uYW1lKTtcbiAgICAgICAgZmlyZWRMb2Fkb3V0LnNwbGljZSgtMSk7XG4gICAgICAgIGF3YWl0IHJlbG9hZGFibGVXZWFwb24uc2V0RmxhZyhcbiAgICAgICAgICAgIHRoaXMubW9kdWxlTWFuYWdlci5pZCxcbiAgICAgICAgICAgICdmaXJlZCcsXG4gICAgICAgICAgICBmaXJlZExvYWRvdXRcbiAgICAgICAgKTtcblxuICAgICAgICBjb25zdCB1c2VzID0gcmVsb2FkYWJsZVdlYXBvbi5zeXN0ZW0udXNlcztcbiAgICAgICAgY29uc3QgcXR5OiBudW1iZXIgPVxuICAgICAgICAgICAgdXNlcy5zcGVudCArIDEgPD0gcGFyc2VJbnQodXNlcy5tYXgpXG4gICAgICAgICAgICAgICAgPyB1c2VzLnNwZW50ICsgMVxuICAgICAgICAgICAgICAgIDogcGFyc2VJbnQodXNlcy5tYXgpO1xuXG4gICAgICAgIGF3YWl0IHJlbG9hZGFibGVXZWFwb24udXBkYXRlKHtcbiAgICAgICAgICAgICdzeXN0ZW0udXNlcy5zcGVudCc6IHF0eSxcbiAgICAgICAgICAgICdzeXN0ZW0udXNlcy52YWx1ZSc6IHBhcnNlSW50KHVzZXMubWF4KSAtIHF0eSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGJ1bGxldC51c2UoKTtcbiAgICB9XG5cbiAgICByZWxvYWQoYWN0b3I6IERuZEFjdG9yNWUsIHJlbG9hZGFibGVXZWFwb246IERuZEl0ZW01ZSkge1xuICAgICAgICB0aGlzLmZlYXR1cmVNYW5hZ2VyXG4gICAgICAgICAgICAuZ2V0RmVhdHVyZSgncmVsb2FkJylcbiAgICAgICAgICAgIC5vblJlbG9hZENhbGxiYWNrKGFjdG9yLCByZWxvYWRhYmxlV2VhcG9uKTtcbiAgICB9XG5cbiAgICBhc3luYyBvbkNsaWNrUmVmdW5kKCkge1xuICAgICAgICBjb25zdCBhY3RvciA9IHRoaXMuY2hhcmFjdGVyO1xuICAgICAgICBjb25zdCByZWxvYWRhYmxlV2VhcG9uID0gdGhpcy53ZWFwb247XG4gICAgICAgIGNvbnN0IGludmVudG9yeUFtbXVuaXRpb24gPSB0aGlzLmFtbXVuaXRpb24oYWN0b3IuaXRlbXMpO1xuXG4gICAgICAgIGNvbnN0IGZpcmVkID0gdGhpcy5maXJlZDtcbiAgICAgICAgY29uc3QgcmVmdW5kOiBzdHJpbmcgPSBmaXJlZC5zcGxpY2UoMCwgMSlbMF0gYXMgc3RyaW5nO1xuICAgICAgICBmaXJlZC5wdXNoKCdFbXB0eScpO1xuXG4gICAgICAgIGlmIChyZWZ1bmQgPT0gJ0VtcHR5Jykge1xuICAgICAgICAgICAgLy8gTm90aWZ5IHRoZSB1c2VyIHRoYXQgdGhlcmUgaXMgbm8gYW1tdW5pdGlvbiB0byByZWZ1bmRcbiAgICAgICAgICAgIHRoaXMubW9kdWxlTWFuYWdlci51aU1hbmFnZXIudWlOb3RpZmljYXRpb24oXG4gICAgICAgICAgICAgICAgdGhpcy50cmFuc2xhdGUoXG4gICAgICAgICAgICAgICAgICAgICdXRUFQT05fUkVMT0FELkZlYXR1cmVzLlJlbG9hZGFibGVXZWFwb25BdHRhY2suUmVmdW5kLlJlZnVuZE5vTW9yZU1zZycsXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGFjdG9yLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICByZWxvYWRhYmxlV2VhcG9uOiByZWxvYWRhYmxlV2VhcG9uLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHRydWVcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICd3YXJuJ1xuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGF3YWl0IHJlbG9hZGFibGVXZWFwb24uc2V0RmxhZyh0aGlzLm1vZHVsZU1hbmFnZXIuaWQsICdmaXJlZCcsIGZpcmVkKTtcblxuICAgICAgICBsZXQgYnVsbGV0ID0geyBuYW1lOiByZWZ1bmQgfSBhcyBEbmRJdGVtNWU7XG4gICAgICAgIGludmVudG9yeUFtbXVuaXRpb24uZm9yRWFjaCgoYW1tbzogSXRlbTVlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBuYW1lID0gYW1tby5uYW1lO1xuICAgICAgICAgICAgaWYgKG5hbWUgPT0gcmVmdW5kKSB7XG4gICAgICAgICAgICAgICAgYnVsbGV0ID0gYW1tbyBhcyBEbmRJdGVtNWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIFJlZnVuZCB0aGUgbm9uLUVtcHR5IGFtbXVuaXRpb25cbiAgICAgICAgY29uc3QgYW1tb0xvYWRvdXQgPSB0aGlzLmxvYWRvdXQ7XG4gICAgICAgIGFtbW9Mb2Fkb3V0LnVuc2hpZnQocmVmdW5kKTtcbiAgICAgICAgYW1tb0xvYWRvdXQuc3BsaWNlKC0xKTtcbiAgICAgICAgYXdhaXQgcmVsb2FkYWJsZVdlYXBvbi5zZXRGbGFnKFxuICAgICAgICAgICAgdGhpcy5tb2R1bGVNYW5hZ2VyLmlkLFxuICAgICAgICAgICAgJ2NoYW1iZXJlZCcsXG4gICAgICAgICAgICBhbW1vTG9hZG91dFxuICAgICAgICApO1xuXG4gICAgICAgIC8vIFVwZGF0ZSB0aGUgcmVsb2FkYWJsZVdlYXBvbiB1c2VzXG4gICAgICAgIGNvbnN0IHVzZXMgPSByZWxvYWRhYmxlV2VhcG9uLnN5c3RlbS51c2VzO1xuICAgICAgICBjb25zdCBxdHk6IG51bWJlciA9IHVzZXMuc3BlbnQgLSAxID49IDAgPyB1c2VzLnNwZW50IC0gMSA6IDA7XG4gICAgICAgIHJlbG9hZGFibGVXZWFwb24udXBkYXRlKHtcbiAgICAgICAgICAgICdzeXN0ZW0udXNlcy5zcGVudCc6IHF0eSxcbiAgICAgICAgICAgICdzeXN0ZW0udXNlcy52YWx1ZSc6IHBhcnNlSW50KHVzZXMubWF4KSAtIHF0eSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gTm90aWZ5IHRoZSB1c2VyIHRoYXQgdGhlIHJlZnVuZCB3YXMgYSBzdWNjZXNzXG4gICAgICAgIGNvbnN0IGh0bWxUZW1wbGF0ZSA9IGF3YWl0IChcbiAgICAgICAgICAgIGZvdW5kcnkuYXBwbGljYXRpb25zIGFzIGFueVxuICAgICAgICApLmhhbmRsZWJhcnMucmVuZGVyVGVtcGxhdGUoXG4gICAgICAgICAgICAnbW9kdWxlcy9mdnR0LXdlYXBvbi1yZWxvYWQvdGVtcGxhdGVzL2FtbW9SZWZ1bmROb3RpY2VUZW1wbGF0ZS5oYnMnLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGl0ZW06IHtcbiAgICAgICAgICAgICAgICAgICAgaW1nOiBidWxsZXQuaW1nLFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiBidWxsZXQubmFtZSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiB0aGlzLnRyYW5zbGF0ZShcbiAgICAgICAgICAgICAgICAgICAgJ1dFQVBPTl9SRUxPQUQuRmVhdHVyZXMuUmVsb2FkYWJsZVdlYXBvbkF0dGFjay5SZWZ1bmQuUmVmdW5kQ29tcGxldGVNc2cnLFxuICAgICAgICAgICAgICAgICAgICB7IGJ1bGxldDogcmVmdW5kLCBuYW1lOiByZWxvYWRhYmxlV2VhcG9uLm5hbWUgfSxcbiAgICAgICAgICAgICAgICAgICAgdHJ1ZVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgdGl0bGU6IHRoaXMudHJhbnNsYXRlKFxuICAgICAgICAgICAgICAgICAgICAnV0VBUE9OX1JFTE9BRC5GZWF0dXJlcy5SZWxvYWRhYmxlV2VhcG9uQXR0YWNrLlJlZnVuZC5SZWZ1bmRDb21wbGV0ZVRpdGxlJ1xuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgICAgIHRoaXMubW9kdWxlTWFuYWdlci51aU1hbmFnZXIuc2VuZENoYXQoYWN0b3IsIGh0bWxUZW1wbGF0ZSk7XG4gICAgfVxuXG4gICAgYXN5bmMgb25DbGlja01pc2ZpcmUoKSB7XG4gICAgICAgIGNvbnN0IGFjdG9yID0gdGhpcy5jaGFyYWN0ZXI7XG4gICAgICAgIGNvbnN0IHJvbGwgPSBhd2FpdCBuZXcgUm9sbCgnMWQ2Jykucm9sbCgpO1xuICAgICAgICBhd2FpdCByb2xsLnRvTWVzc2FnZSh7XG4gICAgICAgICAgICBzcGVha2VyOiB7XG4gICAgICAgICAgICAgICAgYWxpYXM6IGFjdG9yLm5hbWUsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBtYWtlSWNvbihpY29uOiBzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIGA8aSBjbGFzcz1cImZhcyAke2ljb259XCI+PC9pPmA7XG4gICAgfVxuXG4gICAgdG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiAnY2xhc3MgUmVsb2FkYWJsZVdlYXBvbkF0dGFja0ZlYXR1cmUnO1xuICAgIH1cbn1cbiIsImltcG9ydCBGZWF0dXJlTWFuYWdlciBmcm9tICcuLi9tYW5hZ2Vycy9GZWF0dXJlTWFuYWdlcic7XG5cbmltcG9ydCB7IERuZEl0ZW01ZSB9IGZyb20gJy4uL3R5cGVzL2RuZC50eXBlcyc7XG5pbXBvcnQgQmFzZUZlYXR1cmUgZnJvbSAnLi9CYXNlRmVhdHVyZSc7XG5cbmV4cG9ydCBjbGFzcyBSZWxvYWRhYmxlV2VhcG9uQ3JlYXRpb25GZWF0dXJlIGV4dGVuZHMgQmFzZUZlYXR1cmUge1xuICAgIHByaXZhdGUgX2NyZWF0aW5nUmVsb2FkYWJsZVdlYXBvbjogYm9vbGVhbjtcbiAgICBwcml2YXRlIF9jcmVhdGVJdGVtSG9va0lkOiBudW1iZXI7XG5cbiAgICBjb25zdHJ1Y3RvcihmZWF0dXJlTWFuYWdlcjogRmVhdHVyZU1hbmFnZXIpIHtcbiAgICAgICAgc3VwZXIoZmVhdHVyZU1hbmFnZXIpO1xuICAgICAgICB0aGlzLl9jcmVhdGluZ1JlbG9hZGFibGVXZWFwb24gPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fY3JlYXRlSXRlbUhvb2tJZCA9IC0xO1xuICAgIH1cblxuICAgIGluaXQoKSB7XG4gICAgICAgIEhvb2tzLm9uKCdwcmVDcmVhdGVJdGVtJywgdGhpcy5vblByZUNyZWF0ZUl0ZW0uYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgYXN5bmMgb25QcmVDcmVhdGVJdGVtKGl0ZW06IERuZEl0ZW01ZSkge1xuICAgICAgICBpZiAoaXRlbS5zeXN0ZW0udHlwZS5iYXNlSXRlbSA9PSAncmVsb2FkYWJsZVdlYXBvbicpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdXZWFwb24gUmVsb2FkIHwgVHJpZ2dlcmVkIFByZS1DcmVhdGlvbicpO1xuXG4gICAgICAgICAgICB0aGlzLndlYXBvbklkID0gaXRlbS5pZDtcbiAgICAgICAgICAgIHRoaXMuY2hhcmFjdGVySWQgPSBpdGVtLmFjdG9yPy5pZCBhcyBzdHJpbmc7XG4gICAgICAgICAgICB0aGlzLl9jcmVhdGluZ1JlbG9hZGFibGVXZWFwb24gPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5fY3JlYXRlSXRlbUhvb2tJZCA9IEhvb2tzLm9uKFxuICAgICAgICAgICAgICAgICdjcmVhdGVJdGVtJyxcbiAgICAgICAgICAgICAgICB0aGlzLm9uQ3JlYXRlSXRlbS5iaW5kKHRoaXMpXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgYXN5bmMgb25DcmVhdGVJdGVtKGl0ZW06IERuZEl0ZW01ZSkge1xuICAgICAgICBpZiAoIXRoaXMuX2NyZWF0aW5nUmVsb2FkYWJsZVdlYXBvbiB8fCBpdGVtLmlkICE9PSB0aGlzLndlYXBvbklkKVxuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKCdXZWFwb24gUmVsb2FkIHwgVHJpZ2dlcmVkIFJlbG9hZGFibGVXZWFwb24gQ3JlYXRpb24nKTtcblxuICAgICAgICBjb25zdCByZWxvYWRhYmxlV2VhcG9uID0gdGhpcy53ZWFwb247XG4gICAgICAgIGNvbnN0IGFtbW9RdHkgPSBwYXJzZUludChyZWxvYWRhYmxlV2VhcG9uLnN5c3RlbS51c2VzLm1heCk7XG5cbiAgICAgICAgYXdhaXQgcmVsb2FkYWJsZVdlYXBvbi51cGRhdGUoe1xuICAgICAgICAgICAgJ3N5c3RlbS51c2VzLnNwZW50JzogYW1tb1F0eSxcbiAgICAgICAgICAgICdzeXN0ZW0udXNlcy52YWx1ZSc6IDAsXG4gICAgICAgIH0pO1xuICAgICAgICBhd2FpdCByZWxvYWRhYmxlV2VhcG9uLnNldEZsYWcoXG4gICAgICAgICAgICB0aGlzLm1vZHVsZU1hbmFnZXIuaWQsXG4gICAgICAgICAgICAnY2hhbWJlcmVkJyxcbiAgICAgICAgICAgIG5ldyBBcnJheShhbW1vUXR5KS5maWxsKCdFbXB0eScpXG4gICAgICAgICk7XG4gICAgICAgIGF3YWl0IHJlbG9hZGFibGVXZWFwb24uc2V0RmxhZyhcbiAgICAgICAgICAgIHRoaXMubW9kdWxlTWFuYWdlci5pZCxcbiAgICAgICAgICAgICdmaXJlZCcsXG4gICAgICAgICAgICBuZXcgQXJyYXkoYW1tb1F0eSkuZmlsbCgnRW1wdHknKVxuICAgICAgICApO1xuXG4gICAgICAgIHRoaXMud2VhcG9uSWQgPSAnJztcbiAgICAgICAgdGhpcy5jaGFyYWN0ZXJJZCA9ICcnO1xuICAgICAgICB0aGlzLl9jcmVhdGluZ1JlbG9hZGFibGVXZWFwb24gPSBmYWxzZTtcbiAgICAgICAgSG9va3Mub2ZmKCdjcmVhdGVJdGVtJywgdGhpcy5fY3JlYXRlSXRlbUhvb2tJZCk7XG4gICAgICAgIHRoaXMuX2NyZWF0ZUl0ZW1Ib29rSWQgPSAtMTtcbiAgICB9XG5cbiAgICB0b1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuICdjbGFzcyBSZWxvYWRhYmxlV2VhcG9uQ3JlYXRpb25GZWF0dXJlJztcbiAgICB9XG59XG4iLCJleHBvcnQgeyBSZWxvYWRhYmxlV2VhcG9uQXR0YWNrRmVhdHVyZSB9IGZyb20gJy4vUmVsb2FkYWJsZVdlYXBvbkF0dGFja0ZlYXR1cmUnO1xuZXhwb3J0IHsgUmVsb2FkYWJsZVdlYXBvbkNyZWF0aW9uRmVhdHVyZSB9IGZyb20gJy4vUmVsb2FkYWJsZVdlYXBvbkNyZWF0aW9uRmVhdHVyZSc7XG5leHBvcnQgeyBSZWxvYWRGZWF0dXJlIH0gZnJvbSAnLi9SZWxvYWRGZWF0dXJlJztcbiIsImltcG9ydCBNb2R1bGVNYW5hZ2VyIGZyb20gJy4vTW9kdWxlTWFuYWdlcic7XG5pbXBvcnQge1xuICAgIFJlbG9hZGFibGVXZWFwb25BdHRhY2tGZWF0dXJlLFxuICAgIFJlbG9hZGFibGVXZWFwb25DcmVhdGlvbkZlYXR1cmUsXG4gICAgUmVsb2FkRmVhdHVyZSxcbn0gZnJvbSAnLi4vZmVhdHVyZXMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBGZWF0dXJlTWFuYWdlciB7XG4gICAgcHJpdmF0ZSBfbW9kdWxlTWFuYWdlcjogTW9kdWxlTWFuYWdlcjtcbiAgICBwcml2YXRlIF9mZWF0dXJlczogeyBba2V5OiBzdHJpbmddOiBhbnkgfTtcblxuICAgIGNvbnN0cnVjdG9yKG1vZHVsZU1hbmFnZXI6IE1vZHVsZU1hbmFnZXIpIHtcbiAgICAgICAgdGhpcy5fbW9kdWxlTWFuYWdlciA9IG1vZHVsZU1hbmFnZXI7XG4gICAgICAgIHRoaXMuX2ZlYXR1cmVzID0ge307XG4gICAgfVxuXG4gICAgaW5pdCgpIHtcbiAgICAgICAgdGhpcy5fZmVhdHVyZXMgPSB7XG4gICAgICAgICAgICByZWxvYWQ6IG5ldyBSZWxvYWRGZWF0dXJlKHRoaXMpLFxuICAgICAgICAgICAgcmVsb2FkYWJsZVdlYXBvbkF0dGFjazogbmV3IFJlbG9hZGFibGVXZWFwb25BdHRhY2tGZWF0dXJlKHRoaXMpLFxuICAgICAgICAgICAgcmVsb2FkYWJsZVdlYXBvbkNyZWF0aW9uOiBuZXcgUmVsb2FkYWJsZVdlYXBvbkNyZWF0aW9uRmVhdHVyZSh0aGlzKSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBnZXRGZWF0dXJlKGlkOiBzdHJpbmcpIHtcbiAgICAgICAgaWYgKHRoaXMuX2ZlYXR1cmVzW2lkXSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2ZlYXR1cmVzW2lkXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBnZXQgbW9kdWxlTWFuYWdlcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX21vZHVsZU1hbmFnZXI7XG4gICAgfVxuXG4gICAgdG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiBgY2xhc3MgRmVhdHVyZU1hbmFnZXI6ICR7dGhpcy5fZmVhdHVyZXMubGVuZ3RofWA7XG4gICAgfVxufVxuIiwiaW1wb3J0IEZlYXR1cmVNYW5hZ2VyIGZyb20gJy4vRmVhdHVyZU1hbmFnZXInO1xuaW1wb3J0IFVpTWFuYWdlciBmcm9tICcuL1VpTWFuYWdlcic7XG5pbXBvcnQgVGVtcGxhdGVNYW5hZ2VyIGZyb20gJy4vVGVtcGxhdGVNYW5hZ2VyJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTW9kdWxlTWFuYWdlciB7XG4gICAgcHJpdmF0ZSBfbW9kdWxlSWQ6IHN0cmluZztcbiAgICBwcml2YXRlIF9mZWF0dXJlTWFuYWdlcjogRmVhdHVyZU1hbmFnZXI7XG4gICAgcHJpdmF0ZSBfdWlNYW5hZ2VyOiBVaU1hbmFnZXI7XG4gICAgcHJpdmF0ZSBfdGVtcGxhdGVNYW5hZ2VyOiBUZW1wbGF0ZU1hbmFnZXI7XG5cbiAgICBjb25zdHJ1Y3RvcihpZDogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuX21vZHVsZUlkID0gaWQ7XG4gICAgICAgIHRoaXMuX2ZlYXR1cmVNYW5hZ2VyID0gbmV3IEZlYXR1cmVNYW5hZ2VyKHRoaXMpO1xuICAgICAgICB0aGlzLl91aU1hbmFnZXIgPSBuZXcgVWlNYW5hZ2VyKHRoaXMpO1xuICAgICAgICB0aGlzLl90ZW1wbGF0ZU1hbmFnZXIgPSBuZXcgVGVtcGxhdGVNYW5hZ2VyKCk7XG4gICAgfVxuXG4gICAgZ2V0IGlkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fbW9kdWxlSWQ7XG4gICAgfVxuXG4gICAgZ2V0IGZlYXR1cmVNYW5hZ2VyKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZmVhdHVyZU1hbmFnZXI7XG4gICAgfVxuXG4gICAgZ2V0IHVpTWFuYWdlcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3VpTWFuYWdlcjtcbiAgICB9XG5cbiAgICBnZXQgdGVtcGxhdGVNYW5hZ2VyKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fdGVtcGxhdGVNYW5hZ2VyO1xuICAgIH1cblxuICAgIGluaXQoKSB7XG4gICAgICAgIHRoaXMuc3lzdGVtT3ZlcnJpZGVzKCk7XG4gICAgICAgIHRoaXMubW9kdWxlQ29uZmlndXJhdGlvbnMoKTtcbiAgICAgICAgdGhpcy5fZmVhdHVyZU1hbmFnZXIuaW5pdCgpO1xuICAgICAgICB0aGlzLl91aU1hbmFnZXIuaW5pdCgpO1xuICAgICAgICB0aGlzLl90ZW1wbGF0ZU1hbmFnZXIuaW5pdCgpO1xuICAgIH1cblxuICAgIHN5c3RlbU92ZXJyaWRlcygpIHtcbiAgICAgICAgKENPTkZJRyBhcyBhbnkpLkRORDVFLmZlYXR1cmVUeXBlcy5pdGVtID0ge1xuICAgICAgICAgICAgbGFiZWw6IHRoaXMudWlNYW5hZ2VyLmdldExvY2FsaXplZFR4dCgnSXRlbUZlYXR1cmUnKSxcbiAgICAgICAgfTtcblxuICAgICAgICAoQ09ORklHIGFzIGFueSkuRE5ENUUuaXRlbVByb3BlcnRpZXMuY29uY2VhbGFibGUgPSB7XG4gICAgICAgICAgICBsYWJlbDogdGhpcy51aU1hbmFnZXIuZ2V0TG9jYWxpemVkVHh0KCdDb25jZWFsYWJsZScpLFxuICAgICAgICB9O1xuICAgICAgICAoQ09ORklHIGFzIGFueSkuRE5ENUUudmFsaWRQcm9wZXJ0aWVzLndlYXBvbi5hZGQoJ2NvbmNlYWxhYmxlJyk7XG5cbiAgICAgICAgKENPTkZJRyBhcyBhbnkpLkRORDVFLml0ZW1Qcm9wZXJ0aWVzLnVuc3RhYmxlID0ge1xuICAgICAgICAgICAgbGFiZWw6IHRoaXMudWlNYW5hZ2VyLmdldExvY2FsaXplZFR4dCgnVW5zdGFibGUnKSxcbiAgICAgICAgICAgIGlzUGh5c2ljYWw6IHRydWUsXG4gICAgICAgIH07XG5cbiAgICAgICAgKENPTkZJRyBhcyBhbnkpLkRORDVFLndlYXBvbklkcy5yZWxvYWRhYmxlV2VhcG9uID1cbiAgICAgICAgICAgICdDb21wZW5kaXVtLmZ2dHQtd2VhcG9uLXJlbG9hZC5pdGVtLXBhY2suSXRlbS5sRTYwUWFTMXNjdGIzT0FkJztcbiAgICB9XG5cbiAgICBtb2R1bGVDb25maWd1cmF0aW9ucygpIHtcbiAgICAgICAgY29uc3QgbW9kdWxlTmFtZSA9ICdmdnR0LXdlYXBvbi1yZWxvYWQnO1xuXG4gICAgICAgIGdhbWUuc2V0dGluZ3MucmVnaXN0ZXIobW9kdWxlTmFtZSwgJ3Vuc3RhYmxlQW1tbycsIHtcbiAgICAgICAgICAgIHNjb3BlOiAnd29ybGQnLFxuICAgICAgICAgICAgbmFtZTogJ1NFVFRJTkdTLldFQVBPTl9SRUxPQUQuVW5zdGFibGVBbW1vLk5hbWUnLFxuICAgICAgICAgICAgaGludDogJ1NFVFRJTkdTLldFQVBPTl9SRUxPQUQuVW5zdGFibGVBbW1vLkhpbnQnLFxuICAgICAgICAgICAgdHlwZTogQm9vbGVhbixcbiAgICAgICAgICAgIGNvbmZpZzogdHJ1ZSxcbiAgICAgICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGdhbWUuc2V0dGluZ3MucmVnaXN0ZXIobW9kdWxlTmFtZSwgJ3VzZU1pc2ZpcmVzJywge1xuICAgICAgICAgICAgc2NvcGU6ICd3b3JsZCcsXG4gICAgICAgICAgICBuYW1lOiAnU0VUVElOR1MuV0VBUE9OX1JFTE9BRC5Vc2VNaXNmaXJlcy5OYW1lJyxcbiAgICAgICAgICAgIGhpbnQ6ICdTRVRUSU5HUy5XRUFQT05fUkVMT0FELlVzZU1pc2ZpcmVzLkhpbnQnLFxuICAgICAgICAgICAgdHlwZTogQm9vbGVhbixcbiAgICAgICAgICAgIGNvbmZpZzogdHJ1ZSxcbiAgICAgICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGdhbWUuc2V0dGluZ3MucmVnaXN0ZXIobW9kdWxlTmFtZSwgJ2ZpbHRlckFtbXVuaXRpb25CeUVxdWlwcGVkJywge1xuICAgICAgICAgICAgc2NvcGU6ICd1c2VyJyxcbiAgICAgICAgICAgIG5hbWU6ICdTRVRUSU5HUy5XRUFQT05fUkVMT0FELkZpbHRlckFtbXVuaXRpb25CeUVxdWlwcGVkLk5hbWUnLFxuICAgICAgICAgICAgaGludDogJ1NFVFRJTkdTLldFQVBPTl9SRUxPQUQuRmlsdGVyQW1tdW5pdGlvbkJ5RXF1aXBwZWQuSGludCcsXG4gICAgICAgICAgICB0eXBlOiBCb29sZWFuLFxuICAgICAgICAgICAgY29uZmlnOiB0cnVlLFxuICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZGVidWcoaG9va3M6IGJvb2xlYW4gPSBmYWxzZSkge1xuICAgICAgICBDT05GSUcuZGVidWcuaG9va3MgPSBob29rcztcbiAgICAgICAgY29uc29sZS5sb2coJ0NPTkZJRzogJywgQ09ORklHKTtcbiAgICAgICAgY29uc29sZS5sb2coJ0NPTkZJRy5ETkQ1RTogJywgKENPTkZJRyBhcyBhbnkpLkRORDVFKTtcbiAgICB9XG5cbiAgICB0b1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuICdjbGFzcyBNb2R1bGVNYW5hZ2VyJztcbiAgICB9XG59XG4iLCJleHBvcnQgZGVmYXVsdCBjbGFzcyBUZW1wbGF0ZU1hbmFnZXIge1xuICAgIGNvbnN0cnVjdG9yKCkge31cblxuICAgIGluaXQoKSB7XG4gICAgICAgIChmb3VuZHJ5LmFwcGxpY2F0aW9ucyBhcyBhbnkpLmhhbmRsZWJhcnMubG9hZFRlbXBsYXRlcyhcbiAgICAgICAgICAgIFRlbXBsYXRlTWFuYWdlci5wYXRoc1xuICAgICAgICApO1xuICAgIH1cblxuICAgIHN0YXRpYyBnZXQgcGF0aHMoKSB7XG4gICAgICAgIGNvbnN0IHBhdGhzID0ge307XG4gICAgICAgIGNvbnN0IHRlbXBsYXRlUGF0aHMgPSAnbW9kdWxlcy9mdnR0LXdlYXBvbi1yZWxvYWQvdGVtcGxhdGVzL3JlbG9hZGFibGVXZWFwb25SZWxvYWRUZW1wbGF0ZS5oYnMsbW9kdWxlcy9mdnR0LXdlYXBvbi1yZWxvYWQvdGVtcGxhdGVzL2Jhc2ljTWVzc2FnZS5oYnMsbW9kdWxlcy9mdnR0LXdlYXBvbi1yZWxvYWQvdGVtcGxhdGVzL2FtbW9TZWxlY3Rpb25EaWFsb2dUZW1wbGF0ZS5oYnMsbW9kdWxlcy9mdnR0LXdlYXBvbi1yZWxvYWQvdGVtcGxhdGVzL2FtbW9SZWZ1bmROb3RpY2VUZW1wbGF0ZS5oYnMsbW9kdWxlcy9mdnR0LXdlYXBvbi1yZWxvYWQvdGVtcGxhdGVzL2FjdGl2aXR5LWNhcmQuaGJzJy5zcGxpdCgnLCcpO1xuICAgICAgICBmb3IgKGNvbnN0IHBhdGggb2YgdGVtcGxhdGVQYXRocykge1xuICAgICAgICAgICAgcGF0aHNbcGF0aC5yZXBsYWNlKCcuaGJzJywgJy5odG1sJyldID0gcGF0aDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcGF0aHM7XG4gICAgfVxuXG4gICAgc3RhdGljIG9uSG90UmVsb2FkKCkge1xuICAgICAgICBmb3IgKGNvbnN0IHRlbXBsYXRlIGluIF90ZW1wbGF0ZUNhY2hlKSB7XG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKF90ZW1wbGF0ZUNhY2hlLCB0ZW1wbGF0ZSlcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBfdGVtcGxhdGVDYWNoZVt0ZW1wbGF0ZV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAoZm91bmRyeS5hcHBsaWNhdGlvbnMgYXMgYW55KS5oYW5kbGViYXJzXG4gICAgICAgICAgICAubG9hZFRlbXBsYXRlcyh0aGlzLnBhdGhzKVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgYXBwbGljYXRpb24gaW4gdWkud2luZG93cykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdWkud2luZG93cyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHBsaWNhdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVpLndpbmRvd3NbYXBwbGljYXRpb25dLnJlbmRlcih0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gJ2NsYXNzIFRlbXBsYXRlTWFuYWdlcic7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgRG5kQWN0b3I1ZSB9IGZyb20gJy4uL3R5cGVzL2RuZC50eXBlcyc7XG5pbXBvcnQgTW9kdWxlTWFuYWdlciBmcm9tICcuL01vZHVsZU1hbmFnZXInO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBVaU1hbmFnZXIge1xuICAgIHByaXZhdGUgX21vZHVsZU1hbmFnZXI6IE1vZHVsZU1hbmFnZXI7XG5cbiAgICBjb25zdHJ1Y3Rvcihtb2R1bGVNYW5hZ2VyOiBNb2R1bGVNYW5hZ2VyKSB7XG4gICAgICAgIHRoaXMuX21vZHVsZU1hbmFnZXIgPSBtb2R1bGVNYW5hZ2VyO1xuICAgIH1cblxuICAgIGluaXQoKSB7XG4gICAgICAgIC8vIEVNUFRZIEZPUiBOT1dcbiAgICB9XG5cbiAgICBnZXQgbW9kdWxlTWFuYWdlcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX21vZHVsZU1hbmFnZXI7XG4gICAgfVxuXG4gICAgYnVpbGREaWFsb2cob3B0aW9ucywgaWQpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBmb3VuZHJ5LmFwcGxpY2F0aW9ucy5hcGkuRGlhbG9nVjIoe1xuICAgICAgICAgICAgd2luZG93OiB7IHRpdGxlOiBvcHRpb25zLnRpdGxlIH0sXG4gICAgICAgICAgICBjb250ZW50OiBvcHRpb25zLmNvbnRlbnQsXG4gICAgICAgICAgICBidXR0b25zOiBvcHRpb25zLmJ1dHRvbnMsXG4gICAgICAgICAgICBzdWJtaXQ6IG9wdGlvbnMub25TdWJtaXQsXG4gICAgICAgICAgICBpZDogaWQsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHVpTm90aWZpY2F0aW9uKG1zZzogc3RyaW5nLCB0eXBlOiBzdHJpbmcgPSAnaW5mbycpIHtcbiAgICAgICAgaWYgKHVpLm5vdGlmaWNhdGlvbnMpIHtcbiAgICAgICAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ2Vycm9yJzpcbiAgICAgICAgICAgICAgICAgICAgdWkubm90aWZpY2F0aW9ucy5lcnJvcihtc2cpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICd3YXJuJzpcbiAgICAgICAgICAgICAgICAgICAgdWkubm90aWZpY2F0aW9ucy53YXJuKG1zZyk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2luZm8nOlxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIHVpLm5vdGlmaWNhdGlvbnMuaW5mbyhtc2cpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgc2VuZENoYXQoXG4gICAgICAgIHNwZWFrZXI6IERuZEFjdG9yNWUsXG4gICAgICAgIGNvbnRlbnQ6IHN0cmluZyxcbiAgICAgICAgZmxhdm9yPzogc3RyaW5nLFxuICAgICAgICBzb3VuZD86IHN0cmluZyxcbiAgICAgICAgdHlwZTogMCB8IDEgfCAyIHwgMyB8IDQgfCA1ID0gQ09OU1QuQ0hBVF9NRVNTQUdFX1RZUEVTLk9PQ1xuICAgICkge1xuICAgICAgICBjb25zdCBDaGF0RGF0YSA9IHtcbiAgICAgICAgICAgIHNwZWFrZXI6IENoYXRNZXNzYWdlLmdldFNwZWFrZXIoeyBhY3Rvcjogc3BlYWtlciB9KSxcbiAgICAgICAgICAgIHR5cGUsXG4gICAgICAgICAgICBmbGF2b3IsXG4gICAgICAgICAgICBzb3VuZCxcbiAgICAgICAgICAgIGNvbnRlbnQsXG4gICAgICAgIH07XG4gICAgICAgIENoYXRNZXNzYWdlLmNyZWF0ZShDaGF0RGF0YSk7XG4gICAgfVxuXG4gICAgZ2V0TG9jYWxpemVkVHh0KFxuICAgICAgICBrZXk6IHN0cmluZyxcbiAgICAgICAgb3B0cz86IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH0sXG4gICAgICAgIGZvcm1hdDogYm9vbGVhbiA9IGZhbHNlXG4gICAgKSB7XG4gICAgICAgIGlmIChmb3JtYXQpIHtcbiAgICAgICAgICAgIHJldHVybiAoZ2FtZSBhcyBhbnkpLmkxOG4uZm9ybWF0KGtleSwgb3B0cyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIChnYW1lIGFzIGFueSkuaTE4bi5sb2NhbGl6ZShrZXksIG9wdHMpO1xuICAgIH1cblxuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gJ2NsYXNzIFVpTWFuYWdlcic7XG4gICAgfVxufVxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiOyIsImltcG9ydCBNb2R1bGVNYW5hZ2VyIGZyb20gJy4vbW9kdWxlL21hbmFnZXJzL01vZHVsZU1hbmFnZXInO1xuaW1wb3J0IFRlbXBsYXRlTWFuYWdlciBmcm9tICcuL21vZHVsZS9tYW5hZ2Vycy9UZW1wbGF0ZU1hbmFnZXInO1xuXG5pbXBvcnQgbW9kdWxlSnNvbiBmcm9tICcuLi9tb2R1bGUuanNvbic7XG5cbkhvb2tzLm9uY2UoJ2luaXQnLCBhc3luYyAoKSA9PiB7XG4gICAgY29uc29sZS5sb2coJ0ViZXJyb24gV2VzdCB8IEZvdW5kcnkgVlRUIE1vZHVsZScpO1xuXG4gICAgY29uc3Qgd2VhcG9uX3JlbG9hZCA9IG5ldyBNb2R1bGVNYW5hZ2VyKG1vZHVsZUpzb24uaWQpO1xuICAgIHdlYXBvbl9yZWxvYWQuZGVidWcodHJ1ZSk7XG4gICAgd2VhcG9uX3JlbG9hZC5pbml0KCk7XG59KTtcblxuaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAnZGV2ZWxvcG1lbnQnKSB7XG4gICAgaWYgKG1vZHVsZS5ob3QpIHtcbiAgICAgICAgbW9kdWxlLmhvdC5hY2NlcHQoKTtcblxuICAgICAgICBpZiAobW9kdWxlLmhvdC5zdGF0dXMoKSA9PT0gJ2FwcGx5Jykge1xuICAgICAgICAgICAgVGVtcGxhdGVNYW5hZ2VyLm9uSG90UmVsb2FkKCk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJleHBvcnQgZGVmYXVsdCBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyArIFwic3R5bGVzL21vZHVsZS5jc3NcIjsiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=