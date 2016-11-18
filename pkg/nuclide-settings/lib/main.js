'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.activate = activate;
exports.deactivate = deactivate;
exports.consumeWorkspaceViewsService = consumeWorkspaceViewsService;
exports.consumeToolBar = consumeToolBar;

var _viewableFromReactElement;

function _load_viewableFromReactElement() {
  return _viewableFromReactElement = require('../../commons-atom/viewableFromReactElement');
}

var _atom = require('atom');

var _reactForAtom = require('react-for-atom');

var _SettingsPaneItem;

function _load_SettingsPaneItem() {
  return _SettingsPaneItem = _interopRequireDefault(require('./SettingsPaneItem'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let subscriptions = null;

function activate(state) {
  subscriptions = new _atom.CompositeDisposable();
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
    create: () => (0, (_viewableFromReactElement || _load_viewableFromReactElement()).viewableFromReactElement)(_reactForAtom.React.createElement((_SettingsPaneItem || _load_SettingsPaneItem()).default, null)),
    isInstance: item => item instanceof (_SettingsPaneItem || _load_SettingsPaneItem()).default
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
  const disposable = new _atom.Disposable(() => {
    toolBar.removeItems();
  });
  subscriptions.add(disposable);
  return disposable;
}