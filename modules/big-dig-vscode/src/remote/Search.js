"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.startSearchProviders = startSearchProviders;

function vscode() {
  const data = _interopRequireWildcard(require("vscode"));

  vscode = function () {
    return data;
  };

  return data;
}

var _path = _interopRequireDefault(require("path"));

function _event() {
  const data = require("../../../nuclide-commons/event");

  _event = function () {
    return data;
  };

  return data;
}

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _state() {
  const data = require("./state");

  _state = function () {
    return data;
  };

  return data;
}

function _ConnectionWrapper() {
  const data = require("../ConnectionWrapper");

  _ConnectionWrapper = function () {
    return data;
  };

  return data;
}

function _RemoteFileSystem() {
  const data = require("../RemoteFileSystem");

  _RemoteFileSystem = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 */
const logger = (0, _log4js().getLogger)('search');

function startSearchProviders() {
  const searcher = new Search();
  return vscode().workspace.registerSearchProvider('big-dig', searcher);
}

class Search {
  async provideFileSearchResults(query, options, progress, token) {
    // For compatibility with 1.23's provideFileSearchResults:
    // https://github.com/Microsoft/vscode/blob/1.23.1/src/vs/vscode.proposed.d.ts#L75
    if (typeof query === 'string') {
      await Promise.all((0, _state().getConnectedFilesystems)().map(({
        fs,
        conn
      }) => this._fileSearch(fs, conn, query, progress, token)));
    } else {
      // TODO: (hansonw) T31478806 Actually use the fields in FileSearchOptions.
      await Promise.all((0, _state().getConnectedFilesystems)().map(({
        fs,
        conn
      }) => this._fileSearch(fs, conn, query.pattern, progress, token)));
    }
  }

  async provideTextSearchResults(query, options, progress, token) {
    await Promise.all((0, _state().getConnectedFilesystems)().map(({
      fs,
      conn
    }) => this._textSearch(fs, conn, query, options, progress, token)));
  }

  async _fileSearch(fs, conn, query, progress, token) {
    const basePaths = fs.getWorkspaceFolders().map(({
      uri
    }) => fs.uriToPath(uri));

    if (basePaths.length === 0) {
      // No work to do.
      return;
    }

    await Promise.all( // TODO(T29797318): the RPC should support multiple base paths
    basePaths.map(async path => {
      const results = await conn.searchForFiles(path, query);

      if (token.isCancellationRequested) {
        return;
      }

      for (const result of results.results) {
        progress.report(fs.pathToUri(result));
      }
    })).catch(error => logger.warn(`Could not search ${conn.getAddress()}: ${error.message}`));
  }

  async _textSearch(fs, conn, query, options, progress, token) {
    const paths = fs.getWorkspaceFolders().map(({
      uri
    }) => fs.uriToPath(uri));

    if (paths.length === 0) {
      // No work to do.
      return;
    } // TODO: (hansonw) T31478806 Use new fields in TextSearchOptions.


    const includes = getGlobalPatterns(options.includes);
    const excludes = getGlobalPatterns(options.excludes);
    const basePaths = paths.map(path => ({
      path,
      includes: [...includes, ...resolveGlobPatterns(path, options.includes)],
      excludes: [...excludes, ...resolveGlobPatterns(path, options.excludes)]
    }));
    return conn.searchForText({
      query: query.pattern,
      basePaths,
      options: {
        isRegExp: query.isRegExp || false,
        isCaseSensitive: query.isCaseSensitive || false,
        isWordMatch: query.isWordMatch || false
      }
    }).do(match => {
      progress.report({
        uri: fs.pathToUri(match.path),
        range: match.range,
        preview: Object.assign({}, match.preview, {
          text: match.preview.leading + match.preview.matching + match.preview.trailing,
          match: match.range
        })
      });
    }).takeUntil((0, _event().observableFromSubscribeFunction)(cb => token.onCancellationRequested(cb))).ignoreElements().toPromise().catch(error => logger.warn(`Could not search ${conn.getAddress()}: ${error.message}`));
  }

}
/**
 * Filters out the patterns that are specifically applicable under `basePath`.
 * Plain string patterns are also filtered. `RelativePattern` is filtered out if
 * its `base` is not a subpath of `basePath`.
 *
 * TODO(siegebell): this is our current best-guess on the semantics of
 * `RelativePattern`, but we need to double-check.
 */


function resolveGlobPatterns(basePath, patterns) {
  return patterns // Remove globally-applicable patterns:
  .map(pattern => typeof pattern === 'string' ? null : pattern).filter(Boolean) // Keep only patterns that are under `basePath`:
  .map(pattern => {
    const relPattern = _path.default.relative(basePath, pattern.base);

    if (relPattern == null || relPattern.startsWith('..')) {
      return null;
    } else {
      return pattern.pattern;
    }
  }).filter(Boolean);
}
/**
 * Extract the patterns that are global across all base paths (i.e. are not
 * `RelativePattern`s).
 */


function getGlobalPatterns(patterns) {
  return patterns.map(p => typeof p === 'string' ? p : null).filter(Boolean);
}