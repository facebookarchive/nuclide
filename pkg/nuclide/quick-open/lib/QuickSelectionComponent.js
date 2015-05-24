'use babel';
/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
/* @flow */

var AtomInput = require('nuclide-ui-atom-input');
var {CompositeDisposable, Disposable, Emitter} = require('atom');
var {QuickSelectionProvider} = require('./QuickSelectionProvider');
var {debounce} = require('nuclide-commons');
var React = require('react-for-atom');

var {PropTypes} = React;

var cx = require('react-classset');
var QuickSelectionComponent = React.createClass({
  _emitter: undefined,
  _subscriptions: undefined,

  propTypes: {
    provider: PropTypes.instanceOf(QuickSelectionProvider).isRequired,
  },

  componentWillReceiveProps(nextProps: mixed) {
    if (nextProps.provider !== this.props.provider) {
      this.clear();
      if (nextProps.provider) {
        this.refs.queryInput.getTextEditor().setPlaceholderText(nextProps.provider.getPromptText());
      }
    }
  },

  componentDidUpdate(prevProps: mixed, prevState: mixed) {
    if (prevState.items !== this.state.items) {
      this.moveSelectionToTop();
      this._emitter.emit('items-changed', this.state.items);
    }

    if (prevState.selectedIndex !== this.state.selectedIndex) {
      this._updateScrollPosition();
    }
  },

  getInitialState() {
    return {
      items: [],
      selectedIndex: 0,
    };
  },

  componentDidMount() {
    this._emitter = new Emitter();
    this._subscriptions = new CompositeDisposable();

    var node = this.getDOMNode();
    this._subscriptions.add(
      atom.commands.add(node, 'core:move-up', this.moveSelectionUp),
      atom.commands.add(node, 'core:move-down', this.moveSelectionDown),
      atom.commands.add(node, 'core:move-to-top', this.moveSelectionToTop),
      atom.commands.add(node, 'core:move-to-bottom', this.moveSelectionToBottom),
      atom.commands.add(node, 'core:confirm', this.select),
      atom.commands.add(node, 'core:cancel', this.cancel)
    );

    var inputTextEditor = this.getInputTextEditor();
    inputTextEditor.addEventListener('blur', (event) => {
      if (event.relatedTarget !== null) {
        this.cancel();
      }
    });

    var debounced = debounce(() => this.setQuery(inputTextEditor.model.getText()), 200);

    inputTextEditor.model.onDidChange(debounced);

    this.clear();
  },

  componentWillUnmount() {
    this._emitter.dispose();
    this._subscriptions.dispose();
  },

  onCancellation(callback: () => void): Disposable {
    return this._emitter.on('canceled', callback);
  },

  onSelection(callback: (selection: mixed) => void): Disposable {
    return this._emitter.on('selected', callback);
  },

  onItemsChanged(callback: (newItems: Array<mixed>) => void): Disposable {
    return this._emitter.on('items-changed', callback);
  },

  select() {
    if (this.state.items.length === 0) {
      this.cancel();
    } else {
      this._emitter.emit('selected', this.state.items[this.state.selectedIndex]);
    }
  },

  cancel() {
    this._emitter.emit('canceled');
  },

  moveSelectionDown() {
    if (this.state.selectedIndex < this.state.items.length - 1) {
      this.setState({selectedIndex: this.state.selectedIndex + 1});
    } else {
      this.moveSelectionToTop();
    }
  },

  moveSelectionUp() {
    if (this.state.selectedIndex > 0) {
      this.setState({selectedIndex: this.state.selectedIndex - 1});
    } else {
      this.moveSelectionToBottom();
    }
  },

  // Update the scroll position of the list view to ensure the selected item is visible.
  _updateScrollPosition() {
    var listNode =  this.refs.selectionList.getDOMNode();
    var selectedNode = listNode.getElementsByClassName('selected')[0];
    // false is passed for @centerIfNeeded parameter, which defaults to true.
    // Passing false causes the minimum necessary scroll to occur, so the selection sticks to the top/bottom
    selectedNode.scrollIntoViewIfNeeded(false);
  },

  moveSelectionToBottom() {
    this.setState({selectedIndex: Math.max(this.state.items.length - 1, 0)});
  },

  moveSelectionToTop() {
    this.setState({selectedIndex: 0});
  },

  componentForItem(item: mixed): ReactElement {
    return this.getProvider().getComponentForItem(item);
  },

  getSelectedIndex(): number {
    return this.state.selectedIndex;
  },

  setSelectedIndex(index: number) {
    this.setState({
      selectedIndex: index,
    });
  },

  setQuery(query: string) {
    var provider = this.getProvider();
    if (provider) {
      var newItems = provider.executeQuery(query);
      newItems.then((items) => {
        this.setState({items: items});
      });
    }
  },

  getProvider(): QuickSelectionProvider {
    return this.props.provider;
  },

  setProvider(newProvider: QuickSelectionProvider) {
    this.setProps({provider: newProvider});
    this.clear();
  },

  getInputTextEditor(): Element {
    return this.refs.queryInput.getDOMNode();
  },

  clear() {
    this.getInputTextEditor().model.setText('');
  },

  focus() {
    this.getInputTextEditor().focus();
  },

  blur() {
    this.getInputTextEditor().blur();
  },

  render(): ReactElement {
    var itemComponents = this.state.items.map((item, index) => {
      var isSelected = (index === this.getSelectedIndex());
      return (
        <li
          className={cx({
            'quick-open-result-item': true,
            selected: isSelected,
          })}
          onMouseDown={this.select}
          onMouseEnter={this.setSelectedIndex.bind(this, index)}>
          {this.componentForItem(item)}
        </li>
      );
    });

    return (
      <div className='select-list'>
        <AtomInput ref='queryInput' />
        <ol className='list-group' ref='selectionList'>
          {itemComponents}
        </ol>
      </div>
    );
  },
});

module.exports = {
  QuickSelectionComponent,
};
