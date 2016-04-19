'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Octicon} from './Octicons';

import classnames from 'classnames';
import {React} from 'react-for-atom';

type ButtonType = 'PRIMARY' | 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
type ButtonSize = 'EXTRA_SMALL' | 'SMALL' | 'LARGE';

type Props = {
  /** Octicon icon name, without the `icon-` prefix. E.g. `'arrow-up'` */
  icon?: Octicon;
  /** Optional specifier for special buttons, e.g. primary, info, success or error buttons. */
  buttonType?: ButtonType;
  selected?: boolean;
  /**  */
  size?: ButtonSize;
  className?: string;
  /** The button's content; generally a string. */
  children: React.Element;
};

export const ButtonSizes = Object.freeze({
  EXTRA_SMALL: 'EXTRA_SMALL',
  SMALL: 'SMALL',
  LARGE: 'LARGE',
});

export const ButtonTypes = Object.freeze({
  PRIMARY: 'PRIMARY',
  INFO: 'INFO',
  SUCCESS: 'SUCCESS',
  WARNING: 'WARNING',
  ERROR: 'ERROR',
});

const ButtonSizeClassnames = Object.freeze({
  EXTRA_SMALL: 'btn-xs',
  SMALL: 'btn-sm',
  LARGE: 'btn-lg',
});

const ButtonTypeClassnames = Object.freeze({
  PRIMARY: 'btn-primary',
  INFO: 'btn-info',
  SUCCESS: 'btn-success',
  WARNING: 'btn-warning',
  ERROR: 'btn-error',
});

/**
 * Generic Button wrapper.
 */
export const Button = (props: Props) => {
  const {
    icon,
    buttonType,
    selected,
    size,
    children,
    className,
    ...remainingProps,
  } = props;
  const sizeClassname = size == null ? '' : ButtonSizeClassnames[size] || '';
  const buttonTypeClassname = buttonType == null ? '' : ButtonTypeClassnames[buttonType] || '';
  const newClassName = classnames(
    className,
    'btn',
    {
      [`icon icon-${icon}`]: icon != null,
      [sizeClassname]: size != null,
      selected,
      [buttonTypeClassname]:  buttonType != null,
    },
  );
  return (
    <div className={newClassName} {...remainingProps}>
      {children}
    </div>
  );
};
