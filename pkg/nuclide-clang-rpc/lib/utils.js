'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.memoryUsagePerPid = exports.guessBuildFile = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

// The file may be new. Look for a nearby BUCK or TARGETS file.
let guessBuildFile = exports.guessBuildFile = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (file) {
    const dir = (_nuclideUri || _load_nuclideUri()).default.dirname(file);
    let bestMatch = null;
    yield Promise.all(['BUCK', 'TARGETS', 'compile_commands.json'].map((() => {
      var _ref2 = (0, _asyncToGenerator.default)(function* (name) {
        const nearestDir = yield (_fsPromise || _load_fsPromise()).default.findNearestFile(name, dir);
        if (nearestDir != null) {
          const match = (_nuclideUri || _load_nuclideUri()).default.join(nearestDir, name);
          // Return the closest (most specific) match.
          if (bestMatch == null || match.length > bestMatch.length) {
            bestMatch = match;
          }
        }
      });

      return function (_x2) {
        return _ref2.apply(this, arguments);
      };
    })()));
    return bestMatch;
  });

  return function guessBuildFile(_x) {
    return _ref.apply(this, arguments);
  };
})();

// Strip off the extension and conventional suffixes like "Internal" and "-inl".


// Get memory usage for an array of process id's as a map.
let memoryUsagePerPid = exports.memoryUsagePerPid = (() => {
  var _ref3 = (0, _asyncToGenerator.default)(function* (pids) {
    const usage = new Map();
    if (pids.length >= 1) {
      try {
        const stdout = yield (0, (_process || _load_process()).runCommand)('ps', ['-p', pids.join(','), '-o', 'pid=', '-o', 'rss=']).toPromise();
        stdout.split('\n').forEach(function (line) {
          const parts = line.trim().split(/\s+/);
          if (parts.length === 2) {
            const [pid, rss] = parts.map(function (x) {
              return parseInt(x, 10);
            });
            usage.set(pid, rss);
          }
        });
      } catch (err) {
        // Ignore errors.
      }
    }
    return usage;
  });

  return function memoryUsagePerPid(_x3) {
    return _ref3.apply(this, arguments);
  };
})();

exports.isHeaderFile = isHeaderFile;
exports.isSourceFile = isSourceFile;
exports.commonPrefix = commonPrefix;
exports.getFileBasename = getFileBasename;

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('nuclide-commons/fsPromise'));
}

var _process;

function _load_process() {
  return _process = require('nuclide-commons/process');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const HEADER_EXTENSIONS = new Set(['.h', '.hh', '.hpp', '.hxx', '.h++']); /**
                                                                           * Copyright (c) 2015-present, Facebook, Inc.
                                                                           * All rights reserved.
                                                                           *
                                                                           * This source code is licensed under the license found in the LICENSE file in
                                                                           * the root directory of this source tree.
                                                                           *
                                                                           * 
                                                                           * @format
                                                                           */

const SOURCE_EXTENSIONS = new Set(['.c', '.cc', '.cpp', '.cxx', '.c++', '.m', '.mm']);

function isHeaderFile(filename) {
  return HEADER_EXTENSIONS.has((_nuclideUri || _load_nuclideUri()).default.extname(filename));
}

function isSourceFile(filename) {
  return SOURCE_EXTENSIONS.has((_nuclideUri || _load_nuclideUri()).default.extname(filename));
}

function commonPrefix(a, b) {
  let len = 0;
  while (len < a.length && len < b.length && a[len] === b[len]) {
    len++;
  }
  return len;
}function getFileBasename(file) {
  let basename = (_nuclideUri || _load_nuclideUri()).default.basename(file);
  const ext = basename.lastIndexOf('.');
  if (ext !== -1) {
    basename = basename.substr(0, ext);
  }
  return basename.replace(/(Internal|-inl)$/, '');
}