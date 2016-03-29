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
//# sourceMappingURL=data:application/json;base64,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Syx5QkFBeUIsSUFBSSxFQUFFLENBQUMsSUFBSSxLQUFLLG9CQUFvQixFQUFFO0FBQzdFLFdBQU8sSUFBSSxDQUFDO0dBQ2I7QUFDRCxTQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO0NBQ3JCIiwiZmlsZSI6ImFzdFRvT3V0bGluZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtGbG93T3V0bGluZVRyZWUsIFBvaW50fSBmcm9tICcuLic7XG5pbXBvcnQge2FycmF5fSBmcm9tICcuLi8uLi9udWNsaWRlLWNvbW1vbnMnO1xuXG5pbXBvcnQgdHlwZSB7VG9rZW5pemVkVGV4dH0gZnJvbSAnLi4vLi4vbnVjbGlkZS10b2tlbml6ZWQtdGV4dCc7XG5pbXBvcnQge1xuICBrZXl3b3JkLFxuICBjbGFzc05hbWUsXG4gIG1ldGhvZCxcbiAgcGFyYW0sXG4gIHN0cmluZyxcbiAgd2hpdGVzcGFjZSxcbiAgcGxhaW4sXG59IGZyb20gJy4uLy4uL251Y2xpZGUtdG9rZW5pemVkLXRleHQnO1xuXG50eXBlIEV4dGVudCA9IHtcbiAgc3RhcnRQb3NpdGlvbjogUG9pbnQ7XG4gIGVuZFBvc2l0aW9uOiBQb2ludDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFzdFRvT3V0bGluZShhc3Q6IGFueSk6IEFycmF5PEZsb3dPdXRsaW5lVHJlZT4ge1xuICByZXR1cm4gaXRlbXNUb1RyZWVzKGFzdC5ib2R5KTtcbn1cblxuZnVuY3Rpb24gaXRlbXNUb1RyZWVzKGl0ZW1zOiBBcnJheTxhbnk+KTogQXJyYXk8Rmxvd091dGxpbmVUcmVlPiB7XG4gIHJldHVybiBhcnJheS5jb21wYWN0KGl0ZW1zLm1hcChpdGVtVG9UcmVlKSk7XG59XG5cbmZ1bmN0aW9uIGl0ZW1Ub1RyZWUoaXRlbTogYW55KTogP0Zsb3dPdXRsaW5lVHJlZSB7XG4gIGlmIChpdGVtID09IG51bGwpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBjb25zdCBleHRlbnQgPSBnZXRFeHRlbnQoaXRlbSk7XG4gIHN3aXRjaCAoaXRlbS50eXBlKSB7XG4gICAgY2FzZSAnRnVuY3Rpb25EZWNsYXJhdGlvbic6XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0b2tlbml6ZWRUZXh0OiBbXG4gICAgICAgICAga2V5d29yZCgnZnVuY3Rpb24nKSxcbiAgICAgICAgICB3aGl0ZXNwYWNlKCcgJyksXG4gICAgICAgICAgbWV0aG9kKGl0ZW0uaWQubmFtZSksXG4gICAgICAgICAgcGxhaW4oJygnKSxcbiAgICAgICAgICAuLi5wYXJhbXNUb2tlbml6ZWRUZXh0KGl0ZW0ucGFyYW1zKSxcbiAgICAgICAgICBwbGFpbignKScpLFxuICAgICAgICBdLFxuICAgICAgICBjaGlsZHJlbjogW10sXG4gICAgICAgIC4uLmV4dGVudCxcbiAgICAgIH07XG4gICAgY2FzZSAnQ2xhc3NEZWNsYXJhdGlvbic6XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0b2tlbml6ZWRUZXh0OiBbXG4gICAgICAgICAga2V5d29yZCgnY2xhc3MnKSxcbiAgICAgICAgICB3aGl0ZXNwYWNlKCcgJyksXG4gICAgICAgICAgY2xhc3NOYW1lKGl0ZW0uaWQubmFtZSksXG4gICAgICAgIF0sXG4gICAgICAgIGNoaWxkcmVuOiBpdGVtc1RvVHJlZXMoaXRlbS5ib2R5LmJvZHkpLFxuICAgICAgICAuLi5leHRlbnQsXG4gICAgICB9O1xuICAgIGNhc2UgJ01ldGhvZERlZmluaXRpb24nOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdG9rZW5pemVkVGV4dDogW1xuICAgICAgICAgIG1ldGhvZChpdGVtLmtleS5uYW1lKSxcbiAgICAgICAgICBwbGFpbignKCcpLFxuICAgICAgICAgIC4uLnBhcmFtc1Rva2VuaXplZFRleHQoaXRlbS52YWx1ZS5wYXJhbXMpLFxuICAgICAgICAgIHBsYWluKCcpJyksXG4gICAgICAgIF0sXG4gICAgICAgIGNoaWxkcmVuOiBbXSxcbiAgICAgICAgLi4uZXh0ZW50LFxuICAgICAgfTtcbiAgICBjYXNlICdFeHBvcnREZWNsYXJhdGlvbic6XG4gICAgICBjb25zdCB0cmVlID0gaXRlbVRvVHJlZShpdGVtLmRlY2xhcmF0aW9uKTtcbiAgICAgIGlmICh0cmVlID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0b2tlbml6ZWRUZXh0OiBbXG4gICAgICAgICAga2V5d29yZCgnZXhwb3J0JyksXG4gICAgICAgICAgd2hpdGVzcGFjZSgnICcpLFxuICAgICAgICAgIC4uLnRyZWUudG9rZW5pemVkVGV4dCxcbiAgICAgICAgXSxcbiAgICAgICAgY2hpbGRyZW46IHRyZWUuY2hpbGRyZW4sXG4gICAgICAgIC4uLmV4dGVudCxcbiAgICAgIH07XG4gICAgY2FzZSAnRXhwcmVzc2lvblN0YXRlbWVudCc6XG4gICAgICByZXR1cm4gc3BlY091dGxpbmUoaXRlbSwgLyogZGVzY3JpYmVPbmx5ICovIHRydWUpO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG5mdW5jdGlvbiBwYXJhbXNUb2tlbml6ZWRUZXh0KHBhcmFtczogQXJyYXk8YW55Pik6IFRva2VuaXplZFRleHQge1xuICBjb25zdCB0ZXh0RWxlbWVudHMgPSBbXTtcbiAgcGFyYW1zLmZvckVhY2goKHAsIGluZGV4KSA9PiB7XG4gICAgdGV4dEVsZW1lbnRzLnB1c2gocGFyYW0ocC5uYW1lKSk7XG4gICAgaWYgKGluZGV4IDwgcGFyYW1zLmxlbmd0aCAtIDEpIHtcbiAgICAgIHRleHRFbGVtZW50cy5wdXNoKHBsYWluKCcsJykpO1xuICAgICAgdGV4dEVsZW1lbnRzLnB1c2god2hpdGVzcGFjZSgnICcpKTtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiB0ZXh0RWxlbWVudHM7XG59XG5cbmZ1bmN0aW9uIGdldEV4dGVudChpdGVtOiBhbnkpOiBFeHRlbnQge1xuICByZXR1cm4ge1xuICAgIHN0YXJ0UG9zaXRpb246IHtcbiAgICAgIC8vIEl0IGRlZmluaXRlbHkgbWFrZXMgc2Vuc2UgdGhhdCB0aGUgbGluZXMgd2UgZ2V0IGFyZSAxLWJhc2VkIGFuZCB0aGUgY29sdW1ucyBhcmVcbiAgICAgIC8vIDAtYmFzZWQuLi4gY29udmVydCB0byAwLWJhc2VkIGFsbCBhcm91bmQuXG4gICAgICBsaW5lOiBpdGVtLmxvYy5zdGFydC5saW5lIC0gMSxcbiAgICAgIGNvbHVtbjogaXRlbS5sb2Muc3RhcnQuY29sdW1uLFxuICAgIH0sXG4gICAgZW5kUG9zaXRpb246IHtcbiAgICAgIGxpbmU6IGl0ZW0ubG9jLmVuZC5saW5lIC0gMSxcbiAgICAgIGNvbHVtbjogaXRlbS5sb2MuZW5kLmNvbHVtbixcbiAgICB9LFxuICB9O1xufVxuXG5mdW5jdGlvbiBzcGVjT3V0bGluZShleHByZXNzaW9uU3RhdGVtZW50OiBhbnksIGRlc2NyaWJlT25seTogYm9vbGVhbiA9IGZhbHNlKTogP0Zsb3dPdXRsaW5lVHJlZSB7XG4gIGNvbnN0IGV4cHJlc3Npb24gPSBleHByZXNzaW9uU3RhdGVtZW50LmV4cHJlc3Npb247XG4gIGlmIChleHByZXNzaW9uLnR5cGUgIT09ICdDYWxsRXhwcmVzc2lvbicpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBjb25zdCBmdW5jdGlvbk5hbWUgPSBleHByZXNzaW9uLmNhbGxlZS5uYW1lO1xuICBpZiAoZnVuY3Rpb25OYW1lICE9PSAnZGVzY3JpYmUnKSB7XG4gICAgaWYgKGRlc2NyaWJlT25seSB8fCBmdW5jdGlvbk5hbWUgIT09ICdpdCcpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuICBjb25zdCBkZXNjcmlwdGlvbiA9IGdldFN0cmluZ0xpdGVyYWxWYWx1ZShleHByZXNzaW9uLmFyZ3VtZW50c1swXSk7XG4gIGNvbnN0IHNwZWNCb2R5ID0gZ2V0RnVuY3Rpb25Cb2R5KGV4cHJlc3Npb24uYXJndW1lbnRzWzFdKTtcbiAgaWYgKGRlc2NyaXB0aW9uID09IG51bGwgfHwgc3BlY0JvZHkgPT0gbnVsbCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGxldCBjaGlsZHJlbjtcbiAgaWYgKGZ1bmN0aW9uTmFtZSA9PT0gJ2l0Jykge1xuICAgIGNoaWxkcmVuID0gW107XG4gIH0gZWxzZSB7XG4gICAgY2hpbGRyZW4gPSBhcnJheS5jb21wYWN0KFxuICAgICAgc3BlY0JvZHlcbiAgICAgIC5maWx0ZXIoaXRlbSA9PiBpdGVtLnR5cGUgPT09ICdFeHByZXNzaW9uU3RhdGVtZW50JylcbiAgICAgIC5tYXAoaXRlbSA9PiBzcGVjT3V0bGluZShpdGVtKSkpO1xuICB9XG4gIHJldHVybiB7XG4gICAgdG9rZW5pemVkVGV4dDogW1xuICAgICAgbWV0aG9kKGV4cHJlc3Npb24uY2FsbGVlLm5hbWUpLFxuICAgICAgd2hpdGVzcGFjZSgnICcpLFxuICAgICAgc3RyaW5nKGRlc2NyaXB0aW9uKSxcbiAgICBdLFxuICAgIGNoaWxkcmVuLFxuICAgIC4uLmdldEV4dGVudChleHByZXNzaW9uU3RhdGVtZW50KSxcbiAgfTtcbn1cblxuLyoqIElmIHRoZSBnaXZlbiBBU1QgTm9kZSBpcyBhIHN0cmluZyBsaXRlcmFsLCByZXR1cm4gaXRzIGxpdGVyYWwgdmFsdWUuIE90aGVyd2lzZSByZXR1cm4gbnVsbCAqL1xuZnVuY3Rpb24gZ2V0U3RyaW5nTGl0ZXJhbFZhbHVlKGxpdGVyYWw6ID9hbnkpOiA/c3RyaW5nIHtcbiAgaWYgKGxpdGVyYWwgPT0gbnVsbCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGlmIChsaXRlcmFsLnR5cGUgIT09ICdMaXRlcmFsJykge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGNvbnN0IHZhbHVlID0gbGl0ZXJhbC52YWx1ZTtcbiAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICByZXR1cm4gdmFsdWU7XG59XG5cbmZ1bmN0aW9uIGdldEZ1bmN0aW9uQm9keShmbjogP2FueSk6ID9BcnJheTxhbnk+IHtcbiAgaWYgKGZuID09IG51bGwpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBpZiAoZm4udHlwZSAhPT0gJ0Fycm93RnVuY3Rpb25FeHByZXNzaW9uJyAmJiBmbi50eXBlICE9PSAnRnVuY3Rpb25FeHByZXNzaW9uJykge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHJldHVybiBmbi5ib2R5LmJvZHk7XG59XG4iXX0=