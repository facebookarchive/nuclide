"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = replaceInFile;

var _fs = _interopRequireDefault(require("fs"));

function _temp() {
  const data = _interopRequireDefault(require("temp"));

  _temp = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _event() {
  const data = require("../../../modules/nuclide-commons/event");

  _event = function () {
    return data;
  };

  return data;
}

function _fsPromise() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/fsPromise"));

  _fsPromise = function () {
    return data;
  };

  return data;
}

function _stream() {
  const data = require("../../../modules/nuclide-commons/stream");

  _stream = function () {
    return data;
  };

  return data;
}

function _observable() {
  const data = require("../../../modules/nuclide-commons/observable");

  _observable = function () {
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
// Returns the number of replacements made.
function replaceInFile(path, regex, replacement) {
  return _RxMin.Observable.defer(() => {
    const readStream = _fs.default.createReadStream(path); // Write the replaced output to a temporary file.
    // We'll overwrite the original when we're done.


    const tempStream = _temp().default.createWriteStream(); // $FlowIssue: fs.WriteStream contains a path.


    const tempPath = tempStream.path;
    return _RxMin.Observable.concat( // Replace the output line-by-line. This obviously doesn't work for multi-line regexes,
    // but this mimics the behavior of Atom's `scandal` find-and-replace backend.
    (0, _observable().splitStream)((0, _stream().observeStream)(readStream)).map(line => {
      const matches = line.match(regex);

      if (matches != null) {
        tempStream.write(line.replace(regex, replacement));
        return matches.length;
      }

      tempStream.write(line);
      return 0;
    }).reduce((acc, curr) => acc + curr, 0), // Wait for the temporary file to finish.
    // We need to ensure that the event handler is attached before end().
    _RxMin.Observable.create(observer => {
      const disposable = (0, _event().attachEvent)(tempStream, 'finish', () => {
        observer.complete();
      });
      tempStream.end();
      return () => disposable.dispose();
    }), // Copy the permissions from the orignal file.
    _RxMin.Observable.defer(() => copyPermissions(path, tempPath)).ignoreElements(), // Overwrite the original file with the temporary file.
    _RxMin.Observable.defer(() => _fsPromise().default.mv(tempPath, path)).ignoreElements()).catch(err => {
      // Make sure we clean up the temporary file if an error occurs.
      _fsPromise().default.unlink(tempPath).catch(() => {});

      return _RxMin.Observable.throw(err);
    });
  });
}

async function copyPermissions(from, to) {
  const {
    mode
  } = await _fsPromise().default.stat(from);
  await _fsPromise().default.chmod(to, mode);
}