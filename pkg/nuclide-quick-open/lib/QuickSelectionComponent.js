'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _AtomInput;

function _load_AtomInput() {
  return _AtomInput = require('../../nuclide-ui/AtomInput');
}

var _Button;

function _load_Button() {
  return _Button = require('../../nuclide-ui/Button');
}

var _Tabs;

function _load_Tabs() {
  return _Tabs = _interopRequireDefault(require('../../nuclide-ui/Tabs'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _event;

function _load_event() {
  return _event = require('../../commons-node/event');
}

var _humanizeKeystroke;

function _load_humanizeKeystroke() {
  return _humanizeKeystroke = _interopRequireDefault(require('../../commons-node/humanizeKeystroke'));
}

var _react = _interopRequireDefault(require('react'));

var _reactDom = _interopRequireDefault(require('react-dom'));

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _searchResultHelpers;

function _load_searchResultHelpers() {
  return _searchResultHelpers = require('./searchResultHelpers');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Determine what the applicable shortcut for a given action is within this component's context.
 * For example, this will return different keybindings on windows vs linux.
 */
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

function _findKeybindingForAction(action, target) {
  const matchingKeyBindings = atom.keymaps.findKeyBindings({
    command: action,
    target
  });
  const keystroke = matchingKeyBindings.length && matchingKeyBindings[0].keystrokes || '';
  return (0, (_humanizeKeystroke || _load_humanizeKeystroke()).default)(keystroke);
}

class QuickSelectionComponent extends _react.default.Component {

  constructor(props) {
    super(props);
    this._subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default();

    const initialProviderName = this.props.searchResultManager.getActiveProviderName();
    const initialActiveTab = this.props.searchResultManager.getProviderSpecByName(initialProviderName);
    const initialQuery = this.props.searchResultManager.getLastQuery() || '';
    const initialResults = this.props.searchResultManager.getResults(initialQuery, initialProviderName);
    const topOuterResult = (0, (_searchResultHelpers || _load_searchResultHelpers()).getOuterResults)('top', initialResults);

    this.state = {
      activeTab: initialActiveTab,
      // treated as immutable
      resultsByService: initialResults,
      renderableProviders: this.props.searchResultManager.getRenderableProviders(),
      selectedService: topOuterResult != null ? topOuterResult.serviceName : '',
      selectedDirectory: topOuterResult != null ? topOuterResult.directoryName : '',
      selectedItemIndex: topOuterResult != null ? 0 : -1,
      hasUserSelection: false,
      initialQuery
    };

    this._handleClickOpenAll = this._handleClickOpenAll.bind(this);
    this._handleDocumentMouseDown = this._handleDocumentMouseDown.bind(this);
    this._handleKeyPress = this._handleKeyPress.bind(this);
    this._handleMoveDown = this._handleMoveDown.bind(this);
    this._handleMoveNextTab = this._handleMoveNextTab.bind(this);
    this._handleMovePreviousTab = this._handleMovePreviousTab.bind(this);
    this._handleMoveToBottom = this._handleMoveToBottom.bind(this);
    this._handleMoveToTop = this._handleMoveToTop.bind(this);
    this._handleMoveUp = this._handleMoveUp.bind(this);
    this._handleProvidersChange = this._handleProvidersChange.bind(this);
    this._handleResultsChange = this._handleResultsChange.bind(this);
    this._handleTabChange = this._handleTabChange.bind(this);
    this._handleTextInputChange = this._handleTextInputChange.bind(this);
    this._select = this._select.bind(this);
  }

  /**
   * Public API
   */
  focus() {
    this._getInputTextEditor().focus();
  }

  setInputValue(value) {
    this._getTextEditor().setText(value);
  }

  /**
   * Private API
   */
  componentWillReceiveProps(nextProps) {
    // Prevent clowniness:
    if (this.props.searchResultManager !== nextProps.searchResultManager) {
      throw new Error('quick-open: searchResultManager instance changed.');
    }
    // TODO: Find a better way to trigger an update.
    const nextProviderName = this.props.searchResultManager.getActiveProviderName();
    if (this.state.activeTab.name === nextProviderName) {
      process.nextTick(() => {
        const query = this.refs.queryInput.getText();
        this.props.quickSelectionActions.query(query);
      });
    } else {
      const activeProviderSpec = this.props.searchResultManager.getProviderSpecByName(nextProviderName);
      const lastResults = this.props.searchResultManager.getResults(this.refs.queryInput.getText(), nextProviderName);
      this._getTextEditor().setPlaceholderText(activeProviderSpec.prompt);
      this.setState({
        activeTab: activeProviderSpec,
        resultsByService: lastResults
      }, () => {
        process.nextTick(() => {
          const query = this.refs.queryInput.getText();
          this.props.quickSelectionActions.query(query);
        });
        if (this.props.onItemsChanged != null) {
          this.props.onItemsChanged(lastResults);
        }
      });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.resultsByService !== this.state.resultsByService) {
      if (this.props.onItemsChanged != null) {
        this.props.onItemsChanged(this.state.resultsByService);
      }
    }
    if (prevState.selectedItemIndex !== this.state.selectedItemIndex || prevState.selectedService !== this.state.selectedService || prevState.selectedDirectory !== this.state.selectedDirectory) {
      this._updateScrollPosition();
    }
  }

  componentDidMount() {
    const modalNode = _reactDom.default.findDOMNode(this);
    this._subscriptions.add(
    // $FlowFixMe
    atom.commands.add(modalNode, 'core:move-to-bottom', this._handleMoveToBottom),
    // $FlowFixMe
    atom.commands.add(modalNode, 'core:move-to-top', this._handleMoveToTop),
    // $FlowFixMe
    atom.commands.add(modalNode, 'core:move-down', this._handleMoveDown),
    // $FlowFixMe
    atom.commands.add(modalNode, 'core:move-up', this._handleMoveUp),
    // $FlowFixMe
    atom.commands.add(modalNode, 'core:confirm', this._select),
    // $FlowFixMe
    atom.commands.add(modalNode, 'pane:show-previous-item', this._handleMovePreviousTab),
    // $FlowFixMe
    atom.commands.add(modalNode, 'pane:show-next-item', this._handleMoveNextTab), atom.commands.add('body', 'core:cancel', () => {
      this.props.onCancellation();
    }), _rxjsBundlesRxMinJs.Observable.fromEvent(document, 'mousedown').subscribe(this._handleDocumentMouseDown), (0, (_event || _load_event()).observableFromSubscribeFunction)(cb => this._getTextEditor().onDidChange(cb))
    // $FlowFixMe: Missing def for debounce and timer.
    .debounce(() => _rxjsBundlesRxMinJs.Observable.timer(this.state.activeTab.debounceDelay || 0)).subscribe(this._handleTextInputChange), (0, (_event || _load_event()).observableFromSubscribeFunction)(cb => this.props.searchResultManager.onProvidersChanged(cb)).debounceTime(0, _rxjsBundlesRxMinJs.Scheduler.animationFrame).subscribe(this._handleProvidersChange), (0, (_event || _load_event()).observableFromSubscribeFunction)(cb => this.props.searchResultManager.onResultsChanged(cb)).debounceTime(50)
    // debounceTime seems to have issues canceling scheduled work. So
    // schedule it after we've debounced the events. See
    // https://github.com/ReactiveX/rxjs/pull/2135
    .debounceTime(0, _rxjsBundlesRxMinJs.Scheduler.animationFrame).subscribe(this._handleResultsChange));

    // TODO: Find a better way to trigger an update.
    this._getTextEditor().setText(this.refs.queryInput.getText());
    this._getTextEditor().selectAll();
  }

  componentWillUnmount() {
    this._subscriptions.dispose();
  }

  _handleClickOpenAll() {
    if (this.state.activeTab.canOpenAll) {
      this._openAll();
    }
  }

  _handleKeyPress(e) {
    if (e.shiftKey && e.key === 'Enter') {
      if (this.state.activeTab.canOpenAll) {
        this._openAll();
      }
    }
  }

  _handleMovePreviousTab(event) {
    const currentProviderName = this.props.searchResultManager.getActiveProviderName();
    const currentTabIndex = this.state.renderableProviders.findIndex(tab => tab.name === currentProviderName);
    const previousProvider = this.state.renderableProviders[currentTabIndex - 1] || this.state.renderableProviders[this.state.renderableProviders.length - 1];
    this.props.quickSelectionActions.changeActiveProvider(previousProvider.name);
    event.stopImmediatePropagation();
  }

  _handleMoveNextTab(event) {
    const currentProviderName = this.props.searchResultManager.getActiveProviderName();
    const currentTabIndex = this.state.renderableProviders.findIndex(tab => tab.name === currentProviderName);
    const nextProvider = this.state.renderableProviders[currentTabIndex + 1] || this.state.renderableProviders[0];
    this.props.quickSelectionActions.changeActiveProvider(nextProvider.name);
    event.stopImmediatePropagation();
  }

  _handleMoveToBottom() {
    this._moveSelectionToBottom( /* userInitiated */true);
  }

  _handleMoveToTop() {
    this._moveSelectionToTop( /* userInitiated */true);
  }

  _handleMoveDown() {
    this._moveSelectionDown( /* userInitiated */true);
  }

  _handleMoveUp() {
    this._moveSelectionUp( /* userInitiated */true);
  }

  _handleDocumentMouseDown(event) {
    // If the click did not happen on the modal or on any of its descendants,
    // the click was elsewhere on the document and should close the modal.
    // Otherwise, refocus the input box.
    if (event.target !== this.refs.modal && !this.refs.modal.contains(event.target)) {
      this.props.onCancellation();
    } else {
      process.nextTick(() => this._getInputTextEditor().focus());
    }
  }

  _handleTextInputChange() {
    this.setState({ hasUserSelection: false });
    const query = this._getTextEditor().getText();
    this.props.quickSelectionActions.query(query);
  }

  _handleResultsChange() {
    this._updateResults();
  }

  _handleProvidersChange() {
    this._updateResults();
  }

  _updateResults() {
    const activeProviderName = this.props.searchResultManager.getActiveProviderName();
    const updatedResults = this.props.searchResultManager.getResults(this.refs.queryInput.getText(), activeProviderName);
    const [topProviderName] = Object.keys(updatedResults);
    const renderableProviders = this.props.searchResultManager.getRenderableProviders();
    this.setState({
      renderableProviders,
      resultsByService: updatedResults
    }, () => {
      if (!this.state.hasUserSelection && topProviderName != null && this.state.resultsByService[topProviderName] != null) {
        const topProviderResults = this.state.resultsByService[topProviderName].results;
        if (!Object.keys(topProviderResults).some(dirName => topProviderResults[dirName].loading)) {
          this._moveSelectionToTop( /* userInitiated */false);
        }
      }
    });
  }

  _select() {
    const selectedItem = this._getItemAtIndex(this.state.selectedService, this.state.selectedDirectory, this.state.selectedItemIndex);
    if (!selectedItem) {
      this.props.onCancellation();
    } else {
      const providerName = this.props.searchResultManager.getActiveProviderName();
      const query = this._getTextEditor().getText();
      this.props.onSelection([selectedItem], providerName, query);
    }
  }

  _getCurrentResultContext() {
    const nonEmptyResults = (0, (_searchResultHelpers || _load_searchResultHelpers()).filterEmptyResults)(this.state.resultsByService);
    const currentService = nonEmptyResults[this.state.selectedService];

    if (!currentService) {
      return null;
    }

    const serviceNames = Object.keys(nonEmptyResults);
    const currentServiceIndex = serviceNames.indexOf(this.state.selectedService);
    const directoryNames = Object.keys(currentService.results);
    const currentDirectoryIndex = directoryNames.indexOf(this.state.selectedDirectory);
    const currentDirectory = currentService.results[this.state.selectedDirectory];

    if (!currentDirectory || !currentDirectory.results) {
      return null;
    }

    return {
      nonEmptyResults,
      serviceNames,
      currentServiceIndex,
      currentService,
      directoryNames,
      currentDirectoryIndex,
      currentDirectory
    };
  }

  _moveSelectionDown(userInitiated) {
    const context = this._getCurrentResultContext();
    if (!context) {
      this._moveSelectionToTop(userInitiated);
      return;
    }

    if (this.state.selectedItemIndex < context.currentDirectory.results.length - 1) {
      // only bump the index if remaining in current directory
      this._setSelectedIndex(this.state.selectedService, this.state.selectedDirectory, this.state.selectedItemIndex + 1, userInitiated);
    } else {
      // otherwise go to next directory...
      if (context.currentDirectoryIndex < context.directoryNames.length - 1) {
        this._setSelectedIndex(this.state.selectedService, context.directoryNames[context.currentDirectoryIndex + 1], 0, userInitiated);
      } else {
        // ...or the next service...
        if (context.currentServiceIndex < context.serviceNames.length - 1) {
          const newServiceName = context.serviceNames[context.currentServiceIndex + 1];
          const newDirectoryName = Object.keys(context.nonEmptyResults[newServiceName].results).shift();
          this._setSelectedIndex(newServiceName, newDirectoryName, 0, userInitiated);
        } else {
          // ...or wrap around to the very top
          this._moveSelectionToTop(userInitiated);
        }
      }
    }
  }

  _moveSelectionUp(userInitiated) {
    const context = this._getCurrentResultContext();
    if (!context) {
      this._moveSelectionToBottom(userInitiated);
      return;
    }

    if (this.state.selectedItemIndex > 0) {
      // only decrease the index if remaining in current directory
      this._setSelectedIndex(this.state.selectedService, this.state.selectedDirectory, this.state.selectedItemIndex - 1, userInitiated);
    } else {
      // otherwise, go to the previous directory...
      if (context.currentDirectoryIndex > 0) {
        this._setSelectedIndex(this.state.selectedService, context.directoryNames[context.currentDirectoryIndex - 1], context.currentService.results[context.directoryNames[context.currentDirectoryIndex - 1]].results.length - 1, userInitiated);
      } else {
        // ...or the previous service...
        if (context.currentServiceIndex > 0) {
          const newServiceName = context.serviceNames[context.currentServiceIndex - 1];
          const newDirectoryName = Object.keys(context.nonEmptyResults[newServiceName].results).pop();
          if (newDirectoryName == null) {
            return;
          }
          const resultsForDirectory = context.nonEmptyResults[newServiceName].results[newDirectoryName];
          if (resultsForDirectory == null || resultsForDirectory.results == null) {
            return;
          }
          this._setSelectedIndex(newServiceName, newDirectoryName, resultsForDirectory.results.length - 1, userInitiated);
        } else {
          // ...or wrap around to the very bottom
          this._moveSelectionToBottom(userInitiated);
        }
      }
    }
  }

  // Update the scroll position of the list view to ensure the selected item is visible.
  _updateScrollPosition() {
    if (!(this.refs && this.refs.selectionList)) {
      return;
    }
    const listNode = _reactDom.default.findDOMNode(this.refs.selectionList);
    // $FlowFixMe
    const selectedNode = listNode.getElementsByClassName('selected')[0];
    // false is passed for @centerIfNeeded parameter, which defaults to true.
    // Passing false causes the minimum necessary scroll to occur, so the selection sticks to the
    // top/bottom.
    if (selectedNode) {
      // $FlowFixMe
      selectedNode.scrollIntoViewIfNeeded(false);
    }
  }

  _moveSelectionToBottom(userInitiated) {
    const bottom = (0, (_searchResultHelpers || _load_searchResultHelpers()).getOuterResults)('bottom', this.state.resultsByService);
    if (!bottom) {
      return;
    }
    this._setSelectedIndex(bottom.serviceName, bottom.directoryName, bottom.results.length - 1, userInitiated);
  }

  _moveSelectionToTop(userInitiated) {
    const top = (0, (_searchResultHelpers || _load_searchResultHelpers()).getOuterResults)('top', this.state.resultsByService);
    if (!top) {
      return;
    }
    this._setSelectedIndex(top.serviceName, top.directoryName, 0, userInitiated);
  }

  _getItemAtIndex(serviceName, directory, itemIndex) {
    if (itemIndex === -1 || !this.state.resultsByService[serviceName] || !this.state.resultsByService[serviceName].results[directory] || !this.state.resultsByService[serviceName].results[directory].results[itemIndex]) {
      return null;
    }
    return this.state.resultsByService[serviceName].results[directory].results[itemIndex];
  }

  _componentForItem(item, serviceName, dirName) {
    return this.props.searchResultManager.getRendererForProvider(serviceName)(item, serviceName, dirName);
  }

  _getSelectedIndex() {
    return {
      selectedDirectory: this.state.selectedDirectory,
      selectedService: this.state.selectedService,
      selectedItemIndex: this.state.selectedItemIndex
    };
  }

  _setSelectedIndex(service, directory, itemIndex, userInitiated) {
    const newState = {
      selectedService: service,
      selectedDirectory: directory,
      selectedItemIndex: itemIndex,
      hasUserSelection: userInitiated
    };
    this.setState(newState, () => {
      const selectedIndex = this._getSelectedIndex();
      const providerName = this.props.searchResultManager.getActiveProviderName();
      const query = this._getTextEditor().getText();
      if (this.props.onSelectionChanged != null) {
        this.props.onSelectionChanged(selectedIndex, providerName, query);
      }
    });
  }

  _getInputTextEditor() {
    // $FlowFixMe
    return _reactDom.default.findDOMNode(this.refs.queryInput);
  }

  _getTextEditor() {
    return this.refs.queryInput.getTextEditor();
  }

  /**
   * @param newTab is actually a ProviderSpec plus the `name` and `tabContent` properties added by
   *     _renderTabs(), which created the tab object in the first place.
   */
  _handleTabChange(newTab) {
    const newProviderName = newTab.name;
    const currentProviderName = this.props.searchResultManager.getActiveProviderName();
    if (newProviderName !== currentProviderName) {
      this.props.quickSelectionActions.changeActiveProvider(newProviderName);
    }
  }

  _renderTabs() {
    const workspace = atom.views.getView(atom.workspace);
    const tabs = this.state.renderableProviders.map(tab => {
      let keyBinding = null; // TODO
      const humanizedKeybinding = tab.action ? _findKeybindingForAction(tab.action, workspace) : '';
      if (humanizedKeybinding !== '') {
        keyBinding = _react.default.createElement(
          'kbd',
          { className: 'key-binding' },
          humanizedKeybinding
        );
      }
      return {
        name: tab.name,
        tabContent: _react.default.createElement(
          'span',
          null,
          tab.title,
          keyBinding
        )
      };
    });
    return _react.default.createElement(
      'div',
      { className: 'omnisearch-tabs' },
      _react.default.createElement((_Tabs || _load_Tabs()).default, {
        tabs: tabs,
        activeTabName: this.state.activeTab.name,
        onActiveTabChange: this._handleTabChange
      })
    );
  }

  _openAll() {
    const selections = (0, (_searchResultHelpers || _load_searchResultHelpers()).flattenResults)(this.state.resultsByService);
    const providerName = this.props.searchResultManager.getActiveProviderName();
    const query = this._getTextEditor().getText();
    this.props.onSelection(selections, providerName, query);
  }

  render() {
    let numTotalResultsRendered = 0;
    const isOmniSearchActive = this.state.activeTab.name === 'OmniSearchResultProvider';
    let numQueriesOutstanding = 0;
    const services = Object.keys(this.state.resultsByService).map(serviceName => {
      let numResultsForService = 0;
      const directories = this.state.resultsByService[serviceName].results;
      const serviceTitle = this.state.resultsByService[serviceName].title;
      const directoryNames = Object.keys(directories);
      const directoriesForService = directoryNames.map(dirName => {
        const resultsForDirectory = directories[dirName];
        let message = null;
        if (resultsForDirectory.loading) {
          numQueriesOutstanding++;
          if (!isOmniSearchActive) {
            numTotalResultsRendered++;
            message = _react.default.createElement(
              'span',
              null,
              _react.default.createElement('span', { className: 'loading loading-spinner-tiny inline-block' }),
              'Loading...'
            );
          }
        } else if (resultsForDirectory.error && !isOmniSearchActive) {
          message = _react.default.createElement(
            'span',
            null,
            _react.default.createElement('span', { className: 'icon icon-circle-slash' }),
            'Error: ',
            _react.default.createElement(
              'pre',
              null,
              resultsForDirectory.error
            )
          );
        } else if (resultsForDirectory.results.length === 0 && !isOmniSearchActive) {
          message = _react.default.createElement(
            'span',
            null,
            _react.default.createElement('span', { className: 'icon icon-x' }),
            'No results'
          );
        }
        const itemComponents = resultsForDirectory.results.map((item, itemIndex) => {
          numResultsForService++;
          numTotalResultsRendered++;
          const isSelected = serviceName === this.state.selectedService && dirName === this.state.selectedDirectory && itemIndex === this.state.selectedItemIndex;
          return _react.default.createElement(
            'li',
            {
              className: (0, (_classnames || _load_classnames()).default)({
                'quick-open-result-item': true,
                'list-item': true,
                'selected': isSelected
              }),
              key: serviceName + dirName + itemIndex,
              onMouseDown: this._select,
              onMouseEnter: this._setSelectedIndex.bind(this, serviceName, dirName, itemIndex,
              /* userInitiated */true) },
            this._componentForItem(item, serviceName, dirName)
          );
        });
        let directoryLabel = null;
        // hide folders if only 1 level would be shown, or if no results were found
        const showDirectories = directoryNames.length > 1 && (!isOmniSearchActive || resultsForDirectory.results.length > 0);
        if (showDirectories) {
          directoryLabel = _react.default.createElement(
            'div',
            { className: 'list-item' },
            _react.default.createElement(
              'span',
              { className: 'icon icon-file-directory' },
              (_nuclideUri || _load_nuclideUri()).default.nuclideUriToDisplayString(dirName)
            )
          );
        }
        return _react.default.createElement(
          'li',
          { className: (0, (_classnames || _load_classnames()).default)({ 'list-nested-item': showDirectories }), key: dirName },
          directoryLabel,
          message,
          _react.default.createElement(
            'ul',
            { className: 'list-tree' },
            itemComponents
          )
        );
      });
      let serviceLabel = null;
      if (isOmniSearchActive && numResultsForService > 0) {
        serviceLabel = _react.default.createElement(
          'div',
          { className: 'list-item' },
          _react.default.createElement(
            'span',
            { className: 'icon icon-gear' },
            serviceTitle
          )
        );
        return _react.default.createElement(
          'li',
          { className: 'list-nested-item', key: serviceName },
          serviceLabel,
          _react.default.createElement(
            'ul',
            { className: 'list-tree' },
            directoriesForService
          )
        );
      }
      return directoriesForService;
    });
    const hasSearchResult = numTotalResultsRendered > 0;
    let omniSearchStatus = null;
    if (isOmniSearchActive && numQueriesOutstanding > 0) {
      omniSearchStatus = _react.default.createElement(
        'span',
        null,
        _react.default.createElement('span', { className: 'loading loading-spinner-tiny inline-block' }),
        'Loading...'
      );
    } else if (isOmniSearchActive && !hasSearchResult) {
      omniSearchStatus = _react.default.createElement(
        'li',
        null,
        _react.default.createElement(
          'span',
          null,
          _react.default.createElement('span', { className: 'icon icon-x' }),
          'No results'
        )
      );
    }
    const disableOpenAll = !hasSearchResult || !this.state.activeTab.canOpenAll;
    return _react.default.createElement(
      'div',
      {
        className: 'select-list omnisearch-modal',
        ref: 'modal',
        onKeyPress: this._handleKeyPress },
      _react.default.createElement(
        'div',
        { className: 'omnisearch-search-bar' },
        _react.default.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
          className: 'omnisearch-pane',
          ref: 'queryInput',
          initialValue: this.state.initialQuery,
          placeholderText: this.state.activeTab.prompt
        }),
        _react.default.createElement(
          (_Button || _load_Button()).Button,
          {
            className: 'omnisearch-open-all',
            onClick: this._handleClickOpenAll,
            disabled: disableOpenAll },
          'Open All'
        )
      ),
      this._renderTabs(),
      _react.default.createElement(
        'div',
        { className: 'omnisearch-results' },
        _react.default.createElement(
          'div',
          { className: 'omnisearch-pane' },
          _react.default.createElement(
            'ul',
            { className: 'list-tree', ref: 'selectionList' },
            services,
            omniSearchStatus
          )
        )
      )
    );
  }
}
exports.default = QuickSelectionComponent;