'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {FlowLocNoSource, FlowAutocompleteItem} from './flowOutputTypes';

import invariant from 'assert';

export function insertAutocompleteToken(contents: string, line: number, col: number): string {
  const lines = contents.split('\n');
  let theLine = lines[line];
  theLine = theLine.substring(0, col) + 'AUTO332' + theLine.substring(col);
  lines[line] = theLine;
  return lines.join('\n');
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

export function getStopFlowOnExit(): boolean {
  // $UPFixMe: This should use nuclide-features-config
  // Does not currently do so because this is an npm module that may run on the server.
  if (global.atom) {
    return ((global.atom.config.get('nuclide.nuclide-flow.stopFlowOnExit'): any): boolean);
  }
  return true;
}

export function flowCoordsToAtomCoords(flowCoords: FlowLocNoSource): FlowLocNoSource {
  return {
    start: {
      line: flowCoords.start.line - 1,
      column: flowCoords.start.column - 1,
    },
    end: {
      line: flowCoords.end.line - 1,
      // Yes, this is inconsistent. Yes, it works as expected in practice.
      column: flowCoords.end.column,
    },
  };
}
