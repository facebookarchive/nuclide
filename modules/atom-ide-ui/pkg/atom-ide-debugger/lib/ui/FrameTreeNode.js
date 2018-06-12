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
  frame: IStackFrame,
  service: IDebugService,
  text: string,
};

type State = {
  isSelected: boolean,
};

export default class FrameTreeNode extends React.Component<Props, State> {
  constructor() {
    super();
    this.state = {
      isSelected: false,
    };
    this.handleSelect = this.handleSelect.bind(this);
  }

  handleSelect = () => {
    this.setState({
      isSelected: true,
    });
    this.props.service.focusStackFrame(this.props.frame, null, null, true);
  };

  render(): React.Node {
    const treeItem = (
      <TreeItem
        className="debugger-callstack-item-selected"
        onSelect={this.handleSelect}>
        {this.props.text}
      </TreeItem>
    );
    if (this.state.isSelected) {
      // $FlowIssue className is an optional property of a table row
      treeItem.className = 'debugger-callstack-item-selected';
    }

    return treeItem;
  }
}
