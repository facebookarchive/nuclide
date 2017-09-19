'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getGeneratedFileTypes = exports.getGeneratedFileType = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let getGeneratedFileType = exports.getGeneratedFileType = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (filePath, forceUpdate = false) {
    if (!forceUpdate) {
      const cachedType = cache.get(filePath);

      if (cachedType != null) {
        return cachedType;
      }
    }

    if (matchesGeneratedPaths(filePath)) {
      cache.set(filePath, 'generated');
      return 'generated';
    }

    const dirPath = (_nuclideUri || _load_nuclideUri()).default.dirname(filePath);
    const filename = (_nuclideUri || _load_nuclideUri()).default.basename(filePath);
    const fileTags = yield findTaggedFiles(dirPath, [filename]);

    const tag = fileTags.get(filename);
    if (tag == null) {
      cache.set(filePath, 'manual');
      return 'manual';
    }

    cache.set(filePath, tag);
    return tag;
  });

  return function getGeneratedFileType(_x) {
    return _ref.apply(this, arguments);
  };
})();

let getGeneratedFileTypes = exports.getGeneratedFileTypes = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* (dirPath) {
    const fileTypes = new Map();
    const uncheckedFiles = [];
    if (!(_nuclideUri || _load_nuclideUri()).default.isInArchive(dirPath) && !(_nuclideUri || _load_nuclideUri()).default.hasKnownArchiveExtension(dirPath)) {
      const files = yield (_fsPromise || _load_fsPromise()).default.readdir(dirPath);
      for (const file of files) {
        const filePath = (_nuclideUri || _load_nuclideUri()).default.join(dirPath, file);
        const cachedType = cache.get(filePath);
        if (cachedType != null) {
          fileTypes.set(filePath, cachedType);
        } else {
          uncheckedFiles.push(file);
        }
      }
    }

    if (uncheckedFiles.length === 0) {
      return fileTypes;
    }

    const fileTags = yield findTaggedFiles(dirPath, uncheckedFiles);

    for (const file of uncheckedFiles) {
      const filePath = (_nuclideUri || _load_nuclideUri()).default.join(dirPath, file);
      const tag = fileTags.get(file);
      if (tag == null) {
        cache.set(filePath, 'manual');
        fileTypes.set(filePath, 'manual');
      } else {
        cache.set(filePath, tag);
        fileTypes.set(filePath, tag);
      }
    }

    return fileTypes;
  });

  return function getGeneratedFileTypes(_x2) {
    return _ref2.apply(this, arguments);
  };
})();

// 1000 entries should allow for a good number of open directories


var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _lruCache;

function _load_lruCache() {
  return _lruCache = _interopRequireDefault(require('lru-cache'));
}

var _process;

function _load_process() {
  return _process = require('nuclide-commons/process');
}

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('nuclide-commons/fsPromise'));
}

var _config;

function _load_config() {
  return _config = require('./config');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// the first group will be greedy, so best not to use ':' in generated file tags
const GREP_PARSE_PATTERN = /^(.*):(.*)$/; /**
                                           * Copyright (c) 2015-present, Facebook, Inc.
                                           * All rights reserved.
                                           *
                                           * This source code is licensed under the license found in the LICENSE file in
                                           * the root directory of this source tree.
                                           *
                                           * 
                                           * @format
                                           */

const cache = new (_lruCache || _load_lruCache()).default({ max: 1000 });

function findTaggedFiles(dirPath, filenames) {
  const command = 'grep';
  const pattern = (_config || _load_config()).config.generatedTag + '\\|' + (_config || _load_config()).config.partialGeneratedTag;
  const filesToGrep = filenames.length === 0 ? ['*'] : filenames;
  const args = ['-HId', 'skip', pattern, ...filesToGrep];
  const options = {
    cwd: dirPath,
    isExitError: ({ exitCode, signal }) => {
      return signal != null && (exitCode == null || exitCode > 1);
    }
  };
  return (0, (_process || _load_process()).runCommand)(command, args, options).map(stdout => {
    const fileTags = new Map();
    for (const line of stdout.split('\n')) {
      const match = line.match(GREP_PARSE_PATTERN);
      if (match != null && match.length === 3) {
        const filename = match[1];
        const tag = match[2];
        if (tag === (_config || _load_config()).config.generatedTag) {
          fileTags.set(filename, 'generated');
        } else if (tag === (_config || _load_config()).config.partialGeneratedTag && fileTags.get(filename) !== 'generated') {
          fileTags.set(filename, 'partial');
        }
      }
    }
    return fileTags;
  }).toPromise();
}

function matchesGeneratedPaths(filePath) {
  return (_config || _load_config()).config.generatedPathRegexes.some(regexp => regexp.test(filePath));
}