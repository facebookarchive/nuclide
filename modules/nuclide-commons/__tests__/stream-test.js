"use strict";

function _stream() {
  const data = require("../stream");

  _stream = function () {
    return data;
  };

  return data;
}

function _fsPromise() {
  const data = _interopRequireDefault(require("../fsPromise"));

  _fsPromise = function () {
    return data;
  };

  return data;
}

var _stream2 = _interopRequireDefault(require("stream"));

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
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
describe('commons-node/stream', () => {
  it('observeStream', async () => {
    const input = ['foo\nbar', '\n', '\nba', 'z', '\nblar'];
    const stream = new _stream2.default.PassThrough();
    const promise = (0, _stream().observeStream)(stream).toArray().toPromise();
    input.forEach(value => {
      stream.write(value, 'utf8');
    });
    stream.end();
    const output = await promise;
    expect(output.join('')).toEqual(input.join(''));
  });
  it('observeStream - error', async () => {
    const stream = new _stream2.default.PassThrough();
    const input = ['foo\nbar', '\n', '\nba', 'z', '\nblar'];
    const output = [];
    const promise = new Promise((resolve, reject) => {
      (0, _stream().observeStream)(stream).subscribe(v => output.push(v), e => resolve(e), () => {});
    });
    const error = new Error('Had an error');
    input.forEach(value => {
      stream.write(value, 'utf8');
    });
    stream.emit('error', error);
    const result = await promise;
    expect(output).toEqual(input);
    expect(result).toBe(error);
  });
  it('writeToStream', async () => {
    const tempPath = await _fsPromise().default.tempfile();

    const fixturePath = _path.default.resolve(__dirname, '../__mocks__/fixtures/lyrics');

    const stream = _fs.default.createWriteStream(tempPath, {
      highWaterMark: 10
    }); // Read faster than we write to test buffering


    const observable = (0, _stream().observeRawStream)(_fs.default.createReadStream(fixturePath, {
      highWaterMark: 100
    }));
    await (0, _stream().writeToStream)(observable, stream).toPromise();
    const writtenFile = await _fsPromise().default.readFile(tempPath);
    const fixtureFile = await _fsPromise().default.readFile(fixturePath);
    expect(writtenFile).toEqual(fixtureFile);
  });
});