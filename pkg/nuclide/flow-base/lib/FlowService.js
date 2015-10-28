'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

// Diagnostic information, returned from findDiagnostics.
export type Diagnostics = {
  // The location of the .flowconfig where these messages came from.
  flowRoot: NuclideUri,
  messages: Array<Diagnostic>,
};

/*
 * Each error or warning can consist of any number of different messages from
 * Flow to help explain the problem and point to different locations that may be
 * of interest.
 */
export type Diagnostic = Array<SingleMessage>;

export type SingleMessage = {
  path: ?NuclideUri;
  descr: string;
  line: number;
  endline: number;
  start: number;
  end: number;
}

import type {NuclideUri} from 'nuclide-remote-uri';

export type Loc = {
  file: NuclideUri;
  line: number;
  column: number;
}

import {filter} from 'fuzzaldrin';

var logger = require('nuclide-logging').getLogger();
import {
  insertAutocompleteToken,
  processAutocompleteItem,
  findFlowConfigDir,
} from './FlowHelpers.js';

import {execFlow, dispose as disposeExecutor} from './FlowExecutor';

export function dispose(): void {
  disposeExecutor();
}

export async function flowFindDefinition(
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
    var result = await execFlow(args, options, file);
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
export async function flowFindDiagnostics(
  file: NuclideUri,
  currentContents: ?string
): Promise<?Diagnostics> {
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
  var flowResultPromise = execFlow(args, options, file);
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

export async function flowGetAutocompleteSuggestions(
  file: NuclideUri,
  currentContents: string,
  line: number,
  column: number,
  prefix: string,
  activatedManually: boolean,
): Promise<any> {
  // We may want to make this configurable, but if it is ever higher than one we need to make sure
  // it works properly when the user manually activates it (e.g. with ctrl+space). See
  // https://github.com/atom/autocomplete-plus/issues/597
  //
  // If this is made configurable, consider using autocomplete-plus' minimumWordLength setting, as
  // per https://github.com/atom/autocomplete-plus/issues/594
  const minimumPrefixLength = 1;

  // Allows completions to immediately appear when we are completing off of object properties. This
  // also needs to be changed if minimumPrefixLength goes above 1, since after you type a single
  // alphanumeric character, autocomplete-plus no longer includes the dot in the prefix.
  const prefixHasDot = prefix.indexOf('.') !== -1;

  // If it is just whitespace and punctuation, ignore it (this keeps us
  // from eating leading dots).
  const replacementPrefix = /^[\s.]*$/.test(prefix) ? '' : prefix;

  if (!activatedManually && !prefixHasDot && replacementPrefix.length < minimumPrefixLength) {
    return [];
  }

  var options = {};

  var args = ['autocomplete', '--json', file];

  options.stdin = insertAutocompleteToken(currentContents, line, column);
  try {
    var result = await execFlow(args, options, file);
    if (!result) {
      return [];
    }
    if (result.exitCode === 0) {
      var json = JSON.parse(result.stdout);
      var candidates = json.map(item => processAutocompleteItem(replacementPrefix, item));
      return filter(candidates, replacementPrefix, { key: 'displayText' });
    } else {
      return [];
    }
  } catch (_) {
    return [];
  }
}

export async function flowGetType(
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
    var result = await execFlow(args, options, file);
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
