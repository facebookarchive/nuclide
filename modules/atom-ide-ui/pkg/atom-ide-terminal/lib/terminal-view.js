"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.deserializeTerminalView = deserializeTerminalView;
exports.getSafeInitialInput = getSafeInitialInput;
exports.TerminalView = void 0;

var _atom = require("atom");

var _electron = require("electron");

function _observePaneItemVisibility() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons-atom/observePaneItemVisibility"));

  _observePaneItemVisibility = function () {
    return data;
  };

  return data;
}

function _projects() {
  const data = require("../../../../nuclide-commons-atom/projects");

  _projects = function () {
    return data;
  };

  return data;
}

function _event() {
  const data = require("../../../../nuclide-commons/event");

  _event = function () {
    return data;
  };

  return data;
}

function _observable() {
  const data = require("../../../../nuclide-commons/observable");

  _observable = function () {
    return data;
  };

  return data;
}

var _rxjsCompatUmdMin = require("rxjs-compat/bundles/rxjs-compat.umd.min.js");

var _url = _interopRequireDefault(require("url"));

function _AtomServiceContainer() {
  const data = require("./AtomServiceContainer");

  _AtomServiceContainer = function () {
    return data;
  };

  return data;
}

function _featureConfig() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons-atom/feature-config"));

  _featureConfig = function () {
    return data;
  };

  return data;
}

function _observableDom() {
  const data = require("../../../../nuclide-commons-ui/observable-dom");

  _observableDom = function () {
    return data;
  };

  return data;
}

function _performanceNow() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons/performanceNow"));

  _performanceNow = function () {
    return data;
  };

  return data;
}

function _createTerminal() {
  const data = require("./createTerminal");

  _createTerminal = function () {
    return data;
  };

  return data;
}

function _measurePerformance() {
  const data = _interopRequireDefault(require("./measure-performance"));

  _measurePerformance = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _analytics() {
  const data = require("../../../../nuclide-commons/analytics");

  _analytics = function () {
    return data;
  };

  return data;
}

function _goToLocation() {
  const data = require("../../../../nuclide-commons-atom/go-to-location");

  _goToLocation = function () {
    return data;
  };

  return data;
}

function _config() {
  const data = require("./config");

  _config = function () {
    return data;
  };

  return data;
}

function _sink() {
  const data = require("./sink");

  _sink = function () {
    return data;
  };

  return data;
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
class TerminalView {
  constructor(info) {
    this._syncFontAndFit = terminal => {
      (0, _config().syncTerminalFont)(terminal); // Force character measure before 'fit' runs.

      terminal.resize(terminal.cols, terminal.rows);
      terminal.fit();

      if (this._pty != null) {
        this._pty.resize(terminal.cols, terminal.rows);
      }

      this._syncAtomTheme(terminal); // documented workaround for https://github.com/xtermjs/xterm.js/issues/291
      // see https://github.com/Microsoft/vscode/commit/134cbec22f81d5558909040491286d72b547bee6
      // $FlowIgnore: using unofficial _core interface defined in https://github.com/Microsoft/vscode/blob/master/src/typings/vscode-xterm.d.ts#L682-L706


      terminal.emit('scroll', terminal._core.buffer.ydisp);
    };

    this._terminalInfo = info;
    const cwd = this._cwd = info.cwd;
    this._command = info.command == null ? null : info.command;
    this._key = info.key;
    this._title = info.title == null ? 'terminal' : info.title;
    this._path = cwd;
    this._initialInput = info.initialInput == null ? '' : getSafeInitialInput(info.initialInput);

    this._processExitCallback = () => {};

    this._useTitleAsPath = false;
    this._startTime = (0, _performanceNow().default)();
    this._bytesIn = 0;
    this._bytesOut = 0;
    this._focusStart = null;
    this._focusDuration = 0;
    this._isFirstOutput = true;
    const subscriptions = this._subscriptions = new (_UniversalDisposable().default)();
    this._emitter = new _atom.Emitter();
    subscriptions.add(this._emitter);
    const div = this._div = document.createElement('div');
    div.classList.add('terminal-pane');
    subscriptions.add(() => div.remove());

    if (cwd != null && _nuclideUri().default.isRemote(cwd)) {
      this._subscriptions.add((0, _projects().observeRemovedHostnames)().subscribe(hostname => {
        if (_nuclideUri().default.getHostname(cwd) === hostname) {
          this._closeTab();
        }
      }));
    } // Terminal.open only works after its div has been attached to the DOM,
    // which happens in getElement, not in this constructor. Therefore delay
    // open and spawn until the div is visible, which means it is in the DOM.


    const gkService = (0, _AtomServiceContainer().getGkService)();
    const preferDom = gkService != null ? gkService.passesGK('nuclide_terminal_prefer_dom') : Promise.resolve(false);

    this._subscriptions.add(_rxjsCompatUmdMin.Observable.combineLatest(_rxjsCompatUmdMin.Observable.fromPromise(preferDom), (0, _observePaneItemVisibility().default)(this).filter(Boolean).first()).subscribe(([passesPreferDom]) => {
      const rendererType = _featureConfig().default.get(_config().RENDERER_TYPE_CONFIG);

      const terminal = (0, _createTerminal().createTerminal)( // $FlowIgnore: rendererType config not yet added in flow typing
      passesPreferDom && rendererType === 'auto' ? {
        rendererType: 'dom'
      } : {});

      this._onTerminalCreation(terminal);

      terminal.open(this._div);
      div.terminal = terminal;

      if (_featureConfig().default.get(_config().DOCUMENTATION_MESSAGE_CONFIG)) {
        const docsUrl = 'https://nuclide.io/docs/features/terminal';
        terminal.writeln(`For more info check out the docs: ${docsUrl}`);
      }

      terminal.focus();

      this._subscriptions.add(this._subscribeFitEvents(terminal));

      this._spawn(cwd).then(pty => this._onPtyFulfill(pty, terminal)).catch(error => this._onPtyFail(error, terminal));
    }));
  }

  _subscribeFitEvents(terminal) {
    return new (_UniversalDisposable().default)((0, _config().subscribeConfigChanges)(terminal), _rxjsCompatUmdMin.Observable.combineLatest((0, _observePaneItemVisibility().default)(this), _rxjsCompatUmdMin.Observable.merge((0, _event().observableFromSubscribeFunction)(cb => atom.config.onDidChange('editor.fontSize', cb)), _featureConfig().default.observeAsStream(_config().FONT_SCALE_CONFIG).skip(1), _featureConfig().default.observeAsStream(_config().FONT_FAMILY_CONFIG).skip(1), _featureConfig().default.observeAsStream(_config().LINE_HEIGHT_CONFIG).skip(1), _rxjsCompatUmdMin.Observable.fromEvent(terminal, 'focus'), // Debounce resize observables to reduce lag.
    _rxjsCompatUmdMin.Observable.merge(_rxjsCompatUmdMin.Observable.fromEvent(window, 'resize'), new (_observableDom().ResizeObservable)(this._div)).let((0, _observable().fastDebounce)(100))).startWith(null)) // Don't emit syncs if the pane is not visible.
    .filter(([visible]) => visible).subscribe(() => this._syncFontAndFit(terminal)));
  }

  _spawn(cwd) {
    const command = this._command;
    const info = Object.assign({
      terminalType: 'xterm-256color',
      environment: this._terminalInfo.environmentVariables
    }, command == null ? {} : {
      command
    });

    const performSpawn = () => {
      this._setUseTitleAsPath(cwd);

      return (0, _AtomServiceContainer().getPtyServiceByNuclideUri)(cwd).spawn(cwd != null ? Object.assign({}, info, {
        cwd: _nuclideUri().default.getPath(cwd)
      }) : info, this);
    };

    if (cwd == null || _nuclideUri().default.isLocal(cwd)) {
      return performSpawn();
    } else {
      const cwdHostname = _nuclideUri().default.getHostname(cwd); // Wait for the remote connection to be added before spawning.


      const hostnameAddedPromise = (0, _projects().observeAddedHostnames)().filter(hostname => hostname === cwdHostname).take(1).toPromise();
      return hostnameAddedPromise.then(performSpawn);
    }
  }

  _setUseTitleAsPath(cwd) {
    (0, _AtomServiceContainer().getPtyServiceByNuclideUri)(cwd).useTitleAsPath(this).then(value => this._useTitleAsPath = value);
  }

  _onTerminalCreation(terminal) {
    this._terminal = terminal;
    this._processOutput = (0, _sink().createOutputSink)(terminal);
    terminal.attachCustomKeyEventHandler(this._checkIfKeyBoundOrDivertToXTerm.bind(this));

    this._subscriptions.add(() => terminal.dispose());

    terminal.webLinksInit(openLink);
    registerLinkHandlers(terminal, this._cwd); // div items don't support a 'focus' event, and we need to forward.

    this._div.focus = () => terminal.focus();

    this._div.blur = () => terminal.blur();

    if (process.platform === 'win32') {
      // On Windows, add Putty-style highlight and right click to copy, right click to paste.
      this._subscriptions.add(_rxjsCompatUmdMin.Observable.fromEvent(this._div, 'contextmenu').subscribe(e => {
        // Note: Manipulating the clipboard directly because atom's core:copy and core:paste
        // commands are not working correctly with terminal selection.
        if (terminal.hasSelection()) {
          _electron.clipboard.writeText(terminal.getSelection());
        } else {
          document.execCommand('paste');
        }

        terminal.clearSelection();
        terminal.focus();
        e.stopPropagation();
      }));
    } else {
      let copyOnSelect;

      this._subscriptions.add(_featureConfig().default.observeAsStream(_config().COPY_ON_SELECT_CONFIG).subscribe(copyOnSelectConf => copyOnSelect = Boolean(copyOnSelectConf)), terminal.addDisposableListener('selection', () => {
        if (copyOnSelect && terminal.hasSelection()) {
          _electron.clipboard.writeText(terminal.getSelection());

          terminal.focus();
        }
      }));
    }

    this._subscriptions.add(atom.commands.add(this._div, 'core:copy', () => {
      document.execCommand('copy');
    }), atom.commands.add(this._div, 'core:paste', () => {
      document.execCommand('paste');
    }), atom.commands.add(this._div, _config().ADD_ESCAPE_COMMAND, this._addEscapePrefix.bind(this)), atom.commands.add(this._div, 'atom-ide-terminal:clear', terminal.clear.bind(terminal)));

    this._subscriptions.add(_featureConfig().default.observeAsStream(_config().PRESERVED_COMMANDS_CONFIG).subscribe(preserved => {
      this._preservedCommands = new Set([...(preserved || []), ...(this._terminalInfo.preservedCommands || [])]);
    }), atom.config.onDidChange('core.themes', () => this._syncAtomTheme(terminal)), atom.themes.onDidChangeActiveThemes(() => this._syncAtomTheme(terminal)));

    this._subscriptions.add( // Skip the first value because the observe callback triggers once when
    // we begin observing, duplicating work in the constructor.
    ...Object.keys(_config().COLOR_CONFIGS).map(color => _featureConfig().default.observeAsStream(_config().COLOR_CONFIGS[color]).skip(1).subscribe(() => this._syncAtomTheme(terminal))));
  }

  _onPtyFulfill(pty, terminal) {
    if (!(this._pty == null)) {
      throw new Error("Invariant violation: \"this._pty == null\"");
    }

    this._pty = pty;
    const now = (0, _performanceNow().default)();
    this._focusStart = now;
    (0, _analytics().track)('nuclide-terminal.started', {
      uri: this._cwd,
      startDelay: Math.round(now - this._startTime)
    });

    this._subscriptions.add(this.dispose.bind(this), _rxjsCompatUmdMin.Observable.fromEvent(terminal, 'data').subscribe(this._onInput.bind(this)), _rxjsCompatUmdMin.Observable.fromEvent(terminal, 'title').subscribe(title => {
      this._setTitle(title);

      if (this._useTitleAsPath) {
        this._setPath(title);
      }
    }), _rxjsCompatUmdMin.Observable.interval(60 * 60 * 1000).subscribe(() => (0, _analytics().track)('nuclide-terminal.hourly', this._statistics())), _rxjsCompatUmdMin.Observable.fromEvent(terminal, 'focus').subscribe(this._focused.bind(this)), _rxjsCompatUmdMin.Observable.fromEvent(terminal, 'blur').subscribe(this._blurred.bind(this)));

    this._syncFontAndFit(terminal);

    this._subscriptions.add((0, _measurePerformance().default)(terminal));

    this._emitter.emit('spawn', {
      success: true
    });
  }

  _focused() {
    if (this._focusStart == null) {
      this._focusStart = (0, _performanceNow().default)();
    }
  }

  _blurred() {
    const focusStart = this._focusStart;

    if (focusStart != null) {
      this._focusStart = null;
      this._focusDuration += (0, _performanceNow().default)() - focusStart;
    }
  }

  _statistics() {
    const now = (0, _performanceNow().default)();
    const focusStart = this._focusStart;
    const focusDuration = this._focusDuration + (focusStart == null ? 0 : now - focusStart);
    return {
      uri: this._cwd,
      focusDuration: Math.round(focusDuration),
      duration: Math.round(now - this._startTime),
      bytesIn: this._bytesIn,
      bytesOut: this._bytesOut
    };
  }

  _onPtyFail(error, terminal) {
    terminal.writeln('Error starting process:');

    for (const line of String(error).split('\n')) {
      terminal.writeln(line);
    }

    (0, _analytics().track)('nuclide-terminal.failed', {
      uri: this._cwd,
      startDelay: Math.round((0, _performanceNow().default)() - this._startTime),
      error: String(error)
    });

    this._emitter.emit('spawn', {
      success: false
    });
  } // Since changing the font settings may resize the contents, we have to
  // trigger a re-fit when updating font settings.


  _syncAtomTheme(terminal) {
    const div = this._div;
    (0, _config().setTerminalOption)(terminal, 'theme', getTerminalTheme(div));
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

    if (preserved.has(_config().ADD_ESCAPE_COMMAND) && bindings.some(b => b.command === _config().ADD_ESCAPE_COMMAND)) {
      // Intercept the add escape binding and send escape directly, then
      // divert to xterm (to handle keys like Backspace).
      this._onInput('\x1B');

      return true;
    }

    const result = !bindings.some(b => preserved.has(b.command)); // This facilitates debugging keystroke issues.  You can set a breakpoint
    // in the else block without stopping on modifier keys.

    if (keystroke === 'alt' || keystroke === 'shift' || keystroke === 'ctrl' || keystroke === 'cmd') {
      return result;
    } else {
      return result;
    }
  }

  _closeTab() {
    const pane = atom.workspace.paneForItem(this);

    if (pane != null) {
      pane.destroyItem(this);
    }
  }

  onOutput(data) {
    this._bytesOut += data.length;

    if (this._processOutput != null) {
      this._processOutput(data);
    }

    if (this._isFirstOutput) {
      this._isFirstOutput = false;

      this._onInput(this._initialInput);
    }
  }

  onExit(code, signal) {
    (0, _analytics().track)('nuclide-terminal.exit', Object.assign({}, this._statistics(), {
      code,
      signal
    }));

    if ( // eslint-disable-next-line eqeqeq
    (code === 0 || code === null) && !this._terminalInfo.remainOnCleanExit) {
      this._closeTab();

      return;
    }

    if (this._terminal == null) {
      return;
    }

    const terminal = this._terminal;
    terminal.writeln('');
    terminal.writeln('');
    const command = this._terminalInfo.command;
    const process = command == null ? 'Process' : `${command.file} ${command.args.join(' ')}`;
    terminal.writeln(`${process} exited with error code '${code}'.`);

    if (signal !== 0) {
      terminal.writeln(`  killed by signal '${signal}'.`);
    }

    terminal.writeln('');

    this._disableTerminal(terminal);
  }

  _disableTerminal(terminal) {
    this.dispose();
    terminal.blur(); // Disable terminal's ability to capture input once in error state.

    this._div.focus = () => {};

    this._div.blur = () => {};
  }

  setProcessExitCallback(callback) {
    this._processExitCallback = callback;
  }

  terminateProcess() {
    if (this._pty != null && this._terminal != null) {
      const terminal = this._terminal;

      this._disableTerminal(terminal);

      terminal.writeln('');
      terminal.writeln('Process terminated.');
      terminal.writeln('');
    }
  }

  copy() {
    return new TerminalView(this._terminalInfo);
  } // Remote connection is closing--note the window remains open to show error
  // output if the process exit code was not 0.


  dispose() {
    if (this._pty != null) {
      this._pty.dispose();

      this._pty = null;
    }

    this._processExitCallback();

    this._processExitCallback = () => {};
  } // Window is closing, so close everything.


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
    return 'atom://nuclide-terminal-view';
  }

  getTerminalKey() {
    return this._key;
  }

  getDefaultLocation() {
    return this._terminalInfo.defaultLocation;
  }

  getElement() {
    return this._div;
  }

  getPath() {
    return this._path;
  } // Breadcrumbs uses this to determine how to show the path.


  getPathIsDirectory() {
    return true;
  }

  onDidChangePath(callback) {
    return this.on('did-change-path', callback);
  }

  onDidChangeTitle(callback) {
    return this.on('did-change-title', callback);
  }

  onSpawn(callback) {
    return this.on('spawn', callback);
  }

  on(name, callback) {
    if (this._subscriptions.disposed) {
      return new (_UniversalDisposable().default)();
    } else {
      return this._emitter.on(name, callback);
    }
  }

  serialize() {
    return {
      deserializer: 'TerminalView',
      initialInfo: this._terminalInfo,
      cwd: this._cwd
    };
  }

}

exports.TerminalView = TerminalView;

function deserializeTerminalView(state) {
  return new TerminalView(state.initialInfo);
}

function registerLinkHandlers(terminal, cwd) {
  const diffPattern = toString(_featureConfig().default.get('atom-ide-console.diffUrlPattern'));
  const taskPattern = toString(_featureConfig().default.get('atom-ide-console.taskUrlPattern'));
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
    regex: /(^|\s)((\/[^<>:"\\|?*[\]\s]+)(:\d+)?)/,
    matchIndex: 2,
    urlPattern: 'open-file-object://%s'
  }];

  for (const _ref of bindings) {
    const {
      regex,
      matchIndex,
      urlPattern
    } = _ref;
    terminal.registerLinkMatcher(regex, (event, match) => {
      const replacedUrl = urlPattern.replace('%s', match);

      if (replacedUrl !== '') {
        const commandClicked = process.platform === 'win32' ? event.ctrlKey : event.metaKey;

        if (shouldOpenInAtom(replacedUrl)) {
          if (commandClicked) {
            tryOpenInAtom(replacedUrl, cwd);
          }
        } else {
          _electron.shell.openExternal(replacedUrl);
        }
      }
    }, {
      matchIndex
    });
  }
}

function shouldOpenInAtom(link) {
  const parsed = _url.default.parse(link);

  return parsed.protocol === 'open-file-object:';
}

function tryOpenInAtom(link, cwd) {
  const parsed = _url.default.parse(link);

  const path = parsed.path;

  if (path != null) {
    const fileLine = path.split(':');
    let filePath = fileLine[0];
    let line = 0;

    if (fileLine.length > 1 && parseInt(fileLine[1], 10) > 0) {
      line = parseInt(fileLine[1], 10) - 1;
    }

    if (cwd != null && _nuclideUri().default.isRemote(cwd)) {
      const terminalLocation = _nuclideUri().default.parseRemoteUri(cwd);

      filePath = _nuclideUri().default.createRemoteUri(terminalLocation.hostname, filePath);
    }

    (0, _goToLocation().goToLocation)(filePath, {
      line
    });
  }
}

function openLink(event, link) {
  _electron.shell.openExternal(trimTrailingDot(link));
}

function trimTrailingDot(s) {
  return s.endsWith('.') ? s.substring(0, s.length - 1) : s;
}

function toString(value) {
  return typeof value === 'string' ? value : '';
} // As a precaution, we should not let any undisplayable or potentially unsafe characters through


function getSafeInitialInput(initialInput) {
  for (let i = 0; i < initialInput.length; i++) {
    const code = initialInput.charCodeAt(i); // ASCII codes under 32 and 127 are control characters (potentially dangerous)
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

  for (const color of Object.keys(_config().COLOR_CONFIGS)) {
    const configValue = _featureConfig().default.get(_config().COLOR_CONFIGS[color]); // config value may be string when Atom deserializes the terminal package
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
  const background = style.getPropertyValue('background-color'); // return type: https://git.io/vxooH

  return Object.assign({
    foreground,
    background,
    cursor: foreground
  }, getTerminalColors());
}