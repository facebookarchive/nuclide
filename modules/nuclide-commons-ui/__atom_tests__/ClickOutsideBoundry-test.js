"use strict";

var React = _interopRequireWildcard(require("react"));

var _reactDom = require("react-dom");

function _ClickOutsideBoundary() {
  const data = _interopRequireDefault(require("../ClickOutsideBoundary"));

  _ClickOutsideBoundary = function () {
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
 *  strict-local
 * @format
 */
const clickId = id => {
  const node = document.getElementById(id);

  if (!(node != null)) {
    throw new Error(`node ${id} should be present in the DOM`);
  }

  node.click();
}; // A component which removes itself from the DOM when clicked.
// $FlowFixMe(>=0.53.0) Flow suppress


class ClickAway extends React.Component {
  constructor(props) {
    super(props);

    this.handleClick = () => {
      this.setState({
        visible: false
      });
    };

    this.state = {
      visible: true
    };
  }

  render() {
    return this.state.visible ? React.createElement("span", Object.assign({}, this.props, {
      onClick: this.handleClick
    }), "Click to dismiss") : null;
  }

}

describe('ClickOutsideBoundary - onClickOutside handler', () => {
  let app;
  let onClickOutside;
  beforeEach(() => {
    app = document.createElement('div');
    window.document.body.appendChild(app);
    onClickOutside = jest.fn();
  });
  afterEach(() => {
    window.document.body.removeChild(app);
  });
  describe('_is_ called for an external click', () => {
    it('on a parent', () => {
      (0, _reactDom.render)(React.createElement("div", {
        id: "container"
      }, React.createElement(_ClickOutsideBoundary().default, {
        onClickOutside: onClickOutside
      }, React.createElement("div", {
        id: "target"
      }))), app);
      clickId('container');
      expect(onClickOutside).toHaveBeenCalled();
    });
    it('on a sibling', () => {
      (0, _reactDom.render)(React.createElement("div", null, React.createElement(_ClickOutsideBoundary().default, {
        onClickOutside: onClickOutside
      }, React.createElement("div", {
        id: "target"
      })), React.createElement("div", {
        id: "sibling"
      })), app);
      clickId('sibling');
      expect(onClickOutside).toHaveBeenCalled();
    });
    it('on a sibling that disappears after render', () => {
      // This would fail if we tool the approach of ignoring all
      // clicks on elements that were not in the DOM.
      (0, _reactDom.render)(React.createElement("div", null, React.createElement(_ClickOutsideBoundary().default, {
        onClickOutside: onClickOutside
      }, React.createElement("div", {
        id: "target"
      })), React.createElement(ClickAway, {
        id: "click-away"
      })), app);
      clickId('click-away');
      expect(onClickOutside).toHaveBeenCalled();
    });
  });
  describe('is _not_ called for an internal click', () => {
    it('under normal conditions', () => {
      (0, _reactDom.render)(React.createElement(_ClickOutsideBoundary().default, {
        onClickOutside: onClickOutside
      }, React.createElement("div", {
        id: "target"
      })), app);
      clickId('target');
      expect(onClickOutside).not.toHaveBeenCalled();
    });
    it('when the target leaves the DOM before the event reaches window.document', () => {
      // A simple approach: `this.rootNode.contains(e.target)` would fail this test.
      const onClickInside = jest.fn();
      (0, _reactDom.render)(React.createElement(_ClickOutsideBoundary().default, {
        onClickOutside: onClickOutside
      }, React.createElement("div", {
        onClick: onClickInside
      }, React.createElement(ClickAway, {
        id: "click-away"
      }))), app);
      clickId('click-away');
      expect(onClickInside).toHaveBeenCalled();
      expect(onClickOutside).not.toHaveBeenCalled();
    });
  });
});