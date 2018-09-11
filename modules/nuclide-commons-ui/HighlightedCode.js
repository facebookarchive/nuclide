"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.highlightCode = highlightCode;
exports.highlightCodeHtml = highlightCodeHtml;
exports.HighlightedCode = HighlightedCode;
exports.HighlightedLines = HighlightedLines;

function _classnames() {
  const data = _interopRequireDefault(require("classnames"));

  _classnames = function () {
    return data;
  };

  return data;
}

function _escapeHtml() {
  const data = _interopRequireDefault(require("escape-html"));

  _escapeHtml = function () {
    return data;
  };

  return data;
}

function _nullthrows() {
  const data = _interopRequireDefault(require("nullthrows"));

  _nullthrows = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

const scopeToClassNameCache = new Map();

function scopeToClassName(scope) {
  let className = scopeToClassNameCache.get(scope);

  if (className == null) {
    className = 'syntax--' + scope.replace(/\./g, ' syntax--');
    scopeToClassNameCache.set(scope, className);
  }

  return className;
}
/**
 * Re-uses an Atom grammar's tokenization functions to produce syntax-higlighted text
 * without the overhead of creating a new TextEditor / TextBuffer.
 */


function highlightCode(grammar, code) {
  return grammar.tokenizeLines(code).map(highlightTokens);
}

function highlightTokens(line) {
  const resultLine = [];
  const scopeStack = [];

  for (const token of line) {
    const diffIndex = scopeStack.findIndex((stackEntry, i) => token.scopes[i] !== stackEntry);

    if (diffIndex !== -1) {
      while (diffIndex < scopeStack.length) {
        resultLine.push({
          type: 'end'
        });
        scopeStack.pop();
      }
    }

    while (scopeStack.length < token.scopes.length) {
      const scope = token.scopes[scopeStack.length];
      resultLine.push({
        type: 'start',
        className: scopeToClassName(scope)
      });
      scopeStack.push(scope);
    }

    resultLine.push({
      type: 'value',
      value: token.value
    });
  }

  while (scopeStack.length) {
    resultLine.push({
      type: 'end'
    });
    scopeStack.pop();
  }

  return resultLine;
}
/**
 * Converts the grammar/code directly to HTML (using highlightCode above).
 */


function highlightCodeHtml(grammar, code) {
  const tokens = highlightCode(grammar, code);
  return tokens.map(tokensToHtml).join('\n');
}

function tokensToHtml(tokens) {
  let html = '';

  for (const token of tokens) {
    switch (token.type) {
      case 'start':
        html += `<span class=${JSON.stringify(token.className)}>`;
        break;

      case 'end':
        html += '</span>';
        break;

      case 'value':
        html += (0, _escapeHtml().default)(token.value);
        break;
    }
  }

  return html;
}
/**
 * Ready-to-render component for highlighted code.
 * Can be used with React's experimental AsyncMode component for
 * asynchronous highlighting.
 */


function HighlightedCode(_ref) {
  let {
    grammar,
    code,
    className
  } = _ref,
      otherProps = _objectWithoutProperties(_ref, ["grammar", "code", "className"]);

  return React.createElement("pre", Object.assign({
    className: (0, _classnames().default)(className, 'nuclide-highlighted-code', 'native-key-bindings'),
    tabIndex: -1
  }, otherProps), React.createElement("code", null, React.createElement(HighlightedLines, {
    grammar: grammar,
    code: code
  })));
}
/**
 * Renders only the raw highlighted tokens used in HighlightedCode.
 * (you'll need to provide the styling yourself.)
 */


function HighlightedLines({
  grammar,
  code
}) {
  const lines = code.split('\n'); // This is really hacky but we need a way to pass the parsed rule stack from one line to the next.
  // We'll give each component a shared array of rule stacks that can be written / read from.
  // React needs to render each line in order to make this work (but this assumption seems safe).

  const ruleStacks = new Array(lines.length);
  return lines.map((line, i) => {
    return React.createElement(HighlightedLine, {
      key: i,
      grammar: grammar,
      line: line,
      lineNumber: i,
      ruleStacks: ruleStacks
    });
  });
}

function HighlightedLine({
  grammar,
  line,
  lineNumber,
  ruleStacks
}) {
  // $FlowIgnore
  const {
    tokens,
    ruleStack
  } = grammar.tokenizeLine(line, // Throws if the lines haven't been rendered in order.
  lineNumber > 0 ? (0, _nullthrows().default)(ruleStacks[lineNumber - 1]) : null,
  /* firstLine */
  lineNumber === 0);
  ruleStacks[lineNumber] = ruleStack;
  return React.createElement("span", {
    dangerouslySetInnerHTML: {
      __html: tokensToHtml(highlightTokens(tokens)) + '\n'
    }
  });
}