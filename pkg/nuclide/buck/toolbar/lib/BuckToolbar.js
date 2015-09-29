'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var AtomComboBox = require('nuclide-ui-atom-combo-box');
var {CompositeDisposable, TextEditor} = require('atom');
var {debounce} = require('nuclide-commons');
var React = require('react-for-atom');
var {Dispatcher} = require('flux');
var {PropTypes} = React;
var SimulatorDropdown = require('./SimulatorDropdown');
var BuckToolbarActions = require('./BuckToolbarActions');
var BuckToolbarStore = require('./BuckToolbarStore');

class BuckToolbar extends React.Component {

  /**
   * The toolbar makes an effort to keep track of which BuckProject to act on, based on the last
   * TextEditor that had focus that corresponded to a BuckProject. This means that if a user opens
   * an editor for a file in a Buck project, types in a build target, focuses an editor for a file
   * that is not part of a Buck project, and hits "Build," the toolbar will build the target in the
   * project that corresponds to the editor that previously had focus.
   *
   * Ultimately, we should have a dropdown to let the user specify the Buck project when it is
   * ambiguous.
   */
  _disposables: CompositeDisposable;
  _buckToolbarStore: BuckToolbarStore;
  _buckToolbarActions: BuckToolbarActions;

  constructor(props: mixed) {
    super(props);
    this.state = {
      buildTarget: this.props.initialBuildTarget,
      isBuilding: false,
      currentProgress: 0,
      maxProgress: 100,
    };
    this._handleBuildTargetChange = debounce(this._handleBuildTargetChange.bind(this), 100, false);
    this._handleSimulatorChange = this._handleSimulatorChange.bind(this);
    this._requestOptions = this._requestOptions.bind(this);
    this._build = this._build.bind(this);
    this._run = this._run.bind(this);
    this._debug = this._debug.bind(this);

    var dispatcher = new Dispatcher();
    this._buckToolbarActions = new BuckToolbarActions(dispatcher);
    this._buckToolbarStore = new BuckToolbarStore(dispatcher);

    this._onActivePaneItemChanged(atom.workspace.getActivePaneItem());

    this._disposables = new CompositeDisposable();
    this._disposables.add(atom.workspace.onDidChangeActivePaneItem(
      this._onActivePaneItemChanged.bind(this)));

    this._disposables.add(this._buckToolbarStore.onResetToolbarProgress(
      this._resetToolbarProgress.bind(this)));
    this._disposables.add(this._buckToolbarStore.onRulesCountCalculated(
      this.setMaxProgressAndResetProgress.bind(this)));
    this._disposables.add(this._buckToolbarStore.onRulesCountChanged(
      this.setCurrentProgress.bind(this)));
    this._disposables.add(this._buckToolbarStore.onBuildFinished(
      this.setCurrentProgressToMaxProgress.bind(this)));
    this._disposables.add(this._buckToolbarStore.onBuckCommandFinished(
      this._hideProgressBar.bind(this)));
    this._disposables.add(this._buckToolbarStore.onBuildTargetRuleTypeChanged(
      this._handleRuleTypeChanged.bind(this)));
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  _resetToolbarProgress() {
    this.setMaxProgressAndResetProgress(0);
  }

  _hideProgressBar() {
    this.setState({isBuilding: false});
  }

  setCurrentProgress(currentProgress: number) {
    this.setState({currentProgress});
  }

  setMaxProgressAndResetProgress(maxProgress: number) {
    this.setState({currentProgress: 0, maxProgress});
  }

  setCurrentProgressToMaxProgress() {
    this.setCurrentProgress(this.state.maxProgress);
  }

  _onActivePaneItemChanged(item: mixed) {
    if (!(item instanceof TextEditor)) {
      return;
    }

    var textEditor: TextEditor = item;
    this._buckToolbarActions.updateProjectFor(textEditor);
  }

  _handleRuleTypeChanged(ruleType: ?string) {
    this.setState({ruleType});
  }

  _requestOptions(inputText: string): Promise<Array<string>> {
    var buckProject = this._buckToolbarStore.getMostRecentBuckProject();
    if (!buckProject) {
      return Promise.resolve([]);
    }

    return buckProject.listAliases();
  }

  render(): ReactElement {
    var disabled = !this.state.buildTarget || this.state.isBuilding;
    var progressBar;
    if (this.state.isBuilding) {
      progressBar =
        <progress
          className="inline-block buck-toolbar-progress-bar"
          value={this.state.currentProgress}
          max={this.state.maxProgress}
        />;
    }
    return (
      <div className="buck-toolbar block">
        <AtomComboBox
          className="inline-block"
          ref="buildTarget"
          requestOptions={this._requestOptions}
          size="sm"
          initialTextInput={this.props.initialBuildTarget}
          onChange={this._handleBuildTargetChange}
          placeholderText="Buck build target"
        />
        <SimulatorDropdown
          className="inline-block"
          disabled={this.state.ruleType !== 'apple_bundle'}
          title="Choose target device"
          onSelectedSimulatorChange={this._handleSimulatorChange}
        />
        <div className="btn-group btn-group-sm inline-block">
          <button onClick={this._build} disabled={disabled} className="btn">Build</button>
          <button onClick={this._run} disabled={disabled} className="btn">Run</button>
          <button onClick={this._debug} disabled={disabled} className="btn">Debug</button>
        </div>
        {progressBar}
      </div>
    );
  }

  _handleBuildTargetChange(value: string) {
    this.props.onBuildTargetChange(value);
    this._buckToolbarActions.updateBuildTarget(value);
    this.setState({buildTarget: value});
  }

  _handleSimulatorChange(simulator: string) {
    this.setState({simulator});
  }

  _build() {
    this.setState({isBuilding: true});
    this._buckToolbarActions.build(this.state.buildTarget);
  }

  _run() {
    this.setState({isBuilding: true});
    this._buckToolbarActions.run(this.state.buildTarget, this.state.simulator);
  }

  _debug() {
    this.setState({isBuilding: true});
    this._buckToolbarActions.debug(this.state.buildTarget, this.state.simulator);
  }
}

BuckToolbar.propTypes = {
  initialBuildTarget: PropTypes.string,
  onBuildTargetChange: PropTypes.func.isRequired,
};

module.exports = BuckToolbar;
