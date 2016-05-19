'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const BuckProject = require('../lib/BuckProject').BuckProject;
import fs from 'fs-plus';
import path from 'path';
const temp = require('temp').track();

function copyProject(projectInFixturesDirectory: string) {
  const tempDir = temp.mkdirSync('BuckProject-spec');
  fs.copySync(path.join(__dirname, 'fixtures', projectInFixturesDirectory),
      tempDir);
  return tempDir;
}

/**
 * Use an extremely generous timeout when running a method of BuckProject that
 * runs Buck because we have seen tests time out in CI with a timeout of 20s.
 */
const TIMEOUT = 40 * 1000;

describe('BuckProject', () => {
  describe('.build(targets)', () => {
    it('generates report even if there are failing targets', () => {
      const projectDir = copyProject('test-project-with-failing-targets');
      const buckProject = new BuckProject({rootPath: projectDir});

      // Use a generous timeout for doing a Buck build in CI.
      waitsForPromise({timeout: TIMEOUT}, async () => {
        const targets = ['//:good_rule', '//:bad_rule'];
        const report = await buckProject.build(targets);
        const expectedReport = {
          success: false,
          results: {
            '//:good_rule': {
              success: true,
              type: 'BUILT_LOCALLY',
              output: 'buck-out/gen/good.txt',
            },
            '//:bad_rule': {
              success: false,
            },
          },
        };
        expect(report).toEqual(expectedReport);
      });
    });

    it('respects extra options', () => {
      const projectDir = copyProject('test-project-with-failing-targets');
      const buckProject = new BuckProject({rootPath: projectDir});

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
      const projectDir = copyProject('test-project-with-failing-targets');
      const buckProject = new BuckProject({rootPath: projectDir});

      waitsForPromise({timeout: TIMEOUT}, async () => {
        const target = await buckProject.resolveAlias('good');
        expect(target).toBe('//:good_rule');
      });
    });
  });

  describe('.outputFileFor(aliasOrTarget)', () => {
    it('returns the output file for a genrule()', () => {
      const projectDir = copyProject('test-project-with-failing-targets');
      const buckProject = new BuckProject({rootPath: projectDir});

      waitsForPromise({timeout: TIMEOUT}, async () => {
        const outputFile = await buckProject.outputFileFor('good');
        expect(outputFile).toBe(path.join(projectDir, 'buck-out/gen/good.txt'));
      });
    });
  });

  describe('.buildRuleTypeFor(aliasOrTarget)', () => {
    it('returns the type of a build rule specified by alias', () => {
      const projectDir = copyProject('test-project-with-failing-targets');
      const buckProject = new BuckProject({rootPath: projectDir});

      waitsForPromise({timeout: TIMEOUT}, async () => {
        const type = await buckProject.buildRuleTypeFor('good');
        expect(type).toBe('genrule');
      });
    });

    it('returns the type of a build rule by full path', () => {
      const projectDir = copyProject('test-project-with-failing-targets');
      const buckProject = new BuckProject({rootPath: projectDir});

      waitsForPromise({timeout: TIMEOUT}, async () => {
        let type = await buckProject.buildRuleTypeFor('//:good_rule');
        expect(type).toBe('genrule');

        // Omitting the // is fine too.
        type = await buckProject.buildRuleTypeFor(':good_rule');
        expect(type).toBe('genrule');

        // Strip out flavors.
        type = await buckProject.buildRuleTypeFor('//:good_rule#');
        expect(type).toBe('genrule');

        // If all rules are specified, just pick one.
        type = await buckProject.buildRuleTypeFor('//:');
        expect(type).toBe('genrule');
      });
    });

    it('fails when passed an invalid target', () => {
      const projectDir = copyProject('test-project-with-failing-targets');
      const buckProject = new BuckProject({rootPath: projectDir});

      waitsForPromise(
        {timeout: TIMEOUT, shouldReject: true},
        async () => buckProject.buildRuleTypeFor('//not:athing')
      );
    });
  });

  describe('query()', () => {
    it('works with deps() predicate in the query', () => {
      const projectDir = copyProject('buck-query-project');
      const buckProject = new BuckProject({rootPath: projectDir});

      waitsForPromise({timeout: TIMEOUT}, async () => {
        const deps = await buckProject.query('deps(//examples:one)');
        expect(deps.sort()).toEqual([
          '//examples:five',
          '//examples:four',
          '//examples:one',
          '//examples:three',
          '//examples:two',
        ]);
      });
    });

    it('works with deps() predicate with limit in the query', () => {
      const projectDir = copyProject('buck-query-project');
      const buckProject = new BuckProject({rootPath: projectDir});

      waitsForPromise({timeout: TIMEOUT}, async () => {
        const deps = await buckProject.query('deps(//examples:one, 1)');
        expect(deps.sort()).toEqual([
          '//examples:one',
          '//examples:three',
          '//examples:two',
        ]);
      });
    });
  });

  describe('queryWithArgs()', () => {
    it('works with deps() predicate in the query', () => {
      const projectDir = copyProject('buck-query-project');
      const buckProject = new BuckProject({rootPath: projectDir});

      waitsForPromise({timeout: TIMEOUT}, async () => {
        const deps = await buckProject.queryWithArgs(
          "deps('%s') except '%s'",
          ['//examples:one', '//examples:five']);
        expect(Array.isArray(deps['//examples:one'])).toBe(true);
        deps['//examples:one'].sort();
        expect(deps).toEqual(
          {
            '//examples:one': [
              '//examples:five',
              '//examples:four',
              '//examples:three',
              '//examples:two',
            ],
            '//examples:five': [],
          }
        );
      });
    });

    it('works with deps() predicate with limit in the query', () => {
      const projectDir = copyProject('buck-query-project');
      const buckProject = new BuckProject({rootPath: projectDir});

      waitsForPromise({timeout: TIMEOUT}, async () => {
        const deps = await buckProject.queryWithArgs(
          "deps('%s', 1) except '%s'",
          ['//examples:one', '//examples:five']);
        expect(Array.isArray(deps['//examples:one'])).toBe(true);
        deps['//examples:one'].sort();
        expect(deps).toEqual(
          {
            '//examples:one': [
              '//examples:three',
              '//examples:two',
            ],
            '//examples:five': [],
          }
        );
      });
    });
  });

  describe('getBuckConfig()', () => {
    it('returns the correct value if present', () => {
      const projectDir = copyProject('buckconfig-project');
      const buckProject = new BuckProject({rootPath: projectDir});

      waitsForPromise({timeout: TIMEOUT}, async () => {
        const value = await buckProject.getBuckConfig('cache', 'dir');
        expect(value).toBe('buck-cache');
      });
    });

    it('returns null if property is not set', () => {
      const projectDir = copyProject('buckconfig-project');
      const buckProject = new BuckProject({rootPath: projectDir});

      waitsForPromise({timeout: TIMEOUT}, async () => {
        const value = await buckProject.getBuckConfig('cache', 'http_timeout');
        expect(value).toBe(null);
      });
    });

    it('returns null if section is not present', () => {
      const projectDir = copyProject('buckconfig-project');
      const buckProject = new BuckProject({rootPath: projectDir});

      waitsForPromise({timeout: TIMEOUT}, async () => {
        const value = await buckProject.getBuckConfig('android', 'target');
        expect(value).toBe(null);
      });
    });

  });

  describe('getBuildFile()', () => {
    it('gets the build file', () => {
      waitsForPromise({timeout: TIMEOUT}, async () => {
        const projectDir = copyProject('buck-query-project');
        const buckProject = new BuckProject({rootPath: projectDir});

        let file = await buckProject.getBuildFile('//examples:one');
        expect(file).toBe(path.join(projectDir, 'examples', 'BUCK'));

        file = await buckProject.getBuildFile('//nonexistent:');
        expect(file).toBe(null);
      });
    });
  });
});
