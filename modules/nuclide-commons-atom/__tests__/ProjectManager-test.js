"use strict";

function _ProjectManager() {
  const data = require("../ProjectManager");

  _ProjectManager = function () {
    return data;
  };

  return data;
}

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 */
describe('_validateProjectSpec', () => {
  test('local', () => {
    expect((0, _ProjectManager()._validateProjectSpec)({
      originPath: '/a/b/c/my.project.toml',
      paths: ['d/e/f', '/x/y/z']
    })).toEqual({
      originPath: '/a/b/c/my.project.toml',
      paths: ['/a/b/c/d/e/f', '/x/y/z']
    });
    expect((0, _ProjectManager()._validateProjectSpec)({
      originPath: '/a/b/c/my.project.toml'
    })).toEqual({
      originPath: '/a/b/c/my.project.toml',
      paths: ['/a/b/c']
    });
  });
  test('remote', () => {
    expect((0, _ProjectManager()._validateProjectSpec)({
      originPath: 'nuclide://a.com/b/c/my.project.toml',
      paths: ['d/e/f', '/x/y/z']
    })).toEqual({
      originPath: 'nuclide://a.com/b/c/my.project.toml',
      paths: ['/b/c/d/e/f', '/x/y/z']
    });
    expect((0, _ProjectManager()._validateProjectSpec)({
      originPath: 'nuclide://a.com/b/c/my.project.toml'
    })).toEqual({
      originPath: 'nuclide://a.com/b/c/my.project.toml',
      paths: ['/b/c']
    });
  });
});