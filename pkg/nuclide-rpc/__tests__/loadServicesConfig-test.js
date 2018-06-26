'use strict';

var _loadServicesConfig;

function _load_loadServicesConfig() {
  return _loadServicesConfig = _interopRequireDefault(require('../lib/loadServicesConfig'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _testHelpers;

function _load_testHelpers() {
  return _testHelpers = require('../../../modules/nuclide-commons/test-helpers');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */

describe('loadServicesConfig()', () => {
  let configPath;

  beforeEach(async () => {
    await (async () => {
      const services3json = [{
        implementation: './FooService.js',
        name: 'FooService'
      }, {
        definition: './BarServiceDefinition.js',
        implementation: './BarServiceImplementation.js',
        name: 'BarService'
      }];
      const fbservices3json = [{
        implementation: './BazService.js',
        name: 'BazService',
        preserveFunctionNames: true
      }];
      configPath = await (0, (_testHelpers || _load_testHelpers()).generateFixture)('services', new Map([['services-3.json', JSON.stringify(services3json)], ['fb-services-3.json', JSON.stringify(fbservices3json)]]));
    })();
  });

  it('resolves absolute paths', () => {
    // flowlint-next-line sketchy-null-string:off
    if (!configPath) {
      throw new Error('Invariant violation: "configPath"');
    }

    const servicesConfig = (0, (_loadServicesConfig || _load_loadServicesConfig()).default)(configPath);
    servicesConfig.forEach(service => {
      expect((_nuclideUri || _load_nuclideUri()).default.isAbsolute(service.definition)).toBe(true);
      expect((_nuclideUri || _load_nuclideUri()).default.isAbsolute(service.implementation)).toBe(true);
    });
  });

  it('uses the implementation when the definition is missing', () => {
    // flowlint-next-line sketchy-null-string:off
    if (!configPath) {
      throw new Error('Invariant violation: "configPath"');
    }

    const servicesConfig = (0, (_loadServicesConfig || _load_loadServicesConfig()).default)(configPath);
    const fooService = servicesConfig.find(service => service.name === 'FooService');

    if (!(fooService != null)) {
      throw new Error('Invariant violation: "fooService != null"');
    }

    expect(fooService.definition).toBe(fooService.implementation);
  });

  it('respects preserveFunctionNames', () => {
    // flowlint-next-line sketchy-null-string:off
    if (!configPath) {
      throw new Error('Invariant violation: "configPath"');
    }

    const servicesConfig = (0, (_loadServicesConfig || _load_loadServicesConfig()).default)(configPath);

    const fooService = servicesConfig.find(service => service.name === 'FooService');

    if (!(fooService != null)) {
      throw new Error('Invariant violation: "fooService != null"');
    }

    expect(fooService.preserveFunctionNames).toBe(false);

    const barService = servicesConfig.find(service => service.name === 'BarService');

    if (!(barService != null)) {
      throw new Error('Invariant violation: "barService != null"');
    }

    expect(barService.preserveFunctionNames).toBe(false);

    const BazService = servicesConfig.find(service => service.name === 'BazService');

    if (!(BazService != null)) {
      throw new Error('Invariant violation: "BazService != null"');
    }

    expect(BazService.preserveFunctionNames).toBe(true);
  });
});