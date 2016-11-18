'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {React} from 'react-for-atom';
import {relativeDate} from '../commons-node/string';

type DefaultProps = {
  delay: number,
  shorten: boolean,
};
type Props = DefaultProps & {
  date: Date,
  delay?: number,
  shorten?: boolean,
};
const DEFAULT_RERENDER_DELAY = 10000; // ms

/**
 * Renders a relative date that forces a re-render every `delay` ms,
 * in order to properly update the UI.
 *
 * Does not respond to changes to the initial `delay` for simplicity's sake.
 */
export default class Revision extends React.Component {
  props: Props;
  _interval: ?number;

  static defaultProps: DefaultProps = {
    delay: DEFAULT_RERENDER_DELAY,
    shorten: false,
  }

  componentDidMount(): void {
    const {delay} = this.props;
    this._interval = setInterval(
      () => this.forceUpdate(),
      delay,
    );
  }

  componentWillUnmount(): void {
    if (this._interval != null) {
      clearInterval(this._interval);
    }
  }

  render(): React.Element<any> {
    const {
      date,
      shorten,
      ...remainingProps
    } = this.props;
    return <span {...remainingProps}>{relativeDate(date, undefined, shorten)}</span>;
  }
}
