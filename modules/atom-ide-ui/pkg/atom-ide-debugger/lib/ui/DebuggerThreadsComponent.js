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

import type {IDebugService, IThread} from '../types';
import type {Row} from 'nuclide-commons-ui/Table';

import * as React from 'react';
import invariant from 'assert';
import {observableFromSubscribeFunction} from 'nuclide-commons/event';
import {fastDebounce} from 'nuclide-commons/observable';
import ReactDOM from 'react-dom';
import {Icon} from 'nuclide-commons-ui/Icon';
import {Table} from 'nuclide-commons-ui/Table';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {
  LoadingSpinner,
  LoadingSpinnerSizes,
} from 'nuclide-commons-ui/LoadingSpinner';
import {scrollIntoViewIfNeeded} from 'nuclide-commons-ui/scrollIntoView';
import {Observable} from 'rxjs';

type Props = {|
  +service: IDebugService,
|};

type State = {
  threadList: Array<IThread>,
  selectedThreadId: number,
  // $FlowFixMe
  sortedColumn: ?ColumnName,
  sortDescending: boolean,
  threadsLoading: boolean,
};

type CellData = {|
  id: number,
  name: string,
  address: ?string,
  stopped: boolean,
  stopReason: ?string,
  isSelected: boolean,
  terminateThread?: number,
|};

type ColumnName =
  | 'id'
  | 'name'
  | 'address'
  | 'stopReason'
  | 'isSelected'
  | 'stopped'
  | 'terminateThread';

const activeThreadIndicatorComponent = (props: {cellData: boolean}) => (
  <div className="debugger-thread-list-item-current-indicator">
    {props.cellData ? (
      <Icon icon="arrow-right" title="Selected Thread" />
    ) : null}
  </div>
);

export default class DebuggerThreadsComponent extends React.Component<
  Props,
  State,
> {
  _disposables: UniversalDisposable;
  _threadTable: ?Table<*>;

  constructor(props: Props) {
    super(props);

    this._disposables = new UniversalDisposable();
    this.state = {
      sortedColumn: null,
      sortDescending: false,
      threadList: [],
      selectedThreadId: -1,
      threadsLoading: false, // TODO
      ...this._getState(),
    };
  }

  componentDidMount(): void {
    const {service} = this.props;
    const {viewModel} = service;
    const model = service.getModel();
    this._disposables.add(
      Observable.merge(
        observableFromSubscribeFunction(
          viewModel.onDidFocusStackFrame.bind(viewModel),
        ),
        observableFromSubscribeFunction(model.onDidChangeCallStack.bind(model)),
      )
        .let(fastDebounce(150))
        .subscribe(this._handleThreadsChanged),
    );
  }

  componentWillUnmount(): void {
    this._disposables.dispose();
  }

  componentDidUpdate() {
    // Ensure the selected thread is scrolled into view.
    this._scrollSelectedThreadIntoView();
  }

  _scrollSelectedThreadIntoView(): void {
    const listNode = ReactDOM.findDOMNode(this._threadTable);
    if (listNode) {
      const selectedRows =
        // $FlowFixMe
        listNode.getElementsByClassName('debugger-thread-list-item-selected');

      if (selectedRows && selectedRows.length > 0) {
        scrollIntoViewIfNeeded(selectedRows[0], false);
      }
    }
  }

  _handleThreadsChanged = (): void => {
    this.setState(this._getState());
  };

  _getState(): $Shape<State> {
    const {focusedThread, focusedProcess} = this.props.service.viewModel;
    return {
      threadList: focusedProcess == null ? [] : focusedProcess.getAllThreads(),
      selectedThreadId: focusedThread == null ? -1 : focusedThread.threadId,
    };
  }

  _handleSelectThread = async (data: CellData): Promise<void> => {
    const {service} = this.props;
    const matchedThread = this.state.threadList.filter(
      t => t.threadId === data.id,
    );

    invariant(matchedThread.length === 1);
    const thread: IThread = matchedThread[0];
    await service.getModel().fetchCallStack((thread: any));
    this.props.service.focusStackFrame(null, thread, null, true);
  };

  _handleSort = (sortedColumn: ?ColumnName, sortDescending: boolean): void => {
    this.setState({sortedColumn, sortDescending});
  };

  _sortRows = (
    threads: Array<Row<CellData>>,
    sortedColumnName: ?ColumnName,
    sortDescending: boolean,
  ): Array<Row<CellData>> => {
    if (sortedColumnName == null) {
      return threads;
    }

    // Use a numerical comparison for the ID column, string compare for all the others.
    const compare: any =
      sortedColumnName != null && sortedColumnName.toLowerCase() === 'id'
        ? (a: ?number, b: ?number, isAsc: boolean): number => {
            const cmp = (a || 0) - (b || 0);
            return isAsc ? cmp : -cmp;
          }
        : (a: string, b: string, isAsc: boolean): number => {
            const cmp = (a != null
              ? String(a).toLowerCase()
              : ''
            ).localeCompare(b != null ? String(b).toLowerCase() : '');
            return isAsc ? cmp : -cmp;
          };

    const getter = row => row.data[sortedColumnName];
    return [...threads].sort((a, b) => {
      return compare(getter(a), getter(b), !sortDescending);
    });
  };

  render(): React.Node {
    const {threadList, selectedThreadId} = this.state;
    const activeThreadCol = {
      component: activeThreadIndicatorComponent,
      title: '',
      key: 'isSelected',
      width: 0.05,
    };

    let supportsTerminateThreadsRequest = false;
    const {focusedProcess} = this.props.service.viewModel;
    if (
      focusedProcess != null &&
      focusedProcess.session != null &&
      Boolean(
        focusedProcess.session.capabilities.supportsTerminateThreadsRequest,
      )
    ) {
      supportsTerminateThreadsRequest = true;
    }

    const columns = [
      activeThreadCol,
      {
        title: 'ID',
        key: 'id',
        width: 0.1,
      },
      {
        title: 'Name',
        key: 'name',
        width: 0.15,
      },
      {
        title: 'Address',
        key: 'address',
        width: supportsTerminateThreadsRequest ? 0.35 : 0.45,
      },
      {
        title: 'Stop Reason',
        key: 'stopReason',
        width: 0.25,
      },
    ];

    if (supportsTerminateThreadsRequest) {
      columns.push({
        title: 'Terminate',
        key: 'terminateThread',
        width: 0.1,
        component: () => (
          <Icon
            icon="x"
            title="Terminate Thread"
            onClick={event => {
              atom.commands.dispatch(
                event.target.parentElement,
                'debugger:terminate-thread',
              );
              event.stopPropagation();
            }}
          />
        ),
      });
    }

    const emptyComponent = () => (
      <div className="debugger-thread-list-empty">
        {threadList == null ? '(threads unavailable)' : 'no threads to display'}
      </div>
    );
    const rows =
      threadList == null
        ? []
        : threadList.map(thread => {
            const stoppedDetails = thread.stoppedDetails;
            const callstack = thread.getCallStack();
            const cellData: Row<CellData> = {
              data: {
                id: thread.threadId,
                name: thread.name,
                address: callstack.length === 0 ? null : callstack[0].name,
                stopped: thread.stopped,
                stopReason:
                  stoppedDetails == null
                    ? null
                    : stoppedDetails.description != null
                      ? stoppedDetails.description
                      : stoppedDetails.reason,
                isSelected: thread.threadId === selectedThreadId,
                terminateThread: thread.threadId,
              },
            };
            if (thread.threadId === selectedThreadId) {
              cellData.className =
                'debugger-thread-list-item debugger-thread-list-item-selected';
            } else {
              cellData.className = 'debugger-thread-list-item';
            }

            // Decorate the cells with the thread ID they correspond to
            // so context menus know what thread to target for commands.
            cellData.rowAttributes = {
              'data-threadid': thread.threadId,
            };

            return cellData;
          });

    if (this.state.threadsLoading) {
      return (
        <div className="debugger-thread-loading" title="Loading threads...">
          <LoadingSpinner size={LoadingSpinnerSizes.MEDIUM} />
        </div>
      );
    }

    return (
      <Table
        columns={columns}
        emptyComponent={emptyComponent}
        rows={this._sortRows(
          rows,
          this.state.sortedColumn,
          this.state.sortDescending,
        )}
        selectable={cellData => cellData.stopped}
        resizable={true}
        onSelect={this._handleSelectThread}
        sortable={true}
        onSort={this._handleSort}
        sortedColumn={this.state.sortedColumn}
        sortDescending={this.state.sortDescending}
        ref={table => {
          this._threadTable = table;
        }}
      />
    );
  }
}
