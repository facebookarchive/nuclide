"use strict";

function _parseMessages() {
  const data = require("../lib/parseMessages");

  _parseMessages = function () {
    return data;
  };

  return data;
}

function _fsPromise() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/fsPromise"));

  _fsPromise = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

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
 * @emails oncall+nuclide
 */
describe('parseMessages', () => {
  // Run the same tests for each format of the packager output. We do this not because we want to
  // stay DRY, but to ensure that we're testing for the same output for each format.
  ['packager-stdout-1', 'packager-stdout-2', 'packager-stdout-3', 'packager-stdout-4'].forEach(fixtureName => {
    describe(fixtureName, () => {
      const lines = getLines(fixtureName).publishReplay();
      lines.connect();
      it('parses the preamble (skipping the ceremony)', async () => {
        const output = await (0, _parseMessages().parseMessages)(lines).toArray().toPromise();
        expect(output[0].message.text).toBe('Running Metro on port 8081.');
      });
      it('finds the ready line', async () => {
        const output = await (0, _parseMessages().parseMessages)(lines).toArray().toPromise();
        const readyLines = output.filter(line => line.type === 'ready');
        expect(readyLines.length).toBe(1, 'Expected exactly one ready message.');
      });
    });
  });
});

function getLines(name) {
  const pathToFile = _nuclideUri().default.resolve(__dirname, '../__mocks__/fixtures', `${name}.txt`);

  return _RxMin.Observable.defer(() => _fsPromise().default.readFile(pathToFile)).switchMap(contents => _RxMin.Observable.from(contents.toString().split('\n')));
}