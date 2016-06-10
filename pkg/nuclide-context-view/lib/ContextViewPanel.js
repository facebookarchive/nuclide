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

import {PanelComponent} from '../../nuclide-ui/lib/PanelComponent';

export class ContextViewPanel {
  _panelDOMElement: HTMLElement;

  constructor(initialWidth: number) {

    this._panelDOMElement = document.createElement('div');
    ReactDOM.render(
      <PanelComponent
      dock="right"
      initialLength={initialWidth}>
        <div>Hello world</div>
      </PanelComponent>,
      this._panelDOMElement
    );
  }

  dispose(): void {
    ReactDOM.unmountComponentAtNode(this._panelDOMElement);
  }
}
