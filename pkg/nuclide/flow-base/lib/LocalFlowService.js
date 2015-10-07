'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Diagnostics} from './FlowService';
import type {NuclideUri} from 'nuclide-remote-uri';

type Loc = {
  file: NuclideUri;
  line: number;
  column: number;
}

import {filter} from 'fuzzaldrin';

var {asyncExecute, safeSpawn} = require('nuclide-commons');
var {assign} = require('nuclide-commons').object;
var logger = require('nuclide-logging').getLogger();
var FlowService = require('./FlowService');
import {
  getPathToFlow,
  getFlowExecOptions,
  insertAutocompleteToken,
  processAutocompleteItem,
  findFlowConfigDir,
} from './FlowHelpers.js';

class LocalFlowService extends FlowService {
  // The set of Flow server processes we have started, so we can kill them on
  // teardown
  _startedServers: Set<child_process$ChildProcess>;
  // The set of roots for which we have observed a Flow crash. If Flow crashes,
  // we don't want to keep restarting Flow servers. We also don't want to
  // disable Flow globally if only a specific Flow root in the project causes a
  // crash.
  _failedRoots: Set<string>;

  constructor() {
    super();
    this._startedServers = new Set();
    this._failedRoots = new Set();
  }

  async dispose(): Promise<void> {
    for (var server of this._startedServers) {
      // The default, SIGTERM, does not reliably kill the flow servers.
      server.kill('SIGKILL');
    }
  }

  /**
   * Returns null if it is unsafe to run Flow (i.e. if it is not installed or if
   * no .flowconfig file can be found).
   */
  async _execFlow(args: Array<any>, options: Object, file: string): Promise<?Object> {
    var maxTries = 5;
    var flowOptions = await getFlowExecOptions(file);
    if (!flowOptions) {
      return null;
    }
    var root = flowOptions.cwd;
    var localOptions = assign({}, options, flowOptions);
    if (this._failedRoots.has(root)) {
      return null;
    }
    args.push('--no-auto-start');
    args.push('--from', 'nuclide');
    var pathToFlow = getPathToFlow();
    for (var i = 0; ; i++) {
      try {
        var result = await asyncExecute(pathToFlow, args, localOptions);
        return result;
      } catch (e) {
        if (i >= maxTries) {
          throw e;
        }
        if (/There is no [fF]low server running/.test(e.stderr)) {
          // `flow server` will start a server in the foreground. asyncExecute
          // will not resolve the promise until the process exits, which in this
          // case is never. We need to use spawn directly to get access to the
          // ChildProcess object.
          var serverProcess = await safeSpawn(pathToFlow, ['server', root]);
          var logIt = data => {
            logger.debug('flow server: ' + data);
          };
          serverProcess.stdout.on('data', logIt);
          serverProcess.stderr.on('data', logIt);
          serverProcess.on('exit', (code, signal) => {
            // We only want to blacklist this root if the Flow processes
            // actually failed, rather than being killed manually. It seems that
            // if they are killed, the code is null and the signal is 'SIGTERM'.
            // In the Flow crashes I have observed, the code is 2 and the signal
            // is null. So, let's blacklist conservatively for now and we can
            // add cases later if we observe Flow crashes that do not fit this
            // pattern.
            if (code === 2 && signal === null) {
              logger.error('Flow server unexpectedly exited', root);
              this._failedRoots.add(root);
            }
          });
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
    var options = {};
    // We pass the current contents of the buffer to Flow via stdin.
    // This makes it possible for get-def to operate on the unsaved content in
    // the user's editor rather than what is saved on disk. It would be annoying
    // if the user had to save before using the jump-to-definition feature to
    // ensure he or she got accurate results.
    options.stdin = currentContents;

    var args = ['get-def', '--json', '--path', file, line, column];
    try {
      var result = await this._execFlow(args, options, file);
      if (!result) {
        return null;
      }
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
    } catch(e) {
      logger.error(e.stderr);
      return null;
    }
  }

  /**
   * If currentContents is null, it means that the file has not changed since
   * it has been saved, so we can avoid piping the whole contents to the Flow
   * process.
   */
  async findDiagnostics(file: NuclideUri, currentContents: ?string): Promise<?Diagnostics> {
    var options = {};

    var args;
    if (currentContents) {
      options.stdin = currentContents;

      // Currently, `flow check-contents` returns all of the errors in the
      // project. It would be nice if it would use the path for filtering, as
      // currently the client has to do the filtering.
      args = ['check-contents', '--json', file];
    } else {
      // We can just use `flow status` if the contents are unchanged.
      args = ['status', '--json', file];
    }

    var result;

    // Dispatch both of these requests so they happen in parallel.
    var flowResultPromise = this._execFlow(args, options, file);
    var flowRootPromise = findFlowConfigDir(file);
    try {
      result = await flowResultPromise;
      if (!result) {
        return null;
      }
    } catch (e) {
      // This codepath will be exercised when Flow finds type errors as the
      // exit code will be non-zero. Note this codepath could also be exercised
      // due to a logical error in Nuclide, so we try to differentiate.
      if (e.exitCode !== undefined) {
        result = e;
      } else {
        logger.error(e);
        return null;
      }
    }
    var flowRoot = await flowRootPromise;
    if (!flowRoot) {
      logger.error('Got a Flow result but did not find a flow config path');
      return null;
    }

    var json;
    try {
      json = JSON.parse(result.stdout);
    } catch (e) {
      logger.error(e);
      return null;
    }

    return {
      flowRoot,
      messages: json['errors'].map(diagnostic => {
        const message = diagnostic['message'];
        // `message` is a list of message components
        message.forEach(component => {
          if (!component.path) {
            // Use a consistent 'falsy' value for the empty string, undefined, etc. Flow returns the
            // empty string instead of null when there is no relevant path.
            // TODO(t8644340) Remove this when Flow is fixed.
            component.path = null;
          }
        });
        return message;
      }),
    };
  }

  async getAutocompleteSuggestions(
    file: NuclideUri,
    currentContents: string,
    line: number,
    column: number,
    prefix: string
  ): Promise<any> {
    var options = {};

    var args = ['autocomplete', '--json', file];

    options.stdin = insertAutocompleteToken(currentContents, line, column);
    try {
      var result = await this._execFlow(args, options, file);
      if (!result) {
        return [];
      }
      if (result.exitCode === 0) {
        var json = JSON.parse(result.stdout);
        // If it is just whitespace and punctuation, ignore it (this keeps us
        // from eating leading dots).
        var replacementPrefix = /^[\s.]*$/.test(prefix) ? '' : prefix;
        var candidates = json.map(item => processAutocompleteItem(replacementPrefix, item));
        return filter(candidates, replacementPrefix, { key: 'displayText' });
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
    column: number,
    includeRawType: boolean,
  ): Promise<?{type: string, rawType?: string}> {
    var options = {};

    options.stdin = currentContents;

    line = line + 1;
    column = column + 1;
    var args = ['type-at-pos', '--json', '--path', file, line, column];
    if (includeRawType) {
      args.push('--raw');
    }

    var output;
    try {
      var result = await this._execFlow(args, options, file);
      if (!result) {
        return null;
      }
      output = result.stdout;
      if (output === '') {
        // if there is a syntax error, Flow returns the JSON on stderr while
        // still returning a 0 exit code (t8018595)
        output = result.stderr;
      }
    } catch (e) {
      logger.error('flow type-at-pos failed: ' + file + ':' + line + ':' + column, e);
      return null;
    }
    var json;
    try {
      json = JSON.parse(output);
    } catch (e) {
      logger.error('invalid JSON from flow type-at-pos: ' + e);
      return null;
    }
    var type = json['type'];
    var rawType = json['raw_type'];
    if (!type || type === '(unknown)' || type === '') {
      if (type === '') {
        // This should not happen. The Flow team believes it's an error in Flow
        // if it does. I'm leaving the condition here because it used to happen
        // before the switch to JSON and I'd rather log something than have the
        // user experience regress in case I'm wrong.
        logger.error('Received empty type hint from `flow type-at-pos`');
      }
      return null;
    }
    return {type, rawType};
  }
}

module.exports = LocalFlowService;
