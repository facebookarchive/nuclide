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

import type {AppInfoRow} from '../types';

import addTooltip from 'nuclide-commons-ui/addTooltip';
import * as React from 'react';
import {Table} from 'nuclide-commons-ui/Table';

type Props = {
  title: string,
  rows: Set<AppInfoRow>,
};

const MAX_ERROR_LINE_LENGTH = 80;
const MAX_NUMBER_ERROR_LINES = 10;

export class AppInfoTable extends React.Component<Props> {
  render(): React.Node {
    const rows = Array.from(this.props.rows.entries()).map(([row]) => ({
      data: {property: row.name, rowData: row},
    }));
    const columns = [
      {
        key: 'property',
        title: 'Property',
        width: 0.4,
      },
      {
        component: AppInfoValueCell,
        key: 'rowData',
        title: 'Value',
        width: 0.6,
      },
    ];
    const emptyComponent = () => <div className="padded">No information</div>;

    return (
      <div>
        <Table
          collapsable={false}
          columns={columns}
          maxBodyHeight="99999px"
          emptyComponent={emptyComponent}
          rows={rows}
          headerTitle={this.props.title}
        />
      </div>
    );
  }
}

class AppInfoValueCell extends React.Component<Object> {
  _prepareErrorMessage(error: string): string {
    return error
      .split(/\n/g)
      .filter(line => line.length > 0)
      .map(line => line.slice(0, MAX_ERROR_LINE_LENGTH))
      .slice(0, MAX_NUMBER_ERROR_LINES)
      .join('<br>');
  }

  _renderError(error: string): React.Node {
    return (
      <span
        className="icon icon-alert"
        ref={addTooltip({
          title: this._prepareErrorMessage(error),
          delay: 0,
        })}
      />
    );
  }

  render(): React.Node {
    const data = this.props.data;

    if (data.isError) {
      return this._renderError(data.value);
    }

    return data.value;
  }
}
