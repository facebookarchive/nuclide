'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {React, ReactDOM} from 'react-for-atom';

export function createPanelItem(reactElement: React.Element<any>): Object {
  const element = document.createElement('div');
  const mounted = ReactDOM.render(reactElement, element);
  // Add the DOM element as the "element" property of the instance. (Atom looks for this.)
  (mounted: any).element = element;
  return mounted;
}
