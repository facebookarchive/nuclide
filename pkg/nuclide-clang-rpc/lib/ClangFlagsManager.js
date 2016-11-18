'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _dec, _desc, _value, _class;

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

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
  var desc = {};
  Object['ke' + 'ys'](descriptor).forEach(function (key) {
    desc[key] = descriptor[key];
  });
  desc.enumerable = !!desc.enumerable;
  desc.configurable = !!desc.configurable;

  if ('value' in desc || desc.initializer) {
    desc.writable = true;
  }

  desc = decorators.slice().reverse().reduce(function (desc, decorator) {
    return decorator(target, property, desc) || desc;
  }, desc);

  if (context && desc.initializer !== void 0) {
    desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
    desc.initializer = undefined;
  }

  if (desc.initializer === void 0) {
    Object['define' + 'Property'](target, property, desc);
    desc = null;
  }

  return desc;
}

const logger = (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)();

const BUCK_TIMEOUT = 10 * 60 * 1000;

const COMPILATION_DATABASE_FILE = 'compile_commands.json';
/**
 * Facebook puts all headers in a <target>:__default_headers__ build target by default.
 * This target will never produce compilation flags, so make sure to ignore it.
 */
const DEFAULT_HEADERS_TARGET = '__default_headers__';

const CLANG_FLAGS_THAT_TAKE_PATHS = new Set(['-F', '-I', '-include', '-iquote', '-isysroot', '-isystem']);

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

let ClangFlagsManager = (_dec = (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)('nuclide-clang.get-flags'), (_class = class ClangFlagsManager {

  constructor() {
    this._pathToFlags = new Map();
    this._cachedBuckFlags = new Map();
    this._compilationDatabases = new Set();
    this._realpathCache = {};
  }

  reset() {
    this._pathToFlags.clear();
    this._cachedBuckFlags.clear();
    this._compilationDatabases.clear();
    this._realpathCache = {};
  }

  /**
   * @return a space-delimited string of flags or null if nothing is known
   *     about the src file. For example, null will be returned if src is not
   *     under the project root.
   */
  getFlagsForSrc(src) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const data = yield _this._getFlagsForSrcCached(src);
      if (data == null) {
        return null;
      }
      if (data.flags === undefined) {
        const rawData = data.rawData;

        if (rawData == null) {
          data.flags = null;
        } else {
          let flags = rawData.flags;

          if (typeof flags === 'string') {
            flags = (0, (_string || _load_string()).shellParse)(flags);
          }
          data.flags = ClangFlagsManager.sanitizeCommand(rawData.file, flags, rawData.directory);
        }
      }
      return data;
    })();
  }

  _getFlagsForSrcCached(src) {
    let cached = this._pathToFlags.get(src);
    if (cached == null) {
      cached = this._getFlagsForSrcImpl(src);
      this._pathToFlags.set(src, cached);
    }
    return cached;
  }

  _getFlagsForSrcImpl(src) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      // Look for a manually provided compilation database.
      const dbDir = yield (_fsPromise || _load_fsPromise()).default.findNearestFile(COMPILATION_DATABASE_FILE, (_nuclideUri || _load_nuclideUri()).default.dirname(src));
      if (dbDir != null) {
        const dbFile = (_nuclideUri || _load_nuclideUri()).default.join(dbDir, COMPILATION_DATABASE_FILE);
        const dbFlags = yield _this2._loadFlagsFromCompilationDatabase(dbFile);
        const flags = dbFlags.get(src);
        if (flags != null) {
          return flags;
        }
      }

      const buckFlags = yield _this2._loadFlagsFromBuck(src).catch(function (err) {
        logger.error('Error getting flags from Buck', err);
        return new Map();
      });
      if ((0, (_utils || _load_utils()).isHeaderFile)(src)) {
        // Accept flags from any source file in the target.
        if (buckFlags.size > 0) {
          return buckFlags.values().next().value;
        }
        // Try finding flags for a related source file.
        const projectRoot = (yield (_nuclideBuckRpc || _load_nuclideBuckRpc()).getRootForPath(src)) || dbDir;
        // If we don't have a .buckconfig or a compile_commands.json, we won't find flags regardless.
        if (projectRoot == null) {
          return null;
        }
        const sourceFile = yield ClangFlagsManager._findSourceFileForHeader(src, projectRoot);
        if (sourceFile != null) {
          return _this2._getFlagsForSrcCached(sourceFile);
        }
      }

      const flags = buckFlags.get(src);
      if (flags != null) {
        return flags;
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

  _loadFlagsFromCompilationDatabase(dbFile) {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const flags = new Map();
      if (_this3._compilationDatabases.has(dbFile)) {
        return flags;
      }

      try {
        const contents = yield (_fsPromise || _load_fsPromise()).default.readFile(dbFile, 'utf8');
        const data = JSON.parse(contents);

        if (!(data instanceof Array)) {
          throw new Error('Invariant violation: "data instanceof Array"');
        }

        const dbDir = (_nuclideUri || _load_nuclideUri()).default.dirname(dbFile);
        yield Promise.all(data.map((() => {
          var _ref = (0, _asyncToGenerator.default)(function* (entry) {
            const command = entry.command,
                  file = entry.file;

            const directory = yield (_fsPromise || _load_fsPromise()).default.realpath(
            // Relative directories aren't part of the spec, but resolving them
            // relative to the compile_commands.json location seems reasonable.
            (_nuclideUri || _load_nuclideUri()).default.resolve(dbDir, entry.directory), _this3._realpathCache);
            const filename = (_nuclideUri || _load_nuclideUri()).default.resolve(directory, file);
            if (yield (_fsPromise || _load_fsPromise()).default.exists(filename)) {
              const realpath = yield (_fsPromise || _load_fsPromise()).default.realpath(filename, _this3._realpathCache);
              const result = {
                rawData: {
                  flags: command,
                  file: file,
                  directory: directory
                },
                flagsFile: dbFile
              };
              flags.set(realpath, result);
              _this3._pathToFlags.set(realpath, Promise.resolve(result));
            }
          });

          return function (_x) {
            return _ref.apply(this, arguments);
          };
        })()));
        _this3._compilationDatabases.add(dbFile);
      } catch (e) {
        logger.error(`Error reading compilation flags from ${ dbFile }`, e);
      }
      return flags;
    })();
  }

  _loadFlagsFromBuck(src) {
    var _this4 = this;

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
      let cached = _this4._cachedBuckFlags.get(key);
      if (cached != null) {
        return cached;
      }
      cached = _this4._loadFlagsForBuckTarget(buckRoot, target);
      _this4._cachedBuckFlags.set(key, cached);
      return cached;
    })();
  }

  _loadFlagsForBuckTarget(buckProjectRoot, target) {
    var _this5 = this;

    return (0, _asyncToGenerator.default)(function* () {
      // TODO(t12973165): Allow configuring a custom flavor.
      // For now, this seems to use cxx.default_platform, which tends to be correct.
      const buildTarget = target + '#compilation-database';
      // Since this is a background process, avoid stressing the system.
      const maxLoad = _os.default.cpus().length / 2;
      const buildReport = yield (_nuclideBuckRpc || _load_nuclideBuckRpc()).build(buckProjectRoot, [buildTarget, '-L', String(maxLoad)], { commandOptions: { timeout: BUCK_TIMEOUT } });
      if (!buildReport.success) {
        const error = `Failed to build ${ buildTarget }`;
        logger.error(error);
        throw error;
      }
      let pathToCompilationDatabase = buildReport.results[buildTarget].output;
      pathToCompilationDatabase = (_nuclideUri || _load_nuclideUri()).default.join(buckProjectRoot, pathToCompilationDatabase);

      const compilationDatabase = JSON.parse((yield (_fsPromise || _load_fsPromise()).default.readFile(pathToCompilationDatabase, 'utf8')));

      const flags = new Map();
      const buildFile = yield (_nuclideBuckRpc || _load_nuclideBuckRpc()).getBuildFile(buckProjectRoot, target);
      compilationDatabase.forEach(function (item) {
        const file = item.file;

        const result = {
          rawData: {
            flags: item.arguments,
            file: file,
            directory: buckProjectRoot
          },
          flagsFile: buildFile
        };
        flags.set(file, result);
        _this5._pathToFlags.set(file, Promise.resolve(result));
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
}, (_applyDecoratedDescriptor(_class.prototype, '_getFlagsForSrcImpl', [_dec], Object.getOwnPropertyDescriptor(_class.prototype, '_getFlagsForSrcImpl'), _class.prototype)), _class));
exports.default = ClangFlagsManager;
module.exports = exports['default'];