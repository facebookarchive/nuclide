'use strict';

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../modules/nuclide-commons/UniversalDisposable'));
}

var _marked;

function _load_marked() {
  return _marked = _interopRequireDefault(require('marked'));
}

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('../../../modules/nuclide-commons-atom/createPackage'));
}

var _dompurify;

function _load_dompurify() {
  return _dompurify = _interopRequireDefault(require('dompurify'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const domPurify = (0, (_dompurify || _load_dompurify()).default)(); /**
                                                                     * Copyright (c) 2015-present, Facebook, Inc.
                                                                     * All rights reserved.
                                                                     *
                                                                     * This source code is licensed under the license found in the LICENSE file in
                                                                     * the root directory of this source tree.
                                                                     *
                                                                     * 
                                                                     * @format
                                                                     */

class Activation {

  constructor() {
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
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
  return domPurify.sanitize((0, (_marked || _load_marked()).default)(raw), { ALLOWED_TAGS: [] });
}

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);