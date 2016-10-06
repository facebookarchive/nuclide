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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _nuclideUiAtomInput2;

function _nuclideUiAtomInput() {
  return _nuclideUiAtomInput2 = require('../../nuclide-ui/AtomInput');
}

var _nuclideUiButton2;

function _nuclideUiButton() {
  return _nuclideUiButton2 = require('../../nuclide-ui/Button');
}

var _nuclideUiButtonGroup2;

function _nuclideUiButtonGroup() {
  return _nuclideUiButtonGroup2 = require('../../nuclide-ui/ButtonGroup');
}

var _nuclideUiDropdown2;

function _nuclideUiDropdown() {
  return _nuclideUiDropdown2 = require('../../nuclide-ui/Dropdown');
}

var _nuclideUiAtomTextEditor2;

function _nuclideUiAtomTextEditor() {
  return _nuclideUiAtomTextEditor2 = require('../../nuclide-ui/AtomTextEditor');
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _shallowequal2;

function _shallowequal() {
  return _shallowequal2 = _interopRequireDefault(require('shallowequal'));
}

var METHOD_DROPDOWN_OPTIONS = [{ label: 'GET', value: 'GET' }, { label: 'POST', value: 'POST' }];

var RequestEditDialog = (function (_React$Component) {
  _inherits(RequestEditDialog, _React$Component);

  function RequestEditDialog(props) {
    _classCallCheck(this, RequestEditDialog);

    _get(Object.getPrototypeOf(RequestEditDialog.prototype), 'constructor', this).call(this, props);
    this._editorComponent = null;
    this._onCancel = this._onCancel.bind(this);
    this._onSendHttpRequest = this._onSendHttpRequest.bind(this);
  }

  _createClass(RequestEditDialog, [{
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(nextProps) {
      var _props = this.props;
      var uri = _props.uri;
      var method = _props.method;
      var headers = _props.headers;
      var body = _props.body;

      return nextProps.uri !== uri || nextProps.method !== method || nextProps.body !== body || !(0, (_shallowequal2 || _shallowequal()).default)(nextProps.headers, headers);
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      this._componentDidRender();
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate() {
      this._componentDidRender();
    }

    /**
     * This method should be called after every render to set the AtomTextEditor text.
     */
  }, {
    key: '_componentDidRender',
    value: function _componentDidRender() {
      var editorComponent = this._editorComponent;
      (0, (_assert2 || _assert()).default)(editorComponent != null);
      var editor = editorComponent.getModel();
      (0, (_assert2 || _assert()).default)(editor != null);
      var jsonGrammar = atom.grammars.grammarForScopeName('source.json');
      (0, (_assert2 || _assert()).default)(jsonGrammar != null);
      editor.setGrammar(jsonGrammar);
      editor.setText(JSON.stringify(this.props.headers, null, 2));
    }
  }, {
    key: '_onSendHttpRequest',
    value: function _onSendHttpRequest() {
      this.props.actionCreators.sendHttpRequest();
      this._toggleDialog();
    }
  }, {
    key: '_onCancel',
    value: function _onCancel() {
      this._toggleDialog();
    }
  }, {
    key: '_toggleDialog',
    value: function _toggleDialog() {
      atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-http-request-sender:toggle-http-request-edit-dialog');
    }
  }, {
    key: '_handleTextBufferChange',
    value: function _handleTextBufferChange(event) {
      // TODO: It's better to store changes, even if they are illegal JSON.
      var headers = undefined;
      try {
        headers = JSON.parse(event.newText);
      } catch (_) {
        return; // Do not store illegal JSON.
      }
      this.props.actionCreators.updateState({ headers: headers });
    }
  }, {
    key: 'render',
    value: function render() {
      var _this = this;

      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        { className: 'block' },
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'div',
          { className: 'nuclide-edit-request-dialog' },
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'label',
            null,
            'URI: '
          ),
          (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiAtomInput2 || _nuclideUiAtomInput()).AtomInput, {
            tabIndex: '1',
            placeholderText: 'https://www.facebook.com',
            value: this.props.uri,
            onDidChange: function (uri) {
              return _this.props.actionCreators.updateState({ uri: uri });
            }
          }),
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'label',
            null,
            'Method: '
          ),
          (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiDropdown2 || _nuclideUiDropdown()).Dropdown, {
            value: this.props.method,
            options: METHOD_DROPDOWN_OPTIONS,
            onChange: function (method) {
              return _this.props.actionCreators.updateState({ method: method });
            }
          }),
          this.props.method !== 'POST' ? null : (_reactForAtom2 || _reactForAtom()).React.createElement(
            'div',
            null,
            (_reactForAtom2 || _reactForAtom()).React.createElement(
              'label',
              null,
              'Body'
            ),
            (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiAtomInput2 || _nuclideUiAtomInput()).AtomInput, {
              tabIndex: '2',
              onDidChange: function (body) {
                return _this.props.actionCreators.updateState({ body: body });
              }
            })
          ),
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'label',
            null,
            'Headers: '
          ),
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'div',
            { className: 'nuclide-http-request-sender-headers' },
            (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiAtomTextEditor2 || _nuclideUiAtomTextEditor()).AtomTextEditor, {
              ref: function (editorComponent) {
                _this._editorComponent = editorComponent;
              },
              tabIndex: '3',
              autoGrow: false,
              softWrapped: true,
              onDidTextBufferChange: this._handleTextBufferChange.bind(this)
            })
          ),
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            (_nuclideUiButtonGroup2 || _nuclideUiButtonGroup()).ButtonGroup,
            { className: 'nuclide-http-request-sender-button-group' },
            (_reactForAtom2 || _reactForAtom()).React.createElement(
              (_nuclideUiButton2 || _nuclideUiButton()).Button,
              {
                buttonType: (_nuclideUiButton2 || _nuclideUiButton()).ButtonTypes.PRIMARY,
                tabIndex: '5',
                onClick: this._onSendHttpRequest },
              'Send HTTP Request'
            ),
            (_reactForAtom2 || _reactForAtom()).React.createElement(
              (_nuclideUiButton2 || _nuclideUiButton()).Button,
              {
                tabIndex: '4',
                onClick: this._onCancel },
              'Cancel'
            )
          )
        )
      );
    }
  }]);

  return RequestEditDialog;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.RequestEditDialog = RequestEditDialog;