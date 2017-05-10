/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {Process} from '../types';

import React from 'react';
import {InfoTable} from './InfoTable';
import {ProcessTable} from './ProcessTable';

type Props = {
  infoTables: Map<string, Map<string, string>>,
  processTable: Array<Process>,
};

export class DevicePanel extends React.Component {
  props: Props;

  _createInfoTables(): React.Element<any>[] {
    return Array.from(
      this.props.infoTables.entries(),
    ).map(([title, infoTable]) => (
      <div className="block" key={title}>
        <InfoTable title={title} table={infoTable} />
      </div>
    ));
  }

  _createProcessTable(): React.Element<any> {
    if (this.props.processTable.length === 0) {
      return <div />;
    }
    const title = 'Process Table';
    return (
      <div className="block" key={title}>
        <ProcessTable title={title} table={this.props.processTable} />
      </div>
    );
  }

  render(): React.Element<any> {
    return (
      <div>
        {this._createInfoTables()}
        {this._createProcessTable()}
      </div>
    );
  }
}
