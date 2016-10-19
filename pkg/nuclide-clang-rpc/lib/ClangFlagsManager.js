Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === 'function') { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError('The decorator for method ' + descriptor.key + ' is of the invalid type ' + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _assert;

function _load_assert() {
  return _assert = _interopRequireDefault(require('assert'));
}

var _os;

function _load_os() {
  return _os = _interopRequireDefault(require('os'));
}

var _commonsNodeNuclideUri;

function _load_commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _commonsNodeString;

function _load_commonsNodeString() {
  return _commonsNodeString = require('../../commons-node/string');
}

var _rxjsBundlesRxMinJs;

function _load_rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _commonsNodeFsPromise;

function _load_commonsNodeFsPromise() {
  return _commonsNodeFsPromise = _interopRequireDefault(require('../../commons-node/fsPromise'));
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

var logger = (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)();

var BUCK_TIMEOUT = 10 * 60 * 1000;

var COMPILATION_DATABASE_FILE = 'compile_commands.json';
/**
 * Facebook puts all headers in a <target>:__default_headers__ build target by default.
 * This target will never produce compilation flags, so make sure to ignore it.
 */
var DEFAULT_HEADERS_TARGET = '__default_headers__';

var CLANG_FLAGS_THAT_TAKE_PATHS = new Set(['-F', '-I', '-include', '-iquote', '-isysroot', '-isystem']);

var SINGLE_LETTER_CLANG_FLAGS_THAT_TAKE_PATHS = new Set(Array.from(CLANG_FLAGS_THAT_TAKE_PATHS).filter(function (item) {
  return item.length === 2;
}));

var INCLUDE_SEARCH_TIMEOUT = 15000;

var _overrideIncludePath = undefined;
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

var ClangFlagsManager = (function () {
  function ClangFlagsManager() {
    _classCallCheck(this, ClangFlagsManager);

    this._pathToFlags = new Map();
    this._cachedBuckFlags = new Map();
    this._compilationDatabases = new Set();
    this._realpathCache = {};
  }

  _createDecoratedClass(ClangFlagsManager, [{
    key: 'reset',
    value: function reset() {
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
  }, {
    key: 'getFlagsForSrc',
    value: _asyncToGenerator(function* (src) {
      var data = yield this._getFlagsForSrcCached(src);
      if (data == null) {
        return null;
      }
      if (data.flags === undefined) {
        var _rawData = data.rawData;

        if (_rawData == null) {
          data.flags = null;
        } else {
          var _flags = _rawData.flags;

          if (typeof _flags === 'string') {
            _flags = (0, (_commonsNodeString || _load_commonsNodeString()).shellParse)(_flags);
          }
          data.flags = ClangFlagsManager.sanitizeCommand(_rawData.file, _flags, _rawData.directory);
        }
      }
      return data;
    })
  }, {
    key: '_getFlagsForSrcCached',
    value: function _getFlagsForSrcCached(src) {
      var cached = this._pathToFlags.get(src);
      if (cached == null) {
        cached = this._getFlagsForSrcImpl(src);
        this._pathToFlags.set(src, cached);
      }
      return cached;
    }
  }, {
    key: '_getFlagsForSrcImpl',
    decorators: [(0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)('nuclide-clang.get-flags')],
    value: _asyncToGenerator(function* (src) {
      // Look for a manually provided compilation database.
      var dbDir = yield (_commonsNodeFsPromise || _load_commonsNodeFsPromise()).default.findNearestFile(COMPILATION_DATABASE_FILE, (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.dirname(src));
      if (dbDir != null) {
        var dbFile = (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.join(dbDir, COMPILATION_DATABASE_FILE);
        var dbFlags = yield this._loadFlagsFromCompilationDatabase(dbFile);
        var _flags2 = dbFlags.get(src);
        if (_flags2 != null) {
          return _flags2;
        }
      }

      var buckFlags = yield this._loadFlagsFromBuck(src).catch(function (err) {
        logger.error('Error getting flags from Buck', err);
        return new Map();
      });
      if ((0, (_utils || _load_utils()).isHeaderFile)(src)) {
        // Accept flags from any source file in the target.
        if (buckFlags.size > 0) {
          return buckFlags.values().next().value;
        }
        // Try finding flags for a related source file.
        var projectRoot = (yield (_nuclideBuckRpc || _load_nuclideBuckRpc()).getRootForPath(src)) || dbDir;
        // If we don't have a .buckconfig or a compile_commands.json, we won't find flags regardless.
        if (projectRoot == null) {
          return null;
        }
        var sourceFile = yield ClangFlagsManager._findSourceFileForHeader(src, projectRoot);
        if (sourceFile != null) {
          return this._getFlagsForSrcCached(sourceFile);
        }
      }

      var flags = buckFlags.get(src);
      if (flags != null) {
        return flags;
      }

      // Even if we can't get flags, try to watch the build file in case they get added.
      var buildFile = yield ClangFlagsManager._guessBuildFile(src);
      if (buildFile != null) {
        return {
          rawData: null,
          flagsFile: buildFile
        };
      }

      return null;
    })
  }, {
    key: '_loadFlagsFromCompilationDatabase',
    value: _asyncToGenerator(function* (dbFile) {
      var _this = this;

      var flags = new Map();
      if (this._compilationDatabases.has(dbFile)) {
        return flags;
      }

      try {
        var contents = yield (_commonsNodeFsPromise || _load_commonsNodeFsPromise()).default.readFile(dbFile, 'utf8');
        var data = JSON.parse(contents);
        (0, (_assert || _load_assert()).default)(data instanceof Array);
        yield Promise.all(data.map(_asyncToGenerator(function* (entry) {
          var command = entry.command;
          var file = entry.file;

          var directory = yield (_commonsNodeFsPromise || _load_commonsNodeFsPromise()).default.realpath(entry.directory, _this._realpathCache);
          var filename = (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.resolve(directory, file);
          if (yield (_commonsNodeFsPromise || _load_commonsNodeFsPromise()).default.exists(filename)) {
            var realpath = yield (_commonsNodeFsPromise || _load_commonsNodeFsPromise()).default.realpath(filename, _this._realpathCache);
            var result = {
              rawData: {
                flags: command,
                file: file,
                directory: directory
              },
              flagsFile: dbFile
            };
            flags.set(realpath, result);
            _this._pathToFlags.set(realpath, Promise.resolve(result));
          }
        })));
        this._compilationDatabases.add(dbFile);
      } catch (e) {
        logger.error('Error reading compilation flags from ' + dbFile, e);
      }
      return flags;
    })
  }, {
    key: '_loadFlagsFromBuck',
    value: _asyncToGenerator(function* (src) {
      var buckRoot = yield (_nuclideBuckRpc || _load_nuclideBuckRpc()).getRootForPath(src);
      if (buckRoot == null) {
        return new Map();
      }

      var target = (yield (_nuclideBuckRpc || _load_nuclideBuckRpc()).getOwners(buckRoot, src)).find(function (x) {
        return x.indexOf(DEFAULT_HEADERS_TARGET) === -1;
      });

      if (target == null) {
        return new Map();
      }

      var key = buckRoot + ':' + target;
      var cached = this._cachedBuckFlags.get(key);
      if (cached != null) {
        return cached;
      }
      cached = this._loadFlagsForBuckTarget(buckRoot, target);
      this._cachedBuckFlags.set(key, cached);
      return cached;
    })
  }, {
    key: '_loadFlagsForBuckTarget',
    value: _asyncToGenerator(function* (buckProjectRoot, target) {
      var _this2 = this;

      // TODO(mbolin): The architecture should be chosen from a dropdown menu like
      // it is in Xcode rather than hardcoding things to iphonesimulator-x86_64.
      var arch = undefined;
      if (process.platform === 'darwin') {
        arch = 'iphonesimulator-x86_64';
      } else {
        arch = 'default';
      }
      var buildTarget = target + '#compilation-database,' + arch;
      // Since this is a background process, avoid stressing the system.
      var maxLoad = (_os || _load_os()).default.cpus().length / 2;
      var buildReport = yield (_nuclideBuckRpc || _load_nuclideBuckRpc()).build(buckProjectRoot, [buildTarget, '-L', String(maxLoad)], { commandOptions: { timeout: BUCK_TIMEOUT } });
      if (!buildReport.success) {
        var error = 'Failed to build ' + buildTarget;
        logger.error(error);
        throw error;
      }
      var pathToCompilationDatabase = buildReport.results[buildTarget].output;
      pathToCompilationDatabase = (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.join(buckProjectRoot, pathToCompilationDatabase);

      var compilationDatabase = JSON.parse((yield (_commonsNodeFsPromise || _load_commonsNodeFsPromise()).default.readFile(pathToCompilationDatabase, 'utf8')));

      var flags = new Map();
      var buildFile = yield (_nuclideBuckRpc || _load_nuclideBuckRpc()).getBuildFile(buckProjectRoot, target);
      compilationDatabase.forEach(function (item) {
        var file = item.file;

        var result = {
          rawData: {
            flags: item.arguments,
            file: file,
            directory: buckProjectRoot
          },
          flagsFile: buildFile
        };
        flags.set(file, result);
        _this2._pathToFlags.set(file, Promise.resolve(result));
      });
      return flags;
    })

    // The file may be new. Look for a nearby BUCK or TARGETS file.
  }], [{
    key: '_guessBuildFile',
    value: _asyncToGenerator(function* (file) {
      var dir = (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.dirname(file);
      var bestMatch = null;
      yield Promise.all(['BUCK', 'TARGETS', 'compile_commands.json'].map(_asyncToGenerator(function* (name) {
        var nearestDir = yield (_commonsNodeFsPromise || _load_commonsNodeFsPromise()).default.findNearestFile(name, dir);
        if (nearestDir != null) {
          var match = (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.join(nearestDir, name);
          // Return the closest (most specific) match.
          if (bestMatch == null || match.length > bestMatch.length) {
            bestMatch = match;
          }
        }
      })));
      return bestMatch;
    })
  }, {
    key: 'sanitizeCommand',
    value: function sanitizeCommand(sourceFile, args_, basePath) {
      var args = args_;
      // For safety, create a new copy of the array. We exclude the path to the file to compile from
      // compilation database generated by Buck. It must be removed from the list of command-line
      // arguments passed to libclang.
      var normalizedSourceFile = (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.normalize(sourceFile);
      args = args.filter(function (arg) {
        return normalizedSourceFile !== arg && normalizedSourceFile !== (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.resolve(basePath, arg);
      });

      // Resolve relative path arguments against the Buck project root.
      args.forEach(function (arg, argIndex) {
        if (CLANG_FLAGS_THAT_TAKE_PATHS.has(arg)) {
          var nextIndex = argIndex + 1;
          var filePath = overrideIncludePath(args[nextIndex]);
          if (!(_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.isAbsolute(filePath)) {
            filePath = (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.join(basePath, filePath);
          }
          args[nextIndex] = filePath;
        } else if (SINGLE_LETTER_CLANG_FLAGS_THAT_TAKE_PATHS.has(arg.substring(0, 2))) {
          var filePath = overrideIncludePath(arg.substring(2));
          if (!(_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.isAbsolute(filePath)) {
            filePath = (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.join(basePath, filePath);
          }
          args[argIndex] = arg.substring(0, 2) + filePath;
        }
      });

      // If an output file is specified, remove that argument.
      var index = args.indexOf('-o');
      if (index !== -1) {
        args.splice(index, 2);
      }

      return args;
    }
  }, {
    key: '_findSourceFileForHeader',
    value: _asyncToGenerator(function* (header, projectRoot) {
      // Basic implementation: look at files in the same directory for paths
      // with matching file names.
      var dir = (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.dirname(header);
      var files = yield (_commonsNodeFsPromise || _load_commonsNodeFsPromise()).default.readdir(dir);
      var basename = ClangFlagsManager._getFileBasename(header);
      for (var _file of files) {
        if ((0, (_utils || _load_utils()).isSourceFile)(_file) && ClangFlagsManager._getFileBasename(_file) === basename) {
          return (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.join(dir, _file);
        }
      }

      // Try searching all subdirectories for source files that include this header.
      // Give up after INCLUDE_SEARCH_TIMEOUT.
      return (0, (_utils || _load_utils()).findIncludingSourceFile)(header, projectRoot).timeout(INCLUDE_SEARCH_TIMEOUT).catch(function () {
        return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.of(null);
      }).toPromise();
    })

    // Strip off the extension and conventional suffixes like "Internal" and "-inl".
  }, {
    key: '_getFileBasename',
    value: function _getFileBasename(file) {
      var basename = (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.basename(file);
      var ext = basename.lastIndexOf('.');
      if (ext !== -1) {
        basename = basename.substr(0, ext);
      }
      return basename.replace(/(Internal|-inl)$/, '');
    }
  }]);

  return ClangFlagsManager;
})();

exports.default = ClangFlagsManager;
module.exports = exports.default;

// Will be computed and memoized from rawData on demand.