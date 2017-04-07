'use strict';

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

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _react = _interopRequireDefault(require('react'));

var _SettingsPaneItem;

function _load_SettingsPaneItem() {
  return _SettingsPaneItem = _interopRequireDefault(require('./SettingsPaneItem'));
}

var _SettingsPaneItem2;

function _load_SettingsPaneItem2() {
  return _SettingsPaneItem2 = require('./SettingsPaneItem');
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
 */

let subscriptions = null;

function activate(state) {
  subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default();
}

function deactivate() {
  subscriptions.dispose();
  subscriptions = null;
}

function consumeWorkspaceViewsService(api) {
  subscriptions.add(api.addOpener(uri => {
    if (uri === (_SettingsPaneItem2 || _load_SettingsPaneItem2()).WORKSPACE_VIEW_URI) {
      return (0, (_viewableFromReactElement || _load_viewableFromReactElement()).viewableFromReactElement)(_react.default.createElement((_SettingsPaneItem || _load_SettingsPaneItem()).default, null));
    }
  }), () => api.destroyWhere(item => item instanceof (_SettingsPaneItem || _load_SettingsPaneItem()).default), atom.commands.add('atom-workspace', 'nuclide-settings:toggle', event => {
    api.toggle((_SettingsPaneItem2 || _load_SettingsPaneItem2()).WORKSPACE_VIEW_URI, event.detail);
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
  const disposable = new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
    toolBar.removeItems();
  });
  subscriptions.add(disposable);
  return disposable;
}