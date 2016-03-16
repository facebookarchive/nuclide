'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const BATCH_EVENT = 'batch';

import {BatchProcessedQueue} from '../../nuclide-commons';

type TrackEvent = {
  key: string;
  values: {[key: string]: string};
};

const REPORTING_PERIOD = 1000;

// Features:
//  Immediate reporting of first time failure.
//  Periodic reporting of successes and subsequent failures.
export class AnalyticsBatcher {
  _queue: BatchProcessedQueue<TrackEvent>;
  _track: (eventName: string, values: {[key: string]: string}) => Promise<mixed>;

  constructor(track: (eventName: string, values: {[key: string]: string}) => Promise<mixed>) {
    this._track = track;
    this._queue = new BatchProcessedQueue(
      REPORTING_PERIOD,
      events => {
        this._handleBatch(events);
      });
  }

  _handleBatch(events: Array<TrackEvent>): void {
    this._track(BATCH_EVENT, { events: JSON.stringify(events) });
  }

  track(key: string, values: {[key: string]: string}): void {
    this._queue.add({key, values});
  }

  dispose(): void {
    this._queue.dispose();
  }
}
