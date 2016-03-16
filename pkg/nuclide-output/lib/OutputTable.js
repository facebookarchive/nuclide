'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Record} from './types';

import {React} from 'react-for-atom';
import RecordView from './RecordView';

type Props = {
  records: Array<Record>;
};

export default class OutputTable extends React.Component {
  props: Props;

  render(): ?ReactElement {
    return (
      <div
        className="nuclide-output-table-wrapper">
        {this.props.records.map(this._renderRow, this)}
      </div>
    );
  }

  _renderRow(record: Record, index: number): ReactElement {
    return <RecordView key={index} record={record} />;
  }

}
