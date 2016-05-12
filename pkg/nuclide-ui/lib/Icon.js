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

type Props = {
  /** Valid octicon icon name, without the `icon-` prefix. E.g. `'arrow-up'` */
  icon: Octicon;
  className?: string;
  /** Optional text content to render next to the icon. */
  children?: string;
};

/**
 * Renders an icon with optional text next to it.
 */
export const Icon = (props: Props) => {
  const {
    icon,
    children,
    className,
    ...remainingProps,
  } = props;
  const newClassName = classnames(
    className,
    {
      [`icon icon-${icon}`]: icon != null,
    },
  );
  return (
    <span className={newClassName} {...remainingProps}>
      {children}
    </span>
  );
};
