'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {CompositeDisposable, Disposable} = require('atom');
var React = require('react-for-atom');

/**
 * We need to create this custom HTML element so we can hook into the view
 * registry. The overlay decoration only works through the view registry.
 */
class SuggestionListElement extends HTMLElement {
  initialize(model) {
    if (!model) {
      return;
    }
    this._model = model;
    return this;
  }

  attachedCallback() {
    React.render(<SuggestionList suggestionList={this._model} />, this);
  }

  dispose() {
    React.unmountComponentAtNode(this);
    if (this.parentNode) {
      this.parentNode.removeChild(this);
    }
  }
}

var SuggestionList = React.createClass({
  _subscriptions: undefined,

  propTypes: {
    suggestionList: React.PropTypes.object,
  },

  getInitialState() {
    return {
      selectedIndex: 0,
      items: [],
    };
  },

  componentWillMount() {
    this._items = this.props.suggestionList.getSuggestion().callback;
    this._textEditor = this.props.suggestionList.getTextEditor();
  },

  componentDidMount() {
    this._subscriptions = new CompositeDisposable();

    var textEditorView = atom.views.getView(this._textEditor);
    this._subscriptions.add(
        atom.commands.add(textEditorView, {
          'core:move-up': this._moveSelectionUp,
          'core:move-down': this._moveSelectionDown,
          'core:move-to-top': this._moveSelectionToTop,
          'core:move-to-bottom': this._moveSelectionToBottom,
          'core:cancel': this._close,
          'editor:newline': this._confirm,
        }));

    this._subscriptions.add(this._textEditor.onDidChange(this._close));
    this._subscriptions.add(this._textEditor.onDidChangeCursorPosition(this._close));

    // Prevent scrolling the editor when scrolling the suggestion list.
    var stopPropagation = (event) => event.stopPropagation();
    React.findDOMNode(this.refs['scroller']).addEventListener('mousewheel', stopPropagation);
    this._subscriptions.add(new Disposable(() => {
      React.findDOMNode(this.refs['scroller']).removeEventListener('mousewheel', stopPropagation);
    }));

    var keydown = (event) => {
      // If the user presses the enter key, confirm the selection.
      if (event.keyCode === 13) {
        event.stopImmediatePropagation();
        this._confirm();
      }
    }
    textEditorView.addEventListener('keydown', keydown);
    this._subscriptions.add(new Disposable(() => {
      textEditorView.removeEventListener('keydown', keydown);
    }));
  },

  render() {
    var itemComponents = this._items.map((item, index) => {
      var className = 'hyperclick-result-item';
      if (index === this.state.selectedIndex) {
        className += ' selected';
      }
      return (
        <li className={className}
            key={index}
            onMouseDown={this._confirm}
            onMouseEnter={this._setSelectedIndex.bind(this, index)}>
          {item.title}
        </li>
      );
    });

    return (
      <div className='popover-list select-list hyperclick-suggestion-list-scroller' ref='scroller'>
        <ol className='list-group' ref='selectionList'>
          {itemComponents}
        </ol>
      </div>
    );
  },

  componentDidUpdate(prevProps: mixed, prevState: mixed) {
    if (prevState.selectedIndex !== this.state.selectedIndex) {
      this._updateScrollPosition();
    }
  },

  componentWillUnmount() {
    this._subscriptions.dispose();
  },

  _confirm() {
    this._items[this.state.selectedIndex].callback();
    this._close();
  },

  _close() {
    this.props.suggestionList.hide();
  },

  _setSelectedIndex(index: number) {
    this.setState({
      selectedIndex: index,
    });
  },

  _moveSelectionDown(event) {
    if (this.state.selectedIndex < this._items.length - 1) {
      this.setState({selectedIndex: this.state.selectedIndex + 1});
    } else {
      this._moveSelectionToTop();
    }
    if (event) {
      event.stopImmediatePropagation();
    }
  },

  _moveSelectionUp(event) {
    if (this.state.selectedIndex > 0) {
      this.setState({selectedIndex: this.state.selectedIndex - 1});
    } else {
      this._moveSelectionToBottom();
    }
    if (event) {
      event.stopImmediatePropagation();
    }
  },

  _moveSelectionToBottom(event) {
    this.setState({selectedIndex: Math.max(this._items.length - 1, 0)});
    if (event) {
      event.stopImmediatePropagation();
    }
  },

  _moveSelectionToTop(event) {
    this.setState({selectedIndex: 0});
    if (event) {
      event.stopImmediatePropagation();
    }
  },

  _updateScrollPosition() {
    var listNode = React.findDOMNode(this.refs['selectionList']);
    var selectedNode = listNode.getElementsByClassName('selected')[0];
    selectedNode.scrollIntoViewIfNeeded(false);
  },
});

module.exports = SuggestionListElement = document.registerElement('hyperclick-suggestion-list', {prototype: SuggestionListElement.prototype});
