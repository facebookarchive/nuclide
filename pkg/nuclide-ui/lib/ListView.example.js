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
import {Listview} from './Listview';
import {Checkbox} from './Checkbox';

const NOOP = () => {};

const ListviewExample1 = (): React.Element<any> => (
  <Block>
    <Listview alternateBackground={true}>
      <div>test</div>
      <div>test</div>
      <div>test</div>
      <div>test</div>
      <div>test</div>
    </Listview>
  </Block>
);
const ListviewExample2 = (): React.Element<any> => (
  <Block>
    <Listview alternateBackground={true}>
      <Checkbox
        checked={true}
        onClick={NOOP}
        onChange={NOOP}
        label="A Checkbox."
      />
      <Checkbox
        checked={true}
        onClick={NOOP}
        onChange={NOOP}
        label="A Checkbox."
      />
      <Checkbox
        checked={true}
        onClick={NOOP}
        onChange={NOOP}
        label="A Checkbox."
      />
      <Checkbox
        checked={false}
        onClick={NOOP}
        onChange={NOOP}
        label="A Checkbox."
      />
      <Checkbox
        checked={false}
        onClick={NOOP}
        onChange={NOOP}
        label="A Checkbox."
      />
    </Listview>
  </Block>
);


export const ListviewExamples = {
  sectionName: 'Listview',
  description: '',
  examples: [
    {
      title: 'Simple Listview',
      component: ListviewExample1,
    },
    {
      title: 'Arbitrary components as list items',
      component: ListviewExample2,
    },
  ],
};
