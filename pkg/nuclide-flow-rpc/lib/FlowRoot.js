/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {Observable} from 'rxjs';

import type {NuclideUri} from '../../commons-node/nuclideUri';
import type {Outline} from '../../nuclide-outline-view/lib/rpc-types';
import type {CoverageResult} from '../../nuclide-type-coverage/lib/rpc-types';
import type {Completion} from '../../nuclide-language-service/lib/LanguageService';

import type {ServerStatusType} from '..';
import type {FlowExecInfoContainer} from './FlowExecInfoContainer';
import type {FlowAutocompleteOutput, FlowAutocompleteItem} from './flowOutputTypes';

import type {
  Diagnostics,
  Loc,
} from '..';

import invariant from 'assert';
import {Point} from 'simple-text-buffer';

import {getReplacementPrefix} from '../../nuclide-flow-common';
import {getLogger} from '../../nuclide-logging';
const logger = getLogger();

import {flowCoordsToAtomCoords} from './FlowHelpers';

import {FlowProcess} from './FlowProcess';
import {FlowVersion} from './FlowVersion';
import prettyPrintTypes from './prettyPrintTypes';
import {astToOutline} from './astToOutline';
import {flowStatusOutputToDiagnostics} from './diagnosticsParser';

/** Encapsulates all of the state information we need about a specific Flow root */
export class FlowRoot {
  // The path to the directory where the .flowconfig is -- i.e. the root of the Flow project.
  _root: string;
  _process: FlowProcess;
  _version: FlowVersion;
  _execInfoContainer: FlowExecInfoContainer;

  constructor(root: string, execInfoContainer: FlowExecInfoContainer) {
    this._root = root;
    this._execInfoContainer = execInfoContainer;
    this._process = new FlowProcess(root, execInfoContainer);
    this._version = new FlowVersion(async () => {
      const execInfo = await execInfoContainer.getFlowExecInfo(root);
      if (!execInfo) {
        return null;
      }
      return execInfo.flowVersion;
    });
    this._process.getServerStatusUpdates()
      .filter(state => state === 'not running')
      .subscribe(() => this._version.invalidateVersion());
  }

  dispose(): void {
    this._process.dispose();
  }

  allowServerRestart(): void {
    this._process.allowServerRestart();
  }

  getPathToRoot(): string {
    return this._root;
  }

  getServerStatusUpdates(): Observable<ServerStatusType> {
    return this._process.getServerStatusUpdates();
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

    const args = ['get-def', '--json', '--path', file, line, column];
    try {
      const result = await this._process.execFlow(args, options);
      if (!result) {
        return null;
      }
      const json = parseJSON(args, result.stdout);
      if (json.path) {
        return {
          file: json.path,
          point: new Point(
            json.line - 1,
            json.start - 1,
          ),
        };
      } else {
        return null;
      }
    } catch (e) {
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
    await this._forceRecheck(file);

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
      result = await this._process.execFlow(args, options, /* waitForServer */ true);
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

    return flowStatusOutputToDiagnostics(this._root, json);
  }

  async flowGetAutocompleteSuggestions(
    file: NuclideUri,
    currentContents: string,
    position: atom$Point,
    activatedManually: ?boolean,
    prefix: string,
  ): Promise<?Array<Completion>> {
    const replacementPrefix = getReplacementPrefix(prefix);
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

    if (!activatedManually && !prefixHasDot && replacementPrefix.length < minimumPrefixLength) {
      return null;
    }

    const options = {};

    // Note that Atom coordinates are 0-indexed whereas Flow's are 1-indexed, so we must add 1.
    const args = ['autocomplete', '--json', file, position.row + 1, position.column + 1];

    options.stdin = currentContents;
    try {
      const result = await this._process.execFlow(args, options);
      if (!result) {
        return [];
      }
      const json: FlowAutocompleteOutput = parseJSON(args, result.stdout);
      const resultsArray: Array<FlowAutocompleteItem> = json.result;
      return resultsArray.map(item => processAutocompleteItem(replacementPrefix, item));
    } catch (e) {
      return [];
    }
  }

  async flowGetType(
    file: NuclideUri,
    currentContents: string,
    line_: number,
    column_: number,
  ): Promise<?string> {
    let line = line_;
    let column = column_;
    const options = {};

    options.stdin = currentContents;

    line++;
    column++;
    const args =
      ['type-at-pos', '--json', '--path', file, line, column];

    let result;
    try {
      result = await this._process.execFlow(args, options);
    } catch (e) {
      result = null;
    }
    if (!result) {
      return null;
    }
    const output = result.stdout;

    let json;
    try {
      json = parseJSON(args, output);
    } catch (e) {
      return null;
    }
    const type = json.type;
    if (!type || type === '(unknown)') {
      return null;
    }
    try {
      return prettyPrintTypes(type);
    } catch (e) {
      logger.error(`Problem pretty printing type hint: ${e.message}`);
      return type;
    }
  }

  async flowGetCoverage(path: NuclideUri): Promise<?CoverageResult> {
    const args = ['coverage', '--json', path];
    let result;
    try {
      result = await this._process.execFlow(args, {});
    } catch (e) {
      return null;
    }
    if (result == null) {
      return null;
    }
    let json;
    try {
      json = parseJSON(args, result.stdout);
    } catch (e) {
      // The error is already logged in parseJSON
      return null;
    }

    const expressions = json.expressions;

    const uncoveredCount = expressions.uncovered_count;
    const coveredCount = expressions.covered_count;
    const totalCount = uncoveredCount + coveredCount;

    const uncoveredRegions = expressions.uncovered_locs
      .map(flowCoordsToAtomCoords)
      .map(range => ({range}));

    return {
      percentage: totalCount === 0 ? 100 : coveredCount / totalCount * 100,
      uncoveredRegions,
    };
  }

  async _forceRecheck(file: string): Promise<boolean> {
    try {
      await this._process.execFlow(
        ['force-recheck', file],
        /* options */ {},
        // Make an attempt to force a recheck, but if the server is busy don't insist.
        /* waitsForServer */ false,
        /* suppressErrors */ true,
      );
      return true;
    } catch (e) {
      // This command was introduced in Flow v0.23, so silently swallow errors to avoid logspam on
      // earlier versions, until we want to break support for earlier version.
      return false;
    }
  }

  // This static function takes an optional FlowRoot instance so that *if* it is part of a Flow
  // root, it can use the appropriate flow-bin installation (which may be the only Flow
  // installation) but if it lives outside of a Flow root, outlining still works using the system
  // Flow.
  static async flowGetOutline(
    root: ?FlowRoot,
    currentContents: string,
    execInfoContainer: FlowExecInfoContainer,
  ): Promise<?Outline> {
    const json = await FlowRoot.flowGetAst(root, currentContents, execInfoContainer);

    try {
      return json ? astToOutline(json) : null;
    } catch (e) {
      // Traversing the AST is an error-prone process and it's hard to be sure we've handled all the
      // cases. Fail gracefully if it does not work.
      logger.error(e);
      return null;
    }
  }

  static async flowGetAst(
    root: ?FlowRoot,
    currentContents: string,
    execInfoContainer: FlowExecInfoContainer,
  ): Promise<any> {
    const options = {
      stdin: currentContents,
    };

    const flowRootPath = root == null ? null : root.getPathToRoot();

    const args = ['ast'];

    let json;
    try {
      const result = await FlowProcess.execFlowClient(
        args,
        flowRootPath,
        execInfoContainer,
        options,
      );
      if (result == null) {
        return null;
      }
      json = parseJSON(args, result.stdout);
    } catch (e) {
      logger.warn(e);
      return null;
    }
    return json;
  }
}

function parseJSON(args: Array<any>, value: string): any {
  try {
    return JSON.parse(value);
  } catch (e) {
    logger.warn(`Invalid JSON result from flow ${args.join(' ')}. JSON:\n'${value}'.`);
    throw e;
  }
}

/**
 * Takes an autocomplete item from Flow and returns a valid autocomplete-plus
 * response, as documented here:
 * https://github.com/atom/autocomplete-plus/wiki/Provider-API
 */
export function processAutocompleteItem(
  replacementPrefix: string,
  flowItem: FlowAutocompleteItem,
): atom$AutocompleteSuggestion {
  // Truncate long types for readability
  const description = flowItem.type.length < 80
    ? flowItem.type
    : flowItem.type.substring(0, 80) + ' ...';
  let result = {
    description,
    displayText: flowItem.name,
    replacementPrefix,
  };
  const funcDetails = flowItem.func_details;
  if (funcDetails) {
    // The parameters in human-readable form for use on the right label.
    const rightParamStrings = funcDetails.params
      .map(param => `${param.name}: ${param.type}`);
    const snippetString = getSnippetString(funcDetails.params.map(param => param.name));
    result = {
      ...result,
      leftLabel: funcDetails.return_type,
      rightLabel: `(${rightParamStrings.join(', ')})`,
      snippet: `${flowItem.name}(${snippetString})`,
      type: 'function',
    };
  } else {
    result = {
      ...result,
      rightLabel: flowItem.type,
      text: flowItem.name,
    };
  }
  return result;
}

function getSnippetString(paramNames: Array<string>): string {
  const groupedParams = groupParamNames(paramNames);
  // The parameters turned into snippet strings.
  const snippetParamStrings = groupedParams
    .map(params => params.join(', '))
    .map((param, i) => `\${${i + 1}:${param}}`);
  return snippetParamStrings.join(', ');
}

/**
 * Group the parameter names so that all of the trailing optional parameters are together with the
 * last non-optional parameter. That makes it easy to ignore the optional parameters, since they
 * will be selected along with the last non-optional parameter and you can just type to overwrite
 * them.
 */
 // Exported for testing
export function groupParamNames(paramNames: Array<string>): Array<Array<string>> {
  // Split the parameters into two groups -- all of the trailing optional paramaters, and the rest
  // of the parameters. Trailing optional means all optional parameters that have only optional
  // parameters after them.
  const [ordinaryParams, trailingOptional] =
    paramNames.reduceRight(([ordinary, optional], param) => {
      // If there have only been optional params so far, and this one is optional, add it to the
      // list of trailing optional params.
      if (isOptional(param) && ordinary.length === 0) {
        optional.unshift(param);
      } else {
        ordinary.unshift(param);
      }
      return [ordinary, optional];
    },
    [[], []],
  );

  const groupedParams = ordinaryParams.map(param => [param]);
  const lastParam = groupedParams[groupedParams.length - 1];
  if (lastParam != null) {
    lastParam.push(...trailingOptional);
  } else if (trailingOptional.length > 0) {
    groupedParams.push(trailingOptional);
  }

  return groupedParams;
}

function isOptional(param: string): boolean {
  invariant(param.length > 0);
  const lastChar = param[param.length - 1];
  return lastChar === '?';
}
