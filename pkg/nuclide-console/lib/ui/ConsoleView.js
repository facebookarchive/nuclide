'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Record, Executor} from '../types';

import debounce from '../../../commons-node/debounce';
import {React} from 'react-for-atom';
import OutputTable from './OutputTable';
import ConsoleHeader from './ConsoleHeader';
import InputArea from './InputArea';
import PromptButton from './PromptButton';
import UnseenMessagesNotification from './UnseenMessagesNotification';
import invariant from 'assert';
import shallowEqual from 'shallowequal';

type Props = {
  records: Array<Record>;
  clearRecords: () => void;
  execute: (code: string) => void;
  currentExecutor: ?Executor;
  executors: Map<string, Executor>;
  invalidFilterInput: boolean;
  enableRegExpFilter: boolean;
  selectedSourceId: string;
  selectExecutor: (executorId: string) => void;
  selectSource: (sourceId: string) => void;
  sources: Array<{id: string; name: string}>;
  toggleRegExpFilter: () => void;
  updateFilterText: (filterText: string) => void;
};

type State = {
  unseenMessages: boolean;
};

export default class ConsoleView extends React.Component {
  props: Props;
  state: State;

  _isScrolledToBottom: boolean;
  _scrollPane: ?HTMLElement;
  _userIsScrolling: boolean;

  constructor(props: Props) {
    super(props);
    this.state = {
      unseenMessages: false,
    };
    this._isScrolledToBottom = true;
    this._userIsScrolling = false;
    (this: any)._handleScrollPane = this._handleScrollPane.bind(this);
    (this: any)._handleScroll = this._handleScroll.bind(this);
    (this: any)._handleScrollEnd = debounce(this._handleScrollEnd, 100);
    (this: any)._scrollToBottom = this._scrollToBottom.bind(this);
  }

  componentDidUpdate(prevProps: Props): void {
    if (this.props.records.length === 0) {
      this._isScrolledToBottom = true;
    }

    // If records are added while we're scrolled to the bottom (or very very close, at least),
    // automatically scroll.
    if (this.props.records.length !== prevProps.records.length) {
      this._autoscroll();
    }
  }

  _renderPromptButton(): React.Element<any> {
    invariant(this.props.currentExecutor != null);
    const {currentExecutor} = this.props;
    const options = Array.from(this.props.executors.values())
      .map(executor => ({
        id: executor.id,
        label: executor.name,
      }));
    return (
      <PromptButton
        value={currentExecutor.id}
        onChange={this.props.selectExecutor}
        options={options}
        children={currentExecutor.name}
      />
    );
  }

  componentWillReceiveProps(props: Props): void {
    // If we receive new messages after we've scrolled away from the bottom, show the "new messages"
    // notification.
    if (props.records !== this.props.records && !this._isScrolledToBottom) {
      this.setState({unseenMessages: true});
    }
  }

  shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
    return !shallowEqual(this.props, nextProps) || !shallowEqual(this.state, nextState);
  }

  render(): ?React.Element<any> {
    return (
      <div className="nuclide-console">
        <ConsoleHeader
          clear={this.props.clearRecords}
          invalidFilterInput={this.props.invalidFilterInput}
          enableRegExpFilter={this.props.enableRegExpFilter}
          selectedSourceId={this.props.selectedSourceId}
          sources={this.props.sources}
          toggleRegExpFilter={this.props.toggleRegExpFilter}
          onFilterTextChange={this.props.updateFilterText}
          onSelectedSourceChange={this.props.selectSource}
        />
        {/*
          We need an extra wrapper element here in order to have the new messages notification stick
          to the bottom of the scrollable area (and not scroll with it).
        */}
        <div className="nuclide-console-scroll-pane-wrapper">
          <div
            ref={this._handleScrollPane}
            className="nuclide-console-scroll-pane"
            onScroll={this._handleScroll}>
            <OutputTable
              records={this.props.records}
              showSourceLabels={!this.props.selectedSourceId}
              getExecutor={id => this.props.executors.get(id)}
            />
          </div>
          <UnseenMessagesNotification
            visible={this.state.unseenMessages}
            onClick={this._scrollToBottom}
          />
        </div>
        {this._renderPrompt()}
      </div>
    );
  }

  _renderPrompt(): ?React.Element<any> {
    const {currentExecutor} = this.props;
    if (currentExecutor == null) {
      return;
    }
    return (
      <div className="nuclide-console-prompt">
        {this._renderPromptButton()}
        <InputArea
          scopeName={currentExecutor.scopeName}
          onSubmit={this.props.execute}
        />
      </div>
    );
  }

  _handleScroll(event: SyntheticMouseEvent): void {
    this._userIsScrolling = true;
    this._handleScrollEnd();
  }

  _handleScrollEnd(): void {
    this._userIsScrolling = false;

    if (!this._scrollPane) {
      return;
    }

    const {scrollTop, scrollHeight, offsetHeight} = this._scrollPane;
    this._isScrolledToBottom = scrollHeight - (offsetHeight + scrollTop) < 5;
    this.setState({unseenMessages: this.state.unseenMessages && !this._isScrolledToBottom});
  }

  _handleScrollPane(el: HTMLElement): void {
    this._scrollPane = el;
    this._autoscroll();
  }

  _scrollToBottom(): void {
    if (!this._scrollPane) {
      return;
    }
    // TODO: Animate?
    this._scrollPane.scrollTop = this._scrollPane.scrollHeight;
  }

  /**
   * Scroll to the bottom of the list if autoscroll is active.
   */
  _autoscroll(): void {
    if (!this._scrollPane || this._userIsScrolling || !this._isScrolledToBottom) {
      return;
    }
    this._scrollToBottom();
  }

}
