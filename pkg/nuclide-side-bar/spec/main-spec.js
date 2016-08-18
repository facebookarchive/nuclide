'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as NuclideSideBar from '..';
import {React} from 'react-for-atom';

class CoolerBarView extends React.Component {
  render() {
    return <div className="cooler-bar-view" tabIndex={0}>Bye, Side Bar</div>;
  }
}

class FocusDelegateView extends React.Component {
  render() {
    return (
      <div className="focus-delegate-view" tabIndex={0}>
        <div className="focus-delegate-view-delegate" tabIndex={0} />
      </div>
    );
  }
}

class SideBarView extends React.Component {
  render() {
    return <div className="side-bar-view" tabIndex={0}>Howdy, Side Bar</div>;
  }
}

const COOLER_BAR = {
  getComponent() { return CoolerBarView; },
  onDidShow() {},
  title: 'Cooler Bar',
  toggleCommand: 'cooler-bar-view:toggle',
  viewId: 'cooler-bar-view',
};

const FOCUS_DELEGATE = {
  getComponent() { return FocusDelegateView; },
  onDidShow() {},
  title: 'Focus Delegate',
  toggleCommand: 'focus-delegate-view:toggle',
  viewId: 'focus-delegate-view',
};

const SIDE_BAR = {
  getComponent() { return SideBarView; },
  onDidShow() {},
  title: 'Side Bar',
  toggleCommand: 'side-bar-view:toggle',
  viewId: 'side-bar-view',
};

describe('nuclide-side-bar main', () => {
  let workspaceElement;

  function hideView(view) {
    atom.commands.dispatch(
      workspaceElement,
      view.toggleCommand,
      {display: false},
    );
  }

  function showView(view) {
    atom.commands.dispatch(
      workspaceElement,
      view.toggleCommand,
      {display: true},
    );
  }

  beforeEach(() => {
    workspaceElement = atom.views.getView(atom.workspace);
    jasmine.attachToDOM(workspaceElement);
    spyOn(Date, 'now').andCallFake(() => window.now);

    waitsForPromise(() => {
      return atom.packages.activatePackage('nuclide-side-bar');
    });
  });

  afterEach(() => {
    // Ensure no lingering debounced renders are waiting and will muck with the state of the package
    // between test runs.
    advanceClock(500);
  });

  it('renders a view object when its toggle event is dispatched', () => {
    const sideBarService = NuclideSideBar.provideNuclideSideBar();
    sideBarService.registerView(SIDE_BAR);

    // render
    advanceClock(500);

    // Show the view
    showView(SIDE_BAR);

    // Should be present in the DOM.
    expect(document.querySelectorAll('.side-bar-view').length).toEqual(1);
  });

  it('focuses a view when its toggle event is dispatched', () => {
    const sideBarService = NuclideSideBar.provideNuclideSideBar();
    sideBarService.registerView(SIDE_BAR);

    // render
    advanceClock(500);

    let didShow = false;
    spyOn(SIDE_BAR, 'onDidShow').andCallFake(() => {
      // Should be the active element.
      expect(document.querySelector('.side-bar-view')).toEqual(document.activeElement);
      didShow = true;
    });

    runs(() => {
      // Do a full toggle, hide and then show, so focus logic is guaranteed to happen.
      hideView(SIDE_BAR);

      // render
      advanceClock(500);

      showView(SIDE_BAR);
    });

    waitsFor(() => {
      return didShow;
    }, 'The side bar should have been focused', 200);
  });

  it('blurs a view when one of its descendants has focus', () => {
    const sideBarService = NuclideSideBar.provideNuclideSideBar();
    sideBarService.registerView(FOCUS_DELEGATE);

    // render
    advanceClock(500);

    // Give a descendant focus
    document.querySelector('.focus-delegate-view-delegate').focus();
    expect(document.activeElement).toEqual(document.querySelector('.focus-delegate-view-delegate'));

    atom.commands.dispatch(workspaceElement, 'nuclide-side-bar:toggle-focus');
    expect(document.activeElement).toEqual(atom.views.getView(atom.workspace.getActivePane()));
  });

  it('replaces a view object when another view is displayed', () => {
    const sideBarService = NuclideSideBar.provideNuclideSideBar();
    sideBarService.registerView(SIDE_BAR);

    // render
    advanceClock(500);

    showView(SIDE_BAR);
    sideBarService.registerView(COOLER_BAR);

    // render
    advanceClock(500);

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

    // render
    advanceClock(500);

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

    // render
    advanceClock(500);

    showView(SIDE_BAR);
    sideBarService.registerView(COOLER_BAR);

    // Destroy side-bar-view, the active view.
    sideBarService.destroyView('side-bar-view');

    // render
    advanceClock(500);

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

  it('maintains the last active (user-selected) view when views are destroyed', () => {
    const sideBarService = NuclideSideBar.provideNuclideSideBar();
    sideBarService.registerView(SIDE_BAR);
    showView(SIDE_BAR);
    sideBarService.registerView(COOLER_BAR);
    showView(COOLER_BAR);

    sideBarService.destroyView(COOLER_BAR.viewId);
    sideBarService.destroyView(SIDE_BAR.viewId);

    expect(NuclideSideBar.serialize()).toEqual({
      activeViewId: COOLER_BAR.viewId,
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

    // render
    advanceClock(500);

    showView(SIDE_BAR);

    sideBarService.registerView(COOLER_BAR);

    // render
    advanceClock(500);

    showView(COOLER_BAR);
    expect(COOLER_BAR.onDidShow).toHaveBeenCalled();
  });

  it("calls a view's `onDidShow` when the side bar becomes visible", () => {
    const sideBarService = NuclideSideBar.provideNuclideSideBar();

    // Ensure the side bar is hidden to start
    atom.commands.dispatch(workspaceElement, 'nuclide-side-bar:toggle', {display: false});

    // render
    advanceClock(500);

    spyOn(SIDE_BAR, 'onDidShow');
    sideBarService.registerView(SIDE_BAR);

    // render
    advanceClock(500);

    // Show the side bar.
    atom.commands.dispatch(workspaceElement, 'nuclide-side-bar:toggle', {display: true});

    // render
    advanceClock(500);

    expect(SIDE_BAR.onDidShow).toHaveBeenCalled();
  });
});
