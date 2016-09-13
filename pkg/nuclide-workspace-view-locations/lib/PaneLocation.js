'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Viewable} from '../../nuclide-workspace-views/lib/types';
import UniversalDisposable from '../../commons-node/UniversalDisposable';
import {observePanes} from './observePanes';
import {syncPaneItemVisibility} from './syncPaneItemVisibility';
import {Observable} from 'rxjs';

export class PaneLocation {
  _disposables: IDisposable;

  constructor() {
    this._disposables = new UniversalDisposable(
      syncPaneItemVisibility(observePanes(atom.workspace.paneContainer), Observable.of(true)),
    );
  }

  addItem(item: Viewable): void {
    atom.workspace.getActivePane().addItem(item);
  }

  /**
   * The PaneLocation is a little special. Since it delegates all of the work to Atom, it doesn't
   * actually manage all of its own state. A viewable added to this location in a previous session
   * (and then serialized and deserialized) is indistinguishable from a pane item added via other
   * means, so we'll be conservative but predictable and not destroy any items.
   */
  destroy(): void {
    this._disposables.dispose();
  }

  destroyItem(item: Object): void {
    const pane = atom.workspace.paneForItem(item);
    if (pane != null) {
      pane.destroyItem(item);
    }
  }

  getItems(): Array<Viewable> {
    return atom.workspace.getPaneItems();
  }

  _destroyItem(item: Viewable): void {
    // The user may have split since adding, so find the item first.
    const pane = atom.workspace.paneForItem(item);
    if (pane != null) {
      pane.destroyItem(item);
    }
  }

  hideItem(item: Viewable): void {
    this.destroyItem(item);
  }

  itemIsVisible(item: Viewable): boolean {
    const pane = atom.workspace.paneForItem(item);
    return pane != null && pane.getActiveItem() === item;
  }

  showItem(item: Viewable): void {
    let pane = atom.workspace.paneForItem(item);
    if (pane == null) {
      pane = atom.workspace.getActivePane();
      pane.addItem(item);
    }
    pane.activate();
    pane.activateItem(item);
  }

  serialize(): ?Object {
    // We rely on the default Atom serialization for Panes.
    return null;
  }
}
