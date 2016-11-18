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

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

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

var _atom = require('atom');

var _debounce;

function _load_debounce() {
  return _debounce = _interopRequireDefault(require('../../commons-node/debounce'));
}

var _humanizeKeystroke;

function _load_humanizeKeystroke() {
  return _humanizeKeystroke = _interopRequireDefault(require('../../commons-node/humanizeKeystroke'));
}

var _collection;

function _load_collection() {
  return _collection = require('../../commons-node/collection');
}

var _reactForAtom = require('react-for-atom');

var _SearchResultManager;

function _load_SearchResultManager() {
  return _SearchResultManager = _interopRequireDefault(require('./SearchResultManager'));
}

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _searchResultHelpers;

function _load_searchResultHelpers() {
  return _searchResultHelpers = require('./searchResultHelpers');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _QuickSelectionActions;

function _load_QuickSelectionActions() {
  return _QuickSelectionActions = _interopRequireDefault(require('./QuickSelectionActions'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const RESULTS_CHANGED_DEBOUNCE_DELAY = 50;

const searchResultManager = (_SearchResultManager || _load_SearchResultManager()).default.getInstance();

/**
 * Determine what the applicable shortcut for a given action is within this component's context.
 * For example, this will return different keybindings on windows vs linux.
 */
function _findKeybindingForAction(action, target) {
  const matchingKeyBindings = atom.keymaps.findKeyBindings({
    command: action,
    target: target
  });
  const keystroke = matchingKeyBindings.length && matchingKeyBindings[0].keystrokes || '';
  return (0, (_humanizeKeystroke || _load_humanizeKeystroke()).default)(keystroke);
}

function sortServiceNames(names) {
  return names.sort((serviceName1, serviceName2) => {
    const provider1 = searchResultManager.getProviderByName(serviceName1);
    const provider2 = searchResultManager.getProviderByName(serviceName2);
    if (provider1.priority == null || provider2.priority == null || provider1.priority === provider2.priority) {
      return provider1.name.localeCompare(provider2.name);
    }
    return provider1.priority - provider2.priority;
  });
}

let QuickSelectionComponent = class QuickSelectionComponent extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this._emitter = new _atom.Emitter();
    this._subscriptions = new _atom.CompositeDisposable();
    this._boundSelect = () => this.select();
    this._isMounted = false;
    this.state = {
      activeTab: searchResultManager.getProviderByName(searchResultManager.getActiveProviderName()),
      // treated as immutable
      resultsByService: {},
      renderableProviders: searchResultManager.getRenderableProviders(),
      selectedService: '',
      selectedDirectory: '',
      selectedItemIndex: -1,
      hasUserSelection: false
    };
    this._handleTabChange = this._handleTabChange.bind(this);
    this.handleProvidersChange = this.handleProvidersChange.bind(this);
    this.handleResultsChange = this.handleResultsChange.bind(this);
    this.handleDocumentMouseDown = this.handleDocumentMouseDown.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.activeProvider !== this.props.activeProvider) {
      if (nextProps.activeProvider) {
        this._getTextEditor().setPlaceholderText(nextProps.activeProvider.prompt);
        const newResults = {};
        this.setState({
          activeTab: nextProps.activeProvider || this.state.activeTab,
          resultsByService: newResults
        }, () => {
          setImmediate(() => this.setQuery(this.refs.queryInput.getText()));
          this._updateQueryHandler();
          this._emitter.emit('items-changed', newResults);
        });
      }
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.resultsByService !== this.state.resultsByService) {
      this._emitter.emit('items-changed', this.state.resultsByService);
    }

    if (prevState.selectedItemIndex !== this.state.selectedItemIndex || prevState.selectedService !== this.state.selectedService || prevState.selectedDirectory !== this.state.selectedDirectory) {
      this._updateScrollPosition();
    }
  }

  componentDidMount() {
    this._isMounted = true;
    this._modalNode = _reactForAtom.ReactDOM.findDOMNode(this);
    this._subscriptions.add(atom.commands.add(this._modalNode, 'core:move-to-bottom', this.handleMoveToBottom.bind(this)), atom.commands.add(this._modalNode, 'core:move-to-top', this.handleMoveToTop.bind(this)), atom.commands.add(this._modalNode, 'core:move-down', this.handleMoveDown.bind(this)), atom.commands.add(this._modalNode, 'core:move-up', this.handleMoveUp.bind(this)), atom.commands.add(this._modalNode, 'core:confirm', this.select.bind(this)));

    // Close quick open if user clicks outside the frame.
    document.addEventListener('mousedown', this.handleDocumentMouseDown);
    this._subscriptions.add(new _atom.Disposable(() => {
      document.removeEventListener('mousedown', this.handleDocumentMouseDown);
    }));

    const inputTextEditor = this.getInputTextEditor();
    this._subscriptions.add(searchResultManager.on(searchResultManager.PROVIDERS_CHANGED, this.handleProvidersChange), searchResultManager.on(searchResultManager.RESULTS_CHANGED, (0, (_debounce || _load_debounce()).default)(this.handleResultsChange, RESULTS_CHANGED_DEBOUNCE_DELAY, false)));

    this._updateQueryHandler();
    inputTextEditor.getModel().onDidChange(() => this._handleTextInputChange());
    this.clear();
  }

  componentWillUnmount() {
    this._isMounted = false;
    this._emitter.dispose();
    this._subscriptions.dispose();
  }

  handleMoveToBottom() {
    this.moveSelectionToBottom();
    this.onUserDidChangeSelection();
  }

  handleMoveToTop() {
    this.moveSelectionToTop();
    this.onUserDidChangeSelection();
  }

  handleMoveDown() {
    this.moveSelectionDown();
    this.onUserDidChangeSelection();
  }

  handleMoveUp() {
    this.moveSelectionUp();
    this.onUserDidChangeSelection();
  }

  handleDocumentMouseDown(event) {
    const modal = this.refs.modal;
    // If the click did not happen on the modal or on any of its descendants,
    // the click was elsewhere on the document and should close the modal.
    if (event.target !== modal && !modal.contains(event.target)) {
      this.props.onBlur();
    }
  }

  onCancellation(callback) {
    return this._emitter.on('canceled', callback);
  }

  onSelection(callback) {
    return this._emitter.on('selected', callback);
  }

  onSelectionChanged(callback) {
    return this._emitter.on('selection-changed', callback);
  }

  onItemsChanged(callback) {
    return this._emitter.on('items-changed', callback);
  }

  _updateQueryHandler() {
    this._debouncedQueryHandler = (0, (_debounce || _load_debounce()).default)(() => {
      if (this._isMounted) {
        this.setKeyboardQuery(this.getInputTextEditor().getModel().getText());
      }
    }, this.getProvider().debounceDelay || 0, false);
  }

  _handleTextInputChange() {
    this._debouncedQueryHandler();
  }

  handleResultsChange() {
    // This function is running on a timer (debounced), it is possible that it
    // may be called after the component has unmounted.
    if (this._isMounted) {
      const activeProviderName = searchResultManager.getActiveProviderName();
      this._updateResults(activeProviderName);
    }
  }

  _updateResults(activeProviderName) {
    const updatedResults = searchResultManager.getResults(this.refs.queryInput.getText(), activeProviderName);

    var _sortServiceNames = sortServiceNames(Object.keys(updatedResults)),
        _sortServiceNames2 = _slicedToArray(_sortServiceNames, 1);

    const topProviderName = _sortServiceNames2[0];

    this.setState({
      resultsByService: updatedResults
    }, () => {
      if (!this.state.hasUserSelection && topProviderName != null && this.state.resultsByService[topProviderName] != null) {
        const topProviderResults = this.state.resultsByService[topProviderName].results;
        if (!Object.keys(topProviderResults).some(dirName => topProviderResults[dirName].loading)) {
          this.moveSelectionToTop();
        }
      }
    });
  }

  handleProvidersChange() {
    const renderableProviders = searchResultManager.getRenderableProviders();
    const activeProviderName = searchResultManager.getActiveProviderName();
    this._updateResults(activeProviderName);
    this.setState({
      renderableProviders: renderableProviders,
      activeProviderName: activeProviderName
    });
  }

  select() {
    const selectedItem = this.getSelectedItem();
    if (!selectedItem) {
      this.cancel();
    } else {
      this._emitter.emit('selected', selectedItem);
    }
  }

  onUserDidChangeSelection() {
    this.setState({
      hasUserSelection: true
    });
  }

  cancel() {
    this._emitter.emit('canceled');
  }

  clearSelection() {
    this.setSelectedIndex('', '', -1);
  }

  _getCurrentResultContext() {
    const nonEmptyResults = (0, (_searchResultHelpers || _load_searchResultHelpers()).filterEmptyResults)(this.state.resultsByService);
    const serviceNames = sortServiceNames(Object.keys(nonEmptyResults));
    const currentServiceIndex = serviceNames.indexOf(this.state.selectedService);
    const currentService = nonEmptyResults[this.state.selectedService];

    if (!currentService) {
      return null;
    }

    const directoryNames = Object.keys(currentService.results);
    const currentDirectoryIndex = directoryNames.indexOf(this.state.selectedDirectory);
    const currentDirectory = currentService.results[this.state.selectedDirectory];

    if (!currentDirectory || !currentDirectory.results) {
      return null;
    }

    return {
      nonEmptyResults: nonEmptyResults,
      serviceNames: serviceNames,
      currentServiceIndex: currentServiceIndex,
      currentService: currentService,
      directoryNames: directoryNames,
      currentDirectoryIndex: currentDirectoryIndex,
      currentDirectory: currentDirectory
    };
  }

  moveSelectionDown() {
    const context = this._getCurrentResultContext();
    if (!context) {
      this.moveSelectionToTop();
      return;
    }

    if (this.state.selectedItemIndex < context.currentDirectory.results.length - 1) {
      // only bump the index if remaining in current directory
      this.setSelectedIndex(this.state.selectedService, this.state.selectedDirectory, this.state.selectedItemIndex + 1);
    } else {
      // otherwise go to next directory...
      if (context.currentDirectoryIndex < context.directoryNames.length - 1) {
        this.setSelectedIndex(this.state.selectedService, context.directoryNames[context.currentDirectoryIndex + 1], 0);
      } else {
        // ...or the next service...
        if (context.currentServiceIndex < context.serviceNames.length - 1) {
          const newServiceName = context.serviceNames[context.currentServiceIndex + 1];
          const newDirectoryName = Object.keys(context.nonEmptyResults[newServiceName].results).shift();
          this.setSelectedIndex(newServiceName, newDirectoryName, 0);
        } else {
          // ...or wrap around to the very top
          this.moveSelectionToTop();
        }
      }
    }
  }

  moveSelectionUp() {
    const context = this._getCurrentResultContext();
    if (!context) {
      this.moveSelectionToBottom();
      return;
    }

    if (this.state.selectedItemIndex > 0) {
      // only decrease the index if remaining in current directory
      this.setSelectedIndex(this.state.selectedService, this.state.selectedDirectory, this.state.selectedItemIndex - 1);
    } else {
      // otherwise, go to the previous directory...
      if (context.currentDirectoryIndex > 0) {
        this.setSelectedIndex(this.state.selectedService, context.directoryNames[context.currentDirectoryIndex - 1], context.currentService.results[context.directoryNames[context.currentDirectoryIndex - 1]].results.length - 1);
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
          this.setSelectedIndex(newServiceName, newDirectoryName, resultsForDirectory.results.length - 1);
        } else {
          // ...or wrap around to the very bottom
          this.moveSelectionToBottom();
        }
      }
    }
  }

  // Update the scroll position of the list view to ensure the selected item is visible.
  _updateScrollPosition() {
    if (!(this.refs && this.refs.selectionList)) {
      return;
    }
    const listNode = _reactForAtom.ReactDOM.findDOMNode(this.refs.selectionList);
    const selectedNode = listNode.getElementsByClassName('selected')[0];
    // false is passed for @centerIfNeeded parameter, which defaults to true.
    // Passing false causes the minimum necessary scroll to occur, so the selection sticks to the
    // top/bottom.
    if (selectedNode) {
      selectedNode.scrollIntoViewIfNeeded(false);
    }
  }

  moveSelectionToBottom() {
    const bottom = this._getOuterResults(Array.prototype.pop);
    if (!bottom) {
      return;
    }
    this.setSelectedIndex(bottom.serviceName, bottom.directoryName, bottom.results.length - 1);
  }

  moveSelectionToTop() {
    const top = this._getOuterResults(Array.prototype.shift);
    if (!top) {
      return;
    }
    this.setSelectedIndex(top.serviceName, top.directoryName, 0);
  }

  _getOuterResults(arrayOperation) {
    const nonEmptyResults = (0, (_searchResultHelpers || _load_searchResultHelpers()).filterEmptyResults)(this.state.resultsByService);
    const serviceName = arrayOperation.call(sortServiceNames(Object.keys(nonEmptyResults)));
    if (!serviceName) {
      return null;
    }
    const service = nonEmptyResults[serviceName];
    const directoryName = arrayOperation.call(Object.keys(service.results));
    return {
      serviceName: serviceName,
      directoryName: directoryName,
      results: nonEmptyResults[serviceName].results[directoryName].results
    };
  }

  getSelectedItem() {
    return this.getItemAtIndex(this.state.selectedService, this.state.selectedDirectory, this.state.selectedItemIndex);
  }

  getItemAtIndex(serviceName, directory, itemIndex) {
    if (itemIndex === -1 || !this.state.resultsByService[serviceName] || !this.state.resultsByService[serviceName].results[directory] || !this.state.resultsByService[serviceName].results[directory].results[itemIndex]) {
      return null;
    }
    return this.state.resultsByService[serviceName].results[directory].results[itemIndex];
  }

  componentForItem(item, serviceName, dirName) {
    return searchResultManager.getRendererForProvider(serviceName)(item, serviceName, dirName);
  }

  getSelectedIndex() {
    return {
      selectedDirectory: this.state.selectedDirectory,
      selectedService: this.state.selectedService,
      selectedItemIndex: this.state.selectedItemIndex
    };
  }

  setSelectedIndex(service, directory, itemIndex) {
    this.setState({
      selectedService: service,
      selectedDirectory: directory,
      selectedItemIndex: itemIndex
    }, () => {
      this._emitter.emit('selection-changed', this.getSelectedIndex());
      this.onUserDidChangeSelection();
    });
  }

  resetSelection() {
    this.setState({
      selectedService: '',
      selectedDirectory: '',
      selectedItemIndex: -1,
      hasUserSelection: false
    });
  }

  setKeyboardQuery(query) {
    this.resetSelection();
    this.setQuery(query);
  }

  setQuery(query) {
    (_QuickSelectionActions || _load_QuickSelectionActions()).default.query(query);
  }

  getProvider() {
    return this.props.activeProvider;
  }

  getInputTextEditor() {
    return _reactForAtom.ReactDOM.findDOMNode(this.refs.queryInput);
  }

  clear() {
    this.getInputTextEditor().getModel().setText('');
    this.clearSelection();
  }

  focus() {
    this.getInputTextEditor().focus();
  }

  blur() {
    this.getInputTextEditor().blur();
  }

  setInputValue(value) {
    this._getTextEditor().setText(value);
  }

  selectInput() {
    this._getTextEditor().selectAll();
  }

  _getTextEditor() {
    return this.refs.queryInput.getTextEditor();
  }

  /**
   * @param newTab is actually a ProviderSpec plus the `name` and `tabContent` properties added by
   *     _renderTabs(), which created the tab object in the first place.
   */
  _handleTabChange(newTab) {
    const providerName = newTab.name;
    if (providerName !== this.props.activeProvider.name) {
      (_QuickSelectionActions || _load_QuickSelectionActions()).default.changeActiveProvider(providerName);
    }
    this.refs.queryInput.focus();
  }

  _renderTabs() {
    const tabs = this.state.renderableProviders.map(tab => {
      let keyBinding = null; // TODO
      const humanizedKeybinding = _findKeybindingForAction(tab.action || '', this._modalNode);
      if (humanizedKeybinding !== '') {
        keyBinding = _reactForAtom.React.createElement(
          'kbd',
          { className: 'key-binding' },
          humanizedKeybinding
        );
      }
      return {
        name: tab.name,
        tabContent: _reactForAtom.React.createElement(
          'span',
          null,
          tab.title,
          keyBinding
        )
      };
    });
    return _reactForAtom.React.createElement(
      'div',
      { className: 'omnisearch-tabs' },
      _reactForAtom.React.createElement((_Tabs || _load_Tabs()).default, {
        tabs: tabs,
        activeTabName: this.state.activeTab.name,
        onActiveTabChange: this._handleTabChange
      })
    );
  }

  _renderEmptyMessage(message) {
    return _reactForAtom.React.createElement(
      'ul',
      { className: 'background-message centered' },
      _reactForAtom.React.createElement(
        'li',
        null,
        message
      )
    );
  }

  openAll(files) {
    files.map(file => {
      this._emitter.emit('selected', this.getItemAtIndex(file.selectedService, file.selectedDirectory, file.selectedItemIndex));
    });
  }

  _handleKeyPress(e, files) {
    if (e.shiftKey && e.key === 'Enter') {
      this.openAll(files);
    }
  }

  render() {
    const filesToOpen = [];
    let numTotalResultsRendered = 0;
    const isOmniSearchActive = this.state.activeTab.name === 'OmniSearchResultProvider';
    let numQueriesOutstanding = 0;
    const serviceNames = sortServiceNames(Object.keys(this.state.resultsByService));
    const services = serviceNames.map(serviceName => {
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
            message = _reactForAtom.React.createElement(
              'span',
              null,
              _reactForAtom.React.createElement('span', { className: 'loading loading-spinner-tiny inline-block' }),
              'Loading...'
            );
          }
        } else if (resultsForDirectory.error && !isOmniSearchActive) {
          message = _reactForAtom.React.createElement(
            'span',
            null,
            _reactForAtom.React.createElement('span', { className: 'icon icon-circle-slash' }),
            'Error: ',
            _reactForAtom.React.createElement(
              'pre',
              null,
              resultsForDirectory.error
            )
          );
        } else if (resultsForDirectory.results.length === 0 && !isOmniSearchActive) {
          message = _reactForAtom.React.createElement(
            'span',
            null,
            _reactForAtom.React.createElement('span', { className: 'icon icon-x' }),
            'No results'
          );
        }
        const itemComponents = resultsForDirectory.results.map((item, itemIndex) => {
          numResultsForService++;
          numTotalResultsRendered++;
          const isSelected = serviceName === this.state.selectedService && dirName === this.state.selectedDirectory && itemIndex === this.state.selectedItemIndex;
          filesToOpen.push({
            selectedService: serviceName,
            selectedDirectory: dirName,
            selectedItemIndex: itemIndex
          });
          return _reactForAtom.React.createElement(
            'li',
            {
              className: (0, (_classnames || _load_classnames()).default)({
                'quick-open-result-item': true,
                'list-item': true,
                'selected': isSelected
              }),
              key: serviceName + dirName + itemIndex,
              onMouseDown: this._boundSelect,
              onMouseEnter: this.setSelectedIndex.bind(this, serviceName, dirName, itemIndex) },
            this.componentForItem(item, serviceName, dirName)
          );
        });
        let directoryLabel = null;
        // hide folders if only 1 level would be shown, or if no results were found
        const showDirectories = directoryNames.length > 1 && (!isOmniSearchActive || resultsForDirectory.results.length > 0);
        if (showDirectories) {
          directoryLabel = _reactForAtom.React.createElement(
            'div',
            { className: 'list-item' },
            _reactForAtom.React.createElement(
              'span',
              { className: 'icon icon-file-directory' },
              (_nuclideUri || _load_nuclideUri()).default.nuclideUriToDisplayString(dirName)
            )
          );
        }
        return _reactForAtom.React.createElement(
          'li',
          { className: (0, (_classnames || _load_classnames()).default)({ 'list-nested-item': showDirectories }), key: dirName },
          directoryLabel,
          message,
          _reactForAtom.React.createElement(
            'ul',
            { className: 'list-tree' },
            itemComponents
          )
        );
      });
      let serviceLabel = null;
      if (isOmniSearchActive && numResultsForService > 0) {
        serviceLabel = _reactForAtom.React.createElement(
          'div',
          { className: 'list-item' },
          _reactForAtom.React.createElement(
            'span',
            { className: 'icon icon-gear' },
            serviceTitle
          )
        );
        return _reactForAtom.React.createElement(
          'li',
          { className: 'list-nested-item', key: serviceName },
          serviceLabel,
          _reactForAtom.React.createElement(
            'ul',
            { className: 'list-tree' },
            directoriesForService
          )
        );
      }
      return directoriesForService;
    });
    let noResultsMessage = null;
    let hasSearchResult = false;
    if ((0, (_collection || _load_collection()).isEmpty)(this.state.resultsByService)) {
      noResultsMessage = this._renderEmptyMessage('Search away!');
    } else if (numTotalResultsRendered === 0) {
      noResultsMessage = this._renderEmptyMessage(_reactForAtom.React.createElement(
        'span',
        null,
        'No results'
      ));
    } else {
      hasSearchResult = true;
    }
    const currentProvider = this.getProvider();
    const promptText = currentProvider && currentProvider.prompt || '';
    let omniSearchStatus = null;
    if (isOmniSearchActive && numQueriesOutstanding > 0) {
      omniSearchStatus = _reactForAtom.React.createElement(
        'span',
        null,
        _reactForAtom.React.createElement('span', { className: 'loading loading-spinner-tiny inline-block' }),
        'Loading...'
      );
    }
    return _reactForAtom.React.createElement(
      'div',
      {
        className: 'select-list omnisearch-modal',
        ref: 'modal',
        onKeyPress: e => this._handleKeyPress(e, filesToOpen) },
      _reactForAtom.React.createElement(
        'div',
        { className: 'omnisearch-search-bar' },
        _reactForAtom.React.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
          className: 'omnisearch-pane',
          ref: 'queryInput',
          placeholderText: promptText
        }),
        _reactForAtom.React.createElement(
          (_Button || _load_Button()).Button,
          {
            className: 'omnisearch-open-all',
            onClick: () => this.openAll(filesToOpen),
            disabled: !hasSearchResult },
          'Open All'
        )
      ),
      this._renderTabs(),
      _reactForAtom.React.createElement(
        'div',
        {
          className: 'omnisearch-results',
          style: {
            maxHeight: this.props.scrollableAreaHeightGap ? `calc(100vh - ${ this.props.scrollableAreaHeightGap }px)` : '100vh'
          } },
        noResultsMessage,
        _reactForAtom.React.createElement(
          'div',
          { className: 'omnisearch-pane' },
          _reactForAtom.React.createElement(
            'ul',
            { className: 'list-tree', ref: 'selectionList' },
            services,
            omniSearchStatus
          )
        )
      )
    );
  }
};
exports.default = QuickSelectionComponent;
module.exports = exports['default'];