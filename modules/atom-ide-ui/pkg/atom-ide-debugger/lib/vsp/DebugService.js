'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _vscodeDebugprotocol;

function _load_vscodeDebugprotocol() {
  return _vscodeDebugprotocol = _interopRequireWildcard(require('vscode-debugprotocol'));
}

var _react = _interopRequireWildcard(require('react'));

var _Icon;

function _load_Icon() {
  return _Icon = require('../../../../../nuclide-commons-ui/Icon');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../../../nuclide-commons/nuclideUri'));
}

var _observable;

function _load_observable() {
  return _observable = require('../../../../../nuclide-commons/observable');
}

var _event;

function _load_event() {
  return _event = require('../../../../../nuclide-commons/event');
}

var _promise;

function _load_promise() {
  return _promise = require('../../../../../nuclide-commons/promise');
}

var _nuclideDebuggerCommon;

function _load_nuclideDebuggerCommon() {
  return _nuclideDebuggerCommon = require('../../../../../nuclide-debugger-common');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _TextEditorBanner;

function _load_TextEditorBanner() {
  return _TextEditorBanner = require('../../../../../nuclide-commons-ui/TextEditorBanner');
}

var _ReadOnlyNotice;

function _load_ReadOnlyNotice() {
  return _ReadOnlyNotice = _interopRequireDefault(require('../../../../../nuclide-commons-ui/ReadOnlyNotice'));
}

var _analytics;

function _load_analytics() {
  return _analytics = require('../../../../../nuclide-commons/analytics');
}

var _nullthrows;

function _load_nullthrows() {
  return _nullthrows = _interopRequireDefault(require('nullthrows'));
}

var _AtomServiceContainer;

function _load_AtomServiceContainer() {
  return _AtomServiceContainer = require('../AtomServiceContainer');
}

var _utils;

function _load_utils() {
  return _utils = require('../utils');
}

var _DebuggerModel;

function _load_DebuggerModel() {
  return _DebuggerModel = require('./DebuggerModel');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../../../nuclide-commons/UniversalDisposable'));
}

var _atom = require('atom');

var _collection;

function _load_collection() {
  return _collection = require('../../../../../nuclide-commons/collection');
}

var _uuid;

function _load_uuid() {
  return _uuid = _interopRequireDefault(require('uuid'));
}

var _constants;

function _load_constants() {
  return _constants = require('../constants');
}

var _logger;

function _load_logger() {
  return _logger = _interopRequireDefault(require('../logger'));
}

var _stripAnsi;

function _load_stripAnsi() {
  return _stripAnsi = _interopRequireDefault(require('strip-ansi'));
}

var _url = _interopRequireDefault(require('url'));

var _idx;

function _load_idx() {
  return _idx = _interopRequireDefault(require('idx'));
}

var _os = _interopRequireDefault(require('os'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

const CONSOLE_VIEW_URI = 'atom://nuclide/console'; /**
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

const CUSTOM_DEBUG_EVENT = 'CUSTOM_DEBUG_EVENT';
const CHANGE_DEBUG_MODE = 'CHANGE_DEBUG_MODE';

const CHANGE_FOCUSED_PROCESS = 'CHANGE_FOCUSED_PROCESS';
const CHANGE_FOCUSED_STACKFRAME = 'CHANGE_FOCUSED_STACKFRAME';
const CHANGE_EXPRESSION_CONTEXT = 'CHANGE_EXPRESSION_CONTEXT';

// Berakpoint events may arrive sooner than breakpoint responses.
const MAX_BREAKPOINT_EVENT_DELAY_MS = 5 * 1000;

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
    return this._focusedStackFrame != null ? this._focusedStackFrame.thread : this._focusedThread;
  }

  get focusedStackFrame() {
    return this._focusedStackFrame;
  }

  onDidFocusProcess(callback) {
    return this._emitter.on(CHANGE_FOCUSED_PROCESS, callback);
  }

  onDidFocusStackFrame(callback) {
    return this._emitter.on(CHANGE_FOCUSED_STACKFRAME, callback);
  }

  onDidChangeExpressionContext(callback) {
    return this._emitter.on(CHANGE_EXPRESSION_CONTEXT, callback);
  }

  isMultiProcessView() {
    return false;
  }

  setFocus(stackFrame, thread, process, explicit) {
    const shouldEmit = this._focusedProcess !== process || this._focusedThread !== thread || this._focusedStackFrame !== stackFrame || explicit;
    if (this._focusedProcess !== process) {
      this._focusedProcess = process;
      this._emitter.emit(CHANGE_FOCUSED_PROCESS, process);
    }
    this._focusedThread = thread;
    this._focusedStackFrame = stackFrame;

    if (shouldEmit) {
      this._emitter.emit(CHANGE_FOCUSED_STACKFRAME, { stackFrame, explicit });
    } else {
      // The focused stack frame didn't change, but something about the
      // context did, so interested listeners should re-evaluate expressions.
      this._emitter.emit(CHANGE_EXPRESSION_CONTEXT, { stackFrame, explicit });
    }
  }
}

function getDebuggerName(adapterType) {
  return `${(0, (_utils || _load_utils()).capitalize)(adapterType)} Debugger`;
}

class DebugService {

  constructor(state) {
    this._runInTerminal = async args => {
      const terminalService = (0, (_AtomServiceContainer || _load_AtomServiceContainer()).getTerminalService)();
      if (terminalService == null) {
        throw new Error('Unable to launch in terminal since the service is not available');
      }
      const process = this._getCurrentProcess();
      if (process == null) {
        throw new Error("There's no debug process to create a terminal for!");
      }
      const { adapterType, targetUri } = process.configuration;
      const key = `targetUri=${targetUri}&command=${args.args[0]}`;

      // Ensure any previous instances of this same target are closed before
      // opening a new terminal tab. We don't want them to pile up if the
      // user keeps running the same app over and over.
      terminalService.close(key);

      const title = args.title != null ? args.title : getDebuggerName(adapterType);
      const hostname = (_nuclideUri || _load_nuclideUri()).default.getHostnameOpt(targetUri);
      const cwd = hostname == null ? args.cwd : (_nuclideUri || _load_nuclideUri()).default.createRemoteUri(hostname, args.cwd);

      const info = {
        key,
        title,
        cwd,
        command: {
          file: args.args[0],
          args: args.args.slice(1)
        },
        environmentVariables: args.env != null ? (0, (_collection || _load_collection()).mapFromObject)(args.env) : undefined,
        preservedCommands: ['debugger:continue-debugging', 'debugger:stop-debugging', 'debugger:restart-debugging', 'debugger:step-over', 'debugger:step-into', 'debugger:step-out'],
        remainOnCleanExit: true,
        icon: 'nuclicon-debugger',
        defaultLocation: 'bottom'
      };
      const terminal = await terminalService.open(info);
      terminal.setProcessExitCallback(() => {
        // This callback is invoked if the target process dies first, ensuring
        // we tear down the debugger.
        this.stopProcess();
      });

      this._sessionEndDisposables.add(() => {
        // This termination path is invoked if the debugger dies first, ensuring
        // we terminate the target process. This can happen if the user hits stop,
        // or if the debugger crashes.
        terminal.setProcessExitCallback(() => {});
        terminal.terminateProcess();
      });
    };

    this._onSessionEnd = () => {
      const session = this._getCurrentSession();
      if (session == null) {
        return;
      }
      (0, (_analytics || _load_analytics()).track)((_constants || _load_constants()).AnalyticsEvents.DEBUGGER_STOP);
      this._model.removeProcess(session.getId());
      this._sessionEndDisposables.dispose();
      this._consoleDisposables.dispose();
      if (this._timer != null) {
        this._timer.onSuccess();
        this._timer = null;
      }

      this.focusStackFrame(null, null, null);
      this._updateModeAndEmit((_constants || _load_constants()).DebuggerMode.STOPPED);

      // set breakpoints back to unverified since the session ended.
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

    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._sessionEndDisposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._consoleDisposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._emitter = new _atom.Emitter();
    this._debuggerMode = (_constants || _load_constants()).DebuggerMode.STOPPED;
    this._viewModel = new ViewModel();
    this._breakpointsToSendOnSave = new Set();

    this._model = new (_DebuggerModel || _load_DebuggerModel()).Model(this._loadBreakpoints(state), true, this._loadFunctionBreakpoints(state), this._loadExceptionBreakpoints(state), this._loadWatchExpressions(state));
    this._disposables.add(this._model);
    this._registerListeners();
  }

  get viewModel() {
    return this._viewModel;
  }

  getDebuggerMode() {
    return this._debuggerMode;
  }

  _registerListeners() {
    this._disposables.add(atom.workspace.addOpener(uri => {
      if (uri.startsWith((_constants || _load_constants()).DEBUG_SOURCES_URI)) {
        if (this._debuggerMode !== (_constants || _load_constants()).DebuggerMode.STOPPED) {
          return this._openSourceView(uri);
        } else {
          throw new Error('Cannot open debug source views - no active debug session');
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
    });

    // $FlowFixMe Debugger source views shouldn't persist between reload.
    editor.serialize = () => null;
    editor.setGrammar(atom.grammars.selectGrammar(source.name || '', content));
    const textEditorBanner = new (_TextEditorBanner || _load_TextEditorBanner()).TextEditorBanner(editor);
    textEditorBanner.render(_react.createElement((_ReadOnlyNotice || _load_ReadOnlyNotice()).default, {
      detailedMessage: 'This is a debug source view that may not exist on the filesystem.',
      canEditAnyway: false,
      onDismiss: textEditorBanner.dispose.bind(textEditorBanner)
    }));

    const disposable = new (_UniversalDisposable || _load_UniversalDisposable()).default(textEditorBanner, editor.onDidDestroy(() => disposable.dispose()), () => editor.destroy());

    this._sessionEndDisposables.add(disposable);

    return editor;
  }

  /**
   * Stops the process. If the process does not exist then stops all processes.
   */
  async stopProcess() {
    if (this._debuggerMode === (_constants || _load_constants()).DebuggerMode.STOPPING || this._debuggerMode === (_constants || _load_constants()).DebuggerMode.STOPPED) {
      return;
    }
    this._onSessionEnd();
  }

  _tryToAutoFocusStackFrame(thread) {
    const callStack = thread.getCallStack();
    if (callStack.length === 0 || this._viewModel.focusedStackFrame && this._viewModel.focusedStackFrame.thread.getId() === thread.getId() && callStack.includes(this._viewModel.focusedStackFrame)) {
      return;
    }

    // Focus first stack frame from top that has source location if no other stack frame is focused
    const stackFrameToFocus = callStack.find(sf => sf.source != null && sf.source.available);
    if (stackFrameToFocus == null) {
      return;
    }

    this.focusStackFrame(stackFrameToFocus, null, null);
  }

  _registerMarkers() {
    let selectedFrameMarker = null;
    let threadChangeDatatip;
    let lastFocusedThreadId;

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

    return new (_UniversalDisposable || _load_UniversalDisposable()).default((0, (_event || _load_event()).observableFromSubscribeFunction)(this._viewModel.onDidFocusStackFrame.bind(this._viewModel)).concatMap(event => {
      cleaupMarkers();

      const { stackFrame, explicit } = event;

      if (stackFrame == null || !stackFrame.source.available) {
        if (explicit) {
          atom.notifications.addWarning('No source available for the selected stack frame');
        }
        return _rxjsBundlesRxMinJs.Observable.empty();
      }
      return _rxjsBundlesRxMinJs.Observable.fromPromise(stackFrame.openInEditor()).switchMap(editor => {
        if (editor == null) {
          atom.notifications.addError('Failed to open source file for stack frame!');
          return _rxjsBundlesRxMinJs.Observable.empty();
        }
        return _rxjsBundlesRxMinJs.Observable.of({ editor, explicit, stackFrame });
      });
    }).subscribe(({ editor, explicit, stackFrame }) => {
      const line = stackFrame.range.start.row;
      selectedFrameMarker = editor.markBufferRange([[line, 0], [line, Infinity]], {
        invalidate: 'never'
      });
      editor.decorateMarker(selectedFrameMarker, {
        type: 'line',
        class: 'debugger-current-line-highlight'
      });

      const datatipService = (0, (_AtomServiceContainer || _load_AtomServiceContainer()).getDatatipService)();
      if (datatipService == null) {
        return;
      }

      if (lastFocusedThreadId != null && !explicit && stackFrame.thread.threadId !== lastFocusedThreadId) {
        const message = `Active thread changed from ${lastFocusedThreadId} to ${stackFrame.thread.threadId}`;
        threadChangeDatatip = datatipService.createPinnedDataTip({
          component: () => _react.createElement(
            'div',
            { className: 'debugger-thread-switch-alert' },
            _react.createElement((_Icon || _load_Icon()).Icon, { icon: 'alert' }),
            message
          ),
          range: stackFrame.range,
          pinnable: true
        }, editor);
      }
      lastFocusedThreadId = stackFrame.thread.threadId;
    }), cleaupMarkers);
  }

  _registerSessionListeners(process, session) {
    this._sessionEndDisposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(session);
    this._sessionEndDisposables.add(this._registerMarkers());

    const sessionId = session.getId();

    const threadFetcher = (0, (_promise || _load_promise()).serializeAsyncCall)(async () => {
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

    const openFilesSaved = (0, (_event || _load_event()).observableFromSubscribeFunction)(atom.workspace.observeTextEditors.bind(atom.workspace)).flatMap(editor => {
      return (0, (_event || _load_event()).observableFromSubscribeFunction)(editor.onDidSave.bind(editor)).map(() => editor.getPath()).takeUntil((0, (_event || _load_event()).observableFromSubscribeFunction)(editor.onDidDestroy.bind(editor)));
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
            this._updateModeAndEmit((_constants || _load_constants()).DebuggerMode.RUNNING);
          }).catch(e => {
            // Disconnect the debug session on configuration done error #10596
            this._onSessionEnd();
            session.disconnect().catch((_utils || _load_utils()).onUnexpectedError);
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
        (0, (_utils || _load_utils()).onUnexpectedError)(error);
      }
    }));

    const toFocusThreads = new _rxjsBundlesRxMinJs.Subject();

    const observeContinuedTo = threadId => {
      return session.observeContinuedEvents().filter(continued => continued.body.allThreadsContinued || threadId != null && threadId === continued.body.threadId).take(1);
    };

    this._sessionEndDisposables.add(session.observeStopEvents().subscribe(() => {
      this._updateModeAndEmit((_constants || _load_constants()).DebuggerMode.PAUSED);
    }), session.observeStopEvents().flatMap(event => _rxjsBundlesRxMinJs.Observable.fromPromise(threadFetcher()).ignoreElements().concat(_rxjsBundlesRxMinJs.Observable.of(event)).catch(error => {
      (0, (_utils || _load_utils()).onUnexpectedError)(error);
      return _rxjsBundlesRxMinJs.Observable.empty();
    })
    // Proceeed processing the stopped event only if there wasn't
    // a continued event while we're fetching the threads
    .takeUntil(observeContinuedTo(event.body.threadId))).subscribe(event => {
      const { threadId } = event.body;
      // Updating stopped state needs to happen after fetching the threads
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
      var _ref, _ref2;

      const { focusedThread } = this._viewModel;
      const preserveFocusHint = ((_ref = thread) != null ? (_ref2 = _ref.stoppedDetails) != null ? _ref2.preserveFocusHint : _ref2 : _ref) || false;

      if (focusedThread != null && focusedThread.stopped && focusedThread.getId() !== thread.getId() && preserveFocusHint) {
        // The debugger is already stopped elsewhere.
        return _rxjsBundlesRxMinJs.Observable.empty();
      }

      // UX: That'll fetch the top stack frame first (to allow the UI to focus on it),
      // then the rest of the call stack.
      return _rxjsBundlesRxMinJs.Observable.fromPromise(this._model.fetchCallStack(thread)).ignoreElements().concat(_rxjsBundlesRxMinJs.Observable.of(thread))
      // Avoid focusing a continued thread.
      .takeUntil(observeContinuedTo(thread.threadId))
      // Verify the thread is still stopped.
      .filter(() => thread.stopped).catch(error => {
        (0, (_utils || _load_utils()).onUnexpectedError)(error);
        return _rxjsBundlesRxMinJs.Observable.empty();
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
        this.restartProcess().catch(err => {
          atom.notifications.addError('Failed to restart debugger', {
            detail: err.stack || String(err)
          });
        });
      } else {
        this._onSessionEnd();
        session.disconnect().catch((_utils || _load_utils()).onUnexpectedError);
      }
    }));

    this._sessionEndDisposables.add(session.observeContinuedEvents().subscribe(event => {
      const threadId = event.body.allThreadsContinued !== false ? undefined : event.body.threadId;
      this._model.clearThreads(session.getId(), false, threadId);
      this.focusStackFrame(null, this._viewModel.focusedThread, null);
      this._updateModeAndEmit(this._computeDebugMode());
    }));

    const createConsole = (0, (_AtomServiceContainer || _load_AtomServiceContainer()).getConsoleService)();
    if (createConsole != null) {
      const name = getDebuggerName(process.configuration.adapterType);
      const consoleApi = createConsole({
        id: name,
        name
      });
      this._sessionEndDisposables.add(consoleApi);
      const outputEvents = session.observeOutputEvents().filter(event => event.body != null && typeof event.body.output === 'string').share();
      const KNOWN_CATEGORIES = new Set(['stderr', 'console', 'telemetry', 'success']);
      const logStream = (0, (_observable || _load_observable()).splitStream)(outputEvents.filter(e => !KNOWN_CATEGORIES.has(e.body.category)).map(e => (0, (_stripAnsi || _load_stripAnsi()).default)(e.body.output)));
      const [errorStream, warningsStream, successStream] = ['stderr', 'console', 'success'].map(category => (0, (_observable || _load_observable()).splitStream)(outputEvents.filter(e => category === e.body.category).map(e => (0, (_stripAnsi || _load_stripAnsi()).default)(e.body.output))));
      const notificationStream = outputEvents.filter(e => e.body.category === 'nuclide_notification').map(e => ({
        type: (0, (_nullthrows || _load_nullthrows()).default)(e.body.data).type,
        message: e.body.output
      }));
      this._sessionEndDisposables.add(errorStream.subscribe(line => {
        consoleApi.append({ text: line, level: 'error' });
      }), warningsStream.subscribe(line => {
        consoleApi.append({ text: line, level: 'warning' });
      }), successStream.subscribe(line => {
        consoleApi.append({ text: line, level: 'success' });
      }), logStream.subscribe(line => {
        consoleApi.append({ text: line, level: 'log' });
      }), notificationStream.subscribe(({ type, message }) => {
        atom.notifications.add(type, message);
      })
      // TODO handle non string output (e.g. files & objects)
      );
    }

    this._sessionEndDisposables.add(session.observeBreakpointEvents().flatMap(event => {
      const { breakpoint, reason } = event.body;
      if (reason !== (_constants || _load_constants()).BreakpointEventReasons.CHANGED && reason !== (_constants || _load_constants()).BreakpointEventReasons.REMOVED) {
        return _rxjsBundlesRxMinJs.Observable.of({
          reason,
          breakpoint,
          sourceBreakpoint: null,
          functionBreakpoint: null
        });
      }

      // Breakpoint events may arrive sooner than their responses.
      // Hence, we'll keep them cached and try re-processing on every change to the model's breakpoints
      // for a set maximum time, then discard.
      return (0, (_event || _load_event()).observableFromSubscribeFunction)(this._model.onDidChangeBreakpoints.bind(this._model)).startWith(null).switchMap(() => {
        const sourceBreakpoint = this._model.getBreakpoints().filter(b => b.idFromAdapter === breakpoint.id).pop();
        const functionBreakpoint = this._model.getFunctionBreakpoints().filter(b => b.idFromAdapter === breakpoint.id).pop();
        if (sourceBreakpoint == null && functionBreakpoint == null) {
          return _rxjsBundlesRxMinJs.Observable.empty();
        } else {
          return _rxjsBundlesRxMinJs.Observable.of({
            reason,
            breakpoint,
            sourceBreakpoint,
            functionBreakpoint
          });
        }
      }).take(1).timeout(MAX_BREAKPOINT_EVENT_DELAY_MS).catch(error => {
        if (error instanceof _rxjsBundlesRxMinJs.TimeoutError) {
          (_logger || _load_logger()).default.error('Timed out breakpoint event handler', process.configuration.adapterType, reason, breakpoint);
        }
        return _rxjsBundlesRxMinJs.Observable.empty();
      });
    }).subscribe(({ reason, breakpoint, sourceBreakpoint, functionBreakpoint }) => {
      if (reason === (_constants || _load_constants()).BreakpointEventReasons.NEW && breakpoint.source) {
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
      } else if (reason === (_constants || _load_constants()).BreakpointEventReasons.REMOVED) {
        if (sourceBreakpoint != null) {
          this._model.removeBreakpoints([sourceBreakpoint]);
        }
        if (functionBreakpoint != null) {
          this._model.removeFunctionBreakpoints(functionBreakpoint.getId());
        }
      } else if (reason === (_constants || _load_constants()).BreakpointEventReasons.CHANGED) {
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
        (_logger || _load_logger()).default.warn('Unknown breakpoint event', reason, breakpoint);
      }
    }));

    this._sessionEndDisposables.add(session.observeAdapterExitedEvents().subscribe(event => {
      // 'Run without debugging' mode VSCode must terminate the extension host. More details: #3905
      this._onSessionEnd();
    }));

    this._sessionEndDisposables.add(session.observeCustomEvents().subscribe(event => {
      this._emitter.emit(CUSTOM_DEBUG_EVENT, event);
    }));

    // Clear in memory breakpoints.
    this._sessionEndDisposables.add(() => {
      const sourceRefBreakpoints = this._model.getBreakpoints().filter(bp => bp.uri.startsWith((_constants || _load_constants()).DEBUG_SOURCES_URI));
      if (sourceRefBreakpoints.length > 0) {
        this._model.removeBreakpoints(sourceRefBreakpoints);
      }
    });
  }

  _scheduleNativeNotification() {
    const raiseNativeNotification = (0, (_AtomServiceContainer || _load_AtomServiceContainer()).getNotificationService)();
    if (raiseNativeNotification != null) {
      const pendingNotification = raiseNativeNotification('Debugger', 'Paused at a breakpoint', 3000, false);
      if (pendingNotification != null) {
        this._sessionEndDisposables.add(pendingNotification);
      }
    }
  }

  onDidCustomEvent(callback) {
    return this._emitter.on(CUSTOM_DEBUG_EVENT, callback);
  }

  onDidChangeMode(callback) {
    return this._emitter.on(CHANGE_DEBUG_MODE, callback);
  }

  _loadBreakpoints(state) {
    let result = [];
    if (state == null || state.sourceBreakpoints == null) {
      return result;
    }
    try {
      result = state.sourceBreakpoints.map(breakpoint => {
        return new (_DebuggerModel || _load_DebuggerModel()).Breakpoint(breakpoint.uri, breakpoint.line, breakpoint.column, breakpoint.enabled, breakpoint.condition, breakpoint.hitCondition, breakpoint.adapterData);
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
        return new (_DebuggerModel || _load_DebuggerModel()).FunctionBreakpoint(fb.name, fb.enabled, fb.hitCondition);
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
        return new (_DebuggerModel || _load_DebuggerModel()).ExceptionBreakpoint(exBreakpoint.filter, exBreakpoint.label, exBreakpoint.enabled);
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
      result = state.watchExpressions.map(name => new (_DebuggerModel || _load_DebuggerModel()).Expression(name));
    } catch (e) {}

    return result;
  }

  _updateModeAndEmit(debugMode) {
    this._debuggerMode = debugMode;
    this._emitter.emit(CHANGE_DEBUG_MODE, debugMode);
  }

  focusStackFrame(stackFrame, thread, process, explicit = false) {
    let focusProcess = process;
    if (focusProcess == null) {
      if (stackFrame != null) {
        focusProcess = stackFrame.thread.process;
      } else if (thread != null) {
        focusProcess = thread.process;
      } else {
        focusProcess = this._model.getProcesses()[0];
      }
    }
    let focusThread = thread;
    let focusStackFrame = stackFrame;

    if (focusThread == null && stackFrame != null) {
      focusThread = stackFrame.thread;
    } else if (focusThread != null && focusProcess != null) {
      focusThread = focusProcess.getThread(focusThread.threadId);
    }

    if (stackFrame == null && thread != null) {
      focusStackFrame = thread.getCallStack()[0];
    }

    this._viewModel.setFocus(focusStackFrame, focusThread, focusProcess, explicit);
    this._updateModeAndEmit(this._computeDebugMode());
  }

  _computeDebugMode() {
    const { focusedThread, focusedStackFrame } = this._viewModel;
    if (focusedStackFrame != null || focusedThread != null && focusedThread.stopped) {
      return (_constants || _load_constants()).DebuggerMode.PAUSED;
    } else if (this._getCurrentProcess() == null) {
      return (_constants || _load_constants()).DebuggerMode.STOPPED;
    } else if (this._debuggerMode === (_constants || _load_constants()).DebuggerMode.STARTING) {
      return (_constants || _load_constants()).DebuggerMode.STARTING;
    } else {
      return (_constants || _load_constants()).DebuggerMode.RUNNING;
    }
  }

  enableOrDisableBreakpoints(enable, breakpoint) {
    if (breakpoint != null) {
      this._model.setEnablement(breakpoint, enable);
      if (breakpoint instanceof (_DebuggerModel || _load_DebuggerModel()).Breakpoint) {
        return this._sendBreakpoints(breakpoint.uri);
      } else if (breakpoint instanceof (_DebuggerModel || _load_DebuggerModel()).FunctionBreakpoint) {
        return this._sendFunctionBreakpoints();
      } else {
        (0, (_analytics || _load_analytics()).track)((_constants || _load_constants()).AnalyticsEvents.DEBUGGER_TOGGLE_EXCEPTION_BREAKPOINT);
        return this._sendExceptionBreakpoints();
      }
    }

    this._model.enableOrDisableAllBreakpoints(enable);
    return this._sendAllBreakpoints();
  }

  addBreakpoints(uri, rawBreakpoints) {
    (0, (_analytics || _load_analytics()).track)((_constants || _load_constants()).AnalyticsEvents.DEBUGGER_BREAKPOINT_ADD);
    this._model.addBreakpoints(uri, rawBreakpoints);
    return this._sendBreakpoints(uri);
  }

  toggleSourceBreakpoint(uri, line) {
    (0, (_analytics || _load_analytics()).track)((_constants || _load_constants()).AnalyticsEvents.DEBUGGER_BREAKPOINT_TOGGLE);
    const existing = this._model.getBreakpointAtLine(uri, line);
    if (existing == null) {
      return this.addBreakpoints(uri, [{ line }]);
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
    const urisToClear = (0, (_collection || _load_collection()).distinct)(toRemove, bp => bp.uri).map(bp => bp.uri);

    this._model.removeBreakpoints(toRemove);

    if (id == null) {
      (0, (_analytics || _load_analytics()).track)((_constants || _load_constants()).AnalyticsEvents.DEBUGGER_BREAKPOINT_DELETE_ALL);
    } else if (!skipAnalytics) {
      (0, (_analytics || _load_analytics()).track)((_constants || _load_constants()).AnalyticsEvents.DEBUGGER_BREAKPOINT_DELETE);
    }

    await Promise.all(urisToClear.map(uri => this._sendBreakpoints(uri)));
  }

  setBreakpointsActivated(activated) {
    this._model.setBreakpointsActivated(activated);
    return this._sendAllBreakpoints();
  }

  addFunctionBreakpoint() {
    this._model.addFunctionBreakpoint('');
  }

  renameFunctionBreakpoint(id, newFunctionName) {
    this._model.updateFunctionBreakpoints({ [id]: { name: newFunctionName } });
    return this._sendFunctionBreakpoints();
  }

  removeFunctionBreakpoints(id) {
    this._model.removeFunctionBreakpoints(id);
    return this._sendFunctionBreakpoints();
  }

  async terminateThreads(threadIds) {
    const { focusedProcess } = this.viewModel;
    if (focusedProcess == null) {
      return;
    }

    const session = focusedProcess.session;
    (0, (_analytics || _load_analytics()).track)((_constants || _load_constants()).AnalyticsEvents.DEBUGGER_TERMINATE_THREAD);
    if (Boolean(session.capabilities.supportsTerminateThreadsRequest)) {
      await session.custom('terminateThreads', {
        threadIds
      });
    }
  }

  async runToLocation(uri, line) {
    const { focusedThread, focusedProcess } = this.viewModel;
    if (focusedThread == null || focusedProcess == null) {
      return;
    }

    const session = focusedProcess.session;

    (0, (_analytics || _load_analytics()).track)((_constants || _load_constants()).AnalyticsEvents.DEBUGGER_STEP_RUN_TO_LOCATION);
    if (Boolean(session.capabilities.supportsContinueToLocation)) {
      await session.custom('continueToLocation', {
        source: focusedProcess.getSource({ path: uri }).raw,
        line,
        threadId: focusedThread.threadId
      });
      return;
    }
    const existing = this._model.getBreakpointAtLine(uri, line);
    if (existing == null) {
      await this.addBreakpoints(uri, [{ line }]);
      const runToLocationBreakpoint = this._model.getBreakpointAtLine(uri, line);

      if (!(runToLocationBreakpoint != null)) {
        throw new Error('Invariant violation: "runToLocationBreakpoint != null"');
      }

      const removeBreakpoint = () => {
        this.removeBreakpoints(runToLocationBreakpoint.getId(), true /* skip analytics */
        ).catch(error => (0, (_utils || _load_utils()).onUnexpectedError)(`Failed to clear run-to-location breakpoint! - ${String(error)}`));
        removeBreakpointDisposable.dispose();
        this._sessionEndDisposables.remove(removeBreakpointDisposable);
        this._sessionEndDisposables.remove(removeBreakpoint);
      };

      // Remove if the debugger stopped at any location.
      const removeBreakpointDisposable = new (_UniversalDisposable || _load_UniversalDisposable()).default(session.observeStopEvents().take(1).subscribe(removeBreakpoint));
      // Remove if the session has ended without hitting it.
      this._sessionEndDisposables.add(removeBreakpointDisposable, removeBreakpoint);
    }
    await focusedThread.continue();
  }

  addWatchExpression(name) {
    (0, (_analytics || _load_analytics()).track)((_constants || _load_constants()).AnalyticsEvents.DEBUGGER_WATCH_ADD_EXPRESSION);
    return this._model.addWatchExpression(name);
  }

  renameWatchExpression(id, newName) {
    (0, (_analytics || _load_analytics()).track)((_constants || _load_constants()).AnalyticsEvents.DEBUGGER_WATCH_UPDATE_EXPRESSION);
    return this._model.renameWatchExpression(id, newName);
  }

  removeWatchExpressions(id) {
    (0, (_analytics || _load_analytics()).track)((_constants || _load_constants()).AnalyticsEvents.DEBUGGER_WATCH_REMOVE_EXPRESSION);
    this._model.removeWatchExpressions(id);
  }

  createExpression(rawExpression) {
    return new (_DebuggerModel || _load_DebuggerModel()).Expression(rawExpression);
  }

  async _doCreateProcess(rawConfiguration, sessionId) {
    let process;
    let session;
    const errorHandler = error => {
      if (this._timer != null) {
        this._timer.onError(error);
        this._timer = null;
      }
      (0, (_analytics || _load_analytics()).track)((_constants || _load_constants()).AnalyticsEvents.DEBUGGER_START_FAIL, {});
      const errorMessage = error instanceof Error ? error.message : error;
      atom.notifications.addError(`Failed to start debugger process: ${errorMessage}`);
      this._consoleDisposables.dispose();
      this._updateModeAndEmit((_constants || _load_constants()).DebuggerMode.STOPPED);
      if (session != null && !session.isDisconnected()) {
        this._onSessionEnd();
        session.disconnect().catch((_utils || _load_utils()).onUnexpectedError);
      }
      if (process != null) {
        this._model.removeProcess(process.getId());
      }
    };

    try {
      const adapterExecutable = await this._resolveAdapterExecutable(rawConfiguration);
      const configuration = await (0, (_AtomServiceContainer || _load_AtomServiceContainer()).resolveDebugConfiguration)(Object.assign({}, rawConfiguration, {
        adapterExecutable
      }));
      const {
        adapterType,
        onInitializeCallback,
        customDisposable
      } = configuration;

      (0, (_analytics || _load_analytics()).track)((_constants || _load_constants()).AnalyticsEvents.DEBUGGER_START, {
        serviceName: configuration.adapterType,
        clientType: 'VSP'
      });

      const createInitializeSession = async config => {
        const newSession = await this._createVsDebugSession(config, config.adapterExecutable || adapterExecutable, sessionId);

        process = this._model.addProcess(config, newSession);
        this.focusStackFrame(null, null, process);
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
          supportsRunInTerminalRequest: (0, (_AtomServiceContainer || _load_AtomServiceContainer()).getTerminalService)() != null,
          locale: 'en-us'
        });

        if (onInitializeCallback != null) {
          await onInitializeCallback(newSession);
        }

        this._model.setExceptionBreakpoints(newSession.getCapabilities().exceptionBreakpointFilters || []);
        return newSession;
      };

      session = await createInitializeSession(configuration);

      // We're not awaiting launch/attach to finish because some debug adapters
      // need to do custom work for launch/attach to work (e.g. mobilejs)
      this._launchOrAttachTarget(session, configuration).catch(async error => {
        if (configuration.debugMode === 'attach' && configuration.adapterExecutable != null && configuration.adapterExecutable.command !== 'sudo' && (
        // sudo is not supported on Windows, and currently remote projects
        // are not supported on Windows, so a remote URI must be *nix.
        _os.default.platform() !== 'win32' || (_nuclideUri || _load_nuclideUri()).default.isRemote(configuration.targetUri))) {
          configuration.adapterExecutable.args = [configuration.adapterExecutable.command, ...configuration.adapterExecutable.args];
          configuration.adapterExecutable.command = 'sudo';

          const errorMessage = error instanceof Error ? error.message : error;
          atom.notifications.addWarning(`The debugger was unable to attach to the target process: ${errorMessage}. ` + 'Attempting to re-launch the debugger as root...');

          session = await createInitializeSession(configuration);
          this._launchOrAttachTarget(session, configuration).catch(errorHandler);
        } else {
          errorHandler(error);
        }
      });

      // make sure to add the configuration.customDisposable to dispose on
      //   session end
      if (customDisposable != null) {
        customDisposable.add(this.viewModel.onDidFocusProcess(() => {
          if (!this.getModel().getProcesses().includes(process)) {
            customDisposable.dispose();
          }
        }));
      }

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
    return (0, (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).getVSCodeDebuggerAdapterServiceByNuclideUri)(configuration.targetUri).getAdapterExecutableInfo(configuration.adapterType);
  }

  async _createVsDebugSession(configuration, adapterExecutable, sessionId) {
    const { targetUri } = configuration;
    const service = (0, (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).getVSCodeDebuggerAdapterServiceByNuclideUri)(targetUri);
    const spawner = await service.createVsRawAdapterSpawnerService();

    const clientPreprocessors = [];
    const adapterPreprocessors = [];
    if (configuration.clientPreprocessor != null) {
      clientPreprocessors.push(configuration.clientPreprocessor);
    }
    if (configuration.adapterPreprocessor != null) {
      adapterPreprocessors.push(configuration.adapterPreprocessor);
    }
    const isRemote = (_nuclideUri || _load_nuclideUri()).default.isRemote(targetUri);
    if (isRemote) {
      clientPreprocessors.push((0, (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).remoteToLocalProcessor)());
      adapterPreprocessors.push((0, (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).localToRemoteProcessor)(targetUri));
    }
    return new (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VsDebugSession(sessionId, (_logger || _load_logger()).default, adapterExecutable, { adapter: configuration.adapterType, host: 'debugService', isRemote }, spawner, clientPreprocessors, adapterPreprocessors, this._runInTerminal);
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

  async restartProcess() {
    const process = this._getCurrentProcess();
    if (process == null) {
      return;
    }
    if (process.session.capabilities.supportsRestartRequest) {
      await process.session.custom('restart', null);
    }
    await process.session.disconnect(true);
    await (0, (_promise || _load_promise()).sleep)(300);
    await this.startDebugging(process.configuration);
  }

  /**
   * Starts debugging. If the configOrName is not passed uses the selected configuration in the debug dropdown.
   * Also saves all files, manages if compounds are present in the configuration
   * and resolveds configurations via DebugConfigurationProviders.
   */
  async startDebugging(config) {
    this._timer = (0, (_analytics || _load_analytics()).startTracking)('debugger-atom:startDebugging');
    if (this._viewModel.focusedProcess != null) {
      // We currently support only running only one debug session at a time,
      // so stop the current debug session.
      this.stopProcess();
    }

    this._updateModeAndEmit((_constants || _load_constants()).DebuggerMode.STARTING);
    // Open the console window if it's not already opened.
    // eslint-disable-next-line nuclide-internal/atom-apis
    atom.workspace.open(CONSOLE_VIEW_URI, { searchAllPanes: true });
    this._consoleDisposables = this._registerConsoleExecutor();
    await this._doCreateProcess(config, (_uuid || _load_uuid()).default.v4());
  }

  getModel() {
    return this._model;
  }

  async _sendAllBreakpoints() {
    await Promise.all((0, (_collection || _load_collection()).distinct)(this._model.getBreakpoints(), bp => bp.uri).map(bp => this._sendBreakpoints(bp.uri, false)));
    await this._sendFunctionBreakpoints();
    // send exception breakpoints at the end since some debug adapters rely on the order
    await this._sendExceptionBreakpoints();
  }

  async _sendBreakpoints(uri, sourceModified = false) {
    const process = this._getCurrentProcess();
    const session = this._getCurrentSession();
    if (process == null || session == null || !session.isReadyForBreakpoints()) {
      return;
    }

    const breakpointsToSend = this._model.getBreakpoints().filter(bp => this._model.areBreakpointsActivated() && bp.enabled && bp.uri === uri);

    const rawSource = process.getSource({
      path: uri,
      name: (_nuclideUri || _load_nuclideUri()).default.basename(uri)
    }).raw;

    if (breakpointsToSend.length && !rawSource.adapterData) {
      rawSource.adapterData = breakpointsToSend[0].adapterData;
    }

    // The UI is 0-based, while VSP is 1-based.
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
    if (response == null || response.body == null) {
      return;
    }

    const data = {};
    for (let i = 0; i < breakpointsToSend.length; i++) {
      data[breakpointsToSend[i].getId()] = response.body.breakpoints[i];
      if (!breakpointsToSend[i].column) {
        // If there was no column sent ignore the breakpoint column response from the adapter
        data[breakpointsToSend[i].getId()].column = undefined;
      }
    }

    this._model.updateBreakpoints(data);
  }

  _getCurrentSession() {
    return this._viewModel.focusedProcess == null ? null : this._viewModel.focusedProcess.session;
  }

  _getCurrentProcess() {
    return this._viewModel.focusedProcess;
  }

  async _sendFunctionBreakpoints() {
    const session = this._getCurrentSession();
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
  }

  async _sendExceptionBreakpoints() {
    const session = this._getCurrentSession();
    if (session == null || !session.isReadyForBreakpoints() || this._model.getExceptionBreakpoints().length === 0) {
      return;
    }

    const enabledExceptionBps = this._model.getExceptionBreakpoints().filter(exb => exb.enabled);
    await session.setExceptionBreakpoints({
      filters: enabledExceptionBps.map(exb => exb.filter)
    });
  }

  _registerConsoleExecutor() {
    const disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    const registerExecutor = (0, (_AtomServiceContainer || _load_AtomServiceContainer()).getConsoleRegisterExecutor)();
    if (registerExecutor == null) {
      return disposables;
    }
    const output = new _rxjsBundlesRxMinJs.Subject();
    const evaluateExpression = rawExpression => {
      const expression = new (_DebuggerModel || _load_DebuggerModel()).Expression(rawExpression);
      const { focusedProcess, focusedStackFrame } = this._viewModel;
      if (focusedProcess == null) {
        (_logger || _load_logger()).default.error('Cannot evaluate while there is no active debug session');
        return;
      }
      disposables.add(
      // We filter here because the first value in the BehaviorSubject is null no matter what, and
      // we want the console to unsubscribe the stream after the first non-null value.
      (0, (_utils || _load_utils()).expressionAsEvaluationResultStream)(expression, focusedProcess, focusedStackFrame, 'repl').skip(1) // Skip the first pending null value.
      .subscribe(result => {
        // Evaluate all watch expressions and fetch variables again since repl evaluation might have changed some.
        this.focusStackFrame(this._viewModel.focusedStackFrame, this._viewModel.focusedThread, null, false);

        if (result == null || !expression.available) {
          const message = {
            text: expression.getValue(),
            level: 'error'
          };
          output.next(message);
        } else {
          output.next({ data: result });
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
      getProperties: (_utils || _load_utils()).fetchChildrenForLazyComponent
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