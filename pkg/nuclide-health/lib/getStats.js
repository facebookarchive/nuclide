Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = getStats;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _os2;

function _os() {
  return _os2 = _interopRequireDefault(require('os'));
}

function getStats() {
  var stats = process.memoryUsage(); // RSS, heap and usage.
  var activeHandles = getActiveHandles();
  var activeHandlesByType = getActiveHandlesByType(Array.from(activeHandles));

  return _extends({}, stats, {
    heapPercentage: 100 * stats.heapUsed / stats.heapTotal, // Just for convenience.
    cpuPercentage: (_os2 || _os()).default.loadavg()[0], // 1 minute CPU average.
    activeHandles: activeHandles.length,
    activeRequests: getActiveRequests().length,
    activeHandlesByType: activeHandlesByType
  });
}

// These two functions are to defend against undocumented Node functions.
function getActiveHandles() {
  // $FlowFixMe: Private method
  return process._getActiveHandles();
}

function getActiveHandlesByType(handles) {
  var activeHandlesByType = {
    childprocess: [],
    tlssocket: [],
    other: []
  };
  getTopLevelHandles(handles).filter(function (handle) {
    var type = handle.constructor.name.toLowerCase();
    if (type !== 'childprocess' && type !== 'tlssocket') {
      type = 'other';
    }
    activeHandlesByType[type].push(handle);
  });
  return activeHandlesByType;
}

// Returns a list of handles which are not children of others (i.e. sockets as process pipes).
function getTopLevelHandles(handles) {
  var topLevelHandles = [];
  var seen = new Set();
  handles.forEach(function (handle) {
    if (seen.has(handle)) {
      return;
    }
    seen.add(handle);
    topLevelHandles.push(handle);
    if (handle.constructor.name === 'ChildProcess') {
      seen.add(handle);
      ['stdin', 'stdout', 'stderr', '_channel'].forEach(function (pipe) {
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
module.exports = exports.default;