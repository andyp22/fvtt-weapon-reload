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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7Ozs7V0N0QkE7V0FDQTtXQUNBO1dBQ0E7V0FDQSx5Q0FBeUMsd0NBQXdDO1dBQ2pGO1dBQ0E7V0FDQTs7Ozs7V0NQQTs7Ozs7V0NBQTtXQUNBO1dBQ0E7V0FDQSx1REFBdUQsaUJBQWlCO1dBQ3hFO1dBQ0EsZ0RBQWdELGFBQWE7V0FDN0Q7Ozs7O1dDTkE7Ozs7Ozs7Ozs7Ozs7OztBQ0E0RDtBQUNJO0FBRXhCO0FBRXhDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEtBQUssSUFBSSxFQUFFO0lBQzFCLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUNBQW1DLENBQUMsQ0FBQztJQUVqRCxNQUFNLGFBQWEsR0FBRyxJQUFJLHNFQUFhLENBQUMsNENBQWEsQ0FBQyxDQUFDO0lBQ3ZELGFBQWEsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDMUIsYUFBYSxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ3pCLENBQUMsQ0FBQyxDQUFDO0FBRUgsSUFBSSxJQUFzQyxFQUFFLENBQUM7SUFDekMsSUFBSSxLQUFVLEVBQUU7QUFBQSxFQU1mO0FBQ0wsQ0FBQzs7Ozs7Ozs7Ozs7OztBQ3JCRCxpRUFBZSxxQkFBdUIsc0JBQXNCLEUiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9mdnR0LXdlYXBvbi1yZWxvYWQvLi9zcmMvbW9kdWxlL2ZlYXR1cmVzL0Jhc2VGZWF0dXJlLnRzIiwid2VicGFjazovL2Z2dHQtd2VhcG9uLXJlbG9hZC8uL3NyYy9tb2R1bGUvZmVhdHVyZXMvUmVsb2FkRmVhdHVyZS50cyIsIndlYnBhY2s6Ly9mdnR0LXdlYXBvbi1yZWxvYWQvLi9zcmMvbW9kdWxlL2ZlYXR1cmVzL1JlbG9hZGFibGVXZWFwb25BdHRhY2tGZWF0dXJlLnRzIiwid2VicGFjazovL2Z2dHQtd2VhcG9uLXJlbG9hZC8uL3NyYy9tb2R1bGUvZmVhdHVyZXMvUmVsb2FkYWJsZVdlYXBvbkNyZWF0aW9uRmVhdHVyZS50cyIsIndlYnBhY2s6Ly9mdnR0LXdlYXBvbi1yZWxvYWQvLi9zcmMvbW9kdWxlL2ZlYXR1cmVzL2luZGV4LnRzIiwid2VicGFjazovL2Z2dHQtd2VhcG9uLXJlbG9hZC8uL3NyYy9tb2R1bGUvbWFuYWdlcnMvRmVhdHVyZU1hbmFnZXIudHMiLCJ3ZWJwYWNrOi8vZnZ0dC13ZWFwb24tcmVsb2FkLy4vc3JjL21vZHVsZS9tYW5hZ2Vycy9Nb2R1bGVNYW5hZ2VyLnRzIiwid2VicGFjazovL2Z2dHQtd2VhcG9uLXJlbG9hZC8uL3NyYy9tb2R1bGUvbWFuYWdlcnMvVGVtcGxhdGVNYW5hZ2VyLnRzIiwid2VicGFjazovL2Z2dHQtd2VhcG9uLXJlbG9hZC8uL3NyYy9tb2R1bGUvbWFuYWdlcnMvVWlNYW5hZ2VyLnRzIiwid2VicGFjazovL2Z2dHQtd2VhcG9uLXJlbG9hZC93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9mdnR0LXdlYXBvbi1yZWxvYWQvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL2Z2dHQtd2VhcG9uLXJlbG9hZC93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL2Z2dHQtd2VhcG9uLXJlbG9hZC93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL2Z2dHQtd2VhcG9uLXJlbG9hZC93ZWJwYWNrL3J1bnRpbWUvcHVibGljUGF0aCIsIndlYnBhY2s6Ly9mdnR0LXdlYXBvbi1yZWxvYWQvLi9zcmMvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vZnZ0dC13ZWFwb24tcmVsb2FkLy4vc3JjL3N0eWxlcy9tb2R1bGUuc2NzcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgRmVhdHVyZU1hbmFnZXIgZnJvbSAnLi4vbWFuYWdlcnMvRmVhdHVyZU1hbmFnZXInO1xuXG5pbXBvcnQgeyBEbmRBY3RvcjVlLCBEbmRJdGVtNWUgfSBmcm9tICcuLi90eXBlcy9kbmQudHlwZXMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCYXNlRmVhdHVyZSB7XG4gICAgcHJpdmF0ZSBfZmVhdHVyZU1hbmFnZXI6IEZlYXR1cmVNYW5hZ2VyO1xuICAgIHByaXZhdGUgX2FjdG9ySWQ6IHN0cmluZztcbiAgICBwcml2YXRlIF93ZWFwb25JZDogc3RyaW5nO1xuXG4gICAgY29uc3RydWN0b3IoZmVhdHVyZU1hbmFnZXI6IEZlYXR1cmVNYW5hZ2VyKSB7XG4gICAgICAgIHRoaXMuX2ZlYXR1cmVNYW5hZ2VyID0gZmVhdHVyZU1hbmFnZXI7XG4gICAgICAgIHRoaXMuX2FjdG9ySWQgPSAnJztcbiAgICAgICAgdGhpcy5fd2VhcG9uSWQgPSAnJztcbiAgICAgICAgdGhpcy5pbml0KCk7XG4gICAgfVxuXG4gICAgZ2V0IGZlYXR1cmVNYW5hZ2VyKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZmVhdHVyZU1hbmFnZXI7XG4gICAgfVxuXG4gICAgZ2V0IG1vZHVsZU1hbmFnZXIoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9mZWF0dXJlTWFuYWdlci5tb2R1bGVNYW5hZ2VyO1xuICAgIH1cblxuICAgIGdldCBjaGFyYWN0ZXIoKTogRG5kQWN0b3I1ZSB7XG4gICAgICAgIHJldHVybiBnYW1lPy5hY3RvcnM/LmdldCh0aGlzLl9hY3RvcklkKSBhcyBEbmRBY3RvcjVlO1xuICAgIH1cblxuICAgIGdldCBjaGFyYWN0ZXJJZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FjdG9ySWQ7XG4gICAgfVxuXG4gICAgc2V0IGNoYXJhY3RlcklkKGlkOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5fYWN0b3JJZCA9IGlkO1xuICAgIH1cblxuICAgIGdldCB3ZWFwb24oKTogRG5kSXRlbTVlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2hhcmFjdGVyLml0ZW1zLmdldCh0aGlzLl93ZWFwb25JZCkgYXMgRG5kSXRlbTVlO1xuICAgIH1cblxuICAgIGdldCB3ZWFwb25JZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3dlYXBvbklkO1xuICAgIH1cblxuICAgIHNldCB3ZWFwb25JZChpZDogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuX3dlYXBvbklkID0gaWQ7XG4gICAgfVxuXG4gICAgZ2V0IGxvYWRvdXQoKSB7XG4gICAgICAgIGNvbnN0IHJlbG9hZGFibGVXZWFwb24gPSB0aGlzLndlYXBvbjtcbiAgICAgICAgY29uc3QgbWF4U2hvdHMgPSBwYXJzZUludChyZWxvYWRhYmxlV2VhcG9uLnN5c3RlbS51c2VzLm1heCk7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRMb2Fkb3V0ID1cbiAgICAgICAgICAgIChyZWxvYWRhYmxlV2VhcG9uLmdldEZsYWcoXG4gICAgICAgICAgICAgICAgdGhpcy5tb2R1bGVNYW5hZ2VyLmlkLFxuICAgICAgICAgICAgICAgICdjaGFtYmVyZWQnXG4gICAgICAgICAgICApIGFzIHN0cmluZ1tdKSB8fCBuZXcgQXJyYXkobWF4U2hvdHMpLmZpbGwoJ0VtcHR5Jyk7XG5cbiAgICAgICAgaWYgKGN1cnJlbnRMb2Fkb3V0Lmxlbmd0aCA8IG1heFNob3RzKSB7XG4gICAgICAgICAgICBjb25zdCBtaXNzaW5nID0gbWF4U2hvdHMgLSBjdXJyZW50TG9hZG91dC5sZW5ndGg7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG1pc3Npbmc7IGkrKykge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRMb2Fkb3V0LnB1c2goJ0VtcHR5Jyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gY3VycmVudExvYWRvdXQ7XG4gICAgfVxuXG4gICAgZ2V0IGZpcmVkKCkge1xuICAgICAgICBjb25zdCByZWxvYWRhYmxlV2VhcG9uID0gdGhpcy53ZWFwb247XG4gICAgICAgIGNvbnN0IG1heFNob3RzID0gcGFyc2VJbnQocmVsb2FkYWJsZVdlYXBvbi5zeXN0ZW0udXNlcy5tYXgpO1xuICAgICAgICBjb25zdCBmaXJlZCA9XG4gICAgICAgICAgICAocmVsb2FkYWJsZVdlYXBvbi5nZXRGbGFnKFxuICAgICAgICAgICAgICAgIHRoaXMubW9kdWxlTWFuYWdlci5pZCxcbiAgICAgICAgICAgICAgICAnZmlyZWQnXG4gICAgICAgICAgICApIGFzIHN0cmluZ1tdKSB8fCBuZXcgQXJyYXkobWF4U2hvdHMpLmZpbGwoJ0VtcHR5Jyk7XG5cbiAgICAgICAgaWYgKGZpcmVkLmxlbmd0aCA8IG1heFNob3RzKSB7XG4gICAgICAgICAgICBjb25zdCBtaXNzaW5nID0gbWF4U2hvdHMgLSBmaXJlZC5sZW5ndGg7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG1pc3Npbmc7IGkrKykge1xuICAgICAgICAgICAgICAgIGZpcmVkLnB1c2goJ0VtcHR5Jyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZmlyZWQ7XG4gICAgfVxuXG4gICAgYW1tdW5pdGlvbihpdGVtczogQ29sbGVjdGlvbjxJdGVtNWU+LCBlcXVpcHBlZDogYm9vbGVhbiA9IGZhbHNlKTogSXRlbTVlW10ge1xuICAgICAgICByZXR1cm4gaXRlbXMuZmlsdGVyKChpdGVtOiBJdGVtNWUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGdhbWVTeXN0ZW0gPSAoaXRlbSBhcyBEbmRJdGVtNWUpLnN5c3RlbTtcbiAgICAgICAgICAgIGlmIChlcXVpcHBlZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgIGl0ZW0udHlwZSA9PSAnY29uc3VtYWJsZScgJiZcbiAgICAgICAgICAgICAgICAgICAgZ2FtZVN5c3RlbS50eXBlLnN1YnR5cGUgPT0gJ2ZpcmVhcm1CdWxsZXQnICYmXG4gICAgICAgICAgICAgICAgICAgIGdhbWVTeXN0ZW0uZXF1aXBwZWRcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICBpdGVtLnR5cGUgPT0gJ2NvbnN1bWFibGUnICYmXG4gICAgICAgICAgICAgICAgZ2FtZVN5c3RlbS50eXBlLnN1YnR5cGUgPT0gJ2ZpcmVhcm1CdWxsZXQnXG4gICAgICAgICAgICApO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBpbml0KCkge31cblxuICAgIHRyYW5zbGF0ZShrZXk6IHN0cmluZywgb3B0cz86IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH0sIGZvcm1hdD86IGJvb2xlYW4pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubW9kdWxlTWFuYWdlci51aU1hbmFnZXIuZ2V0TG9jYWxpemVkVHh0KGtleSwgb3B0cywgZm9ybWF0KTtcbiAgICB9XG5cbiAgICB0b1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuICdjbGFzcyBCYXNlRmVhdHVyZSc7XG4gICAgfVxufVxuIiwiaW1wb3J0IEZlYXR1cmVNYW5hZ2VyIGZyb20gJy4uL21hbmFnZXJzL0ZlYXR1cmVNYW5hZ2VyJztcbmltcG9ydCB7IERuZEFjdG9yNWUsIERuZEl0ZW01ZSB9IGZyb20gJy4uL3R5cGVzL2RuZC50eXBlcyc7XG5pbXBvcnQgQmFzZUZlYXR1cmUgZnJvbSAnLi9CYXNlRmVhdHVyZSc7XG5cbmV4cG9ydCBjbGFzcyBSZWxvYWRGZWF0dXJlIGV4dGVuZHMgQmFzZUZlYXR1cmUge1xuICAgIGNvbnN0cnVjdG9yKGZlYXR1cmVNYW5hZ2VyOiBGZWF0dXJlTWFuYWdlcikge1xuICAgICAgICBzdXBlcihmZWF0dXJlTWFuYWdlcik7XG4gICAgfVxuXG4gICAgaW5pdCgpIHtcbiAgICAgICAgSG9va3Mub24oJ2RuZDVlLnBvc3RVc2VBY3Rpdml0eScsIHRoaXMub25Vc2VBY3Rpdml0eS5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICBhc3luYyBvblVzZUFjdGl2aXR5KGFjdGl2aXR5OiBhbnkpIHtcbiAgICAgICAgaWYgKGFjdGl2aXR5LnR5cGUgPT09ICd1dGlsaXR5JyAmJiBhY3Rpdml0eS5uYW1lID09ICdSZWxvYWQnKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnV2VhcG9uIFJlbG9hZCB8IFRyaWdnZXJlZCBSZWxvYWQnKTtcblxuICAgICAgICAgICAgdGhpcy5jaGFyYWN0ZXJJZCA9IGFjdGl2aXR5LmFjdG9yLmlkO1xuICAgICAgICAgICAgdGhpcy53ZWFwb25JZCA9IGFjdGl2aXR5Lml0ZW0uaWQ7XG4gICAgICAgICAgICB0aGlzLndlYXBvblJlbG9hZCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgYXN5bmMgd2VhcG9uUmVsb2FkKHJlZnVuZEFtbW86IGJvb2xlYW4gPSB0cnVlKSB7XG4gICAgICAgIGNvbnN0IGl0ZW1zID0gdGhpcy5jaGFyYWN0ZXI/Lml0ZW1zO1xuICAgICAgICBjb25zdCBjaGVja0VxdWlwcGVkID0gZ2FtZS5zZXR0aW5ncy5nZXQoXG4gICAgICAgICAgICB0aGlzLm1vZHVsZU1hbmFnZXIuaWQsXG4gICAgICAgICAgICAnZmlsdGVyQW1tdW5pdGlvbkJ5RXF1aXBwZWQnXG4gICAgICAgICkgYXMgYm9vbGVhbjtcbiAgICAgICAgY29uc3QgY3VycmVudExvYWRvdXQgPSB0aGlzLmxvYWRvdXQ7XG5cbiAgICAgICAgaWYgKHJlZnVuZEFtbW8pIHtcbiAgICAgICAgICAgIHRoaXMucmVmdW5kQ2hhbWJlcmVkQW1tbyh0aGlzLmFtbXVuaXRpb24oaXRlbXMpIGFzIERuZEl0ZW01ZVtdKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGFtbW8gPSB0aGlzLmFtbXVuaXRpb24oaXRlbXMsIGNoZWNrRXF1aXBwZWQpIGFzIERuZEl0ZW01ZVtdO1xuICAgICAgICBjb25zdCBpbnZlbnRvcnlBbW11bml0aW9uOiBEbmRJdGVtNWVbXSA9IFtdO1xuXG4gICAgICAgIGFtbW8uZm9yRWFjaCgoYW1tb0l0ZW06IERuZEl0ZW01ZSkgPT4ge1xuICAgICAgICAgICAgaWYgKGFtbW9JdGVtLnN5c3RlbS5xdWFudGl0eSA+IDApIHtcbiAgICAgICAgICAgICAgICBpbnZlbnRvcnlBbW11bml0aW9uLnB1c2goYW1tb0l0ZW0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBhd2FpdCB0aGlzLmNob29zZUFtbXVuaXRpb24oaW52ZW50b3J5QW1tdW5pdGlvbiwgY3VycmVudExvYWRvdXQpO1xuICAgIH1cblxuICAgIHJlZnVuZENoYW1iZXJlZEFtbW8oYXZhaWxhYmxlQW1tdW5pdGlvbjogRG5kSXRlbTVlW10pIHtcbiAgICAgICAgY29uc3QgbG9hZG91dENvdW50cyA9IHRoaXMuZ2V0TG9hZG91dENvdW50cyh0aGlzLmxvYWRvdXQpO1xuICAgICAgICBhdmFpbGFibGVBbW11bml0aW9uLmZvckVhY2goYXN5bmMgKGFtbW86IERuZEl0ZW01ZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbmFtZSA9IGFtbW8ubmFtZTtcbiAgICAgICAgICAgIGlmIChsb2Fkb3V0Q291bnRzW25hbWVdKSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgYW1tby51cGRhdGUoe1xuICAgICAgICAgICAgICAgICAgICAnc3lzdGVtLnF1YW50aXR5JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGFtbW8uc3lzdGVtLnF1YW50aXR5ICsgbG9hZG91dENvdW50c1tuYW1lXSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYXN5bmMgY2hvb3NlQW1tdW5pdGlvbihcbiAgICAgICAgYXZhaWxhYmxlQW1tdW5pdGlvbjogRG5kSXRlbTVlW10sXG4gICAgICAgIGN1cnJlbnRMb2Fkb3V0OiBzdHJpbmdbXVxuICAgICkge1xuICAgICAgICBjb25zdCBkaWFsb2dDb250ZW50ID0gYXdhaXQgKFxuICAgICAgICAgICAgZm91bmRyeS5hcHBsaWNhdGlvbnMgYXMgYW55XG4gICAgICAgICkuaGFuZGxlYmFycy5yZW5kZXJUZW1wbGF0ZShcbiAgICAgICAgICAgICdtb2R1bGVzL2Z2dHQtd2VhcG9uLXJlbG9hZC90ZW1wbGF0ZXMvYW1tb1NlbGVjdGlvbkRpYWxvZ1RlbXBsYXRlLmhicycsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbG9hZG91dFNsb3RzOiBuZXcgQXJyYXkoXG4gICAgICAgICAgICAgICAgICAgIHBhcnNlSW50KHRoaXMud2VhcG9uLnN5c3RlbS51c2VzLm1heClcbiAgICAgICAgICAgICAgICApLmZpbGwoJ0VtcHR5JyksXG4gICAgICAgICAgICAgICAgYW1tb09wdGlvbnM6IGF2YWlsYWJsZUFtbXVuaXRpb24ubWFwKChhbW1vVHlwZTogRG5kSXRlbTVlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBhbW1vVHlwZS5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGFtbW9UeXBlLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb3VudDogYW1tb1R5cGUuc3lzdGVtLnF1YW50aXR5LFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgfVxuICAgICAgICApO1xuXG4gICAgICAgIGNvbnN0IGRpYWxvZ0J1dHRvbnMgPSBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYWN0aW9uOiAnbG9hZCcsXG4gICAgICAgICAgICAgICAgbGFiZWw6IHRoaXMudHJhbnNsYXRlKFxuICAgICAgICAgICAgICAgICAgICAnV0VBUE9OX1JFTE9BRC5GZWF0dXJlcy5SZWxvYWQuQW1tdW5pdGlvbi5DaG9pY2VEaWFsb2dCdXR0b25UeHRMb2FkJ1xuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgY2FsbGJhY2s6IChfZXZlbnQsIGJ1dHRvbikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBsb2Fkb3V0OiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGJ1dHRvbi5mb3JtLmVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBlbG0gPSBidXR0b24uZm9ybS5lbGVtZW50cy5pdGVtKGkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVsbS5uYW1lID09ICdhbW1vLXNlbGVjdCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2Fkb3V0LnB1c2goZWxtLnZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbG9hZG91dDtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBhY3Rpb246ICdjYW5jZWwnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiB0aGlzLnRyYW5zbGF0ZShcbiAgICAgICAgICAgICAgICAgICAgJ1dFQVBPTl9SRUxPQUQuRmVhdHVyZXMuUmVsb2FkLkFtbXVuaXRpb24uQ2hvaWNlRGlhbG9nQnV0dG9uVHh0Q2FuY2VsJ1xuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgY2FsbGJhY2s6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnRMb2Fkb3V0O1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICBdO1xuXG4gICAgICAgIHRoaXMubW9kdWxlTWFuYWdlci51aU1hbmFnZXJcbiAgICAgICAgICAgIC5idWlsZERpYWxvZyhcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiB0aGlzLnRyYW5zbGF0ZShcbiAgICAgICAgICAgICAgICAgICAgICAgICdXRUFQT05fUkVMT0FELkZlYXR1cmVzLlJlbG9hZC5BbW11bml0aW9uLkNob2ljZURpYWxvZ1RpdGxlJ1xuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICBjb250ZW50OiBkaWFsb2dDb250ZW50LFxuICAgICAgICAgICAgICAgICAgICBidXR0b25zOiBkaWFsb2dCdXR0b25zLFxuICAgICAgICAgICAgICAgICAgICBvblN1Ym1pdDogdGhpcy5yZWxvYWRSZWxvYWRhYmxlV2VhcG9uLmJpbmQodGhpcyksXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAnYW1tby1jaG9pY2UtZGlhbG9nJ1xuICAgICAgICAgICAgKVxuICAgICAgICAgICAgLnJlbmRlcih7IGZvcmNlOiB0cnVlIH0pO1xuICAgIH1cblxuICAgIGFzeW5jIHJlbG9hZFJlbG9hZGFibGVXZWFwb24obG9hZG91dDogc3RyaW5nW10pIHtcbiAgICAgICAgY29uc3QgcmVsb2FkYWJsZVdlYXBvbiA9IHRoaXMud2VhcG9uO1xuICAgICAgICBjb25zdCBhbW1vQ291bnRzID0gdGhpcy5nZXRMb2Fkb3V0Q291bnRzKGxvYWRvdXQpO1xuXG4gICAgICAgIGlmICh0aGlzLnJlbW92ZUxvYWRvdXQoYW1tb0NvdW50cykpIHtcbiAgICAgICAgICAgIC8vIFVwZGF0ZSB0aGUgcmVsb2FkYWJsZVdlYXBvbiB1c2VzXG4gICAgICAgICAgICBsZXQgcXR5ID0gMDtcbiAgICAgICAgICAgIGlmIChhbW1vQ291bnRzWydFbXB0eSddID4gMCkge1xuICAgICAgICAgICAgICAgIC8vIEFkanVzdCBzcGVudCB1c2VzIGJ5IHRoZSBudW1iZXIgb2YgRW1wdHkgc2xvdHNcbiAgICAgICAgICAgICAgICBxdHkgKz0gYW1tb0NvdW50c1snRW1wdHknXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGF3YWl0IHJlbG9hZGFibGVXZWFwb24udXBkYXRlKHtcbiAgICAgICAgICAgICAgICAnc3lzdGVtLnVzZXMuc3BlbnQnOiBxdHksXG4gICAgICAgICAgICAgICAgJ3N5c3RlbS51c2VzLnZhbHVlJzpcbiAgICAgICAgICAgICAgICAgICAgcGFyc2VJbnQocmVsb2FkYWJsZVdlYXBvbi5zeXN0ZW0udXNlcy5tYXgpIC0gcXR5LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBhd2FpdCByZWxvYWRhYmxlV2VhcG9uLnNldEZsYWcoXG4gICAgICAgICAgICAgICAgdGhpcy5tb2R1bGVNYW5hZ2VyLmlkLFxuICAgICAgICAgICAgICAgICdjaGFtYmVyZWQnLFxuICAgICAgICAgICAgICAgIGxvYWRvdXRcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBhd2FpdCByZWxvYWRhYmxlV2VhcG9uLnNldEZsYWcoXG4gICAgICAgICAgICAgICAgdGhpcy5tb2R1bGVNYW5hZ2VyLmlkLFxuICAgICAgICAgICAgICAgICdmaXJlZCcsXG4gICAgICAgICAgICAgICAgbmV3IEFycmF5KHBhcnNlSW50KHRoaXMud2VhcG9uLnN5c3RlbS51c2VzLm1heCkpLmZpbGwoJ0VtcHR5JylcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIGNvbnN0IGh0bWxUZW1wbGF0ZSA9IGF3YWl0IChcbiAgICAgICAgICAgICAgICBmb3VuZHJ5LmFwcGxpY2F0aW9ucyBhcyBhbnlcbiAgICAgICAgICAgICkuaGFuZGxlYmFycy5yZW5kZXJUZW1wbGF0ZShcbiAgICAgICAgICAgICAgICAnbW9kdWxlcy9mdnR0LXdlYXBvbi1yZWxvYWQvdGVtcGxhdGVzL3JlbG9hZGFibGVXZWFwb25SZWxvYWRUZW1wbGF0ZS5oYnMnLFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbToge1xuICAgICAgICAgICAgICAgICAgICAgICAgaW1nOiByZWxvYWRhYmxlV2VhcG9uLmltZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHJlbG9hZGFibGVXZWFwb24ubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgZmxhdm9yOiB0aGlzLnRyYW5zbGF0ZShcbiAgICAgICAgICAgICAgICAgICAgICAgICdXRUFQT05fUkVMT0FELkZlYXR1cmVzLlJlbG9hZC5XZWFwb24uV2VhcG9uUmVsb2FkZWRDaGF0Rmxhdm9yJ1xuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICB0aXRsZTogdGhpcy50cmFuc2xhdGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAnV0VBUE9OX1JFTE9BRC5GZWF0dXJlcy5SZWxvYWQuV2VhcG9uLldlYXBvblJlbG9hZGVkQ2hhdE1zZycsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHJlbG9hZGFibGVXZWFwb246IHJlbG9hZGFibGVXZWFwb24ubmFtZSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgdHJ1ZVxuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICBsb2Fkb3V0OiBsb2Fkb3V0LFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICAvLyBOb3RpZnkgdGhlIHBlZXBzXG4gICAgICAgICAgICB0aGlzLm1vZHVsZU1hbmFnZXIudWlNYW5hZ2VyLnNlbmRDaGF0KHRoaXMuY2hhcmFjdGVyLCBodG1sVGVtcGxhdGUpO1xuICAgICAgICAgICAgdGhpcy5jaGFyYWN0ZXJJZCA9ICcnO1xuICAgICAgICAgICAgdGhpcy53ZWFwb25JZCA9ICcnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYXdhaXQgdGhpcy53ZWFwb25SZWxvYWQoZmFsc2UpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVtb3ZlTG9hZG91dChjb3VudHM6IHsgW2tleTogc3RyaW5nXTogbnVtYmVyIH0pOiBib29sZWFuIHtcbiAgICAgICAgbGV0IGFtbXVuaXRpb25BdmFpbGFibGUgPSB0cnVlO1xuICAgICAgICBjb25zdCBpbnZlbnRvcnlBbW11bml0aW9uID0gdGhpcy5hbW11bml0aW9uKFxuICAgICAgICAgICAgdGhpcy5jaGFyYWN0ZXI/Lml0ZW1zXG4gICAgICAgICkgYXMgRG5kSXRlbTVlW107XG4gICAgICAgIGludmVudG9yeUFtbXVuaXRpb24uZm9yRWFjaCgoYW1tbzogRG5kSXRlbTVlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBuYW1lID0gYW1tby5uYW1lO1xuICAgICAgICAgICAgY29uc3QgcXR5ID0gYW1tby5zeXN0ZW0ucXVhbnRpdHkgLSBjb3VudHNbbmFtZV07XG5cbiAgICAgICAgICAgIC8vIElmIGFueSBidWxsZXQgaXMgYWRkZWQgYmV5b25kIHRoZSBxdWFudGl0eSB0aGUgcGxheWVyIGFjdHVhbGx5IGhhcyB0aGVuIHRocm93IGFuIGVycm9yIGFuZCByZXR1cm4gZmFsc2VcbiAgICAgICAgICAgIGlmIChxdHkgPCAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tb2R1bGVNYW5hZ2VyLnVpTWFuYWdlci51aU5vdGlmaWNhdGlvbihcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50cmFuc2xhdGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAnV0VBUE9OX1JFTE9BRC5GZWF0dXJlcy5SZWxvYWQuV2VhcG9uLkxvYWRpbmdFcnJvck1zZycsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IG5hbWU6IGFtbW8ubmFtZSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgdHJ1ZVxuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICAnZXJyb3InXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBhbW11bml0aW9uQXZhaWxhYmxlID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChhbW11bml0aW9uQXZhaWxhYmxlKSB7XG4gICAgICAgICAgICBpbnZlbnRvcnlBbW11bml0aW9uLmZvckVhY2goYXN5bmMgKGFtbW86IERuZEl0ZW01ZSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5hbWUgPSBhbW1vLm5hbWU7XG4gICAgICAgICAgICAgICAgaWYgKGNvdW50c1tuYW1lXSkge1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCBhbW1vLnVwZGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAnc3lzdGVtLnF1YW50aXR5JzogYW1tby5zeXN0ZW0ucXVhbnRpdHkgLSBjb3VudHNbbmFtZV0sXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGFtbXVuaXRpb25BdmFpbGFibGU7XG4gICAgfVxuXG4gICAgYXN5bmMgb25SZWxvYWRDYWxsYmFjayhhY3RvcjogRG5kQWN0b3I1ZSwgd2VhcG9uOiBEbmRJdGVtNWUpIHtcbiAgICAgICAgdGhpcy5jaGFyYWN0ZXJJZCA9IGFjdG9yLmlkO1xuICAgICAgICB0aGlzLndlYXBvbklkID0gd2VhcG9uLmlkO1xuXG4gICAgICAgIHRoaXMud2VhcG9uUmVsb2FkKCk7XG4gICAgfVxuXG4gICAgZ2V0TG9hZG91dENvdW50cyhjdXJyZW50TG9hZG91dDogc3RyaW5nW10pOiB7XG4gICAgICAgIFtrZXk6IHN0cmluZ106IG51bWJlcjtcbiAgICB9IHtcbiAgICAgICAgY29uc3QgbG9hZG91dCA9IHt9O1xuICAgICAgICBjdXJyZW50TG9hZG91dC5mb3JFYWNoKChhbW1vOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgIGlmICghbG9hZG91dFthbW1vXSkgbG9hZG91dFthbW1vXSA9IDA7XG4gICAgICAgICAgICBsb2Fkb3V0W2FtbW9dID0gbG9hZG91dFthbW1vXSArIDE7XG4gICAgICAgIH0pO1xuICAgICAgICBjb25zb2xlLmxvZygnZ2V0TG9hZG91dENvdW50czogJywgY3VycmVudExvYWRvdXQsIGxvYWRvdXQpO1xuICAgICAgICByZXR1cm4gbG9hZG91dDtcbiAgICB9XG5cbiAgICB0b1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuICdjbGFzcyBSZWxvYWRGZWF0dXJlJztcbiAgICB9XG59XG4iLCJpbXBvcnQgRmVhdHVyZU1hbmFnZXIgZnJvbSAnLi4vbWFuYWdlcnMvRmVhdHVyZU1hbmFnZXInO1xuXG5pbXBvcnQge1xuICAgIERuZEFjdG9yNWUsXG4gICAgRG5kSXRlbTVlLFxuICAgIERuZEQyMFJvbGwsXG4gICAgRG5kQXR0YWNrRXZlbnQsXG59IGZyb20gJy4uL3R5cGVzL2RuZC50eXBlcyc7XG5cbmltcG9ydCB7IEFjdGl2aXR5Q2FyZENoYXRUeXBlIH0gZnJvbSAnLi4vdHlwZXMvY2hhdC50eXBlcyc7XG5pbXBvcnQgQmFzZUZlYXR1cmUgZnJvbSAnLi9CYXNlRmVhdHVyZSc7XG5cbmV4cG9ydCBjbGFzcyBSZWxvYWRhYmxlV2VhcG9uQXR0YWNrRmVhdHVyZSBleHRlbmRzIEJhc2VGZWF0dXJlIHtcbiAgICBwcml2YXRlIF9uZXh0Um91bmQ6IHtcbiAgICAgICAgaWQ6IHN0cmluZztcbiAgICAgICAgdHlwZTogc3RyaW5nO1xuICAgIH07XG4gICAgcHJpdmF0ZSBfaG9va0lkOiBudW1iZXI7XG5cbiAgICBjb25zdHJ1Y3RvcihmZWF0dXJlTWFuYWdlcjogRmVhdHVyZU1hbmFnZXIpIHtcbiAgICAgICAgc3VwZXIoZmVhdHVyZU1hbmFnZXIpO1xuICAgICAgICB0aGlzLl9uZXh0Um91bmQgPSB7IGlkOiAnJywgdHlwZTogJycgfTtcbiAgICAgICAgdGhpcy5faG9va0lkID0gLTE7XG4gICAgfVxuXG4gICAgaW5pdCgpIHtcbiAgICAgICAgSG9va3Mub24oJ2RuZDVlLnBvc3RSb2xsQ29uZmlndXJhdGlvbicsIHRoaXMub25Vc2VBY3Rpdml0eS5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICBhc3luYyBvblVzZUFjdGl2aXR5KGQyMFJvbGw6IERuZEQyMFJvbGxbXSwgZXZlbnQ6IERuZEF0dGFja0V2ZW50KSB7XG4gICAgICAgIGNvbnN0IHJvbGwgPSBkMjBSb2xsWzBdO1xuICAgICAgICBjb25zdCB3ZWFwb25EYXRhID0gcm9sbD8uZGF0YT8uaXRlbTtcbiAgICAgICAgaWYgKHdlYXBvbkRhdGE/LnR5cGU/LmJhc2VJdGVtICE9PSAncmVsb2FkYWJsZVdlYXBvbicpIHJldHVybjtcblxuICAgICAgICBjb25zb2xlLmxvZygnV2VhcG9uIFJlbG9hZCB8IFRyaWdnZXJlZCBBdHRhY2snKTtcbiAgICAgICAgdGhpcy53ZWFwb25JZCA9IGV2ZW50LnN1YmplY3QuaXRlbS5pZDtcbiAgICAgICAgdGhpcy5jaGFyYWN0ZXJJZCA9IGV2ZW50LnN1YmplY3QuYWN0b3IuaWQ7XG5cbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMucmVsb2FkYWJsZVdlYXBvbkF0dGFjaygpO1xuICAgIH1cblxuICAgIGFzeW5jIHJlbG9hZGFibGVXZWFwb25BdHRhY2soKSB7XG4gICAgICAgIGNvbnN0IGJ1bGxldCA9IGF3YWl0IHRoaXMuZ2V0TmV4dFJvdW5kKCk7XG5cbiAgICAgICAgaWYgKGJ1bGxldC5uYW1lID09ICdFbXB0eScpIHtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuZHJ5ZmlyZVdlYXBvbigpO1xuXG4gICAgICAgICAgICAvLyBTdG9wIHRoZSBhdHRhY2sgaWYgRHJ5ZmlyaW5nIHRoZSB3ZWFwb25cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX25leHRSb3VuZCA9IHtcbiAgICAgICAgICAgIGlkOiBidWxsZXQuaWQsXG4gICAgICAgICAgICB0eXBlOiBidWxsZXQudHlwZSxcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLl9ob29rSWQgPSBIb29rcy5vbihcbiAgICAgICAgICAgICdkbmQ1ZS5yZW5kZXJDaGF0TWVzc2FnZScsXG4gICAgICAgICAgICB0aGlzLm9uUmVuZGVyQ2hhdE1lc3NhZ2UuYmluZCh0aGlzKVxuICAgICAgICApO1xuXG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLmZpcmVSb3VuZChidWxsZXQpO1xuICAgIH1cblxuICAgIGFzeW5jIG9uUmVuZGVyQ2hhdE1lc3NhZ2UobWVzc2FnZSwgaHRtbCkge1xuICAgICAgICBjb25zdCBpdGVtSWQgPSBtZXNzYWdlLmZsYWdzLmRuZDVlPy5pdGVtLmlkO1xuICAgICAgICBjb25zdCBpdGVtVHlwZSA9IG1lc3NhZ2UuZmxhZ3MuZG5kNWU/Lml0ZW0udHlwZTtcbiAgICAgICAgaWYgKFxuICAgICAgICAgICAgdGhpcy5fbmV4dFJvdW5kLmlkID09PSBpdGVtSWQgJiZcbiAgICAgICAgICAgIHRoaXMuX25leHRSb3VuZC50eXBlID09PSBpdGVtVHlwZVxuICAgICAgICApIHtcbiAgICAgICAgICAgIEhvb2tzLm9mZignZG5kNWUucmVuZGVyQ2hhdE1lc3NhZ2UnLCB0aGlzLl9ob29rSWQpO1xuICAgICAgICAgICAgdGhpcy5fbmV4dFJvdW5kID0geyBpZDogJycsIHR5cGU6ICcnIH07XG5cbiAgICAgICAgICAgIGNvbnN0IGJ1bGxldCA9IHRoaXMuY2hhcmFjdGVyLml0ZW1zLmdldChpdGVtSWQpIGFzIERuZEl0ZW01ZTtcblxuICAgICAgICAgICAgY29uc3QgYWN0aXZhdGlvbkNhcmQgPSBodG1sLnF1ZXJ5U2VsZWN0b3IoJy5hY3RpdmF0aW9uLWNhcmQnKTtcbiAgICAgICAgICAgIGNvbnN0IGl0ZW1jYXJkID0gaHRtbC5xdWVyeVNlbGVjdG9yKCcuaXRlbS1jYXJkJyk7XG4gICAgICAgICAgICBjb25zdCBwYXJlbnRFbGVtZW50ID0gYWN0aXZhdGlvbkNhcmQgfHwgaXRlbWNhcmQ7XG5cbiAgICAgICAgICAgIC8vIEdyYWIgbW9kdWxlIGNvbmZpZ3VyYXRpb25zXG4gICAgICAgICAgICBjb25zdCBjaGVja1Vuc3RhYmxlQW1tbyA9IGdhbWUuc2V0dGluZ3MuZ2V0KFxuICAgICAgICAgICAgICAgIHRoaXMubW9kdWxlTWFuYWdlci5pZCxcbiAgICAgICAgICAgICAgICAndW5zdGFibGVBbW1vJ1xuICAgICAgICAgICAgKSBhcyBib29sZWFuO1xuXG4gICAgICAgICAgICBjb25zdCBjaGVja01pc2ZpcmUgPSBnYW1lLnNldHRpbmdzLmdldChcbiAgICAgICAgICAgICAgICB0aGlzLm1vZHVsZU1hbmFnZXIuaWQsXG4gICAgICAgICAgICAgICAgJ3VzZU1pc2ZpcmVzJ1xuICAgICAgICAgICAgKSBhcyBib29sZWFuO1xuXG4gICAgICAgICAgICBjb25zdCB1bnN0YWJsZUFtbW9GYWlsdXJlVGhyZXNob2xkID0gZ2FtZS5zZXR0aW5ncy5nZXQoXG4gICAgICAgICAgICAgICAgdGhpcy5tb2R1bGVNYW5hZ2VyLmlkLFxuICAgICAgICAgICAgICAgICd1bnN0YWJsZUFtbW9GYWlsdXJlVGhyZXNoaG9sZCdcbiAgICAgICAgICAgICkgYXMgbnVtYmVyO1xuXG4gICAgICAgICAgICAvLyBBZGQgdGhlIG1pc2ZpcmUgbWVzc2FnZVxuICAgICAgICAgICAgaWYgKGNoZWNrTWlzZmlyZSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNyaXRpY2FsRmFpbHVyZU1zZyA9XG4gICAgICAgICAgICAgICAgICAgIGNoZWNrVW5zdGFibGVBbW1vICYmXG4gICAgICAgICAgICAgICAgICAgIGJ1bGxldD8uc3lzdGVtLnByb3BlcnRpZXMuZmluZCgocHJvcDogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcHJvcCA9PT0gJ3Vuc3RhYmxlJztcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgID8gdGhpcy50cmFuc2xhdGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnV0VBUE9OX1JFTE9BRC5GZWF0dXJlcy5SZWxvYWRhYmxlV2VhcG9uQXR0YWNrLk1pc2ZpcmVVbnN0YWJsZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IGZhaWx1cmU6IGAke3Vuc3RhYmxlQW1tb0ZhaWx1cmVUaHJlc2hvbGR9YCB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICA6IHRoaXMudHJhbnNsYXRlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1dFQVBPTl9SRUxPQUQuRmVhdHVyZXMuUmVsb2FkYWJsZVdlYXBvbkF0dGFjay5NaXNmaXJlTmF0T25lJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgY2FyZENvbnRlbnRFbGVtZW50ID1cbiAgICAgICAgICAgICAgICAgICAgcGFyZW50RWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuY2FyZC1jb250ZW50Jyk7XG4gICAgICAgICAgICAgICAgY29uc3Qgd3JhcHBlckVsZW1lbnQgPVxuICAgICAgICAgICAgICAgICAgICBjYXJkQ29udGVudEVsZW1lbnQucXVlcnlTZWxlY3RvcignLndyYXBwZXInKTtcbiAgICAgICAgICAgICAgICB3cmFwcGVyRWxlbWVudC5pbnNlcnRBZGphY2VudEhUTUwoXG4gICAgICAgICAgICAgICAgICAgICdiZWZvcmVlbmQnLFxuICAgICAgICAgICAgICAgICAgICBgPHA+JHtjcml0aWNhbEZhaWx1cmVNc2d9PC9wPmBcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBBZGQgY2FyZCBidXR0b24gY29udGFpbmVyIGlmIG1pc3NpbmdcbiAgICAgICAgICAgIGlmIChpdGVtY2FyZCAmJiAhYWN0aXZhdGlvbkNhcmQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCByZWZlcmVuY2VFbGVtZW50ID1cbiAgICAgICAgICAgICAgICAgICAgcGFyZW50RWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuY2FyZC1oZWFkZXInKTtcbiAgICAgICAgICAgICAgICBjb25zdCBidXR0b25Db250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgICAgICBidXR0b25Db250YWluZXIuY2xhc3NOYW1lID0gJ2NhcmQtYnV0dG9ucyc7XG4gICAgICAgICAgICAgICAgcmVmZXJlbmNlRWxlbWVudC5hZnRlcihidXR0b25Db250YWluZXIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBjYXJkQnV0dG9uc0VsZW1lbnQgPVxuICAgICAgICAgICAgICAgIHBhcmVudEVsZW1lbnQucXVlcnlTZWxlY3RvcignLmNhcmQtYnV0dG9ucycpO1xuXG4gICAgICAgICAgICAvLyBBZGQgTWlzZmlyZSBidXR0b25cbiAgICAgICAgICAgIGlmIChjaGVja01pc2ZpcmUpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBtaXNmaXJlQnRuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAgICAgICAgICAgbWlzZmlyZUJ0bi5vbmNsaWNrID0gdGhpcy5vbkNsaWNrTWlzZmlyZS5iaW5kKHRoaXMpO1xuICAgICAgICAgICAgICAgIG1pc2ZpcmVCdG4uaW5uZXJIVE1MID0gYCR7dGhpcy5tYWtlSWNvbignZmEtYnVyc3QnKX0ke3RoaXMudHJhbnNsYXRlKFxuICAgICAgICAgICAgICAgICAgICAnV0VBUE9OX1JFTE9BRC5GZWF0dXJlcy5SZWxvYWRhYmxlV2VhcG9uQXR0YWNrLk1pc2ZpcmVkQnRuVHh0J1xuICAgICAgICAgICAgICAgICl9YDtcbiAgICAgICAgICAgICAgICBjYXJkQnV0dG9uc0VsZW1lbnQuYXBwZW5kKG1pc2ZpcmVCdG4pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBBZGQgYW1tbyByZWZ1bmQgYnV0dG9uXG4gICAgICAgICAgICBjb25zdCByZWZ1bmRCdG4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgICAgICAgICAgIHJlZnVuZEJ0bi5vbmNsaWNrID0gdGhpcy5vbkNsaWNrUmVmdW5kLmJpbmQodGhpcyk7XG4gICAgICAgICAgICByZWZ1bmRCdG4uaW5uZXJIVE1MID0gYCR7dGhpcy5tYWtlSWNvbignZmEtdW5kbycpfSR7dGhpcy50cmFuc2xhdGUoXG4gICAgICAgICAgICAgICAgJ1dFQVBPTl9SRUxPQUQuRmVhdHVyZXMuUmVsb2FkYWJsZVdlYXBvbkF0dGFjay5SZWZ1bmRCdG5UeHQnXG4gICAgICAgICAgICApfWA7XG4gICAgICAgICAgICBjYXJkQnV0dG9uc0VsZW1lbnQuYXBwZW5kKHJlZnVuZEJ0bik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhc3luYyBnZXROZXh0Um91bmQoKTogUHJvbWlzZTxEbmRJdGVtNWU+IHtcbiAgICAgICAgY29uc3QgY2hhcmFjdGVyID0gdGhpcy5jaGFyYWN0ZXI7XG4gICAgICAgIGNvbnN0IHdlYXBvbiA9IHRoaXMud2VhcG9uO1xuXG4gICAgICAgIGNvbnN0IGxvYWRvdXQgPSB0aGlzLmxvYWRvdXQ7XG4gICAgICAgIGxvYWRvdXQucHVzaCgnRW1wdHknKTtcbiAgICAgICAgY29uc3QgbmV4dFJvdW5kID0gbG9hZG91dC5zaGlmdCgpO1xuXG4gICAgICAgIC8vIFJlbW92ZSB0aGUgYnVsbGV0IGZyb20gdGhlIHJlbG9hZGFibGVXZWFwb24gYW1tdW5pdGlvblxuICAgICAgICBhd2FpdCB3ZWFwb24uc2V0RmxhZyh0aGlzLm1vZHVsZU1hbmFnZXIuaWQsICdjaGFtYmVyZWQnLCBsb2Fkb3V0KTtcblxuICAgICAgICBjb25zdCBpbnZlbnRvcnlBbW11bml0aW9uID0gdGhpcy5hbW11bml0aW9uKFxuICAgICAgICAgICAgY2hhcmFjdGVyLml0ZW1zXG4gICAgICAgICkgYXMgRG5kSXRlbTVlW107XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICBpbnZlbnRvcnlBbW11bml0aW9uLmZpbmQoKGFtbW86IERuZEl0ZW01ZSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5hbWUgPSBhbW1vLm5hbWU7XG4gICAgICAgICAgICAgICAgaWYgKG5hbWUgPT0gbmV4dFJvdW5kKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhbW1vO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH0pIHx8ICh7IG5hbWU6ICdFbXB0eScgfSBhcyBEbmRJdGVtNWUpXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgYXN5bmMgZHJ5ZmlyZVdlYXBvbigpIHtcbiAgICAgICAgY29uc3QgY2hhcmFjdGVyID0gdGhpcy5jaGFyYWN0ZXI7XG4gICAgICAgIGNvbnN0IHdlYXBvbiA9IHRoaXMud2VhcG9uO1xuXG4gICAgICAgIGNvbnN0IHJlbmRlckhvb2tJZCA9IEhvb2tzLm9uKFxuICAgICAgICAgICAgJ3JlbmRlckNoYXRNZXNzYWdlJyxcbiAgICAgICAgICAgIChfY2hhdEl0ZW0sIGh0bWwpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCByZWxvYWRCdG4gPSBodG1sWzBdLnF1ZXJ5U2VsZWN0b3IoJy5yZWxvYWQtYW1tbycpO1xuICAgICAgICAgICAgICAgIHJlbG9hZEJ0bj8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVsb2FkKGNoYXJhY3Rlciwgd2VhcG9uKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGlmIChyZWxvYWRCdG4pIHtcbiAgICAgICAgICAgICAgICAgICAgSG9va3Mub2ZmKCdyZW5kZXJDaGF0TWVzc2FnZScsIHJlbmRlckhvb2tJZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICApO1xuXG4gICAgICAgIGNvbnN0IHRlbXBsYXRlRGF0YTogQWN0aXZpdHlDYXJkQ2hhdFR5cGUgPSB7XG4gICAgICAgICAgICBkZXNjcmlwdGlvbjoge1xuICAgICAgICAgICAgICAgIGNoYXQ6IGA8cD4ke3RoaXMudHJhbnNsYXRlKFxuICAgICAgICAgICAgICAgICAgICAnV0VBUE9OX1JFTE9BRC5GZWF0dXJlcy5SZWxvYWRhYmxlV2VhcG9uQXR0YWNrLkRyeUZpcmVEZXNjcmlwdGlvbicsXG4gICAgICAgICAgICAgICAgICAgIHsgbmFtZTogY2hhcmFjdGVyLm5hbWUsIHJlbG9hZGFibGVXZWFwb246IHdlYXBvbi5uYW1lIH0sXG4gICAgICAgICAgICAgICAgICAgIHRydWVcbiAgICAgICAgICAgICAgICApfTwvcD5gLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGl0ZW06IHtcbiAgICAgICAgICAgICAgICBpbWc6IHdlYXBvbi5pbWcsXG4gICAgICAgICAgICAgICAgbmFtZTogdGhpcy50cmFuc2xhdGUoXG4gICAgICAgICAgICAgICAgICAgICdXRUFQT05fUkVMT0FELkZlYXR1cmVzLlJlbG9hZGFibGVXZWFwb25BdHRhY2suRHJ5RmlyZVRpdGxlJ1xuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc3VidGl0bGU6IHdlYXBvbi5uYW1lLFxuICAgICAgICAgICAgYnV0dG9uczogW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YXNldDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmlzaWJpbGl0eTogJ2FsbCcsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGljb246IHRoaXMubWFrZUljb24oJ2ZhLXJvdGF0ZS1yaWdodCcpLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogdGhpcy50cmFuc2xhdGUoJ1dFQVBPTl9SRUxPQUQuRmVhdHVyZXMuUmVsb2FkLlRleHQnKSxcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NlczogJ3JlbG9hZC1hbW1vJyxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBodG1sVGVtcGxhdGUgPSBhd2FpdCAoXG4gICAgICAgICAgICBmb3VuZHJ5LmFwcGxpY2F0aW9ucyBhcyBhbnlcbiAgICAgICAgKS5oYW5kbGViYXJzLnJlbmRlclRlbXBsYXRlKFxuICAgICAgICAgICAgJ21vZHVsZXMvZnZ0dC13ZWFwb24tcmVsb2FkL3RlbXBsYXRlcy9vdmVycmlkZXMvYWN0aXZpdHktY2FyZC5oYnMnLFxuICAgICAgICAgICAgdGVtcGxhdGVEYXRhXG4gICAgICAgICk7XG4gICAgICAgIHRoaXMubW9kdWxlTWFuYWdlci51aU1hbmFnZXIuc2VuZENoYXQoY2hhcmFjdGVyLCBodG1sVGVtcGxhdGUpO1xuICAgIH1cblxuICAgIGFzeW5jIGZpcmVSb3VuZChidWxsZXQ6IERuZEl0ZW01ZSkge1xuICAgICAgICBjb25zdCByZWxvYWRhYmxlV2VhcG9uID0gdGhpcy53ZWFwb247XG4gICAgICAgIGNvbnN0IG1heFNob3RzID0gcGFyc2VJbnQocmVsb2FkYWJsZVdlYXBvbi5zeXN0ZW0udXNlcy5tYXgpO1xuICAgICAgICBjb25zdCBmaXJlZExvYWRvdXQgPVxuICAgICAgICAgICAgKHJlbG9hZGFibGVXZWFwb24uZ2V0RmxhZyhcbiAgICAgICAgICAgICAgICB0aGlzLm1vZHVsZU1hbmFnZXIuaWQsXG4gICAgICAgICAgICAgICAgJ2ZpcmVkJ1xuICAgICAgICAgICAgKSBhcyBzdHJpbmdbXSkgfHwgbmV3IEFycmF5KG1heFNob3RzKS5maWxsKCdFbXB0eScpO1xuXG4gICAgICAgIGZpcmVkTG9hZG91dC51bnNoaWZ0KGJ1bGxldC5uYW1lKTtcbiAgICAgICAgZmlyZWRMb2Fkb3V0LnNwbGljZSgtMSk7XG4gICAgICAgIGF3YWl0IHJlbG9hZGFibGVXZWFwb24uc2V0RmxhZyhcbiAgICAgICAgICAgIHRoaXMubW9kdWxlTWFuYWdlci5pZCxcbiAgICAgICAgICAgICdmaXJlZCcsXG4gICAgICAgICAgICBmaXJlZExvYWRvdXRcbiAgICAgICAgKTtcblxuICAgICAgICBjb25zdCB1c2VzID0gcmVsb2FkYWJsZVdlYXBvbi5zeXN0ZW0udXNlcztcbiAgICAgICAgY29uc3QgcXR5OiBudW1iZXIgPVxuICAgICAgICAgICAgdXNlcy5zcGVudCArIDEgPD0gcGFyc2VJbnQodXNlcy5tYXgpXG4gICAgICAgICAgICAgICAgPyB1c2VzLnNwZW50ICsgMVxuICAgICAgICAgICAgICAgIDogcGFyc2VJbnQodXNlcy5tYXgpO1xuXG4gICAgICAgIGF3YWl0IHJlbG9hZGFibGVXZWFwb24udXBkYXRlKHtcbiAgICAgICAgICAgICdzeXN0ZW0udXNlcy5zcGVudCc6IHF0eSxcbiAgICAgICAgICAgICdzeXN0ZW0udXNlcy52YWx1ZSc6IHBhcnNlSW50KHVzZXMubWF4KSAtIHF0eSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGJ1bGxldC51c2UoKTtcbiAgICB9XG5cbiAgICByZWxvYWQoYWN0b3I6IERuZEFjdG9yNWUsIHJlbG9hZGFibGVXZWFwb246IERuZEl0ZW01ZSkge1xuICAgICAgICB0aGlzLmZlYXR1cmVNYW5hZ2VyXG4gICAgICAgICAgICAuZ2V0RmVhdHVyZSgncmVsb2FkJylcbiAgICAgICAgICAgIC5vblJlbG9hZENhbGxiYWNrKGFjdG9yLCByZWxvYWRhYmxlV2VhcG9uKTtcbiAgICB9XG5cbiAgICBhc3luYyBvbkNsaWNrUmVmdW5kKCkge1xuICAgICAgICBjb25zdCBhY3RvciA9IHRoaXMuY2hhcmFjdGVyO1xuICAgICAgICBjb25zdCByZWxvYWRhYmxlV2VhcG9uID0gdGhpcy53ZWFwb247XG4gICAgICAgIGNvbnN0IGludmVudG9yeUFtbXVuaXRpb24gPSB0aGlzLmFtbXVuaXRpb24oYWN0b3IuaXRlbXMpO1xuXG4gICAgICAgIGNvbnN0IGZpcmVkID0gdGhpcy5maXJlZDtcbiAgICAgICAgY29uc3QgcmVmdW5kOiBzdHJpbmcgPSBmaXJlZC5zcGxpY2UoMCwgMSlbMF0gYXMgc3RyaW5nO1xuICAgICAgICBmaXJlZC5wdXNoKCdFbXB0eScpO1xuXG4gICAgICAgIGlmIChyZWZ1bmQgPT0gJ0VtcHR5Jykge1xuICAgICAgICAgICAgLy8gTm90aWZ5IHRoZSB1c2VyIHRoYXQgdGhlcmUgaXMgbm8gYW1tdW5pdGlvbiB0byByZWZ1bmRcbiAgICAgICAgICAgIHRoaXMubW9kdWxlTWFuYWdlci51aU1hbmFnZXIudWlOb3RpZmljYXRpb24oXG4gICAgICAgICAgICAgICAgdGhpcy50cmFuc2xhdGUoXG4gICAgICAgICAgICAgICAgICAgICdXRUFQT05fUkVMT0FELkZlYXR1cmVzLlJlbG9hZGFibGVXZWFwb25BdHRhY2suUmVmdW5kLlJlZnVuZE5vTW9yZU1zZycsXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGFjdG9yLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICByZWxvYWRhYmxlV2VhcG9uOiByZWxvYWRhYmxlV2VhcG9uLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHRydWVcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICd3YXJuJ1xuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGF3YWl0IHJlbG9hZGFibGVXZWFwb24uc2V0RmxhZyh0aGlzLm1vZHVsZU1hbmFnZXIuaWQsICdmaXJlZCcsIGZpcmVkKTtcblxuICAgICAgICBsZXQgYnVsbGV0ID0geyBuYW1lOiByZWZ1bmQgfSBhcyBEbmRJdGVtNWU7XG4gICAgICAgIGludmVudG9yeUFtbXVuaXRpb24uZm9yRWFjaCgoYW1tbzogSXRlbTVlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBuYW1lID0gYW1tby5uYW1lO1xuICAgICAgICAgICAgaWYgKG5hbWUgPT0gcmVmdW5kKSB7XG4gICAgICAgICAgICAgICAgYnVsbGV0ID0gYW1tbyBhcyBEbmRJdGVtNWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIFJlZnVuZCB0aGUgbm9uLUVtcHR5IGFtbXVuaXRpb25cbiAgICAgICAgY29uc3QgYW1tb0xvYWRvdXQgPSB0aGlzLmxvYWRvdXQ7XG4gICAgICAgIGFtbW9Mb2Fkb3V0LnVuc2hpZnQocmVmdW5kKTtcbiAgICAgICAgYW1tb0xvYWRvdXQuc3BsaWNlKC0xKTtcbiAgICAgICAgYXdhaXQgcmVsb2FkYWJsZVdlYXBvbi5zZXRGbGFnKFxuICAgICAgICAgICAgdGhpcy5tb2R1bGVNYW5hZ2VyLmlkLFxuICAgICAgICAgICAgJ2NoYW1iZXJlZCcsXG4gICAgICAgICAgICBhbW1vTG9hZG91dFxuICAgICAgICApO1xuXG4gICAgICAgIC8vIFVwZGF0ZSB0aGUgcmVsb2FkYWJsZVdlYXBvbiB1c2VzXG4gICAgICAgIGNvbnN0IHVzZXMgPSByZWxvYWRhYmxlV2VhcG9uLnN5c3RlbS51c2VzO1xuICAgICAgICBjb25zdCBxdHk6IG51bWJlciA9IHVzZXMuc3BlbnQgLSAxID49IDAgPyB1c2VzLnNwZW50IC0gMSA6IDA7XG4gICAgICAgIHJlbG9hZGFibGVXZWFwb24udXBkYXRlKHtcbiAgICAgICAgICAgICdzeXN0ZW0udXNlcy5zcGVudCc6IHF0eSxcbiAgICAgICAgICAgICdzeXN0ZW0udXNlcy52YWx1ZSc6IHBhcnNlSW50KHVzZXMubWF4KSAtIHF0eSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gTm90aWZ5IHRoZSB1c2VyIHRoYXQgdGhlIHJlZnVuZCB3YXMgYSBzdWNjZXNzXG4gICAgICAgIGNvbnN0IGh0bWxUZW1wbGF0ZSA9IGF3YWl0IChcbiAgICAgICAgICAgIGZvdW5kcnkuYXBwbGljYXRpb25zIGFzIGFueVxuICAgICAgICApLmhhbmRsZWJhcnMucmVuZGVyVGVtcGxhdGUoXG4gICAgICAgICAgICAnbW9kdWxlcy9mdnR0LXdlYXBvbi1yZWxvYWQvdGVtcGxhdGVzL2FtbW9SZWZ1bmROb3RpY2VUZW1wbGF0ZS5oYnMnLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGl0ZW06IHtcbiAgICAgICAgICAgICAgICAgICAgaW1nOiBidWxsZXQuaW1nLFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiBidWxsZXQubmFtZSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiB0aGlzLnRyYW5zbGF0ZShcbiAgICAgICAgICAgICAgICAgICAgJ1dFQVBPTl9SRUxPQUQuRmVhdHVyZXMuUmVsb2FkYWJsZVdlYXBvbkF0dGFjay5SZWZ1bmQuUmVmdW5kQ29tcGxldGVNc2cnLFxuICAgICAgICAgICAgICAgICAgICB7IGJ1bGxldDogcmVmdW5kLCBuYW1lOiByZWxvYWRhYmxlV2VhcG9uLm5hbWUgfSxcbiAgICAgICAgICAgICAgICAgICAgdHJ1ZVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgdGl0bGU6IHRoaXMudHJhbnNsYXRlKFxuICAgICAgICAgICAgICAgICAgICAnV0VBUE9OX1JFTE9BRC5GZWF0dXJlcy5SZWxvYWRhYmxlV2VhcG9uQXR0YWNrLlJlZnVuZC5SZWZ1bmRDb21wbGV0ZVRpdGxlJ1xuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgICAgIHRoaXMubW9kdWxlTWFuYWdlci51aU1hbmFnZXIuc2VuZENoYXQoYWN0b3IsIGh0bWxUZW1wbGF0ZSk7XG4gICAgfVxuXG4gICAgYXN5bmMgb25DbGlja01pc2ZpcmUoKSB7XG4gICAgICAgIGNvbnN0IGFjdG9yID0gdGhpcy5jaGFyYWN0ZXI7XG4gICAgICAgIGNvbnN0IHJvbGwgPSBhd2FpdCBuZXcgUm9sbCgnMWQ2Jykucm9sbCgpO1xuICAgICAgICBhd2FpdCByb2xsLnRvTWVzc2FnZSh7XG4gICAgICAgICAgICBzcGVha2VyOiB7XG4gICAgICAgICAgICAgICAgYWxpYXM6IGFjdG9yLm5hbWUsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBtYWtlSWNvbihpY29uOiBzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIGA8aSBjbGFzcz1cImZhcyAke2ljb259XCI+PC9pPmA7XG4gICAgfVxuXG4gICAgdG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiAnY2xhc3MgUmVsb2FkYWJsZVdlYXBvbkF0dGFja0ZlYXR1cmUnO1xuICAgIH1cbn1cbiIsImltcG9ydCBGZWF0dXJlTWFuYWdlciBmcm9tICcuLi9tYW5hZ2Vycy9GZWF0dXJlTWFuYWdlcic7XG5cbmltcG9ydCB7IERuZEl0ZW01ZSB9IGZyb20gJy4uL3R5cGVzL2RuZC50eXBlcyc7XG5pbXBvcnQgQmFzZUZlYXR1cmUgZnJvbSAnLi9CYXNlRmVhdHVyZSc7XG5cbmV4cG9ydCBjbGFzcyBSZWxvYWRhYmxlV2VhcG9uQ3JlYXRpb25GZWF0dXJlIGV4dGVuZHMgQmFzZUZlYXR1cmUge1xuICAgIHByaXZhdGUgX2NyZWF0aW5nUmVsb2FkYWJsZVdlYXBvbjogYm9vbGVhbjtcbiAgICBwcml2YXRlIF9jcmVhdGVJdGVtSG9va0lkOiBudW1iZXI7XG5cbiAgICBjb25zdHJ1Y3RvcihmZWF0dXJlTWFuYWdlcjogRmVhdHVyZU1hbmFnZXIpIHtcbiAgICAgICAgc3VwZXIoZmVhdHVyZU1hbmFnZXIpO1xuICAgICAgICB0aGlzLl9jcmVhdGluZ1JlbG9hZGFibGVXZWFwb24gPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fY3JlYXRlSXRlbUhvb2tJZCA9IC0xO1xuICAgIH1cblxuICAgIGluaXQoKSB7XG4gICAgICAgIEhvb2tzLm9uKCdwcmVDcmVhdGVJdGVtJywgdGhpcy5vblByZUNyZWF0ZUl0ZW0uYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgYXN5bmMgb25QcmVDcmVhdGVJdGVtKGl0ZW06IERuZEl0ZW01ZSkge1xuICAgICAgICBpZiAoaXRlbS5zeXN0ZW0udHlwZS5iYXNlSXRlbSA9PSAncmVsb2FkYWJsZVdlYXBvbicpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdXZWFwb24gUmVsb2FkIHwgVHJpZ2dlcmVkIFByZS1DcmVhdGlvbicpO1xuXG4gICAgICAgICAgICB0aGlzLndlYXBvbklkID0gaXRlbS5pZDtcbiAgICAgICAgICAgIHRoaXMuY2hhcmFjdGVySWQgPSBpdGVtLmFjdG9yPy5pZCBhcyBzdHJpbmc7XG4gICAgICAgICAgICB0aGlzLl9jcmVhdGluZ1JlbG9hZGFibGVXZWFwb24gPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5fY3JlYXRlSXRlbUhvb2tJZCA9IEhvb2tzLm9uKFxuICAgICAgICAgICAgICAgICdjcmVhdGVJdGVtJyxcbiAgICAgICAgICAgICAgICB0aGlzLm9uQ3JlYXRlSXRlbS5iaW5kKHRoaXMpXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgYXN5bmMgb25DcmVhdGVJdGVtKGl0ZW06IERuZEl0ZW01ZSkge1xuICAgICAgICBpZiAoIXRoaXMuX2NyZWF0aW5nUmVsb2FkYWJsZVdlYXBvbiB8fCBpdGVtLmlkICE9PSB0aGlzLndlYXBvbklkKVxuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKCdXZWFwb24gUmVsb2FkIHwgVHJpZ2dlcmVkIFJlbG9hZGFibGVXZWFwb24gQ3JlYXRpb24nKTtcblxuICAgICAgICBjb25zdCByZWxvYWRhYmxlV2VhcG9uID0gdGhpcy53ZWFwb247XG4gICAgICAgIGNvbnN0IGFtbW9RdHkgPSBwYXJzZUludChyZWxvYWRhYmxlV2VhcG9uLnN5c3RlbS51c2VzLm1heCk7XG5cbiAgICAgICAgYXdhaXQgcmVsb2FkYWJsZVdlYXBvbi51cGRhdGUoe1xuICAgICAgICAgICAgJ3N5c3RlbS51c2VzLnNwZW50JzogYW1tb1F0eSxcbiAgICAgICAgICAgICdzeXN0ZW0udXNlcy52YWx1ZSc6IDAsXG4gICAgICAgIH0pO1xuICAgICAgICBhd2FpdCByZWxvYWRhYmxlV2VhcG9uLnNldEZsYWcoXG4gICAgICAgICAgICB0aGlzLm1vZHVsZU1hbmFnZXIuaWQsXG4gICAgICAgICAgICAnY2hhbWJlcmVkJyxcbiAgICAgICAgICAgIG5ldyBBcnJheShhbW1vUXR5KS5maWxsKCdFbXB0eScpXG4gICAgICAgICk7XG4gICAgICAgIGF3YWl0IHJlbG9hZGFibGVXZWFwb24uc2V0RmxhZyhcbiAgICAgICAgICAgIHRoaXMubW9kdWxlTWFuYWdlci5pZCxcbiAgICAgICAgICAgICdmaXJlZCcsXG4gICAgICAgICAgICBuZXcgQXJyYXkoYW1tb1F0eSkuZmlsbCgnRW1wdHknKVxuICAgICAgICApO1xuXG4gICAgICAgIHRoaXMud2VhcG9uSWQgPSAnJztcbiAgICAgICAgdGhpcy5jaGFyYWN0ZXJJZCA9ICcnO1xuICAgICAgICB0aGlzLl9jcmVhdGluZ1JlbG9hZGFibGVXZWFwb24gPSBmYWxzZTtcbiAgICAgICAgSG9va3Mub2ZmKCdjcmVhdGVJdGVtJywgdGhpcy5fY3JlYXRlSXRlbUhvb2tJZCk7XG4gICAgICAgIHRoaXMuX2NyZWF0ZUl0ZW1Ib29rSWQgPSAtMTtcbiAgICB9XG5cbiAgICB0b1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuICdjbGFzcyBSZWxvYWRhYmxlV2VhcG9uQ3JlYXRpb25GZWF0dXJlJztcbiAgICB9XG59XG4iLCJleHBvcnQgeyBSZWxvYWRhYmxlV2VhcG9uQXR0YWNrRmVhdHVyZSB9IGZyb20gJy4vUmVsb2FkYWJsZVdlYXBvbkF0dGFja0ZlYXR1cmUnO1xuZXhwb3J0IHsgUmVsb2FkYWJsZVdlYXBvbkNyZWF0aW9uRmVhdHVyZSB9IGZyb20gJy4vUmVsb2FkYWJsZVdlYXBvbkNyZWF0aW9uRmVhdHVyZSc7XG5leHBvcnQgeyBSZWxvYWRGZWF0dXJlIH0gZnJvbSAnLi9SZWxvYWRGZWF0dXJlJztcbiIsImltcG9ydCBNb2R1bGVNYW5hZ2VyIGZyb20gJy4vTW9kdWxlTWFuYWdlcic7XG5pbXBvcnQge1xuICAgIFJlbG9hZGFibGVXZWFwb25BdHRhY2tGZWF0dXJlLFxuICAgIFJlbG9hZGFibGVXZWFwb25DcmVhdGlvbkZlYXR1cmUsXG4gICAgUmVsb2FkRmVhdHVyZSxcbn0gZnJvbSAnLi4vZmVhdHVyZXMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBGZWF0dXJlTWFuYWdlciB7XG4gICAgcHJpdmF0ZSBfbW9kdWxlTWFuYWdlcjogTW9kdWxlTWFuYWdlcjtcbiAgICBwcml2YXRlIF9mZWF0dXJlczogeyBba2V5OiBzdHJpbmddOiBhbnkgfTtcblxuICAgIGNvbnN0cnVjdG9yKG1vZHVsZU1hbmFnZXI6IE1vZHVsZU1hbmFnZXIpIHtcbiAgICAgICAgdGhpcy5fbW9kdWxlTWFuYWdlciA9IG1vZHVsZU1hbmFnZXI7XG4gICAgICAgIHRoaXMuX2ZlYXR1cmVzID0ge307XG4gICAgfVxuXG4gICAgaW5pdCgpIHtcbiAgICAgICAgdGhpcy5fZmVhdHVyZXMgPSB7XG4gICAgICAgICAgICByZWxvYWQ6IG5ldyBSZWxvYWRGZWF0dXJlKHRoaXMpLFxuICAgICAgICAgICAgcmVsb2FkYWJsZVdlYXBvbkF0dGFjazogbmV3IFJlbG9hZGFibGVXZWFwb25BdHRhY2tGZWF0dXJlKHRoaXMpLFxuICAgICAgICAgICAgcmVsb2FkYWJsZVdlYXBvbkNyZWF0aW9uOiBuZXcgUmVsb2FkYWJsZVdlYXBvbkNyZWF0aW9uRmVhdHVyZSh0aGlzKSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBnZXRGZWF0dXJlKGlkOiBzdHJpbmcpIHtcbiAgICAgICAgaWYgKHRoaXMuX2ZlYXR1cmVzW2lkXSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2ZlYXR1cmVzW2lkXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBnZXQgbW9kdWxlTWFuYWdlcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX21vZHVsZU1hbmFnZXI7XG4gICAgfVxuXG4gICAgdG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiBgY2xhc3MgRmVhdHVyZU1hbmFnZXI6ICR7dGhpcy5fZmVhdHVyZXMubGVuZ3RofWA7XG4gICAgfVxufVxuIiwiaW1wb3J0IEZlYXR1cmVNYW5hZ2VyIGZyb20gJy4vRmVhdHVyZU1hbmFnZXInO1xuaW1wb3J0IFVpTWFuYWdlciBmcm9tICcuL1VpTWFuYWdlcic7XG5pbXBvcnQgVGVtcGxhdGVNYW5hZ2VyIGZyb20gJy4vVGVtcGxhdGVNYW5hZ2VyJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTW9kdWxlTWFuYWdlciB7XG4gICAgcHJpdmF0ZSBfbW9kdWxlSWQ6IHN0cmluZztcbiAgICBwcml2YXRlIF9mZWF0dXJlTWFuYWdlcjogRmVhdHVyZU1hbmFnZXI7XG4gICAgcHJpdmF0ZSBfdWlNYW5hZ2VyOiBVaU1hbmFnZXI7XG4gICAgcHJpdmF0ZSBfdGVtcGxhdGVNYW5hZ2VyOiBUZW1wbGF0ZU1hbmFnZXI7XG5cbiAgICBjb25zdHJ1Y3RvcihpZDogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuX21vZHVsZUlkID0gaWQ7XG4gICAgICAgIHRoaXMuX2ZlYXR1cmVNYW5hZ2VyID0gbmV3IEZlYXR1cmVNYW5hZ2VyKHRoaXMpO1xuICAgICAgICB0aGlzLl91aU1hbmFnZXIgPSBuZXcgVWlNYW5hZ2VyKHRoaXMpO1xuICAgICAgICB0aGlzLl90ZW1wbGF0ZU1hbmFnZXIgPSBuZXcgVGVtcGxhdGVNYW5hZ2VyKCk7XG4gICAgfVxuXG4gICAgZ2V0IGlkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fbW9kdWxlSWQ7XG4gICAgfVxuXG4gICAgZ2V0IGZlYXR1cmVNYW5hZ2VyKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZmVhdHVyZU1hbmFnZXI7XG4gICAgfVxuXG4gICAgZ2V0IHVpTWFuYWdlcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3VpTWFuYWdlcjtcbiAgICB9XG5cbiAgICBnZXQgdGVtcGxhdGVNYW5hZ2VyKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fdGVtcGxhdGVNYW5hZ2VyO1xuICAgIH1cblxuICAgIGluaXQoKSB7XG4gICAgICAgIHRoaXMuc3lzdGVtT3ZlcnJpZGVzKCk7XG4gICAgICAgIHRoaXMubW9kdWxlQ29uZmlndXJhdGlvbnMoKTtcbiAgICAgICAgdGhpcy5fZmVhdHVyZU1hbmFnZXIuaW5pdCgpO1xuICAgICAgICB0aGlzLl91aU1hbmFnZXIuaW5pdCgpO1xuICAgICAgICB0aGlzLl90ZW1wbGF0ZU1hbmFnZXIuaW5pdCgpO1xuICAgIH1cblxuICAgIHN5c3RlbU92ZXJyaWRlcygpIHtcbiAgICAgICAgKENPTkZJRyBhcyBhbnkpLkRORDVFLmZlYXR1cmVUeXBlcy5pdGVtID0ge1xuICAgICAgICAgICAgbGFiZWw6IHRoaXMudWlNYW5hZ2VyLmdldExvY2FsaXplZFR4dCgnSXRlbUZlYXR1cmUnKSxcbiAgICAgICAgfTtcblxuICAgICAgICAoQ09ORklHIGFzIGFueSkuRE5ENUUuaXRlbVByb3BlcnRpZXMuY29uY2VhbGFibGUgPSB7XG4gICAgICAgICAgICBsYWJlbDogdGhpcy51aU1hbmFnZXIuZ2V0TG9jYWxpemVkVHh0KCdDb25jZWFsYWJsZScpLFxuICAgICAgICB9O1xuICAgICAgICAoQ09ORklHIGFzIGFueSkuRE5ENUUudmFsaWRQcm9wZXJ0aWVzLndlYXBvbi5hZGQoJ2NvbmNlYWxhYmxlJyk7XG5cbiAgICAgICAgKENPTkZJRyBhcyBhbnkpLkRORDVFLml0ZW1Qcm9wZXJ0aWVzLnVuc3RhYmxlID0ge1xuICAgICAgICAgICAgbGFiZWw6IHRoaXMudWlNYW5hZ2VyLmdldExvY2FsaXplZFR4dCgnVW5zdGFibGUnKSxcbiAgICAgICAgICAgIGlzUGh5c2ljYWw6IHRydWUsXG4gICAgICAgIH07XG5cbiAgICAgICAgKENPTkZJRyBhcyBhbnkpLkRORDVFLndlYXBvbklkcy5yZWxvYWRhYmxlV2VhcG9uID1cbiAgICAgICAgICAgICdDb21wZW5kaXVtLmZ2dHQtd2VhcG9uLXJlbG9hZC5pdGVtLXBhY2suSXRlbS5sRTYwUWFTMXNjdGIzT0FkJztcbiAgICB9XG5cbiAgICBtb2R1bGVDb25maWd1cmF0aW9ucygpIHtcbiAgICAgICAgY29uc3QgbW9kdWxlTmFtZSA9ICdmdnR0LXdlYXBvbi1yZWxvYWQnO1xuXG4gICAgICAgIGdhbWUuc2V0dGluZ3MucmVnaXN0ZXIobW9kdWxlTmFtZSwgJ3Vuc3RhYmxlQW1tbycsIHtcbiAgICAgICAgICAgIHNjb3BlOiAnd29ybGQnLFxuICAgICAgICAgICAgbmFtZTogJ1NFVFRJTkdTLldFQVBPTl9SRUxPQUQuVW5zdGFibGVBbW1vLk5hbWUnLFxuICAgICAgICAgICAgaGludDogJ1NFVFRJTkdTLldFQVBPTl9SRUxPQUQuVW5zdGFibGVBbW1vLkhpbnQnLFxuICAgICAgICAgICAgdHlwZTogQm9vbGVhbixcbiAgICAgICAgICAgIGNvbmZpZzogdHJ1ZSxcbiAgICAgICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGdhbWUuc2V0dGluZ3MucmVnaXN0ZXIobW9kdWxlTmFtZSwgJ3Vuc3RhYmxlQW1tb0ZhaWx1cmVUaHJlc2hob2xkJywge1xuICAgICAgICAgICAgc2NvcGU6ICd3b3JsZCcsXG4gICAgICAgICAgICBuYW1lOiAnU0VUVElOR1MuV0VBUE9OX1JFTE9BRC5VbnN0YWJsZUFtbW9GYWlsdXJlVGhyZXNob2xkLk5hbWUnLFxuICAgICAgICAgICAgaGludDogJ1NFVFRJTkdTLldFQVBPTl9SRUxPQUQuVW5zdGFibGVBbW1vRmFpbHVyZVRocmVzaG9sZC5IaW50JyxcbiAgICAgICAgICAgIHR5cGU6IE51bWJlcixcbiAgICAgICAgICAgIGNvbmZpZzogdHJ1ZSxcbiAgICAgICAgICAgIGRlZmF1bHQ6IDIsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGdhbWUuc2V0dGluZ3MucmVnaXN0ZXIobW9kdWxlTmFtZSwgJ3VzZU1pc2ZpcmVzJywge1xuICAgICAgICAgICAgc2NvcGU6ICd3b3JsZCcsXG4gICAgICAgICAgICBuYW1lOiAnU0VUVElOR1MuV0VBUE9OX1JFTE9BRC5Vc2VNaXNmaXJlcy5OYW1lJyxcbiAgICAgICAgICAgIGhpbnQ6ICdTRVRUSU5HUy5XRUFQT05fUkVMT0FELlVzZU1pc2ZpcmVzLkhpbnQnLFxuICAgICAgICAgICAgdHlwZTogQm9vbGVhbixcbiAgICAgICAgICAgIGNvbmZpZzogdHJ1ZSxcbiAgICAgICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGdhbWUuc2V0dGluZ3MucmVnaXN0ZXIobW9kdWxlTmFtZSwgJ2ZpbHRlckFtbXVuaXRpb25CeUVxdWlwcGVkJywge1xuICAgICAgICAgICAgc2NvcGU6ICd1c2VyJyxcbiAgICAgICAgICAgIG5hbWU6ICdTRVRUSU5HUy5XRUFQT05fUkVMT0FELkZpbHRlckFtbXVuaXRpb25CeUVxdWlwcGVkLk5hbWUnLFxuICAgICAgICAgICAgaGludDogJ1NFVFRJTkdTLldFQVBPTl9SRUxPQUQuRmlsdGVyQW1tdW5pdGlvbkJ5RXF1aXBwZWQuSGludCcsXG4gICAgICAgICAgICB0eXBlOiBCb29sZWFuLFxuICAgICAgICAgICAgY29uZmlnOiB0cnVlLFxuICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZGVidWcoaG9va3M6IGJvb2xlYW4gPSBmYWxzZSkge1xuICAgICAgICBDT05GSUcuZGVidWcuaG9va3MgPSBob29rcztcbiAgICAgICAgY29uc29sZS5sb2coJ0NPTkZJRzogJywgQ09ORklHKTtcbiAgICAgICAgY29uc29sZS5sb2coJ0NPTkZJRy5ETkQ1RTogJywgKENPTkZJRyBhcyBhbnkpLkRORDVFKTtcbiAgICB9XG5cbiAgICB0b1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuICdjbGFzcyBNb2R1bGVNYW5hZ2VyJztcbiAgICB9XG59XG4iLCJleHBvcnQgZGVmYXVsdCBjbGFzcyBUZW1wbGF0ZU1hbmFnZXIge1xuICAgIGNvbnN0cnVjdG9yKCkge31cblxuICAgIGluaXQoKSB7XG4gICAgICAgIChmb3VuZHJ5LmFwcGxpY2F0aW9ucyBhcyBhbnkpLmhhbmRsZWJhcnMubG9hZFRlbXBsYXRlcyhcbiAgICAgICAgICAgIFRlbXBsYXRlTWFuYWdlci5wYXRoc1xuICAgICAgICApO1xuICAgIH1cblxuICAgIHN0YXRpYyBnZXQgcGF0aHMoKSB7XG4gICAgICAgIGNvbnN0IHBhdGhzID0ge307XG4gICAgICAgIGNvbnN0IHRlbXBsYXRlUGF0aHMgPSAnbW9kdWxlcy9mdnR0LXdlYXBvbi1yZWxvYWQvdGVtcGxhdGVzL3JlbG9hZGFibGVXZWFwb25SZWxvYWRUZW1wbGF0ZS5oYnMsbW9kdWxlcy9mdnR0LXdlYXBvbi1yZWxvYWQvdGVtcGxhdGVzL2Jhc2ljTWVzc2FnZS5oYnMsbW9kdWxlcy9mdnR0LXdlYXBvbi1yZWxvYWQvdGVtcGxhdGVzL2FtbW9TZWxlY3Rpb25EaWFsb2dUZW1wbGF0ZS5oYnMsbW9kdWxlcy9mdnR0LXdlYXBvbi1yZWxvYWQvdGVtcGxhdGVzL2FtbW9SZWZ1bmROb3RpY2VUZW1wbGF0ZS5oYnMsbW9kdWxlcy9mdnR0LXdlYXBvbi1yZWxvYWQvdGVtcGxhdGVzL2FjdGl2aXR5LWNhcmQuaGJzJy5zcGxpdCgnLCcpO1xuICAgICAgICBmb3IgKGNvbnN0IHBhdGggb2YgdGVtcGxhdGVQYXRocykge1xuICAgICAgICAgICAgcGF0aHNbcGF0aC5yZXBsYWNlKCcuaGJzJywgJy5odG1sJyldID0gcGF0aDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcGF0aHM7XG4gICAgfVxuXG4gICAgc3RhdGljIG9uSG90UmVsb2FkKCkge1xuICAgICAgICBmb3IgKGNvbnN0IHRlbXBsYXRlIGluIF90ZW1wbGF0ZUNhY2hlKSB7XG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKF90ZW1wbGF0ZUNhY2hlLCB0ZW1wbGF0ZSlcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBfdGVtcGxhdGVDYWNoZVt0ZW1wbGF0ZV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAoZm91bmRyeS5hcHBsaWNhdGlvbnMgYXMgYW55KS5oYW5kbGViYXJzXG4gICAgICAgICAgICAubG9hZFRlbXBsYXRlcyh0aGlzLnBhdGhzKVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgYXBwbGljYXRpb24gaW4gdWkud2luZG93cykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdWkud2luZG93cyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHBsaWNhdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVpLndpbmRvd3NbYXBwbGljYXRpb25dLnJlbmRlcih0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gJ2NsYXNzIFRlbXBsYXRlTWFuYWdlcic7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgRG5kQWN0b3I1ZSB9IGZyb20gJy4uL3R5cGVzL2RuZC50eXBlcyc7XG5pbXBvcnQgTW9kdWxlTWFuYWdlciBmcm9tICcuL01vZHVsZU1hbmFnZXInO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBVaU1hbmFnZXIge1xuICAgIHByaXZhdGUgX21vZHVsZU1hbmFnZXI6IE1vZHVsZU1hbmFnZXI7XG5cbiAgICBjb25zdHJ1Y3Rvcihtb2R1bGVNYW5hZ2VyOiBNb2R1bGVNYW5hZ2VyKSB7XG4gICAgICAgIHRoaXMuX21vZHVsZU1hbmFnZXIgPSBtb2R1bGVNYW5hZ2VyO1xuICAgIH1cblxuICAgIGluaXQoKSB7XG4gICAgICAgIC8vIEVNUFRZIEZPUiBOT1dcbiAgICB9XG5cbiAgICBnZXQgbW9kdWxlTWFuYWdlcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX21vZHVsZU1hbmFnZXI7XG4gICAgfVxuXG4gICAgYnVpbGREaWFsb2cob3B0aW9ucywgaWQpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBmb3VuZHJ5LmFwcGxpY2F0aW9ucy5hcGkuRGlhbG9nVjIoe1xuICAgICAgICAgICAgd2luZG93OiB7IHRpdGxlOiBvcHRpb25zLnRpdGxlIH0sXG4gICAgICAgICAgICBjb250ZW50OiBvcHRpb25zLmNvbnRlbnQsXG4gICAgICAgICAgICBidXR0b25zOiBvcHRpb25zLmJ1dHRvbnMsXG4gICAgICAgICAgICBzdWJtaXQ6IG9wdGlvbnMub25TdWJtaXQsXG4gICAgICAgICAgICBpZDogaWQsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHVpTm90aWZpY2F0aW9uKG1zZzogc3RyaW5nLCB0eXBlOiBzdHJpbmcgPSAnaW5mbycpIHtcbiAgICAgICAgaWYgKHVpLm5vdGlmaWNhdGlvbnMpIHtcbiAgICAgICAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ2Vycm9yJzpcbiAgICAgICAgICAgICAgICAgICAgdWkubm90aWZpY2F0aW9ucy5lcnJvcihtc2cpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICd3YXJuJzpcbiAgICAgICAgICAgICAgICAgICAgdWkubm90aWZpY2F0aW9ucy53YXJuKG1zZyk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2luZm8nOlxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIHVpLm5vdGlmaWNhdGlvbnMuaW5mbyhtc2cpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgc2VuZENoYXQoXG4gICAgICAgIHNwZWFrZXI6IERuZEFjdG9yNWUsXG4gICAgICAgIGNvbnRlbnQ6IHN0cmluZyxcbiAgICAgICAgZmxhdm9yPzogc3RyaW5nLFxuICAgICAgICBzb3VuZD86IHN0cmluZyxcbiAgICAgICAgdHlwZTogMCB8IDEgfCAyIHwgMyB8IDQgfCA1ID0gQ09OU1QuQ0hBVF9NRVNTQUdFX1RZUEVTLk9PQ1xuICAgICkge1xuICAgICAgICBjb25zdCBDaGF0RGF0YSA9IHtcbiAgICAgICAgICAgIHNwZWFrZXI6IENoYXRNZXNzYWdlLmdldFNwZWFrZXIoeyBhY3Rvcjogc3BlYWtlciB9KSxcbiAgICAgICAgICAgIHR5cGUsXG4gICAgICAgICAgICBmbGF2b3IsXG4gICAgICAgICAgICBzb3VuZCxcbiAgICAgICAgICAgIGNvbnRlbnQsXG4gICAgICAgIH07XG4gICAgICAgIENoYXRNZXNzYWdlLmNyZWF0ZShDaGF0RGF0YSk7XG4gICAgfVxuXG4gICAgZ2V0TG9jYWxpemVkVHh0KFxuICAgICAgICBrZXk6IHN0cmluZyxcbiAgICAgICAgb3B0cz86IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH0sXG4gICAgICAgIGZvcm1hdDogYm9vbGVhbiA9IGZhbHNlXG4gICAgKSB7XG4gICAgICAgIGlmIChmb3JtYXQpIHtcbiAgICAgICAgICAgIHJldHVybiAoZ2FtZSBhcyBhbnkpLmkxOG4uZm9ybWF0KGtleSwgb3B0cyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIChnYW1lIGFzIGFueSkuaTE4bi5sb2NhbGl6ZShrZXksIG9wdHMpO1xuICAgIH1cblxuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gJ2NsYXNzIFVpTWFuYWdlcic7XG4gICAgfVxufVxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiOyIsImltcG9ydCBNb2R1bGVNYW5hZ2VyIGZyb20gJy4vbW9kdWxlL21hbmFnZXJzL01vZHVsZU1hbmFnZXInO1xuaW1wb3J0IFRlbXBsYXRlTWFuYWdlciBmcm9tICcuL21vZHVsZS9tYW5hZ2Vycy9UZW1wbGF0ZU1hbmFnZXInO1xuXG5pbXBvcnQgbW9kdWxlSnNvbiBmcm9tICcuLi9tb2R1bGUuanNvbic7XG5cbkhvb2tzLm9uY2UoJ2luaXQnLCBhc3luYyAoKSA9PiB7XG4gICAgY29uc29sZS5sb2coJ0ViZXJyb24gV2VzdCB8IEZvdW5kcnkgVlRUIE1vZHVsZScpO1xuXG4gICAgY29uc3Qgd2VhcG9uX3JlbG9hZCA9IG5ldyBNb2R1bGVNYW5hZ2VyKG1vZHVsZUpzb24uaWQpO1xuICAgIHdlYXBvbl9yZWxvYWQuZGVidWcodHJ1ZSk7XG4gICAgd2VhcG9uX3JlbG9hZC5pbml0KCk7XG59KTtcblxuaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAnZGV2ZWxvcG1lbnQnKSB7XG4gICAgaWYgKG1vZHVsZS5ob3QpIHtcbiAgICAgICAgbW9kdWxlLmhvdC5hY2NlcHQoKTtcblxuICAgICAgICBpZiAobW9kdWxlLmhvdC5zdGF0dXMoKSA9PT0gJ2FwcGx5Jykge1xuICAgICAgICAgICAgVGVtcGxhdGVNYW5hZ2VyLm9uSG90UmVsb2FkKCk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJleHBvcnQgZGVmYXVsdCBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyArIFwic3R5bGVzL21vZHVsZS5jc3NcIjsiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=