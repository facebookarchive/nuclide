'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var BuckProject = require('../lib/LocalBuckProject');
var fs = require('fs-plus');
var path = require('path');
var temp = require('temp').track();

function copyProject(projectInFixturesDirectory: string) {
  var tempDir = temp.mkdirSync('BuckProject-spec');
  fs.copySync(path.join(__dirname, 'fixtures', projectInFixturesDirectory),
      tempDir);
  return tempDir;
}

/**
 * Use an extremely generous timeout when running a method of BuckProject that
 * runs Buck because we have seen tests time out in CI with a timeout of 20s.
 */
var TIMEOUT = 40 * 1000;

describe('BuckProject', () => {
  describe('.build(targets)', () => {
    it('generates report even if there are failing targets', () => {
      var projectDir = copyProject('test-project-with-failing-targets');
      var buckProject = new BuckProject({rootPath: projectDir});

      // Use a generous timeout for doing a Buck build in CI.
      waitsForPromise({timeout: TIMEOUT}, async () => {
        var targets = ['//:good_rule', '//:bad_rule'];
        var report = await buckProject.build(targets);
        var expectedReport = {
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
          }
        };
        expect(report).toEqual(expectedReport);
      });
    });
  });

  describe('.resolveAlias(aliasOrTarget)', () => {
    it('resolves an alias', () => {
      var projectDir = copyProject('test-project-with-failing-targets');
      var buckProject = new BuckProject({rootPath: projectDir});

      waitsForPromise({timeout: TIMEOUT}, async () => {
        var target = await buckProject.resolveAlias('good');
        expect(target).toBe('//:good_rule');
      });
    });
  });

  describe('.outputFileFor(aliasOrTarget)', () => {
    it('returns the output file for a genrule()', () => {
      var projectDir = copyProject('test-project-with-failing-targets');
      var buckProject = new BuckProject({rootPath: projectDir});

      waitsForPromise({timeout: TIMEOUT}, async () => {
        var outputFile = await buckProject.outputFileFor('good');
        expect(outputFile).toBe(path.join(projectDir, 'buck-out/gen/good.txt'));
      });
    });
  });

  describe('.buildRuleTypeFor(aliasOrTarget)', () => {
    it('returns the type of a build rule specified by alias', () => {
      var projectDir = copyProject('test-project-with-failing-targets');
      var buckProject = new BuckProject({rootPath: projectDir});

      waitsForPromise({timeout: TIMEOUT}, async () => {
        var type = await buckProject.buildRuleTypeFor('good');
        expect(type).toBe('genrule');
      });
    });


    it('fails when passed an invalid target', () => {
      var projectDir = copyProject('test-project-with-failing-targets');
      var buckProject = new BuckProject({rootPath: projectDir});

      waitsForPromise(
        {timeout: TIMEOUT, shouldReject: true},
        async () => buckProject.buildRuleTypeFor('//not:athing')
      );
    });
  });
});
