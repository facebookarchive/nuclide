/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

/**
 * Responsible for sending and receiving debugger domain protocols from
 * debug engine.
 */
class DebuggerDomainDispatcher {
  _agent: Object; // debugger agent from chrome protocol.

  constructor(agent: Object) {
    this._agent = agent;
  }

  resume(): void {
    this._agent.resume();
  }

  stepOver(): void {
    this._agent.stepOver();
  }

  stepInto(): void {
    this._agent.stepInto();
  }

  stepOut(): void {
    this._agent.stepOut();
  }

  resumed(): void {
    // TODO:
  }

  threadsUpdated(
    owningProcessId: string,
    stopThreadId: string,
    threads_payload: string,
  ): void {
    // TODO
  }
}

// Use old school export to allow legacy code to import it.
module.exports = DebuggerDomainDispatcher;
