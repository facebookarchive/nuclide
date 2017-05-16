"use strict";

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

/**
 * Responsible for sending and receiving debugger domain protocols from
 * debug engine.
 */
class DebuggerDomainDispatcher {
  // debugger agent from chrome protocol.

  constructor(agent) {
    this._agent = agent;
  }

  resume() {
    this._agent.resume();
  }

  stepOver() {
    this._agent.stepOver();
  }

  stepInto() {
    this._agent.stepInto();
  }

  stepOut() {
    this._agent.stepOut();
  }

  resumed() {
    // TODO:
  }

  threadsUpdated(owningProcessId, stopThreadId, threads_payload) {
    // TODO
  }
}

// Use old school export to allow legacy code to import it.
module.exports = DebuggerDomainDispatcher;