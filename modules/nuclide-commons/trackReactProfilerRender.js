/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow strict-local
 * @format
 */

import {trackSampled} from './analytics';

const SAMPLE_RATE = 10;

export default function trackReactProfilerRender(
  id: string,
  phase: string,
  actualTime: number,
  baseTime: number,
  startTime: number,
  commitTime: number,
) {
  trackSampled('react-profiler', SAMPLE_RATE, {
    id,
    phase,
    actualTime,
    baseTime,
    startTime,
    commitTime,
  });
}
