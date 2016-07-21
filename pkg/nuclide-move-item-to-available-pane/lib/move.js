Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.moveUp = moveUp;
exports.moveDown = moveDown;
exports.moveRight = moveRight;
exports.moveLeft = moveLeft;

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../nuclide-analytics');
}

function moveUp() {
  doSplit('up', function (pane, params) {
    return pane.splitUp(params);
  });
}

function moveDown() {
  doSplit('down', function (pane, params) {
    return pane.splitDown(params);
  });
}

function moveRight() {
  doSplit('right', function (pane, params) {
    return pane.splitRight(params);
  });
}

function moveLeft() {
  doSplit('left', function (pane, params) {
    return pane.splitLeft(params);
  });
}

function doSplit(operation, splitOperation) {
  var activePane = atom.workspace.getActivePane();
  if (activePane == null) {
    return;
  }

  (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)('nuclide-move-item-to-available-pane');
  var activeItem = activePane.getActiveItem();
  if (activeItem != null) {
    var targetPane = findTargetPane(activePane, operation);
    if (targetPane != null) {
      var index = targetPane.getItems().length;
      activePane.moveItemToPane(activeItem, targetPane, index);
      targetPane.activateItemAtIndex(index);
      targetPane.activate();
      return;
    }
  }

  // Note that this will (intentionally) create an empty pane if the active
  // pane contains exactly zero or one items.
  // The new empty pane will be kept if the global atom setting
  // 'Destroy Empty Panes' is false, otherwise it will be removed.
  var newPane = splitOperation(activePane, { copyActiveItem: false });
  var item = activePane.getActiveItem();
  if (item) {
    activePane.moveItemToPane(item, newPane, 0);
  }
}

/**
 * See if there is already a pane in the direction the user is trying to split.
 * If there are multiple, returns the "nearest" pane.
 */
function findTargetPane(activePane, operation) {
  var activeRect = atom.views.getView(activePane).getBoundingClientRect();
  var predicate = createPredicate(operation, activeRect);

  var paneToRect = new WeakMap();
  var candidatePanes = atom.workspace.getPanes().filter(function (pane) {
    if (pane === activePane) {
      return false;
    } else {
      var _rect = atom.views.getView(pane).getBoundingClientRect();
      paneToRect.set(pane, _rect);
      return predicate(_rect);
    }
  });

  if (candidatePanes.length === 1) {
    return candidatePanes[0];
  } else if (candidatePanes.length > 1) {
    var _ret = (function () {
      var xAxisComparator = function xAxisComparator(rect) {
        return Math.abs(rect.left - activeRect.left);
      };
      var yAxisComparator = function yAxisComparator(rect) {
        return Math.abs(rect.top - activeRect.top);
      };
      var isHorizontalMove = operation === 'left' || operation === 'right';
      var primaryComparator = isHorizontalMove ? xAxisComparator : yAxisComparator;
      var secondaryComparator = isHorizontalMove ? yAxisComparator : xAxisComparator;
      candidatePanes.sort(function (pane1, pane2) {
        var rect1 = paneToRect.get(pane1);
        var rect2 = paneToRect.get(pane2);
        var comp = primaryComparator(rect1) - primaryComparator(rect2);
        if (comp !== 0) {
          return comp;
        } else {
          return secondaryComparator(rect1) - secondaryComparator(rect2);
        }
      });
      return {
        v: candidatePanes[0]
      };
    })();

    if (typeof _ret === 'object') return _ret.v;
  } else {
    return null;
  }
}

function createPredicate(operation, activeRect) {
  switch (operation) {
    case 'up':
      return function (rect) {
        return rect.top < activeRect.top;
      };
    case 'down':
      return function (rect) {
        return rect.top > activeRect.top;
      };
    case 'left':
      return function (rect) {
        return rect.left < activeRect.left;
      };
    case 'right':
      return function (rect) {
        return rect.left > activeRect.left;
      };
  }
  throw Error('Unknown operation: ' + operation);
}