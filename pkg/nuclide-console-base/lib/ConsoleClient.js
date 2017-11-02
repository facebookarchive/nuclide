'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _main;

function _load_main() {
  return _main = require('./main');
}

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

const SHOW_CONSOLE_ON_PROCESS_EVENTS = ['stdout', 'stderr', 'error'];

class ConsoleClient {

  constructor(processName, progressUpdates, showNotificationOnCompletion = true) {
    this._processName = processName;
    this._progressUpdates = progressUpdates;
    this._consoleShown = false;
    this._showNotificationOnCompletion = showNotificationOnCompletion;
  }

  enableAndPipeProcessMessagesToConsole(processMessage /* TODO(T17463635) */
  ) {
    (0, (_main || _load_main()).pipeProcessMessagesToConsole)(this._processName, this._progressUpdates, this._showNotificationOnCompletion, processMessage);
    if (!this._consoleShown && SHOW_CONSOLE_ON_PROCESS_EVENTS.includes(processMessage.kind)) {
      (0, (_main || _load_main()).changeConsoleVisibility)(true);
      this._consoleShown = true;
    }
  }
}
exports.default = ConsoleClient;