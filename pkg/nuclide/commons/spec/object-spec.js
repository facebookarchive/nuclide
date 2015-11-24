'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const objectHelpers = require('../lib/object.js');

describe('object.isEmpty', () => {
  it('correctly identifies empty Objects', () => {
    expect(objectHelpers.isEmpty({})).toEqual(true);
  });

  it('correctly identifies non-empty Objects', () => {

    const proto = {a:1, b:2, c:3};
    const objWithOwnProperties = Object.create(proto, {foo: {value: 'bar'}});
    const objWithoutOwnProperties = Object.create(proto);

    expect(objectHelpers.isEmpty({a: 1})).toEqual(false);
    expect(objectHelpers.isEmpty(objWithOwnProperties)).toEqual(false);
    expect(objectHelpers.isEmpty(objWithoutOwnProperties)).toEqual(false);
  });

});

describe('object.keyMirror', () => {
  it('correctly mirrors objects', () => {
    expect(objectHelpers.keyMirror({a: null, b: null}))
      .toEqual({a: 'a', b: 'b'});
  });
});
