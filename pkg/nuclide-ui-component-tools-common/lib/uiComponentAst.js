'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getComponentNameFromUri = getComponentNameFromUri;
exports.parseCode = parseCode;
exports.formatLeadingComment = formatLeadingComment;
exports.getDefaultPropNames = getDefaultPropNames;
exports.getRequiredPropsFromAst = getRequiredPropsFromAst;
exports.getRequiredProps = getRequiredProps;
exports.getLeadingCommentForComponent = getLeadingCommentForComponent;

var _babylon;

function _load_babylon() {
  return _babylon = require('babylon');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _AutoImportsManager;

function _load_AutoImportsManager() {
  return _AutoImportsManager = require('../../nuclide-js-imports-server/src/lib/AutoImportsManager');
}

var _utils;

function _load_utils() {
  return _utils = require('./utils');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */

// TODO: T29733418 Figure out a typed import for babylon or @babel/parser.
// flowlint-next-line untyped-import:off
const babelParserOptions = (_AutoImportsManager || _load_AutoImportsManager()).babylonOptions;

function getComponentNameFromUri(uri) {
  const basename = (_nuclideUri || _load_nuclideUri()).default.basename(uri);
  const componentName = basename.split('.')[0];
  if (componentName.length === 0) {
    return null;
  }

  return componentName;
}

function parseCode(code) {
  try {
    return (0, (_babylon || _load_babylon()).parse)(code, babelParserOptions);
  } catch (_error) {
    // This will be a common error when parse fails on this string of code.
    // Logging this would likely be far more noise than signal.
    return null;
  }
}

function isComponent(node) {
  return node.type === 'ClassDeclaration' && node.superClass;
}

function getComponentNode(componentName, ast) {
  return ast.program.body.find(n => isComponent(n) && n.id && n.id.name === componentName);
}

function getTypeParameterNames(componentName, ast) {
  const componentNode = getComponentNode(componentName, ast);
  if (!componentNode) {
    return [];
  }
  if (componentNode.superTypeParameters == null || componentNode.superTypeParameters.params == null) {
    return [];
  }
  return componentNode.superTypeParameters.params.map(p => p.type === 'GenericTypeAnnotation' && p.id.name);
}

function getTypeAnnotation(node) {
  // Get the actual name of the type instead of something like
  // 'GenericTypeAnnotation'.
  if (node.value.id) {
    return node.value.id.name;
  }

  // Primitive types such as 'string' and 'number' won't have an id.
  return node.value.type;
}

function formatLeadingComment(comment) {
  return comment.split('\n')
  // Remove any leading asterisks.
  .map(l => (0, (_utils || _load_utils()).removePrefix)('*', l.trim()).trim())
  // Filter any blank lines before and after the entire text.
  .filter((l, i, arr) => i > 0 && i < arr.length - 2 && arr[i + 1].length > 0 || l.length > 0)
  // Join lines together, but preserve extra newlines in the text.
  // e.g., Hello\nGoodbye becomes "Hello Goodbye" but "Hello\n\nGoodbye"
  // remains "Hello\n\nGoodbye".
  .reduce((res, line, i, arr) => {
    if (i === 0) {
      return line;
    }

    if (line.length === 0) {
      return res + '\n\n';
    }

    if (arr[i - 1].length > 0) {
      return res + ' ' + line;
    }

    return res + line;
  }, '');
}

function getLeadingComment(node) {
  if (!node.leadingComments) {
    return null;
  }

  // Remove trailing whitespace, trailing empty lines, and leading asterisk.
  return formatLeadingComment(node.leadingComments[node.leadingComments.length - 1].value);
}

function getDefaultPropsFromIdentifier(identifier, ast) {
  for (let i = 0; i < ast.program.body.length; i++) {
    const node = ast.program.body[i];
    if (node.type !== 'VariableDeclaration') {
      continue;
    }

    const expr = node.declarations.find(n => n.type === 'VariableDeclarator' && n.id.type === 'Identifier' && n.id.name === identifier);
    if (!expr) {
      continue;
    }

    if (expr.init && expr.init.type === 'ObjectExpression') {
      return getDefaultPropsFromObjectExpression(expr.init);
    }
    return [];
  }
  return [];
}

function getDefaultPropsFromObjectExpression(expr) {
  return expr.properties.filter(n => n.type === 'ObjectProperty' && n.key.type === 'Identifier').map(n => n.key.name);
}

function getDefaultPropNames(componentName, ast) {
  const componentNode = getComponentNode(componentName, ast);
  if (!componentNode || !componentNode.body || componentNode.body.type !== 'ClassBody') {
    return [];
  }

  const defaultPropsStaticNode = componentNode.body.body.find(n => n.type === 'ClassProperty' && n.static && n.key.name === 'defaultProps');
  if (!defaultPropsStaticNode || !defaultPropsStaticNode.value) {
    return [];
  }
  if (defaultPropsStaticNode.value.type === 'Identifier') {
    return getDefaultPropsFromIdentifier(defaultPropsStaticNode.value.name, ast);
  } else if (defaultPropsStaticNode.value.type === 'ObjectExpression') {
    return getDefaultPropsFromObjectExpression(defaultPropsStaticNode.value);
  }

  return [];
}

function getObjectTypeProperties(node) {
  if (!node.declaration.right) {
    return null;
  }

  const n = node.declaration.right;
  if (n.type === 'ObjectTypeAnnotation') {
    return node.declaration.right.properties;
  }

  // Only support the $Exact utility. We could recurse and support other utility
  // types but then we would need more logic and we'd start just re-writing
  // Flow. Traversing one $Exact utility type is sufficient for these purposes.
  // We don't want to support something like $Rest or $Diff.
  if (n.type === 'GenericTypeAnnotation' && n.id.name === '$Exact' && n.typeParameters.type === 'TypeParameterInstantiation' &&
  // The $Exact utility will only have one parameter. Anything more
  // complicated and we abandon ship.
  n.typeParameters.params.length === 1 && n.typeParameters.params[0].type === 'ObjectTypeAnnotation') {
    return n.typeParameters.params[0].properties;
  }
}

function getRequiredPropsFromAst(componentName, ast) {
  const typeParameterNames = getTypeParameterNames(componentName, ast);

  const requiredProps = ast.program.body.filter(node => node.exportKind === 'type' && node.declaration && node.declaration.right &&
  // Ensure this type is in the component's class generics.
  // i.e., ``class Foo extends Component<Props>`` means this type should
  // be named "Props".
  typeParameterNames.includes(node.declaration.id.name)).reduce((props, node) => {
    const properties = getObjectTypeProperties(node);
    if (properties == null) {
      return props;
    }

    const required = properties
    // There could be properties with a type such as
    // ObjectTypeSpreadProperty which would require more logic to
    // include.
    .filter(n => !n.optional && n.type === 'ObjectTypeProperty' && n.key).map(n => {
      const leadingComment = getLeadingComment(n);
      return Object.assign({
        name: n.key.name,
        typeAnnotation: getTypeAnnotation(n)
      }, leadingComment == null ? {} : { leadingComment });
    });
    return props.concat(required);
  }, []);

  return requiredProps;
}

// This is used for testing purposes. ASTs are expensive to compute and thus
// should be re-used by passing instances to `getRequiredPropsFromAst`.
function getRequiredProps(componentName, code) {
  const ast = parseCode(code);
  if (ast == null) {
    return [];
  }

  return getRequiredPropsFromAst(componentName, ast);
}

function getLeadingCommentForComponent(componentName, ast) {
  const componentNode = getComponentNode(componentName, ast);
  if (!componentNode) {
    return null;
  }

  return getLeadingComment(componentNode);
}