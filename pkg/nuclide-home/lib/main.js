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
exports.consumeGadgetsService = consumeGadgetsService;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _nuclideFeatureConfig2;

function _nuclideFeatureConfig() {
  return _nuclideFeatureConfig2 = _interopRequireDefault(require('../../nuclide-feature-config'));
}

var _immutable2;

function _immutable() {
  return _immutable2 = _interopRequireDefault(require('immutable'));
}

var _rxjsBundlesRxUmdMinJs2;

function _rxjsBundlesRxUmdMinJs() {
  return _rxjsBundlesRxUmdMinJs2 = _interopRequireDefault(require('rxjs/bundles/Rx.umd.min.js'));
}

var subscriptions = null;
var gadgetsApi = null;

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
  if (gadgetsApi == null) {
    return;
  }
  var showHome = (_nuclideFeatureConfig2 || _nuclideFeatureConfig()).default.get('nuclide-home.showHome');
  if (showHome) {
    gadgetsApi.showGadget('nuclide-home');
  }
}

function deactivate() {
  gadgetsApi = null;
  allHomeFragmentsStream.next((_immutable2 || _immutable()).default.Set());
  subscriptions.dispose();
  subscriptions = null;
}

function consumeGadgetsService(api) {
  var createHomePaneItem = require('./createHomePaneItem');
  gadgetsApi = api;
  var gadget = createHomePaneItem(allHomeFragmentsStream);
  subscriptions.add(api.registerGadget(gadget));
  considerDisplayingHome();
}