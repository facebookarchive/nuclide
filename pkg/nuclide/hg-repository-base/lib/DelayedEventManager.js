'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */


/**
 * This class manages creating and canceling delayed events.
 */
class DelayedEventManager {
  constructor(
    setTimeoutFunc: (callback: any, delay: number) => any,
    clearTimeoutFunc: (identifier: any) => void
  ) {
    // These functions are passed from above to facilitate testing.
    this._setTimeoutFunction = setTimeoutFunc;
    this._clearTimeoutFunction = clearTimeoutFunc;

    this._canAcceptEvents = true;
    this._ids = new Set();
  }

  dispose(): void {
    this.cancelAllEvents();
  }

  /**
   * Sets whether the DelayedEventManager can currently accept more events.
   * If set to true, it can. If set to false, ::addEvent becomes a no-op.
   */
  setCanAcceptEvents(canAcceptEvents: boolean): void {
    this._canAcceptEvents = canAcceptEvents;
  }

  /**
   * Creates an event and returns an identifier that can be used to cancel it,
   * or null if the manager cannot accept events.
   */
  addEvent(callback: () => void, delayInMilliseconds: number): ?any {
    if (!this._canAcceptEvents) {
      return null;
    }
    // Prevent 'this' from being bound to DelayedEventManager.
    var setTimeoutFunction = this._setTimeoutFunction;
    var eventId = setTimeoutFunction(callback, delayInMilliseconds);
    this._ids.add(eventId);
    return eventId;
  }

  /**
   * Cancel the event with the given identifier.
   */
  cancelEvent(identifier: any): void {
    var hadId = this._ids.delete(identifier);
    if (hadId) {
      // Prevent 'this' from being bound to DelayedEventManager.
      var clearTimeoutFunction = this._clearTimeoutFunction;
      clearTimeoutFunction(identifier);
    }
  }

  /**
   * Clears all pending events.
   */
  cancelAllEvents(): void {
    // Prevent 'this' from being bound to DelayedEventManager.
    var clearTimeoutFunction = this._clearTimeoutFunction;
    this._ids.forEach(clearTimeoutFunction);
    this._ids.clear();
  }
}

module.exports = DelayedEventManager;
