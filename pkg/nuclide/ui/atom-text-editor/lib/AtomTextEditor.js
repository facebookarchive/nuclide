'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {
  CompositeDisposable,
  Disposable,
  TextBuffer,
  TextEditor,
} = require('atom');
var React = require('react-for-atom');
var ReadOnlyTextBuffer = require('./ReadOnlyTextBuffer');
var ReadOnlyTextEditor = require('./ReadOnlyTextEditor');

var {PropTypes} = React;

class AtomTextEditor extends React.Component {

  _textBuffer: TextBuffer;
  _textEditorModel: TextEditor;

  constructor(props: {[key: string]: mixed}) {
    super(props);

    var textBuffer = props.textBuffer;
    if (textBuffer) {
      this._textBuffer = textBuffer;
    } else {
      var TextBufferImpl = props.readOnly ? ReadOnlyTextBuffer : TextBuffer;
      this._textBuffer = textBuffer = new TextBufferImpl();
    }
    if (props.path) {
      this._textBuffer.setPath(props.path);
    }

    var TextEditorImpl = props.readOnly ? ReadOnlyTextEditor : TextEditor;
    var textEditorModel = new TextEditorImpl({
      buffer: textBuffer,
      lineNumberGutterVisible: !this.props.gutterHidden,
    });

    this._textEditorModel = textEditorModel;
  }

  componentDidMount() {
    var atomTextEditorElement = React.findDOMNode(this);
    atomTextEditorElement.setModel(this._textEditorModel);

    // HACK! This is a workaround for the ViewRegistry where Atom has a default view provider for
    // TextEditor (that we cannot override), which is responsible for creating the view associated
    // with the TextEditor that we create and adding a mapping for it in its private views map.
    // To workaround this, we reach into the internals of the ViewRegistry and update the entry in
    // the map manually. Filed as https://github.com/atom/atom/issues/7954.
    atom.views.views.set(this._textEditorModel, atomTextEditorElement);
  }

  componentWillReceiveProps(nextProps: Object) {
    if (nextProps.path !== this.props.path) {
      this._textBuffer.setPath(nextProps.path);
    }
    if (nextProps.gutterHidden !== this.props.gutterHidden) {
      this._textEditorModel.setLineNumberGutterVisible(nextProps.gutterHidden);
    }
  }

  componentWillUnmount() {
    this._textEditorModel.destroy();
  }

  getTextBuffer(): TextBuffer {
    return this._textBuffer;
  }

  getModel(): TextEditor {
    return this._textEditorModel;
  }

  render(): ReactElement {
    return (
      <atom-text-editor />
    );
  }

  // This component wraps the imperative API of `<atom-text-editor>`, and so React's rendering
  // should always pass because this subtree won't change.
  shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
    return false;
  }

}

AtomTextEditor.propTypes = {
  gutterHidden: PropTypes.bool.isRequired,
  path: PropTypes.string,
  readOnly: PropTypes.bool.isRequired,
  textBuffer: PropTypes.instanceOf(TextBuffer),
};

AtomTextEditor.defaultProps = {
  gutterHidden: false,
  lineNumberGutterVisible: true,
  readOnly: false,
};

module.exports = AtomTextEditor;
