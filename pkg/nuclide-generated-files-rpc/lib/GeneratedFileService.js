'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getGeneratedFileType = getGeneratedFileType;
exports.invalidateFileTypeCache = invalidateFileTypeCache;
exports.getGeneratedFileTypes = getGeneratedFileTypes;

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _lruCache;

function _load_lruCache() {
  return _lruCache = _interopRequireDefault(require('lru-cache'));
}

var _process;

function _load_process() {
  return _process = require('../../../modules/nuclide-commons/process');
}

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('../../../modules/nuclide-commons/fsPromise'));
}

var _config;

function _load_config() {
  return _config = require('./config');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// assumes that filenames do not contain ':'
const GREP_PARSE_PATTERN = /^([^:]*):(.*)$/; /**
                                              * Copyright (c) 2015-present, Facebook, Inc.
                                              * All rights reserved.
                                              *
                                              * This source code is licensed under the license found in the LICENSE file in
                                              * the root directory of this source tree.
                                              *
                                              * 
                                              * @format
                                              */

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

  const dirPath = (_nuclideUri || _load_nuclideUri()).default.dirname(filePath);
  const filename = (_nuclideUri || _load_nuclideUri()).default.basename(filePath);
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
  if (!(_nuclideUri || _load_nuclideUri()).default.isInArchive(dirPath) && !(_nuclideUri || _load_nuclideUri()).default.hasKnownArchiveExtension(dirPath)) {
    const files = await (_fsPromise || _load_fsPromise()).default.readdir(dirPath);
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

  const fileTags = await findTaggedFiles(dirPath, uncheckedFiles);

  for (const file of uncheckedFiles) {
    const filePath = (_nuclideUri || _load_nuclideUri()).default.join(dirPath, file);
    let tag = fileTags.get(file);
    if (tag != null) {
      fileTypes.set(filePath, tag);
    } else {
      if (matchesGeneratedPaths(filePath)) {
        tag = 'generated';
        fileTypes.set(filePath, tag);
      } else {
        tag = 'manual';
        // don't send this across the wire; receiver should assume that if it gets
        // a response, any files in the directory that aren't specified are manual
      }
    }
    cache.set(filePath, tag);
  }

  return fileTypes;
}

// 1000 entries should allow for a good number of open directories
const cache = new (_lruCache || _load_lruCache()).default({ max: 1000 });

function getTagPattern(forWindows) {
  if ((_config || _load_config()).config.generatedTag == null) {
    return (_config || _load_config()).config.partialGeneratedTag;
  }
  if ((_config || _load_config()).config.partialGeneratedTag == null) {
    return (_config || _load_config()).config.generatedTag;
  }
  const separator = forWindows ? ' ' : '\\|';
  return (_config || _load_config()).config.generatedTag + separator + (_config || _load_config()).config.partialGeneratedTag;
}

function findTaggedFiles(dirPath, filenames) {
  let command;
  let baseArgs;
  let pattern;
  if (process.platform === 'win32' && (_nuclideUri || _load_nuclideUri()).default.isLocal(dirPath)) {
    command = 'findstr';
    // ignore "files with nonprintable characters"
    baseArgs = ['-p'];
    pattern = getTagPattern(true);
  } else {
    command = 'grep';
    // print with filename, ignore binary files and skip directories
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
        const matchedLine = match[2].trim();
        if (matchedLine.includes((_config || _load_config()).config.generatedTag)) {
          fileTags.set(filename, 'generated');
        } else if (matchedLine.includes((_config || _load_config()).config.partialGeneratedTag) && fileTags.get(filename) !== 'generated') {
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