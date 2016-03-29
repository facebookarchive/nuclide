var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _templateObject = _taggedTemplateLiteral(['import type {_} from \'_\''], ['import type {_} from \'_\'']),
    _templateObject2 = _taggedTemplateLiteral(['import type _ from \'_\''], ['import type _ from \'_\'']);

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var ModuleMapUtils = require('../utils/ModuleMapUtils');
var Options = require('../options/Options');

var jscs = require('jscodeshift');
var oneLineObjectPattern = require('../utils/oneLineObjectPattern');

var statement = jscs.template.statement;

var ModuleMap = (function () {
  function ModuleMap(options) {
    _classCallCheck(this, ModuleMap);

    Options.validateModuleMapOptions(options);

    // Note: If someone maintains a reference to the structure within options
    // they could mutate the ModuleMap's behavior. We could make shallow copies
    // here but are opting not to for performance.
    this._builtIns = options.builtIns;
    this._builtInTypes = options.builtInTypes;
    this._aliases = options.aliases;
    this._aliasesToRelativize = options.aliasesToRelativize;

    // TODO: Use let for proper scoping.
    var id = undefined;
    var ids = undefined;
    var filePath = undefined;
    var set = undefined;

    this._defaults = new Map();
    for (filePath of options.paths) {
      ids = ModuleMapUtils.getIdentifiersFromPath(filePath);
      var literal = ModuleMapUtils.getLiteralFromPath(filePath);
      for (id of ids) {
        set = this._defaults.get(id);
        if (!set) {
          set = new Set();
          this._defaults.set(id, set);
        }
        set.add(literal);
      }
    }

    this._defaultsToRelativize = new Map();
    for (filePath of options.pathsToRelativize) {
      ids = ModuleMapUtils.getIdentifiersFromPath(filePath);
      for (id of ids) {
        set = this._defaultsToRelativize.get(id);
        if (!set) {
          set = new Set();
          this._defaultsToRelativize.set(id, set);
        }
        set.add(filePath);
      }
    }
  }

  /**
   * Gets a single require, this isn't great for when you want to destructure
   * multiple things in a single statement.
   *
   * TODO: add a getRequires() that consolidates automatically, or add a
   * specific consolidate step as part of the transform.
   */

  _createClass(ModuleMap, [{
    key: 'getRequire',
    value: function getRequire(id, options) {
      Options.validateRequireOptions(options);

      // Don't import built ins.
      if (!options.typeImport) {
        if (this._builtIns.has(id)) {
          return null;
        }
      } else {
        if (this._builtInTypes.has(id)) {
          return null;
        }
      }

      // TODO: Use let for proper scoping.
      var literal = undefined;
      var tmp = undefined;

      if (this._aliases.has(id)) {
        literal = this._aliases.get(id);
      } else if (options.sourcePath && this._aliasesToRelativize.has(id)) {
        literal = ModuleMapUtils.relativizeForRequire(options.sourcePath,
        // $FlowFixMe(kad)
        this._aliasesToRelativize.get(id));
      } else if (this._defaults.has(id) &&
      // $FlowFixMe(kad)
      this._defaults.get(id).size === 1) {
        // TODO: What's the best way to get the single thing out of a one element
        // Set?
        // $FlowFixMe(kad)
        for (tmp of this._defaults.get(id)) {
          literal = tmp;
          break;
        }
      } else if (options.sourcePath && this._defaultsToRelativize.has(id) &&
      // $FlowFixMe(kad)
      this._defaultsToRelativize.get(id).size === 1) {
        var nonNullSourcePath = options.sourcePath;
        // TODO: What's the best way to get the single thing out of a one element
        // Set?
        // $FlowFixMe(kad)
        for (var filePath of this._defaultsToRelativize.get(id)) {
          literal = ModuleMapUtils.relativizeForRequire(nonNullSourcePath, filePath);
          break;
        }
      } else if (options.jsxIdentifier) {
        // TODO: Make this configurable so that the suffix for JSX can be changed.
        literal = id + '.react';
      } else {
        // TODO: Make this configurable so that it's possible to only add known
        // requires and ignore unknown modules.
        literal = id;
      }

      // Create common nodes for printing.
      var idNode = jscs.identifier(id);
      var literalNode = jscs.literal(literal);

      // TODO: Support exports and destructuring.
      var destructure = false;

      if (destructure && options.typeImport) {
        // import type {foo} from 'foo';
        tmp = statement(_templateObject);
        tmp.specifiers[0].imported = idNode;
        tmp.specifiers[0].local = idNode;
        tmp.source = literalNode;
        return tmp;
      } else if (!destructure && options.typeImport) {
        // import type foo from 'foo';
        tmp = statement(_templateObject2);
        tmp.specifiers[0].id = idNode;
        tmp.specifiers[0].local = idNode;
        tmp.source = literalNode;
        return tmp;
      } else if (destructure && !options.typeImport) {
        // var {foo} = require('foo');
        var property = jscs.property('init', idNode, idNode);
        property.shorthand = true;
        return jscs.variableDeclaration('const', [jscs.variableDeclarator(oneLineObjectPattern(jscs.objectPattern([property])), jscs.callExpression(jscs.identifier('require'), [literalNode]))]);
      } else if (!destructure && !options.typeImport) {
        // var foo = require('foo');
        return jscs.variableDeclaration('const', [jscs.variableDeclarator(idNode, jscs.callExpression(jscs.identifier('require'), [literalNode]))]);
      }

      // Can't handle this type of require yet.
      return null;
    }
  }, {
    key: 'getBuiltIns',
    value: function getBuiltIns() {
      return this._builtIns;
    }
  }, {
    key: 'getBuiltInTypes',
    value: function getBuiltInTypes() {
      return this._builtInTypes;
    }
  }]);

  return ModuleMap;
})();

module.exports = ModuleMap;

// Note: These fields are ordered by precendence.

/**
 * Identifiers that should be ignored when not a type.
 */

/**
 * Identifiers that should be ignored when they are a type.
 */

/**
 * Identifiers that have an exact alias to use.
 */

/**
 * Identifiers that have an exact path to use.
 */

/**
 * Identifiers that might correspond to the default export of a particular
 * literal.
 */

/**
 * Identifiers that might correspond to the default export of a particular
 * absolute path.
 */
//# sourceMappingURL=data:application/json;base64,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cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0Fic29sdXRlUGF0aCwgSWRlbnRpZmllciwgTGl0ZXJhbH0gZnJvbSAnLi4vdHlwZXMvY29tbW9uJztcbmltcG9ydCB0eXBlIHtNb2R1bGVNYXBPcHRpb25zfSBmcm9tICcuLi9vcHRpb25zL01vZHVsZU1hcE9wdGlvbnMnO1xuaW1wb3J0IHR5cGUge1JlcXVpcmVPcHRpb25zfSBmcm9tICcuLi9vcHRpb25zL1JlcXVpcmVPcHRpb25zJztcblxuY29uc3QgTW9kdWxlTWFwVXRpbHMgPSByZXF1aXJlKCcuLi91dGlscy9Nb2R1bGVNYXBVdGlscycpO1xuY29uc3QgT3B0aW9ucyA9IHJlcXVpcmUoJy4uL29wdGlvbnMvT3B0aW9ucycpO1xuXG5jb25zdCBqc2NzID0gcmVxdWlyZSgnanNjb2Rlc2hpZnQnKTtcbmNvbnN0IG9uZUxpbmVPYmplY3RQYXR0ZXJuID0gcmVxdWlyZSgnLi4vdXRpbHMvb25lTGluZU9iamVjdFBhdHRlcm4nKTtcblxuY29uc3Qge3N0YXRlbWVudH0gPSBqc2NzLnRlbXBsYXRlO1xuXG5jbGFzcyBNb2R1bGVNYXAge1xuICAvLyBOb3RlOiBUaGVzZSBmaWVsZHMgYXJlIG9yZGVyZWQgYnkgcHJlY2VuZGVuY2UuXG5cbiAgLyoqXG4gICAqIElkZW50aWZpZXJzIHRoYXQgc2hvdWxkIGJlIGlnbm9yZWQgd2hlbiBub3QgYSB0eXBlLlxuICAgKi9cbiAgX2J1aWx0SW5zOiBTZXQ8SWRlbnRpZmllcj47XG4gIC8qKlxuICAgKiBJZGVudGlmaWVycyB0aGF0IHNob3VsZCBiZSBpZ25vcmVkIHdoZW4gdGhleSBhcmUgYSB0eXBlLlxuICAgKi9cbiAgX2J1aWx0SW5UeXBlczogU2V0PElkZW50aWZpZXI+O1xuICAvKipcbiAgICogSWRlbnRpZmllcnMgdGhhdCBoYXZlIGFuIGV4YWN0IGFsaWFzIHRvIHVzZS5cbiAgICovXG4gIF9hbGlhc2VzOiBNYXA8SWRlbnRpZmllciwgTGl0ZXJhbD47XG4gIC8qKlxuICAgKiBJZGVudGlmaWVycyB0aGF0IGhhdmUgYW4gZXhhY3QgcGF0aCB0byB1c2UuXG4gICAqL1xuICBfYWxpYXNlc1RvUmVsYXRpdml6ZTogTWFwPElkZW50aWZpZXIsIEFic29sdXRlUGF0aD47XG4gIC8qKlxuICAgKiBJZGVudGlmaWVycyB0aGF0IG1pZ2h0IGNvcnJlc3BvbmQgdG8gdGhlIGRlZmF1bHQgZXhwb3J0IG9mIGEgcGFydGljdWxhclxuICAgKiBsaXRlcmFsLlxuICAgKi9cbiAgX2RlZmF1bHRzOiBNYXA8SWRlbnRpZmllciwgU2V0PExpdGVyYWw+PjtcbiAgLyoqXG4gICAqIElkZW50aWZpZXJzIHRoYXQgbWlnaHQgY29ycmVzcG9uZCB0byB0aGUgZGVmYXVsdCBleHBvcnQgb2YgYSBwYXJ0aWN1bGFyXG4gICAqIGFic29sdXRlIHBhdGguXG4gICAqL1xuICBfZGVmYXVsdHNUb1JlbGF0aXZpemU6IE1hcDxJZGVudGlmaWVyLCBTZXQ8QWJzb2x1dGVQYXRoPj47XG5cbiAgY29uc3RydWN0b3Iob3B0aW9uczogTW9kdWxlTWFwT3B0aW9ucykge1xuICAgIE9wdGlvbnMudmFsaWRhdGVNb2R1bGVNYXBPcHRpb25zKG9wdGlvbnMpO1xuXG4gICAgLy8gTm90ZTogSWYgc29tZW9uZSBtYWludGFpbnMgYSByZWZlcmVuY2UgdG8gdGhlIHN0cnVjdHVyZSB3aXRoaW4gb3B0aW9uc1xuICAgIC8vIHRoZXkgY291bGQgbXV0YXRlIHRoZSBNb2R1bGVNYXAncyBiZWhhdmlvci4gV2UgY291bGQgbWFrZSBzaGFsbG93IGNvcGllc1xuICAgIC8vIGhlcmUgYnV0IGFyZSBvcHRpbmcgbm90IHRvIGZvciBwZXJmb3JtYW5jZS5cbiAgICB0aGlzLl9idWlsdElucyA9IG9wdGlvbnMuYnVpbHRJbnM7XG4gICAgdGhpcy5fYnVpbHRJblR5cGVzID0gb3B0aW9ucy5idWlsdEluVHlwZXM7XG4gICAgdGhpcy5fYWxpYXNlcyA9IG9wdGlvbnMuYWxpYXNlcztcbiAgICB0aGlzLl9hbGlhc2VzVG9SZWxhdGl2aXplID0gb3B0aW9ucy5hbGlhc2VzVG9SZWxhdGl2aXplO1xuXG4gICAgLy8gVE9ETzogVXNlIGxldCBmb3IgcHJvcGVyIHNjb3BpbmcuXG4gICAgbGV0IGlkO1xuICAgIGxldCBpZHM7XG4gICAgbGV0IGZpbGVQYXRoO1xuICAgIGxldCBzZXQ7XG5cbiAgICB0aGlzLl9kZWZhdWx0cyA9IG5ldyBNYXAoKTtcbiAgICBmb3IgKGZpbGVQYXRoIG9mIG9wdGlvbnMucGF0aHMpIHtcbiAgICAgIGlkcyA9IE1vZHVsZU1hcFV0aWxzLmdldElkZW50aWZpZXJzRnJvbVBhdGgoZmlsZVBhdGgpO1xuICAgICAgY29uc3QgbGl0ZXJhbCA9IE1vZHVsZU1hcFV0aWxzLmdldExpdGVyYWxGcm9tUGF0aChmaWxlUGF0aCk7XG4gICAgICBmb3IgKGlkIG9mIGlkcykge1xuICAgICAgICBzZXQgPSB0aGlzLl9kZWZhdWx0cy5nZXQoaWQpO1xuICAgICAgICBpZiAoIXNldCkge1xuICAgICAgICAgIHNldCA9IG5ldyBTZXQoKTtcbiAgICAgICAgICB0aGlzLl9kZWZhdWx0cy5zZXQoaWQsIHNldCk7XG4gICAgICAgIH1cbiAgICAgICAgc2V0LmFkZChsaXRlcmFsKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLl9kZWZhdWx0c1RvUmVsYXRpdml6ZSA9IG5ldyBNYXAoKTtcbiAgICBmb3IgKGZpbGVQYXRoIG9mIG9wdGlvbnMucGF0aHNUb1JlbGF0aXZpemUpIHtcbiAgICAgIGlkcyA9IE1vZHVsZU1hcFV0aWxzLmdldElkZW50aWZpZXJzRnJvbVBhdGgoZmlsZVBhdGgpO1xuICAgICAgZm9yIChpZCBvZiBpZHMpIHtcbiAgICAgICAgc2V0ID0gdGhpcy5fZGVmYXVsdHNUb1JlbGF0aXZpemUuZ2V0KGlkKTtcbiAgICAgICAgaWYgKCFzZXQpIHtcbiAgICAgICAgICBzZXQgPSBuZXcgU2V0KCk7XG4gICAgICAgICAgdGhpcy5fZGVmYXVsdHNUb1JlbGF0aXZpemUuc2V0KGlkLCBzZXQpO1xuICAgICAgICB9XG4gICAgICAgIHNldC5hZGQoZmlsZVBhdGgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIGEgc2luZ2xlIHJlcXVpcmUsIHRoaXMgaXNuJ3QgZ3JlYXQgZm9yIHdoZW4geW91IHdhbnQgdG8gZGVzdHJ1Y3R1cmVcbiAgICogbXVsdGlwbGUgdGhpbmdzIGluIGEgc2luZ2xlIHN0YXRlbWVudC5cbiAgICpcbiAgICogVE9ETzogYWRkIGEgZ2V0UmVxdWlyZXMoKSB0aGF0IGNvbnNvbGlkYXRlcyBhdXRvbWF0aWNhbGx5LCBvciBhZGQgYVxuICAgKiBzcGVjaWZpYyBjb25zb2xpZGF0ZSBzdGVwIGFzIHBhcnQgb2YgdGhlIHRyYW5zZm9ybS5cbiAgICovXG4gIGdldFJlcXVpcmUoaWQ6IElkZW50aWZpZXIsIG9wdGlvbnM6IFJlcXVpcmVPcHRpb25zKTogP05vZGUge1xuICAgIE9wdGlvbnMudmFsaWRhdGVSZXF1aXJlT3B0aW9ucyhvcHRpb25zKTtcblxuICAgIC8vIERvbid0IGltcG9ydCBidWlsdCBpbnMuXG4gICAgaWYgKCFvcHRpb25zLnR5cGVJbXBvcnQpIHtcbiAgICAgIGlmICh0aGlzLl9idWlsdElucy5oYXMoaWQpKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodGhpcy5fYnVpbHRJblR5cGVzLmhhcyhpZCkpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gVE9ETzogVXNlIGxldCBmb3IgcHJvcGVyIHNjb3BpbmcuXG4gICAgbGV0IGxpdGVyYWw7XG4gICAgbGV0IHRtcDtcblxuICAgIGlmICh0aGlzLl9hbGlhc2VzLmhhcyhpZCkpIHtcbiAgICAgIGxpdGVyYWwgPSB0aGlzLl9hbGlhc2VzLmdldChpZCk7XG4gICAgfSBlbHNlIGlmIChvcHRpb25zLnNvdXJjZVBhdGggJiYgdGhpcy5fYWxpYXNlc1RvUmVsYXRpdml6ZS5oYXMoaWQpKSB7XG4gICAgICBsaXRlcmFsID0gTW9kdWxlTWFwVXRpbHMucmVsYXRpdml6ZUZvclJlcXVpcmUoXG4gICAgICAgIG9wdGlvbnMuc291cmNlUGF0aCxcbiAgICAgICAgLy8gJEZsb3dGaXhNZShrYWQpXG4gICAgICAgIHRoaXMuX2FsaWFzZXNUb1JlbGF0aXZpemUuZ2V0KGlkKVxuICAgICAgKTtcbiAgICB9IGVsc2UgaWYgKFxuICAgICAgdGhpcy5fZGVmYXVsdHMuaGFzKGlkKSAmJlxuICAgICAgLy8gJEZsb3dGaXhNZShrYWQpXG4gICAgICB0aGlzLl9kZWZhdWx0cy5nZXQoaWQpLnNpemUgPT09IDFcbiAgICApIHtcbiAgICAgIC8vIFRPRE86IFdoYXQncyB0aGUgYmVzdCB3YXkgdG8gZ2V0IHRoZSBzaW5nbGUgdGhpbmcgb3V0IG9mIGEgb25lIGVsZW1lbnRcbiAgICAgIC8vIFNldD9cbiAgICAgIC8vICRGbG93Rml4TWUoa2FkKVxuICAgICAgZm9yICh0bXAgb2YgdGhpcy5fZGVmYXVsdHMuZ2V0KGlkKSkge1xuICAgICAgICBsaXRlcmFsID0gdG1wO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKFxuICAgICAgb3B0aW9ucy5zb3VyY2VQYXRoICYmXG4gICAgICB0aGlzLl9kZWZhdWx0c1RvUmVsYXRpdml6ZS5oYXMoaWQpICYmXG4gICAgICAvLyAkRmxvd0ZpeE1lKGthZClcbiAgICAgIHRoaXMuX2RlZmF1bHRzVG9SZWxhdGl2aXplLmdldChpZCkuc2l6ZSA9PT0gMVxuICAgICkge1xuICAgICAgY29uc3Qgbm9uTnVsbFNvdXJjZVBhdGggPSBvcHRpb25zLnNvdXJjZVBhdGg7XG4gICAgICAvLyBUT0RPOiBXaGF0J3MgdGhlIGJlc3Qgd2F5IHRvIGdldCB0aGUgc2luZ2xlIHRoaW5nIG91dCBvZiBhIG9uZSBlbGVtZW50XG4gICAgICAvLyBTZXQ/XG4gICAgICAvLyAkRmxvd0ZpeE1lKGthZClcbiAgICAgIGZvciAoY29uc3QgZmlsZVBhdGggb2YgdGhpcy5fZGVmYXVsdHNUb1JlbGF0aXZpemUuZ2V0KGlkKSkge1xuICAgICAgICBsaXRlcmFsID0gTW9kdWxlTWFwVXRpbHMucmVsYXRpdml6ZUZvclJlcXVpcmUoXG4gICAgICAgICAgbm9uTnVsbFNvdXJjZVBhdGgsXG4gICAgICAgICAgZmlsZVBhdGhcbiAgICAgICAgKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChvcHRpb25zLmpzeElkZW50aWZpZXIpIHtcbiAgICAgIC8vIFRPRE86IE1ha2UgdGhpcyBjb25maWd1cmFibGUgc28gdGhhdCB0aGUgc3VmZml4IGZvciBKU1ggY2FuIGJlIGNoYW5nZWQuXG4gICAgICBsaXRlcmFsID0gaWQgKyAnLnJlYWN0JztcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVE9ETzogTWFrZSB0aGlzIGNvbmZpZ3VyYWJsZSBzbyB0aGF0IGl0J3MgcG9zc2libGUgdG8gb25seSBhZGQga25vd25cbiAgICAgIC8vIHJlcXVpcmVzIGFuZCBpZ25vcmUgdW5rbm93biBtb2R1bGVzLlxuICAgICAgbGl0ZXJhbCA9IGlkO1xuICAgIH1cblxuICAgIC8vIENyZWF0ZSBjb21tb24gbm9kZXMgZm9yIHByaW50aW5nLlxuICAgIGNvbnN0IGlkTm9kZSA9IGpzY3MuaWRlbnRpZmllcihpZCk7XG4gICAgY29uc3QgbGl0ZXJhbE5vZGUgPSBqc2NzLmxpdGVyYWwobGl0ZXJhbCk7XG5cbiAgICAvLyBUT0RPOiBTdXBwb3J0IGV4cG9ydHMgYW5kIGRlc3RydWN0dXJpbmcuXG4gICAgY29uc3QgZGVzdHJ1Y3R1cmUgPSBmYWxzZTtcblxuICAgIGlmIChkZXN0cnVjdHVyZSAmJiBvcHRpb25zLnR5cGVJbXBvcnQpIHtcbiAgICAgIC8vIGltcG9ydCB0eXBlIHtmb299IGZyb20gJ2Zvbyc7XG4gICAgICB0bXAgPSBzdGF0ZW1lbnRgaW1wb3J0IHR5cGUge199IGZyb20gJ18nYDtcbiAgICAgIHRtcC5zcGVjaWZpZXJzWzBdLmltcG9ydGVkID0gaWROb2RlO1xuICAgICAgdG1wLnNwZWNpZmllcnNbMF0ubG9jYWwgPSBpZE5vZGU7XG4gICAgICB0bXAuc291cmNlID0gbGl0ZXJhbE5vZGU7XG4gICAgICByZXR1cm4gdG1wO1xuICAgIH0gZWxzZSBpZiAoIWRlc3RydWN0dXJlICYmIG9wdGlvbnMudHlwZUltcG9ydCkge1xuICAgICAgLy8gaW1wb3J0IHR5cGUgZm9vIGZyb20gJ2Zvbyc7XG4gICAgICB0bXAgPSBzdGF0ZW1lbnRgaW1wb3J0IHR5cGUgXyBmcm9tICdfJ2A7XG4gICAgICB0bXAuc3BlY2lmaWVyc1swXS5pZCA9IGlkTm9kZTtcbiAgICAgIHRtcC5zcGVjaWZpZXJzWzBdLmxvY2FsID0gaWROb2RlO1xuICAgICAgdG1wLnNvdXJjZSA9IGxpdGVyYWxOb2RlO1xuICAgICAgcmV0dXJuIHRtcDtcbiAgICB9IGVsc2UgaWYgKGRlc3RydWN0dXJlICYmICFvcHRpb25zLnR5cGVJbXBvcnQpIHtcbiAgICAgIC8vIHZhciB7Zm9vfSA9IHJlcXVpcmUoJ2ZvbycpO1xuICAgICAgY29uc3QgcHJvcGVydHkgPSBqc2NzLnByb3BlcnR5KCdpbml0JywgaWROb2RlLCBpZE5vZGUpO1xuICAgICAgcHJvcGVydHkuc2hvcnRoYW5kID0gdHJ1ZTtcbiAgICAgIHJldHVybiBqc2NzLnZhcmlhYmxlRGVjbGFyYXRpb24oXG4gICAgICAgICdjb25zdCcsXG4gICAgICAgIFtqc2NzLnZhcmlhYmxlRGVjbGFyYXRvcihcbiAgICAgICAgICBvbmVMaW5lT2JqZWN0UGF0dGVybihqc2NzLm9iamVjdFBhdHRlcm4oW3Byb3BlcnR5XSkpLFxuICAgICAgICAgIGpzY3MuY2FsbEV4cHJlc3Npb24oXG4gICAgICAgICAgICBqc2NzLmlkZW50aWZpZXIoJ3JlcXVpcmUnKSxcbiAgICAgICAgICAgIFtsaXRlcmFsTm9kZV1cbiAgICAgICAgICApXG4gICAgICAgICldXG4gICAgICApO1xuICAgIH0gZWxzZSBpZiAoIWRlc3RydWN0dXJlICYmICFvcHRpb25zLnR5cGVJbXBvcnQpIHtcbiAgICAgIC8vIHZhciBmb28gPSByZXF1aXJlKCdmb28nKTtcbiAgICAgIHJldHVybiBqc2NzLnZhcmlhYmxlRGVjbGFyYXRpb24oXG4gICAgICAgICdjb25zdCcsXG4gICAgICAgIFtqc2NzLnZhcmlhYmxlRGVjbGFyYXRvcihcbiAgICAgICAgICBpZE5vZGUsXG4gICAgICAgICAganNjcy5jYWxsRXhwcmVzc2lvbihcbiAgICAgICAgICAgIGpzY3MuaWRlbnRpZmllcigncmVxdWlyZScpLFxuICAgICAgICAgICAgW2xpdGVyYWxOb2RlXVxuICAgICAgICAgIClcbiAgICAgICAgKV1cbiAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gQ2FuJ3QgaGFuZGxlIHRoaXMgdHlwZSBvZiByZXF1aXJlIHlldC5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGdldEJ1aWx0SW5zKCk6IFNldDxJZGVudGlmaWVyPiB7XG4gICAgcmV0dXJuIHRoaXMuX2J1aWx0SW5zO1xuICB9XG5cbiAgZ2V0QnVpbHRJblR5cGVzKCk6IFNldDxJZGVudGlmaWVyPiB7XG4gICAgcmV0dXJuIHRoaXMuX2J1aWx0SW5UeXBlcztcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IE1vZHVsZU1hcDtcbiJdfQ==