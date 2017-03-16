'use strict';

var _atom = require('atom');

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('../../commons-atom/createPackage'));
}

var _event;

function _load_event() {
  return _event = require('../../commons-node/event');
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
 */

class Activation {

  constructor() {
    this._disposables = new _atom.CompositeDisposable();
  }

  consumeOutputService(api) {
    const messages = (0, (_event || _load_event()).observableFromSubscribeFunction)(atom.notifications.onDidAddNotification.bind(atom.notifications)).map(notification => ({
      // TODO (matthewwithanm): Add timestamp once nuclide-console supports it.
      // TODO (matthewwithanm): Show notification description/details.
      text: notification.getMessage(),
      level: getLevel(notification.getType())
    }));

    this._disposables.add(api.registerOutputProvider({ id: 'Atom', messages }));
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

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);