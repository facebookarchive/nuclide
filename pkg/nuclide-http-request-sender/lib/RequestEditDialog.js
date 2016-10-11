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

var _reactForAtom;

function _load_reactForAtom() {
  return _reactForAtom = require('react-for-atom');
}

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

var _nuclideUiDropdown;

function _load_nuclideUiDropdown() {
  return _nuclideUiDropdown = require('../../nuclide-ui/Dropdown');
}

var _nuclideUiAtomTextEditor;

function _load_nuclideUiAtomTextEditor() {
  return _nuclideUiAtomTextEditor = require('../../nuclide-ui/AtomTextEditor');
}

var _assert;

function _load_assert() {
  return _assert = _interopRequireDefault(require('assert'));
}

var _shallowequal;

function _load_shallowequal() {
  return _shallowequal = _interopRequireDefault(require('shallowequal'));
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

      return nextProps.uri !== uri || nextProps.method !== method || nextProps.body !== body || !(0, (_shallowequal || _load_shallowequal()).default)(nextProps.headers, headers);
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
      (0, (_assert || _load_assert()).default)(editorComponent != null);
      var editor = editorComponent.getModel();
      (0, (_assert || _load_assert()).default)(editor != null);
      var jsonGrammar = atom.grammars.grammarForScopeName('source.json');
      (0, (_assert || _load_assert()).default)(jsonGrammar != null);
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

      return (_reactForAtom || _load_reactForAtom()).React.createElement(
        'div',
        { className: 'block' },
        (_reactForAtom || _load_reactForAtom()).React.createElement(
          'div',
          { className: 'nuclide-edit-request-dialog' },
          (_reactForAtom || _load_reactForAtom()).React.createElement(
            'label',
            null,
            'URI: '
          ),
          (_reactForAtom || _load_reactForAtom()).React.createElement((_nuclideUiAtomInput || _load_nuclideUiAtomInput()).AtomInput, {
            tabIndex: '1',
            placeholderText: 'https://www.facebook.com',
            value: this.props.uri,
            onDidChange: function (uri) {
              return _this.props.actionCreators.updateState({ uri: uri });
            }
          }),
          (_reactForAtom || _load_reactForAtom()).React.createElement(
            'label',
            null,
            'Method: '
          ),
          (_reactForAtom || _load_reactForAtom()).React.createElement((_nuclideUiDropdown || _load_nuclideUiDropdown()).Dropdown, {
            value: this.props.method,
            options: METHOD_DROPDOWN_OPTIONS,
            onChange: function (method) {
              return _this.props.actionCreators.updateState({ method: method });
            }
          }),
          this.props.method !== 'POST' ? null : (_reactForAtom || _load_reactForAtom()).React.createElement(
            'div',
            null,
            (_reactForAtom || _load_reactForAtom()).React.createElement(
              'label',
              null,
              'Body'
            ),
            (_reactForAtom || _load_reactForAtom()).React.createElement((_nuclideUiAtomInput || _load_nuclideUiAtomInput()).AtomInput, {
              tabIndex: '2',
              onDidChange: function (body) {
                return _this.props.actionCreators.updateState({ body: body });
              }
            })
          ),
          (_reactForAtom || _load_reactForAtom()).React.createElement(
            'label',
            null,
            'Headers: '
          ),
          (_reactForAtom || _load_reactForAtom()).React.createElement(
            'div',
            { className: 'nuclide-http-request-sender-headers' },
            (_reactForAtom || _load_reactForAtom()).React.createElement((_nuclideUiAtomTextEditor || _load_nuclideUiAtomTextEditor()).AtomTextEditor, {
              ref: function (editorComponent) {
                _this._editorComponent = editorComponent;
              },
              tabIndex: '3',
              autoGrow: false,
              softWrapped: true,
              onDidTextBufferChange: this._handleTextBufferChange.bind(this)
            })
          ),
          (_reactForAtom || _load_reactForAtom()).React.createElement(
            (_nuclideUiButtonGroup || _load_nuclideUiButtonGroup()).ButtonGroup,
            { className: 'nuclide-http-request-sender-button-group' },
            (_reactForAtom || _load_reactForAtom()).React.createElement(
              (_nuclideUiButton || _load_nuclideUiButton()).Button,
              {
                buttonType: (_nuclideUiButton || _load_nuclideUiButton()).ButtonTypes.PRIMARY,
                tabIndex: '5',
                onClick: this._onSendHttpRequest },
              'Send HTTP Request'
            ),
            (_reactForAtom || _load_reactForAtom()).React.createElement(
              (_nuclideUiButton || _load_nuclideUiButton()).Button,
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
})((_reactForAtom || _load_reactForAtom()).React.Component);

exports.RequestEditDialog = RequestEditDialog;