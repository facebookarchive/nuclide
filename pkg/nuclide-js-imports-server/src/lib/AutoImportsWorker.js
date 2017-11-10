/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import log4js from 'log4js';
import os from 'os';
import fs from 'fs';
import fsPromise from 'nuclide-commons/fsPromise';
import nuclideUri from 'nuclide-commons/nuclideUri';
import {compact} from 'nuclide-commons/observable';
import {getExportsFromAst, idFromFileName} from './ExportManager';
import {Observable} from 'rxjs';
import {parseFile} from './AutoImportsManager';
import {initializeLoggerForWorker} from '../../logging/initializeLogging';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {getConfigFromFlow} from '../getConfig';
import {niceSafeSpawn} from 'nuclide-commons/nice';
import invariant from 'assert';
import {getHasteName, hasteReduceName} from './HasteUtils';
import {watchDirectory, getFileIndex} from './file-index';

import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {HasteSettings} from '../getConfig';
import type {JSExport} from './types';
import type {FileChange} from '../../../nuclide-watchman-helpers/lib/WatchmanClient';
import type {FileIndex} from './file-index';

initializeLoggerForWorker();
const logger = log4js.getLogger('js-imports-worker');

const CONCURRENCY = 1;

const BATCH_SIZE = 500;

const MIN_FILES_PER_WORKER = 100;

const disposables = new UniversalDisposable();

// Directory ==> Main File. Null indicates no package.json file.
const mainFilesCache: Map<NuclideUri, ?NuclideUri> = new Map();

export type ExportUpdateForFile = {
  updateType: 'setExports' | 'deleteExports',
  file: NuclideUri,
  exports: Array<JSExport>,
};

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
  const {hasteSettings} = getConfigFromFlow(root);

  // Listen for open files that should be indexed immediately
  setupParentMessagesHandler(root, hasteSettings);

  // Listen for file changes with Watchman that should update the index.
  watchDirectoryRecursively(root, hasteSettings);

  // Build up the initial index with all files recursively from the root.
  const index = await getFileIndex(root);
  disposables.add(
    Observable.merge(
      indexDirectory(index, hasteSettings),
      indexNodeModules(index),
    ).subscribe(sendExportUpdateToParent, error => {
      logger.error('Received error while indexing files', error);
    }),
  );
}

// Watches a directory for changes and reindexes files as needed.
function watchDirectoryRecursively(
  root: NuclideUri,
  hasteSettings: HasteSettings,
) {
  disposables.add(
    watchDirectory(root)
      .mergeMap(
        (fileChange: FileChange) =>
          handleFileChange(root, fileChange, hasteSettings),
        CONCURRENCY,
      )
      .subscribe(
        () => {},
        error => {
          logger.error(`Failed to watch ${root}`, error);
        },
      ),
  );
}

async function handleFileChange(
  root: NuclideUri,
  fileChange: FileChange,
  hasteSettings: HasteSettings,
): Promise<void> {
  if (fileChange.exists) {
    // File created or modified
    const exportForFile = await addFileToIndex(
      root,
      nuclideUri.relative(root, fileChange.name),
      hasteSettings,
    );
    if (exportForFile) {
      sendExportUpdateToParent([exportForFile]);
    }
  } else {
    // File deleted.
    sendExportUpdateToParent([
      {
        updateType: 'deleteExports',
        file: fileChange.name,
        exports: [],
      },
    ]);
  }
}

// Exported for testing purposes.
export function indexDirectory(
  {root, jsFiles}: FileIndex,
  hasteSettings: HasteSettings,
  maxWorkers?: number = Math.round(os.cpus().length / 2),
): Observable<Array<ExportUpdateForFile>> {
  const files = jsFiles.map(file => file.name);
  // To get faster results, we can send up the Haste reduced names as a default export.
  if (hasteSettings.isHaste && hasteSettings.useNameReducers) {
    addHasteNames(root, files, hasteSettings);
  }
  logger.info(`Indexing ${files.length} files`);
  // As an optimization, shuffle the files so that the work is well distributed.
  shuffle(files);
  const numWorkers = Math.min(
    Math.max(1, Math.floor(files.length / MIN_FILES_PER_WORKER)),
    maxWorkers,
  );
  const filesPerWorker = Math.floor(files.length / numWorkers);
  return Observable.range(0, numWorkers)
    .mergeMap(workerId => {
      return niceSafeSpawn(
        process.execPath,
        [
          nuclideUri.join(__dirname, 'AutoImportsWorker-entry.js'),
          '--child',
          root,
        ],
        {
          stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
        },
      );
    })
    .mergeMap((worker, workerId) => {
      invariant(typeof workerId === 'number'); // For Flow
      const updateStream = Observable.fromEvent(worker, 'message')
        .takeUntil(
          Observable.fromEvent(worker, 'error').do(error => {
            logger.warn(`Worker ${workerId} had received ${error}`);
          }),
        )
        .takeUntil(
          Observable.fromEvent(worker, 'exit').do(() => {
            logger.debug(`Worker ${workerId} terminated.`);
          }),
        );
      return Observable.merge(
        updateStream,
        Observable.timer(0)
          .do(() => {
            worker.send({
              files: files.slice(
                workerId * filesPerWorker,
                Math.min((workerId + 1) * filesPerWorker, files.length),
              ),
            });
          })
          .ignoreElements(),
      );
    });
}

async function checkIfMain(
  file: NuclideUri,
  readFileSync?: boolean,
): Promise<?NuclideUri> {
  let currDir = file;
  while (true) {
    const lastDir = currDir;
    currDir = nuclideUri.dirname(currDir);
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
      cachedMain &&
      nuclideUri.stripExtension(cachedMain) === nuclideUri.stripExtension(file)
    ) {
      return currDir;
    }
    const packageJson = nuclideUri.resolve(currDir, 'package.json');
    try {
      // Most of the time the file won't exist and the Promise should be rejected
      // quickly, so it's probably more efficient to await in this loop instead of
      // using Promise.all to queue up a promise for each directory in the file path.
      const fileContents = readFileSync
        ? fs.readFileSync(packageJson, 'utf8')
        : // eslint-disable-next-line no-await-in-loop
          await fsPromise.readFile(packageJson, 'utf8');

      const mainFile = nuclideUri.resolve(
        currDir,
        JSON.parse(fileContents).main || 'index.js',
      );
      mainFilesCache.set(currDir, mainFile);
      const isMainFile =
        nuclideUri.stripExtension(mainFile) === nuclideUri.stripExtension(file);
      return isMainFile ? currDir : null;
    } catch (error) {
      mainFilesCache.set(currDir, null);
    }
  }
}

function addFileToIndex(
  root: NuclideUri,
  fileRelative: NuclideUri,
  hasteSettings: HasteSettings,
  fileContents?: string,
): Promise<?ExportUpdateForFile> {
  const file = nuclideUri.join(root, fileRelative);
  return Promise.all([
    getExportsForFile(file, fileContents, hasteSettings),
    checkIfMain(file),
  ]).then(([data, directoryForMainFile]) => {
    return data
      ? decorateExportUpdateWithMainDirectory(data, directoryForMainFile)
      : null;
  });
}

async function getExportsForFile(
  file: NuclideUri,
  fileContents_: ?string,
  hasteSettings: HasteSettings,
): Promise<?ExportUpdateForFile> {
  try {
    const fileContents =
      fileContents_ != null
        ? fileContents_
        : await fsPromise.readFile(file, 'utf8');
    const ast = parseFile(fileContents);
    if (ast == null) {
      return null;
    }
    const hasteName = getHasteName(file, ast, hasteSettings);
    // TODO(hansonw): Support mixed-mode haste + non-haste imports.
    // For now, if Haste is enabled, we'll only suggest Haste imports.
    if (hasteSettings.isHaste && hasteName == null) {
      return null;
    }
    const exports = getExportsFromAst(file, ast);
    if (hasteName != null) {
      exports.forEach(jsExport => {
        jsExport.hasteName = hasteName;
      });
    }
    return {file, exports, updateType: 'setExports'};
  } catch (err) {
    logger.error(`Unexpected error indexing ${file}`, err);
    return null;
  }
}

function setupDisconnectedParentHandler(): void {
  process.on('disconnect', () => {
    logger.debug('Parent process disconnected. AutoImportsWorker terminating.');
    exitCleanly();
  });
}

function setupParentMessagesHandler(
  root: string,
  hasteSettings: HasteSettings,
): void {
  process.on('message', async message => {
    const {fileUri, fileContents} = message;
    if (fileUri == null || fileContents == null) {
      logger.warn(
        'AutoImportsWorker received a message from parent without a fileUri or fileContents',
      );
      return;
    }
    try {
      const exportUpdate = await addFileToIndex(
        root,
        nuclideUri.relative(root, fileUri),
        hasteSettings,
        fileContents,
      );
      if (exportUpdate != null) {
        sendExportUpdateToParent([exportUpdate]);
      }
    } catch (error) {
      logger.error(`Could not index file ${fileUri}. Error: ${error}`);
    }
  });
}

function addHasteNames(
  root: NuclideUri,
  files: Array<string>,
  hasteSettings: HasteSettings,
) {
  sendExportUpdateToParent(
    files
      .map((file): ?ExportUpdateForFile => {
        const hasteName = hasteReduceName(file, hasteSettings);
        if (hasteName == null) {
          return null;
        }
        return {
          file,
          updateType: 'setExports',
          exports: [
            {
              id: idFromFileName(hasteName),
              uri: nuclideUri.join(root, file),
              line: 1,
              hasteName,
              isTypeExport: false,
              isDefault: true,
            },
          ],
        };
      })
      .filter(Boolean),
  );
}
export function indexNodeModules({
  root,
  nodeModulesPackageJsonFiles,
}: FileIndex): Observable<Array<ExportUpdateForFile>> {
  const files = nodeModulesPackageJsonFiles.map(file => file.name);
  return Observable.from(files)
    .mergeMap(file => handleNodeModule(root, file), CONCURRENCY)
    .let(compact)
    .bufferCount(BATCH_SIZE);
}

async function handleNodeModule(
  root: NuclideUri,
  packageJsonFile: NuclideUri,
): Promise<?ExportUpdateForFile> {
  const file = nuclideUri.join(root, packageJsonFile);
  try {
    const fileContents = await fsPromise.readFile(file, 'utf8');
    const packageJson = JSON.parse(fileContents);
    const entryPoint = require.resolve(
      nuclideUri.join(nuclideUri.dirname(file), packageJson.main || ''),
    );
    // TODO(hansonw): How do we handle haste modules inside Node modules?
    // For now we'll just treat them as usual.
    const update = await getExportsForFile(entryPoint, null, {
      isHaste: false,
      useNameReducers: false,
      nameReducers: [],
      nameReducerBlacklist: [],
      nameReducerWhitelist: [],
    });
    return update
      ? decorateExportUpdateWithMainDirectory(
          update,
          nuclideUri.join(root, nuclideUri.dirname(packageJsonFile)),
        )
      : update;
  } catch (error) {
    // Some modules just can't be required; that's perfectly normal.
    if (error.code !== 'MODULE_NOT_FOUND') {
      logger.warn(`Couldn't index ${file}`, error);
    }
    return null;
  }
}

function decorateExportUpdateWithMainDirectory(
  update: ExportUpdateForFile,
  directoryForMainFile: ?NuclideUri,
) {
  // flowlint-next-line sketchy-null-string:off
  if (directoryForMainFile) {
    update.exports = update.exports.map(exp => {
      return {...exp, directoryForMainFile};
    });
  }
  return update;
}

async function sendExportUpdateToParent(
  exportsForFiles: Array<ExportUpdateForFile>,
): Promise<void> {
  for (let i = 0; i < exportsForFiles.length; i += BATCH_SIZE) {
    send(exportsForFiles.slice(i, i + BATCH_SIZE));
  }
}

async function send(message: mixed) {
  if (typeof process.send === 'function') {
    return new Promise((resolve, reject) => {
      invariant(typeof process.send === 'function');
      return process.send(
        message,
        err => (err == null ? resolve() : reject(err)),
      );
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
  const root: NuclideUri = process.argv[3];
  const {hasteSettings} = getConfigFromFlow(root);
  process.on('message', message => {
    const {files} = message;
    Observable.from(files)
      .concatMap((file, index) => {
        return addFileToIndex(root, file, hasteSettings);
      })
      .let(compact)
      .filter(
        // Optimization: we already added default exports for all name-reduced Haste modules.
        exportForFile => !isDefaultExportHasteName(exportForFile.exports),
      )
      .bufferCount(BATCH_SIZE)
      .mergeMap(sendExportUpdateToParent, SEND_CONCURRENCY)
      .subscribe({complete: exitCleanly});
  });
}

function isDefaultExportHasteName(exportsForFile: Array<JSExport>): boolean {
  if (exportsForFile.length !== 1) {
    return false;
  }
  const {hasteName, id, isDefault, isTypeExport} = exportsForFile[0];
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
