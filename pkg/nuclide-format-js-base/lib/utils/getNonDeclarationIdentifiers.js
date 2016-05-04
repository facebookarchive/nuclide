function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _getNamesFromID = require('./getNamesFromID');

var _getNamesFromID2 = _interopRequireDefault(_getNamesFromID);

var _jscodeshift = require('jscodeshift');

var _jscodeshift2 = _interopRequireDefault(_jscodeshift);

var REACT_NODE = _jscodeshift2.default.identifier('React');

/**
 * These are the ways in which one might access an undeclared identifier. This
 * should only apply to actual code, not accessing undeclared types.
 */
var CONFIG = [
// foo;
{
  searchTerms: [_jscodeshift2.default.ExpressionStatement],
  getNodes: function getNodes(path) {
    return [path.node.expression];
  }
},

// foo(bar);
{
  searchTerms: [_jscodeshift2.default.CallExpression],
  getNodes: function getNodes(path) {
    return [path.node.callee].concat(path.node.arguments);
  }
},

// foo.declared;
{
  searchTerms: [_jscodeshift2.default.MemberExpression],
  getNodes: function getNodes(path) {
    return [path.node.object];
  }
},

// foo = bar;
{
  searchTerms: [_jscodeshift2.default.AssignmentExpression],
  getNodes: function getNodes(path) {
    return [path.node.left, path.node.right];
  }
},

// class declared extends foo {}
{
  searchTerms: [_jscodeshift2.default.ClassDeclaration],
  getNodes: function getNodes(path) {
    return [path.node.superClass];
  }
},

// var declared = foo;
{
  searchTerms: [_jscodeshift2.default.VariableDeclarator],
  getNodes: function getNodes(path) {
    return [path.node.init];
  }
},

// switch (declared) { case foo: break; }
{
  searchTerms: [_jscodeshift2.default.SwitchCase],
  getNodes: function getNodes(path) {
    return [path.node.test];
  }
},

// {declared: foo}
{
  searchTerms: [_jscodeshift2.default.ObjectExpression],
  // Generally props have a value, if it is a spread property it doesn't.
  getNodes: function getNodes(path) {
    return path.node.properties.map(function (prop) {
      return prop.value || prop;
    });
  }
},

// return foo;
{
  searchTerms: [_jscodeshift2.default.ReturnStatement],
  getNodes: function getNodes(path) {
    return [path.node.argument];
  }
},

// if (foo) {}
{
  searchTerms: [_jscodeshift2.default.IfStatement],
  getNodes: function getNodes(path) {
    return [path.node.test];
  }
},

// switch (foo) {}
{
  searchTerms: [_jscodeshift2.default.SwitchStatement],
  getNodes: function getNodes(path) {
    return [path.node.discriminant];
  }
},

// !foo;
{
  searchTerms: [_jscodeshift2.default.UnaryExpression],
  getNodes: function getNodes(path) {
    return [path.node.argument];
  }
},

// foo || bar;
{
  searchTerms: [_jscodeshift2.default.BinaryExpression],
  getNodes: function getNodes(path) {
    return [path.node.left, path.node.right];
  }
},

// foo < bar;
{
  searchTerms: [_jscodeshift2.default.LogicalExpression],
  getNodes: function getNodes(path) {
    return [path.node.left, path.node.right];
  }
},

// foo ? bar : baz;
{
  searchTerms: [_jscodeshift2.default.ConditionalExpression],
  getNodes: function getNodes(path) {
    return [path.node.test, path.node.alternate, path.node.consequent];
  }
},

// new Foo()
{
  searchTerms: [_jscodeshift2.default.NewExpression],
  getNodes: function getNodes(path) {
    return [path.node.callee].concat(path.node.arguments);
  }
},

// foo++;
{
  searchTerms: [_jscodeshift2.default.UpdateExpression],
  getNodes: function getNodes(path) {
    return [path.node.argument];
  }
},

// <Element attribute={foo} />
{
  searchTerms: [_jscodeshift2.default.JSXExpressionContainer],
  getNodes: function getNodes(path) {
    return [path.node.expression];
  }
},

// for (foo in bar) {}
{
  searchTerms: [_jscodeshift2.default.ForInStatement],
  getNodes: function getNodes(path) {
    return [path.node.left, path.node.right];
  }
},

// for (foo of bar) {}
{
  searchTerms: [_jscodeshift2.default.ForOfStatement],
  getNodes: function getNodes(path) {
    return [path.node.left, path.node.right];
  }
},

// for (foo; bar; baz) {}
{
  searchTerms: [_jscodeshift2.default.ForStatement],
  getNodes: function getNodes(path) {
    return [path.node.init, path.node.test, path.node.update];
  }
},

// while (foo) {}
{
  searchTerms: [_jscodeshift2.default.WhileStatement],
  getNodes: function getNodes(path) {
    return [path.node.test];
  }
},

// do {} while (foo)
{
  searchTerms: [_jscodeshift2.default.DoWhileStatement],
  getNodes: function getNodes(path) {
    return [path.node.test];
  }
},

// [foo]
{
  searchTerms: [_jscodeshift2.default.ArrayExpression],
  getNodes: function getNodes(path) {
    return path.node.elements;
  }
},

// Special case. Any JSX elements will get transpiled to use React.
{
  searchTerms: [_jscodeshift2.default.JSXOpeningElement],
  getNodes: function getNodes(path) {
    return [REACT_NODE];
  }
},

// foo`something`
{
  searchTerms: [_jscodeshift2.default.TaggedTemplateExpression],
  getNodes: function getNodes(path) {
    return [path.node.tag];
  }
},

// `${bar}`
{
  searchTerms: [_jscodeshift2.default.TemplateLiteral],
  getNodes: function getNodes(path) {
    return path.node.expressions;
  }
},

// function foo(a = b) {}
{
  searchTerms: [_jscodeshift2.default.AssignmentPattern],
  getNodes: function getNodes(path) {
    return [path.node.right];
  }
}];

/**
 * This will get a list of all identifiers that are not from a declaration.
 *
 * NOTE: this can get identifiers that are declared, if you want access to
 * identifiers that are access but undeclared see getUndeclaredIdentifiers
 */
function getNonDeclarationIdentifiers(root) {
  var ids = new Set();
  CONFIG.forEach(function (config) {
    root.find(config.searchTerms[0], config.searchTerms[1]).forEach(function (path) {
      var nodes = config.getNodes(path);
      nodes.forEach(function (node) {
        var names = (0, _getNamesFromID2.default)(node);
        for (var _name of names) {
          ids.add(_name);
        }
      });
    });
  });
  return ids;
}

module.exports = getNonDeclarationIdentifiers;