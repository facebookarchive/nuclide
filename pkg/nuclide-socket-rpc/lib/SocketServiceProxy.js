"use strict";

let Observable;

module.exports = _client => {
  const remoteModule = {};

  remoteModule.startListening = function (arg0, arg1) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "serverPort",
      type: {
        kind: "number"
      }
    }, {
      name: "family",
      type: {
        kind: "nullable",
        type: {
          kind: "union",
          types: [{
            kind: "number-literal",
            value: 4
          }, {
            kind: "number-literal",
            value: 6
          }]
        }
      }
    }])).switchMap(args => {
      return _client.callRemoteFunction("SocketService/startListening", "observable", args);
    }).concatMap(value => {
      return _client.unmarshal(value, {
        kind: "named",
        name: "SocketEvent"
      });
    }).publish();
  };

  remoteModule.stopListening = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "serverPort",
      type: {
        kind: "number"
      }
    }]).then(args => {
      return _client.callRemoteFunction("SocketService/stopListening", "void", args);
    });
  };

  remoteModule.writeToClient = function (arg0, arg1, arg2) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "serverPort",
      type: {
        kind: "number"
      }
    }, {
      name: "clientPort",
      type: {
        kind: "number"
      }
    }, {
      name: "data",
      type: {
        kind: "named",
        name: "Buffer"
      }
    }]).then(args => {
      return _client.callRemoteFunction("SocketService/writeToClient", "void", args);
    });
  };

  remoteModule.clientError = function (arg0, arg1, arg2) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "serverPort",
      type: {
        kind: "number"
      }
    }, {
      name: "clientPort",
      type: {
        kind: "number"
      }
    }, {
      name: "error",
      type: {
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("SocketService/clientError", "void", args);
    });
  };

  remoteModule.closeClient = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "serverPort",
      type: {
        kind: "number"
      }
    }, {
      name: "clientPort",
      type: {
        kind: "number"
      }
    }]).then(args => {
      return _client.callRemoteFunction("SocketService/closeClient", "void", args);
    });
  };

  remoteModule.getAvailableServerPort = function () {
    return _client.marshalArguments(Array.from(arguments), []).then(args => {
      return _client.callRemoteFunction("SocketService/getAvailableServerPort", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "number"
      });
    });
  };

  return remoteModule;
};

Object.defineProperty(module.exports, "inject", {
  value: function () {
    Observable = arguments[0];
  }
});
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
    SocketEvent: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "SocketService.js",
        line: 19
      },
      name: "SocketEvent",
      definition: {
        kind: "union",
        types: [{
          kind: "object",
          fields: [{
            name: "type",
            type: {
              kind: "string-literal",
              value: "server_started"
            },
            optional: false
          }]
        }, {
          kind: "object",
          fields: [{
            name: "type",
            type: {
              kind: "string-literal",
              value: "server_stopping"
            },
            optional: false
          }]
        }, {
          kind: "object",
          fields: [{
            name: "type",
            type: {
              kind: "string-literal",
              value: "client_connected"
            },
            optional: false
          }, {
            name: "clientPort",
            type: {
              kind: "number"
            },
            optional: false
          }]
        }, {
          kind: "object",
          fields: [{
            name: "type",
            type: {
              kind: "string-literal",
              value: "client_disconnected"
            },
            optional: false
          }, {
            name: "clientPort",
            type: {
              kind: "number"
            },
            optional: false
          }]
        }, {
          kind: "object",
          fields: [{
            name: "type",
            type: {
              kind: "string-literal",
              value: "data"
            },
            optional: false
          }, {
            name: "clientPort",
            type: {
              kind: "number"
            },
            optional: false
          }, {
            name: "data",
            type: {
              kind: "named",
              name: "Buffer"
            },
            optional: false
          }]
        }],
        discriminantField: "type"
      }
    },
    startListening: {
      kind: "function",
      name: "startListening",
      location: {
        type: "source",
        fileName: "SocketService.js",
        line: 37
      },
      type: {
        location: {
          type: "source",
          fileName: "SocketService.js",
          line: 37
        },
        kind: "function",
        argumentTypes: [{
          name: "serverPort",
          type: {
            kind: "number"
          }
        }, {
          name: "family",
          type: {
            kind: "nullable",
            type: {
              kind: "union",
              types: [{
                kind: "number-literal",
                value: 4
              }, {
                kind: "number-literal",
                value: 6
              }]
            }
          }
        }],
        returnType: {
          kind: "observable",
          type: {
            kind: "named",
            name: "SocketEvent"
          }
        }
      }
    },
    stopListening: {
      kind: "function",
      name: "stopListening",
      location: {
        type: "source",
        fileName: "SocketService.js",
        line: 88
      },
      type: {
        location: {
          type: "source",
          fileName: "SocketService.js",
          line: 88
        },
        kind: "function",
        argumentTypes: [{
          name: "serverPort",
          type: {
            kind: "number"
          }
        }],
        returnType: {
          kind: "void"
        }
      }
    },
    writeToClient: {
      kind: "function",
      name: "writeToClient",
      location: {
        type: "source",
        fileName: "SocketService.js",
        line: 104
      },
      type: {
        location: {
          type: "source",
          fileName: "SocketService.js",
          line: 104
        },
        kind: "function",
        argumentTypes: [{
          name: "serverPort",
          type: {
            kind: "number"
          }
        }, {
          name: "clientPort",
          type: {
            kind: "number"
          }
        }, {
          name: "data",
          type: {
            kind: "named",
            name: "Buffer"
          }
        }],
        returnType: {
          kind: "void"
        }
      }
    },
    clientError: {
      kind: "function",
      name: "clientError",
      location: {
        type: "source",
        fileName: "SocketService.js",
        line: 116
      },
      type: {
        location: {
          type: "source",
          fileName: "SocketService.js",
          line: 116
        },
        kind: "function",
        argumentTypes: [{
          name: "serverPort",
          type: {
            kind: "number"
          }
        }, {
          name: "clientPort",
          type: {
            kind: "number"
          }
        }, {
          name: "error",
          type: {
            kind: "string"
          }
        }],
        returnType: {
          kind: "void"
        }
      }
    },
    closeClient: {
      kind: "function",
      name: "closeClient",
      location: {
        type: "source",
        fileName: "SocketService.js",
        line: 131
      },
      type: {
        location: {
          type: "source",
          fileName: "SocketService.js",
          line: 131
        },
        kind: "function",
        argumentTypes: [{
          name: "serverPort",
          type: {
            kind: "number"
          }
        }, {
          name: "clientPort",
          type: {
            kind: "number"
          }
        }],
        returnType: {
          kind: "void"
        }
      }
    },
    getAvailableServerPort: {
      kind: "function",
      name: "getAvailableServerPort",
      location: {
        type: "source",
        fileName: "SocketService.js",
        line: 152
      },
      type: {
        location: {
          type: "source",
          fileName: "SocketService.js",
          line: 152
        },
        kind: "function",
        argumentTypes: [],
        returnType: {
          kind: "promise",
          type: {
            kind: "number"
          }
        }
      }
    }
  }
});