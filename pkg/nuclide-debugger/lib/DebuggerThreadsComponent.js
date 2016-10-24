'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {React} from 'react-for-atom';
import type {ThreadItem} from './types';
import type Bridge from './Bridge';

import {Icon} from '../../nuclide-ui/Icon';
import {Table} from '../../nuclide-ui/Table';

type DebuggerThreadsComponentProps = {
  bridge: Bridge,
  threadList: Array<ThreadItem>,
  selectedThreadId: number,
};

const activeThreadIndicatorComponent = (props: {cellData: boolean}) => (
  <div className="nuclide-debugger-thread-list-item-current-indicator">
    {props.cellData
      ? <Icon icon="arrow-right" title="Selected Thread" />
      : null
    }
  </div>
);

export class DebuggerThreadsComponent extends React.Component {
  props: DebuggerThreadsComponentProps;

  constructor(props: DebuggerThreadsComponentProps) {
    super(props);
    (this: any)._handleSelectThread = this._handleSelectThread.bind(this);
  }

  _handleSelectThread(data: ThreadItem, selectedIndex: number): void {
    this.props.bridge.selectThread(data.id);
  }

  render(): ?React.Element<any> {
    const {
      threadList,
      selectedThreadId,
    } = this.props;
    const columns = [
      {
        component: activeThreadIndicatorComponent,
        title: '',
        key: 'isSelected',
        width: 0.05,
      },
      {
        title: 'ID',
        key: 'id',
        width: 0.15,
      },
      {
        title: 'Address',
        key: 'address',
        width: 0.55,
      },
      {
        title: 'Stop Reason',
        key: 'stopReason',
        width: 0.25,
      },
    ];
    const emptyComponent = () =>
      <div className="nuclide-debugger-thread-list-empty">
        {threadList == null ? '(threads unavailable)' : 'no threads to display'}
      </div>;
    const rows = threadList == null
      ? []
      : threadList.map((threadItem, i) => {
        const cellData = {
          data: {
            ...threadItem,
            isSelected: Number(threadItem.id) === selectedThreadId,
          },
        };
        if (Number(threadItem.id) === selectedThreadId) {
          // $FlowIssue className is an optional property of a table row
          cellData.className = 'nuclide-debugger-thread-list-item-selected';
        }
        return cellData;
      });
    return (
      <Table
        columns={columns}
        emptyComponent={emptyComponent}
        rows={rows}
        selectable={true}
        onSelect={this._handleSelectThread}
      />
    );
  }
}
