var findVcsHelper = _asyncToGenerator(function* (src) {
  var options = {
    'cwd': (_path2 || _path()).default.dirname(src)
  };
  var hgResult = undefined;
  try {
    hgResult = yield (0, (_process2 || _process()).asyncExecute)('hg', ['root'], options);
  } catch (e) {
    hgResult = e;
  }

  if (hgResult.exitCode === 0) {
    return {
      vcs: 'hg',
      root: hgResult.stdout.trim()
    };
  }

  var gitResult = undefined;
  try {
    gitResult = yield (0, (_process2 || _process()).asyncExecute)('git', ['rev-parse', '--show-toplevel'], options);
  } catch (e) {
    gitResult = e;
  }

  if (gitResult.exitCode === 0) {
    return {
      vcs: 'git',
      root: gitResult.stdout.trim()
    };
  }

  throw new Error('Could not find VCS for: ' + src);
}

/**
 * For the given source file, find the type of vcs that is managing it as well
 * as the root directory for the VCS.
 */
);

var findVcs = _asyncToGenerator(function* (src) {
  var vcsInfo = vcsInfoCache[src];
  if (vcsInfo) {
    return vcsInfo;
  }

  vcsInfo = yield findVcsHelper(src);
  vcsInfoCache[src] = vcsInfo;
  return vcsInfo;
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _process2;

function _process() {
  return _process2 = require('./process');
}

var _path2;

function _path() {
  return _path2 = _interopRequireDefault(require('path'));
}

var vcsInfoCache = {};

module.exports = {
  findVcs: findVcs
};