"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function DebugProtocol() {
  const data = _interopRequireWildcard(require("vscode-debugprotocol"));

  DebugProtocol = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

function _Icon() {
  const data = require("../../../../../nuclide-commons-ui/Icon");

  _Icon = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../../../nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _observable() {
  const data = require("../../../../../nuclide-commons/observable");

  _observable = function () {
    return data;
  };

  return data;
}

function _event() {
  const data = require("../../../../../nuclide-commons/event");

  _event = function () {
    return data;
  };

  return data;
}

function _promise() {
  const data = require("../../../../../nuclide-commons/promise");

  _promise = function () {
    return data;
  };

  return data;
}

function _nuclideDebuggerCommon() {
  const data = require("../../../../../nuclide-debugger-common");

  _nuclideDebuggerCommon = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _TextEditorBanner() {
  const data = require("../../../../../nuclide-commons-ui/TextEditorBanner");

  _TextEditorBanner = function () {
    return data;
  };

  return data;
}

function _ReadOnlyNotice() {
  const data = _interopRequireDefault(require("../../../../../nuclide-commons-ui/ReadOnlyNotice"));

  _ReadOnlyNotice = function () {
    return data;
  };

  return data;
}

function _analytics() {
  const data = require("../../../../../nuclide-commons/analytics");

  _analytics = function () {
    return data;
  };

  return data;
}

function _nullthrows() {
  const data = _interopRequireDefault(require("nullthrows"));

  _nullthrows = function () {
    return data;
  };

  return data;
}

function _AtomServiceContainer() {
  const data = require("../AtomServiceContainer");

  _AtomServiceContainer = function () {
    return data;
  };

  return data;
}

function _utils() {
  const data = require("../utils");

  _utils = function () {
    return data;
  };

  return data;
}

function _DebuggerModel() {
  const data = require("./DebuggerModel");

  _DebuggerModel = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../../../nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

var _atom = require("atom");

function _collection() {
  const data = require("../../../../../nuclide-commons/collection");

  _collection = function () {
    return data;
  };

  return data;
}

function _uuid() {
  const data = _interopRequireDefault(require("uuid"));

  _uuid = function () {
    return data;
  };

  return data;
}

function _constants() {
  const data = require("../constants");

  _constants = function () {
    return data;
  };

  return data;
}

function _logger() {
  const data = _interopRequireDefault(require("../logger"));

  _logger = function () {
    return data;
  };

  return data;
}

function _stripAnsi() {
  const data = _interopRequireDefault(require("strip-ansi"));

  _stripAnsi = function () {
    return data;
  };

  return data;
}

var _url = _interopRequireDefault(require("url"));

var _os = _interopRequireDefault(require("os"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */

/**
The following debug service implementation was ported from VSCode's debugger implementation
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
const CONSOLE_VIEW_URI = 'atom://nuclide/console';
const CUSTOM_DEBUG_EVENT = 'CUSTOM_DEBUG_EVENT';
const CHANGE_DEBUG_MODE = 'CHANGE_DEBUG_MODE';
const START_DEBUG_SESSION = 'START_DEBUG_SESSION';
const ACTIVE_THREAD_CHANGED = 'ACTIVE_THREAD_CHANGED';
const DEBUGGER_FOCUS_CHANGED = 'DEBUGGER_FOCUS_CHANGED';
const CHANGE_EXPRESSION_CONTEXT = 'CHANGE_EXPRESSION_CONTEXT'; // Berakpoint events may arrive sooner than breakpoint responses.

const MAX_BREAKPOINT_EVENT_DELAY_MS = 5 * 1000;

let _gkService;

class ViewModel {
  constructor() {
    this._focusedProcess = null;
    this._focusedThread = null;
    this._focusedStackFrame = null;
    this._emitter = new _atom.Emitter();
  }

  get focusedProcess() {
    return this._focusedProcess;
  }

  get focusedThread() {
    return this._focusedThread;
  }

  get focusedStackFrame() {
    return this._focusedStackFrame;
  }

  onDidChangeDebuggerFocus(callback) {
    return this._emitter.on(DEBUGGER_FOCUS_CHANGED, callback);
  }

  onDidChangeExpressionContext(callback) {
    return this._emitter.on(CHANGE_EXPRESSION_CONTEXT, callback);
  }

  _chooseFocusThread(process) {
    const threads = process.getAllThreads(); // If the current focused thread is in the focused process and is stopped,
    // leave that thread focused. Otherwise, choose the first
    // stopped thread in the focused process if there is one,
    // and the first running thread otherwise.

    if (this._focusedThread != null) {
      const id = this._focusedThread.getId();

      const currentFocusedThread = threads.filter(t => t.getId() === id && t.stopped);

      if (currentFocusedThread.length > 0) {
        return currentFocusedThread[0];
      }
    }

    const stoppedThreads = threads.filter(t => t.stopped);
    return stoppedThreads[0] || threads[0];
  }

  _chooseFocusStackFrame(thread) {
    if (thread == null) {
      return null;
    } // If the current focused stack frame is in the current focused thread's
    // frames, leave it alone. Otherwise return the top stack frame if the
    // thread is stopped, and null if it is running.


    const currentFocusedFrame = thread.getCachedCallStack().find(f => f === this._focusedStackFrame);
    return thread.stopped ? currentFocusedFrame || thread.getCallStackTopFrame() : null;
  }

  _setFocus(process, thread, stackFrame, explicit) {
    let newProcess = process; // If we have a focused frame, we must have a focused thread.

    if (!(stackFrame == null || thread === stackFrame.thread)) {
      throw new Error("Invariant violation: \"stackFrame == null || thread === stackFrame.thread\"");
    } // If we have a focused thread, we must have a focused process.


    if (!(thread == null || process === thread.process)) {
      throw new Error("Invariant violation: \"thread == null || process === thread.process\"");
    }

    if (newProcess == null) {
      if (!(thread == null && stackFrame == null)) {
        throw new Error("Invariant violation: \"thread == null && stackFrame == null\"");
      }

      newProcess = this._focusedProcess;
    }

    const focusChanged = this._focusedProcess !== newProcess || this._focusedThread !== thread || this._focusedStackFrame !== stackFrame || explicit;
    this._focusedProcess = newProcess;
    this._focusedThread = thread;
    this._focusedStackFrame = stackFrame;

    if (focusChanged) {
      this._emitter.emit(DEBUGGER_FOCUS_CHANGED, {
        explicit
      });
    } else {
      // The focused stack frame didn't change, but something about the
      // context did, so interested listeners should re-evaluate expressions.
      this._emitter.emit(CHANGE_EXPRESSION_CONTEXT, {
        explicit
      });
    }
  }

  setFocusedProcess(process, explicit) {
    if (process == null) {
      this._focusedProcess = null;

      this._setFocus(null, null, null, explicit);
    } else {
      const newFocusThread = this._chooseFocusThread(process);

      const newFocusFrame = this._chooseFocusStackFrame(newFocusThread);

      this._setFocus(process, newFocusThread, newFocusFrame, explicit);
    }
  }

  setFocusedThread(thread, explicit) {
    if (thread == null) {
      this._setFocus(null, null, null, explicit);
    } else {
      this._setFocus(thread.process, thread, this._chooseFocusStackFrame(thread), explicit);
    }
  }

  setFocusedStackFrame(stackFrame, explicit) {
    if (stackFrame == null) {
      this._setFocus(null, null, null, explicit);
    } else {
      this._setFocus(stackFrame.thread.process, stackFrame.thread, stackFrame, explicit);
    }
  }

}

function getDebuggerName(adapterType) {
  return `${(0, _utils().capitalize)(adapterType)} Debugger`;
}

class DebugService {
  constructor(state) {
    this._runInTerminal = async args => {
      const terminalService = (0, _AtomServiceContainer().getTerminalService)();

      if (terminalService == null) {
        throw new Error('Unable to launch in terminal since the service is not available');
      }

      const process = this._getCurrentProcess();

      if (process == null) {
        throw new Error("There's no debug process to create a terminal for!");
      }

      const {
        adapterType,
        targetUri
      } = process.configuration;
      const key = `targetUri=${targetUri}&command=${args.args[0]}`; // Ensure any previous instances of this same target are closed before
      // opening a new terminal tab. We don't want them to pile up if the
      // user keeps running the same app over and over.

      terminalService.close(key);
      const title = args.title != null ? args.title : getDebuggerName(adapterType);

      const hostname = _nuclideUri().default.getHostnameOpt(targetUri);

      const cwd = hostname == null ? args.cwd : _nuclideUri().default.createRemoteUri(hostname, args.cwd);
      const info = {
        key,
        title,
        cwd,
        command: {
          file: args.args[0],
          args: args.args.slice(1)
        },
        environmentVariables: args.env != null ? (0, _collection().mapFromObject)(args.env) : undefined,
        preservedCommands: ['debugger:continue-debugging', 'debugger:stop-debugging', 'debugger:restart-debugging', 'debugger:step-over', 'debugger:step-into', 'debugger:step-out'],
        remainOnCleanExit: true,
        icon: 'nuclicon-debugger',
        defaultLocation: 'bottom'
      };
      const terminal = await terminalService.open(info);
      terminal.setProcessExitCallback(() => {
        // This callback is invoked if the target process dies first, ensuring
        // we tear down the debugger.
        this.stopProcess(process);
      });

      this._sessionEndDisposables.add(() => {
        // This termination path is invoked if the debugger dies first, ensuring
        // we terminate the target process. This can happen if the user hits stop,
        // or if the debugger crashes.
        terminal.setProcessExitCallback(() => {});
        terminal.terminateProcess();
      });
    };

    this._onSessionEnd = async session => {
      (0, _analytics().track)(_constants().AnalyticsEvents.DEBUGGER_STOP);

      const removedProcesses = this._model.removeProcess(session.getId());

      if (removedProcesses.length === 0) {
        // If the process is already removed from the model, there's nothing else
        // to do. We can re-enter here if the debug session ends before the
        // debug adapter process terminates.
        return;
      } // Mark all removed processes as STOPPING.


      removedProcesses.forEach(process => {
        process.setStopPending();

        this._onDebuggerModeChanged(process, _constants().DebuggerMode.STOPPING);
      }); // Ensure all the adapters are terminated.

      await session.disconnect(false
      /* restart */
      , true
      /* force */
      );

      if (this._model.getProcesses() == null || this._model.getProcesses().length === 0) {
        this._sessionEndDisposables.dispose();

        this._consoleDisposables.dispose(); // No processes remaining, clear process focus.


        this._viewModel.setFocusedProcess(null, false);
      } else {
        if (this._viewModel.focusedProcess != null && this._viewModel.focusedProcess.getId() === session.getId()) {
          // The process that just exited was the focused process, so we need
          // to move focus to another process. If there's a process with a
          // stopped thread, choose that. Otherwise choose the last process.
          const allProcesses = this._model.getProcesses();

          const processToFocus = allProcesses.filter(p => p.getAllThreads().some(t => t.stopped))[0] || allProcesses[allProcesses.length - 1];

          this._viewModel.setFocusedProcess(processToFocus, false);
        }
      }

      removedProcesses.forEach(process => {
        this._onDebuggerModeChanged(process, _constants().DebuggerMode.STOPPED);
      });
      const createConsole = (0, _AtomServiceContainer().getConsoleService)();

      if (createConsole != null) {
        const name = 'Nuclide Debugger';
        const consoleApi = createConsole({
          id: name,
          name
        });
        removedProcesses.forEach(p => consoleApi.append({
          text: 'Process exited' + (p.configuration.processName == null ? '' : ' (' + p.configuration.processName + ')'),
          level: 'log'
        }));
      }

      if (this._timer != null) {
        this._timer.onSuccess();

        this._timer = null;
      } // set breakpoints back to unverified since the session ended.


      const data = {};

      this._model.getBreakpoints().forEach(bp => {
        data[bp.getId()] = {
          line: bp.line,
          verified: false,
          column: bp.column,
          endLine: bp.endLine == null ? undefined : bp.endLine,
          endColumn: bp.endColumn == null ? undefined : bp.endColumn
        };
      });

      this._model.updateBreakpoints(data);
    };

    this._disposables = new (_UniversalDisposable().default)();
    this._sessionEndDisposables = new (_UniversalDisposable().default)();
    this._consoleDisposables = new (_UniversalDisposable().default)();
    this._emitter = new _atom.Emitter();
    this._viewModel = new ViewModel();
    this._breakpointsToSendOnSave = new Set();
    this._model = new (_DebuggerModel().Model)(this._loadBreakpoints(state), true, this._loadFunctionBreakpoints(state), this._loadExceptionBreakpoints(state), this._loadWatchExpressions(state));

    this._disposables.add(this._model);

    this._registerListeners();
  }

  get viewModel() {
    return this._viewModel;
  }

  getDebuggerMode(process) {
    if (process == null) {
      return _constants().DebuggerMode.STOPPED;
    }

    return process.debuggerMode;
  }

  _registerListeners() {
    this._disposables.add(atom.workspace.addOpener(uri => {
      if (uri.startsWith(_constants().DEBUG_SOURCES_URI)) {
        if (this.getDebuggerMode(this._viewModel.focusedProcess) !== _constants().DebuggerMode.STOPPED) {
          return this._openSourceView(uri);
        }
      }
    }));
  }

  async _openSourceView(uri) {
    const query = (_url.default.parse(uri).path || '').split('/');
    const [, sessionId, sourceReferenceRaw] = query;
    const sourceReference = parseInt(sourceReferenceRaw, 10);

    const process = this._model.getProcesses().find(p => p.getId() === sessionId) || this._viewModel.focusedProcess;

    if (process == null) {
      throw new Error(`No debug session for source: ${sourceReference}`);
    }

    const source = process.getSource({
      path: uri,
      sourceReference
    });
    let content = '';

    try {
      const response = await process.session.source({
        sourceReference,
        source: source.raw
      });
      content = response.body.content;
    } catch (error) {
      this._sourceIsNotAvailable(uri);

      throw new Error('Debug source is not available');
    }

    const editor = atom.workspace.buildTextEditor({
      buffer: new DebugSourceTextBufffer(content, uri),
      autoHeight: false,
      readOnly: true
    }); // $FlowFixMe Debugger source views shouldn't persist between reload.

    editor.serialize = () => null;

    editor.setGrammar(atom.grammars.selectGrammar(source.name || '', content));
    const textEditorBanner = new (_TextEditorBanner().TextEditorBanner)(editor);
    textEditorBanner.render(React.createElement(_ReadOnlyNotice().default, {
      detailedMessage: "This is a debug source view that may not exist on the filesystem.",
      canEditAnyway: false,
      onDismiss: textEditorBanner.dispose.bind(textEditorBanner)
    }));

    this._sessionEndDisposables.addUntilDestroyed(editor, editor, textEditorBanner);

    return editor;
  }
  /**
   * Stops the specified process.
   */


  async stopProcess(process) {
    if (process.debuggerMode === _constants().DebuggerMode.STOPPING || process.debuggerMode === _constants().DebuggerMode.STOPPED) {
      return;
    }

    this._onSessionEnd(process.session);
  }

  async _tryToAutoFocusStackFrame(thread) {
    // The call stack has already been refreshed by the logic handling
    // the thread stop event for this thread.
    const callStack = thread.getCachedCallStack();

    if (callStack.length === 0 || this._viewModel.focusedStackFrame && this._viewModel.focusedStackFrame.thread.getId() === thread.getId() && callStack.includes(this._viewModel.focusedStackFrame)) {
      return;
    } // Focus first stack frame from top that has source location if no other stack frame is focused


    const stackFrameToFocus = callStack.find(sf => sf.source != null && sf.source.available);

    if (stackFrameToFocus == null) {
      return;
    }

    this._viewModel.setFocusedStackFrame(stackFrameToFocus, false);
  }

  _registerMarkers(process) {
    let selectedFrameMarker = null;
    let threadChangeDatatip;
    let lastFocusedThreadId;
    let lastFocusedProcess;

    const cleaupMarkers = () => {
      if (selectedFrameMarker != null) {
        selectedFrameMarker.destroy();
        selectedFrameMarker = null;
      }

      if (threadChangeDatatip != null) {
        threadChangeDatatip.dispose();
        threadChangeDatatip = null;
      }
    };

    return new (_UniversalDisposable().default)((0, _event().observableFromSubscribeFunction)(this._viewModel.onDidChangeDebuggerFocus.bind(this._viewModel)).concatMap(event => {
      cleaupMarkers();
      const {
        explicit
      } = event;
      const stackFrame = this._viewModel.focusedStackFrame;

      if (stackFrame == null || !stackFrame.source.available) {
        if (explicit && this.getDebuggerMode(this._viewModel.focusedProcess) === _constants().DebuggerMode.PAUSED) {
          atom.notifications.addWarning('No source available for the selected stack frame');
        }

        return _RxMin.Observable.empty();
      }

      return _RxMin.Observable.fromPromise(stackFrame.openInEditor()).switchMap(editor => {
        if (editor == null) {
          atom.notifications.addError('Failed to open source file for stack frame!');
          return _RxMin.Observable.empty();
        }

        return _RxMin.Observable.of({
          editor,
          explicit,
          stackFrame
        });
      });
    }).subscribe(({
      editor,
      explicit,
      stackFrame
    }) => {
      const line = stackFrame.range.start.row;
      selectedFrameMarker = editor.markBufferRange([[line, 0], [line, Infinity]], {
        invalidate: 'never'
      });
      editor.decorateMarker(selectedFrameMarker, {
        type: 'line',
        class: 'debugger-current-line-highlight'
      });
      const datatipService = (0, _AtomServiceContainer().getDatatipService)();

      if (datatipService == null) {
        return;
      }

      this._model.setExceptionBreakpoints(stackFrame.thread.process.session.capabilities.exceptionBreakpointFilters || []);

      if (lastFocusedThreadId != null && !explicit && stackFrame.thread.threadId !== lastFocusedThreadId && process === lastFocusedProcess) {
        let message = `Active thread changed from ${lastFocusedThreadId} to ${stackFrame.thread.threadId}`;
        const newFocusedProcess = stackFrame.thread.process;

        if (lastFocusedProcess != null && !explicit && newFocusedProcess !== lastFocusedProcess) {
          if (lastFocusedProcess.configuration.processName != null && newFocusedProcess.configuration.processName != null) {
            message = 'Active process changed from ' + lastFocusedProcess.configuration.processName + ' to ' + newFocusedProcess.configuration.processName + ' AND ' + message;
          } else {
            message = 'Active process changed AND ' + message;
          }
        }

        threadChangeDatatip = datatipService.createPinnedDataTip({
          component: () => React.createElement("div", {
            className: "debugger-thread-switch-alert"
          }, React.createElement(_Icon().Icon, {
            icon: "alert"
          }), message),
          range: stackFrame.range,
          pinnable: true
        }, editor);

        this._emitter.emit(ACTIVE_THREAD_CHANGED);
      }

      lastFocusedThreadId = stackFrame.thread.threadId;
      lastFocusedProcess = stackFrame.thread.process;
    }), cleaupMarkers);
  }

  _registerSessionListeners(process, session) {
    this._sessionEndDisposables = new (_UniversalDisposable().default)(session);

    this._sessionEndDisposables.add(this._registerMarkers(process));

    const sessionId = session.getId();
    const threadFetcher = (0, _promise().serializeAsyncCall)(async () => {
      const response = await session.threads();

      if (response && response.body && response.body.threads) {
        response.body.threads.forEach(thread => {
          this._model.rawUpdate({
            sessionId,
            thread
          });
        });
      }
    });
    const openFilesSaved = (0, _event().observableFromSubscribeFunction)(atom.workspace.observeTextEditors.bind(atom.workspace)).flatMap(editor => {
      return (0, _event().observableFromSubscribeFunction)(editor.onDidSave.bind(editor)).map(() => editor.getPath()).takeUntil((0, _event().observableFromSubscribeFunction)(editor.onDidDestroy.bind(editor)));
    });

    this._sessionEndDisposables.add(openFilesSaved.subscribe(async filePath => {
      if (filePath == null || !this._breakpointsToSendOnSave.has(filePath)) {
        return;
      }

      this._breakpointsToSendOnSave.delete(filePath);

      await this._sendBreakpoints(filePath, true);
    }));

    this._sessionEndDisposables.add(session.observeInitializeEvents().subscribe(async event => {
      const sendConfigurationDone = async () => {
        if (session && session.getCapabilities().supportsConfigurationDoneRequest) {
          return session.configurationDone().then(_ => {
            this._onDebuggerModeChanged(process, _constants().DebuggerMode.RUNNING);
          }).catch(e => {
            // Disconnect the debug session on configuration done error #10596
            this._onSessionEnd(session);

            session.disconnect().catch(_utils().onUnexpectedError);
            atom.notifications.addError('Failed to configure debugger. This is often because either ' + 'the process you tried to attach to has already terminated, or ' + 'you do not have permissions (the process is running as root or ' + 'another user.)', {
              detail: e.message
            });
          });
        }
      };

      try {
        await this._sendAllBreakpoints().then(sendConfigurationDone, sendConfigurationDone);
        await threadFetcher();
      } catch (error) {
        (0, _utils().onUnexpectedError)(error);
      }
    }));

    const toFocusThreads = new _RxMin.Subject();

    const observeContinuedTo = threadId => {
      return session.observeContinuedEvents().filter(continued => continued.body.allThreadsContinued || threadId != null && threadId === continued.body.threadId).take(1);
    };

    this._sessionEndDisposables.add(session.observeStopEvents().subscribe(() => {
      this._onDebuggerModeChanged(process, _constants().DebuggerMode.PAUSED);
    }), session.observeStopEvents().flatMap(event => _RxMin.Observable.fromPromise(threadFetcher()).ignoreElements().concat(_RxMin.Observable.of(event)).catch(error => {
      (0, _utils().onUnexpectedError)(error);
      return _RxMin.Observable.empty();
    }) // Proceeed processing the stopped event only if there wasn't
    // a continued event while we're fetching the threads
    .takeUntil(observeContinuedTo(event.body.threadId))).subscribe(event => {
      const {
        threadId
      } = event.body; // Updating stopped state needs to happen after fetching the threads

      this._model.rawUpdate({
        sessionId,
        stoppedDetails: event.body,
        threadId
      });

      if (threadId == null) {
        return;
      }

      const thread = process.getThread(threadId);

      if (thread != null) {
        toFocusThreads.next(thread);
      }
    }), toFocusThreads.concatMap(thread => {
      var _ref;

      const {
        focusedThread
      } = this._viewModel;
      const preserveFocusHint = ((_ref = thread) != null ? (_ref = _ref.stoppedDetails) != null ? _ref.preserveFocusHint : _ref : _ref) || false;

      if (focusedThread != null && focusedThread.stopped && focusedThread.getId() !== thread.getId() && preserveFocusHint) {
        // The debugger is already stopped elsewhere.
        return _RxMin.Observable.empty();
      }

      const thisThreadIsFocused = this._viewModel.focusedStackFrame != null && this._viewModel.focusedStackFrame.thread.getId() === thread.getId(); // Fetches the first call frame in this stack to allow the UI to
      // update the thread list. Additional frames will be fetched by the UI
      // on demand, only if they are needed.
      // If this thread is the currently focused thread, fetch the entire
      // stack because the UI will certainly need it, and we need it here to
      // try and auto-focus a frame.

      return _RxMin.Observable.fromPromise(this._model.refreshCallStack(thread, thisThreadIsFocused)).ignoreElements().concat(_RxMin.Observable.of(thread)) // Avoid focusing a continued thread.
      .takeUntil(observeContinuedTo(thread.threadId)) // Verify the thread is still stopped.
      .filter(() => thread.stopped).catch(error => {
        (0, _utils().onUnexpectedError)(error);
        return _RxMin.Observable.empty();
      });
    }).subscribe(thread => {
      this._tryToAutoFocusStackFrame(thread);

      this._scheduleNativeNotification();
    }));

    this._sessionEndDisposables.add(session.observeThreadEvents().subscribe(async event => {
      if (event.body.reason === 'started') {
        await threadFetcher();
      } else if (event.body.reason === 'exited') {
        this._model.clearThreads(session.getId(), true, event.body.threadId);
      }
    }));

    this._sessionEndDisposables.add(session.observeTerminateDebugeeEvents().subscribe(event => {
      if (event.body && event.body.restart) {
        this.restartProcess(process).catch(err => {
          atom.notifications.addError('Failed to restart debugger', {
            detail: err.stack || String(err)
          });
        });
      } else {
        this._onSessionEnd(session);

        session.disconnect().catch(_utils().onUnexpectedError);
      }
    }));

    this._sessionEndDisposables.add(session.observeContinuedEvents().subscribe(event => {
      const threadId = event.body.allThreadsContinued !== false ? undefined : event.body.threadId;

      this._model.clearThreads(session.getId(), false, threadId);

      this._viewModel.setFocusedThread(this._viewModel.focusedThread, false);

      this._onDebuggerModeChanged(process, _constants().DebuggerMode.RUNNING);
    }));

    const createConsole = (0, _AtomServiceContainer().getConsoleService)();

    if (createConsole != null) {
      const name = getDebuggerName(process.configuration.adapterType);
      const consoleApi = createConsole({
        id: name,
        name
      });

      this._sessionEndDisposables.add(consoleApi);

      const outputEvents = session.observeOutputEvents().filter(event => event.body != null && typeof event.body.output === 'string').share();
      const KNOWN_CATEGORIES = new Set(['stderr', 'console', 'telemetry', 'success']);
      const logStream = (0, _observable().splitStream)(outputEvents.filter(e => !KNOWN_CATEGORIES.has(e.body.category)).map(e => (0, _stripAnsi().default)(e.body.output)));
      const [errorStream, warningsStream, successStream] = ['stderr', 'console', 'success'].map(category => (0, _observable().splitStream)(outputEvents.filter(e => category === e.body.category).map(e => (0, _stripAnsi().default)(e.body.output))));
      const notificationStream = outputEvents.filter(e => e.body.category === 'nuclide_notification').map(e => ({
        type: (0, _nullthrows().default)(e.body.data).type,
        message: e.body.output
      }));

      this._sessionEndDisposables.add(errorStream.subscribe(line => {
        consoleApi.append({
          text: line,
          level: 'error'
        });
      }), warningsStream.subscribe(line => {
        consoleApi.append({
          text: line,
          level: 'warning'
        });
      }), successStream.subscribe(line => {
        consoleApi.append({
          text: line,
          level: 'success'
        });
      }), logStream.subscribe(line => {
        consoleApi.append({
          text: line,
          level: 'log'
        });
      }), notificationStream.subscribe(({
        type,
        message
      }) => {
        atom.notifications.add(type, message);
      }) // TODO handle non string output (e.g. files & objects)
      );
    }

    this._sessionEndDisposables.add(session.observeBreakpointEvents().flatMap(event => {
      const {
        breakpoint,
        reason
      } = event.body;

      if (reason !== _constants().BreakpointEventReasons.CHANGED && reason !== _constants().BreakpointEventReasons.REMOVED) {
        return _RxMin.Observable.of({
          reason,
          breakpoint,
          sourceBreakpoint: null,
          functionBreakpoint: null
        });
      } // Breakpoint events may arrive sooner than their responses.
      // Hence, we'll keep them cached and try re-processing on every change to the model's breakpoints
      // for a set maximum time, then discard.


      return (0, _event().observableFromSubscribeFunction)(this._model.onDidChangeBreakpoints.bind(this._model)).startWith(null).switchMap(() => {
        const sourceBreakpoint = this._model.getBreakpoints().filter(b => b.idFromAdapter === breakpoint.id).pop();

        const functionBreakpoint = this._model.getFunctionBreakpoints().filter(b => b.idFromAdapter === breakpoint.id).pop();

        if (sourceBreakpoint == null && functionBreakpoint == null) {
          return _RxMin.Observable.empty();
        } else {
          return _RxMin.Observable.of({
            reason,
            breakpoint,
            sourceBreakpoint,
            functionBreakpoint
          });
        }
      }).take(1).timeout(MAX_BREAKPOINT_EVENT_DELAY_MS).catch(error => {
        if (error instanceof _RxMin.TimeoutError) {
          _logger().default.error('Timed out breakpoint event handler', process.configuration.adapterType, reason, breakpoint);
        }

        return _RxMin.Observable.empty();
      });
    }).subscribe(({
      reason,
      breakpoint,
      sourceBreakpoint,
      functionBreakpoint
    }) => {
      if (reason === _constants().BreakpointEventReasons.NEW && breakpoint.source) {
        const source = process.getSource(breakpoint.source);

        const bps = this._model.addBreakpoints(source.uri, [{
          column: breakpoint.column || 0,
          enabled: true,
          line: breakpoint.line == null ? -1 : breakpoint.line
        }], false);

        if (bps.length === 1) {
          this._model.updateBreakpoints({
            [bps[0].getId()]: breakpoint
          });
        }
      } else if (reason === _constants().BreakpointEventReasons.REMOVED) {
        if (sourceBreakpoint != null) {
          this._model.removeBreakpoints([sourceBreakpoint]);
        }

        if (functionBreakpoint != null) {
          this._model.removeFunctionBreakpoints(functionBreakpoint.getId());
        }
      } else if (reason === _constants().BreakpointEventReasons.CHANGED) {
        if (sourceBreakpoint != null) {
          if (!sourceBreakpoint.column) {
            breakpoint.column = undefined;
          }

          this._model.updateBreakpoints({
            [sourceBreakpoint.getId()]: breakpoint
          });
        }

        if (functionBreakpoint != null) {
          this._model.updateFunctionBreakpoints({
            [functionBreakpoint.getId()]: breakpoint
          });
        }
      } else {
        _logger().default.warn('Unknown breakpoint event', reason, breakpoint);
      }
    }));

    this._sessionEndDisposables.add(session.observeAdapterExitedEvents().subscribe(event => {
      // 'Run without debugging' mode VSCode must terminate the extension host. More details: #3905
      this._onSessionEnd(session);
    }));

    this._sessionEndDisposables.add(session.observeCustomEvents().subscribe(event => {
      this._emitter.emit(CUSTOM_DEBUG_EVENT, event);
    })); // Clear in memory breakpoints.


    this._sessionEndDisposables.add(() => {
      const sourceRefBreakpoints = this._model.getBreakpoints().filter(bp => bp.uri.startsWith(_constants().DEBUG_SOURCES_URI));

      if (sourceRefBreakpoints.length > 0) {
        this._model.removeBreakpoints(sourceRefBreakpoints);
      }
    });
  }

  _scheduleNativeNotification() {
    const raiseNativeNotification = (0, _AtomServiceContainer().getNotificationService)();

    if (raiseNativeNotification != null) {
      const pendingNotification = raiseNativeNotification('Debugger', 'Paused at a breakpoint', 3000, false);

      if (pendingNotification != null) {
        this._sessionEndDisposables.add(pendingNotification);
      }
    }
  }

  onDidChangeActiveThread(callback) {
    return this._emitter.on(ACTIVE_THREAD_CHANGED, callback);
  }

  onDidStartDebugSession(callback) {
    return this._emitter.on(START_DEBUG_SESSION, callback);
  }

  onDidCustomEvent(callback) {
    return this._emitter.on(CUSTOM_DEBUG_EVENT, callback);
  }

  onDidChangeProcessMode(callback) {
    return this._emitter.on(CHANGE_DEBUG_MODE, callback);
  }

  _loadBreakpoints(state) {
    let result = [];

    if (state == null || state.sourceBreakpoints == null) {
      return result;
    }

    try {
      result = state.sourceBreakpoints.map(breakpoint => {
        return new (_DebuggerModel().Breakpoint)(breakpoint.uri, breakpoint.line, breakpoint.column, breakpoint.enabled, breakpoint.condition, breakpoint.hitCondition, breakpoint.adapterData);
      });
    } catch (e) {}

    return result;
  }

  _loadFunctionBreakpoints(state) {
    let result = [];

    if (state == null || state.functionBreakpoints == null) {
      return result;
    }

    try {
      result = state.functionBreakpoints.map(fb => {
        return new (_DebuggerModel().FunctionBreakpoint)(fb.name, fb.enabled, fb.hitCondition);
      });
    } catch (e) {}

    return result;
  }

  _loadExceptionBreakpoints(state) {
    let result = [];

    if (state == null || state.exceptionBreakpoints == null) {
      return result;
    }

    try {
      result = state.exceptionBreakpoints.map(exBreakpoint => {
        return new (_DebuggerModel().ExceptionBreakpoint)(exBreakpoint.filter, exBreakpoint.label, exBreakpoint.enabled);
      });
    } catch (e) {}

    return result;
  }

  _loadWatchExpressions(state) {
    let result = [];

    if (state == null || state.watchExpressions == null) {
      return result;
    }

    try {
      result = state.watchExpressions.map(name => new (_DebuggerModel().Expression)(name));
    } catch (e) {}

    return result;
  }

  _onDebuggerModeChanged(process, mode) {
    this._emitter.emit(CHANGE_DEBUG_MODE, {
      data: {
        process,
        mode
      }
    });
  }

  enableOrDisableBreakpoints(enable, breakpoint) {
    if (breakpoint != null) {
      this._model.setEnablement(breakpoint, enable);

      if (breakpoint instanceof _DebuggerModel().Breakpoint) {
        return this._sendBreakpoints(breakpoint.uri);
      } else if (breakpoint instanceof _DebuggerModel().FunctionBreakpoint) {
        return this._sendFunctionBreakpoints();
      } else {
        (0, _analytics().track)(_constants().AnalyticsEvents.DEBUGGER_TOGGLE_EXCEPTION_BREAKPOINT);
        return this._sendExceptionBreakpoints();
      }
    }

    this._model.enableOrDisableAllBreakpoints(enable);

    return this._sendAllBreakpoints();
  }

  addBreakpoints(uri, rawBreakpoints) {
    (0, _analytics().track)(_constants().AnalyticsEvents.DEBUGGER_BREAKPOINT_ADD);

    this._model.addBreakpoints(uri, rawBreakpoints);

    return this._sendBreakpoints(uri);
  }

  addSourceBreakpoint(uri, line) {
    (0, _analytics().track)(_constants().AnalyticsEvents.DEBUGGER_BREAKPOINT_SINGLE_ADD);

    const existing = this._model.getBreakpointAtLine(uri, line);

    if (existing == null) {
      return this.addBreakpoints(uri, [{
        line
      }]);
    }

    return Promise.resolve(undefined);
  }

  toggleSourceBreakpoint(uri, line) {
    (0, _analytics().track)(_constants().AnalyticsEvents.DEBUGGER_BREAKPOINT_TOGGLE);

    const existing = this._model.getBreakpointAtLine(uri, line);

    if (existing == null) {
      return this.addBreakpoints(uri, [{
        line
      }]);
    } else {
      return this.removeBreakpoints(existing.getId(), true);
    }
  }

  updateBreakpoints(uri, data) {
    this._model.updateBreakpoints(data);

    this._breakpointsToSendOnSave.add(uri);
  }

  async removeBreakpoints(id, skipAnalytics = false) {
    const toRemove = this._model.getBreakpoints().filter(bp => id == null || bp.getId() === id);

    const urisToClear = (0, _collection().distinct)(toRemove, bp => bp.uri).map(bp => bp.uri);

    this._model.getProcesses().forEach(process => process.removeBreakpointsByUris(urisToClear));

    this._model.removeBreakpoints(toRemove);

    await Promise.all(urisToClear.map(uri => this._sendBreakpoints(uri)));

    if (id == null) {
      (0, _analytics().track)(_constants().AnalyticsEvents.DEBUGGER_BREAKPOINT_DELETE_ALL);
    } else if (!skipAnalytics) {
      (0, _analytics().track)(_constants().AnalyticsEvents.DEBUGGER_BREAKPOINT_DELETE);
    }
  }

  setBreakpointsActivated(activated) {
    this._model.setBreakpointsActivated(activated);

    return this._sendAllBreakpoints();
  }

  addFunctionBreakpoint() {
    this._model.addFunctionBreakpoint('');
  }

  renameFunctionBreakpoint(id, newFunctionName) {
    this._model.updateFunctionBreakpoints({
      [id]: {
        name: newFunctionName
      }
    });

    return this._sendFunctionBreakpoints();
  }

  removeFunctionBreakpoints(id) {
    this._model.removeFunctionBreakpoints(id);

    return this._sendFunctionBreakpoints();
  }

  async terminateThreads(threadIds) {
    const {
      focusedProcess
    } = this.viewModel;

    if (focusedProcess == null) {
      return;
    }

    const session = focusedProcess.session;
    (0, _analytics().track)(_constants().AnalyticsEvents.DEBUGGER_TERMINATE_THREAD);

    if (Boolean(session.capabilities.supportsTerminateThreadsRequest)) {
      await session.custom('terminateThreads', {
        threadIds
      });
    }
  }

  async runToLocation(uri, line) {
    const {
      focusedThread,
      focusedProcess
    } = this.viewModel;

    if (focusedThread == null || focusedProcess == null) {
      return;
    }

    const session = focusedProcess.session;
    (0, _analytics().track)(_constants().AnalyticsEvents.DEBUGGER_STEP_RUN_TO_LOCATION);

    if (Boolean(session.capabilities.supportsContinueToLocation)) {
      await session.custom('continueToLocation', {
        source: focusedProcess.getSource({
          path: uri
        }).raw,
        line,
        threadId: focusedThread.threadId
      });
      return;
    }

    const existing = this._model.getBreakpointAtLine(uri, line);

    if (existing == null) {
      await this.addBreakpoints(uri, [{
        line
      }]);

      const runToLocationBreakpoint = this._model.getBreakpointAtLine(uri, line);

      if (!(runToLocationBreakpoint != null)) {
        throw new Error("Invariant violation: \"runToLocationBreakpoint != null\"");
      }

      const removeBreakpoint = () => {
        this.removeBreakpoints(runToLocationBreakpoint.getId(), true
        /* skip analytics */
        ).catch(error => (0, _utils().onUnexpectedError)(`Failed to clear run-to-location breakpoint! - ${String(error)}`));
        removeBreakpointDisposable.dispose();

        this._sessionEndDisposables.remove(removeBreakpointDisposable);

        this._sessionEndDisposables.remove(removeBreakpoint);
      }; // Remove if the debugger stopped at any location.


      const removeBreakpointDisposable = new (_UniversalDisposable().default)(session.observeStopEvents().take(1).subscribe(removeBreakpoint)); // Remove if the session has ended without hitting it.

      this._sessionEndDisposables.add(removeBreakpointDisposable, removeBreakpoint);
    }

    await focusedThread.continue();
  }

  addWatchExpression(name) {
    (0, _analytics().track)(_constants().AnalyticsEvents.DEBUGGER_WATCH_ADD_EXPRESSION);
    return this._model.addWatchExpression(name);
  }

  renameWatchExpression(id, newName) {
    (0, _analytics().track)(_constants().AnalyticsEvents.DEBUGGER_WATCH_UPDATE_EXPRESSION);
    return this._model.renameWatchExpression(id, newName);
  }

  removeWatchExpressions(id) {
    (0, _analytics().track)(_constants().AnalyticsEvents.DEBUGGER_WATCH_REMOVE_EXPRESSION);

    this._model.removeWatchExpressions(id);
  }

  createExpression(rawExpression) {
    return new (_DebuggerModel().Expression)(rawExpression);
  }

  async _doCreateProcess(rawConfiguration, sessionId) {
    let process;
    let session;

    const errorHandler = error => {
      if (this._timer != null) {
        this._timer.onError(error);

        this._timer = null;
      }

      (0, _analytics().track)(_constants().AnalyticsEvents.DEBUGGER_START_FAIL, {});
      const errorMessage = error instanceof Error ? error.message : error;
      atom.notifications.addError(`Failed to start debugger process: ${errorMessage}`);

      if (this._model.getProcesses() == null || this._model.getProcesses().length === 0) {
        this._consoleDisposables.dispose();
      }

      if (session != null && !session.isDisconnected()) {
        this._onSessionEnd(session);

        session.disconnect().catch(_utils().onUnexpectedError);
      }

      if (process != null) {
        this._model.removeProcess(process.getId());

        this._onDebuggerModeChanged(process, _constants().DebuggerMode.STOPPED);
      }
    };

    try {
      const adapterExecutable = await this._resolveAdapterExecutable(rawConfiguration);
      const configuration = await (0, _AtomServiceContainer().resolveDebugConfiguration)(Object.assign({}, rawConfiguration, {
        adapterExecutable
      }));
      const {
        adapterType,
        onDebugStartingCallback,
        onDebugStartedCallback
      } = configuration;
      (0, _analytics().track)(_constants().AnalyticsEvents.DEBUGGER_START, {
        serviceName: configuration.adapterType,
        clientType: 'VSP'
      });
      const sessionTeardownDisposables = new (_UniversalDisposable().default)();

      const instanceInterface = newSession => {
        return Object.freeze({
          customRequest: async (request, args) => {
            return newSession.custom(request, args);
          },
          observeCustomEvents: newSession.observeCustomEvents.bind(newSession)
        });
      };

      const createInitializeSession = async config => {
        const newSession = await this._createVsDebugSession(config, config.adapterExecutable || adapterExecutable, sessionId);
        process = this._model.addProcess(config, newSession);

        this._viewModel.setFocusedProcess(process, false);

        this._onDebuggerModeChanged(process, _constants().DebuggerMode.STARTING);

        this._emitter.emit(START_DEBUG_SESSION, config);

        this._registerSessionListeners(process, newSession);

        atom.commands.dispatch(atom.views.getView(atom.workspace), 'debugger:show');
        await newSession.initialize({
          clientID: 'atom',
          adapterID: adapterType,
          pathFormat: 'path',
          linesStartAt1: true,
          columnsStartAt1: true,
          supportsVariableType: true,
          supportsVariablePaging: false,
          supportsRunInTerminalRequest: (0, _AtomServiceContainer().getTerminalService)() != null,
          locale: 'en-us'
        });

        if (onDebugStartingCallback != null) {
          // Callbacks are passed IVspInstance which exposes only certain
          // methods to them, rather than getting the full session.
          const teardown = onDebugStartingCallback(instanceInterface(newSession));

          if (teardown != null) {
            sessionTeardownDisposables.add(teardown);
          }
        }

        this._model.setExceptionBreakpoints(newSession.getCapabilities().exceptionBreakpointFilters || []);

        return newSession;
      };

      session = await createInitializeSession(configuration);

      const setRunningState = () => {
        if (process != null) {
          process.clearProcessStartingFlag();

          this._onDebuggerModeChanged(process, _constants().DebuggerMode.RUNNING);

          this._viewModel.setFocusedProcess(process, false);
        }
      }; // We're not awaiting launch/attach to finish because some debug adapters
      // need to do custom work for launch/attach to work (e.g. mobilejs)


      this._launchOrAttachTarget(session, configuration).then(() => setRunningState()).catch(async error => {
        if (configuration.debugMode === 'attach' && configuration.adapterExecutable != null && configuration.adapterExecutable.command !== 'sudo' && ( // sudo is not supported on Windows, and currently remote projects
        // are not supported on Windows, so a remote URI must be *nix.
        _os.default.platform() !== 'win32' || _nuclideUri().default.isRemote(configuration.targetUri))) {
          configuration.adapterExecutable.args = [configuration.adapterExecutable.command, ...configuration.adapterExecutable.args];
          configuration.adapterExecutable.command = 'sudo';
          const errorMessage = error instanceof Error ? error.message : error;
          atom.notifications.addWarning(`The debugger was unable to attach to the target process: ${errorMessage}. ` + 'Attempting to re-launch the debugger as root...');
          session = await createInitializeSession(configuration);

          this._launchOrAttachTarget(session, configuration).then(() => setRunningState()).catch(errorHandler);
        } else {
          errorHandler(error);
        }
      });

      if (onDebugStartedCallback != null && session != null) {
        const teardown = onDebugStartedCallback(instanceInterface(session));

        if (teardown != null) {
          sessionTeardownDisposables.add(teardown);
        }
      }

      this._sessionEndDisposables.add(() => {
        this._model.onDidChangeProcesses(() => {
          if (!this.getModel().getProcesses().includes(process)) {
            sessionTeardownDisposables.dispose();
          }
        });
      });

      this._sessionEndDisposables.add(sessionTeardownDisposables);

      return process;
    } catch (error) {
      errorHandler(error);
      return null;
    }
  }

  async _resolveAdapterExecutable(configuration) {
    if (configuration.adapterExecutable != null) {
      return configuration.adapterExecutable;
    }

    return (0, _nuclideDebuggerCommon().getVSCodeDebuggerAdapterServiceByNuclideUri)(configuration.targetUri).getAdapterExecutableInfo(configuration.adapterType);
  }

  async _createVsDebugSession(configuration, adapterExecutable, sessionId) {
    const {
      targetUri
    } = configuration;
    const service = (0, _nuclideDebuggerCommon().getVSCodeDebuggerAdapterServiceByNuclideUri)(targetUri);
    const spawner = await service.createVsRawAdapterSpawnerService();
    const clientPreprocessors = [];
    const adapterPreprocessors = [];

    if (configuration.clientPreprocessor != null) {
      clientPreprocessors.push(configuration.clientPreprocessor);
    }

    if (configuration.adapterPreprocessor != null) {
      adapterPreprocessors.push(configuration.adapterPreprocessor);
    }

    const isRemote = _nuclideUri().default.isRemote(targetUri);

    if (isRemote) {
      clientPreprocessors.push((0, _nuclideDebuggerCommon().remoteToLocalProcessor)());
      adapterPreprocessors.push((0, _nuclideDebuggerCommon().localToRemoteProcessor)(targetUri));
    }

    return new (_nuclideDebuggerCommon().VsDebugSession)(sessionId, _logger().default, adapterExecutable, {
      adapter: configuration.adapterType,
      host: 'debugService',
      isRemote
    }, spawner, clientPreprocessors, adapterPreprocessors, this._runInTerminal);
  }

  async _launchOrAttachTarget(session, configuration) {
    if (configuration.debugMode === 'attach') {
      await session.attach(configuration.config);
    } else {
      // It's 'launch'
      await session.launch(configuration.config);
    }
  }

  _sourceIsNotAvailable(uri) {
    this._model.sourceIsNotAvailable(uri);
  }

  canRestartProcess() {
    const process = this._getCurrentProcess();

    return process != null && process.configuration.isRestartable === true;
  }

  async restartProcess(process) {
    if (process.session.capabilities.supportsRestartRequest) {
      await process.session.custom('restart', null);
    }

    await process.session.disconnect(true);
    await (0, _promise().sleep)(300);
    await this.startDebugging(process.configuration);
  }
  /**
   * Starts debugging. If the configOrName is not passed uses the selected configuration in the debug dropdown.
   * Also saves all files, manages if compounds are present in the configuration
   * and resolveds configurations via DebugConfigurationProviders.
   */


  async startDebugging(config) {
    this._timer = (0, _analytics().startTracking)('debugger-atom:startDebugging');
    const currentProcess = this._viewModel.focusedProcess;

    if (currentProcess != null) {
      // We currently support only running only one debug session at a time,
      // so stop the current debug session.
      if (_gkService != null) {
        const passesMultiGK = await _gkService.passesGK('nuclide_multitarget_debugging');

        if (!passesMultiGK && currentProcess != null) {
          this.stopProcess(currentProcess);
        }
      } else {
        this.stopProcess(currentProcess);
      }
    }

    if (_gkService != null) {
      _gkService.passesGK('nuclide_processtree_debugging').then(passesProcessTree => {
        if (passesProcessTree) {
          (0, _analytics().track)(_constants().AnalyticsEvents.DEBUGGER_TREE_OPENED);
        }
      });
    } // Open the console window if it's not already opened.
    // eslint-disable-next-line nuclide-internal/atom-apis


    atom.workspace.open(CONSOLE_VIEW_URI, {
      searchAllPanes: true
    });
    this._consoleDisposables = this._registerConsoleExecutor();
    await this._doCreateProcess(config, _uuid().default.v4());

    if (this._model.getProcesses().length > 1) {
      const debuggerTypes = [];

      this._model.getProcesses().forEach(process => {
        debuggerTypes.push(process.configuration.adapterType);
      });

      (0, _analytics().track)(_constants().AnalyticsEvents.DEBUGGER_MULTITARGET, {
        processesCount: this._model.getProcesses().length,
        debuggerTypes
      });
    }
  }

  consumeGatekeeperService(service) {
    _gkService = service;
    return new (_UniversalDisposable().default)(() => _gkService = null);
  }

  getModel() {
    return this._model;
  }

  async _sendAllBreakpoints() {
    await Promise.all((0, _collection().distinct)(this._model.getBreakpoints(), bp => bp.uri).map(bp => this._sendBreakpoints(bp.uri, false)));
    await this._sendFunctionBreakpoints(); // send exception breakpoints at the end since some debug adapters rely on the order

    await this._sendExceptionBreakpoints();
  }

  async _sendBreakpoints(uri, sourceModified = false) {
    const processes = this._model.getProcesses();

    processes.forEach(async process => {
      const session = process.session;

      if (process == null || session == null || !session.isReadyForBreakpoints()) {
        return;
      }

      const breakpointsToSend = this._model.getBreakpoints().filter(bp => this._model.areBreakpointsActivated() && bp.enabled && bp.uri === uri);

      const rawSource = process.getSource({
        path: uri,
        name: _nuclideUri().default.basename(uri)
      }).raw;

      if (breakpointsToSend.length && !rawSource.adapterData) {
        rawSource.adapterData = breakpointsToSend[0].adapterData;
      } // The UI is 0-based, while VSP is 1-based.


      const response = await session.setBreakpoints({
        source: rawSource,
        lines: breakpointsToSend.map(bp => bp.line),
        breakpoints: breakpointsToSend.map(bp => ({
          line: bp.line,
          column: bp.column,
          condition: bp.condition,
          hitCondition: bp.hitCondition
        })),
        sourceModified
      });

      if (response != null && response.body != null) {
        const data = {};

        for (let i = 0; i < breakpointsToSend.length; i++) {
          data[breakpointsToSend[i].getId()] = response.body.breakpoints[i];

          if (!breakpointsToSend[i].column) {
            // If there was no column sent ignore the breakpoint column response from the adapter
            data[breakpointsToSend[i].getId()].column = undefined;
          }
        }

        this._model.updateBreakpointsForProcess(data, process);
      }
    });
  }

  _getCurrentSession() {
    return this._viewModel.focusedProcess == null ? null : this._viewModel.focusedProcess.session;
  }

  _getCurrentProcess() {
    return this._viewModel.focusedProcess;
  }

  async _sendFunctionBreakpoints() {
    const processes = this._model.getProcesses();

    processes.forEach(async process => {
      const session = process.session;

      if (session == null || !session.isReadyForBreakpoints() || !session.getCapabilities().supportsFunctionBreakpoints) {
        return;
      }

      const breakpointsToSend = this._model.getFunctionBreakpoints().filter(fbp => fbp.enabled && this._model.areBreakpointsActivated());

      const response = await session.setFunctionBreakpoints({
        breakpoints: breakpointsToSend
      });

      if (response == null || response.body == null) {
        return;
      }

      const data = {};

      for (let i = 0; i < breakpointsToSend.length; i++) {
        data[breakpointsToSend[i].getId()] = response.body.breakpoints[i];
      }

      this._model.updateFunctionBreakpoints(data);
    });
  }

  async _sendExceptionBreakpoints() {
    const processes = this._model.getProcesses();

    processes.forEach(async process => {
      const session = process.session;

      if (session == null || !session.isReadyForBreakpoints() || this._model.getExceptionBreakpoints().length === 0) {
        return;
      }

      const enabledExceptionBps = this._model.getExceptionBreakpoints().filter(exb => exb.enabled);

      await session.setExceptionBreakpoints({
        filters: enabledExceptionBps.map(exb => exb.filter)
      });
    });
  }

  _registerConsoleExecutor() {
    const disposables = new (_UniversalDisposable().default)();
    const registerExecutor = (0, _AtomServiceContainer().getConsoleRegisterExecutor)();

    if (registerExecutor == null) {
      return disposables;
    }

    const output = new _RxMin.Subject();

    const evaluateExpression = rawExpression => {
      const expression = new (_DebuggerModel().Expression)(rawExpression);
      const {
        focusedProcess,
        focusedStackFrame
      } = this._viewModel;

      if (focusedProcess == null) {
        _logger().default.error('Cannot evaluate while there is no active debug session');

        return;
      }

      disposables.add( // We filter here because the first value in the BehaviorSubject is null no matter what, and
      // we want the console to unsubscribe the stream after the first non-null value.
      (0, _utils().expressionAsEvaluationResultStream)(expression, focusedProcess, focusedStackFrame, 'repl').skip(1) // Skip the first pending null value.
      .subscribe(result => {
        // Evaluate all watch expressions and fetch variables again since repl evaluation might have changed some.
        this._viewModel.setFocusedStackFrame(this._viewModel.focusedStackFrame, false);

        if (result == null || !expression.available) {
          const message = {
            text: expression.getValue(),
            level: 'error'
          };
          output.next(message);
        } else {
          output.next({
            data: result
          });
        }
      }));
    };

    disposables.add(registerExecutor({
      id: 'debugger',
      name: 'Debugger',
      scopeName: 'text.plain',

      send(expression) {
        evaluateExpression(expression);
      },

      output,
      getProperties: _utils().fetchChildrenForLazyComponent
    }));
    return disposables;
  }

  dispose() {
    this._disposables.dispose();

    this._consoleDisposables.dispose();

    this._sessionEndDisposables.dispose();
  }

}

exports.default = DebugService;

class DebugSourceTextBufffer extends _atom.TextBuffer {
  constructor(contents, uri) {
    super(contents);
    this._uri = uri;
  }

  getUri() {
    return this._uri;
  }

  getPath() {
    return this._uri;
  }

  isModified() {
    return false;
  }

}