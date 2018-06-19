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

import type {Device} from 'nuclide-debugger-common/types';
import type {Expected} from 'nuclide-commons/expected';
import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {MenuItem} from 'nuclide-commons-ui/Dropdown';

import {observeAndroidDevicesX} from 'nuclide-adb/lib/AdbDevicePoller';
import * as React from 'react';
import {Dropdown} from 'nuclide-commons-ui/Dropdown';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {Expect} from 'nuclide-commons/expected';
import {LoadingSpinner} from 'nuclide-commons-ui/LoadingSpinner';
import {arrayEqual} from 'nuclide-commons/collection';
import invariant from 'assert';

const NO_DEVICES_MSG = 'No adb devices attached!';

type Props = {
  targetUri: NuclideUri,
  onChange: (value: ?Device) => void,
};

type State = {
  deviceList: Expected<Device[]>,
  selectedDevice: ?Device,
};

export class AdbDeviceSelector extends React.Component<Props, State> {
  props: Props;
  state: State;
  _disposables: UniversalDisposable;

  constructor(props: Props) {
    super(props);
    this._disposables = new UniversalDisposable();

    (this: any)._handleDeviceListChange = this._handleDeviceListChange.bind(
      this,
    );
    (this: any)._handleDeviceDropdownChange = this._handleDeviceDropdownChange.bind(
      this,
    );

    this.state = {
      deviceList: Expect.pendingValue([]),
      selectedDevice: null,
    };
  }

  componentDidMount(): void {
    this._disposables.add(
      observeAndroidDevicesX(this.props.targetUri)
        .startWith(Expect.pendingValue([]))
        .distinctUntilChanged((a, b) => {
          if (a.isPending || b.isPending) {
            return a.isPending === b.isPending;
          }

          if (a.isError || b.isError) {
            return a.isError === b.isError;
          }

          invariant(!a.isPending && !b.isPending && !a.isError && !b.isError);
          return arrayEqual(
            a.value != null ? a.value : [],
            b.value != null ? b.value : [],
            (x, y) => {
              return x.name === y.name;
            },
          );
        })
        .subscribe(deviceList => this._handleDeviceListChange(deviceList)),
    );
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  _handleDeviceListChange(deviceList: Expected<Device[]>): void {
    const previousDevice = this.state.selectedDevice;
    let selectedDevice =
      deviceList.isError || deviceList.isPending || previousDevice == null
        ? null
        : deviceList.value.find(device => device.name === previousDevice.name);

    if (
      selectedDevice == null &&
      !deviceList.isError &&
      !deviceList.isPending
    ) {
      selectedDevice = deviceList.value[0];
    }

    this.setState({
      deviceList,
      selectedDevice,
    });
    this.props.onChange(selectedDevice);
  }

  _getDeviceItems(): Array<MenuItem> {
    invariant(
      !this.state.deviceList.isError && !this.state.deviceList.isPending,
    );
    if (this.state.deviceList.value.length === 0) {
      return [{value: null, label: NO_DEVICES_MSG}];
    }

    return this.state.deviceList.value.map(device => ({
      value: device,
      label: device.displayName,
    }));
  }

  render(): React.Node {
    if (this.state.deviceList.isPending) {
      return <LoadingSpinner size="EXTRA_SMALL" />;
    }

    if (this.state.deviceList.isError) {
      return (
        <div className="nuclide-ui-message-error">
          {this.state.deviceList.error.toString()}
        </div>
      );
    }

    const deviceItems = this._getDeviceItems();
    return (
      <Dropdown
        options={deviceItems}
        onChange={this._handleDeviceDropdownChange}
        value={this.state.selectedDevice}
      />
    );
  }

  _handleDeviceDropdownChange(selectedDevice: ?Device): void {
    this.setState({
      selectedDevice,
    });
    this.props.onChange(selectedDevice);
  }
}
