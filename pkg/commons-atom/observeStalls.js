"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _nullthrows() {
  const data = _interopRequireDefault(require("nullthrows"));

  _nullthrows = function () {
    return data;
  };

  return data;
}

var _electron = require("electron");

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _observableDom() {
  const data = require("../../modules/nuclide-commons-ui/observable-dom");

  _observableDom = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _once() {
  const data = _interopRequireDefault(require("../commons-node/once"));

  _once = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

/* eslint-env browser */
if (!(_electron.remote != null)) {
  throw new Error("Invariant violation: \"remote != null\"");
}

const CHROME_VERSION = Number((0, _nullthrows().default)(process.versions.chrome).split('.')[0]); // The startup period naturally causes many event loop blockages.
// Don't start checking blockages until some time has passed.

const BLOCKED_GRACE_PERIOD = 30; // Report all blockages over this threshold.

const BLOCKED_MIN = 100; // Discard overly long blockages as spurious (e.g. computer was asleep)

const BLOCKED_MAX = 600000; // Range padding on either side of long task interval.
// If an intentional block timestamp lies in this range,
// we consider it intentional.

const BLOCKED_RANGE_PADDING = 15; // Share + cache the observable.

const observeStalls = (0, _once().default)(() => {
  const browserWindow = _electron.remote.getCurrentWindow();

  let intentionalBlockTime = 0;

  const onIntentionalBlock = () => {
    intentionalBlockTime = performance.now();
  };

  const blockedEvents = new (_observableDom().PerformanceObservable)({
    entryTypes: ['longtask']
  }).flattenEntries() // only count if the window is focused when the task ran long
  .filter(() => document.hasFocus()) // discard early longtasks as the app is booting
  .filter(() => process.uptime() > BLOCKED_GRACE_PERIOD) // early versions of chromium report times in *microseconds* instead of
  // milliseconds!
  .map(entry => CHROME_VERSION <= 56 ? {
    duration: entry.duration / 1000,
    startTime: entry.startTime / 1000
  } : entry) // discard durations that are unrealistically long, or those that aren't
  // meaningful enough
  .filter(entry => entry.duration > BLOCKED_MIN && entry.duration < BLOCKED_MAX) // discard events that result from user interaction actually blocking the
  // thread when there is no other option (e.g. context menus)
  .filter(entry => // did the intentionalblocktime occur between the start and end,
  // accounting for some extra padding?
  !(intentionalBlockTime > entry.startTime - BLOCKED_RANGE_PADDING && intentionalBlockTime < entry.startTime + entry.duration + BLOCKED_RANGE_PADDING));
  return _RxMin.Observable.using(() => new (_UniversalDisposable().default)( // Confirmation dialogs also block the event loop.
  // This typically happens when you're about to close an unsaved file.
  atom.workspace.onWillDestroyPaneItem(onIntentionalBlock), // Electron context menus block the event loop.
  _RxMin.Observable.fromEvent(browserWindow, 'context-menu') // There appears to be an race with browser window shutdown where
  // the 'context-menu' event fires after window destruction.
  // Try to prevent this by removing the event on close.
  // https://github.com/facebook/nuclide/issues/1246
  .takeUntil(_RxMin.Observable.fromEvent(browserWindow, 'close')).subscribe(onIntentionalBlock)), () => {
    return _RxMin.Observable.merge( // kick off subscription with a one-time query on start
    _RxMin.Observable.of(document.hasFocus()), _RxMin.Observable.fromEvent(browserWindow, 'focus').mapTo(true), _RxMin.Observable.fromEvent(browserWindow, 'blur').mapTo(false)).distinctUntilChanged().switchMap(isFocused => isFocused ? blockedEvents : _RxMin.Observable.empty()).map(entry => entry.duration);
  }).share();
});
var _default = observeStalls;
exports.default = _default;