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

var _nuclideAnalytics = require('../../nuclide-analytics');

var CodeFormatProvider = (function () {
  function CodeFormatProvider() {
    _classCallCheck(this, CodeFormatProvider);
  }

  _createDecoratedClass(CodeFormatProvider, [{
    key: 'formatCode',
    decorators: [(0, _nuclideAnalytics.trackTiming)('hack.formatCode')],
    value: function formatCode(editor, range) {
      return (0, _hack.formatSourceFromEditor)(editor, range);
    }
  }]);

  return CodeFormatProvider;
})();

module.exports = CodeFormatProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNvZGVGb3JtYXRQcm92aWRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7b0JBV3FDLFFBQVE7O2dDQUNuQix5QkFBeUI7O0lBRTdDLGtCQUFrQjtXQUFsQixrQkFBa0I7MEJBQWxCLGtCQUFrQjs7O3dCQUFsQixrQkFBa0I7O2lCQUVyQixtQ0FBWSxpQkFBaUIsQ0FBQztXQUNyQixvQkFBQyxNQUF1QixFQUFFLEtBQWlCLEVBQW1CO0FBQ3RFLGFBQU8sa0NBQXVCLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQztLQUM5Qzs7O1NBTEcsa0JBQWtCOzs7QUFTeEIsTUFBTSxDQUFDLE9BQU8sR0FBRyxrQkFBa0IsQ0FBQyIsImZpbGUiOiJDb2RlRm9ybWF0UHJvdmlkZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge2Zvcm1hdFNvdXJjZUZyb21FZGl0b3J9IGZyb20gJy4vaGFjayc7XG5pbXBvcnQge3RyYWNrVGltaW5nfSBmcm9tICcuLi8uLi9udWNsaWRlLWFuYWx5dGljcyc7XG5cbmNsYXNzIENvZGVGb3JtYXRQcm92aWRlciB7XG5cbiAgQHRyYWNrVGltaW5nKCdoYWNrLmZvcm1hdENvZGUnKVxuICBmb3JtYXRDb2RlKGVkaXRvcjogYXRvbSRUZXh0RWRpdG9yLCByYW5nZTogYXRvbSRSYW5nZSk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgcmV0dXJuIGZvcm1hdFNvdXJjZUZyb21FZGl0b3IoZWRpdG9yLCByYW5nZSk7XG4gIH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENvZGVGb3JtYXRQcm92aWRlcjtcbiJdfQ==