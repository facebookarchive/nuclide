'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.activate = activate;
exports.deactivate = deactivate;
exports.consumeToolBar = consumeToolBar;

var _viewableFromReactElement;

function _load_viewableFromReactElement() {
  return _viewableFromReactElement = require('../../commons-atom/viewableFromReactElement');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _react = _interopRequireWildcard(require('react'));

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
  return _destroyItemWhere = require('nuclide-commons-atom/destroyItemWhere');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let subscriptions = null; /**
                           * Copyright (c) 2015-present, Facebook, Inc.
                           * All rights reserved.
                           *
                           * This source code is licensed under the license found in the LICENSE file in
                           * the root directory of this source tree.
                           *
                           * 
                           * @format
                           */

function activate(state) {
  subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default(registerCommandAndOpener());
}

function deactivate() {
  subscriptions.dispose();
  subscriptions = null;
}

function registerCommandAndOpener() {
  return new (_UniversalDisposable || _load_UniversalDisposable()).default(atom.workspace.addOpener(uri => {
    if (uri === (_SettingsPaneItem2 || _load_SettingsPaneItem2()).WORKSPACE_VIEW_URI) {
      return (0, (_viewableFromReactElement || _load_viewableFromReactElement()).viewableFromReactElement)(_react.createElement((_SettingsPaneItem || _load_SettingsPaneItem()).default, null));
    }
  }), () => (0, (_destroyItemWhere || _load_destroyItemWhere()).destroyItemWhere)(item => item instanceof (_SettingsPaneItem || _load_SettingsPaneItem()).default), atom.commands.add('atom-workspace', 'nuclide-settings:toggle', () => {
    atom.workspace.toggle((_SettingsPaneItem2 || _load_SettingsPaneItem2()).WORKSPACE_VIEW_URI);
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