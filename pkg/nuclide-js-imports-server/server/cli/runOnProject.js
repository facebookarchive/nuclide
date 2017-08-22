'use strict';

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('nuclide-commons/fsPromise'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
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

const TO_IGNORE = ['**/node_modules/**', '**/VendorLib/**', '**/flow-typed/**'];
const DEFAULT_PROJECT_PATH = (_nuclideUri || _load_nuclideUri()).default.join(__dirname, '..', '..', '..', '..');
const ENVS = ['builtin', 'node', 'jasmine', 'browser', 'atomtest', 'es6'];
const shouldIndexNodeModules = true;

let numErrors = 0;
let numFiles = 0;

function main() {
  const autoImportsManager = new (_AutoImportsManager || _load_AutoImportsManager()).AutoImportsManager(ENVS);
  const missingImports = new Map();

  const root = process.argv.length === 3 ? toPath(process.argv[2]) : DEFAULT_PROJECT_PATH;

  console.log('Began indexing all files');
  const indexDirPromise = new Promise((resolve, reject) => {
    (0, (_AutoImportsWorker || _load_AutoImportsWorker()).indexDirectory)(root).subscribe({
      next: exportForFiles => {
        exportForFiles.forEach(exportForFile => autoImportsManager.handleUpdateForFile(exportForFile));
      },
      error: err => {
        console.error('Encountered error in AutoImportsWorker', err);
        return reject(err);
      },
      complete: () => {
        console.log(`Finished indexing source code for ${root}`);
        return resolve();
      }
    });
  });

  const indexModulesPromise = shouldIndexNodeModules ? new Promise((resolve, reject) => {
    (0, (_AutoImportsWorker || _load_AutoImportsWorker()).indexNodeModules)(root).subscribe({
      next: exportForFile => {
        if (exportForFile) {
          autoImportsManager.handleUpdateForFile(exportForFile);
        }
      },
      error: err => {
        console.error('Encountered error in AutoImportsWorker', err);
        return reject(err);
      },
      complete: () => {
        console.log(`Finished indexing node modules ${root}`);
        return resolve();
      }
    });
  }) : Promise.resolve();

  // Check all files for missing imports
  Promise.all([indexDirPromise, indexModulesPromise]).then(() => {
    return (_fsPromise || _load_fsPromise()).default.glob('**/*.js', {
      cwd: root,
      ignore: TO_IGNORE
    }).then(files => files.map(file => (_nuclideUri || _load_nuclideUri()).default.join(root, file))).then(files => {
      console.log('Finsihed indexing. Checking all files for missing imports.');
      return checkFilesForMissingImports(files, autoImportsManager, missingImports);
    }).then(() => {
      // Report the results
      console.log(`Ran on ${numFiles} files. Terminated with ${numErrors} errors.`);
      console.log(`Found ${missingImports.size} files with missing imports.`);
      missingImports.forEach((missingImportsForFile, file) => {
        console.log(`Missing imports for ${file}:`);
        missingImportsForFile.forEach(missingImport => {
          console.log(missingImport.symbol);
          console.log(missingImport.filesWithExport);
        });
        console.log('\n');
      });
    });
  });
}

function checkFilesForMissingImports(files, autoImportsManager, missingImports) {
  return Promise.all(files.map(file => {
    if (file) {
      numFiles++;
      return (_fsPromise || _load_fsPromise()).default.readFile(file, 'utf8').then(fileContents => {
        const missingImport = autoImportsManager.findMissingImports(file, fileContents);
        if (missingImport.length > 0) {
          missingImports.set(file, missingImport);
        }
      }, err => {
        if (err) {
          numErrors++;
          console.log('Error with checking for missing imports with file', file, 'Error:', err);
        }
      });
    }
  }));
}

function toPath(filename) {
  if ((_nuclideUri || _load_nuclideUri()).default.isAbsolute(filename)) {
    return filename;
  }
  return (_nuclideUri || _load_nuclideUri()).default.normalize((_nuclideUri || _load_nuclideUri()).default.join(process.cwd(), filename));
}

main();