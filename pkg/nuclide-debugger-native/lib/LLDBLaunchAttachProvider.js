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

import type {
  DebuggerActionUIProvider,
} from './actions/DebuggerActionUIProvider';
import type {DebuggerConfigAction} from '../../nuclide-debugger-base';

import {asyncFilter} from 'nuclide-commons/promise';
import {DebuggerLaunchAttachProvider} from '../../nuclide-debugger-base';
import React from 'react';
import {LaunchAttachStore} from './LaunchAttachStore';
import LaunchAttachDispatcher from './LaunchAttachDispatcher';
import {LaunchAttachActions} from './LaunchAttachActions';
import * as NativeActionUIProvider from './actions/NativeActionUIProvider';
import invariant from 'invariant';

export class LLDBLaunchAttachProvider extends DebuggerLaunchAttachProvider {
  _dispatcher: LaunchAttachDispatcher;
  _actions: LaunchAttachActions;
  _store: LaunchAttachStore;
  _uiProviderMap: Map<string, DebuggerActionUIProvider>;
  _enabledProviderNames: Map<string, Array<string>>;

  constructor(debuggingTypeName: string, targetUri: string) {
    super(debuggingTypeName, targetUri);
    this._dispatcher = new LaunchAttachDispatcher();
    this._actions = new LaunchAttachActions(
      this._dispatcher,
      this.getTargetUri(),
    );
    this._store = new LaunchAttachStore(this._dispatcher);

    this._uiProviderMap = new Map();
    this._enabledProviderNames = new Map();
    this._loadAction(NativeActionUIProvider);
    try {
      // $FlowFB
      this._loadAction(require('./actions/fb-omActionUIProvider'));
    } catch (_) {}
  }

  _loadAction(actionProvider: ?DebuggerActionUIProvider): void {
    if (actionProvider != null) {
      this._uiProviderMap.set(actionProvider.name, actionProvider);
    }
  }

  async isEnabled(action: DebuggerConfigAction): Promise<boolean> {
    if (this._enabledProviderNames.get(action) == null) {
      this._enabledProviderNames.set(action, []);
    }

    const providers = await asyncFilter(
      Array.from(this._uiProviderMap.values()),
      provider => provider.isEnabled(action),
    );

    const list = this._enabledProviderNames.get(action);
    invariant(list != null);

    for (const provider of providers) {
      list.push(provider.name);
    }

    return providers.length > 0;
  }

  getDebuggerTypeNames(action: DebuggerConfigAction): Array<string> {
    return this._enabledProviderNames.get(action) || [];
  }

  getComponent(
    debuggerTypeName: string,
    action: DebuggerConfigAction,
    configIsValidChanged: (valid: boolean) => void,
  ): ?React.Element<any> {
    const provider = this._uiProviderMap.get(debuggerTypeName);
    if (provider) {
      return provider.getComponent(
        this._targetUri,
        this._store,
        this._actions,
        debuggerTypeName,
        action,
        configIsValidChanged,
      );
    }
    return null;
  }

  dispose(): void {
    this._store.dispose();
    this._actions.dispose();
  }
}
