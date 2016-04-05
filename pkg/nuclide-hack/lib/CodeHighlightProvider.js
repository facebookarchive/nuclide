Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _hack = require('./hack');

var CodeHighlightProvider = (function () {
  function CodeHighlightProvider() {
    _classCallCheck(this, CodeHighlightProvider);
  }

  _createClass(CodeHighlightProvider, [{
    key: 'highlight',
    value: function highlight(editor, position) {
      return (0, _hack.codeHighlightFromEditor)(editor, position);
    }
  }]);

  return CodeHighlightProvider;
})();

exports['default'] = CodeHighlightProvider;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNvZGVIaWdobGlnaHRQcm92aWRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O29CQVdzQyxRQUFROztJQUV6QixxQkFBcUI7V0FBckIscUJBQXFCOzBCQUFyQixxQkFBcUI7OztlQUFyQixxQkFBcUI7O1dBQy9CLG1CQUFDLE1BQXVCLEVBQUUsUUFBb0IsRUFBOEI7QUFDbkYsYUFBTyxtQ0FBd0IsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0tBQ2xEOzs7U0FIa0IscUJBQXFCOzs7cUJBQXJCLHFCQUFxQiIsImZpbGUiOiJDb2RlSGlnaGxpZ2h0UHJvdmlkZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge2NvZGVIaWdobGlnaHRGcm9tRWRpdG9yfSBmcm9tICcuL2hhY2snO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb2RlSGlnaGxpZ2h0UHJvdmlkZXIge1xuICBoaWdobGlnaHQoZWRpdG9yOiBhdG9tJFRleHRFZGl0b3IsIHBvc2l0aW9uOiBhdG9tJFBvaW50KTogUHJvbWlzZTxBcnJheTxhdG9tJFJhbmdlPj4ge1xuICAgIHJldHVybiBjb2RlSGlnaGxpZ2h0RnJvbUVkaXRvcihlZGl0b3IsIHBvc2l0aW9uKTtcbiAgfVxufVxuIl19