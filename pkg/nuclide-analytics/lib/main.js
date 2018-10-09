"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "HistogramTracker", {
  enumerable: true,
  get: function () {
    return _HistogramTracker().HistogramTracker;
  }
});
Object.defineProperty(exports, "startTracking", {
  enumerable: true,
  get: function () {
    return _analytics().startTracking;
  }
});
Object.defineProperty(exports, "TimingTracker", {
  enumerable: true,
  get: function () {
    return _analytics().TimingTracker;
  }
});
Object.defineProperty(exports, "track", {
  enumerable: true,
  get: function () {
    return _analytics().track;
  }
});
Object.defineProperty(exports, "trackEvent", {
  enumerable: true,
  get: function () {
    return _analytics().trackEvent;
  }
});
Object.defineProperty(exports, "trackEvents", {
  enumerable: true,
  get: function () {
    return _analytics().trackEvents;
  }
});
Object.defineProperty(exports, "trackImmediate", {
  enumerable: true,
  get: function () {
    return _analytics().trackImmediate;
  }
});
Object.defineProperty(exports, "trackSampled", {
  enumerable: true,
  get: function () {
    return _analytics().trackSampled;
  }
});
Object.defineProperty(exports, "trackTiming", {
  enumerable: true,
  get: function () {
    return _analytics().trackTiming;
  }
});
Object.defineProperty(exports, "trackTimingSampled", {
  enumerable: true,
  get: function () {
    return _analytics().trackTimingSampled;
  }
});
Object.defineProperty(exports, "isTrackSupported", {
  enumerable: true,
  get: function () {
    return _analytics().isTrackSupported;
  }
});

function _HistogramTracker() {
  const data = require("./HistogramTracker");

  _HistogramTracker = function () {
    return data;
  };

  return data;
}

function _analytics() {
  const data = require("../../../modules/nuclide-commons/analytics");

  _analytics = function () {
    return data;
  };

  return data;
}