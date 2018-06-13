'use strict';

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _BuckEventStream;

function _load_BuckEventStream() {
  return _BuckEventStream = require('../lib/BuckEventStream');
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
 */

describe('combineEventStreams', () => {
  let socketSubject;
  let processSubject;

  beforeEach(() => {
    socketSubject = new _rxjsBundlesRxMinJs.Subject();
    processSubject = new _rxjsBundlesRxMinJs.Subject();
  });

  it('takes non-log-level messages from the process', async () => {
    await (async () => {
      const combinedStream = (0, (_BuckEventStream || _load_BuckEventStream()).combineEventStreams)('build', socketSubject, processSubject);
      const promise = combinedStream.toArray().toPromise();

      socketSubject.next({ type: 'progress', progress: 0 });

      processSubject.next({ type: 'log', message: 'skip', level: 'log' });
      processSubject.next({ type: 'log', message: 'take1', level: 'error' });
      processSubject.next({ type: 'log', message: 'take2', level: 'log' });
      processSubject.complete();

      const result = await promise;
      expect(result).toEqual([{ type: 'progress', progress: 0 }, { type: 'log', message: 'take1', level: 'error' }, { type: 'log', message: 'take2', level: 'log' }]);
    })();
  });

  it('falls back to process output when socket is empty', async () => {
    await (async () => {
      const combinedStream = (0, (_BuckEventStream || _load_BuckEventStream()).combineEventStreams)('build', socketSubject, processSubject);
      const promise = combinedStream.toArray().toPromise();

      processSubject.next({ type: 'log', message: 'take1', level: 'log' });
      processSubject.next({ type: 'log', message: 'take2', level: 'log' });
      processSubject.next({ type: 'log', message: 'take3', level: 'error' });
      processSubject.complete();

      const result = await promise;
      expect(result).toEqual([{ type: 'log', message: 'take1', level: 'log' }, { type: 'log', message: 'take2', level: 'log' }, { type: 'log', message: 'take3', level: 'error' }]);
    })();
  });

  it('test: takes process messages after build finishes', async () => {
    await (async () => {
      const combinedStream = (0, (_BuckEventStream || _load_BuckEventStream()).combineEventStreams)('test', socketSubject, processSubject);
      const promise = combinedStream.toArray().toPromise();

      processSubject.next({ type: 'log', message: 'take', level: 'log' });
      socketSubject.next({ type: 'progress', progress: 1 });
      processSubject.next({ type: 'log', message: 'take', level: 'log' });
      processSubject.complete();

      const result = await promise;
      expect(result).toEqual([{ type: 'log', message: 'take', level: 'log' }, { type: 'progress', progress: null }, { type: 'log', message: 'take', level: 'log' }]);
    })();
  });

  it('run: takes process messages after build finishes', async () => {
    await (async () => {
      const combinedStream = (0, (_BuckEventStream || _load_BuckEventStream()).combineEventStreams)('test', socketSubject, processSubject);
      const promise = combinedStream.toArray().toPromise();

      processSubject.next({ type: 'log', message: 'take', level: 'log' });
      socketSubject.next({ type: 'progress', progress: 1 });
      processSubject.next({ type: 'log', message: 'take', level: 'log' });
      processSubject.complete();

      const result = await promise;
      expect(result).toEqual([{ type: 'log', message: 'take', level: 'log' }, { type: 'progress', progress: null }, { type: 'log', message: 'take', level: 'log' }]);
    })();
  });

  it('install: adds installing message after build finish', async () => {
    await (async () => {
      const combinedStream = (0, (_BuckEventStream || _load_BuckEventStream()).combineEventStreams)('install', socketSubject, processSubject);
      const promise = combinedStream.toArray().toPromise();

      socketSubject.next({ type: 'progress', progress: 1 });
      processSubject.next({ type: 'log', message: 'skip', level: 'log' });
      processSubject.complete();

      const result = await promise;
      expect(result).toEqual([{ type: 'progress', progress: 1 }, { type: 'progress', progress: null }, { type: 'log', message: 'Installing...', level: 'info' }]);
    })();
  });
});