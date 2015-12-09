'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const AtomComboBox = require('../../../ui/atom-combo-box');
const {CompositeDisposable} = require('atom');
const React = require('react-for-atom');
const {Dispatcher} = require('flux');
const {PropTypes} = React;
const SimulatorDropdown = require('./SimulatorDropdown');
const BuckToolbarActions = require('./BuckToolbarActions');
const BuckToolbarStore = require('./BuckToolbarStore');
import NuclideCheckbox from '../../../ui/checkbox';

const {debounce} = require('../../../commons');
const {
  atomEventDebounce,
  isTextEditor,
} = require('../../../atom-helpers');
const {onWorkspaceDidStopChangingActivePaneItem} = atomEventDebounce;

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
    this._handleBuildTargetChange = debounce(this._handleBuildTargetChange.bind(this), 100, false);
    this._handleSimulatorChange = this._handleSimulatorChange.bind(this);
    this._handleReactNativeServerModeChanged = this._handleReactNativeServerModeChanged.bind(this);
    this._requestOptions = this._requestOptions.bind(this);
    this._build = this._build.bind(this);
    this._run = this._run.bind(this);
    this._debug = this._debug.bind(this);

    const dispatcher = new Dispatcher();
    this._buckToolbarActions = new BuckToolbarActions(dispatcher);
    this._buckToolbarStore = new BuckToolbarStore(dispatcher);

    this._onActivePaneItemChanged(atom.workspace.getActivePaneItem());
    this._handleBuildTargetChange(this.props.initialBuildTarget);

    this._disposables = new CompositeDisposable();
    this._disposables.add(this._buckToolbarStore);
    this._disposables.add(onWorkspaceDidStopChangingActivePaneItem(
      this._onActivePaneItemChanged.bind(this)));

    this._disposables.add(this._buckToolbarStore.subscribe(() => {
      this.forceUpdate();
    }));
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  _onActivePaneItemChanged(item: ?Object) {
    if (!isTextEditor(item)) {
      return;
    }
    const textEditor: TextEditor = item;
    this._buckToolbarActions.updateProjectFor(textEditor);
  }

  _requestOptions(inputText: string): Promise<Array<string>> {
    return this._buckToolbarStore.loadAliases();
  }

  render(): ReactElement {
    const buckToolbarStore = this._buckToolbarStore;
    const disabled = !buckToolbarStore.getBuildTarget() || buckToolbarStore.isBuilding();
    let serverModeCheckbox;
    if (buckToolbarStore.isReactNativeApp()) {
      serverModeCheckbox =
        <div className="inline-block">
          <NuclideCheckbox
            checked={buckToolbarStore.isReactNativeServerMode()}
            onChange={this._handleReactNativeServerModeChanged}
            label={'RN Server Mode'}
          />
        </div>;
    }
    let progressBar;
    if (buckToolbarStore.isBuilding()) {
      progressBar =
        <progress
          className="inline-block buck-toolbar-progress-bar"
          value={buckToolbarStore.getBuildProgress()}
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
          disabled={buckToolbarStore.getRuleType() !== 'apple_bundle'}
          title="Choose target device"
          onSelectedSimulatorChange={this._handleSimulatorChange}
        />
        <div className="btn-group btn-group-sm inline-block">
          <button onClick={this._build} disabled={disabled} className="btn">Build</button>
          <button onClick={this._run} disabled={disabled} className="btn">Run</button>
          <button onClick={this._debug} disabled={disabled} className="btn">Debug</button>
        </div>
        {serverModeCheckbox}
        {progressBar}
      </div>
    );
  }

  _handleBuildTargetChange(value: string) {
    this.props.onBuildTargetChange(value);
    this._buckToolbarActions.updateBuildTarget(value);
  }

  _handleSimulatorChange(simulator: string) {
    this._buckToolbarActions.updateSimulator(simulator);
  }

  _handleReactNativeServerModeChanged(checked: boolean) {
    this._buckToolbarActions.updateReactNativeServerMode(checked);
  }

  _build() {
    this._buckToolbarActions.build();
  }

  _run() {
    this._buckToolbarActions.run();
  }

  _debug() {
    this._buckToolbarActions.debug();
  }
}

BuckToolbar.propTypes = {
  initialBuildTarget: PropTypes.string,
  onBuildTargetChange: PropTypes.func.isRequired,
};

module.exports = BuckToolbar;
