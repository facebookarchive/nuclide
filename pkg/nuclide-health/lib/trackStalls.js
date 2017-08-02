'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = trackStalls;

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

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

if (!(_electron.remote != null)) {
  throw new Error('Invariant violation: "remote != null"');
}

// The startup period naturally causes many event loop blockages.
// Don't start checking blockages until some time has passed.


const BLOCKED_GRACE_PERIOD = 30000;
// Report all blockages over this threshold.
const BLOCKED_MIN = 100;
// Discard overly long blockages as spurious (e.g. computer was asleep)
const BLOCKED_MAX = 600000;
// Block checking interval.
const BLOCKED_INTERVAL = 100;

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
  const browserWindow = _electron.remote.getCurrentWindow();
  const histogram = new (_nuclideAnalytics || _load_nuclideAnalytics()).HistogramTracker('event-loop-blocked',
  /* max */1000,
  /* buckets */10);

  let intentionalBlockTime = 0;
  const onIntentionalBlock = () => {
    intentionalBlockTime = Date.now();
  };

  let blockedInterval = null;
  function startBlockedCheck() {
    if (blockedInterval != null) {
      return;
    }
    let lastTime = Date.now();
    blockedInterval = setInterval(() => {
      const now = Date.now();
      if (document.hasFocus() && lastTime - intentionalBlockTime > BLOCKED_INTERVAL) {
        const delta = now - lastTime - BLOCKED_INTERVAL;
        if (delta > BLOCKED_MIN && delta < BLOCKED_MAX) {
          histogram.track(delta);
          (0, (_log4js || _load_log4js()).getLogger)('nuclide-health').warn(`Event loop was blocked for ${delta} ms`);
        }
      }
      lastTime = now;
    }, BLOCKED_INTERVAL);
  }

  function stopBlockedCheck() {
    if (blockedInterval != null) {
      clearInterval(blockedInterval);
      blockedInterval = null;
    }
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