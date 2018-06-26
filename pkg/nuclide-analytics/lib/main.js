'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _HistogramTracker;

function _load_HistogramTracker() {
  return _HistogramTracker = require('./HistogramTracker');
}

Object.defineProperty(exports, 'HistogramTracker', {
  enumerable: true,
  get: function () {
    return (_HistogramTracker || _load_HistogramTracker()).HistogramTracker;
  }
});

var _analytics;

function _load_analytics() {
  return _analytics = require('../../../modules/nuclide-commons/analytics');
}

Object.defineProperty(exports, 'startTracking', {
  enumerable: true,
  get: function () {
    return (_analytics || _load_analytics()).startTracking;
  }
});
Object.defineProperty(exports, 'TimingTracker', {
  enumerable: true,
  get: function () {
    return (_analytics || _load_analytics()).TimingTracker;
  }
});
Object.defineProperty(exports, 'track', {
  enumerable: true,
  get: function () {
    return (_analytics || _load_analytics()).track;
  }
});
Object.defineProperty(exports, 'trackEvent', {
  enumerable: true,
  get: function () {
    return (_analytics || _load_analytics()).trackEvent;
  }
});
Object.defineProperty(exports, 'trackEvents', {
  enumerable: true,
  get: function () {
    return (_analytics || _load_analytics()).trackEvents;
  }
});
Object.defineProperty(exports, 'trackImmediate', {
  enumerable: true,
  get: function () {
    return (_analytics || _load_analytics()).trackImmediate;
  }
});
Object.defineProperty(exports, 'trackSampled', {
  enumerable: true,
  get: function () {
    return (_analytics || _load_analytics()).trackSampled;
  }
});
Object.defineProperty(exports, 'trackTiming', {
  enumerable: true,
  get: function () {
    return (_analytics || _load_analytics()).trackTiming;
  }
});
Object.defineProperty(exports, 'trackTimingSampled', {
  enumerable: true,
  get: function () {
    return (_analytics || _load_analytics()).trackTimingSampled;
  }
});
Object.defineProperty(exports, 'isTrackSupported', {
  enumerable: true,
  get: function () {
    return (_analytics || _load_analytics()).isTrackSupported;
  }
});