'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.HunkDiff = undefined;
exports.createCustomLineNumberGutter = createCustomLineNumberGutter;

var _AtomTextEditor;

function _load_AtomTextEditor() {
  return _AtomTextEditor = require('../../modules/nuclide-commons-ui/AtomTextEditor');
}

var _goToLocation;

function _load_goToLocation() {
  return _goToLocation = require('../../modules/nuclide-commons-atom/go-to-location');
}

var _nullthrows;

function _load_nullthrows() {
  return _nullthrows = _interopRequireDefault(require('nullthrows'));
}

var _string;

function _load_string() {
  return _string = require('../../modules/nuclide-commons/string');
}

var _atom = require('atom');

var _react = _interopRequireWildcard(require('react'));

var _reactDom = _interopRequireDefault(require('react-dom'));

var _renderReactRoot;

function _load_renderReactRoot() {
  return _renderReactRoot = require('../../modules/nuclide-commons-ui/renderReactRoot');
}

var _Section;

function _load_Section() {
  return _Section = require('../../modules/nuclide-commons-ui/Section');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../modules/nuclide-commons/UniversalDisposable'));
}

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

const MAX_GUTTER_WIDTH = 5;

function getHighlightClass(type) {
  if (type === 'add') {
    return 'nuclide-ui-hunk-diff-insert';
  }
  if (type === 'del') {
    return 'nuclide-ui-hunk-diff-delete';
  }
  return null;
}

// add a gutter to a text editor with line numbers defined by an iterable, as
// opposed to being forced to start at 1 and counting up
function createCustomLineNumberGutter(editor, lineNumbers, gutterWidth, options = {}) {
  const { extraName, onClick } = options;
  // 'nuclide-ui-file-changes-line-number-gutter-wX' makes a gutter Xem wide.
  // 'nuclide-ui-file-changes-line-number-gutter' makes a gutter 5em wide
  const suffix = gutterWidth > 0 && gutterWidth < MAX_GUTTER_WIDTH ? `-w${gutterWidth}` : '';
  let name = `nuclide-ui-file-changes-line-number-gutter${suffix}`;
  if (extraName != null) {
    name += ` ${extraName}`;
  }
  const gutter = editor.addGutter({ name });

  let index = -1;
  for (const lineNumber of lineNumbers) {
    index++;
    if (lineNumber == null) {
      continue;
    }
    const marker = editor.markBufferPosition([index, 0], {
      invalidate: 'touch'
    });
    const item = createGutterItem(lineNumber, gutterWidth, onClick);
    gutter.decorateMarker(marker, {
      type: 'gutter',
      item
    });
    gutter.onDidDestroy(() => {
      marker.destroy();
      _reactDom.default.unmountComponentAtNode(item);
    });
  }

  return gutter;
}

const NBSP = '\xa0';
function createGutterItem(lineNumber, gutterWidth, onClick) {
  const fillWidth = gutterWidth - String(lineNumber).length;
  // Paralleling the original line-number implementation,
  // pad the line number with leading spaces.
  const filler = fillWidth > 0 ? new Array(fillWidth).fill(NBSP).join('') : '';
  // Attempt to reuse the existing line-number styles.
  return (0, (_renderReactRoot || _load_renderReactRoot()).renderReactRoot)(_react.createElement(
    'div',
    {
      onClick: onClick && (() => onClick(lineNumber)),
      className: (0, (_classnames || _load_classnames()).default)('line-number', { clickable: onClick != null }) },
    filler,
    lineNumber
  ));
}

class HunkDiff extends _react.Component {

  constructor(props) {
    super(props);
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(
    // enable copying filename
    atom.contextMenu.add({
      '.nuclide-ui-file-changes-item': [{
        label: 'Copy',
        command: 'core:copy'
      }]
    }));
  }

  componentDidMount() {
    const editor = (0, (_nullthrows || _load_nullthrows()).default)(this.editor);
    this._createLineMarkers(editor);
    this._createLineNumbers(editor);
  }

  componentWillReceiveProps(nextProps) {
    const { hunk, grammar } = nextProps;
    const changes = hunk.changes;
    const prevHunk = this.props.hunk;
    const editor = (0, (_nullthrows || _load_nullthrows()).default)(this.editor);

    const newText = changes.map(change => change.content.slice(1)).join('\n');
    const oldText = prevHunk.changes.map(change => change.content.slice(1)).join('\n');
    const oldGrammar = this.props.grammar;

    if (newText === oldText && grammar === oldGrammar) {
      return;
    }

    if (newText !== oldText) {
      editor.setText(newText);
    }
    if (grammar !== oldGrammar) {
      editor.setGrammar(grammar);
    }
    this._disposables.dispose();
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._createLineMarkers(editor);
    this._createLineNumbers(editor);
  }

  shouldComponentUpdate(nextProps) {
    return false;
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  // Line numbers are contiguous, but have a random starting point, so we can't use the
  // default line-number gutter.
  _createLineNumbers(editor) {
    const { changes, newStart: initialOffset } = this.props.hunk;
    const changeCount = changes.length;
    const maxDisplayLineNumber = initialOffset + changeCount - 1;
    // The maximum required gutter width for this hunk, in characters:
    const gutterWidth = String(maxDisplayLineNumber).length;

    let deletedLinesInSection = 0;
    let deletedLines = 0;
    // use a generator to avoid having to precalculate and store an array of
    // line numbers
    function* lineNumberGenerator() {
      for (let line = 0; line < changeCount; line++) {
        if (changes[line].type === 'del') {
          deletedLinesInSection++;
        } else {
          deletedLines += deletedLinesInSection;
          deletedLinesInSection = 0;
        }
        yield line + initialOffset - deletedLines;
      }
    }

    const gutter = createCustomLineNumberGutter(editor, lineNumberGenerator(), gutterWidth);
    this._disposables.add(() => {
      gutter.destroy();
    });
  }

  /**
   * @param lineNumber A buffer line number to be highlighted.
   * @param type The type of highlight to be applied to the line.
   *             Could be a value of: ['insert', 'delete'].
   */
  _createLineMarkers(editor) {
    let hunkIndex = 0;
    for (const hunkChanges of this.props.hunk.changes) {
      const lineNumber = hunkIndex++;
      const range = new _atom.Range([lineNumber, 0], [lineNumber + 1, 0]);
      const marker = editor.markBufferRange(range, { invalidate: 'never' });
      const className = getHighlightClass(hunkChanges.type);
      if (className == null) {
        // No need to highlight normal lines.
        continue;
      }
      const decoration = editor.decorateMarker(marker, {
        type: 'highlight',
        class: className
      });

      this._disposables.add(() => {
        decoration.destroy();
      });
    }
  }

  render() {
    const { hunk, grammar } = this.props;
    const { changes } = hunk;
    // Remove the first character in each line (/[+- ]/) which indicates addition / deletion
    const text = changes.map(change => change.content.slice(1)).join('\n');
    const textBuffer = new _atom.TextBuffer();
    textBuffer.setText(text);

    return _react.createElement((_AtomTextEditor || _load_AtomTextEditor()).AtomTextEditor, {
      autoGrow: true,
      className: 'nuclide-ui-hunk-diff-text-editor',
      correctContainerWidth: false,
      grammar: grammar,
      gutterHidden: true,
      readOnly: true,
      ref: editorRef => {
        // $FlowFixMe(>=0.53.0) Flow suppress
        this.editor = editorRef && editorRef.getModel();
      },
      textBuffer: textBuffer
    });
  }
}

exports.HunkDiff = HunkDiff; /* Renders changes to a single file. */

class FileChanges extends _react.Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this._handleFilenameClick = event => {
      const { fullPath } = this.props;
      if (fullPath == null) {
        return;
      }
      (0, (_goToLocation || _load_goToLocation()).goToLocation)(fullPath);
      event.stopPropagation();
    }, _temp;
  }

  render() {
    const {
      hideHeadline,
      diff,
      fullPath,
      collapsable,
      collapsedByDefault,
      grammar
    } = this.props;
    const {
      additions,
      annotation,
      chunks,
      deletions,
      from: fromFileName,
      to: toFileName
    } = diff;
    if (toFileName == null || fromFileName == null) {
      // sanity check: toFileName & fromFileName should always be given
      return null;
    }
    const fileName = toFileName !== '/dev/null' ? toFileName : fromFileName;
    const hunks = [];
    let i = 0;
    for (const chunk of chunks) {
      if (i > 0) {
        hunks.push(_react.createElement('div', { className: 'nuclide-ui-hunk-diff-spacer', key: `spacer-${i}` }));
      }
      hunks.push(
      // $FlowFixMe(>=0.53.0) Flow suppress
      _react.createElement(this.props.hunkComponentClass, {
        extraData: this.props.extraData,
        key: chunk.oldStart,
        grammar: grammar != null ? grammar : atom.grammars.selectGrammar(fileName, ''),
        hunk: chunk
      }));
      i++;
    }
    let annotationComponent;
    if (annotation != null) {
      annotationComponent = _react.createElement(
        'span',
        null,
        annotation.split('\n').map((line, index) => _react.createElement(
          'span',
          { key: index },
          line,
          _react.createElement('br', null)
        ))
      );
    }

    let addedOrDeletedString = '';
    if (toFileName === '/dev/null') {
      addedOrDeletedString = 'file deleted - ';
    } else if (fromFileName === '/dev/null') {
      addedOrDeletedString = 'file added - ';
    }
    const diffDetails = _react.createElement(
      'span',
      { className: 'nuclide-ui-file-changes-details' },
      annotationComponent,
      ' (',
      addedOrDeletedString,
      additions + deletions,
      ' ',
      (0, (_string || _load_string()).pluralize)('line', additions + deletions),
      ')'
    );

    // insert zero-width spaces so filenames are wrapped at '/'
    const breakableFilename = fileName.replace(/\//g, '/' + (_string || _load_string()).ZERO_WIDTH_SPACE);
    const renderedFilename = fullPath != null ? _react.createElement(
      'a',
      {
        className: 'nuclide-ui-file-changes-name',
        onClick: this._handleFilenameClick },
      breakableFilename
    ) : breakableFilename;

    if (hideHeadline) {
      return hunks;
    }

    const headline = _react.createElement(
      'span',
      {
        className: (0, (_classnames || _load_classnames()).default)('nuclide-ui-file-changes-item', 'native-key-bindings'),
        tabIndex: -1 },
      renderedFilename,
      ' ',
      diffDetails
    );
    return _react.createElement(
      (_Section || _load_Section()).Section,
      {
        collapsable: collapsable,
        collapsedByDefault: collapsedByDefault,
        headline: headline,
        title: 'Click to open' },
      hunks
    );
  }
}
exports.default = FileChanges;
FileChanges.defaultProps = {
  hunkComponentClass: HunkDiff
};