'use strict';

var _os = _interopRequireDefault(require('os'));

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('nuclide-commons/fsPromise'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _process;

function _load_process() {
  return _process = require('nuclide-commons/process');
}

var _AutoImportsManager;

function _load_AutoImportsManager() {
  return _AutoImportsManager = require('../src/lib/AutoImportsManager');
}

var _AutoImportsWorker;

function _load_AutoImportsWorker() {
  return _AutoImportsWorker = require('../src/lib/AutoImportsWorker');
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

/* eslint-disable no-console */

const DEFAULT_PROJECT_PATH = (_nuclideUri || _load_nuclideUri()).default.join(__dirname, '..', '..', '..');
const ENVS = ['builtin', 'node', 'jasmine', 'browser', 'atomtest', 'es6'];
const shouldIndexNodeModules = true;

let numErrors = 0;
let numFiles = 0;

function main() {
  const autoImportsManager = new (_AutoImportsManager || _load_AutoImportsManager()).AutoImportsManager(ENVS);

  const root = process.argv.length === 3 ? toPath(process.argv[2]) : DEFAULT_PROJECT_PATH;

  const indexDirStream = (0, (_AutoImportsWorker || _load_AutoImportsWorker()).indexDirectory)(root, false, _os.default.cpus().length).do({
    next: exportForFiles => {
      exportForFiles.forEach(exportForFile => autoImportsManager.handleUpdateForFile(exportForFile));
    },
    error: err => {
      console.error('Encountered error in AutoImportsWorker', err);
    },
    complete: () => {
      console.log(`Finished indexing source code for ${root}`);
    }
  });

  const indexModulesStream = shouldIndexNodeModules ? (0, (_AutoImportsWorker || _load_AutoImportsWorker()).indexNodeModules)(root).do({
    next: exportForFile => {
      if (exportForFile) {
        autoImportsManager.handleUpdateForFile(exportForFile);
      }
    },
    error: err => {
      console.error('Encountered error in AutoImportsWorker', err);
    },
    complete: () => {
      console.log(`Finished indexing node modules ${root}`);
    }
  }) : _rxjsBundlesRxMinJs.Observable.empty();

  console.log('Began indexing all files');

  // Check all files for missing imports
  _rxjsBundlesRxMinJs.Observable.merge(indexModulesStream, indexDirStream).concat(
  // Don't bother checking non-Flow files.
  (0, (_process || _load_process()).observeProcess)('flow', ['ls', root, '--ignore', '.*/\\(node_modules\\|VendorLib\\)/.*']).filter(event => event.kind === 'stdout').mergeMap(event => {
    if (!(event.kind === 'stdout')) {
      throw new Error('Invariant violation: "event.kind === \'stdout\'"');
    }

    return checkFileForMissingImports(event.data.trim(), autoImportsManager);
  }, 10)).subscribe({
    complete: () => {
      // Report the results
      console.log(`Ran on ${numFiles} files. Terminated with ${numErrors} errors.`);
      process.exit(numErrors > 0 ? 1 : 0);
    }
  });
}

function checkFileForMissingImports(file, autoImportsManager) {
  numFiles++;
  return (_fsPromise || _load_fsPromise()).default.readFile(file, 'utf8').then(fileContents => {
    const missingImports = autoImportsManager.findMissingImports(file, fileContents).filter(missingImport => missingImport.symbol.type === 'value');
    if (missingImports.length > 0) {
      console.log(JSON.stringify({ file, missingImports }, null, 2));
    }
  }, err => {
    if (err) {
      numErrors++;
      console.log('Error with checking for missing imports with file', file, 'Error:', err);
    }
  });
}

function toPath(filename) {
  if ((_nuclideUri || _load_nuclideUri()).default.isAbsolute(filename)) {
    return filename;
  }
  return (_nuclideUri || _load_nuclideUri()).default.normalize((_nuclideUri || _load_nuclideUri()).default.join(process.cwd(), filename));
}

main();