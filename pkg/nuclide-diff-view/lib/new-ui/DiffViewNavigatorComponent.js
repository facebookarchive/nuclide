'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ResizableFlexContainer;

function _load_ResizableFlexContainer() {
  return _ResizableFlexContainer = require('../../../nuclide-ui/ResizableFlexContainer');
}

var _constants;

function _load_constants() {
  return _constants = require('../constants');
}

var _reactForAtom = require('react-for-atom');

var _DiffViewComponent;

function _load_DiffViewComponent() {
  return _DiffViewComponent = require('../DiffViewComponent');
}

var _Modal;

function _load_Modal() {
  return _Modal = require('../../../nuclide-ui/Modal');
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

class DiffViewNavigatorComponent extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this._handleNavigateToSection = this._handleNavigateToSection.bind(this);
  }

  componentDidMount() {
    this.props.tryTriggerNux();
  }

  render() {
    return _reactForAtom.React.createElement(
      (_ResizableFlexContainer || _load_ResizableFlexContainer()).ResizableFlexContainer,
      {
        className: 'nuclide-diff-view-navigator-root',
        direction: (_ResizableFlexContainer || _load_ResizableFlexContainer()).FlexDirections.HORIZONTAL },
      _reactForAtom.React.createElement(
        (_ResizableFlexContainer || _load_ResizableFlexContainer()).ResizableFlexItem,
        { initialFlexScale: 1 },
        _reactForAtom.React.createElement(
          'div',
          { className: 'nuclide-diff-view-navigator-timeline-container' },
          this._renderNavigationState()
        )
      ),
      _reactForAtom.React.createElement(
        (_ResizableFlexContainer || _load_ResizableFlexContainer()).ResizableFlexItem,
        { initialFlexScale: 0.5 },
        this._renderFileChanges()
      )
    );
  }

  _renderFileChanges() {
    const {
      fileDiff: { activeSectionIndex, filePath, navigationSections },
      isLoadingFileDiff
    } = this.props;

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
        { className: 'padded' },
        _reactForAtom.React.createElement(
          'span',
          null,
          'Changed Sections: '
        ),
        _reactForAtom.React.createElement((_SectionDirectionNavigator || _load_SectionDirectionNavigator()).default, {
          commandTarget: `.${(_constants || _load_constants()).DIFF_EDITOR_MARKER_CLASS}`,
          filePath: filePath,
          navigationSections: navigationSections,
          selectedNavigationSectionIndex: activeSectionIndex,
          onNavigateToNavigationSection: this._handleNavigateToSection
        })
      );
    }

    return _reactForAtom.React.createElement(
      'div',
      { className: 'nuclide-diff-view-navigator-file-changes-container' },
      _reactForAtom.React.createElement(
        'div',
        null,
        sectionNavigator
      ),
      (0, (_DiffViewComponent || _load_DiffViewComponent()).renderFileChanges)(this.props.diffModel)
    );
  }

  _handleNavigateToSection(status, lineNumber) {
    const { diffEditors } = this.props;
    if (diffEditors == null) {
      (0, (_notifications || _load_notifications()).notifyInternalError)(new Error('diffEditors cannot be null while navigating!'));
      return;
    }
    const { newDiffEditor, oldDiffEditor } = diffEditors;
    const textEditorElement = (0, (_DiffViewComponent || _load_DiffViewComponent()).navigationSectionStatusToEditorElement)(oldDiffEditor.getEditorDomElement(), newDiffEditor.getEditorDomElement(), status);
    (0, (_DiffViewComponent || _load_DiffViewComponent()).centerScrollToBufferLine)(textEditorElement, lineNumber);
  }

  _renderNavigationState() {
    const { diffModel, viewMode } = this.props;
    switch (viewMode) {
      case (_constants || _load_constants()).DiffMode.BROWSE_MODE:
        return (0, (_DiffViewComponent || _load_DiffViewComponent()).renderTimelineView)(diffModel);
      case (_constants || _load_constants()).DiffMode.COMMIT_MODE:
        return (0, (_DiffViewComponent || _load_DiffViewComponent()).renderCommitView)(diffModel);
      case (_constants || _load_constants()).DiffMode.PUBLISH_MODE:
        return this._renderPublishView();
      default:
        throw new Error(`Invalid Diff Mode: ${viewMode}`);
    }
  }

  _renderPublishView() {
    const { actionCreators, diffModel, shouldDockPublishView } = this.props;

    const publishViewElement = (0, (_DiffViewComponent || _load_DiffViewComponent()).renderPublishView)(diffModel);
    if (shouldDockPublishView) {
      return publishViewElement;
    } else {
      const dismissHandler = () => {
        actionCreators.setViewMode((_constants || _load_constants()).DiffMode.BROWSE_MODE);
      };

      if (!(document.body != null)) {
        throw new Error('Invariant violation: "document.body != null"');
      }

      const modalMaxHeight = document.body.clientHeight - 100;
      return _reactForAtom.React.createElement(
        'div',
        null,
        (0, (_DiffViewComponent || _load_DiffViewComponent()).renderTimelineView)(diffModel),
        _reactForAtom.React.createElement(
          (_Modal || _load_Modal()).Modal,
          { onDismiss: dismissHandler },
          _reactForAtom.React.createElement(
            'div',
            {
              style: { maxHeight: modalMaxHeight },
              className: 'nuclide-diff-view-modal-diff-mode' },
            publishViewElement
          )
        )
      );
    }
  }
}
exports.default = DiffViewNavigatorComponent; /**
                                               * Copyright (c) 2015-present, Facebook, Inc.
                                               * All rights reserved.
                                               *
                                               * This source code is licensed under the license found in the LICENSE file in
                                               * the root directory of this source tree.
                                               *
                                               * 
                                               */