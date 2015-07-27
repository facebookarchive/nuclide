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

async function loadSimulators(): Promise<any> {
  var devices = await IosSimulator.getDevices();

  return devices.map(device => ({
    label: device.name,
    value: device.udid,
  }));
}

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
    };
  },

  componentDidMount() {
    loadSimulators().then(this.receiveMenuItems);
  },

  receiveMenuItems(menuItems: any) {
    this.setState({menuItems});
  },

  render(): ReactElement {
    return (
      <NuclideDropdown
        className={this.props.className}
        menuItems={this.state.menuItems}
        ref="dropdown"
        title={this.props.title} />
    );
  },

  getSelectedSimulator(): ?string {
    return this.refs['dropdown'].getSelectedValue();
  },
});

module.exports = SimulatorDropdown;
