"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

function _scrollIntoView() {
  const data = require("../../../../nuclide-commons-ui/scrollIntoView");

  _scrollIntoView = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
    _reactDom.default.render(React.createElement(SuggestionList, {
      suggestionList: this._model
    }), this);
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

class SuggestionList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedIndex: 0
    };
    this._subscriptions = new (_UniversalDisposable().default)();
    this._boundConfirm = this._confirm.bind(this);
  }

  UNSAFE_componentWillMount() {
    const {
      suggestionList
    } = this.props;
    const suggestion = suggestionList.getSuggestion(); // TODO(nmote): This is assuming `suggestion.callback` is always an Array, which is not true
    //   according to hyperclick/lib/types. It can also be a function.

    if (!(suggestion != null && Array.isArray(suggestion.callback))) {
      throw new Error("Invariant violation: \"suggestion != null && Array.isArray(suggestion.callback)\"");
    }

    this._items = suggestion.callback;
    this._textEditor = suggestionList.getTextEditor();
  }

  componentDidMount() {
    const textEditor = this._textEditor;

    if (!textEditor) {
      throw new Error("Invariant violation: \"textEditor\"");
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

    this._subscriptions.add(textEditor.getBuffer().onDidChangeText(boundClose));

    this._subscriptions.add(textEditor.onDidChangeCursorPosition(boundClose)); // Prevent scrolling the editor when scrolling the suggestion list.


    const stopPropagation = event => event.stopPropagation();

    const scroller = this._scroller;

    if (!(scroller != null)) {
      throw new Error("Invariant violation: \"scroller != null\"");
    }

    scroller.addEventListener('mousewheel', stopPropagation);

    this._subscriptions.add(new (_UniversalDisposable().default)(() => {
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

    this._subscriptions.add(new (_UniversalDisposable().default)(() => {
      textEditorView.removeEventListener('keydown', keydown);
    }));
  }

  render() {
    const itemComponents = this._items.map((item, index) => {
      let className = 'hyperclick-result-item';

      if (index === this.state.selectedIndex) {
        className += ' selected';
      }

      return React.createElement("li", {
        className: className,
        key: index,
        onMouseDown: this._boundConfirm,
        onMouseEnter: this._setSelectedIndex.bind(this, index)
      }, item.title, React.createElement("span", {
        className: "right-label"
      }, item.rightLabel));
    });

    return React.createElement("div", {
      className: "popover-list select-list hyperclick-suggestion-list-scroller",
      ref: el => {
        this._scroller = el;
      }
    }, React.createElement("ol", {
      className: "list-group",
      ref: el => {
        this._selectionList = el;
      }
    }, itemComponents));
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.selectedIndex !== this.state.selectedIndex) {
      this._updateScrollPosition();
    }
  }

  componentWillUnmount() {
    this._subscriptions.dispose();
  }

  _confirm(event) {
    this._items[this.state.selectedIndex].callback();

    this._close();

    if (event) {
      event.stopImmediatePropagation();
    }
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
      // TODO: (wbinnssmith) T30771435 this setState depends on current state
      // and should use an updater function rather than an object
      // eslint-disable-next-line react/no-access-state-in-setstate
      this.setState({
        selectedIndex: this.state.selectedIndex + 1
      });
    } else {
      this._moveSelectionToTop();
    }

    if (event) {
      event.stopImmediatePropagation();
    }
  }

  _moveSelectionUp(event) {
    if (this.state.selectedIndex > 0) {
      // TODO: (wbinnssmith) T30771435 this setState depends on current state
      // and should use an updater function rather than an object
      // eslint-disable-next-line react/no-access-state-in-setstate
      this.setState({
        selectedIndex: this.state.selectedIndex - 1
      });
    } else {
      this._moveSelectionToBottom();
    }

    if (event) {
      event.stopImmediatePropagation();
    }
  }

  _moveSelectionToBottom(event) {
    this.setState({
      selectedIndex: Math.max(this._items.length - 1, 0)
    });

    if (event) {
      event.stopImmediatePropagation();
    }
  }

  _moveSelectionToTop(event) {
    this.setState({
      selectedIndex: 0
    });

    if (event) {
      event.stopImmediatePropagation();
    }
  }

  _updateScrollPosition() {
    const listNode = this._selectionList;

    if (!(listNode != null)) {
      throw new Error("Invariant violation: \"listNode != null\"");
    }

    const selectedNode = listNode.getElementsByClassName('selected')[0];
    (0, _scrollIntoView().scrollIntoViewIfNeeded)(selectedNode, false);
  }

}

var _default = document.registerElement('hyperclick-suggestion-list', {
  prototype: SuggestionListElement.prototype
});

exports.default = _default;