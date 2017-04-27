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
import type {DeviceAction} from '../types';

type Props = {
  setHost: (host: NuclideUri) => void,
  setDeviceType: (deviceType: string) => void,
  hosts: NuclideUri[],
  host: NuclideUri,
  deviceTypes: string[],
  deviceType: ?string,
  deviceActions: DeviceAction[],
};

export class Selectors extends React.Component {
  props: Props;

  constructor(props: Props) {
    super(props);
    (this: any)._handleDeviceActionSelected = this._handleDeviceActionSelected.bind(this);
  }

  _handleDeviceActionSelected(value: ?string): void {
    if (value == null) {
      return;
    }
    const index = parseInt(value, 10);
    this.props.deviceActions[index].callback();
  }

  _getHostOptions(): Array<{value: ?string, label: string}> {
    return this.props.hosts.map(host => ({value: host, label: host}));
  }

  _getTypeOptions(): Array<{value: ?string, label: string}> {
    const typeOptions = this.props.deviceTypes.map(type => ({value: type, label: type}));
    typeOptions.splice(0, 0, {value: null, label: 'Select...'});
    return typeOptions;
  }

  _getDeviceActionOptions(): Array<{value: ?string, label: string}> {
    const actionOptions = this.props.deviceActions.map(
      (action, index) => ({value: `${index}`, label: action.name}),
    );
    if (actionOptions.length > 0) {
      actionOptions.splice(0, 0, {value: null, label: 'Select...'});
    }
    return actionOptions;
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

    const deviceActionOptions = this._getDeviceActionOptions();
    if (deviceActionOptions.length > 0) {
      dropdowns.push(
        [
          'Actions:',
          <Dropdown
            className="inline-block"
            options={deviceActionOptions}
            onChange={this._handleDeviceActionSelected}
            value={null}
            key="actions"
          />,
        ],
      );
    }

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
