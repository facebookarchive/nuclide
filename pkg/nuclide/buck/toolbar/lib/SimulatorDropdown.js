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

var SimulatorDropdown = React.createClass({

  propTypes: {
    className: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
  },

  getDefaultProps(): {[key: string]: mixed} {
    return {
      className: '',
      title: 'Choose a device',
    };
  },

  getInitialState(): any {
    return {
      menuItems: [],
      selectedIndex: 0,
    };
  },

  componentDidMount() {
    IosSimulator.getDevices().then(this.buildMenuItems);
  },

  buildMenuItems(devices: Array<Device>) {
    var selectedIndex = IosSimulator.selectDevice(devices);
    var menuItems = devices.map(device => ({
      label: `${device.name} (${device.os})`,
      value: device.udid,
    }));
    this.setState({menuItems, selectedIndex});
  },

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
  },

  _handleSelection(newIndex: number) {
    this.setState({selectedIndex: newIndex});
  },

  getSelectedSimulator(): ?string {
    var selectedItem = this.state.menuItems[this.state.selectedIndex];
    return selectedItem && selectedItem.value;
  },
});

module.exports = SimulatorDropdown;
