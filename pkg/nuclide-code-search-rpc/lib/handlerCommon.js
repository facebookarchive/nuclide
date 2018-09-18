"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.observeGrepLikeProcess = observeGrepLikeProcess;
exports.mergeOutputToResults = mergeOutputToResults;
exports.BUFFER_SIZE_LIMIT = void 0;

function _collection() {
  const data = require("../../../modules/nuclide-commons/collection");

  _collection = function () {
    return data;
  };

  return data;
}

function _process() {
  const data = require("../../../modules/nuclide-commons/process");

  _process = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
const BUFFER_SIZE_LIMIT = 1000 * 1000 * 50; // 50 MB
// Grep and related tools (ack, rg) have exit code 1 with no results.

exports.BUFFER_SIZE_LIMIT = BUFFER_SIZE_LIMIT;

function observeGrepLikeProcess(command, args, cwd) {
  return (0, _process().observeProcess)(command, args, {
    cwd,
    maxBuffer: BUFFER_SIZE_LIMIT,
    // An exit code of 0 or 1 is normal for grep-like tools.
    isExitError: ({
      exitCode,
      signal
    }) => {
      return (// flowlint-next-line sketchy-null-string:off
        !signal && (exitCode == null || exitCode > 1)
      );
    }
  });
} // Parse each line of output and construct code search results.


function mergeOutputToResults(processOutput, parse, regex, leadingLines, trailingLines) {
  const parsedResults = processOutput.concatMap(parse).publish();
  return _RxMin.Observable.create(observer => {
    const subscription = parsedResults.buffer(parsedResults.distinct(result => result.file).concat(_RxMin.Observable.of(null))).concatMap(results => {
      // Build map from line number to line contents.
      const lineMap = new Map(results.map(line => [line.row, line.line])); // Return array of line contents for lines [fr, to). Skip undefined lines.

      function getLines(fr, to) {
        const lineContents = [];

        for (let _line = fr; _line < to; _line++) {
          const t = lineMap.get(_line);

          if (t != null) {
            lineContents.push(t);
          }
        }

        return lineContents;
      } // run input regex on each line and emit CodeSearchResult for each match


      return _RxMin.Observable.from((0, _collection().arrayFlatten)(results.map(parseResult => {
        const {
          file,
          row,
          line
        } = parseResult;
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
    return new (_UniversalDisposable().default)(subscription, processSubscription);
  });
}