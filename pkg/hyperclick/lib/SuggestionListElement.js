'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _atom = require('atom');

var _reactForAtom = require('react-for-atom');

/**
 * We need to create this custom HTML element so we can hook into the view
 * registry. The overlay decoration only works through the view registry.
 */
let SuggestionListElement = class SuggestionListElement extends HTMLElement {

  initialize(model) {
    this._model = model;
    return this;
  }

  attachedCallback() {
    _reactForAtom.ReactDOM.render(_reactForAtom.React.createElement(SuggestionList, { suggestionList: this._model }), this);
  }

  detachedCallback() {
    _reactForAtom.ReactDOM.unmountComponentAtNode(this);
  }

  dispose() {
    if (this.parentNode) {
      this.parentNode.removeChild(this);
    }
  }
};
let SuggestionList = class SuggestionList extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this.state = {
      selectedIndex: 0
    };
    this._subscriptions = new _atom.CompositeDisposable();
    this._boundConfirm = this._confirm.bind(this);
  }

  componentWillMount() {
    const suggestionList = this.props.suggestionList;

    const suggestion = suggestionList.getSuggestion();
    // TODO(nmote): This is assuming `suggestion.callback` is always an Array, which is not true
    //   according to hyperclick/lib/types. It can also be a function.

    if (!(suggestion != null && Array.isArray(suggestion.callback))) {
      throw new Error('Invariant violation: "suggestion != null && Array.isArray(suggestion.callback)"');
    }

    this._items = suggestion.callback;
    this._textEditor = suggestionList.getTextEditor();
  }

  componentDidMount() {
    const textEditor = this._textEditor;

    if (!textEditor) {
      throw new Error('Invariant violation: "textEditor"');
    }

    const textEditorView = atom.views.getView(textEditor);
    const boundClose = this._close.bind(this);
    this._subscriptions.add(atom.commands.add(textEditorView, {
      'core:move-up': this._moveSelectionUp.bind(this),
      'core:move-down': this._moveSelectionDown.bind(this),
      'core:move-to-top': this._moveSelectionToTop.bind(this),
      'core:move-to-bottom': this._moveSelectionToBottom.bind(this),
      'core:cancel': boundClose,
      'editor:newline': this._boundConfirm
    }));

    this._subscriptions.add(textEditor.onDidChange(boundClose));
    this._subscriptions.add(textEditor.onDidChangeCursorPosition(boundClose));

    // Prevent scrolling the editor when scrolling the suggestion list.
    const stopPropagation = event => event.stopPropagation();
    _reactForAtom.ReactDOM.findDOMNode(this.refs.scroller).addEventListener('mousewheel', stopPropagation);
    this._subscriptions.add(new _atom.Disposable(() => {
      _reactForAtom.ReactDOM.findDOMNode(this.refs.scroller).removeEventListener('mousewheel', stopPropagation);
    }));

    const keydown = event => {
      // If the user presses the enter key, confirm the selection.
      if (event.keyCode === 13) {
        event.stopImmediatePropagation();
        this._confirm();
      }
    };
    textEditorView.addEventListener('keydown', keydown);
    this._subscriptions.add(new _atom.Disposable(() => {
      textEditorView.removeEventListener('keydown', keydown);
    }));
  }

  render() {
    const itemComponents = this._items.map((item, index) => {
      let className = 'hyperclick-result-item';
      if (index === this.state.selectedIndex) {
        className += ' selected';
      }
      return _reactForAtom.React.createElement(
        'li',
        { className: className,
          key: index,
          onMouseDown: this._boundConfirm,
          onMouseEnter: this._setSelectedIndex.bind(this, index) },
        item.title,
        _reactForAtom.React.createElement(
          'span',
          { className: 'right-label' },
          item.rightLabel
        )
      );
    });

    return _reactForAtom.React.createElement(
      'div',
      { className: 'popover-list select-list hyperclick-suggestion-list-scroller', ref: 'scroller' },
      _reactForAtom.React.createElement(
        'ol',
        { className: 'list-group', ref: 'selectionList' },
        itemComponents
      )
    );
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.selectedIndex !== this.state.selectedIndex) {
      this._updateScrollPosition();
    }
  }

  componentWillUnmount() {
    this._subscriptions.dispose();
  }

  _confirm() {
    this._items[this.state.selectedIndex].callback();
    this._close();
  }

  _close() {
    this.props.suggestionList.hide();
  }

  _setSelectedIndex(index) {
    this.setState({
      selectedIndex: index
    });
  }

  _moveSelectionDown(event) {
    if (this.state.selectedIndex < this._items.length - 1) {
      this.setState({ selectedIndex: this.state.selectedIndex + 1 });
    } else {
      this._moveSelectionToTop();
    }
    if (event) {
      event.stopImmediatePropagation();
    }
  }

  _moveSelectionUp(event) {
    if (this.state.selectedIndex > 0) {
      this.setState({ selectedIndex: this.state.selectedIndex - 1 });
    } else {
      this._moveSelectionToBottom();
    }
    if (event) {
      event.stopImmediatePropagation();
    }
  }

  _moveSelectionToBottom(event) {
    this.setState({ selectedIndex: Math.max(this._items.length - 1, 0) });
    if (event) {
      event.stopImmediatePropagation();
    }
  }

  _moveSelectionToTop(event) {
    this.setState({ selectedIndex: 0 });
    if (event) {
      event.stopImmediatePropagation();
    }
  }

  _updateScrollPosition() {
    const listNode = _reactForAtom.ReactDOM.findDOMNode(this.refs.selectionList);
    const selectedNode = listNode.getElementsByClassName('selected')[0];
    selectedNode.scrollIntoViewIfNeeded(false);
  }
};
exports.default = document.registerElement('hyperclick-suggestion-list', {
  prototype: SuggestionListElement.prototype
});
module.exports = exports['default'];