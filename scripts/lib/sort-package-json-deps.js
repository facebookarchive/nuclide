'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

// $UPFixMe: Once the scripts have access to node_modules, we can get some of these (Node, NodePath)
//           from the ast-types-flow package.

type FileInfo = {
  path: string;
  source: string;
};

type Node = {
  value: Object,
};

type NodePath = {
  node: Node;
};

type jscodeshift = {
  (source: string): Object;
  find(type: Node): jscodeshift;
  replaceWith(nodes: Node): jscodeshift;
  Property: Node;
};

type Api = {
  jscodeshift: jscodeshift;
};

function sortByKeys(path: NodePath): Node {
  const {node} = path;
  node.value.properties.sort((one, two) => {
    return one.key.value.localeCompare(two.key.value);
  });
  return node;
}

module.exports = function(fileInfo: FileInfo, api: Api): string {
  const jsonSource = fileInfo.source;
  // Make JSON valid JavaScript input for jscodeshift by wrapping it in parentheses.
  const jsSource = '(' + jsonSource + ')';
  const root = api.jscodeshift(jsSource);
  const {Property} = api.jscodeshift;

  root
    .find(Property, {key: {value: 'dependencies'}})
    .replaceWith(path => sortByKeys(path));

  root
    .find(Property, {key: {value: 'devDependencies'}})
    .replaceWith(path => sortByKeys(path));

  // Now we need to fix the output to remove the first and last parentheses so it's valid JSON.
  const output = root.toSource();
  const firstParen = output.indexOf('(');
  const lastParen = output.lastIndexOf(')');
  return output.slice(firstParen + 1, lastParen);
};
