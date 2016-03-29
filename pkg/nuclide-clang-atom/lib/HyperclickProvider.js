function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _nuclideAtomHelpers = require('../../nuclide-atom-helpers');

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
          return (0, _nuclideAtomHelpers.goToLocation)(result.file, result.line, result.column);
        }
      };
    } else {
      return null;
    }
  })
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkh5cGVyY2xpY2tQcm92aWRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7a0NBYTJCLDRCQUE0Qjs7eUJBQ2YsYUFBYTs7d0JBQ3hCLFlBQVk7O3NDQUNOLDBCQUEwQjs7OztBQUU3RCxJQUFNLGlCQUFpQixHQUFHLDJCQUEyQixDQUFDOztBQUV0RCxNQUFNLENBQUMsT0FBTyxHQUFHOzs7QUFHZixVQUFRLEVBQUUsRUFBRTtBQUNaLGNBQVkseUJBQWM7QUFDMUIsWUFBVSxFQUFFLGlCQUFpQjtBQUM3QixBQUFNLHNCQUFvQixvQkFBQSxXQUN4QixVQUFzQixFQUN0QixJQUFZLEVBQ1osS0FBaUIsRUFDZTtBQUNoQyxRQUFJLElBQUksS0FBSyxFQUFFLEVBQUU7QUFDZixhQUFPLElBQUksQ0FBQztLQUNiO0FBQ0QsUUFBSSxDQUFDLHVCQUFZLEdBQUcsQ0FBQyxVQUFVLENBQUMsVUFBVSxFQUFFLENBQUMsU0FBUyxDQUFDLEVBQUU7QUFDdkQsYUFBTyxJQUFJLENBQUM7S0FDYjs7UUFFYSxRQUFRLEdBQUksS0FBSyxDQUF4QixLQUFLOztBQUVaLFFBQU0sTUFBTSxHQUFHLE1BQU0sOEJBQWUsVUFBVSxFQUFFLFFBQVEsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQy9FLFFBQUksTUFBTSxFQUFFO0FBQ1YsVUFBTSxVQUFVLEdBQ2QseUNBQXVCLFVBQVUsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ2xGLGFBQU87QUFDTCxhQUFLLEVBQUUsVUFBVTtBQUNqQixnQkFBUSxFQUFFO2lCQUFNLHNDQUFhLE1BQU0sQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDO1NBQUE7T0FDdEUsQ0FBQztLQUNILE1BQU07QUFDTCxhQUFPLElBQUksQ0FBQztLQUNiO0dBQ0YsQ0FBQTtDQUNGLENBQUMiLCJmaWxlIjoiSHlwZXJjbGlja1Byb3ZpZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0h5cGVyY2xpY2tTdWdnZXN0aW9ufSBmcm9tICcuLi8uLi9oeXBlcmNsaWNrLWludGVyZmFjZXMnO1xuXG5pbXBvcnQge2dvVG9Mb2NhdGlvbn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1hdG9tLWhlbHBlcnMnO1xuaW1wb3J0IHtHUkFNTUFSX1NFVCwgUEFDS0FHRV9OQU1FfSBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQge2dldERlY2xhcmF0aW9ufSBmcm9tICcuL2xpYmNsYW5nJztcbmltcG9ydCBmaW5kV2hvbGVSYW5nZU9mU3ltYm9sIGZyb20gJy4vZmluZFdob2xlUmFuZ2VPZlN5bWJvbCc7XG5cbmNvbnN0IElERU5USUZJRVJfUkVHRVhQID0gLyhbYS16QS1aX11bYS16QS1aMC05X10qKS9nO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgLy8gSXQgaXMgaW1wb3J0YW50IHRoYXQgdGhpcyBoYXMgYSBsb3dlciBwcmlvcml0eSB0aGFuIHRoZSBoYW5kbGVyIGZyb21cbiAgLy8gZmItZGlmZnMtYW5kLXRhc2tzLlxuICBwcmlvcml0eTogMTAsXG4gIHByb3ZpZGVyTmFtZTogUEFDS0FHRV9OQU1FLFxuICB3b3JkUmVnRXhwOiBJREVOVElGSUVSX1JFR0VYUCxcbiAgYXN5bmMgZ2V0U3VnZ2VzdGlvbkZvcldvcmQoXG4gICAgdGV4dEVkaXRvcjogVGV4dEVkaXRvcixcbiAgICB0ZXh0OiBzdHJpbmcsXG4gICAgcmFuZ2U6IGF0b20kUmFuZ2UsXG4gICk6IFByb21pc2U8P0h5cGVyY2xpY2tTdWdnZXN0aW9uPiB7XG4gICAgaWYgKHRleHQgPT09ICcnKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgaWYgKCFHUkFNTUFSX1NFVC5oYXModGV4dEVkaXRvci5nZXRHcmFtbWFyKCkuc2NvcGVOYW1lKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3Qge3N0YXJ0OiBwb3NpdGlvbn0gPSByYW5nZTtcblxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGdldERlY2xhcmF0aW9uKHRleHRFZGl0b3IsIHBvc2l0aW9uLnJvdywgcG9zaXRpb24uY29sdW1uKTtcbiAgICBpZiAocmVzdWx0KSB7XG4gICAgICBjb25zdCB3aG9sZVJhbmdlID1cbiAgICAgICAgZmluZFdob2xlUmFuZ2VPZlN5bWJvbCh0ZXh0RWRpdG9yLCB0ZXh0LCByYW5nZSwgcmVzdWx0LnNwZWxsaW5nLCByZXN1bHQuZXh0ZW50KTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHJhbmdlOiB3aG9sZVJhbmdlLFxuICAgICAgICBjYWxsYmFjazogKCkgPT4gZ29Ub0xvY2F0aW9uKHJlc3VsdC5maWxlLCByZXN1bHQubGluZSwgcmVzdWx0LmNvbHVtbiksXG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH0sXG59O1xuIl19