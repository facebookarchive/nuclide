Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _uiTree = require('../../ui/tree');

var _remoteUri = require('../../remote-uri');

var _constants = require('./constants');

var DiffViewTreeNode = (function (_LazyTreeNode) {
  _inherits(DiffViewTreeNode, _LazyTreeNode);

  function DiffViewTreeNode(entry, parent, isContainer, fetchChildren) {
    _classCallCheck(this, DiffViewTreeNode);

    _get(Object.getPrototypeOf(DiffViewTreeNode.prototype), 'constructor', this).call(this, entry, parent, isContainer, fetchChildren);
  }

  _createClass(DiffViewTreeNode, [{
    key: 'getLabel',
    value: function getLabel() {
      var item = this.getItem();
      var fileName = (0, _remoteUri.basename)(item.filePath);
      return this.isContainer() || !item.statusCode ? fileName : (_constants.FileChangeStatusToPrefix[item.statusCode] || '') + fileName;
    }
  }, {
    key: 'getKey',
    value: function getKey() {
      return this.getItem().filePath;
    }
  }]);

  return DiffViewTreeNode;
})(_uiTree.LazyTreeNode);

exports['default'] = DiffViewTreeNode;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRpZmZWaWV3VHJlZU5vZGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7c0JBVzJCLGVBQWU7O3lCQUNuQixrQkFBa0I7O3lCQUNGLGFBQWE7O0lBSS9CLGdCQUFnQjtZQUFoQixnQkFBZ0I7O0FBRXhCLFdBRlEsZ0JBQWdCLENBR2pDLEtBQWlCLEVBQ2pCLE1BQXlCLEVBQ3pCLFdBQW9CLEVBQ3BCLGFBQWtELEVBQ2xEOzBCQVBpQixnQkFBZ0I7O0FBUWpDLCtCQVJpQixnQkFBZ0IsNkNBUTNCLEtBQUssRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLGFBQWEsRUFBRTtHQUNsRDs7ZUFUa0IsZ0JBQWdCOztXQVczQixvQkFBVztBQUNqQixVQUFNLElBQWdCLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3hDLFVBQU0sUUFBUSxHQUFHLHlCQUFTLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUN6QyxhQUFPLEFBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsR0FDMUMsUUFBUSxHQUNQLENBQUMsb0NBQXlCLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUEsR0FBSSxRQUFRLEFBQUMsQ0FBQztLQUNwRTs7O1dBRUssa0JBQVc7QUFDZixhQUFPLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxRQUFRLENBQUM7S0FDaEM7OztTQXJCa0IsZ0JBQWdCOzs7cUJBQWhCLGdCQUFnQiIsImZpbGUiOiJEaWZmVmlld1RyZWVOb2RlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHtMYXp5VHJlZU5vZGV9IGZyb20gJy4uLy4uL3VpL3RyZWUnO1xuaW1wb3J0IHtiYXNlbmFtZX0gZnJvbSAnLi4vLi4vcmVtb3RlLXVyaSc7XG5pbXBvcnQge0ZpbGVDaGFuZ2VTdGF0dXNUb1ByZWZpeH0gZnJvbSAnLi9jb25zdGFudHMnO1xuXG5pbXBvcnQgdHlwZSB7RmlsZUNoYW5nZX0gZnJvbSAnLi90eXBlcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERpZmZWaWV3VHJlZU5vZGUgZXh0ZW5kcyBMYXp5VHJlZU5vZGUge1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIGVudHJ5OiBGaWxlQ2hhbmdlLFxuICAgIHBhcmVudDogP0RpZmZWaWV3VHJlZU5vZGUsXG4gICAgaXNDb250YWluZXI6IGJvb2xlYW4sXG4gICAgZmV0Y2hDaGlsZHJlbjogKG5vZGU6IERpZmZWaWV3VHJlZU5vZGUpID0+IFByb21pc2VcbiAgKSB7XG4gICAgc3VwZXIoZW50cnksIHBhcmVudCwgaXNDb250YWluZXIsIGZldGNoQ2hpbGRyZW4pO1xuICB9XG5cbiAgZ2V0TGFiZWwoKTogc3RyaW5nIHtcbiAgICBjb25zdCBpdGVtOiBGaWxlQ2hhbmdlID0gdGhpcy5nZXRJdGVtKCk7XG4gICAgY29uc3QgZmlsZU5hbWUgPSBiYXNlbmFtZShpdGVtLmZpbGVQYXRoKTtcbiAgICByZXR1cm4gKHRoaXMuaXNDb250YWluZXIoKSB8fCAhaXRlbS5zdGF0dXNDb2RlKVxuICAgICAgPyBmaWxlTmFtZVxuICAgICAgOiAoKEZpbGVDaGFuZ2VTdGF0dXNUb1ByZWZpeFtpdGVtLnN0YXR1c0NvZGVdIHx8ICcnKSArIGZpbGVOYW1lKTtcbiAgfVxuXG4gIGdldEtleSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLmdldEl0ZW0oKS5maWxlUGF0aDtcbiAgfVxuXG59XG4iXX0=