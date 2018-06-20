'use strict';

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../modules/nuclide-commons/UniversalDisposable'));
}

var _electron = _interopRequireDefault(require('electron'));

var _nullthrows;

function _load_nullthrows() {
  return _nullthrows = _interopRequireDefault(require('nullthrows'));
}

var _DeepLinkService;

function _load_DeepLinkService() {
  return _DeepLinkService = _interopRequireDefault(require('../lib/DeepLinkService'));
}

var _waits_for;

function _load_waits_for() {
  return _waits_for = _interopRequireDefault(require('../../../jest/waits_for'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const remote = (0, (_nullthrows || _load_nullthrows()).default)(_electron.default.remote); /**
                                                                                            * Copyright (c) 2015-present, Facebook, Inc.
                                                                                            * All rights reserved.
                                                                                            *
                                                                                            * This source code is licensed under the license found in the LICENSE file in
                                                                                            * the root directory of this source tree.
                                                                                            *
                                                                                            *  strict-local
                                                                                            * @format
                                                                                            */

describe('DeepLinkService', () => {
  it('allows subscriptions to messages', async () => {
    const service = new (_DeepLinkService || _load_DeepLinkService()).default();
    const testSpy1 = jest.fn();
    const testSpy11 = jest.fn();
    const testSpy2 = jest.fn();

    // Make sure multiple subscriptions go through.
    const disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(service.subscribeToPath('test1', testSpy1), service.subscribeToPath('test1', testSpy11), service.subscribeToPath('test2', testSpy2));

    const browserWindow = remote.getCurrentWindow();
    service.sendDeepLink(browserWindow, 'test1', { a: '1' });
    service.sendDeepLink(browserWindow, 'test2/', { b: '2' });

    await (0, (_waits_for || _load_waits_for()).default)(() => testSpy1.mock.calls.length > 0);

    expect(testSpy1).toHaveBeenCalledWith({ a: '1' });
    expect(testSpy11).toHaveBeenCalledWith({ a: '1' });
    expect(testSpy2).toHaveBeenCalledWith({ b: '2' });

    // Make sure observers get cleaned up.
    disposables.dispose();
    expect(service._observers.size).toBe(0);
    service.dispose();
  });

  it('opens target=_blank links in a new window', async () => {
    const service = new (_DeepLinkService || _load_DeepLinkService()).default();
    const windows = remote.BrowserWindow.getAllWindows();

    const browserWindow = remote.getCurrentWindow();
    // Opening a modal marks the window as non-blank.
    const panel = atom.workspace.addModalPanel({
      item: document.createElement('div')
    });
    service.sendDeepLink(browserWindow, 'test1', { a: '1', target: '_blank' });

    await (0, (_waits_for || _load_waits_for()).default)(() => remote.BrowserWindow.getAllWindows().length > windows.length, 'new window to open');

    // Ideally we'd also check that the URL made it through.. but that's too difficult.
    service.dispose();
    panel.destroy();
  });
});