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
};
type State = {
  isCollapsed: boolean,
};

export default class MultiTargettedDebuggerTreeNode extends React.Component<
  Props,
  State,
> {
  constructor() {
    super();
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
    return (
      <NestedTreeItem
        title={this.props.title}
        collapsed={this.state.isCollapsed}
        onSelect={this.handleSelect}>
        {this.props.childItems}
      </NestedTreeItem>
    );
  }
}
