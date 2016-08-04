Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.activate = activate;
exports.provideRaiseNativeNotification = provideRaiseNativeNotification;
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

var _commonsAtomFeatureConfig2;

function _commonsAtomFeatureConfig() {
  return _commonsAtomFeatureConfig2 = _interopRequireDefault(require('../../commons-atom/featureConfig'));
}

var _commonsNodePassesGK2;

function _commonsNodePassesGK() {
  return _commonsNodePassesGK2 = require('../../commons-node/passesGK');
}

var subscriptions = null;
var currentConfig = (_commonsAtomFeatureConfig2 || _commonsAtomFeatureConfig()).default.get('nuclide-notifications');
var gkEnabled = false;

function activate(state) {
  subscriptions = new (_atom2 || _atom()).CompositeDisposable(

  // Listen for changes to the native notification settings:
  (_commonsAtomFeatureConfig2 || _commonsAtomFeatureConfig()).default.onDidChange('nuclide-notifications', function (event) {
    currentConfig = event.newValue;
  }),

  // Listen for Atom notifications:
  atom.notifications.onDidAddNotification(proxyToNativeNotification));

  // Listen for the gatekeeper to tell us if we can generate native notifications.
  subscriptions.add((0, (_commonsNodePassesGK2 || _commonsNodePassesGK()).onceGkInitialized)(function () {
    gkEnabled = (0, (_commonsNodePassesGK2 || _commonsNodePassesGK()).isGkEnabled)('nuclide_native_notifications');
  }));
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

function provideRaiseNativeNotification() {
  return raiseNativeNotification;
}

function deactivate() {
  subscriptions.dispose();
  subscriptions = null;
}

function upperCaseFirst(str) {
  return '' + str[0].toUpperCase() + str.slice(1);
}