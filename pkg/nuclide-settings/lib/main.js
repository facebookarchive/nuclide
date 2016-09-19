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
exports.consumeWorkspaceViewsService = consumeWorkspaceViewsService;
exports.consumeToolBar = consumeToolBar;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _commonsAtomViewableFromReactElement2;

function _commonsAtomViewableFromReactElement() {
  return _commonsAtomViewableFromReactElement2 = require('../../commons-atom/viewableFromReactElement');
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
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

function consumeWorkspaceViewsService(api) {
  subscriptions.add(api.registerFactory({
    id: 'nuclide-settings',
    name: 'Nuclide Settings',
    toggleCommand: 'nuclide-settings:toggle',
    defaultLocation: 'pane',
    create: function create() {
      return (0, (_commonsAtomViewableFromReactElement2 || _commonsAtomViewableFromReactElement()).viewableFromReactElement)((_reactForAtom2 || _reactForAtom()).React.createElement((_SettingsPaneItem2 || _SettingsPaneItem()).default, null));
    },
    isInstance: function isInstance(item) {
      return item instanceof (_SettingsPaneItem2 || _SettingsPaneItem()).default;
    }
  }));
}

function consumeToolBar(getToolBar) {
  var toolBar = getToolBar('nuclide-home');
  toolBar.addSpacer({
    priority: -501
  });
  toolBar.addButton({
    icon: 'gear',
    callback: 'nuclide-settings:toggle',
    tooltip: 'Open Nuclide Settings',
    priority: -500
  });
  var disposable = new (_atom2 || _atom()).Disposable(function () {
    toolBar.removeItems();
  });
  subscriptions.add(disposable);
  return disposable;
}