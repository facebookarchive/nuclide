Object.defineProperty(exports, '__esModule', {
  value: true
});

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

var _classnames2;

function _classnames() {
  return _classnames2 = _interopRequireDefault(require('classnames'));
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _nuclideUiLibAtomInput2;

function _nuclideUiLibAtomInput() {
  return _nuclideUiLibAtomInput2 = require('../../nuclide-ui/lib/AtomInput');
}

var _nuclideUiLibButton2;

function _nuclideUiLibButton() {
  return _nuclideUiLibButton2 = require('../../nuclide-ui/lib/Button');
}

var WorkingSetNameAndSaveComponent = (function (_React$Component) {
  _inherits(WorkingSetNameAndSaveComponent, _React$Component);

  function WorkingSetNameAndSaveComponent(props) {
    _classCallCheck(this, WorkingSetNameAndSaveComponent);

    _get(Object.getPrototypeOf(WorkingSetNameAndSaveComponent.prototype), 'constructor', this).call(this, props);

    this.state = {
      name: props.initialName
    };

    this._trackName = this._trackName.bind(this);
    this._saveWorkingSet = this._saveWorkingSet.bind(this);
  }

  _createClass(WorkingSetNameAndSaveComponent, [{
    key: 'componentDidMount',
    value: function componentDidMount() {}
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {}
  }, {
    key: 'render',
    value: function render() {
      var setNameText = undefined;
      if (this.state.name === '') {
        setNameText = (_reactForAtom2 || _reactForAtom()).React.createElement(
          'atom-panel',
          { 'class': 'nuclide-file-tree-working-set-name-missing' },
          'Name is missing'
        );
      }

      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        null,
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'div',
          { className: 'nuclide-file-tree-working-set-name-outline' },
          (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiLibAtomInput2 || _nuclideUiLibAtomInput()).AtomInput, {
            placeholderText: 'name',
            size: 'sm',
            className: 'nuclide-file-tree-working-set-name inline-block-tight',
            onDidChange: this._trackName,
            initialValue: this.props.initialName,
            onConfirm: this._saveWorkingSet,
            onCancel: this.props.onCancel
          })
        ),
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          (_nuclideUiLibButton2 || _nuclideUiLibButton()).Button,
          {
            buttonType: (_nuclideUiLibButton2 || _nuclideUiLibButton()).ButtonTypes.SUCCESS,
            className: (0, (_classnames2 || _classnames()).default)({
              'inline-block-tight': true,
              'disabled': this.state.name === '',
              'nuclide-file-tree-toolbar-icon': true
            }),
            onClick: this._saveWorkingSet },
          (_reactForAtom2 || _reactForAtom()).React.createElement('span', { className: 'icon icon-check nuclide-file-tree-toolbar-icon' })
        ),
        setNameText
      );
    }
  }, {
    key: '_trackName',
    value: function _trackName(text) {
      this.setState({ name: text });
    }
  }, {
    key: '_saveWorkingSet',
    value: function _saveWorkingSet() {
      if (this.state.name === '') {
        atom.notifications.addWarning('Name is missing', { detail: 'Please provide a name for the Working Set' });
        return;
      }

      if (this.props.isEditing) {
        this.props.onUpdate(this.props.initialName, this.state.name);
      } else {
        this.props.onSave(this.state.name);
      }
    }
  }]);

  return WorkingSetNameAndSaveComponent;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.WorkingSetNameAndSaveComponent = WorkingSetNameAndSaveComponent;