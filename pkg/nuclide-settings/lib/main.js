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

var _commonsAtomViewableFromReactElement;

function _load_commonsAtomViewableFromReactElement() {
  return _commonsAtomViewableFromReactElement = require('../../commons-atom/viewableFromReactElement');
}

var _atom;

function _load_atom() {
  return _atom = require('atom');
}

var _reactForAtom;

function _load_reactForAtom() {
  return _reactForAtom = require('react-for-atom');
}

var _SettingsPaneItem;

function _load_SettingsPaneItem() {
  return _SettingsPaneItem = _interopRequireDefault(require('./SettingsPaneItem'));
}

var subscriptions = null;

function activate(state) {
  subscriptions = new (_atom || _load_atom()).CompositeDisposable();
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
      return (0, (_commonsAtomViewableFromReactElement || _load_commonsAtomViewableFromReactElement()).viewableFromReactElement)((_reactForAtom || _load_reactForAtom()).React.createElement((_SettingsPaneItem || _load_SettingsPaneItem()).default, null));
    },
    isInstance: function isInstance(item) {
      return item instanceof (_SettingsPaneItem || _load_SettingsPaneItem()).default;
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
  var disposable = new (_atom || _load_atom()).Disposable(function () {
    toolBar.removeItems();
  });
  subscriptions.add(disposable);
  return disposable;
}