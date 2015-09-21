'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var IosSimulator = require('./IosSimulator');
var NuclideDropdown = require('nuclide-ui-dropdown');
var React = require('react-for-atom');

var {PropTypes} = React;

import type {Device} from './IosSimulator';

class SimulatorDropdown extends React.Component {

  constructor(props: {[key: string]: mixed}) {
    super(props);
    this.state = {
      menuItems: [],
      selectedIndex: 0,
    };
    this._buildMenuItems = this._buildMenuItems.bind(this);
    this._handleSelection = this._handleSelection.bind(this);
  }

  componentDidMount() {
    IosSimulator.getDevices().then(this._buildMenuItems);
  }

  _buildMenuItems(devices: Array<Device>) {
    var selectedIndex = IosSimulator.selectDevice(devices);
    var menuItems = devices.map(device => ({
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
        selectedIndex={this.state.selectedIndex}
        menuItems={this.state.menuItems}
        onSelectedChange={this._handleSelection}
        size="sm"
        title={this.props.title}
      />
    );
  }

  _handleSelection(newIndex: number) {
    var selectedItem = this.state.menuItems[newIndex];
    if (selectedItem) {
      this.props.onSelectedSimulatorChange(selectedItem.value);
    }
    this.setState({selectedIndex: newIndex});
  }
}

SimulatorDropdown.propTypes = {
  className: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  onSelectedSimulatorChange: PropTypes.func.isRequired,
};

SimulatorDropdown.defaultProps = {
  className: '',
  title: 'Choose a device',
  onSelectedSimulatorChange: () => {},
};

module.exports = SimulatorDropdown;
