'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */


var {DUMMY_FRAME_ID} = require('./utils');
var Handler = require('./Handler');

// Handles all 'Runtime.*' Chrome dev tools messages
class RuntimeHandler extends Handler {
  constructor(callback: ChromeCallback) {
    super('Runtime', callback);
  }

  async handleMethod(id: number, method: string, params: ?Object): Promise {
    switch (method) {
    case 'enable':
      this._notifyExecutionContext(id);
      break;

    default:
      this.unknownMethod(id, method, params);
      break;
    }
  }

  _notifyExecutionContext(id: number) {
    this.sendMethod('Runtime.executionContextCreated',
    {
      'context': {
        'id': 1,
        'frameId': DUMMY_FRAME_ID,
        'name': 'hhvm: TODO: mangle in pid, idekey, script from connection',
      }
    });
    this.replyToCommand(id, {});
  }
}

module.exports = RuntimeHandler;
