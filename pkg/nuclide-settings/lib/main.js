Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

exports.activate = activate;
exports.deactivate = deactivate;
exports.consumeGadgetsService = consumeGadgetsService;
exports.consumeToolBar = consumeToolBar;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _commonsAtomSudaToolBar2;

function _commonsAtomSudaToolBar() {
  return _commonsAtomSudaToolBar2 = require('../../commons-atom/suda-tool-bar');
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _SettingsPaneItem2;

function _SettingsPaneItem() {
  return _SettingsPaneItem2 = _interopRequireDefault(require('./SettingsPaneItem'));
}

var subscriptions = null;

function activate(state) {
  subscriptions = new (_atom2 || _atom()).CompositeDisposable();
}

function deactivate() {
  subscriptions.dispose();
  subscriptions = null;
}

function consumeGadgetsService(api) {
  var disposable = api.registerGadget((_SettingsPaneItem2 || _SettingsPaneItem()).default);
  return disposable;
}

function consumeToolBar(getToolBar) {
  var priority = (0, (_commonsAtomSudaToolBar2 || _commonsAtomSudaToolBar()).farEndPriority)(500);
  var toolBar = getToolBar('nuclide-home');
  toolBar.addSpacer({
    priority: priority - 1
  });
  toolBar.addButton({
    icon: 'gear',
    callback: 'nuclide-settings:show',
    tooltip: 'Open Nuclide Settings',
    priority: priority
  });
  var disposable = new (_atom2 || _atom()).Disposable(function () {
    toolBar.removeItems();
  });
  subscriptions.add(disposable);
  return disposable;
}