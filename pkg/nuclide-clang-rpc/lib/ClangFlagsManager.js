'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _os = _interopRequireDefault(require('os'));

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _string;

function _load_string() {
  return _string = require('../../commons-node/string');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('../../commons-node/fsPromise'));
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

var _nuclideBuckRpc;

function _load_nuclideBuckRpc() {
  return _nuclideBuckRpc = _interopRequireWildcard(require('../../nuclide-buck-rpc'));
}

var _utils;

function _load_utils() {
  return _utils = require('./utils');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const logger = (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)(); /**
                                                                              * Copyright (c) 2015-present, Facebook, Inc.
                                                                              * All rights reserved.
                                                                              *
                                                                              * This source code is licensed under the license found in the LICENSE file in
                                                                              * the root directory of this source tree.
                                                                              *
                                                                              * 
                                                                              */

const BUCK_TIMEOUT = 10 * 60 * 1000;

const COMPILATION_DATABASE_FILE = 'compile_commands.json';
const PROJECT_CLANG_FLAGS_FILE = '.nuclide_clang_config.json';

/**
 * Facebook puts all headers in a <target>:__default_headers__ build target by default.
 * This target will never produce compilation flags, so make sure to ignore it.
 */
const DEFAULT_HEADERS_TARGET = '__default_headers__';

const CLANG_FLAGS_THAT_TAKE_PATHS = new Set(['-F', '-I', '-include', '-include-pch', '-iquote', '-isysroot', '-isystem']);

const TARGET_KIND_REGEX = ['apple_binary', 'apple_library', 'apple_test', 'cxx_binary', 'cxx_library', 'cxx_test'].join('|');

const SINGLE_LETTER_CLANG_FLAGS_THAT_TAKE_PATHS = new Set(Array.from(CLANG_FLAGS_THAT_TAKE_PATHS).filter(item => item.length === 2));

const INCLUDE_SEARCH_TIMEOUT = 15000;

let _overrideIncludePath = undefined;
function overrideIncludePath(src) {
  if (_overrideIncludePath === undefined) {
    _overrideIncludePath = null;
    try {
      // $FlowFB
      _overrideIncludePath = require('./fb/custom-flags').overrideIncludePath;
    } catch (e) {
      // open-source version
    }
  }
  if (_overrideIncludePath != null) {
    return _overrideIncludePath(src);
  }
  return src;
}

class ClangFlagsManager {

  constructor() {
    this._pathToFlags = new Map();
    this._cachedBuckFlags = new Map();
    this._compilationDatabases = new Map();
    this._realpathCache = {};
    this._clangProjectFlags = new Map();
  }

  reset() {
    this._pathToFlags.clear();
    this._cachedBuckFlags.clear();
    this._compilationDatabases.clear();
    this._realpathCache = {};
    this._clangProjectFlags.clear();
  }

  /**
   * @return a space-delimited string of flags or null if nothing is known
   *     about the src file. For example, null will be returned if src is not
   *     under the project root.
   */
  getFlagsForSrc(src, compilationDBFile) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const data = yield _this._getFlagsForSrcCached(src, compilationDBFile);
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

  _getFlagsForSrcCached(src, compilationDBFile) {
    const cacheKey = `${src}-${compilationDBFile || ''}`;
    let cached = this._pathToFlags.get(cacheKey);
    if (cached == null) {
      cached = this._getFlagsForSrcImpl(src, compilationDBFile);
      this._pathToFlags.set(cacheKey, cached);
    }
    return cached;
  }

  _getFlagsForSrcImpl(src, compilationDBFile) {
    return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)('nuclide-clang.get-flags', () => this.__getFlagsForSrcImpl(src, compilationDBFile));
  }

  _findSourceFileForHeaderFromCompilationDatabase(header, dbFlags) {
    const basename = ClangFlagsManager._getFileBasename(header);
    const inferredSrcs = Array.from(dbFlags.keys()).filter(path => ClangFlagsManager._getFileBasename(path) === basename && (0, (_utils || _load_utils()).isSourceFile)(path)).map(path => {
      return { score: (0, (_utils || _load_utils()).commonPrefix)(path, header), path };
    }).sort((a, b) => b.score - a.score); // prefer bigger matches
    if (inferredSrcs.length > 0) {
      return inferredSrcs[0].path;
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

  _getFlagsFromSourceFileForHeader(sourceFile, compilationDBFile) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const data = yield _this2._getFlagsForSrcCached(sourceFile, compilationDBFile);
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

  _getDBFlagsAndDirForSrc(src, compilationDBFile) {
    var _this4 = this;

    return (0, _asyncToGenerator.default)(function* () {
      let dbFlags = null;
      let dbDir = null;
      if (compilationDBFile != null) {
        // Look for a compilation database provided by the client.
        dbFlags = yield _this4._loadFlagsFromCompilationDatabase(compilationDBFile);
        dbDir = (_nuclideUri || _load_nuclideUri()).default.dirname(compilationDBFile);
      } else {
        // Look for a manually provided compilation database.
        dbDir = yield (_fsPromise || _load_fsPromise()).default.findNearestFile(COMPILATION_DATABASE_FILE, (_nuclideUri || _load_nuclideUri()).default.dirname(src));
        if (dbDir != null) {
          const dbFile = (_nuclideUri || _load_nuclideUri()).default.join(dbDir, COMPILATION_DATABASE_FILE);
          dbFlags = yield _this4._loadFlagsFromCompilationDatabase(dbFile);
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

  _getFlagsForSrcImplFromBuck(src) {
    var _this6 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const buckFlags = yield _this6._loadFlagsFromBuck(src).catch(function (err) {
        logger.error('Error getting flags from Buck', err);
        return new Map();
      });
      if ((0, (_utils || _load_utils()).isHeaderFile)(src)) {
        // Accept flags from any source file in the target.
        if (buckFlags.size > 0) {
          return buckFlags.values().next().value;
        }
      }
      const flags = buckFlags.get(src);
      if (flags != null) {
        return flags;
      }
    })();
  }

  getRelatedSrcFileForHeader(src, compilationDBFile) {
    var _this7 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const { dbFlags, dbDir } = yield _this7._getDBFlagsAndDirForSrc(src, compilationDBFile);
      return _this7._getRelatedSrcFileForHeader(src, dbFlags, dbDir);
    })();
  }

  __getFlagsForSrcImpl(src, compilationDBFile) {
    var _this8 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const { dbFlags, dbDir } = yield _this8._getDBFlagsAndDirForSrc(src, compilationDBFile);
      if (dbFlags != null) {
        const flags = dbFlags.get(src);
        if (flags != null) {
          return flags;
        }
      }

      if ((0, (_utils || _load_utils()).isHeaderFile)(src)) {
        const sourceFile = yield _this8._getRelatedSrcFileForHeader(src, dbFlags, dbDir);
        if (sourceFile != null) {
          return _this8._getFlagsFromSourceFileForHeader(sourceFile, compilationDBFile);
        }
      }

      const flagsFromBuck = yield _this8._getFlagsForSrcImplFromBuck(src);
      if (flagsFromBuck != null) {
        return flagsFromBuck;
      }

      // Even if we can't get flags, try to watch the build file in case they get added.
      const buildFile = yield ClangFlagsManager._guessBuildFile(src);
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
    var _this9 = this;

    return (0, _asyncToGenerator.default)(function* () {
      let cached = _this9._clangProjectFlags.get(flagsFile);
      if (cached == null) {
        cached = _this9._loadProjectCompilerFlagsImpl(flagsFile);
        _this9._clangProjectFlags.set(flagsFile, cached);
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

  _loadFlagsFromCompilationDatabase(dbFile) {
    var _this10 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const cache = _this10._compilationDatabases.get(dbFile);
      if (cache != null) {
        return cache;
      }

      const flags = new Map();
      try {
        const contents = yield (_fsPromise || _load_fsPromise()).default.readFile(dbFile, 'utf8');
        const data = JSON.parse(contents);

        if (!(data instanceof Array)) {
          throw new Error('Invariant violation: "data instanceof Array"');
        }

        const dbDir = (_nuclideUri || _load_nuclideUri()).default.dirname(dbFile);
        yield Promise.all(data.map((() => {
          var _ref = (0, _asyncToGenerator.default)(function* (entry) {
            const { command, file } = entry;
            const directory = yield (_fsPromise || _load_fsPromise()).default.realpath(
            // Relative directories aren't part of the spec, but resolving them
            // relative to the compile_commands.json location seems reasonable.
            (_nuclideUri || _load_nuclideUri()).default.resolve(dbDir, entry.directory), _this10._realpathCache);
            const filename = (_nuclideUri || _load_nuclideUri()).default.resolve(directory, file);
            if (yield (_fsPromise || _load_fsPromise()).default.exists(filename)) {
              const realpath = yield (_fsPromise || _load_fsPromise()).default.realpath(filename, _this10._realpathCache);
              const result = {
                rawData: {
                  flags: command,
                  file,
                  directory
                },
                flagsFile: dbFile
              };
              flags.set(realpath, result);
              _this10._pathToFlags.set(realpath, Promise.resolve(result));
            }
          });

          return function (_x) {
            return _ref.apply(this, arguments);
          };
        })()));
        _this10._compilationDatabases.set(dbFile, flags);
      } catch (e) {
        logger.error(`Error reading compilation flags from ${dbFile}`, e);
      }
      return flags;
    })();
  }

  _loadFlagsFromBuck(src) {
    var _this11 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const buckRoot = yield (_nuclideBuckRpc || _load_nuclideBuckRpc()).getRootForPath(src);
      if (buckRoot == null) {
        return new Map();
      }

      const target = (yield (_nuclideBuckRpc || _load_nuclideBuckRpc()).getOwners(buckRoot, src, TARGET_KIND_REGEX)).find(function (x) {
        return x.indexOf(DEFAULT_HEADERS_TARGET) === -1;
      });

      if (target == null) {
        return new Map();
      }

      const key = buckRoot + ':' + target;
      let cached = _this11._cachedBuckFlags.get(key);
      if (cached != null) {
        return cached;
      }
      cached = _this11._loadFlagsForBuckTarget(buckRoot, target);
      _this11._cachedBuckFlags.set(key, cached);
      return cached;
    })();
  }

  _loadFlagsForBuckTarget(buckProjectRoot, target) {
    var _this12 = this;

    return (0, _asyncToGenerator.default)(function* () {
      // TODO(t12973165): Allow configuring a custom flavor.
      // For now, this seems to use cxx.default_platform, which tends to be correct.
      const buildTarget = target + '#compilation-database';
      // Since this is a background process, avoid stressing the system.
      const maxLoad = _os.default.cpus().length / 2;
      const buildReport = yield (_nuclideBuckRpc || _load_nuclideBuckRpc()).build(buckProjectRoot, [
      // Small builds, like those used for a compilation database, can degrade overall
      // `buck build` performance by unnecessarily invalidating the Action Graph cache.
      // See https://buckbuild.com/concept/buckconfig.html#client.skip-action-graph-cache
      // for details on the importance of using skip-action-graph-cache=true.
      '--config', 'client.skip-action-graph-cache=true', buildTarget, '-L', String(maxLoad)], { commandOptions: { timeout: BUCK_TIMEOUT } });
      if (!buildReport.success) {
        const error = `Failed to build ${buildTarget}`;
        logger.error(error);
        throw error;
      }
      let pathToCompilationDatabase = buildReport.results[buildTarget].output;
      pathToCompilationDatabase = (_nuclideUri || _load_nuclideUri()).default.join(buckProjectRoot, pathToCompilationDatabase);

      const compilationDatabase = JSON.parse((yield (_fsPromise || _load_fsPromise()).default.readFile(pathToCompilationDatabase, 'utf8')));

      const flags = new Map();
      const buildFile = yield (_nuclideBuckRpc || _load_nuclideBuckRpc()).getBuildFile(buckProjectRoot, target);
      compilationDatabase.forEach(function (item) {
        const { file } = item;
        const result = {
          rawData: {
            flags: item.arguments,
            file,
            directory: buckProjectRoot
          },
          flagsFile: buildFile
        };
        flags.set(file, result);
        _this12._pathToFlags.set(file, Promise.resolve(result));
      });
      return flags;
    })();
  }

  // The file may be new. Look for a nearby BUCK or TARGETS file.
  static _guessBuildFile(file) {
    return (0, _asyncToGenerator.default)(function* () {
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
    })();
  }

  static sanitizeCommand(sourceFile, args_, basePath) {
    // The first string is always the path to the compiler (g++, clang)
    let args = args_.slice(1);
    // For safety, create a new copy of the array. We exclude the path to the file to compile from
    // compilation database generated by Buck. It must be removed from the list of command-line
    // arguments passed to libclang.
    const normalizedSourceFile = (_nuclideUri || _load_nuclideUri()).default.normalize(sourceFile);
    args = args.filter(arg => normalizedSourceFile !== arg && normalizedSourceFile !== (_nuclideUri || _load_nuclideUri()).default.resolve(basePath, arg));

    // Resolve relative path arguments against the Buck project root.
    args.forEach((arg, argIndex) => {
      if (CLANG_FLAGS_THAT_TAKE_PATHS.has(arg)) {
        const nextIndex = argIndex + 1;
        let filePath = overrideIncludePath(args[nextIndex]);
        if (!(_nuclideUri || _load_nuclideUri()).default.isAbsolute(filePath)) {
          filePath = (_nuclideUri || _load_nuclideUri()).default.join(basePath, filePath);
        }
        args[nextIndex] = filePath;
      } else if (SINGLE_LETTER_CLANG_FLAGS_THAT_TAKE_PATHS.has(arg.substring(0, 2))) {
        let filePath = overrideIncludePath(arg.substring(2));
        if (!(_nuclideUri || _load_nuclideUri()).default.isAbsolute(filePath)) {
          filePath = (_nuclideUri || _load_nuclideUri()).default.join(basePath, filePath);
        }
        args[argIndex] = arg.substring(0, 2) + filePath;
      }
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