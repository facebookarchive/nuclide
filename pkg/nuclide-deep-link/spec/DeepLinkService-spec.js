/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import electron from 'electron';
import nullthrows from 'nullthrows';
import DeepLinkService from '../lib/DeepLinkService';

const remote = nullthrows(electron.remote);

describe('DeepLinkService', () => {
  it('allows subscriptions to messages', () => {
    const service = new DeepLinkService();
    const testSpy1 = jasmine.createSpy('test1');
    const testSpy11 = jasmine.createSpy('test11');
    const testSpy2 = jasmine.createSpy('test2');

    // Make sure multiple subscriptions go through.
    const disposables = new UniversalDisposable(
      service.subscribeToPath('test1', testSpy1),
      service.subscribeToPath('test1', testSpy11),
      service.subscribeToPath('test2', testSpy2),
    );

    runs(() => {
      const browserWindow = remote.getCurrentWindow();
      service.sendDeepLink(browserWindow, 'test1', {a: '1'});
      service.sendDeepLink(browserWindow, 'test2/', {b: '2'});
    });

    waitsFor(() => testSpy1.callCount > 0);

    runs(() => {
      expect(testSpy1).toHaveBeenCalledWith({a: '1'});
      expect(testSpy11).toHaveBeenCalledWith({a: '1'});
      expect(testSpy2).toHaveBeenCalledWith({b: '2'});

      // Make sure observers get cleaned up.
      disposables.dispose();
      expect(service._observers.size).toBe(0);
    });
  });

  it('opens target=_blank links in a new window', () => {
    const service = new DeepLinkService();
    const windows = remote.BrowserWindow.getAllWindows();

    runs(() => {
      const browserWindow = remote.getCurrentWindow();
      service.sendDeepLink(browserWindow, 'test1', {a: '1', target: '_blank'});
    });

    waitsFor(
      () => remote.BrowserWindow.getAllWindows().length > windows.length,
      'new window to open',
    );

    // Ideally we'd also check that the URL made it through.. but that's too difficult.
  });
});
