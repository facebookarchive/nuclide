'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from 'nuclide-remote-uri';

class MerlinService {
  pushDotMerlinPath(path: NuclideUri): Promise<mixed> {
    return Promise.reject('Not implemented');
  }
  pushNewBuffer(name: NuclideUri, content: string): Promise<mixed> {
    return Promise.reject('Not implemented');
  }
  locate(path: NuclideUri, line: number, col: number, kind: string): Promise<{file: NuclideUri}> {
    return Promise.reject('Not implemented');
  }
  complete(path: NuclideUri, line: number, col: number, prefix: string): Promise<mixed> {
    return Promise.reject('Not implemented');
  }
}

module.exports = MerlinService;
