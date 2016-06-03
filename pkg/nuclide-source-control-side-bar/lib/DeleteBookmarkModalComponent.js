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

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var DeleteBookmarkModalComponent = (function (_React$Component) {
  _inherits(DeleteBookmarkModalComponent, _React$Component);

  function DeleteBookmarkModalComponent(props) {
    _classCallCheck(this, DeleteBookmarkModalComponent);

    _get(Object.getPrototypeOf(DeleteBookmarkModalComponent.prototype), 'constructor', this).call(this, props);
    this._handleDeleteClick = this._handleDeleteClick.bind(this);
  }

  _createClass(DeleteBookmarkModalComponent, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this.refs.cancelButton.focus();
    }
  }, {
    key: '_handleDeleteClick',
    value: function _handleDeleteClick() {
      this.props.onDelete(this.props.bookmark, this.props.repository);
    }
  }, {
    key: 'render',
    value: function render() {
      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        null,
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'h6',
          { style: { marginTop: 0 } },
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'strong',
            null,
            'Delete bookmark ',
            this.props.bookmark.bookmark,
            '?'
          )
        ),
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'div',
          { className: 'block' },
          'Are you sure you want to delete the bookmark ',
          this.props.bookmark.bookmark,
          '? This can not be undone.'
        ),
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'div',
          { className: 'text-right' },
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'div',
            { className: 'btn-group btn-group-sm' },
            (_reactForAtom2 || _reactForAtom()).React.createElement(
              'button',
              { className: 'btn', onClick: this.props.onCancel, ref: 'cancelButton' },
              'Cancel'
            ),
            (_reactForAtom2 || _reactForAtom()).React.createElement(
              'button',
              { className: 'btn btn-error', onClick: this._handleDeleteClick },
              'Delete'
            )
          )
        )
      );
    }
  }]);

  return DeleteBookmarkModalComponent;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.default = DeleteBookmarkModalComponent;
module.exports = exports.default;