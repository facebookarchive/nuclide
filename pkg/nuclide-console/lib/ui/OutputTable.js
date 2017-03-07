/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {Record, Executor, OutputProvider} from '../types';

import Hasher from '../../../commons-node/Hasher';
import React from 'react';
import RecordView from './RecordView';

type Props = {
  records: Array<Record>,
  showSourceLabels: boolean,
  getExecutor: (id: string) => ?Executor,
  getProvider: (id: string) => ?OutputProvider,
};

export default class OutputTable extends React.Component {
  props: Props;
  _hasher: Hasher<Record>;

  constructor(props: Props) {
    super(props);
    this._hasher = new Hasher();
    (this: any)._getExecutor = this._getExecutor.bind(this);
    (this: any)._getProvider = this._getProvider.bind(this);
  }

  render(): ?React.Element<any> {
    return (
      <div
        className="nuclide-console-table-wrapper native-key-bindings"
        tabIndex="1">
        {this.props.records.map(this._renderRow, this)}
      </div>
    );
  }

  _getExecutor(id: string): ?Executor {
    return this.props.getExecutor(id);
  }

  _getProvider(id: string): ?OutputProvider {
    return this.props.getProvider(id);
  }

  _renderRow(record: Record, index: number): React.Element<any> {
    return (
      <RecordView
        key={this._hasher.getHash(record)}
        getExecutor={this._getExecutor}
        getProvider={this._getProvider}
        record={record}
        showSourceLabel={this.props.showSourceLabels}
      />
    );
  }
}
