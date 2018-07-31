"use strict";

module.exports = _client => {
  const remoteModule = {};

  remoteModule.watchFile = function (arg0) {
    return _client.callRemoteFunction("FileWatcherService/watchFile", "observable", _client.marshalArguments(Array.from(arguments), [{
      name: "filePath",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }])).map(value => {
      return _client.unmarshal(value, {
        kind: "named",
        name: "WatchResult"
      });
    }).publish();
  };

  remoteModule.watchWithNode = function (arg0, arg1) {
    return _client.callRemoteFunction("FileWatcherService/watchWithNode", "observable", _client.marshalArguments(Array.from(arguments), [{
      name: "watchedPath",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "isDirectory",
      type: {
        kind: "nullable",
        type: {
          kind: "boolean"
        }
      }
    }])).map(value => {
      return _client.unmarshal(value, {
        kind: "named",
        name: "WatchResult"
      });
    }).publish();
  };

  remoteModule.watchDirectory = function (arg0) {
    return _client.callRemoteFunction("FileWatcherService/watchDirectory", "observable", _client.marshalArguments(Array.from(arguments), [{
      name: "directoryPath",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }])).map(value => {
      return _client.unmarshal(value, {
        kind: "named",
        name: "WatchResult"
      });
    }).publish();
  };

  remoteModule.watchDirectoryRecursive = function (arg0) {
    return _client.callRemoteFunction("FileWatcherService/watchDirectoryRecursive", "observable", _client.marshalArguments(Array.from(arguments), [{
      name: "directoryPath",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }])).map(value => {
      return _client.unmarshal(value, {
        kind: "string"
      });
    }).publish();
  };

  return remoteModule;
};

Object.defineProperty(module.exports, "defs", {
  value: {
    Object: {
      kind: "alias",
      name: "Object",
      location: {
        type: "builtin"
      }
    },
    Date: {
      kind: "alias",
      name: "Date",
      location: {
        type: "builtin"
      }
    },
    RegExp: {
      kind: "alias",
      name: "RegExp",
      location: {
        type: "builtin"
      }
    },
    Buffer: {
      kind: "alias",
      name: "Buffer",
      location: {
        type: "builtin"
      }
    },
    "fs.Stats": {
      kind: "alias",
      name: "fs.Stats",
      location: {
        type: "builtin"
      }
    },
    NuclideUri: {
      kind: "alias",
      name: "NuclideUri",
      location: {
        type: "builtin"
      }
    },
    atom$Point: {
      kind: "alias",
      name: "atom$Point",
      location: {
        type: "builtin"
      }
    },
    atom$Range: {
      kind: "alias",
      name: "atom$Range",
      location: {
        type: "builtin"
      }
    },
    WatchResult: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "FileWatcherService.js",
        line: 25
      },
      name: "WatchResult",
      definition: {
        kind: "object",
        fields: [{
          name: "path",
          type: {
            kind: "named",
            name: "NuclideUri"
          },
          optional: false
        }, {
          name: "type",
          type: {
            kind: "string"
          },
          optional: false
        }]
      }
    },
    watchFile: {
      kind: "function",
      name: "watchFile",
      location: {
        type: "source",
        fileName: "FileWatcherService.js",
        line: 48
      },
      type: {
        location: {
          type: "source",
          fileName: "FileWatcherService.js",
          line: 48
        },
        kind: "function",
        argumentTypes: [{
          name: "filePath",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          kind: "observable",
          type: {
            kind: "named",
            name: "WatchResult"
          }
        }
      }
    },
    watchWithNode: {
      kind: "function",
      name: "watchWithNode",
      location: {
        type: "source",
        fileName: "FileWatcherService.js",
        line: 54
      },
      type: {
        location: {
          type: "source",
          fileName: "FileWatcherService.js",
          line: 54
        },
        kind: "function",
        argumentTypes: [{
          name: "watchedPath",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "isDirectory",
          type: {
            kind: "nullable",
            type: {
              kind: "boolean"
            }
          }
        }],
        returnType: {
          kind: "observable",
          type: {
            kind: "named",
            name: "WatchResult"
          }
        }
      }
    },
    watchDirectory: {
      kind: "function",
      name: "watchDirectory",
      location: {
        type: "source",
        fileName: "FileWatcherService.js",
        line: 83
      },
      type: {
        location: {
          type: "source",
          fileName: "FileWatcherService.js",
          line: 83
        },
        kind: "function",
        argumentTypes: [{
          name: "directoryPath",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          kind: "observable",
          type: {
            kind: "named",
            name: "WatchResult"
          }
        }
      }
    },
    watchDirectoryRecursive: {
      kind: "function",
      name: "watchDirectoryRecursive",
      location: {
        type: "source",
        fileName: "FileWatcherService.js",
        line: 124
      },
      type: {
        location: {
          type: "source",
          fileName: "FileWatcherService.js",
          line: 124
        },
        kind: "function",
        argumentTypes: [{
          name: "directoryPath",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          kind: "observable",
          type: {
            kind: "string"
          }
        }
      }
    }
  }
});