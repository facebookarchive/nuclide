'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.activate = activate;
exports.provideRaiseNativeNotification = provideRaiseNativeNotification;
exports.deactivate = deactivate;

var _electron = _interopRequireDefault(require('electron'));

var _atom = require('atom');

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('nuclide-commons-atom/feature-config'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const { remote } = _electron.default; /**
                                       * Copyright (c) 2015-present, Facebook, Inc.
                                       * All rights reserved.
                                       *
                                       * This source code is licensed under the license found in the LICENSE file in
                                       * the root directory of this source tree.
                                       *
                                       * 
                                       * @format
                                       */

if (!(remote != null)) {
  throw new Error('Invariant violation: "remote != null"');
}

let subscriptions = null;

function activate(state) {
  subscriptions = new _atom.CompositeDisposable(
  // Listen for Atom notifications:
  atom.notifications.onDidAddNotification(proxyToNativeNotification));
}

function proxyToNativeNotification(notification) {
  const options = notification.getOptions();

  // Don't proceed if user only wants 'nativeFriendly' proxied notifications and this isn't one.
  if (!options.nativeFriendly && (_featureConfig || _load_featureConfig()).default.get('nuclide-notifications.onlyNativeFriendly')) {
    return;
  }

  raiseNativeNotification(`${upperCaseFirst(notification.getType())}: ${notification.getMessage()}`, options.detail, 0, false);
}

function raiseNativeNotification(title, body, timeout, raiseIfAtomHasFocus = false) {
  const sendNotification = () => {
    if (raiseIfAtomHasFocus === false && !(_featureConfig || _load_featureConfig()).default.get('nuclide-notifications.whenFocused') && remote.getCurrentWindow().isFocused()) {
      return;
    }

    // eslint-disable-next-line no-new, no-undef
    new Notification(title, {
      body,
      icon: 'atom://nuclide/pkg/nuclide-notifications/notification.png'
    });
  };

  if (timeout === 0) {
    sendNotification();
  } else {
    const currentWindow = remote.getCurrentWindow();
    if (raiseIfAtomHasFocus !== false || !currentWindow.isFocused()) {
      const timeoutId = setTimeout(() => {
        sendNotification();
      }, timeout);

      currentWindow.once('focus', () => {
        clearTimeout(timeoutId);
      });

      return new _atom.Disposable(() => clearTimeout(timeoutId));
    }
  }

  return null;
}

function provideRaiseNativeNotification() {
  return raiseNativeNotification;
}

function deactivate() {
  subscriptions.dispose();
  subscriptions = null;
}

function upperCaseFirst(str) {
  return `${str[0].toUpperCase()}${str.slice(1)}`;
}