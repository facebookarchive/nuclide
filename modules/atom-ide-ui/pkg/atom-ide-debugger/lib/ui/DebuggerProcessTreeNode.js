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

import * as React from 'react';
import {NestedTreeItem} from 'nuclide-commons-ui/Tree';

type Props = {
  title: string,
  childItems: Array<React.Element<any>>,
  isFocused: boolean,
};
type State = {
  isCollapsed: boolean,
};

export default class DebuggerProcessTreeNode extends React.Component<
  Props,
  State,
> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isCollapsed: false,
    };
    this.handleSelect = this.handleSelect.bind(this);
  }

  handleSelect = () => {
    this.setState(prevState => ({
      isCollapsed: !prevState.isCollapsed,
    }));
  };

  render(): React.Node {
    const {title, isFocused} = this.props;
    const formattedTitle = (
      <span className={isFocused ? 'debugger-tree-frame-selected' : ''}>
        {title}
      </span>
    );
    return (
      <NestedTreeItem
        title={formattedTitle}
        collapsed={this.state.isCollapsed}
        onSelect={this.handleSelect}>
        {this.props.childItems}
      </NestedTreeItem>
    );
  }
}
