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

var CLANG_FLAGS_THAT_TAKE_PATHS = new Set(['-F', '-I', '-include', '-iquote', '-isysroot', '-isystem']);

var SINGLE_LETTER_CLANG_FLAGS_THAT_TAKE_PATHS = new Set(_nuclideCommons.array.from(CLANG_FLAGS_THAT_TAKE_PATHS).filter(function (item) {
  return item.length === 2;
}));

var ClangFlagsManager = (function () {
  function ClangFlagsManager(buckUtils) {
    _classCallCheck(this, ClangFlagsManager);

    /**
     * Keys are absolute paths. Values are space-delimited strings of flags.
     */
    this.pathToFlags = {};
    this._buckUtils = buckUtils;
    this._cachedBuckProjects = new Map();
    this._compilationDatabases = new Set();
    this._realpathCache = {};
  }

  _createDecoratedClass(ClangFlagsManager, [{
    key: 'reset',
    value: function reset() {
      this.pathToFlags = {};
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
      var flags = this.pathToFlags[src];
      if (flags !== undefined) {
        return flags;
      }
      flags = yield this._getFlagsForSrcImpl(src);
      this.pathToFlags[src] = flags;
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
        var flags = this._lookupFlagsForSrc(src);
        if (flags != null) {
          return flags;
        }
      }

      yield this._loadFlagsFromBuck(src);
      return this._lookupFlagsForSrc(src);
    })
  }, {
    key: '_lookupFlagsForSrc',
    value: function _lookupFlagsForSrc(src) {
      var flags = this.pathToFlags[src];
      if (flags !== undefined) {
        return flags;
      }

      // Header files typically don't have entries in the compilation database.
      // As a simple heuristic, look for other files with the same extension.
      var ext = src.lastIndexOf('.');
      if (ext !== -1) {
        var extLess = src.substring(0, ext + 1);
        for (var file in this.pathToFlags) {
          if (file.startsWith(extLess)) {
            return this.pathToFlags[file];
          }
        }
      }
      return null;
    }
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
            _this.pathToFlags[realpath] = ClangFlagsManager.sanitizeCommand(file, args, directory);
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

      var buckProject = yield this._getBuckProject(src);
      if (!buckProject) {
        return;
      }

      var targets = yield buckProject.getOwner(src);
      if (targets.length === 0) {
        return;
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
      var buildTarget = targets[0] + '#compilation-database,' + arch;

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

        _this2.pathToFlags[file] = ClangFlagsManager.sanitizeCommand(file, item.arguments, buckProjectRoot);
      });
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
  }]);

  return ClangFlagsManager;
})();

module.exports = ClangFlagsManager;
//# sourceMappingURL=data:application/json;base64,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QUVELGFBQU8sSUFBSSxDQUFDO0tBQ2I7OztTQXpPRyxpQkFBaUI7OztBQTRPdkIsTUFBTSxDQUFDLE9BQU8sR0FBRyxpQkFBaUIsQ0FBQyIsImZpbGUiOiJDbGFuZ0ZsYWdzTWFuYWdlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtCdWNrVXRpbHN9IGZyb20gJy4uLy4uL251Y2xpZGUtYnVjay1iYXNlL2xpYi9CdWNrVXRpbHMnO1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7cGFyc2V9IGZyb20gJ3NoZWxsLXF1b3RlJztcbmltcG9ydCB7dHJhY2tUaW1pbmd9IGZyb20gJy4uLy4uL251Y2xpZGUtYW5hbHl0aWNzJztcbmltcG9ydCB7YXJyYXksIGZzUHJvbWlzZX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1jb21tb25zJztcbmltcG9ydCB7Z2V0TG9nZ2VyfSBmcm9tICcuLi8uLi9udWNsaWRlLWxvZ2dpbmcnO1xuaW1wb3J0IHtCdWNrUHJvamVjdH0gZnJvbSAnLi4vLi4vbnVjbGlkZS1idWNrLWJhc2UvbGliL0J1Y2tQcm9qZWN0JztcblxuY29uc3QgbG9nZ2VyID0gZ2V0TG9nZ2VyKCk7XG5cbmNvbnN0IENPTVBJTEFUSU9OX0RBVEFCQVNFX0ZJTEUgPSAnY29tcGlsZV9jb21tYW5kcy5qc29uJztcblxuY29uc3QgQ0xBTkdfRkxBR1NfVEhBVF9UQUtFX1BBVEhTID0gbmV3IFNldChbXG4gICctRicsXG4gICctSScsXG4gICctaW5jbHVkZScsXG4gICctaXF1b3RlJyxcbiAgJy1pc3lzcm9vdCcsXG4gICctaXN5c3RlbScsXG5dKTtcblxuY29uc3QgU0lOR0xFX0xFVFRFUl9DTEFOR19GTEFHU19USEFUX1RBS0VfUEFUSFMgPSBuZXcgU2V0KFxuICBhcnJheS5mcm9tKENMQU5HX0ZMQUdTX1RIQVRfVEFLRV9QQVRIUylcbiAgICAuZmlsdGVyKGl0ZW0gPT4gaXRlbS5sZW5ndGggPT09IDIpXG4pO1xuXG5jbGFzcyBDbGFuZ0ZsYWdzTWFuYWdlciB7XG4gIF9idWNrVXRpbHM6IEJ1Y2tVdGlscztcbiAgX2NhY2hlZEJ1Y2tQcm9qZWN0czogTWFwPHN0cmluZywgQnVja1Byb2plY3Q+O1xuICBfY29tcGlsYXRpb25EYXRhYmFzZXM6IFNldDxzdHJpbmc+O1xuICBfcmVhbHBhdGhDYWNoZTogT2JqZWN0O1xuICBwYXRoVG9GbGFnczoge1twYXRoOiBzdHJpbmddOiA/QXJyYXk8c3RyaW5nPn07XG5cbiAgY29uc3RydWN0b3IoYnVja1V0aWxzOiBCdWNrVXRpbHMpIHtcbiAgICAvKipcbiAgICAgKiBLZXlzIGFyZSBhYnNvbHV0ZSBwYXRocy4gVmFsdWVzIGFyZSBzcGFjZS1kZWxpbWl0ZWQgc3RyaW5ncyBvZiBmbGFncy5cbiAgICAgKi9cbiAgICB0aGlzLnBhdGhUb0ZsYWdzID0ge307XG4gICAgdGhpcy5fYnVja1V0aWxzID0gYnVja1V0aWxzO1xuICAgIHRoaXMuX2NhY2hlZEJ1Y2tQcm9qZWN0cyA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLl9jb21waWxhdGlvbkRhdGFiYXNlcyA9IG5ldyBTZXQoKTtcbiAgICB0aGlzLl9yZWFscGF0aENhY2hlID0ge307XG4gIH1cblxuICByZXNldCgpIHtcbiAgICB0aGlzLnBhdGhUb0ZsYWdzID0ge307XG4gICAgdGhpcy5fY2FjaGVkQnVja1Byb2plY3RzLmNsZWFyKCk7XG4gICAgdGhpcy5fY29tcGlsYXRpb25EYXRhYmFzZXMuY2xlYXIoKTtcbiAgICB0aGlzLl9yZWFscGF0aENhY2hlID0ge307XG4gIH1cblxuICBhc3luYyBfZ2V0QnVja1Byb2plY3Qoc3JjOiBzdHJpbmcpOiBQcm9taXNlPD9CdWNrUHJvamVjdD4ge1xuICAgIC8vIEZvciBub3csIGlmIGEgdXNlciByZXF1ZXN0cyB0aGUgZmxhZ3MgZm9yIGEgcGF0aCBvdXRzaWRlIG9mIGEgQnVjayBwcm9qZWN0LFxuICAgIC8vIHN1Y2ggYXMgL0FwcGxpY2F0aW9ucy9YY29kZS5hcHAvQ29udGVudHMvRGV2ZWxvcGVyL1BsYXRmb3Jtcy8uLi4sIHRoZW5cbiAgICAvLyByZXR1cm4gbnVsbC4gR29pbmcgZm9yd2FyZCwgd2UgcHJvYmFibHkgd2FudCB0byBzcGVjaWFsLWNhc2Ugc29tZSBvZiB0aGVcbiAgICAvLyBwYXRocyB1bmRlciAvQXBwbGljYXRpb25zL1hjb2RlLmFwcCBzbyB0aGF0IGNsaWNrLXRvLXN5bWJvbCB3b3JrcyBpblxuICAgIC8vIGZpbGVzIGxpa2UgRnJhbWV3b3Jrcy9VSUtpdC5mcmFtZXdvcmsvSGVhZGVycy9VSUltYWdlLmguXG4gICAgY29uc3QgYnVja1Byb2plY3RSb290ID0gYXdhaXQgdGhpcy5fYnVja1V0aWxzLmdldEJ1Y2tQcm9qZWN0Um9vdChzcmMpO1xuICAgIGlmIChidWNrUHJvamVjdFJvb3QgPT0gbnVsbCkge1xuICAgICAgbG9nZ2VyLmluZm8oXG4gICAgICAgICAgJ0RpZCBub3QgdHJ5IHRvIGF0dGVtcHQgdG8gZ2V0IGZsYWdzIGZyb20gQnVjayBiZWNhdXNlICcgK1xuICAgICAgICAgICdzb3VyY2UgZmlsZSAlcyBkb2VzIG5vdCBhcHBlYXIgdG8gYmUgcGFydCBvZiBhIEJ1Y2sgcHJvamVjdC4nLFxuICAgICAgICAgIHNyYyk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fY2FjaGVkQnVja1Byb2plY3RzLmhhcyhidWNrUHJvamVjdFJvb3QpKSB7XG4gICAgICByZXR1cm4gdGhpcy5fY2FjaGVkQnVja1Byb2plY3RzLmdldChidWNrUHJvamVjdFJvb3QpO1xuICAgIH1cblxuICAgIGNvbnN0IGJ1Y2tQcm9qZWN0ID0gbmV3IEJ1Y2tQcm9qZWN0KHtyb290UGF0aDogYnVja1Byb2plY3RSb290fSk7XG4gICAgdGhpcy5fY2FjaGVkQnVja1Byb2plY3RzLnNldChidWNrUHJvamVjdFJvb3QsIGJ1Y2tQcm9qZWN0KTtcbiAgICByZXR1cm4gYnVja1Byb2plY3Q7XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybiBhIHNwYWNlLWRlbGltaXRlZCBzdHJpbmcgb2YgZmxhZ3Mgb3IgbnVsbCBpZiBub3RoaW5nIGlzIGtub3duXG4gICAqICAgICBhYm91dCB0aGUgc3JjIGZpbGUuIEZvciBleGFtcGxlLCBudWxsIHdpbGwgYmUgcmV0dXJuZWQgaWYgc3JjIGlzIG5vdFxuICAgKiAgICAgdW5kZXIgdGhlIHByb2plY3Qgcm9vdC5cbiAgICovXG4gIGFzeW5jIGdldEZsYWdzRm9yU3JjKHNyYzogc3RyaW5nKTogUHJvbWlzZTw/QXJyYXk8c3RyaW5nPj4ge1xuICAgIGxldCBmbGFncyA9IHRoaXMucGF0aFRvRmxhZ3Nbc3JjXTtcbiAgICBpZiAoZmxhZ3MgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGZsYWdzO1xuICAgIH1cbiAgICBmbGFncyA9IGF3YWl0IHRoaXMuX2dldEZsYWdzRm9yU3JjSW1wbChzcmMpO1xuICAgIHRoaXMucGF0aFRvRmxhZ3Nbc3JjXSA9IGZsYWdzO1xuICAgIHJldHVybiBmbGFncztcbiAgfVxuXG4gIEB0cmFja1RpbWluZygnbnVjbGlkZS1jbGFuZy5nZXQtZmxhZ3MnKVxuICBhc3luYyBfZ2V0RmxhZ3NGb3JTcmNJbXBsKHNyYzogc3RyaW5nKTogUHJvbWlzZTw/QXJyYXk8c3RyaW5nPj4ge1xuICAgIC8vIExvb2sgZm9yIGEgbWFudWFsbHkgcHJvdmlkZWQgY29tcGlsYXRpb24gZGF0YWJhc2UuXG4gICAgY29uc3QgZGJEaXIgPSBhd2FpdCBmc1Byb21pc2UuZmluZE5lYXJlc3RGaWxlKFxuICAgICAgQ09NUElMQVRJT05fREFUQUJBU0VfRklMRSxcbiAgICAgIHBhdGguZGlybmFtZShzcmMpLFxuICAgICk7XG4gICAgaWYgKGRiRGlyICE9IG51bGwpIHtcbiAgICAgIGNvbnN0IGRiRmlsZSA9IHBhdGguam9pbihkYkRpciwgQ09NUElMQVRJT05fREFUQUJBU0VfRklMRSk7XG4gICAgICBhd2FpdCB0aGlzLl9sb2FkRmxhZ3NGcm9tQ29tcGlsYXRpb25EYXRhYmFzZShkYkZpbGUpO1xuICAgICAgY29uc3QgZmxhZ3MgPSB0aGlzLl9sb29rdXBGbGFnc0ZvclNyYyhzcmMpO1xuICAgICAgaWYgKGZsYWdzICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIGZsYWdzO1xuICAgICAgfVxuICAgIH1cblxuICAgIGF3YWl0IHRoaXMuX2xvYWRGbGFnc0Zyb21CdWNrKHNyYyk7XG4gICAgcmV0dXJuIHRoaXMuX2xvb2t1cEZsYWdzRm9yU3JjKHNyYyk7XG4gIH1cblxuICBfbG9va3VwRmxhZ3NGb3JTcmMoc3JjOiBzdHJpbmcpOiA/QXJyYXk8c3RyaW5nPiB7XG4gICAgY29uc3QgZmxhZ3MgPSB0aGlzLnBhdGhUb0ZsYWdzW3NyY107XG4gICAgaWYgKGZsYWdzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBmbGFncztcbiAgICB9XG5cbiAgICAvLyBIZWFkZXIgZmlsZXMgdHlwaWNhbGx5IGRvbid0IGhhdmUgZW50cmllcyBpbiB0aGUgY29tcGlsYXRpb24gZGF0YWJhc2UuXG4gICAgLy8gQXMgYSBzaW1wbGUgaGV1cmlzdGljLCBsb29rIGZvciBvdGhlciBmaWxlcyB3aXRoIHRoZSBzYW1lIGV4dGVuc2lvbi5cbiAgICBjb25zdCBleHQgPSBzcmMubGFzdEluZGV4T2YoJy4nKTtcbiAgICBpZiAoZXh0ICE9PSAtMSkge1xuICAgICAgY29uc3QgZXh0TGVzcyA9IHNyYy5zdWJzdHJpbmcoMCwgZXh0ICsgMSk7XG4gICAgICBmb3IgKGNvbnN0IGZpbGUgaW4gdGhpcy5wYXRoVG9GbGFncykge1xuICAgICAgICBpZiAoZmlsZS5zdGFydHNXaXRoKGV4dExlc3MpKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMucGF0aFRvRmxhZ3NbZmlsZV07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBhc3luYyBfbG9hZEZsYWdzRnJvbUNvbXBpbGF0aW9uRGF0YWJhc2UoZGJGaWxlOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAodGhpcy5fY29tcGlsYXRpb25EYXRhYmFzZXMuaGFzKGRiRmlsZSkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgY29udGVudHMgPSBhd2FpdCBmc1Byb21pc2UucmVhZEZpbGUoZGJGaWxlKTtcbiAgICAgIGNvbnN0IGRhdGEgPSBKU09OLnBhcnNlKGNvbnRlbnRzKTtcbiAgICAgIGludmFyaWFudChkYXRhIGluc3RhbmNlb2YgQXJyYXkpO1xuICAgICAgYXdhaXQgUHJvbWlzZS5hbGwoZGF0YS5tYXAoYXN5bmMgZW50cnkgPT4ge1xuICAgICAgICBjb25zdCB7Y29tbWFuZCwgZmlsZX0gPSBlbnRyeTtcbiAgICAgICAgY29uc3QgZGlyZWN0b3J5ID0gYXdhaXQgZnNQcm9taXNlLnJlYWxwYXRoKGVudHJ5LmRpcmVjdG9yeSwgdGhpcy5fcmVhbHBhdGhDYWNoZSk7XG4gICAgICAgIGNvbnN0IGFyZ3MgPSBDbGFuZ0ZsYWdzTWFuYWdlci5wYXJzZUFyZ3VtZW50c0Zyb21Db21tYW5kKGNvbW1hbmQpO1xuICAgICAgICBjb25zdCBmaWxlbmFtZSA9IHBhdGgucmVzb2x2ZShkaXJlY3RvcnksIGZpbGUpO1xuICAgICAgICBpZiAoYXdhaXQgZnNQcm9taXNlLmV4aXN0cyhmaWxlbmFtZSkpIHtcbiAgICAgICAgICBjb25zdCByZWFscGF0aCA9IGF3YWl0IGZzUHJvbWlzZS5yZWFscGF0aChmaWxlbmFtZSwgdGhpcy5fcmVhbHBhdGhDYWNoZSk7XG4gICAgICAgICAgdGhpcy5wYXRoVG9GbGFnc1tyZWFscGF0aF0gPSBDbGFuZ0ZsYWdzTWFuYWdlci5zYW5pdGl6ZUNvbW1hbmQoZmlsZSwgYXJncywgZGlyZWN0b3J5KTtcbiAgICAgICAgfVxuICAgICAgfSkpO1xuICAgICAgdGhpcy5fY29tcGlsYXRpb25EYXRhYmFzZXMuYWRkKGRiRmlsZSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgbG9nZ2VyLmVycm9yKGBFcnJvciByZWFkaW5nIGNvbXBpbGF0aW9uIGZsYWdzIGZyb20gJHtkYkZpbGV9YCwgZSk7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgX2xvYWRGbGFnc0Zyb21CdWNrKHNyYzogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgYnVja1Byb2plY3QgPSBhd2FpdCB0aGlzLl9nZXRCdWNrUHJvamVjdChzcmMpO1xuICAgIGlmICghYnVja1Byb2plY3QpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCB0YXJnZXRzID0gYXdhaXQgYnVja1Byb2plY3QuZ2V0T3duZXIoc3JjKTtcbiAgICBpZiAodGFyZ2V0cy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBUT0RPKG1ib2xpbik6IFRoZSBhcmNoaXRlY3R1cmUgc2hvdWxkIGJlIGNob3NlbiBmcm9tIGEgZHJvcGRvd24gbWVudSBsaWtlXG4gICAgLy8gaXQgaXMgaW4gWGNvZGUgcmF0aGVyIHRoYW4gaGFyZGNvZGluZyB0aGluZ3MgdG8gaXBob25lc2ltdWxhdG9yLXg4Nl82NC5cbiAgICBsZXQgYXJjaDtcbiAgICBpZiAocHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ2RhcndpbicpIHtcbiAgICAgIGFyY2ggPSAnaXBob25lc2ltdWxhdG9yLXg4Nl82NCc7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFyY2ggPSAnZGVmYXVsdCc7XG4gICAgfVxuICAgIC8vIFRPRE8obWJvbGluKTogTmVlZCBsb2dpYyB0byBtYWtlIHN1cmUgcmVzdWx0cyBhcmUgcmVzdHJpY3RlZCB0b1xuICAgIC8vIGFwcGxlX2xpYnJhcnkgb3IgYXBwbGVfYmluYXJ5IHJ1bGVzLiBJbiBwcmFjdGljZSwgdGhpcyBzaG91bGQgYmUgT0sgZm9yXG4gICAgLy8gbm93LiBUaG91Z2ggb25jZSB3ZSBzdGFydCBzdXBwb3J0aW5nIG9yZGluYXJ5IC5jcHAgZmlsZXMsIHRoZW4gd2VcbiAgICAvLyBsaWtlbHkgbmVlZCB0byBiZSBldmVuIG1vcmUgY2FyZWZ1bCBhYm91dCBjaG9vc2luZyB0aGUgYXJjaGl0ZWN0dXJlXG4gICAgLy8gZmxhdm9yLlxuICAgIGNvbnN0IGJ1aWxkVGFyZ2V0ID0gdGFyZ2V0c1swXSArICcjY29tcGlsYXRpb24tZGF0YWJhc2UsJyArIGFyY2g7XG5cbiAgICBjb25zdCBidWlsZFJlcG9ydCA9IGF3YWl0IGJ1Y2tQcm9qZWN0LmJ1aWxkKFtidWlsZFRhcmdldF0pO1xuICAgIGlmICghYnVpbGRSZXBvcnQuc3VjY2Vzcykge1xuICAgICAgLy8gVE9ETyhtYm9saW4pOiBGcmVxdWVudGx5IGZhaWxpbmcgZHVlIHRvICdEYWVtb24gaXMgYnVzeScgZXJyb3JzLlxuICAgICAgLy8gVWx0aW1hdGVseSwgQnVjayBzaG91bGQgcXVldWUgdGhpbmdzIHVwLCBidXQgZm9yIG5vdywgTnVjbGlkZSBzaG91bGQuXG4gICAgICBjb25zdCBlcnJvciA9IGBGYWlsZWQgdG8gYnVpbGQgJHtidWlsZFRhcmdldH1gO1xuICAgICAgbG9nZ2VyLmVycm9yKGVycm9yKTtcbiAgICAgIHRocm93IGVycm9yO1xuICAgIH1cbiAgICBjb25zdCBidWNrUHJvamVjdFJvb3QgPSBhd2FpdCBidWNrUHJvamVjdC5nZXRQYXRoKCk7XG4gICAgbGV0IHBhdGhUb0NvbXBpbGF0aW9uRGF0YWJhc2UgPSBidWlsZFJlcG9ydFsncmVzdWx0cyddW2J1aWxkVGFyZ2V0XVsnb3V0cHV0J107XG4gICAgcGF0aFRvQ29tcGlsYXRpb25EYXRhYmFzZSA9IHBhdGguam9pbihcbiAgICAgICAgYnVja1Byb2plY3RSb290LFxuICAgICAgICBwYXRoVG9Db21waWxhdGlvbkRhdGFiYXNlKTtcblxuICAgIGNvbnN0IGNvbXBpbGF0aW9uRGF0YWJhc2VKc29uQnVmZmVyID0gYXdhaXQgZnNQcm9taXNlLnJlYWRGaWxlKHBhdGhUb0NvbXBpbGF0aW9uRGF0YWJhc2UpO1xuICAgIGNvbnN0IGNvbXBpbGF0aW9uRGF0YWJhc2VKc29uID0gY29tcGlsYXRpb25EYXRhYmFzZUpzb25CdWZmZXIudG9TdHJpbmcoJ3V0ZjgnKTtcbiAgICBjb25zdCBjb21waWxhdGlvbkRhdGFiYXNlID0gSlNPTi5wYXJzZShjb21waWxhdGlvbkRhdGFiYXNlSnNvbik7XG4gICAgY29tcGlsYXRpb25EYXRhYmFzZS5mb3JFYWNoKGl0ZW0gPT4ge1xuICAgICAgY29uc3Qge2ZpbGV9ID0gaXRlbTtcbiAgICAgIHRoaXMucGF0aFRvRmxhZ3NbZmlsZV0gPSBDbGFuZ0ZsYWdzTWFuYWdlci5zYW5pdGl6ZUNvbW1hbmQoXG4gICAgICAgICAgZmlsZSxcbiAgICAgICAgICBpdGVtLmFyZ3VtZW50cyxcbiAgICAgICAgICBidWNrUHJvamVjdFJvb3QpO1xuICAgIH0pO1xuICB9XG5cbiAgc3RhdGljIHBhcnNlQXJndW1lbnRzRnJvbUNvbW1hbmQoY29tbWFuZDogc3RyaW5nKTogQXJyYXk8c3RyaW5nPiB7XG4gICAgY29uc3QgcmVzdWx0ID0gW107XG4gICAgLy8gc2hlbGwtcXVvdGUgcmV0dXJucyBvYmplY3RzIGZvciB0aGluZ3MgbGlrZSBwaXBlcy5cbiAgICAvLyBUaGlzIHNob3VsZCBuZXZlciBoYXBwZW4gd2l0aCBwcm9wZXIgZmxhZ3MsIGJ1dCBpZ25vcmUgdGhlbSB0byBiZSBzYWZlLlxuICAgIGZvciAoY29uc3QgYXJnIG9mIHBhcnNlKGNvbW1hbmQpKSB7XG4gICAgICBpZiAodHlwZW9mIGFyZyAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICByZXN1bHQucHVzaChhcmcpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgc3RhdGljIHNhbml0aXplQ29tbWFuZChcbiAgICBzb3VyY2VGaWxlOiBzdHJpbmcsXG4gICAgYXJnczogQXJyYXk8c3RyaW5nPixcbiAgICBiYXNlUGF0aDogc3RyaW5nXG4gICk6IEFycmF5PHN0cmluZz4ge1xuICAgIC8vIEZvciBzYWZldHksIGNyZWF0ZSBhIG5ldyBjb3B5IG9mIHRoZSBhcnJheS4gV2UgZXhjbHVkZSB0aGUgcGF0aCB0byB0aGUgZmlsZSB0byBjb21waWxlIGZyb21cbiAgICAvLyBjb21waWxhdGlvbiBkYXRhYmFzZSBnZW5lcmF0ZWQgYnkgQnVjay4gSXQgbXVzdCBiZSByZW1vdmVkIGZyb20gdGhlIGxpc3Qgb2YgY29tbWFuZC1saW5lXG4gICAgLy8gYXJndW1lbnRzIHBhc3NlZCB0byBsaWJjbGFuZy5cbiAgICBjb25zdCBub3JtYWxpemVkU291cmNlRmlsZSA9IHBhdGgubm9ybWFsaXplKHNvdXJjZUZpbGUpO1xuICAgIGFyZ3MgPSBhcmdzLmZpbHRlcihhcmcgPT5cbiAgICAgIG5vcm1hbGl6ZWRTb3VyY2VGaWxlICE9PSBhcmcgJiZcbiAgICAgIG5vcm1hbGl6ZWRTb3VyY2VGaWxlICE9PSBwYXRoLnJlc29sdmUoYmFzZVBhdGgsIGFyZylcbiAgICApO1xuXG4gICAgLy8gUmVzb2x2ZSByZWxhdGl2ZSBwYXRoIGFyZ3VtZW50cyBhZ2FpbnN0IHRoZSBCdWNrIHByb2plY3Qgcm9vdC5cbiAgICBhcmdzLmZvckVhY2goKGFyZywgYXJnSW5kZXgpID0+IHtcbiAgICAgIGlmIChDTEFOR19GTEFHU19USEFUX1RBS0VfUEFUSFMuaGFzKGFyZykpIHtcbiAgICAgICAgY29uc3QgbmV4dEluZGV4ID0gYXJnSW5kZXggKyAxO1xuICAgICAgICBsZXQgZmlsZVBhdGggPSBhcmdzW25leHRJbmRleF07XG4gICAgICAgIGlmICghcGF0aC5pc0Fic29sdXRlKGZpbGVQYXRoKSkge1xuICAgICAgICAgIGZpbGVQYXRoID0gcGF0aC5qb2luKGJhc2VQYXRoLCBmaWxlUGF0aCk7XG4gICAgICAgICAgYXJnc1tuZXh0SW5kZXhdID0gZmlsZVBhdGg7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoU0lOR0xFX0xFVFRFUl9DTEFOR19GTEFHU19USEFUX1RBS0VfUEFUSFMuaGFzKGFyZy5zdWJzdHJpbmcoMCwgMikpKSB7XG4gICAgICAgIGxldCBmaWxlUGF0aCA9IGFyZy5zdWJzdHJpbmcoMik7XG4gICAgICAgIGlmICghcGF0aC5pc0Fic29sdXRlKGZpbGVQYXRoKSkge1xuICAgICAgICAgIGZpbGVQYXRoID0gcGF0aC5qb2luKGJhc2VQYXRoLCBmaWxlUGF0aCk7XG4gICAgICAgICAgYXJnc1thcmdJbmRleF0gPSBhcmcuc3Vic3RyaW5nKDAsIDIpICsgZmlsZVBhdGg7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIElmIGFuIG91dHB1dCBmaWxlIGlzIHNwZWNpZmllZCwgcmVtb3ZlIHRoYXQgYXJndW1lbnQuXG4gICAgY29uc3QgaW5kZXggPSBhcmdzLmluZGV4T2YoJy1vJyk7XG4gICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgYXJncy5zcGxpY2UoaW5kZXgsIDIpO1xuICAgIH1cblxuICAgIHJldHVybiBhcmdzO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ2xhbmdGbGFnc01hbmFnZXI7XG4iXX0=