/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import type {DebuggerModeType, IDebugService, IStackFrame} from '../types';
import * as React from 'react';

import {observableFromSubscribeFunction} from 'nuclide-commons/event';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {DebuggerMode} from '../constants';
import {Table} from 'nuclide-commons-ui/Table';
import {Observable} from 'rxjs';
import {fastDebounce} from 'nuclide-commons/observable';
import nullthrows from 'nullthrows';
// eslint-disable-next-line nuclide-internal/prefer-nuclide-uri
import classnames from 'classnames';
import idx from 'idx';
import {AtomInput} from 'nuclide-commons-ui/AtomInput';
import {Button, ButtonSizes} from 'nuclide-commons-ui/Button';
import {
  LoadingSpinner,
  LoadingSpinnerSizes,
} from 'nuclide-commons-ui/LoadingSpinner';

type Props = {
  service: IDebugService,
};

type State = {
  mode: DebuggerModeType,
  callstack: Array<IStackFrame>,
  selectedCallFrameId: number,
  callStackLevels: number,
  isFechingStackFrames: boolean,
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
    const {service} = this.props;
    const {focusedStackFrame, focusedThread} = service.viewModel;
    return {
      callStackLevels: this.state == null ? 20 : this.state.callStackLevels,
      mode: service.getDebuggerMode(),
      callstack: focusedThread == null ? [] : focusedThread.getCallStack(),
      selectedCallFrameId:
        focusedStackFrame == null ? -1 : focusedStackFrame.frameId,
      isFechingStackFrames: false,
    };
  }

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
        observableFromSubscribeFunction(service.onDidChangeMode.bind(service)),
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
    const {callstack, mode} = this.state;
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
              cellData.className = 'debugger-callstack-item-selected';
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
        width: 0.95,
      },
    ];

    const emptyComponent = () => (
      <div className="debugger-callstack-list-empty">callstack unavailable</div>
    );

    return (
      <div
        className={classnames('debugger-container-new', {
          'debugger-container-new-disabled': mode === DebuggerMode.RUNNING,
        })}>
        <div className="debugger-pane-content">
          <Table
            className="debugger-callstack-table"
            columns={columns}
            emptyComponent={emptyComponent}
            rows={rows}
            selectable={cellData => cellData.frame.source.available}
            resizable={true}
            onSelect={this._handleStackFrameClick}
            sortable={false}
          />
          {this._renderLoadMoreStackFrames()}
        </div>
      </div>
    );
  }

  _renderLoadMoreStackFrames(): ?React.Element<any> {
    const {viewModel} = this.props.service;
    const {callstack, isFechingStackFrames} = this.state;
    const totalFrames =
      idx(viewModel, _ => _.focusedThread.stoppedDetails.totalFrames) || 0;
    if (totalFrames <= callstack.length || callstack.length <= 1) {
      return null;
    }
    return (
      <div style={{display: 'flex'}}>
        <Button
          size={ButtonSizes.EXTRA_SMALL}
          disabled={isFechingStackFrames}
          onClick={() => {
            this.setState({isFechingStackFrames: true});
            nullthrows(viewModel.focusedThread)
              .fetchCallStack(this.state.callStackLevels)
              .then(() => this.setState(this._getState()));
          }}>
          More Stack Frames
        </Button>
        <AtomInput
          style={{'flex-grow': '1'}}
          placeholderText="Number of stack frames"
          initialValue={String(this.state.callStackLevels)}
          size="xs"
          onDidChange={value => {
            if (!isNaN(value)) {
              this.setState({callStackLevels: parseInt(value, 10)});
            }
          }}
        />
        <AtomInput />
        {isFechingStackFrames ? (
          <LoadingSpinner size={LoadingSpinnerSizes.EXTRA_SMALL} />
        ) : null}
      </div>
    );
  }
}
