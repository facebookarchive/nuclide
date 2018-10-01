"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DefinitionPreviewView = void 0;

function _Button() {
  const data = require("../../../modules/nuclide-commons-ui/Button");

  _Button = function () {
    return data;
  };

  return data;
}

function _Block() {
  const data = require("../../../modules/nuclide-commons-ui/Block");

  _Block = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

function _goToLocation() {
  const data = require("../../../modules/nuclide-commons-atom/go-to-location");

  _goToLocation = function () {
    return data;
  };

  return data;
}

function _nullthrows() {
  const data = _interopRequireDefault(require("nullthrows"));

  _nullthrows = function () {
    return data;
  };

  return data;
}

function _nuclideRemoteConnection() {
  const data = require("../../nuclide-remote-connection");

  _nuclideRemoteConnection = function () {
    return data;
  };

  return data;
}

function _AtomTextEditor() {
  const data = require("../../../modules/nuclide-commons-ui/AtomTextEditor");

  _AtomTextEditor = function () {
    return data;
  };

  return data;
}

function _analytics() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/analytics"));

  _analytics = function () {
    return data;
  };

  return data;
}

function _featureConfig() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/feature-config"));

  _featureConfig = function () {
    return data;
  };

  return data;
}

var _atom = require("atom");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */
const MINIMUM_EDITOR_HEIGHT = 10;
const EDITOR_HEIGHT_DELTA = 10;

class DefinitionPreviewView extends React.Component {
  constructor(props) {
    super(props);

    this._openCurrentDefinitionInMainEditor = () => {
      _analytics().default.track('nuclide-definition-preview:openInMainEditor');

      const def = this.props.definition;

      if (def != null) {
        (0, _goToLocation().goToLocation)(def.path, {
          line: def.position.row,
          column: def.position.column,
          center: true
        });
      }
    };

    this._increaseEditorHeight = () => {
      this._setEditorHeight(this.state.editorHeight + EDITOR_HEIGHT_DELTA);
    };

    this._decreaseEditorHeight = () => {
      this._setEditorHeight(this.state.editorHeight - EDITOR_HEIGHT_DELTA);
    };

    const buffer = props.definition != null ? (0, _nuclideRemoteConnection().bufferForUri)(props.definition.path) : new _atom.TextBuffer();

    const heightSetting = _featureConfig().default.get('nuclide-definition-preview.editorHeight');

    let height = 50;

    if (heightSetting != null) {
      height = heightSetting;
    }

    if (height < MINIMUM_EDITOR_HEIGHT) {
      height = MINIMUM_EDITOR_HEIGHT;
    }

    this.state = {
      buffer,
      editorHeight: height
    };
    this._settingsChangeDisposable = _featureConfig().default.observe('nuclide-definition-preview.editorHeight', newHeight => this._setEditorHeight(newHeight));
  }

  UNSAFE_componentWillReceiveProps(newProps) {
    if (newProps.definition != null) {
      const definition = newProps.definition; // The buffer always needs to point to the right file path, so create a new one with
      // the correct path if the new definition prop has a different path than the
      // currently loaded buffer.

      if (definition.path !== this.state.buffer.getPath()) {
        this.setState({
          buffer: (0, _nuclideRemoteConnection().bufferForUri)(definition.path)
        });
      }
    } else {
      // A null definition has no associated file path, so make a new TextBuffer()
      // that doesn't have an associated file path.
      this.setState({
        buffer: new _atom.TextBuffer()
      });
    }
  } // Loads the current buffer in state if it's not already loaded.


  async _loadBuffer() {
    if (!this.state.buffer.loaded) {
      await this.state.buffer.load();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.definition != null) {
      this._finishRendering(this.props.definition);
    }
  }

  componentWillUnmount() {
    this._settingsChangeDisposable.dispose();
  }

  async _finishRendering(definition) {
    await this._loadBuffer();

    this._scrollToRow(definition.position.row);

    const editor = this.getEditor();
    editor.getDecorations().forEach(decoration => decoration.destroy());

    if (!(this.props.definition != null)) {
      throw new Error("Invariant violation: \"this.props.definition != null\"");
    }

    const marker = editor.markBufferPosition(definition.position);
    editor.decorateMarker(marker, {
      type: 'line',
      class: 'debugger-current-line-highlight'
    });
  }

  render() {
    const {
      ContextViewMessage,
      definition
    } = this.props;
    const atMinHeight = this.state.editorHeight - EDITOR_HEIGHT_DELTA < MINIMUM_EDITOR_HEIGHT; // Show either a "No definition" message or the definition in an editors

    return definition == null ? React.createElement(ContextViewMessage, {
      message: ContextViewMessage.NO_DEFINITION
    }) : React.createElement("div", {
      className: "pane-item nuclide-definition-preview"
    }, React.createElement("div", {
      className: "nuclide-definition-preview-editor",
      style: {
        height: `${this.state.editorHeight}em`
      }
    }, React.createElement(_AtomTextEditor().AtomTextEditor, {
      ref: editor => {
        this._editor = editor;
      },
      gutterHidden: true,
      lineNumberGutterVisible: false,
      path: definition.path // Should be readonly, but can't because we can only make buffers readonly,
      // We can't do readonly on editor granularity.
      ,
      readOnly: false,
      textBuffer: this.state.buffer,
      syncTextContents: false
    }), React.createElement(ButtonContainer, {
      _openCurrentDefinitionInMainEditor: this._openCurrentDefinitionInMainEditor,
      _increaseEditorHeight: this._increaseEditorHeight,
      _decreaseEditorHeight: this._decreaseEditorHeight,
      atMinHeight: atMinHeight
    })));
  }

  // Sets the height of the definition preview editor only if it satisfies the minimum height
  _setEditorHeight(height) {
    if (height !== this.state.editorHeight && height >= MINIMUM_EDITOR_HEIGHT) {
      _featureConfig().default.set('nuclide-definition-preview.editorHeight', height);

      this.setState({
        editorHeight: height
      });
    }
  }

  getEditor() {
    return (0, _nullthrows().default)(this._editor).getModel();
  }

  _scrollToRow(row) {
    this.getEditor().scrollToBufferPosition([row, 0], {
      center: true
    });
  }

}

exports.DefinitionPreviewView = DefinitionPreviewView;

const ButtonContainer = props => {
  return React.createElement(_Block().Block, null, React.createElement("div", {
    className: "nuclide-definition-preview-buttons"
  }, React.createElement("div", {
    className: "nuclide-definition-preview-buttons-left"
  }, React.createElement("span", {
    style: {
      paddingRight: '1em'
    }
  }, "Height:"), React.createElement(_Button().Button, {
    onClick: props._decreaseEditorHeight,
    size: _Button().ButtonSizes.SMALL,
    disabled: props.atMinHeight
  }, "-"), React.createElement(_Button().Button, {
    onClick: props._increaseEditorHeight,
    size: _Button().ButtonSizes.SMALL
  }, "+")), React.createElement("div", {
    className: "nuclide-definition-preview-buttons-right"
  }, React.createElement(_Button().Button, {
    onClick: props._openCurrentDefinitionInMainEditor,
    size: _Button().ButtonSizes.SMALL
  }, "Open in main editor"))));
};