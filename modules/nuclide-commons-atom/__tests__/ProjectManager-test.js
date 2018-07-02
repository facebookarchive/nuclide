"use strict";

function _ProjectManager() {
  const data = _interopRequireWildcard(require("../ProjectManager"));

  _ProjectManager = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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