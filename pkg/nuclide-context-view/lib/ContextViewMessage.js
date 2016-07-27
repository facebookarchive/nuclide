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

export const NO_DEFINITION_MESSAGE = 'No definition selected.';
export const LOADING_MESSAGE = 'Loading...';

type Props = {
  message: string,
};

/** A message view to be shown in Context View. */
export const ContextViewMessage = (props: Props) => (
  <div>{props.message}</div>
);
