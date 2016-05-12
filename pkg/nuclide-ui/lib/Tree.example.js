'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {React} from 'react-for-atom';
import {Block} from './Block';
import {
  TreeList,
  TreeItem,
  NestedTreeItem,
} from './Tree';

const BasicTreeExample = (): React.Element => (
  <div>
    Trees
    <Block>
      <TreeList>
        <TreeItem>TreeItem 1</TreeItem>
        <TreeItem>TreeItem 2</TreeItem>
        <NestedTreeItem title={<span>NestedTreeItem 1</span>} selected={true}>
          <TreeItem>TreeItem 3</TreeItem>
          <TreeItem>TreeItem 4</TreeItem>
        </NestedTreeItem>
        <NestedTreeItem title={<span>NestedTreeItem 2</span>} collapsed={true} />
      </TreeList>
    </Block>
  </div>
);

export const TreeExamples = {
  sectionName: 'Trees',
  description: 'Expandable, hierarchical lists.',
  examples: [
    {
      title: 'Basic Tree',
      component: BasicTreeExample,
    },
  ],
};
