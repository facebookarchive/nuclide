'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ExportManager = undefined;
exports.getExportsFromAst = getExportsFromAst;
exports.idFromFileName = idFromFileName;

var _babelTypes;

function _load_babelTypes() {
  return _babelTypes = _interopRequireWildcard(require('babel-types'));
}

var _ExportIndex;

function _load_ExportIndex() {
  return _ExportIndex = require('./ExportIndex');
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _collection;

function _load_collection() {
  return _collection = require('nuclide-commons/collection');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _Settings;

function _load_Settings() {
  return _Settings = require('../Settings');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

const logger = (0, (_log4js || _load_log4js()).getLogger)();

function getExportsFromAst(fileUri, ast) {
  const exports = [];
  try {
    traverseTreeAndIndexExports(ast, fileUri, exports);
  } catch (err) {
    logger.warn(`Error getting exports from ${fileUri}:`, err);
  }
  return exports;
}

class ExportManager {

  constructor() {
    this._exportIndex = new (_ExportIndex || _load_ExportIndex()).ExportIndex();
  }

  setExportsForFile(fileUri, exports) {
    this._exportIndex.setAll(fileUri, exports);
  }

  clearExportsFromFile(fileUri) {
    this._exportIndex.clearExportsFromFile(fileUri);
  }

  addFile(fileUri, ast) {
    const exports = [];
    traverseTreeAndIndexExports(ast, fileUri, exports);
    this._exportIndex.setAll(fileUri, exports);
  }

  hasExport(id) {
    return this._exportIndex.hasExport(id);
  }

  getExportsIndex() {
    return this._exportIndex;
  }
}

exports.ExportManager = ExportManager;
function isModuleExports(node) {
  return (_babelTypes || _load_babelTypes()).isMemberExpression(node.left) && node.left.object.name === 'module' && node.left.property.name === 'exports';
}

function addModuleExports(rightNode, fileUri, exportIndex) {
  const isTypeExport = false; // You can only module.exports a value (not a type)
  expressionToExports(rightNode, isTypeExport, fileUri).forEach(exp => {
    exportIndex.push(exp);
  });
}

function addDefaultDeclarationToExportIndex(node, fileUri, exportIndex) {
  // Only values can be exported as default (not types)
  const isTypeExport = false;
  const isDefault = true;

  if ((_babelTypes || _load_babelTypes()).isObjectExpression(node.declaration)) {
    // (ex: export default {someObject, otherObject})
    // Assume the id will be the name of the file.
    const id = idFromFileName(fileUri);
    exportIndex.push({ id, uri: fileUri, isDefault, isTypeExport });
    return;
  }

  declarationToExport(node.declaration, isTypeExport, fileUri, isDefault).forEach(exp => {
    exportIndex.push(exp);
  });
}

function addNamedDeclarationToExportIndex(node, fileUri, exportIndex) {
  const isDefault = false;
  // export class Foo
  if (node && node.declaration) {
    const { declaration, exportKind } = node;
    declarationToExport(declaration, exportKind === 'type', fileUri, isDefault).forEach(exp => {
      exportIndex.push(exp);
    });
  } else if (node.specifiers) {
    // export {foo, bar} from ...
    const { exportKind } = node;
    node.specifiers.forEach(specifier => {
      exportIndex.push(specifierToExport(specifier, fileUri, exportKind === 'type', isDefault));
    });
  } else {
    throw new Error('ExportNamedDeclaration without declaration or specifiers');
  }
}

function specifierToExport(node, fileUri, isTypeExport, isDefault) {
  return {
    id: node.exported.name,
    uri: fileUri,
    isTypeExport,
    isDefault
  };
}

function expressionToExports(expression, isTypeExport, fileUri) {
  if (expression.id || expression.name) {
    return [{
      id: expression.name || expression.id.name,
      uri: fileUri,
      type: expression.type,
      isTypeExport,
      isDefault: true }];
  }
  if ((_babelTypes || _load_babelTypes()).isObjectExpression(expression)) {
    const {
      shouldIndexObjectAsDefault,
      shouldIndexEachObjectProperty
    } = (_Settings || _load_Settings()).Settings.moduleExportsSettings;

    // Index the entire object as a default export
    const defaultExport = shouldIndexObjectAsDefault ? [{
      id: idFromFileName(fileUri),
      uri: fileUri,
      type: 'ObjectExpression',
      isTypeExport,
      isDefault: true }] : [];

    // Index each property of the object
    const propertyExports = shouldIndexEachObjectProperty ? (0, (_collection || _load_collection()).arrayCompact)(expression.properties.map(property => {
      if (property.type === 'SpreadProperty') {
        return null;
      }
      return {
        id: property.key.name,
        uri: fileUri,
        type: expression.type,
        isTypeExport,
        isDefault: false
      };
    })) : [];

    return defaultExport.concat(propertyExports);
  }
  if ((_babelTypes || _load_babelTypes()).isAssignmentExpression(expression) && (_babelTypes || _load_babelTypes()).isIdentifier(expression.left)) {
    return [{
      id: expression.left.name,
      uri: fileUri,
      type: expression.type,
      isTypeExport,
      isDefault: true }];
  }
  return [];
}

function declarationToExport(declaration, isTypeExport, fileUri, isDefault) {
  // export MyType;
  if (declaration.id || declaration.name) {
    return [{
      id: declaration.name || declaration.id.name,
      uri: fileUri,
      type: declaration.type,
      isTypeExport,
      isDefault
    }];
  }
  // export const x = 3;
  if (declaration.declarations) {
    const { declarations } = declaration;
    // We currently use map but if there were more than one, there would be a
    // lint error (one-var) so we could simplify this by just taking the first element of the array.
    return declarations.map(decl => {
      return {
        id: decl.id.name,
        uri: fileUri,
        type: declaration.type,
        isTypeExport,
        isDefault
      };
    });
  }
  // Unnamed default exports
  if (isDefault === true) {
    return [{
      id: idFromFileName(fileUri),
      uri: fileUri,
      isTypeExport: false,
      type: declaration.type,
      isDefault
    }];
  }
  return [];
}

function traverseTreeAndIndexExports(ast, fileUri, exportIndex) {
  // As an optimization, only traverse top-level nodes instead of the whole AST.
  if (ast && ast.program && ast.program.body) {
    const { body } = ast.program;
    body.forEach(node => {
      const { type } = node;
      switch (type) {
        case 'ExportNamedDeclaration':
          addNamedDeclarationToExportIndex(node, fileUri, exportIndex);
          break;
        case 'ExportDefaultDeclaration':
          addDefaultDeclarationToExportIndex(node, fileUri, exportIndex);
          break;
        case 'ExpressionStatement':
          if (node.expression && node.expression.type === 'AssignmentExpression' && isModuleExports(node.expression)) {
            addModuleExports(node.expression.right, fileUri, exportIndex);
          }
          break;
      }
    });
  }
}

function idFromFileName(fileUri) {
  const fileName = (_nuclideUri || _load_nuclideUri()).default.basename(fileUri);
  const dotIndex = fileName.indexOf('.');
  const stripped = dotIndex >= 0 ? fileName.substr(0, dotIndex) : fileName;
  return stripped.indexOf('-') >= 0 ? dashToCamelCase(stripped) : stripped;
}

function dashToCamelCase(string) {
  return string // Maintain capitalization of the first "word"
  ? string.split('-').map((el, i) => i === 0 ? el : capitalize(el)).join('') : '';
}

function capitalize(word) {
  if (!word) {
    return '';
  }
  return word[0].toUpperCase() + word.slice(1);
}