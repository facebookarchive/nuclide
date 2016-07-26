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

var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === 'function') { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError('The decorator for method ' + descriptor.key + ' is of the invalid type ' + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../nuclide-analytics');
}

var _nuclideClang2;

function _nuclideClang() {
  return _nuclideClang2 = require('../../nuclide-clang');
}

var _libclang2;

function _libclang() {
  return _libclang2 = require('./libclang');
}

var MAX_LINE_LENGTH = 120;
var TAB_LENGTH = 2;
var VALID_EMPTY_SUFFIX = /(->|\.|::|\()$/;

var ClangCursorToAutocompletionTypes = Object.freeze({
  STRUCT_DECL: 'class',
  UNION_DECL: 'class',
  CLASS_DECL: 'class',
  ENUM_DECL: 'class',
  FIELD_DECL: 'property',
  ENUM_CONSTANT_DECL: 'constant',
  FUNCTION_DECL: 'function',
  VAR_DECL: 'variable',
  PARM_DECL: 'variable',
  OBJC_INTERFACE_DECL: 'class',
  OBJC_CATEGORY_DECL: 'class',
  OBJC_PROTOCOL_DECL: 'class',
  OBJC_PROPERTY_DECL: 'property',
  OBJC_IVAR_DECL: 'variable',
  OBJC_INSTANCE_METHOD_DECL: 'method',
  OBJC_CLASS_METHOD_DECL: 'method',
  OBJC_IMPLEMENTATION_DECL: 'class',
  OBJC_CATEGORY_IMPL_DECL: 'class',
  TYPEDEF_DECL: 'type',
  CXX_METHOD: 'method',
  CONSTRUCTOR: 'method',
  DESTRUCTOR: 'method',
  FUNCTION_TEMPLATE: 'function',
  CLASS_TEMPLATE: 'class',
  OVERLOAD_CANDIDATE: 'function'
});

function getCompletionBody(completion, columnOffset, indentation) {
  var inlineBody = getCompletionBodyInline(completion);
  var multiLineBody = getCompletionBodyMultiLine(completion, columnOffset, indentation);

  if (columnOffset + inlineBody.length > MAX_LINE_LENGTH && multiLineBody) {
    return multiLineBody;
  }
  return inlineBody;
}

function getCompletionBodyMultiLine(completion, columnOffset, indentation) {
  // Filter out whitespace chunks.
  var chunks = completion.chunks.filter(function (chunk) {
    return chunk.spelling.trim();
  });

  // We only handle completions in which non-placeholder and placeholder
  // chunks alternate, starting with non-placeholder chunk.
  if (chunks.length % 2) {
    return null;
  }

  // Group non-placeholders and placeholders into groups of two.
  // One of each.
  var args = [];
  for (var i = 0, n = chunks.length / 2; i < n; ++i) {
    var firstChunk = chunks[i * 2];
    var secondChunk = chunks[i * 2 + 1];

    if (firstChunk.isPlaceHolder || !secondChunk.isPlaceHolder) {
      return null;
    }

    // If firstChunk ends with colon remove it because we add it manually later.
    var _text = firstChunk.spelling;
    var _placeholder = secondChunk.spelling;
    if (_text.endsWith(':')) {
      _text = _text.substring(0, _text.length - 1);
    }

    // All rows but the first one should be indented at least 2 extra levels.
    // To get that we add dummy leading spaces to those rows.
    if (i > 0) {
      _text = ' '.repeat(2 * TAB_LENGTH) + _text;
    }

    args.push({
      text: _text,
      placeholder: _placeholder,
      offset: i === 0 ? columnOffset : indentation * TAB_LENGTH
    });
  }

  return _convertArgsToMultiLineSnippet(args);
}

function _convertArgsToMultiLineSnippet(args) {
  // We have two types of multine line method calls.
  //
  // 1. Here first argument is the longest, so everything can be
  //    aligned nicely:
  // [self ArgumentOne:arg1
  //              arg2:arg2
  //         Argument3:arg3]
  //
  // 2. Here first argument is not the longest, but we still don't move it.
  //    Only rule here is that colons in remaining rows are aligned:
  // [self Arg1:arg1
  //          arg2:arg2
  //     Argument3:arg3]
  //

  var colonPosition = Math.max.apply(null, args.map(function (arg) {
    return arg.offset + arg.text.length;
  }));

  return args.reduce(function (body, arg, index) {
    var spacesCnt = index === 0 ? 0 : colonPosition - arg.offset - arg.text.length;
    if (spacesCnt < 0) {
      throw Error('This is a bug! Spaces count is negative.');
    }

    var line = '' + ' '.repeat(spacesCnt) + arg.text + ':${' + (index + 1) + ':' + arg.placeholder + '}\n';
    if (index > 0 && line[colonPosition - arg.offset] !== ':') {
      throw Error('This is a bug! Colons are not aligned!');
    }
    return body + line;
  }, '');
}

function getCompletionBodyInline(completion) {
  var body = '';
  var placeHolderCnt = 0;
  completion.chunks.forEach(function (chunk) {
    if (chunk.isPlaceHolder) {
      placeHolderCnt++;
      body += '${' + placeHolderCnt + ':' + chunk.spelling + '}';
    } else {
      body += chunk.spelling;
    }
  });
  return body;
}

function getCompletionPrefix(editor) {
  var cursor = editor.getLastCursor();
  var range = cursor.getCurrentWordBufferRange({
    wordRegex: cursor.wordRegExp({ includeNonWordCharacters: false })
  });

  // Current word might go beyond the cursor, so we cut it.
  range.end = new (_atom2 || _atom()).Point(cursor.getBufferRow(), cursor.getBufferColumn());
  return editor.getTextInBufferRange(range).trim();
}

var AutocompleteHelpers = (function () {
  function AutocompleteHelpers() {
    _classCallCheck(this, AutocompleteHelpers);
  }

  _createDecoratedClass(AutocompleteHelpers, null, [{
    key: 'getAutocompleteSuggestions',
    decorators: [(0, (_nuclideAnalytics2 || _nuclideAnalytics()).trackTiming)('nuclide-clang-atom.autocomplete')],
    value: _asyncToGenerator(function* (request) {
      var editor = request.editor;
      var _request$bufferPosition = request.bufferPosition;
      var row = _request$bufferPosition.row;
      var column = _request$bufferPosition.column;
      var activatedManually = request.activatedManually;

      var prefix = getCompletionPrefix(editor);
      // Only autocomplete empty strings when it's a method (a.?, a->?) or qualifier (a::?),
      // or function call (f(...)).
      if (!activatedManually && prefix === '') {
        var wordPrefix = editor.getLastCursor().getCurrentWordPrefix();
        if (!VALID_EMPTY_SUFFIX.test(wordPrefix)) {
          return [];
        }
      }

      var indentation = editor.indentationForBufferRow(row);
      var data = yield (0, (_libclang2 || _libclang()).getCompletions)(editor, prefix);
      if (data == null) {
        return [];
      }

      return data.map(function (completion) {
        var snippet = undefined;
        var displayText = undefined;
        // For function argument completions, strip out everything before the current parameter.
        // Ideally we'd use the replacement prefix, but this is a hard problem in C++:
        //   e.g. min<decltype(x)>(x, y) is a perfectly valid function call.
        if (completion.cursor_kind === 'OVERLOAD_CANDIDATE') {
          var curParamIndex = completion.chunks.findIndex(function (x) {
            return x.kind === 'CurrentParameter';
          });
          if (curParamIndex !== -1) {
            completion.chunks.splice(0, curParamIndex);
            snippet = getCompletionBody(completion, column, indentation);
          } else {
            // Function had no arguments.
            snippet = ')';
          }
          displayText = completion.spelling;
        } else {
          snippet = getCompletionBody(completion, column, indentation);
        }
        var rightLabel = completion.cursor_kind ? (_nuclideClang2 || _nuclideClang()).ClangCursorToDeclarationTypes[completion.cursor_kind] : null;
        var type = completion.cursor_kind ? ClangCursorToAutocompletionTypes[completion.cursor_kind] : null;
        return {
          snippet: snippet,
          displayText: displayText,
          replacementPrefix: prefix,
          type: type,
          leftLabel: completion.result_type,
          rightLabel: rightLabel,
          description: completion.brief_comment || completion.result_type
        };
      });
    })
  }]);

  return AutocompleteHelpers;
})();

exports.default = AutocompleteHelpers;
var __test__ = {
  getCompletionBodyMultiLine: getCompletionBodyMultiLine,
  getCompletionBodyInline: getCompletionBodyInline
};
exports.__test__ = __test__;