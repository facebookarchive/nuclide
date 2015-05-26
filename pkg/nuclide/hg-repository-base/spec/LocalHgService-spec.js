'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var path = require('path');
var LocalHgServiceBase = require('../lib/LocalHgServiceBase');
var {HgStatusOption, StatusCodeId} = require('../lib/hg-constants');

class TestHgService extends LocalHgServiceBase {
  // These tests target the non-watchman-dependent features of LocalHgService.
}

describe('LocalHgService', () => {
  var hgService;
  var TEST_WORKING_DIRECTORY = '/Test/Working/Directory/';
  var PATH_1 = path.join(TEST_WORKING_DIRECTORY, 'test1.js');
  var PATH_2 = path.join(TEST_WORKING_DIRECTORY, 'test2.js');
  function relativize(filePath: string): string {
    return path.relative(TEST_WORKING_DIRECTORY, filePath);
  }

  beforeEach(() => {
    hgService = new TestHgService({workingDirectory: TEST_WORKING_DIRECTORY});
  });

  describe('::_fetchStatuses', () => {
    var testPaths = [PATH_1, PATH_2];
    // We relativize the paths to mimic hg's behavior.
    var testHgStatusOutput = {
      stdout: JSON.stringify([
        {
          'path': relativize(PATH_1),
          'status': StatusCodeId.MODIFIED
        },
        {
          'path': relativize(PATH_2),
          'status': StatusCodeId.ADDED
        }
      ]),
    };

    it('parses the "hg status" output and returns a Map of the results.', () => {
      spyOn(hgService, '_hgAsyncExecute').andCallFake((args, execOptions) => {
        return Promise.resolve(testHgStatusOutput);
      });
      waitsForPromise(async () => {
        var statusMap = await hgService.fetchStatuses(testPaths);
        expect(statusMap[PATH_1]).toBe(StatusCodeId.MODIFIED);
        expect(statusMap[PATH_2]).toBe(StatusCodeId.ADDED);
      });
    });
    describe('when called with a hgStatusOption', () => {
      it('fetches only non-ignored status if no option is passed.', () => {
        spyOn(hgService, '_hgAsyncExecute').andCallFake((args, execOptions) => {
          expect(args).toEqual(['status', '-Tjson'].concat(testPaths));
          return Promise.resolve(testHgStatusOutput);
        });
        waitsForPromise(async () => {
          await hgService.fetchStatuses(testPaths);
        });
      });

      it('fetches only non-ignored status if the "ONLY_NON_IGNORED" option is passed.', () => {
        spyOn(hgService, '_hgAsyncExecute').andCallFake((args, execOptions) => {
          expect(args).toEqual(['status', '-Tjson'].concat(testPaths));
          return Promise.resolve(testHgStatusOutput);
        });
        waitsForPromise(async () => {
          await hgService.fetchStatuses(testPaths, {hgStatusOption: HgStatusOption.ONLY_NON_IGNORED});
        });
      });

      it('fetches only ignored status if the "ONLY_IGNORED" option is passed.', () => {
        spyOn(hgService, '_hgAsyncExecute').andCallFake((args, execOptions) => {
          expect(args).toEqual(['status', '-Tjson', '--ignored'].concat(testPaths));
          return Promise.resolve(testHgStatusOutput);
        });
        waitsForPromise(async () => {
          await hgService.fetchStatuses(testPaths, {hgStatusOption: HgStatusOption.ONLY_IGNORED});
        });
      });

      it('fetches all status if the "ALL_STATUSES" option is passed.', () => {
        spyOn(hgService, '_hgAsyncExecute').andCallFake((args, execOptions) => {
          expect(args).toEqual(['status', '-Tjson', '--all'].concat(testPaths));
          return Promise.resolve(testHgStatusOutput);
        });
        waitsForPromise(async () => {
          await hgService.fetchStatuses(testPaths, {hgStatusOption: HgStatusOption.ALL_STATUSES});
        });
      });
    });
  });

  describe('::_fetchDiffInfo', () => {
    var mockHgDiffOutput = '@@ -150,11 +150,2 @@';
    var expectedDiffInfo = {
      added: 2,
      deleted: 11,
      lineDiffs: [{
        oldStart: 150,
        oldLines: 11,
        newStart: 150,
        newLines: 2,
      }],
    };

    it('fetches the unified diff output for the given path.', () => {
      // Test set up: mock out dependency on hg.
      spyOn(hgService, '_hgAsyncExecute').andCallFake((args, options) => {
        expect(args.pop()).toBe(PATH_1);
        return Promise.resolve({stdout: mockHgDiffOutput});
      });

      waitsForPromise(async () => {
        var diffInfo = await hgService.fetchDiffInfo(PATH_1);
        expect(diffInfo).toEqual(expectedDiffInfo);
      });
    });
  });

  describe('::destroy', () => {
    it('should do cleanup without throwing an exception.', () => {
      hgService.destroy();
    });
  });

});
