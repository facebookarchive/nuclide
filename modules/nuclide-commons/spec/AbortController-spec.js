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

import AbortController from '../AbortController';

describe('AbortController', () => {
  it('dispatches abort() events', () => {
    const controller = new AbortController();
    expect(controller.signal.aborted).toBe(false);

    const spy = jasmine.createSpy('onabort');
    controller.signal.onabort = spy;

    controller.abort();

    expect(controller.signal.aborted).toBe(true);
    expect(spy).toHaveBeenCalled();

    // Ensure that we don't double-abort.
    controller.abort();
    expect(spy.callCount).toBe(1);
  });

  it('dispatches abort() events via addEventListener', () => {
    const controller = new AbortController();
    const spy = jasmine.createSpy('onabort');
    controller.signal.addEventListener('abort', spy);

    controller.abort();

    expect(controller.signal.aborted).toBe(true);
    expect(spy).toHaveBeenCalled();
  });
});
