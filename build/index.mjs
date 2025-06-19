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
        const maxShots = reloadableWeapon.system.uses.max;
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
        const maxShots = reloadableWeapon.system.uses.max;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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VUM1RUQ7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7Ozs7V0N0QkE7V0FDQTtXQUNBO1dBQ0E7V0FDQSx5Q0FBeUMsd0NBQXdDO1dBQ2pGO1dBQ0E7V0FDQTs7Ozs7V0NQQTs7Ozs7V0NBQTtXQUNBO1dBQ0E7V0FDQSx1REFBdUQsaUJBQWlCO1dBQ3hFO1dBQ0EsZ0RBQWdELGFBQWE7V0FDN0Q7Ozs7O1dDTkE7Ozs7Ozs7Ozs7Ozs7OztBQ0E0RDtBQUNJO0FBRXhCO0FBRXhDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEtBQUssSUFBSSxFQUFFO0lBQzFCLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0NBQW9DLENBQUMsQ0FBQztJQUVsRCxNQUFNLGFBQWEsR0FBRyxJQUFJLHNFQUFhLENBQUMsNENBQWEsQ0FBQyxDQUFDO0lBQ3ZELGFBQWEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUN6QixDQUFDLENBQUMsQ0FBQztBQUVILElBQUksSUFBc0MsRUFBRSxDQUFDO0lBQ3pDLElBQUksS0FBVSxFQUFFO0FBQUEsRUFNZjtBQUNMLENBQUM7Ozs7Ozs7Ozs7Ozs7QUNwQkQsaUVBQWUscUJBQXVCLHNCQUFzQixFIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZnZ0dC13ZWFwb24tcmVsb2FkLy4vc3JjL21vZHVsZS9mZWF0dXJlcy9CYXNlRmVhdHVyZS50cyIsIndlYnBhY2s6Ly9mdnR0LXdlYXBvbi1yZWxvYWQvLi9zcmMvbW9kdWxlL2ZlYXR1cmVzL05leHRSb3VuZEZlYXR1cmUudHMiLCJ3ZWJwYWNrOi8vZnZ0dC13ZWFwb24tcmVsb2FkLy4vc3JjL21vZHVsZS9mZWF0dXJlcy9SZWxvYWRGZWF0dXJlLnRzIiwid2VicGFjazovL2Z2dHQtd2VhcG9uLXJlbG9hZC8uL3NyYy9tb2R1bGUvZmVhdHVyZXMvUmVsb2FkYWJsZVdlYXBvbkF0dGFja0ZlYXR1cmUudHMiLCJ3ZWJwYWNrOi8vZnZ0dC13ZWFwb24tcmVsb2FkLy4vc3JjL21vZHVsZS9mZWF0dXJlcy9SZWxvYWRhYmxlV2VhcG9uQ3JlYXRpb25GZWF0dXJlLnRzIiwid2VicGFjazovL2Z2dHQtd2VhcG9uLXJlbG9hZC8uL3NyYy9tb2R1bGUvZmVhdHVyZXMvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vZnZ0dC13ZWFwb24tcmVsb2FkLy4vc3JjL21vZHVsZS9tYW5hZ2Vycy9GZWF0dXJlTWFuYWdlci50cyIsIndlYnBhY2s6Ly9mdnR0LXdlYXBvbi1yZWxvYWQvLi9zcmMvbW9kdWxlL21hbmFnZXJzL01vZHVsZU1hbmFnZXIudHMiLCJ3ZWJwYWNrOi8vZnZ0dC13ZWFwb24tcmVsb2FkLy4vc3JjL21vZHVsZS9tYW5hZ2Vycy9UZW1wbGF0ZU1hbmFnZXIudHMiLCJ3ZWJwYWNrOi8vZnZ0dC13ZWFwb24tcmVsb2FkLy4vc3JjL21vZHVsZS9tYW5hZ2Vycy9VaU1hbmFnZXIudHMiLCJ3ZWJwYWNrOi8vZnZ0dC13ZWFwb24tcmVsb2FkL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2Z2dHQtd2VhcG9uLXJlbG9hZC93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vZnZ0dC13ZWFwb24tcmVsb2FkL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vZnZ0dC13ZWFwb24tcmVsb2FkL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vZnZ0dC13ZWFwb24tcmVsb2FkL3dlYnBhY2svcnVudGltZS9wdWJsaWNQYXRoIiwid2VicGFjazovL2Z2dHQtd2VhcG9uLXJlbG9hZC8uL3NyYy9pbmRleC50cyIsIndlYnBhY2s6Ly9mdnR0LXdlYXBvbi1yZWxvYWQvLi9zcmMvc3R5bGVzL21vZHVsZS5zY3NzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBGZWF0dXJlTWFuYWdlciBmcm9tICcuLi9tYW5hZ2Vycy9GZWF0dXJlTWFuYWdlcic7XG5pbXBvcnQgeyBEbmRJdGVtNWUgfSBmcm9tICcuLi90eXBlcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJhc2VGZWF0dXJlIHtcbiAgICBwcml2YXRlIF9mZWF0dXJlTWFuYWdlcjogRmVhdHVyZU1hbmFnZXI7XG4gICAgcHJpdmF0ZSBfYWN0b3JJZDogc3RyaW5nO1xuICAgIHByaXZhdGUgX3dlYXBvbklkOiBzdHJpbmc7XG5cbiAgICBjb25zdHJ1Y3RvcihmZWF0dXJlTWFuYWdlcjogRmVhdHVyZU1hbmFnZXIpIHtcbiAgICAgICAgdGhpcy5fZmVhdHVyZU1hbmFnZXIgPSBmZWF0dXJlTWFuYWdlcjtcbiAgICAgICAgdGhpcy5fYWN0b3JJZCA9ICcnO1xuICAgICAgICB0aGlzLl93ZWFwb25JZCA9ICcnO1xuICAgICAgICB0aGlzLmluaXQoKTtcbiAgICB9XG5cbiAgICBnZXQgZmVhdHVyZU1hbmFnZXIoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9mZWF0dXJlTWFuYWdlcjtcbiAgICB9XG5cbiAgICBnZXQgbW9kdWxlTWFuYWdlcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ZlYXR1cmVNYW5hZ2VyLm1vZHVsZU1hbmFnZXI7XG4gICAgfVxuXG4gICAgZ2V0IGNoYXJhY3RlcigpOiBBY3RvcjVlIHtcbiAgICAgICAgcmV0dXJuIGdhbWU/LmFjdG9ycz8uZ2V0KHRoaXMuX2FjdG9ySWQpIGFzIEFjdG9yNWU7XG4gICAgfVxuXG4gICAgZ2V0IGNoYXJhY3RlcklkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWN0b3JJZDtcbiAgICB9XG5cbiAgICBzZXQgY2hhcmFjdGVySWQoaWQ6IHN0cmluZykge1xuICAgICAgICB0aGlzLl9hY3RvcklkID0gaWQ7XG4gICAgfVxuXG4gICAgZ2V0IHdlYXBvbigpOiBEbmRJdGVtNWUge1xuICAgICAgICByZXR1cm4gdGhpcy5jaGFyYWN0ZXIuaXRlbXMuZ2V0KHRoaXMuX3dlYXBvbklkKSBhcyBEbmRJdGVtNWU7XG4gICAgfVxuXG4gICAgZ2V0IHdlYXBvbklkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fd2VhcG9uSWQ7XG4gICAgfVxuXG4gICAgc2V0IHdlYXBvbklkKGlkOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5fd2VhcG9uSWQgPSBpZDtcbiAgICB9XG5cbiAgICBnZXQgbG9hZG91dCgpIHtcbiAgICAgICAgY29uc3QgcmVsb2FkYWJsZVdlYXBvbiA9IHRoaXMud2VhcG9uO1xuICAgICAgICBjb25zdCBtYXhTaG90cyA9IHJlbG9hZGFibGVXZWFwb24uc3lzdGVtLnVzZXMubWF4O1xuICAgICAgICBjb25zdCBjdXJyZW50TG9hZG91dCA9XG4gICAgICAgICAgICAocmVsb2FkYWJsZVdlYXBvbi5nZXRGbGFnKFxuICAgICAgICAgICAgICAgIHRoaXMubW9kdWxlTWFuYWdlci5pZCxcbiAgICAgICAgICAgICAgICAnY2hhbWJlcmVkJ1xuICAgICAgICAgICAgKSBhcyBzdHJpbmdbXSkgfHwgbmV3IEFycmF5KG1heFNob3RzKS5maWxsKCdFbXB0eScpO1xuXG4gICAgICAgIGlmIChjdXJyZW50TG9hZG91dC5sZW5ndGggPCBtYXhTaG90cykge1xuICAgICAgICAgICAgY29uc3QgbWlzc2luZyA9IG1heFNob3RzIC0gY3VycmVudExvYWRvdXQubGVuZ3RoO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBtaXNzaW5nOyBpKyspIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50TG9hZG91dC5wdXNoKCdFbXB0eScpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGN1cnJlbnRMb2Fkb3V0O1xuICAgIH1cblxuICAgIGdldCBmaXJlZCgpIHtcbiAgICAgICAgY29uc3QgcmVsb2FkYWJsZVdlYXBvbiA9IHRoaXMud2VhcG9uO1xuICAgICAgICBjb25zdCBtYXhTaG90cyA9IHJlbG9hZGFibGVXZWFwb24uc3lzdGVtLnVzZXMubWF4O1xuICAgICAgICBjb25zdCBmaXJlZCA9XG4gICAgICAgICAgICAocmVsb2FkYWJsZVdlYXBvbi5nZXRGbGFnKFxuICAgICAgICAgICAgICAgIHRoaXMubW9kdWxlTWFuYWdlci5pZCxcbiAgICAgICAgICAgICAgICAnZmlyZWQnXG4gICAgICAgICAgICApIGFzIHN0cmluZ1tdKSB8fCBuZXcgQXJyYXkobWF4U2hvdHMpLmZpbGwoJ0VtcHR5Jyk7XG5cbiAgICAgICAgaWYgKGZpcmVkLmxlbmd0aCA8IG1heFNob3RzKSB7XG4gICAgICAgICAgICBjb25zdCBtaXNzaW5nID0gbWF4U2hvdHMgLSBmaXJlZC5sZW5ndGg7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG1pc3Npbmc7IGkrKykge1xuICAgICAgICAgICAgICAgIGZpcmVkLnB1c2goJ0VtcHR5Jyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZmlyZWQ7XG4gICAgfVxuXG4gICAgYW1tdW5pdGlvbihpdGVtczogQ29sbGVjdGlvbjxJdGVtNWU+LCBlcXVpcHBlZDogYm9vbGVhbiA9IGZhbHNlKTogSXRlbTVlW10ge1xuICAgICAgICByZXR1cm4gaXRlbXMuZmlsdGVyKChpdGVtOiBJdGVtNWUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGdhbWVTeXN0ZW0gPSAoaXRlbSBhcyBEbmRJdGVtNWUpLnN5c3RlbTtcbiAgICAgICAgICAgIGlmIChlcXVpcHBlZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgIGl0ZW0udHlwZSA9PSAnY29uc3VtYWJsZScgJiZcbiAgICAgICAgICAgICAgICAgICAgZ2FtZVN5c3RlbS50eXBlLnN1YnR5cGUgPT0gJ2ZpcmVhcm1CdWxsZXQnICYmXG4gICAgICAgICAgICAgICAgICAgIGdhbWVTeXN0ZW0uZXF1aXBwZWRcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICBpdGVtLnR5cGUgPT0gJ2NvbnN1bWFibGUnICYmXG4gICAgICAgICAgICAgICAgZ2FtZVN5c3RlbS50eXBlLnN1YnR5cGUgPT0gJ2ZpcmVhcm1CdWxsZXQnXG4gICAgICAgICAgICApO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBpbml0KCkge31cblxuICAgIHRyYW5zbGF0ZShrZXk6IHN0cmluZywgb3B0cz86IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH0sIGZvcm1hdD86IGJvb2xlYW4pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubW9kdWxlTWFuYWdlci51aU1hbmFnZXIuZ2V0TG9jYWxpemVkVHh0KGtleSwgb3B0cywgZm9ybWF0KTtcbiAgICB9XG5cbiAgICB0b1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuICdjbGFzcyBCYXNlRmVhdHVyZSc7XG4gICAgfVxufVxuIiwiaW1wb3J0IEZlYXR1cmVNYW5hZ2VyIGZyb20gJy4uL21hbmFnZXJzL0ZlYXR1cmVNYW5hZ2VyJztcbmltcG9ydCBCYXNlRmVhdHVyZSBmcm9tICcuL0Jhc2VGZWF0dXJlJztcblxuZXhwb3J0IGNsYXNzIE5leHRSb3VuZEZlYXR1cmUgZXh0ZW5kcyBCYXNlRmVhdHVyZSB7XG4gICAgY29uc3RydWN0b3IoZmVhdHVyZU1hbmFnZXI6IEZlYXR1cmVNYW5hZ2VyKSB7XG4gICAgICAgIHN1cGVyKGZlYXR1cmVNYW5hZ2VyKTtcbiAgICB9XG5cbiAgICBpbml0KCkge1xuICAgICAgICBIb29rcy5vbignZG5kNWUucHJlVXNlQWN0aXZpdHknLCB0aGlzLm9uVXNlQWN0aXZpdHkuYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgb25Vc2VBY3Rpdml0eShhY3Rpdml0eTogYW55KSB7XG4gICAgICAgIGlmIChhY3Rpdml0eS50eXBlID09PSAndXRpbGl0eScgJiYgYWN0aXZpdHkubmFtZSA9PSAnTmV4dCBSb3VuZCcpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdXZWFwb24gUmVsb2FkIHwgVHJpZ2dlcmVkIE5leHQgUm91bmQnKTtcblxuICAgICAgICAgICAgdGhpcy5jaGFyYWN0ZXJJZCA9IGFjdGl2aXR5LmFjdG9yLmlkO1xuICAgICAgICAgICAgdGhpcy53ZWFwb25JZCA9IGFjdGl2aXR5Lml0ZW0uaWQ7XG4gICAgICAgICAgICB0aGlzLm5leHRSb3VuZCgpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGFzeW5jIG5leHRSb3VuZCgpIHtcbiAgICAgICAgY29uc3QgbmV4dFJvdW5kID0gdGhpcy5sb2Fkb3V0WzBdO1xuICAgICAgICBjb25zdCBhY3RvciA9IHRoaXMuY2hhcmFjdGVyO1xuXG4gICAgICAgIC8vIE5vdGlmeSB0aGUgdXNlciB3aGF0IHRoZSBuZXh0IHJvdW5kIGlzXG4gICAgICAgIGNvbnN0IGh0bWxUZW1wbGF0ZSA9IGF3YWl0IChcbiAgICAgICAgICAgIGZvdW5kcnkuYXBwbGljYXRpb25zIGFzIGFueVxuICAgICAgICApLmhhbmRsZWJhcnMucmVuZGVyVGVtcGxhdGUoXG4gICAgICAgICAgICAnbW9kdWxlcy9mdnR0LXdlYXBvbi1yZWxvYWQvdGVtcGxhdGVzL2FtbW9SZWZ1bmROb3RpY2VUZW1wbGF0ZS5oYnMnLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGl0ZW06IHtcbiAgICAgICAgICAgICAgICAgICAgaW1nOiAnbW9kdWxlcy9mdnR0LXdlYXBvbi1yZWxvYWQvYXNzZXRzL2ljb25zL2J1bGxldHNfYndfaWNvbi5wbmcnLFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiBuZXh0Um91bmQsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogdGhpcy50cmFuc2xhdGUoXG4gICAgICAgICAgICAgICAgICAgICdXRUFQT05fUkVMT0FELkZlYXR1cmVzLk5leHRSb3VuZC5EZXNjcmlwdGlvbicsXG4gICAgICAgICAgICAgICAgICAgIHsgYnVsbGV0OiBuZXh0Um91bmQsIHdlYXBvbjogdGhpcy53ZWFwb24ubmFtZSB9LFxuICAgICAgICAgICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICB0aXRsZTogdGhpcy50cmFuc2xhdGUoJ1dFQVBPTl9SRUxPQUQuRmVhdHVyZXMuTmV4dFJvdW5kLlRpdGxlJyksXG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgICAgIHRoaXMubW9kdWxlTWFuYWdlci51aU1hbmFnZXIuc2VuZENoYXQoXG4gICAgICAgICAgICBhY3RvcixcbiAgICAgICAgICAgIGh0bWxUZW1wbGF0ZSxcbiAgICAgICAgICAgIHVuZGVmaW5lZCxcbiAgICAgICAgICAgIHVuZGVmaW5lZCxcbiAgICAgICAgICAgIFthY3Rvci5pZF0sXG4gICAgICAgICAgICBDT05TVC5DSEFUX01FU1NBR0VfVFlQRVMuV0hJU1BFUlxuICAgICAgICApO1xuICAgIH1cblxuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gJ2NsYXNzIE5leHRSb3VuZEZlYXR1cmUnO1xuICAgIH1cbn1cbiIsImltcG9ydCBEaWFsb2dWMiBmcm9tICdAbGVhZ3VlLW9mLWZvdW5kcnktZGV2ZWxvcGVycy9mb3VuZHJ5LXZ0dC10eXBlcy9zcmMvZm91bmRyeS9jbGllbnQtZXNtL2FwcGxpY2F0aW9ucy9hcGkvZGlhbG9nLm1qcyc7XG5pbXBvcnQgRmVhdHVyZU1hbmFnZXIgZnJvbSAnLi4vbWFuYWdlcnMvRmVhdHVyZU1hbmFnZXInO1xuaW1wb3J0IEJhc2VGZWF0dXJlIGZyb20gJy4vQmFzZUZlYXR1cmUnO1xuaW1wb3J0IHsgdHlwZSBBbW1vSXRlbU9wdGlvbiwgRG5kSXRlbTVlIH0gZnJvbSAnLi4vdHlwZXMnO1xuXG5leHBvcnQgY2xhc3MgUmVsb2FkRmVhdHVyZSBleHRlbmRzIEJhc2VGZWF0dXJlIHtcbiAgICBwcml2YXRlIF9ob29rSWQ6IG51bWJlcjtcbiAgICBwcml2YXRlIF9oYW5kbGVDaG9pY2VEaWFsb2dDbG9zZTogYm9vbGVhbjtcblxuICAgIGNvbnN0cnVjdG9yKGZlYXR1cmVNYW5hZ2VyOiBGZWF0dXJlTWFuYWdlcikge1xuICAgICAgICBzdXBlcihmZWF0dXJlTWFuYWdlcik7XG4gICAgICAgIHRoaXMuX2hvb2tJZCA9IC0xO1xuICAgICAgICB0aGlzLl9oYW5kbGVDaG9pY2VEaWFsb2dDbG9zZSA9IGZhbHNlO1xuICAgIH1cblxuICAgIGluaXQoKSB7XG4gICAgICAgIEhvb2tzLm9uKCdkbmQ1ZS5wcmVVc2VBY3Rpdml0eScsIHRoaXMub25Vc2VBY3Rpdml0eS5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICBvblVzZUFjdGl2aXR5KGFjdGl2aXR5OiBhbnkpIHtcbiAgICAgICAgaWYgKGFjdGl2aXR5LnR5cGUgPT09ICd1dGlsaXR5JyAmJiBhY3Rpdml0eS5uYW1lID09ICdSZWxvYWQnKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnV2VhcG9uIFJlbG9hZCB8IFRyaWdnZXJlZCBSZWxvYWQnKTtcblxuICAgICAgICAgICAgdGhpcy5jaGFyYWN0ZXJJZCA9IGFjdGl2aXR5LmFjdG9yLmlkO1xuICAgICAgICAgICAgdGhpcy53ZWFwb25JZCA9IGFjdGl2aXR5Lml0ZW0uaWQ7XG4gICAgICAgICAgICB0aGlzLndlYXBvblJlbG9hZCgpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHdlYXBvblJlbG9hZChyZWZ1bmRBbW1vOiBib29sZWFuID0gdHJ1ZSkge1xuICAgICAgICBjb25zdCBpdGVtcyA9IHRoaXMuY2hhcmFjdGVyPy5pdGVtcztcbiAgICAgICAgY29uc3QgY3VycmVudExvYWRvdXQgPSB0aGlzLmxvYWRvdXQ7XG4gICAgICAgIGNvbnN0IGludmVudG9yeUFtbXVuaXRpb24gPSB0aGlzLmFtbXVuaXRpb24oaXRlbXMpIGFzIERuZEl0ZW01ZVtdO1xuICAgICAgICBsZXQgYW1tdW5pdGlvbkNob2ljZXM6IEFtbW9JdGVtT3B0aW9uW10gPSBbXTtcblxuICAgICAgICBpZiAocmVmdW5kQW1tbykge1xuICAgICAgICAgICAgYW1tdW5pdGlvbkNob2ljZXMgPSB0aGlzLnJlZnVuZENoYW1iZXJlZEFtbW8oaW52ZW50b3J5QW1tdW5pdGlvbik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhbW11bml0aW9uQ2hvaWNlcyA9IGludmVudG9yeUFtbXVuaXRpb24ubWFwKFxuICAgICAgICAgICAgICAgIChhbW1vOiBEbmRJdGVtNWUpOiBBbW1vSXRlbU9wdGlvbiA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBhbW1vLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogYW1tby5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgY291bnQ6IGFtbW8uc3lzdGVtLnF1YW50aXR5LFxuICAgICAgICAgICAgICAgICAgICAgICAgZXF1aXBwZWQ6IGFtbW8uc3lzdGVtLmVxdWlwcGVkLFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBjaGVja0VxdWlwcGVkID0gZ2FtZS5zZXR0aW5ncy5nZXQoXG4gICAgICAgICAgICB0aGlzLm1vZHVsZU1hbmFnZXIuaWQsXG4gICAgICAgICAgICAnZmlsdGVyQW1tdW5pdGlvbkJ5RXF1aXBwZWQnXG4gICAgICAgICkgYXMgYm9vbGVhbjtcblxuICAgICAgICB0aGlzLmNob29zZUFtbXVuaXRpb24oXG4gICAgICAgICAgICBhbW11bml0aW9uQ2hvaWNlcy5maWx0ZXIoKGFtbW9JdGVtOiBBbW1vSXRlbU9wdGlvbikgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChhbW1vSXRlbS5jb3VudCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgKGNoZWNrRXF1aXBwZWQgJiYgYW1tb0l0ZW0uZXF1aXBwZWQpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAhY2hlY2tFcXVpcHBlZFxuICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgY3VycmVudExvYWRvdXRcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICByZWZ1bmRDaGFtYmVyZWRBbW1vKGludmVudG9yeUFtbXVuaXRpb246IERuZEl0ZW01ZVtdKTogQW1tb0l0ZW1PcHRpb25bXSB7XG4gICAgICAgIGNvbnN0IGxvYWRvdXRDb3VudHMgPSB0aGlzLmdldExvYWRvdXRDb3VudHModGhpcy5sb2Fkb3V0KTtcbiAgICAgICAgY29uc3QgYXZhaWxhYmxlQW1tdW5pdGlvbjogQW1tb0l0ZW1PcHRpb25bXSA9IFtdO1xuICAgICAgICBpbnZlbnRvcnlBbW11bml0aW9uLmZvckVhY2goKGFtbW86IERuZEl0ZW01ZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbmFtZSA9IGFtbW8ubmFtZTtcbiAgICAgICAgICAgIGNvbnN0IGFtbW9JbmZvOiBBbW1vSXRlbU9wdGlvbiA9IHtcbiAgICAgICAgICAgICAgICBuYW1lOiBhbW1vLm5hbWUsXG4gICAgICAgICAgICAgICAgdmFsdWU6IGFtbW8ubmFtZSxcbiAgICAgICAgICAgICAgICBjb3VudDogYW1tby5zeXN0ZW0ucXVhbnRpdHksXG4gICAgICAgICAgICAgICAgZXF1aXBwZWQ6IGFtbW8uc3lzdGVtLmVxdWlwcGVkLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGlmIChsb2Fkb3V0Q291bnRzW25hbWVdKSB7XG4gICAgICAgICAgICAgICAgYW1tb0luZm8uY291bnQgPSBhbW1vLnN5c3RlbS5xdWFudGl0eSArIGxvYWRvdXRDb3VudHNbbmFtZV07XG4gICAgICAgICAgICAgICAgYW1tby51cGRhdGUoe1xuICAgICAgICAgICAgICAgICAgICAnc3lzdGVtLnF1YW50aXR5JzogYW1tb0luZm8uY291bnQsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhdmFpbGFibGVBbW11bml0aW9uLnB1c2goYW1tb0luZm8pO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGF2YWlsYWJsZUFtbXVuaXRpb247XG4gICAgfVxuXG4gICAgYXN5bmMgY2hvb3NlQW1tdW5pdGlvbihcbiAgICAgICAgYW1tb09wdGlvbnM6IEFtbW9JdGVtT3B0aW9uW10sXG4gICAgICAgIGN1cnJlbnRMb2Fkb3V0OiBzdHJpbmdbXVxuICAgICkge1xuICAgICAgICBjb25zdCBkaWFsb2dDb250ZW50ID0gYXdhaXQgKFxuICAgICAgICAgICAgZm91bmRyeS5hcHBsaWNhdGlvbnMgYXMgYW55XG4gICAgICAgICkuaGFuZGxlYmFycy5yZW5kZXJUZW1wbGF0ZShcbiAgICAgICAgICAgICdtb2R1bGVzL2Z2dHQtd2VhcG9uLXJlbG9hZC90ZW1wbGF0ZXMvYW1tb1NlbGVjdGlvbkRpYWxvZ1RlbXBsYXRlLmhicycsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbG9hZG91dFNsb3RzOiBuZXcgQXJyYXkodGhpcy53ZWFwb24uc3lzdGVtLnVzZXMubWF4KS5maWxsKFxuICAgICAgICAgICAgICAgICAgICAnRW1wdHknXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBhbW1vT3B0aW9ucyxcbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcblxuICAgICAgICBjb25zdCBkaWFsb2dCdXR0b25zID0gW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGFjdGlvbjogJ2xvYWQnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiB0aGlzLnRyYW5zbGF0ZShcbiAgICAgICAgICAgICAgICAgICAgJ1dFQVBPTl9SRUxPQUQuRmVhdHVyZXMuUmVsb2FkLkFtbXVuaXRpb24uQ2hvaWNlRGlhbG9nQnV0dG9uVHh0TG9hZCdcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIGNhbGxiYWNrOiAoXG4gICAgICAgICAgICAgICAgICAgIF9ldmVudDogUG9pbnRlckV2ZW50IHwgU3VibWl0RXZlbnQsXG4gICAgICAgICAgICAgICAgICAgIGJ1dHRvbjogSFRNTEJ1dHRvbkVsZW1lbnRcbiAgICAgICAgICAgICAgICApID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5faGFuZGxlQ2hvaWNlRGlhbG9nQ2xvc2UgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbG9hZG91dDogc3RyaW5nW10gPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBpID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGkgPCAoYnV0dG9uLmZvcm0/LmVsZW1lbnRzPy5sZW5ndGggYXMgbnVtYmVyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGkrK1xuICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGVsbSA9IGJ1dHRvbi5mb3JtPy5lbGVtZW50cy5pdGVtKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlcbiAgICAgICAgICAgICAgICAgICAgICAgICkgYXMgSFRNTFNlbGVjdEVsZW1lbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZWxtPy5uYW1lID09ICdhbW1vLXNlbGVjdCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2Fkb3V0LnB1c2goZWxtLnZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4geyBsb2Fkb3V0LCByZWxvYWRDYW5jZWxlZDogZmFsc2UgfTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBhY3Rpb246ICdjYW5jZWwnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiB0aGlzLnRyYW5zbGF0ZShcbiAgICAgICAgICAgICAgICAgICAgJ1dFQVBPTl9SRUxPQUQuRmVhdHVyZXMuUmVsb2FkLkFtbXVuaXRpb24uQ2hvaWNlRGlhbG9nQnV0dG9uVHh0Q2FuY2VsJ1xuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgY2FsbGJhY2s6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5faGFuZGxlQ2hvaWNlRGlhbG9nQ2xvc2UgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgbG9hZG91dDogY3VycmVudExvYWRvdXQsIHJlbG9hZENhbmNlbGVkOiB0cnVlIH07XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIF07XG5cbiAgICAgICAgdGhpcy5faGFuZGxlQ2hvaWNlRGlhbG9nQ2xvc2UgPSB0cnVlO1xuICAgICAgICB0aGlzLl9ob29rSWQgPSBIb29rcy5vbignY2xvc2VEaWFsb2dWMicsIChkaWFsb2dWMjogRGlhbG9nVjIpID0+IHtcbiAgICAgICAgICAgIGlmIChkaWFsb2dWMi5pZCA9PT0gJ2FtbW8tY2hvaWNlLWRpYWxvZycpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm9uQ2xvc2VDaG9pY2VEaWFsb2coY3VycmVudExvYWRvdXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLm1vZHVsZU1hbmFnZXIudWlNYW5hZ2VyXG4gICAgICAgICAgICAuYnVpbGREaWFsb2coXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICB0aXRsZTogdGhpcy50cmFuc2xhdGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAnV0VBUE9OX1JFTE9BRC5GZWF0dXJlcy5SZWxvYWQuQW1tdW5pdGlvbi5DaG9pY2VEaWFsb2dUaXRsZSdcbiAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgY29udGVudDogZGlhbG9nQ29udGVudCxcbiAgICAgICAgICAgICAgICAgICAgYnV0dG9uczogZGlhbG9nQnV0dG9ucyxcbiAgICAgICAgICAgICAgICAgICAgb25TdWJtaXQ6ICh7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2Fkb3V0LFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVsb2FkQ2FuY2VsZWQsXG4gICAgICAgICAgICAgICAgICAgIH06IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvYWRvdXQ6IHN0cmluZ1tdO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVsb2FkQ2FuY2VsZWQ6IGJvb2xlYW47XG4gICAgICAgICAgICAgICAgICAgIH0pOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnJlbG9hZFJlbG9hZGFibGVXZWFwb24oXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9hZG91dCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWxvYWRDYW5jZWxlZFxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICdhbW1vLWNob2ljZS1kaWFsb2cnXG4gICAgICAgICAgICApXG4gICAgICAgICAgICAucmVuZGVyKHsgZm9yY2U6IHRydWUgfSk7XG4gICAgfVxuXG4gICAgb25DbG9zZUNob2ljZURpYWxvZyhsb2Fkb3V0OiBzdHJpbmdbXSkge1xuICAgICAgICBIb29rcy5vZmYoJ2Nsb3NlRGlhbG9nVjInLCB0aGlzLl9ob29rSWQpO1xuICAgICAgICB0aGlzLl9ob29rSWQgPSAtMTtcblxuICAgICAgICBpZiAodGhpcy5faGFuZGxlQ2hvaWNlRGlhbG9nQ2xvc2UpIHtcbiAgICAgICAgICAgIHRoaXMuX2hhbmRsZUNob2ljZURpYWxvZ0Nsb3NlID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLnJlbG9hZFJlbG9hZGFibGVXZWFwb24obG9hZG91dCwgdHJ1ZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhc3luYyByZWxvYWRSZWxvYWRhYmxlV2VhcG9uKFxuICAgICAgICBsb2Fkb3V0OiBzdHJpbmdbXSxcbiAgICAgICAgcmVsb2FkQ2FuY2VsZWQ6IGJvb2xlYW4gPSBmYWxzZVxuICAgICkge1xuICAgICAgICBjb25zdCByZWxvYWRhYmxlV2VhcG9uID0gdGhpcy53ZWFwb247XG4gICAgICAgIGNvbnN0IGFtbW9Db3VudHMgPSB0aGlzLmdldExvYWRvdXRDb3VudHMobG9hZG91dCk7XG5cbiAgICAgICAgaWYgKHRoaXMucmVtb3ZlTG9hZG91dChhbW1vQ291bnRzKSkge1xuICAgICAgICAgICAgLy8gVXBkYXRlIHRoZSByZWxvYWRhYmxlV2VhcG9uIHVzZXNcbiAgICAgICAgICAgIGxldCBxdHkgPSAwO1xuICAgICAgICAgICAgaWYgKGFtbW9Db3VudHNbJ0VtcHR5J10gPiAwKSB7XG4gICAgICAgICAgICAgICAgLy8gQWRqdXN0IHNwZW50IHVzZXMgYnkgdGhlIG51bWJlciBvZiBFbXB0eSBzbG90c1xuICAgICAgICAgICAgICAgIHF0eSArPSBhbW1vQ291bnRzWydFbXB0eSddO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYXdhaXQgcmVsb2FkYWJsZVdlYXBvbi51cGRhdGUoe1xuICAgICAgICAgICAgICAgICdzeXN0ZW0udXNlcy5zcGVudCc6IHF0eSxcbiAgICAgICAgICAgICAgICAnc3lzdGVtLnVzZXMudmFsdWUnOiByZWxvYWRhYmxlV2VhcG9uLnN5c3RlbS51c2VzLm1heCAtIHF0eSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYXdhaXQgcmVsb2FkYWJsZVdlYXBvbi5zZXRGbGFnKFxuICAgICAgICAgICAgICAgIHRoaXMubW9kdWxlTWFuYWdlci5pZCxcbiAgICAgICAgICAgICAgICAnY2hhbWJlcmVkJyxcbiAgICAgICAgICAgICAgICBsb2Fkb3V0XG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgYXdhaXQgcmVsb2FkYWJsZVdlYXBvbi5zZXRGbGFnKFxuICAgICAgICAgICAgICAgIHRoaXMubW9kdWxlTWFuYWdlci5pZCxcbiAgICAgICAgICAgICAgICAnZmlyZWQnLFxuICAgICAgICAgICAgICAgIG5ldyBBcnJheSh0aGlzLndlYXBvbi5zeXN0ZW0udXNlcy5tYXgpLmZpbGwoJ0VtcHR5JylcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIGNvbnN0IGh0bWxUZW1wbGF0ZSA9IGF3YWl0IChcbiAgICAgICAgICAgICAgICBmb3VuZHJ5LmFwcGxpY2F0aW9ucyBhcyBhbnlcbiAgICAgICAgICAgICkuaGFuZGxlYmFycy5yZW5kZXJUZW1wbGF0ZShcbiAgICAgICAgICAgICAgICAnbW9kdWxlcy9mdnR0LXdlYXBvbi1yZWxvYWQvdGVtcGxhdGVzL3JlbG9hZGFibGVXZWFwb25SZWxvYWRUZW1wbGF0ZS5oYnMnLFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbToge1xuICAgICAgICAgICAgICAgICAgICAgICAgaW1nOiByZWxvYWRhYmxlV2VhcG9uLmltZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHJlbG9hZGFibGVXZWFwb24ubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgZmxhdm9yOiB0aGlzLnRyYW5zbGF0ZShcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbG9hZENhbmNlbGVkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPyAnV0VBUE9OX1JFTE9BRC5GZWF0dXJlcy5SZWxvYWQuV2VhcG9uLldlYXBvblJlbG9hZGVkQ2hhdEZsYXZvckNhbmNlbGVkJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogJ1dFQVBPTl9SRUxPQUQuRmVhdHVyZXMuUmVsb2FkLldlYXBvbi5XZWFwb25SZWxvYWRlZENoYXRGbGF2b3InXG4gICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiB0aGlzLnRyYW5zbGF0ZShcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbG9hZENhbmNlbGVkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPyAnV0VBUE9OX1JFTE9BRC5GZWF0dXJlcy5SZWxvYWQuV2VhcG9uLldlYXBvblJlbG9hZGVkQ2hhdE1zZ0NhbmNlbGVkJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogJ1dFQVBPTl9SRUxPQUQuRmVhdHVyZXMuUmVsb2FkLldlYXBvbi5XZWFwb25SZWxvYWRlZENoYXRNc2cnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyByZWxvYWRhYmxlV2VhcG9uOiByZWxvYWRhYmxlV2VhcG9uLm5hbWUgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRydWVcbiAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgbG9hZG91dDogbG9hZG91dCxcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgLy8gTm90aWZ5IHRoZSBwZWVwc1xuICAgICAgICAgICAgdGhpcy5tb2R1bGVNYW5hZ2VyLnVpTWFuYWdlci5zZW5kQ2hhdCh0aGlzLmNoYXJhY3RlciwgaHRtbFRlbXBsYXRlKTtcbiAgICAgICAgICAgIHRoaXMuY2hhcmFjdGVySWQgPSAnJztcbiAgICAgICAgICAgIHRoaXMud2VhcG9uSWQgPSAnJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMud2VhcG9uUmVsb2FkKGZhbHNlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgcmVtb3ZlTG9hZG91dChjb3VudHM6IHsgW2tleTogc3RyaW5nXTogbnVtYmVyIH0pOiBib29sZWFuIHtcbiAgICAgICAgbGV0IGFtbXVuaXRpb25BdmFpbGFibGUgPSB0cnVlO1xuICAgICAgICBjb25zdCBpbnZlbnRvcnlBbW11bml0aW9uID0gdGhpcy5hbW11bml0aW9uKFxuICAgICAgICAgICAgdGhpcy5jaGFyYWN0ZXI/Lml0ZW1zXG4gICAgICAgICkgYXMgRG5kSXRlbTVlW107XG4gICAgICAgIGludmVudG9yeUFtbXVuaXRpb24uZm9yRWFjaCgoYW1tbzogRG5kSXRlbTVlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBuYW1lID0gYW1tby5uYW1lO1xuICAgICAgICAgICAgY29uc3QgcXR5ID0gYW1tby5zeXN0ZW0ucXVhbnRpdHkgLSBjb3VudHNbbmFtZV07XG5cbiAgICAgICAgICAgIC8vIElmIGFueSBidWxsZXQgaXMgYWRkZWQgYmV5b25kIHRoZSBxdWFudGl0eSB0aGUgcGxheWVyIGFjdHVhbGx5IGhhcyB0aGVuIHRocm93IGFuIGVycm9yIGFuZCByZXR1cm4gZmFsc2VcbiAgICAgICAgICAgIGlmIChxdHkgPCAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tb2R1bGVNYW5hZ2VyLnVpTWFuYWdlci51aU5vdGlmaWNhdGlvbihcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50cmFuc2xhdGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAnV0VBUE9OX1JFTE9BRC5GZWF0dXJlcy5SZWxvYWQuV2VhcG9uLkxvYWRpbmdFcnJvck1zZycsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IG5hbWU6IGFtbW8ubmFtZSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgdHJ1ZVxuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICAnZXJyb3InXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBhbW11bml0aW9uQXZhaWxhYmxlID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChhbW11bml0aW9uQXZhaWxhYmxlKSB7XG4gICAgICAgICAgICBpbnZlbnRvcnlBbW11bml0aW9uLmZvckVhY2goYXN5bmMgKGFtbW86IERuZEl0ZW01ZSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5hbWUgPSBhbW1vLm5hbWU7XG4gICAgICAgICAgICAgICAgaWYgKGNvdW50c1tuYW1lXSkge1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCBhbW1vLnVwZGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAnc3lzdGVtLnF1YW50aXR5JzogYW1tby5zeXN0ZW0ucXVhbnRpdHkgLSBjb3VudHNbbmFtZV0sXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGFtbXVuaXRpb25BdmFpbGFibGU7XG4gICAgfVxuXG4gICAgYXN5bmMgb25SZWxvYWRDYWxsYmFjayhhY3RvcjogQWN0b3I1ZSwgd2VhcG9uOiBEbmRJdGVtNWUpIHtcbiAgICAgICAgdGhpcy5jaGFyYWN0ZXJJZCA9IGFjdG9yLmlkO1xuICAgICAgICB0aGlzLndlYXBvbklkID0gd2VhcG9uLmlkO1xuXG4gICAgICAgIHRoaXMud2VhcG9uUmVsb2FkKCk7XG4gICAgfVxuXG4gICAgZ2V0TG9hZG91dENvdW50cyhjdXJyZW50TG9hZG91dDogc3RyaW5nW10pOiB7XG4gICAgICAgIFtrZXk6IHN0cmluZ106IG51bWJlcjtcbiAgICB9IHtcbiAgICAgICAgY29uc3QgbG9hZG91dDogeyBba2V5OiBzdHJpbmddOiBudW1iZXIgfSA9IHt9O1xuICAgICAgICBjdXJyZW50TG9hZG91dC5mb3JFYWNoKChhbW1vOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgIGlmICghbG9hZG91dFthbW1vXSkgbG9hZG91dFthbW1vXSA9IDA7XG4gICAgICAgICAgICBsb2Fkb3V0W2FtbW9dID0gbG9hZG91dFthbW1vXSArIDE7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gbG9hZG91dDtcbiAgICB9XG5cbiAgICB0b1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuICdjbGFzcyBSZWxvYWRGZWF0dXJlJztcbiAgICB9XG59XG4iLCJpbXBvcnQgRmVhdHVyZU1hbmFnZXIgZnJvbSAnLi4vbWFuYWdlcnMvRmVhdHVyZU1hbmFnZXInO1xuaW1wb3J0IEJhc2VGZWF0dXJlIGZyb20gJy4vQmFzZUZlYXR1cmUnO1xuXG5pbXBvcnQge1xuICAgIEFjdGl2aXR5Q2FyZENoYXRUeXBlLFxuICAgIENoYXRNZXNzYWdlNWUsXG4gICAgRG5kSXRlbTVlLFxuICAgIERuZEQyMFJvbGwsXG4gICAgRG5kQXR0YWNrRXZlbnQsXG59IGZyb20gJy4uL3R5cGVzJztcblxuZXhwb3J0IGNsYXNzIFJlbG9hZGFibGVXZWFwb25BdHRhY2tGZWF0dXJlIGV4dGVuZHMgQmFzZUZlYXR1cmUge1xuICAgIHByaXZhdGUgX25leHRSb3VuZDoge1xuICAgICAgICBpZDogc3RyaW5nO1xuICAgICAgICB0eXBlOiBzdHJpbmc7XG4gICAgfTtcbiAgICBwcml2YXRlIF9ob29rSWQ6IG51bWJlcjtcblxuICAgIGNvbnN0cnVjdG9yKGZlYXR1cmVNYW5hZ2VyOiBGZWF0dXJlTWFuYWdlcikge1xuICAgICAgICBzdXBlcihmZWF0dXJlTWFuYWdlcik7XG4gICAgICAgIHRoaXMuX25leHRSb3VuZCA9IHsgaWQ6ICcnLCB0eXBlOiAnJyB9O1xuICAgICAgICB0aGlzLl9ob29rSWQgPSAtMTtcbiAgICB9XG5cbiAgICBpbml0KCkge1xuICAgICAgICBIb29rcy5vbignZG5kNWUucG9zdFJvbGxDb25maWd1cmF0aW9uJywgdGhpcy5vblVzZUFjdGl2aXR5LmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIG9uVXNlQWN0aXZpdHkoZDIwUm9sbDogRG5kRDIwUm9sbFtdLCBldmVudDogRG5kQXR0YWNrRXZlbnQpIHtcbiAgICAgICAgY29uc3Qgcm9sbCA9IGQyMFJvbGxbMF07XG4gICAgICAgIGNvbnN0IHdlYXBvbkRhdGEgPSByb2xsPy5kYXRhPy5pdGVtO1xuICAgICAgICBpZiAod2VhcG9uRGF0YT8udHlwZT8uYmFzZUl0ZW0gIT09ICdyZWxvYWRhYmxlV2VhcG9uJykgcmV0dXJuO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKCdXZWFwb24gUmVsb2FkIHwgVHJpZ2dlcmVkIEF0dGFjaycpO1xuICAgICAgICB0aGlzLndlYXBvbklkID0gZXZlbnQuc3ViamVjdC5pdGVtLmlkO1xuICAgICAgICB0aGlzLmNoYXJhY3RlcklkID0gZXZlbnQuc3ViamVjdC5hY3Rvci5pZDtcblxuICAgICAgICByZXR1cm4gdGhpcy5yZWxvYWRhYmxlV2VhcG9uQXR0YWNrKCk7XG4gICAgfVxuXG4gICAgcmVsb2FkYWJsZVdlYXBvbkF0dGFjaygpIHtcbiAgICAgICAgY29uc3QgYnVsbGV0ID0gdGhpcy5nZXROZXh0Um91bmQoKTtcblxuICAgICAgICBpZiAoYnVsbGV0Lm5hbWUgPT0gJ0VtcHR5Jykge1xuICAgICAgICAgICAgdGhpcy5kcnlmaXJlV2VhcG9uKCk7XG5cbiAgICAgICAgICAgIC8vIFN0b3AgdGhlIGF0dGFjayBpZiBEcnkgZmlyaW5nIHRoZSB3ZWFwb24gYW5kIHRoZXJlIGFyZSBubyBvdGhlciBidWxsZXRzIGxlZnRcbiAgICAgICAgICAgIGlmICh0aGlzLndlYXBvbi5zeXN0ZW0udXNlcy5zcGVudCA9PSB0aGlzLndlYXBvbi5zeXN0ZW0udXNlcy5tYXgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoYnVsbGV0Lm5hbWUgIT09ICdFbXB0eScpIHtcbiAgICAgICAgICAgIHRoaXMuX25leHRSb3VuZCA9IHtcbiAgICAgICAgICAgICAgICBpZDogYnVsbGV0LmlkLFxuICAgICAgICAgICAgICAgIHR5cGU6IGJ1bGxldC50eXBlLFxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdGhpcy5faG9va0lkID0gSG9va3Mub24oXG4gICAgICAgICAgICAgICAgJ2RuZDVlLnJlbmRlckNoYXRNZXNzYWdlJyxcbiAgICAgICAgICAgICAgICB0aGlzLm9uUmVuZGVyQ2hhdE1lc3NhZ2UuYmluZCh0aGlzKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLmZpcmVSb3VuZChidWxsZXQpO1xuICAgIH1cblxuICAgIGFzeW5jIG9uUmVuZGVyQ2hhdE1lc3NhZ2UobWVzc2FnZTogQ2hhdE1lc3NhZ2U1ZSwgaHRtbDogSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgY29uc3QgaXRlbUlkID0gbWVzc2FnZS5mbGFncy5kbmQ1ZT8uaXRlbS5pZDtcbiAgICAgICAgY29uc3QgaXRlbVR5cGUgPSBtZXNzYWdlLmZsYWdzLmRuZDVlPy5pdGVtLnR5cGU7XG4gICAgICAgIGlmIChcbiAgICAgICAgICAgIHRoaXMuX25leHRSb3VuZC5pZCA9PT0gaXRlbUlkICYmXG4gICAgICAgICAgICB0aGlzLl9uZXh0Um91bmQudHlwZSA9PT0gaXRlbVR5cGVcbiAgICAgICAgKSB7XG4gICAgICAgICAgICBIb29rcy5vZmYoJ2RuZDVlLnJlbmRlckNoYXRNZXNzYWdlJywgdGhpcy5faG9va0lkKTtcbiAgICAgICAgICAgIHRoaXMuX25leHRSb3VuZCA9IHsgaWQ6ICcnLCB0eXBlOiAnJyB9O1xuXG4gICAgICAgICAgICBjb25zdCBidWxsZXQgPSB0aGlzLmNoYXJhY3Rlci5pdGVtcy5nZXQoaXRlbUlkKSBhcyBEbmRJdGVtNWU7XG5cbiAgICAgICAgICAgIGNvbnN0IGFjdGl2YXRpb25DYXJkID0gaHRtbC5xdWVyeVNlbGVjdG9yKCcuYWN0aXZhdGlvbi1jYXJkJyk7XG4gICAgICAgICAgICBjb25zdCBpdGVtY2FyZCA9IGh0bWwucXVlcnlTZWxlY3RvcignLml0ZW0tY2FyZCcpO1xuICAgICAgICAgICAgY29uc3QgcGFyZW50RWxlbWVudCA9IGFjdGl2YXRpb25DYXJkIHx8IGl0ZW1jYXJkO1xuXG4gICAgICAgICAgICAvLyBHcmFiIG1vZHVsZSBjb25maWd1cmF0aW9uc1xuICAgICAgICAgICAgY29uc3QgY2hlY2tVbnN0YWJsZUFtbW8gPSBnYW1lLnNldHRpbmdzLmdldChcbiAgICAgICAgICAgICAgICB0aGlzLm1vZHVsZU1hbmFnZXIuaWQsXG4gICAgICAgICAgICAgICAgJ3Vuc3RhYmxlQW1tbydcbiAgICAgICAgICAgICkgYXMgYm9vbGVhbjtcblxuICAgICAgICAgICAgY29uc3QgY2hlY2tNaXNmaXJlID0gZ2FtZS5zZXR0aW5ncy5nZXQoXG4gICAgICAgICAgICAgICAgdGhpcy5tb2R1bGVNYW5hZ2VyLmlkLFxuICAgICAgICAgICAgICAgICd1c2VNaXNmaXJlcydcbiAgICAgICAgICAgICkgYXMgYm9vbGVhbjtcblxuICAgICAgICAgICAgY29uc3QgdW5zdGFibGVBbW1vRmFpbHVyZVRocmVzaG9sZCA9IGdhbWUuc2V0dGluZ3MuZ2V0KFxuICAgICAgICAgICAgICAgIHRoaXMubW9kdWxlTWFuYWdlci5pZCxcbiAgICAgICAgICAgICAgICAndW5zdGFibGVBbW1vRmFpbHVyZVRocmVzaGhvbGQnXG4gICAgICAgICAgICApIGFzIG51bWJlcjtcblxuICAgICAgICAgICAgLy8gQWRkIHRoZSBtaXNmaXJlIG1lc3NhZ2VcbiAgICAgICAgICAgIGlmIChjaGVja01pc2ZpcmUpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjcml0aWNhbEZhaWx1cmVNc2cgPVxuICAgICAgICAgICAgICAgICAgICBjaGVja1Vuc3RhYmxlQW1tbyAmJlxuICAgICAgICAgICAgICAgICAgICBidWxsZXQ/LnN5c3RlbS5wcm9wZXJ0aWVzLmZpbmQoKHByb3A6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHByb3AgPT09ICd1bnN0YWJsZSc7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICA/IHRoaXMudHJhbnNsYXRlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1dFQVBPTl9SRUxPQUQuRmVhdHVyZXMuUmVsb2FkYWJsZVdlYXBvbkF0dGFjay5NaXNmaXJlVW5zdGFibGUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBmYWlsdXJlOiBgJHt1bnN0YWJsZUFtbW9GYWlsdXJlVGhyZXNob2xkfWAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgOiB0aGlzLnRyYW5zbGF0ZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdXRUFQT05fUkVMT0FELkZlYXR1cmVzLlJlbG9hZGFibGVXZWFwb25BdHRhY2suTWlzZmlyZU5hdE9uZSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IGNhcmRDb250ZW50RWxlbWVudCA9XG4gICAgICAgICAgICAgICAgICAgIHBhcmVudEVsZW1lbnQ/LnF1ZXJ5U2VsZWN0b3IoJy5jYXJkLWNvbnRlbnQnKTtcbiAgICAgICAgICAgICAgICBjb25zdCB3cmFwcGVyRWxlbWVudCA9XG4gICAgICAgICAgICAgICAgICAgIGNhcmRDb250ZW50RWxlbWVudD8ucXVlcnlTZWxlY3RvcignLndyYXBwZXInKTtcbiAgICAgICAgICAgICAgICB3cmFwcGVyRWxlbWVudD8uaW5zZXJ0QWRqYWNlbnRIVE1MKFxuICAgICAgICAgICAgICAgICAgICAnYmVmb3JlZW5kJyxcbiAgICAgICAgICAgICAgICAgICAgYDxwPiR7Y3JpdGljYWxGYWlsdXJlTXNnfTwvcD5gXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gQWRkIGNhcmQgYnV0dG9uIGNvbnRhaW5lciBpZiBtaXNzaW5nXG4gICAgICAgICAgICBpZiAoaXRlbWNhcmQgJiYgIWFjdGl2YXRpb25DYXJkKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVmZXJlbmNlRWxlbWVudCA9XG4gICAgICAgICAgICAgICAgICAgIHBhcmVudEVsZW1lbnQ/LnF1ZXJ5U2VsZWN0b3IoJy5jYXJkLWhlYWRlcicpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGJ1dHRvbkNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgICAgIGJ1dHRvbkNvbnRhaW5lci5jbGFzc05hbWUgPSAnY2FyZC1idXR0b25zJztcbiAgICAgICAgICAgICAgICByZWZlcmVuY2VFbGVtZW50Py5hZnRlcihidXR0b25Db250YWluZXIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBjYXJkQnV0dG9uc0VsZW1lbnQgPVxuICAgICAgICAgICAgICAgIHBhcmVudEVsZW1lbnQ/LnF1ZXJ5U2VsZWN0b3IoJy5jYXJkLWJ1dHRvbnMnKTtcblxuICAgICAgICAgICAgLy8gQWRkIE1pc2ZpcmUgYnV0dG9uXG4gICAgICAgICAgICBpZiAoY2hlY2tNaXNmaXJlKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbWlzZmlyZUJ0biA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgICAgICAgICAgICAgIG1pc2ZpcmVCdG4ub25jbGljayA9IHRoaXMub25DbGlja01pc2ZpcmUuYmluZCh0aGlzKTtcbiAgICAgICAgICAgICAgICBtaXNmaXJlQnRuLmlubmVySFRNTCA9IGAke3RoaXMubWFrZUljb24oJ2ZhLWJ1cnN0Jyl9JHt0aGlzLnRyYW5zbGF0ZShcbiAgICAgICAgICAgICAgICAgICAgJ1dFQVBPTl9SRUxPQUQuRmVhdHVyZXMuUmVsb2FkYWJsZVdlYXBvbkF0dGFjay5NaXNmaXJlZEJ0blR4dCdcbiAgICAgICAgICAgICAgICApfWA7XG4gICAgICAgICAgICAgICAgY2FyZEJ1dHRvbnNFbGVtZW50Py5hcHBlbmQobWlzZmlyZUJ0bik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEFkZCBhbW1vIHJlZnVuZCBidXR0b25cbiAgICAgICAgICAgIGNvbnN0IHJlZnVuZEJ0biA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgICAgICAgICAgcmVmdW5kQnRuLm9uY2xpY2sgPSB0aGlzLm9uQ2xpY2tSZWZ1bmQuYmluZCh0aGlzKTtcbiAgICAgICAgICAgIHJlZnVuZEJ0bi5pbm5lckhUTUwgPSBgJHt0aGlzLm1ha2VJY29uKCdmYS11bmRvJyl9JHt0aGlzLnRyYW5zbGF0ZShcbiAgICAgICAgICAgICAgICAnV0VBUE9OX1JFTE9BRC5GZWF0dXJlcy5SZWxvYWRhYmxlV2VhcG9uQXR0YWNrLlJlZnVuZEJ0blR4dCdcbiAgICAgICAgICAgICl9YDtcbiAgICAgICAgICAgIGNhcmRCdXR0b25zRWxlbWVudD8uYXBwZW5kKHJlZnVuZEJ0bik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXROZXh0Um91bmQoKTogRG5kSXRlbTVlIHtcbiAgICAgICAgY29uc3QgY2hhcmFjdGVyID0gdGhpcy5jaGFyYWN0ZXI7XG4gICAgICAgIGNvbnN0IHdlYXBvbiA9IHRoaXMud2VhcG9uO1xuXG4gICAgICAgIGNvbnN0IGxvYWRvdXQgPSB0aGlzLmxvYWRvdXQ7XG4gICAgICAgIGxvYWRvdXQucHVzaCgnRW1wdHknKTtcbiAgICAgICAgY29uc3QgbmV4dFJvdW5kID0gbG9hZG91dC5zaGlmdCgpO1xuXG4gICAgICAgIC8vIFJlbW92ZSB0aGUgYnVsbGV0IGZyb20gdGhlIHJlbG9hZGFibGVXZWFwb24gYW1tdW5pdGlvblxuICAgICAgICB3ZWFwb24uc2V0RmxhZyh0aGlzLm1vZHVsZU1hbmFnZXIuaWQsICdjaGFtYmVyZWQnLCBsb2Fkb3V0KTtcblxuICAgICAgICBjb25zdCBpbnZlbnRvcnlBbW11bml0aW9uID0gdGhpcy5hbW11bml0aW9uKFxuICAgICAgICAgICAgY2hhcmFjdGVyLml0ZW1zXG4gICAgICAgICkgYXMgRG5kSXRlbTVlW107XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICBpbnZlbnRvcnlBbW11bml0aW9uLmZpbmQoKGFtbW86IERuZEl0ZW01ZSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5hbWUgPSBhbW1vLm5hbWU7XG4gICAgICAgICAgICAgICAgaWYgKG5hbWUgPT0gbmV4dFJvdW5kKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhbW1vO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH0pIHx8ICh7IG5hbWU6ICdFbXB0eScgfSBhcyBEbmRJdGVtNWUpXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgZHJ5ZmlyZVdlYXBvbigpIHtcbiAgICAgICAgY29uc3QgY2hhcmFjdGVyID0gdGhpcy5jaGFyYWN0ZXI7XG4gICAgICAgIGNvbnN0IHdlYXBvbiA9IHRoaXMud2VhcG9uO1xuXG4gICAgICAgIGNvbnN0IHJlbmRlckhvb2tJZCA9IEhvb2tzLm9uKFxuICAgICAgICAgICAgJ3JlbmRlckNoYXRNZXNzYWdlJyxcbiAgICAgICAgICAgIChfY2hhdEl0ZW0sIGh0bWwpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCByZWxvYWRCdG4gPSBodG1sWzBdLnF1ZXJ5U2VsZWN0b3IoJy5yZWxvYWQtYW1tbycpO1xuICAgICAgICAgICAgICAgIHJlbG9hZEJ0bj8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVsb2FkKGNoYXJhY3Rlciwgd2VhcG9uKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGlmIChyZWxvYWRCdG4pIHtcbiAgICAgICAgICAgICAgICAgICAgSG9va3Mub2ZmKCdyZW5kZXJDaGF0TWVzc2FnZScsIHJlbmRlckhvb2tJZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICApO1xuXG4gICAgICAgIGNvbnN0IHRlbXBsYXRlRGF0YTogQWN0aXZpdHlDYXJkQ2hhdFR5cGUgPSB7XG4gICAgICAgICAgICBkZXNjcmlwdGlvbjoge1xuICAgICAgICAgICAgICAgIGNoYXQ6IGA8cD4ke3RoaXMudHJhbnNsYXRlKFxuICAgICAgICAgICAgICAgICAgICAnV0VBUE9OX1JFTE9BRC5GZWF0dXJlcy5SZWxvYWRhYmxlV2VhcG9uQXR0YWNrLkRyeUZpcmVEZXNjcmlwdGlvbicsXG4gICAgICAgICAgICAgICAgICAgIHsgbmFtZTogY2hhcmFjdGVyLm5hbWUsIHJlbG9hZGFibGVXZWFwb246IHdlYXBvbi5uYW1lIH0sXG4gICAgICAgICAgICAgICAgICAgIHRydWVcbiAgICAgICAgICAgICAgICApfTwvcD5gLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGl0ZW06IHtcbiAgICAgICAgICAgICAgICBpbWc6IHdlYXBvbi5pbWcsXG4gICAgICAgICAgICAgICAgbmFtZTogdGhpcy50cmFuc2xhdGUoXG4gICAgICAgICAgICAgICAgICAgICdXRUFQT05fUkVMT0FELkZlYXR1cmVzLlJlbG9hZGFibGVXZWFwb25BdHRhY2suRHJ5RmlyZVRpdGxlJ1xuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc3VidGl0bGU6IHdlYXBvbi5uYW1lLFxuICAgICAgICAgICAgYnV0dG9uczogW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YXNldDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmlzaWJpbGl0eTogJ2FsbCcsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGljb246IHRoaXMubWFrZUljb24oJ2ZhLXJvdGF0ZS1yaWdodCcpLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogdGhpcy50cmFuc2xhdGUoJ1dFQVBPTl9SRUxPQUQuRmVhdHVyZXMuUmVsb2FkLlRleHQnKSxcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NlczogJ3JlbG9hZC1hbW1vJyxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnJlbmRlckNhcmQodGVtcGxhdGVEYXRhLCBjaGFyYWN0ZXIpO1xuICAgIH1cblxuICAgIGFzeW5jIHJlbmRlckNhcmQodGVtcGxhdGVEYXRhOiBBY3Rpdml0eUNhcmRDaGF0VHlwZSwgY2hhcmFjdGVyOiBBY3RvcjVlKSB7XG4gICAgICAgIGNvbnN0IGh0bWxUZW1wbGF0ZSA9IGF3YWl0IChcbiAgICAgICAgICAgIGZvdW5kcnkuYXBwbGljYXRpb25zIGFzIGFueVxuICAgICAgICApLmhhbmRsZWJhcnMucmVuZGVyVGVtcGxhdGUoXG4gICAgICAgICAgICAnbW9kdWxlcy9mdnR0LXdlYXBvbi1yZWxvYWQvdGVtcGxhdGVzL2FjdGl2aXR5LWNhcmQuaGJzJyxcbiAgICAgICAgICAgIHRlbXBsYXRlRGF0YVxuICAgICAgICApO1xuICAgICAgICB0aGlzLm1vZHVsZU1hbmFnZXIudWlNYW5hZ2VyLnNlbmRDaGF0KGNoYXJhY3RlciwgaHRtbFRlbXBsYXRlKTtcbiAgICB9XG5cbiAgICBmaXJlUm91bmQoYnVsbGV0OiBEbmRJdGVtNWUpIHtcbiAgICAgICAgY29uc3QgcmVsb2FkYWJsZVdlYXBvbiA9IHRoaXMud2VhcG9uO1xuICAgICAgICBjb25zdCBtYXhTaG90cyA9IHJlbG9hZGFibGVXZWFwb24uc3lzdGVtLnVzZXMubWF4O1xuICAgICAgICBjb25zdCBmaXJlZExvYWRvdXQgPVxuICAgICAgICAgICAgKHJlbG9hZGFibGVXZWFwb24uZ2V0RmxhZyhcbiAgICAgICAgICAgICAgICB0aGlzLm1vZHVsZU1hbmFnZXIuaWQsXG4gICAgICAgICAgICAgICAgJ2ZpcmVkJ1xuICAgICAgICAgICAgKSBhcyBzdHJpbmdbXSkgfHwgbmV3IEFycmF5KG1heFNob3RzKS5maWxsKCdFbXB0eScpO1xuXG4gICAgICAgIGZpcmVkTG9hZG91dC51bnNoaWZ0KGJ1bGxldC5uYW1lKTtcbiAgICAgICAgZmlyZWRMb2Fkb3V0LnNwbGljZSgtMSk7XG4gICAgICAgIHJlbG9hZGFibGVXZWFwb24uc2V0RmxhZyh0aGlzLm1vZHVsZU1hbmFnZXIuaWQsICdmaXJlZCcsIGZpcmVkTG9hZG91dCk7XG5cbiAgICAgICAgY29uc3QgdXNlcyA9IHJlbG9hZGFibGVXZWFwb24uc3lzdGVtLnVzZXM7XG4gICAgICAgIGNvbnN0IHF0eTogbnVtYmVyID1cbiAgICAgICAgICAgIHVzZXMuc3BlbnQgKyAxIDw9IHVzZXMubWF4ID8gdXNlcy5zcGVudCArIDEgOiB1c2VzLm1heDtcblxuICAgICAgICByZWxvYWRhYmxlV2VhcG9uLnVwZGF0ZSh7XG4gICAgICAgICAgICAnc3lzdGVtLnVzZXMuc3BlbnQnOiBxdHksXG4gICAgICAgICAgICAnc3lzdGVtLnVzZXMudmFsdWUnOiB1c2VzLm1heCAtIHF0eSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKGJ1bGxldC5uYW1lICE9PSAnRW1wdHknKSB7XG4gICAgICAgICAgICBidWxsZXQudXNlKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgcmVsb2FkKGFjdG9yOiBBY3RvcjVlLCByZWxvYWRhYmxlV2VhcG9uOiBEbmRJdGVtNWUpIHtcbiAgICAgICAgdGhpcy5mZWF0dXJlTWFuYWdlclxuICAgICAgICAgICAgLmdldEZlYXR1cmUoJ3JlbG9hZCcpXG4gICAgICAgICAgICAub25SZWxvYWRDYWxsYmFjayhhY3RvciwgcmVsb2FkYWJsZVdlYXBvbik7XG4gICAgfVxuXG4gICAgYXN5bmMgb25DbGlja1JlZnVuZCgpIHtcbiAgICAgICAgY29uc3QgYWN0b3IgPSB0aGlzLmNoYXJhY3RlcjtcbiAgICAgICAgY29uc3QgcmVsb2FkYWJsZVdlYXBvbiA9IHRoaXMud2VhcG9uO1xuICAgICAgICBjb25zdCBpbnZlbnRvcnlBbW11bml0aW9uID0gdGhpcy5hbW11bml0aW9uKGFjdG9yLml0ZW1zKTtcblxuICAgICAgICBjb25zdCBmaXJlZCA9IHRoaXMuZmlyZWQ7XG4gICAgICAgIGNvbnN0IHJlZnVuZDogc3RyaW5nID0gZmlyZWQuc3BsaWNlKDAsIDEpWzBdIGFzIHN0cmluZztcbiAgICAgICAgZmlyZWQucHVzaCgnRW1wdHknKTtcblxuICAgICAgICBpZiAocmVmdW5kID09ICdFbXB0eScpIHtcbiAgICAgICAgICAgIC8vIE5vdGlmeSB0aGUgdXNlciB0aGF0IHRoZXJlIGlzIG5vIGFtbXVuaXRpb24gdG8gcmVmdW5kXG4gICAgICAgICAgICB0aGlzLm1vZHVsZU1hbmFnZXIudWlNYW5hZ2VyLnVpTm90aWZpY2F0aW9uKFxuICAgICAgICAgICAgICAgIHRoaXMudHJhbnNsYXRlKFxuICAgICAgICAgICAgICAgICAgICAnV0VBUE9OX1JFTE9BRC5GZWF0dXJlcy5SZWxvYWRhYmxlV2VhcG9uQXR0YWNrLlJlZnVuZC5SZWZ1bmROb01vcmVNc2cnLFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBhY3Rvci5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVsb2FkYWJsZVdlYXBvbjogcmVsb2FkYWJsZVdlYXBvbi5uYW1lLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAnd2FybidcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBhd2FpdCByZWxvYWRhYmxlV2VhcG9uLnNldEZsYWcodGhpcy5tb2R1bGVNYW5hZ2VyLmlkLCAnZmlyZWQnLCBmaXJlZCk7XG5cbiAgICAgICAgbGV0IGJ1bGxldCA9IHsgbmFtZTogcmVmdW5kIH0gYXMgRG5kSXRlbTVlO1xuICAgICAgICBpbnZlbnRvcnlBbW11bml0aW9uLmZvckVhY2goKGFtbW86IEl0ZW01ZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbmFtZSA9IGFtbW8ubmFtZTtcbiAgICAgICAgICAgIGlmIChuYW1lID09IHJlZnVuZCkge1xuICAgICAgICAgICAgICAgIGJ1bGxldCA9IGFtbW8gYXMgRG5kSXRlbTVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBSZWZ1bmQgdGhlIG5vbi1FbXB0eSBhbW11bml0aW9uXG4gICAgICAgIGNvbnN0IGFtbW9Mb2Fkb3V0ID0gdGhpcy5sb2Fkb3V0O1xuICAgICAgICBhbW1vTG9hZG91dC51bnNoaWZ0KHJlZnVuZCk7XG4gICAgICAgIGFtbW9Mb2Fkb3V0LnNwbGljZSgtMSk7XG4gICAgICAgIGF3YWl0IHJlbG9hZGFibGVXZWFwb24uc2V0RmxhZyhcbiAgICAgICAgICAgIHRoaXMubW9kdWxlTWFuYWdlci5pZCxcbiAgICAgICAgICAgICdjaGFtYmVyZWQnLFxuICAgICAgICAgICAgYW1tb0xvYWRvdXRcbiAgICAgICAgKTtcblxuICAgICAgICAvLyBVcGRhdGUgdGhlIHJlbG9hZGFibGVXZWFwb24gdXNlc1xuICAgICAgICBjb25zdCB1c2VzID0gcmVsb2FkYWJsZVdlYXBvbi5zeXN0ZW0udXNlcztcbiAgICAgICAgY29uc3QgcXR5OiBudW1iZXIgPSB1c2VzLnNwZW50IC0gMSA+PSAwID8gdXNlcy5zcGVudCAtIDEgOiAwO1xuICAgICAgICByZWxvYWRhYmxlV2VhcG9uLnVwZGF0ZSh7XG4gICAgICAgICAgICAnc3lzdGVtLnVzZXMuc3BlbnQnOiBxdHksXG4gICAgICAgICAgICAnc3lzdGVtLnVzZXMudmFsdWUnOiB1c2VzLm1heCAtIHF0eSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gTm90aWZ5IHRoZSB1c2VyIHRoYXQgdGhlIHJlZnVuZCB3YXMgYSBzdWNjZXNzXG4gICAgICAgIGNvbnN0IGh0bWxUZW1wbGF0ZSA9IGF3YWl0IChcbiAgICAgICAgICAgIGZvdW5kcnkuYXBwbGljYXRpb25zIGFzIGFueVxuICAgICAgICApLmhhbmRsZWJhcnMucmVuZGVyVGVtcGxhdGUoXG4gICAgICAgICAgICAnbW9kdWxlcy9mdnR0LXdlYXBvbi1yZWxvYWQvdGVtcGxhdGVzL2FtbW9SZWZ1bmROb3RpY2VUZW1wbGF0ZS5oYnMnLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGl0ZW06IHtcbiAgICAgICAgICAgICAgICAgICAgaW1nOiBidWxsZXQuaW1nLFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiBidWxsZXQubmFtZSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiB0aGlzLnRyYW5zbGF0ZShcbiAgICAgICAgICAgICAgICAgICAgJ1dFQVBPTl9SRUxPQUQuRmVhdHVyZXMuUmVsb2FkYWJsZVdlYXBvbkF0dGFjay5SZWZ1bmQuUmVmdW5kQ29tcGxldGVNc2cnLFxuICAgICAgICAgICAgICAgICAgICB7IGJ1bGxldDogcmVmdW5kLCBuYW1lOiByZWxvYWRhYmxlV2VhcG9uLm5hbWUgfSxcbiAgICAgICAgICAgICAgICAgICAgdHJ1ZVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgdGl0bGU6IHRoaXMudHJhbnNsYXRlKFxuICAgICAgICAgICAgICAgICAgICAnV0VBUE9OX1JFTE9BRC5GZWF0dXJlcy5SZWxvYWRhYmxlV2VhcG9uQXR0YWNrLlJlZnVuZC5SZWZ1bmRDb21wbGV0ZVRpdGxlJ1xuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgICAgIHRoaXMubW9kdWxlTWFuYWdlci51aU1hbmFnZXIuc2VuZENoYXQoYWN0b3IsIGh0bWxUZW1wbGF0ZSk7XG4gICAgfVxuXG4gICAgYXN5bmMgb25DbGlja01pc2ZpcmUoKSB7XG4gICAgICAgIGNvbnN0IGFjdG9yID0gdGhpcy5jaGFyYWN0ZXI7XG4gICAgICAgIGNvbnN0IHJvbGwgPSBhd2FpdCBuZXcgUm9sbCgnMWQ2Jykucm9sbCgpO1xuICAgICAgICBhd2FpdCByb2xsLnRvTWVzc2FnZSh7XG4gICAgICAgICAgICBzcGVha2VyOiB7XG4gICAgICAgICAgICAgICAgYWxpYXM6IGFjdG9yLm5hbWUsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBtYWtlSWNvbihpY29uOiBzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIGA8aSBjbGFzcz1cImZhcyAke2ljb259XCI+PC9pPmA7XG4gICAgfVxuXG4gICAgdG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiAnY2xhc3MgUmVsb2FkYWJsZVdlYXBvbkF0dGFja0ZlYXR1cmUnO1xuICAgIH1cbn1cbiIsImltcG9ydCBGZWF0dXJlTWFuYWdlciBmcm9tICcuLi9tYW5hZ2Vycy9GZWF0dXJlTWFuYWdlcic7XG5pbXBvcnQgQmFzZUZlYXR1cmUgZnJvbSAnLi9CYXNlRmVhdHVyZSc7XG5pbXBvcnQgeyBEbmRJdGVtNWUgfSBmcm9tICcuLi90eXBlcyc7XG5cbmV4cG9ydCBjbGFzcyBSZWxvYWRhYmxlV2VhcG9uQ3JlYXRpb25GZWF0dXJlIGV4dGVuZHMgQmFzZUZlYXR1cmUge1xuICAgIHByaXZhdGUgX2NyZWF0aW5nUmVsb2FkYWJsZVdlYXBvbjogYm9vbGVhbjtcbiAgICBwcml2YXRlIF9jcmVhdGVJdGVtSG9va0lkOiBudW1iZXI7XG5cbiAgICBjb25zdHJ1Y3RvcihmZWF0dXJlTWFuYWdlcjogRmVhdHVyZU1hbmFnZXIpIHtcbiAgICAgICAgc3VwZXIoZmVhdHVyZU1hbmFnZXIpO1xuICAgICAgICB0aGlzLl9jcmVhdGluZ1JlbG9hZGFibGVXZWFwb24gPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fY3JlYXRlSXRlbUhvb2tJZCA9IC0xO1xuICAgIH1cblxuICAgIGluaXQoKSB7XG4gICAgICAgIEhvb2tzLm9uKCdwcmVDcmVhdGVJdGVtJywgdGhpcy5vblByZUNyZWF0ZUl0ZW0uYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgYXN5bmMgb25QcmVDcmVhdGVJdGVtKGl0ZW06IERuZEl0ZW01ZSkge1xuICAgICAgICBpZiAoaXRlbS5zeXN0ZW0udHlwZS5iYXNlSXRlbSA9PSAncmVsb2FkYWJsZVdlYXBvbicpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdXZWFwb24gUmVsb2FkIHwgVHJpZ2dlcmVkIFByZS1DcmVhdGlvbicpO1xuXG4gICAgICAgICAgICB0aGlzLndlYXBvbklkID0gaXRlbS5pZDtcbiAgICAgICAgICAgIHRoaXMuY2hhcmFjdGVySWQgPSBpdGVtLmFjdG9yPy5pZCBhcyBzdHJpbmc7XG4gICAgICAgICAgICB0aGlzLl9jcmVhdGluZ1JlbG9hZGFibGVXZWFwb24gPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5fY3JlYXRlSXRlbUhvb2tJZCA9IEhvb2tzLm9uKFxuICAgICAgICAgICAgICAgICdjcmVhdGVJdGVtJyxcbiAgICAgICAgICAgICAgICB0aGlzLm9uQ3JlYXRlSXRlbS5iaW5kKHRoaXMpXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgYXN5bmMgb25DcmVhdGVJdGVtKGl0ZW06IERuZEl0ZW01ZSkge1xuICAgICAgICBpZiAoIXRoaXMuX2NyZWF0aW5nUmVsb2FkYWJsZVdlYXBvbiB8fCBpdGVtLmlkICE9PSB0aGlzLndlYXBvbklkKVxuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKCdXZWFwb24gUmVsb2FkIHwgVHJpZ2dlcmVkIFJlbG9hZGFibGVXZWFwb24gQ3JlYXRpb24nKTtcblxuICAgICAgICBjb25zdCByZWxvYWRhYmxlV2VhcG9uID0gdGhpcy53ZWFwb247XG4gICAgICAgIGNvbnN0IGFtbW9RdHkgPSByZWxvYWRhYmxlV2VhcG9uLnN5c3RlbS51c2VzLm1heDtcblxuICAgICAgICBhd2FpdCByZWxvYWRhYmxlV2VhcG9uLnVwZGF0ZSh7XG4gICAgICAgICAgICAnc3lzdGVtLnVzZXMuc3BlbnQnOiBhbW1vUXR5LFxuICAgICAgICAgICAgJ3N5c3RlbS51c2VzLnZhbHVlJzogMCxcbiAgICAgICAgfSk7XG4gICAgICAgIGF3YWl0IHJlbG9hZGFibGVXZWFwb24uc2V0RmxhZyhcbiAgICAgICAgICAgIHRoaXMubW9kdWxlTWFuYWdlci5pZCxcbiAgICAgICAgICAgICdjaGFtYmVyZWQnLFxuICAgICAgICAgICAgbmV3IEFycmF5KGFtbW9RdHkpLmZpbGwoJ0VtcHR5JylcbiAgICAgICAgKTtcbiAgICAgICAgYXdhaXQgcmVsb2FkYWJsZVdlYXBvbi5zZXRGbGFnKFxuICAgICAgICAgICAgdGhpcy5tb2R1bGVNYW5hZ2VyLmlkLFxuICAgICAgICAgICAgJ2ZpcmVkJyxcbiAgICAgICAgICAgIG5ldyBBcnJheShhbW1vUXR5KS5maWxsKCdFbXB0eScpXG4gICAgICAgICk7XG5cbiAgICAgICAgdGhpcy53ZWFwb25JZCA9ICcnO1xuICAgICAgICB0aGlzLmNoYXJhY3RlcklkID0gJyc7XG4gICAgICAgIHRoaXMuX2NyZWF0aW5nUmVsb2FkYWJsZVdlYXBvbiA9IGZhbHNlO1xuICAgICAgICBIb29rcy5vZmYoJ2NyZWF0ZUl0ZW0nLCB0aGlzLl9jcmVhdGVJdGVtSG9va0lkKTtcbiAgICAgICAgdGhpcy5fY3JlYXRlSXRlbUhvb2tJZCA9IC0xO1xuICAgIH1cblxuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gJ2NsYXNzIFJlbG9hZGFibGVXZWFwb25DcmVhdGlvbkZlYXR1cmUnO1xuICAgIH1cbn1cbiIsImV4cG9ydCB7IE5leHRSb3VuZEZlYXR1cmUgfSBmcm9tICcuL05leHRSb3VuZEZlYXR1cmUnO1xuZXhwb3J0IHsgUmVsb2FkYWJsZVdlYXBvbkF0dGFja0ZlYXR1cmUgfSBmcm9tICcuL1JlbG9hZGFibGVXZWFwb25BdHRhY2tGZWF0dXJlJztcbmV4cG9ydCB7IFJlbG9hZGFibGVXZWFwb25DcmVhdGlvbkZlYXR1cmUgfSBmcm9tICcuL1JlbG9hZGFibGVXZWFwb25DcmVhdGlvbkZlYXR1cmUnO1xuZXhwb3J0IHsgUmVsb2FkRmVhdHVyZSB9IGZyb20gJy4vUmVsb2FkRmVhdHVyZSc7XG4iLCJpbXBvcnQgTW9kdWxlTWFuYWdlciBmcm9tICcuL01vZHVsZU1hbmFnZXInO1xuaW1wb3J0IHtcbiAgICBOZXh0Um91bmRGZWF0dXJlLFxuICAgIFJlbG9hZGFibGVXZWFwb25BdHRhY2tGZWF0dXJlLFxuICAgIFJlbG9hZGFibGVXZWFwb25DcmVhdGlvbkZlYXR1cmUsXG4gICAgUmVsb2FkRmVhdHVyZSxcbn0gZnJvbSAnLi4vZmVhdHVyZXMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBGZWF0dXJlTWFuYWdlciB7XG4gICAgcHJpdmF0ZSBfbW9kdWxlTWFuYWdlcjogTW9kdWxlTWFuYWdlcjtcbiAgICBwcml2YXRlIF9mZWF0dXJlczogeyBba2V5OiBzdHJpbmddOiBhbnkgfTtcblxuICAgIGNvbnN0cnVjdG9yKG1vZHVsZU1hbmFnZXI6IE1vZHVsZU1hbmFnZXIpIHtcbiAgICAgICAgdGhpcy5fbW9kdWxlTWFuYWdlciA9IG1vZHVsZU1hbmFnZXI7XG4gICAgICAgIHRoaXMuX2ZlYXR1cmVzID0ge307XG4gICAgfVxuXG4gICAgaW5pdCgpIHtcbiAgICAgICAgdGhpcy5fZmVhdHVyZXMgPSB7XG4gICAgICAgICAgICBuZXh0Um91bmQ6IG5ldyBOZXh0Um91bmRGZWF0dXJlKHRoaXMpLFxuICAgICAgICAgICAgcmVsb2FkOiBuZXcgUmVsb2FkRmVhdHVyZSh0aGlzKSxcbiAgICAgICAgICAgIHJlbG9hZGFibGVXZWFwb25BdHRhY2s6IG5ldyBSZWxvYWRhYmxlV2VhcG9uQXR0YWNrRmVhdHVyZSh0aGlzKSxcbiAgICAgICAgICAgIHJlbG9hZGFibGVXZWFwb25DcmVhdGlvbjogbmV3IFJlbG9hZGFibGVXZWFwb25DcmVhdGlvbkZlYXR1cmUodGhpcyksXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZ2V0RmVhdHVyZShpZDogc3RyaW5nKSB7XG4gICAgICAgIGlmICh0aGlzLl9mZWF0dXJlc1tpZF0pIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9mZWF0dXJlc1tpZF07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgZ2V0IG1vZHVsZU1hbmFnZXIoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9tb2R1bGVNYW5hZ2VyO1xuICAgIH1cblxuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gYGNsYXNzIEZlYXR1cmVNYW5hZ2VyOiAke3RoaXMuX2ZlYXR1cmVzLmxlbmd0aH1gO1xuICAgIH1cbn1cbiIsImltcG9ydCBGZWF0dXJlTWFuYWdlciBmcm9tICcuL0ZlYXR1cmVNYW5hZ2VyJztcbmltcG9ydCBVaU1hbmFnZXIgZnJvbSAnLi9VaU1hbmFnZXInO1xuaW1wb3J0IFRlbXBsYXRlTWFuYWdlciBmcm9tICcuL1RlbXBsYXRlTWFuYWdlcic7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1vZHVsZU1hbmFnZXIge1xuICAgIHByaXZhdGUgX21vZHVsZUlkOiBzdHJpbmc7XG4gICAgcHJpdmF0ZSBfZmVhdHVyZU1hbmFnZXI6IEZlYXR1cmVNYW5hZ2VyO1xuICAgIHByaXZhdGUgX3VpTWFuYWdlcjogVWlNYW5hZ2VyO1xuICAgIHByaXZhdGUgX3RlbXBsYXRlTWFuYWdlcjogVGVtcGxhdGVNYW5hZ2VyO1xuXG4gICAgY29uc3RydWN0b3IoaWQ6IHN0cmluZykge1xuICAgICAgICB0aGlzLl9tb2R1bGVJZCA9IGlkO1xuICAgICAgICB0aGlzLl9mZWF0dXJlTWFuYWdlciA9IG5ldyBGZWF0dXJlTWFuYWdlcih0aGlzKTtcbiAgICAgICAgdGhpcy5fdWlNYW5hZ2VyID0gbmV3IFVpTWFuYWdlcih0aGlzKTtcbiAgICAgICAgdGhpcy5fdGVtcGxhdGVNYW5hZ2VyID0gbmV3IFRlbXBsYXRlTWFuYWdlcigpO1xuICAgIH1cblxuICAgIGdldCBpZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX21vZHVsZUlkO1xuICAgIH1cblxuICAgIGdldCBmZWF0dXJlTWFuYWdlcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ZlYXR1cmVNYW5hZ2VyO1xuICAgIH1cblxuICAgIGdldCB1aU1hbmFnZXIoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl91aU1hbmFnZXI7XG4gICAgfVxuXG4gICAgZ2V0IHRlbXBsYXRlTWFuYWdlcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3RlbXBsYXRlTWFuYWdlcjtcbiAgICB9XG5cbiAgICBpbml0KCkge1xuICAgICAgICB0aGlzLnN5c3RlbU92ZXJyaWRlcygpO1xuICAgICAgICB0aGlzLm1vZHVsZUNvbmZpZ3VyYXRpb25zKCk7XG4gICAgICAgIHRoaXMuX2ZlYXR1cmVNYW5hZ2VyLmluaXQoKTtcbiAgICAgICAgdGhpcy5fdGVtcGxhdGVNYW5hZ2VyLmluaXQoKTtcbiAgICB9XG5cbiAgICBzeXN0ZW1PdmVycmlkZXMoKSB7XG4gICAgICAgIChDT05GSUcgYXMgYW55KS5ETkQ1RS5mZWF0dXJlVHlwZXMuaXRlbSA9IHtcbiAgICAgICAgICAgIGxhYmVsOiB0aGlzLnVpTWFuYWdlci5nZXRMb2NhbGl6ZWRUeHQoJ1dFQVBPTl9SRUxPQUQuSXRlbUZlYXR1cmUnKSxcbiAgICAgICAgfTtcblxuICAgICAgICAoQ09ORklHIGFzIGFueSkuRE5ENUUuaXRlbVByb3BlcnRpZXMuY29uY2VhbGFibGUgPSB7XG4gICAgICAgICAgICBsYWJlbDogdGhpcy51aU1hbmFnZXIuZ2V0TG9jYWxpemVkVHh0KCdXRUFQT05fUkVMT0FELkNvbmNlYWxhYmxlJyksXG4gICAgICAgIH07XG4gICAgICAgIChDT05GSUcgYXMgYW55KS5ETkQ1RS52YWxpZFByb3BlcnRpZXMud2VhcG9uLmFkZCgnY29uY2VhbGFibGUnKTtcblxuICAgICAgICAoQ09ORklHIGFzIGFueSkuRE5ENUUuaXRlbVByb3BlcnRpZXMudW5zdGFibGUgPSB7XG4gICAgICAgICAgICBsYWJlbDogdGhpcy51aU1hbmFnZXIuZ2V0TG9jYWxpemVkVHh0KCdXRUFQT05fUkVMT0FELlVuc3RhYmxlJyksXG4gICAgICAgICAgICBpc1BoeXNpY2FsOiB0cnVlLFxuICAgICAgICB9O1xuXG4gICAgICAgIChDT05GSUcgYXMgYW55KS5ETkQ1RS53ZWFwb25JZHMucmVsb2FkYWJsZVdlYXBvbiA9XG4gICAgICAgICAgICAnQ29tcGVuZGl1bS5mdnR0LXdlYXBvbi1yZWxvYWQuaXRlbS1wYWNrLkl0ZW0ubEU2MFFhUzFzY3RiM09BZCc7XG4gICAgfVxuXG4gICAgbW9kdWxlQ29uZmlndXJhdGlvbnMoKSB7XG4gICAgICAgIGNvbnN0IG1vZHVsZU5hbWUgPSAnZnZ0dC13ZWFwb24tcmVsb2FkJztcblxuICAgICAgICBnYW1lLnNldHRpbmdzLnJlZ2lzdGVyKG1vZHVsZU5hbWUsICd1bnN0YWJsZUFtbW8nLCB7XG4gICAgICAgICAgICBzY29wZTogJ3dvcmxkJyxcbiAgICAgICAgICAgIG5hbWU6ICdTRVRUSU5HUy5XRUFQT05fUkVMT0FELlVuc3RhYmxlQW1tby5OYW1lJyxcbiAgICAgICAgICAgIGhpbnQ6ICdTRVRUSU5HUy5XRUFQT05fUkVMT0FELlVuc3RhYmxlQW1tby5IaW50JyxcbiAgICAgICAgICAgIHR5cGU6IEJvb2xlYW4sXG4gICAgICAgICAgICBjb25maWc6IHRydWUsXG4gICAgICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICB9KTtcblxuICAgICAgICBnYW1lLnNldHRpbmdzLnJlZ2lzdGVyKG1vZHVsZU5hbWUsICd1bnN0YWJsZUFtbW9GYWlsdXJlVGhyZXNoaG9sZCcsIHtcbiAgICAgICAgICAgIHNjb3BlOiAnd29ybGQnLFxuICAgICAgICAgICAgbmFtZTogJ1NFVFRJTkdTLldFQVBPTl9SRUxPQUQuVW5zdGFibGVBbW1vRmFpbHVyZVRocmVzaG9sZC5OYW1lJyxcbiAgICAgICAgICAgIGhpbnQ6ICdTRVRUSU5HUy5XRUFQT05fUkVMT0FELlVuc3RhYmxlQW1tb0ZhaWx1cmVUaHJlc2hvbGQuSGludCcsXG4gICAgICAgICAgICB0eXBlOiBOdW1iZXIsXG4gICAgICAgICAgICBjb25maWc6IHRydWUsXG4gICAgICAgICAgICBkZWZhdWx0OiAyLFxuICAgICAgICB9KTtcblxuICAgICAgICBnYW1lLnNldHRpbmdzLnJlZ2lzdGVyKG1vZHVsZU5hbWUsICd1c2VNaXNmaXJlcycsIHtcbiAgICAgICAgICAgIHNjb3BlOiAnd29ybGQnLFxuICAgICAgICAgICAgbmFtZTogJ1NFVFRJTkdTLldFQVBPTl9SRUxPQUQuVXNlTWlzZmlyZXMuTmFtZScsXG4gICAgICAgICAgICBoaW50OiAnU0VUVElOR1MuV0VBUE9OX1JFTE9BRC5Vc2VNaXNmaXJlcy5IaW50JyxcbiAgICAgICAgICAgIHR5cGU6IEJvb2xlYW4sXG4gICAgICAgICAgICBjb25maWc6IHRydWUsXG4gICAgICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICB9KTtcblxuICAgICAgICBnYW1lLnNldHRpbmdzLnJlZ2lzdGVyKG1vZHVsZU5hbWUsICdmaWx0ZXJBbW11bml0aW9uQnlFcXVpcHBlZCcsIHtcbiAgICAgICAgICAgIHNjb3BlOiAndXNlcicsXG4gICAgICAgICAgICBuYW1lOiAnU0VUVElOR1MuV0VBUE9OX1JFTE9BRC5GaWx0ZXJBbW11bml0aW9uQnlFcXVpcHBlZC5OYW1lJyxcbiAgICAgICAgICAgIGhpbnQ6ICdTRVRUSU5HUy5XRUFQT05fUkVMT0FELkZpbHRlckFtbXVuaXRpb25CeUVxdWlwcGVkLkhpbnQnLFxuICAgICAgICAgICAgdHlwZTogQm9vbGVhbixcbiAgICAgICAgICAgIGNvbmZpZzogdHJ1ZSxcbiAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBkZWJ1Zyhob29rczogYm9vbGVhbiA9IGZhbHNlKSB7XG4gICAgICAgIENPTkZJRy5kZWJ1Zy5ob29rcyA9IGhvb2tzO1xuICAgICAgICBjb25zb2xlLmxvZygnQ09ORklHOiAnLCBDT05GSUcpO1xuICAgICAgICBjb25zb2xlLmxvZygnQ09ORklHLkRORDVFOiAnLCAoQ09ORklHIGFzIGFueSkuRE5ENUUpO1xuICAgIH1cblxuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gJ2NsYXNzIE1vZHVsZU1hbmFnZXInO1xuICAgIH1cbn1cbiIsImV4cG9ydCBkZWZhdWx0IGNsYXNzIFRlbXBsYXRlTWFuYWdlciB7XG4gICAgY29uc3RydWN0b3IoKSB7fVxuXG4gICAgaW5pdCgpIHtcbiAgICAgICAgKGZvdW5kcnkuYXBwbGljYXRpb25zIGFzIGFueSkuaGFuZGxlYmFycy5sb2FkVGVtcGxhdGVzKFxuICAgICAgICAgICAgVGVtcGxhdGVNYW5hZ2VyLnBhdGhzXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgc3RhdGljIGdldCBwYXRocygpIHtcbiAgICAgICAgY29uc3QgcGF0aHM6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH0gPSB7fTtcbiAgICAgICAgY29uc3QgdGVtcGxhdGVQYXRocyA9ICdtb2R1bGVzL2Z2dHQtd2VhcG9uLXJlbG9hZC90ZW1wbGF0ZXMvcmVsb2FkYWJsZVdlYXBvblJlbG9hZFRlbXBsYXRlLmhicyxtb2R1bGVzL2Z2dHQtd2VhcG9uLXJlbG9hZC90ZW1wbGF0ZXMvYmFzaWNNZXNzYWdlLmhicyxtb2R1bGVzL2Z2dHQtd2VhcG9uLXJlbG9hZC90ZW1wbGF0ZXMvYW1tb1NlbGVjdGlvbkRpYWxvZ1RlbXBsYXRlLmhicyxtb2R1bGVzL2Z2dHQtd2VhcG9uLXJlbG9hZC90ZW1wbGF0ZXMvYW1tb1JlZnVuZE5vdGljZVRlbXBsYXRlLmhicyxtb2R1bGVzL2Z2dHQtd2VhcG9uLXJlbG9hZC90ZW1wbGF0ZXMvYWN0aXZpdHktY2FyZC5oYnMnLnNwbGl0KCcsJyk7XG4gICAgICAgIGZvciAoY29uc3QgcGF0aCBvZiB0ZW1wbGF0ZVBhdGhzKSB7XG4gICAgICAgICAgICBwYXRoc1twYXRoLnJlcGxhY2UoJy5oYnMnLCAnLmh0bWwnKV0gPSBwYXRoO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwYXRocztcbiAgICB9XG5cbiAgICBzdGF0aWMgb25Ib3RSZWxvYWQoKSB7XG4gICAgICAgIGZvciAoY29uc3QgdGVtcGxhdGUgaW4gX3RlbXBsYXRlQ2FjaGUpIHtcbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoX3RlbXBsYXRlQ2FjaGUsIHRlbXBsYXRlKVxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgZGVsZXRlIF90ZW1wbGF0ZUNhY2hlW3RlbXBsYXRlXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIChmb3VuZHJ5LmFwcGxpY2F0aW9ucyBhcyBhbnkpLmhhbmRsZWJhcnNcbiAgICAgICAgICAgIC5sb2FkVGVtcGxhdGVzKHRoaXMucGF0aHMpXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBhcHBsaWNhdGlvbiBpbiB1aS53aW5kb3dzKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1aS53aW5kb3dzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcGxpY2F0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdWkud2luZG93c1thcHBsaWNhdGlvbl0ucmVuZGVyKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgdG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiAnY2xhc3MgVGVtcGxhdGVNYW5hZ2VyJztcbiAgICB9XG59XG4iLCJpbXBvcnQgTW9kdWxlTWFuYWdlciBmcm9tICcuL01vZHVsZU1hbmFnZXInO1xuaW1wb3J0IHsgdHlwZSBEaWFsb2dPcHRpb25zIH0gZnJvbSAnLi4vdHlwZXMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBVaU1hbmFnZXIge1xuICAgIHByaXZhdGUgX21vZHVsZU1hbmFnZXI6IE1vZHVsZU1hbmFnZXI7XG5cbiAgICBjb25zdHJ1Y3Rvcihtb2R1bGVNYW5hZ2VyOiBNb2R1bGVNYW5hZ2VyKSB7XG4gICAgICAgIHRoaXMuX21vZHVsZU1hbmFnZXIgPSBtb2R1bGVNYW5hZ2VyO1xuICAgIH1cblxuICAgIGdldCBtb2R1bGVNYW5hZ2VyKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fbW9kdWxlTWFuYWdlcjtcbiAgICB9XG5cbiAgICBidWlsZERpYWxvZyhvcHRpb25zOiBEaWFsb2dPcHRpb25zLCBpZDogc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiBuZXcgZm91bmRyeS5hcHBsaWNhdGlvbnMuYXBpLkRpYWxvZ1YyKHtcbiAgICAgICAgICAgIHdpbmRvdzoge1xuICAgICAgICAgICAgICAgIHRpdGxlOiBvcHRpb25zLnRpdGxlLFxuICAgICAgICAgICAgICAgIGNvbnRlbnRDbGFzc2VzOiBvcHRpb25zLmNvbnRlbnRDbGFzc2VzIHx8IFtdLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNvbnRlbnQ6IG9wdGlvbnMuY29udGVudCxcbiAgICAgICAgICAgIGJ1dHRvbnM6IG9wdGlvbnMuYnV0dG9ucyxcbiAgICAgICAgICAgIHN1Ym1pdDogb3B0aW9ucy5vblN1Ym1pdCxcbiAgICAgICAgICAgIGlkOiBpZCxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgdWlOb3RpZmljYXRpb24obXNnOiBzdHJpbmcsIHR5cGU6IHN0cmluZyA9ICdpbmZvJykge1xuICAgICAgICBpZiAodWkubm90aWZpY2F0aW9ucykge1xuICAgICAgICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnZXJyb3InOlxuICAgICAgICAgICAgICAgICAgICB1aS5ub3RpZmljYXRpb25zLmVycm9yKG1zZyk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ3dhcm4nOlxuICAgICAgICAgICAgICAgICAgICB1aS5ub3RpZmljYXRpb25zLndhcm4obXNnKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnaW5mbyc6XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgdWkubm90aWZpY2F0aW9ucy5pbmZvKG1zZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzZW5kQ2hhdChcbiAgICAgICAgc3BlYWtlcjogQWN0b3I1ZSxcbiAgICAgICAgY29udGVudDogc3RyaW5nLFxuICAgICAgICBmbGF2b3I/OiBzdHJpbmcsXG4gICAgICAgIHNvdW5kPzogc3RyaW5nLFxuICAgICAgICB3aGlzcGVyOiBzdHJpbmdbXSA9IFtdLFxuICAgICAgICB0eXBlOiAwIHwgMSB8IDIgfCAzIHwgNCB8IDUgPSBDT05TVC5DSEFUX01FU1NBR0VfVFlQRVMuT1RIRVJcbiAgICApIHtcbiAgICAgICAgY29uc3QgQ2hhdERhdGEgPSB7XG4gICAgICAgICAgICBzcGVha2VyOiBDaGF0TWVzc2FnZS5nZXRTcGVha2VyKHsgYWN0b3I6IHNwZWFrZXIgfSksXG4gICAgICAgICAgICB0eXBlLFxuICAgICAgICAgICAgZmxhdm9yLFxuICAgICAgICAgICAgc291bmQsXG4gICAgICAgICAgICBjb250ZW50LFxuICAgICAgICAgICAgd2hpc3BlcixcbiAgICAgICAgfTtcbiAgICAgICAgQ2hhdE1lc3NhZ2UuY3JlYXRlKENoYXREYXRhKTtcbiAgICB9XG5cbiAgICBnZXRMb2NhbGl6ZWRUeHQoXG4gICAgICAgIGtleTogc3RyaW5nLFxuICAgICAgICBvcHRzPzogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfSxcbiAgICAgICAgZm9ybWF0OiBib29sZWFuID0gZmFsc2VcbiAgICApIHtcbiAgICAgICAgaWYgKGZvcm1hdCkge1xuICAgICAgICAgICAgcmV0dXJuIChnYW1lIGFzIGFueSkuaTE4bi5mb3JtYXQoa2V5LCBvcHRzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gKGdhbWUgYXMgYW55KS5pMThuLmxvY2FsaXplKGtleSwgb3B0cyk7XG4gICAgfVxuXG4gICAgdG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiAnY2xhc3MgVWlNYW5hZ2VyJztcbiAgICB9XG59XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7IiwiaW1wb3J0IE1vZHVsZU1hbmFnZXIgZnJvbSAnLi9tb2R1bGUvbWFuYWdlcnMvTW9kdWxlTWFuYWdlcic7XG5pbXBvcnQgVGVtcGxhdGVNYW5hZ2VyIGZyb20gJy4vbW9kdWxlL21hbmFnZXJzL1RlbXBsYXRlTWFuYWdlcic7XG5cbmltcG9ydCBtb2R1bGVKc29uIGZyb20gJy4uL21vZHVsZS5qc29uJztcblxuSG9va3Mub25jZSgnaW5pdCcsIGFzeW5jICgpID0+IHtcbiAgICBjb25zb2xlLmxvZygnV2VhcG9uIFJlbG9hZCB8IEZvdW5kcnkgVlRUIE1vZHVsZScpO1xuXG4gICAgY29uc3Qgd2VhcG9uX3JlbG9hZCA9IG5ldyBNb2R1bGVNYW5hZ2VyKG1vZHVsZUpzb24uaWQpO1xuICAgIHdlYXBvbl9yZWxvYWQuaW5pdCgpO1xufSk7XG5cbmlmIChwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ2RldmVsb3BtZW50Jykge1xuICAgIGlmIChtb2R1bGUuaG90KSB7XG4gICAgICAgIG1vZHVsZS5ob3QuYWNjZXB0KCk7XG5cbiAgICAgICAgaWYgKG1vZHVsZS5ob3Quc3RhdHVzKCkgPT09ICdhcHBseScpIHtcbiAgICAgICAgICAgIFRlbXBsYXRlTWFuYWdlci5vbkhvdFJlbG9hZCgpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiZXhwb3J0IGRlZmF1bHQgX193ZWJwYWNrX3B1YmxpY19wYXRoX18gKyBcInN0eWxlcy9tb2R1bGUuY3NzXCI7Il0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9