'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {containsPath} = require('../lib/utils');

describe('containsPath()', () => {

  it('returns true if a direct child of the root path', () => {
    expect(containsPath('/absolute/root', '/absolute/root/file.txt')).toBe(true);
  });

  it('returns true if a deep child of the root path', () => {
    expect(containsPath('/absolute/root', '/absolute/root/some/directory')).toBe(true);
  });

  it('returns false if the root does not match the check path', () => {
    expect(containsPath('/absolute/root', '/absolute/root_abc/child/path')).toBe(false);
  });

});
