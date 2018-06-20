'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _memoize2;

function _load_memoize() {
  return _memoize2 = _interopRequireDefault(require('lodash/memoize'));
}

exports.indexDirectory = indexDirectory;
exports.getExportsForFile = getExportsForFile;
exports.indexNodeModules = indexNodeModules;

var _crypto = _interopRequireDefault(require('crypto'));

var _log4js;

function _load_log4js() {
  return _log4js = _interopRequireDefault(require('log4js'));
}

var _os = _interopRequireDefault(require('os'));

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('../../../../modules/nuclide-commons/fsPromise'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../../modules/nuclide-commons/nuclideUri'));
}

var _observable;

function _load_observable() {
  return _observable = require('../../../../modules/nuclide-commons/observable');
}

var _ExportCache;

function _load_ExportCache() {
  return _ExportCache = _interopRequireDefault(require('./ExportCache'));
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

var _Config;

function _load_Config() {
  return _Config = require('../Config');
}

var _nice;

function _load_nice() {
  return _nice = require('../../../../modules/nuclide-commons/nice');
}

var _HasteUtils;

function _load_HasteUtils() {
  return _HasteUtils = require('./HasteUtils');
}

var _fileIndex;

function _load_fileIndex() {
  return _fileIndex = require('./file-index');
}

var _nuclideUiComponentToolsCommon;

function _load_nuclideUiComponentToolsCommon() {
  return _nuclideUiComponentToolsCommon = require('../../../nuclide-ui-component-tools-common');
}

var _passesGK;

function _load_passesGK() {
  return _passesGK = _interopRequireDefault(require('../../../commons-node/passesGK'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, (_initializeLogging || _load_initializeLogging()).initializeLoggerForWorker)(); /**
                                                                                     * Copyright (c) 2015-present, Facebook, Inc.
                                                                                     * All rights reserved.
                                                                                     *
                                                                                     * This source code is licensed under the license found in the LICENSE file in
                                                                                     * the root directory of this source tree.
                                                                                     *
                                                                                     * 
                                                                                     * @format
                                                                                     */

const logger = (_log4js || _load_log4js()).default.getLogger('js-imports-worker');

const CONCURRENCY = 1;

// A bug in Node <= 7.4.0 makes IPC communication O(N^2).
// For this reason, it's very important to send updates in smaller batches.
const BATCH_SIZE = 500;

const cpus = _os.default.cpus();
const MAX_WORKERS = cpus ? Math.max(1, Math.round(cpus.length / 2)) : 1;
const MIN_FILES_PER_WORKER = 100;

async function main() {
  if (process.argv.length > 2 && process.argv[2] === '--child') {
    return runChild();
  }

  setupDisconnectedParentHandler();
  if (process.argv.length !== 3) {
    logger.warn('Incorrect number of arguments');
    return;
  }
  const root = process.argv[2];
  const configFromFlow = (0, (_Config || _load_Config()).getConfigFromFlow)(root);
  const { hasteSettings } = configFromFlow;

  // Listen for open files that should be indexed immediately
  setupParentMessagesHandler(root, hasteSettings);

  // Listen for file changes with Watchman that should update the index.
  watchDirectoryRecursively(root, hasteSettings);

  // Build up the initial index with all files recursively from the root.
  const index = await (0, (_fileIndex || _load_fileIndex()).getFileIndex)(root, configFromFlow);
  const newCache = new (_ExportCache || _load_ExportCache()).default({ root, configFromFlow });

  _rxjsBundlesRxMinJs.Observable.merge(indexDirectory(index, hasteSettings), indexNodeModules(index)).subscribe(message => {
    sendUpdatesBatched(message);
    message.forEach(update => {
      if (update.sha1 != null) {
        const key = { filePath: update.file, sha1: update.sha1 };
        const value = { exports: update.exports };
        if (update.componentDefinition != null) {
          newCache.set(key, Object.assign({}, value, {
            componentDefinition: update.componentDefinition
          }));
        } else {
          newCache.set(key, value);
        }
      }
    });
  }, error => {
    logger.error('Received error while indexing files', error);
  }, () => {
    newCache.save().then(success => {
      if (success) {
        logger.info(`Saved cache of size ${newCache.getByteSize()}`);
      } else {
        logger.warn(`Failed to save cache to ${newCache.getPath()}`);
      }
      disposeForGC(index, newCache);
    });
  });
}

// It appears that the index/cache objects are retained by RxJS.
// To enable garbage collection after indexing, manually clear out the objects.
function disposeForGC(index, cache) {
  index.jsFiles.length = 0;
  index.nodeModulesPackageJsonFiles.length = 0;
  index.mainFiles.clear();
  index.exportCache._cache = null;
  cache._cache = null;
}

// Watches a directory for changes and reindexes files as needed.
function watchDirectoryRecursively(root, hasteSettings) {
  (0, (_fileIndex || _load_fileIndex()).watchDirectory)(root).mergeMap(fileChange => handleFileChange(root, fileChange, hasteSettings), CONCURRENCY).subscribe(() => {}, error => {
    logger.error(`Failed to watch ${root}`, error);
  });
}

async function handleFileChange(root, fileChange, hasteSettings) {
  if (fileChange.exists) {
    // File created or modified
    const exportForFile = await getExportsForFileWithMain(fileChange.name, hasteSettings);
    if (exportForFile) {
      sendUpdatesBatched([exportForFile]);
    }
  } else {
    // File deleted.
    sendUpdatesBatched([{
      updateType: 'deleteExports',
      file: fileChange.name,
      exports: []
    }]);
  }
}

// Exported for testing purposes.
function indexDirectory({ root, exportCache, jsFiles, mainFiles }, hasteSettings, maxWorkers = MAX_WORKERS) {
  let cachedUpdates = [];
  const files = [];
  jsFiles.forEach(({ name, sha1 }) => {
    const filePath = (_nuclideUri || _load_nuclideUri()).default.join(root, name);
    if (sha1 != null) {
      const cached = exportCache.get({ filePath, sha1 });
      if (cached != null) {
        cachedUpdates.push({
          updateType: 'setExports',
          file: filePath,
          sha1,
          exports: cached.exports,
          componentDefinition: cached.componentDefinition
        });
        return;
      }
    }
    files.push(name);
  });
  // To get faster results, we can send up the Haste reduced names as a default export.
  if (hasteSettings.isHaste && hasteSettings.useNameReducers) {
    cachedUpdates = cachedUpdates.concat(getHasteNames(root, files, hasteSettings));
  }
  logger.info(`Indexing ${files.length} files`);
  // As an optimization, shuffle the files so that the work is well distributed.
  shuffle(files);
  const numWorkers = Math.min(Math.max(1, Math.floor(files.length / MIN_FILES_PER_WORKER)), maxWorkers);
  const filesPerWorker = Math.ceil(files.length / numWorkers);
  const workerMessages = _rxjsBundlesRxMinJs.Observable.range(0, numWorkers).mergeMap(workerId => {
    return (0, (_nice || _load_nice()).niceSafeSpawn)(process.execPath, [(_nuclideUri || _load_nuclideUri()).default.join(__dirname, 'AutoImportsWorker-entry.js'), '--child', root], {
      stdio: ['inherit', 'inherit', 'inherit', 'ipc']
    });
  }).mergeMap((worker, workerId) => {
    if (!(typeof workerId === 'number')) {
      throw new Error('Invariant violation: "typeof workerId === \'number\'"');
    } // For Flow


    const updateStream = _rxjsBundlesRxMinJs.Observable.fromEvent(worker, 'message').takeUntil(_rxjsBundlesRxMinJs.Observable.fromEvent(worker, 'error').do(error => {
      logger.warn(`Worker ${workerId} had received`, error);
    })).takeUntil(_rxjsBundlesRxMinJs.Observable.fromEvent(worker, 'exit').do(() => {
      logger.debug(`Worker ${workerId} terminated.`);
    }));
    return _rxjsBundlesRxMinJs.Observable.merge(updateStream, _rxjsBundlesRxMinJs.Observable.timer(0).do(() => {
      worker.send({
        files: files.slice(workerId * filesPerWorker, Math.min((workerId + 1) * filesPerWorker, files.length))
      });
    }).ignoreElements());
  });

  return _rxjsBundlesRxMinJs.Observable.of(cachedUpdates).concat(workerMessages).map(message => {
    // Inject the main files at this point, since we have a list of all map files.
    // This could be pure but it's just not worth the cost.
    message.forEach(update => {
      const mainDir = mainFiles.get(update.file);
      if (mainDir != null) {
        decorateExportUpdateWithMainDirectory(update, mainDir);
      }
    });
    return message;
  });
}

const getPackageJson = (0, (_memoize2 || _load_memoize()).default)(async dir => {
  // Bail out at the FS root.
  const parent = (_nuclideUri || _load_nuclideUri()).default.dirname(dir);
  if (parent === dir) {
    return null;
  }

  const packageJson = (_nuclideUri || _load_nuclideUri()).default.join(dir, 'package.json');
  let fileContents;
  try {
    fileContents = await (_fsPromise || _load_fsPromise()).default.readFile(packageJson, 'utf8');
  } catch (err) {
    return getPackageJson(parent);
  }
  try {
    return {
      dirname: dir,
      main: (_nuclideUri || _load_nuclideUri()).default.resolve(dir, JSON.parse(fileContents).main || 'index.js')
    };
  } catch (err) {
    return null;
  }
});

/**
 * Returns the directory of the nearest package.json if `file` matches the "main" field.
 * This ensures that e.g. package/index.js can be imported as just "package".
 */
async function checkIfMain(file) {
  const pkgJson = await getPackageJson((_nuclideUri || _load_nuclideUri()).default.dirname(file));
  return pkgJson != null && (_nuclideUri || _load_nuclideUri()).default.stripExtension(pkgJson.main) === (_nuclideUri || _load_nuclideUri()).default.stripExtension(file) ? pkgJson.dirname : null;
}

function getExportsForFileWithMain(path, hasteSettings, fileContents) {
  return Promise.all([getExportsForFile(path, hasteSettings, fileContents), checkIfMain(path)]).then(([data, directoryForMainFile]) => {
    return data ? decorateExportUpdateWithMainDirectory(data, directoryForMainFile) : null;
  });
}

async function getExportsForFile(file, hasteSettings, fileContents_) {
  try {
    const fileContents = fileContents_ != null ? fileContents_ : await (_fsPromise || _load_fsPromise()).default.readFile(file, 'utf8');
    const sha1 = _crypto.default.createHash('sha1').update(fileContents).digest('hex');
    const update = {
      updateType: 'setExports',
      file,
      sha1,
      exports: []
    };
    const ast = (0, (_AutoImportsManager || _load_AutoImportsManager()).parseFile)(fileContents);
    if (ast == null) {
      return update;
    }
    const hasteName = (0, (_HasteUtils || _load_HasteUtils()).getHasteName)(file, ast, hasteSettings);
    // TODO(hansonw): Support mixed-mode haste + non-haste imports.
    // For now, if Haste is enabled, we'll only suggest Haste imports.
    if (hasteSettings.isHaste && hasteName == null) {
      return update;
    }
    const exports = (0, (_ExportManager || _load_ExportManager()).getExportsFromAst)(file, ast);
    if (hasteName != null) {
      exports.forEach(jsExport => {
        jsExport.hasteName = hasteName;
      });
    }

    const updateObj = Object.assign({}, update, { exports });
    const componentModulePathFilter = process.env.componentModulePathFilter;

    if ((await (0, (_passesGK || _load_passesGK()).default)((_nuclideUiComponentToolsCommon || _load_nuclideUiComponentToolsCommon()).UI_COMPONENT_TOOLS_INDEXING_GK)) && (componentModulePathFilter == null || file.includes(componentModulePathFilter))) {
      const definition = (0, (_nuclideUiComponentToolsCommon || _load_nuclideUiComponentToolsCommon()).getComponentDefinitionFromAst)(file, ast);
      if (definition != null) {
        updateObj.componentDefinition = definition;
      }
    }
    return updateObj;
  } catch (err) {
    logger.error(`Unexpected error indexing ${file}`, err);
    return null;
  }
}

function setupDisconnectedParentHandler() {
  process.on('disconnect', () => {
    logger.debug('Parent process disconnected. AutoImportsWorker terminating.');
    process.exit(0);
  });
}

function setupParentMessagesHandler(root, hasteSettings) {
  process.on('message', async message => {
    const { fileUri, fileContents } = message;
    if (fileUri == null || fileContents == null) {
      logger.warn('AutoImportsWorker received a message from parent without a fileUri or fileContents');
      return;
    }
    try {
      const exportUpdate = await getExportsForFileWithMain(fileUri, hasteSettings, fileContents);
      if (exportUpdate != null) {
        sendUpdatesBatched([exportUpdate]);
      }
    } catch (error) {
      logger.error(`Could not index file ${fileUri}. Error: ${error}`);
    }
  });
}

function getHasteNames(root, files, hasteSettings) {
  return files.map(file => {
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
        line: 1,
        hasteName,
        isTypeExport: false,
        isDefault: true
      }]
    };
  }).filter(Boolean);
}
function indexNodeModules({
  root,
  exportCache,
  nodeModulesPackageJsonFiles
}) {
  return _rxjsBundlesRxMinJs.Observable.from(nodeModulesPackageJsonFiles).mergeMap(file => handleNodeModule(root, file, exportCache), MAX_WORKERS).let((_observable || _load_observable()).compact).bufferCount(BATCH_SIZE);
}

async function handleNodeModule(root, packageJsonFile, exportCache) {
  const file = (_nuclideUri || _load_nuclideUri()).default.join(root, packageJsonFile);
  try {
    const fileContents = await (_fsPromise || _load_fsPromise()).default.readFile(file, 'utf8');
    const packageJson = JSON.parse(fileContents);
    const entryPoint = require.resolve((_nuclideUri || _load_nuclideUri()).default.join((_nuclideUri || _load_nuclideUri()).default.dirname(file), packageJson.main || ''));
    const entryContents = await (_fsPromise || _load_fsPromise()).default.readFile(entryPoint, 'utf8');
    const sha1 = _crypto.default.createHash('sha1').update(entryContents).digest('hex');
    const cachedUpdate = exportCache.get({ filePath: entryPoint, sha1 });
    if (cachedUpdate != null) {
      return {
        updateType: 'setExports',
        file: entryPoint,
        sha1,
        exports: cachedUpdate.exports,
        componentDefinition: cachedUpdate.componentDefinition
      };
    }
    // TODO(hansonw): How do we handle haste modules inside Node modules?
    // For now we'll just treat them as usual.
    const update = await getExportsForFile(entryPoint, {
      isHaste: false,
      useNameReducers: false,
      nameReducers: [],
      nameReducerBlacklist: [],
      nameReducerWhitelist: []
    }, entryContents);
    return update ? decorateExportUpdateWithMainDirectory(update, (_nuclideUri || _load_nuclideUri()).default.join(root, (_nuclideUri || _load_nuclideUri()).default.dirname(packageJsonFile))) : update;
  } catch (error) {
    // Some modules just can't be required; that's perfectly normal.
    if (error.code !== 'MODULE_NOT_FOUND') {
      logger.warn(`Couldn't index ${file}`, error);
    }
    return null;
  }
}

function decorateExportUpdateWithMainDirectory(update, directoryForMainFile) {
  if (update.exports.length > 0 && directoryForMainFile !== update.exports[0].directoryForMainFile) {
    update.exports = update.exports.map(exp => {
      if (directoryForMainFile == null) {
        delete exp.directoryForMainFile;
        return exp;
      } else {
        return Object.assign({}, exp, { directoryForMainFile });
      }
    });
  }
  return update;
}

function sendUpdatesBatched(exportsForFiles) {
  for (let i = 0; i < exportsForFiles.length; i += BATCH_SIZE) {
    send(exportsForFiles.slice(i, i + BATCH_SIZE));
  }
}

async function send(message) {
  if (typeof process.send === 'function') {
    return new Promise((resolve, reject) => {
      if (!(typeof process.send === 'function')) {
        throw new Error('Invariant violation: "typeof process.send === \'function\'"');
      }

      return process.send(message, err => err == null ? resolve() : reject(err));
    });
  }
}

function runChild() {
  const SEND_CONCURRENCY = 10;

  setupDisconnectedParentHandler();
  if (process.argv.length !== 4) {
    logger.error('Child started with incorrect number of arguments');
    return;
  }
  const root = process.argv[3];
  const { hasteSettings } = (0, (_Config || _load_Config()).getConfigFromFlow)(root);
  process.on('message', message => {
    const { files } = message;
    _rxjsBundlesRxMinJs.Observable.from(files).concatMap((file, index) => {
      // Note that we explicitly skip the main check here.
      // The parent process has a index of main files which is more efficient!
      return getExportsForFile((_nuclideUri || _load_nuclideUri()).default.join(root, file), hasteSettings);
    }).let((_observable || _load_observable()).compact).bufferCount(BATCH_SIZE).mergeMap(send, SEND_CONCURRENCY).subscribe({ complete: () => process.exit(0) });
  });
}

function shuffle(array) {
  for (let i = array.length; i; i--) {
    const j = Math.floor(Math.random() * i);
    const temp = array[i - 1];
    array[i - 1] = array[j];
    array[j] = temp;
  }
}

main();