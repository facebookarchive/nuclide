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

import type {IThread, IDebugService} from '../types';

import {TreeItem} from 'nuclide-commons-ui/Tree';
import * as React from 'react';
import DebuggerProcessTreeNode from './DebuggerProcessTreeNode';

type Props = {
  thread: IThread,
  service: IDebugService,
  childItems: Array<React.Element<any>>,
  title: string,
};

export default class ThreadTreeNode extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
    this.handleSelect = this.handleSelect.bind(this);
  }

  handleSelect = () => {
    this.props.service.focusStackFrame(null, this.props.thread, null, true);
  };

  render(): React.Node {
    const {thread, service, title, childItems} = this.props;
    const focusedThread = service.viewModel.focusedThread;
    const isFocused =
      focusedThread == null
        ? false
        : thread.threadId === focusedThread.threadId;

    const formattedTitle = (
      <span
        className={isFocused ? 'debugger-tree-process-thread-selected' : ''}
        title={'Thread ID: ' + thread.threadId + ', Name: ' + thread.name}>
        {title}
      </span>
    );

    return childItems == null || childItems.length === 0 ? (
      <TreeItem onSelect={this.handleSelect}>{formattedTitle}</TreeItem>
    ) : (
      <DebuggerProcessTreeNode
        formattedTitle={formattedTitle}
        childItems={childItems}
      />
    );
  }
}
