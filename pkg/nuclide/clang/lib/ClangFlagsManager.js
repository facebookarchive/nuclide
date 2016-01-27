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

var _analytics = require('../../analytics');

var _commons = require('../../commons');

var _logging = require('../../logging');

var _buckBaseLibBuckProject = require('../../buck/base/lib/BuckProject');

var logger = (0, _logging.getLogger)();

var COMPILATION_DATABASE_FILE = 'compile_commands.json';

var CLANG_FLAGS_THAT_TAKE_PATHS = new Set(['-F', '-I', '-include', '-iquote', '-isysroot', '-isystem']);

var SINGLE_LETTER_CLANG_FLAGS_THAT_TAKE_PATHS = new Set(_commons.array.from(CLANG_FLAGS_THAT_TAKE_PATHS).filter(function (item) {
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

      var buckProject = new _buckBaseLibBuckProject.BuckProject({ rootPath: buckProjectRoot });
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
    decorators: [(0, _analytics.trackTiming)('nuclide-clang.get-flags')],
    value: _asyncToGenerator(function* (src) {
      // Look for a manually provided compilation database.
      var dbDir = yield _commons.fsPromise.findNearestFile(COMPILATION_DATABASE_FILE, _path2['default'].dirname(src));
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
        var contents = yield _commons.fsPromise.readFile(dbFile);
        var data = JSON.parse(contents);
        (0, _assert2['default'])(data instanceof Array);
        yield Promise.all(data.map(_asyncToGenerator(function* (entry) {
          var command = entry.command;
          var file = entry.file;

          var directory = yield _commons.fsPromise.realpath(entry.directory, _this._realpathCache);
          var args = ClangFlagsManager.parseArgumentsFromCommand(command);
          var filename = _path2['default'].resolve(directory, file);
          if (yield _commons.fsPromise.exists(filename)) {
            var realpath = yield _commons.fsPromise.realpath(filename, _this._realpathCache);
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

      var compilationDatabaseJsonBuffer = yield _commons.fsPromise.readFile(pathToCompilationDatabase);
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
//# sourceMappingURL=data:application/json;base64,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TyxJQUFJLENBQUM7S0FDYjs7O1NBek9HLGlCQUFpQjs7O0FBNE92QixNQUFNLENBQUMsT0FBTyxHQUFHLGlCQUFpQixDQUFDIiwiZmlsZSI6IkNsYW5nRmxhZ3NNYW5hZ2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0J1Y2tVdGlsc30gZnJvbSAnLi4vLi4vYnVjay9iYXNlL2xpYi9CdWNrVXRpbHMnO1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7cGFyc2V9IGZyb20gJ3NoZWxsLXF1b3RlJztcbmltcG9ydCB7dHJhY2tUaW1pbmd9IGZyb20gJy4uLy4uL2FuYWx5dGljcyc7XG5pbXBvcnQge2FycmF5LCBmc1Byb21pc2V9IGZyb20gJy4uLy4uL2NvbW1vbnMnO1xuaW1wb3J0IHtnZXRMb2dnZXJ9IGZyb20gJy4uLy4uL2xvZ2dpbmcnO1xuaW1wb3J0IHtCdWNrUHJvamVjdH0gZnJvbSAnLi4vLi4vYnVjay9iYXNlL2xpYi9CdWNrUHJvamVjdCc7XG5cbmNvbnN0IGxvZ2dlciA9IGdldExvZ2dlcigpO1xuXG5jb25zdCBDT01QSUxBVElPTl9EQVRBQkFTRV9GSUxFID0gJ2NvbXBpbGVfY29tbWFuZHMuanNvbic7XG5cbmNvbnN0IENMQU5HX0ZMQUdTX1RIQVRfVEFLRV9QQVRIUyA9IG5ldyBTZXQoW1xuICAnLUYnLFxuICAnLUknLFxuICAnLWluY2x1ZGUnLFxuICAnLWlxdW90ZScsXG4gICctaXN5c3Jvb3QnLFxuICAnLWlzeXN0ZW0nLFxuXSk7XG5cbmNvbnN0IFNJTkdMRV9MRVRURVJfQ0xBTkdfRkxBR1NfVEhBVF9UQUtFX1BBVEhTID0gbmV3IFNldChcbiAgYXJyYXkuZnJvbShDTEFOR19GTEFHU19USEFUX1RBS0VfUEFUSFMpXG4gICAgLmZpbHRlcihpdGVtID0+IGl0ZW0ubGVuZ3RoID09PSAyKVxuKTtcblxuY2xhc3MgQ2xhbmdGbGFnc01hbmFnZXIge1xuICBfYnVja1V0aWxzOiBCdWNrVXRpbHM7XG4gIF9jYWNoZWRCdWNrUHJvamVjdHM6IE1hcDxzdHJpbmcsIEJ1Y2tQcm9qZWN0PjtcbiAgX2NvbXBpbGF0aW9uRGF0YWJhc2VzOiBTZXQ8c3RyaW5nPjtcbiAgX3JlYWxwYXRoQ2FjaGU6IE9iamVjdDtcbiAgcGF0aFRvRmxhZ3M6IHtbcGF0aDogc3RyaW5nXTogP0FycmF5PHN0cmluZz59O1xuXG4gIGNvbnN0cnVjdG9yKGJ1Y2tVdGlsczogQnVja1V0aWxzKSB7XG4gICAgLyoqXG4gICAgICogS2V5cyBhcmUgYWJzb2x1dGUgcGF0aHMuIFZhbHVlcyBhcmUgc3BhY2UtZGVsaW1pdGVkIHN0cmluZ3Mgb2YgZmxhZ3MuXG4gICAgICovXG4gICAgdGhpcy5wYXRoVG9GbGFncyA9IHt9O1xuICAgIHRoaXMuX2J1Y2tVdGlscyA9IGJ1Y2tVdGlscztcbiAgICB0aGlzLl9jYWNoZWRCdWNrUHJvamVjdHMgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5fY29tcGlsYXRpb25EYXRhYmFzZXMgPSBuZXcgU2V0KCk7XG4gICAgdGhpcy5fcmVhbHBhdGhDYWNoZSA9IHt9O1xuICB9XG5cbiAgcmVzZXQoKSB7XG4gICAgdGhpcy5wYXRoVG9GbGFncyA9IHt9O1xuICAgIHRoaXMuX2NhY2hlZEJ1Y2tQcm9qZWN0cy5jbGVhcigpO1xuICAgIHRoaXMuX2NvbXBpbGF0aW9uRGF0YWJhc2VzLmNsZWFyKCk7XG4gICAgdGhpcy5fcmVhbHBhdGhDYWNoZSA9IHt9O1xuICB9XG5cbiAgYXN5bmMgX2dldEJ1Y2tQcm9qZWN0KHNyYzogc3RyaW5nKTogUHJvbWlzZTw/QnVja1Byb2plY3Q+IHtcbiAgICAvLyBGb3Igbm93LCBpZiBhIHVzZXIgcmVxdWVzdHMgdGhlIGZsYWdzIGZvciBhIHBhdGggb3V0c2lkZSBvZiBhIEJ1Y2sgcHJvamVjdCxcbiAgICAvLyBzdWNoIGFzIC9BcHBsaWNhdGlvbnMvWGNvZGUuYXBwL0NvbnRlbnRzL0RldmVsb3Blci9QbGF0Zm9ybXMvLi4uLCB0aGVuXG4gICAgLy8gcmV0dXJuIG51bGwuIEdvaW5nIGZvcndhcmQsIHdlIHByb2JhYmx5IHdhbnQgdG8gc3BlY2lhbC1jYXNlIHNvbWUgb2YgdGhlXG4gICAgLy8gcGF0aHMgdW5kZXIgL0FwcGxpY2F0aW9ucy9YY29kZS5hcHAgc28gdGhhdCBjbGljay10by1zeW1ib2wgd29ya3MgaW5cbiAgICAvLyBmaWxlcyBsaWtlIEZyYW1ld29ya3MvVUlLaXQuZnJhbWV3b3JrL0hlYWRlcnMvVUlJbWFnZS5oLlxuICAgIGNvbnN0IGJ1Y2tQcm9qZWN0Um9vdCA9IGF3YWl0IHRoaXMuX2J1Y2tVdGlscy5nZXRCdWNrUHJvamVjdFJvb3Qoc3JjKTtcbiAgICBpZiAoYnVja1Byb2plY3RSb290ID09IG51bGwpIHtcbiAgICAgIGxvZ2dlci5pbmZvKFxuICAgICAgICAgICdEaWQgbm90IHRyeSB0byBhdHRlbXB0IHRvIGdldCBmbGFncyBmcm9tIEJ1Y2sgYmVjYXVzZSAnICtcbiAgICAgICAgICAnc291cmNlIGZpbGUgJXMgZG9lcyBub3QgYXBwZWFyIHRvIGJlIHBhcnQgb2YgYSBCdWNrIHByb2plY3QuJyxcbiAgICAgICAgICBzcmMpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2NhY2hlZEJ1Y2tQcm9qZWN0cy5oYXMoYnVja1Byb2plY3RSb290KSkge1xuICAgICAgcmV0dXJuIHRoaXMuX2NhY2hlZEJ1Y2tQcm9qZWN0cy5nZXQoYnVja1Byb2plY3RSb290KTtcbiAgICB9XG5cbiAgICBjb25zdCBidWNrUHJvamVjdCA9IG5ldyBCdWNrUHJvamVjdCh7cm9vdFBhdGg6IGJ1Y2tQcm9qZWN0Um9vdH0pO1xuICAgIHRoaXMuX2NhY2hlZEJ1Y2tQcm9qZWN0cy5zZXQoYnVja1Byb2plY3RSb290LCBidWNrUHJvamVjdCk7XG4gICAgcmV0dXJuIGJ1Y2tQcm9qZWN0O1xuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm4gYSBzcGFjZS1kZWxpbWl0ZWQgc3RyaW5nIG9mIGZsYWdzIG9yIG51bGwgaWYgbm90aGluZyBpcyBrbm93blxuICAgKiAgICAgYWJvdXQgdGhlIHNyYyBmaWxlLiBGb3IgZXhhbXBsZSwgbnVsbCB3aWxsIGJlIHJldHVybmVkIGlmIHNyYyBpcyBub3RcbiAgICogICAgIHVuZGVyIHRoZSBwcm9qZWN0IHJvb3QuXG4gICAqL1xuICBhc3luYyBnZXRGbGFnc0ZvclNyYyhzcmM6IHN0cmluZyk6IFByb21pc2U8P0FycmF5PHN0cmluZz4+IHtcbiAgICBsZXQgZmxhZ3MgPSB0aGlzLnBhdGhUb0ZsYWdzW3NyY107XG4gICAgaWYgKGZsYWdzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBmbGFncztcbiAgICB9XG4gICAgZmxhZ3MgPSBhd2FpdCB0aGlzLl9nZXRGbGFnc0ZvclNyY0ltcGwoc3JjKTtcbiAgICB0aGlzLnBhdGhUb0ZsYWdzW3NyY10gPSBmbGFncztcbiAgICByZXR1cm4gZmxhZ3M7XG4gIH1cblxuICBAdHJhY2tUaW1pbmcoJ251Y2xpZGUtY2xhbmcuZ2V0LWZsYWdzJylcbiAgYXN5bmMgX2dldEZsYWdzRm9yU3JjSW1wbChzcmM6IHN0cmluZyk6IFByb21pc2U8P0FycmF5PHN0cmluZz4+IHtcbiAgICAvLyBMb29rIGZvciBhIG1hbnVhbGx5IHByb3ZpZGVkIGNvbXBpbGF0aW9uIGRhdGFiYXNlLlxuICAgIGNvbnN0IGRiRGlyID0gYXdhaXQgZnNQcm9taXNlLmZpbmROZWFyZXN0RmlsZShcbiAgICAgIENPTVBJTEFUSU9OX0RBVEFCQVNFX0ZJTEUsXG4gICAgICBwYXRoLmRpcm5hbWUoc3JjKSxcbiAgICApO1xuICAgIGlmIChkYkRpciAhPSBudWxsKSB7XG4gICAgICBjb25zdCBkYkZpbGUgPSBwYXRoLmpvaW4oZGJEaXIsIENPTVBJTEFUSU9OX0RBVEFCQVNFX0ZJTEUpO1xuICAgICAgYXdhaXQgdGhpcy5fbG9hZEZsYWdzRnJvbUNvbXBpbGF0aW9uRGF0YWJhc2UoZGJGaWxlKTtcbiAgICAgIGNvbnN0IGZsYWdzID0gdGhpcy5fbG9va3VwRmxhZ3NGb3JTcmMoc3JjKTtcbiAgICAgIGlmIChmbGFncyAhPSBudWxsKSB7XG4gICAgICAgIHJldHVybiBmbGFncztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBhd2FpdCB0aGlzLl9sb2FkRmxhZ3NGcm9tQnVjayhzcmMpO1xuICAgIHJldHVybiB0aGlzLl9sb29rdXBGbGFnc0ZvclNyYyhzcmMpO1xuICB9XG5cbiAgX2xvb2t1cEZsYWdzRm9yU3JjKHNyYzogc3RyaW5nKTogP0FycmF5PHN0cmluZz4ge1xuICAgIGNvbnN0IGZsYWdzID0gdGhpcy5wYXRoVG9GbGFnc1tzcmNdO1xuICAgIGlmIChmbGFncyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZmxhZ3M7XG4gICAgfVxuXG4gICAgLy8gSGVhZGVyIGZpbGVzIHR5cGljYWxseSBkb24ndCBoYXZlIGVudHJpZXMgaW4gdGhlIGNvbXBpbGF0aW9uIGRhdGFiYXNlLlxuICAgIC8vIEFzIGEgc2ltcGxlIGhldXJpc3RpYywgbG9vayBmb3Igb3RoZXIgZmlsZXMgd2l0aCB0aGUgc2FtZSBleHRlbnNpb24uXG4gICAgY29uc3QgZXh0ID0gc3JjLmxhc3RJbmRleE9mKCcuJyk7XG4gICAgaWYgKGV4dCAhPT0gLTEpIHtcbiAgICAgIGNvbnN0IGV4dExlc3MgPSBzcmMuc3Vic3RyaW5nKDAsIGV4dCArIDEpO1xuICAgICAgZm9yIChjb25zdCBmaWxlIGluIHRoaXMucGF0aFRvRmxhZ3MpIHtcbiAgICAgICAgaWYgKGZpbGUuc3RhcnRzV2l0aChleHRMZXNzKSkge1xuICAgICAgICAgIHJldHVybiB0aGlzLnBhdGhUb0ZsYWdzW2ZpbGVdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgYXN5bmMgX2xvYWRGbGFnc0Zyb21Db21waWxhdGlvbkRhdGFiYXNlKGRiRmlsZTogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKHRoaXMuX2NvbXBpbGF0aW9uRGF0YWJhc2VzLmhhcyhkYkZpbGUpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGNvbnRlbnRzID0gYXdhaXQgZnNQcm9taXNlLnJlYWRGaWxlKGRiRmlsZSk7XG4gICAgICBjb25zdCBkYXRhID0gSlNPTi5wYXJzZShjb250ZW50cyk7XG4gICAgICBpbnZhcmlhbnQoZGF0YSBpbnN0YW5jZW9mIEFycmF5KTtcbiAgICAgIGF3YWl0IFByb21pc2UuYWxsKGRhdGEubWFwKGFzeW5jIGVudHJ5ID0+IHtcbiAgICAgICAgY29uc3Qge2NvbW1hbmQsIGZpbGV9ID0gZW50cnk7XG4gICAgICAgIGNvbnN0IGRpcmVjdG9yeSA9IGF3YWl0IGZzUHJvbWlzZS5yZWFscGF0aChlbnRyeS5kaXJlY3RvcnksIHRoaXMuX3JlYWxwYXRoQ2FjaGUpO1xuICAgICAgICBjb25zdCBhcmdzID0gQ2xhbmdGbGFnc01hbmFnZXIucGFyc2VBcmd1bWVudHNGcm9tQ29tbWFuZChjb21tYW5kKTtcbiAgICAgICAgY29uc3QgZmlsZW5hbWUgPSBwYXRoLnJlc29sdmUoZGlyZWN0b3J5LCBmaWxlKTtcbiAgICAgICAgaWYgKGF3YWl0IGZzUHJvbWlzZS5leGlzdHMoZmlsZW5hbWUpKSB7XG4gICAgICAgICAgY29uc3QgcmVhbHBhdGggPSBhd2FpdCBmc1Byb21pc2UucmVhbHBhdGgoZmlsZW5hbWUsIHRoaXMuX3JlYWxwYXRoQ2FjaGUpO1xuICAgICAgICAgIHRoaXMucGF0aFRvRmxhZ3NbcmVhbHBhdGhdID0gQ2xhbmdGbGFnc01hbmFnZXIuc2FuaXRpemVDb21tYW5kKGZpbGUsIGFyZ3MsIGRpcmVjdG9yeSk7XG4gICAgICAgIH1cbiAgICAgIH0pKTtcbiAgICAgIHRoaXMuX2NvbXBpbGF0aW9uRGF0YWJhc2VzLmFkZChkYkZpbGUpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGxvZ2dlci5lcnJvcihgRXJyb3IgcmVhZGluZyBjb21waWxhdGlvbiBmbGFncyBmcm9tICR7ZGJGaWxlfWAsIGUpO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIF9sb2FkRmxhZ3NGcm9tQnVjayhzcmM6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGJ1Y2tQcm9qZWN0ID0gYXdhaXQgdGhpcy5fZ2V0QnVja1Byb2plY3Qoc3JjKTtcbiAgICBpZiAoIWJ1Y2tQcm9qZWN0KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgdGFyZ2V0cyA9IGF3YWl0IGJ1Y2tQcm9qZWN0LmdldE93bmVyKHNyYyk7XG4gICAgaWYgKHRhcmdldHMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gVE9ETyhtYm9saW4pOiBUaGUgYXJjaGl0ZWN0dXJlIHNob3VsZCBiZSBjaG9zZW4gZnJvbSBhIGRyb3Bkb3duIG1lbnUgbGlrZVxuICAgIC8vIGl0IGlzIGluIFhjb2RlIHJhdGhlciB0aGFuIGhhcmRjb2RpbmcgdGhpbmdzIHRvIGlwaG9uZXNpbXVsYXRvci14ODZfNjQuXG4gICAgbGV0IGFyY2g7XG4gICAgaWYgKHByb2Nlc3MucGxhdGZvcm0gPT09ICdkYXJ3aW4nKSB7XG4gICAgICBhcmNoID0gJ2lwaG9uZXNpbXVsYXRvci14ODZfNjQnO1xuICAgIH0gZWxzZSB7XG4gICAgICBhcmNoID0gJ2RlZmF1bHQnO1xuICAgIH1cbiAgICAvLyBUT0RPKG1ib2xpbik6IE5lZWQgbG9naWMgdG8gbWFrZSBzdXJlIHJlc3VsdHMgYXJlIHJlc3RyaWN0ZWQgdG9cbiAgICAvLyBhcHBsZV9saWJyYXJ5IG9yIGFwcGxlX2JpbmFyeSBydWxlcy4gSW4gcHJhY3RpY2UsIHRoaXMgc2hvdWxkIGJlIE9LIGZvclxuICAgIC8vIG5vdy4gVGhvdWdoIG9uY2Ugd2Ugc3RhcnQgc3VwcG9ydGluZyBvcmRpbmFyeSAuY3BwIGZpbGVzLCB0aGVuIHdlXG4gICAgLy8gbGlrZWx5IG5lZWQgdG8gYmUgZXZlbiBtb3JlIGNhcmVmdWwgYWJvdXQgY2hvb3NpbmcgdGhlIGFyY2hpdGVjdHVyZVxuICAgIC8vIGZsYXZvci5cbiAgICBjb25zdCBidWlsZFRhcmdldCA9IHRhcmdldHNbMF0gKyAnI2NvbXBpbGF0aW9uLWRhdGFiYXNlLCcgKyBhcmNoO1xuXG4gICAgY29uc3QgYnVpbGRSZXBvcnQgPSBhd2FpdCBidWNrUHJvamVjdC5idWlsZChbYnVpbGRUYXJnZXRdKTtcbiAgICBpZiAoIWJ1aWxkUmVwb3J0LnN1Y2Nlc3MpIHtcbiAgICAgIC8vIFRPRE8obWJvbGluKTogRnJlcXVlbnRseSBmYWlsaW5nIGR1ZSB0byAnRGFlbW9uIGlzIGJ1c3knIGVycm9ycy5cbiAgICAgIC8vIFVsdGltYXRlbHksIEJ1Y2sgc2hvdWxkIHF1ZXVlIHRoaW5ncyB1cCwgYnV0IGZvciBub3csIE51Y2xpZGUgc2hvdWxkLlxuICAgICAgY29uc3QgZXJyb3IgPSBgRmFpbGVkIHRvIGJ1aWxkICR7YnVpbGRUYXJnZXR9YDtcbiAgICAgIGxvZ2dlci5lcnJvcihlcnJvcik7XG4gICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG4gICAgY29uc3QgYnVja1Byb2plY3RSb290ID0gYXdhaXQgYnVja1Byb2plY3QuZ2V0UGF0aCgpO1xuICAgIGxldCBwYXRoVG9Db21waWxhdGlvbkRhdGFiYXNlID0gYnVpbGRSZXBvcnRbJ3Jlc3VsdHMnXVtidWlsZFRhcmdldF1bJ291dHB1dCddO1xuICAgIHBhdGhUb0NvbXBpbGF0aW9uRGF0YWJhc2UgPSBwYXRoLmpvaW4oXG4gICAgICAgIGJ1Y2tQcm9qZWN0Um9vdCxcbiAgICAgICAgcGF0aFRvQ29tcGlsYXRpb25EYXRhYmFzZSk7XG5cbiAgICBjb25zdCBjb21waWxhdGlvbkRhdGFiYXNlSnNvbkJ1ZmZlciA9IGF3YWl0IGZzUHJvbWlzZS5yZWFkRmlsZShwYXRoVG9Db21waWxhdGlvbkRhdGFiYXNlKTtcbiAgICBjb25zdCBjb21waWxhdGlvbkRhdGFiYXNlSnNvbiA9IGNvbXBpbGF0aW9uRGF0YWJhc2VKc29uQnVmZmVyLnRvU3RyaW5nKCd1dGY4Jyk7XG4gICAgY29uc3QgY29tcGlsYXRpb25EYXRhYmFzZSA9IEpTT04ucGFyc2UoY29tcGlsYXRpb25EYXRhYmFzZUpzb24pO1xuICAgIGNvbXBpbGF0aW9uRGF0YWJhc2UuZm9yRWFjaCgoaXRlbSkgPT4ge1xuICAgICAgY29uc3Qge2ZpbGV9ID0gaXRlbTtcbiAgICAgIHRoaXMucGF0aFRvRmxhZ3NbZmlsZV0gPSBDbGFuZ0ZsYWdzTWFuYWdlci5zYW5pdGl6ZUNvbW1hbmQoXG4gICAgICAgICAgZmlsZSxcbiAgICAgICAgICBpdGVtLmFyZ3VtZW50cyxcbiAgICAgICAgICBidWNrUHJvamVjdFJvb3QpO1xuICAgIH0pO1xuICB9XG5cbiAgc3RhdGljIHBhcnNlQXJndW1lbnRzRnJvbUNvbW1hbmQoY29tbWFuZDogc3RyaW5nKTogQXJyYXk8c3RyaW5nPiB7XG4gICAgY29uc3QgcmVzdWx0ID0gW107XG4gICAgLy8gc2hlbGwtcXVvdGUgcmV0dXJucyBvYmplY3RzIGZvciB0aGluZ3MgbGlrZSBwaXBlcy5cbiAgICAvLyBUaGlzIHNob3VsZCBuZXZlciBoYXBwZW4gd2l0aCBwcm9wZXIgZmxhZ3MsIGJ1dCBpZ25vcmUgdGhlbSB0byBiZSBzYWZlLlxuICAgIGZvciAoY29uc3QgYXJnIG9mIHBhcnNlKGNvbW1hbmQpKSB7XG4gICAgICBpZiAodHlwZW9mIGFyZyAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICByZXN1bHQucHVzaChhcmcpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgc3RhdGljIHNhbml0aXplQ29tbWFuZChcbiAgICBzb3VyY2VGaWxlOiBzdHJpbmcsXG4gICAgYXJnczogQXJyYXk8c3RyaW5nPixcbiAgICBiYXNlUGF0aDogc3RyaW5nXG4gICk6IEFycmF5PHN0cmluZz4ge1xuICAgIC8vIEZvciBzYWZldHksIGNyZWF0ZSBhIG5ldyBjb3B5IG9mIHRoZSBhcnJheS4gV2UgZXhjbHVkZSB0aGUgcGF0aCB0byB0aGUgZmlsZSB0byBjb21waWxlIGZyb21cbiAgICAvLyBjb21waWxhdGlvbiBkYXRhYmFzZSBnZW5lcmF0ZWQgYnkgQnVjay4gSXQgbXVzdCBiZSByZW1vdmVkIGZyb20gdGhlIGxpc3Qgb2YgY29tbWFuZC1saW5lXG4gICAgLy8gYXJndW1lbnRzIHBhc3NlZCB0byBsaWJjbGFuZy5cbiAgICBjb25zdCBub3JtYWxpemVkU291cmNlRmlsZSA9IHBhdGgubm9ybWFsaXplKHNvdXJjZUZpbGUpO1xuICAgIGFyZ3MgPSBhcmdzLmZpbHRlcigoYXJnKSA9PlxuICAgICAgbm9ybWFsaXplZFNvdXJjZUZpbGUgIT09IGFyZyAmJlxuICAgICAgbm9ybWFsaXplZFNvdXJjZUZpbGUgIT09IHBhdGgucmVzb2x2ZShiYXNlUGF0aCwgYXJnKVxuICAgICk7XG5cbiAgICAvLyBSZXNvbHZlIHJlbGF0aXZlIHBhdGggYXJndW1lbnRzIGFnYWluc3QgdGhlIEJ1Y2sgcHJvamVjdCByb290LlxuICAgIGFyZ3MuZm9yRWFjaCgoYXJnLCBhcmdJbmRleCkgPT4ge1xuICAgICAgaWYgKENMQU5HX0ZMQUdTX1RIQVRfVEFLRV9QQVRIUy5oYXMoYXJnKSkge1xuICAgICAgICBjb25zdCBuZXh0SW5kZXggPSBhcmdJbmRleCArIDE7XG4gICAgICAgIGxldCBmaWxlUGF0aCA9IGFyZ3NbbmV4dEluZGV4XTtcbiAgICAgICAgaWYgKCFwYXRoLmlzQWJzb2x1dGUoZmlsZVBhdGgpKSB7XG4gICAgICAgICAgZmlsZVBhdGggPSBwYXRoLmpvaW4oYmFzZVBhdGgsIGZpbGVQYXRoKTtcbiAgICAgICAgICBhcmdzW25leHRJbmRleF0gPSBmaWxlUGF0aDtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChTSU5HTEVfTEVUVEVSX0NMQU5HX0ZMQUdTX1RIQVRfVEFLRV9QQVRIUy5oYXMoYXJnLnN1YnN0cmluZygwLCAyKSkpIHtcbiAgICAgICAgbGV0IGZpbGVQYXRoID0gYXJnLnN1YnN0cmluZygyKTtcbiAgICAgICAgaWYgKCFwYXRoLmlzQWJzb2x1dGUoZmlsZVBhdGgpKSB7XG4gICAgICAgICAgZmlsZVBhdGggPSBwYXRoLmpvaW4oYmFzZVBhdGgsIGZpbGVQYXRoKTtcbiAgICAgICAgICBhcmdzW2FyZ0luZGV4XSA9IGFyZy5zdWJzdHJpbmcoMCwgMikgKyBmaWxlUGF0aDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gSWYgYW4gb3V0cHV0IGZpbGUgaXMgc3BlY2lmaWVkLCByZW1vdmUgdGhhdCBhcmd1bWVudC5cbiAgICBjb25zdCBpbmRleCA9IGFyZ3MuaW5kZXhPZignLW8nKTtcbiAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICBhcmdzLnNwbGljZShpbmRleCwgMik7XG4gICAgfVxuXG4gICAgcmV0dXJuIGFyZ3M7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBDbGFuZ0ZsYWdzTWFuYWdlcjtcbiJdfQ==