

var getNamesFromID = require('./getNamesFromID');

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var jscs = require('jscodeshift');

var REACT_NODE = jscs.identifier('React');

/**
 * These are the ways in which one might access an undeclared identifier. This
 * should only apply to actual code, not accessing undeclared types.
 */
var CONFIG = [
// foo;
{
  searchTerms: [jscs.ExpressionStatement],
  getNodes: function getNodes(path) {
    return [path.node.expression];
  }
},

// foo(bar);
{
  searchTerms: [jscs.CallExpression],
  getNodes: function getNodes(path) {
    return [path.node.callee].concat(path.node.arguments);
  }
},

// foo.declared;
{
  searchTerms: [jscs.MemberExpression],
  getNodes: function getNodes(path) {
    return [path.node.object];
  }
},

// foo = bar;
{
  searchTerms: [jscs.AssignmentExpression],
  getNodes: function getNodes(path) {
    return [path.node.left, path.node.right];
  }
},

// class declared extends foo {}
{
  searchTerms: [jscs.ClassDeclaration],
  getNodes: function getNodes(path) {
    return [path.node.superClass];
  }
},

// var declared = foo;
{
  searchTerms: [jscs.VariableDeclarator],
  getNodes: function getNodes(path) {
    return [path.node.init];
  }
},

// switch (declared) { case foo: break; }
{
  searchTerms: [jscs.SwitchCase],
  getNodes: function getNodes(path) {
    return [path.node.test];
  }
},

// {declared: foo}
{
  searchTerms: [jscs.ObjectExpression],
  // Generally props have a value, if it is a spread property it doesn't.
  getNodes: function getNodes(path) {
    return path.node.properties.map(function (prop) {
      return prop.value || prop;
    });
  }
},

// return foo;
{
  searchTerms: [jscs.ReturnStatement],
  getNodes: function getNodes(path) {
    return [path.node.argument];
  }
},

// if (foo) {}
{
  searchTerms: [jscs.IfStatement],
  getNodes: function getNodes(path) {
    return [path.node.test];
  }
},

// switch (foo) {}
{
  searchTerms: [jscs.SwitchStatement],
  getNodes: function getNodes(path) {
    return [path.node.discriminant];
  }
},

// !foo;
{
  searchTerms: [jscs.UnaryExpression],
  getNodes: function getNodes(path) {
    return [path.node.argument];
  }
},

// foo || bar;
{
  searchTerms: [jscs.BinaryExpression],
  getNodes: function getNodes(path) {
    return [path.node.left, path.node.right];
  }
},

// foo < bar;
{
  searchTerms: [jscs.LogicalExpression],
  getNodes: function getNodes(path) {
    return [path.node.left, path.node.right];
  }
},

// foo ? bar : baz;
{
  searchTerms: [jscs.ConditionalExpression],
  getNodes: function getNodes(path) {
    return [path.node.test, path.node.alternate, path.node.consequent];
  }
},

// new Foo()
{
  searchTerms: [jscs.NewExpression],
  getNodes: function getNodes(path) {
    return [path.node.callee].concat(path.node.arguments);
  }
},

// foo++;
{
  searchTerms: [jscs.UpdateExpression],
  getNodes: function getNodes(path) {
    return [path.node.argument];
  }
},

// <Element attribute={foo} />
{
  searchTerms: [jscs.JSXExpressionContainer],
  getNodes: function getNodes(path) {
    return [path.node.expression];
  }
},

// for (foo in bar) {}
{
  searchTerms: [jscs.ForInStatement],
  getNodes: function getNodes(path) {
    return [path.node.left, path.node.right];
  }
},

// for (foo of bar) {}
{
  searchTerms: [jscs.ForOfStatement],
  getNodes: function getNodes(path) {
    return [path.node.left, path.node.right];
  }
},

// for (foo; bar; baz) {}
{
  searchTerms: [jscs.ForStatement],
  getNodes: function getNodes(path) {
    return [path.node.init, path.node.test, path.node.update];
  }
},

// while (foo) {}
{
  searchTerms: [jscs.WhileStatement],
  getNodes: function getNodes(path) {
    return [path.node.test];
  }
},

// do {} while (foo)
{
  searchTerms: [jscs.DoWhileStatement],
  getNodes: function getNodes(path) {
    return [path.node.test];
  }
},

// [foo]
{
  searchTerms: [jscs.ArrayExpression],
  getNodes: function getNodes(path) {
    return path.node.elements;
  }
},

// Special case. Any JSX elements will get transpiled to use React.
{
  searchTerms: [jscs.JSXOpeningElement],
  getNodes: function getNodes(path) {
    return [REACT_NODE];
  }
},

// foo`something`
{
  searchTerms: [jscs.TaggedTemplateExpression],
  getNodes: function getNodes(path) {
    return [path.node.tag];
  }
},

// `${bar}`
{
  searchTerms: [jscs.TemplateLiteral],
  getNodes: function getNodes(path) {
    return path.node.expressions;
  }
},

// function foo(a = b) {}
{
  searchTerms: [jscs.AssignmentPattern],
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
        var names = getNamesFromID(node);
        for (var _name of names) {
          ids.add(_name);
        }
      });
    });
  });
  return ids;
}

module.exports = getNonDeclarationIdentifiers;