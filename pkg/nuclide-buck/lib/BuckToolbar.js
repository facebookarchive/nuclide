'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {TaskType, TaskSettings} from './types';

import {CompositeDisposable} from 'atom';
import {React} from 'react-for-atom';

import {lastly} from '../../commons-node/promise';
import {createBuckProject} from '../../nuclide-buck-base';
import SimulatorDropdown from './SimulatorDropdown';
import BuckToolbarActions from './BuckToolbarActions';
import BuckToolbarSettings from './ui/BuckToolbarSettings';
import BuckToolbarStore from './BuckToolbarStore';
import {Button, ButtonSizes} from '../../nuclide-ui/lib/Button';
import {Combobox} from '../../nuclide-ui/lib/Combobox';
import {Checkbox} from '../../nuclide-ui/lib/Checkbox';
import {LoadingSpinner} from '../../nuclide-ui/lib/LoadingSpinner';
import addTooltip from '../../nuclide-ui/lib/add-tooltip';

const BUCK_TARGET_INPUT_WIDTH = 400;

type PropTypes = {
  activeTaskType: ?TaskType;
  store: BuckToolbarStore;
  actions: BuckToolbarActions;
};

class BuckToolbar extends React.Component {
  props: PropTypes;
  state: {settingsVisible: boolean};

  _disposables: CompositeDisposable;
  _buckToolbarStore: BuckToolbarStore;
  _buckToolbarActions: BuckToolbarActions;

  // Querying Buck can be slow, so cache aliases by project.
  // Putting the cache here allows the user to refresh it by toggling the UI.
  _projectAliasesCache: Map<string, Promise<Array<string>>>;

  constructor(props: PropTypes) {
    super(props);
    (this: any)._handleBuildTargetChange = this._handleBuildTargetChange.bind(this);
    (this: any)._handleSimulatorChange = this._handleSimulatorChange.bind(this);
    (this: any)._handleReactNativeServerModeChanged =
      this._handleReactNativeServerModeChanged.bind(this);
    (this: any)._requestOptions = this._requestOptions.bind(this);

    this._buckToolbarActions = this.props.actions;
    this._buckToolbarStore = this.props.store;
    this._projectAliasesCache = new Map();

    this._disposables = new CompositeDisposable();

    // Re-render whenever the data in the store changes.
    this._disposables.add(this._buckToolbarStore.subscribe(() => { this.forceUpdate(); }));

    this.state = {settingsVisible: false};
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  async _requestOptions(inputText: string): Promise<Array<string>> {
    const buckRoot = this._buckToolbarStore.getCurrentBuckRoot();
    if (buckRoot == null) {
      throw new Error('No active Buck project. Check your Current Working Root.');
    }

    let aliases = this._projectAliasesCache.get(buckRoot);
    if (!aliases) {
      const buckProject = createBuckProject(buckRoot);
      aliases = lastly(
        buckProject.listAliases(),
        () => buckProject.dispose(),
      );
      this._projectAliasesCache.set(buckRoot, aliases);
    }

    const result = (await aliases).slice();
    if (inputText.trim() && result.indexOf(inputText) === -1) {
      result.splice(0, 0, inputText);
    }
    return result;
  }

  render(): React.Element<any> {
    const buckToolbarStore = this._buckToolbarStore;
    let status;
    if (buckToolbarStore.isLoadingRule()) {
      status =
        <div ref={addTooltip({title: 'Waiting on rule info...', delay: 0})}>
          <LoadingSpinner
            className="inline-block"
            size="EXTRA_SMALL"
          />
        </div>;
    } else if (buckToolbarStore.getBuildTarget() &&
               buckToolbarStore.getRuleType() == null) {
      status =
        <span
          className="icon icon-alert"
          ref={addTooltip({
            title: `Rule "${buckToolbarStore.getBuildTarget()}" could not be found.`,
            delay: 0,
          })}
        />;
    }

    let widgets = [];
    if (status != null) {
      widgets.push(
        <div key="status" className="nuclide-buck-status inline-block text-center">
          {status}
        </div>,
      );
    } else {
      if (buckToolbarStore.getRuleType() === 'apple_bundle') {
        widgets.push(
          <SimulatorDropdown
            key="simulator-dropdown"
            className="inline-block"
            title="Choose target device"
            onSelectedSimulatorChange={this._handleSimulatorChange}
          />,
        );
      }
      if (buckToolbarStore.canBeReactNativeApp()) {
        widgets.push(
          <div key="react-native-checkbox" className="inline-block">
            <Checkbox
              checked={buckToolbarStore.isReactNativeServerMode()}
              onChange={this._handleReactNativeServerModeChanged}
              label={'React Native Server Mode'}
            />
          </div>,
        );
      }
    }

    const {activeTaskType} = this.props;
    return (
      <div>
        <Combobox
          className="inline-block nuclide-buck-target-combobox"
          ref="buildTarget"
          formatRequestOptionsErrorMessage={err => err.message}
          requestOptions={this._requestOptions}
          size="sm"
          loadingMessage="Updating target names..."
          initialTextInput={this.props.store.getBuildTarget()}
          onSelect={this._handleBuildTargetChange}
          onBlur={this._handleBuildTargetChange}
          placeholderText="Buck build target"
          width={BUCK_TARGET_INPUT_WIDTH}
        />
        <Button
          className="nuclide-buck-settings icon icon-gear"
          size={ButtonSizes.SMALL}
          disabled={activeTaskType == null || this.props.store.getCurrentBuckRoot() == null}
          onClick={() => this._showSettings()}
        />
        {widgets}
        {this.state.settingsVisible && activeTaskType != null ?
          <BuckToolbarSettings
            currentBuckRoot ={this.props.store.getCurrentBuckRoot()}
            settings={this.props.store.getTaskSettings()[activeTaskType] || {}}
            buildType={activeTaskType}
            onDismiss={() => this._hideSettings()}
            onSave={settings => this._saveSettings(activeTaskType, settings)}
          /> :
          null}
      </div>
    );
  }

  _handleBuildTargetChange(value: string) {
    const trimmed = value.trim();
    if (this.props.store.getBuildTarget() === trimmed) {
      return;
    }
    this._buckToolbarActions.updateBuildTarget(trimmed);
  }

  _handleSimulatorChange(simulator: string) {
    this._buckToolbarActions.updateSimulator(simulator);
  }

  _handleReactNativeServerModeChanged(checked: boolean) {
    this._buckToolbarActions.updateReactNativeServerMode(checked);
  }

  _showSettings() {
    this.setState({settingsVisible: true});
  }

  _hideSettings() {
    this.setState({settingsVisible: false});
  }

  _saveSettings(taskType: TaskType, settings: TaskSettings) {
    this._buckToolbarActions.updateTaskSettings(taskType, settings);
    this._hideSettings();
  }

}

module.exports = BuckToolbar;
