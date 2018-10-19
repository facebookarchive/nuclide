"use strict";

function globals() {
  const data = _interopRequireWildcard(require("globals"));

  globals = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _Config() {
  const data = require("../src/Config");

  _Config = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 * @emails oncall+nuclide
 */
describe('getConfig', () => {
  it('reads haste configs', () => {
    const root = _nuclideUri().default.join(__dirname, '../__mocks__/fixtures', 'flowconfig_haste');

    expect((0, _Config().getConfigFromFlow)(root)).toEqual({
      moduleDirs: [_nuclideUri().default.join(root, 'node_modules')],
      hasteSettings: {
        isHaste: true,
        useNameReducers: true,
        nameReducers: [{
          regexp: /^.*\/([a-zA-Z0-9$_.-]+\.js(\.flow)?)$/,
          replacement: '$1'
        }, {
          regexp: /^(.*)\.js(\.flow)?$/,
          replacement: '$1'
        }],
        nameReducerWhitelist: [new RegExp(root + '/whitelist/.*')],
        nameReducerBlacklist: [/.*\/__tests__\/.*/, /.*\/__mocks__\/.*/, new RegExp(root + '/blacklist/.*')]
      }
    });
  });
  it('reads modules', () => {
    const root = _nuclideUri().default.join(__dirname, '../__mocks__/fixtures', 'flowconfig_modules');

    expect((0, _Config().getConfigFromFlow)(root)).toEqual({
      moduleDirs: [_nuclideUri().default.join(root, 'node_modules'), _nuclideUri().default.join(root, 'modules'), _nuclideUri().default.join(root, 'yarn_workspaces'), _nuclideUri().default.join(root, 'yarn_workspaces2')],
      hasteSettings: {
        isHaste: false,
        useNameReducers: false,
        nameReducers: [],
        nameReducerWhitelist: [],
        nameReducerBlacklist: []
      }
    });
  });
});
describe('getEslintGlobals', () => {
  it('works on projects with .eslintrc', () => {
    const root = _nuclideUri().default.join(__dirname, '../__mocks__/fixtures', 'eslintrc');

    expect((0, _Config().getEslintGlobals)(root)).toEqual(['atom', 'window', 'browser', 'chrome', 'opr']);
  });
  it('works on projects with .eslintrc.js', () => {
    const root = _nuclideUri().default.join(__dirname, '../__mocks__/fixtures', 'eslintrcjs');

    expect((0, _Config().getEslintGlobals)(root)).toEqual(['atom', 'window', 'browser', 'chrome', 'opr']);
  });
  it('works on projects with an eslintConfig', () => {
    const root = _nuclideUri().default.join(__dirname, '../__mocks__/fixtures', 'eslintConfig');

    expect((0, _Config().getEslintGlobals)(root)).toEqual(['atom', 'window', 'browser', 'chrome', 'opr']);
  });
  it('falls back to getting all environments', () => {
    const root = _nuclideUri().default.join(__dirname, '../__mocks__/fixtures', 'flowconfig_modules');

    const allGlobals = new Set();
    Object.values(globals()).forEach(obj => {
      Object.keys(obj).forEach(x => allGlobals.add(x));
    });
    const eslintGlobals = (0, _Config().getEslintGlobals)(root);
    expect(eslintGlobals).toContain('window');
    expect(eslintGlobals).toContain('document');
    expect(eslintGlobals).toEqual(Array.from(allGlobals));
  });
});