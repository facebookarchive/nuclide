"use strict";

function _TabbedContainer() {
  const data = _interopRequireDefault(require("../TabbedContainer"));

  _TabbedContainer = function () {
    return data;
  };

  return data;
}

function _testUtils() {
  const data = _interopRequireDefault(require("react-dom/test-utils"));

  _testUtils = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

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
 * @emails oncall+nuclide
 */
describe('TabbedContainer', () => {
  let containerNode;
  beforeEach(() => {
    containerNode = document.createElement('div');
  });

  const renderTabbedContainer = (tabNames, children) => {
    return _reactDom.default.render(React.createElement(_TabbedContainer().default, {
      tabNames: tabNames,
      children: children
    }), containerNode);
  };

  afterEach(() => {
    if (containerNode != null) {
      containerNode.remove();
    }
  });
  it('changes active tab when removing available children', () => {
    class Child1 extends React.Component {
      render() {
        return React.createElement("div", null, "hello");
      }

    }

    const tabbedContainer = renderTabbedContainer(['tab1', 'tab2'], [React.createElement(Child1, {
      key: 1
    }), React.createElement(Child1, {
      key: 2
    })]);
    expect(tabbedContainer.state.activeTabName).toBe('tab1');
    const renderedTabs = containerNode.getElementsByClassName('tab');
    expect(renderedTabs.length).toBe(2); // the second tab should have its contents hidden

    expect(containerNode.getElementsByClassName('hidden').length).toBe(1); // switch to second tab

    _testUtils().default.Simulate.click(renderedTabs.item(1));

    expect(tabbedContainer.state.activeTabName).toBe('tab2'); // now the second tab's content becomes null

    renderTabbedContainer(['tab1', 'tab2'], [React.createElement(Child1, {
      key: 1
    }), null]); // we should be put onto the first tab

    expect(tabbedContainer.state.activeTabName).toBe('tab1'); // no content to hide now

    expect(containerNode.getElementsByClassName('hidden').length).toBe(0);
  });
});