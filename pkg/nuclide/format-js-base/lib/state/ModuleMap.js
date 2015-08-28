'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {AbsolutePath, RootPath} from '../types/common';
import type {Node} from '../types/ast';
import type {Options} from '../types/options';

var jscs = require('jscodeshift');
var oneLineObjectPattern = require('../utils/oneLineObjectPattern');
var path = require('path');

var {statement} = jscs.template;

// Define some type aliases to make the purpose of different things more clear.
// Opaque types would be nice to have at some point.
export type Identifier = string;
/**
 * A NormalizedIdentifier is used to get an identifier for potentially unsafe
 * modules, it converts to lowercase, and removed non-word characters that
 * cannot be used as a javascript identifier (like a "-").
 */
type NormalizedIdentifier = string;
type Literal = string;
export type ModuleEntry = {
  id: NormalizedIdentifier,
  moduleName: Literal,
  modulePath: ?AbsolutePath,
  destructure: boolean,
  relativize: boolean,
};
export type RequireOptions = {
  path?: ?AbsolutePath,
  typeImport?: ?boolean,
  jsxIdentifier?: ?boolean,
};

class ModuleMap {
  _root: ?AbsolutePath;
  _map: Map<NormalizedIdentifier, Array<ModuleEntry>>;

  constructor(
    root: ?RootPath,
    filePaths: ?Array<AbsolutePath>,
    options: Options
  ) {
    this._root = root;
    this._map = new Map();

    // Construct the map of module entries from the given file paths.
    if (filePaths) {
      for (var filePath of filePaths) {
        if (!filePath.endsWith('.js')) {
          continue;
        }

        var basename = path.basename(filePath);
        var id = normalizeID(basename.split('.')[0]);
        var entry = {
          id,
          moduleName: basename.slice(0, -3), // Get rid of .js extension.
          modulePath: filePath,
          destructure: false, // TODO: Parse files and pull out named exports.
          relativize: !!options.relativeRequires,
        };

        if (!this._map.has(id)) {
          this._map.set(id, []);
        }
        this._map.get(id).push(entry);
      }
    }

    // Add common aliases from options. Aliases override any existing entries.
    for (var entry of options.commonAliases) {
      var [key, value] = entry;
      this._map.set(normalizeID(key), [{
        id: normalizeID(key),
        moduleName: value,
        destructure: false,
        relativize: false, // TODO: We still may want to relativize aliases.
      }]);
    }
  }

  /**
   * Gets a single require, this isn't great for when you want to destructure
   * multiple things in a single statement.
   *
   * TODO: add a getRequires() that consolidates automatically, or add a
   * specific consolidate step as part of the transform.
   */
  getRequire(id: Identifier, options?: ?RequireOptions): ?Node {
    // Make a copy of options and validate the the given path is absolute.
    options = options ? {...options} : {};
    if (options.path && !path.isAbsolute(options.path)) {
      // TODO: warn that options.path is not absolute?
      delete options.path;
    }

    var entry = this._getEntry(id, options);
    if (!entry) {
      return null;
    }

    // Figure out the literal string we need to import. We don't need to check
    // for common aliases because that should be accounted for in buildMap().
    var literal;
    if (entry.relativize && options.path && entry.modulePath) {
      var relativePath = path.relative(
        path.dirname(options.path),
        entry.modulePath
      );
      // TODO: What's the correct way to ensure we start with "./"?
      var normalizedPath = !relativePath.startsWith('.')
        ? '.' + path.sep + relativePath
        : relativePath;
      literal = normalizedPath.slice(0, -3); // Remove '.js'.
    } else {
      literal = entry.moduleName;
    }

    // Create common nodes for printing.
    var idNode = jscs.identifier(id);
    var literalNode = jscs.literal(literal);

    // TODO: Can I use let yet?
    var tmp;

    if (entry.destructure && options.typeImport) {
      // import type {foo} from 'foo';
      tmp = statement`import type {_} from '_'`;
      tmp.specifiers[0].imported = idNode;
      tmp.specifiers[0].local = idNode;
      tmp.source = literalNode;
      return tmp;
    } else if (!entry.destructure && options.typeImport) {
      // import type foo from 'foo';
      tmp = statement`import type _ from '_'`;
      tmp.specifiers[0].id = idNode;
      tmp.specifiers[0].local = idNode;
      tmp.source = literalNode;
      return tmp;
    } else if (entry.destructure && !options.typeImport) {
      // var {foo} = require('foo');
      var property = jscs.property('init', idNode, idNode);
      property.shorthand = true;
      return jscs.variableDeclaration(
        'var',
        [jscs.variableDeclarator(
          oneLineObjectPattern(jscs.objectPattern([property])),
          jscs.callExpression(
            jscs.identifier('require'),
            [literalNode]
          )
        )]
      );
    } else if (!entry.destructure && !options.typeImport) {
      // var foo = require('foo');
      return jscs.variableDeclaration(
        'var',
        [jscs.variableDeclarator(
          idNode,
          jscs.callExpression(
            jscs.identifier('require'),
            [literalNode]
          )
        )]
      );
    }

    // TODO: Handle import syntax, not just require syntax.

    // Can't handle this type of require yet.
    return null;
  }

  _getEntry(id: Identifier, options: RequireOptions): ?ModuleEntry {
    // Normalize the identifier we are importing so we can find it reliably.
    var normalizedID = normalizeID(id);

    // Check if the map of entries has a single unique entry for this ID.
    if (this._map.has(normalizedID)) {
      var entries = this._map.get(normalizedID);
      if (entries.length === 1) {
        return entries[0];
      }
      // TODO: Be smarter about ambiguous imports.
    }

    // Root being null is our proxy for a fake module map in which case we can
    // create a fake entry for this identifier.
    if (!this._root) {
      return {
        id,
        moduleName: options.jsxIdentifier ? id + '.react' : id,
        modulePath: null,
        destructure: false,
        relativize: false,
      };
    }

    return null;
  }
}

function normalizeID(id: Identifier): NormalizedIdentifier {
  return id.toLowerCase();
}

module.exports = ModuleMap;
