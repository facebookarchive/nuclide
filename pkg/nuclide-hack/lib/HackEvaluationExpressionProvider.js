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

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _nuclideAtomHelpers = require('../../nuclide-atom-helpers');

// A heuristic for named variables in Hack.
// TODO: Replace RegExp with AST-based, more accurate approach.
var HACK_IDENTIFIER_REGEXP = /\$\w+/gi;

var HackEvaluationExpressionProvider = (function () {
  function HackEvaluationExpressionProvider() {
    _classCallCheck(this, HackEvaluationExpressionProvider);
  }

  _createClass(HackEvaluationExpressionProvider, [{
    key: 'getEvaluationExpression',
    value: function getEvaluationExpression(editor, position) {
      var extractedIdentifier = (0, _nuclideAtomHelpers.extractWordAtPosition)(editor, position, HACK_IDENTIFIER_REGEXP);
      if (extractedIdentifier == null) {
        return Promise.resolve(null);
      }
      var range = extractedIdentifier.range;
      var wordMatch = extractedIdentifier.wordMatch;

      var _wordMatch = _slicedToArray(wordMatch, 1);

      var expression = _wordMatch[0];

      if (expression == null) {
        return Promise.resolve(null);
      }
      return Promise.resolve({
        expression: expression,
        range: range
      });
    }
  }]);

  return HackEvaluationExpressionProvider;
})();

exports.HackEvaluationExpressionProvider = HackEvaluationExpressionProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkhhY2tFdmFsdWF0aW9uRXhwcmVzc2lvblByb3ZpZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OztrQ0Fhb0MsNEJBQTRCOzs7O0FBSWhFLElBQU0sc0JBQXNCLEdBQUcsU0FBUyxDQUFDOztJQUU1QixnQ0FBZ0M7V0FBaEMsZ0NBQWdDOzBCQUFoQyxnQ0FBZ0M7OztlQUFoQyxnQ0FBZ0M7O1dBRXBCLGlDQUNyQixNQUF1QixFQUN2QixRQUFvQixFQUNtQjtBQUN2QyxVQUFNLG1CQUFtQixHQUFHLCtDQUFzQixNQUFNLEVBQUUsUUFBUSxFQUFFLHNCQUFzQixDQUFDLENBQUM7QUFDNUYsVUFBSSxtQkFBbUIsSUFBSSxJQUFJLEVBQUU7QUFDL0IsZUFBTyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO09BQzlCO1VBRUMsS0FBSyxHQUVILG1CQUFtQixDQUZyQixLQUFLO1VBQ0wsU0FBUyxHQUNQLG1CQUFtQixDQURyQixTQUFTOztzQ0FFVSxTQUFTOztVQUF2QixVQUFVOztBQUNqQixVQUFJLFVBQVUsSUFBSSxJQUFJLEVBQUU7QUFDdEIsZUFBTyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO09BQzlCO0FBQ0QsYUFBTyxPQUFPLENBQUMsT0FBTyxDQUFDO0FBQ3JCLGtCQUFVLEVBQVYsVUFBVTtBQUNWLGFBQUssRUFBTCxLQUFLO09BQ04sQ0FBQyxDQUFDO0tBQ0o7OztTQXRCVSxnQ0FBZ0MiLCJmaWxlIjoiSGFja0V2YWx1YXRpb25FeHByZXNzaW9uUHJvdmlkZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7TnVjbGlkZUV2YWx1YXRpb25FeHByZXNzaW9ufSBmcm9tICcuLi8uLi9udWNsaWRlLWRlYnVnZ2VyLWludGVyZmFjZXMvc2VydmljZSc7XG5cbmltcG9ydCB7ZXh0cmFjdFdvcmRBdFBvc2l0aW9ufSBmcm9tICcuLi8uLi9udWNsaWRlLWF0b20taGVscGVycyc7XG5cbi8vIEEgaGV1cmlzdGljIGZvciBuYW1lZCB2YXJpYWJsZXMgaW4gSGFjay5cbi8vIFRPRE86IFJlcGxhY2UgUmVnRXhwIHdpdGggQVNULWJhc2VkLCBtb3JlIGFjY3VyYXRlIGFwcHJvYWNoLlxuY29uc3QgSEFDS19JREVOVElGSUVSX1JFR0VYUCA9IC9cXCRcXHcrL2dpO1xuXG5leHBvcnQgY2xhc3MgSGFja0V2YWx1YXRpb25FeHByZXNzaW9uUHJvdmlkZXIge1xuXG4gIGdldEV2YWx1YXRpb25FeHByZXNzaW9uKFxuICAgIGVkaXRvcjogYXRvbSRUZXh0RWRpdG9yLFxuICAgIHBvc2l0aW9uOiBhdG9tJFBvaW50LFxuICApOiBQcm9taXNlPD9OdWNsaWRlRXZhbHVhdGlvbkV4cHJlc3Npb24+IHtcbiAgICBjb25zdCBleHRyYWN0ZWRJZGVudGlmaWVyID0gZXh0cmFjdFdvcmRBdFBvc2l0aW9uKGVkaXRvciwgcG9zaXRpb24sIEhBQ0tfSURFTlRJRklFUl9SRUdFWFApO1xuICAgIGlmIChleHRyYWN0ZWRJZGVudGlmaWVyID09IG51bGwpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobnVsbCk7XG4gICAgfVxuICAgIGNvbnN0IHtcbiAgICAgIHJhbmdlLFxuICAgICAgd29yZE1hdGNoLFxuICAgIH0gPSBleHRyYWN0ZWRJZGVudGlmaWVyO1xuICAgIGNvbnN0IFtleHByZXNzaW9uXSA9IHdvcmRNYXRjaDtcbiAgICBpZiAoZXhwcmVzc2lvbiA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG51bGwpO1xuICAgIH1cbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHtcbiAgICAgIGV4cHJlc3Npb24sXG4gICAgICByYW5nZSxcbiAgICB9KTtcbiAgfVxufVxuIl19