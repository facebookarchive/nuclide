'use strict';

var _stream = _interopRequireDefault(require('stream'));

var _SafeStreamMessageReader;

function _load_SafeStreamMessageReader() {
  return _SafeStreamMessageReader = _interopRequireDefault(require('../SafeStreamMessageReader'));
}

var _waits_for;

function _load_waits_for() {
  return _waits_for = _interopRequireDefault(require('../../../jest/waits_for'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('SafeStreamMessageReader', () => {
  it('reads valid messages', async () => {
    const readable = new _stream.default.Readable({
      read() {
        this.push('Content-Length: 7\r\n\r\n{"a":1}');
        this.push(null);
      }
    });
    const reader = new (_SafeStreamMessageReader || _load_SafeStreamMessageReader()).default(readable);
    const listenSpy = jest.fn();
    reader.listen(listenSpy);

    await (0, (_waits_for || _load_waits_for()).default)(() => listenSpy.mock.calls.length > 0);

    expect(listenSpy.mock.calls[0]).toEqual([{ a: 1 }]);
  });

  it('emits an error for an invalid header', async () => {
    const readable = new _stream.default.Readable({
      read() {
        this.push('Invalid-Header: test\r\n\r\n');
        this.push('Content-Length: 2\r\n\r\n{}');
        this.push(null);
      }
    });
    const reader = new (_SafeStreamMessageReader || _load_SafeStreamMessageReader()).default(readable);
    const listenSpy = jest.fn();
    const errorSpy = jest.fn();
    reader.listen(listenSpy);
    reader.onError(errorSpy);

    await (0, (_waits_for || _load_waits_for()).default)(() => errorSpy.mock.calls.length > 0);

    expect(errorSpy.mock.calls[0][0].name).toBe('Error');
    expect(listenSpy).not.toHaveBeenCalled();
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