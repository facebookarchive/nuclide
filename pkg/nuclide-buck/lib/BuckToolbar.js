/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {
  AppState,
  DeploymentTarget,
  Platform,
  PlatformGroup,
  TaskSettings,
} from './types';
import type {Option} from '../../nuclide-ui/Dropdown';

import React from 'react';
import shallowequal from 'shallowequal';

import BuckToolbarSettings from './ui/BuckToolbarSettings';
import BuckToolbarTargetSelector from './ui/BuckToolbarTargetSelector';
import {maybeToString} from '../../commons-node/string';
import {Button, ButtonSizes} from '../../nuclide-ui/Button';
import {Dropdown} from '../../nuclide-ui/Dropdown';
import {LoadingSpinner} from '../../nuclide-ui/LoadingSpinner';
import addTooltip from '../../nuclide-ui/add-tooltip';
import invariant from 'assert';

type Props = {
  appState: AppState,
  setBuildTarget(buildTarget: string): void,
  setDeploymentTarget(deploymentTarget: DeploymentTarget): void,
  setTaskSettings(settings: TaskSettings): void,
};

type State = {
  settingsVisible: boolean,
};

type DropdownGroup = {
  header: Option,
  selectableOptions: Array<Option>,
};

export default class BuckToolbar extends React.Component {
  props: Props;
  state: State;

  constructor(props: Props) {
    super(props);
    (this: any)._handleDeploymentTargetChange = this._handleDeploymentTargetChange.bind(
      this,
    );
    this.state = {settingsVisible: false};
  }

  render(): React.Element<any> {
    const {
      buildRuleType,
      buildTarget,
      buckRoot,
      isLoadingRule,
      isLoadingPlatforms,
      platformGroups,
      projectRoot,
      selectedDeploymentTarget,
      taskSettings,
    } = this.props.appState;

    let status;
    if (isLoadingRule || isLoadingPlatforms) {
      const title = isLoadingRule
        ? 'Loading target build rule...'
        : 'Loading available platforms...';
      status = (
        <div ref={addTooltip({title, delay: 0})}>
          <LoadingSpinner
            className="inline-block buck-spinner"
            size="EXTRA_SMALL"
          />
        </div>
      );
    } else if (buildTarget && buildRuleType == null) {
      let title;
      if (buckRoot == null) {
        if (projectRoot != null) {
          title = `No Buck project found in the Current Working Root:<br />${projectRoot}`;
        } else {
          title = 'No Current Working Root.';
        }
      } else {
        title = `Rule "${buildTarget}" could not be found in ${buckRoot}.<br />` +
          `Check your Current Working Root: ${maybeToString(projectRoot)}`;
      }

      title += '<br />Click icon to retry';

      status = (
        <span
          className="icon icon-alert"
          ref={addTooltip({title, delay: 0})}
          onClick={() => this.props.setBuildTarget(buildTarget)}
        />
      );
    }

    const widgets = [];
    if (status != null) {
      widgets.push(
        <div
          key="status"
          className="nuclide-buck-status inline-block text-center">
          {status}
        </div>,
      );
    } else if (platformGroups.length) {
      const options = this._optionsFromPlatformGroups(platformGroups);

      widgets.push(
        <Dropdown
          key="simulator-dropdown"
          className="inline-block"
          value={selectedDeploymentTarget}
          options={options}
          onChange={this._handleDeploymentTargetChange}
          size="sm"
          title="Choose a device"
          selectionComparator={shallowequal}
        />,
      );
    }

    return (
      <div className="nuclide-buck-toolbar">
        <BuckToolbarTargetSelector
          appState={this.props.appState}
          setBuildTarget={this.props.setBuildTarget}
        />
        <Button
          className="nuclide-buck-settings icon icon-gear"
          size={ButtonSizes.SMALL}
          onClick={() => this._showSettings()}
        />
        {widgets}
        {this.state.settingsVisible
          ? <BuckToolbarSettings
              currentBuckRoot={buckRoot}
              settings={taskSettings}
              onDismiss={() => this._hideSettings()}
              onSave={settings => this._saveSettings(settings)}
            />
          : null}
      </div>
    );
  }

  _handleDeploymentTargetChange(deploymentTarget: DeploymentTarget) {
    this.props.setDeploymentTarget(deploymentTarget);
  }

  _showSettings() {
    this.setState({settingsVisible: true});
  }

  _hideSettings() {
    this.setState({settingsVisible: false});
  }

  _saveSettings(settings: TaskSettings) {
    this.props.setTaskSettings(settings);
    this._hideSettings();
  }

  _optionsFromPlatformGroups(
    platformGroups: Array<PlatformGroup>,
  ): Array<Option> {
    return platformGroups.reduce(
      (options, platformGroup) => {
        let dropdownGroup = null;
        if (platformGroup.platforms.length === 1) {
          dropdownGroup = this._turnDevicesIntoSelectableOptions(
            platformGroup.platforms[0],
          );
        } else {
          dropdownGroup = this._putDevicesIntoSubmenus(platformGroup);
        }

        options.push(dropdownGroup.header);
        return options.concat(dropdownGroup.selectableOptions);
      },
      [],
    );
  }

  _turnDevicesIntoSelectableOptions(platform: Platform): DropdownGroup {
    const header = {
      label: platform.name,
      value: platform.name,
      disabled: true,
    };

    invariant(platform.deviceGroups.length === 1);
    const selectableOptions = platform.deviceGroups[0].devices.map(device => {
      return {
        label: `  ${device.name}`,
        selectedLabel: device.name,
        value: {platform, device},
      };
    });
    return {header, selectableOptions};
  }

  _putDevicesIntoSubmenus(platformGroup: PlatformGroup): DropdownGroup {
    const header = {
      label: platformGroup.name,
      value: platformGroup.name,
      disabled: true,
    };

    const selectableOptions = [];

    for (const platform of platformGroup.platforms) {
      if (platform.deviceGroups.length) {
        const submenu = [];

        for (const deviceGroup of platform.deviceGroups) {
          if (deviceGroup.name) {
            submenu.push({
              label: deviceGroup.name,
              value: deviceGroup.name,
              disabled: true,
            });
          }

          for (const device of deviceGroup.devices) {
            submenu.push({
              label: `  ${device.name}`,
              selectedLabel: `${platform.name}: ${device.name}`,
              value: {platform, device},
            });
          }

          submenu.push({type: 'separator'});
        }

        selectableOptions.push({
          type: 'submenu',
          label: `  ${platform.name}`,
          submenu,
        });
      } else {
        selectableOptions.push({
          label: `  ${platform.name}`,
          selectedLabel: platform.name,
          value: {platform, device: null},
        });
      }
    }

    return {header, selectableOptions};
  }
}
