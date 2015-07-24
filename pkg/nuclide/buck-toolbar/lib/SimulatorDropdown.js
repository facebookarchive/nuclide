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

async function loadSimulators(): Promise<any> {
  var devices = await IosSimulator.getDevices();

  return devices.map(device => ({
    label: device.name,
    value: device.udid,
  }));
}

var SimulatorDropdown = React.createClass({

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
      <NuclideDropdown ref="dropdown" menuItems={this.state.menuItems} />
    );
  },

  getSelectedSimulator(): ?string {
    return this.refs['dropdown'].getSelectedValue();
  },
});

module.exports = SimulatorDropdown;
