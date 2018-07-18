"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _Tabs() {
  const data = _interopRequireDefault(require("../../modules/nuclide-commons-ui/Tabs"));

  _Tabs = function () {
    return data;
  };

  return data;
}

function _collection() {
  const data = require("../../modules/nuclide-commons/collection");

  _collection = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

function _classnames() {
  const data = _interopRequireDefault(require("classnames"));

  _classnames = function () {
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
// Tabbed Container which renders all of its children, but applies
// `display: none` to inactive ones. This allows tab changes to be very fast and
// not lose state on expensive-to-mount components
class TabbedContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTabName: props.tabNames[0]
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const {
      activeTabName
    } = prevState;
    const {
      tabNames,
      children
    } = nextProps;
    const activeTabIndex = tabNames.findIndex(name => name === activeTabName);

    if (children[activeTabIndex] == null) {
      return Object.assign({}, prevState, {
        activeTabName: tabNames[0]
      });
    }

    return null;
  }

  render() {
    const {
      children,
      tabNames,
      className
    } = this.props;
    const visibleTabs = (0, _collection().arrayCompact)(tabNames.slice(0, children.length).map((name, tabIndex) => {
      if (children[tabIndex] == null) {
        return null;
      }

      return {
        name,
        tabContent: React.createElement("div", null, name)
      };
    }));

    if (visibleTabs.length === 0) {
      return null;
    }

    const {
      activeTabName
    } = this.state;
    const activeTabIndex = tabNames.findIndex(name => name === activeTabName);
    const wrappedChildren = (0, _collection().arrayCompact)(children.map((child, childIndex) => {
      if (child == null) {
        return null;
      }

      return React.createElement("div", {
        key: childIndex,
        className: (0, _classnames().default)({
          hidden: childIndex !== activeTabIndex
        })
      }, child);
    }));
    return React.createElement("div", {
      className: className
    }, React.createElement(_Tabs().default, {
      tabs: visibleTabs,
      activeTabName: this.state.activeTabName,
      triggeringEvent: "onClick",
      onActiveTabChange: newTabName => this.setState({
        activeTabName: newTabName.name
      })
    }), wrappedChildren);
  }

}

exports.default = TabbedContainer;