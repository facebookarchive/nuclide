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
  CallFrameId,
  EvaluateOnCallFrameResponse,
} from '../../../nuclide-debugger-base/lib/protocol-types';
import type {ObjectGroup} from '../types';
import type DebuggerDomainDispatcher from './DebuggerDomainDispatcher';

import {Subject, Observable} from 'rxjs';
import {reportError} from './Utils';

/**
 * Bridge between Nuclide IPC and RPC breakpoint protocols.
 */
export default class ExpressionEvaluationManager {
  _debuggerDispatcher: DebuggerDomainDispatcher;
  _evalutionEvent$: Subject<Array<mixed>>;

  constructor(debuggerDispatcher: DebuggerDomainDispatcher) {
    this._debuggerDispatcher = debuggerDispatcher;
    this._evalutionEvent$ = new Subject();
  }

  evaluateOnCallFrame(
    transactionId: number,
    callFrameId: CallFrameId,
    expression: string,
    objectGroup: ObjectGroup,
  ): void {
    function callback(error: Error, response: EvaluateOnCallFrameResponse) {
      if (error != null) {
        reportError(
          `setFilelineBreakpoint failed with ${JSON.stringify(error)}`,
        );
        return;
      }
      const {result, wasThrown, exceptionDetails} = response;
      this._raiseIPCEvent('ExpressionEvaluationResponse', {
        result,
        error: wasThrown ? exceptionDetails : null,
        expression,
        id: transactionId,
      });
    }
    this._debuggerDispatcher.evaluateOnCallFrame(
      callFrameId,
      expression,
      objectGroup,
      callback.bind(this),
    );
  }

  getEventObservable(): Observable<Array<mixed>> {
    return this._evalutionEvent$.asObservable();
  }

  // Not a real IPC event, but simulate the chrome IPC events/responses
  // across bridge boundary.
  _raiseIPCEvent(...args: Array<mixed>): void {
    this._evalutionEvent$.next(args);
  }

  dispose(): void {}
}
