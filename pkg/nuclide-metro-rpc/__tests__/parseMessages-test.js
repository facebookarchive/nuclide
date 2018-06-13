'use strict';

var _parseMessages;

function _load_parseMessages() {
  return _parseMessages = require('../lib/parseMessages');
}

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('../../../modules/nuclide-commons/fsPromise'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

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
 */

describe('parseMessages', () => {
  // Run the same tests for each format of the packager output. We do this not because we want to
  // stay DRY, but to ensure that we're testing for the same output for each format.
  ['packager-stdout-1', 'packager-stdout-2', 'packager-stdout-3', 'packager-stdout-4'].forEach(fixtureName => {
    describe(fixtureName, () => {
      const lines = getLines(fixtureName).publishReplay();
      lines.connect();

      it('parses the preamble (skipping the ceremony)', async () => {
        await (async () => {
          const output = await (0, (_parseMessages || _load_parseMessages()).parseMessages)(lines).toArray().toPromise();
          expect(output[0].message.text).toBe('Running Metro on port 8081.');
        })();
      });

      it('finds the ready line', async () => {
        await (async () => {
          const output = await (0, (_parseMessages || _load_parseMessages()).parseMessages)(lines).toArray().toPromise();
          const readyLines = output.filter(line => line.type === 'ready');
          expect(readyLines.length).toBe(1, 'Expected exactly one ready message.');
        })();
      });
    });
  });
});

function getLines(name) {
  const pathToFile = (_nuclideUri || _load_nuclideUri()).default.resolve(__dirname, '../__mocks__/fixtures', `${name}.txt`);
  return _rxjsBundlesRxMinJs.Observable.defer(() => (_fsPromise || _load_fsPromise()).default.readFile(pathToFile)).switchMap(contents => _rxjsBundlesRxMinJs.Observable.from(contents.toString().split('\n')));
}