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

type Props = {
  children: ReactElement;
};

/**
 * Visually groups Buttons passed in as children.
 */
export const ButtonToolbar = (props: Props) => {
  return (
    <div className="btn-toolbar">
      {props.children}
    </div>
  );
};
