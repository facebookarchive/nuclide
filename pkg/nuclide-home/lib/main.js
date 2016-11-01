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
exports.setHomeFragments = setHomeFragments;
exports.deactivate = deactivate;
exports.consumeWorkspaceViewsService = consumeWorkspaceViewsService;

var _atom = require('atom');

var _createUtmUrl;

function _load_createUtmUrl() {
  return _createUtmUrl = _interopRequireDefault(require('./createUtmUrl'));
}

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('../../commons-atom/featureConfig'));
}

var _viewableFromReactElement;

function _load_viewableFromReactElement() {
  return _viewableFromReactElement = require('../../commons-atom/viewableFromReactElement');
}

var _HomePaneItem;

function _load_HomePaneItem() {
  return _HomePaneItem = _interopRequireDefault(require('./HomePaneItem'));
}

var _immutable;

function _load_immutable() {
  return _immutable = _interopRequireDefault(require('immutable'));
}

var _reactForAtom = require('react-for-atom');

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _electron = require('electron');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let subscriptions = null;

// A stream of all of the fragments. This is essentially the state of our panel.
const allHomeFragmentsStream = new _rxjsBundlesRxMinJs.BehaviorSubject((_immutable || _load_immutable()).default.Set());

function activate(state) {
  considerDisplayingHome();
  subscriptions = new _atom.CompositeDisposable();
  subscriptions.add(
  // eslint-disable-next-line nuclide-internal/atom-commands
  atom.commands.add('atom-workspace', 'nuclide-docs:open', e => {
    const url = (0, (_createUtmUrl || _load_createUtmUrl()).default)('http://nuclide.io/docs', 'help');
    _electron.shell.openExternal(url);
  }));
}

function setHomeFragments(homeFragments) {
  allHomeFragmentsStream.next(allHomeFragmentsStream.getValue().add(homeFragments));
  return new _atom.Disposable(() => {
    allHomeFragmentsStream.next(allHomeFragmentsStream.getValue().remove(homeFragments));
  });
}

function considerDisplayingHome() {
  const showHome = (_featureConfig || _load_featureConfig()).default.get('nuclide-home.showHome');
  if (showHome) {
    atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-home:toggle', { visible: true });
  }
}

function deactivate() {
  allHomeFragmentsStream.next((_immutable || _load_immutable()).default.Set());
  subscriptions.dispose();
  subscriptions = null;
}

function consumeWorkspaceViewsService(api) {
  subscriptions.add(api.registerFactory({
    id: 'nuclide-home',
    name: 'Home',
    iconName: 'home',
    toggleCommand: 'nuclide-home:toggle',
    defaultLocation: 'pane',
    create: () => (0, (_viewableFromReactElement || _load_viewableFromReactElement()).viewableFromReactElement)(_reactForAtom.React.createElement((_HomePaneItem || _load_HomePaneItem()).default, { allHomeFragmentsStream: allHomeFragmentsStream })),
    isInstance: item => item instanceof (_HomePaneItem || _load_HomePaneItem()).default
  }));
  considerDisplayingHome();
}