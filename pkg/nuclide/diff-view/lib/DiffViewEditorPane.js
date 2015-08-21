'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var React = require('react-for-atom');
var {PropTypes} = React;
var DiffViewEditor = require('./DiffViewEditor');

type HighlightedLines = {
  added: Array<number>;
  removed: Array<number>;
}

var DiffViewEditorPane = React.createClass({
  propTypes: {
    filePath: PropTypes.string.isRequired,
    offsets: PropTypes.objectOf(PropTypes.number).isRequired,
    highlightedLines: PropTypes.shape({
      added: PropTypes.arrayOf(PropTypes.number),
      removed: PropTypes.arrayOf(PropTypes.number),
    }).isRequired,
    textContent: PropTypes.string.isRequired,
    inlineElements: PropTypes.arrayOf(PropTypes.object).isRequired,
    handleNewOffsets: PropTypes.func.isRequired,
  },

  _diffViewEditor: ({}: Object),

  componentDidMount(): void {
    this._diffViewEditor = new DiffViewEditor(React.findDOMNode(this.refs['editor']));

    // The first version of the diff view will have both editors readonly.
    // But later on, the right editor will be editable and savable.
    this._diffViewEditor.setReadOnly();
    this._updateDiffView({}, this.props);
  },

  componentWillReceiveProps(nextProps: Object): void {
    this._updateDiffView(this.props, nextProps);
  },

  componentWillUnmount(): void {
    this._diffViewEditor = null;
  },

  shouldComponentUpdate(): boolean {
    return false;
  },

  render(): ReactElement {
    return (
      <atom-text-editor ref="editor" style={{height: '100%', overflow: 'hidden'}} />
    );
  },

  _updateDiffView(oldProps: Object, newProps: Object) {
    if (oldProps.textContent !== newProps.textContent) {
      this._setTextContent(newProps.textContent);
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
  },

  _setTextContent(text: string): void {
    this._diffViewEditor.setFileContents(this.props.filePath, text);
  },

  _setHighlightedLines(highlightedLines: HighlightedLines): void {
    this._diffViewEditor.setHighlightedLines(highlightedLines.added, highlightedLines.removed);
  },

  _setOffsets(offsets: { [key: string]: number }): void {
    this._diffViewEditor.setOffsets(offsets);
  },

  async _renderComponentsInline(elements: Array<Object>): Promise {
    var components = await this._diffViewEditor.renderInlineComponents(elements);
    if (!this.isMounted()) {
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
      if (!this.isMounted()) {
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
  },

  getEditorModel(): Object {
    return this._diffViewEditor.getModel();
  },

});

module.exports = DiffViewEditorPane;
