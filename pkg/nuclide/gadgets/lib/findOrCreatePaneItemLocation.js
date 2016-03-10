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

exports['default'] = findOrCreatePaneItemLocation;

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
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbmRPckNyZWF0ZVBhbmVJdGVtTG9jYXRpb24uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O3FCQW9Cd0IsNEJBQTRCOzs7Ozs7OztBQUFyQyxTQUFTLDRCQUE0QixDQUFDLFFBQXdCLEVBQWE7QUFDeEYsTUFBSSxRQUFRLEtBQUssYUFBYSxFQUFFO0FBQzlCLFdBQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLEVBQUUsQ0FBQztHQUN2Qzs7QUFFRCxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQztBQUNuRCxNQUFNLElBQUksR0FBRyxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUM7OztBQUdyQyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQzs7QUFFdEQsTUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFOzs7OztBQUtwQixRQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDOztBQUVsQyxRQUFNLFdBQVcsR0FBRyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDN0MsUUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDOzs7O0FBSS9CLFFBQUksSUFBSSxDQUFDLFdBQVcsS0FBSyxjQUFjLENBQUMsUUFBUSxDQUFDLEVBQUU7QUFDakQsVUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBQ3BDLFVBQU0sS0FBSyxHQUFHLElBQUksS0FBSyxRQUFRLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQzlFLFVBQUksS0FBSyxJQUFJLEtBQUssWUFBWSxJQUFJLEVBQUU7QUFDbEMsZUFBTyxLQUFLLENBQUM7T0FDZDtLQUNGOzs7Ozs7Ozs7QUFTRCxRQUFNLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQztBQUNwQix5QkFBbUIsRUFBRSxhQUFhLENBQUMsbUJBQW1CO0FBQ3RELHlCQUFtQixFQUFFLGFBQWEsQ0FBQyxtQkFBbUI7QUFDdEQsWUFBTSxFQUFFLGFBQWEsQ0FBQyxNQUFNO0tBQzdCLENBQUMsQ0FBQztBQUNILFFBQU0sUUFBUSxHQUFHLElBQUksUUFBUSxDQUFDO0FBQzVCLGVBQVMsRUFBRSxJQUFJLENBQUMsWUFBWSxFQUFFO0FBQzlCLGlCQUFXLEVBQVgsV0FBVztBQUNYLGNBQVEsRUFBRSxDQUFDLElBQUksQ0FBQztBQUNoQixlQUFTLEVBQUUsQ0FBQztLQUNiLENBQUMsQ0FBQzs7O0FBR0gsUUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDOUMsWUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsSUFBSSxLQUFLLFFBQVEsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7O0FBRW5ELFdBQU8sSUFBSSxDQUFDO0dBRWI7OztBQUdELE1BQU0sU0FBUyxHQUFLLFFBQVEsQUFBa0IsQ0FBQztBQUMvQyxTQUFPLGdCQUFnQixDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztDQUMxQzs7Ozs7QUFLRCxTQUFTLGdCQUFnQixDQUFDLElBQWUsRUFBRSxTQUFvQixFQUFhO0FBQzFFLFVBQVEsU0FBUztBQUNmLFNBQUssS0FBSztBQUNSLGFBQU8sSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQUEsQUFDeEIsU0FBSyxRQUFRO0FBQ1gsYUFBTyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7QUFBQSxBQUMxQixTQUFLLE1BQU07QUFDVCxhQUFPLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUFBLEFBQzFCLFNBQUssT0FBTztBQUNWLGFBQU8sSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO0FBQUEsQUFDM0I7QUFDRSxZQUFNLElBQUksS0FBSyxDQUFJLFNBQVMsZ0NBQTZCLENBQUM7QUFBQSxHQUM3RDtDQUNGOztBQUVELFNBQVMsY0FBYyxDQUFDLFFBQVEsRUFBRTtBQUNoQyxVQUFRLFFBQVE7QUFDZCxTQUFLLEtBQUssQ0FBQztBQUNYLFNBQUssUUFBUTtBQUNYLGFBQU8sVUFBVSxDQUFDO0FBQUEsQUFDcEIsU0FBSyxNQUFNLENBQUM7QUFDWixTQUFLLE9BQU87QUFDVixhQUFPLFlBQVksQ0FBQztBQUFBLEdBQ3ZCO0NBQ0Y7O0FBRUQsU0FBUyxPQUFPLENBQUMsUUFBUSxFQUFFO0FBQ3pCLFVBQVEsUUFBUTtBQUNkLFNBQUssS0FBSyxDQUFDO0FBQ1gsU0FBSyxNQUFNO0FBQ1QsYUFBTyxRQUFRLENBQUM7QUFBQSxBQUNsQixTQUFLLFFBQVEsQ0FBQztBQUNkLFNBQUssT0FBTztBQUNWLGFBQU8sT0FBTyxDQUFDO0FBQUEsR0FDbEI7Q0FDRiIsImZpbGUiOiJmaW5kT3JDcmVhdGVQYW5lSXRlbUxvY2F0aW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0dhZGdldExvY2F0aW9ufSBmcm9tICcuLi8uLi9nYWRnZXRzLWludGVyZmFjZXMnO1xuXG50eXBlIERpcmVjdGlvbiA9ICd0b3AnIHwgJ3JpZ2h0JyB8ICdib3R0b20nIHwgJ2xlZnQnO1xuXG4vKipcbiAqIEZpbmQgdGhlIHBhbmUgc3BlY2lmaWVkIGJ5IHRoZSBnaXZlbiBzdHJpbmcgdG8gd2hpY2ggd2UgY2FuIGFkZCBhbiBpdGVtLiBUaGlzIGlzIHNpbWlsYXIgdG9cbiAqIEF0b20ncyBgUGFuZTo6ZmluZE9yQ3JlYXRlWG1vc3RTaWJsaW5nYCBtZXRob2RzLCBidXQgdGhlc2UgcG9zaXRpb25zIGFyZSBhYnNvbHV0ZSAoaS5lLiBkb24ndFxuICogZGVwZW5kIG9uIHRoZSBhY3RpdmUgcGFuZSkuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGZpbmRPckNyZWF0ZVBhbmVJdGVtTG9jYXRpb24obG9jYXRpb246IEdhZGdldExvY2F0aW9uKTogYXRvbSRQYW5lIHtcbiAgaWYgKGxvY2F0aW9uID09PSAnYWN0aXZlLXBhbmUnKSB7XG4gICAgcmV0dXJuIGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKTtcbiAgfVxuXG4gIGNvbnN0IHBhbmVDb250YWluZXIgPSBhdG9tLndvcmtzcGFjZS5wYW5lQ29udGFpbmVyO1xuICBjb25zdCByb290ID0gcGFuZUNvbnRhaW5lci5nZXRSb290KCk7XG5cbiAgLy8gQSBuYXN0eSBoYWNrIHNpbmNlIEF0b20gZG9lc24ndCBleHBvcnQgdGhpcyBtb2R1bGUuXG4gIGNvbnN0IFBhbmUgPSBhdG9tLndvcmtzcGFjZS5nZXRQYW5lcygpWzBdLmNvbnN0cnVjdG9yO1xuXG4gIGlmIChyb290Lm9yaWVudGF0aW9uKSB7XG5cbiAgICAvLyBUaGUgcm9vdCBpcyBhIFBhbmVBeGlzIChpdCdzIGFscmVhZHkgc3BsaXQpLlxuXG4gICAgLy8gR2V0IHRoZSBQYW5lQXhpcyBjb25zdHJ1Y3Rvciwgc2luY2UgQXRvbSBkb2Vzbid0IGV4cG9zZSBpdC5cbiAgICBjb25zdCBQYW5lQXhpcyA9IHJvb3QuY29uc3RydWN0b3I7XG5cbiAgICBjb25zdCBvcmllbnRhdGlvbiA9IGdldE9yaWVudGF0aW9uKGxvY2F0aW9uKTtcbiAgICBjb25zdCBzaWRlID0gZ2V0U2lkZShsb2NhdGlvbik7XG5cbiAgICAvLyBJZiB0aGUgYXhpcyBpcyBvcmllbnRlZCB0aGUgc2FtZSB3YXkgYXMgdGhlIHNwbGl0LCBhbmQgdGhlIGNvbnRhaW5lciB0aGF0IHdlJ3JlIGdvaW5nIHRvIGFkZFxuICAgIC8vIG91ciBpdGVtIHRvIGlzbid0IHNwbGl0IGl0c2VsZiwgcmV0dXJuIGFuIGV4aXN0aW5nIHBhbmUuXG4gICAgaWYgKHJvb3Qub3JpZW50YXRpb24gPT09IGdldE9yaWVudGF0aW9uKGxvY2F0aW9uKSkge1xuICAgICAgY29uc3QgY2hpbGRyZW4gPSByb290LmdldENoaWxkcmVuKCk7XG4gICAgICBjb25zdCBjaGlsZCA9IHNpZGUgPT09ICdiZWZvcmUnID8gY2hpbGRyZW5bMF0gOiBjaGlsZHJlbltjaGlsZHJlbi5sZW5ndGggLSAxXTtcbiAgICAgIGlmIChjaGlsZCAmJiBjaGlsZCBpbnN0YW5jZW9mIFBhbmUpIHtcbiAgICAgICAgcmV0dXJuIGNoaWxkO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIElmIHRoZSBheGlzIGlzbid0IGluIHRoZSBzYW1lIGRpcmVjdGlvbiBhcyB0aGUgc3BsaXQsIHRoaW5ncyBnZXQgdHJpY2t5LiBXZSBuZWVkIHRvIGNyZWF0ZSBhXG4gICAgLy8gbmV3IFBhbmUgYW5kIHRoZW4gd3JhcCBpdCBhbmQgdGhlIGV4aXN0aW5nIFBhbmVBeGlzIGluIGEgbmV3IFBhbmVBeGlzLiBOb3RlIHRoYXQgdGhpcyBtZWFuc1xuICAgIC8vIGlmIHlvdSBhbHRlcm5hdGUgb3JpZW50YXRpb25zICh2ZXJ0aWNhbCAtPiBob3Jpem9udGFsIC0+IHZlcnRpY2FsIC0+IGV0Yy4pLCB5b3UncmUgZ29pbmcgdG9cbiAgICAvLyBrZWVwIG5lc3RpbmcgeW91ciB3b3Jrc3BhY2UgZGVlcGVyIGFuZCBkZWVwZXIuIFdlIGRlY2lkZWQgdG8gZ28gd2l0aCB0aGlzIGZvciBub3cgc2luY2UgaXQnc1xuICAgIC8vIGZhaXJseSB1bmRlcnN0YW5kYWJsZSBiZWhhdmlvciBmb3IgdGhlIGVuZC11c2VyIGFuZCBlYXN5IHRvIFwiY29ycmVjdFwiIChieSBkcmFnZ2luZyBhbmRcbiAgICAvLyBkcm9wcGluZykgaWYgaXQncyBub3QgdGhlIGRlc2lyZWQgcmVzdWx0LiBXZSBtYXkgcmV2aXNpdCBhbmQgdHJ5IHRvIGRvIHNvbWV0aGluZyBtb3JlIGNsZXZlclxuICAgIC8vIGxhdGVyLlxuICAgIGNvbnN0IHBhbmUgPSBuZXcgUGFuZSh7XG4gICAgICBhcHBsaWNhdGlvbkRlbGVnYXRlOiBwYW5lQ29udGFpbmVyLmFwcGxpY2F0aW9uRGVsZWdhdGUsXG4gICAgICBkZXNlcmlhbGl6ZXJNYW5hZ2VyOiBwYW5lQ29udGFpbmVyLmRlc2VyaWFsaXplck1hbmFnZXIsXG4gICAgICBjb25maWc6IHBhbmVDb250YWluZXIuY29uZmlnLFxuICAgIH0pO1xuICAgIGNvbnN0IHBhbmVBeGlzID0gbmV3IFBhbmVBeGlzKHtcbiAgICAgIGNvbnRhaW5lcjogcm9vdC5nZXRDb250YWluZXIoKSxcbiAgICAgIG9yaWVudGF0aW9uLFxuICAgICAgY2hpbGRyZW46IFtwYW5lXSxcbiAgICAgIGZsZXhTY2FsZTogMSxcbiAgICB9KTtcblxuICAgIC8vIFJlcGxhY2UgdGhlIG9sZCBwYW5lIGF4aXMgd2l0aCBvdXIgbmV3IG9uZSBhbmQgYWRkIHRoZSBvbGQgb25lIGFzIGEgY2hpbGQgdG8gaXQuXG4gICAgcm9vdC5nZXRQYXJlbnQoKS5yZXBsYWNlQ2hpbGQocm9vdCwgcGFuZUF4aXMpO1xuICAgIHBhbmVBeGlzLmFkZENoaWxkKHJvb3QsIHNpZGUgPT09ICdiZWZvcmUnID8gMSA6IDApO1xuXG4gICAgcmV0dXJuIHBhbmU7XG5cbiAgfVxuXG4gIC8vIFRoZSByb290IGlzIGEgUGFuZSAoaXQgaXNuJ3Qgc3BsaXQgeWV0KS5cbiAgY29uc3QgZGlyZWN0aW9uID0gKChsb2NhdGlvbjogYW55KTogRGlyZWN0aW9uKTtcbiAgcmV0dXJuIHNwbGl0SW5EaXJlY3Rpb24ocm9vdCwgZGlyZWN0aW9uKTtcbn1cblxuLyoqXG4gKiBTcGxpdHMgdGhlIGdpdmVuIHBhbmUgaW4gdGhlIHNwZWNpZmllZCBkaXJlY3Rpb24gYW5kIHJldHVybiB0aGUgbmV3IHBhbmUuXG4gKi9cbmZ1bmN0aW9uIHNwbGl0SW5EaXJlY3Rpb24ocGFuZTogYXRvbSRQYW5lLCBkaXJlY3Rpb246IERpcmVjdGlvbik6IGF0b20kUGFuZSB7XG4gIHN3aXRjaCAoZGlyZWN0aW9uKSB7XG4gICAgY2FzZSAndG9wJzpcbiAgICAgIHJldHVybiBwYW5lLnNwbGl0VXAoKTtcbiAgICBjYXNlICdib3R0b20nOlxuICAgICAgcmV0dXJuIHBhbmUuc3BsaXREb3duKCk7XG4gICAgY2FzZSAnbGVmdCc6XG4gICAgICByZXR1cm4gcGFuZS5zcGxpdExlZnQoKTtcbiAgICBjYXNlICdyaWdodCc6XG4gICAgICByZXR1cm4gcGFuZS5zcGxpdFJpZ2h0KCk7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcihgJHtkaXJlY3Rpb259IGlzIG5vdCBhIHZhbGlkIGRpcmVjdGlvbi5gKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRPcmllbnRhdGlvbihsb2NhdGlvbikge1xuICBzd2l0Y2ggKGxvY2F0aW9uKSB7XG4gICAgY2FzZSAndG9wJzpcbiAgICBjYXNlICdib3R0b20nOlxuICAgICAgcmV0dXJuICd2ZXJ0aWNhbCc7XG4gICAgY2FzZSAnbGVmdCc6XG4gICAgY2FzZSAncmlnaHQnOlxuICAgICAgcmV0dXJuICdob3Jpem9udGFsJztcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRTaWRlKGxvY2F0aW9uKSB7XG4gIHN3aXRjaCAobG9jYXRpb24pIHtcbiAgICBjYXNlICd0b3AnOlxuICAgIGNhc2UgJ2xlZnQnOlxuICAgICAgcmV0dXJuICdiZWZvcmUnO1xuICAgIGNhc2UgJ2JvdHRvbSc6XG4gICAgY2FzZSAncmlnaHQnOlxuICAgICAgcmV0dXJuICdhZnRlcic7XG4gIH1cbn1cbiJdfQ==