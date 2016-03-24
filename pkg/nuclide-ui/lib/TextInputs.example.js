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
import {AtomInput} from './AtomInput';

const AtomInputExample = (): ReactElement => (
  <div>
    <Block>
      <AtomInput
        disabled={false}
        initialValue="atom input"
        placeholderText="placeholder text"
      />
    </Block>
    <Block>
      <AtomInput
        disabled={true}
        initialValue="disabled atom input"
        placeholderText="placeholder text"
      />
    </Block>
    <Block>
      <AtomInput
        initialValue="xs atom input"
        placeholderText="placeholder text"
        size="xs"
      />
    </Block>
    <Block>
      <AtomInput
        initialValue="sm atom input"
        placeholderText="placeholder text"
        size="sm"
      />
    </Block>
    <Block>
      <AtomInput
        initialValue="lg atom input"
        placeholderText="placeholder text"
        size="lg"
      />
    </Block>
    <Block>
      <AtomInput
        initialValue="unstyled atom input"
        placeholderText="placeholder text"
        unstyled={true}
      />
    </Block>
    <Block>
      <AtomInput
        initialValue="atom input with custom width"
        placeholderText="placeholder text"
        width={200}
      />
    </Block>
  </div>
);

export const TextInputExamples = {
  sectionName: 'Text Inputs',
  description: '',
  examples: [
    {
      title: 'AtomInput',
      component: AtomInputExample,
    },
  ],
};
