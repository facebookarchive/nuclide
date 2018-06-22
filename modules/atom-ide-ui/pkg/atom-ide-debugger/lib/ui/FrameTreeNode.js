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

type Props = {
  frame: IStackFrame, // The frame that this node represents.
  text: string,
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
    const {frame, service, text} = this.props;
    const activeFrame = service.viewModel.focusedStackFrame;
    const className = (activeFrame == null
    ? false
    : frame === activeFrame)
      ? 'debugger-tree-frame-selected'
      : '';

    const treeItem = (
      <TreeItem
        className={className}
        onSelect={this.handleSelect}
        title={`Frame ID: ${frame.frameId}, Name: ${frame.name}`}>
        {text}
      </TreeItem>
    );

    return treeItem;
  }
}
