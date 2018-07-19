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

type Props = {
  thread: IThread,
  service: IDebugService,
};

type State = {
  isCollapsed: boolean,
  childItems: Expected<Array<IStackFrame>>,
};

export default class ThreadTreeNode extends React.Component<Props, State> {
  _disposables: UniversalDisposable;
  _selectTrigger: Subject<void>;

  constructor(props: Props) {
    super(props);
    this._selectTrigger = new Subject();
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
      childItems: Expect.pending(),
    };
  }

  _getFrames(fetch: boolean = false): Observable<Expected<Array<IStackFrame>>> {
    const {thread} = this.props;
    const getValue = () => Observable.of(Expect.value(thread.getCallStack()));
    if (
      fetch ||
      (!this.state.childItems.isPending &&
        !this.state.childItems.isError &&
        this.state.childItems.value.length === 0)
    ) {
      return Observable.of(Expect.pending()).concat(
        Observable.fromPromise(
          (async () => {
            await thread.fetchCallStack();
            return Expect.value(thread.getCallStack());
          })(),
        ),
      );
    }
    return getValue();
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
        this.setState({
          isCollapsed: newIsCollapsed,
        });
      }),
      this._selectTrigger
        .asObservable()
        .let(fastDebounce(100))
        .switchMap(() => this._getFrames(true))
        .subscribe(frames => {
          this.setState({
            childItems: frames,
          });
        }),
      observableFromSubscribeFunction(model.onDidChangeCallStack.bind(model))
        .let(fastDebounce(100))
        .startWith(null)
        .switchMap(() =>
          this._getFrames().switchMap(frames => {
            if (
              !this.state.isCollapsed &&
              !frames.isPending &&
              !frames.isError &&
              frames.value.length === 0
            ) {
              return this._getFrames(true);
            }
            return Observable.of(frames);
          }),
        )
        .subscribe(frames => {
          const {isCollapsed} = this.state;

          this.setState({
            childItems: frames,
            isCollapsed: isCollapsed && !this._computeIsFocused(),
          });
        }),
    );
  }

  handleSelect = () => {
    if (!this.state.isCollapsed) {
      this.setState({
        isCollapsed: true,
      });
    } else {
      this.setState({
        isCollapsed: false,
        childItems: Expect.pending(),
      });
      this._selectTrigger.next();
    }
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
    const {childItems} = this.state;
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
      !childItems.isPending &&
      !childItems.isError &&
      childItems.value.length === 0
    ) {
      return (
        <TreeItem className="debugger-tree-no-frames">
          {formattedTitle}
        </TreeItem>
      );
    }

    const callFramesElements = childItems.isPending ? (
      LOADING
    ) : childItems.isError ? (
      <span className="debugger-tree-no-frames">
        Error fetching stack frames {childItems.error.toString()}
      </span>
    ) : (
      this._generateTable(childItems.value)
    );

    return (
      <NestedTreeItem
        title={formattedTitle}
        collapsed={this.state.isCollapsed}
        onSelect={this.handleSelect}>
        {callFramesElements}
      </NestedTreeItem>
    );
  }
}
