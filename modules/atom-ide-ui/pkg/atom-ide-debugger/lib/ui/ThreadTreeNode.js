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

/* globals Element */

import type {IThread, IStackFrame, IDebugService} from '../types';
import type {Expected} from 'nuclide-commons/expected';

import {LoadingSpinner} from 'nuclide-commons-ui/LoadingSpinner';
import {scrollIntoViewIfNeeded} from 'nuclide-commons-ui/scrollIntoView';
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
import ReactDOM from 'react-dom';

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
  _nestedTreeItem: ?NestedTreeItem;

  constructor(props: Props) {
    super(props);
    this._expandedSubject = new Subject();
    this.state = {
      isCollapsed: true,
      stackFrames: Expect.pending(),
    };
    this._disposables = new UniversalDisposable();
  }

  _threadIsFocused(): boolean {
    const {service, thread} = this.props;
    const focusedThread = service.viewModel.focusedThread;
    return focusedThread != null && thread.threadId === focusedThread.threadId;
  }

  _getFrames(levels: ?number): Observable<Expected<Array<IStackFrame>>> {
    // TODO: support frame paging - fetch ~20 frames here and offer
    // a way in the UI for the user to ask for more
    return levels != null
      ? this.props.thread.getFullCallStack(levels)
      : this.props.thread.getFullCallStack();
  }

  componentWillUnmount(): void {
    this._disposables.dispose();
  }

  componentDidMount(): void {
    const {service} = this.props;
    const model = service.getModel();
    const {viewModel} = service;
    const changedCallStack = observableFromSubscribeFunction(
      model.onDidChangeCallStack.bind(model),
    );
    // The React element may have subscribed to the event (call stack
    // changed) after the event occurred.
    const additionalFocusedCheck = this._threadIsFocused()
      ? changedCallStack.startWith(null)
      : changedCallStack;

    this._disposables.add(
      Observable.merge(
        observableFromSubscribeFunction(
          viewModel.onDidFocusStackFrame.bind(viewModel),
        ),
        observableFromSubscribeFunction(service.onDidChangeMode.bind(service)),
      ).subscribe(() => {
        const {isCollapsed} = this.state;
        const newIsCollapsed = isCollapsed && !this._threadIsFocused();
        this._setCollapsed(newIsCollapsed);
      }),
      this._expandedSubject
        .asObservable()
        .let(fastDebounce(100))
        .switchMap(() => {
          // Pass null for levels to _getFrames to force fetching of the
          // entire callstack if it's not loaded, since this thread node
          // is now expanded and the whole callstack is visible.
          return this._getFrames(null);
        })
        .subscribe(frames => {
          this.setState({
            stackFrames: frames,
          });
        }),
      additionalFocusedCheck
        .let(fastDebounce(100))
        .switchMap(() => {
          // If this node was already collapsed, it stays collapsed
          // unless this thread just became the focused thread, in
          // which case it auto-expands. If this node was already
          // expanded by the user, it stays expanded.
          const newIsCollapsed =
            this.state.isCollapsed && !this._threadIsFocused();

          // If the node is collapsed, we only need to fetch the first call
          // frame to display the stop location (if any). Otherwise, we need
          // to fetch the call stack.
          return this._getFrames(newIsCollapsed ? 1 : null).switchMap(frames =>
            Observable.of({
              frames,
              newIsCollapsed,
            }),
          );
        })
        .subscribe(result => {
          const {frames, newIsCollapsed} = result;
          this.setState({
            stackFrames: frames,
            isCollapsed: newIsCollapsed,
          });
        }),
      observableFromSubscribeFunction(
        service.onDidChangeActiveThread.bind(service),
      ).subscribe(() => {
        if (this._threadIsFocused() && this._nestedTreeItem != null) {
          const el = ReactDOM.findDOMNode(this._nestedTreeItem);
          if (el instanceof Element) {
            scrollIntoViewIfNeeded(el, false);
          }
        }
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
          // VSP line numbers start at 0.
          line: `${frame.range.end.row + 1}`,
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
    const isFocused = this._threadIsFocused();
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
      thread.stoppedDetails == null ||
      (!stackFrames.isPending &&
        !stackFrames.isError &&
        stackFrames.value.length === 0)
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
        onSelect={this.handleSelectThread}
        ref={elem => (this._nestedTreeItem = elem)}>
        {callFramesElements}
      </NestedTreeItem>
    );
  }
}
