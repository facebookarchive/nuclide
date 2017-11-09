'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _vscodeDebugprotocol;

function _load_vscodeDebugprotocol() {
  return _vscodeDebugprotocol = _interopRequireWildcard(require('vscode-debugprotocol'));
}

var _BackTraceCommand;

function _load_BackTraceCommand() {
  return _BackTraceCommand = _interopRequireDefault(require('./BackTraceCommand'));
}

var _CommandDispatcher;

function _load_CommandDispatcher() {
  return _CommandDispatcher = _interopRequireDefault(require('./CommandDispatcher'));
}

var _SourceFileCache;

function _load_SourceFileCache() {
  return _SourceFileCache = _interopRequireDefault(require('./SourceFileCache'));
}

var _idx;

function _load_idx() {
  return _idx = _interopRequireDefault(require('idx'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _StepCommand;

function _load_StepCommand() {
  return _StepCommand = _interopRequireDefault(require('./StepCommand'));
}

var _NextCommand;

function _load_NextCommand() {
  return _NextCommand = _interopRequireDefault(require('./NextCommand'));
}

var _ThreadsCommand;

function _load_ThreadsCommand() {
  return _ThreadsCommand = _interopRequireDefault(require('./ThreadsCommand'));
}

var _VsDebugSession;

function _load_VsDebugSession() {
  return _VsDebugSession = _interopRequireDefault(require('../lib/VsDebugSession'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

class Debugger {

  constructor(logger, con) {
    this._threads = new Map();

    this._logger = logger;
    this._console = con;
    this._sourceFiles = new (_SourceFileCache || _load_SourceFileCache()).default(this._getSourceByReference.bind(this));
  }

  registerCommands(dispatcher) {
    dispatcher.registerCommand(new (_BackTraceCommand || _load_BackTraceCommand()).default(this._console, this));
    dispatcher.registerCommand(new (_ThreadsCommand || _load_ThreadsCommand()).default(this._console, this));
    dispatcher.registerCommand(new (_StepCommand || _load_StepCommand()).default(this));
    dispatcher.registerCommand(new (_NextCommand || _load_NextCommand()).default(this));
  }

  getThreads() {
    this._ensureDebugSession();
    return this._threads;
  }

  getActiveThread() {
    this._ensureDebugSession();
    return this._activeThread;
  }

  getStackTrace(thread, frameCount = 0) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const { body: { stackFrames } } = yield _this._ensureDebugSession().stackTrace({
        threadId: thread,
        totalFrames: frameCount
      });
      return stackFrames;
    })();
  }

  stepIn() {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const activeThread = _this2._activeThread;
      if (activeThread == null) {
        throw new Error('There is no active thread to step into.');
      }

      yield _this2._ensureDebugSession().stepIn({ threadId: activeThread });
    })();
  }

  stepOver() {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const activeThread = _this3._activeThread;
      if (activeThread == null) {
        throw new Error('There is no active thread to step through.');
      }

      yield _this3._ensureDebugSession().next({ threadId: activeThread });
    })();
  }

  getSourceLines(source, start, length) {
    var _this4 = this;

    return (0, _asyncToGenerator.default)(function* () {
      // If `source' contains a non-zero sourceReference, then the adapter
      // supports returning source data; otherwise, we use the given
      // path as a local file system path.
      let lines = [];
      const sourceReference = source.sourceReference;

      if (sourceReference != null && sourceReference !== 0) {
        lines = yield _this4._sourceFiles.getFileDataBySourceReference(sourceReference);
      } else if (source.path != null) {
        lines = yield _this4._sourceFiles.getFileDataByPath(source.path);
      }

      if (start >= lines.length) {
        return [];
      }

      const end = Math.min(start + length, lines.length);
      return lines.slice(start, end);
    })();
  }

  openSession(adapterInfo, launchArgs) {
    var _this5 = this;

    return (0, _asyncToGenerator.default)(function* () {
      _this5._debugSession = new (_VsDebugSession || _load_VsDebugSession()).default(process.pid.toString(), _this5._logger, adapterInfo);

      const session = _this5._debugSession;

      _this5._capabilities = yield session.initialize({
        adapterID: 'fbdb',
        pathFormat: 'path',
        linesStartAt1: false
      });

      session.observeOutputEvents().subscribe(function (x) {
        return _this5._console.output(x.body.output);
      });

      session.observeContinuedEvents().subscribe(_this5._onContinued.bind(_this5));

      session.observeStopEvents().subscribe(_this5._onStopped.bind(_this5));

      session.observeExitedDebugeeEvents().subscribe(_this5._onExitedDebugee.bind(_this5));

      session.observeTerminateDebugeeEvents().subscribe(_this5._onTerminatedDebugee.bind(_this5));

      yield session.launch(launchArgs);
      yield _this5._cacheThreads();
    })();
  }

  closeSession() {
    var _this6 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (_this6._debugSession == null) {
        return;
      }

      yield _this6._debugSession.disconnect();
      _this6._threads = new Map();
      _this6._debugSession = null;
      _this6._activeThread = null;

      // $TODO perf - there may be some value in not immediately flushing
      // and keeping the cache around if we reattach to the same target,
      // using watch to see if the file has changed in the meantime
      _this6._sourceFiles.flush();
    })();
  }

  _onContinued(event) {
    // if the thread we're actively debugging starts running,
    // stop interactivity until the target stops again
    if (event.body.threadId === this._activeThread) {
      this._console.stopInput();
    }
  }

  _onStopped(event) {
    var _this7 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const stopThread = event.body.threadId;

      if (stopThread != null && stopThread === _this7._activeThread) {
        const topOfStack = yield _this7._getTopOfStackSourceInfo(stopThread);
        if (topOfStack != null) {
          _this7._console.outputLine(`${topOfStack.name}:${topOfStack.frame.line + 1} ${topOfStack.line}`);
        }

        _this7._console.startInput();
      }
    })();
  }

  _onExitedDebugee(event) {
    this._console.outputLine(`Target exited with status ${event.body.exitCode}`);
    this.closeSession();
  }

  _onTerminatedDebugee(event) {
    // Some adapters will send multiple terminated events.
    if (this._debugSession == null) {
      return;
    }
    this._console.outputLine('The target has exited.');
    this.closeSession();
    this._console.startInput();
  }

  _cacheThreads() {
    var _this8 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (!(_this8._debugSession != null)) {
        throw new Error('_cacheThreads called without session');
      }

      const { body: { threads } } = yield _this8._debugSession.threads();
      _this8._threads = new Map(threads.map(function (thd) {
        return [thd.id, thd.name];
      }));

      _this8._activeThread = null;
      if (threads.length > 0) {
        _this8._activeThread = threads[0].id;
      }
    })();
  }

  _getTopOfStackSourceInfo(threadId) {
    var _this9 = this;

    return (0, _asyncToGenerator.default)(function* () {
      // $TODO paths relative to project root?
      const frames = yield _this9.getStackTrace(threadId, 1);
      const source = Debugger._sourceFromTopFrame(frames);
      if (source == null) {
        return null;
      }

      const frame = frames[0];
      const lines = yield _this9.getSourceLines(source, frames[0].line, 1);

      let name;

      if (source.path != null) {
        const path = (_nuclideUri || _load_nuclideUri()).default.resolve(source.path);
        name = (_nuclideUri || _load_nuclideUri()).default.split(path).pop();
      } else if (source.name != null) {
        name = source.name;
      } else {
        // the spec guarantees that name is always defined on return, so
        // we should never get here.
        return null;
      }

      return {
        line: lines.length > 0 ? lines[0] : '',
        name,
        frame
      };
    })();
  }

  static _sourceFromTopFrame(frames) {
    var _ref, _ref2;

    return ((_ref = frames) != null ? (_ref2 = _ref[0]) != null ? _ref2.source : _ref2 : _ref) || null;
  }

  _getSourceByReference(sourceReference) {
    var _this10 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const { body: { content } } = yield _this10._ensureDebugSession().source({
        sourceReference
      });
      return content;
    })();
  }

  _ensureDebugSession() {
    if (this._debugSession == null) {
      throw new Error('There is no active debugging session.');
    }
    return this._debugSession;
  }
}
exports.default = Debugger;