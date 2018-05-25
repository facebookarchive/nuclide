'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseTarget = parseTarget;
exports.findTargetLocation = findTargetLocation;
exports.getSuggestion = getSuggestion;
exports.resolveLoadTargetPath = resolveLoadTargetPath;

var _nuclideBuckBase;

function _load_nuclideBuckBase() {
  return _nuclideBuckBase = require('../../nuclide-buck-base');
}

var _buildFiles;

function _load_buildFiles() {
  return _buildFiles = require('./buildFiles');
}

var _range;

function _load_range() {
  return _range = require('../../../modules/nuclide-commons-atom/range');
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _goToLocation;

function _load_goToLocation() {
  return _goToLocation = require('../../../modules/nuclide-commons-atom/go-to-location');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _escapeStringRegexp;

function _load_escapeStringRegexp() {
  return _escapeStringRegexp = _interopRequireDefault(require('escape-string-regexp'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
async function parseTarget(match, filePath, buckRoot) {
  // flowlint-next-line sketchy-null-string:off
  if (!match || !filePath) {
    return null;
  }

  let path;
  const fullTarget = match[1];
  // flowlint-next-line sketchy-null-string:off
  if (fullTarget) {
    // Strip off the leading slashes from the fully-qualified build target.
    const basePath = fullTarget.substring('//'.length);

    const buildFileName = await (0, (_buildFiles || _load_buildFiles()).getBuildFileName)(buckRoot);
    path = (_nuclideUri || _load_nuclideUri()).default.join(buckRoot, basePath, buildFileName);
  } else {
    // filePath is already an absolute path.
    path = filePath;
  }
  const name = match[2];
  // flowlint-next-line sketchy-null-string:off
  if (!name) {
    return null;
  }
  return { path, name };
}

/**
 * Takes a target as an argument.
 * Returns a Promise that resolves to a target location.
 * If the exact position the target in the file cannot be determined
 * position property of the target location will be set to null.
 * If `target.path` file cannot be found or read, Promise resolves to null.
 */
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

async function findTargetLocation(target) {
  let data;
  try {
    const fs = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getFileSystemServiceByNuclideUri)(target.path);
    data = (await fs.readFile(target.path)).toString('utf8');
  } catch (e) {
    return null;
  }

  // We split the file content into lines and look for the line that looks
  // like "name = '#{target.name}'" ignoring whitespaces and trailling
  // comma.
  const lines = data.split('\n');
  const regex = new RegExp('^\\s*' + // beginning of the line
  'name\\s*=\\s*' + // name =
  '[\'"]' + // opening quotation mark
  (0, (_escapeStringRegexp || _load_escapeStringRegexp()).default)(target.name) + // target name
  '[\'"]' + // closing quotation mark
  ',?$');

  let lineIndex = 0;
  lines.forEach((line, i) => {
    if (regex.test(line)) {
      lineIndex = i;
    }
  });

  return { path: target.path, line: lineIndex, column: 0 };
}

const VALID_BUILD_FILE_NAMES = new Set(['BUCK', 'BUCK.autodeps', 'TARGETS']);
const VALID_BUILD_FILE_EXTENSIONS = new Set(['.bzl']);

async function getSuggestion(textEditor, position) {
  const absolutePath = textEditor.getPath();
  if (absolutePath == null) {
    return null;
  }

  const baseName = (_nuclideUri || _load_nuclideUri()).default.basename(absolutePath);
  if (!VALID_BUILD_FILE_NAMES.has(baseName) && !VALID_BUILD_FILE_EXTENSIONS.has((_nuclideUri || _load_nuclideUri()).default.extname(baseName))) {
    return null;
  }

  const buckRoot = await (0, (_nuclideBuckBase || _load_nuclideBuckBase()).getBuckProjectRoot)(absolutePath);
  // flowlint-next-line sketchy-null-string:off
  if (!buckRoot) {
    return null;
  }

  const results = await Promise.all([
  // look for load targets first since they are more specific
  findLoadTarget(textEditor, position, absolutePath, buckRoot), findBuildTarget(textEditor, position, absolutePath, buckRoot), findRelativeFilePath(textEditor, position, (_nuclideUri || _load_nuclideUri()).default.dirname(absolutePath))]);
  const hyperclickMatch = results.find(x => x != null);

  if (hyperclickMatch != null) {
    const match = hyperclickMatch;
    return {
      range: match.range,
      callback() {
        (0, (_goToLocation || _load_goToLocation()).goToLocation)(match.path, { line: match.line, column: match.column });
      }
    };
  } else {
    return null;
  }
}

const TARGET_REGEX = /(\/(?:\/[\w.-]*)*){0,1}:([\w.-]+)/;

/**
 * @return HyperclickMatch if (textEditor, position) identifies a build target.
 */
async function findBuildTarget(textEditor, position, absolutePath, buckRoot) {
  const wordMatchAndRange = (0, (_range || _load_range()).wordAtPosition)(textEditor, position, TARGET_REGEX);
  if (wordMatchAndRange == null) {
    return null;
  }
  const { wordMatch, range } = wordMatchAndRange;

  const target = await parseTarget(wordMatch, absolutePath, buckRoot);
  if (target == null) {
    return null;
  }

  const location = await findTargetLocation(target);
  if (location != null) {
    return Object.assign({}, location, { range });
  } else {
    return null;
  }
}

// matches "@cell//pkg/subpkg:ext.bzl" as (cell, package and target name)
const LOAD_REGEX = /(@[\w-]+)?\/\/([\w.\-/]*):([\w.-]+\.bzl)/;

/**
 * @return HyperclickMatch if (textEditor, position) identifies a load target.
 */
async function findLoadTarget(textEditor, position, absolutePath, buckRoot) {
  const loadMatchAndRange = (0, (_range || _load_range()).wordAtPosition)(textEditor, position, LOAD_REGEX);
  if (loadMatchAndRange == null) {
    return null;
  }
  const { wordMatch, range } = loadMatchAndRange;
  const path = await resolveLoadTargetPath(wordMatch, buckRoot);
  const location = { path, line: 0, column: 0 };
  return Object.assign({}, location, { range });
}

/**
 * Resolves a load target regex match into a referenced .bzl file path.
 * For example, input match
 * ['@cell//pkg/subpkg:ext.bzl', '@cell', '//pkg/subpkg', 'ext.bzl'] would be
 * resolved to "$buckRoot/cell/pkg/subpkg/ext.bzl".
 */
async function resolveLoadTargetPath(wordMatch, buckRoot) {
  const cellName = wordMatch[1] ? wordMatch[1].substring('@'.length) : wordMatch[1];
  const cellLocation = cellName ? await (0, (_buildFiles || _load_buildFiles()).getCellLocation)(buckRoot, cellName) : ''; // resolve relative to buck root in case cell is not specified
  const packagePath = wordMatch[2];
  const filePath = wordMatch[3];
  const path = (_nuclideUri || _load_nuclideUri()).default.join(buckRoot, cellLocation, packagePath, filePath);
  return path;
}

const RELATIVE_FILE_PATH_REGEX = /(['"])(.*)(['"])/;

/**
 * @return HyperclickMatch if (textEditor, position) identifies a file path that resolves to a file
 *   under the specified directory.
 */
async function findRelativeFilePath(textEditor, position, directory) {
  const wordMatchAndRange = (0, (_range || _load_range()).wordAtPosition)(textEditor, position, RELATIVE_FILE_PATH_REGEX);
  if (!wordMatchAndRange) {
    return null;
  }
  const { wordMatch, range } = wordMatchAndRange;

  // Make sure that the quotes match up.
  if (wordMatch[1] !== wordMatch[3]) {
    return null;
  }

  const potentialPath = (_nuclideUri || _load_nuclideUri()).default.join(directory, wordMatch[2]);
  let stat;
  try {
    const fs = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getFileSystemServiceByNuclideUri)(potentialPath);
    stat = await fs.stat(potentialPath);
  } catch (e) {
    return null;
  }

  if (stat.isFile()) {
    return {
      path: potentialPath,
      line: 0,
      column: 0,
      range
    };
  } else {
    return null;
  }
}