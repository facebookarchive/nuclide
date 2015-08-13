'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type TestRunner from './TestRunner';

var Ansi = require('./Ansi');
var {
  CompositeDisposable,
  TextBuffer,
} = require('atom');
var React = require('react-for-atom');
var TestRunModel = require('./TestRunModel');
var TestRunnerPanel = require('./ui/TestRunnerPanel');
var TestSuiteModel = require('./TestSuiteModel');

var {array} = require('nuclide-commons');
var logger = require('nuclide-logging').getLogger();
var os = require('os');
var pathUtil = require('path');
var {track} = require('nuclide-analytics');

export type TestRunnerControllerState = {
  panelVisible?: boolean;
};

class TestRunnerController {

  _activeTestRunner: ?Object;
  _buffer: TextBuffer;
  _compositeDisposable: ?CompositeDisposable;
  _executionState: number;
  _panel: ?atom$Panel;
  _path: ?string;
  _root: ?Element;
  _run: ?TestRunModel;
  _state: Object;
  _testRunners: Set<TestRunner>;
  _testRunnerPanel: ?TestRunnerPanel;
  _testSuiteModel: ?TestSuiteModel;

  // Bound Functions for use as callbacks.
  clearOutput: Function;
  hidePanel: Function;
  runTests: Function;
  stopTests: Function;

  constructor(state: ?TestRunnerControllerState = {}, testRunners: Set<TestRunner>) {
    this._state = {
      panelVisible: state.panelVisible,
    };

    // TODO: Use the ReadOnlyTextBuffer class from nuclide-atom-text-editor when it is exported.
    this._buffer = new TextBuffer();
    // Make `delete` a no-op to effectively create a read-only buffer.
    this._buffer.delete = () => {};

    this._executionState = TestRunnerPanel.ExecutionState.STOPPED;
    this._testRunners = testRunners;
    this._renderPanel();

    // Bind Functions for use as callbacks;
    // TODO: Replace with property initializers when supported by Flow;
    this.clearOutput = this.clearOutput.bind(this);
    this.hidePanel = this.hidePanel.bind(this);
    this.runTests = this.runTests.bind(this);
    this.stopTests = this.stopTests.bind(this);
  }

  clearOutput() {
    this._buffer.setText('');
    this._path = '';
    this._run = null;
    this._stopListening();
    this._testSuiteModel = null;
    this._renderPanel();
  }

  destroy() {
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

  didUpdateTestRunners() {
    this._renderPanel();
  }

  hidePanel() {
    this._state.panelVisible = false;
    if (this._panel) {
      this._panel.hide();
    }
  }

  runTests(): void {
    // If the test runner panel is not rendered yet, bail because it's not possible to do work.
    if (!this._testRunnerPanel) {
      logger.warn('Attempted to run tests with a null or undefined test runner panel.');
      return;
    }

    // Get selected test runner when Flow knows `this._testRunnerPanel` is defined.
    var selectedTestRunner = this._testRunnerPanel.getSelectedTestRunner();
    if (!selectedTestRunner) {
      logger.warn(`No test runner selected. Active test runners: ${this._testRunners.size}`);
      return;
    }

    // Only do work if the active item is a text editor because it will likely have a path, which
    // will be the root of the test running.
    var activeTextEditor = atom.workspace.getActiveTextEditor();
    if (!activeTextEditor) {
      logger.debug('Attempted to run tests with no active text editor.');
      return;
    }

    // If the active text editor has no path, bail because there's nowhere to run tests.
    var activeTextEditorPath = activeTextEditor.getPath();
    if (!activeTextEditorPath) {
      logger.warn('Attempted to run tests on an editor with no path.');
      return;
    }

    // If there's no test runner service for the URI of the active text editor, nothing further can
    // be done.
    var testRunnerService = selectedTestRunner.getByUri(activeTextEditorPath);
    if (!testRunnerService) {
      logger.warn(`No test runner service found for path "${activeTextEditorPath}"`);
      return;
    }

    this.clearOutput();
    this._runTestRunnerServiceForPath(testRunnerService, activeTextEditorPath);
    track('testrunner-run-tests', {
      path: activeTextEditorPath,
      testRunner: selectedTestRunner.label,
    });

    // Set state as "Running" to give immediate feedback in the UI.
    this._setExecutionState(TestRunnerPanel.ExecutionState.RUNNING);
    this._path = activeTextEditorPath;
    this._renderPanel();
  }

  stopTests(): void {
    if (this._run && this._run.testRunner) {
      this._run.testRunner.stop(this._run.id);
    }

    // Respond in the UI immediately and assume the process is properly killed.
    this._setExecutionState(TestRunnerPanel.ExecutionState.STOPPED);
    this._stopListening();
  }

  serialize(): TestRunnerControllerState {
    return this._state;
  }

  showPanel(): void {
    this._state.panelVisible = true;
    this._renderPanel();
    if (this._panel) {
      this._panel.show();
    }
  }

  togglePanel(): void {
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
  _appendToBuffer(text: string): void {
    // `undo: 'skip'` disables the TextEditor's "undo system". Since the buffer is managed by this
    // class, an undo will never happen. Disable it when appending to prevent doing unneeded
    // bookkeeping.
    //
    // @see https://atom.io/docs/api/v1.0.4/TextBuffer#instance-append
    this._buffer.append(`${text}${os.EOL}`, {undo: 'skip'});
  }

  _runTestRunnerServiceForPath(testRunnerService: Object, path: NuclideUri): void {
    var disposables = new CompositeDisposable();

    disposables.add(
      testRunnerService.onDidRunSummary(value => {
        var {summaryInfo} = value;
        this._testSuiteModel = new TestSuiteModel(summaryInfo);
        this._renderPanel();
      })
    );
    disposables.add(
      testRunnerService.onDidRunTest(value => {
        var {testInfo} = value;
        if (this._testSuiteModel) {
          this._testSuiteModel.addTestRun(testInfo);
        }

        // If a test run throws an exception, the stack trace is returned in 'details'. Append its
        // entirety to the console.
        if (testInfo.details !== '') {
          this._appendToBuffer(testInfo.details);
        }

        // Append a PASS/FAIL message depending on whether the class has test failures.
        this._appendToBuffer(TestRunModel.formatStatusMessage(
          testInfo.name,
          testInfo.durationSecs,
          testInfo.status
        ));
        this._renderPanel();
      })
    );
    disposables.add(
      testRunnerService.onDidStart(() => {
        if (this._run) {
          this._run.start();
        }
      })
    );
    disposables.add(
      testRunnerService.onDidEnd(() => {
        if (this._run) {
          this._run.stop();
        }
        this._stopListening();
        this._setExecutionState(TestRunnerPanel.ExecutionState.STOPPED);
      })
    );
    disposables.add(
      testRunnerService.onError(info => {
        if (this._run) {
          this._run.stop();
        }
        this._appendToBuffer(info.error.message);
        this._setExecutionState(TestRunnerPanel.ExecutionState.STOPPED);
        logger.error(`Error running tests: "${info.error.message}"`);
      })
    );
    disposables.add(
      testRunnerService.onStderrData(info => {
        // Color stderr output red in the console to distinguish it as error.
        this._appendToBuffer(`${Ansi.RED}${info.data}${Ansi.RESET}`);
      })
    );

    // Keep a reference to listeners so they can be removed when testing ends or when this instance
    // is destroyed.
    this._compositeDisposable = disposables;

    // Run tests in the path's containing directory.
    // TODO: Run exactly the path given when it's possible to run tests from a directory in the file
    // tree.
    testRunnerService.run(pathUtil.dirname(path)).then(runId => {
      this._run = new TestRunModel(runId, testRunnerService);
    });
  }

  _setExecutionState(executionState: number): void {
    this._executionState = executionState;
    this._renderPanel();
  }

  _renderPanel() {
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

    var progressValue;
    if  (this._testSuiteModel && this._executionState === TestRunnerPanel.ExecutionState.RUNNING) {
      progressValue = this._testSuiteModel.progressPercent();
    } else {
      // If there is no running test suite, fill the progress bar because there is no progress to
      // track.
      progressValue = 100;
    }

    this._testRunnerPanel = React.render(
      <TestRunnerPanel
        buffer={this._buffer}
        executionState={this._executionState}
        onClickClear={this.clearOutput}
        onClickClose={this.hidePanel}
        onClickRun={this.runTests}
        onClickStop={this.stopTests}
        path={this._path}
        progressValue={progressValue}
        runDuration={this._run && this._run.getDuration()}
        // `TestRunnerPanel` expects an Array so it can render the test runners in a dropdown and
        // maintain a selected index. `Set` maintains items in insertion order, so the ordering is
        // determinate on each render.
        testRunners={array.from(this._testRunners)}
        testSuiteModel={this._testSuiteModel}
      />,
      root
    );

    if (!this._panel) {
      this._panel = atom.workspace.addBottomPanel({item: root, visible: this._state.panelVisible});
    }
  }

  _stopListening(): void {
    if (this._compositeDisposable) {
      this._compositeDisposable.dispose();
    }
  }

}

module.exports = TestRunnerController;
