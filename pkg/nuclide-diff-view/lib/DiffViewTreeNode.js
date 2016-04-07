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

var _nuclideUiLibLazyTreeNode = require('../../nuclide-ui/lib/LazyTreeNode');

var _nuclideRemoteUri = require('../../nuclide-remote-uri');

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
      var fileName = (0, _nuclideRemoteUri.basename)(item.filePath);
      return this.isContainer() || !item.statusCode ? fileName : (_constants.FileChangeStatusToPrefix[item.statusCode] || '') + fileName;
    }
  }, {
    key: 'getKey',
    value: function getKey() {
      return this.getItem().filePath;
    }
  }]);

  return DiffViewTreeNode;
})(_nuclideUiLibLazyTreeNode.LazyTreeNode);

exports['default'] = DiffViewTreeNode;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRpZmZWaWV3VHJlZU5vZGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7d0NBVzJCLG1DQUFtQzs7Z0NBQ3ZDLDBCQUEwQjs7eUJBQ1YsYUFBYTs7SUFJL0IsZ0JBQWdCO1lBQWhCLGdCQUFnQjs7QUFFeEIsV0FGUSxnQkFBZ0IsQ0FHakMsS0FBaUIsRUFDakIsTUFBcUIsRUFDckIsV0FBb0IsRUFDcEIsYUFBOEMsRUFDOUM7MEJBUGlCLGdCQUFnQjs7QUFRakMsK0JBUmlCLGdCQUFnQiw2Q0FRM0IsS0FBSyxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUUsYUFBYSxFQUFFO0dBQ2xEOztlQVRrQixnQkFBZ0I7O1dBVzNCLG9CQUFXO0FBQ2pCLFVBQU0sSUFBZ0IsR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDeEMsVUFBTSxRQUFRLEdBQUcsZ0NBQVMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3pDLGFBQU8sQUFBQyxJQUFJLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxHQUMxQyxRQUFRLEdBQ1AsQ0FBQyxvQ0FBeUIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQSxHQUFJLFFBQVEsQUFBQyxDQUFDO0tBQ3BFOzs7V0FFSyxrQkFBVztBQUNmLGFBQU8sSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLFFBQVEsQ0FBQztLQUNoQzs7O1NBckJrQixnQkFBZ0I7OztxQkFBaEIsZ0JBQWdCIiwiZmlsZSI6IkRpZmZWaWV3VHJlZU5vZGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge0xhenlUcmVlTm9kZX0gZnJvbSAnLi4vLi4vbnVjbGlkZS11aS9saWIvTGF6eVRyZWVOb2RlJztcbmltcG9ydCB7YmFzZW5hbWV9IGZyb20gJy4uLy4uL251Y2xpZGUtcmVtb3RlLXVyaSc7XG5pbXBvcnQge0ZpbGVDaGFuZ2VTdGF0dXNUb1ByZWZpeH0gZnJvbSAnLi9jb25zdGFudHMnO1xuXG5pbXBvcnQgdHlwZSB7RmlsZUNoYW5nZX0gZnJvbSAnLi90eXBlcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERpZmZWaWV3VHJlZU5vZGUgZXh0ZW5kcyBMYXp5VHJlZU5vZGUge1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIGVudHJ5OiBGaWxlQ2hhbmdlLFxuICAgIHBhcmVudDogP0xhenlUcmVlTm9kZSxcbiAgICBpc0NvbnRhaW5lcjogYm9vbGVhbixcbiAgICBmZXRjaENoaWxkcmVuOiAobm9kZTogTGF6eVRyZWVOb2RlKSA9PiBQcm9taXNlXG4gICkge1xuICAgIHN1cGVyKGVudHJ5LCBwYXJlbnQsIGlzQ29udGFpbmVyLCBmZXRjaENoaWxkcmVuKTtcbiAgfVxuXG4gIGdldExhYmVsKCk6IHN0cmluZyB7XG4gICAgY29uc3QgaXRlbTogRmlsZUNoYW5nZSA9IHRoaXMuZ2V0SXRlbSgpO1xuICAgIGNvbnN0IGZpbGVOYW1lID0gYmFzZW5hbWUoaXRlbS5maWxlUGF0aCk7XG4gICAgcmV0dXJuICh0aGlzLmlzQ29udGFpbmVyKCkgfHwgIWl0ZW0uc3RhdHVzQ29kZSlcbiAgICAgID8gZmlsZU5hbWVcbiAgICAgIDogKChGaWxlQ2hhbmdlU3RhdHVzVG9QcmVmaXhbaXRlbS5zdGF0dXNDb2RlXSB8fCAnJykgKyBmaWxlTmFtZSk7XG4gIH1cblxuICBnZXRLZXkoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5nZXRJdGVtKCkuZmlsZVBhdGg7XG4gIH1cblxufVxuIl19