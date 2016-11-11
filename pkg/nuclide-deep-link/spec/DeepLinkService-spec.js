'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {CompositeDisposable} from 'atom';
import electron from 'electron';
import nullthrows from 'nullthrows';
import DeepLinkService from '../lib/DeepLinkService';

function sendMessage(message, params) {
  nullthrows(electron.remote)
    .getCurrentWebContents()
    .send('nuclide-url-open', {message, params});
}

describe('DeepLinkService', () => {
  it('allows subscriptions to messages', () => {
    const service = new DeepLinkService();
    const testSpy1 = jasmine.createSpy('test1');
    const testSpy11 = jasmine.createSpy('test11');
    const testSpy2 = jasmine.createSpy('test2');

    // Make sure multiple subscriptions go through.
    const disposables = new CompositeDisposable(
      service.subscribeToPath('test1', testSpy1),
      service.subscribeToPath('test1', testSpy11),
      service.subscribeToPath('test2', testSpy2),
    );

    runs(() => {
      sendMessage('test1', {a: 1});
      sendMessage('test2/', {b: 2});
    });

    waitsFor(() => testSpy1.callCount > 0);

    runs(() => {
      expect(testSpy1).toHaveBeenCalledWith({a: 1});
      expect(testSpy11).toHaveBeenCalledWith({a: 1});
      expect(testSpy2).toHaveBeenCalledWith({b: 2});

      // Make sure observers get cleaned up.
      disposables.dispose();
      expect(service._observers.size).toBe(0);
    });
  });
});
