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

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _electron2;

function _electron() {
  return _electron2 = _interopRequireDefault(require('electron'));
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _commonsAtomFeatureConfig2;

function _commonsAtomFeatureConfig() {
  return _commonsAtomFeatureConfig2 = _interopRequireDefault(require('../../commons-atom/featureConfig'));
}

var remote = (_electron2 || _electron()).default.remote;

(0, (_assert2 || _assert()).default)(remote != null);

var subscriptions = null;

function activate(state) {
  subscriptions = new (_atom2 || _atom()).CompositeDisposable(
  // Listen for Atom notifications:
  atom.notifications.onDidAddNotification(proxyToNativeNotification));
}

function proxyToNativeNotification(notification) {
  var options = notification.getOptions();

  // Don't proceed if user only wants 'nativeFriendly' proxied notifications and this isn't one.
  if (!options.nativeFriendly && (_commonsAtomFeatureConfig2 || _commonsAtomFeatureConfig()).default.get('nuclide-notifications.onlyNativeFriendly')) {
    return;
  }

  raiseNativeNotification(upperCaseFirst(notification.getType()) + ': ' + notification.getMessage(), options.detail);
}

function raiseNativeNotification(title, body) {
  if (!(_commonsAtomFeatureConfig2 || _commonsAtomFeatureConfig()).default.get('nuclide-notifications.whenFocused') && remote.getCurrentWindow().isFocused()) {
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