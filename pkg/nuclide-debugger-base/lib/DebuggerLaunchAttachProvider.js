/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type React from 'react';
import type {NuclideUri} from '../../commons-node/nuclideUri';

import type EventEmitter from 'events';

let uniqueKeySeed = 0;

/**
 * Event types that the EventEmitter passed to getComponent may listen on.
 */
export const DebuggerLaunchAttachEventTypes = Object.freeze({
  ENTER_KEY_PRESSED: 'ENTER_KEY_PRESSED',
  VISIBILITY_CHANGED: 'VISIBILITY_CHANGED',
});

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
  isEnabled(): Promise<boolean> {
    return Promise.resolve(true);
  }

  /**
   * Returns a unique key which can be associated with the component.
   */
  getUniqueKey(): number {
    return this._uniqueKey;
  }

  /**
   * Returns the debugging type name for this provider(e.g. Natve, Php, Node etc...).
   */
  getDebuggingTypeName(): string {
    return this._debuggingTypeName;
  }

  /**
   * Returns target uri for this provider.
   */
  getTargetUri(): NuclideUri {
    return this._targetUri;
  }

  /**
   * Returns a list of supported debugger actions.
   */
  getActions(): Promise<Array<string>> {
    return Promise.reject(new Error('abstract method'));
  }

  /**
   * Returns the UI component for input debug action.
   * The component may use the parentEventEmitter to listen for keyboard events
   * defined by DebuggerLaunchAttachEventTypes.
   */
  getComponent(
    action: string,
    parentEventEmitter: EventEmitter): ?React.Element<any> {
    throw new Error('abstract method');
  }

  /**
   * Dispose any resource held by this provider.
   */
  dispose(): void {
    throw new Error('abstract method');
  }
}
