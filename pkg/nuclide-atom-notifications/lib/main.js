"use strict";

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _marked() {
  const data = _interopRequireDefault(require("marked"));

  _marked = function () {
    return data;
  };

  return data;
}

function _createPackage() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/createPackage"));

  _createPackage = function () {
    return data;
  };

  return data;
}

function _dompurify() {
  const data = _interopRequireDefault(require("dompurify"));

  _dompurify = function () {
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
const domPurify = (0, _dompurify().default)();

class Activation {
  constructor() {
    this._disposables = new (_UniversalDisposable().default)();
  }

  consumeConsoleService(createConsole) {
    const consoleApi = createConsole({
      id: 'Atom',
      name: 'Atom'
    });
    const notificationDisposable = atom.notifications.onDidAddNotification(notification => {
      consoleApi.append({
        text: stripFormatting(notification.getMessage()),
        level: getLevel(notification.getType())
      });
    });

    this._disposables.add(consoleApi, notificationDisposable);

    return notificationDisposable;
  }

  dispose() {
    this._disposables.dispose();
  }

}

function getLevel(atomNotificationType) {
  switch (atomNotificationType) {
    case 'error':
    case 'fatal':
      return 'error';

    case 'info':
      return 'info';

    case 'warning':
      return 'warning';

    case 'success':
      return 'success';

    default:
      return 'log';
  }
}
/**
 * Markdown and HTML can be used with Atom notifications, but not in the console.
 */


function stripFormatting(raw) {
  return domPurify.sanitize((0, _marked().default)(raw), {
    ALLOWED_TAGS: []
  });
}

(0, _createPackage().default)(module.exports, Activation);