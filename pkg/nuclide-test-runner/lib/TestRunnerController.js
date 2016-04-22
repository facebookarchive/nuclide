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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var Ansi = require('./Ansi');

var _require = require('atom');

var TextBuffer = _require.TextBuffer;

var _require2 = require('react-for-atom');

var React = _require2.React;
var ReactDOM = _require2.ReactDOM;

var TestRunModel = require('./TestRunModel');
var TestRunnerPanel = require('./ui/TestRunnerPanel');
var TestSuiteModel = require('./TestSuiteModel');

var logger = require('../../nuclide-logging').getLogger();
var os = require('os');

var _require3 = require('../../nuclide-analytics');

var track = _require3.track;

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
    this._buffer = new TextBuffer();
    // Make `delete` a no-op to effectively create a read-only buffer.
    this._buffer['delete'] = function () {};

    this._executionState = TestRunnerPanel.ExecutionState.STOPPED;
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
        ReactDOM.unmountComponentAtNode(this._root);
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
      track('testrunner-run-tests', {
        path: testPath,
        testRunner: selectedTestRunner.label
      });

      // Set state as "Running" to give immediate feedback in the UI.
      this._setExecutionState(TestRunnerPanel.ExecutionState.RUNNING);
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
      var debuggerService = yield require('../../nuclide-service-hub-plus').consumeFirstProvider('nuclide-debugger.remote');
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
      this._setExecutionState(TestRunnerPanel.ExecutionState.STOPPED);
    }
  }, {
    key: 'serialize',
    value: function serialize() {
      return this._state;
    }
  }, {
    key: 'showPanel',
    value: function showPanel(didRender) {
      track('testrunner-show-panel');
      this._state.panelVisible = true;
      this._renderPanel(didRender);
      if (this._panel) {
        this._panel.show();
      }
    }
  }, {
    key: 'togglePanel',
    value: function togglePanel() {
      track('testrunner-hide-panel');
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
      this._buffer.append('' + text + os.EOL, { undo: 'skip' });
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

      var subscription = testRun['do'](function (message) {
        switch (message.kind) {
          case 'summary':
            _this2._testSuiteModel = new TestSuiteModel(message.summaryInfo);
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
            _this2._appendToBuffer(TestRunModel.formatStatusMessage(testInfo.name, testInfo.durationSecs, testInfo.status));
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
              _this2._appendToBuffer(Ansi.YELLOW + 'Command \'' + error.path + '\' does not exist' + Ansi.RESET);
              _this2._appendToBuffer(Ansi.YELLOW + 'Are you trying to run remotely?' + Ansi.RESET);
              _this2._appendToBuffer(Ansi.YELLOW + 'Path: ' + path + Ansi.RESET);
            }
            _this2._appendToBuffer(Ansi.RED + 'Original Error: ' + error.message + Ansi.RESET);
            _this2._setExecutionState(TestRunnerPanel.ExecutionState.STOPPED);
            logger.error('Error running tests: "' + error.message + '"');
            break;
          case 'stderr':
            // Color stderr output red in the console to distinguish it as error.
            _this2._appendToBuffer('' + Ansi.RED + message.data + Ansi.RESET);
            break;
        }
      })['finally'](function () {
        _this2._stopListening();
        _this2._setExecutionState(TestRunnerPanel.ExecutionState.STOPPED);
      }).subscribe();
      this._run = new TestRunModel(label, subscription.unsubscribe.bind(subscription));
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
      if (this._testSuiteModel && this._executionState === TestRunnerPanel.ExecutionState.RUNNING) {
        progressValue = this._testSuiteModel.progressPercent();
      } else {
        // If there is no running test suite, fill the progress bar because there is no progress to
        // track.
        progressValue = 100;
      }

      this._testRunnerPanel = ReactDOM.render(React.createElement(TestRunnerPanel, {
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
          (0, _assert2['default'])(this._run); // Calling `stop()` should never null the `_run` property.
          track('testrunner-stop-tests', {
            testRunner: this._run.label
          });
          dispose();
        } catch (e) {
          (0, _assert2['default'])(this._run); // Nothing in the try block should ever null the `_run` property.
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlRlc3RSdW5uZXJDb250cm9sbGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O3NCQWNzQixRQUFROzs7O0FBRTlCLElBQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQzs7ZUFDVixPQUFPLENBQUMsTUFBTSxDQUFDOztJQUE3QixVQUFVLFlBQVYsVUFBVTs7Z0JBSWIsT0FBTyxDQUFDLGdCQUFnQixDQUFDOztJQUYzQixLQUFLLGFBQUwsS0FBSztJQUNMLFFBQVEsYUFBUixRQUFROztBQUVWLElBQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0FBQy9DLElBQU0sZUFBZSxHQUFHLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO0FBQ3hELElBQU0sY0FBYyxHQUFHLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDOztBQUVuRCxJQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUM1RCxJQUFNLEVBQUUsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7O2dCQUNULE9BQU8sQ0FBQyx5QkFBeUIsQ0FBQzs7SUFBM0MsS0FBSyxhQUFMLEtBQUs7O0lBTUMsb0JBQW9CO0FBZ0JwQixXQWhCQSxvQkFBb0IsQ0FnQm5CLEtBQWlDLEVBQUUsV0FBNEIsRUFBRTswQkFoQmxFLG9CQUFvQjs7QUFpQjdCLFFBQUksS0FBSyxJQUFJLElBQUksRUFBRTtBQUNqQixXQUFLLEdBQUcsRUFBRSxDQUFDO0tBQ1o7O0FBRUQsUUFBSSxDQUFDLE1BQU0sR0FBRztBQUNaLGtCQUFZLEVBQUUsS0FBSyxDQUFDLFlBQVk7S0FDakMsQ0FBQzs7OztBQUlGLEFBQUMsUUFBSSxDQUFPLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN0RCxBQUFDLFFBQUksQ0FBTyxTQUFTLEdBQUcsSUFB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QUFDO1NBQ3pFO09BQ0Y7S0FDRjs7O1NBblhVLG9CQUFvQiIsImZpbGUiOiJUZXN0UnVubmVyQ29udHJvbGxlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtUZXN0UnVubmVyLCBNZXNzYWdlfSBmcm9tICcuLi8uLi9udWNsaWRlLXRlc3QtcnVubmVyL2xpYi9pbnRlcmZhY2VzJztcbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9udWNsaWRlLXJlbW90ZS11cmknO1xuaW1wb3J0IHR5cGUge09ic2VydmFibGV9IGZyb20gJ0ByZWFjdGl2ZXgvcnhqcyc7XG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5cbmNvbnN0IEFuc2kgPSByZXF1aXJlKCcuL0Fuc2knKTtcbmNvbnN0IHtUZXh0QnVmZmVyfSA9IHJlcXVpcmUoJ2F0b20nKTtcbmNvbnN0IHtcbiAgUmVhY3QsXG4gIFJlYWN0RE9NLFxufSA9IHJlcXVpcmUoJ3JlYWN0LWZvci1hdG9tJyk7XG5jb25zdCBUZXN0UnVuTW9kZWwgPSByZXF1aXJlKCcuL1Rlc3RSdW5Nb2RlbCcpO1xuY29uc3QgVGVzdFJ1bm5lclBhbmVsID0gcmVxdWlyZSgnLi91aS9UZXN0UnVubmVyUGFuZWwnKTtcbmNvbnN0IFRlc3RTdWl0ZU1vZGVsID0gcmVxdWlyZSgnLi9UZXN0U3VpdGVNb2RlbCcpO1xuXG5jb25zdCBsb2dnZXIgPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLWxvZ2dpbmcnKS5nZXRMb2dnZXIoKTtcbmNvbnN0IG9zID0gcmVxdWlyZSgnb3MnKTtcbmNvbnN0IHt0cmFja30gPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLWFuYWx5dGljcycpO1xuXG5leHBvcnQgdHlwZSBUZXN0UnVubmVyQ29udHJvbGxlclN0YXRlID0ge1xuICBwYW5lbFZpc2libGU/OiBib29sZWFuO1xufTtcblxuZXhwb3J0IGNsYXNzIFRlc3RSdW5uZXJDb250cm9sbGVyIHtcblxuICBfYWN0aXZlVGVzdFJ1bm5lcjogP09iamVjdDtcbiAgX2F0dGFjaERlYnVnZ2VyQmVmb3JlUnVubmluZzogYm9vbGVhbjtcbiAgX2J1ZmZlcjogVGV4dEJ1ZmZlcjtcbiAgX2V4ZWN1dGlvblN0YXRlOiBudW1iZXI7XG4gIF9wYW5lbDogP2F0b20kUGFuZWw7XG4gIF9wYXRoOiA/c3RyaW5nO1xuICBfcm9vdDogP0VsZW1lbnQ7XG4gIF9ydW46ID9UZXN0UnVuTW9kZWw7XG4gIF9ydW5uaW5nVGVzdDogYm9vbGVhbjtcbiAgX3N0YXRlOiBPYmplY3Q7XG4gIF90ZXN0UnVubmVyczogU2V0PFRlc3RSdW5uZXI+O1xuICBfdGVzdFJ1bm5lclBhbmVsOiA/VGVzdFJ1bm5lclBhbmVsO1xuICBfdGVzdFN1aXRlTW9kZWw6ID9UZXN0U3VpdGVNb2RlbDtcblxuICBjb25zdHJ1Y3RvcihzdGF0ZTogP1Rlc3RSdW5uZXJDb250cm9sbGVyU3RhdGUsIHRlc3RSdW5uZXJzOiBTZXQ8VGVzdFJ1bm5lcj4pIHtcbiAgICBpZiAoc3RhdGUgPT0gbnVsbCkge1xuICAgICAgc3RhdGUgPSB7fTtcbiAgICB9XG5cbiAgICB0aGlzLl9zdGF0ZSA9IHtcbiAgICAgIHBhbmVsVmlzaWJsZTogc3RhdGUucGFuZWxWaXNpYmxlLFxuICAgIH07XG5cbiAgICAvLyBCaW5kIEZ1bmN0aW9ucyBmb3IgdXNlIGFzIGNhbGxiYWNrcztcbiAgICAvLyBUT0RPOiBSZXBsYWNlIHdpdGggcHJvcGVydHkgaW5pdGlhbGl6ZXJzIHdoZW4gc3VwcG9ydGVkIGJ5IEZsb3c7XG4gICAgKHRoaXM6IGFueSkuY2xlYXJPdXRwdXQgPSB0aGlzLmNsZWFyT3V0cHV0LmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuaGlkZVBhbmVsID0gdGhpcy5oaWRlUGFuZWwuYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5zdG9wVGVzdHMgPSB0aGlzLnN0b3BUZXN0cy5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9oYW5kbGVDbGlja1J1biA9IHRoaXMuX2hhbmRsZUNsaWNrUnVuLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX29uRGVidWdnZXJDaGVja2JveENoYW5nZWQgPSB0aGlzLl9vbkRlYnVnZ2VyQ2hlY2tib3hDaGFuZ2VkLmJpbmQodGhpcyk7XG5cbiAgICAvLyBUT0RPOiBVc2UgdGhlIFJlYWRPbmx5VGV4dEJ1ZmZlciBjbGFzcyBmcm9tIG51Y2xpZGUtYXRvbS10ZXh0LWVkaXRvciB3aGVuIGl0IGlzIGV4cG9ydGVkLlxuICAgIHRoaXMuX2J1ZmZlciA9IG5ldyBUZXh0QnVmZmVyKCk7XG4gICAgLy8gTWFrZSBgZGVsZXRlYCBhIG5vLW9wIHRvIGVmZmVjdGl2ZWx5IGNyZWF0ZSBhIHJlYWQtb25seSBidWZmZXIuXG4gICAgKHRoaXMuX2J1ZmZlcjogT2JqZWN0KS5kZWxldGUgPSAoKSA9PiB7fTtcblxuICAgIHRoaXMuX2V4ZWN1dGlvblN0YXRlID0gVGVzdFJ1bm5lclBhbmVsLkV4ZWN1dGlvblN0YXRlLlNUT1BQRUQ7XG4gICAgdGhpcy5fdGVzdFJ1bm5lcnMgPSB0ZXN0UnVubmVycztcbiAgICB0aGlzLl9hdHRhY2hEZWJ1Z2dlckJlZm9yZVJ1bm5pbmcgPSBmYWxzZTtcbiAgICB0aGlzLl9ydW5uaW5nVGVzdCA9IGZhbHNlO1xuICAgIHRoaXMuX3JlbmRlclBhbmVsKCk7XG4gIH1cblxuICBjbGVhck91dHB1dCgpIHtcbiAgICB0aGlzLl9idWZmZXIuc2V0VGV4dCgnJyk7XG4gICAgdGhpcy5fcGF0aCA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLl9ydW4gPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5fc3RvcExpc3RlbmluZygpO1xuICAgIHRoaXMuX3Rlc3RTdWl0ZU1vZGVsID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuX3JlbmRlclBhbmVsKCk7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMuX3N0b3BMaXN0ZW5pbmcoKTtcbiAgICBpZiAodGhpcy5fcm9vdCkge1xuICAgICAgUmVhY3RET00udW5tb3VudENvbXBvbmVudEF0Tm9kZSh0aGlzLl9yb290KTtcbiAgICAgIHRoaXMuX3Jvb3QgPSBudWxsO1xuICAgIH1cbiAgICBpZiAodGhpcy5fcGFuZWwpIHtcbiAgICAgIHRoaXMuX3BhbmVsLmRlc3Ryb3koKTtcbiAgICAgIHRoaXMuX3BhbmVsID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBkaWRVcGRhdGVUZXN0UnVubmVycygpIHtcbiAgICB0aGlzLl9yZW5kZXJQYW5lbCgpO1xuICB9XG5cbiAgaGlkZVBhbmVsKCkge1xuICAgIHRoaXMuc3RvcFRlc3RzKCk7XG4gICAgdGhpcy5fc3RhdGUucGFuZWxWaXNpYmxlID0gZmFsc2U7XG4gICAgaWYgKHRoaXMuX3BhbmVsKSB7XG4gICAgICB0aGlzLl9wYW5lbC5oaWRlKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm4gQSBQcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2hlbiB0ZXN0aW5nIGhhcyBzdWNjZXNmdWxseSBzdGFydGVkLlxuICAgKi9cbiAgYXN5bmMgcnVuVGVzdHMocGF0aD86IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIElmIHRoZSB0ZXN0IHJ1bm5lciBwYW5lbCBpcyBub3QgcmVuZGVyZWQgeWV0LCBlbnN1cmUgaXQgaXMgcmVuZGVyZWQgYmVmb3JlIGNvbnRpbnVpbmcuXG4gICAgaWYgKHRoaXMuX3Rlc3RSdW5uZXJQYW5lbCA9PSBudWxsIHx8ICF0aGlzLl9zdGF0ZS5wYW5lbFZpc2libGUpIHtcbiAgICAgIGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgdGhpcy5zaG93UGFuZWwocmVzb2x2ZSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fdGVzdFJ1bm5lclBhbmVsID09IG51bGwpIHtcbiAgICAgIGxvZ2dlci5lcnJvcignVGVzdCBydW5uZXIgcGFuZWwgZGlkIG5vdCByZW5kZXIgYXMgZXhwZWN0ZWQuIEFib3J0aW5nIHRlc3RpbmcuJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gR2V0IHNlbGVjdGVkIHRlc3QgcnVubmVyIHdoZW4gRmxvdyBrbm93cyBgdGhpcy5fdGVzdFJ1bm5lclBhbmVsYCBpcyBkZWZpbmVkLlxuICAgIGNvbnN0IHNlbGVjdGVkVGVzdFJ1bm5lciA9IHRoaXMuX3Rlc3RSdW5uZXJQYW5lbC5nZXRTZWxlY3RlZFRlc3RSdW5uZXIoKTtcbiAgICBpZiAoIXNlbGVjdGVkVGVzdFJ1bm5lcikge1xuICAgICAgbG9nZ2VyLndhcm4oYE5vIHRlc3QgcnVubmVyIHNlbGVjdGVkLiBBY3RpdmUgdGVzdCBydW5uZXJzOiAke3RoaXMuX3Rlc3RSdW5uZXJzLnNpemV9YCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gMS4gVXNlIHRoZSBgcGF0aGAgYXJndW1lbnQgdG8gdGhpcyBmdW5jdGlvblxuICAgIC8vIDIuIFVzZSBgdGhpcy5fcGF0aGAgb24gdGhlIGluc3RhbmNlXG4gICAgLy8gMy4gTGV0IGB0ZXN0UGF0aGAgYmUgYHVuZGVmaW5lZGAgc28gdGhlIHBhdGggd2lsbCBiZSB0YWtlbiBmcm9tIHRoZSBhY3RpdmUgYFRleHRFZGl0b3JgXG4gICAgbGV0IHRlc3RQYXRoID0gKHBhdGggPT09IHVuZGVmaW5lZCkgPyB0aGlzLl9wYXRoIDogcGF0aDtcblxuICAgIC8vIElmIHRoZXJlJ3Mgbm8gcGF0aCB5ZXQsIGdldCB0aGUgcGF0aCBmcm9tIHRoZSBhY3RpdmUgYFRleHRFZGl0b3JgLlxuICAgIGlmICh0ZXN0UGF0aCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBjb25zdCBhY3RpdmVUZXh0RWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICAgICAgaWYgKCFhY3RpdmVUZXh0RWRpdG9yKSB7XG4gICAgICAgIGxvZ2dlci5kZWJ1ZygnQXR0ZW1wdGVkIHRvIHJ1biB0ZXN0cyB3aXRoIG5vIGFjdGl2ZSB0ZXh0IGVkaXRvci4nKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBJZiB0aGUgYWN0aXZlIHRleHQgZWRpdG9yIGhhcyBubyBwYXRoLCBiYWlsIGJlY2F1c2UgdGhlcmUncyBub3doZXJlIHRvIHJ1biB0ZXN0cy5cbiAgICAgIHRlc3RQYXRoID0gYWN0aXZlVGV4dEVkaXRvci5nZXRQYXRoKCk7XG4gICAgfVxuXG4gICAgaWYgKCF0ZXN0UGF0aCkge1xuICAgICAgbG9nZ2VyLndhcm4oJ0F0dGVtcHRlZCB0byBydW4gdGVzdHMgb24gYW4gZWRpdG9yIHdpdGggbm8gcGF0aC4nKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBJZiB0aGUgdGVzdCBydW5uZXIgaXMgZGVidWdnYWJsZSwgYW5kIHRoZSB1c2VyIGhhcyBjaGVja2VkIHRoZSBib3gsIHRoZW4gd2Ugd2lsbCBsYXVuY2hcbiAgICAvLyB0aGUgZGVidWdnZXIgYmVmb3JlIHJ1bm5pbmcgdGhlIHRlc3RzLiAgV2UgZG8gbm90IGhhbmRsZSBraWxsaW5nIHRoZSBkZWJ1Z2dlci5cbiAgICBpZiAodGhpcy5faXNTZWxlY3RlZFRlc3RSdW5uZXJEZWJ1Z2dhYmxlKCkgJiYgdGhpcy5fYXR0YWNoRGVidWdnZXJCZWZvcmVSdW5uaW5nKSB7XG4gICAgICBjb25zdCBpc0F0dGFjaGVkID0gYXdhaXQgdGhpcy5faXNEZWJ1Z2dlckF0dGFjaGVkKHNlbGVjdGVkVGVzdFJ1bm5lci5kZWJ1Z2dlclByb3ZpZGVyTmFtZSk7XG4gICAgICBpZiAoIWlzQXR0YWNoZWQpIHtcbiAgICAgICAgYXdhaXQgc2VsZWN0ZWRUZXN0UnVubmVyLmF0dGFjaERlYnVnZ2VyKHRlc3RQYXRoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBJZiB0aGUgdXNlciBoYXMgY2FuY2VsbGVkIHRoZSB0ZXN0IHJ1biB3aGlsZSBjb250cm9sIHdhcyB5aWVsZGVkLCB3ZSBzaG91bGQgbm90IHJ1biB0aGUgdGVzdC5cbiAgICBpZiAoIXRoaXMuX3J1bm5pbmdUZXN0KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5jbGVhck91dHB1dCgpO1xuICAgIHRoaXMuX3J1blRlc3RSdW5uZXJTZXJ2aWNlRm9yUGF0aChcbiAgICAgIHNlbGVjdGVkVGVzdFJ1bm5lci5ydW5UZXN0KHRlc3RQYXRoKSxcbiAgICAgIHRlc3RQYXRoLFxuICAgICAgc2VsZWN0ZWRUZXN0UnVubmVyLmxhYmVsKTtcbiAgICB0cmFjaygndGVzdHJ1bm5lci1ydW4tdGVzdHMnLCB7XG4gICAgICBwYXRoOiB0ZXN0UGF0aCxcbiAgICAgIHRlc3RSdW5uZXI6IHNlbGVjdGVkVGVzdFJ1bm5lci5sYWJlbCxcbiAgICB9KTtcblxuICAgIC8vIFNldCBzdGF0ZSBhcyBcIlJ1bm5pbmdcIiB0byBnaXZlIGltbWVkaWF0ZSBmZWVkYmFjayBpbiB0aGUgVUkuXG4gICAgdGhpcy5fc2V0RXhlY3V0aW9uU3RhdGUoVGVzdFJ1bm5lclBhbmVsLkV4ZWN1dGlvblN0YXRlLlJVTk5JTkcpO1xuICAgIHRoaXMuX3BhdGggPSB0ZXN0UGF0aDtcbiAgICB0aGlzLl9yZW5kZXJQYW5lbCgpO1xuICB9XG5cbiAgX2lzU2VsZWN0ZWRUZXN0UnVubmVyRGVidWdnYWJsZSgpOiBib29sZWFuIHtcbiAgICBpZiAodGhpcy5fdGVzdFJ1bm5lclBhbmVsID09IG51bGwpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgY29uc3Qgc2VsZWN0ZWRUZXN0UnVubmVyID0gdGhpcy5fdGVzdFJ1bm5lclBhbmVsLmdldFNlbGVjdGVkVGVzdFJ1bm5lcigpO1xuICAgIHJldHVybiBzZWxlY3RlZFRlc3RSdW5uZXIgIT0gbnVsbCAmJiBzZWxlY3RlZFRlc3RSdW5uZXIuYXR0YWNoRGVidWdnZXIgIT0gbnVsbDtcbiAgfVxuXG4gIGFzeW5jIF9pc0RlYnVnZ2VyQXR0YWNoZWQoZGVidWdnZXJQcm92aWRlck5hbWU6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IGRlYnVnZ2VyU2VydmljZSA9IGF3YWl0IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtc2VydmljZS1odWItcGx1cycpXG4gICAgICAuY29uc3VtZUZpcnN0UHJvdmlkZXIoJ251Y2xpZGUtZGVidWdnZXIucmVtb3RlJyk7XG4gICAgcmV0dXJuIGRlYnVnZ2VyU2VydmljZS5pc0luRGVidWdnaW5nTW9kZShkZWJ1Z2dlclByb3ZpZGVyTmFtZSk7XG4gIH1cblxuICBzdG9wVGVzdHMoKTogdm9pZCB7XG4gICAgLy8gUmVzdW1lIHRoZSBkZWJ1Z2dlciBpZiBuZWVkZWQuXG4gICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChcbiAgICAgIGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSksXG4gICAgICAnbnVjbGlkZS1kZWJ1Z2dlcjpjb250aW51ZS1kZWJ1Z2dpbmcnLFxuICAgICk7XG4gICAgaWYgKHRoaXMuX3J1blRlc3RzU3Vic2NyaXB0aW9uICE9IG51bGwpIHtcbiAgICAgIHRoaXMuX3J1blRlc3RzU3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgICB9XG4gICAgdGhpcy5fc3RvcExpc3RlbmluZygpO1xuICAgIC8vIFJlc3BvbmQgaW4gdGhlIFVJIGltbWVkaWF0ZWx5IGFuZCBhc3N1bWUgdGhlIHByb2Nlc3MgaXMgcHJvcGVybHkga2lsbGVkLlxuICAgIHRoaXMuX3NldEV4ZWN1dGlvblN0YXRlKFRlc3RSdW5uZXJQYW5lbC5FeGVjdXRpb25TdGF0ZS5TVE9QUEVEKTtcbiAgfVxuXG4gIHNlcmlhbGl6ZSgpOiBUZXN0UnVubmVyQ29udHJvbGxlclN0YXRlIHtcbiAgICByZXR1cm4gdGhpcy5fc3RhdGU7XG4gIH1cblxuICBzaG93UGFuZWwoZGlkUmVuZGVyPzogKCkgPT4gbWl4ZWQpOiB2b2lkIHtcbiAgICB0cmFjaygndGVzdHJ1bm5lci1zaG93LXBhbmVsJyk7XG4gICAgdGhpcy5fc3RhdGUucGFuZWxWaXNpYmxlID0gdHJ1ZTtcbiAgICB0aGlzLl9yZW5kZXJQYW5lbChkaWRSZW5kZXIpO1xuICAgIGlmICh0aGlzLl9wYW5lbCkge1xuICAgICAgdGhpcy5fcGFuZWwuc2hvdygpO1xuICAgIH1cbiAgfVxuXG4gIHRvZ2dsZVBhbmVsKCk6IHZvaWQge1xuICAgIHRyYWNrKCd0ZXN0cnVubmVyLWhpZGUtcGFuZWwnKTtcbiAgICBpZiAodGhpcy5fc3RhdGUucGFuZWxWaXNpYmxlKSB7XG4gICAgICB0aGlzLmhpZGVQYW5lbCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnNob3dQYW5lbCgpO1xuICAgIH1cbiAgfVxuXG4gIGlzVmlzaWJsZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fc3RhdGUucGFuZWxWaXNpYmxlO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgYW4gZW5kLW9mLWxpbmUgY2hhcmFjdGVyIHRvIGB0ZXh0YCBhbmQgYXBwZW5kcyB0aGUgcmVzdWx0aW5nIHN0cmluZyB0byB0aGlzIGNvbnRyb2xsZXInc1xuICAgKiB0ZXh0IGJ1ZmZlci5cbiAgICovXG4gIF9hcHBlbmRUb0J1ZmZlcih0ZXh0OiBzdHJpbmcpOiB2b2lkIHtcbiAgICAvLyBgdW5kbzogJ3NraXAnYCBkaXNhYmxlcyB0aGUgVGV4dEVkaXRvcidzIFwidW5kbyBzeXN0ZW1cIi4gU2luY2UgdGhlIGJ1ZmZlciBpcyBtYW5hZ2VkIGJ5IHRoaXNcbiAgICAvLyBjbGFzcywgYW4gdW5kbyB3aWxsIG5ldmVyIGhhcHBlbi4gRGlzYWJsZSBpdCB3aGVuIGFwcGVuZGluZyB0byBwcmV2ZW50IGRvaW5nIHVubmVlZGVkXG4gICAgLy8gYm9va2tlZXBpbmcuXG4gICAgLy9cbiAgICAvLyBAc2VlIHtAbGluayBodHRwczovL2F0b20uaW8vZG9jcy9hcGkvdjEuMC40L1RleHRCdWZmZXIjaW5zdGFuY2UtYXBwZW5kfFRleHRCdWZmZXI6OmFwcGVuZH1cbiAgICB0aGlzLl9idWZmZXIuYXBwZW5kKGAke3RleHR9JHtvcy5FT0x9YCwge3VuZG86ICdza2lwJ30pO1xuICB9XG5cbiAgX29uRGVidWdnZXJDaGVja2JveENoYW5nZWQoaXNDaGVja2VkOiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5fYXR0YWNoRGVidWdnZXJCZWZvcmVSdW5uaW5nID0gaXNDaGVja2VkO1xuICAgIHRoaXMuX3JlbmRlclBhbmVsKCk7XG4gIH1cblxuICBfaGFuZGxlQ2xpY2tSdW4oZXZlbnQ6IFN5bnRoZXRpY01vdXNlRXZlbnQpOiB2b2lkIHtcbiAgICB0aGlzLl9ydW5uaW5nVGVzdCA9IHRydWU7XG4gICAgLy8gRG9uJ3QgcGFzcyBhIHJlZmVyZW5jZSB0byBgcnVuVGVzdHNgIGRpcmVjdGx5IGJlY2F1c2UgdGhlIGNhbGxiYWNrIHJlY2VpdmVzIGEgbW91c2UgZXZlbnQgYXNcbiAgICAvLyBpdHMgYXJndW1lbnQuIGBydW5UZXN0c2AgbmVlZHMgdG8gYmUgY2FsbGVkIHdpdGggbm8gYXJndW1lbnRzLlxuICAgIHRoaXMucnVuVGVzdHMoKTtcbiAgfVxuXG4gIF9ydW5UZXN0UnVubmVyU2VydmljZUZvclBhdGgodGVzdFJ1bjogT2JzZXJ2YWJsZTxNZXNzYWdlPiwgcGF0aDogTnVjbGlkZVVyaSwgbGFiZWw6IHN0cmluZyk6XG4gICAgICB2b2lkIHtcbiAgICBjb25zdCBzdWJzY3JpcHRpb24gPSB0ZXN0UnVuXG4gICAgICAuZG8oKG1lc3NhZ2U6IE1lc3NhZ2UpID0+IHtcbiAgICAgICAgc3dpdGNoIChtZXNzYWdlLmtpbmQpIHtcbiAgICAgICAgICBjYXNlICdzdW1tYXJ5JzpcbiAgICAgICAgICAgIHRoaXMuX3Rlc3RTdWl0ZU1vZGVsID0gbmV3IFRlc3RTdWl0ZU1vZGVsKG1lc3NhZ2Uuc3VtbWFyeUluZm8pO1xuICAgICAgICAgICAgdGhpcy5fcmVuZGVyUGFuZWwoKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ3J1bi10ZXN0JzpcbiAgICAgICAgICAgIGNvbnN0IHRlc3RJbmZvID0gbWVzc2FnZS50ZXN0SW5mbztcbiAgICAgICAgICAgIGlmICh0aGlzLl90ZXN0U3VpdGVNb2RlbCkge1xuICAgICAgICAgICAgICB0aGlzLl90ZXN0U3VpdGVNb2RlbC5hZGRUZXN0UnVuKHRlc3RJbmZvKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gSWYgYSB0ZXN0IHJ1biB0aHJvd3MgYW4gZXhjZXB0aW9uLCB0aGUgc3RhY2sgdHJhY2UgaXMgcmV0dXJuZWQgaW4gJ2RldGFpbHMnLlxuICAgICAgICAgICAgLy8gQXBwZW5kIGl0cyBlbnRpcmV0eSB0byB0aGUgY29uc29sZS5cbiAgICAgICAgICAgIGlmICh0ZXN0SW5mby5oYXNPd25Qcm9wZXJ0eSgnZGV0YWlscycpICYmIHRlc3RJbmZvLmRldGFpbHMgIT09ICcnKSB7XG4gICAgICAgICAgICAgIC8vICRGbG93Rml4TWUocGV0ZXJoYWwpXG4gICAgICAgICAgICAgIHRoaXMuX2FwcGVuZFRvQnVmZmVyKHRlc3RJbmZvLmRldGFpbHMpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBBcHBlbmQgYSBQQVNTL0ZBSUwgbWVzc2FnZSBkZXBlbmRpbmcgb24gd2hldGhlciB0aGUgY2xhc3MgaGFzIHRlc3QgZmFpbHVyZXMuXG4gICAgICAgICAgICB0aGlzLl9hcHBlbmRUb0J1ZmZlcihUZXN0UnVuTW9kZWwuZm9ybWF0U3RhdHVzTWVzc2FnZShcbiAgICAgICAgICAgICAgdGVzdEluZm8ubmFtZSxcbiAgICAgICAgICAgICAgdGVzdEluZm8uZHVyYXRpb25TZWNzLFxuICAgICAgICAgICAgICB0ZXN0SW5mby5zdGF0dXNcbiAgICAgICAgICAgICkpO1xuICAgICAgICAgICAgdGhpcy5fcmVuZGVyUGFuZWwoKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ3N0YXJ0JzpcbiAgICAgICAgICAgIGlmICh0aGlzLl9ydW4pIHtcbiAgICAgICAgICAgICAgdGhpcy5fcnVuLnN0YXJ0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdlcnJvcic6XG4gICAgICAgICAgICBjb25zdCBlcnJvciA9IG1lc3NhZ2UuZXJyb3I7XG4gICAgICAgICAgICBpZiAodGhpcy5fcnVuKSB7XG4gICAgICAgICAgICAgIHRoaXMuX3J1bi5zdG9wKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZXJyb3IuY29kZSA9PT0gJ0VOT0VOVCcpIHtcbiAgICAgICAgICAgICAgdGhpcy5fYXBwZW5kVG9CdWZmZXIoXG4gICAgICAgICAgICAgICAgYCR7QW5zaS5ZRUxMT1d9Q29tbWFuZCAnJHtlcnJvci5wYXRofScgZG9lcyBub3QgZXhpc3Qke0Fuc2kuUkVTRVR9YCk7XG4gICAgICAgICAgICAgIHRoaXMuX2FwcGVuZFRvQnVmZmVyKGAke0Fuc2kuWUVMTE9XfUFyZSB5b3UgdHJ5aW5nIHRvIHJ1biByZW1vdGVseT8ke0Fuc2kuUkVTRVR9YCk7XG4gICAgICAgICAgICAgIHRoaXMuX2FwcGVuZFRvQnVmZmVyKGAke0Fuc2kuWUVMTE9XfVBhdGg6ICR7cGF0aH0ke0Fuc2kuUkVTRVR9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl9hcHBlbmRUb0J1ZmZlcihgJHtBbnNpLlJFRH1PcmlnaW5hbCBFcnJvcjogJHtlcnJvci5tZXNzYWdlfSR7QW5zaS5SRVNFVH1gKTtcbiAgICAgICAgICAgIHRoaXMuX3NldEV4ZWN1dGlvblN0YXRlKFRlc3RSdW5uZXJQYW5lbC5FeGVjdXRpb25TdGF0ZS5TVE9QUEVEKTtcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcihgRXJyb3IgcnVubmluZyB0ZXN0czogXCIke2Vycm9yLm1lc3NhZ2V9XCJgKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ3N0ZGVycic6XG4gICAgICAgICAgICAvLyBDb2xvciBzdGRlcnIgb3V0cHV0IHJlZCBpbiB0aGUgY29uc29sZSB0byBkaXN0aW5ndWlzaCBpdCBhcyBlcnJvci5cbiAgICAgICAgICAgIHRoaXMuX2FwcGVuZFRvQnVmZmVyKGAke0Fuc2kuUkVEfSR7bWVzc2FnZS5kYXRhfSR7QW5zaS5SRVNFVH1gKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgLmZpbmFsbHkoKCkgPT4ge1xuICAgICAgICB0aGlzLl9zdG9wTGlzdGVuaW5nKCk7XG4gICAgICAgIHRoaXMuX3NldEV4ZWN1dGlvblN0YXRlKFRlc3RSdW5uZXJQYW5lbC5FeGVjdXRpb25TdGF0ZS5TVE9QUEVEKTtcbiAgICAgIH0pXG4gICAgICAuc3Vic2NyaWJlKCk7XG4gICAgdGhpcy5fcnVuID0gbmV3IFRlc3RSdW5Nb2RlbChsYWJlbCwgc3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlLmJpbmQoc3Vic2NyaXB0aW9uKSk7XG4gIH1cblxuICBfc2V0RXhlY3V0aW9uU3RhdGUoZXhlY3V0aW9uU3RhdGU6IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMuX2V4ZWN1dGlvblN0YXRlID0gZXhlY3V0aW9uU3RhdGU7XG4gICAgdGhpcy5fcmVuZGVyUGFuZWwoKTtcbiAgfVxuXG4gIF9yZW5kZXJQYW5lbChkaWRSZW5kZXI/OiAoKSA9PiBtaXhlZCkge1xuICAgIC8vIEluaXRpYWxpemUgYW5kIHJlbmRlciB0aGUgY29udGVudHMgb2YgdGhlIHBhbmVsIG9ubHkgaWYgdGhlIGhvc3RpbmcgY29udGFpbmVyIGlzIHZpc2libGUgYnlcbiAgICAvLyB0aGUgdXNlcidzIGNob2ljZS5cbiAgICBpZiAoIXRoaXMuX3N0YXRlLnBhbmVsVmlzaWJsZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCByb290ID0gdGhpcy5fcm9vdDtcblxuICAgIGlmICghcm9vdCkge1xuICAgICAgcm9vdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgdGhpcy5fcm9vdCA9IHJvb3Q7XG4gICAgfVxuXG4gICAgbGV0IHByb2dyZXNzVmFsdWU7XG4gICAgaWYgICh0aGlzLl90ZXN0U3VpdGVNb2RlbCAmJiB0aGlzLl9leGVjdXRpb25TdGF0ZSA9PT0gVGVzdFJ1bm5lclBhbmVsLkV4ZWN1dGlvblN0YXRlLlJVTk5JTkcpIHtcbiAgICAgIHByb2dyZXNzVmFsdWUgPSB0aGlzLl90ZXN0U3VpdGVNb2RlbC5wcm9ncmVzc1BlcmNlbnQoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gSWYgdGhlcmUgaXMgbm8gcnVubmluZyB0ZXN0IHN1aXRlLCBmaWxsIHRoZSBwcm9ncmVzcyBiYXIgYmVjYXVzZSB0aGVyZSBpcyBubyBwcm9ncmVzcyB0b1xuICAgICAgLy8gdHJhY2suXG4gICAgICBwcm9ncmVzc1ZhbHVlID0gMTAwO1xuICAgIH1cblxuICAgIHRoaXMuX3Rlc3RSdW5uZXJQYW5lbCA9IFJlYWN0RE9NLnJlbmRlcihcbiAgICAgIDxUZXN0UnVubmVyUGFuZWxcbiAgICAgICAgYXR0YWNoRGVidWdnZXJCZWZvcmVSdW5uaW5nPXt0aGlzLl9hdHRhY2hEZWJ1Z2dlckJlZm9yZVJ1bm5pbmd9XG4gICAgICAgIGJ1ZmZlcj17dGhpcy5fYnVmZmVyfVxuICAgICAgICBleGVjdXRpb25TdGF0ZT17dGhpcy5fZXhlY3V0aW9uU3RhdGV9XG4gICAgICAgIG9uQ2xpY2tDbGVhcj17dGhpcy5jbGVhck91dHB1dH1cbiAgICAgICAgb25DbGlja0Nsb3NlPXt0aGlzLmhpZGVQYW5lbH1cbiAgICAgICAgb25DbGlja1J1bj17dGhpcy5faGFuZGxlQ2xpY2tSdW59XG4gICAgICAgIG9uQ2xpY2tTdG9wPXt0aGlzLnN0b3BUZXN0c31cbiAgICAgICAgb25EZWJ1Z2dlckNoZWNrYm94Q2hhbmdlZD17dGhpcy5fb25EZWJ1Z2dlckNoZWNrYm94Q2hhbmdlZH1cbiAgICAgICAgcGF0aD17dGhpcy5fcGF0aH1cbiAgICAgICAgcHJvZ3Jlc3NWYWx1ZT17cHJvZ3Jlc3NWYWx1ZX1cbiAgICAgICAgcnVuRHVyYXRpb249e3RoaXMuX3J1biAmJiB0aGlzLl9ydW4uZ2V0RHVyYXRpb24oKX1cbiAgICAgICAgLy8gYFRlc3RSdW5uZXJQYW5lbGAgZXhwZWN0cyBhbiBBcnJheSBzbyBpdCBjYW4gcmVuZGVyIHRoZSB0ZXN0IHJ1bm5lcnMgaW4gYSBkcm9wZG93biBhbmRcbiAgICAgICAgLy8gbWFpbnRhaW4gYSBzZWxlY3RlZCBpbmRleC4gYFNldGAgbWFpbnRhaW5zIGl0ZW1zIGluIGluc2VydGlvbiBvcmRlciwgc28gdGhlIG9yZGVyaW5nIGlzXG4gICAgICAgIC8vIGRldGVybWluYXRlIG9uIGVhY2ggcmVuZGVyLlxuICAgICAgICB0ZXN0UnVubmVycz17QXJyYXkuZnJvbSh0aGlzLl90ZXN0UnVubmVycyl9XG4gICAgICAgIHRlc3RTdWl0ZU1vZGVsPXt0aGlzLl90ZXN0U3VpdGVNb2RlbH1cbiAgICAgIC8+LFxuICAgICAgcm9vdCxcbiAgICAgIGRpZFJlbmRlclxuICAgICk7XG5cbiAgICBpZiAoIXRoaXMuX3BhbmVsKSB7XG4gICAgICB0aGlzLl9wYW5lbCA9IGF0b20ud29ya3NwYWNlLmFkZEJvdHRvbVBhbmVsKHtpdGVtOiByb290LCB2aXNpYmxlOiB0aGlzLl9zdGF0ZS5wYW5lbFZpc2libGV9KTtcbiAgICB9XG4gIH1cblxuICBfc3RvcExpc3RlbmluZygpOiB2b2lkIHtcbiAgICB0aGlzLl9ydW5uaW5nVGVzdCA9IGZhbHNlO1xuICAgIGlmICh0aGlzLl9ydW4gJiYgKHRoaXMuX3J1bi5kaXNwb3NlICE9IG51bGwpKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBkaXNwb3NlID0gdGhpcy5fcnVuLmRpc3Bvc2U7XG4gICAgICAgIHRoaXMuX3J1bi5kaXNwb3NlID0gbnVsbDtcbiAgICAgICAgdGhpcy5fcnVuLnN0b3AoKTtcbiAgICAgICAgaW52YXJpYW50KHRoaXMuX3J1bik7IC8vIENhbGxpbmcgYHN0b3AoKWAgc2hvdWxkIG5ldmVyIG51bGwgdGhlIGBfcnVuYCBwcm9wZXJ0eS5cbiAgICAgICAgdHJhY2soJ3Rlc3RydW5uZXItc3RvcC10ZXN0cycsIHtcbiAgICAgICAgICB0ZXN0UnVubmVyOiB0aGlzLl9ydW4ubGFiZWwsXG4gICAgICAgIH0pO1xuICAgICAgICBkaXNwb3NlKCk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGludmFyaWFudCh0aGlzLl9ydW4pOyAvLyBOb3RoaW5nIGluIHRoZSB0cnkgYmxvY2sgc2hvdWxkIGV2ZXIgbnVsbCB0aGUgYF9ydW5gIHByb3BlcnR5LlxuICAgICAgICAvLyBJZiB0aGUgcmVtb3RlIGNvbm5lY3Rpb24gZ29lcyBhd2F5LCBpdCB3b24ndCBiZSBwb3NzaWJsZSB0byBzdG9wIHRlc3RzLiBMb2cgYW4gZXJyb3IgYW5kXG4gICAgICAgIC8vIHByb2NlZWQgYXMgdXN1YWwuXG4gICAgICAgIGxvZ2dlci5lcnJvcihgRXJyb3Igd2hlbiBzdG9wcGluZyB0ZXN0IHJ1biAjJyR7dGhpcy5fcnVuLmxhYmVsfTogJHtlfWApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG59XG4iXX0=