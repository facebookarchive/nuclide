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

import type {Avd} from '../AvdComponentProvider';

import {Button} from 'nuclide-commons-ui/Button';
import {ButtonGroup} from 'nuclide-commons-ui/ButtonGroup';
import {Table} from 'nuclide-commons-ui/Table';
import * as React from 'react';

type RowData = {
  avd: Avd,
};

type Props = {
  avds: Avd[],
  startAvd: (avd: Avd) => void,
};

export default class AvdTable extends React.Component<Props> {
  _renderAvd(rowProps: {data: Avd}): React.Node {
    const {startAvd} = this.props;
    const avd = rowProps.data;
    return (
      <div className="nuclide-adb-sdb-emulator-row">
        {avd}
        <ButtonGroup>
          <Button
            icon={'triangle-right'}
            onClick={() => startAvd(avd)}
            size="SMALL"
          />
        </ButtonGroup>
      </div>
    );
  }

  render(): React.Node {
    const {avds} = this.props;

    if (avds.length === 0) {
      return null;
    }

    const rowData: RowData[] = avds.map(avd => {
      return {avd};
    });

    return (
      <Table
        collapsable={false}
        columns={[
          {
            title: 'Emulators',
            key: 'avd',
            component: this._renderAvd.bind(this),
          },
        ]}
        fixedHeader={true}
        rows={rowData.map(data => {
          return {data};
        })}
      />
    );
  }
}
