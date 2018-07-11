"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _AtomInput() {
  const data = require("../../modules/nuclide-commons-ui/AtomInput");

  _AtomInput = function () {
    return data;
  };

  return data;
}

function _classnames() {
  const data = _interopRequireDefault(require("classnames"));

  _classnames = function () {
    return data;
  };

  return data;
}

function _event() {
  const data = require("../../modules/nuclide-commons/event");

  _event = function () {
    return data;
  };

  return data;
}

function _observable() {
  const data = require("../../modules/nuclide-commons/observable");

  _observable = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
const UP = -1;
const DOWN = 1;
/**
 * A dumb component that just takes a list of dropdown results, and renders
 * a rect beneath a given AtomInput ref. Default onSelect of an item will
 * populate the AtomInput, but it can be overriden to do anything else.
 */

class DropdownResults extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      optionsVisible: false,
      optionsRect: null,
      selectedIndex: -1
    };

    this._onSelect = (option, fromConfirm = false) => {
      this._shouldShowOnChange = false;
      this.setState({
        optionsVisible: false,
        selectedIndex: -1
      });

      if (this.props.onSelect != null) {
        this.props.onSelect(option);
      } else {
        this.props.atomInput.setText(option);
      } // Re-focusing only needs to happen when mouse clicking results.


      if (!fromConfirm) {
        this._keepFocus = true;
        this._shouldShowOnFocus = false;
      }
    };

    this._setSelectedIndex = selectedIndex => {
      this.setState({
        selectedIndex
      });
    };

    this._recalculateRect = () => {
      const boundingRect = this.props.atomInput.getTextEditorElement().getBoundingClientRect();
      this.setState({
        optionsRect: {
          top: boundingRect.bottom,
          left: boundingRect.left,
          width: boundingRect.width
        }
      });
    };

    this._handleInputFocus = () => {
      // When an option is selected, the input gets focused again, but we don't
      // want to show dropdown results again.
      if (!this._shouldShowOnFocus) {
        this._shouldShowOnFocus = true;
      } else if (this.props.displayOnFocus) {
        this.setState({
          optionsVisible: true
        });
      }
    };

    this._handleInputChange = () => {
      // When an option is selected, the input will trigger this, but we don't
      // want to show dropdown results again.
      if (!this._shouldShowOnChange) {
        this._shouldShowOnChange = true;
      } else if (this.props.atomInput.isFocused() && !this.state.optionsVisible) {
        this.setState({
          optionsVisible: true
        });
      }
    };

    this._handleInputBlur = () => {
      // When an option is selected from a mouse click, we want to keep the focus
      // on the atom input.
      if (this._keepFocus) {
        this.props.atomInput.focus();
        this._keepFocus = false;
      } else {
        this._handleCancel();
      }
    };

    this._handleCancel = () => {
      this.setState({
        optionsVisible: false
      });
    };

    this._handleMove = increment => {
      if (!this.state.optionsVisible) {
        this.setState({
          optionsVisible: true
        });
      } else {
        // Moves selected index up or down with wrapping.
        // Also, add one entry for nothing selected (default dropdown behavior).
        const optionsSize = this.props.options.length + 1;
        this.setState({
          selectedIndex: // TODO: (wbinnssmith) T30771435 this setState depends on current state
          // and should use an updater function rather than an object
          // eslint-disable-next-line react/no-access-state-in-setstate
          (this.state.selectedIndex + increment + optionsSize + 1) % optionsSize - 1
        });
      }
    };

    this._handleConfirm = event => {
      if (this.state.optionsVisible) {
        if (event.key === 'Enter' && this.state.selectedIndex >= 0) {
          this._onSelect(this.props.options[this.state.selectedIndex], true
          /* fromConfirm */
          );

          event.stopPropagation();
        } else if (event.key === 'Escape') {
          this._handleCancel();

          event.stopPropagation();
        }
      }
    };

    const workspaceElement = atom.views.getView(atom.workspace);

    if (!(workspaceElement != null)) {
      throw new Error("Invariant violation: \"workspaceElement != null\"");
    }

    this._optionsElement = document.createElement('div');
    workspaceElement.appendChild(this._optionsElement);
    this._shouldShowOnChange = true;
    this._shouldShowOnFocus = true;
    this._keepFocus = false;
  }

  componentDidMount() {
    const editorElement = this.props.atomInput.getTextEditorElement();
    const editor = this.props.atomInput.getTextEditor();
    this._disposables = new (_UniversalDisposable().default)(() => {
      this._optionsElement.remove();
    }, _RxMin.Observable.fromEvent(window, 'resize').let((0, _observable().fastDebounce)(200)).subscribe(this._recalculateRect), _RxMin.Observable.fromEvent(editorElement, 'focus').subscribe(this._handleInputFocus), _RxMin.Observable.fromEvent(editorElement, 'blur').subscribe(this._handleInputBlur), atom.commands.add(editorElement, 'core:move-up', () => this._handleMove(UP)), atom.commands.add(editorElement, 'core:move-down', () => this._handleMove(DOWN)), _RxMin.Observable.fromEvent(editorElement, 'keydown').subscribe(this._handleConfirm), (0, _event().observableFromSubscribeFunction)(editor.onDidChange.bind(editor)).subscribe(this._handleInputChange));

    this._recalculateRect();
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  render() {
    if (!this.state.optionsVisible) {
      return null;
    }

    let options = [];

    if (this.props.errorMessage != null && this.props.errorMessage.length > 0) {
      options.push(React.createElement("li", {
        key: "error-text",
        className: "error"
      }, React.createElement("span", {
        className: "error-message"
      }, this.props.errorMessage)));
    } else if (this.props.isLoading) {
      options.push(React.createElement("li", {
        key: "loading-text",
        className: "loading"
      }, React.createElement("span", {
        className: "loading-message"
      }, this.props.loadingMessage)));
    } else {
      options = this.props.options.map((option, i) => React.createElement("li", {
        key: 'option-' + option,
        className: (0, _classnames().default)({
          selected: i === this.state.selectedIndex,
          'nuclide-dropdown-result': true
        }),
        onMouseDown: () => this._onSelect(option),
        onMouseOver: () => this._setSelectedIndex(i)
      }, option));
    }

    return _reactDom.default.createPortal(React.createElement("div", {
      className: "nuclide-combobox-options nuclide-dropdown-results",
      style: this.state.optionsRect
    }, React.createElement("div", {
      className: "select-list"
    }, React.createElement("ol", {
      className: "nuclide-combobox-list-group list-group"
    }, options))), this._optionsElement);
  }

}

exports.default = DropdownResults;
DropdownResults.defaultProps = {
  displayOnFocus: false,
  errorMessage: null,
  isLoading: false,
  loadingMessage: 'Loading Results'
};