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
import Fragment from './Fragment';
import {Button} from './Button';

const FragmentExample = (): React.Node => (
  <div>
    <Fragment>
      <div>Some text.</div>
      <span>Some other text.</span>
    </Fragment>
    <Fragment>
      <div>This text will be a sibling of the above text.</div>
      <Button>Any component can go inside a Fragment</Button>
    </Fragment>
  </div>
);

export const FragmentExamples = {
  sectionName: 'Fragment',
  description: 'Used to render multiple children without a parent container.',
  examples: [
    {
      title: 'Fragments',
      component: FragmentExample,
    },
  ],
};
