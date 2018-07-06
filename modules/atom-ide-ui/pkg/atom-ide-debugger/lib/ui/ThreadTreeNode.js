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

import {TreeItem, NestedTreeItem} from 'nuclide-commons-ui/Tree';
import {observableFromSubscribeFunction} from 'nuclide-commons/event';
import {fastDebounce} from 'nuclide-commons/observable';
import * as React from 'react';
import {Observable} from 'rxjs';
import FrameTreeNode from './FrameTreeNode';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';

type Props = {
  thread: IThread,
  service: IDebugService,
  title: string,
};

type State = {
  isCollapsed: boolean,
  childItems: Array<IStackFrame>,
  isFocused: boolean,
};

export default class ThreadTreeNode extends React.Component<Props, State> {
  _disposables: UniversalDisposable;

  constructor(props: Props) {
    super(props);
    this.state = this._getState();
    this._disposables = new UniversalDisposable();
    this.handleSelect = this.handleSelect.bind(this);
  }

  _getState(shouldBeCollapsed: ?boolean) {
    const {service, thread} = this.props;
    const focusedThread = service.viewModel.focusedThread;
    const isFocused =
      focusedThread == null
        ? false
        : thread.threadId === focusedThread.threadId;
    const isCollapsed =
      shouldBeCollapsed != null ? shouldBeCollapsed : !isFocused;
    return {
      isCollapsed,
      isFocused,
      childItems: thread.getCallStack(),
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
        .subscribe(() =>
          this.setState(prevState => this._getState(prevState.isCollapsed)),
        ),
    );
  }

  handleSelect = async () => {
    if (this.state.childItems.length === 0) {
      await this.props.thread.fetchCallStack();
    }
    this.setState(prevState => ({
      isCollapsed: !prevState.isCollapsed,
    }));
  };

  handleSelectNoChildren = () => {
    this.props.service.focusStackFrame(null, this.props.thread, null, true);
  };

  render(): React.Node {
    const {thread, title, service} = this.props;
    const {isFocused, childItems} = this.state;

    const formattedTitle = (
      <span
        className={isFocused ? 'debugger-tree-process-thread-selected' : ''}
        title={'Thread ID: ' + thread.threadId + ', Name: ' + thread.name}>
        {title}
      </span>
    );

    return childItems == null || childItems.length === 0 ? (
      <TreeItem onSelect={this.handleSelectNoChildren}>
        {formattedTitle}
      </TreeItem>
    ) : (
      <NestedTreeItem
        title={formattedTitle}
        collapsed={this.state.isCollapsed}
        onSelect={this.handleSelect}>
        {childItems.map((frame, frameIndex) => {
          return (
            <FrameTreeNode
              text={frame.name}
              frame={frame}
              key={frameIndex}
              service={service}
            />
          );
        })}
      </NestedTreeItem>
    );
  }
}
