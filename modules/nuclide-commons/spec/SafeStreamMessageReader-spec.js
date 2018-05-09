/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow strict-local
 * @format
 */

import Stream from 'stream';
import SafeStreamMessageReader from '../SafeStreamMessageReader';

describe('SafeStreamMessageReader', () => {
  it('reads valid messages', () => {
    const readable = new Stream.Readable({
      read() {
        this.push('Content-Length: 7\r\n\r\n{"a":1}');
        this.push(null);
      },
    });
    const reader = new SafeStreamMessageReader(readable);
    const listenSpy = jasmine.createSpy('listen');
    reader.listen(listenSpy);

    waitsFor(() => listenSpy.wasCalled);

    runs(() => {
      expect(listenSpy.calls[0].args).toEqual([{a: 1}]);
    });
  });

  it('emits an error for an invalid header', () => {
    const readable = new Stream.Readable({
      read() {
        this.push('Invalid-Header: test\r\n\r\n');
        this.push('Content-Length: 2\r\n\r\n{}');
        this.push(null);
      },
    });
    const reader = new SafeStreamMessageReader(readable);
    const listenSpy = jasmine.createSpy('listen');
    const errorSpy = jasmine.createSpy('error');
    reader.listen(listenSpy);
    reader.onError(errorSpy);

    waitsFor(() => errorSpy.wasCalled);

    runs(() => {
      expect(errorSpy.calls[0].args).toEqual([Error()]);
      expect(listenSpy).not.toHaveBeenCalled();
    });
  });
});
