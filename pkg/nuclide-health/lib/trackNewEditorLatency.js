'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = trackNewEditorLatency;

var _atom = require('atom');

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../modules/nuclide-commons/UniversalDisposable'));
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const HISTOGRAM_MAX = 1000; /**
                             * Copyright (c) 2015-present, Facebook, Inc.
                             * All rights reserved.
                             *
                             * This source code is licensed under the license found in the LICENSE file in
                             * the root directory of this source tree.
                             *
                             *  strict-local
                             * @format
                             */

/* global performance */

const HISTOGRAM_BUCKETS = 10;
const HISTOGRAM_INTERVAL_SEC = 10 * 60;

function trackNewEditorLatency() {
  const openEditorTracking = new (_nuclideAnalytics || _load_nuclideAnalytics()).HistogramTracker('open-editor', HISTOGRAM_MAX, HISTOGRAM_BUCKETS, HISTOGRAM_INTERVAL_SEC);
  const switchEditorTracking = new (_nuclideAnalytics || _load_nuclideAnalytics()).HistogramTracker('switch-editor', HISTOGRAM_MAX, HISTOGRAM_BUCKETS, HISTOGRAM_INTERVAL_SEC);
  // Attempt to ensure that this is the first listener that fires.
  const unshift = true;
  let pendingEditors = 0;
  const disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(openEditorTracking, switchEditorTracking);
  disposables.add(atom.workspace.getCenter().paneContainer.emitter.on('did-add-pane-item', ({ item }) => {
    if (item instanceof _atom.TextEditor) {
      const startTime = performance.now();
      pendingEditors++;
      setImmediate(() => {
        openEditorTracking.track(performance.now() - startTime);
        pendingEditors--;
      });
    }
  }, unshift), atom.workspace.getCenter().observePanes(pane => {
    disposables.addUntilDestroyed(pane,
    // $FlowIgnore: emitter is private
    pane.emitter.on('did-change-active-item', item => {
      // Adding a new pane item also triggers 'did-change-active-item'.
      if (pendingEditors === 0 && item instanceof _atom.TextEditor) {
        const startTime = performance.now();
        setImmediate(() => {
          switchEditorTracking.track(performance.now() - startTime);
        });
      }
    }, unshift));
  }));
  return disposables;
}