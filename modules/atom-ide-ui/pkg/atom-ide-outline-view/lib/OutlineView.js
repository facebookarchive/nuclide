'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.OutlineView = undefined;var _Atomicon;















function _load_Atomicon() {return _Atomicon = _interopRequireDefault(require('../../../../nuclide-commons-ui/Atomicon'));}var _Atomicon2;function _load_Atomicon2() {return _Atomicon2 = require('../../../../nuclide-commons-ui/Atomicon');}var _HighlightedText;
function _load_HighlightedText() {return _HighlightedText = _interopRequireDefault(require('../../../../nuclide-commons-ui/HighlightedText'));}var _collection;
function _load_collection() {return _collection = require('../../../../nuclide-commons/collection');}var _memoizeUntilChanged;
function _load_memoizeUntilChanged() {return _memoizeUntilChanged = _interopRequireDefault(require('../../../../nuclide-commons/memoizeUntilChanged'));}var _UniversalDisposable;
function _load_UniversalDisposable() {return _UniversalDisposable = _interopRequireDefault(require('../../../../nuclide-commons/UniversalDisposable'));}

var _react = _interopRequireWildcard(require('react'));var _classnames;
function _load_classnames() {return _classnames = _interopRequireDefault(require('classnames'));}var _nullthrows;

function _load_nullthrows() {return _nullthrows = _interopRequireDefault(require('nullthrows'));}var _matchIndexesToRanges;

function _load_matchIndexesToRanges() {return _matchIndexesToRanges = _interopRequireDefault(require('../../../../nuclide-commons/matchIndexesToRanges'));}var _analytics;
function _load_analytics() {return _analytics = _interopRequireDefault(require('../../../../nuclide-commons/analytics'));}var _goToLocation;
function _load_goToLocation() {return _goToLocation = require('../../../../nuclide-commons-atom/go-to-location');}var _LoadingSpinner;



function _load_LoadingSpinner() {return _LoadingSpinner = require('../../../../nuclide-commons-ui/LoadingSpinner');}var _EmptyState;



function _load_EmptyState() {return _EmptyState = require('../../../../nuclide-commons-ui/EmptyState');}var _SelectableTree;
function _load_SelectableTree() {return _SelectableTree = require('../../../../nuclide-commons-ui/SelectableTree');}var _OutlineViewSearch;


function _load_OutlineViewSearch() {return _OutlineViewSearch = require('./OutlineViewSearch');}function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };} /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                               * Copyright (c) 2017-present, Facebook, Inc.
                                                                                                                                                                                                                                                                                                                                                                                                                                                               * All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                               *
                                                                                                                                                                                                                                                                                                                                                                                                                                                               * This source code is licensed under the BSD-style license found in the
                                                                                                                                                                                                                                                                                                                                                                                                                                                               * LICENSE file in the root directory of this source tree. An additional grant
                                                                                                                                                                                                                                                                                                                                                                                                                                                               * of patent rights can be found in the PATENTS file in the same directory.
                                                                                                                                                                                                                                                                                                                                                                                                                                                               *
                                                                                                                                                                                                                                                                                                                                                                                                                                                               * 
                                                                                                                                                                                                                                                                                                                                                                                                                                                               * @format
                                                                                                                                                                                                                                                                                                                                                                                                                                                               */


const TOKEN_KIND_TO_CLASS_NAME_MAP = {
  keyword: 'syntax--keyword',
  'class-name': 'syntax--entity syntax--name syntax--class',
  constructor: 'syntax--entity syntax--name syntax--function',
  method: 'syntax--entity syntax--name syntax--function',
  param: 'syntax--variable',
  string: 'syntax--string',
  whitespace: '',
  plain: '',
  type: 'syntax--support syntax--type' };


class OutlineView extends _react.PureComponent {constructor(...args) {var _temp;return _temp = super(...args), this.





















    _setOutlineViewRef =
    element =>
    {
      this._outlineViewRef = element;
    }, _temp;}componentDidMount() {// Ensure that focus() gets called during the initial mount.
    if (this.props.visible) {this.focus();}}componentDidUpdate(prevProps) {if (this.props.visible && !prevProps.visible) {this.focus();}}focus() {if (this._outlineViewRef != null) {this._outlineViewRef.focusSearch();}}
  render() {
    return (
      _react.createElement('div', { className: 'outline-view' },
        _react.createElement(OutlineViewComponent, {
          outline: this.props.outline,
          ref: this._setOutlineViewRef })));



  }}exports.OutlineView = OutlineView;






class OutlineViewComponent extends _react.PureComponent

{


  constructor(props) {
    super(props);this.


    _setOutlineViewCoreRef = element => {
      this._outlineViewCoreRef = element;
    };}

  focusSearch() {
    if (this._outlineViewCoreRef != null) {
      this._outlineViewCoreRef.focusSearch();
    }
  }

  render() {
    const { outline } = this.props;

    switch (outline.kind) {
      case 'empty':
      case 'not-text-editor':
        return (
          _react.createElement((_EmptyState || _load_EmptyState()).EmptyState, {
            title: 'No outline available',
            message: 'Open a file to see its outline.' }));


      case 'loading':
        return (
          _react.createElement('div', { className: 'outline-view-loading' },
            _react.createElement((_LoadingSpinner || _load_LoadingSpinner()).LoadingSpinner, {
              className: 'inline-block',
              size: (_LoadingSpinner || _load_LoadingSpinner()).LoadingSpinnerSizes.MEDIUM })));



      case 'no-provider':
        return outline.grammar === 'Null Grammar' ?
        _react.createElement((_EmptyState || _load_EmptyState()).EmptyState, {
          title: 'No outline available',
          message: 'Atom doesn\'t recognize this file\'s language. Make sure this file has an extension and has been saved.' }) :


        _react.createElement((_EmptyState || _load_EmptyState()).EmptyState, {
          title: 'No outline available',
          message:
          _react.createElement('div', null,
            outline.grammar, ' files do not currently support outlines.', ' ',
            _react.createElement('a', {
                href: '#',
                onClick: () =>
                (0, (_goToLocation || _load_goToLocation()).goToLocation)(
                `atom://config/install/package:ide-${outline.grammar}`) }, 'Install an IDE package first.')) });








      case 'provider-no-outline':
        return (
          _react.createElement((_EmptyState || _load_EmptyState()).EmptyState, {
            title: 'No outline available',
            message: 'This is likely an error with the language package.' }));


      case 'outline':
        return (
          _react.createElement(OutlineViewCore, {
            outline: outline,
            ref: this._setOutlineViewCoreRef }));


      default:
        outline;}

  }}






/**
      * Contains both the search field and the scrollable outline tree
      */
class OutlineViewCore extends _react.PureComponent





{constructor(...args) {var _temp2;return _temp2 = super(...args), this.



    state = {
      collapsedPaths: [],
      searchResults: new Map() }, this.














    _setScrollerNode = node => {
      this._scrollerNode = node;
    }, this.

    _setSearchRef = element => {
      this._searchRef = element;
    }, this.







    _handleCollapse = nodePath => {
      this.setState(prevState => {
        const existing = this.state.collapsedPaths.find(path =>
        (0, (_collection || _load_collection()).arrayEqual)(path, nodePath));

        if (existing == null) {
          return {
            collapsedPaths: [...this.state.collapsedPaths, nodePath] };

        }
      });
    }, this.

    _handleExpand = nodePath => {
      this.setState(prevState => ({
        collapsedPaths: prevState.collapsedPaths.filter(
        path => !(0, (_collection || _load_collection()).arrayEqual)(path, nodePath)) }));


    }, this.

    _handleSelect = nodePath => {
      (_analytics || _load_analytics()).default.track('atom-ide-outline-view:go-to-location');if (!(

      this.props.outline.kind === 'outline')) {throw new Error('Invariant violation: "this.props.outline.kind === \'outline\'"');}
      const { editor } = this.props.outline;
      const outlineNode = selectNodeFromPath(this.props.outline, nodePath);

      const landingPosition =
      outlineNode.landingPosition != null ?
      outlineNode.landingPosition :
      outlineNode.startPosition;

      // single click moves the cursor, but does not focus the editor
      (0, (_goToLocation || _load_goToLocation()).goToLocationInEditor)(editor, {
        line: landingPosition.row,
        column: landingPosition.column });

    }, this.

    _handleConfirm = () => {
      this._focusEditor();
    }, this.

    _handleTripleClick = nodePath => {if (!(
      this.props.outline.kind === 'outline')) {throw new Error('Invariant violation: "this.props.outline.kind === \'outline\'"');}
      const { editor } = this.props.outline;
      const outlineNode = selectNodeFromPath(this.props.outline, nodePath);

      // triple click selects the symbol's region
      const endPosition = outlineNode.endPosition;
      if (endPosition != null) {
        editor.selectToBufferPosition(endPosition);
      }
      this._focusEditor();
    }, this.

    _focusEditor = () => {if (!(
      this.props.outline.kind === 'outline')) {throw new Error('Invariant violation: "this.props.outline.kind === \'outline\'"');}
      const { editor } = this.props.outline;
      // double and triple clicks focus the editor afterwards
      const pane = atom.workspace.paneForItem(editor);
      if (pane == null) {
        return;
      }

      // Assumes that the click handler has already run, which moves the
      // cursor to the start of the symbol. Let's activate the pane now.
      pane.activate();
      pane.activateItem(editor);
    }, this.

    _getNodes = (0, (_memoizeUntilChanged || _load_memoizeUntilChanged()).default)(
    outlineTrees => outlineTrees.map(this._outlineTreeToNode),
    // searchResults is passed here as a cache key for the memoization.
    // Since tree nodes contain `hidden` within them, we need to rerender
    // whenever searchResults changes to reflect that.
    outlineTrees => [outlineTrees, this.state.searchResults]), this.


    _outlineTreeToNode = outlineTree => {
      const searchResult = this.state.searchResults.get(outlineTree);

      if (outlineTree.children.length === 0) {
        return {
          type: 'LEAF',
          label: renderItem(outlineTree),
          hidden: searchResult && !searchResult.visible };

      }

      return {
        type: 'NESTED',
        label: renderItem(outlineTree),
        children: outlineTree.children.map(this._outlineTreeToNode),
        hidden: searchResult && !searchResult.visible };

    }, _temp2;}componentDidMount() {this._subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default(atom.commands.add((0, (_nullthrows || _load_nullthrows()).default)(this._scrollerNode), 'atom-ide:filter', () => this.focusSearch()));}componentWillUnmount() {(0, (_nullthrows || _load_nullthrows()).default)(this._subscriptions).dispose();}focusSearch() {if (this._searchRef != null) {this._searchRef.focus();}}

  render() {
    const { outline } = this.props;if (!(
    outline.kind === 'outline')) {throw new Error('Invariant violation: "outline.kind === \'outline\'"');}

    return (
      _react.createElement('div', { className: 'outline-view-core' },
        _react.createElement((_OutlineViewSearch || _load_OutlineViewSearch()).OutlineViewSearchComponent, {
          outlineTrees: outline.outlineTrees,
          editor: outline.editor,
          updateSearchResults: searchResults => {
            this.setState({ searchResults });
          },
          ref: this._setSearchRef }),

        _react.createElement('div', {
            className: 'outline-view-trees-scroller',
            ref: this._setScrollerNode },
          _react.createElement((_SelectableTree || _load_SelectableTree()).Tree, {
            className: 'outline-view-trees atom-ide-filterable',
            collapsedPaths: this.state.collapsedPaths,
            itemClassName: 'outline-view-item',
            items: this._getNodes(outline.outlineTrees),
            onCollapse: this._handleCollapse,
            onConfirm: this._handleConfirm,
            onExpand: this._handleExpand,
            onSelect: this._handleSelect,
            onTripleClick: this._handleTripleClick,
            selectedPaths: outline.highlightedPaths }))));




  }}


function renderItem(
outline,
searchResult)
{
  const r = [];

  const iconName = outline.icon;
  if (iconName != null) {
    const correspondingAtomicon = (0, (_Atomicon2 || _load_Atomicon2()).getTypeFromIconName)(iconName);
    if (correspondingAtomicon == null) {
      r.push(
      _react.createElement('span', {
        key: 'type-icon',
        className: (0, (_classnames || _load_classnames()).default)('icon', `icon-${iconName}`) }));


    } else {
      // If we're passed an icon name rather than a type, and it maps directly
      // to an atomicon, use that.
      r.push(_react.createElement((_Atomicon || _load_Atomicon()).default, { key: 'type-icon', type: correspondingAtomicon }));
    }
  } else if (outline.kind != null) {
    r.push(_react.createElement((_Atomicon || _load_Atomicon()).default, { key: 'type-icon', type: outline.kind }));
  }

  if (outline.tokenizedText != null) {
    let offset = 0;
    r.push(
    ...outline.tokenizedText.map((token, i) => {
      const toReturn = renderTextToken(token, i, searchResult, offset);
      offset += token.value.length;
      return toReturn;
    }));

  } else if (outline.plainText != null) {
    const textWithMatching =
    searchResult && searchResult.matchingCharacters ?
    _react.createElement((_HighlightedText || _load_HighlightedText()).default, {
      highlightedRanges: (0, (_matchIndexesToRanges || _load_matchIndexesToRanges()).default)(
      searchResult.matchingCharacters),

      text: outline.plainText || '' }) :


    outline.plainText;

    r.push(textWithMatching);
  } else {
    r.push('Missing text');
  }

  return _react.createElement('span', null, r);
}

function renderTextToken(
token,
index,
searchResult,
offset)
{
  const className = TOKEN_KIND_TO_CLASS_NAME_MAP[token.kind];
  return (
    _react.createElement('span', { className: className, key: index },
      searchResult && searchResult.matchingCharacters ?
      _react.createElement((_HighlightedText || _load_HighlightedText()).default, {
        highlightedRanges: (0, (_matchIndexesToRanges || _load_matchIndexesToRanges()).default)(
        searchResult.matchingCharacters.
        map(el => el - offset).
        filter(el => el >= 0 && el < token.value.length)),

        text: token.value }) :


      token.value));



}

function selectNodeFromPath(
outline,
path)
{if (!(
  outline.kind === 'outline')) {throw new Error('Invariant violation: "outline.kind === \'outline\'"');}

  let node = outline.outlineTrees[path[0]];
  for (let i = 1; i < path.length; i++) {
    node = node.children[path[i]];
  }
  return node;
}