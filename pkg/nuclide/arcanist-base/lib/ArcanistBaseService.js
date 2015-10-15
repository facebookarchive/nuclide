'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from 'nuclide-remote-uri';
import invariant from 'assert';
const logger = require('nuclide-logging').getLogger();

const ARC_CONFIG_FILE_NAME = '.arcconfig';

const arcConfigDirectoryMap: Map<NuclideUri, ?NuclideUri> = new Map();
const arcProjectMap: Map<?NuclideUri, ?Object> = new Map();

export async function findArcConfigDirectory(fileName: NuclideUri): Promise<?NuclideUri> {
  if (!arcConfigDirectoryMap.has(fileName)) {
    var findNearestFile = require('nuclide-commons').findNearestFile;
    var result = await findNearestFile(ARC_CONFIG_FILE_NAME, fileName);
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
    const contents = await require('nuclide-commons').readFile(arcconfigFile, 'utf8');
    invariant(typeof contents === 'string');
    const result = JSON.parse(contents);
    arcProjectMap.set(arcConfigDirectory, result);
  }
  return arcProjectMap.get(arcConfigDirectory);
}

export async function findArcProjectIdOfPath(fileName: NuclideUri): Promise<?string> {
  var project = await readArcConfig(fileName);
  return project ? project['project_id'] : null;
}

export async function getProjectRelativePath(fileName: NuclideUri): Promise<?string> {
  var arcPath = await findArcConfigDirectory(fileName);
  var path = require('path');
  return arcPath && fileName ? path.relative(arcPath, fileName) : null;
}

export async function findDiagnostics(pathToFile: NuclideUri): Promise {
  const cwd = await findArcConfigDirectory(pathToFile);
  if (cwd == null) {
    return [];
  }

  var args = ['lint', '--output', 'json', pathToFile];
  var options = {'cwd': cwd};
  var {asyncExecute} = require('nuclide-commons');
  var result = await asyncExecute('arc', args, options);

  const output: Map<string, Array<Object>> = new Map();
  // Arc lint outputs multiple JSON objects on mutliple lines. Split them, then merge the
  // results.
  for (let line of result.stdout.trim().split('\n')) {
    let json;
    try {
      json = JSON.parse(line);
    } catch (error) {
      logger.error('Error parsing `arc lint` JSON output', result.stdout);
      return [];
    }
    for (let path of Object.keys(json)) {
      const errorsToAdd = json[path];
      if (!output.has(path)) {
        output.set(path, []);
      }
      let errors = output.get(path);
      for (let error of errorsToAdd) {
        errors.push(error);
      }
    }
  }

  // json is an object where the keys are file paths that are relative to the
  // location of the .arcconfig file. There will be an entry in the map for
  // the file even if there were no lint errors.
  var key = require('path').relative(cwd, pathToFile);
  var lints = output.get(key);

  // TODO(7876450): For some reason, this does not work for particular values
  // of pathToFile.
  //
  // For now, we defend against this by returning the empty array.
  if (!lints) {
    return [];
  }

  return lints.map((lint) => {
    // Choose an appropriate level based on lint['severity'].
    var severity = lint['severity'];
    var level = severity === 'error' ? 'Error' : 'Warning';

    var line = lint['line'];
    // Sometimes the linter puts in global errors on line 0, which will result
    // in a negative index. We offset those back to the first line.
    var col = Math.max(0, lint['char'] - 1);
    var row = Math.max(0, line - 1);

    return {
      type: level,
      text: lint['description'],
      filePath: pathToFile,
      row,
      col,
      code: lint['code'],
    };
  });
}
