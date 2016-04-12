'use strict';
/* @noflow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * This rule prevents requiring Node or Atom builtin modules outside of the
 * top-level scope. The reason for not requiring a module top-level is to lazy
 * load it. However, Node and Atom builtins are already in the module cache by
 * the time Nuclide loads. So there is no benefit to lazy loading them, and it
 * increases code complexity.
 */

const NODE_BUILTINS = new Set([
  'assert', 'buffer', 'child_process', 'cluster', 'crypto', 'dgram', 'dns',
  'domain', 'events', 'fs', 'http', 'https', 'net', 'os', 'path', 'punycode',
  'querystring', 'readline', 'stream', 'string_decoder', 'tls', 'tty', 'url',
  'util', 'v8', 'vm', 'zli',
]);

const ATOM_BUILTINS = new Set([
  'atom', 'callbacks-registry', 'clipboard', 'crash-reporter', 'ipc', 'remote',
  'shell', 'web-frame',
]);

module.exports = function(context) {
  return {
    CallExpression(node) {
      if (!isRequire(node)) {
        return;
      }
      const id = node.arguments[0].value;
      const isNodeBuiltin = NODE_BUILTINS.has(id);
      const isAtomBuiltin = ATOM_BUILTINS.has(id);
      if (!isNodeBuiltin && !isAtomBuiltin) {
        return;
      }
      const scope = context.getScope();
      if (scope.block.type === 'Program') {
        return;
      }
      context.report({
        node: node,
        data: {origin: isNodeBuiltin ? 'Node' : 'Atom'},
        message: '{{origin}} builtin modules should be imported top-level.',
      });
    },
  };
};

function isRequire(node) {
  return (
    node.type === 'CallExpression' &&
    node.callee.type === 'Identifier' &&
    node.callee.name === 'require' &&
    node.arguments[0] &&
    node.arguments[0].type === 'Literal'
  );
}
