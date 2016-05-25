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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _utilsModuleMapUtils2;

function _utilsModuleMapUtils() {
  return _utilsModuleMapUtils2 = _interopRequireDefault(require('../utils/ModuleMapUtils'));
}

var _optionsOptions2;

function _optionsOptions() {
  return _optionsOptions2 = _interopRequireDefault(require('../options/Options'));
}

var _jscodeshift2;

function _jscodeshift() {
  return _jscodeshift2 = _interopRequireDefault(require('jscodeshift'));
}

var _utilsOneLineObjectPattern2;

function _utilsOneLineObjectPattern() {
  return _utilsOneLineObjectPattern2 = _interopRequireDefault(require('../utils/oneLineObjectPattern'));
}

var statement = (_jscodeshift2 || _jscodeshift()).default.template.statement;

var ModuleMap = (function () {
  function ModuleMap(options) {
    _classCallCheck(this, ModuleMap);

    (_optionsOptions2 || _optionsOptions()).default.validateModuleMapOptions(options);

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
      ids = (_utilsModuleMapUtils2 || _utilsModuleMapUtils()).default.getIdentifiersFromPath(filePath);
      var literal = (_utilsModuleMapUtils2 || _utilsModuleMapUtils()).default.getLiteralFromPath(filePath);
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
      ids = (_utilsModuleMapUtils2 || _utilsModuleMapUtils()).default.getIdentifiersFromPath(filePath);
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
      (_optionsOptions2 || _optionsOptions()).default.validateRequireOptions(options);

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
        literal = (_utilsModuleMapUtils2 || _utilsModuleMapUtils()).default.relativizeForRequire(options.sourcePath,
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
          literal = (_utilsModuleMapUtils2 || _utilsModuleMapUtils()).default.relativizeForRequire(nonNullSourcePath, filePath);
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
      var idNode = (_jscodeshift2 || _jscodeshift()).default.identifier(id);
      var literalNode = (_jscodeshift2 || _jscodeshift()).default.literal(literal);

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
        var property = (_jscodeshift2 || _jscodeshift()).default.property('init', idNode, idNode);
        property.shorthand = true;
        return (_jscodeshift2 || _jscodeshift()).default.variableDeclaration('const', [(_jscodeshift2 || _jscodeshift()).default.variableDeclarator((0, (_utilsOneLineObjectPattern2 || _utilsOneLineObjectPattern()).default)((_jscodeshift2 || _jscodeshift()).default.objectPattern([property])), (_jscodeshift2 || _jscodeshift()).default.callExpression((_jscodeshift2 || _jscodeshift()).default.identifier('require'), [literalNode]))]);
      } else if (!destructure && !options.typeImport) {
        // var foo = require('foo');
        return (_jscodeshift2 || _jscodeshift()).default.variableDeclaration('const', [(_jscodeshift2 || _jscodeshift()).default.variableDeclarator(idNode, (_jscodeshift2 || _jscodeshift()).default.callExpression((_jscodeshift2 || _jscodeshift()).default.identifier('require'), [literalNode]))]);
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