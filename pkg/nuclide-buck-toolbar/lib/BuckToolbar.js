'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {CompositeDisposable} from 'atom';
import {React} from 'react-for-atom';
import {atomEventDebounce} from '../../nuclide-atom-helpers';
import {debounce} from '../../nuclide-commons';
import SimulatorDropdown from './SimulatorDropdown';
import BuckToolbarActions from './BuckToolbarActions';
import BuckToolbarStore from './BuckToolbarStore';
import {Combobox} from '../../nuclide-ui/lib/Combobox';
import {Checkbox} from '../../nuclide-ui/lib/Checkbox';
import {
  Button,
} from '../../nuclide-ui/lib/Button';
import {
  ButtonGroup,
  ButtonGroupSizes,
} from '../../nuclide-ui/lib/ButtonGroup';

const BUCK_TARGET_INPUT_WIDTH = 400;
const formatRequestOptionsErrorMessage = () => 'Invalid .buckconfig';

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

  static propTypes = {
    store: React.PropTypes.instanceOf(BuckToolbarStore).isRequired,
    actions: React.PropTypes.instanceOf(BuckToolbarActions).isRequired,
  };

  constructor(props: mixed) {
    super(props);
    (this: any)._handleBuildTargetChange =
      debounce(this._handleBuildTargetChange.bind(this), 100, false);
    (this: any)._handleRequestOptionsError = this._handleRequestOptionsError.bind(this);
    (this: any)._handleSimulatorChange = this._handleSimulatorChange.bind(this);
    (this: any)._handleReactNativeServerModeChanged =
      this._handleReactNativeServerModeChanged.bind(this);
    (this: any)._requestOptions = this._requestOptions.bind(this);
    (this: any)._build = this._build.bind(this);
    (this: any)._run = this._run.bind(this);
    (this: any)._test = this._test.bind(this);
    (this: any)._debug = this._debug.bind(this);

    this._buckToolbarActions = this.props.actions;
    this._buckToolbarStore = this.props.store;
    this._onActivePaneItemChanged(atom.workspace.getActivePaneItem());

    this._disposables = new CompositeDisposable();
    this._disposables.add(this._buckToolbarStore);
    this._disposables.add(atomEventDebounce.onWorkspaceDidStopChangingActivePaneItem(
      this._onActivePaneItemChanged.bind(this)));

    // Re-render whenever the data in the store changes.
    this._disposables.add(this._buckToolbarStore.subscribe(() => { this.forceUpdate(); }));
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  _onActivePaneItemChanged(item: ?Object) {
    if (!atom.workspace.isTextEditor(item)) {
      return;
    }
    const textEditor: TextEditor = ((item: any): TextEditor);
    this._buckToolbarActions.updateProjectFor(textEditor);
  }

  _requestOptions(inputText: string): Promise<Array<string>> {
    return this._buckToolbarStore.loadAliases();
  }

  render(): React.Element {
    const buckToolbarStore = this._buckToolbarStore;
    const disabled = !buckToolbarStore.getBuildTarget() || buckToolbarStore.isBuilding();
    let serverModeCheckbox;
    if (buckToolbarStore.isReactNativeApp()) {
      serverModeCheckbox =
        <div className="inline-block">
          <Checkbox
            checked={buckToolbarStore.isReactNativeServerMode()}
            onChange={this._handleReactNativeServerModeChanged}
            label={'React Native Server Mode'}
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
      <div
        className="buck-toolbar padded tool-panel"
        hidden={!buckToolbarStore.isPanelVisible()}>
        <Combobox
          className="inline-block"
          ref="buildTarget"
          formatRequestOptionsErrorMessage={formatRequestOptionsErrorMessage}
          onRequestOptionsError={this._handleRequestOptionsError}
          requestOptions={this._requestOptions}
          size="sm"
          loadingMessage="Updating target names..."
          initialTextInput={this.props.store.getBuildTarget()}
          onChange={this._handleBuildTargetChange}
          placeholderText="Buck build target"
          width={BUCK_TARGET_INPUT_WIDTH}
        />
        <SimulatorDropdown
          className="inline-block"
          disabled={buckToolbarStore.getRuleType() !== 'apple_bundle'}
          title="Choose target device"
          onSelectedSimulatorChange={this._handleSimulatorChange}
        />
        <ButtonGroup className="inline-block" size={ButtonGroupSizes.SMALL}>
          <Button onClick={this._build} disabled={disabled}>Build</Button>
          <Button onClick={this._run} disabled={disabled}>Run</Button>
          <Button onClick={this._test} disabled={disabled}>Test</Button>
          <Button onClick={this._debug} disabled={disabled}>Debug</Button>
        </ButtonGroup>
        {serverModeCheckbox}
        {progressBar}
      </div>
    );
  }

  _handleBuildTargetChange(value: string) {
    this._buckToolbarActions.updateBuildTarget(value);
  }

  _handleRequestOptionsError(error: Error): void {
    atom.notifications.addError(
      'Failed to get targets from Buck',
      {detail: error.message},
    );
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

  _test() {
    this._buckToolbarActions.test();
  }

  _debug() {
    this._buckToolbarActions.debug();
  }
}

module.exports = BuckToolbar;
