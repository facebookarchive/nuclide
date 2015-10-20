'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */


import {NotificationCallback} from '../lib/NotificationCallback';

describe('debugger-hhvm-proxy NotificationCallback', () => {
  let observerableSpy;
  let notificationCallback;

  beforeEach(() => {
    observerableSpy = jasmine.createSpyObj(
      'notificationObservable',
      ['onNext'],
    );
    notificationCallback = new NotificationCallback(observerableSpy);
  });

  it('sendMessage', () => {
    let message = 'error message';
    notificationCallback.sendMessage('error', message);
    expect(observerableSpy.onNext).toHaveBeenCalledWith({
      type: 'error',
      message,
    });
  });
});
