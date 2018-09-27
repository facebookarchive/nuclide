"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TestRunnerController = exports.WORKSPACE_VIEW_URI = void 0;

function _Ansi() {
  const data = _interopRequireDefault(require("./Ansi"));

  _Ansi = function () {
    return data;
  };

  return data;
}

var _atom = require("atom");

var React = _interopRequireWildcard(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

function _TestRunModel() {
  const data = _interopRequireDefault(require("./TestRunModel"));

  _TestRunModel = function () {
    return data;
  };

  return data;
}

function _TestRunnerPanel() {
  const data = _interopRequireDefault(require("./ui/TestRunnerPanel"));

  _TestRunnerPanel = function () {
    return data;
  };

  return data;
}

function _TestSuiteModel() {
  const data = _interopRequireDefault(require("./TestSuiteModel"));

  _TestSuiteModel = function () {
    return data;
  };

  return data;
}

var _os = _interopRequireDefault(require("os"));

function _nuclideAnalytics() {
  const data = require("../../nuclide-analytics");

  _nuclideAnalytics = function () {
    return data;
  };

  return data;
}

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
const logger = (0, _log4js().getLogger)('nuclide-test-runner');
const WORKSPACE_VIEW_URI = 'atom://nuclide/test-runner';
exports.WORKSPACE_VIEW_URI = WORKSPACE_VIEW_URI;

class TestRunnerController {
  constructor(testRunners) {
    this.clearOutput = () => {
      this._buffer.setText('');

      this._path = undefined;
      this._run = undefined;

      this._stopListening();

      this._testSuiteModel = undefined;

      this._renderPanel();
    };

    this.stopTests = () => {
      // Resume the debugger if needed.
      atom.commands.dispatch(atom.views.getView(atom.workspace), 'debugger:continue-debugging');

      this._stopListening(); // Respond in the UI immediately and assume the process is properly killed.


      this._setExecutionState(_TestRunnerPanel().default.ExecutionState.STOPPED);
    };

    this._onDebuggerCheckboxChanged = isChecked => {
      this._attachDebuggerBeforeRunning = isChecked;

      this._renderPanel();
    };

    this._handleClickRun = event => {
      // Don't pass a reference to `runTests` directly because the callback receives a mouse event as
      // its argument. `runTests` needs to be called with no arguments.
      this.runTests();
    };

    this._root = document.createElement('div');
    this._root.className = 'nuclide-test-runner-root'; // TODO: Use the ReadOnlyTextBuffer class from nuclide-atom-text-editor when it is exported.

    this._buffer = new _atom.TextBuffer(); // Make `delete` a no-op to effectively create a read-only buffer.

    this._buffer.delete = () => {};

    this._executionState = _TestRunnerPanel().default.ExecutionState.STOPPED;
    this._testRunners = testRunners;
    this._attachDebuggerBeforeRunning = false;
    this._runTestOptions = new Map();
    this._runningTest = false;

    this._renderPanel();
  } // Atom expects us to return a new instance of this class every time it's shown in the
  // workspace. For historical reasons, we always use the same one. This is bad because it means
  // that our `destroy()` will be called multiple times, and that this instance needs to be
  // reusable after it's destroyed. To work around this for the time being, we call this method to
  // reinitialize the view when we should really be creating a new instance.


  reinitialize() {
    this._renderPanel();
  }

  destroy() {
    this._stopListening();

    _reactDom.default.unmountComponentAtNode(this._root);
  }

  didUpdateTestRunners() {
    this._renderPanel();
  }
  /**
   * @return A Promise that resolves when testing has successfully started.
   */


  async runTests(path) {
    this._runningTest = true; // eslint-disable-next-line nuclide-internal/atom-apis

    atom.workspace.open(WORKSPACE_VIEW_URI, {
      searchAllPanes: true
    }); // Get selected test runner when Flow knows `this._testRunnerPanel` is defined.

    const selectedTestRunner = this._testRunnerPanel.getSelectedTestRunner();

    if (!selectedTestRunner) {
      logger.warn(`No test runner selected. Active test runners: ${this._testRunners.size}`);
      return;
    } // 1. Use the `path` argument to this function
    // 2. Use `this._path` on the instance
    // 3. Let `testPath` be `undefined` so the path will be taken from the active `TextEditor`


    let testPath = path === undefined ? this._path : path; // If there's no path yet, get the path from the active `TextEditor`.

    if (testPath === undefined) {
      const activeTextEditor = atom.workspace.getActiveTextEditor();

      if (!activeTextEditor) {
        logger.debug('Attempted to run tests with no active text editor.');
        return;
      } // If the active text editor has no path, bail because there's nowhere to run tests.


      testPath = activeTextEditor.getPath();
    } // flowlint-next-line sketchy-null-string:off


    if (!testPath) {
      logger.warn('Attempted to run tests on an editor with no path.');
      return;
    } // If the test runner is debuggable, and the user has checked the box, then we will launch
    // the debugger before running the tests.  We do not handle killing the debugger.


    if (this._isSelectedTestRunnerDebuggable() && this._attachDebuggerBeforeRunning && selectedTestRunner.attachDebugger) {
      await selectedTestRunner.attachDebugger(testPath);
    }

    const filterMethodsValue = this._testRunnerPanel.getFilterMethodsValue();

    if (filterMethodsValue) {
      this._runTestOptions.set('filter', filterMethodsValue);
    } else {
      this._runTestOptions.delete('filter');
    } // If the user has cancelled the test run while control was yielded, we should not run the test.


    if (!this._runningTest) {
      return;
    }

    this.clearOutput();

    this._runTestRunnerServiceForPath(selectedTestRunner.runTestWithOptions && this._runTestOptions.size ? selectedTestRunner.runTestWithOptions(testPath, this._runTestOptions) : selectedTestRunner.runTest(testPath), testPath, selectedTestRunner.label);

    (0, _nuclideAnalytics().track)('testrunner-run-tests', {
      path: testPath,
      testRunner: selectedTestRunner.label,
      filter: filterMethodsValue
    }); // Set state as "Running" to give immediate feedback in the UI.

    this._setExecutionState(_TestRunnerPanel().default.ExecutionState.RUNNING);

    this._path = testPath;

    this._renderPanel();
  }

  _isSelectedTestRunnerDebuggable() {
    if (this._testRunnerPanel == null) {
      return false;
    }

    const selectedTestRunner = this._testRunnerPanel.getSelectedTestRunner();

    return selectedTestRunner != null && selectedTestRunner.attachDebugger != null;
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
    this._buffer.append(`${text}${_os.default.EOL}`, {
      undo: 'skip'
    });
  }

  _runTestRunnerServiceForPath(testRun, path, label) {
    const subscription = testRun.do(message => {
      switch (message.kind) {
        case 'summary':
          this._testSuiteModel = new (_TestSuiteModel().default)(message.summaryInfo);

          this._renderPanel();

          break;

        case 'run-test':
          const testInfo = message.testInfo;

          if (this._testSuiteModel) {
            this._testSuiteModel.addTestRun(testInfo);
          } // If a test run throws an exception, the stack trace is returned in 'details'.
          // Append its entirety to the console.


          if (testInfo.hasOwnProperty('details') && testInfo.details !== '') {
            // $FlowFixMe(peterhal)
            this._appendToBuffer(testInfo.details);
          } // Append a PASS/FAIL message depending on whether the class has test failures.


          this._appendToBuffer(_TestRunModel().default.formatStatusMessage(testInfo.name, testInfo.durationSecs, testInfo.status));

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
            this._appendToBuffer(`${_Ansi().default.YELLOW}Command '${error.path}' does not exist${_Ansi().default.RESET}`);

            this._appendToBuffer(`${_Ansi().default.YELLOW}Are you trying to run remotely?${_Ansi().default.RESET}`);

            this._appendToBuffer(`${_Ansi().default.YELLOW}Path: ${path}${_Ansi().default.RESET}`);
          }

          this._appendToBuffer(`${_Ansi().default.RED}Original Error: ${error.message}${_Ansi().default.RESET}`);

          this._setExecutionState(_TestRunnerPanel().default.ExecutionState.STOPPED);

          logger.error(`Error running tests: "${error.message}"`);
          break;

        case 'stderr':
          // Color stderr output red in the console to distinguish it as error.
          this._appendToBuffer(`${_Ansi().default.RED}${message.data}${_Ansi().default.RESET}`);

          break;
      }
    }).finally(() => {
      this._stopListening();

      this._setExecutionState(_TestRunnerPanel().default.ExecutionState.STOPPED);
    }).subscribe();
    this._run = new (_TestRunModel().default)(label, subscription.unsubscribe.bind(subscription));
  }

  _setExecutionState(executionState) {
    this._executionState = executionState;

    this._renderPanel();
  }

  _getFilterMethodsValue() {
    const value = this._runTestOptions.get('filter');

    return typeof value === 'string' ? value : null;
  }

  _renderPanel() {
    let progressValue;

    if (this._testSuiteModel && this._executionState === _TestRunnerPanel().default.ExecutionState.RUNNING) {
      progressValue = this._testSuiteModel.progressPercent();
    } else {
      // If there is no running test suite, fill the progress bar because there is no progress to
      // track.
      progressValue = 100;
    }

    const component = _reactDom.default.render(React.createElement(_TestRunnerPanel().default, {
      attachDebuggerBeforeRunning: this._attachDebuggerBeforeRunning,
      filterMethodsValue: this._getFilterMethodsValue(),
      buffer: this._buffer,
      executionState: this._executionState,
      onClickClear: this.clearOutput,
      onClickRun: this._handleClickRun,
      onClickStop: this.stopTests,
      onDebuggerCheckboxChanged: this._onDebuggerCheckboxChanged,
      path: this._path,
      progressValue: progressValue,
      runDuration: this._run && this._run.getDuration() // `TestRunnerPanel` expects an Array so it can render the test runners in a dropdown and
      // maintain a selected index. `Set` maintains items in insertion order, so the ordering is
      // determinate on each render.
      ,
      testRunners: Array.from(this._testRunners),
      testSuiteModel: this._testSuiteModel
    }), this._root);

    if (!(component instanceof _TestRunnerPanel().default)) {
      throw new Error("Invariant violation: \"component instanceof TestRunnerPanel\"");
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
          throw new Error("Invariant violation: \"this._run\"");
        } // Calling `stop()` should never null the `_run` property.


        (0, _nuclideAnalytics().track)('testrunner-stop-tests', {
          testRunner: this._run.label
        });
        dispose();
      } catch (e) {
        if (!this._run) {
          throw new Error("Invariant violation: \"this._run\"");
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
    return 'bottom';
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