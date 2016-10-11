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

var _nuclideUiAtomInput;

function _load_nuclideUiAtomInput() {
  return _nuclideUiAtomInput = require('../../nuclide-ui/AtomInput');
}

var _nuclideUiButton;

function _load_nuclideUiButton() {
  return _nuclideUiButton = require('../../nuclide-ui/Button');
}

var _nuclideUiButtonGroup;

function _load_nuclideUiButtonGroup() {
  return _nuclideUiButtonGroup = require('../../nuclide-ui/ButtonGroup');
}

var _atom;

function _load_atom() {
  return _atom = require('atom');
}

var _reactForAtom;

function _load_reactForAtom() {
  return _reactForAtom = require('react-for-atom');
}

var RenameBookmarkModal = (function (_React$Component) {
  _inherits(RenameBookmarkModal, _React$Component);

  function RenameBookmarkModal(props) {
    _classCallCheck(this, RenameBookmarkModal);

    _get(Object.getPrototypeOf(RenameBookmarkModal.prototype), 'constructor', this).call(this, props);
    this._disposables = new (_atom || _load_atom()).CompositeDisposable();
    this._handleRenameClick = this._handleRenameClick.bind(this);
  }

  _createClass(RenameBookmarkModal, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this._disposables.add(atom.commands.add((_reactForAtom || _load_reactForAtom()).ReactDOM.findDOMNode(this), 'core:confirm', this._handleRenameClick));
      this.refs.atomTextEditor.focus();
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this._disposables.dispose();
    }
  }, {
    key: '_handleRenameClick',
    value: function _handleRenameClick() {
      this.props.onRename(this.props.bookmark, this.refs.atomTextEditor.getText(), this.props.repository);
    }
  }, {
    key: 'render',
    value: function render() {
      return (_reactForAtom || _load_reactForAtom()).React.createElement(
        'div',
        null,
        (_reactForAtom || _load_reactForAtom()).React.createElement(
          'h6',
          { style: { marginTop: 0 } },
          (_reactForAtom || _load_reactForAtom()).React.createElement(
            'strong',
            null,
            'Rename bookmark'
          )
        ),
        (_reactForAtom || _load_reactForAtom()).React.createElement(
          'label',
          null,
          'New name for bookmark \'',
          this.props.bookmark.bookmark,
          '\':'
        ),
        (_reactForAtom || _load_reactForAtom()).React.createElement((_nuclideUiAtomInput || _load_nuclideUiAtomInput()).AtomInput, {
          initialValue: this.props.bookmark.bookmark,
          ref: 'atomTextEditor'
        }),
        (_reactForAtom || _load_reactForAtom()).React.createElement(
          'div',
          { style: { display: 'flex', flexDirection: 'row-reverse' } },
          (_reactForAtom || _load_reactForAtom()).React.createElement(
            (_nuclideUiButtonGroup || _load_nuclideUiButtonGroup()).ButtonGroup,
            { size: 'SMALL' },
            (_reactForAtom || _load_reactForAtom()).React.createElement(
              (_nuclideUiButton || _load_nuclideUiButton()).Button,
              { onClick: this.props.onCancel },
              'Cancel'
            ),
            (_reactForAtom || _load_reactForAtom()).React.createElement(
              (_nuclideUiButton || _load_nuclideUiButton()).Button,
              { buttonType: 'PRIMARY', onClick: this._handleRenameClick },
              'Rename'
            )
          )
        )
      );
    }
  }]);

  return RenameBookmarkModal;
})((_reactForAtom || _load_reactForAtom()).React.Component);

exports.default = RenameBookmarkModal;
module.exports = exports.default;