'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _nullthrows;

function _load_nullthrows() {
  return _nullthrows = _interopRequireDefault(require('nullthrows'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _string;

function _load_string() {
  return _string = require('nuclide-commons/string');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _cache;

function _load_cache() {
  return _cache = require('../../commons-node/cache');
}

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('nuclide-commons/fsPromise'));
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _clangFlagsReader;

function _load_clangFlagsReader() {
  return _clangFlagsReader = require('./clang-flags-reader');
}

var _clangFlagsParser;

function _load_clangFlagsParser() {
  return _clangFlagsParser = require('./clang-flags-parser');
}

var _ClangFlagsPool;

function _load_ClangFlagsPool() {
  return _ClangFlagsPool = _interopRequireDefault(require('./ClangFlagsPool'));
}

var _finders;

function _load_finders() {
  return _finders = require('./related-file/finders');
}

var _utils;

function _load_utils() {
  return _utils = require('./utils');
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

const logger = (0, (_log4js || _load_log4js()).getLogger)('nuclide-clang-rpc');

const COMPILATION_DATABASE_FILE = 'compile_commands.json';
const PROJECT_CLANG_FLAGS_FILE = '.nuclide_clang_config.json';

let _customFlags;
function getCustomFlags() {
  if (_customFlags !== undefined) {
    return _customFlags;
  }
  try {
    // $FlowFB
    _customFlags = require('./fb/custom-flags');
  } catch (e) {
    _customFlags = null;
  }
  return _customFlags;
}

function overrideIncludePath(src) {
  const customFlags = getCustomFlags();
  if (customFlags != null) {
    return customFlags.overrideIncludePath(src);
  }
  return src;
}

class ClangFlagsManager {

  constructor() {
    this._compilationDatabases = new (_cache || _load_cache()).Cache();
    this._uriResolveCache = new (_cache || _load_cache()).Cache({
      keyFactory: ([parent, relative]) => relative + parent
    });

    this._realpathCache = {};
    this._clangProjectFlags = new Map();
    this._flagPool = new (_ClangFlagsPool || _load_ClangFlagsPool()).default();
  }
  // Map from the database file to its files -> flags mappings.


  reset() {
    this._compilationDatabases.clear();
    this._realpathCache = {};
    this._clangProjectFlags.clear();
    this._flagPool.reset();
  }

  getFlags(handle) {
    return this._flagPool.getFlags(handle);
  }

  /**
   * @return a the normalized compilation flags or null if nothing is known
   *     about the src file. For example, null will be returned if src is not
   *     under the project root.
   */
  getFlagsForSrc(src, requestSettings) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const data = yield _this._getFlagsForSrcCached(src, requestSettings);
      if (data != null) {
        const modifiedFlags = yield _this._getModifiedFlags(src, data);
        return {
          flags: modifiedFlags,
          directory: data.directory,
          flagsFile: data.flagsFile
        };
      }
      return null;
    })();
  }

  _getFlagsForSrcCached(src, requestSettings) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const { compilationDatabase } = requestSettings;
      if (compilationDatabase != null) {
        const { file } = compilationDatabase;
        if (file != null) {
          const flagMap = yield _this2._compilationDatabases.get(file);
          if (flagMap != null) {
            const flagsHandle = flagMap.get(src);
            if (flagsHandle != null) {
              return _this2._flagPool.getFlags(flagsHandle);
            }
          }
        }
      }
      return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)('nuclide-clang.get-flags', function () {
        return _this2._getFlagsForSrcImpl(src, requestSettings);
      });
    })();
  }

  _findSourceFileForHeaderFromCompilationDatabase(header, dbFlags) {
    const basename = (0, (_utils || _load_utils()).getFileBasename)(header);
    const srcWithSameBasename = [];
    const otherSrcs = [];
    for (const path of dbFlags.keys()) {
      if ((0, (_utils || _load_utils()).getFileBasename)(path) === basename && (0, (_utils || _load_utils()).isSourceFile)(path)) {
        srcWithSameBasename.push({
          score: (0, (_utils || _load_utils()).commonPrefix)(path, header),
          path
        });
      } else {
        otherSrcs.push({
          score: (0, (_utils || _load_utils()).commonPrefix)(path, header),
          path
        });
      }
    }
    const sortSrcs = srcs => srcs.sort((a, b) => b.score - a.score); // prefer bigger matches
    if (srcWithSameBasename.length > 0) {
      return sortSrcs(srcWithSameBasename)[0].path;
    }
    if (otherSrcs.length > 0) {
      return sortSrcs(otherSrcs)[0].path;
    }
    return null;
  }

  _getModifiedFlags(src, clangFlags) {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const originalFlags = clangFlags.flags;
      // Look for the project-wide flags
      const projectFlagsDir = yield (_fsPromise || _load_fsPromise()).default.findNearestFile(PROJECT_CLANG_FLAGS_FILE, (_nuclideUri || _load_nuclideUri()).default.dirname(src));
      if (projectFlagsDir == null) {
        return originalFlags;
      }
      const projectFlagsFile = (_nuclideUri || _load_nuclideUri()).default.join(projectFlagsDir, PROJECT_CLANG_FLAGS_FILE);
      const projectFlags = yield _this3._loadProjectCompilerFlags(projectFlagsFile);
      if (projectFlags == null) {
        return originalFlags;
      }
      return originalFlags.filter(function (flag) {
        return projectFlags.ignoredCompilerFlags.indexOf(flag) === -1;
      }).concat(projectFlags.extraCompilerFlags);
    })();
  }

  _getDBFlagsAndDirForSrc(src, requestSettings) {
    var _this4 = this;

    return (0, _asyncToGenerator.default)(function* () {
      let dbFlags = null;
      let dbDir = null;
      const compilationDB = requestSettings.compilationDatabase;
      if (compilationDB != null && compilationDB.file != null) {
        const { file, flagsFile } = compilationDB;
        // Look for a compilation database provided by the client.
        dbDir = (_nuclideUri || _load_nuclideUri()).default.dirname(file);
        dbFlags = yield _this4.loadFlagsFromCompilationDatabase(file, flagsFile);
      } else {
        // Look for a manually provided compilation database.
        dbDir = yield (_fsPromise || _load_fsPromise()).default.findNearestFile(COMPILATION_DATABASE_FILE, (_nuclideUri || _load_nuclideUri()).default.dirname(src));
        if (dbDir != null) {
          const dbFile = (_nuclideUri || _load_nuclideUri()).default.join(dbDir, COMPILATION_DATABASE_FILE);
          dbFlags = yield _this4.loadFlagsFromCompilationDatabase(dbFile, null);
        }
      }
      return { dbFlags, dbDir };
    })();
  }

  _getRelatedSrcFileForHeader(header, dbFlags, projectRoot) {
    var _this5 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const source = yield new (_finders || _load_finders()).RelatedFileFinder().getRelatedSourceForHeader(header);
      if (source != null) {
        return source;
      }
      if (dbFlags != null) {
        const sourceFile = _this5._findSourceFileForHeaderFromCompilationDatabase(header, dbFlags);
        if (sourceFile != null) {
          return sourceFile;
        }
      }
      return projectRoot != null ? new (_finders || _load_finders()).RelatedFileFinder().getRelatedSourceForHeader(header, projectRoot) : null;
    })();
  }

  getRelatedSourceOrHeader(src, requestSettings) {
    var _this6 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const { dbFlags, dbDir } = yield _this6._getDBFlagsAndDirForSrc(src, requestSettings);
      const projectRoot = requestSettings == null ? null : requestSettings.projectRoot;
      if ((0, (_utils || _load_utils()).isHeaderFile)(src)) {
        return _this6._getRelatedSrcFileForHeader(src, dbFlags,
        // flowlint-next-line sketchy-null-string:off
        projectRoot || dbDir);
      }
      return new (_finders || _load_finders()).RelatedFileFinder().getRelatedHeaderForSource(src);
    })();
  }

  _getFlagsForSrcImpl(src, requestSettings) {
    var _this7 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const { dbFlags, dbDir } = yield _this7._getDBFlagsAndDirForSrc(src, requestSettings);
      if (dbFlags != null) {
        const flagsHandle = dbFlags.get(src);
        if (flagsHandle != null) {
          return _this7._flagPool.getFlags(flagsHandle);
        }
      }

      if ((0, (_utils || _load_utils()).isHeaderFile)(src)) {
        const sourceFile = yield _this7._getRelatedSrcFileForHeader(src, dbFlags,
        // flowlint-next-line sketchy-null-string:off
        requestSettings.projectRoot || dbDir);
        if (sourceFile != null) {
          return _this7._getFlagsForSrcCached(sourceFile, requestSettings);
        }
      }

      const compilationDB = requestSettings.compilationDatabase;
      // Even if we can't get flags, try to watch the build file in case they get added.
      const buildFile = compilationDB != null && compilationDB.flagsFile != null ? compilationDB.flagsFile : yield (0, (_utils || _load_utils()).guessBuildFile)(src);
      if (buildFile != null) {
        return {
          flags: [],
          flagsFile: buildFile,
          directory: (_nuclideUri || _load_nuclideUri()).default.dirname(src)
        };
      }

      return null;
    })();
  }

  _loadProjectCompilerFlags(flagsFile) {
    var _this8 = this;

    return (0, _asyncToGenerator.default)(function* () {
      let cached = _this8._clangProjectFlags.get(flagsFile);
      if (cached == null) {
        cached = _this8._loadProjectCompilerFlagsImpl(flagsFile);
        _this8._clangProjectFlags.set(flagsFile, cached);
      }
      return cached;
    })();
  }

  _loadProjectCompilerFlagsImpl(flagsFile) {
    return (0, _asyncToGenerator.default)(function* () {
      let result = null;
      try {
        const contents = yield (_fsPromise || _load_fsPromise()).default.readFile(flagsFile, 'utf8');
        const data = JSON.parse(contents);

        if (!(data instanceof Object)) {
          throw new Error('Invariant violation: "data instanceof Object"');
        }

        const { extra_compiler_flags, ignored_compiler_flags } = data;
        const extraCompilerFlags = [];
        const ignoredCompilerFlags = [];

        if (extra_compiler_flags != null) {
          extra_compiler_flags.forEach(function (flag) {
            return extraCompilerFlags.push(flag);
          });
        }
        if (ignored_compiler_flags != null) {
          ignored_compiler_flags.forEach(function (flag) {
            return ignoredCompilerFlags.push(flag);
          });
        }
        result = { extraCompilerFlags, ignoredCompilerFlags };
      } catch (e) {
        logger.error(`Error reading compilation flags from ${flagsFile}`, e);
      }

      return result;
    })();
  }

  _assertCompilationDatabaseEntry(entry) {
    if (!(typeof entry.file === 'string' && typeof entry.directory === 'string' && (typeof entry.command === 'string' || Array.isArray(entry.arguments)))) {
      throw new Error('The compilation database entry is invalid and does not comply with the spec.');
    }
  }

  _processCompilationDatabaseEntry(entry, dbDir, flagsFile, dbFile) {
    var _this9 = this;

    return (0, _asyncToGenerator.default)(function* () {
      _this9._assertCompilationDatabaseEntry(entry);
      const directory = yield (_fsPromise || _load_fsPromise()).default.realpath(
      // Relative directories aren't part of the spec, but resolving them
      // relative to the compile_commands.json location seems reasonable.
      _this9._uriResolveCached(dbDir, entry.directory), _this9._realpathCache);
      const filename = _this9._uriResolveCached(directory, entry.file);
      const realpath = yield (_fsPromise || _load_fsPromise()).default.realpath(filename, _this9._realpathCache);
      const clangFlags = _this9.sanitizeEntry(entry, flagsFile == null ? dbFile : flagsFile);
      return [realpath, _this9._flagPool.getHandle(clangFlags)];
    })();
  }

  _loadFlagsFromCompilationDatabase(dbFile, flagsFile) {
    var _this10 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const flags = new Map();
      const dbDir = (_nuclideUri || _load_nuclideUri()).default.dirname(dbFile);
      // Factor out the common arguments to _processCompilationDatabaseEntry.
      const processEntry = function (entry) {
        return _this10._processCompilationDatabaseEntry(entry, dbDir, flagsFile, dbFile);
      };

      const processedEntries = yield (0, (_clangFlagsReader || _load_clangFlagsReader()).readCompilationFlags)(dbFile).flatMap(processEntry).toArray().toPromise().catch(function (error) {
        logger.error(`Saw error loading ${dbFile}, falling back to JSON.parse.`, error);
        return (0, (_clangFlagsReader || _load_clangFlagsReader()).fallbackReadCompilationFlags)(dbFile).then(function (entries) {
          return Promise.all(entries.map(function (entry) {
            return processEntry(entry);
          }));
        });
      }).catch(function (error) {
        logger.error(`Fallback parser for ${dbFile} encountered error too`, error);
        return [];
      });
      for (const [realpath, clangFlagsHandle] of processedEntries) {
        flags.set(realpath, clangFlagsHandle);
      }
      _this10._flagPool.trackStats();
      _this10._uriResolveCache.clear();
      return flags;
    })();
  }

  loadFlagsFromCompilationDatabase(dbFile, flagsFile) {
    return this._compilationDatabases.getOrCreate(dbFile, () => this._loadFlagsFromCompilationDatabase(dbFile, flagsFile) || Promise.resolve(new Map()));
  }

  _uriResolveCached(parent, relative) {
    return this._uriResolveCache.getOrCreate([parent, relative], () => (_nuclideUri || _load_nuclideUri()).default.resolve(parent, relative));
  }

  sanitizeEntry(entry, flagsFile) {
    const { directory, file } = entry;
    const ext = (_nuclideUri || _load_nuclideUri()).default.extname(file);
    // Nullthrows is safe because of _assertCompilationDatabaseEntry.
    let args = entry.arguments !== undefined ? entry.arguments : (0, (_string || _load_string()).shellParse)((0, (_nullthrows || _load_nullthrows()).default)(entry.command));
    // We exclude the path to the file to compile from the compilation database
    // generated by Buck. It must be removed from the list of command-line
    // arguments passed to libclang.
    const normalizedSourceFile = (_nuclideUri || _load_nuclideUri()).default.normalize(file);
    args = args.filter(arg => normalizedSourceFile !== arg && (!arg.endsWith(ext) || normalizedSourceFile !== this._uriResolveCached(directory, arg)));
    // Add the -x flag if it does not exist.
    if (!args.find(arg => arg === '-x')) {
      const xFlag = ClangFlagsManager._getXFlagForSourceFile(file);
      args.push('-x', xFlag);
    }
    // Resolve relative path arguments against the Buck project root.
    args = (0, (_clangFlagsParser || _load_clangFlagsParser()).mapPathsInFlags)(args, path_ => {
      let path = overrideIncludePath(path_);
      if (!(_nuclideUri || _load_nuclideUri()).default.isAbsolute(path)) {
        path = (_nuclideUri || _load_nuclideUri()).default.join(directory, path);
      }
      return path;
    });

    const skipArgs = ['-o', '-MF'];
    // If an output file is specified, remove that argument.
    skipArgs.forEach(arg => {
      const index = args.indexOf(arg);
      if (index !== -1) {
        args.splice(index, 2);
      }
    });
    return { directory, flagsFile, flags: args };
  }

  static _getXFlagForSourceFile(sourceFile) {
    const ext = (_nuclideUri || _load_nuclideUri()).default.extname(sourceFile);
    if (ext === '.mm') {
      return 'objective-c++';
    } else if (ext === '.m') {
      return 'objective-c';
    } else if (ext === '.c') {
      return 'c';
    } else {
      return 'c++';
    }
  }
}
exports.default = ClangFlagsManager;