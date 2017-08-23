'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

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

var _clangFlagsParser;

function _load_clangFlagsParser() {
  return _clangFlagsParser = require('./clang-flags-parser');
}

var _utils;

function _load_utils() {
  return _utils = require('./utils');
}

var _RelatedFileFinder;

function _load_RelatedFileFinder() {
  return _RelatedFileFinder = require('./RelatedFileFinder');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const logger = (0, (_log4js || _load_log4js()).getLogger)('nuclide-clang-rpc'); /**
                                                                                 * Copyright (c) 2015-present, Facebook, Inc.
                                                                                 * All rights reserved.
                                                                                 *
                                                                                 * This source code is licensed under the license found in the LICENSE file in
                                                                                 * the root directory of this source tree.
                                                                                 *
                                                                                 * 
                                                                                 * @format
                                                                                 */

const INCLUDE_SEARCH_TIMEOUT = 15000;
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

function getCacheKeyForDb(compilationDatabase) {
  // only requestSettings.compilationDatabase.file is meaningful
  return compilationDatabase == null ? null : compilationDatabase.file;
}

class ClangFlagsManager {

  constructor() {
    this._compilationDatabases = new (_cache || _load_cache()).Cache({
      keyFactory: db => getCacheKeyForDb(db)
    });
    this._pathToFlags = new (_cache || _load_cache()).Cache({
      keyFactory: ([src, requestSettings]) => JSON.stringify([src, getCacheKeyForDb(requestSettings.compilationDatabase)])
    });

    this._realpathCache = {};
    this._clangProjectFlags = new Map();
  }

  reset() {
    this._pathToFlags.clear();
    this._compilationDatabases.clear();
    this._realpathCache = {};
    this._clangProjectFlags.clear();
  }

  /**
   * @return a space-delimited string of flags or null if nothing is known
   *     about the src file. For example, null will be returned if src is not
   *     under the project root.
   */
  getFlagsForSrc(src, requestSettings) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const data = yield _this._getFlagsForSrcCached(src, requestSettings);
      if (data == null) {
        return null;
      }
      if (data.flags === undefined) {
        const { rawData } = data;
        if (rawData == null) {
          data.flags = null;
        } else {
          const flags = yield _this._getModifiedFlags(src, rawData);
          data.flags = ClangFlagsManager.sanitizeCommand(rawData.file, flags, rawData.directory);
        }
      }
      return data;
    })();
  }

  _getFlagsForSrcCached(src, requestSettings) {
    return this._pathToFlags.getOrCreate([src, requestSettings], () => this._getFlagsForSrcImpl(src, requestSettings));
  }

  _getFlagsForSrcImpl(src, requestSettings) {
    return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)('nuclide-clang.get-flags', () => this.__getFlagsForSrcImpl(src, requestSettings));
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

  _getXFlagForSourceFile(sourceFile) {
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

  _getFlagsFromSourceFileForHeader(sourceFile, requestSettings) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const data = yield _this2._getFlagsForSrcCached(sourceFile, requestSettings);
      if (data != null) {
        const { rawData } = data;
        if (rawData != null) {
          const xFlag = _this2._getXFlagForSourceFile(sourceFile);
          let { command } = rawData;
          if (!command.includes('-x ')) {
            command += ` -x ${xFlag}`;
            rawData.command = command;
          }
          if (rawData.arguments != null && !rawData.arguments.find(function (arg) {
            return arg === '-x';
          })) {
            rawData.arguments.push('-x', xFlag);
          }
        }
      }
      return data;
    })();
  }

  _getModifiedFlags(src, rawData) {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const originalFlags = rawData.arguments !== undefined ? rawData.arguments : (0, (_string || _load_string()).shellParse)(rawData.command);
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
        // Look for a compilation database provided by the client.
        dbDir = (_nuclideUri || _load_nuclideUri()).default.dirname(compilationDB.file);
        dbFlags = yield _this4.loadFlagsFromCompilationDatabase(requestSettings);
      } else {
        // Look for a manually provided compilation database.
        dbDir = yield (_fsPromise || _load_fsPromise()).default.findNearestFile(COMPILATION_DATABASE_FILE, (_nuclideUri || _load_nuclideUri()).default.dirname(src));
        if (dbDir != null) {
          const dbFile = (_nuclideUri || _load_nuclideUri()).default.join(dbDir, COMPILATION_DATABASE_FILE);
          const compilationDatabase = {
            file: dbFile,
            flagsFile: null,
            libclangPath: null
          };
          dbFlags = yield _this4.loadFlagsFromCompilationDatabase({
            compilationDatabase,
            projectRoot: requestSettings.projectRoot
          });
        }
      }
      return { dbFlags, dbDir };
    })();
  }

  _getRelatedSrcFileForHeader(header, dbFlags, projectRoot) {
    var _this5 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const source = yield (0, (_RelatedFileFinder || _load_RelatedFileFinder()).getRelatedSourceForHeader)(header);
      if (source != null) {
        return source;
      }
      if (dbFlags != null) {
        const sourceFile = _this5._findSourceFileForHeaderFromCompilationDatabase(header, dbFlags);
        if (sourceFile != null) {
          return sourceFile;
        }
      }
      if (projectRoot != null) {
        // Try searching all subdirectories for source files that include this header.
        // Give up after INCLUDE_SEARCH_TIMEOUT.
        return (0, (_RelatedFileFinder || _load_RelatedFileFinder()).findIncludingSourceFile)(header, projectRoot).timeout(INCLUDE_SEARCH_TIMEOUT).catch(function () {
          return _rxjsBundlesRxMinJs.Observable.of(null);
        }).toPromise();
      }
      return null;
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
      return (0, (_RelatedFileFinder || _load_RelatedFileFinder()).getRelatedHeaderForSource)(src);
    })();
  }

  __getFlagsForSrcImpl(src, requestSettings) {
    var _this7 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const { dbFlags, dbDir } = yield _this7._getDBFlagsAndDirForSrc(src, requestSettings);
      if (dbFlags != null) {
        const flags = dbFlags.get(src);
        if (flags != null) {
          return flags;
        }
      }

      if ((0, (_utils || _load_utils()).isHeaderFile)(src)) {
        const sourceFile = yield _this7._getRelatedSrcFileForHeader(src, dbFlags,
        // flowlint-next-line sketchy-null-string:off
        requestSettings.projectRoot || dbDir);
        if (sourceFile != null) {
          return _this7._getFlagsFromSourceFileForHeader(sourceFile, requestSettings);
        }
      }

      const compilationDB = requestSettings.compilationDatabase;
      // Even if we can't get flags, try to watch the build file in case they get added.
      const buildFile = compilationDB != null && compilationDB.flagsFile != null ? compilationDB.flagsFile : yield (0, (_utils || _load_utils()).guessBuildFile)(src);
      if (buildFile != null) {
        return {
          rawData: null,
          flagsFile: buildFile
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

  _loadFlagsFromCompilationDatabase(dbFile, flagsFile, requestSettings) {
    var _this9 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const flags = new Map();
      try {
        const contents = yield (_fsPromise || _load_fsPromise()).default.readFile(dbFile, 'utf8');
        const data = JSON.parse(contents);
        const dbDir = (_nuclideUri || _load_nuclideUri()).default.dirname(dbFile);
        yield Promise.all(data.map((() => {
          var _ref = (0, _asyncToGenerator.default)(function* (entry) {
            const { command, file } = entry;
            const directory = yield (_fsPromise || _load_fsPromise()).default.realpath(
            // Relative directories aren't part of the spec, but resolving them
            // relative to the compile_commands.json location seems reasonable.
            (_nuclideUri || _load_nuclideUri()).default.resolve(dbDir, entry.directory), _this9._realpathCache);
            const filename = (_nuclideUri || _load_nuclideUri()).default.resolve(directory, file);
            if (yield (_fsPromise || _load_fsPromise()).default.exists(filename)) {
              const realpath = yield (_fsPromise || _load_fsPromise()).default.realpath(filename, _this9._realpathCache);
              const result = {
                rawData: {
                  command,
                  file,
                  directory,
                  arguments: entry.arguments
                },
                // flowlint-next-line sketchy-null-string:off
                flagsFile: flagsFile || dbFile
              };
              flags.set(realpath, result);
              _this9._pathToFlags.set([realpath, requestSettings], Promise.resolve(result));
            }
          });

          return function (_x) {
            return _ref.apply(this, arguments);
          };
        })()));
      } catch (e) {
        logger.error(`Error reading compilation flags from ${dbFile}`, e);
      }
      return flags;
    })();
  }

  loadFlagsFromCompilationDatabase(requestSettings) {
    const db = requestSettings.compilationDatabase;
    if (db == null) {
      return Promise.resolve(new Map());
    }
    const dbFile = db.file;
    if (dbFile == null) {
      return Promise.resolve(new Map());
    }
    return this._compilationDatabases.getOrCreate(db, () => this._loadFlagsFromCompilationDatabase(dbFile, db.flagsFile, requestSettings) || Promise.resolve(new Map()));
  }

  static sanitizeCommand(sourceFile, args_, basePath) {
    // Make a mutable copy.
    let args = [...args_];
    // For safety, create a new copy of the array. We exclude the path to the file to compile from
    // compilation database generated by Buck. It must be removed from the list of command-line
    // arguments passed to libclang.
    const normalizedSourceFile = (_nuclideUri || _load_nuclideUri()).default.normalize(sourceFile);
    args = args.filter(arg => normalizedSourceFile !== arg && normalizedSourceFile !== (_nuclideUri || _load_nuclideUri()).default.resolve(basePath, arg));

    // Resolve relative path arguments against the Buck project root.
    args = (0, (_clangFlagsParser || _load_clangFlagsParser()).mapPathsInFlags)(args, path_ => {
      let path = overrideIncludePath(path_);
      if (!(_nuclideUri || _load_nuclideUri()).default.isAbsolute(path)) {
        path = (_nuclideUri || _load_nuclideUri()).default.join(basePath, path);
      }
      return path;
    });

    // If an output file is specified, remove that argument.
    const index = args.indexOf('-o');
    if (index !== -1) {
      args.splice(index, 2);
    }

    return args;
  }
}
exports.default = ClangFlagsManager;