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
  _dataCache: DataCache;

  constructor(callback: ChromeCallback, dataCache: DataCache) {
    super('Runtime', callback);

    this._dataCache = dataCache;
  }

  async handleMethod(id: number, method: string, params: ?Object): Promise {
    switch (method) {
    case 'enable':
      this._notifyExecutionContext(id);
      break;

    case 'getProperties':
      await this._getProperties(id, params);
      break;

    default:
      this.unknownMethod(id, method, params);
      break;
    }
  }

  _notifyExecutionContext(id: number): void {
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

  async _getProperties(id: number, params: Object): Promise {
    // params also has properties:
    //    ownProperties
    //    generatePreview
    var {objectId, accessorPropertiesOnly} = params;
    var result;
    if (!accessorPropertiesOnly) {
      result = await this._dataCache.getProperties(objectId);
    } else {
      // TODO: Handle remaining params
      result = [];
    }
    this.replyToCommand(id, {result});
  }
}

module.exports = RuntimeHandler;
