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

import * as React from 'react';
import type {IDebugService, IStackFrame} from '../types';

import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import nuclideUri from 'nuclide-commons/nuclideUri';
import {Table} from 'nuclide-commons-ui/Table';

type DebuggerCallstackComponentProps = {
  service: IDebugService,
};

type DebuggerCallstackComponentState = {
  callstack: Array<IStackFrame>,
  selectedCallFrameId: number,
};

export default class DebuggerCallstackComponent extends React.Component<
  DebuggerCallstackComponentProps,
  DebuggerCallstackComponentState,
> {
  _disposables: UniversalDisposable;

  constructor(props: DebuggerCallstackComponentProps) {
    super(props);
    this._disposables = new UniversalDisposable();
    this.state = this._getState();
  }

  _getState(): DebuggerCallstackComponentState {
    const {focussedStackFrame, focussedThread} = this.props.service.viewModel;
    return {
      callstack: focussedThread == null ? [] : focussedThread.getCallStack(),
      selectedCallFrameId:
        focussedStackFrame == null ? -1 : focussedStackFrame.frameId,
    };
  }

  _locationComponent = (props: {
    // eslint-disable-next-line react/no-unused-prop-types
    data: IStackFrame,
  }): React.Element<any> => {
    const {source, range} = props.data;
    const basename = nuclideUri.basename(source.uri);
    return (
      <div title={`${basename}:${range.start.row}`}>
        <span>
          {basename}:{range.start.row}
        </span>
      </div>
    );
  };

  componentDidMount(): void {
    const {service} = this.props;
    this._disposables.add(
      service
        .getModel()
        .onDidChangeCallStack(() => this.setState(this._getState())),
      service.viewModel.onDidFocusStackFrame(() =>
        this.setState(this._getState()),
      ),
    );
  }

  componentWillUnmount(): void {
    this._disposables.dispose();
  }

  _handleStackFrameClick = (
    clickedRow: {frame: IStackFrame},
    callFrameIndex: number,
  ): void => {
    this.props.service.focusStackFrame(clickedRow.frame, null, null, true);
  };

  render(): React.Node {
    const {callstack} = this.state;
    const rows =
      callstack == null
        ? []
        : callstack.map((stackFrame, index) => {
            const isSelected =
              this.state.selectedCallFrameId === stackFrame.frameId;
            const cellData = {
              data: {
                frameId: index + 1,
                address: stackFrame.name,
                frame: stackFrame,
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
        key: 'frameId',
        width: 0.05,
      },
      {
        title: 'Address',
        key: 'address',
      },
      {
        component: this._locationComponent,
        title: 'File Location',
        key: 'frame',
      },
    ];

    const emptyComponent = () => (
      <div className="nuclide-debugger-callstack-list-empty">
        callstack unavailable
      </div>
    );

    return (
      <Table
        className="nuclide-debugger-callstack-table"
        columns={columns}
        emptyComponent={emptyComponent}
        rows={rows}
        selectable={true}
        resizable={true}
        onSelect={this._handleStackFrameClick}
        sortable={false}
      />
    );
  }
}
