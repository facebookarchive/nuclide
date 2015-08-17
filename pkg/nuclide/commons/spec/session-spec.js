'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

describe('session.js', () => {
  it('keeps session id identical unless reset is called', () => {
    var session = require('../lib/session');
    var {SESSION_ID_KEY} = session.__test__;

    var id = session.id;
    var id1 = session.id;
    expect(id).toEqual(id1);
    expect(id).toEqual(global[SESSION_ID_KEY]);

    session.reset();
    var id2 = session.id;
    expect(id2 !== id1).toBe(true);
  });
});
