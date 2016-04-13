'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {CompletionResult} from './HackLanguage';
import type {
  HackCompletion,
  HackDefinitionResult,
  HackSearchPosition,
} from '../../nuclide-hack-base/lib/HackService';
import type {SymbolTypeValue} from '../../nuclide-hack-common';

import {SymbolType} from '../../nuclide-hack-common';

// The xhp char regex include : and - to match xhp tags like <ui:button-group>.
const xhpCharRegex = /[\w:-]/;

const stringToSymbolType = {
  'class': SymbolType.CLASS,
  'function': SymbolType.FUNCTION,
  'method': SymbolType.METHOD,
  'local': SymbolType.LOCAL,
};

// Symbol types we can get references for.
export const SYMBOL_TYPES_WITH_REFERENCES = new Set([
  SymbolType.CLASS,
  SymbolType.FUNCTION,
  SymbolType.METHOD,
]);

export function getSymbolType(input: string): SymbolTypeValue {
  let symbolType = stringToSymbolType[input];
  if (typeof symbolType === 'undefined') {
    symbolType = SymbolType.METHOD;
  }
  return symbolType;
}

export function processCompletions(completionsResponse: Array<HackCompletion>):
    Array<CompletionResult> {
  return completionsResponse.map(completion => {
    const {name, func_details: functionDetails} = completion;
    let {type} = completion;
    if (type && type.indexOf('(') === 0 && type.lastIndexOf(')') === type.length - 1) {
      type = type.substring(1, type.length - 1);
    }
    let matchSnippet = name;
    if (functionDetails) {
      const {params} = functionDetails;
      // Construct the snippet: e.g. myFunction(${1:$arg1}, ${2:$arg2});
      const paramsString = params.map(
        (param, index) => '${' + (index + 1) + ':' + param.name + '}').join(', ');
      matchSnippet = name + '(' + paramsString + ')';
    }
    return {
      matchSnippet,
      matchText: name,
      matchType: type,
    };
  });
}

// Calculate the offset of the cursor from the beginning of the file.
// Then insert AUTO332 in at this offset. (Hack uses this as a marker.)
export function markFileForCompletion(contents: string, offset: number): string {
  return contents.substring(0, offset) +
      'AUTO332' + contents.substring(offset, contents.length);
}

export function processDefinitionsForXhp(
  definitionResult: ?HackDefinitionResult,
  column: number,
  lineText: string,
): Array<HackSearchPosition> {
  if (!definitionResult) {
    return [];
  }
  const {definitions} = definitionResult;
  return definitions.map(definition => {
    let {name} = definition;
    if (name.startsWith(':')) {
      // XHP class name, usages omit the leading ':'.
      name = name.substring(1);
    }
    const definitionIndex = lineText.indexOf(name);
    if (
      definitionIndex === -1 ||
      definitionIndex >= column ||
      !xhpCharRegex.test(lineText.substring(definitionIndex, column))
    ) {
      return definition;
    } else {
      return {
        ...definition,
        searchStartColumn: definitionIndex,
        searchEndColumn: definitionIndex + definition.name.length,
      };
    }
  });
}
