'use strict';

var _compareVersions;

function _load_compareVersions() {
  return _compareVersions = _interopRequireDefault(require('../compareVersions'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('compareVersions', () => {
  it('compares two versions', () => {
    expect((0, (_compareVersions || _load_compareVersions()).default)('9.2', '10.0')).toBe(-1);
  });

  it('compares versions with an unequal number of parts', () => {
    expect((0, (_compareVersions || _load_compareVersions()).default)('9', '8.9')).toBe(1);
    expect((0, (_compareVersions || _load_compareVersions()).default)('9', '9.1')).toBe(-1);
    expect((0, (_compareVersions || _load_compareVersions()).default)('9', '9.0')).toBe(0);
  });

  it('compares numbers using version numbers and not decimal values', () => {
    expect((0, (_compareVersions || _load_compareVersions()).default)('9.2', '9.10')).toBe(-1);
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