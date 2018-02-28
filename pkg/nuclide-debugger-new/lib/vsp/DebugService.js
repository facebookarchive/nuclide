'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _vscodeDebugprotocol;

function _load_vscodeDebugprotocol() {
  return _vscodeDebugprotocol = _interopRequireWildcard(require('vscode-debugprotocol'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _observable;

function _load_observable() {
  return _observable = require('nuclide-commons/observable');
}

var _event;

function _load_event() {
  return _event = require('nuclide-commons/event');
}

var _promise;

function _load_promise() {
  return _promise = require('nuclide-commons/promise');
}

var _nuclideDebuggerCommon;

function _load_nuclideDebuggerCommon() {
  return _nuclideDebuggerCommon = require('nuclide-debugger-common');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _capitalize;

function _load_capitalize() {
  return _capitalize = _interopRequireDefault(require('lodash/capitalize'));
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../../nuclide-analytics');
}

var _nullthrows;

function _load_nullthrows() {
  return _nullthrows = _interopRequireDefault(require('nullthrows'));
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../../nuclide-remote-connection');
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
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _atom = require('atom');

var _collection;

function _load_collection() {
  return _collection = require('nuclide-commons/collection');
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

var _processors;

function _load_processors() {
  return _processors = require('./processors');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// This must match URI defined in ../../nuclide-console/lib/ui/ConsoleContainer
const CONSOLE_VIEW_URI = 'atom://nuclide/console'; /**
                                                    * Copyright (c) 2015-present, Facebook, Inc.
                                                    * All rights reserved.
                                                    *
                                                    * This source code is licensed under the license found in the LICENSE file in
                                                    * the root directory of this source tree.
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
    return this._focusedStackFrame != null ? this._focusedStackFrame.thread : this._focusedProcess != null ? this._focusedProcess.getAllThreads().pop() : null;
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
    }
  }
}

class DebugService {

  constructor(state) {
    this._onSessionEnd = () => {
      const session = this._getCurrentSession();
      if (session == null) {
        return;
      }
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)((_constants || _load_constants()).AnalyticsEvents.DEBUGGER_STOP);
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
    // this._disposables.add(this.fileService.onFileChanges(e => this.onFileChanges(e)));
    let selectedFrameMarker = null;
    this._disposables.add(this._viewModel.onDidFocusStackFrame((() => {
      var _ref = (0, _asyncToGenerator.default)(function* (event) {
        const { stackFrame, explicit } = event;
        if (selectedFrameMarker != null) {
          selectedFrameMarker.destroy();
          selectedFrameMarker = null;
        }
        if (stackFrame == null || !stackFrame.source.available) {
          if (explicit) {
            atom.notifications.addWarning('No source available for the selected stack frame');
          }
          return;
        } else {
          const editor = yield stackFrame.openInEditor();
          if (editor == null) {
            atom.notifications.addError('Failed to open source file for stack frame!');
            return;
          }
          const line = stackFrame.range.start.row;
          selectedFrameMarker = editor.markBufferRange([[line, 0], [line, Infinity]], {
            invalidate: 'never'
          });
          editor.decorateMarker(selectedFrameMarker, {
            type: 'line',
            class: 'nuclide-current-line-highlight'
          });
        }
      });

      return function (_x) {
        return _ref.apply(this, arguments);
      };
    })()), () => {
      if (selectedFrameMarker != null) {
        selectedFrameMarker.destroy();
        selectedFrameMarker = null;
      }
    });
  }

  /**
   * Stops the process. If the process does not exist then stops all processes.
   */
  stopProcess() {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (_this._debuggerMode === (_constants || _load_constants()).DebuggerMode.STOPPING || _this._debuggerMode === (_constants || _load_constants()).DebuggerMode.STOPPED) {
        return;
      }
      _this._onSessionEnd();
    })();
  }

  _tryToAutoFocusStackFrame(thread) {
    const callStack = thread.getCallStack();
    if (!callStack.length || this._viewModel.focusedStackFrame && this._viewModel.focusedStackFrame.thread.getId() === thread.getId()) {
      return;
    }

    // Focus first stack frame from top that has source location if no other stack frame is focused
    const stackFrameToFocus = callStack.find(sf => sf.source != null && sf.source.available);
    if (stackFrameToFocus == null) {
      return;
    }

    this.focusStackFrame(stackFrameToFocus, null, null);
  }

  _registerSessionListeners(process, session) {
    var _this2 = this;

    this._sessionEndDisposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(session);

    const openFilesSaved = (0, (_event || _load_event()).observableFromSubscribeFunction)(atom.workspace.observeTextEditors.bind(atom.workspace)).flatMap(editor => {
      return (0, (_event || _load_event()).observableFromSubscribeFunction)(editor.onDidSave.bind(editor)).map(() => editor.getPath()).takeUntil((0, (_event || _load_event()).observableFromSubscribeFunction)(editor.onDidDestroy.bind(editor)));
    });

    this._sessionEndDisposables.add(openFilesSaved.subscribe((() => {
      var _ref2 = (0, _asyncToGenerator.default)(function* (filePath) {
        if (filePath == null || !_this2._breakpointsToSendOnSave.has(filePath)) {
          return;
        }
        _this2._breakpointsToSendOnSave.delete(filePath);
        yield _this2._sendBreakpoints(filePath, true);
      });

      return function (_x2) {
        return _ref2.apply(this, arguments);
      };
    })()));

    this._sessionEndDisposables.add(session.observeInitializeEvents().subscribe((() => {
      var _ref3 = (0, _asyncToGenerator.default)(function* (event) {
        const sendConfigurationDone = (() => {
          var _ref4 = (0, _asyncToGenerator.default)(function* () {
            if (session && session.getCapabilities().supportsConfigurationDoneRequest) {
              return session.configurationDone().catch(function (e) {
                // Disconnect the debug session on configuration done error #10596
                session.disconnect().catch((_utils || _load_utils()).onUnexpectedError).then(_this2._onSessionEnd);
                atom.notifications.addError('Failed to configure debugger', {
                  detail: e.message
                });
              });
            }
          });

          return function sendConfigurationDone() {
            return _ref4.apply(this, arguments);
          };
        })();

        try {
          yield _this2._sendAllBreakpoints().then(sendConfigurationDone, sendConfigurationDone);
          yield _this2._fetchThreads(session);
        } catch (error) {
          (0, (_utils || _load_utils()).onUnexpectedError)(error);
        }
      });

      return function (_x3) {
        return _ref3.apply(this, arguments);
      };
    })()));

    this._sessionEndDisposables.add(session.observeStopEvents().subscribe((() => {
      var _ref5 = (0, _asyncToGenerator.default)(function* (event) {
        _this2._updateModeAndEmit((_constants || _load_constants()).DebuggerMode.PAUSED);
        _this2._scheduleNativeNotification();
        try {
          yield _this2._fetchThreads(session, event.body);
          const thread = event.body.threadId != null ? process.getThread(event.body.threadId) : null;
          if (thread != null) {
            // UX: That'll fetch the top stack frame first (to allow the UI to focus on it),
            // then the rest of the call stack.
            yield _this2._model.fetchCallStack(thread);
            _this2._tryToAutoFocusStackFrame(thread);
          }
        } catch (error) {
          (0, (_utils || _load_utils()).onUnexpectedError)(error);
        }
      });

      return function (_x4) {
        return _ref5.apply(this, arguments);
      };
    })()));

    this._sessionEndDisposables.add(session.observeThreadEvents().subscribe((() => {
      var _ref6 = (0, _asyncToGenerator.default)(function* (event) {
        if (event.body.reason === 'started') {
          yield _this2._fetchThreads(session);
        } else if (event.body.reason === 'exited') {
          _this2._model.clearThreads(session.getId(), true, event.body.threadId);
        }
      });

      return function (_x5) {
        return _ref6.apply(this, arguments);
      };
    })()));

    this._sessionEndDisposables.add(session.observeTerminateDebugeeEvents().subscribe(event => {
      if (session && session.getId() === event.sessionId) {
        if (event.body && event.body.restart && process) {
          this.restartProcess().catch(err => {
            atom.notifications.addError('Failed to restart debugger', {
              detail: err.stack || String(err)
            });
          });
        } else {
          session.disconnect().catch((_utils || _load_utils()).onUnexpectedError).then(this._onSessionEnd);
        }
      }
    }));

    this._sessionEndDisposables.add(session.observeContinuedEvents().subscribe(event => {
      const threadId = event.body.allThreadsContinued !== false ? undefined : event.body.threadId;
      this._model.clearThreads(session.getId(), false, threadId);
      this.focusStackFrame(null, this._viewModel.focusedThread, null);
      this._updateModeAndEmit((_constants || _load_constants()).DebuggerMode.RUNNING);
    }));

    const createConsole = (0, (_AtomServiceContainer || _load_AtomServiceContainer()).getConsoleService)();
    if (createConsole != null) {
      const name = `${(0, (_capitalize || _load_capitalize()).default)(process.configuration.adapterType)} Debugger`;
      const consoleApi = createConsole({
        id: name,
        name
      });
      this._sessionEndDisposables.add(consoleApi);
      const outputEvents = session.observeOutputEvents().filter(event => event.body != null && typeof event.body.output === 'string').share();
      const [errorStream, warningsStream, logStream] = ['stderr', 'console', 'stdout'].map(category => (0, (_observable || _load_observable()).splitStream)(outputEvents.filter(e => category === e.body.category).map(e => (0, (_stripAnsi || _load_stripAnsi()).default)(e.body.output))));
      const notificationStream = outputEvents.filter(e => e.body.category === 'nuclide_notification').map(e => ({
        type: (0, (_nullthrows || _load_nullthrows()).default)(e.body.data).type,
        message: e.body.output
      }));
      this._sessionEndDisposables.add(errorStream.subscribe(line => {
        consoleApi.append({ text: line, level: 'error' });
      }), warningsStream.subscribe(line => {
        consoleApi.append({ text: line, level: 'warning' });
      }), logStream.subscribe(line => {
        consoleApi.append({ text: line, level: 'log' });
      }), notificationStream.subscribe(({ type, message }) => {
        atom.notifications.add(type, message);
      })
      // TODO handle non string & unkown categories
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
      if (session && session.getId() === event.body.sessionId) {
        this._onSessionEnd();
      }
    }));

    this._sessionEndDisposables.add(session.observeCustomEvents().subscribe(event => {
      this._emitter.emit(CUSTOM_DEBUG_EVENT, event);
    }));
  }

  _scheduleNativeNotification() {
    const raiseNativeNotification = (0, (_AtomServiceContainer || _load_AtomServiceContainer()).getNotificationService)();
    if (raiseNativeNotification != null) {
      const pendingNotification = raiseNativeNotification('Nuclide Debugger', 'Paused at a breakpoint', 3000, false);
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

  _fetchThreads(session, stoppedDetails) {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const response = yield session.threads();
      if (response && response.body && response.body.threads) {
        response.body.threads.forEach(function (thread) {
          _this3._model.rawUpdate({
            sessionId: session.getId(),
            threadId: thread.id,
            thread,
            stoppedDetails: stoppedDetails != null && thread.id === stoppedDetails.threadId ? stoppedDetails : null
          });
        });
      }
    })();
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
        const processes = this._model.getProcesses();
        focusProcess = processes.length ? processes[0] : null;
      }
    }
    let focusThread = thread;
    let focusStackFrame = stackFrame;

    if (focusThread == null) {
      if (stackFrame != null) {
        focusThread = stackFrame.thread;
      } else {
        const threads = focusProcess != null ? focusProcess.getAllThreads() : [];
        focusThread = threads[0];
      }
    }

    if (stackFrame == null) {
      if (thread != null) {
        const callStack = thread.getCallStack();
        focusStackFrame = callStack[0];
      }
    }

    this._viewModel.setFocus(focusStackFrame, focusThread, focusProcess, explicit);
    this._updateModeAndEmit(this._computeDebugMode());
  }

  _computeDebugMode() {
    const focusedThread = this._viewModel.focusedThread;
    if (focusedThread && focusedThread.stopped) {
      return (_constants || _load_constants()).DebuggerMode.PAUSED;
    } else if (this._getCurrentProcess() == null) {
      return (_constants || _load_constants()).DebuggerMode.STOPPED;
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
        (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)((_constants || _load_constants()).AnalyticsEvents.DEBUGGER_TOGGLE_EXCEPTION_BREAKPOINT);
        return this._sendExceptionBreakpoints();
      }
    }

    this._model.enableOrDisableAllBreakpoints(enable);
    return this._sendAllBreakpoints();
  }

  addBreakpoints(uri, rawBreakpoints) {
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)((_constants || _load_constants()).AnalyticsEvents.DEBUGGER_BREAKPOINT_ADD);
    this._model.addBreakpoints(uri, rawBreakpoints);
    return this._sendBreakpoints(uri);
  }

  toggleSourceBreakpoint(uri, line) {
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)((_constants || _load_constants()).AnalyticsEvents.DEBUGGER_BREAKPOINT_TOGGLE);
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

  removeBreakpoints(id, skipAnalytics = false) {
    var _this4 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const toRemove = _this4._model.getBreakpoints().filter(function (bp) {
        return id == null || bp.getId() === id;
      });
      const urisToClear = (0, (_collection || _load_collection()).distinct)(toRemove, function (bp) {
        return bp.uri.toString();
      }).map(function (bp) {
        return bp.uri;
      });

      _this4._model.removeBreakpoints(toRemove);

      if (id == null) {
        (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)((_constants || _load_constants()).AnalyticsEvents.DEBUGGER_BREAKPOINT_DELETE_ALL);
      } else if (!skipAnalytics) {
        (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)((_constants || _load_constants()).AnalyticsEvents.DEBUGGER_BREAKPOINT_DELETE);
      }

      yield Promise.all(urisToClear.map(function (uri) {
        return _this4._sendBreakpoints(uri);
      }));
    })();
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

  addWatchExpression(name) {
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)((_constants || _load_constants()).AnalyticsEvents.DEBUGGER_WATCH_ADD_EXPRESSION);
    return this._model.addWatchExpression(name);
  }

  renameWatchExpression(id, newName) {
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)((_constants || _load_constants()).AnalyticsEvents.DEBUGGER_WATCH_UPDATE_EXPRESSION);
    return this._model.renameWatchExpression(id, newName);
  }

  removeWatchExpressions(id) {
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)((_constants || _load_constants()).AnalyticsEvents.DEBUGGER_WATCH_REMOVE_EXPRESSION);
    this._model.removeWatchExpressions(id);
  }

  createExpression(rawExpression) {
    return new (_DebuggerModel || _load_DebuggerModel()).Expression(rawExpression);
  }

  _doCreateProcess(configuration, sessionId) {
    var _this5 = this;

    return (0, _asyncToGenerator.default)(function* () {
      let process;
      const session = _this5._createVsDebugSession(configuration, sessionId);
      try {
        process = _this5._model.addProcess(configuration, session);
        _this5.focusStackFrame(null, null, process);
        _this5._registerSessionListeners(process, session);
        yield session.initialize({
          clientID: 'atom',
          adapterID: configuration.adapterType,
          pathFormat: 'path',
          linesStartAt1: true,
          columnsStartAt1: true,
          supportsVariableType: true,
          supportsVariablePaging: false,
          supportsRunInTerminalRequest: false,
          locale: 'en_US'
        });
        _this5._model.setExceptionBreakpoints(session.getCapabilities().exceptionBreakpointFilters || []);
        if (configuration.debugMode === 'attach') {
          yield session.attach(configuration.config);
        } else {
          // It's 'launch'
          yield session.launch(configuration.config);
        }
        if (session.isDisconnected()) {
          return;
        }
        _this5._updateModeAndEmit((_constants || _load_constants()).DebuggerMode.RUNNING);
        return process;
      } catch (error) {
        if (_this5._timer != null) {
          _this5._timer.onError(error);
          _this5._timer = null;
        }
        (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)((_constants || _load_constants()).AnalyticsEvents.DEBUGGER_START_FAIL, {});
        const errorMessage = error instanceof Error ? error.message : error;
        atom.notifications.addError(`Failed to start debugger process: ${errorMessage}`);
        _this5._consoleDisposables.dispose();
        _this5._updateModeAndEmit((_constants || _load_constants()).DebuggerMode.STOPPED);
        if (!session.isDisconnected()) {
          session.disconnect().catch((_utils || _load_utils()).onUnexpectedError).then(_this5._onSessionEnd);
        }
        if (process != null) {
          _this5._model.removeProcess(process.getId());
        }
        return null;
      }
    })();
  }

  _createVsDebugSession(configuration, sessionId) {
    const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getVSCodeDebuggerAdapterServiceByNuclideUri)(configuration.targetUri);
    const spawner = new service.VsRawAdapterSpawnerService();
    const clientPreprocessors = [];
    const adapterPreprocessors = [];
    if (configuration.clientPreprocessor != null) {
      clientPreprocessors.push(configuration.clientPreprocessor);
    }
    if (configuration.adapterPreprocessor != null) {
      adapterPreprocessors.push(configuration.adapterPreprocessor);
    }
    if ((_nuclideUri || _load_nuclideUri()).default.isRemote(configuration.targetUri)) {
      clientPreprocessors.push((0, (_processors || _load_processors()).remoteToLocalProcessor)());
      adapterPreprocessors.push((0, (_processors || _load_processors()).localToRemoteProcessor)(configuration.targetUri));
    }
    return new (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VsDebugSession(sessionId, (_logger || _load_logger()).default, configuration.adapterExecutable, spawner, clientPreprocessors, adapterPreprocessors);
  }

  sourceIsNotAvailable(uri) {
    this._model.sourceIsNotAvailable(uri);
  }

  restartProcess() {
    var _this6 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const process = _this6._getCurrentProcess();
      if (process == null) {
        return;
      }
      if (process.session.capabilities.supportsRestartRequest) {
        yield process.session.custom('restart', null);
      }
      yield process.session.disconnect(true);
      yield (0, (_promise || _load_promise()).sleep)(300);
      yield _this6.startDebugging(process.configuration);
    })();
  }

  /**
   * Starts debugging. If the configOrName is not passed uses the selected configuration in the debug dropdown.
   * Also saves all files, manages if compounds are present in the configuration
   * and resolveds configurations via DebugConfigurationProviders.
   */
  startDebugging(config) {
    var _this7 = this;

    return (0, _asyncToGenerator.default)(function* () {
      _this7._timer = (0, (_nuclideAnalytics || _load_nuclideAnalytics()).startTracking)('nuclide-debugger-atom:startDebugging');
      _this7._onSessionEnd();

      _this7._updateModeAndEmit((_constants || _load_constants()).DebuggerMode.STARTING);
      // Open the console window if it's not already opened.
      // eslint-disable-next-line rulesdir/atom-apis
      atom.workspace.open(CONSOLE_VIEW_URI, { searchAllPanes: true });
      _this7._consoleDisposables = _this7._registerConsoleExecutor();
      atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:show');
      yield _this7._doCreateProcess(config, (_uuid || _load_uuid()).default.v4());
    })();
  }

  getModel() {
    return this._model;
  }

  _sendAllBreakpoints() {
    var _this8 = this;

    return (0, _asyncToGenerator.default)(function* () {
      yield Promise.all((0, (_collection || _load_collection()).distinct)(_this8._model.getBreakpoints(), function (bp) {
        return bp.uri.toString();
      }).map(function (bp) {
        return _this8._sendBreakpoints(bp.uri, false);
      }));
      yield _this8._sendFunctionBreakpoints();
      // send exception breakpoints at the end since some debug adapters rely on the order
      yield _this8._sendExceptionBreakpoints();
    })();
  }

  _sendBreakpoints(modelUri, sourceModified = false) {
    var _this9 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const process = _this9._getCurrentProcess();
      const session = _this9._getCurrentSession();
      if (process == null || session == null || !session.isReadyForBreakpoints()) {
        return;
      }

      const breakpointsToSend = _this9._model.getBreakpoints().filter(function (bp) {
        return _this9._model.areBreakpointsActivated() && bp.enabled && bp.uri.toString() === modelUri;
      });

      const source = process.sources.get(modelUri);
      let rawSource;
      if (source != null) {
        rawSource = source.raw;
      } else {
        // TODO const data = Source.getEncodedDebugData(modelUri);
        rawSource = {
          name: (_nuclideUri || _load_nuclideUri()).default.basename(modelUri),
          path: modelUri,
          sourceReference: undefined
        };
      }

      if (breakpointsToSend.length && !rawSource.adapterData) {
        rawSource.adapterData = breakpointsToSend[0].adapterData;
      }

      // The UI is 0-based, while VSP is 1-based.
      const response = yield session.setBreakpoints({
        source: rawSource,
        lines: breakpointsToSend.map(function (bp) {
          return bp.line;
        }),
        breakpoints: breakpointsToSend.map(function (bp) {
          return {
            line: bp.line,
            column: bp.column,
            condition: bp.condition,
            hitCondition: bp.hitCondition
          };
        }),
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

      _this9._model.updateBreakpoints(data);
    })();
  }

  _getCurrentSession() {
    return this._viewModel.focusedProcess == null ? null : this._viewModel.focusedProcess.session;
  }

  _getCurrentProcess() {
    return this._viewModel.focusedProcess;
  }

  _sendFunctionBreakpoints() {
    var _this10 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const session = _this10._getCurrentSession();
      if (session == null || !session.isReadyForBreakpoints() || !session.getCapabilities().supportsFunctionBreakpoints) {
        return;
      }

      const breakpointsToSend = _this10._model.getFunctionBreakpoints().filter(function (fbp) {
        return fbp.enabled && _this10._model.areBreakpointsActivated();
      });
      const response = yield session.setFunctionBreakpoints({
        breakpoints: breakpointsToSend
      });
      if (response == null || response.body == null) {
        return;
      }

      const data = {};
      for (let i = 0; i < breakpointsToSend.length; i++) {
        data[breakpointsToSend[i].getId()] = response.body.breakpoints[i];
      }

      _this10._model.updateFunctionBreakpoints(data);
    })();
  }

  _sendExceptionBreakpoints() {
    var _this11 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const session = _this11._getCurrentSession();
      if (session == null || !session.isReadyForBreakpoints() || _this11._model.getExceptionBreakpoints().length === 0) {
        return;
      }

      const enabledExceptionBps = _this11._model.getExceptionBreakpoints().filter(function (exb) {
        return exb.enabled;
      });
      yield session.setExceptionBreakpoints({
        filters: enabledExceptionBps.map(function (exb) {
          return exb.filter;
        })
      });
    })();
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
        this.focusStackFrame(this._viewModel.focusedStackFrame, this._viewModel.focusedThread, null);

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