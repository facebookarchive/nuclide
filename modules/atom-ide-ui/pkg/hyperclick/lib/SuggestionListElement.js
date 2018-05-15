'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _UniversalDisposable;















function _load_UniversalDisposable() {return _UniversalDisposable = _interopRequireDefault(require('../../../../nuclide-commons/UniversalDisposable'));}
var _react = _interopRequireWildcard(require('react'));
var _reactDom = _interopRequireDefault(require('react-dom'));var _scrollIntoView;

function _load_scrollIntoView() {return _scrollIntoView = require('../../../../nuclide-commons-ui/scrollIntoView');}function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

/**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   * We need to create this custom HTML element so we can hook into the view
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   * registry. The overlay decoration only works through the view registry.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   */
class SuggestionListElement extends HTMLElement {


  initialize(model) {
    this._model = model;
    return this;
  }

  attachedCallback() {
    _reactDom.default.render(_react.createElement(SuggestionList, { suggestionList: this._model }), this);
  }

  detachedCallback() {
    _reactDom.default.unmountComponentAtNode(this);
  }

  dispose() {
    if (this.parentNode) {
      this.parentNode.removeChild(this);
    }
  }} /**
      * Copyright (c) 2017-present, Facebook, Inc.
      * All rights reserved.
      *
      * This source code is licensed under the BSD-style license found in the
      * LICENSE file in the root directory of this source tree. An additional grant
      * of patent rights can be found in the PATENTS file in the same directory.
      *
      * 
      * @format
      */ /* global HTMLElement */
class SuggestionList extends _react.Component {








  constructor(props) {
    super(props);
    this.state = {
      selectedIndex: 0 };

    this._subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._boundConfirm = this._confirm.bind(this);
  }

  componentWillMount() {
    const { suggestionList } = this.props;
    const suggestion = suggestionList.getSuggestion();
    // TODO(nmote): This is assuming `suggestion.callback` is always an Array, which is not true
    //   according to hyperclick/lib/types. It can also be a function.
    if (!(suggestion != null && Array.isArray(suggestion.callback))) {throw new Error('Invariant violation: "suggestion != null && Array.isArray(suggestion.callback)"');}
    this._items = suggestion.callback;
    this._textEditor = suggestionList.getTextEditor();
  }

  componentDidMount() {
    const textEditor = this._textEditor;if (!
    textEditor) {throw new Error('Invariant violation: "textEditor"');}
    const textEditorView = atom.views.getView(textEditor);
    const boundClose = this._close.bind(this);
    this._subscriptions.add(
    atom.commands.add(textEditorView, {
      'core:move-up': this._moveSelectionUp.bind(this),
      'core:move-down': this._moveSelectionDown.bind(this),
      'core:move-to-top': this._moveSelectionToTop.bind(this),
      'core:move-to-bottom': this._moveSelectionToBottom.bind(this),
      'core:cancel': boundClose,
      'editor:newline': this._boundConfirm }));



    this._subscriptions.add(textEditor.getBuffer().onDidChangeText(boundClose));
    this._subscriptions.add(textEditor.onDidChangeCursorPosition(boundClose));

    // Prevent scrolling the editor when scrolling the suggestion list.
    const stopPropagation = event => event.stopPropagation();
    const scroller = this._scroller;if (!(
    scroller != null)) {throw new Error('Invariant violation: "scroller != null"');}
    scroller.addEventListener('mousewheel', stopPropagation);
    this._subscriptions.add(
    new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
      scroller.removeEventListener('mousewheel', stopPropagation);
    }));


    const keydown = event => {
      // If the user presses the enter key, confirm the selection.
      if (event.keyCode === 13) {
        event.stopImmediatePropagation();
        this._confirm();
      }
    };
    textEditorView.addEventListener('keydown', keydown);
    this._subscriptions.add(
    new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
      textEditorView.removeEventListener('keydown', keydown);
    }));

  }

  render() {
    const itemComponents = this._items.map((item, index) => {
      let className = 'hyperclick-result-item';
      if (index === this.state.selectedIndex) {
        className += ' selected';
      }
      return (
        _react.createElement('li', {
            className: className,
            key: index,
            onMouseDown: this._boundConfirm,
            onMouseEnter: this._setSelectedIndex.bind(this, index) },
          item.title,
          _react.createElement('span', { className: 'right-label' }, item.rightLabel)));


    });

    return (
      _react.createElement('div', {
          className: 'popover-list select-list hyperclick-suggestion-list-scroller',
          ref: el => {
            this._scroller = el;
          } },
        _react.createElement('ol', {
            className: 'list-group',
            ref: el => {
              this._selectionList = el;
            } },
          itemComponents)));



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
      selectedIndex: index });

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
    const listNode = this._selectionList;if (!(
    listNode != null)) {throw new Error('Invariant violation: "listNode != null"');}
    const selectedNode = listNode.getElementsByClassName('selected')[0];
    (0, (_scrollIntoView || _load_scrollIntoView()).scrollIntoViewIfNeeded)(selectedNode, false);
  }}exports.default =


document.registerElement('hyperclick-suggestion-list', {
  prototype: SuggestionListElement.prototype });