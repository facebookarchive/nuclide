Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.default = createComponentItem;

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

/**
 * Create an object suitable for use as an Atom pane item from a React element.
 */

function createComponentItem(reactElement) {
  // In order to get the stateful object with the methods that Atom wants for items, we actually
  // have to mount it.
  var container = document.createElement('div');

  // For some reason, setting `container.style.display` to `"flex"` directly here doesn't work
  // (something clears it) so we add a class to style it instead.
  container.className = 'nuclide-gadgets--gadget-container';

  var mountedComponent = (_reactForAtom2 || _reactForAtom()).ReactDOM.render(reactElement, container);

  // Add the element as a property of the mounted component. This is a special property that Atom's
  // view registry knows to look for. (See [View Resolution
  // Algorithm](https://atom.io/docs/api/v1.2.4/ViewRegistry#instance-getView) for more details.)
  // $FlowIgnore -- this is not standard and probably not worth supporting widely.
  mountedComponent.element = container;

  return mountedComponent;
}

module.exports = exports.default;