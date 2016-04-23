'use strict';
/* @noflow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const assert = require('assert');
const Module = require('module');
const path = require('path');

const _real_ModuleLoad = Module._load;

const basedir = path.join(require.resolve('../../package.json'), '../');
assert(path.isAbsolute(basedir));
assert(basedir.endsWith(path.sep));

let running = false;
let data = null;
let order = null;
let startTime = null;
let stopTime = null;

// This function shows up in stack traces - make the name distinct.
function profile_require_time(request, parent, isMain) {

  // https://github.com/nodejs/node/blob/v4.1.1/lib/module.js#L276
  if (request === 'internal/repl' || request === 'repl') {
    return _real_ModuleLoad.call(Module, request, parent, isMain);
  }

  const _filename = Module._resolveFilename(request, parent);

  // Skip modules outside of Nuclide
  if (!_filename.startsWith(basedir)) {
    return _real_ModuleLoad.call(Module, request, parent, isMain);
  }

  // Skip cached modules
  if (Module._cache[_filename]) {
    return Module._cache[_filename].exports;
  }

  const entry = data[_filename] = {
    depth: 1,
    init: 0,  // require time
    total: 0, // init + deferred require times
    order: ++order,
    basedir: basedir,
    filename: _filename,
    deferred: parent.loaded,
  };

  const time = process.hrtime();
  const _exports = _real_ModuleLoad.call(Module, request, parent, isMain);
  const diff = process.hrtime(time);

  const _module = parent.children.find(child => child.exports === _exports);
  if (_module == null) {
    // This can happen when `module.exports` is a getter.
    // See https://github.com/chalk/ansi-styles/blob/47ccb6/index.js#L128-L131
    return _exports;
  }

  // diff: [seconds, nanoseconds]
  entry.init = entry.total = diff[0] * 1e3 + diff[1] / 1e6;

  for (let next = _module.parent; next !== null; next = next.parent) {
    if (next.filename.startsWith(basedir)) {
      if (next.loaded && data[next.filename]) {
        // Account for deferred require load times.
        data[next.filename].total += entry.total;
      }
      // Number of requires within Nuclide that it took to load this module.
      entry.depth++;
    }
  }

  return _exports;
}

exports.start = function() {
  if (running === true) {
    throw new Error('profile-require-time already running.');
  }
  running = true;
  data = {};
  order = 0;
  startTime = Date.now();
  Module._load = profile_require_time;
};

exports.stop = function() {
  if (running === false) {
    throw new Error('profile-require-time is not running.');
  }
  running = false;
  stopTime = Date.now();
  Module._load = _real_ModuleLoad;
  const profile = {data, startTime, stopTime};
  data = order = startTime = stopTime = null;
  return profile;
};
