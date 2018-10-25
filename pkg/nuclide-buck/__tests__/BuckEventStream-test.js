"use strict";

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _BuckEventStream() {
  const data = require("../lib/BuckEventStream");

  _BuckEventStream = function () {
    return data;
  };

  return data;
}

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 * @emails oncall+nuclide
 */
describe('combineEventStreams', () => {
  let socketSubject;
  let processSubject;
  beforeEach(() => {
    socketSubject = new _RxMin.Subject();
    processSubject = new _RxMin.Subject();
  });
  it('takes non-log-level messages from the process', async () => {
    const combinedStream = (0, _BuckEventStream().combineEventStreams)('build', socketSubject, processSubject);
    const promise = combinedStream.toArray().toPromise();
    socketSubject.next({
      type: 'progress',
      progress: 0
    });
    processSubject.next({
      type: 'log',
      message: 'skip',
      level: 'log'
    });
    processSubject.next({
      type: 'log',
      message: 'take1',
      level: 'error'
    });
    processSubject.next({
      type: 'log',
      message: 'take2',
      level: 'log'
    });
    processSubject.complete();
    const result = await promise;
    expect(result).toEqual([{
      type: 'progress',
      progress: 0
    }, {
      type: 'log',
      message: 'take1',
      level: 'error'
    }, {
      type: 'log',
      message: 'take2',
      level: 'log'
    }]);
  });
  it('falls back to process output when socket is empty', async () => {
    const combinedStream = (0, _BuckEventStream().combineEventStreams)('build', socketSubject, processSubject);
    const promise = combinedStream.toArray().toPromise();
    processSubject.next({
      type: 'log',
      message: 'take1',
      level: 'log'
    });
    processSubject.next({
      type: 'log',
      message: 'take2',
      level: 'log'
    });
    processSubject.next({
      type: 'log',
      message: 'take3',
      level: 'error'
    });
    processSubject.complete();
    const result = await promise;
    expect(result).toEqual([{
      type: 'log',
      message: 'take1',
      level: 'log'
    }, {
      type: 'log',
      message: 'take2',
      level: 'log'
    }, {
      type: 'log',
      message: 'take3',
      level: 'error'
    }]);
  });
  it('test: takes process messages after build finishes', async () => {
    const combinedStream = (0, _BuckEventStream().combineEventStreams)('test', socketSubject, processSubject);
    const promise = combinedStream.toArray().toPromise();
    processSubject.next({
      type: 'log',
      message: 'take',
      level: 'log'
    });
    socketSubject.next({
      type: 'progress',
      progress: 1
    });
    processSubject.next({
      type: 'log',
      message: 'take',
      level: 'log'
    });
    processSubject.complete();
    const result = await promise;
    expect(result).toEqual([{
      type: 'log',
      message: 'take',
      level: 'log'
    }, {
      type: 'progress',
      progress: null
    }, {
      type: 'log',
      message: 'take',
      level: 'log'
    }]);
  });
  it('run: takes process messages after build finishes', async () => {
    const combinedStream = (0, _BuckEventStream().combineEventStreams)('test', socketSubject, processSubject);
    const promise = combinedStream.toArray().toPromise();
    processSubject.next({
      type: 'log',
      message: 'take',
      level: 'log'
    });
    socketSubject.next({
      type: 'progress',
      progress: 1
    });
    processSubject.next({
      type: 'log',
      message: 'take',
      level: 'log'
    });
    processSubject.complete();
    const result = await promise;
    expect(result).toEqual([{
      type: 'log',
      message: 'take',
      level: 'log'
    }, {
      type: 'progress',
      progress: null
    }, {
      type: 'log',
      message: 'take',
      level: 'log'
    }]);
  });
  it('install: adds installing message after build finish', async () => {
    const combinedStream = (0, _BuckEventStream().combineEventStreams)('install', socketSubject, processSubject);
    const promise = combinedStream.toArray().toPromise();
    socketSubject.next({
      type: 'progress',
      progress: 1
    });
    processSubject.next({
      type: 'log',
      message: 'skip',
      level: 'log'
    });
    processSubject.complete();
    const result = await promise;
    expect(result).toEqual([{
      type: 'progress',
      progress: 1
    }, {
      type: 'progress',
      progress: null
    }, {
      type: 'log',
      message: 'Installing...',
      level: 'info'
    }]);
  });
});