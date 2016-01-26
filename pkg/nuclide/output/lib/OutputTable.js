'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/* eslint-disable react/prop-types */

import type {Record} from './types';

import {React} from 'react-for-atom';
import RecordView from './RecordView';

type Props = {
  records: Array<Record>;
  clearRecords: () => void;
};

export default class OutputTable extends React.Component<void, Props, void> {

  constructor(props: Props) {
    super(props);
    (this: any)._handleClearButtonClick = this._handleClearButtonClick.bind(this);
    (this: any)._renderRow = this._renderRow.bind(this);
  }

  render(): ?ReactElement {
    return (
      <div className="nuclide-output">
        <div className="nuclide-output-header padded">
          <button
            className="btn btn-sm icon inline-block btn-secondary pull-right"
            onClick={this._handleClearButtonClick}
          >
            Clear
          </button>
        </div>
        <div className="nuclide-output-table-wrapper">
          {this.props.records.map(this._renderRow)}
        </div>
      </div>
    );
  }

  _renderRow(record: Record, index: number): ReactElement {
    return <RecordView key={index} record={record} />;
  }

  _handleClearButtonClick(event: SyntheticMouseEvent): void {
    this.props.clearRecords();
  }

}
