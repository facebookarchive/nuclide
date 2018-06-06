'use strict';

var _CommandLine;

function _load_CommandLine() {
  return _CommandLine = _interopRequireDefault(require('./CommandLine'));
}

var _CommandDispatcher;

function _load_CommandDispatcher() {
  return _CommandDispatcher = _interopRequireDefault(require('./CommandDispatcher'));
}

var _ConfigFile;

function _load_ConfigFile() {
  return _ConfigFile = _interopRequireDefault(require('./ConfigFile'));
}

var _Debugger;

function _load_Debugger() {
  return _Debugger = _interopRequireDefault(require('./Debugger'));
}

var _DebuggerAdapterFactory;

function _load_DebuggerAdapterFactory() {
  return _DebuggerAdapterFactory = _interopRequireDefault(require('./DebuggerAdapterFactory'));
}

var _HelpCommand;

function _load_HelpCommand() {
  return _HelpCommand = _interopRequireDefault(require('./HelpCommand'));
}

var _log4js;

function _load_log4js() {
  return _log4js = _interopRequireDefault(require('log4js'));
}

var _QuitCommand;

function _load_QuitCommand() {
  return _QuitCommand = _interopRequireDefault(require('./QuitCommand'));
}

var _yargs;

function _load_yargs() {
  return _yargs = _interopRequireDefault(require('yargs'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function buildLogger() {
  const args = (_yargs || _load_yargs()).default.argv;
  const level = (args.loglevel || 'FATAL').toUpperCase();
  const validLevels = new Set(['TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL']);

  if (!validLevels.has(level)) {
    throw new Error(`${level} is not a valid loglevel.`);
  }

  // Send debug level logging to a file. Send a configurable (by default FATAL)
  // level to the console.
  const config = {
    appenders: [{
      type: 'file',
      filename: '/tmp/nuclide-cli.log',
      maxLogSize: 50 * 1024,
      category: '[all]'
    }, {
      type: 'logLevelFilter',
      level,
      maxLevel: 'FATAL',
      appender: {
        type: 'stdout',
        category: '[all]'
      }
    }],
    levels: {
      '[all]': 'DEBUG'
    }
  };

  (_log4js || _load_log4js()).default.configure(config);

  return (_log4js || _load_log4js()).default.getLogger('default');
} /**
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

const _help = ['fbdbg [options] [program [program-arguments]]', '  The debugger may be launched in either "launch" or "attach" mode. "launch"', '  starts a local program; "attach" attaches to an already running program', '  which may be remote. There are options which are specific to the mode and', '  type of program being debugged; to see them, specify the --type and mode', '  options along with --help.', '', '--help:', '  Show this help.', '--attach:', '  Attach the debugger to a running process.', '--preset:', '  Load default arguments for a session type preset', '--type python|node:', '  Specify the type of program to debug. Required with --attach', '', '[program]: If not attaching, the program to launch. Normally the type of', '           program can be inferred from the file extension.', ''];

function showHelp(configFile, contextSensitiveHelp) {
  process.stdout.write(_help.join('\n') + '\n');

  if (contextSensitiveHelp.length !== 0) {
    process.stdout.write('Options which are specific to the debugger type:\n');
    process.stdout.write(contextSensitiveHelp.join('\n') + '\n');
  }

  const presets = configFile.presets();
  if (presets.length !== 0) {
    process.stdout.write('\nPresets:\n');
    presets.forEach(preset => {
      process.stdout.write(`${preset.name}:\n  ${preset.description}\n`);
    });
  }
}

async function main() {
  try {
    // see if there's session information on the command line
    const debuggerAdapterFactory = new (_DebuggerAdapterFactory || _load_DebuggerAdapterFactory()).default();
    const configFile = new (_ConfigFile || _load_ConfigFile()).default();

    const preset = configFile.getPresetFromArguments();
    const cmdLine = preset == null ? process.argv.splice(2) : configFile.applyPresetToArguments(preset);
    const args = (0, (_yargs || _load_yargs()).default)(cmdLine).boolean('attach').boolean('help').argv;

    if (args.help) {
      showHelp(configFile, debuggerAdapterFactory.contextSensitiveHelp(args));
      process.exit(0);
    }

    const aliases = configFile.resolveAliasesForPreset(preset);
    const dispatcher = new (_CommandDispatcher || _load_CommandDispatcher()).default(aliases);
    const cli = new (_CommandLine || _load_CommandLine()).default(dispatcher);

    dispatcher.registerCommand(new (_HelpCommand || _load_HelpCommand()).default(cli, dispatcher));
    dispatcher.registerCommand(new (_QuitCommand || _load_QuitCommand()).default(() => cli.close()));

    let adapter;

    try {
      adapter = debuggerAdapterFactory.adapterFromArguments(args);
    } catch (error) {
      cli.outputLine(error.message);
      cli.outputLine();
      showHelp(configFile, debuggerAdapterFactory.contextSensitiveHelp(args));
      process.exit(0);
    }

    const logger = buildLogger();
    const debuggerInstance = new (_Debugger || _load_Debugger()).default(logger, cli, preset);

    if (adapter != null) {
      await debuggerInstance.launch(adapter);
    }

    debuggerInstance.registerCommands(dispatcher);

    cli.observeInterrupts().subscribe(_ => {
      debuggerInstance.breakInto();
    });

    cli.observeLines().subscribe(_ => {}, _ => {}, _ => {
      debuggerInstance.closeSession().then(x => {
        cli.outputLine();
        process.exit(0);
      });
    });
  } catch (x) {
    process.stderr.write(`${x.message}\n`);
    process.exit(1);
  }
}

main();