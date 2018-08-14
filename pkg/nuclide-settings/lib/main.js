"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.activate = activate;
exports.deactivate = deactivate;
exports.consumeToolBar = consumeToolBar;
exports.consumeDeepLinkService = consumeDeepLinkService;

function _goToLocation() {
  const data = require("../../../modules/nuclide-commons-atom/go-to-location");

  _goToLocation = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

var _querystring = _interopRequireDefault(require("querystring"));

function _SettingsPaneItem() {
  const data = _interopRequireWildcard(require("./SettingsPaneItem"));

  _SettingsPaneItem = function () {
    return data;
  };

  return data;
}

function _destroyItemWhere() {
  const data = require("../../../modules/nuclide-commons-atom/destroyItemWhere");

  _destroyItemWhere = function () {
    return data;
  };

  return data;
}

function _openSettingsView() {
  const data = _interopRequireDefault(require("./openSettingsView"));

  _openSettingsView = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
  subscriptions = new (_UniversalDisposable().default)(registerCommandAndOpener());
}

function deactivate() {
  subscriptions.dispose();
  subscriptions = null;
}

function registerCommandAndOpener() {
  return new (_UniversalDisposable().default)(atom.workspace.addOpener(_openSettingsView().default), () => (0, _destroyItemWhere().destroyItemWhere)(item => item instanceof _SettingsPaneItem().default), atom.commands.add('atom-workspace', 'nuclide-settings:toggle', () => {
    atom.workspace.toggle(_SettingsPaneItem().WORKSPACE_VIEW_URI);
  }));
}

function consumeToolBar(getToolBar) {
  const toolBar = getToolBar('nuclide-home');
  toolBar.addSpacer({
    priority: -501
  });
  toolBar.addButton({
    icon: 'gear',
    callback: 'nuclide-settings:toggle',
    tooltip: 'Open Nuclide Settings',
    priority: -500
  });
  const disposable = new (_UniversalDisposable().default)(() => {
    toolBar.removeItems();
  });
  subscriptions.add(disposable);
  return disposable;
}

function consumeDeepLinkService(service) {
  const disposable = service.subscribeToPath('settings', params => {
    const {
      filter
    } = params;

    let uri = _SettingsPaneItem().WORKSPACE_VIEW_URI;

    if (typeof filter === 'string') {
      uri += '?' + _querystring.default.stringify({
        filter
      });
    }

    (0, _goToLocation().goToLocation)(uri);
  });
  subscriptions.add(disposable);
  return disposable;
}