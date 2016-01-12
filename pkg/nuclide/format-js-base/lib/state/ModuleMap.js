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
      } else if (this._defaults.has(id) && this._defaults.get(id).size === 1) {
        // TODO: What's the best way to get the single thing out of a one element
        // Set?
        // $FlowFixMe(kad)
        for (tmp of this._defaults.get(id)) {
          literal = tmp;
          break;
        }
      } else if (options.sourcePath && this._defaultsToRelativize.has(id) && this._defaultsToRelativize.get(id).size === 1) {
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
//# sourceMappingURL=data:application/json;base64,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ZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtBYnNvbHV0ZVBhdGgsIElkZW50aWZpZXIsIExpdGVyYWx9IGZyb20gJy4uL3R5cGVzL2NvbW1vbic7XG5pbXBvcnQgdHlwZSB7TW9kdWxlTWFwT3B0aW9uc30gZnJvbSAnLi4vb3B0aW9ucy9Nb2R1bGVNYXBPcHRpb25zJztcbmltcG9ydCB0eXBlIHtSZXF1aXJlT3B0aW9uc30gZnJvbSAnLi4vb3B0aW9ucy9SZXF1aXJlT3B0aW9ucyc7XG5cbmNvbnN0IE1vZHVsZU1hcFV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMvTW9kdWxlTWFwVXRpbHMnKTtcbmNvbnN0IE9wdGlvbnMgPSByZXF1aXJlKCcuLi9vcHRpb25zL09wdGlvbnMnKTtcblxuY29uc3QganNjcyA9IHJlcXVpcmUoJ2pzY29kZXNoaWZ0Jyk7XG5jb25zdCBvbmVMaW5lT2JqZWN0UGF0dGVybiA9IHJlcXVpcmUoJy4uL3V0aWxzL29uZUxpbmVPYmplY3RQYXR0ZXJuJyk7XG5cbmNvbnN0IHtzdGF0ZW1lbnR9ID0ganNjcy50ZW1wbGF0ZTtcblxuY2xhc3MgTW9kdWxlTWFwIHtcbiAgLy8gTm90ZTogVGhlc2UgZmllbGRzIGFyZSBvcmRlcmVkIGJ5IHByZWNlbmRlbmNlLlxuXG4gIC8qKlxuICAgKiBJZGVudGlmaWVycyB0aGF0IHNob3VsZCBiZSBpZ25vcmVkIHdoZW4gbm90IGEgdHlwZS5cbiAgICovXG4gIF9idWlsdEluczogU2V0PElkZW50aWZpZXI+O1xuICAvKipcbiAgICogSWRlbnRpZmllcnMgdGhhdCBzaG91bGQgYmUgaWdub3JlZCB3aGVuIHRoZXkgYXJlIGEgdHlwZS5cbiAgICovXG4gIF9idWlsdEluVHlwZXM6IFNldDxJZGVudGlmaWVyPjtcbiAgLyoqXG4gICAqIElkZW50aWZpZXJzIHRoYXQgaGF2ZSBhbiBleGFjdCBhbGlhcyB0byB1c2UuXG4gICAqL1xuICBfYWxpYXNlczogTWFwPElkZW50aWZpZXIsIExpdGVyYWw+O1xuICAvKipcbiAgICogSWRlbnRpZmllcnMgdGhhdCBoYXZlIGFuIGV4YWN0IHBhdGggdG8gdXNlLlxuICAgKi9cbiAgX2FsaWFzZXNUb1JlbGF0aXZpemU6IE1hcDxJZGVudGlmaWVyLCBBYnNvbHV0ZVBhdGg+O1xuICAvKipcbiAgICogSWRlbnRpZmllcnMgdGhhdCBtaWdodCBjb3JyZXNwb25kIHRvIHRoZSBkZWZhdWx0IGV4cG9ydCBvZiBhIHBhcnRpY3VsYXJcbiAgICogbGl0ZXJhbC5cbiAgICovXG4gIF9kZWZhdWx0czogTWFwPElkZW50aWZpZXIsIFNldDxMaXRlcmFsPj47XG4gIC8qKlxuICAgKiBJZGVudGlmaWVycyB0aGF0IG1pZ2h0IGNvcnJlc3BvbmQgdG8gdGhlIGRlZmF1bHQgZXhwb3J0IG9mIGEgcGFydGljdWxhclxuICAgKiBhYnNvbHV0ZSBwYXRoLlxuICAgKi9cbiAgX2RlZmF1bHRzVG9SZWxhdGl2aXplOiBNYXA8SWRlbnRpZmllciwgU2V0PEFic29sdXRlUGF0aD4+O1xuXG4gIGNvbnN0cnVjdG9yKG9wdGlvbnM6IE1vZHVsZU1hcE9wdGlvbnMpIHtcbiAgICBPcHRpb25zLnZhbGlkYXRlTW9kdWxlTWFwT3B0aW9ucyhvcHRpb25zKTtcblxuICAgIC8vIE5vdGU6IElmIHNvbWVvbmUgbWFpbnRhaW5zIGEgcmVmZXJlbmNlIHRvIHRoZSBzdHJ1Y3R1cmUgd2l0aGluIG9wdGlvbnNcbiAgICAvLyB0aGV5IGNvdWxkIG11dGF0ZSB0aGUgTW9kdWxlTWFwJ3MgYmVoYXZpb3IuIFdlIGNvdWxkIG1ha2Ugc2hhbGxvdyBjb3BpZXNcbiAgICAvLyBoZXJlIGJ1dCBhcmUgb3B0aW5nIG5vdCB0byBmb3IgcGVyZm9ybWFuY2UuXG4gICAgdGhpcy5fYnVpbHRJbnMgPSBvcHRpb25zLmJ1aWx0SW5zO1xuICAgIHRoaXMuX2J1aWx0SW5UeXBlcyA9IG9wdGlvbnMuYnVpbHRJblR5cGVzO1xuICAgIHRoaXMuX2FsaWFzZXMgPSBvcHRpb25zLmFsaWFzZXM7XG4gICAgdGhpcy5fYWxpYXNlc1RvUmVsYXRpdml6ZSA9IG9wdGlvbnMuYWxpYXNlc1RvUmVsYXRpdml6ZTtcblxuICAgIC8vIFRPRE86IFVzZSBsZXQgZm9yIHByb3BlciBzY29waW5nLlxuICAgIGxldCBpZDtcbiAgICBsZXQgaWRzO1xuICAgIGxldCBmaWxlUGF0aDtcbiAgICBsZXQgc2V0O1xuXG4gICAgdGhpcy5fZGVmYXVsdHMgPSBuZXcgTWFwKCk7XG4gICAgZm9yIChmaWxlUGF0aCBvZiBvcHRpb25zLnBhdGhzKSB7XG4gICAgICBpZHMgPSBNb2R1bGVNYXBVdGlscy5nZXRJZGVudGlmaWVyc0Zyb21QYXRoKGZpbGVQYXRoKTtcbiAgICAgIGNvbnN0IGxpdGVyYWwgPSBNb2R1bGVNYXBVdGlscy5nZXRMaXRlcmFsRnJvbVBhdGgoZmlsZVBhdGgpO1xuICAgICAgZm9yIChpZCBvZiBpZHMpIHtcbiAgICAgICAgc2V0ID0gdGhpcy5fZGVmYXVsdHMuZ2V0KGlkKTtcbiAgICAgICAgaWYgKCFzZXQpIHtcbiAgICAgICAgICBzZXQgPSBuZXcgU2V0KCk7XG4gICAgICAgICAgdGhpcy5fZGVmYXVsdHMuc2V0KGlkLCBzZXQpO1xuICAgICAgICB9XG4gICAgICAgIHNldC5hZGQobGl0ZXJhbCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5fZGVmYXVsdHNUb1JlbGF0aXZpemUgPSBuZXcgTWFwKCk7XG4gICAgZm9yIChmaWxlUGF0aCBvZiBvcHRpb25zLnBhdGhzVG9SZWxhdGl2aXplKSB7XG4gICAgICBpZHMgPSBNb2R1bGVNYXBVdGlscy5nZXRJZGVudGlmaWVyc0Zyb21QYXRoKGZpbGVQYXRoKTtcbiAgICAgIGZvciAoaWQgb2YgaWRzKSB7XG4gICAgICAgIHNldCA9IHRoaXMuX2RlZmF1bHRzVG9SZWxhdGl2aXplLmdldChpZCk7XG4gICAgICAgIGlmICghc2V0KSB7XG4gICAgICAgICAgc2V0ID0gbmV3IFNldCgpO1xuICAgICAgICAgIHRoaXMuX2RlZmF1bHRzVG9SZWxhdGl2aXplLnNldChpZCwgc2V0KTtcbiAgICAgICAgfVxuICAgICAgICBzZXQuYWRkKGZpbGVQYXRoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2V0cyBhIHNpbmdsZSByZXF1aXJlLCB0aGlzIGlzbid0IGdyZWF0IGZvciB3aGVuIHlvdSB3YW50IHRvIGRlc3RydWN0dXJlXG4gICAqIG11bHRpcGxlIHRoaW5ncyBpbiBhIHNpbmdsZSBzdGF0ZW1lbnQuXG4gICAqXG4gICAqIFRPRE86IGFkZCBhIGdldFJlcXVpcmVzKCkgdGhhdCBjb25zb2xpZGF0ZXMgYXV0b21hdGljYWxseSwgb3IgYWRkIGFcbiAgICogc3BlY2lmaWMgY29uc29saWRhdGUgc3RlcCBhcyBwYXJ0IG9mIHRoZSB0cmFuc2Zvcm0uXG4gICAqL1xuICBnZXRSZXF1aXJlKGlkOiBJZGVudGlmaWVyLCBvcHRpb25zOiBSZXF1aXJlT3B0aW9ucyk6ID9Ob2RlIHtcbiAgICBPcHRpb25zLnZhbGlkYXRlUmVxdWlyZU9wdGlvbnMob3B0aW9ucyk7XG5cbiAgICAvLyBEb24ndCBpbXBvcnQgYnVpbHQgaW5zLlxuICAgIGlmICghb3B0aW9ucy50eXBlSW1wb3J0KSB7XG4gICAgICBpZiAodGhpcy5fYnVpbHRJbnMuaGFzKGlkKSkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHRoaXMuX2J1aWx0SW5UeXBlcy5oYXMoaWQpKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFRPRE86IFVzZSBsZXQgZm9yIHByb3BlciBzY29waW5nLlxuICAgIGxldCBsaXRlcmFsO1xuICAgIGxldCB0bXA7XG5cbiAgICBpZiAodGhpcy5fYWxpYXNlcy5oYXMoaWQpKSB7XG4gICAgICBsaXRlcmFsID0gdGhpcy5fYWxpYXNlcy5nZXQoaWQpO1xuICAgIH0gZWxzZSBpZiAob3B0aW9ucy5zb3VyY2VQYXRoICYmIHRoaXMuX2FsaWFzZXNUb1JlbGF0aXZpemUuaGFzKGlkKSkge1xuICAgICAgbGl0ZXJhbCA9IE1vZHVsZU1hcFV0aWxzLnJlbGF0aXZpemVGb3JSZXF1aXJlKFxuICAgICAgICBvcHRpb25zLnNvdXJjZVBhdGgsXG4gICAgICAgIC8vICRGbG93Rml4TWUoa2FkKVxuICAgICAgICB0aGlzLl9hbGlhc2VzVG9SZWxhdGl2aXplLmdldChpZClcbiAgICAgICk7XG4gICAgfSBlbHNlIGlmIChcbiAgICAgIHRoaXMuX2RlZmF1bHRzLmhhcyhpZCkgJiZcbiAgICAgIHRoaXMuX2RlZmF1bHRzLmdldChpZCkuc2l6ZSA9PT0gMVxuICAgICkge1xuICAgICAgLy8gVE9ETzogV2hhdCdzIHRoZSBiZXN0IHdheSB0byBnZXQgdGhlIHNpbmdsZSB0aGluZyBvdXQgb2YgYSBvbmUgZWxlbWVudFxuICAgICAgLy8gU2V0P1xuICAgICAgLy8gJEZsb3dGaXhNZShrYWQpXG4gICAgICBmb3IgKHRtcCBvZiB0aGlzLl9kZWZhdWx0cy5nZXQoaWQpKSB7XG4gICAgICAgIGxpdGVyYWwgPSB0bXA7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoXG4gICAgICBvcHRpb25zLnNvdXJjZVBhdGggJiZcbiAgICAgIHRoaXMuX2RlZmF1bHRzVG9SZWxhdGl2aXplLmhhcyhpZCkgJiZcbiAgICAgIHRoaXMuX2RlZmF1bHRzVG9SZWxhdGl2aXplLmdldChpZCkuc2l6ZSA9PT0gMVxuICAgICkge1xuICAgICAgY29uc3Qgbm9uTnVsbFNvdXJjZVBhdGggPSBvcHRpb25zLnNvdXJjZVBhdGg7XG4gICAgICAvLyBUT0RPOiBXaGF0J3MgdGhlIGJlc3Qgd2F5IHRvIGdldCB0aGUgc2luZ2xlIHRoaW5nIG91dCBvZiBhIG9uZSBlbGVtZW50XG4gICAgICAvLyBTZXQ/XG4gICAgICAvLyAkRmxvd0ZpeE1lKGthZClcbiAgICAgIGZvciAoY29uc3QgZmlsZVBhdGggb2YgdGhpcy5fZGVmYXVsdHNUb1JlbGF0aXZpemUuZ2V0KGlkKSkge1xuICAgICAgICBsaXRlcmFsID0gTW9kdWxlTWFwVXRpbHMucmVsYXRpdml6ZUZvclJlcXVpcmUoXG4gICAgICAgICAgbm9uTnVsbFNvdXJjZVBhdGgsXG4gICAgICAgICAgZmlsZVBhdGhcbiAgICAgICAgKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChvcHRpb25zLmpzeElkZW50aWZpZXIpIHtcbiAgICAgIC8vIFRPRE86IE1ha2UgdGhpcyBjb25maWd1cmFibGUgc28gdGhhdCB0aGUgc3VmZml4IGZvciBKU1ggY2FuIGJlIGNoYW5nZWQuXG4gICAgICBsaXRlcmFsID0gaWQgKyAnLnJlYWN0JztcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVE9ETzogTWFrZSB0aGlzIGNvbmZpZ3VyYWJsZSBzbyB0aGF0IGl0J3MgcG9zc2libGUgdG8gb25seSBhZGQga25vd25cbiAgICAgIC8vIHJlcXVpcmVzIGFuZCBpZ25vcmUgdW5rbm93biBtb2R1bGVzLlxuICAgICAgbGl0ZXJhbCA9IGlkO1xuICAgIH1cblxuICAgIC8vIENyZWF0ZSBjb21tb24gbm9kZXMgZm9yIHByaW50aW5nLlxuICAgIGNvbnN0IGlkTm9kZSA9IGpzY3MuaWRlbnRpZmllcihpZCk7XG4gICAgY29uc3QgbGl0ZXJhbE5vZGUgPSBqc2NzLmxpdGVyYWwobGl0ZXJhbCk7XG5cbiAgICAvLyBUT0RPOiBTdXBwb3J0IGV4cG9ydHMgYW5kIGRlc3RydWN0dXJpbmcuXG4gICAgY29uc3QgZGVzdHJ1Y3R1cmUgPSBmYWxzZTtcblxuICAgIGlmIChkZXN0cnVjdHVyZSAmJiBvcHRpb25zLnR5cGVJbXBvcnQpIHtcbiAgICAgIC8vIGltcG9ydCB0eXBlIHtmb299IGZyb20gJ2Zvbyc7XG4gICAgICB0bXAgPSBzdGF0ZW1lbnRgaW1wb3J0IHR5cGUge199IGZyb20gJ18nYDtcbiAgICAgIHRtcC5zcGVjaWZpZXJzWzBdLmltcG9ydGVkID0gaWROb2RlO1xuICAgICAgdG1wLnNwZWNpZmllcnNbMF0ubG9jYWwgPSBpZE5vZGU7XG4gICAgICB0bXAuc291cmNlID0gbGl0ZXJhbE5vZGU7XG4gICAgICByZXR1cm4gdG1wO1xuICAgIH0gZWxzZSBpZiAoIWRlc3RydWN0dXJlICYmIG9wdGlvbnMudHlwZUltcG9ydCkge1xuICAgICAgLy8gaW1wb3J0IHR5cGUgZm9vIGZyb20gJ2Zvbyc7XG4gICAgICB0bXAgPSBzdGF0ZW1lbnRgaW1wb3J0IHR5cGUgXyBmcm9tICdfJ2A7XG4gICAgICB0bXAuc3BlY2lmaWVyc1swXS5pZCA9IGlkTm9kZTtcbiAgICAgIHRtcC5zcGVjaWZpZXJzWzBdLmxvY2FsID0gaWROb2RlO1xuICAgICAgdG1wLnNvdXJjZSA9IGxpdGVyYWxOb2RlO1xuICAgICAgcmV0dXJuIHRtcDtcbiAgICB9IGVsc2UgaWYgKGRlc3RydWN0dXJlICYmICFvcHRpb25zLnR5cGVJbXBvcnQpIHtcbiAgICAgIC8vIHZhciB7Zm9vfSA9IHJlcXVpcmUoJ2ZvbycpO1xuICAgICAgY29uc3QgcHJvcGVydHkgPSBqc2NzLnByb3BlcnR5KCdpbml0JywgaWROb2RlLCBpZE5vZGUpO1xuICAgICAgcHJvcGVydHkuc2hvcnRoYW5kID0gdHJ1ZTtcbiAgICAgIHJldHVybiBqc2NzLnZhcmlhYmxlRGVjbGFyYXRpb24oXG4gICAgICAgICdjb25zdCcsXG4gICAgICAgIFtqc2NzLnZhcmlhYmxlRGVjbGFyYXRvcihcbiAgICAgICAgICBvbmVMaW5lT2JqZWN0UGF0dGVybihqc2NzLm9iamVjdFBhdHRlcm4oW3Byb3BlcnR5XSkpLFxuICAgICAgICAgIGpzY3MuY2FsbEV4cHJlc3Npb24oXG4gICAgICAgICAgICBqc2NzLmlkZW50aWZpZXIoJ3JlcXVpcmUnKSxcbiAgICAgICAgICAgIFtsaXRlcmFsTm9kZV1cbiAgICAgICAgICApXG4gICAgICAgICldXG4gICAgICApO1xuICAgIH0gZWxzZSBpZiAoIWRlc3RydWN0dXJlICYmICFvcHRpb25zLnR5cGVJbXBvcnQpIHtcbiAgICAgIC8vIHZhciBmb28gPSByZXF1aXJlKCdmb28nKTtcbiAgICAgIHJldHVybiBqc2NzLnZhcmlhYmxlRGVjbGFyYXRpb24oXG4gICAgICAgICdjb25zdCcsXG4gICAgICAgIFtqc2NzLnZhcmlhYmxlRGVjbGFyYXRvcihcbiAgICAgICAgICBpZE5vZGUsXG4gICAgICAgICAganNjcy5jYWxsRXhwcmVzc2lvbihcbiAgICAgICAgICAgIGpzY3MuaWRlbnRpZmllcigncmVxdWlyZScpLFxuICAgICAgICAgICAgW2xpdGVyYWxOb2RlXVxuICAgICAgICAgIClcbiAgICAgICAgKV1cbiAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gQ2FuJ3QgaGFuZGxlIHRoaXMgdHlwZSBvZiByZXF1aXJlIHlldC5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGdldEJ1aWx0SW5zKCk6IFNldDxJZGVudGlmaWVyPiB7XG4gICAgcmV0dXJuIHRoaXMuX2J1aWx0SW5zO1xuICB9XG5cbiAgZ2V0QnVpbHRJblR5cGVzKCk6IFNldDxJZGVudGlmaWVyPiB7XG4gICAgcmV0dXJuIHRoaXMuX2J1aWx0SW5UeXBlcztcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IE1vZHVsZU1hcDtcbiJdfQ==