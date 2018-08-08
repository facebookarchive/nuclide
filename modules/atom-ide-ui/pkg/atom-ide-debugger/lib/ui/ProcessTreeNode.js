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

import type {IProcess, IDebugService, IThread} from '../types';

import {AtomInput} from 'nuclide-commons-ui/AtomInput';
import {TreeItem, NestedTreeItem} from 'nuclide-commons-ui/Tree';
import {observableFromSubscribeFunction} from 'nuclide-commons/event';
import {fastDebounce} from 'nuclide-commons/observable';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import * as React from 'react';
import {Observable} from 'rxjs';
import ThreadTreeNode from './ThreadTreeNode';
import {DebuggerMode} from '../constants';

type Props = {
  process: IProcess,
  service: IDebugService,
  title: string,
  filter: ?string,
  filterRegEx: ?RegExp,
};

type State = {
  isCollapsed: boolean,
  threads: Array<IThread>,
  isFocused: boolean,
  pendingStart: boolean,
};

export default class ProcessTreeNode extends React.Component<Props, State> {
  _disposables: UniversalDisposable;
  _filter: ?AtomInput;

  constructor(props: Props) {
    super(props);
    this.state = this._getState();
    this._disposables = new UniversalDisposable();
  }

  componentDidMount(): void {
    const {service} = this.props;
    const model = service.getModel();
    const {viewModel} = service;
    this._disposables.add(
      Observable.merge(
        observableFromSubscribeFunction(
          viewModel.onDidChangeDebuggerFocus.bind(viewModel),
        ),
      )
        .let(fastDebounce(15))
        .subscribe(this._handleFocusChanged),
      observableFromSubscribeFunction(model.onDidChangeCallStack.bind(model))
        .let(fastDebounce(15))
        .subscribe(this._handleCallStackChanged),
      observableFromSubscribeFunction(
        service.onDidChangeProcessMode.bind(service),
      ).subscribe(() =>
        this.setState(prevState => this._getState(prevState.isCollapsed)),
      ),
    );
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  _handleFocusChanged = (): void => {
    this.setState(prevState =>
      this._getState(!(this._computeIsFocused() || !prevState.isCollapsed)),
    );
  };

  _handleCallStackChanged = (): void => {
    const {process} = this.props;
    this.setState({
      threads: process.getAllThreads(),
    });
  };

  _computeIsFocused(): boolean {
    const {service, process} = this.props;
    const focusedProcess = service.viewModel.focusedProcess;
    return process === focusedProcess;
  }

  _getState(shouldBeCollapsed: ?boolean) {
    const {process} = this.props;
    const isFocused = this._computeIsFocused();
    const pendingStart = process.debuggerMode === DebuggerMode.STARTING;
    const isCollapsed =
      shouldBeCollapsed != null ? shouldBeCollapsed : !isFocused;
    return {
      isFocused,
      threads: process.getAllThreads(),
      isCollapsed,
      pendingStart,
    };
  }

  handleSelect = () => {
    this.setState(prevState => this._getState(!prevState.isCollapsed));
  };

  // Returns true if thread should be kept.
  filterThread(thread: IThread): boolean {
    const {filter, filterRegEx} = this.props;
    if (filter == null) {
      return true;
    } else if (filterRegEx == null) {
      // User entered an invalid regular expression.
      // Simply check if any thread contains the user's input.
      return (
        thread.name.toUpperCase().includes(filter.toUpperCase()) ||
        thread.threadId
          .toString()
          .toUpperCase()
          .includes(filter.toUpperCase())
      );
    } else {
      return (
        (filter.toUpperCase() === 'PAUSED' && thread.stopped) ||
        thread.name.match(filterRegEx) != null ||
        thread.threadId.toString().match(filterRegEx) != null
      );
    }
  }

  render() {
    const {service, title, process} = this.props;
    const {threads, isFocused, isCollapsed} = this.state;

    const tooltipTitle =
      service.viewModel.focusedProcess == null ||
      service.viewModel.focusedProcess.configuration.adapterExecutable == null
        ? 'Unknown Command'
        : service.viewModel.focusedProcess.configuration.adapterExecutable
            .command +
          service.viewModel.focusedProcess.configuration.adapterExecutable.args.join(
            ' ',
          );

    const handleTitleClick = event => {
      if (!this._computeIsFocused()) {
        service.viewModel.setFocusedProcess(process, true);
        event.stopPropagation();
      }
    };

    const formattedTitle = (
      <span>
        <span
          onClick={handleTitleClick}
          className={isFocused ? 'debugger-tree-process-thread-selected' : ''}
          title={tooltipTitle}>
          {title}
          {this.state.pendingStart ? ' (starting...)' : ''}
        </span>
      </span>
    );

    return threads.length === 0 ? (
      <TreeItem>{formattedTitle}</TreeItem>
    ) : (
      <NestedTreeItem
        title={formattedTitle}
        collapsed={isCollapsed}
        onSelect={this.handleSelect}>
        {threads.map((thread, threadIndex) => {
          if (this.filterThread(thread)) {
            return (
              <ThreadTreeNode
                key={threadIndex}
                thread={thread}
                service={service}
              />
            );
          }
        })}
      </NestedTreeItem>
    );
  }
}
