Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.dispatchKeyboardEvent = dispatchKeyboardEvent;
exports.setLocalProject = setLocalProject;
exports.waitsForFile = waitsForFile;
exports.waitsForFilePosition = waitsForFilePosition;
exports.getMountedReactRootNames = getMountedReactRootNames;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _commonsNodeNuclideUri2;

function _commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri2 = _interopRequireDefault(require('../commons-node/nuclideUri'));
}

/**
 * Use this function to simulate keyboard shortcuts or special keys, e.g. cmd-v,
 * escape, or tab. For regular text input the TextEditor.insertText method
 * should be used.
 *
 * @param key A single character key to be sent or a special token such as
 * 'escape' or 'tab'.
 * @param target The DOM element to which this event will be sent.
 * @param metaKeys An object denoting which meta keys are pressed for this
 * keyboard event.
 */

function dispatchKeyboardEvent(key, target) {
  var metaKeys = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];
  var alt = metaKeys.alt;
  var cmd = metaKeys.cmd;
  var ctrl = metaKeys.ctrl;
  var shift = metaKeys.shift;

  var event = atom.keymaps.constructor.buildKeydownEvent(key, {
    target: target,
    alt: Boolean(alt),
    cmd: Boolean(cmd),
    ctrl: Boolean(ctrl),
    shift: Boolean(shift)
  });
  atom.keymaps.handleKeyboardEvent(event);
}

/**
 * Custom matchers for jasmine testing, as described in:
 * http://jasmine.github.io/1.3/introduction.html#section-Writing_a_custom_matcher.
 */
var rangeMatchers = {
  /**
   * Determines if two Ranges are equal. This function should not be called
   * directly, but rather added as a Jasmine custom matcher.
   * @param The expected result from the test.
   * @this A JasmineMatcher object.
   * @returns True if the Ranges are equal.
   */
  toEqualAtomRange: function toEqualAtomRange(expected) {
    return Boolean(this.actual && expected && this.actual.isEqual(expected));
  },

  /**
   * Same as `toEqualAtomRange` but for an array of Ranges. This function should
   * not be called directly, but rather added as a Jasmine custom matcher.
   * @param The expected result from the test.
   * @this A JasmineMatcher object.
   * @returns True if the array of Ranges are equal.
   */
  toEqualAtomRanges: function toEqualAtomRanges(expected) {
    var allEqual = true;
    if (!this.actual || !expected) {
      return false;
    }
    this.actual.some(function (range, index) {
      (0, (_assert2 || _assert()).default)(expected); // Tell Flow this is definitely non-null now.
      if (range.isEqual(expected[index])) {
        return false;
      } else {
        allEqual = false;
        return true;
      }
    });
    return allEqual;
  }
};

exports.rangeMatchers = rangeMatchers;
/**
 * Set the project. If there are one or more projects set previously, this
 * replaces them all with the one(s) provided as the argument `projectPath`.
 */

function setLocalProject(projectPath) {
  if (Array.isArray(projectPath)) {
    atom.project.setPaths(projectPath);
  } else {
    atom.project.setPaths([projectPath]);
  }
}

/**
 * Waits for the specified file to become the active text editor.
 * Can only be used in a Jasmine context.
 */

function waitsForFile(filename) {
  var timeoutMs = arguments.length <= 1 || arguments[1] === undefined ? 10000 : arguments[1];

  waitsFor(filename + ' to become active', timeoutMs, function () {
    var editor = atom.workspace.getActiveTextEditor();
    if (editor == null) {
      return false;
    }
    var editorPath = editor.getPath();
    if (editorPath == null) {
      return false;
    }
    return (_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.basename(editorPath) === filename;
  });
}

function waitsForFilePosition(filename, row, column) {
  var timeoutMs = arguments.length <= 3 || arguments[3] === undefined ? 10000 : arguments[3];

  waitsFor(filename + ' to become active at ' + row + ':' + column, timeoutMs, function () {
    var editor = atom.workspace.getActiveTextEditor();
    if (editor == null) {
      return false;
    }
    var editorPath = editor.getPath();
    if (editorPath == null) {
      return false;
    }
    var pos = editor.getCursorBufferPosition();
    return (_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.basename(editorPath) === filename && pos.row === row && pos.column === column;
  });
}

/**
 * Reaches into React's internals to look for components that have not been
 * unmounted. Having mounted React components after the creator has been
 * disposed is a sign that there are problems in the cleanup logic.
 *
 * If ReactComponentTreeHook ever goes missing, make sure we're not testing
 * with the bundled version of React. If it's still missing, then retire this
 * test.
 *
 * If the displayNames are not helpful in identifying the unmounted component,
 * open Atom with `atom --dev` and inspect the components with:
 *
 *    ReactComponentTreeHook = require.cache[
 *      Object.keys(require.cache).find(x => x.endsWith('/ReactComponentTreeHook.js'))
 *    ].exports;
 *
 *    ReactComponentTreeHook.getRootIDs().map(rootID => {
 *      console.log(ReactComponentTreeHook.getElement(rootID));
 *    });
 */

function getMountedReactRootNames() {
  var ReactComponentTreeHookPath = Object.keys(require.cache).find(function (x) {
    return x.endsWith('react/lib/ReactComponentTreeHook.js');
  });
  (0, (_assert2 || _assert()).default)(ReactComponentTreeHookPath != null, 'ReactComponentTreeHook could not be found in the module cache.');
  var ReactComponentTreeHook = require.cache[ReactComponentTreeHookPath].exports;
  var reactRootNames = ReactComponentTreeHook.getRootIDs().map(function (rootID) {
    return ReactComponentTreeHook.getDisplayName(rootID);
  });
  return reactRootNames;
}