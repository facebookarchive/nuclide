'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {HyperclickProvider, HyperclickSuggestion} from '../../hyperclick-interfaces';

import semver from 'semver';
import path from 'path';
import shell from 'shell';

import {parseJSON, babelLocToRange} from './parsing';

const DEPENDENCY_PROPERTIES = new Set([
  'dependencies',
  'devDependencies',
  'optionalDependencies',
]);

export function getNPMHyperclickProvider(): HyperclickProvider {
  return npmHyperclickProvider;
}

const npmHyperclickProvider = {
  priority: 1,
  providerName: 'npm-package-json',
  getSuggestionForWord,
  // Capture just text in quotes
  wordRegExp: /"[^"]*"/g,
};

function getSuggestionForWord(
  textEditor: atom$TextEditor,
  text: string,
  range: atom$Range
): Promise<?HyperclickSuggestion> {

  if (text === '' || !isPackageJson(textEditor)) {
    return Promise.resolve(null);
  }

  const packageUrl = getPackageUrlForRange(textEditor.getText(), text, range);

  if (packageUrl == null) {
    return Promise.resolve(null);
  }

  const suggestion: HyperclickSuggestion = {
    range,
    callback: () => {
      shell.openExternal(packageUrl);
    },
  };
  return Promise.resolve(suggestion);
}

// Exported for testing. We could derive the token from the json text and the range, but since
// hyperclick provides it we may as well use it.
export function getPackageUrlForRange(json: string, token: string, range: atom$Range): ?string {
  if (isNPMDependency(json, range)) {
    // Strip off the quotes
    const packageName = token.substring(1, token.length - 1);
    return getPackageUrl(packageName);
  } else {
    return null;
  }
}

function isPackageJson(textEditor: atom$TextEditor): boolean {
  const scopeName = textEditor.getGrammar().scopeName;
  const filePath = textEditor.getPath();
  return scopeName === 'source.json' &&
    filePath != null &&
    path.basename(filePath) === 'package.json';
}

function getPackageUrl(packageName: string): string {
  return `https://www.npmjs.com/package/${packageName}/`;
}

function isNPMDependency(json: string, range: atom$Range): boolean {
  const ast = parseJSON(json);
  if (ast == null) {
    // parse error
    return false;
  }
  const pathToNode = getPathToNodeForRange(ast, range);

  return pathToNode != null &&
    pathToNode.length === 2 &&
    DEPENDENCY_PROPERTIES.has(pathToNode[0].key.value) &&
    isNPMVersion(pathToNode[1].value);
}

function isNPMVersion(valueASTNode: Object): boolean {
  if (valueASTNode.type !== 'Literal') {
    return false;
  }

  const value = valueASTNode.value;

  if (typeof value !== 'string') {
    return false;
  }

  // Eventually it would be nice to do something reasonable with these but for now let's just stick
  // with npm-only.
  if (!semver.valid(value)) {
    return false;
  }

  // We aren't guaranteed at this point that it's a valid npm package in the registry but we've
  // covered most cases.
  return true;
}

// return an array of property AST nodes
function getPathToNodeForRange(objectExpression: Object, range: atom$Range): ?Array<Object> {
  const properties = objectExpression.properties;
  if (properties == null) {
    return null;
  }
  for (const property of properties) {
    const propertyRange = babelLocToRange(property.loc);
    if (propertyRange.containsRange(range)) {
      const keyRange = babelLocToRange(property.key.loc);
      if (keyRange.isEqual(range)) {
        return [property];
      }
      const subPath = getPathToNodeForRange(property.value, range);
      if (subPath == null) {
        return null;
      }
      subPath.unshift(property);
      return subPath;
    }
  }
  return null;
}
