'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
class ThreadsCommand {

  constructor(con, debug) {
    this.name = 'threads';
    this.helpText = "List all of the target's threads.";

    this._console = con;
    this._debugger = debug;
  }

  async execute() {
    const threads = this._debugger.getThreads();
    const focusThread = threads.focusThreadId;

    threads.allThreads.sort((left, right) => left.id() - right.id()).forEach(thread => {
      const activeMarker = thread.id() === focusThread ? '*' : ' ';
      this._console.outputLine(`${activeMarker} ${thread.id()} ${thread.name() || ''}`);
    });
  }
}
exports.default = ThreadsCommand; /**
                                   * Copyright (c) 2017-present, Facebook, Inc.
                                   * All rights reserved.
                                   *
                                   * This source code is licensed under the BSD-style license found in the
                                   * LICENSE file in the root directory of this source tree. An additional grant
                                   * of patent rights can be found in the PATENTS file in the same directory.
                                   *
                                   *  strict-local
                                   * @format
                                   */