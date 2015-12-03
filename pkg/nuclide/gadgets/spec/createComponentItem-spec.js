'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import invariant from 'assert';
import createComponentItem from '../lib/createComponentItem';
import React from 'react-for-atom';

class MyGadget extends React.Component {
  render() {
    return <div />;
  }
}

describe('createComponentItem', () => {

  it('creates an instance of the component', () => {
    const item = createComponentItem(<MyGadget />);
    expect(item instanceof MyGadget).toBe(true);
  });

  it('puts the HTML element on the created component', () => {
    const item = createComponentItem(<MyGadget />);
    invariant(item.element);
    expect(item.element instanceof HTMLElement).toBe(true);
  });

});
