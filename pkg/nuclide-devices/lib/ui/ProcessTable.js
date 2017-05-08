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

import type {Process} from '../types';
import React from 'react';

import {Table} from '../../../nuclide-ui/Table';
import {AtomInput} from '../../../nuclide-ui/AtomInput';

type Props = {
  table: Array<Process>,
  title: string,
};

type State = {
  filterText: string,
};

export class ProcessTable extends React.Component {
  props: Props;
  state: State;

  constructor(props: Props) {
    super(props);
    (this: any)._handleFilterTextChange = this._handleFilterTextChange.bind(
      this,
    );
    this.state = {
      filterText: '',
    };
  }

  render(): React.Element<any> {
    const filterRegex = new RegExp(this.state.filterText, 'i');
    const rows = this.props.table
      .filter(
        item =>
          filterRegex.test(item.user) ||
          filterRegex.test(item.pid) ||
          filterRegex.test(item.name),
      )
      .map(item => ({data: item}));
    const columns = [
      {
        key: 'pid',
        title: 'PID',
        width: 0.25,
      },
      {
        key: 'user',
        title: 'User',
        width: 0.25,
      },
      {
        key: 'name',
        title: 'Name',
        width: 0.50,
      },
    ];
    const emptyComponent = () => <div className="padded">No information</div>;

    return (
      <div>
        <strong>{this.props.title}</strong>
        <AtomInput
          placeholderText="Search..."
          initialValue={this.state.filterText}
          onDidChange={this._handleFilterTextChange}
          size="sm"
        />
        <Table
          collapsable={false}
          columns={columns}
          maxBodyHeight="99999px"
          emptyComponent={emptyComponent}
          rows={rows}
        />
      </div>
    );
  }

  _handleFilterTextChange(text: string): void {
    this.setState({
      filterText: text,
    });
  }
}
