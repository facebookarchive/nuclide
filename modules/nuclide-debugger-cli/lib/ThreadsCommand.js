"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

/**
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
class ThreadsCommand {
  constructor(con, debug) {
    this.name = 'thread';
    this.helpText = "[[l]ist | thread-id] Work with target's threads.";
    this.detailedHelpText = `
With no parameters, shows information about the current thread.

[t]hread [l]ist shows all of the target's threads.

Given a numeric thread-id, sets the debugger's current thread context to that
thread.
  `;
    this._console = con;
    this._debugger = debug;
  }

  async execute(args) {
    if (args.length === 0) {
      this.printCurrentThread();
      return;
    }

    if ('list'.startsWith(args[0])) {
      this.printAllThreads();
      return;
    }

    const tid = parseInt(args[0], 10);

    if (isNaN(tid) || tid < 0) {
      throw new Error('Thread id must be a positive integer.');
    }

    this._debugger.getThreads().setFocusThread(tid);
  }

  printCurrentThread() {
    const threads = this._debugger.getThreads();

    const thread = threads.focusThread;

    if (thread == null) {
      throw new Error('There is no focused thread.');
    }

    this._console.outputLine(`Thread #${thread.id()} ${thread.name() || ''}${thread.isStopped ? ' [stopped]' : ''}`);
  }

  printAllThreads() {
    const threads = this._debugger.getThreads();

    const focusThread = threads.focusThreadId;

    this._console.more(threads.allThreads.sort((left, right) => left.id() - right.id()).map(thread => {
      const activeMarker = thread.id() === focusThread ? '*' : ' ';
      return `${activeMarker} ${thread.id()} ${thread.name() || ''} ${thread.isStopped ? ' [stopped]' : ''}`;
    }).join('\n'));
  }

}

exports.default = ThreadsCommand;