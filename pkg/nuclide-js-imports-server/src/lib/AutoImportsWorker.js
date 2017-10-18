'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let handleFileChange = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (root, fileChange, hasteSettings) {
    if (fileChange.exists) {
      // File created or modified
      const exportForFile = yield addFileToIndex(root, fileChange.name, hasteSettings);
      if (exportForFile) {
        sendExportUpdateToParent([exportForFile]);
      }
    } else {
      // File deleted.
      sendExportUpdateToParent([{
        updateType: 'deleteExports',
        file: (_nuclideUri || _load_nuclideUri()).default.resolve(root, fileChange.name),
        exports: []
      }]);
    }
  });

  return function handleFileChange(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
})();

let listFilesWithWatchman = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* (root) {
    const client = new (_main || _load_main()).WatchmanClient();
    try {
      return yield client.listFiles(root, getWatchmanSubscriptionOptions(root));
    } finally {
      client.dispose();
    }
  });

  return function listFilesWithWatchman(_x4) {
    return _ref2.apply(this, arguments);
  };
})();

let checkIfMain = (() => {
  var _ref3 = (0, _asyncToGenerator.default)(function* (file, readFileSync) {
    let currDir = file;
    while (true) {
      const lastDir = currDir;
      currDir = (_nuclideUri || _load_nuclideUri()).default.dirname(currDir);
      if (lastDir === currDir) {
        // We've reached the root '/'
        return null;
      }
      const cachedMain = mainFilesCache.get(currDir);
      // eslint-disable-next-line eqeqeq
      if (cachedMain === null) {
        // The directory doesn't have a package.json with a main.
        continue;
      }

      if (
      // flowlint-next-line sketchy-null-string:off
      cachedMain && (_nuclideUri || _load_nuclideUri()).default.stripExtension(cachedMain) === (_nuclideUri || _load_nuclideUri()).default.stripExtension(file)) {
        return currDir;
      }
      const packageJson = (_nuclideUri || _load_nuclideUri()).default.resolve(currDir, 'package.json');
      try {
        // Most of the time the file won't exist and the Promise should be rejected
        // quickly, so it's probably more efficient to await in this loop instead of
        // using Promise.all to queue up a promise for each directory in the file path.
        const fileContents = readFileSync ? _fs.default.readFileSync(packageJson, 'utf8') : // eslint-disable-next-line no-await-in-loop
        yield (_fsPromise || _load_fsPromise()).default.readFile(packageJson, 'utf8');

        const mainFile = (_nuclideUri || _load_nuclideUri()).default.resolve(currDir, JSON.parse(fileContents).main || 'index.js');
        mainFilesCache.set(currDir, mainFile);
        const isMainFile = (_nuclideUri || _load_nuclideUri()).default.stripExtension(mainFile) === (_nuclideUri || _load_nuclideUri()).default.stripExtension(file);
        return isMainFile ? currDir : null;
      } catch (error) {
        mainFilesCache.set(currDir, null);
      }
    }
  });

  return function checkIfMain(_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
})();

let getExportsForFile = (() => {
  var _ref4 = (0, _asyncToGenerator.default)(function* (file, fileContents_, hasteSettings) {
    try {
      const fileContents = fileContents_ != null ? fileContents_ : yield (_fsPromise || _load_fsPromise()).default.readFile(file, 'utf8');
      const ast = (0, (_AutoImportsManager || _load_AutoImportsManager()).parseFile)(fileContents);
      if (ast == null) {
        return null;
      }
      const hasteName = (0, (_HasteUtils || _load_HasteUtils()).getHasteName)(file, ast, hasteSettings);
      // TODO(hansonw): Support mixed-mode haste + non-haste imports.
      // For now, if Haste is enabled, we'll only suggest Haste imports.
      if (hasteSettings.isHaste && hasteName == null) {
        return null;
      }
      const exports = (0, (_ExportManager || _load_ExportManager()).getExportsFromAst)(file, ast);
      if (hasteName != null) {
        exports.forEach(function (jsExport) {
          jsExport.hasteName = hasteName;
        });
      }
      return { file, exports, updateType: 'setExports' };
    } catch (err) {
      logger.warn(`Background process encountered error indexing ${file}:\n ${err}`);
      return null;
    }
  });

  return function getExportsForFile(_x7, _x8, _x9) {
    return _ref4.apply(this, arguments);
  };
})();

let handleNodeModule = (() => {
  var _ref6 = (0, _asyncToGenerator.default)(function* (root, packageJsonFile) {
    const file = (_nuclideUri || _load_nuclideUri()).default.join(root, packageJsonFile);
    try {
      const fileContents = yield (_fsPromise || _load_fsPromise()).default.readFile(file, 'utf8');
      const packageJson = JSON.parse(fileContents);
      const entryPoint = require.resolve((_nuclideUri || _load_nuclideUri()).default.join((_nuclideUri || _load_nuclideUri()).default.dirname(file), packageJson.main || ''));
      // TODO(hansonw): How do we handle haste modules inside Node modules?
      // For now we'll just treat them as usual.
      const update = yield getExportsForFile(entryPoint, null, {
        isHaste: false,
        useNameReducers: false,
        nameReducers: [],
        nameReducerBlacklist: [],
        nameReducerWhitelist: []
      });
      return update ? decorateExportUpdateWithMainDirectory(update, (_nuclideUri || _load_nuclideUri()).default.join(root, (_nuclideUri || _load_nuclideUri()).default.dirname(packageJsonFile))) : update;
    } catch (error) {
      // Some modules just can't be required; that's perfectly normal.
      if (error.code !== 'MODULE_NOT_FOUND') {
        logger.debug(`Couldn't index ${file}`, error);
      }
      return null;
    }
  });

  return function handleNodeModule(_x11, _x12) {
    return _ref6.apply(this, arguments);
  };
})();

let sendExportUpdateToParent = (() => {
  var _ref7 = (0, _asyncToGenerator.default)(function* (exportsForFiles) {
    return send(exportsForFiles.filter(function (exportsForFile) {
      return exportsForFile.updateType !== 'setExports' || exportsForFile.exports.length > 0;
    }));
  });

  return function sendExportUpdateToParent(_x13) {
    return _ref7.apply(this, arguments);
  };
})();

let send = (() => {
  var _ref8 = (0, _asyncToGenerator.default)(function* (message) {
    if (typeof process.send === 'function') {
      return new Promise(function (resolve, reject) {
        if (!(typeof process.send === 'function')) {
          throw new Error('Invariant violation: "typeof process.send === \'function\'"');
        }

        return process.send(message, function (err) {
          return err == null ? resolve() : reject(err);
        });
      });
    }
  });

  return function send(_x14) {
    return _ref8.apply(this, arguments);
  };
})();

exports.indexDirectory = indexDirectory;
exports.indexNodeModules = indexNodeModules;

var _os = _interopRequireDefault(require('os'));

var _fs = _interopRequireDefault(require('fs'));

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('nuclide-commons/fsPromise'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _observable;

function _load_observable() {
  return _observable = require('nuclide-commons/observable');
}

var _ExportManager;

function _load_ExportManager() {
  return _ExportManager = require('./ExportManager');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _AutoImportsManager;

function _load_AutoImportsManager() {
  return _AutoImportsManager = require('./AutoImportsManager');
}

var _initializeLogging;

function _load_initializeLogging() {
  return _initializeLogging = require('../../logging/initializeLogging');
}

var _main;

function _load_main() {
  return _main = require('../../../nuclide-watchman-helpers/lib/main');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _getConfig;

function _load_getConfig() {
  return _getConfig = require('../getConfig');
}

var _nice;

function _load_nice() {
  return _nice = require('nuclide-commons/nice');
}

var _HasteUtils;

function _load_HasteUtils() {
  return _HasteUtils = require('./HasteUtils');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// TODO(seansegal) Change 'DEBUG' to 'WARN' when development is complete
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

const logger = (0, (_initializeLogging || _load_initializeLogging()).initializeLoggerForWorker)('DEBUG');

// TODO: index the entry points of node_modules
const TO_IGNORE = ['**/node_modules/**', '**/VendorLib/**', '**/flow-typed/**'];

const CONCURRENCY = 1;

const BATCH_SIZE = 500;

const MIN_FILES_PER_WORKER = 100;

const disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();

// Directory ==> Main File. Null indicates no package.json file.
const mainFilesCache = new Map();

function main() {
  if (process.argv.length > 2 && process.argv[2] === '--child') {
    return runChild();
  }

  setupDisconnectedParentHandler();
  if (process.argv.length !== 3) {
    logger.warn('Incorrect number of arguments');
    return;
  }
  const root = process.argv[2];
  const { hasteSettings } = (0, (_getConfig || _load_getConfig()).getConfigFromFlow)(root);

  // Listen for open files that should be indexed immediately
  setupParentMessagesHandler(hasteSettings);

  // Listen for file changes with Watchman that should update the index.
  watchDirectoryRecursively(root, hasteSettings);

  // Build up the initial index with all files recursively from the root.
  indexDirectoryAndSendExportsToParent(root, hasteSettings);

  indexNodeModulesAndSendToParent(root);
}

// Function should be called once when the server is initialized.
function indexDirectoryAndSendExportsToParent(root, hasteSettings) {
  return new Promise((resolve, reject) => {
    indexDirectory(root, hasteSettings).subscribe({
      next: exportForFile => {
        sendExportUpdateToParent(exportForFile);
      },
      error: err => {
        logger.error('Encountered error in AutoImportsWorker', err);
        return reject(err);
      },
      complete: () => {
        logger.info(`Finished indexing ${root}`);
        return resolve();
      }
    });
  });
}

// Watches a directory for changes and reindexes files as needed.
function watchDirectoryRecursively(root, hasteSettings) {
  logger.debug('Watching the directory', root);
  const watchmanClient = new (_main || _load_main()).WatchmanClient();
  disposables.add(watchmanClient);
  watchmanClient.watchDirectoryRecursive(root, 'js-imports-subscription', getWatchmanSubscriptionOptions(root)).then(watchmanSubscription => {
    disposables.add(watchmanSubscription);
    const watchmanRoot = watchmanSubscription.root;
    _rxjsBundlesRxMinJs.Observable.fromEvent(watchmanSubscription, 'change').switchMap(x => _rxjsBundlesRxMinJs.Observable.from(x)) // convert to Observable<FileChange>
    .mergeMap(fileChange => handleFileChange(watchmanRoot, fileChange, hasteSettings), CONCURRENCY).subscribe(() => {});
  }).catch(error => {
    logger.error(error);
  });
}

function listFilesWithGlob(root) {
  return (_fsPromise || _load_fsPromise()).default.glob('**/*.js', {
    cwd: root,
    ignore: TO_IGNORE
  });
}

function listNodeModulesWithGlob(root) {
  return (_fsPromise || _load_fsPromise()).default.glob('node_modules/*/package.json', {
    cwd: root
  });
}

// Exported for testing purposes.
function indexDirectory(root, hasteSettings, maxWorkers = Math.round(_os.default.cpus().length / 2)) {
  return _rxjsBundlesRxMinJs.Observable.fromPromise(listFilesWithWatchman(root).catch(() => listFilesWithGlob(root))).do(files => {
    logger.info(`Indexing ${files.length} files`);
  }).do(files => {
    // As an optimization, we can send up the Haste reduced name as a default export.
    if (hasteSettings.isHaste && hasteSettings.useNameReducers) {
      logger.debug('Adding Haste default exports');
      addHasteNames(root, files, hasteSettings);
      logger.debug('Sent all Haste default exports');
    }
  }).switchMap(files => {
    // As an optimization, shuffle the files so that the work is well distributed.
    shuffle(files);
    const numWorkers = Math.min(Math.max(1, Math.floor(files.length / MIN_FILES_PER_WORKER)), maxWorkers);
    const filesPerWorker = Math.floor(files.length / numWorkers);
    return _rxjsBundlesRxMinJs.Observable.range(0, numWorkers).mergeMap(workerId => {
      return (0, (_nice || _load_nice()).niceSafeSpawn)(process.execPath, [(_nuclideUri || _load_nuclideUri()).default.join(__dirname, 'AutoImportsWorker-entry.js'), '--child', root], {
        stdio: ['inherit', 'inherit', 'inherit', 'ipc']
      });
    }).mergeMap((worker, workerId) => {
      if (!(typeof workerId === 'number')) {
        throw new Error('Invariant violation: "typeof workerId === \'number\'"');
      } // For Flow


      const updateStream = _rxjsBundlesRxMinJs.Observable.fromEvent(worker, 'message').takeUntil(_rxjsBundlesRxMinJs.Observable.fromEvent(worker, 'error').do(error => {
        logger.debug(`Worker ${workerId} had received ${error}`);
      })).takeUntil(_rxjsBundlesRxMinJs.Observable.fromEvent(worker, 'exit').do(() => {
        logger.debug(`Worker ${workerId} terminated.`);
      }));
      return _rxjsBundlesRxMinJs.Observable.merge(updateStream, _rxjsBundlesRxMinJs.Observable.timer(0).do(() => {
        worker.send({
          files: files.slice(workerId * filesPerWorker, Math.min((workerId + 1) * filesPerWorker, files.length))
        });
      }).ignoreElements());
    });
  });
}

function addFileToIndex(root, fileRelative, hasteSettings) {
  const file = (_nuclideUri || _load_nuclideUri()).default.join(root, fileRelative);
  return Promise.all([getExportsForFile(file, null, hasteSettings), checkIfMain(file)]).then(([data, directoryForMainFile]) => {
    return data ? decorateExportUpdateWithMainDirectory(data, directoryForMainFile) : null;
  });
}

function getWatchmanSubscriptionOptions(root) {
  return {
    expression: ['allof', ['match', '*.js'], ...getWatchmanMatchesFromIgnoredFiles()]
  };
}

function setupDisconnectedParentHandler() {
  process.on('disconnect', () => {
    logger.debug('Parent process disconnected. AutoImportsWorker terminating.');
    exitCleanly();
  });
}

function setupParentMessagesHandler(hasteSettings) {
  process.on('message', (() => {
    var _ref5 = (0, _asyncToGenerator.default)(function* (message) {
      const { fileUri, fileContents } = message;
      if (fileUri == null || fileContents == null) {
        logger.warn('AutoImportsWorker received a message from parent without a fileUri or fileContents');
        return;
      }
      try {
        const exportUpdate = yield getExportsForFile(fileUri, fileContents, hasteSettings);
        if (exportUpdate != null) {
          sendExportUpdateToParent([exportUpdate]);
        }
      } catch (error) {
        logger.error(`Could not index file ${fileUri}. Error: ${error}`);
      }
    });

    return function (_x10) {
      return _ref5.apply(this, arguments);
    };
  })());
}

function addHasteNames(root, files, hasteSettings) {
  sendExportUpdateToParent(files.map(file => {
    const hasteName = (0, (_HasteUtils || _load_HasteUtils()).hasteReduceName)(file, hasteSettings);
    if (hasteName == null) {
      return null;
    }
    return {
      file,
      updateType: 'setExports',
      exports: [{
        id: (0, (_ExportManager || _load_ExportManager()).idFromFileName)(hasteName),
        uri: (_nuclideUri || _load_nuclideUri()).default.join(root, file),
        hasteName,
        isTypeExport: false,
        isDefault: true
      }]
    };
  }).filter(Boolean));
}
function indexNodeModulesAndSendToParent(root) {
  return new Promise((resolve, reject) => {
    logger.info('Indexing node modules.');
    indexNodeModules(root).subscribe({
      next: exportForFile => {
        if (exportForFile) {
          sendExportUpdateToParent([exportForFile]);
        }
      },
      error: err => {
        logger.error('Encountered error in AutoImportsWorker', err);
        return reject(err);
      },
      complete: () => {
        logger.debug(`Finished node modules for ${root}`);
        return resolve();
      }
    });
  });
}

function indexNodeModules(root) {
  return _rxjsBundlesRxMinJs.Observable.fromPromise(
  // TODO: Use Watchman for better performance.
  listNodeModulesWithGlob(root)).switchMap(x => _rxjsBundlesRxMinJs.Observable.from(x)) // convert to Observable<string>
  .mergeMap(file => handleNodeModule(root, file), CONCURRENCY);
}

function decorateExportUpdateWithMainDirectory(update, directoryForMainFile) {
  // flowlint-next-line sketchy-null-string:off
  if (directoryForMainFile) {
    update.exports = update.exports.map(exp => {
      return Object.assign({}, exp, { directoryForMainFile });
    });
  }
  return update;
}

function getWatchmanMatchesFromIgnoredFiles() {
  return TO_IGNORE.map(patternToIgnore => {
    return ['not', ['match', patternToIgnore, 'wholename', { includedotfiles: true }]];
  });
}

function runChild() {
  const SEND_CONCURRENCY = 10;

  setupDisconnectedParentHandler();
  if (process.argv.length !== 4) {
    logger.debug('Child started with incorrect number of arguments');
    return;
  }
  const root = process.argv[3];
  const { hasteSettings } = (0, (_getConfig || _load_getConfig()).getConfigFromFlow)(root);
  process.on('message', message => {
    const { files } = message;
    _rxjsBundlesRxMinJs.Observable.from(files).concatMap((file, index) => {
      return addFileToIndex(root, file, hasteSettings);
    }).let((_observable || _load_observable()).compact).filter(
    // Optimization: we already added default exports for all name-reduced Haste modules.
    exportForFile => !isDefaultExportHasteName(exportForFile.exports)).bufferCount(BATCH_SIZE).mergeMap(sendExportUpdateToParent, SEND_CONCURRENCY).subscribe({ complete: exitCleanly });
  });
}

function isDefaultExportHasteName(exportsForFile) {
  if (exportsForFile.length !== 1) {
    return false;
  }
  const { hasteName, id, isDefault, isTypeExport } = exportsForFile[0];
  return id === hasteName && isDefault && !isTypeExport;
}

function shuffle(array) {
  for (let i = array.length; i; i--) {
    const j = Math.floor(Math.random() * i);
    const temp = array[i - 1];
    array[i - 1] = array[j];
    array[j] = temp;
  }
}

function exitCleanly() {
  disposables.dispose();
  process.exit(0);
}

main();