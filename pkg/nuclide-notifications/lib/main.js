Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.activate = activate;
exports.deactivate = deactivate;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _nuclideFeatureConfig2;

function _nuclideFeatureConfig() {
  return _nuclideFeatureConfig2 = _interopRequireDefault(require('../../nuclide-feature-config'));
}

var subscriptions = null;
var currentConfig = (_nuclideFeatureConfig2 || _nuclideFeatureConfig()).default.get('nuclide-notifications');
var gkEnabled = false;

function activate(state) {
  subscriptions = new (_atom2 || _atom()).CompositeDisposable(

  // Listen for changes to the native notification settings:
  (_nuclideFeatureConfig2 || _nuclideFeatureConfig()).default.onDidChange('nuclide-notifications', function (event) {
    currentConfig = event.newValue;
  }),

  // Listen for Atom notifications:
  atom.notifications.onDidAddNotification(proxyToNativeNotification));

  try {
    (function () {
      // Listen for the gatekeeper to tell us if we can generate native notifications.
      // $FlowFB
      var gatekeeper = require('../../fb-gatekeeper').gatekeeper;
      subscriptions.add(gatekeeper.onceInitialized(function () {
        gkEnabled = gatekeeper.isGkEnabled('nuclide_native_notifications');
      }));
    })();
  } catch (e) {}
}

function proxyToNativeNotification(notification) {
  var options = notification.getOptions();

  // Don't proceed if user only wants 'nativeFriendly' proxied notifications and this isn't one.
  if (currentConfig.onlyNativeFriendly && !options.nativeFriendly) {
    return;
  }

  raiseNativeNotification(upperCaseFirst(notification.getType()) + ': ' + notification.getMessage(), options.detail);
}

function raiseNativeNotification(title, body) {
  // Check we're in the gatekeeper for native notifications at all.
  if (!gkEnabled) {
    return;
  }

  if (atom.getCurrentWindow().isFocused() && !currentConfig.whenFocused) {
    return;
  }

  // eslint-disable-next-line no-new, no-undef
  new Notification(title, {
    body: body,
    icon: 'atom://nuclide/pkg/nuclide-notifications/notification.png'
  });
}

function deactivate() {
  subscriptions.dispose();
  subscriptions = null;
}

function upperCaseFirst(str) {
  return '' + str[0].toUpperCase() + str.slice(1);
}