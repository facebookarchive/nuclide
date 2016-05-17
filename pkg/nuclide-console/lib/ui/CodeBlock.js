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

var _nuclideUiLibAtomTextEditor2;

function _nuclideUiLibAtomTextEditor() {
  return _nuclideUiLibAtomTextEditor2 = require('../../../nuclide-ui/lib/AtomTextEditor');
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var CodeBlock = (function (_React$Component) {
  _inherits(CodeBlock, _React$Component);

  function CodeBlock(props) {
    _classCallCheck(this, CodeBlock);

    _get(Object.getPrototypeOf(CodeBlock.prototype), 'constructor', this).call(this, props);
    this._handleTextEditor = this._handleTextEditor.bind(this);
  }

  _createClass(CodeBlock, [{
    key: 'componentDidUpdate',
    value: function componentDidUpdate() {
      this._updateEditor();
    }
  }, {
    key: '_handleTextEditor',
    value: function _handleTextEditor(component) {
      if (component == null) {
        this._textEditor = null;
        return;
      }
      this._textEditor = component.getModel();
      this._updateEditor();
    }
  }, {
    key: '_updateEditor',
    value: function _updateEditor() {
      if (this._textEditor == null) {
        return;
      }
      this._textEditor.setText(this.props.text);
    }
  }, {
    key: 'render',
    value: function render() {
      var grammar = this.props.scopeName == null ? null : atom.grammars.grammarForScopeName(this.props.scopeName);
      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        { className: 'nuclide-console-text-editor-wrapper' },
        (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiLibAtomTextEditor2 || _nuclideUiLibAtomTextEditor()).AtomTextEditor, {
          ref: this._handleTextEditor,
          grammar: grammar,
          readOnly: true,
          gutterHidden: true,
          autoGrow: true,
          lineNumberGutterVisible: false
        })
      );
    }
  }]);

  return CodeBlock;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.default = CodeBlock;
module.exports = exports.default;