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
import type BuckToolbarActions from './BuckToolbarActions';
import type BuckToolbarStore from './BuckToolbarStore';

import {CompositeDisposable, Disposable} from 'atom';
import nullthrows from 'nullthrows';
import {React} from 'react-for-atom';

import BuckToolbarSettings from './ui/BuckToolbarSettings';
import BuckToolbarTargetSelector from './ui/BuckToolbarTargetSelector';
import {Button, ButtonSizes} from '../../nuclide-ui/Button';
import {Dropdown} from '../../nuclide-ui/Dropdown';
import {LoadingSpinner} from '../../nuclide-ui/LoadingSpinner';
import addTooltip from '../../nuclide-ui/add-tooltip';

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

  constructor(props: Props) {
    super(props);
    (this: any)._handleSimulatorChange = this._handleSimulatorChange.bind(this);

    this._buckToolbarActions = this.props.actions;
    this._buckToolbarStore = this.props.store;

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

    const widgets = [];
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
    }

    const {activeTaskType} = this.props;
    return (
      <div className="nuclide-buck-toolbar">
        <BuckToolbarTargetSelector
          store={this.props.store}
          actions={this.props.actions}
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

  _handleSimulatorChange(deviceId: string) {
    this._buckToolbarActions.updateSimulator(deviceId);
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
