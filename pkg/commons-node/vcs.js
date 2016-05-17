'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {asyncExecute} from './process';
import path from 'path';

type VcsInfo = {
  vcs: string;
  root: string;
};

const vcsInfoCache: {[src: string]: VcsInfo} = {};

async function findVcsHelper(src: string): Promise<VcsInfo> {
  const options = {
    'cwd': path.dirname(src),
  };
  const hgResult = await asyncExecute('hg', ['root'], options);
  if (hgResult.exitCode === 0) {
    return {
      vcs: 'hg',
      root: hgResult.stdout.trim(),
    };
  }

  const gitResult = await asyncExecute('git', ['rev-parse', '--show-toplevel'], options);
  if (gitResult.exitCode === 0) {
    return {
      vcs: 'git',
      root: gitResult.stdout.trim(),
    };
  }

  throw new Error('Could not find VCS for: ' + src);
}

/**
 * For the given source file, find the type of vcs that is managing it as well
 * as the root directory for the VCS.
 */
export async function findVcs(src: string): Promise<VcsInfo> {
  let vcsInfo = vcsInfoCache[src];
  if (vcsInfo) {
    return vcsInfo;
  }

  vcsInfo = await findVcsHelper(src);
  vcsInfoCache[src] = vcsInfo;
  return vcsInfo;
}
