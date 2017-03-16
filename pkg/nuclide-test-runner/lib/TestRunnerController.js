'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TestRunnerController = exports.WORKSPACE_VIEW_URI = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _Ansi;

function _load_Ansi() {
  return _Ansi = _interopRequireDefault(require('./Ansi'));
}

var _atom = require('atom');

var _react = _interopRequireDefault(require('react'));

var _reactDom = _interopRequireDefault(require('react-dom'));

var _TestRunModel;

function _load_TestRunModel() {
  return _TestRunModel = _interopRequireDefault(require('./TestRunModel'));
}

var _TestRunnerPanel;

function _load_TestRunnerPanel() {
  return _TestRunnerPanel = _interopRequireDefault(require('./ui/TestRunnerPanel'));
}

var _TestSuiteModel;

function _load_TestSuiteModel() {
  return _TestSuiteModel = _interopRequireDefault(require('./TestSuiteModel'));
}

var _os = _interopRequireDefault(require('os'));

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _consumeFirstProvider;

function _load_consumeFirstProvider() {
  return _consumeFirstProvider = _interopRequireDefault(require('../../commons-atom/consumeFirstProvider'));
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const logger = (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)(); /**
                                                                              * Copyright (c) 2015-present, Facebook, Inc.
                                                                              * All rights reserved.
                                                                              *
                                                                              * This source code is licensed under the license found in the LICENSE file in
                                                                              * the root directory of this source tree.
                                                                              *
                                                                              * 
                                                                              */

const WORKSPACE_VIEW_URI = exports.WORKSPACE_VIEW_URI = 'atom://nuclide/test-runner';

class TestRunnerController {

  constructor(testRunners) {
    this._root = document.createElement('div');

    this._panelVisible = false;

    // Bind Functions for use as callbacks;
    // TODO: Replace with property initializers when supported by Flow;
    this.clearOutput = this.clearOutput.bind(this);
    this.hidePanel = this.hidePanel.bind(this);
    this.stopTests = this.stopTests.bind(this);
    this._handleClickRun = this._handleClickRun.bind(this);
    this._onDebuggerCheckboxChanged = this._onDebuggerCheckboxChanged.bind(this);

    // TODO: Use the ReadOnlyTextBuffer class from nuclide-atom-text-editor when it is exported.
    this._buffer = new _atom.TextBuffer();
    // Make `delete` a no-op to effectively create a read-only buffer.
    this._buffer.delete = () => {};

    this._executionState = (_TestRunnerPanel || _load_TestRunnerPanel()).default.ExecutionState.STOPPED;
    this._testRunners = testRunners;
    this._attachDebuggerBeforeRunning = false;
    this._runningTest = false;
    this._renderPanel();
  }

  clearOutput() {
    this._buffer.setText('');
    this._path = undefined;
    this._run = undefined;
    this._stopListening();
    this._testSuiteModel = undefined;
    this._renderPanel();
  }

  destroy() {
    this._stopListening();
    _reactDom.default.unmountComponentAtNode(this._root);
  }

  didUpdateTestRunners() {
    this._renderPanel();
  }

  hidePanel() {
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('testrunner-hide-panel');
    this.stopTests();
    this._panelVisible = false;
  }

  /**
   * @return A Promise that resolves when testing has succesfully started.
   */
  runTests(path) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      _this._runningTest = true;

      // If the test runner panel is not rendered yet, ensure it is rendered before continuing.
      if (_this._testRunnerPanel == null || !_this._panelVisible) {
        yield new Promise(function (resolve, reject) {
          _this.showPanel(resolve);
        });
      }

      if (_this._testRunnerPanel == null) {
        logger.error('Test runner panel did not render as expected. Aborting testing.');
        return;
      }

      // Get selected test runner when Flow knows `this._testRunnerPanel` is defined.
      const selectedTestRunner = _this._testRunnerPanel.getSelectedTestRunner();
      if (!selectedTestRunner) {
        logger.warn(`No test runner selected. Active test runners: ${_this._testRunners.size}`);
        return;
      }

      // 1. Use the `path` argument to this function
      // 2. Use `this._path` on the instance
      // 3. Let `testPath` be `undefined` so the path will be taken from the active `TextEditor`
      let testPath = path === undefined ? _this._path : path;

      // If there's no path yet, get the path from the active `TextEditor`.
      if (testPath === undefined) {
        const activeTextEditor = atom.workspace.getActiveTextEditor();
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
      if (_this._isSelectedTestRunnerDebuggable() && _this._attachDebuggerBeforeRunning) {
        const isAttached = yield _this._isDebuggerAttached(selectedTestRunner.debuggerProviderName);
        if (!isAttached) {
          yield selectedTestRunner.attachDebugger(testPath);
        }
      }

      // If the user has cancelled the test run while control was yielded, we should not run the test.
      if (!_this._runningTest) {
        return;
      }

      _this.clearOutput();
      _this._runTestRunnerServiceForPath(selectedTestRunner.runTest(testPath), testPath, selectedTestRunner.label);
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('testrunner-run-tests', {
        path: testPath,
        testRunner: selectedTestRunner.label
      });

      // Set state as "Running" to give immediate feedback in the UI.
      _this._setExecutionState((_TestRunnerPanel || _load_TestRunnerPanel()).default.ExecutionState.RUNNING);
      _this._path = testPath;
      _this._renderPanel();
    })();
  }

  _isSelectedTestRunnerDebuggable() {
    if (this._testRunnerPanel == null) {
      return false;
    }
    const selectedTestRunner = this._testRunnerPanel.getSelectedTestRunner();
    return selectedTestRunner != null && selectedTestRunner.attachDebugger != null;
  }

  _isDebuggerAttached(debuggerProviderName) {
    return (0, _asyncToGenerator.default)(function* () {
      const debuggerService = yield (0, (_consumeFirstProvider || _load_consumeFirstProvider()).default)('nuclide-debugger.remote');
      return debuggerService.isInDebuggingMode(debuggerProviderName);
    })();
  }

  stopTests() {
    // Resume the debugger if needed.
    atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:continue-debugging');
    this._stopListening();
    // Respond in the UI immediately and assume the process is properly killed.
    this._setExecutionState((_TestRunnerPanel || _load_TestRunnerPanel()).default.ExecutionState.STOPPED);
  }

  showPanel(didRender) {
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('testrunner-show-panel');
    this._panelVisible = true;
    this._renderPanel(didRender);
  }

  togglePanel() {
    if (this._panelVisible) {
      this.hidePanel();
    } else {
      this.showPanel();
    }
  }

  isVisible() {
    return this._panelVisible;
  }

  /**
   * Adds an end-of-line character to `text` and appends the resulting string to this controller's
   * text buffer.
   */
  _appendToBuffer(text) {
    // `undo: 'skip'` disables the TextEditor's "undo system". Since the buffer is managed by this
    // class, an undo will never happen. Disable it when appending to prevent doing unneeded
    // bookkeeping.
    //
    // @see {@link https://atom.io/docs/api/v1.0.4/TextBuffer#instance-append|TextBuffer::append}
    this._buffer.append(`${text}${_os.default.EOL}`, { undo: 'skip' });
  }

  _onDebuggerCheckboxChanged(isChecked) {
    this._attachDebuggerBeforeRunning = isChecked;
    this._renderPanel();
  }

  _handleClickRun(event) {
    // Don't pass a reference to `runTests` directly because the callback receives a mouse event as
    // its argument. `runTests` needs to be called with no arguments.
    this.runTests();
  }

  _runTestRunnerServiceForPath(testRun, path, label) {
    const subscription = testRun.do(message => {
      switch (message.kind) {
        case 'summary':
          this._testSuiteModel = new (_TestSuiteModel || _load_TestSuiteModel()).default(message.summaryInfo);
          this._renderPanel();
          break;
        case 'run-test':
          const testInfo = message.testInfo;
          if (this._testSuiteModel) {
            this._testSuiteModel.addTestRun(testInfo);
          }

          // If a test run throws an exception, the stack trace is returned in 'details'.
          // Append its entirety to the console.
          if (testInfo.hasOwnProperty('details') && testInfo.details !== '') {
            // $FlowFixMe(peterhal)
            this._appendToBuffer(testInfo.details);
          }

          // Append a PASS/FAIL message depending on whether the class has test failures.
          this._appendToBuffer((_TestRunModel || _load_TestRunModel()).default.formatStatusMessage(testInfo.name, testInfo.durationSecs, testInfo.status));
          this._renderPanel();
          break;
        case 'start':
          if (this._run) {
            this._run.start();
          }
          break;
        case 'error':
          const error = message.error;
          if (this._run) {
            this._run.stop();
          }
          if (error.code === 'ENOENT') {
            this._appendToBuffer(`${(_Ansi || _load_Ansi()).default.YELLOW}Command '${error.path}' does not exist${(_Ansi || _load_Ansi()).default.RESET}`);
            this._appendToBuffer(`${(_Ansi || _load_Ansi()).default.YELLOW}Are you trying to run remotely?${(_Ansi || _load_Ansi()).default.RESET}`);
            this._appendToBuffer(`${(_Ansi || _load_Ansi()).default.YELLOW}Path: ${path}${(_Ansi || _load_Ansi()).default.RESET}`);
          }
          this._appendToBuffer(`${(_Ansi || _load_Ansi()).default.RED}Original Error: ${error.message}${(_Ansi || _load_Ansi()).default.RESET}`);
          this._setExecutionState((_TestRunnerPanel || _load_TestRunnerPanel()).default.ExecutionState.STOPPED);
          logger.error(`Error running tests: "${error.message}"`);
          break;
        case 'stderr':
          // Color stderr output red in the console to distinguish it as error.
          this._appendToBuffer(`${(_Ansi || _load_Ansi()).default.RED}${message.data}${(_Ansi || _load_Ansi()).default.RESET}`);
          break;
      }
    }).finally(() => {
      this._stopListening();
      this._setExecutionState((_TestRunnerPanel || _load_TestRunnerPanel()).default.ExecutionState.STOPPED);
    }).subscribe();
    this._run = new (_TestRunModel || _load_TestRunModel()).default(label, subscription.unsubscribe.bind(subscription));
  }

  _setExecutionState(executionState) {
    this._executionState = executionState;
    this._renderPanel();
  }

  _renderPanel(didRender) {
    // Initialize and render the contents of the panel only if the hosting container is visible by
    // the user's choice.
    if (!this._panelVisible) {
      return;
    }

    let progressValue;
    if (this._testSuiteModel && this._executionState === (_TestRunnerPanel || _load_TestRunnerPanel()).default.ExecutionState.RUNNING) {
      progressValue = this._testSuiteModel.progressPercent();
    } else {
      // If there is no running test suite, fill the progress bar because there is no progress to
      // track.
      progressValue = 100;
    }
    this._root.style.display = 'flex';
    const component = _reactDom.default.render(_react.default.createElement((_TestRunnerPanel || _load_TestRunnerPanel()).default, {
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
      runDuration: this._run && this._run.getDuration()
      // `TestRunnerPanel` expects an Array so it can render the test runners in a dropdown and
      // maintain a selected index. `Set` maintains items in insertion order, so the ordering is
      // determinate on each render.
      , testRunners: Array.from(this._testRunners),
      testSuiteModel: this._testSuiteModel
    }), this._root, didRender);

    if (!(component instanceof (_TestRunnerPanel || _load_TestRunnerPanel()).default)) {
      throw new Error('Invariant violation: "component instanceof TestRunnerPanel"');
    }

    this._testRunnerPanel = component;
  }

  _stopListening() {
    this._runningTest = false;
    if (this._run && this._run.dispose != null) {
      try {
        const dispose = this._run.dispose;
        this._run.dispose = null;
        this._run.stop();

        if (!this._run) {
          throw new Error('Invariant violation: "this._run"');
        } // Calling `stop()` should never null the `_run` property.


        (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('testrunner-stop-tests', {
          testRunner: this._run.label
        });
        dispose();
      } catch (e) {
        if (!this._run) {
          throw new Error('Invariant violation: "this._run"');
        } // Nothing in the try block should ever null the `_run` property.
        // If the remote connection goes away, it won't be possible to stop tests. Log an error and
        // proceed as usual.


        logger.error(`Error when stopping test run #'${this._run.label}: ${e}`);
      }
    }
  }

  getTitle() {
    return 'Test Runner';
  }

  getIconName() {
    return 'checklist';
  }

  getURI() {
    return WORKSPACE_VIEW_URI;
  }

  getDefaultLocation() {
    return 'bottom-panel';
  }

  didChangeVisibility(visible) {
    if (visible) {
      this.showPanel();
    } else {
      this.hidePanel();
    }
  }

  getElement() {
    return this._root;
  }

  serialize() {
    return {
      deserializer: 'nuclide.TestRunnerPanelState'
    };
  }
}
exports.TestRunnerController = TestRunnerController;