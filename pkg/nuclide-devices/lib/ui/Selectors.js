/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import React from 'react';
import {Dropdown} from '../../../nuclide-ui/Dropdown';

import type {NuclideUri} from '../../../commons-node/nuclideUri';

type Props = {
  setHost: (host: NuclideUri) => void,
  setDeviceType: (deviceType: string) => void,
  hosts: NuclideUri[],
  host: NuclideUri,
  deviceTypes: string[],
  deviceType: ?string,
};

export class Selectors extends React.Component {
  props: Props;

  _getHostOptions(): Array<{value: ?string, label: string}> {
    return this.props.hosts.map(host => ({value: host, label: host}));
  }

  _getTypeOptions(): Array<{value: ?string, label: string}> {
    const typeOptions = this.props.deviceTypes.map(type => ({value: type, label: type}));
    typeOptions.splice(0, 0, {value: null, label: 'Select...'});
    return typeOptions;
  }

  render(): React.Element<any> {
    const dropdowns = [
      [
        'Connection:',
        <Dropdown
          className="inline-block"
          options={this._getHostOptions()}
          onChange={this.props.setHost}
          value={this.props.host}
          key="connection"
        />,
      ],
      [
        'Device type:',
        <Dropdown
          className="inline-block"
          options={this._getTypeOptions()}
          onChange={this.props.setDeviceType}
          value={this.props.deviceType}
          key="devicetype"
        />,
      ],
    ];

    return (
      <table>
        {dropdowns.map(([label, dropdown]) => (
          <tr key={label}>
            <td>
              <label className="inline-block">
                {label}
              </label>
            </td>
            <td>
              {dropdown}
            </td>
          </tr>
        ))}
      </table>
    );
  }
}
