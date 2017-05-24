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

import invariant from 'assert';

require('./Object');
import {getLogger} from 'log4js';
const logger = getLogger('nuclide-debugger');
import InspectorBackendClass from './NuclideProtocolParser';
import DebuggerDomainDispatcher from './DebuggerDomainDispatcher';

export default class BridgeAdapter {
  _debuggerDispatcher: ?DebuggerDomainDispatcher;

  constructor() {
    (this: any)._handleServerMessage = this._handleServerMessage.bind(this);
  }

  async start(debuggerInstance: Object): Promise<void> {
    this._debuggerDispatcher = await InspectorBackendClass.bootstrap(
      debuggerInstance,
    );
  }

  resume(): void {
    invariant(this._debuggerDispatcher != null);
    this._debuggerDispatcher.resume();
  }

  pause(): void {
    invariant(this._debuggerDispatcher != null);
    this._debuggerDispatcher.pause();
  }

  stepOver(): void {
    invariant(this._debuggerDispatcher != null);
    this._debuggerDispatcher.stepOver();
  }

  stepInto(): void {
    invariant(this._debuggerDispatcher != null);
    this._debuggerDispatcher.stepInto();
  }

  stepOut(): void {
    invariant(this._debuggerDispatcher != null);
    this._debuggerDispatcher.stepOut();
  }

  _handleServerMessage(domain: string, method: string, params: Object): void {
    logger.info(`domain: ${domain}, method: ${method}`);
  }
}
