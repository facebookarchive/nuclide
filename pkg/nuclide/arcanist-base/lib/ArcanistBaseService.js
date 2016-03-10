'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from '../../remote-uri';
import invariant from 'assert';
import {quote} from 'shell-quote';
const {asyncExecute} = require('../../commons');
const logger = require('../../logging').getLogger();

const ARC_CONFIG_FILE_NAME = '.arcconfig';

export type ArcDiagnostic = {
  type: string;
  text: string;
  filePath: NuclideUri;
  row: number;
  col: number;
  code: ?string;

  // For autofix
  original?: string;
  replacement?: string;
};

// Exported for testing
export const arcConfigDirectoryMap: Map<NuclideUri, ?NuclideUri> = new Map();
const arcProjectMap: Map<?NuclideUri, ?Object> = new Map();

export async function findArcConfigDirectory(fileName: NuclideUri): Promise<?NuclideUri> {
  if (!arcConfigDirectoryMap.has(fileName)) {
    const findNearestFile = require('../../commons').findNearestFile;
    const result = await findNearestFile(ARC_CONFIG_FILE_NAME, fileName);
    arcConfigDirectoryMap.set(fileName, result);
  }
  return arcConfigDirectoryMap.get(fileName);
}

export async function readArcConfig(fileName: NuclideUri): Promise<?any> {
  const arcConfigDirectory = await findArcConfigDirectory(fileName);
  if (!arcConfigDirectory) {
    return null;
  }
  if (!arcProjectMap.has(arcConfigDirectory)) {
    const path = require('path');
    const arcconfigFile = path.join(arcConfigDirectory, ARC_CONFIG_FILE_NAME);
    const contents = await require('../../commons').readFile(arcconfigFile, 'utf8');
    invariant(typeof contents === 'string');
    const result = JSON.parse(contents);
    arcProjectMap.set(arcConfigDirectory, result);
  }
  return arcProjectMap.get(arcConfigDirectory);
}

export async function findArcProjectIdOfPath(fileName: NuclideUri): Promise<?string> {
  const project = await readArcConfig(fileName);
  return project ? project['project_id'] : null;
}

export async function getProjectRelativePath(fileName: NuclideUri): Promise<?string> {
  const arcPath = await findArcConfigDirectory(fileName);
  const path = require('path');
  return arcPath && fileName ? path.relative(arcPath, fileName) : null;
}

export async function findDiagnostics(pathToFiles: Array<NuclideUri>, skip: Array<string>):
    Promise<Array<ArcDiagnostic>> {
  const arcConfigDirToFiles: Map<string, Array<string>> = new Map();
  await Promise.all(
    pathToFiles.map(async path => {
      const arcConfigDir = await findArcConfigDirectory(path);
      if (arcConfigDir) {
        let files = arcConfigDirToFiles.get(arcConfigDir);
        if (files == null) {
          files = [];
          arcConfigDirToFiles.set(arcConfigDir, files);
        }
        files.push(path);
      }
    })
  );

  // Kick off all the arc execs at once, then await later so they all happen in parallel.
  const results: Array<Promise<Array<ArcDiagnostic>>> = [];
  for (const [arcDir, files] of arcConfigDirToFiles) {
    results.push(execArcLint(arcDir, files, skip));
  }

  // Flatten the resulting array
  return [].concat(...(await Promise.all(results)));
}

async function _callArcDiff(
  filePath: NuclideUri,
  extraArcDiffArgs: Array<string>,
): Promise<void> {
  const env = {...process.env};
  // Even with `--verbatim` Arcanist will sometimes launch and enditor in interactive mode.  With
  // the editor set to `/bin/false` it will immediately exit with a failure and abort `arc diff`.
  env['EDITOR'] = 'false';
  // Don't change the checkout and answer no to all of Arcanist's questions.
  const cmd = [
    // Mind the trailing comma in the command.
    quote(['python', '-c', 'print "n\\n" * 50,']),
    quote(['arc', 'diff'].concat(extraArcDiffArgs)),
  ].join(' | ');
  const args: Array<string> = ['-c', cmd];
  const arcConfigDir = await findArcConfigDirectory(filePath);
  if (arcConfigDir == null) {
    throw new Error('Failed to find Arcanist config.  Is this project set-up for Arcanist?');
  }
  const options = {
    'cwd': arcConfigDir,
    'env': env,
  };
  await asyncExecute('bash', args, options);
}

export async function createPhabricatorRevision(
  filePath: NuclideUri,
  message: string,
): Promise<void> {
  await _callArcDiff(filePath, ['-m', message]);
}

export async function updatePhabricatorRevision(
  filePath: NuclideUri,
  message: string,
): Promise<void> {
  await _callArcDiff(filePath, ['-m', message]);
}

async function execArcLint(cwd: string, filePaths: Array<NuclideUri>, skip: Array<string>):
    Promise<Array<ArcDiagnostic>> {
  const args: Array<string> = ['lint', '--output', 'json', ...filePaths];
  if (skip.length > 0) {
    args.push('--skip', skip.join(','));
  }
  const options = {'cwd': cwd};
  const result = await asyncExecute('arc', args, options);

  const output: Map<string, Array<Object>> = new Map();
  // Arc lint outputs multiple JSON objects on mutliple lines. Split them, then merge the
  // results.
  for (const line of result.stdout.trim().split('\n')) {
    let json;
    try {
      json = JSON.parse(line);
    } catch (error) {
      logger.error('Error parsing `arc lint` JSON output', result.stdout);
      return [];
    }
    for (const path of Object.keys(json)) {
      const errorsToAdd = json[path];

      let errors = output.get(path);
      if (errors == null) {
        errors = [];
        output.set(path, errors);
      }
      for (const error of errorsToAdd) {
        errors.push(error);
      }
    }
  }

  const lints = [];
  const {relative} = require('path');
  for (const path of filePaths) {
    // TODO(7876450): For some reason, this does not work for particular values of pathToFile.
    // Depending on the location of .arcconfig, we may get a key that is different from what `arc
    // lint` actually returns, and end up without any lints for this path.
    const key = relative(cwd, path);
    const rawLints = output.get(key);
    if (rawLints) {
      for (const lint of convertLints(path, rawLints)) {
        lints.push(lint);
      }
    }
  }
  return lints;
}

function convertLints(
  pathToFile: string,
  lints: Array<{
    severity: string;
    line: number;
    char: number;
    code: string;
    description: string;
    original?: string;
    replacement?: string;
  }>,
): Array<ArcDiagnostic> {
  return lints.map(lint => {
    // Choose an appropriate level based on lint['severity'].
    const severity = lint['severity'];
    const level = severity === 'error' ? 'Error' : 'Warning';

    const line = lint['line'];
    // Sometimes the linter puts in global errors on line 0, which will result
    // in a negative index. We offset those back to the first line.
    const col = Math.max(0, lint['char'] - 1);
    const row = Math.max(0, line - 1);

    const diagnostic: ArcDiagnostic = {
      type: level,
      text: lint['description'],
      filePath: pathToFile,
      row,
      col,
      code: lint['code'],
    };
    if (lint.original != null) {
      diagnostic.original = lint.original;
    }
    if (lint.replacement != null) {
      diagnostic.replacement = lint.replacement;
    }
    return diagnostic;
  });
}
