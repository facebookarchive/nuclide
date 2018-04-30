/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import invariant from 'assert';
import typeof * as AdbService from 'nuclide-adb/lib/AdbService';
import type {Expected} from 'nuclide-commons/expected';

import * as React from 'react';
import {AtomInput} from 'nuclide-commons-ui/AtomInput';
import {Dropdown} from 'nuclide-commons-ui/Dropdown';
import {AdbDeviceSelector} from './AdbDeviceSelector';
import {
  getAdbService,
  debugAndroidDebuggerService,
} from './JavaDebuggerServiceHelpers';
import type {Device} from '../../nuclide-device-panel/lib/types';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import nuclideUri from 'nuclide-commons/nuclideUri';
import {getAdbServiceByNuclideUri} from 'nuclide-adb/lib/utils';
import debounce from 'nuclide-commons/debounce';
import {
  serializeDebuggerConfig,
  deserializeDebuggerConfig,
} from 'nuclide-debugger-common';
import {
  getAdbPath,
  getAdbPorts,
  setAdbPath,
  addAdbPorts,
} from './EmulatorUtils';
import {Expect} from 'nuclide-commons/expected';
import {LoadingSpinner} from 'nuclide-commons-ui/LoadingSpinner';

type Props = {|
  targetUri: NuclideUri,
  configIsValidChanged: (valid: boolean) => void,
|};

type State = {
  selectedDevice: ?Device,
  launchPackage: string,
  launchActivity: string,
  launchService: string,
  launchAction: string,
  packages: Expected<Array<string>>,
  adbPorts: string,
  adbPath: ?string,
};

export class AndroidLaunchComponent extends React.Component<Props, State> {
  props: Props;
  state: State;
  _disposables: UniversalDisposable;
  _deserializedSavedSettings: boolean;
  _adbService: AdbService;

  constructor(props: Props) {
    super(props);

    this._disposables = new UniversalDisposable();
    this._deserializedSavedSettings = false;
    this._adbService = getAdbServiceByNuclideUri(this.props.targetUri);
    (this: any)._setAdbPorts = debounce(this._setAdbPorts.bind(this), 1000);
    (this: any)._handleDeviceChange = this._handleDeviceChange.bind(this);

    this.state = {
      selectedDevice: null,
      launchPackage: '',
      launchActivity: '',
      launchService: '',
      launchAction: '',
      packages: Expect.value([]),
      adbPorts: '',
      adbPath: null,
    };
  }

  async _getAdbParameters() {
    this.setState({
      adbPorts: (await getAdbPorts(this.props.targetUri)).join(', '),
      adbPath: await getAdbPath(),
    });
  }

  _getSerializationArgs() {
    return [
      nuclideUri.isRemote(this.props.targetUri)
        ? nuclideUri.getHostname(this.props.targetUri)
        : 'local',
      'launch',
      'Java - Android',
    ];
  }

  componentDidMount(): void {
    this._disposables.add(
      atom.commands.add('atom-workspace', {
        'core:confirm': async (): Promise<void> => {
          if (this._debugButtonShouldEnable()) {
            await this._handleLaunchClick();
          }
        },
      }),
    );

    this._getAdbParameters();
    deserializeDebuggerConfig(
      ...this._getSerializationArgs(),
      (transientSettings, savedSettings) => {
        this.setState({
          launchPackage: savedSettings.launchPackage || '',
          launchActivity: savedSettings.launchActivity || '',
          launchService: savedSettings.launchService || '',
          launchAction: savedSettings.launchAction || '',
        });
      },
    );
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  setState(newState: Object): void {
    super.setState(newState, () =>
      this.props.configIsValidChanged(this._debugButtonShouldEnable()),
    );
  }

  _handleDeviceChange(device: ?Device): void {
    if (!this._deserializedSavedSettings) {
      this._deserializedSavedSettings = true;
      deserializeDebuggerConfig(
        ...this._getSerializationArgs(),
        (transientSettings, savedSettings) => {
          this.setState({
            launchPackage: savedSettings.launchPackage || '',
          });
        },
      );
    }

    this.setState({
      selectedDevice: device,
      packages: device == null ? Expect.value([]) : Expect.pendingValue([]),
    });

    this._refreshPackageList(device);
  }

  async _refreshPackageList(device: ?Device) {
    if (device != null) {
      const packages = Expect.value(
        (await this._adbService.getInstalledPackages(device)).sort(),
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

  _debugButtonShouldEnable = (): boolean => {
    return (
      this.state.selectedDevice != null &&
      this.state.launchPackage.trim() !== '' &&
      (this.state.launchActivity.trim() !== '' ||
        this.state.launchService.trim() !== '') &&
      this.state.launchAction.trim() !== ''
    );
  };

  _setAdbPorts(value: string): void {
    setAdbPath(this.props.targetUri, this.state.adbPath || '');

    const parsedPorts = value
      .split(/,\s*/)
      .map(port => parseInt(port.trim(), 10))
      .filter(port => !Number.isNaN(port));

    addAdbPorts(this.props.targetUri, parsedPorts);
    this.setState({adbPorts: value, selectedDevice: null});
  }

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
        <label>Activity: </label>
        <AtomInput
          placeholderText="com.example.app.main.MainActivity"
          value={this.state.launchActivity}
          onDidChange={value => this.setState({launchActivity: value})}
        />
        <label>Service: </label>
        <AtomInput
          placeholderText=".example.package.path.MyServiceClass"
          value={this.state.launchService}
          onDidChange={value => this.setState({launchService: value})}
        />
        <label>Intent: </label>
        <AtomInput
          placeholderText="android.intent.action.MAIN"
          value={this.state.launchAction}
          onDidChange={value => this.setState({launchAction: value})}
        />
      </div>
    );
  }

  _handleLaunchClick = async (): Promise<void> => {
    const packageName = this.state.launchPackage.trim().replace(/'/g, '');
    const activity = this.state.launchActivity.trim().replace(/'/g, '') || null;
    const service = this.state.launchService.trim().replace(/'/g, '') || null;
    const action = this.state.launchAction.trim().replace(/'/g, '') || null;
    const adbService = getAdbService(this.props.targetUri);
    const device = this.state.selectedDevice;
    invariant(device != null, 'No device selected.');

    await debugAndroidDebuggerService(
      null /* pid */,
      adbService,
      service,
      activity,
      action,
      device,
      packageName,
      this.props.targetUri /* adbServiceUri */,
      this.props.targetUri,
    );

    serializeDebuggerConfig(...this._getSerializationArgs(), {
      selectedDeviceName: device.name,
      launchPackage: this.state.launchPackage,
      launchActivity: this.state.launchActivity,
      launchService: this.state.launchService,
      launchAction: this.state.launchAction,
    });
  };
}
