"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getGeneratedFileType = getGeneratedFileType;
exports.invalidateFileTypeCache = invalidateFileTypeCache;
exports.getGeneratedFileTypes = getGeneratedFileTypes;

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _lruCache() {
  const data = _interopRequireDefault(require("lru-cache"));

  _lruCache = function () {
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

function _fsPromise() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/fsPromise"));

  _fsPromise = function () {
    return data;
  };

  return data;
}

function _config() {
  const data = require("./config");

  _config = function () {
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
// assumes that filenames do not contain ':'
const GREP_PARSE_PATTERN = /^([^:]*):(.*)$/;

async function getGeneratedFileType(filePath, forceUpdate = false) {
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

  const dirPath = _nuclideUri().default.dirname(filePath);

  const filename = _nuclideUri().default.basename(filePath);

  const fileTags = await findTaggedFiles(dirPath, [filename]);
  let tag = fileTags.get(filename);

  if (tag == null) {
    tag = 'manual';
  }

  cache.set(filePath, tag);
  return tag;
}

async function invalidateFileTypeCache(filePath) {
  cache.del(filePath);
}

async function getGeneratedFileTypes(dirPath) {
  const fileTypes = new Map();
  const uncheckedFiles = [];

  if (!_nuclideUri().default.isInArchive(dirPath) && !_nuclideUri().default.hasKnownArchiveExtension(dirPath)) {
    const files = await _fsPromise().default.readdir(dirPath);

    for (const file of files) {
      const filePath = _nuclideUri().default.join(dirPath, file);

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

  const fileTags = await findTaggedFiles(dirPath, uncheckedFiles);

  for (const file of uncheckedFiles) {
    const filePath = _nuclideUri().default.join(dirPath, file);

    let tag = fileTags.get(file);

    if (tag != null) {
      fileTypes.set(filePath, tag);
    } else {
      if (matchesGeneratedPaths(filePath)) {
        tag = 'generated';
        fileTypes.set(filePath, tag);
      } else {
        tag = 'manual'; // don't send this across the wire; receiver should assume that if it gets
        // a response, any files in the directory that aren't specified are manual
      }
    }

    cache.set(filePath, tag);
  }

  return fileTypes;
} // 1000 entries should allow for a good number of open directories


const cache = new (_lruCache().default)({
  max: 1000
});

function getTagPattern(forWindows) {
  if (_config().config.generatedTag == null) {
    return _config().config.partialGeneratedTag;
  }

  if (_config().config.partialGeneratedTag == null) {
    return _config().config.generatedTag;
  }

  const separator = forWindows ? ' ' : '\\|';
  return _config().config.generatedTag + separator + _config().config.partialGeneratedTag;
}

function findTaggedFiles(dirPath, filenames) {
  let command;
  let baseArgs;
  let pattern;

  if (process.platform === 'win32' && _nuclideUri().default.isLocal(dirPath)) {
    command = 'findstr'; // ignore "files with nonprintable characters"

    baseArgs = ['-p'];
    pattern = getTagPattern(true);
  } else {
    command = 'grep'; // print with filename, ignore binary files and skip directories

    baseArgs = ['-HId', 'skip'];
    pattern = getTagPattern(false);
  }

  if (pattern == null) {
    return Promise.resolve(new Map());
  }

  const filesToGrep = filenames.length === 0 ? ['*'] : filenames;
  const args = [...baseArgs, pattern, ...filesToGrep];
  const options = {
    cwd: dirPath,
    isExitError: ({
      exitCode,
      signal
    }) => {
      return signal != null && (exitCode == null || exitCode > 1);
    }
  };
  return (0, _process().runCommand)(command, args, options).map(stdout => {
    const fileTags = new Map();

    for (const line of stdout.split('\n')) {
      const match = line.match(GREP_PARSE_PATTERN);

      if (match != null && match.length === 3) {
        const filename = match[1];
        const matchedLine = match[2].trim();

        if (matchedLine.includes(_config().config.generatedTag)) {
          fileTags.set(filename, 'generated');
        } else if (matchedLine.includes(_config().config.partialGeneratedTag) && fileTags.get(filename) !== 'generated') {
          fileTags.set(filename, 'partial');
        }
      }
    }

    return fileTags;
  }).toPromise();
}

function matchesGeneratedPaths(filePath) {
  return _config().config.generatedPathRegexes.some(regexp => regexp.test(filePath));
}