'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Record, Executor} from '../types';

import {React} from 'react-for-atom';
import RecordView from './RecordView';

type Props = {
  records: Array<Record>;
  showSourceLabels: boolean;
  getExecutor: (id: string) => ?Executor;
};

export default class OutputTable extends React.Component {
  props: Props;

  render(): ?React.Element<any> {
    return (
      <div
        className="nuclide-console-table-wrapper native-key-bindings"
        tabIndex="1">
        {this.props.records.map(this._renderRow, this)}
      </div>
    );
  }

  _renderRow(record: Record, index: number): React.Element<any> {
    return (
      <RecordView
        key={index}
        getExecutor={this.props.getExecutor}
        record={record}
        showSourceLabel={this.props.showSourceLabels}
      />
    );
  }

}
