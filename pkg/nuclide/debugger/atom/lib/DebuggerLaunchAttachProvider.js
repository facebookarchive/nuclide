'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from '../../../remote-uri';

/*
 * Base class of all launch/attach providers.
 * It allows each concrete provider to provide customized debugging types, actions and UI.
 */
class DebuggerLaunchAttachProvider {
  _debuggingTypeName: string;
  _targetUri: NuclideUri;

  constructor(debuggingTypeName: string, targetUri: NuclideUri) {
    this._debuggingTypeName = debuggingTypeName;
    this._targetUri = targetUri;
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
  getComponent(action: string): ?ReactElement {
    throw new Error('abstract method');
  }
}

module.exports = DebuggerLaunchAttachProvider;
