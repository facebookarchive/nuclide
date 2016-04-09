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
export const LoadingSpinner = (props: Props): ReactElement => {
  const {
    className,
    size,
  } = props;
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
};
