'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/* eslint-disable react/prop-types */

import type {Record} from './types';

import {debounce} from '../../commons';
import {React} from 'react-for-atom';
import RecordView from './RecordView';

type Props = {
  records: Array<Record>;
  clearRecords: () => void;
};

export default class OutputTable extends React.Component<void, Props, void> {

  _isScrolledToBottom: boolean;
  _tableWrapper: ?HTMLElement;
  _userIsScrolling: boolean;

  constructor(props: Props) {
    super(props);
    this._isScrolledToBottom = true;
    this._userIsScrolling = false;
    (this: any)._handleClearButtonClick = this._handleClearButtonClick.bind(this);
    (this: any)._handleTableWrapper = this._handleTableWrapper.bind(this);
    (this: any)._handleScroll = this._handleScroll.bind(this);
    (this: any)._handleScrollEnd = debounce(this._handleScrollEnd, 100);
  }

  componentDidUpdate(prevProps: Props): void {
    // If records are added while we're scrolled to the bottom (or very very close, at least),
    // automatically scroll.
    if (this.props.records.length !== prevProps.records.length) {
      this._autoscroll();
    }
  }

  render(): ?ReactElement {
    return (
      <div className="nuclide-output">
        <div className="nuclide-output-header padded">
          <button
            className="btn btn-sm icon inline-block btn-secondary pull-right"
            onClick={this._handleClearButtonClick}
          >
            Clear
          </button>
        </div>
        <div
          className="nuclide-output-table-wrapper"
          ref={this._handleTableWrapper}
          onScroll={this._handleScroll}
        >
          {this.props.records.map(this._renderRow, this)}
        </div>
      </div>
    );
  }

  _handleScroll(event: SyntheticMouseEvent): void {
    this._userIsScrolling = true;
    this._handleScrollEnd();
  }

  _handleScrollEnd(): void {
    this._userIsScrolling = false;

    if (!this._tableWrapper) {
      return;
    }

    const {scrollTop, scrollHeight, offsetHeight} = this._tableWrapper;
    this._isScrolledToBottom = scrollHeight - (offsetHeight + scrollTop) < 5;
  }

  _handleTableWrapper(el: HTMLElement): void {
    this._tableWrapper = el;
    this._autoscroll();
  }

  _renderRow(record: Record, index: number): ReactElement {
    return <RecordView key={index} record={record} />;
  }

  /**
   * Scroll to the bottom of the list if autoscroll is active.
   */
  _autoscroll(): void {
    if (!this._tableWrapper || this._userIsScrolling || !this._isScrolledToBottom) {
      return;
    }
    this._tableWrapper.scrollTop = this._tableWrapper.scrollHeight;
  }

  _handleClearButtonClick(event: SyntheticMouseEvent): void {
    this._isScrolledToBottom = true;
    this.props.clearRecords();
  }

}
