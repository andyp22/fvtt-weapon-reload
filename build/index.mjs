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
                    return { loadout, reloadCanceled: false };
                },
            },
            {
                action: 'cancel',
                label: this.translate('WEAPON_RELOAD.Features.Reload.Ammunition.ChoiceDialogButtonTxtCancel'),
                callback: () => {
                    this._handleChoiceDialogClose = false;
                    return { loadout: currentLoadout, reloadCanceled: true };
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
            onSubmit: ({ loadout, reloadCanceled, }) => {
                this.reloadReloadableWeapon(loadout, reloadCanceled);
            },
        }, 'ammo-choice-dialog')
            .render({ force: true });
    }
    onCloseChoiceDialog(loadout) {
        Hooks.off('closeDialogV2', this._hookId);
        this._hookId = -1;
        if (this._handleChoiceDialogClose) {
            this._handleChoiceDialogClose = false;
            this.reloadReloadableWeapon(loadout, true);
        }
    }
    async reloadReloadableWeapon(loadout, reloadCanceled = false) {
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
                flavor: this.translate(reloadCanceled
                    ? 'WEAPON_RELOAD.Features.Reload.Weapon.WeaponReloadedChatFlavorCanceled'
                    : 'WEAPON_RELOAD.Features.Reload.Weapon.WeaponReloadedChatFlavor'),
                title: this.translate(reloadCanceled
                    ? 'WEAPON_RELOAD.Features.Reload.Weapon.WeaponReloadedChatMsgCanceled'
                    : 'WEAPON_RELOAD.Features.Reload.Weapon.WeaponReloadedChatMsg', { reloadableWeapon: reloadableWeapon.name }, true),
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
    onUseActivity(d20Roll, event) {
        const roll = d20Roll[0];
        const weaponData = roll?.data?.item;
        if (weaponData?.type?.baseItem !== 'reloadableWeapon')
            return;
        console.log('Weapon Reload | Triggered Attack');
        this.weaponId = event.subject.item.id;
        this.characterId = event.subject.actor.id;
        return this.reloadableWeaponAttack();
    }
    reloadableWeaponAttack() {
        const bullet = this.getNextRound();
        if (bullet.name == 'Empty') {
            this.dryfireWeapon();
            return false;
        }
        this._nextRound = {
            id: bullet.id,
            type: bullet.type,
        };
        this._hookId = Hooks.on('dnd5e.renderChatMessage', this.onRenderChatMessage.bind(this));
        return this.fireRound(bullet);
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
    getNextRound() {
        const character = this.character;
        const weapon = this.weapon;
        const loadout = this.loadout;
        loadout.push('Empty');
        const nextRound = loadout.shift();
        weapon.setFlag(this.moduleManager.id, 'chambered', loadout);
        const inventoryAmmunition = this.ammunition(character.items);
        return (inventoryAmmunition.find((ammo) => {
            const name = ammo.name;
            if (name == nextRound) {
                return ammo;
            }
            return null;
        }) || { name: 'Empty' });
    }
    dryfireWeapon() {
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
        this.renderCard(templateData, character);
    }
    async renderCard(templateData, character) {
        const htmlTemplate = await foundry.applications.handlebars.renderTemplate('modules/fvtt-weapon-reload/templates/activity-card.hbs', templateData);
        this.moduleManager.uiManager.sendChat(character, htmlTemplate);
    }
    fireRound(bullet) {
        const reloadableWeapon = this.weapon;
        const maxShots = parseInt(reloadableWeapon.system.uses.max);
        const firedLoadout = reloadableWeapon.getFlag(this.moduleManager.id, 'fired') || new Array(maxShots).fill('Empty');
        firedLoadout.unshift(bullet.name);
        firedLoadout.splice(-1);
        reloadableWeapon.setFlag(this.moduleManager.id, 'fired', firedLoadout);
        const uses = reloadableWeapon.system.uses;
        const qty = uses.spent + 1 <= parseInt(uses.max)
            ? uses.spent + 1
            : parseInt(uses.max);
        reloadableWeapon.update({
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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ekMsSUFBSSxLQUFVLEVBQUU7QUFBQSxFQU1mO0FBQ0wsQ0FBQzs7Ozs7Ozs7Ozs7OztBQ3JCRCxpRUFBZSxxQkFBdUIsc0JBQXNCLEUiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9mdnR0LXdlYXBvbi1yZWxvYWQvLi9zcmMvbW9kdWxlL2ZlYXR1cmVzL0Jhc2VGZWF0dXJlLnRzIiwid2VicGFjazovL2Z2dHQtd2VhcG9uLXJlbG9hZC8uL3NyYy9tb2R1bGUvZmVhdHVyZXMvUmVsb2FkRmVhdHVyZS50cyIsIndlYnBhY2s6Ly9mdnR0LXdlYXBvbi1yZWxvYWQvLi9zcmMvbW9kdWxlL2ZlYXR1cmVzL1JlbG9hZGFibGVXZWFwb25BdHRhY2tGZWF0dXJlLnRzIiwid2VicGFjazovL2Z2dHQtd2VhcG9uLXJlbG9hZC8uL3NyYy9tb2R1bGUvZmVhdHVyZXMvUmVsb2FkYWJsZVdlYXBvbkNyZWF0aW9uRmVhdHVyZS50cyIsIndlYnBhY2s6Ly9mdnR0LXdlYXBvbi1yZWxvYWQvLi9zcmMvbW9kdWxlL2ZlYXR1cmVzL2luZGV4LnRzIiwid2VicGFjazovL2Z2dHQtd2VhcG9uLXJlbG9hZC8uL3NyYy9tb2R1bGUvbWFuYWdlcnMvRmVhdHVyZU1hbmFnZXIudHMiLCJ3ZWJwYWNrOi8vZnZ0dC13ZWFwb24tcmVsb2FkLy4vc3JjL21vZHVsZS9tYW5hZ2Vycy9Nb2R1bGVNYW5hZ2VyLnRzIiwid2VicGFjazovL2Z2dHQtd2VhcG9uLXJlbG9hZC8uL3NyYy9tb2R1bGUvbWFuYWdlcnMvVGVtcGxhdGVNYW5hZ2VyLnRzIiwid2VicGFjazovL2Z2dHQtd2VhcG9uLXJlbG9hZC8uL3NyYy9tb2R1bGUvbWFuYWdlcnMvVWlNYW5hZ2VyLnRzIiwid2VicGFjazovL2Z2dHQtd2VhcG9uLXJlbG9hZC93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9mdnR0LXdlYXBvbi1yZWxvYWQvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL2Z2dHQtd2VhcG9uLXJlbG9hZC93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL2Z2dHQtd2VhcG9uLXJlbG9hZC93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL2Z2dHQtd2VhcG9uLXJlbG9hZC93ZWJwYWNrL3J1bnRpbWUvcHVibGljUGF0aCIsIndlYnBhY2s6Ly9mdnR0LXdlYXBvbi1yZWxvYWQvLi9zcmMvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vZnZ0dC13ZWFwb24tcmVsb2FkLy4vc3JjL3N0eWxlcy9tb2R1bGUuc2NzcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgRmVhdHVyZU1hbmFnZXIgZnJvbSAnLi4vbWFuYWdlcnMvRmVhdHVyZU1hbmFnZXInO1xuXG5pbXBvcnQgeyBEbmRBY3RvcjVlLCBEbmRJdGVtNWUgfSBmcm9tICcuLi90eXBlcy9kbmQudHlwZXMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCYXNlRmVhdHVyZSB7XG4gICAgcHJpdmF0ZSBfZmVhdHVyZU1hbmFnZXI6IEZlYXR1cmVNYW5hZ2VyO1xuICAgIHByaXZhdGUgX2FjdG9ySWQ6IHN0cmluZztcbiAgICBwcml2YXRlIF93ZWFwb25JZDogc3RyaW5nO1xuXG4gICAgY29uc3RydWN0b3IoZmVhdHVyZU1hbmFnZXI6IEZlYXR1cmVNYW5hZ2VyKSB7XG4gICAgICAgIHRoaXMuX2ZlYXR1cmVNYW5hZ2VyID0gZmVhdHVyZU1hbmFnZXI7XG4gICAgICAgIHRoaXMuX2FjdG9ySWQgPSAnJztcbiAgICAgICAgdGhpcy5fd2VhcG9uSWQgPSAnJztcbiAgICAgICAgdGhpcy5pbml0KCk7XG4gICAgfVxuXG4gICAgZ2V0IGZlYXR1cmVNYW5hZ2VyKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZmVhdHVyZU1hbmFnZXI7XG4gICAgfVxuXG4gICAgZ2V0IG1vZHVsZU1hbmFnZXIoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9mZWF0dXJlTWFuYWdlci5tb2R1bGVNYW5hZ2VyO1xuICAgIH1cblxuICAgIGdldCBjaGFyYWN0ZXIoKTogRG5kQWN0b3I1ZSB7XG4gICAgICAgIHJldHVybiBnYW1lPy5hY3RvcnM/LmdldCh0aGlzLl9hY3RvcklkKSBhcyBEbmRBY3RvcjVlO1xuICAgIH1cblxuICAgIGdldCBjaGFyYWN0ZXJJZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FjdG9ySWQ7XG4gICAgfVxuXG4gICAgc2V0IGNoYXJhY3RlcklkKGlkOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5fYWN0b3JJZCA9IGlkO1xuICAgIH1cblxuICAgIGdldCB3ZWFwb24oKTogRG5kSXRlbTVlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2hhcmFjdGVyLml0ZW1zLmdldCh0aGlzLl93ZWFwb25JZCkgYXMgRG5kSXRlbTVlO1xuICAgIH1cblxuICAgIGdldCB3ZWFwb25JZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3dlYXBvbklkO1xuICAgIH1cblxuICAgIHNldCB3ZWFwb25JZChpZDogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuX3dlYXBvbklkID0gaWQ7XG4gICAgfVxuXG4gICAgZ2V0IGxvYWRvdXQoKSB7XG4gICAgICAgIGNvbnN0IHJlbG9hZGFibGVXZWFwb24gPSB0aGlzLndlYXBvbjtcbiAgICAgICAgY29uc3QgbWF4U2hvdHMgPSBwYXJzZUludChyZWxvYWRhYmxlV2VhcG9uLnN5c3RlbS51c2VzLm1heCk7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRMb2Fkb3V0ID1cbiAgICAgICAgICAgIChyZWxvYWRhYmxlV2VhcG9uLmdldEZsYWcoXG4gICAgICAgICAgICAgICAgdGhpcy5tb2R1bGVNYW5hZ2VyLmlkLFxuICAgICAgICAgICAgICAgICdjaGFtYmVyZWQnXG4gICAgICAgICAgICApIGFzIHN0cmluZ1tdKSB8fCBuZXcgQXJyYXkobWF4U2hvdHMpLmZpbGwoJ0VtcHR5Jyk7XG5cbiAgICAgICAgaWYgKGN1cnJlbnRMb2Fkb3V0Lmxlbmd0aCA8IG1heFNob3RzKSB7XG4gICAgICAgICAgICBjb25zdCBtaXNzaW5nID0gbWF4U2hvdHMgLSBjdXJyZW50TG9hZG91dC5sZW5ndGg7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG1pc3Npbmc7IGkrKykge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRMb2Fkb3V0LnB1c2goJ0VtcHR5Jyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gY3VycmVudExvYWRvdXQ7XG4gICAgfVxuXG4gICAgZ2V0IGZpcmVkKCkge1xuICAgICAgICBjb25zdCByZWxvYWRhYmxlV2VhcG9uID0gdGhpcy53ZWFwb247XG4gICAgICAgIGNvbnN0IG1heFNob3RzID0gcGFyc2VJbnQocmVsb2FkYWJsZVdlYXBvbi5zeXN0ZW0udXNlcy5tYXgpO1xuICAgICAgICBjb25zdCBmaXJlZCA9XG4gICAgICAgICAgICAocmVsb2FkYWJsZVdlYXBvbi5nZXRGbGFnKFxuICAgICAgICAgICAgICAgIHRoaXMubW9kdWxlTWFuYWdlci5pZCxcbiAgICAgICAgICAgICAgICAnZmlyZWQnXG4gICAgICAgICAgICApIGFzIHN0cmluZ1tdKSB8fCBuZXcgQXJyYXkobWF4U2hvdHMpLmZpbGwoJ0VtcHR5Jyk7XG5cbiAgICAgICAgaWYgKGZpcmVkLmxlbmd0aCA8IG1heFNob3RzKSB7XG4gICAgICAgICAgICBjb25zdCBtaXNzaW5nID0gbWF4U2hvdHMgLSBmaXJlZC5sZW5ndGg7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG1pc3Npbmc7IGkrKykge1xuICAgICAgICAgICAgICAgIGZpcmVkLnB1c2goJ0VtcHR5Jyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZmlyZWQ7XG4gICAgfVxuXG4gICAgYW1tdW5pdGlvbihpdGVtczogQ29sbGVjdGlvbjxJdGVtNWU+LCBlcXVpcHBlZDogYm9vbGVhbiA9IGZhbHNlKTogSXRlbTVlW10ge1xuICAgICAgICByZXR1cm4gaXRlbXMuZmlsdGVyKChpdGVtOiBJdGVtNWUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGdhbWVTeXN0ZW0gPSAoaXRlbSBhcyBEbmRJdGVtNWUpLnN5c3RlbTtcbiAgICAgICAgICAgIGlmIChlcXVpcHBlZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgIGl0ZW0udHlwZSA9PSAnY29uc3VtYWJsZScgJiZcbiAgICAgICAgICAgICAgICAgICAgZ2FtZVN5c3RlbS50eXBlLnN1YnR5cGUgPT0gJ2ZpcmVhcm1CdWxsZXQnICYmXG4gICAgICAgICAgICAgICAgICAgIGdhbWVTeXN0ZW0uZXF1aXBwZWRcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICBpdGVtLnR5cGUgPT0gJ2NvbnN1bWFibGUnICYmXG4gICAgICAgICAgICAgICAgZ2FtZVN5c3RlbS50eXBlLnN1YnR5cGUgPT0gJ2ZpcmVhcm1CdWxsZXQnXG4gICAgICAgICAgICApO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBpbml0KCkge31cblxuICAgIHRyYW5zbGF0ZShrZXk6IHN0cmluZywgb3B0cz86IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH0sIGZvcm1hdD86IGJvb2xlYW4pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubW9kdWxlTWFuYWdlci51aU1hbmFnZXIuZ2V0TG9jYWxpemVkVHh0KGtleSwgb3B0cywgZm9ybWF0KTtcbiAgICB9XG5cbiAgICB0b1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuICdjbGFzcyBCYXNlRmVhdHVyZSc7XG4gICAgfVxufVxuIiwiaW1wb3J0IERpYWxvZ1YyIGZyb20gJ0BsZWFndWUtb2YtZm91bmRyeS1kZXZlbG9wZXJzL2ZvdW5kcnktdnR0LXR5cGVzL3NyYy9mb3VuZHJ5L2NsaWVudC1lc20vYXBwbGljYXRpb25zL2FwaS9kaWFsb2cubWpzJztcbmltcG9ydCBGZWF0dXJlTWFuYWdlciBmcm9tICcuLi9tYW5hZ2Vycy9GZWF0dXJlTWFuYWdlcic7XG5pbXBvcnQgeyBEbmRBY3RvcjVlLCBEbmRJdGVtNWUgfSBmcm9tICcuLi90eXBlcy9kbmQudHlwZXMnO1xuaW1wb3J0IEJhc2VGZWF0dXJlIGZyb20gJy4vQmFzZUZlYXR1cmUnO1xuXG5pbnRlcmZhY2UgQW1tb0l0ZW1PcHRpb24ge1xuICAgIG5hbWU6IHN0cmluZztcbiAgICB2YWx1ZTogc3RyaW5nO1xuICAgIGNvdW50OiBudW1iZXI7XG4gICAgZXF1aXBwZWQ6IGJvb2xlYW47XG59XG5cbmV4cG9ydCBjbGFzcyBSZWxvYWRGZWF0dXJlIGV4dGVuZHMgQmFzZUZlYXR1cmUge1xuICAgIHByaXZhdGUgX2hvb2tJZDogbnVtYmVyO1xuICAgIHByaXZhdGUgX2hhbmRsZUNob2ljZURpYWxvZ0Nsb3NlOiBib29sZWFuO1xuXG4gICAgY29uc3RydWN0b3IoZmVhdHVyZU1hbmFnZXI6IEZlYXR1cmVNYW5hZ2VyKSB7XG4gICAgICAgIHN1cGVyKGZlYXR1cmVNYW5hZ2VyKTtcbiAgICAgICAgdGhpcy5faG9va0lkID0gLTE7XG4gICAgICAgIHRoaXMuX2hhbmRsZUNob2ljZURpYWxvZ0Nsb3NlID0gZmFsc2U7XG4gICAgfVxuXG4gICAgaW5pdCgpIHtcbiAgICAgICAgSG9va3Mub24oJ2RuZDVlLnBvc3RVc2VBY3Rpdml0eScsIHRoaXMub25Vc2VBY3Rpdml0eS5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICBvblVzZUFjdGl2aXR5KGFjdGl2aXR5OiBhbnkpIHtcbiAgICAgICAgaWYgKGFjdGl2aXR5LnR5cGUgPT09ICd1dGlsaXR5JyAmJiBhY3Rpdml0eS5uYW1lID09ICdSZWxvYWQnKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnV2VhcG9uIFJlbG9hZCB8IFRyaWdnZXJlZCBSZWxvYWQnKTtcblxuICAgICAgICAgICAgdGhpcy5jaGFyYWN0ZXJJZCA9IGFjdGl2aXR5LmFjdG9yLmlkO1xuICAgICAgICAgICAgdGhpcy53ZWFwb25JZCA9IGFjdGl2aXR5Lml0ZW0uaWQ7XG4gICAgICAgICAgICB0aGlzLndlYXBvblJlbG9hZCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgd2VhcG9uUmVsb2FkKHJlZnVuZEFtbW86IGJvb2xlYW4gPSB0cnVlKSB7XG4gICAgICAgIGNvbnN0IGl0ZW1zID0gdGhpcy5jaGFyYWN0ZXI/Lml0ZW1zO1xuICAgICAgICBjb25zdCBjdXJyZW50TG9hZG91dCA9IHRoaXMubG9hZG91dDtcbiAgICAgICAgY29uc3QgaW52ZW50b3J5QW1tdW5pdGlvbiA9IHRoaXMuYW1tdW5pdGlvbihpdGVtcykgYXMgRG5kSXRlbTVlW107XG4gICAgICAgIGxldCBhbW11bml0aW9uQ2hvaWNlczogQW1tb0l0ZW1PcHRpb25bXSA9IFtdO1xuXG4gICAgICAgIGlmIChyZWZ1bmRBbW1vKSB7XG4gICAgICAgICAgICBhbW11bml0aW9uQ2hvaWNlcyA9IHRoaXMucmVmdW5kQ2hhbWJlcmVkQW1tbyhpbnZlbnRvcnlBbW11bml0aW9uKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGFtbXVuaXRpb25DaG9pY2VzID0gaW52ZW50b3J5QW1tdW5pdGlvbi5tYXAoXG4gICAgICAgICAgICAgICAgKGFtbW86IERuZEl0ZW01ZSk6IEFtbW9JdGVtT3B0aW9uID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGFtbW8ubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBhbW1vLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb3VudDogYW1tby5zeXN0ZW0ucXVhbnRpdHksXG4gICAgICAgICAgICAgICAgICAgICAgICBlcXVpcHBlZDogYW1tby5zeXN0ZW0uZXF1aXBwZWQsXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGNoZWNrRXF1aXBwZWQgPSBnYW1lLnNldHRpbmdzLmdldChcbiAgICAgICAgICAgIHRoaXMubW9kdWxlTWFuYWdlci5pZCxcbiAgICAgICAgICAgICdmaWx0ZXJBbW11bml0aW9uQnlFcXVpcHBlZCdcbiAgICAgICAgKSBhcyBib29sZWFuO1xuXG4gICAgICAgIHRoaXMuY2hvb3NlQW1tdW5pdGlvbihcbiAgICAgICAgICAgIGFtbXVuaXRpb25DaG9pY2VzLmZpbHRlcigoYW1tb0l0ZW06IEFtbW9JdGVtT3B0aW9uKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGFtbW9JdGVtLmNvdW50ID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAoY2hlY2tFcXVpcHBlZCAmJiBhbW1vSXRlbS5lcXVpcHBlZCkgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICFjaGVja0VxdWlwcGVkXG4gICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBjdXJyZW50TG9hZG91dFxuICAgICAgICApO1xuICAgIH1cblxuICAgIHJlZnVuZENoYW1iZXJlZEFtbW8oaW52ZW50b3J5QW1tdW5pdGlvbjogRG5kSXRlbTVlW10pOiBBbW1vSXRlbU9wdGlvbltdIHtcbiAgICAgICAgY29uc3QgbG9hZG91dENvdW50cyA9IHRoaXMuZ2V0TG9hZG91dENvdW50cyh0aGlzLmxvYWRvdXQpO1xuICAgICAgICBjb25zdCBhdmFpbGFibGVBbW11bml0aW9uOiBBbW1vSXRlbU9wdGlvbltdID0gW107XG4gICAgICAgIGludmVudG9yeUFtbXVuaXRpb24uZm9yRWFjaCgoYW1tbzogRG5kSXRlbTVlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBuYW1lID0gYW1tby5uYW1lO1xuICAgICAgICAgICAgY29uc3QgYW1tb0luZm86IEFtbW9JdGVtT3B0aW9uID0ge1xuICAgICAgICAgICAgICAgIG5hbWU6IGFtbW8ubmFtZSxcbiAgICAgICAgICAgICAgICB2YWx1ZTogYW1tby5uYW1lLFxuICAgICAgICAgICAgICAgIGNvdW50OiBhbW1vLnN5c3RlbS5xdWFudGl0eSxcbiAgICAgICAgICAgICAgICBlcXVpcHBlZDogYW1tby5zeXN0ZW0uZXF1aXBwZWQsXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaWYgKGxvYWRvdXRDb3VudHNbbmFtZV0pIHtcbiAgICAgICAgICAgICAgICBhbW1vSW5mby5jb3VudCA9IGFtbW8uc3lzdGVtLnF1YW50aXR5ICsgbG9hZG91dENvdW50c1tuYW1lXTtcbiAgICAgICAgICAgICAgICBhbW1vLnVwZGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgICdzeXN0ZW0ucXVhbnRpdHknOiBhbW1vSW5mby5jb3VudCxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGF2YWlsYWJsZUFtbXVuaXRpb24ucHVzaChhbW1vSW5mbyk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gYXZhaWxhYmxlQW1tdW5pdGlvbjtcbiAgICB9XG5cbiAgICBhc3luYyBjaG9vc2VBbW11bml0aW9uKFxuICAgICAgICBhbW1vT3B0aW9uczogQW1tb0l0ZW1PcHRpb25bXSxcbiAgICAgICAgY3VycmVudExvYWRvdXQ6IHN0cmluZ1tdXG4gICAgKSB7XG4gICAgICAgIGNvbnN0IGRpYWxvZ0NvbnRlbnQgPSBhd2FpdCAoXG4gICAgICAgICAgICBmb3VuZHJ5LmFwcGxpY2F0aW9ucyBhcyBhbnlcbiAgICAgICAgKS5oYW5kbGViYXJzLnJlbmRlclRlbXBsYXRlKFxuICAgICAgICAgICAgJ21vZHVsZXMvZnZ0dC13ZWFwb24tcmVsb2FkL3RlbXBsYXRlcy9hbW1vU2VsZWN0aW9uRGlhbG9nVGVtcGxhdGUuaGJzJyxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBsb2Fkb3V0U2xvdHM6IG5ldyBBcnJheShcbiAgICAgICAgICAgICAgICAgICAgcGFyc2VJbnQodGhpcy53ZWFwb24uc3lzdGVtLnVzZXMubWF4KVxuICAgICAgICAgICAgICAgICkuZmlsbCgnRW1wdHknKSxcbiAgICAgICAgICAgICAgICBhbW1vT3B0aW9ucyxcbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcblxuICAgICAgICBjb25zdCBkaWFsb2dCdXR0b25zID0gW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGFjdGlvbjogJ2xvYWQnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiB0aGlzLnRyYW5zbGF0ZShcbiAgICAgICAgICAgICAgICAgICAgJ1dFQVBPTl9SRUxPQUQuRmVhdHVyZXMuUmVsb2FkLkFtbXVuaXRpb24uQ2hvaWNlRGlhbG9nQnV0dG9uVHh0TG9hZCdcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIGNhbGxiYWNrOiAoX2V2ZW50LCBidXR0b24pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5faGFuZGxlQ2hvaWNlRGlhbG9nQ2xvc2UgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbG9hZG91dDogc3RyaW5nW10gPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBidXR0b24uZm9ybS5lbGVtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZWxtID0gYnV0dG9uLmZvcm0uZWxlbWVudHMuaXRlbShpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlbG0ubmFtZSA9PSAnYW1tby1zZWxlY3QnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9hZG91dC5wdXNoKGVsbS52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgbG9hZG91dCwgcmVsb2FkQ2FuY2VsZWQ6IGZhbHNlIH07XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYWN0aW9uOiAnY2FuY2VsJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogdGhpcy50cmFuc2xhdGUoXG4gICAgICAgICAgICAgICAgICAgICdXRUFQT05fUkVMT0FELkZlYXR1cmVzLlJlbG9hZC5BbW11bml0aW9uLkNob2ljZURpYWxvZ0J1dHRvblR4dENhbmNlbCdcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIGNhbGxiYWNrOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2hhbmRsZUNob2ljZURpYWxvZ0Nsb3NlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7IGxvYWRvdXQ6IGN1cnJlbnRMb2Fkb3V0LCByZWxvYWRDYW5jZWxlZDogdHJ1ZSB9O1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICBdO1xuXG4gICAgICAgIHRoaXMuX2hhbmRsZUNob2ljZURpYWxvZ0Nsb3NlID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5faG9va0lkID0gSG9va3Mub24oJ2Nsb3NlRGlhbG9nVjInLCAoZGlhbG9nVjI6IERpYWxvZ1YyKSA9PiB7XG4gICAgICAgICAgICBpZiAoZGlhbG9nVjIuaWQgPT09ICdhbW1vLWNob2ljZS1kaWFsb2cnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vbkNsb3NlQ2hvaWNlRGlhbG9nKGN1cnJlbnRMb2Fkb3V0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5tb2R1bGVNYW5hZ2VyLnVpTWFuYWdlclxuICAgICAgICAgICAgLmJ1aWxkRGlhbG9nKFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IHRoaXMudHJhbnNsYXRlKFxuICAgICAgICAgICAgICAgICAgICAgICAgJ1dFQVBPTl9SRUxPQUQuRmVhdHVyZXMuUmVsb2FkLkFtbXVuaXRpb24uQ2hvaWNlRGlhbG9nVGl0bGUnXG4gICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGRpYWxvZ0NvbnRlbnQsXG4gICAgICAgICAgICAgICAgICAgIGJ1dHRvbnM6IGRpYWxvZ0J1dHRvbnMsXG4gICAgICAgICAgICAgICAgICAgIG9uU3VibWl0OiAoe1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9hZG91dCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbG9hZENhbmNlbGVkLFxuICAgICAgICAgICAgICAgICAgICB9OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2Fkb3V0OiBzdHJpbmdbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbG9hZENhbmNlbGVkOiBib29sZWFuO1xuICAgICAgICAgICAgICAgICAgICB9KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbG9hZFJlbG9hZGFibGVXZWFwb24obG9hZG91dCwgcmVsb2FkQ2FuY2VsZWQpO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgJ2FtbW8tY2hvaWNlLWRpYWxvZydcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgIC5yZW5kZXIoeyBmb3JjZTogdHJ1ZSB9KTtcbiAgICB9XG5cbiAgICBvbkNsb3NlQ2hvaWNlRGlhbG9nKGxvYWRvdXQ6IHN0cmluZ1tdKSB7XG4gICAgICAgIEhvb2tzLm9mZignY2xvc2VEaWFsb2dWMicsIHRoaXMuX2hvb2tJZCk7XG4gICAgICAgIHRoaXMuX2hvb2tJZCA9IC0xO1xuXG4gICAgICAgIGlmICh0aGlzLl9oYW5kbGVDaG9pY2VEaWFsb2dDbG9zZSkge1xuICAgICAgICAgICAgdGhpcy5faGFuZGxlQ2hvaWNlRGlhbG9nQ2xvc2UgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMucmVsb2FkUmVsb2FkYWJsZVdlYXBvbihsb2Fkb3V0LCB0cnVlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFzeW5jIHJlbG9hZFJlbG9hZGFibGVXZWFwb24oXG4gICAgICAgIGxvYWRvdXQ6IHN0cmluZ1tdLFxuICAgICAgICByZWxvYWRDYW5jZWxlZDogYm9vbGVhbiA9IGZhbHNlXG4gICAgKSB7XG4gICAgICAgIGNvbnN0IHJlbG9hZGFibGVXZWFwb24gPSB0aGlzLndlYXBvbjtcbiAgICAgICAgY29uc3QgYW1tb0NvdW50cyA9IHRoaXMuZ2V0TG9hZG91dENvdW50cyhsb2Fkb3V0KTtcblxuICAgICAgICBpZiAodGhpcy5yZW1vdmVMb2Fkb3V0KGFtbW9Db3VudHMpKSB7XG4gICAgICAgICAgICAvLyBVcGRhdGUgdGhlIHJlbG9hZGFibGVXZWFwb24gdXNlc1xuICAgICAgICAgICAgbGV0IHF0eSA9IDA7XG4gICAgICAgICAgICBpZiAoYW1tb0NvdW50c1snRW1wdHknXSA+IDApIHtcbiAgICAgICAgICAgICAgICAvLyBBZGp1c3Qgc3BlbnQgdXNlcyBieSB0aGUgbnVtYmVyIG9mIEVtcHR5IHNsb3RzXG4gICAgICAgICAgICAgICAgcXR5ICs9IGFtbW9Db3VudHNbJ0VtcHR5J107XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhd2FpdCByZWxvYWRhYmxlV2VhcG9uLnVwZGF0ZSh7XG4gICAgICAgICAgICAgICAgJ3N5c3RlbS51c2VzLnNwZW50JzogcXR5LFxuICAgICAgICAgICAgICAgICdzeXN0ZW0udXNlcy52YWx1ZSc6XG4gICAgICAgICAgICAgICAgICAgIHBhcnNlSW50KHJlbG9hZGFibGVXZWFwb24uc3lzdGVtLnVzZXMubWF4KSAtIHF0eSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYXdhaXQgcmVsb2FkYWJsZVdlYXBvbi5zZXRGbGFnKFxuICAgICAgICAgICAgICAgIHRoaXMubW9kdWxlTWFuYWdlci5pZCxcbiAgICAgICAgICAgICAgICAnY2hhbWJlcmVkJyxcbiAgICAgICAgICAgICAgICBsb2Fkb3V0XG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgYXdhaXQgcmVsb2FkYWJsZVdlYXBvbi5zZXRGbGFnKFxuICAgICAgICAgICAgICAgIHRoaXMubW9kdWxlTWFuYWdlci5pZCxcbiAgICAgICAgICAgICAgICAnZmlyZWQnLFxuICAgICAgICAgICAgICAgIG5ldyBBcnJheShwYXJzZUludCh0aGlzLndlYXBvbi5zeXN0ZW0udXNlcy5tYXgpKS5maWxsKCdFbXB0eScpXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICBjb25zdCBodG1sVGVtcGxhdGUgPSBhd2FpdCAoXG4gICAgICAgICAgICAgICAgZm91bmRyeS5hcHBsaWNhdGlvbnMgYXMgYW55XG4gICAgICAgICAgICApLmhhbmRsZWJhcnMucmVuZGVyVGVtcGxhdGUoXG4gICAgICAgICAgICAgICAgJ21vZHVsZXMvZnZ0dC13ZWFwb24tcmVsb2FkL3RlbXBsYXRlcy9yZWxvYWRhYmxlV2VhcG9uUmVsb2FkVGVtcGxhdGUuaGJzJyxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW06IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGltZzogcmVsb2FkYWJsZVdlYXBvbi5pbWcsXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiByZWxvYWRhYmxlV2VhcG9uLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGZsYXZvcjogdGhpcy50cmFuc2xhdGUoXG4gICAgICAgICAgICAgICAgICAgICAgICByZWxvYWRDYW5jZWxlZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gJ1dFQVBPTl9SRUxPQUQuRmVhdHVyZXMuUmVsb2FkLldlYXBvbi5XZWFwb25SZWxvYWRlZENoYXRGbGF2b3JDYW5jZWxlZCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6ICdXRUFQT05fUkVMT0FELkZlYXR1cmVzLlJlbG9hZC5XZWFwb24uV2VhcG9uUmVsb2FkZWRDaGF0Rmxhdm9yJ1xuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICB0aXRsZTogdGhpcy50cmFuc2xhdGUoXG4gICAgICAgICAgICAgICAgICAgICAgICByZWxvYWRDYW5jZWxlZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gJ1dFQVBPTl9SRUxPQUQuRmVhdHVyZXMuUmVsb2FkLldlYXBvbi5XZWFwb25SZWxvYWRlZENoYXRNc2dDYW5jZWxlZCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6ICdXRUFQT05fUkVMT0FELkZlYXR1cmVzLlJlbG9hZC5XZWFwb24uV2VhcG9uUmVsb2FkZWRDaGF0TXNnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgcmVsb2FkYWJsZVdlYXBvbjogcmVsb2FkYWJsZVdlYXBvbi5uYW1lIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgIGxvYWRvdXQ6IGxvYWRvdXQsXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIC8vIE5vdGlmeSB0aGUgcGVlcHNcbiAgICAgICAgICAgIHRoaXMubW9kdWxlTWFuYWdlci51aU1hbmFnZXIuc2VuZENoYXQodGhpcy5jaGFyYWN0ZXIsIGh0bWxUZW1wbGF0ZSk7XG4gICAgICAgICAgICB0aGlzLmNoYXJhY3RlcklkID0gJyc7XG4gICAgICAgICAgICB0aGlzLndlYXBvbklkID0gJyc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLndlYXBvblJlbG9hZChmYWxzZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZW1vdmVMb2Fkb3V0KGNvdW50czogeyBba2V5OiBzdHJpbmddOiBudW1iZXIgfSk6IGJvb2xlYW4ge1xuICAgICAgICBsZXQgYW1tdW5pdGlvbkF2YWlsYWJsZSA9IHRydWU7XG4gICAgICAgIGNvbnN0IGludmVudG9yeUFtbXVuaXRpb24gPSB0aGlzLmFtbXVuaXRpb24oXG4gICAgICAgICAgICB0aGlzLmNoYXJhY3Rlcj8uaXRlbXNcbiAgICAgICAgKSBhcyBEbmRJdGVtNWVbXTtcbiAgICAgICAgaW52ZW50b3J5QW1tdW5pdGlvbi5mb3JFYWNoKChhbW1vOiBEbmRJdGVtNWUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5hbWUgPSBhbW1vLm5hbWU7XG4gICAgICAgICAgICBjb25zdCBxdHkgPSBhbW1vLnN5c3RlbS5xdWFudGl0eSAtIGNvdW50c1tuYW1lXTtcblxuICAgICAgICAgICAgLy8gSWYgYW55IGJ1bGxldCBpcyBhZGRlZCBiZXlvbmQgdGhlIHF1YW50aXR5IHRoZSBwbGF5ZXIgYWN0dWFsbHkgaGFzIHRoZW4gdGhyb3cgYW4gZXJyb3IgYW5kIHJldHVybiBmYWxzZVxuICAgICAgICAgICAgaWYgKHF0eSA8IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1vZHVsZU1hbmFnZXIudWlNYW5hZ2VyLnVpTm90aWZpY2F0aW9uKFxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRyYW5zbGF0ZShcbiAgICAgICAgICAgICAgICAgICAgICAgICdXRUFQT05fUkVMT0FELkZlYXR1cmVzLlJlbG9hZC5XZWFwb24uTG9hZGluZ0Vycm9yTXNnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgbmFtZTogYW1tby5uYW1lIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgICdlcnJvcidcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGFtbXVuaXRpb25BdmFpbGFibGUgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKGFtbXVuaXRpb25BdmFpbGFibGUpIHtcbiAgICAgICAgICAgIGludmVudG9yeUFtbXVuaXRpb24uZm9yRWFjaChhc3luYyAoYW1tbzogRG5kSXRlbTVlKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgbmFtZSA9IGFtbW8ubmFtZTtcbiAgICAgICAgICAgICAgICBpZiAoY291bnRzW25hbWVdKSB7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IGFtbW8udXBkYXRlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICdzeXN0ZW0ucXVhbnRpdHknOiBhbW1vLnN5c3RlbS5xdWFudGl0eSAtIGNvdW50c1tuYW1lXSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYW1tdW5pdGlvbkF2YWlsYWJsZTtcbiAgICB9XG5cbiAgICBhc3luYyBvblJlbG9hZENhbGxiYWNrKGFjdG9yOiBEbmRBY3RvcjVlLCB3ZWFwb246IERuZEl0ZW01ZSkge1xuICAgICAgICB0aGlzLmNoYXJhY3RlcklkID0gYWN0b3IuaWQ7XG4gICAgICAgIHRoaXMud2VhcG9uSWQgPSB3ZWFwb24uaWQ7XG5cbiAgICAgICAgdGhpcy53ZWFwb25SZWxvYWQoKTtcbiAgICB9XG5cbiAgICBnZXRMb2Fkb3V0Q291bnRzKGN1cnJlbnRMb2Fkb3V0OiBzdHJpbmdbXSk6IHtcbiAgICAgICAgW2tleTogc3RyaW5nXTogbnVtYmVyO1xuICAgIH0ge1xuICAgICAgICBjb25zdCBsb2Fkb3V0ID0ge307XG4gICAgICAgIGN1cnJlbnRMb2Fkb3V0LmZvckVhY2goKGFtbW86IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgaWYgKCFsb2Fkb3V0W2FtbW9dKSBsb2Fkb3V0W2FtbW9dID0gMDtcbiAgICAgICAgICAgIGxvYWRvdXRbYW1tb10gPSBsb2Fkb3V0W2FtbW9dICsgMTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBsb2Fkb3V0O1xuICAgIH1cblxuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gJ2NsYXNzIFJlbG9hZEZlYXR1cmUnO1xuICAgIH1cbn1cbiIsImltcG9ydCBGZWF0dXJlTWFuYWdlciBmcm9tICcuLi9tYW5hZ2Vycy9GZWF0dXJlTWFuYWdlcic7XG5cbmltcG9ydCB7XG4gICAgRG5kQWN0b3I1ZSxcbiAgICBEbmRJdGVtNWUsXG4gICAgRG5kRDIwUm9sbCxcbiAgICBEbmRBdHRhY2tFdmVudCxcbn0gZnJvbSAnLi4vdHlwZXMvZG5kLnR5cGVzJztcblxuaW1wb3J0IHsgQWN0aXZpdHlDYXJkQ2hhdFR5cGUgfSBmcm9tICcuLi90eXBlcy9jaGF0LnR5cGVzJztcbmltcG9ydCBCYXNlRmVhdHVyZSBmcm9tICcuL0Jhc2VGZWF0dXJlJztcblxuZXhwb3J0IGNsYXNzIFJlbG9hZGFibGVXZWFwb25BdHRhY2tGZWF0dXJlIGV4dGVuZHMgQmFzZUZlYXR1cmUge1xuICAgIHByaXZhdGUgX25leHRSb3VuZDoge1xuICAgICAgICBpZDogc3RyaW5nO1xuICAgICAgICB0eXBlOiBzdHJpbmc7XG4gICAgfTtcbiAgICBwcml2YXRlIF9ob29rSWQ6IG51bWJlcjtcblxuICAgIGNvbnN0cnVjdG9yKGZlYXR1cmVNYW5hZ2VyOiBGZWF0dXJlTWFuYWdlcikge1xuICAgICAgICBzdXBlcihmZWF0dXJlTWFuYWdlcik7XG4gICAgICAgIHRoaXMuX25leHRSb3VuZCA9IHsgaWQ6ICcnLCB0eXBlOiAnJyB9O1xuICAgICAgICB0aGlzLl9ob29rSWQgPSAtMTtcbiAgICB9XG5cbiAgICBpbml0KCkge1xuICAgICAgICBIb29rcy5vbignZG5kNWUucG9zdFJvbGxDb25maWd1cmF0aW9uJywgdGhpcy5vblVzZUFjdGl2aXR5LmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIG9uVXNlQWN0aXZpdHkoZDIwUm9sbDogRG5kRDIwUm9sbFtdLCBldmVudDogRG5kQXR0YWNrRXZlbnQpIHtcbiAgICAgICAgY29uc3Qgcm9sbCA9IGQyMFJvbGxbMF07XG4gICAgICAgIGNvbnN0IHdlYXBvbkRhdGEgPSByb2xsPy5kYXRhPy5pdGVtO1xuICAgICAgICBpZiAod2VhcG9uRGF0YT8udHlwZT8uYmFzZUl0ZW0gIT09ICdyZWxvYWRhYmxlV2VhcG9uJykgcmV0dXJuO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKCdXZWFwb24gUmVsb2FkIHwgVHJpZ2dlcmVkIEF0dGFjaycpO1xuICAgICAgICB0aGlzLndlYXBvbklkID0gZXZlbnQuc3ViamVjdC5pdGVtLmlkO1xuICAgICAgICB0aGlzLmNoYXJhY3RlcklkID0gZXZlbnQuc3ViamVjdC5hY3Rvci5pZDtcblxuICAgICAgICByZXR1cm4gdGhpcy5yZWxvYWRhYmxlV2VhcG9uQXR0YWNrKCk7XG4gICAgfVxuXG4gICAgcmVsb2FkYWJsZVdlYXBvbkF0dGFjaygpIHtcbiAgICAgICAgY29uc3QgYnVsbGV0ID0gdGhpcy5nZXROZXh0Um91bmQoKTtcblxuICAgICAgICBpZiAoYnVsbGV0Lm5hbWUgPT0gJ0VtcHR5Jykge1xuICAgICAgICAgICAgdGhpcy5kcnlmaXJlV2VhcG9uKCk7XG5cbiAgICAgICAgICAgIC8vIFN0b3AgdGhlIGF0dGFjayBpZiBEcnlmaXJpbmcgdGhlIHdlYXBvblxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fbmV4dFJvdW5kID0ge1xuICAgICAgICAgICAgaWQ6IGJ1bGxldC5pZCxcbiAgICAgICAgICAgIHR5cGU6IGJ1bGxldC50eXBlLFxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuX2hvb2tJZCA9IEhvb2tzLm9uKFxuICAgICAgICAgICAgJ2RuZDVlLnJlbmRlckNoYXRNZXNzYWdlJyxcbiAgICAgICAgICAgIHRoaXMub25SZW5kZXJDaGF0TWVzc2FnZS5iaW5kKHRoaXMpXG4gICAgICAgICk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZmlyZVJvdW5kKGJ1bGxldCk7XG4gICAgfVxuXG4gICAgYXN5bmMgb25SZW5kZXJDaGF0TWVzc2FnZShtZXNzYWdlLCBodG1sKSB7XG4gICAgICAgIGNvbnN0IGl0ZW1JZCA9IG1lc3NhZ2UuZmxhZ3MuZG5kNWU/Lml0ZW0uaWQ7XG4gICAgICAgIGNvbnN0IGl0ZW1UeXBlID0gbWVzc2FnZS5mbGFncy5kbmQ1ZT8uaXRlbS50eXBlO1xuICAgICAgICBpZiAoXG4gICAgICAgICAgICB0aGlzLl9uZXh0Um91bmQuaWQgPT09IGl0ZW1JZCAmJlxuICAgICAgICAgICAgdGhpcy5fbmV4dFJvdW5kLnR5cGUgPT09IGl0ZW1UeXBlXG4gICAgICAgICkge1xuICAgICAgICAgICAgSG9va3Mub2ZmKCdkbmQ1ZS5yZW5kZXJDaGF0TWVzc2FnZScsIHRoaXMuX2hvb2tJZCk7XG4gICAgICAgICAgICB0aGlzLl9uZXh0Um91bmQgPSB7IGlkOiAnJywgdHlwZTogJycgfTtcblxuICAgICAgICAgICAgY29uc3QgYnVsbGV0ID0gdGhpcy5jaGFyYWN0ZXIuaXRlbXMuZ2V0KGl0ZW1JZCkgYXMgRG5kSXRlbTVlO1xuXG4gICAgICAgICAgICBjb25zdCBhY3RpdmF0aW9uQ2FyZCA9IGh0bWwucXVlcnlTZWxlY3RvcignLmFjdGl2YXRpb24tY2FyZCcpO1xuICAgICAgICAgICAgY29uc3QgaXRlbWNhcmQgPSBodG1sLnF1ZXJ5U2VsZWN0b3IoJy5pdGVtLWNhcmQnKTtcbiAgICAgICAgICAgIGNvbnN0IHBhcmVudEVsZW1lbnQgPSBhY3RpdmF0aW9uQ2FyZCB8fCBpdGVtY2FyZDtcblxuICAgICAgICAgICAgLy8gR3JhYiBtb2R1bGUgY29uZmlndXJhdGlvbnNcbiAgICAgICAgICAgIGNvbnN0IGNoZWNrVW5zdGFibGVBbW1vID0gZ2FtZS5zZXR0aW5ncy5nZXQoXG4gICAgICAgICAgICAgICAgdGhpcy5tb2R1bGVNYW5hZ2VyLmlkLFxuICAgICAgICAgICAgICAgICd1bnN0YWJsZUFtbW8nXG4gICAgICAgICAgICApIGFzIGJvb2xlYW47XG5cbiAgICAgICAgICAgIGNvbnN0IGNoZWNrTWlzZmlyZSA9IGdhbWUuc2V0dGluZ3MuZ2V0KFxuICAgICAgICAgICAgICAgIHRoaXMubW9kdWxlTWFuYWdlci5pZCxcbiAgICAgICAgICAgICAgICAndXNlTWlzZmlyZXMnXG4gICAgICAgICAgICApIGFzIGJvb2xlYW47XG5cbiAgICAgICAgICAgIGNvbnN0IHVuc3RhYmxlQW1tb0ZhaWx1cmVUaHJlc2hvbGQgPSBnYW1lLnNldHRpbmdzLmdldChcbiAgICAgICAgICAgICAgICB0aGlzLm1vZHVsZU1hbmFnZXIuaWQsXG4gICAgICAgICAgICAgICAgJ3Vuc3RhYmxlQW1tb0ZhaWx1cmVUaHJlc2hob2xkJ1xuICAgICAgICAgICAgKSBhcyBudW1iZXI7XG5cbiAgICAgICAgICAgIC8vIEFkZCB0aGUgbWlzZmlyZSBtZXNzYWdlXG4gICAgICAgICAgICBpZiAoY2hlY2tNaXNmaXJlKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY3JpdGljYWxGYWlsdXJlTXNnID1cbiAgICAgICAgICAgICAgICAgICAgY2hlY2tVbnN0YWJsZUFtbW8gJiZcbiAgICAgICAgICAgICAgICAgICAgYnVsbGV0Py5zeXN0ZW0ucHJvcGVydGllcy5maW5kKChwcm9wOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwcm9wID09PSAndW5zdGFibGUnO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgPyB0aGlzLnRyYW5zbGF0ZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdXRUFQT05fUkVMT0FELkZlYXR1cmVzLlJlbG9hZGFibGVXZWFwb25BdHRhY2suTWlzZmlyZVVuc3RhYmxlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgZmFpbHVyZTogYCR7dW5zdGFibGVBbW1vRmFpbHVyZVRocmVzaG9sZH1gIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgIDogdGhpcy50cmFuc2xhdGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnV0VBUE9OX1JFTE9BRC5GZWF0dXJlcy5SZWxvYWRhYmxlV2VhcG9uQXR0YWNrLk1pc2ZpcmVOYXRPbmUnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBjYXJkQ29udGVudEVsZW1lbnQgPVxuICAgICAgICAgICAgICAgICAgICBwYXJlbnRFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jYXJkLWNvbnRlbnQnKTtcbiAgICAgICAgICAgICAgICBjb25zdCB3cmFwcGVyRWxlbWVudCA9XG4gICAgICAgICAgICAgICAgICAgIGNhcmRDb250ZW50RWxlbWVudC5xdWVyeVNlbGVjdG9yKCcud3JhcHBlcicpO1xuICAgICAgICAgICAgICAgIHdyYXBwZXJFbGVtZW50Lmluc2VydEFkamFjZW50SFRNTChcbiAgICAgICAgICAgICAgICAgICAgJ2JlZm9yZWVuZCcsXG4gICAgICAgICAgICAgICAgICAgIGA8cD4ke2NyaXRpY2FsRmFpbHVyZU1zZ308L3A+YFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEFkZCBjYXJkIGJ1dHRvbiBjb250YWluZXIgaWYgbWlzc2luZ1xuICAgICAgICAgICAgaWYgKGl0ZW1jYXJkICYmICFhY3RpdmF0aW9uQ2FyZCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlZmVyZW5jZUVsZW1lbnQgPVxuICAgICAgICAgICAgICAgICAgICBwYXJlbnRFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jYXJkLWhlYWRlcicpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGJ1dHRvbkNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgICAgIGJ1dHRvbkNvbnRhaW5lci5jbGFzc05hbWUgPSAnY2FyZC1idXR0b25zJztcbiAgICAgICAgICAgICAgICByZWZlcmVuY2VFbGVtZW50LmFmdGVyKGJ1dHRvbkNvbnRhaW5lcik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IGNhcmRCdXR0b25zRWxlbWVudCA9XG4gICAgICAgICAgICAgICAgcGFyZW50RWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuY2FyZC1idXR0b25zJyk7XG5cbiAgICAgICAgICAgIC8vIEFkZCBNaXNmaXJlIGJ1dHRvblxuICAgICAgICAgICAgaWYgKGNoZWNrTWlzZmlyZSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1pc2ZpcmVCdG4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgICAgICAgICAgICAgICBtaXNmaXJlQnRuLm9uY2xpY2sgPSB0aGlzLm9uQ2xpY2tNaXNmaXJlLmJpbmQodGhpcyk7XG4gICAgICAgICAgICAgICAgbWlzZmlyZUJ0bi5pbm5lckhUTUwgPSBgJHt0aGlzLm1ha2VJY29uKCdmYS1idXJzdCcpfSR7dGhpcy50cmFuc2xhdGUoXG4gICAgICAgICAgICAgICAgICAgICdXRUFQT05fUkVMT0FELkZlYXR1cmVzLlJlbG9hZGFibGVXZWFwb25BdHRhY2suTWlzZmlyZWRCdG5UeHQnXG4gICAgICAgICAgICAgICAgKX1gO1xuICAgICAgICAgICAgICAgIGNhcmRCdXR0b25zRWxlbWVudC5hcHBlbmQobWlzZmlyZUJ0bik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEFkZCBhbW1vIHJlZnVuZCBidXR0b25cbiAgICAgICAgICAgIGNvbnN0IHJlZnVuZEJ0biA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgICAgICAgICAgcmVmdW5kQnRuLm9uY2xpY2sgPSB0aGlzLm9uQ2xpY2tSZWZ1bmQuYmluZCh0aGlzKTtcbiAgICAgICAgICAgIHJlZnVuZEJ0bi5pbm5lckhUTUwgPSBgJHt0aGlzLm1ha2VJY29uKCdmYS11bmRvJyl9JHt0aGlzLnRyYW5zbGF0ZShcbiAgICAgICAgICAgICAgICAnV0VBUE9OX1JFTE9BRC5GZWF0dXJlcy5SZWxvYWRhYmxlV2VhcG9uQXR0YWNrLlJlZnVuZEJ0blR4dCdcbiAgICAgICAgICAgICl9YDtcbiAgICAgICAgICAgIGNhcmRCdXR0b25zRWxlbWVudC5hcHBlbmQocmVmdW5kQnRuKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldE5leHRSb3VuZCgpOiBEbmRJdGVtNWUge1xuICAgICAgICBjb25zdCBjaGFyYWN0ZXIgPSB0aGlzLmNoYXJhY3RlcjtcbiAgICAgICAgY29uc3Qgd2VhcG9uID0gdGhpcy53ZWFwb247XG5cbiAgICAgICAgY29uc3QgbG9hZG91dCA9IHRoaXMubG9hZG91dDtcbiAgICAgICAgbG9hZG91dC5wdXNoKCdFbXB0eScpO1xuICAgICAgICBjb25zdCBuZXh0Um91bmQgPSBsb2Fkb3V0LnNoaWZ0KCk7XG5cbiAgICAgICAgLy8gUmVtb3ZlIHRoZSBidWxsZXQgZnJvbSB0aGUgcmVsb2FkYWJsZVdlYXBvbiBhbW11bml0aW9uXG4gICAgICAgIHdlYXBvbi5zZXRGbGFnKHRoaXMubW9kdWxlTWFuYWdlci5pZCwgJ2NoYW1iZXJlZCcsIGxvYWRvdXQpO1xuXG4gICAgICAgIGNvbnN0IGludmVudG9yeUFtbXVuaXRpb24gPSB0aGlzLmFtbXVuaXRpb24oXG4gICAgICAgICAgICBjaGFyYWN0ZXIuaXRlbXNcbiAgICAgICAgKSBhcyBEbmRJdGVtNWVbXTtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIGludmVudG9yeUFtbXVuaXRpb24uZmluZCgoYW1tbzogRG5kSXRlbTVlKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgbmFtZSA9IGFtbW8ubmFtZTtcbiAgICAgICAgICAgICAgICBpZiAobmFtZSA9PSBuZXh0Um91bmQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFtbW87XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfSkgfHwgKHsgbmFtZTogJ0VtcHR5JyB9IGFzIERuZEl0ZW01ZSlcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBkcnlmaXJlV2VhcG9uKCkge1xuICAgICAgICBjb25zdCBjaGFyYWN0ZXIgPSB0aGlzLmNoYXJhY3RlcjtcbiAgICAgICAgY29uc3Qgd2VhcG9uID0gdGhpcy53ZWFwb247XG5cbiAgICAgICAgY29uc3QgcmVuZGVySG9va0lkID0gSG9va3Mub24oXG4gICAgICAgICAgICAncmVuZGVyQ2hhdE1lc3NhZ2UnLFxuICAgICAgICAgICAgKF9jaGF0SXRlbSwgaHRtbCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlbG9hZEJ0biA9IGh0bWxbMF0ucXVlcnlTZWxlY3RvcignLnJlbG9hZC1hbW1vJyk7XG4gICAgICAgICAgICAgICAgcmVsb2FkQnRuPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWxvYWQoY2hhcmFjdGVyLCB3ZWFwb24pO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgaWYgKHJlbG9hZEJ0bikge1xuICAgICAgICAgICAgICAgICAgICBIb29rcy5vZmYoJ3JlbmRlckNoYXRNZXNzYWdlJywgcmVuZGVySG9va0lkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG5cbiAgICAgICAgY29uc3QgdGVtcGxhdGVEYXRhOiBBY3Rpdml0eUNhcmRDaGF0VHlwZSA9IHtcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiB7XG4gICAgICAgICAgICAgICAgY2hhdDogYDxwPiR7dGhpcy50cmFuc2xhdGUoXG4gICAgICAgICAgICAgICAgICAgICdXRUFQT05fUkVMT0FELkZlYXR1cmVzLlJlbG9hZGFibGVXZWFwb25BdHRhY2suRHJ5RmlyZURlc2NyaXB0aW9uJyxcbiAgICAgICAgICAgICAgICAgICAgeyBuYW1lOiBjaGFyYWN0ZXIubmFtZSwgcmVsb2FkYWJsZVdlYXBvbjogd2VhcG9uLm5hbWUgfSxcbiAgICAgICAgICAgICAgICAgICAgdHJ1ZVxuICAgICAgICAgICAgICAgICl9PC9wPmAsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgaXRlbToge1xuICAgICAgICAgICAgICAgIGltZzogd2VhcG9uLmltZyxcbiAgICAgICAgICAgICAgICBuYW1lOiB0aGlzLnRyYW5zbGF0ZShcbiAgICAgICAgICAgICAgICAgICAgJ1dFQVBPTl9SRUxPQUQuRmVhdHVyZXMuUmVsb2FkYWJsZVdlYXBvbkF0dGFjay5EcnlGaXJlVGl0bGUnXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzdWJ0aXRsZTogd2VhcG9uLm5hbWUsXG4gICAgICAgICAgICBidXR0b25zOiBbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBkYXRhc2V0OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2aXNpYmlsaXR5OiAnYWxsJyxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgaWNvbjogdGhpcy5tYWtlSWNvbignZmEtcm90YXRlLXJpZ2h0JyksXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiB0aGlzLnRyYW5zbGF0ZSgnV0VBUE9OX1JFTE9BRC5GZWF0dXJlcy5SZWxvYWQuVGV4dCcpLFxuICAgICAgICAgICAgICAgICAgICBjbGFzc2VzOiAncmVsb2FkLWFtbW8nLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBdLFxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMucmVuZGVyQ2FyZCh0ZW1wbGF0ZURhdGEsIGNoYXJhY3Rlcik7XG4gICAgfVxuXG4gICAgYXN5bmMgcmVuZGVyQ2FyZCh0ZW1wbGF0ZURhdGEsIGNoYXJhY3Rlcikge1xuICAgICAgICBjb25zdCBodG1sVGVtcGxhdGUgPSBhd2FpdCAoXG4gICAgICAgICAgICBmb3VuZHJ5LmFwcGxpY2F0aW9ucyBhcyBhbnlcbiAgICAgICAgKS5oYW5kbGViYXJzLnJlbmRlclRlbXBsYXRlKFxuICAgICAgICAgICAgJ21vZHVsZXMvZnZ0dC13ZWFwb24tcmVsb2FkL3RlbXBsYXRlcy9hY3Rpdml0eS1jYXJkLmhicycsXG4gICAgICAgICAgICB0ZW1wbGF0ZURhdGFcbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy5tb2R1bGVNYW5hZ2VyLnVpTWFuYWdlci5zZW5kQ2hhdChjaGFyYWN0ZXIsIGh0bWxUZW1wbGF0ZSk7XG4gICAgfVxuXG4gICAgZmlyZVJvdW5kKGJ1bGxldDogRG5kSXRlbTVlKSB7XG4gICAgICAgIGNvbnN0IHJlbG9hZGFibGVXZWFwb24gPSB0aGlzLndlYXBvbjtcbiAgICAgICAgY29uc3QgbWF4U2hvdHMgPSBwYXJzZUludChyZWxvYWRhYmxlV2VhcG9uLnN5c3RlbS51c2VzLm1heCk7XG4gICAgICAgIGNvbnN0IGZpcmVkTG9hZG91dCA9XG4gICAgICAgICAgICAocmVsb2FkYWJsZVdlYXBvbi5nZXRGbGFnKFxuICAgICAgICAgICAgICAgIHRoaXMubW9kdWxlTWFuYWdlci5pZCxcbiAgICAgICAgICAgICAgICAnZmlyZWQnXG4gICAgICAgICAgICApIGFzIHN0cmluZ1tdKSB8fCBuZXcgQXJyYXkobWF4U2hvdHMpLmZpbGwoJ0VtcHR5Jyk7XG5cbiAgICAgICAgZmlyZWRMb2Fkb3V0LnVuc2hpZnQoYnVsbGV0Lm5hbWUpO1xuICAgICAgICBmaXJlZExvYWRvdXQuc3BsaWNlKC0xKTtcbiAgICAgICAgcmVsb2FkYWJsZVdlYXBvbi5zZXRGbGFnKHRoaXMubW9kdWxlTWFuYWdlci5pZCwgJ2ZpcmVkJywgZmlyZWRMb2Fkb3V0KTtcblxuICAgICAgICBjb25zdCB1c2VzID0gcmVsb2FkYWJsZVdlYXBvbi5zeXN0ZW0udXNlcztcbiAgICAgICAgY29uc3QgcXR5OiBudW1iZXIgPVxuICAgICAgICAgICAgdXNlcy5zcGVudCArIDEgPD0gcGFyc2VJbnQodXNlcy5tYXgpXG4gICAgICAgICAgICAgICAgPyB1c2VzLnNwZW50ICsgMVxuICAgICAgICAgICAgICAgIDogcGFyc2VJbnQodXNlcy5tYXgpO1xuXG4gICAgICAgIHJlbG9hZGFibGVXZWFwb24udXBkYXRlKHtcbiAgICAgICAgICAgICdzeXN0ZW0udXNlcy5zcGVudCc6IHF0eSxcbiAgICAgICAgICAgICdzeXN0ZW0udXNlcy52YWx1ZSc6IHBhcnNlSW50KHVzZXMubWF4KSAtIHF0eSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGJ1bGxldC51c2UoKTtcbiAgICB9XG5cbiAgICByZWxvYWQoYWN0b3I6IERuZEFjdG9yNWUsIHJlbG9hZGFibGVXZWFwb246IERuZEl0ZW01ZSkge1xuICAgICAgICB0aGlzLmZlYXR1cmVNYW5hZ2VyXG4gICAgICAgICAgICAuZ2V0RmVhdHVyZSgncmVsb2FkJylcbiAgICAgICAgICAgIC5vblJlbG9hZENhbGxiYWNrKGFjdG9yLCByZWxvYWRhYmxlV2VhcG9uKTtcbiAgICB9XG5cbiAgICBhc3luYyBvbkNsaWNrUmVmdW5kKCkge1xuICAgICAgICBjb25zdCBhY3RvciA9IHRoaXMuY2hhcmFjdGVyO1xuICAgICAgICBjb25zdCByZWxvYWRhYmxlV2VhcG9uID0gdGhpcy53ZWFwb247XG4gICAgICAgIGNvbnN0IGludmVudG9yeUFtbXVuaXRpb24gPSB0aGlzLmFtbXVuaXRpb24oYWN0b3IuaXRlbXMpO1xuXG4gICAgICAgIGNvbnN0IGZpcmVkID0gdGhpcy5maXJlZDtcbiAgICAgICAgY29uc3QgcmVmdW5kOiBzdHJpbmcgPSBmaXJlZC5zcGxpY2UoMCwgMSlbMF0gYXMgc3RyaW5nO1xuICAgICAgICBmaXJlZC5wdXNoKCdFbXB0eScpO1xuXG4gICAgICAgIGlmIChyZWZ1bmQgPT0gJ0VtcHR5Jykge1xuICAgICAgICAgICAgLy8gTm90aWZ5IHRoZSB1c2VyIHRoYXQgdGhlcmUgaXMgbm8gYW1tdW5pdGlvbiB0byByZWZ1bmRcbiAgICAgICAgICAgIHRoaXMubW9kdWxlTWFuYWdlci51aU1hbmFnZXIudWlOb3RpZmljYXRpb24oXG4gICAgICAgICAgICAgICAgdGhpcy50cmFuc2xhdGUoXG4gICAgICAgICAgICAgICAgICAgICdXRUFQT05fUkVMT0FELkZlYXR1cmVzLlJlbG9hZGFibGVXZWFwb25BdHRhY2suUmVmdW5kLlJlZnVuZE5vTW9yZU1zZycsXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGFjdG9yLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICByZWxvYWRhYmxlV2VhcG9uOiByZWxvYWRhYmxlV2VhcG9uLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHRydWVcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICd3YXJuJ1xuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGF3YWl0IHJlbG9hZGFibGVXZWFwb24uc2V0RmxhZyh0aGlzLm1vZHVsZU1hbmFnZXIuaWQsICdmaXJlZCcsIGZpcmVkKTtcblxuICAgICAgICBsZXQgYnVsbGV0ID0geyBuYW1lOiByZWZ1bmQgfSBhcyBEbmRJdGVtNWU7XG4gICAgICAgIGludmVudG9yeUFtbXVuaXRpb24uZm9yRWFjaCgoYW1tbzogSXRlbTVlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBuYW1lID0gYW1tby5uYW1lO1xuICAgICAgICAgICAgaWYgKG5hbWUgPT0gcmVmdW5kKSB7XG4gICAgICAgICAgICAgICAgYnVsbGV0ID0gYW1tbyBhcyBEbmRJdGVtNWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIFJlZnVuZCB0aGUgbm9uLUVtcHR5IGFtbXVuaXRpb25cbiAgICAgICAgY29uc3QgYW1tb0xvYWRvdXQgPSB0aGlzLmxvYWRvdXQ7XG4gICAgICAgIGFtbW9Mb2Fkb3V0LnVuc2hpZnQocmVmdW5kKTtcbiAgICAgICAgYW1tb0xvYWRvdXQuc3BsaWNlKC0xKTtcbiAgICAgICAgYXdhaXQgcmVsb2FkYWJsZVdlYXBvbi5zZXRGbGFnKFxuICAgICAgICAgICAgdGhpcy5tb2R1bGVNYW5hZ2VyLmlkLFxuICAgICAgICAgICAgJ2NoYW1iZXJlZCcsXG4gICAgICAgICAgICBhbW1vTG9hZG91dFxuICAgICAgICApO1xuXG4gICAgICAgIC8vIFVwZGF0ZSB0aGUgcmVsb2FkYWJsZVdlYXBvbiB1c2VzXG4gICAgICAgIGNvbnN0IHVzZXMgPSByZWxvYWRhYmxlV2VhcG9uLnN5c3RlbS51c2VzO1xuICAgICAgICBjb25zdCBxdHk6IG51bWJlciA9IHVzZXMuc3BlbnQgLSAxID49IDAgPyB1c2VzLnNwZW50IC0gMSA6IDA7XG4gICAgICAgIHJlbG9hZGFibGVXZWFwb24udXBkYXRlKHtcbiAgICAgICAgICAgICdzeXN0ZW0udXNlcy5zcGVudCc6IHF0eSxcbiAgICAgICAgICAgICdzeXN0ZW0udXNlcy52YWx1ZSc6IHBhcnNlSW50KHVzZXMubWF4KSAtIHF0eSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gTm90aWZ5IHRoZSB1c2VyIHRoYXQgdGhlIHJlZnVuZCB3YXMgYSBzdWNjZXNzXG4gICAgICAgIGNvbnN0IGh0bWxUZW1wbGF0ZSA9IGF3YWl0IChcbiAgICAgICAgICAgIGZvdW5kcnkuYXBwbGljYXRpb25zIGFzIGFueVxuICAgICAgICApLmhhbmRsZWJhcnMucmVuZGVyVGVtcGxhdGUoXG4gICAgICAgICAgICAnbW9kdWxlcy9mdnR0LXdlYXBvbi1yZWxvYWQvdGVtcGxhdGVzL2FtbW9SZWZ1bmROb3RpY2VUZW1wbGF0ZS5oYnMnLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGl0ZW06IHtcbiAgICAgICAgICAgICAgICAgICAgaW1nOiBidWxsZXQuaW1nLFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiBidWxsZXQubmFtZSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiB0aGlzLnRyYW5zbGF0ZShcbiAgICAgICAgICAgICAgICAgICAgJ1dFQVBPTl9SRUxPQUQuRmVhdHVyZXMuUmVsb2FkYWJsZVdlYXBvbkF0dGFjay5SZWZ1bmQuUmVmdW5kQ29tcGxldGVNc2cnLFxuICAgICAgICAgICAgICAgICAgICB7IGJ1bGxldDogcmVmdW5kLCBuYW1lOiByZWxvYWRhYmxlV2VhcG9uLm5hbWUgfSxcbiAgICAgICAgICAgICAgICAgICAgdHJ1ZVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgdGl0bGU6IHRoaXMudHJhbnNsYXRlKFxuICAgICAgICAgICAgICAgICAgICAnV0VBUE9OX1JFTE9BRC5GZWF0dXJlcy5SZWxvYWRhYmxlV2VhcG9uQXR0YWNrLlJlZnVuZC5SZWZ1bmRDb21wbGV0ZVRpdGxlJ1xuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgICAgIHRoaXMubW9kdWxlTWFuYWdlci51aU1hbmFnZXIuc2VuZENoYXQoYWN0b3IsIGh0bWxUZW1wbGF0ZSk7XG4gICAgfVxuXG4gICAgYXN5bmMgb25DbGlja01pc2ZpcmUoKSB7XG4gICAgICAgIGNvbnN0IGFjdG9yID0gdGhpcy5jaGFyYWN0ZXI7XG4gICAgICAgIGNvbnN0IHJvbGwgPSBhd2FpdCBuZXcgUm9sbCgnMWQ2Jykucm9sbCgpO1xuICAgICAgICBhd2FpdCByb2xsLnRvTWVzc2FnZSh7XG4gICAgICAgICAgICBzcGVha2VyOiB7XG4gICAgICAgICAgICAgICAgYWxpYXM6IGFjdG9yLm5hbWUsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBtYWtlSWNvbihpY29uOiBzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIGA8aSBjbGFzcz1cImZhcyAke2ljb259XCI+PC9pPmA7XG4gICAgfVxuXG4gICAgdG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiAnY2xhc3MgUmVsb2FkYWJsZVdlYXBvbkF0dGFja0ZlYXR1cmUnO1xuICAgIH1cbn1cbiIsImltcG9ydCBGZWF0dXJlTWFuYWdlciBmcm9tICcuLi9tYW5hZ2Vycy9GZWF0dXJlTWFuYWdlcic7XG5cbmltcG9ydCB7IERuZEl0ZW01ZSB9IGZyb20gJy4uL3R5cGVzL2RuZC50eXBlcyc7XG5pbXBvcnQgQmFzZUZlYXR1cmUgZnJvbSAnLi9CYXNlRmVhdHVyZSc7XG5cbmV4cG9ydCBjbGFzcyBSZWxvYWRhYmxlV2VhcG9uQ3JlYXRpb25GZWF0dXJlIGV4dGVuZHMgQmFzZUZlYXR1cmUge1xuICAgIHByaXZhdGUgX2NyZWF0aW5nUmVsb2FkYWJsZVdlYXBvbjogYm9vbGVhbjtcbiAgICBwcml2YXRlIF9jcmVhdGVJdGVtSG9va0lkOiBudW1iZXI7XG5cbiAgICBjb25zdHJ1Y3RvcihmZWF0dXJlTWFuYWdlcjogRmVhdHVyZU1hbmFnZXIpIHtcbiAgICAgICAgc3VwZXIoZmVhdHVyZU1hbmFnZXIpO1xuICAgICAgICB0aGlzLl9jcmVhdGluZ1JlbG9hZGFibGVXZWFwb24gPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fY3JlYXRlSXRlbUhvb2tJZCA9IC0xO1xuICAgIH1cblxuICAgIGluaXQoKSB7XG4gICAgICAgIEhvb2tzLm9uKCdwcmVDcmVhdGVJdGVtJywgdGhpcy5vblByZUNyZWF0ZUl0ZW0uYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgYXN5bmMgb25QcmVDcmVhdGVJdGVtKGl0ZW06IERuZEl0ZW01ZSkge1xuICAgICAgICBpZiAoaXRlbS5zeXN0ZW0udHlwZS5iYXNlSXRlbSA9PSAncmVsb2FkYWJsZVdlYXBvbicpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdXZWFwb24gUmVsb2FkIHwgVHJpZ2dlcmVkIFByZS1DcmVhdGlvbicpO1xuXG4gICAgICAgICAgICB0aGlzLndlYXBvbklkID0gaXRlbS5pZDtcbiAgICAgICAgICAgIHRoaXMuY2hhcmFjdGVySWQgPSBpdGVtLmFjdG9yPy5pZCBhcyBzdHJpbmc7XG4gICAgICAgICAgICB0aGlzLl9jcmVhdGluZ1JlbG9hZGFibGVXZWFwb24gPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5fY3JlYXRlSXRlbUhvb2tJZCA9IEhvb2tzLm9uKFxuICAgICAgICAgICAgICAgICdjcmVhdGVJdGVtJyxcbiAgICAgICAgICAgICAgICB0aGlzLm9uQ3JlYXRlSXRlbS5iaW5kKHRoaXMpXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgYXN5bmMgb25DcmVhdGVJdGVtKGl0ZW06IERuZEl0ZW01ZSkge1xuICAgICAgICBpZiAoIXRoaXMuX2NyZWF0aW5nUmVsb2FkYWJsZVdlYXBvbiB8fCBpdGVtLmlkICE9PSB0aGlzLndlYXBvbklkKVxuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKCdXZWFwb24gUmVsb2FkIHwgVHJpZ2dlcmVkIFJlbG9hZGFibGVXZWFwb24gQ3JlYXRpb24nKTtcblxuICAgICAgICBjb25zdCByZWxvYWRhYmxlV2VhcG9uID0gdGhpcy53ZWFwb247XG4gICAgICAgIGNvbnN0IGFtbW9RdHkgPSBwYXJzZUludChyZWxvYWRhYmxlV2VhcG9uLnN5c3RlbS51c2VzLm1heCk7XG5cbiAgICAgICAgYXdhaXQgcmVsb2FkYWJsZVdlYXBvbi51cGRhdGUoe1xuICAgICAgICAgICAgJ3N5c3RlbS51c2VzLnNwZW50JzogYW1tb1F0eSxcbiAgICAgICAgICAgICdzeXN0ZW0udXNlcy52YWx1ZSc6IDAsXG4gICAgICAgIH0pO1xuICAgICAgICBhd2FpdCByZWxvYWRhYmxlV2VhcG9uLnNldEZsYWcoXG4gICAgICAgICAgICB0aGlzLm1vZHVsZU1hbmFnZXIuaWQsXG4gICAgICAgICAgICAnY2hhbWJlcmVkJyxcbiAgICAgICAgICAgIG5ldyBBcnJheShhbW1vUXR5KS5maWxsKCdFbXB0eScpXG4gICAgICAgICk7XG4gICAgICAgIGF3YWl0IHJlbG9hZGFibGVXZWFwb24uc2V0RmxhZyhcbiAgICAgICAgICAgIHRoaXMubW9kdWxlTWFuYWdlci5pZCxcbiAgICAgICAgICAgICdmaXJlZCcsXG4gICAgICAgICAgICBuZXcgQXJyYXkoYW1tb1F0eSkuZmlsbCgnRW1wdHknKVxuICAgICAgICApO1xuXG4gICAgICAgIHRoaXMud2VhcG9uSWQgPSAnJztcbiAgICAgICAgdGhpcy5jaGFyYWN0ZXJJZCA9ICcnO1xuICAgICAgICB0aGlzLl9jcmVhdGluZ1JlbG9hZGFibGVXZWFwb24gPSBmYWxzZTtcbiAgICAgICAgSG9va3Mub2ZmKCdjcmVhdGVJdGVtJywgdGhpcy5fY3JlYXRlSXRlbUhvb2tJZCk7XG4gICAgICAgIHRoaXMuX2NyZWF0ZUl0ZW1Ib29rSWQgPSAtMTtcbiAgICB9XG5cbiAgICB0b1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuICdjbGFzcyBSZWxvYWRhYmxlV2VhcG9uQ3JlYXRpb25GZWF0dXJlJztcbiAgICB9XG59XG4iLCJleHBvcnQgeyBSZWxvYWRhYmxlV2VhcG9uQXR0YWNrRmVhdHVyZSB9IGZyb20gJy4vUmVsb2FkYWJsZVdlYXBvbkF0dGFja0ZlYXR1cmUnO1xuZXhwb3J0IHsgUmVsb2FkYWJsZVdlYXBvbkNyZWF0aW9uRmVhdHVyZSB9IGZyb20gJy4vUmVsb2FkYWJsZVdlYXBvbkNyZWF0aW9uRmVhdHVyZSc7XG5leHBvcnQgeyBSZWxvYWRGZWF0dXJlIH0gZnJvbSAnLi9SZWxvYWRGZWF0dXJlJztcbiIsImltcG9ydCBNb2R1bGVNYW5hZ2VyIGZyb20gJy4vTW9kdWxlTWFuYWdlcic7XG5pbXBvcnQge1xuICAgIFJlbG9hZGFibGVXZWFwb25BdHRhY2tGZWF0dXJlLFxuICAgIFJlbG9hZGFibGVXZWFwb25DcmVhdGlvbkZlYXR1cmUsXG4gICAgUmVsb2FkRmVhdHVyZSxcbn0gZnJvbSAnLi4vZmVhdHVyZXMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBGZWF0dXJlTWFuYWdlciB7XG4gICAgcHJpdmF0ZSBfbW9kdWxlTWFuYWdlcjogTW9kdWxlTWFuYWdlcjtcbiAgICBwcml2YXRlIF9mZWF0dXJlczogeyBba2V5OiBzdHJpbmddOiBhbnkgfTtcblxuICAgIGNvbnN0cnVjdG9yKG1vZHVsZU1hbmFnZXI6IE1vZHVsZU1hbmFnZXIpIHtcbiAgICAgICAgdGhpcy5fbW9kdWxlTWFuYWdlciA9IG1vZHVsZU1hbmFnZXI7XG4gICAgICAgIHRoaXMuX2ZlYXR1cmVzID0ge307XG4gICAgfVxuXG4gICAgaW5pdCgpIHtcbiAgICAgICAgdGhpcy5fZmVhdHVyZXMgPSB7XG4gICAgICAgICAgICByZWxvYWQ6IG5ldyBSZWxvYWRGZWF0dXJlKHRoaXMpLFxuICAgICAgICAgICAgcmVsb2FkYWJsZVdlYXBvbkF0dGFjazogbmV3IFJlbG9hZGFibGVXZWFwb25BdHRhY2tGZWF0dXJlKHRoaXMpLFxuICAgICAgICAgICAgcmVsb2FkYWJsZVdlYXBvbkNyZWF0aW9uOiBuZXcgUmVsb2FkYWJsZVdlYXBvbkNyZWF0aW9uRmVhdHVyZSh0aGlzKSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBnZXRGZWF0dXJlKGlkOiBzdHJpbmcpIHtcbiAgICAgICAgaWYgKHRoaXMuX2ZlYXR1cmVzW2lkXSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2ZlYXR1cmVzW2lkXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBnZXQgbW9kdWxlTWFuYWdlcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX21vZHVsZU1hbmFnZXI7XG4gICAgfVxuXG4gICAgdG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiBgY2xhc3MgRmVhdHVyZU1hbmFnZXI6ICR7dGhpcy5fZmVhdHVyZXMubGVuZ3RofWA7XG4gICAgfVxufVxuIiwiaW1wb3J0IEZlYXR1cmVNYW5hZ2VyIGZyb20gJy4vRmVhdHVyZU1hbmFnZXInO1xuaW1wb3J0IFVpTWFuYWdlciBmcm9tICcuL1VpTWFuYWdlcic7XG5pbXBvcnQgVGVtcGxhdGVNYW5hZ2VyIGZyb20gJy4vVGVtcGxhdGVNYW5hZ2VyJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTW9kdWxlTWFuYWdlciB7XG4gICAgcHJpdmF0ZSBfbW9kdWxlSWQ6IHN0cmluZztcbiAgICBwcml2YXRlIF9mZWF0dXJlTWFuYWdlcjogRmVhdHVyZU1hbmFnZXI7XG4gICAgcHJpdmF0ZSBfdWlNYW5hZ2VyOiBVaU1hbmFnZXI7XG4gICAgcHJpdmF0ZSBfdGVtcGxhdGVNYW5hZ2VyOiBUZW1wbGF0ZU1hbmFnZXI7XG5cbiAgICBjb25zdHJ1Y3RvcihpZDogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuX21vZHVsZUlkID0gaWQ7XG4gICAgICAgIHRoaXMuX2ZlYXR1cmVNYW5hZ2VyID0gbmV3IEZlYXR1cmVNYW5hZ2VyKHRoaXMpO1xuICAgICAgICB0aGlzLl91aU1hbmFnZXIgPSBuZXcgVWlNYW5hZ2VyKHRoaXMpO1xuICAgICAgICB0aGlzLl90ZW1wbGF0ZU1hbmFnZXIgPSBuZXcgVGVtcGxhdGVNYW5hZ2VyKCk7XG4gICAgfVxuXG4gICAgZ2V0IGlkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fbW9kdWxlSWQ7XG4gICAgfVxuXG4gICAgZ2V0IGZlYXR1cmVNYW5hZ2VyKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZmVhdHVyZU1hbmFnZXI7XG4gICAgfVxuXG4gICAgZ2V0IHVpTWFuYWdlcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3VpTWFuYWdlcjtcbiAgICB9XG5cbiAgICBnZXQgdGVtcGxhdGVNYW5hZ2VyKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fdGVtcGxhdGVNYW5hZ2VyO1xuICAgIH1cblxuICAgIGluaXQoKSB7XG4gICAgICAgIHRoaXMuc3lzdGVtT3ZlcnJpZGVzKCk7XG4gICAgICAgIHRoaXMubW9kdWxlQ29uZmlndXJhdGlvbnMoKTtcbiAgICAgICAgdGhpcy5fZmVhdHVyZU1hbmFnZXIuaW5pdCgpO1xuICAgICAgICB0aGlzLl91aU1hbmFnZXIuaW5pdCgpO1xuICAgICAgICB0aGlzLl90ZW1wbGF0ZU1hbmFnZXIuaW5pdCgpO1xuICAgIH1cblxuICAgIHN5c3RlbU92ZXJyaWRlcygpIHtcbiAgICAgICAgKENPTkZJRyBhcyBhbnkpLkRORDVFLmZlYXR1cmVUeXBlcy5pdGVtID0ge1xuICAgICAgICAgICAgbGFiZWw6IHRoaXMudWlNYW5hZ2VyLmdldExvY2FsaXplZFR4dCgnV0VBUE9OX1JFTE9BRC5JdGVtRmVhdHVyZScpLFxuICAgICAgICB9O1xuXG4gICAgICAgIChDT05GSUcgYXMgYW55KS5ETkQ1RS5pdGVtUHJvcGVydGllcy5jb25jZWFsYWJsZSA9IHtcbiAgICAgICAgICAgIGxhYmVsOiB0aGlzLnVpTWFuYWdlci5nZXRMb2NhbGl6ZWRUeHQoJ1dFQVBPTl9SRUxPQUQuQ29uY2VhbGFibGUnKSxcbiAgICAgICAgfTtcbiAgICAgICAgKENPTkZJRyBhcyBhbnkpLkRORDVFLnZhbGlkUHJvcGVydGllcy53ZWFwb24uYWRkKCdjb25jZWFsYWJsZScpO1xuXG4gICAgICAgIChDT05GSUcgYXMgYW55KS5ETkQ1RS5pdGVtUHJvcGVydGllcy51bnN0YWJsZSA9IHtcbiAgICAgICAgICAgIGxhYmVsOiB0aGlzLnVpTWFuYWdlci5nZXRMb2NhbGl6ZWRUeHQoJ1dFQVBPTl9SRUxPQUQuVW5zdGFibGUnKSxcbiAgICAgICAgICAgIGlzUGh5c2ljYWw6IHRydWUsXG4gICAgICAgIH07XG5cbiAgICAgICAgKENPTkZJRyBhcyBhbnkpLkRORDVFLndlYXBvbklkcy5yZWxvYWRhYmxlV2VhcG9uID1cbiAgICAgICAgICAgICdDb21wZW5kaXVtLmZ2dHQtd2VhcG9uLXJlbG9hZC5pdGVtLXBhY2suSXRlbS5sRTYwUWFTMXNjdGIzT0FkJztcbiAgICB9XG5cbiAgICBtb2R1bGVDb25maWd1cmF0aW9ucygpIHtcbiAgICAgICAgY29uc3QgbW9kdWxlTmFtZSA9ICdmdnR0LXdlYXBvbi1yZWxvYWQnO1xuXG4gICAgICAgIGdhbWUuc2V0dGluZ3MucmVnaXN0ZXIobW9kdWxlTmFtZSwgJ3Vuc3RhYmxlQW1tbycsIHtcbiAgICAgICAgICAgIHNjb3BlOiAnd29ybGQnLFxuICAgICAgICAgICAgbmFtZTogJ1NFVFRJTkdTLldFQVBPTl9SRUxPQUQuVW5zdGFibGVBbW1vLk5hbWUnLFxuICAgICAgICAgICAgaGludDogJ1NFVFRJTkdTLldFQVBPTl9SRUxPQUQuVW5zdGFibGVBbW1vLkhpbnQnLFxuICAgICAgICAgICAgdHlwZTogQm9vbGVhbixcbiAgICAgICAgICAgIGNvbmZpZzogdHJ1ZSxcbiAgICAgICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGdhbWUuc2V0dGluZ3MucmVnaXN0ZXIobW9kdWxlTmFtZSwgJ3Vuc3RhYmxlQW1tb0ZhaWx1cmVUaHJlc2hob2xkJywge1xuICAgICAgICAgICAgc2NvcGU6ICd3b3JsZCcsXG4gICAgICAgICAgICBuYW1lOiAnU0VUVElOR1MuV0VBUE9OX1JFTE9BRC5VbnN0YWJsZUFtbW9GYWlsdXJlVGhyZXNob2xkLk5hbWUnLFxuICAgICAgICAgICAgaGludDogJ1NFVFRJTkdTLldFQVBPTl9SRUxPQUQuVW5zdGFibGVBbW1vRmFpbHVyZVRocmVzaG9sZC5IaW50JyxcbiAgICAgICAgICAgIHR5cGU6IE51bWJlcixcbiAgICAgICAgICAgIGNvbmZpZzogdHJ1ZSxcbiAgICAgICAgICAgIGRlZmF1bHQ6IDIsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGdhbWUuc2V0dGluZ3MucmVnaXN0ZXIobW9kdWxlTmFtZSwgJ3VzZU1pc2ZpcmVzJywge1xuICAgICAgICAgICAgc2NvcGU6ICd3b3JsZCcsXG4gICAgICAgICAgICBuYW1lOiAnU0VUVElOR1MuV0VBUE9OX1JFTE9BRC5Vc2VNaXNmaXJlcy5OYW1lJyxcbiAgICAgICAgICAgIGhpbnQ6ICdTRVRUSU5HUy5XRUFQT05fUkVMT0FELlVzZU1pc2ZpcmVzLkhpbnQnLFxuICAgICAgICAgICAgdHlwZTogQm9vbGVhbixcbiAgICAgICAgICAgIGNvbmZpZzogdHJ1ZSxcbiAgICAgICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGdhbWUuc2V0dGluZ3MucmVnaXN0ZXIobW9kdWxlTmFtZSwgJ2ZpbHRlckFtbXVuaXRpb25CeUVxdWlwcGVkJywge1xuICAgICAgICAgICAgc2NvcGU6ICd1c2VyJyxcbiAgICAgICAgICAgIG5hbWU6ICdTRVRUSU5HUy5XRUFQT05fUkVMT0FELkZpbHRlckFtbXVuaXRpb25CeUVxdWlwcGVkLk5hbWUnLFxuICAgICAgICAgICAgaGludDogJ1NFVFRJTkdTLldFQVBPTl9SRUxPQUQuRmlsdGVyQW1tdW5pdGlvbkJ5RXF1aXBwZWQuSGludCcsXG4gICAgICAgICAgICB0eXBlOiBCb29sZWFuLFxuICAgICAgICAgICAgY29uZmlnOiB0cnVlLFxuICAgICAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGRlYnVnKGhvb2tzOiBib29sZWFuID0gZmFsc2UpIHtcbiAgICAgICAgQ09ORklHLmRlYnVnLmhvb2tzID0gaG9va3M7XG4gICAgICAgIGNvbnNvbGUubG9nKCdDT05GSUc6ICcsIENPTkZJRyk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdDT05GSUcuRE5ENUU6ICcsIChDT05GSUcgYXMgYW55KS5ETkQ1RSk7XG4gICAgfVxuXG4gICAgdG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiAnY2xhc3MgTW9kdWxlTWFuYWdlcic7XG4gICAgfVxufVxuIiwiZXhwb3J0IGRlZmF1bHQgY2xhc3MgVGVtcGxhdGVNYW5hZ2VyIHtcbiAgICBjb25zdHJ1Y3RvcigpIHt9XG5cbiAgICBpbml0KCkge1xuICAgICAgICAoZm91bmRyeS5hcHBsaWNhdGlvbnMgYXMgYW55KS5oYW5kbGViYXJzLmxvYWRUZW1wbGF0ZXMoXG4gICAgICAgICAgICBUZW1wbGF0ZU1hbmFnZXIucGF0aHNcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgZ2V0IHBhdGhzKCkge1xuICAgICAgICBjb25zdCBwYXRocyA9IHt9O1xuICAgICAgICBjb25zdCB0ZW1wbGF0ZVBhdGhzID0gJ21vZHVsZXMvZnZ0dC13ZWFwb24tcmVsb2FkL3RlbXBsYXRlcy9yZWxvYWRhYmxlV2VhcG9uUmVsb2FkVGVtcGxhdGUuaGJzLG1vZHVsZXMvZnZ0dC13ZWFwb24tcmVsb2FkL3RlbXBsYXRlcy9iYXNpY01lc3NhZ2UuaGJzLG1vZHVsZXMvZnZ0dC13ZWFwb24tcmVsb2FkL3RlbXBsYXRlcy9hbW1vU2VsZWN0aW9uRGlhbG9nVGVtcGxhdGUuaGJzLG1vZHVsZXMvZnZ0dC13ZWFwb24tcmVsb2FkL3RlbXBsYXRlcy9hbW1vUmVmdW5kTm90aWNlVGVtcGxhdGUuaGJzLG1vZHVsZXMvZnZ0dC13ZWFwb24tcmVsb2FkL3RlbXBsYXRlcy9hY3Rpdml0eS1jYXJkLmhicycuc3BsaXQoJywnKTtcbiAgICAgICAgZm9yIChjb25zdCBwYXRoIG9mIHRlbXBsYXRlUGF0aHMpIHtcbiAgICAgICAgICAgIHBhdGhzW3BhdGgucmVwbGFjZSgnLmhicycsICcuaHRtbCcpXSA9IHBhdGg7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHBhdGhzO1xuICAgIH1cblxuICAgIHN0YXRpYyBvbkhvdFJlbG9hZCgpIHtcbiAgICAgICAgZm9yIChjb25zdCB0ZW1wbGF0ZSBpbiBfdGVtcGxhdGVDYWNoZSkge1xuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChfdGVtcGxhdGVDYWNoZSwgdGVtcGxhdGUpXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICBkZWxldGUgX3RlbXBsYXRlQ2FjaGVbdGVtcGxhdGVdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgKGZvdW5kcnkuYXBwbGljYXRpb25zIGFzIGFueSkuaGFuZGxlYmFyc1xuICAgICAgICAgICAgLmxvYWRUZW1wbGF0ZXModGhpcy5wYXRocylcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGFwcGxpY2F0aW9uIGluIHVpLndpbmRvd3MpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVpLndpbmRvd3MsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwbGljYXRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1aS53aW5kb3dzW2FwcGxpY2F0aW9uXS5yZW5kZXIodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbiAgICB0b1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuICdjbGFzcyBUZW1wbGF0ZU1hbmFnZXInO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IERuZEFjdG9yNWUgfSBmcm9tICcuLi90eXBlcy9kbmQudHlwZXMnO1xuaW1wb3J0IE1vZHVsZU1hbmFnZXIgZnJvbSAnLi9Nb2R1bGVNYW5hZ2VyJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVWlNYW5hZ2VyIHtcbiAgICBwcml2YXRlIF9tb2R1bGVNYW5hZ2VyOiBNb2R1bGVNYW5hZ2VyO1xuXG4gICAgY29uc3RydWN0b3IobW9kdWxlTWFuYWdlcjogTW9kdWxlTWFuYWdlcikge1xuICAgICAgICB0aGlzLl9tb2R1bGVNYW5hZ2VyID0gbW9kdWxlTWFuYWdlcjtcbiAgICB9XG5cbiAgICBpbml0KCkge1xuICAgICAgICAvLyBFTVBUWSBGT1IgTk9XXG4gICAgfVxuXG4gICAgZ2V0IG1vZHVsZU1hbmFnZXIoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9tb2R1bGVNYW5hZ2VyO1xuICAgIH1cblxuICAgIGJ1aWxkRGlhbG9nKG9wdGlvbnMsIGlkKSB7XG4gICAgICAgIHJldHVybiBuZXcgZm91bmRyeS5hcHBsaWNhdGlvbnMuYXBpLkRpYWxvZ1YyKHtcbiAgICAgICAgICAgIHdpbmRvdzoge1xuICAgICAgICAgICAgICAgIHRpdGxlOiBvcHRpb25zLnRpdGxlLFxuICAgICAgICAgICAgICAgIGNvbnRlbnRDbGFzc2VzOiBvcHRpb25zLmNvbnRlbnRDbGFzc2VzIHx8IFtdLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNvbnRlbnQ6IG9wdGlvbnMuY29udGVudCxcbiAgICAgICAgICAgIGJ1dHRvbnM6IG9wdGlvbnMuYnV0dG9ucyxcbiAgICAgICAgICAgIHN1Ym1pdDogb3B0aW9ucy5vblN1Ym1pdCxcbiAgICAgICAgICAgIGlkOiBpZCxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgdWlOb3RpZmljYXRpb24obXNnOiBzdHJpbmcsIHR5cGU6IHN0cmluZyA9ICdpbmZvJykge1xuICAgICAgICBpZiAodWkubm90aWZpY2F0aW9ucykge1xuICAgICAgICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnZXJyb3InOlxuICAgICAgICAgICAgICAgICAgICB1aS5ub3RpZmljYXRpb25zLmVycm9yKG1zZyk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ3dhcm4nOlxuICAgICAgICAgICAgICAgICAgICB1aS5ub3RpZmljYXRpb25zLndhcm4obXNnKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnaW5mbyc6XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgdWkubm90aWZpY2F0aW9ucy5pbmZvKG1zZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzZW5kQ2hhdChcbiAgICAgICAgc3BlYWtlcjogRG5kQWN0b3I1ZSxcbiAgICAgICAgY29udGVudDogc3RyaW5nLFxuICAgICAgICBmbGF2b3I/OiBzdHJpbmcsXG4gICAgICAgIHNvdW5kPzogc3RyaW5nLFxuICAgICAgICB0eXBlOiAwIHwgMSB8IDIgfCAzIHwgNCB8IDUgPSBDT05TVC5DSEFUX01FU1NBR0VfVFlQRVMuT09DXG4gICAgKSB7XG4gICAgICAgIGNvbnN0IENoYXREYXRhID0ge1xuICAgICAgICAgICAgc3BlYWtlcjogQ2hhdE1lc3NhZ2UuZ2V0U3BlYWtlcih7IGFjdG9yOiBzcGVha2VyIH0pLFxuICAgICAgICAgICAgdHlwZSxcbiAgICAgICAgICAgIGZsYXZvcixcbiAgICAgICAgICAgIHNvdW5kLFxuICAgICAgICAgICAgY29udGVudCxcbiAgICAgICAgfTtcbiAgICAgICAgQ2hhdE1lc3NhZ2UuY3JlYXRlKENoYXREYXRhKTtcbiAgICB9XG5cbiAgICBnZXRMb2NhbGl6ZWRUeHQoXG4gICAgICAgIGtleTogc3RyaW5nLFxuICAgICAgICBvcHRzPzogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfSxcbiAgICAgICAgZm9ybWF0OiBib29sZWFuID0gZmFsc2VcbiAgICApIHtcbiAgICAgICAgaWYgKGZvcm1hdCkge1xuICAgICAgICAgICAgcmV0dXJuIChnYW1lIGFzIGFueSkuaTE4bi5mb3JtYXQoa2V5LCBvcHRzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gKGdhbWUgYXMgYW55KS5pMThuLmxvY2FsaXplKGtleSwgb3B0cyk7XG4gICAgfVxuXG4gICAgdG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiAnY2xhc3MgVWlNYW5hZ2VyJztcbiAgICB9XG59XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7IiwiaW1wb3J0IE1vZHVsZU1hbmFnZXIgZnJvbSAnLi9tb2R1bGUvbWFuYWdlcnMvTW9kdWxlTWFuYWdlcic7XG5pbXBvcnQgVGVtcGxhdGVNYW5hZ2VyIGZyb20gJy4vbW9kdWxlL21hbmFnZXJzL1RlbXBsYXRlTWFuYWdlcic7XG5cbmltcG9ydCBtb2R1bGVKc29uIGZyb20gJy4uL21vZHVsZS5qc29uJztcblxuSG9va3Mub25jZSgnaW5pdCcsIGFzeW5jICgpID0+IHtcbiAgICBjb25zb2xlLmxvZygnRWJlcnJvbiBXZXN0IHwgRm91bmRyeSBWVFQgTW9kdWxlJyk7XG5cbiAgICBjb25zdCB3ZWFwb25fcmVsb2FkID0gbmV3IE1vZHVsZU1hbmFnZXIobW9kdWxlSnNvbi5pZCk7XG4gICAgLy8gd2VhcG9uX3JlbG9hZC5kZWJ1Zyh0cnVlKTtcbiAgICB3ZWFwb25fcmVsb2FkLmluaXQoKTtcbn0pO1xuXG5pZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdkZXZlbG9wbWVudCcpIHtcbiAgICBpZiAobW9kdWxlLmhvdCkge1xuICAgICAgICBtb2R1bGUuaG90LmFjY2VwdCgpO1xuXG4gICAgICAgIGlmIChtb2R1bGUuaG90LnN0YXR1cygpID09PSAnYXBwbHknKSB7XG4gICAgICAgICAgICBUZW1wbGF0ZU1hbmFnZXIub25Ib3RSZWxvYWQoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsImV4cG9ydCBkZWZhdWx0IF9fd2VicGFja19wdWJsaWNfcGF0aF9fICsgXCJzdHlsZXMvbW9kdWxlLmNzc1wiOyJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==