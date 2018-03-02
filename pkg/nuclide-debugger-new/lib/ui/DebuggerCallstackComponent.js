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

import type {IDebugService, IStackFrame} from '../types';
import * as React from 'react';

import {observableFromSubscribeFunction} from 'nuclide-commons/event';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {UNKNOWN_SOURCE} from '../constants';
import {Table} from 'nuclide-commons-ui/Table';
import {Observable} from 'rxjs';
import {fastDebounce} from 'nuclide-commons/observable';
// eslint-disable-next-line rulesdir/prefer-nuclide-uri
import * as path from 'path';

type Props = {
  service: IDebugService,
};

type State = {
  callstack: Array<IStackFrame>,
  selectedCallFrameId: number,
};

export default class DebuggerCallstackComponent extends React.Component<
  Props,
  State,
> {
  _disposables: UniversalDisposable;

  constructor(props: Props) {
    super(props);
    this._disposables = new UniversalDisposable();
    this.state = this._getState();
  }

  _getState(): State {
    const {focusedStackFrame, focusedThread} = this.props.service.viewModel;
    return {
      callstack: focusedThread == null ? [] : focusedThread.getCallStack(),
      selectedCallFrameId:
        focusedStackFrame == null ? -1 : focusedStackFrame.frameId,
    };
  }

  _locationComponent = (props: {
    // eslint-disable-next-line react/no-unused-prop-types
    data: IStackFrame,
  }): React.Element<any> => {
    const {source, range} = props.data;
    const name =
      source.name != null
        ? source.name
        : path.basename(source.uri) || UNKNOWN_SOURCE;
    return (
      <div title={`${name}:${range.start.row}`}>
        <span>
          {name}:{range.start.row}
        </span>
      </div>
    );
  };

  componentDidMount(): void {
    const {service} = this.props;
    const model = service.getModel();
    const {viewModel} = service;
    this._disposables.add(
      Observable.merge(
        observableFromSubscribeFunction(model.onDidChangeCallStack.bind(model)),
        observableFromSubscribeFunction(
          viewModel.onDidFocusStackFrame.bind(viewModel),
        ),
      )
        .let(fastDebounce(15))
        .subscribe(() => this.setState(this._getState())),
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
        selectable={cellData => cellData.frame.source.available}
        resizable={true}
        onSelect={this._handleStackFrameClick}
        sortable={false}
      />
    );
  }
}
