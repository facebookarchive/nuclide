'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _atom = require('atom');

var _react = _interopRequireDefault(require('react'));

var _reactDom = _interopRequireDefault(require('react-dom'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * We need to create this custom HTML element so we can hook into the view
 * registry. The overlay decoration only works through the view registry.
 */
/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */

/* global HTMLElement */

class SuggestionListElement extends HTMLElement {

  initialize(model) {
    this._model = model;
    return this;
  }

  attachedCallback() {
    _reactDom.default.render(_react.default.createElement(SuggestionList, { suggestionList: this._model }), this);
  }

  detachedCallback() {
    _reactDom.default.unmountComponentAtNode(this);
  }

  dispose() {
    if (this.parentNode) {
      this.parentNode.removeChild(this);
    }
  }
}

class SuggestionList extends _react.default.Component {

  constructor(props) {
    super(props);
    this.state = {
      selectedIndex: 0
    };
    this._subscriptions = new _atom.CompositeDisposable();
    this._boundConfirm = this._confirm.bind(this);
  }

  componentWillMount() {
    const { suggestionList } = this.props;
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
    // $FlowFixMe
    _reactDom.default.findDOMNode(this.refs.scroller).addEventListener('mousewheel', stopPropagation);
    this._subscriptions.add(new _atom.Disposable(() => {
      // $FlowFixMe
      _reactDom.default.findDOMNode(this.refs.scroller).removeEventListener('mousewheel', stopPropagation);
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
      return _react.default.createElement(
        'li',
        {
          className: className,
          key: index,
          onMouseDown: this._boundConfirm,
          onMouseEnter: this._setSelectedIndex.bind(this, index) },
        item.title,
        _react.default.createElement(
          'span',
          { className: 'right-label' },
          item.rightLabel
        )
      );
    });

    return _react.default.createElement(
      'div',
      {
        className: 'popover-list select-list hyperclick-suggestion-list-scroller',
        ref: 'scroller' },
      _react.default.createElement(
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
    const listNode = _reactDom.default.findDOMNode(this.refs.selectionList);
    // $FlowFixMe
    const selectedNode = listNode.getElementsByClassName('selected')[0];
    // $FlowFixMe
    selectedNode.scrollIntoViewIfNeeded(false);
  }
}

exports.default = document.registerElement('hyperclick-suggestion-list', {
  prototype: SuggestionListElement.prototype
});