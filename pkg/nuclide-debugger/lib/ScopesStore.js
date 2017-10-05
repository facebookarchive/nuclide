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

import type {SetVariableResponse} from '../../nuclide-debugger-base/lib/protocol-types';
import type Bridge from './Bridge';
import type DebuggerDispatcher, {DebuggerAction} from './DebuggerDispatcher';
import type {ScopeSection} from './types';

import {Disposable, CompositeDisposable} from 'atom';
import invariant from 'assert';
import {BehaviorSubject, Observable} from 'rxjs';
import {ActionTypes} from './DebuggerDispatcher';
import {reportError} from './Protocol/EventReporter';
import {DebuggerStore} from './DebuggerStore';

export default class ScopesStore {
  _bridge: Bridge;
  _disposables: IDisposable;
  _debuggerStore: DebuggerStore;
  /**
   * Treat as immutable.
   */
  _scopes: BehaviorSubject<Array<ScopeSection>>;

  constructor(
    dispatcher: DebuggerDispatcher,
    bridge: Bridge,
    debuggerStore: DebuggerStore,
  ) {
    this._bridge = bridge;
    this._debuggerStore = debuggerStore;
    const dispatcherToken = dispatcher.register(this._handlePayload);
    this._disposables = new CompositeDisposable(
      new Disposable(() => {
        dispatcher.unregister(dispatcherToken);
      }),
    );
    this._scopes = new BehaviorSubject([]);
  }

  _handlePayload = (payload: DebuggerAction): void => {
    switch (payload.actionType) {
      case ActionTypes.CLEAR_INTERFACE:
      case ActionTypes.SET_SELECTED_CALLFRAME_INDEX:
        this._handleClearInterface();
        break;
      case ActionTypes.UPDATE_SCOPES:
        this._handleUpdateScopes(payload.data);
        break;
      default:
        return;
    }
  };

  _handleClearInterface(): void {
    this._scopes.next([]);
  }

  _handleUpdateScopes(scopeSections: Array<ScopeSection>): void {
    this._scopes.next(scopeSections);
  }

  getScopes(): Observable<Array<ScopeSection>> {
    return this._scopes.asObservable();
  }

  supportsSetVariable(): boolean {
    return this._debuggerStore.supportsSetVariable();
  }

  // Returns a promise of the updated value after it has been set.
  async sendSetVariableRequest(
    scopeNumber: number,
    scopeObjectId: number,
    expression: string,
    newValue: string,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      function callback(error: Error, response: SetVariableResponse) {
        if (error != null) {
          reportError(`setVariable failed with ${JSON.stringify(error)}`);
          reject(error);
        } else {
          resolve(response.value);
        }
      }
      this._bridge.sendSetVariableCommand(
        scopeObjectId,
        expression,
        newValue,
        callback,
      );
    }).then(confirmedNewValue => {
      this._setVariable(scopeNumber, expression, confirmedNewValue);
      return confirmedNewValue;
    });
  }

  _setVariable = (
    scopeNumber: number,
    expression: string,
    confirmedNewValue: string,
  ): void => {
    const scopes = this._scopes.getValue();
    const selectedScope = scopes[scopeNumber];
    invariant(selectedScope != null);
    const variableToChange = selectedScope.scopeVariables.find(
      v => v.name === expression,
    );
    invariant(variableToChange != null);
    variableToChange.value.value = confirmedNewValue;
    if (variableToChange.value.description != null) {
      variableToChange.value.description = confirmedNewValue;
    }
    this._handleUpdateScopes(scopes);
  };

  dispose(): void {
    this._disposables.dispose();
  }
}
