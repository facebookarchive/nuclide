Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _Ansi2;

function _Ansi() {
  return _Ansi2 = _interopRequireDefault(require('./Ansi'));
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _TestRunModel2;

function _TestRunModel() {
  return _TestRunModel2 = _interopRequireDefault(require('./TestRunModel'));
}

var _uiTestRunnerPanel2;

function _uiTestRunnerPanel() {
  return _uiTestRunnerPanel2 = _interopRequireDefault(require('./ui/TestRunnerPanel'));
}

var _TestSuiteModel2;

function _TestSuiteModel() {
  return _TestSuiteModel2 = _interopRequireDefault(require('./TestSuiteModel'));
}

var _os2;

function _os() {
  return _os2 = _interopRequireDefault(require('os'));
}

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../nuclide-analytics');
}

var _commonsAtomConsumeFirstProvider2;

function _commonsAtomConsumeFirstProvider() {
  return _commonsAtomConsumeFirstProvider2 = _interopRequireDefault(require('../../commons-atom/consumeFirstProvider'));
}

var logger = require('../../nuclide-logging').getLogger();

var TestRunnerController = (function () {
  function TestRunnerController(state, testRunners) {
    _classCallCheck(this, TestRunnerController);

    if (state == null) {
      state = {};
    }

    this._state = {
      panelVisible: state.panelVisible
    };

    // Bind Functions for use as callbacks;
    // TODO: Replace with property initializers when supported by Flow;
    this.clearOutput = this.clearOutput.bind(this);
    this.hidePanel = this.hidePanel.bind(this);
    this.stopTests = this.stopTests.bind(this);
    this._handleClickRun = this._handleClickRun.bind(this);
    this._onDebuggerCheckboxChanged = this._onDebuggerCheckboxChanged.bind(this);

    // TODO: Use the ReadOnlyTextBuffer class from nuclide-atom-text-editor when it is exported.
    this._buffer = new (_atom2 || _atom()).TextBuffer();
    // Make `delete` a no-op to effectively create a read-only buffer.
    this._buffer.delete = function () {};

    this._executionState = (_uiTestRunnerPanel2 || _uiTestRunnerPanel()).default.ExecutionState.STOPPED;
    this._testRunners = testRunners;
    this._attachDebuggerBeforeRunning = false;
    this._runningTest = false;
    this._renderPanel();
  }

  _createClass(TestRunnerController, [{
    key: 'clearOutput',
    value: function clearOutput() {
      this._buffer.setText('');
      this._path = undefined;
      this._run = undefined;
      this._stopListening();
      this._testSuiteModel = undefined;
      this._renderPanel();
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this._stopListening();
      if (this._root) {
        (_reactForAtom2 || _reactForAtom()).ReactDOM.unmountComponentAtNode(this._root);
        this._root = null;
      }
      if (this._panel) {
        this._panel.destroy();
        this._panel = null;
      }
    }
  }, {
    key: 'didUpdateTestRunners',
    value: function didUpdateTestRunners() {
      this._renderPanel();
    }
  }, {
    key: 'hidePanel',
    value: function hidePanel() {
      this.stopTests();
      this._state.panelVisible = false;
      if (this._panel) {
        this._panel.hide();
      }
    }

    /**
     * @return A Promise that resolves when testing has succesfully started.
     */
  }, {
    key: 'runTests',
    value: _asyncToGenerator(function* (path) {
      var _this = this;

      // If the test runner panel is not rendered yet, ensure it is rendered before continuing.
      if (this._testRunnerPanel == null || !this._state.panelVisible) {
        yield new Promise(function (resolve, reject) {
          _this.showPanel(resolve);
        });
      }

      if (this._testRunnerPanel == null) {
        logger.error('Test runner panel did not render as expected. Aborting testing.');
        return;
      }

      // Get selected test runner when Flow knows `this._testRunnerPanel` is defined.
      var selectedTestRunner = this._testRunnerPanel.getSelectedTestRunner();
      if (!selectedTestRunner) {
        logger.warn('No test runner selected. Active test runners: ' + this._testRunners.size);
        return;
      }

      // 1. Use the `path` argument to this function
      // 2. Use `this._path` on the instance
      // 3. Let `testPath` be `undefined` so the path will be taken from the active `TextEditor`
      var testPath = path === undefined ? this._path : path;

      // If there's no path yet, get the path from the active `TextEditor`.
      if (testPath === undefined) {
        var activeTextEditor = atom.workspace.getActiveTextEditor();
        if (!activeTextEditor) {
          logger.debug('Attempted to run tests with no active text editor.');
          return;
        }

        // If the active text editor has no path, bail because there's nowhere to run tests.
        testPath = activeTextEditor.getPath();
      }

      if (!testPath) {
        logger.warn('Attempted to run tests on an editor with no path.');
        return;
      }

      // If the test runner is debuggable, and the user has checked the box, then we will launch
      // the debugger before running the tests.  We do not handle killing the debugger.
      if (this._isSelectedTestRunnerDebuggable() && this._attachDebuggerBeforeRunning) {
        var isAttached = yield this._isDebuggerAttached(selectedTestRunner.debuggerProviderName);
        if (!isAttached) {
          yield selectedTestRunner.attachDebugger(testPath);
        }
      }

      // If the user has cancelled the test run while control was yielded, we should not run the test.
      if (!this._runningTest) {
        return;
      }

      this.clearOutput();
      this._runTestRunnerServiceForPath(selectedTestRunner.runTest(testPath), testPath, selectedTestRunner.label);
      (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)('testrunner-run-tests', {
        path: testPath,
        testRunner: selectedTestRunner.label
      });

      // Set state as "Running" to give immediate feedback in the UI.
      this._setExecutionState((_uiTestRunnerPanel2 || _uiTestRunnerPanel()).default.ExecutionState.RUNNING);
      this._path = testPath;
      this._renderPanel();
    })
  }, {
    key: '_isSelectedTestRunnerDebuggable',
    value: function _isSelectedTestRunnerDebuggable() {
      if (this._testRunnerPanel == null) {
        return false;
      }
      var selectedTestRunner = this._testRunnerPanel.getSelectedTestRunner();
      return selectedTestRunner != null && selectedTestRunner.attachDebugger != null;
    }
  }, {
    key: '_isDebuggerAttached',
    value: _asyncToGenerator(function* (debuggerProviderName) {
      var debuggerService = yield (0, (_commonsAtomConsumeFirstProvider2 || _commonsAtomConsumeFirstProvider()).default)('nuclide-debugger.remote');
      return debuggerService.isInDebuggingMode(debuggerProviderName);
    })
  }, {
    key: 'stopTests',
    value: function stopTests() {
      // Resume the debugger if needed.
      atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:continue-debugging');
      if (this._runTestsSubscription != null) {
        this._runTestsSubscription.dispose();
      }
      this._stopListening();
      // Respond in the UI immediately and assume the process is properly killed.
      this._setExecutionState((_uiTestRunnerPanel2 || _uiTestRunnerPanel()).default.ExecutionState.STOPPED);
    }
  }, {
    key: 'serialize',
    value: function serialize() {
      return this._state;
    }
  }, {
    key: 'showPanel',
    value: function showPanel(didRender) {
      (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)('testrunner-show-panel');
      this._state.panelVisible = true;
      this._renderPanel(didRender);
      if (this._panel) {
        this._panel.show();
      }
    }
  }, {
    key: 'togglePanel',
    value: function togglePanel() {
      (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)('testrunner-hide-panel');
      if (this._state.panelVisible) {
        this.hidePanel();
      } else {
        this.showPanel();
      }
    }
  }, {
    key: 'isVisible',
    value: function isVisible() {
      return this._state.panelVisible;
    }

    /**
     * Adds an end-of-line character to `text` and appends the resulting string to this controller's
     * text buffer.
     */
  }, {
    key: '_appendToBuffer',
    value: function _appendToBuffer(text) {
      // `undo: 'skip'` disables the TextEditor's "undo system". Since the buffer is managed by this
      // class, an undo will never happen. Disable it when appending to prevent doing unneeded
      // bookkeeping.
      //
      // @see {@link https://atom.io/docs/api/v1.0.4/TextBuffer#instance-append|TextBuffer::append}
      this._buffer.append('' + text + (_os2 || _os()).default.EOL, { undo: 'skip' });
    }
  }, {
    key: '_onDebuggerCheckboxChanged',
    value: function _onDebuggerCheckboxChanged(isChecked) {
      this._attachDebuggerBeforeRunning = isChecked;
      this._renderPanel();
    }
  }, {
    key: '_handleClickRun',
    value: function _handleClickRun(event) {
      this._runningTest = true;
      // Don't pass a reference to `runTests` directly because the callback receives a mouse event as
      // its argument. `runTests` needs to be called with no arguments.
      this.runTests();
    }
  }, {
    key: '_runTestRunnerServiceForPath',
    value: function _runTestRunnerServiceForPath(testRun, path, label) {
      var _this2 = this;

      var subscription = testRun.do(function (message) {
        switch (message.kind) {
          case 'summary':
            _this2._testSuiteModel = new (_TestSuiteModel2 || _TestSuiteModel()).default(message.summaryInfo);
            _this2._renderPanel();
            break;
          case 'run-test':
            var testInfo = message.testInfo;
            if (_this2._testSuiteModel) {
              _this2._testSuiteModel.addTestRun(testInfo);
            }

            // If a test run throws an exception, the stack trace is returned in 'details'.
            // Append its entirety to the console.
            if (testInfo.hasOwnProperty('details') && testInfo.details !== '') {
              // $FlowFixMe(peterhal)
              _this2._appendToBuffer(testInfo.details);
            }

            // Append a PASS/FAIL message depending on whether the class has test failures.
            _this2._appendToBuffer((_TestRunModel2 || _TestRunModel()).default.formatStatusMessage(testInfo.name, testInfo.durationSecs, testInfo.status));
            _this2._renderPanel();
            break;
          case 'start':
            if (_this2._run) {
              _this2._run.start();
            }
            break;
          case 'error':
            var error = message.error;
            if (_this2._run) {
              _this2._run.stop();
            }
            if (error.code === 'ENOENT') {
              _this2._appendToBuffer((_Ansi2 || _Ansi()).default.YELLOW + 'Command \'' + error.path + '\' does not exist' + (_Ansi2 || _Ansi()).default.RESET);
              _this2._appendToBuffer((_Ansi2 || _Ansi()).default.YELLOW + 'Are you trying to run remotely?' + (_Ansi2 || _Ansi()).default.RESET);
              _this2._appendToBuffer((_Ansi2 || _Ansi()).default.YELLOW + 'Path: ' + path + (_Ansi2 || _Ansi()).default.RESET);
            }
            _this2._appendToBuffer((_Ansi2 || _Ansi()).default.RED + 'Original Error: ' + error.message + (_Ansi2 || _Ansi()).default.RESET);
            _this2._setExecutionState((_uiTestRunnerPanel2 || _uiTestRunnerPanel()).default.ExecutionState.STOPPED);
            logger.error('Error running tests: "' + error.message + '"');
            break;
          case 'stderr':
            // Color stderr output red in the console to distinguish it as error.
            _this2._appendToBuffer('' + (_Ansi2 || _Ansi()).default.RED + message.data + (_Ansi2 || _Ansi()).default.RESET);
            break;
        }
      }).finally(function () {
        _this2._stopListening();
        _this2._setExecutionState((_uiTestRunnerPanel2 || _uiTestRunnerPanel()).default.ExecutionState.STOPPED);
      }).subscribe();
      this._run = new (_TestRunModel2 || _TestRunModel()).default(label, subscription.unsubscribe.bind(subscription));
    }
  }, {
    key: '_setExecutionState',
    value: function _setExecutionState(executionState) {
      this._executionState = executionState;
      this._renderPanel();
    }
  }, {
    key: '_renderPanel',
    value: function _renderPanel(didRender) {
      // Initialize and render the contents of the panel only if the hosting container is visible by
      // the user's choice.
      if (!this._state.panelVisible) {
        return;
      }

      var root = this._root;

      if (!root) {
        root = document.createElement('div');
        this._root = root;
      }

      var progressValue = undefined;
      if (this._testSuiteModel && this._executionState === (_uiTestRunnerPanel2 || _uiTestRunnerPanel()).default.ExecutionState.RUNNING) {
        progressValue = this._testSuiteModel.progressPercent();
      } else {
        // If there is no running test suite, fill the progress bar because there is no progress to
        // track.
        progressValue = 100;
      }

      var component = (_reactForAtom2 || _reactForAtom()).ReactDOM.render((_reactForAtom2 || _reactForAtom()).React.createElement((_uiTestRunnerPanel2 || _uiTestRunnerPanel()).default, {
        attachDebuggerBeforeRunning: this._attachDebuggerBeforeRunning,
        buffer: this._buffer,
        executionState: this._executionState,
        onClickClear: this.clearOutput,
        onClickClose: this.hidePanel,
        onClickRun: this._handleClickRun,
        onClickStop: this.stopTests,
        onDebuggerCheckboxChanged: this._onDebuggerCheckboxChanged,
        path: this._path,
        progressValue: progressValue,
        runDuration: this._run && this._run.getDuration(),
        // `TestRunnerPanel` expects an Array so it can render the test runners in a dropdown and
        // maintain a selected index. `Set` maintains items in insertion order, so the ordering is
        // determinate on each render.
        testRunners: Array.from(this._testRunners),
        testSuiteModel: this._testSuiteModel
      }), root, didRender);
      (0, (_assert2 || _assert()).default)(component instanceof (_uiTestRunnerPanel2 || _uiTestRunnerPanel()).default);
      this._testRunnerPanel = component;

      if (!this._panel) {
        this._panel = atom.workspace.addBottomPanel({ item: root, visible: this._state.panelVisible });
      }
    }
  }, {
    key: '_stopListening',
    value: function _stopListening() {
      this._runningTest = false;
      if (this._run && this._run.dispose != null) {
        try {
          var dispose = this._run.dispose;
          this._run.dispose = null;
          this._run.stop();
          (0, (_assert2 || _assert()).default)(this._run); // Calling `stop()` should never null the `_run` property.
          (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)('testrunner-stop-tests', {
            testRunner: this._run.label
          });
          dispose();
        } catch (e) {
          (0, (_assert2 || _assert()).default)(this._run); // Nothing in the try block should ever null the `_run` property.
          // If the remote connection goes away, it won't be possible to stop tests. Log an error and
          // proceed as usual.
          logger.error('Error when stopping test run #\'' + this._run.label + ': ' + e);
        }
      }
    }
  }]);

  return TestRunnerController;
})();

exports.TestRunnerController = TestRunnerController;