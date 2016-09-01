Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.viewableFromReactElement = viewableFromReactElement;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

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

var _nuclideUiLibReactMountRootElement2;

function _nuclideUiLibReactMountRootElement() {
  return _nuclideUiLibReactMountRootElement2 = _interopRequireDefault(require('../nuclide-ui/lib/ReactMountRootElement'));
}

/**
 * Create an object that can be used as an Atom model from a React element. Example:
 *
 *     class UsageStats extends React.Component {
 *
 *       // Methods that Atom looks for on models (like `getTitle()`, `getIconName()`, etc.) can be
 *       // added to the component.
 *       getTitle(): string {
 *         return 'Usage Stats';
 *       }
 *
 *       render(): React.Element {
 *         return <div>Stats</div>;
 *       }
 *
 *     }
 *
 *    const item = viewableFromReactElement(<UsageStats />);
 *    atom.workspace.getPanes()[0].addItem(item); // Or anywhere else Atom uses model "items."
 */

function viewableFromReactElement(reactElement) {
  var container = new (_nuclideUiLibReactMountRootElement2 || _nuclideUiLibReactMountRootElement()).default();
  var item = (_reactForAtom2 || _reactForAtom()).ReactDOM.render(reactElement, container);

  // Add the a reference to the container to the item. This will allow Atom's view registry to
  // associate the item with the HTML element.
  if (item.element != null) {
    throw new Error("Component cannot have an `element` property. That's added by viewableFromReactElement");
  }
  item.element = container;

  // Add a destroy method to the item that will unmount the component. There's no need for users to
  // implement this themselves because they have `componentWillUnmount()`.
  if (item.destroy != null) {
    throw new Error("Component cannot implement `destroy()`. That's added by `viewableFromReactElement`");
  }
  item.destroy = function () {
    (_reactForAtom2 || _reactForAtom()).ReactDOM.unmountComponentAtNode(container);
  };

  return item;
}