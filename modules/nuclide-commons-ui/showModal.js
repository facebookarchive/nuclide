"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = showModal;

var React = _interopRequireWildcard(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _TabbableContainer() {
  const data = _interopRequireDefault(require("./TabbableContainer"));

  _TabbableContainer = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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

/* global Node */

/* global HTMLElement */

/**
 * Shows a modal dialog that renders a React element as its content.
 * The modal is automatically hidden when the user clicks outside of it, and on core:cancel (esc).
 * The modal panel unmounts its React component and destroys the panel as soon as it is hidden;
 * you may not hide the panel and then re-show it later.
 * Returns a disposable that you may use to hide and destroy the modal.
 */
function showModal(contentFactory, options = defaults) {
  const hostElement = document.createElement('div');
  const atomPanel = atom.workspace.addModalPanel({
    item: hostElement,
    priority: options.priority,
    className: options.className
  });

  const shouldDismissOnClickOutsideModal = options.shouldDismissOnClickOutsideModal || (() => true);

  const shouldDismissOnPressEscape = options.shouldDismissOnPressEscape || (() => true);

  const element = atomPanel.getElement();
  const previouslyFocusedElement = document.activeElement;
  const disposable = new (_UniversalDisposable().default)(_RxMin.Observable.fromEvent(document, 'mousedown').subscribe(({
    target
  }) => {
    if (!shouldDismissOnClickOutsideModal()) {
      return;
    }

    if (!(target instanceof Node)) {
      throw new Error("Invariant violation: \"target instanceof Node\"");
    }

    if (!atomPanel.getItem().contains(target) && // don't count clicks on notifications or tooltips as clicks 'outside'
    target.closest('atom-notifications, .tooltip') == null) {
      atomPanel.hide();
    }
  }), atomPanel.onDidChangeVisible(visible => {
    if (!visible) {
      disposable.dispose();
    }
  }), atom.commands.add('atom-workspace', 'core:cancel', () => {
    if (shouldDismissOnPressEscape()) {
      disposable.dispose();
    }
  }), () => {
    // Call onDismiss before unmounting the component and destroying the panel:
    if (options.onDismiss) {
      options.onDismiss();
    }

    _reactDom.default.unmountComponentAtNode(hostElement);

    atomPanel.destroy();

    if (document.activeElement === document.body && previouslyFocusedElement != null) {
      previouslyFocusedElement.focus();
    }
  });

  _reactDom.default.render(React.createElement(ModalContainer, null, contentFactory({
    dismiss: disposable.dispose.bind(disposable),
    element
  })), hostElement, () => {
    if (options.onOpen) {
      options.onOpen();
    }
  });

  return disposable;
}
/** Flow makes {} an unsealed object (eyeroll) */


const defaults = Object.freeze({});

/**
 * Just exists to provide a div that we can focus on mount. This ensures we steal focus from any
 * editors or other panes while the modal is present.
 */
class ModalContainer extends React.Component {
  render() {
    return React.createElement("div", {
      tabIndex: "-1"
    }, React.createElement(_TabbableContainer().default, {
      contained: true
    }, this.props.children));
  }

  componentDidMount() {
    const node = _reactDom.default.findDOMNode(this);

    if (!(node instanceof HTMLElement)) {
      throw new Error("Invariant violation: \"node instanceof HTMLElement\"");
    } // Steal the focus away from any active editor or pane, setting it on the modal;
    // but don't steal focus away from a descendant. This can happen if a React element focuses
    // during its componentDidMount. For example, <AtomInput> does this since the underlying
    // <atom-text-editor> does not support the autofocus attribute.


    if (!node.contains(document.activeElement)) {
      node.focus();
    }
  }

}