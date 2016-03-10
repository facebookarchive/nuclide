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

var _libclang = require('./libclang');

var MAX_LINE_LENGTH = 120;
var TAB_LENGTH = 2;
var VALID_EMPTY_SUFFIX = /(->|\.|::)$/;

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
  CLASS_TEMPLATE: 'class'
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
      // Only autocomplete empty strings when it's a method (a.?, a->?) or qualifier (a::?).
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
        var snippet = getCompletionBody(completion, column, indentation);
        var rightLabel = completion.cursor_kind ? _clang.ClangCursorToDeclarationTypes[completion.cursor_kind] : null;
        var type = completion.cursor_kind ? ClangCursorToAutocompletionTypes[completion.cursor_kind] : null;
        return {
          snippet: snippet,
          replacementPrefix: prefix,
          type: type,
          leftLabel: completion.result_type,
          rightLabel: rightLabel
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkF1dG9jb21wbGV0ZVByb3ZpZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O29CQWFvQixNQUFNOzt5QkFDQSxpQkFBaUI7O3FCQUNDLGFBQWE7O3dCQUM1QixZQUFZOztBQUV6QyxJQUFNLGVBQWUsR0FBRyxHQUFHLENBQUM7QUFDNUIsSUFBTSxVQUFVLEdBQUcsQ0FBQyxDQUFDO0FBQ3JCLElBQU0sa0JBQWtCLEdBQUcsYUFBYSxDQUFDOztBQUV6QyxJQUFNLGdDQUFnQyxHQUFHO0FBQ3ZDLGFBQVcsRUFBRSxPQUFPO0FBQ3BCLFlBQVUsRUFBRSxPQUFPO0FBQ25CLFlBQVUsRUFBRSxPQUFPO0FBQ25CLFdBQVMsRUFBRSxPQUFPO0FBQ2xCLFlBQVUsRUFBRSxVQUFVO0FBQ3RCLG9CQUFrQixFQUFFLFVBQVU7QUFDOUIsZUFBYSxFQUFFLFVBQVU7QUFDekIsVUFBUSxFQUFFLFVBQVU7QUFDcEIsV0FBUyxFQUFFLFVBQVU7QUFDckIscUJBQW1CLEVBQUUsT0FBTztBQUM1QixvQkFBa0IsRUFBRSxPQUFPO0FBQzNCLG9CQUFrQixFQUFFLE9BQU87QUFDM0Isb0JBQWtCLEVBQUUsVUFBVTtBQUM5QixnQkFBYyxFQUFFLFVBQVU7QUFDMUIsMkJBQXlCLEVBQUUsUUFBUTtBQUNuQyx3QkFBc0IsRUFBRSxRQUFRO0FBQ2hDLDBCQUF3QixFQUFFLE9BQU87QUFDakMseUJBQXVCLEVBQUUsT0FBTztBQUNoQyxjQUFZLEVBQUUsTUFBTTtBQUNwQixZQUFVLEVBQUUsUUFBUTtBQUNwQixhQUFXLEVBQUUsUUFBUTtBQUNyQixZQUFVLEVBQUUsUUFBUTtBQUNwQixtQkFBaUIsRUFBRSxVQUFVO0FBQzdCLGdCQUFjLEVBQUUsT0FBTztDQUN4QixDQUFDOztBQUVGLFNBQVMsaUJBQWlCLENBQ3hCLFVBQTJCLEVBQzNCLFlBQW9CLEVBQ3BCLFdBQW1CLEVBQ1g7QUFDUixNQUFNLFVBQVUsR0FBRyx1QkFBdUIsQ0FBQyxVQUFVLENBQUMsQ0FB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VUFBVSxHQUFHLFVBQVUsQ0FBQyxXQUFXLEdBQ3ZDLHFDQUE4QixVQUFVLENBQUMsV0FBVyxDQUFDLEdBQUcsSUFBSSxDQUFDO0FBQy9ELFlBQU0sSUFBSSxHQUFHLFVBQVUsQ0FBQyxXQUFXLEdBQ2pDLGdDQUFnQyxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsR0FBRyxJQUFJLENBQUM7QUFDbEUsZUFBTztBQUNMLGlCQUFPLEVBQVAsT0FBTztBQUNQLDJCQUFpQixFQUFFLE1BQU07QUFDekIsY0FBSSxFQUFKLElBQUk7QUFDSixtQkFBUyxFQUFFLFVBQVUsQ0FBQyxXQUFXO0FBQ2pDLG9CQUFVLEVBQVYsVUFBVTtTQUNYLENBQUM7T0FDSCxDQUFDLENBQUM7S0FDSjs7O1NBcENHLG9CQUFvQjs7O0FBd0MxQixNQUFNLENBQUMsT0FBTyxHQUFHO0FBQ2Ysc0JBQW9CLEVBQXBCLG9CQUFvQjtBQUNwQixVQUFRLEVBQUU7QUFDUiw4QkFBMEIsRUFBMUIsMEJBQTBCO0FBQzFCLDJCQUF1QixFQUF2Qix1QkFBdUI7R0FDeEI7Q0FDRixDQUFDIiwiZmlsZSI6IkF1dG9jb21wbGV0ZVByb3ZpZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0NsYW5nQ29tcGxldGlvbn0gZnJvbSAnLi4vLi4vY2xhbmcnO1xuXG5pbXBvcnQge1BvaW50fSBmcm9tICdhdG9tJztcbmltcG9ydCB7dHJhY2tUaW1pbmd9IGZyb20gJy4uLy4uL2FuYWx5dGljcyc7XG5pbXBvcnQge0NsYW5nQ3Vyc29yVG9EZWNsYXJhdGlvblR5cGVzfSBmcm9tICcuLi8uLi9jbGFuZyc7XG5pbXBvcnQge2dldENvbXBsZXRpb25zfSBmcm9tICcuL2xpYmNsYW5nJztcblxuY29uc3QgTUFYX0xJTkVfTEVOR1RIID0gMTIwO1xuY29uc3QgVEFCX0xFTkdUSCA9IDI7XG5jb25zdCBWQUxJRF9FTVBUWV9TVUZGSVggPSAvKC0+fFxcLnw6OikkLztcblxuY29uc3QgQ2xhbmdDdXJzb3JUb0F1dG9jb21wbGV0aW9uVHlwZXMgPSB7XG4gIFNUUlVDVF9ERUNMOiAnY2xhc3MnLFxuICBVTklPTl9ERUNMOiAnY2xhc3MnLFxuICBDTEFTU19ERUNMOiAnY2xhc3MnLFxuICBFTlVNX0RFQ0w6ICdjbGFzcycsXG4gIEZJRUxEX0RFQ0w6ICdwcm9wZXJ0eScsXG4gIEVOVU1fQ09OU1RBTlRfREVDTDogJ2NvbnN0YW50JyxcbiAgRlVOQ1RJT05fREVDTDogJ2Z1bmN0aW9uJyxcbiAgVkFSX0RFQ0w6ICd2YXJpYWJsZScsXG4gIFBBUk1fREVDTDogJ3ZhcmlhYmxlJyxcbiAgT0JKQ19JTlRFUkZBQ0VfREVDTDogJ2NsYXNzJyxcbiAgT0JKQ19DQVRFR09SWV9ERUNMOiAnY2xhc3MnLFxuICBPQkpDX1BST1RPQ09MX0RFQ0w6ICdjbGFzcycsXG4gIE9CSkNfUFJPUEVSVFlfREVDTDogJ3Byb3BlcnR5JyxcbiAgT0JKQ19JVkFSX0RFQ0w6ICd2YXJpYWJsZScsXG4gIE9CSkNfSU5TVEFOQ0VfTUVUSE9EX0RFQ0w6ICdtZXRob2QnLFxuICBPQkpDX0NMQVNTX01FVEhPRF9ERUNMOiAnbWV0aG9kJyxcbiAgT0JKQ19JTVBMRU1FTlRBVElPTl9ERUNMOiAnY2xhc3MnLFxuICBPQkpDX0NBVEVHT1JZX0lNUExfREVDTDogJ2NsYXNzJyxcbiAgVFlQRURFRl9ERUNMOiAndHlwZScsXG4gIENYWF9NRVRIT0Q6ICdtZXRob2QnLFxuICBDT05TVFJVQ1RPUjogJ21ldGhvZCcsXG4gIERFU1RSVUNUT1I6ICdtZXRob2QnLFxuICBGVU5DVElPTl9URU1QTEFURTogJ2Z1bmN0aW9uJyxcbiAgQ0xBU1NfVEVNUExBVEU6ICdjbGFzcycsXG59O1xuXG5mdW5jdGlvbiBnZXRDb21wbGV0aW9uQm9keShcbiAgY29tcGxldGlvbjogQ2xhbmdDb21wbGV0aW9uLFxuICBjb2x1bW5PZmZzZXQ6IG51bWJlcixcbiAgaW5kZW50YXRpb246IG51bWJlclxuKTogc3RyaW5nIHtcbiAgY29uc3QgaW5saW5lQm9keSA9IGdldENvbXBsZXRpb25Cb2R5SW5saW5lKGNvbXBsZXRpb24pO1xuICBjb25zdCBtdWx0aUxpbmVCb2R5ID1cbiAgICBnZXRDb21wbGV0aW9uQm9keU11bHRpTGluZShjb21wbGV0aW9uLCBjb2x1bW5PZmZzZXQsIGluZGVudGF0aW9uKTtcblxuICBpZiAoY29sdW1uT2Zmc2V0ICsgaW5saW5lQm9keS5sZW5ndGggPiBNQVhfTElORV9MRU5HVEggJiYgbXVsdGlMaW5lQm9keSkge1xuICAgIHJldHVybiBtdWx0aUxpbmVCb2R5O1xuICB9XG4gIHJldHVybiBpbmxpbmVCb2R5O1xufVxuXG5mdW5jdGlvbiBnZXRDb21wbGV0aW9uQm9keU11bHRpTGluZShcbiAgY29tcGxldGlvbjogQ2xhbmdDb21wbGV0aW9uLFxuICBjb2x1bW5PZmZzZXQ6IG51bWJlcixcbiAgaW5kZW50YXRpb246IG51bWJlclxuKTogP3N0cmluZyB7XG4gIC8vIEZpbHRlciBvdXQgd2hpdGVzcGFjZSBjaHVua3MuXG4gIGNvbnN0IGNodW5rcyA9IGNvbXBsZXRpb24uY2h1bmtzLmZpbHRlcihjaHVuayA9PiBjaHVuay5zcGVsbGluZy50cmltKCkpO1xuXG4gIC8vIFdlIG9ubHkgaGFuZGxlIGNvbXBsZXRpb25zIGluIHdoaWNoIG5vbi1wbGFjZWhvbGRlciBhbmQgcGxhY2Vob2xkZXJcbiAgLy8gY2h1bmtzIGFsdGVybmF0ZSwgc3RhcnRpbmcgd2l0aCBub24tcGxhY2Vob2xkZXIgY2h1bmsuXG4gIGlmIChjaHVua3MubGVuZ3RoICUgMikge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLy8gR3JvdXAgbm9uLXBsYWNlaG9sZGVycyBhbmQgcGxhY2Vob2xkZXJzIGludG8gZ3JvdXBzIG9mIHR3by5cbiAgLy8gT25lIG9mIGVhY2guXG4gIGNvbnN0IGFyZ3MgPSBbXTtcbiAgZm9yIChsZXQgaSA9IDAsIG4gPSBjaHVua3MubGVuZ3RoIC8gMjsgaSA8IG47ICsraSkge1xuICAgIGNvbnN0IGZpcnN0Q2h1bmsgPSBjaHVua3NbaSAqIDJdO1xuICAgIGNvbnN0IHNlY29uZENodW5rID0gY2h1bmtzW2kgKiAyICsgMV07XG5cbiAgICBpZiAoZmlyc3RDaHVuay5pc1BsYWNlSG9sZGVyIHx8ICFzZWNvbmRDaHVuay5pc1BsYWNlSG9sZGVyKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBJZiBmaXJzdENodW5rIGVuZHMgd2l0aCBjb2xvbiByZW1vdmUgaXQgYmVjYXVzZSB3ZSBhZGQgaXQgbWFudWFsbHkgbGF0ZXIuXG4gICAgbGV0IHRleHQgPSBmaXJzdENodW5rLnNwZWxsaW5nO1xuICAgIGNvbnN0IHBsYWNlaG9sZGVyID0gc2Vjb25kQ2h1bmsuc3BlbGxpbmc7XG4gICAgaWYgKHRleHQuZW5kc1dpdGgoJzonKSkge1xuICAgICAgdGV4dCA9IHRleHQuc3Vic3RyaW5nKDAsIHRleHQubGVuZ3RoIC0gMSk7XG4gICAgfVxuXG4gICAgLy8gQWxsIHJvd3MgYnV0IHRoZSBmaXJzdCBvbmUgc2hvdWxkIGJlIGluZGVudGVkIGF0IGxlYXN0IDIgZXh0cmEgbGV2ZWxzLlxuICAgIC8vIFRvIGdldCB0aGF0IHdlIGFkZCBkdW1teSBsZWFkaW5nIHNwYWNlcyB0byB0aG9zZSByb3dzLlxuICAgIGlmIChpID4gMCkge1xuICAgICAgdGV4dCA9ICcgJy5yZXBlYXQoMiAqIFRBQl9MRU5HVEgpICsgdGV4dDtcbiAgICB9XG5cbiAgICBhcmdzLnB1c2goe1xuICAgICAgdGV4dCxcbiAgICAgIHBsYWNlaG9sZGVyLFxuICAgICAgb2Zmc2V0OiAoaSA9PT0gMCkgPyBjb2x1bW5PZmZzZXQgOiBpbmRlbnRhdGlvbiAqIFRBQl9MRU5HVEgsXG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gX2NvbnZlcnRBcmdzVG9NdWx0aUxpbmVTbmlwcGV0KGFyZ3MpO1xufVxuXG5mdW5jdGlvbiBfY29udmVydEFyZ3NUb011bHRpTGluZVNuaXBwZXQoXG4gIGFyZ3M6IEFycmF5PHtcbiAgICB0ZXh0OiBzdHJpbmc7XG4gICAgcGxhY2Vob2xkZXI6IHN0cmluZztcbiAgICBvZmZzZXQ6IG51bWJlcjtcbiAgfT5cbik6IHN0cmluZyB7XG4gIC8vIFdlIGhhdmUgdHdvIHR5cGVzIG9mIG11bHRpbmUgbGluZSBtZXRob2QgY2FsbHMuXG4gIC8vXG4gIC8vIDEuIEhlcmUgZmlyc3QgYXJndW1lbnQgaXMgdGhlIGxvbmdlc3QsIHNvIGV2ZXJ5dGhpbmcgY2FuIGJlXG4gIC8vICAgIGFsaWduZWQgbmljZWx5OlxuICAvLyBbc2VsZiBBcmd1bWVudE9uZTphcmcxXG4gIC8vICAgICAgICAgICAgICBhcmcyOmFyZzJcbiAgLy8gICAgICAgICBBcmd1bWVudDM6YXJnM11cbiAgLy9cbiAgLy8gMi4gSGVyZSBmaXJzdCBhcmd1bWVudCBpcyBub3QgdGhlIGxvbmdlc3QsIGJ1dCB3ZSBzdGlsbCBkb24ndCBtb3ZlIGl0LlxuICAvLyAgICBPbmx5IHJ1bGUgaGVyZSBpcyB0aGF0IGNvbG9ucyBpbiByZW1haW5pbmcgcm93cyBhcmUgYWxpZ25lZDpcbiAgLy8gW3NlbGYgQXJnMTphcmcxXG4gIC8vICAgICAgICAgIGFyZzI6YXJnMlxuICAvLyAgICAgQXJndW1lbnQzOmFyZzNdXG4gIC8vXG5cbiAgY29uc3QgY29sb25Qb3NpdGlvbiA9IE1hdGgubWF4LmFwcGx5KG51bGwsXG4gICAgYXJncy5tYXAoYXJnID0+IGFyZy5vZmZzZXQgKyBhcmcudGV4dC5sZW5ndGgpXG4gICk7XG5cbiAgcmV0dXJuIGFyZ3MucmVkdWNlKChib2R5LCBhcmcsIGluZGV4KSA9PiB7XG4gICAgY29uc3Qgc3BhY2VzQ250ID0gaW5kZXggPT09IDAgPyAwIDogY29sb25Qb3NpdGlvbiAtIGFyZy5vZmZzZXQgLSBhcmcudGV4dC5sZW5ndGg7XG4gICAgaWYgKHNwYWNlc0NudCA8IDApIHtcbiAgICAgIHRocm93IEVycm9yKCdUaGlzIGlzIGEgYnVnISBTcGFjZXMgY291bnQgaXMgbmVnYXRpdmUuJyk7XG4gICAgfVxuXG4gICAgY29uc3QgbGluZSA9IGAkeycgJy5yZXBlYXQoc3BhY2VzQ250KX0ke2FyZy50ZXh0fTpcXCR7JHtpbmRleCArIDF9OiR7YXJnLnBsYWNlaG9sZGVyfX1cXG5gO1xuICAgIGlmIChpbmRleCA+IDAgJiYgbGluZVtjb2xvblBvc2l0aW9uIC0gYXJnLm9mZnNldF0gIT09ICc6Jykge1xuICAgICAgdGhyb3cgRXJyb3IoJ1RoaXMgaXMgYSBidWchIENvbG9ucyBhcmUgbm90IGFsaWduZWQhJyk7XG4gICAgfVxuICAgIHJldHVybiBib2R5ICsgbGluZTtcbiAgfSwgJycpO1xufVxuXG5mdW5jdGlvbiBnZXRDb21wbGV0aW9uQm9keUlubGluZShjb21wbGV0aW9uOiBDbGFuZ0NvbXBsZXRpb24pOiBzdHJpbmcge1xuICBsZXQgYm9keSA9ICcnO1xuICBsZXQgcGxhY2VIb2xkZXJDbnQgPSAwO1xuICBjb21wbGV0aW9uLmNodW5rcy5mb3JFYWNoKGNodW5rID0+IHtcbiAgICBpZiAoY2h1bmsuaXNQbGFjZUhvbGRlcikge1xuICAgICAgcGxhY2VIb2xkZXJDbnQrKztcbiAgICAgIGJvZHkgKz0gJyR7JyArIHBsYWNlSG9sZGVyQ250ICsgJzonICsgY2h1bmsuc3BlbGxpbmcgKyAnfSc7XG4gICAgfSBlbHNlIHtcbiAgICAgIGJvZHkgKz0gY2h1bmsuc3BlbGxpbmc7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIGJvZHk7XG59XG5cbmZ1bmN0aW9uIGdldENvbXBsZXRpb25QcmVmaXgoZWRpdG9yOiBhdG9tJFRleHRFZGl0b3IpOiBzdHJpbmcge1xuICBjb25zdCBjdXJzb3IgPSBlZGl0b3IuZ2V0TGFzdEN1cnNvcigpO1xuICBjb25zdCByYW5nZSA9IGN1cnNvci5nZXRDdXJyZW50V29yZEJ1ZmZlclJhbmdlKHtcbiAgICB3b3JkUmVnZXg6IGN1cnNvci53b3JkUmVnRXhwKHtpbmNsdWRlTm9uV29yZENoYXJhY3RlcnM6IGZhbHNlfSksXG4gIH0pO1xuXG4gIC8vIEN1cnJlbnQgd29yZCBtaWdodCBnbyBiZXlvbmQgdGhlIGN1cnNvciwgc28gd2UgY3V0IGl0LlxuICByYW5nZS5lbmQgPSBuZXcgUG9pbnQoY3Vyc29yLmdldEJ1ZmZlclJvdygpLCBjdXJzb3IuZ2V0QnVmZmVyQ29sdW1uKCkpO1xuICByZXR1cm4gZWRpdG9yLmdldFRleHRJbkJ1ZmZlclJhbmdlKHJhbmdlKS50cmltKCk7XG59XG5cbmNsYXNzIEF1dG9jb21wbGV0ZVByb3ZpZGVyIHtcblxuICBAdHJhY2tUaW1pbmcoJ251Y2xpZGUtY2xhbmctYXRvbS5hdXRvY29tcGxldGUnKVxuICBhc3luYyBnZXRBdXRvY29tcGxldGVTdWdnZXN0aW9ucyhcbiAgICByZXF1ZXN0OiBhdG9tJEF1dG9jb21wbGV0ZVJlcXVlc3RcbiAgKTogUHJvbWlzZTxBcnJheTxhdG9tJEF1dG9jb21wbGV0ZVN1Z2dlc3Rpb24+PiB7XG4gICAgY29uc3Qge2VkaXRvciwgYnVmZmVyUG9zaXRpb246IHtyb3csIGNvbHVtbn0sIGFjdGl2YXRlZE1hbnVhbGx5fSA9IHJlcXVlc3Q7XG4gICAgY29uc3QgcHJlZml4ID0gZ2V0Q29tcGxldGlvblByZWZpeChlZGl0b3IpO1xuICAgIC8vIE9ubHkgYXV0b2NvbXBsZXRlIGVtcHR5IHN0cmluZ3Mgd2hlbiBpdCdzIGEgbWV0aG9kIChhLj8sIGEtPj8pIG9yIHF1YWxpZmllciAoYTo6PykuXG4gICAgaWYgKCFhY3RpdmF0ZWRNYW51YWxseSAmJiBwcmVmaXggPT09ICcnKSB7XG4gICAgICBjb25zdCB3b3JkUHJlZml4ID0gZWRpdG9yLmdldExhc3RDdXJzb3IoKS5nZXRDdXJyZW50V29yZFByZWZpeCgpO1xuICAgICAgaWYgKCFWQUxJRF9FTVBUWV9TVUZGSVgudGVzdCh3b3JkUHJlZml4KSkge1xuICAgICAgICByZXR1cm4gW107XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgaW5kZW50YXRpb24gPSBlZGl0b3IuaW5kZW50YXRpb25Gb3JCdWZmZXJSb3cocm93KTtcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgZ2V0Q29tcGxldGlvbnMoZWRpdG9yLCBwcmVmaXgpO1xuICAgIGlmIChkYXRhID09IG51bGwpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICByZXR1cm4gZGF0YS5jb21wbGV0aW9ucy5tYXAoY29tcGxldGlvbiA9PiB7XG4gICAgICBjb25zdCBzbmlwcGV0ID0gZ2V0Q29tcGxldGlvbkJvZHkoY29tcGxldGlvbiwgY29sdW1uLCBpbmRlbnRhdGlvbik7XG4gICAgICBjb25zdCByaWdodExhYmVsID0gY29tcGxldGlvbi5jdXJzb3Jfa2luZCA/XG4gICAgICAgIENsYW5nQ3Vyc29yVG9EZWNsYXJhdGlvblR5cGVzW2NvbXBsZXRpb24uY3Vyc29yX2tpbmRdIDogbnVsbDtcbiAgICAgIGNvbnN0IHR5cGUgPSBjb21wbGV0aW9uLmN1cnNvcl9raW5kID9cbiAgICAgICAgQ2xhbmdDdXJzb3JUb0F1dG9jb21wbGV0aW9uVHlwZXNbY29tcGxldGlvbi5jdXJzb3Jfa2luZF0gOiBudWxsO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc25pcHBldCxcbiAgICAgICAgcmVwbGFjZW1lbnRQcmVmaXg6IHByZWZpeCxcbiAgICAgICAgdHlwZSxcbiAgICAgICAgbGVmdExhYmVsOiBjb21wbGV0aW9uLnJlc3VsdF90eXBlLFxuICAgICAgICByaWdodExhYmVsLFxuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBBdXRvY29tcGxldGVQcm92aWRlcixcbiAgX190ZXN0X186IHtcbiAgICBnZXRDb21wbGV0aW9uQm9keU11bHRpTGluZSxcbiAgICBnZXRDb21wbGV0aW9uQm9keUlubGluZSxcbiAgfSxcbn07XG4iXX0=