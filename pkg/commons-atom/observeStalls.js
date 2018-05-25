'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _nullthrows;

function _load_nullthrows() {
  return _nullthrows = _interopRequireDefault(require('nullthrows'));
}

var _electron = require('electron');

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _observableDom;

function _load_observableDom() {
  return _observableDom = require('../../modules/nuclide-commons-ui/observable-dom');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../modules/nuclide-commons/UniversalDisposable'));
}

var _once;

function _load_once() {
  return _once = _interopRequireDefault(require('../commons-node/once'));
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
   *  strict-local
   * @format
   */

/* eslint-env browser */

const CHROME_VERSION = Number((0, (_nullthrows || _load_nullthrows()).default)(process.versions.chrome).split('.')[0]);

// The startup period naturally causes many event loop blockages.
// Don't start checking blockages until some time has passed.
const BLOCKED_GRACE_PERIOD = 30;
// Report all blockages over this threshold.
const BLOCKED_MIN = 100;
// Discard overly long blockages as spurious (e.g. computer was asleep)
const BLOCKED_MAX = 600000;
// Range padding on either side of long task interval.
// If an intentional block timestamp lies in this range,
// we consider it intentional.
const BLOCKED_RANGE_PADDING = 15;

// Share + cache the observable.
const observeStalls = (0, (_once || _load_once()).default)(() => {
  const browserWindow = _electron.remote.getCurrentWindow();

  let intentionalBlockTime = 0;
  const onIntentionalBlock = () => {
    intentionalBlockTime = performance.now();
  };

  const blockedEvents = new (_observableDom || _load_observableDom()).PerformanceObservable({ entryTypes: ['longtask'] }).flattenEntries()
  // only count if the window is focused when the task ran long
  .filter(() => document.hasFocus())
  // discard early longtasks as the app is booting
  .filter(() => process.uptime() > BLOCKED_GRACE_PERIOD)
  // early versions of chromium report times in *microseconds* instead of
  // milliseconds!
  .map(entry => CHROME_VERSION <= 56 ? {
    duration: entry.duration / 1000,
    startTime: entry.startTime / 1000
  } : entry)
  // discard durations that are unrealistically long, or those that aren't
  // meaningful enough
  .filter(entry => entry.duration > BLOCKED_MIN && entry.duration < BLOCKED_MAX)
  // discard events that result from user interaction actually blocking the
  // thread when there is no other option (e.g. context menus)
  .filter(entry =>
  // did the intentionalblocktime occur between the start and end,
  // accounting for some extra padding?
  !(intentionalBlockTime > entry.startTime - BLOCKED_RANGE_PADDING && intentionalBlockTime < entry.startTime + entry.duration + BLOCKED_RANGE_PADDING));

  return _rxjsBundlesRxMinJs.Observable.using(() => new (_UniversalDisposable || _load_UniversalDisposable()).default(
  // Confirmation dialogs also block the event loop.
  // This typically happens when you're about to close an unsaved file.
  atom.workspace.onWillDestroyPaneItem(onIntentionalBlock),
  // Electron context menus block the event loop.
  _rxjsBundlesRxMinJs.Observable.fromEvent(browserWindow, 'context-menu')
  // There appears to be an race with browser window shutdown where
  // the 'context-menu' event fires after window destruction.
  // Try to prevent this by removing the event on close.
  // https://github.com/facebook/nuclide/issues/1246
  .takeUntil(_rxjsBundlesRxMinJs.Observable.fromEvent(browserWindow, 'close')).subscribe(onIntentionalBlock)), () => {
    return _rxjsBundlesRxMinJs.Observable.merge(
    // kick off subscription with a one-time query on start
    _rxjsBundlesRxMinJs.Observable.of(document.hasFocus()), _rxjsBundlesRxMinJs.Observable.fromEvent(browserWindow, 'focus').mapTo(true), _rxjsBundlesRxMinJs.Observable.fromEvent(browserWindow, 'blur').mapTo(false)).distinctUntilChanged().switchMap(isFocused => isFocused ? blockedEvents : _rxjsBundlesRxMinJs.Observable.empty()).map(entry => entry.duration);
  }).share();
});

exports.default = observeStalls;