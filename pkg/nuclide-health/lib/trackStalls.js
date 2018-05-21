/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import observeStalls from '../../commons-atom/observeStalls';
import {HistogramTracker} from '../../nuclide-analytics';

export default function trackStalls(): IDisposable {
  const histogram = new HistogramTracker(
    'event-loop-blocked',
    /* max */ 1000,
    /* buckets */ 10,
  );

  return new UniversalDisposable(
    histogram,
    observeStalls().subscribe(duration => histogram.track(duration)),
  );
}
