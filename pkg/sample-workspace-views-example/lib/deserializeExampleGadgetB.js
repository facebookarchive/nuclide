'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {ExampleGadgetB} from './ExampleGadgetB';
import {viewableFromReactElement} from '../../commons-atom/viewableFromReactElement';
import {React} from 'react-for-atom';

export default function deserializeExampleGadgetB() {
  return viewableFromReactElement(<ExampleGadgetB />);
}
