'use strict';

var _;

function _load_() {
  return _ = require('..');
}

var _fs = _interopRequireDefault(require('fs'));

var _semver;

function _load_semver() {
  return _semver = _interopRequireDefault(require('semver'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('getVersion', () => {
  it('should be a number string', () => {
    const version = (0, (_ || _load_()).getVersion)();
    expect(typeof version).toBe('string');
    expect(/^\d+$/.test(version)).toBe(true);
  });

  it('should be semver valid', () => {
    // Since the regex in "getVersion" is not strict semver (so that it can be
    // read in python) this test enforces that it is truly semver valid.
    const version = (0, (_ || _load_()).getVersion)();
    const pkgFilename = require.resolve('../../../package.json');
    const pkgJson = JSON.parse(_fs.default.readFileSync(pkgFilename, 'utf8'));
    expect((_semver || _load_semver()).default.valid(pkgJson.version)).not.toBe(null);
    expect(String((_semver || _load_semver()).default.minor(pkgJson.version))).toBe(version);
  });
}); /**
     * Copyright (c) 2015-present, Facebook, Inc.
     * All rights reserved.
     *
     * This source code is licensed under the license found in the LICENSE file in
     * the root directory of this source tree.
     *
     *  strict
     * @format
     */