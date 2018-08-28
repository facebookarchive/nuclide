"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createFileSearcher = createFileSearcher;

var _path = _interopRequireDefault(require("path"));

function _process() {
  const data = require("../nuclide-commons/process");

  _process = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */
// Limit the number of file search results that are sent back to the client.
const MAX_RESULTS = 20;

/** Creates a new FileSearcher for the local host. */
async function createFileSearcher() {
  return new FileSearcherProxy();
}
/**
 * FileSearcher that creates a cache of directories to DirectoryFileSearchers.
 * It forwards search requests to the appropriate DirectoryFileSearcher,
 * creating a new one, if necessary.
 *
 * In practice, we expect most search requests from the client to be rooted at
 * the same directory. Because it takes a bit of work to create a
 * DirectoryFileSearcher (and because the DirectoryFileSearchers may be
 * stateful), it makes sense to keep them around.
 */


class FileSearcherProxy {
  constructor() {
    this._searchers = new Map();
  }

  search(directory, query) {
    let searcherPromise = this._searchers.get(directory);

    if (searcherPromise == null) {
      searcherPromise = getFileSearcherForDirectory(directory);

      this._searchers.set(directory, searcherPromise);
    }

    return searcherPromise.then(searcher => searcher.search(query));
  }

}

async function getFileSearcherForDirectory(directoryToSearch) {
  try {
    // $FlowFB
    const {
      getCustomFileSearcher
    } = require("./fb-CustomFileSearcher");

    const searcher = await getCustomFileSearcher(directoryToSearch);

    if (searcher != null) {
      return searcher;
    }
  } catch (err) {}

  return new FindAndGrepFileSearcher(directoryToSearch);
}
/** Crude file search using `find` and `grep`. */


class FindAndGrepFileSearcher {
  /** Absolute path of the directory that will be searched by this searcher. */
  constructor(directoryToSearch) {
    this._directoryToSearch = directoryToSearch;
  }

  async search(query) {
    const findArgs = ['.', '-type', 'f', '-iname', `*${query}*`];
    const stdout = await (0, _process().runCommand)('find', findArgs, {
      cwd: this._directoryToSearch
    }).toPromise();
    const lines = stdout.split('\n').slice(0, MAX_RESULTS); // Trim lines and return non-empty ones. Each resulting line should be
    // a path relative to _directoryToSearch.

    return lines.map(x => _path.default.join(this._directoryToSearch, x)).filter(line => line.length > 0);
  }

}