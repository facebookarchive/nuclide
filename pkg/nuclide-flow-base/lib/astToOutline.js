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
//# sourceMappingURL=data:application/json;base64,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QWEsRUFBVztBQUNyRCxNQUFJLE9BQU8sSUFBSSxJQUFJLEVBQUU7QUFDbkIsV0FBTyxJQUFJLENBQUM7R0FDYjtBQUNELE1BQUksT0FBTyxDQUFDLElBQUksS0FBSyxTQUFTLEVBQUU7QUFDOUIsV0FBTyxJQUFJLENBQUM7R0FDYjtBQUNELE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUM7QUFDNUIsTUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLEVBQUU7QUFDN0IsV0FBTyxJQUFJLENBQUM7R0FDYjtBQUNELFNBQU8sS0FBSyxDQUFDO0NBQ2Q7O0FBRUQsU0FBUyxlQUFlLENBQUMsRUFBUSxFQUFlO0FBQzlDLE1BQUksRUFBRSxJQUFJLElBQUksRUFBRTtBQUNkLFdBQU8sSUFBSSxDQUFDO0dBQ2I7QUFDRCxNQUFJLEVBQUUsQ0FBQyxJQUFJLEtBQUsseUJBQXlCLElBQUksRUFBRSxDQUFDLElBQUksS0FBSyxvQkFBb0IsRUFBRTtBQUM3RSxXQUFPLElBQUksQ0FBQztHQUNiO0FBQ0QsU0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztDQUNyQiIsImZpbGUiOiJhc3RUb091dGxpbmUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7Rmxvd091dGxpbmVUcmVlLCBQb2ludH0gZnJvbSAnLi4nO1xuaW1wb3J0IHthcnJheX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1jb21tb25zJztcblxuaW1wb3J0IHR5cGUge1Rva2VuaXplZFRleHR9IGZyb20gJy4uLy4uL251Y2xpZGUtdG9rZW5pemVkLXRleHQnO1xuaW1wb3J0IHtcbiAga2V5d29yZCxcbiAgY2xhc3NOYW1lLFxuICBtZXRob2QsXG4gIHBhcmFtLFxuICBzdHJpbmcsXG4gIHdoaXRlc3BhY2UsXG4gIHBsYWluLFxufSBmcm9tICcuLi8uLi9udWNsaWRlLXRva2VuaXplZC10ZXh0JztcblxudHlwZSBFeHRlbnQgPSB7XG4gIHN0YXJ0UG9zaXRpb246IFBvaW50O1xuICBlbmRQb3NpdGlvbjogUG9pbnQ7XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gYXN0VG9PdXRsaW5lKGFzdDogYW55KTogQXJyYXk8Rmxvd091dGxpbmVUcmVlPiB7XG4gIHJldHVybiBpdGVtc1RvVHJlZXMoYXN0LmJvZHkpO1xufVxuXG5mdW5jdGlvbiBpdGVtc1RvVHJlZXMoaXRlbXM6IEFycmF5PGFueT4pOiBBcnJheTxGbG93T3V0bGluZVRyZWU+IHtcbiAgcmV0dXJuIGFycmF5LmNvbXBhY3QoaXRlbXMubWFwKGl0ZW1Ub1RyZWUpKTtcbn1cblxuZnVuY3Rpb24gaXRlbVRvVHJlZShpdGVtOiBhbnkpOiA/Rmxvd091dGxpbmVUcmVlIHtcbiAgaWYgKGl0ZW0gPT0gbnVsbCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGNvbnN0IGV4dGVudCA9IGdldEV4dGVudChpdGVtKTtcbiAgc3dpdGNoIChpdGVtLnR5cGUpIHtcbiAgICBjYXNlICdGdW5jdGlvbkRlY2xhcmF0aW9uJzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHRva2VuaXplZFRleHQ6IFtcbiAgICAgICAgICBrZXl3b3JkKCdmdW5jdGlvbicpLFxuICAgICAgICAgIHdoaXRlc3BhY2UoJyAnKSxcbiAgICAgICAgICBtZXRob2QoaXRlbS5pZC5uYW1lKSxcbiAgICAgICAgICBwbGFpbignKCcpLFxuICAgICAgICAgIC4uLnBhcmFtc1Rva2VuaXplZFRleHQoaXRlbS5wYXJhbXMpLFxuICAgICAgICAgIHBsYWluKCcpJyksXG4gICAgICAgIF0sXG4gICAgICAgIGNoaWxkcmVuOiBbXSxcbiAgICAgICAgLi4uZXh0ZW50LFxuICAgICAgfTtcbiAgICBjYXNlICdDbGFzc0RlY2xhcmF0aW9uJzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHRva2VuaXplZFRleHQ6IFtcbiAgICAgICAgICBrZXl3b3JkKCdjbGFzcycpLFxuICAgICAgICAgIHdoaXRlc3BhY2UoJyAnKSxcbiAgICAgICAgICBjbGFzc05hbWUoaXRlbS5pZC5uYW1lKSxcbiAgICAgICAgXSxcbiAgICAgICAgY2hpbGRyZW46IGl0ZW1zVG9UcmVlcyhpdGVtLmJvZHkuYm9keSksXG4gICAgICAgIC4uLmV4dGVudCxcbiAgICAgIH07XG4gICAgY2FzZSAnQ2xhc3NQcm9wZXJ0eSc6XG4gICAgICBsZXQgcGFyYW1Ub2tlbnMgPSBbXTtcbiAgICAgIGlmIChpdGVtLnZhbHVlICYmIGl0ZW0udmFsdWUudHlwZSA9PT0gJ0Fycm93RnVuY3Rpb25FeHByZXNzaW9uJykge1xuICAgICAgICBwYXJhbVRva2VucyA9IFtcbiAgICAgICAgICBwbGFpbignKCcpLFxuICAgICAgICAgIC4uLnBhcmFtc1Rva2VuaXplZFRleHQoaXRlbS52YWx1ZS5wYXJhbXMpLFxuICAgICAgICAgIHBsYWluKCcpJyksXG4gICAgICAgIF07XG4gICAgICB9XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0b2tlbml6ZWRUZXh0OiBbXG4gICAgICAgICAgbWV0aG9kKGl0ZW0ua2V5Lm5hbWUpLFxuICAgICAgICAgIHBsYWluKCc9JyksXG4gICAgICAgICAgLi4ucGFyYW1Ub2tlbnMsXG4gICAgICAgIF0sXG4gICAgICAgIGNoaWxkcmVuOiBbXSxcbiAgICAgICAgLi4uZXh0ZW50LFxuICAgICAgfTtcbiAgICBjYXNlICdNZXRob2REZWZpbml0aW9uJzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHRva2VuaXplZFRleHQ6IFtcbiAgICAgICAgICBtZXRob2QoaXRlbS5rZXkubmFtZSksXG4gICAgICAgICAgcGxhaW4oJygnKSxcbiAgICAgICAgICAuLi5wYXJhbXNUb2tlbml6ZWRUZXh0KGl0ZW0udmFsdWUucGFyYW1zKSxcbiAgICAgICAgICBwbGFpbignKScpLFxuICAgICAgICBdLFxuICAgICAgICBjaGlsZHJlbjogW10sXG4gICAgICAgIC4uLmV4dGVudCxcbiAgICAgIH07XG4gICAgY2FzZSAnRXhwb3J0RGVjbGFyYXRpb24nOlxuICAgICAgY29uc3QgdHJlZSA9IGl0ZW1Ub1RyZWUoaXRlbS5kZWNsYXJhdGlvbik7XG4gICAgICBpZiAodHJlZSA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdG9rZW5pemVkVGV4dDogW1xuICAgICAgICAgIGtleXdvcmQoJ2V4cG9ydCcpLFxuICAgICAgICAgIHdoaXRlc3BhY2UoJyAnKSxcbiAgICAgICAgICAuLi50cmVlLnRva2VuaXplZFRleHQsXG4gICAgICAgIF0sXG4gICAgICAgIGNoaWxkcmVuOiB0cmVlLmNoaWxkcmVuLFxuICAgICAgICAuLi5leHRlbnQsXG4gICAgICB9O1xuICAgIGNhc2UgJ0V4cHJlc3Npb25TdGF0ZW1lbnQnOlxuICAgICAgcmV0dXJuIHNwZWNPdXRsaW5lKGl0ZW0sIC8qIGRlc2NyaWJlT25seSAqLyB0cnVlKTtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cblxuZnVuY3Rpb24gcGFyYW1zVG9rZW5pemVkVGV4dChwYXJhbXM6IEFycmF5PGFueT4pOiBUb2tlbml6ZWRUZXh0IHtcbiAgY29uc3QgdGV4dEVsZW1lbnRzID0gW107XG4gIHBhcmFtcy5mb3JFYWNoKChwLCBpbmRleCkgPT4ge1xuICAgIHRleHRFbGVtZW50cy5wdXNoKHBhcmFtKHAubmFtZSkpO1xuICAgIGlmIChpbmRleCA8IHBhcmFtcy5sZW5ndGggLSAxKSB7XG4gICAgICB0ZXh0RWxlbWVudHMucHVzaChwbGFpbignLCcpKTtcbiAgICAgIHRleHRFbGVtZW50cy5wdXNoKHdoaXRlc3BhY2UoJyAnKSk7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gdGV4dEVsZW1lbnRzO1xufVxuXG5mdW5jdGlvbiBnZXRFeHRlbnQoaXRlbTogYW55KTogRXh0ZW50IHtcbiAgcmV0dXJuIHtcbiAgICBzdGFydFBvc2l0aW9uOiB7XG4gICAgICAvLyBJdCBkZWZpbml0ZWx5IG1ha2VzIHNlbnNlIHRoYXQgdGhlIGxpbmVzIHdlIGdldCBhcmUgMS1iYXNlZCBhbmQgdGhlIGNvbHVtbnMgYXJlXG4gICAgICAvLyAwLWJhc2VkLi4uIGNvbnZlcnQgdG8gMC1iYXNlZCBhbGwgYXJvdW5kLlxuICAgICAgbGluZTogaXRlbS5sb2Muc3RhcnQubGluZSAtIDEsXG4gICAgICBjb2x1bW46IGl0ZW0ubG9jLnN0YXJ0LmNvbHVtbixcbiAgICB9LFxuICAgIGVuZFBvc2l0aW9uOiB7XG4gICAgICBsaW5lOiBpdGVtLmxvYy5lbmQubGluZSAtIDEsXG4gICAgICBjb2x1bW46IGl0ZW0ubG9jLmVuZC5jb2x1bW4sXG4gICAgfSxcbiAgfTtcbn1cblxuZnVuY3Rpb24gc3BlY091dGxpbmUoZXhwcmVzc2lvblN0YXRlbWVudDogYW55LCBkZXNjcmliZU9ubHk6IGJvb2xlYW4gPSBmYWxzZSk6ID9GbG93T3V0bGluZVRyZWUge1xuICBjb25zdCBleHByZXNzaW9uID0gZXhwcmVzc2lvblN0YXRlbWVudC5leHByZXNzaW9uO1xuICBpZiAoZXhwcmVzc2lvbi50eXBlICE9PSAnQ2FsbEV4cHJlc3Npb24nKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgY29uc3QgZnVuY3Rpb25OYW1lID0gZXhwcmVzc2lvbi5jYWxsZWUubmFtZTtcbiAgaWYgKGZ1bmN0aW9uTmFtZSAhPT0gJ2Rlc2NyaWJlJykge1xuICAgIGlmIChkZXNjcmliZU9ubHkgfHwgZnVuY3Rpb25OYW1lICE9PSAnaXQnKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cbiAgY29uc3QgZGVzY3JpcHRpb24gPSBnZXRTdHJpbmdMaXRlcmFsVmFsdWUoZXhwcmVzc2lvbi5hcmd1bWVudHNbMF0pO1xuICBjb25zdCBzcGVjQm9keSA9IGdldEZ1bmN0aW9uQm9keShleHByZXNzaW9uLmFyZ3VtZW50c1sxXSk7XG4gIGlmIChkZXNjcmlwdGlvbiA9PSBudWxsIHx8IHNwZWNCb2R5ID09IG51bGwpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBsZXQgY2hpbGRyZW47XG4gIGlmIChmdW5jdGlvbk5hbWUgPT09ICdpdCcpIHtcbiAgICBjaGlsZHJlbiA9IFtdO1xuICB9IGVsc2Uge1xuICAgIGNoaWxkcmVuID0gYXJyYXkuY29tcGFjdChcbiAgICAgIHNwZWNCb2R5XG4gICAgICAuZmlsdGVyKGl0ZW0gPT4gaXRlbS50eXBlID09PSAnRXhwcmVzc2lvblN0YXRlbWVudCcpXG4gICAgICAubWFwKGl0ZW0gPT4gc3BlY091dGxpbmUoaXRlbSkpKTtcbiAgfVxuICByZXR1cm4ge1xuICAgIHRva2VuaXplZFRleHQ6IFtcbiAgICAgIG1ldGhvZChleHByZXNzaW9uLmNhbGxlZS5uYW1lKSxcbiAgICAgIHdoaXRlc3BhY2UoJyAnKSxcbiAgICAgIHN0cmluZyhkZXNjcmlwdGlvbiksXG4gICAgXSxcbiAgICBjaGlsZHJlbixcbiAgICAuLi5nZXRFeHRlbnQoZXhwcmVzc2lvblN0YXRlbWVudCksXG4gIH07XG59XG5cbi8qKiBJZiB0aGUgZ2l2ZW4gQVNUIE5vZGUgaXMgYSBzdHJpbmcgbGl0ZXJhbCwgcmV0dXJuIGl0cyBsaXRlcmFsIHZhbHVlLiBPdGhlcndpc2UgcmV0dXJuIG51bGwgKi9cbmZ1bmN0aW9uIGdldFN0cmluZ0xpdGVyYWxWYWx1ZShsaXRlcmFsOiA/YW55KTogP3N0cmluZyB7XG4gIGlmIChsaXRlcmFsID09IG51bGwpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBpZiAobGl0ZXJhbC50eXBlICE9PSAnTGl0ZXJhbCcpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBjb25zdCB2YWx1ZSA9IGxpdGVyYWwudmFsdWU7XG4gIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgcmV0dXJuIHZhbHVlO1xufVxuXG5mdW5jdGlvbiBnZXRGdW5jdGlvbkJvZHkoZm46ID9hbnkpOiA/QXJyYXk8YW55PiB7XG4gIGlmIChmbiA9PSBudWxsKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgaWYgKGZuLnR5cGUgIT09ICdBcnJvd0Z1bmN0aW9uRXhwcmVzc2lvbicgJiYgZm4udHlwZSAhPT0gJ0Z1bmN0aW9uRXhwcmVzc2lvbicpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICByZXR1cm4gZm4uYm9keS5ib2R5O1xufVxuIl19