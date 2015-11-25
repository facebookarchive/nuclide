'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

type Target = {path: string; name: string};

import type {BuckProject} from 'nuclide-buck-base/lib/BuckProject';

const {isBuckFile} = require('nuclide-buck-base');
const {buckProjectRootForPath} = require('nuclide-buck-commons');
const {fsPromise} = require('nuclide-commons');
const {goToLocation, extractWordAtPosition} = require('nuclide-atom-helpers');

import type {Point} from 'atom';

const targetRegex = /(\/(?:\/[\w\-\.]*)*){0,1}:([\w\-\.]+)/;

const ESCAPE_REGEXP = /([.*+?^${}()|\[\]\/\\])/g;

function escapeRegExp(str: string): string {
  return str.replace(ESCAPE_REGEXP, '\\$1');
}

/**
 * Takes target regex match and file path where given target is found as
 * arguments.
 * Returns target as object with path and name properties.
 * For example, input match
 * ['//Apps/MyApp:MyTarget', '//Apps/MyApp', 'MyTarget'] would be parsed to
 * {path: //Apps/MyApp/BUCK, name: MyTarget} and ':MyTarget' would be
 * parsed to {path: filePath, name: MyTarget}.
 * Returns null if target cannot be parsed from given arguments.
 */
async function parseTarget(
  match: Array<?string>,
  filePath: ?string,
  buckProject: BuckProject,
): Promise<?Target> {
  if (!match || !filePath) {
    return null;
  }

  let path;
  const fullTarget = match[1];
  if (fullTarget) {
    // Strip off the leading slashes from the fully-qualified build target.
    const basePath = fullTarget.substring('//'.length);
    const buckRoot = await buckProject.getPath();
    path = require('nuclide-remote-uri').join(buckRoot, basePath, 'BUCK');
  } else {
    // filePath is already an absolute path.
    path = filePath;
  }
  const name = match[2];
  if (!name) {
    return null;
  }
  return {path, name};
}

/**
 * Takes a target as an argument.
 * Returns a Promise that resolves to a target location.
 * If the exact position the target in the file cannot be determined
 * position property of the target location will be set to null.
 * If `target.path` file cannot be found or read, Promise resolves to null.
 */
async function findTargetLocation(target: Target): Promise {
  let data;
  try {
    data = await fsPromise.readFile(target.path, 'utf-8');
  } catch (e) {
    return null;
  }

  // We split the file content into lines and look for the line that looks
  // like "name = '#{target.name}'" ignoring whitespaces and trailling
  // comma.
  const lines = data.split('\n');
  const regex = new RegExp(
      '^\\s*' + // beginning of the line
      'name\\s*=\\s*' + // name =
      '[\'\"]' + // opening quotation mark
      escapeRegExp(target.name) + // target name
      '[\'\"]' + // closing quotation mark
      ',?$' // optional trailling comma
  );

  let lineIndex = 0;
  lines.forEach((line, i) => {
    if (regex.test(line)) {
      lineIndex = i;
    }
  });

  return {path: target.path, line: lineIndex, column: 0};
}

module.exports = {
  priority: 50,
  providerName: 'nuclide-buck-files',
  async getSuggestion(textEditor: TextEditor, position: Point): Promise<mixed> {
    const absolutePath = textEditor.getPath();
    if (!absolutePath) {
      return null;
    }

    if (!isBuckFile(absolutePath)) {
      return null;
    }

    const buckProject = await buckProjectRootForPath(absolutePath);
    if (!buckProject) {
      return null;
    }

    const wordMatchAndRange = extractWordAtPosition(textEditor, position, targetRegex);
    if (!wordMatchAndRange) {
      return null;
    }
    const {wordMatch, range} = wordMatchAndRange;

    const target = await parseTarget(wordMatch, absolutePath, buckProject);
    if (!target) {
      return null;
    }
    const location = await findTargetLocation(target);
    if (location) {
      return {
        range,
        callback() { goToLocation(location.path, location.line, location.column); },
      };
    } else {
      return null;
    }
  },
  parseTarget,
  findTargetLocation,
};
