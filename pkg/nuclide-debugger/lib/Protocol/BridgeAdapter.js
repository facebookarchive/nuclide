/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import invariant from 'assert';

require('./Object');
import {getLogger} from '../../../nuclide-logging';
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

  stepOver(): void {
    invariant(this._debuggerDispatcher != null);
    this._debuggerDispatcher.stepOver();
  }

  _handleServerMessage(domain: string, method: string, params: Object): void {
    logger.info(`domain: ${domain}, method: ${method}`);
  }
}
