var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === 'function') { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError('The decorator for method ' + descriptor.key + ' is of the invalid type ' + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _analytics = require('../../analytics');

var _clang = require('../../clang');

var _commons = require('../../commons');

var _libclang = require('./libclang');

var MAX_LINE_LENGTH = 120;
var TAB_LENGTH = 2;
var VALID_EMPTY_SUFFIX = /(->|\.|::|\()$/;

var ClangCursorToAutocompletionTypes = {
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
};

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
  range.end = new _atom.Point(cursor.getBufferRow(), cursor.getBufferColumn());
  return editor.getTextInBufferRange(range).trim();
}

var AutocompleteProvider = (function () {
  function AutocompleteProvider() {
    _classCallCheck(this, AutocompleteProvider);
  }

  _createDecoratedClass(AutocompleteProvider, [{
    key: 'getAutocompleteSuggestions',
    decorators: [(0, _analytics.trackTiming)('nuclide-clang-atom.autocomplete')],
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
      var data = yield (0, _libclang.getCompletions)(editor, prefix);
      if (data == null) {
        return [];
      }

      return data.completions.map(function (completion) {
        var snippet = undefined,
            displayText = undefined;
        // For function argument completions, strip out everything before the current parameter.
        // Ideally we'd use the replacement prefix, but this is a hard problem in C++:
        //   e.g. min<decltype(x)>(x, y) is a perfectly valid function call.
        if (completion.cursor_kind === 'OVERLOAD_CANDIDATE') {
          var curParamIndex = _commons.array.findIndex(completion.chunks, function (x) {
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
        var rightLabel = completion.cursor_kind ? _clang.ClangCursorToDeclarationTypes[completion.cursor_kind] : null;
        var type = completion.cursor_kind ? ClangCursorToAutocompletionTypes[completion.cursor_kind] : null;
        return {
          snippet: snippet,
          displayText: displayText,
          replacementPrefix: prefix,
          type: type,
          leftLabel: completion.result_type,
          rightLabel: rightLabel,
          description: completion.result_type
        };
      });
    })
  }]);

  return AutocompleteProvider;
})();

module.exports = {
  AutocompleteProvider: AutocompleteProvider,
  __test__: {
    getCompletionBodyMultiLine: getCompletionBodyMultiLine,
    getCompletionBodyInline: getCompletionBodyInline
  }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkF1dG9jb21wbGV0ZVByb3ZpZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O29CQWFvQixNQUFNOzt5QkFDQSxpQkFBaUI7O3FCQUNDLGFBQWE7O3VCQUNyQyxlQUFlOzt3QkFDTixZQUFZOztBQUV6QyxJQUFNLGVBQWUsR0FBRyxHQUFHLENBQUM7QUFDNUIsSUFBTSxVQUFVLEdBQUcsQ0FBQyxDQUFDO0FBQ3JCLElBQU0sa0JBQWtCLEdBQUcsZ0JBQWdCLENBQUM7O0FBRTVDLElBQU0sZ0NBQWdDLEdBQUc7QUFDdkMsYUFBVyxFQUFFLE9BQU87QUFDcEIsWUFBVSxFQUFFLE9BQU87QUFDbkIsWUFBVSxFQUFFLE9BQU87QUFDbkIsV0FBUyxFQUFFLE9BQU87QUFDbEIsWUFBVSxFQUFFLFVBQVU7QUFDdEIsb0JBQWtCLEVBQUUsVUFBVTtBQUM5QixlQUFhLEVBQUUsVUFBVTtBQUN6QixVQUFRLEVBQUUsVUFBVTtBQUNwQixXQUFTLEVBQUUsVUFBVTtBQUNyQixxQkFBbUIsRUFBRSxPQUFPO0FBQzVCLG9CQUFrQixFQUFFLE9BQU87QUFDM0Isb0JBQWtCLEVBQUUsT0FBTztBQUMzQixvQkFBa0IsRUFBRSxVQUFVO0FBQzlCLGdCQUFjLEVBQUUsVUFBVTtBQUMxQiwyQkFBeUIsRUFBRSxRQUFRO0FBQ25DLHdCQUFzQixFQUFFLFFBQVE7QUFDaEMsMEJBQXdCLEVBQUUsT0FBTztBQUNqQyx5QkFBdUIsRUFBRSxPQUFPO0FBQ2hDLGNBQVksRUFBRSxNQUFNO0FBQ3BCLFlBQVUsRUFBRSxRQUFRO0FBQ3BCLGFBQVcsRUFBRSxRQUFRO0FBQ3JCLFlBQVUsRUFBRSxRQUFRO0FBQ3BCLG1CQUFpQixFQUFFLFVBQVU7QUFDN0IsZ0JBQWMsRUFBRSxPQUFPO0FBQ3ZCLG9CQUFrQixFQUFFLFVBQVU7Q0FDL0IsQ0FBQzs7QUFFRixTQUFTLGlCQUFpQixDQUN4QixVQUEyQixFQUMzQixZQUFvQixFQUNwQixXQUFtQixFQUNYO0FBQ1IsTUFB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T0FBTyxHQUFHO0FBQ2Ysc0JBQW9CLEVBQXBCLG9CQUFvQjtBQUNwQixVQUFRLEVBQUU7QUFDUiw4QkFBMEIsRUFBMUIsMEJBQTBCO0FBQzFCLDJCQUF1QixFQUF2Qix1QkFBdUI7R0FDeEI7Q0FDRixDQUFDIiwiZmlsZSI6IkF1dG9jb21wbGV0ZVByb3ZpZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0NsYW5nQ29tcGxldGlvbn0gZnJvbSAnLi4vLi4vY2xhbmcnO1xuXG5pbXBvcnQge1BvaW50fSBmcm9tICdhdG9tJztcbmltcG9ydCB7dHJhY2tUaW1pbmd9IGZyb20gJy4uLy4uL2FuYWx5dGljcyc7XG5pbXBvcnQge0NsYW5nQ3Vyc29yVG9EZWNsYXJhdGlvblR5cGVzfSBmcm9tICcuLi8uLi9jbGFuZyc7XG5pbXBvcnQge2FycmF5fSBmcm9tICcuLi8uLi9jb21tb25zJztcbmltcG9ydCB7Z2V0Q29tcGxldGlvbnN9IGZyb20gJy4vbGliY2xhbmcnO1xuXG5jb25zdCBNQVhfTElORV9MRU5HVEggPSAxMjA7XG5jb25zdCBUQUJfTEVOR1RIID0gMjtcbmNvbnN0IFZBTElEX0VNUFRZX1NVRkZJWCA9IC8oLT58XFwufDo6fFxcKCkkLztcblxuY29uc3QgQ2xhbmdDdXJzb3JUb0F1dG9jb21wbGV0aW9uVHlwZXMgPSB7XG4gIFNUUlVDVF9ERUNMOiAnY2xhc3MnLFxuICBVTklPTl9ERUNMOiAnY2xhc3MnLFxuICBDTEFTU19ERUNMOiAnY2xhc3MnLFxuICBFTlVNX0RFQ0w6ICdjbGFzcycsXG4gIEZJRUxEX0RFQ0w6ICdwcm9wZXJ0eScsXG4gIEVOVU1fQ09OU1RBTlRfREVDTDogJ2NvbnN0YW50JyxcbiAgRlVOQ1RJT05fREVDTDogJ2Z1bmN0aW9uJyxcbiAgVkFSX0RFQ0w6ICd2YXJpYWJsZScsXG4gIFBBUk1fREVDTDogJ3ZhcmlhYmxlJyxcbiAgT0JKQ19JTlRFUkZBQ0VfREVDTDogJ2NsYXNzJyxcbiAgT0JKQ19DQVRFR09SWV9ERUNMOiAnY2xhc3MnLFxuICBPQkpDX1BST1RPQ09MX0RFQ0w6ICdjbGFzcycsXG4gIE9CSkNfUFJPUEVSVFlfREVDTDogJ3Byb3BlcnR5JyxcbiAgT0JKQ19JVkFSX0RFQ0w6ICd2YXJpYWJsZScsXG4gIE9CSkNfSU5TVEFOQ0VfTUVUSE9EX0RFQ0w6ICdtZXRob2QnLFxuICBPQkpDX0NMQVNTX01FVEhPRF9ERUNMOiAnbWV0aG9kJyxcbiAgT0JKQ19JTVBMRU1FTlRBVElPTl9ERUNMOiAnY2xhc3MnLFxuICBPQkpDX0NBVEVHT1JZX0lNUExfREVDTDogJ2NsYXNzJyxcbiAgVFlQRURFRl9ERUNMOiAndHlwZScsXG4gIENYWF9NRVRIT0Q6ICdtZXRob2QnLFxuICBDT05TVFJVQ1RPUjogJ21ldGhvZCcsXG4gIERFU1RSVUNUT1I6ICdtZXRob2QnLFxuICBGVU5DVElPTl9URU1QTEFURTogJ2Z1bmN0aW9uJyxcbiAgQ0xBU1NfVEVNUExBVEU6ICdjbGFzcycsXG4gIE9WRVJMT0FEX0NBTkRJREFURTogJ2Z1bmN0aW9uJyxcbn07XG5cbmZ1bmN0aW9uIGdldENvbXBsZXRpb25Cb2R5KFxuICBjb21wbGV0aW9uOiBDbGFuZ0NvbXBsZXRpb24sXG4gIGNvbHVtbk9mZnNldDogbnVtYmVyLFxuICBpbmRlbnRhdGlvbjogbnVtYmVyXG4pOiBzdHJpbmcge1xuICBjb25zdCBpbmxpbmVCb2R5ID0gZ2V0Q29tcGxldGlvbkJvZHlJbmxpbmUoY29tcGxldGlvbik7XG4gIGNvbnN0IG11bHRpTGluZUJvZHkgPVxuICAgIGdldENvbXBsZXRpb25Cb2R5TXVsdGlMaW5lKGNvbXBsZXRpb24sIGNvbHVtbk9mZnNldCwgaW5kZW50YXRpb24pO1xuXG4gIGlmIChjb2x1bW5PZmZzZXQgKyBpbmxpbmVCb2R5Lmxlbmd0aCA+IE1BWF9MSU5FX0xFTkdUSCAmJiBtdWx0aUxpbmVCb2R5KSB7XG4gICAgcmV0dXJuIG11bHRpTGluZUJvZHk7XG4gIH1cbiAgcmV0dXJuIGlubGluZUJvZHk7XG59XG5cbmZ1bmN0aW9uIGdldENvbXBsZXRpb25Cb2R5TXVsdGlMaW5lKFxuICBjb21wbGV0aW9uOiBDbGFuZ0NvbXBsZXRpb24sXG4gIGNvbHVtbk9mZnNldDogbnVtYmVyLFxuICBpbmRlbnRhdGlvbjogbnVtYmVyXG4pOiA/c3RyaW5nIHtcbiAgLy8gRmlsdGVyIG91dCB3aGl0ZXNwYWNlIGNodW5rcy5cbiAgY29uc3QgY2h1bmtzID0gY29tcGxldGlvbi5jaHVua3MuZmlsdGVyKGNodW5rID0+IGNodW5rLnNwZWxsaW5nLnRyaW0oKSk7XG5cbiAgLy8gV2Ugb25seSBoYW5kbGUgY29tcGxldGlvbnMgaW4gd2hpY2ggbm9uLXBsYWNlaG9sZGVyIGFuZCBwbGFjZWhvbGRlclxuICAvLyBjaHVua3MgYWx0ZXJuYXRlLCBzdGFydGluZyB3aXRoIG5vbi1wbGFjZWhvbGRlciBjaHVuay5cbiAgaWYgKGNodW5rcy5sZW5ndGggJSAyKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvLyBHcm91cCBub24tcGxhY2Vob2xkZXJzIGFuZCBwbGFjZWhvbGRlcnMgaW50byBncm91cHMgb2YgdHdvLlxuICAvLyBPbmUgb2YgZWFjaC5cbiAgY29uc3QgYXJncyA9IFtdO1xuICBmb3IgKGxldCBpID0gMCwgbiA9IGNodW5rcy5sZW5ndGggLyAyOyBpIDwgbjsgKytpKSB7XG4gICAgY29uc3QgZmlyc3RDaHVuayA9IGNodW5rc1tpICogMl07XG4gICAgY29uc3Qgc2Vjb25kQ2h1bmsgPSBjaHVua3NbaSAqIDIgKyAxXTtcblxuICAgIGlmIChmaXJzdENodW5rLmlzUGxhY2VIb2xkZXIgfHwgIXNlY29uZENodW5rLmlzUGxhY2VIb2xkZXIpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIC8vIElmIGZpcnN0Q2h1bmsgZW5kcyB3aXRoIGNvbG9uIHJlbW92ZSBpdCBiZWNhdXNlIHdlIGFkZCBpdCBtYW51YWxseSBsYXRlci5cbiAgICBsZXQgdGV4dCA9IGZpcnN0Q2h1bmsuc3BlbGxpbmc7XG4gICAgY29uc3QgcGxhY2Vob2xkZXIgPSBzZWNvbmRDaHVuay5zcGVsbGluZztcbiAgICBpZiAodGV4dC5lbmRzV2l0aCgnOicpKSB7XG4gICAgICB0ZXh0ID0gdGV4dC5zdWJzdHJpbmcoMCwgdGV4dC5sZW5ndGggLSAxKTtcbiAgICB9XG5cbiAgICAvLyBBbGwgcm93cyBidXQgdGhlIGZpcnN0IG9uZSBzaG91bGQgYmUgaW5kZW50ZWQgYXQgbGVhc3QgMiBleHRyYSBsZXZlbHMuXG4gICAgLy8gVG8gZ2V0IHRoYXQgd2UgYWRkIGR1bW15IGxlYWRpbmcgc3BhY2VzIHRvIHRob3NlIHJvd3MuXG4gICAgaWYgKGkgPiAwKSB7XG4gICAgICB0ZXh0ID0gJyAnLnJlcGVhdCgyICogVEFCX0xFTkdUSCkgKyB0ZXh0O1xuICAgIH1cblxuICAgIGFyZ3MucHVzaCh7XG4gICAgICB0ZXh0LFxuICAgICAgcGxhY2Vob2xkZXIsXG4gICAgICBvZmZzZXQ6IChpID09PSAwKSA/IGNvbHVtbk9mZnNldCA6IGluZGVudGF0aW9uICogVEFCX0xFTkdUSCxcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiBfY29udmVydEFyZ3NUb011bHRpTGluZVNuaXBwZXQoYXJncyk7XG59XG5cbmZ1bmN0aW9uIF9jb252ZXJ0QXJnc1RvTXVsdGlMaW5lU25pcHBldChcbiAgYXJnczogQXJyYXk8e1xuICAgIHRleHQ6IHN0cmluZztcbiAgICBwbGFjZWhvbGRlcjogc3RyaW5nO1xuICAgIG9mZnNldDogbnVtYmVyO1xuICB9PlxuKTogc3RyaW5nIHtcbiAgLy8gV2UgaGF2ZSB0d28gdHlwZXMgb2YgbXVsdGluZSBsaW5lIG1ldGhvZCBjYWxscy5cbiAgLy9cbiAgLy8gMS4gSGVyZSBmaXJzdCBhcmd1bWVudCBpcyB0aGUgbG9uZ2VzdCwgc28gZXZlcnl0aGluZyBjYW4gYmVcbiAgLy8gICAgYWxpZ25lZCBuaWNlbHk6XG4gIC8vIFtzZWxmIEFyZ3VtZW50T25lOmFyZzFcbiAgLy8gICAgICAgICAgICAgIGFyZzI6YXJnMlxuICAvLyAgICAgICAgIEFyZ3VtZW50MzphcmczXVxuICAvL1xuICAvLyAyLiBIZXJlIGZpcnN0IGFyZ3VtZW50IGlzIG5vdCB0aGUgbG9uZ2VzdCwgYnV0IHdlIHN0aWxsIGRvbid0IG1vdmUgaXQuXG4gIC8vICAgIE9ubHkgcnVsZSBoZXJlIGlzIHRoYXQgY29sb25zIGluIHJlbWFpbmluZyByb3dzIGFyZSBhbGlnbmVkOlxuICAvLyBbc2VsZiBBcmcxOmFyZzFcbiAgLy8gICAgICAgICAgYXJnMjphcmcyXG4gIC8vICAgICBBcmd1bWVudDM6YXJnM11cbiAgLy9cblxuICBjb25zdCBjb2xvblBvc2l0aW9uID0gTWF0aC5tYXguYXBwbHkobnVsbCxcbiAgICBhcmdzLm1hcChhcmcgPT4gYXJnLm9mZnNldCArIGFyZy50ZXh0Lmxlbmd0aClcbiAgKTtcblxuICByZXR1cm4gYXJncy5yZWR1Y2UoKGJvZHksIGFyZywgaW5kZXgpID0+IHtcbiAgICBjb25zdCBzcGFjZXNDbnQgPSBpbmRleCA9PT0gMCA/IDAgOiBjb2xvblBvc2l0aW9uIC0gYXJnLm9mZnNldCAtIGFyZy50ZXh0Lmxlbmd0aDtcbiAgICBpZiAoc3BhY2VzQ250IDwgMCkge1xuICAgICAgdGhyb3cgRXJyb3IoJ1RoaXMgaXMgYSBidWchIFNwYWNlcyBjb3VudCBpcyBuZWdhdGl2ZS4nKTtcbiAgICB9XG5cbiAgICBjb25zdCBsaW5lID0gYCR7JyAnLnJlcGVhdChzcGFjZXNDbnQpfSR7YXJnLnRleHR9OlxcJHske2luZGV4ICsgMX06JHthcmcucGxhY2Vob2xkZXJ9fVxcbmA7XG4gICAgaWYgKGluZGV4ID4gMCAmJiBsaW5lW2NvbG9uUG9zaXRpb24gLSBhcmcub2Zmc2V0XSAhPT0gJzonKSB7XG4gICAgICB0aHJvdyBFcnJvcignVGhpcyBpcyBhIGJ1ZyEgQ29sb25zIGFyZSBub3QgYWxpZ25lZCEnKTtcbiAgICB9XG4gICAgcmV0dXJuIGJvZHkgKyBsaW5lO1xuICB9LCAnJyk7XG59XG5cbmZ1bmN0aW9uIGdldENvbXBsZXRpb25Cb2R5SW5saW5lKGNvbXBsZXRpb246IENsYW5nQ29tcGxldGlvbik6IHN0cmluZyB7XG4gIGxldCBib2R5ID0gJyc7XG4gIGxldCBwbGFjZUhvbGRlckNudCA9IDA7XG4gIGNvbXBsZXRpb24uY2h1bmtzLmZvckVhY2goY2h1bmsgPT4ge1xuICAgIGlmIChjaHVuay5pc1BsYWNlSG9sZGVyKSB7XG4gICAgICBwbGFjZUhvbGRlckNudCsrO1xuICAgICAgYm9keSArPSAnJHsnICsgcGxhY2VIb2xkZXJDbnQgKyAnOicgKyBjaHVuay5zcGVsbGluZyArICd9JztcbiAgICB9IGVsc2Uge1xuICAgICAgYm9keSArPSBjaHVuay5zcGVsbGluZztcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gYm9keTtcbn1cblxuZnVuY3Rpb24gZ2V0Q29tcGxldGlvblByZWZpeChlZGl0b3I6IGF0b20kVGV4dEVkaXRvcik6IHN0cmluZyB7XG4gIGNvbnN0IGN1cnNvciA9IGVkaXRvci5nZXRMYXN0Q3Vyc29yKCk7XG4gIGNvbnN0IHJhbmdlID0gY3Vyc29yLmdldEN1cnJlbnRXb3JkQnVmZmVyUmFuZ2Uoe1xuICAgIHdvcmRSZWdleDogY3Vyc29yLndvcmRSZWdFeHAoe2luY2x1ZGVOb25Xb3JkQ2hhcmFjdGVyczogZmFsc2V9KSxcbiAgfSk7XG5cbiAgLy8gQ3VycmVudCB3b3JkIG1pZ2h0IGdvIGJleW9uZCB0aGUgY3Vyc29yLCBzbyB3ZSBjdXQgaXQuXG4gIHJhbmdlLmVuZCA9IG5ldyBQb2ludChjdXJzb3IuZ2V0QnVmZmVyUm93KCksIGN1cnNvci5nZXRCdWZmZXJDb2x1bW4oKSk7XG4gIHJldHVybiBlZGl0b3IuZ2V0VGV4dEluQnVmZmVyUmFuZ2UocmFuZ2UpLnRyaW0oKTtcbn1cblxuY2xhc3MgQXV0b2NvbXBsZXRlUHJvdmlkZXIge1xuXG4gIEB0cmFja1RpbWluZygnbnVjbGlkZS1jbGFuZy1hdG9tLmF1dG9jb21wbGV0ZScpXG4gIGFzeW5jIGdldEF1dG9jb21wbGV0ZVN1Z2dlc3Rpb25zKFxuICAgIHJlcXVlc3Q6IGF0b20kQXV0b2NvbXBsZXRlUmVxdWVzdFxuICApOiBQcm9taXNlPEFycmF5PGF0b20kQXV0b2NvbXBsZXRlU3VnZ2VzdGlvbj4+IHtcbiAgICBjb25zdCB7ZWRpdG9yLCBidWZmZXJQb3NpdGlvbjoge3JvdywgY29sdW1ufSwgYWN0aXZhdGVkTWFudWFsbHl9ID0gcmVxdWVzdDtcbiAgICBjb25zdCBwcmVmaXggPSBnZXRDb21wbGV0aW9uUHJlZml4KGVkaXRvcik7XG4gICAgLy8gT25seSBhdXRvY29tcGxldGUgZW1wdHkgc3RyaW5ncyB3aGVuIGl0J3MgYSBtZXRob2QgKGEuPywgYS0+Pykgb3IgcXVhbGlmaWVyIChhOjo/KSxcbiAgICAvLyBvciBmdW5jdGlvbiBjYWxsIChmKC4uLikpLlxuICAgIGlmICghYWN0aXZhdGVkTWFudWFsbHkgJiYgcHJlZml4ID09PSAnJykge1xuICAgICAgY29uc3Qgd29yZFByZWZpeCA9IGVkaXRvci5nZXRMYXN0Q3Vyc29yKCkuZ2V0Q3VycmVudFdvcmRQcmVmaXgoKTtcbiAgICAgIGlmICghVkFMSURfRU1QVFlfU1VGRklYLnRlc3Qod29yZFByZWZpeCkpIHtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IGluZGVudGF0aW9uID0gZWRpdG9yLmluZGVudGF0aW9uRm9yQnVmZmVyUm93KHJvdyk7XG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IGdldENvbXBsZXRpb25zKGVkaXRvciwgcHJlZml4KTtcbiAgICBpZiAoZGF0YSA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgcmV0dXJuIGRhdGEuY29tcGxldGlvbnMubWFwKGNvbXBsZXRpb24gPT4ge1xuICAgICAgbGV0IHNuaXBwZXQsIGRpc3BsYXlUZXh0O1xuICAgICAgLy8gRm9yIGZ1bmN0aW9uIGFyZ3VtZW50IGNvbXBsZXRpb25zLCBzdHJpcCBvdXQgZXZlcnl0aGluZyBiZWZvcmUgdGhlIGN1cnJlbnQgcGFyYW1ldGVyLlxuICAgICAgLy8gSWRlYWxseSB3ZSdkIHVzZSB0aGUgcmVwbGFjZW1lbnQgcHJlZml4LCBidXQgdGhpcyBpcyBhIGhhcmQgcHJvYmxlbSBpbiBDKys6XG4gICAgICAvLyAgIGUuZy4gbWluPGRlY2x0eXBlKHgpPih4LCB5KSBpcyBhIHBlcmZlY3RseSB2YWxpZCBmdW5jdGlvbiBjYWxsLlxuICAgICAgaWYgKGNvbXBsZXRpb24uY3Vyc29yX2tpbmQgPT09ICdPVkVSTE9BRF9DQU5ESURBVEUnKSB7XG4gICAgICAgIGNvbnN0IGN1clBhcmFtSW5kZXggPSBhcnJheS5maW5kSW5kZXgoXG4gICAgICAgICAgY29tcGxldGlvbi5jaHVua3MsXG4gICAgICAgICAgeCA9PiB4LmtpbmQgPT09ICdDdXJyZW50UGFyYW1ldGVyJyxcbiAgICAgICAgKTtcbiAgICAgICAgaWYgKGN1clBhcmFtSW5kZXggIT09IC0xKSB7XG4gICAgICAgICAgY29tcGxldGlvbi5jaHVua3Muc3BsaWNlKDAsIGN1clBhcmFtSW5kZXgpO1xuICAgICAgICAgIHNuaXBwZXQgPSBnZXRDb21wbGV0aW9uQm9keShjb21wbGV0aW9uLCBjb2x1bW4sIGluZGVudGF0aW9uKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBGdW5jdGlvbiBoYWQgbm8gYXJndW1lbnRzLlxuICAgICAgICAgIHNuaXBwZXQgPSAnKSc7XG4gICAgICAgIH1cbiAgICAgICAgZGlzcGxheVRleHQgPSBjb21wbGV0aW9uLnNwZWxsaW5nO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc25pcHBldCA9IGdldENvbXBsZXRpb25Cb2R5KGNvbXBsZXRpb24sIGNvbHVtbiwgaW5kZW50YXRpb24pO1xuICAgICAgfVxuICAgICAgY29uc3QgcmlnaHRMYWJlbCA9IGNvbXBsZXRpb24uY3Vyc29yX2tpbmQgP1xuICAgICAgICBDbGFuZ0N1cnNvclRvRGVjbGFyYXRpb25UeXBlc1tjb21wbGV0aW9uLmN1cnNvcl9raW5kXSA6IG51bGw7XG4gICAgICBjb25zdCB0eXBlID0gY29tcGxldGlvbi5jdXJzb3Jfa2luZCA/XG4gICAgICAgIENsYW5nQ3Vyc29yVG9BdXRvY29tcGxldGlvblR5cGVzW2NvbXBsZXRpb24uY3Vyc29yX2tpbmRdIDogbnVsbDtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHNuaXBwZXQsXG4gICAgICAgIGRpc3BsYXlUZXh0LFxuICAgICAgICByZXBsYWNlbWVudFByZWZpeDogcHJlZml4LFxuICAgICAgICB0eXBlLFxuICAgICAgICBsZWZ0TGFiZWw6IGNvbXBsZXRpb24ucmVzdWx0X3R5cGUsXG4gICAgICAgIHJpZ2h0TGFiZWwsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBjb21wbGV0aW9uLnJlc3VsdF90eXBlLFxuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBBdXRvY29tcGxldGVQcm92aWRlcixcbiAgX190ZXN0X186IHtcbiAgICBnZXRDb21wbGV0aW9uQm9keU11bHRpTGluZSxcbiAgICBnZXRDb21wbGV0aW9uQm9keUlubGluZSxcbiAgfSxcbn07XG4iXX0=