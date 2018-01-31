'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = getStats;

var _os = _interopRequireDefault(require('os'));

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

function getStats() {
  const stats = process.memoryUsage(); // RSS, heap and usage.
  const activeHandles = getActiveHandles();
  const activeHandlesByType = getActiveHandlesByType(Array.from(activeHandles));

  return Object.assign({}, stats, {
    heapPercentage: 100 * stats.heapUsed / stats.heapTotal, // Just for convenience.
    cpuPercentage: _os.default.loadavg()[0], // 1 minute CPU average.
    activeHandles: activeHandles.length,
    activeRequests: getActiveRequests().length,
    activeHandlesByType
  });
}

// These two functions are to defend against undocumented Node functions.
function getActiveHandles() {
  // $FlowFixMe: Private method
  return process._getActiveHandles();
}

function getActiveHandlesByType(handles) {
  const activeHandlesByType = {
    childprocess: [],
    tlssocket: [],
    other: []
  };
  getTopLevelHandles(handles).filter(handle => {
    let type = handle.constructor.name.toLowerCase();
    if (type !== 'childprocess' && type !== 'tlssocket') {
      type = 'other';
    }
    activeHandlesByType[type].push(handle);
  });
  return activeHandlesByType;
}

// Returns a list of handles which are not children of others (i.e. sockets as process pipes).
function getTopLevelHandles(handles) {
  const topLevelHandles = [];
  const seen = new Set();
  handles.forEach(handle => {
    if (seen.has(handle)) {
      return;
    }
    seen.add(handle);
    topLevelHandles.push(handle);
    if (handle.constructor.name === 'ChildProcess') {
      seen.add(handle);
      ['stdin', 'stdout', 'stderr', '_channel'].forEach(pipe => {
        if (handle[pipe]) {
          seen.add(handle[pipe]);
        }
      });
    }
  });
  return topLevelHandles;
}

function getActiveRequests() {
  // $FlowFixMe: Private method.
  return process._getActiveRequests();
}