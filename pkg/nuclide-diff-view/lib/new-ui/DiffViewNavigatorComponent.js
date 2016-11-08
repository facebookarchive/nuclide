'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _reactForAtom = require('react-for-atom');

var _constants;

function _load_constants() {
  return _constants = require('../constants');
}

var _DiffViewComponent;

function _load_DiffViewComponent() {
  return _DiffViewComponent = require('../DiffViewComponent');
}

var _SectionDirectionNavigator;

function _load_SectionDirectionNavigator() {
  return _SectionDirectionNavigator = _interopRequireDefault(require('./SectionDirectionNavigator'));
}

var _notifications;

function _load_notifications() {
  return _notifications = require('../notifications');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let DiffViewNavigatorComponent = class DiffViewNavigatorComponent extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this._handleNavigateToSection = this._handleNavigateToSection.bind(this);
  }

  render() {
    var _props = this.props,
        _props$fileDiff = _props.fileDiff;
    const activeSectionIndex = _props$fileDiff.activeSectionIndex,
          filePath = _props$fileDiff.filePath,
          navigationSections = _props$fileDiff.navigationSections,
          isLoadingFileDiff = _props.isLoadingFileDiff;


    let sectionNavigator;
    if (isLoadingFileDiff) {
      sectionNavigator = _reactForAtom.React.createElement(
        'div',
        { className: 'padded' },
        'Loading Changes ...'
      );
    } else if (navigationSections.length === 0) {
      sectionNavigator = _reactForAtom.React.createElement(
        'div',
        { className: 'padded' },
        'No active diff changes'
      );
    } else {
      sectionNavigator = _reactForAtom.React.createElement(
        'div',
        { className: 'nuclide-diff-view-section-navigator-container' },
        _reactForAtom.React.createElement(
          'span',
          null,
          'Changed Sections: '
        ),
        _reactForAtom.React.createElement((_SectionDirectionNavigator || _load_SectionDirectionNavigator()).default, {
          commandTarget: `.${ (_constants || _load_constants()).DIFF_EDITOR_MARKER_CLASS }`,
          filePath: filePath,
          navigationSections: navigationSections,
          selectedNavigationSectionIndex: activeSectionIndex,
          onNavigateToNavigationSection: this._handleNavigateToSection
        })
      );
    }

    return _reactForAtom.React.createElement(
      'div',
      { className: 'nuclide-diff-view-navigator-root' },
      _reactForAtom.React.createElement(
        'div',
        { className: 'nuclide-diff-view-navigator-timeline-container' },
        this._renderNavigationState()
      ),
      _reactForAtom.React.createElement('div', { className: 'nuclide-diff-view-navigator-vertical-selector' }),
      _reactForAtom.React.createElement(
        'div',
        { className: 'nuclide-diff-view-navigator-file-changes-container' },
        sectionNavigator,
        _reactForAtom.React.createElement('div', { className: 'nuclide-diff-view-navigator-horizontal-selector' }),
        _reactForAtom.React.createElement(
          'div',
          null,
          _reactForAtom.React.createElement(
            'div',
            { className: 'padded' },
            'File Changes'
          ),
          (0, (_DiffViewComponent || _load_DiffViewComponent()).renderFileChanges)(this.props.diffModel)
        )
      )
    );
  }

  _handleNavigateToSection(status, lineNumber) {
    const diffEditors = this.props.diffEditors;

    if (diffEditors == null) {
      (0, (_notifications || _load_notifications()).notifyInternalError)(new Error('diffEditors cannot be null while navigating!'));
      return;
    }
    const newDiffEditor = diffEditors.newDiffEditor,
          oldDiffEditor = diffEditors.oldDiffEditor;

    const textEditorElement = (0, (_DiffViewComponent || _load_DiffViewComponent()).navigationSectionStatusToEditorElement)(oldDiffEditor.getEditorDomElement(), newDiffEditor.getEditorDomElement(), status);
    (0, (_DiffViewComponent || _load_DiffViewComponent()).centerScrollToBufferLine)(textEditorElement, lineNumber);
  }

  _renderNavigationState() {
    var _props2 = this.props;
    const diffModel = _props2.diffModel,
          viewMode = _props2.viewMode;

    switch (viewMode) {
      case (_constants || _load_constants()).DiffMode.BROWSE_MODE:
        return (0, (_DiffViewComponent || _load_DiffViewComponent()).renderTimelineView)(diffModel);
      case (_constants || _load_constants()).DiffMode.COMMIT_MODE:
        return (0, (_DiffViewComponent || _load_DiffViewComponent()).renderCommitView)(diffModel);
      case (_constants || _load_constants()).DiffMode.PUBLISH_MODE:
        return (0, (_DiffViewComponent || _load_DiffViewComponent()).renderPublishView)(diffModel);
      default:
        throw new Error(`Invalid Diff Mode: ${ viewMode }`);
    }
  }
};
exports.default = DiffViewNavigatorComponent;
module.exports = exports['default'];