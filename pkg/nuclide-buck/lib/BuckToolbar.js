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

import {CompositeDisposable, Disposable} from 'atom';
import nullthrows from 'nullthrows';
import {React} from 'react-for-atom';

import {lastly} from '../../commons-node/promise';
import {createBuckProject} from '../../nuclide-buck-base';
import BuckToolbarActions from './BuckToolbarActions';
import BuckToolbarSettings from './ui/BuckToolbarSettings';
import BuckToolbarStore from './BuckToolbarStore';
import {Button, ButtonSizes} from '../../nuclide-ui/lib/Button';
import {Combobox} from '../../nuclide-ui/lib/Combobox';
import {Checkbox} from '../../nuclide-ui/lib/Checkbox';
import {Dropdown} from '../../nuclide-ui/lib/Dropdown';
import {LoadingSpinner} from '../../nuclide-ui/lib/LoadingSpinner';
import addTooltip from '../../nuclide-ui/lib/add-tooltip';

const NO_ACTIVE_PROJECT_ERROR = 'No active Buck project. Check your Current Working Root.';

type Props = {
  activeTaskType: ?TaskType,
  store: BuckToolbarStore,
  actions: BuckToolbarActions,
};

type State = {
  settingsVisible: boolean,
};

class BuckToolbar extends React.Component {
  props: Props;
  state: State;

  _disposables: CompositeDisposable;
  _buckToolbarStore: BuckToolbarStore;
  _buckToolbarActions: BuckToolbarActions;
  _fetchDevicesTimeoutId: ?number;

  // Querying Buck can be slow, so cache aliases by project.
  // Putting the cache here allows the user to refresh it by toggling the UI.
  _projectAliasesCache: Map<string, Promise<Array<string>>>;

  constructor(props: Props) {
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

  componentWillMount(): void {
    // Schedule the update to avoid the Flux "dispatching during a dispatch" error.
    this._fetchDevicesTimeoutId = setTimeout(
      () => { this._buckToolbarActions.fetchDevices(); },
      0,
    );
    this._disposables.add(new Disposable(() => { clearTimeout(this._fetchDevicesTimeoutId); }));
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  async _requestOptions(inputText: string): Promise<Array<string>> {
    const buckRoot = this._buckToolbarStore.getCurrentBuckRoot();
    if (buckRoot == null) {
      throw new Error(NO_ACTIVE_PROJECT_ERROR);
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
    const isAppleBundle = buckToolbarStore.getRuleType() === 'apple_bundle';
    const devices = buckToolbarStore.getDevices();
    const isLoading = buckToolbarStore.isLoadingRule() || (isAppleBundle && devices.length < 1);
    let status;
    if (isLoading) {
      status =
        <div ref={addTooltip({title: 'Waiting on rule info...', delay: 0})}>
          <LoadingSpinner
            className="inline-block"
            size="EXTRA_SMALL"
          />
        </div>;
    } else if (buckToolbarStore.getBuildTarget() &&
               buckToolbarStore.getRuleType() == null) {
      let title;
      const buckRoot = buckToolbarStore.getCurrentBuckRoot();
      const projectRoot = buckToolbarStore.getCurrentProjectRoot();
      if (buckRoot == null) {
        if (projectRoot != null) {
          title = `No Buck project found in the Current Working Root:<br />${projectRoot}`;
        } else {
          title = 'No Current Working Root.';
        }
      } else {
        title =
          `Rule "${buckToolbarStore.getBuildTarget()}" could not be found in ${buckRoot}.<br />` +
          `Check your Current Working Root: ${nullthrows(projectRoot)}`;
      }

      status =
        <span
          className="icon icon-alert"
          ref={addTooltip({title, delay: 0})}
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
      const deviceId = buckToolbarStore.getSimulator();
      if (isAppleBundle && !isLoading && deviceId != null && devices.length > 0) {
        const options = devices.map(device => ({
          label: `${device.name} (${device.os})`,
          value: device.udid,
        }));

        widgets.push(
          <Dropdown
            key="simulator-dropdown"
            className="inline-block"
            value={deviceId}
            options={options}
            onChange={this._handleSimulatorChange}
            size="sm"
            title="Choose a device"
          />,
        );
      }
      if (buckToolbarStore.canBeReactNativeApp()) {
        widgets.push(
          <div key="react-native-checkbox" className="inline-block">
            <Checkbox
              className="nuclide-buck-react-native-packager-checkbox"
              checked={buckToolbarStore.isReactNativeServerMode()}
              onChange={this._handleReactNativeServerModeChanged}
              label="Start React Native Packager"
            />
          </div>,
        );
      }
    }

    const {activeTaskType} = this.props;
    return (
      <div className="nuclide-buck-toolbar">
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
          width={null}
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

  _handleSimulatorChange(deviceId: string) {
    this._buckToolbarActions.updateSimulator(deviceId);
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
