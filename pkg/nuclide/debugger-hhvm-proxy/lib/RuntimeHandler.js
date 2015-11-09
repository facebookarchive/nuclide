'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */


import {DUMMY_FRAME_ID} from './helpers';
import Handler from './Handler';

import type {ConnectionMultiplexer} from './ConnectionMultiplexer';
import type ChromeCallback from './ChromeCallback';
import type {NotificationCallback} from './NotificationCallback';

// Handles all 'Runtime.*' Chrome dev tools messages
export class RuntimeHandler extends Handler {
  _connectionMultiplexer: ConnectionMultiplexer;

  constructor(
    chromeCallback: ChromeCallback,
    notificationCallback: NotificationCallback,
    connectionMultiplexer: ConnectionMultiplexer
  ) {
    super('Runtime', chromeCallback, notificationCallback);

    this._connectionMultiplexer = connectionMultiplexer;
  }

  async handleMethod(id: number, method: string, params: Object): Promise {
    switch (method) {
      case 'enable':
        this._notifyExecutionContext(id);
        break;

      case 'getProperties':
        await this._getProperties(id, params);
        break;

      case 'evaluate':
        await this._evaluate(id, params);
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
        },
      });
    this.replyToCommand(id, {});
  }

  async _getProperties(id: number, params: Object): Promise {
    // params also has properties:
    //    ownProperties
    //    generatePreview
    const {objectId, accessorPropertiesOnly} = params;
    let result;
    if (!accessorPropertiesOnly) {
      result = await this._connectionMultiplexer.getProperties(objectId);
    } else {
      // TODO: Handle remaining params
      result = [];
    }
    this.replyToCommand(id, {result});
  }

  async _evaluate(id: number, params: Object): Promise {
    const result = await this._connectionMultiplexer.runtimeEvaluate(params.expression);
    this.replyToCommand(id, result);
  }
}
