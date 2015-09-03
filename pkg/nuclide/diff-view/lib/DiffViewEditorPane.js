'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {CompositeDisposable} = require('atom');
var React = require('react-for-atom');
var {PropTypes} = React;
var DiffViewEditor = require('./DiffViewEditor');

import type {HighlightedLines} from './types';

class DiffViewEditorPane extends React.Component {

  _diffViewEditor: ?DiffViewEditor;
  _subscriptions: ?CompositeDisposable;
  // TODO(most): move async code out of the view and deprecate the usage of `_isMounted`.
  // All view changes should be pushed from the model/store through subscriptions.
  _isMounted: boolean;

  constructor(props: Object) {
    super(props);
    this.state = {
      textContent: this.props.initialTextContent,
    };
    this._isMounted = false;
  }

  componentDidMount(): void {
    this._isMounted = true;
    this._subscriptions = new CompositeDisposable();
    var diffViewEditor = this._diffViewEditor = new DiffViewEditor(
      React.findDOMNode(this.refs['editor'])
    );
    if (this.props.readOnly) {
      diffViewEditor.setReadOnly();
    }
    var textEditor = this.getEditorModel();
    this._subscriptions.add(textEditor.onDidChange(() => {
      var newContents = textEditor.getText();
      this.setState({textContent: newContents});
      if (this.props.onChange) {
        this.props.onChange(newContents);
      }
    }));
    this._updateDiffView(this.props, this.state);
  }

  componentWillUnmount(): void {
    if (this._subscriptions) {
      this._subscriptions.dispose();
      this._subscriptions = null;
    }
    this._diffViewEditor = null;
    this._isMounted = false;
  }

  shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
    return false;
  }

  render(): ReactElement {
    return (
      <atom-text-editor ref="editor" style={{height: '100%', overflow: 'hidden'}} />
    );
  }

  componentWillReceiveProps(newProps: Object): void {
    var newState = this.state;
    if (newProps.initialTextContent !== this.state.textContent) {
      newState = {textContent: newProps.initialTextContent};
      this.setState(newState);
      this._setTextContent(newState.textContent);
    }
    this._updateDiffView(newProps, newState);
  }

  _updateDiffView(newProps: Object, newState: Object): void {
    var oldProps = this.props;
    if (oldProps.filePath !== newProps.filePath) {
      this._setTextContent(newState.textContent);
    }
    if (oldProps.highlightedLines !== newProps.highlightedLines) {
      this._setHighlightedLines(newProps.highlightedLines);
    }
    if (oldProps.offsets !== newProps.offsets) {
      this._setOffsets(newProps.offsets);
    }
    if (oldProps.inlineElements !== newProps.inlineElements) {
      this._renderComponentsInline(newProps.inlineElements);
    }
  }

  _setTextContent(text: string): void {
    this._diffViewEditor.setFileContents(this.props.filePath, text);
  }

  _setHighlightedLines(highlightedLines: HighlightedLines): void {
    this._diffViewEditor.setHighlightedLines(highlightedLines.added, highlightedLines.removed);
  }

  _setOffsets(offsets: { [key: string]: number }): void {
    this._diffViewEditor.setOffsets(offsets);
  }

  async _renderComponentsInline(elements: Array<Object>): Promise {
    var components = await this._diffViewEditor.renderInlineComponents(elements);
    if (!this._isMounted) {
      return;
    }

    this._diffViewEditor.attachInlineComponents(components);
    var offsetsFromComponents = new Map();

    // TODO(gendron):
    // The React components aren't actually rendered in the DOM until the
    // associated decorations are attached to the TextEditor.
    // (see DiffViewEditor.attachInlineComponents)
    // There's no easy way to listen for this event, so just wait 0.5s per component.
    setTimeout(() => {
      if (!this._isMounted) {
        return;
      }
      var editorWidth = React.findDOMNode(this.refs['editor']).clientWidth;
      components.forEach(element => {
        var domNode = React.findDOMNode(element.component);
        // get the height of the component after it has been rendered in the DOM
        var componentHeight = domNode.clientHeight;
        var lineHeight = this._diffViewEditor.getLineHeightInPixels();

        // TODO(gendron):
        // Set the width of the overlay so that it won't resize when we
        // type comment replies into the text editor.
        domNode.style.width = (editorWidth - 70) + 'px';

        // calculate the number of lines we need to insert in the buffer to make room
        // for the component to be displayed
        var offset = Math.ceil(componentHeight / lineHeight);
        var offsetRow = element.bufferRow;
        offsetsFromComponents.set(offsetRow, offset);

        // PhabricatorCommentsList is rendered with visibility: hidden.
        domNode.style.visibility = 'visible';
      });
      this.props.handleNewOffsets(offsetsFromComponents);
    }, components.length * 500);
  }

  getEditorModel(): Object {
    return this._diffViewEditor.getModel();
  }
}

DiffViewEditorPane.propTypes = {
  filePath: PropTypes.string.isRequired,
  offsets: PropTypes.objectOf(PropTypes.number).isRequired,
  highlightedLines: PropTypes.shape({
    added: PropTypes.arrayOf(PropTypes.number),
    removed: PropTypes.arrayOf(PropTypes.number),
  }).isRequired,
  initialTextContent: PropTypes.string.isRequired,
  inlineElements: PropTypes.arrayOf(PropTypes.object).isRequired,
  handleNewOffsets: PropTypes.func.isRequired,
  readOnly: PropTypes.bool.isRequired,
  onChange: PropTypes.func,
};

module.exports = DiffViewEditorPane;
