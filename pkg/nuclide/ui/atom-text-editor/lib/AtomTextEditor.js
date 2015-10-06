'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {TextBuffer, TextEditor} = require('atom');
var React = require('react-for-atom');
var ReadOnlyTextEditor = require('./ReadOnlyTextEditor');

var {PropTypes} = React;

class AtomTextEditor extends React.Component {

  _textBuffer: TextBuffer;
  _textEditorModel: TextEditor;

  // $FlowIssue t8486988
  static propTypes = {
    gutterHidden: PropTypes.bool.isRequired,
    path: PropTypes.string,
    readOnly: PropTypes.bool.isRequired,
    textBuffer: PropTypes.instanceOf(TextBuffer),
  };

  // $FlowIssue t8486988
  static defaultProps = {
    gutterHidden: false,
    lineNumberGutterVisible: true,
    readOnly: false,
  };

  constructor(props: Object) {
    super(props);

    this._textBuffer = props.textBuffer || new TextBuffer();
    if (props.path) {
      this._textBuffer.setPath(props.path);
    }

    var TextEditorImpl = props.readOnly ? ReadOnlyTextEditor : TextEditor;
    var textEditorModel = new TextEditorImpl({
      buffer: this._textBuffer,
      lineNumberGutterVisible: !this.props.gutterHidden,
    });

    this._textEditorModel = textEditorModel;
  }

  componentDidMount(): void {
    var atomTextEditorElement = React.findDOMNode(this);
    atomTextEditorElement.setModel(this._textEditorModel);

    // HACK! This is a workaround for the ViewRegistry where Atom has a default view provider for
    // TextEditor (that we cannot override), which is responsible for creating the view associated
    // with the TextEditor that we create and adding a mapping for it in its private views map.
    // To workaround this, we reach into the internals of the ViewRegistry and update the entry in
    // the map manually. Filed as https://github.com/atom/atom/issues/7954.
    // $FlowFixMe
    atom.views.views.set(this._textEditorModel, atomTextEditorElement);
  }

  componentWillReceiveProps(nextProps: Object): void {
    if (nextProps.path !== this.props.path) {
      this._textBuffer.setPath(nextProps.path);
    }
    if (nextProps.gutterHidden !== this.props.gutterHidden) {
      this._textEditorModel.setLineNumberGutterVisible(nextProps.gutterHidden);
    }
  }

  componentWillUnmount(): void {
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

module.exports = AtomTextEditor;
