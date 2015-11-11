'use babel';
/* @noflow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const main = require('../lib/main');
const track = require('../lib/track');
const trackTiming = main.trackTiming;

class TestClass {
  constructor(methodBodyToBeTracked: any) {
    this._methodBodyToBeTracked = methodBodyToBeTracked;
  }

  @trackTiming()
  foo(): any {
    return this._methodBodyToBeTracked();
  }
}

function createTestClassAndCallTrackedMethod(methodBodyToBeTracked: any): any {
  const test = new TestClass(methodBodyToBeTracked);
  return test.foo();
}

describe('The @trackTiming decorator', () => {
  let trackKey, trackValues;
  beforeEach(() => {
    // Clear intercepted tracking data.
    trackKey = null;
    trackValues = null;

    useRealClock(); // Make setTimeout work as expected.

    // Intercept Parse API call.
    spyOn(track, 'track').andCallFake((key, values) => {
      trackKey = key;
      trackValues = values;
      return Promise.resolve();
    });
  });

  it('tracks timing on a successful sync function call', () => {
    let ret;

    runs(() => {
      ret = createTestClassAndCallTrackedMethod(() => 1 );
    });

    waitsFor(() => trackKey, 10);

    runs(() => {
      expect(ret).toEqual(1);
      expect(trackKey).toEqual('performance');
      expect(trackValues.eventName).toEqual('TestClass.foo');
      expect(trackValues.error).toEqual('0');
      expect(trackValues.exception).toEqual('');
    });
  });

  it('tracks timing on a failed sync function call', () => {
    let errCaught;
    const errToThrow = Error();

    runs(() => {
      try {
        createTestClassAndCallTrackedMethod(() => {
          throw errToThrow;
        });
      } catch (err) {
        errCaught = err;
      }
    });

    waitsFor(() => trackKey, 10);

    runs(() => {
      expect(errCaught).toEqual(errToThrow);
      expect(trackKey).toEqual('performance');
      expect(trackValues.eventName).toEqual('TestClass.foo');
      expect(trackValues.error).toEqual('1');
      expect(trackValues.exception).toEqual(errToThrow.toString());
    });
  });
  it('tracks timing on a successful async function call', () => {
    waitsForPromise(async () => {
      const ret = await createTestClassAndCallTrackedMethod(() => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve(1);
          }, 50);
        });
      });

      expect(ret).toEqual(1);
      expect(trackKey).toEqual('performance');
      expect(trackValues.eventName).toEqual('TestClass.foo');
      expect(trackValues.error).toEqual('0');
      expect(trackValues.exception).toEqual('');
      expect(parseInt(trackValues.duration, 10) >= 50).toBe(true);
    });
  });

  it('tracks timing on a failed async function call', () => {
    waitsForPromise(async () => {
      const rejectReason = 'a rejection';
      let rejectionCaught;

      try {
        await createTestClassAndCallTrackedMethod(() => {
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              reject(rejectReason);
            }, 50);
          });
        });
      } catch (e) {
        rejectionCaught = e;
      }

      expect(rejectionCaught).toEqual(rejectReason);
      expect(trackKey).toEqual('performance');
      expect(trackValues.eventName).toEqual('TestClass.foo');
      expect(trackValues.error).toEqual('1');
      expect(trackValues.exception).toEqual('Error: ' + rejectReason.toString());
      expect(parseInt(trackValues.duration, 10) >= 50).toBe(true);
    });
  });
});
