/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {AppState, WelcomePage, ShowOption} from '../types';

import * as React from 'react';
import {connect} from 'react-redux';
import * as ActionCreators from '../redux/Actions';
import WelcomePageSection from './WelcomePageSection';

type Props = {
  actionCreators: typeof ActionCreators,
  welcomePages: Map<string, WelcomePage>,
  hiddenTopics: Set<string>,
  showOption: ShowOption,
};

// This state represents the request to hide (or to not hide) a given topic in
// the future, rather than whether it is hidden now.  It can be modified by the
// checkboxes in the separate sections, and merges with the master state when
// the WelcomePageComponent unmounts.
// This could also live in the general redux code for this package, but we see
// no strong pressure to move it there yet.  If it causes problems here, we can
// move local state out of this component and consolidate it there.
type State = {topicsToHide: {[string]: boolean}};

export default class WelcomePageComponent extends React.Component<
  Props,
  State,
> {
  constructor(props: Props) {
    super(props);
    this.state = this._initialState();
  }

  _initialState(): State {
    const topicsToHide: {[string]: boolean} = {};
    const topics = this.props.welcomePages.keys();
    for (const topic of topics) {
      topicsToHide[topic] = this.props.hiddenTopics.has(topic);
    }
    return {topicsToHide};
  }

  _topicFilter(): string => boolean {
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

  render(): React.Node {
    const topicFilter = this._topicFilter();
    const entries = this._buildEntries(topicFilter);
    return <div className="welcome-page">{entries}</div>;
  }

  _buildEntries(topicFilter: string => boolean): Array<React$Node> {
    const visiblePages = Array.from(this.props.welcomePages.values()).filter(
      page => topicFilter(page.topic),
    );
    const entries = [];
    for (let i = 0; i < visiblePages.length; i++) {
      entries.push(this._pageSection(visiblePages[i]), <hr />);
    }
    entries.pop(); // take off last separator
    return entries;
  }

  _pageSection(page: WelcomePage): React$Node {
    const topic = page.topic;
    return (
      <WelcomePageSection
        page={page}
        toHide={this.state.topicsToHide[topic]}
        onSetHide={this._handleSetHide(topic)}
      />
    );
  }

  _handleSetHide(topic: string): boolean => void {
    return hideTopic => {
      const {topicsToHide} = this.state;
      topicsToHide[topic] = hideTopic;
      this.setState({topicsToHide});
    };
  }

  componentWillUnmount(): void {
    this._updateHiddenTopics();
    this.props.actionCreators.clearShowAll();
  }

  _updateHiddenTopics(): void {
    const topics = this.state.topicsToHide;
    const hiddenTopics: Set<string> = new Set();
    const unhiddenTopics: Set<string> = new Set();
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

function mapStateToProps(state: AppState) {
  return state;
}

export const WelcomePageContainer = connect(
  mapStateToProps,
  ActionCreators,
  (stateProps, actionCreators) => ({...stateProps, actionCreators}),
)(WelcomePageComponent);
