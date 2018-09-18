"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = measurePerformance;

function _featureConfig() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons-atom/feature-config"));

  _featureConfig = function () {
    return data;
  };

  return data;
}

function _performanceNow() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons/performanceNow"));

  _performanceNow = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _xterm() {
  const data = require("xterm");

  _xterm = function () {
    return data;
  };

  return data;
}

function _analytics() {
  const data = require("../../../../nuclide-commons/analytics");

  _analytics = function () {
    return data;
  };

  return data;
}

function _config() {
  const data = require("./config");

  _config = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */
// Tune the parameters for performance measurement.
const SLOW_CANVAS_RENDER_THRESHOLD = 66; // in ms
// Always measure a certain number of initial frames.

const INITIAL_FRAMES_TO_MEASURE = 20; // But keep sampling after that.

const FRAME_SAMPLE_RATE = 10; // Take the average of the last N frames.

const FRAME_BUFFER_SIZE = INITIAL_FRAMES_TO_MEASURE;
/**
 * Track the performance of both terminal renderers and offer switching to
 * the DOM-based fallback if we detect slow canvas rendering.
 */

function measurePerformance(terminal) {
  const rendererType = terminal.getOption('rendererType');

  const rendererConfig = _featureConfig().default.get(_config().RENDERER_TYPE_CONFIG);

  let shouldPromptSlow = rendererType === 'canvas' && rendererConfig === 'auto'; // Similar to https://github.com/Microsoft/vscode/commit/84eb4778f18215d00608ccf8fb7649e6f2cd428a
  // However, we'll use a circular buffer to continuously measure performance over time.

  let frameTimeBuffer = new Array(FRAME_BUFFER_SIZE).fill(0);
  let frameTimeIndex = 0;
  let frameTimeSum = 0;
  let frameNumber = 0; // $FlowIgnore: using unofficial _core interface defined in https://github.com/Microsoft/vscode/blob/master/src/typings/vscode-xterm.d.ts#L682-L706

  const renderDebouncer = terminal._core.renderer._renderDebouncer;
  const originalRenderCallback = renderDebouncer._callback;

  const evaluateAverage = () => {
    const averageTime = frameTimeSum / frameTimeBuffer.length;
    (0, _analytics().track)('nuclide-terminal.render-performance', {
      averageTime,
      type: rendererType
    });

    if (shouldPromptSlow && averageTime > SLOW_CANVAS_RENDER_THRESHOLD) {
      shouldPromptSlow = false;
      const notification = atom.notifications.addWarning(`The terminal GPU-based rendering appears to be slow on your computer (average frame render time was ${averageTime.toFixed(2)}ms), do you want to use the fallback non-GPU renderer?`, {
        dismissable: true,
        buttons: [{
          text: 'Yes',
          onDidClick: () => {
            notification.dismiss();

            _featureConfig().default.set(_config().RENDERER_TYPE_CONFIG, 'dom');

            atom.notifications.addSuccess('All new terminals launched will use the non-GPU renderer');
          }
        }, {
          text: 'No',
          onDidClick: () => notification.dismiss()
        }, {
          text: "No, don't show again",
          onDidClick: () => {
            _featureConfig().default.set(_config().RENDERER_TYPE_CONFIG, 'canvas');

            notification.dismiss();
          }
        }]
      });
    }
  };

  renderDebouncer._callback = (start, end) => {
    frameNumber++;

    if ( // Don't measure the initial frame, as it might be slow.
    frameNumber === 1 || // Once we've measured INITIAL_FRAMES_TO_MEASURE, sample at FRAME_SAMPLE_RATE.
    frameNumber > INITIAL_FRAMES_TO_MEASURE + 1 && frameNumber % FRAME_SAMPLE_RATE !== 0) {
      // Note: RendererDebouncer's callback must be prebound.
      originalRenderCallback(start, end);
      return;
    }

    const startTime = (0, _performanceNow().default)();
    originalRenderCallback(start, end);
    process.nextTick(() => {
      const frameTime = (0, _performanceNow().default)() - startTime;
      frameTimeSum += frameTime - frameTimeBuffer[frameTimeIndex];
      frameTimeBuffer[frameTimeIndex] = frameTime;
      frameTimeIndex++;

      if (frameTimeIndex === FRAME_BUFFER_SIZE) {
        frameTimeIndex = 0; // Note: We could evaluate more frequently, if we wanted to.

        evaluateAverage();
      }
    });
  };

  return new (_UniversalDisposable().default)(() => {
    // Restore the original function.
    renderDebouncer._callback = originalRenderCallback; // Clear frame times because it won't be used again.

    frameTimeBuffer = [];
  });
}