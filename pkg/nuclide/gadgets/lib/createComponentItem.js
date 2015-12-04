'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import React from 'react-for-atom';

/**
 * Create an object suitable for use as an Atom pane item from a React element.
 */
export default function createComponentItem(reactElement: ?ReactElement): HTMLElement {
  // In order to get the stateful object with the methods that Atom wants for items, we actually
  // have to mount it.
  const container = document.createElement('div');
  const mountedComponent = React.render(reactElement, container);

  // Add the element as a property of the mounted component. This is a special property that Atom's
  // view registry knows to look for. (See [View Resolution
  // Algorithm](https://atom.io/docs/api/v1.2.4/ViewRegistry#instance-getView) for more details.)
  mountedComponent.element = container;

  return mountedComponent;
}
