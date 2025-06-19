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
    console.log('Weapon Reload | Foundry VTT Module');
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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LGFBQWEsR0FBRyxJQUFJLHNFQUFhLENBQUMsNENBQWEsQ0FBQyxDQUFDO0lBQ3ZELGFBQWEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUN6QixDQUFDLENBQUMsQ0FBQztBQUVILElBQUksSUFBc0MsRUFBRSxDQUFDO0lBQ3pDLElBQUksS0FBVSxFQUFFO0FBQUEsRUFNZjtBQUNMLENBQUM7Ozs7Ozs7Ozs7Ozs7QUNwQkQsaUVBQWUscUJBQXVCLHNCQUFzQixFIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZnZ0dC13ZWFwb24tcmVsb2FkLy4vc3JjL21vZHVsZS9mZWF0dXJlcy9CYXNlRmVhdHVyZS50cyIsIndlYnBhY2s6Ly9mdnR0LXdlYXBvbi1yZWxvYWQvLi9zcmMvbW9kdWxlL2ZlYXR1cmVzL05leHRSb3VuZEZlYXR1cmUudHMiLCJ3ZWJwYWNrOi8vZnZ0dC13ZWFwb24tcmVsb2FkLy4vc3JjL21vZHVsZS9mZWF0dXJlcy9SZWxvYWRGZWF0dXJlLnRzIiwid2VicGFjazovL2Z2dHQtd2VhcG9uLXJlbG9hZC8uL3NyYy9tb2R1bGUvZmVhdHVyZXMvUmVsb2FkYWJsZVdlYXBvbkF0dGFja0ZlYXR1cmUudHMiLCJ3ZWJwYWNrOi8vZnZ0dC13ZWFwb24tcmVsb2FkLy4vc3JjL21vZHVsZS9mZWF0dXJlcy9SZWxvYWRhYmxlV2VhcG9uQ3JlYXRpb25GZWF0dXJlLnRzIiwid2VicGFjazovL2Z2dHQtd2VhcG9uLXJlbG9hZC8uL3NyYy9tb2R1bGUvZmVhdHVyZXMvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vZnZ0dC13ZWFwb24tcmVsb2FkLy4vc3JjL21vZHVsZS9tYW5hZ2Vycy9GZWF0dXJlTWFuYWdlci50cyIsIndlYnBhY2s6Ly9mdnR0LXdlYXBvbi1yZWxvYWQvLi9zcmMvbW9kdWxlL21hbmFnZXJzL01vZHVsZU1hbmFnZXIudHMiLCJ3ZWJwYWNrOi8vZnZ0dC13ZWFwb24tcmVsb2FkLy4vc3JjL21vZHVsZS9tYW5hZ2Vycy9UZW1wbGF0ZU1hbmFnZXIudHMiLCJ3ZWJwYWNrOi8vZnZ0dC13ZWFwb24tcmVsb2FkLy4vc3JjL21vZHVsZS9tYW5hZ2Vycy9VaU1hbmFnZXIudHMiLCJ3ZWJwYWNrOi8vZnZ0dC13ZWFwb24tcmVsb2FkL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2Z2dHQtd2VhcG9uLXJlbG9hZC93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vZnZ0dC13ZWFwb24tcmVsb2FkL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vZnZ0dC13ZWFwb24tcmVsb2FkL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vZnZ0dC13ZWFwb24tcmVsb2FkL3dlYnBhY2svcnVudGltZS9wdWJsaWNQYXRoIiwid2VicGFjazovL2Z2dHQtd2VhcG9uLXJlbG9hZC8uL3NyYy9pbmRleC50cyIsIndlYnBhY2s6Ly9mdnR0LXdlYXBvbi1yZWxvYWQvLi9zcmMvc3R5bGVzL21vZHVsZS5zY3NzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBGZWF0dXJlTWFuYWdlciBmcm9tICcuLi9tYW5hZ2Vycy9GZWF0dXJlTWFuYWdlcic7XG5pbXBvcnQgeyBEbmRJdGVtNWUgfSBmcm9tICcuLi90eXBlcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJhc2VGZWF0dXJlIHtcbiAgICBwcml2YXRlIF9mZWF0dXJlTWFuYWdlcjogRmVhdHVyZU1hbmFnZXI7XG4gICAgcHJpdmF0ZSBfYWN0b3JJZDogc3RyaW5nO1xuICAgIHByaXZhdGUgX3dlYXBvbklkOiBzdHJpbmc7XG5cbiAgICBjb25zdHJ1Y3RvcihmZWF0dXJlTWFuYWdlcjogRmVhdHVyZU1hbmFnZXIpIHtcbiAgICAgICAgdGhpcy5fZmVhdHVyZU1hbmFnZXIgPSBmZWF0dXJlTWFuYWdlcjtcbiAgICAgICAgdGhpcy5fYWN0b3JJZCA9ICcnO1xuICAgICAgICB0aGlzLl93ZWFwb25JZCA9ICcnO1xuICAgICAgICB0aGlzLmluaXQoKTtcbiAgICB9XG5cbiAgICBnZXQgZmVhdHVyZU1hbmFnZXIoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9mZWF0dXJlTWFuYWdlcjtcbiAgICB9XG5cbiAgICBnZXQgbW9kdWxlTWFuYWdlcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ZlYXR1cmVNYW5hZ2VyLm1vZHVsZU1hbmFnZXI7XG4gICAgfVxuXG4gICAgZ2V0IGNoYXJhY3RlcigpOiBBY3RvcjVlIHtcbiAgICAgICAgcmV0dXJuIGdhbWU/LmFjdG9ycz8uZ2V0KHRoaXMuX2FjdG9ySWQpIGFzIEFjdG9yNWU7XG4gICAgfVxuXG4gICAgZ2V0IGNoYXJhY3RlcklkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWN0b3JJZDtcbiAgICB9XG5cbiAgICBzZXQgY2hhcmFjdGVySWQoaWQ6IHN0cmluZykge1xuICAgICAgICB0aGlzLl9hY3RvcklkID0gaWQ7XG4gICAgfVxuXG4gICAgZ2V0IHdlYXBvbigpOiBEbmRJdGVtNWUge1xuICAgICAgICByZXR1cm4gdGhpcy5jaGFyYWN0ZXIuaXRlbXMuZ2V0KHRoaXMuX3dlYXBvbklkKSBhcyBEbmRJdGVtNWU7XG4gICAgfVxuXG4gICAgZ2V0IHdlYXBvbklkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fd2VhcG9uSWQ7XG4gICAgfVxuXG4gICAgc2V0IHdlYXBvbklkKGlkOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5fd2VhcG9uSWQgPSBpZDtcbiAgICB9XG5cbiAgICBnZXQgbG9hZG91dCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0UmVsb2FkRmxhZygnY2hhbWJlcmVkJyk7XG4gICAgfVxuXG4gICAgZ2V0IGZpcmVkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRSZWxvYWRGbGFnKCdmaXJlZCcpO1xuICAgIH1cblxuICAgIGdldFJlbG9hZEZsYWcobmFtZTogc3RyaW5nKSB7XG4gICAgICAgIGNvbnN0IHJlbG9hZGFibGVXZWFwb24gPSB0aGlzLndlYXBvbjtcbiAgICAgICAgY29uc3QgbWF4U2hvdHMgPSByZWxvYWRhYmxlV2VhcG9uLnN5c3RlbS51c2VzLm1heDtcbiAgICAgICAgY29uc3QgZmlyZWQgPVxuICAgICAgICAgICAgKHJlbG9hZGFibGVXZWFwb24uZ2V0RmxhZyhcbiAgICAgICAgICAgICAgICB0aGlzLm1vZHVsZU1hbmFnZXIuaWQsXG4gICAgICAgICAgICAgICAgbmFtZVxuICAgICAgICAgICAgKSBhcyBzdHJpbmdbXSkgfHwgbmV3IEFycmF5KG1heFNob3RzKS5maWxsKCdFbXB0eScpO1xuXG4gICAgICAgIGlmIChmaXJlZC5sZW5ndGggPCBtYXhTaG90cykge1xuICAgICAgICAgICAgY29uc3QgbWlzc2luZyA9IG1heFNob3RzIC0gZmlyZWQubGVuZ3RoO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBtaXNzaW5nOyBpKyspIHtcbiAgICAgICAgICAgICAgICBmaXJlZC5wdXNoKCdFbXB0eScpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZpcmVkO1xuICAgIH1cblxuICAgIGFtbXVuaXRpb24oaXRlbXM6IENvbGxlY3Rpb248SXRlbTVlPiwgZXF1aXBwZWQ6IGJvb2xlYW4gPSBmYWxzZSk6IEl0ZW01ZVtdIHtcbiAgICAgICAgcmV0dXJuIGl0ZW1zLmZpbHRlcigoaXRlbTogSXRlbTVlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBnYW1lU3lzdGVtID0gKGl0ZW0gYXMgRG5kSXRlbTVlKS5zeXN0ZW07XG4gICAgICAgICAgICBpZiAoZXF1aXBwZWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICBpdGVtLnR5cGUgPT0gJ2NvbnN1bWFibGUnICYmXG4gICAgICAgICAgICAgICAgICAgIGdhbWVTeXN0ZW0udHlwZS5zdWJ0eXBlID09ICdmaXJlYXJtQnVsbGV0JyAmJlxuICAgICAgICAgICAgICAgICAgICBnYW1lU3lzdGVtLmVxdWlwcGVkXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgaXRlbS50eXBlID09ICdjb25zdW1hYmxlJyAmJlxuICAgICAgICAgICAgICAgIGdhbWVTeXN0ZW0udHlwZS5zdWJ0eXBlID09ICdmaXJlYXJtQnVsbGV0J1xuICAgICAgICAgICAgKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgaW5pdCgpIHt9XG5cbiAgICB0cmFuc2xhdGUoa2V5OiBzdHJpbmcsIG9wdHM/OiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9LCBmb3JtYXQ/OiBib29sZWFuKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1vZHVsZU1hbmFnZXIudWlNYW5hZ2VyLmdldExvY2FsaXplZFR4dChrZXksIG9wdHMsIGZvcm1hdCk7XG4gICAgfVxuXG4gICAgdG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiAnY2xhc3MgQmFzZUZlYXR1cmUnO1xuICAgIH1cbn1cbiIsImltcG9ydCBGZWF0dXJlTWFuYWdlciBmcm9tICcuLi9tYW5hZ2Vycy9GZWF0dXJlTWFuYWdlcic7XG5pbXBvcnQgQmFzZUZlYXR1cmUgZnJvbSAnLi9CYXNlRmVhdHVyZSc7XG5cbmV4cG9ydCBjbGFzcyBOZXh0Um91bmRGZWF0dXJlIGV4dGVuZHMgQmFzZUZlYXR1cmUge1xuICAgIGNvbnN0cnVjdG9yKGZlYXR1cmVNYW5hZ2VyOiBGZWF0dXJlTWFuYWdlcikge1xuICAgICAgICBzdXBlcihmZWF0dXJlTWFuYWdlcik7XG4gICAgfVxuXG4gICAgaW5pdCgpIHtcbiAgICAgICAgSG9va3Mub24oJ2RuZDVlLnByZVVzZUFjdGl2aXR5JywgdGhpcy5vblVzZUFjdGl2aXR5LmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIG9uVXNlQWN0aXZpdHkoYWN0aXZpdHk6IGFueSkge1xuICAgICAgICBpZiAoYWN0aXZpdHkudHlwZSA9PT0gJ3V0aWxpdHknICYmIGFjdGl2aXR5Lm5hbWUgPT0gJ05leHQgUm91bmQnKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnV2VhcG9uIFJlbG9hZCB8IFRyaWdnZXJlZCBOZXh0IFJvdW5kJyk7XG5cbiAgICAgICAgICAgIHRoaXMuY2hhcmFjdGVySWQgPSBhY3Rpdml0eS5hY3Rvci5pZDtcbiAgICAgICAgICAgIHRoaXMud2VhcG9uSWQgPSBhY3Rpdml0eS5pdGVtLmlkO1xuICAgICAgICAgICAgdGhpcy5uZXh0Um91bmQoKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBhc3luYyBuZXh0Um91bmQoKSB7XG4gICAgICAgIGNvbnN0IG5leHRSb3VuZCA9IHRoaXMubG9hZG91dFswXTtcbiAgICAgICAgY29uc3QgYWN0b3IgPSB0aGlzLmNoYXJhY3RlcjtcblxuICAgICAgICAvLyBOb3RpZnkgdGhlIHVzZXIgd2hhdCB0aGUgbmV4dCByb3VuZCBpc1xuICAgICAgICBjb25zdCBodG1sVGVtcGxhdGUgPSBhd2FpdCAoXG4gICAgICAgICAgICBmb3VuZHJ5LmFwcGxpY2F0aW9ucyBhcyBhbnlcbiAgICAgICAgKS5oYW5kbGViYXJzLnJlbmRlclRlbXBsYXRlKFxuICAgICAgICAgICAgJ21vZHVsZXMvZnZ0dC13ZWFwb24tcmVsb2FkL3RlbXBsYXRlcy9hbW1vUmVmdW5kTm90aWNlVGVtcGxhdGUuaGJzJyxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBpdGVtOiB7XG4gICAgICAgICAgICAgICAgICAgIGltZzogJ21vZHVsZXMvZnZ0dC13ZWFwb24tcmVsb2FkL2Fzc2V0cy9pY29ucy9idWxsZXRzX2J3X2ljb24ucG5nJyxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogbmV4dFJvdW5kLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IHRoaXMudHJhbnNsYXRlKFxuICAgICAgICAgICAgICAgICAgICAnV0VBUE9OX1JFTE9BRC5GZWF0dXJlcy5OZXh0Um91bmQuRGVzY3JpcHRpb24nLFxuICAgICAgICAgICAgICAgICAgICB7IGJ1bGxldDogbmV4dFJvdW5kLCB3ZWFwb246IHRoaXMud2VhcG9uLm5hbWUgfSxcbiAgICAgICAgICAgICAgICAgICAgdHJ1ZVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgdGl0bGU6IHRoaXMudHJhbnNsYXRlKCdXRUFQT05fUkVMT0FELkZlYXR1cmVzLk5leHRSb3VuZC5UaXRsZScpLFxuICAgICAgICAgICAgfVxuICAgICAgICApO1xuICAgICAgICB0aGlzLm1vZHVsZU1hbmFnZXIudWlNYW5hZ2VyLnNlbmRDaGF0KFxuICAgICAgICAgICAgYWN0b3IsXG4gICAgICAgICAgICBodG1sVGVtcGxhdGUsXG4gICAgICAgICAgICB1bmRlZmluZWQsXG4gICAgICAgICAgICB1bmRlZmluZWQsXG4gICAgICAgICAgICBbYWN0b3IuaWRdLFxuICAgICAgICAgICAgQ09OU1QuQ0hBVF9NRVNTQUdFX1RZUEVTLldISVNQRVJcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICB0b1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuICdjbGFzcyBOZXh0Um91bmRGZWF0dXJlJztcbiAgICB9XG59XG4iLCJpbXBvcnQgRGlhbG9nVjIgZnJvbSAnQGxlYWd1ZS1vZi1mb3VuZHJ5LWRldmVsb3BlcnMvZm91bmRyeS12dHQtdHlwZXMvc3JjL2ZvdW5kcnkvY2xpZW50LWVzbS9hcHBsaWNhdGlvbnMvYXBpL2RpYWxvZy5tanMnO1xuaW1wb3J0IEZlYXR1cmVNYW5hZ2VyIGZyb20gJy4uL21hbmFnZXJzL0ZlYXR1cmVNYW5hZ2VyJztcbmltcG9ydCBCYXNlRmVhdHVyZSBmcm9tICcuL0Jhc2VGZWF0dXJlJztcbmltcG9ydCB7IHR5cGUgQW1tb0l0ZW1PcHRpb24sIERuZEl0ZW01ZSB9IGZyb20gJy4uL3R5cGVzJztcblxuZXhwb3J0IGNsYXNzIFJlbG9hZEZlYXR1cmUgZXh0ZW5kcyBCYXNlRmVhdHVyZSB7XG4gICAgcHJpdmF0ZSBfaG9va0lkOiBudW1iZXI7XG4gICAgcHJpdmF0ZSBfaGFuZGxlQ2hvaWNlRGlhbG9nQ2xvc2U6IGJvb2xlYW47XG5cbiAgICBjb25zdHJ1Y3RvcihmZWF0dXJlTWFuYWdlcjogRmVhdHVyZU1hbmFnZXIpIHtcbiAgICAgICAgc3VwZXIoZmVhdHVyZU1hbmFnZXIpO1xuICAgICAgICB0aGlzLl9ob29rSWQgPSAtMTtcbiAgICAgICAgdGhpcy5faGFuZGxlQ2hvaWNlRGlhbG9nQ2xvc2UgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBpbml0KCkge1xuICAgICAgICBIb29rcy5vbignZG5kNWUucHJlVXNlQWN0aXZpdHknLCB0aGlzLm9uVXNlQWN0aXZpdHkuYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgb25Vc2VBY3Rpdml0eShhY3Rpdml0eTogYW55KSB7XG4gICAgICAgIGlmIChhY3Rpdml0eS50eXBlID09PSAndXRpbGl0eScgJiYgYWN0aXZpdHkubmFtZSA9PSAnUmVsb2FkJykge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1dlYXBvbiBSZWxvYWQgfCBUcmlnZ2VyZWQgUmVsb2FkJyk7XG5cbiAgICAgICAgICAgIHRoaXMuY2hhcmFjdGVySWQgPSBhY3Rpdml0eS5hY3Rvci5pZDtcbiAgICAgICAgICAgIHRoaXMud2VhcG9uSWQgPSBhY3Rpdml0eS5pdGVtLmlkO1xuICAgICAgICAgICAgdGhpcy53ZWFwb25SZWxvYWQoKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICB3ZWFwb25SZWxvYWQocmVmdW5kQW1tbzogYm9vbGVhbiA9IHRydWUpIHtcbiAgICAgICAgY29uc3QgaXRlbXMgPSB0aGlzLmNoYXJhY3Rlcj8uaXRlbXM7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRMb2Fkb3V0ID0gdGhpcy5sb2Fkb3V0O1xuICAgICAgICBjb25zdCBpbnZlbnRvcnlBbW11bml0aW9uID0gdGhpcy5hbW11bml0aW9uKGl0ZW1zKSBhcyBEbmRJdGVtNWVbXTtcbiAgICAgICAgbGV0IGFtbXVuaXRpb25DaG9pY2VzOiBBbW1vSXRlbU9wdGlvbltdID0gW107XG5cbiAgICAgICAgaWYgKHJlZnVuZEFtbW8pIHtcbiAgICAgICAgICAgIGFtbXVuaXRpb25DaG9pY2VzID0gdGhpcy5yZWZ1bmRDaGFtYmVyZWRBbW1vKGludmVudG9yeUFtbXVuaXRpb24pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYW1tdW5pdGlvbkNob2ljZXMgPSBpbnZlbnRvcnlBbW11bml0aW9uLm1hcChcbiAgICAgICAgICAgICAgICAoYW1tbzogRG5kSXRlbTVlKTogQW1tb0l0ZW1PcHRpb24gPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogYW1tby5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGFtbW8ubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50OiBhbW1vLnN5c3RlbS5xdWFudGl0eSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVxdWlwcGVkOiBhbW1vLnN5c3RlbS5lcXVpcHBlZCxcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgY2hlY2tFcXVpcHBlZCA9IGdhbWUuc2V0dGluZ3MuZ2V0KFxuICAgICAgICAgICAgdGhpcy5tb2R1bGVNYW5hZ2VyLmlkLFxuICAgICAgICAgICAgJ2ZpbHRlckFtbXVuaXRpb25CeUVxdWlwcGVkJ1xuICAgICAgICApIGFzIGJvb2xlYW47XG5cbiAgICAgICAgdGhpcy5jaG9vc2VBbW11bml0aW9uKFxuICAgICAgICAgICAgYW1tdW5pdGlvbkNob2ljZXMuZmlsdGVyKChhbW1vSXRlbTogQW1tb0l0ZW1PcHRpb24pID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoYW1tb0l0ZW0uY291bnQgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgIChjaGVja0VxdWlwcGVkICYmIGFtbW9JdGVtLmVxdWlwcGVkKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgIWNoZWNrRXF1aXBwZWRcbiAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIGN1cnJlbnRMb2Fkb3V0XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcmVmdW5kQ2hhbWJlcmVkQW1tbyhpbnZlbnRvcnlBbW11bml0aW9uOiBEbmRJdGVtNWVbXSk6IEFtbW9JdGVtT3B0aW9uW10ge1xuICAgICAgICBjb25zdCBsb2Fkb3V0Q291bnRzID0gdGhpcy5nZXRMb2Fkb3V0Q291bnRzKHRoaXMubG9hZG91dCk7XG4gICAgICAgIGNvbnN0IGF2YWlsYWJsZUFtbXVuaXRpb246IEFtbW9JdGVtT3B0aW9uW10gPSBbXTtcbiAgICAgICAgaW52ZW50b3J5QW1tdW5pdGlvbi5mb3JFYWNoKChhbW1vOiBEbmRJdGVtNWUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5hbWUgPSBhbW1vLm5hbWU7XG4gICAgICAgICAgICBjb25zdCBhbW1vSW5mbzogQW1tb0l0ZW1PcHRpb24gPSB7XG4gICAgICAgICAgICAgICAgbmFtZTogYW1tby5uYW1lLFxuICAgICAgICAgICAgICAgIHZhbHVlOiBhbW1vLm5hbWUsXG4gICAgICAgICAgICAgICAgY291bnQ6IGFtbW8uc3lzdGVtLnF1YW50aXR5LFxuICAgICAgICAgICAgICAgIGVxdWlwcGVkOiBhbW1vLnN5c3RlbS5lcXVpcHBlZCxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpZiAobG9hZG91dENvdW50c1tuYW1lXSkge1xuICAgICAgICAgICAgICAgIGFtbW9JbmZvLmNvdW50ID0gYW1tby5zeXN0ZW0ucXVhbnRpdHkgKyBsb2Fkb3V0Q291bnRzW25hbWVdO1xuICAgICAgICAgICAgICAgIGFtbW8udXBkYXRlKHtcbiAgICAgICAgICAgICAgICAgICAgJ3N5c3RlbS5xdWFudGl0eSc6IGFtbW9JbmZvLmNvdW50LFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYXZhaWxhYmxlQW1tdW5pdGlvbi5wdXNoKGFtbW9JbmZvKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBhdmFpbGFibGVBbW11bml0aW9uO1xuICAgIH1cblxuICAgIGFzeW5jIGNob29zZUFtbXVuaXRpb24oXG4gICAgICAgIGFtbW9PcHRpb25zOiBBbW1vSXRlbU9wdGlvbltdLFxuICAgICAgICBjdXJyZW50TG9hZG91dDogc3RyaW5nW11cbiAgICApIHtcbiAgICAgICAgY29uc3QgZGlhbG9nQ29udGVudCA9IGF3YWl0IChcbiAgICAgICAgICAgIGZvdW5kcnkuYXBwbGljYXRpb25zIGFzIGFueVxuICAgICAgICApLmhhbmRsZWJhcnMucmVuZGVyVGVtcGxhdGUoXG4gICAgICAgICAgICAnbW9kdWxlcy9mdnR0LXdlYXBvbi1yZWxvYWQvdGVtcGxhdGVzL2FtbW9TZWxlY3Rpb25EaWFsb2dUZW1wbGF0ZS5oYnMnLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGxvYWRvdXRTbG90czogbmV3IEFycmF5KHRoaXMud2VhcG9uLnN5c3RlbS51c2VzLm1heCkuZmlsbChcbiAgICAgICAgICAgICAgICAgICAgJ0VtcHR5J1xuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgYW1tb09wdGlvbnMsXG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG5cbiAgICAgICAgY29uc3QgZGlhbG9nQnV0dG9ucyA9IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBhY3Rpb246ICdsb2FkJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogdGhpcy50cmFuc2xhdGUoXG4gICAgICAgICAgICAgICAgICAgICdXRUFQT05fUkVMT0FELkZlYXR1cmVzLlJlbG9hZC5BbW11bml0aW9uLkNob2ljZURpYWxvZ0J1dHRvblR4dExvYWQnXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBjYWxsYmFjazogKFxuICAgICAgICAgICAgICAgICAgICBfZXZlbnQ6IFBvaW50ZXJFdmVudCB8IFN1Ym1pdEV2ZW50LFxuICAgICAgICAgICAgICAgICAgICBidXR0b246IEhUTUxCdXR0b25FbGVtZW50XG4gICAgICAgICAgICAgICAgKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2hhbmRsZUNob2ljZURpYWxvZ0Nsb3NlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGxvYWRvdXQ6IHN0cmluZ1tdID0gW107XG4gICAgICAgICAgICAgICAgICAgIGZvciAoXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgaSA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICBpIDwgKGJ1dHRvbi5mb3JtPy5lbGVtZW50cz8ubGVuZ3RoIGFzIG51bWJlcik7XG4gICAgICAgICAgICAgICAgICAgICAgICBpKytcbiAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBlbG0gPSBidXR0b24uZm9ybT8uZWxlbWVudHMuaXRlbShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpXG4gICAgICAgICAgICAgICAgICAgICAgICApIGFzIEhUTUxTZWxlY3RFbGVtZW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVsbT8ubmFtZSA9PSAnYW1tby1zZWxlY3QnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9hZG91dC5wdXNoKGVsbS52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgbG9hZG91dCwgcmVsb2FkQ2FuY2VsZWQ6IGZhbHNlIH07XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYWN0aW9uOiAnY2FuY2VsJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogdGhpcy50cmFuc2xhdGUoXG4gICAgICAgICAgICAgICAgICAgICdXRUFQT05fUkVMT0FELkZlYXR1cmVzLlJlbG9hZC5BbW11bml0aW9uLkNob2ljZURpYWxvZ0J1dHRvblR4dENhbmNlbCdcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIGNhbGxiYWNrOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2hhbmRsZUNob2ljZURpYWxvZ0Nsb3NlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7IGxvYWRvdXQ6IGN1cnJlbnRMb2Fkb3V0LCByZWxvYWRDYW5jZWxlZDogdHJ1ZSB9O1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICBdO1xuXG4gICAgICAgIHRoaXMuX2hhbmRsZUNob2ljZURpYWxvZ0Nsb3NlID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5faG9va0lkID0gSG9va3Mub24oJ2Nsb3NlRGlhbG9nVjInLCAoZGlhbG9nVjI6IERpYWxvZ1YyKSA9PiB7XG4gICAgICAgICAgICBpZiAoZGlhbG9nVjIuaWQgPT09ICdhbW1vLWNob2ljZS1kaWFsb2cnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vbkNsb3NlQ2hvaWNlRGlhbG9nKGN1cnJlbnRMb2Fkb3V0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5tb2R1bGVNYW5hZ2VyLnVpTWFuYWdlclxuICAgICAgICAgICAgLmJ1aWxkRGlhbG9nKFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IHRoaXMudHJhbnNsYXRlKFxuICAgICAgICAgICAgICAgICAgICAgICAgJ1dFQVBPTl9SRUxPQUQuRmVhdHVyZXMuUmVsb2FkLkFtbXVuaXRpb24uQ2hvaWNlRGlhbG9nVGl0bGUnXG4gICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGRpYWxvZ0NvbnRlbnQsXG4gICAgICAgICAgICAgICAgICAgIGJ1dHRvbnM6IGRpYWxvZ0J1dHRvbnMsXG4gICAgICAgICAgICAgICAgICAgIG9uU3VibWl0OiAoe1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9hZG91dCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbG9hZENhbmNlbGVkLFxuICAgICAgICAgICAgICAgICAgICB9OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2Fkb3V0OiBzdHJpbmdbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbG9hZENhbmNlbGVkOiBib29sZWFuO1xuICAgICAgICAgICAgICAgICAgICB9KTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5yZWxvYWRSZWxvYWRhYmxlV2VhcG9uKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvYWRvdXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVsb2FkQ2FuY2VsZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAnYW1tby1jaG9pY2UtZGlhbG9nJ1xuICAgICAgICAgICAgKVxuICAgICAgICAgICAgLnJlbmRlcih7IGZvcmNlOiB0cnVlIH0pO1xuICAgIH1cblxuICAgIG9uQ2xvc2VDaG9pY2VEaWFsb2cobG9hZG91dDogc3RyaW5nW10pIHtcbiAgICAgICAgSG9va3Mub2ZmKCdjbG9zZURpYWxvZ1YyJywgdGhpcy5faG9va0lkKTtcbiAgICAgICAgdGhpcy5faG9va0lkID0gLTE7XG5cbiAgICAgICAgaWYgKHRoaXMuX2hhbmRsZUNob2ljZURpYWxvZ0Nsb3NlKSB7XG4gICAgICAgICAgICB0aGlzLl9oYW5kbGVDaG9pY2VEaWFsb2dDbG9zZSA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5yZWxvYWRSZWxvYWRhYmxlV2VhcG9uKGxvYWRvdXQsIHRydWUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgYXN5bmMgcmVsb2FkUmVsb2FkYWJsZVdlYXBvbihcbiAgICAgICAgbG9hZG91dDogc3RyaW5nW10sXG4gICAgICAgIHJlbG9hZENhbmNlbGVkOiBib29sZWFuID0gZmFsc2VcbiAgICApIHtcbiAgICAgICAgY29uc3QgcmVsb2FkYWJsZVdlYXBvbiA9IHRoaXMud2VhcG9uO1xuICAgICAgICBjb25zdCBhbW1vQ291bnRzID0gdGhpcy5nZXRMb2Fkb3V0Q291bnRzKGxvYWRvdXQpO1xuXG4gICAgICAgIGlmICh0aGlzLnJlbW92ZUxvYWRvdXQoYW1tb0NvdW50cykpIHtcbiAgICAgICAgICAgIC8vIFVwZGF0ZSB0aGUgcmVsb2FkYWJsZVdlYXBvbiB1c2VzXG4gICAgICAgICAgICBsZXQgcXR5ID0gMDtcbiAgICAgICAgICAgIGlmIChhbW1vQ291bnRzWydFbXB0eSddID4gMCkge1xuICAgICAgICAgICAgICAgIC8vIEFkanVzdCBzcGVudCB1c2VzIGJ5IHRoZSBudW1iZXIgb2YgRW1wdHkgc2xvdHNcbiAgICAgICAgICAgICAgICBxdHkgKz0gYW1tb0NvdW50c1snRW1wdHknXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGF3YWl0IHJlbG9hZGFibGVXZWFwb24udXBkYXRlKHtcbiAgICAgICAgICAgICAgICAnc3lzdGVtLnVzZXMuc3BlbnQnOiBxdHksXG4gICAgICAgICAgICAgICAgJ3N5c3RlbS51c2VzLnZhbHVlJzogcmVsb2FkYWJsZVdlYXBvbi5zeXN0ZW0udXNlcy5tYXggLSBxdHksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGF3YWl0IHJlbG9hZGFibGVXZWFwb24uc2V0RmxhZyhcbiAgICAgICAgICAgICAgICB0aGlzLm1vZHVsZU1hbmFnZXIuaWQsXG4gICAgICAgICAgICAgICAgJ2NoYW1iZXJlZCcsXG4gICAgICAgICAgICAgICAgbG9hZG91dFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGF3YWl0IHJlbG9hZGFibGVXZWFwb24uc2V0RmxhZyhcbiAgICAgICAgICAgICAgICB0aGlzLm1vZHVsZU1hbmFnZXIuaWQsXG4gICAgICAgICAgICAgICAgJ2ZpcmVkJyxcbiAgICAgICAgICAgICAgICBuZXcgQXJyYXkodGhpcy53ZWFwb24uc3lzdGVtLnVzZXMubWF4KS5maWxsKCdFbXB0eScpXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICBjb25zdCBodG1sVGVtcGxhdGUgPSBhd2FpdCAoXG4gICAgICAgICAgICAgICAgZm91bmRyeS5hcHBsaWNhdGlvbnMgYXMgYW55XG4gICAgICAgICAgICApLmhhbmRsZWJhcnMucmVuZGVyVGVtcGxhdGUoXG4gICAgICAgICAgICAgICAgJ21vZHVsZXMvZnZ0dC13ZWFwb24tcmVsb2FkL3RlbXBsYXRlcy9yZWxvYWRhYmxlV2VhcG9uUmVsb2FkVGVtcGxhdGUuaGJzJyxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW06IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGltZzogcmVsb2FkYWJsZVdlYXBvbi5pbWcsXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiByZWxvYWRhYmxlV2VhcG9uLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGZsYXZvcjogdGhpcy50cmFuc2xhdGUoXG4gICAgICAgICAgICAgICAgICAgICAgICByZWxvYWRDYW5jZWxlZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gJ1dFQVBPTl9SRUxPQUQuRmVhdHVyZXMuUmVsb2FkLldlYXBvbi5XZWFwb25SZWxvYWRlZENoYXRGbGF2b3JDYW5jZWxlZCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6ICdXRUFQT05fUkVMT0FELkZlYXR1cmVzLlJlbG9hZC5XZWFwb24uV2VhcG9uUmVsb2FkZWRDaGF0Rmxhdm9yJ1xuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICB0aXRsZTogdGhpcy50cmFuc2xhdGUoXG4gICAgICAgICAgICAgICAgICAgICAgICByZWxvYWRDYW5jZWxlZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gJ1dFQVBPTl9SRUxPQUQuRmVhdHVyZXMuUmVsb2FkLldlYXBvbi5XZWFwb25SZWxvYWRlZENoYXRNc2dDYW5jZWxlZCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6ICdXRUFQT05fUkVMT0FELkZlYXR1cmVzLlJlbG9hZC5XZWFwb24uV2VhcG9uUmVsb2FkZWRDaGF0TXNnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgcmVsb2FkYWJsZVdlYXBvbjogcmVsb2FkYWJsZVdlYXBvbi5uYW1lIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgIGxvYWRvdXQ6IGxvYWRvdXQsXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIC8vIE5vdGlmeSB0aGUgcGVlcHNcbiAgICAgICAgICAgIHRoaXMubW9kdWxlTWFuYWdlci51aU1hbmFnZXIuc2VuZENoYXQodGhpcy5jaGFyYWN0ZXIsIGh0bWxUZW1wbGF0ZSk7XG4gICAgICAgICAgICB0aGlzLmNoYXJhY3RlcklkID0gJyc7XG4gICAgICAgICAgICB0aGlzLndlYXBvbklkID0gJyc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLndlYXBvblJlbG9hZChmYWxzZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHJlbW92ZUxvYWRvdXQoY291bnRzOiB7IFtrZXk6IHN0cmluZ106IG51bWJlciB9KTogYm9vbGVhbiB7XG4gICAgICAgIGxldCBhbW11bml0aW9uQXZhaWxhYmxlID0gdHJ1ZTtcbiAgICAgICAgY29uc3QgaW52ZW50b3J5QW1tdW5pdGlvbiA9IHRoaXMuYW1tdW5pdGlvbihcbiAgICAgICAgICAgIHRoaXMuY2hhcmFjdGVyPy5pdGVtc1xuICAgICAgICApIGFzIERuZEl0ZW01ZVtdO1xuICAgICAgICBpbnZlbnRvcnlBbW11bml0aW9uLmZvckVhY2goKGFtbW86IERuZEl0ZW01ZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbmFtZSA9IGFtbW8ubmFtZTtcbiAgICAgICAgICAgIGNvbnN0IHF0eSA9IGFtbW8uc3lzdGVtLnF1YW50aXR5IC0gY291bnRzW25hbWVdO1xuXG4gICAgICAgICAgICAvLyBJZiBhbnkgYnVsbGV0IGlzIGFkZGVkIGJleW9uZCB0aGUgcXVhbnRpdHkgdGhlIHBsYXllciBhY3R1YWxseSBoYXMgdGhlbiB0aHJvdyBhbiBlcnJvciBhbmQgcmV0dXJuIGZhbHNlXG4gICAgICAgICAgICBpZiAocXR5IDwgMCkge1xuICAgICAgICAgICAgICAgIHRoaXMubW9kdWxlTWFuYWdlci51aU1hbmFnZXIudWlOb3RpZmljYXRpb24oXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudHJhbnNsYXRlKFxuICAgICAgICAgICAgICAgICAgICAgICAgJ1dFQVBPTl9SRUxPQUQuRmVhdHVyZXMuUmVsb2FkLldlYXBvbi5Mb2FkaW5nRXJyb3JNc2cnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBuYW1lOiBhbW1vLm5hbWUgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRydWVcbiAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgJ2Vycm9yJ1xuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgYW1tdW5pdGlvbkF2YWlsYWJsZSA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoYW1tdW5pdGlvbkF2YWlsYWJsZSkge1xuICAgICAgICAgICAgaW52ZW50b3J5QW1tdW5pdGlvbi5mb3JFYWNoKGFzeW5jIChhbW1vOiBEbmRJdGVtNWUpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBuYW1lID0gYW1tby5uYW1lO1xuICAgICAgICAgICAgICAgIGlmIChjb3VudHNbbmFtZV0pIHtcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgYW1tby51cGRhdGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgJ3N5c3RlbS5xdWFudGl0eSc6IGFtbW8uc3lzdGVtLnF1YW50aXR5IC0gY291bnRzW25hbWVdLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBhbW11bml0aW9uQXZhaWxhYmxlO1xuICAgIH1cblxuICAgIGFzeW5jIG9uUmVsb2FkQ2FsbGJhY2soYWN0b3I6IEFjdG9yNWUsIHdlYXBvbjogRG5kSXRlbTVlKSB7XG4gICAgICAgIHRoaXMuY2hhcmFjdGVySWQgPSBhY3Rvci5pZDtcbiAgICAgICAgdGhpcy53ZWFwb25JZCA9IHdlYXBvbi5pZDtcblxuICAgICAgICB0aGlzLndlYXBvblJlbG9hZCgpO1xuICAgIH1cblxuICAgIGdldExvYWRvdXRDb3VudHMoY3VycmVudExvYWRvdXQ6IHN0cmluZ1tdKToge1xuICAgICAgICBba2V5OiBzdHJpbmddOiBudW1iZXI7XG4gICAgfSB7XG4gICAgICAgIGNvbnN0IGxvYWRvdXQ6IHsgW2tleTogc3RyaW5nXTogbnVtYmVyIH0gPSB7fTtcbiAgICAgICAgY3VycmVudExvYWRvdXQuZm9yRWFjaCgoYW1tbzogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICBpZiAoIWxvYWRvdXRbYW1tb10pIGxvYWRvdXRbYW1tb10gPSAwO1xuICAgICAgICAgICAgbG9hZG91dFthbW1vXSA9IGxvYWRvdXRbYW1tb10gKyAxO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGxvYWRvdXQ7XG4gICAgfVxuXG4gICAgdG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiAnY2xhc3MgUmVsb2FkRmVhdHVyZSc7XG4gICAgfVxufVxuIiwiaW1wb3J0IEZlYXR1cmVNYW5hZ2VyIGZyb20gJy4uL21hbmFnZXJzL0ZlYXR1cmVNYW5hZ2VyJztcbmltcG9ydCBCYXNlRmVhdHVyZSBmcm9tICcuL0Jhc2VGZWF0dXJlJztcblxuaW1wb3J0IHtcbiAgICBBY3Rpdml0eUNhcmRDaGF0VHlwZSxcbiAgICBDaGF0TWVzc2FnZTVlLFxuICAgIERuZEl0ZW01ZSxcbiAgICBEbmREMjBSb2xsLFxuICAgIERuZEF0dGFja0V2ZW50LFxufSBmcm9tICcuLi90eXBlcyc7XG5cbmV4cG9ydCBjbGFzcyBSZWxvYWRhYmxlV2VhcG9uQXR0YWNrRmVhdHVyZSBleHRlbmRzIEJhc2VGZWF0dXJlIHtcbiAgICBwcml2YXRlIF9uZXh0Um91bmQ6IHtcbiAgICAgICAgaWQ6IHN0cmluZztcbiAgICAgICAgdHlwZTogc3RyaW5nO1xuICAgIH07XG4gICAgcHJpdmF0ZSBfaG9va0lkOiBudW1iZXI7XG5cbiAgICBjb25zdHJ1Y3RvcihmZWF0dXJlTWFuYWdlcjogRmVhdHVyZU1hbmFnZXIpIHtcbiAgICAgICAgc3VwZXIoZmVhdHVyZU1hbmFnZXIpO1xuICAgICAgICB0aGlzLl9uZXh0Um91bmQgPSB7IGlkOiAnJywgdHlwZTogJycgfTtcbiAgICAgICAgdGhpcy5faG9va0lkID0gLTE7XG4gICAgfVxuXG4gICAgaW5pdCgpIHtcbiAgICAgICAgSG9va3Mub24oJ2RuZDVlLnBvc3RSb2xsQ29uZmlndXJhdGlvbicsIHRoaXMub25Vc2VBY3Rpdml0eS5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICBvblVzZUFjdGl2aXR5KGQyMFJvbGw6IERuZEQyMFJvbGxbXSwgZXZlbnQ6IERuZEF0dGFja0V2ZW50KSB7XG4gICAgICAgIGNvbnN0IHJvbGwgPSBkMjBSb2xsWzBdO1xuICAgICAgICBjb25zdCB3ZWFwb25EYXRhID0gcm9sbD8uZGF0YT8uaXRlbTtcbiAgICAgICAgaWYgKHdlYXBvbkRhdGE/LnR5cGU/LmJhc2VJdGVtICE9PSAncmVsb2FkYWJsZVdlYXBvbicpIHJldHVybjtcblxuICAgICAgICBjb25zb2xlLmxvZygnV2VhcG9uIFJlbG9hZCB8IFRyaWdnZXJlZCBBdHRhY2snKTtcbiAgICAgICAgdGhpcy53ZWFwb25JZCA9IGV2ZW50LnN1YmplY3QuaXRlbS5pZDtcbiAgICAgICAgdGhpcy5jaGFyYWN0ZXJJZCA9IGV2ZW50LnN1YmplY3QuYWN0b3IuaWQ7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMucmVsb2FkYWJsZVdlYXBvbkF0dGFjaygpO1xuICAgIH1cblxuICAgIHJlbG9hZGFibGVXZWFwb25BdHRhY2soKSB7XG4gICAgICAgIGNvbnN0IGJ1bGxldCA9IHRoaXMuZ2V0TmV4dFJvdW5kKCk7XG5cbiAgICAgICAgaWYgKGJ1bGxldC5uYW1lID09ICdFbXB0eScpIHtcbiAgICAgICAgICAgIHRoaXMuZHJ5ZmlyZVdlYXBvbigpO1xuXG4gICAgICAgICAgICAvLyBTdG9wIHRoZSBhdHRhY2sgaWYgRHJ5IGZpcmluZyB0aGUgd2VhcG9uIGFuZCB0aGVyZSBhcmUgbm8gb3RoZXIgYnVsbGV0cyBsZWZ0XG4gICAgICAgICAgICBpZiAodGhpcy53ZWFwb24uc3lzdGVtLnVzZXMuc3BlbnQgPT0gdGhpcy53ZWFwb24uc3lzdGVtLnVzZXMubWF4KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGJ1bGxldC5uYW1lICE9PSAnRW1wdHknKSB7XG4gICAgICAgICAgICB0aGlzLl9uZXh0Um91bmQgPSB7XG4gICAgICAgICAgICAgICAgaWQ6IGJ1bGxldC5pZCxcbiAgICAgICAgICAgICAgICB0eXBlOiBidWxsZXQudHlwZSxcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHRoaXMuX2hvb2tJZCA9IEhvb2tzLm9uKFxuICAgICAgICAgICAgICAgICdkbmQ1ZS5yZW5kZXJDaGF0TWVzc2FnZScsXG4gICAgICAgICAgICAgICAgdGhpcy5vblJlbmRlckNoYXRNZXNzYWdlLmJpbmQodGhpcylcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5maXJlUm91bmQoYnVsbGV0KTtcbiAgICB9XG5cbiAgICBhc3luYyBvblJlbmRlckNoYXRNZXNzYWdlKG1lc3NhZ2U6IENoYXRNZXNzYWdlNWUsIGh0bWw6IEhUTUxFbGVtZW50KSB7XG4gICAgICAgIGNvbnN0IGl0ZW1JZCA9IG1lc3NhZ2UuZmxhZ3MuZG5kNWU/Lml0ZW0uaWQ7XG4gICAgICAgIGNvbnN0IGl0ZW1UeXBlID0gbWVzc2FnZS5mbGFncy5kbmQ1ZT8uaXRlbS50eXBlO1xuICAgICAgICBpZiAoXG4gICAgICAgICAgICB0aGlzLl9uZXh0Um91bmQuaWQgPT09IGl0ZW1JZCAmJlxuICAgICAgICAgICAgdGhpcy5fbmV4dFJvdW5kLnR5cGUgPT09IGl0ZW1UeXBlXG4gICAgICAgICkge1xuICAgICAgICAgICAgSG9va3Mub2ZmKCdkbmQ1ZS5yZW5kZXJDaGF0TWVzc2FnZScsIHRoaXMuX2hvb2tJZCk7XG4gICAgICAgICAgICB0aGlzLl9uZXh0Um91bmQgPSB7IGlkOiAnJywgdHlwZTogJycgfTtcblxuICAgICAgICAgICAgY29uc3QgYnVsbGV0ID0gdGhpcy5jaGFyYWN0ZXIuaXRlbXMuZ2V0KGl0ZW1JZCkgYXMgRG5kSXRlbTVlO1xuXG4gICAgICAgICAgICBjb25zdCBhY3RpdmF0aW9uQ2FyZCA9IGh0bWwucXVlcnlTZWxlY3RvcignLmFjdGl2YXRpb24tY2FyZCcpO1xuICAgICAgICAgICAgY29uc3QgaXRlbWNhcmQgPSBodG1sLnF1ZXJ5U2VsZWN0b3IoJy5pdGVtLWNhcmQnKTtcbiAgICAgICAgICAgIGNvbnN0IHBhcmVudEVsZW1lbnQgPSBhY3RpdmF0aW9uQ2FyZCB8fCBpdGVtY2FyZDtcblxuICAgICAgICAgICAgLy8gR3JhYiBtb2R1bGUgY29uZmlndXJhdGlvbnNcbiAgICAgICAgICAgIGNvbnN0IGNoZWNrVW5zdGFibGVBbW1vID0gZ2FtZS5zZXR0aW5ncy5nZXQoXG4gICAgICAgICAgICAgICAgdGhpcy5tb2R1bGVNYW5hZ2VyLmlkLFxuICAgICAgICAgICAgICAgICd1bnN0YWJsZUFtbW8nXG4gICAgICAgICAgICApIGFzIGJvb2xlYW47XG5cbiAgICAgICAgICAgIGNvbnN0IGNoZWNrTWlzZmlyZSA9IGdhbWUuc2V0dGluZ3MuZ2V0KFxuICAgICAgICAgICAgICAgIHRoaXMubW9kdWxlTWFuYWdlci5pZCxcbiAgICAgICAgICAgICAgICAndXNlTWlzZmlyZXMnXG4gICAgICAgICAgICApIGFzIGJvb2xlYW47XG5cbiAgICAgICAgICAgIGNvbnN0IHVuc3RhYmxlQW1tb0ZhaWx1cmVUaHJlc2hvbGQgPSBnYW1lLnNldHRpbmdzLmdldChcbiAgICAgICAgICAgICAgICB0aGlzLm1vZHVsZU1hbmFnZXIuaWQsXG4gICAgICAgICAgICAgICAgJ3Vuc3RhYmxlQW1tb0ZhaWx1cmVUaHJlc2hob2xkJ1xuICAgICAgICAgICAgKSBhcyBudW1iZXI7XG5cbiAgICAgICAgICAgIC8vIEFkZCB0aGUgbWlzZmlyZSBtZXNzYWdlXG4gICAgICAgICAgICBpZiAoY2hlY2tNaXNmaXJlKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY3JpdGljYWxGYWlsdXJlTXNnID1cbiAgICAgICAgICAgICAgICAgICAgY2hlY2tVbnN0YWJsZUFtbW8gJiZcbiAgICAgICAgICAgICAgICAgICAgYnVsbGV0Py5zeXN0ZW0ucHJvcGVydGllcy5maW5kKChwcm9wOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwcm9wID09PSAndW5zdGFibGUnO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgPyB0aGlzLnRyYW5zbGF0ZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdXRUFQT05fUkVMT0FELkZlYXR1cmVzLlJlbG9hZGFibGVXZWFwb25BdHRhY2suTWlzZmlyZVVuc3RhYmxlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgZmFpbHVyZTogYCR7dW5zdGFibGVBbW1vRmFpbHVyZVRocmVzaG9sZH1gIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgIDogdGhpcy50cmFuc2xhdGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnV0VBUE9OX1JFTE9BRC5GZWF0dXJlcy5SZWxvYWRhYmxlV2VhcG9uQXR0YWNrLk1pc2ZpcmVOYXRPbmUnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBjYXJkQ29udGVudEVsZW1lbnQgPVxuICAgICAgICAgICAgICAgICAgICBwYXJlbnRFbGVtZW50Py5xdWVyeVNlbGVjdG9yKCcuY2FyZC1jb250ZW50Jyk7XG4gICAgICAgICAgICAgICAgY29uc3Qgd3JhcHBlckVsZW1lbnQgPVxuICAgICAgICAgICAgICAgICAgICBjYXJkQ29udGVudEVsZW1lbnQ/LnF1ZXJ5U2VsZWN0b3IoJy53cmFwcGVyJyk7XG4gICAgICAgICAgICAgICAgd3JhcHBlckVsZW1lbnQ/Lmluc2VydEFkamFjZW50SFRNTChcbiAgICAgICAgICAgICAgICAgICAgJ2JlZm9yZWVuZCcsXG4gICAgICAgICAgICAgICAgICAgIGA8cD4ke2NyaXRpY2FsRmFpbHVyZU1zZ308L3A+YFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEFkZCBjYXJkIGJ1dHRvbiBjb250YWluZXIgaWYgbWlzc2luZ1xuICAgICAgICAgICAgaWYgKGl0ZW1jYXJkICYmICFhY3RpdmF0aW9uQ2FyZCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlZmVyZW5jZUVsZW1lbnQgPVxuICAgICAgICAgICAgICAgICAgICBwYXJlbnRFbGVtZW50Py5xdWVyeVNlbGVjdG9yKCcuY2FyZC1oZWFkZXInKTtcbiAgICAgICAgICAgICAgICBjb25zdCBidXR0b25Db250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgICAgICBidXR0b25Db250YWluZXIuY2xhc3NOYW1lID0gJ2NhcmQtYnV0dG9ucyc7XG4gICAgICAgICAgICAgICAgcmVmZXJlbmNlRWxlbWVudD8uYWZ0ZXIoYnV0dG9uQ29udGFpbmVyKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgY2FyZEJ1dHRvbnNFbGVtZW50ID1cbiAgICAgICAgICAgICAgICBwYXJlbnRFbGVtZW50Py5xdWVyeVNlbGVjdG9yKCcuY2FyZC1idXR0b25zJyk7XG5cbiAgICAgICAgICAgIC8vIEFkZCBNaXNmaXJlIGJ1dHRvblxuICAgICAgICAgICAgaWYgKGNoZWNrTWlzZmlyZSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1pc2ZpcmVCdG4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgICAgICAgICAgICAgICBtaXNmaXJlQnRuLm9uY2xpY2sgPSB0aGlzLm9uQ2xpY2tNaXNmaXJlLmJpbmQodGhpcyk7XG4gICAgICAgICAgICAgICAgbWlzZmlyZUJ0bi5pbm5lckhUTUwgPSBgJHt0aGlzLm1ha2VJY29uKCdmYS1idXJzdCcpfSR7dGhpcy50cmFuc2xhdGUoXG4gICAgICAgICAgICAgICAgICAgICdXRUFQT05fUkVMT0FELkZlYXR1cmVzLlJlbG9hZGFibGVXZWFwb25BdHRhY2suTWlzZmlyZWRCdG5UeHQnXG4gICAgICAgICAgICAgICAgKX1gO1xuICAgICAgICAgICAgICAgIGNhcmRCdXR0b25zRWxlbWVudD8uYXBwZW5kKG1pc2ZpcmVCdG4pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBBZGQgYW1tbyByZWZ1bmQgYnV0dG9uXG4gICAgICAgICAgICBjb25zdCByZWZ1bmRCdG4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgICAgICAgICAgIHJlZnVuZEJ0bi5vbmNsaWNrID0gdGhpcy5vbkNsaWNrUmVmdW5kLmJpbmQodGhpcyk7XG4gICAgICAgICAgICByZWZ1bmRCdG4uaW5uZXJIVE1MID0gYCR7dGhpcy5tYWtlSWNvbignZmEtdW5kbycpfSR7dGhpcy50cmFuc2xhdGUoXG4gICAgICAgICAgICAgICAgJ1dFQVBPTl9SRUxPQUQuRmVhdHVyZXMuUmVsb2FkYWJsZVdlYXBvbkF0dGFjay5SZWZ1bmRCdG5UeHQnXG4gICAgICAgICAgICApfWA7XG4gICAgICAgICAgICBjYXJkQnV0dG9uc0VsZW1lbnQ/LmFwcGVuZChyZWZ1bmRCdG4pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0TmV4dFJvdW5kKCk6IERuZEl0ZW01ZSB7XG4gICAgICAgIGNvbnN0IGNoYXJhY3RlciA9IHRoaXMuY2hhcmFjdGVyO1xuICAgICAgICBjb25zdCB3ZWFwb24gPSB0aGlzLndlYXBvbjtcblxuICAgICAgICBjb25zdCBsb2Fkb3V0ID0gdGhpcy5sb2Fkb3V0O1xuICAgICAgICBsb2Fkb3V0LnB1c2goJ0VtcHR5Jyk7XG4gICAgICAgIGNvbnN0IG5leHRSb3VuZCA9IGxvYWRvdXQuc2hpZnQoKTtcblxuICAgICAgICAvLyBSZW1vdmUgdGhlIGJ1bGxldCBmcm9tIHRoZSByZWxvYWRhYmxlV2VhcG9uIGFtbXVuaXRpb25cbiAgICAgICAgd2VhcG9uLnNldEZsYWcodGhpcy5tb2R1bGVNYW5hZ2VyLmlkLCAnY2hhbWJlcmVkJywgbG9hZG91dCk7XG5cbiAgICAgICAgY29uc3QgaW52ZW50b3J5QW1tdW5pdGlvbiA9IHRoaXMuYW1tdW5pdGlvbihcbiAgICAgICAgICAgIGNoYXJhY3Rlci5pdGVtc1xuICAgICAgICApIGFzIERuZEl0ZW01ZVtdO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgaW52ZW50b3J5QW1tdW5pdGlvbi5maW5kKChhbW1vOiBEbmRJdGVtNWUpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBuYW1lID0gYW1tby5uYW1lO1xuICAgICAgICAgICAgICAgIGlmIChuYW1lID09IG5leHRSb3VuZCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYW1tbztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9KSB8fCAoeyBuYW1lOiAnRW1wdHknIH0gYXMgRG5kSXRlbTVlKVxuICAgICAgICApO1xuICAgIH1cblxuICAgIGRyeWZpcmVXZWFwb24oKSB7XG4gICAgICAgIGNvbnN0IGNoYXJhY3RlciA9IHRoaXMuY2hhcmFjdGVyO1xuICAgICAgICBjb25zdCB3ZWFwb24gPSB0aGlzLndlYXBvbjtcblxuICAgICAgICBjb25zdCByZW5kZXJIb29rSWQgPSBIb29rcy5vbihcbiAgICAgICAgICAgICdyZW5kZXJDaGF0TWVzc2FnZScsXG4gICAgICAgICAgICAoX2NoYXRJdGVtLCBodG1sKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVsb2FkQnRuID0gaHRtbFswXS5xdWVyeVNlbGVjdG9yKCcucmVsb2FkLWFtbW8nKTtcbiAgICAgICAgICAgICAgICByZWxvYWRCdG4/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbG9hZChjaGFyYWN0ZXIsIHdlYXBvbik7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBpZiAocmVsb2FkQnRuKSB7XG4gICAgICAgICAgICAgICAgICAgIEhvb2tzLm9mZigncmVuZGVyQ2hhdE1lc3NhZ2UnLCByZW5kZXJIb29rSWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcblxuICAgICAgICBjb25zdCB0ZW1wbGF0ZURhdGE6IEFjdGl2aXR5Q2FyZENoYXRUeXBlID0ge1xuICAgICAgICAgICAgZGVzY3JpcHRpb246IHtcbiAgICAgICAgICAgICAgICBjaGF0OiBgPHA+JHt0aGlzLnRyYW5zbGF0ZShcbiAgICAgICAgICAgICAgICAgICAgJ1dFQVBPTl9SRUxPQUQuRmVhdHVyZXMuUmVsb2FkYWJsZVdlYXBvbkF0dGFjay5EcnlGaXJlRGVzY3JpcHRpb24nLFxuICAgICAgICAgICAgICAgICAgICB7IG5hbWU6IGNoYXJhY3Rlci5uYW1lLCByZWxvYWRhYmxlV2VhcG9uOiB3ZWFwb24ubmFtZSB9LFxuICAgICAgICAgICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICAgICAgKX08L3A+YCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBpdGVtOiB7XG4gICAgICAgICAgICAgICAgaW1nOiB3ZWFwb24uaW1nLFxuICAgICAgICAgICAgICAgIG5hbWU6IHRoaXMudHJhbnNsYXRlKFxuICAgICAgICAgICAgICAgICAgICAnV0VBUE9OX1JFTE9BRC5GZWF0dXJlcy5SZWxvYWRhYmxlV2VhcG9uQXR0YWNrLkRyeUZpcmVUaXRsZSdcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHN1YnRpdGxlOiB3ZWFwb24ubmFtZSxcbiAgICAgICAgICAgIGJ1dHRvbnM6IFtcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGFzZXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZpc2liaWxpdHk6ICdhbGwnLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBpY29uOiB0aGlzLm1ha2VJY29uKCdmYS1yb3RhdGUtcmlnaHQnKSxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6IHRoaXMudHJhbnNsYXRlKCdXRUFQT05fUkVMT0FELkZlYXR1cmVzLlJlbG9hZC5UZXh0JyksXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzZXM6ICdyZWxvYWQtYW1tbycsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5yZW5kZXJDYXJkKHRlbXBsYXRlRGF0YSwgY2hhcmFjdGVyKTtcbiAgICB9XG5cbiAgICBhc3luYyByZW5kZXJDYXJkKHRlbXBsYXRlRGF0YTogQWN0aXZpdHlDYXJkQ2hhdFR5cGUsIGNoYXJhY3RlcjogQWN0b3I1ZSkge1xuICAgICAgICBjb25zdCBodG1sVGVtcGxhdGUgPSBhd2FpdCAoXG4gICAgICAgICAgICBmb3VuZHJ5LmFwcGxpY2F0aW9ucyBhcyBhbnlcbiAgICAgICAgKS5oYW5kbGViYXJzLnJlbmRlclRlbXBsYXRlKFxuICAgICAgICAgICAgJ21vZHVsZXMvZnZ0dC13ZWFwb24tcmVsb2FkL3RlbXBsYXRlcy9hY3Rpdml0eS1jYXJkLmhicycsXG4gICAgICAgICAgICB0ZW1wbGF0ZURhdGFcbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy5tb2R1bGVNYW5hZ2VyLnVpTWFuYWdlci5zZW5kQ2hhdChjaGFyYWN0ZXIsIGh0bWxUZW1wbGF0ZSk7XG4gICAgfVxuXG4gICAgZmlyZVJvdW5kKGJ1bGxldDogRG5kSXRlbTVlKSB7XG4gICAgICAgIGNvbnN0IHJlbG9hZGFibGVXZWFwb24gPSB0aGlzLndlYXBvbjtcbiAgICAgICAgY29uc3QgbWF4U2hvdHMgPSByZWxvYWRhYmxlV2VhcG9uLnN5c3RlbS51c2VzLm1heDtcbiAgICAgICAgY29uc3QgZmlyZWRMb2Fkb3V0ID1cbiAgICAgICAgICAgIChyZWxvYWRhYmxlV2VhcG9uLmdldEZsYWcoXG4gICAgICAgICAgICAgICAgdGhpcy5tb2R1bGVNYW5hZ2VyLmlkLFxuICAgICAgICAgICAgICAgICdmaXJlZCdcbiAgICAgICAgICAgICkgYXMgc3RyaW5nW10pIHx8IG5ldyBBcnJheShtYXhTaG90cykuZmlsbCgnRW1wdHknKTtcblxuICAgICAgICBmaXJlZExvYWRvdXQudW5zaGlmdChidWxsZXQubmFtZSk7XG4gICAgICAgIGZpcmVkTG9hZG91dC5zcGxpY2UoLTEpO1xuICAgICAgICByZWxvYWRhYmxlV2VhcG9uLnNldEZsYWcodGhpcy5tb2R1bGVNYW5hZ2VyLmlkLCAnZmlyZWQnLCBmaXJlZExvYWRvdXQpO1xuXG4gICAgICAgIGNvbnN0IHVzZXMgPSByZWxvYWRhYmxlV2VhcG9uLnN5c3RlbS51c2VzO1xuICAgICAgICBjb25zdCBxdHk6IG51bWJlciA9XG4gICAgICAgICAgICB1c2VzLnNwZW50ICsgMSA8PSB1c2VzLm1heCA/IHVzZXMuc3BlbnQgKyAxIDogdXNlcy5tYXg7XG5cbiAgICAgICAgcmVsb2FkYWJsZVdlYXBvbi51cGRhdGUoe1xuICAgICAgICAgICAgJ3N5c3RlbS51c2VzLnNwZW50JzogcXR5LFxuICAgICAgICAgICAgJ3N5c3RlbS51c2VzLnZhbHVlJzogdXNlcy5tYXggLSBxdHksXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChidWxsZXQubmFtZSAhPT0gJ0VtcHR5Jykge1xuICAgICAgICAgICAgYnVsbGV0LnVzZSgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHJlbG9hZChhY3RvcjogQWN0b3I1ZSwgcmVsb2FkYWJsZVdlYXBvbjogRG5kSXRlbTVlKSB7XG4gICAgICAgIHRoaXMuZmVhdHVyZU1hbmFnZXJcbiAgICAgICAgICAgIC5nZXRGZWF0dXJlKCdyZWxvYWQnKVxuICAgICAgICAgICAgLm9uUmVsb2FkQ2FsbGJhY2soYWN0b3IsIHJlbG9hZGFibGVXZWFwb24pO1xuICAgIH1cblxuICAgIGFzeW5jIG9uQ2xpY2tSZWZ1bmQoKSB7XG4gICAgICAgIGNvbnN0IGFjdG9yID0gdGhpcy5jaGFyYWN0ZXI7XG4gICAgICAgIGNvbnN0IHJlbG9hZGFibGVXZWFwb24gPSB0aGlzLndlYXBvbjtcbiAgICAgICAgY29uc3QgaW52ZW50b3J5QW1tdW5pdGlvbiA9IHRoaXMuYW1tdW5pdGlvbihhY3Rvci5pdGVtcyk7XG5cbiAgICAgICAgY29uc3QgZmlyZWQgPSB0aGlzLmZpcmVkO1xuICAgICAgICBjb25zdCByZWZ1bmQ6IHN0cmluZyA9IGZpcmVkLnNwbGljZSgwLCAxKVswXSBhcyBzdHJpbmc7XG4gICAgICAgIGZpcmVkLnB1c2goJ0VtcHR5Jyk7XG5cbiAgICAgICAgaWYgKHJlZnVuZCA9PSAnRW1wdHknKSB7XG4gICAgICAgICAgICAvLyBOb3RpZnkgdGhlIHVzZXIgdGhhdCB0aGVyZSBpcyBubyBhbW11bml0aW9uIHRvIHJlZnVuZFxuICAgICAgICAgICAgdGhpcy5tb2R1bGVNYW5hZ2VyLnVpTWFuYWdlci51aU5vdGlmaWNhdGlvbihcbiAgICAgICAgICAgICAgICB0aGlzLnRyYW5zbGF0ZShcbiAgICAgICAgICAgICAgICAgICAgJ1dFQVBPTl9SRUxPQUQuRmVhdHVyZXMuUmVsb2FkYWJsZVdlYXBvbkF0dGFjay5SZWZ1bmQuUmVmdW5kTm9Nb3JlTXNnJyxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogYWN0b3IubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbG9hZGFibGVXZWFwb246IHJlbG9hZGFibGVXZWFwb24ubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgdHJ1ZVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgJ3dhcm4nXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgYXdhaXQgcmVsb2FkYWJsZVdlYXBvbi5zZXRGbGFnKHRoaXMubW9kdWxlTWFuYWdlci5pZCwgJ2ZpcmVkJywgZmlyZWQpO1xuXG4gICAgICAgIGxldCBidWxsZXQgPSB7IG5hbWU6IHJlZnVuZCB9IGFzIERuZEl0ZW01ZTtcbiAgICAgICAgaW52ZW50b3J5QW1tdW5pdGlvbi5mb3JFYWNoKChhbW1vOiBJdGVtNWUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5hbWUgPSBhbW1vLm5hbWU7XG4gICAgICAgICAgICBpZiAobmFtZSA9PSByZWZ1bmQpIHtcbiAgICAgICAgICAgICAgICBidWxsZXQgPSBhbW1vIGFzIERuZEl0ZW01ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gUmVmdW5kIHRoZSBub24tRW1wdHkgYW1tdW5pdGlvblxuICAgICAgICBjb25zdCBhbW1vTG9hZG91dCA9IHRoaXMubG9hZG91dDtcbiAgICAgICAgYW1tb0xvYWRvdXQudW5zaGlmdChyZWZ1bmQpO1xuICAgICAgICBhbW1vTG9hZG91dC5zcGxpY2UoLTEpO1xuICAgICAgICBhd2FpdCByZWxvYWRhYmxlV2VhcG9uLnNldEZsYWcoXG4gICAgICAgICAgICB0aGlzLm1vZHVsZU1hbmFnZXIuaWQsXG4gICAgICAgICAgICAnY2hhbWJlcmVkJyxcbiAgICAgICAgICAgIGFtbW9Mb2Fkb3V0XG4gICAgICAgICk7XG5cbiAgICAgICAgLy8gVXBkYXRlIHRoZSByZWxvYWRhYmxlV2VhcG9uIHVzZXNcbiAgICAgICAgY29uc3QgdXNlcyA9IHJlbG9hZGFibGVXZWFwb24uc3lzdGVtLnVzZXM7XG4gICAgICAgIGNvbnN0IHF0eTogbnVtYmVyID0gdXNlcy5zcGVudCAtIDEgPj0gMCA/IHVzZXMuc3BlbnQgLSAxIDogMDtcbiAgICAgICAgcmVsb2FkYWJsZVdlYXBvbi51cGRhdGUoe1xuICAgICAgICAgICAgJ3N5c3RlbS51c2VzLnNwZW50JzogcXR5LFxuICAgICAgICAgICAgJ3N5c3RlbS51c2VzLnZhbHVlJzogdXNlcy5tYXggLSBxdHksXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIE5vdGlmeSB0aGUgdXNlciB0aGF0IHRoZSByZWZ1bmQgd2FzIGEgc3VjY2Vzc1xuICAgICAgICBjb25zdCBodG1sVGVtcGxhdGUgPSBhd2FpdCAoXG4gICAgICAgICAgICBmb3VuZHJ5LmFwcGxpY2F0aW9ucyBhcyBhbnlcbiAgICAgICAgKS5oYW5kbGViYXJzLnJlbmRlclRlbXBsYXRlKFxuICAgICAgICAgICAgJ21vZHVsZXMvZnZ0dC13ZWFwb24tcmVsb2FkL3RlbXBsYXRlcy9hbW1vUmVmdW5kTm90aWNlVGVtcGxhdGUuaGJzJyxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBpdGVtOiB7XG4gICAgICAgICAgICAgICAgICAgIGltZzogYnVsbGV0LmltZyxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogYnVsbGV0Lm5hbWUsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogdGhpcy50cmFuc2xhdGUoXG4gICAgICAgICAgICAgICAgICAgICdXRUFQT05fUkVMT0FELkZlYXR1cmVzLlJlbG9hZGFibGVXZWFwb25BdHRhY2suUmVmdW5kLlJlZnVuZENvbXBsZXRlTXNnJyxcbiAgICAgICAgICAgICAgICAgICAgeyBidWxsZXQ6IHJlZnVuZCwgbmFtZTogcmVsb2FkYWJsZVdlYXBvbi5uYW1lIH0sXG4gICAgICAgICAgICAgICAgICAgIHRydWVcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIHRpdGxlOiB0aGlzLnRyYW5zbGF0ZShcbiAgICAgICAgICAgICAgICAgICAgJ1dFQVBPTl9SRUxPQUQuRmVhdHVyZXMuUmVsb2FkYWJsZVdlYXBvbkF0dGFjay5SZWZ1bmQuUmVmdW5kQ29tcGxldGVUaXRsZSdcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgfVxuICAgICAgICApO1xuICAgICAgICB0aGlzLm1vZHVsZU1hbmFnZXIudWlNYW5hZ2VyLnNlbmRDaGF0KGFjdG9yLCBodG1sVGVtcGxhdGUpO1xuICAgIH1cblxuICAgIGFzeW5jIG9uQ2xpY2tNaXNmaXJlKCkge1xuICAgICAgICBjb25zdCBhY3RvciA9IHRoaXMuY2hhcmFjdGVyO1xuICAgICAgICBjb25zdCByb2xsID0gYXdhaXQgbmV3IFJvbGwoJzFkNicpLnJvbGwoKTtcbiAgICAgICAgYXdhaXQgcm9sbC50b01lc3NhZ2Uoe1xuICAgICAgICAgICAgc3BlYWtlcjoge1xuICAgICAgICAgICAgICAgIGFsaWFzOiBhY3Rvci5uYW1lLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgbWFrZUljb24oaWNvbjogc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiBgPGkgY2xhc3M9XCJmYXMgJHtpY29ufVwiPjwvaT5gO1xuICAgIH1cblxuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gJ2NsYXNzIFJlbG9hZGFibGVXZWFwb25BdHRhY2tGZWF0dXJlJztcbiAgICB9XG59XG4iLCJpbXBvcnQgRmVhdHVyZU1hbmFnZXIgZnJvbSAnLi4vbWFuYWdlcnMvRmVhdHVyZU1hbmFnZXInO1xuaW1wb3J0IEJhc2VGZWF0dXJlIGZyb20gJy4vQmFzZUZlYXR1cmUnO1xuaW1wb3J0IHsgRG5kSXRlbTVlIH0gZnJvbSAnLi4vdHlwZXMnO1xuXG5leHBvcnQgY2xhc3MgUmVsb2FkYWJsZVdlYXBvbkNyZWF0aW9uRmVhdHVyZSBleHRlbmRzIEJhc2VGZWF0dXJlIHtcbiAgICBwcml2YXRlIF9jcmVhdGluZ1JlbG9hZGFibGVXZWFwb246IGJvb2xlYW47XG4gICAgcHJpdmF0ZSBfY3JlYXRlSXRlbUhvb2tJZDogbnVtYmVyO1xuXG4gICAgY29uc3RydWN0b3IoZmVhdHVyZU1hbmFnZXI6IEZlYXR1cmVNYW5hZ2VyKSB7XG4gICAgICAgIHN1cGVyKGZlYXR1cmVNYW5hZ2VyKTtcbiAgICAgICAgdGhpcy5fY3JlYXRpbmdSZWxvYWRhYmxlV2VhcG9uID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX2NyZWF0ZUl0ZW1Ib29rSWQgPSAtMTtcbiAgICB9XG5cbiAgICBpbml0KCkge1xuICAgICAgICBIb29rcy5vbigncHJlQ3JlYXRlSXRlbScsIHRoaXMub25QcmVDcmVhdGVJdGVtLmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIGFzeW5jIG9uUHJlQ3JlYXRlSXRlbShpdGVtOiBEbmRJdGVtNWUpIHtcbiAgICAgICAgaWYgKGl0ZW0uc3lzdGVtLnR5cGUuYmFzZUl0ZW0gPT0gJ3JlbG9hZGFibGVXZWFwb24nKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnV2VhcG9uIFJlbG9hZCB8IFRyaWdnZXJlZCBQcmUtQ3JlYXRpb24nKTtcblxuICAgICAgICAgICAgdGhpcy53ZWFwb25JZCA9IGl0ZW0uaWQ7XG4gICAgICAgICAgICB0aGlzLmNoYXJhY3RlcklkID0gaXRlbS5hY3Rvcj8uaWQgYXMgc3RyaW5nO1xuICAgICAgICAgICAgdGhpcy5fY3JlYXRpbmdSZWxvYWRhYmxlV2VhcG9uID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuX2NyZWF0ZUl0ZW1Ib29rSWQgPSBIb29rcy5vbihcbiAgICAgICAgICAgICAgICAnY3JlYXRlSXRlbScsXG4gICAgICAgICAgICAgICAgdGhpcy5vbkNyZWF0ZUl0ZW0uYmluZCh0aGlzKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFzeW5jIG9uQ3JlYXRlSXRlbShpdGVtOiBEbmRJdGVtNWUpIHtcbiAgICAgICAgaWYgKCF0aGlzLl9jcmVhdGluZ1JlbG9hZGFibGVXZWFwb24gfHwgaXRlbS5pZCAhPT0gdGhpcy53ZWFwb25JZClcbiAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICBjb25zb2xlLmxvZygnV2VhcG9uIFJlbG9hZCB8IFRyaWdnZXJlZCBSZWxvYWRhYmxlV2VhcG9uIENyZWF0aW9uJyk7XG5cbiAgICAgICAgY29uc3QgcmVsb2FkYWJsZVdlYXBvbiA9IHRoaXMud2VhcG9uO1xuICAgICAgICBjb25zdCBhbW1vUXR5ID0gcmVsb2FkYWJsZVdlYXBvbi5zeXN0ZW0udXNlcy5tYXg7XG5cbiAgICAgICAgYXdhaXQgcmVsb2FkYWJsZVdlYXBvbi51cGRhdGUoe1xuICAgICAgICAgICAgJ3N5c3RlbS51c2VzLnNwZW50JzogYW1tb1F0eSxcbiAgICAgICAgICAgICdzeXN0ZW0udXNlcy52YWx1ZSc6IDAsXG4gICAgICAgIH0pO1xuICAgICAgICBhd2FpdCByZWxvYWRhYmxlV2VhcG9uLnNldEZsYWcoXG4gICAgICAgICAgICB0aGlzLm1vZHVsZU1hbmFnZXIuaWQsXG4gICAgICAgICAgICAnY2hhbWJlcmVkJyxcbiAgICAgICAgICAgIG5ldyBBcnJheShhbW1vUXR5KS5maWxsKCdFbXB0eScpXG4gICAgICAgICk7XG4gICAgICAgIGF3YWl0IHJlbG9hZGFibGVXZWFwb24uc2V0RmxhZyhcbiAgICAgICAgICAgIHRoaXMubW9kdWxlTWFuYWdlci5pZCxcbiAgICAgICAgICAgICdmaXJlZCcsXG4gICAgICAgICAgICBuZXcgQXJyYXkoYW1tb1F0eSkuZmlsbCgnRW1wdHknKVxuICAgICAgICApO1xuXG4gICAgICAgIHRoaXMud2VhcG9uSWQgPSAnJztcbiAgICAgICAgdGhpcy5jaGFyYWN0ZXJJZCA9ICcnO1xuICAgICAgICB0aGlzLl9jcmVhdGluZ1JlbG9hZGFibGVXZWFwb24gPSBmYWxzZTtcbiAgICAgICAgSG9va3Mub2ZmKCdjcmVhdGVJdGVtJywgdGhpcy5fY3JlYXRlSXRlbUhvb2tJZCk7XG4gICAgICAgIHRoaXMuX2NyZWF0ZUl0ZW1Ib29rSWQgPSAtMTtcbiAgICB9XG5cbiAgICB0b1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuICdjbGFzcyBSZWxvYWRhYmxlV2VhcG9uQ3JlYXRpb25GZWF0dXJlJztcbiAgICB9XG59XG4iLCJleHBvcnQgeyBOZXh0Um91bmRGZWF0dXJlIH0gZnJvbSAnLi9OZXh0Um91bmRGZWF0dXJlJztcbmV4cG9ydCB7IFJlbG9hZGFibGVXZWFwb25BdHRhY2tGZWF0dXJlIH0gZnJvbSAnLi9SZWxvYWRhYmxlV2VhcG9uQXR0YWNrRmVhdHVyZSc7XG5leHBvcnQgeyBSZWxvYWRhYmxlV2VhcG9uQ3JlYXRpb25GZWF0dXJlIH0gZnJvbSAnLi9SZWxvYWRhYmxlV2VhcG9uQ3JlYXRpb25GZWF0dXJlJztcbmV4cG9ydCB7IFJlbG9hZEZlYXR1cmUgfSBmcm9tICcuL1JlbG9hZEZlYXR1cmUnO1xuIiwiaW1wb3J0IE1vZHVsZU1hbmFnZXIgZnJvbSAnLi9Nb2R1bGVNYW5hZ2VyJztcbmltcG9ydCB7XG4gICAgTmV4dFJvdW5kRmVhdHVyZSxcbiAgICBSZWxvYWRhYmxlV2VhcG9uQXR0YWNrRmVhdHVyZSxcbiAgICBSZWxvYWRhYmxlV2VhcG9uQ3JlYXRpb25GZWF0dXJlLFxuICAgIFJlbG9hZEZlYXR1cmUsXG59IGZyb20gJy4uL2ZlYXR1cmVzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRmVhdHVyZU1hbmFnZXIge1xuICAgIHByaXZhdGUgX21vZHVsZU1hbmFnZXI6IE1vZHVsZU1hbmFnZXI7XG4gICAgcHJpdmF0ZSBfZmVhdHVyZXM6IHsgW2tleTogc3RyaW5nXTogYW55IH07XG5cbiAgICBjb25zdHJ1Y3Rvcihtb2R1bGVNYW5hZ2VyOiBNb2R1bGVNYW5hZ2VyKSB7XG4gICAgICAgIHRoaXMuX21vZHVsZU1hbmFnZXIgPSBtb2R1bGVNYW5hZ2VyO1xuICAgICAgICB0aGlzLl9mZWF0dXJlcyA9IHt9O1xuICAgIH1cblxuICAgIGluaXQoKSB7XG4gICAgICAgIHRoaXMuX2ZlYXR1cmVzID0ge1xuICAgICAgICAgICAgbmV4dFJvdW5kOiBuZXcgTmV4dFJvdW5kRmVhdHVyZSh0aGlzKSxcbiAgICAgICAgICAgIHJlbG9hZDogbmV3IFJlbG9hZEZlYXR1cmUodGhpcyksXG4gICAgICAgICAgICByZWxvYWRhYmxlV2VhcG9uQXR0YWNrOiBuZXcgUmVsb2FkYWJsZVdlYXBvbkF0dGFja0ZlYXR1cmUodGhpcyksXG4gICAgICAgICAgICByZWxvYWRhYmxlV2VhcG9uQ3JlYXRpb246IG5ldyBSZWxvYWRhYmxlV2VhcG9uQ3JlYXRpb25GZWF0dXJlKHRoaXMpLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGdldEZlYXR1cmUoaWQ6IHN0cmluZykge1xuICAgICAgICBpZiAodGhpcy5fZmVhdHVyZXNbaWRdKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZmVhdHVyZXNbaWRdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGdldCBtb2R1bGVNYW5hZ2VyKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fbW9kdWxlTWFuYWdlcjtcbiAgICB9XG5cbiAgICB0b1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuIGBjbGFzcyBGZWF0dXJlTWFuYWdlcjogJHt0aGlzLl9mZWF0dXJlcy5sZW5ndGh9YDtcbiAgICB9XG59XG4iLCJpbXBvcnQgRmVhdHVyZU1hbmFnZXIgZnJvbSAnLi9GZWF0dXJlTWFuYWdlcic7XG5pbXBvcnQgVWlNYW5hZ2VyIGZyb20gJy4vVWlNYW5hZ2VyJztcbmltcG9ydCBUZW1wbGF0ZU1hbmFnZXIgZnJvbSAnLi9UZW1wbGF0ZU1hbmFnZXInO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNb2R1bGVNYW5hZ2VyIHtcbiAgICBwcml2YXRlIF9tb2R1bGVJZDogc3RyaW5nO1xuICAgIHByaXZhdGUgX2ZlYXR1cmVNYW5hZ2VyOiBGZWF0dXJlTWFuYWdlcjtcbiAgICBwcml2YXRlIF91aU1hbmFnZXI6IFVpTWFuYWdlcjtcbiAgICBwcml2YXRlIF90ZW1wbGF0ZU1hbmFnZXI6IFRlbXBsYXRlTWFuYWdlcjtcblxuICAgIGNvbnN0cnVjdG9yKGlkOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5fbW9kdWxlSWQgPSBpZDtcbiAgICAgICAgdGhpcy5fZmVhdHVyZU1hbmFnZXIgPSBuZXcgRmVhdHVyZU1hbmFnZXIodGhpcyk7XG4gICAgICAgIHRoaXMuX3VpTWFuYWdlciA9IG5ldyBVaU1hbmFnZXIodGhpcyk7XG4gICAgICAgIHRoaXMuX3RlbXBsYXRlTWFuYWdlciA9IG5ldyBUZW1wbGF0ZU1hbmFnZXIoKTtcbiAgICB9XG5cbiAgICBnZXQgaWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9tb2R1bGVJZDtcbiAgICB9XG5cbiAgICBnZXQgZmVhdHVyZU1hbmFnZXIoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9mZWF0dXJlTWFuYWdlcjtcbiAgICB9XG5cbiAgICBnZXQgdWlNYW5hZ2VyKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fdWlNYW5hZ2VyO1xuICAgIH1cblxuICAgIGdldCB0ZW1wbGF0ZU1hbmFnZXIoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl90ZW1wbGF0ZU1hbmFnZXI7XG4gICAgfVxuXG4gICAgaW5pdCgpIHtcbiAgICAgICAgdGhpcy5zeXN0ZW1PdmVycmlkZXMoKTtcbiAgICAgICAgdGhpcy5tb2R1bGVDb25maWd1cmF0aW9ucygpO1xuICAgICAgICB0aGlzLl9mZWF0dXJlTWFuYWdlci5pbml0KCk7XG4gICAgICAgIHRoaXMuX3RlbXBsYXRlTWFuYWdlci5pbml0KCk7XG4gICAgfVxuXG4gICAgc3lzdGVtT3ZlcnJpZGVzKCkge1xuICAgICAgICAoQ09ORklHIGFzIGFueSkuRE5ENUUuZmVhdHVyZVR5cGVzLml0ZW0gPSB7XG4gICAgICAgICAgICBsYWJlbDogdGhpcy51aU1hbmFnZXIuZ2V0TG9jYWxpemVkVHh0KCdXRUFQT05fUkVMT0FELkl0ZW1GZWF0dXJlJyksXG4gICAgICAgIH07XG5cbiAgICAgICAgKENPTkZJRyBhcyBhbnkpLkRORDVFLml0ZW1Qcm9wZXJ0aWVzLmNvbmNlYWxhYmxlID0ge1xuICAgICAgICAgICAgbGFiZWw6IHRoaXMudWlNYW5hZ2VyLmdldExvY2FsaXplZFR4dCgnV0VBUE9OX1JFTE9BRC5Db25jZWFsYWJsZScpLFxuICAgICAgICB9O1xuICAgICAgICAoQ09ORklHIGFzIGFueSkuRE5ENUUudmFsaWRQcm9wZXJ0aWVzLndlYXBvbi5hZGQoJ2NvbmNlYWxhYmxlJyk7XG5cbiAgICAgICAgKENPTkZJRyBhcyBhbnkpLkRORDVFLml0ZW1Qcm9wZXJ0aWVzLnVuc3RhYmxlID0ge1xuICAgICAgICAgICAgbGFiZWw6IHRoaXMudWlNYW5hZ2VyLmdldExvY2FsaXplZFR4dCgnV0VBUE9OX1JFTE9BRC5VbnN0YWJsZScpLFxuICAgICAgICAgICAgaXNQaHlzaWNhbDogdHJ1ZSxcbiAgICAgICAgfTtcblxuICAgICAgICAoQ09ORklHIGFzIGFueSkuRE5ENUUud2VhcG9uSWRzLnJlbG9hZGFibGVXZWFwb24gPVxuICAgICAgICAgICAgJ0NvbXBlbmRpdW0uZnZ0dC13ZWFwb24tcmVsb2FkLml0ZW0tcGFjay5JdGVtLmxFNjBRYVMxc2N0YjNPQWQnO1xuICAgIH1cblxuICAgIG1vZHVsZUNvbmZpZ3VyYXRpb25zKCkge1xuICAgICAgICBjb25zdCBtb2R1bGVOYW1lID0gJ2Z2dHQtd2VhcG9uLXJlbG9hZCc7XG5cbiAgICAgICAgZ2FtZS5zZXR0aW5ncy5yZWdpc3Rlcihtb2R1bGVOYW1lLCAndW5zdGFibGVBbW1vJywge1xuICAgICAgICAgICAgc2NvcGU6ICd3b3JsZCcsXG4gICAgICAgICAgICBuYW1lOiAnU0VUVElOR1MuV0VBUE9OX1JFTE9BRC5VbnN0YWJsZUFtbW8uTmFtZScsXG4gICAgICAgICAgICBoaW50OiAnU0VUVElOR1MuV0VBUE9OX1JFTE9BRC5VbnN0YWJsZUFtbW8uSGludCcsXG4gICAgICAgICAgICB0eXBlOiBCb29sZWFuLFxuICAgICAgICAgICAgY29uZmlnOiB0cnVlLFxuICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZ2FtZS5zZXR0aW5ncy5yZWdpc3Rlcihtb2R1bGVOYW1lLCAndW5zdGFibGVBbW1vRmFpbHVyZVRocmVzaGhvbGQnLCB7XG4gICAgICAgICAgICBzY29wZTogJ3dvcmxkJyxcbiAgICAgICAgICAgIG5hbWU6ICdTRVRUSU5HUy5XRUFQT05fUkVMT0FELlVuc3RhYmxlQW1tb0ZhaWx1cmVUaHJlc2hvbGQuTmFtZScsXG4gICAgICAgICAgICBoaW50OiAnU0VUVElOR1MuV0VBUE9OX1JFTE9BRC5VbnN0YWJsZUFtbW9GYWlsdXJlVGhyZXNob2xkLkhpbnQnLFxuICAgICAgICAgICAgdHlwZTogTnVtYmVyLFxuICAgICAgICAgICAgY29uZmlnOiB0cnVlLFxuICAgICAgICAgICAgZGVmYXVsdDogMixcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZ2FtZS5zZXR0aW5ncy5yZWdpc3Rlcihtb2R1bGVOYW1lLCAndXNlTWlzZmlyZXMnLCB7XG4gICAgICAgICAgICBzY29wZTogJ3dvcmxkJyxcbiAgICAgICAgICAgIG5hbWU6ICdTRVRUSU5HUy5XRUFQT05fUkVMT0FELlVzZU1pc2ZpcmVzLk5hbWUnLFxuICAgICAgICAgICAgaGludDogJ1NFVFRJTkdTLldFQVBPTl9SRUxPQUQuVXNlTWlzZmlyZXMuSGludCcsXG4gICAgICAgICAgICB0eXBlOiBCb29sZWFuLFxuICAgICAgICAgICAgY29uZmlnOiB0cnVlLFxuICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZ2FtZS5zZXR0aW5ncy5yZWdpc3Rlcihtb2R1bGVOYW1lLCAnZmlsdGVyQW1tdW5pdGlvbkJ5RXF1aXBwZWQnLCB7XG4gICAgICAgICAgICBzY29wZTogJ3VzZXInLFxuICAgICAgICAgICAgbmFtZTogJ1NFVFRJTkdTLldFQVBPTl9SRUxPQUQuRmlsdGVyQW1tdW5pdGlvbkJ5RXF1aXBwZWQuTmFtZScsXG4gICAgICAgICAgICBoaW50OiAnU0VUVElOR1MuV0VBUE9OX1JFTE9BRC5GaWx0ZXJBbW11bml0aW9uQnlFcXVpcHBlZC5IaW50JyxcbiAgICAgICAgICAgIHR5cGU6IEJvb2xlYW4sXG4gICAgICAgICAgICBjb25maWc6IHRydWUsXG4gICAgICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZGVidWcoaG9va3M6IGJvb2xlYW4gPSBmYWxzZSkge1xuICAgICAgICBDT05GSUcuZGVidWcuaG9va3MgPSBob29rcztcbiAgICAgICAgY29uc29sZS5sb2coJ0NPTkZJRzogJywgQ09ORklHKTtcbiAgICAgICAgY29uc29sZS5sb2coJ0NPTkZJRy5ETkQ1RTogJywgKENPTkZJRyBhcyBhbnkpLkRORDVFKTtcbiAgICB9XG5cbiAgICB0b1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuICdjbGFzcyBNb2R1bGVNYW5hZ2VyJztcbiAgICB9XG59XG4iLCJleHBvcnQgZGVmYXVsdCBjbGFzcyBUZW1wbGF0ZU1hbmFnZXIge1xuICAgIGNvbnN0cnVjdG9yKCkge31cblxuICAgIGluaXQoKSB7XG4gICAgICAgIChmb3VuZHJ5LmFwcGxpY2F0aW9ucyBhcyBhbnkpLmhhbmRsZWJhcnMubG9hZFRlbXBsYXRlcyhcbiAgICAgICAgICAgIFRlbXBsYXRlTWFuYWdlci5wYXRoc1xuICAgICAgICApO1xuICAgIH1cblxuICAgIHN0YXRpYyBnZXQgcGF0aHMoKSB7XG4gICAgICAgIGNvbnN0IHBhdGhzOiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9ID0ge307XG4gICAgICAgIGNvbnN0IHRlbXBsYXRlUGF0aHMgPSAnbW9kdWxlcy9mdnR0LXdlYXBvbi1yZWxvYWQvdGVtcGxhdGVzL3JlbG9hZGFibGVXZWFwb25SZWxvYWRUZW1wbGF0ZS5oYnMsbW9kdWxlcy9mdnR0LXdlYXBvbi1yZWxvYWQvdGVtcGxhdGVzL2Jhc2ljTWVzc2FnZS5oYnMsbW9kdWxlcy9mdnR0LXdlYXBvbi1yZWxvYWQvdGVtcGxhdGVzL2FtbW9TZWxlY3Rpb25EaWFsb2dUZW1wbGF0ZS5oYnMsbW9kdWxlcy9mdnR0LXdlYXBvbi1yZWxvYWQvdGVtcGxhdGVzL2FtbW9SZWZ1bmROb3RpY2VUZW1wbGF0ZS5oYnMsbW9kdWxlcy9mdnR0LXdlYXBvbi1yZWxvYWQvdGVtcGxhdGVzL2FjdGl2aXR5LWNhcmQuaGJzJy5zcGxpdCgnLCcpO1xuICAgICAgICBmb3IgKGNvbnN0IHBhdGggb2YgdGVtcGxhdGVQYXRocykge1xuICAgICAgICAgICAgcGF0aHNbcGF0aC5yZXBsYWNlKCcuaGJzJywgJy5odG1sJyldID0gcGF0aDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcGF0aHM7XG4gICAgfVxuXG4gICAgc3RhdGljIG9uSG90UmVsb2FkKCkge1xuICAgICAgICBmb3IgKGNvbnN0IHRlbXBsYXRlIGluIF90ZW1wbGF0ZUNhY2hlKSB7XG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKF90ZW1wbGF0ZUNhY2hlLCB0ZW1wbGF0ZSlcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBfdGVtcGxhdGVDYWNoZVt0ZW1wbGF0ZV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAoZm91bmRyeS5hcHBsaWNhdGlvbnMgYXMgYW55KS5oYW5kbGViYXJzXG4gICAgICAgICAgICAubG9hZFRlbXBsYXRlcyh0aGlzLnBhdGhzKVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgYXBwbGljYXRpb24gaW4gdWkud2luZG93cykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdWkud2luZG93cyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHBsaWNhdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVpLndpbmRvd3NbYXBwbGljYXRpb25dLnJlbmRlcih0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gJ2NsYXNzIFRlbXBsYXRlTWFuYWdlcic7XG4gICAgfVxufVxuIiwiaW1wb3J0IE1vZHVsZU1hbmFnZXIgZnJvbSAnLi9Nb2R1bGVNYW5hZ2VyJztcbmltcG9ydCB7IHR5cGUgRGlhbG9nT3B0aW9ucyB9IGZyb20gJy4uL3R5cGVzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVWlNYW5hZ2VyIHtcbiAgICBwcml2YXRlIF9tb2R1bGVNYW5hZ2VyOiBNb2R1bGVNYW5hZ2VyO1xuXG4gICAgY29uc3RydWN0b3IobW9kdWxlTWFuYWdlcjogTW9kdWxlTWFuYWdlcikge1xuICAgICAgICB0aGlzLl9tb2R1bGVNYW5hZ2VyID0gbW9kdWxlTWFuYWdlcjtcbiAgICB9XG5cbiAgICBnZXQgbW9kdWxlTWFuYWdlcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX21vZHVsZU1hbmFnZXI7XG4gICAgfVxuXG4gICAgYnVpbGREaWFsb2cob3B0aW9uczogRGlhbG9nT3B0aW9ucywgaWQ6IHN0cmluZykge1xuICAgICAgICByZXR1cm4gbmV3IGZvdW5kcnkuYXBwbGljYXRpb25zLmFwaS5EaWFsb2dWMih7XG4gICAgICAgICAgICB3aW5kb3c6IHtcbiAgICAgICAgICAgICAgICB0aXRsZTogb3B0aW9ucy50aXRsZSxcbiAgICAgICAgICAgICAgICBjb250ZW50Q2xhc3Nlczogb3B0aW9ucy5jb250ZW50Q2xhc3NlcyB8fCBbXSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjb250ZW50OiBvcHRpb25zLmNvbnRlbnQsXG4gICAgICAgICAgICBidXR0b25zOiBvcHRpb25zLmJ1dHRvbnMsXG4gICAgICAgICAgICBzdWJtaXQ6IG9wdGlvbnMub25TdWJtaXQsXG4gICAgICAgICAgICBpZDogaWQsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHVpTm90aWZpY2F0aW9uKG1zZzogc3RyaW5nLCB0eXBlOiBzdHJpbmcgPSAnaW5mbycpIHtcbiAgICAgICAgaWYgKHVpLm5vdGlmaWNhdGlvbnMpIHtcbiAgICAgICAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ2Vycm9yJzpcbiAgICAgICAgICAgICAgICAgICAgdWkubm90aWZpY2F0aW9ucy5lcnJvcihtc2cpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICd3YXJuJzpcbiAgICAgICAgICAgICAgICAgICAgdWkubm90aWZpY2F0aW9ucy53YXJuKG1zZyk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2luZm8nOlxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIHVpLm5vdGlmaWNhdGlvbnMuaW5mbyhtc2cpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgc2VuZENoYXQoXG4gICAgICAgIHNwZWFrZXI6IEFjdG9yNWUsXG4gICAgICAgIGNvbnRlbnQ6IHN0cmluZyxcbiAgICAgICAgZmxhdm9yPzogc3RyaW5nLFxuICAgICAgICBzb3VuZD86IHN0cmluZyxcbiAgICAgICAgd2hpc3Blcjogc3RyaW5nW10gPSBbXSxcbiAgICAgICAgdHlwZTogMCB8IDEgfCAyIHwgMyB8IDQgfCA1ID0gQ09OU1QuQ0hBVF9NRVNTQUdFX1RZUEVTLk9USEVSXG4gICAgKSB7XG4gICAgICAgIGNvbnN0IENoYXREYXRhID0ge1xuICAgICAgICAgICAgc3BlYWtlcjogQ2hhdE1lc3NhZ2UuZ2V0U3BlYWtlcih7IGFjdG9yOiBzcGVha2VyIH0pLFxuICAgICAgICAgICAgdHlwZSxcbiAgICAgICAgICAgIGZsYXZvcixcbiAgICAgICAgICAgIHNvdW5kLFxuICAgICAgICAgICAgY29udGVudCxcbiAgICAgICAgICAgIHdoaXNwZXIsXG4gICAgICAgIH07XG4gICAgICAgIENoYXRNZXNzYWdlLmNyZWF0ZShDaGF0RGF0YSk7XG4gICAgfVxuXG4gICAgZ2V0TG9jYWxpemVkVHh0KFxuICAgICAgICBrZXk6IHN0cmluZyxcbiAgICAgICAgb3B0cz86IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH0sXG4gICAgICAgIGZvcm1hdDogYm9vbGVhbiA9IGZhbHNlXG4gICAgKSB7XG4gICAgICAgIGlmIChmb3JtYXQpIHtcbiAgICAgICAgICAgIHJldHVybiAoZ2FtZSBhcyBhbnkpLmkxOG4uZm9ybWF0KGtleSwgb3B0cyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIChnYW1lIGFzIGFueSkuaTE4bi5sb2NhbGl6ZShrZXksIG9wdHMpO1xuICAgIH1cblxuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gJ2NsYXNzIFVpTWFuYWdlcic7XG4gICAgfVxufVxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiOyIsImltcG9ydCBNb2R1bGVNYW5hZ2VyIGZyb20gJy4vbW9kdWxlL21hbmFnZXJzL01vZHVsZU1hbmFnZXInO1xuaW1wb3J0IFRlbXBsYXRlTWFuYWdlciBmcm9tICcuL21vZHVsZS9tYW5hZ2Vycy9UZW1wbGF0ZU1hbmFnZXInO1xuXG5pbXBvcnQgbW9kdWxlSnNvbiBmcm9tICcuLi9tb2R1bGUuanNvbic7XG5cbkhvb2tzLm9uY2UoJ2luaXQnLCBhc3luYyAoKSA9PiB7XG4gICAgY29uc29sZS5sb2coJ1dlYXBvbiBSZWxvYWQgfCBGb3VuZHJ5IFZUVCBNb2R1bGUnKTtcblxuICAgIGNvbnN0IHdlYXBvbl9yZWxvYWQgPSBuZXcgTW9kdWxlTWFuYWdlcihtb2R1bGVKc29uLmlkKTtcbiAgICB3ZWFwb25fcmVsb2FkLmluaXQoKTtcbn0pO1xuXG5pZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdkZXZlbG9wbWVudCcpIHtcbiAgICBpZiAobW9kdWxlLmhvdCkge1xuICAgICAgICBtb2R1bGUuaG90LmFjY2VwdCgpO1xuXG4gICAgICAgIGlmIChtb2R1bGUuaG90LnN0YXR1cygpID09PSAnYXBwbHknKSB7XG4gICAgICAgICAgICBUZW1wbGF0ZU1hbmFnZXIub25Ib3RSZWxvYWQoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsImV4cG9ydCBkZWZhdWx0IF9fd2VicGFja19wdWJsaWNfcGF0aF9fICsgXCJzdHlsZXMvbW9kdWxlLmNzc1wiOyJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==