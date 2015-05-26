'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {fsPromise} = require('nuclide-commons');
var path = require('path');


/**
 * @param repoPath The full path to the repository directory (.hg).
 */
function fetchCurrentBookmark(repoPath: string): Promise<string> {
  var bookmarkFile = path.join(repoPath, 'bookmarks.current');
  return fsPromise.readFile(bookmarkFile, 'utf-8');
}

module.exports = {
  fetchCurrentBookmark,
};
