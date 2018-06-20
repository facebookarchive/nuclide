'use strict';

var _fs = _interopRequireDefault(require('fs'));

var _servicesConfig;

function _load_servicesConfig() {
  return _servicesConfig = _interopRequireDefault(require('../lib/servicesConfig'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('servicesConfig()', () => {
  it('refers to files that exist', () => {
    (_servicesConfig || _load_servicesConfig()).default.forEach(service => {
      expect(_fs.default.existsSync(service.definition)).toBe(true);
      expect(_fs.default.existsSync(service.implementation)).toBe(true);
    });
  });

  it('resolves absolute paths', () => {
    (_servicesConfig || _load_servicesConfig()).default.forEach(service => {
      expect((_nuclideUri || _load_nuclideUri()).default.isAbsolute(service.definition)).toBe(true);
      expect((_nuclideUri || _load_nuclideUri()).default.isAbsolute(service.implementation)).toBe(true);
    });
  });

  it('loads the number of services expected', () => {
    const numberOfServices = (_servicesConfig || _load_servicesConfig()).default.length;
    const numberOfPublicServices = require('../services-3.json').length;
    expect(numberOfServices >= numberOfPublicServices).toBe(true);
  });
}); /**
     * Copyright (c) 2015-present, Facebook, Inc.
     * All rights reserved.
     *
     * This source code is licensed under the license found in the LICENSE file in
     * the root directory of this source tree.
     *
     * 
     * @format
     */