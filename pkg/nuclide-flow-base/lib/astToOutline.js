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

var _nuclideCommons = require('../../nuclide-commons');

function astToOutline(ast) {
  return itemsToTrees(ast.body);
}

function itemsToTrees(items) {
  return _nuclideCommons.array.compact(items.map(itemToTree));
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
    children = _nuclideCommons.array.compact(specBody.filter(function (item) {
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
//# sourceMappingURL=data:application/json;base64,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UUFBUSxFQUFFO0FBQzdCLFdBQU8sSUFBSSxDQUFDO0dBQ2I7QUFDRCxTQUFPLEtBQUssQ0FBQztDQUNkOztBQUVELFNBQVMsZUFBZSxDQUFDLEVBQVEsRUFBZTtBQUM5QyxNQUFJLEVBQUUsSUFBSSxJQUFJLEVBQUU7QUFDZCxXQUFPLElBQUksQ0FBQztHQUNiO0FBQ0QsTUFBSSxFQUFFLENBQUMsSUFBSSxLQUFLLHlCQUF5QixJQUFJLEVBQUUsQ0FBQyxJQUFJLEtBQUssb0JBQW9CLEVBQUU7QUFDN0UsV0FBTyxJQUFJLENBQUM7R0FDYjtBQUNELFNBQU8sRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7Q0FDckIiLCJmaWxlIjoiYXN0VG9PdXRsaW5lLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0Zsb3dPdXRsaW5lVHJlZSwgRmxvd1N0YXJ0TG9jYXRpb259IGZyb20gJy4uJztcbmltcG9ydCB7YXJyYXl9IGZyb20gJy4uLy4uL251Y2xpZGUtY29tbW9ucyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBhc3RUb091dGxpbmUoYXN0OiBhbnkpOiBBcnJheTxGbG93T3V0bGluZVRyZWU+IHtcbiAgcmV0dXJuIGl0ZW1zVG9UcmVlcyhhc3QuYm9keSk7XG59XG5cbmZ1bmN0aW9uIGl0ZW1zVG9UcmVlcyhpdGVtczogQXJyYXk8YW55Pik6IEFycmF5PEZsb3dPdXRsaW5lVHJlZT4ge1xuICByZXR1cm4gYXJyYXkuY29tcGFjdChpdGVtcy5tYXAoaXRlbVRvVHJlZSkpO1xufVxuXG5mdW5jdGlvbiBpdGVtVG9UcmVlKGl0ZW06IGFueSk6ID9GbG93T3V0bGluZVRyZWUge1xuICBpZiAoaXRlbSA9PSBudWxsKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgY29uc3QgbG9jYXRpb24gPSBnZXRMb2NhdGlvbihpdGVtKTtcbiAgc3dpdGNoIChpdGVtLnR5cGUpIHtcbiAgICBjYXNlICdGdW5jdGlvbkRlY2xhcmF0aW9uJzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGRpc3BsYXlUZXh0OiBgZnVuY3Rpb24gJHtpdGVtLmlkLm5hbWV9KCR7cGFyYW1zU3RyaW5nKGl0ZW0ucGFyYW1zKX0pYCxcbiAgICAgICAgY2hpbGRyZW46IFtdLFxuICAgICAgICAuLi5sb2NhdGlvbixcbiAgICAgIH07XG4gICAgY2FzZSAnQ2xhc3NEZWNsYXJhdGlvbic6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBkaXNwbGF5VGV4dDogYGNsYXNzICR7aXRlbS5pZC5uYW1lfWAsXG4gICAgICAgIGNoaWxkcmVuOiBpdGVtc1RvVHJlZXMoaXRlbS5ib2R5LmJvZHkpLFxuICAgICAgICAuLi5sb2NhdGlvbixcbiAgICAgIH07XG4gICAgY2FzZSAnTWV0aG9kRGVmaW5pdGlvbic6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBkaXNwbGF5VGV4dDogYCR7aXRlbS5rZXkubmFtZX0oJHtwYXJhbXNTdHJpbmcoaXRlbS52YWx1ZS5wYXJhbXMpfSlgLFxuICAgICAgICBjaGlsZHJlbjogW10sXG4gICAgICAgIC4uLmxvY2F0aW9uLFxuICAgICAgfTtcbiAgICBjYXNlICdFeHBvcnREZWNsYXJhdGlvbic6XG4gICAgICBjb25zdCB0cmVlID0gaXRlbVRvVHJlZShpdGVtLmRlY2xhcmF0aW9uKTtcbiAgICAgIGlmICh0cmVlID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgICByZXR1cm4ge1xuICAgICAgICBkaXNwbGF5VGV4dDogYGV4cG9ydCAke3RyZWUuZGlzcGxheVRleHR9YCxcbiAgICAgICAgY2hpbGRyZW46IHRyZWUuY2hpbGRyZW4sXG4gICAgICAgIC4uLmxvY2F0aW9uLFxuICAgICAgfTtcbiAgICBjYXNlICdFeHByZXNzaW9uU3RhdGVtZW50JzpcbiAgICAgIHJldHVybiBzcGVjT3V0bGluZShpdGVtLCAvKiBkZXNjcmliZU9ubHkgKi8gdHJ1ZSk7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldExvY2F0aW9uKGl0ZW06IGFueSk6IEZsb3dTdGFydExvY2F0aW9uIHtcbiAgcmV0dXJuIHtcbiAgICAvLyBJdCBkZWZpbml0ZWx5IG1ha2VzIHNlbnNlIHRoYXQgdGhlIGxpbmVzIHdlIGdldCBhcmUgMS1iYXNlZCBhbmQgdGhlIGNvbHVtbnMgYXJlXG4gICAgLy8gMC1iYXNlZC4uLiBjb252ZXJ0IHRvIDAtYmFzZWQgYWxsIGFyb3VuZC5cbiAgICBzdGFydExpbmU6IGl0ZW0ubG9jLnN0YXJ0LmxpbmUgLSAxLFxuICAgIHN0YXJ0Q29sdW1uOiBpdGVtLmxvYy5zdGFydC5jb2x1bW4sXG4gIH07XG59XG5cbmZ1bmN0aW9uIHBhcmFtc1N0cmluZyhwYXJhbXM6IEFycmF5PGFueT4pOiBzdHJpbmcge1xuICByZXR1cm4gcGFyYW1zLm1hcChwYXJhbSA9PiBwYXJhbS5uYW1lKS5qb2luKCcsICcpO1xufVxuXG5mdW5jdGlvbiBzcGVjT3V0bGluZShleHByZXNzaW9uU3RhdGVtZW50OiBhbnksIGRlc2NyaWJlT25seTogYm9vbGVhbiA9IGZhbHNlKTogP0Zsb3dPdXRsaW5lVHJlZSB7XG4gIGNvbnN0IGV4cHJlc3Npb24gPSBleHByZXNzaW9uU3RhdGVtZW50LmV4cHJlc3Npb247XG4gIGlmIChleHByZXNzaW9uLnR5cGUgIT09ICdDYWxsRXhwcmVzc2lvbicpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBjb25zdCBmdW5jdGlvbk5hbWUgPSBleHByZXNzaW9uLmNhbGxlZS5uYW1lO1xuICBpZiAoZnVuY3Rpb25OYW1lICE9PSAnZGVzY3JpYmUnKSB7XG4gICAgaWYgKGRlc2NyaWJlT25seSB8fCBmdW5jdGlvbk5hbWUgIT09ICdpdCcpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuICBjb25zdCBkZXNjcmlwdGlvbiA9IGdldFN0cmluZ0xpdGVyYWxWYWx1ZShleHByZXNzaW9uLmFyZ3VtZW50c1swXSk7XG4gIGNvbnN0IHNwZWNCb2R5ID0gZ2V0RnVuY3Rpb25Cb2R5KGV4cHJlc3Npb24uYXJndW1lbnRzWzFdKTtcbiAgaWYgKGRlc2NyaXB0aW9uID09IG51bGwgfHwgc3BlY0JvZHkgPT0gbnVsbCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGxldCBjaGlsZHJlbjtcbiAgaWYgKGZ1bmN0aW9uTmFtZSA9PT0gJ2l0Jykge1xuICAgIGNoaWxkcmVuID0gW107XG4gIH0gZWxzZSB7XG4gICAgY2hpbGRyZW4gPSBhcnJheS5jb21wYWN0KFxuICAgICAgc3BlY0JvZHlcbiAgICAgIC5maWx0ZXIoaXRlbSA9PiBpdGVtLnR5cGUgPT09ICdFeHByZXNzaW9uU3RhdGVtZW50JylcbiAgICAgIC5tYXAoaXRlbSA9PiBzcGVjT3V0bGluZShpdGVtKSkpO1xuICB9XG4gIHJldHVybiB7XG4gICAgZGlzcGxheVRleHQ6IGAke2V4cHJlc3Npb24uY2FsbGVlLm5hbWV9ICR7ZGVzY3JpcHRpb259YCxcbiAgICBjaGlsZHJlbixcbiAgICAuLi5nZXRMb2NhdGlvbihleHByZXNzaW9uU3RhdGVtZW50KSxcbiAgfTtcbn1cblxuLyoqIElmIHRoZSBnaXZlbiBBU1QgTm9kZSBpcyBhIHN0cmluZyBsaXRlcmFsLCByZXR1cm4gaXRzIGxpdGVyYWwgdmFsdWUuIE90aGVyd2lzZSByZXR1cm4gbnVsbCAqL1xuZnVuY3Rpb24gZ2V0U3RyaW5nTGl0ZXJhbFZhbHVlKGxpdGVyYWw6ID9hbnkpOiA/c3RyaW5nIHtcbiAgaWYgKGxpdGVyYWwgPT0gbnVsbCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGlmIChsaXRlcmFsLnR5cGUgIT09ICdMaXRlcmFsJykge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGNvbnN0IHZhbHVlID0gbGl0ZXJhbC52YWx1ZTtcbiAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICByZXR1cm4gdmFsdWU7XG59XG5cbmZ1bmN0aW9uIGdldEZ1bmN0aW9uQm9keShmbjogP2FueSk6ID9BcnJheTxhbnk+IHtcbiAgaWYgKGZuID09IG51bGwpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBpZiAoZm4udHlwZSAhPT0gJ0Fycm93RnVuY3Rpb25FeHByZXNzaW9uJyAmJiBmbi50eXBlICE9PSAnRnVuY3Rpb25FeHByZXNzaW9uJykge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHJldHVybiBmbi5ib2R5LmJvZHk7XG59XG4iXX0=