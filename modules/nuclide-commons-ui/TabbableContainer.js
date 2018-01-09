'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = _interopRequireDefault(require('react'));

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _tabbable;

function _load_tabbable() {
  return _tabbable = _interopRequireDefault(require('tabbable'));
}

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const TABBABLE_CLASS_NAME = 'nuclide-tabbable';

/**
 * Enables focusing between inputs with tab and shift-tab. Can also be used to
 * trap focus within the container by using the contained property.
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

/* eslint-env browser */

class TabbableContainer extends _react.default.Component {

  componentDidMount() {
    const rootNode = this._rootNode;

    if (!(rootNode != null)) {
      throw new Error('Invariant violation: "rootNode != null"');
    }

    // If focus has been deliberately set inside the container, don't try
    // to override it


    if (!rootNode.contains(document.activeElement)) {
      const tabbableElements = (0, (_tabbable || _load_tabbable()).default)(rootNode);
      const firstTabbableElement = tabbableElements[0];
      if (firstTabbableElement != null) {
        firstTabbableElement.focus();
      }
    }

    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(_rxjsBundlesRxMinJs.Observable.fromEvent(rootNode, 'keydown').subscribe(event => {
      if (event.altKey || event.ctrlKey || event.metaKey) {
        return;
      }

      if (event.key === 'Tab') {
        if (event.shiftKey) {
          focusPrevious();
        } else {
          focusNext();
        }
        event.preventDefault();
        event.stopPropagation();
      }
    }));
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  render() {
    return _react.default.createElement(
      'div',
      {
        className: (0, (_classnames || _load_classnames()).default)(TABBABLE_CLASS_NAME, this.props.className),
        'data-contained': this.props.contained,
        ref: node => this._rootNode = node },
      this.props.children
    );
  }
}

exports.default = TabbableContainer;
TabbableContainer.defaultProps = {
  contained: false,
  autoFocus: false
};
function focusNext() {
  const currentElement = getFocusedElement();
  if (!(currentElement instanceof HTMLElement)) {
    return;
  }
  const focusedTabIndex = currentElement.tabIndex >= 0 ? currentElement.tabIndex : -Infinity;

  let nextElement = null;
  let nextTabIndex = Infinity;
  let lowestElement = null;
  let lowestTabIndex = Infinity;

  let container = findParentElement(currentElement, element => {
    return element.classList.contains(TABBABLE_CLASS_NAME);
  });
  if (container instanceof HTMLElement && container.dataset.contained === 'false') {
    container = null;
  }

  eachTabIndexedElement(currentElement, false /* reverse */
  , (element, tabIndex) => {
    if (tabIndex < lowestTabIndex) {
      lowestTabIndex = tabIndex;
      lowestElement = element;
    }

    if (focusedTabIndex <= tabIndex && tabIndex < nextTabIndex) {
      nextTabIndex = tabIndex;
      nextElement = element;
      if (focusedTabIndex === tabIndex || focusedTabIndex + 1 === tabIndex) {
        return true; // doneSearching
      }
    }

    return false; // doneSearching
  }, container);

  if (nextElement) {
    nextElement.focus();
  } else if (lowestElement) {
    lowestElement.focus();
  }
}

function focusPrevious() {
  const currentElement = getFocusedElement();
  if (!(currentElement instanceof HTMLElement)) {
    return;
  }
  const focusedTabIndex = currentElement.tabIndex >= 0 ? currentElement.tabIndex : Infinity;

  let previousElement = null;
  let previousTabIndex = -Infinity;
  let highestElement = null;
  let highestTabIndex = -Infinity;

  let container = findParentElement(currentElement, element => {
    return element.classList.contains(TABBABLE_CLASS_NAME);
  });
  if (container instanceof HTMLElement && container.dataset.contained === 'false') {
    container = null;
  }

  eachTabIndexedElement(currentElement, true /* reverse */
  , (element, tabIndex) => {
    if (tabIndex > highestTabIndex) {
      highestTabIndex = tabIndex;
      highestElement = element;
    }

    if (focusedTabIndex >= tabIndex && tabIndex > previousTabIndex) {
      previousTabIndex = tabIndex;
      previousElement = element;
      if (focusedTabIndex === tabIndex || focusedTabIndex - 1 === tabIndex) {
        return true; // doneSearching
      }
    }

    return false; // doneSearching
  }, container);

  if (previousElement) {
    previousElement.focus();
  } else if (highestElement) {
    highestElement.focus();
  }
}

/**
 * Traverses all focusable elements for the next element to focus.
 * curentElement is where the traversal starts.
 * reverse determines whether to traverse backwards or forwards.
 * updateNextCandidate is a method that determines if the element is the best
 *                     candidate to be focused next. A boolean is returned to
 *                     stop the traversal if that element is guaranteed to be
 *                     the next candidate.
 * container is where all of the focusable elements are searched.
 *           Default value is document.
 */
function eachTabIndexedElement(currentElement, reverse, updateNextCandidate, container) {
  const elements = (container || document).querySelectorAll('a, input, button, [tabindex]');
  let index = Array.from(elements).indexOf(currentElement);
  const increment = reverse ? -1 : 1;
  for (let i = 1; i < elements.length; ++i) {
    index = (index + elements.length + increment) % elements.length;
    const element = elements[index];
    if (element.disabled === true || element.tabIndex == null || element.tabIndex === -1) {
      continue;
    }
    if (updateNextCandidate(element, element.tabIndex)) {
      break;
    }
  }
}

function getFocusedElement() {
  // Some inputs have a hidden-input with tabindex = -1 that gets focused, so
  // activeElement is actually not what we want. In these cases, we must find
  // the parent tag that has the actual tabindex to use. An example is the
  // atom-text-editor.
  let currentElement = document.activeElement;
  if (currentElement && currentElement.classList.contains('hidden-input')) {
    currentElement = findParentElement(currentElement.parentElement, element => element instanceof HTMLElement && element.tabIndex >= 0);
  }
  return currentElement;
}

/**
 * Finds a parent of currentElement that satisfies the condition.
 */
function findParentElement(currentElement, condition) {
  let element = currentElement;
  while (element && !condition(element)) {
    element = element.parentElement;
  }
  return element;
}