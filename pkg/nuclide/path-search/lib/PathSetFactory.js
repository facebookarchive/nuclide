'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var PathSet = require('./PathSet');

var {spawn} = require('child_process');
var split = require('split');


function getFilesFromCommand(
    command: string,
    args: Array<string>,
    localDirectory: string,
    transform?: (path: string) => string): Promise<Object<string, boolean>> {
  return new Promise((resolve, reject) => {
    // Use `spawn` here to process the, possibly huge, output of the file listing.

    var proc = spawn(command, args, {cwd: localDirectory});

    proc.on('error', reject);

    var filePaths = {};
    proc.stdout.pipe(split()).on('data', (filePath) => {
      if (transform) {
        filePath = transform(filePath);
      }

      if (filePath !== '') {
        filePaths[filePath] = true;
      }
    });

    var errorString = '';
    proc.stderr.on('data', (data) => {
      errorString += data;
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve(filePaths);
      } else {
        reject(errorString);
      }
    });
  });
}

function getTrackedHgFiles(localDirectory: string): Promise<Object<string, boolean>> {
  return getFilesFromCommand(
      'hg',
      ['locate', '--fullpath', '--include', '.'],
      localDirectory,
      filePath => filePath.slice(localDirectory.length + 1));
}

function getTrackedGitFiles(localDirectory: string): Promise<Object<string, boolean>> {
  return getFilesFromCommand('git', ['ls-files'], localDirectory);
}

function getAllFiles(localDirectory: string): Promise<Object<string, boolean>> {
  return getFilesFromCommand(
      'find',
      ['.', '-type', 'f'],
      localDirectory,
      // Slice off the leading `./` that find will add on here.
      filePath => filePath.substring(2));
}

/**
 * Creates a `PathSet` with the contents of the specified directory.
 *
 * TODO(6950762) The PathSet returned by this function needs to be instrumented
 * with the ability to update its contents as files are created/deleted under
 * the specified localDirectory.
 */
async function createPathSet(localDirectory: string): Promise<PathSet> {
  // Attempts to get a list of files relative to `localDirectory`, hopefully from a fast source control index.
  // TODO (williamsc) once ``{HG|Git}Repository` is working in nuclide-server, use those instead to determine VCS.
  var paths = await getTrackedHgFiles(localDirectory)
      .catch(() => getTrackedGitFiles(localDirectory))
      .catch(() => getAllFiles(localDirectory))
      .catch(() => { throw new Error(`Failed to populate FileSearch for ${localDirectory}`) });
  return new PathSet({paths});
}

module.exports = {
  createPathSet,
};
