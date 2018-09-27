"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.readCompilationFlags = readCompilationFlags;
exports.fallbackReadCompilationFlags = fallbackReadCompilationFlags;

var _fs = _interopRequireDefault(require("fs"));

function _fsPromise() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/fsPromise"));

  _fsPromise = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _stream() {
  const data = require("../../../modules/nuclide-commons/stream");

  _stream = function () {
    return data;
  };

  return data;
}

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
// Remark: this approach will fail if a { or }
// appears in a string (e.g. in a filename), fall back to JSON.parse otherwise.
function readCompilationFlags(flagsFile) {
  // For some real-world numbers:
  // 1. 217 MB compilation db with 330 entries,
  //    - full read: 1400ms
  //    - chunked read: 1800ms
  // 2. 434 MB compilation db with 660 entries,
  //    -  full read: "Error: toString() failed"
  //    -  chunked read: 4500ms
  return _RxMin.Observable.create(subscriber => {
    let chunk = '';

    function emitChunk() {
      try {
        subscriber.next(JSON.parse(chunk));
      } catch (e) {
        subscriber.error(e);
      }

      chunk = '';
    }

    function handleChunk(data) {
      if (chunk.length === 0) {
        // If the chunk is empty we look for the opening brace.
        const start = data.indexOf('{');

        if (start !== -1) {
          chunk = '{';
          return handleChunk(data.slice(start + 1));
        }
      } else {
        // We are currently in a chunk so look for the end.
        const end = data.indexOf('}');

        if (end !== -1) {
          chunk += data.slice(0, end + 1);
          emitChunk();
          handleChunk(data.slice(end + 1));
        } else {
          chunk += data;
        }
      }
    }

    return (0, _stream().observeStream)(_fs.default.createReadStream(flagsFile)).subscribe(handleChunk, subscriber.error.bind(subscriber), subscriber.complete.bind(subscriber));
  });
}

async function fallbackReadCompilationFlags(flagsFile) {
  const contents = await _fsPromise().default.readFile(flagsFile);
  return JSON.parse(contents.toString());
}