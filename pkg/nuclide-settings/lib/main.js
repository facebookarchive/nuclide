'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.activate = activate;
exports.deactivate = deactivate;
exports.consumeToolBar = consumeToolBar;
exports.consumeDeepLinkService = consumeDeepLinkService;

var _goToLocation;

function _load_goToLocation() {
  return _goToLocation = require('../../../modules/nuclide-commons-atom/go-to-location');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../modules/nuclide-commons/UniversalDisposable'));
}

var _querystring = _interopRequireDefault(require('querystring'));

var _SettingsPaneItem;

function _load_SettingsPaneItem() {
  return _SettingsPaneItem = _interopRequireDefault(require('./SettingsPaneItem'));
}

var _SettingsPaneItem2;

function _load_SettingsPaneItem2() {
  return _SettingsPaneItem2 = require('./SettingsPaneItem');
}

var _destroyItemWhere;

function _load_destroyItemWhere() {
  return _destroyItemWhere = require('../../../modules/nuclide-commons-atom/destroyItemWhere');
}

var _ToolbarUtils;

function _load_ToolbarUtils() {
  return _ToolbarUtils = require('../../../modules/nuclide-commons-ui/ToolbarUtils');
}

var _openSettingsView;

function _load_openSettingsView() {
  return _openSettingsView = _interopRequireDefault(require('./openSettingsView'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

let subscriptions = null;

function activate(state) {
  subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default(registerCommandAndOpener());
}

function deactivate() {
  subscriptions.dispose();
  subscriptions = null;
}

function registerCommandAndOpener() {
  return new (_UniversalDisposable || _load_UniversalDisposable()).default(atom.workspace.addOpener((_openSettingsView || _load_openSettingsView()).default), () => (0, (_destroyItemWhere || _load_destroyItemWhere()).destroyItemWhere)(item => item instanceof (_SettingsPaneItem || _load_SettingsPaneItem()).default), atom.commands.add('atom-workspace', 'nuclide-settings:toggle', () => {
    atom.workspace.toggle((_SettingsPaneItem2 || _load_SettingsPaneItem2()).WORKSPACE_VIEW_URI);
  }));
}

function consumeToolBar(getToolBar) {
  const toolBar = getToolBar('nuclide-home');
  toolBar.addSpacer({
    priority: -501
  });
  toolBar.addButton((0, (_ToolbarUtils || _load_ToolbarUtils()).makeToolbarButtonSpec)({
    icon: 'gear',
    callback: 'nuclide-settings:toggle',
    tooltip: 'Open Nuclide Settings',
    priority: -500
  }));
  const disposable = new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
    toolBar.removeItems();
  });
  subscriptions.add(disposable);
  return disposable;
}

function consumeDeepLinkService(service) {
  const disposable = service.subscribeToPath('settings', params => {
    const { filter } = params;
    let uri = (_SettingsPaneItem2 || _load_SettingsPaneItem2()).WORKSPACE_VIEW_URI;
    if (typeof filter === 'string') {
      uri += '?' + _querystring.default.stringify({ filter });
    }
    (0, (_goToLocation || _load_goToLocation()).goToLocation)(uri);
  });
  subscriptions.add(disposable);
  return disposable;
}