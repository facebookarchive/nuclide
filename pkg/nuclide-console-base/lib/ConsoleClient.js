"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _main() {
  const data = require("./main");

  _main = function () {
    return data;
  };

  return data;
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

  enableAndPipeProcessMessagesToConsole(processMessage
  /* TODO(T17463635) */
  ) {
    (0, _main().pipeProcessMessagesToConsole)(this._processName, this._progressUpdates, this._showNotificationOnCompletion, processMessage);

    if (!this._consoleShown && SHOW_CONSOLE_ON_PROCESS_EVENTS.includes(processMessage.kind)) {
      (0, _main().changeConsoleVisibility)(true);
      this._consoleShown = true;
    }
  }

}

exports.default = ConsoleClient;