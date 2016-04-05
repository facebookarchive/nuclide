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

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

var _nuclideCommons = require('../../nuclide-commons');

var _nuclideTokenizedText = require('../../nuclide-tokenized-text');

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
  var extent = getExtent(item);
  switch (item.type) {
    case 'FunctionDeclaration':
      return _extends({
        tokenizedText: [(0, _nuclideTokenizedText.keyword)('function'), (0, _nuclideTokenizedText.whitespace)(' '), (0, _nuclideTokenizedText.method)(item.id.name), (0, _nuclideTokenizedText.plain)('(')].concat(_toConsumableArray(paramsTokenizedText(item.params)), [(0, _nuclideTokenizedText.plain)(')')]),
        children: []
      }, extent);
    case 'ClassDeclaration':
      return _extends({
        tokenizedText: [(0, _nuclideTokenizedText.keyword)('class'), (0, _nuclideTokenizedText.whitespace)(' '), (0, _nuclideTokenizedText.className)(item.id.name)],
        children: itemsToTrees(item.body.body)
      }, extent);
    case 'ClassProperty':
      var paramTokens = [];
      if (item.value && item.value.type === 'ArrowFunctionExpression') {
        paramTokens = [(0, _nuclideTokenizedText.plain)('(')].concat(_toConsumableArray(paramsTokenizedText(item.value.params)), [(0, _nuclideTokenizedText.plain)(')')]);
      }
      return _extends({
        tokenizedText: [(0, _nuclideTokenizedText.method)(item.key.name), (0, _nuclideTokenizedText.plain)('=')].concat(_toConsumableArray(paramTokens)),
        children: []
      }, extent);
    case 'MethodDefinition':
      return _extends({
        tokenizedText: [(0, _nuclideTokenizedText.method)(item.key.name), (0, _nuclideTokenizedText.plain)('(')].concat(_toConsumableArray(paramsTokenizedText(item.value.params)), [(0, _nuclideTokenizedText.plain)(')')]),
        children: []
      }, extent);
    case 'ExportDeclaration':
      var tree = itemToTree(item.declaration);
      if (tree == null) {
        return null;
      }
      return _extends({
        tokenizedText: [(0, _nuclideTokenizedText.keyword)('export'), (0, _nuclideTokenizedText.whitespace)(' ')].concat(_toConsumableArray(tree.tokenizedText)),
        children: tree.children
      }, extent);
    case 'ExpressionStatement':
      return specOutline(item, /* describeOnly */true);
    default:
      return null;
  }
}

function paramsTokenizedText(params) {
  var textElements = [];
  params.forEach(function (p, index) {
    textElements.push((0, _nuclideTokenizedText.param)(p.name));
    if (index < params.length - 1) {
      textElements.push((0, _nuclideTokenizedText.plain)(','));
      textElements.push((0, _nuclideTokenizedText.whitespace)(' '));
    }
  });

  return textElements;
}

function getExtent(item) {
  return {
    startPosition: {
      // It definitely makes sense that the lines we get are 1-based and the columns are
      // 0-based... convert to 0-based all around.
      line: item.loc.start.line - 1,
      column: item.loc.start.column
    },
    endPosition: {
      line: item.loc.end.line - 1,
      column: item.loc.end.column
    }
  };
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
    tokenizedText: [(0, _nuclideTokenizedText.method)(expression.callee.name), (0, _nuclideTokenizedText.whitespace)(' '), (0, _nuclideTokenizedText.string)(description)],
    children: children
  }, getExtent(expressionStatement));
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
//# sourceMappingURL=data:application/json;base64,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QWEsRUFBVztBQUNyRCxNQUFJLE9BQU8sSUFBSSxJQUFJLEVBQUU7QUFDbkIsV0FBTyxJQUFJLENBQUM7R0FDYjtBQUNELE1BQUksT0FBTyxDQUFDLElBQUksS0FBSyxTQUFTLEVBQUU7QUFDOUIsV0FBTyxJQUFJLENBQUM7R0FDYjtBQUNELE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUM7QUFDNUIsTUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLEVBQUU7QUFDN0IsV0FBTyxJQUFJLENBQUM7R0FDYjtBQUNELFNBQU8sS0FBSyxDQUFDO0NBQ2Q7O0FBRUQsU0FBUyxlQUFlLENBQUMsRUFBUSxFQUFlO0FBQzlDLE1BQUksRUFBRSxJQUFJLElBQUksRUFBRTtBQUNkLFdBQU8sSUFBSSxDQUFDO0dBQ2I7QUFDRCxNQUFJLEVBQUUsQ0FBQyxJQUFJLEtBQUsseUJBQXlCLElBQUksRUFBRSxDQUFDLElBQUksS0FBSyxvQkFBb0IsRUFBRTtBQUM3RSxXQUFPLElBQUksQ0FBQztHQUNiO0FBQ0QsU0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztDQUNyQiIsImZpbGUiOiJhc3RUb091dGxpbmUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7Rmxvd091dGxpbmVUcmVlLCBQb2ludH0gZnJvbSAnLi4nO1xuaW1wb3J0IHthcnJheX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1jb21tb25zJztcblxuaW1wb3J0IHR5cGUge1Rva2VuaXplZFRleHR9IGZyb20gJy4uLy4uL251Y2xpZGUtdG9rZW5pemVkLXRleHQnO1xuaW1wb3J0IHtcbiAga2V5d29yZCxcbiAgY2xhc3NOYW1lLFxuICBtZXRob2QsXG4gIHBhcmFtLFxuICBzdHJpbmcsXG4gIHdoaXRlc3BhY2UsXG4gIHBsYWluLFxufSBmcm9tICcuLi8uLi9udWNsaWRlLXRva2VuaXplZC10ZXh0JztcblxudHlwZSBFeHRlbnQgPSB7XG4gIHN0YXJ0UG9zaXRpb246IFBvaW50O1xuICBlbmRQb3NpdGlvbjogUG9pbnQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhc3RUb091dGxpbmUoYXN0OiBhbnkpOiBBcnJheTxGbG93T3V0bGluZVRyZWU+IHtcbiAgcmV0dXJuIGl0ZW1zVG9UcmVlcyhhc3QuYm9keSk7XG59XG5cbmZ1bmN0aW9uIGl0ZW1zVG9UcmVlcyhpdGVtczogQXJyYXk8YW55Pik6IEFycmF5PEZsb3dPdXRsaW5lVHJlZT4ge1xuICByZXR1cm4gYXJyYXkuY29tcGFjdChpdGVtcy5tYXAoaXRlbVRvVHJlZSkpO1xufVxuXG5mdW5jdGlvbiBpdGVtVG9UcmVlKGl0ZW06IGFueSk6ID9GbG93T3V0bGluZVRyZWUge1xuICBpZiAoaXRlbSA9PSBudWxsKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgY29uc3QgZXh0ZW50ID0gZ2V0RXh0ZW50KGl0ZW0pO1xuICBzd2l0Y2ggKGl0ZW0udHlwZSkge1xuICAgIGNhc2UgJ0Z1bmN0aW9uRGVjbGFyYXRpb24nOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdG9rZW5pemVkVGV4dDogW1xuICAgICAgICAgIGtleXdvcmQoJ2Z1bmN0aW9uJyksXG4gICAgICAgICAgd2hpdGVzcGFjZSgnICcpLFxuICAgICAgICAgIG1ldGhvZChpdGVtLmlkLm5hbWUpLFxuICAgICAgICAgIHBsYWluKCcoJyksXG4gICAgICAgICAgLi4ucGFyYW1zVG9rZW5pemVkVGV4dChpdGVtLnBhcmFtcyksXG4gICAgICAgICAgcGxhaW4oJyknKSxcbiAgICAgICAgXSxcbiAgICAgICAgY2hpbGRyZW46IFtdLFxuICAgICAgICAuLi5leHRlbnQsXG4gICAgICB9O1xuICAgIGNhc2UgJ0NsYXNzRGVjbGFyYXRpb24nOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdG9rZW5pemVkVGV4dDogW1xuICAgICAgICAgIGtleXdvcmQoJ2NsYXNzJyksXG4gICAgICAgICAgd2hpdGVzcGFjZSgnICcpLFxuICAgICAgICAgIGNsYXNzTmFtZShpdGVtLmlkLm5hbWUpLFxuICAgICAgICBdLFxuICAgICAgICBjaGlsZHJlbjogaXRlbXNUb1RyZWVzKGl0ZW0uYm9keS5ib2R5KSxcbiAgICAgICAgLi4uZXh0ZW50LFxuICAgICAgfTtcbiAgICBjYXNlICdDbGFzc1Byb3BlcnR5JzpcbiAgICAgIGxldCBwYXJhbVRva2VucyA9IFtdO1xuICAgICAgaWYgKGl0ZW0udmFsdWUgJiYgaXRlbS52YWx1ZS50eXBlID09PSAnQXJyb3dGdW5jdGlvbkV4cHJlc3Npb24nKSB7XG4gICAgICAgIHBhcmFtVG9rZW5zID0gW1xuICAgICAgICAgIHBsYWluKCcoJyksXG4gICAgICAgICAgLi4ucGFyYW1zVG9rZW5pemVkVGV4dChpdGVtLnZhbHVlLnBhcmFtcyksXG4gICAgICAgICAgcGxhaW4oJyknKSxcbiAgICAgICAgXTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHRva2VuaXplZFRleHQ6IFtcbiAgICAgICAgICBtZXRob2QoaXRlbS5rZXkubmFtZSksXG4gICAgICAgICAgcGxhaW4oJz0nKSxcbiAgICAgICAgICAuLi5wYXJhbVRva2VucyxcbiAgICAgICAgXSxcbiAgICAgICAgY2hpbGRyZW46IFtdLFxuICAgICAgICAuLi5leHRlbnQsXG4gICAgICB9O1xuICAgIGNhc2UgJ01ldGhvZERlZmluaXRpb24nOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdG9rZW5pemVkVGV4dDogW1xuICAgICAgICAgIG1ldGhvZChpdGVtLmtleS5uYW1lKSxcbiAgICAgICAgICBwbGFpbignKCcpLFxuICAgICAgICAgIC4uLnBhcmFtc1Rva2VuaXplZFRleHQoaXRlbS52YWx1ZS5wYXJhbXMpLFxuICAgICAgICAgIHBsYWluKCcpJyksXG4gICAgICAgIF0sXG4gICAgICAgIGNoaWxkcmVuOiBbXSxcbiAgICAgICAgLi4uZXh0ZW50LFxuICAgICAgfTtcbiAgICBjYXNlICdFeHBvcnREZWNsYXJhdGlvbic6XG4gICAgICBjb25zdCB0cmVlID0gaXRlbVRvVHJlZShpdGVtLmRlY2xhcmF0aW9uKTtcbiAgICAgIGlmICh0cmVlID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0b2tlbml6ZWRUZXh0OiBbXG4gICAgICAgICAga2V5d29yZCgnZXhwb3J0JyksXG4gICAgICAgICAgd2hpdGVzcGFjZSgnICcpLFxuICAgICAgICAgIC4uLnRyZWUudG9rZW5pemVkVGV4dCxcbiAgICAgICAgXSxcbiAgICAgICAgY2hpbGRyZW46IHRyZWUuY2hpbGRyZW4sXG4gICAgICAgIC4uLmV4dGVudCxcbiAgICAgIH07XG4gICAgY2FzZSAnRXhwcmVzc2lvblN0YXRlbWVudCc6XG4gICAgICByZXR1cm4gc3BlY091dGxpbmUoaXRlbSwgLyogZGVzY3JpYmVPbmx5ICovIHRydWUpO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG5mdW5jdGlvbiBwYXJhbXNUb2tlbml6ZWRUZXh0KHBhcmFtczogQXJyYXk8YW55Pik6IFRva2VuaXplZFRleHQge1xuICBjb25zdCB0ZXh0RWxlbWVudHMgPSBbXTtcbiAgcGFyYW1zLmZvckVhY2goKHAsIGluZGV4KSA9PiB7XG4gICAgdGV4dEVsZW1lbnRzLnB1c2gocGFyYW0ocC5uYW1lKSk7XG4gICAgaWYgKGluZGV4IDwgcGFyYW1zLmxlbmd0aCAtIDEpIHtcbiAgICAgIHRleHRFbGVtZW50cy5wdXNoKHBsYWluKCcsJykpO1xuICAgICAgdGV4dEVsZW1lbnRzLnB1c2god2hpdGVzcGFjZSgnICcpKTtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiB0ZXh0RWxlbWVudHM7XG59XG5cbmZ1bmN0aW9uIGdldEV4dGVudChpdGVtOiBhbnkpOiBFeHRlbnQge1xuICByZXR1cm4ge1xuICAgIHN0YXJ0UG9zaXRpb246IHtcbiAgICAgIC8vIEl0IGRlZmluaXRlbHkgbWFrZXMgc2Vuc2UgdGhhdCB0aGUgbGluZXMgd2UgZ2V0IGFyZSAxLWJhc2VkIGFuZCB0aGUgY29sdW1ucyBhcmVcbiAgICAgIC8vIDAtYmFzZWQuLi4gY29udmVydCB0byAwLWJhc2VkIGFsbCBhcm91bmQuXG4gICAgICBsaW5lOiBpdGVtLmxvYy5zdGFydC5saW5lIC0gMSxcbiAgICAgIGNvbHVtbjogaXRlbS5sb2Muc3RhcnQuY29sdW1uLFxuICAgIH0sXG4gICAgZW5kUG9zaXRpb246IHtcbiAgICAgIGxpbmU6IGl0ZW0ubG9jLmVuZC5saW5lIC0gMSxcbiAgICAgIGNvbHVtbjogaXRlbS5sb2MuZW5kLmNvbHVtbixcbiAgICB9LFxuICB9O1xufVxuXG5mdW5jdGlvbiBzcGVjT3V0bGluZShleHByZXNzaW9uU3RhdGVtZW50OiBhbnksIGRlc2NyaWJlT25seTogYm9vbGVhbiA9IGZhbHNlKTogP0Zsb3dPdXRsaW5lVHJlZSB7XG4gIGNvbnN0IGV4cHJlc3Npb24gPSBleHByZXNzaW9uU3RhdGVtZW50LmV4cHJlc3Npb247XG4gIGlmIChleHByZXNzaW9uLnR5cGUgIT09ICdDYWxsRXhwcmVzc2lvbicpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBjb25zdCBmdW5jdGlvbk5hbWUgPSBleHByZXNzaW9uLmNhbGxlZS5uYW1lO1xuICBpZiAoZnVuY3Rpb25OYW1lICE9PSAnZGVzY3JpYmUnKSB7XG4gICAgaWYgKGRlc2NyaWJlT25seSB8fCBmdW5jdGlvbk5hbWUgIT09ICdpdCcpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuICBjb25zdCBkZXNjcmlwdGlvbiA9IGdldFN0cmluZ0xpdGVyYWxWYWx1ZShleHByZXNzaW9uLmFyZ3VtZW50c1swXSk7XG4gIGNvbnN0IHNwZWNCb2R5ID0gZ2V0RnVuY3Rpb25Cb2R5KGV4cHJlc3Npb24uYXJndW1lbnRzWzFdKTtcbiAgaWYgKGRlc2NyaXB0aW9uID09IG51bGwgfHwgc3BlY0JvZHkgPT0gbnVsbCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGxldCBjaGlsZHJlbjtcbiAgaWYgKGZ1bmN0aW9uTmFtZSA9PT0gJ2l0Jykge1xuICAgIGNoaWxkcmVuID0gW107XG4gIH0gZWxzZSB7XG4gICAgY2hpbGRyZW4gPSBhcnJheS5jb21wYWN0KFxuICAgICAgc3BlY0JvZHlcbiAgICAgIC5maWx0ZXIoaXRlbSA9PiBpdGVtLnR5cGUgPT09ICdFeHByZXNzaW9uU3RhdGVtZW50JylcbiAgICAgIC5tYXAoaXRlbSA9PiBzcGVjT3V0bGluZShpdGVtKSkpO1xuICB9XG4gIHJldHVybiB7XG4gICAgdG9rZW5pemVkVGV4dDogW1xuICAgICAgbWV0aG9kKGV4cHJlc3Npb24uY2FsbGVlLm5hbWUpLFxuICAgICAgd2hpdGVzcGFjZSgnICcpLFxuICAgICAgc3RyaW5nKGRlc2NyaXB0aW9uKSxcbiAgICBdLFxuICAgIGNoaWxkcmVuLFxuICAgIC4uLmdldEV4dGVudChleHByZXNzaW9uU3RhdGVtZW50KSxcbiAgfTtcbn1cblxuLyoqIElmIHRoZSBnaXZlbiBBU1QgTm9kZSBpcyBhIHN0cmluZyBsaXRlcmFsLCByZXR1cm4gaXRzIGxpdGVyYWwgdmFsdWUuIE90aGVyd2lzZSByZXR1cm4gbnVsbCAqL1xuZnVuY3Rpb24gZ2V0U3RyaW5nTGl0ZXJhbFZhbHVlKGxpdGVyYWw6ID9hbnkpOiA/c3RyaW5nIHtcbiAgaWYgKGxpdGVyYWwgPT0gbnVsbCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGlmIChsaXRlcmFsLnR5cGUgIT09ICdMaXRlcmFsJykge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGNvbnN0IHZhbHVlID0gbGl0ZXJhbC52YWx1ZTtcbiAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICByZXR1cm4gdmFsdWU7XG59XG5cbmZ1bmN0aW9uIGdldEZ1bmN0aW9uQm9keShmbjogP2FueSk6ID9BcnJheTxhbnk+IHtcbiAgaWYgKGZuID09IG51bGwpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBpZiAoZm4udHlwZSAhPT0gJ0Fycm93RnVuY3Rpb25FeHByZXNzaW9uJyAmJiBmbi50eXBlICE9PSAnRnVuY3Rpb25FeHByZXNzaW9uJykge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHJldHVybiBmbi5ib2R5LmJvZHk7XG59XG4iXX0=