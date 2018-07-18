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

import {TreeItem, NestedTreeItem} from 'nuclide-commons-ui/Tree';
import {observableFromSubscribeFunction} from 'nuclide-commons/event';
import {fastDebounce} from 'nuclide-commons/observable';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import * as React from 'react';
import {Observable} from 'rxjs';
import ThreadTreeNode from './ThreadTreeNode';

type Props = {
  process: IProcess,
  service: IDebugService,
  title: string,
};

type State = {
  isCollapsed: boolean,
  childItems: Array<IThread>,
  isFocused: boolean,
};

export default class ProcessTreeNode extends React.Component<Props, State> {
  _disposables: UniversalDisposable;

  constructor(props: Props) {
    super(props);
    this.state = this._getState();
    this._disposables = new UniversalDisposable();
    this.handleSelect = this.handleSelect.bind(this);
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
      )
        .let(fastDebounce(15))
        .subscribe(this._handleThreadsChanged),
      observableFromSubscribeFunction(model.onDidChangeCallStack.bind(model))
        .let(fastDebounce(15))
        .subscribe(this._handleCallStackChanged),
    );
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  _handleThreadsChanged = (): void => {
    this.setState(prevState =>
      this._getState(!(this._computeIsFocused() || !prevState.isCollapsed)),
    );
  };

  _handleCallStackChanged = (): void => {
    const {process} = this.props;
    this.setState({
      childItems: process.getAllThreads(),
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
    const isCollapsed =
      shouldBeCollapsed != null ? shouldBeCollapsed : !isFocused;
    return {
      isFocused,
      childItems: process.getAllThreads(),
      isCollapsed,
    };
  }

  handleSelect = () => {
    this.setState(prevState => this._getState(!prevState.isCollapsed));
  };

  render() {
    const {service, title, process} = this.props;
    const {childItems, isFocused} = this.state;

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
      service.focusStackFrame(null, null, process, true);
      event.stopPropagation();
    };

    const formattedTitle = (
      <span
        onClick={handleTitleClick}
        className={isFocused ? 'debugger-tree-process-thread-selected' : ''}
        title={tooltipTitle}>
        {title}
      </span>
    );

    return childItems == null || childItems.length === 0 ? (
      <TreeItem>{formattedTitle}</TreeItem>
    ) : (
      <NestedTreeItem
        title={formattedTitle}
        collapsed={this.state.isCollapsed}
        onSelect={this.handleSelect}>
        {childItems.map((thread, threadIndex) => {
          return (
            <ThreadTreeNode
              key={threadIndex}
              childItems={thread.getCallStack()}
              thread={thread}
              service={service}
            />
          );
        })}
      </NestedTreeItem>
    );
  }
}
