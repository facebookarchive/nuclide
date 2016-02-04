function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkh5cGVyY2xpY2tQcm92aWRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7MkJBYTJCLG9CQUFvQjs7eUJBQ1AsYUFBYTs7d0JBQ3hCLFlBQVk7O3NDQUNOLDBCQUEwQjs7OztBQUU3RCxJQUFNLGlCQUFpQixHQUFHLDJCQUEyQixDQUFDOztBQUV0RCxNQUFNLENBQUMsT0FBTyxHQUFHOzs7QUFHZixVQUFRLEVBQUUsRUFBRTtBQUNaLGNBQVkseUJBQWM7QUFDMUIsWUFBVSxFQUFFLGlCQUFpQjtBQUM3QixBQUFNLHNCQUFvQixvQkFBQSxXQUN4QixVQUFzQixFQUN0QixJQUFZLEVBQ1osS0FBaUIsRUFDZTtBQUNoQyxRQUFJLElBQUksS0FBSyxFQUFFLEVBQUU7QUFDZixhQUFPLElBQUksQ0FBQztLQUNiO0FBQ0QsUUFBSSxDQUFDLHVCQUFZLEdBQUcsQ0FBQyxVQUFVLENBQUMsVUFBVSxFQUFFLENBQUMsU0FBUyxDQUFDLEVBQUU7QUFDdkQsYUFBTyxJQUFJLENBQUM7S0FDYjs7UUFFYSxRQUFRLEdBQUksS0FBSyxDQUF4QixLQUFLOztBQUVaLFFBQU0sTUFBTSxHQUFHLE1BQU0sOEJBQWUsVUFBVSxFQUFFLFFBQVEsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQy9FLFFBQUksTUFBTSxFQUFFO0FBQ1YsVUFBTSxVQUFVLEdBQUcseUNBQXVCLFVBQVUsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ25HLGFBQU87QUFDTCxhQUFLLEVBQUUsVUFBVTtBQUNqQixnQkFBUSxFQUFFO2lCQUFNLCtCQUFhLE1BQU0sQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDO1NBQUE7T0FDdEUsQ0FBQztLQUNILE1BQU07QUFDTCxhQUFPLElBQUksQ0FBQztLQUNiO0dBQ0YsQ0FBQTtDQUNGLENBQUMiLCJmaWxlIjoiSHlwZXJjbGlja1Byb3ZpZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0h5cGVyY2xpY2tTdWdnZXN0aW9ufSBmcm9tICcuLi8uLi9oeXBlcmNsaWNrLWludGVyZmFjZXMnO1xuXG5pbXBvcnQge2dvVG9Mb2NhdGlvbn0gZnJvbSAnLi4vLi4vYXRvbS1oZWxwZXJzJztcbmltcG9ydCB7R1JBTU1BUl9TRVQsIFBBQ0tBR0VfTkFNRX0gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IHtnZXREZWNsYXJhdGlvbn0gZnJvbSAnLi9saWJjbGFuZyc7XG5pbXBvcnQgZmluZFdob2xlUmFuZ2VPZlN5bWJvbCBmcm9tICcuL2ZpbmRXaG9sZVJhbmdlT2ZTeW1ib2wnO1xuXG5jb25zdCBJREVOVElGSUVSX1JFR0VYUCA9IC8oW2EtekEtWl9dW2EtekEtWjAtOV9dKikvZztcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIC8vIEl0IGlzIGltcG9ydGFudCB0aGF0IHRoaXMgaGFzIGEgbG93ZXIgcHJpb3JpdHkgdGhhbiB0aGUgaGFuZGxlciBmcm9tXG4gIC8vIGZiLWRpZmZzLWFuZC10YXNrcy5cbiAgcHJpb3JpdHk6IDEwLFxuICBwcm92aWRlck5hbWU6IFBBQ0tBR0VfTkFNRSxcbiAgd29yZFJlZ0V4cDogSURFTlRJRklFUl9SRUdFWFAsXG4gIGFzeW5jIGdldFN1Z2dlc3Rpb25Gb3JXb3JkKFxuICAgIHRleHRFZGl0b3I6IFRleHRFZGl0b3IsXG4gICAgdGV4dDogc3RyaW5nLFxuICAgIHJhbmdlOiBhdG9tJFJhbmdlLFxuICApOiBQcm9taXNlPD9IeXBlcmNsaWNrU3VnZ2VzdGlvbj4ge1xuICAgIGlmICh0ZXh0ID09PSAnJykge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGlmICghR1JBTU1BUl9TRVQuaGFzKHRleHRFZGl0b3IuZ2V0R3JhbW1hcigpLnNjb3BlTmFtZSkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IHtzdGFydDogcG9zaXRpb259ID0gcmFuZ2U7XG5cbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBnZXREZWNsYXJhdGlvbih0ZXh0RWRpdG9yLCBwb3NpdGlvbi5yb3csIHBvc2l0aW9uLmNvbHVtbik7XG4gICAgaWYgKHJlc3VsdCkge1xuICAgICAgY29uc3Qgd2hvbGVSYW5nZSA9IGZpbmRXaG9sZVJhbmdlT2ZTeW1ib2wodGV4dEVkaXRvciwgdGV4dCwgcmFuZ2UsIHJlc3VsdC5zcGVsbGluZywgcmVzdWx0LmV4dGVudCk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICByYW5nZTogd2hvbGVSYW5nZSxcbiAgICAgICAgY2FsbGJhY2s6ICgpID0+IGdvVG9Mb2NhdGlvbihyZXN1bHQuZmlsZSwgcmVzdWx0LmxpbmUsIHJlc3VsdC5jb2x1bW4pLFxuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9LFxufTtcbiJdfQ==