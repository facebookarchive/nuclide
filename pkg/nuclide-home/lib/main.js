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
exports.setHomeFragments = setHomeFragments;
exports.deactivate = deactivate;
exports.consumeWorkspaceViewsService = consumeWorkspaceViewsService;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _atom;

function _load_atom() {
  return _atom = require('atom');
}

var _createUtmUrl;

function _load_createUtmUrl() {
  return _createUtmUrl = _interopRequireDefault(require('./createUtmUrl'));
}

var _commonsAtomFeatureConfig;

function _load_commonsAtomFeatureConfig() {
  return _commonsAtomFeatureConfig = _interopRequireDefault(require('../../commons-atom/featureConfig'));
}

var _commonsAtomViewableFromReactElement;

function _load_commonsAtomViewableFromReactElement() {
  return _commonsAtomViewableFromReactElement = require('../../commons-atom/viewableFromReactElement');
}

var _HomePaneItem;

function _load_HomePaneItem() {
  return _HomePaneItem = _interopRequireDefault(require('./HomePaneItem'));
}

var _immutable;

function _load_immutable() {
  return _immutable = _interopRequireDefault(require('immutable'));
}

var _reactForAtom;

function _load_reactForAtom() {
  return _reactForAtom = require('react-for-atom');
}

var _rxjsBundlesRxMinJs;

function _load_rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');
}

var _electron;

function _load_electron() {
  return _electron = require('electron');
}

var subscriptions = null;

// A stream of all of the fragments. This is essentially the state of our panel.
var allHomeFragmentsStream = new (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).BehaviorSubject((_immutable || _load_immutable()).default.Set());

function activate(state) {
  considerDisplayingHome();
  subscriptions = new (_atom || _load_atom()).CompositeDisposable();
  subscriptions.add(
  // eslint-disable-next-line nuclide-internal/command-menu-items
  atom.commands.add('atom-workspace', 'nuclide-docs:open', function (e) {
    var url = (0, (_createUtmUrl || _load_createUtmUrl()).default)('http://nuclide.io/docs', 'help');
    (_electron || _load_electron()).shell.openExternal(url);
  }));
}

function setHomeFragments(homeFragments) {
  allHomeFragmentsStream.next(allHomeFragmentsStream.getValue().add(homeFragments));
  return new (_atom || _load_atom()).Disposable(function () {
    allHomeFragmentsStream.next(allHomeFragmentsStream.getValue().remove(homeFragments));
  });
}

function considerDisplayingHome() {
  var showHome = (_commonsAtomFeatureConfig || _load_commonsAtomFeatureConfig()).default.get('nuclide-home.showHome');
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
    create: function create() {
      return (0, (_commonsAtomViewableFromReactElement || _load_commonsAtomViewableFromReactElement()).viewableFromReactElement)((_reactForAtom || _load_reactForAtom()).React.createElement((_HomePaneItem || _load_HomePaneItem()).default, { allHomeFragmentsStream: allHomeFragmentsStream }));
    },
    isInstance: function isInstance(item) {
      return item instanceof (_HomePaneItem || _load_HomePaneItem()).default;
    }
  }));
  considerDisplayingHome();
}