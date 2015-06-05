'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {asyncExecute, findNearestFile, getConfigValueAsync} = require('nuclide-commons');
var logger = require('nuclide-logging').getLogger();
var path = require('path');
var FlowService = require('./FlowService');

/**
 * If this returns null, then it is not safe to run flow.
 */
async function getFlowExecOptions(file: string): Promise<?mixed> {
  var flowConfigDirectory = await findNearestFile('.flowconfig', path.dirname(file));
  if (flowConfigDirectory) {
    return {
      cwd: flowConfigDirectory,
    };
  } else {
    return null;
  }
}

function insertAutocompleteToken(contents: string, line: number, col: number) {
  var lines = contents.split('\n');
  var theLine = lines[line];
  theLine = theLine.substring(0, col) + 'AUTO332' + theLine.substring(col);
  lines[line] = theLine;
  return lines.join('\n');
}

class LocalFlowService extends FlowService {
  _getPathToFlow(): Promise<string> {
    if (global.atom) {
      return getConfigValueAsync('nuclide-flow.pathToFlow')();
    } else {
      return Promise.resolve('flow');
    }
  }

  async findDefinition(
    file: NuclideUri,
    currentContents: string,
    line: number,
    column: number
  ): Promise<?{file:NuclideUri; line:number; column:number}> {
    var options = await getFlowExecOptions(file);
    if (!options) {
      return null;
    }

    // We pass the current contents of the buffer to Flow via stdin.
    // This makes it possible for get-def to operate on the unsaved content in
    // the user's editor rather than what is saved on disk. It would be annoying
    // if the user had to save before using the jump-to-definition feature to
    // ensure he or she got accurate results.
    options.stdin = currentContents;

    var pathToFlow = await this._getPathToFlow();
    var args = ['get-def', '--json', '--path', file, line, column];
    var result = await asyncExecute(pathToFlow, args, options);
    if (result.exitCode === 0) {
      var json = JSON.parse(result.stdout);
      if (json['path']) {
        return {
          file: json['path'],
          line: json['line'] - 1,
          column: json['start'] - 1,
        };
      } else {
        return null;
      }
    } else {
      logger.error(result.stderr);
      return null;
    }
  }

  async findDiagnostics(file: NuclideUri): Promise<mixed> {
    var options = await getFlowExecOptions(file);
    if (!options) {
      return [];
    }

    var pathToFlow = await this._getPathToFlow();

    // Currently, `flow status` does not take the path of a file to check.
    // It would be nice if it would take the path and use it for filtering,
    // as currently the client has to do the filtering.
    //
    // TODO(mbolin): Have `flow status` have the option to read a file from
    // stdin and have its path specified by --path as `flow get-def` does.
    // Then Flow could use the current contents of editor instead of what was
    // most recently saved.
    var args = ['status', '--json'];

    var result;
    try {
      result = await asyncExecute(pathToFlow, args, options);
    } catch (e) {
      // This codepath will be exercised when Flow finds type errors as the
      // exit code will be non-zero. Note this codepath could also be exercised
      // due to a logical error in Nuclide, so we try to differentiate.
      if (e.exitCode !== undefined) {
        result = e;
      } else {
        logger.error(e);
        return [];
      }
    }

    var json;
    try {
      json = JSON.parse(result.stdout);
    } catch (e) {
      logger.error(e);
      return [];
    }

    return json['errors'];
  }

  async getAutocompleteSuggestions(
    file: NuclideUri,
    currentContents: string,
    line: number,
    column: number,
    prefix: string
  ): Promise<mixed> {
    var options = await getFlowExecOptions(file);
    if (!options) {
      return [];
    }

    var args = ['autocomplete', '--json', file];

    options.stdin = insertAutocompleteToken(currentContents, line, column);
    var pathToFlow = await this._getPathToFlow();
    var result = await asyncExecute(pathToFlow, args, options);
    if (result.exitCode === 0) {
      var json = JSON.parse(result.stdout);
      var replacementPrefix = /^\s*$/.test(prefix) ? '' : prefix;
      return json.map(item => {
        return {
          text: item['name'],
          rightLabel: item['type'],
          replacementPrefix,
        };
      });
    } else {
      return [];
    }
  }
}

module.exports = LocalFlowService;
