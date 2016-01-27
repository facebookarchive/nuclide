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
        React.unmountComponentAtNode(this._root);
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

      this._testRunnerPanel = React.render(React.createElement(TestRunnerPanel, {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlRlc3RSdW5uZXJDb250cm9sbGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O3NCQWNzQixRQUFROzs7O0FBRTlCLElBQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQzs7ZUFDVixPQUFPLENBQUMsTUFBTSxDQUFDOztJQUE3QixVQUFVLFlBQVYsVUFBVTs7Z0JBQ0QsT0FBTyxDQUFDLGdCQUFnQixDQUFDOztJQUFsQyxLQUFLLGFBQUwsS0FBSzs7QUFDWixJQUFNLFlBQVksR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUMvQyxJQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsc0JBQXNCLENBQUMsQ0FBQztBQUN4RCxJQUFNLGNBQWMsR0FBRyxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQzs7Z0JBRW5DLE9BQU8sQ0FBQyxlQUFlLENBQUM7O0lBQWpDLEtBQUssYUFBTCxLQUFLOztBQUNaLElBQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUNwRCxJQUFNLEVBQUUsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7O2dCQUNULE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQzs7SUFBbkMsS0FBSyxhQUFMLEtBQUs7O0lBTU4sb0JBQW9CO0FBb0JiLFdBcEJQLG9CQUFvQixDQW9CWixLQUFpQyxFQUFFLFdBQTRCLEVBQUU7MEJBcEJ6RSxvQkFBb0I7O0FBcUJ0QixRQUFJLEtBQUssSUFBSSxJQUFJLEVBQUU7QUFDakIsV0FBSyxHQUFHLEVBQUUsQ0FBQztLQUNaOztBQUVELFFBQUksQ0FBQyxNQUFNLEdBQUc7QUFDWixrQkFBWSxFQUFFLEtBQUssQ0FBQyxZQUFZO0tBQ2pDLENBQUM7OztBQUdGLFFBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxVQUFVLEVBQUUsQ0FBQzs7QUFFaEMsQUFBQyxRQUFJLENBQUMsT0FBTyxVQUFnQixHQUFHLFlB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QUMsSUFBSSxJQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksQUFBQyxFQUFFO0FBQzVDLFlBQUk7QUFDRixjQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztBQUNsQyxjQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7QUFDekIsY0FBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNqQixtQ0FBVSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDckIsZUFBSyxDQUFDLHVCQUF1QixFQUFFO0FBQzdCLHNCQUFVLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLO1dBQzVCLENBQUMsQ0FBQztBQUNILGlCQUFPLEVBQUUsQ0FBQztTQUNYLENBQUMsT0FBTyxDQUFDLEVBQUU7QUFDVixtQ0FBVSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7OztBQUdyQixnQkFBTSxDQUFDLEtBQUssc0NBQW1DLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxVQUFLLENBQUMsQ0FBRyxDQUFDO1NBQ3pFO09BQ0Y7S0FDRjs7O1NBcFVHLG9CQUFvQjs7O0FBd1UxQixNQUFNLENBQUMsT0FBTyxHQUFHLG9CQUFvQixDQUFDIiwiZmlsZSI6IlRlc3RSdW5uZXJDb250cm9sbGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge1Rlc3RSdW5uZXIsIE1lc3NhZ2V9IGZyb20gJy4uLy4uL3Rlc3QtcnVubmVyLWludGVyZmFjZXMnO1xuaW1wb3J0IHR5cGUge051Y2xpZGVVcml9IGZyb20gJy4uLy4uL3JlbW90ZS11cmknO1xuaW1wb3J0IHR5cGUge09ic2VydmFibGV9IGZyb20gJ3J4JztcbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcblxuY29uc3QgQW5zaSA9IHJlcXVpcmUoJy4vQW5zaScpO1xuY29uc3Qge1RleHRCdWZmZXJ9ID0gcmVxdWlyZSgnYXRvbScpO1xuY29uc3Qge1JlYWN0fSA9IHJlcXVpcmUoJ3JlYWN0LWZvci1hdG9tJyk7XG5jb25zdCBUZXN0UnVuTW9kZWwgPSByZXF1aXJlKCcuL1Rlc3RSdW5Nb2RlbCcpO1xuY29uc3QgVGVzdFJ1bm5lclBhbmVsID0gcmVxdWlyZSgnLi91aS9UZXN0UnVubmVyUGFuZWwnKTtcbmNvbnN0IFRlc3RTdWl0ZU1vZGVsID0gcmVxdWlyZSgnLi9UZXN0U3VpdGVNb2RlbCcpO1xuXG5jb25zdCB7YXJyYXl9ID0gcmVxdWlyZSgnLi4vLi4vY29tbW9ucycpO1xuY29uc3QgbG9nZ2VyID0gcmVxdWlyZSgnLi4vLi4vbG9nZ2luZycpLmdldExvZ2dlcigpO1xuY29uc3Qgb3MgPSByZXF1aXJlKCdvcycpO1xuY29uc3Qge3RyYWNrfSA9IHJlcXVpcmUoJy4uLy4uL2FuYWx5dGljcycpO1xuXG5leHBvcnQgdHlwZSBUZXN0UnVubmVyQ29udHJvbGxlclN0YXRlID0ge1xuICBwYW5lbFZpc2libGU/OiBib29sZWFuO1xufTtcblxuY2xhc3MgVGVzdFJ1bm5lckNvbnRyb2xsZXIge1xuXG4gIF9hY3RpdmVUZXN0UnVubmVyOiA/T2JqZWN0O1xuICBfYnVmZmVyOiBUZXh0QnVmZmVyO1xuICBfZXhlY3V0aW9uU3RhdGU6IG51bWJlcjtcbiAgX3BhbmVsOiA/YXRvbSRQYW5lbDtcbiAgX3BhdGg6ID9zdHJpbmc7XG4gIF9yb290OiA/RWxlbWVudDtcbiAgX3J1bjogP1Rlc3RSdW5Nb2RlbDtcbiAgX3N0YXRlOiBPYmplY3Q7XG4gIF90ZXN0UnVubmVyczogU2V0PFRlc3RSdW5uZXI+O1xuICBfdGVzdFJ1bm5lclBhbmVsOiA/VGVzdFJ1bm5lclBhbmVsO1xuICBfdGVzdFN1aXRlTW9kZWw6ID9UZXN0U3VpdGVNb2RlbDtcblxuICAvLyBCb3VuZCBGdW5jdGlvbnMgZm9yIHVzZSBhcyBjYWxsYmFja3MuXG4gIGNsZWFyT3V0cHV0OiBGdW5jdGlvbjtcbiAgaGlkZVBhbmVsOiBGdW5jdGlvbjtcbiAgc3RvcFRlc3RzOiBGdW5jdGlvbjtcbiAgX2hhbmRsZUNsaWNrUnVuOiBGdW5jdGlvbjtcblxuICBjb25zdHJ1Y3RvcihzdGF0ZTogP1Rlc3RSdW5uZXJDb250cm9sbGVyU3RhdGUsIHRlc3RSdW5uZXJzOiBTZXQ8VGVzdFJ1bm5lcj4pIHtcbiAgICBpZiAoc3RhdGUgPT0gbnVsbCkge1xuICAgICAgc3RhdGUgPSB7fTtcbiAgICB9XG5cbiAgICB0aGlzLl9zdGF0ZSA9IHtcbiAgICAgIHBhbmVsVmlzaWJsZTogc3RhdGUucGFuZWxWaXNpYmxlLFxuICAgIH07XG5cbiAgICAvLyBUT0RPOiBVc2UgdGhlIFJlYWRPbmx5VGV4dEJ1ZmZlciBjbGFzcyBmcm9tIG51Y2xpZGUtYXRvbS10ZXh0LWVkaXRvciB3aGVuIGl0IGlzIGV4cG9ydGVkLlxuICAgIHRoaXMuX2J1ZmZlciA9IG5ldyBUZXh0QnVmZmVyKCk7XG4gICAgLy8gTWFrZSBgZGVsZXRlYCBhIG5vLW9wIHRvIGVmZmVjdGl2ZWx5IGNyZWF0ZSBhIHJlYWQtb25seSBidWZmZXIuXG4gICAgKHRoaXMuX2J1ZmZlcjogT2JqZWN0KS5kZWxldGUgPSAoKSA9PiB7fTtcblxuICAgIHRoaXMuX2V4ZWN1dGlvblN0YXRlID0gVGVzdFJ1bm5lclBhbmVsLkV4ZWN1dGlvblN0YXRlLlNUT1BQRUQ7XG4gICAgdGhpcy5fdGVzdFJ1bm5lcnMgPSB0ZXN0UnVubmVycztcbiAgICB0aGlzLl9yZW5kZXJQYW5lbCgpO1xuXG4gICAgLy8gQmluZCBGdW5jdGlvbnMgZm9yIHVzZSBhcyBjYWxsYmFja3M7XG4gICAgLy8gVE9ETzogUmVwbGFjZSB3aXRoIHByb3BlcnR5IGluaXRpYWxpemVycyB3aGVuIHN1cHBvcnRlZCBieSBGbG93O1xuICAgIHRoaXMuY2xlYXJPdXRwdXQgPSB0aGlzLmNsZWFyT3V0cHV0LmJpbmQodGhpcyk7XG4gICAgdGhpcy5oaWRlUGFuZWwgPSB0aGlzLmhpZGVQYW5lbC5iaW5kKHRoaXMpO1xuICAgIHRoaXMuc3RvcFRlc3RzID0gdGhpcy5zdG9wVGVzdHMuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9oYW5kbGVDbGlja1J1biA9IHRoaXMuX2hhbmRsZUNsaWNrUnVuLmJpbmQodGhpcyk7XG4gIH1cblxuICBjbGVhck91dHB1dCgpIHtcbiAgICB0aGlzLl9idWZmZXIuc2V0VGV4dCgnJyk7XG4gICAgdGhpcy5fcGF0aCA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLl9ydW4gPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5fc3RvcExpc3RlbmluZygpO1xuICAgIHRoaXMuX3Rlc3RTdWl0ZU1vZGVsID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuX3JlbmRlclBhbmVsKCk7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMuX3N0b3BMaXN0ZW5pbmcoKTtcbiAgICBpZiAodGhpcy5fcm9vdCkge1xuICAgICAgUmVhY3QudW5tb3VudENvbXBvbmVudEF0Tm9kZSh0aGlzLl9yb290KTtcbiAgICAgIHRoaXMuX3Jvb3QgPSBudWxsO1xuICAgIH1cbiAgICBpZiAodGhpcy5fcGFuZWwpIHtcbiAgICAgIHRoaXMuX3BhbmVsLmRlc3Ryb3koKTtcbiAgICAgIHRoaXMuX3BhbmVsID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBkaWRVcGRhdGVUZXN0UnVubmVycygpIHtcbiAgICB0aGlzLl9yZW5kZXJQYW5lbCgpO1xuICB9XG5cbiAgaGlkZVBhbmVsKCkge1xuICAgIHRoaXMuc3RvcFRlc3RzKCk7XG4gICAgdGhpcy5fc3RhdGUucGFuZWxWaXNpYmxlID0gZmFsc2U7XG4gICAgaWYgKHRoaXMuX3BhbmVsKSB7XG4gICAgICB0aGlzLl9wYW5lbC5oaWRlKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm4gQSBQcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2hlbiB0ZXN0aW5nIGhhcyBzdWNjZXNmdWxseSBzdGFydGVkLlxuICAgKi9cbiAgYXN5bmMgcnVuVGVzdHMocGF0aD86IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIElmIHRoZSB0ZXN0IHJ1bm5lciBwYW5lbCBpcyBub3QgcmVuZGVyZWQgeWV0LCBlbnN1cmUgaXQgaXMgcmVuZGVyZWQgYmVmb3JlIGNvbnRpbnVpbmcuXG4gICAgaWYgKHRoaXMuX3Rlc3RSdW5uZXJQYW5lbCA9PSBudWxsIHx8ICF0aGlzLl9zdGF0ZS5wYW5lbFZpc2libGUpIHtcbiAgICAgIGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgdGhpcy5zaG93UGFuZWwocmVzb2x2ZSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fdGVzdFJ1bm5lclBhbmVsID09IG51bGwpIHtcbiAgICAgIGxvZ2dlci5lcnJvcignVGVzdCBydW5uZXIgcGFuZWwgZGlkIG5vdCByZW5kZXIgYXMgZXhwZWN0ZWQuIEFib3J0aW5nIHRlc3RpbmcuJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gR2V0IHNlbGVjdGVkIHRlc3QgcnVubmVyIHdoZW4gRmxvdyBrbm93cyBgdGhpcy5fdGVzdFJ1bm5lclBhbmVsYCBpcyBkZWZpbmVkLlxuICAgIGNvbnN0IHNlbGVjdGVkVGVzdFJ1bm5lciA9IHRoaXMuX3Rlc3RSdW5uZXJQYW5lbC5nZXRTZWxlY3RlZFRlc3RSdW5uZXIoKTtcbiAgICBpZiAoIXNlbGVjdGVkVGVzdFJ1bm5lcikge1xuICAgICAgbG9nZ2VyLndhcm4oYE5vIHRlc3QgcnVubmVyIHNlbGVjdGVkLiBBY3RpdmUgdGVzdCBydW5uZXJzOiAke3RoaXMuX3Rlc3RSdW5uZXJzLnNpemV9YCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gMS4gVXNlIHRoZSBgcGF0aGAgYXJndW1lbnQgdG8gdGhpcyBmdW5jdGlvblxuICAgIC8vIDIuIFVzZSBgdGhpcy5fcGF0aGAgb24gdGhlIGluc3RhbmNlXG4gICAgLy8gMy4gTGV0IGB0ZXN0UGF0aGAgYmUgYHVuZGVmaW5lZGAgc28gdGhlIHBhdGggd2lsbCBiZSB0YWtlbiBmcm9tIHRoZSBhY3RpdmUgYFRleHRFZGl0b3JgXG4gICAgbGV0IHRlc3RQYXRoID0gKHBhdGggPT09IHVuZGVmaW5lZCkgPyB0aGlzLl9wYXRoIDogcGF0aDtcblxuICAgIC8vIElmIHRoZXJlJ3Mgbm8gcGF0aCB5ZXQsIGdldCB0aGUgcGF0aCBmcm9tIHRoZSBhY3RpdmUgYFRleHRFZGl0b3JgLlxuICAgIGlmICh0ZXN0UGF0aCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBjb25zdCBhY3RpdmVUZXh0RWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICAgICAgaWYgKCFhY3RpdmVUZXh0RWRpdG9yKSB7XG4gICAgICAgIGxvZ2dlci5kZWJ1ZygnQXR0ZW1wdGVkIHRvIHJ1biB0ZXN0cyB3aXRoIG5vIGFjdGl2ZSB0ZXh0IGVkaXRvci4nKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBJZiB0aGUgYWN0aXZlIHRleHQgZWRpdG9yIGhhcyBubyBwYXRoLCBiYWlsIGJlY2F1c2UgdGhlcmUncyBub3doZXJlIHRvIHJ1biB0ZXN0cy5cbiAgICAgIHRlc3RQYXRoID0gYWN0aXZlVGV4dEVkaXRvci5nZXRQYXRoKCk7XG4gICAgfVxuXG4gICAgaWYgKCF0ZXN0UGF0aCkge1xuICAgICAgbG9nZ2VyLndhcm4oJ0F0dGVtcHRlZCB0byBydW4gdGVzdHMgb24gYW4gZWRpdG9yIHdpdGggbm8gcGF0aC4nKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLmNsZWFyT3V0cHV0KCk7XG4gICAgdGhpcy5fcnVuVGVzdFJ1bm5lclNlcnZpY2VGb3JQYXRoKFxuICAgICAgc2VsZWN0ZWRUZXN0UnVubmVyLnJ1blRlc3QodGVzdFBhdGgpLFxuICAgICAgdGVzdFBhdGgsXG4gICAgICBzZWxlY3RlZFRlc3RSdW5uZXIubGFiZWwpO1xuICAgIHRyYWNrKCd0ZXN0cnVubmVyLXJ1bi10ZXN0cycsIHtcbiAgICAgIHBhdGg6IHRlc3RQYXRoLFxuICAgICAgdGVzdFJ1bm5lcjogc2VsZWN0ZWRUZXN0UnVubmVyLmxhYmVsLFxuICAgIH0pO1xuXG4gICAgLy8gU2V0IHN0YXRlIGFzIFwiUnVubmluZ1wiIHRvIGdpdmUgaW1tZWRpYXRlIGZlZWRiYWNrIGluIHRoZSBVSS5cbiAgICB0aGlzLl9zZXRFeGVjdXRpb25TdGF0ZShUZXN0UnVubmVyUGFuZWwuRXhlY3V0aW9uU3RhdGUuUlVOTklORyk7XG4gICAgdGhpcy5fcGF0aCA9IHRlc3RQYXRoO1xuICAgIHRoaXMuX3JlbmRlclBhbmVsKCk7XG4gIH1cblxuICBzdG9wVGVzdHMoKTogdm9pZCB7XG4gICAgdGhpcy5fc3RvcExpc3RlbmluZygpO1xuXG4gICAgLy8gUmVzcG9uZCBpbiB0aGUgVUkgaW1tZWRpYXRlbHkgYW5kIGFzc3VtZSB0aGUgcHJvY2VzcyBpcyBwcm9wZXJseSBraWxsZWQuXG4gICAgdGhpcy5fc2V0RXhlY3V0aW9uU3RhdGUoVGVzdFJ1bm5lclBhbmVsLkV4ZWN1dGlvblN0YXRlLlNUT1BQRUQpO1xuICB9XG5cbiAgc2VyaWFsaXplKCk6IFRlc3RSdW5uZXJDb250cm9sbGVyU3RhdGUge1xuICAgIHJldHVybiB0aGlzLl9zdGF0ZTtcbiAgfVxuXG4gIHNob3dQYW5lbChkaWRSZW5kZXI/OiAoKSA9PiBtaXhlZCk6IHZvaWQge1xuICAgIHRyYWNrKCd0ZXN0cnVubmVyLXNob3ctcGFuZWwnKTtcbiAgICB0aGlzLl9zdGF0ZS5wYW5lbFZpc2libGUgPSB0cnVlO1xuICAgIHRoaXMuX3JlbmRlclBhbmVsKGRpZFJlbmRlcik7XG4gICAgaWYgKHRoaXMuX3BhbmVsKSB7XG4gICAgICB0aGlzLl9wYW5lbC5zaG93KCk7XG4gICAgfVxuICB9XG5cbiAgdG9nZ2xlUGFuZWwoKTogdm9pZCB7XG4gICAgdHJhY2soJ3Rlc3RydW5uZXItaGlkZS1wYW5lbCcpO1xuICAgIGlmICh0aGlzLl9zdGF0ZS5wYW5lbFZpc2libGUpIHtcbiAgICAgIHRoaXMuaGlkZVBhbmVsKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc2hvd1BhbmVsKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgYW4gZW5kLW9mLWxpbmUgY2hhcmFjdGVyIHRvIGB0ZXh0YCBhbmQgYXBwZW5kcyB0aGUgcmVzdWx0aW5nIHN0cmluZyB0byB0aGlzIGNvbnRyb2xsZXInc1xuICAgKiB0ZXh0IGJ1ZmZlci5cbiAgICovXG4gIF9hcHBlbmRUb0J1ZmZlcih0ZXh0OiBzdHJpbmcpOiB2b2lkIHtcbiAgICAvLyBgdW5kbzogJ3NraXAnYCBkaXNhYmxlcyB0aGUgVGV4dEVkaXRvcidzIFwidW5kbyBzeXN0ZW1cIi4gU2luY2UgdGhlIGJ1ZmZlciBpcyBtYW5hZ2VkIGJ5IHRoaXNcbiAgICAvLyBjbGFzcywgYW4gdW5kbyB3aWxsIG5ldmVyIGhhcHBlbi4gRGlzYWJsZSBpdCB3aGVuIGFwcGVuZGluZyB0byBwcmV2ZW50IGRvaW5nIHVubmVlZGVkXG4gICAgLy8gYm9va2tlZXBpbmcuXG4gICAgLy9cbiAgICAvLyBAc2VlIHtAbGluayBodHRwczovL2F0b20uaW8vZG9jcy9hcGkvdjEuMC40L1RleHRCdWZmZXIjaW5zdGFuY2UtYXBwZW5kfFRleHRCdWZmZXI6OmFwcGVuZH1cbiAgICB0aGlzLl9idWZmZXIuYXBwZW5kKGAke3RleHR9JHtvcy5FT0x9YCwge3VuZG86ICdza2lwJ30pO1xuICB9XG5cbiAgX2hhbmRsZUNsaWNrUnVuKGV2ZW50OiBTeW50aGV0aWNNb3VzZUV2ZW50KTogdm9pZCB7XG4gICAgLy8gRG9uJ3QgcGFzcyBhIHJlZmVyZW5jZSB0byBgcnVuVGVzdHNgIGRpcmVjdGx5IGJlY2F1c2UgdGhlIGNhbGxiYWNrIHJlY2VpdmVzIGEgbW91c2UgZXZlbnQgYXNcbiAgICAvLyBpdHMgYXJndW1lbnQuIGBydW5UZXN0c2AgbmVlZHMgdG8gYmUgY2FsbGVkIHdpdGggbm8gYXJndW1lbnRzLlxuICAgIHRoaXMucnVuVGVzdHMoKTtcbiAgfVxuXG4gIF9ydW5UZXN0UnVubmVyU2VydmljZUZvclBhdGgodGVzdFJ1bjogT2JzZXJ2YWJsZTxNZXNzYWdlPiwgcGF0aDogTnVjbGlkZVVyaSwgbGFiZWw6IHN0cmluZyk6XG4gICAgICB2b2lkIHtcbiAgICBjb25zdCBzdWJzY3JpcHRpb24gPSB0ZXN0UnVuXG4gICAgICAuZG9Pbk5leHQoKG1lc3NhZ2U6IE1lc3NhZ2UpID0+IHtcbiAgICAgICAgc3dpdGNoIChtZXNzYWdlLmtpbmQpIHtcbiAgICAgICAgICBjYXNlICdzdW1tYXJ5JzpcbiAgICAgICAgICAgIHRoaXMuX3Rlc3RTdWl0ZU1vZGVsID0gbmV3IFRlc3RTdWl0ZU1vZGVsKG1lc3NhZ2Uuc3VtbWFyeUluZm8pO1xuICAgICAgICAgICAgdGhpcy5fcmVuZGVyUGFuZWwoKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ3J1bi10ZXN0JzpcbiAgICAgICAgICAgIGNvbnN0IHRlc3RJbmZvID0gbWVzc2FnZS50ZXN0SW5mbztcbiAgICAgICAgICAgIGlmICh0aGlzLl90ZXN0U3VpdGVNb2RlbCkge1xuICAgICAgICAgICAgICB0aGlzLl90ZXN0U3VpdGVNb2RlbC5hZGRUZXN0UnVuKHRlc3RJbmZvKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gSWYgYSB0ZXN0IHJ1biB0aHJvd3MgYW4gZXhjZXB0aW9uLCB0aGUgc3RhY2sgdHJhY2UgaXMgcmV0dXJuZWQgaW4gJ2RldGFpbHMnLlxuICAgICAgICAgICAgLy8gQXBwZW5kIGl0cyBlbnRpcmV0eSB0byB0aGUgY29uc29sZS5cbiAgICAgICAgICAgIGlmICh0ZXN0SW5mby5oYXNPd25Qcm9wZXJ0eSgnZGV0YWlscycpICYmIHRlc3RJbmZvLmRldGFpbHMgIT09ICcnKSB7XG4gICAgICAgICAgICAgIC8vICRGbG93Rml4TWUocGV0ZXJoYWwpXG4gICAgICAgICAgICAgIHRoaXMuX2FwcGVuZFRvQnVmZmVyKHRlc3RJbmZvLmRldGFpbHMpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBBcHBlbmQgYSBQQVNTL0ZBSUwgbWVzc2FnZSBkZXBlbmRpbmcgb24gd2hldGhlciB0aGUgY2xhc3MgaGFzIHRlc3QgZmFpbHVyZXMuXG4gICAgICAgICAgICB0aGlzLl9hcHBlbmRUb0J1ZmZlcihUZXN0UnVuTW9kZWwuZm9ybWF0U3RhdHVzTWVzc2FnZShcbiAgICAgICAgICAgICAgdGVzdEluZm8ubmFtZSxcbiAgICAgICAgICAgICAgdGVzdEluZm8uZHVyYXRpb25TZWNzLFxuICAgICAgICAgICAgICB0ZXN0SW5mby5zdGF0dXNcbiAgICAgICAgICAgICkpO1xuICAgICAgICAgICAgdGhpcy5fcmVuZGVyUGFuZWwoKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ3N0YXJ0JzpcbiAgICAgICAgICAgIGlmICh0aGlzLl9ydW4pIHtcbiAgICAgICAgICAgICAgdGhpcy5fcnVuLnN0YXJ0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdlcnJvcic6XG4gICAgICAgICAgICBjb25zdCBlcnJvciA9IG1lc3NhZ2UuZXJyb3I7XG4gICAgICAgICAgICBpZiAodGhpcy5fcnVuKSB7XG4gICAgICAgICAgICAgIHRoaXMuX3J1bi5zdG9wKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZXJyb3IuY29kZSA9PT0gJ0VOT0VOVCcpIHtcbiAgICAgICAgICAgICAgdGhpcy5fYXBwZW5kVG9CdWZmZXIoXG4gICAgICAgICAgICAgICAgYCR7QW5zaS5ZRUxMT1d9Q29tbWFuZCAnJHtlcnJvci5wYXRofScgZG9lcyBub3QgZXhpc3Qke0Fuc2kuUkVTRVR9YCk7XG4gICAgICAgICAgICAgIHRoaXMuX2FwcGVuZFRvQnVmZmVyKGAke0Fuc2kuWUVMTE9XfUFyZSB5b3UgdHJ5aW5nIHRvIHJ1biByZW1vdGVseT8ke0Fuc2kuUkVTRVR9YCk7XG4gICAgICAgICAgICAgIHRoaXMuX2FwcGVuZFRvQnVmZmVyKGAke0Fuc2kuWUVMTE9XfVBhdGg6ICR7cGF0aH0ke0Fuc2kuUkVTRVR9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl9hcHBlbmRUb0J1ZmZlcihgJHtBbnNpLlJFRH1PcmlnaW5hbCBFcnJvcjogJHtlcnJvci5tZXNzYWdlfSR7QW5zaS5SRVNFVH1gKTtcbiAgICAgICAgICAgIHRoaXMuX3NldEV4ZWN1dGlvblN0YXRlKFRlc3RSdW5uZXJQYW5lbC5FeGVjdXRpb25TdGF0ZS5TVE9QUEVEKTtcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcihgRXJyb3IgcnVubmluZyB0ZXN0czogXCIke2Vycm9yLm1lc3NhZ2V9XCJgKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ3N0ZGVycic6XG4gICAgICAgICAgICAvLyBDb2xvciBzdGRlcnIgb3V0cHV0IHJlZCBpbiB0aGUgY29uc29sZSB0byBkaXN0aW5ndWlzaCBpdCBhcyBlcnJvci5cbiAgICAgICAgICAgIHRoaXMuX2FwcGVuZFRvQnVmZmVyKGAke0Fuc2kuUkVEfSR7bWVzc2FnZS5kYXRhfSR7QW5zaS5SRVNFVH1gKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgLmZpbmFsbHkoKCkgPT4ge1xuICAgICAgICB0aGlzLl9zdG9wTGlzdGVuaW5nKCk7XG4gICAgICAgIHRoaXMuX3NldEV4ZWN1dGlvblN0YXRlKFRlc3RSdW5uZXJQYW5lbC5FeGVjdXRpb25TdGF0ZS5TVE9QUEVEKTtcbiAgICAgIH0pXG4gICAgICAuc3Vic2NyaWJlKCk7XG4gICAgdGhpcy5fcnVuID0gbmV3IFRlc3RSdW5Nb2RlbChsYWJlbCwgc3Vic2NyaXB0aW9uLmRpc3Bvc2UuYmluZChzdWJzY3JpcHRpb24pKTtcbiAgfVxuXG4gIF9zZXRFeGVjdXRpb25TdGF0ZShleGVjdXRpb25TdGF0ZTogbnVtYmVyKTogdm9pZCB7XG4gICAgdGhpcy5fZXhlY3V0aW9uU3RhdGUgPSBleGVjdXRpb25TdGF0ZTtcbiAgICB0aGlzLl9yZW5kZXJQYW5lbCgpO1xuICB9XG5cbiAgX3JlbmRlclBhbmVsKGRpZFJlbmRlcj86ICgpID0+IG1peGVkKSB7XG4gICAgLy8gSW5pdGlhbGl6ZSBhbmQgcmVuZGVyIHRoZSBjb250ZW50cyBvZiB0aGUgcGFuZWwgb25seSBpZiB0aGUgaG9zdGluZyBjb250YWluZXIgaXMgdmlzaWJsZSBieVxuICAgIC8vIHRoZSB1c2VyJ3MgY2hvaWNlLlxuICAgIGlmICghdGhpcy5fc3RhdGUucGFuZWxWaXNpYmxlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IHJvb3QgPSB0aGlzLl9yb290O1xuXG4gICAgaWYgKCFyb290KSB7XG4gICAgICByb290ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICB0aGlzLl9yb290ID0gcm9vdDtcbiAgICB9XG5cbiAgICBsZXQgcHJvZ3Jlc3NWYWx1ZTtcbiAgICBpZiAgKHRoaXMuX3Rlc3RTdWl0ZU1vZGVsICYmIHRoaXMuX2V4ZWN1dGlvblN0YXRlID09PSBUZXN0UnVubmVyUGFuZWwuRXhlY3V0aW9uU3RhdGUuUlVOTklORykge1xuICAgICAgcHJvZ3Jlc3NWYWx1ZSA9IHRoaXMuX3Rlc3RTdWl0ZU1vZGVsLnByb2dyZXNzUGVyY2VudCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBJZiB0aGVyZSBpcyBubyBydW5uaW5nIHRlc3Qgc3VpdGUsIGZpbGwgdGhlIHByb2dyZXNzIGJhciBiZWNhdXNlIHRoZXJlIGlzIG5vIHByb2dyZXNzIHRvXG4gICAgICAvLyB0cmFjay5cbiAgICAgIHByb2dyZXNzVmFsdWUgPSAxMDA7XG4gICAgfVxuXG4gICAgdGhpcy5fdGVzdFJ1bm5lclBhbmVsID0gUmVhY3QucmVuZGVyKFxuICAgICAgPFRlc3RSdW5uZXJQYW5lbFxuICAgICAgICBidWZmZXI9e3RoaXMuX2J1ZmZlcn1cbiAgICAgICAgZXhlY3V0aW9uU3RhdGU9e3RoaXMuX2V4ZWN1dGlvblN0YXRlfVxuICAgICAgICBvbkNsaWNrQ2xlYXI9e3RoaXMuY2xlYXJPdXRwdXR9XG4gICAgICAgIG9uQ2xpY2tDbG9zZT17dGhpcy5oaWRlUGFuZWx9XG4gICAgICAgIG9uQ2xpY2tSdW49e3RoaXMuX2hhbmRsZUNsaWNrUnVufVxuICAgICAgICBvbkNsaWNrU3RvcD17dGhpcy5zdG9wVGVzdHN9XG4gICAgICAgIHBhdGg9e3RoaXMuX3BhdGh9XG4gICAgICAgIHByb2dyZXNzVmFsdWU9e3Byb2dyZXNzVmFsdWV9XG4gICAgICAgIHJ1bkR1cmF0aW9uPXt0aGlzLl9ydW4gJiYgdGhpcy5fcnVuLmdldER1cmF0aW9uKCl9XG4gICAgICAgIC8vIGBUZXN0UnVubmVyUGFuZWxgIGV4cGVjdHMgYW4gQXJyYXkgc28gaXQgY2FuIHJlbmRlciB0aGUgdGVzdCBydW5uZXJzIGluIGEgZHJvcGRvd24gYW5kXG4gICAgICAgIC8vIG1haW50YWluIGEgc2VsZWN0ZWQgaW5kZXguIGBTZXRgIG1haW50YWlucyBpdGVtcyBpbiBpbnNlcnRpb24gb3JkZXIsIHNvIHRoZSBvcmRlcmluZyBpc1xuICAgICAgICAvLyBkZXRlcm1pbmF0ZSBvbiBlYWNoIHJlbmRlci5cbiAgICAgICAgdGVzdFJ1bm5lcnM9e2FycmF5LmZyb20odGhpcy5fdGVzdFJ1bm5lcnMpfVxuICAgICAgICB0ZXN0U3VpdGVNb2RlbD17dGhpcy5fdGVzdFN1aXRlTW9kZWx9XG4gICAgICAvPixcbiAgICAgIHJvb3QsXG4gICAgICBkaWRSZW5kZXJcbiAgICApO1xuXG4gICAgaWYgKCF0aGlzLl9wYW5lbCkge1xuICAgICAgdGhpcy5fcGFuZWwgPSBhdG9tLndvcmtzcGFjZS5hZGRCb3R0b21QYW5lbCh7aXRlbTogcm9vdCwgdmlzaWJsZTogdGhpcy5fc3RhdGUucGFuZWxWaXNpYmxlfSk7XG4gICAgfVxuICB9XG5cbiAgX3N0b3BMaXN0ZW5pbmcoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX3J1biAmJiAodGhpcy5fcnVuLmRpc3Bvc2UgIT0gbnVsbCkpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGRpc3Bvc2UgPSB0aGlzLl9ydW4uZGlzcG9zZTtcbiAgICAgICAgdGhpcy5fcnVuLmRpc3Bvc2UgPSBudWxsO1xuICAgICAgICB0aGlzLl9ydW4uc3RvcCgpO1xuICAgICAgICBpbnZhcmlhbnQodGhpcy5fcnVuKTsgLy8gQ2FsbGluZyBgc3RvcCgpYCBzaG91bGQgbmV2ZXIgbnVsbCB0aGUgYF9ydW5gIHByb3BlcnR5LlxuICAgICAgICB0cmFjaygndGVzdHJ1bm5lci1zdG9wLXRlc3RzJywge1xuICAgICAgICAgIHRlc3RSdW5uZXI6IHRoaXMuX3J1bi5sYWJlbCxcbiAgICAgICAgfSk7XG4gICAgICAgIGRpc3Bvc2UoKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgaW52YXJpYW50KHRoaXMuX3J1bik7IC8vIE5vdGhpbmcgaW4gdGhlIHRyeSBibG9jayBzaG91bGQgZXZlciBudWxsIHRoZSBgX3J1bmAgcHJvcGVydHkuXG4gICAgICAgIC8vIElmIHRoZSByZW1vdGUgY29ubmVjdGlvbiBnb2VzIGF3YXksIGl0IHdvbid0IGJlIHBvc3NpYmxlIHRvIHN0b3AgdGVzdHMuIExvZyBhbiBlcnJvciBhbmRcbiAgICAgICAgLy8gcHJvY2VlZCBhcyB1c3VhbC5cbiAgICAgICAgbG9nZ2VyLmVycm9yKGBFcnJvciB3aGVuIHN0b3BwaW5nIHRlc3QgcnVuICMnJHt0aGlzLl9ydW4ubGFiZWx9OiAke2V9YCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBUZXN0UnVubmVyQ29udHJvbGxlcjtcbiJdfQ==