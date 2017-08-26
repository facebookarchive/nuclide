'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UndefinedSymbolManager = undefined;

var _babelTraverse;

function _load_babelTraverse() {
  return _babelTraverse = _interopRequireDefault(require('babel-traverse'));
}

var _globals;

function _load_globals() {
  return _globals = _interopRequireDefault(require('globals'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Prevent babel-traverse from yelling about Flow types in the scope.
// We're not actually relying on this behavior here.
// (Can be removed with babel-traverse 6.8+)
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

(_babelTraverse || _load_babelTraverse()).default.Scope.prototype.warnOnFlowBinding = x => x;

const BUILT_IN_FLOW_TYPES = ['Iterator'];

class UndefinedSymbolManager {

  constructor(envs) {
    this.globals = new Set(BUILT_IN_FLOW_TYPES);
    envs.forEach(env => {
      Object.keys((_globals || _load_globals()).default[env]).forEach(globalVar => {
        this.globals.add(globalVar);
      });
    });
  }

  findUndefined(ast) {
    try {
      return traveseTreeForUndefined(ast, this.globals);
    } catch (error) {
      // babel-traverse throws errors when something is imported twice.
      // We try-catch to avoid logging any babel-traverse errors.
      // See https://github.com/babel/babel/issues/4640 for more information.
      return [];
    }
  }
}

exports.UndefinedSymbolManager = UndefinedSymbolManager;
function traveseTreeForUndefined(ast, globals) {
  const undefinedSymbols = [];
  const definedTypes = new Set();
  (0, (_babelTraverse || _load_babelTraverse()).default)(ast, {
    ImportDeclaration: path => {
      saveImports(path, definedTypes);
    },
    TypeAlias: path => {
      save(path, definedTypes);
    },
    DeclareClass: path => {
      save(path, definedTypes);
    },
    ClassDeclaration: path => {
      save(path, definedTypes);
    },
    InterfaceDeclaration: path => {
      save(path, definedTypes);
    },
    TypeParameter: path => {
      // Ideally, this would be aware of scope, but this is difficult to do. If
      // you use a generic parameter out of scope, this would currently not create
      // a diagnositc (but Flow would create one)
      saveTypeParameters(path, definedTypes);
    },
    ReferencedIdentifier(path) {
      findUndefinedValues(path, undefinedSymbols, globals);
    },
    GenericTypeAnnotation: {
      exit(path) {
        findUndefinedTypes(path, undefinedSymbols, globals);
      }
    }
  });
  return undefinedSymbols.filter(symbol => symbol.type === 'value' || !definedTypes.has(symbol.id));
}

function findUndefinedValues(path, undefinedSymbols, globals) {
  const { node, scope } = path;
  if (
  // Type Annotations are considered identifiers, so ignore them
  isTypeIdentifier(path.parent.type) ||
  // Other weird cases where we want to ignore identifiers
  path.parent.type === 'ExportSpecifier' || // export {a} from 'a' (a would be undefined)
  path.parent.type === 'QualifiedTypeIdentifier' || // SomeModule.SomeType
  globals.has(node.name) || scope.hasBinding(node.name)) {
    return;
  }

  undefinedSymbols.push({
    id: node.name,
    type: 'value',
    location: {
      start: { line: node.loc.start.line, col: node.loc.start.column },
      end: { line: node.loc.end.line, col: node.loc.end.column }
    }
  });
}

function findUndefinedTypes(path, undefinedSymbols, globals) {
  const { node, scope } = path;

  if (globals.has(node.id.name) || path.parent.type === 'TypeAlias' || path.parent.type === 'TypeofTypeAnnotation' || scope.hasBinding(node.id.name)) {
    return;
  }

  if (node.id && node.id.name) {
    undefinedSymbols.push({
      id: node.id.name,
      type: 'type',
      location: {
        start: { line: node.loc.start.line, col: node.loc.start.column },
        end: { line: node.loc.end.line, col: node.loc.end.column }
      }
    });
  }
}

function saveImports(path, definedTypes) {
  path.node.specifiers.forEach(specifier => {
    definedTypes.add(specifier.local.name);
  });
}

function save(path, definedTypes) {
  if (path.node.id) {
    definedTypes.add(path.node.id.name);
  }
}

function saveTypeParameters(path, definedTypes) {
  definedTypes.add(path.node.name);
}

function isTypeIdentifier(node) {
  return node === 'GenericTypeAnnotation' || node === 'ObjectTypeIndexer' || node === 'TypeAlias' || node === 'FunctionTypeParam' || node === 'ObjectTypeProperty' || node === 'InterfaceDeclaration' || node === 'DeclareClass' || node === 'InterfaceExtends';
}