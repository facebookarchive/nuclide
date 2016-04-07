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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbmRPckNyZWF0ZVBhbmVJdGVtTG9jYXRpb24uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O3FCQW9Cd0IsNEJBQTRCOzs7Ozs7OztBQUFyQyxTQUFTLDRCQUE0QixDQUFDLFFBQXdCLEVBQWE7QUFDeEYsTUFBSSxRQUFRLEtBQUssYUFBYSxFQUFFO0FBQzlCLFdBQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLEVBQUUsQ0FBQztHQUN2Qzs7QUFFRCxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQztBQUNuRCxNQUFNLElBQUksR0FBRyxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUM7OztBQUdyQyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQzs7QUFFdEQsTUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFOzs7OztBQUtwQixRQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDOztBQUVsQyxRQUFNLFdBQVcsR0FBRyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDN0MsUUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDOzs7O0FBSS9CLFFBQUksSUFBSSxDQUFDLFdBQVcsS0FBSyxjQUFjLENBQUMsUUFBUSxDQUFDLEVBQUU7QUFDakQsVUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBQ3BDLFVBQU0sS0FBSyxHQUFHLElBQUksS0FBSyxRQUFRLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQzlFLFVBQUksS0FBSyxJQUFJLEtBQUssWUFBWSxJQUFJLEVBQUU7QUFDbEMsZUFBTyxLQUFLLENBQUM7T0FDZDtLQUNGOzs7Ozs7Ozs7QUFTRCxRQUFNLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQztBQUNwQix5QkFBbUIsRUFBRSxhQUFhLENBQUMsbUJBQW1CO0FBQ3RELHlCQUFtQixFQUFFLGFBQWEsQ0FBQyxtQkFBbUI7QUFDdEQsWUFBTSxFQUFFLGFBQWEsQ0FBQyxNQUFNO0tBQzdCLENBQUMsQ0FBQztBQUNILFFBQU0sUUFBUSxHQUFHLElBQUksUUFBUSxDQUFDO0FBQzVCLGVBQVMsRUFBRSxJQUFJLENBQUMsWUFBWSxFQUFFO0FBQzlCLGlCQUFXLEVBQVgsV0FBVztBQUNYLGNBQVEsRUFBRSxDQUFDLElBQUksQ0FBQztBQUNoQixlQUFTLEVBQUUsQ0FBQztLQUNiLENBQUMsQ0FBQzs7O0FBR0gsUUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDOUMsWUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsSUFBSSxLQUFLLFFBQVEsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7O0FBRW5ELFdBQU8sSUFBSSxDQUFDO0dBRWI7OztBQUdELE1BQU0sU0FBUyxHQUFLLFFBQVEsQUFBa0IsQ0FBQztBQUMvQyxTQUFPLGdCQUFnQixDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztDQUMxQzs7Ozs7QUFLRCxTQUFTLGdCQUFnQixDQUFDLElBQWUsRUFBRSxTQUFvQixFQUFhO0FBQzFFLFVBQVEsU0FBUztBQUNmLFNBQUssS0FBSztBQUNSLGFBQU8sSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQUEsQUFDeEIsU0FBSyxRQUFRO0FBQ1gsYUFBTyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7QUFBQSxBQUMxQixTQUFLLE1BQU07QUFDVCxhQUFPLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUFBLEFBQzFCLFNBQUssT0FBTztBQUNWLGFBQU8sSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO0FBQUEsQUFDM0I7QUFDRSxZQUFNLElBQUksS0FBSyxDQUFJLFNBQVMsZ0NBQTZCLENBQUM7QUFBQSxHQUM3RDtDQUNGOztBQUVELFNBQVMsY0FBYyxDQUFDLFFBQVEsRUFBRTtBQUNoQyxVQUFRLFFBQVE7QUFDZCxTQUFLLEtBQUssQ0FBQztBQUNYLFNBQUssUUFBUTtBQUNYLGFBQU8sVUFBVSxDQUFDO0FBQUEsQUFDcEIsU0FBSyxNQUFNLENBQUM7QUFDWixTQUFLLE9BQU87QUFDVixhQUFPLFlBQVksQ0FBQztBQUFBLEdBQ3ZCO0NBQ0Y7O0FBRUQsU0FBUyxPQUFPLENBQUMsUUFBUSxFQUFFO0FBQ3pCLFVBQVEsUUFBUTtBQUNkLFNBQUssS0FBSyxDQUFDO0FBQ1gsU0FBSyxNQUFNO0FBQ1QsYUFBTyxRQUFRLENBQUM7QUFBQSxBQUNsQixTQUFLLFFBQVEsQ0FBQztBQUNkLFNBQUssT0FBTztBQUNWLGFBQU8sT0FBTyxDQUFDO0FBQUEsR0FDbEI7Q0FDRiIsImZpbGUiOiJmaW5kT3JDcmVhdGVQYW5lSXRlbUxvY2F0aW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0dhZGdldExvY2F0aW9ufSBmcm9tICcuLi8uLi9udWNsaWRlLWdhZGdldHMtaW50ZXJmYWNlcyc7XG5cbnR5cGUgRGlyZWN0aW9uID0gJ3RvcCcgfCAncmlnaHQnIHwgJ2JvdHRvbScgfCAnbGVmdCc7XG5cbi8qKlxuICogRmluZCB0aGUgcGFuZSBzcGVjaWZpZWQgYnkgdGhlIGdpdmVuIHN0cmluZyB0byB3aGljaCB3ZSBjYW4gYWRkIGFuIGl0ZW0uIFRoaXMgaXMgc2ltaWxhciB0b1xuICogQXRvbSdzIGBQYW5lOjpmaW5kT3JDcmVhdGVYbW9zdFNpYmxpbmdgIG1ldGhvZHMsIGJ1dCB0aGVzZSBwb3NpdGlvbnMgYXJlIGFic29sdXRlIChpLmUuIGRvbid0XG4gKiBkZXBlbmQgb24gdGhlIGFjdGl2ZSBwYW5lKS5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZmluZE9yQ3JlYXRlUGFuZUl0ZW1Mb2NhdGlvbihsb2NhdGlvbjogR2FkZ2V0TG9jYXRpb24pOiBhdG9tJFBhbmUge1xuICBpZiAobG9jYXRpb24gPT09ICdhY3RpdmUtcGFuZScpIHtcbiAgICByZXR1cm4gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpO1xuICB9XG5cbiAgY29uc3QgcGFuZUNvbnRhaW5lciA9IGF0b20ud29ya3NwYWNlLnBhbmVDb250YWluZXI7XG4gIGNvbnN0IHJvb3QgPSBwYW5lQ29udGFpbmVyLmdldFJvb3QoKTtcblxuICAvLyBBIG5hc3R5IGhhY2sgc2luY2UgQXRvbSBkb2Vzbid0IGV4cG9ydCB0aGlzIG1vZHVsZS5cbiAgY29uc3QgUGFuZSA9IGF0b20ud29ya3NwYWNlLmdldFBhbmVzKClbMF0uY29uc3RydWN0b3I7XG5cbiAgaWYgKHJvb3Qub3JpZW50YXRpb24pIHtcblxuICAgIC8vIFRoZSByb290IGlzIGEgUGFuZUF4aXMgKGl0J3MgYWxyZWFkeSBzcGxpdCkuXG5cbiAgICAvLyBHZXQgdGhlIFBhbmVBeGlzIGNvbnN0cnVjdG9yLCBzaW5jZSBBdG9tIGRvZXNuJ3QgZXhwb3NlIGl0LlxuICAgIGNvbnN0IFBhbmVBeGlzID0gcm9vdC5jb25zdHJ1Y3RvcjtcblxuICAgIGNvbnN0IG9yaWVudGF0aW9uID0gZ2V0T3JpZW50YXRpb24obG9jYXRpb24pO1xuICAgIGNvbnN0IHNpZGUgPSBnZXRTaWRlKGxvY2F0aW9uKTtcblxuICAgIC8vIElmIHRoZSBheGlzIGlzIG9yaWVudGVkIHRoZSBzYW1lIHdheSBhcyB0aGUgc3BsaXQsIGFuZCB0aGUgY29udGFpbmVyIHRoYXQgd2UncmUgZ29pbmcgdG8gYWRkXG4gICAgLy8gb3VyIGl0ZW0gdG8gaXNuJ3Qgc3BsaXQgaXRzZWxmLCByZXR1cm4gYW4gZXhpc3RpbmcgcGFuZS5cbiAgICBpZiAocm9vdC5vcmllbnRhdGlvbiA9PT0gZ2V0T3JpZW50YXRpb24obG9jYXRpb24pKSB7XG4gICAgICBjb25zdCBjaGlsZHJlbiA9IHJvb3QuZ2V0Q2hpbGRyZW4oKTtcbiAgICAgIGNvbnN0IGNoaWxkID0gc2lkZSA9PT0gJ2JlZm9yZScgPyBjaGlsZHJlblswXSA6IGNoaWxkcmVuW2NoaWxkcmVuLmxlbmd0aCAtIDFdO1xuICAgICAgaWYgKGNoaWxkICYmIGNoaWxkIGluc3RhbmNlb2YgUGFuZSkge1xuICAgICAgICByZXR1cm4gY2hpbGQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gSWYgdGhlIGF4aXMgaXNuJ3QgaW4gdGhlIHNhbWUgZGlyZWN0aW9uIGFzIHRoZSBzcGxpdCwgdGhpbmdzIGdldCB0cmlja3kuIFdlIG5lZWQgdG8gY3JlYXRlIGFcbiAgICAvLyBuZXcgUGFuZSBhbmQgdGhlbiB3cmFwIGl0IGFuZCB0aGUgZXhpc3RpbmcgUGFuZUF4aXMgaW4gYSBuZXcgUGFuZUF4aXMuIE5vdGUgdGhhdCB0aGlzIG1lYW5zXG4gICAgLy8gaWYgeW91IGFsdGVybmF0ZSBvcmllbnRhdGlvbnMgKHZlcnRpY2FsIC0+IGhvcml6b250YWwgLT4gdmVydGljYWwgLT4gZXRjLiksIHlvdSdyZSBnb2luZyB0b1xuICAgIC8vIGtlZXAgbmVzdGluZyB5b3VyIHdvcmtzcGFjZSBkZWVwZXIgYW5kIGRlZXBlci4gV2UgZGVjaWRlZCB0byBnbyB3aXRoIHRoaXMgZm9yIG5vdyBzaW5jZSBpdCdzXG4gICAgLy8gZmFpcmx5IHVuZGVyc3RhbmRhYmxlIGJlaGF2aW9yIGZvciB0aGUgZW5kLXVzZXIgYW5kIGVhc3kgdG8gXCJjb3JyZWN0XCIgKGJ5IGRyYWdnaW5nIGFuZFxuICAgIC8vIGRyb3BwaW5nKSBpZiBpdCdzIG5vdCB0aGUgZGVzaXJlZCByZXN1bHQuIFdlIG1heSByZXZpc2l0IGFuZCB0cnkgdG8gZG8gc29tZXRoaW5nIG1vcmUgY2xldmVyXG4gICAgLy8gbGF0ZXIuXG4gICAgY29uc3QgcGFuZSA9IG5ldyBQYW5lKHtcbiAgICAgIGFwcGxpY2F0aW9uRGVsZWdhdGU6IHBhbmVDb250YWluZXIuYXBwbGljYXRpb25EZWxlZ2F0ZSxcbiAgICAgIGRlc2VyaWFsaXplck1hbmFnZXI6IHBhbmVDb250YWluZXIuZGVzZXJpYWxpemVyTWFuYWdlcixcbiAgICAgIGNvbmZpZzogcGFuZUNvbnRhaW5lci5jb25maWcsXG4gICAgfSk7XG4gICAgY29uc3QgcGFuZUF4aXMgPSBuZXcgUGFuZUF4aXMoe1xuICAgICAgY29udGFpbmVyOiByb290LmdldENvbnRhaW5lcigpLFxuICAgICAgb3JpZW50YXRpb24sXG4gICAgICBjaGlsZHJlbjogW3BhbmVdLFxuICAgICAgZmxleFNjYWxlOiAxLFxuICAgIH0pO1xuXG4gICAgLy8gUmVwbGFjZSB0aGUgb2xkIHBhbmUgYXhpcyB3aXRoIG91ciBuZXcgb25lIGFuZCBhZGQgdGhlIG9sZCBvbmUgYXMgYSBjaGlsZCB0byBpdC5cbiAgICByb290LmdldFBhcmVudCgpLnJlcGxhY2VDaGlsZChyb290LCBwYW5lQXhpcyk7XG4gICAgcGFuZUF4aXMuYWRkQ2hpbGQocm9vdCwgc2lkZSA9PT0gJ2JlZm9yZScgPyAxIDogMCk7XG5cbiAgICByZXR1cm4gcGFuZTtcblxuICB9XG5cbiAgLy8gVGhlIHJvb3QgaXMgYSBQYW5lIChpdCBpc24ndCBzcGxpdCB5ZXQpLlxuICBjb25zdCBkaXJlY3Rpb24gPSAoKGxvY2F0aW9uOiBhbnkpOiBEaXJlY3Rpb24pO1xuICByZXR1cm4gc3BsaXRJbkRpcmVjdGlvbihyb290LCBkaXJlY3Rpb24pO1xufVxuXG4vKipcbiAqIFNwbGl0cyB0aGUgZ2l2ZW4gcGFuZSBpbiB0aGUgc3BlY2lmaWVkIGRpcmVjdGlvbiBhbmQgcmV0dXJuIHRoZSBuZXcgcGFuZS5cbiAqL1xuZnVuY3Rpb24gc3BsaXRJbkRpcmVjdGlvbihwYW5lOiBhdG9tJFBhbmUsIGRpcmVjdGlvbjogRGlyZWN0aW9uKTogYXRvbSRQYW5lIHtcbiAgc3dpdGNoIChkaXJlY3Rpb24pIHtcbiAgICBjYXNlICd0b3AnOlxuICAgICAgcmV0dXJuIHBhbmUuc3BsaXRVcCgpO1xuICAgIGNhc2UgJ2JvdHRvbSc6XG4gICAgICByZXR1cm4gcGFuZS5zcGxpdERvd24oKTtcbiAgICBjYXNlICdsZWZ0JzpcbiAgICAgIHJldHVybiBwYW5lLnNwbGl0TGVmdCgpO1xuICAgIGNhc2UgJ3JpZ2h0JzpcbiAgICAgIHJldHVybiBwYW5lLnNwbGl0UmlnaHQoKTtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKGAke2RpcmVjdGlvbn0gaXMgbm90IGEgdmFsaWQgZGlyZWN0aW9uLmApO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldE9yaWVudGF0aW9uKGxvY2F0aW9uKSB7XG4gIHN3aXRjaCAobG9jYXRpb24pIHtcbiAgICBjYXNlICd0b3AnOlxuICAgIGNhc2UgJ2JvdHRvbSc6XG4gICAgICByZXR1cm4gJ3ZlcnRpY2FsJztcbiAgICBjYXNlICdsZWZ0JzpcbiAgICBjYXNlICdyaWdodCc6XG4gICAgICByZXR1cm4gJ2hvcml6b250YWwnO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldFNpZGUobG9jYXRpb24pIHtcbiAgc3dpdGNoIChsb2NhdGlvbikge1xuICAgIGNhc2UgJ3RvcCc6XG4gICAgY2FzZSAnbGVmdCc6XG4gICAgICByZXR1cm4gJ2JlZm9yZSc7XG4gICAgY2FzZSAnYm90dG9tJzpcbiAgICBjYXNlICdyaWdodCc6XG4gICAgICByZXR1cm4gJ2FmdGVyJztcbiAgfVxufVxuIl19