'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import classnames from 'classnames';
import {React} from 'react-for-atom';

type LoadingSpinnerSize = 'EXTRA_SMALL' | 'SMALL' | 'MEDIUM' | 'LARGE';
type Props = {
  className? : string;
  /** The size of the LoadingSpinner. Defaults to MEDIUM. */
  size?: LoadingSpinnerSize;
  /**
   * An optional delay (in milliseconds) between mounting the component and actually rendering
   * the spinner to avoid UI churn.
   */
  delay?: number;
};

export const LoadingSpinnerSizes = Object.freeze({
  EXTRA_SMALL: 'EXTRA_SMALL',
  SMALL: 'SMALL',
  MEDIUM: 'MEDIUM',
  LARGE: 'LARGE',
});

const LoadingSpinnerClassnames = Object.freeze({
  EXTRA_SMALL: 'loading-spinner-tiny',
  SMALL: 'loading-spinner-small',
  MEDIUM: 'loading-spinner-medium',
  LARGE: 'loading-spinner-large',
});

/**
 * Shows an indefinite, animated LoadingSpinner.
 */
export class LoadingSpinner extends React.Component {
  props: Props;
  state: {shouldRender: boolean};
  _timeout: ?number;

  constructor(props: Props) {
    super(props);
    this.state = {shouldRender: false};
  }

  componentDidMount(): void {
    const delay = this.props.delay == null ? 0 : this.props.delay;
    this._timeout = setTimeout(() => this.setState({shouldRender: true}), delay);
  }

  componentWillUnmount(): void {
    if (this._timeout != null) {
      clearTimeout(this._timeout);
    }
  }

  render(): ?React.Element<any> {
    const {
      className,
      size,
    } = this.props;
    if (!this.state.shouldRender) {
      return null;
    }
    const safeSize = size != null && LoadingSpinnerSizes.hasOwnProperty(size)
      ? size
      : LoadingSpinnerSizes.MEDIUM;
    const sizeClassname = LoadingSpinnerClassnames[safeSize];
    const newClassName = classnames(
      className,
      'loading',
      sizeClassname,
    );
    return (
      <div className={newClassName} />
    );
  }
}
