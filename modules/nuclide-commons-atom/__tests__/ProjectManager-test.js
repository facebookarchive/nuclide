'use strict';

var _ProjectManager;

function _load_ProjectManager() {
  return _ProjectManager = _interopRequireDefault(require('../ProjectManager'));
}

var _ProjectManager2;

function _load_ProjectManager2() {
  return _ProjectManager2 = require('../ProjectManager');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('_validateProjectSpec', () => {
  test('local', () => {
    expect((0, (_ProjectManager2 || _load_ProjectManager2())._validateProjectSpec)({
      originPath: '/a/b/c/my.project.toml',
      paths: ['d/e/f', '/x/y/z']
    })).toEqual({
      originPath: '/a/b/c/my.project.toml',
      paths: ['/a/b/c/d/e/f', '/x/y/z']
    });
    expect((0, (_ProjectManager2 || _load_ProjectManager2())._validateProjectSpec)({
      originPath: '/a/b/c/my.project.toml'
    })).toEqual({
      originPath: '/a/b/c/my.project.toml',
      paths: ['/a/b/c']
    });
  });

  test('remote', () => {
    expect((0, (_ProjectManager2 || _load_ProjectManager2())._validateProjectSpec)({
      originPath: 'nuclide://a.com/b/c/my.project.toml',
      paths: ['d/e/f', '/x/y/z']
    })).toEqual({
      originPath: 'nuclide://a.com/b/c/my.project.toml',
      paths: ['/b/c/d/e/f', '/x/y/z']
    });
    expect((0, (_ProjectManager2 || _load_ProjectManager2())._validateProjectSpec)({
      originPath: 'nuclide://a.com/b/c/my.project.toml'
    })).toEqual({
      originPath: 'nuclide://a.com/b/c/my.project.toml',
      paths: ['/b/c']
    });
  });
}); /**
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