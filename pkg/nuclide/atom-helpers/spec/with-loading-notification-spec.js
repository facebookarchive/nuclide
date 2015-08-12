'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {withLoadingNotification} = require('../lib/main');

describe('withLoadingNotification', () => {
  var mockNotif;
  beforeEach(() => {
    mockNotif = {
      dismiss: jasmine.createSpy('dismiss'),
    };
    spyOn(atom.notifications, 'addInfo').andReturn(mockNotif);
    // Remove apm's spy on setTimeout.
    window.setTimeout = window.setTimeout.originalValue;
  });

  it('displays and closes a loading notification', () => {
    waitsForPromise(async () => {
      var testValue = 1;
      var promise = new Promise((resolve, reject) => {
        setTimeout(() => resolve(testValue), 10);
      });
      var result = await withLoadingNotification(
        promise,
        'test message',
        /* delayMs */ 0,
      );
      expect(result).toEqual(testValue);
      expect(atom.notifications.addInfo).toHaveBeenCalled();
      expect(mockNotif.dismiss).toHaveBeenCalled();
    });
  });

  it('displays and closes a loading notification for errors', () => {
    waitsForPromise(async () => {
      var promise = new Promise((resolve, reject) => {
        setTimeout(() => reject(), 10);
      });
      try {
        await withLoadingNotification(
          promise,
          'test message',
          /* delayMs */ 0,
        );
      } catch (e) {}
      expect(atom.notifications.addInfo).toHaveBeenCalled();
      expect(mockNotif.dismiss).toHaveBeenCalled();
    });
  });

  it('does nothing for fast promises', () => {
    waitsForPromise(async () => {
      var testValue = 1;
      var promise = new Promise((resolve, reject) => {
        setTimeout(() => resolve(testValue), 0);
      });
      var result = await withLoadingNotification(
        promise,
        'test message',
        /* delayMs */ 10,
      );
      expect(result).toEqual(testValue);
      expect(atom.notifications.addInfo.calls.length).toEqual(0);
      expect(mockNotif.dismiss.calls.length).toEqual(0);
    });
  });
});
