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

    // TODO: Use the ReadOnlyTextBuffer class from nuclide-atom-text-editor when it is exported.
    this._buffer = new TextBuffer();
    // Make `delete` a no-op to effectively create a read-only buffer.
    this._buffer['delete'] = function () {};

    this._executionState = TestRunnerPanel.ExecutionState.STOPPED;
    this._testRunners = testRunners;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlRlc3RSdW5uZXJDb250cm9sbGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O3NCQWNzQixRQUFROzs7O0FBRTlCLElBQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQzs7ZUFDVixPQUFPLENBQUMsTUFBTSxDQUFDOztJQUE3QixVQUFVLFlBQVYsVUFBVTs7Z0JBSWIsT0FBTyxDQUFDLGdCQUFnQixDQUFDOztJQUYzQixLQUFLLGFBQUwsS0FBSztJQUNMLFFBQVEsYUFBUixRQUFROztBQUVWLElBQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0FBQy9DLElBQU0sZUFBZSxHQUFHLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO0FBQ3hELElBQU0sY0FBYyxHQUFHLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDOztBQUVuRCxJQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUM1RCxJQUFNLEVBQUUsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7O2dCQUNULE9BQU8sQ0FBQyx5QkFBeUIsQ0FBQzs7SUFBM0MsS0FBSyxhQUFMLEtBQUs7O0lBTUMsb0JBQW9CO0FBY3BCLFdBZEEsb0JBQW9CLENBY25CLEtBQWlDLEVBQUUsV0FBNEIsRUFBRTswQkFkbEUsb0JBQW9COztBQWU3QixRQUFJLEtBQUssSUFBSSxJQUFJLEVBQUU7QUFDakIsV0FBSyxHQUFHLEVBQUUsQ0FBQztLQUNaOztBQUVELFFBQUksQ0FBQyxNQUFNLEdBQUc7QUFDWixrQkFBWSxFQUFFLEtBQUssQ0FBQyxZQUFZO0tBQ2pDLENBQUM7Ozs7QUFJRixBQUFDLFFBQUksQ0FBTyxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDdEQsQUFBQyxRQUFJLENBQU8sU0FBUyxHQUFHLElBQUksQ0FB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Q0FBQyxDQUFDO09BQzlGO0tBQ0Y7OztXQUVhLDBCQUFTO0FBQ3JCLFVBQUksSUFBSSxDQUFDLElBQUksSUFBSyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLEFBQUMsRUFBRTtBQUM1QyxZQUFJO0FBQ0YsY0FBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7QUFDbEMsY0FBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO0FBQ3pCLGNBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDakIsbUNBQVUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3JCLGVBQUssQ0FBQyx1QkFBdUIsRUFBRTtBQUM3QixzQkFBVSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSztXQUM1QixDQUFDLENBQUM7QUFDSCxpQkFBTyxFQUFFLENBQUM7U0FDWCxDQUFDLE9BQU8sQ0FBQyxFQUFFO0FBQ1YsbUNBQVUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDOzs7QUFHckIsZ0JBQU0sQ0FBQyxLQUFLLHNDQUFtQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssVUFBSyxDQUFDLENBQUcsQ0FBQztTQUN6RTtPQUNGO0tBQ0Y7OztTQWxVVSxvQkFBb0IiLCJmaWxlIjoiVGVzdFJ1bm5lckNvbnRyb2xsZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7VGVzdFJ1bm5lciwgTWVzc2FnZX0gZnJvbSAnLi4vLi4vbnVjbGlkZS10ZXN0LXJ1bm5lci9saWIvaW50ZXJmYWNlcyc7XG5pbXBvcnQgdHlwZSB7TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1yZW1vdGUtdXJpJztcbmltcG9ydCB0eXBlIHtPYnNlcnZhYmxlfSBmcm9tICdyeCc7XG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5cbmNvbnN0IEFuc2kgPSByZXF1aXJlKCcuL0Fuc2knKTtcbmNvbnN0IHtUZXh0QnVmZmVyfSA9IHJlcXVpcmUoJ2F0b20nKTtcbmNvbnN0IHtcbiAgUmVhY3QsXG4gIFJlYWN0RE9NLFxufSA9IHJlcXVpcmUoJ3JlYWN0LWZvci1hdG9tJyk7XG5jb25zdCBUZXN0UnVuTW9kZWwgPSByZXF1aXJlKCcuL1Rlc3RSdW5Nb2RlbCcpO1xuY29uc3QgVGVzdFJ1bm5lclBhbmVsID0gcmVxdWlyZSgnLi91aS9UZXN0UnVubmVyUGFuZWwnKTtcbmNvbnN0IFRlc3RTdWl0ZU1vZGVsID0gcmVxdWlyZSgnLi9UZXN0U3VpdGVNb2RlbCcpO1xuXG5jb25zdCBsb2dnZXIgPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLWxvZ2dpbmcnKS5nZXRMb2dnZXIoKTtcbmNvbnN0IG9zID0gcmVxdWlyZSgnb3MnKTtcbmNvbnN0IHt0cmFja30gPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLWFuYWx5dGljcycpO1xuXG5leHBvcnQgdHlwZSBUZXN0UnVubmVyQ29udHJvbGxlclN0YXRlID0ge1xuICBwYW5lbFZpc2libGU/OiBib29sZWFuO1xufTtcblxuZXhwb3J0IGNsYXNzIFRlc3RSdW5uZXJDb250cm9sbGVyIHtcblxuICBfYWN0aXZlVGVzdFJ1bm5lcjogP09iamVjdDtcbiAgX2J1ZmZlcjogVGV4dEJ1ZmZlcjtcbiAgX2V4ZWN1dGlvblN0YXRlOiBudW1iZXI7XG4gIF9wYW5lbDogP2F0b20kUGFuZWw7XG4gIF9wYXRoOiA/c3RyaW5nO1xuICBfcm9vdDogP0VsZW1lbnQ7XG4gIF9ydW46ID9UZXN0UnVuTW9kZWw7XG4gIF9zdGF0ZTogT2JqZWN0O1xuICBfdGVzdFJ1bm5lcnM6IFNldDxUZXN0UnVubmVyPjtcbiAgX3Rlc3RSdW5uZXJQYW5lbDogP1Rlc3RSdW5uZXJQYW5lbDtcbiAgX3Rlc3RTdWl0ZU1vZGVsOiA/VGVzdFN1aXRlTW9kZWw7XG5cbiAgY29uc3RydWN0b3Ioc3RhdGU6ID9UZXN0UnVubmVyQ29udHJvbGxlclN0YXRlLCB0ZXN0UnVubmVyczogU2V0PFRlc3RSdW5uZXI+KSB7XG4gICAgaWYgKHN0YXRlID09IG51bGwpIHtcbiAgICAgIHN0YXRlID0ge307XG4gICAgfVxuXG4gICAgdGhpcy5fc3RhdGUgPSB7XG4gICAgICBwYW5lbFZpc2libGU6IHN0YXRlLnBhbmVsVmlzaWJsZSxcbiAgICB9O1xuXG4gICAgLy8gQmluZCBGdW5jdGlvbnMgZm9yIHVzZSBhcyBjYWxsYmFja3M7XG4gICAgLy8gVE9ETzogUmVwbGFjZSB3aXRoIHByb3BlcnR5IGluaXRpYWxpemVycyB3aGVuIHN1cHBvcnRlZCBieSBGbG93O1xuICAgICh0aGlzOiBhbnkpLmNsZWFyT3V0cHV0ID0gdGhpcy5jbGVhck91dHB1dC5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLmhpZGVQYW5lbCA9IHRoaXMuaGlkZVBhbmVsLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuc3RvcFRlc3RzID0gdGhpcy5zdG9wVGVzdHMuYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5faGFuZGxlQ2xpY2tSdW4gPSB0aGlzLl9oYW5kbGVDbGlja1J1bi5iaW5kKHRoaXMpO1xuXG4gICAgLy8gVE9ETzogVXNlIHRoZSBSZWFkT25seVRleHRCdWZmZXIgY2xhc3MgZnJvbSBudWNsaWRlLWF0b20tdGV4dC1lZGl0b3Igd2hlbiBpdCBpcyBleHBvcnRlZC5cbiAgICB0aGlzLl9idWZmZXIgPSBuZXcgVGV4dEJ1ZmZlcigpO1xuICAgIC8vIE1ha2UgYGRlbGV0ZWAgYSBuby1vcCB0byBlZmZlY3RpdmVseSBjcmVhdGUgYSByZWFkLW9ubHkgYnVmZmVyLlxuICAgICh0aGlzLl9idWZmZXI6IE9iamVjdCkuZGVsZXRlID0gKCkgPT4ge307XG5cbiAgICB0aGlzLl9leGVjdXRpb25TdGF0ZSA9IFRlc3RSdW5uZXJQYW5lbC5FeGVjdXRpb25TdGF0ZS5TVE9QUEVEO1xuICAgIHRoaXMuX3Rlc3RSdW5uZXJzID0gdGVzdFJ1bm5lcnM7XG4gICAgdGhpcy5fcmVuZGVyUGFuZWwoKTtcbiAgfVxuXG4gIGNsZWFyT3V0cHV0KCkge1xuICAgIHRoaXMuX2J1ZmZlci5zZXRUZXh0KCcnKTtcbiAgICB0aGlzLl9wYXRoID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuX3J1biA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLl9zdG9wTGlzdGVuaW5nKCk7XG4gICAgdGhpcy5fdGVzdFN1aXRlTW9kZWwgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5fcmVuZGVyUGFuZWwoKTtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5fc3RvcExpc3RlbmluZygpO1xuICAgIGlmICh0aGlzLl9yb290KSB7XG4gICAgICBSZWFjdERPTS51bm1vdW50Q29tcG9uZW50QXROb2RlKHRoaXMuX3Jvb3QpO1xuICAgICAgdGhpcy5fcm9vdCA9IG51bGw7XG4gICAgfVxuICAgIGlmICh0aGlzLl9wYW5lbCkge1xuICAgICAgdGhpcy5fcGFuZWwuZGVzdHJveSgpO1xuICAgICAgdGhpcy5fcGFuZWwgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIGRpZFVwZGF0ZVRlc3RSdW5uZXJzKCkge1xuICAgIHRoaXMuX3JlbmRlclBhbmVsKCk7XG4gIH1cblxuICBoaWRlUGFuZWwoKSB7XG4gICAgdGhpcy5zdG9wVGVzdHMoKTtcbiAgICB0aGlzLl9zdGF0ZS5wYW5lbFZpc2libGUgPSBmYWxzZTtcbiAgICBpZiAodGhpcy5fcGFuZWwpIHtcbiAgICAgIHRoaXMuX3BhbmVsLmhpZGUoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybiBBIFByb21pc2UgdGhhdCByZXNvbHZlcyB3aGVuIHRlc3RpbmcgaGFzIHN1Y2Nlc2Z1bGx5IHN0YXJ0ZWQuXG4gICAqL1xuICBhc3luYyBydW5UZXN0cyhwYXRoPzogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgLy8gSWYgdGhlIHRlc3QgcnVubmVyIHBhbmVsIGlzIG5vdCByZW5kZXJlZCB5ZXQsIGVuc3VyZSBpdCBpcyByZW5kZXJlZCBiZWZvcmUgY29udGludWluZy5cbiAgICBpZiAodGhpcy5fdGVzdFJ1bm5lclBhbmVsID09IG51bGwgfHwgIXRoaXMuX3N0YXRlLnBhbmVsVmlzaWJsZSkge1xuICAgICAgYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICB0aGlzLnNob3dQYW5lbChyZXNvbHZlKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl90ZXN0UnVubmVyUGFuZWwgPT0gbnVsbCkge1xuICAgICAgbG9nZ2VyLmVycm9yKCdUZXN0IHJ1bm5lciBwYW5lbCBkaWQgbm90IHJlbmRlciBhcyBleHBlY3RlZC4gQWJvcnRpbmcgdGVzdGluZy4nKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBHZXQgc2VsZWN0ZWQgdGVzdCBydW5uZXIgd2hlbiBGbG93IGtub3dzIGB0aGlzLl90ZXN0UnVubmVyUGFuZWxgIGlzIGRlZmluZWQuXG4gICAgY29uc3Qgc2VsZWN0ZWRUZXN0UnVubmVyID0gdGhpcy5fdGVzdFJ1bm5lclBhbmVsLmdldFNlbGVjdGVkVGVzdFJ1bm5lcigpO1xuICAgIGlmICghc2VsZWN0ZWRUZXN0UnVubmVyKSB7XG4gICAgICBsb2dnZXIud2FybihgTm8gdGVzdCBydW5uZXIgc2VsZWN0ZWQuIEFjdGl2ZSB0ZXN0IHJ1bm5lcnM6ICR7dGhpcy5fdGVzdFJ1bm5lcnMuc2l6ZX1gKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyAxLiBVc2UgdGhlIGBwYXRoYCBhcmd1bWVudCB0byB0aGlzIGZ1bmN0aW9uXG4gICAgLy8gMi4gVXNlIGB0aGlzLl9wYXRoYCBvbiB0aGUgaW5zdGFuY2VcbiAgICAvLyAzLiBMZXQgYHRlc3RQYXRoYCBiZSBgdW5kZWZpbmVkYCBzbyB0aGUgcGF0aCB3aWxsIGJlIHRha2VuIGZyb20gdGhlIGFjdGl2ZSBgVGV4dEVkaXRvcmBcbiAgICBsZXQgdGVzdFBhdGggPSAocGF0aCA9PT0gdW5kZWZpbmVkKSA/IHRoaXMuX3BhdGggOiBwYXRoO1xuXG4gICAgLy8gSWYgdGhlcmUncyBubyBwYXRoIHlldCwgZ2V0IHRoZSBwYXRoIGZyb20gdGhlIGFjdGl2ZSBgVGV4dEVkaXRvcmAuXG4gICAgaWYgKHRlc3RQYXRoID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGNvbnN0IGFjdGl2ZVRleHRFZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk7XG4gICAgICBpZiAoIWFjdGl2ZVRleHRFZGl0b3IpIHtcbiAgICAgICAgbG9nZ2VyLmRlYnVnKCdBdHRlbXB0ZWQgdG8gcnVuIHRlc3RzIHdpdGggbm8gYWN0aXZlIHRleHQgZWRpdG9yLicpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIElmIHRoZSBhY3RpdmUgdGV4dCBlZGl0b3IgaGFzIG5vIHBhdGgsIGJhaWwgYmVjYXVzZSB0aGVyZSdzIG5vd2hlcmUgdG8gcnVuIHRlc3RzLlxuICAgICAgdGVzdFBhdGggPSBhY3RpdmVUZXh0RWRpdG9yLmdldFBhdGgoKTtcbiAgICB9XG5cbiAgICBpZiAoIXRlc3RQYXRoKSB7XG4gICAgICBsb2dnZXIud2FybignQXR0ZW1wdGVkIHRvIHJ1biB0ZXN0cyBvbiBhbiBlZGl0b3Igd2l0aCBubyBwYXRoLicpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuY2xlYXJPdXRwdXQoKTtcbiAgICB0aGlzLl9ydW5UZXN0UnVubmVyU2VydmljZUZvclBhdGgoXG4gICAgICBzZWxlY3RlZFRlc3RSdW5uZXIucnVuVGVzdCh0ZXN0UGF0aCksXG4gICAgICB0ZXN0UGF0aCxcbiAgICAgIHNlbGVjdGVkVGVzdFJ1bm5lci5sYWJlbCk7XG4gICAgdHJhY2soJ3Rlc3RydW5uZXItcnVuLXRlc3RzJywge1xuICAgICAgcGF0aDogdGVzdFBhdGgsXG4gICAgICB0ZXN0UnVubmVyOiBzZWxlY3RlZFRlc3RSdW5uZXIubGFiZWwsXG4gICAgfSk7XG5cbiAgICAvLyBTZXQgc3RhdGUgYXMgXCJSdW5uaW5nXCIgdG8gZ2l2ZSBpbW1lZGlhdGUgZmVlZGJhY2sgaW4gdGhlIFVJLlxuICAgIHRoaXMuX3NldEV4ZWN1dGlvblN0YXRlKFRlc3RSdW5uZXJQYW5lbC5FeGVjdXRpb25TdGF0ZS5SVU5OSU5HKTtcbiAgICB0aGlzLl9wYXRoID0gdGVzdFBhdGg7XG4gICAgdGhpcy5fcmVuZGVyUGFuZWwoKTtcbiAgfVxuXG4gIHN0b3BUZXN0cygpOiB2b2lkIHtcbiAgICB0aGlzLl9zdG9wTGlzdGVuaW5nKCk7XG5cbiAgICAvLyBSZXNwb25kIGluIHRoZSBVSSBpbW1lZGlhdGVseSBhbmQgYXNzdW1lIHRoZSBwcm9jZXNzIGlzIHByb3Blcmx5IGtpbGxlZC5cbiAgICB0aGlzLl9zZXRFeGVjdXRpb25TdGF0ZShUZXN0UnVubmVyUGFuZWwuRXhlY3V0aW9uU3RhdGUuU1RPUFBFRCk7XG4gIH1cblxuICBzZXJpYWxpemUoKTogVGVzdFJ1bm5lckNvbnRyb2xsZXJTdGF0ZSB7XG4gICAgcmV0dXJuIHRoaXMuX3N0YXRlO1xuICB9XG5cbiAgc2hvd1BhbmVsKGRpZFJlbmRlcj86ICgpID0+IG1peGVkKTogdm9pZCB7XG4gICAgdHJhY2soJ3Rlc3RydW5uZXItc2hvdy1wYW5lbCcpO1xuICAgIHRoaXMuX3N0YXRlLnBhbmVsVmlzaWJsZSA9IHRydWU7XG4gICAgdGhpcy5fcmVuZGVyUGFuZWwoZGlkUmVuZGVyKTtcbiAgICBpZiAodGhpcy5fcGFuZWwpIHtcbiAgICAgIHRoaXMuX3BhbmVsLnNob3coKTtcbiAgICB9XG4gIH1cblxuICB0b2dnbGVQYW5lbCgpOiB2b2lkIHtcbiAgICB0cmFjaygndGVzdHJ1bm5lci1oaWRlLXBhbmVsJyk7XG4gICAgaWYgKHRoaXMuX3N0YXRlLnBhbmVsVmlzaWJsZSkge1xuICAgICAgdGhpcy5oaWRlUGFuZWwoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zaG93UGFuZWwoKTtcbiAgICB9XG4gIH1cblxuICBpc1Zpc2libGUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX3N0YXRlLnBhbmVsVmlzaWJsZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGFuIGVuZC1vZi1saW5lIGNoYXJhY3RlciB0byBgdGV4dGAgYW5kIGFwcGVuZHMgdGhlIHJlc3VsdGluZyBzdHJpbmcgdG8gdGhpcyBjb250cm9sbGVyJ3NcbiAgICogdGV4dCBidWZmZXIuXG4gICAqL1xuICBfYXBwZW5kVG9CdWZmZXIodGV4dDogc3RyaW5nKTogdm9pZCB7XG4gICAgLy8gYHVuZG86ICdza2lwJ2AgZGlzYWJsZXMgdGhlIFRleHRFZGl0b3IncyBcInVuZG8gc3lzdGVtXCIuIFNpbmNlIHRoZSBidWZmZXIgaXMgbWFuYWdlZCBieSB0aGlzXG4gICAgLy8gY2xhc3MsIGFuIHVuZG8gd2lsbCBuZXZlciBoYXBwZW4uIERpc2FibGUgaXQgd2hlbiBhcHBlbmRpbmcgdG8gcHJldmVudCBkb2luZyB1bm5lZWRlZFxuICAgIC8vIGJvb2trZWVwaW5nLlxuICAgIC8vXG4gICAgLy8gQHNlZSB7QGxpbmsgaHR0cHM6Ly9hdG9tLmlvL2RvY3MvYXBpL3YxLjAuNC9UZXh0QnVmZmVyI2luc3RhbmNlLWFwcGVuZHxUZXh0QnVmZmVyOjphcHBlbmR9XG4gICAgdGhpcy5fYnVmZmVyLmFwcGVuZChgJHt0ZXh0fSR7b3MuRU9MfWAsIHt1bmRvOiAnc2tpcCd9KTtcbiAgfVxuXG4gIF9oYW5kbGVDbGlja1J1bihldmVudDogU3ludGhldGljTW91c2VFdmVudCk6IHZvaWQge1xuICAgIC8vIERvbid0IHBhc3MgYSByZWZlcmVuY2UgdG8gYHJ1blRlc3RzYCBkaXJlY3RseSBiZWNhdXNlIHRoZSBjYWxsYmFjayByZWNlaXZlcyBhIG1vdXNlIGV2ZW50IGFzXG4gICAgLy8gaXRzIGFyZ3VtZW50LiBgcnVuVGVzdHNgIG5lZWRzIHRvIGJlIGNhbGxlZCB3aXRoIG5vIGFyZ3VtZW50cy5cbiAgICB0aGlzLnJ1blRlc3RzKCk7XG4gIH1cblxuICBfcnVuVGVzdFJ1bm5lclNlcnZpY2VGb3JQYXRoKHRlc3RSdW46IE9ic2VydmFibGU8TWVzc2FnZT4sIHBhdGg6IE51Y2xpZGVVcmksIGxhYmVsOiBzdHJpbmcpOlxuICAgICAgdm9pZCB7XG4gICAgY29uc3Qgc3Vic2NyaXB0aW9uID0gdGVzdFJ1blxuICAgICAgLmRvT25OZXh0KChtZXNzYWdlOiBNZXNzYWdlKSA9PiB7XG4gICAgICAgIHN3aXRjaCAobWVzc2FnZS5raW5kKSB7XG4gICAgICAgICAgY2FzZSAnc3VtbWFyeSc6XG4gICAgICAgICAgICB0aGlzLl90ZXN0U3VpdGVNb2RlbCA9IG5ldyBUZXN0U3VpdGVNb2RlbChtZXNzYWdlLnN1bW1hcnlJbmZvKTtcbiAgICAgICAgICAgIHRoaXMuX3JlbmRlclBhbmVsKCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdydW4tdGVzdCc6XG4gICAgICAgICAgICBjb25zdCB0ZXN0SW5mbyA9IG1lc3NhZ2UudGVzdEluZm87XG4gICAgICAgICAgICBpZiAodGhpcy5fdGVzdFN1aXRlTW9kZWwpIHtcbiAgICAgICAgICAgICAgdGhpcy5fdGVzdFN1aXRlTW9kZWwuYWRkVGVzdFJ1bih0ZXN0SW5mbyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIElmIGEgdGVzdCBydW4gdGhyb3dzIGFuIGV4Y2VwdGlvbiwgdGhlIHN0YWNrIHRyYWNlIGlzIHJldHVybmVkIGluICdkZXRhaWxzJy5cbiAgICAgICAgICAgIC8vIEFwcGVuZCBpdHMgZW50aXJldHkgdG8gdGhlIGNvbnNvbGUuXG4gICAgICAgICAgICBpZiAodGVzdEluZm8uaGFzT3duUHJvcGVydHkoJ2RldGFpbHMnKSAmJiB0ZXN0SW5mby5kZXRhaWxzICE9PSAnJykge1xuICAgICAgICAgICAgICAvLyAkRmxvd0ZpeE1lKHBldGVyaGFsKVxuICAgICAgICAgICAgICB0aGlzLl9hcHBlbmRUb0J1ZmZlcih0ZXN0SW5mby5kZXRhaWxzKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gQXBwZW5kIGEgUEFTUy9GQUlMIG1lc3NhZ2UgZGVwZW5kaW5nIG9uIHdoZXRoZXIgdGhlIGNsYXNzIGhhcyB0ZXN0IGZhaWx1cmVzLlxuICAgICAgICAgICAgdGhpcy5fYXBwZW5kVG9CdWZmZXIoVGVzdFJ1bk1vZGVsLmZvcm1hdFN0YXR1c01lc3NhZ2UoXG4gICAgICAgICAgICAgIHRlc3RJbmZvLm5hbWUsXG4gICAgICAgICAgICAgIHRlc3RJbmZvLmR1cmF0aW9uU2VjcyxcbiAgICAgICAgICAgICAgdGVzdEluZm8uc3RhdHVzXG4gICAgICAgICAgICApKTtcbiAgICAgICAgICAgIHRoaXMuX3JlbmRlclBhbmVsKCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdzdGFydCc6XG4gICAgICAgICAgICBpZiAodGhpcy5fcnVuKSB7XG4gICAgICAgICAgICAgIHRoaXMuX3J1bi5zdGFydCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnZXJyb3InOlxuICAgICAgICAgICAgY29uc3QgZXJyb3IgPSBtZXNzYWdlLmVycm9yO1xuICAgICAgICAgICAgaWYgKHRoaXMuX3J1bikge1xuICAgICAgICAgICAgICB0aGlzLl9ydW4uc3RvcCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGVycm9yLmNvZGUgPT09ICdFTk9FTlQnKSB7XG4gICAgICAgICAgICAgIHRoaXMuX2FwcGVuZFRvQnVmZmVyKFxuICAgICAgICAgICAgICAgIGAke0Fuc2kuWUVMTE9XfUNvbW1hbmQgJyR7ZXJyb3IucGF0aH0nIGRvZXMgbm90IGV4aXN0JHtBbnNpLlJFU0VUfWApO1xuICAgICAgICAgICAgICB0aGlzLl9hcHBlbmRUb0J1ZmZlcihgJHtBbnNpLllFTExPV31BcmUgeW91IHRyeWluZyB0byBydW4gcmVtb3RlbHk/JHtBbnNpLlJFU0VUfWApO1xuICAgICAgICAgICAgICB0aGlzLl9hcHBlbmRUb0J1ZmZlcihgJHtBbnNpLllFTExPV31QYXRoOiAke3BhdGh9JHtBbnNpLlJFU0VUfWApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5fYXBwZW5kVG9CdWZmZXIoYCR7QW5zaS5SRUR9T3JpZ2luYWwgRXJyb3I6ICR7ZXJyb3IubWVzc2FnZX0ke0Fuc2kuUkVTRVR9YCk7XG4gICAgICAgICAgICB0aGlzLl9zZXRFeGVjdXRpb25TdGF0ZShUZXN0UnVubmVyUGFuZWwuRXhlY3V0aW9uU3RhdGUuU1RPUFBFRCk7XG4gICAgICAgICAgICBsb2dnZXIuZXJyb3IoYEVycm9yIHJ1bm5pbmcgdGVzdHM6IFwiJHtlcnJvci5tZXNzYWdlfVwiYCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdzdGRlcnInOlxuICAgICAgICAgICAgLy8gQ29sb3Igc3RkZXJyIG91dHB1dCByZWQgaW4gdGhlIGNvbnNvbGUgdG8gZGlzdGluZ3Vpc2ggaXQgYXMgZXJyb3IuXG4gICAgICAgICAgICB0aGlzLl9hcHBlbmRUb0J1ZmZlcihgJHtBbnNpLlJFRH0ke21lc3NhZ2UuZGF0YX0ke0Fuc2kuUkVTRVR9YCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIC5maW5hbGx5KCgpID0+IHtcbiAgICAgICAgdGhpcy5fc3RvcExpc3RlbmluZygpO1xuICAgICAgICB0aGlzLl9zZXRFeGVjdXRpb25TdGF0ZShUZXN0UnVubmVyUGFuZWwuRXhlY3V0aW9uU3RhdGUuU1RPUFBFRCk7XG4gICAgICB9KVxuICAgICAgLnN1YnNjcmliZSgpO1xuICAgIHRoaXMuX3J1biA9IG5ldyBUZXN0UnVuTW9kZWwobGFiZWwsIHN1YnNjcmlwdGlvbi5kaXNwb3NlLmJpbmQoc3Vic2NyaXB0aW9uKSk7XG4gIH1cblxuICBfc2V0RXhlY3V0aW9uU3RhdGUoZXhlY3V0aW9uU3RhdGU6IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMuX2V4ZWN1dGlvblN0YXRlID0gZXhlY3V0aW9uU3RhdGU7XG4gICAgdGhpcy5fcmVuZGVyUGFuZWwoKTtcbiAgfVxuXG4gIF9yZW5kZXJQYW5lbChkaWRSZW5kZXI/OiAoKSA9PiBtaXhlZCkge1xuICAgIC8vIEluaXRpYWxpemUgYW5kIHJlbmRlciB0aGUgY29udGVudHMgb2YgdGhlIHBhbmVsIG9ubHkgaWYgdGhlIGhvc3RpbmcgY29udGFpbmVyIGlzIHZpc2libGUgYnlcbiAgICAvLyB0aGUgdXNlcidzIGNob2ljZS5cbiAgICBpZiAoIXRoaXMuX3N0YXRlLnBhbmVsVmlzaWJsZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCByb290ID0gdGhpcy5fcm9vdDtcblxuICAgIGlmICghcm9vdCkge1xuICAgICAgcm9vdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgdGhpcy5fcm9vdCA9IHJvb3Q7XG4gICAgfVxuXG4gICAgbGV0IHByb2dyZXNzVmFsdWU7XG4gICAgaWYgICh0aGlzLl90ZXN0U3VpdGVNb2RlbCAmJiB0aGlzLl9leGVjdXRpb25TdGF0ZSA9PT0gVGVzdFJ1bm5lclBhbmVsLkV4ZWN1dGlvblN0YXRlLlJVTk5JTkcpIHtcbiAgICAgIHByb2dyZXNzVmFsdWUgPSB0aGlzLl90ZXN0U3VpdGVNb2RlbC5wcm9ncmVzc1BlcmNlbnQoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gSWYgdGhlcmUgaXMgbm8gcnVubmluZyB0ZXN0IHN1aXRlLCBmaWxsIHRoZSBwcm9ncmVzcyBiYXIgYmVjYXVzZSB0aGVyZSBpcyBubyBwcm9ncmVzcyB0b1xuICAgICAgLy8gdHJhY2suXG4gICAgICBwcm9ncmVzc1ZhbHVlID0gMTAwO1xuICAgIH1cblxuICAgIHRoaXMuX3Rlc3RSdW5uZXJQYW5lbCA9IFJlYWN0RE9NLnJlbmRlcihcbiAgICAgIDxUZXN0UnVubmVyUGFuZWxcbiAgICAgICAgYnVmZmVyPXt0aGlzLl9idWZmZXJ9XG4gICAgICAgIGV4ZWN1dGlvblN0YXRlPXt0aGlzLl9leGVjdXRpb25TdGF0ZX1cbiAgICAgICAgb25DbGlja0NsZWFyPXt0aGlzLmNsZWFyT3V0cHV0fVxuICAgICAgICBvbkNsaWNrQ2xvc2U9e3RoaXMuaGlkZVBhbmVsfVxuICAgICAgICBvbkNsaWNrUnVuPXt0aGlzLl9oYW5kbGVDbGlja1J1bn1cbiAgICAgICAgb25DbGlja1N0b3A9e3RoaXMuc3RvcFRlc3RzfVxuICAgICAgICBwYXRoPXt0aGlzLl9wYXRofVxuICAgICAgICBwcm9ncmVzc1ZhbHVlPXtwcm9ncmVzc1ZhbHVlfVxuICAgICAgICBydW5EdXJhdGlvbj17dGhpcy5fcnVuICYmIHRoaXMuX3J1bi5nZXREdXJhdGlvbigpfVxuICAgICAgICAvLyBgVGVzdFJ1bm5lclBhbmVsYCBleHBlY3RzIGFuIEFycmF5IHNvIGl0IGNhbiByZW5kZXIgdGhlIHRlc3QgcnVubmVycyBpbiBhIGRyb3Bkb3duIGFuZFxuICAgICAgICAvLyBtYWludGFpbiBhIHNlbGVjdGVkIGluZGV4LiBgU2V0YCBtYWludGFpbnMgaXRlbXMgaW4gaW5zZXJ0aW9uIG9yZGVyLCBzbyB0aGUgb3JkZXJpbmcgaXNcbiAgICAgICAgLy8gZGV0ZXJtaW5hdGUgb24gZWFjaCByZW5kZXIuXG4gICAgICAgIHRlc3RSdW5uZXJzPXtBcnJheS5mcm9tKHRoaXMuX3Rlc3RSdW5uZXJzKX1cbiAgICAgICAgdGVzdFN1aXRlTW9kZWw9e3RoaXMuX3Rlc3RTdWl0ZU1vZGVsfVxuICAgICAgLz4sXG4gICAgICByb290LFxuICAgICAgZGlkUmVuZGVyXG4gICAgKTtcblxuICAgIGlmICghdGhpcy5fcGFuZWwpIHtcbiAgICAgIHRoaXMuX3BhbmVsID0gYXRvbS53b3Jrc3BhY2UuYWRkQm90dG9tUGFuZWwoe2l0ZW06IHJvb3QsIHZpc2libGU6IHRoaXMuX3N0YXRlLnBhbmVsVmlzaWJsZX0pO1xuICAgIH1cbiAgfVxuXG4gIF9zdG9wTGlzdGVuaW5nKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9ydW4gJiYgKHRoaXMuX3J1bi5kaXNwb3NlICE9IG51bGwpKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBkaXNwb3NlID0gdGhpcy5fcnVuLmRpc3Bvc2U7XG4gICAgICAgIHRoaXMuX3J1bi5kaXNwb3NlID0gbnVsbDtcbiAgICAgICAgdGhpcy5fcnVuLnN0b3AoKTtcbiAgICAgICAgaW52YXJpYW50KHRoaXMuX3J1bik7IC8vIENhbGxpbmcgYHN0b3AoKWAgc2hvdWxkIG5ldmVyIG51bGwgdGhlIGBfcnVuYCBwcm9wZXJ0eS5cbiAgICAgICAgdHJhY2soJ3Rlc3RydW5uZXItc3RvcC10ZXN0cycsIHtcbiAgICAgICAgICB0ZXN0UnVubmVyOiB0aGlzLl9ydW4ubGFiZWwsXG4gICAgICAgIH0pO1xuICAgICAgICBkaXNwb3NlKCk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGludmFyaWFudCh0aGlzLl9ydW4pOyAvLyBOb3RoaW5nIGluIHRoZSB0cnkgYmxvY2sgc2hvdWxkIGV2ZXIgbnVsbCB0aGUgYF9ydW5gIHByb3BlcnR5LlxuICAgICAgICAvLyBJZiB0aGUgcmVtb3RlIGNvbm5lY3Rpb24gZ29lcyBhd2F5LCBpdCB3b24ndCBiZSBwb3NzaWJsZSB0byBzdG9wIHRlc3RzLiBMb2cgYW4gZXJyb3IgYW5kXG4gICAgICAgIC8vIHByb2NlZWQgYXMgdXN1YWwuXG4gICAgICAgIGxvZ2dlci5lcnJvcihgRXJyb3Igd2hlbiBzdG9wcGluZyB0ZXN0IHJ1biAjJyR7dGhpcy5fcnVuLmxhYmVsfTogJHtlfWApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG59XG4iXX0=