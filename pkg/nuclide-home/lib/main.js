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

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _commonsAtomFeatureConfig2;

function _commonsAtomFeatureConfig() {
  return _commonsAtomFeatureConfig2 = _interopRequireDefault(require('../../commons-atom/featureConfig'));
}

var _commonsAtomViewableFromReactElement2;

function _commonsAtomViewableFromReactElement() {
  return _commonsAtomViewableFromReactElement2 = require('../../commons-atom/viewableFromReactElement');
}

var _HomePaneItem2;

function _HomePaneItem() {
  return _HomePaneItem2 = _interopRequireDefault(require('./HomePaneItem'));
}

var _immutable2;

function _immutable() {
  return _immutable2 = _interopRequireDefault(require('immutable'));
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _rxjsBundlesRxUmdMinJs2;

function _rxjsBundlesRxUmdMinJs() {
  return _rxjsBundlesRxUmdMinJs2 = _interopRequireDefault(require('rxjs/bundles/Rx.umd.min.js'));
}

var subscriptions = null;

// A stream of all of the fragments. This is essentially the state of our panel.
var allHomeFragmentsStream = new (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).default.BehaviorSubject((_immutable2 || _immutable()).default.Set());

function activate(state) {
  considerDisplayingHome();
  subscriptions = new (_atom2 || _atom()).CompositeDisposable();
}

function setHomeFragments(homeFragments) {
  allHomeFragmentsStream.next(allHomeFragmentsStream.getValue().add(homeFragments));
  return new (_atom2 || _atom()).Disposable(function () {
    allHomeFragmentsStream.next(allHomeFragmentsStream.getValue().remove(homeFragments));
  });
}

function considerDisplayingHome() {
  var showHome = (_commonsAtomFeatureConfig2 || _commonsAtomFeatureConfig()).default.get('nuclide-home.showHome');
  if (showHome) {
    atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-home:toggle', { visible: true });
  }
}

function deactivate() {
  allHomeFragmentsStream.next((_immutable2 || _immutable()).default.Set());
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
      return (0, (_commonsAtomViewableFromReactElement2 || _commonsAtomViewableFromReactElement()).viewableFromReactElement)((_reactForAtom2 || _reactForAtom()).React.createElement((_HomePaneItem2 || _HomePaneItem()).default, { allHomeFragmentsStream: allHomeFragmentsStream }));
    },
    isInstance: function isInstance(item) {
      return item instanceof (_HomePaneItem2 || _HomePaneItem()).default;
    }
  }));
  considerDisplayingHome();
}