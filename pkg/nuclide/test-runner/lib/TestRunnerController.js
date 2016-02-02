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

var _require3 = require('../../commons');

var array = _require3.array;

var logger = require('../../logging').getLogger();
var os = require('os');

var _require4 = require('../../analytics');

var track = _require4.track;

var TestRunnerController = (function () {
  function TestRunnerController(state, testRunners) {
    _classCallCheck(this, TestRunnerController);

    if (state == null) {
      state = {};
    }

    this._state = {
      panelVisible: state.panelVisible
    };

    // TODO: Use the ReadOnlyTextBuffer class from nuclide-atom-text-editor when it is exported.
    this._buffer = new TextBuffer();
    // Make `delete` a no-op to effectively create a read-only buffer.
    this._buffer['delete'] = function () {};

    this._executionState = TestRunnerPanel.ExecutionState.STOPPED;
    this._testRunners = testRunners;
    this._renderPanel();

    // Bind Functions for use as callbacks;
    // TODO: Replace with property initializers when supported by Flow;
    this.clearOutput = this.clearOutput.bind(this);
    this.hidePanel = this.hidePanel.bind(this);
    this.stopTests = this.stopTests.bind(this);
    this._handleClickRun = this._handleClickRun.bind(this);
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
    key: 'stopTests',
    value: function stopTests() {
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
    key: '_handleClickRun',
    value: function _handleClickRun(event) {
      // Don't pass a reference to `runTests` directly because the callback receives a mouse event as
      // its argument. `runTests` needs to be called with no arguments.
      this.runTests();
    }
  }, {
    key: '_runTestRunnerServiceForPath',
    value: function _runTestRunnerServiceForPath(testRun, path, label) {
      var _this2 = this;

      var subscription = testRun.doOnNext(function (message) {
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
      this._run = new TestRunModel(label, subscription.dispose.bind(subscription));
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
        buffer: this._buffer,
        executionState: this._executionState,
        onClickClear: this.clearOutput,
        onClickClose: this.hidePanel,
        onClickRun: this._handleClickRun,
        onClickStop: this.stopTests,
        path: this._path,
        progressValue: progressValue,
        runDuration: this._run && this._run.getDuration(),
        // `TestRunnerPanel` expects an Array so it can render the test runners in a dropdown and
        // maintain a selected index. `Set` maintains items in insertion order, so the ordering is
        // determinate on each render.
        testRunners: array.from(this._testRunners),
        testSuiteModel: this._testSuiteModel
      }), root, didRender);

      if (!this._panel) {
        this._panel = atom.workspace.addBottomPanel({ item: root, visible: this._state.panelVisible });
      }
    }
  }, {
    key: '_stopListening',
    value: function _stopListening() {
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

module.exports = TestRunnerController;

// Bound Functions for use as callbacks.
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlRlc3RSdW5uZXJDb250cm9sbGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O3NCQWNzQixRQUFROzs7O0FBRTlCLElBQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQzs7ZUFDVixPQUFPLENBQUMsTUFBTSxDQUFDOztJQUE3QixVQUFVLFlBQVYsVUFBVTs7Z0JBSWIsT0FBTyxDQUFDLGdCQUFnQixDQUFDOztJQUYzQixLQUFLLGFBQUwsS0FBSztJQUNMLFFBQVEsYUFBUixRQUFROztBQUVWLElBQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0FBQy9DLElBQU0sZUFBZSxHQUFHLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO0FBQ3hELElBQU0sY0FBYyxHQUFHLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDOztnQkFFbkMsT0FBTyxDQUFDLGVBQWUsQ0FBQzs7SUFBakMsS0FBSyxhQUFMLEtBQUs7O0FBQ1osSUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDO0FBQ3BELElBQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQzs7Z0JBQ1QsT0FBTyxDQUFDLGlCQUFpQixDQUFDOztJQUFuQyxLQUFLLGFBQUwsS0FBSzs7SUFNTixvQkFBb0I7QUFvQmIsV0FwQlAsb0JBQW9CLENBb0JaLEtBQWlDLEVBQUUsV0FBNEIsRUFBRTswQkFwQnpFLG9CQUFvQjs7QUFxQnRCLFFBQUksS0FBSyxJQUFJLElBQUksRUFBRTtBQUNqQixXQUFLLEdBQUcsRUFBRSxDQUFDO0tBQ1o7O0FBRUQsUUFBSSxDQUFDLE1BQU0sR0FBRztBQUNaLGtCQUFZLEVBQUUsS0FBSyxDQUFDLFlBQVk7S0FDakMsQ0FBQzs7O0FBR0YsUUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFDOztBQUVoQyxBQUFDLFFBQUksQ0FB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QVM7QUFDckIsVUFBSSxJQUFJLENBQUMsSUFBSSxJQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksQUFBQyxFQUFFO0FBQzVDLFlBQUk7QUFDRixjQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztBQUNsQyxjQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7QUFDekIsY0FBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNqQixtQ0FBVSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDckIsZUFBSyxDQUFDLHVCQUF1QixFQUFFO0FBQzdCLHNCQUFVLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLO1dBQzVCLENBQUMsQ0FBQztBQUNILGlCQUFPLEVBQUUsQ0FBQztTQUNYLENBQUMsT0FBTyxDQUFDLEVBQUU7QUFDVixtQ0FBVSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7OztBQUdyQixnQkFBTSxDQUFDLEtBQUssc0NBQW1DLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxVQUFLLENBQUMsQ0FBRyxDQUFDO1NBQ3pFO09BQ0Y7S0FDRjs7O1NBcFVHLG9CQUFvQjs7O0FBd1UxQixNQUFNLENBQUMsT0FBTyxHQUFHLG9CQUFvQixDQUFDIiwiZmlsZSI6IlRlc3RSdW5uZXJDb250cm9sbGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge1Rlc3RSdW5uZXIsIE1lc3NhZ2V9IGZyb20gJy4uLy4uL3Rlc3QtcnVubmVyLWludGVyZmFjZXMnO1xuaW1wb3J0IHR5cGUge051Y2xpZGVVcml9IGZyb20gJy4uLy4uL3JlbW90ZS11cmknO1xuaW1wb3J0IHR5cGUge09ic2VydmFibGV9IGZyb20gJ3J4JztcbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcblxuY29uc3QgQW5zaSA9IHJlcXVpcmUoJy4vQW5zaScpO1xuY29uc3Qge1RleHRCdWZmZXJ9ID0gcmVxdWlyZSgnYXRvbScpO1xuY29uc3Qge1xuICBSZWFjdCxcbiAgUmVhY3RET00sXG59ID0gcmVxdWlyZSgncmVhY3QtZm9yLWF0b20nKTtcbmNvbnN0IFRlc3RSdW5Nb2RlbCA9IHJlcXVpcmUoJy4vVGVzdFJ1bk1vZGVsJyk7XG5jb25zdCBUZXN0UnVubmVyUGFuZWwgPSByZXF1aXJlKCcuL3VpL1Rlc3RSdW5uZXJQYW5lbCcpO1xuY29uc3QgVGVzdFN1aXRlTW9kZWwgPSByZXF1aXJlKCcuL1Rlc3RTdWl0ZU1vZGVsJyk7XG5cbmNvbnN0IHthcnJheX0gPSByZXF1aXJlKCcuLi8uLi9jb21tb25zJyk7XG5jb25zdCBsb2dnZXIgPSByZXF1aXJlKCcuLi8uLi9sb2dnaW5nJykuZ2V0TG9nZ2VyKCk7XG5jb25zdCBvcyA9IHJlcXVpcmUoJ29zJyk7XG5jb25zdCB7dHJhY2t9ID0gcmVxdWlyZSgnLi4vLi4vYW5hbHl0aWNzJyk7XG5cbmV4cG9ydCB0eXBlIFRlc3RSdW5uZXJDb250cm9sbGVyU3RhdGUgPSB7XG4gIHBhbmVsVmlzaWJsZT86IGJvb2xlYW47XG59O1xuXG5jbGFzcyBUZXN0UnVubmVyQ29udHJvbGxlciB7XG5cbiAgX2FjdGl2ZVRlc3RSdW5uZXI6ID9PYmplY3Q7XG4gIF9idWZmZXI6IFRleHRCdWZmZXI7XG4gIF9leGVjdXRpb25TdGF0ZTogbnVtYmVyO1xuICBfcGFuZWw6ID9hdG9tJFBhbmVsO1xuICBfcGF0aDogP3N0cmluZztcbiAgX3Jvb3Q6ID9FbGVtZW50O1xuICBfcnVuOiA/VGVzdFJ1bk1vZGVsO1xuICBfc3RhdGU6IE9iamVjdDtcbiAgX3Rlc3RSdW5uZXJzOiBTZXQ8VGVzdFJ1bm5lcj47XG4gIF90ZXN0UnVubmVyUGFuZWw6ID9UZXN0UnVubmVyUGFuZWw7XG4gIF90ZXN0U3VpdGVNb2RlbDogP1Rlc3RTdWl0ZU1vZGVsO1xuXG4gIC8vIEJvdW5kIEZ1bmN0aW9ucyBmb3IgdXNlIGFzIGNhbGxiYWNrcy5cbiAgY2xlYXJPdXRwdXQ6IEZ1bmN0aW9uO1xuICBoaWRlUGFuZWw6IEZ1bmN0aW9uO1xuICBzdG9wVGVzdHM6IEZ1bmN0aW9uO1xuICBfaGFuZGxlQ2xpY2tSdW46IEZ1bmN0aW9uO1xuXG4gIGNvbnN0cnVjdG9yKHN0YXRlOiA/VGVzdFJ1bm5lckNvbnRyb2xsZXJTdGF0ZSwgdGVzdFJ1bm5lcnM6IFNldDxUZXN0UnVubmVyPikge1xuICAgIGlmIChzdGF0ZSA9PSBudWxsKSB7XG4gICAgICBzdGF0ZSA9IHt9O1xuICAgIH1cblxuICAgIHRoaXMuX3N0YXRlID0ge1xuICAgICAgcGFuZWxWaXNpYmxlOiBzdGF0ZS5wYW5lbFZpc2libGUsXG4gICAgfTtcblxuICAgIC8vIFRPRE86IFVzZSB0aGUgUmVhZE9ubHlUZXh0QnVmZmVyIGNsYXNzIGZyb20gbnVjbGlkZS1hdG9tLXRleHQtZWRpdG9yIHdoZW4gaXQgaXMgZXhwb3J0ZWQuXG4gICAgdGhpcy5fYnVmZmVyID0gbmV3IFRleHRCdWZmZXIoKTtcbiAgICAvLyBNYWtlIGBkZWxldGVgIGEgbm8tb3AgdG8gZWZmZWN0aXZlbHkgY3JlYXRlIGEgcmVhZC1vbmx5IGJ1ZmZlci5cbiAgICAodGhpcy5fYnVmZmVyOiBPYmplY3QpLmRlbGV0ZSA9ICgpID0+IHt9O1xuXG4gICAgdGhpcy5fZXhlY3V0aW9uU3RhdGUgPSBUZXN0UnVubmVyUGFuZWwuRXhlY3V0aW9uU3RhdGUuU1RPUFBFRDtcbiAgICB0aGlzLl90ZXN0UnVubmVycyA9IHRlc3RSdW5uZXJzO1xuICAgIHRoaXMuX3JlbmRlclBhbmVsKCk7XG5cbiAgICAvLyBCaW5kIEZ1bmN0aW9ucyBmb3IgdXNlIGFzIGNhbGxiYWNrcztcbiAgICAvLyBUT0RPOiBSZXBsYWNlIHdpdGggcHJvcGVydHkgaW5pdGlhbGl6ZXJzIHdoZW4gc3VwcG9ydGVkIGJ5IEZsb3c7XG4gICAgdGhpcy5jbGVhck91dHB1dCA9IHRoaXMuY2xlYXJPdXRwdXQuYmluZCh0aGlzKTtcbiAgICB0aGlzLmhpZGVQYW5lbCA9IHRoaXMuaGlkZVBhbmVsLmJpbmQodGhpcyk7XG4gICAgdGhpcy5zdG9wVGVzdHMgPSB0aGlzLnN0b3BUZXN0cy5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX2hhbmRsZUNsaWNrUnVuID0gdGhpcy5faGFuZGxlQ2xpY2tSdW4uYmluZCh0aGlzKTtcbiAgfVxuXG4gIGNsZWFyT3V0cHV0KCkge1xuICAgIHRoaXMuX2J1ZmZlci5zZXRUZXh0KCcnKTtcbiAgICB0aGlzLl9wYXRoID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuX3J1biA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLl9zdG9wTGlzdGVuaW5nKCk7XG4gICAgdGhpcy5fdGVzdFN1aXRlTW9kZWwgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5fcmVuZGVyUGFuZWwoKTtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5fc3RvcExpc3RlbmluZygpO1xuICAgIGlmICh0aGlzLl9yb290KSB7XG4gICAgICBSZWFjdERPTS51bm1vdW50Q29tcG9uZW50QXROb2RlKHRoaXMuX3Jvb3QpO1xuICAgICAgdGhpcy5fcm9vdCA9IG51bGw7XG4gICAgfVxuICAgIGlmICh0aGlzLl9wYW5lbCkge1xuICAgICAgdGhpcy5fcGFuZWwuZGVzdHJveSgpO1xuICAgICAgdGhpcy5fcGFuZWwgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIGRpZFVwZGF0ZVRlc3RSdW5uZXJzKCkge1xuICAgIHRoaXMuX3JlbmRlclBhbmVsKCk7XG4gIH1cblxuICBoaWRlUGFuZWwoKSB7XG4gICAgdGhpcy5zdG9wVGVzdHMoKTtcbiAgICB0aGlzLl9zdGF0ZS5wYW5lbFZpc2libGUgPSBmYWxzZTtcbiAgICBpZiAodGhpcy5fcGFuZWwpIHtcbiAgICAgIHRoaXMuX3BhbmVsLmhpZGUoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybiBBIFByb21pc2UgdGhhdCByZXNvbHZlcyB3aGVuIHRlc3RpbmcgaGFzIHN1Y2Nlc2Z1bGx5IHN0YXJ0ZWQuXG4gICAqL1xuICBhc3luYyBydW5UZXN0cyhwYXRoPzogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgLy8gSWYgdGhlIHRlc3QgcnVubmVyIHBhbmVsIGlzIG5vdCByZW5kZXJlZCB5ZXQsIGVuc3VyZSBpdCBpcyByZW5kZXJlZCBiZWZvcmUgY29udGludWluZy5cbiAgICBpZiAodGhpcy5fdGVzdFJ1bm5lclBhbmVsID09IG51bGwgfHwgIXRoaXMuX3N0YXRlLnBhbmVsVmlzaWJsZSkge1xuICAgICAgYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICB0aGlzLnNob3dQYW5lbChyZXNvbHZlKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl90ZXN0UnVubmVyUGFuZWwgPT0gbnVsbCkge1xuICAgICAgbG9nZ2VyLmVycm9yKCdUZXN0IHJ1bm5lciBwYW5lbCBkaWQgbm90IHJlbmRlciBhcyBleHBlY3RlZC4gQWJvcnRpbmcgdGVzdGluZy4nKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBHZXQgc2VsZWN0ZWQgdGVzdCBydW5uZXIgd2hlbiBGbG93IGtub3dzIGB0aGlzLl90ZXN0UnVubmVyUGFuZWxgIGlzIGRlZmluZWQuXG4gICAgY29uc3Qgc2VsZWN0ZWRUZXN0UnVubmVyID0gdGhpcy5fdGVzdFJ1bm5lclBhbmVsLmdldFNlbGVjdGVkVGVzdFJ1bm5lcigpO1xuICAgIGlmICghc2VsZWN0ZWRUZXN0UnVubmVyKSB7XG4gICAgICBsb2dnZXIud2FybihgTm8gdGVzdCBydW5uZXIgc2VsZWN0ZWQuIEFjdGl2ZSB0ZXN0IHJ1bm5lcnM6ICR7dGhpcy5fdGVzdFJ1bm5lcnMuc2l6ZX1gKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyAxLiBVc2UgdGhlIGBwYXRoYCBhcmd1bWVudCB0byB0aGlzIGZ1bmN0aW9uXG4gICAgLy8gMi4gVXNlIGB0aGlzLl9wYXRoYCBvbiB0aGUgaW5zdGFuY2VcbiAgICAvLyAzLiBMZXQgYHRlc3RQYXRoYCBiZSBgdW5kZWZpbmVkYCBzbyB0aGUgcGF0aCB3aWxsIGJlIHRha2VuIGZyb20gdGhlIGFjdGl2ZSBgVGV4dEVkaXRvcmBcbiAgICBsZXQgdGVzdFBhdGggPSAocGF0aCA9PT0gdW5kZWZpbmVkKSA/IHRoaXMuX3BhdGggOiBwYXRoO1xuXG4gICAgLy8gSWYgdGhlcmUncyBubyBwYXRoIHlldCwgZ2V0IHRoZSBwYXRoIGZyb20gdGhlIGFjdGl2ZSBgVGV4dEVkaXRvcmAuXG4gICAgaWYgKHRlc3RQYXRoID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGNvbnN0IGFjdGl2ZVRleHRFZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk7XG4gICAgICBpZiAoIWFjdGl2ZVRleHRFZGl0b3IpIHtcbiAgICAgICAgbG9nZ2VyLmRlYnVnKCdBdHRlbXB0ZWQgdG8gcnVuIHRlc3RzIHdpdGggbm8gYWN0aXZlIHRleHQgZWRpdG9yLicpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIElmIHRoZSBhY3RpdmUgdGV4dCBlZGl0b3IgaGFzIG5vIHBhdGgsIGJhaWwgYmVjYXVzZSB0aGVyZSdzIG5vd2hlcmUgdG8gcnVuIHRlc3RzLlxuICAgICAgdGVzdFBhdGggPSBhY3RpdmVUZXh0RWRpdG9yLmdldFBhdGgoKTtcbiAgICB9XG5cbiAgICBpZiAoIXRlc3RQYXRoKSB7XG4gICAgICBsb2dnZXIud2FybignQXR0ZW1wdGVkIHRvIHJ1biB0ZXN0cyBvbiBhbiBlZGl0b3Igd2l0aCBubyBwYXRoLicpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuY2xlYXJPdXRwdXQoKTtcbiAgICB0aGlzLl9ydW5UZXN0UnVubmVyU2VydmljZUZvclBhdGgoXG4gICAgICBzZWxlY3RlZFRlc3RSdW5uZXIucnVuVGVzdCh0ZXN0UGF0aCksXG4gICAgICB0ZXN0UGF0aCxcbiAgICAgIHNlbGVjdGVkVGVzdFJ1bm5lci5sYWJlbCk7XG4gICAgdHJhY2soJ3Rlc3RydW5uZXItcnVuLXRlc3RzJywge1xuICAgICAgcGF0aDogdGVzdFBhdGgsXG4gICAgICB0ZXN0UnVubmVyOiBzZWxlY3RlZFRlc3RSdW5uZXIubGFiZWwsXG4gICAgfSk7XG5cbiAgICAvLyBTZXQgc3RhdGUgYXMgXCJSdW5uaW5nXCIgdG8gZ2l2ZSBpbW1lZGlhdGUgZmVlZGJhY2sgaW4gdGhlIFVJLlxuICAgIHRoaXMuX3NldEV4ZWN1dGlvblN0YXRlKFRlc3RSdW5uZXJQYW5lbC5FeGVjdXRpb25TdGF0ZS5SVU5OSU5HKTtcbiAgICB0aGlzLl9wYXRoID0gdGVzdFBhdGg7XG4gICAgdGhpcy5fcmVuZGVyUGFuZWwoKTtcbiAgfVxuXG4gIHN0b3BUZXN0cygpOiB2b2lkIHtcbiAgICB0aGlzLl9zdG9wTGlzdGVuaW5nKCk7XG5cbiAgICAvLyBSZXNwb25kIGluIHRoZSBVSSBpbW1lZGlhdGVseSBhbmQgYXNzdW1lIHRoZSBwcm9jZXNzIGlzIHByb3Blcmx5IGtpbGxlZC5cbiAgICB0aGlzLl9zZXRFeGVjdXRpb25TdGF0ZShUZXN0UnVubmVyUGFuZWwuRXhlY3V0aW9uU3RhdGUuU1RPUFBFRCk7XG4gIH1cblxuICBzZXJpYWxpemUoKTogVGVzdFJ1bm5lckNvbnRyb2xsZXJTdGF0ZSB7XG4gICAgcmV0dXJuIHRoaXMuX3N0YXRlO1xuICB9XG5cbiAgc2hvd1BhbmVsKGRpZFJlbmRlcj86ICgpID0+IG1peGVkKTogdm9pZCB7XG4gICAgdHJhY2soJ3Rlc3RydW5uZXItc2hvdy1wYW5lbCcpO1xuICAgIHRoaXMuX3N0YXRlLnBhbmVsVmlzaWJsZSA9IHRydWU7XG4gICAgdGhpcy5fcmVuZGVyUGFuZWwoZGlkUmVuZGVyKTtcbiAgICBpZiAodGhpcy5fcGFuZWwpIHtcbiAgICAgIHRoaXMuX3BhbmVsLnNob3coKTtcbiAgICB9XG4gIH1cblxuICB0b2dnbGVQYW5lbCgpOiB2b2lkIHtcbiAgICB0cmFjaygndGVzdHJ1bm5lci1oaWRlLXBhbmVsJyk7XG4gICAgaWYgKHRoaXMuX3N0YXRlLnBhbmVsVmlzaWJsZSkge1xuICAgICAgdGhpcy5oaWRlUGFuZWwoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zaG93UGFuZWwoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBhbiBlbmQtb2YtbGluZSBjaGFyYWN0ZXIgdG8gYHRleHRgIGFuZCBhcHBlbmRzIHRoZSByZXN1bHRpbmcgc3RyaW5nIHRvIHRoaXMgY29udHJvbGxlcidzXG4gICAqIHRleHQgYnVmZmVyLlxuICAgKi9cbiAgX2FwcGVuZFRvQnVmZmVyKHRleHQ6IHN0cmluZyk6IHZvaWQge1xuICAgIC8vIGB1bmRvOiAnc2tpcCdgIGRpc2FibGVzIHRoZSBUZXh0RWRpdG9yJ3MgXCJ1bmRvIHN5c3RlbVwiLiBTaW5jZSB0aGUgYnVmZmVyIGlzIG1hbmFnZWQgYnkgdGhpc1xuICAgIC8vIGNsYXNzLCBhbiB1bmRvIHdpbGwgbmV2ZXIgaGFwcGVuLiBEaXNhYmxlIGl0IHdoZW4gYXBwZW5kaW5nIHRvIHByZXZlbnQgZG9pbmcgdW5uZWVkZWRcbiAgICAvLyBib29ra2VlcGluZy5cbiAgICAvL1xuICAgIC8vIEBzZWUge0BsaW5rIGh0dHBzOi8vYXRvbS5pby9kb2NzL2FwaS92MS4wLjQvVGV4dEJ1ZmZlciNpbnN0YW5jZS1hcHBlbmR8VGV4dEJ1ZmZlcjo6YXBwZW5kfVxuICAgIHRoaXMuX2J1ZmZlci5hcHBlbmQoYCR7dGV4dH0ke29zLkVPTH1gLCB7dW5kbzogJ3NraXAnfSk7XG4gIH1cblxuICBfaGFuZGxlQ2xpY2tSdW4oZXZlbnQ6IFN5bnRoZXRpY01vdXNlRXZlbnQpOiB2b2lkIHtcbiAgICAvLyBEb24ndCBwYXNzIGEgcmVmZXJlbmNlIHRvIGBydW5UZXN0c2AgZGlyZWN0bHkgYmVjYXVzZSB0aGUgY2FsbGJhY2sgcmVjZWl2ZXMgYSBtb3VzZSBldmVudCBhc1xuICAgIC8vIGl0cyBhcmd1bWVudC4gYHJ1blRlc3RzYCBuZWVkcyB0byBiZSBjYWxsZWQgd2l0aCBubyBhcmd1bWVudHMuXG4gICAgdGhpcy5ydW5UZXN0cygpO1xuICB9XG5cbiAgX3J1blRlc3RSdW5uZXJTZXJ2aWNlRm9yUGF0aCh0ZXN0UnVuOiBPYnNlcnZhYmxlPE1lc3NhZ2U+LCBwYXRoOiBOdWNsaWRlVXJpLCBsYWJlbDogc3RyaW5nKTpcbiAgICAgIHZvaWQge1xuICAgIGNvbnN0IHN1YnNjcmlwdGlvbiA9IHRlc3RSdW5cbiAgICAgIC5kb09uTmV4dCgobWVzc2FnZTogTWVzc2FnZSkgPT4ge1xuICAgICAgICBzd2l0Y2ggKG1lc3NhZ2Uua2luZCkge1xuICAgICAgICAgIGNhc2UgJ3N1bW1hcnknOlxuICAgICAgICAgICAgdGhpcy5fdGVzdFN1aXRlTW9kZWwgPSBuZXcgVGVzdFN1aXRlTW9kZWwobWVzc2FnZS5zdW1tYXJ5SW5mbyk7XG4gICAgICAgICAgICB0aGlzLl9yZW5kZXJQYW5lbCgpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAncnVuLXRlc3QnOlxuICAgICAgICAgICAgY29uc3QgdGVzdEluZm8gPSBtZXNzYWdlLnRlc3RJbmZvO1xuICAgICAgICAgICAgaWYgKHRoaXMuX3Rlc3RTdWl0ZU1vZGVsKSB7XG4gICAgICAgICAgICAgIHRoaXMuX3Rlc3RTdWl0ZU1vZGVsLmFkZFRlc3RSdW4odGVzdEluZm8pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBJZiBhIHRlc3QgcnVuIHRocm93cyBhbiBleGNlcHRpb24sIHRoZSBzdGFjayB0cmFjZSBpcyByZXR1cm5lZCBpbiAnZGV0YWlscycuXG4gICAgICAgICAgICAvLyBBcHBlbmQgaXRzIGVudGlyZXR5IHRvIHRoZSBjb25zb2xlLlxuICAgICAgICAgICAgaWYgKHRlc3RJbmZvLmhhc093blByb3BlcnR5KCdkZXRhaWxzJykgJiYgdGVzdEluZm8uZGV0YWlscyAhPT0gJycpIHtcbiAgICAgICAgICAgICAgLy8gJEZsb3dGaXhNZShwZXRlcmhhbClcbiAgICAgICAgICAgICAgdGhpcy5fYXBwZW5kVG9CdWZmZXIodGVzdEluZm8uZGV0YWlscyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEFwcGVuZCBhIFBBU1MvRkFJTCBtZXNzYWdlIGRlcGVuZGluZyBvbiB3aGV0aGVyIHRoZSBjbGFzcyBoYXMgdGVzdCBmYWlsdXJlcy5cbiAgICAgICAgICAgIHRoaXMuX2FwcGVuZFRvQnVmZmVyKFRlc3RSdW5Nb2RlbC5mb3JtYXRTdGF0dXNNZXNzYWdlKFxuICAgICAgICAgICAgICB0ZXN0SW5mby5uYW1lLFxuICAgICAgICAgICAgICB0ZXN0SW5mby5kdXJhdGlvblNlY3MsXG4gICAgICAgICAgICAgIHRlc3RJbmZvLnN0YXR1c1xuICAgICAgICAgICAgKSk7XG4gICAgICAgICAgICB0aGlzLl9yZW5kZXJQYW5lbCgpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnc3RhcnQnOlxuICAgICAgICAgICAgaWYgKHRoaXMuX3J1bikge1xuICAgICAgICAgICAgICB0aGlzLl9ydW4uc3RhcnQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ2Vycm9yJzpcbiAgICAgICAgICAgIGNvbnN0IGVycm9yID0gbWVzc2FnZS5lcnJvcjtcbiAgICAgICAgICAgIGlmICh0aGlzLl9ydW4pIHtcbiAgICAgICAgICAgICAgdGhpcy5fcnVuLnN0b3AoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChlcnJvci5jb2RlID09PSAnRU5PRU5UJykge1xuICAgICAgICAgICAgICB0aGlzLl9hcHBlbmRUb0J1ZmZlcihcbiAgICAgICAgICAgICAgICBgJHtBbnNpLllFTExPV31Db21tYW5kICcke2Vycm9yLnBhdGh9JyBkb2VzIG5vdCBleGlzdCR7QW5zaS5SRVNFVH1gKTtcbiAgICAgICAgICAgICAgdGhpcy5fYXBwZW5kVG9CdWZmZXIoYCR7QW5zaS5ZRUxMT1d9QXJlIHlvdSB0cnlpbmcgdG8gcnVuIHJlbW90ZWx5PyR7QW5zaS5SRVNFVH1gKTtcbiAgICAgICAgICAgICAgdGhpcy5fYXBwZW5kVG9CdWZmZXIoYCR7QW5zaS5ZRUxMT1d9UGF0aDogJHtwYXRofSR7QW5zaS5SRVNFVH1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX2FwcGVuZFRvQnVmZmVyKGAke0Fuc2kuUkVEfU9yaWdpbmFsIEVycm9yOiAke2Vycm9yLm1lc3NhZ2V9JHtBbnNpLlJFU0VUfWApO1xuICAgICAgICAgICAgdGhpcy5fc2V0RXhlY3V0aW9uU3RhdGUoVGVzdFJ1bm5lclBhbmVsLkV4ZWN1dGlvblN0YXRlLlNUT1BQRUQpO1xuICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGBFcnJvciBydW5uaW5nIHRlc3RzOiBcIiR7ZXJyb3IubWVzc2FnZX1cImApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnc3RkZXJyJzpcbiAgICAgICAgICAgIC8vIENvbG9yIHN0ZGVyciBvdXRwdXQgcmVkIGluIHRoZSBjb25zb2xlIHRvIGRpc3Rpbmd1aXNoIGl0IGFzIGVycm9yLlxuICAgICAgICAgICAgdGhpcy5fYXBwZW5kVG9CdWZmZXIoYCR7QW5zaS5SRUR9JHttZXNzYWdlLmRhdGF9JHtBbnNpLlJFU0VUfWApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICAuZmluYWxseSgoKSA9PiB7XG4gICAgICAgIHRoaXMuX3N0b3BMaXN0ZW5pbmcoKTtcbiAgICAgICAgdGhpcy5fc2V0RXhlY3V0aW9uU3RhdGUoVGVzdFJ1bm5lclBhbmVsLkV4ZWN1dGlvblN0YXRlLlNUT1BQRUQpO1xuICAgICAgfSlcbiAgICAgIC5zdWJzY3JpYmUoKTtcbiAgICB0aGlzLl9ydW4gPSBuZXcgVGVzdFJ1bk1vZGVsKGxhYmVsLCBzdWJzY3JpcHRpb24uZGlzcG9zZS5iaW5kKHN1YnNjcmlwdGlvbikpO1xuICB9XG5cbiAgX3NldEV4ZWN1dGlvblN0YXRlKGV4ZWN1dGlvblN0YXRlOiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLl9leGVjdXRpb25TdGF0ZSA9IGV4ZWN1dGlvblN0YXRlO1xuICAgIHRoaXMuX3JlbmRlclBhbmVsKCk7XG4gIH1cblxuICBfcmVuZGVyUGFuZWwoZGlkUmVuZGVyPzogKCkgPT4gbWl4ZWQpIHtcbiAgICAvLyBJbml0aWFsaXplIGFuZCByZW5kZXIgdGhlIGNvbnRlbnRzIG9mIHRoZSBwYW5lbCBvbmx5IGlmIHRoZSBob3N0aW5nIGNvbnRhaW5lciBpcyB2aXNpYmxlIGJ5XG4gICAgLy8gdGhlIHVzZXIncyBjaG9pY2UuXG4gICAgaWYgKCF0aGlzLl9zdGF0ZS5wYW5lbFZpc2libGUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgcm9vdCA9IHRoaXMuX3Jvb3Q7XG5cbiAgICBpZiAoIXJvb3QpIHtcbiAgICAgIHJvb3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgIHRoaXMuX3Jvb3QgPSByb290O1xuICAgIH1cblxuICAgIGxldCBwcm9ncmVzc1ZhbHVlO1xuICAgIGlmICAodGhpcy5fdGVzdFN1aXRlTW9kZWwgJiYgdGhpcy5fZXhlY3V0aW9uU3RhdGUgPT09IFRlc3RSdW5uZXJQYW5lbC5FeGVjdXRpb25TdGF0ZS5SVU5OSU5HKSB7XG4gICAgICBwcm9ncmVzc1ZhbHVlID0gdGhpcy5fdGVzdFN1aXRlTW9kZWwucHJvZ3Jlc3NQZXJjZW50KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIElmIHRoZXJlIGlzIG5vIHJ1bm5pbmcgdGVzdCBzdWl0ZSwgZmlsbCB0aGUgcHJvZ3Jlc3MgYmFyIGJlY2F1c2UgdGhlcmUgaXMgbm8gcHJvZ3Jlc3MgdG9cbiAgICAgIC8vIHRyYWNrLlxuICAgICAgcHJvZ3Jlc3NWYWx1ZSA9IDEwMDtcbiAgICB9XG5cbiAgICB0aGlzLl90ZXN0UnVubmVyUGFuZWwgPSBSZWFjdERPTS5yZW5kZXIoXG4gICAgICA8VGVzdFJ1bm5lclBhbmVsXG4gICAgICAgIGJ1ZmZlcj17dGhpcy5fYnVmZmVyfVxuICAgICAgICBleGVjdXRpb25TdGF0ZT17dGhpcy5fZXhlY3V0aW9uU3RhdGV9XG4gICAgICAgIG9uQ2xpY2tDbGVhcj17dGhpcy5jbGVhck91dHB1dH1cbiAgICAgICAgb25DbGlja0Nsb3NlPXt0aGlzLmhpZGVQYW5lbH1cbiAgICAgICAgb25DbGlja1J1bj17dGhpcy5faGFuZGxlQ2xpY2tSdW59XG4gICAgICAgIG9uQ2xpY2tTdG9wPXt0aGlzLnN0b3BUZXN0c31cbiAgICAgICAgcGF0aD17dGhpcy5fcGF0aH1cbiAgICAgICAgcHJvZ3Jlc3NWYWx1ZT17cHJvZ3Jlc3NWYWx1ZX1cbiAgICAgICAgcnVuRHVyYXRpb249e3RoaXMuX3J1biAmJiB0aGlzLl9ydW4uZ2V0RHVyYXRpb24oKX1cbiAgICAgICAgLy8gYFRlc3RSdW5uZXJQYW5lbGAgZXhwZWN0cyBhbiBBcnJheSBzbyBpdCBjYW4gcmVuZGVyIHRoZSB0ZXN0IHJ1bm5lcnMgaW4gYSBkcm9wZG93biBhbmRcbiAgICAgICAgLy8gbWFpbnRhaW4gYSBzZWxlY3RlZCBpbmRleC4gYFNldGAgbWFpbnRhaW5zIGl0ZW1zIGluIGluc2VydGlvbiBvcmRlciwgc28gdGhlIG9yZGVyaW5nIGlzXG4gICAgICAgIC8vIGRldGVybWluYXRlIG9uIGVhY2ggcmVuZGVyLlxuICAgICAgICB0ZXN0UnVubmVycz17YXJyYXkuZnJvbSh0aGlzLl90ZXN0UnVubmVycyl9XG4gICAgICAgIHRlc3RTdWl0ZU1vZGVsPXt0aGlzLl90ZXN0U3VpdGVNb2RlbH1cbiAgICAgIC8+LFxuICAgICAgcm9vdCxcbiAgICAgIGRpZFJlbmRlclxuICAgICk7XG5cbiAgICBpZiAoIXRoaXMuX3BhbmVsKSB7XG4gICAgICB0aGlzLl9wYW5lbCA9IGF0b20ud29ya3NwYWNlLmFkZEJvdHRvbVBhbmVsKHtpdGVtOiByb290LCB2aXNpYmxlOiB0aGlzLl9zdGF0ZS5wYW5lbFZpc2libGV9KTtcbiAgICB9XG4gIH1cblxuICBfc3RvcExpc3RlbmluZygpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fcnVuICYmICh0aGlzLl9ydW4uZGlzcG9zZSAhPSBudWxsKSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZGlzcG9zZSA9IHRoaXMuX3J1bi5kaXNwb3NlO1xuICAgICAgICB0aGlzLl9ydW4uZGlzcG9zZSA9IG51bGw7XG4gICAgICAgIHRoaXMuX3J1bi5zdG9wKCk7XG4gICAgICAgIGludmFyaWFudCh0aGlzLl9ydW4pOyAvLyBDYWxsaW5nIGBzdG9wKClgIHNob3VsZCBuZXZlciBudWxsIHRoZSBgX3J1bmAgcHJvcGVydHkuXG4gICAgICAgIHRyYWNrKCd0ZXN0cnVubmVyLXN0b3AtdGVzdHMnLCB7XG4gICAgICAgICAgdGVzdFJ1bm5lcjogdGhpcy5fcnVuLmxhYmVsLFxuICAgICAgICB9KTtcbiAgICAgICAgZGlzcG9zZSgpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBpbnZhcmlhbnQodGhpcy5fcnVuKTsgLy8gTm90aGluZyBpbiB0aGUgdHJ5IGJsb2NrIHNob3VsZCBldmVyIG51bGwgdGhlIGBfcnVuYCBwcm9wZXJ0eS5cbiAgICAgICAgLy8gSWYgdGhlIHJlbW90ZSBjb25uZWN0aW9uIGdvZXMgYXdheSwgaXQgd29uJ3QgYmUgcG9zc2libGUgdG8gc3RvcCB0ZXN0cy4gTG9nIGFuIGVycm9yIGFuZFxuICAgICAgICAvLyBwcm9jZWVkIGFzIHVzdWFsLlxuICAgICAgICBsb2dnZXIuZXJyb3IoYEVycm9yIHdoZW4gc3RvcHBpbmcgdGVzdCBydW4gIycke3RoaXMuX3J1bi5sYWJlbH06ICR7ZX1gKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRlc3RSdW5uZXJDb250cm9sbGVyO1xuIl19