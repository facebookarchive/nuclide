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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _outline = require('./outline');

var _config = require('./config');

var PythonOutlineProvider = (function () {
  function PythonOutlineProvider() {
    _classCallCheck(this, PythonOutlineProvider);
  }

  _createClass(PythonOutlineProvider, [{
    key: 'getOutline',
    value: _asyncToGenerator(function* (editor) {
      return (0, _outline.pythonTextToOutline)((0, _config.getShowGlobalVariables)(), editor.getText());
    })
  }]);

  return PythonOutlineProvider;
})();

exports.PythonOutlineProvider = PythonOutlineProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlB5dGhvbk91dGxpbmVQcm92aWRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7dUJBYWtDLFdBQVc7O3NCQUNSLFVBQVU7O0lBRWxDLHFCQUFxQjtXQUFyQixxQkFBcUI7MEJBQXJCLHFCQUFxQjs7O2VBQXJCLHFCQUFxQjs7NkJBQ2hCLFdBQUMsTUFBdUIsRUFBcUI7QUFDM0QsYUFBTyxrQ0FBb0IscUNBQXdCLEVBQUUsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7S0FDeEU7OztTQUhVLHFCQUFxQiIsImZpbGUiOiJQeXRob25PdXRsaW5lUHJvdmlkZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7T3V0bGluZX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1vdXRsaW5lLXZpZXcnO1xuXG5pbXBvcnQge3B5dGhvblRleHRUb091dGxpbmV9IGZyb20gJy4vb3V0bGluZSc7XG5pbXBvcnQge2dldFNob3dHbG9iYWxWYXJpYWJsZXN9IGZyb20gJy4vY29uZmlnJztcblxuZXhwb3J0IGNsYXNzIFB5dGhvbk91dGxpbmVQcm92aWRlciB7XG4gIGFzeW5jIGdldE91dGxpbmUoZWRpdG9yOiBhdG9tJFRleHRFZGl0b3IpOiBQcm9taXNlPD9PdXRsaW5lPiB7XG4gICAgcmV0dXJuIHB5dGhvblRleHRUb091dGxpbmUoZ2V0U2hvd0dsb2JhbFZhcmlhYmxlcygpLCBlZGl0b3IuZ2V0VGV4dCgpKTtcbiAgfVxufVxuIl19