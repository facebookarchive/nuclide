'use strict';

var _loadingNotification;

function _load_loadingNotification() {
  return _loadingNotification = _interopRequireDefault(require('../loading-notification'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */

const sleep = n => new Promise(r => setTimeout(r, n));

beforeEach(() => {
  jest.restoreAllMocks();
});
describe('loadingNotification', () => {
  let mockNotif;
  beforeEach(() => {
    mockNotif = {
      dismiss: jest.fn()
    };
    jest.spyOn(atom.notifications, 'addInfo').mockReturnValue(mockNotif);
  });

  it('displays and closes a loading notification', async () => {
    await (async () => {
      const testValue = 1;
      const promise = new Promise((resolve, reject) => {
        setTimeout(() => resolve(testValue), 10);
      });
      const resultPromise = (0, (_loadingNotification || _load_loadingNotification()).default)(promise, 'test message',
      /* delayMs */0);
      await sleep(10);
      expect((await resultPromise)).toEqual(testValue);
      expect(atom.notifications.addInfo).toHaveBeenCalled();

      if (!mockNotif) {
        throw new Error('Invariant violation: "mockNotif"');
      }

      expect(mockNotif.dismiss).toHaveBeenCalled();
    })();
  });

  it('displays and closes a loading notification for errors', async () => {
    await (async () => {
      const promise = new Promise((resolve, reject) => {
        setTimeout(() => reject(new Error()), 10);
      });
      try {
        const resultPromise = (0, (_loadingNotification || _load_loadingNotification()).default)(promise, 'test message',
        /* delayMs */0);
        await sleep(10);
        await resultPromise;
      } catch (e) {}
      expect(atom.notifications.addInfo).toHaveBeenCalled();

      if (!mockNotif) {
        throw new Error('Invariant violation: "mockNotif"');
      }

      expect(mockNotif.dismiss).toHaveBeenCalled();
    })();
  });

  it('does nothing for fast promises', async () => {
    await (async () => {
      const testValue = 1;
      const promise = new Promise((resolve, reject) => {
        setTimeout(() => resolve(testValue), 1);
      });
      const resultPromise = (0, (_loadingNotification || _load_loadingNotification()).default)(promise, 'test message',
      /* delayMs */10);
      await sleep(1);
      expect((await resultPromise)).toEqual(testValue);
      expect(atom.notifications.addInfo.mock.calls.length).toEqual(0);

      if (!mockNotif) {
        throw new Error('Invariant violation: "mockNotif"');
      }

      expect(mockNotif.dismiss.mock.calls.length).toEqual(0);
    })();
  });
});