/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import React from 'react';
import type {
  Callstack,
  CallstackItem,
} from './types';
import type DebuggerActions from './DebuggerActions';
import type CallstackStore from './CallstackStore';

import nuclideUri from '../../commons-node/nuclideUri';
import UniversalDisposable from '../../commons-node/UniversalDisposable';
import Bridge from './Bridge';
import {Table} from '../../nuclide-ui/Table';

type DebuggerCallstackComponentProps = {
  actions: DebuggerActions,
  bridge: Bridge,
  callstackStore: CallstackStore,
};

type DebuggerCallstackComponentState = {
  callstack: ?Callstack,
  selectedCallFrameIndex: number,
};

export class DebuggerCallstackComponent extends React.Component {
  props: DebuggerCallstackComponentProps;
  state: DebuggerCallstackComponentState;
  _disposables: UniversalDisposable;

  constructor(props: DebuggerCallstackComponentProps) {
    super(props);
    (this: any)._handleCallframeClick = this._handleCallframeClick.bind(this);
    this._disposables = new UniversalDisposable();
    this.state = {
      callstack: props.callstackStore.getCallstack(),
      selectedCallFrameIndex: props.callstackStore.getSelectedCallFrameIndex(),
    };
  }

  componentDidMount(): void {
    const {callstackStore} = this.props;
    this._disposables.add(
      callstackStore.onChange(() => {
        this.setState({
          selectedCallFrameIndex: callstackStore.getSelectedCallFrameIndex(),
          callstack: callstackStore.getCallstack(),
        });
      }),
    );
  }

  componentWillUnmount(): void {
    this._disposables.dispose();
  }

  _handleCallframeClick(
    clickedCallframe: ?CallstackItem,
    callFrameIndex: number,
  ): void {
    this.props.bridge.setSelectedCallFrameIndex(callFrameIndex);
    this.props.actions.setSelectedCallFrameIndex(callFrameIndex);
  }

  render(): ?React.Element<any> {
    const {callstack} = this.state;
    const rows = callstack == null
      ? []
      : callstack.map((callstackItem, i) => {
        const {
          location,
        } = callstackItem;
        // Callstack paths may have a format like file://foo/bar, or
        // lldb://asm/0x1234. These are not valid paths that can be used to
        // construct a nuclideUri so we need to skip the protocol prefix.
        const path = nuclideUri.basename(location.path.replace(/^[a-zA-Z]+:\/\//, ''));
        const isSelected = this.state.selectedCallFrameIndex === i;
        const cellData = {
          data: {
            frame: i,
            address: callstackItem.name,
            location: `${path}:${callstackItem.location.line}`,
            isSelected,
          },
        };

        if (isSelected) {
          // $FlowIssue className is an optional property of a table row
          cellData.className = 'nuclide-debugger-callstack-item-selected';
        }

        return cellData;
      });

    const columns = [
      {
        title: '',
        key: 'frame',
        width: 0.05,
      },
      {
        title: 'Address',
        key: 'address',
      },
      {
        title: 'File Location',
        key: 'location',
      },
    ];

    const emptyComponent = () =>
      <div className="nuclide-debugger-callstack-list-empty">
        callstack unavailable
      </div>;

    return (
      <Table
        className="nuclide-debugger-callstack-table"
        columns={columns}
        emptyComponent={emptyComponent}
        rows={rows}
        selectable={true}
        resizable={true}
        onSelect={this._handleCallframeClick}
        sortable={false}
        ref="callstackTable"
      />
    );
  }
}
