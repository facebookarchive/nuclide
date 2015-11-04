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

import type {
  Diagnostics,
  Loc,
} from './FlowService';

import {filter} from 'fuzzaldrin';


import {getLogger} from 'nuclide-logging';
const logger = getLogger();

import {
  insertAutocompleteToken,
  processAutocompleteItem,
} from './FlowHelpers.js';

import {FlowProcess} from './FlowProcess';

/** Encapsulates all of the state information we need about a specific Flow root */
export class FlowRoot {
  // The path to the directory where the .flowconfig is -- i.e. the root of the Flow project.
  _root: string;
  _process: FlowProcess;

  constructor(root: string) {
    this._root = root;
    this._process = new FlowProcess(root);
  }

  dispose(): void {
    this._process.dispose();
  }

  async flowFindDefinition(
    file: NuclideUri,
    currentContents: string,
    line: number,
    column: number,
  ): Promise<?Loc> {
    const options = {};
    // We pass the current contents of the buffer to Flow via stdin.
    // This makes it possible for get-def to operate on the unsaved content in
    // the user's editor rather than what is saved on disk. It would be annoying
    // if the user had to save before using the jump-to-definition feature to
    // ensure he or she got accurate results.
    options.stdin = currentContents;

    const args = ['get-def', '--json', '--retry-if-init', 'false', '--path', file, line, column];
    try {
      const result = await this._process.execFlow(args, options, file);
      if (!result) {
        return null;
      }
      const json = parseJSON(args, result.stdout);
      if (json['path']) {
        return {
          file: json['path'],
          line: json['line'] - 1,
          column: json['start'] - 1,
        };
      } else {
        return null;
      }
    } catch(e) {
      return null;
    }
  }

  /**
   * If currentContents is null, it means that the file has not changed since
   * it has been saved, so we can avoid piping the whole contents to the Flow
   * process.
   */
  async flowFindDiagnostics(
    file: NuclideUri,
    currentContents: ?string,
  ): Promise<?Diagnostics> {
    const options = {};

    let args;
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

    let result;

    try {
      // Don't log errors if the command returns a nonzero exit code, because status returns nonzero
      // if it is reporting any issues, even when it succeeds.
      result = await this._process.execFlow(args, options, file, /* logErrors */ false);
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

    let json;
    try {
      json = parseJSON(args, result.stdout);
    } catch (e) {
      return null;
    }

    return {
      flowRoot: this._root,
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

  async flowGetAutocompleteSuggestions(
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

    // Allows completions to immediately appear when we are completing off of object properties.
    // This also needs to be changed if minimumPrefixLength goes above 1, since after you type a
    // single alphanumeric character, autocomplete-plus no longer includes the dot in the prefix.
    const prefixHasDot = prefix.indexOf('.') !== -1;

    // If it is just whitespace and punctuation, ignore it (this keeps us
    // from eating leading dots).
    const replacementPrefix = /^[\s.]*$/.test(prefix) ? '' : prefix;

    if (!activatedManually && !prefixHasDot && replacementPrefix.length < minimumPrefixLength) {
      return [];
    }

    const options = {};

    const args = ['autocomplete', '--json', file];

    options.stdin = insertAutocompleteToken(currentContents, line, column);
    try {
      const result = await this._process.execFlow(args, options, file);
      if (!result) {
        return [];
      }
      const json = parseJSON(args, result.stdout);
      const candidates = json.map(item => processAutocompleteItem(replacementPrefix, item));
      return filter(candidates, replacementPrefix, { key: 'displayText' });
    } catch (e) {
      logger.error('flow flowGetAutocompleteSuggestions failed: ', e);
      return [];
    }
  }

  async flowGetType(
    file: NuclideUri,
    currentContents: string,
    line: number,
    column: number,
    includeRawType: boolean,
  ): Promise<?{type: string, rawType?: string}> {
    const options = {};

    options.stdin = currentContents;

    line = line + 1;
    column = column + 1;
    const args =
      ['type-at-pos', '--json', '--retry-if-init', 'false', '--path', file, line, column];
    if (includeRawType) {
      args.push('--raw');
    }

    let output;
    try {
      const result = await this._process.execFlow(args, options, file);
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
      return null;
    }
    let json;
    try {
      json = parseJSON(args, output);
    } catch (e) {
      return null;
    }
    const type = json['type'];
    const rawType = json['raw_type'];
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

function parseJSON(args: Array<any>, value: string): any {
  try {
    return JSON.parse(value);
  } catch (e) {
    logger.error(`Invalid JSON result from flow ${args.join(' ')}. JSON:\n'${value}'.`);
    throw e;
  }
}
