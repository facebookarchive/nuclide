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

import type {IStackFrame, IDebugService} from '../types';

import * as React from 'react';
import {TreeItem} from 'nuclide-commons-ui/Tree';
import classnames from 'classnames';

type Props = {
  frame: IStackFrame, // The frame that this node represents.
  service: IDebugService,
};

export default class FrameTreeNode extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
    this.handleSelect = this.handleSelect.bind(this);
  }

  handleSelect = () => {
    this.props.service.focusStackFrame(this.props.frame, null, null, true);
  };

  render(): React.Node {
    const {frame, service} = this.props;
    const activeFrame = service.viewModel.focusedStackFrame;
    const className = (activeFrame == null
    ? false
    : frame === activeFrame)
      ? classnames('debugger-tree-frame-selected', 'debugger-tree-frame')
      : 'debugger-tree-frame';

    const treeItem = (
      <TreeItem
        className={className}
        onSelect={this.handleSelect}
        title={
          `Frame ID: ${frame.frameId}, Name: ${frame.name}` +
          (frame.thread.stopped &&
          frame.thread.getCallStack()[0] === frame &&
          frame.source != null &&
          frame.source.name != null
            ? `, Stopped at: ${frame.source.name}: ${frame.range.end.row}`
            : '')
        }>
        {frame.name}
      </TreeItem>
    );

    return treeItem;
  }
}
