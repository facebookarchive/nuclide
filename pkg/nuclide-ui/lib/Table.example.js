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
import {Table} from './Table';

const TableExample = (): React.Element<any> => {
  const columns = [
    {
      title: 'first column',
      key: 'first',
    },
    {
      title: 'second column',
      key: 'second',
    },
    {
      title: 'third column',
      key: 'third',
    },
    {
      title: 'fourth column',
      key: 'fourth',
    },
    {
      title: 'fifth column',
      key: 'fifth',
    },
  ];
  const rows = [
    {
      first: 1,
      second: 2,
      third: 3,
      fourth: 33,
      fifth: 123,
    },
    {
      first: 4,
      second: 5,
      third: 6,
      fourth: 66,
      fifth: 123,
    },
    {
      first: 7,
      second: 8,
      // third is empty
      fourth: 66,
      fifth: 123,
    },
  ];
  return (
    <Block>
      <Table
        emptyComponent={() => <div>empty</div>}
        columns={columns}
        rows={rows}
        selectable={true}
      />
    </Block>
  );
};

export const TableExamples = {
  sectionName: 'Table',
  description: '',
  examples: [
    {
      title: 'Simple Table',
      component: TableExample,
    },
  ],
};
