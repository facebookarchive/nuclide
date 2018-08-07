"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.activate = activate;
exports.provideRaiseNativeNotification = provideRaiseNativeNotification;
exports.deactivate = deactivate;

var _electron = _interopRequireDefault(require("electron"));

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _featureConfig() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/feature-config"));

  _featureConfig = function () {
    return data;
  };

  return data;
}

function _sanitizeHtml() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/sanitizeHtml"));

  _sanitizeHtml = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */
const {
  remote
} = _electron.default;

if (!(remote != null)) {
  throw new Error("Invariant violation: \"remote != null\"");
}

let subscriptions = null;

function activate(state) {
  subscriptions = new (_UniversalDisposable().default)( // Listen for Atom notifications:
  atom.notifications.onDidAddNotification(proxyToNativeNotification));
}

function proxyToNativeNotification(notification) {
  const options = notification.getOptions(); // Don't proceed if user only wants 'nativeFriendly' proxied notifications and this isn't one.

  if (!options.nativeFriendly && _featureConfig().default.get('nuclide-notifications.onlyNativeFriendly')) {
    return;
  }

  const sanitizedMessage = (0, _sanitizeHtml().default)(notification.getMessage(), {
    condenseWhitespaces: true
  }); // If the message is multiline, take the first line for the title. Titles can only be a single
  // line and anything after the first line break will be ignored, at least on OSX.

  const [title, ...body] = sanitizedMessage.split(/\n/g);
  const sanitizedDescription = options.description == null ? '' : (0, _sanitizeHtml().default)(options.description, {
    condenseWhitespaces: true
  });
  raiseNativeNotification(`${upperCaseFirst(notification.getType())}: ${title}`, [...body, ...sanitizedDescription.split(/\n/g)].filter(Boolean).join('\n'), 0, false);
}

function raiseNativeNotification(title, body, timeout, raiseIfAtomHasFocus = false) {
  const sendNotification = () => {
    if (raiseIfAtomHasFocus === false && !_featureConfig().default.get('nuclide-notifications.whenFocused') && remote.getCurrentWindow().isFocused()) {
      return;
    } // eslint-disable-next-line no-new, no-undef


    new Notification(title, {
      body,
      icon: 'atom://nuclide/pkg/nuclide-notifications/notification.png',
      onclick: () => {
        // Windows does not properly bring the window into focus.
        remote.getCurrentWindow().show();
      }
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
      return new (_UniversalDisposable().default)(() => clearTimeout(timeoutId));
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