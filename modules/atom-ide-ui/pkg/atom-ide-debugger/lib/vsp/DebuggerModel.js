/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

/**
The following debug model implementation was ported from VSCode's debugger implementation
in https://github.com/Microsoft/vscode/tree/master/src/vs/workbench/parts/debug

MIT License

Copyright (c) 2015 - present Microsoft Corporation

All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

import type {
  IExpression,
  IExpressionContainer,
  IEvaluatableExpression,
  IStackFrame,
  IBreakpoint,
  IRawModelUpdate,
  IRawStopppedUpdate,
  IRawThreadUpdate,
  ISession,
  IThread,
  IModel,
  IScope,
  ISource,
  IProcess,
  IRawStoppedDetails,
  IEnableable,
  IBreakpointsChangeEvent,
  IRawBreakpoint,
  IExceptionInfo,
  IExceptionBreakpoint,
  IFunctionBreakpoint,
  ITreeElement,
  IVariable,
  SourcePresentationHint,
} from '../types';
import type {IProcessConfig} from 'nuclide-debugger-common';
import * as DebugProtocol from 'vscode-debugprotocol';

import {Observable} from 'rxjs';
import uuid from 'uuid';
import nullthrows from 'nullthrows';
import invariant from 'assert';
import {Emitter, Range} from 'atom';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {track} from 'nuclide-commons/analytics';
import {AnalyticsEvents, UNKNOWN_SOURCE, DEBUG_SOURCES_URI} from '../constants';
import {openSourceLocation, onUnexpectedError} from '../utils';
import {distinct} from 'nuclide-commons/collection';

export class Source implements ISource {
  +uri: string;
  available: boolean;
  _raw: DebugProtocol.Source;

  constructor(raw: ?DebugProtocol.Source, sessionId: string) {
    if (raw == null) {
      this._raw = {name: UNKNOWN_SOURCE};
    } else {
      this._raw = raw;
    }
    if (this._raw.sourceReference != null && this._raw.sourceReference > 0) {
      this.uri = `${DEBUG_SOURCES_URI}/${sessionId}/${
        this._raw.sourceReference
      }/${this._raw.name == null ? UNKNOWN_SOURCE : this._raw.name}`;
    } else {
      this.uri = this._raw.path || '';
    }
    this.available = this.uri !== '';
  }

  get name(): ?string {
    return this._raw.name;
  }

  get origin(): ?string {
    return this._raw.origin;
  }

  get presentationHint(): ?SourcePresentationHint {
    return this._raw.presentationHint;
  }

  get raw(): DebugProtocol.Source {
    return this._raw;
  }

  get reference(): ?number {
    return this._raw.sourceReference;
  }

  get inMemory(): boolean {
    return this.uri.startsWith(DEBUG_SOURCES_URI);
  }

  openInEditor(): Promise<atom$TextEditor> {
    // eslint-disable-next-line nuclide-internal/atom-apis
    return atom.workspace.open(this.uri, {
      searchAllPanes: true,
      pending: true,
    });
  }
}

class ExpressionContainer implements IExpressionContainer {
  static allValues: Map<string, string> = new Map();
  // Use chunks to support variable paging #9537
  static BASE_CHUNK_SIZE = 100;

  _value: string;
  _children: ?Promise<IVariable[]>;
  process: ?IProcess;
  _reference: number;
  _id: string;
  _namedVariables: number;
  _indexedVariables: number;
  _startOfVariables: number;

  constructor(
    process: ?IProcess,
    reference: number,
    id: string,
    namedVariables: ?number,
    indexedVariables: ?number,
    startOfVariables: ?number,
  ) {
    this.process = process;
    this._reference = reference;
    this._id = id;
    this._namedVariables = namedVariables || 0;
    this._indexedVariables = indexedVariables || 0;
    this._startOfVariables = startOfVariables || 0;
  }

  get reference(): number {
    return this._reference;
  }

  set reference(value: number) {
    this._reference = value;
    this._children = null;
  }

  getChildren(): Promise<IVariable[]> {
    if (this._children == null) {
      this._children = this._doGetChildren();
    }

    return this._children;
  }

  async _doGetChildren(): Promise<IVariable[]> {
    if (!this.hasChildren()) {
      return [];
    }

    if (!this.getChildrenInChunks) {
      const variables = await this._fetchVariables();
      return variables;
    }

    // Check if object has named variables, fetch them independent from indexed variables #9670
    let childrenArray: Array<IVariable> = [];
    if (Boolean(this._namedVariables)) {
      childrenArray = await this._fetchVariables(undefined, undefined, 'named');
    }

    // Use a dynamic chunk size based on the number of elements #9774
    let chunkSize = ExpressionContainer.BASE_CHUNK_SIZE;
    while (
      this._indexedVariables >
      chunkSize * ExpressionContainer.BASE_CHUNK_SIZE
    ) {
      chunkSize *= ExpressionContainer.BASE_CHUNK_SIZE;
    }

    if (this._indexedVariables > chunkSize) {
      // There are a lot of children, create fake intermediate values that represent chunks #9537
      const numberOfChunks = Math.ceil(this._indexedVariables / chunkSize);
      for (let i = 0; i < numberOfChunks; i++) {
        const start = this._startOfVariables + i * chunkSize;
        const count = Math.min(
          chunkSize,
          this._indexedVariables - i * chunkSize,
        );
        childrenArray.push(
          new Variable(
            this.process,
            this,
            this.reference,
            `[${start}..${start + count - 1}]`,
            '',
            '',
            null,
            count,
            {kind: 'virtual'},
            null,
            true,
            start,
          ),
        );
      }

      return childrenArray;
    }

    const variables = await this._fetchVariables(
      this._startOfVariables,
      this._indexedVariables,
      'indexed',
    );
    return childrenArray.concat(variables);
  }

  getId(): string {
    return this._id;
  }

  getValue(): string {
    return this._value;
  }

  hasChildren(): boolean {
    // only variables with reference > 0 have children.
    return this.reference > 0;
  }

  async _fetchVariables(
    start?: number,
    count?: number,
    filter?: 'indexed' | 'named',
  ): Promise<IVariable[]> {
    const process = this.process;
    invariant(process);
    try {
      const response: DebugProtocol.VariablesResponse = await process.session.variables(
        {
          variablesReference: this.reference,
          start,
          count,
          filter,
        },
      );
      const variables = distinct(
        response.body.variables.filter(v => v != null && v.name),
        v => v.name,
      );
      return variables.map(
        v =>
          new Variable(
            this.process,
            this,
            v.variablesReference,
            v.name,
            v.evaluateName,
            v.value,
            v.namedVariables,
            v.indexedVariables,
            v.presentationHint,
            v.type,
          ),
      );
    } catch (e) {
      return [
        new Variable(
          this.process,
          this,
          0,
          null,
          e.message,
          '',
          0,
          0,
          {kind: 'virtual'},
          null,
          false,
        ),
      ];
    }
  }

  // The adapter explicitly sents the children count of an expression only if there are lots of children which should be chunked.
  get getChildrenInChunks(): boolean {
    return Boolean(this._indexedVariables);
  }

  setValue(value: string) {
    this._value = value;
    ExpressionContainer.allValues.set(this.getId(), value);
  }

  toString(): string {
    return this._value;
  }
}

export class Expression extends ExpressionContainer
  implements IEvaluatableExpression {
  static DEFAULT_VALUE = 'not available';

  available: boolean;
  _type: ?string;
  name: string;

  constructor(name: string, id?: string = uuid.v4()) {
    super(null, 0, id);
    this.name = name;
    this.available = false;
    this._type = null;
    // name is not set if the expression is just being added
    // in that case do not set default value to prevent flashing #14499
    if (name) {
      this._value = Expression.DEFAULT_VALUE;
    }
  }

  get type(): ?string {
    return this._type;
  }

  async evaluate(
    process: ?IProcess,
    stackFrame: ?IStackFrame,
    context: string,
  ): Promise<void> {
    if (process == null || (stackFrame == null && context !== 'repl')) {
      this._value =
        context === 'repl'
          ? 'Please start a debug session to evaluate'
          : Expression.DEFAULT_VALUE;
      this.available = false;
      this.reference = 0;
      return;
    }

    this.process = process;
    try {
      const response: DebugProtocol.EvaluateResponse = await process.session.evaluate(
        {
          expression: this.name,
          frameId: stackFrame ? stackFrame.frameId : undefined,
          context,
        },
      );

      this.available = response != null && response.body != null;
      if (response && response.body) {
        this._value = response.body.result;
        this.reference = response.body.variablesReference || 0;
        this._namedVariables = response.body.namedVariables || 0;
        this._indexedVariables = response.body.indexedVariables || 0;
        this._type = response.body.type;
      }
    } catch (err) {
      this._value = err.message;
      this.available = false;
      this.reference = 0;
    }
  }

  toString(): string {
    return `${this.name}\n${this._value}`;
  }
}

export class Variable extends ExpressionContainer implements IExpression {
  // Used to show the error message coming from the adapter when setting the value #7807
  errorMessage: ?string;
  parent: ExpressionContainer;
  name: string;
  evaluateName: ?string;
  presentationHint: ?DebugProtocol.VariablePresentationHint;
  _type: ?string;
  available: boolean;

  constructor(
    process: ?IProcess,
    parent: ExpressionContainer,
    reference: number,
    name: ?string,
    evaluateName: ?string,
    value: string,
    namedVariables: ?number,
    indexedVariables: ?number,
    presentationHint: ?DebugProtocol.VariablePresentationHint,
    type: ?string,
    available?: boolean = true,
    _startOfVariables: ?number,
  ) {
    super(
      process,
      reference,
      // flowlint-next-line sketchy-null-string:off
      `variable:${parent.getId()}:${name || 'no_name'}`,
      namedVariables,
      indexedVariables,
      _startOfVariables,
    );
    this.parent = parent;
    this.name = name == null ? 'no_name' : name;
    this.evaluateName = evaluateName;
    this.presentationHint = presentationHint;
    this._type = type;
    this.available = available;
    this._value = value;
  }

  get type(): ?string {
    return this._type;
  }

  async setVariable(value: string): Promise<void> {
    const process = nullthrows(this.process);
    track(AnalyticsEvents.DEBUGGER_EDIT_VARIABLE, {
      language: process.configuration.adapterType,
    });
    try {
      const response = await process.session.setVariable({
        name: nullthrows(this.name),
        value,
        variablesReference: this.parent.reference,
      });
      if (response && response.body) {
        this._value = response.body.value;
        this._type =
          response.body.type == null ? this._type : response.body.type;
        this.reference = response.body.variablesReference || 0;
        this._namedVariables = response.body.namedVariables || 0;
        this._indexedVariables = response.body.indexedVariables || 0;
      }
    } catch (err) {
      this.errorMessage = err.message;
    }
  }

  toString(): string {
    return `${this.name}: ${this._value}`;
  }
}

export class Scope extends ExpressionContainer implements IScope {
  +name: string;
  +expensive: boolean;
  +range: ?atom$Range;

  constructor(
    stackFrame: IStackFrame,
    index: number,
    name: string,
    reference: number,
    expensive: boolean,
    namedVariables: ?number,
    indexedVariables: ?number,
    range: ?atom$Range,
  ) {
    super(
      stackFrame.thread.process,
      reference,
      `scope:${stackFrame.getId()}:${name}:${index}`,
      namedVariables,
      indexedVariables,
    );
    this.name = name;
    this.expensive = expensive;
    this.range = range;
  }
}

export class StackFrame implements IStackFrame {
  scopes: ?Promise<Scope[]>;
  thread: IThread;
  frameId: number;
  source: ISource;
  name: string;
  presentationHint: ?string;
  range: atom$Range;
  index: number;

  constructor(
    thread: IThread,
    frameId: number,
    source: ISource,
    name: string,
    presentationHint: ?string,
    range: atom$Range,
    index: number,
  ) {
    this.thread = thread;
    this.frameId = frameId;
    this.source = source;
    this.name = name;
    this.presentationHint = presentationHint;
    this.range = range;
    this.index = index;
    this.scopes = null;
  }

  getId(): string {
    return `stackframe:${this.thread.getId()}:${this.frameId}:${this.index}`;
  }

  async getScopes(): Promise<IScope[]> {
    if (this.scopes == null) {
      this.scopes = this._getScopesImpl();
    }
    return (this.scopes: any);
  }

  async _getScopesImpl(): Promise<Scope[]> {
    try {
      const {
        body: {scopes},
      } = await this.thread.process.session.scopes({
        frameId: this.frameId,
      });
      return scopes.map(
        (rs, index) =>
          new Scope(
            this,
            index,
            rs.name,
            rs.variablesReference,
            rs.expensive,
            rs.namedVariables,
            rs.indexedVariables,
            rs.line != null
              ? new Range(
                  [rs.line - 1, (rs.column != null ? rs.column : 1) - 1],
                  [
                    (rs.endLine != null ? rs.endLine : rs.line) - 1,
                    (rs.endColumn != null ? rs.endColumn : 1) - 1,
                  ],
                )
              : null,
          ),
      );
    } catch (err) {
      return [];
    }
  }

  async getMostSpecificScopes(range: atom$Range): Promise<IScope[]> {
    const scopes: Array<IScope> = (await this.getScopes()).filter(
      s => !s.expensive,
    );
    const haveRangeInfo = scopes.some(s => s.range != null);
    if (!haveRangeInfo) {
      return scopes;
    }

    const scopesContainingRange = scopes
      .filter(scope => scope.range != null && scope.range.containsRange(range))
      .sort((first, second) => {
        const firstRange = nullthrows(first.range);
        const secondRange = nullthrows(second.range);
        // prettier-ignore
        return (firstRange.end.row - firstRange.start.row) -
          (secondRange.end.row - secondRange.end.row);
      });
    return scopesContainingRange.length ? scopesContainingRange : scopes;
  }

  async restart(): Promise<void> {
    await this.thread.process.session.restartFrame(
      {frameId: this.frameId},
      this.thread.threadId,
    );
  }

  toString(): string {
    return `${this.name} (${
      this.source.inMemory ? nullthrows(this.source.name) : this.source.uri
    }:${this.range.start.row})`;
  }

  async openInEditor(): Promise<?atom$TextEditor> {
    if (this.source.available) {
      return openSourceLocation(this.source.uri, this.range.start.row);
    } else {
      return null;
    }
  }
}

export class Thread implements IThread {
  _callStack: IStackFrame[];
  _staleCallStack: IStackFrame[];
  stoppedDetails: ?IRawStoppedDetails;
  stopped: boolean;
  +process: IProcess;
  +threadId: number;
  name: string;

  constructor(process: IProcess, name: string, threadId: number) {
    this.process = process;
    this.name = name;
    this.threadId = threadId;
    this.stoppedDetails = null;
    this._callStack = [];
    this._staleCallStack = [];
    this.stopped = false;
  }

  getId(): string {
    return `thread:${this.process.getId()}:${this.threadId}`;
  }

  clearCallStack(): void {
    if (this._callStack.length > 0) {
      this._staleCallStack = this._callStack;
    }
    this._callStack = [];
  }

  getCallStack(): IStackFrame[] {
    return this._callStack;
  }

  getStaleCallStack(): IStackFrame[] {
    return this._staleCallStack;
  }

  /**
   * Queries the debug adapter for the callstack and returns a promise
   * which completes once the call stack has been retrieved.
   * If the thread is not stopped, it returns a promise to an empty array.
   * Only fetches the first stack frame for performance reasons. Calling this method consecutive times
   * gets the remainder of the call stack.
   */
  async fetchCallStack(levels?: number = 20): Promise<void> {
    if (!this.stopped) {
      return;
    }

    const start = this._callStack.length;
    const callStack = await this._getCallStackImpl(start, levels);
    if (start < this._callStack.length) {
      // Set the stack frames for exact position we requested. To make sure no concurrent requests create duplicate stack frames #30660
      this._callStack.splice(start, this._callStack.length - start);
    }
    this._callStack = this._callStack.concat(callStack || []);
  }

  async _getCallStackImpl(
    startFrame: number,
    levels: number,
  ): Promise<IStackFrame[]> {
    try {
      const response: DebugProtocol.StackTraceResponse = await this.process.session.stackTrace(
        {
          threadId: this.threadId,
          startFrame,
          levels,
        },
      );
      if (response == null || response.body == null) {
        return [];
      }
      if (this.stoppedDetails != null) {
        this.stoppedDetails.totalFrames = response.body.totalFrames;
      }

      return response.body.stackFrames.map((rsf, index) => {
        const source = this.process.getSource(rsf.source);

        return new StackFrame(
          this,
          rsf.id,
          source,
          rsf.name,
          rsf.presentationHint,
          // The UI is 0-based while VSP is 1-based.
          new Range(
            [rsf.line - 1, (rsf.column || 1) - 1],
            [
              (rsf.endLine != null ? rsf.endLine : rsf.line) - 1,
              (rsf.endColumn != null ? rsf.endColumn : 1) - 1,
            ],
          ),
          startFrame + index,
        );
      });
    } catch (err) {
      if (this.stoppedDetails != null) {
        this.stoppedDetails.framesErrorMessage = err.message;
      }

      return [];
    }
  }

  /**
   * Returns exception info promise if the exception was thrown, otherwise null
   */
  async exceptionInfo(): Promise<?IExceptionInfo> {
    const session = this.process.session;
    if (
      this.stoppedDetails == null ||
      this.stoppedDetails.reason !== 'exception'
    ) {
      return null;
    }
    const stoppedDetails = this.stoppedDetails;
    if (!session.capabilities.supportsExceptionInfoRequest) {
      return {
        id: null,
        details: null,
        description: stoppedDetails.description,
        breakMode: null,
      };
    }

    const exception: DebugProtocol.ExceptionInfoResponse = await session.exceptionInfo(
      {threadId: this.threadId},
    );
    if (exception == null) {
      return null;
    }

    return {
      id: exception.body.exceptionId,
      description: exception.body.description,
      breakMode: exception.body.breakMode,
      details: exception.body.details,
    };
  }

  async next(): Promise<void> {
    track(AnalyticsEvents.DEBUGGER_STEP_OVER);
    await this.process.session.next({threadId: this.threadId});
  }

  async stepIn(): Promise<void> {
    track(AnalyticsEvents.DEBUGGER_STEP_INTO);
    await this.process.session.stepIn({threadId: this.threadId});
  }

  async stepOut(): Promise<void> {
    track(AnalyticsEvents.DEBUGGER_STEP_OUT);
    await this.process.session.stepOut({threadId: this.threadId});
  }

  async stepBack(): Promise<void> {
    track(AnalyticsEvents.DEBUGGER_STEP_BACK);
    await this.process.session.stepBack({threadId: this.threadId});
  }

  async continue(): Promise<void> {
    track(AnalyticsEvents.DEBUGGER_STEP_CONTINUE);
    await this.process.session.continue({threadId: this.threadId});
  }

  async pause(): Promise<void> {
    track(AnalyticsEvents.DEBUGGER_STEP_PAUSE);
    await this.process.session.pause({threadId: this.threadId});
  }

  async reverseContinue(): Promise<void> {
    await this.process.session.reverseContinue({threadId: this.threadId});
  }
}

export class Process implements IProcess {
  _sources: Map<string, ISource>;
  _threads: Map<number, Thread>;
  _session: ISession & ITreeElement;
  _configuration: IProcessConfig;

  constructor(configuration: IProcessConfig, session: ISession & ITreeElement) {
    this._configuration = configuration;
    this._session = session;
    this._threads = new Map();
    this._sources = new Map();
  }

  get sources(): Map<string, ISource> {
    return this._sources;
  }

  get session(): ISession & ITreeElement {
    return this._session;
  }

  get configuration(): IProcessConfig {
    return this._configuration;
  }

  getSource(raw: ?DebugProtocol.Source): ISource {
    let source = new Source(raw, this.getId());
    if (this._sources.has(source.uri)) {
      source = nullthrows(this._sources.get(source.uri));
    } else {
      this._sources.set(source.uri, source);
    }

    return source;
  }

  getThread(threadId: number): ?Thread {
    return this._threads.get(threadId);
  }

  getAllThreads(): IThread[] {
    return Array.from(this._threads.values());
  }

  getId(): string {
    return this._session.getId();
  }

  rawStoppedUpdate(data: IRawStopppedUpdate): void {
    const {threadId, stoppedDetails} = data;
    if (threadId != null && !this._threads.has(threadId)) {
      // We're being asked to update a thread we haven't seen yet, so
      // create it
      const thread = new Thread(this, 'PENDING_UPDATE', threadId);
      this._threads.set(threadId, thread);
    }

    // Set the availability of the threads' callstacks depending on
    // whether the thread is stopped or not
    if (stoppedDetails.allThreadsStopped) {
      this._threads.forEach(thread => {
        thread.stoppedDetails =
          thread.threadId === threadId ? stoppedDetails : thread.stoppedDetails;
        thread.stopped = true;
        thread.clearCallStack();
      });
    } else if (threadId != null) {
      // One thread is stopped, only update that thread.
      const thread = nullthrows(this._threads.get(threadId));
      thread.stoppedDetails = stoppedDetails;
      thread.clearCallStack();
      thread.stopped = true;
    }
  }

  rawThreadUpdate(data: IRawThreadUpdate): void {
    const {thread} = data;
    if (!this._threads.has(thread.id)) {
      // A new thread came in, initialize it.
      this._threads.set(thread.id, new Thread(this, thread.name, thread.id));
    } else if (thread.name) {
      // Just the thread name got updated #18244
      nullthrows(this._threads.get(thread.id)).name = thread.name;
    }
  }

  clearThreads(removeThreads: boolean, reference?: number): void {
    if (reference != null) {
      if (this._threads.has(reference)) {
        const thread = nullthrows(this._threads.get(reference));
        thread.clearCallStack();
        thread.stoppedDetails = null;
        thread.stopped = false;

        if (removeThreads) {
          this._threads.delete(reference);
        }
      }
    } else {
      this._threads.forEach(thread => {
        thread.clearCallStack();
        thread.stoppedDetails = null;
        thread.stopped = false;
      });

      if (removeThreads) {
        this._threads.clear();
        ExpressionContainer.allValues.clear();
      }
    }
  }

  async completions(
    frameId: number,
    text: string,
    position: atom$Point,
    overwriteBefore: number,
  ): Promise<Array<DebugProtocol.CompletionItem>> {
    if (!this._session.capabilities.supportsCompletionsRequest) {
      return [];
    }
    try {
      const response = await this._session.completions({
        frameId,
        text,
        column: position.column,
        line: position.row,
      });
      if (response && response.body && response.body.targets) {
        return response.body.targets;
      } else {
        return [];
      }
    } catch (error) {
      return [];
    }
  }
}

export class Breakpoint implements IBreakpoint {
  verified: boolean;
  idFromAdapter: ?number;
  message: ?string;
  endLine: ?number;
  endColumn: ?number;
  id: string;
  uri: string;
  line: number;
  column: number;
  enabled: boolean;
  condition: ?string;
  hitCondition: ?string;
  adapterData: any;

  constructor(
    uri: string,
    line: number,
    column: ?number,
    enabled: ?boolean,
    condition: ?string,
    hitCondition: ?string,
    adapterData?: any,
  ) {
    this.uri = uri;
    this.line = line;
    this.column = column == null ? 1 : column;
    this.enabled = enabled == null ? true : enabled;
    this.condition = condition;
    this.hitCondition = hitCondition;
    this.adapterData = adapterData;
    this.verified = false;
    this.id = uuid.v4();
    this.endLine = null;
  }

  getId(): string {
    return this.id;
  }
}

export class FunctionBreakpoint implements IFunctionBreakpoint {
  id: string;
  verified: boolean;
  idFromAdapter: ?number;
  name: string;
  enabled: boolean;
  hitCondition: ?string;
  condition: ?string;

  constructor(name: string, enabled: boolean, hitCondition: ?string) {
    this.name = name;
    this.enabled = enabled;
    this.hitCondition = hitCondition;
    this.condition = null;
    this.verified = false;
    this.idFromAdapter = null;
    this.id = uuid.v4();
  }

  getId(): string {
    return this.id;
  }
}

export class ExceptionBreakpoint implements IExceptionBreakpoint {
  _id: string;
  +filter: string;
  +label: string;
  enabled: boolean;

  constructor(filter: string, label: string, enabled: ?boolean) {
    this.filter = filter;
    this.label = label;
    this.enabled = enabled == null ? false : enabled;
    this._id = uuid.v4();
  }

  getId(): string {
    return this._id;
  }
}

const BREAKPOINTS_CHANGED = 'BREAKPOINTS_CHANGED';
const CALLSTACK_CHANGED = 'CALLSTACK_CHANGED';
const WATCH_EXPRESSIONS_CHANGED = 'WATCH_EXPRESSIONS_CHANGED';

export class Model implements IModel {
  _processes: Process[];
  _schedulers: Map<string, rxjs$Subscription>;
  _breakpoints: Breakpoint[];
  _breakpointsActivated: boolean;
  _functionBreakpoints: FunctionBreakpoint[];
  _exceptionBreakpoints: ExceptionBreakpoint[];
  _watchExpressions: Expression[];
  _disposables: UniversalDisposable;
  _emitter: Emitter;

  constructor(
    breakpoints: Breakpoint[],
    breakpointsActivated: boolean,
    functionBreakpoints: FunctionBreakpoint[],
    exceptionBreakpoints: ExceptionBreakpoint[],
    watchExpressions: Expression[],
  ) {
    this._processes = [];
    this._schedulers = new Map();
    this._breakpoints = breakpoints;
    this._breakpointsActivated = breakpointsActivated;
    this._functionBreakpoints = functionBreakpoints;
    this._exceptionBreakpoints = exceptionBreakpoints;
    this._watchExpressions = watchExpressions;
    this._emitter = new Emitter();
    this._disposables = new UniversalDisposable(this._emitter);
  }

  getId(): string {
    return 'root';
  }

  getProcesses(): IProcess[] {
    return (this._processes: any);
  }

  addProcess(
    configuration: IProcessConfig,
    session: ISession & ITreeElement,
  ): Process {
    const process = new Process(configuration, session);
    this._processes.push(process);
    return process;
  }

  removeProcess(id: string): Array<Process> {
    const removedProcesses = [];
    this._processes = this._processes.filter(p => {
      if (p.getId() === id) {
        removedProcesses.push(p);
        return false;
      } else {
        return true;
      }
    });
    this._emitter.emit(CALLSTACK_CHANGED);
    return removedProcesses;
  }

  onDidChangeBreakpoints(
    callback: (event: IBreakpointsChangeEvent) => mixed,
  ): IDisposable {
    return this._emitter.on(BREAKPOINTS_CHANGED, callback);
  }

  onDidChangeCallStack(callback: () => mixed): IDisposable {
    return this._emitter.on(CALLSTACK_CHANGED, callback);
  }

  onDidChangeWatchExpressions(
    callback: (expression: ?IExpression) => mixed,
  ): IDisposable {
    return this._emitter.on(WATCH_EXPRESSIONS_CHANGED, callback);
  }

  rawUpdate(data: IRawModelUpdate): void {
    const process = this._processes
      .filter(p => p.getId() === data.sessionId)
      .pop();
    if (process == null) {
      return;
    }
    if (data.stoppedDetails != null) {
      process.rawStoppedUpdate((data: any));
    } else {
      process.rawThreadUpdate((data: any));
    }

    this._emitter.emit(CALLSTACK_CHANGED);
  }

  clearThreads(id: string, removeThreads: boolean, reference?: number): void {
    const process = this._processes.filter(p => p.getId() === id).pop();
    this._schedulers.forEach(scheduler => scheduler.unsubscribe());
    this._schedulers.clear();

    if (process != null) {
      process.clearThreads(removeThreads, reference);
      this._emitter.emit(CALLSTACK_CHANGED);
    }
  }

  async fetchCallStack(threadI: IThread): Promise<void> {
    const thread: Thread = (threadI: any);
    if (
      // $FlowFixMe(>=0.68.0) Flow suppress (T27187857)
      nullthrows(thread.process).session.capabilities
        .supportsDelayedStackTraceLoading
    ) {
      // For improved performance load the first stack frame and then load the rest async.
      await thread.fetchCallStack(1);
      if (!this._schedulers.has(thread.getId())) {
        this._schedulers.set(
          thread.getId(),
          Observable.timer(500).subscribe(() => {
            thread
              .fetchCallStack(19)
              .then(
                () => this._emitter.emit(CALLSTACK_CHANGED),
                onUnexpectedError,
              );
          }),
        );
      }
    } else {
      thread.clearCallStack();
      await thread.fetchCallStack();
    }
    this._emitter.emit(CALLSTACK_CHANGED);
  }

  getBreakpoints(): IBreakpoint[] {
    return (this._breakpoints: any);
  }

  getBreakpointAtLine(uri: string, line: number): ?IBreakpoint {
    // Since we show calibrated breakpoints at their end line, prefer an end line
    // match. If there is no such breakpoint, try a start line match.
    let breakpoint = this._breakpoints.find(
      bp => bp.uri === uri && bp.endLine === line,
    );
    if (breakpoint == null) {
      breakpoint = this._breakpoints.find(
        bp => bp.uri === uri && bp.line === line,
      );
    }
    return breakpoint;
  }

  getBreakpointById(id: string): ?IBreakpoint {
    return this._breakpoints.find(bp => bp.getId() === id);
  }

  getFunctionBreakpoints(): IFunctionBreakpoint[] {
    return (this._functionBreakpoints: any);
  }

  getExceptionBreakpoints(): IExceptionBreakpoint[] {
    return (this._exceptionBreakpoints: any);
  }

  setExceptionBreakpoints(
    data: DebugProtocol.ExceptionBreakpointsFilter[],
  ): void {
    this._exceptionBreakpoints = data.map(d => {
      const ebp = this._exceptionBreakpoints
        .filter(bp => bp.filter === d.filter)
        .pop();
      return new ExceptionBreakpoint(
        d.filter,
        d.label,
        ebp ? ebp.enabled : d.default,
      );
    });
    this._emitter.emit(BREAKPOINTS_CHANGED);
  }

  areBreakpointsActivated(): boolean {
    return this._breakpointsActivated;
  }

  setBreakpointsActivated(activated: boolean): void {
    this._breakpointsActivated = activated;
    this._emitter.emit(BREAKPOINTS_CHANGED);
  }

  addBreakpoints(
    uri: string,
    rawData: IRawBreakpoint[],
    fireEvent?: boolean = true,
  ): Breakpoint[] {
    const newBreakpoints = rawData.map(
      rawBp =>
        new Breakpoint(
          uri,
          rawBp.line,
          rawBp.column,
          rawBp.enabled,
          rawBp.condition,
          rawBp.hitCondition,
        ),
    );
    this._breakpoints = this._breakpoints.concat(newBreakpoints);
    this._breakpointsActivated = true;
    this._sortAndDeDup();

    if (fireEvent) {
      this._emitter.emit(BREAKPOINTS_CHANGED, {added: newBreakpoints});
    }

    return newBreakpoints;
  }

  removeBreakpoints(toRemove: IBreakpoint[]): void {
    this._breakpoints = this._breakpoints.filter(
      bp => !toRemove.some(r => r.getId() === bp.getId()),
    );
    this._emitter.emit(BREAKPOINTS_CHANGED, {removed: toRemove});
  }

  updateBreakpoints(data: {[id: string]: DebugProtocol.Breakpoint}): void {
    const updated: IBreakpoint[] = [];
    this._breakpoints.forEach(bp => {
      const bpData = data[bp.getId()];
      if (bpData != null) {
        bp.line = bpData.line != null ? bpData.line : bp.line;
        bp.endLine = bpData.endLine != null ? bpData.endLine : bp.endLine;
        bp.column = bpData.column != null ? bpData.column : bp.column;
        bp.endColumn = bpData.endColumn;
        bp.verified = bpData.verified != null ? bpData.verified : bp.verified;
        bp.idFromAdapter = bpData.id;
        bp.message = bpData.message;
        bp.adapterData = bpData.source
          ? bpData.source.adapterData
          : bp.adapterData;
        updated.push(bp);
      }
    });
    this._sortAndDeDup();
    this._emitter.emit(BREAKPOINTS_CHANGED, {changed: updated});
  }

  _sortAndDeDup(): void {
    this._breakpoints = this._breakpoints.sort((first, second) => {
      if (first.uri !== second.uri) {
        return first.uri.localeCompare(second.uri);
      }
      if (first.line === second.line) {
        return first.column - second.column;
      }

      return first.line - second.line;
    });
    this._breakpoints = distinct(
      this._breakpoints,
      bp =>
        `${bp.uri}:${bp.endLine != null ? bp.endLine : bp.line}:${bp.column}`,
    );
  }

  setEnablement(element: IEnableable, enable: boolean): void {
    const changed: Array<IBreakpoint | IFunctionBreakpoint> = [];
    if (
      element.enabled !== enable &&
      (element instanceof Breakpoint || element instanceof FunctionBreakpoint)
    ) {
      changed.push(element);
    }

    element.enabled = enable;
    if (element instanceof Breakpoint && !element.enabled) {
      element.verified = false;
    }

    this._emitter.emit(BREAKPOINTS_CHANGED, {changed});
  }

  enableOrDisableAllBreakpoints(enable: boolean): void {
    const changed: (IBreakpoint | IFunctionBreakpoint)[] = [];
    this._breakpoints.forEach(bp => {
      if (bp.enabled !== enable) {
        changed.push(bp);
      }
      bp.enabled = enable;
      if (!enable) {
        bp.verified = false;
      }
    });
    this._functionBreakpoints.forEach(fbp => {
      if (fbp.enabled !== enable) {
        changed.push(fbp);
      }
      fbp.enabled = enable;
    });

    this._emitter.emit(BREAKPOINTS_CHANGED, {changed});
  }

  addFunctionBreakpoint(functionName: string): FunctionBreakpoint {
    const newFunctionBreakpoint = new FunctionBreakpoint(
      functionName,
      true,
      null,
    );
    this._functionBreakpoints.push(newFunctionBreakpoint);
    this._emitter.emit(BREAKPOINTS_CHANGED, {added: [newFunctionBreakpoint]});
    return newFunctionBreakpoint;
  }

  updateFunctionBreakpoints(data: {
    [id: string]: {
      name?: string,
      verified?: boolean,
      id?: number,
      hitCondition?: string,
    },
  }): void {
    const changed: IFunctionBreakpoint[] = [];

    this._functionBreakpoints.forEach(fbp => {
      const fbpData = data[fbp.getId()];
      if (fbpData != null) {
        fbp.name = fbpData.name != null ? fbpData.name : fbp.name;
        fbp.verified = fbpData.verified || fbp.verified;
        fbp.idFromAdapter = fbpData.id;
        fbp.hitCondition = fbpData.hitCondition;

        changed.push(fbp);
      }
    });

    this._emitter.emit(BREAKPOINTS_CHANGED, {changed});
  }

  removeFunctionBreakpoints(id?: string): void {
    let removed: FunctionBreakpoint[];
    if (id != null) {
      removed = this._functionBreakpoints.filter(fbp => fbp.getId() === id);
      this._functionBreakpoints = this._functionBreakpoints.filter(
        fbp => fbp.getId() !== id,
      );
    } else {
      removed = this._functionBreakpoints;
      this._functionBreakpoints = [];
    }
    this._emitter.emit(BREAKPOINTS_CHANGED, {removed});
  }

  getWatchExpressions(): IEvaluatableExpression[] {
    return (this._watchExpressions: any);
  }

  addWatchExpression(name: string): void {
    const we = new Expression(name);
    this._watchExpressions.push(we);
    this._emitter.emit(WATCH_EXPRESSIONS_CHANGED, we);
  }

  renameWatchExpression(id: string, newName: string): void {
    const filtered = this._watchExpressions.filter(we => we.getId() === id);
    if (filtered.length === 1) {
      filtered[0].name = newName;
      this._emitter.emit(WATCH_EXPRESSIONS_CHANGED, filtered[0]);
    }
  }

  removeWatchExpressions(id: ?string): void {
    this._watchExpressions =
      id != null ? this._watchExpressions.filter(we => we.getId() !== id) : [];
    this._emitter.emit(WATCH_EXPRESSIONS_CHANGED);
  }

  sourceIsNotAvailable(uri: string): void {
    this._processes.forEach(p => {
      if (p.sources.has(uri)) {
        nullthrows(p.sources.get(uri)).available = false;
      }
    });
    this._emitter.emit(CALLSTACK_CHANGED);
  }

  dispose(): void {
    this._disposables.dispose();
  }
}
