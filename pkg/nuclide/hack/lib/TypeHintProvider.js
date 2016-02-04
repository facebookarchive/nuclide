var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === 'function') { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError('The decorator for method ' + descriptor.key + ' is of the invalid type ' + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _hack = require('./hack');

var _analytics = require('../../analytics');

module.exports = (function () {
  function TypeHintProvider() {
    _classCallCheck(this, TypeHintProvider);
  }

  _createDecoratedClass(TypeHintProvider, [{
    key: 'typeHint',
    decorators: [(0, _analytics.trackTiming)('hack.typeHint')],
    value: function typeHint(editor, position) {
      return (0, _hack.typeHintFromEditor)(editor, position);
    }
  }]);

  return TypeHintProvider;
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlR5cGVIaW50UHJvdmlkZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O29CQWFpQyxRQUFROzt5QkFDZixpQkFBaUI7O0FBRTNDLE1BQU0sQ0FBQyxPQUFPO1dBQVMsZ0JBQWdCOzBCQUFoQixnQkFBZ0I7Ozt3QkFBaEIsZ0JBQWdCOztpQkFFcEMsNEJBQVksZUFBZSxDQUFDO1dBQ3JCLGtCQUFDLE1BQXVCLEVBQUUsUUFBb0IsRUFBc0I7QUFDMUUsYUFBTyw4QkFBbUIsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0tBQzdDOzs7U0FMb0IsZ0JBQWdCO0lBT3RDLENBQUMiLCJmaWxlIjoiVHlwZUhpbnRQcm92aWRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtUeXBlSGludH0gZnJvbSAnLi4vLi4vdHlwZS1oaW50LWludGVyZmFjZXMnO1xuXG5pbXBvcnQge3R5cGVIaW50RnJvbUVkaXRvcn0gZnJvbSAnLi9oYWNrJztcbmltcG9ydCB7dHJhY2tUaW1pbmd9IGZyb20gJy4uLy4uL2FuYWx5dGljcyc7XG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgVHlwZUhpbnRQcm92aWRlciB7XG5cbiAgQHRyYWNrVGltaW5nKCdoYWNrLnR5cGVIaW50JylcbiAgdHlwZUhpbnQoZWRpdG9yOiBhdG9tJFRleHRFZGl0b3IsIHBvc2l0aW9uOiBhdG9tJFBvaW50KTogUHJvbWlzZTw/VHlwZUhpbnQ+IHtcbiAgICByZXR1cm4gdHlwZUhpbnRGcm9tRWRpdG9yKGVkaXRvciwgcG9zaXRpb24pO1xuICB9XG5cbn07XG4iXX0=