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

var _constants = require('./constants');

var FlowEvaluationExpressionProvider = (function () {
  function FlowEvaluationExpressionProvider() {
    _classCallCheck(this, FlowEvaluationExpressionProvider);
  }

  _createClass(FlowEvaluationExpressionProvider, [{
    key: 'getEvaluationExpression',
    value: function getEvaluationExpression(editor, position) {
      // TODO: Replace RegExp with AST-based, more accurate approach.
      var extractedIdentifier = (0, _nuclideAtomHelpers.extractWordAtPosition)(editor, position, _constants.JAVASCRIPT_IDENTIFIER_REGEX);
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

  return FlowEvaluationExpressionProvider;
})();

exports.FlowEvaluationExpressionProvider = FlowEvaluationExpressionProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZsb3dFdmFsdWF0aW9uRXhwcmVzc2lvblByb3ZpZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OztrQ0Fhb0MsNEJBQTRCOzt5QkFDdEIsYUFBYTs7SUFFMUMsZ0NBQWdDO1dBQWhDLGdDQUFnQzswQkFBaEMsZ0NBQWdDOzs7ZUFBaEMsZ0NBQWdDOztXQUVwQixpQ0FDckIsTUFBdUIsRUFDdkIsUUFBb0IsRUFDbUI7O0FBRXZDLFVBQU0sbUJBQW1CLEdBQUcsK0NBQzFCLE1BQU0sRUFDTixRQUFRLHlDQUVULENBQUM7QUFDRixVQUFJLG1CQUFtQixJQUFJLElBQUksRUFBRTtBQUMvQixlQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7T0FDOUI7VUFFQyxLQUFLLEdBRUgsbUJBQW1CLENBRnJCLEtBQUs7VUFDTCxTQUFTLEdBQ1AsbUJBQW1CLENBRHJCLFNBQVM7O3NDQUVVLFNBQVM7O1VBQXZCLFVBQVU7O0FBQ2pCLFVBQUksVUFBVSxJQUFJLElBQUksRUFBRTtBQUN0QixlQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7T0FDOUI7QUFDRCxhQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUM7QUFDckIsa0JBQVUsRUFBVixVQUFVO0FBQ1YsYUFBSyxFQUFMLEtBQUs7T0FDTixDQUFDLENBQUM7S0FDSjs7O1NBM0JVLGdDQUFnQyIsImZpbGUiOiJGbG93RXZhbHVhdGlvbkV4cHJlc3Npb25Qcm92aWRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtOdWNsaWRlRXZhbHVhdGlvbkV4cHJlc3Npb259IGZyb20gJy4uLy4uL251Y2xpZGUtZGVidWdnZXItaW50ZXJmYWNlcy9zZXJ2aWNlJztcblxuaW1wb3J0IHtleHRyYWN0V29yZEF0UG9zaXRpb259IGZyb20gJy4uLy4uL251Y2xpZGUtYXRvbS1oZWxwZXJzJztcbmltcG9ydCB7SkFWQVNDUklQVF9JREVOVElGSUVSX1JFR0VYfSBmcm9tICcuL2NvbnN0YW50cyc7XG5cbmV4cG9ydCBjbGFzcyBGbG93RXZhbHVhdGlvbkV4cHJlc3Npb25Qcm92aWRlciB7XG5cbiAgZ2V0RXZhbHVhdGlvbkV4cHJlc3Npb24oXG4gICAgZWRpdG9yOiBhdG9tJFRleHRFZGl0b3IsXG4gICAgcG9zaXRpb246IGF0b20kUG9pbnQsXG4gICk6IFByb21pc2U8P051Y2xpZGVFdmFsdWF0aW9uRXhwcmVzc2lvbj4ge1xuICAgIC8vIFRPRE86IFJlcGxhY2UgUmVnRXhwIHdpdGggQVNULWJhc2VkLCBtb3JlIGFjY3VyYXRlIGFwcHJvYWNoLlxuICAgIGNvbnN0IGV4dHJhY3RlZElkZW50aWZpZXIgPSBleHRyYWN0V29yZEF0UG9zaXRpb24oXG4gICAgICBlZGl0b3IsXG4gICAgICBwb3NpdGlvbixcbiAgICAgIEpBVkFTQ1JJUFRfSURFTlRJRklFUl9SRUdFWCxcbiAgICApO1xuICAgIGlmIChleHRyYWN0ZWRJZGVudGlmaWVyID09IG51bGwpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobnVsbCk7XG4gICAgfVxuICAgIGNvbnN0IHtcbiAgICAgIHJhbmdlLFxuICAgICAgd29yZE1hdGNoLFxuICAgIH0gPSBleHRyYWN0ZWRJZGVudGlmaWVyO1xuICAgIGNvbnN0IFtleHByZXNzaW9uXSA9IHdvcmRNYXRjaDtcbiAgICBpZiAoZXhwcmVzc2lvbiA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG51bGwpO1xuICAgIH1cbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHtcbiAgICAgIGV4cHJlc3Npb24sXG4gICAgICByYW5nZSxcbiAgICB9KTtcbiAgfVxufVxuIl19