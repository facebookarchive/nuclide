'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _string;

function _load_string() {
  return _string = require('nuclide-commons/string');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('nuclide-commons/fsPromise'));
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _nuclideBuckRpc;

function _load_nuclideBuckRpc() {
  return _nuclideBuckRpc = _interopRequireWildcard(require('../../nuclide-buck-rpc'));
}

var _clangFlagsParser;

function _load_clangFlagsParser() {
  return _clangFlagsParser = require('./clang-flags-parser');
}

var _utils;

function _load_utils() {
  return _utils = require('./utils');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

const COMPILATION_DATABASE_FILE = 'compile_commands.json';
const PROJECT_CLANG_FLAGS_FILE = '.nuclide_clang_config.json';

const INCLUDE_SEARCH_TIMEOUT = 15000;

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
    this._pathToFlags = new Map();
    this._compilationDatabases = new Map();
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
  getFlagsForSrc(src, compilationDB) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const data = yield _this._getFlagsForSrcCached(src, compilationDB);
      if (data == null) {
        return null;
      }
      if (data.flags === undefined) {
        const { rawData } = data;
        if (rawData == null) {
          data.flags = null;
        } else {
          let { flags } = rawData;
          if (typeof flags === 'string') {
            flags = (0, (_string || _load_string()).shellParse)(flags);
          }
          flags = yield _this._getModifiedFlags(src, flags);
          data.flags = ClangFlagsManager.sanitizeCommand(rawData.file, flags, rawData.directory);
        }
      }
      return data;
    })();
  }

  _cacheKeyForCompilationDatabase(compilationDB) {
    return compilationDB == null ? '' : `${compilationDB.file || ''}-${compilationDB.flagsFile || ''}`;
  }

  _getFlagsForSrcCached(src, compilationDB) {
    const cacheKey = `${src}-${this._cacheKeyForCompilationDatabase(compilationDB)}`;
    let cached = this._pathToFlags.get(cacheKey);
    if (cached == null) {
      cached = this._getFlagsForSrcImpl(src, compilationDB);
      this._pathToFlags.set(cacheKey, cached);
    }
    return cached;
  }

  _getFlagsForSrcImpl(src, compilationDB) {
    return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)('nuclide-clang.get-flags', () => this.__getFlagsForSrcImpl(src, compilationDB));
  }

  _findSourceFileForHeaderFromCompilationDatabase(header, dbFlags) {
    const basename = ClangFlagsManager._getFileBasename(header);
    const srcWithSameBasename = [];
    const otherSrcs = [];
    for (const path of dbFlags.keys()) {
      if (ClangFlagsManager._getFileBasename(path) === basename && (0, (_utils || _load_utils()).isSourceFile)(path)) {
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

  _getFlagsFromSourceFileForHeader(sourceFile, compilationDB) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const data = yield _this2._getFlagsForSrcCached(sourceFile, compilationDB);
      if (data != null) {
        const { rawData } = data;
        if (rawData != null) {
          const xFlag = _this2._getXFlagForSourceFile(sourceFile);
          let { flags } = rawData;
          if (typeof flags === 'string') {
            if (!flags.includes('-x ')) {
              flags += ` -x ${xFlag}`;
              rawData.flags = flags;
            }
          } else {
            if (flags.find(function (s) {
              return s === '-x';
            }) === undefined) {
              rawData.flags = flags.concat(['-x', xFlag]);
            }
          }
        }
      }
      return data;
    })();
  }

  _getModifiedFlags(src, originalFlags) {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
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

  _getDBFlagsAndDirForSrc(src, compilationDB) {
    var _this4 = this;

    return (0, _asyncToGenerator.default)(function* () {
      let dbFlags = null;
      let dbDir = null;
      if (compilationDB != null && compilationDB.file != null) {
        // Look for a compilation database provided by the client.
        dbDir = (_nuclideUri || _load_nuclideUri()).default.dirname(compilationDB.file);
        dbFlags = yield _this4._loadFlagsFromCompilationDatabase(compilationDB);
      } else {
        // Look for a manually provided compilation database.
        dbDir = yield (_fsPromise || _load_fsPromise()).default.findNearestFile(COMPILATION_DATABASE_FILE, (_nuclideUri || _load_nuclideUri()).default.dirname(src));
        if (dbDir != null) {
          const dbFile = (_nuclideUri || _load_nuclideUri()).default.join(dbDir, COMPILATION_DATABASE_FILE);
          dbFlags = yield _this4._loadFlagsFromCompilationDatabase({
            file: dbFile,
            flagsFile: null
          });
        }
      }
      return { dbFlags, dbDir };
    })();
  }

  _getRelatedSrcFileForHeader(src, dbFlags, dbDir) {
    var _this5 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (dbFlags != null) {
        const sourceFile = _this5._findSourceFileForHeaderFromCompilationDatabase(src, dbFlags);
        if (sourceFile != null) {
          return sourceFile;
        }
      }
      // Try finding flags for a related source file.
      const projectRoot = (yield (_nuclideBuckRpc || _load_nuclideBuckRpc()).getRootForPath(src)) || dbDir;
      // If we don't have a .buckconfig or a compile_commands.json, we won't find flags regardless.
      if (projectRoot != null) {
        return ClangFlagsManager._findSourceFileForHeader(src, projectRoot);
      }
      return null;
    })();
  }

  getRelatedSrcFileForHeader(src, compilationDB) {
    var _this6 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const { dbFlags, dbDir } = yield _this6._getDBFlagsAndDirForSrc(src, compilationDB);
      return _this6._getRelatedSrcFileForHeader(src, dbFlags, dbDir);
    })();
  }

  __getFlagsForSrcImpl(src, compilationDB) {
    var _this7 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const { dbFlags, dbDir } = yield _this7._getDBFlagsAndDirForSrc(src, compilationDB);
      if (dbFlags != null) {
        const flags = dbFlags.get(src);
        if (flags != null) {
          return flags;
        }
      }

      if ((0, (_utils || _load_utils()).isHeaderFile)(src)) {
        const sourceFile = yield _this7._getRelatedSrcFileForHeader(src, dbFlags, dbDir);
        if (sourceFile != null) {
          return _this7._getFlagsFromSourceFileForHeader(sourceFile, compilationDB);
        }
      }

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

  _loadFlagsFromCompilationDatabase(db) {
    var _this9 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (db.file == null) {
        return new Map();
      }
      const dbFile = db.file;
      const key = _this9._cacheKeyForCompilationDatabase(db);
      const cache = _this9._compilationDatabases.get(key);
      if (cache != null) {
        return cache;
      }

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
              // Buck sends the flags in the arguments section. We use it if it was correctly parsed
              // by JSON.parse. The command section emitted by buck is not a valid json expression nor
              // can be parsed by shellParse.
              const result = {
                rawData: {
                  flags: Array.isArray(entry.arguments) ? entry.arguments : command,
                  file,
                  directory
                },
                flagsFile: db.flagsFile || db.file
              };
              flags.set(realpath, result);
              _this9._pathToFlags.set(realpath, Promise.resolve(result));
            }
          });

          return function (_x) {
            return _ref.apply(this, arguments);
          };
        })()));
        _this9._compilationDatabases.set(key, flags);
      } catch (e) {
        logger.error(`Error reading compilation flags from ${dbFile}`, e);
      }
      return flags;
    })();
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

  static _findSourceFileForHeader(header, projectRoot) {
    return (0, _asyncToGenerator.default)(function* () {
      // Basic implementation: look at files in the same directory for paths
      // with matching file names.
      const dir = (_nuclideUri || _load_nuclideUri()).default.dirname(header);
      const files = yield (_fsPromise || _load_fsPromise()).default.readdir(dir);
      const basename = ClangFlagsManager._getFileBasename(header);
      for (const file of files) {
        if ((0, (_utils || _load_utils()).isSourceFile)(file) && ClangFlagsManager._getFileBasename(file) === basename) {
          return (_nuclideUri || _load_nuclideUri()).default.join(dir, file);
        }
      }

      // Try searching all subdirectories for source files that include this header.
      // Give up after INCLUDE_SEARCH_TIMEOUT.
      return (0, (_utils || _load_utils()).findIncludingSourceFile)(header, projectRoot).timeout(INCLUDE_SEARCH_TIMEOUT).catch(function () {
        return _rxjsBundlesRxMinJs.Observable.of(null);
      }).toPromise();
    })();
  }

  // Strip off the extension and conventional suffixes like "Internal" and "-inl".
  static _getFileBasename(file) {
    let basename = (_nuclideUri || _load_nuclideUri()).default.basename(file);
    const ext = basename.lastIndexOf('.');
    if (ext !== -1) {
      basename = basename.substr(0, ext);
    }
    return basename.replace(/(Internal|-inl)$/, '');
  }
}
exports.default = ClangFlagsManager;