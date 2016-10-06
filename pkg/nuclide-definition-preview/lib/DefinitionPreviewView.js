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

var _nuclideUiButton2;

function _nuclideUiButton() {
  return _nuclideUiButton2 = require('../../nuclide-ui/Button');
}

var _nuclideUiBlock2;

function _nuclideUiBlock() {
  return _nuclideUiBlock2 = require('../../nuclide-ui/Block');
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

var _nuclideUiAtomTextEditor2;

function _nuclideUiAtomTextEditor() {
  return _nuclideUiAtomTextEditor2 = require('../../nuclide-ui/AtomTextEditor');
}

var _commonsAtomTextEditor4;

function _commonsAtomTextEditor3() {
  return _commonsAtomTextEditor4 = require('../../commons-atom/text-editor');
}

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../nuclide-analytics');
}

var _commonsAtomFeatureConfig2;

function _commonsAtomFeatureConfig() {
  return _commonsAtomFeatureConfig2 = _interopRequireDefault(require('../../commons-atom/featureConfig'));
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var MINIMUM_EDITOR_HEIGHT = 10;
var EDITOR_HEIGHT_DELTA = 10;

// Height in ems to render the AtomTextEditor.

var DefinitionPreviewView = (function (_React$Component) {
  _inherits(DefinitionPreviewView, _React$Component);

  function DefinitionPreviewView(props) {
    var _this = this;

    _classCallCheck(this, DefinitionPreviewView);

    _get(Object.getPrototypeOf(DefinitionPreviewView.prototype), 'constructor', this).call(this, props);
    var buffer = props.definition != null ? (0, (_commonsAtomTextEditor2 || _commonsAtomTextEditor()).bufferForUri)(props.definition.path) : new (_atom2 || _atom()).TextBuffer();
    var heightSetting = (_commonsAtomFeatureConfig2 || _commonsAtomFeatureConfig()).default.get('nuclide-definition-preview.editorHeight');
    var height = 50;
    if (heightSetting != null) {
      height = heightSetting;
    }
    if (height < MINIMUM_EDITOR_HEIGHT) {
      height = MINIMUM_EDITOR_HEIGHT;
    }
    this.state = {
      buffer: buffer,
      oldBuffer: null,
      editorHeight: height
    };
    this._settingsChangeDisposable = (_commonsAtomFeatureConfig2 || _commonsAtomFeatureConfig()).default.observe('nuclide-definition-preview.editorHeight', function (newHeight) {
      return _this._setEditorHeight(newHeight);
    });

    this._openCurrentDefinitionInMainEditor = this._openCurrentDefinitionInMainEditor.bind(this);
    this._increaseEditorHeight = this._increaseEditorHeight.bind(this);
    this._decreaseEditorHeight = this._decreaseEditorHeight.bind(this);
  }

  _createClass(DefinitionPreviewView, [{
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(newProps) {
      if (newProps.definition != null) {
        var definition = newProps.definition;
        // The buffer always needs to point to the right file path, so create a new one with
        // the correct path if the new definition prop has a different path than the
        // currently loaded buffer.
        if (definition.path !== this.state.buffer.getPath()) {
          this.setState({ buffer: (0, (_commonsAtomTextEditor2 || _commonsAtomTextEditor()).bufferForUri)(definition.path), oldBuffer: this.state.buffer });
        }
      } else {
        // A null definition has no associated file path, so make a new TextBuffer()
        // that doesn't have an associated file path.
        var _oldBuffer = this.state.buffer;
        this.setState({ buffer: new (_atom2 || _atom()).TextBuffer(), oldBuffer: _oldBuffer });
      }
    }

    // Loads the current buffer in state if it's not already loaded.
  }, {
    key: '_loadBuffer',
    value: _asyncToGenerator(function* () {
      if (!this.state.buffer.loaded) {
        yield this.state.buffer.load();
      }
    })
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps, prevState) {
      if (this.props.definition != null) {
        this._finishRendering(this.props.definition);
      }
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this.state.buffer.destroy();
      if (this.state.oldBuffer != null) {
        this.state.oldBuffer.destroy();
      }
      this._settingsChangeDisposable.dispose();
    }
  }, {
    key: '_finishRendering',
    value: _asyncToGenerator(function* (definition) {
      yield this._loadBuffer();
      this._scrollToRow(definition.position.row);

      var editor = this.getEditor();
      editor.getDecorations().forEach(function (decoration) {
        return decoration.destroy();
      });
      (0, (_assert2 || _assert()).default)(this.props.definition != null);
      var marker = editor.markBufferPosition(definition.position);
      editor.decorateMarker(marker, {
        type: 'line',
        'class': 'nuclide-current-line-highlight'
      });
      if (this.state.oldBuffer != null) {
        // Only destroy oldBuffer if it's not already open in a tab - otherwise it'll
        // close the tab using oldBuffer
        if ((0, (_commonsAtomTextEditor4 || _commonsAtomTextEditor3()).existingEditorForBuffer)(this.state.oldBuffer) == null) {
          (0, (_assert2 || _assert()).default)(this.state.oldBuffer != null);
          this.state.oldBuffer.destroy();
        }
      }
    })
  }, {
    key: 'render',
    value: function render() {
      var _props = this.props;
      var ContextViewMessage = _props.ContextViewMessage;
      var definition = _props.definition;

      var atMinHeight = this.state.editorHeight - EDITOR_HEIGHT_DELTA < MINIMUM_EDITOR_HEIGHT;
      // Show either a "No definition" message or the definition in an editors
      return definition == null ? (_reactForAtom2 || _reactForAtom()).React.createElement(ContextViewMessage, { message: ContextViewMessage.NO_DEFINITION }) : (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        { className: 'pane-item nuclide-definition-preview' },
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'div',
          { className: 'nuclide-definition-preview-editor',
            style: { height: this.state.editorHeight + 'em' } },
          (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiAtomTextEditor2 || _nuclideUiAtomTextEditor()).AtomTextEditor, {
            ref: 'editor',
            gutterHidden: true,
            lineNumberGutterVisible: false,
            path: definition.path,
            readOnly: true,
            textBuffer: this.state.buffer,
            syncTextContents: false
          }),
          (_reactForAtom2 || _reactForAtom()).React.createElement(ButtonContainer, {
            _openCurrentDefinitionInMainEditor: this._openCurrentDefinitionInMainEditor,
            _increaseEditorHeight: this._increaseEditorHeight,
            _decreaseEditorHeight: this._decreaseEditorHeight,
            atMinHeight: atMinHeight
          })
        )
      );
    }
  }, {
    key: '_openCurrentDefinitionInMainEditor',
    value: function _openCurrentDefinitionInMainEditor() {
      (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)('nuclide-definition-preview:openInMainEditor');
      var def = this.props.definition;
      if (def != null) {
        (0, (_commonsAtomGoToLocation2 || _commonsAtomGoToLocation()).goToLocation)(def.path, def.position.row, def.position.column, true);
      }
    }

    // Sets the height of the definition preview editor only if it satisfies the minimum height
  }, {
    key: '_setEditorHeight',
    value: function _setEditorHeight(height) {
      if (height !== this.state.editorHeight && height >= MINIMUM_EDITOR_HEIGHT) {
        (_commonsAtomFeatureConfig2 || _commonsAtomFeatureConfig()).default.set('nuclide-definition-preview.editorHeight', height);
        this.setState({ editorHeight: height });
      }
    }
  }, {
    key: '_increaseEditorHeight',
    value: function _increaseEditorHeight() {
      this._setEditorHeight(this.state.editorHeight + EDITOR_HEIGHT_DELTA);
    }
  }, {
    key: '_decreaseEditorHeight',
    value: function _decreaseEditorHeight() {
      this._setEditorHeight(this.state.editorHeight - EDITOR_HEIGHT_DELTA);
    }
  }, {
    key: 'getEditor',
    value: function getEditor() {
      return this.refs.editor.getModel();
    }
  }, {
    key: '_scrollToRow',
    value: function _scrollToRow(row) {
      this.getEditor().scrollToBufferPosition([row, 0], { center: true });
    }
  }]);

  return DefinitionPreviewView;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.DefinitionPreviewView = DefinitionPreviewView;

var ButtonContainer = function ButtonContainer(props) {
  return (_reactForAtom2 || _reactForAtom()).React.createElement(
    (_nuclideUiBlock2 || _nuclideUiBlock()).Block,
    null,
    (_reactForAtom2 || _reactForAtom()).React.createElement(
      'div',
      { className: 'nuclide-definition-preview-buttons' },
      (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        { className: 'nuclide-definition-preview-buttons-left' },
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'span',
          { style: { paddingRight: '1em' } },
          'Height:'
        ),
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          (_nuclideUiButton2 || _nuclideUiButton()).Button,
          { onClick: props._decreaseEditorHeight,
            size: (_nuclideUiButton2 || _nuclideUiButton()).ButtonSizes.SMALL,
            disabled: props.atMinHeight },
          '-'
        ),
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          (_nuclideUiButton2 || _nuclideUiButton()).Button,
          { onClick: props._increaseEditorHeight, size: (_nuclideUiButton2 || _nuclideUiButton()).ButtonSizes.SMALL },
          '+'
        )
      ),
      (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        { className: 'nuclide-definition-preview-buttons-right' },
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          (_nuclideUiButton2 || _nuclideUiButton()).Button,
          { onClick: props._openCurrentDefinitionInMainEditor, size: (_nuclideUiButton2 || _nuclideUiButton()).ButtonSizes.SMALL },
          'Open in main editor'
        )
      )
    )
  );
};