'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const NuclideSideBar = require('../lib/main');
const {React} = require('react-for-atom');

class SideBarView extends React.Component {
  render() {
    return <div className="side-bar-view">Howdy, Side Bar</div>;
  }
}

class CoolerBarView extends React.Component {
  render() {
    return <div className="cooler-bar-view">Bye, Side Bar</div>;
  }
}

const SIDE_BAR = {
  getComponent() { return SideBarView; },
  onDidShow() {},
  toggleCommand: 'side-bar-view:toggle',
  viewId: 'side-bar-view',
};

const COOLER_BAR = {
  getComponent() { return CoolerBarView; },
  onDidShow() {},
  toggleCommand: 'cooler-bar-view:toggle',
  viewId: 'cooler-bar-view',
};

describe('nuclide-side-bar main', () => {
  let workspaceElement;

  function showView(view) {
    atom.commands.dispatch(
      workspaceElement,
      view.toggleCommand,
      {display: true}
    );
  }

  beforeEach(() => {
    workspaceElement = atom.views.getView(atom.workspace);
    jasmine.attachToDOM(workspaceElement);

    waitsForPromise(() => {
      return atom.packages.activatePackage('nuclide-side-bar');
    });
  });

  it('renders a view object when its toggle event is dispatched', () => {
    const sideBarService = NuclideSideBar.provideNuclideSideBar();
    sideBarService.registerView(SIDE_BAR);

    // Show the view
    showView(SIDE_BAR);

    // Should be present in the DOM.
    expect(document.querySelectorAll('.side-bar-view').length).toEqual(1);
  });

  it('replaces a view object when another view is displayed', () => {
    const sideBarService = NuclideSideBar.provideNuclideSideBar();
    sideBarService.registerView(SIDE_BAR);
    showView(SIDE_BAR);
    sideBarService.registerView(COOLER_BAR);

    // Show the second view
    showView(COOLER_BAR);

    // First view should be gone.
    expect(document.querySelectorAll('.side-bar-view').length).toEqual(0);
    // Second view should be in the DOM.
    expect(document.querySelectorAll('.cooler-bar-view').length).toEqual(1);
  });

  it('re-shows a view when it has been replaced and re-requested', () => {
    const sideBarService = NuclideSideBar.provideNuclideSideBar();
    sideBarService.registerView(SIDE_BAR);
    showView(SIDE_BAR);
    sideBarService.registerView(COOLER_BAR);
    showView(COOLER_BAR);

    // Fire the first view's toggle again
    showView(SIDE_BAR);

    // First view should be visible again.
    expect(document.querySelectorAll('.side-bar-view').length).toEqual(1);
    // Second view should be gone.
    expect(document.querySelectorAll('.cooler-bar-view').length).toEqual(0);
  });

  it('shows the next possible view when the active one is destroyed', () => {
    const sideBarService = NuclideSideBar.provideNuclideSideBar();
    sideBarService.registerView(SIDE_BAR);
    showView(SIDE_BAR);
    sideBarService.registerView(COOLER_BAR);

    // Destroy side-bar-view, the active view.
    sideBarService.destroyView('side-bar-view');

    // The remaining view should be activated.
    expect(document.querySelectorAll('.cooler-bar-view').length).toEqual(1);
  });

  it('serializes the active view', () => {
    const sideBarService = NuclideSideBar.provideNuclideSideBar();
    sideBarService.registerView(SIDE_BAR);
    showView(SIDE_BAR);

    expect(NuclideSideBar.serialize()).toEqual({
      activeViewId: SIDE_BAR.viewId,
      hidden: false,
      // Hard-coded length from `main`. Empirically the minimum width needed to fit
      // 'nuclide-file-tree' buttons without causing overflow.
      initialLength: 240,
    });
  });

  it("calls a view's `onDidShow` when the active view changes", () => {
    const sideBarService = NuclideSideBar.provideNuclideSideBar();

    spyOn(COOLER_BAR, 'onDidShow');
    sideBarService.registerView(SIDE_BAR);
    showView(SIDE_BAR);
    sideBarService.registerView(COOLER_BAR);
    showView(COOLER_BAR);

    expect(COOLER_BAR.onDidShow).toHaveBeenCalled();
  });

  it("calls a view's `onDidShow` when the side bar becomes visible", () => {
    const sideBarService = NuclideSideBar.provideNuclideSideBar();

    // Ensure the side bar is hidden to start
    atom.commands.dispatch(workspaceElement, 'nuclide-side-bar:toggle', {display: false});

    spyOn(SIDE_BAR, 'onDidShow');
    sideBarService.registerView(SIDE_BAR);

    // Show the side bar.
    atom.commands.dispatch(workspaceElement, 'nuclide-side-bar:toggle', {display: true});

    expect(SIDE_BAR.onDidShow).toHaveBeenCalled();
  });
});
