'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Record, Executor} from './types';

import {array, debounce} from '../../nuclide-commons';
import {React} from 'react-for-atom';
import OutputTable from './OutputTable';
import ConsoleHeader from './ConsoleHeader';
import InputArea from './InputArea';
import PromptButton from './PromptButton';
import RecordView from './RecordView';
import invariant from 'assert';

type Props = {
  records: Array<Record>;
  clearRecords: () => void;
  execute: (code: string) => void;
  currentExecutor: ?Executor;
  executors: Map<string, Executor>;
  selectExecutor: (executorId: string) => void;
};

export default class Console extends React.Component {
  props: Props;

  _isScrolledToBottom: boolean;
  _scrollPane: ?HTMLElement;
  _userIsScrolling: boolean;

  constructor(props: Props) {
    super(props);
    this._isScrolledToBottom = true;
    this._userIsScrolling = false;
    (this: any)._handleScrollPane = this._handleScrollPane.bind(this);
    (this: any)._handleScroll = this._handleScroll.bind(this);
    (this: any)._handleScrollEnd = debounce(this._handleScrollEnd, 100);
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

  _renderPromptButton(): ReactElement {
    invariant(this.props.currentExecutor != null);
    const {currentExecutor} = this.props;
    const options = array.from(this.props.executors.values())
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

  render(): ?ReactElement {
    return (
      <div className="nuclide-console">
        <ConsoleHeader clear={this.props.clearRecords} />
        <div
          ref={this._handleScrollPane}
          className="nuclide-console-scroll-pane"
          onScroll={this._handleScroll}>
          <OutputTable records={this.props.records} />
          {this._renderPrompt()}
        </div>
      </div>
    );
  }

  _renderPrompt(): ?ReactElement {
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
  }

  _handleScrollPane(el: HTMLElement): void {
    this._scrollPane = el;
    this._autoscroll();
  }

  _renderRow(record: Record, index: number): ReactElement {
    return <RecordView key={index} record={record} />;
  }

  /**
   * Scroll to the bottom of the list if autoscroll is active.
   */
  _autoscroll(): void {
    if (!this._scrollPane || this._userIsScrolling || !this._isScrolledToBottom) {
      return;
    }
    this._scrollPane.scrollTop = this._scrollPane.scrollHeight;
  }

}
