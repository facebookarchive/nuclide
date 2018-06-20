'use strict';

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _BuckService;

function _load_BuckService() {
  return _BuckService = _interopRequireWildcard(require('../lib/BuckService'));
}

var _nuclideTestHelpers;

function _load_nuclideTestHelpers() {
  return _nuclideTestHelpers = require('../../nuclide-test-helpers');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _process;

function _load_process() {
  return _process = _interopRequireWildcard(require('../../../modules/nuclide-commons/process'));
}

var _path = _interopRequireDefault(require('path'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

jest.setTimeout(50000);

// flowlint-next-line sketchy-null-string:off
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

if (!process.env.SANDCASTLE) {
  // Disable buckd so it doesn't linger around after the test.
  process.env.NO_BUCKD = '1';
} else {
  // Enable this on Sandcastle for faster tests.
  process.env.NO_BUCKD = '';
}

describe('BuckService (test-project-with-failing-targets)', () => {
  let buckRoot;

  beforeEach(async () => {
    jest.restoreAllMocks();
    if (buckRoot == null) {
      buckRoot = await (0, (_nuclideTestHelpers || _load_nuclideTestHelpers()).copyBuildFixture)('test-project-with-failing-targets', _path.default.resolve(__dirname, '../__mocks__/'));
    }
  });

  describe('.build(targets)', () => {
    it('generates report even if there are failing targets', async () => {
      // First expensive buck operation gets a large timeout.
      const targets = ['//:good_rule', '//:bad_rule'];
      const report = await (_BuckService || _load_BuckService()).build(buckRoot, targets);
      const expectedReport = {
        success: false,
        results: {
          '//:good_rule': {
            success: true,
            type: 'BUILT_LOCALLY',
            output: 'buck-out/gen/good_rule/good.txt'
          },
          '//:bad_rule': {
            success: false
          }
        },
        failures: {
          '//:bad_rule': jasmine.any(String)
        }
      };
      expect(report).toEqual(expectedReport);
      expect(report.failures.hasOwnProperty('//:bad_rule')).toBe(true);
    });

    it('respects extra options', async () => {
      try {
        await (_BuckService || _load_BuckService()).build(buckRoot, ['//:good_rule'], {
          commandOptions: { timeout: 1 }
        });
      } catch (e) {
        expect(e.name).toBe('ProcessTimeoutError');
        return;
      }
      throw new Error('promise should have been rejected');
    });

    it('respects extra arguments', async () => {
      try {
        await (_BuckService || _load_BuckService()).build(buckRoot, ['//:good_rule'], {
          extraArguments: ['--help']
        });
      } catch (e) {
        return;
      }
      throw new Error('promise should have been rejected');
    });
  });

  describe('.showOutput(aliasOrTarget)', () => {
    it('returns the output data for a genrule()', async () => {
      const output = await (_BuckService || _load_BuckService()).showOutput(buckRoot, 'good');
      expect(output.length).toBe(1);
      expect(output[0]['buck.outputPath']).toBe('buck-out/gen/good_rule/good.txt');
    });
  });

  describe('.buildRuleTypeFor(aliasesOrTargets)', () => {
    it('returns the type of a build rule specified by alias', async () => {
      const resolved = await (_BuckService || _load_BuckService()).buildRuleTypeFor(buckRoot, 'good');

      if (!(resolved != null)) {
        throw new Error('Invariant violation: "resolved != null"');
      }

      expect(resolved.type).toBe('genrule');
      expect(resolved.buildTarget.qualifiedName).toBe('//:good_rule');
      expect(resolved.buildTarget.flavors.length).toBe(0);
    });

    it('returns the type of a build rule by full path', async () => {
      const resolved = await (_BuckService || _load_BuckService()).buildRuleTypeFor(buckRoot, '//:good_rule');

      if (!(resolved != null)) {
        throw new Error('Invariant violation: "resolved != null"');
      }

      expect(resolved.type).toBe('genrule');
      expect(resolved.buildTarget.qualifiedName).toBe('//:good_rule');
      expect(resolved.buildTarget.flavors.length).toBe(0);
    });

    it('does some parsing on rule names', async () => {
      // To speed up this test, mock out the actual Buck process calls.
      jest.spyOn(_process || _load_process(), 'runCommand').mockReturnValue(_rxjsBundlesRxMinJs.Observable.of(JSON.stringify({
        '//:good_rule': {
          'buck.type': 'genrule'
        }
      })));

      // Omitting the // is fine too.
      const resolved = await (_BuckService || _load_BuckService()).buildRuleTypeFor(buckRoot, ':good_rule');

      if (!(resolved != null)) {
        throw new Error('Invariant violation: "resolved != null"');
      }

      expect(resolved.type).toBe('genrule');
      expect(resolved.buildTarget.qualifiedName).toBe('//:good_rule');
      expect(resolved.buildTarget.flavors.length).toBe(0);

      {
        // Strip out flavors.
        const resolved = await (_BuckService || _load_BuckService()).buildRuleTypeFor(buckRoot, '//:good_rule#');

        if (!(resolved != null)) {
          throw new Error('Invariant violation: "resolved != null"');
        }

        expect(resolved.type).toBe('genrule');
        expect(resolved.buildTarget.qualifiedName).toBe('//:good_rule');
        expect(resolved.buildTarget.flavors[0]).toBe('');
      }

      {
        // Strip out flavors.
        const resolved = await (_BuckService || _load_BuckService()).buildRuleTypeFor(buckRoot, '//:good_rule#foo');

        if (!(resolved != null)) {
          throw new Error('Invariant violation: "resolved != null"');
        }

        expect(resolved.type).toBe('genrule');
        expect(resolved.buildTarget.qualifiedName).toBe('//:good_rule');
        expect(resolved.buildTarget.flavors[0]).toBe('foo');
      }
    });

    it('works for multi-target rules', async () => {
      {
        const resolved = await (_BuckService || _load_BuckService()).buildRuleTypeFor(buckRoot, '//:');

        if (!(resolved != null)) {
          throw new Error('Invariant violation: "resolved != null"');
        }

        expect(resolved.type).toBe((_BuckService || _load_BuckService()).MULTIPLE_TARGET_RULE_TYPE);
        expect(resolved.buildTarget.qualifiedName).toBe('//:');
        expect(resolved.buildTarget.flavors.length).toBe(0);
      }

      {
        const resolved = await (_BuckService || _load_BuckService()).buildRuleTypeFor(buckRoot, '//...');

        if (!(resolved != null)) {
          throw new Error('Invariant violation: "resolved != null"');
        }

        expect(resolved.type).toBe((_BuckService || _load_BuckService()).MULTIPLE_TARGET_RULE_TYPE);
        expect(resolved.buildTarget.qualifiedName).toBe('//...');
        expect(resolved.buildTarget.flavors.length).toBe(0);
      }
    });

    it('fails when passed an invalid target', async () => {
      const resolved = await (_BuckService || _load_BuckService()).buildRuleTypeFor(buckRoot, '//not:athing');
      expect(resolved).toBeNull();
    });

    it('returns the type of a build rule specified by two aliases', async () => {
      const resolved = await (_BuckService || _load_BuckService()).buildRuleTypeFor(buckRoot, 'good good2');

      if (!(resolved != null)) {
        throw new Error('Invariant violation: "resolved != null"');
      }

      expect(resolved.type).toBe((_BuckService || _load_BuckService()).MULTIPLE_TARGET_RULE_TYPE);
      expect(resolved.buildTarget.qualifiedName).toBe('good good2');
      expect(resolved.buildTarget.flavors.length).toBe(0);
    });
  });
});

describe('BuckService (buck-query-project)', () => {
  let buckRoot;

  beforeEach(async () => {
    if (buckRoot == null) {
      buckRoot = await (0, (_nuclideTestHelpers || _load_nuclideTestHelpers()).copyBuildFixture)('buck-query-project', _path.default.resolve(__dirname, '../__mocks__/'));
    }
  });

  describe('getOwner()', () => {
    it('gets the owner', async () => {
      // First expensive buck operation gets a large timeout.
      let owners = await (_BuckService || _load_BuckService()).getOwners(buckRoot, 'examples/one.java', []);
      expect(owners.sort()).toEqual(['//examples:one', '//examples:two-tests']);

      owners = await (_BuckService || _load_BuckService()).getOwners(buckRoot, 'examples/one.java', [], '.*_library');
      expect(owners).toEqual(['//examples:one']);
    });
  });

  describe('getBuildFile()', () => {
    it('gets the build file', async () => {
      const file = await (_BuckService || _load_BuckService()).getBuildFile(buckRoot, '//examples:one');
      expect(file).toBe((_nuclideUri || _load_nuclideUri()).default.join(buckRoot, 'examples', 'BUCK'));
    });
  });
});

describe('BuckService (buckconfig-project)', () => {
  let buckRoot;

  beforeEach(async () => {
    if (buckRoot == null) {
      buckRoot = await (0, (_nuclideTestHelpers || _load_nuclideTestHelpers()).copyBuildFixture)('buckconfig-project', _path.default.resolve(__dirname, '../__mocks__/'));
    }
  });

  describe('getBuckConfig()', () => {
    it('returns the correct value if present', async () => {
      // First expensive buck operation gets a large timeout.
      const value = await (_BuckService || _load_BuckService()).getBuckConfig(buckRoot, 'cache', 'dir');
      expect(value).toBe('buck-cache');
    });

    it('returns null if property is not set', async () => {
      const value = await (_BuckService || _load_BuckService()).getBuckConfig(buckRoot, 'cache', 'http_timeout');
      expect(value).toBe(null);
    });

    it('returns null if section is not present', async () => {
      const value = await (_BuckService || _load_BuckService()).getBuckConfig(buckRoot, 'android', 'target');
      expect(value).toBe(null);
    });
  });
});