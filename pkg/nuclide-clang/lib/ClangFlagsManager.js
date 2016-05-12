Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === 'function') { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError('The decorator for method ' + descriptor.key + ' is of the invalid type ' + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _fs2;

function _fs() {
  return _fs2 = _interopRequireDefault(require('fs'));
}

var _path2;

function _path() {
  return _path2 = _interopRequireDefault(require('path'));
}

var _rxjs2;

function _rxjs() {
  return _rxjs2 = require('rxjs');
}

var _shellQuote2;

function _shellQuote() {
  return _shellQuote2 = require('shell-quote');
}

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../nuclide-analytics');
}

var _nuclideCommons2;

function _nuclideCommons() {
  return _nuclideCommons2 = require('../../nuclide-commons');
}

var _nuclideLogging2;

function _nuclideLogging() {
  return _nuclideLogging2 = require('../../nuclide-logging');
}

var _nuclideBuckBaseLibBuckProject2;

function _nuclideBuckBaseLibBuckProject() {
  return _nuclideBuckBaseLibBuckProject2 = require('../../nuclide-buck-base/lib/BuckProject');
}

var _utils2;

function _utils() {
  return _utils2 = require('./utils');
}

var logger = (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)();

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

var ClangFlagsManager = (function () {
  function ClangFlagsManager(buckUtils) {
    _classCallCheck(this, ClangFlagsManager);

    this.pathToFlags = new Map();
    this._buckUtils = buckUtils;
    this._cachedBuckProjects = new Map();
    this._compilationDatabases = new Set();
    this._realpathCache = {};
    this._flagFileObservables = new Map();
  }

  _createDecoratedClass(ClangFlagsManager, [{
    key: 'reset',
    value: function reset() {
      this.pathToFlags.clear();
      this._cachedBuckProjects.clear();
      this._compilationDatabases.clear();
      this._realpathCache = {};
      this._flagFileObservables.clear();
    }
  }, {
    key: '_getBuckProject',
    value: _asyncToGenerator(function* (src) {
      // For now, if a user requests the flags for a path outside of a Buck project,
      // such as /Applications/Xcode.app/Contents/Developer/Platforms/..., then
      // return null. Going forward, we probably want to special-case some of the
      // paths under /Applications/Xcode.app so that click-to-symbol works in
      // files like Frameworks/UIKit.framework/Headers/UIImage.h.
      var buckProjectRoot = yield this._buckUtils.getBuckProjectRoot(src);
      if (buckProjectRoot == null) {
        logger.info('Did not try to attempt to get flags from Buck because ' + 'source file %s does not appear to be part of a Buck project.', src);
        return null;
      }

      if (this._cachedBuckProjects.has(buckProjectRoot)) {
        return this._cachedBuckProjects.get(buckProjectRoot);
      }

      var buckProject = new (_nuclideBuckBaseLibBuckProject2 || _nuclideBuckBaseLibBuckProject()).BuckProject({ rootPath: buckProjectRoot });
      this._cachedBuckProjects.set(buckProjectRoot, buckProject);
      return buckProject;
    })

    /**
     * @return a space-delimited string of flags or null if nothing is known
     *     about the src file. For example, null will be returned if src is not
     *     under the project root.
     */
  }, {
    key: 'getFlagsForSrc',
    value: _asyncToGenerator(function* (src) {
      var flags = this.pathToFlags.get(src);
      if (flags !== undefined) {
        return flags;
      }
      flags = yield this._getFlagsForSrcImpl(src);
      this.pathToFlags.set(src, flags);
      return flags;
    })
  }, {
    key: '_getFlagsForSrcImpl',
    decorators: [(0, (_nuclideAnalytics2 || _nuclideAnalytics()).trackTiming)('nuclide-clang.get-flags')],
    value: _asyncToGenerator(function* (src) {
      // Look for a manually provided compilation database.
      var dbDir = yield (_nuclideCommons2 || _nuclideCommons()).fsPromise.findNearestFile(COMPILATION_DATABASE_FILE, (_path2 || _path()).default.dirname(src));
      if (dbDir != null) {
        var dbFile = (_path2 || _path()).default.join(dbDir, COMPILATION_DATABASE_FILE);
        yield this._loadFlagsFromCompilationDatabase(dbFile);
        var _flags = this.pathToFlags.get(src);
        if (_flags != null) {
          return _flags;
        }
      }

      var buckFlags = yield this._loadFlagsFromBuck(src);
      if ((0, (_utils2 || _utils()).isHeaderFile)(src)) {
        // Accept flags from any source file in the target.
        if (buckFlags.size > 0) {
          return buckFlags.values().next().value;
        }
        // Try finding flags for a related source file.
        var sourceFile = yield ClangFlagsManager._findSourceFileForHeader(src);
        if (sourceFile != null) {
          return this.getFlagsForSrc(sourceFile);
        }
      }

      var flags = this.pathToFlags.get(src);
      if (flags != null) {
        return flags;
      }

      // Even if we can't get flags, try to watch the build file in case they get added.
      var buildFile = yield ClangFlagsManager._guessBuildFile(src);
      if (buildFile != null) {
        return {
          flags: null,
          changes: this._watchFlagFile(buildFile)
        };
      }

      return null;
    })
  }, {
    key: '_loadFlagsFromCompilationDatabase',
    value: _asyncToGenerator(function* (dbFile) {
      var _this = this;

      if (this._compilationDatabases.has(dbFile)) {
        return;
      }

      try {
        yield* (function* () {
          var contents = yield (_nuclideCommons2 || _nuclideCommons()).fsPromise.readFile(dbFile);
          var data = JSON.parse(contents);
          (0, (_assert2 || _assert()).default)(data instanceof Array);
          var changes = _this._watchFlagFile(dbFile);
          yield Promise.all(data.map(_asyncToGenerator(function* (entry) {
            var command = entry.command;
            var file = entry.file;

            var directory = yield (_nuclideCommons2 || _nuclideCommons()).fsPromise.realpath(entry.directory, _this._realpathCache);
            var args = ClangFlagsManager.parseArgumentsFromCommand(command);
            var filename = (_path2 || _path()).default.resolve(directory, file);
            if (yield (_nuclideCommons2 || _nuclideCommons()).fsPromise.exists(filename)) {
              var realpath = yield (_nuclideCommons2 || _nuclideCommons()).fsPromise.realpath(filename, _this._realpathCache);
              _this.pathToFlags.set(realpath, {
                flags: ClangFlagsManager.sanitizeCommand(file, args, directory),
                changes: changes
              });
            }
          })));
          _this._compilationDatabases.add(dbFile);
        })();
      } catch (e) {
        logger.error('Error reading compilation flags from ' + dbFile, e);
      }
    })
  }, {
    key: '_loadFlagsFromBuck',
    value: _asyncToGenerator(function* (src) {
      var _this2 = this;

      var flags = new Map();
      var buckProject = yield this._getBuckProject(src);
      if (!buckProject) {
        return flags;
      }

      var target = (yield buckProject.getOwner(src)).find(function (x) {
        return x.indexOf(DEFAULT_HEADERS_TARGET) === -1;
      });

      if (target == null) {
        return flags;
      }

      // TODO(mbolin): The architecture should be chosen from a dropdown menu like
      // it is in Xcode rather than hardcoding things to iphonesimulator-x86_64.
      var arch = undefined;
      if (process.platform === 'darwin') {
        arch = 'iphonesimulator-x86_64';
      } else {
        arch = 'default';
      }
      // TODO(mbolin): Need logic to make sure results are restricted to
      // apple_library or apple_binary rules. In practice, this should be OK for
      // now. Though once we start supporting ordinary .cpp files, then we
      // likely need to be even more careful about choosing the architecture
      // flavor.
      var buildTarget = target + '#compilation-database,' + arch;

      var buildReport = yield buckProject.build([buildTarget]);
      if (!buildReport.success) {
        // TODO(mbolin): Frequently failing due to 'Daemon is busy' errors.
        // Ultimately, Buck should queue things up, but for now, Nuclide should.
        var error = 'Failed to build ' + buildTarget;
        logger.error(error);
        throw error;
      }
      var buckProjectRoot = yield buckProject.getPath();
      var pathToCompilationDatabase = buildReport['results'][buildTarget]['output'];
      pathToCompilationDatabase = (_path2 || _path()).default.join(buckProjectRoot, pathToCompilationDatabase);

      var compilationDatabaseJsonBuffer = yield (_nuclideCommons2 || _nuclideCommons()).fsPromise.readFile(pathToCompilationDatabase);
      var compilationDatabaseJson = compilationDatabaseJsonBuffer.toString('utf8');
      var compilationDatabase = JSON.parse(compilationDatabaseJson);

      var buildFile = yield buckProject.getBuildFile(target);
      var changes = buildFile == null ? (_rxjs2 || _rxjs()).Observable.empty() : this._watchFlagFile(buildFile);
      compilationDatabase.forEach(function (item) {
        var file = item.file;

        var result = {
          flags: ClangFlagsManager.sanitizeCommand(file, item.arguments, buckProjectRoot),
          changes: changes
        };
        flags.set(file, result);
        _this2.pathToFlags.set(file, result);
      });
      return flags;
    })
  }, {
    key: '_watchFlagFile',
    value: function _watchFlagFile(flagFile) {
      var existing = this._flagFileObservables.get(flagFile);
      if (existing != null) {
        return existing;
      }
      var flagFileDir = (_path2 || _path()).default.dirname(flagFile);
      var flagFileBase = (_path2 || _path()).default.basename(flagFile);
      var observable = (_rxjs2 || _rxjs()).Observable.create(function (obs) {
        var watcher = (_fs2 || _fs()).default.watch(flagFileDir, {}, function (event, filename) {
          if (filename === flagFileBase) {
            obs.next(event);
          }
        });
        watcher.on('error', function (err) {
          logger.error('Could not watch file ' + flagFile, err);
          obs.error(err);
        });
        return {
          unsubscribe: function unsubscribe() {
            watcher.close();
          }
        };
      }).share();
      this._flagFileObservables.set(flagFile, observable);
      return observable;
    }

    // The file may be new. Look for a nearby BUCK or TARGETS file.
  }], [{
    key: '_guessBuildFile',
    value: _asyncToGenerator(function* (file) {
      var dir = (_path2 || _path()).default.dirname(file);
      var bestMatch = null;
      yield Promise.all(['BUCK', 'TARGETS', 'compile_commands.json'].map(_asyncToGenerator(function* (name) {
        var nearestDir = yield (_nuclideCommons2 || _nuclideCommons()).fsPromise.findNearestFile(name, dir);
        if (nearestDir != null) {
          var match = (_path2 || _path()).default.join(nearestDir, name);
          // Return the closest (most specific) match.
          if (bestMatch == null || match.length > bestMatch.length) {
            bestMatch = match;
          }
        }
      })));
      return bestMatch;
    })
  }, {
    key: 'parseArgumentsFromCommand',
    value: function parseArgumentsFromCommand(command) {
      var result = [];
      // shell-quote returns objects for things like pipes.
      // This should never happen with proper flags, but ignore them to be safe.
      for (var arg of (0, (_shellQuote2 || _shellQuote()).parse)(command)) {
        if (typeof arg !== 'string') {
          break;
        }
        result.push(arg);
      }
      return result;
    }
  }, {
    key: 'sanitizeCommand',
    value: function sanitizeCommand(sourceFile, args, basePath) {
      // For safety, create a new copy of the array. We exclude the path to the file to compile from
      // compilation database generated by Buck. It must be removed from the list of command-line
      // arguments passed to libclang.
      var normalizedSourceFile = (_path2 || _path()).default.normalize(sourceFile);
      args = args.filter(function (arg) {
        return normalizedSourceFile !== arg && normalizedSourceFile !== (_path2 || _path()).default.resolve(basePath, arg);
      });

      // Resolve relative path arguments against the Buck project root.
      args.forEach(function (arg, argIndex) {
        if (CLANG_FLAGS_THAT_TAKE_PATHS.has(arg)) {
          var nextIndex = argIndex + 1;
          var filePath = args[nextIndex];
          if (!(_path2 || _path()).default.isAbsolute(filePath)) {
            filePath = (_path2 || _path()).default.join(basePath, filePath);
            args[nextIndex] = filePath;
          }
        } else if (SINGLE_LETTER_CLANG_FLAGS_THAT_TAKE_PATHS.has(arg.substring(0, 2))) {
          var filePath = arg.substring(2);
          if (!(_path2 || _path()).default.isAbsolute(filePath)) {
            filePath = (_path2 || _path()).default.join(basePath, filePath);
            args[argIndex] = arg.substring(0, 2) + filePath;
          }
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
    value: _asyncToGenerator(function* (header) {
      // Basic implementation: look at files in the same directory for paths
      // with matching file names.
      // TODO(#10028531): Scan through source files to find those that include
      // the header file.
      var dir = (_path2 || _path()).default.dirname(header);
      var files = yield (_nuclideCommons2 || _nuclideCommons()).fsPromise.readdir(dir);
      var basename = ClangFlagsManager._getFileBasename(header);
      for (var file of files) {
        if ((0, (_utils2 || _utils()).isSourceFile)(file) && ClangFlagsManager._getFileBasename(file) === basename) {
          return (_path2 || _path()).default.join(dir, file);
        }
      }
      return null;
    })

    // Strip off the extension and conventional suffixes like "Internal" and "-inl".
  }, {
    key: '_getFileBasename',
    value: function _getFileBasename(file) {
      var basename = (_path2 || _path()).default.basename(file);
      var ext = basename.lastIndexOf('.');
      if (ext !== -1) {
        basename = basename.substr(0, ext);
      }
      return basename.replace(/(Internal|-inl)$/, '');
    }
  }]);

  return ClangFlagsManager;
})();

module.exports = ClangFlagsManager;

// Emits file change events for the underlying flags file.
// (rename, change)

// Watch config files (TARGETS/BUCK/compile_commands.json) for changes.