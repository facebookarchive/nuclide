'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var logger = require('nuclide-logging').getLogger();

async function findDiagnostics(textEditor: TextEditor): Promise {
  var pathToFile = textEditor.getPath();
  if (require('nuclide-remote-uri').isRemote(pathToFile)) {
    // TODO(7445851): Enable remote linting.
    return [];
  }

  var {findArcConfigDirectory} = require('nuclide-arcanist-client');
  var cwd = await findArcConfigDirectory(pathToFile);
  if (cwd === null) {
    return [];
  }

  var args = ['lint', '--output', 'json', pathToFile];
  var options = {'cwd': cwd};
  var {asyncExecute} = require('nuclide-commons');
  var result = await asyncExecute('arc', args, options);

  var json;
  try {
    json = JSON.parse(result.stdout);
  } catch (error) {
    logger.error('Error parsing `arc lint` JSON output', result.stdout);
    return [];
  }

  // json is an object where the keys are file paths that are relative to the
  // location of the .arcconfig file. There will be an entry in the map for
  // the file even if there were no lint errors.
  var key = require('path').relative(cwd, pathToFile);
  var lints = json[key];

  // TODO(7876450): For some reason, this does not work for particular values of
  // pathToFile.
  //
  // For now, we defend against this by returning the empty array.
  if (!lints) {
    return [];
  }

  var {Range} = require('atom');
  return lints.map((lint) => {
    // Choose an appropriate level based on lint['severity'].
    var severity = lint['severity'];
    var level = severity === 'error' ? 'Error' : 'Warning';

    var line = lint['line'];
    // Sometimes the linter puts in global errors on line 0, which will result
    // in a negative index. We offset those back to the first line.
    var col = Math.max(0, lint['char'] - 1);
    var rangeRow = Math.max(0, line - 1);
    var range = new Range(
      [rangeRow, col],
      [rangeRow, textEditor.getBuffer().lineLengthForRow(rangeRow)]
    );

    return {
      type: level,
      text: lint['description'],
      filePath: pathToFile,
      range: range,
    };
  });
}

module.exports = {
  // Workaround for https://github.com/AtomLinter/Linter/issues/248.
  grammarScopes: atom.grammars.getGrammars().map(grammar => grammar.scopeName),
  providerName: 'Arc',
  scope: 'file',
  lintOnFly: false,
  lint(textEditor: TextEditor): Promise<Array<Object>> {
    var filePath = textEditor.getPath();
    if (!filePath || require('nuclide-remote-uri').isRemote(filePath)) {
      return Promise.resolve([]);
    }
    try {
      return findDiagnostics(textEditor);
    } catch (error) {
      return Promise.resolve([]);
    }
  },
};
