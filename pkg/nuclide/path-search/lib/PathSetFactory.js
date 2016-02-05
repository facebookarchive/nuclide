'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * An Object where the keys are file paths (relative to a certain directory),
 * and the values are booleans. In practice, all the values are 'true'.
 */
type FilePathsPseudoSet = {[key: string]: boolean};

import {spawn} from 'child_process';
import split from 'split';

import PathSet from './PathSet';

function getFilesFromCommand(
    command: string,
    args: Array<string>,
    localDirectory: string,
    transform?: (path: string) => string): Promise<FilePathsPseudoSet> {
  return new Promise((resolve, reject) => {
    // Use `spawn` here to process the, possibly huge, output of the file listing.

    const proc = spawn(command, args, {cwd: localDirectory});

    proc.on('error', reject);

    const filePaths = {};
    proc.stdout.pipe(split()).on('data', filePath => {
      if (transform) {
        filePath = transform(filePath);
      }

      if (filePath !== '') {
        filePaths[filePath] = true;
      }
    });

    let errorString = '';
    proc.stderr.on('data', data => {
      errorString += data;
    });

    proc.on('close', code => {
      if (code === 0) {
        resolve(filePaths);
      } else {
        reject(errorString);
      }
    });
  });
}

function getTrackedHgFiles(localDirectory: string): Promise<FilePathsPseudoSet> {
  return getFilesFromCommand(
    'hg',
    ['locate', '--fullpath', '--include', '.'],
    localDirectory,
    filePath => filePath.slice(localDirectory.length + 1)
  );
}

/**
 * 'Untracked' files are files that haven't been added to the repo, but haven't
 * been explicitly hg-ignored.
 */
function getUntrackedHgFiles(localDirectory: string): Promise<FilePathsPseudoSet> {
  return getFilesFromCommand(
    'hg',
    // Calling 'hg status' with a path has two side-effects:
    // 1. It returns the status of only files under the given path. In this case,
    //    we only want the untracked files under the given localDirectory.
    // 2. It returns the paths relative to the directory in which this command is
    //    run. This is hard-coded to 'localDirectory' in `getFilesFromCommand`,
    //    which is what we want.
    ['status', '--unknown', '--no-status' /* No status code. */, localDirectory],
    localDirectory,
  );
}

/**
 * @param localDirectory The full path to a directory.
 * @return If localDirectory is within an Hg repo, returns an Object where the
 *   keys are file paths (relative to the 'localDirectory') of tracked and untracked
 *   files within that directory, but not including ignored files. All values
 *   are 'true'. If localDirectory is not within an Hg repo, the Promise rejects.
 */
function getFilesFromHg(localDirectory: string): Promise<FilePathsPseudoSet> {
  return Promise.all([getTrackedHgFiles(localDirectory), getUntrackedHgFiles(localDirectory)]).then(
    returnedFiles => {
      const [trackedFiles, untrackedFiles] = returnedFiles;
      return {...trackedFiles, ...untrackedFiles};
    }
  );
}

function getTrackedGitFiles(localDirectory: string): Promise<FilePathsPseudoSet> {
  return getFilesFromCommand('git', ['ls-files'], localDirectory);
}

/**
 * 'Untracked' files are files that haven't been added to the repo, but haven't
 * been explicitly git-ignored.
 */
function getUntrackedGitFiles(localDirectory: string): Promise<FilePathsPseudoSet> {
  // '--others' means untracked files, and '--exclude-standard' excludes ignored files.
  return getFilesFromCommand('git', ['ls-files', '--exclude-standard', '--others'], localDirectory);
}

/**
 * @param localDirectory The full path to a directory.
 * @return If localDirectory is within a Git repo, returns an Object where the
 *   keys are file paths (relative to the 'localDirectory') of tracked and untracked
 *   files within that directory, but not including ignored files. All values
 *   are 'true'. If localDirectory is not within a Git repo, the Promise rejects.
 */
function getFilesFromGit(localDirectory: string): Promise<FilePathsPseudoSet> {
  return Promise.all(
      [getTrackedGitFiles(localDirectory), getUntrackedGitFiles(localDirectory)]).then(
    returnedFiles => {
      const [trackedFiles, untrackedFiles] = returnedFiles;
      return {...trackedFiles, ...untrackedFiles};
    }
  );
}

function getAllFiles(localDirectory: string): Promise<FilePathsPseudoSet> {
  return getFilesFromCommand(
      'find',
      ['.', '-type', 'f'],
      localDirectory,
      // Slice off the leading `./` that find will add on here.
      filePath => filePath.substring(2));
}

/**
 * Creates a `PathSet` with the contents of the specified directory.
 */
export async function createPathSet(localDirectory: string): Promise<PathSet> {
  // Attempts to get a list of files relative to `localDirectory`, hopefully from
  // a fast source control index.
  // TODO (williamsc) once ``{HG|Git}Repository` is working in nuclide-server,
  // use those instead to determine VCS.
  const paths = await getFilesFromHg(localDirectory)
      .catch(() => getFilesFromGit(localDirectory))
      .catch(() => getAllFiles(localDirectory))
      .catch(() => { throw new Error(`Failed to populate FileSearch for ${localDirectory}`); });
  return new PathSet({paths});
}

export const __test__ = {
  getFilesFromGit,
  getFilesFromHg,
};
