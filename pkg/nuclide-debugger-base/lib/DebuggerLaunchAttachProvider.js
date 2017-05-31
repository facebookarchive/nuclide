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

import type React from 'react';
import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {DebuggerConfigAction} from './types';

let uniqueKeySeed = 0;

/**
 * Base class of all launch/attach providers.
 * It allows each concrete provider to provide customized debugging types, actions and UI.
 */
export default class DebuggerLaunchAttachProvider {
  _debuggingTypeName: string;
  _targetUri: NuclideUri;
  _uniqueKey: number;

  constructor(debuggingTypeName: string, targetUri: NuclideUri) {
    this._debuggingTypeName = debuggingTypeName;
    this._targetUri = targetUri;
    this._uniqueKey = uniqueKeySeed++;
  }

  /**
   * Whether this provider is enabled or not.
   */
  isEnabled(action: DebuggerConfigAction): Promise<boolean> {
    return Promise.resolve(true);
  }

  /**
   * Returns a unique key which can be associated with the component.
   */
  getUniqueKey(): number {
    return this._uniqueKey;
  }

  /**
   * Returns target uri for this provider.
   */
  getTargetUri(): NuclideUri {
    return this._targetUri;
  }

  /**
   * Returns a list of supported debugger types + environments for the specified action.
   */
  getDebuggerTypeNames(action: DebuggerConfigAction): Array<string> {
    return [this._debuggingTypeName];
  }

  /**
   * Returns the UI component for configuring the specified debugger type and action.
   */
  getComponent(
    debuggerTypeName: string,
    action: DebuggerConfigAction,
    configIsValidChanged: (valid: boolean) => void,
  ): ?React.Element<any> {
    throw new Error('abstract method');
  }

  /**
   * Dispose any resource held by this provider.
   */
  dispose(): void {
    throw new Error('abstract method');
  }
}
