"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WelcomePageContainer = exports.default = void 0;

var React = _interopRequireWildcard(require("react"));

function _classnames() {
  const data = _interopRequireDefault(require("classnames"));

  _classnames = function () {
    return data;
  };

  return data;
}

function _reactRedux() {
  const data = require("react-redux");

  _reactRedux = function () {
    return data;
  };

  return data;
}

function _Checkbox() {
  const data = require("../../../../modules/nuclide-commons-ui/Checkbox");

  _Checkbox = function () {
    return data;
  };

  return data;
}

function ActionCreators() {
  const data = _interopRequireWildcard(require("../redux/Actions"));

  ActionCreators = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
class WelcomePageComponent extends React.Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this.state = {
      shouldHide: this.props.hiddenTopics.has(this.props.topic)
    }, _temp;
  }

  render() {
    const {
      topic
    } = this.props;
    const welcomePage = this.props.welcomePages.get(topic);

    if (!(welcomePage != null)) {
      throw new Error("Invariant violation: \"welcomePage != null\"");
    }

    const hideCheckboxProps = welcomePage.hideCheckboxProps;
    return React.createElement("div", {
      className: (0, _classnames().default)(this.props.className, 'welcome-page')
    }, welcomePage.content, React.createElement("div", {
      className: hideCheckboxProps.className
    }, React.createElement(_Checkbox().Checkbox, {
      checked: this.state.shouldHide,
      onChange: this._handleSetHide(topic, hideCheckboxProps.checkboxCallback),
      label: hideCheckboxProps.label
    })));
  }

  _handleSetHide(topic, checkboxCallback) {
    return hideTopic => {
      this.setState({
        shouldHide: hideTopic
      });
      this.props.actionCreators.setTopicHidden(this.props.topic, hideTopic);

      if (checkboxCallback != null) {
        checkboxCallback(hideTopic);
      }
    };
  }

}

exports.default = WelcomePageComponent;

function mapStateToProps(state, ownProps) {
  return Object.assign({}, state, ownProps);
}

const WelcomePageContainer = (0, _reactRedux().connect)(mapStateToProps, ActionCreators(), (stateProps, actionCreators) => Object.assign({}, stateProps, {
  actionCreators
}))(WelcomePageComponent);
exports.WelcomePageContainer = WelcomePageContainer;