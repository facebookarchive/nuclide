'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var Checkbox = require('../lib/NuclideCheckbox');
var React = require('react-for-atom');

var reactElement;

function createWithProps(props: any) {
  var hostEl = document.createElement('div');
  return React.render(<Checkbox {...props} />, hostEl);
}

describe('NuclideCheckbox', () => {

  afterEach(() => {
    if (reactElement) {
      React.unmountComponentAtNode(React.findDOMNode(reactElement).parentNode);
    }
    reactElement = null;
  });

  it('verifies initial checked state', () => {
    reactElement = createWithProps({checked: true});
    expect(reactElement.isChecked()).toBe(true);
    reactElement = createWithProps({checked: false});
    expect(reactElement.isChecked()).toBe(false);
  });

  //TODO: more tests
});
