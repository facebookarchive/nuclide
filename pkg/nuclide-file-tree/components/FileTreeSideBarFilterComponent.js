var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _classnames2;

function _classnames() {
  return _classnames2 = _interopRequireDefault(require('classnames'));
}

var FileTreeSidebarFilterComponent = (function (_React$Component) {
  _inherits(FileTreeSidebarFilterComponent, _React$Component);

  function FileTreeSidebarFilterComponent() {
    _classCallCheck(this, FileTreeSidebarFilterComponent);

    _get(Object.getPrototypeOf(FileTreeSidebarFilterComponent.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(FileTreeSidebarFilterComponent, [{
    key: 'render',
    value: function render() {
      var _props = this.props;
      var filter = _props.filter;
      var found = _props.found;

      var classes = (0, (_classnames2 || _classnames()).default)({
        'nuclide-file-tree-filter': true,
        'show': Boolean(filter && filter.length),
        'not-found': !found
      });
      var text = 'search for: ' + filter;

      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        { className: classes },
        text
      );
    }
  }]);

  return FileTreeSidebarFilterComponent;
})((_reactForAtom2 || _reactForAtom()).React.Component);

module.exports = FileTreeSidebarFilterComponent;