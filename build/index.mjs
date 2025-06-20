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
                return this.reloadReloadableWeapon(loadout, reloadCanceled);
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
                'system.uses.value': reloadableWeapon.system.uses.max - qty,
            });
            await reloadableWeapon.setFlag(this.moduleManager.id, 'chambered', loadout);
            await reloadableWeapon.setFlag(this.moduleManager.id, 'fired', new Array(this.weapon.system.uses.max).fill('Empty'));
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
        const reloadableWeapon = this.weapon;
        const maxShots = reloadableWeapon.system.uses.max;
        const firedLoadout = reloadableWeapon.getFlag(this.moduleManager.id, 'fired') || new Array(maxShots).fill('Empty');
        firedLoadout.unshift(bullet.name);
        firedLoadout.splice(-1);
        reloadableWeapon.setFlag(this.moduleManager.id, 'fired', firedLoadout);
        const uses = reloadableWeapon.system.uses;
        const qty = uses.spent + 1 <= uses.max ? uses.spent + 1 : uses.max;
        reloadableWeapon.update({
            'system.uses.spent': qty,
            'system.uses.value': uses.max - qty,
        });
        if (bullet.name !== 'Empty') {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXgubWpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUdlLE1BQU0sV0FBVztJQUNwQixlQUFlLENBQWlCO0lBQ2hDLFFBQVEsQ0FBUztJQUNqQixTQUFTLENBQVM7SUFFMUIsWUFBWSxjQUE4QjtRQUN0QyxJQUFJLENBQUMsZUFBZSxHQUFHLGNBQWMsQ0FBQztRQUN0QyxJQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQztRQUNuQixJQUFJLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztRQUNwQixJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDaEIsQ0FBQztJQUVELElBQUksY0FBYztRQUNkLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQztJQUNoQyxDQUFDO0lBRUQsSUFBSSxhQUFhO1FBQ2IsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLGFBQWEsQ0FBQztJQUM5QyxDQUFDO0lBRUQsSUFBSSxTQUFTO1FBQ1QsT0FBTyxJQUFJLEVBQUUsTUFBTSxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFZLENBQUM7SUFDdkQsQ0FBQztJQUVELElBQUksV0FBVztRQUNYLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztJQUN6QixDQUFDO0lBRUQsSUFBSSxXQUFXLENBQUMsRUFBVTtRQUN0QixJQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQztJQUN2QixDQUFDO0lBRUQsSUFBSSxNQUFNO1FBQ04sT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBYyxDQUFDO0lBQ2pFLENBQUM7SUFFRCxJQUFJLFFBQVE7UUFDUixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUM7SUFDMUIsQ0FBQztJQUVELElBQUksUUFBUSxDQUFDLEVBQVU7UUFDbkIsSUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7SUFDeEIsQ0FBQztJQUVELElBQUksT0FBTztRQUNQLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUMzQyxDQUFDO0lBRUQsSUFBSSxLQUFLO1FBQ0wsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7SUFFRCxhQUFhLENBQUMsSUFBWTtRQUN0QixNQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDckMsTUFBTSxRQUFRLEdBQUcsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUM7UUFDbEQsTUFBTSxLQUFLLEdBQ04sZ0JBQWdCLENBQUMsT0FBTyxDQUNyQixJQUFJLENBQUMsYUFBYSxDQUFDLEVBQUUsRUFDckIsSUFBSSxDQUNNLElBQUksSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRXhELElBQUksS0FBSyxDQUFDLE1BQU0sR0FBRyxRQUFRLEVBQUUsQ0FBQztZQUMxQixNQUFNLE9BQU8sR0FBRyxRQUFRLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQztZQUN4QyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsT0FBTyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7Z0JBQy9CLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDeEIsQ0FBQztRQUNMLENBQUM7UUFFRCxPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBRUQsVUFBVSxDQUFDLEtBQXlCLEVBQUUsV0FBb0IsS0FBSztRQUMzRCxPQUFPLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFZLEVBQUUsRUFBRTtZQUNqQyxNQUFNLFVBQVUsR0FBSSxJQUFrQixDQUFDLE1BQU0sQ0FBQztZQUM5QyxJQUFJLFFBQVEsRUFBRSxDQUFDO2dCQUNYLE9BQU8sQ0FDSCxJQUFJLENBQUMsSUFBSSxJQUFJLFlBQVk7b0JBQ3pCLFVBQVUsQ0FBQyxJQUFJLENBQUMsT0FBTyxJQUFJLGVBQWU7b0JBQzFDLFVBQVUsQ0FBQyxRQUFRLENBQ3RCLENBQUM7WUFDTixDQUFDO1lBQ0QsT0FBTyxDQUNILElBQUksQ0FBQyxJQUFJLElBQUksWUFBWTtnQkFDekIsVUFBVSxDQUFDLElBQUksQ0FBQyxPQUFPLElBQUksZUFBZSxDQUM3QyxDQUFDO1FBQ04sQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsSUFBSSxLQUFJLENBQUM7SUFFVCxTQUFTLENBQUMsR0FBVyxFQUFFLElBQWdDLEVBQUUsTUFBZ0I7UUFDckUsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztJQUMzRSxDQUFDO0lBRUQsUUFBUTtRQUNKLE9BQU8sbUJBQW1CLENBQUM7SUFDL0IsQ0FBQztDQUNKOzs7Ozs7Ozs7Ozs7Ozs7O0FDbkd1QztBQUVqQyxNQUFNLGdCQUFpQixTQUFRLG9EQUFXO0lBQzdDLFlBQVksY0FBOEI7UUFDdEMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQzFCLENBQUM7SUFFRCxJQUFJO1FBQ0EsS0FBSyxDQUFDLEVBQUUsQ0FBQyxzQkFBc0IsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ3BFLENBQUM7SUFFRCxhQUFhLENBQUMsUUFBYTtRQUN2QixJQUFJLFFBQVEsQ0FBQyxJQUFJLEtBQUssU0FBUyxJQUFJLFFBQVEsQ0FBQyxJQUFJLElBQUksWUFBWSxFQUFFLENBQUM7WUFDL0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDO1lBRXBELElBQUksQ0FBQyxXQUFXLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7WUFDckMsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztZQUNqQyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDakIsT0FBTyxLQUFLLENBQUM7UUFDakIsQ0FBQztRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFRCxLQUFLLENBQUMsU0FBUztRQUNYLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbEMsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUc3QixNQUFNLFlBQVksR0FBRyxNQUNqQixPQUFPLENBQUMsWUFDWCxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQ3ZCLG1FQUFtRSxFQUNuRTtZQUNJLElBQUksRUFBRTtnQkFDRixHQUFHLEVBQUUsNkRBQTZEO2dCQUNsRSxJQUFJLEVBQUUsU0FBUzthQUNsQjtZQUNELFdBQVcsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUN2Qiw4Q0FBOEMsRUFDOUMsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxFQUMvQyxJQUFJLENBQ1A7WUFDRCxLQUFLLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyx3Q0FBd0MsQ0FBQztTQUNsRSxDQUNKLENBQUM7UUFDRixJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQ2pDLEtBQUssRUFDTCxZQUFZLEVBQ1osU0FBUyxFQUNULFNBQVMsRUFDVCxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsRUFDVixLQUFLLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUNuQyxDQUFDO0lBQ04sQ0FBQztJQUVELFFBQVE7UUFDSixPQUFPLHdCQUF3QixDQUFDO0lBQ3BDLENBQUM7Q0FDSjs7Ozs7Ozs7Ozs7Ozs7OztBQ3pEdUM7QUFHakMsTUFBTSxhQUFjLFNBQVEsb0RBQVc7SUFDbEMsT0FBTyxDQUFTO0lBQ2hCLHdCQUF3QixDQUFVO0lBRTFDLFlBQVksY0FBOEI7UUFDdEMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ3RCLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDbEIsSUFBSSxDQUFDLHdCQUF3QixHQUFHLEtBQUssQ0FBQztJQUMxQyxDQUFDO0lBRUQsSUFBSTtRQUNBLEtBQUssQ0FBQyxFQUFFLENBQUMsc0JBQXNCLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUNwRSxDQUFDO0lBRUQsYUFBYSxDQUFDLFFBQWE7UUFDdkIsSUFBSSxRQUFRLENBQUMsSUFBSSxLQUFLLFNBQVMsSUFBSSxRQUFRLENBQUMsSUFBSSxJQUFJLFFBQVEsRUFBRSxDQUFDO1lBQzNELE9BQU8sQ0FBQyxHQUFHLENBQUMsa0NBQWtDLENBQUMsQ0FBQztZQUVoRCxJQUFJLENBQUMsV0FBVyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO1lBQ3JDLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7WUFDakMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1lBQ3BCLE9BQU8sS0FBSyxDQUFDO1FBQ2pCLENBQUM7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRUQsWUFBWSxDQUFDLGFBQXNCLElBQUk7UUFDbkMsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUM7UUFDcEMsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUNwQyxNQUFNLG1CQUFtQixHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFnQixDQUFDO1FBQ2xFLElBQUksaUJBQWlCLEdBQXFCLEVBQUUsQ0FBQztRQUU3QyxJQUFJLFVBQVUsRUFBRSxDQUFDO1lBQ2IsaUJBQWlCLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLG1CQUFtQixDQUFDLENBQUM7UUFDdEUsQ0FBQzthQUFNLENBQUM7WUFDSixpQkFBaUIsR0FBRyxtQkFBbUIsQ0FBQyxHQUFHLENBQ3ZDLENBQUMsSUFBZSxFQUFrQixFQUFFO2dCQUNoQyxPQUFPO29CQUNILElBQUksRUFBRSxJQUFJLENBQUMsSUFBSTtvQkFDZixLQUFLLEVBQUUsSUFBSSxDQUFDLElBQUk7b0JBQ2hCLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVE7b0JBQzNCLFFBQVEsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVE7aUJBQ2pDLENBQUM7WUFDTixDQUFDLENBQ0osQ0FBQztRQUNOLENBQUM7UUFFRCxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FDbkMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxFQUFFLEVBQ3JCLDRCQUE0QixDQUNwQixDQUFDO1FBRWIsSUFBSSxDQUFDLGdCQUFnQixDQUNqQixpQkFBaUIsQ0FBQyxNQUFNLENBQUMsQ0FBQyxRQUF3QixFQUFFLEVBQUU7WUFDbEQsSUFBSSxRQUFRLENBQUMsS0FBSyxHQUFHLENBQUMsRUFBRSxDQUFDO2dCQUNyQixJQUNJLENBQUMsYUFBYSxJQUFJLFFBQVEsQ0FBQyxRQUFRLENBQUM7b0JBQ3BDLENBQUMsYUFBYSxFQUNoQixDQUFDO29CQUNDLE9BQU8sSUFBSSxDQUFDO2dCQUNoQixDQUFDO1lBQ0wsQ0FBQztZQUNELE9BQU8sS0FBSyxDQUFDO1FBQ2pCLENBQUMsQ0FBQyxFQUNGLGNBQWMsQ0FDakIsQ0FBQztJQUNOLENBQUM7SUFFRCxtQkFBbUIsQ0FBQyxtQkFBZ0M7UUFDaEQsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUMxRCxNQUFNLG1CQUFtQixHQUFxQixFQUFFLENBQUM7UUFDakQsbUJBQW1CLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBZSxFQUFFLEVBQUU7WUFDNUMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztZQUN2QixNQUFNLFFBQVEsR0FBbUI7Z0JBQzdCLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSTtnQkFDZixLQUFLLEVBQUUsSUFBSSxDQUFDLElBQUk7Z0JBQ2hCLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVE7Z0JBQzNCLFFBQVEsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVE7YUFDakMsQ0FBQztZQUNGLElBQUksYUFBYSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7Z0JBQ3RCLFFBQVEsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEdBQUcsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUM1RCxJQUFJLENBQUMsTUFBTSxDQUFDO29CQUNSLGlCQUFpQixFQUFFLFFBQVEsQ0FBQyxLQUFLO2lCQUNwQyxDQUFDLENBQUM7WUFDUCxDQUFDO1lBQ0QsbUJBQW1CLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3ZDLENBQUMsQ0FBQyxDQUFDO1FBQ0gsT0FBTyxtQkFBbUIsQ0FBQztJQUMvQixDQUFDO0lBRUQsS0FBSyxDQUFDLGdCQUFnQixDQUNsQixXQUE2QixFQUM3QixjQUF3QjtRQUV4QixNQUFNLGFBQWEsR0FBRyxNQUNsQixPQUFPLENBQUMsWUFDWCxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQ3ZCLHNFQUFzRSxFQUN0RTtZQUNJLFlBQVksRUFBRSxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUNyRCxPQUFPLENBQ1Y7WUFDRCxXQUFXO1NBQ2QsQ0FDSixDQUFDO1FBRUYsTUFBTSxhQUFhLEdBQUc7WUFDbEI7Z0JBQ0ksTUFBTSxFQUFFLE1BQU07Z0JBQ2QsS0FBSyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQ2pCLG9FQUFvRSxDQUN2RTtnQkFDRCxRQUFRLEVBQUUsQ0FDTixNQUFrQyxFQUNsQyxNQUF5QixFQUMzQixFQUFFO29CQUNBLElBQUksQ0FBQyx3QkFBd0IsR0FBRyxLQUFLLENBQUM7b0JBQ3RDLE1BQU0sT0FBTyxHQUFhLEVBQUUsQ0FBQztvQkFDN0IsS0FDSSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQ1QsQ0FBQyxHQUFJLE1BQU0sQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLE1BQWlCLEVBQzdDLENBQUMsRUFBRSxFQUNMLENBQUM7d0JBQ0MsTUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsSUFBSSxDQUNsQyxDQUFDLENBQ2lCLENBQUM7d0JBQ3ZCLElBQUksR0FBRyxFQUFFLElBQUksSUFBSSxhQUFhLEVBQUUsQ0FBQzs0QkFDN0IsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7d0JBQzVCLENBQUM7b0JBQ0wsQ0FBQztvQkFDRCxPQUFPLEVBQUUsT0FBTyxFQUFFLGNBQWMsRUFBRSxLQUFLLEVBQUUsQ0FBQztnQkFDOUMsQ0FBQzthQUNKO1lBQ0Q7Z0JBQ0ksTUFBTSxFQUFFLFFBQVE7Z0JBQ2hCLEtBQUssRUFBRSxJQUFJLENBQUMsU0FBUyxDQUNqQixzRUFBc0UsQ0FDekU7Z0JBQ0QsUUFBUSxFQUFFLEdBQUcsRUFBRTtvQkFDWCxJQUFJLENBQUMsd0JBQXdCLEdBQUcsS0FBSyxDQUFDO29CQUN0QyxPQUFPLEVBQUUsT0FBTyxFQUFFLGNBQWMsRUFBRSxjQUFjLEVBQUUsSUFBSSxFQUFFLENBQUM7Z0JBQzdELENBQUM7YUFDSjtTQUNKLENBQUM7UUFFRixJQUFJLENBQUMsd0JBQXdCLEdBQUcsSUFBSSxDQUFDO1FBQ3JDLElBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDLEVBQUUsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxRQUFrQixFQUFFLEVBQUU7WUFDNUQsSUFBSSxRQUFRLENBQUMsRUFBRSxLQUFLLG9CQUFvQixFQUFFLENBQUM7Z0JBQ3ZDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUM3QyxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVM7YUFDdkIsV0FBVyxDQUNSO1lBQ0ksS0FBSyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQ2pCLDREQUE0RCxDQUMvRDtZQUNELE9BQU8sRUFBRSxhQUFhO1lBQ3RCLE9BQU8sRUFBRSxhQUFhO1lBQ3RCLFFBQVEsRUFBRSxDQUFDLEVBQ1AsT0FBTyxFQUNQLGNBQWMsR0FJakIsRUFBaUIsRUFBRTtnQkFDaEIsT0FBTyxJQUFJLENBQUMsc0JBQXNCLENBQzlCLE9BQU8sRUFDUCxjQUFjLENBQ2pCLENBQUM7WUFDTixDQUFDO1NBQ0osRUFDRCxvQkFBb0IsQ0FDdkI7YUFDQSxNQUFNLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztJQUNqQyxDQUFDO0lBRUQsbUJBQW1CLENBQUMsT0FBaUI7UUFDakMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3pDLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFFbEIsSUFBSSxJQUFJLENBQUMsd0JBQXdCLEVBQUUsQ0FBQztZQUNoQyxJQUFJLENBQUMsd0JBQXdCLEdBQUcsS0FBSyxDQUFDO1lBQ3RDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDL0MsQ0FBQztJQUNMLENBQUM7SUFFRCxLQUFLLENBQUMsc0JBQXNCLENBQ3hCLE9BQWlCLEVBQ2pCLGlCQUEwQixLQUFLO1FBRS9CLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUNyQyxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFbEQsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUM7WUFFakMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDO1lBQ1osSUFBSSxVQUFVLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7Z0JBRTFCLEdBQUcsSUFBSSxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDL0IsQ0FBQztZQUNELE1BQU0sZ0JBQWdCLENBQUMsTUFBTSxDQUFDO2dCQUMxQixtQkFBbUIsRUFBRSxHQUFHO2dCQUN4QixtQkFBbUIsRUFBRSxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHO2FBQzlELENBQUMsQ0FBQztZQUNILE1BQU0sZ0JBQWdCLENBQUMsT0FBTyxDQUMxQixJQUFJLENBQUMsYUFBYSxDQUFDLEVBQUUsRUFDckIsV0FBVyxFQUNYLE9BQU8sQ0FDVixDQUFDO1lBQ0YsTUFBTSxnQkFBZ0IsQ0FBQyxPQUFPLENBQzFCLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBRSxFQUNyQixPQUFPLEVBQ1AsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FDdkQsQ0FBQztZQUVGLE1BQU0sWUFBWSxHQUFHLE1BQ2pCLE9BQU8sQ0FBQyxZQUNYLENBQUMsVUFBVSxDQUFDLGNBQWMsQ0FDdkIseUVBQXlFLEVBQ3pFO2dCQUNJLElBQUksRUFBRTtvQkFDRixHQUFHLEVBQUUsZ0JBQWdCLENBQUMsR0FBRztvQkFDekIsSUFBSSxFQUFFLGdCQUFnQixDQUFDLElBQUk7aUJBQzlCO2dCQUNELE1BQU0sRUFBRSxJQUFJLENBQUMsU0FBUyxDQUNsQixjQUFjO29CQUNWLENBQUMsQ0FBQyx1RUFBdUU7b0JBQ3pFLENBQUMsQ0FBQywrREFBK0QsQ0FDeEU7Z0JBQ0QsS0FBSyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQ2pCLGNBQWM7b0JBQ1YsQ0FBQyxDQUFDLG9FQUFvRTtvQkFDdEUsQ0FBQyxDQUFDLDREQUE0RCxFQUNsRSxFQUFFLGdCQUFnQixFQUFFLGdCQUFnQixDQUFDLElBQUksRUFBRSxFQUMzQyxJQUFJLENBQ1A7Z0JBQ0QsT0FBTyxFQUFFLE9BQU87YUFDbkIsQ0FDSixDQUFDO1lBRUYsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsWUFBWSxDQUFDLENBQUM7WUFDcEUsSUFBSSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUM7WUFDdEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7UUFDdkIsQ0FBQzthQUFNLENBQUM7WUFDSixNQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDbkMsQ0FBQztRQUNELE9BQU87SUFDWCxDQUFDO0lBRUQsYUFBYSxDQUFDLE1BQWlDO1FBQzNDLElBQUksbUJBQW1CLEdBQUcsSUFBSSxDQUFDO1FBQy9CLE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FDdkMsSUFBSSxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQ1QsQ0FBQztRQUNqQixtQkFBbUIsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFlLEVBQUUsRUFBRTtZQUM1QyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1lBQ3ZCLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUdoRCxJQUFJLEdBQUcsR0FBRyxDQUFDLEVBQUUsQ0FBQztnQkFDVixJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQ3ZDLElBQUksQ0FBQyxTQUFTLENBQ1Ysc0RBQXNELEVBQ3RELEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsRUFDbkIsSUFBSSxDQUNQLEVBQ0QsT0FBTyxDQUNWLENBQUM7Z0JBQ0YsbUJBQW1CLEdBQUcsS0FBSyxDQUFDO1lBQ2hDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksbUJBQW1CLEVBQUUsQ0FBQztZQUN0QixtQkFBbUIsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLElBQWUsRUFBRSxFQUFFO2dCQUNsRCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO2dCQUN2QixJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO29CQUNmLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQzt3QkFDZCxpQkFBaUIsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDO3FCQUN6RCxDQUFDLENBQUM7Z0JBQ1AsQ0FBQztZQUNMLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztRQUVELE9BQU8sbUJBQW1CLENBQUM7SUFDL0IsQ0FBQztJQUVELEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFjLEVBQUUsTUFBaUI7UUFDcEQsSUFBSSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUMsRUFBRSxDQUFDO1FBQzVCLElBQUksQ0FBQyxRQUFRLEdBQUcsTUFBTSxDQUFDLEVBQUUsQ0FBQztRQUUxQixJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7SUFDeEIsQ0FBQztJQUVELGdCQUFnQixDQUFDLGNBQXdCO1FBR3JDLE1BQU0sT0FBTyxHQUE4QixFQUFFLENBQUM7UUFDOUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQVksRUFBRSxFQUFFO1lBQ3BDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDO2dCQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDdEMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDdEMsQ0FBQyxDQUFDLENBQUM7UUFDSCxPQUFPLE9BQU8sQ0FBQztJQUNuQixDQUFDO0lBRUQsUUFBUTtRQUNKLE9BQU8scUJBQXFCLENBQUM7SUFDakMsQ0FBQztDQUNKOzs7Ozs7Ozs7Ozs7Ozs7O0FDelR1QztBQVVqQyxNQUFNLDZCQUE4QixTQUFRLG9EQUFXO0lBQ2xELFVBQVUsQ0FHaEI7SUFDTSxPQUFPLENBQVM7SUFFeEIsWUFBWSxjQUE4QjtRQUN0QyxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDdEIsSUFBSSxDQUFDLFVBQVUsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDdEIsQ0FBQztJQUVELElBQUk7UUFDQSxLQUFLLENBQUMsRUFBRSxDQUFDLDZCQUE2QixFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDM0UsQ0FBQztJQUVELGFBQWEsQ0FBQyxPQUFxQixFQUFFLEtBQXFCO1FBQ3RELE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN4QixNQUFNLFVBQVUsR0FBRyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQztRQUNwQyxJQUFJLFVBQVUsRUFBRSxJQUFJLEVBQUUsUUFBUSxLQUFLLGtCQUFrQjtZQUFFLE9BQU87UUFFOUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQ0FBa0MsQ0FBQyxDQUFDO1FBQ2hELElBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO1FBQ3RDLElBQUksQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO1FBRTFDLE9BQU8sSUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUM7SUFDekMsQ0FBQztJQUVELHNCQUFzQjtRQUNsQixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7UUFFbkMsSUFBSSxNQUFNLENBQUMsSUFBSSxJQUFJLE9BQU8sRUFBRSxDQUFDO1lBQ3pCLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUdyQixJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO2dCQUMvRCxPQUFPLEtBQUssQ0FBQztZQUNqQixDQUFDO1FBQ0wsQ0FBQztRQUVELElBQUksTUFBTSxDQUFDLElBQUksS0FBSyxPQUFPLEVBQUUsQ0FBQztZQUMxQixJQUFJLENBQUMsVUFBVSxHQUFHO2dCQUNkLEVBQUUsRUFBRSxNQUFNLENBQUMsRUFBRTtnQkFDYixJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUk7YUFDcEIsQ0FBQztZQUVGLElBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDLEVBQUUsQ0FDbkIseUJBQXlCLEVBQ3pCLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQ3RDLENBQUM7UUFDTixDQUFDO1FBRUQsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ2xDLENBQUM7SUFFRCxLQUFLLENBQUMsbUJBQW1CLENBQUMsT0FBc0IsRUFBRSxJQUFpQjtRQUMvRCxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDO1FBQzVDLE1BQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDaEQsSUFDSSxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsS0FBSyxNQUFNO1lBQzdCLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxLQUFLLFFBQVEsRUFDbkMsQ0FBQztZQUNDLEtBQUssQ0FBQyxHQUFHLENBQUMseUJBQXlCLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ25ELElBQUksQ0FBQyxVQUFVLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsQ0FBQztZQUV2QyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFjLENBQUM7WUFFN0QsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1lBQzlELE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDbEQsTUFBTSxhQUFhLEdBQUcsY0FBYyxJQUFJLFFBQVEsQ0FBQztZQUdqRCxNQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUN2QyxJQUFJLENBQUMsYUFBYSxDQUFDLEVBQUUsRUFDckIsY0FBYyxDQUNOLENBQUM7WUFFYixNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FDbEMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxFQUFFLEVBQ3JCLGFBQWEsQ0FDTCxDQUFDO1lBRWIsTUFBTSw0QkFBNEIsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FDbEQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxFQUFFLEVBQ3JCLCtCQUErQixDQUN4QixDQUFDO1lBR1osSUFBSSxZQUFZLEVBQUUsQ0FBQztnQkFDZixNQUFNLGtCQUFrQixHQUNwQixpQkFBaUI7b0JBQ2pCLE1BQU0sRUFBRSxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQVksRUFBRSxFQUFFO3dCQUM1QyxPQUFPLElBQUksS0FBSyxVQUFVLENBQUM7b0JBQy9CLENBQUMsQ0FBQztvQkFDRSxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FDViwrREFBK0QsRUFDL0QsRUFBRSxPQUFPLEVBQUUsR0FBRyw0QkFBNEIsRUFBRSxFQUFFLEVBQzlDLElBQUksQ0FDUDtvQkFDSCxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FDViw2REFBNkQsQ0FDaEUsQ0FBQztnQkFFWixNQUFNLGtCQUFrQixHQUNwQixhQUFhLEVBQUUsYUFBYSxDQUFDLGVBQWUsQ0FBQyxDQUFDO2dCQUNsRCxNQUFNLGNBQWMsR0FDaEIsa0JBQWtCLEVBQUUsYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUNsRCxjQUFjLEVBQUUsa0JBQWtCLENBQzlCLFdBQVcsRUFDWCxNQUFNLGtCQUFrQixNQUFNLENBQ2pDLENBQUM7WUFDTixDQUFDO1lBR0QsSUFBSSxRQUFRLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztnQkFDOUIsTUFBTSxnQkFBZ0IsR0FDbEIsYUFBYSxFQUFFLGFBQWEsQ0FBQyxjQUFjLENBQUMsQ0FBQztnQkFDakQsTUFBTSxlQUFlLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDdEQsZUFBZSxDQUFDLFNBQVMsR0FBRyxjQUFjLENBQUM7Z0JBQzNDLGdCQUFnQixFQUFFLEtBQUssQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUM3QyxDQUFDO1lBRUQsTUFBTSxrQkFBa0IsR0FDcEIsYUFBYSxFQUFFLGFBQWEsQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUdsRCxJQUFJLFlBQVksRUFBRSxDQUFDO2dCQUNmLE1BQU0sVUFBVSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQ3BELFVBQVUsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3BELFVBQVUsQ0FBQyxTQUFTLEdBQUcsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQ2hFLDhEQUE4RCxDQUNqRSxFQUFFLENBQUM7Z0JBQ0osa0JBQWtCLEVBQUUsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQzNDLENBQUM7WUFHRCxNQUFNLFNBQVMsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ25ELFNBQVMsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDbEQsU0FBUyxDQUFDLFNBQVMsR0FBRyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FDOUQsNERBQTRELENBQy9ELEVBQUUsQ0FBQztZQUNKLGtCQUFrQixFQUFFLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUMxQyxDQUFDO0lBQ0wsQ0FBQztJQUVELFlBQVk7UUFDUixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQ2pDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7UUFFM0IsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUM3QixPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3RCLE1BQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUdsQyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBRSxFQUFFLFdBQVcsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUU1RCxNQUFNLG1CQUFtQixHQUFHLElBQUksQ0FBQyxVQUFVLENBQ3ZDLFNBQVMsQ0FBQyxLQUFLLENBQ0gsQ0FBQztRQUNqQixPQUFPLENBQ0gsbUJBQW1CLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBZSxFQUFFLEVBQUU7WUFDekMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztZQUN2QixJQUFJLElBQUksSUFBSSxTQUFTLEVBQUUsQ0FBQztnQkFDcEIsT0FBTyxJQUFJLENBQUM7WUFDaEIsQ0FBQztZQUNELE9BQU8sSUFBSSxDQUFDO1FBQ2hCLENBQUMsQ0FBQyxJQUFLLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBZ0IsQ0FDekMsQ0FBQztJQUNOLENBQUM7SUFFRCxhQUFhO1FBQ1QsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUNqQyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBRTNCLE1BQU0sWUFBWSxHQUFHLEtBQUssQ0FBQyxFQUFFLENBQ3pCLG1CQUFtQixFQUNuQixDQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsRUFBRTtZQUNoQixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBQ3hELFNBQVMsRUFBRSxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFO2dCQUN0QyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUNuQyxDQUFDLENBQUMsQ0FBQztZQUVILElBQUksU0FBUyxFQUFFLENBQUM7Z0JBQ1osS0FBSyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsRUFBRSxZQUFZLENBQUMsQ0FBQztZQUNqRCxDQUFDO1FBQ0wsQ0FBQyxDQUNKLENBQUM7UUFFRixNQUFNLFlBQVksR0FBeUI7WUFDdkMsV0FBVyxFQUFFO2dCQUNULElBQUksRUFBRSxNQUFNLElBQUksQ0FBQyxTQUFTLENBQ3RCLGtFQUFrRSxFQUNsRSxFQUFFLElBQUksRUFBRSxTQUFTLENBQUMsSUFBSSxFQUFFLGdCQUFnQixFQUFFLE1BQU0sQ0FBQyxJQUFJLEVBQUUsRUFDdkQsSUFBSSxDQUNQLE1BQU07YUFDVjtZQUNELElBQUksRUFBRTtnQkFDRixHQUFHLEVBQUUsTUFBTSxDQUFDLEdBQUc7Z0JBQ2YsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQ2hCLDREQUE0RCxDQUMvRDthQUNKO1lBQ0QsUUFBUSxFQUFFLE1BQU0sQ0FBQyxJQUFJO1lBQ3JCLE9BQU8sRUFBRTtnQkFDTDtvQkFDSSxPQUFPLEVBQUU7d0JBQ0wsVUFBVSxFQUFFLEtBQUs7cUJBQ3BCO29CQUNELElBQUksRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLGlCQUFpQixDQUFDO29CQUN0QyxLQUFLLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxvQ0FBb0MsQ0FBQztvQkFDM0QsT0FBTyxFQUFFLGFBQWE7aUJBQ3pCO2FBQ0o7U0FDSixDQUFDO1FBRUYsSUFBSSxDQUFDLFVBQVUsQ0FBQyxZQUFZLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDN0MsQ0FBQztJQUVELEtBQUssQ0FBQyxVQUFVLENBQUMsWUFBa0MsRUFBRSxTQUFrQjtRQUNuRSxNQUFNLFlBQVksR0FBRyxNQUNqQixPQUFPLENBQUMsWUFDWCxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQ3ZCLHdEQUF3RCxFQUN4RCxZQUFZLENBQ2YsQ0FBQztRQUNGLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsWUFBWSxDQUFDLENBQUM7SUFDbkUsQ0FBQztJQUVELFNBQVMsQ0FBQyxNQUFpQjtRQUN2QixNQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDckMsTUFBTSxRQUFRLEdBQUcsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUM7UUFDbEQsTUFBTSxZQUFZLEdBQ2IsZ0JBQWdCLENBQUMsT0FBTyxDQUNyQixJQUFJLENBQUMsYUFBYSxDQUFDLEVBQUUsRUFDckIsT0FBTyxDQUNHLElBQUksSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRXhELFlBQVksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2xDLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN4QixnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxFQUFFLEVBQUUsT0FBTyxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBRXZFLE1BQU0sSUFBSSxHQUFHLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDMUMsTUFBTSxHQUFHLEdBQ0wsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUM7UUFFM0QsZ0JBQWdCLENBQUMsTUFBTSxDQUFDO1lBQ3BCLG1CQUFtQixFQUFFLEdBQUc7WUFDeEIsbUJBQW1CLEVBQUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHO1NBQ3RDLENBQUMsQ0FBQztRQUVILElBQUksTUFBTSxDQUFDLElBQUksS0FBSyxPQUFPLEVBQUUsQ0FBQztZQUMxQixNQUFNLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDakIsQ0FBQztRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFRCxNQUFNLENBQUMsS0FBYyxFQUFFLGdCQUEyQjtRQUM5QyxJQUFJLENBQUMsY0FBYzthQUNkLFVBQVUsQ0FBQyxRQUFRLENBQUM7YUFDcEIsZ0JBQWdCLENBQUMsS0FBSyxFQUFFLGdCQUFnQixDQUFDLENBQUM7SUFDbkQsQ0FBQztJQUVELEtBQUssQ0FBQyxhQUFhO1FBQ2YsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUM3QixNQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDckMsTUFBTSxtQkFBbUIsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUV6RCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ3pCLE1BQU0sTUFBTSxHQUFXLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBVyxDQUFDO1FBQ3ZELEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFcEIsSUFBSSxNQUFNLElBQUksT0FBTyxFQUFFLENBQUM7WUFFcEIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUN2QyxJQUFJLENBQUMsU0FBUyxDQUNWLHNFQUFzRSxFQUN0RTtnQkFDSSxJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUk7Z0JBQ2hCLGdCQUFnQixFQUFFLGdCQUFnQixDQUFDLElBQUk7YUFDMUMsRUFDRCxJQUFJLENBQ1AsRUFDRCxNQUFNLENBQ1QsQ0FBQztZQUNGLE9BQU87UUFDWCxDQUFDO1FBRUQsTUFBTSxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxFQUFFLEVBQUUsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXRFLElBQUksTUFBTSxHQUFHLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBZSxDQUFDO1FBQzNDLG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQVksRUFBRSxFQUFFO1lBQ3pDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7WUFDdkIsSUFBSSxJQUFJLElBQUksTUFBTSxFQUFFLENBQUM7Z0JBQ2pCLE1BQU0sR0FBRyxJQUFpQixDQUFDO1lBQy9CLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztRQUdILE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7UUFDakMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM1QixXQUFXLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdkIsTUFBTSxnQkFBZ0IsQ0FBQyxPQUFPLENBQzFCLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBRSxFQUNyQixXQUFXLEVBQ1gsV0FBVyxDQUNkLENBQUM7UUFHRixNQUFNLElBQUksR0FBRyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO1FBQzFDLE1BQU0sR0FBRyxHQUFXLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM3RCxnQkFBZ0IsQ0FBQyxNQUFNLENBQUM7WUFDcEIsbUJBQW1CLEVBQUUsR0FBRztZQUN4QixtQkFBbUIsRUFBRSxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUc7U0FDdEMsQ0FBQyxDQUFDO1FBR0gsTUFBTSxZQUFZLEdBQUcsTUFDakIsT0FBTyxDQUFDLFlBQ1gsQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUN2QixtRUFBbUUsRUFDbkU7WUFDSSxJQUFJLEVBQUU7Z0JBQ0YsR0FBRyxFQUFFLE1BQU0sQ0FBQyxHQUFHO2dCQUNmLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSTthQUNwQjtZQUNELFdBQVcsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUN2Qix3RUFBd0UsRUFDeEUsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsRUFDL0MsSUFBSSxDQUNQO1lBQ0QsS0FBSyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQ2pCLDBFQUEwRSxDQUM3RTtTQUNKLENBQ0osQ0FBQztRQUNGLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsWUFBWSxDQUFDLENBQUM7SUFDL0QsQ0FBQztJQUVELEtBQUssQ0FBQyxjQUFjO1FBQ2hCLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7UUFDN0IsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUMxQyxNQUFNLElBQUksQ0FBQyxTQUFTLENBQUM7WUFDakIsT0FBTyxFQUFFO2dCQUNMLEtBQUssRUFBRSxLQUFLLENBQUMsSUFBSTthQUNwQjtTQUNKLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCxRQUFRLENBQUMsSUFBWTtRQUNqQixPQUFPLGlCQUFpQixJQUFJLFFBQVEsQ0FBQztJQUN6QyxDQUFDO0lBRUQsUUFBUTtRQUNKLE9BQU8scUNBQXFDLENBQUM7SUFDakQsQ0FBQztDQUNKOzs7Ozs7Ozs7Ozs7Ozs7O0FDOVd1QztBQUdqQyxNQUFNLCtCQUFnQyxTQUFRLG9EQUFXO0lBQ3BELHlCQUF5QixDQUFVO0lBQ25DLGlCQUFpQixDQUFTO0lBRWxDLFlBQVksY0FBOEI7UUFDdEMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ3RCLElBQUksQ0FBQyx5QkFBeUIsR0FBRyxLQUFLLENBQUM7UUFDdkMsSUFBSSxDQUFDLGlCQUFpQixHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ2hDLENBQUM7SUFFRCxJQUFJO1FBQ0EsS0FBSyxDQUFDLEVBQUUsQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUMvRCxDQUFDO0lBRUQsS0FBSyxDQUFDLGVBQWUsQ0FBQyxJQUFlO1FBQ2pDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxJQUFJLGtCQUFrQixFQUFFLENBQUM7WUFDbEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyx3Q0FBd0MsQ0FBQyxDQUFDO1lBRXRELElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQztZQUN4QixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxLQUFLLEVBQUUsRUFBWSxDQUFDO1lBQzVDLElBQUksQ0FBQyx5QkFBeUIsR0FBRyxJQUFJLENBQUM7WUFDdEMsSUFBSSxDQUFDLGlCQUFpQixHQUFHLEtBQUssQ0FBQyxFQUFFLENBQzdCLFlBQVksRUFDWixJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FDL0IsQ0FBQztRQUNOLENBQUM7SUFDTCxDQUFDO0lBRUQsS0FBSyxDQUFDLFlBQVksQ0FBQyxJQUFlO1FBQzlCLElBQUksQ0FBQyxJQUFJLENBQUMseUJBQXlCLElBQUksSUFBSSxDQUFDLEVBQUUsS0FBSyxJQUFJLENBQUMsUUFBUTtZQUM1RCxPQUFPO1FBRVgsT0FBTyxDQUFDLEdBQUcsQ0FBQyxxREFBcUQsQ0FBQyxDQUFDO1FBRW5FLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUNyQyxNQUFNLE9BQU8sR0FBRyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQztRQUVqRCxNQUFNLGdCQUFnQixDQUFDLE1BQU0sQ0FBQztZQUMxQixtQkFBbUIsRUFBRSxPQUFPO1lBQzVCLG1CQUFtQixFQUFFLENBQUM7U0FDekIsQ0FBQyxDQUFDO1FBQ0gsTUFBTSxnQkFBZ0IsQ0FBQyxPQUFPLENBQzFCLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBRSxFQUNyQixXQUFXLEVBQ1gsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUNuQyxDQUFDO1FBQ0YsTUFBTSxnQkFBZ0IsQ0FBQyxPQUFPLENBQzFCLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBRSxFQUNyQixPQUFPLEVBQ1AsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUNuQyxDQUFDO1FBRUYsSUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7UUFDbkIsSUFBSSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUM7UUFDdEIsSUFBSSxDQUFDLHlCQUF5QixHQUFHLEtBQUssQ0FBQztRQUN2QyxLQUFLLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUNoRCxJQUFJLENBQUMsaUJBQWlCLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDaEMsQ0FBQztJQUVELFFBQVE7UUFDSixPQUFPLHVDQUF1QyxDQUFDO0lBQ25ELENBQUM7Q0FDSjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ2xFcUQ7QUFDMEI7QUFDSTtBQUNwQzs7Ozs7Ozs7Ozs7Ozs7OztBQ0czQjtBQUVOLE1BQU0sY0FBYztJQUN2QixjQUFjLENBQWdCO0lBQzlCLFNBQVMsQ0FBeUI7SUFFMUMsWUFBWSxhQUE0QjtRQUNwQyxJQUFJLENBQUMsY0FBYyxHQUFHLGFBQWEsQ0FBQztRQUNwQyxJQUFJLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztJQUN4QixDQUFDO0lBRUQsSUFBSTtRQUNBLElBQUksQ0FBQyxTQUFTLEdBQUc7WUFDYixTQUFTLEVBQUUsSUFBSSx1REFBZ0IsQ0FBQyxJQUFJLENBQUM7WUFDckMsTUFBTSxFQUFFLElBQUksb0RBQWEsQ0FBQyxJQUFJLENBQUM7WUFDL0Isc0JBQXNCLEVBQUUsSUFBSSxvRUFBNkIsQ0FBQyxJQUFJLENBQUM7WUFDL0Qsd0JBQXdCLEVBQUUsSUFBSSxzRUFBK0IsQ0FBQyxJQUFJLENBQUM7U0FDdEUsQ0FBQztJQUNOLENBQUM7SUFFRCxVQUFVLENBQUMsRUFBVTtRQUNqQixJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztZQUNyQixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDOUIsQ0FBQztRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFRCxJQUFJLGFBQWE7UUFDYixPQUFPLElBQUksQ0FBQyxjQUFjLENBQUM7SUFDL0IsQ0FBQztJQUVELFFBQVE7UUFDSixPQUFPLHlCQUF5QixJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQzVELENBQUM7Q0FDSjs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDeEM2QztBQUNWO0FBQ1k7QUFFakMsTUFBTSxhQUFhO0lBQ3RCLFNBQVMsQ0FBUztJQUNsQixlQUFlLENBQWlCO0lBQ2hDLFVBQVUsQ0FBWTtJQUN0QixnQkFBZ0IsQ0FBa0I7SUFFMUMsWUFBWSxFQUFVO1FBQ2xCLElBQUksQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO1FBQ3BCLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSx1REFBYyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2hELElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxrREFBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3RDLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLHdEQUFlLEVBQUUsQ0FBQztJQUNsRCxDQUFDO0lBRUQsSUFBSSxFQUFFO1FBQ0YsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDO0lBQzFCLENBQUM7SUFFRCxJQUFJLGNBQWM7UUFDZCxPQUFPLElBQUksQ0FBQyxlQUFlLENBQUM7SUFDaEMsQ0FBQztJQUVELElBQUksU0FBUztRQUNULE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQztJQUMzQixDQUFDO0lBRUQsSUFBSSxlQUFlO1FBQ2YsT0FBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUM7SUFDakMsQ0FBQztJQUVELElBQUk7UUFDQSxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDdkIsSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUM7UUFDNUIsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUM1QixJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDakMsQ0FBQztJQUVELGVBQWU7UUFDVixNQUFjLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxJQUFJLEdBQUc7WUFDdEMsS0FBSyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLDJCQUEyQixDQUFDO1NBQ3JFLENBQUM7UUFFRCxNQUFjLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxXQUFXLEdBQUc7WUFDL0MsS0FBSyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLDJCQUEyQixDQUFDO1NBQ3JFLENBQUM7UUFDRCxNQUFjLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBRS9ELE1BQWMsQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLFFBQVEsR0FBRztZQUM1QyxLQUFLLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsd0JBQXdCLENBQUM7WUFDL0QsVUFBVSxFQUFFLElBQUk7U0FDbkIsQ0FBQztRQUVELE1BQWMsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLGdCQUFnQjtZQUM1QywrREFBK0QsQ0FBQztJQUN4RSxDQUFDO0lBRUQsb0JBQW9CO1FBQ2hCLE1BQU0sVUFBVSxHQUFHLG9CQUFvQixDQUFDO1FBRXhDLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxjQUFjLEVBQUU7WUFDL0MsS0FBSyxFQUFFLE9BQU87WUFDZCxJQUFJLEVBQUUsMENBQTBDO1lBQ2hELElBQUksRUFBRSwwQ0FBMEM7WUFDaEQsSUFBSSxFQUFFLE9BQU87WUFDYixNQUFNLEVBQUUsSUFBSTtZQUNaLE9BQU8sRUFBRSxJQUFJO1NBQ2hCLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSwrQkFBK0IsRUFBRTtZQUNoRSxLQUFLLEVBQUUsT0FBTztZQUNkLElBQUksRUFBRSwwREFBMEQ7WUFDaEUsSUFBSSxFQUFFLDBEQUEwRDtZQUNoRSxJQUFJLEVBQUUsTUFBTTtZQUNaLE1BQU0sRUFBRSxJQUFJO1lBQ1osT0FBTyxFQUFFLENBQUM7U0FDYixDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsYUFBYSxFQUFFO1lBQzlDLEtBQUssRUFBRSxPQUFPO1lBQ2QsSUFBSSxFQUFFLHlDQUF5QztZQUMvQyxJQUFJLEVBQUUseUNBQXlDO1lBQy9DLElBQUksRUFBRSxPQUFPO1lBQ2IsTUFBTSxFQUFFLElBQUk7WUFDWixPQUFPLEVBQUUsSUFBSTtTQUNoQixDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsNEJBQTRCLEVBQUU7WUFDN0QsS0FBSyxFQUFFLE1BQU07WUFDYixJQUFJLEVBQUUsd0RBQXdEO1lBQzlELElBQUksRUFBRSx3REFBd0Q7WUFDOUQsSUFBSSxFQUFFLE9BQU87WUFDYixNQUFNLEVBQUUsSUFBSTtZQUNaLE9BQU8sRUFBRSxLQUFLO1NBQ2pCLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCxLQUFLLENBQUMsUUFBaUIsS0FBSztRQUN4QixNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDM0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDaEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRyxNQUFjLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDekQsQ0FBQztJQUVELFFBQVE7UUFDSixPQUFPLHFCQUFxQixDQUFDO0lBQ2pDLENBQUM7Q0FDSjs7Ozs7Ozs7Ozs7Ozs7O0FDNUdjLE1BQU0sZUFBZTtJQUNoQyxnQkFBZSxDQUFDO0lBRWhCLElBQUk7UUFDQyxPQUFPLENBQUMsWUFBb0IsQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUNsRCxlQUFlLENBQUMsS0FBSyxDQUN4QixDQUFDO0lBQ04sQ0FBQztJQUVELE1BQU0sS0FBSyxLQUFLO1FBQ1osTUFBTSxLQUFLLEdBQThCLEVBQUUsQ0FBQztRQUM1QyxNQUFNLGFBQWEsR0FBRyw2VEFBNlQsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDL1YsS0FBSyxNQUFNLElBQUksSUFBSSxhQUFhLEVBQUUsQ0FBQztZQUMvQixLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7UUFDaEQsQ0FBQztRQUNELE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7SUFFRCxNQUFNLENBQUMsV0FBVztRQUNkLEtBQUssTUFBTSxRQUFRLElBQUksY0FBYyxFQUFFLENBQUM7WUFDcEMsSUFDSSxNQUFNLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLFFBQVEsQ0FBQyxFQUNoRSxDQUFDO2dCQUNDLE9BQU8sY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3BDLENBQUM7UUFDTCxDQUFDO1FBRUEsT0FBTyxDQUFDLFlBQW9CLENBQUMsVUFBVTthQUNuQyxhQUFhLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQzthQUN6QixJQUFJLENBQUMsR0FBRyxFQUFFO1lBQ1AsS0FBSyxNQUFNLFdBQVcsSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQ25DLElBQ0ksTUFBTSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUNoQyxFQUFFLENBQUMsT0FBTyxFQUNWLFdBQVcsQ0FDZCxFQUNILENBQUM7b0JBQ0MsRUFBRSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3pDLENBQUM7WUFDTCxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDWCxDQUFDO0lBRUQsUUFBUTtRQUNKLE9BQU8sdUJBQXVCLENBQUM7SUFDbkMsQ0FBQztDQUNKOzs7Ozs7Ozs7Ozs7Ozs7QUMzQ2MsTUFBTSxTQUFTO0lBQ2xCLGNBQWMsQ0FBZ0I7SUFFdEMsWUFBWSxhQUE0QjtRQUNwQyxJQUFJLENBQUMsY0FBYyxHQUFHLGFBQWEsQ0FBQztJQUN4QyxDQUFDO0lBRUQsSUFBSSxhQUFhO1FBQ2IsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDO0lBQy9CLENBQUM7SUFFRCxXQUFXLENBQUMsT0FBc0IsRUFBRSxFQUFVO1FBQzFDLE9BQU8sSUFBSSxPQUFPLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUM7WUFDekMsTUFBTSxFQUFFO2dCQUNKLEtBQUssRUFBRSxPQUFPLENBQUMsS0FBSztnQkFDcEIsY0FBYyxFQUFFLE9BQU8sQ0FBQyxjQUFjLElBQUksRUFBRTthQUMvQztZQUNELE9BQU8sRUFBRSxPQUFPLENBQUMsT0FBTztZQUN4QixPQUFPLEVBQUUsT0FBTyxDQUFDLE9BQU87WUFDeEIsTUFBTSxFQUFFLE9BQU8sQ0FBQyxRQUFRO1lBQ3hCLEVBQUUsRUFBRSxFQUFFO1NBQ1QsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVELGNBQWMsQ0FBQyxHQUFXLEVBQUUsT0FBZSxNQUFNO1FBQzdDLElBQUksRUFBRSxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQ25CLFFBQVEsSUFBSSxFQUFFLENBQUM7Z0JBQ1gsS0FBSyxPQUFPO29CQUNSLEVBQUUsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUM1QixNQUFNO2dCQUNWLEtBQUssTUFBTTtvQkFDUCxFQUFFLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFDM0IsTUFBTTtnQkFDVixLQUFLLE1BQU0sQ0FBQztnQkFDWjtvQkFDSSxFQUFFLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNuQyxDQUFDO1FBQ0wsQ0FBQztJQUNMLENBQUM7SUFFRCxRQUFRLENBQ0osT0FBZ0IsRUFDaEIsT0FBZSxFQUNmLE1BQWUsRUFDZixLQUFjLEVBQ2QsVUFBb0IsRUFBRSxFQUN0QixPQUE4QixLQUFLLENBQUMsa0JBQWtCLENBQUMsS0FBSztRQUU1RCxNQUFNLFFBQVEsR0FBRztZQUNiLE9BQU8sRUFBRSxXQUFXLENBQUMsVUFBVSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxDQUFDO1lBQ25ELElBQUk7WUFDSixNQUFNO1lBQ04sS0FBSztZQUNMLE9BQU87WUFDUCxPQUFPO1NBQ1YsQ0FBQztRQUNGLFdBQVcsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDakMsQ0FBQztJQUVELGVBQWUsQ0FDWCxHQUFXLEVBQ1gsSUFBZ0MsRUFDaEMsU0FBa0IsS0FBSztRQUV2QixJQUFJLE1BQU0sRUFBRSxDQUFDO1lBQ1QsT0FBUSxJQUFZLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDaEQsQ0FBQztRQUNELE9BQVEsSUFBWSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ2xELENBQUM7SUFFRCxRQUFRO1FBQ0osT0FBTyxpQkFBaUIsQ0FBQztJQUM3QixDQUFDO0NBQ0o7Ozs7Ozs7VUM1RUQ7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7Ozs7V0N0QkE7V0FDQTtXQUNBO1dBQ0E7V0FDQSx5Q0FBeUMsd0NBQXdDO1dBQ2pGO1dBQ0E7V0FDQTs7Ozs7V0NQQTs7Ozs7V0NBQTtXQUNBO1dBQ0E7V0FDQSx1REFBdUQsaUJBQWlCO1dBQ3hFO1dBQ0EsZ0RBQWdELGFBQWE7V0FDN0Q7Ozs7Ozs7Ozs7Ozs7O0FDTjREO0FBQ0k7QUFFeEI7QUFFeEMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsS0FBSyxJQUFJLEVBQUU7SUFDMUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFDO0lBRWxELE1BQU0sYUFBYSxHQUFHLElBQUksc0VBQWEsQ0FBQyw0Q0FBYSxDQUFDLENBQUM7SUFDdkQsYUFBYSxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ3pCLENBQUMsQ0FBQyxDQUFDO0FBRUgsSUFBSSxJQUFzQyxFQUFFLENBQUM7SUFDekMsSUFBSSxLQUFVLEVBQUU7QUFBQSxFQU1mO0FBQ0wsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL2Z2dHQtd2VhcG9uLXJlbG9hZC8uL3NyYy9tb2R1bGUvZmVhdHVyZXMvQmFzZUZlYXR1cmUudHMiLCJ3ZWJwYWNrOi8vZnZ0dC13ZWFwb24tcmVsb2FkLy4vc3JjL21vZHVsZS9mZWF0dXJlcy9OZXh0Um91bmRGZWF0dXJlLnRzIiwid2VicGFjazovL2Z2dHQtd2VhcG9uLXJlbG9hZC8uL3NyYy9tb2R1bGUvZmVhdHVyZXMvUmVsb2FkRmVhdHVyZS50cyIsIndlYnBhY2s6Ly9mdnR0LXdlYXBvbi1yZWxvYWQvLi9zcmMvbW9kdWxlL2ZlYXR1cmVzL1JlbG9hZGFibGVXZWFwb25BdHRhY2tGZWF0dXJlLnRzIiwid2VicGFjazovL2Z2dHQtd2VhcG9uLXJlbG9hZC8uL3NyYy9tb2R1bGUvZmVhdHVyZXMvUmVsb2FkYWJsZVdlYXBvbkNyZWF0aW9uRmVhdHVyZS50cyIsIndlYnBhY2s6Ly9mdnR0LXdlYXBvbi1yZWxvYWQvLi9zcmMvbW9kdWxlL2ZlYXR1cmVzL2luZGV4LnRzIiwid2VicGFjazovL2Z2dHQtd2VhcG9uLXJlbG9hZC8uL3NyYy9tb2R1bGUvbWFuYWdlcnMvRmVhdHVyZU1hbmFnZXIudHMiLCJ3ZWJwYWNrOi8vZnZ0dC13ZWFwb24tcmVsb2FkLy4vc3JjL21vZHVsZS9tYW5hZ2Vycy9Nb2R1bGVNYW5hZ2VyLnRzIiwid2VicGFjazovL2Z2dHQtd2VhcG9uLXJlbG9hZC8uL3NyYy9tb2R1bGUvbWFuYWdlcnMvVGVtcGxhdGVNYW5hZ2VyLnRzIiwid2VicGFjazovL2Z2dHQtd2VhcG9uLXJlbG9hZC8uL3NyYy9tb2R1bGUvbWFuYWdlcnMvVWlNYW5hZ2VyLnRzIiwid2VicGFjazovL2Z2dHQtd2VhcG9uLXJlbG9hZC93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9mdnR0LXdlYXBvbi1yZWxvYWQvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL2Z2dHQtd2VhcG9uLXJlbG9hZC93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL2Z2dHQtd2VhcG9uLXJlbG9hZC93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL2Z2dHQtd2VhcG9uLXJlbG9hZC8uL3NyYy9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgRmVhdHVyZU1hbmFnZXIgZnJvbSAnLi4vbWFuYWdlcnMvRmVhdHVyZU1hbmFnZXInO1xuaW1wb3J0IHsgRG5kSXRlbTVlIH0gZnJvbSAnLi4vdHlwZXMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCYXNlRmVhdHVyZSB7XG4gICAgcHJpdmF0ZSBfZmVhdHVyZU1hbmFnZXI6IEZlYXR1cmVNYW5hZ2VyO1xuICAgIHByaXZhdGUgX2FjdG9ySWQ6IHN0cmluZztcbiAgICBwcml2YXRlIF93ZWFwb25JZDogc3RyaW5nO1xuXG4gICAgY29uc3RydWN0b3IoZmVhdHVyZU1hbmFnZXI6IEZlYXR1cmVNYW5hZ2VyKSB7XG4gICAgICAgIHRoaXMuX2ZlYXR1cmVNYW5hZ2VyID0gZmVhdHVyZU1hbmFnZXI7XG4gICAgICAgIHRoaXMuX2FjdG9ySWQgPSAnJztcbiAgICAgICAgdGhpcy5fd2VhcG9uSWQgPSAnJztcbiAgICAgICAgdGhpcy5pbml0KCk7XG4gICAgfVxuXG4gICAgZ2V0IGZlYXR1cmVNYW5hZ2VyKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZmVhdHVyZU1hbmFnZXI7XG4gICAgfVxuXG4gICAgZ2V0IG1vZHVsZU1hbmFnZXIoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9mZWF0dXJlTWFuYWdlci5tb2R1bGVNYW5hZ2VyO1xuICAgIH1cblxuICAgIGdldCBjaGFyYWN0ZXIoKTogQWN0b3I1ZSB7XG4gICAgICAgIHJldHVybiBnYW1lPy5hY3RvcnM/LmdldCh0aGlzLl9hY3RvcklkKSBhcyBBY3RvcjVlO1xuICAgIH1cblxuICAgIGdldCBjaGFyYWN0ZXJJZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FjdG9ySWQ7XG4gICAgfVxuXG4gICAgc2V0IGNoYXJhY3RlcklkKGlkOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5fYWN0b3JJZCA9IGlkO1xuICAgIH1cblxuICAgIGdldCB3ZWFwb24oKTogRG5kSXRlbTVlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2hhcmFjdGVyLml0ZW1zLmdldCh0aGlzLl93ZWFwb25JZCkgYXMgRG5kSXRlbTVlO1xuICAgIH1cblxuICAgIGdldCB3ZWFwb25JZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3dlYXBvbklkO1xuICAgIH1cblxuICAgIHNldCB3ZWFwb25JZChpZDogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuX3dlYXBvbklkID0gaWQ7XG4gICAgfVxuXG4gICAgZ2V0IGxvYWRvdXQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFJlbG9hZEZsYWcoJ2NoYW1iZXJlZCcpO1xuICAgIH1cblxuICAgIGdldCBmaXJlZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0UmVsb2FkRmxhZygnZmlyZWQnKTtcbiAgICB9XG5cbiAgICBnZXRSZWxvYWRGbGFnKG5hbWU6IHN0cmluZykge1xuICAgICAgICBjb25zdCByZWxvYWRhYmxlV2VhcG9uID0gdGhpcy53ZWFwb247XG4gICAgICAgIGNvbnN0IG1heFNob3RzID0gcmVsb2FkYWJsZVdlYXBvbi5zeXN0ZW0udXNlcy5tYXg7XG4gICAgICAgIGNvbnN0IGZpcmVkID1cbiAgICAgICAgICAgIChyZWxvYWRhYmxlV2VhcG9uLmdldEZsYWcoXG4gICAgICAgICAgICAgICAgdGhpcy5tb2R1bGVNYW5hZ2VyLmlkLFxuICAgICAgICAgICAgICAgIG5hbWVcbiAgICAgICAgICAgICkgYXMgc3RyaW5nW10pIHx8IG5ldyBBcnJheShtYXhTaG90cykuZmlsbCgnRW1wdHknKTtcblxuICAgICAgICBpZiAoZmlyZWQubGVuZ3RoIDwgbWF4U2hvdHMpIHtcbiAgICAgICAgICAgIGNvbnN0IG1pc3NpbmcgPSBtYXhTaG90cyAtIGZpcmVkLmxlbmd0aDtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbWlzc2luZzsgaSsrKSB7XG4gICAgICAgICAgICAgICAgZmlyZWQucHVzaCgnRW1wdHknKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmaXJlZDtcbiAgICB9XG5cbiAgICBhbW11bml0aW9uKGl0ZW1zOiBDb2xsZWN0aW9uPEl0ZW01ZT4sIGVxdWlwcGVkOiBib29sZWFuID0gZmFsc2UpOiBJdGVtNWVbXSB7XG4gICAgICAgIHJldHVybiBpdGVtcy5maWx0ZXIoKGl0ZW06IEl0ZW01ZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZ2FtZVN5c3RlbSA9IChpdGVtIGFzIERuZEl0ZW01ZSkuc3lzdGVtO1xuICAgICAgICAgICAgaWYgKGVxdWlwcGVkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgICAgaXRlbS50eXBlID09ICdjb25zdW1hYmxlJyAmJlxuICAgICAgICAgICAgICAgICAgICBnYW1lU3lzdGVtLnR5cGUuc3VidHlwZSA9PSAnZmlyZWFybUJ1bGxldCcgJiZcbiAgICAgICAgICAgICAgICAgICAgZ2FtZVN5c3RlbS5lcXVpcHBlZFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgIGl0ZW0udHlwZSA9PSAnY29uc3VtYWJsZScgJiZcbiAgICAgICAgICAgICAgICBnYW1lU3lzdGVtLnR5cGUuc3VidHlwZSA9PSAnZmlyZWFybUJ1bGxldCdcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGluaXQoKSB7fVxuXG4gICAgdHJhbnNsYXRlKGtleTogc3RyaW5nLCBvcHRzPzogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfSwgZm9ybWF0PzogYm9vbGVhbikge1xuICAgICAgICByZXR1cm4gdGhpcy5tb2R1bGVNYW5hZ2VyLnVpTWFuYWdlci5nZXRMb2NhbGl6ZWRUeHQoa2V5LCBvcHRzLCBmb3JtYXQpO1xuICAgIH1cblxuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gJ2NsYXNzIEJhc2VGZWF0dXJlJztcbiAgICB9XG59XG4iLCJpbXBvcnQgRmVhdHVyZU1hbmFnZXIgZnJvbSAnLi4vbWFuYWdlcnMvRmVhdHVyZU1hbmFnZXInO1xuaW1wb3J0IEJhc2VGZWF0dXJlIGZyb20gJy4vQmFzZUZlYXR1cmUnO1xuXG5leHBvcnQgY2xhc3MgTmV4dFJvdW5kRmVhdHVyZSBleHRlbmRzIEJhc2VGZWF0dXJlIHtcbiAgICBjb25zdHJ1Y3RvcihmZWF0dXJlTWFuYWdlcjogRmVhdHVyZU1hbmFnZXIpIHtcbiAgICAgICAgc3VwZXIoZmVhdHVyZU1hbmFnZXIpO1xuICAgIH1cblxuICAgIGluaXQoKSB7XG4gICAgICAgIEhvb2tzLm9uKCdkbmQ1ZS5wcmVVc2VBY3Rpdml0eScsIHRoaXMub25Vc2VBY3Rpdml0eS5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICBvblVzZUFjdGl2aXR5KGFjdGl2aXR5OiBhbnkpIHtcbiAgICAgICAgaWYgKGFjdGl2aXR5LnR5cGUgPT09ICd1dGlsaXR5JyAmJiBhY3Rpdml0eS5uYW1lID09ICdOZXh0IFJvdW5kJykge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1dlYXBvbiBSZWxvYWQgfCBUcmlnZ2VyZWQgTmV4dCBSb3VuZCcpO1xuXG4gICAgICAgICAgICB0aGlzLmNoYXJhY3RlcklkID0gYWN0aXZpdHkuYWN0b3IuaWQ7XG4gICAgICAgICAgICB0aGlzLndlYXBvbklkID0gYWN0aXZpdHkuaXRlbS5pZDtcbiAgICAgICAgICAgIHRoaXMubmV4dFJvdW5kKCk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgYXN5bmMgbmV4dFJvdW5kKCkge1xuICAgICAgICBjb25zdCBuZXh0Um91bmQgPSB0aGlzLmxvYWRvdXRbMF07XG4gICAgICAgIGNvbnN0IGFjdG9yID0gdGhpcy5jaGFyYWN0ZXI7XG5cbiAgICAgICAgLy8gTm90aWZ5IHRoZSB1c2VyIHdoYXQgdGhlIG5leHQgcm91bmQgaXNcbiAgICAgICAgY29uc3QgaHRtbFRlbXBsYXRlID0gYXdhaXQgKFxuICAgICAgICAgICAgZm91bmRyeS5hcHBsaWNhdGlvbnMgYXMgYW55XG4gICAgICAgICkuaGFuZGxlYmFycy5yZW5kZXJUZW1wbGF0ZShcbiAgICAgICAgICAgICdtb2R1bGVzL2Z2dHQtd2VhcG9uLXJlbG9hZC90ZW1wbGF0ZXMvYW1tb1JlZnVuZE5vdGljZVRlbXBsYXRlLmhicycsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaXRlbToge1xuICAgICAgICAgICAgICAgICAgICBpbWc6ICdtb2R1bGVzL2Z2dHQtd2VhcG9uLXJlbG9hZC9hc3NldHMvaWNvbnMvYnVsbGV0c19id19pY29uLnBuZycsXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IG5leHRSb3VuZCxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiB0aGlzLnRyYW5zbGF0ZShcbiAgICAgICAgICAgICAgICAgICAgJ1dFQVBPTl9SRUxPQUQuRmVhdHVyZXMuTmV4dFJvdW5kLkRlc2NyaXB0aW9uJyxcbiAgICAgICAgICAgICAgICAgICAgeyBidWxsZXQ6IG5leHRSb3VuZCwgd2VhcG9uOiB0aGlzLndlYXBvbi5uYW1lIH0sXG4gICAgICAgICAgICAgICAgICAgIHRydWVcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIHRpdGxlOiB0aGlzLnRyYW5zbGF0ZSgnV0VBUE9OX1JFTE9BRC5GZWF0dXJlcy5OZXh0Um91bmQuVGl0bGUnKSxcbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy5tb2R1bGVNYW5hZ2VyLnVpTWFuYWdlci5zZW5kQ2hhdChcbiAgICAgICAgICAgIGFjdG9yLFxuICAgICAgICAgICAgaHRtbFRlbXBsYXRlLFxuICAgICAgICAgICAgdW5kZWZpbmVkLFxuICAgICAgICAgICAgdW5kZWZpbmVkLFxuICAgICAgICAgICAgW2FjdG9yLmlkXSxcbiAgICAgICAgICAgIENPTlNULkNIQVRfTUVTU0FHRV9UWVBFUy5XSElTUEVSXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgdG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiAnY2xhc3MgTmV4dFJvdW5kRmVhdHVyZSc7XG4gICAgfVxufVxuIiwiaW1wb3J0IERpYWxvZ1YyIGZyb20gJ0BsZWFndWUtb2YtZm91bmRyeS1kZXZlbG9wZXJzL2ZvdW5kcnktdnR0LXR5cGVzL3NyYy9mb3VuZHJ5L2NsaWVudC1lc20vYXBwbGljYXRpb25zL2FwaS9kaWFsb2cubWpzJztcbmltcG9ydCBGZWF0dXJlTWFuYWdlciBmcm9tICcuLi9tYW5hZ2Vycy9GZWF0dXJlTWFuYWdlcic7XG5pbXBvcnQgQmFzZUZlYXR1cmUgZnJvbSAnLi9CYXNlRmVhdHVyZSc7XG5pbXBvcnQgeyB0eXBlIEFtbW9JdGVtT3B0aW9uLCBEbmRJdGVtNWUgfSBmcm9tICcuLi90eXBlcyc7XG5cbmV4cG9ydCBjbGFzcyBSZWxvYWRGZWF0dXJlIGV4dGVuZHMgQmFzZUZlYXR1cmUge1xuICAgIHByaXZhdGUgX2hvb2tJZDogbnVtYmVyO1xuICAgIHByaXZhdGUgX2hhbmRsZUNob2ljZURpYWxvZ0Nsb3NlOiBib29sZWFuO1xuXG4gICAgY29uc3RydWN0b3IoZmVhdHVyZU1hbmFnZXI6IEZlYXR1cmVNYW5hZ2VyKSB7XG4gICAgICAgIHN1cGVyKGZlYXR1cmVNYW5hZ2VyKTtcbiAgICAgICAgdGhpcy5faG9va0lkID0gLTE7XG4gICAgICAgIHRoaXMuX2hhbmRsZUNob2ljZURpYWxvZ0Nsb3NlID0gZmFsc2U7XG4gICAgfVxuXG4gICAgaW5pdCgpIHtcbiAgICAgICAgSG9va3Mub24oJ2RuZDVlLnByZVVzZUFjdGl2aXR5JywgdGhpcy5vblVzZUFjdGl2aXR5LmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIG9uVXNlQWN0aXZpdHkoYWN0aXZpdHk6IGFueSkge1xuICAgICAgICBpZiAoYWN0aXZpdHkudHlwZSA9PT0gJ3V0aWxpdHknICYmIGFjdGl2aXR5Lm5hbWUgPT0gJ1JlbG9hZCcpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdXZWFwb24gUmVsb2FkIHwgVHJpZ2dlcmVkIFJlbG9hZCcpO1xuXG4gICAgICAgICAgICB0aGlzLmNoYXJhY3RlcklkID0gYWN0aXZpdHkuYWN0b3IuaWQ7XG4gICAgICAgICAgICB0aGlzLndlYXBvbklkID0gYWN0aXZpdHkuaXRlbS5pZDtcbiAgICAgICAgICAgIHRoaXMud2VhcG9uUmVsb2FkKCk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgd2VhcG9uUmVsb2FkKHJlZnVuZEFtbW86IGJvb2xlYW4gPSB0cnVlKSB7XG4gICAgICAgIGNvbnN0IGl0ZW1zID0gdGhpcy5jaGFyYWN0ZXI/Lml0ZW1zO1xuICAgICAgICBjb25zdCBjdXJyZW50TG9hZG91dCA9IHRoaXMubG9hZG91dDtcbiAgICAgICAgY29uc3QgaW52ZW50b3J5QW1tdW5pdGlvbiA9IHRoaXMuYW1tdW5pdGlvbihpdGVtcykgYXMgRG5kSXRlbTVlW107XG4gICAgICAgIGxldCBhbW11bml0aW9uQ2hvaWNlczogQW1tb0l0ZW1PcHRpb25bXSA9IFtdO1xuXG4gICAgICAgIGlmIChyZWZ1bmRBbW1vKSB7XG4gICAgICAgICAgICBhbW11bml0aW9uQ2hvaWNlcyA9IHRoaXMucmVmdW5kQ2hhbWJlcmVkQW1tbyhpbnZlbnRvcnlBbW11bml0aW9uKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGFtbXVuaXRpb25DaG9pY2VzID0gaW52ZW50b3J5QW1tdW5pdGlvbi5tYXAoXG4gICAgICAgICAgICAgICAgKGFtbW86IERuZEl0ZW01ZSk6IEFtbW9JdGVtT3B0aW9uID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGFtbW8ubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBhbW1vLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb3VudDogYW1tby5zeXN0ZW0ucXVhbnRpdHksXG4gICAgICAgICAgICAgICAgICAgICAgICBlcXVpcHBlZDogYW1tby5zeXN0ZW0uZXF1aXBwZWQsXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGNoZWNrRXF1aXBwZWQgPSBnYW1lLnNldHRpbmdzLmdldChcbiAgICAgICAgICAgIHRoaXMubW9kdWxlTWFuYWdlci5pZCxcbiAgICAgICAgICAgICdmaWx0ZXJBbW11bml0aW9uQnlFcXVpcHBlZCdcbiAgICAgICAgKSBhcyBib29sZWFuO1xuXG4gICAgICAgIHRoaXMuY2hvb3NlQW1tdW5pdGlvbihcbiAgICAgICAgICAgIGFtbXVuaXRpb25DaG9pY2VzLmZpbHRlcigoYW1tb0l0ZW06IEFtbW9JdGVtT3B0aW9uKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGFtbW9JdGVtLmNvdW50ID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAoY2hlY2tFcXVpcHBlZCAmJiBhbW1vSXRlbS5lcXVpcHBlZCkgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICFjaGVja0VxdWlwcGVkXG4gICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBjdXJyZW50TG9hZG91dFxuICAgICAgICApO1xuICAgIH1cblxuICAgIHJlZnVuZENoYW1iZXJlZEFtbW8oaW52ZW50b3J5QW1tdW5pdGlvbjogRG5kSXRlbTVlW10pOiBBbW1vSXRlbU9wdGlvbltdIHtcbiAgICAgICAgY29uc3QgbG9hZG91dENvdW50cyA9IHRoaXMuZ2V0TG9hZG91dENvdW50cyh0aGlzLmxvYWRvdXQpO1xuICAgICAgICBjb25zdCBhdmFpbGFibGVBbW11bml0aW9uOiBBbW1vSXRlbU9wdGlvbltdID0gW107XG4gICAgICAgIGludmVudG9yeUFtbXVuaXRpb24uZm9yRWFjaCgoYW1tbzogRG5kSXRlbTVlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBuYW1lID0gYW1tby5uYW1lO1xuICAgICAgICAgICAgY29uc3QgYW1tb0luZm86IEFtbW9JdGVtT3B0aW9uID0ge1xuICAgICAgICAgICAgICAgIG5hbWU6IGFtbW8ubmFtZSxcbiAgICAgICAgICAgICAgICB2YWx1ZTogYW1tby5uYW1lLFxuICAgICAgICAgICAgICAgIGNvdW50OiBhbW1vLnN5c3RlbS5xdWFudGl0eSxcbiAgICAgICAgICAgICAgICBlcXVpcHBlZDogYW1tby5zeXN0ZW0uZXF1aXBwZWQsXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaWYgKGxvYWRvdXRDb3VudHNbbmFtZV0pIHtcbiAgICAgICAgICAgICAgICBhbW1vSW5mby5jb3VudCA9IGFtbW8uc3lzdGVtLnF1YW50aXR5ICsgbG9hZG91dENvdW50c1tuYW1lXTtcbiAgICAgICAgICAgICAgICBhbW1vLnVwZGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgICdzeXN0ZW0ucXVhbnRpdHknOiBhbW1vSW5mby5jb3VudCxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGF2YWlsYWJsZUFtbXVuaXRpb24ucHVzaChhbW1vSW5mbyk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gYXZhaWxhYmxlQW1tdW5pdGlvbjtcbiAgICB9XG5cbiAgICBhc3luYyBjaG9vc2VBbW11bml0aW9uKFxuICAgICAgICBhbW1vT3B0aW9uczogQW1tb0l0ZW1PcHRpb25bXSxcbiAgICAgICAgY3VycmVudExvYWRvdXQ6IHN0cmluZ1tdXG4gICAgKSB7XG4gICAgICAgIGNvbnN0IGRpYWxvZ0NvbnRlbnQgPSBhd2FpdCAoXG4gICAgICAgICAgICBmb3VuZHJ5LmFwcGxpY2F0aW9ucyBhcyBhbnlcbiAgICAgICAgKS5oYW5kbGViYXJzLnJlbmRlclRlbXBsYXRlKFxuICAgICAgICAgICAgJ21vZHVsZXMvZnZ0dC13ZWFwb24tcmVsb2FkL3RlbXBsYXRlcy9hbW1vU2VsZWN0aW9uRGlhbG9nVGVtcGxhdGUuaGJzJyxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBsb2Fkb3V0U2xvdHM6IG5ldyBBcnJheSh0aGlzLndlYXBvbi5zeXN0ZW0udXNlcy5tYXgpLmZpbGwoXG4gICAgICAgICAgICAgICAgICAgICdFbXB0eSdcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIGFtbW9PcHRpb25zLFxuICAgICAgICAgICAgfVxuICAgICAgICApO1xuXG4gICAgICAgIGNvbnN0IGRpYWxvZ0J1dHRvbnMgPSBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYWN0aW9uOiAnbG9hZCcsXG4gICAgICAgICAgICAgICAgbGFiZWw6IHRoaXMudHJhbnNsYXRlKFxuICAgICAgICAgICAgICAgICAgICAnV0VBUE9OX1JFTE9BRC5GZWF0dXJlcy5SZWxvYWQuQW1tdW5pdGlvbi5DaG9pY2VEaWFsb2dCdXR0b25UeHRMb2FkJ1xuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgY2FsbGJhY2s6IChcbiAgICAgICAgICAgICAgICAgICAgX2V2ZW50OiBQb2ludGVyRXZlbnQgfCBTdWJtaXRFdmVudCxcbiAgICAgICAgICAgICAgICAgICAgYnV0dG9uOiBIVE1MQnV0dG9uRWxlbWVudFxuICAgICAgICAgICAgICAgICkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9oYW5kbGVDaG9pY2VEaWFsb2dDbG9zZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBsb2Fkb3V0OiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKFxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGkgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgaSA8IChidXR0b24uZm9ybT8uZWxlbWVudHM/Lmxlbmd0aCBhcyBudW1iZXIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaSsrXG4gICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZWxtID0gYnV0dG9uLmZvcm0/LmVsZW1lbnRzLml0ZW0oXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaVxuICAgICAgICAgICAgICAgICAgICAgICAgKSBhcyBIVE1MU2VsZWN0RWxlbWVudDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlbG0/Lm5hbWUgPT0gJ2FtbW8tc2VsZWN0Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvYWRvdXQucHVzaChlbG0udmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7IGxvYWRvdXQsIHJlbG9hZENhbmNlbGVkOiBmYWxzZSB9O1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGFjdGlvbjogJ2NhbmNlbCcsXG4gICAgICAgICAgICAgICAgbGFiZWw6IHRoaXMudHJhbnNsYXRlKFxuICAgICAgICAgICAgICAgICAgICAnV0VBUE9OX1JFTE9BRC5GZWF0dXJlcy5SZWxvYWQuQW1tdW5pdGlvbi5DaG9pY2VEaWFsb2dCdXR0b25UeHRDYW5jZWwnXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBjYWxsYmFjazogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9oYW5kbGVDaG9pY2VEaWFsb2dDbG9zZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4geyBsb2Fkb3V0OiBjdXJyZW50TG9hZG91dCwgcmVsb2FkQ2FuY2VsZWQ6IHRydWUgfTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgXTtcblxuICAgICAgICB0aGlzLl9oYW5kbGVDaG9pY2VEaWFsb2dDbG9zZSA9IHRydWU7XG4gICAgICAgIHRoaXMuX2hvb2tJZCA9IEhvb2tzLm9uKCdjbG9zZURpYWxvZ1YyJywgKGRpYWxvZ1YyOiBEaWFsb2dWMikgPT4ge1xuICAgICAgICAgICAgaWYgKGRpYWxvZ1YyLmlkID09PSAnYW1tby1jaG9pY2UtZGlhbG9nJykge1xuICAgICAgICAgICAgICAgIHRoaXMub25DbG9zZUNob2ljZURpYWxvZyhjdXJyZW50TG9hZG91dCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMubW9kdWxlTWFuYWdlci51aU1hbmFnZXJcbiAgICAgICAgICAgIC5idWlsZERpYWxvZyhcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiB0aGlzLnRyYW5zbGF0ZShcbiAgICAgICAgICAgICAgICAgICAgICAgICdXRUFQT05fUkVMT0FELkZlYXR1cmVzLlJlbG9hZC5BbW11bml0aW9uLkNob2ljZURpYWxvZ1RpdGxlJ1xuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICBjb250ZW50OiBkaWFsb2dDb250ZW50LFxuICAgICAgICAgICAgICAgICAgICBidXR0b25zOiBkaWFsb2dCdXR0b25zLFxuICAgICAgICAgICAgICAgICAgICBvblN1Ym1pdDogKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvYWRvdXQsXG4gICAgICAgICAgICAgICAgICAgICAgICByZWxvYWRDYW5jZWxlZCxcbiAgICAgICAgICAgICAgICAgICAgfToge1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9hZG91dDogc3RyaW5nW107XG4gICAgICAgICAgICAgICAgICAgICAgICByZWxvYWRDYW5jZWxlZDogYm9vbGVhbjtcbiAgICAgICAgICAgICAgICAgICAgfSk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucmVsb2FkUmVsb2FkYWJsZVdlYXBvbihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2Fkb3V0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbG9hZENhbmNlbGVkXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgJ2FtbW8tY2hvaWNlLWRpYWxvZydcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgIC5yZW5kZXIoeyBmb3JjZTogdHJ1ZSB9KTtcbiAgICB9XG5cbiAgICBvbkNsb3NlQ2hvaWNlRGlhbG9nKGxvYWRvdXQ6IHN0cmluZ1tdKSB7XG4gICAgICAgIEhvb2tzLm9mZignY2xvc2VEaWFsb2dWMicsIHRoaXMuX2hvb2tJZCk7XG4gICAgICAgIHRoaXMuX2hvb2tJZCA9IC0xO1xuXG4gICAgICAgIGlmICh0aGlzLl9oYW5kbGVDaG9pY2VEaWFsb2dDbG9zZSkge1xuICAgICAgICAgICAgdGhpcy5faGFuZGxlQ2hvaWNlRGlhbG9nQ2xvc2UgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMucmVsb2FkUmVsb2FkYWJsZVdlYXBvbihsb2Fkb3V0LCB0cnVlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFzeW5jIHJlbG9hZFJlbG9hZGFibGVXZWFwb24oXG4gICAgICAgIGxvYWRvdXQ6IHN0cmluZ1tdLFxuICAgICAgICByZWxvYWRDYW5jZWxlZDogYm9vbGVhbiA9IGZhbHNlXG4gICAgKSB7XG4gICAgICAgIGNvbnN0IHJlbG9hZGFibGVXZWFwb24gPSB0aGlzLndlYXBvbjtcbiAgICAgICAgY29uc3QgYW1tb0NvdW50cyA9IHRoaXMuZ2V0TG9hZG91dENvdW50cyhsb2Fkb3V0KTtcblxuICAgICAgICBpZiAodGhpcy5yZW1vdmVMb2Fkb3V0KGFtbW9Db3VudHMpKSB7XG4gICAgICAgICAgICAvLyBVcGRhdGUgdGhlIHJlbG9hZGFibGVXZWFwb24gdXNlc1xuICAgICAgICAgICAgbGV0IHF0eSA9IDA7XG4gICAgICAgICAgICBpZiAoYW1tb0NvdW50c1snRW1wdHknXSA+IDApIHtcbiAgICAgICAgICAgICAgICAvLyBBZGp1c3Qgc3BlbnQgdXNlcyBieSB0aGUgbnVtYmVyIG9mIEVtcHR5IHNsb3RzXG4gICAgICAgICAgICAgICAgcXR5ICs9IGFtbW9Db3VudHNbJ0VtcHR5J107XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhd2FpdCByZWxvYWRhYmxlV2VhcG9uLnVwZGF0ZSh7XG4gICAgICAgICAgICAgICAgJ3N5c3RlbS51c2VzLnNwZW50JzogcXR5LFxuICAgICAgICAgICAgICAgICdzeXN0ZW0udXNlcy52YWx1ZSc6IHJlbG9hZGFibGVXZWFwb24uc3lzdGVtLnVzZXMubWF4IC0gcXR5LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBhd2FpdCByZWxvYWRhYmxlV2VhcG9uLnNldEZsYWcoXG4gICAgICAgICAgICAgICAgdGhpcy5tb2R1bGVNYW5hZ2VyLmlkLFxuICAgICAgICAgICAgICAgICdjaGFtYmVyZWQnLFxuICAgICAgICAgICAgICAgIGxvYWRvdXRcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBhd2FpdCByZWxvYWRhYmxlV2VhcG9uLnNldEZsYWcoXG4gICAgICAgICAgICAgICAgdGhpcy5tb2R1bGVNYW5hZ2VyLmlkLFxuICAgICAgICAgICAgICAgICdmaXJlZCcsXG4gICAgICAgICAgICAgICAgbmV3IEFycmF5KHRoaXMud2VhcG9uLnN5c3RlbS51c2VzLm1heCkuZmlsbCgnRW1wdHknKVxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgY29uc3QgaHRtbFRlbXBsYXRlID0gYXdhaXQgKFxuICAgICAgICAgICAgICAgIGZvdW5kcnkuYXBwbGljYXRpb25zIGFzIGFueVxuICAgICAgICAgICAgKS5oYW5kbGViYXJzLnJlbmRlclRlbXBsYXRlKFxuICAgICAgICAgICAgICAgICdtb2R1bGVzL2Z2dHQtd2VhcG9uLXJlbG9hZC90ZW1wbGF0ZXMvcmVsb2FkYWJsZVdlYXBvblJlbG9hZFRlbXBsYXRlLmhicycsXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBpdGVtOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbWc6IHJlbG9hZGFibGVXZWFwb24uaW1nLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogcmVsb2FkYWJsZVdlYXBvbi5uYW1lLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBmbGF2b3I6IHRoaXMudHJhbnNsYXRlKFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVsb2FkQ2FuY2VsZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA/ICdXRUFQT05fUkVMT0FELkZlYXR1cmVzLlJlbG9hZC5XZWFwb24uV2VhcG9uUmVsb2FkZWRDaGF0Rmxhdm9yQ2FuY2VsZWQnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiAnV0VBUE9OX1JFTE9BRC5GZWF0dXJlcy5SZWxvYWQuV2VhcG9uLldlYXBvblJlbG9hZGVkQ2hhdEZsYXZvcidcbiAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IHRoaXMudHJhbnNsYXRlKFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVsb2FkQ2FuY2VsZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA/ICdXRUFQT05fUkVMT0FELkZlYXR1cmVzLlJlbG9hZC5XZWFwb24uV2VhcG9uUmVsb2FkZWRDaGF0TXNnQ2FuY2VsZWQnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiAnV0VBUE9OX1JFTE9BRC5GZWF0dXJlcy5SZWxvYWQuV2VhcG9uLldlYXBvblJlbG9hZGVkQ2hhdE1zZycsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHJlbG9hZGFibGVXZWFwb246IHJlbG9hZGFibGVXZWFwb24ubmFtZSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgdHJ1ZVxuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICBsb2Fkb3V0OiBsb2Fkb3V0LFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICAvLyBOb3RpZnkgdGhlIHBlZXBzXG4gICAgICAgICAgICB0aGlzLm1vZHVsZU1hbmFnZXIudWlNYW5hZ2VyLnNlbmRDaGF0KHRoaXMuY2hhcmFjdGVyLCBodG1sVGVtcGxhdGUpO1xuICAgICAgICAgICAgdGhpcy5jaGFyYWN0ZXJJZCA9ICcnO1xuICAgICAgICAgICAgdGhpcy53ZWFwb25JZCA9ICcnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYXdhaXQgdGhpcy53ZWFwb25SZWxvYWQoZmFsc2UpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICByZW1vdmVMb2Fkb3V0KGNvdW50czogeyBba2V5OiBzdHJpbmddOiBudW1iZXIgfSk6IGJvb2xlYW4ge1xuICAgICAgICBsZXQgYW1tdW5pdGlvbkF2YWlsYWJsZSA9IHRydWU7XG4gICAgICAgIGNvbnN0IGludmVudG9yeUFtbXVuaXRpb24gPSB0aGlzLmFtbXVuaXRpb24oXG4gICAgICAgICAgICB0aGlzLmNoYXJhY3Rlcj8uaXRlbXNcbiAgICAgICAgKSBhcyBEbmRJdGVtNWVbXTtcbiAgICAgICAgaW52ZW50b3J5QW1tdW5pdGlvbi5mb3JFYWNoKChhbW1vOiBEbmRJdGVtNWUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5hbWUgPSBhbW1vLm5hbWU7XG4gICAgICAgICAgICBjb25zdCBxdHkgPSBhbW1vLnN5c3RlbS5xdWFudGl0eSAtIGNvdW50c1tuYW1lXTtcblxuICAgICAgICAgICAgLy8gSWYgYW55IGJ1bGxldCBpcyBhZGRlZCBiZXlvbmQgdGhlIHF1YW50aXR5IHRoZSBwbGF5ZXIgYWN0dWFsbHkgaGFzIHRoZW4gdGhyb3cgYW4gZXJyb3IgYW5kIHJldHVybiBmYWxzZVxuICAgICAgICAgICAgaWYgKHF0eSA8IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1vZHVsZU1hbmFnZXIudWlNYW5hZ2VyLnVpTm90aWZpY2F0aW9uKFxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRyYW5zbGF0ZShcbiAgICAgICAgICAgICAgICAgICAgICAgICdXRUFQT05fUkVMT0FELkZlYXR1cmVzLlJlbG9hZC5XZWFwb24uTG9hZGluZ0Vycm9yTXNnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgbmFtZTogYW1tby5uYW1lIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgICdlcnJvcidcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGFtbXVuaXRpb25BdmFpbGFibGUgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKGFtbXVuaXRpb25BdmFpbGFibGUpIHtcbiAgICAgICAgICAgIGludmVudG9yeUFtbXVuaXRpb24uZm9yRWFjaChhc3luYyAoYW1tbzogRG5kSXRlbTVlKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgbmFtZSA9IGFtbW8ubmFtZTtcbiAgICAgICAgICAgICAgICBpZiAoY291bnRzW25hbWVdKSB7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IGFtbW8udXBkYXRlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICdzeXN0ZW0ucXVhbnRpdHknOiBhbW1vLnN5c3RlbS5xdWFudGl0eSAtIGNvdW50c1tuYW1lXSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYW1tdW5pdGlvbkF2YWlsYWJsZTtcbiAgICB9XG5cbiAgICBhc3luYyBvblJlbG9hZENhbGxiYWNrKGFjdG9yOiBBY3RvcjVlLCB3ZWFwb246IERuZEl0ZW01ZSkge1xuICAgICAgICB0aGlzLmNoYXJhY3RlcklkID0gYWN0b3IuaWQ7XG4gICAgICAgIHRoaXMud2VhcG9uSWQgPSB3ZWFwb24uaWQ7XG5cbiAgICAgICAgdGhpcy53ZWFwb25SZWxvYWQoKTtcbiAgICB9XG5cbiAgICBnZXRMb2Fkb3V0Q291bnRzKGN1cnJlbnRMb2Fkb3V0OiBzdHJpbmdbXSk6IHtcbiAgICAgICAgW2tleTogc3RyaW5nXTogbnVtYmVyO1xuICAgIH0ge1xuICAgICAgICBjb25zdCBsb2Fkb3V0OiB7IFtrZXk6IHN0cmluZ106IG51bWJlciB9ID0ge307XG4gICAgICAgIGN1cnJlbnRMb2Fkb3V0LmZvckVhY2goKGFtbW86IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgaWYgKCFsb2Fkb3V0W2FtbW9dKSBsb2Fkb3V0W2FtbW9dID0gMDtcbiAgICAgICAgICAgIGxvYWRvdXRbYW1tb10gPSBsb2Fkb3V0W2FtbW9dICsgMTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBsb2Fkb3V0O1xuICAgIH1cblxuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gJ2NsYXNzIFJlbG9hZEZlYXR1cmUnO1xuICAgIH1cbn1cbiIsImltcG9ydCBGZWF0dXJlTWFuYWdlciBmcm9tICcuLi9tYW5hZ2Vycy9GZWF0dXJlTWFuYWdlcic7XG5pbXBvcnQgQmFzZUZlYXR1cmUgZnJvbSAnLi9CYXNlRmVhdHVyZSc7XG5cbmltcG9ydCB7XG4gICAgQWN0aXZpdHlDYXJkQ2hhdFR5cGUsXG4gICAgQ2hhdE1lc3NhZ2U1ZSxcbiAgICBEbmRJdGVtNWUsXG4gICAgRG5kRDIwUm9sbCxcbiAgICBEbmRBdHRhY2tFdmVudCxcbn0gZnJvbSAnLi4vdHlwZXMnO1xuXG5leHBvcnQgY2xhc3MgUmVsb2FkYWJsZVdlYXBvbkF0dGFja0ZlYXR1cmUgZXh0ZW5kcyBCYXNlRmVhdHVyZSB7XG4gICAgcHJpdmF0ZSBfbmV4dFJvdW5kOiB7XG4gICAgICAgIGlkOiBzdHJpbmc7XG4gICAgICAgIHR5cGU6IHN0cmluZztcbiAgICB9O1xuICAgIHByaXZhdGUgX2hvb2tJZDogbnVtYmVyO1xuXG4gICAgY29uc3RydWN0b3IoZmVhdHVyZU1hbmFnZXI6IEZlYXR1cmVNYW5hZ2VyKSB7XG4gICAgICAgIHN1cGVyKGZlYXR1cmVNYW5hZ2VyKTtcbiAgICAgICAgdGhpcy5fbmV4dFJvdW5kID0geyBpZDogJycsIHR5cGU6ICcnIH07XG4gICAgICAgIHRoaXMuX2hvb2tJZCA9IC0xO1xuICAgIH1cblxuICAgIGluaXQoKSB7XG4gICAgICAgIEhvb2tzLm9uKCdkbmQ1ZS5wb3N0Um9sbENvbmZpZ3VyYXRpb24nLCB0aGlzLm9uVXNlQWN0aXZpdHkuYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgb25Vc2VBY3Rpdml0eShkMjBSb2xsOiBEbmREMjBSb2xsW10sIGV2ZW50OiBEbmRBdHRhY2tFdmVudCkge1xuICAgICAgICBjb25zdCByb2xsID0gZDIwUm9sbFswXTtcbiAgICAgICAgY29uc3Qgd2VhcG9uRGF0YSA9IHJvbGw/LmRhdGE/Lml0ZW07XG4gICAgICAgIGlmICh3ZWFwb25EYXRhPy50eXBlPy5iYXNlSXRlbSAhPT0gJ3JlbG9hZGFibGVXZWFwb24nKSByZXR1cm47XG5cbiAgICAgICAgY29uc29sZS5sb2coJ1dlYXBvbiBSZWxvYWQgfCBUcmlnZ2VyZWQgQXR0YWNrJyk7XG4gICAgICAgIHRoaXMud2VhcG9uSWQgPSBldmVudC5zdWJqZWN0Lml0ZW0uaWQ7XG4gICAgICAgIHRoaXMuY2hhcmFjdGVySWQgPSBldmVudC5zdWJqZWN0LmFjdG9yLmlkO1xuXG4gICAgICAgIHJldHVybiB0aGlzLnJlbG9hZGFibGVXZWFwb25BdHRhY2soKTtcbiAgICB9XG5cbiAgICByZWxvYWRhYmxlV2VhcG9uQXR0YWNrKCkge1xuICAgICAgICBjb25zdCBidWxsZXQgPSB0aGlzLmdldE5leHRSb3VuZCgpO1xuXG4gICAgICAgIGlmIChidWxsZXQubmFtZSA9PSAnRW1wdHknKSB7XG4gICAgICAgICAgICB0aGlzLmRyeWZpcmVXZWFwb24oKTtcblxuICAgICAgICAgICAgLy8gU3RvcCB0aGUgYXR0YWNrIGlmIERyeSBmaXJpbmcgdGhlIHdlYXBvbiBhbmQgdGhlcmUgYXJlIG5vIG90aGVyIGJ1bGxldHMgbGVmdFxuICAgICAgICAgICAgaWYgKHRoaXMud2VhcG9uLnN5c3RlbS51c2VzLnNwZW50ID09IHRoaXMud2VhcG9uLnN5c3RlbS51c2VzLm1heCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChidWxsZXQubmFtZSAhPT0gJ0VtcHR5Jykge1xuICAgICAgICAgICAgdGhpcy5fbmV4dFJvdW5kID0ge1xuICAgICAgICAgICAgICAgIGlkOiBidWxsZXQuaWQsXG4gICAgICAgICAgICAgICAgdHlwZTogYnVsbGV0LnR5cGUsXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB0aGlzLl9ob29rSWQgPSBIb29rcy5vbihcbiAgICAgICAgICAgICAgICAnZG5kNWUucmVuZGVyQ2hhdE1lc3NhZ2UnLFxuICAgICAgICAgICAgICAgIHRoaXMub25SZW5kZXJDaGF0TWVzc2FnZS5iaW5kKHRoaXMpXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZmlyZVJvdW5kKGJ1bGxldCk7XG4gICAgfVxuXG4gICAgYXN5bmMgb25SZW5kZXJDaGF0TWVzc2FnZShtZXNzYWdlOiBDaGF0TWVzc2FnZTVlLCBodG1sOiBIVE1MRWxlbWVudCkge1xuICAgICAgICBjb25zdCBpdGVtSWQgPSBtZXNzYWdlLmZsYWdzLmRuZDVlPy5pdGVtLmlkO1xuICAgICAgICBjb25zdCBpdGVtVHlwZSA9IG1lc3NhZ2UuZmxhZ3MuZG5kNWU/Lml0ZW0udHlwZTtcbiAgICAgICAgaWYgKFxuICAgICAgICAgICAgdGhpcy5fbmV4dFJvdW5kLmlkID09PSBpdGVtSWQgJiZcbiAgICAgICAgICAgIHRoaXMuX25leHRSb3VuZC50eXBlID09PSBpdGVtVHlwZVxuICAgICAgICApIHtcbiAgICAgICAgICAgIEhvb2tzLm9mZignZG5kNWUucmVuZGVyQ2hhdE1lc3NhZ2UnLCB0aGlzLl9ob29rSWQpO1xuICAgICAgICAgICAgdGhpcy5fbmV4dFJvdW5kID0geyBpZDogJycsIHR5cGU6ICcnIH07XG5cbiAgICAgICAgICAgIGNvbnN0IGJ1bGxldCA9IHRoaXMuY2hhcmFjdGVyLml0ZW1zLmdldChpdGVtSWQpIGFzIERuZEl0ZW01ZTtcblxuICAgICAgICAgICAgY29uc3QgYWN0aXZhdGlvbkNhcmQgPSBodG1sLnF1ZXJ5U2VsZWN0b3IoJy5hY3RpdmF0aW9uLWNhcmQnKTtcbiAgICAgICAgICAgIGNvbnN0IGl0ZW1jYXJkID0gaHRtbC5xdWVyeVNlbGVjdG9yKCcuaXRlbS1jYXJkJyk7XG4gICAgICAgICAgICBjb25zdCBwYXJlbnRFbGVtZW50ID0gYWN0aXZhdGlvbkNhcmQgfHwgaXRlbWNhcmQ7XG5cbiAgICAgICAgICAgIC8vIEdyYWIgbW9kdWxlIGNvbmZpZ3VyYXRpb25zXG4gICAgICAgICAgICBjb25zdCBjaGVja1Vuc3RhYmxlQW1tbyA9IGdhbWUuc2V0dGluZ3MuZ2V0KFxuICAgICAgICAgICAgICAgIHRoaXMubW9kdWxlTWFuYWdlci5pZCxcbiAgICAgICAgICAgICAgICAndW5zdGFibGVBbW1vJ1xuICAgICAgICAgICAgKSBhcyBib29sZWFuO1xuXG4gICAgICAgICAgICBjb25zdCBjaGVja01pc2ZpcmUgPSBnYW1lLnNldHRpbmdzLmdldChcbiAgICAgICAgICAgICAgICB0aGlzLm1vZHVsZU1hbmFnZXIuaWQsXG4gICAgICAgICAgICAgICAgJ3VzZU1pc2ZpcmVzJ1xuICAgICAgICAgICAgKSBhcyBib29sZWFuO1xuXG4gICAgICAgICAgICBjb25zdCB1bnN0YWJsZUFtbW9GYWlsdXJlVGhyZXNob2xkID0gZ2FtZS5zZXR0aW5ncy5nZXQoXG4gICAgICAgICAgICAgICAgdGhpcy5tb2R1bGVNYW5hZ2VyLmlkLFxuICAgICAgICAgICAgICAgICd1bnN0YWJsZUFtbW9GYWlsdXJlVGhyZXNoaG9sZCdcbiAgICAgICAgICAgICkgYXMgbnVtYmVyO1xuXG4gICAgICAgICAgICAvLyBBZGQgdGhlIG1pc2ZpcmUgbWVzc2FnZVxuICAgICAgICAgICAgaWYgKGNoZWNrTWlzZmlyZSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNyaXRpY2FsRmFpbHVyZU1zZyA9XG4gICAgICAgICAgICAgICAgICAgIGNoZWNrVW5zdGFibGVBbW1vICYmXG4gICAgICAgICAgICAgICAgICAgIGJ1bGxldD8uc3lzdGVtLnByb3BlcnRpZXMuZmluZCgocHJvcDogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcHJvcCA9PT0gJ3Vuc3RhYmxlJztcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgID8gdGhpcy50cmFuc2xhdGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnV0VBUE9OX1JFTE9BRC5GZWF0dXJlcy5SZWxvYWRhYmxlV2VhcG9uQXR0YWNrLk1pc2ZpcmVVbnN0YWJsZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IGZhaWx1cmU6IGAke3Vuc3RhYmxlQW1tb0ZhaWx1cmVUaHJlc2hvbGR9YCB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICA6IHRoaXMudHJhbnNsYXRlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1dFQVBPTl9SRUxPQUQuRmVhdHVyZXMuUmVsb2FkYWJsZVdlYXBvbkF0dGFjay5NaXNmaXJlTmF0T25lJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgY2FyZENvbnRlbnRFbGVtZW50ID1cbiAgICAgICAgICAgICAgICAgICAgcGFyZW50RWxlbWVudD8ucXVlcnlTZWxlY3RvcignLmNhcmQtY29udGVudCcpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHdyYXBwZXJFbGVtZW50ID1cbiAgICAgICAgICAgICAgICAgICAgY2FyZENvbnRlbnRFbGVtZW50Py5xdWVyeVNlbGVjdG9yKCcud3JhcHBlcicpO1xuICAgICAgICAgICAgICAgIHdyYXBwZXJFbGVtZW50Py5pbnNlcnRBZGphY2VudEhUTUwoXG4gICAgICAgICAgICAgICAgICAgICdiZWZvcmVlbmQnLFxuICAgICAgICAgICAgICAgICAgICBgPHA+JHtjcml0aWNhbEZhaWx1cmVNc2d9PC9wPmBcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBBZGQgY2FyZCBidXR0b24gY29udGFpbmVyIGlmIG1pc3NpbmdcbiAgICAgICAgICAgIGlmIChpdGVtY2FyZCAmJiAhYWN0aXZhdGlvbkNhcmQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCByZWZlcmVuY2VFbGVtZW50ID1cbiAgICAgICAgICAgICAgICAgICAgcGFyZW50RWxlbWVudD8ucXVlcnlTZWxlY3RvcignLmNhcmQtaGVhZGVyJyk7XG4gICAgICAgICAgICAgICAgY29uc3QgYnV0dG9uQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICAgICAgYnV0dG9uQ29udGFpbmVyLmNsYXNzTmFtZSA9ICdjYXJkLWJ1dHRvbnMnO1xuICAgICAgICAgICAgICAgIHJlZmVyZW5jZUVsZW1lbnQ/LmFmdGVyKGJ1dHRvbkNvbnRhaW5lcik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IGNhcmRCdXR0b25zRWxlbWVudCA9XG4gICAgICAgICAgICAgICAgcGFyZW50RWxlbWVudD8ucXVlcnlTZWxlY3RvcignLmNhcmQtYnV0dG9ucycpO1xuXG4gICAgICAgICAgICAvLyBBZGQgTWlzZmlyZSBidXR0b25cbiAgICAgICAgICAgIGlmIChjaGVja01pc2ZpcmUpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBtaXNmaXJlQnRuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAgICAgICAgICAgbWlzZmlyZUJ0bi5vbmNsaWNrID0gdGhpcy5vbkNsaWNrTWlzZmlyZS5iaW5kKHRoaXMpO1xuICAgICAgICAgICAgICAgIG1pc2ZpcmVCdG4uaW5uZXJIVE1MID0gYCR7dGhpcy5tYWtlSWNvbignZmEtYnVyc3QnKX0ke3RoaXMudHJhbnNsYXRlKFxuICAgICAgICAgICAgICAgICAgICAnV0VBUE9OX1JFTE9BRC5GZWF0dXJlcy5SZWxvYWRhYmxlV2VhcG9uQXR0YWNrLk1pc2ZpcmVkQnRuVHh0J1xuICAgICAgICAgICAgICAgICl9YDtcbiAgICAgICAgICAgICAgICBjYXJkQnV0dG9uc0VsZW1lbnQ/LmFwcGVuZChtaXNmaXJlQnRuKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gQWRkIGFtbW8gcmVmdW5kIGJ1dHRvblxuICAgICAgICAgICAgY29uc3QgcmVmdW5kQnRuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAgICAgICByZWZ1bmRCdG4ub25jbGljayA9IHRoaXMub25DbGlja1JlZnVuZC5iaW5kKHRoaXMpO1xuICAgICAgICAgICAgcmVmdW5kQnRuLmlubmVySFRNTCA9IGAke3RoaXMubWFrZUljb24oJ2ZhLXVuZG8nKX0ke3RoaXMudHJhbnNsYXRlKFxuICAgICAgICAgICAgICAgICdXRUFQT05fUkVMT0FELkZlYXR1cmVzLlJlbG9hZGFibGVXZWFwb25BdHRhY2suUmVmdW5kQnRuVHh0J1xuICAgICAgICAgICAgKX1gO1xuICAgICAgICAgICAgY2FyZEJ1dHRvbnNFbGVtZW50Py5hcHBlbmQocmVmdW5kQnRuKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldE5leHRSb3VuZCgpOiBEbmRJdGVtNWUge1xuICAgICAgICBjb25zdCBjaGFyYWN0ZXIgPSB0aGlzLmNoYXJhY3RlcjtcbiAgICAgICAgY29uc3Qgd2VhcG9uID0gdGhpcy53ZWFwb247XG5cbiAgICAgICAgY29uc3QgbG9hZG91dCA9IHRoaXMubG9hZG91dDtcbiAgICAgICAgbG9hZG91dC5wdXNoKCdFbXB0eScpO1xuICAgICAgICBjb25zdCBuZXh0Um91bmQgPSBsb2Fkb3V0LnNoaWZ0KCk7XG5cbiAgICAgICAgLy8gUmVtb3ZlIHRoZSBidWxsZXQgZnJvbSB0aGUgcmVsb2FkYWJsZVdlYXBvbiBhbW11bml0aW9uXG4gICAgICAgIHdlYXBvbi5zZXRGbGFnKHRoaXMubW9kdWxlTWFuYWdlci5pZCwgJ2NoYW1iZXJlZCcsIGxvYWRvdXQpO1xuXG4gICAgICAgIGNvbnN0IGludmVudG9yeUFtbXVuaXRpb24gPSB0aGlzLmFtbXVuaXRpb24oXG4gICAgICAgICAgICBjaGFyYWN0ZXIuaXRlbXNcbiAgICAgICAgKSBhcyBEbmRJdGVtNWVbXTtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIGludmVudG9yeUFtbXVuaXRpb24uZmluZCgoYW1tbzogRG5kSXRlbTVlKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgbmFtZSA9IGFtbW8ubmFtZTtcbiAgICAgICAgICAgICAgICBpZiAobmFtZSA9PSBuZXh0Um91bmQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFtbW87XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfSkgfHwgKHsgbmFtZTogJ0VtcHR5JyB9IGFzIERuZEl0ZW01ZSlcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBkcnlmaXJlV2VhcG9uKCkge1xuICAgICAgICBjb25zdCBjaGFyYWN0ZXIgPSB0aGlzLmNoYXJhY3RlcjtcbiAgICAgICAgY29uc3Qgd2VhcG9uID0gdGhpcy53ZWFwb247XG5cbiAgICAgICAgY29uc3QgcmVuZGVySG9va0lkID0gSG9va3Mub24oXG4gICAgICAgICAgICAncmVuZGVyQ2hhdE1lc3NhZ2UnLFxuICAgICAgICAgICAgKF9jaGF0SXRlbSwgaHRtbCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlbG9hZEJ0biA9IGh0bWxbMF0ucXVlcnlTZWxlY3RvcignLnJlbG9hZC1hbW1vJyk7XG4gICAgICAgICAgICAgICAgcmVsb2FkQnRuPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWxvYWQoY2hhcmFjdGVyLCB3ZWFwb24pO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgaWYgKHJlbG9hZEJ0bikge1xuICAgICAgICAgICAgICAgICAgICBIb29rcy5vZmYoJ3JlbmRlckNoYXRNZXNzYWdlJywgcmVuZGVySG9va0lkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG5cbiAgICAgICAgY29uc3QgdGVtcGxhdGVEYXRhOiBBY3Rpdml0eUNhcmRDaGF0VHlwZSA9IHtcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiB7XG4gICAgICAgICAgICAgICAgY2hhdDogYDxwPiR7dGhpcy50cmFuc2xhdGUoXG4gICAgICAgICAgICAgICAgICAgICdXRUFQT05fUkVMT0FELkZlYXR1cmVzLlJlbG9hZGFibGVXZWFwb25BdHRhY2suRHJ5RmlyZURlc2NyaXB0aW9uJyxcbiAgICAgICAgICAgICAgICAgICAgeyBuYW1lOiBjaGFyYWN0ZXIubmFtZSwgcmVsb2FkYWJsZVdlYXBvbjogd2VhcG9uLm5hbWUgfSxcbiAgICAgICAgICAgICAgICAgICAgdHJ1ZVxuICAgICAgICAgICAgICAgICl9PC9wPmAsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgaXRlbToge1xuICAgICAgICAgICAgICAgIGltZzogd2VhcG9uLmltZyxcbiAgICAgICAgICAgICAgICBuYW1lOiB0aGlzLnRyYW5zbGF0ZShcbiAgICAgICAgICAgICAgICAgICAgJ1dFQVBPTl9SRUxPQUQuRmVhdHVyZXMuUmVsb2FkYWJsZVdlYXBvbkF0dGFjay5EcnlGaXJlVGl0bGUnXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzdWJ0aXRsZTogd2VhcG9uLm5hbWUsXG4gICAgICAgICAgICBidXR0b25zOiBbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBkYXRhc2V0OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2aXNpYmlsaXR5OiAnYWxsJyxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgaWNvbjogdGhpcy5tYWtlSWNvbignZmEtcm90YXRlLXJpZ2h0JyksXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiB0aGlzLnRyYW5zbGF0ZSgnV0VBUE9OX1JFTE9BRC5GZWF0dXJlcy5SZWxvYWQuVGV4dCcpLFxuICAgICAgICAgICAgICAgICAgICBjbGFzc2VzOiAncmVsb2FkLWFtbW8nLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBdLFxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMucmVuZGVyQ2FyZCh0ZW1wbGF0ZURhdGEsIGNoYXJhY3Rlcik7XG4gICAgfVxuXG4gICAgYXN5bmMgcmVuZGVyQ2FyZCh0ZW1wbGF0ZURhdGE6IEFjdGl2aXR5Q2FyZENoYXRUeXBlLCBjaGFyYWN0ZXI6IEFjdG9yNWUpIHtcbiAgICAgICAgY29uc3QgaHRtbFRlbXBsYXRlID0gYXdhaXQgKFxuICAgICAgICAgICAgZm91bmRyeS5hcHBsaWNhdGlvbnMgYXMgYW55XG4gICAgICAgICkuaGFuZGxlYmFycy5yZW5kZXJUZW1wbGF0ZShcbiAgICAgICAgICAgICdtb2R1bGVzL2Z2dHQtd2VhcG9uLXJlbG9hZC90ZW1wbGF0ZXMvYWN0aXZpdHktY2FyZC5oYnMnLFxuICAgICAgICAgICAgdGVtcGxhdGVEYXRhXG4gICAgICAgICk7XG4gICAgICAgIHRoaXMubW9kdWxlTWFuYWdlci51aU1hbmFnZXIuc2VuZENoYXQoY2hhcmFjdGVyLCBodG1sVGVtcGxhdGUpO1xuICAgIH1cblxuICAgIGZpcmVSb3VuZChidWxsZXQ6IERuZEl0ZW01ZSkge1xuICAgICAgICBjb25zdCByZWxvYWRhYmxlV2VhcG9uID0gdGhpcy53ZWFwb247XG4gICAgICAgIGNvbnN0IG1heFNob3RzID0gcmVsb2FkYWJsZVdlYXBvbi5zeXN0ZW0udXNlcy5tYXg7XG4gICAgICAgIGNvbnN0IGZpcmVkTG9hZG91dCA9XG4gICAgICAgICAgICAocmVsb2FkYWJsZVdlYXBvbi5nZXRGbGFnKFxuICAgICAgICAgICAgICAgIHRoaXMubW9kdWxlTWFuYWdlci5pZCxcbiAgICAgICAgICAgICAgICAnZmlyZWQnXG4gICAgICAgICAgICApIGFzIHN0cmluZ1tdKSB8fCBuZXcgQXJyYXkobWF4U2hvdHMpLmZpbGwoJ0VtcHR5Jyk7XG5cbiAgICAgICAgZmlyZWRMb2Fkb3V0LnVuc2hpZnQoYnVsbGV0Lm5hbWUpO1xuICAgICAgICBmaXJlZExvYWRvdXQuc3BsaWNlKC0xKTtcbiAgICAgICAgcmVsb2FkYWJsZVdlYXBvbi5zZXRGbGFnKHRoaXMubW9kdWxlTWFuYWdlci5pZCwgJ2ZpcmVkJywgZmlyZWRMb2Fkb3V0KTtcblxuICAgICAgICBjb25zdCB1c2VzID0gcmVsb2FkYWJsZVdlYXBvbi5zeXN0ZW0udXNlcztcbiAgICAgICAgY29uc3QgcXR5OiBudW1iZXIgPVxuICAgICAgICAgICAgdXNlcy5zcGVudCArIDEgPD0gdXNlcy5tYXggPyB1c2VzLnNwZW50ICsgMSA6IHVzZXMubWF4O1xuXG4gICAgICAgIHJlbG9hZGFibGVXZWFwb24udXBkYXRlKHtcbiAgICAgICAgICAgICdzeXN0ZW0udXNlcy5zcGVudCc6IHF0eSxcbiAgICAgICAgICAgICdzeXN0ZW0udXNlcy52YWx1ZSc6IHVzZXMubWF4IC0gcXR5LFxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoYnVsbGV0Lm5hbWUgIT09ICdFbXB0eScpIHtcbiAgICAgICAgICAgIGJ1bGxldC51c2UoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICByZWxvYWQoYWN0b3I6IEFjdG9yNWUsIHJlbG9hZGFibGVXZWFwb246IERuZEl0ZW01ZSkge1xuICAgICAgICB0aGlzLmZlYXR1cmVNYW5hZ2VyXG4gICAgICAgICAgICAuZ2V0RmVhdHVyZSgncmVsb2FkJylcbiAgICAgICAgICAgIC5vblJlbG9hZENhbGxiYWNrKGFjdG9yLCByZWxvYWRhYmxlV2VhcG9uKTtcbiAgICB9XG5cbiAgICBhc3luYyBvbkNsaWNrUmVmdW5kKCkge1xuICAgICAgICBjb25zdCBhY3RvciA9IHRoaXMuY2hhcmFjdGVyO1xuICAgICAgICBjb25zdCByZWxvYWRhYmxlV2VhcG9uID0gdGhpcy53ZWFwb247XG4gICAgICAgIGNvbnN0IGludmVudG9yeUFtbXVuaXRpb24gPSB0aGlzLmFtbXVuaXRpb24oYWN0b3IuaXRlbXMpO1xuXG4gICAgICAgIGNvbnN0IGZpcmVkID0gdGhpcy5maXJlZDtcbiAgICAgICAgY29uc3QgcmVmdW5kOiBzdHJpbmcgPSBmaXJlZC5zcGxpY2UoMCwgMSlbMF0gYXMgc3RyaW5nO1xuICAgICAgICBmaXJlZC5wdXNoKCdFbXB0eScpO1xuXG4gICAgICAgIGlmIChyZWZ1bmQgPT0gJ0VtcHR5Jykge1xuICAgICAgICAgICAgLy8gTm90aWZ5IHRoZSB1c2VyIHRoYXQgdGhlcmUgaXMgbm8gYW1tdW5pdGlvbiB0byByZWZ1bmRcbiAgICAgICAgICAgIHRoaXMubW9kdWxlTWFuYWdlci51aU1hbmFnZXIudWlOb3RpZmljYXRpb24oXG4gICAgICAgICAgICAgICAgdGhpcy50cmFuc2xhdGUoXG4gICAgICAgICAgICAgICAgICAgICdXRUFQT05fUkVMT0FELkZlYXR1cmVzLlJlbG9hZGFibGVXZWFwb25BdHRhY2suUmVmdW5kLlJlZnVuZE5vTW9yZU1zZycsXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGFjdG9yLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICByZWxvYWRhYmxlV2VhcG9uOiByZWxvYWRhYmxlV2VhcG9uLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHRydWVcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICd3YXJuJ1xuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGF3YWl0IHJlbG9hZGFibGVXZWFwb24uc2V0RmxhZyh0aGlzLm1vZHVsZU1hbmFnZXIuaWQsICdmaXJlZCcsIGZpcmVkKTtcblxuICAgICAgICBsZXQgYnVsbGV0ID0geyBuYW1lOiByZWZ1bmQgfSBhcyBEbmRJdGVtNWU7XG4gICAgICAgIGludmVudG9yeUFtbXVuaXRpb24uZm9yRWFjaCgoYW1tbzogSXRlbTVlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBuYW1lID0gYW1tby5uYW1lO1xuICAgICAgICAgICAgaWYgKG5hbWUgPT0gcmVmdW5kKSB7XG4gICAgICAgICAgICAgICAgYnVsbGV0ID0gYW1tbyBhcyBEbmRJdGVtNWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIFJlZnVuZCB0aGUgbm9uLUVtcHR5IGFtbXVuaXRpb25cbiAgICAgICAgY29uc3QgYW1tb0xvYWRvdXQgPSB0aGlzLmxvYWRvdXQ7XG4gICAgICAgIGFtbW9Mb2Fkb3V0LnVuc2hpZnQocmVmdW5kKTtcbiAgICAgICAgYW1tb0xvYWRvdXQuc3BsaWNlKC0xKTtcbiAgICAgICAgYXdhaXQgcmVsb2FkYWJsZVdlYXBvbi5zZXRGbGFnKFxuICAgICAgICAgICAgdGhpcy5tb2R1bGVNYW5hZ2VyLmlkLFxuICAgICAgICAgICAgJ2NoYW1iZXJlZCcsXG4gICAgICAgICAgICBhbW1vTG9hZG91dFxuICAgICAgICApO1xuXG4gICAgICAgIC8vIFVwZGF0ZSB0aGUgcmVsb2FkYWJsZVdlYXBvbiB1c2VzXG4gICAgICAgIGNvbnN0IHVzZXMgPSByZWxvYWRhYmxlV2VhcG9uLnN5c3RlbS51c2VzO1xuICAgICAgICBjb25zdCBxdHk6IG51bWJlciA9IHVzZXMuc3BlbnQgLSAxID49IDAgPyB1c2VzLnNwZW50IC0gMSA6IDA7XG4gICAgICAgIHJlbG9hZGFibGVXZWFwb24udXBkYXRlKHtcbiAgICAgICAgICAgICdzeXN0ZW0udXNlcy5zcGVudCc6IHF0eSxcbiAgICAgICAgICAgICdzeXN0ZW0udXNlcy52YWx1ZSc6IHVzZXMubWF4IC0gcXR5LFxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBOb3RpZnkgdGhlIHVzZXIgdGhhdCB0aGUgcmVmdW5kIHdhcyBhIHN1Y2Nlc3NcbiAgICAgICAgY29uc3QgaHRtbFRlbXBsYXRlID0gYXdhaXQgKFxuICAgICAgICAgICAgZm91bmRyeS5hcHBsaWNhdGlvbnMgYXMgYW55XG4gICAgICAgICkuaGFuZGxlYmFycy5yZW5kZXJUZW1wbGF0ZShcbiAgICAgICAgICAgICdtb2R1bGVzL2Z2dHQtd2VhcG9uLXJlbG9hZC90ZW1wbGF0ZXMvYW1tb1JlZnVuZE5vdGljZVRlbXBsYXRlLmhicycsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaXRlbToge1xuICAgICAgICAgICAgICAgICAgICBpbWc6IGJ1bGxldC5pbWcsXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IGJ1bGxldC5uYW1lLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IHRoaXMudHJhbnNsYXRlKFxuICAgICAgICAgICAgICAgICAgICAnV0VBUE9OX1JFTE9BRC5GZWF0dXJlcy5SZWxvYWRhYmxlV2VhcG9uQXR0YWNrLlJlZnVuZC5SZWZ1bmRDb21wbGV0ZU1zZycsXG4gICAgICAgICAgICAgICAgICAgIHsgYnVsbGV0OiByZWZ1bmQsIG5hbWU6IHJlbG9hZGFibGVXZWFwb24ubmFtZSB9LFxuICAgICAgICAgICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICB0aXRsZTogdGhpcy50cmFuc2xhdGUoXG4gICAgICAgICAgICAgICAgICAgICdXRUFQT05fUkVMT0FELkZlYXR1cmVzLlJlbG9hZGFibGVXZWFwb25BdHRhY2suUmVmdW5kLlJlZnVuZENvbXBsZXRlVGl0bGUnXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy5tb2R1bGVNYW5hZ2VyLnVpTWFuYWdlci5zZW5kQ2hhdChhY3RvciwgaHRtbFRlbXBsYXRlKTtcbiAgICB9XG5cbiAgICBhc3luYyBvbkNsaWNrTWlzZmlyZSgpIHtcbiAgICAgICAgY29uc3QgYWN0b3IgPSB0aGlzLmNoYXJhY3RlcjtcbiAgICAgICAgY29uc3Qgcm9sbCA9IGF3YWl0IG5ldyBSb2xsKCcxZDYnKS5yb2xsKCk7XG4gICAgICAgIGF3YWl0IHJvbGwudG9NZXNzYWdlKHtcbiAgICAgICAgICAgIHNwZWFrZXI6IHtcbiAgICAgICAgICAgICAgICBhbGlhczogYWN0b3IubmFtZSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIG1ha2VJY29uKGljb246IHN0cmluZykge1xuICAgICAgICByZXR1cm4gYDxpIGNsYXNzPVwiZmFzICR7aWNvbn1cIj48L2k+YDtcbiAgICB9XG5cbiAgICB0b1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuICdjbGFzcyBSZWxvYWRhYmxlV2VhcG9uQXR0YWNrRmVhdHVyZSc7XG4gICAgfVxufVxuIiwiaW1wb3J0IEZlYXR1cmVNYW5hZ2VyIGZyb20gJy4uL21hbmFnZXJzL0ZlYXR1cmVNYW5hZ2VyJztcbmltcG9ydCBCYXNlRmVhdHVyZSBmcm9tICcuL0Jhc2VGZWF0dXJlJztcbmltcG9ydCB7IERuZEl0ZW01ZSB9IGZyb20gJy4uL3R5cGVzJztcblxuZXhwb3J0IGNsYXNzIFJlbG9hZGFibGVXZWFwb25DcmVhdGlvbkZlYXR1cmUgZXh0ZW5kcyBCYXNlRmVhdHVyZSB7XG4gICAgcHJpdmF0ZSBfY3JlYXRpbmdSZWxvYWRhYmxlV2VhcG9uOiBib29sZWFuO1xuICAgIHByaXZhdGUgX2NyZWF0ZUl0ZW1Ib29rSWQ6IG51bWJlcjtcblxuICAgIGNvbnN0cnVjdG9yKGZlYXR1cmVNYW5hZ2VyOiBGZWF0dXJlTWFuYWdlcikge1xuICAgICAgICBzdXBlcihmZWF0dXJlTWFuYWdlcik7XG4gICAgICAgIHRoaXMuX2NyZWF0aW5nUmVsb2FkYWJsZVdlYXBvbiA9IGZhbHNlO1xuICAgICAgICB0aGlzLl9jcmVhdGVJdGVtSG9va0lkID0gLTE7XG4gICAgfVxuXG4gICAgaW5pdCgpIHtcbiAgICAgICAgSG9va3Mub24oJ3ByZUNyZWF0ZUl0ZW0nLCB0aGlzLm9uUHJlQ3JlYXRlSXRlbS5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICBhc3luYyBvblByZUNyZWF0ZUl0ZW0oaXRlbTogRG5kSXRlbTVlKSB7XG4gICAgICAgIGlmIChpdGVtLnN5c3RlbS50eXBlLmJhc2VJdGVtID09ICdyZWxvYWRhYmxlV2VhcG9uJykge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1dlYXBvbiBSZWxvYWQgfCBUcmlnZ2VyZWQgUHJlLUNyZWF0aW9uJyk7XG5cbiAgICAgICAgICAgIHRoaXMud2VhcG9uSWQgPSBpdGVtLmlkO1xuICAgICAgICAgICAgdGhpcy5jaGFyYWN0ZXJJZCA9IGl0ZW0uYWN0b3I/LmlkIGFzIHN0cmluZztcbiAgICAgICAgICAgIHRoaXMuX2NyZWF0aW5nUmVsb2FkYWJsZVdlYXBvbiA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLl9jcmVhdGVJdGVtSG9va0lkID0gSG9va3Mub24oXG4gICAgICAgICAgICAgICAgJ2NyZWF0ZUl0ZW0nLFxuICAgICAgICAgICAgICAgIHRoaXMub25DcmVhdGVJdGVtLmJpbmQodGhpcylcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhc3luYyBvbkNyZWF0ZUl0ZW0oaXRlbTogRG5kSXRlbTVlKSB7XG4gICAgICAgIGlmICghdGhpcy5fY3JlYXRpbmdSZWxvYWRhYmxlV2VhcG9uIHx8IGl0ZW0uaWQgIT09IHRoaXMud2VhcG9uSWQpXG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgY29uc29sZS5sb2coJ1dlYXBvbiBSZWxvYWQgfCBUcmlnZ2VyZWQgUmVsb2FkYWJsZVdlYXBvbiBDcmVhdGlvbicpO1xuXG4gICAgICAgIGNvbnN0IHJlbG9hZGFibGVXZWFwb24gPSB0aGlzLndlYXBvbjtcbiAgICAgICAgY29uc3QgYW1tb1F0eSA9IHJlbG9hZGFibGVXZWFwb24uc3lzdGVtLnVzZXMubWF4O1xuXG4gICAgICAgIGF3YWl0IHJlbG9hZGFibGVXZWFwb24udXBkYXRlKHtcbiAgICAgICAgICAgICdzeXN0ZW0udXNlcy5zcGVudCc6IGFtbW9RdHksXG4gICAgICAgICAgICAnc3lzdGVtLnVzZXMudmFsdWUnOiAwLFxuICAgICAgICB9KTtcbiAgICAgICAgYXdhaXQgcmVsb2FkYWJsZVdlYXBvbi5zZXRGbGFnKFxuICAgICAgICAgICAgdGhpcy5tb2R1bGVNYW5hZ2VyLmlkLFxuICAgICAgICAgICAgJ2NoYW1iZXJlZCcsXG4gICAgICAgICAgICBuZXcgQXJyYXkoYW1tb1F0eSkuZmlsbCgnRW1wdHknKVxuICAgICAgICApO1xuICAgICAgICBhd2FpdCByZWxvYWRhYmxlV2VhcG9uLnNldEZsYWcoXG4gICAgICAgICAgICB0aGlzLm1vZHVsZU1hbmFnZXIuaWQsXG4gICAgICAgICAgICAnZmlyZWQnLFxuICAgICAgICAgICAgbmV3IEFycmF5KGFtbW9RdHkpLmZpbGwoJ0VtcHR5JylcbiAgICAgICAgKTtcblxuICAgICAgICB0aGlzLndlYXBvbklkID0gJyc7XG4gICAgICAgIHRoaXMuY2hhcmFjdGVySWQgPSAnJztcbiAgICAgICAgdGhpcy5fY3JlYXRpbmdSZWxvYWRhYmxlV2VhcG9uID0gZmFsc2U7XG4gICAgICAgIEhvb2tzLm9mZignY3JlYXRlSXRlbScsIHRoaXMuX2NyZWF0ZUl0ZW1Ib29rSWQpO1xuICAgICAgICB0aGlzLl9jcmVhdGVJdGVtSG9va0lkID0gLTE7XG4gICAgfVxuXG4gICAgdG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiAnY2xhc3MgUmVsb2FkYWJsZVdlYXBvbkNyZWF0aW9uRmVhdHVyZSc7XG4gICAgfVxufVxuIiwiZXhwb3J0IHsgTmV4dFJvdW5kRmVhdHVyZSB9IGZyb20gJy4vTmV4dFJvdW5kRmVhdHVyZSc7XG5leHBvcnQgeyBSZWxvYWRhYmxlV2VhcG9uQXR0YWNrRmVhdHVyZSB9IGZyb20gJy4vUmVsb2FkYWJsZVdlYXBvbkF0dGFja0ZlYXR1cmUnO1xuZXhwb3J0IHsgUmVsb2FkYWJsZVdlYXBvbkNyZWF0aW9uRmVhdHVyZSB9IGZyb20gJy4vUmVsb2FkYWJsZVdlYXBvbkNyZWF0aW9uRmVhdHVyZSc7XG5leHBvcnQgeyBSZWxvYWRGZWF0dXJlIH0gZnJvbSAnLi9SZWxvYWRGZWF0dXJlJztcbiIsImltcG9ydCBNb2R1bGVNYW5hZ2VyIGZyb20gJy4vTW9kdWxlTWFuYWdlcic7XG5pbXBvcnQge1xuICAgIE5leHRSb3VuZEZlYXR1cmUsXG4gICAgUmVsb2FkYWJsZVdlYXBvbkF0dGFja0ZlYXR1cmUsXG4gICAgUmVsb2FkYWJsZVdlYXBvbkNyZWF0aW9uRmVhdHVyZSxcbiAgICBSZWxvYWRGZWF0dXJlLFxufSBmcm9tICcuLi9mZWF0dXJlcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEZlYXR1cmVNYW5hZ2VyIHtcbiAgICBwcml2YXRlIF9tb2R1bGVNYW5hZ2VyOiBNb2R1bGVNYW5hZ2VyO1xuICAgIHByaXZhdGUgX2ZlYXR1cmVzOiB7IFtrZXk6IHN0cmluZ106IGFueSB9O1xuXG4gICAgY29uc3RydWN0b3IobW9kdWxlTWFuYWdlcjogTW9kdWxlTWFuYWdlcikge1xuICAgICAgICB0aGlzLl9tb2R1bGVNYW5hZ2VyID0gbW9kdWxlTWFuYWdlcjtcbiAgICAgICAgdGhpcy5fZmVhdHVyZXMgPSB7fTtcbiAgICB9XG5cbiAgICBpbml0KCkge1xuICAgICAgICB0aGlzLl9mZWF0dXJlcyA9IHtcbiAgICAgICAgICAgIG5leHRSb3VuZDogbmV3IE5leHRSb3VuZEZlYXR1cmUodGhpcyksXG4gICAgICAgICAgICByZWxvYWQ6IG5ldyBSZWxvYWRGZWF0dXJlKHRoaXMpLFxuICAgICAgICAgICAgcmVsb2FkYWJsZVdlYXBvbkF0dGFjazogbmV3IFJlbG9hZGFibGVXZWFwb25BdHRhY2tGZWF0dXJlKHRoaXMpLFxuICAgICAgICAgICAgcmVsb2FkYWJsZVdlYXBvbkNyZWF0aW9uOiBuZXcgUmVsb2FkYWJsZVdlYXBvbkNyZWF0aW9uRmVhdHVyZSh0aGlzKSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBnZXRGZWF0dXJlKGlkOiBzdHJpbmcpIHtcbiAgICAgICAgaWYgKHRoaXMuX2ZlYXR1cmVzW2lkXSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2ZlYXR1cmVzW2lkXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBnZXQgbW9kdWxlTWFuYWdlcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX21vZHVsZU1hbmFnZXI7XG4gICAgfVxuXG4gICAgdG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiBgY2xhc3MgRmVhdHVyZU1hbmFnZXI6ICR7dGhpcy5fZmVhdHVyZXMubGVuZ3RofWA7XG4gICAgfVxufVxuIiwiaW1wb3J0IEZlYXR1cmVNYW5hZ2VyIGZyb20gJy4vRmVhdHVyZU1hbmFnZXInO1xuaW1wb3J0IFVpTWFuYWdlciBmcm9tICcuL1VpTWFuYWdlcic7XG5pbXBvcnQgVGVtcGxhdGVNYW5hZ2VyIGZyb20gJy4vVGVtcGxhdGVNYW5hZ2VyJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTW9kdWxlTWFuYWdlciB7XG4gICAgcHJpdmF0ZSBfbW9kdWxlSWQ6IHN0cmluZztcbiAgICBwcml2YXRlIF9mZWF0dXJlTWFuYWdlcjogRmVhdHVyZU1hbmFnZXI7XG4gICAgcHJpdmF0ZSBfdWlNYW5hZ2VyOiBVaU1hbmFnZXI7XG4gICAgcHJpdmF0ZSBfdGVtcGxhdGVNYW5hZ2VyOiBUZW1wbGF0ZU1hbmFnZXI7XG5cbiAgICBjb25zdHJ1Y3RvcihpZDogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuX21vZHVsZUlkID0gaWQ7XG4gICAgICAgIHRoaXMuX2ZlYXR1cmVNYW5hZ2VyID0gbmV3IEZlYXR1cmVNYW5hZ2VyKHRoaXMpO1xuICAgICAgICB0aGlzLl91aU1hbmFnZXIgPSBuZXcgVWlNYW5hZ2VyKHRoaXMpO1xuICAgICAgICB0aGlzLl90ZW1wbGF0ZU1hbmFnZXIgPSBuZXcgVGVtcGxhdGVNYW5hZ2VyKCk7XG4gICAgfVxuXG4gICAgZ2V0IGlkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fbW9kdWxlSWQ7XG4gICAgfVxuXG4gICAgZ2V0IGZlYXR1cmVNYW5hZ2VyKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZmVhdHVyZU1hbmFnZXI7XG4gICAgfVxuXG4gICAgZ2V0IHVpTWFuYWdlcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3VpTWFuYWdlcjtcbiAgICB9XG5cbiAgICBnZXQgdGVtcGxhdGVNYW5hZ2VyKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fdGVtcGxhdGVNYW5hZ2VyO1xuICAgIH1cblxuICAgIGluaXQoKSB7XG4gICAgICAgIHRoaXMuc3lzdGVtT3ZlcnJpZGVzKCk7XG4gICAgICAgIHRoaXMubW9kdWxlQ29uZmlndXJhdGlvbnMoKTtcbiAgICAgICAgdGhpcy5fZmVhdHVyZU1hbmFnZXIuaW5pdCgpO1xuICAgICAgICB0aGlzLl90ZW1wbGF0ZU1hbmFnZXIuaW5pdCgpO1xuICAgIH1cblxuICAgIHN5c3RlbU92ZXJyaWRlcygpIHtcbiAgICAgICAgKENPTkZJRyBhcyBhbnkpLkRORDVFLmZlYXR1cmVUeXBlcy5pdGVtID0ge1xuICAgICAgICAgICAgbGFiZWw6IHRoaXMudWlNYW5hZ2VyLmdldExvY2FsaXplZFR4dCgnV0VBUE9OX1JFTE9BRC5JdGVtRmVhdHVyZScpLFxuICAgICAgICB9O1xuXG4gICAgICAgIChDT05GSUcgYXMgYW55KS5ETkQ1RS5pdGVtUHJvcGVydGllcy5jb25jZWFsYWJsZSA9IHtcbiAgICAgICAgICAgIGxhYmVsOiB0aGlzLnVpTWFuYWdlci5nZXRMb2NhbGl6ZWRUeHQoJ1dFQVBPTl9SRUxPQUQuQ29uY2VhbGFibGUnKSxcbiAgICAgICAgfTtcbiAgICAgICAgKENPTkZJRyBhcyBhbnkpLkRORDVFLnZhbGlkUHJvcGVydGllcy53ZWFwb24uYWRkKCdjb25jZWFsYWJsZScpO1xuXG4gICAgICAgIChDT05GSUcgYXMgYW55KS5ETkQ1RS5pdGVtUHJvcGVydGllcy51bnN0YWJsZSA9IHtcbiAgICAgICAgICAgIGxhYmVsOiB0aGlzLnVpTWFuYWdlci5nZXRMb2NhbGl6ZWRUeHQoJ1dFQVBPTl9SRUxPQUQuVW5zdGFibGUnKSxcbiAgICAgICAgICAgIGlzUGh5c2ljYWw6IHRydWUsXG4gICAgICAgIH07XG5cbiAgICAgICAgKENPTkZJRyBhcyBhbnkpLkRORDVFLndlYXBvbklkcy5yZWxvYWRhYmxlV2VhcG9uID1cbiAgICAgICAgICAgICdDb21wZW5kaXVtLmZ2dHQtd2VhcG9uLXJlbG9hZC5pdGVtLXBhY2suSXRlbS5sRTYwUWFTMXNjdGIzT0FkJztcbiAgICB9XG5cbiAgICBtb2R1bGVDb25maWd1cmF0aW9ucygpIHtcbiAgICAgICAgY29uc3QgbW9kdWxlTmFtZSA9ICdmdnR0LXdlYXBvbi1yZWxvYWQnO1xuXG4gICAgICAgIGdhbWUuc2V0dGluZ3MucmVnaXN0ZXIobW9kdWxlTmFtZSwgJ3Vuc3RhYmxlQW1tbycsIHtcbiAgICAgICAgICAgIHNjb3BlOiAnd29ybGQnLFxuICAgICAgICAgICAgbmFtZTogJ1NFVFRJTkdTLldFQVBPTl9SRUxPQUQuVW5zdGFibGVBbW1vLk5hbWUnLFxuICAgICAgICAgICAgaGludDogJ1NFVFRJTkdTLldFQVBPTl9SRUxPQUQuVW5zdGFibGVBbW1vLkhpbnQnLFxuICAgICAgICAgICAgdHlwZTogQm9vbGVhbixcbiAgICAgICAgICAgIGNvbmZpZzogdHJ1ZSxcbiAgICAgICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGdhbWUuc2V0dGluZ3MucmVnaXN0ZXIobW9kdWxlTmFtZSwgJ3Vuc3RhYmxlQW1tb0ZhaWx1cmVUaHJlc2hob2xkJywge1xuICAgICAgICAgICAgc2NvcGU6ICd3b3JsZCcsXG4gICAgICAgICAgICBuYW1lOiAnU0VUVElOR1MuV0VBUE9OX1JFTE9BRC5VbnN0YWJsZUFtbW9GYWlsdXJlVGhyZXNob2xkLk5hbWUnLFxuICAgICAgICAgICAgaGludDogJ1NFVFRJTkdTLldFQVBPTl9SRUxPQUQuVW5zdGFibGVBbW1vRmFpbHVyZVRocmVzaG9sZC5IaW50JyxcbiAgICAgICAgICAgIHR5cGU6IE51bWJlcixcbiAgICAgICAgICAgIGNvbmZpZzogdHJ1ZSxcbiAgICAgICAgICAgIGRlZmF1bHQ6IDIsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGdhbWUuc2V0dGluZ3MucmVnaXN0ZXIobW9kdWxlTmFtZSwgJ3VzZU1pc2ZpcmVzJywge1xuICAgICAgICAgICAgc2NvcGU6ICd3b3JsZCcsXG4gICAgICAgICAgICBuYW1lOiAnU0VUVElOR1MuV0VBUE9OX1JFTE9BRC5Vc2VNaXNmaXJlcy5OYW1lJyxcbiAgICAgICAgICAgIGhpbnQ6ICdTRVRUSU5HUy5XRUFQT05fUkVMT0FELlVzZU1pc2ZpcmVzLkhpbnQnLFxuICAgICAgICAgICAgdHlwZTogQm9vbGVhbixcbiAgICAgICAgICAgIGNvbmZpZzogdHJ1ZSxcbiAgICAgICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGdhbWUuc2V0dGluZ3MucmVnaXN0ZXIobW9kdWxlTmFtZSwgJ2ZpbHRlckFtbXVuaXRpb25CeUVxdWlwcGVkJywge1xuICAgICAgICAgICAgc2NvcGU6ICd1c2VyJyxcbiAgICAgICAgICAgIG5hbWU6ICdTRVRUSU5HUy5XRUFQT05fUkVMT0FELkZpbHRlckFtbXVuaXRpb25CeUVxdWlwcGVkLk5hbWUnLFxuICAgICAgICAgICAgaGludDogJ1NFVFRJTkdTLldFQVBPTl9SRUxPQUQuRmlsdGVyQW1tdW5pdGlvbkJ5RXF1aXBwZWQuSGludCcsXG4gICAgICAgICAgICB0eXBlOiBCb29sZWFuLFxuICAgICAgICAgICAgY29uZmlnOiB0cnVlLFxuICAgICAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGRlYnVnKGhvb2tzOiBib29sZWFuID0gZmFsc2UpIHtcbiAgICAgICAgQ09ORklHLmRlYnVnLmhvb2tzID0gaG9va3M7XG4gICAgICAgIGNvbnNvbGUubG9nKCdDT05GSUc6ICcsIENPTkZJRyk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdDT05GSUcuRE5ENUU6ICcsIChDT05GSUcgYXMgYW55KS5ETkQ1RSk7XG4gICAgfVxuXG4gICAgdG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiAnY2xhc3MgTW9kdWxlTWFuYWdlcic7XG4gICAgfVxufVxuIiwiZXhwb3J0IGRlZmF1bHQgY2xhc3MgVGVtcGxhdGVNYW5hZ2VyIHtcbiAgICBjb25zdHJ1Y3RvcigpIHt9XG5cbiAgICBpbml0KCkge1xuICAgICAgICAoZm91bmRyeS5hcHBsaWNhdGlvbnMgYXMgYW55KS5oYW5kbGViYXJzLmxvYWRUZW1wbGF0ZXMoXG4gICAgICAgICAgICBUZW1wbGF0ZU1hbmFnZXIucGF0aHNcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgZ2V0IHBhdGhzKCkge1xuICAgICAgICBjb25zdCBwYXRoczogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfSA9IHt9O1xuICAgICAgICBjb25zdCB0ZW1wbGF0ZVBhdGhzID0gJ21vZHVsZXMvZnZ0dC13ZWFwb24tcmVsb2FkL3RlbXBsYXRlcy9yZWxvYWRhYmxlV2VhcG9uUmVsb2FkVGVtcGxhdGUuaGJzLG1vZHVsZXMvZnZ0dC13ZWFwb24tcmVsb2FkL3RlbXBsYXRlcy9iYXNpY01lc3NhZ2UuaGJzLG1vZHVsZXMvZnZ0dC13ZWFwb24tcmVsb2FkL3RlbXBsYXRlcy9hbW1vU2VsZWN0aW9uRGlhbG9nVGVtcGxhdGUuaGJzLG1vZHVsZXMvZnZ0dC13ZWFwb24tcmVsb2FkL3RlbXBsYXRlcy9hbW1vUmVmdW5kTm90aWNlVGVtcGxhdGUuaGJzLG1vZHVsZXMvZnZ0dC13ZWFwb24tcmVsb2FkL3RlbXBsYXRlcy9hY3Rpdml0eS1jYXJkLmhicycuc3BsaXQoJywnKTtcbiAgICAgICAgZm9yIChjb25zdCBwYXRoIG9mIHRlbXBsYXRlUGF0aHMpIHtcbiAgICAgICAgICAgIHBhdGhzW3BhdGgucmVwbGFjZSgnLmhicycsICcuaHRtbCcpXSA9IHBhdGg7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHBhdGhzO1xuICAgIH1cblxuICAgIHN0YXRpYyBvbkhvdFJlbG9hZCgpIHtcbiAgICAgICAgZm9yIChjb25zdCB0ZW1wbGF0ZSBpbiBfdGVtcGxhdGVDYWNoZSkge1xuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChfdGVtcGxhdGVDYWNoZSwgdGVtcGxhdGUpXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICBkZWxldGUgX3RlbXBsYXRlQ2FjaGVbdGVtcGxhdGVdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgKGZvdW5kcnkuYXBwbGljYXRpb25zIGFzIGFueSkuaGFuZGxlYmFyc1xuICAgICAgICAgICAgLmxvYWRUZW1wbGF0ZXModGhpcy5wYXRocylcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGFwcGxpY2F0aW9uIGluIHVpLndpbmRvd3MpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVpLndpbmRvd3MsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwbGljYXRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1aS53aW5kb3dzW2FwcGxpY2F0aW9uXS5yZW5kZXIodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbiAgICB0b1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuICdjbGFzcyBUZW1wbGF0ZU1hbmFnZXInO1xuICAgIH1cbn1cbiIsImltcG9ydCBNb2R1bGVNYW5hZ2VyIGZyb20gJy4vTW9kdWxlTWFuYWdlcic7XG5pbXBvcnQgeyB0eXBlIERpYWxvZ09wdGlvbnMgfSBmcm9tICcuLi90eXBlcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFVpTWFuYWdlciB7XG4gICAgcHJpdmF0ZSBfbW9kdWxlTWFuYWdlcjogTW9kdWxlTWFuYWdlcjtcblxuICAgIGNvbnN0cnVjdG9yKG1vZHVsZU1hbmFnZXI6IE1vZHVsZU1hbmFnZXIpIHtcbiAgICAgICAgdGhpcy5fbW9kdWxlTWFuYWdlciA9IG1vZHVsZU1hbmFnZXI7XG4gICAgfVxuXG4gICAgZ2V0IG1vZHVsZU1hbmFnZXIoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9tb2R1bGVNYW5hZ2VyO1xuICAgIH1cblxuICAgIGJ1aWxkRGlhbG9nKG9wdGlvbnM6IERpYWxvZ09wdGlvbnMsIGlkOiBzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBmb3VuZHJ5LmFwcGxpY2F0aW9ucy5hcGkuRGlhbG9nVjIoe1xuICAgICAgICAgICAgd2luZG93OiB7XG4gICAgICAgICAgICAgICAgdGl0bGU6IG9wdGlvbnMudGl0bGUsXG4gICAgICAgICAgICAgICAgY29udGVudENsYXNzZXM6IG9wdGlvbnMuY29udGVudENsYXNzZXMgfHwgW10sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY29udGVudDogb3B0aW9ucy5jb250ZW50LFxuICAgICAgICAgICAgYnV0dG9uczogb3B0aW9ucy5idXR0b25zLFxuICAgICAgICAgICAgc3VibWl0OiBvcHRpb25zLm9uU3VibWl0LFxuICAgICAgICAgICAgaWQ6IGlkLFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICB1aU5vdGlmaWNhdGlvbihtc2c6IHN0cmluZywgdHlwZTogc3RyaW5nID0gJ2luZm8nKSB7XG4gICAgICAgIGlmICh1aS5ub3RpZmljYXRpb25zKSB7XG4gICAgICAgICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdlcnJvcic6XG4gICAgICAgICAgICAgICAgICAgIHVpLm5vdGlmaWNhdGlvbnMuZXJyb3IobXNnKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnd2Fybic6XG4gICAgICAgICAgICAgICAgICAgIHVpLm5vdGlmaWNhdGlvbnMud2Fybihtc2cpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdpbmZvJzpcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICB1aS5ub3RpZmljYXRpb25zLmluZm8obXNnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNlbmRDaGF0KFxuICAgICAgICBzcGVha2VyOiBBY3RvcjVlLFxuICAgICAgICBjb250ZW50OiBzdHJpbmcsXG4gICAgICAgIGZsYXZvcj86IHN0cmluZyxcbiAgICAgICAgc291bmQ/OiBzdHJpbmcsXG4gICAgICAgIHdoaXNwZXI6IHN0cmluZ1tdID0gW10sXG4gICAgICAgIHR5cGU6IDAgfCAxIHwgMiB8IDMgfCA0IHwgNSA9IENPTlNULkNIQVRfTUVTU0FHRV9UWVBFUy5PVEhFUlxuICAgICkge1xuICAgICAgICBjb25zdCBDaGF0RGF0YSA9IHtcbiAgICAgICAgICAgIHNwZWFrZXI6IENoYXRNZXNzYWdlLmdldFNwZWFrZXIoeyBhY3Rvcjogc3BlYWtlciB9KSxcbiAgICAgICAgICAgIHR5cGUsXG4gICAgICAgICAgICBmbGF2b3IsXG4gICAgICAgICAgICBzb3VuZCxcbiAgICAgICAgICAgIGNvbnRlbnQsXG4gICAgICAgICAgICB3aGlzcGVyLFxuICAgICAgICB9O1xuICAgICAgICBDaGF0TWVzc2FnZS5jcmVhdGUoQ2hhdERhdGEpO1xuICAgIH1cblxuICAgIGdldExvY2FsaXplZFR4dChcbiAgICAgICAga2V5OiBzdHJpbmcsXG4gICAgICAgIG9wdHM/OiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9LFxuICAgICAgICBmb3JtYXQ6IGJvb2xlYW4gPSBmYWxzZVxuICAgICkge1xuICAgICAgICBpZiAoZm9ybWF0KSB7XG4gICAgICAgICAgICByZXR1cm4gKGdhbWUgYXMgYW55KS5pMThuLmZvcm1hdChrZXksIG9wdHMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAoZ2FtZSBhcyBhbnkpLmkxOG4ubG9jYWxpemUoa2V5LCBvcHRzKTtcbiAgICB9XG5cbiAgICB0b1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuICdjbGFzcyBVaU1hbmFnZXInO1xuICAgIH1cbn1cbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiaW1wb3J0IE1vZHVsZU1hbmFnZXIgZnJvbSAnLi9tb2R1bGUvbWFuYWdlcnMvTW9kdWxlTWFuYWdlcic7XG5pbXBvcnQgVGVtcGxhdGVNYW5hZ2VyIGZyb20gJy4vbW9kdWxlL21hbmFnZXJzL1RlbXBsYXRlTWFuYWdlcic7XG5cbmltcG9ydCBtb2R1bGVKc29uIGZyb20gJy4uL21vZHVsZS5qc29uJztcblxuSG9va3Mub25jZSgnaW5pdCcsIGFzeW5jICgpID0+IHtcbiAgICBjb25zb2xlLmxvZygnV2VhcG9uIFJlbG9hZCB8IEZvdW5kcnkgVlRUIE1vZHVsZScpO1xuXG4gICAgY29uc3Qgd2VhcG9uX3JlbG9hZCA9IG5ldyBNb2R1bGVNYW5hZ2VyKG1vZHVsZUpzb24uaWQpO1xuICAgIHdlYXBvbl9yZWxvYWQuaW5pdCgpO1xufSk7XG5cbmlmIChwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ2RldmVsb3BtZW50Jykge1xuICAgIGlmIChtb2R1bGUuaG90KSB7XG4gICAgICAgIG1vZHVsZS5ob3QuYWNjZXB0KCk7XG5cbiAgICAgICAgaWYgKG1vZHVsZS5ob3Quc3RhdHVzKCkgPT09ICdhcHBseScpIHtcbiAgICAgICAgICAgIFRlbXBsYXRlTWFuYWdlci5vbkhvdFJlbG9hZCgpO1xuICAgICAgICB9XG4gICAgfVxufVxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9