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

import type {IThread, IStackFrame, IDebugService} from '../types';
import type {Expected} from 'nuclide-commons/expected';

import {LoadingSpinner} from 'nuclide-commons-ui/LoadingSpinner';
import {Table} from 'nuclide-commons-ui/Table';
import {NestedTreeItem, TreeItem} from 'nuclide-commons-ui/Tree';
import {observableFromSubscribeFunction} from 'nuclide-commons/event';
import {fastDebounce} from 'nuclide-commons/observable';
import * as React from 'react';
import {Observable, Subject} from 'rxjs';
import {DebuggerMode} from '../constants';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {Expect} from 'nuclide-commons/expected';
import classnames from 'classnames';

type Props = {
  thread: IThread,
  service: IDebugService,
};

type State = {
  isCollapsed: boolean,
  stackFrames: Expected<Array<IStackFrame>>,
};

export default class ThreadTreeNode extends React.Component<Props, State> {
  _disposables: UniversalDisposable;
  // Subject that emits every time this node transitions from collapsed
  // to expanded.
  _expandedSubject: Subject<void>;

  constructor(props: Props) {
    super(props);
    this._expandedSubject = new Subject();
    this.state = this._getInitialState();
    this._disposables = new UniversalDisposable();
  }

  _computeIsFocused(): boolean {
    const {service, thread} = this.props;
    const focusedThread = service.viewModel.focusedThread;
    return focusedThread != null && thread.threadId === focusedThread.threadId;
  }

  _getInitialState() {
    return {
      isCollapsed: true,
      stackFrames: Expect.pending(),
    };
  }

  _getFrames(): Observable<Expected<Array<IStackFrame>>> {
    // TODO: support frame paging - fetch ~20 frames here and offer
    // a way in the UI for the user to ask for more
    return this.props.thread.getFullCallStack();
  }

  componentWillUnmount(): void {
    this._disposables.dispose();
  }

  componentDidMount(): void {
    const {service} = this.props;
    const model = service.getModel();
    const {viewModel} = service;
    this._disposables.add(
      Observable.merge(
        observableFromSubscribeFunction(
          viewModel.onDidFocusStackFrame.bind(viewModel),
        ),
        observableFromSubscribeFunction(service.onDidChangeMode.bind(service)),
      ).subscribe(() => {
        const {isCollapsed} = this.state;
        const newIsCollapsed = isCollapsed && !this._computeIsFocused();
        this._setCollapsed(newIsCollapsed);
      }),
      this._expandedSubject
        .asObservable()
        .let(fastDebounce(100))
        .switchMap(() => this._getFrames())
        .subscribe(frames => {
          this.setState({
            stackFrames: frames,
          });
        }),
      observableFromSubscribeFunction(model.onDidChangeCallStack.bind(model))
        .let(fastDebounce(100))
        .switchMap(() => this._getFrames())
        .subscribe(frames => {
          const {isCollapsed} = this.state;
          this.setState({
            stackFrames: frames,

            // If this node was already collapsed, it stays collapsed
            // unless this thread just became the focused thread, in
            // which case it auto-expands. If this node was already
            // expanded by the user, it stays expanded.
            isCollapsed: isCollapsed && !this._computeIsFocused(),
          });
        }),
    );
  }

  _setCollapsed(isCollapsed: boolean): void {
    this.setState({
      isCollapsed,
    });

    if (!isCollapsed) {
      this._expandedSubject.next();
    }
  }

  handleSelectThread = () => {
    const newCollapsed = !this.state.isCollapsed;
    this._setCollapsed(newCollapsed);
  };

  _handleStackFrameClick = (
    clickedRow: {frame: IStackFrame},
    callFrameIndex: number,
  ): void => {
    this.props.service.focusStackFrame(clickedRow.frame, null, null, true);
  };

  _generateTable(childItems: Array<IStackFrame>) {
    const {service} = this.props;
    const rows = childItems.map((frame, frameIndex) => {
      const activeFrame = service.viewModel.focusedStackFrame;
      const isSelected = activeFrame != null ? frame === activeFrame : false;
      const cellData = {
        data: {
          name: frame.name,
          source:
            frame.source != null && frame.source.name != null
              ? `${frame.source.name}`
              : '',
          line: `${frame.range.end.row}`,
          frame,
          isSelected,
        },
        className: isSelected ? 'debugger-callstack-item-selected' : undefined,
      };
      return cellData;
    });
    const columns = [
      {
        title: 'Name',
        key: 'name',
        width: 0.5,
      },
      {
        title: 'Source',
        key: 'source',
        width: 0.35,
      },
      {
        title: 'Line',
        key: 'line',
        width: 0.15,
      },
    ];
    return (
      <div
        className={classnames({
          'debugger-container-new-disabled':
            service.getDebuggerMode() === DebuggerMode.RUNNING,
        })}>
        <div className="debugger-callstack-table-div">
          <Table
            className="debugger-callstack-table"
            columns={columns}
            rows={rows}
            selectable={cellData => cellData.frame.source.available}
            resizable={true}
            onSelect={this._handleStackFrameClick}
            sortable={false}
          />
        </div>
      </div>
    );
  }

  render(): React.Node {
    const {thread, service} = this.props;
    const {stackFrames} = this.state;
    const isFocused = this._computeIsFocused();
    const handleTitleClick = event => {
      if (thread.stopped) {
        service.focusStackFrame(null, thread, null, true);
      }
      event.stopPropagation();
    };
    const formattedTitle = (
      <span
        onClick={handleTitleClick}
        className={
          isFocused ? classnames('debugger-tree-process-thread-selected') : ''
        }
        title={'Thread ID: ' + thread.threadId + ', Name: ' + thread.name}>
        {thread.name +
          (thread.stoppedDetails == null ? ' (Running)' : ' (Paused)')}
      </span>
    );

    if (
      !stackFrames.isPending &&
      !stackFrames.isError &&
      stackFrames.value.length === 0
    ) {
      return (
        <TreeItem className="debugger-tree-no-frames">
          {formattedTitle}
        </TreeItem>
      );
    }

    const LOADING = (
      <div
        className={classnames(
          'debugger-expression-value-row',
          'debugger-tree-no-frames',
        )}>
        <span className="debugger-expression-value-content">
          <LoadingSpinner size="SMALL" />
        </span>
      </div>
    );

    const ERROR = (
      <span className="debugger-tree-no-frames">
        Error fetching stack frames{' '}
        {stackFrames.isError ? stackFrames.error.toString() : null}
      </span>
    );

    const callFramesElements = stackFrames.isPending
      ? LOADING
      : stackFrames.isError
        ? ERROR
        : this._generateTable(stackFrames.value);

    return (
      <NestedTreeItem
        title={formattedTitle}
        collapsed={this.state.isCollapsed}
        onSelect={this.handleSelectThread}>
        {callFramesElements}
      </NestedTreeItem>
    );
  }
}
