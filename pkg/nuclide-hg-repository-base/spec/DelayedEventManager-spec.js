'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const DelayedEventManager = require('../lib/DelayedEventManager');
import invariant from 'assert';

describe('DelayedEventManager', () => {
  let manager;
  let callbackSpy: any;
  const EVENT_DELAY_IN_MS = 10;

  beforeEach(() => {
    manager = new DelayedEventManager(setTimeout, clearTimeout);
    callbackSpy = jasmine.createSpy();
  });

  it('fires events after the delay period has passed.', () => {
    invariant(manager);
    const id = manager.addEvent(callbackSpy, EVENT_DELAY_IN_MS);
    expect(id).toBeDefined();
    window.advanceClock(EVENT_DELAY_IN_MS);
    expect(callbackSpy).toHaveBeenCalled();
  });

  describe('::setCanAcceptEvents', () => {
    it('determines whether the DelayedEventManager can accept new events.', () => {
      invariant(manager);
      manager.setCanAcceptEvents(false);
      let id = manager.addEvent(callbackSpy, EVENT_DELAY_IN_MS);
      expect(id).toBeNull();
      window.advanceClock(EVENT_DELAY_IN_MS);
      expect(callbackSpy).not.toHaveBeenCalled();

      manager.setCanAcceptEvents(true);
      id = manager.addEvent(callbackSpy, EVENT_DELAY_IN_MS);
      expect(id).toBeDefined();
      window.advanceClock(EVENT_DELAY_IN_MS);
      expect(callbackSpy).toHaveBeenCalled();
    });
  });

  describe('::cancelEvent', () => {
    it('cancels the event with the given identifier.', () => {
      invariant(manager);
      const id = manager.addEvent(callbackSpy, EVENT_DELAY_IN_MS);
      expect(id).toBeDefined();
      const callbackSpy2 = jasmine.createSpy();
      const id2 = manager.addEvent(callbackSpy2, EVENT_DELAY_IN_MS);
      expect(id2).toBeDefined();

      window.advanceClock(EVENT_DELAY_IN_MS - 1);
      manager.cancelEvent(id);
      window.advanceClock(1);

      expect(callbackSpy).not.toHaveBeenCalled();
      expect(callbackSpy2).toHaveBeenCalled();
    });
  });

  describe('::cancelAllEvents', () => {
    it('cancels all pending events.', () => {
      invariant(manager);
      const id = manager.addEvent(callbackSpy, EVENT_DELAY_IN_MS);
      expect(id).toBeDefined();
      const callbackSpy2 = jasmine.createSpy();
      const id2 = manager.addEvent(callbackSpy2, EVENT_DELAY_IN_MS);
      expect(id2).toBeDefined();

      window.advanceClock(EVENT_DELAY_IN_MS - 1);
      manager.cancelAllEvents();
      window.advanceClock(1);

      expect(callbackSpy).not.toHaveBeenCalled();
      expect(callbackSpy2).not.toHaveBeenCalled();
    });
  });

  describe('::dispose', () => {
    it('will cancel all pending events.', () => {
      invariant(manager);
      const id = manager.addEvent(callbackSpy, EVENT_DELAY_IN_MS);
      expect(id).toBeDefined();
      const callbackSpy2 = jasmine.createSpy();
      const id2 = manager.addEvent(callbackSpy2, EVENT_DELAY_IN_MS);
      expect(id2).toBeDefined();

      window.advanceClock(EVENT_DELAY_IN_MS - 1);
      manager.dispose();
      window.advanceClock(1);

      expect(callbackSpy).not.toHaveBeenCalled();
      expect(callbackSpy2).not.toHaveBeenCalled();
    });
  });
});
