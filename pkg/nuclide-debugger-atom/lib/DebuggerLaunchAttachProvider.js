'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from '../../nuclide-remote-uri';

import {React} from 'react-for-atom';

let uniqueKeySeed = 0;

/**
 * Base class of all launch/attach providers.
 * It allows each concrete provider to provide customized debugging types, actions and UI.
 */
class DebuggerLaunchAttachProvider {
  _debuggingTypeName: string;
  _targetUri: NuclideUri;
  _uniqueKey: number;

  constructor(debuggingTypeName: string, targetUri: NuclideUri) {
    this._debuggingTypeName = debuggingTypeName;
    this._targetUri = targetUri;
    this._uniqueKey = uniqueKeySeed++;
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
  getActions(): Array<string> {
    throw new Error('abstract method');
  }

  /**
   * Returns the UI component for input debug action.
   */
  getComponent(action: string): ?React.Element {
    throw new Error('abstract method');
  }

  /**
   * Dispose any resource held by this provider.
   */
  dispose(): void {
    throw new Error('abstract method');
  }
}

module.exports = DebuggerLaunchAttachProvider;
