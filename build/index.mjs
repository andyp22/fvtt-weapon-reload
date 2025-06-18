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

/***/ "./src/module/features/NextRoundFeature.ts":
/*!*************************************************!*\
  !*** ./src/module/features/NextRoundFeature.ts ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   NextRoundFeature: () => (/* binding */ NextRoundFeature)
/* harmony export */ });
/* harmony import */ var _BaseFeature__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./BaseFeature */ "./src/module/features/BaseFeature.ts");

class NextRoundFeature extends _BaseFeature__WEBPACK_IMPORTED_MODULE_0__["default"] {
    constructor(featureManager) {
        super(featureManager);
    }
    init() {
        Hooks.on('dnd5e.preUseActivity', this.onUseActivity.bind(this));
    }
    onUseActivity(activity) {
        if (activity.type === 'utility' && activity.name == 'Next Round') {
            console.log('Weapon Reload | Triggered Next Round');
            this.characterId = activity.actor.id;
            this.weaponId = activity.item.id;
            this.nextRound();
            return false;
        }
        return true;
    }
    async nextRound() {
        const nextRound = this.loadout[0];
        const actor = this.character;
        const htmlTemplate = await foundry.applications.handlebars.renderTemplate('modules/fvtt-weapon-reload/templates/ammoRefundNoticeTemplate.hbs', {
            item: {
                img: 'modules/fvtt-weapon-reload/assets/icons/bullets_bw_icon.png',
                name: nextRound,
            },
            description: this.translate('WEAPON_RELOAD.Features.NextRound.Description', { bullet: nextRound, weapon: this.weapon.name }, true),
            title: this.translate('WEAPON_RELOAD.Features.NextRound.Title'),
        });
        this.moduleManager.uiManager.sendChat(actor, htmlTemplate, undefined, undefined, [actor.id], CONST.CHAT_MESSAGE_TYPES.WHISPER);
    }
    toString() {
        return 'class NextRoundFeature';
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
        Hooks.on('dnd5e.preUseActivity', this.onUseActivity.bind(this));
    }
    onUseActivity(activity) {
        if (activity.type === 'utility' && activity.name == 'Reload') {
            console.log('Weapon Reload | Triggered Reload');
            this.characterId = activity.actor.id;
            this.weaponId = activity.item.id;
            this.weaponReload();
            return false;
        }
        return true;
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
/* harmony export */   NextRoundFeature: () => (/* reexport safe */ _NextRoundFeature__WEBPACK_IMPORTED_MODULE_0__.NextRoundFeature),
/* harmony export */   ReloadFeature: () => (/* reexport safe */ _ReloadFeature__WEBPACK_IMPORTED_MODULE_3__.ReloadFeature),
/* harmony export */   ReloadableWeaponAttackFeature: () => (/* reexport safe */ _ReloadableWeaponAttackFeature__WEBPACK_IMPORTED_MODULE_1__.ReloadableWeaponAttackFeature),
/* harmony export */   ReloadableWeaponCreationFeature: () => (/* reexport safe */ _ReloadableWeaponCreationFeature__WEBPACK_IMPORTED_MODULE_2__.ReloadableWeaponCreationFeature)
/* harmony export */ });
/* harmony import */ var _NextRoundFeature__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./NextRoundFeature */ "./src/module/features/NextRoundFeature.ts");
/* harmony import */ var _ReloadableWeaponAttackFeature__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ReloadableWeaponAttackFeature */ "./src/module/features/ReloadableWeaponAttackFeature.ts");
/* harmony import */ var _ReloadableWeaponCreationFeature__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./ReloadableWeaponCreationFeature */ "./src/module/features/ReloadableWeaponCreationFeature.ts");
/* harmony import */ var _ReloadFeature__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./ReloadFeature */ "./src/module/features/ReloadFeature.ts");






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
            nextRound: new _features__WEBPACK_IMPORTED_MODULE_0__.NextRoundFeature(this),
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
    sendChat(speaker, content, flavor, sound, whisper = [], type = CONST.CHAT_MESSAGE_TYPES.OTHER) {
        const ChatData = {
            speaker: ChatMessage.getSpeaker({ actor: speaker }),
            type,
            flavor,
            sound,
            content,
            whisper,
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXgubWpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUllLE1BQU0sV0FBVztJQUNwQixlQUFlLENBQWlCO0lBQ2hDLFFBQVEsQ0FBUztJQUNqQixTQUFTLENBQVM7SUFFMUIsWUFBWSxjQUE4QjtRQUN0QyxJQUFJLENBQUMsZUFBZSxHQUFHLGNBQWMsQ0FBQztRQUN0QyxJQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQztRQUNuQixJQUFJLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztRQUNwQixJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDaEIsQ0FBQztJQUVELElBQUksY0FBYztRQUNkLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQztJQUNoQyxDQUFDO0lBRUQsSUFBSSxhQUFhO1FBQ2IsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLGFBQWEsQ0FBQztJQUM5QyxDQUFDO0lBRUQsSUFBSSxTQUFTO1FBQ1QsT0FBTyxJQUFJLEVBQUUsTUFBTSxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFlLENBQUM7SUFDMUQsQ0FBQztJQUVELElBQUksV0FBVztRQUNYLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztJQUN6QixDQUFDO0lBRUQsSUFBSSxXQUFXLENBQUMsRUFBVTtRQUN0QixJQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQztJQUN2QixDQUFDO0lBRUQsSUFBSSxNQUFNO1FBQ04sT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBYyxDQUFDO0lBQ2pFLENBQUM7SUFFRCxJQUFJLFFBQVE7UUFDUixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUM7SUFDMUIsQ0FBQztJQUVELElBQUksUUFBUSxDQUFDLEVBQVU7UUFDbkIsSUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7SUFDeEIsQ0FBQztJQUVELElBQUksT0FBTztRQUNQLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUNyQyxNQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM1RCxNQUFNLGNBQWMsR0FDZixnQkFBZ0IsQ0FBQyxPQUFPLENBQ3JCLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBRSxFQUNyQixXQUFXLENBQ0QsSUFBSSxJQUFJLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFeEQsSUFBSSxjQUFjLENBQUMsTUFBTSxHQUFHLFFBQVEsRUFBRSxDQUFDO1lBQ25DLE1BQU0sT0FBTyxHQUFHLFFBQVEsR0FBRyxjQUFjLENBQUMsTUFBTSxDQUFDO1lBQ2pELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxPQUFPLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztnQkFDL0IsY0FBYyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNqQyxDQUFDO1FBQ0wsQ0FBQztRQUVELE9BQU8sY0FBYyxDQUFDO0lBQzFCLENBQUM7SUFFRCxJQUFJLEtBQUs7UUFDTCxNQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDckMsTUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDNUQsTUFBTSxLQUFLLEdBQ04sZ0JBQWdCLENBQUMsT0FBTyxDQUNyQixJQUFJLENBQUMsYUFBYSxDQUFDLEVBQUUsRUFDckIsT0FBTyxDQUNHLElBQUksSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRXhELElBQUksS0FBSyxDQUFDLE1BQU0sR0FBRyxRQUFRLEVBQUUsQ0FBQztZQUMxQixNQUFNLE9BQU8sR0FBRyxRQUFRLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQztZQUN4QyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsT0FBTyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7Z0JBQy9CLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDeEIsQ0FBQztRQUNMLENBQUM7UUFFRCxPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBRUQsVUFBVSxDQUFDLEtBQXlCLEVBQUUsV0FBb0IsS0FBSztRQUMzRCxPQUFPLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFZLEVBQUUsRUFBRTtZQUNqQyxNQUFNLFVBQVUsR0FBSSxJQUFrQixDQUFDLE1BQU0sQ0FBQztZQUM5QyxJQUFJLFFBQVEsRUFBRSxDQUFDO2dCQUNYLE9BQU8sQ0FDSCxJQUFJLENBQUMsSUFBSSxJQUFJLFlBQVk7b0JBQ3pCLFVBQVUsQ0FBQyxJQUFJLENBQUMsT0FBTyxJQUFJLGVBQWU7b0JBQzFDLFVBQVUsQ0FBQyxRQUFRLENBQ3RCLENBQUM7WUFDTixDQUFDO1lBQ0QsT0FBTyxDQUNILElBQUksQ0FBQyxJQUFJLElBQUksWUFBWTtnQkFDekIsVUFBVSxDQUFDLElBQUksQ0FBQyxPQUFPLElBQUksZUFBZSxDQUM3QyxDQUFDO1FBQ04sQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsSUFBSSxLQUFJLENBQUM7SUFFVCxTQUFTLENBQUMsR0FBVyxFQUFFLElBQWdDLEVBQUUsTUFBZ0I7UUFDckUsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztJQUMzRSxDQUFDO0lBRUQsUUFBUTtRQUNKLE9BQU8sbUJBQW1CLENBQUM7SUFDL0IsQ0FBQztDQUNKOzs7Ozs7Ozs7Ozs7Ozs7O0FDL0d1QztBQUVqQyxNQUFNLGdCQUFpQixTQUFRLG9EQUFXO0lBQzdDLFlBQVksY0FBOEI7UUFDdEMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQzFCLENBQUM7SUFFRCxJQUFJO1FBQ0EsS0FBSyxDQUFDLEVBQUUsQ0FBQyxzQkFBc0IsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ3BFLENBQUM7SUFFRCxhQUFhLENBQUMsUUFBYTtRQUN2QixJQUFJLFFBQVEsQ0FBQyxJQUFJLEtBQUssU0FBUyxJQUFJLFFBQVEsQ0FBQyxJQUFJLElBQUksWUFBWSxFQUFFLENBQUM7WUFDL0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDO1lBRXBELElBQUksQ0FBQyxXQUFXLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7WUFDckMsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztZQUNqQyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDakIsT0FBTyxLQUFLLENBQUM7UUFDakIsQ0FBQztRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFRCxLQUFLLENBQUMsU0FBUztRQUNYLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbEMsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUc3QixNQUFNLFlBQVksR0FBRyxNQUNqQixPQUFPLENBQUMsWUFDWCxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQ3ZCLG1FQUFtRSxFQUNuRTtZQUNJLElBQUksRUFBRTtnQkFDRixHQUFHLEVBQUUsNkRBQTZEO2dCQUNsRSxJQUFJLEVBQUUsU0FBUzthQUNsQjtZQUNELFdBQVcsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUN2Qiw4Q0FBOEMsRUFDOUMsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxFQUMvQyxJQUFJLENBQ1A7WUFDRCxLQUFLLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyx3Q0FBd0MsQ0FBQztTQUNsRSxDQUNKLENBQUM7UUFDRixJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQ2pDLEtBQUssRUFDTCxZQUFZLEVBQ1osU0FBUyxFQUNULFNBQVMsRUFDVCxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsRUFDVixLQUFLLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUNuQyxDQUFDO0lBQ04sQ0FBQztJQUVELFFBQVE7UUFDSixPQUFPLHdCQUF3QixDQUFDO0lBQ3BDLENBQUM7Q0FDSjs7Ozs7Ozs7Ozs7Ozs7OztBQ3hEdUM7QUFTakMsTUFBTSxhQUFjLFNBQVEsb0RBQVc7SUFDbEMsT0FBTyxDQUFTO0lBQ2hCLHdCQUF3QixDQUFVO0lBRTFDLFlBQVksY0FBOEI7UUFDdEMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ3RCLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDbEIsSUFBSSxDQUFDLHdCQUF3QixHQUFHLEtBQUssQ0FBQztJQUMxQyxDQUFDO0lBRUQsSUFBSTtRQUNBLEtBQUssQ0FBQyxFQUFFLENBQUMsc0JBQXNCLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUNwRSxDQUFDO0lBRUQsYUFBYSxDQUFDLFFBQWE7UUFDdkIsSUFBSSxRQUFRLENBQUMsSUFBSSxLQUFLLFNBQVMsSUFBSSxRQUFRLENBQUMsSUFBSSxJQUFJLFFBQVEsRUFBRSxDQUFDO1lBQzNELE9BQU8sQ0FBQyxHQUFHLENBQUMsa0NBQWtDLENBQUMsQ0FBQztZQUVoRCxJQUFJLENBQUMsV0FBVyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO1lBQ3JDLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7WUFDakMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1lBQ3BCLE9BQU8sS0FBSyxDQUFDO1FBQ2pCLENBQUM7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRUQsWUFBWSxDQUFDLGFBQXNCLElBQUk7UUFDbkMsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUM7UUFDcEMsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUNwQyxNQUFNLG1CQUFtQixHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFnQixDQUFDO1FBQ2xFLElBQUksaUJBQWlCLEdBQXFCLEVBQUUsQ0FBQztRQUU3QyxJQUFJLFVBQVUsRUFBRSxDQUFDO1lBQ2IsaUJBQWlCLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLG1CQUFtQixDQUFDLENBQUM7UUFDdEUsQ0FBQzthQUFNLENBQUM7WUFDSixpQkFBaUIsR0FBRyxtQkFBbUIsQ0FBQyxHQUFHLENBQ3ZDLENBQUMsSUFBZSxFQUFrQixFQUFFO2dCQUNoQyxPQUFPO29CQUNILElBQUksRUFBRSxJQUFJLENBQUMsSUFBSTtvQkFDZixLQUFLLEVBQUUsSUFBSSxDQUFDLElBQUk7b0JBQ2hCLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVE7b0JBQzNCLFFBQVEsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVE7aUJBQ2pDLENBQUM7WUFDTixDQUFDLENBQ0osQ0FBQztRQUNOLENBQUM7UUFFRCxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FDbkMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxFQUFFLEVBQ3JCLDRCQUE0QixDQUNwQixDQUFDO1FBRWIsSUFBSSxDQUFDLGdCQUFnQixDQUNqQixpQkFBaUIsQ0FBQyxNQUFNLENBQUMsQ0FBQyxRQUF3QixFQUFFLEVBQUU7WUFDbEQsSUFBSSxRQUFRLENBQUMsS0FBSyxHQUFHLENBQUMsRUFBRSxDQUFDO2dCQUNyQixJQUNJLENBQUMsYUFBYSxJQUFJLFFBQVEsQ0FBQyxRQUFRLENBQUM7b0JBQ3BDLENBQUMsYUFBYSxFQUNoQixDQUFDO29CQUNDLE9BQU8sSUFBSSxDQUFDO2dCQUNoQixDQUFDO1lBQ0wsQ0FBQztZQUNELE9BQU8sS0FBSyxDQUFDO1FBQ2pCLENBQUMsQ0FBQyxFQUNGLGNBQWMsQ0FDakIsQ0FBQztJQUNOLENBQUM7SUFFRCxtQkFBbUIsQ0FBQyxtQkFBZ0M7UUFDaEQsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUMxRCxNQUFNLG1CQUFtQixHQUFxQixFQUFFLENBQUM7UUFDakQsbUJBQW1CLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBZSxFQUFFLEVBQUU7WUFDNUMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztZQUN2QixNQUFNLFFBQVEsR0FBbUI7Z0JBQzdCLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSTtnQkFDZixLQUFLLEVBQUUsSUFBSSxDQUFDLElBQUk7Z0JBQ2hCLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVE7Z0JBQzNCLFFBQVEsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVE7YUFDakMsQ0FBQztZQUNGLElBQUksYUFBYSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7Z0JBQ3RCLFFBQVEsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEdBQUcsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUM1RCxJQUFJLENBQUMsTUFBTSxDQUFDO29CQUNSLGlCQUFpQixFQUFFLFFBQVEsQ0FBQyxLQUFLO2lCQUNwQyxDQUFDLENBQUM7WUFDUCxDQUFDO1lBQ0QsbUJBQW1CLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3ZDLENBQUMsQ0FBQyxDQUFDO1FBQ0gsT0FBTyxtQkFBbUIsQ0FBQztJQUMvQixDQUFDO0lBRUQsS0FBSyxDQUFDLGdCQUFnQixDQUNsQixXQUE2QixFQUM3QixjQUF3QjtRQUV4QixNQUFNLGFBQWEsR0FBRyxNQUNsQixPQUFPLENBQUMsWUFDWCxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQ3ZCLHNFQUFzRSxFQUN0RTtZQUNJLFlBQVksRUFBRSxJQUFJLEtBQUssQ0FDbkIsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FDeEMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO1lBQ2YsV0FBVztTQUNkLENBQ0osQ0FBQztRQUVGLE1BQU0sYUFBYSxHQUFHO1lBQ2xCO2dCQUNJLE1BQU0sRUFBRSxNQUFNO2dCQUNkLEtBQUssRUFBRSxJQUFJLENBQUMsU0FBUyxDQUNqQixvRUFBb0UsQ0FDdkU7Z0JBQ0QsUUFBUSxFQUFFLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxFQUFFO29CQUN6QixJQUFJLENBQUMsd0JBQXdCLEdBQUcsS0FBSyxDQUFDO29CQUN0QyxNQUFNLE9BQU8sR0FBYSxFQUFFLENBQUM7b0JBQzdCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQzt3QkFDbkQsTUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUN6QyxJQUFJLEdBQUcsQ0FBQyxJQUFJLElBQUksYUFBYSxFQUFFLENBQUM7NEJBQzVCLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO3dCQUM1QixDQUFDO29CQUNMLENBQUM7b0JBQ0QsT0FBTyxFQUFFLE9BQU8sRUFBRSxjQUFjLEVBQUUsS0FBSyxFQUFFLENBQUM7Z0JBQzlDLENBQUM7YUFDSjtZQUNEO2dCQUNJLE1BQU0sRUFBRSxRQUFRO2dCQUNoQixLQUFLLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FDakIsc0VBQXNFLENBQ3pFO2dCQUNELFFBQVEsRUFBRSxHQUFHLEVBQUU7b0JBQ1gsSUFBSSxDQUFDLHdCQUF3QixHQUFHLEtBQUssQ0FBQztvQkFDdEMsT0FBTyxFQUFFLE9BQU8sRUFBRSxjQUFjLEVBQUUsY0FBYyxFQUFFLElBQUksRUFBRSxDQUFDO2dCQUM3RCxDQUFDO2FBQ0o7U0FDSixDQUFDO1FBRUYsSUFBSSxDQUFDLHdCQUF3QixHQUFHLElBQUksQ0FBQztRQUNyQyxJQUFJLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQyxFQUFFLENBQUMsZUFBZSxFQUFFLENBQUMsUUFBa0IsRUFBRSxFQUFFO1lBQzVELElBQUksUUFBUSxDQUFDLEVBQUUsS0FBSyxvQkFBb0IsRUFBRSxDQUFDO2dCQUN2QyxJQUFJLENBQUMsbUJBQW1CLENBQUMsY0FBYyxDQUFDLENBQUM7WUFDN0MsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTO2FBQ3ZCLFdBQVcsQ0FDUjtZQUNJLEtBQUssRUFBRSxJQUFJLENBQUMsU0FBUyxDQUNqQiw0REFBNEQsQ0FDL0Q7WUFDRCxPQUFPLEVBQUUsYUFBYTtZQUN0QixPQUFPLEVBQUUsYUFBYTtZQUN0QixRQUFRLEVBQUUsQ0FBQyxFQUNQLE9BQU8sRUFDUCxjQUFjLEdBSWpCLEVBQUUsRUFBRTtnQkFDRCxJQUFJLENBQUMsc0JBQXNCLENBQUMsT0FBTyxFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBQ3pELENBQUM7U0FDSixFQUNELG9CQUFvQixDQUN2QjthQUNBLE1BQU0sQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0lBQ2pDLENBQUM7SUFFRCxtQkFBbUIsQ0FBQyxPQUFpQjtRQUNqQyxLQUFLLENBQUMsR0FBRyxDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDekMsSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQztRQUVsQixJQUFJLElBQUksQ0FBQyx3QkFBd0IsRUFBRSxDQUFDO1lBQ2hDLElBQUksQ0FBQyx3QkFBd0IsR0FBRyxLQUFLLENBQUM7WUFDdEMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztRQUMvQyxDQUFDO0lBQ0wsQ0FBQztJQUVELEtBQUssQ0FBQyxzQkFBc0IsQ0FDeEIsT0FBaUIsRUFDakIsaUJBQTBCLEtBQUs7UUFFL0IsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQ3JDLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUVsRCxJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQztZQUVqQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUM7WUFDWixJQUFJLFVBQVUsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztnQkFFMUIsR0FBRyxJQUFJLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUMvQixDQUFDO1lBQ0QsTUFBTSxnQkFBZ0IsQ0FBQyxNQUFNLENBQUM7Z0JBQzFCLG1CQUFtQixFQUFFLEdBQUc7Z0JBQ3hCLG1CQUFtQixFQUNmLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUc7YUFDdkQsQ0FBQyxDQUFDO1lBQ0gsTUFBTSxnQkFBZ0IsQ0FBQyxPQUFPLENBQzFCLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBRSxFQUNyQixXQUFXLEVBQ1gsT0FBTyxDQUNWLENBQUM7WUFDRixNQUFNLGdCQUFnQixDQUFDLE9BQU8sQ0FDMUIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxFQUFFLEVBQ3JCLE9BQU8sRUFDUCxJQUFJLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUNqRSxDQUFDO1lBRUYsTUFBTSxZQUFZLEdBQUcsTUFDakIsT0FBTyxDQUFDLFlBQ1gsQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUN2Qix5RUFBeUUsRUFDekU7Z0JBQ0ksSUFBSSxFQUFFO29CQUNGLEdBQUcsRUFBRSxnQkFBZ0IsQ0FBQyxHQUFHO29CQUN6QixJQUFJLEVBQUUsZ0JBQWdCLENBQUMsSUFBSTtpQkFDOUI7Z0JBQ0QsTUFBTSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQ2xCLGNBQWM7b0JBQ1YsQ0FBQyxDQUFDLHVFQUF1RTtvQkFDekUsQ0FBQyxDQUFDLCtEQUErRCxDQUN4RTtnQkFDRCxLQUFLLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FDakIsY0FBYztvQkFDVixDQUFDLENBQUMsb0VBQW9FO29CQUN0RSxDQUFDLENBQUMsNERBQTRELEVBQ2xFLEVBQUUsZ0JBQWdCLEVBQUUsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLEVBQzNDLElBQUksQ0FDUDtnQkFDRCxPQUFPLEVBQUUsT0FBTzthQUNuQixDQUNKLENBQUM7WUFFRixJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxZQUFZLENBQUMsQ0FBQztZQUNwRSxJQUFJLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQztZQUN0QixJQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQztRQUN2QixDQUFDO2FBQU0sQ0FBQztZQUNKLE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNuQyxDQUFDO0lBQ0wsQ0FBQztJQUVELGFBQWEsQ0FBQyxNQUFpQztRQUMzQyxJQUFJLG1CQUFtQixHQUFHLElBQUksQ0FBQztRQUMvQixNQUFNLG1CQUFtQixHQUFHLElBQUksQ0FBQyxVQUFVLENBQ3ZDLElBQUksQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUNULENBQUM7UUFDakIsbUJBQW1CLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBZSxFQUFFLEVBQUU7WUFDNUMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztZQUN2QixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7WUFHaEQsSUFBSSxHQUFHLEdBQUcsQ0FBQyxFQUFFLENBQUM7Z0JBQ1YsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUN2QyxJQUFJLENBQUMsU0FBUyxDQUNWLHNEQUFzRCxFQUN0RCxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLEVBQ25CLElBQUksQ0FDUCxFQUNELE9BQU8sQ0FDVixDQUFDO2dCQUNGLG1CQUFtQixHQUFHLEtBQUssQ0FBQztZQUNoQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLG1CQUFtQixFQUFFLENBQUM7WUFDdEIsbUJBQW1CLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxJQUFlLEVBQUUsRUFBRTtnQkFDbEQsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztnQkFDdkIsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztvQkFDZixNQUFNLElBQUksQ0FBQyxNQUFNLENBQUM7d0JBQ2QsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQztxQkFDekQsQ0FBQyxDQUFDO2dCQUNQLENBQUM7WUFDTCxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUM7UUFFRCxPQUFPLG1CQUFtQixDQUFDO0lBQy9CLENBQUM7SUFFRCxLQUFLLENBQUMsZ0JBQWdCLENBQUMsS0FBaUIsRUFBRSxNQUFpQjtRQUN2RCxJQUFJLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQyxFQUFFLENBQUM7UUFDNUIsSUFBSSxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUMsRUFBRSxDQUFDO1FBRTFCLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztJQUN4QixDQUFDO0lBRUQsZ0JBQWdCLENBQUMsY0FBd0I7UUFHckMsTUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFDO1FBQ25CLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFZLEVBQUUsRUFBRTtZQUNwQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQztnQkFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3RDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3RDLENBQUMsQ0FBQyxDQUFDO1FBQ0gsT0FBTyxPQUFPLENBQUM7SUFDbkIsQ0FBQztJQUVELFFBQVE7UUFDSixPQUFPLHFCQUFxQixDQUFDO0lBQ2pDLENBQUM7Q0FDSjs7Ozs7Ozs7Ozs7Ozs7OztBQzNTdUM7QUFFakMsTUFBTSw2QkFBOEIsU0FBUSxvREFBVztJQUNsRCxVQUFVLENBR2hCO0lBQ00sT0FBTyxDQUFTO0lBRXhCLFlBQVksY0FBOEI7UUFDdEMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ3RCLElBQUksQ0FBQyxVQUFVLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsQ0FBQztRQUN2QyxJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ3RCLENBQUM7SUFFRCxJQUFJO1FBQ0EsS0FBSyxDQUFDLEVBQUUsQ0FBQyw2QkFBNkIsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQzNFLENBQUM7SUFFRCxhQUFhLENBQUMsT0FBcUIsRUFBRSxLQUFxQjtRQUN0RCxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDeEIsTUFBTSxVQUFVLEdBQUcsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUM7UUFDcEMsSUFBSSxVQUFVLEVBQUUsSUFBSSxFQUFFLFFBQVEsS0FBSyxrQkFBa0I7WUFBRSxPQUFPO1FBRTlELE9BQU8sQ0FBQyxHQUFHLENBQUMsa0NBQWtDLENBQUMsQ0FBQztRQUNoRCxJQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztRQUN0QyxJQUFJLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztRQUUxQyxPQUFPLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO0lBQ3pDLENBQUM7SUFFRCxzQkFBc0I7UUFDbEIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBRW5DLElBQUksTUFBTSxDQUFDLElBQUksSUFBSSxPQUFPLEVBQUUsQ0FBQztZQUN6QixJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7WUFHckIsT0FBTyxLQUFLLENBQUM7UUFDakIsQ0FBQztRQUVELElBQUksQ0FBQyxVQUFVLEdBQUc7WUFDZCxFQUFFLEVBQUUsTUFBTSxDQUFDLEVBQUU7WUFDYixJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUk7U0FDcEIsQ0FBQztRQUVGLElBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDLEVBQUUsQ0FDbkIseUJBQXlCLEVBQ3pCLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQ3RDLENBQUM7UUFFRixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDbEMsQ0FBQztJQUVELEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLEVBQUUsSUFBSTtRQUNuQyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDO1FBQzVDLE1BQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDaEQsSUFDSSxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsS0FBSyxNQUFNO1lBQzdCLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxLQUFLLFFBQVEsRUFDbkMsQ0FBQztZQUNDLEtBQUssQ0FBQyxHQUFHLENBQUMseUJBQXlCLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ25ELElBQUksQ0FBQyxVQUFVLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsQ0FBQztZQUV2QyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFjLENBQUM7WUFFN0QsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1lBQzlELE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDbEQsTUFBTSxhQUFhLEdBQUcsY0FBYyxJQUFJLFFBQVEsQ0FBQztZQUdqRCxNQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUN2QyxJQUFJLENBQUMsYUFBYSxDQUFDLEVBQUUsRUFDckIsY0FBYyxDQUNOLENBQUM7WUFFYixNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FDbEMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxFQUFFLEVBQ3JCLGFBQWEsQ0FDTCxDQUFDO1lBRWIsTUFBTSw0QkFBNEIsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FDbEQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxFQUFFLEVBQ3JCLCtCQUErQixDQUN4QixDQUFDO1lBR1osSUFBSSxZQUFZLEVBQUUsQ0FBQztnQkFDZixNQUFNLGtCQUFrQixHQUNwQixpQkFBaUI7b0JBQ2pCLE1BQU0sRUFBRSxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQVksRUFBRSxFQUFFO3dCQUM1QyxPQUFPLElBQUksS0FBSyxVQUFVLENBQUM7b0JBQy9CLENBQUMsQ0FBQztvQkFDRSxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FDViwrREFBK0QsRUFDL0QsRUFBRSxPQUFPLEVBQUUsR0FBRyw0QkFBNEIsRUFBRSxFQUFFLEVBQzlDLElBQUksQ0FDUDtvQkFDSCxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FDViw2REFBNkQsQ0FDaEUsQ0FBQztnQkFFWixNQUFNLGtCQUFrQixHQUNwQixhQUFhLENBQUMsYUFBYSxDQUFDLGVBQWUsQ0FBQyxDQUFDO2dCQUNqRCxNQUFNLGNBQWMsR0FDaEIsa0JBQWtCLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUNqRCxjQUFjLENBQUMsa0JBQWtCLENBQzdCLFdBQVcsRUFDWCxNQUFNLGtCQUFrQixNQUFNLENBQ2pDLENBQUM7WUFDTixDQUFDO1lBR0QsSUFBSSxRQUFRLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztnQkFDOUIsTUFBTSxnQkFBZ0IsR0FDbEIsYUFBYSxDQUFDLGFBQWEsQ0FBQyxjQUFjLENBQUMsQ0FBQztnQkFDaEQsTUFBTSxlQUFlLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDdEQsZUFBZSxDQUFDLFNBQVMsR0FBRyxjQUFjLENBQUM7Z0JBQzNDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUM1QyxDQUFDO1lBRUQsTUFBTSxrQkFBa0IsR0FDcEIsYUFBYSxDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUdqRCxJQUFJLFlBQVksRUFBRSxDQUFDO2dCQUNmLE1BQU0sVUFBVSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQ3BELFVBQVUsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3BELFVBQVUsQ0FBQyxTQUFTLEdBQUcsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQ2hFLDhEQUE4RCxDQUNqRSxFQUFFLENBQUM7Z0JBQ0osa0JBQWtCLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQzFDLENBQUM7WUFHRCxNQUFNLFNBQVMsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ25ELFNBQVMsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDbEQsU0FBUyxDQUFDLFNBQVMsR0FBRyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FDOUQsNERBQTRELENBQy9ELEVBQUUsQ0FBQztZQUNKLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUN6QyxDQUFDO0lBQ0wsQ0FBQztJQUVELFlBQVk7UUFDUixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQ2pDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7UUFFM0IsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUM3QixPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3RCLE1BQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUdsQyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBRSxFQUFFLFdBQVcsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUU1RCxNQUFNLG1CQUFtQixHQUFHLElBQUksQ0FBQyxVQUFVLENBQ3ZDLFNBQVMsQ0FBQyxLQUFLLENBQ0gsQ0FBQztRQUNqQixPQUFPLENBQ0gsbUJBQW1CLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBZSxFQUFFLEVBQUU7WUFDekMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztZQUN2QixJQUFJLElBQUksSUFBSSxTQUFTLEVBQUUsQ0FBQztnQkFDcEIsT0FBTyxJQUFJLENBQUM7WUFDaEIsQ0FBQztZQUNELE9BQU8sSUFBSSxDQUFDO1FBQ2hCLENBQUMsQ0FBQyxJQUFLLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBZ0IsQ0FDekMsQ0FBQztJQUNOLENBQUM7SUFFRCxhQUFhO1FBQ1QsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUNqQyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBRTNCLE1BQU0sWUFBWSxHQUFHLEtBQUssQ0FBQyxFQUFFLENBQ3pCLG1CQUFtQixFQUNuQixDQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsRUFBRTtZQUNoQixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBQ3hELFNBQVMsRUFBRSxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFO2dCQUN0QyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUNuQyxDQUFDLENBQUMsQ0FBQztZQUVILElBQUksU0FBUyxFQUFFLENBQUM7Z0JBQ1osS0FBSyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsRUFBRSxZQUFZLENBQUMsQ0FBQztZQUNqRCxDQUFDO1FBQ0wsQ0FBQyxDQUNKLENBQUM7UUFFRixNQUFNLFlBQVksR0FBeUI7WUFDdkMsV0FBVyxFQUFFO2dCQUNULElBQUksRUFBRSxNQUFNLElBQUksQ0FBQyxTQUFTLENBQ3RCLGtFQUFrRSxFQUNsRSxFQUFFLElBQUksRUFBRSxTQUFTLENBQUMsSUFBSSxFQUFFLGdCQUFnQixFQUFFLE1BQU0sQ0FBQyxJQUFJLEVBQUUsRUFDdkQsSUFBSSxDQUNQLE1BQU07YUFDVjtZQUNELElBQUksRUFBRTtnQkFDRixHQUFHLEVBQUUsTUFBTSxDQUFDLEdBQUc7Z0JBQ2YsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQ2hCLDREQUE0RCxDQUMvRDthQUNKO1lBQ0QsUUFBUSxFQUFFLE1BQU0sQ0FBQyxJQUFJO1lBQ3JCLE9BQU8sRUFBRTtnQkFDTDtvQkFDSSxPQUFPLEVBQUU7d0JBQ0wsVUFBVSxFQUFFLEtBQUs7cUJBQ3BCO29CQUNELElBQUksRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLGlCQUFpQixDQUFDO29CQUN0QyxLQUFLLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxvQ0FBb0MsQ0FBQztvQkFDM0QsT0FBTyxFQUFFLGFBQWE7aUJBQ3pCO2FBQ0o7U0FDSixDQUFDO1FBRUYsSUFBSSxDQUFDLFVBQVUsQ0FBQyxZQUFZLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDN0MsQ0FBQztJQUVELEtBQUssQ0FBQyxVQUFVLENBQUMsWUFBWSxFQUFFLFNBQVM7UUFDcEMsTUFBTSxZQUFZLEdBQUcsTUFDakIsT0FBTyxDQUFDLFlBQ1gsQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUN2Qix3REFBd0QsRUFDeEQsWUFBWSxDQUNmLENBQUM7UUFDRixJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFLFlBQVksQ0FBQyxDQUFDO0lBQ25FLENBQUM7SUFFRCxTQUFTLENBQUMsTUFBaUI7UUFDdkIsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQ3JDLE1BQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzVELE1BQU0sWUFBWSxHQUNiLGdCQUFnQixDQUFDLE9BQU8sQ0FDckIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxFQUFFLEVBQ3JCLE9BQU8sQ0FDRyxJQUFJLElBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUV4RCxZQUFZLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNsQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDeEIsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBRSxFQUFFLE9BQU8sRUFBRSxZQUFZLENBQUMsQ0FBQztRQUV2RSxNQUFNLElBQUksR0FBRyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO1FBQzFDLE1BQU0sR0FBRyxHQUNMLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO1lBQ2hDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUM7WUFDaEIsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFN0IsZ0JBQWdCLENBQUMsTUFBTSxDQUFDO1lBQ3BCLG1CQUFtQixFQUFFLEdBQUc7WUFDeEIsbUJBQW1CLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHO1NBQ2hELENBQUMsQ0FBQztRQUVILE9BQU8sTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQ3hCLENBQUM7SUFFRCxNQUFNLENBQUMsS0FBaUIsRUFBRSxnQkFBMkI7UUFDakQsSUFBSSxDQUFDLGNBQWM7YUFDZCxVQUFVLENBQUMsUUFBUSxDQUFDO2FBQ3BCLGdCQUFnQixDQUFDLEtBQUssRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO0lBQ25ELENBQUM7SUFFRCxLQUFLLENBQUMsYUFBYTtRQUNmLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7UUFDN0IsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQ3JDLE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFekQsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUN6QixNQUFNLE1BQU0sR0FBVyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQVcsQ0FBQztRQUN2RCxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRXBCLElBQUksTUFBTSxJQUFJLE9BQU8sRUFBRSxDQUFDO1lBRXBCLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FDdkMsSUFBSSxDQUFDLFNBQVMsQ0FDVixzRUFBc0UsRUFDdEU7Z0JBQ0ksSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJO2dCQUNoQixnQkFBZ0IsRUFBRSxnQkFBZ0IsQ0FBQyxJQUFJO2FBQzFDLEVBQ0QsSUFBSSxDQUNQLEVBQ0QsTUFBTSxDQUNULENBQUM7WUFDRixPQUFPO1FBQ1gsQ0FBQztRQUVELE1BQU0sZ0JBQWdCLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBRSxFQUFFLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV0RSxJQUFJLE1BQU0sR0FBRyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQWUsQ0FBQztRQUMzQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFZLEVBQUUsRUFBRTtZQUN6QyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1lBQ3ZCLElBQUksSUFBSSxJQUFJLE1BQU0sRUFBRSxDQUFDO2dCQUNqQixNQUFNLEdBQUcsSUFBaUIsQ0FBQztZQUMvQixDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFHSCxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQ2pDLFdBQVcsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDNUIsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3ZCLE1BQU0sZ0JBQWdCLENBQUMsT0FBTyxDQUMxQixJQUFJLENBQUMsYUFBYSxDQUFDLEVBQUUsRUFDckIsV0FBVyxFQUNYLFdBQVcsQ0FDZCxDQUFDO1FBR0YsTUFBTSxJQUFJLEdBQUcsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztRQUMxQyxNQUFNLEdBQUcsR0FBVyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDN0QsZ0JBQWdCLENBQUMsTUFBTSxDQUFDO1lBQ3BCLG1CQUFtQixFQUFFLEdBQUc7WUFDeEIsbUJBQW1CLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHO1NBQ2hELENBQUMsQ0FBQztRQUdILE1BQU0sWUFBWSxHQUFHLE1BQ2pCLE9BQU8sQ0FBQyxZQUNYLENBQUMsVUFBVSxDQUFDLGNBQWMsQ0FDdkIsbUVBQW1FLEVBQ25FO1lBQ0ksSUFBSSxFQUFFO2dCQUNGLEdBQUcsRUFBRSxNQUFNLENBQUMsR0FBRztnQkFDZixJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUk7YUFDcEI7WUFDRCxXQUFXLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FDdkIsd0VBQXdFLEVBQ3hFLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLEVBQy9DLElBQUksQ0FDUDtZQUNELEtBQUssRUFBRSxJQUFJLENBQUMsU0FBUyxDQUNqQiwwRUFBMEUsQ0FDN0U7U0FDSixDQUNKLENBQUM7UUFDRixJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLFlBQVksQ0FBQyxDQUFDO0lBQy9ELENBQUM7SUFFRCxLQUFLLENBQUMsY0FBYztRQUNoQixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQzdCLE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDMUMsTUFBTSxJQUFJLENBQUMsU0FBUyxDQUFDO1lBQ2pCLE9BQU8sRUFBRTtnQkFDTCxLQUFLLEVBQUUsS0FBSyxDQUFDLElBQUk7YUFDcEI7U0FDSixDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsUUFBUSxDQUFDLElBQVk7UUFDakIsT0FBTyxpQkFBaUIsSUFBSSxRQUFRLENBQUM7SUFDekMsQ0FBQztJQUVELFFBQVE7UUFDSixPQUFPLHFDQUFxQyxDQUFDO0lBQ2pELENBQUM7Q0FDSjs7Ozs7Ozs7Ozs7Ozs7OztBQ3hXdUM7QUFFakMsTUFBTSwrQkFBZ0MsU0FBUSxvREFBVztJQUNwRCx5QkFBeUIsQ0FBVTtJQUNuQyxpQkFBaUIsQ0FBUztJQUVsQyxZQUFZLGNBQThCO1FBQ3RDLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUN0QixJQUFJLENBQUMseUJBQXlCLEdBQUcsS0FBSyxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUNoQyxDQUFDO0lBRUQsSUFBSTtRQUNBLEtBQUssQ0FBQyxFQUFFLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDL0QsQ0FBQztJQUVELEtBQUssQ0FBQyxlQUFlLENBQUMsSUFBZTtRQUNqQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsSUFBSSxrQkFBa0IsRUFBRSxDQUFDO1lBQ2xELE9BQU8sQ0FBQyxHQUFHLENBQUMsd0NBQXdDLENBQUMsQ0FBQztZQUV0RCxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUM7WUFDeEIsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsS0FBSyxFQUFFLEVBQVksQ0FBQztZQUM1QyxJQUFJLENBQUMseUJBQXlCLEdBQUcsSUFBSSxDQUFDO1lBQ3RDLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxLQUFLLENBQUMsRUFBRSxDQUM3QixZQUFZLEVBQ1osSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQy9CLENBQUM7UUFDTixDQUFDO0lBQ0wsQ0FBQztJQUVELEtBQUssQ0FBQyxZQUFZLENBQUMsSUFBZTtRQUM5QixJQUFJLENBQUMsSUFBSSxDQUFDLHlCQUF5QixJQUFJLElBQUksQ0FBQyxFQUFFLEtBQUssSUFBSSxDQUFDLFFBQVE7WUFDNUQsT0FBTztRQUVYLE9BQU8sQ0FBQyxHQUFHLENBQUMscURBQXFELENBQUMsQ0FBQztRQUVuRSxNQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDckMsTUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFM0QsTUFBTSxnQkFBZ0IsQ0FBQyxNQUFNLENBQUM7WUFDMUIsbUJBQW1CLEVBQUUsT0FBTztZQUM1QixtQkFBbUIsRUFBRSxDQUFDO1NBQ3pCLENBQUMsQ0FBQztRQUNILE1BQU0sZ0JBQWdCLENBQUMsT0FBTyxDQUMxQixJQUFJLENBQUMsYUFBYSxDQUFDLEVBQUUsRUFDckIsV0FBVyxFQUNYLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FDbkMsQ0FBQztRQUNGLE1BQU0sZ0JBQWdCLENBQUMsT0FBTyxDQUMxQixJQUFJLENBQUMsYUFBYSxDQUFDLEVBQUUsRUFDckIsT0FBTyxFQUNQLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FDbkMsQ0FBQztRQUVGLElBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO1FBQ25CLElBQUksQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDO1FBQ3RCLElBQUksQ0FBQyx5QkFBeUIsR0FBRyxLQUFLLENBQUM7UUFDdkMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDaEQsSUFBSSxDQUFDLGlCQUFpQixHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ2hDLENBQUM7SUFFRCxRQUFRO1FBQ0osT0FBTyx1Q0FBdUMsQ0FBQztJQUNuRCxDQUFDO0NBQ0o7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNuRXFEO0FBQzBCO0FBQ0k7QUFDcEM7Ozs7Ozs7Ozs7Ozs7Ozs7QUNHM0I7QUFFTixNQUFNLGNBQWM7SUFDdkIsY0FBYyxDQUFnQjtJQUM5QixTQUFTLENBQXlCO0lBRTFDLFlBQVksYUFBNEI7UUFDcEMsSUFBSSxDQUFDLGNBQWMsR0FBRyxhQUFhLENBQUM7UUFDcEMsSUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7SUFDeEIsQ0FBQztJQUVELElBQUk7UUFDQSxJQUFJLENBQUMsU0FBUyxHQUFHO1lBQ2IsU0FBUyxFQUFFLElBQUksdURBQWdCLENBQUMsSUFBSSxDQUFDO1lBQ3JDLE1BQU0sRUFBRSxJQUFJLG9EQUFhLENBQUMsSUFBSSxDQUFDO1lBQy9CLHNCQUFzQixFQUFFLElBQUksb0VBQTZCLENBQUMsSUFBSSxDQUFDO1lBQy9ELHdCQUF3QixFQUFFLElBQUksc0VBQStCLENBQUMsSUFBSSxDQUFDO1NBQ3RFLENBQUM7SUFDTixDQUFDO0lBRUQsVUFBVSxDQUFDLEVBQVU7UUFDakIsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7WUFDckIsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzlCLENBQUM7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRUQsSUFBSSxhQUFhO1FBQ2IsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDO0lBQy9CLENBQUM7SUFFRCxRQUFRO1FBQ0osT0FBTyx5QkFBeUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUM1RCxDQUFDO0NBQ0o7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ3hDNkM7QUFDVjtBQUNZO0FBRWpDLE1BQU0sYUFBYTtJQUN0QixTQUFTLENBQVM7SUFDbEIsZUFBZSxDQUFpQjtJQUNoQyxVQUFVLENBQVk7SUFDdEIsZ0JBQWdCLENBQWtCO0lBRTFDLFlBQVksRUFBVTtRQUNsQixJQUFJLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztRQUNwQixJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksdURBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNoRCxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksa0RBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN0QyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSx3REFBZSxFQUFFLENBQUM7SUFDbEQsQ0FBQztJQUVELElBQUksRUFBRTtRQUNGLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztJQUMxQixDQUFDO0lBRUQsSUFBSSxjQUFjO1FBQ2QsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDO0lBQ2hDLENBQUM7SUFFRCxJQUFJLFNBQVM7UUFDVCxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUM7SUFDM0IsQ0FBQztJQUVELElBQUksZUFBZTtRQUNmLE9BQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDO0lBQ2pDLENBQUM7SUFFRCxJQUFJO1FBQ0EsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO1FBQzVCLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDNUIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUN2QixJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDakMsQ0FBQztJQUVELGVBQWU7UUFDVixNQUFjLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxJQUFJLEdBQUc7WUFDdEMsS0FBSyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLDJCQUEyQixDQUFDO1NBQ3JFLENBQUM7UUFFRCxNQUFjLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxXQUFXLEdBQUc7WUFDL0MsS0FBSyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLDJCQUEyQixDQUFDO1NBQ3JFLENBQUM7UUFDRCxNQUFjLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBRS9ELE1BQWMsQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLFFBQVEsR0FBRztZQUM1QyxLQUFLLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsd0JBQXdCLENBQUM7WUFDL0QsVUFBVSxFQUFFLElBQUk7U0FDbkIsQ0FBQztRQUVELE1BQWMsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLGdCQUFnQjtZQUM1QywrREFBK0QsQ0FBQztJQUN4RSxDQUFDO0lBRUQsb0JBQW9CO1FBQ2hCLE1BQU0sVUFBVSxHQUFHLG9CQUFvQixDQUFDO1FBRXhDLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxjQUFjLEVBQUU7WUFDL0MsS0FBSyxFQUFFLE9BQU87WUFDZCxJQUFJLEVBQUUsMENBQTBDO1lBQ2hELElBQUksRUFBRSwwQ0FBMEM7WUFDaEQsSUFBSSxFQUFFLE9BQU87WUFDYixNQUFNLEVBQUUsSUFBSTtZQUNaLE9BQU8sRUFBRSxJQUFJO1NBQ2hCLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSwrQkFBK0IsRUFBRTtZQUNoRSxLQUFLLEVBQUUsT0FBTztZQUNkLElBQUksRUFBRSwwREFBMEQ7WUFDaEUsSUFBSSxFQUFFLDBEQUEwRDtZQUNoRSxJQUFJLEVBQUUsTUFBTTtZQUNaLE1BQU0sRUFBRSxJQUFJO1lBQ1osT0FBTyxFQUFFLENBQUM7U0FDYixDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsYUFBYSxFQUFFO1lBQzlDLEtBQUssRUFBRSxPQUFPO1lBQ2QsSUFBSSxFQUFFLHlDQUF5QztZQUMvQyxJQUFJLEVBQUUseUNBQXlDO1lBQy9DLElBQUksRUFBRSxPQUFPO1lBQ2IsTUFBTSxFQUFFLElBQUk7WUFDWixPQUFPLEVBQUUsSUFBSTtTQUNoQixDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsNEJBQTRCLEVBQUU7WUFDN0QsS0FBSyxFQUFFLE1BQU07WUFDYixJQUFJLEVBQUUsd0RBQXdEO1lBQzlELElBQUksRUFBRSx3REFBd0Q7WUFDOUQsSUFBSSxFQUFFLE9BQU87WUFDYixNQUFNLEVBQUUsSUFBSTtZQUNaLE9BQU8sRUFBRSxLQUFLO1NBQ2pCLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCxLQUFLLENBQUMsUUFBaUIsS0FBSztRQUN4QixNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDM0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDaEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRyxNQUFjLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDekQsQ0FBQztJQUVELFFBQVE7UUFDSixPQUFPLHFCQUFxQixDQUFDO0lBQ2pDLENBQUM7Q0FDSjs7Ozs7Ozs7Ozs7Ozs7O0FDN0djLE1BQU0sZUFBZTtJQUNoQyxnQkFBZSxDQUFDO0lBRWhCLElBQUk7UUFDQyxPQUFPLENBQUMsWUFBb0IsQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUNsRCxlQUFlLENBQUMsS0FBSyxDQUN4QixDQUFDO0lBQ04sQ0FBQztJQUVELE1BQU0sS0FBSyxLQUFLO1FBQ1osTUFBTSxLQUFLLEdBQUcsRUFBRSxDQUFDO1FBQ2pCLE1BQU0sYUFBYSxHQUFHLDZUQUE2VCxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUMvVixLQUFLLE1BQU0sSUFBSSxJQUFJLGFBQWEsRUFBRSxDQUFDO1lBQy9CLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQztRQUNoRCxDQUFDO1FBQ0QsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztJQUVELE1BQU0sQ0FBQyxXQUFXO1FBQ2QsS0FBSyxNQUFNLFFBQVEsSUFBSSxjQUFjLEVBQUUsQ0FBQztZQUNwQyxJQUNJLE1BQU0sQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsUUFBUSxDQUFDLEVBQ2hFLENBQUM7Z0JBQ0MsT0FBTyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDcEMsQ0FBQztRQUNMLENBQUM7UUFFQSxPQUFPLENBQUMsWUFBb0IsQ0FBQyxVQUFVO2FBQ25DLGFBQWEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO2FBQ3pCLElBQUksQ0FBQyxHQUFHLEVBQUU7WUFDUCxLQUFLLE1BQU0sV0FBVyxJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDbkMsSUFDSSxNQUFNLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQ2hDLEVBQUUsQ0FBQyxPQUFPLEVBQ1YsV0FBVyxDQUNkLEVBQ0gsQ0FBQztvQkFDQyxFQUFFLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDekMsQ0FBQztZQUNMLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNYLENBQUM7SUFFRCxRQUFRO1FBQ0osT0FBTyx1QkFBdUIsQ0FBQztJQUNuQyxDQUFDO0NBQ0o7Ozs7Ozs7Ozs7Ozs7OztBQzNDYyxNQUFNLFNBQVM7SUFDbEIsY0FBYyxDQUFnQjtJQUV0QyxZQUFZLGFBQTRCO1FBQ3BDLElBQUksQ0FBQyxjQUFjLEdBQUcsYUFBYSxDQUFDO0lBQ3hDLENBQUM7SUFFRCxJQUFJO0lBRUosQ0FBQztJQUVELElBQUksYUFBYTtRQUNiLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQztJQUMvQixDQUFDO0lBRUQsV0FBVyxDQUFDLE9BQU8sRUFBRSxFQUFFO1FBQ25CLE9BQU8sSUFBSSxPQUFPLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUM7WUFDekMsTUFBTSxFQUFFO2dCQUNKLEtBQUssRUFBRSxPQUFPLENBQUMsS0FBSztnQkFDcEIsY0FBYyxFQUFFLE9BQU8sQ0FBQyxjQUFjLElBQUksRUFBRTthQUMvQztZQUNELE9BQU8sRUFBRSxPQUFPLENBQUMsT0FBTztZQUN4QixPQUFPLEVBQUUsT0FBTyxDQUFDLE9BQU87WUFDeEIsTUFBTSxFQUFFLE9BQU8sQ0FBQyxRQUFRO1lBQ3hCLEVBQUUsRUFBRSxFQUFFO1NBQ1QsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVELGNBQWMsQ0FBQyxHQUFXLEVBQUUsT0FBZSxNQUFNO1FBQzdDLElBQUksRUFBRSxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQ25CLFFBQVEsSUFBSSxFQUFFLENBQUM7Z0JBQ1gsS0FBSyxPQUFPO29CQUNSLEVBQUUsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUM1QixNQUFNO2dCQUNWLEtBQUssTUFBTTtvQkFDUCxFQUFFLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFDM0IsTUFBTTtnQkFDVixLQUFLLE1BQU0sQ0FBQztnQkFDWjtvQkFDSSxFQUFFLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNuQyxDQUFDO1FBQ0wsQ0FBQztJQUNMLENBQUM7SUFFRCxRQUFRLENBQ0osT0FBbUIsRUFDbkIsT0FBZSxFQUNmLE1BQWUsRUFDZixLQUFjLEVBQ2QsVUFBb0IsRUFBRSxFQUN0QixPQUE4QixLQUFLLENBQUMsa0JBQWtCLENBQUMsS0FBSztRQUU1RCxNQUFNLFFBQVEsR0FBRztZQUNiLE9BQU8sRUFBRSxXQUFXLENBQUMsVUFBVSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxDQUFDO1lBQ25ELElBQUk7WUFDSixNQUFNO1lBQ04sS0FBSztZQUNMLE9BQU87WUFDUCxPQUFPO1NBQ1YsQ0FBQztRQUNGLFdBQVcsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDakMsQ0FBQztJQUVELGVBQWUsQ0FDWCxHQUFXLEVBQ1gsSUFBZ0MsRUFDaEMsU0FBa0IsS0FBSztRQUV2QixJQUFJLE1BQU0sRUFBRSxDQUFDO1lBQ1QsT0FBUSxJQUFZLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDaEQsQ0FBQztRQUNELE9BQVEsSUFBWSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ2xELENBQUM7SUFFRCxRQUFRO1FBQ0osT0FBTyxpQkFBaUIsQ0FBQztJQUM3QixDQUFDO0NBQ0o7Ozs7Ozs7VUNoRkQ7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7Ozs7V0N0QkE7V0FDQTtXQUNBO1dBQ0E7V0FDQSx5Q0FBeUMsd0NBQXdDO1dBQ2pGO1dBQ0E7V0FDQTs7Ozs7V0NQQTs7Ozs7V0NBQTtXQUNBO1dBQ0E7V0FDQSx1REFBdUQsaUJBQWlCO1dBQ3hFO1dBQ0EsZ0RBQWdELGFBQWE7V0FDN0Q7Ozs7O1dDTkE7Ozs7Ozs7Ozs7Ozs7OztBQ0E0RDtBQUNJO0FBRXhCO0FBRXhDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEtBQUssSUFBSSxFQUFFO0lBQzFCLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUNBQW1DLENBQUMsQ0FBQztJQUVqRCxNQUFNLGFBQWEsR0FBRyxJQUFJLHNFQUFhLENBQUMsNENBQWEsQ0FBQyxDQUFDO0lBQ3ZELGFBQWEsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDMUIsYUFBYSxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ3pCLENBQUMsQ0FBQyxDQUFDO0FBRUgsSUFBSSxJQUFzQyxFQUFFLENBQUM7SUFDekMsSUFBSSxLQUFVLEVBQUU7QUFBQSxFQU1mO0FBQ0wsQ0FBQzs7Ozs7Ozs7Ozs7OztBQ3JCRCxpRUFBZSxxQkFBdUIsc0JBQXNCLEUiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9mdnR0LXdlYXBvbi1yZWxvYWQvLi9zcmMvbW9kdWxlL2ZlYXR1cmVzL0Jhc2VGZWF0dXJlLnRzIiwid2VicGFjazovL2Z2dHQtd2VhcG9uLXJlbG9hZC8uL3NyYy9tb2R1bGUvZmVhdHVyZXMvTmV4dFJvdW5kRmVhdHVyZS50cyIsIndlYnBhY2s6Ly9mdnR0LXdlYXBvbi1yZWxvYWQvLi9zcmMvbW9kdWxlL2ZlYXR1cmVzL1JlbG9hZEZlYXR1cmUudHMiLCJ3ZWJwYWNrOi8vZnZ0dC13ZWFwb24tcmVsb2FkLy4vc3JjL21vZHVsZS9mZWF0dXJlcy9SZWxvYWRhYmxlV2VhcG9uQXR0YWNrRmVhdHVyZS50cyIsIndlYnBhY2s6Ly9mdnR0LXdlYXBvbi1yZWxvYWQvLi9zcmMvbW9kdWxlL2ZlYXR1cmVzL1JlbG9hZGFibGVXZWFwb25DcmVhdGlvbkZlYXR1cmUudHMiLCJ3ZWJwYWNrOi8vZnZ0dC13ZWFwb24tcmVsb2FkLy4vc3JjL21vZHVsZS9mZWF0dXJlcy9pbmRleC50cyIsIndlYnBhY2s6Ly9mdnR0LXdlYXBvbi1yZWxvYWQvLi9zcmMvbW9kdWxlL21hbmFnZXJzL0ZlYXR1cmVNYW5hZ2VyLnRzIiwid2VicGFjazovL2Z2dHQtd2VhcG9uLXJlbG9hZC8uL3NyYy9tb2R1bGUvbWFuYWdlcnMvTW9kdWxlTWFuYWdlci50cyIsIndlYnBhY2s6Ly9mdnR0LXdlYXBvbi1yZWxvYWQvLi9zcmMvbW9kdWxlL21hbmFnZXJzL1RlbXBsYXRlTWFuYWdlci50cyIsIndlYnBhY2s6Ly9mdnR0LXdlYXBvbi1yZWxvYWQvLi9zcmMvbW9kdWxlL21hbmFnZXJzL1VpTWFuYWdlci50cyIsIndlYnBhY2s6Ly9mdnR0LXdlYXBvbi1yZWxvYWQvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vZnZ0dC13ZWFwb24tcmVsb2FkL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9mdnR0LXdlYXBvbi1yZWxvYWQvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9mdnR0LXdlYXBvbi1yZWxvYWQvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9mdnR0LXdlYXBvbi1yZWxvYWQvd2VicGFjay9ydW50aW1lL3B1YmxpY1BhdGgiLCJ3ZWJwYWNrOi8vZnZ0dC13ZWFwb24tcmVsb2FkLy4vc3JjL2luZGV4LnRzIiwid2VicGFjazovL2Z2dHQtd2VhcG9uLXJlbG9hZC8uL3NyYy9zdHlsZXMvbW9kdWxlLnNjc3MiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEZlYXR1cmVNYW5hZ2VyIGZyb20gJy4uL21hbmFnZXJzL0ZlYXR1cmVNYW5hZ2VyJztcblxuaW1wb3J0IHsgRG5kQWN0b3I1ZSwgRG5kSXRlbTVlIH0gZnJvbSAnLi4vdHlwZXMvZG5kLnR5cGVzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQmFzZUZlYXR1cmUge1xuICAgIHByaXZhdGUgX2ZlYXR1cmVNYW5hZ2VyOiBGZWF0dXJlTWFuYWdlcjtcbiAgICBwcml2YXRlIF9hY3RvcklkOiBzdHJpbmc7XG4gICAgcHJpdmF0ZSBfd2VhcG9uSWQ6IHN0cmluZztcblxuICAgIGNvbnN0cnVjdG9yKGZlYXR1cmVNYW5hZ2VyOiBGZWF0dXJlTWFuYWdlcikge1xuICAgICAgICB0aGlzLl9mZWF0dXJlTWFuYWdlciA9IGZlYXR1cmVNYW5hZ2VyO1xuICAgICAgICB0aGlzLl9hY3RvcklkID0gJyc7XG4gICAgICAgIHRoaXMuX3dlYXBvbklkID0gJyc7XG4gICAgICAgIHRoaXMuaW5pdCgpO1xuICAgIH1cblxuICAgIGdldCBmZWF0dXJlTWFuYWdlcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ZlYXR1cmVNYW5hZ2VyO1xuICAgIH1cblxuICAgIGdldCBtb2R1bGVNYW5hZ2VyKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZmVhdHVyZU1hbmFnZXIubW9kdWxlTWFuYWdlcjtcbiAgICB9XG5cbiAgICBnZXQgY2hhcmFjdGVyKCk6IERuZEFjdG9yNWUge1xuICAgICAgICByZXR1cm4gZ2FtZT8uYWN0b3JzPy5nZXQodGhpcy5fYWN0b3JJZCkgYXMgRG5kQWN0b3I1ZTtcbiAgICB9XG5cbiAgICBnZXQgY2hhcmFjdGVySWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hY3RvcklkO1xuICAgIH1cblxuICAgIHNldCBjaGFyYWN0ZXJJZChpZDogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuX2FjdG9ySWQgPSBpZDtcbiAgICB9XG5cbiAgICBnZXQgd2VhcG9uKCk6IERuZEl0ZW01ZSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNoYXJhY3Rlci5pdGVtcy5nZXQodGhpcy5fd2VhcG9uSWQpIGFzIERuZEl0ZW01ZTtcbiAgICB9XG5cbiAgICBnZXQgd2VhcG9uSWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl93ZWFwb25JZDtcbiAgICB9XG5cbiAgICBzZXQgd2VhcG9uSWQoaWQ6IHN0cmluZykge1xuICAgICAgICB0aGlzLl93ZWFwb25JZCA9IGlkO1xuICAgIH1cblxuICAgIGdldCBsb2Fkb3V0KCkge1xuICAgICAgICBjb25zdCByZWxvYWRhYmxlV2VhcG9uID0gdGhpcy53ZWFwb247XG4gICAgICAgIGNvbnN0IG1heFNob3RzID0gcGFyc2VJbnQocmVsb2FkYWJsZVdlYXBvbi5zeXN0ZW0udXNlcy5tYXgpO1xuICAgICAgICBjb25zdCBjdXJyZW50TG9hZG91dCA9XG4gICAgICAgICAgICAocmVsb2FkYWJsZVdlYXBvbi5nZXRGbGFnKFxuICAgICAgICAgICAgICAgIHRoaXMubW9kdWxlTWFuYWdlci5pZCxcbiAgICAgICAgICAgICAgICAnY2hhbWJlcmVkJ1xuICAgICAgICAgICAgKSBhcyBzdHJpbmdbXSkgfHwgbmV3IEFycmF5KG1heFNob3RzKS5maWxsKCdFbXB0eScpO1xuXG4gICAgICAgIGlmIChjdXJyZW50TG9hZG91dC5sZW5ndGggPCBtYXhTaG90cykge1xuICAgICAgICAgICAgY29uc3QgbWlzc2luZyA9IG1heFNob3RzIC0gY3VycmVudExvYWRvdXQubGVuZ3RoO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBtaXNzaW5nOyBpKyspIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50TG9hZG91dC5wdXNoKCdFbXB0eScpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGN1cnJlbnRMb2Fkb3V0O1xuICAgIH1cblxuICAgIGdldCBmaXJlZCgpIHtcbiAgICAgICAgY29uc3QgcmVsb2FkYWJsZVdlYXBvbiA9IHRoaXMud2VhcG9uO1xuICAgICAgICBjb25zdCBtYXhTaG90cyA9IHBhcnNlSW50KHJlbG9hZGFibGVXZWFwb24uc3lzdGVtLnVzZXMubWF4KTtcbiAgICAgICAgY29uc3QgZmlyZWQgPVxuICAgICAgICAgICAgKHJlbG9hZGFibGVXZWFwb24uZ2V0RmxhZyhcbiAgICAgICAgICAgICAgICB0aGlzLm1vZHVsZU1hbmFnZXIuaWQsXG4gICAgICAgICAgICAgICAgJ2ZpcmVkJ1xuICAgICAgICAgICAgKSBhcyBzdHJpbmdbXSkgfHwgbmV3IEFycmF5KG1heFNob3RzKS5maWxsKCdFbXB0eScpO1xuXG4gICAgICAgIGlmIChmaXJlZC5sZW5ndGggPCBtYXhTaG90cykge1xuICAgICAgICAgICAgY29uc3QgbWlzc2luZyA9IG1heFNob3RzIC0gZmlyZWQubGVuZ3RoO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBtaXNzaW5nOyBpKyspIHtcbiAgICAgICAgICAgICAgICBmaXJlZC5wdXNoKCdFbXB0eScpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZpcmVkO1xuICAgIH1cblxuICAgIGFtbXVuaXRpb24oaXRlbXM6IENvbGxlY3Rpb248SXRlbTVlPiwgZXF1aXBwZWQ6IGJvb2xlYW4gPSBmYWxzZSk6IEl0ZW01ZVtdIHtcbiAgICAgICAgcmV0dXJuIGl0ZW1zLmZpbHRlcigoaXRlbTogSXRlbTVlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBnYW1lU3lzdGVtID0gKGl0ZW0gYXMgRG5kSXRlbTVlKS5zeXN0ZW07XG4gICAgICAgICAgICBpZiAoZXF1aXBwZWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICBpdGVtLnR5cGUgPT0gJ2NvbnN1bWFibGUnICYmXG4gICAgICAgICAgICAgICAgICAgIGdhbWVTeXN0ZW0udHlwZS5zdWJ0eXBlID09ICdmaXJlYXJtQnVsbGV0JyAmJlxuICAgICAgICAgICAgICAgICAgICBnYW1lU3lzdGVtLmVxdWlwcGVkXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgaXRlbS50eXBlID09ICdjb25zdW1hYmxlJyAmJlxuICAgICAgICAgICAgICAgIGdhbWVTeXN0ZW0udHlwZS5zdWJ0eXBlID09ICdmaXJlYXJtQnVsbGV0J1xuICAgICAgICAgICAgKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgaW5pdCgpIHt9XG5cbiAgICB0cmFuc2xhdGUoa2V5OiBzdHJpbmcsIG9wdHM/OiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9LCBmb3JtYXQ/OiBib29sZWFuKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1vZHVsZU1hbmFnZXIudWlNYW5hZ2VyLmdldExvY2FsaXplZFR4dChrZXksIG9wdHMsIGZvcm1hdCk7XG4gICAgfVxuXG4gICAgdG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiAnY2xhc3MgQmFzZUZlYXR1cmUnO1xuICAgIH1cbn1cbiIsImltcG9ydCBGZWF0dXJlTWFuYWdlciBmcm9tICcuLi9tYW5hZ2Vycy9GZWF0dXJlTWFuYWdlcic7XG5pbXBvcnQgQmFzZUZlYXR1cmUgZnJvbSAnLi9CYXNlRmVhdHVyZSc7XG5cbmV4cG9ydCBjbGFzcyBOZXh0Um91bmRGZWF0dXJlIGV4dGVuZHMgQmFzZUZlYXR1cmUge1xuICAgIGNvbnN0cnVjdG9yKGZlYXR1cmVNYW5hZ2VyOiBGZWF0dXJlTWFuYWdlcikge1xuICAgICAgICBzdXBlcihmZWF0dXJlTWFuYWdlcik7XG4gICAgfVxuXG4gICAgaW5pdCgpIHtcbiAgICAgICAgSG9va3Mub24oJ2RuZDVlLnByZVVzZUFjdGl2aXR5JywgdGhpcy5vblVzZUFjdGl2aXR5LmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIG9uVXNlQWN0aXZpdHkoYWN0aXZpdHk6IGFueSkge1xuICAgICAgICBpZiAoYWN0aXZpdHkudHlwZSA9PT0gJ3V0aWxpdHknICYmIGFjdGl2aXR5Lm5hbWUgPT0gJ05leHQgUm91bmQnKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnV2VhcG9uIFJlbG9hZCB8IFRyaWdnZXJlZCBOZXh0IFJvdW5kJyk7XG5cbiAgICAgICAgICAgIHRoaXMuY2hhcmFjdGVySWQgPSBhY3Rpdml0eS5hY3Rvci5pZDtcbiAgICAgICAgICAgIHRoaXMud2VhcG9uSWQgPSBhY3Rpdml0eS5pdGVtLmlkO1xuICAgICAgICAgICAgdGhpcy5uZXh0Um91bmQoKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBhc3luYyBuZXh0Um91bmQoKSB7XG4gICAgICAgIGNvbnN0IG5leHRSb3VuZCA9IHRoaXMubG9hZG91dFswXTtcbiAgICAgICAgY29uc3QgYWN0b3IgPSB0aGlzLmNoYXJhY3RlcjtcblxuICAgICAgICAvLyBOb3RpZnkgdGhlIHVzZXIgd2hhdCB0aGUgbmV4dCByb3VuZCBpc1xuICAgICAgICBjb25zdCBodG1sVGVtcGxhdGUgPSBhd2FpdCAoXG4gICAgICAgICAgICBmb3VuZHJ5LmFwcGxpY2F0aW9ucyBhcyBhbnlcbiAgICAgICAgKS5oYW5kbGViYXJzLnJlbmRlclRlbXBsYXRlKFxuICAgICAgICAgICAgJ21vZHVsZXMvZnZ0dC13ZWFwb24tcmVsb2FkL3RlbXBsYXRlcy9hbW1vUmVmdW5kTm90aWNlVGVtcGxhdGUuaGJzJyxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBpdGVtOiB7XG4gICAgICAgICAgICAgICAgICAgIGltZzogJ21vZHVsZXMvZnZ0dC13ZWFwb24tcmVsb2FkL2Fzc2V0cy9pY29ucy9idWxsZXRzX2J3X2ljb24ucG5nJyxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogbmV4dFJvdW5kLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IHRoaXMudHJhbnNsYXRlKFxuICAgICAgICAgICAgICAgICAgICAnV0VBUE9OX1JFTE9BRC5GZWF0dXJlcy5OZXh0Um91bmQuRGVzY3JpcHRpb24nLFxuICAgICAgICAgICAgICAgICAgICB7IGJ1bGxldDogbmV4dFJvdW5kLCB3ZWFwb246IHRoaXMud2VhcG9uLm5hbWUgfSxcbiAgICAgICAgICAgICAgICAgICAgdHJ1ZVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgdGl0bGU6IHRoaXMudHJhbnNsYXRlKCdXRUFQT05fUkVMT0FELkZlYXR1cmVzLk5leHRSb3VuZC5UaXRsZScpLFxuICAgICAgICAgICAgfVxuICAgICAgICApO1xuICAgICAgICB0aGlzLm1vZHVsZU1hbmFnZXIudWlNYW5hZ2VyLnNlbmRDaGF0KFxuICAgICAgICAgICAgYWN0b3IsXG4gICAgICAgICAgICBodG1sVGVtcGxhdGUsXG4gICAgICAgICAgICB1bmRlZmluZWQsXG4gICAgICAgICAgICB1bmRlZmluZWQsXG4gICAgICAgICAgICBbYWN0b3IuaWRdLFxuICAgICAgICAgICAgQ09OU1QuQ0hBVF9NRVNTQUdFX1RZUEVTLldISVNQRVJcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICB0b1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuICdjbGFzcyBOZXh0Um91bmRGZWF0dXJlJztcbiAgICB9XG59XG4iLCJpbXBvcnQgRGlhbG9nVjIgZnJvbSAnQGxlYWd1ZS1vZi1mb3VuZHJ5LWRldmVsb3BlcnMvZm91bmRyeS12dHQtdHlwZXMvc3JjL2ZvdW5kcnkvY2xpZW50LWVzbS9hcHBsaWNhdGlvbnMvYXBpL2RpYWxvZy5tanMnO1xuaW1wb3J0IEZlYXR1cmVNYW5hZ2VyIGZyb20gJy4uL21hbmFnZXJzL0ZlYXR1cmVNYW5hZ2VyJztcbmltcG9ydCB7IERuZEFjdG9yNWUsIERuZEl0ZW01ZSB9IGZyb20gJy4uL3R5cGVzL2RuZC50eXBlcyc7XG5pbXBvcnQgQmFzZUZlYXR1cmUgZnJvbSAnLi9CYXNlRmVhdHVyZSc7XG5cbmludGVyZmFjZSBBbW1vSXRlbU9wdGlvbiB7XG4gICAgbmFtZTogc3RyaW5nO1xuICAgIHZhbHVlOiBzdHJpbmc7XG4gICAgY291bnQ6IG51bWJlcjtcbiAgICBlcXVpcHBlZDogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGNsYXNzIFJlbG9hZEZlYXR1cmUgZXh0ZW5kcyBCYXNlRmVhdHVyZSB7XG4gICAgcHJpdmF0ZSBfaG9va0lkOiBudW1iZXI7XG4gICAgcHJpdmF0ZSBfaGFuZGxlQ2hvaWNlRGlhbG9nQ2xvc2U6IGJvb2xlYW47XG5cbiAgICBjb25zdHJ1Y3RvcihmZWF0dXJlTWFuYWdlcjogRmVhdHVyZU1hbmFnZXIpIHtcbiAgICAgICAgc3VwZXIoZmVhdHVyZU1hbmFnZXIpO1xuICAgICAgICB0aGlzLl9ob29rSWQgPSAtMTtcbiAgICAgICAgdGhpcy5faGFuZGxlQ2hvaWNlRGlhbG9nQ2xvc2UgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBpbml0KCkge1xuICAgICAgICBIb29rcy5vbignZG5kNWUucHJlVXNlQWN0aXZpdHknLCB0aGlzLm9uVXNlQWN0aXZpdHkuYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgb25Vc2VBY3Rpdml0eShhY3Rpdml0eTogYW55KSB7XG4gICAgICAgIGlmIChhY3Rpdml0eS50eXBlID09PSAndXRpbGl0eScgJiYgYWN0aXZpdHkubmFtZSA9PSAnUmVsb2FkJykge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1dlYXBvbiBSZWxvYWQgfCBUcmlnZ2VyZWQgUmVsb2FkJyk7XG5cbiAgICAgICAgICAgIHRoaXMuY2hhcmFjdGVySWQgPSBhY3Rpdml0eS5hY3Rvci5pZDtcbiAgICAgICAgICAgIHRoaXMud2VhcG9uSWQgPSBhY3Rpdml0eS5pdGVtLmlkO1xuICAgICAgICAgICAgdGhpcy53ZWFwb25SZWxvYWQoKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICB3ZWFwb25SZWxvYWQocmVmdW5kQW1tbzogYm9vbGVhbiA9IHRydWUpIHtcbiAgICAgICAgY29uc3QgaXRlbXMgPSB0aGlzLmNoYXJhY3Rlcj8uaXRlbXM7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRMb2Fkb3V0ID0gdGhpcy5sb2Fkb3V0O1xuICAgICAgICBjb25zdCBpbnZlbnRvcnlBbW11bml0aW9uID0gdGhpcy5hbW11bml0aW9uKGl0ZW1zKSBhcyBEbmRJdGVtNWVbXTtcbiAgICAgICAgbGV0IGFtbXVuaXRpb25DaG9pY2VzOiBBbW1vSXRlbU9wdGlvbltdID0gW107XG5cbiAgICAgICAgaWYgKHJlZnVuZEFtbW8pIHtcbiAgICAgICAgICAgIGFtbXVuaXRpb25DaG9pY2VzID0gdGhpcy5yZWZ1bmRDaGFtYmVyZWRBbW1vKGludmVudG9yeUFtbXVuaXRpb24pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYW1tdW5pdGlvbkNob2ljZXMgPSBpbnZlbnRvcnlBbW11bml0aW9uLm1hcChcbiAgICAgICAgICAgICAgICAoYW1tbzogRG5kSXRlbTVlKTogQW1tb0l0ZW1PcHRpb24gPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogYW1tby5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGFtbW8ubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50OiBhbW1vLnN5c3RlbS5xdWFudGl0eSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVxdWlwcGVkOiBhbW1vLnN5c3RlbS5lcXVpcHBlZCxcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgY2hlY2tFcXVpcHBlZCA9IGdhbWUuc2V0dGluZ3MuZ2V0KFxuICAgICAgICAgICAgdGhpcy5tb2R1bGVNYW5hZ2VyLmlkLFxuICAgICAgICAgICAgJ2ZpbHRlckFtbXVuaXRpb25CeUVxdWlwcGVkJ1xuICAgICAgICApIGFzIGJvb2xlYW47XG5cbiAgICAgICAgdGhpcy5jaG9vc2VBbW11bml0aW9uKFxuICAgICAgICAgICAgYW1tdW5pdGlvbkNob2ljZXMuZmlsdGVyKChhbW1vSXRlbTogQW1tb0l0ZW1PcHRpb24pID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoYW1tb0l0ZW0uY291bnQgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgIChjaGVja0VxdWlwcGVkICYmIGFtbW9JdGVtLmVxdWlwcGVkKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgIWNoZWNrRXF1aXBwZWRcbiAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIGN1cnJlbnRMb2Fkb3V0XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcmVmdW5kQ2hhbWJlcmVkQW1tbyhpbnZlbnRvcnlBbW11bml0aW9uOiBEbmRJdGVtNWVbXSk6IEFtbW9JdGVtT3B0aW9uW10ge1xuICAgICAgICBjb25zdCBsb2Fkb3V0Q291bnRzID0gdGhpcy5nZXRMb2Fkb3V0Q291bnRzKHRoaXMubG9hZG91dCk7XG4gICAgICAgIGNvbnN0IGF2YWlsYWJsZUFtbXVuaXRpb246IEFtbW9JdGVtT3B0aW9uW10gPSBbXTtcbiAgICAgICAgaW52ZW50b3J5QW1tdW5pdGlvbi5mb3JFYWNoKChhbW1vOiBEbmRJdGVtNWUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5hbWUgPSBhbW1vLm5hbWU7XG4gICAgICAgICAgICBjb25zdCBhbW1vSW5mbzogQW1tb0l0ZW1PcHRpb24gPSB7XG4gICAgICAgICAgICAgICAgbmFtZTogYW1tby5uYW1lLFxuICAgICAgICAgICAgICAgIHZhbHVlOiBhbW1vLm5hbWUsXG4gICAgICAgICAgICAgICAgY291bnQ6IGFtbW8uc3lzdGVtLnF1YW50aXR5LFxuICAgICAgICAgICAgICAgIGVxdWlwcGVkOiBhbW1vLnN5c3RlbS5lcXVpcHBlZCxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpZiAobG9hZG91dENvdW50c1tuYW1lXSkge1xuICAgICAgICAgICAgICAgIGFtbW9JbmZvLmNvdW50ID0gYW1tby5zeXN0ZW0ucXVhbnRpdHkgKyBsb2Fkb3V0Q291bnRzW25hbWVdO1xuICAgICAgICAgICAgICAgIGFtbW8udXBkYXRlKHtcbiAgICAgICAgICAgICAgICAgICAgJ3N5c3RlbS5xdWFudGl0eSc6IGFtbW9JbmZvLmNvdW50LFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYXZhaWxhYmxlQW1tdW5pdGlvbi5wdXNoKGFtbW9JbmZvKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBhdmFpbGFibGVBbW11bml0aW9uO1xuICAgIH1cblxuICAgIGFzeW5jIGNob29zZUFtbXVuaXRpb24oXG4gICAgICAgIGFtbW9PcHRpb25zOiBBbW1vSXRlbU9wdGlvbltdLFxuICAgICAgICBjdXJyZW50TG9hZG91dDogc3RyaW5nW11cbiAgICApIHtcbiAgICAgICAgY29uc3QgZGlhbG9nQ29udGVudCA9IGF3YWl0IChcbiAgICAgICAgICAgIGZvdW5kcnkuYXBwbGljYXRpb25zIGFzIGFueVxuICAgICAgICApLmhhbmRsZWJhcnMucmVuZGVyVGVtcGxhdGUoXG4gICAgICAgICAgICAnbW9kdWxlcy9mdnR0LXdlYXBvbi1yZWxvYWQvdGVtcGxhdGVzL2FtbW9TZWxlY3Rpb25EaWFsb2dUZW1wbGF0ZS5oYnMnLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGxvYWRvdXRTbG90czogbmV3IEFycmF5KFxuICAgICAgICAgICAgICAgICAgICBwYXJzZUludCh0aGlzLndlYXBvbi5zeXN0ZW0udXNlcy5tYXgpXG4gICAgICAgICAgICAgICAgKS5maWxsKCdFbXB0eScpLFxuICAgICAgICAgICAgICAgIGFtbW9PcHRpb25zLFxuICAgICAgICAgICAgfVxuICAgICAgICApO1xuXG4gICAgICAgIGNvbnN0IGRpYWxvZ0J1dHRvbnMgPSBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYWN0aW9uOiAnbG9hZCcsXG4gICAgICAgICAgICAgICAgbGFiZWw6IHRoaXMudHJhbnNsYXRlKFxuICAgICAgICAgICAgICAgICAgICAnV0VBUE9OX1JFTE9BRC5GZWF0dXJlcy5SZWxvYWQuQW1tdW5pdGlvbi5DaG9pY2VEaWFsb2dCdXR0b25UeHRMb2FkJ1xuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgY2FsbGJhY2s6IChfZXZlbnQsIGJ1dHRvbikgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9oYW5kbGVDaG9pY2VEaWFsb2dDbG9zZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBsb2Fkb3V0OiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGJ1dHRvbi5mb3JtLmVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBlbG0gPSBidXR0b24uZm9ybS5lbGVtZW50cy5pdGVtKGkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVsbS5uYW1lID09ICdhbW1vLXNlbGVjdCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2Fkb3V0LnB1c2goZWxtLnZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4geyBsb2Fkb3V0LCByZWxvYWRDYW5jZWxlZDogZmFsc2UgfTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBhY3Rpb246ICdjYW5jZWwnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiB0aGlzLnRyYW5zbGF0ZShcbiAgICAgICAgICAgICAgICAgICAgJ1dFQVBPTl9SRUxPQUQuRmVhdHVyZXMuUmVsb2FkLkFtbXVuaXRpb24uQ2hvaWNlRGlhbG9nQnV0dG9uVHh0Q2FuY2VsJ1xuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgY2FsbGJhY2s6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5faGFuZGxlQ2hvaWNlRGlhbG9nQ2xvc2UgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgbG9hZG91dDogY3VycmVudExvYWRvdXQsIHJlbG9hZENhbmNlbGVkOiB0cnVlIH07XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIF07XG5cbiAgICAgICAgdGhpcy5faGFuZGxlQ2hvaWNlRGlhbG9nQ2xvc2UgPSB0cnVlO1xuICAgICAgICB0aGlzLl9ob29rSWQgPSBIb29rcy5vbignY2xvc2VEaWFsb2dWMicsIChkaWFsb2dWMjogRGlhbG9nVjIpID0+IHtcbiAgICAgICAgICAgIGlmIChkaWFsb2dWMi5pZCA9PT0gJ2FtbW8tY2hvaWNlLWRpYWxvZycpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm9uQ2xvc2VDaG9pY2VEaWFsb2coY3VycmVudExvYWRvdXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLm1vZHVsZU1hbmFnZXIudWlNYW5hZ2VyXG4gICAgICAgICAgICAuYnVpbGREaWFsb2coXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICB0aXRsZTogdGhpcy50cmFuc2xhdGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAnV0VBUE9OX1JFTE9BRC5GZWF0dXJlcy5SZWxvYWQuQW1tdW5pdGlvbi5DaG9pY2VEaWFsb2dUaXRsZSdcbiAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgY29udGVudDogZGlhbG9nQ29udGVudCxcbiAgICAgICAgICAgICAgICAgICAgYnV0dG9uczogZGlhbG9nQnV0dG9ucyxcbiAgICAgICAgICAgICAgICAgICAgb25TdWJtaXQ6ICh7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2Fkb3V0LFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVsb2FkQ2FuY2VsZWQsXG4gICAgICAgICAgICAgICAgICAgIH06IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvYWRvdXQ6IHN0cmluZ1tdO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVsb2FkQ2FuY2VsZWQ6IGJvb2xlYW47XG4gICAgICAgICAgICAgICAgICAgIH0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVsb2FkUmVsb2FkYWJsZVdlYXBvbihsb2Fkb3V0LCByZWxvYWRDYW5jZWxlZCk7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAnYW1tby1jaG9pY2UtZGlhbG9nJ1xuICAgICAgICAgICAgKVxuICAgICAgICAgICAgLnJlbmRlcih7IGZvcmNlOiB0cnVlIH0pO1xuICAgIH1cblxuICAgIG9uQ2xvc2VDaG9pY2VEaWFsb2cobG9hZG91dDogc3RyaW5nW10pIHtcbiAgICAgICAgSG9va3Mub2ZmKCdjbG9zZURpYWxvZ1YyJywgdGhpcy5faG9va0lkKTtcbiAgICAgICAgdGhpcy5faG9va0lkID0gLTE7XG5cbiAgICAgICAgaWYgKHRoaXMuX2hhbmRsZUNob2ljZURpYWxvZ0Nsb3NlKSB7XG4gICAgICAgICAgICB0aGlzLl9oYW5kbGVDaG9pY2VEaWFsb2dDbG9zZSA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5yZWxvYWRSZWxvYWRhYmxlV2VhcG9uKGxvYWRvdXQsIHRydWUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgYXN5bmMgcmVsb2FkUmVsb2FkYWJsZVdlYXBvbihcbiAgICAgICAgbG9hZG91dDogc3RyaW5nW10sXG4gICAgICAgIHJlbG9hZENhbmNlbGVkOiBib29sZWFuID0gZmFsc2VcbiAgICApIHtcbiAgICAgICAgY29uc3QgcmVsb2FkYWJsZVdlYXBvbiA9IHRoaXMud2VhcG9uO1xuICAgICAgICBjb25zdCBhbW1vQ291bnRzID0gdGhpcy5nZXRMb2Fkb3V0Q291bnRzKGxvYWRvdXQpO1xuXG4gICAgICAgIGlmICh0aGlzLnJlbW92ZUxvYWRvdXQoYW1tb0NvdW50cykpIHtcbiAgICAgICAgICAgIC8vIFVwZGF0ZSB0aGUgcmVsb2FkYWJsZVdlYXBvbiB1c2VzXG4gICAgICAgICAgICBsZXQgcXR5ID0gMDtcbiAgICAgICAgICAgIGlmIChhbW1vQ291bnRzWydFbXB0eSddID4gMCkge1xuICAgICAgICAgICAgICAgIC8vIEFkanVzdCBzcGVudCB1c2VzIGJ5IHRoZSBudW1iZXIgb2YgRW1wdHkgc2xvdHNcbiAgICAgICAgICAgICAgICBxdHkgKz0gYW1tb0NvdW50c1snRW1wdHknXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGF3YWl0IHJlbG9hZGFibGVXZWFwb24udXBkYXRlKHtcbiAgICAgICAgICAgICAgICAnc3lzdGVtLnVzZXMuc3BlbnQnOiBxdHksXG4gICAgICAgICAgICAgICAgJ3N5c3RlbS51c2VzLnZhbHVlJzpcbiAgICAgICAgICAgICAgICAgICAgcGFyc2VJbnQocmVsb2FkYWJsZVdlYXBvbi5zeXN0ZW0udXNlcy5tYXgpIC0gcXR5LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBhd2FpdCByZWxvYWRhYmxlV2VhcG9uLnNldEZsYWcoXG4gICAgICAgICAgICAgICAgdGhpcy5tb2R1bGVNYW5hZ2VyLmlkLFxuICAgICAgICAgICAgICAgICdjaGFtYmVyZWQnLFxuICAgICAgICAgICAgICAgIGxvYWRvdXRcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBhd2FpdCByZWxvYWRhYmxlV2VhcG9uLnNldEZsYWcoXG4gICAgICAgICAgICAgICAgdGhpcy5tb2R1bGVNYW5hZ2VyLmlkLFxuICAgICAgICAgICAgICAgICdmaXJlZCcsXG4gICAgICAgICAgICAgICAgbmV3IEFycmF5KHBhcnNlSW50KHRoaXMud2VhcG9uLnN5c3RlbS51c2VzLm1heCkpLmZpbGwoJ0VtcHR5JylcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIGNvbnN0IGh0bWxUZW1wbGF0ZSA9IGF3YWl0IChcbiAgICAgICAgICAgICAgICBmb3VuZHJ5LmFwcGxpY2F0aW9ucyBhcyBhbnlcbiAgICAgICAgICAgICkuaGFuZGxlYmFycy5yZW5kZXJUZW1wbGF0ZShcbiAgICAgICAgICAgICAgICAnbW9kdWxlcy9mdnR0LXdlYXBvbi1yZWxvYWQvdGVtcGxhdGVzL3JlbG9hZGFibGVXZWFwb25SZWxvYWRUZW1wbGF0ZS5oYnMnLFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbToge1xuICAgICAgICAgICAgICAgICAgICAgICAgaW1nOiByZWxvYWRhYmxlV2VhcG9uLmltZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHJlbG9hZGFibGVXZWFwb24ubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgZmxhdm9yOiB0aGlzLnRyYW5zbGF0ZShcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbG9hZENhbmNlbGVkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPyAnV0VBUE9OX1JFTE9BRC5GZWF0dXJlcy5SZWxvYWQuV2VhcG9uLldlYXBvblJlbG9hZGVkQ2hhdEZsYXZvckNhbmNlbGVkJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogJ1dFQVBPTl9SRUxPQUQuRmVhdHVyZXMuUmVsb2FkLldlYXBvbi5XZWFwb25SZWxvYWRlZENoYXRGbGF2b3InXG4gICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiB0aGlzLnRyYW5zbGF0ZShcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbG9hZENhbmNlbGVkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPyAnV0VBUE9OX1JFTE9BRC5GZWF0dXJlcy5SZWxvYWQuV2VhcG9uLldlYXBvblJlbG9hZGVkQ2hhdE1zZ0NhbmNlbGVkJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogJ1dFQVBPTl9SRUxPQUQuRmVhdHVyZXMuUmVsb2FkLldlYXBvbi5XZWFwb25SZWxvYWRlZENoYXRNc2cnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyByZWxvYWRhYmxlV2VhcG9uOiByZWxvYWRhYmxlV2VhcG9uLm5hbWUgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRydWVcbiAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgbG9hZG91dDogbG9hZG91dCxcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgLy8gTm90aWZ5IHRoZSBwZWVwc1xuICAgICAgICAgICAgdGhpcy5tb2R1bGVNYW5hZ2VyLnVpTWFuYWdlci5zZW5kQ2hhdCh0aGlzLmNoYXJhY3RlciwgaHRtbFRlbXBsYXRlKTtcbiAgICAgICAgICAgIHRoaXMuY2hhcmFjdGVySWQgPSAnJztcbiAgICAgICAgICAgIHRoaXMud2VhcG9uSWQgPSAnJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMud2VhcG9uUmVsb2FkKGZhbHNlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlbW92ZUxvYWRvdXQoY291bnRzOiB7IFtrZXk6IHN0cmluZ106IG51bWJlciB9KTogYm9vbGVhbiB7XG4gICAgICAgIGxldCBhbW11bml0aW9uQXZhaWxhYmxlID0gdHJ1ZTtcbiAgICAgICAgY29uc3QgaW52ZW50b3J5QW1tdW5pdGlvbiA9IHRoaXMuYW1tdW5pdGlvbihcbiAgICAgICAgICAgIHRoaXMuY2hhcmFjdGVyPy5pdGVtc1xuICAgICAgICApIGFzIERuZEl0ZW01ZVtdO1xuICAgICAgICBpbnZlbnRvcnlBbW11bml0aW9uLmZvckVhY2goKGFtbW86IERuZEl0ZW01ZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbmFtZSA9IGFtbW8ubmFtZTtcbiAgICAgICAgICAgIGNvbnN0IHF0eSA9IGFtbW8uc3lzdGVtLnF1YW50aXR5IC0gY291bnRzW25hbWVdO1xuXG4gICAgICAgICAgICAvLyBJZiBhbnkgYnVsbGV0IGlzIGFkZGVkIGJleW9uZCB0aGUgcXVhbnRpdHkgdGhlIHBsYXllciBhY3R1YWxseSBoYXMgdGhlbiB0aHJvdyBhbiBlcnJvciBhbmQgcmV0dXJuIGZhbHNlXG4gICAgICAgICAgICBpZiAocXR5IDwgMCkge1xuICAgICAgICAgICAgICAgIHRoaXMubW9kdWxlTWFuYWdlci51aU1hbmFnZXIudWlOb3RpZmljYXRpb24oXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudHJhbnNsYXRlKFxuICAgICAgICAgICAgICAgICAgICAgICAgJ1dFQVBPTl9SRUxPQUQuRmVhdHVyZXMuUmVsb2FkLldlYXBvbi5Mb2FkaW5nRXJyb3JNc2cnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBuYW1lOiBhbW1vLm5hbWUgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRydWVcbiAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgJ2Vycm9yJ1xuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgYW1tdW5pdGlvbkF2YWlsYWJsZSA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoYW1tdW5pdGlvbkF2YWlsYWJsZSkge1xuICAgICAgICAgICAgaW52ZW50b3J5QW1tdW5pdGlvbi5mb3JFYWNoKGFzeW5jIChhbW1vOiBEbmRJdGVtNWUpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBuYW1lID0gYW1tby5uYW1lO1xuICAgICAgICAgICAgICAgIGlmIChjb3VudHNbbmFtZV0pIHtcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgYW1tby51cGRhdGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgJ3N5c3RlbS5xdWFudGl0eSc6IGFtbW8uc3lzdGVtLnF1YW50aXR5IC0gY291bnRzW25hbWVdLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBhbW11bml0aW9uQXZhaWxhYmxlO1xuICAgIH1cblxuICAgIGFzeW5jIG9uUmVsb2FkQ2FsbGJhY2soYWN0b3I6IERuZEFjdG9yNWUsIHdlYXBvbjogRG5kSXRlbTVlKSB7XG4gICAgICAgIHRoaXMuY2hhcmFjdGVySWQgPSBhY3Rvci5pZDtcbiAgICAgICAgdGhpcy53ZWFwb25JZCA9IHdlYXBvbi5pZDtcblxuICAgICAgICB0aGlzLndlYXBvblJlbG9hZCgpO1xuICAgIH1cblxuICAgIGdldExvYWRvdXRDb3VudHMoY3VycmVudExvYWRvdXQ6IHN0cmluZ1tdKToge1xuICAgICAgICBba2V5OiBzdHJpbmddOiBudW1iZXI7XG4gICAgfSB7XG4gICAgICAgIGNvbnN0IGxvYWRvdXQgPSB7fTtcbiAgICAgICAgY3VycmVudExvYWRvdXQuZm9yRWFjaCgoYW1tbzogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICBpZiAoIWxvYWRvdXRbYW1tb10pIGxvYWRvdXRbYW1tb10gPSAwO1xuICAgICAgICAgICAgbG9hZG91dFthbW1vXSA9IGxvYWRvdXRbYW1tb10gKyAxO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGxvYWRvdXQ7XG4gICAgfVxuXG4gICAgdG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiAnY2xhc3MgUmVsb2FkRmVhdHVyZSc7XG4gICAgfVxufVxuIiwiaW1wb3J0IEZlYXR1cmVNYW5hZ2VyIGZyb20gJy4uL21hbmFnZXJzL0ZlYXR1cmVNYW5hZ2VyJztcblxuaW1wb3J0IHtcbiAgICBEbmRBY3RvcjVlLFxuICAgIERuZEl0ZW01ZSxcbiAgICBEbmREMjBSb2xsLFxuICAgIERuZEF0dGFja0V2ZW50LFxufSBmcm9tICcuLi90eXBlcy9kbmQudHlwZXMnO1xuXG5pbXBvcnQgeyBBY3Rpdml0eUNhcmRDaGF0VHlwZSB9IGZyb20gJy4uL3R5cGVzL2NoYXQudHlwZXMnO1xuaW1wb3J0IEJhc2VGZWF0dXJlIGZyb20gJy4vQmFzZUZlYXR1cmUnO1xuXG5leHBvcnQgY2xhc3MgUmVsb2FkYWJsZVdlYXBvbkF0dGFja0ZlYXR1cmUgZXh0ZW5kcyBCYXNlRmVhdHVyZSB7XG4gICAgcHJpdmF0ZSBfbmV4dFJvdW5kOiB7XG4gICAgICAgIGlkOiBzdHJpbmc7XG4gICAgICAgIHR5cGU6IHN0cmluZztcbiAgICB9O1xuICAgIHByaXZhdGUgX2hvb2tJZDogbnVtYmVyO1xuXG4gICAgY29uc3RydWN0b3IoZmVhdHVyZU1hbmFnZXI6IEZlYXR1cmVNYW5hZ2VyKSB7XG4gICAgICAgIHN1cGVyKGZlYXR1cmVNYW5hZ2VyKTtcbiAgICAgICAgdGhpcy5fbmV4dFJvdW5kID0geyBpZDogJycsIHR5cGU6ICcnIH07XG4gICAgICAgIHRoaXMuX2hvb2tJZCA9IC0xO1xuICAgIH1cblxuICAgIGluaXQoKSB7XG4gICAgICAgIEhvb2tzLm9uKCdkbmQ1ZS5wb3N0Um9sbENvbmZpZ3VyYXRpb24nLCB0aGlzLm9uVXNlQWN0aXZpdHkuYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgb25Vc2VBY3Rpdml0eShkMjBSb2xsOiBEbmREMjBSb2xsW10sIGV2ZW50OiBEbmRBdHRhY2tFdmVudCkge1xuICAgICAgICBjb25zdCByb2xsID0gZDIwUm9sbFswXTtcbiAgICAgICAgY29uc3Qgd2VhcG9uRGF0YSA9IHJvbGw/LmRhdGE/Lml0ZW07XG4gICAgICAgIGlmICh3ZWFwb25EYXRhPy50eXBlPy5iYXNlSXRlbSAhPT0gJ3JlbG9hZGFibGVXZWFwb24nKSByZXR1cm47XG5cbiAgICAgICAgY29uc29sZS5sb2coJ1dlYXBvbiBSZWxvYWQgfCBUcmlnZ2VyZWQgQXR0YWNrJyk7XG4gICAgICAgIHRoaXMud2VhcG9uSWQgPSBldmVudC5zdWJqZWN0Lml0ZW0uaWQ7XG4gICAgICAgIHRoaXMuY2hhcmFjdGVySWQgPSBldmVudC5zdWJqZWN0LmFjdG9yLmlkO1xuXG4gICAgICAgIHJldHVybiB0aGlzLnJlbG9hZGFibGVXZWFwb25BdHRhY2soKTtcbiAgICB9XG5cbiAgICByZWxvYWRhYmxlV2VhcG9uQXR0YWNrKCkge1xuICAgICAgICBjb25zdCBidWxsZXQgPSB0aGlzLmdldE5leHRSb3VuZCgpO1xuXG4gICAgICAgIGlmIChidWxsZXQubmFtZSA9PSAnRW1wdHknKSB7XG4gICAgICAgICAgICB0aGlzLmRyeWZpcmVXZWFwb24oKTtcblxuICAgICAgICAgICAgLy8gU3RvcCB0aGUgYXR0YWNrIGlmIERyeWZpcmluZyB0aGUgd2VhcG9uXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9uZXh0Um91bmQgPSB7XG4gICAgICAgICAgICBpZDogYnVsbGV0LmlkLFxuICAgICAgICAgICAgdHlwZTogYnVsbGV0LnR5cGUsXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5faG9va0lkID0gSG9va3Mub24oXG4gICAgICAgICAgICAnZG5kNWUucmVuZGVyQ2hhdE1lc3NhZ2UnLFxuICAgICAgICAgICAgdGhpcy5vblJlbmRlckNoYXRNZXNzYWdlLmJpbmQodGhpcylcbiAgICAgICAgKTtcblxuICAgICAgICByZXR1cm4gdGhpcy5maXJlUm91bmQoYnVsbGV0KTtcbiAgICB9XG5cbiAgICBhc3luYyBvblJlbmRlckNoYXRNZXNzYWdlKG1lc3NhZ2UsIGh0bWwpIHtcbiAgICAgICAgY29uc3QgaXRlbUlkID0gbWVzc2FnZS5mbGFncy5kbmQ1ZT8uaXRlbS5pZDtcbiAgICAgICAgY29uc3QgaXRlbVR5cGUgPSBtZXNzYWdlLmZsYWdzLmRuZDVlPy5pdGVtLnR5cGU7XG4gICAgICAgIGlmIChcbiAgICAgICAgICAgIHRoaXMuX25leHRSb3VuZC5pZCA9PT0gaXRlbUlkICYmXG4gICAgICAgICAgICB0aGlzLl9uZXh0Um91bmQudHlwZSA9PT0gaXRlbVR5cGVcbiAgICAgICAgKSB7XG4gICAgICAgICAgICBIb29rcy5vZmYoJ2RuZDVlLnJlbmRlckNoYXRNZXNzYWdlJywgdGhpcy5faG9va0lkKTtcbiAgICAgICAgICAgIHRoaXMuX25leHRSb3VuZCA9IHsgaWQ6ICcnLCB0eXBlOiAnJyB9O1xuXG4gICAgICAgICAgICBjb25zdCBidWxsZXQgPSB0aGlzLmNoYXJhY3Rlci5pdGVtcy5nZXQoaXRlbUlkKSBhcyBEbmRJdGVtNWU7XG5cbiAgICAgICAgICAgIGNvbnN0IGFjdGl2YXRpb25DYXJkID0gaHRtbC5xdWVyeVNlbGVjdG9yKCcuYWN0aXZhdGlvbi1jYXJkJyk7XG4gICAgICAgICAgICBjb25zdCBpdGVtY2FyZCA9IGh0bWwucXVlcnlTZWxlY3RvcignLml0ZW0tY2FyZCcpO1xuICAgICAgICAgICAgY29uc3QgcGFyZW50RWxlbWVudCA9IGFjdGl2YXRpb25DYXJkIHx8IGl0ZW1jYXJkO1xuXG4gICAgICAgICAgICAvLyBHcmFiIG1vZHVsZSBjb25maWd1cmF0aW9uc1xuICAgICAgICAgICAgY29uc3QgY2hlY2tVbnN0YWJsZUFtbW8gPSBnYW1lLnNldHRpbmdzLmdldChcbiAgICAgICAgICAgICAgICB0aGlzLm1vZHVsZU1hbmFnZXIuaWQsXG4gICAgICAgICAgICAgICAgJ3Vuc3RhYmxlQW1tbydcbiAgICAgICAgICAgICkgYXMgYm9vbGVhbjtcblxuICAgICAgICAgICAgY29uc3QgY2hlY2tNaXNmaXJlID0gZ2FtZS5zZXR0aW5ncy5nZXQoXG4gICAgICAgICAgICAgICAgdGhpcy5tb2R1bGVNYW5hZ2VyLmlkLFxuICAgICAgICAgICAgICAgICd1c2VNaXNmaXJlcydcbiAgICAgICAgICAgICkgYXMgYm9vbGVhbjtcblxuICAgICAgICAgICAgY29uc3QgdW5zdGFibGVBbW1vRmFpbHVyZVRocmVzaG9sZCA9IGdhbWUuc2V0dGluZ3MuZ2V0KFxuICAgICAgICAgICAgICAgIHRoaXMubW9kdWxlTWFuYWdlci5pZCxcbiAgICAgICAgICAgICAgICAndW5zdGFibGVBbW1vRmFpbHVyZVRocmVzaGhvbGQnXG4gICAgICAgICAgICApIGFzIG51bWJlcjtcblxuICAgICAgICAgICAgLy8gQWRkIHRoZSBtaXNmaXJlIG1lc3NhZ2VcbiAgICAgICAgICAgIGlmIChjaGVja01pc2ZpcmUpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjcml0aWNhbEZhaWx1cmVNc2cgPVxuICAgICAgICAgICAgICAgICAgICBjaGVja1Vuc3RhYmxlQW1tbyAmJlxuICAgICAgICAgICAgICAgICAgICBidWxsZXQ/LnN5c3RlbS5wcm9wZXJ0aWVzLmZpbmQoKHByb3A6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHByb3AgPT09ICd1bnN0YWJsZSc7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICA/IHRoaXMudHJhbnNsYXRlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1dFQVBPTl9SRUxPQUQuRmVhdHVyZXMuUmVsb2FkYWJsZVdlYXBvbkF0dGFjay5NaXNmaXJlVW5zdGFibGUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBmYWlsdXJlOiBgJHt1bnN0YWJsZUFtbW9GYWlsdXJlVGhyZXNob2xkfWAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgOiB0aGlzLnRyYW5zbGF0ZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdXRUFQT05fUkVMT0FELkZlYXR1cmVzLlJlbG9hZGFibGVXZWFwb25BdHRhY2suTWlzZmlyZU5hdE9uZSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IGNhcmRDb250ZW50RWxlbWVudCA9XG4gICAgICAgICAgICAgICAgICAgIHBhcmVudEVsZW1lbnQucXVlcnlTZWxlY3RvcignLmNhcmQtY29udGVudCcpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHdyYXBwZXJFbGVtZW50ID1cbiAgICAgICAgICAgICAgICAgICAgY2FyZENvbnRlbnRFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy53cmFwcGVyJyk7XG4gICAgICAgICAgICAgICAgd3JhcHBlckVsZW1lbnQuaW5zZXJ0QWRqYWNlbnRIVE1MKFxuICAgICAgICAgICAgICAgICAgICAnYmVmb3JlZW5kJyxcbiAgICAgICAgICAgICAgICAgICAgYDxwPiR7Y3JpdGljYWxGYWlsdXJlTXNnfTwvcD5gXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gQWRkIGNhcmQgYnV0dG9uIGNvbnRhaW5lciBpZiBtaXNzaW5nXG4gICAgICAgICAgICBpZiAoaXRlbWNhcmQgJiYgIWFjdGl2YXRpb25DYXJkKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVmZXJlbmNlRWxlbWVudCA9XG4gICAgICAgICAgICAgICAgICAgIHBhcmVudEVsZW1lbnQucXVlcnlTZWxlY3RvcignLmNhcmQtaGVhZGVyJyk7XG4gICAgICAgICAgICAgICAgY29uc3QgYnV0dG9uQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICAgICAgYnV0dG9uQ29udGFpbmVyLmNsYXNzTmFtZSA9ICdjYXJkLWJ1dHRvbnMnO1xuICAgICAgICAgICAgICAgIHJlZmVyZW5jZUVsZW1lbnQuYWZ0ZXIoYnV0dG9uQ29udGFpbmVyKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgY2FyZEJ1dHRvbnNFbGVtZW50ID1cbiAgICAgICAgICAgICAgICBwYXJlbnRFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jYXJkLWJ1dHRvbnMnKTtcblxuICAgICAgICAgICAgLy8gQWRkIE1pc2ZpcmUgYnV0dG9uXG4gICAgICAgICAgICBpZiAoY2hlY2tNaXNmaXJlKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbWlzZmlyZUJ0biA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgICAgICAgICAgICAgIG1pc2ZpcmVCdG4ub25jbGljayA9IHRoaXMub25DbGlja01pc2ZpcmUuYmluZCh0aGlzKTtcbiAgICAgICAgICAgICAgICBtaXNmaXJlQnRuLmlubmVySFRNTCA9IGAke3RoaXMubWFrZUljb24oJ2ZhLWJ1cnN0Jyl9JHt0aGlzLnRyYW5zbGF0ZShcbiAgICAgICAgICAgICAgICAgICAgJ1dFQVBPTl9SRUxPQUQuRmVhdHVyZXMuUmVsb2FkYWJsZVdlYXBvbkF0dGFjay5NaXNmaXJlZEJ0blR4dCdcbiAgICAgICAgICAgICAgICApfWA7XG4gICAgICAgICAgICAgICAgY2FyZEJ1dHRvbnNFbGVtZW50LmFwcGVuZChtaXNmaXJlQnRuKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gQWRkIGFtbW8gcmVmdW5kIGJ1dHRvblxuICAgICAgICAgICAgY29uc3QgcmVmdW5kQnRuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAgICAgICByZWZ1bmRCdG4ub25jbGljayA9IHRoaXMub25DbGlja1JlZnVuZC5iaW5kKHRoaXMpO1xuICAgICAgICAgICAgcmVmdW5kQnRuLmlubmVySFRNTCA9IGAke3RoaXMubWFrZUljb24oJ2ZhLXVuZG8nKX0ke3RoaXMudHJhbnNsYXRlKFxuICAgICAgICAgICAgICAgICdXRUFQT05fUkVMT0FELkZlYXR1cmVzLlJlbG9hZGFibGVXZWFwb25BdHRhY2suUmVmdW5kQnRuVHh0J1xuICAgICAgICAgICAgKX1gO1xuICAgICAgICAgICAgY2FyZEJ1dHRvbnNFbGVtZW50LmFwcGVuZChyZWZ1bmRCdG4pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0TmV4dFJvdW5kKCk6IERuZEl0ZW01ZSB7XG4gICAgICAgIGNvbnN0IGNoYXJhY3RlciA9IHRoaXMuY2hhcmFjdGVyO1xuICAgICAgICBjb25zdCB3ZWFwb24gPSB0aGlzLndlYXBvbjtcblxuICAgICAgICBjb25zdCBsb2Fkb3V0ID0gdGhpcy5sb2Fkb3V0O1xuICAgICAgICBsb2Fkb3V0LnB1c2goJ0VtcHR5Jyk7XG4gICAgICAgIGNvbnN0IG5leHRSb3VuZCA9IGxvYWRvdXQuc2hpZnQoKTtcblxuICAgICAgICAvLyBSZW1vdmUgdGhlIGJ1bGxldCBmcm9tIHRoZSByZWxvYWRhYmxlV2VhcG9uIGFtbXVuaXRpb25cbiAgICAgICAgd2VhcG9uLnNldEZsYWcodGhpcy5tb2R1bGVNYW5hZ2VyLmlkLCAnY2hhbWJlcmVkJywgbG9hZG91dCk7XG5cbiAgICAgICAgY29uc3QgaW52ZW50b3J5QW1tdW5pdGlvbiA9IHRoaXMuYW1tdW5pdGlvbihcbiAgICAgICAgICAgIGNoYXJhY3Rlci5pdGVtc1xuICAgICAgICApIGFzIERuZEl0ZW01ZVtdO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgaW52ZW50b3J5QW1tdW5pdGlvbi5maW5kKChhbW1vOiBEbmRJdGVtNWUpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBuYW1lID0gYW1tby5uYW1lO1xuICAgICAgICAgICAgICAgIGlmIChuYW1lID09IG5leHRSb3VuZCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYW1tbztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9KSB8fCAoeyBuYW1lOiAnRW1wdHknIH0gYXMgRG5kSXRlbTVlKVxuICAgICAgICApO1xuICAgIH1cblxuICAgIGRyeWZpcmVXZWFwb24oKSB7XG4gICAgICAgIGNvbnN0IGNoYXJhY3RlciA9IHRoaXMuY2hhcmFjdGVyO1xuICAgICAgICBjb25zdCB3ZWFwb24gPSB0aGlzLndlYXBvbjtcblxuICAgICAgICBjb25zdCByZW5kZXJIb29rSWQgPSBIb29rcy5vbihcbiAgICAgICAgICAgICdyZW5kZXJDaGF0TWVzc2FnZScsXG4gICAgICAgICAgICAoX2NoYXRJdGVtLCBodG1sKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVsb2FkQnRuID0gaHRtbFswXS5xdWVyeVNlbGVjdG9yKCcucmVsb2FkLWFtbW8nKTtcbiAgICAgICAgICAgICAgICByZWxvYWRCdG4/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbG9hZChjaGFyYWN0ZXIsIHdlYXBvbik7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBpZiAocmVsb2FkQnRuKSB7XG4gICAgICAgICAgICAgICAgICAgIEhvb2tzLm9mZigncmVuZGVyQ2hhdE1lc3NhZ2UnLCByZW5kZXJIb29rSWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcblxuICAgICAgICBjb25zdCB0ZW1wbGF0ZURhdGE6IEFjdGl2aXR5Q2FyZENoYXRUeXBlID0ge1xuICAgICAgICAgICAgZGVzY3JpcHRpb246IHtcbiAgICAgICAgICAgICAgICBjaGF0OiBgPHA+JHt0aGlzLnRyYW5zbGF0ZShcbiAgICAgICAgICAgICAgICAgICAgJ1dFQVBPTl9SRUxPQUQuRmVhdHVyZXMuUmVsb2FkYWJsZVdlYXBvbkF0dGFjay5EcnlGaXJlRGVzY3JpcHRpb24nLFxuICAgICAgICAgICAgICAgICAgICB7IG5hbWU6IGNoYXJhY3Rlci5uYW1lLCByZWxvYWRhYmxlV2VhcG9uOiB3ZWFwb24ubmFtZSB9LFxuICAgICAgICAgICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICAgICAgKX08L3A+YCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBpdGVtOiB7XG4gICAgICAgICAgICAgICAgaW1nOiB3ZWFwb24uaW1nLFxuICAgICAgICAgICAgICAgIG5hbWU6IHRoaXMudHJhbnNsYXRlKFxuICAgICAgICAgICAgICAgICAgICAnV0VBUE9OX1JFTE9BRC5GZWF0dXJlcy5SZWxvYWRhYmxlV2VhcG9uQXR0YWNrLkRyeUZpcmVUaXRsZSdcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHN1YnRpdGxlOiB3ZWFwb24ubmFtZSxcbiAgICAgICAgICAgIGJ1dHRvbnM6IFtcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGFzZXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZpc2liaWxpdHk6ICdhbGwnLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBpY29uOiB0aGlzLm1ha2VJY29uKCdmYS1yb3RhdGUtcmlnaHQnKSxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6IHRoaXMudHJhbnNsYXRlKCdXRUFQT05fUkVMT0FELkZlYXR1cmVzLlJlbG9hZC5UZXh0JyksXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzZXM6ICdyZWxvYWQtYW1tbycsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5yZW5kZXJDYXJkKHRlbXBsYXRlRGF0YSwgY2hhcmFjdGVyKTtcbiAgICB9XG5cbiAgICBhc3luYyByZW5kZXJDYXJkKHRlbXBsYXRlRGF0YSwgY2hhcmFjdGVyKSB7XG4gICAgICAgIGNvbnN0IGh0bWxUZW1wbGF0ZSA9IGF3YWl0IChcbiAgICAgICAgICAgIGZvdW5kcnkuYXBwbGljYXRpb25zIGFzIGFueVxuICAgICAgICApLmhhbmRsZWJhcnMucmVuZGVyVGVtcGxhdGUoXG4gICAgICAgICAgICAnbW9kdWxlcy9mdnR0LXdlYXBvbi1yZWxvYWQvdGVtcGxhdGVzL2FjdGl2aXR5LWNhcmQuaGJzJyxcbiAgICAgICAgICAgIHRlbXBsYXRlRGF0YVxuICAgICAgICApO1xuICAgICAgICB0aGlzLm1vZHVsZU1hbmFnZXIudWlNYW5hZ2VyLnNlbmRDaGF0KGNoYXJhY3RlciwgaHRtbFRlbXBsYXRlKTtcbiAgICB9XG5cbiAgICBmaXJlUm91bmQoYnVsbGV0OiBEbmRJdGVtNWUpIHtcbiAgICAgICAgY29uc3QgcmVsb2FkYWJsZVdlYXBvbiA9IHRoaXMud2VhcG9uO1xuICAgICAgICBjb25zdCBtYXhTaG90cyA9IHBhcnNlSW50KHJlbG9hZGFibGVXZWFwb24uc3lzdGVtLnVzZXMubWF4KTtcbiAgICAgICAgY29uc3QgZmlyZWRMb2Fkb3V0ID1cbiAgICAgICAgICAgIChyZWxvYWRhYmxlV2VhcG9uLmdldEZsYWcoXG4gICAgICAgICAgICAgICAgdGhpcy5tb2R1bGVNYW5hZ2VyLmlkLFxuICAgICAgICAgICAgICAgICdmaXJlZCdcbiAgICAgICAgICAgICkgYXMgc3RyaW5nW10pIHx8IG5ldyBBcnJheShtYXhTaG90cykuZmlsbCgnRW1wdHknKTtcblxuICAgICAgICBmaXJlZExvYWRvdXQudW5zaGlmdChidWxsZXQubmFtZSk7XG4gICAgICAgIGZpcmVkTG9hZG91dC5zcGxpY2UoLTEpO1xuICAgICAgICByZWxvYWRhYmxlV2VhcG9uLnNldEZsYWcodGhpcy5tb2R1bGVNYW5hZ2VyLmlkLCAnZmlyZWQnLCBmaXJlZExvYWRvdXQpO1xuXG4gICAgICAgIGNvbnN0IHVzZXMgPSByZWxvYWRhYmxlV2VhcG9uLnN5c3RlbS51c2VzO1xuICAgICAgICBjb25zdCBxdHk6IG51bWJlciA9XG4gICAgICAgICAgICB1c2VzLnNwZW50ICsgMSA8PSBwYXJzZUludCh1c2VzLm1heClcbiAgICAgICAgICAgICAgICA/IHVzZXMuc3BlbnQgKyAxXG4gICAgICAgICAgICAgICAgOiBwYXJzZUludCh1c2VzLm1heCk7XG5cbiAgICAgICAgcmVsb2FkYWJsZVdlYXBvbi51cGRhdGUoe1xuICAgICAgICAgICAgJ3N5c3RlbS51c2VzLnNwZW50JzogcXR5LFxuICAgICAgICAgICAgJ3N5c3RlbS51c2VzLnZhbHVlJzogcGFyc2VJbnQodXNlcy5tYXgpIC0gcXR5LFxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gYnVsbGV0LnVzZSgpO1xuICAgIH1cblxuICAgIHJlbG9hZChhY3RvcjogRG5kQWN0b3I1ZSwgcmVsb2FkYWJsZVdlYXBvbjogRG5kSXRlbTVlKSB7XG4gICAgICAgIHRoaXMuZmVhdHVyZU1hbmFnZXJcbiAgICAgICAgICAgIC5nZXRGZWF0dXJlKCdyZWxvYWQnKVxuICAgICAgICAgICAgLm9uUmVsb2FkQ2FsbGJhY2soYWN0b3IsIHJlbG9hZGFibGVXZWFwb24pO1xuICAgIH1cblxuICAgIGFzeW5jIG9uQ2xpY2tSZWZ1bmQoKSB7XG4gICAgICAgIGNvbnN0IGFjdG9yID0gdGhpcy5jaGFyYWN0ZXI7XG4gICAgICAgIGNvbnN0IHJlbG9hZGFibGVXZWFwb24gPSB0aGlzLndlYXBvbjtcbiAgICAgICAgY29uc3QgaW52ZW50b3J5QW1tdW5pdGlvbiA9IHRoaXMuYW1tdW5pdGlvbihhY3Rvci5pdGVtcyk7XG5cbiAgICAgICAgY29uc3QgZmlyZWQgPSB0aGlzLmZpcmVkO1xuICAgICAgICBjb25zdCByZWZ1bmQ6IHN0cmluZyA9IGZpcmVkLnNwbGljZSgwLCAxKVswXSBhcyBzdHJpbmc7XG4gICAgICAgIGZpcmVkLnB1c2goJ0VtcHR5Jyk7XG5cbiAgICAgICAgaWYgKHJlZnVuZCA9PSAnRW1wdHknKSB7XG4gICAgICAgICAgICAvLyBOb3RpZnkgdGhlIHVzZXIgdGhhdCB0aGVyZSBpcyBubyBhbW11bml0aW9uIHRvIHJlZnVuZFxuICAgICAgICAgICAgdGhpcy5tb2R1bGVNYW5hZ2VyLnVpTWFuYWdlci51aU5vdGlmaWNhdGlvbihcbiAgICAgICAgICAgICAgICB0aGlzLnRyYW5zbGF0ZShcbiAgICAgICAgICAgICAgICAgICAgJ1dFQVBPTl9SRUxPQUQuRmVhdHVyZXMuUmVsb2FkYWJsZVdlYXBvbkF0dGFjay5SZWZ1bmQuUmVmdW5kTm9Nb3JlTXNnJyxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogYWN0b3IubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbG9hZGFibGVXZWFwb246IHJlbG9hZGFibGVXZWFwb24ubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgdHJ1ZVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgJ3dhcm4nXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgYXdhaXQgcmVsb2FkYWJsZVdlYXBvbi5zZXRGbGFnKHRoaXMubW9kdWxlTWFuYWdlci5pZCwgJ2ZpcmVkJywgZmlyZWQpO1xuXG4gICAgICAgIGxldCBidWxsZXQgPSB7IG5hbWU6IHJlZnVuZCB9IGFzIERuZEl0ZW01ZTtcbiAgICAgICAgaW52ZW50b3J5QW1tdW5pdGlvbi5mb3JFYWNoKChhbW1vOiBJdGVtNWUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5hbWUgPSBhbW1vLm5hbWU7XG4gICAgICAgICAgICBpZiAobmFtZSA9PSByZWZ1bmQpIHtcbiAgICAgICAgICAgICAgICBidWxsZXQgPSBhbW1vIGFzIERuZEl0ZW01ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gUmVmdW5kIHRoZSBub24tRW1wdHkgYW1tdW5pdGlvblxuICAgICAgICBjb25zdCBhbW1vTG9hZG91dCA9IHRoaXMubG9hZG91dDtcbiAgICAgICAgYW1tb0xvYWRvdXQudW5zaGlmdChyZWZ1bmQpO1xuICAgICAgICBhbW1vTG9hZG91dC5zcGxpY2UoLTEpO1xuICAgICAgICBhd2FpdCByZWxvYWRhYmxlV2VhcG9uLnNldEZsYWcoXG4gICAgICAgICAgICB0aGlzLm1vZHVsZU1hbmFnZXIuaWQsXG4gICAgICAgICAgICAnY2hhbWJlcmVkJyxcbiAgICAgICAgICAgIGFtbW9Mb2Fkb3V0XG4gICAgICAgICk7XG5cbiAgICAgICAgLy8gVXBkYXRlIHRoZSByZWxvYWRhYmxlV2VhcG9uIHVzZXNcbiAgICAgICAgY29uc3QgdXNlcyA9IHJlbG9hZGFibGVXZWFwb24uc3lzdGVtLnVzZXM7XG4gICAgICAgIGNvbnN0IHF0eTogbnVtYmVyID0gdXNlcy5zcGVudCAtIDEgPj0gMCA/IHVzZXMuc3BlbnQgLSAxIDogMDtcbiAgICAgICAgcmVsb2FkYWJsZVdlYXBvbi51cGRhdGUoe1xuICAgICAgICAgICAgJ3N5c3RlbS51c2VzLnNwZW50JzogcXR5LFxuICAgICAgICAgICAgJ3N5c3RlbS51c2VzLnZhbHVlJzogcGFyc2VJbnQodXNlcy5tYXgpIC0gcXR5LFxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBOb3RpZnkgdGhlIHVzZXIgdGhhdCB0aGUgcmVmdW5kIHdhcyBhIHN1Y2Nlc3NcbiAgICAgICAgY29uc3QgaHRtbFRlbXBsYXRlID0gYXdhaXQgKFxuICAgICAgICAgICAgZm91bmRyeS5hcHBsaWNhdGlvbnMgYXMgYW55XG4gICAgICAgICkuaGFuZGxlYmFycy5yZW5kZXJUZW1wbGF0ZShcbiAgICAgICAgICAgICdtb2R1bGVzL2Z2dHQtd2VhcG9uLXJlbG9hZC90ZW1wbGF0ZXMvYW1tb1JlZnVuZE5vdGljZVRlbXBsYXRlLmhicycsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaXRlbToge1xuICAgICAgICAgICAgICAgICAgICBpbWc6IGJ1bGxldC5pbWcsXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IGJ1bGxldC5uYW1lLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IHRoaXMudHJhbnNsYXRlKFxuICAgICAgICAgICAgICAgICAgICAnV0VBUE9OX1JFTE9BRC5GZWF0dXJlcy5SZWxvYWRhYmxlV2VhcG9uQXR0YWNrLlJlZnVuZC5SZWZ1bmRDb21wbGV0ZU1zZycsXG4gICAgICAgICAgICAgICAgICAgIHsgYnVsbGV0OiByZWZ1bmQsIG5hbWU6IHJlbG9hZGFibGVXZWFwb24ubmFtZSB9LFxuICAgICAgICAgICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICB0aXRsZTogdGhpcy50cmFuc2xhdGUoXG4gICAgICAgICAgICAgICAgICAgICdXRUFQT05fUkVMT0FELkZlYXR1cmVzLlJlbG9hZGFibGVXZWFwb25BdHRhY2suUmVmdW5kLlJlZnVuZENvbXBsZXRlVGl0bGUnXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy5tb2R1bGVNYW5hZ2VyLnVpTWFuYWdlci5zZW5kQ2hhdChhY3RvciwgaHRtbFRlbXBsYXRlKTtcbiAgICB9XG5cbiAgICBhc3luYyBvbkNsaWNrTWlzZmlyZSgpIHtcbiAgICAgICAgY29uc3QgYWN0b3IgPSB0aGlzLmNoYXJhY3RlcjtcbiAgICAgICAgY29uc3Qgcm9sbCA9IGF3YWl0IG5ldyBSb2xsKCcxZDYnKS5yb2xsKCk7XG4gICAgICAgIGF3YWl0IHJvbGwudG9NZXNzYWdlKHtcbiAgICAgICAgICAgIHNwZWFrZXI6IHtcbiAgICAgICAgICAgICAgICBhbGlhczogYWN0b3IubmFtZSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIG1ha2VJY29uKGljb246IHN0cmluZykge1xuICAgICAgICByZXR1cm4gYDxpIGNsYXNzPVwiZmFzICR7aWNvbn1cIj48L2k+YDtcbiAgICB9XG5cbiAgICB0b1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuICdjbGFzcyBSZWxvYWRhYmxlV2VhcG9uQXR0YWNrRmVhdHVyZSc7XG4gICAgfVxufVxuIiwiaW1wb3J0IEZlYXR1cmVNYW5hZ2VyIGZyb20gJy4uL21hbmFnZXJzL0ZlYXR1cmVNYW5hZ2VyJztcblxuaW1wb3J0IHsgRG5kSXRlbTVlIH0gZnJvbSAnLi4vdHlwZXMvZG5kLnR5cGVzJztcbmltcG9ydCBCYXNlRmVhdHVyZSBmcm9tICcuL0Jhc2VGZWF0dXJlJztcblxuZXhwb3J0IGNsYXNzIFJlbG9hZGFibGVXZWFwb25DcmVhdGlvbkZlYXR1cmUgZXh0ZW5kcyBCYXNlRmVhdHVyZSB7XG4gICAgcHJpdmF0ZSBfY3JlYXRpbmdSZWxvYWRhYmxlV2VhcG9uOiBib29sZWFuO1xuICAgIHByaXZhdGUgX2NyZWF0ZUl0ZW1Ib29rSWQ6IG51bWJlcjtcblxuICAgIGNvbnN0cnVjdG9yKGZlYXR1cmVNYW5hZ2VyOiBGZWF0dXJlTWFuYWdlcikge1xuICAgICAgICBzdXBlcihmZWF0dXJlTWFuYWdlcik7XG4gICAgICAgIHRoaXMuX2NyZWF0aW5nUmVsb2FkYWJsZVdlYXBvbiA9IGZhbHNlO1xuICAgICAgICB0aGlzLl9jcmVhdGVJdGVtSG9va0lkID0gLTE7XG4gICAgfVxuXG4gICAgaW5pdCgpIHtcbiAgICAgICAgSG9va3Mub24oJ3ByZUNyZWF0ZUl0ZW0nLCB0aGlzLm9uUHJlQ3JlYXRlSXRlbS5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICBhc3luYyBvblByZUNyZWF0ZUl0ZW0oaXRlbTogRG5kSXRlbTVlKSB7XG4gICAgICAgIGlmIChpdGVtLnN5c3RlbS50eXBlLmJhc2VJdGVtID09ICdyZWxvYWRhYmxlV2VhcG9uJykge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1dlYXBvbiBSZWxvYWQgfCBUcmlnZ2VyZWQgUHJlLUNyZWF0aW9uJyk7XG5cbiAgICAgICAgICAgIHRoaXMud2VhcG9uSWQgPSBpdGVtLmlkO1xuICAgICAgICAgICAgdGhpcy5jaGFyYWN0ZXJJZCA9IGl0ZW0uYWN0b3I/LmlkIGFzIHN0cmluZztcbiAgICAgICAgICAgIHRoaXMuX2NyZWF0aW5nUmVsb2FkYWJsZVdlYXBvbiA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLl9jcmVhdGVJdGVtSG9va0lkID0gSG9va3Mub24oXG4gICAgICAgICAgICAgICAgJ2NyZWF0ZUl0ZW0nLFxuICAgICAgICAgICAgICAgIHRoaXMub25DcmVhdGVJdGVtLmJpbmQodGhpcylcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhc3luYyBvbkNyZWF0ZUl0ZW0oaXRlbTogRG5kSXRlbTVlKSB7XG4gICAgICAgIGlmICghdGhpcy5fY3JlYXRpbmdSZWxvYWRhYmxlV2VhcG9uIHx8IGl0ZW0uaWQgIT09IHRoaXMud2VhcG9uSWQpXG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgY29uc29sZS5sb2coJ1dlYXBvbiBSZWxvYWQgfCBUcmlnZ2VyZWQgUmVsb2FkYWJsZVdlYXBvbiBDcmVhdGlvbicpO1xuXG4gICAgICAgIGNvbnN0IHJlbG9hZGFibGVXZWFwb24gPSB0aGlzLndlYXBvbjtcbiAgICAgICAgY29uc3QgYW1tb1F0eSA9IHBhcnNlSW50KHJlbG9hZGFibGVXZWFwb24uc3lzdGVtLnVzZXMubWF4KTtcblxuICAgICAgICBhd2FpdCByZWxvYWRhYmxlV2VhcG9uLnVwZGF0ZSh7XG4gICAgICAgICAgICAnc3lzdGVtLnVzZXMuc3BlbnQnOiBhbW1vUXR5LFxuICAgICAgICAgICAgJ3N5c3RlbS51c2VzLnZhbHVlJzogMCxcbiAgICAgICAgfSk7XG4gICAgICAgIGF3YWl0IHJlbG9hZGFibGVXZWFwb24uc2V0RmxhZyhcbiAgICAgICAgICAgIHRoaXMubW9kdWxlTWFuYWdlci5pZCxcbiAgICAgICAgICAgICdjaGFtYmVyZWQnLFxuICAgICAgICAgICAgbmV3IEFycmF5KGFtbW9RdHkpLmZpbGwoJ0VtcHR5JylcbiAgICAgICAgKTtcbiAgICAgICAgYXdhaXQgcmVsb2FkYWJsZVdlYXBvbi5zZXRGbGFnKFxuICAgICAgICAgICAgdGhpcy5tb2R1bGVNYW5hZ2VyLmlkLFxuICAgICAgICAgICAgJ2ZpcmVkJyxcbiAgICAgICAgICAgIG5ldyBBcnJheShhbW1vUXR5KS5maWxsKCdFbXB0eScpXG4gICAgICAgICk7XG5cbiAgICAgICAgdGhpcy53ZWFwb25JZCA9ICcnO1xuICAgICAgICB0aGlzLmNoYXJhY3RlcklkID0gJyc7XG4gICAgICAgIHRoaXMuX2NyZWF0aW5nUmVsb2FkYWJsZVdlYXBvbiA9IGZhbHNlO1xuICAgICAgICBIb29rcy5vZmYoJ2NyZWF0ZUl0ZW0nLCB0aGlzLl9jcmVhdGVJdGVtSG9va0lkKTtcbiAgICAgICAgdGhpcy5fY3JlYXRlSXRlbUhvb2tJZCA9IC0xO1xuICAgIH1cblxuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gJ2NsYXNzIFJlbG9hZGFibGVXZWFwb25DcmVhdGlvbkZlYXR1cmUnO1xuICAgIH1cbn1cbiIsImV4cG9ydCB7IE5leHRSb3VuZEZlYXR1cmUgfSBmcm9tICcuL05leHRSb3VuZEZlYXR1cmUnO1xuZXhwb3J0IHsgUmVsb2FkYWJsZVdlYXBvbkF0dGFja0ZlYXR1cmUgfSBmcm9tICcuL1JlbG9hZGFibGVXZWFwb25BdHRhY2tGZWF0dXJlJztcbmV4cG9ydCB7IFJlbG9hZGFibGVXZWFwb25DcmVhdGlvbkZlYXR1cmUgfSBmcm9tICcuL1JlbG9hZGFibGVXZWFwb25DcmVhdGlvbkZlYXR1cmUnO1xuZXhwb3J0IHsgUmVsb2FkRmVhdHVyZSB9IGZyb20gJy4vUmVsb2FkRmVhdHVyZSc7XG4iLCJpbXBvcnQgTW9kdWxlTWFuYWdlciBmcm9tICcuL01vZHVsZU1hbmFnZXInO1xuaW1wb3J0IHtcbiAgICBOZXh0Um91bmRGZWF0dXJlLFxuICAgIFJlbG9hZGFibGVXZWFwb25BdHRhY2tGZWF0dXJlLFxuICAgIFJlbG9hZGFibGVXZWFwb25DcmVhdGlvbkZlYXR1cmUsXG4gICAgUmVsb2FkRmVhdHVyZSxcbn0gZnJvbSAnLi4vZmVhdHVyZXMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBGZWF0dXJlTWFuYWdlciB7XG4gICAgcHJpdmF0ZSBfbW9kdWxlTWFuYWdlcjogTW9kdWxlTWFuYWdlcjtcbiAgICBwcml2YXRlIF9mZWF0dXJlczogeyBba2V5OiBzdHJpbmddOiBhbnkgfTtcblxuICAgIGNvbnN0cnVjdG9yKG1vZHVsZU1hbmFnZXI6IE1vZHVsZU1hbmFnZXIpIHtcbiAgICAgICAgdGhpcy5fbW9kdWxlTWFuYWdlciA9IG1vZHVsZU1hbmFnZXI7XG4gICAgICAgIHRoaXMuX2ZlYXR1cmVzID0ge307XG4gICAgfVxuXG4gICAgaW5pdCgpIHtcbiAgICAgICAgdGhpcy5fZmVhdHVyZXMgPSB7XG4gICAgICAgICAgICBuZXh0Um91bmQ6IG5ldyBOZXh0Um91bmRGZWF0dXJlKHRoaXMpLFxuICAgICAgICAgICAgcmVsb2FkOiBuZXcgUmVsb2FkRmVhdHVyZSh0aGlzKSxcbiAgICAgICAgICAgIHJlbG9hZGFibGVXZWFwb25BdHRhY2s6IG5ldyBSZWxvYWRhYmxlV2VhcG9uQXR0YWNrRmVhdHVyZSh0aGlzKSxcbiAgICAgICAgICAgIHJlbG9hZGFibGVXZWFwb25DcmVhdGlvbjogbmV3IFJlbG9hZGFibGVXZWFwb25DcmVhdGlvbkZlYXR1cmUodGhpcyksXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZ2V0RmVhdHVyZShpZDogc3RyaW5nKSB7XG4gICAgICAgIGlmICh0aGlzLl9mZWF0dXJlc1tpZF0pIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9mZWF0dXJlc1tpZF07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgZ2V0IG1vZHVsZU1hbmFnZXIoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9tb2R1bGVNYW5hZ2VyO1xuICAgIH1cblxuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gYGNsYXNzIEZlYXR1cmVNYW5hZ2VyOiAke3RoaXMuX2ZlYXR1cmVzLmxlbmd0aH1gO1xuICAgIH1cbn1cbiIsImltcG9ydCBGZWF0dXJlTWFuYWdlciBmcm9tICcuL0ZlYXR1cmVNYW5hZ2VyJztcbmltcG9ydCBVaU1hbmFnZXIgZnJvbSAnLi9VaU1hbmFnZXInO1xuaW1wb3J0IFRlbXBsYXRlTWFuYWdlciBmcm9tICcuL1RlbXBsYXRlTWFuYWdlcic7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1vZHVsZU1hbmFnZXIge1xuICAgIHByaXZhdGUgX21vZHVsZUlkOiBzdHJpbmc7XG4gICAgcHJpdmF0ZSBfZmVhdHVyZU1hbmFnZXI6IEZlYXR1cmVNYW5hZ2VyO1xuICAgIHByaXZhdGUgX3VpTWFuYWdlcjogVWlNYW5hZ2VyO1xuICAgIHByaXZhdGUgX3RlbXBsYXRlTWFuYWdlcjogVGVtcGxhdGVNYW5hZ2VyO1xuXG4gICAgY29uc3RydWN0b3IoaWQ6IHN0cmluZykge1xuICAgICAgICB0aGlzLl9tb2R1bGVJZCA9IGlkO1xuICAgICAgICB0aGlzLl9mZWF0dXJlTWFuYWdlciA9IG5ldyBGZWF0dXJlTWFuYWdlcih0aGlzKTtcbiAgICAgICAgdGhpcy5fdWlNYW5hZ2VyID0gbmV3IFVpTWFuYWdlcih0aGlzKTtcbiAgICAgICAgdGhpcy5fdGVtcGxhdGVNYW5hZ2VyID0gbmV3IFRlbXBsYXRlTWFuYWdlcigpO1xuICAgIH1cblxuICAgIGdldCBpZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX21vZHVsZUlkO1xuICAgIH1cblxuICAgIGdldCBmZWF0dXJlTWFuYWdlcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ZlYXR1cmVNYW5hZ2VyO1xuICAgIH1cblxuICAgIGdldCB1aU1hbmFnZXIoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl91aU1hbmFnZXI7XG4gICAgfVxuXG4gICAgZ2V0IHRlbXBsYXRlTWFuYWdlcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3RlbXBsYXRlTWFuYWdlcjtcbiAgICB9XG5cbiAgICBpbml0KCkge1xuICAgICAgICB0aGlzLnN5c3RlbU92ZXJyaWRlcygpO1xuICAgICAgICB0aGlzLm1vZHVsZUNvbmZpZ3VyYXRpb25zKCk7XG4gICAgICAgIHRoaXMuX2ZlYXR1cmVNYW5hZ2VyLmluaXQoKTtcbiAgICAgICAgdGhpcy5fdWlNYW5hZ2VyLmluaXQoKTtcbiAgICAgICAgdGhpcy5fdGVtcGxhdGVNYW5hZ2VyLmluaXQoKTtcbiAgICB9XG5cbiAgICBzeXN0ZW1PdmVycmlkZXMoKSB7XG4gICAgICAgIChDT05GSUcgYXMgYW55KS5ETkQ1RS5mZWF0dXJlVHlwZXMuaXRlbSA9IHtcbiAgICAgICAgICAgIGxhYmVsOiB0aGlzLnVpTWFuYWdlci5nZXRMb2NhbGl6ZWRUeHQoJ1dFQVBPTl9SRUxPQUQuSXRlbUZlYXR1cmUnKSxcbiAgICAgICAgfTtcblxuICAgICAgICAoQ09ORklHIGFzIGFueSkuRE5ENUUuaXRlbVByb3BlcnRpZXMuY29uY2VhbGFibGUgPSB7XG4gICAgICAgICAgICBsYWJlbDogdGhpcy51aU1hbmFnZXIuZ2V0TG9jYWxpemVkVHh0KCdXRUFQT05fUkVMT0FELkNvbmNlYWxhYmxlJyksXG4gICAgICAgIH07XG4gICAgICAgIChDT05GSUcgYXMgYW55KS5ETkQ1RS52YWxpZFByb3BlcnRpZXMud2VhcG9uLmFkZCgnY29uY2VhbGFibGUnKTtcblxuICAgICAgICAoQ09ORklHIGFzIGFueSkuRE5ENUUuaXRlbVByb3BlcnRpZXMudW5zdGFibGUgPSB7XG4gICAgICAgICAgICBsYWJlbDogdGhpcy51aU1hbmFnZXIuZ2V0TG9jYWxpemVkVHh0KCdXRUFQT05fUkVMT0FELlVuc3RhYmxlJyksXG4gICAgICAgICAgICBpc1BoeXNpY2FsOiB0cnVlLFxuICAgICAgICB9O1xuXG4gICAgICAgIChDT05GSUcgYXMgYW55KS5ETkQ1RS53ZWFwb25JZHMucmVsb2FkYWJsZVdlYXBvbiA9XG4gICAgICAgICAgICAnQ29tcGVuZGl1bS5mdnR0LXdlYXBvbi1yZWxvYWQuaXRlbS1wYWNrLkl0ZW0ubEU2MFFhUzFzY3RiM09BZCc7XG4gICAgfVxuXG4gICAgbW9kdWxlQ29uZmlndXJhdGlvbnMoKSB7XG4gICAgICAgIGNvbnN0IG1vZHVsZU5hbWUgPSAnZnZ0dC13ZWFwb24tcmVsb2FkJztcblxuICAgICAgICBnYW1lLnNldHRpbmdzLnJlZ2lzdGVyKG1vZHVsZU5hbWUsICd1bnN0YWJsZUFtbW8nLCB7XG4gICAgICAgICAgICBzY29wZTogJ3dvcmxkJyxcbiAgICAgICAgICAgIG5hbWU6ICdTRVRUSU5HUy5XRUFQT05fUkVMT0FELlVuc3RhYmxlQW1tby5OYW1lJyxcbiAgICAgICAgICAgIGhpbnQ6ICdTRVRUSU5HUy5XRUFQT05fUkVMT0FELlVuc3RhYmxlQW1tby5IaW50JyxcbiAgICAgICAgICAgIHR5cGU6IEJvb2xlYW4sXG4gICAgICAgICAgICBjb25maWc6IHRydWUsXG4gICAgICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICB9KTtcblxuICAgICAgICBnYW1lLnNldHRpbmdzLnJlZ2lzdGVyKG1vZHVsZU5hbWUsICd1bnN0YWJsZUFtbW9GYWlsdXJlVGhyZXNoaG9sZCcsIHtcbiAgICAgICAgICAgIHNjb3BlOiAnd29ybGQnLFxuICAgICAgICAgICAgbmFtZTogJ1NFVFRJTkdTLldFQVBPTl9SRUxPQUQuVW5zdGFibGVBbW1vRmFpbHVyZVRocmVzaG9sZC5OYW1lJyxcbiAgICAgICAgICAgIGhpbnQ6ICdTRVRUSU5HUy5XRUFQT05fUkVMT0FELlVuc3RhYmxlQW1tb0ZhaWx1cmVUaHJlc2hvbGQuSGludCcsXG4gICAgICAgICAgICB0eXBlOiBOdW1iZXIsXG4gICAgICAgICAgICBjb25maWc6IHRydWUsXG4gICAgICAgICAgICBkZWZhdWx0OiAyLFxuICAgICAgICB9KTtcblxuICAgICAgICBnYW1lLnNldHRpbmdzLnJlZ2lzdGVyKG1vZHVsZU5hbWUsICd1c2VNaXNmaXJlcycsIHtcbiAgICAgICAgICAgIHNjb3BlOiAnd29ybGQnLFxuICAgICAgICAgICAgbmFtZTogJ1NFVFRJTkdTLldFQVBPTl9SRUxPQUQuVXNlTWlzZmlyZXMuTmFtZScsXG4gICAgICAgICAgICBoaW50OiAnU0VUVElOR1MuV0VBUE9OX1JFTE9BRC5Vc2VNaXNmaXJlcy5IaW50JyxcbiAgICAgICAgICAgIHR5cGU6IEJvb2xlYW4sXG4gICAgICAgICAgICBjb25maWc6IHRydWUsXG4gICAgICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICB9KTtcblxuICAgICAgICBnYW1lLnNldHRpbmdzLnJlZ2lzdGVyKG1vZHVsZU5hbWUsICdmaWx0ZXJBbW11bml0aW9uQnlFcXVpcHBlZCcsIHtcbiAgICAgICAgICAgIHNjb3BlOiAndXNlcicsXG4gICAgICAgICAgICBuYW1lOiAnU0VUVElOR1MuV0VBUE9OX1JFTE9BRC5GaWx0ZXJBbW11bml0aW9uQnlFcXVpcHBlZC5OYW1lJyxcbiAgICAgICAgICAgIGhpbnQ6ICdTRVRUSU5HUy5XRUFQT05fUkVMT0FELkZpbHRlckFtbXVuaXRpb25CeUVxdWlwcGVkLkhpbnQnLFxuICAgICAgICAgICAgdHlwZTogQm9vbGVhbixcbiAgICAgICAgICAgIGNvbmZpZzogdHJ1ZSxcbiAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBkZWJ1Zyhob29rczogYm9vbGVhbiA9IGZhbHNlKSB7XG4gICAgICAgIENPTkZJRy5kZWJ1Zy5ob29rcyA9IGhvb2tzO1xuICAgICAgICBjb25zb2xlLmxvZygnQ09ORklHOiAnLCBDT05GSUcpO1xuICAgICAgICBjb25zb2xlLmxvZygnQ09ORklHLkRORDVFOiAnLCAoQ09ORklHIGFzIGFueSkuRE5ENUUpO1xuICAgIH1cblxuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gJ2NsYXNzIE1vZHVsZU1hbmFnZXInO1xuICAgIH1cbn1cbiIsImV4cG9ydCBkZWZhdWx0IGNsYXNzIFRlbXBsYXRlTWFuYWdlciB7XG4gICAgY29uc3RydWN0b3IoKSB7fVxuXG4gICAgaW5pdCgpIHtcbiAgICAgICAgKGZvdW5kcnkuYXBwbGljYXRpb25zIGFzIGFueSkuaGFuZGxlYmFycy5sb2FkVGVtcGxhdGVzKFxuICAgICAgICAgICAgVGVtcGxhdGVNYW5hZ2VyLnBhdGhzXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgc3RhdGljIGdldCBwYXRocygpIHtcbiAgICAgICAgY29uc3QgcGF0aHMgPSB7fTtcbiAgICAgICAgY29uc3QgdGVtcGxhdGVQYXRocyA9ICdtb2R1bGVzL2Z2dHQtd2VhcG9uLXJlbG9hZC90ZW1wbGF0ZXMvcmVsb2FkYWJsZVdlYXBvblJlbG9hZFRlbXBsYXRlLmhicyxtb2R1bGVzL2Z2dHQtd2VhcG9uLXJlbG9hZC90ZW1wbGF0ZXMvYmFzaWNNZXNzYWdlLmhicyxtb2R1bGVzL2Z2dHQtd2VhcG9uLXJlbG9hZC90ZW1wbGF0ZXMvYW1tb1NlbGVjdGlvbkRpYWxvZ1RlbXBsYXRlLmhicyxtb2R1bGVzL2Z2dHQtd2VhcG9uLXJlbG9hZC90ZW1wbGF0ZXMvYW1tb1JlZnVuZE5vdGljZVRlbXBsYXRlLmhicyxtb2R1bGVzL2Z2dHQtd2VhcG9uLXJlbG9hZC90ZW1wbGF0ZXMvYWN0aXZpdHktY2FyZC5oYnMnLnNwbGl0KCcsJyk7XG4gICAgICAgIGZvciAoY29uc3QgcGF0aCBvZiB0ZW1wbGF0ZVBhdGhzKSB7XG4gICAgICAgICAgICBwYXRoc1twYXRoLnJlcGxhY2UoJy5oYnMnLCAnLmh0bWwnKV0gPSBwYXRoO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwYXRocztcbiAgICB9XG5cbiAgICBzdGF0aWMgb25Ib3RSZWxvYWQoKSB7XG4gICAgICAgIGZvciAoY29uc3QgdGVtcGxhdGUgaW4gX3RlbXBsYXRlQ2FjaGUpIHtcbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoX3RlbXBsYXRlQ2FjaGUsIHRlbXBsYXRlKVxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgZGVsZXRlIF90ZW1wbGF0ZUNhY2hlW3RlbXBsYXRlXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIChmb3VuZHJ5LmFwcGxpY2F0aW9ucyBhcyBhbnkpLmhhbmRsZWJhcnNcbiAgICAgICAgICAgIC5sb2FkVGVtcGxhdGVzKHRoaXMucGF0aHMpXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBhcHBsaWNhdGlvbiBpbiB1aS53aW5kb3dzKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1aS53aW5kb3dzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcGxpY2F0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdWkud2luZG93c1thcHBsaWNhdGlvbl0ucmVuZGVyKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgdG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiAnY2xhc3MgVGVtcGxhdGVNYW5hZ2VyJztcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBEbmRBY3RvcjVlIH0gZnJvbSAnLi4vdHlwZXMvZG5kLnR5cGVzJztcbmltcG9ydCBNb2R1bGVNYW5hZ2VyIGZyb20gJy4vTW9kdWxlTWFuYWdlcic7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFVpTWFuYWdlciB7XG4gICAgcHJpdmF0ZSBfbW9kdWxlTWFuYWdlcjogTW9kdWxlTWFuYWdlcjtcblxuICAgIGNvbnN0cnVjdG9yKG1vZHVsZU1hbmFnZXI6IE1vZHVsZU1hbmFnZXIpIHtcbiAgICAgICAgdGhpcy5fbW9kdWxlTWFuYWdlciA9IG1vZHVsZU1hbmFnZXI7XG4gICAgfVxuXG4gICAgaW5pdCgpIHtcbiAgICAgICAgLy8gRU1QVFkgRk9SIE5PV1xuICAgIH1cblxuICAgIGdldCBtb2R1bGVNYW5hZ2VyKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fbW9kdWxlTWFuYWdlcjtcbiAgICB9XG5cbiAgICBidWlsZERpYWxvZyhvcHRpb25zLCBpZCkge1xuICAgICAgICByZXR1cm4gbmV3IGZvdW5kcnkuYXBwbGljYXRpb25zLmFwaS5EaWFsb2dWMih7XG4gICAgICAgICAgICB3aW5kb3c6IHtcbiAgICAgICAgICAgICAgICB0aXRsZTogb3B0aW9ucy50aXRsZSxcbiAgICAgICAgICAgICAgICBjb250ZW50Q2xhc3Nlczogb3B0aW9ucy5jb250ZW50Q2xhc3NlcyB8fCBbXSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjb250ZW50OiBvcHRpb25zLmNvbnRlbnQsXG4gICAgICAgICAgICBidXR0b25zOiBvcHRpb25zLmJ1dHRvbnMsXG4gICAgICAgICAgICBzdWJtaXQ6IG9wdGlvbnMub25TdWJtaXQsXG4gICAgICAgICAgICBpZDogaWQsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHVpTm90aWZpY2F0aW9uKG1zZzogc3RyaW5nLCB0eXBlOiBzdHJpbmcgPSAnaW5mbycpIHtcbiAgICAgICAgaWYgKHVpLm5vdGlmaWNhdGlvbnMpIHtcbiAgICAgICAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ2Vycm9yJzpcbiAgICAgICAgICAgICAgICAgICAgdWkubm90aWZpY2F0aW9ucy5lcnJvcihtc2cpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICd3YXJuJzpcbiAgICAgICAgICAgICAgICAgICAgdWkubm90aWZpY2F0aW9ucy53YXJuKG1zZyk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2luZm8nOlxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIHVpLm5vdGlmaWNhdGlvbnMuaW5mbyhtc2cpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgc2VuZENoYXQoXG4gICAgICAgIHNwZWFrZXI6IERuZEFjdG9yNWUsXG4gICAgICAgIGNvbnRlbnQ6IHN0cmluZyxcbiAgICAgICAgZmxhdm9yPzogc3RyaW5nLFxuICAgICAgICBzb3VuZD86IHN0cmluZyxcbiAgICAgICAgd2hpc3Blcjogc3RyaW5nW10gPSBbXSxcbiAgICAgICAgdHlwZTogMCB8IDEgfCAyIHwgMyB8IDQgfCA1ID0gQ09OU1QuQ0hBVF9NRVNTQUdFX1RZUEVTLk9USEVSXG4gICAgKSB7XG4gICAgICAgIGNvbnN0IENoYXREYXRhID0ge1xuICAgICAgICAgICAgc3BlYWtlcjogQ2hhdE1lc3NhZ2UuZ2V0U3BlYWtlcih7IGFjdG9yOiBzcGVha2VyIH0pLFxuICAgICAgICAgICAgdHlwZSxcbiAgICAgICAgICAgIGZsYXZvcixcbiAgICAgICAgICAgIHNvdW5kLFxuICAgICAgICAgICAgY29udGVudCxcbiAgICAgICAgICAgIHdoaXNwZXIsXG4gICAgICAgIH07XG4gICAgICAgIENoYXRNZXNzYWdlLmNyZWF0ZShDaGF0RGF0YSk7XG4gICAgfVxuXG4gICAgZ2V0TG9jYWxpemVkVHh0KFxuICAgICAgICBrZXk6IHN0cmluZyxcbiAgICAgICAgb3B0cz86IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH0sXG4gICAgICAgIGZvcm1hdDogYm9vbGVhbiA9IGZhbHNlXG4gICAgKSB7XG4gICAgICAgIGlmIChmb3JtYXQpIHtcbiAgICAgICAgICAgIHJldHVybiAoZ2FtZSBhcyBhbnkpLmkxOG4uZm9ybWF0KGtleSwgb3B0cyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIChnYW1lIGFzIGFueSkuaTE4bi5sb2NhbGl6ZShrZXksIG9wdHMpO1xuICAgIH1cblxuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gJ2NsYXNzIFVpTWFuYWdlcic7XG4gICAgfVxufVxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiOyIsImltcG9ydCBNb2R1bGVNYW5hZ2VyIGZyb20gJy4vbW9kdWxlL21hbmFnZXJzL01vZHVsZU1hbmFnZXInO1xuaW1wb3J0IFRlbXBsYXRlTWFuYWdlciBmcm9tICcuL21vZHVsZS9tYW5hZ2Vycy9UZW1wbGF0ZU1hbmFnZXInO1xuXG5pbXBvcnQgbW9kdWxlSnNvbiBmcm9tICcuLi9tb2R1bGUuanNvbic7XG5cbkhvb2tzLm9uY2UoJ2luaXQnLCBhc3luYyAoKSA9PiB7XG4gICAgY29uc29sZS5sb2coJ0ViZXJyb24gV2VzdCB8IEZvdW5kcnkgVlRUIE1vZHVsZScpO1xuXG4gICAgY29uc3Qgd2VhcG9uX3JlbG9hZCA9IG5ldyBNb2R1bGVNYW5hZ2VyKG1vZHVsZUpzb24uaWQpO1xuICAgIHdlYXBvbl9yZWxvYWQuZGVidWcodHJ1ZSk7XG4gICAgd2VhcG9uX3JlbG9hZC5pbml0KCk7XG59KTtcblxuaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAnZGV2ZWxvcG1lbnQnKSB7XG4gICAgaWYgKG1vZHVsZS5ob3QpIHtcbiAgICAgICAgbW9kdWxlLmhvdC5hY2NlcHQoKTtcblxuICAgICAgICBpZiAobW9kdWxlLmhvdC5zdGF0dXMoKSA9PT0gJ2FwcGx5Jykge1xuICAgICAgICAgICAgVGVtcGxhdGVNYW5hZ2VyLm9uSG90UmVsb2FkKCk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJleHBvcnQgZGVmYXVsdCBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyArIFwic3R5bGVzL21vZHVsZS5jc3NcIjsiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=