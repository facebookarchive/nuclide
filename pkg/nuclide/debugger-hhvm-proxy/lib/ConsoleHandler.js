'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */


var Handler = require('./Handler');

import type ChromeCallback from './ChromeCallback';
import type {NotificationCallback} from './NotificationCallback';

// Handles all 'Console.*' Chrome dev tools messages
class ConsoleHandler extends Handler {
  constructor(
    chromeCallback: ChromeCallback,
    notificationCallback: NotificationCallback
  ) {
    super('Console', chromeCallback, notificationCallback);
  }

  async handleMethod(id: number, method: string, params: ?Object): Promise {
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
  }
}

module.exports = ConsoleHandler;
