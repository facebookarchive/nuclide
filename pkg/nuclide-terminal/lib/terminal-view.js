'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TerminalView = exports.URI_PREFIX = undefined;
exports.deserializeTerminalView = deserializeTerminalView;
exports.getSafeInitialInput = getSafeInitialInput;

var _atom = require('atom');

var _electron = require('electron');

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _url = _interopRequireDefault(require('url'));

var _xterm;

function _load_xterm() {
  return _xterm = require('xterm');
}

var _fit;

function _load_fit() {
  return _fit = _interopRequireWildcard(require('xterm/lib/addons/fit/fit'));
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('nuclide-commons-atom/feature-config'));
}

var _observableDom;

function _load_observableDom() {
  return _observableDom = require('nuclide-commons-ui/observable-dom');
}

var _performanceNow;

function _load_performanceNow() {
  return _performanceNow = _interopRequireDefault(require('nuclide-commons/performanceNow'));
}

var _nuclideTerminalUri;

function _load_nuclideTerminalUri() {
  return _nuclideTerminalUri = require('../../commons-node/nuclide-terminal-uri');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _event;

function _load_event() {
  return _event = require('nuclide-commons/event');
}

var _nuclidePtyRpc;

function _load_nuclidePtyRpc() {
  return _nuclidePtyRpc = require('../../nuclide-pty-rpc');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _sink;

function _load_sink() {
  return _sink = require('./sink');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const PRESERVED_COMMANDS_CONFIG = 'nuclide-terminal.preservedCommands'; /**
                                                                         * Copyright (c) 2015-present, Facebook, Inc.
                                                                         * All rights reserved.
                                                                         *
                                                                         * This source code is licensed under the license found in the LICENSE file in
                                                                         * the root directory of this source tree.
                                                                         *
                                                                         * 
                                                                         * @format
                                                                         */

const SCROLLBACK_CONFIG = 'nuclide-terminal.scrollback';
const CURSOR_STYLE_CONFIG = 'nuclide-terminal.cursorStyle';
const CURSOR_BLINK_CONFIG = 'nuclide-terminal.cursorBlink';
const ADD_ESCAPE_COMMAND = 'nuclide-terminal:add-escape-prefix';
const TMUX_CONTROLCONTROL_PREFIX = '\x1BP1000p';
const URI_PREFIX = exports.URI_PREFIX = 'atom://nuclide-terminal-view';

class TerminalView {

  constructor(paneUri) {
    if ((_xterm || _load_xterm()).Terminal.fit == null) {
      // The 'fit' add-on resizes the terminal based on the container size
      // and the font size such that the terminal fills the container.
      // Load the addon on-demand the first time we create a terminal.
      (_xterm || _load_xterm()).Terminal.applyAddon(_fit || _load_fit());
    }

    this._paneUri = paneUri;
    const info = (0, (_nuclideTerminalUri || _load_nuclideTerminalUri()).infoFromUri)(paneUri);
    this._terminalInfo = info;
    const cwd = this._cwd = info.cwd == null ? null : info.cwd;
    this._command = info.command == null ? null : info.command;
    this._title = info.title == null ? 'terminal' : info.title;
    this._path = cwd;
    this._initialInput = info.initialInput == null ? '' : getSafeInitialInput(info.initialInput);
    this._processExitCallback = () => {};
    this._useTitleAsPath = false;

    this._startTime = (0, (_performanceNow || _load_performanceNow()).default)();
    this._bytesIn = 0;
    this._bytesOut = 0;
    this._focusStart = null;
    this._focusDuration = 0;
    this._isFirstOutput = true;

    const subscriptions = this._subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._processOutput = this._createOutputSink();

    this._emitter = new _atom.Emitter();
    subscriptions.add(this._emitter);

    subscriptions.add((_featureConfig || _load_featureConfig()).default.observeAsStream(PRESERVED_COMMANDS_CONFIG).subscribe(preserved => {
      this._preservedCommands = new Set([...(preserved || []), ...(info.preservedCommands || [])]);
    }), atom.config.onDidChange('editor.fontSize', this._syncAtomStyle.bind(this)), atom.config.onDidChange('editor.fontFamily', this._syncAtomStyle.bind(this)), atom.config.onDidChange('editor.lineHeight', this._syncAtomStyle.bind(this)), atom.config.onDidChange('core.themes', this._syncAtomTheme.bind(this)), atom.themes.onDidChangeActiveThemes(this._syncAtomTheme.bind(this)));

    const div = this._div = document.createElement('div');
    div.classList.add('terminal-pane');
    subscriptions.add(() => div.remove());

    const terminal = this._terminal = new (_xterm || _load_xterm()).Terminal({
      cols: 512,
      rows: 512,
      cursorBlink: (_featureConfig || _load_featureConfig()).default.get(CURSOR_BLINK_CONFIG),
      cursorStyle: (_featureConfig || _load_featureConfig()).default.get(CURSOR_STYLE_CONFIG),
      scrollback: (_featureConfig || _load_featureConfig()).default.get(SCROLLBACK_CONFIG)
    });
    terminal.open(this._div);
    terminal.setHypertextLinkHandler((e, u) => _electron.shell.openExternal(u));
    this._syncAtomStyle();
    terminal.attachCustomKeyEventHandler(this._checkIfKeyBoundOrDivertToXTerm.bind(this));
    this._subscriptions.add(() => terminal.destroy());
    registerLinkHandlers(terminal);

    this._subscriptions.add(atom.commands.add(div, 'core:copy', () => {
      document.execCommand('copy');
    }), atom.commands.add(div, 'core:paste', () => {
      document.execCommand('paste');
    }), atom.commands.add(div, ADD_ESCAPE_COMMAND, this._addEscapePrefix.bind(this)), atom.commands.add(div, 'nuclide-terminal:clear', this._clear.bind(this)), (_featureConfig || _load_featureConfig()).default.observeAsStream(CURSOR_STYLE_CONFIG).skip(1).subscribe(cursorStyle => terminal.setOption('cursorStyle', cursorStyle)), (_featureConfig || _load_featureConfig()).default.observeAsStream(CURSOR_BLINK_CONFIG).skip(1).subscribe(cursorBlink => terminal.setOption('cursorBlink', cursorBlink)), (_featureConfig || _load_featureConfig()).default.observeAsStream(SCROLLBACK_CONFIG).skip(1).subscribe(scrollback => terminal.setOption('scrollback', scrollback)), _rxjsBundlesRxMinJs.Observable.merge(_rxjsBundlesRxMinJs.Observable.fromEvent(this._terminal, 'focus'), _rxjsBundlesRxMinJs.Observable.fromEvent(window, 'resize'), new (_observableDom || _load_observableDom()).ResizeObservable(this._div)).subscribe(this._fitAndResize.bind(this)));

    if (process.platform === 'win32') {
      // On Windows, add Putty-style highlight and right click to copy, right click to paste.
      this._subscriptions.add(_rxjsBundlesRxMinJs.Observable.fromEvent(div, 'contextmenu').subscribe(e => {
        // Note: Manipulating the clipboard directly because atom's core:copy and core:paste
        // commands are not working correctly with terminal selection.
        if (terminal.hasSelection()) {
          // $FlowFixMe: add types for clipboard
          _electron.clipboard.writeText(terminal.selectionManager.selectionText);
        } else {
          document.execCommand('paste');
        }
        terminal.selectionManager.clearSelection();
        terminal.focus();
        e.stopPropagation();
      }));
    }

    if (cwd != null && (_nuclideUri || _load_nuclideUri()).default.isRemote(cwd)) {
      this._subscriptions.add((_nuclideRemoteConnection || _load_nuclideRemoteConnection()).ServerConnection.onDidCloseServerConnection(connection => {
        if ((_nuclideUri || _load_nuclideUri()).default.getHostname(cwd) === connection.getRemoteHostname()) {
          this._closeTab();
        }
      }));
    }

    // div items don't support a 'focus' event, and we need to forward.
    this._div.focus = () => terminal.focus();
    this._div.blur = () => terminal.blur();

    this._spawn(cwd);
  }

  _spawn(cwd) {
    const command = this._command;
    const info = Object.assign({
      terminalType: 'xterm-256color',
      environment: this._terminalInfo.environmentVariables
    }, command == null ? {} : { command });
    if (cwd == null || (_nuclideUri || _load_nuclideUri()).default.isLocal(cwd) || (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).RemoteConnection.getByHostname((_nuclideUri || _load_nuclideUri()).default.getHostname(cwd)).length > 0) {
      this._setUseTitleAsPath(cwd);
      const promise = cwd == null ? (0, (_nuclidePtyRpc || _load_nuclidePtyRpc()).spawn)(info, this) : (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getPtyServiceByNuclideUri)(cwd).spawn(Object.assign({}, info, { cwd: (_nuclideUri || _load_nuclideUri()).default.getPath(cwd) }), this);
      promise.then(pty => this._onPtyFulfill(pty)).catch(error => this._onPtyFail(error));
    } else {
      // If the remote connection is not ready, retry when we see a new connection.
      const subscription = (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).RemoteConnection.onDidAddRemoteConnection(connection => {
        if ((_nuclideRemoteConnection || _load_nuclideRemoteConnection()).RemoteConnection.getForUri(cwd) != null) {
          this._subscriptions.remove(subscription);
          subscription.dispose();
          this._spawn(cwd);
        }
      });
      this._subscriptions.add(subscription);
    }
  }

  _setUseTitleAsPath(cwd) {
    const promise = cwd == null ? (0, (_nuclidePtyRpc || _load_nuclidePtyRpc()).useTitleAsPath)(this) : (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getPtyServiceByNuclideUri)(cwd).useTitleAsPath(this);
    promise.then(value => this._useTitleAsPath = value);
  }

  _onPtyFulfill(pty) {
    if (!(this._pty == null)) {
      throw new Error('Invariant violation: "this._pty == null"');
    }

    this._pty = pty;

    const now = (0, (_performanceNow || _load_performanceNow()).default)();
    this._focusStart = now;
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('nuclide-terminal.started', {
      pane: this._paneUri,
      uri: this._cwd,
      startDelay: Math.round(now - this._startTime)
    });

    this._subscriptions.add(this.dispose.bind(this), _rxjsBundlesRxMinJs.Observable.fromEvent(this._terminal, 'data').subscribe(this._onInput.bind(this)), _rxjsBundlesRxMinJs.Observable.fromEvent(this._terminal, 'title').subscribe(title => {
      this._setTitle(title);
      if (this._useTitleAsPath) {
        this._setPath(title);
      }
    }), _rxjsBundlesRxMinJs.Observable.interval(10 * 1000).startWith(0).map(() => atom.workspace.paneForItem(this)).filter(pane => pane != null).first().switchMap(pane => {
      if (!(pane != null)) {
        throw new Error('Invariant violation: "pane != null"');
      }

      return (0, (_event || _load_event()).observableFromSubscribeFunction)(pane.onDidChangeFlexScale.bind(pane));
    }).subscribe(this._syncAtomStyle.bind(this)), _rxjsBundlesRxMinJs.Observable.interval(60 * 60 * 1000).subscribe(() => (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('nuclide-terminal.hourly', this._statistics())), _rxjsBundlesRxMinJs.Observable.fromEvent(this._terminal, 'focus').subscribe(this._focused.bind(this)), _rxjsBundlesRxMinJs.Observable.fromEvent(this._terminal, 'blur').subscribe(this._blurred.bind(this)));
  }

  _focused() {
    if (this._focusStart == null) {
      this._focusStart = (0, (_performanceNow || _load_performanceNow()).default)();
    }
  }

  _blurred() {
    const focusStart = this._focusStart;
    if (focusStart != null) {
      this._focusStart = null;
      this._focusDuration += (0, (_performanceNow || _load_performanceNow()).default)() - focusStart;
    }
  }

  _statistics() {
    const now = (0, (_performanceNow || _load_performanceNow()).default)();
    const focusStart = this._focusStart;
    const focusDuration = this._focusDuration + (focusStart == null ? 0 : now - focusStart);
    const { query } = _url.default.parse(this._paneUri, true);
    const id = query == null ? null : query.unique;

    return {
      id,
      uri: this._cwd,
      focusDuration: Math.round(focusDuration),
      duration: Math.round(now - this._startTime),
      bytesIn: this._bytesIn,
      bytesOut: this._bytesOut
    };
  }

  _onPtyFail(error) {
    this._terminal.writeln('Error starting process:');
    for (const line of String(error).split('\n')) {
      this._terminal.writeln(line);
    }
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('nuclide-terminal.failed', {
      pane: this._paneUri,
      uri: this._cwd,
      startDelay: Math.round((0, (_performanceNow || _load_performanceNow()).default)() - this._startTime),
      error: String(error)
    });
  }

  // Our Activation updates the global style sheet in response to the same config
  // changes we are listening to.  We need to ensure the style sheet is in place
  // before we measure and resize, so we setTimeout to run on the tick after config
  // notifications go out.
  _syncAtomStyle() {
    for (const attr of ['fontFamily', 'fontSize', 'lineHeight']) {
      this._syncAtomStyleItem(attr);
    }
    setTimeout(() => {
      this._fitAndResize();
    }, 0);
  }

  _syncAtomStyleItem(name) {
    const item = atom.config.get(`editor.${name}`);
    if (item != null && item !== '') {
      this._terminal.setOption(name, item);
    }
  }

  _fitAndResize() {
    // Force character measure before 'fit' runs.
    this._terminal.resize(this._terminal.cols, this._terminal.rows);
    this._terminal.fit();
    if (this._pty != null) {
      this._pty.resize(this._terminal.cols, this._terminal.rows);
    }
    this._syncAtomTheme();
  }

  _syncAtomTheme() {
    const terminal = this._terminal;
    const div = this._div;
    terminal.setOption('theme', getTerminalTheme(div));
  }

  _clear() {
    this._terminal.clear();
  }

  _onInput(data) {
    if (this._pty != null) {
      this._bytesIn += data.length;
      this._pty.writeInput(data);
    }
  }

  _setTitle(title) {
    this._title = title;
    this._emitter.emit('did-change-title', title);
  }

  _setPath(path) {
    this._path = path;
    this._emitter.emit('did-change-path', path);
  }

  _addEscapePrefix(event) {
    if (typeof event.originalEvent === 'object') {
      const keyEvent = event.originalEvent;
      if (typeof keyEvent.key === 'string') {
        this._onInput(`\x1B${keyEvent.key}`);
      }
    }
  }

  _checkIfKeyBoundOrDivertToXTerm(event) {
    // Only allow input if we have somewhere to send it.
    if (this._pty == null) {
      return false;
    }

    const keystroke = atom.keymaps.keystrokeForKeyboardEvent(event);
    const bindings = atom.keymaps.findKeyBindings({
      keystrokes: keystroke,
      target: this._div
    });
    const preserved = this._preservedCommands;

    if (preserved.has(ADD_ESCAPE_COMMAND) && bindings.some(b => b.command === ADD_ESCAPE_COMMAND)) {
      // Intercept the add escape binding and send escape directly, then
      // divert to xterm (to handle keys like Backspace).
      this._onInput('\x1B');
      return true;
    }

    const result = !bindings.some(b => preserved.has(b.command));
    // This facilitates debugging keystroke issues.  You can set a breakpoint
    // in the else block without stopping on modifier keys.
    if (keystroke === 'alt' || keystroke === 'shift' || keystroke === 'ctrl' || keystroke === 'cmd') {
      return result;
    } else {
      return result;
    }
  }

  _createOutputSink() {
    let tmuxLines = 0;
    let lines = 0;
    let firstChar = null;
    let warned = false;
    return (0, (_sink || _load_sink()).removePrefixSink)(TMUX_CONTROLCONTROL_PREFIX, (0, (_sink || _load_sink()).patternCounterSink)('\n%', n => ++tmuxLines < 2, (0, (_sink || _load_sink()).patternCounterSink)('\n', n => ++lines < 2, data => {
      if (firstChar == null && data.length > 0) {
        firstChar = data.charAt(0);
      }
      if (firstChar === '%' && tmuxLines === lines && tmuxLines >= 2 && !warned) {
        warned = true;
        atom.notifications.addWarning('Tmux control protocol detected', {
          detail: 'The terminal output looks like you might be using tmux with -C or -CC.  ' + 'Nuclide terminal can be used with tmux, but not with the -C or -CC options.  ' + 'In your ~/.bashrc or similar, you can avoid invocations of tmux -C (or -CC) ' + 'in Nuclide terminal by checking:\n' + '  if [ "$TERM_PROGRAM" != nuclide ]; then\n' + '    tmux -C ...\n' + '  fi',
          dismissable: true
        });
      }
      this._terminal.write(data);
    })));
  }

  _closeTab() {
    const pane = atom.workspace.paneForItem(this);
    if (pane != null) {
      pane.destroyItem(this);
    }
  }

  onOutput(data) {
    this._bytesOut += data.length;
    this._processOutput(data);

    if (this._isFirstOutput) {
      this._isFirstOutput = false;
      this._onInput(this._initialInput);
    }
  }

  onExit(code, signal) {
    const terminal = this._terminal;
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('nuclide-terminal.exit', Object.assign({}, this._statistics(), { code, signal }));

    if (code === 0 && !this._terminalInfo.remainOnCleanExit) {
      this._closeTab();
      return;
    }

    terminal.writeln('');
    terminal.writeln('');
    const command = this._terminalInfo.command;
    const process = command == null ? 'Process' : `${command.file} ${command.args.join(' ')}`;
    terminal.writeln(`${process} exited with error code '${code}'.`);
    if (signal !== 0) {
      terminal.writeln(`  killed by signal '${signal}'.`);
    }
    terminal.writeln('');

    this._disableTerminal();
  }

  _disableTerminal() {
    this.dispose();
    this._terminal.blur();

    // Disable terminal's ability to capture input once in error state.
    this._div.focus = () => {};
    this._div.blur = () => {};
  }

  setProcessExitCallback(callback) {
    this._processExitCallback = callback;
  }

  terminateProcess() {
    if (this._pty != null) {
      this._disableTerminal();
      this._terminal.writeln('');
      this._terminal.writeln('Process terminated.');
      this._terminal.writeln('');
    }
  }

  copy() {
    const paneUri = (0, (_nuclideTerminalUri || _load_nuclideTerminalUri()).uriFromInfo)(this._terminalInfo);
    return new TerminalView(paneUri);
  }

  // Remote connection is closing--note the window remains open to show error
  // output if the process exit code was not 0.
  dispose() {
    if (this._pty != null) {
      this._pty.dispose();
      this._pty = null;
    }

    this._processExitCallback();
    this._processExitCallback = () => {};
  }

  // Window is closing, so close everything.
  destroy() {
    this._subscriptions.dispose();
  }

  getTitle() {
    return this._title;
  }

  getIconName() {
    return this._terminalInfo.icon;
  }

  getURI() {
    return this._paneUri;
  }

  getDefaultLocation() {
    return this._terminalInfo.defaultLocation;
  }

  getElement() {
    return this._div;
  }

  getPath() {
    return this._path;
  }

  onDidChangePath(callback) {
    return this.on('did-change-path', callback);
  }

  onDidChangeTitle(callback) {
    return this.on('did-change-title', callback);
  }

  on(name, callback) {
    return this._emitter.on(name, callback);
  }

  serialize() {
    return {
      deserializer: 'TerminalView',
      paneUri: this._paneUri
    };
  }
}

exports.TerminalView = TerminalView;
function deserializeTerminalView(state) {
  // Convert from/to uri to generate a new unique id.
  const info = (0, (_nuclideTerminalUri || _load_nuclideTerminalUri()).infoFromUri)(state.paneUri, true);
  const paneUri = (0, (_nuclideTerminalUri || _load_nuclideTerminalUri()).uriFromInfo)(info);
  return new TerminalView(paneUri);
}

function registerLinkHandlers(terminal) {
  const bindings = [{
    // Diff (e.g. 'D1234') with word boundary on either side.
    regex: /\bD[1-9][0-9]{3,}\b/,
    matchIndex: 0,
    urlPrefix: 'https://phabricator.intern.facebook.com/'
  }, {
    // Paste (e.g. 'P1234') with word boundary on either side.
    regex: /\bP[1-9][0-9]{3,}\b/,
    matchIndex: 0,
    urlPrefix: 'https://phabricator.intern.facebook.com/'
  }, {
    // Task (e.g. 't1234' or 'T1234') with word boundary on either side.
    // Note the [tT] is not included in the resulting URL.
    regex: /\b[tT]([1-9][0-9]{3,})\b/,
    matchIndex: 1,
    urlPrefix: 'https://our.intern.facebook.com/intern/tasks?t='
  }, {
    // Task (e.g. '#1234') preceded by beginning-of-line or whitespace and followed
    // by word boundary.  Unfortunately, since '#' is punctuation, the point before
    // it is not normally a word boundary, so this has to be registered separately.
    regex: /(^|\s)#([1-9][0-9]{3,})\b/,
    matchIndex: 2,
    urlPrefix: 'https://our.intern.facebook.com/intern/tasks?t='
  }];

  for (const _ref of bindings) {
    const { regex, matchIndex, urlPrefix } = _ref;

    terminal.linkifier.registerLinkMatcher(regex, (event, match) => _electron.shell.openExternal(urlPrefix + match), { matchIndex });
  }
}

// As a precaution, we should not let any undisplayable or potentially unsafe characters through
function getSafeInitialInput(initialInput) {
  for (let i = 0; i < initialInput.length; i++) {
    const code = initialInput.charCodeAt(i);
    // ASCII codes under 32 and 127 are control characters (potentially dangerous)
    // ASCII codes 128-165 are extended ASCII characters that have uses in other languages
    if (code < 32 || code === 127 || code > 165) {
      atom.notifications.addWarning('Initial input for terminal unable to be prefilled', {
        detail: `Potentially malicious characters were found in the prefill command: ${initialInput}`,
        dismissable: true
      });
      return '';
    }
  }
  return initialInput;
}

function getTerminalTheme(div) {
  const style = window.getComputedStyle(div);
  const foreground = convertRgbToHash(style.getPropertyValue('color'));
  const background = convertRgbToHash(style.getPropertyValue('background-color'));
  return {
    foreground,
    background,
    cursor: foreground
  };
}

// Terminal only allows colors of the form '#rrggbb' or '#rgb' and falls back
// to black otherwise. https://git.io/vNE8a  :-(
const rgbRegex = / *rgb *\( *([0-9]+) *, *([0-9]+) *, *([0-9]+) *\) */;
function convertRgbToHash(rgb) {
  const matches = rgb.match(rgbRegex);
  if (matches == null) {
    return rgb;
  }
  return '#' + matches.slice(1, 4).map(Number).map(n => (n < 0x10 ? '0' : '') + n.toString(16)).join('');
}