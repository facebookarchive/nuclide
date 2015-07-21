'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {uncachedRequire} = require('nuclide-test-helpers');

describe('LocalMerlinService', () => {
  function getMockedMerlinService(callback): Promise<LocalMerlinService> {
    var MerlinProcess = uncachedRequire(require, '../lib/MerlinProcess');
    var merlinService = new (uncachedRequire(require, '../lib/LocalMerlinService'))();

    spyOn(merlinService, '_getInstance').andCallFake(() => {
        var mockedProcess = new MerlinProcess({on: () => null});
        spyOn(mockedProcess, 'runSingleCommand').andCallFake(callback);
        return Promise.resolve(mockedProcess);
    });

    return Promise.resolve(merlinService);
  }

  describe('pushDotMerlinPath()', () => {
    it('correctly sets the .merlin path', () => {
      waitsForPromise(async () => {
        var filename = 'some_module.ml';
        var merlinService = await getMockedMerlinService(
          (command) => {
            if (command[1] === 'dot_merlin' && command[2][0] === filename) {
              return {cursor: {line: 1, col: 0}, marker: false};
            }
            return null;
        });

        var result = await merlinService.pushDotMerlinPath(filename);
        expect(JSON.stringify(result)).toBe(
          '{"cursor":{"line":1,"col":0},"marker":false}');
      });
    });
  });

  describe('pushNewBuffer()', () => {
    it('resets the merlin buffer', () => {
      waitsForPromise(async () => {
        // Switching files (and resetting ocamlmerlin's state
        // accordingly) currently involves informing it of the new
        // filename (step 1) and then sending it the full content of
        // the buffer (step 2); check that we do both.
        var filename = 'some_module.ml';
        var content = 'let x = 42\nlet y = x';

        var count = 0;
        var merlinService = await getMockedMerlinService(
          (command) => {
            if (command[0] === 'reset' && command[2] === filename && count === 0) {
              ++count;
              return { cursor: {line: 1, col: 0}, marker: false };
            } else if (command[0] === 'tell' && command[2] === content && count === 1) {
              return { cursor: {line: 2, col: 0}, marker: false};
            }

            return null;
          });

        var result = await merlinService.pushNewBuffer(filename, content);
        expect(JSON.stringify(result)).toBe(
          '{"cursor":{"line":2,"col":0},"marker":false}');

      });
    });
  });

  describe('locate()', () => {
    it('adds path if ocamlmerlin response lacks it', () => {
      waitsForPromise(async () => {
        // Ocamlmerlin doesn't return paths for navigation results
        // within the same file; make sure we normalize this by
        // adding the path.
        var merlinService = await getMockedMerlinService(
          (command) => { return {cursor: {line: 1 ,col: 0}, marker: false}; }
        );

        var result = await merlinService.locate('derp.ml', 1, 1, 'ml');

        expect(JSON.stringify(result)).toBe(
          '{"cursor":{"line":1,"col":0},"marker":false,"file":"derp.ml"}');
      });
    });
    it('uses the given path if ocamlmerlin provides it', () => {
      waitsForPromise(async () => {
        var merlinService = await getMockedMerlinService(
          (command) => {
              return {cursor: {line: 1 ,col: 0}, marker: false, file: 'notderp.ml'};
        });

        var result = await merlinService.locate('yesderp.ml', 1, 1, 'ml');

        expect(JSON.stringify(result)).toBe(
          '{"cursor":{"line":1,"col":0},"marker":false,"file":"notderp.ml"}');

      });
    });
  });


  describe('complete()', () => {
    it('sends the appropriate merlin command', () => {
      waitsForPromise(async () => {
        var expectedResult = [
            { desc: 'unit -> int', info: '', kind: 'Value', name: 'derp' },
            { desc: 'int', info: '', kind: 'Value', name: 'also' }
        ];

        var merlinService = await getMockedMerlinService(
          (command) => {
            if (command[0] === 'complete' &&
                command[1] === 'prefix' &&
                command[2] === 'FoodTest.' &&
                command[3] === 'at' &&
                command[4].line === 6 &&
                command[4].col === 3) {
              return expectedResult;
            }

            return null;
        });

        var result = await merlinService.complete('derp.ml', 5, 2, 'FoodTest.');

        expect(JSON.stringify(result)).toBe(JSON.stringify(expectedResult));
      });
    });
  });
});
