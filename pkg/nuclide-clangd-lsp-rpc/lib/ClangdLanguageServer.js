'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('nuclide-commons/fsPromise'));
}

var _os = _interopRequireDefault(require('os'));

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _nuclideLanguageServiceRpc;

function _load_nuclideLanguageServiceRpc() {
  return _nuclideLanguageServiceRpc = require('../../nuclide-language-service-rpc');
}

var _nuclideOpenFilesRpc;

function _load_nuclideOpenFilesRpc() {
  return _nuclideOpenFilesRpc = require('../../nuclide-open-files-rpc');
}

var _cache;

function _load_cache() {
  return _cache = require('nuclide-commons/cache');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _LspLanguageService;

function _load_LspLanguageService() {
  return _LspLanguageService = require('../../nuclide-vscode-language-service-rpc/lib/LspLanguageService');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
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

function disposeManagedRoot(managedRoot) {
  if (!managedRoot) {
    return;
  }
  const { tempCommandsDir } = managedRoot;
  if (tempCommandsDir != null) {
    (_fsPromise || _load_fsPromise()).default.rimraf(tempCommandsDir);
  }
}

class ClangdLanguageServer extends (_nuclideLanguageServiceRpc || _load_nuclideLanguageServiceRpc()).MultiProjectLanguageService {
  constructor(languageId, command, logger, fileCache, host) {
    // Access class scope within closure.
    let clangdServiceFactory = (() => {
      var _ref = (0, _asyncToGenerator.default)(function* (compileCommandsPath) {
        const managedRoot = yield server._managedRoots.get(compileCommandsPath);
        // Only proceed if we added the compile commands via addClangRequest
        if (!managedRoot) {
          return null;
        }
        const { rootDir, tempCommandsDir } = managedRoot;
        const args = ['-enable-snippets'];
        if (tempCommandsDir != null) {
          args.push('-compile-commands-dir', tempCommandsDir);
        }
        yield server.hasObservedDiagnostics();
        const lsp = new (_LspLanguageService || _load_LspLanguageService()).LspLanguageService(logger, fileCache, (yield (0, (_nuclideLanguageServiceRpc || _load_nuclideLanguageServiceRpc()).forkHostServices)(host, logger)), languageId, command, args, {}, // spawnOptions
        rootDir, ['.cpp', '.h', '.hpp'], {}, 5 * 60 * 1000);

        lsp.start(); // Kick off 'Initializing'...
        return lsp;
      });

      return function clangdServiceFactory(_x) {
        return _ref.apply(this, arguments);
      };
    })();

    super();

    this._resources = new (_UniversalDisposable || _load_UniversalDisposable()).default();

    const server = this;

    this._processes = new (_cache || _load_cache()).Cache(clangdServiceFactory, value => {
      value.then(service => {
        if (service != null) {
          service.dispose();
        }
      });
    });

    this._managedRoots = new Map();

    this._resources.add(host, this._processes);

    this._resources.add(() => {
      this._closeProcesses();
    }, () => {
      // Delete temporary directories.
      for (const managedRoot of this._managedRoots.values()) {
        managedRoot.then(disposeManagedRoot);
      }
    });
    // Remove fileCache when the remote connection shuts down
    this._resources.add(fileCache.observeFileEvents().filter(event => event.kind === 'save').switchMap(({ fileVersion: { filePath } }) => _rxjsBundlesRxMinJs.Observable.fromPromise(Promise.all(Array.from(this._managedRoots.entries()).map(([key, valPromise]) => valPromise.then(value => ({ key, value })))).then(entries =>
    // Keep only the roots that are watching the saved file.
    entries.filter(({ value }) => value.watchFile === filePath).map(({ key }) => key)))).subscribe(keys => {
      for (const key of keys) {
        this._logger.info('Watch file saved, invalidating ' + key);
        this._processes.delete(key);
        this._managedRoots.delete(key);
        const managedRoot = this._managedRoots.get(key);
        if (managedRoot) {
          managedRoot.then(disposeManagedRoot);
        }
      }
    }, undefined, // error
    () => {
      this._logger.info('fileCache shutting down.');
      this._closeProcesses();
    }));
  }
  // Maps clang settings => settings metadata with same key as _processes field.


  _setupManagedRoot(file, flagsFile) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const rootDir = (_nuclideUri || _load_nuclideUri()).default.dirname(flagsFile);
      // See https://clang.llvm.org/docs/JSONCompilationDatabase.html for spec
      // Add the files of this database to the managed map.
      const contents = yield (_fsPromise || _load_fsPromise()).default.readFile(file);
      // Create a temporary directory with only compile_commands.json because
      // clangd requires the name of a directory containing a
      // compile_commands.json, which is not always what we are provided here.
      const tmpDir = (_nuclideUri || _load_nuclideUri()).default.join(_os.default.tmpdir(), 'nuclide-clangd-lsp-' + Math.random().toString());
      if (!(yield (_fsPromise || _load_fsPromise()).default.mkdirp(tmpDir))) {
        throw new Error(`Failed to create temporary directory at ${tmpDir}`);
      }
      const tmpCommandsPath = (_nuclideUri || _load_nuclideUri()).default.join(tmpDir, COMPILATION_DATABASE_FILE);
      yield (_fsPromise || _load_fsPromise()).default.writeFile(tmpCommandsPath, contents);
      _this._logger.info('Copied commands from ' + file + ' to ' + tmpCommandsPath);
      // Trigger the factory to construct the server.
      _this._processes.get(file);
      return {
        rootDir,
        watchFile: flagsFile,
        files: new Set(JSON.parse(contents.toString()).map(function (entry) {
          return entry.file;
        })),
        tempCommandsDir: tmpDir
      };
    })();
  }

  addClangRequest(clangRequest) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      // Start new server for compile commands path and add to managed list.
      // Return whether successful.
      const database = clangRequest.compilationDatabase;
      if (!database) {
        return false;
      }
      // file = compile commands, flags file = build target
      const { file, flagsFile } = database;
      if (file == null || flagsFile == null) {
        return false;
      }
      if (!_this2._managedRoots.has(file)) {
        _this2._managedRoots.set(file, _this2._setupManagedRoot(file, flagsFile));
      }
      return true;
    })();
  }

  isFileKnown(filePath) {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      // TODO pelmers: header files are always false here, but we could borrow
      // ClangFlagsManager._findSourceFileForHeaderFromCompilationDatabase
      return _this3.getClangRequestSettingsForFile(filePath) != null;
    })();
  }

  getClangRequestSettingsForFile(filePath) {
    var _this4 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const absPath = (_nuclideUri || _load_nuclideUri()).default.getPath(filePath);
      _this4._logger.info('checking for ' + absPath);
      const resolvedRoots = yield Promise.all(Array.from(_this4._managedRoots.entries()).map(function ([k, vPromise]) {
        return vPromise.then(function (v) {
          return [k, v];
        });
      }));
      for (const [commandsPath, managedRoot] of resolvedRoots) {
        if (managedRoot.files.has(absPath)) {
          return commandsPath;
        }
      }
      // Search up through file tree for manually provided compile_commands.json
      // Similar to ClangFlagsManager._getDBFlagsAndDirForSrc
      const dbDir = yield (_fsPromise || _load_fsPromise()).default.findNearestFile(COMPILATION_DATABASE_FILE, (_nuclideUri || _load_nuclideUri()).default.dirname(filePath));
      if (dbDir != null) {
        const dbFile = (_nuclideUri || _load_nuclideUri()).default.join(dbDir, COMPILATION_DATABASE_FILE);
        const compilationDatabase = {
          file: dbFile,
          flagsFile: dbFile,
          libclangPath: null
        };
        if (yield _this4.addClangRequest({ projectRoot: dbDir, compilationDatabase })) {
          return dbFile;
        }
      }

      return null;
    })();
  }

  getLanguageServiceForFile(filePath) {
    var _this5 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const commandsPath = yield _this5.getClangRequestSettingsForFile(filePath);
      if (commandsPath != null) {
        _this5._logger.info('Found existing service for ' + filePath);
        _this5._logger.info('Key: ' + commandsPath);
        const result = _this5._processes.get(commandsPath);
        if (result == null) {
          // Delete so we retry next time.
          _this5._processes.delete(commandsPath);
        }
        return result;
      }
      _this5._logger.info(' if path is reasonable then i should have created server for it already?');
      return null;
    })();
  }
}
exports.default = ClangdLanguageServer;