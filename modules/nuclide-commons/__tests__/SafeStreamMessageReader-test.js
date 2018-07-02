"use strict";

var _stream = _interopRequireDefault(require("stream"));

function _SafeStreamMessageReader() {
  const data = _interopRequireDefault(require("../SafeStreamMessageReader"));

  _SafeStreamMessageReader = function () {
    return data;
  };

  return data;
}

function _waits_for() {
  const data = _interopRequireDefault(require("../../../jest/waits_for"));

  _waits_for = function () {
    return data;
  };

  return data;
}

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
describe('SafeStreamMessageReader', () => {
  it('reads valid messages', async () => {
    const readable = new _stream.default.Readable({
      read() {
        this.push('Content-Length: 7\r\n\r\n{"a":1}');
        this.push(null);
      }

    });
    const reader = new (_SafeStreamMessageReader().default)(readable);
    const listenSpy = jest.fn();
    reader.listen(listenSpy);
    await (0, _waits_for().default)(() => listenSpy.mock.calls.length > 0);
    expect(listenSpy.mock.calls[0]).toEqual([{
      a: 1
    }]);
  });
  it('emits an error for an invalid header', async () => {
    const readable = new _stream.default.Readable({
      read() {
        this.push('Invalid-Header: test\r\n\r\n');
        this.push('Content-Length: 2\r\n\r\n{}');
        this.push(null);
      }

    });
    const reader = new (_SafeStreamMessageReader().default)(readable);
    const listenSpy = jest.fn();
    const errorSpy = jest.fn();
    reader.listen(listenSpy);
    reader.onError(errorSpy);
    await (0, _waits_for().default)(() => errorSpy.mock.calls.length > 0);
    expect(errorSpy.mock.calls[0][0].name).toBe('Error');
    expect(listenSpy).not.toHaveBeenCalled();
  });
});