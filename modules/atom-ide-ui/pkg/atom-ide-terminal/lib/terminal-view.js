'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TerminalView = exports.URI_PREFIX = undefined;
exports.deserializeTerminalView = deserializeTerminalView;
exports.getSafeInitialInput = getSafeInitialInput;

var _atom = require('atom');

var _electron = require('electron');

var _observePaneItemVisibility;

function _load_observePaneItemVisibility() {
  return _observePaneItemVisibility = _interopRequireDefault(require('../../../../nuclide-commons-atom/observePaneItemVisibility'));
}

var _projects;

function _load_projects() {
  return _projects = require('../../../../nuclide-commons-atom/projects');
}

var _event;

function _load_event() {
  return _event = require('../../../../nuclide-commons/event');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _url = _interopRequireDefault(require('url'));

var _AtomServiceContainer;

function _load_AtomServiceContainer() {
  return _AtomServiceContainer = require('./AtomServiceContainer');
}

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('../../../../nuclide-commons-atom/feature-config'));
}

var _observableDom;

function _load_observableDom() {
  return _observableDom = require('../../../../nuclide-commons-ui/observable-dom');
}

var _performanceNow;

function _load_performanceNow() {
  return _performanceNow = _interopRequireDefault(require('../../../../nuclide-commons/performanceNow'));
}

var _createTerminal;

function _load_createTerminal() {
  return _createTerminal = require('./createTerminal');
}

var _nuclideTerminalUri;

function _load_nuclideTerminalUri() {
  return _nuclideTerminalUri = require('./nuclide-terminal-uri');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../../nuclide-commons/nuclideUri'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../../nuclide-commons/UniversalDisposable'));
}

var _analytics;

function _load_analytics() {
  return _analytics = require('../../../../nuclide-commons/analytics');
}

var _goToLocation;

function _load_goToLocation() {
  return _goToLocation = require('../../../../nuclide-commons-atom/go-to-location');
}

var _config;

function _load_config() {
  return _config = require('./config');
}

var _sink;

function _load_sink() {
  return _sink = require('./sink');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
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

/* eslint-env browser */

const TMUX_CONTROLCONTROL_PREFIX = '\x1BP1000p';
const URI_PREFIX = exports.URI_PREFIX = 'atom://nuclide-terminal-view';

class TerminalView {

  constructor(paneUri) {
    this._syncFontAndFit = () => {
      this._setTerminalOption('fontSize', (0, (_config || _load_config()).getFontSize)());
      this._setTerminalOption('lineHeight', (_featureConfig || _load_featureConfig()).default.get((_config || _load_config()).LINE_HEIGHT_CONFIG));
      this._setTerminalOption('fontFamily', (_featureConfig || _load_featureConfig()).default.get((_config || _load_config()).FONT_FAMILY_CONFIG));
      this._fitAndResize();
    };

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

    subscriptions.add((_featureConfig || _load_featureConfig()).default.observeAsStream((_config || _load_config()).PRESERVED_COMMANDS_CONFIG).subscribe(preserved => {
      this._preservedCommands = new Set([...(preserved || []), ...(info.preservedCommands || [])]);
    }), atom.config.onDidChange('core.themes', this._syncAtomTheme.bind(this)), atom.themes.onDidChangeActiveThemes(this._syncAtomTheme.bind(this)));

    subscriptions.add(
    // Skip the first value because the observe callback triggers once when
    // we begin observing, duplicating work in the constructor.
    ...Object.keys((_config || _load_config()).COLOR_CONFIGS).map(color => (_featureConfig || _load_featureConfig()).default.observeAsStream((_config || _load_config()).COLOR_CONFIGS[color]).skip(1).subscribe(this._syncAtomTheme.bind(this))));

    const div = this._div = document.createElement('div');
    div.classList.add('terminal-pane');
    subscriptions.add(() => div.remove());

    const terminal = this._terminal = (0, (_createTerminal || _load_createTerminal()).createTerminal)();
    terminal.attachCustomKeyEventHandler(this._checkIfKeyBoundOrDivertToXTerm.bind(this));
    this._subscriptions.add(() => terminal.dispose());
    terminal.webLinksInit(openLink);
    registerLinkHandlers(terminal, this._cwd);

    this._subscriptions.add(atom.commands.add(div, 'core:copy', () => {
      document.execCommand('copy');
    }), atom.commands.add(div, 'core:paste', () => {
      document.execCommand('paste');
    }), atom.commands.add(div, (_config || _load_config()).ADD_ESCAPE_COMMAND, this._addEscapePrefix.bind(this)), atom.commands.add(div, 'atom-ide-terminal:clear', this._clear.bind(this)));

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
      this._subscriptions.add((0, (_projects || _load_projects()).observeRemovedHostnames)().subscribe(hostname => {
        if ((_nuclideUri || _load_nuclideUri()).default.getHostname(cwd) === hostname) {
          this._closeTab();
        }
      }));
    }

    // div items don't support a 'focus' event, and we need to forward.
    this._div.focus = () => terminal.focus();
    this._div.blur = () => terminal.blur();

    // Terminal.open only works after its div has been attached to the DOM,
    // which happens in getElement, not in this constructor. Therefore delay
    // open and spawn until the div is visible, which means it is in the DOM.
    this._subscriptions.add((0, (_observePaneItemVisibility || _load_observePaneItemVisibility()).default)(this).filter(Boolean).first().subscribe(() => {
      terminal.open(this._div);
      div.terminal = terminal;
      if ((_featureConfig || _load_featureConfig()).default.get((_config || _load_config()).DOCUMENTATION_MESSAGE_CONFIG)) {
        const docsUrl = 'https://nuclide.io/docs/features/terminal';
        terminal.writeln(`For more info check out the docs: ${docsUrl}`);
      }
      terminal.focus();
      this._subscriptions.add(this._subscribeFitEvents());
      this._spawn(cwd).then(pty => this._onPtyFulfill(pty)).catch(error => this._onPtyFail(error));
    }));
  }

  _subscribeFitEvents() {
    return new (_UniversalDisposable || _load_UniversalDisposable()).default((_featureConfig || _load_featureConfig()).default.observeAsStream((_config || _load_config()).CURSOR_STYLE_CONFIG).skip(1).subscribe(cursorStyle => this._setTerminalOption('cursorStyle', cursorStyle)), (_featureConfig || _load_featureConfig()).default.observeAsStream((_config || _load_config()).CURSOR_BLINK_CONFIG).skip(1).subscribe(cursorBlink => this._setTerminalOption('cursorBlink', cursorBlink)), (_featureConfig || _load_featureConfig()).default.observeAsStream((_config || _load_config()).SCROLLBACK_CONFIG).skip(1).subscribe(scrollback => this._setTerminalOption('scrollback', scrollback)), _rxjsBundlesRxMinJs.Observable.merge((0, (_event || _load_event()).observableFromSubscribeFunction)(cb => atom.config.onDidChange('editor.fontSize', cb)), (_featureConfig || _load_featureConfig()).default.observeAsStream((_config || _load_config()).FONT_SCALE_CONFIG).skip(1), (_featureConfig || _load_featureConfig()).default.observeAsStream((_config || _load_config()).FONT_FAMILY_CONFIG).skip(1), (_featureConfig || _load_featureConfig()).default.observeAsStream((_config || _load_config()).LINE_HEIGHT_CONFIG).skip(1), _rxjsBundlesRxMinJs.Observable.fromEvent(this._terminal, 'focus'), _rxjsBundlesRxMinJs.Observable.fromEvent(window, 'resize'), new (_observableDom || _load_observableDom()).ResizeObservable(this._div)).subscribe(this._syncFontAndFit));
  }

  _spawn(cwd) {
    const command = this._command;
    const info = Object.assign({
      terminalType: 'xterm-256color',
      environment: this._terminalInfo.environmentVariables
    }, command == null ? {} : { command });
    const performSpawn = () => {
      this._setUseTitleAsPath(cwd);
      return (0, (_AtomServiceContainer || _load_AtomServiceContainer()).getPtyServiceByNuclideUri)(cwd).spawn(cwd != null ? Object.assign({}, info, { cwd: (_nuclideUri || _load_nuclideUri()).default.getPath(cwd) }) : info, this);
    };
    if (cwd == null || (_nuclideUri || _load_nuclideUri()).default.isLocal(cwd)) {
      return performSpawn();
    } else {
      const cwdHostname = (_nuclideUri || _load_nuclideUri()).default.getHostname(cwd);
      // Wait for the remote connection to be added before spawning.
      const hostnameAddedPromise = (0, (_projects || _load_projects()).observeAddedHostnames)().filter(hostname => hostname === cwdHostname).take(1).toPromise();
      return hostnameAddedPromise.then(performSpawn);
    }
  }

  _setUseTitleAsPath(cwd) {
    (0, (_AtomServiceContainer || _load_AtomServiceContainer()).getPtyServiceByNuclideUri)(cwd).useTitleAsPath(this).then(value => this._useTitleAsPath = value);
  }

  _onPtyFulfill(pty) {
    if (!(this._pty == null)) {
      throw new Error('Invariant violation: "this._pty == null"');
    }

    this._pty = pty;

    const now = (0, (_performanceNow || _load_performanceNow()).default)();
    this._focusStart = now;
    (0, (_analytics || _load_analytics()).track)('nuclide-terminal.started', {
      pane: this._paneUri,
      uri: this._cwd,
      startDelay: Math.round(now - this._startTime)
    });

    this._subscriptions.add(this.dispose.bind(this), _rxjsBundlesRxMinJs.Observable.fromEvent(this._terminal, 'data').subscribe(this._onInput.bind(this)), _rxjsBundlesRxMinJs.Observable.fromEvent(this._terminal, 'title').subscribe(title => {
      this._setTitle(title);
      if (this._useTitleAsPath) {
        this._setPath(title);
      }
    }), _rxjsBundlesRxMinJs.Observable.interval(60 * 60 * 1000).subscribe(() => (0, (_analytics || _load_analytics()).track)('nuclide-terminal.hourly', this._statistics())), _rxjsBundlesRxMinJs.Observable.fromEvent(this._terminal, 'focus').subscribe(this._focused.bind(this)), _rxjsBundlesRxMinJs.Observable.fromEvent(this._terminal, 'blur').subscribe(this._blurred.bind(this)));
    this._syncFontAndFit();
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
    (0, (_analytics || _load_analytics()).track)('nuclide-terminal.failed', {
      pane: this._paneUri,
      uri: this._cwd,
      startDelay: Math.round((0, (_performanceNow || _load_performanceNow()).default)() - this._startTime),
      error: String(error)
    });
  }

  // Since changing the font settings may resize the contents, we have to
  // trigger a re-fit when updating font settings.


  _setTerminalOption(optionName, value) {
    if (this._terminal.getOption(optionName) !== value) {
      this._terminal.setOption(optionName, value);
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
    // documented workaround for https://github.com/xtermjs/xterm.js/issues/291
    // see https://github.com/Microsoft/vscode/commit/134cbec22f81d5558909040491286d72b547bee6
    this._terminal.emit('scroll', this._terminal.buffer.ydisp);
  }

  _syncAtomTheme() {
    const div = this._div;
    this._setTerminalOption('theme', getTerminalTheme(div));
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

    if (preserved.has((_config || _load_config()).ADD_ESCAPE_COMMAND) && bindings.some(b => b.command === (_config || _load_config()).ADD_ESCAPE_COMMAND)) {
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
    (0, (_analytics || _load_analytics()).track)('nuclide-terminal.exit', Object.assign({}, this._statistics(), { code, signal }));

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

function registerLinkHandlers(terminal, cwd) {
  const diffPattern = toString((_featureConfig || _load_featureConfig()).default.get('atom-ide-console.diffUrlPattern'));
  const taskPattern = toString((_featureConfig || _load_featureConfig()).default.get('atom-ide-console.taskUrlPattern'));
  const bindings = [{
    // Diff (e.g. 'D1234') with word boundary on either side.
    regex: /\bD[1-9][0-9]{3,}\b/,
    matchIndex: 0,
    urlPattern: diffPattern
  }, {
    // Paste (e.g. 'P1234') with word boundary on either side.
    regex: /\bP[1-9][0-9]{3,}\b/,
    matchIndex: 0,
    urlPattern: diffPattern
  }, {
    // Task (e.g. 't1234' or 'T1234') with word boundary on either side.
    // Note the [tT] is not included in the resulting URL.
    regex: /\b[tT]([1-9][0-9]{3,})\b/,
    matchIndex: 1,
    urlPattern: taskPattern
  }, {
    // Task (e.g. '#1234') preceded by beginning-of-line or whitespace and followed
    // by word boundary.  Unfortunately, since '#' is punctuation, the point before
    // it is not normally a word boundary, so this has to be registered separately.
    regex: /(^|\s)#([1-9][0-9]{3,})\b/,
    matchIndex: 2,
    urlPattern: taskPattern
  }, {
    // An absolute file path
    regex: /(^|\s)(\/[^<>:"\\|?*[\]\s]+)/,
    matchIndex: 2,
    urlPattern: 'open-file-object://%s'
  }];

  for (const _ref of bindings) {
    const { regex, matchIndex, urlPattern } = _ref;

    terminal.linkifier.registerLinkMatcher(regex, (event, match) => {
      const replacedUrl = urlPattern.replace('%s', match);
      if (replacedUrl !== '') {
        const commandClicked = process.platform === 'win32' ? event.ctrlKey : event.metaKey;
        if (commandClicked && tryOpenInAtom(replacedUrl, cwd)) {
          return;
        }
        _electron.shell.openExternal(replacedUrl);
      }
    }, { matchIndex });
  }
}

function tryOpenInAtom(link, cwd) {
  const parsed = _url.default.parse(link);

  if (parsed.protocol === 'open-file-object:') {
    let path = parsed.path;
    if (path != null) {
      if (cwd != null && (_nuclideUri || _load_nuclideUri()).default.isRemote(cwd)) {
        const terminalLocation = (_nuclideUri || _load_nuclideUri()).default.parseRemoteUri(cwd);
        path = (_nuclideUri || _load_nuclideUri()).default.createRemoteUri(terminalLocation.hostname, path);
      }

      (0, (_goToLocation || _load_goToLocation()).goToLocation)(path);
    }
    return true;
  }

  return false;
}

function openLink(event, link) {
  _electron.shell.openExternal(trimTrailingDot(link));
}

function trimTrailingDot(s) {
  return s.endsWith('.') ? s.substring(0, s.length - 1) : s;
}

function toString(value) {
  return typeof value === 'string' ? value : '';
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

function getTerminalColors() {
  const colorsMap = {};
  for (const color of Object.keys((_config || _load_config()).COLOR_CONFIGS)) {
    const configValue = (_featureConfig || _load_featureConfig()).default.get((_config || _load_config()).COLOR_CONFIGS[color]);
    // config value may be string when Atom deserializes the terminal package
    // on startup, and it may be undefined if this is the first time the package
    // is being deserialized after the config was added.
    if (configValue != null) {
      if (typeof configValue === 'string') {
        colorsMap[color] = configValue;
      } else {
        colorsMap[color] = configValue.toHexString();
      }
    }
  }
  return colorsMap;
}

function getTerminalTheme(div) {
  const style = window.getComputedStyle(div);
  const foreground = style.getPropertyValue('color');
  const background = style.getPropertyValue('background-color');
  // return type: https://git.io/vxooH
  return Object.assign({
    foreground,
    background,
    cursor: foreground
  }, getTerminalColors());
}