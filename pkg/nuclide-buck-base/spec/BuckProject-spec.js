'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {BuckProject} from '../lib/BuckProject';
import fs from 'fs-plus';
import path from 'path';
import temp from 'temp';

temp.track();

function copyProject(projectInFixturesDirectory: string) {
  const tempDir = temp.mkdirSync('BuckProject-spec');
  fs.copySync(path.join(__dirname, 'fixtures', projectInFixturesDirectory),
      tempDir);
  return tempDir;
}

// Disable buckd so it doesn't linger around after the test.
process.env.NO_BUCKD = '1';

beforeEach(() => {
  // This timeout covers the average case. Blocks that need more time specify it
  // themselves.
  jasmine.getEnv().defaultTimeoutInterval = 10000;
});

describe('BuckProject (test-project-with-failing-targets)', () => {
  const projectDir = copyProject('test-project-with-failing-targets');
  const buckProject = new BuckProject({rootPath: projectDir});

  describe('.build(targets)', () => {
    it('generates report even if there are failing targets', () => {
      // First expensive buck operation gets a large timeout.
      waitsForPromise({timeout: 15000}, async () => {
        const targets = ['//:good_rule', '//:bad_rule'];
        const report = await buckProject.build(targets);
        const expectedReport = {
          success: false,
          results: {
            '//:good_rule': {
              success: true,
              type: 'BUILT_LOCALLY',
              output: 'buck-out/gen/good_rule/good.txt',
            },
            '//:bad_rule': {
              success: false,
            },
          },
          failures: {
            '//:bad_rule': jasmine.any(String),
          },
        };
        expect(report).toEqual(expectedReport);
        // Sometimes this ends in "\nstderr: " - No idea why.
        expect(report.failures['//:bad_rule'])
          .toMatch(/^\/\/:bad_rule failed with exit code 1:\ngenrule/);
      });
    });

    it('respects extra options', () => {
      // Should immediately timeout.
      jasmine.useRealClock();
      waitsForPromise(async () => {
        try {
          await buckProject.build(['//:good_rule'], {commandOptions: {timeout: 0}});
        } catch (e) {
          expect(e.message).toMatch('timeout');
          return;
        }
        throw new Error('promise should have been rejected');
      });
    });
  });

  describe('.resolveAlias(aliasOrTarget)', () => {
    it('resolves an alias', () => {
      waitsForPromise(async () => {
        const target = await buckProject.resolveAlias('good');
        expect(target).toBe('//:good_rule');
      });
    });
  });

  describe('.outputFileFor(aliasOrTarget)', () => {
    it('returns the output file for a genrule()', () => {
      waitsForPromise(async () => {
        const outputFile = await buckProject.outputFileFor('good');
        expect(outputFile).toBe(path.join(projectDir, 'buck-out/gen/good_rule/good.txt'));
      });
    });
  });

  describe('.buildRuleTypeFor(aliasOrTarget)', () => {
    it('returns the type of a build rule specified by alias', () => {
      waitsForPromise(async () => {
        const type = await buckProject.buildRuleTypeFor('good');
        expect(type).toBe('genrule');
      });
    });

    it('returns the type of a build rule by full path', () => {
      waitsForPromise(async () => {
        const type = await buckProject.buildRuleTypeFor('//:good_rule');
        expect(type).toBe('genrule');
      });

      waitsForPromise(async () => {
        // Omitting the // is fine too.
        const type = await buckProject.buildRuleTypeFor(':good_rule');
        expect(type).toBe('genrule');
      });

      waitsForPromise(async () => {
        // Strip out flavors.
        const type = await buckProject.buildRuleTypeFor('//:good_rule#');
        expect(type).toBe('genrule');
      });

      waitsForPromise(async () => {
        // If all rules are specified, just pick one.
        const type = await buckProject.buildRuleTypeFor('//:');
        expect(type).toBe('genrule');
      });
    });

    it('fails when passed an invalid target', () => {
      waitsForPromise({shouldReject: true}, async () => {
        await buckProject.buildRuleTypeFor('//not:athing');
      });
    });
  });
});

describe('BuckProject (buck-query-project)', () => {
  const projectDir = copyProject('buck-query-project');
  const buckProject = new BuckProject({rootPath: projectDir});

  describe('getBuildFile()', () => {
    it('gets the build file', () => {
      // First expensive buck operation gets a large timeout.
      waitsForPromise({timeout: 15000}, async () => {
        const file = await buckProject.getBuildFile('//examples:one');
        expect(file).toBe(path.join(projectDir, 'examples', 'BUCK'));
      });
    });

    it('errors with non-existent rule', () => {
      waitsForPromise(async () => {
        spyOn(console, 'log');
        const file = await buckProject.getBuildFile('//nonexistent:');
        expect(file).toBe(null);
        // eslint-disable-next-line no-console
        expect(console.log.argsForCall[0]).toMatch(/No build file for target "\/\/nonexistent:"/);
      });
    });
  });
});

describe('BuckProject (buckconfig-project)', () => {
  const projectDir = copyProject('buckconfig-project');
  const buckProject = new BuckProject({rootPath: projectDir});

  describe('getBuckConfig()', () => {
    it('returns the correct value if present', () => {
      // First expensive buck operation gets a large timeout.
      waitsForPromise({timeout: 15000}, async () => {
        const value = await buckProject.getBuckConfig('cache', 'dir');
        expect(value).toBe('buck-cache');
      });
    });

    it('returns null if property is not set', () => {
      waitsForPromise(async () => {
        const value = await buckProject.getBuckConfig('cache', 'http_timeout');
        expect(value).toBe(null);
      });
    });

    it('returns null if section is not present', () => {
      waitsForPromise(async () => {
        const value = await buckProject.getBuckConfig('android', 'target');
        expect(value).toBe(null);
      });
    });
  });
});
