'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Observable} from '@reactivex/rxjs';
import type {OutlineForUi} from '..';

import {React, ReactDOM} from 'react-for-atom';
import invariant from 'assert';

import {track} from '../../nuclide-analytics';
import {PanelComponent} from '../../nuclide-ui/lib/PanelComponent';
import {PanelComponentScroller} from '../../nuclide-ui/lib/PanelComponentScroller';
import {
  Button,
  ButtonSizes,
} from '../../nuclide-ui/lib/Button';
import {OutlineView} from './OutlineView';

export class OutlineViewPanelState {
  _outlines: Observable<OutlineForUi>;
  _outlineViewPanel: ?OutlineViewPanel;
  _width: number;

  constructor(outlines: Observable<OutlineForUi>, width: number, visible: boolean) {
    this._outlines = outlines;
    this._outlineViewPanel = null;
    this._width = width;

    if (visible) {
      this._show();
    }
  }

  dispose(): void {
    if (this.isVisible()) {
      this._destroyPanel();
    }
  }

  toggle(): void {
    if (this.isVisible()) {
      this._hide();
    } else {
      this._show();
    }
  }

  show(): void {
    if (!this.isVisible()) {
      this._show();
    }
  }

  hide(): void {
    if (this.isVisible()) {
      this._hide();
    }
  }

  getWidth(): number {
    return this._width;
  }

  isVisible(): boolean {
    return this._outlineViewPanel != null;
  }

  _show(): void {
    invariant(this._outlineViewPanel == null);

    track('nuclide-outline-view-show');

    this._outlineViewPanel = new OutlineViewPanel(
      this._outlines,
      this._width,
      this._onResize.bind(this),
    );
  }

  _hide(): void {
    this._destroyPanel();
  }

  _destroyPanel(): void {
    const outlineViewPanel = this._outlineViewPanel;
    invariant(outlineViewPanel != null);

    outlineViewPanel.dispose();
    this._outlineViewPanel = null;
  }

  _onResize(newWidth: number): void {
    this._width = newWidth;
  }
}

class OutlineViewPanel {
  _panelDOMElement: HTMLElement;
  _panel: atom$Panel;

  constructor(
    outlines: Observable<OutlineForUi>,
    initialWidth: number,
    onResize: (width: number) => void,
  ) {
    this._panelDOMElement = document.createElement('div');
    // Otherwise it does not fill the whole panel, which might be alright except it means that the
    // resize-handle doesn't extend all the way to the bottom.
    //
    // Use 'flex' to fit Atom v1.6.0+ and `height: inherit` to fit Atom <v1.6.0. The latter uses
    // `height: 100%;` down the hierarchy and becomes innocuous in 1.6.0 because inheriting will
    // give `height: auto;`.
    this._panelDOMElement.style.display = 'flex';
    this._panelDOMElement.style.height = 'inherit';

    ReactDOM.render(
      <PanelComponent
        dock="right"
        initialLength={initialWidth}
        noScroll
        onResize={onResize}>
        <div style={{display: 'flex', flexDirection: 'column', 'width': '100%'}}>
          <OutlineViewHeader />
          <PanelComponentScroller>
            <OutlineView outlines={outlines} />
          </PanelComponentScroller>
        </div>
      </PanelComponent>,
      this._panelDOMElement,
    );
    this._panel = atom.workspace.addRightPanel({
      item: this._panelDOMElement,
      priority: 200,
    });
  }

  dispose(): void {
    ReactDOM.unmountComponentAtNode(this._panelDOMElement);
    this._panel.destroy();
  }
}

class OutlineViewHeader extends React.Component {
  render(): React.Element {
    return (
      // Because the container is flex, prevent this header from shrinking smaller than its
      // contents. The default for flex children is to shrink as needed.
      <div className="panel-heading" style={{flexShrink: 0}}>
        <span className="icon icon-list-unordered" />
        Outline View
        <Button
          className="pull-right nuclide-outline-view-close-button"
          size={ButtonSizes.EXTRA_SMALL}
          icon="x"
          onClick={hideOutlineView}
          title="Hide Outline View"
        />
      </div>
    );
  }
}

function hideOutlineView() {
  atom.commands.dispatch(
    atom.views.getView(atom.workspace),
    'nuclide-outline-view:hide'
  );
}
