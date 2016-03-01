'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import path from 'path';
import {HgService} from '../lib/HgService';
import {HgStatusOption, StatusCodeId} from '../lib/hg-constants';
import invariant from 'assert';
import {fsPromise} from '../../../nuclide/commons';

class TestHgService extends HgService {
  // These tests target the non-watchman-dependent features of LocalHgService.
  _subscribeToWatchman(): Promise<void> {
    return Promise.resolve();
  }
}

describe('HgService', () => {
  let hgService;
  const TEST_WORKING_DIRECTORY = '/Test/Working/Directory/';
  const PATH_1 = path.join(TEST_WORKING_DIRECTORY, 'test1.js');
  const PATH_2 = path.join(TEST_WORKING_DIRECTORY, 'test2.js');
  function relativize(filePath: string): string {
    return path.relative(TEST_WORKING_DIRECTORY, filePath);
  }

  beforeEach(() => {
    hgService = new TestHgService(TEST_WORKING_DIRECTORY);
  });

  describe('::_fetchStatuses', () => {
    const testPaths = [PATH_1, PATH_2];
    // We relativize the paths to mimic hg's behavior.
    const testHgStatusOutput = {
      stdout: JSON.stringify([
        {
          'path': relativize(PATH_1),
          'status': StatusCodeId.MODIFIED,
        },
        {
          'path': relativize(PATH_2),
          'status': StatusCodeId.ADDED,
        },
      ]),
    };

    it('parses the "hg status" output and returns a Map of the results.', () => {
      invariant(hgService);
      spyOn(hgService, '_hgAsyncExecute').andCallFake((args, execOptions) => {
        return Promise.resolve(testHgStatusOutput);
      });
      waitsForPromise(async () => {
        invariant(hgService);
        const statusMap = await hgService.fetchStatuses(testPaths);
        expect(statusMap.get(PATH_1)).toBe(StatusCodeId.MODIFIED);
        expect(statusMap.get(PATH_2)).toBe(StatusCodeId.ADDED);
      });
    });

    describe('when called with a hgStatusOption', () => {
      it('fetches only non-ignored status if no option is passed.', () => {
        invariant(hgService);
        spyOn(hgService, '_hgAsyncExecute').andCallFake((args, execOptions) => {
          expect(args).toEqual(['status', '-Tjson'].concat(testPaths));
          return Promise.resolve(testHgStatusOutput);
        });
        waitsForPromise(async () => {
          invariant(hgService);
          await hgService.fetchStatuses(testPaths);
        });
      });

      it('fetches only non-ignored status if the "ONLY_NON_IGNORED" option is passed.', () => {
        invariant(hgService);
        spyOn(hgService, '_hgAsyncExecute').andCallFake((args, execOptions) => {
          expect(args).toEqual(['status', '-Tjson'].concat(testPaths));
          return Promise.resolve(testHgStatusOutput);
        });
        waitsForPromise(async () => {
          invariant(hgService);
          await hgService.fetchStatuses(
              testPaths, {hgStatusOption: HgStatusOption.ONLY_NON_IGNORED});
        });
      });

      it('fetches only ignored status if the "ONLY_IGNORED" option is passed.', () => {
        invariant(hgService);
        spyOn(hgService, '_hgAsyncExecute').andCallFake((args, execOptions) => {
          expect(args).toEqual(['status', '-Tjson', '--ignored'].concat(testPaths));
          return Promise.resolve(testHgStatusOutput);
        });
        waitsForPromise(async () => {
          invariant(hgService);
          await hgService.fetchStatuses(testPaths, {hgStatusOption: HgStatusOption.ONLY_IGNORED});
        });
      });

      it('fetches all status if the "ALL_STATUSES" option is passed.', () => {
        invariant(hgService);
        spyOn(hgService, '_hgAsyncExecute').andCallFake((args, execOptions) => {
          expect(args).toEqual(['status', '-Tjson', '--all'].concat(testPaths));
          return Promise.resolve(testHgStatusOutput);
        });
        waitsForPromise(async () => {
          invariant(hgService);
          await hgService.fetchStatuses(testPaths, {hgStatusOption: HgStatusOption.ALL_STATUSES});
        });
      });
    });
  });

  describe('::fetchDiffInfo', () => {
    const mockHgDiffOutput =
    `diff --git test-test/blah/blah.js test-test/blah/blah.js
    --- test1.js
    +++ test1.js
    @@ -150,1 +150,2 @@
    -hi
    +
    +asdfdf`;

    const expectedDiffInfo = {
      added: 2,
      deleted: 1,
      lineDiffs: [{
        oldStart: 150,
        oldLines: 1,
        newStart: 150,
        newLines: 2,
      }],
    };

    it('fetches the unified diff output for the given path.', () => {
      // Test set up: mock out dependency on hg.
      invariant(hgService);
      spyOn(hgService, '_hgAsyncExecute').andCallFake((args, options) => {
        expect(args.pop()).toBe(PATH_1);
        return Promise.resolve({stdout: mockHgDiffOutput});
      });

      waitsForPromise(async () => {
        invariant(hgService);
        const pathToDiffInfo = await hgService.fetchDiffInfo([PATH_1]);
        invariant(pathToDiffInfo);
        expect(pathToDiffInfo.size).toBe(1);
        expect(pathToDiffInfo.get(PATH_1)).toEqual(expectedDiffInfo);
      });
    });
  });

  describe('::getConfigValueAsync', () => {
    it('calls `hg config` with the passed key', () => {
      spyOn(hgService, '_hgAsyncExecute').andCallFake((args, options) => {
        expect(args).toEqual(['config', 'committemplate.emptymsg']);
        // Return the Object shape expected by `HgServiceBase`.
        return {stdout: ''};
      });
      waitsForPromise(async () => {
        await hgService.getConfigValueAsync('committemplate.emptymsg');
      });
    });
  });

  describe('::rename', () => {
    it('can rename files', () => {
      let wasCalled = false;
      spyOn(hgService, '_hgAsyncExecute').andCallFake((args, options) => {
        expect(args.length).toBe(3);
        expect(args.pop()).toBe('file_2.txt');
        expect(args.pop()).toBe('file_1.txt');
        expect(args.pop()).toBe('rename');
        wasCalled = true;
      });
      waitsForPromise(async () => {
        await hgService.rename('file_1.txt', 'file_2.txt');
        expect(wasCalled).toBeTruthy();
      });
    });
  });

  describe('::remove', () => {
    it('can remove files', () => {
      let wasCalled = false;
      spyOn(hgService, '_hgAsyncExecute').andCallFake((args, options) => {
        expect(args.length).toBe(3);
        expect(args.pop()).toBe('file.txt');
        expect(args.pop()).toBe('-f');
        expect(args.pop()).toBe('remove');
        wasCalled = true;
      });
      waitsForPromise(async () => {
        await hgService.remove('file.txt');
        expect(wasCalled).toBeTruthy();
      });
    });
  });

  describe('::add', () => {
    it('can add files', () => {
      let wasCalled = false;
      spyOn(hgService, '_hgAsyncExecute').andCallFake((args, options) => {
        expect(args.length).toBe(2);
        expect(args.pop()).toBe('file.txt');
        expect(args.pop()).toBe('add');
        wasCalled = true;
      });
      waitsForPromise(async () => {
        await hgService.add('file.txt');
        expect(wasCalled).toBeTruthy();
      });
    });
  });

  describe('::commit|amend', () => {
    const messageFile = 'fakePathForTesting';
    const commitMessage = 'foo\n\nbar\nbaz';
    let tempFileCreated = false;
    let tempFileRemoved = false;
    let committedToHg = false;
    let expectedArgs = null;
    beforeEach(() => {
      expectedArgs = null;
      tempFileCreated = false;
      tempFileRemoved = false;
      let tempFileWritten = false;
      spyOn(fsPromise, 'tempfile').andCallFake(async () => {
        tempFileCreated = true;
        return messageFile;
      });
      spyOn(fsPromise, 'unlink').andCallFake(async () => tempFileRemoved = true);
      spyOn(fsPromise, 'writeFile').andCallFake((filePath, contents) => {
        expect(contents).toBe(commitMessage);
        tempFileWritten = true;
      });
      committedToHg = false;
      spyOn(hgService, '_hgAsyncExecute').andCallFake((args, options) => {
        expect(expectedArgs).not.toBeNull();
        invariant(expectedArgs !== null);
        expect(args.length).toBe(
          expectedArgs.length,
          `\nExpected args: [${expectedArgs.toString()}]\nActual args: [${args.toString()}]`,
        );
        expect(messageFile).not.toBeNull();
        while (args.length > 0) {
          const expectedArg = expectedArgs.pop();
          if (expectedArg === messageFile) {
            expect(tempFileWritten).toBeTruthy();
          }
          expect(args.pop()).toBe(expectedArg);
        }
        committedToHg = true;
      });
    });

    describe('::commit', () => {
      it('can commit changes', () => {
        expectedArgs = ['commit', '-l', messageFile];
        waitsForPromise(async () => {
          await hgService.commit(commitMessage);
          expect(committedToHg).toBeTruthy('Looks like commit did not happen');
          expect(tempFileCreated).toBeTruthy('No temporary file created');
          expect(tempFileRemoved).toBeTruthy('Temporary file was not removed');
        });
      });
    });

    describe('::amend', () => {
      it('can amend changes with a message', () => {
        expectedArgs = ['commit', '-l', messageFile, '--amend'];
        waitsForPromise(async () => {
          await hgService.amend(commitMessage);
          expect(committedToHg).toBeTruthy('Looks like commit did not happen');
          expect(tempFileCreated).toBeTruthy('No temporary file created');
          expect(tempFileRemoved).toBeTruthy('Temporary file was not removed');
        });
      });

      it('can amend changes without a message', () => {
        expectedArgs = ['commit', '--amend', '--reuse-message', '.'];
        waitsForPromise(async () => {
          await hgService.amend();
          expect(committedToHg).toBeTruthy('Looks like commit did not happen');
          expect(tempFileCreated).not.toBeTruthy('Temporary file created while it is not needed');
          expect(tempFileRemoved).not.toBeTruthy(
            'Temporary file should not exist and removal should not have been attempted',
          );
        });
      });
    });
  });

  describe('::destroy', () => {
    it('should do cleanup without throwing an exception.', () => {
      hgService && hgService.dispose();
    });
  });

});
