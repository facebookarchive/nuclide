'use strict';

var _stream;

function _load_stream() {
  return _stream = require('../stream');
}

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('../fsPromise'));
}

var _stream2 = _interopRequireDefault(require('stream'));

var _fs = _interopRequireDefault(require('fs'));

var _path = _interopRequireDefault(require('path'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('commons-node/stream', () => {
  it('observeStream', async () => {
    await (async () => {
      const input = ['foo\nbar', '\n', '\nba', 'z', '\nblar'];
      const stream = new _stream2.default.PassThrough();
      const promise = (0, (_stream || _load_stream()).observeStream)(stream).toArray().toPromise();
      input.forEach(value => {
        stream.write(value, 'utf8');
      });
      stream.end();
      const output = await promise;
      expect(output.join('')).toEqual(input.join(''));
    })();
  });

  it('observeStream - error', async () => {
    await (async () => {
      const stream = new _stream2.default.PassThrough();
      const input = ['foo\nbar', '\n', '\nba', 'z', '\nblar'];
      const output = [];
      const promise = new Promise((resolve, reject) => {
        (0, (_stream || _load_stream()).observeStream)(stream).subscribe(v => output.push(v), e => resolve(e), () => {});
      });
      const error = new Error('Had an error');

      input.forEach(value => {
        stream.write(value, 'utf8');
      });
      stream.emit('error', error);

      const result = await promise;
      expect(output).toEqual(input);
      expect(result).toBe(error);
    })();
  });

  it('writeToStream', async () => {
    await (async () => {
      const tempPath = await (_fsPromise || _load_fsPromise()).default.tempfile();
      const fixturePath = _path.default.resolve(__dirname, '../__mocks__/fixtures/lyrics');
      const stream = _fs.default.createWriteStream(tempPath, { highWaterMark: 10 });
      // Read faster than we write to test buffering
      const observable = (0, (_stream || _load_stream()).observeRawStream)(_fs.default.createReadStream(fixturePath, { highWaterMark: 100 }));

      await (0, (_stream || _load_stream()).writeToStream)(observable, stream).toPromise();

      const writtenFile = await (_fsPromise || _load_fsPromise()).default.readFile(tempPath);
      const fixtureFile = await (_fsPromise || _load_fsPromise()).default.readFile(fixturePath);
      expect(writtenFile).toEqual(fixtureFile);
    })();
  });
}); /**
     * Copyright (c) 2017-present, Facebook, Inc.
     * All rights reserved.
     *
     * This source code is licensed under the BSD-style license found in the
     * LICENSE file in the root directory of this source tree. An additional grant
     * of patent rights can be found in the PATENTS file in the same directory.
     *
     *  strict-local
     * @format
     */