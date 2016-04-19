'use strict';
/* @noflow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

// TODO(asuarez): Track deferred requires to correctly attribute load times.

const assert = require('assert');
const Module = require('module');
const path = require('path');

const _real_ModuleLoad = Module._load;

const basedir = path.join(require.resolve('../../package.json'), '../');
assert(path.isAbsolute(basedir));
assert(basedir.endsWith(path.sep));

let running = false;
let data = null;
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

  const entry = {
    depth: 1,
    duration: 0,
    order: data.length + 1,
    basedir: basedir,
    filename: _filename,
  };
  data.push(entry);

  const time = process.hrtime();
  const _exports = _real_ModuleLoad.call(Module, request, parent, isMain);
  const diff = process.hrtime(time);

  const _module = parent.children.find(child => child.exports === _exports);
  assert(Module._cache[_filename] === _module);

  // diff: [seconds, nanoseconds]
  entry.duration = parseFloat((diff[0] * 1e3 + diff[1] / 1e6).toFixed(2));

  // Number of requires within Nuclide that it took to load this module
  for (let next = _module.parent; next !== null; next = next.parent) {
    if (next.filename.startsWith(basedir)) {
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
  data = [];
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
  data = startTime = stopTime = null;
  return profile;
};
