'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Device} from './IosSimulator';

import * as IosSimulator from './IosSimulator';
import {Dropdown} from '../../nuclide-ui/lib/Dropdown';
import invariant from 'assert';
import {React} from 'react-for-atom';

class SimulatorDropdown extends React.Component {
  _deviceSubscription: ?rx$ISubscription;

  static propTypes = {
    className: React.PropTypes.string.isRequired,
    disabled: React.PropTypes.bool.isRequired,
    title: React.PropTypes.string.isRequired,
    onSelectedSimulatorChange: React.PropTypes.func.isRequired,
  };

  static defaultProps = {
    className: '',
    disabled: false,
    title: 'Choose a device',
    onSelectedSimulatorChange: (simulator: string) => {},
  };

  state: {
    options: Array<{label: string; value: string}>;
    value: string;
  };

  constructor(props: Object) {
    super(props);
    this.state = {
      options: [],
      value: '',
    };
    (this: any)._buildMenuItems = this._buildMenuItems.bind(this);
    (this: any)._handleSelection = this._handleSelection.bind(this);
  }

  componentDidMount() {
    this._deviceSubscription = IosSimulator.getDevices().subscribe(this._buildMenuItems);
  }

  componentWillUnmount(): void {
    invariant(this._deviceSubscription != null);
    this._deviceSubscription.unsubscribe();
  }

  _buildMenuItems(devices: Array<Device>): void {
    const selectedIndex = IosSimulator.getActiveDeviceIndex(devices);
    const value = devices[selectedIndex].udid;
    const options = devices.map(device => ({
      label: `${device.name} (${device.os})`,
      value: device.udid,
    }));
    this.setState({options, value});
  }

  render(): React.Element {
    if (this.state.options.length === 0) {
      return <span />;
    }

    return (
      <Dropdown
        className={this.props.className}
        disabled={this.props.disabled}
        value={this.state.value}
        options={this.state.options}
        onChange={this._handleSelection}
        size="sm"
        title={this.props.title}
      />
    );
  }

  _handleSelection(value: string) {
    this.props.onSelectedSimulatorChange(value);
    this.setState({value});
  }
}

module.exports = SimulatorDropdown;
