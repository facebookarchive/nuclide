'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DefinitionPreviewView = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _Button;

function _load_Button() {
  return _Button = require('../../nuclide-ui/Button');
}

var _Block;

function _load_Block() {
  return _Block = require('../../nuclide-ui/Block');
}

var _react = _interopRequireDefault(require('react'));

var _goToLocation;

function _load_goToLocation() {
  return _goToLocation = require('../../commons-atom/go-to-location');
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _AtomTextEditor;

function _load_AtomTextEditor() {
  return _AtomTextEditor = require('../../nuclide-ui/AtomTextEditor');
}

var _textEditor;

function _load_textEditor() {
  return _textEditor = require('../../commons-atom/text-editor');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('../../commons-atom/featureConfig'));
}

var _atom = require('atom');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

const MINIMUM_EDITOR_HEIGHT = 10;
const EDITOR_HEIGHT_DELTA = 10;

class DefinitionPreviewView extends _react.default.Component {

  constructor(props) {
    super(props);
    const buffer = props.definition != null ? (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).bufferForUri)(props.definition.path) : new _atom.TextBuffer();
    const heightSetting = (_featureConfig || _load_featureConfig()).default.get('nuclide-definition-preview.editorHeight');
    let height = 50;
    if (heightSetting != null) {
      height = heightSetting;
    }
    if (height < MINIMUM_EDITOR_HEIGHT) {
      height = MINIMUM_EDITOR_HEIGHT;
    }
    this.state = {
      buffer,
      oldBuffer: null,
      editorHeight: height
    };
    this._settingsChangeDisposable = (_featureConfig || _load_featureConfig()).default.observe('nuclide-definition-preview.editorHeight', newHeight => this._setEditorHeight(newHeight));

    this._openCurrentDefinitionInMainEditor = this._openCurrentDefinitionInMainEditor.bind(this);
    this._increaseEditorHeight = this._increaseEditorHeight.bind(this);
    this._decreaseEditorHeight = this._decreaseEditorHeight.bind(this);
  }

  componentWillReceiveProps(newProps) {
    if (newProps.definition != null) {
      const definition = newProps.definition;
      // The buffer always needs to point to the right file path, so create a new one with
      // the correct path if the new definition prop has a different path than the
      // currently loaded buffer.
      if (definition.path !== this.state.buffer.getPath()) {
        this.setState({ buffer: (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).bufferForUri)(definition.path), oldBuffer: this.state.buffer });
      }
    } else {
      // A null definition has no associated file path, so make a new TextBuffer()
      // that doesn't have an associated file path.
      const oldBuffer = this.state.buffer;
      this.setState({ buffer: new _atom.TextBuffer(), oldBuffer });
    }
  }

  // Loads the current buffer in state if it's not already loaded.
  _loadBuffer() {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (!_this.state.buffer.loaded) {
        yield _this.state.buffer.load();
      }
    })();
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.definition != null) {
      this._finishRendering(this.props.definition);
    }
  }

  componentWillUnmount() {
    this.state.buffer.destroy();
    if (this.state.oldBuffer != null) {
      this.state.oldBuffer.destroy();
    }
    this._settingsChangeDisposable.dispose();
  }

  _finishRendering(definition) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      yield _this2._loadBuffer();
      _this2._scrollToRow(definition.position.row);

      const editor = _this2.getEditor();
      editor.getDecorations().forEach(function (decoration) {
        return decoration.destroy();
      });

      if (!(_this2.props.definition != null)) {
        throw new Error('Invariant violation: "this.props.definition != null"');
      }

      const marker = editor.markBufferPosition(definition.position);
      editor.decorateMarker(marker, {
        type: 'line',
        class: 'nuclide-current-line-highlight'
      });
      if (_this2.state.oldBuffer != null) {
        // Only destroy oldBuffer if it's not already open in a tab - otherwise it'll
        // close the tab using oldBuffer
        if ((0, (_textEditor || _load_textEditor()).existingEditorForBuffer)(_this2.state.oldBuffer) == null) {
          if (!(_this2.state.oldBuffer != null)) {
            throw new Error('Invariant violation: "this.state.oldBuffer != null"');
          }

          _this2.state.oldBuffer.destroy();
        }
      }
    })();
  }

  render() {
    const { ContextViewMessage, definition } = this.props;
    const atMinHeight = this.state.editorHeight - EDITOR_HEIGHT_DELTA < MINIMUM_EDITOR_HEIGHT;
    // Show either a "No definition" message or the definition in an editors
    return definition == null ? _react.default.createElement(ContextViewMessage, { message: ContextViewMessage.NO_DEFINITION }) : _react.default.createElement(
      'div',
      { className: 'pane-item nuclide-definition-preview' },
      _react.default.createElement(
        'div',
        { className: 'nuclide-definition-preview-editor',
          style: { height: `${this.state.editorHeight}em` } },
        _react.default.createElement((_AtomTextEditor || _load_AtomTextEditor()).AtomTextEditor, {
          ref: 'editor',
          gutterHidden: true,
          lineNumberGutterVisible: false,
          path: definition.path
          // Should be readonly, but can't because we can only make buffers readonly,
          // We can't do readonly on editor granularity.
          , readOnly: false,
          textBuffer: this.state.buffer,
          syncTextContents: false
        }),
        _react.default.createElement(ButtonContainer, {
          _openCurrentDefinitionInMainEditor: this._openCurrentDefinitionInMainEditor,
          _increaseEditorHeight: this._increaseEditorHeight,
          _decreaseEditorHeight: this._decreaseEditorHeight,
          atMinHeight: atMinHeight
        })
      )
    );
  }

  _openCurrentDefinitionInMainEditor() {
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('nuclide-definition-preview:openInMainEditor');
    const def = this.props.definition;
    if (def != null) {
      (0, (_goToLocation || _load_goToLocation()).goToLocation)(def.path, def.position.row, def.position.column, true);
    }
  }

  // Sets the height of the definition preview editor only if it satisfies the minimum height
  _setEditorHeight(height) {
    if (height !== this.state.editorHeight && height >= MINIMUM_EDITOR_HEIGHT) {
      (_featureConfig || _load_featureConfig()).default.set('nuclide-definition-preview.editorHeight', height);
      this.setState({ editorHeight: height });
    }
  }

  _increaseEditorHeight() {
    this._setEditorHeight(this.state.editorHeight + EDITOR_HEIGHT_DELTA);
  }

  _decreaseEditorHeight() {
    this._setEditorHeight(this.state.editorHeight - EDITOR_HEIGHT_DELTA);
  }

  getEditor() {
    return this.refs.editor.getModel();
  }

  _scrollToRow(row) {
    this.getEditor().scrollToBufferPosition([row, 0], { center: true });
  }
}

exports.DefinitionPreviewView = DefinitionPreviewView;


const ButtonContainer = props => {
  return _react.default.createElement(
    (_Block || _load_Block()).Block,
    null,
    _react.default.createElement(
      'div',
      { className: 'nuclide-definition-preview-buttons' },
      _react.default.createElement(
        'div',
        { className: 'nuclide-definition-preview-buttons-left' },
        _react.default.createElement(
          'span',
          { style: { paddingRight: '1em' } },
          'Height:'
        ),
        _react.default.createElement(
          (_Button || _load_Button()).Button,
          { onClick: props._decreaseEditorHeight,
            size: (_Button || _load_Button()).ButtonSizes.SMALL,
            disabled: props.atMinHeight },
          '-'
        ),
        _react.default.createElement(
          (_Button || _load_Button()).Button,
          { onClick: props._increaseEditorHeight, size: (_Button || _load_Button()).ButtonSizes.SMALL },
          '+'
        )
      ),
      _react.default.createElement(
        'div',
        { className: 'nuclide-definition-preview-buttons-right' },
        _react.default.createElement(
          (_Button || _load_Button()).Button,
          { onClick: props._openCurrentDefinitionInMainEditor, size: (_Button || _load_Button()).ButtonSizes.SMALL },
          'Open in main editor'
        )
      )
    )
  );
};