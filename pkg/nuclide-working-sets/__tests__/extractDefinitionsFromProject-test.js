"use strict";

function _extractDefinitionsFromProject() {
  const data = _interopRequireDefault(require("../lib/extractDefinitionsFromProject"));

  _extractDefinitionsFromProject = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */
test('it throws out garbage', () => {
  expect((0, _extractDefinitionsFromProject().default)(null)).toEqual([]);
  const spec1 = {
    originPath: 'nuclide://fb.com/a/b/c.project.toml',
    paths: [],
    workingSets: [{
      name: 'Junk',
      paths: 'yes please'
    }]
  };
  expect((0, _extractDefinitionsFromProject().default)(spec1)).toEqual([]);
});
test('it resolves paths', () => {
  const spec = {
    originPath: 'nuclide://fb.com/a/b/c.project.toml',
    paths: [],
    workingSets: [{
      name: 'One',
      paths: ['x/one'],
      initiallyActive: true
    }, {
      name: 'Two',
      paths: ['/x/two']
    }]
  };
  expect((0, _extractDefinitionsFromProject().default)(spec)).toEqual([{
    name: 'One',
    uris: ['/a/b/x/one'],
    active: true,
    sourceType: 'project'
  }, {
    name: 'Two',
    uris: ['/x/two'],
    active: false,
    sourceType: 'project'
  }]);
});