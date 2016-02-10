'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

export type HealthStats = {
  rss: number,
  heapUsed: number,
  heapTotal: number,
  heapPercentage: number,
  cpuPercentage: number,
  lastKeyLatency: number,
  activeHandles: number,
  activeRequests: number,
};
