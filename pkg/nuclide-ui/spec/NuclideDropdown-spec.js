/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import {Dropdown} from '../Dropdown';
import {React, ReactDOM, TestUtils} from 'react-for-atom';

const {
  renderIntoDocument,
  scryRenderedDOMComponentsWithTag,
} = TestUtils;

describe('Dropdown', () => {
  it('honors the value param', () => {
    const component = renderIntoDocument(
      <Dropdown
        options={[
          {label: 'foo', value: 'vfoo'},
          {label: 'bar', value: 'vbar'},
        ]}
        onChange={newValue => {}}
        value={'vbar'}
      />,
    );

    const button = scryRenderedDOMComponentsWithTag(component, 'button');
    // $FlowFixMe
    expect(ReactDOM.findDOMNode(button[0]).innerText).toBe('bar');
  });
});
