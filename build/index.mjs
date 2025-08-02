/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./module.json":
/*!*********************!*\
  !*** ./module.json ***!
  \*********************/
/***/ ((module) => {

module.exports = /*#__PURE__*/JSON.parse('{"id":"fvtt-weapon-reload","title":"Weapon Reload","version":"0.0.1","compatibility":{"minimum":"13","verified":"13"},"authors":[{"name":"Andrew Page","email":"andrew.page32@gmail.com","discord":"andyp22#1298"}],"relationships":{"systems":[{"id":"dnd5e","type":"system","compatibility":{"minimum":"5","verified":"5"}}]},"conflicts":[],"esmodules":["build/index.mjs"],"scripts":[],"styles":[],"languages":[{"lang":"en","name":"English","path":"languages/en.json"}],"packs":[{"name":"weapon-reload-journal-pack","label":"Journal Pack","path":"packs/journal-pack","type":"JournalEntry","ownership":{"PLAYER":"NONE","ASSISTANT":"OWNER"},"system":"dnd5e","flags":{}},{"name":"weapon-reload-actor-pack","label":"Actor Pack","path":"packs/actor-pack","type":"Actor","ownership":{"PLAYER":"NONE","ASSISTANT":"OWNER"},"system":"dnd5e","flags":{}},{"name":"weapon-reload-item-pack","label":"Item Pack","path":"packs/item-pack","type":"Item","ownership":{"PLAYER":"OBSERVER","ASSISTANT":"OWNER"},"system":"dnd5e","flags":{"dnd5e":{"sorting":"m","sourceBooks":{"EbW":"EWEAPON_RELOAD.Title"},"types":["item"]}}},{"name":"weapon-reload-macro-pack","label":"Macro Pack","path":"packs/macro-pack","type":"Macro","ownership":{"PLAYER":"NONE","ASSISTANT":"OWNER"},"system":"dnd5e","flags":{}},{"name":"weapon-reload-rollable-table-pack","label":"Rollable Table Pack","path":"packs/rollable-table-pack","type":"RollTable","ownership":{"PLAYER":"NONE","ASSISTANT":"OWNER"},"system":"dnd5e","flags":{}}],"packFolders":[{"name":"Weapon Reload","sorting":"a","color":"#8b5e3c","ownership":{"PLAYER":"NONE"},"packs":["weapon-reload-journal-pack","weapon-reload-actor-pack","weapon-reload-item-pack","weapon-reload-macro-pack","weapon-reload-rollable-table-pack"]}]}');

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
        return this.getReloadFlag('chambered');
    }
    get fired() {
        return this.getReloadFlag('fired');
    }
    getReloadFlag(name) {
        const reloadableWeapon = this.weapon;
        const maxShots = reloadableWeapon.system.uses.max;
        const fired = reloadableWeapon.getFlag(this.moduleManager.id, name) || new Array(maxShots).fill('Empty');
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
    onSubmitChooseAmmunition({ loadout, reloadCanceled, }) {
        return this.reloadReloadableWeapon(loadout, reloadCanceled);
    }
    async chooseAmmunition(ammoOptions, currentLoadout) {
        const dialogContent = await foundry.applications.handlebars.renderTemplate('modules/fvtt-weapon-reload/templates/ammoSelectionDialogTemplate.hbs', {
            loadoutSlots: new Array(this.weapon.system.uses.max).fill('Empty'),
            ammoOptions,
        });
        const dialogButtons = [
            {
                action: 'load',
                label: this.translate('WEAPON_RELOAD.Features.Reload.Ammunition.ChoiceDialogButtonTxtLoad'),
                callback: (_event, button) => {
                    this._handleChoiceDialogClose = false;
                    const loadout = [];
                    for (let i = 0; i < button.form?.elements?.length; i++) {
                        const elm = button.form?.elements.item(i);
                        if (elm?.name == 'ammo-select') {
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
        const onCloseDialogHook = (dialogV2) => {
            if (dialogV2.id === 'ammo-choice-dialog') {
                this.onCloseChoiceDialog(currentLoadout);
            }
        };
        this._handleChoiceDialogClose = true;
        this._hookId = Hooks.on('closeDialogV2', onCloseDialogHook.bind(this));
        this.moduleManager.uiManager
            .buildDialog({
            title: this.translate('WEAPON_RELOAD.Features.Reload.Ammunition.ChoiceDialogTitle'),
            content: dialogContent,
            buttons: dialogButtons,
            onSubmit: this.onSubmitChooseAmmunition.bind(this),
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
    async buildReloadChat(reloadableWeapon, reloadCanceled, loadout) {
        return await foundry.applications.handlebars.renderTemplate('modules/fvtt-weapon-reload/templates/reloadableWeaponReloadTemplate.hbs', {
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
    }
    async reloadReloadableWeapon(loadout, reloadCanceled = false) {
        const reloadableWeapon = this.weapon;
        const ammoCounts = this.getLoadoutCounts(loadout);
        const canceledLoadout = new Array(this.weapon.system.uses.max).fill('Empty');
        let htmlTemplate;
        if (this.removeLoadout(ammoCounts)) {
            let qty = 0;
            if (ammoCounts['Empty'] > 0) {
                qty += ammoCounts['Empty'];
            }
            await reloadableWeapon.update({
                'system.uses.spent': qty,
                'system.uses.value': reloadableWeapon.system.uses.max - qty,
            });
            await reloadableWeapon.setFlag(this.moduleManager.id, 'chambered', loadout);
            htmlTemplate = await this.buildReloadChat(reloadableWeapon, reloadCanceled, loadout);
        }
        else {
            Hooks.off('closeDialogV2', this._hookId);
            this._hookId = -1;
            await reloadableWeapon.setFlag(this.moduleManager.id, 'chambered', canceledLoadout);
            htmlTemplate = await this.buildReloadChat(reloadableWeapon, reloadCanceled, canceledLoadout);
        }
        await reloadableWeapon.setFlag(this.moduleManager.id, 'fired', canceledLoadout);
        this.moduleManager.uiManager.sendChat(this.character, htmlTemplate);
        this.characterId = '';
        this.weaponId = '';
        return;
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
            if (this.weapon.system.uses.spent == this.weapon.system.uses.max) {
                return false;
            }
        }
        if (bullet.name !== 'Empty') {
            this._nextRound = {
                id: bullet.id,
                type: bullet.type,
            };
            this._hookId = Hooks.on('dnd5e.renderChatMessage', this.onRenderChatMessage.bind(this));
        }
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
                const cardContentElement = parentElement?.querySelector('.card-content');
                const wrapperElement = cardContentElement?.querySelector('.wrapper');
                wrapperElement?.insertAdjacentHTML('beforeend', `<p>${criticalFailureMsg}</p>`);
            }
            if (itemcard && !activationCard) {
                const referenceElement = parentElement?.querySelector('.card-header');
                const buttonContainer = document.createElement('div');
                buttonContainer.className = 'card-buttons';
                referenceElement?.after(buttonContainer);
            }
            const cardButtonsElement = parentElement?.querySelector('.card-buttons');
            if (checkMisfire) {
                const misfireBtn = document.createElement('button');
                misfireBtn.onclick = this.onClickMisfire.bind(this);
                misfireBtn.innerHTML = `${this.makeIcon('fa-burst')}${this.translate('WEAPON_RELOAD.Features.ReloadableWeaponAttack.MisfiredBtnTxt')}`;
                cardButtonsElement?.append(misfireBtn);
            }
            const refundBtn = document.createElement('button');
            refundBtn.onclick = this.onClickRefund.bind(this);
            refundBtn.innerHTML = `${this.makeIcon('fa-undo')}${this.translate('WEAPON_RELOAD.Features.ReloadableWeaponAttack.RefundBtnTxt')}`;
            cardButtonsElement?.append(refundBtn);
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
        console.log('fireRound: ', bullet);
        const reloadableWeapon = this.weapon;
        const maxShots = reloadableWeapon.system.uses.max;
        const firedLoadout = reloadableWeapon.getFlag(this.moduleManager.id, 'fired') || new Array(maxShots).fill('Empty');
        firedLoadout.unshift(bullet.name);
        firedLoadout.splice(-1);
        reloadableWeapon.setFlag(this.moduleManager.id, 'fired', firedLoadout);
        if (bullet.name !== 'Empty') {
            const uses = reloadableWeapon.system.uses;
            const qty = uses.spent + 1 <= uses.max ? uses.spent + 1 : uses.max;
            reloadableWeapon.update({
                'system.uses.spent': qty,
                'system.uses.value': uses.max - qty,
            });
            bullet.use();
        }
        return true;
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
            'system.uses.value': uses.max - qty,
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
        const ammoQty = reloadableWeapon.system.uses.max;
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
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _module_managers_ModuleManager__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./module/managers/ModuleManager */ "./src/module/managers/ModuleManager.ts");
/* harmony import */ var _module_managers_TemplateManager__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./module/managers/TemplateManager */ "./src/module/managers/TemplateManager.ts");
/* harmony import */ var _module_json__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../module.json */ "./module.json");



Hooks.once('init', async () => {
    console.log('Weapon Reload | Foundry VTT Module');
    const weapon_reload = new _module_managers_ModuleManager__WEBPACK_IMPORTED_MODULE_0__["default"](_module_json__WEBPACK_IMPORTED_MODULE_2__.id);
    weapon_reload.init();
});
if (true) {
    if (false) // removed by dead control flow
{}
}

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Q0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ2hELENBQUM7UUFDRCxPQUFRLElBQVksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNsRCxDQUFDO0lBRUQsUUFBUTtRQUNKLE9BQU8saUJBQWlCLENBQUM7SUFDN0IsQ0FBQztDQUNKOzs7Ozs7O1VDNUVEO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7O1dDdEJBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EseUNBQXlDLHdDQUF3QztXQUNqRjtXQUNBO1dBQ0E7Ozs7O1dDUEE7Ozs7O1dDQUE7V0FDQTtXQUNBO1dBQ0EsdURBQXVELGlCQUFpQjtXQUN4RTtXQUNBLGdEQUFnRCxhQUFhO1dBQzdEOzs7Ozs7Ozs7Ozs7OztBQ040RDtBQUNJO0FBRXhCO0FBRXhDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEtBQUssSUFBSSxFQUFFO0lBQzFCLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0NBQW9DLENBQUMsQ0FBQztJQUVsRCxNQUFNLGFBQWEsR0FBRyxJQUFJLHNFQUFhLENBQUMsNENBQWEsQ0FBQyxDQUFDO0lBRXZELGFBQWEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUN6QixDQUFDLENBQUMsQ0FBQztBQUVILElBQUksSUFBc0MsRUFBRSxDQUFDO0lBQ3pDLElBQUksS0FBVSxFQUFFO0FBQUEsRUFNZjtBQUNMLENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9mdnR0LXdlYXBvbi1yZWxvYWQvLi9zcmMvbW9kdWxlL2ZlYXR1cmVzL0Jhc2VGZWF0dXJlLnRzIiwid2VicGFjazovL2Z2dHQtd2VhcG9uLXJlbG9hZC8uL3NyYy9tb2R1bGUvZmVhdHVyZXMvTmV4dFJvdW5kRmVhdHVyZS50cyIsIndlYnBhY2s6Ly9mdnR0LXdlYXBvbi1yZWxvYWQvLi9zcmMvbW9kdWxlL2ZlYXR1cmVzL1JlbG9hZEZlYXR1cmUudHMiLCJ3ZWJwYWNrOi8vZnZ0dC13ZWFwb24tcmVsb2FkLy4vc3JjL21vZHVsZS9mZWF0dXJlcy9SZWxvYWRhYmxlV2VhcG9uQXR0YWNrRmVhdHVyZS50cyIsIndlYnBhY2s6Ly9mdnR0LXdlYXBvbi1yZWxvYWQvLi9zcmMvbW9kdWxlL2ZlYXR1cmVzL1JlbG9hZGFibGVXZWFwb25DcmVhdGlvbkZlYXR1cmUudHMiLCJ3ZWJwYWNrOi8vZnZ0dC13ZWFwb24tcmVsb2FkLy4vc3JjL21vZHVsZS9mZWF0dXJlcy9pbmRleC50cyIsIndlYnBhY2s6Ly9mdnR0LXdlYXBvbi1yZWxvYWQvLi9zcmMvbW9kdWxlL21hbmFnZXJzL0ZlYXR1cmVNYW5hZ2VyLnRzIiwid2VicGFjazovL2Z2dHQtd2VhcG9uLXJlbG9hZC8uL3NyYy9tb2R1bGUvbWFuYWdlcnMvTW9kdWxlTWFuYWdlci50cyIsIndlYnBhY2s6Ly9mdnR0LXdlYXBvbi1yZWxvYWQvLi9zcmMvbW9kdWxlL21hbmFnZXJzL1RlbXBsYXRlTWFuYWdlci50cyIsIndlYnBhY2s6Ly9mdnR0LXdlYXBvbi1yZWxvYWQvLi9zcmMvbW9kdWxlL21hbmFnZXJzL1VpTWFuYWdlci50cyIsIndlYnBhY2s6Ly9mdnR0LXdlYXBvbi1yZWxvYWQvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vZnZ0dC13ZWFwb24tcmVsb2FkL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9mdnR0LXdlYXBvbi1yZWxvYWQvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9mdnR0LXdlYXBvbi1yZWxvYWQvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9mdnR0LXdlYXBvbi1yZWxvYWQvLi9zcmMvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEZlYXR1cmVNYW5hZ2VyIGZyb20gJy4uL21hbmFnZXJzL0ZlYXR1cmVNYW5hZ2VyJztcbmltcG9ydCB7IERuZEl0ZW01ZSB9IGZyb20gJy4uL3R5cGVzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQmFzZUZlYXR1cmUge1xuICAgIHByaXZhdGUgX2ZlYXR1cmVNYW5hZ2VyOiBGZWF0dXJlTWFuYWdlcjtcbiAgICBwcml2YXRlIF9hY3RvcklkOiBzdHJpbmc7XG4gICAgcHJpdmF0ZSBfd2VhcG9uSWQ6IHN0cmluZztcblxuICAgIGNvbnN0cnVjdG9yKGZlYXR1cmVNYW5hZ2VyOiBGZWF0dXJlTWFuYWdlcikge1xuICAgICAgICB0aGlzLl9mZWF0dXJlTWFuYWdlciA9IGZlYXR1cmVNYW5hZ2VyO1xuICAgICAgICB0aGlzLl9hY3RvcklkID0gJyc7XG4gICAgICAgIHRoaXMuX3dlYXBvbklkID0gJyc7XG4gICAgICAgIHRoaXMuaW5pdCgpO1xuICAgIH1cblxuICAgIGdldCBmZWF0dXJlTWFuYWdlcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ZlYXR1cmVNYW5hZ2VyO1xuICAgIH1cblxuICAgIGdldCBtb2R1bGVNYW5hZ2VyKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZmVhdHVyZU1hbmFnZXIubW9kdWxlTWFuYWdlcjtcbiAgICB9XG5cbiAgICBnZXQgY2hhcmFjdGVyKCk6IEFjdG9yNWUge1xuICAgICAgICByZXR1cm4gZ2FtZT8uYWN0b3JzPy5nZXQodGhpcy5fYWN0b3JJZCkgYXMgQWN0b3I1ZTtcbiAgICB9XG5cbiAgICBnZXQgY2hhcmFjdGVySWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hY3RvcklkO1xuICAgIH1cblxuICAgIHNldCBjaGFyYWN0ZXJJZChpZDogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuX2FjdG9ySWQgPSBpZDtcbiAgICB9XG5cbiAgICBnZXQgd2VhcG9uKCk6IERuZEl0ZW01ZSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNoYXJhY3Rlci5pdGVtcy5nZXQodGhpcy5fd2VhcG9uSWQpIGFzIERuZEl0ZW01ZTtcbiAgICB9XG5cbiAgICBnZXQgd2VhcG9uSWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl93ZWFwb25JZDtcbiAgICB9XG5cbiAgICBzZXQgd2VhcG9uSWQoaWQ6IHN0cmluZykge1xuICAgICAgICB0aGlzLl93ZWFwb25JZCA9IGlkO1xuICAgIH1cblxuICAgIGdldCBsb2Fkb3V0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRSZWxvYWRGbGFnKCdjaGFtYmVyZWQnKTtcbiAgICB9XG5cbiAgICBnZXQgZmlyZWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFJlbG9hZEZsYWcoJ2ZpcmVkJyk7XG4gICAgfVxuXG4gICAgZ2V0UmVsb2FkRmxhZyhuYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgY29uc3QgcmVsb2FkYWJsZVdlYXBvbiA9IHRoaXMud2VhcG9uO1xuICAgICAgICBjb25zdCBtYXhTaG90cyA9IHJlbG9hZGFibGVXZWFwb24uc3lzdGVtLnVzZXMubWF4O1xuICAgICAgICBjb25zdCBmaXJlZCA9XG4gICAgICAgICAgICAocmVsb2FkYWJsZVdlYXBvbi5nZXRGbGFnKFxuICAgICAgICAgICAgICAgIHRoaXMubW9kdWxlTWFuYWdlci5pZCxcbiAgICAgICAgICAgICAgICBuYW1lXG4gICAgICAgICAgICApIGFzIHN0cmluZ1tdKSB8fCBuZXcgQXJyYXkobWF4U2hvdHMpLmZpbGwoJ0VtcHR5Jyk7XG5cbiAgICAgICAgaWYgKGZpcmVkLmxlbmd0aCA8IG1heFNob3RzKSB7XG4gICAgICAgICAgICBjb25zdCBtaXNzaW5nID0gbWF4U2hvdHMgLSBmaXJlZC5sZW5ndGg7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG1pc3Npbmc7IGkrKykge1xuICAgICAgICAgICAgICAgIGZpcmVkLnB1c2goJ0VtcHR5Jyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZmlyZWQ7XG4gICAgfVxuXG4gICAgYW1tdW5pdGlvbihpdGVtczogQ29sbGVjdGlvbjxJdGVtNWU+LCBlcXVpcHBlZDogYm9vbGVhbiA9IGZhbHNlKTogSXRlbTVlW10ge1xuICAgICAgICByZXR1cm4gaXRlbXMuZmlsdGVyKChpdGVtOiBJdGVtNWUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGdhbWVTeXN0ZW0gPSAoaXRlbSBhcyBEbmRJdGVtNWUpLnN5c3RlbTtcbiAgICAgICAgICAgIGlmIChlcXVpcHBlZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgIGl0ZW0udHlwZSA9PSAnY29uc3VtYWJsZScgJiZcbiAgICAgICAgICAgICAgICAgICAgZ2FtZVN5c3RlbS50eXBlLnN1YnR5cGUgPT0gJ2ZpcmVhcm1CdWxsZXQnICYmXG4gICAgICAgICAgICAgICAgICAgIGdhbWVTeXN0ZW0uZXF1aXBwZWRcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICBpdGVtLnR5cGUgPT0gJ2NvbnN1bWFibGUnICYmXG4gICAgICAgICAgICAgICAgZ2FtZVN5c3RlbS50eXBlLnN1YnR5cGUgPT0gJ2ZpcmVhcm1CdWxsZXQnXG4gICAgICAgICAgICApO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBpbml0KCkge31cblxuICAgIHRyYW5zbGF0ZShrZXk6IHN0cmluZywgb3B0cz86IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH0sIGZvcm1hdD86IGJvb2xlYW4pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubW9kdWxlTWFuYWdlci51aU1hbmFnZXIuZ2V0TG9jYWxpemVkVHh0KGtleSwgb3B0cywgZm9ybWF0KTtcbiAgICB9XG5cbiAgICB0b1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuICdjbGFzcyBCYXNlRmVhdHVyZSc7XG4gICAgfVxufVxuIiwiaW1wb3J0IEZlYXR1cmVNYW5hZ2VyIGZyb20gJy4uL21hbmFnZXJzL0ZlYXR1cmVNYW5hZ2VyJztcbmltcG9ydCBCYXNlRmVhdHVyZSBmcm9tICcuL0Jhc2VGZWF0dXJlJztcblxuZXhwb3J0IGNsYXNzIE5leHRSb3VuZEZlYXR1cmUgZXh0ZW5kcyBCYXNlRmVhdHVyZSB7XG4gICAgY29uc3RydWN0b3IoZmVhdHVyZU1hbmFnZXI6IEZlYXR1cmVNYW5hZ2VyKSB7XG4gICAgICAgIHN1cGVyKGZlYXR1cmVNYW5hZ2VyKTtcbiAgICB9XG5cbiAgICBpbml0KCkge1xuICAgICAgICBIb29rcy5vbignZG5kNWUucHJlVXNlQWN0aXZpdHknLCB0aGlzLm9uVXNlQWN0aXZpdHkuYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgb25Vc2VBY3Rpdml0eShhY3Rpdml0eTogYW55KSB7XG4gICAgICAgIGlmIChhY3Rpdml0eS50eXBlID09PSAndXRpbGl0eScgJiYgYWN0aXZpdHkubmFtZSA9PSAnTmV4dCBSb3VuZCcpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdXZWFwb24gUmVsb2FkIHwgVHJpZ2dlcmVkIE5leHQgUm91bmQnKTtcblxuICAgICAgICAgICAgdGhpcy5jaGFyYWN0ZXJJZCA9IGFjdGl2aXR5LmFjdG9yLmlkO1xuICAgICAgICAgICAgdGhpcy53ZWFwb25JZCA9IGFjdGl2aXR5Lml0ZW0uaWQ7XG4gICAgICAgICAgICB0aGlzLm5leHRSb3VuZCgpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGFzeW5jIG5leHRSb3VuZCgpIHtcbiAgICAgICAgY29uc3QgbmV4dFJvdW5kID0gdGhpcy5sb2Fkb3V0WzBdO1xuICAgICAgICBjb25zdCBhY3RvciA9IHRoaXMuY2hhcmFjdGVyO1xuXG4gICAgICAgIC8vIE5vdGlmeSB0aGUgdXNlciB3aGF0IHRoZSBuZXh0IHJvdW5kIGlzXG4gICAgICAgIGNvbnN0IGh0bWxUZW1wbGF0ZSA9IGF3YWl0IChcbiAgICAgICAgICAgIGZvdW5kcnkuYXBwbGljYXRpb25zIGFzIGFueVxuICAgICAgICApLmhhbmRsZWJhcnMucmVuZGVyVGVtcGxhdGUoXG4gICAgICAgICAgICAnbW9kdWxlcy9mdnR0LXdlYXBvbi1yZWxvYWQvdGVtcGxhdGVzL2FtbW9SZWZ1bmROb3RpY2VUZW1wbGF0ZS5oYnMnLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGl0ZW06IHtcbiAgICAgICAgICAgICAgICAgICAgaW1nOiAnbW9kdWxlcy9mdnR0LXdlYXBvbi1yZWxvYWQvYXNzZXRzL2ljb25zL2J1bGxldHNfYndfaWNvbi5wbmcnLFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiBuZXh0Um91bmQsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogdGhpcy50cmFuc2xhdGUoXG4gICAgICAgICAgICAgICAgICAgICdXRUFQT05fUkVMT0FELkZlYXR1cmVzLk5leHRSb3VuZC5EZXNjcmlwdGlvbicsXG4gICAgICAgICAgICAgICAgICAgIHsgYnVsbGV0OiBuZXh0Um91bmQsIHdlYXBvbjogdGhpcy53ZWFwb24ubmFtZSB9LFxuICAgICAgICAgICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICB0aXRsZTogdGhpcy50cmFuc2xhdGUoJ1dFQVBPTl9SRUxPQUQuRmVhdHVyZXMuTmV4dFJvdW5kLlRpdGxlJyksXG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgICAgIHRoaXMubW9kdWxlTWFuYWdlci51aU1hbmFnZXIuc2VuZENoYXQoXG4gICAgICAgICAgICBhY3RvcixcbiAgICAgICAgICAgIGh0bWxUZW1wbGF0ZSxcbiAgICAgICAgICAgIHVuZGVmaW5lZCxcbiAgICAgICAgICAgIHVuZGVmaW5lZCxcbiAgICAgICAgICAgIFthY3Rvci5pZF0sXG4gICAgICAgICAgICBDT05TVC5DSEFUX01FU1NBR0VfVFlQRVMuV0hJU1BFUlxuICAgICAgICApO1xuICAgIH1cblxuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gJ2NsYXNzIE5leHRSb3VuZEZlYXR1cmUnO1xuICAgIH1cbn1cbiIsImltcG9ydCBEaWFsb2dWMiBmcm9tICdAbGVhZ3VlLW9mLWZvdW5kcnktZGV2ZWxvcGVycy9mb3VuZHJ5LXZ0dC10eXBlcy9zcmMvZm91bmRyeS9jbGllbnQtZXNtL2FwcGxpY2F0aW9ucy9hcGkvZGlhbG9nLm1qcyc7XG5pbXBvcnQgRmVhdHVyZU1hbmFnZXIgZnJvbSAnLi4vbWFuYWdlcnMvRmVhdHVyZU1hbmFnZXInO1xuaW1wb3J0IEJhc2VGZWF0dXJlIGZyb20gJy4vQmFzZUZlYXR1cmUnO1xuaW1wb3J0IHsgdHlwZSBBbW1vSXRlbU9wdGlvbiwgRG5kSXRlbTVlIH0gZnJvbSAnLi4vdHlwZXMnO1xuXG5leHBvcnQgY2xhc3MgUmVsb2FkRmVhdHVyZSBleHRlbmRzIEJhc2VGZWF0dXJlIHtcbiAgICBwcml2YXRlIF9ob29rSWQ6IG51bWJlcjtcbiAgICBwcml2YXRlIF9oYW5kbGVDaG9pY2VEaWFsb2dDbG9zZTogYm9vbGVhbjtcblxuICAgIGNvbnN0cnVjdG9yKGZlYXR1cmVNYW5hZ2VyOiBGZWF0dXJlTWFuYWdlcikge1xuICAgICAgICBzdXBlcihmZWF0dXJlTWFuYWdlcik7XG4gICAgICAgIHRoaXMuX2hvb2tJZCA9IC0xO1xuICAgICAgICB0aGlzLl9oYW5kbGVDaG9pY2VEaWFsb2dDbG9zZSA9IGZhbHNlO1xuICAgIH1cblxuICAgIGluaXQoKSB7XG4gICAgICAgIEhvb2tzLm9uKCdkbmQ1ZS5wcmVVc2VBY3Rpdml0eScsIHRoaXMub25Vc2VBY3Rpdml0eS5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICBvblVzZUFjdGl2aXR5KGFjdGl2aXR5OiBhbnkpIHtcbiAgICAgICAgaWYgKGFjdGl2aXR5LnR5cGUgPT09ICd1dGlsaXR5JyAmJiBhY3Rpdml0eS5uYW1lID09ICdSZWxvYWQnKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnV2VhcG9uIFJlbG9hZCB8IFRyaWdnZXJlZCBSZWxvYWQnKTtcblxuICAgICAgICAgICAgdGhpcy5jaGFyYWN0ZXJJZCA9IGFjdGl2aXR5LmFjdG9yLmlkO1xuICAgICAgICAgICAgdGhpcy53ZWFwb25JZCA9IGFjdGl2aXR5Lml0ZW0uaWQ7XG4gICAgICAgICAgICB0aGlzLndlYXBvblJlbG9hZCgpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHdlYXBvblJlbG9hZChyZWZ1bmRBbW1vOiBib29sZWFuID0gdHJ1ZSkge1xuICAgICAgICBjb25zdCBpdGVtcyA9IHRoaXMuY2hhcmFjdGVyPy5pdGVtcztcbiAgICAgICAgY29uc3QgY3VycmVudExvYWRvdXQgPSB0aGlzLmxvYWRvdXQ7XG4gICAgICAgIGNvbnN0IGludmVudG9yeUFtbXVuaXRpb24gPSB0aGlzLmFtbXVuaXRpb24oaXRlbXMpIGFzIERuZEl0ZW01ZVtdO1xuICAgICAgICBsZXQgYW1tdW5pdGlvbkNob2ljZXM6IEFtbW9JdGVtT3B0aW9uW10gPSBbXTtcblxuICAgICAgICBpZiAocmVmdW5kQW1tbykge1xuICAgICAgICAgICAgYW1tdW5pdGlvbkNob2ljZXMgPSB0aGlzLnJlZnVuZENoYW1iZXJlZEFtbW8oaW52ZW50b3J5QW1tdW5pdGlvbik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhbW11bml0aW9uQ2hvaWNlcyA9IGludmVudG9yeUFtbXVuaXRpb24ubWFwKFxuICAgICAgICAgICAgICAgIChhbW1vOiBEbmRJdGVtNWUpOiBBbW1vSXRlbU9wdGlvbiA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBhbW1vLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogYW1tby5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgY291bnQ6IGFtbW8uc3lzdGVtLnF1YW50aXR5LFxuICAgICAgICAgICAgICAgICAgICAgICAgZXF1aXBwZWQ6IGFtbW8uc3lzdGVtLmVxdWlwcGVkLFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBjaGVja0VxdWlwcGVkID0gZ2FtZS5zZXR0aW5ncy5nZXQoXG4gICAgICAgICAgICB0aGlzLm1vZHVsZU1hbmFnZXIuaWQsXG4gICAgICAgICAgICAnZmlsdGVyQW1tdW5pdGlvbkJ5RXF1aXBwZWQnXG4gICAgICAgICkgYXMgYm9vbGVhbjtcblxuICAgICAgICB0aGlzLmNob29zZUFtbXVuaXRpb24oXG4gICAgICAgICAgICBhbW11bml0aW9uQ2hvaWNlcy5maWx0ZXIoKGFtbW9JdGVtOiBBbW1vSXRlbU9wdGlvbikgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChhbW1vSXRlbS5jb3VudCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgKGNoZWNrRXF1aXBwZWQgJiYgYW1tb0l0ZW0uZXF1aXBwZWQpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAhY2hlY2tFcXVpcHBlZFxuICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgY3VycmVudExvYWRvdXRcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICByZWZ1bmRDaGFtYmVyZWRBbW1vKGludmVudG9yeUFtbXVuaXRpb246IERuZEl0ZW01ZVtdKTogQW1tb0l0ZW1PcHRpb25bXSB7XG4gICAgICAgIGNvbnN0IGxvYWRvdXRDb3VudHMgPSB0aGlzLmdldExvYWRvdXRDb3VudHModGhpcy5sb2Fkb3V0KTtcbiAgICAgICAgY29uc3QgYXZhaWxhYmxlQW1tdW5pdGlvbjogQW1tb0l0ZW1PcHRpb25bXSA9IFtdO1xuICAgICAgICBpbnZlbnRvcnlBbW11bml0aW9uLmZvckVhY2goKGFtbW86IERuZEl0ZW01ZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbmFtZSA9IGFtbW8ubmFtZTtcbiAgICAgICAgICAgIGNvbnN0IGFtbW9JbmZvOiBBbW1vSXRlbU9wdGlvbiA9IHtcbiAgICAgICAgICAgICAgICBuYW1lOiBhbW1vLm5hbWUsXG4gICAgICAgICAgICAgICAgdmFsdWU6IGFtbW8ubmFtZSxcbiAgICAgICAgICAgICAgICBjb3VudDogYW1tby5zeXN0ZW0ucXVhbnRpdHksXG4gICAgICAgICAgICAgICAgZXF1aXBwZWQ6IGFtbW8uc3lzdGVtLmVxdWlwcGVkLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGlmIChsb2Fkb3V0Q291bnRzW25hbWVdKSB7XG4gICAgICAgICAgICAgICAgYW1tb0luZm8uY291bnQgPSBhbW1vLnN5c3RlbS5xdWFudGl0eSArIGxvYWRvdXRDb3VudHNbbmFtZV07XG4gICAgICAgICAgICAgICAgYW1tby51cGRhdGUoe1xuICAgICAgICAgICAgICAgICAgICAnc3lzdGVtLnF1YW50aXR5JzogYW1tb0luZm8uY291bnQsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhdmFpbGFibGVBbW11bml0aW9uLnB1c2goYW1tb0luZm8pO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGF2YWlsYWJsZUFtbXVuaXRpb247XG4gICAgfVxuXG4gICAgb25TdWJtaXRDaG9vc2VBbW11bml0aW9uKHtcbiAgICAgICAgbG9hZG91dCxcbiAgICAgICAgcmVsb2FkQ2FuY2VsZWQsXG4gICAgfToge1xuICAgICAgICBsb2Fkb3V0OiBzdHJpbmdbXTtcbiAgICAgICAgcmVsb2FkQ2FuY2VsZWQ6IGJvb2xlYW47XG4gICAgfSk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICByZXR1cm4gdGhpcy5yZWxvYWRSZWxvYWRhYmxlV2VhcG9uKGxvYWRvdXQsIHJlbG9hZENhbmNlbGVkKTtcbiAgICB9XG5cbiAgICBhc3luYyBjaG9vc2VBbW11bml0aW9uKFxuICAgICAgICBhbW1vT3B0aW9uczogQW1tb0l0ZW1PcHRpb25bXSxcbiAgICAgICAgY3VycmVudExvYWRvdXQ6IHN0cmluZ1tdXG4gICAgKSB7XG4gICAgICAgIGNvbnN0IGRpYWxvZ0NvbnRlbnQgPSBhd2FpdCAoXG4gICAgICAgICAgICBmb3VuZHJ5LmFwcGxpY2F0aW9ucyBhcyBhbnlcbiAgICAgICAgKS5oYW5kbGViYXJzLnJlbmRlclRlbXBsYXRlKFxuICAgICAgICAgICAgJ21vZHVsZXMvZnZ0dC13ZWFwb24tcmVsb2FkL3RlbXBsYXRlcy9hbW1vU2VsZWN0aW9uRGlhbG9nVGVtcGxhdGUuaGJzJyxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBsb2Fkb3V0U2xvdHM6IG5ldyBBcnJheSh0aGlzLndlYXBvbi5zeXN0ZW0udXNlcy5tYXgpLmZpbGwoXG4gICAgICAgICAgICAgICAgICAgICdFbXB0eSdcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIGFtbW9PcHRpb25zLFxuICAgICAgICAgICAgfVxuICAgICAgICApO1xuXG4gICAgICAgIGNvbnN0IGRpYWxvZ0J1dHRvbnMgPSBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYWN0aW9uOiAnbG9hZCcsXG4gICAgICAgICAgICAgICAgbGFiZWw6IHRoaXMudHJhbnNsYXRlKFxuICAgICAgICAgICAgICAgICAgICAnV0VBUE9OX1JFTE9BRC5GZWF0dXJlcy5SZWxvYWQuQW1tdW5pdGlvbi5DaG9pY2VEaWFsb2dCdXR0b25UeHRMb2FkJ1xuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgY2FsbGJhY2s6IChcbiAgICAgICAgICAgICAgICAgICAgX2V2ZW50OiBQb2ludGVyRXZlbnQgfCBTdWJtaXRFdmVudCxcbiAgICAgICAgICAgICAgICAgICAgYnV0dG9uOiBIVE1MQnV0dG9uRWxlbWVudFxuICAgICAgICAgICAgICAgICkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9oYW5kbGVDaG9pY2VEaWFsb2dDbG9zZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBsb2Fkb3V0OiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKFxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGkgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgaSA8IChidXR0b24uZm9ybT8uZWxlbWVudHM/Lmxlbmd0aCBhcyBudW1iZXIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaSsrXG4gICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZWxtID0gYnV0dG9uLmZvcm0/LmVsZW1lbnRzLml0ZW0oXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaVxuICAgICAgICAgICAgICAgICAgICAgICAgKSBhcyBIVE1MU2VsZWN0RWxlbWVudDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlbG0/Lm5hbWUgPT0gJ2FtbW8tc2VsZWN0Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvYWRvdXQucHVzaChlbG0udmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7IGxvYWRvdXQsIHJlbG9hZENhbmNlbGVkOiBmYWxzZSB9O1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGFjdGlvbjogJ2NhbmNlbCcsXG4gICAgICAgICAgICAgICAgbGFiZWw6IHRoaXMudHJhbnNsYXRlKFxuICAgICAgICAgICAgICAgICAgICAnV0VBUE9OX1JFTE9BRC5GZWF0dXJlcy5SZWxvYWQuQW1tdW5pdGlvbi5DaG9pY2VEaWFsb2dCdXR0b25UeHRDYW5jZWwnXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBjYWxsYmFjazogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9oYW5kbGVDaG9pY2VEaWFsb2dDbG9zZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4geyBsb2Fkb3V0OiBjdXJyZW50TG9hZG91dCwgcmVsb2FkQ2FuY2VsZWQ6IHRydWUgfTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgXTtcblxuICAgICAgICBjb25zdCBvbkNsb3NlRGlhbG9nSG9vayA9IChkaWFsb2dWMjogRGlhbG9nVjIpID0+IHtcbiAgICAgICAgICAgIGlmIChkaWFsb2dWMi5pZCA9PT0gJ2FtbW8tY2hvaWNlLWRpYWxvZycpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm9uQ2xvc2VDaG9pY2VEaWFsb2coY3VycmVudExvYWRvdXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuX2hhbmRsZUNob2ljZURpYWxvZ0Nsb3NlID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5faG9va0lkID0gSG9va3Mub24oJ2Nsb3NlRGlhbG9nVjInLCBvbkNsb3NlRGlhbG9nSG9vay5iaW5kKHRoaXMpKTtcblxuICAgICAgICB0aGlzLm1vZHVsZU1hbmFnZXIudWlNYW5hZ2VyXG4gICAgICAgICAgICAuYnVpbGREaWFsb2coXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICB0aXRsZTogdGhpcy50cmFuc2xhdGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAnV0VBUE9OX1JFTE9BRC5GZWF0dXJlcy5SZWxvYWQuQW1tdW5pdGlvbi5DaG9pY2VEaWFsb2dUaXRsZSdcbiAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgY29udGVudDogZGlhbG9nQ29udGVudCxcbiAgICAgICAgICAgICAgICAgICAgYnV0dG9uczogZGlhbG9nQnV0dG9ucyxcbiAgICAgICAgICAgICAgICAgICAgb25TdWJtaXQ6IHRoaXMub25TdWJtaXRDaG9vc2VBbW11bml0aW9uLmJpbmQodGhpcyksXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAnYW1tby1jaG9pY2UtZGlhbG9nJ1xuICAgICAgICAgICAgKVxuICAgICAgICAgICAgLnJlbmRlcih7IGZvcmNlOiB0cnVlIH0pO1xuICAgIH1cblxuICAgIG9uQ2xvc2VDaG9pY2VEaWFsb2cobG9hZG91dDogc3RyaW5nW10pIHtcbiAgICAgICAgSG9va3Mub2ZmKCdjbG9zZURpYWxvZ1YyJywgdGhpcy5faG9va0lkKTtcbiAgICAgICAgdGhpcy5faG9va0lkID0gLTE7XG5cbiAgICAgICAgaWYgKHRoaXMuX2hhbmRsZUNob2ljZURpYWxvZ0Nsb3NlKSB7XG4gICAgICAgICAgICB0aGlzLl9oYW5kbGVDaG9pY2VEaWFsb2dDbG9zZSA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5yZWxvYWRSZWxvYWRhYmxlV2VhcG9uKGxvYWRvdXQsIHRydWUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgYXN5bmMgYnVpbGRSZWxvYWRDaGF0KFxuICAgICAgICByZWxvYWRhYmxlV2VhcG9uOiBJdGVtNWUsXG4gICAgICAgIHJlbG9hZENhbmNlbGVkOiBib29sZWFuLFxuICAgICAgICBsb2Fkb3V0OiBzdHJpbmdbXVxuICAgICkge1xuICAgICAgICByZXR1cm4gYXdhaXQgKGZvdW5kcnkuYXBwbGljYXRpb25zIGFzIGFueSkuaGFuZGxlYmFycy5yZW5kZXJUZW1wbGF0ZShcbiAgICAgICAgICAgICdtb2R1bGVzL2Z2dHQtd2VhcG9uLXJlbG9hZC90ZW1wbGF0ZXMvcmVsb2FkYWJsZVdlYXBvblJlbG9hZFRlbXBsYXRlLmhicycsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaXRlbToge1xuICAgICAgICAgICAgICAgICAgICBpbWc6IHJlbG9hZGFibGVXZWFwb24uaW1nLFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiByZWxvYWRhYmxlV2VhcG9uLm5hbWUsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBmbGF2b3I6IHRoaXMudHJhbnNsYXRlKFxuICAgICAgICAgICAgICAgICAgICByZWxvYWRDYW5jZWxlZFxuICAgICAgICAgICAgICAgICAgICAgICAgPyAnV0VBUE9OX1JFTE9BRC5GZWF0dXJlcy5SZWxvYWQuV2VhcG9uLldlYXBvblJlbG9hZGVkQ2hhdEZsYXZvckNhbmNlbGVkJ1xuICAgICAgICAgICAgICAgICAgICAgICAgOiAnV0VBUE9OX1JFTE9BRC5GZWF0dXJlcy5SZWxvYWQuV2VhcG9uLldlYXBvblJlbG9hZGVkQ2hhdEZsYXZvcidcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIHRpdGxlOiB0aGlzLnRyYW5zbGF0ZShcbiAgICAgICAgICAgICAgICAgICAgcmVsb2FkQ2FuY2VsZWRcbiAgICAgICAgICAgICAgICAgICAgICAgID8gJ1dFQVBPTl9SRUxPQUQuRmVhdHVyZXMuUmVsb2FkLldlYXBvbi5XZWFwb25SZWxvYWRlZENoYXRNc2dDYW5jZWxlZCdcbiAgICAgICAgICAgICAgICAgICAgICAgIDogJ1dFQVBPTl9SRUxPQUQuRmVhdHVyZXMuUmVsb2FkLldlYXBvbi5XZWFwb25SZWxvYWRlZENoYXRNc2cnLFxuICAgICAgICAgICAgICAgICAgICB7IHJlbG9hZGFibGVXZWFwb246IHJlbG9hZGFibGVXZWFwb24ubmFtZSB9LFxuICAgICAgICAgICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBsb2Fkb3V0OiBsb2Fkb3V0LFxuICAgICAgICAgICAgfVxuICAgICAgICApO1xuICAgIH1cblxuICAgIGFzeW5jIHJlbG9hZFJlbG9hZGFibGVXZWFwb24oXG4gICAgICAgIGxvYWRvdXQ6IHN0cmluZ1tdLFxuICAgICAgICByZWxvYWRDYW5jZWxlZDogYm9vbGVhbiA9IGZhbHNlXG4gICAgKSB7XG4gICAgICAgIGNvbnN0IHJlbG9hZGFibGVXZWFwb24gPSB0aGlzLndlYXBvbjtcbiAgICAgICAgY29uc3QgYW1tb0NvdW50cyA9IHRoaXMuZ2V0TG9hZG91dENvdW50cyhsb2Fkb3V0KTtcbiAgICAgICAgY29uc3QgY2FuY2VsZWRMb2Fkb3V0ID0gbmV3IEFycmF5KHRoaXMud2VhcG9uLnN5c3RlbS51c2VzLm1heCkuZmlsbChcbiAgICAgICAgICAgICdFbXB0eSdcbiAgICAgICAgKTtcbiAgICAgICAgbGV0IGh0bWxUZW1wbGF0ZTtcblxuICAgICAgICBpZiAodGhpcy5yZW1vdmVMb2Fkb3V0KGFtbW9Db3VudHMpKSB7XG4gICAgICAgICAgICAvLyBVcGRhdGUgdGhlIHJlbG9hZGFibGVXZWFwb24gdXNlc1xuICAgICAgICAgICAgbGV0IHF0eSA9IDA7XG4gICAgICAgICAgICBpZiAoYW1tb0NvdW50c1snRW1wdHknXSA+IDApIHtcbiAgICAgICAgICAgICAgICAvLyBBZGp1c3Qgc3BlbnQgdXNlcyBieSB0aGUgbnVtYmVyIG9mIEVtcHR5IHNsb3RzXG4gICAgICAgICAgICAgICAgcXR5ICs9IGFtbW9Db3VudHNbJ0VtcHR5J107XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhd2FpdCByZWxvYWRhYmxlV2VhcG9uLnVwZGF0ZSh7XG4gICAgICAgICAgICAgICAgJ3N5c3RlbS51c2VzLnNwZW50JzogcXR5LFxuICAgICAgICAgICAgICAgICdzeXN0ZW0udXNlcy52YWx1ZSc6IHJlbG9hZGFibGVXZWFwb24uc3lzdGVtLnVzZXMubWF4IC0gcXR5LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBhd2FpdCByZWxvYWRhYmxlV2VhcG9uLnNldEZsYWcoXG4gICAgICAgICAgICAgICAgdGhpcy5tb2R1bGVNYW5hZ2VyLmlkLFxuICAgICAgICAgICAgICAgICdjaGFtYmVyZWQnLFxuICAgICAgICAgICAgICAgIGxvYWRvdXRcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIGh0bWxUZW1wbGF0ZSA9IGF3YWl0IHRoaXMuYnVpbGRSZWxvYWRDaGF0KFxuICAgICAgICAgICAgICAgIHJlbG9hZGFibGVXZWFwb24sXG4gICAgICAgICAgICAgICAgcmVsb2FkQ2FuY2VsZWQsXG4gICAgICAgICAgICAgICAgbG9hZG91dFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIEhvb2tzLm9mZignY2xvc2VEaWFsb2dWMicsIHRoaXMuX2hvb2tJZCk7XG4gICAgICAgICAgICB0aGlzLl9ob29rSWQgPSAtMTtcbiAgICAgICAgICAgIGF3YWl0IHJlbG9hZGFibGVXZWFwb24uc2V0RmxhZyhcbiAgICAgICAgICAgICAgICB0aGlzLm1vZHVsZU1hbmFnZXIuaWQsXG4gICAgICAgICAgICAgICAgJ2NoYW1iZXJlZCcsXG4gICAgICAgICAgICAgICAgY2FuY2VsZWRMb2Fkb3V0XG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgaHRtbFRlbXBsYXRlID0gYXdhaXQgdGhpcy5idWlsZFJlbG9hZENoYXQoXG4gICAgICAgICAgICAgICAgcmVsb2FkYWJsZVdlYXBvbixcbiAgICAgICAgICAgICAgICByZWxvYWRDYW5jZWxlZCxcbiAgICAgICAgICAgICAgICBjYW5jZWxlZExvYWRvdXRcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgYXdhaXQgcmVsb2FkYWJsZVdlYXBvbi5zZXRGbGFnKFxuICAgICAgICAgICAgdGhpcy5tb2R1bGVNYW5hZ2VyLmlkLFxuICAgICAgICAgICAgJ2ZpcmVkJyxcbiAgICAgICAgICAgIGNhbmNlbGVkTG9hZG91dFxuICAgICAgICApO1xuXG4gICAgICAgIHRoaXMubW9kdWxlTWFuYWdlci51aU1hbmFnZXIuc2VuZENoYXQodGhpcy5jaGFyYWN0ZXIsIGh0bWxUZW1wbGF0ZSk7XG4gICAgICAgIHRoaXMuY2hhcmFjdGVySWQgPSAnJztcbiAgICAgICAgdGhpcy53ZWFwb25JZCA9ICcnO1xuXG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICByZW1vdmVMb2Fkb3V0KGNvdW50czogeyBba2V5OiBzdHJpbmddOiBudW1iZXIgfSk6IGJvb2xlYW4ge1xuICAgICAgICBsZXQgYW1tdW5pdGlvbkF2YWlsYWJsZSA9IHRydWU7XG4gICAgICAgIGNvbnN0IGludmVudG9yeUFtbXVuaXRpb24gPSB0aGlzLmFtbXVuaXRpb24oXG4gICAgICAgICAgICB0aGlzLmNoYXJhY3Rlcj8uaXRlbXNcbiAgICAgICAgKSBhcyBEbmRJdGVtNWVbXTtcbiAgICAgICAgaW52ZW50b3J5QW1tdW5pdGlvbi5mb3JFYWNoKChhbW1vOiBEbmRJdGVtNWUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5hbWUgPSBhbW1vLm5hbWU7XG4gICAgICAgICAgICBjb25zdCBxdHkgPSBhbW1vLnN5c3RlbS5xdWFudGl0eSAtIGNvdW50c1tuYW1lXTtcblxuICAgICAgICAgICAgLy8gSWYgYW55IGJ1bGxldCBpcyBhZGRlZCBiZXlvbmQgdGhlIHF1YW50aXR5IHRoZSBwbGF5ZXIgYWN0dWFsbHkgaGFzIHRoZW4gdGhyb3cgYW4gZXJyb3IgYW5kIHJldHVybiBmYWxzZVxuICAgICAgICAgICAgaWYgKHF0eSA8IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1vZHVsZU1hbmFnZXIudWlNYW5hZ2VyLnVpTm90aWZpY2F0aW9uKFxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRyYW5zbGF0ZShcbiAgICAgICAgICAgICAgICAgICAgICAgICdXRUFQT05fUkVMT0FELkZlYXR1cmVzLlJlbG9hZC5XZWFwb24uTG9hZGluZ0Vycm9yTXNnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgbmFtZTogYW1tby5uYW1lIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgICdlcnJvcidcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGFtbXVuaXRpb25BdmFpbGFibGUgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKGFtbXVuaXRpb25BdmFpbGFibGUpIHtcbiAgICAgICAgICAgIGludmVudG9yeUFtbXVuaXRpb24uZm9yRWFjaChhc3luYyAoYW1tbzogRG5kSXRlbTVlKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgbmFtZSA9IGFtbW8ubmFtZTtcbiAgICAgICAgICAgICAgICBpZiAoY291bnRzW25hbWVdKSB7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IGFtbW8udXBkYXRlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICdzeXN0ZW0ucXVhbnRpdHknOiBhbW1vLnN5c3RlbS5xdWFudGl0eSAtIGNvdW50c1tuYW1lXSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYW1tdW5pdGlvbkF2YWlsYWJsZTtcbiAgICB9XG5cbiAgICBhc3luYyBvblJlbG9hZENhbGxiYWNrKGFjdG9yOiBBY3RvcjVlLCB3ZWFwb246IERuZEl0ZW01ZSkge1xuICAgICAgICB0aGlzLmNoYXJhY3RlcklkID0gYWN0b3IuaWQ7XG4gICAgICAgIHRoaXMud2VhcG9uSWQgPSB3ZWFwb24uaWQ7XG5cbiAgICAgICAgdGhpcy53ZWFwb25SZWxvYWQoKTtcbiAgICB9XG5cbiAgICBnZXRMb2Fkb3V0Q291bnRzKGN1cnJlbnRMb2Fkb3V0OiBzdHJpbmdbXSk6IHtcbiAgICAgICAgW2tleTogc3RyaW5nXTogbnVtYmVyO1xuICAgIH0ge1xuICAgICAgICBjb25zdCBsb2Fkb3V0OiB7IFtrZXk6IHN0cmluZ106IG51bWJlciB9ID0ge307XG4gICAgICAgIGN1cnJlbnRMb2Fkb3V0LmZvckVhY2goKGFtbW86IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgaWYgKCFsb2Fkb3V0W2FtbW9dKSBsb2Fkb3V0W2FtbW9dID0gMDtcbiAgICAgICAgICAgIGxvYWRvdXRbYW1tb10gPSBsb2Fkb3V0W2FtbW9dICsgMTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBsb2Fkb3V0O1xuICAgIH1cblxuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gJ2NsYXNzIFJlbG9hZEZlYXR1cmUnO1xuICAgIH1cbn1cbiIsImltcG9ydCBGZWF0dXJlTWFuYWdlciBmcm9tICcuLi9tYW5hZ2Vycy9GZWF0dXJlTWFuYWdlcic7XG5pbXBvcnQgQmFzZUZlYXR1cmUgZnJvbSAnLi9CYXNlRmVhdHVyZSc7XG5cbmltcG9ydCB7XG4gICAgQWN0aXZpdHlDYXJkQ2hhdFR5cGUsXG4gICAgQ2hhdE1lc3NhZ2U1ZSxcbiAgICBEbmRJdGVtNWUsXG4gICAgRG5kRDIwUm9sbCxcbiAgICBEbmRBdHRhY2tFdmVudCxcbn0gZnJvbSAnLi4vdHlwZXMnO1xuXG5leHBvcnQgY2xhc3MgUmVsb2FkYWJsZVdlYXBvbkF0dGFja0ZlYXR1cmUgZXh0ZW5kcyBCYXNlRmVhdHVyZSB7XG4gICAgcHJpdmF0ZSBfbmV4dFJvdW5kOiB7XG4gICAgICAgIGlkOiBzdHJpbmc7XG4gICAgICAgIHR5cGU6IHN0cmluZztcbiAgICB9O1xuICAgIHByaXZhdGUgX2hvb2tJZDogbnVtYmVyO1xuXG4gICAgY29uc3RydWN0b3IoZmVhdHVyZU1hbmFnZXI6IEZlYXR1cmVNYW5hZ2VyKSB7XG4gICAgICAgIHN1cGVyKGZlYXR1cmVNYW5hZ2VyKTtcbiAgICAgICAgdGhpcy5fbmV4dFJvdW5kID0geyBpZDogJycsIHR5cGU6ICcnIH07XG4gICAgICAgIHRoaXMuX2hvb2tJZCA9IC0xO1xuICAgIH1cblxuICAgIGluaXQoKSB7XG4gICAgICAgIEhvb2tzLm9uKCdkbmQ1ZS5wb3N0Um9sbENvbmZpZ3VyYXRpb24nLCB0aGlzLm9uVXNlQWN0aXZpdHkuYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgb25Vc2VBY3Rpdml0eShkMjBSb2xsOiBEbmREMjBSb2xsW10sIGV2ZW50OiBEbmRBdHRhY2tFdmVudCkge1xuICAgICAgICBjb25zdCByb2xsID0gZDIwUm9sbFswXTtcbiAgICAgICAgY29uc3Qgd2VhcG9uRGF0YSA9IHJvbGw/LmRhdGE/Lml0ZW07XG4gICAgICAgIGlmICh3ZWFwb25EYXRhPy50eXBlPy5iYXNlSXRlbSAhPT0gJ3JlbG9hZGFibGVXZWFwb24nKSByZXR1cm47XG5cbiAgICAgICAgY29uc29sZS5sb2coJ1dlYXBvbiBSZWxvYWQgfCBUcmlnZ2VyZWQgQXR0YWNrJyk7XG4gICAgICAgIHRoaXMud2VhcG9uSWQgPSBldmVudC5zdWJqZWN0Lml0ZW0uaWQ7XG4gICAgICAgIHRoaXMuY2hhcmFjdGVySWQgPSBldmVudC5zdWJqZWN0LmFjdG9yLmlkO1xuXG4gICAgICAgIHJldHVybiB0aGlzLnJlbG9hZGFibGVXZWFwb25BdHRhY2soKTtcbiAgICB9XG5cbiAgICByZWxvYWRhYmxlV2VhcG9uQXR0YWNrKCkge1xuICAgICAgICBjb25zdCBidWxsZXQgPSB0aGlzLmdldE5leHRSb3VuZCgpO1xuXG4gICAgICAgIGlmIChidWxsZXQubmFtZSA9PSAnRW1wdHknKSB7XG4gICAgICAgICAgICB0aGlzLmRyeWZpcmVXZWFwb24oKTtcblxuICAgICAgICAgICAgLy8gU3RvcCB0aGUgYXR0YWNrIGlmIERyeSBmaXJpbmcgdGhlIHdlYXBvbiBhbmQgdGhlcmUgYXJlIG5vIG90aGVyIGJ1bGxldHMgbGVmdFxuICAgICAgICAgICAgaWYgKHRoaXMud2VhcG9uLnN5c3RlbS51c2VzLnNwZW50ID09IHRoaXMud2VhcG9uLnN5c3RlbS51c2VzLm1heCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChidWxsZXQubmFtZSAhPT0gJ0VtcHR5Jykge1xuICAgICAgICAgICAgdGhpcy5fbmV4dFJvdW5kID0ge1xuICAgICAgICAgICAgICAgIGlkOiBidWxsZXQuaWQsXG4gICAgICAgICAgICAgICAgdHlwZTogYnVsbGV0LnR5cGUsXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB0aGlzLl9ob29rSWQgPSBIb29rcy5vbihcbiAgICAgICAgICAgICAgICAnZG5kNWUucmVuZGVyQ2hhdE1lc3NhZ2UnLFxuICAgICAgICAgICAgICAgIHRoaXMub25SZW5kZXJDaGF0TWVzc2FnZS5iaW5kKHRoaXMpXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZmlyZVJvdW5kKGJ1bGxldCk7XG4gICAgfVxuXG4gICAgYXN5bmMgb25SZW5kZXJDaGF0TWVzc2FnZShtZXNzYWdlOiBDaGF0TWVzc2FnZTVlLCBodG1sOiBIVE1MRWxlbWVudCkge1xuICAgICAgICBjb25zdCBpdGVtSWQgPSBtZXNzYWdlLmZsYWdzLmRuZDVlPy5pdGVtLmlkO1xuICAgICAgICBjb25zdCBpdGVtVHlwZSA9IG1lc3NhZ2UuZmxhZ3MuZG5kNWU/Lml0ZW0udHlwZTtcbiAgICAgICAgaWYgKFxuICAgICAgICAgICAgdGhpcy5fbmV4dFJvdW5kLmlkID09PSBpdGVtSWQgJiZcbiAgICAgICAgICAgIHRoaXMuX25leHRSb3VuZC50eXBlID09PSBpdGVtVHlwZVxuICAgICAgICApIHtcbiAgICAgICAgICAgIEhvb2tzLm9mZignZG5kNWUucmVuZGVyQ2hhdE1lc3NhZ2UnLCB0aGlzLl9ob29rSWQpO1xuICAgICAgICAgICAgdGhpcy5fbmV4dFJvdW5kID0geyBpZDogJycsIHR5cGU6ICcnIH07XG5cbiAgICAgICAgICAgIGNvbnN0IGJ1bGxldCA9IHRoaXMuY2hhcmFjdGVyLml0ZW1zLmdldChpdGVtSWQpIGFzIERuZEl0ZW01ZTtcblxuICAgICAgICAgICAgY29uc3QgYWN0aXZhdGlvbkNhcmQgPSBodG1sLnF1ZXJ5U2VsZWN0b3IoJy5hY3RpdmF0aW9uLWNhcmQnKTtcbiAgICAgICAgICAgIGNvbnN0IGl0ZW1jYXJkID0gaHRtbC5xdWVyeVNlbGVjdG9yKCcuaXRlbS1jYXJkJyk7XG4gICAgICAgICAgICBjb25zdCBwYXJlbnRFbGVtZW50ID0gYWN0aXZhdGlvbkNhcmQgfHwgaXRlbWNhcmQ7XG5cbiAgICAgICAgICAgIC8vIEdyYWIgbW9kdWxlIGNvbmZpZ3VyYXRpb25zXG4gICAgICAgICAgICBjb25zdCBjaGVja1Vuc3RhYmxlQW1tbyA9IGdhbWUuc2V0dGluZ3MuZ2V0KFxuICAgICAgICAgICAgICAgIHRoaXMubW9kdWxlTWFuYWdlci5pZCxcbiAgICAgICAgICAgICAgICAndW5zdGFibGVBbW1vJ1xuICAgICAgICAgICAgKSBhcyBib29sZWFuO1xuXG4gICAgICAgICAgICBjb25zdCBjaGVja01pc2ZpcmUgPSBnYW1lLnNldHRpbmdzLmdldChcbiAgICAgICAgICAgICAgICB0aGlzLm1vZHVsZU1hbmFnZXIuaWQsXG4gICAgICAgICAgICAgICAgJ3VzZU1pc2ZpcmVzJ1xuICAgICAgICAgICAgKSBhcyBib29sZWFuO1xuXG4gICAgICAgICAgICBjb25zdCB1bnN0YWJsZUFtbW9GYWlsdXJlVGhyZXNob2xkID0gZ2FtZS5zZXR0aW5ncy5nZXQoXG4gICAgICAgICAgICAgICAgdGhpcy5tb2R1bGVNYW5hZ2VyLmlkLFxuICAgICAgICAgICAgICAgICd1bnN0YWJsZUFtbW9GYWlsdXJlVGhyZXNoaG9sZCdcbiAgICAgICAgICAgICkgYXMgbnVtYmVyO1xuXG4gICAgICAgICAgICAvLyBBZGQgdGhlIG1pc2ZpcmUgbWVzc2FnZVxuICAgICAgICAgICAgaWYgKGNoZWNrTWlzZmlyZSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNyaXRpY2FsRmFpbHVyZU1zZyA9XG4gICAgICAgICAgICAgICAgICAgIGNoZWNrVW5zdGFibGVBbW1vICYmXG4gICAgICAgICAgICAgICAgICAgIGJ1bGxldD8uc3lzdGVtLnByb3BlcnRpZXMuZmluZCgocHJvcDogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcHJvcCA9PT0gJ3Vuc3RhYmxlJztcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgID8gdGhpcy50cmFuc2xhdGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnV0VBUE9OX1JFTE9BRC5GZWF0dXJlcy5SZWxvYWRhYmxlV2VhcG9uQXR0YWNrLk1pc2ZpcmVVbnN0YWJsZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IGZhaWx1cmU6IGAke3Vuc3RhYmxlQW1tb0ZhaWx1cmVUaHJlc2hvbGR9YCB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICA6IHRoaXMudHJhbnNsYXRlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1dFQVBPTl9SRUxPQUQuRmVhdHVyZXMuUmVsb2FkYWJsZVdlYXBvbkF0dGFjay5NaXNmaXJlTmF0T25lJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgY2FyZENvbnRlbnRFbGVtZW50ID1cbiAgICAgICAgICAgICAgICAgICAgcGFyZW50RWxlbWVudD8ucXVlcnlTZWxlY3RvcignLmNhcmQtY29udGVudCcpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHdyYXBwZXJFbGVtZW50ID1cbiAgICAgICAgICAgICAgICAgICAgY2FyZENvbnRlbnRFbGVtZW50Py5xdWVyeVNlbGVjdG9yKCcud3JhcHBlcicpO1xuICAgICAgICAgICAgICAgIHdyYXBwZXJFbGVtZW50Py5pbnNlcnRBZGphY2VudEhUTUwoXG4gICAgICAgICAgICAgICAgICAgICdiZWZvcmVlbmQnLFxuICAgICAgICAgICAgICAgICAgICBgPHA+JHtjcml0aWNhbEZhaWx1cmVNc2d9PC9wPmBcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBBZGQgY2FyZCBidXR0b24gY29udGFpbmVyIGlmIG1pc3NpbmdcbiAgICAgICAgICAgIGlmIChpdGVtY2FyZCAmJiAhYWN0aXZhdGlvbkNhcmQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCByZWZlcmVuY2VFbGVtZW50ID1cbiAgICAgICAgICAgICAgICAgICAgcGFyZW50RWxlbWVudD8ucXVlcnlTZWxlY3RvcignLmNhcmQtaGVhZGVyJyk7XG4gICAgICAgICAgICAgICAgY29uc3QgYnV0dG9uQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICAgICAgYnV0dG9uQ29udGFpbmVyLmNsYXNzTmFtZSA9ICdjYXJkLWJ1dHRvbnMnO1xuICAgICAgICAgICAgICAgIHJlZmVyZW5jZUVsZW1lbnQ/LmFmdGVyKGJ1dHRvbkNvbnRhaW5lcik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IGNhcmRCdXR0b25zRWxlbWVudCA9XG4gICAgICAgICAgICAgICAgcGFyZW50RWxlbWVudD8ucXVlcnlTZWxlY3RvcignLmNhcmQtYnV0dG9ucycpO1xuXG4gICAgICAgICAgICAvLyBBZGQgTWlzZmlyZSBidXR0b25cbiAgICAgICAgICAgIGlmIChjaGVja01pc2ZpcmUpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBtaXNmaXJlQnRuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAgICAgICAgICAgbWlzZmlyZUJ0bi5vbmNsaWNrID0gdGhpcy5vbkNsaWNrTWlzZmlyZS5iaW5kKHRoaXMpO1xuICAgICAgICAgICAgICAgIG1pc2ZpcmVCdG4uaW5uZXJIVE1MID0gYCR7dGhpcy5tYWtlSWNvbignZmEtYnVyc3QnKX0ke3RoaXMudHJhbnNsYXRlKFxuICAgICAgICAgICAgICAgICAgICAnV0VBUE9OX1JFTE9BRC5GZWF0dXJlcy5SZWxvYWRhYmxlV2VhcG9uQXR0YWNrLk1pc2ZpcmVkQnRuVHh0J1xuICAgICAgICAgICAgICAgICl9YDtcbiAgICAgICAgICAgICAgICBjYXJkQnV0dG9uc0VsZW1lbnQ/LmFwcGVuZChtaXNmaXJlQnRuKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gQWRkIGFtbW8gcmVmdW5kIGJ1dHRvblxuICAgICAgICAgICAgY29uc3QgcmVmdW5kQnRuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAgICAgICByZWZ1bmRCdG4ub25jbGljayA9IHRoaXMub25DbGlja1JlZnVuZC5iaW5kKHRoaXMpO1xuICAgICAgICAgICAgcmVmdW5kQnRuLmlubmVySFRNTCA9IGAke3RoaXMubWFrZUljb24oJ2ZhLXVuZG8nKX0ke3RoaXMudHJhbnNsYXRlKFxuICAgICAgICAgICAgICAgICdXRUFQT05fUkVMT0FELkZlYXR1cmVzLlJlbG9hZGFibGVXZWFwb25BdHRhY2suUmVmdW5kQnRuVHh0J1xuICAgICAgICAgICAgKX1gO1xuICAgICAgICAgICAgY2FyZEJ1dHRvbnNFbGVtZW50Py5hcHBlbmQocmVmdW5kQnRuKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldE5leHRSb3VuZCgpOiBEbmRJdGVtNWUge1xuICAgICAgICBjb25zdCBjaGFyYWN0ZXIgPSB0aGlzLmNoYXJhY3RlcjtcbiAgICAgICAgY29uc3Qgd2VhcG9uID0gdGhpcy53ZWFwb247XG5cbiAgICAgICAgY29uc3QgbG9hZG91dCA9IHRoaXMubG9hZG91dDtcbiAgICAgICAgbG9hZG91dC5wdXNoKCdFbXB0eScpO1xuICAgICAgICBjb25zdCBuZXh0Um91bmQgPSBsb2Fkb3V0LnNoaWZ0KCk7XG5cbiAgICAgICAgLy8gUmVtb3ZlIHRoZSBidWxsZXQgZnJvbSB0aGUgcmVsb2FkYWJsZVdlYXBvbiBhbW11bml0aW9uXG4gICAgICAgIHdlYXBvbi5zZXRGbGFnKHRoaXMubW9kdWxlTWFuYWdlci5pZCwgJ2NoYW1iZXJlZCcsIGxvYWRvdXQpO1xuXG4gICAgICAgIGNvbnN0IGludmVudG9yeUFtbXVuaXRpb24gPSB0aGlzLmFtbXVuaXRpb24oXG4gICAgICAgICAgICBjaGFyYWN0ZXIuaXRlbXNcbiAgICAgICAgKSBhcyBEbmRJdGVtNWVbXTtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIGludmVudG9yeUFtbXVuaXRpb24uZmluZCgoYW1tbzogRG5kSXRlbTVlKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgbmFtZSA9IGFtbW8ubmFtZTtcbiAgICAgICAgICAgICAgICBpZiAobmFtZSA9PSBuZXh0Um91bmQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFtbW87XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfSkgfHwgKHsgbmFtZTogJ0VtcHR5JyB9IGFzIERuZEl0ZW01ZSlcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBkcnlmaXJlV2VhcG9uKCkge1xuICAgICAgICBjb25zdCBjaGFyYWN0ZXIgPSB0aGlzLmNoYXJhY3RlcjtcbiAgICAgICAgY29uc3Qgd2VhcG9uID0gdGhpcy53ZWFwb247XG5cbiAgICAgICAgY29uc3QgcmVuZGVySG9va0lkID0gSG9va3Mub24oXG4gICAgICAgICAgICAncmVuZGVyQ2hhdE1lc3NhZ2UnLFxuICAgICAgICAgICAgKF9jaGF0SXRlbSwgaHRtbCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlbG9hZEJ0biA9IGh0bWxbMF0ucXVlcnlTZWxlY3RvcignLnJlbG9hZC1hbW1vJyk7XG4gICAgICAgICAgICAgICAgcmVsb2FkQnRuPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWxvYWQoY2hhcmFjdGVyLCB3ZWFwb24pO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgaWYgKHJlbG9hZEJ0bikge1xuICAgICAgICAgICAgICAgICAgICBIb29rcy5vZmYoJ3JlbmRlckNoYXRNZXNzYWdlJywgcmVuZGVySG9va0lkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG5cbiAgICAgICAgY29uc3QgdGVtcGxhdGVEYXRhOiBBY3Rpdml0eUNhcmRDaGF0VHlwZSA9IHtcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiB7XG4gICAgICAgICAgICAgICAgY2hhdDogYDxwPiR7dGhpcy50cmFuc2xhdGUoXG4gICAgICAgICAgICAgICAgICAgICdXRUFQT05fUkVMT0FELkZlYXR1cmVzLlJlbG9hZGFibGVXZWFwb25BdHRhY2suRHJ5RmlyZURlc2NyaXB0aW9uJyxcbiAgICAgICAgICAgICAgICAgICAgeyBuYW1lOiBjaGFyYWN0ZXIubmFtZSwgcmVsb2FkYWJsZVdlYXBvbjogd2VhcG9uLm5hbWUgfSxcbiAgICAgICAgICAgICAgICAgICAgdHJ1ZVxuICAgICAgICAgICAgICAgICl9PC9wPmAsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgaXRlbToge1xuICAgICAgICAgICAgICAgIGltZzogd2VhcG9uLmltZyxcbiAgICAgICAgICAgICAgICBuYW1lOiB0aGlzLnRyYW5zbGF0ZShcbiAgICAgICAgICAgICAgICAgICAgJ1dFQVBPTl9SRUxPQUQuRmVhdHVyZXMuUmVsb2FkYWJsZVdlYXBvbkF0dGFjay5EcnlGaXJlVGl0bGUnXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzdWJ0aXRsZTogd2VhcG9uLm5hbWUsXG4gICAgICAgICAgICBidXR0b25zOiBbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBkYXRhc2V0OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2aXNpYmlsaXR5OiAnYWxsJyxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgaWNvbjogdGhpcy5tYWtlSWNvbignZmEtcm90YXRlLXJpZ2h0JyksXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiB0aGlzLnRyYW5zbGF0ZSgnV0VBUE9OX1JFTE9BRC5GZWF0dXJlcy5SZWxvYWQuVGV4dCcpLFxuICAgICAgICAgICAgICAgICAgICBjbGFzc2VzOiAncmVsb2FkLWFtbW8nLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBdLFxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMucmVuZGVyQ2FyZCh0ZW1wbGF0ZURhdGEsIGNoYXJhY3Rlcik7XG4gICAgfVxuXG4gICAgYXN5bmMgcmVuZGVyQ2FyZCh0ZW1wbGF0ZURhdGE6IEFjdGl2aXR5Q2FyZENoYXRUeXBlLCBjaGFyYWN0ZXI6IEFjdG9yNWUpIHtcbiAgICAgICAgY29uc3QgaHRtbFRlbXBsYXRlID0gYXdhaXQgKFxuICAgICAgICAgICAgZm91bmRyeS5hcHBsaWNhdGlvbnMgYXMgYW55XG4gICAgICAgICkuaGFuZGxlYmFycy5yZW5kZXJUZW1wbGF0ZShcbiAgICAgICAgICAgICdtb2R1bGVzL2Z2dHQtd2VhcG9uLXJlbG9hZC90ZW1wbGF0ZXMvYWN0aXZpdHktY2FyZC5oYnMnLFxuICAgICAgICAgICAgdGVtcGxhdGVEYXRhXG4gICAgICAgICk7XG4gICAgICAgIHRoaXMubW9kdWxlTWFuYWdlci51aU1hbmFnZXIuc2VuZENoYXQoY2hhcmFjdGVyLCBodG1sVGVtcGxhdGUpO1xuICAgIH1cblxuICAgIGZpcmVSb3VuZChidWxsZXQ6IERuZEl0ZW01ZSkge1xuICAgICAgICBjb25zb2xlLmxvZygnZmlyZVJvdW5kOiAnLCBidWxsZXQpO1xuICAgICAgICBjb25zdCByZWxvYWRhYmxlV2VhcG9uID0gdGhpcy53ZWFwb247XG4gICAgICAgIGNvbnN0IG1heFNob3RzID0gcmVsb2FkYWJsZVdlYXBvbi5zeXN0ZW0udXNlcy5tYXg7XG4gICAgICAgIGNvbnN0IGZpcmVkTG9hZG91dCA9XG4gICAgICAgICAgICAocmVsb2FkYWJsZVdlYXBvbi5nZXRGbGFnKFxuICAgICAgICAgICAgICAgIHRoaXMubW9kdWxlTWFuYWdlci5pZCxcbiAgICAgICAgICAgICAgICAnZmlyZWQnXG4gICAgICAgICAgICApIGFzIHN0cmluZ1tdKSB8fCBuZXcgQXJyYXkobWF4U2hvdHMpLmZpbGwoJ0VtcHR5Jyk7XG5cbiAgICAgICAgZmlyZWRMb2Fkb3V0LnVuc2hpZnQoYnVsbGV0Lm5hbWUpO1xuICAgICAgICBmaXJlZExvYWRvdXQuc3BsaWNlKC0xKTtcbiAgICAgICAgcmVsb2FkYWJsZVdlYXBvbi5zZXRGbGFnKHRoaXMubW9kdWxlTWFuYWdlci5pZCwgJ2ZpcmVkJywgZmlyZWRMb2Fkb3V0KTtcblxuICAgICAgICBpZiAoYnVsbGV0Lm5hbWUgIT09ICdFbXB0eScpIHtcbiAgICAgICAgICAgIGNvbnN0IHVzZXMgPSByZWxvYWRhYmxlV2VhcG9uLnN5c3RlbS51c2VzO1xuICAgICAgICAgICAgY29uc3QgcXR5OiBudW1iZXIgPVxuICAgICAgICAgICAgICAgIHVzZXMuc3BlbnQgKyAxIDw9IHVzZXMubWF4ID8gdXNlcy5zcGVudCArIDEgOiB1c2VzLm1heDtcblxuICAgICAgICAgICAgcmVsb2FkYWJsZVdlYXBvbi51cGRhdGUoe1xuICAgICAgICAgICAgICAgICdzeXN0ZW0udXNlcy5zcGVudCc6IHF0eSxcbiAgICAgICAgICAgICAgICAnc3lzdGVtLnVzZXMudmFsdWUnOiB1c2VzLm1heCAtIHF0eSxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBidWxsZXQudXNlKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgcmVsb2FkKGFjdG9yOiBBY3RvcjVlLCByZWxvYWRhYmxlV2VhcG9uOiBEbmRJdGVtNWUpIHtcbiAgICAgICAgdGhpcy5mZWF0dXJlTWFuYWdlclxuICAgICAgICAgICAgLmdldEZlYXR1cmUoJ3JlbG9hZCcpXG4gICAgICAgICAgICAub25SZWxvYWRDYWxsYmFjayhhY3RvciwgcmVsb2FkYWJsZVdlYXBvbik7XG4gICAgfVxuXG4gICAgYXN5bmMgb25DbGlja1JlZnVuZCgpIHtcbiAgICAgICAgY29uc3QgYWN0b3IgPSB0aGlzLmNoYXJhY3RlcjtcbiAgICAgICAgY29uc3QgcmVsb2FkYWJsZVdlYXBvbiA9IHRoaXMud2VhcG9uO1xuICAgICAgICBjb25zdCBpbnZlbnRvcnlBbW11bml0aW9uID0gdGhpcy5hbW11bml0aW9uKGFjdG9yLml0ZW1zKTtcblxuICAgICAgICBjb25zdCBmaXJlZCA9IHRoaXMuZmlyZWQ7XG4gICAgICAgIGNvbnN0IHJlZnVuZDogc3RyaW5nID0gZmlyZWQuc3BsaWNlKDAsIDEpWzBdIGFzIHN0cmluZztcbiAgICAgICAgZmlyZWQucHVzaCgnRW1wdHknKTtcblxuICAgICAgICBpZiAocmVmdW5kID09ICdFbXB0eScpIHtcbiAgICAgICAgICAgIC8vIE5vdGlmeSB0aGUgdXNlciB0aGF0IHRoZXJlIGlzIG5vIGFtbXVuaXRpb24gdG8gcmVmdW5kXG4gICAgICAgICAgICB0aGlzLm1vZHVsZU1hbmFnZXIudWlNYW5hZ2VyLnVpTm90aWZpY2F0aW9uKFxuICAgICAgICAgICAgICAgIHRoaXMudHJhbnNsYXRlKFxuICAgICAgICAgICAgICAgICAgICAnV0VBUE9OX1JFTE9BRC5GZWF0dXJlcy5SZWxvYWRhYmxlV2VhcG9uQXR0YWNrLlJlZnVuZC5SZWZ1bmROb01vcmVNc2cnLFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBhY3Rvci5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVsb2FkYWJsZVdlYXBvbjogcmVsb2FkYWJsZVdlYXBvbi5uYW1lLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAnd2FybidcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBhd2FpdCByZWxvYWRhYmxlV2VhcG9uLnNldEZsYWcodGhpcy5tb2R1bGVNYW5hZ2VyLmlkLCAnZmlyZWQnLCBmaXJlZCk7XG5cbiAgICAgICAgbGV0IGJ1bGxldCA9IHsgbmFtZTogcmVmdW5kIH0gYXMgRG5kSXRlbTVlO1xuICAgICAgICBpbnZlbnRvcnlBbW11bml0aW9uLmZvckVhY2goKGFtbW86IEl0ZW01ZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbmFtZSA9IGFtbW8ubmFtZTtcbiAgICAgICAgICAgIGlmIChuYW1lID09IHJlZnVuZCkge1xuICAgICAgICAgICAgICAgIGJ1bGxldCA9IGFtbW8gYXMgRG5kSXRlbTVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBSZWZ1bmQgdGhlIG5vbi1FbXB0eSBhbW11bml0aW9uXG4gICAgICAgIGNvbnN0IGFtbW9Mb2Fkb3V0ID0gdGhpcy5sb2Fkb3V0O1xuICAgICAgICBhbW1vTG9hZG91dC51bnNoaWZ0KHJlZnVuZCk7XG4gICAgICAgIGFtbW9Mb2Fkb3V0LnNwbGljZSgtMSk7XG4gICAgICAgIGF3YWl0IHJlbG9hZGFibGVXZWFwb24uc2V0RmxhZyhcbiAgICAgICAgICAgIHRoaXMubW9kdWxlTWFuYWdlci5pZCxcbiAgICAgICAgICAgICdjaGFtYmVyZWQnLFxuICAgICAgICAgICAgYW1tb0xvYWRvdXRcbiAgICAgICAgKTtcblxuICAgICAgICAvLyBVcGRhdGUgdGhlIHJlbG9hZGFibGVXZWFwb24gdXNlc1xuICAgICAgICBjb25zdCB1c2VzID0gcmVsb2FkYWJsZVdlYXBvbi5zeXN0ZW0udXNlcztcbiAgICAgICAgY29uc3QgcXR5OiBudW1iZXIgPSB1c2VzLnNwZW50IC0gMSA+PSAwID8gdXNlcy5zcGVudCAtIDEgOiAwO1xuICAgICAgICByZWxvYWRhYmxlV2VhcG9uLnVwZGF0ZSh7XG4gICAgICAgICAgICAnc3lzdGVtLnVzZXMuc3BlbnQnOiBxdHksXG4gICAgICAgICAgICAnc3lzdGVtLnVzZXMudmFsdWUnOiB1c2VzLm1heCAtIHF0eSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gTm90aWZ5IHRoZSB1c2VyIHRoYXQgdGhlIHJlZnVuZCB3YXMgYSBzdWNjZXNzXG4gICAgICAgIGNvbnN0IGh0bWxUZW1wbGF0ZSA9IGF3YWl0IChcbiAgICAgICAgICAgIGZvdW5kcnkuYXBwbGljYXRpb25zIGFzIGFueVxuICAgICAgICApLmhhbmRsZWJhcnMucmVuZGVyVGVtcGxhdGUoXG4gICAgICAgICAgICAnbW9kdWxlcy9mdnR0LXdlYXBvbi1yZWxvYWQvdGVtcGxhdGVzL2FtbW9SZWZ1bmROb3RpY2VUZW1wbGF0ZS5oYnMnLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGl0ZW06IHtcbiAgICAgICAgICAgICAgICAgICAgaW1nOiBidWxsZXQuaW1nLFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiBidWxsZXQubmFtZSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiB0aGlzLnRyYW5zbGF0ZShcbiAgICAgICAgICAgICAgICAgICAgJ1dFQVBPTl9SRUxPQUQuRmVhdHVyZXMuUmVsb2FkYWJsZVdlYXBvbkF0dGFjay5SZWZ1bmQuUmVmdW5kQ29tcGxldGVNc2cnLFxuICAgICAgICAgICAgICAgICAgICB7IGJ1bGxldDogcmVmdW5kLCBuYW1lOiByZWxvYWRhYmxlV2VhcG9uLm5hbWUgfSxcbiAgICAgICAgICAgICAgICAgICAgdHJ1ZVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgdGl0bGU6IHRoaXMudHJhbnNsYXRlKFxuICAgICAgICAgICAgICAgICAgICAnV0VBUE9OX1JFTE9BRC5GZWF0dXJlcy5SZWxvYWRhYmxlV2VhcG9uQXR0YWNrLlJlZnVuZC5SZWZ1bmRDb21wbGV0ZVRpdGxlJ1xuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgICAgIHRoaXMubW9kdWxlTWFuYWdlci51aU1hbmFnZXIuc2VuZENoYXQoYWN0b3IsIGh0bWxUZW1wbGF0ZSk7XG4gICAgfVxuXG4gICAgYXN5bmMgb25DbGlja01pc2ZpcmUoKSB7XG4gICAgICAgIGNvbnN0IGFjdG9yID0gdGhpcy5jaGFyYWN0ZXI7XG4gICAgICAgIGNvbnN0IHJvbGwgPSBhd2FpdCBuZXcgUm9sbCgnMWQ2Jykucm9sbCgpO1xuICAgICAgICBhd2FpdCByb2xsLnRvTWVzc2FnZSh7XG4gICAgICAgICAgICBzcGVha2VyOiB7XG4gICAgICAgICAgICAgICAgYWxpYXM6IGFjdG9yLm5hbWUsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBtYWtlSWNvbihpY29uOiBzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIGA8aSBjbGFzcz1cImZhcyAke2ljb259XCI+PC9pPmA7XG4gICAgfVxuXG4gICAgdG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiAnY2xhc3MgUmVsb2FkYWJsZVdlYXBvbkF0dGFja0ZlYXR1cmUnO1xuICAgIH1cbn1cbiIsImltcG9ydCBGZWF0dXJlTWFuYWdlciBmcm9tICcuLi9tYW5hZ2Vycy9GZWF0dXJlTWFuYWdlcic7XG5pbXBvcnQgQmFzZUZlYXR1cmUgZnJvbSAnLi9CYXNlRmVhdHVyZSc7XG5pbXBvcnQgeyBEbmRJdGVtNWUgfSBmcm9tICcuLi90eXBlcyc7XG5cbmV4cG9ydCBjbGFzcyBSZWxvYWRhYmxlV2VhcG9uQ3JlYXRpb25GZWF0dXJlIGV4dGVuZHMgQmFzZUZlYXR1cmUge1xuICAgIHByaXZhdGUgX2NyZWF0aW5nUmVsb2FkYWJsZVdlYXBvbjogYm9vbGVhbjtcbiAgICBwcml2YXRlIF9jcmVhdGVJdGVtSG9va0lkOiBudW1iZXI7XG5cbiAgICBjb25zdHJ1Y3RvcihmZWF0dXJlTWFuYWdlcjogRmVhdHVyZU1hbmFnZXIpIHtcbiAgICAgICAgc3VwZXIoZmVhdHVyZU1hbmFnZXIpO1xuICAgICAgICB0aGlzLl9jcmVhdGluZ1JlbG9hZGFibGVXZWFwb24gPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fY3JlYXRlSXRlbUhvb2tJZCA9IC0xO1xuICAgIH1cblxuICAgIGluaXQoKSB7XG4gICAgICAgIEhvb2tzLm9uKCdwcmVDcmVhdGVJdGVtJywgdGhpcy5vblByZUNyZWF0ZUl0ZW0uYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgYXN5bmMgb25QcmVDcmVhdGVJdGVtKGl0ZW06IERuZEl0ZW01ZSkge1xuICAgICAgICBpZiAoaXRlbS5zeXN0ZW0udHlwZS5iYXNlSXRlbSA9PSAncmVsb2FkYWJsZVdlYXBvbicpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdXZWFwb24gUmVsb2FkIHwgVHJpZ2dlcmVkIFByZS1DcmVhdGlvbicpO1xuXG4gICAgICAgICAgICB0aGlzLndlYXBvbklkID0gaXRlbS5pZDtcbiAgICAgICAgICAgIHRoaXMuY2hhcmFjdGVySWQgPSBpdGVtLmFjdG9yPy5pZCBhcyBzdHJpbmc7XG4gICAgICAgICAgICB0aGlzLl9jcmVhdGluZ1JlbG9hZGFibGVXZWFwb24gPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5fY3JlYXRlSXRlbUhvb2tJZCA9IEhvb2tzLm9uKFxuICAgICAgICAgICAgICAgICdjcmVhdGVJdGVtJyxcbiAgICAgICAgICAgICAgICB0aGlzLm9uQ3JlYXRlSXRlbS5iaW5kKHRoaXMpXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgYXN5bmMgb25DcmVhdGVJdGVtKGl0ZW06IERuZEl0ZW01ZSkge1xuICAgICAgICBpZiAoIXRoaXMuX2NyZWF0aW5nUmVsb2FkYWJsZVdlYXBvbiB8fCBpdGVtLmlkICE9PSB0aGlzLndlYXBvbklkKVxuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKCdXZWFwb24gUmVsb2FkIHwgVHJpZ2dlcmVkIFJlbG9hZGFibGVXZWFwb24gQ3JlYXRpb24nKTtcblxuICAgICAgICBjb25zdCByZWxvYWRhYmxlV2VhcG9uID0gdGhpcy53ZWFwb247XG4gICAgICAgIGNvbnN0IGFtbW9RdHkgPSByZWxvYWRhYmxlV2VhcG9uLnN5c3RlbS51c2VzLm1heDtcblxuICAgICAgICBhd2FpdCByZWxvYWRhYmxlV2VhcG9uLnVwZGF0ZSh7XG4gICAgICAgICAgICAnc3lzdGVtLnVzZXMuc3BlbnQnOiBhbW1vUXR5LFxuICAgICAgICAgICAgJ3N5c3RlbS51c2VzLnZhbHVlJzogMCxcbiAgICAgICAgfSk7XG4gICAgICAgIGF3YWl0IHJlbG9hZGFibGVXZWFwb24uc2V0RmxhZyhcbiAgICAgICAgICAgIHRoaXMubW9kdWxlTWFuYWdlci5pZCxcbiAgICAgICAgICAgICdjaGFtYmVyZWQnLFxuICAgICAgICAgICAgbmV3IEFycmF5KGFtbW9RdHkpLmZpbGwoJ0VtcHR5JylcbiAgICAgICAgKTtcbiAgICAgICAgYXdhaXQgcmVsb2FkYWJsZVdlYXBvbi5zZXRGbGFnKFxuICAgICAgICAgICAgdGhpcy5tb2R1bGVNYW5hZ2VyLmlkLFxuICAgICAgICAgICAgJ2ZpcmVkJyxcbiAgICAgICAgICAgIG5ldyBBcnJheShhbW1vUXR5KS5maWxsKCdFbXB0eScpXG4gICAgICAgICk7XG5cbiAgICAgICAgdGhpcy53ZWFwb25JZCA9ICcnO1xuICAgICAgICB0aGlzLmNoYXJhY3RlcklkID0gJyc7XG4gICAgICAgIHRoaXMuX2NyZWF0aW5nUmVsb2FkYWJsZVdlYXBvbiA9IGZhbHNlO1xuICAgICAgICBIb29rcy5vZmYoJ2NyZWF0ZUl0ZW0nLCB0aGlzLl9jcmVhdGVJdGVtSG9va0lkKTtcbiAgICAgICAgdGhpcy5fY3JlYXRlSXRlbUhvb2tJZCA9IC0xO1xuICAgIH1cblxuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gJ2NsYXNzIFJlbG9hZGFibGVXZWFwb25DcmVhdGlvbkZlYXR1cmUnO1xuICAgIH1cbn1cbiIsImV4cG9ydCB7IE5leHRSb3VuZEZlYXR1cmUgfSBmcm9tICcuL05leHRSb3VuZEZlYXR1cmUnO1xuZXhwb3J0IHsgUmVsb2FkYWJsZVdlYXBvbkF0dGFja0ZlYXR1cmUgfSBmcm9tICcuL1JlbG9hZGFibGVXZWFwb25BdHRhY2tGZWF0dXJlJztcbmV4cG9ydCB7IFJlbG9hZGFibGVXZWFwb25DcmVhdGlvbkZlYXR1cmUgfSBmcm9tICcuL1JlbG9hZGFibGVXZWFwb25DcmVhdGlvbkZlYXR1cmUnO1xuZXhwb3J0IHsgUmVsb2FkRmVhdHVyZSB9IGZyb20gJy4vUmVsb2FkRmVhdHVyZSc7XG4iLCJpbXBvcnQgTW9kdWxlTWFuYWdlciBmcm9tICcuL01vZHVsZU1hbmFnZXInO1xuaW1wb3J0IHtcbiAgICBOZXh0Um91bmRGZWF0dXJlLFxuICAgIFJlbG9hZGFibGVXZWFwb25BdHRhY2tGZWF0dXJlLFxuICAgIFJlbG9hZGFibGVXZWFwb25DcmVhdGlvbkZlYXR1cmUsXG4gICAgUmVsb2FkRmVhdHVyZSxcbn0gZnJvbSAnLi4vZmVhdHVyZXMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBGZWF0dXJlTWFuYWdlciB7XG4gICAgcHJpdmF0ZSBfbW9kdWxlTWFuYWdlcjogTW9kdWxlTWFuYWdlcjtcbiAgICBwcml2YXRlIF9mZWF0dXJlczogeyBba2V5OiBzdHJpbmddOiBhbnkgfTtcblxuICAgIGNvbnN0cnVjdG9yKG1vZHVsZU1hbmFnZXI6IE1vZHVsZU1hbmFnZXIpIHtcbiAgICAgICAgdGhpcy5fbW9kdWxlTWFuYWdlciA9IG1vZHVsZU1hbmFnZXI7XG4gICAgICAgIHRoaXMuX2ZlYXR1cmVzID0ge307XG4gICAgfVxuXG4gICAgaW5pdCgpIHtcbiAgICAgICAgdGhpcy5fZmVhdHVyZXMgPSB7XG4gICAgICAgICAgICBuZXh0Um91bmQ6IG5ldyBOZXh0Um91bmRGZWF0dXJlKHRoaXMpLFxuICAgICAgICAgICAgcmVsb2FkOiBuZXcgUmVsb2FkRmVhdHVyZSh0aGlzKSxcbiAgICAgICAgICAgIHJlbG9hZGFibGVXZWFwb25BdHRhY2s6IG5ldyBSZWxvYWRhYmxlV2VhcG9uQXR0YWNrRmVhdHVyZSh0aGlzKSxcbiAgICAgICAgICAgIHJlbG9hZGFibGVXZWFwb25DcmVhdGlvbjogbmV3IFJlbG9hZGFibGVXZWFwb25DcmVhdGlvbkZlYXR1cmUodGhpcyksXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZ2V0RmVhdHVyZShpZDogc3RyaW5nKSB7XG4gICAgICAgIGlmICh0aGlzLl9mZWF0dXJlc1tpZF0pIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9mZWF0dXJlc1tpZF07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgZ2V0IG1vZHVsZU1hbmFnZXIoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9tb2R1bGVNYW5hZ2VyO1xuICAgIH1cblxuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gYGNsYXNzIEZlYXR1cmVNYW5hZ2VyOiAke3RoaXMuX2ZlYXR1cmVzLmxlbmd0aH1gO1xuICAgIH1cbn1cbiIsImltcG9ydCBGZWF0dXJlTWFuYWdlciBmcm9tICcuL0ZlYXR1cmVNYW5hZ2VyJztcbmltcG9ydCBVaU1hbmFnZXIgZnJvbSAnLi9VaU1hbmFnZXInO1xuaW1wb3J0IFRlbXBsYXRlTWFuYWdlciBmcm9tICcuL1RlbXBsYXRlTWFuYWdlcic7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1vZHVsZU1hbmFnZXIge1xuICAgIHByaXZhdGUgX21vZHVsZUlkOiBzdHJpbmc7XG4gICAgcHJpdmF0ZSBfZmVhdHVyZU1hbmFnZXI6IEZlYXR1cmVNYW5hZ2VyO1xuICAgIHByaXZhdGUgX3VpTWFuYWdlcjogVWlNYW5hZ2VyO1xuICAgIHByaXZhdGUgX3RlbXBsYXRlTWFuYWdlcjogVGVtcGxhdGVNYW5hZ2VyO1xuXG4gICAgY29uc3RydWN0b3IoaWQ6IHN0cmluZykge1xuICAgICAgICB0aGlzLl9tb2R1bGVJZCA9IGlkO1xuICAgICAgICB0aGlzLl9mZWF0dXJlTWFuYWdlciA9IG5ldyBGZWF0dXJlTWFuYWdlcih0aGlzKTtcbiAgICAgICAgdGhpcy5fdWlNYW5hZ2VyID0gbmV3IFVpTWFuYWdlcih0aGlzKTtcbiAgICAgICAgdGhpcy5fdGVtcGxhdGVNYW5hZ2VyID0gbmV3IFRlbXBsYXRlTWFuYWdlcigpO1xuICAgIH1cblxuICAgIGdldCBpZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX21vZHVsZUlkO1xuICAgIH1cblxuICAgIGdldCBmZWF0dXJlTWFuYWdlcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ZlYXR1cmVNYW5hZ2VyO1xuICAgIH1cblxuICAgIGdldCB1aU1hbmFnZXIoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl91aU1hbmFnZXI7XG4gICAgfVxuXG4gICAgZ2V0IHRlbXBsYXRlTWFuYWdlcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3RlbXBsYXRlTWFuYWdlcjtcbiAgICB9XG5cbiAgICBpbml0KCkge1xuICAgICAgICB0aGlzLnN5c3RlbU92ZXJyaWRlcygpO1xuICAgICAgICB0aGlzLm1vZHVsZUNvbmZpZ3VyYXRpb25zKCk7XG4gICAgICAgIHRoaXMuX2ZlYXR1cmVNYW5hZ2VyLmluaXQoKTtcbiAgICAgICAgdGhpcy5fdGVtcGxhdGVNYW5hZ2VyLmluaXQoKTtcbiAgICB9XG5cbiAgICBzeXN0ZW1PdmVycmlkZXMoKSB7XG4gICAgICAgIChDT05GSUcgYXMgYW55KS5ETkQ1RS5mZWF0dXJlVHlwZXMuaXRlbSA9IHtcbiAgICAgICAgICAgIGxhYmVsOiB0aGlzLnVpTWFuYWdlci5nZXRMb2NhbGl6ZWRUeHQoJ1dFQVBPTl9SRUxPQUQuSXRlbUZlYXR1cmUnKSxcbiAgICAgICAgfTtcblxuICAgICAgICAoQ09ORklHIGFzIGFueSkuRE5ENUUuaXRlbVByb3BlcnRpZXMuY29uY2VhbGFibGUgPSB7XG4gICAgICAgICAgICBsYWJlbDogdGhpcy51aU1hbmFnZXIuZ2V0TG9jYWxpemVkVHh0KCdXRUFQT05fUkVMT0FELkNvbmNlYWxhYmxlJyksXG4gICAgICAgIH07XG4gICAgICAgIChDT05GSUcgYXMgYW55KS5ETkQ1RS52YWxpZFByb3BlcnRpZXMud2VhcG9uLmFkZCgnY29uY2VhbGFibGUnKTtcblxuICAgICAgICAoQ09ORklHIGFzIGFueSkuRE5ENUUuaXRlbVByb3BlcnRpZXMudW5zdGFibGUgPSB7XG4gICAgICAgICAgICBsYWJlbDogdGhpcy51aU1hbmFnZXIuZ2V0TG9jYWxpemVkVHh0KCdXRUFQT05fUkVMT0FELlVuc3RhYmxlJyksXG4gICAgICAgICAgICBpc1BoeXNpY2FsOiB0cnVlLFxuICAgICAgICB9O1xuXG4gICAgICAgIChDT05GSUcgYXMgYW55KS5ETkQ1RS53ZWFwb25JZHMucmVsb2FkYWJsZVdlYXBvbiA9XG4gICAgICAgICAgICAnQ29tcGVuZGl1bS5mdnR0LXdlYXBvbi1yZWxvYWQuaXRlbS1wYWNrLkl0ZW0ubEU2MFFhUzFzY3RiM09BZCc7XG4gICAgfVxuXG4gICAgbW9kdWxlQ29uZmlndXJhdGlvbnMoKSB7XG4gICAgICAgIGNvbnN0IG1vZHVsZU5hbWUgPSAnZnZ0dC13ZWFwb24tcmVsb2FkJztcblxuICAgICAgICBnYW1lLnNldHRpbmdzLnJlZ2lzdGVyKG1vZHVsZU5hbWUsICd1bnN0YWJsZUFtbW8nLCB7XG4gICAgICAgICAgICBzY29wZTogJ3dvcmxkJyxcbiAgICAgICAgICAgIG5hbWU6ICdTRVRUSU5HUy5XRUFQT05fUkVMT0FELlVuc3RhYmxlQW1tby5OYW1lJyxcbiAgICAgICAgICAgIGhpbnQ6ICdTRVRUSU5HUy5XRUFQT05fUkVMT0FELlVuc3RhYmxlQW1tby5IaW50JyxcbiAgICAgICAgICAgIHR5cGU6IEJvb2xlYW4sXG4gICAgICAgICAgICBjb25maWc6IHRydWUsXG4gICAgICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICB9KTtcblxuICAgICAgICBnYW1lLnNldHRpbmdzLnJlZ2lzdGVyKG1vZHVsZU5hbWUsICd1bnN0YWJsZUFtbW9GYWlsdXJlVGhyZXNoaG9sZCcsIHtcbiAgICAgICAgICAgIHNjb3BlOiAnd29ybGQnLFxuICAgICAgICAgICAgbmFtZTogJ1NFVFRJTkdTLldFQVBPTl9SRUxPQUQuVW5zdGFibGVBbW1vRmFpbHVyZVRocmVzaG9sZC5OYW1lJyxcbiAgICAgICAgICAgIGhpbnQ6ICdTRVRUSU5HUy5XRUFQT05fUkVMT0FELlVuc3RhYmxlQW1tb0ZhaWx1cmVUaHJlc2hvbGQuSGludCcsXG4gICAgICAgICAgICB0eXBlOiBOdW1iZXIsXG4gICAgICAgICAgICBjb25maWc6IHRydWUsXG4gICAgICAgICAgICBkZWZhdWx0OiAyLFxuICAgICAgICB9KTtcblxuICAgICAgICBnYW1lLnNldHRpbmdzLnJlZ2lzdGVyKG1vZHVsZU5hbWUsICd1c2VNaXNmaXJlcycsIHtcbiAgICAgICAgICAgIHNjb3BlOiAnd29ybGQnLFxuICAgICAgICAgICAgbmFtZTogJ1NFVFRJTkdTLldFQVBPTl9SRUxPQUQuVXNlTWlzZmlyZXMuTmFtZScsXG4gICAgICAgICAgICBoaW50OiAnU0VUVElOR1MuV0VBUE9OX1JFTE9BRC5Vc2VNaXNmaXJlcy5IaW50JyxcbiAgICAgICAgICAgIHR5cGU6IEJvb2xlYW4sXG4gICAgICAgICAgICBjb25maWc6IHRydWUsXG4gICAgICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICB9KTtcblxuICAgICAgICBnYW1lLnNldHRpbmdzLnJlZ2lzdGVyKG1vZHVsZU5hbWUsICdmaWx0ZXJBbW11bml0aW9uQnlFcXVpcHBlZCcsIHtcbiAgICAgICAgICAgIHNjb3BlOiAndXNlcicsXG4gICAgICAgICAgICBuYW1lOiAnU0VUVElOR1MuV0VBUE9OX1JFTE9BRC5GaWx0ZXJBbW11bml0aW9uQnlFcXVpcHBlZC5OYW1lJyxcbiAgICAgICAgICAgIGhpbnQ6ICdTRVRUSU5HUy5XRUFQT05fUkVMT0FELkZpbHRlckFtbXVuaXRpb25CeUVxdWlwcGVkLkhpbnQnLFxuICAgICAgICAgICAgdHlwZTogQm9vbGVhbixcbiAgICAgICAgICAgIGNvbmZpZzogdHJ1ZSxcbiAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBkZWJ1Zyhob29rczogYm9vbGVhbiA9IGZhbHNlKSB7XG4gICAgICAgIENPTkZJRy5kZWJ1Zy5ob29rcyA9IGhvb2tzO1xuICAgICAgICBjb25zb2xlLmxvZygnQ09ORklHOiAnLCBDT05GSUcpO1xuICAgICAgICBjb25zb2xlLmxvZygnQ09ORklHLkRORDVFOiAnLCAoQ09ORklHIGFzIGFueSkuRE5ENUUpO1xuICAgIH1cblxuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gJ2NsYXNzIE1vZHVsZU1hbmFnZXInO1xuICAgIH1cbn1cbiIsImV4cG9ydCBkZWZhdWx0IGNsYXNzIFRlbXBsYXRlTWFuYWdlciB7XG4gICAgY29uc3RydWN0b3IoKSB7fVxuXG4gICAgaW5pdCgpIHtcbiAgICAgICAgKGZvdW5kcnkuYXBwbGljYXRpb25zIGFzIGFueSkuaGFuZGxlYmFycy5sb2FkVGVtcGxhdGVzKFxuICAgICAgICAgICAgVGVtcGxhdGVNYW5hZ2VyLnBhdGhzXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgc3RhdGljIGdldCBwYXRocygpIHtcbiAgICAgICAgY29uc3QgcGF0aHM6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH0gPSB7fTtcbiAgICAgICAgY29uc3QgdGVtcGxhdGVQYXRocyA9ICdtb2R1bGVzL2Z2dHQtd2VhcG9uLXJlbG9hZC90ZW1wbGF0ZXMvcmVsb2FkYWJsZVdlYXBvblJlbG9hZFRlbXBsYXRlLmhicyxtb2R1bGVzL2Z2dHQtd2VhcG9uLXJlbG9hZC90ZW1wbGF0ZXMvYmFzaWNNZXNzYWdlLmhicyxtb2R1bGVzL2Z2dHQtd2VhcG9uLXJlbG9hZC90ZW1wbGF0ZXMvYW1tb1NlbGVjdGlvbkRpYWxvZ1RlbXBsYXRlLmhicyxtb2R1bGVzL2Z2dHQtd2VhcG9uLXJlbG9hZC90ZW1wbGF0ZXMvYW1tb1JlZnVuZE5vdGljZVRlbXBsYXRlLmhicyxtb2R1bGVzL2Z2dHQtd2VhcG9uLXJlbG9hZC90ZW1wbGF0ZXMvYWN0aXZpdHktY2FyZC5oYnMnLnNwbGl0KCcsJyk7XG4gICAgICAgIGZvciAoY29uc3QgcGF0aCBvZiB0ZW1wbGF0ZVBhdGhzKSB7XG4gICAgICAgICAgICBwYXRoc1twYXRoLnJlcGxhY2UoJy5oYnMnLCAnLmh0bWwnKV0gPSBwYXRoO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwYXRocztcbiAgICB9XG5cbiAgICBzdGF0aWMgb25Ib3RSZWxvYWQoKSB7XG4gICAgICAgIGZvciAoY29uc3QgdGVtcGxhdGUgaW4gX3RlbXBsYXRlQ2FjaGUpIHtcbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoX3RlbXBsYXRlQ2FjaGUsIHRlbXBsYXRlKVxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgZGVsZXRlIF90ZW1wbGF0ZUNhY2hlW3RlbXBsYXRlXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIChmb3VuZHJ5LmFwcGxpY2F0aW9ucyBhcyBhbnkpLmhhbmRsZWJhcnNcbiAgICAgICAgICAgIC5sb2FkVGVtcGxhdGVzKHRoaXMucGF0aHMpXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBhcHBsaWNhdGlvbiBpbiB1aS53aW5kb3dzKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1aS53aW5kb3dzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcGxpY2F0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdWkud2luZG93c1thcHBsaWNhdGlvbl0ucmVuZGVyKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgdG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiAnY2xhc3MgVGVtcGxhdGVNYW5hZ2VyJztcbiAgICB9XG59XG4iLCJpbXBvcnQgTW9kdWxlTWFuYWdlciBmcm9tICcuL01vZHVsZU1hbmFnZXInO1xuaW1wb3J0IHsgdHlwZSBEaWFsb2dPcHRpb25zIH0gZnJvbSAnLi4vdHlwZXMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBVaU1hbmFnZXIge1xuICAgIHByaXZhdGUgX21vZHVsZU1hbmFnZXI6IE1vZHVsZU1hbmFnZXI7XG5cbiAgICBjb25zdHJ1Y3Rvcihtb2R1bGVNYW5hZ2VyOiBNb2R1bGVNYW5hZ2VyKSB7XG4gICAgICAgIHRoaXMuX21vZHVsZU1hbmFnZXIgPSBtb2R1bGVNYW5hZ2VyO1xuICAgIH1cblxuICAgIGdldCBtb2R1bGVNYW5hZ2VyKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fbW9kdWxlTWFuYWdlcjtcbiAgICB9XG5cbiAgICBidWlsZERpYWxvZyhvcHRpb25zOiBEaWFsb2dPcHRpb25zLCBpZDogc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiBuZXcgZm91bmRyeS5hcHBsaWNhdGlvbnMuYXBpLkRpYWxvZ1YyKHtcbiAgICAgICAgICAgIHdpbmRvdzoge1xuICAgICAgICAgICAgICAgIHRpdGxlOiBvcHRpb25zLnRpdGxlLFxuICAgICAgICAgICAgICAgIGNvbnRlbnRDbGFzc2VzOiBvcHRpb25zLmNvbnRlbnRDbGFzc2VzIHx8IFtdLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNvbnRlbnQ6IG9wdGlvbnMuY29udGVudCxcbiAgICAgICAgICAgIGJ1dHRvbnM6IG9wdGlvbnMuYnV0dG9ucyxcbiAgICAgICAgICAgIHN1Ym1pdDogb3B0aW9ucy5vblN1Ym1pdCxcbiAgICAgICAgICAgIGlkOiBpZCxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgdWlOb3RpZmljYXRpb24obXNnOiBzdHJpbmcsIHR5cGU6IHN0cmluZyA9ICdpbmZvJykge1xuICAgICAgICBpZiAodWkubm90aWZpY2F0aW9ucykge1xuICAgICAgICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnZXJyb3InOlxuICAgICAgICAgICAgICAgICAgICB1aS5ub3RpZmljYXRpb25zLmVycm9yKG1zZyk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ3dhcm4nOlxuICAgICAgICAgICAgICAgICAgICB1aS5ub3RpZmljYXRpb25zLndhcm4obXNnKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnaW5mbyc6XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgdWkubm90aWZpY2F0aW9ucy5pbmZvKG1zZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzZW5kQ2hhdChcbiAgICAgICAgc3BlYWtlcjogQWN0b3I1ZSxcbiAgICAgICAgY29udGVudDogc3RyaW5nLFxuICAgICAgICBmbGF2b3I/OiBzdHJpbmcsXG4gICAgICAgIHNvdW5kPzogc3RyaW5nLFxuICAgICAgICB3aGlzcGVyOiBzdHJpbmdbXSA9IFtdLFxuICAgICAgICB0eXBlOiAwIHwgMSB8IDIgfCAzIHwgNCB8IDUgPSBDT05TVC5DSEFUX01FU1NBR0VfVFlQRVMuT1RIRVJcbiAgICApIHtcbiAgICAgICAgY29uc3QgQ2hhdERhdGEgPSB7XG4gICAgICAgICAgICBzcGVha2VyOiBDaGF0TWVzc2FnZS5nZXRTcGVha2VyKHsgYWN0b3I6IHNwZWFrZXIgfSksXG4gICAgICAgICAgICB0eXBlLFxuICAgICAgICAgICAgZmxhdm9yLFxuICAgICAgICAgICAgc291bmQsXG4gICAgICAgICAgICBjb250ZW50LFxuICAgICAgICAgICAgd2hpc3BlcixcbiAgICAgICAgfTtcbiAgICAgICAgQ2hhdE1lc3NhZ2UuY3JlYXRlKENoYXREYXRhKTtcbiAgICB9XG5cbiAgICBnZXRMb2NhbGl6ZWRUeHQoXG4gICAgICAgIGtleTogc3RyaW5nLFxuICAgICAgICBvcHRzPzogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfSxcbiAgICAgICAgZm9ybWF0OiBib29sZWFuID0gZmFsc2VcbiAgICApIHtcbiAgICAgICAgaWYgKGZvcm1hdCkge1xuICAgICAgICAgICAgcmV0dXJuIChnYW1lIGFzIGFueSkuaTE4bi5mb3JtYXQoa2V5LCBvcHRzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gKGdhbWUgYXMgYW55KS5pMThuLmxvY2FsaXplKGtleSwgb3B0cyk7XG4gICAgfVxuXG4gICAgdG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiAnY2xhc3MgVWlNYW5hZ2VyJztcbiAgICB9XG59XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImltcG9ydCBNb2R1bGVNYW5hZ2VyIGZyb20gJy4vbW9kdWxlL21hbmFnZXJzL01vZHVsZU1hbmFnZXInO1xuaW1wb3J0IFRlbXBsYXRlTWFuYWdlciBmcm9tICcuL21vZHVsZS9tYW5hZ2Vycy9UZW1wbGF0ZU1hbmFnZXInO1xuXG5pbXBvcnQgbW9kdWxlSnNvbiBmcm9tICcuLi9tb2R1bGUuanNvbic7XG5cbkhvb2tzLm9uY2UoJ2luaXQnLCBhc3luYyAoKSA9PiB7XG4gICAgY29uc29sZS5sb2coJ1dlYXBvbiBSZWxvYWQgfCBGb3VuZHJ5IFZUVCBNb2R1bGUnKTtcblxuICAgIGNvbnN0IHdlYXBvbl9yZWxvYWQgPSBuZXcgTW9kdWxlTWFuYWdlcihtb2R1bGVKc29uLmlkKTtcbiAgICAvLyB3ZWFwb25fcmVsb2FkLmRlYnVnKHRydWUpO1xuICAgIHdlYXBvbl9yZWxvYWQuaW5pdCgpO1xufSk7XG5cbmlmIChwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ2RldmVsb3BtZW50Jykge1xuICAgIGlmIChtb2R1bGUuaG90KSB7XG4gICAgICAgIG1vZHVsZS5ob3QuYWNjZXB0KCk7XG5cbiAgICAgICAgaWYgKG1vZHVsZS5ob3Quc3RhdHVzKCkgPT09ICdhcHBseScpIHtcbiAgICAgICAgICAgIFRlbXBsYXRlTWFuYWdlci5vbkhvdFJlbG9hZCgpO1xuICAgICAgICB9XG4gICAgfVxufVxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9