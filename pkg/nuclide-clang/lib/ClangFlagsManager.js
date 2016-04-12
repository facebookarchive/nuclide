var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === 'function') { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError('The decorator for method ' + descriptor.key + ' is of the invalid type ' + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

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
  }

  _createDecoratedClass(ClangFlagsManager, [{
    key: 'reset',
    value: function reset() {
      this.pathToFlags.clear();
      this._cachedBuckProjects.clear();
      this._compilationDatabases.clear();
      this._realpathCache = {};
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
        var flags = this.pathToFlags.get(src);
        if (flags != null) {
          return flags;
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
      return this.pathToFlags.get(src) || null;
    })
  }, {
    key: '_loadFlagsFromCompilationDatabase',
    value: _asyncToGenerator(function* (dbFile) {
      var _this = this;

      if (this._compilationDatabases.has(dbFile)) {
        return;
      }

      try {
        var contents = yield _nuclideCommons.fsPromise.readFile(dbFile);
        var data = JSON.parse(contents);
        (0, _assert2['default'])(data instanceof Array);
        yield Promise.all(data.map(_asyncToGenerator(function* (entry) {
          var command = entry.command;
          var file = entry.file;

          var directory = yield _nuclideCommons.fsPromise.realpath(entry.directory, _this._realpathCache);
          var args = ClangFlagsManager.parseArgumentsFromCommand(command);
          var filename = _path2['default'].resolve(directory, file);
          if (yield _nuclideCommons.fsPromise.exists(filename)) {
            var realpath = yield _nuclideCommons.fsPromise.realpath(filename, _this._realpathCache);
            _this.pathToFlags.set(realpath, ClangFlagsManager.sanitizeCommand(file, args, directory));
          }
        })));
        this._compilationDatabases.add(dbFile);
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

      compilationDatabase.forEach(function (item) {
        var file = item.file;

        var fileFlags = ClangFlagsManager.sanitizeCommand(file, item.arguments, buckProjectRoot);
        flags.set(file, fileFlags);
        _this2.pathToFlags.set(file, fileFlags);
      });
      return flags;
    })
  }], [{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNsYW5nRmxhZ3NNYW5hZ2VyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7c0JBYXNCLFFBQVE7Ozs7b0JBQ2IsTUFBTTs7OzswQkFDSCxhQUFhOztnQ0FDUCx5QkFBeUI7OzhCQUMzQix1QkFBdUI7OzhCQUN2Qix1QkFBdUI7OzZDQUNyQix5Q0FBeUM7O0FBRW5FLElBQU0sTUFBTSxHQUFHLGdDQUFXLENBQUM7O0FBRTNCLElBQU0seUJBQXlCLEdBQUcsdUJBQXVCLENBQUM7Ozs7O0FBSzFELElBQU0sc0JBQXNCLEdBQUcscUJBQXFCLENBQUM7QUFDckQsSUFBTSxpQkFBaUIsR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO0FBQ3pFLElBQU0saUJBQWlCLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDOztBQUVwRixJQUFNLDJCQUEyQixHQUFHLElBQUksR0FBRyxDQUFDLENBQzFDLElBQUksRUFDSixJQUFJLEVBQ0osVUFBVSxFQUNWLFNBQVMsRUFDVCxXQUFXLEVBQ1gsVUFBVSxDQUNYLENBQUMsQ0FBQzs7QUFFSCxJQUFNLHlDQUF5QyxHQUFHLElBQUksR0FBRyxDQUN2RCxLQUFLLENBQUMsSUFBSSxDQUFDLDJCQUEyQixDQUFDLENBQ3BDLE1BQU0sQ0FBQyxVQUFBLElBQUk7U0FBSSxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUM7Q0FBQSxDQUFDLENBQ3JDLENBQUM7O0FBRUYsU0FBUyxZQUFZLENBQUMsUUFBZ0IsRUFBVztBQUMvQyxTQUFPLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxrQkFBSyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztDQUN0RDs7QUFFRCxTQUFTLFlBQVksQ0FBQyxRQUFnQixFQUFXO0FBQy9DLFNBQU8saUJBQWlCLENBQUMsR0FBRyxDQUFDLGtCQUFLLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0NBQ3REOztJQUVLLGlCQUFpQjtBQU9WLFdBUFAsaUJBQWlCLENBT1QsU0FBb0IsRUFBRTswQkFQOUIsaUJBQWlCOztBQVFuQixRQUFJLENBQUMsV0FBVyxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7QUFDN0IsUUFBSSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUM7QUFDNUIsUUFBSSxDQUFDLG1CQUFtQixHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7QUFDckMsUUFBSSxDQUFDLHFCQUFxQixHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7QUFDdkMsUUFBSSxDQUFDLGNBQWMsR0FBRyxFQUFFLENBQUM7R0FDMUI7O3dCQWJHLGlCQUFpQjs7V0FlaEIsaUJBQUc7QUFDTixVQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQ3pCLFVBQUksQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNqQyxVQUFJLENBQUMscUJBQXFCLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDbkMsVUFBSSxDQUFDLGNBQWMsR0FBRyxFQUFFLENBQUM7S0FDMUI7Ozs2QkFFb0IsV0FBQyxHQUFXLEVBQXlCOzs7Ozs7QUFNeEQsVUFBTSxlQUFlLEdBQUcsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3RFLFVBQUksZUFBZSxJQUFJLElBQUksRUFBRTtBQUMzQixjQUFNLENBQUMsSUFBSSxDQUNQLHdEQUF3RCxHQUN4RCw4REFBOEQsRUFDOUQsR0FBRyxDQUFDLENBQUM7QUFDVCxlQUFPLElBQUksQ0FBQztPQUNiOztBQUVELFVBQUksSUFBSSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsRUFBRTtBQUNqRCxlQUFPLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLENBQUM7T0FDdEQ7O0FBRUQsVUFBTSxXQUFXLEdBQUcsK0NBQWdCLEVBQUMsUUFBUSxFQUFFLGVBQWUsRUFBQyxDQUFDLENBQUM7QUFDakUsVUFBSSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxlQUFlLEVBQUUsV0FBVyxDQUFDLENBQUM7QUFDM0QsYUFBTyxXQUFXLENBQUM7S0FDcEI7Ozs7Ozs7Ozs2QkFPbUIsV0FBQyxHQUFXLEVBQTJCO0FBQ3pELFVBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3RDLFVBQUksS0FBSyxLQUFLLFNBQVMsRUFBRTtBQUN2QixlQUFPLEtBQUssQ0FBQztPQUNkO0FBQ0QsV0FBSyxHQUFHLE1BQU0sSUFBSSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzVDLFVBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUNqQyxhQUFPLEtBQUssQ0FBQztLQUNkOzs7aUJBRUEsbUNBQVkseUJBQXlCLENBQUM7NkJBQ2QsV0FBQyxHQUFXLEVBQTJCOztBQUU5RCxVQUFNLEtBQUssR0FBRyxNQUFNLDBCQUFVLGVBQWUsQ0FDM0MseUJBQXlCLEVBQ3pCLGtCQUFLLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FDbEIsQ0FBQztBQUNGLFVBQUksS0FBSyxJQUFJLElBQUksRUFBRTtBQUNqQixZQUFNLE1BQU0sR0FBRyxrQkFBSyxJQUFJLENBQUMsS0FBSyxFQUFFLHlCQUF5QixDQUFDLENBQUM7QUFDM0QsY0FBTSxJQUFJLENBQUMsaUNBQWlDLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDckQsWUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDeEMsWUFBSSxLQUFLLElBQUksSUFBSSxFQUFFO0FBQ2pCLGlCQUFPLEtBQUssQ0FBQztTQUNkO09BQ0Y7O0FBRUQsVUFBTSxTQUFTLEdBQUcsTUFBTSxJQUFJLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDckQsVUFBSSxZQUFZLENBQUMsR0FBRyxDQUFDLEVBQUU7O0FBRXJCLFlBQUksU0FBUyxDQUFDLElBQUksR0FBRyxDQUFDLEVBQUU7QUFDdEIsaUJBQU8sU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDLEtBQUssQ0FBQztTQUN4Qzs7QUFFRCxZQUFNLFVBQVUsR0FBRyxNQUFNLGlCQUFpQixDQUFDLHdCQUF3QixDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3pFLFlBQUksVUFBVSxJQUFJLElBQUksRUFBRTtBQUN0QixpQkFBTyxJQUFJLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1NBQ3hDO09BQ0Y7QUFDRCxhQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQztLQUMxQzs7OzZCQUVzQyxXQUFDLE1BQWMsRUFBaUI7OztBQUNyRSxVQUFJLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUU7QUFDMUMsZUFBTztPQUNSOztBQUVELFVBQUk7QUFDRixZQUFNLFFBQVEsR0FBRyxNQUFNLDBCQUFVLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNsRCxZQUFNLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ2xDLGlDQUFVLElBQUksWUFBWSxLQUFLLENBQUMsQ0FBQztBQUNqQyxjQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsbUJBQUMsV0FBTSxLQUFLLEVBQUk7Y0FDakMsT0FBTyxHQUFVLEtBQUssQ0FBdEIsT0FBTztjQUFFLElBQUksR0FBSSxLQUFLLENBQWIsSUFBSTs7QUFDcEIsY0FBTSxTQUFTLEdBQUcsTUFBTSwwQkFBVSxRQUFRLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxNQUFLLGNBQWMsQ0FBQyxDQUFDO0FBQ2pGLGNBQU0sSUFBSSxHQUFHLGlCQUFpQixDQUFDLHlCQUF5QixDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ2xFLGNBQU0sUUFBUSxHQUFHLGtCQUFLLE9BQU8sQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDL0MsY0FBSSxNQUFNLDBCQUFVLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBRTtBQUNwQyxnQkFBTSxRQUFRLEdBQUcsTUFBTSwwQkFBVSxRQUFRLENBQUMsUUFBUSxFQUFFLE1BQUssY0FBYyxDQUFDLENBQUM7QUFDekUsa0JBQUssV0FBVyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsaUJBQWlCLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztXQUMxRjtTQUNGLEVBQUMsQ0FBQyxDQUFDO0FBQ0osWUFBSSxDQUFDLHFCQUFxQixDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztPQUN4QyxDQUFDLE9BQU8sQ0FBQyxFQUFFO0FBQ1YsY0FBTSxDQUFDLEtBQUssMkNBQXlDLE1BQU0sRUFBSSxDQUFDLENBQUMsQ0FBQztPQUNuRTtLQUNGOzs7NkJBRXVCLFdBQUMsR0FBVyxFQUF1Qzs7O0FBQ3pFLFVBQU0sS0FBSyxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7QUFDeEIsVUFBTSxXQUFXLEdBQUcsTUFBTSxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3BELFVBQUksQ0FBQyxXQUFXLEVBQUU7QUFDaEIsZUFBTyxLQUFLLENBQUM7T0FDZDs7QUFFRCxVQUFNLE1BQU0sR0FBRyxDQUFDLE1BQU0sV0FBVyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQSxDQUM1QyxJQUFJLENBQUMsVUFBQSxDQUFDO2VBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztPQUFBLENBQUMsQ0FBQzs7QUFFdkQsVUFBSSxNQUFNLElBQUksSUFBSSxFQUFFO0FBQ2xCLGVBQU8sS0FBSyxDQUFDO09BQ2Q7Ozs7QUFJRCxVQUFJLElBQUksWUFBQSxDQUFDO0FBQ1QsVUFBSSxPQUFPLENBQUMsUUFBUSxLQUFLLFFBQVEsRUFBRTtBQUNqQyxZQUFJLEdBQUcsd0JBQXdCLENBQUM7T0FDakMsTUFBTTtBQUNMLFlBQUksR0FBRyxTQUFTLENBQUM7T0FDbEI7Ozs7OztBQU1ELFVBQU0sV0FBVyxHQUFHLE1BQU0sR0FBRyx3QkFBd0IsR0FBRyxJQUFJLENBQUM7O0FBRTdELFVBQU0sV0FBVyxHQUFHLE1BQU0sV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7QUFDM0QsVUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUU7OztBQUd4QixZQUFNLEtBQUssd0JBQXNCLFdBQVcsQUFBRSxDQUFDO0FBQy9DLGNBQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDcEIsY0FBTSxLQUFLLENBQUM7T0FDYjtBQUNELFVBQU0sZUFBZSxHQUFHLE1BQU0sV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3BELFVBQUkseUJBQXlCLEdBQUcsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQzlFLCtCQUF5QixHQUFHLGtCQUFLLElBQUksQ0FDakMsZUFBZSxFQUNmLHlCQUF5QixDQUFDLENBQUM7O0FBRS9CLFVBQU0sNkJBQTZCLEdBQUcsTUFBTSwwQkFBVSxRQUFRLENBQUMseUJBQXlCLENBQUMsQ0FBQztBQUMxRixVQUFNLHVCQUF1QixHQUFHLDZCQUE2QixDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUMvRSxVQUFNLG1CQUFtQixHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsdUJBQXVCLENBQUMsQ0FBQzs7QUFFaEUseUJBQW1CLENBQUMsT0FBTyxDQUFDLFVBQUEsSUFBSSxFQUFJO1lBQzNCLElBQUksR0FBSSxJQUFJLENBQVosSUFBSTs7QUFDWCxZQUFNLFNBQVMsR0FBRyxpQkFBaUIsQ0FBQyxlQUFlLENBQ2pELElBQUksRUFDSixJQUFJLENBQUMsU0FBUyxFQUNkLGVBQWUsQ0FDaEIsQ0FBQztBQUNGLGFBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0FBQzNCLGVBQUssV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7T0FDdkMsQ0FBQyxDQUFDO0FBQ0gsYUFBTyxLQUFLLENBQUM7S0FDZDs7O1dBRStCLG1DQUFDLE9BQWUsRUFBaUI7QUFDL0QsVUFBTSxNQUFNLEdBQUcsRUFBRSxDQUFDOzs7QUFHbEIsV0FBSyxJQUFNLEdBQUcsSUFBSSx1QkFBTSxPQUFPLENBQUMsRUFBRTtBQUNoQyxZQUFJLE9BQU8sR0FBRyxLQUFLLFFBQVEsRUFBRTtBQUMzQixnQkFBTTtTQUNQO0FBQ0QsY0FBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztPQUNsQjtBQUNELGFBQU8sTUFBTSxDQUFDO0tBQ2Y7OztXQUVxQix5QkFDcEIsVUFBa0IsRUFDbEIsSUFBbUIsRUFDbkIsUUFBZ0IsRUFDRDs7OztBQUlmLFVBQU0sb0JBQW9CLEdBQUcsa0JBQUssU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ3hELFVBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQUEsR0FBRztlQUNwQixvQkFBb0IsS0FBSyxHQUFHLElBQzVCLG9CQUFvQixLQUFLLGtCQUFLLE9BQU8sQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDO09BQUEsQ0FDckQsQ0FBQzs7O0FBR0YsVUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFDLEdBQUcsRUFBRSxRQUFRLEVBQUs7QUFDOUIsWUFBSSwyQkFBMkIsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUU7QUFDeEMsY0FBTSxTQUFTLEdBQUcsUUFBUSxHQUFHLENBQUMsQ0FBQztBQUMvQixjQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDL0IsY0FBSSxDQUFDLGtCQUFLLFVBQVUsQ0FBQyxRQUFRLENBQUMsRUFBRTtBQUM5QixvQkFBUSxHQUFHLGtCQUFLLElBQUksQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDekMsZ0JBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxRQUFRLENBQUM7V0FDNUI7U0FDRixNQUFNLElBQUkseUNBQXlDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUU7QUFDN0UsY0FBSSxRQUFRLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNoQyxjQUFJLENBQUMsa0JBQUssVUFBVSxDQUFDLFFBQVEsQ0FBQyxFQUFFO0FBQzlCLG9CQUFRLEdBQUcsa0JBQUssSUFBSSxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztBQUN6QyxnQkFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQztXQUNqRDtTQUNGO09BQ0YsQ0FBQyxDQUFDOzs7QUFHSCxVQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2pDLFVBQUksS0FBSyxLQUFLLENBQUMsQ0FBQyxFQUFFO0FBQ2hCLFlBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO09BQ3ZCOztBQUVELGFBQU8sSUFBSSxDQUFDO0tBQ2I7Ozs2QkFFb0MsV0FBQyxNQUFjLEVBQW9COzs7OztBQUt0RSxVQUFNLEdBQUcsR0FBRyxrQkFBSyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDakMsVUFBTSxLQUFLLEdBQUcsTUFBTSwwQkFBVSxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDM0MsVUFBTSxRQUFRLEdBQUcsaUJBQWlCLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDNUQsV0FBSyxJQUFNLElBQUksSUFBSSxLQUFLLEVBQUU7QUFDeEIsWUFBSSxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksaUJBQWlCLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLEtBQUssUUFBUSxFQUFFO0FBQy9FLGlCQUFPLGtCQUFLLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7U0FDN0I7T0FDRjtBQUNELGFBQU8sSUFBSSxDQUFDO0tBQ2I7Ozs7O1dBR3NCLDBCQUFDLElBQVksRUFBVTtBQUM1QyxVQUFJLFFBQVEsR0FBRyxrQkFBSyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDbkMsVUFBTSxHQUFHLEdBQUcsUUFBUSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN0QyxVQUFJLEdBQUcsS0FBSyxDQUFDLENBQUMsRUFBRTtBQUNkLGdCQUFRLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7T0FDcEM7QUFDRCxhQUFPLFFBQVEsQ0FBQyxPQUFPLENBQUMsa0JBQWtCLEVBQUUsRUFBRSxDQUFDLENBQUM7S0FDakQ7OztTQS9QRyxpQkFBaUI7OztBQWtRdkIsTUFBTSxDQUFDLE9BQU8sR0FBRyxpQkFBaUIsQ0FBQyIsImZpbGUiOiJDbGFuZ0ZsYWdzTWFuYWdlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtCdWNrVXRpbHN9IGZyb20gJy4uLy4uL251Y2xpZGUtYnVjay1iYXNlL2xpYi9CdWNrVXRpbHMnO1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7cGFyc2V9IGZyb20gJ3NoZWxsLXF1b3RlJztcbmltcG9ydCB7dHJhY2tUaW1pbmd9IGZyb20gJy4uLy4uL251Y2xpZGUtYW5hbHl0aWNzJztcbmltcG9ydCB7ZnNQcm9taXNlfSBmcm9tICcuLi8uLi9udWNsaWRlLWNvbW1vbnMnO1xuaW1wb3J0IHtnZXRMb2dnZXJ9IGZyb20gJy4uLy4uL251Y2xpZGUtbG9nZ2luZyc7XG5pbXBvcnQge0J1Y2tQcm9qZWN0fSBmcm9tICcuLi8uLi9udWNsaWRlLWJ1Y2stYmFzZS9saWIvQnVja1Byb2plY3QnO1xuXG5jb25zdCBsb2dnZXIgPSBnZXRMb2dnZXIoKTtcblxuY29uc3QgQ09NUElMQVRJT05fREFUQUJBU0VfRklMRSA9ICdjb21waWxlX2NvbW1hbmRzLmpzb24nO1xuLyoqXG4gKiBGYWNlYm9vayBwdXRzIGFsbCBoZWFkZXJzIGluIGEgPHRhcmdldD46X19kZWZhdWx0X2hlYWRlcnNfXyBidWlsZCB0YXJnZXQgYnkgZGVmYXVsdC5cbiAqIFRoaXMgdGFyZ2V0IHdpbGwgbmV2ZXIgcHJvZHVjZSBjb21waWxhdGlvbiBmbGFncywgc28gbWFrZSBzdXJlIHRvIGlnbm9yZSBpdC5cbiAqL1xuY29uc3QgREVGQVVMVF9IRUFERVJTX1RBUkdFVCA9ICdfX2RlZmF1bHRfaGVhZGVyc19fJztcbmNvbnN0IEhFQURFUl9FWFRFTlNJT05TID0gbmV3IFNldChbJy5oJywgJy5oaCcsICcuaHBwJywgJy5oeHgnLCAnLmgrKyddKTtcbmNvbnN0IFNPVVJDRV9FWFRFTlNJT05TID0gbmV3IFNldChbJy5jJywgJy5jYycsICcuY3BwJywgJy5jeHgnLCAnLmMrKycsICdtJywgJ21tJ10pO1xuXG5jb25zdCBDTEFOR19GTEFHU19USEFUX1RBS0VfUEFUSFMgPSBuZXcgU2V0KFtcbiAgJy1GJyxcbiAgJy1JJyxcbiAgJy1pbmNsdWRlJyxcbiAgJy1pcXVvdGUnLFxuICAnLWlzeXNyb290JyxcbiAgJy1pc3lzdGVtJyxcbl0pO1xuXG5jb25zdCBTSU5HTEVfTEVUVEVSX0NMQU5HX0ZMQUdTX1RIQVRfVEFLRV9QQVRIUyA9IG5ldyBTZXQoXG4gIEFycmF5LmZyb20oQ0xBTkdfRkxBR1NfVEhBVF9UQUtFX1BBVEhTKVxuICAgIC5maWx0ZXIoaXRlbSA9PiBpdGVtLmxlbmd0aCA9PT0gMilcbik7XG5cbmZ1bmN0aW9uIGlzSGVhZGVyRmlsZShmaWxlbmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiBIRUFERVJfRVhURU5TSU9OUy5oYXMocGF0aC5leHRuYW1lKGZpbGVuYW1lKSk7XG59XG5cbmZ1bmN0aW9uIGlzU291cmNlRmlsZShmaWxlbmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiBTT1VSQ0VfRVhURU5TSU9OUy5oYXMocGF0aC5leHRuYW1lKGZpbGVuYW1lKSk7XG59XG5cbmNsYXNzIENsYW5nRmxhZ3NNYW5hZ2VyIHtcbiAgX2J1Y2tVdGlsczogQnVja1V0aWxzO1xuICBfY2FjaGVkQnVja1Byb2plY3RzOiBNYXA8c3RyaW5nLCBCdWNrUHJvamVjdD47XG4gIF9jb21waWxhdGlvbkRhdGFiYXNlczogU2V0PHN0cmluZz47XG4gIF9yZWFscGF0aENhY2hlOiBPYmplY3Q7XG4gIHBhdGhUb0ZsYWdzOiBNYXA8c3RyaW5nLCA/QXJyYXk8c3RyaW5nPj47XG5cbiAgY29uc3RydWN0b3IoYnVja1V0aWxzOiBCdWNrVXRpbHMpIHtcbiAgICB0aGlzLnBhdGhUb0ZsYWdzID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuX2J1Y2tVdGlscyA9IGJ1Y2tVdGlscztcbiAgICB0aGlzLl9jYWNoZWRCdWNrUHJvamVjdHMgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5fY29tcGlsYXRpb25EYXRhYmFzZXMgPSBuZXcgU2V0KCk7XG4gICAgdGhpcy5fcmVhbHBhdGhDYWNoZSA9IHt9O1xuICB9XG5cbiAgcmVzZXQoKSB7XG4gICAgdGhpcy5wYXRoVG9GbGFncy5jbGVhcigpO1xuICAgIHRoaXMuX2NhY2hlZEJ1Y2tQcm9qZWN0cy5jbGVhcigpO1xuICAgIHRoaXMuX2NvbXBpbGF0aW9uRGF0YWJhc2VzLmNsZWFyKCk7XG4gICAgdGhpcy5fcmVhbHBhdGhDYWNoZSA9IHt9O1xuICB9XG5cbiAgYXN5bmMgX2dldEJ1Y2tQcm9qZWN0KHNyYzogc3RyaW5nKTogUHJvbWlzZTw/QnVja1Byb2plY3Q+IHtcbiAgICAvLyBGb3Igbm93LCBpZiBhIHVzZXIgcmVxdWVzdHMgdGhlIGZsYWdzIGZvciBhIHBhdGggb3V0c2lkZSBvZiBhIEJ1Y2sgcHJvamVjdCxcbiAgICAvLyBzdWNoIGFzIC9BcHBsaWNhdGlvbnMvWGNvZGUuYXBwL0NvbnRlbnRzL0RldmVsb3Blci9QbGF0Zm9ybXMvLi4uLCB0aGVuXG4gICAgLy8gcmV0dXJuIG51bGwuIEdvaW5nIGZvcndhcmQsIHdlIHByb2JhYmx5IHdhbnQgdG8gc3BlY2lhbC1jYXNlIHNvbWUgb2YgdGhlXG4gICAgLy8gcGF0aHMgdW5kZXIgL0FwcGxpY2F0aW9ucy9YY29kZS5hcHAgc28gdGhhdCBjbGljay10by1zeW1ib2wgd29ya3MgaW5cbiAgICAvLyBmaWxlcyBsaWtlIEZyYW1ld29ya3MvVUlLaXQuZnJhbWV3b3JrL0hlYWRlcnMvVUlJbWFnZS5oLlxuICAgIGNvbnN0IGJ1Y2tQcm9qZWN0Um9vdCA9IGF3YWl0IHRoaXMuX2J1Y2tVdGlscy5nZXRCdWNrUHJvamVjdFJvb3Qoc3JjKTtcbiAgICBpZiAoYnVja1Byb2plY3RSb290ID09IG51bGwpIHtcbiAgICAgIGxvZ2dlci5pbmZvKFxuICAgICAgICAgICdEaWQgbm90IHRyeSB0byBhdHRlbXB0IHRvIGdldCBmbGFncyBmcm9tIEJ1Y2sgYmVjYXVzZSAnICtcbiAgICAgICAgICAnc291cmNlIGZpbGUgJXMgZG9lcyBub3QgYXBwZWFyIHRvIGJlIHBhcnQgb2YgYSBCdWNrIHByb2plY3QuJyxcbiAgICAgICAgICBzcmMpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2NhY2hlZEJ1Y2tQcm9qZWN0cy5oYXMoYnVja1Byb2plY3RSb290KSkge1xuICAgICAgcmV0dXJuIHRoaXMuX2NhY2hlZEJ1Y2tQcm9qZWN0cy5nZXQoYnVja1Byb2plY3RSb290KTtcbiAgICB9XG5cbiAgICBjb25zdCBidWNrUHJvamVjdCA9IG5ldyBCdWNrUHJvamVjdCh7cm9vdFBhdGg6IGJ1Y2tQcm9qZWN0Um9vdH0pO1xuICAgIHRoaXMuX2NhY2hlZEJ1Y2tQcm9qZWN0cy5zZXQoYnVja1Byb2plY3RSb290LCBidWNrUHJvamVjdCk7XG4gICAgcmV0dXJuIGJ1Y2tQcm9qZWN0O1xuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm4gYSBzcGFjZS1kZWxpbWl0ZWQgc3RyaW5nIG9mIGZsYWdzIG9yIG51bGwgaWYgbm90aGluZyBpcyBrbm93blxuICAgKiAgICAgYWJvdXQgdGhlIHNyYyBmaWxlLiBGb3IgZXhhbXBsZSwgbnVsbCB3aWxsIGJlIHJldHVybmVkIGlmIHNyYyBpcyBub3RcbiAgICogICAgIHVuZGVyIHRoZSBwcm9qZWN0IHJvb3QuXG4gICAqL1xuICBhc3luYyBnZXRGbGFnc0ZvclNyYyhzcmM6IHN0cmluZyk6IFByb21pc2U8P0FycmF5PHN0cmluZz4+IHtcbiAgICBsZXQgZmxhZ3MgPSB0aGlzLnBhdGhUb0ZsYWdzLmdldChzcmMpO1xuICAgIGlmIChmbGFncyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZmxhZ3M7XG4gICAgfVxuICAgIGZsYWdzID0gYXdhaXQgdGhpcy5fZ2V0RmxhZ3NGb3JTcmNJbXBsKHNyYyk7XG4gICAgdGhpcy5wYXRoVG9GbGFncy5zZXQoc3JjLCBmbGFncyk7XG4gICAgcmV0dXJuIGZsYWdzO1xuICB9XG5cbiAgQHRyYWNrVGltaW5nKCdudWNsaWRlLWNsYW5nLmdldC1mbGFncycpXG4gIGFzeW5jIF9nZXRGbGFnc0ZvclNyY0ltcGwoc3JjOiBzdHJpbmcpOiBQcm9taXNlPD9BcnJheTxzdHJpbmc+PiB7XG4gICAgLy8gTG9vayBmb3IgYSBtYW51YWxseSBwcm92aWRlZCBjb21waWxhdGlvbiBkYXRhYmFzZS5cbiAgICBjb25zdCBkYkRpciA9IGF3YWl0IGZzUHJvbWlzZS5maW5kTmVhcmVzdEZpbGUoXG4gICAgICBDT01QSUxBVElPTl9EQVRBQkFTRV9GSUxFLFxuICAgICAgcGF0aC5kaXJuYW1lKHNyYyksXG4gICAgKTtcbiAgICBpZiAoZGJEaXIgIT0gbnVsbCkge1xuICAgICAgY29uc3QgZGJGaWxlID0gcGF0aC5qb2luKGRiRGlyLCBDT01QSUxBVElPTl9EQVRBQkFTRV9GSUxFKTtcbiAgICAgIGF3YWl0IHRoaXMuX2xvYWRGbGFnc0Zyb21Db21waWxhdGlvbkRhdGFiYXNlKGRiRmlsZSk7XG4gICAgICBjb25zdCBmbGFncyA9IHRoaXMucGF0aFRvRmxhZ3MuZ2V0KHNyYyk7XG4gICAgICBpZiAoZmxhZ3MgIT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gZmxhZ3M7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgYnVja0ZsYWdzID0gYXdhaXQgdGhpcy5fbG9hZEZsYWdzRnJvbUJ1Y2soc3JjKTtcbiAgICBpZiAoaXNIZWFkZXJGaWxlKHNyYykpIHtcbiAgICAgIC8vIEFjY2VwdCBmbGFncyBmcm9tIGFueSBzb3VyY2UgZmlsZSBpbiB0aGUgdGFyZ2V0LlxuICAgICAgaWYgKGJ1Y2tGbGFncy5zaXplID4gMCkge1xuICAgICAgICByZXR1cm4gYnVja0ZsYWdzLnZhbHVlcygpLm5leHQoKS52YWx1ZTtcbiAgICAgIH1cbiAgICAgIC8vIFRyeSBmaW5kaW5nIGZsYWdzIGZvciBhIHJlbGF0ZWQgc291cmNlIGZpbGUuXG4gICAgICBjb25zdCBzb3VyY2VGaWxlID0gYXdhaXQgQ2xhbmdGbGFnc01hbmFnZXIuX2ZpbmRTb3VyY2VGaWxlRm9ySGVhZGVyKHNyYyk7XG4gICAgICBpZiAoc291cmNlRmlsZSAhPSBudWxsKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldEZsYWdzRm9yU3JjKHNvdXJjZUZpbGUpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5wYXRoVG9GbGFncy5nZXQoc3JjKSB8fCBudWxsO1xuICB9XG5cbiAgYXN5bmMgX2xvYWRGbGFnc0Zyb21Db21waWxhdGlvbkRhdGFiYXNlKGRiRmlsZTogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKHRoaXMuX2NvbXBpbGF0aW9uRGF0YWJhc2VzLmhhcyhkYkZpbGUpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGNvbnRlbnRzID0gYXdhaXQgZnNQcm9taXNlLnJlYWRGaWxlKGRiRmlsZSk7XG4gICAgICBjb25zdCBkYXRhID0gSlNPTi5wYXJzZShjb250ZW50cyk7XG4gICAgICBpbnZhcmlhbnQoZGF0YSBpbnN0YW5jZW9mIEFycmF5KTtcbiAgICAgIGF3YWl0IFByb21pc2UuYWxsKGRhdGEubWFwKGFzeW5jIGVudHJ5ID0+IHtcbiAgICAgICAgY29uc3Qge2NvbW1hbmQsIGZpbGV9ID0gZW50cnk7XG4gICAgICAgIGNvbnN0IGRpcmVjdG9yeSA9IGF3YWl0IGZzUHJvbWlzZS5yZWFscGF0aChlbnRyeS5kaXJlY3RvcnksIHRoaXMuX3JlYWxwYXRoQ2FjaGUpO1xuICAgICAgICBjb25zdCBhcmdzID0gQ2xhbmdGbGFnc01hbmFnZXIucGFyc2VBcmd1bWVudHNGcm9tQ29tbWFuZChjb21tYW5kKTtcbiAgICAgICAgY29uc3QgZmlsZW5hbWUgPSBwYXRoLnJlc29sdmUoZGlyZWN0b3J5LCBmaWxlKTtcbiAgICAgICAgaWYgKGF3YWl0IGZzUHJvbWlzZS5leGlzdHMoZmlsZW5hbWUpKSB7XG4gICAgICAgICAgY29uc3QgcmVhbHBhdGggPSBhd2FpdCBmc1Byb21pc2UucmVhbHBhdGgoZmlsZW5hbWUsIHRoaXMuX3JlYWxwYXRoQ2FjaGUpO1xuICAgICAgICAgIHRoaXMucGF0aFRvRmxhZ3Muc2V0KHJlYWxwYXRoLCBDbGFuZ0ZsYWdzTWFuYWdlci5zYW5pdGl6ZUNvbW1hbmQoZmlsZSwgYXJncywgZGlyZWN0b3J5KSk7XG4gICAgICAgIH1cbiAgICAgIH0pKTtcbiAgICAgIHRoaXMuX2NvbXBpbGF0aW9uRGF0YWJhc2VzLmFkZChkYkZpbGUpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGxvZ2dlci5lcnJvcihgRXJyb3IgcmVhZGluZyBjb21waWxhdGlvbiBmbGFncyBmcm9tICR7ZGJGaWxlfWAsIGUpO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIF9sb2FkRmxhZ3NGcm9tQnVjayhzcmM6IHN0cmluZyk6IFByb21pc2U8TWFwPHN0cmluZywgQXJyYXk8c3RyaW5nPj4+IHtcbiAgICBjb25zdCBmbGFncyA9IG5ldyBNYXAoKTtcbiAgICBjb25zdCBidWNrUHJvamVjdCA9IGF3YWl0IHRoaXMuX2dldEJ1Y2tQcm9qZWN0KHNyYyk7XG4gICAgaWYgKCFidWNrUHJvamVjdCkge1xuICAgICAgcmV0dXJuIGZsYWdzO1xuICAgIH1cblxuICAgIGNvbnN0IHRhcmdldCA9IChhd2FpdCBidWNrUHJvamVjdC5nZXRPd25lcihzcmMpKVxuICAgICAgLmZpbmQoeCA9PiB4LmluZGV4T2YoREVGQVVMVF9IRUFERVJTX1RBUkdFVCkgPT09IC0xKTtcblxuICAgIGlmICh0YXJnZXQgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIGZsYWdzO1xuICAgIH1cblxuICAgIC8vIFRPRE8obWJvbGluKTogVGhlIGFyY2hpdGVjdHVyZSBzaG91bGQgYmUgY2hvc2VuIGZyb20gYSBkcm9wZG93biBtZW51IGxpa2VcbiAgICAvLyBpdCBpcyBpbiBYY29kZSByYXRoZXIgdGhhbiBoYXJkY29kaW5nIHRoaW5ncyB0byBpcGhvbmVzaW11bGF0b3IteDg2XzY0LlxuICAgIGxldCBhcmNoO1xuICAgIGlmIChwcm9jZXNzLnBsYXRmb3JtID09PSAnZGFyd2luJykge1xuICAgICAgYXJjaCA9ICdpcGhvbmVzaW11bGF0b3IteDg2XzY0JztcbiAgICB9IGVsc2Uge1xuICAgICAgYXJjaCA9ICdkZWZhdWx0JztcbiAgICB9XG4gICAgLy8gVE9ETyhtYm9saW4pOiBOZWVkIGxvZ2ljIHRvIG1ha2Ugc3VyZSByZXN1bHRzIGFyZSByZXN0cmljdGVkIHRvXG4gICAgLy8gYXBwbGVfbGlicmFyeSBvciBhcHBsZV9iaW5hcnkgcnVsZXMuIEluIHByYWN0aWNlLCB0aGlzIHNob3VsZCBiZSBPSyBmb3JcbiAgICAvLyBub3cuIFRob3VnaCBvbmNlIHdlIHN0YXJ0IHN1cHBvcnRpbmcgb3JkaW5hcnkgLmNwcCBmaWxlcywgdGhlbiB3ZVxuICAgIC8vIGxpa2VseSBuZWVkIHRvIGJlIGV2ZW4gbW9yZSBjYXJlZnVsIGFib3V0IGNob29zaW5nIHRoZSBhcmNoaXRlY3R1cmVcbiAgICAvLyBmbGF2b3IuXG4gICAgY29uc3QgYnVpbGRUYXJnZXQgPSB0YXJnZXQgKyAnI2NvbXBpbGF0aW9uLWRhdGFiYXNlLCcgKyBhcmNoO1xuXG4gICAgY29uc3QgYnVpbGRSZXBvcnQgPSBhd2FpdCBidWNrUHJvamVjdC5idWlsZChbYnVpbGRUYXJnZXRdKTtcbiAgICBpZiAoIWJ1aWxkUmVwb3J0LnN1Y2Nlc3MpIHtcbiAgICAgIC8vIFRPRE8obWJvbGluKTogRnJlcXVlbnRseSBmYWlsaW5nIGR1ZSB0byAnRGFlbW9uIGlzIGJ1c3knIGVycm9ycy5cbiAgICAgIC8vIFVsdGltYXRlbHksIEJ1Y2sgc2hvdWxkIHF1ZXVlIHRoaW5ncyB1cCwgYnV0IGZvciBub3csIE51Y2xpZGUgc2hvdWxkLlxuICAgICAgY29uc3QgZXJyb3IgPSBgRmFpbGVkIHRvIGJ1aWxkICR7YnVpbGRUYXJnZXR9YDtcbiAgICAgIGxvZ2dlci5lcnJvcihlcnJvcik7XG4gICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG4gICAgY29uc3QgYnVja1Byb2plY3RSb290ID0gYXdhaXQgYnVja1Byb2plY3QuZ2V0UGF0aCgpO1xuICAgIGxldCBwYXRoVG9Db21waWxhdGlvbkRhdGFiYXNlID0gYnVpbGRSZXBvcnRbJ3Jlc3VsdHMnXVtidWlsZFRhcmdldF1bJ291dHB1dCddO1xuICAgIHBhdGhUb0NvbXBpbGF0aW9uRGF0YWJhc2UgPSBwYXRoLmpvaW4oXG4gICAgICAgIGJ1Y2tQcm9qZWN0Um9vdCxcbiAgICAgICAgcGF0aFRvQ29tcGlsYXRpb25EYXRhYmFzZSk7XG5cbiAgICBjb25zdCBjb21waWxhdGlvbkRhdGFiYXNlSnNvbkJ1ZmZlciA9IGF3YWl0IGZzUHJvbWlzZS5yZWFkRmlsZShwYXRoVG9Db21waWxhdGlvbkRhdGFiYXNlKTtcbiAgICBjb25zdCBjb21waWxhdGlvbkRhdGFiYXNlSnNvbiA9IGNvbXBpbGF0aW9uRGF0YWJhc2VKc29uQnVmZmVyLnRvU3RyaW5nKCd1dGY4Jyk7XG4gICAgY29uc3QgY29tcGlsYXRpb25EYXRhYmFzZSA9IEpTT04ucGFyc2UoY29tcGlsYXRpb25EYXRhYmFzZUpzb24pO1xuXG4gICAgY29tcGlsYXRpb25EYXRhYmFzZS5mb3JFYWNoKGl0ZW0gPT4ge1xuICAgICAgY29uc3Qge2ZpbGV9ID0gaXRlbTtcbiAgICAgIGNvbnN0IGZpbGVGbGFncyA9IENsYW5nRmxhZ3NNYW5hZ2VyLnNhbml0aXplQ29tbWFuZChcbiAgICAgICAgZmlsZSxcbiAgICAgICAgaXRlbS5hcmd1bWVudHMsXG4gICAgICAgIGJ1Y2tQcm9qZWN0Um9vdCxcbiAgICAgICk7XG4gICAgICBmbGFncy5zZXQoZmlsZSwgZmlsZUZsYWdzKTtcbiAgICAgIHRoaXMucGF0aFRvRmxhZ3Muc2V0KGZpbGUsIGZpbGVGbGFncyk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGZsYWdzO1xuICB9XG5cbiAgc3RhdGljIHBhcnNlQXJndW1lbnRzRnJvbUNvbW1hbmQoY29tbWFuZDogc3RyaW5nKTogQXJyYXk8c3RyaW5nPiB7XG4gICAgY29uc3QgcmVzdWx0ID0gW107XG4gICAgLy8gc2hlbGwtcXVvdGUgcmV0dXJucyBvYmplY3RzIGZvciB0aGluZ3MgbGlrZSBwaXBlcy5cbiAgICAvLyBUaGlzIHNob3VsZCBuZXZlciBoYXBwZW4gd2l0aCBwcm9wZXIgZmxhZ3MsIGJ1dCBpZ25vcmUgdGhlbSB0byBiZSBzYWZlLlxuICAgIGZvciAoY29uc3QgYXJnIG9mIHBhcnNlKGNvbW1hbmQpKSB7XG4gICAgICBpZiAodHlwZW9mIGFyZyAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICByZXN1bHQucHVzaChhcmcpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgc3RhdGljIHNhbml0aXplQ29tbWFuZChcbiAgICBzb3VyY2VGaWxlOiBzdHJpbmcsXG4gICAgYXJnczogQXJyYXk8c3RyaW5nPixcbiAgICBiYXNlUGF0aDogc3RyaW5nXG4gICk6IEFycmF5PHN0cmluZz4ge1xuICAgIC8vIEZvciBzYWZldHksIGNyZWF0ZSBhIG5ldyBjb3B5IG9mIHRoZSBhcnJheS4gV2UgZXhjbHVkZSB0aGUgcGF0aCB0byB0aGUgZmlsZSB0byBjb21waWxlIGZyb21cbiAgICAvLyBjb21waWxhdGlvbiBkYXRhYmFzZSBnZW5lcmF0ZWQgYnkgQnVjay4gSXQgbXVzdCBiZSByZW1vdmVkIGZyb20gdGhlIGxpc3Qgb2YgY29tbWFuZC1saW5lXG4gICAgLy8gYXJndW1lbnRzIHBhc3NlZCB0byBsaWJjbGFuZy5cbiAgICBjb25zdCBub3JtYWxpemVkU291cmNlRmlsZSA9IHBhdGgubm9ybWFsaXplKHNvdXJjZUZpbGUpO1xuICAgIGFyZ3MgPSBhcmdzLmZpbHRlcihhcmcgPT5cbiAgICAgIG5vcm1hbGl6ZWRTb3VyY2VGaWxlICE9PSBhcmcgJiZcbiAgICAgIG5vcm1hbGl6ZWRTb3VyY2VGaWxlICE9PSBwYXRoLnJlc29sdmUoYmFzZVBhdGgsIGFyZylcbiAgICApO1xuXG4gICAgLy8gUmVzb2x2ZSByZWxhdGl2ZSBwYXRoIGFyZ3VtZW50cyBhZ2FpbnN0IHRoZSBCdWNrIHByb2plY3Qgcm9vdC5cbiAgICBhcmdzLmZvckVhY2goKGFyZywgYXJnSW5kZXgpID0+IHtcbiAgICAgIGlmIChDTEFOR19GTEFHU19USEFUX1RBS0VfUEFUSFMuaGFzKGFyZykpIHtcbiAgICAgICAgY29uc3QgbmV4dEluZGV4ID0gYXJnSW5kZXggKyAxO1xuICAgICAgICBsZXQgZmlsZVBhdGggPSBhcmdzW25leHRJbmRleF07XG4gICAgICAgIGlmICghcGF0aC5pc0Fic29sdXRlKGZpbGVQYXRoKSkge1xuICAgICAgICAgIGZpbGVQYXRoID0gcGF0aC5qb2luKGJhc2VQYXRoLCBmaWxlUGF0aCk7XG4gICAgICAgICAgYXJnc1tuZXh0SW5kZXhdID0gZmlsZVBhdGg7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoU0lOR0xFX0xFVFRFUl9DTEFOR19GTEFHU19USEFUX1RBS0VfUEFUSFMuaGFzKGFyZy5zdWJzdHJpbmcoMCwgMikpKSB7XG4gICAgICAgIGxldCBmaWxlUGF0aCA9IGFyZy5zdWJzdHJpbmcoMik7XG4gICAgICAgIGlmICghcGF0aC5pc0Fic29sdXRlKGZpbGVQYXRoKSkge1xuICAgICAgICAgIGZpbGVQYXRoID0gcGF0aC5qb2luKGJhc2VQYXRoLCBmaWxlUGF0aCk7XG4gICAgICAgICAgYXJnc1thcmdJbmRleF0gPSBhcmcuc3Vic3RyaW5nKDAsIDIpICsgZmlsZVBhdGg7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIElmIGFuIG91dHB1dCBmaWxlIGlzIHNwZWNpZmllZCwgcmVtb3ZlIHRoYXQgYXJndW1lbnQuXG4gICAgY29uc3QgaW5kZXggPSBhcmdzLmluZGV4T2YoJy1vJyk7XG4gICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgYXJncy5zcGxpY2UoaW5kZXgsIDIpO1xuICAgIH1cblxuICAgIHJldHVybiBhcmdzO1xuICB9XG5cbiAgc3RhdGljIGFzeW5jIF9maW5kU291cmNlRmlsZUZvckhlYWRlcihoZWFkZXI6IHN0cmluZyk6IFByb21pc2U8P3N0cmluZz4ge1xuICAgIC8vIEJhc2ljIGltcGxlbWVudGF0aW9uOiBsb29rIGF0IGZpbGVzIGluIHRoZSBzYW1lIGRpcmVjdG9yeSBmb3IgcGF0aHNcbiAgICAvLyB3aXRoIG1hdGNoaW5nIGZpbGUgbmFtZXMuXG4gICAgLy8gVE9ETygjMTAwMjg1MzEpOiBTY2FuIHRocm91Z2ggc291cmNlIGZpbGVzIHRvIGZpbmQgdGhvc2UgdGhhdCBpbmNsdWRlXG4gICAgLy8gdGhlIGhlYWRlciBmaWxlLlxuICAgIGNvbnN0IGRpciA9IHBhdGguZGlybmFtZShoZWFkZXIpO1xuICAgIGNvbnN0IGZpbGVzID0gYXdhaXQgZnNQcm9taXNlLnJlYWRkaXIoZGlyKTtcbiAgICBjb25zdCBiYXNlbmFtZSA9IENsYW5nRmxhZ3NNYW5hZ2VyLl9nZXRGaWxlQmFzZW5hbWUoaGVhZGVyKTtcbiAgICBmb3IgKGNvbnN0IGZpbGUgb2YgZmlsZXMpIHtcbiAgICAgIGlmIChpc1NvdXJjZUZpbGUoZmlsZSkgJiYgQ2xhbmdGbGFnc01hbmFnZXIuX2dldEZpbGVCYXNlbmFtZShmaWxlKSA9PT0gYmFzZW5hbWUpIHtcbiAgICAgICAgcmV0dXJuIHBhdGguam9pbihkaXIsIGZpbGUpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8vIFN0cmlwIG9mZiB0aGUgZXh0ZW5zaW9uIGFuZCBjb252ZW50aW9uYWwgc3VmZml4ZXMgbGlrZSBcIkludGVybmFsXCIgYW5kIFwiLWlubFwiLlxuICBzdGF0aWMgX2dldEZpbGVCYXNlbmFtZShmaWxlOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGxldCBiYXNlbmFtZSA9IHBhdGguYmFzZW5hbWUoZmlsZSk7XG4gICAgY29uc3QgZXh0ID0gYmFzZW5hbWUubGFzdEluZGV4T2YoJy4nKTtcbiAgICBpZiAoZXh0ICE9PSAtMSkge1xuICAgICAgYmFzZW5hbWUgPSBiYXNlbmFtZS5zdWJzdHIoMCwgZXh0KTtcbiAgICB9XG4gICAgcmV0dXJuIGJhc2VuYW1lLnJlcGxhY2UoLyhJbnRlcm5hbHwtaW5sKSQvLCAnJyk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBDbGFuZ0ZsYWdzTWFuYWdlcjtcbiJdfQ==