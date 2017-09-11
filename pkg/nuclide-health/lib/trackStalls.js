'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = trackStalls;

var _nullthrows;

function _load_nullthrows() {
  return _nullthrows = _interopRequireDefault(require('nullthrows'));
}

var _electron = require('electron');

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

if (!(_electron.remote != null)) {
  throw new Error('Invariant violation: "remote != null"');
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */

/* eslint-env browser */
/* global PerformanceObserver */

const CHROME_VERSION = Number((0, (_nullthrows || _load_nullthrows()).default)(process.versions.chrome).split('.')[0]);

// The startup period naturally causes many event loop blockages.
// Don't start checking blockages until some time has passed.
const BLOCKED_GRACE_PERIOD = 30000;
// Report all blockages over this threshold.
const BLOCKED_MIN = 100;
// Discard overly long blockages as spurious (e.g. computer was asleep)
const BLOCKED_MAX = 600000;
// Range padding on either side of long task interval.
// If an intentional block timestamp lies in this range,
// we consider it intentional.
const BLOCKED_RANGE_PADDING = 15;

function trackStalls() {
  const disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();

  let blockedDelay = setTimeout(() => {
    disposables.add(trackStallsImpl());
    blockedDelay = null;
  }, BLOCKED_GRACE_PERIOD);

  disposables.add(() => {
    if (blockedDelay != null) {
      clearTimeout(blockedDelay);
    }
  });

  return disposables;
}

function trackStallsImpl() {
  if (!supportsPerformanceObserversWithLongTasks()) {
    return new (_UniversalDisposable || _load_UniversalDisposable()).default();
  }

  const browserWindow = _electron.remote.getCurrentWindow();
  const histogram = new (_nuclideAnalytics || _load_nuclideAnalytics()).HistogramTracker('event-loop-blocked',
  /* max */1000,
  /* buckets */10);

  let intentionalBlockTime = 0;
  const onIntentionalBlock = () => {
    intentionalBlockTime = performance.now();
  };

  // $FlowFixMe No definition for PerformanceObserver
  const longTaskObserver = new PerformanceObserver(list => {
    if (!document.hasFocus()) {
      return;
    }

    const entries = list.getEntries();
    for (const entry of entries) {
      let duration;
      let startTime;
      if (CHROME_VERSION <= 56) {
        // Old versions of chrome implement longtask perf observers,
        // but their duration is in units of whole *microseconds* instead of
        // *milliseconds* with fractional units
        duration = entry.duration / 1000;
        startTime = entry.startTime / 1000;
      } else {
        duration = entry.duration;
        startTime = entry.startTime;
      }

      const withinReasonableWindow = duration > BLOCKED_MIN && duration < BLOCKED_MAX;

      // did the intentionalblocktime occur between the start and end,
      // accounting for some extra padding?
      const wasBlockedIntentionally = intentionalBlockTime > startTime - BLOCKED_RANGE_PADDING && intentionalBlockTime < startTime + duration + BLOCKED_RANGE_PADDING;

      if (withinReasonableWindow && !wasBlockedIntentionally) {
        histogram.track(duration);
        (0, (_log4js || _load_log4js()).getLogger)('nuclide-health').warn(`Event loop was blocked for ${duration} ms`);
      }
    }
  });

  function startBlockedCheck() {
    longTaskObserver.observe({ entryTypes: ['longtask'] });
  }

  function stopBlockedCheck() {
    longTaskObserver.disconnect();
  }

  if (document.hasFocus()) {
    startBlockedCheck();
  }

  return new (_UniversalDisposable || _load_UniversalDisposable()).default(histogram,
  // Confirmation dialogs also block the event loop.
  // This typically happens when you're about to close an unsaved file.
  atom.workspace.onWillDestroyPaneItem(onIntentionalBlock),
  // Electron context menus block the event loop.
  _rxjsBundlesRxMinJs.Observable.fromEvent(browserWindow, 'context-menu')
  // There appears to be an race with browser window shutdown where
  // the 'context-menu' event fires after window destruction.
  // Try to prevent this by removing the event on close.
  // https://github.com/facebook/nuclide/issues/1246
  .takeUntil(_rxjsBundlesRxMinJs.Observable.fromEvent(browserWindow, 'close')).subscribe(onIntentionalBlock), _rxjsBundlesRxMinJs.Observable.fromEvent(browserWindow, 'focus').subscribe(startBlockedCheck), _rxjsBundlesRxMinJs.Observable.fromEvent(browserWindow, 'blur').subscribe(stopBlockedCheck), () => stopBlockedCheck());
}

function supportsPerformanceObserversWithLongTasks() {
  let testObserver;
  let failed;

  try {
    // $FlowFixMe No definition for PerformanceObserver
    testObserver = new PerformanceObserver(() => {});
    testObserver.observe({ entryTypes: ['longtask'] });
  } catch (e) {
    failed = true;
  } finally {
    if (testObserver != null) {
      testObserver.disconnect();
    }
  }

  return !failed;
}