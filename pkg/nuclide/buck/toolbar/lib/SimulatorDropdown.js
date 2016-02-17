'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const IosSimulator = require('./IosSimulator');
const NuclideDropdown = require('../../../ui/dropdown');
const {React} = require('react-for-atom');

const {PropTypes} = React;

import type {Device} from './IosSimulator';

type State = {
  menuItems: Array<Object>;
  selectedIndex: number;
};

class SimulatorDropdown extends React.Component<void, void, State> {
  static propTypes = {
    className: PropTypes.string.isRequired,
    disabled: PropTypes.bool.isRequired,
    title: PropTypes.string.isRequired,
    onSelectedSimulatorChange: PropTypes.func.isRequired,
  };

  static defaultProps = {
    className: '',
    disabled: false,
    title: 'Choose a device',
    onSelectedSimulatorChange: () => {},
  };

  constructor(props: {[key: string]: mixed}) {
    super(props);
    this.state = {
      menuItems: [],
      selectedIndex: 0,
    };
    (this: any)._buildMenuItems = this._buildMenuItems.bind(this);
    (this: any)._handleSelection = this._handleSelection.bind(this);
  }

  componentDidMount() {
    IosSimulator.getDevices().then(this._buildMenuItems);
  }

  _buildMenuItems(devices: Array<Device>) {
    const selectedIndex = IosSimulator.selectDevice(devices);
    const menuItems = devices.map(device => ({
      label: `${device.name} (${device.os})`,
      value: device.udid,
    }));
    this.setState({menuItems, selectedIndex});
  }

  render(): ReactElement {
    if (this.state.menuItems.length === 0) {
      return <span />;
    }

    return (
      <NuclideDropdown
        className={this.props.className}
        disabled={this.props.disabled}
        selectedIndex={this.state.selectedIndex}
        menuItems={this.state.menuItems}
        onSelectedChange={this._handleSelection}
        size="sm"
        title={this.props.title}
      />
    );
  }

  _handleSelection(newIndex: number) {
    const selectedItem = this.state.menuItems[newIndex];
    if (selectedItem) {
      this.props.onSelectedSimulatorChange(selectedItem.value);
    }
    this.setState({selectedIndex: newIndex});
  }
}

module.exports = SimulatorDropdown;
