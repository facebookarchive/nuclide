'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _Handler;

function _load_Handler() {
  return _Handler = _interopRequireDefault(require('./Handler'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Handles all 'Console.*' Chrome dev tools messages
let ConsoleHandler = class ConsoleHandler extends (_Handler || _load_Handler()).default {
  constructor(clientCallback) {
    super('Console', clientCallback);
  }

  handleMethod(id, method, params) {
    switch (method) {
      case 'enable':
      case 'disable':
        this.replyToCommand(id, {});
        break;

      case 'clearMessages':
        this.sendMethod('Console.messagesCleared');
        break;

      default:
        this.unknownMethod(id, method, params);
        break;
    }
    return Promise.resolve();
  }
};


module.exports = ConsoleHandler;