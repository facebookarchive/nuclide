/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {NuclideUri} from '../../commons-node/nuclideUri';
import type {Tab} from '../../nuclide-ui/Tabs';
import type QuickSelectionActions from './QuickSelectionActions';

import type SearchResultManager, {ProviderSpec} from './SearchResultManager';
import type {
  ProviderResult,
  GroupedResult,
  GroupedResults,
} from './searchResultHelpers';

type ResultContext = {
  nonEmptyResults: GroupedResults,
  serviceNames: Array<string>,
  currentServiceIndex: number,
  currentService: GroupedResult,
  directoryNames: Array<NuclideUri>,
  currentDirectoryIndex: number,
  currentDirectory: ProviderResult,
};

type Selection = {
  selectedDirectory: string,
  selectedService: string,
  selectedItemIndex: number,
};

import {AtomInput} from '../../nuclide-ui/AtomInput';
import {Button} from '../../nuclide-ui/Button';
import Tabs from '../../nuclide-ui/Tabs';
import {CompositeDisposable, Disposable, Emitter} from 'atom';
import debounce from '../../commons-node/debounce';
import humanizeKeystroke from '../../commons-node/humanizeKeystroke';
import {isEmpty} from '../../commons-node/collection';
import {React, ReactDOM} from 'react-for-atom';
import classnames from 'classnames';
import {filterEmptyResults} from './searchResultHelpers';
import nuclideUri from '../../commons-node/nuclideUri';

const RESULTS_CHANGED_DEBOUNCE_DELAY = 50;

/**
 * Determine what the applicable shortcut for a given action is within this component's context.
 * For example, this will return different keybindings on windows vs linux.
 */
function _findKeybindingForAction(action: string, target: HTMLElement): string {
  const matchingKeyBindings = atom.keymaps.findKeyBindings({
    command: action,
    target,
  });
  const keystroke = (matchingKeyBindings.length && matchingKeyBindings[0].keystrokes) || '';
  return humanizeKeystroke(keystroke);
}

type Props = {
  searchResultManager: SearchResultManager,
  quickSelectionActions: QuickSelectionActions,
  scrollableAreaHeightGap?: number,
  onBlur: () => void,
};

type State = {
  activeTab: ProviderSpec,
  hasUserSelection: boolean,
  resultsByService: GroupedResults,
  renderableProviders: Array<ProviderSpec>,
  selectedService: string,
  selectedDirectory: string,
  selectedItemIndex: number,
};

export default class QuickSelectionComponent extends React.Component {
  props: Props;
  state: State;

  _emitter: Emitter;
  _subscriptions: CompositeDisposable;
  _modalNode: HTMLElement;
  _debouncedQueryHandler: () => void;
  _isMounted: boolean;

  constructor(props: Props) {
    super(props);
    this._emitter = new Emitter();
    this._subscriptions = new CompositeDisposable();
    this._isMounted = false;
    this.state = {
      activeTab: this.props.searchResultManager.getProviderByName(
        this.props.searchResultManager.getActiveProviderName(),
      ),
      // treated as immutable
      resultsByService: {},
      renderableProviders: this.props.searchResultManager.getRenderableProviders(),
      selectedService: '',
      selectedDirectory: '',
      selectedItemIndex: -1,
      hasUserSelection: false,
    };
    (this: any)._handleDocumentMouseDown = this._handleDocumentMouseDown.bind(this);
    (this: any)._handleMoveDown = this._handleMoveDown.bind(this);
    (this: any)._handleMoveToBottom = this._handleMoveToBottom.bind(this);
    (this: any)._handleMoveToTop = this._handleMoveToTop.bind(this);
    (this: any)._handleMoveUp = this._handleMoveUp.bind(this);
    (this: any)._handleProvidersChange = this._handleProvidersChange.bind(this);
    (this: any)._handleResultsChange = this._handleResultsChange.bind(this);
    (this: any)._handleTabChange = this._handleTabChange.bind(this);
    (this: any)._handleTextInputChange = this._handleTextInputChange.bind(this);
    (this: any)._select = this._select.bind(this);
  }

  /**
   * Public API
   */
  onCancellation(callback: () => void): IDisposable {
    return this._emitter.on('canceled', callback);
  }

  onSelection(callback: (selection: any) => void): IDisposable {
    return this._emitter.on('selected', callback);
  }

  onSelectionChanged(callback: (selectionIndex: any) => void): IDisposable {
    return this._emitter.on('selection-changed', callback);
  }

  onItemsChanged(callback: (newItems: GroupedResults) => void): IDisposable {
    return this._emitter.on('items-changed', callback);
  }

  focus(): void {
    this._getInputTextEditor().focus();
  }

  blur(): void {
    this._getInputTextEditor().blur();
  }

  setInputValue(value: string): void {
    this._getTextEditor().setText(value);
  }

  getInputValue(): string {
    return this._getTextEditor().getText();
  }

  selectInput(): void {
    this._getTextEditor().selectAll();
  }

  /**
   * Private API
   */
  componentWillReceiveProps(nextProps: Props): void {
    // Prevent clowniness:
    if (this.props.searchResultManager !== nextProps.searchResultManager) {
      throw new Error('quick-open: searchResultManager instance changed.');
    }
    // TODO: Find a better way to trigger an update.
    const nextProviderName = this.props.searchResultManager.getActiveProviderName();
    if (this.state.activeTab.name === nextProviderName) {
      process.nextTick(() => this._setQuery(this.refs.queryInput.getText()));
    } else {
      const activeProvider = this.props.searchResultManager.getProviderByName(nextProviderName);
      const lastResults = this.props.searchResultManager.getResults(
        this.refs.queryInput.getText(),
        nextProviderName,
      );
      this._getTextEditor().setPlaceholderText(activeProvider.prompt);
      this.setState(
        {
          activeTab: activeProvider,
          resultsByService: lastResults,
        },
        () => {
          process.nextTick(() => this._setQuery(this.refs.queryInput.getText()));
          this._updateQueryHandler();
          this._emitter.emit('items-changed', lastResults);
        },
      );
    }
  }

  componentDidUpdate(prevProps: Props, prevState: State): void {
    if (prevState.resultsByService !== this.state.resultsByService) {
      this._emitter.emit('items-changed', this.state.resultsByService);
    }

    if (
      prevState.selectedItemIndex !== this.state.selectedItemIndex ||
      prevState.selectedService !== this.state.selectedService ||
      prevState.selectedDirectory !== this.state.selectedDirectory
    ) {
      this._updateScrollPosition();
    }
  }

  componentDidMount(): void {
    this._isMounted = true;
    this._modalNode = ReactDOM.findDOMNode(this);
    this._subscriptions.add(
      atom.commands.add(this._modalNode, 'core:move-to-bottom', this._handleMoveToBottom),
      atom.commands.add(this._modalNode, 'core:move-to-top', this._handleMoveToTop),
      atom.commands.add(this._modalNode, 'core:move-down', this._handleMoveDown),
      atom.commands.add(this._modalNode, 'core:move-up', this._handleMoveUp),
      atom.commands.add(this._modalNode, 'core:confirm', this._select),
    );

    // Close quick open if user clicks outside the frame.
    document.addEventListener('mousedown', this._handleDocumentMouseDown);
    this._subscriptions.add(
      new Disposable(() => {
        document.removeEventListener('mousedown', this._handleDocumentMouseDown);
      }),
    );

    this._subscriptions.add(
      this.props.searchResultManager.onProvidersChanged(
        this._handleProvidersChange,
      ),
      this.props.searchResultManager.onResultsChanged(
        debounce(this._handleResultsChange, RESULTS_CHANGED_DEBOUNCE_DELAY, false),
      ),
    );

    this._updateQueryHandler();
    this._getTextEditor().onDidChange(this._handleTextInputChange);
    this._clear();
  }

  componentWillUnmount(): void {
    this._isMounted = false;
    this._emitter.dispose();
    this._subscriptions.dispose();
  }

  _handleMoveToBottom(): void {
    this._moveSelectionToBottom();
    this._onUserDidChangeSelection();
  }

  _handleMoveToTop(): void {
    this._moveSelectionToTop();
    this._onUserDidChangeSelection();
  }

  _handleMoveDown(): void {
    this._moveSelectionDown();
    this._onUserDidChangeSelection();
  }

  _handleMoveUp(): void {
    this._moveSelectionUp();
    this._onUserDidChangeSelection();
  }

  _handleDocumentMouseDown(event: Event): void {
    const modal = this.refs.modal;
    // If the click did not happen on the modal or on any of its descendants,
    // the click was elsewhere on the document and should close the modal.
    if (event.target !== modal && !modal.contains(event.target)) {
      this.props.onBlur();
    }
  }

  _sortServiceNames(names: Array<string>): Array<string> {
    return names.sort((serviceName1, serviceName2) => {
      const provider1 = this.props.searchResultManager.getProviderByName(serviceName1);
      const provider2 = this.props.searchResultManager.getProviderByName(serviceName2);
      if (
        provider1.priority == null ||
        provider2.priority == null ||
        provider1.priority === provider2.priority
      ) {
        return provider1.name.localeCompare(provider2.name);
      }
      return provider1.priority - provider2.priority;
    });
  }

  _updateQueryHandler(): void {
    this._debouncedQueryHandler = debounce(
      () => {
        if (this._isMounted) {
          this._setKeyboardQuery(this._getTextEditor().getText());
        }
      },
      this.state.activeTab.debounceDelay || 0,
      false,
    );
  }

  _handleTextInputChange(): void {
    this._debouncedQueryHandler();
  }

  _handleResultsChange(): void {
    // This function is running on a timer (debounced), it is possible that it
    // may be called after the component has unmounted.
    if (this._isMounted) {
      this._updateResults();
    }
  }

  _handleProvidersChange(): void {
    this._updateResults();
  }

  _updateResults(): void {
    const activeProviderName = this.props.searchResultManager.getActiveProviderName();
    const updatedResults = this.props.searchResultManager.getResults(
      this.refs.queryInput.getText(),
      activeProviderName,
    );
    const [topProviderName] = this._sortServiceNames(Object.keys(updatedResults));
    const renderableProviders = this.props.searchResultManager.getRenderableProviders();
    this.setState({
      renderableProviders,
      resultsByService: updatedResults,
    }, () => {
      if (
        !this.state.hasUserSelection &&
        topProviderName != null &&
        this.state.resultsByService[topProviderName] != null
      ) {
        const topProviderResults = this.state.resultsByService[topProviderName].results;
        if (!Object.keys(topProviderResults).some(dirName => topProviderResults[dirName].loading)) {
          this._moveSelectionToTop();
        }
      }
    });
  }

  _select(): void {
    const selectedItem = this._getItemAtIndex(
      this.state.selectedService,
      this.state.selectedDirectory,
      this.state.selectedItemIndex,
    );
    if (!selectedItem) {
      this._cancel();
    } else {
      this._emitter.emit('selected', selectedItem);
    }
  }

  _onUserDidChangeSelection(): void {
    this.setState({
      hasUserSelection: true,
    });
  }

  _cancel(): void {
    this._emitter.emit('canceled');
  }

  _clearSelection(): void {
    this._setSelectedIndex('', '', -1);
  }

  _getCurrentResultContext(): ?ResultContext {
    const nonEmptyResults = filterEmptyResults(this.state.resultsByService);
    const serviceNames = this._sortServiceNames(Object.keys(nonEmptyResults));
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
      nonEmptyResults,
      serviceNames,
      currentServiceIndex,
      currentService,
      directoryNames,
      currentDirectoryIndex,
      currentDirectory,
    };
  }

  _moveSelectionDown(): void {
    const context = this._getCurrentResultContext();
    if (!context) {
      this._moveSelectionToTop();
      return;
    }

    if (this.state.selectedItemIndex < context.currentDirectory.results.length - 1) {
      // only bump the index if remaining in current directory
      this._setSelectedIndex(
        this.state.selectedService,
        this.state.selectedDirectory,
        this.state.selectedItemIndex + 1,
      );
    } else {
      // otherwise go to next directory...
      if (context.currentDirectoryIndex < context.directoryNames.length - 1) {
        this._setSelectedIndex(
          this.state.selectedService,
          context.directoryNames[context.currentDirectoryIndex + 1],
          0,
        );
      } else {
        // ...or the next service...
        if (context.currentServiceIndex < context.serviceNames.length - 1) {
          const newServiceName = context.serviceNames[context.currentServiceIndex + 1];
          const newDirectoryName =
            Object.keys(context.nonEmptyResults[newServiceName].results).shift();
          this._setSelectedIndex(newServiceName, newDirectoryName, 0);
        } else {
          // ...or wrap around to the very top
          this._moveSelectionToTop();
        }
      }
    }
  }

  _moveSelectionUp(): void {
    const context = this._getCurrentResultContext();
    if (!context) {
      this._moveSelectionToBottom();
      return;
    }

    if (this.state.selectedItemIndex > 0) {
      // only decrease the index if remaining in current directory
      this._setSelectedIndex(
        this.state.selectedService,
        this.state.selectedDirectory,
        this.state.selectedItemIndex - 1,
      );
    } else {
      // otherwise, go to the previous directory...
      if (context.currentDirectoryIndex > 0) {
        this._setSelectedIndex(
          this.state.selectedService,
          context.directoryNames[context.currentDirectoryIndex - 1],
          context.currentService
            .results[context.directoryNames[context.currentDirectoryIndex - 1]].results.length - 1,
        );
      } else {
        // ...or the previous service...
        if (context.currentServiceIndex > 0) {
          const newServiceName = context.serviceNames[context.currentServiceIndex - 1];
          const newDirectoryName =
            Object.keys(context.nonEmptyResults[newServiceName].results).pop();
          if (newDirectoryName == null) {
            return;
          }
          const resultsForDirectory =
            context.nonEmptyResults[newServiceName].results[newDirectoryName];
          if (resultsForDirectory == null || resultsForDirectory.results == null) {
            return;
          }
          this._setSelectedIndex(
            newServiceName,
            newDirectoryName,
            resultsForDirectory.results.length - 1,
          );
        } else {
          // ...or wrap around to the very bottom
          this._moveSelectionToBottom();
        }
      }
    }
  }

  // Update the scroll position of the list view to ensure the selected item is visible.
  _updateScrollPosition(): void {
    if (!(this.refs && this.refs.selectionList)) {
      return;
    }
    const listNode = ReactDOM.findDOMNode(this.refs.selectionList);
    const selectedNode = listNode.getElementsByClassName('selected')[0];
    // false is passed for @centerIfNeeded parameter, which defaults to true.
    // Passing false causes the minimum necessary scroll to occur, so the selection sticks to the
    // top/bottom.
    if (selectedNode) {
      selectedNode.scrollIntoViewIfNeeded(false);
    }
  }

  _moveSelectionToBottom(): void {
    const bottom = this._getOuterResults(Array.prototype.pop);
    if (!bottom) {
      return;
    }
    this._setSelectedIndex(bottom.serviceName, bottom.directoryName, bottom.results.length - 1);
  }

  _moveSelectionToTop(): void {
    const top = this._getOuterResults(Array.prototype.shift);
    if (!top) {
      return;
    }
    this._setSelectedIndex(top.serviceName, top.directoryName, 0);
  }

  _getOuterResults(
    arrayOperation: typeof Array.prototype.shift | typeof Array.prototype.pop,
  ): ?{serviceName: string, directoryName: string, results: Array<mixed>} {
    const nonEmptyResults = filterEmptyResults(this.state.resultsByService);
    const serviceName = arrayOperation.call(this._sortServiceNames(Object.keys(nonEmptyResults)));
    if (!serviceName) {
      return null;
    }
    const service = nonEmptyResults[serviceName];
    const directoryName = arrayOperation.call(Object.keys(service.results));
    return {
      serviceName,
      directoryName,
      results: nonEmptyResults[serviceName].results[directoryName].results,
    };
  }

  _getItemAtIndex(serviceName: string, directory: string, itemIndex: number): ?Object {
    if (
      itemIndex === -1 ||
      !this.state.resultsByService[serviceName] ||
      !this.state.resultsByService[serviceName].results[directory] ||
      !this.state.resultsByService[serviceName].results[directory].results[itemIndex]
    ) {
      return null;
    }
    return this.state.resultsByService[serviceName].results[directory].results[itemIndex];
  }

  _componentForItem(item: any, serviceName: string, dirName: string): React.Element<any> {
    return this.props.searchResultManager.getRendererForProvider(serviceName)(
      item,
      serviceName,
      dirName,
    );
  }

  _getSelectedIndex(): Selection {
    return {
      selectedDirectory: this.state.selectedDirectory,
      selectedService: this.state.selectedService,
      selectedItemIndex: this.state.selectedItemIndex,
    };
  }

  _setSelectedIndex(service: string, directory: string, itemIndex: number): void {
    this.setState({
      selectedService: service,
      selectedDirectory: directory,
      selectedItemIndex: itemIndex,
    }, () => {
      this._emitter.emit('selection-changed', this._getSelectedIndex());
      this._onUserDidChangeSelection();
    });
  }

  _resetSelection(): void {
    this.setState({
      selectedService: '',
      selectedDirectory: '',
      selectedItemIndex: -1,
      hasUserSelection: false,
    });
  }

  _setKeyboardQuery(query: string): void {
    this._resetSelection();
    this._setQuery(query);
  }

  _setQuery(query: string): void {
    this.props.quickSelectionActions.query(query);
  }

  _clear(): void {
    this._getTextEditor().setText('');
    this._clearSelection();
  }

  _getInputTextEditor(): atom$TextEditorElement {
    return ReactDOM.findDOMNode(this.refs.queryInput);
  }

  _getTextEditor(): TextEditor {
    return this.refs.queryInput.getTextEditor();
  }

  /**
   * @param newTab is actually a ProviderSpec plus the `name` and `tabContent` properties added by
   *     _renderTabs(), which created the tab object in the first place.
   */
  _handleTabChange(newTab: Tab): void {
    const newProviderName = newTab.name;
    const currentProviderName = this.props.searchResultManager.getActiveProviderName();
    if (newProviderName !== currentProviderName) {
      this.props.quickSelectionActions.changeActiveProvider(newProviderName);
    }
    this.refs.queryInput.focus();
  }

  _renderTabs(): React.Element<any> {
    const tabs = this.state.renderableProviders.map(tab => {
      let keyBinding = null; // TODO
      const humanizedKeybinding = _findKeybindingForAction(tab.action || '', this._modalNode);
      if (humanizedKeybinding !== '') {
        keyBinding = (
          <kbd className="key-binding">
            {humanizedKeybinding}
          </kbd>
        );
      }
      return {
        name: tab.name,
        tabContent: <span>{tab.title}{keyBinding}</span>,
      };
    });
    return (
      <div className="omnisearch-tabs">
        <Tabs
          tabs={tabs}
          activeTabName={this.state.activeTab.name}
          onActiveTabChange={this._handleTabChange}
        />
      </div>
    );
  }

  _renderEmptyMessage(message: string | React.Element<any>): React.Element<any> {
    return (
      <ul className="background-message centered">
        <li>{message}</li>
      </ul>
    );
  }

  _openAll(files: Array<Selection>): void {
    files.map(file => {
      const selectedItem = this._getItemAtIndex(
        file.selectedService,
        file.selectedDirectory,
        file.selectedItemIndex,
      );
      this._emitter.emit('selected', selectedItem);
    });
  }

  _handleKeyPress(e: SyntheticKeyboardEvent, files: Array<Selection>): void {
    if (e.shiftKey && e.key === 'Enter') {
      this._openAll(files);
    }
  }

  render(): React.Element<any> {
    const filesToOpen = [];
    let numTotalResultsRendered = 0;
    const isOmniSearchActive = this.state.activeTab.name === 'OmniSearchResultProvider';
    let numQueriesOutstanding = 0;
    const serviceNames = this._sortServiceNames(Object.keys(this.state.resultsByService));
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
            message = (
              <span>
                <span className="loading loading-spinner-tiny inline-block" />
                Loading...
              </span>
            );
          }
        } else if (resultsForDirectory.error && !isOmniSearchActive) {
          message = (
            <span>
              <span className="icon icon-circle-slash" />
              Error: <pre>{resultsForDirectory.error}</pre>
            </span>
          );
        } else if (resultsForDirectory.results.length === 0 && !isOmniSearchActive) {
          message = (
            <span>
              <span className="icon icon-x" />
              No results
            </span>
          );
        }
        const itemComponents = resultsForDirectory.results.map((item, itemIndex) => {
          numResultsForService++;
          numTotalResultsRendered++;
          const isSelected = (
            serviceName === this.state.selectedService &&
            dirName === this.state.selectedDirectory &&
            itemIndex === this.state.selectedItemIndex
          );
          filesToOpen.push({
            selectedService: serviceName,
            selectedDirectory: dirName,
            selectedItemIndex: itemIndex,
          });
          return (
            <li
              className={classnames({
                'quick-open-result-item': true,
                'list-item': true,
                'selected': isSelected,
              })}
              key={serviceName + dirName + itemIndex}
              onMouseDown={this._select}
              onMouseEnter={this._setSelectedIndex.bind(this, serviceName, dirName, itemIndex)}>
              {this._componentForItem(item, serviceName, dirName)}
            </li>
          );
        });
        let directoryLabel = null;
        // hide folders if only 1 level would be shown, or if no results were found
        const showDirectories = directoryNames.length > 1 &&
          (!isOmniSearchActive || resultsForDirectory.results.length > 0);
        if (showDirectories) {
          directoryLabel = (
            <div className="list-item">
              <span className="icon icon-file-directory">
                {nuclideUri.nuclideUriToDisplayString(dirName)}
              </span>
            </div>
          );
        }
        return (
          <li className={classnames({'list-nested-item': showDirectories})} key={dirName}>
            {directoryLabel}
            {message}
            <ul className="list-tree">
              {itemComponents}
            </ul>
          </li>
        );
      });
      let serviceLabel = null;
      if (isOmniSearchActive && numResultsForService > 0) {
        serviceLabel = (
          <div className="list-item">
            <span className="icon icon-gear">{serviceTitle}</span>
          </div>
        );
        return (
          <li className="list-nested-item" key={serviceName}>
            {serviceLabel}
            <ul className="list-tree">
              {directoriesForService}
            </ul>
          </li>
        );
      }
      return directoriesForService;
    });
    let noResultsMessage = null;
    let hasSearchResult = false;
    if (isEmpty(this.state.resultsByService)) {
      noResultsMessage = this._renderEmptyMessage('Search away!');
    } else if (numTotalResultsRendered === 0) {
      noResultsMessage = this._renderEmptyMessage(<span>No results</span>);
    } else {
      hasSearchResult = true;
    }
    let omniSearchStatus = null;
    if (isOmniSearchActive && numQueriesOutstanding > 0) {
      omniSearchStatus = (
        <span>
          <span className="loading loading-spinner-tiny inline-block" />
          {'Loading...'}
        </span>
      );
    }
    const disableOpenAll = !hasSearchResult || !this.state.activeTab.canOpenAll;
    return (
      <div
        className="select-list omnisearch-modal"
        ref="modal"
        onKeyPress={e => this._handleKeyPress(e, filesToOpen)}>
        <div className="omnisearch-search-bar">
          <AtomInput
            className="omnisearch-pane"
            ref="queryInput"
            placeholderText={this.state.activeTab.prompt}
          />
          <Button
            className="omnisearch-open-all"
            onClick={() => this._openAll(filesToOpen)}
            disabled={disableOpenAll}>
            Open All
          </Button>
        </div>
        {this._renderTabs()}
        <div
          className="omnisearch-results"
          style={{
            maxHeight: this.props.scrollableAreaHeightGap ?
              `calc(100vh - ${this.props.scrollableAreaHeightGap}px)` : '100vh',
          }}>
          {noResultsMessage}
          <div className="omnisearch-pane">
            <ul className="list-tree" ref="selectionList">
              {services}
              {omniSearchStatus}
            </ul>
          </div>
        </div>
      </div>
    );
  }
}
