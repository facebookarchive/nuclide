Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.astToOutline = astToOutline;

var _commons = require('../../commons');

function astToOutline(ast) {
  return itemsToTrees(ast.body);
}

function itemsToTrees(items) {
  return _commons.array.compact(items.map(itemToTree));
}

function itemToTree(item) {
  if (item == null) {
    return null;
  }
  var location = getLocation(item);
  switch (item.type) {
    case 'FunctionDeclaration':
      return _extends({
        displayText: 'function ' + item.id.name + '(' + paramsString(item.params) + ')',
        children: []
      }, location);
    case 'ClassDeclaration':
      return _extends({
        displayText: 'class ' + item.id.name,
        children: itemsToTrees(item.body.body)
      }, location);
    case 'MethodDefinition':
      return _extends({
        displayText: item.key.name + '(' + paramsString(item.value.params) + ')',
        children: []
      }, location);
    case 'ExportDeclaration':
      var tree = itemToTree(item.declaration);
      if (tree == null) {
        return null;
      }
      return _extends({
        displayText: 'export ' + tree.displayText,
        children: tree.children
      }, location);
    case 'ExpressionStatement':
      return specOutline(item, /* describeOnly */true);
    default:
      return null;
  }
}

function getLocation(item) {
  return {
    // It definitely makes sense that the lines we get are 1-based and the columns are
    // 0-based... convert to 0-based all around.
    startLine: item.loc.start.line - 1,
    startColumn: item.loc.start.column
  };
}

function paramsString(params) {
  return params.map(function (param) {
    return param.name;
  }).join(', ');
}

function specOutline(expressionStatement) {
  var describeOnly = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

  var expression = expressionStatement.expression;
  if (expression.type !== 'CallExpression') {
    return null;
  }
  var functionName = expression.callee.name;
  if (functionName !== 'describe') {
    if (describeOnly || functionName !== 'it') {
      return null;
    }
  }
  var description = getStringLiteralValue(expression.arguments[0]);
  var specBody = getFunctionBody(expression.arguments[1]);
  if (description == null || specBody == null) {
    return null;
  }
  var children = undefined;
  if (functionName === 'it') {
    children = [];
  } else {
    children = _commons.array.compact(specBody.filter(function (item) {
      return item.type === 'ExpressionStatement';
    }).map(function (item) {
      return specOutline(item);
    }));
  }
  return _extends({
    displayText: expression.callee.name + ' ' + description,
    children: children
  }, getLocation(expressionStatement));
}

/** If the given AST Node is a string literal, return its literal value. Otherwise return null */
function getStringLiteralValue(literal) {
  if (literal == null) {
    return null;
  }
  if (literal.type !== 'Literal') {
    return null;
  }
  var value = literal.value;
  if (typeof value !== 'string') {
    return null;
  }
  return value;
}

function getFunctionBody(fn) {
  if (fn == null) {
    return null;
  }
  if (fn.type !== 'ArrowFunctionExpression' && fn.type !== 'FunctionExpression') {
    return null;
  }
  return fn.body.body;
}
//# sourceMappingURL=data:application/json;base64,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LEVBQUU7QUFDN0IsV0FBTyxJQUFJLENBQUM7R0FDYjtBQUNELFNBQU8sS0FBSyxDQUFDO0NBQ2Q7O0FBRUQsU0FBUyxlQUFlLENBQUMsRUFBUSxFQUFlO0FBQzlDLE1BQUksRUFBRSxJQUFJLElBQUksRUFBRTtBQUNkLFdBQU8sSUFBSSxDQUFDO0dBQ2I7QUFDRCxNQUFJLEVBQUUsQ0FBQyxJQUFJLEtBQUsseUJBQXlCLElBQUksRUFBRSxDQUFDLElBQUksS0FBSyxvQkFBb0IsRUFBRTtBQUM3RSxXQUFPLElBQUksQ0FBQztHQUNiO0FBQ0QsU0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztDQUNyQiIsImZpbGUiOiJhc3RUb091dGxpbmUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7Rmxvd091dGxpbmVUcmVlLCBGbG93U3RhcnRMb2NhdGlvbn0gZnJvbSAnLi9GbG93U2VydmljZSc7XG5pbXBvcnQge2FycmF5fSBmcm9tICcuLi8uLi9jb21tb25zJztcblxuZXhwb3J0IGZ1bmN0aW9uIGFzdFRvT3V0bGluZShhc3Q6IGFueSk6IEFycmF5PEZsb3dPdXRsaW5lVHJlZT4ge1xuICByZXR1cm4gaXRlbXNUb1RyZWVzKGFzdC5ib2R5KTtcbn1cblxuZnVuY3Rpb24gaXRlbXNUb1RyZWVzKGl0ZW1zOiBBcnJheTxhbnk+KTogQXJyYXk8Rmxvd091dGxpbmVUcmVlPiB7XG4gIHJldHVybiBhcnJheS5jb21wYWN0KGl0ZW1zLm1hcChpdGVtVG9UcmVlKSk7XG59XG5cbmZ1bmN0aW9uIGl0ZW1Ub1RyZWUoaXRlbTogYW55KTogP0Zsb3dPdXRsaW5lVHJlZSB7XG4gIGlmIChpdGVtID09IG51bGwpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBjb25zdCBsb2NhdGlvbiA9IGdldExvY2F0aW9uKGl0ZW0pO1xuICBzd2l0Y2ggKGl0ZW0udHlwZSkge1xuICAgIGNhc2UgJ0Z1bmN0aW9uRGVjbGFyYXRpb24nOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZGlzcGxheVRleHQ6IGBmdW5jdGlvbiAke2l0ZW0uaWQubmFtZX0oJHtwYXJhbXNTdHJpbmcoaXRlbS5wYXJhbXMpfSlgLFxuICAgICAgICBjaGlsZHJlbjogW10sXG4gICAgICAgIC4uLmxvY2F0aW9uLFxuICAgICAgfTtcbiAgICBjYXNlICdDbGFzc0RlY2xhcmF0aW9uJzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGRpc3BsYXlUZXh0OiBgY2xhc3MgJHtpdGVtLmlkLm5hbWV9YCxcbiAgICAgICAgY2hpbGRyZW46IGl0ZW1zVG9UcmVlcyhpdGVtLmJvZHkuYm9keSksXG4gICAgICAgIC4uLmxvY2F0aW9uLFxuICAgICAgfTtcbiAgICBjYXNlICdNZXRob2REZWZpbml0aW9uJzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGRpc3BsYXlUZXh0OiBgJHtpdGVtLmtleS5uYW1lfSgke3BhcmFtc1N0cmluZyhpdGVtLnZhbHVlLnBhcmFtcyl9KWAsXG4gICAgICAgIGNoaWxkcmVuOiBbXSxcbiAgICAgICAgLi4ubG9jYXRpb24sXG4gICAgICB9O1xuICAgIGNhc2UgJ0V4cG9ydERlY2xhcmF0aW9uJzpcbiAgICAgIGNvbnN0IHRyZWUgPSBpdGVtVG9UcmVlKGl0ZW0uZGVjbGFyYXRpb24pO1xuICAgICAgaWYgKHRyZWUgPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICAgIHJldHVybiB7XG4gICAgICAgIGRpc3BsYXlUZXh0OiBgZXhwb3J0ICR7dHJlZS5kaXNwbGF5VGV4dH1gLFxuICAgICAgICBjaGlsZHJlbjogdHJlZS5jaGlsZHJlbixcbiAgICAgICAgLi4ubG9jYXRpb24sXG4gICAgICB9O1xuICAgIGNhc2UgJ0V4cHJlc3Npb25TdGF0ZW1lbnQnOlxuICAgICAgcmV0dXJuIHNwZWNPdXRsaW5lKGl0ZW0sIC8qIGRlc2NyaWJlT25seSAqLyB0cnVlKTtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0TG9jYXRpb24oaXRlbTogYW55KTogRmxvd1N0YXJ0TG9jYXRpb24ge1xuICByZXR1cm4ge1xuICAgIC8vIEl0IGRlZmluaXRlbHkgbWFrZXMgc2Vuc2UgdGhhdCB0aGUgbGluZXMgd2UgZ2V0IGFyZSAxLWJhc2VkIGFuZCB0aGUgY29sdW1ucyBhcmVcbiAgICAvLyAwLWJhc2VkLi4uIGNvbnZlcnQgdG8gMC1iYXNlZCBhbGwgYXJvdW5kLlxuICAgIHN0YXJ0TGluZTogaXRlbS5sb2Muc3RhcnQubGluZSAtIDEsXG4gICAgc3RhcnRDb2x1bW46IGl0ZW0ubG9jLnN0YXJ0LmNvbHVtbixcbiAgfTtcbn1cblxuZnVuY3Rpb24gcGFyYW1zU3RyaW5nKHBhcmFtczogQXJyYXk8YW55Pik6IHN0cmluZyB7XG4gIHJldHVybiBwYXJhbXMubWFwKHBhcmFtID0+IHBhcmFtLm5hbWUpLmpvaW4oJywgJyk7XG59XG5cbmZ1bmN0aW9uIHNwZWNPdXRsaW5lKGV4cHJlc3Npb25TdGF0ZW1lbnQ6IGFueSwgZGVzY3JpYmVPbmx5OiBib29sZWFuID0gZmFsc2UpOiA/Rmxvd091dGxpbmVUcmVlIHtcbiAgY29uc3QgZXhwcmVzc2lvbiA9IGV4cHJlc3Npb25TdGF0ZW1lbnQuZXhwcmVzc2lvbjtcbiAgaWYgKGV4cHJlc3Npb24udHlwZSAhPT0gJ0NhbGxFeHByZXNzaW9uJykge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGNvbnN0IGZ1bmN0aW9uTmFtZSA9IGV4cHJlc3Npb24uY2FsbGVlLm5hbWU7XG4gIGlmIChmdW5jdGlvbk5hbWUgIT09ICdkZXNjcmliZScpIHtcbiAgICBpZiAoZGVzY3JpYmVPbmx5IHx8IGZ1bmN0aW9uTmFtZSAhPT0gJ2l0Jykge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG4gIGNvbnN0IGRlc2NyaXB0aW9uID0gZ2V0U3RyaW5nTGl0ZXJhbFZhbHVlKGV4cHJlc3Npb24uYXJndW1lbnRzWzBdKTtcbiAgY29uc3Qgc3BlY0JvZHkgPSBnZXRGdW5jdGlvbkJvZHkoZXhwcmVzc2lvbi5hcmd1bWVudHNbMV0pO1xuICBpZiAoZGVzY3JpcHRpb24gPT0gbnVsbCB8fCBzcGVjQm9keSA9PSBudWxsKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgbGV0IGNoaWxkcmVuO1xuICBpZiAoZnVuY3Rpb25OYW1lID09PSAnaXQnKSB7XG4gICAgY2hpbGRyZW4gPSBbXTtcbiAgfSBlbHNlIHtcbiAgICBjaGlsZHJlbiA9IGFycmF5LmNvbXBhY3QoXG4gICAgICBzcGVjQm9keVxuICAgICAgLmZpbHRlcihpdGVtID0+IGl0ZW0udHlwZSA9PT0gJ0V4cHJlc3Npb25TdGF0ZW1lbnQnKVxuICAgICAgLm1hcChpdGVtID0+IHNwZWNPdXRsaW5lKGl0ZW0pKSk7XG4gIH1cbiAgcmV0dXJuIHtcbiAgICBkaXNwbGF5VGV4dDogYCR7ZXhwcmVzc2lvbi5jYWxsZWUubmFtZX0gJHtkZXNjcmlwdGlvbn1gLFxuICAgIGNoaWxkcmVuLFxuICAgIC4uLmdldExvY2F0aW9uKGV4cHJlc3Npb25TdGF0ZW1lbnQpLFxuICB9O1xufVxuXG4vKiogSWYgdGhlIGdpdmVuIEFTVCBOb2RlIGlzIGEgc3RyaW5nIGxpdGVyYWwsIHJldHVybiBpdHMgbGl0ZXJhbCB2YWx1ZS4gT3RoZXJ3aXNlIHJldHVybiBudWxsICovXG5mdW5jdGlvbiBnZXRTdHJpbmdMaXRlcmFsVmFsdWUobGl0ZXJhbDogP2FueSk6ID9zdHJpbmcge1xuICBpZiAobGl0ZXJhbCA9PSBudWxsKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgaWYgKGxpdGVyYWwudHlwZSAhPT0gJ0xpdGVyYWwnKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgY29uc3QgdmFsdWUgPSBsaXRlcmFsLnZhbHVlO1xuICBpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHJldHVybiB2YWx1ZTtcbn1cblxuZnVuY3Rpb24gZ2V0RnVuY3Rpb25Cb2R5KGZuOiA/YW55KTogP0FycmF5PGFueT4ge1xuICBpZiAoZm4gPT0gbnVsbCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGlmIChmbi50eXBlICE9PSAnQXJyb3dGdW5jdGlvbkV4cHJlc3Npb24nICYmIGZuLnR5cGUgIT09ICdGdW5jdGlvbkV4cHJlc3Npb24nKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgcmV0dXJuIGZuLmJvZHkuYm9keTtcbn1cbiJdfQ==