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
 * The following interfaces models a debug service and data model layer built on top of
 * VSCode debugger protocol and were modeled after VSCode's debugger implementation
 * in https://github.com/Microsoft/vscode/tree/master/src/vs/workbench/parts/debug

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

import type {Observable} from 'rxjs';
import * as DebugProtocol from 'vscode-debugprotocol';
import type {IProcessConfig, IVspInstance} from 'nuclide-debugger-common';

export interface RemoteDebuggerService {
  startVspDebugging(config: IProcessConfig): Promise<IVspInstance>;
  onDidStartDebugSession(
    callback: (config: IProcessConfig) => mixed,
  ): IDisposable;
}

export interface ITreeElement {
  getId(): string;
}

export interface ISource {
  available: boolean;
  +name: ?string;
  +uri: string;
  +origin: ?string;
  +presentationHint: ?SourcePresentationHint;
  +raw: DebugProtocol.Source;
  +reference: ?number;
  +inMemory: boolean;
  openInEditor(): Promise<atom$TextEditor>;
}

export type SourcePresentationHint = 'normal' | 'emphasize' | 'deemphasize';

export interface IExpressionContainer extends ITreeElement {
  hasChildren(): boolean;
  getChildren(): Promise<Array<IVariable>>;
}

export interface IExpression extends IExpressionContainer {
  available: boolean;
  name: string;
  getValue(): string;
  +type: ?string;
  toString(): string;
}

export type ContextType = 'hover' | 'watch' | 'repl';

export interface IEvaluatableExpression extends IExpression {
  evaluate(
    process: ?IProcess,
    stackFrame: ?IStackFrame,
    context: ContextType,
  ): Promise<void>;
}

export interface IVariable extends IExpression {
  setVariable(newValue: string): Promise<void>;
}

export interface ISession {
  stackTrace(
    args: DebugProtocol.StackTraceArguments,
  ): Promise<DebugProtocol.StackTraceResponse>;
  exceptionInfo(
    args: DebugProtocol.ExceptionInfoArguments,
  ): Promise<DebugProtocol.ExceptionInfoResponse>;
  scopes(
    args: DebugProtocol.ScopesArguments,
  ): Promise<DebugProtocol.ScopesResponse>;
  variables(
    args: DebugProtocol.VariablesArguments,
  ): Promise<DebugProtocol.VariablesResponse>;
  evaluate(
    args: DebugProtocol.EvaluateArguments,
  ): Promise<DebugProtocol.EvaluateResponse>;
  capabilities: DebugProtocol.Capabilities;
  disconnect(restart?: boolean, force?: boolean): Promise<void>;
  custom(request: string, args: any): Promise<DebugProtocol.CustomResponse>;
  observeInitializeEvents(): Observable<DebugProtocol.InitializedEvent>;
  observeCustomEvents(): Observable<DebugProtocol.DebugEvent>;
  observeStopEvents(): Observable<DebugProtocol.StoppedEvent>;
  restartFrame(
    args: DebugProtocol.RestartFrameArguments,
    threadId: number,
  ): Promise<DebugProtocol.RestartFrameResponse>;
  next(args: DebugProtocol.NextArguments): Promise<DebugProtocol.NextResponse>;
  stepIn(
    args: DebugProtocol.StepInArguments,
  ): Promise<DebugProtocol.StepInResponse>;
  stepOut(
    args: DebugProtocol.StepOutArguments,
  ): Promise<DebugProtocol.StepOutResponse>;
  continue(
    args: DebugProtocol.ContinueArguments,
  ): Promise<DebugProtocol.ContinueResponse>;
  pause(
    args: DebugProtocol.PauseArguments,
  ): Promise<DebugProtocol.PauseResponse>;
  stepBack(
    args: DebugProtocol.StepBackArguments,
  ): Promise<DebugProtocol.StepBackResponse>;
  reverseContinue(
    args: DebugProtocol.ReverseContinueArguments,
  ): Promise<DebugProtocol.ReverseContinueResponse>;
  completions(
    args: DebugProtocol.CompletionsArguments,
  ): Promise<DebugProtocol.CompletionsResponse>;
  setVariable(
    args: DebugProtocol.SetVariableArguments,
  ): Promise<DebugProtocol.SetVariableResponse>;
  source(
    args: DebugProtocol.SourceArguments,
  ): Promise<DebugProtocol.SourceResponse>;
}

export interface IThread extends ITreeElement {
  /**
   * Process the thread belongs to
   */
  +process: IProcess;

  /**
   * Id of the thread generated by the debug adapter backend.
   */
  +threadId: number;

  /**
   * Name of the thread.
   */
  name: string;

  /**
   * Information about the current thread stop event. Null if thread is not stopped.
   */
  stoppedDetails: ?IRawStoppedDetails;

  /**
   * Information about the exception if an 'exception' stopped event raised and DA supports the 'exceptionInfo' request, otherwise null.
   */
  exceptionInfo(): Promise<?IExceptionInfo>;

  /**
   * Gets the already-fetched callstack from the debug adapter.
   */
  getCallStack(): IStackFrame[];

  /**
   * Invalidates the callstack cache.
   */
  clearCallStack(): void;

  /**
   * Fetches more callstack items on user demand
   */
  fetchCallStack(levels?: number): Promise<void>;

  /**
   * Indicates whether this thread is stopped. The callstack for stopped
   * threads can be retrieved from the debug adapter.
   */
  stopped: boolean;

  next(): Promise<any>;
  stepIn(): Promise<any>;
  stepOut(): Promise<any>;
  stepBack(): Promise<any>;
  continue(): Promise<any>;
  pause(): Promise<any>;
  reverseContinue(): Promise<any>;
}

export interface IScope extends IExpressionContainer {
  +name: string;
  +expensive: boolean;
  +range: ?atom$Range;
}

export interface IProcess extends ITreeElement {
  +configuration: IProcessConfig;
  +session: ISession & ITreeElement;
  +sources: Map<string, ISource>;
  getThread(threadId: number): ?IThread;
  getAllThreads(): IThread[];
  getSource(raw: ?DebugProtocol.Source): ISource;
  completions(
    frameId: number,
    text: string,
    position: atom$Point,
    overwriteBefore: number,
  ): Promise<Array<DebugProtocol.CompletionItem>>;
}

export interface IEnableable extends ITreeElement {
  enabled: boolean;
}

export interface IRawBreakpoint {
  line: number;
  column?: number;
  enabled?: boolean;
  condition?: string;
  hitCondition?: string;
}

export interface IExceptionBreakpoint extends IEnableable {
  +filter: string;
  +label: string;
}

export type IExceptionInfo = {
  id: ?string,
  description: ?string,
  breakMode: ?string,
  details: ?DebugProtocol.ExceptionDetails,
};

export interface IViewModel {
  /**
   * Returns the focused debug process or null if no process is stopped.
   */
  +focusedProcess: ?IProcess;

  /**
   * Returns the focused thread or null if no thread is stopped.
   */
  +focusedThread: ?IThread;

  /**
   * Returns the focused stack frame or null if there are no stack frames.
   */
  +focusedStackFrame: ?IStackFrame;
  isMultiProcessView(): boolean;

  onDidFocusProcess(callback: (process: ?IProcess) => mixed): IDisposable;
  onDidFocusStackFrame(
    callback: (data: {stackFrame: ?IStackFrame, explicit: boolean}) => mixed,
  ): IDisposable;
  onDidChangeExpressionContext(
    callback: (data: {stackFrame: ?IStackFrame, explicit: boolean}) => mixed,
  ): IDisposable;
}

export interface IModel extends ITreeElement {
  getProcesses(): IProcess[];
  getBreakpoints(): IBreakpoint[];
  getBreakpointAtLine(uri: string, line: number): ?IBreakpoint;
  getBreakpointById(id: string): ?IBreakpoint;

  areBreakpointsActivated(): boolean;
  getFunctionBreakpoints(): IFunctionBreakpoint[];
  getExceptionBreakpoints(): IExceptionBreakpoint[];
  getWatchExpressions(): IEvaluatableExpression[];
  fetchCallStack(thread: IThread): Promise<void>;

  onDidChangeBreakpoints(
    callback: (event: ?IBreakpointsChangeEvent) => mixed,
  ): IDisposable;
  onDidChangeCallStack(callback: () => mixed): IDisposable;
  onDidChangeWatchExpressions(
    callback: (expression: ?IExpression) => mixed,
  ): IDisposable;
}

export interface IBreakpointsChangeEvent {
  added?: (IBreakpoint | IFunctionBreakpoint)[];
  removed?: (IBreakpoint | IFunctionBreakpoint)[];
  changed?: (IBreakpoint | IFunctionBreakpoint)[];
}

/* Debugger mode */
export type DebuggerModeType =
  | 'starting'
  | 'running'
  | 'paused'
  | 'stopping'
  | 'stopped';

export interface IDebugService {
  +viewModel: IViewModel;
  getDebuggerMode(): DebuggerModeType;

  onDidChangeMode(callback: (mode: DebuggerModeType) => mixed): IDisposable;
  onDidStartDebugSession(
    callback: (config: IProcessConfig) => mixed,
  ): IDisposable;
  onDidCustomEvent(
    callback: (event: DebugProtocol.DebugEvent) => mixed,
  ): IDisposable;

  /**
   * Sets the focused stack frame and evaluates all expressions against the newly focused stack frame,
   */
  focusStackFrame(
    stackFrame: ?IStackFrame,
    thread: ?IThread,
    process: ?IProcess,
    explicit?: boolean,
  ): void;

  /**
   * Adds new breakpoints to the model for the file specified with the uri. Notifies debug adapter of breakpoint changes.
   */
  addBreakpoints(uri: string, rawBreakpoints: IRawBreakpoint[]): Promise<void>;

  /**
   * Updates the breakpoints.
   */
  updateBreakpoints(
    uri: string,
    data: {[id: string]: DebugProtocol.Breakpoint},
  ): void;

  /**
   * Enables or disables all breakpoints. If breakpoint is passed only enables or disables the passed breakpoint.
   * Notifies debug adapter of breakpoint changes.
   */
  enableOrDisableBreakpoints(
    enable: boolean,
    breakpoint?: IEnableable,
  ): Promise<void>;

  toggleSourceBreakpoint(uri: string, line: number): Promise<void>;

  /**
   * Sets the global activated property for all breakpoints.
   * Notifies debug adapter of breakpoint changes.
   */
  setBreakpointsActivated(activated: boolean): Promise<void>;

  /**
   * Removes all breakpoints. If id is passed only removes the breakpoint associated with that id.
   * Notifies debug adapter of breakpoint changes.
   */
  removeBreakpoints(id?: string): Promise<void>;

  /**
   * Adds a new no name function breakpoint. The function breakpoint should be renamed once user enters the name.
   */
  addFunctionBreakpoint(): void;

  /**
   * Renames an already existing function breakpoint.
   * Notifies debug adapter of breakpoint changes.
   */
  renameFunctionBreakpoint(id: string, newFunctionName: string): Promise<void>;

  /**
   * Removes all function breakpoints. If id is passed only removes the function breakpoint with the passed id.
   * Notifies debug adapter of breakpoint changes.
   */
  removeFunctionBreakpoints(id?: string): Promise<void>;

  /**
   * Adds a new watch expression and evaluates it against the debug adapter.
   */
  addWatchExpression(name: string): void;

  /**
   * Creates an expression to be evaluated.
   */
  createExpression(rawExpression: string): IEvaluatableExpression;

  /**
   * Renames a watch expression and evaluates it against the debug adapter.
   */
  renameWatchExpression(id: string, newName: string): void;

  /**
   * Removes all watch expressions. If id is passed only removes the watch expression with the passed id.
   */
  removeWatchExpressions(id?: string): void;

  /**
   * Starts debugging. If the configOrName is not passed uses the selected configuration in the debug dropdown.
   * Also saves all files, manages if compounds are present in the configuration
   * and resolveds configurations via DebugConfigurationProviders.
   */
  startDebugging(config: IProcessConfig): Promise<void>;

  /**
   * Restarts a process or creates a new one if there is no active session.
   */
  restartProcess(): Promise<any>;

  /**
   * Stops the process. If the process does not exist then stops all processes.
   */
  stopProcess(): Promise<void>;

  /**
   * Gets the current debug model.
   */
  getModel(): IModel;
}

export interface IStackFrame extends ITreeElement {
  thread: IThread;
  name: string;
  presentationHint: ?string;
  frameId: number;
  range: atom$Range;
  source: ISource;
  getScopes(): Promise<IScope[]>;
  getMostSpecificScopes(range: atom$Range): Promise<IScope[]>;
  restart(): Promise<void>;
  toString(): string;
  openInEditor(): Promise<?atom$TextEditor>;
}

export interface IBreakpoint extends IEnableable {
  uri: string;
  line: number;
  endLine: ?number;
  column: number;
  endColumn: ?number;
  condition: ?string;
  hitCondition: ?string;
  verified: boolean;
  idFromAdapter: ?number;
  message: ?string;
  adapterData?: any;
}

export interface IFunctionBreakpoint extends IEnableable {
  name: string;
  verified: boolean;
  idFromAdapter: ?number;
  condition?: ?string;
  hitCondition?: ?string;
}

export type IRawStopppedUpdate = {
  sessionId: string,
  threadId: ?number,
  stoppedDetails: IRawStoppedDetails,
};

export type IRawThreadUpdate = {
  sessionId: string,
  thread: DebugProtocol.Thread,
};

export type IRawModelUpdate = IRawStopppedUpdate | IRawThreadUpdate;

export interface IRawStoppedDetails {
  reason?: string;
  preserveFocusHint?: boolean;
  description?: string;
  threadId?: number;
  text?: string;
  totalFrames?: number;
  allThreadsStopped?: boolean;
  framesErrorMessage?: string;
}

export type SerializedState = {
  sourceBreakpoints: ?Array<IBreakpoint>,
  functionBreakpoints: ?Array<IFunctionBreakpoint>,
  exceptionBreakpoints: ?Array<IExceptionBreakpoint>,
  watchExpressions: ?Array<string>,
  showDebugger: boolean,
  workspaceDocksVisibility: Array<boolean>,
};
