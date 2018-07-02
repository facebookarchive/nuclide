"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WelcomePageContainer = exports.default = void 0;

var React = _interopRequireWildcard(require("react"));

function _reactRedux() {
  const data = require("react-redux");

  _reactRedux = function () {
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

function _WelcomePageSection() {
  const data = _interopRequireDefault(require("./WelcomePageSection"));

  _WelcomePageSection = function () {
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
  constructor(props) {
    super(props);
    this.state = this._initialState();
  }

  _initialState() {
    const topicsToHide = {};
    const topics = this.props.welcomePages.keys();

    for (const topic of topics) {
      topicsToHide[topic] = this.props.hiddenTopics.has(topic);
    }

    return {
      topicsToHide
    };
  }

  _topicFilter() {
    const option = this.props.showOption;

    if (option != null) {
      switch (option.type) {
        case 'SHOW_ALL':
          return topic => true;

        case 'SHOW_ONE':
          return topic => topic === option.args.topic;
      }
    }

    return topic => !this.props.hiddenTopics.has(topic);
  }

  render() {
    const topicFilter = this._topicFilter();

    const entries = this._buildEntries(topicFilter);

    return React.createElement("div", {
      className: "welcome-page"
    }, entries);
  }

  _buildEntries(topicFilter) {
    const visiblePages = Array.from(this.props.welcomePages.entries()).filter(([topic, data]) => topicFilter(topic));
    visiblePages.sort(([topicA, dataA], [topicB, dataB]) => dataA.priority - dataB.priority);
    const entries = [];

    for (let i = 0; i < visiblePages.length; i++) {
      const [topic, {
        content
      }] = visiblePages[i];
      entries.push(this._pageSection(topic, content), React.createElement("hr", null));
    }

    entries.pop(); // take off last separator

    return entries;
  }

  _pageSection(topic, content) {
    return React.createElement(_WelcomePageSection().default, {
      key: topic,
      content: content,
      toHide: this.state.topicsToHide[topic],
      onSetHide: this._handleSetHide(topic)
    });
  }

  _handleSetHide(topic) {
    return hideTopic => {
      const {
        topicsToHide
      } = this.state;
      topicsToHide[topic] = hideTopic;
      this.setState({
        topicsToHide
      });
    };
  }

  componentWillUnmount() {
    this._updateHiddenTopics();

    this.props.actionCreators.clearShowOption();
  }

  _updateHiddenTopics() {
    const topics = this.state.topicsToHide;
    const hiddenTopics = new Set();
    const unhiddenTopics = new Set();

    for (const topic in topics) {
      if (topics.hasOwnProperty(topic)) {
        const isHidden = this.props.hiddenTopics.has(topic);
        const shouldHide = topics[topic];

        if (shouldHide && !isHidden) {
          hiddenTopics.add(topic);
        }

        if (!shouldHide && isHidden) {
          unhiddenTopics.add(topic);
        }
      }
    }

    if (hiddenTopics.size !== 0 || unhiddenTopics.size !== 0) {
      // action only if anything has changed
      this.props.actionCreators.hideUnhideTopics(hiddenTopics, unhiddenTopics);
    }
  }

}

exports.default = WelcomePageComponent;

function mapStateToProps(state) {
  return state;
}

const WelcomePageContainer = (0, _reactRedux().connect)(mapStateToProps, ActionCreators(), (stateProps, actionCreators) => Object.assign({}, stateProps, {
  actionCreators
}))(WelcomePageComponent);
exports.WelcomePageContainer = WelcomePageContainer;