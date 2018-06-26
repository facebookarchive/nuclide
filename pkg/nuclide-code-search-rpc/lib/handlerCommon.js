'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BUFFER_SIZE_LIMIT = undefined;
exports.observeGrepLikeProcess = observeGrepLikeProcess;
exports.mergeOutputToResults = mergeOutputToResults;

var _collection;

function _load_collection() {
  return _collection = require('../../../modules/nuclide-commons/collection');
}

var _process;

function _load_process() {
  return _process = require('../../../modules/nuclide-commons/process');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../modules/nuclide-commons/UniversalDisposable'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const BUFFER_SIZE_LIMIT = exports.BUFFER_SIZE_LIMIT = 1000 * 1000 * 50; // 50 MB

// Grep and related tools (ack, rg) have exit code 1 with no results.
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

function observeGrepLikeProcess(command, args, cwd) {
  return (0, (_process || _load_process()).observeProcess)(command, args, {
    cwd,
    maxBuffer: BUFFER_SIZE_LIMIT,
    // An exit code of 0 or 1 is normal for grep-like tools.
    isExitError: ({ exitCode, signal }) => {
      return (
        // flowlint-next-line sketchy-null-string:off
        !signal && (exitCode == null || exitCode > 1)
      );
    }
  });
}

// Parse each line of output and construct code search results.
function mergeOutputToResults(processOutput, parse, regex, leadingLines, trailingLines) {
  const parsedResults = processOutput.concatMap(parse).publish();
  return _rxjsBundlesRxMinJs.Observable.create(observer => {
    const subscription = parsedResults.buffer(parsedResults.distinct(result => result.file).concat(_rxjsBundlesRxMinJs.Observable.of(null))).concatMap(results => {
      // Build map from line number to line contents.
      const lineMap = new Map(results.map(line => [line.row, line.line]));
      // Return array of line contents for lines [fr, to). Skip undefined lines.
      function getLines(fr, to) {
        const lineContents = [];
        for (let _line = fr; _line < to; _line++) {
          const t = lineMap.get(_line);
          if (t != null) {
            lineContents.push(t);
          }
        }
        return lineContents;
      }
      // run input regex on each line and emit CodeSearchResult for each match
      return _rxjsBundlesRxMinJs.Observable.from((0, (_collection || _load_collection()).arrayFlatten)(results.map(parseResult => {
        const { file, row, line } = parseResult;
        const allMatches = [];
        let match = regex.exec(line);
        while (match != null) {
          // Some invalid regex (e.g. /||/g) will always match,
          // but with an empty match string, so the exec loop becomes infinite.
          // Check for this case and abort early.
          if (match[0].length === 0) {
            break;
          }
          allMatches.push({
            file,
            row,
            line,
            column: match.index,
            matchLength: match[0].length,
            leadingContext: getLines(row - leadingLines, row),
            trailingContext: getLines(row + 1, row + trailingLines + 1)
          });
          if (!regex.global) {
            // looping exec on a non-global regex is an infinite loop.
            break;
          }
          match = regex.exec(line);
        }
        regex.lastIndex = 0;
        return allMatches;
      })));
    }).subscribe(observer);
    const processSubscription = parsedResults.connect();
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(subscription, processSubscription);
  });
}