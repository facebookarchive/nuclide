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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _commonsNodeDispatcher2;

function _commonsNodeDispatcher() {
  return _commonsNodeDispatcher2 = _interopRequireDefault(require('../../commons-node/Dispatcher'));
}

var ActionTypes = Object.freeze({
  COLLAPSE_NODE: 'COLLAPSE_NODE',
  COLLAPSE_NODE_DEEP: 'COLLAPSE_NODE_DEEP',
  DELETE_SELECTED_NODES: 'DELETE_SELECTED_NODES',
  EXPAND_NODE: 'EXPAND_NODE',
  SET_EXCLUDE_VCS_IGNORED_PATHS: 'SET_EXCLUDE_VCS_IGNORED_PATHS',
  EXPAND_NODE_DEEP: 'EXPAND_NODE_DEEP',
  SET_CWD: 'SET_CWD',
  SET_HIDE_IGNORED_NAMES: 'SET_HIDE_IGNORED_NAMES',
  SET_IGNORED_NAMES: 'SET_IGNORED_NAMES',
  SET_ROOT_KEYS: 'SET_ROOT_KEYS',
  SET_TRACKED_NODE: 'SET_TRACKED_NODE',
  CLEAR_TRACKED_NODE: 'CLEAR_TRACKED_NODE',
  MOVE_TO_NODE: 'MOVE_TO_NODE',
  SET_DROP_TARGET_NODE: 'SET_DROP_TARGET_NODE',
  SET_USE_PREVIEW_TABS: 'SET_USE_PREVIEW_TABS',
  SET_USE_PREFIX_NAV: 'SET_USE_PREFIX_NAV',
  SET_VCS_STATUSES: 'SET_VCS_STATUSES',
  SET_REPOSITORIES: 'SET_REPOSITORIES',
  SET_WORKING_SET: 'SET_WORKING_SET',
  SET_OPEN_FILES_WORKING_SET: 'SET_OPEN_FILES_WORKING_SET',
  SET_WORKING_SETS_STORE: 'SET_WORKING_SETS_STORE',
  START_EDITING_WORKING_SET: 'START_EDITING_WORKING_SET',
  FINISH_EDITING_WORKING_SET: 'FINISH_EDITING_WORKING_SET',
  CHECK_NODE: 'CHECK_NODE',
  UNCHECK_NODE: 'UNCHECK_NODE',
  SET_DRAG_HOVERED_NODE: 'SET_DRAG_HOVERED_NODE',
  UNHOVER_NODE: 'UNHOVER_NODE',
  SET_SELECTED_NODE: 'SET_SELECTED_NODE',
  SET_FOCUSED_NODE: 'SET_FOCUSED_NODE',
  ADD_SELECTED_NODE: 'ADD_SELECTED_NODE',
  UNSELECT_NODE: 'UNSELECT_NODE',
  MOVE_SELECTION_UP: 'MOVE_SELECTION_UP',
  MOVE_SELECTION_DOWN: 'MOVE_SELECTION_DOWN',
  MOVE_SELECTION_TO_TOP: 'MOVE_SELECTION_TO_TOP',
  MOVE_SELECTION_TO_BOTTOM: 'MOVE_SELECTION_TO_BOTTOM',
  ENSURE_CHILD_NODE: 'ENSURE_CHILD_NODE',
  CLEAR_FILTER: 'CLEAR_FILTER',
  SET_OPEN_FILES_EXPANDED: 'SET_OPEN_FILES_EXPANDED',
  SET_UNCOMMITTED_CHANGES_EXPANDED: 'SET_UNCOMMITTED_CHANGES_EXPANDED'
});

exports.ActionTypes = ActionTypes;
// Flow hack: Every FileTreeAction actionType must be in ActionTypes.
'';

var instance = undefined;

var FileTreeDispatcher = (function (_default) {
  _inherits(FileTreeDispatcher, _default);

  function FileTreeDispatcher() {
    _classCallCheck(this, FileTreeDispatcher);

    _get(Object.getPrototypeOf(FileTreeDispatcher.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(FileTreeDispatcher, null, [{
    key: 'getInstance',
    value: function getInstance() {
      if (!instance) {
        instance = new FileTreeDispatcher();
      }
      return instance;
    }
  }]);

  return FileTreeDispatcher;
})((_commonsNodeDispatcher2 || _commonsNodeDispatcher()).default);

exports.default = FileTreeDispatcher;
// VCS = version control system

// Immutable.Set<atom$Repository>, but since we don't have typedefs for immutable let's just be
// honest here.