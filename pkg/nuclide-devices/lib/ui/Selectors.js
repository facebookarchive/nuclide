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

import type {NuclideUri} from '../../../commons-node/nuclideUri';
import type {DeviceAction} from '../types';

import React from 'react';
import {Dropdown} from '../../../nuclide-ui/Dropdown';
import {Button, ButtonSizes, ButtonTypes} from '../../../nuclide-ui/Button';

const FB_HOST_SUFFIX = '.facebook.com';

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
    (this: any)._handleDeviceActionSelected = this._handleDeviceActionSelected.bind(
      this,
    );
  }

  _handleDeviceActionSelected(value: ?string): void {
    if (value == null) {
      return;
    }
    const index = parseInt(value, 10);
    this.props.deviceActions[index].callback();
  }

  _getHostOptions(): Array<{value: ?string, label: string}> {
    return this.props.hosts
      .map(host => {
        return host.endsWith(FB_HOST_SUFFIX)
          ? host.substring(0, host.length - FB_HOST_SUFFIX.length)
          : host;
      })
      .map(host => ({value: host, label: host}));
  }

  _getActionsSelector(): ?React.Element<any> {
    const actionOptions = this.props.deviceActions.map((action, index) => ({
      value: `${index}`,
      label: action.name,
    }));
    if (actionOptions.length > 0) {
      actionOptions.splice(0, 0, {value: null, label: 'Select an action...'});
      return (
        <Dropdown
          className="inline-block"
          options={actionOptions}
          onChange={this._handleDeviceActionSelected}
          value={null}
          key="actions"
        />
      );
    }
    return null;
  }

  _getTypesSelector(): React.Element<any>[] {
    return this.props.deviceTypes.map(deviceType => {
      if (deviceType === this.props.deviceType) {
        return (
          <Button
            key={deviceType}
            buttonType={ButtonTypes.PRIMARY}
            size={ButtonSizes.SMALL}>
            {deviceType}
          </Button>
        );
      }
      return (
        <Button
          key={deviceType}
          size={ButtonSizes.SMALL}
          onClick={() => this.props.setDeviceType(deviceType)}>
          {deviceType}
        </Button>
      );
    });
  }

  render(): React.Element<any> {
    return (
      <table>
        <tr>
          <td>
            <Dropdown
              className="inline-block"
              options={this._getHostOptions()}
              onChange={this.props.setHost}
              value={this.props.host}
              key="connection"
            />
          </td>
        </tr>
        <tr>
          <td>
            {this._getTypesSelector()}
          </td>
        </tr>
        <tr>
          <td>
            {this._getActionsSelector()}
          </td>
        </tr>
      </table>
    );
  }
}
