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

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _nuclideUiLibButton2;

function _nuclideUiLibButton() {
  return _nuclideUiLibButton2 = require('../../nuclide-ui/lib/Button');
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _commonsAtomGoToLocation2;

function _commonsAtomGoToLocation() {
  return _commonsAtomGoToLocation2 = require('../../commons-atom/go-to-location');
}

var _commonsAtomTextEditor2;

function _commonsAtomTextEditor() {
  return _commonsAtomTextEditor2 = require('../../commons-atom/text-editor');
}

var _nuclideUiLibAtomTextEditor2;

function _nuclideUiLibAtomTextEditor() {
  return _nuclideUiLibAtomTextEditor2 = require('../../nuclide-ui/lib/AtomTextEditor');
}

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../nuclide-analytics');
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var DefinitionPreviewView = (function (_React$Component) {
  _inherits(DefinitionPreviewView, _React$Component);

  function DefinitionPreviewView(props) {
    _classCallCheck(this, DefinitionPreviewView);

    _get(Object.getPrototypeOf(DefinitionPreviewView.prototype), 'constructor', this).call(this, props);
    this._loadAndScroll = null;
    this._openInMainEditor = this._openInMainEditor.bind(this);
  }

  _createClass(DefinitionPreviewView, [{
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(newProps) {
      this._loadAndScroll = null;
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate() {
      // Kick this off after we have the editor rendered.
      if (this._loadAndScroll != null) {
        this._loadAndScroll();
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var _props = this.props;
      var ContextViewMessage = _props.ContextViewMessage;
      var definition = _props.definition;

      // Show either the definition in an editor or a message
      if (definition != null) {
        return (_reactForAtom2 || _reactForAtom()).React.createElement(
          'div',
          { className: 'pane-item nuclide-definition-preview' },
          this._previewDefinition(definition)
        );
      } else {
        return (_reactForAtom2 || _reactForAtom()).React.createElement(ContextViewMessage, { message: ContextViewMessage.NO_DEFINITION });
      }
    }
  }, {
    key: '_previewDefinition',
    value: function _previewDefinition(definition) {
      var _this = this;

      this._loadAndScroll = null;

      var path = definition.path;
      var textBuffer = (0, (_commonsAtomTextEditor2 || _commonsAtomTextEditor()).bufferForUri)(path);
      var loadAndScroll = _asyncToGenerator(function* () {
        if (_this._loadAndScroll !== loadAndScroll) {
          return;
        }

        if (!textBuffer.loaded) {
          // TODO: figure out what to do if loading fails
          // TODO(peterhal): Can we use TextBuffer.onDidReload here?
          yield textBuffer.load();
          if (_this._loadAndScroll !== loadAndScroll) {
            return;
          }
        }

        // Scroll after loading is complete.
        // TODO(peterhal): Add an initial scroll position property to AtomTextEditor
        setTimeout(function () {
          if (_this._loadAndScroll !== loadAndScroll) {
            return;
          }
          if (_this.props.definition != null) {
            var editor = _this.getEditor();
            editor.getDecorations().forEach(function (decoration) {
              return decoration.destroy();
            });
            (0, (_assert2 || _assert()).default)(_this.props.definition != null);
            var marker = editor.markBufferPosition(_this.props.definition.position);
            editor.decorateMarker(marker, {
              type: 'line',
              'class': 'nuclide-current-line-highlight'
            });
          }
          _this._scrollToRow(definition.position.row);
          _this._loadAndScroll = null;
        }, 50);
      });
      // Defer loading and scrolling until after rendering.
      this._loadAndScroll = loadAndScroll;

      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        { className: 'nuclide-definition-preview-editor' },
        (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiLibAtomTextEditor2 || _nuclideUiLibAtomTextEditor()).AtomTextEditor, {
          ref: 'editor',
          gutterHidden: true,
          lineNumberGutterVisible: false,
          path: path,
          readOnly: true,
          textBuffer: textBuffer,
          syncTextContents: false
        }),
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'div',
          { className: 'nuclide-definition-preview-button-container' },
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            (_nuclideUiLibButton2 || _nuclideUiLibButton()).Button,
            { onClick: this._openInMainEditor, size: (_nuclideUiLibButton2 || _nuclideUiLibButton()).ButtonSizes.SMALL },
            'Open in main editor'
          )
        )
      );
    }
  }, {
    key: '_openInMainEditor',
    value: function _openInMainEditor() {
      (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)('nuclide-definition-preview:openInMainEditor');
      var def = this.props.definition;
      if (def != null) {
        (0, (_commonsAtomGoToLocation2 || _commonsAtomGoToLocation()).goToLocation)(def.path, def.position.row, def.position.column, true);
      }
    }
  }, {
    key: 'getEditor',
    value: function getEditor() {
      return this.refs.editor.getModel();
    }
  }, {
    key: '_scrollToRow',
    value: function _scrollToRow(row) {
      // TODO: Don't scroll to a center - scroll to top of buffer.
      this.getEditor().scrollToBufferPosition([row, 0], { center: true });
    }
  }]);

  return DefinitionPreviewView;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.DefinitionPreviewView = DefinitionPreviewView;