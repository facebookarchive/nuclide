var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === 'function') { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError('The decorator for method ' + descriptor.key + ' is of the invalid type ' + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _hack = require('./hack');

var _analytics = require('../../analytics');

var CodeFormatProvider = (function () {
  function CodeFormatProvider() {
    _classCallCheck(this, CodeFormatProvider);
  }

  _createDecoratedClass(CodeFormatProvider, [{
    key: 'formatCode',
    decorators: [(0, _analytics.trackTiming)('hack.formatCode')],
    value: function formatCode(editor, range) {
      return (0, _hack.formatSourceFromEditor)(editor, range);
    }
  }]);

  return CodeFormatProvider;
})();

module.exports = CodeFormatProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNvZGVGb3JtYXRQcm92aWRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7b0JBV3FDLFFBQVE7O3lCQUNuQixpQkFBaUI7O0lBRXJDLGtCQUFrQjtXQUFsQixrQkFBa0I7MEJBQWxCLGtCQUFrQjs7O3dCQUFsQixrQkFBa0I7O2lCQUVyQiw0QkFBWSxpQkFBaUIsQ0FBQztXQUNyQixvQkFBQyxNQUF1QixFQUFFLEtBQWlCLEVBQW1CO0FBQ3RFLGFBQU8sa0NBQXVCLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQztLQUM5Qzs7O1NBTEcsa0JBQWtCOzs7QUFTeEIsTUFBTSxDQUFDLE9BQU8sR0FBRyxrQkFBa0IsQ0FBQyIsImZpbGUiOiJDb2RlRm9ybWF0UHJvdmlkZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge2Zvcm1hdFNvdXJjZUZyb21FZGl0b3J9IGZyb20gJy4vaGFjayc7XG5pbXBvcnQge3RyYWNrVGltaW5nfSBmcm9tICcuLi8uLi9hbmFseXRpY3MnO1xuXG5jbGFzcyBDb2RlRm9ybWF0UHJvdmlkZXIge1xuXG4gIEB0cmFja1RpbWluZygnaGFjay5mb3JtYXRDb2RlJylcbiAgZm9ybWF0Q29kZShlZGl0b3I6IGF0b20kVGV4dEVkaXRvciwgcmFuZ2U6IGF0b20kUmFuZ2UpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIHJldHVybiBmb3JtYXRTb3VyY2VGcm9tRWRpdG9yKGVkaXRvciwgcmFuZ2UpO1xuICB9XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBDb2RlRm9ybWF0UHJvdmlkZXI7XG4iXX0=