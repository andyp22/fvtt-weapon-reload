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
    EMPTY;
    constructor(featureManager) {
        this._featureManager = featureManager;
        this._actorId = '';
        this._weaponId = '';
        this.EMPTY = this.translate('WEAPON_RELOAD.Empty');
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
        const firearm = this.weapon;
        const maxShots = parseInt(firearm.system.uses.max);
        const currentLoadout = firearm.getFlag(this.moduleManager.id, 'chambered') ||
            new Array(maxShots).fill(this.EMPTY);
        if (currentLoadout.length < maxShots) {
            const missing = maxShots - currentLoadout.length;
            for (let i = 0; i < missing; i++) {
                currentLoadout.push(this.EMPTY);
            }
        }
        return currentLoadout;
    }
    get fired() {
        const firearm = this.weapon;
        const maxShots = parseInt(firearm.system.uses.max);
        const fired = firearm.getFlag(this.moduleManager.id, 'fired') ||
            new Array(maxShots).fill(this.EMPTY);
        if (fired.length < maxShots) {
            const missing = maxShots - fired.length;
            for (let i = 0; i < missing; i++) {
                fired.push(this.EMPTY);
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

/***/ "./src/module/features/FirearmAttackFeature.ts":
/*!*****************************************************!*\
  !*** ./src/module/features/FirearmAttackFeature.ts ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   FirearmAttackFeature: () => (/* binding */ FirearmAttackFeature)
/* harmony export */ });
/* harmony import */ var _BaseFeature__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./BaseFeature */ "./src/module/features/BaseFeature.ts");

class FirearmAttackFeature extends _BaseFeature__WEBPACK_IMPORTED_MODULE_0__["default"] {
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
        if (weaponData?.type?.baseItem !== 'firearm')
            return;
        console.log('Weapon Reload | Triggered Firearm Attack');
        this.weaponId = event.subject.item.id;
        this.characterId = event.subject.actor.id;
        return await this.firearmAttack();
    }
    async firearmAttack() {
        const bullet = await this.getNextBullet();
        if (bullet.name == this.EMPTY) {
            await this.dryfireWeapon();
            return false;
        }
        this._nextRound = {
            id: bullet.id,
            type: bullet.type,
        };
        this._hookId = Hooks.on('dnd5e.renderChatMessage', this.onRenderChatMessage.bind(this));
        return await this.fireBullet(bullet);
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
                ? this.translate('WEAPON_RELOAD.Features.FirearmAttack.MisfireUnstable')
                : this.translate('WEAPON_RELOAD.Features.FirearmAttack.MisfireNatOne');
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
            misfireBtn.innerHTML = `${this.makeIcon('fa-burst')}${this.translate('EBERRON_WEST.features.firearmAttack.misfiredBtnTxt')}`;
            cardButtonsElement.append(misfireBtn);
            const refundBtn = document.createElement('button');
            refundBtn.onclick = this.onClickRefund.bind(this);
            refundBtn.innerHTML = `${this.makeIcon('fa-undo')}${this.translate('EBERRON_WEST.features.firearmAttack.refundBtnTxt')}`;
            cardButtonsElement.append(refundBtn);
        }
    }
    async getNextBullet() {
        const character = this.character;
        const weapon = this.weapon;
        const loadout = this.loadout;
        loadout.push(this.EMPTY);
        const nextBullet = loadout.shift();
        await weapon.setFlag(this.moduleManager.id, 'chambered', loadout);
        const inventoryAmmunition = this.ammunition(character.items);
        return (inventoryAmmunition.find((ammo) => {
            const name = ammo.name;
            if (name == nextBullet) {
                return ammo;
            }
            return null;
        }) || { name: this.EMPTY });
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
                chat: `<p>${this.translate('WEAPON_RELOAD.Features.FirearmAttack.DryFireDescription', { name: character.name, firearm: weapon.name }, true)}</p>`,
            },
            item: {
                img: weapon.img,
                name: this.translate('WEAPON_RELOAD.Features.FirearmAttack.DryFireTitle'),
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
        const htmlTemplate = await foundry.applications.handlebars.renderTemplate('modules/foundry-vtt-eberron-west-module/templates/overrides/activity-card.hbs', templateData);
        this.moduleManager.uiManager.sendChat(character, htmlTemplate);
    }
    async fireBullet(bullet) {
        const firearm = this.weapon;
        const maxShots = parseInt(firearm.system.uses.max);
        const firedLoadout = firearm.getFlag(this.moduleManager.id, 'fired') ||
            new Array(maxShots).fill(this.EMPTY);
        firedLoadout.unshift(bullet.name);
        firedLoadout.splice(-1);
        await firearm.setFlag(this.moduleManager.id, 'fired', firedLoadout);
        const uses = firearm.system.uses;
        const qty = uses.spent + 1 <= parseInt(uses.max)
            ? uses.spent + 1
            : parseInt(uses.max);
        await firearm.update({
            'system.uses.spent': qty,
            'system.uses.value': parseInt(uses.max) - qty,
        });
        return bullet.use();
    }
    reload(actor, firearm) {
        this.featureManager
            .getFeature('reload')
            .onReloadCallback(actor, firearm);
    }
    async onClickRefund() {
        const actor = this.character;
        const firearm = this.weapon;
        const inventoryAmmunition = this.ammunition(actor.items);
        const fired = this.fired;
        const refund = fired.splice(0, 1)[0];
        fired.push(this.EMPTY);
        if (refund == this.EMPTY) {
            this.moduleManager.uiManager.uiNotification(this.translate('WEAPON_RELOAD.Features.FirearmAttack.Refund.RefundNoMoreMsg', { name: actor.name, firearm: firearm.name }, true), 'warn');
            return;
        }
        await firearm.setFlag(this.moduleManager.id, 'fired', fired);
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
        await firearm.setFlag(this.moduleManager.id, 'chambered', ammoLoadout);
        const uses = firearm.system.uses;
        const qty = uses.spent - 1 >= 0 ? uses.spent - 1 : 0;
        firearm.update({
            'system.uses.spent': qty,
            'system.uses.value': parseInt(uses.max) - qty,
        });
        const htmlTemplate = await foundry.applications.handlebars.renderTemplate('modules/foundry-vtt-eberron-west-module/templates/ammoRefundNoticeTemplate.hbs', {
            item: {
                img: bullet.img,
                name: bullet.name,
            },
            description: this.translate('WEAPON_RELOAD.Features.FirearmAttack.Refund.RefundCompleteMsg', { bullet: refund, name: firearm.name }, true),
            title: this.translate('WEAPON_RELOAD.Features.FirearmAttack.Refund.RefundCompleteTitle'),
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
        return 'class FirearmAttackFeature';
    }
}


/***/ }),

/***/ "./src/module/features/FirearmCreationFeature.ts":
/*!*******************************************************!*\
  !*** ./src/module/features/FirearmCreationFeature.ts ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   FirearmCreationFeature: () => (/* binding */ FirearmCreationFeature)
/* harmony export */ });
/* harmony import */ var _BaseFeature__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./BaseFeature */ "./src/module/features/BaseFeature.ts");

class FirearmCreationFeature extends _BaseFeature__WEBPACK_IMPORTED_MODULE_0__["default"] {
    _creatingFirearm;
    constructor(featureManager) {
        super(featureManager);
        this._creatingFirearm = false;
    }
    init() {
        Hooks.on('preCreateItem', this.onPreCreateItem.bind(this));
        Hooks.on('createItem', this.onCreateItem.bind(this));
    }
    async onPreCreateItem(item) {
        if (item.system.type.baseItem == 'firearm') {
            console.log('Weapon Reload | Triggered Firearm Pre-Creation');
            this.weaponId = item.id;
            this.characterId = item.actor?.id;
            this._creatingFirearm = true;
        }
    }
    async onCreateItem(item) {
        if (!this._creatingFirearm || item.id !== this.weaponId)
            return;
        console.log('Weapon Reload | Triggered Firearm Creation');
        const firearm = this.weapon;
        const ammoQty = parseInt(firearm.system.uses.max);
        await firearm.update({
            'system.uses.spent': ammoQty,
            'system.uses.value': 0,
        });
        await firearm.setFlag(this.moduleManager.id, 'chambered', new Array(ammoQty).fill(this.EMPTY));
        await firearm.setFlag(this.moduleManager.id, 'fired', new Array(ammoQty).fill(this.EMPTY));
        this.weaponId = '';
        this.characterId = '';
        this._creatingFirearm = false;
    }
    toString() {
        return 'class FirearmCreationFeature';
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
            console.log('Weapon Reload | Triggered Reload: ', activity);
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
        const dialogContent = await foundry.applications.handlebars.renderTemplate('modules/foundry-vtt-eberron-west-module/templates/ammoSelectionDialogTemplate.hbs', {
            loadoutSlots: new Array(parseInt(this.weapon.system.uses.max)).fill(this.EMPTY),
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
            onSubmit: this.reloadFirearm.bind(this),
        }, 'ammo-choice-dialog')
            .render({ force: true });
    }
    async reloadFirearm(loadout) {
        const firearm = this.weapon;
        const ammoCounts = this.getLoadoutCounts(loadout);
        if (this.removeLoadout(ammoCounts)) {
            let qty = 0;
            if (ammoCounts[this.EMPTY] > 0) {
                qty += ammoCounts[this.EMPTY];
            }
            await firearm.update({
                'system.uses.spent': qty,
                'system.uses.value': parseInt(firearm.system.uses.max) - qty,
            });
            await firearm.setFlag(this.moduleManager.id, 'chambered', loadout);
            await firearm.setFlag(this.moduleManager.id, 'fired', new Array(parseInt(this.weapon.system.uses.max)).fill(this.EMPTY));
            const htmlTemplate = await foundry.applications.handlebars.renderTemplate('modules/foundry-vtt-eberron-west-module/templates/firearmReloadTemplate.hbs', {
                item: {
                    img: firearm.img,
                    name: firearm.name,
                },
                flavor: this.translate('WEAPON_RELOAD.Features.Reload.Weapon.WeaponReloadedChatFlavor'),
                title: this.translate('WEAPON_RELOAD.Features.Reload.Weapon.WeaponReloadedChatMsg', { firearm: firearm.name }, true),
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

/***/ "./src/module/features/index.ts":
/*!**************************************!*\
  !*** ./src/module/features/index.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   FirearmAttackFeature: () => (/* reexport safe */ _FirearmAttackFeature__WEBPACK_IMPORTED_MODULE_0__.FirearmAttackFeature),
/* harmony export */   FirearmCreationFeature: () => (/* reexport safe */ _FirearmCreationFeature__WEBPACK_IMPORTED_MODULE_1__.FirearmCreationFeature),
/* harmony export */   ReloadFeature: () => (/* reexport safe */ _ReloadFeature__WEBPACK_IMPORTED_MODULE_2__.ReloadFeature)
/* harmony export */ });
/* harmony import */ var _FirearmAttackFeature__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./FirearmAttackFeature */ "./src/module/features/FirearmAttackFeature.ts");
/* harmony import */ var _FirearmCreationFeature__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./FirearmCreationFeature */ "./src/module/features/FirearmCreationFeature.ts");
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
            firearmAttack: new _features__WEBPACK_IMPORTED_MODULE_0__.FirearmAttackFeature(this),
            firearmCreation: new _features__WEBPACK_IMPORTED_MODULE_0__.FirearmCreationFeature(this),
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
        CONFIG.DND5E.weaponIds.firearm =
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
        const templatePaths = 'modules/fvtt-weapon-reload/templates/firearmReloadTemplate.hbs,modules/fvtt-weapon-reload/templates/basicMessage.hbs,modules/fvtt-weapon-reload/templates/ammoSelectionDialogTemplate.hbs,modules/fvtt-weapon-reload/templates/ammoRefundNoticeTemplate.hbs,modules/fvtt-weapon-reload/templates/activity-card.hbs'.split(',');
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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LE9BQVEsSUFBWSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ2hELENBQUM7UUFDRCxPQUFRLElBQVksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNsRCxDQUFDO0lBRUQsUUFBUTtRQUNKLE9BQU8saUJBQWlCLENBQUM7SUFDN0IsQ0FBQztDQUNKOzs7Ozs7O1VDM0VEO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7O1dDdEJBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EseUNBQXlDLHdDQUF3QztXQUNqRjtXQUNBO1dBQ0E7Ozs7O1dDUEE7Ozs7O1dDQUE7V0FDQTtXQUNBO1dBQ0EsdURBQXVELGlCQUFpQjtXQUN4RTtXQUNBLGdEQUFnRCxhQUFhO1dBQzdEOzs7OztXQ05BOzs7Ozs7Ozs7Ozs7Ozs7QUNBNEQ7QUFDSTtBQUV4QjtBQUV4QyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxLQUFLLElBQUksRUFBRTtJQUMxQixPQUFPLENBQUMsR0FBRyxDQUFDLG1DQUFtQyxDQUFDLENBQUM7SUFFakQsTUFBTSxhQUFhLEdBQUcsSUFBSSxzRUFBYSxDQUFDLDRDQUFhLENBQUMsQ0FBQztJQUN2RCxhQUFhLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzFCLGFBQWEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUN6QixDQUFDLENBQUMsQ0FBQztBQUVILElBQUksSUFBc0MsRUFBRSxDQUFDO0lBQ3pDLElBQUksS0FBVSxFQUFFO0FBQUEsRUFNZjtBQUNMLENBQUM7Ozs7Ozs7Ozs7Ozs7QUNyQkQsaUVBQWUscUJBQXVCLHNCQUFzQixFIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZnZ0dC13ZWFwb24tcmVsb2FkLy4vc3JjL21vZHVsZS9mZWF0dXJlcy9CYXNlRmVhdHVyZS50cyIsIndlYnBhY2s6Ly9mdnR0LXdlYXBvbi1yZWxvYWQvLi9zcmMvbW9kdWxlL2ZlYXR1cmVzL0ZpcmVhcm1BdHRhY2tGZWF0dXJlLnRzIiwid2VicGFjazovL2Z2dHQtd2VhcG9uLXJlbG9hZC8uL3NyYy9tb2R1bGUvZmVhdHVyZXMvRmlyZWFybUNyZWF0aW9uRmVhdHVyZS50cyIsIndlYnBhY2s6Ly9mdnR0LXdlYXBvbi1yZWxvYWQvLi9zcmMvbW9kdWxlL2ZlYXR1cmVzL1JlbG9hZEZlYXR1cmUudHMiLCJ3ZWJwYWNrOi8vZnZ0dC13ZWFwb24tcmVsb2FkLy4vc3JjL21vZHVsZS9mZWF0dXJlcy9pbmRleC50cyIsIndlYnBhY2s6Ly9mdnR0LXdlYXBvbi1yZWxvYWQvLi9zcmMvbW9kdWxlL21hbmFnZXJzL0ZlYXR1cmVNYW5hZ2VyLnRzIiwid2VicGFjazovL2Z2dHQtd2VhcG9uLXJlbG9hZC8uL3NyYy9tb2R1bGUvbWFuYWdlcnMvTW9kdWxlTWFuYWdlci50cyIsIndlYnBhY2s6Ly9mdnR0LXdlYXBvbi1yZWxvYWQvLi9zcmMvbW9kdWxlL21hbmFnZXJzL1RlbXBsYXRlTWFuYWdlci50cyIsIndlYnBhY2s6Ly9mdnR0LXdlYXBvbi1yZWxvYWQvLi9zcmMvbW9kdWxlL21hbmFnZXJzL1VpTWFuYWdlci50cyIsIndlYnBhY2s6Ly9mdnR0LXdlYXBvbi1yZWxvYWQvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vZnZ0dC13ZWFwb24tcmVsb2FkL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9mdnR0LXdlYXBvbi1yZWxvYWQvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9mdnR0LXdlYXBvbi1yZWxvYWQvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9mdnR0LXdlYXBvbi1yZWxvYWQvd2VicGFjay9ydW50aW1lL3B1YmxpY1BhdGgiLCJ3ZWJwYWNrOi8vZnZ0dC13ZWFwb24tcmVsb2FkLy4vc3JjL2luZGV4LnRzIiwid2VicGFjazovL2Z2dHQtd2VhcG9uLXJlbG9hZC8uL3NyYy9zdHlsZXMvbW9kdWxlLnNjc3MiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEZlYXR1cmVNYW5hZ2VyIGZyb20gJy4uL21hbmFnZXJzL0ZlYXR1cmVNYW5hZ2VyJztcblxuaW1wb3J0IHsgRG5kQWN0b3I1ZSwgRG5kSXRlbTVlIH0gZnJvbSAnLi4vdHlwZXMvZG5kLnR5cGVzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQmFzZUZlYXR1cmUge1xuICAgIHByaXZhdGUgX2ZlYXR1cmVNYW5hZ2VyOiBGZWF0dXJlTWFuYWdlcjtcbiAgICBwcml2YXRlIF9hY3RvcklkOiBzdHJpbmc7XG4gICAgcHJpdmF0ZSBfd2VhcG9uSWQ6IHN0cmluZztcbiAgICBwcm90ZWN0ZWQgRU1QVFk6IHN0cmluZztcblxuICAgIGNvbnN0cnVjdG9yKGZlYXR1cmVNYW5hZ2VyOiBGZWF0dXJlTWFuYWdlcikge1xuICAgICAgICB0aGlzLl9mZWF0dXJlTWFuYWdlciA9IGZlYXR1cmVNYW5hZ2VyO1xuICAgICAgICB0aGlzLl9hY3RvcklkID0gJyc7XG4gICAgICAgIHRoaXMuX3dlYXBvbklkID0gJyc7XG4gICAgICAgIHRoaXMuRU1QVFkgPSB0aGlzLnRyYW5zbGF0ZSgnV0VBUE9OX1JFTE9BRC5FbXB0eScpO1xuICAgICAgICB0aGlzLmluaXQoKTtcbiAgICB9XG5cbiAgICBnZXQgZmVhdHVyZU1hbmFnZXIoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9mZWF0dXJlTWFuYWdlcjtcbiAgICB9XG5cbiAgICBnZXQgbW9kdWxlTWFuYWdlcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ZlYXR1cmVNYW5hZ2VyLm1vZHVsZU1hbmFnZXI7XG4gICAgfVxuXG4gICAgZ2V0IGNoYXJhY3RlcigpOiBEbmRBY3RvcjVlIHtcbiAgICAgICAgcmV0dXJuIGdhbWU/LmFjdG9ycz8uZ2V0KHRoaXMuX2FjdG9ySWQpIGFzIERuZEFjdG9yNWU7XG4gICAgfVxuXG4gICAgZ2V0IGNoYXJhY3RlcklkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWN0b3JJZDtcbiAgICB9XG5cbiAgICBzZXQgY2hhcmFjdGVySWQoaWQ6IHN0cmluZykge1xuICAgICAgICB0aGlzLl9hY3RvcklkID0gaWQ7XG4gICAgfVxuXG4gICAgZ2V0IHdlYXBvbigpOiBEbmRJdGVtNWUge1xuICAgICAgICByZXR1cm4gdGhpcy5jaGFyYWN0ZXIuaXRlbXMuZ2V0KHRoaXMuX3dlYXBvbklkKSBhcyBEbmRJdGVtNWU7XG4gICAgfVxuXG4gICAgZ2V0IHdlYXBvbklkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fd2VhcG9uSWQ7XG4gICAgfVxuXG4gICAgc2V0IHdlYXBvbklkKGlkOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5fd2VhcG9uSWQgPSBpZDtcbiAgICB9XG5cbiAgICBnZXQgbG9hZG91dCgpIHtcbiAgICAgICAgY29uc3QgZmlyZWFybSA9IHRoaXMud2VhcG9uO1xuICAgICAgICBjb25zdCBtYXhTaG90cyA9IHBhcnNlSW50KGZpcmVhcm0uc3lzdGVtLnVzZXMubWF4KTtcbiAgICAgICAgY29uc3QgY3VycmVudExvYWRvdXQgPVxuICAgICAgICAgICAgKGZpcmVhcm0uZ2V0RmxhZyh0aGlzLm1vZHVsZU1hbmFnZXIuaWQsICdjaGFtYmVyZWQnKSBhcyBzdHJpbmdbXSkgfHxcbiAgICAgICAgICAgIG5ldyBBcnJheShtYXhTaG90cykuZmlsbCh0aGlzLkVNUFRZKTtcblxuICAgICAgICBpZiAoY3VycmVudExvYWRvdXQubGVuZ3RoIDwgbWF4U2hvdHMpIHtcbiAgICAgICAgICAgIGNvbnN0IG1pc3NpbmcgPSBtYXhTaG90cyAtIGN1cnJlbnRMb2Fkb3V0Lmxlbmd0aDtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbWlzc2luZzsgaSsrKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudExvYWRvdXQucHVzaCh0aGlzLkVNUFRZKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBjdXJyZW50TG9hZG91dDtcbiAgICB9XG5cbiAgICBnZXQgZmlyZWQoKSB7XG4gICAgICAgIGNvbnN0IGZpcmVhcm0gPSB0aGlzLndlYXBvbjtcbiAgICAgICAgY29uc3QgbWF4U2hvdHMgPSBwYXJzZUludChmaXJlYXJtLnN5c3RlbS51c2VzLm1heCk7XG4gICAgICAgIGNvbnN0IGZpcmVkID1cbiAgICAgICAgICAgIChmaXJlYXJtLmdldEZsYWcodGhpcy5tb2R1bGVNYW5hZ2VyLmlkLCAnZmlyZWQnKSBhcyBzdHJpbmdbXSkgfHxcbiAgICAgICAgICAgIG5ldyBBcnJheShtYXhTaG90cykuZmlsbCh0aGlzLkVNUFRZKTtcblxuICAgICAgICBpZiAoZmlyZWQubGVuZ3RoIDwgbWF4U2hvdHMpIHtcbiAgICAgICAgICAgIGNvbnN0IG1pc3NpbmcgPSBtYXhTaG90cyAtIGZpcmVkLmxlbmd0aDtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbWlzc2luZzsgaSsrKSB7XG4gICAgICAgICAgICAgICAgZmlyZWQucHVzaCh0aGlzLkVNUFRZKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmaXJlZDtcbiAgICB9XG5cbiAgICBhbW11bml0aW9uKGl0ZW1zOiBDb2xsZWN0aW9uPEl0ZW01ZT4sIGVxdWlwcGVkOiBib29sZWFuID0gZmFsc2UpOiBJdGVtNWVbXSB7XG4gICAgICAgIHJldHVybiBpdGVtcy5maWx0ZXIoKGl0ZW06IEl0ZW01ZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZ2FtZVN5c3RlbSA9IChpdGVtIGFzIERuZEl0ZW01ZSkuc3lzdGVtO1xuICAgICAgICAgICAgaWYgKGVxdWlwcGVkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgICAgaXRlbS50eXBlID09ICdjb25zdW1hYmxlJyAmJlxuICAgICAgICAgICAgICAgICAgICBnYW1lU3lzdGVtLnR5cGUuc3VidHlwZSA9PSAnZmlyZWFybUJ1bGxldCcgJiZcbiAgICAgICAgICAgICAgICAgICAgZ2FtZVN5c3RlbS5lcXVpcHBlZFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgIGl0ZW0udHlwZSA9PSAnY29uc3VtYWJsZScgJiZcbiAgICAgICAgICAgICAgICBnYW1lU3lzdGVtLnR5cGUuc3VidHlwZSA9PSAnZmlyZWFybUJ1bGxldCdcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGluaXQoKSB7fVxuXG4gICAgdHJhbnNsYXRlKGtleTogc3RyaW5nLCBvcHRzPzogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfSwgZm9ybWF0PzogYm9vbGVhbikge1xuICAgICAgICByZXR1cm4gdGhpcy5tb2R1bGVNYW5hZ2VyLnVpTWFuYWdlci5nZXRMb2NhbGl6ZWRUeHQoa2V5LCBvcHRzLCBmb3JtYXQpO1xuICAgIH1cblxuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gJ2NsYXNzIEJhc2VGZWF0dXJlJztcbiAgICB9XG59XG4iLCJpbXBvcnQgRmVhdHVyZU1hbmFnZXIgZnJvbSAnLi4vbWFuYWdlcnMvRmVhdHVyZU1hbmFnZXInO1xuXG5pbXBvcnQge1xuICAgIERuZEFjdG9yNWUsXG4gICAgRG5kSXRlbTVlLFxuICAgIERuZEQyMFJvbGwsXG4gICAgRG5kQXR0YWNrRXZlbnQsXG59IGZyb20gJy4uL3R5cGVzL2RuZC50eXBlcyc7XG5cbmltcG9ydCB7IEFjdGl2aXR5Q2FyZENoYXRUeXBlIH0gZnJvbSAnLi4vdHlwZXMvY2hhdC50eXBlcyc7XG5pbXBvcnQgQmFzZUZlYXR1cmUgZnJvbSAnLi9CYXNlRmVhdHVyZSc7XG5cbmV4cG9ydCBjbGFzcyBGaXJlYXJtQXR0YWNrRmVhdHVyZSBleHRlbmRzIEJhc2VGZWF0dXJlIHtcbiAgICBwcml2YXRlIF9uZXh0Um91bmQ6IHtcbiAgICAgICAgaWQ6IHN0cmluZztcbiAgICAgICAgdHlwZTogc3RyaW5nO1xuICAgIH07XG4gICAgcHJpdmF0ZSBfaG9va0lkOiBudW1iZXI7XG5cbiAgICBjb25zdHJ1Y3RvcihmZWF0dXJlTWFuYWdlcjogRmVhdHVyZU1hbmFnZXIpIHtcbiAgICAgICAgc3VwZXIoZmVhdHVyZU1hbmFnZXIpO1xuICAgICAgICB0aGlzLl9uZXh0Um91bmQgPSB7IGlkOiAnJywgdHlwZTogJycgfTtcbiAgICAgICAgdGhpcy5faG9va0lkID0gLTE7XG4gICAgfVxuXG4gICAgaW5pdCgpIHtcbiAgICAgICAgSG9va3Mub24oJ2RuZDVlLnBvc3RSb2xsQ29uZmlndXJhdGlvbicsIHRoaXMub25Vc2VBY3Rpdml0eS5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICBhc3luYyBvblVzZUFjdGl2aXR5KGQyMFJvbGw6IERuZEQyMFJvbGxbXSwgZXZlbnQ6IERuZEF0dGFja0V2ZW50KSB7XG4gICAgICAgIGNvbnN0IHJvbGwgPSBkMjBSb2xsWzBdO1xuICAgICAgICBjb25zdCB3ZWFwb25EYXRhID0gcm9sbD8uZGF0YT8uaXRlbTtcbiAgICAgICAgaWYgKHdlYXBvbkRhdGE/LnR5cGU/LmJhc2VJdGVtICE9PSAnZmlyZWFybScpIHJldHVybjtcblxuICAgICAgICBjb25zb2xlLmxvZygnV2VhcG9uIFJlbG9hZCB8IFRyaWdnZXJlZCBGaXJlYXJtIEF0dGFjaycpO1xuICAgICAgICB0aGlzLndlYXBvbklkID0gZXZlbnQuc3ViamVjdC5pdGVtLmlkO1xuICAgICAgICB0aGlzLmNoYXJhY3RlcklkID0gZXZlbnQuc3ViamVjdC5hY3Rvci5pZDtcblxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5maXJlYXJtQXR0YWNrKCk7XG4gICAgfVxuXG4gICAgYXN5bmMgZmlyZWFybUF0dGFjaygpIHtcbiAgICAgICAgY29uc3QgYnVsbGV0ID0gYXdhaXQgdGhpcy5nZXROZXh0QnVsbGV0KCk7XG5cbiAgICAgICAgaWYgKGJ1bGxldC5uYW1lID09IHRoaXMuRU1QVFkpIHtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuZHJ5ZmlyZVdlYXBvbigpO1xuXG4gICAgICAgICAgICAvLyBTdG9wIHRoZSBhdHRhY2sgaWYgRHJ5ZmlyaW5nIHRoZSB3ZWFwb25cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX25leHRSb3VuZCA9IHtcbiAgICAgICAgICAgIGlkOiBidWxsZXQuaWQsXG4gICAgICAgICAgICB0eXBlOiBidWxsZXQudHlwZSxcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLl9ob29rSWQgPSBIb29rcy5vbihcbiAgICAgICAgICAgICdkbmQ1ZS5yZW5kZXJDaGF0TWVzc2FnZScsXG4gICAgICAgICAgICB0aGlzLm9uUmVuZGVyQ2hhdE1lc3NhZ2UuYmluZCh0aGlzKVxuICAgICAgICApO1xuXG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLmZpcmVCdWxsZXQoYnVsbGV0KTtcbiAgICB9XG5cbiAgICBhc3luYyBvblJlbmRlckNoYXRNZXNzYWdlKG1lc3NhZ2UsIGh0bWwpIHtcbiAgICAgICAgY29uc3QgaXRlbUlkID0gbWVzc2FnZS5mbGFncy5kbmQ1ZT8uaXRlbS5pZDtcbiAgICAgICAgY29uc3QgaXRlbVR5cGUgPSBtZXNzYWdlLmZsYWdzLmRuZDVlPy5pdGVtLnR5cGU7XG4gICAgICAgIGlmIChcbiAgICAgICAgICAgIHRoaXMuX25leHRSb3VuZC5pZCA9PT0gaXRlbUlkICYmXG4gICAgICAgICAgICB0aGlzLl9uZXh0Um91bmQudHlwZSA9PT0gaXRlbVR5cGVcbiAgICAgICAgKSB7XG4gICAgICAgICAgICBIb29rcy5vZmYoJ2RuZDVlLnJlbmRlckNoYXRNZXNzYWdlJywgdGhpcy5faG9va0lkKTtcbiAgICAgICAgICAgIHRoaXMuX25leHRSb3VuZCA9IHsgaWQ6ICcnLCB0eXBlOiAnJyB9O1xuXG4gICAgICAgICAgICBjb25zdCBhY3RpdmF0aW9uQ2FyZCA9IGh0bWwucXVlcnlTZWxlY3RvcignLmFjdGl2YXRpb24tY2FyZCcpO1xuICAgICAgICAgICAgY29uc3QgaXRlbWNhcmQgPSBodG1sLnF1ZXJ5U2VsZWN0b3IoJy5pdGVtLWNhcmQnKTtcbiAgICAgICAgICAgIGNvbnN0IHBhcmVudEVsZW1lbnQgPSBhY3RpdmF0aW9uQ2FyZCB8fCBpdGVtY2FyZDtcblxuICAgICAgICAgICAgLy8gVW5zdGFibGUgYW1tbyBtZXNzYWdlXG4gICAgICAgICAgICBjb25zdCBjaGVja1Vuc3RhYmxlQW1tbyA9IGdhbWUuc2V0dGluZ3MuZ2V0KFxuICAgICAgICAgICAgICAgIHRoaXMubW9kdWxlTWFuYWdlci5pZCxcbiAgICAgICAgICAgICAgICAndW5zdGFibGVBbW1vJ1xuICAgICAgICAgICAgKSBhcyBib29sZWFuO1xuXG4gICAgICAgICAgICBjb25zdCBidWxsZXQgPSB0aGlzLmNoYXJhY3Rlci5pdGVtcy5nZXQoaXRlbUlkKSBhcyBEbmRJdGVtNWU7XG4gICAgICAgICAgICBjb25zdCBjcml0aWNhbEZhaWx1cmVNc2cgPVxuICAgICAgICAgICAgICAgIGNoZWNrVW5zdGFibGVBbW1vICYmXG4gICAgICAgICAgICAgICAgYnVsbGV0Py5zeXN0ZW0ucHJvcGVydGllcy5maW5kKChwcm9wOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHByb3AgPT09ICd1bnN0YWJsZSc7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgPyB0aGlzLnRyYW5zbGF0ZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgJ1dFQVBPTl9SRUxPQUQuRmVhdHVyZXMuRmlyZWFybUF0dGFjay5NaXNmaXJlVW5zdGFibGUnXG4gICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICA6IHRoaXMudHJhbnNsYXRlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAnV0VBUE9OX1JFTE9BRC5GZWF0dXJlcy5GaXJlYXJtQXR0YWNrLk1pc2ZpcmVOYXRPbmUnXG4gICAgICAgICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgY29uc3QgY2FyZENvbnRlbnRFbGVtZW50ID1cbiAgICAgICAgICAgICAgICBwYXJlbnRFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jYXJkLWNvbnRlbnQnKTtcbiAgICAgICAgICAgIGNvbnN0IHdyYXBwZXJFbGVtZW50ID0gY2FyZENvbnRlbnRFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy53cmFwcGVyJyk7XG4gICAgICAgICAgICB3cmFwcGVyRWxlbWVudC5pbnNlcnRBZGphY2VudEhUTUwoXG4gICAgICAgICAgICAgICAgJ2JlZm9yZWVuZCcsXG4gICAgICAgICAgICAgICAgYDxwPiR7Y3JpdGljYWxGYWlsdXJlTXNnfTwvcD5gXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAvLyBBZGQgTWlzZmlyZSBhbmQgYW1tbyByZWZ1bmQgYnV0dG9uc1xuICAgICAgICAgICAgaWYgKGl0ZW1jYXJkICYmICFhY3RpdmF0aW9uQ2FyZCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlZmVyZW5jZUVsZW1lbnQgPVxuICAgICAgICAgICAgICAgICAgICBwYXJlbnRFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jYXJkLWhlYWRlcicpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGJ1dHRvbkNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgICAgIGJ1dHRvbkNvbnRhaW5lci5jbGFzc05hbWUgPSAnY2FyZC1idXR0b25zJztcbiAgICAgICAgICAgICAgICByZWZlcmVuY2VFbGVtZW50LmFmdGVyKGJ1dHRvbkNvbnRhaW5lcik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IGNhcmRCdXR0b25zRWxlbWVudCA9XG4gICAgICAgICAgICAgICAgcGFyZW50RWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuY2FyZC1idXR0b25zJyk7XG5cbiAgICAgICAgICAgIGNvbnN0IG1pc2ZpcmVCdG4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgICAgICAgICAgIG1pc2ZpcmVCdG4ub25jbGljayA9IHRoaXMub25DbGlja01pc2ZpcmUuYmluZCh0aGlzKTtcbiAgICAgICAgICAgIG1pc2ZpcmVCdG4uaW5uZXJIVE1MID0gYCR7dGhpcy5tYWtlSWNvbignZmEtYnVyc3QnKX0ke3RoaXMudHJhbnNsYXRlKFxuICAgICAgICAgICAgICAgICdFQkVSUk9OX1dFU1QuZmVhdHVyZXMuZmlyZWFybUF0dGFjay5taXNmaXJlZEJ0blR4dCdcbiAgICAgICAgICAgICl9YDtcbiAgICAgICAgICAgIGNhcmRCdXR0b25zRWxlbWVudC5hcHBlbmQobWlzZmlyZUJ0bik7XG5cbiAgICAgICAgICAgIGNvbnN0IHJlZnVuZEJ0biA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgICAgICAgICAgcmVmdW5kQnRuLm9uY2xpY2sgPSB0aGlzLm9uQ2xpY2tSZWZ1bmQuYmluZCh0aGlzKTtcbiAgICAgICAgICAgIHJlZnVuZEJ0bi5pbm5lckhUTUwgPSBgJHt0aGlzLm1ha2VJY29uKCdmYS11bmRvJyl9JHt0aGlzLnRyYW5zbGF0ZShcbiAgICAgICAgICAgICAgICAnRUJFUlJPTl9XRVNULmZlYXR1cmVzLmZpcmVhcm1BdHRhY2sucmVmdW5kQnRuVHh0J1xuICAgICAgICAgICAgKX1gO1xuICAgICAgICAgICAgY2FyZEJ1dHRvbnNFbGVtZW50LmFwcGVuZChyZWZ1bmRCdG4pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgYXN5bmMgZ2V0TmV4dEJ1bGxldCgpOiBQcm9taXNlPERuZEl0ZW01ZT4ge1xuICAgICAgICBjb25zdCBjaGFyYWN0ZXIgPSB0aGlzLmNoYXJhY3RlcjtcbiAgICAgICAgY29uc3Qgd2VhcG9uID0gdGhpcy53ZWFwb247XG5cbiAgICAgICAgY29uc3QgbG9hZG91dCA9IHRoaXMubG9hZG91dDtcbiAgICAgICAgbG9hZG91dC5wdXNoKHRoaXMuRU1QVFkpO1xuICAgICAgICBjb25zdCBuZXh0QnVsbGV0ID0gbG9hZG91dC5zaGlmdCgpO1xuXG4gICAgICAgIC8vIFJlbW92ZSB0aGUgYnVsbGV0IGZyb20gdGhlIGZpcmVhcm0gYW1tdW5pdGlvblxuICAgICAgICBhd2FpdCB3ZWFwb24uc2V0RmxhZyh0aGlzLm1vZHVsZU1hbmFnZXIuaWQsICdjaGFtYmVyZWQnLCBsb2Fkb3V0KTtcblxuICAgICAgICBjb25zdCBpbnZlbnRvcnlBbW11bml0aW9uID0gdGhpcy5hbW11bml0aW9uKFxuICAgICAgICAgICAgY2hhcmFjdGVyLml0ZW1zXG4gICAgICAgICkgYXMgRG5kSXRlbTVlW107XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICBpbnZlbnRvcnlBbW11bml0aW9uLmZpbmQoKGFtbW86IERuZEl0ZW01ZSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5hbWUgPSBhbW1vLm5hbWU7XG4gICAgICAgICAgICAgICAgaWYgKG5hbWUgPT0gbmV4dEJ1bGxldCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYW1tbztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9KSB8fCAoeyBuYW1lOiB0aGlzLkVNUFRZIH0gYXMgRG5kSXRlbTVlKVxuICAgICAgICApO1xuICAgIH1cblxuICAgIGFzeW5jIGRyeWZpcmVXZWFwb24oKSB7XG4gICAgICAgIGNvbnN0IGNoYXJhY3RlciA9IHRoaXMuY2hhcmFjdGVyO1xuICAgICAgICBjb25zdCB3ZWFwb24gPSB0aGlzLndlYXBvbjtcblxuICAgICAgICBjb25zdCByZW5kZXJIb29rSWQgPSBIb29rcy5vbihcbiAgICAgICAgICAgICdyZW5kZXJDaGF0TWVzc2FnZScsXG4gICAgICAgICAgICAoX2NoYXRJdGVtLCBodG1sKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVsb2FkQnRuID0gaHRtbFswXS5xdWVyeVNlbGVjdG9yKCcucmVsb2FkLWFtbW8nKTtcbiAgICAgICAgICAgICAgICByZWxvYWRCdG4/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbG9hZChjaGFyYWN0ZXIsIHdlYXBvbik7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBpZiAocmVsb2FkQnRuKSB7XG4gICAgICAgICAgICAgICAgICAgIEhvb2tzLm9mZigncmVuZGVyQ2hhdE1lc3NhZ2UnLCByZW5kZXJIb29rSWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcblxuICAgICAgICBjb25zdCB0ZW1wbGF0ZURhdGE6IEFjdGl2aXR5Q2FyZENoYXRUeXBlID0ge1xuICAgICAgICAgICAgZGVzY3JpcHRpb246IHtcbiAgICAgICAgICAgICAgICBjaGF0OiBgPHA+JHt0aGlzLnRyYW5zbGF0ZShcbiAgICAgICAgICAgICAgICAgICAgJ1dFQVBPTl9SRUxPQUQuRmVhdHVyZXMuRmlyZWFybUF0dGFjay5EcnlGaXJlRGVzY3JpcHRpb24nLFxuICAgICAgICAgICAgICAgICAgICB7IG5hbWU6IGNoYXJhY3Rlci5uYW1lLCBmaXJlYXJtOiB3ZWFwb24ubmFtZSB9LFxuICAgICAgICAgICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICAgICAgKX08L3A+YCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBpdGVtOiB7XG4gICAgICAgICAgICAgICAgaW1nOiB3ZWFwb24uaW1nLFxuICAgICAgICAgICAgICAgIG5hbWU6IHRoaXMudHJhbnNsYXRlKFxuICAgICAgICAgICAgICAgICAgICAnV0VBUE9OX1JFTE9BRC5GZWF0dXJlcy5GaXJlYXJtQXR0YWNrLkRyeUZpcmVUaXRsZSdcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHN1YnRpdGxlOiB3ZWFwb24ubmFtZSxcbiAgICAgICAgICAgIGJ1dHRvbnM6IFtcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGFzZXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZpc2liaWxpdHk6ICdhbGwnLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBpY29uOiB0aGlzLm1ha2VJY29uKCdmYS1yb3RhdGUtcmlnaHQnKSxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6IHRoaXMudHJhbnNsYXRlKCdXRUFQT05fUkVMT0FELkZlYXR1cmVzLlJlbG9hZC5UZXh0JyksXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzZXM6ICdyZWxvYWQtYW1tbycsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgaHRtbFRlbXBsYXRlID0gYXdhaXQgKFxuICAgICAgICAgICAgZm91bmRyeS5hcHBsaWNhdGlvbnMgYXMgYW55XG4gICAgICAgICkuaGFuZGxlYmFycy5yZW5kZXJUZW1wbGF0ZShcbiAgICAgICAgICAgICdtb2R1bGVzL2ZvdW5kcnktdnR0LWViZXJyb24td2VzdC1tb2R1bGUvdGVtcGxhdGVzL292ZXJyaWRlcy9hY3Rpdml0eS1jYXJkLmhicycsXG4gICAgICAgICAgICB0ZW1wbGF0ZURhdGFcbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy5tb2R1bGVNYW5hZ2VyLnVpTWFuYWdlci5zZW5kQ2hhdChjaGFyYWN0ZXIsIGh0bWxUZW1wbGF0ZSk7XG4gICAgfVxuXG4gICAgYXN5bmMgZmlyZUJ1bGxldChidWxsZXQ6IERuZEl0ZW01ZSkge1xuICAgICAgICBjb25zdCBmaXJlYXJtID0gdGhpcy53ZWFwb247XG4gICAgICAgIGNvbnN0IG1heFNob3RzID0gcGFyc2VJbnQoZmlyZWFybS5zeXN0ZW0udXNlcy5tYXgpO1xuICAgICAgICBjb25zdCBmaXJlZExvYWRvdXQgPVxuICAgICAgICAgICAgKGZpcmVhcm0uZ2V0RmxhZyh0aGlzLm1vZHVsZU1hbmFnZXIuaWQsICdmaXJlZCcpIGFzIHN0cmluZ1tdKSB8fFxuICAgICAgICAgICAgbmV3IEFycmF5KG1heFNob3RzKS5maWxsKHRoaXMuRU1QVFkpO1xuXG4gICAgICAgIGZpcmVkTG9hZG91dC51bnNoaWZ0KGJ1bGxldC5uYW1lKTtcbiAgICAgICAgZmlyZWRMb2Fkb3V0LnNwbGljZSgtMSk7XG4gICAgICAgIGF3YWl0IGZpcmVhcm0uc2V0RmxhZyh0aGlzLm1vZHVsZU1hbmFnZXIuaWQsICdmaXJlZCcsIGZpcmVkTG9hZG91dCk7XG5cbiAgICAgICAgY29uc3QgdXNlcyA9IGZpcmVhcm0uc3lzdGVtLnVzZXM7XG4gICAgICAgIGNvbnN0IHF0eTogbnVtYmVyID1cbiAgICAgICAgICAgIHVzZXMuc3BlbnQgKyAxIDw9IHBhcnNlSW50KHVzZXMubWF4KVxuICAgICAgICAgICAgICAgID8gdXNlcy5zcGVudCArIDFcbiAgICAgICAgICAgICAgICA6IHBhcnNlSW50KHVzZXMubWF4KTtcblxuICAgICAgICBhd2FpdCBmaXJlYXJtLnVwZGF0ZSh7XG4gICAgICAgICAgICAnc3lzdGVtLnVzZXMuc3BlbnQnOiBxdHksXG4gICAgICAgICAgICAnc3lzdGVtLnVzZXMudmFsdWUnOiBwYXJzZUludCh1c2VzLm1heCkgLSBxdHksXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBidWxsZXQudXNlKCk7XG4gICAgfVxuXG4gICAgcmVsb2FkKGFjdG9yOiBEbmRBY3RvcjVlLCBmaXJlYXJtOiBEbmRJdGVtNWUpIHtcbiAgICAgICAgdGhpcy5mZWF0dXJlTWFuYWdlclxuICAgICAgICAgICAgLmdldEZlYXR1cmUoJ3JlbG9hZCcpXG4gICAgICAgICAgICAub25SZWxvYWRDYWxsYmFjayhhY3RvciwgZmlyZWFybSk7XG4gICAgfVxuXG4gICAgYXN5bmMgb25DbGlja1JlZnVuZCgpIHtcbiAgICAgICAgY29uc3QgYWN0b3IgPSB0aGlzLmNoYXJhY3RlcjtcbiAgICAgICAgY29uc3QgZmlyZWFybSA9IHRoaXMud2VhcG9uO1xuICAgICAgICBjb25zdCBpbnZlbnRvcnlBbW11bml0aW9uID0gdGhpcy5hbW11bml0aW9uKGFjdG9yLml0ZW1zKTtcblxuICAgICAgICBjb25zdCBmaXJlZCA9IHRoaXMuZmlyZWQ7XG4gICAgICAgIGNvbnN0IHJlZnVuZDogc3RyaW5nID0gZmlyZWQuc3BsaWNlKDAsIDEpWzBdIGFzIHN0cmluZztcbiAgICAgICAgZmlyZWQucHVzaCh0aGlzLkVNUFRZKTtcblxuICAgICAgICBpZiAocmVmdW5kID09IHRoaXMuRU1QVFkpIHtcbiAgICAgICAgICAgIC8vIE5vdGlmeSB0aGUgdXNlciB0aGF0IHRoZXJlIGlzIG5vIGFtbXVuaXRpb24gdG8gcmVmdW5kXG4gICAgICAgICAgICB0aGlzLm1vZHVsZU1hbmFnZXIudWlNYW5hZ2VyLnVpTm90aWZpY2F0aW9uKFxuICAgICAgICAgICAgICAgIHRoaXMudHJhbnNsYXRlKFxuICAgICAgICAgICAgICAgICAgICAnV0VBUE9OX1JFTE9BRC5GZWF0dXJlcy5GaXJlYXJtQXR0YWNrLlJlZnVuZC5SZWZ1bmROb01vcmVNc2cnLFxuICAgICAgICAgICAgICAgICAgICB7IG5hbWU6IGFjdG9yLm5hbWUsIGZpcmVhcm06IGZpcmVhcm0ubmFtZSB9LFxuICAgICAgICAgICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAnd2FybidcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBhd2FpdCBmaXJlYXJtLnNldEZsYWcodGhpcy5tb2R1bGVNYW5hZ2VyLmlkLCAnZmlyZWQnLCBmaXJlZCk7XG5cbiAgICAgICAgbGV0IGJ1bGxldCA9IHsgbmFtZTogcmVmdW5kIH0gYXMgRG5kSXRlbTVlO1xuICAgICAgICBpbnZlbnRvcnlBbW11bml0aW9uLmZvckVhY2goKGFtbW86IEl0ZW01ZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbmFtZSA9IGFtbW8ubmFtZTtcbiAgICAgICAgICAgIGlmIChuYW1lID09IHJlZnVuZCkge1xuICAgICAgICAgICAgICAgIGJ1bGxldCA9IGFtbW8gYXMgRG5kSXRlbTVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBSZWZ1bmQgdGhlIG5vbi1FbXB0eSBhbW11bml0aW9uXG4gICAgICAgIGNvbnN0IGFtbW9Mb2Fkb3V0ID0gdGhpcy5sb2Fkb3V0O1xuICAgICAgICBhbW1vTG9hZG91dC51bnNoaWZ0KHJlZnVuZCk7XG4gICAgICAgIGFtbW9Mb2Fkb3V0LnNwbGljZSgtMSk7XG4gICAgICAgIGF3YWl0IGZpcmVhcm0uc2V0RmxhZyh0aGlzLm1vZHVsZU1hbmFnZXIuaWQsICdjaGFtYmVyZWQnLCBhbW1vTG9hZG91dCk7XG5cbiAgICAgICAgLy8gVXBkYXRlIHRoZSBmaXJlYXJtIHVzZXNcbiAgICAgICAgY29uc3QgdXNlcyA9IGZpcmVhcm0uc3lzdGVtLnVzZXM7XG4gICAgICAgIGNvbnN0IHF0eTogbnVtYmVyID0gdXNlcy5zcGVudCAtIDEgPj0gMCA/IHVzZXMuc3BlbnQgLSAxIDogMDtcbiAgICAgICAgZmlyZWFybS51cGRhdGUoe1xuICAgICAgICAgICAgJ3N5c3RlbS51c2VzLnNwZW50JzogcXR5LFxuICAgICAgICAgICAgJ3N5c3RlbS51c2VzLnZhbHVlJzogcGFyc2VJbnQodXNlcy5tYXgpIC0gcXR5LFxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBOb3RpZnkgdGhlIHVzZXIgdGhhdCB0aGUgcmVmdW5kIHdhcyBhIHN1Y2Nlc3NcbiAgICAgICAgY29uc3QgaHRtbFRlbXBsYXRlID0gYXdhaXQgKFxuICAgICAgICAgICAgZm91bmRyeS5hcHBsaWNhdGlvbnMgYXMgYW55XG4gICAgICAgICkuaGFuZGxlYmFycy5yZW5kZXJUZW1wbGF0ZShcbiAgICAgICAgICAgICdtb2R1bGVzL2ZvdW5kcnktdnR0LWViZXJyb24td2VzdC1tb2R1bGUvdGVtcGxhdGVzL2FtbW9SZWZ1bmROb3RpY2VUZW1wbGF0ZS5oYnMnLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGl0ZW06IHtcbiAgICAgICAgICAgICAgICAgICAgaW1nOiBidWxsZXQuaW1nLFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiBidWxsZXQubmFtZSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiB0aGlzLnRyYW5zbGF0ZShcbiAgICAgICAgICAgICAgICAgICAgJ1dFQVBPTl9SRUxPQUQuRmVhdHVyZXMuRmlyZWFybUF0dGFjay5SZWZ1bmQuUmVmdW5kQ29tcGxldGVNc2cnLFxuICAgICAgICAgICAgICAgICAgICB7IGJ1bGxldDogcmVmdW5kLCBuYW1lOiBmaXJlYXJtLm5hbWUgfSxcbiAgICAgICAgICAgICAgICAgICAgdHJ1ZVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgdGl0bGU6IHRoaXMudHJhbnNsYXRlKFxuICAgICAgICAgICAgICAgICAgICAnV0VBUE9OX1JFTE9BRC5GZWF0dXJlcy5GaXJlYXJtQXR0YWNrLlJlZnVuZC5SZWZ1bmRDb21wbGV0ZVRpdGxlJ1xuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgICAgIHRoaXMubW9kdWxlTWFuYWdlci51aU1hbmFnZXIuc2VuZENoYXQoYWN0b3IsIGh0bWxUZW1wbGF0ZSk7XG4gICAgfVxuXG4gICAgYXN5bmMgb25DbGlja01pc2ZpcmUoKSB7XG4gICAgICAgIGNvbnN0IGFjdG9yID0gdGhpcy5jaGFyYWN0ZXI7XG4gICAgICAgIGNvbnN0IHJvbGwgPSBhd2FpdCBuZXcgUm9sbCgnMWQ2Jykucm9sbCgpO1xuICAgICAgICBhd2FpdCByb2xsLnRvTWVzc2FnZSh7XG4gICAgICAgICAgICBzcGVha2VyOiB7XG4gICAgICAgICAgICAgICAgYWxpYXM6IGFjdG9yLm5hbWUsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBtYWtlSWNvbihpY29uOiBzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIGA8aSBjbGFzcz1cImZhcyAke2ljb259XCI+PC9pPmA7XG4gICAgfVxuXG4gICAgdG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiAnY2xhc3MgRmlyZWFybUF0dGFja0ZlYXR1cmUnO1xuICAgIH1cbn1cbiIsImltcG9ydCBGZWF0dXJlTWFuYWdlciBmcm9tICcuLi9tYW5hZ2Vycy9GZWF0dXJlTWFuYWdlcic7XG5cbmltcG9ydCB7IERuZEl0ZW01ZSB9IGZyb20gJy4uL3R5cGVzL2RuZC50eXBlcyc7XG5pbXBvcnQgQmFzZUZlYXR1cmUgZnJvbSAnLi9CYXNlRmVhdHVyZSc7XG5cbmV4cG9ydCBjbGFzcyBGaXJlYXJtQ3JlYXRpb25GZWF0dXJlIGV4dGVuZHMgQmFzZUZlYXR1cmUge1xuICAgIHByaXZhdGUgX2NyZWF0aW5nRmlyZWFybTogYm9vbGVhbjtcblxuICAgIGNvbnN0cnVjdG9yKGZlYXR1cmVNYW5hZ2VyOiBGZWF0dXJlTWFuYWdlcikge1xuICAgICAgICBzdXBlcihmZWF0dXJlTWFuYWdlcik7XG4gICAgICAgIHRoaXMuX2NyZWF0aW5nRmlyZWFybSA9IGZhbHNlO1xuICAgIH1cblxuICAgIGluaXQoKSB7XG4gICAgICAgIEhvb2tzLm9uKCdwcmVDcmVhdGVJdGVtJywgdGhpcy5vblByZUNyZWF0ZUl0ZW0uYmluZCh0aGlzKSk7XG4gICAgICAgIEhvb2tzLm9uKCdjcmVhdGVJdGVtJywgdGhpcy5vbkNyZWF0ZUl0ZW0uYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgYXN5bmMgb25QcmVDcmVhdGVJdGVtKGl0ZW06IERuZEl0ZW01ZSkge1xuICAgICAgICBpZiAoaXRlbS5zeXN0ZW0udHlwZS5iYXNlSXRlbSA9PSAnZmlyZWFybScpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdXZWFwb24gUmVsb2FkIHwgVHJpZ2dlcmVkIEZpcmVhcm0gUHJlLUNyZWF0aW9uJyk7XG5cbiAgICAgICAgICAgIHRoaXMud2VhcG9uSWQgPSBpdGVtLmlkO1xuICAgICAgICAgICAgdGhpcy5jaGFyYWN0ZXJJZCA9IGl0ZW0uYWN0b3I/LmlkIGFzIHN0cmluZztcbiAgICAgICAgICAgIHRoaXMuX2NyZWF0aW5nRmlyZWFybSA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhc3luYyBvbkNyZWF0ZUl0ZW0oaXRlbTogRG5kSXRlbTVlKSB7XG4gICAgICAgIGlmICghdGhpcy5fY3JlYXRpbmdGaXJlYXJtIHx8IGl0ZW0uaWQgIT09IHRoaXMud2VhcG9uSWQpIHJldHVybjtcblxuICAgICAgICBjb25zb2xlLmxvZygnV2VhcG9uIFJlbG9hZCB8IFRyaWdnZXJlZCBGaXJlYXJtIENyZWF0aW9uJyk7XG5cbiAgICAgICAgY29uc3QgZmlyZWFybSA9IHRoaXMud2VhcG9uO1xuICAgICAgICBjb25zdCBhbW1vUXR5ID0gcGFyc2VJbnQoZmlyZWFybS5zeXN0ZW0udXNlcy5tYXgpO1xuXG4gICAgICAgIGF3YWl0IGZpcmVhcm0udXBkYXRlKHtcbiAgICAgICAgICAgICdzeXN0ZW0udXNlcy5zcGVudCc6IGFtbW9RdHksXG4gICAgICAgICAgICAnc3lzdGVtLnVzZXMudmFsdWUnOiAwLFxuICAgICAgICB9KTtcbiAgICAgICAgYXdhaXQgZmlyZWFybS5zZXRGbGFnKFxuICAgICAgICAgICAgdGhpcy5tb2R1bGVNYW5hZ2VyLmlkLFxuICAgICAgICAgICAgJ2NoYW1iZXJlZCcsXG4gICAgICAgICAgICBuZXcgQXJyYXkoYW1tb1F0eSkuZmlsbCh0aGlzLkVNUFRZKVxuICAgICAgICApO1xuICAgICAgICBhd2FpdCBmaXJlYXJtLnNldEZsYWcoXG4gICAgICAgICAgICB0aGlzLm1vZHVsZU1hbmFnZXIuaWQsXG4gICAgICAgICAgICAnZmlyZWQnLFxuICAgICAgICAgICAgbmV3IEFycmF5KGFtbW9RdHkpLmZpbGwodGhpcy5FTVBUWSlcbiAgICAgICAgKTtcblxuICAgICAgICB0aGlzLndlYXBvbklkID0gJyc7XG4gICAgICAgIHRoaXMuY2hhcmFjdGVySWQgPSAnJztcbiAgICAgICAgdGhpcy5fY3JlYXRpbmdGaXJlYXJtID0gZmFsc2U7XG4gICAgfVxuXG4gICAgdG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiAnY2xhc3MgRmlyZWFybUNyZWF0aW9uRmVhdHVyZSc7XG4gICAgfVxufVxuIiwiaW1wb3J0IEZlYXR1cmVNYW5hZ2VyIGZyb20gJy4uL21hbmFnZXJzL0ZlYXR1cmVNYW5hZ2VyJztcbmltcG9ydCB7IERuZEFjdG9yNWUsIERuZEl0ZW01ZSB9IGZyb20gJy4uL3R5cGVzL2RuZC50eXBlcyc7XG5pbXBvcnQgQmFzZUZlYXR1cmUgZnJvbSAnLi9CYXNlRmVhdHVyZSc7XG5cbmV4cG9ydCBjbGFzcyBSZWxvYWRGZWF0dXJlIGV4dGVuZHMgQmFzZUZlYXR1cmUge1xuICAgIGNvbnN0cnVjdG9yKGZlYXR1cmVNYW5hZ2VyOiBGZWF0dXJlTWFuYWdlcikge1xuICAgICAgICBzdXBlcihmZWF0dXJlTWFuYWdlcik7XG4gICAgfVxuXG4gICAgaW5pdCgpIHtcbiAgICAgICAgSG9va3Mub24oJ2RuZDVlLnBvc3RVc2VBY3Rpdml0eScsIHRoaXMub25Vc2VBY3Rpdml0eS5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICBhc3luYyBvblVzZUFjdGl2aXR5KGFjdGl2aXR5OiBhbnkpIHtcbiAgICAgICAgaWYgKGFjdGl2aXR5LnR5cGUgPT09ICd1dGlsaXR5JyAmJiBhY3Rpdml0eS5uYW1lID09ICdSZWxvYWQnKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnV2VhcG9uIFJlbG9hZCB8IFRyaWdnZXJlZCBSZWxvYWQ6ICcsIGFjdGl2aXR5KTtcblxuICAgICAgICAgICAgdGhpcy5jaGFyYWN0ZXJJZCA9IGFjdGl2aXR5LmFjdG9yLmlkO1xuICAgICAgICAgICAgdGhpcy53ZWFwb25JZCA9IGFjdGl2aXR5Lml0ZW0uaWQ7XG4gICAgICAgICAgICB0aGlzLndlYXBvblJlbG9hZCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgYXN5bmMgd2VhcG9uUmVsb2FkKHJlZnVuZEFtbW86IGJvb2xlYW4gPSB0cnVlKSB7XG4gICAgICAgIGNvbnN0IGl0ZW1zID0gdGhpcy5jaGFyYWN0ZXI/Lml0ZW1zO1xuICAgICAgICBjb25zdCBjaGVja0VxdWlwcGVkID0gZ2FtZS5zZXR0aW5ncy5nZXQoXG4gICAgICAgICAgICB0aGlzLm1vZHVsZU1hbmFnZXIuaWQsXG4gICAgICAgICAgICAnZmlsdGVyQW1tdW5pdGlvbkJ5RXF1aXBwZWQnXG4gICAgICAgICkgYXMgYm9vbGVhbjtcbiAgICAgICAgY29uc3QgY3VycmVudExvYWRvdXQgPSB0aGlzLmxvYWRvdXQ7XG5cbiAgICAgICAgaWYgKHJlZnVuZEFtbW8pIHtcbiAgICAgICAgICAgIHRoaXMucmVmdW5kQ2hhbWJlcmVkQW1tbyh0aGlzLmFtbXVuaXRpb24oaXRlbXMpIGFzIERuZEl0ZW01ZVtdKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGFtbW8gPSB0aGlzLmFtbXVuaXRpb24oaXRlbXMsIGNoZWNrRXF1aXBwZWQpIGFzIERuZEl0ZW01ZVtdO1xuICAgICAgICBjb25zdCBpbnZlbnRvcnlBbW11bml0aW9uOiBEbmRJdGVtNWVbXSA9IFtdO1xuXG4gICAgICAgIGFtbW8uZm9yRWFjaCgoYW1tb0l0ZW06IERuZEl0ZW01ZSkgPT4ge1xuICAgICAgICAgICAgaWYgKGFtbW9JdGVtLnN5c3RlbS5xdWFudGl0eSA+IDApIHtcbiAgICAgICAgICAgICAgICBpbnZlbnRvcnlBbW11bml0aW9uLnB1c2goYW1tb0l0ZW0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBhd2FpdCB0aGlzLmNob29zZUFtbXVuaXRpb24oaW52ZW50b3J5QW1tdW5pdGlvbiwgY3VycmVudExvYWRvdXQpO1xuICAgIH1cblxuICAgIHJlZnVuZENoYW1iZXJlZEFtbW8oYXZhaWxhYmxlQW1tdW5pdGlvbjogRG5kSXRlbTVlW10pIHtcbiAgICAgICAgY29uc3QgbG9hZG91dENvdW50cyA9IHRoaXMuZ2V0TG9hZG91dENvdW50cyh0aGlzLmxvYWRvdXQpO1xuICAgICAgICBhdmFpbGFibGVBbW11bml0aW9uLmZvckVhY2goYXN5bmMgKGFtbW86IERuZEl0ZW01ZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbmFtZSA9IGFtbW8ubmFtZTtcbiAgICAgICAgICAgIGlmIChsb2Fkb3V0Q291bnRzW25hbWVdKSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgYW1tby51cGRhdGUoe1xuICAgICAgICAgICAgICAgICAgICAnc3lzdGVtLnF1YW50aXR5JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGFtbW8uc3lzdGVtLnF1YW50aXR5ICsgbG9hZG91dENvdW50c1tuYW1lXSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYXN5bmMgY2hvb3NlQW1tdW5pdGlvbihcbiAgICAgICAgYXZhaWxhYmxlQW1tdW5pdGlvbjogRG5kSXRlbTVlW10sXG4gICAgICAgIGN1cnJlbnRMb2Fkb3V0OiBzdHJpbmdbXVxuICAgICkge1xuICAgICAgICBjb25zdCBkaWFsb2dDb250ZW50ID0gYXdhaXQgKFxuICAgICAgICAgICAgZm91bmRyeS5hcHBsaWNhdGlvbnMgYXMgYW55XG4gICAgICAgICkuaGFuZGxlYmFycy5yZW5kZXJUZW1wbGF0ZShcbiAgICAgICAgICAgICdtb2R1bGVzL2ZvdW5kcnktdnR0LWViZXJyb24td2VzdC1tb2R1bGUvdGVtcGxhdGVzL2FtbW9TZWxlY3Rpb25EaWFsb2dUZW1wbGF0ZS5oYnMnLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGxvYWRvdXRTbG90czogbmV3IEFycmF5KFxuICAgICAgICAgICAgICAgICAgICBwYXJzZUludCh0aGlzLndlYXBvbi5zeXN0ZW0udXNlcy5tYXgpXG4gICAgICAgICAgICAgICAgKS5maWxsKHRoaXMuRU1QVFkpLFxuICAgICAgICAgICAgICAgIGFtbW9PcHRpb25zOiBhdmFpbGFibGVBbW11bml0aW9uLm1hcCgoYW1tb1R5cGU6IERuZEl0ZW01ZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogYW1tb1R5cGUubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBhbW1vVHlwZS5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgY291bnQ6IGFtbW9UeXBlLnN5c3RlbS5xdWFudGl0eSxcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcblxuICAgICAgICBjb25zdCBkaWFsb2dCdXR0b25zID0gW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGFjdGlvbjogJ2xvYWQnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiB0aGlzLnRyYW5zbGF0ZShcbiAgICAgICAgICAgICAgICAgICAgJ1dFQVBPTl9SRUxPQUQuRmVhdHVyZXMuUmVsb2FkLkFtbXVuaXRpb24uQ2hvaWNlRGlhbG9nQnV0dG9uVHh0TG9hZCdcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIGNhbGxiYWNrOiAoX2V2ZW50LCBidXR0b24pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbG9hZG91dDogc3RyaW5nW10gPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBidXR0b24uZm9ybS5lbGVtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZWxtID0gYnV0dG9uLmZvcm0uZWxlbWVudHMuaXRlbShpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlbG0ubmFtZSA9PSAnYW1tby1zZWxlY3QnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9hZG91dC5wdXNoKGVsbS52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxvYWRvdXQ7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYWN0aW9uOiAnY2FuY2VsJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogdGhpcy50cmFuc2xhdGUoXG4gICAgICAgICAgICAgICAgICAgICdXRUFQT05fUkVMT0FELkZlYXR1cmVzLlJlbG9hZC5BbW11bml0aW9uLkNob2ljZURpYWxvZ0J1dHRvblR4dENhbmNlbCdcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIGNhbGxiYWNrOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjdXJyZW50TG9hZG91dDtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgXTtcblxuICAgICAgICB0aGlzLm1vZHVsZU1hbmFnZXIudWlNYW5hZ2VyXG4gICAgICAgICAgICAuYnVpbGREaWFsb2coXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICB0aXRsZTogdGhpcy50cmFuc2xhdGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAnV0VBUE9OX1JFTE9BRC5GZWF0dXJlcy5SZWxvYWQuQW1tdW5pdGlvbi5DaG9pY2VEaWFsb2dUaXRsZSdcbiAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgY29udGVudDogZGlhbG9nQ29udGVudCxcbiAgICAgICAgICAgICAgICAgICAgYnV0dG9uczogZGlhbG9nQnV0dG9ucyxcbiAgICAgICAgICAgICAgICAgICAgb25TdWJtaXQ6IHRoaXMucmVsb2FkRmlyZWFybS5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgJ2FtbW8tY2hvaWNlLWRpYWxvZydcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgIC5yZW5kZXIoeyBmb3JjZTogdHJ1ZSB9KTtcbiAgICB9XG5cbiAgICBhc3luYyByZWxvYWRGaXJlYXJtKGxvYWRvdXQ6IHN0cmluZ1tdKSB7XG4gICAgICAgIGNvbnN0IGZpcmVhcm0gPSB0aGlzLndlYXBvbjtcbiAgICAgICAgY29uc3QgYW1tb0NvdW50cyA9IHRoaXMuZ2V0TG9hZG91dENvdW50cyhsb2Fkb3V0KTtcblxuICAgICAgICBpZiAodGhpcy5yZW1vdmVMb2Fkb3V0KGFtbW9Db3VudHMpKSB7XG4gICAgICAgICAgICAvLyBVcGRhdGUgdGhlIGZpcmVhcm0gdXNlc1xuICAgICAgICAgICAgbGV0IHF0eSA9IDA7XG4gICAgICAgICAgICBpZiAoYW1tb0NvdW50c1t0aGlzLkVNUFRZXSA+IDApIHtcbiAgICAgICAgICAgICAgICAvLyBBZGp1c3Qgc3BlbnQgdXNlcyBieSB0aGUgbnVtYmVyIG9mIEVtcHR5IHNsb3RzXG4gICAgICAgICAgICAgICAgcXR5ICs9IGFtbW9Db3VudHNbdGhpcy5FTVBUWV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhd2FpdCBmaXJlYXJtLnVwZGF0ZSh7XG4gICAgICAgICAgICAgICAgJ3N5c3RlbS51c2VzLnNwZW50JzogcXR5LFxuICAgICAgICAgICAgICAgICdzeXN0ZW0udXNlcy52YWx1ZSc6IHBhcnNlSW50KGZpcmVhcm0uc3lzdGVtLnVzZXMubWF4KSAtIHF0eSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYXdhaXQgZmlyZWFybS5zZXRGbGFnKHRoaXMubW9kdWxlTWFuYWdlci5pZCwgJ2NoYW1iZXJlZCcsIGxvYWRvdXQpO1xuICAgICAgICAgICAgYXdhaXQgZmlyZWFybS5zZXRGbGFnKFxuICAgICAgICAgICAgICAgIHRoaXMubW9kdWxlTWFuYWdlci5pZCxcbiAgICAgICAgICAgICAgICAnZmlyZWQnLFxuICAgICAgICAgICAgICAgIG5ldyBBcnJheShwYXJzZUludCh0aGlzLndlYXBvbi5zeXN0ZW0udXNlcy5tYXgpKS5maWxsKFxuICAgICAgICAgICAgICAgICAgICB0aGlzLkVNUFRZXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgY29uc3QgaHRtbFRlbXBsYXRlID0gYXdhaXQgKFxuICAgICAgICAgICAgICAgIGZvdW5kcnkuYXBwbGljYXRpb25zIGFzIGFueVxuICAgICAgICAgICAgKS5oYW5kbGViYXJzLnJlbmRlclRlbXBsYXRlKFxuICAgICAgICAgICAgICAgICdtb2R1bGVzL2ZvdW5kcnktdnR0LWViZXJyb24td2VzdC1tb2R1bGUvdGVtcGxhdGVzL2ZpcmVhcm1SZWxvYWRUZW1wbGF0ZS5oYnMnLFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbToge1xuICAgICAgICAgICAgICAgICAgICAgICAgaW1nOiBmaXJlYXJtLmltZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGZpcmVhcm0ubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgZmxhdm9yOiB0aGlzLnRyYW5zbGF0ZShcbiAgICAgICAgICAgICAgICAgICAgICAgICdXRUFQT05fUkVMT0FELkZlYXR1cmVzLlJlbG9hZC5XZWFwb24uV2VhcG9uUmVsb2FkZWRDaGF0Rmxhdm9yJ1xuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICB0aXRsZTogdGhpcy50cmFuc2xhdGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAnV0VBUE9OX1JFTE9BRC5GZWF0dXJlcy5SZWxvYWQuV2VhcG9uLldlYXBvblJlbG9hZGVkQ2hhdE1zZycsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IGZpcmVhcm06IGZpcmVhcm0ubmFtZSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgdHJ1ZVxuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICBsb2Fkb3V0OiBsb2Fkb3V0LFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICAvLyBOb3RpZnkgdGhlIHBlZXBzXG4gICAgICAgICAgICB0aGlzLm1vZHVsZU1hbmFnZXIudWlNYW5hZ2VyLnNlbmRDaGF0KHRoaXMuY2hhcmFjdGVyLCBodG1sVGVtcGxhdGUpO1xuICAgICAgICAgICAgdGhpcy5jaGFyYWN0ZXJJZCA9ICcnO1xuICAgICAgICAgICAgdGhpcy53ZWFwb25JZCA9ICcnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYXdhaXQgdGhpcy53ZWFwb25SZWxvYWQoZmFsc2UpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVtb3ZlTG9hZG91dChjb3VudHM6IHsgW2tleTogc3RyaW5nXTogbnVtYmVyIH0pOiBib29sZWFuIHtcbiAgICAgICAgbGV0IGFtbXVuaXRpb25BdmFpbGFibGUgPSB0cnVlO1xuICAgICAgICBjb25zdCBpbnZlbnRvcnlBbW11bml0aW9uID0gdGhpcy5hbW11bml0aW9uKFxuICAgICAgICAgICAgdGhpcy5jaGFyYWN0ZXI/Lml0ZW1zXG4gICAgICAgICkgYXMgRG5kSXRlbTVlW107XG4gICAgICAgIGludmVudG9yeUFtbXVuaXRpb24uZm9yRWFjaCgoYW1tbzogRG5kSXRlbTVlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBuYW1lID0gYW1tby5uYW1lO1xuICAgICAgICAgICAgY29uc3QgcXR5ID0gYW1tby5zeXN0ZW0ucXVhbnRpdHkgLSBjb3VudHNbbmFtZV07XG5cbiAgICAgICAgICAgIC8vIElmIGFueSBidWxsZXQgaXMgYWRkZWQgYmV5b25kIHRoZSBxdWFudGl0eSB0aGUgcGxheWVyIGFjdHVhbGx5IGhhcyB0aGVuIHRocm93IGFuIGVycm9yIGFuZCByZXR1cm4gZmFsc2VcbiAgICAgICAgICAgIGlmIChxdHkgPCAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tb2R1bGVNYW5hZ2VyLnVpTWFuYWdlci51aU5vdGlmaWNhdGlvbihcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50cmFuc2xhdGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAnV0VBUE9OX1JFTE9BRC5GZWF0dXJlcy5SZWxvYWQuV2VhcG9uLkxvYWRpbmdFcnJvck1zZycsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IG5hbWU6IGFtbW8ubmFtZSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgdHJ1ZVxuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICAnZXJyb3InXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBhbW11bml0aW9uQXZhaWxhYmxlID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChhbW11bml0aW9uQXZhaWxhYmxlKSB7XG4gICAgICAgICAgICBpbnZlbnRvcnlBbW11bml0aW9uLmZvckVhY2goYXN5bmMgKGFtbW86IERuZEl0ZW01ZSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5hbWUgPSBhbW1vLm5hbWU7XG4gICAgICAgICAgICAgICAgaWYgKGNvdW50c1tuYW1lXSkge1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCBhbW1vLnVwZGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAnc3lzdGVtLnF1YW50aXR5JzogYW1tby5zeXN0ZW0ucXVhbnRpdHkgLSBjb3VudHNbbmFtZV0sXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGFtbXVuaXRpb25BdmFpbGFibGU7XG4gICAgfVxuXG4gICAgYXN5bmMgb25SZWxvYWRDYWxsYmFjayhhY3RvcjogRG5kQWN0b3I1ZSwgd2VhcG9uOiBEbmRJdGVtNWUpIHtcbiAgICAgICAgdGhpcy5jaGFyYWN0ZXJJZCA9IGFjdG9yLmlkO1xuICAgICAgICB0aGlzLndlYXBvbklkID0gd2VhcG9uLmlkO1xuXG4gICAgICAgIHRoaXMud2VhcG9uUmVsb2FkKCk7XG4gICAgfVxuXG4gICAgZ2V0TG9hZG91dENvdW50cyhjdXJyZW50TG9hZG91dDogc3RyaW5nW10pOiB7XG4gICAgICAgIFtrZXk6IHN0cmluZ106IG51bWJlcjtcbiAgICB9IHtcbiAgICAgICAgY29uc3QgbG9hZG91dCA9IHt9O1xuICAgICAgICBjdXJyZW50TG9hZG91dC5mb3JFYWNoKChhbW1vOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgIGlmICghbG9hZG91dFthbW1vXSkgbG9hZG91dFthbW1vXSA9IDA7XG4gICAgICAgICAgICBsb2Fkb3V0W2FtbW9dID0gbG9hZG91dFthbW1vXSArIDE7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gbG9hZG91dDtcbiAgICB9XG5cbiAgICB0b1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuICdjbGFzcyBSZWxvYWRGZWF0dXJlJztcbiAgICB9XG59XG4iLCJleHBvcnQgeyBGaXJlYXJtQXR0YWNrRmVhdHVyZSB9IGZyb20gJy4vRmlyZWFybUF0dGFja0ZlYXR1cmUnO1xuZXhwb3J0IHsgRmlyZWFybUNyZWF0aW9uRmVhdHVyZSB9IGZyb20gJy4vRmlyZWFybUNyZWF0aW9uRmVhdHVyZSc7XG5leHBvcnQgeyBSZWxvYWRGZWF0dXJlIH0gZnJvbSAnLi9SZWxvYWRGZWF0dXJlJztcbiIsImltcG9ydCBNb2R1bGVNYW5hZ2VyIGZyb20gJy4vTW9kdWxlTWFuYWdlcic7XG5pbXBvcnQge1xuICAgIEZpcmVhcm1BdHRhY2tGZWF0dXJlLFxuICAgIEZpcmVhcm1DcmVhdGlvbkZlYXR1cmUsXG4gICAgUmVsb2FkRmVhdHVyZSxcbn0gZnJvbSAnLi4vZmVhdHVyZXMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBGZWF0dXJlTWFuYWdlciB7XG4gICAgcHJpdmF0ZSBfbW9kdWxlTWFuYWdlcjogTW9kdWxlTWFuYWdlcjtcbiAgICBwcml2YXRlIF9mZWF0dXJlczogeyBba2V5OiBzdHJpbmddOiBhbnkgfTtcblxuICAgIGNvbnN0cnVjdG9yKG1vZHVsZU1hbmFnZXI6IE1vZHVsZU1hbmFnZXIpIHtcbiAgICAgICAgdGhpcy5fbW9kdWxlTWFuYWdlciA9IG1vZHVsZU1hbmFnZXI7XG4gICAgICAgIHRoaXMuX2ZlYXR1cmVzID0ge307XG4gICAgfVxuXG4gICAgaW5pdCgpIHtcbiAgICAgICAgdGhpcy5fZmVhdHVyZXMgPSB7XG4gICAgICAgICAgICByZWxvYWQ6IG5ldyBSZWxvYWRGZWF0dXJlKHRoaXMpLFxuICAgICAgICAgICAgZmlyZWFybUF0dGFjazogbmV3IEZpcmVhcm1BdHRhY2tGZWF0dXJlKHRoaXMpLFxuICAgICAgICAgICAgZmlyZWFybUNyZWF0aW9uOiBuZXcgRmlyZWFybUNyZWF0aW9uRmVhdHVyZSh0aGlzKSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBnZXRGZWF0dXJlKGlkOiBzdHJpbmcpIHtcbiAgICAgICAgaWYgKHRoaXMuX2ZlYXR1cmVzW2lkXSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2ZlYXR1cmVzW2lkXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBnZXQgbW9kdWxlTWFuYWdlcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX21vZHVsZU1hbmFnZXI7XG4gICAgfVxuXG4gICAgdG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiBgY2xhc3MgRmVhdHVyZU1hbmFnZXI6ICR7dGhpcy5fZmVhdHVyZXMubGVuZ3RofWA7XG4gICAgfVxufVxuIiwiaW1wb3J0IEZlYXR1cmVNYW5hZ2VyIGZyb20gJy4vRmVhdHVyZU1hbmFnZXInO1xuaW1wb3J0IFVpTWFuYWdlciBmcm9tICcuL1VpTWFuYWdlcic7XG5pbXBvcnQgVGVtcGxhdGVNYW5hZ2VyIGZyb20gJy4vVGVtcGxhdGVNYW5hZ2VyJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTW9kdWxlTWFuYWdlciB7XG4gICAgcHJpdmF0ZSBfbW9kdWxlSWQ6IHN0cmluZztcbiAgICBwcml2YXRlIF9mZWF0dXJlTWFuYWdlcjogRmVhdHVyZU1hbmFnZXI7XG4gICAgcHJpdmF0ZSBfdWlNYW5hZ2VyOiBVaU1hbmFnZXI7XG4gICAgcHJpdmF0ZSBfdGVtcGxhdGVNYW5hZ2VyOiBUZW1wbGF0ZU1hbmFnZXI7XG5cbiAgICBjb25zdHJ1Y3RvcihpZDogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuX21vZHVsZUlkID0gaWQ7XG4gICAgICAgIHRoaXMuX2ZlYXR1cmVNYW5hZ2VyID0gbmV3IEZlYXR1cmVNYW5hZ2VyKHRoaXMpO1xuICAgICAgICB0aGlzLl91aU1hbmFnZXIgPSBuZXcgVWlNYW5hZ2VyKHRoaXMpO1xuICAgICAgICB0aGlzLl90ZW1wbGF0ZU1hbmFnZXIgPSBuZXcgVGVtcGxhdGVNYW5hZ2VyKCk7XG4gICAgfVxuXG4gICAgZ2V0IGlkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fbW9kdWxlSWQ7XG4gICAgfVxuXG4gICAgZ2V0IGZlYXR1cmVNYW5hZ2VyKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZmVhdHVyZU1hbmFnZXI7XG4gICAgfVxuXG4gICAgZ2V0IHVpTWFuYWdlcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3VpTWFuYWdlcjtcbiAgICB9XG5cbiAgICBnZXQgdGVtcGxhdGVNYW5hZ2VyKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fdGVtcGxhdGVNYW5hZ2VyO1xuICAgIH1cblxuICAgIGluaXQoKSB7XG4gICAgICAgIHRoaXMuc3lzdGVtT3ZlcnJpZGVzKCk7XG4gICAgICAgIHRoaXMubW9kdWxlQ29uZmlndXJhdGlvbnMoKTtcbiAgICAgICAgdGhpcy5fZmVhdHVyZU1hbmFnZXIuaW5pdCgpO1xuICAgICAgICB0aGlzLl91aU1hbmFnZXIuaW5pdCgpO1xuICAgICAgICB0aGlzLl90ZW1wbGF0ZU1hbmFnZXIuaW5pdCgpO1xuICAgIH1cblxuICAgIHN5c3RlbU92ZXJyaWRlcygpIHtcbiAgICAgICAgKENPTkZJRyBhcyBhbnkpLkRORDVFLmZlYXR1cmVUeXBlcy5pdGVtID0ge1xuICAgICAgICAgICAgbGFiZWw6IHRoaXMudWlNYW5hZ2VyLmdldExvY2FsaXplZFR4dCgnSXRlbUZlYXR1cmUnKSxcbiAgICAgICAgfTtcblxuICAgICAgICAoQ09ORklHIGFzIGFueSkuRE5ENUUuaXRlbVByb3BlcnRpZXMuY29uY2VhbGFibGUgPSB7XG4gICAgICAgICAgICBsYWJlbDogdGhpcy51aU1hbmFnZXIuZ2V0TG9jYWxpemVkVHh0KCdDb25jZWFsYWJsZScpLFxuICAgICAgICB9O1xuICAgICAgICAoQ09ORklHIGFzIGFueSkuRE5ENUUudmFsaWRQcm9wZXJ0aWVzLndlYXBvbi5hZGQoJ2NvbmNlYWxhYmxlJyk7XG5cbiAgICAgICAgKENPTkZJRyBhcyBhbnkpLkRORDVFLml0ZW1Qcm9wZXJ0aWVzLnVuc3RhYmxlID0ge1xuICAgICAgICAgICAgbGFiZWw6IHRoaXMudWlNYW5hZ2VyLmdldExvY2FsaXplZFR4dCgnVW5zdGFibGUnKSxcbiAgICAgICAgICAgIGlzUGh5c2ljYWw6IHRydWUsXG4gICAgICAgIH07XG5cbiAgICAgICAgKENPTkZJRyBhcyBhbnkpLkRORDVFLndlYXBvbklkcy5maXJlYXJtID1cbiAgICAgICAgICAgICdDb21wZW5kaXVtLmZ2dHQtd2VhcG9uLXJlbG9hZC5pdGVtLXBhY2suSXRlbS5sRTYwUWFTMXNjdGIzT0FkJztcbiAgICB9XG5cbiAgICBtb2R1bGVDb25maWd1cmF0aW9ucygpIHtcbiAgICAgICAgY29uc3QgbW9kdWxlTmFtZSA9ICdmdnR0LXdlYXBvbi1yZWxvYWQnO1xuXG4gICAgICAgIGdhbWUuc2V0dGluZ3MucmVnaXN0ZXIobW9kdWxlTmFtZSwgJ3Vuc3RhYmxlQW1tbycsIHtcbiAgICAgICAgICAgIHNjb3BlOiAnd29ybGQnLFxuICAgICAgICAgICAgbmFtZTogJ1NFVFRJTkdTLldFQVBPTl9SRUxPQUQuVW5zdGFibGVBbW1vLk5hbWUnLFxuICAgICAgICAgICAgaGludDogJ1NFVFRJTkdTLldFQVBPTl9SRUxPQUQuVW5zdGFibGVBbW1vLkhpbnQnLFxuICAgICAgICAgICAgdHlwZTogQm9vbGVhbixcbiAgICAgICAgICAgIGNvbmZpZzogdHJ1ZSxcbiAgICAgICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGdhbWUuc2V0dGluZ3MucmVnaXN0ZXIobW9kdWxlTmFtZSwgJ3VzZU1pc2ZpcmVzJywge1xuICAgICAgICAgICAgc2NvcGU6ICd3b3JsZCcsXG4gICAgICAgICAgICBuYW1lOiAnU0VUVElOR1MuV0VBUE9OX1JFTE9BRC5Vc2VNaXNmaXJlcy5OYW1lJyxcbiAgICAgICAgICAgIGhpbnQ6ICdTRVRUSU5HUy5XRUFQT05fUkVMT0FELlVzZU1pc2ZpcmVzLkhpbnQnLFxuICAgICAgICAgICAgdHlwZTogQm9vbGVhbixcbiAgICAgICAgICAgIGNvbmZpZzogdHJ1ZSxcbiAgICAgICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGdhbWUuc2V0dGluZ3MucmVnaXN0ZXIobW9kdWxlTmFtZSwgJ2ZpbHRlckFtbXVuaXRpb25CeUVxdWlwcGVkJywge1xuICAgICAgICAgICAgc2NvcGU6ICd1c2VyJyxcbiAgICAgICAgICAgIG5hbWU6ICdTRVRUSU5HUy5XRUFQT05fUkVMT0FELkZpbHRlckFtbXVuaXRpb25CeUVxdWlwcGVkLk5hbWUnLFxuICAgICAgICAgICAgaGludDogJ1NFVFRJTkdTLldFQVBPTl9SRUxPQUQuRmlsdGVyQW1tdW5pdGlvbkJ5RXF1aXBwZWQuSGludCcsXG4gICAgICAgICAgICB0eXBlOiBCb29sZWFuLFxuICAgICAgICAgICAgY29uZmlnOiB0cnVlLFxuICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZGVidWcoaG9va3M6IGJvb2xlYW4gPSBmYWxzZSkge1xuICAgICAgICBDT05GSUcuZGVidWcuaG9va3MgPSBob29rcztcbiAgICAgICAgY29uc29sZS5sb2coJ0NPTkZJRzogJywgQ09ORklHKTtcbiAgICAgICAgY29uc29sZS5sb2coJ0NPTkZJRy5ETkQ1RTogJywgKENPTkZJRyBhcyBhbnkpLkRORDVFKTtcbiAgICB9XG5cbiAgICB0b1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuICdjbGFzcyBNb2R1bGVNYW5hZ2VyJztcbiAgICB9XG59XG4iLCJleHBvcnQgZGVmYXVsdCBjbGFzcyBUZW1wbGF0ZU1hbmFnZXIge1xuICAgIGNvbnN0cnVjdG9yKCkge31cblxuICAgIGluaXQoKSB7XG4gICAgICAgIChmb3VuZHJ5LmFwcGxpY2F0aW9ucyBhcyBhbnkpLmhhbmRsZWJhcnMubG9hZFRlbXBsYXRlcyhcbiAgICAgICAgICAgIFRlbXBsYXRlTWFuYWdlci5wYXRoc1xuICAgICAgICApO1xuICAgIH1cblxuICAgIHN0YXRpYyBnZXQgcGF0aHMoKSB7XG4gICAgICAgIGNvbnN0IHBhdGhzID0ge307XG4gICAgICAgIGNvbnN0IHRlbXBsYXRlUGF0aHMgPSAnbW9kdWxlcy9mdnR0LXdlYXBvbi1yZWxvYWQvdGVtcGxhdGVzL2ZpcmVhcm1SZWxvYWRUZW1wbGF0ZS5oYnMsbW9kdWxlcy9mdnR0LXdlYXBvbi1yZWxvYWQvdGVtcGxhdGVzL2Jhc2ljTWVzc2FnZS5oYnMsbW9kdWxlcy9mdnR0LXdlYXBvbi1yZWxvYWQvdGVtcGxhdGVzL2FtbW9TZWxlY3Rpb25EaWFsb2dUZW1wbGF0ZS5oYnMsbW9kdWxlcy9mdnR0LXdlYXBvbi1yZWxvYWQvdGVtcGxhdGVzL2FtbW9SZWZ1bmROb3RpY2VUZW1wbGF0ZS5oYnMsbW9kdWxlcy9mdnR0LXdlYXBvbi1yZWxvYWQvdGVtcGxhdGVzL2FjdGl2aXR5LWNhcmQuaGJzJy5zcGxpdCgnLCcpO1xuICAgICAgICBmb3IgKGNvbnN0IHBhdGggb2YgdGVtcGxhdGVQYXRocykge1xuICAgICAgICAgICAgcGF0aHNbcGF0aC5yZXBsYWNlKCcuaGJzJywgJy5odG1sJyldID0gcGF0aDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcGF0aHM7XG4gICAgfVxuXG4gICAgc3RhdGljIG9uSG90UmVsb2FkKCkge1xuICAgICAgICBmb3IgKGNvbnN0IHRlbXBsYXRlIGluIF90ZW1wbGF0ZUNhY2hlKSB7XG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKF90ZW1wbGF0ZUNhY2hlLCB0ZW1wbGF0ZSlcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBfdGVtcGxhdGVDYWNoZVt0ZW1wbGF0ZV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAoZm91bmRyeS5hcHBsaWNhdGlvbnMgYXMgYW55KS5oYW5kbGViYXJzXG4gICAgICAgICAgICAubG9hZFRlbXBsYXRlcyh0aGlzLnBhdGhzKVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgYXBwbGljYXRpb24gaW4gdWkud2luZG93cykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdWkud2luZG93cyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHBsaWNhdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVpLndpbmRvd3NbYXBwbGljYXRpb25dLnJlbmRlcih0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gJ2NsYXNzIFRlbXBsYXRlTWFuYWdlcic7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgRG5kQWN0b3I1ZSB9IGZyb20gJy4uL3R5cGVzL2RuZC50eXBlcyc7XG5pbXBvcnQgTW9kdWxlTWFuYWdlciBmcm9tICcuL01vZHVsZU1hbmFnZXInO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBVaU1hbmFnZXIge1xuICAgIHByaXZhdGUgX21vZHVsZU1hbmFnZXI6IE1vZHVsZU1hbmFnZXI7XG5cbiAgICBjb25zdHJ1Y3Rvcihtb2R1bGVNYW5hZ2VyOiBNb2R1bGVNYW5hZ2VyKSB7XG4gICAgICAgIHRoaXMuX21vZHVsZU1hbmFnZXIgPSBtb2R1bGVNYW5hZ2VyO1xuICAgIH1cblxuICAgIGluaXQoKSB7XG4gICAgICAgIC8vIEVNUFRZIEZPUiBOT1dcbiAgICB9XG5cbiAgICBnZXQgbW9kdWxlTWFuYWdlcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX21vZHVsZU1hbmFnZXI7XG4gICAgfVxuXG4gICAgYnVpbGREaWFsb2cob3B0aW9ucywgaWQpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBmb3VuZHJ5LmFwcGxpY2F0aW9ucy5hcGkuRGlhbG9nVjIoe1xuICAgICAgICAgICAgd2luZG93OiB7IHRpdGxlOiBvcHRpb25zLnRpdGxlIH0sXG4gICAgICAgICAgICBjb250ZW50OiBvcHRpb25zLmNvbnRlbnQsXG4gICAgICAgICAgICBidXR0b25zOiBvcHRpb25zLmJ1dHRvbnMsXG4gICAgICAgICAgICBzdWJtaXQ6IG9wdGlvbnMub25TdWJtaXQsXG4gICAgICAgICAgICBpZDogaWQsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHVpTm90aWZpY2F0aW9uKG1zZzogc3RyaW5nLCB0eXBlOiBzdHJpbmcgPSAnaW5mbycpIHtcbiAgICAgICAgaWYgKHVpLm5vdGlmaWNhdGlvbnMpIHtcbiAgICAgICAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ2Vycm9yJzpcbiAgICAgICAgICAgICAgICAgICAgdWkubm90aWZpY2F0aW9ucy5lcnJvcihtc2cpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICd3YXJuJzpcbiAgICAgICAgICAgICAgICAgICAgdWkubm90aWZpY2F0aW9ucy53YXJuKG1zZyk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2luZm8nOlxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIHVpLm5vdGlmaWNhdGlvbnMuaW5mbyhtc2cpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgc2VuZENoYXQoXG4gICAgICAgIHNwZWFrZXI6IERuZEFjdG9yNWUsXG4gICAgICAgIGNvbnRlbnQ6IHN0cmluZyxcbiAgICAgICAgZmxhdm9yPzogc3RyaW5nLFxuICAgICAgICBzb3VuZD86IHN0cmluZyxcbiAgICAgICAgdHlwZTogMCB8IDEgfCAyIHwgMyB8IDQgfCA1ID0gQ09OU1QuQ0hBVF9NRVNTQUdFX1RZUEVTLk9PQ1xuICAgICkge1xuICAgICAgICBjb25zdCBDaGF0RGF0YSA9IHtcbiAgICAgICAgICAgIHNwZWFrZXI6IENoYXRNZXNzYWdlLmdldFNwZWFrZXIoeyBhY3Rvcjogc3BlYWtlciB9KSxcbiAgICAgICAgICAgIHR5cGUsXG4gICAgICAgICAgICBmbGF2b3IsXG4gICAgICAgICAgICBzb3VuZCxcbiAgICAgICAgICAgIGNvbnRlbnQsXG4gICAgICAgIH07XG4gICAgICAgIENoYXRNZXNzYWdlLmNyZWF0ZShDaGF0RGF0YSk7XG4gICAgfVxuXG4gICAgZ2V0TG9jYWxpemVkVHh0KFxuICAgICAgICBrZXk6IHN0cmluZyxcbiAgICAgICAgb3B0cz86IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH0sXG4gICAgICAgIGZvcm1hdDogYm9vbGVhbiA9IGZhbHNlXG4gICAgKSB7XG4gICAgICAgIGlmIChmb3JtYXQpIHtcbiAgICAgICAgICAgIHJldHVybiAoZ2FtZSBhcyBhbnkpLmkxOG4uZm9ybWF0KGtleSwgb3B0cyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIChnYW1lIGFzIGFueSkuaTE4bi5sb2NhbGl6ZShrZXksIG9wdHMpO1xuICAgIH1cblxuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gJ2NsYXNzIFVpTWFuYWdlcic7XG4gICAgfVxufVxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiOyIsImltcG9ydCBNb2R1bGVNYW5hZ2VyIGZyb20gJy4vbW9kdWxlL21hbmFnZXJzL01vZHVsZU1hbmFnZXInO1xuaW1wb3J0IFRlbXBsYXRlTWFuYWdlciBmcm9tICcuL21vZHVsZS9tYW5hZ2Vycy9UZW1wbGF0ZU1hbmFnZXInO1xuXG5pbXBvcnQgbW9kdWxlSnNvbiBmcm9tICcuLi9tb2R1bGUuanNvbic7XG5cbkhvb2tzLm9uY2UoJ2luaXQnLCBhc3luYyAoKSA9PiB7XG4gICAgY29uc29sZS5sb2coJ0ViZXJyb24gV2VzdCB8IEZvdW5kcnkgVlRUIE1vZHVsZScpO1xuXG4gICAgY29uc3Qgd2VhcG9uX3JlbG9hZCA9IG5ldyBNb2R1bGVNYW5hZ2VyKG1vZHVsZUpzb24uaWQpO1xuICAgIHdlYXBvbl9yZWxvYWQuZGVidWcodHJ1ZSk7XG4gICAgd2VhcG9uX3JlbG9hZC5pbml0KCk7XG59KTtcblxuaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAnZGV2ZWxvcG1lbnQnKSB7XG4gICAgaWYgKG1vZHVsZS5ob3QpIHtcbiAgICAgICAgbW9kdWxlLmhvdC5hY2NlcHQoKTtcblxuICAgICAgICBpZiAobW9kdWxlLmhvdC5zdGF0dXMoKSA9PT0gJ2FwcGx5Jykge1xuICAgICAgICAgICAgVGVtcGxhdGVNYW5hZ2VyLm9uSG90UmVsb2FkKCk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJleHBvcnQgZGVmYXVsdCBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyArIFwic3R5bGVzL21vZHVsZS5jc3NcIjsiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=