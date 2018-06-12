/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow strict-local
 * @format
 */

import * as React from 'react';
import {Block} from 'nuclide-commons-ui/Block';
import {TreeList, TreeItem} from 'nuclide-commons-ui/Tree';
import MultiTargettedDebuggerTreeNode from './MultiTargettedDebuggerTreeNode';

/*
const helloWorldItemsLocals = [
  <TreeItem key={0}>a</TreeItem>,
  <TreeItem key={1}>b</TreeItem>,
];

<MultiTargettedDebuggerTreeNode
  key={0}
  title="Mario.js"
  childItems={[]}
/>,
*/

type Props = {};

const treeItems = [
  <MultiTargettedDebuggerTreeNode
    key={0}
    title="MobileApp"
    childItems={[
      <MultiTargettedDebuggerTreeNode
        key={0}
        title="ThreadID=235"
        childItems={[
          <MultiTargettedDebuggerTreeNode
            key={0}
            title="HelloWorld.js"
            childItems={[
              <MultiTargettedDebuggerTreeNode
                key={0}
                title="Locals"
                childItems={[
                  <TreeItem key={0}>a</TreeItem>,
                  <TreeItem key={1}>b</TreeItem>,
                ]}
              />,
              <MultiTargettedDebuggerTreeNode
                key={1}
                title="Globals"
                childItems={[<TreeItem key={0}>FACEBOOK_URI</TreeItem>]}
              />,
            ]}
          />,
          <MultiTargettedDebuggerTreeNode
            key={1}
            title="Mario.js"
            childItems={[
              <MultiTargettedDebuggerTreeNode
                key={0}
                title="Locals"
                childItems={[
                  <TreeItem key={0}>bowser_hp</TreeItem>,
                  <TreeItem key={1}>mario_hp</TreeItem>,
                ]}
              />,
              <MultiTargettedDebuggerTreeNode
                key={1}
                title="Globals"
                childItems={[]}
              />,
            ]}
          />,
        ]}
      />,
    ]}
  />,
  <MultiTargettedDebuggerTreeNode
    key={1}
    title="FacebookServer"
    childItems={[
      <MultiTargettedDebuggerTreeNode
        key={0}
        title="ThreadID=142"
        childItems={[
          <MultiTargettedDebuggerTreeNode
            key={0}
            title="Zuck.js"
            childItems={[
              <MultiTargettedDebuggerTreeNode
                key={0}
                title="Locals"
                childItems={[
                  <TreeItem key={0}>age</TreeItem>,
                  <TreeItem key={1}>isQuenched</TreeItem>,
                ]}
              />,
              <MultiTargettedDebuggerTreeNode
                key={0}
                title="Globals"
                childItems={[]}
              />,
            ]}
          />,
        ]}
      />,
      <MultiTargettedDebuggerTreeNode
        key={1}
        title="ThreadID=512"
        childItems={[
          <MultiTargettedDebuggerTreeNode
            key={0}
            title="Ads.js"
            childItems={[
              <MultiTargettedDebuggerTreeNode
                key={0}
                title="Locals"
                childItems={[<TreeItem key={0}>size</TreeItem>]}
              />,
              <MultiTargettedDebuggerTreeNode
                key={0}
                title="Globals"
                childItems={[<TreeItem key={0}>popularity</TreeItem>]}
              />,
            ]}
          />,
        ]}
      />,
    ]}
  />,
];

export default class MultiTargettedDebuggerComponent extends React.PureComponent<
  Props,
> {
  constructor() {
    super();
    this.handleSelect = this.handleSelect.bind(this);
  }

  handleSelect = () => {};

  //  Use handleConfirm() for double clicking.

  render(): React.Node {
    return (
      <div className="multitargetteddebuggertree">
        <Block>
          <TreeList showArrows={true}>{treeItems}</TreeList>
        </Block>
      </div>
    );
  }
}
