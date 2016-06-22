Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

exports.default = findOrCreatePaneItemLocation;

/**
 * Find the pane specified by the given string to which we can add an item. This is similar to
 * Atom's `Pane::findOrCreateXmostSibling` methods, but these positions are absolute (i.e. don't
 * depend on the active pane).
 */

function findOrCreatePaneItemLocation(location) {
  if (location === 'active-pane') {
    return atom.workspace.getActivePane();
  }

  var paneContainer = atom.workspace.paneContainer;
  var root = paneContainer.getRoot();

  // A nasty hack since Atom doesn't export this module.
  var Pane = atom.workspace.getPanes()[0].constructor;

  if (root.orientation) {

    // The root is a PaneAxis (it's already split).

    // Get the PaneAxis constructor, since Atom doesn't expose it.
    var PaneAxis = root.constructor;

    var orientation = getOrientation(location);
    var side = getSide(location);

    // If the axis is oriented the same way as the split, and the container that we're going to add
    // our item to isn't split itself, return an existing pane.
    if (root.orientation === getOrientation(location)) {
      var children = root.getChildren();
      var child = side === 'before' ? children[0] : children[children.length - 1];
      if (child && child instanceof Pane) {
        return child;
      }
    }

    // If the axis isn't in the same direction as the split, things get tricky. We need to create a
    // new Pane and then wrap it and the existing PaneAxis in a new PaneAxis. Note that this means
    // if you alternate orientations (vertical -> horizontal -> vertical -> etc.), you're going to
    // keep nesting your workspace deeper and deeper. We decided to go with this for now since it's
    // fairly understandable behavior for the end-user and easy to "correct" (by dragging and
    // dropping) if it's not the desired result. We may revisit and try to do something more clever
    // later.
    var pane = new Pane({
      applicationDelegate: paneContainer.applicationDelegate,
      deserializerManager: paneContainer.deserializerManager,
      config: paneContainer.config
    });
    var paneAxis = new PaneAxis({
      container: root.getContainer(),
      orientation: orientation,
      children: [pane],
      flexScale: 1
    });

    // Replace the old pane axis with our new one and add the old one as a child to it.
    root.getParent().replaceChild(root, paneAxis);
    paneAxis.addChild(root, side === 'before' ? 1 : 0);

    return pane;
  }

  // The root is a Pane (it isn't split yet).
  var direction = location;
  return splitInDirection(root, direction);
}

/**
 * Splits the given pane in the specified direction and return the new pane.
 */
function splitInDirection(pane, direction) {
  switch (direction) {
    case 'top':
      return pane.splitUp();
    case 'bottom':
      return pane.splitDown();
    case 'left':
      return pane.splitLeft();
    case 'right':
      return pane.splitRight();
    default:
      throw new Error(direction + ' is not a valid direction.');
  }
}

function getOrientation(location) {
  switch (location) {
    case 'top':
    case 'bottom':
      return 'vertical';
    case 'left':
    case 'right':
      return 'horizontal';
  }
}

function getSide(location) {
  switch (location) {
    case 'top':
    case 'left':
      return 'before';
    case 'bottom':
    case 'right':
      return 'after';
  }
}
module.exports = exports.default;