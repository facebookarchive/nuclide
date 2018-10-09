"use strict";

var _fs = _interopRequireDefault(require("fs"));

function _servicesConfig() {
  const data = _interopRequireDefault(require("../lib/servicesConfig"));

  _servicesConfig = function () {
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
 * @emails oncall+nuclide
 */
describe('servicesConfig()', () => {
  it('refers to files that exist', () => {
    _servicesConfig().default.forEach(service => {
      expect(_fs.default.existsSync(service.definition)).toBe(true);
      expect(_fs.default.existsSync(service.implementation)).toBe(true);
    });
  });
  it('resolves absolute paths', () => {
    _servicesConfig().default.forEach(service => {
      expect(_nuclideUri().default.isAbsolute(service.definition)).toBe(true);
      expect(_nuclideUri().default.isAbsolute(service.implementation)).toBe(true);
    });
  });
  it('loads the number of services expected', () => {
    const numberOfServices = _servicesConfig().default.length;

    const numberOfPublicServices = require("../services-3.json").length;

    expect(numberOfServices >= numberOfPublicServices).toBe(true);
  });
});