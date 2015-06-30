'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var scanhandler = require('./scanhandler');
var path = require('path');

class LocalFindInProjectService {
  async search(
    directory: NuclideUri,
    regex: string
  ): Promise<Array<{
    filePath: NuclideUri;
    matches: Array<{lineText: string; lineTextOffset: number; matchText: string; range: Array<Array<number>>}>;
  }>> {
    var results = await scanhandler.search(directory, regex);
    results.forEach(result => result.filePath = path.join(directory, result.filePath));
    return results;
  }
}

module.exports = LocalFindInProjectService;
