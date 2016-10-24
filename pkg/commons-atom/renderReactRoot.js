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
import ReactMountRootElement from '../nuclide-ui/ReactMountRootElement';

/**
 * Create a DOM element and mount the React element in it. It will be unmounted when the node is
 * detached.
 */
export function renderReactRoot(reactElement: React.Element<any>): HTMLElement {
  const element = new ReactMountRootElement();
  element.setReactElement(reactElement);
  return element;
}
