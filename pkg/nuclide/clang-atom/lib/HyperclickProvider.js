function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _atomHelpers = require('../../atom-helpers');

var _constants = require('./constants');

var _libclang = require('./libclang');

var _findWholeRangeOfSymbol = require('./findWholeRangeOfSymbol');

var _findWholeRangeOfSymbol2 = _interopRequireDefault(_findWholeRangeOfSymbol);

var IDENTIFIER_REGEXP = /([a-zA-Z_][a-zA-Z0-9_]*)/g;

module.exports = {
  // It is important that this has a lower priority than the handler from
  // fb-diffs-and-tasks.
  priority: 10,
  providerName: _constants.PACKAGE_NAME,
  wordRegExp: IDENTIFIER_REGEXP,
  getSuggestionForWord: _asyncToGenerator(function* (textEditor, text, range) {
    if (text === '') {
      return null;
    }
    if (!_constants.GRAMMAR_SET.has(textEditor.getGrammar().scopeName)) {
      return null;
    }

    var position = range.start;

    var result = yield (0, _libclang.getDeclaration)(textEditor, position.row, position.column);
    if (result) {
      var wholeRange = (0, _findWholeRangeOfSymbol2['default'])(textEditor, text, range, result.spelling, result.extent);
      return {
        range: wholeRange,
        callback: function callback() {
          return (0, _atomHelpers.goToLocation)(result.file, result.line, result.column);
        }
      };
    } else {
      return null;
    }
  })
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkh5cGVyY2xpY2tQcm92aWRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7c0JBYXNCLFFBQVE7Ozs7MkJBQ0gsb0JBQW9COzt5QkFDUCxhQUFhOzt3QkFDeEIsWUFBWTs7c0NBQ04sMEJBQTBCOzs7O0FBRTdELElBQU0saUJBQWlCLEdBQUcsMkJBQTJCLENBQUM7O0FBRXRELE1BQU0sQ0FBQyxPQUFPLEdBQUc7OztBQUdmLFVBQVEsRUFBRSxFQUFFO0FBQ1osY0FBWSx5QkFBYztBQUMxQixZQUFVLEVBQUUsaUJBQWlCO0FBQzdCLEFBQU0sc0JBQW9CLG9CQUFBLFdBQ3hCLFVBQXNCLEVBQ3RCLElBQVksRUFDWixLQUFpQixFQUNlO0FBQ2hDLFFBQUksSUFBSSxLQUFLLEVBQUUsRUFBRTtBQUNmLGFBQU8sSUFBSSxDQUFDO0tBQ2I7QUFDRCxRQUFJLENBQUMsdUJBQVksR0FBRyxDQUFDLFVBQVUsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxTQUFTLENBQUMsRUFBRTtBQUN2RCxhQUFPLElBQUksQ0FBQztLQUNiOztRQUVhLFFBQVEsR0FBSSxLQUFLLENBQXhCLEtBQUs7O0FBRVosUUFBTSxNQUFNLEdBQUcsTUFBTSw4QkFBZSxVQUFVLEVBQUUsUUFBUSxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDL0UsUUFBSSxNQUFNLEVBQUU7QUFDVixVQUFNLFVBQVUsR0FBRyx5Q0FBdUIsVUFBVSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDbkcsYUFBTztBQUNMLGFBQUssRUFBRSxVQUFVO0FBQ2pCLGdCQUFRLEVBQUU7aUJBQU0sK0JBQWEsTUFBTSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUM7U0FBQTtPQUN0RSxDQUFDO0tBQ0gsTUFBTTtBQUNMLGFBQU8sSUFBSSxDQUFDO0tBQ2I7R0FDRixDQUFBO0NBQ0YsQ0FBQyIsImZpbGUiOiJIeXBlcmNsaWNrUHJvdmlkZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7SHlwZXJjbGlja1N1Z2dlc3Rpb259IGZyb20gJy4uLy4uL2h5cGVyY2xpY2staW50ZXJmYWNlcyc7XG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCB7Z29Ub0xvY2F0aW9ufSBmcm9tICcuLi8uLi9hdG9tLWhlbHBlcnMnO1xuaW1wb3J0IHtHUkFNTUFSX1NFVCwgUEFDS0FHRV9OQU1FfSBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQge2dldERlY2xhcmF0aW9ufSBmcm9tICcuL2xpYmNsYW5nJztcbmltcG9ydCBmaW5kV2hvbGVSYW5nZU9mU3ltYm9sIGZyb20gJy4vZmluZFdob2xlUmFuZ2VPZlN5bWJvbCc7XG5cbmNvbnN0IElERU5USUZJRVJfUkVHRVhQID0gLyhbYS16QS1aX11bYS16QS1aMC05X10qKS9nO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgLy8gSXQgaXMgaW1wb3J0YW50IHRoYXQgdGhpcyBoYXMgYSBsb3dlciBwcmlvcml0eSB0aGFuIHRoZSBoYW5kbGVyIGZyb21cbiAgLy8gZmItZGlmZnMtYW5kLXRhc2tzLlxuICBwcmlvcml0eTogMTAsXG4gIHByb3ZpZGVyTmFtZTogUEFDS0FHRV9OQU1FLFxuICB3b3JkUmVnRXhwOiBJREVOVElGSUVSX1JFR0VYUCxcbiAgYXN5bmMgZ2V0U3VnZ2VzdGlvbkZvcldvcmQoXG4gICAgdGV4dEVkaXRvcjogVGV4dEVkaXRvcixcbiAgICB0ZXh0OiBzdHJpbmcsXG4gICAgcmFuZ2U6IGF0b20kUmFuZ2UsXG4gICk6IFByb21pc2U8P0h5cGVyY2xpY2tTdWdnZXN0aW9uPiB7XG4gICAgaWYgKHRleHQgPT09ICcnKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgaWYgKCFHUkFNTUFSX1NFVC5oYXModGV4dEVkaXRvci5nZXRHcmFtbWFyKCkuc2NvcGVOYW1lKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3Qge3N0YXJ0OiBwb3NpdGlvbn0gPSByYW5nZTtcblxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGdldERlY2xhcmF0aW9uKHRleHRFZGl0b3IsIHBvc2l0aW9uLnJvdywgcG9zaXRpb24uY29sdW1uKTtcbiAgICBpZiAocmVzdWx0KSB7XG4gICAgICBjb25zdCB3aG9sZVJhbmdlID0gZmluZFdob2xlUmFuZ2VPZlN5bWJvbCh0ZXh0RWRpdG9yLCB0ZXh0LCByYW5nZSwgcmVzdWx0LnNwZWxsaW5nLCByZXN1bHQuZXh0ZW50KTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHJhbmdlOiB3aG9sZVJhbmdlLFxuICAgICAgICBjYWxsYmFjazogKCkgPT4gZ29Ub0xvY2F0aW9uKHJlc3VsdC5maWxlLCByZXN1bHQubGluZSwgcmVzdWx0LmNvbHVtbiksXG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH0sXG59O1xuIl19