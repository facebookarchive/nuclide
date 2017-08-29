'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.viewableFromReactElement = viewableFromReactElement;

var _react = _interopRequireWildcard(require('react'));

var _reactDom = _interopRequireDefault(require('react-dom'));

var _ReactMountRootElement;

function _load_ReactMountRootElement() {
  return _ReactMountRootElement = _interopRequireDefault(require('nuclide-commons-ui/ReactMountRootElement'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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
  const container = new (_ReactMountRootElement || _load_ReactMountRootElement()).default();
  const item = _reactDom.default.render(reactElement, container);

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
  item.destroy = () => {
    _reactDom.default.unmountComponentAtNode(container);
  };

  return item;
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */