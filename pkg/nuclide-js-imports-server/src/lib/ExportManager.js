'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ExportManager = undefined;
exports.getExportsFromAst = getExportsFromAst;
exports.idFromFileName = idFromFileName;

var _types;

function _load_types() {
  return _types = _interopRequireWildcard(require('@babel/types'));
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
  return _collection = require('../../../../modules/nuclide-commons/collection');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../../modules/nuclide-commons/nuclideUri'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

const logger = (0, (_log4js || _load_log4js()).getLogger)(); /**
                                                              * Copyright (c) 2015-present, Facebook, Inc.
                                                              * All rights reserved.
                                                              *
                                                              * This source code is licensed under the license found in the LICENSE file in
                                                              * the root directory of this source tree.
                                                              *
                                                              * 
                                                              * @format
                                                              */

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
  return (_types || _load_types()).isMemberExpression(node) && node.object.name === 'module' && node.property.name === 'exports' || (_types || _load_types()).isIdentifier(node) && node.name === 'exports';
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

  if ((_types || _load_types()).isObjectExpression(node.declaration)) {
    // (ex: export default {someObject, otherObject})
    // Assume the id will be the name of the file.
    const id = idFromFileName(fileUri);
    exportIndex.push({
      id,
      uri: fileUri,
      line: node.loc.start.line,
      isDefault,
      isTypeExport
    });
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
    line: node.loc.start.line,
    isTypeExport,
    isDefault
  };
}

function expressionToExports(expression, isTypeExport, fileUri) {
  // Index the entire 'module.exports' as a default export.
  const defaultId = idFromFileName(fileUri);
  const result = [{
    id: defaultId,
    uri: fileUri,
    line: expression.loc.start.line,
    type: 'ObjectExpression',
    isTypeExport,
    isDefault: true
  }];

  const ident = expression.id != null ? expression.id.name : expression.name;
  if (ident && ident !== defaultId) {
    result.push({
      id: ident,
      uri: fileUri,
      line: expression.loc.start.line,
      type: expression.type,
      isTypeExport,
      isDefault: true // Treated as default export
    });
  } else if ((_types || _load_types()).isObjectExpression(expression)) {
    // Index each property of the object
    const propertyExports = (0, (_collection || _load_collection()).arrayCompact)(expression.properties.map(property => {
      if (property.type === 'SpreadElement' || property.computed) {
        return null;
      }
      return {
        id: property.key.type === 'StringLiteral' ? property.key.value : property.key.name,
        uri: fileUri,
        line: property.key.loc.start.line,
        type: expression.type,
        isTypeExport,
        isDefault: false
      };
    }));
    return result.concat(propertyExports);
  } else if ((_types || _load_types()).isAssignmentExpression(expression) && (_types || _load_types()).isIdentifier(expression.left) && expression.left.name !== defaultId) {
    result.push({
      id: expression.left.name,
      uri: fileUri,
      line: expression.left.loc.start.line,
      type: expression.right.type,
      isTypeExport,
      isDefault: true // Treated as default export
    });
  }
  return result;
}

function declarationToExport(declaration, isTypeExport, fileUri, isDefault) {
  // export MyType;
  if (declaration.id || declaration.name) {
    return [{
      id: declaration.name || declaration.id.name,
      uri: fileUri,
      line: declaration.loc.start.line,
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
        line: decl.id.loc.start.line,
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
      line: declaration.loc.start.line,
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
          if (node.expression && node.expression.type === 'AssignmentExpression') {
            const { left, right } = node.expression;
            if (isModuleExports(left)) {
              addModuleExports(right, fileUri, exportIndex);
            } else if ((_types || _load_types()).isMemberExpression(left) && isModuleExports(left.object) && (_types || _load_types()).isIdentifier(left.property)) {
              exportIndex.push({
                id: left.property.name,
                uri: fileUri,
                line: left.property.loc.start.line,
                type:
                // Exclude easy cases from being imported as types.
                right.type === 'ObjectExpression' || right.type === 'FunctionExpression' || right.type === 'NumericLiteral' || right.type === 'StringLiteral' ? right.type : undefined,
                isTypeExport: false,
                isDefault: false
              });
            }
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