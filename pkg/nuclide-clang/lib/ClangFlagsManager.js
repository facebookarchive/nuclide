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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _reactivexRxjs = require('@reactivex/rxjs');

var _shellQuote = require('shell-quote');

var _nuclideAnalytics = require('../../nuclide-analytics');

var _nuclideCommons = require('../../nuclide-commons');

var _nuclideLogging = require('../../nuclide-logging');

var _nuclideBuckBaseLibBuckProject = require('../../nuclide-buck-base/lib/BuckProject');

var logger = (0, _nuclideLogging.getLogger)();

var COMPILATION_DATABASE_FILE = 'compile_commands.json';
/**
 * Facebook puts all headers in a <target>:__default_headers__ build target by default.
 * This target will never produce compilation flags, so make sure to ignore it.
 */
var DEFAULT_HEADERS_TARGET = '__default_headers__';
var HEADER_EXTENSIONS = new Set(['.h', '.hh', '.hpp', '.hxx', '.h++']);
var SOURCE_EXTENSIONS = new Set(['.c', '.cc', '.cpp', '.cxx', '.c++', 'm', 'mm']);

var CLANG_FLAGS_THAT_TAKE_PATHS = new Set(['-F', '-I', '-include', '-iquote', '-isysroot', '-isystem']);

var SINGLE_LETTER_CLANG_FLAGS_THAT_TAKE_PATHS = new Set(Array.from(CLANG_FLAGS_THAT_TAKE_PATHS).filter(function (item) {
  return item.length === 2;
}));

function isHeaderFile(filename) {
  return HEADER_EXTENSIONS.has(_path2['default'].extname(filename));
}

function isSourceFile(filename) {
  return SOURCE_EXTENSIONS.has(_path2['default'].extname(filename));
}

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

      var buckProject = new _nuclideBuckBaseLibBuckProject.BuckProject({ rootPath: buckProjectRoot });
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
    decorators: [(0, _nuclideAnalytics.trackTiming)('nuclide-clang.get-flags')],
    value: _asyncToGenerator(function* (src) {
      // Look for a manually provided compilation database.
      var dbDir = yield _nuclideCommons.fsPromise.findNearestFile(COMPILATION_DATABASE_FILE, _path2['default'].dirname(src));
      if (dbDir != null) {
        var dbFile = _path2['default'].join(dbDir, COMPILATION_DATABASE_FILE);
        yield this._loadFlagsFromCompilationDatabase(dbFile);
        var _flags = this.pathToFlags.get(src);
        if (_flags != null) {
          return _flags;
        }
      }

      var buckFlags = yield this._loadFlagsFromBuck(src);
      if (isHeaderFile(src)) {
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
          var contents = yield _nuclideCommons.fsPromise.readFile(dbFile);
          var data = JSON.parse(contents);
          (0, _assert2['default'])(data instanceof Array);
          var changes = _this._watchFlagFile(dbFile);
          yield Promise.all(data.map(_asyncToGenerator(function* (entry) {
            var command = entry.command;
            var file = entry.file;

            var directory = yield _nuclideCommons.fsPromise.realpath(entry.directory, _this._realpathCache);
            var args = ClangFlagsManager.parseArgumentsFromCommand(command);
            var filename = _path2['default'].resolve(directory, file);
            if (yield _nuclideCommons.fsPromise.exists(filename)) {
              var realpath = yield _nuclideCommons.fsPromise.realpath(filename, _this._realpathCache);
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
      pathToCompilationDatabase = _path2['default'].join(buckProjectRoot, pathToCompilationDatabase);

      var compilationDatabaseJsonBuffer = yield _nuclideCommons.fsPromise.readFile(pathToCompilationDatabase);
      var compilationDatabaseJson = compilationDatabaseJsonBuffer.toString('utf8');
      var compilationDatabase = JSON.parse(compilationDatabaseJson);

      var buildFile = yield buckProject.getBuildFile(target);
      var changes = buildFile == null ? _reactivexRxjs.Observable.empty() : this._watchFlagFile(buildFile);
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
      var flagFileDir = _path2['default'].dirname(flagFile);
      var flagFileBase = _path2['default'].basename(flagFile);
      var observable = _reactivexRxjs.Observable.create(function (obs) {
        var watcher = _fs2['default'].watch(flagFileDir, {}, function (event, filename) {
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
      var dir = _path2['default'].dirname(file);
      var bestMatch = null;
      yield Promise.all(['BUCK', 'TARGETS', 'compile_commands.json'].map(_asyncToGenerator(function* (name) {
        var nearestDir = yield _nuclideCommons.fsPromise.findNearestFile(name, dir);
        if (nearestDir != null) {
          var match = _path2['default'].join(nearestDir, name);
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
      for (var arg of (0, _shellQuote.parse)(command)) {
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
      var normalizedSourceFile = _path2['default'].normalize(sourceFile);
      args = args.filter(function (arg) {
        return normalizedSourceFile !== arg && normalizedSourceFile !== _path2['default'].resolve(basePath, arg);
      });

      // Resolve relative path arguments against the Buck project root.
      args.forEach(function (arg, argIndex) {
        if (CLANG_FLAGS_THAT_TAKE_PATHS.has(arg)) {
          var nextIndex = argIndex + 1;
          var filePath = args[nextIndex];
          if (!_path2['default'].isAbsolute(filePath)) {
            filePath = _path2['default'].join(basePath, filePath);
            args[nextIndex] = filePath;
          }
        } else if (SINGLE_LETTER_CLANG_FLAGS_THAT_TAKE_PATHS.has(arg.substring(0, 2))) {
          var filePath = arg.substring(2);
          if (!_path2['default'].isAbsolute(filePath)) {
            filePath = _path2['default'].join(basePath, filePath);
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
      var dir = _path2['default'].dirname(header);
      var files = yield _nuclideCommons.fsPromise.readdir(dir);
      var basename = ClangFlagsManager._getFileBasename(header);
      for (var file of files) {
        if (isSourceFile(file) && ClangFlagsManager._getFileBasename(file) === basename) {
          return _path2['default'].join(dir, file);
        }
      }
      return null;
    })

    // Strip off the extension and conventional suffixes like "Internal" and "-inl".
  }, {
    key: '_getFileBasename',
    value: function _getFileBasename(file) {
      var basename = _path2['default'].basename(file);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNsYW5nRmxhZ3NNYW5hZ2VyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O3NCQWFzQixRQUFROzs7O2tCQUNmLElBQUk7Ozs7b0JBQ0YsTUFBTTs7Ozs2QkFDRSxpQkFBaUI7OzBCQUN0QixhQUFhOztnQ0FDUCx5QkFBeUI7OzhCQUMzQix1QkFBdUI7OzhCQUN2Qix1QkFBdUI7OzZDQUNyQix5Q0FBeUM7O0FBRW5FLElBQU0sTUFBTSxHQUFHLGdDQUFXLENBQUM7O0FBRTNCLElBQU0seUJBQXlCLEdBQUcsdUJBQXVCLENBQUM7Ozs7O0FBSzFELElBQU0sc0JBQXNCLEdBQUcscUJBQXFCLENBQUM7QUFDckQsSUFBTSxpQkFBaUIsR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO0FBQ3pFLElBQU0saUJBQWlCLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDOztBQUVwRixJQUFNLDJCQUEyQixHQUFHLElBQUksR0FBRyxDQUFDLENBQzFDLElBQUksRUFDSixJQUFJLEVBQ0osVUFBVSxFQUNWLFNBQVMsRUFDVCxXQUFXLEVBQ1gsVUFBVSxDQUNYLENBQUMsQ0FBQzs7QUFFSCxJQUFNLHlDQUF5QyxHQUFHLElBQUksR0FBRyxDQUN2RCxLQUFLLENBQUMsSUFBSSxDQUFDLDJCQUEyQixDQUFDLENBQ3BDLE1BQU0sQ0FBQyxVQUFBLElBQUk7U0FBSSxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUM7Q0FBQSxDQUFDLENBQ3JDLENBQUM7O0FBRUYsU0FBUyxZQUFZLENBQUMsUUFBZ0IsRUFBVztBQUMvQyxTQUFPLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxrQkFBSyxPQUFPLENBQUMsUUFB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Q2I7Ozs2QkFFb0MsV0FBQyxNQUFjLEVBQW9COzs7OztBQUt0RSxVQUFNLEdBQUcsR0FBRyxrQkFBSyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDakMsVUFBTSxLQUFLLEdBQUcsTUFBTSwwQkFBVSxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDM0MsVUFBTSxRQUFRLEdBQUcsaUJBQWlCLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDNUQsV0FBSyxJQUFNLElBQUksSUFBSSxLQUFLLEVBQUU7QUFDeEIsWUFBSSxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksaUJBQWlCLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLEtBQUssUUFBUSxFQUFFO0FBQy9FLGlCQUFPLGtCQUFLLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7U0FDN0I7T0FDRjtBQUNELGFBQU8sSUFBSSxDQUFDO0tBQ2I7Ozs7O1dBR3NCLDBCQUFDLElBQVksRUFBVTtBQUM1QyxVQUFJLFFBQVEsR0FBRyxrQkFBSyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDbkMsVUFBTSxHQUFHLEdBQUcsUUFBUSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN0QyxVQUFJLEdBQUcsS0FBSyxDQUFDLENBQUMsRUFBRTtBQUNkLGdCQUFRLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7T0FDcEM7QUFDRCxhQUFPLFFBQVEsQ0FBQyxPQUFPLENBQUMsa0JBQWtCLEVBQUUsRUFBRSxDQUFDLENBQUM7S0FDakQ7OztTQXhVRyxpQkFBaUI7OztBQTJVdkIsTUFBTSxDQUFDLE9BQU8sR0FBRyxpQkFBaUIsQ0FBQyIsImZpbGUiOiJDbGFuZ0ZsYWdzTWFuYWdlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtCdWNrVXRpbHN9IGZyb20gJy4uLy4uL251Y2xpZGUtYnVjay1iYXNlL2xpYi9CdWNrVXRpbHMnO1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQge09ic2VydmFibGV9IGZyb20gJ0ByZWFjdGl2ZXgvcnhqcyc7XG5pbXBvcnQge3BhcnNlfSBmcm9tICdzaGVsbC1xdW90ZSc7XG5pbXBvcnQge3RyYWNrVGltaW5nfSBmcm9tICcuLi8uLi9udWNsaWRlLWFuYWx5dGljcyc7XG5pbXBvcnQge2ZzUHJvbWlzZX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1jb21tb25zJztcbmltcG9ydCB7Z2V0TG9nZ2VyfSBmcm9tICcuLi8uLi9udWNsaWRlLWxvZ2dpbmcnO1xuaW1wb3J0IHtCdWNrUHJvamVjdH0gZnJvbSAnLi4vLi4vbnVjbGlkZS1idWNrLWJhc2UvbGliL0J1Y2tQcm9qZWN0JztcblxuY29uc3QgbG9nZ2VyID0gZ2V0TG9nZ2VyKCk7XG5cbmNvbnN0IENPTVBJTEFUSU9OX0RBVEFCQVNFX0ZJTEUgPSAnY29tcGlsZV9jb21tYW5kcy5qc29uJztcbi8qKlxuICogRmFjZWJvb2sgcHV0cyBhbGwgaGVhZGVycyBpbiBhIDx0YXJnZXQ+Ol9fZGVmYXVsdF9oZWFkZXJzX18gYnVpbGQgdGFyZ2V0IGJ5IGRlZmF1bHQuXG4gKiBUaGlzIHRhcmdldCB3aWxsIG5ldmVyIHByb2R1Y2UgY29tcGlsYXRpb24gZmxhZ3MsIHNvIG1ha2Ugc3VyZSB0byBpZ25vcmUgaXQuXG4gKi9cbmNvbnN0IERFRkFVTFRfSEVBREVSU19UQVJHRVQgPSAnX19kZWZhdWx0X2hlYWRlcnNfXyc7XG5jb25zdCBIRUFERVJfRVhURU5TSU9OUyA9IG5ldyBTZXQoWycuaCcsICcuaGgnLCAnLmhwcCcsICcuaHh4JywgJy5oKysnXSk7XG5jb25zdCBTT1VSQ0VfRVhURU5TSU9OUyA9IG5ldyBTZXQoWycuYycsICcuY2MnLCAnLmNwcCcsICcuY3h4JywgJy5jKysnLCAnbScsICdtbSddKTtcblxuY29uc3QgQ0xBTkdfRkxBR1NfVEhBVF9UQUtFX1BBVEhTID0gbmV3IFNldChbXG4gICctRicsXG4gICctSScsXG4gICctaW5jbHVkZScsXG4gICctaXF1b3RlJyxcbiAgJy1pc3lzcm9vdCcsXG4gICctaXN5c3RlbScsXG5dKTtcblxuY29uc3QgU0lOR0xFX0xFVFRFUl9DTEFOR19GTEFHU19USEFUX1RBS0VfUEFUSFMgPSBuZXcgU2V0KFxuICBBcnJheS5mcm9tKENMQU5HX0ZMQUdTX1RIQVRfVEFLRV9QQVRIUylcbiAgICAuZmlsdGVyKGl0ZW0gPT4gaXRlbS5sZW5ndGggPT09IDIpXG4pO1xuXG5mdW5jdGlvbiBpc0hlYWRlckZpbGUoZmlsZW5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4gSEVBREVSX0VYVEVOU0lPTlMuaGFzKHBhdGguZXh0bmFtZShmaWxlbmFtZSkpO1xufVxuXG5mdW5jdGlvbiBpc1NvdXJjZUZpbGUoZmlsZW5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4gU09VUkNFX0VYVEVOU0lPTlMuaGFzKHBhdGguZXh0bmFtZShmaWxlbmFtZSkpO1xufVxuXG5leHBvcnQgdHlwZSBDbGFuZ0ZsYWdzID0ge1xuICBmbGFnczogP0FycmF5PHN0cmluZz47XG4gIC8vIEVtaXRzIGZpbGUgY2hhbmdlIGV2ZW50cyBmb3IgdGhlIHVuZGVybHlpbmcgZmxhZ3MgZmlsZS5cbiAgLy8gKHJlbmFtZSwgY2hhbmdlKVxuICBjaGFuZ2VzOiBPYnNlcnZhYmxlPHN0cmluZz47XG59O1xuXG5jbGFzcyBDbGFuZ0ZsYWdzTWFuYWdlciB7XG4gIF9idWNrVXRpbHM6IEJ1Y2tVdGlscztcbiAgX2NhY2hlZEJ1Y2tQcm9qZWN0czogTWFwPHN0cmluZywgQnVja1Byb2plY3Q+O1xuICBfY29tcGlsYXRpb25EYXRhYmFzZXM6IFNldDxzdHJpbmc+O1xuICBfcmVhbHBhdGhDYWNoZTogT2JqZWN0O1xuICBwYXRoVG9GbGFnczogTWFwPHN0cmluZywgP0NsYW5nRmxhZ3M+O1xuXG4gIC8vIFdhdGNoIGNvbmZpZyBmaWxlcyAoVEFSR0VUUy9CVUNLL2NvbXBpbGVfY29tbWFuZHMuanNvbikgZm9yIGNoYW5nZXMuXG4gIF9mbGFnRmlsZU9ic2VydmFibGVzOiBNYXA8c3RyaW5nLCBPYnNlcnZhYmxlPHN0cmluZz4+O1xuXG4gIGNvbnN0cnVjdG9yKGJ1Y2tVdGlsczogQnVja1V0aWxzKSB7XG4gICAgdGhpcy5wYXRoVG9GbGFncyA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLl9idWNrVXRpbHMgPSBidWNrVXRpbHM7XG4gICAgdGhpcy5fY2FjaGVkQnVja1Byb2plY3RzID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuX2NvbXBpbGF0aW9uRGF0YWJhc2VzID0gbmV3IFNldCgpO1xuICAgIHRoaXMuX3JlYWxwYXRoQ2FjaGUgPSB7fTtcbiAgICB0aGlzLl9mbGFnRmlsZU9ic2VydmFibGVzID0gbmV3IE1hcCgpO1xuICB9XG5cbiAgcmVzZXQoKSB7XG4gICAgdGhpcy5wYXRoVG9GbGFncy5jbGVhcigpO1xuICAgIHRoaXMuX2NhY2hlZEJ1Y2tQcm9qZWN0cy5jbGVhcigpO1xuICAgIHRoaXMuX2NvbXBpbGF0aW9uRGF0YWJhc2VzLmNsZWFyKCk7XG4gICAgdGhpcy5fcmVhbHBhdGhDYWNoZSA9IHt9O1xuICAgIHRoaXMuX2ZsYWdGaWxlT2JzZXJ2YWJsZXMuY2xlYXIoKTtcbiAgfVxuXG4gIGFzeW5jIF9nZXRCdWNrUHJvamVjdChzcmM6IHN0cmluZyk6IFByb21pc2U8P0J1Y2tQcm9qZWN0PiB7XG4gICAgLy8gRm9yIG5vdywgaWYgYSB1c2VyIHJlcXVlc3RzIHRoZSBmbGFncyBmb3IgYSBwYXRoIG91dHNpZGUgb2YgYSBCdWNrIHByb2plY3QsXG4gICAgLy8gc3VjaCBhcyAvQXBwbGljYXRpb25zL1hjb2RlLmFwcC9Db250ZW50cy9EZXZlbG9wZXIvUGxhdGZvcm1zLy4uLiwgdGhlblxuICAgIC8vIHJldHVybiBudWxsLiBHb2luZyBmb3J3YXJkLCB3ZSBwcm9iYWJseSB3YW50IHRvIHNwZWNpYWwtY2FzZSBzb21lIG9mIHRoZVxuICAgIC8vIHBhdGhzIHVuZGVyIC9BcHBsaWNhdGlvbnMvWGNvZGUuYXBwIHNvIHRoYXQgY2xpY2stdG8tc3ltYm9sIHdvcmtzIGluXG4gICAgLy8gZmlsZXMgbGlrZSBGcmFtZXdvcmtzL1VJS2l0LmZyYW1ld29yay9IZWFkZXJzL1VJSW1hZ2UuaC5cbiAgICBjb25zdCBidWNrUHJvamVjdFJvb3QgPSBhd2FpdCB0aGlzLl9idWNrVXRpbHMuZ2V0QnVja1Byb2plY3RSb290KHNyYyk7XG4gICAgaWYgKGJ1Y2tQcm9qZWN0Um9vdCA9PSBudWxsKSB7XG4gICAgICBsb2dnZXIuaW5mbyhcbiAgICAgICAgICAnRGlkIG5vdCB0cnkgdG8gYXR0ZW1wdCB0byBnZXQgZmxhZ3MgZnJvbSBCdWNrIGJlY2F1c2UgJyArXG4gICAgICAgICAgJ3NvdXJjZSBmaWxlICVzIGRvZXMgbm90IGFwcGVhciB0byBiZSBwYXJ0IG9mIGEgQnVjayBwcm9qZWN0LicsXG4gICAgICAgICAgc3JjKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9jYWNoZWRCdWNrUHJvamVjdHMuaGFzKGJ1Y2tQcm9qZWN0Um9vdCkpIHtcbiAgICAgIHJldHVybiB0aGlzLl9jYWNoZWRCdWNrUHJvamVjdHMuZ2V0KGJ1Y2tQcm9qZWN0Um9vdCk7XG4gICAgfVxuXG4gICAgY29uc3QgYnVja1Byb2plY3QgPSBuZXcgQnVja1Byb2plY3Qoe3Jvb3RQYXRoOiBidWNrUHJvamVjdFJvb3R9KTtcbiAgICB0aGlzLl9jYWNoZWRCdWNrUHJvamVjdHMuc2V0KGJ1Y2tQcm9qZWN0Um9vdCwgYnVja1Byb2plY3QpO1xuICAgIHJldHVybiBidWNrUHJvamVjdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIGEgc3BhY2UtZGVsaW1pdGVkIHN0cmluZyBvZiBmbGFncyBvciBudWxsIGlmIG5vdGhpbmcgaXMga25vd25cbiAgICogICAgIGFib3V0IHRoZSBzcmMgZmlsZS4gRm9yIGV4YW1wbGUsIG51bGwgd2lsbCBiZSByZXR1cm5lZCBpZiBzcmMgaXMgbm90XG4gICAqICAgICB1bmRlciB0aGUgcHJvamVjdCByb290LlxuICAgKi9cbiAgYXN5bmMgZ2V0RmxhZ3NGb3JTcmMoc3JjOiBzdHJpbmcpOiBQcm9taXNlPD9DbGFuZ0ZsYWdzPiB7XG4gICAgbGV0IGZsYWdzID0gdGhpcy5wYXRoVG9GbGFncy5nZXQoc3JjKTtcbiAgICBpZiAoZmxhZ3MgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGZsYWdzO1xuICAgIH1cbiAgICBmbGFncyA9IGF3YWl0IHRoaXMuX2dldEZsYWdzRm9yU3JjSW1wbChzcmMpO1xuICAgIHRoaXMucGF0aFRvRmxhZ3Muc2V0KHNyYywgZmxhZ3MpO1xuICAgIHJldHVybiBmbGFncztcbiAgfVxuXG4gIEB0cmFja1RpbWluZygnbnVjbGlkZS1jbGFuZy5nZXQtZmxhZ3MnKVxuICBhc3luYyBfZ2V0RmxhZ3NGb3JTcmNJbXBsKHNyYzogc3RyaW5nKTogUHJvbWlzZTw/Q2xhbmdGbGFncz4ge1xuICAgIC8vIExvb2sgZm9yIGEgbWFudWFsbHkgcHJvdmlkZWQgY29tcGlsYXRpb24gZGF0YWJhc2UuXG4gICAgY29uc3QgZGJEaXIgPSBhd2FpdCBmc1Byb21pc2UuZmluZE5lYXJlc3RGaWxlKFxuICAgICAgQ09NUElMQVRJT05fREFUQUJBU0VfRklMRSxcbiAgICAgIHBhdGguZGlybmFtZShzcmMpLFxuICAgICk7XG4gICAgaWYgKGRiRGlyICE9IG51bGwpIHtcbiAgICAgIGNvbnN0IGRiRmlsZSA9IHBhdGguam9pbihkYkRpciwgQ09NUElMQVRJT05fREFUQUJBU0VfRklMRSk7XG4gICAgICBhd2FpdCB0aGlzLl9sb2FkRmxhZ3NGcm9tQ29tcGlsYXRpb25EYXRhYmFzZShkYkZpbGUpO1xuICAgICAgY29uc3QgZmxhZ3MgPSB0aGlzLnBhdGhUb0ZsYWdzLmdldChzcmMpO1xuICAgICAgaWYgKGZsYWdzICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIGZsYWdzO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IGJ1Y2tGbGFncyA9IGF3YWl0IHRoaXMuX2xvYWRGbGFnc0Zyb21CdWNrKHNyYyk7XG4gICAgaWYgKGlzSGVhZGVyRmlsZShzcmMpKSB7XG4gICAgICAvLyBBY2NlcHQgZmxhZ3MgZnJvbSBhbnkgc291cmNlIGZpbGUgaW4gdGhlIHRhcmdldC5cbiAgICAgIGlmIChidWNrRmxhZ3Muc2l6ZSA+IDApIHtcbiAgICAgICAgcmV0dXJuIGJ1Y2tGbGFncy52YWx1ZXMoKS5uZXh0KCkudmFsdWU7XG4gICAgICB9XG4gICAgICAvLyBUcnkgZmluZGluZyBmbGFncyBmb3IgYSByZWxhdGVkIHNvdXJjZSBmaWxlLlxuICAgICAgY29uc3Qgc291cmNlRmlsZSA9IGF3YWl0IENsYW5nRmxhZ3NNYW5hZ2VyLl9maW5kU291cmNlRmlsZUZvckhlYWRlcihzcmMpO1xuICAgICAgaWYgKHNvdXJjZUZpbGUgIT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRGbGFnc0ZvclNyYyhzb3VyY2VGaWxlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBmbGFncyA9IHRoaXMucGF0aFRvRmxhZ3MuZ2V0KHNyYyk7XG4gICAgaWYgKGZsYWdzICE9IG51bGwpIHtcbiAgICAgIHJldHVybiBmbGFncztcbiAgICB9XG5cbiAgICAvLyBFdmVuIGlmIHdlIGNhbid0IGdldCBmbGFncywgdHJ5IHRvIHdhdGNoIHRoZSBidWlsZCBmaWxlIGluIGNhc2UgdGhleSBnZXQgYWRkZWQuXG4gICAgY29uc3QgYnVpbGRGaWxlID0gYXdhaXQgQ2xhbmdGbGFnc01hbmFnZXIuX2d1ZXNzQnVpbGRGaWxlKHNyYyk7XG4gICAgaWYgKGJ1aWxkRmlsZSAhPSBudWxsKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBmbGFnczogbnVsbCxcbiAgICAgICAgY2hhbmdlczogdGhpcy5fd2F0Y2hGbGFnRmlsZShidWlsZEZpbGUpLFxuICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGFzeW5jIF9sb2FkRmxhZ3NGcm9tQ29tcGlsYXRpb25EYXRhYmFzZShkYkZpbGU6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICh0aGlzLl9jb21waWxhdGlvbkRhdGFiYXNlcy5oYXMoZGJGaWxlKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICBjb25zdCBjb250ZW50cyA9IGF3YWl0IGZzUHJvbWlzZS5yZWFkRmlsZShkYkZpbGUpO1xuICAgICAgY29uc3QgZGF0YSA9IEpTT04ucGFyc2UoY29udGVudHMpO1xuICAgICAgaW52YXJpYW50KGRhdGEgaW5zdGFuY2VvZiBBcnJheSk7XG4gICAgICBjb25zdCBjaGFuZ2VzID0gdGhpcy5fd2F0Y2hGbGFnRmlsZShkYkZpbGUpO1xuICAgICAgYXdhaXQgUHJvbWlzZS5hbGwoZGF0YS5tYXAoYXN5bmMgZW50cnkgPT4ge1xuICAgICAgICBjb25zdCB7Y29tbWFuZCwgZmlsZX0gPSBlbnRyeTtcbiAgICAgICAgY29uc3QgZGlyZWN0b3J5ID0gYXdhaXQgZnNQcm9taXNlLnJlYWxwYXRoKGVudHJ5LmRpcmVjdG9yeSwgdGhpcy5fcmVhbHBhdGhDYWNoZSk7XG4gICAgICAgIGNvbnN0IGFyZ3MgPSBDbGFuZ0ZsYWdzTWFuYWdlci5wYXJzZUFyZ3VtZW50c0Zyb21Db21tYW5kKGNvbW1hbmQpO1xuICAgICAgICBjb25zdCBmaWxlbmFtZSA9IHBhdGgucmVzb2x2ZShkaXJlY3RvcnksIGZpbGUpO1xuICAgICAgICBpZiAoYXdhaXQgZnNQcm9taXNlLmV4aXN0cyhmaWxlbmFtZSkpIHtcbiAgICAgICAgICBjb25zdCByZWFscGF0aCA9IGF3YWl0IGZzUHJvbWlzZS5yZWFscGF0aChmaWxlbmFtZSwgdGhpcy5fcmVhbHBhdGhDYWNoZSk7XG4gICAgICAgICAgdGhpcy5wYXRoVG9GbGFncy5zZXQocmVhbHBhdGgsIHtcbiAgICAgICAgICAgIGZsYWdzOiBDbGFuZ0ZsYWdzTWFuYWdlci5zYW5pdGl6ZUNvbW1hbmQoZmlsZSwgYXJncywgZGlyZWN0b3J5KSxcbiAgICAgICAgICAgIGNoYW5nZXMsXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0pKTtcbiAgICAgIHRoaXMuX2NvbXBpbGF0aW9uRGF0YWJhc2VzLmFkZChkYkZpbGUpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGxvZ2dlci5lcnJvcihgRXJyb3IgcmVhZGluZyBjb21waWxhdGlvbiBmbGFncyBmcm9tICR7ZGJGaWxlfWAsIGUpO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIF9sb2FkRmxhZ3NGcm9tQnVjayhzcmM6IHN0cmluZyk6IFByb21pc2U8TWFwPHN0cmluZywgQ2xhbmdGbGFncz4+IHtcbiAgICBjb25zdCBmbGFncyA9IG5ldyBNYXAoKTtcbiAgICBjb25zdCBidWNrUHJvamVjdCA9IGF3YWl0IHRoaXMuX2dldEJ1Y2tQcm9qZWN0KHNyYyk7XG4gICAgaWYgKCFidWNrUHJvamVjdCkge1xuICAgICAgcmV0dXJuIGZsYWdzO1xuICAgIH1cblxuICAgIGNvbnN0IHRhcmdldCA9IChhd2FpdCBidWNrUHJvamVjdC5nZXRPd25lcihzcmMpKVxuICAgICAgLmZpbmQoeCA9PiB4LmluZGV4T2YoREVGQVVMVF9IRUFERVJTX1RBUkdFVCkgPT09IC0xKTtcblxuICAgIGlmICh0YXJnZXQgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIGZsYWdzO1xuICAgIH1cblxuICAgIC8vIFRPRE8obWJvbGluKTogVGhlIGFyY2hpdGVjdHVyZSBzaG91bGQgYmUgY2hvc2VuIGZyb20gYSBkcm9wZG93biBtZW51IGxpa2VcbiAgICAvLyBpdCBpcyBpbiBYY29kZSByYXRoZXIgdGhhbiBoYXJkY29kaW5nIHRoaW5ncyB0byBpcGhvbmVzaW11bGF0b3IteDg2XzY0LlxuICAgIGxldCBhcmNoO1xuICAgIGlmIChwcm9jZXNzLnBsYXRmb3JtID09PSAnZGFyd2luJykge1xuICAgICAgYXJjaCA9ICdpcGhvbmVzaW11bGF0b3IteDg2XzY0JztcbiAgICB9IGVsc2Uge1xuICAgICAgYXJjaCA9ICdkZWZhdWx0JztcbiAgICB9XG4gICAgLy8gVE9ETyhtYm9saW4pOiBOZWVkIGxvZ2ljIHRvIG1ha2Ugc3VyZSByZXN1bHRzIGFyZSByZXN0cmljdGVkIHRvXG4gICAgLy8gYXBwbGVfbGlicmFyeSBvciBhcHBsZV9iaW5hcnkgcnVsZXMuIEluIHByYWN0aWNlLCB0aGlzIHNob3VsZCBiZSBPSyBmb3JcbiAgICAvLyBub3cuIFRob3VnaCBvbmNlIHdlIHN0YXJ0IHN1cHBvcnRpbmcgb3JkaW5hcnkgLmNwcCBmaWxlcywgdGhlbiB3ZVxuICAgIC8vIGxpa2VseSBuZWVkIHRvIGJlIGV2ZW4gbW9yZSBjYXJlZnVsIGFib3V0IGNob29zaW5nIHRoZSBhcmNoaXRlY3R1cmVcbiAgICAvLyBmbGF2b3IuXG4gICAgY29uc3QgYnVpbGRUYXJnZXQgPSB0YXJnZXQgKyAnI2NvbXBpbGF0aW9uLWRhdGFiYXNlLCcgKyBhcmNoO1xuXG4gICAgY29uc3QgYnVpbGRSZXBvcnQgPSBhd2FpdCBidWNrUHJvamVjdC5idWlsZChbYnVpbGRUYXJnZXRdKTtcbiAgICBpZiAoIWJ1aWxkUmVwb3J0LnN1Y2Nlc3MpIHtcbiAgICAgIC8vIFRPRE8obWJvbGluKTogRnJlcXVlbnRseSBmYWlsaW5nIGR1ZSB0byAnRGFlbW9uIGlzIGJ1c3knIGVycm9ycy5cbiAgICAgIC8vIFVsdGltYXRlbHksIEJ1Y2sgc2hvdWxkIHF1ZXVlIHRoaW5ncyB1cCwgYnV0IGZvciBub3csIE51Y2xpZGUgc2hvdWxkLlxuICAgICAgY29uc3QgZXJyb3IgPSBgRmFpbGVkIHRvIGJ1aWxkICR7YnVpbGRUYXJnZXR9YDtcbiAgICAgIGxvZ2dlci5lcnJvcihlcnJvcik7XG4gICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG4gICAgY29uc3QgYnVja1Byb2plY3RSb290ID0gYXdhaXQgYnVja1Byb2plY3QuZ2V0UGF0aCgpO1xuICAgIGxldCBwYXRoVG9Db21waWxhdGlvbkRhdGFiYXNlID0gYnVpbGRSZXBvcnRbJ3Jlc3VsdHMnXVtidWlsZFRhcmdldF1bJ291dHB1dCddO1xuICAgIHBhdGhUb0NvbXBpbGF0aW9uRGF0YWJhc2UgPSBwYXRoLmpvaW4oXG4gICAgICAgIGJ1Y2tQcm9qZWN0Um9vdCxcbiAgICAgICAgcGF0aFRvQ29tcGlsYXRpb25EYXRhYmFzZSk7XG5cbiAgICBjb25zdCBjb21waWxhdGlvbkRhdGFiYXNlSnNvbkJ1ZmZlciA9IGF3YWl0IGZzUHJvbWlzZS5yZWFkRmlsZShwYXRoVG9Db21waWxhdGlvbkRhdGFiYXNlKTtcbiAgICBjb25zdCBjb21waWxhdGlvbkRhdGFiYXNlSnNvbiA9IGNvbXBpbGF0aW9uRGF0YWJhc2VKc29uQnVmZmVyLnRvU3RyaW5nKCd1dGY4Jyk7XG4gICAgY29uc3QgY29tcGlsYXRpb25EYXRhYmFzZSA9IEpTT04ucGFyc2UoY29tcGlsYXRpb25EYXRhYmFzZUpzb24pO1xuXG4gICAgY29uc3QgYnVpbGRGaWxlID0gYXdhaXQgYnVja1Byb2plY3QuZ2V0QnVpbGRGaWxlKHRhcmdldCk7XG4gICAgY29uc3QgY2hhbmdlcyA9IGJ1aWxkRmlsZSA9PSBudWxsID8gT2JzZXJ2YWJsZS5lbXB0eSgpIDogdGhpcy5fd2F0Y2hGbGFnRmlsZShidWlsZEZpbGUpO1xuICAgIGNvbXBpbGF0aW9uRGF0YWJhc2UuZm9yRWFjaChpdGVtID0+IHtcbiAgICAgIGNvbnN0IHtmaWxlfSA9IGl0ZW07XG4gICAgICBjb25zdCByZXN1bHQgPSB7XG4gICAgICAgIGZsYWdzOiBDbGFuZ0ZsYWdzTWFuYWdlci5zYW5pdGl6ZUNvbW1hbmQoXG4gICAgICAgICAgZmlsZSxcbiAgICAgICAgICBpdGVtLmFyZ3VtZW50cyxcbiAgICAgICAgICBidWNrUHJvamVjdFJvb3QsXG4gICAgICAgICksXG4gICAgICAgIGNoYW5nZXMsXG4gICAgICB9O1xuICAgICAgZmxhZ3Muc2V0KGZpbGUsIHJlc3VsdCk7XG4gICAgICB0aGlzLnBhdGhUb0ZsYWdzLnNldChmaWxlLCByZXN1bHQpO1xuICAgIH0pO1xuICAgIHJldHVybiBmbGFncztcbiAgfVxuXG4gIF93YXRjaEZsYWdGaWxlKGZsYWdGaWxlOiBzdHJpbmcpOiBPYnNlcnZhYmxlPHN0cmluZz4ge1xuICAgIGNvbnN0IGV4aXN0aW5nID0gdGhpcy5fZmxhZ0ZpbGVPYnNlcnZhYmxlcy5nZXQoZmxhZ0ZpbGUpO1xuICAgIGlmIChleGlzdGluZyAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gZXhpc3Rpbmc7XG4gICAgfVxuICAgIGNvbnN0IGZsYWdGaWxlRGlyID0gcGF0aC5kaXJuYW1lKGZsYWdGaWxlKTtcbiAgICBjb25zdCBmbGFnRmlsZUJhc2UgPSBwYXRoLmJhc2VuYW1lKGZsYWdGaWxlKTtcbiAgICBjb25zdCBvYnNlcnZhYmxlID0gT2JzZXJ2YWJsZS5jcmVhdGUob2JzID0+IHtcbiAgICAgIGNvbnN0IHdhdGNoZXIgPSBmcy53YXRjaChmbGFnRmlsZURpciwge30sIChldmVudCwgZmlsZW5hbWUpID0+IHtcbiAgICAgICAgaWYgKGZpbGVuYW1lID09PSBmbGFnRmlsZUJhc2UpIHtcbiAgICAgICAgICBvYnMubmV4dChldmVudCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgd2F0Y2hlci5vbignZXJyb3InLCBlcnIgPT4ge1xuICAgICAgICBsb2dnZXIuZXJyb3IoYENvdWxkIG5vdCB3YXRjaCBmaWxlICR7ZmxhZ0ZpbGV9YCwgZXJyKTtcbiAgICAgICAgb2JzLmVycm9yKGVycik7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHVuc3Vic2NyaWJlKCkge1xuICAgICAgICAgIHdhdGNoZXIuY2xvc2UoKTtcbiAgICAgICAgfSxcbiAgICAgIH07XG4gICAgfSkuc2hhcmUoKTtcbiAgICB0aGlzLl9mbGFnRmlsZU9ic2VydmFibGVzLnNldChmbGFnRmlsZSwgb2JzZXJ2YWJsZSk7XG4gICAgcmV0dXJuIG9ic2VydmFibGU7XG4gIH1cblxuICAvLyBUaGUgZmlsZSBtYXkgYmUgbmV3LiBMb29rIGZvciBhIG5lYXJieSBCVUNLIG9yIFRBUkdFVFMgZmlsZS5cbiAgc3RhdGljIGFzeW5jIF9ndWVzc0J1aWxkRmlsZShmaWxlOiBzdHJpbmcpOiBQcm9taXNlPD9zdHJpbmc+IHtcbiAgICBjb25zdCBkaXIgPSBwYXRoLmRpcm5hbWUoZmlsZSk7XG4gICAgbGV0IGJlc3RNYXRjaCA9IG51bGw7XG4gICAgYXdhaXQgUHJvbWlzZS5hbGwoWydCVUNLJywgJ1RBUkdFVFMnLCAnY29tcGlsZV9jb21tYW5kcy5qc29uJ10ubWFwKGFzeW5jIG5hbWUgPT4ge1xuICAgICAgY29uc3QgbmVhcmVzdERpciA9IGF3YWl0IGZzUHJvbWlzZS5maW5kTmVhcmVzdEZpbGUobmFtZSwgZGlyKTtcbiAgICAgIGlmIChuZWFyZXN0RGlyICE9IG51bGwpIHtcbiAgICAgICAgY29uc3QgbWF0Y2ggPSBwYXRoLmpvaW4obmVhcmVzdERpciwgbmFtZSk7XG4gICAgICAgIC8vIFJldHVybiB0aGUgY2xvc2VzdCAobW9zdCBzcGVjaWZpYykgbWF0Y2guXG4gICAgICAgIGlmIChiZXN0TWF0Y2ggPT0gbnVsbCB8fCBtYXRjaC5sZW5ndGggPiBiZXN0TWF0Y2gubGVuZ3RoKSB7XG4gICAgICAgICAgYmVzdE1hdGNoID0gbWF0Y2g7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KSk7XG4gICAgcmV0dXJuIGJlc3RNYXRjaDtcbiAgfVxuXG4gIHN0YXRpYyBwYXJzZUFyZ3VtZW50c0Zyb21Db21tYW5kKGNvbW1hbmQ6IHN0cmluZyk6IEFycmF5PHN0cmluZz4ge1xuICAgIGNvbnN0IHJlc3VsdCA9IFtdO1xuICAgIC8vIHNoZWxsLXF1b3RlIHJldHVybnMgb2JqZWN0cyBmb3IgdGhpbmdzIGxpa2UgcGlwZXMuXG4gICAgLy8gVGhpcyBzaG91bGQgbmV2ZXIgaGFwcGVuIHdpdGggcHJvcGVyIGZsYWdzLCBidXQgaWdub3JlIHRoZW0gdG8gYmUgc2FmZS5cbiAgICBmb3IgKGNvbnN0IGFyZyBvZiBwYXJzZShjb21tYW5kKSkge1xuICAgICAgaWYgKHR5cGVvZiBhcmcgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgcmVzdWx0LnB1c2goYXJnKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIHN0YXRpYyBzYW5pdGl6ZUNvbW1hbmQoXG4gICAgc291cmNlRmlsZTogc3RyaW5nLFxuICAgIGFyZ3M6IEFycmF5PHN0cmluZz4sXG4gICAgYmFzZVBhdGg6IHN0cmluZ1xuICApOiBBcnJheTxzdHJpbmc+IHtcbiAgICAvLyBGb3Igc2FmZXR5LCBjcmVhdGUgYSBuZXcgY29weSBvZiB0aGUgYXJyYXkuIFdlIGV4Y2x1ZGUgdGhlIHBhdGggdG8gdGhlIGZpbGUgdG8gY29tcGlsZSBmcm9tXG4gICAgLy8gY29tcGlsYXRpb24gZGF0YWJhc2UgZ2VuZXJhdGVkIGJ5IEJ1Y2suIEl0IG11c3QgYmUgcmVtb3ZlZCBmcm9tIHRoZSBsaXN0IG9mIGNvbW1hbmQtbGluZVxuICAgIC8vIGFyZ3VtZW50cyBwYXNzZWQgdG8gbGliY2xhbmcuXG4gICAgY29uc3Qgbm9ybWFsaXplZFNvdXJjZUZpbGUgPSBwYXRoLm5vcm1hbGl6ZShzb3VyY2VGaWxlKTtcbiAgICBhcmdzID0gYXJncy5maWx0ZXIoYXJnID0+XG4gICAgICBub3JtYWxpemVkU291cmNlRmlsZSAhPT0gYXJnICYmXG4gICAgICBub3JtYWxpemVkU291cmNlRmlsZSAhPT0gcGF0aC5yZXNvbHZlKGJhc2VQYXRoLCBhcmcpXG4gICAgKTtcblxuICAgIC8vIFJlc29sdmUgcmVsYXRpdmUgcGF0aCBhcmd1bWVudHMgYWdhaW5zdCB0aGUgQnVjayBwcm9qZWN0IHJvb3QuXG4gICAgYXJncy5mb3JFYWNoKChhcmcsIGFyZ0luZGV4KSA9PiB7XG4gICAgICBpZiAoQ0xBTkdfRkxBR1NfVEhBVF9UQUtFX1BBVEhTLmhhcyhhcmcpKSB7XG4gICAgICAgIGNvbnN0IG5leHRJbmRleCA9IGFyZ0luZGV4ICsgMTtcbiAgICAgICAgbGV0IGZpbGVQYXRoID0gYXJnc1tuZXh0SW5kZXhdO1xuICAgICAgICBpZiAoIXBhdGguaXNBYnNvbHV0ZShmaWxlUGF0aCkpIHtcbiAgICAgICAgICBmaWxlUGF0aCA9IHBhdGguam9pbihiYXNlUGF0aCwgZmlsZVBhdGgpO1xuICAgICAgICAgIGFyZ3NbbmV4dEluZGV4XSA9IGZpbGVQYXRoO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKFNJTkdMRV9MRVRURVJfQ0xBTkdfRkxBR1NfVEhBVF9UQUtFX1BBVEhTLmhhcyhhcmcuc3Vic3RyaW5nKDAsIDIpKSkge1xuICAgICAgICBsZXQgZmlsZVBhdGggPSBhcmcuc3Vic3RyaW5nKDIpO1xuICAgICAgICBpZiAoIXBhdGguaXNBYnNvbHV0ZShmaWxlUGF0aCkpIHtcbiAgICAgICAgICBmaWxlUGF0aCA9IHBhdGguam9pbihiYXNlUGF0aCwgZmlsZVBhdGgpO1xuICAgICAgICAgIGFyZ3NbYXJnSW5kZXhdID0gYXJnLnN1YnN0cmluZygwLCAyKSArIGZpbGVQYXRoO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBJZiBhbiBvdXRwdXQgZmlsZSBpcyBzcGVjaWZpZWQsIHJlbW92ZSB0aGF0IGFyZ3VtZW50LlxuICAgIGNvbnN0IGluZGV4ID0gYXJncy5pbmRleE9mKCctbycpO1xuICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgIGFyZ3Muc3BsaWNlKGluZGV4LCAyKTtcbiAgICB9XG5cbiAgICByZXR1cm4gYXJncztcbiAgfVxuXG4gIHN0YXRpYyBhc3luYyBfZmluZFNvdXJjZUZpbGVGb3JIZWFkZXIoaGVhZGVyOiBzdHJpbmcpOiBQcm9taXNlPD9zdHJpbmc+IHtcbiAgICAvLyBCYXNpYyBpbXBsZW1lbnRhdGlvbjogbG9vayBhdCBmaWxlcyBpbiB0aGUgc2FtZSBkaXJlY3RvcnkgZm9yIHBhdGhzXG4gICAgLy8gd2l0aCBtYXRjaGluZyBmaWxlIG5hbWVzLlxuICAgIC8vIFRPRE8oIzEwMDI4NTMxKTogU2NhbiB0aHJvdWdoIHNvdXJjZSBmaWxlcyB0byBmaW5kIHRob3NlIHRoYXQgaW5jbHVkZVxuICAgIC8vIHRoZSBoZWFkZXIgZmlsZS5cbiAgICBjb25zdCBkaXIgPSBwYXRoLmRpcm5hbWUoaGVhZGVyKTtcbiAgICBjb25zdCBmaWxlcyA9IGF3YWl0IGZzUHJvbWlzZS5yZWFkZGlyKGRpcik7XG4gICAgY29uc3QgYmFzZW5hbWUgPSBDbGFuZ0ZsYWdzTWFuYWdlci5fZ2V0RmlsZUJhc2VuYW1lKGhlYWRlcik7XG4gICAgZm9yIChjb25zdCBmaWxlIG9mIGZpbGVzKSB7XG4gICAgICBpZiAoaXNTb3VyY2VGaWxlKGZpbGUpICYmIENsYW5nRmxhZ3NNYW5hZ2VyLl9nZXRGaWxlQmFzZW5hbWUoZmlsZSkgPT09IGJhc2VuYW1lKSB7XG4gICAgICAgIHJldHVybiBwYXRoLmpvaW4oZGlyLCBmaWxlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvLyBTdHJpcCBvZmYgdGhlIGV4dGVuc2lvbiBhbmQgY29udmVudGlvbmFsIHN1ZmZpeGVzIGxpa2UgXCJJbnRlcm5hbFwiIGFuZCBcIi1pbmxcIi5cbiAgc3RhdGljIF9nZXRGaWxlQmFzZW5hbWUoZmlsZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBsZXQgYmFzZW5hbWUgPSBwYXRoLmJhc2VuYW1lKGZpbGUpO1xuICAgIGNvbnN0IGV4dCA9IGJhc2VuYW1lLmxhc3RJbmRleE9mKCcuJyk7XG4gICAgaWYgKGV4dCAhPT0gLTEpIHtcbiAgICAgIGJhc2VuYW1lID0gYmFzZW5hbWUuc3Vic3RyKDAsIGV4dCk7XG4gICAgfVxuICAgIHJldHVybiBiYXNlbmFtZS5yZXBsYWNlKC8oSW50ZXJuYWx8LWlubCkkLywgJycpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ2xhbmdGbGFnc01hbmFnZXI7XG4iXX0=