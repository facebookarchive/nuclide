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
exports.consumeToolBar = consumeToolBar;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _atom = require('atom');

var _nuclideFeatureConfig = require('../../nuclide-feature-config');

var _nuclideFeatureConfig2 = _interopRequireDefault(_nuclideFeatureConfig);

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _rxjs = require('rxjs');

var _rxjs2 = _interopRequireDefault(_rxjs);

var subscriptions = null;
var gadgetsApi = null;

// A stream of all of the fragments. This is essentially the state of our panel.
var allHomeFragmentsStream = new _rxjs2['default'].BehaviorSubject(_immutable2['default'].Set());

function activate(state) {
  considerDisplayingHome();
  subscriptions = new _atom.CompositeDisposable();
  subscriptions.add(atom.commands.add('atom-workspace', 'nuclide-home:show-settings', function () {
    atom.workspace.open('atom://config/packages/nuclide');
  }));
}

function setHomeFragments(homeFragments) {
  allHomeFragmentsStream.next(allHomeFragmentsStream.getValue().add(homeFragments));
  return new _atom.Disposable(function () {
    allHomeFragmentsStream.next(allHomeFragmentsStream.getValue().remove(homeFragments));
  });
}

function considerDisplayingHome() {
  if (gadgetsApi == null) {
    return;
  }
  var showHome = _nuclideFeatureConfig2['default'].get('nuclide-home.showHome');
  if (showHome) {
    gadgetsApi.showGadget('nuclide-home');
  }
}

function deactivate() {
  gadgetsApi = null;
  allHomeFragmentsStream.next(_immutable2['default'].Set());
  subscriptions.dispose();
  subscriptions = null;
}

function consumeGadgetsService(api) {
  var createHomePaneItem = require('./createHomePaneItem');
  gadgetsApi = api;
  var gadget = createHomePaneItem(allHomeFragmentsStream);
  var disposable = api.registerGadget(gadget);
  considerDisplayingHome();
  return disposable;
}

function consumeToolBar(getToolBar) {
  var priority = require('../../nuclide-commons').toolbar.farEndPriority(500);
  var toolBar = getToolBar('nuclide-home');
  toolBar.addSpacer({
    priority: priority - 1
  });
  toolBar.addButton({
    icon: 'gear',
    callback: 'nuclide-home:show-settings',
    tooltip: 'Open Nuclide Settings',
    priority: priority
  });
  subscriptions.add(new _atom.Disposable(function () {
    toolBar.removeItems();
  }));
}