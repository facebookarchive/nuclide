/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import type {Expected} from 'nuclide-commons/expected';
import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {Device} from './types';

import {getAdbServiceByNuclideUri} from 'nuclide-adb';
import {AtomInput} from 'nuclide-commons-ui/AtomInput';
import {Dropdown} from 'nuclide-commons-ui/Dropdown';
import {LoadingSpinner} from 'nuclide-commons-ui/LoadingSpinner';
import debounce from 'nuclide-commons/debounce';
import {Expect} from 'nuclide-commons/expected';
import * as React from 'react';
import {AdbDeviceSelector} from './AdbDeviceSelector';
import {getAdbPath, setAdbPath, addAdbPorts} from './EmulatorUtils';

type Props = {|
  +targetUri: NuclideUri,
  +onSelect: (device: ?Device, javaPackage: string) => void,
  +deserialize: () => ?string,
|};

type State = {
  selectedDevice: ?Device,
  launchPackage: string,
  packages: Expected<Array<string>>,
  adbPorts: string,
};

export class DeviceAndPackage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    (this: any)._setAdbPorts = debounce(this._setAdbPorts.bind(this), 1000);
    this.state = {
      selectedDevice: null,
      launchPackage: '',
      packages: Expect.value([]),
      adbPorts: '',
    };
  }

  async _setAdbPorts(value: string): Promise<void> {
    setAdbPath(this.props.targetUri, await getAdbPath());

    const parsedPorts = value
      .split(/,\s*/)
      .map(port => parseInt(port.trim(), 10))
      .filter(port => !Number.isNaN(port));

    addAdbPorts(this.props.targetUri, parsedPorts);
    this.setState({adbPorts: value, selectedDevice: null});
  }

  async _refreshPackageList(device: ?Device) {
    if (device != null) {
      const packages = Expect.value(
        (await getAdbServiceByNuclideUri(
          this.props.targetUri,
        ).getInstalledPackages(device)).sort(),
      );
      this.setState({
        packages,
      });
    } else {
      this.setState({
        packages: Expect.value([]),
      });
    }
  }

  setState(partialState: Object, callback?: () => mixed): void {
    const fullState: State = {
      ...this.state,
      ...partialState,
    };
    super.setState(fullState, () => {
      this.props.onSelect(fullState.selectedDevice, fullState.launchPackage);
      callback && callback();
    });
  }

  _handleDeviceChange = (device: ?Device): void => {
    const state: $Shape<State> = {
      selectedDevice: device,
      packages: device == null ? Expect.value([]) : Expect.pendingValue([]),
    };
    const value = this.props.deserialize();
    if (
      device != null &&
      (this.state.selectedDevice == null ||
        device.name !== this.state.selectedDevice.name) &&
      value != null
    ) {
      state.launchPackage = value;
    }

    this.setState(state, () => {
      this._refreshPackageList(device);
    });
  };

  render(): React.Node {
    const devicesLabel =
      this.state.adbPorts === ''
        ? ''
        : '(ADB port ' + this.state.adbPorts + ')';
    return (
      <div className="block">
        <label>ADB Server Port: </label>
        <AtomInput
          placeholderText="Optional. (For One World devices, specify ANDROID_ADB_SERVER_PORT from one_world_adb)"
          title="Optional. (For One World devices, specify ANDROID_ADB_SERVER_PORT from one_world_adb)"
          value={this.state.adbPorts}
          onDidChange={value => this._setAdbPorts(value)}
        />
        <label>Device: {devicesLabel}</label>
        <AdbDeviceSelector
          onChange={this._handleDeviceChange}
          targetUri={this.props.targetUri}
        />
        <label>Package: </label>
        {this.state.packages.isPending ? (
          <LoadingSpinner size="EXTRA_SMALL" />
        ) : (
          <Dropdown
            disabled={this.state.selectedDevice == null}
            options={
              this.state.packages.isPending || this.state.packages.isError
                ? []
                : this.state.packages.value.map(packageName => {
                    return {value: packageName, label: packageName};
                  })
            }
            onChange={value => this.setState({launchPackage: value})}
            value={this.state.launchPackage}
          />
        )}
      </div>
    );
  }
}
