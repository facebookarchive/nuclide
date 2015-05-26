'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
var {asyncExecute} = require('./process');
var path = require('path');

var vcsInfoCache = {};

async function findVcsHelper(src) {
  var options = {
    'cwd': path.dirname(src),
  };
  try {
    var hgResult = await asyncExecute('hg', ['root'], options);
  } catch (e) {
    hgResult = e;
  }

  if (hgResult.exitCode === 0) {
    return {
      vcs: 'hg',
      root: hgResult.stdout.trim(),
    };
  }

  var gitResult;
  try {
    gitResult = await asyncExecute('git', ['rev-parse', '--show-toplevel'], options);
  } catch (e) {
    gitResult = e;
  }

  if (gitResult.exitCode === 0) {
    return {
      vcs: 'git',
      root: gitResult.stdout.trim(),
    };
  }

  throw new Error('Could not find VCS for: ' + src);
}

module.exports = {
  /**
   * For the given source file, find the type of vcs that is managing it as well
   * as the root directory for the VCS.
   */
  async findVcs(src) {
    var vcsInfo = vcsInfoCache[src];
    if (vcsInfo) {
      return vcsInfo;
    }

    vcsInfo = await findVcsHelper(src);
    vcsInfoCache[src] = vcsInfo;
    return vcsInfo;
  },

};
