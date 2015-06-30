'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Diagnostic} from './FlowService';
import type {NuclideUri} from 'nuclide-remote-uri';

type Loc = {
  file: NuclideUri;
  line: number;
  column: number;
}

var {asyncExecute, safeSpawn, findNearestFile, getConfigValueAsync} = require('nuclide-commons');
var logger = require('nuclide-logging').getLogger();
var FlowService = require('./FlowService');
var {getPathToFlow, getFlowExecOptions, insertAutocompleteToken} = require('./FlowHelpers.js');

class LocalFlowService extends FlowService {
  _startedServers: Set<ChildProcess>;

  constructor() {
    super();
    this._startedServers = new Set();
  }

  async dispose(): Promise<void> {
    for (var server of this._startedServers) {
      // The default, SIGTERM, does not reliably kill the flow servers.
      server.kill('SIGKILL');
    }
  }

  async _execFlow(args: Array<any>, options: Object): Promise<Object> {
    var maxTries = 5;
    args.push("--no-auto-start");
    var pathToFlow = await getPathToFlow();
    for (var i = 0; ; i++) {
      try {
        var result = await asyncExecute(pathToFlow, args, options);
        return result;
      } catch (e) {
        if (i >= maxTries) {
          throw e;
        }
        if (e.stderr.match("There is no flow server running")) {
          // the flow root (where .flowconfig exists) conveniently appears in
          // the error message enclosed in single quotes.
          var root = e.stderr.match(/'[^']*'/)[0].replace(/'/g, '');
          // `flow server` will start a server in the foreground. asyncExecute
          // will not resolve the promise until the process exits, which in this
          // case is never. We need to use spawn directly to get access to the
          // ChildProcess object.
          var serverProcess = safeSpawn(pathToFlow, ['server', root]);
          var logIt = data => {
            logger.debug('flow server: ' + data);
          };
          serverProcess.stdout.on('data', logIt);
          serverProcess.stderr.on('data', logIt);
          this._startedServers.add(serverProcess);
        } else {
          // not sure what happened, but we'll let the caller deal with it
          throw e;
        }
        // try again
      }
    }
    // otherwise flow complains
    return {};
  }

  async findDefinition(
    file: NuclideUri,
    currentContents: string,
    line: number,
    column: number
  ): Promise<?Loc> {
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

    var args = ['get-def', '--json', '--path', file, line, column];
    try {
      var result = await this._execFlow(args, options);
      if (result.exitCode === 0) {
        var json = JSON.parse(result.stdout);
        if (json['path']) {
          // t7492048
          return ({
            file: json['path'],
            line: json['line'] - 1,
            column: json['start'] - 1,
          } : ?Loc);
        } else {
          return null;
        }
      } else {
        logger.error(result.stderr);
        return null;
      }
    } catch(e) {
      logger.error(e.stderr);
      return null;
    }
  }

  async findDiagnostics(file: NuclideUri): Promise<Array<Diagnostic>> {
    var options = await getFlowExecOptions(file);
    if (!options) {
      return [];
    }

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
      result = await this._execFlow(args, options);
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
  ): Promise<any> {
    var options = await getFlowExecOptions(file);
    if (!options) {
      return [];
    }

    var args = ['autocomplete', '--json', file];

    options.stdin = insertAutocompleteToken(currentContents, line, column);
    try {
      var result = await this._execFlow(args, options);
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
    } catch (_) {
      return [];
    }
  }

  async getType(
    file: NuclideUri,
    currentContents: string,
    line: number,
    column: number
  ): Promise<?string> {
    var options = await getFlowExecOptions(file);
    if (!options) {
      return null;
    }

    options.stdin = currentContents;

    line = line + 1;
    column = column + 1;
    var args = ['type-at-pos', line, column];

    var output;
    try {
      var result = await this._execFlow(args, options);
      output = result.stdout;
    } catch (e) {
      logger.error('flow type-at-pos failed: ' + file + ':' + line + ':' + column, e);
      return null;
    }
    // instead of returning a nonzero exit code, or saying that the type is
    // "(unknown)", Flow sometimes just prints a message that includes the
    // string "Failure" at the beginning of the second line.
    if (output.match(/\nFailure/)) {
      return null;
    }
    // the type appears by itself on the first line.
    var type = output.split('\n')[0];
    if (type === '(unknown)' || type === '') {
      return null;
    }
    return type;
  }
}

module.exports = LocalFlowService;
