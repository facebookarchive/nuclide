'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const Console = require('./Console');
const NuclideUiDropdown = require('nuclide-ui-dropdown');
const {PanelComponent} = require('nuclide-ui-panel');
const {createPaneContainer} = require('nuclide-atom-helpers');
const React = require('react-for-atom');
const TestClassTree = require('./TestClassTree');

const pathUtil = require('path');

const {PropTypes} = React;

function runStopButtonClassName(icon: string, className: string): string {
  return `btn btn-sm icon inline-block icon-${icon} ${className}`;
}

class TestRunnerPanel extends React.Component {

  _paneContainer: Object;
  _leftPane: atom$Pane;
  _rightPane: atom$Pane;
  _textEditorModel: TextEditor;
  _tree: TestClassTree;

  // Bound Functions for use as callbacks.
  setSelectedTestRunnerIndex: Function;

  constructor(props: Object) {
    super(props);
    this.state = {
      roots: [],
      // If there are test runners, start with the first one selected. Otherwise store -1 to
      // later indicate there were no active test runners.
      selectedTestRunnerIndex: props.testRunners.length > 0 ? 0 : -1,
    };

    // Bind Functions for use as callbacks;
    // TODO: Replace with property initializers when supported by Flow;
    this.setSelectedTestRunnerIndex = this.setSelectedTestRunnerIndex.bind(this);
  }

  componentDidMount() {
    this._paneContainer = createPaneContainer();
    this._leftPane = this._paneContainer.getActivePane();
    this._rightPane = this._leftPane.splitRight({
      // Prevent Atom from cloning children on splitting; this panel wants an empty container.
      copyActiveItem: false,
      // Make the right pane 2/3 the width of the parent since console output is generally wider
      // than the test tree.
      flexScale: 2,
    });

    this.renderTree();
    this.renderConsole();

    React.findDOMNode(this.refs['paneContainer']).appendChild(
      atom.views.getView(this._paneContainer)
    );
  }

  componentDidUpdate() {
    this.renderTree();
  }

  componentWillReceiveProps(nextProps: Object) {
    const currSelectedIndex = this.state.selectedTestRunnerIndex;
    if (currSelectedIndex === -1 && nextProps.testRunners.length > 0) {
      this.setState({selectedTestRunnerIndex: 0});
    } else if (nextProps.testRunners.length === 0 && currSelectedIndex >= 0) {
      this.setState({selectedTestRunnerIndex: -1});
    }
  }

  componentWillUnmount() {
    React.unmountComponentAtNode(atom.views.getView(this._rightPane).querySelector('.item-views'));
    React.unmountComponentAtNode(atom.views.getView(this._leftPane).querySelector('.item-views'));
    this._paneContainer.destroy();
  }

  render() {
    let runStopButton;
    switch (this.props.executionState) {
      case TestRunnerPanel.ExecutionState.RUNNING:
        runStopButton = (
          <button
            className={runStopButtonClassName('primitive-square', 'btn-error')}
            onClick={this.props.onClickStop}>
            Stop
          </button>
        );
        break;
      case TestRunnerPanel.ExecutionState.STOPPED:
        const initialTest = this.props.path === undefined;
        runStopButton = (
          <button
            className={
              runStopButtonClassName(initialTest ? 'playback-play' : 'sync', 'btn-primary')
            }
            disabled={this.isDisabled()}
            onClick={this.props.onClickRun}>
            {initialTest ? 'Test' : 'Re-Test'}
          </button>
        );
        break;
    }

    // Assign `value` only when needed so a null/undefined value will show an indeterminate
    // progress bar.
    let progressAttrs: ?{[key: string]: mixed} = undefined;
    if (this.props.progressValue) {
      // `key` is set to force React to treat this as a new element when the `value` attr should be
      // removed. Currently it just sets `value="0"`, which is styled differently from no `value`
      // attr at all.
      // TODO: Remove the `key` once https://github.com/facebook/react/issues/1448 is resolved.
      progressAttrs = {
        key: 1,
        value: this.props.progressValue,
      };
    }

    let runMsg;
    if (this.props.executionState === TestRunnerPanel.ExecutionState.RUNNING) {
      runMsg = (
        <span className="inline-block">Running</span>
      );
    } else if (this.props.runDuration) {
      runMsg = (
        <span className="inline-block">Done (in {this.props.runDuration / 1000}s)</span>
      );
    }

    let pathMsg;
    if (this.props.path) {
      pathMsg = <span title={this.props.path}>{pathUtil.basename(this.props.path)}</span>;
    }

    let dropdown;
    if (this.isDisabled()) {
      dropdown = <span className="inline-block text-warning">No registered test runners</span>;
    } else {
      dropdown = (
        <NuclideUiDropdown
          className="inline-block"
          disabled={this.props.executionState === TestRunnerPanel.ExecutionState.RUNNING}
          menuItems={this.props.testRunners.map(testRunner =>
            ({label: testRunner.label, value: testRunner.label})
          )}
          onSelectedChange={this.setSelectedTestRunnerIndex}
          ref="dropdown"
          selectedIndex={this.state.selectedTestRunnerIndex}
          size="sm"
          title="Choose a test runner"
        />
      );
    }

    return (
      <PanelComponent dock="bottom">
        <div className="nuclide-test-runner-panel">
          <nav className="nuclide-test-runner-panel-toolbar block">
            {dropdown}
            {runStopButton}
            <button
              className="btn btn-subtle btn-sm icon icon-trashcan inline-block"
              disabled={this.isDisabled() ||
                this.props.executionState === TestRunnerPanel.ExecutionState.RUNNING}
              onClick={this.props.onClickClear}
              title="Clear Output">
            </button>
            {pathMsg}
            <div className="pull-right">
              {runMsg}
              <progress className="inline-block" max="100" {...progressAttrs} />
              <button
                onClick={this.props.onClickClose}
                className="btn btn-subtle btn-sm icon icon-x inline-block"
                title="Close Panel">
              </button>
            </div>
          </nav>
          <div className="nuclide-test-runner-console" ref="paneContainer"></div>
        </div>
      </PanelComponent>
    );
  }

  isDisabled(): boolean {
    return this.props.testRunners.length === 0;
  }

  setSelectedTestRunnerIndex(selectedTestRunnerIndex: number): void {
    this.setState({selectedTestRunnerIndex});
  }

  getSelectedTestRunner(): ?Object {
    const selectedTestRunnerIndex = this.state.selectedTestRunnerIndex;
    if (selectedTestRunnerIndex >= 0) {
      return this.props.testRunners[selectedTestRunnerIndex];
    }
  }

  renderTree() {
    this._tree = React.render(
      <TestClassTree
        isRunning={this.props.executionState === TestRunnerPanel.ExecutionState.RUNNING}
        testSuiteModel={this.props.testSuiteModel}
      />,
      atom.views.getView(this._leftPane).querySelector('.item-views')
    );
  }

  renderConsole() {
    React.render(
      <Console textBuffer={this.props.buffer} />,
      atom.views.getView(this._rightPane).querySelector('.item-views')
    );
  }

}

TestRunnerPanel.propTypes = {
  buffer: PropTypes.object.isRequired,
  executionState: PropTypes.number.isRequired,
  onClickClear: PropTypes.func.isRequired,
  onClickClose: PropTypes.func.isRequired,
  onClickRun: PropTypes.func.isRequired,
  onClickStop: PropTypes.func.isRequired,
  path: PropTypes.string,
  progressValue: PropTypes.number,
  runDuration: PropTypes.number,
  // TODO: Should be `arrayOf(TestRunner)`, but that would require a real object since this is
  // runtime code for React.
  testRunners: PropTypes.arrayOf(Object).isRequired,
  testSuiteModel: PropTypes.object,
};

TestRunnerPanel.ExecutionState = {
  RUNNING: 0,
  STOPPED: 1,
};

module.exports = TestRunnerPanel;
