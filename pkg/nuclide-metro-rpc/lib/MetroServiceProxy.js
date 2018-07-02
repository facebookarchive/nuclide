"use strict";

module.exports = _client => {
  const remoteModule = {};

  remoteModule.getStartCommand = function (arg0) {
    return _client.callRemoteFunction("MetroService/getStartCommand", "promise", _client.marshalArguments(Array.from(arguments), [{
      name: "projectRoot",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }])).then(value => {
      return _client.unmarshal(value, {
        kind: "nullable",
        type: {
          kind: "named",
          name: "MetroStartCommand"
        }
      });
    });
  };

  remoteModule.startMetro = function (arg0, arg1, arg2, arg3) {
    return _client.callRemoteFunction("MetroService/startMetro", "observable", _client.marshalArguments(Array.from(arguments), [{
      name: "projectRoot",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "editorArgs",
      type: {
        kind: "array",
        type: {
          kind: "string"
        }
      }
    }, {
      name: "port",
      type: {
        kind: "nullable",
        type: {
          kind: "number"
        }
      }
    }, {
      name: "extraArgs",
      type: {
        kind: "nullable",
        type: {
          kind: "array",
          type: {
            kind: "string"
          }
        }
      }
    }])).map(value => {
      return _client.unmarshal(value, {
        kind: "named",
        name: "MetroEvent"
      });
    }).publish();
  };

  remoteModule.reloadApp = function (arg0) {
    return _client.callRemoteFunction("MetroService/reloadApp", "promise", _client.marshalArguments(Array.from(arguments), [{
      name: "port",
      type: {
        kind: "nullable",
        type: {
          kind: "number"
        }
      }
    }])).then(value => {
      return _client.unmarshal(value, {
        kind: "void"
      });
    });
  };

  remoteModule.buildBundle = function (arg0, arg1, arg2) {
    return _client.callRemoteFunction("MetroService/buildBundle", "promise", _client.marshalArguments(Array.from(arguments), [{
      name: "bundleName",
      type: {
        kind: "string"
      }
    }, {
      name: "platform",
      type: {
        kind: "union",
        types: [{
          kind: "string-literal",
          value: "ios"
        }, {
          kind: "string-literal",
          value: "android"
        }]
      }
    }, {
      name: "port",
      type: {
        kind: "nullable",
        type: {
          kind: "number"
        }
      }
    }])).then(value => {
      return _client.unmarshal(value, {
        kind: "void"
      });
    });
  };

  remoteModule.buildSourceMaps = function (arg0, arg1, arg2) {
    return _client.callRemoteFunction("MetroService/buildSourceMaps", "promise", _client.marshalArguments(Array.from(arguments), [{
      name: "bundleName",
      type: {
        kind: "string"
      }
    }, {
      name: "platform",
      type: {
        kind: "union",
        types: [{
          kind: "string-literal",
          value: "ios"
        }, {
          kind: "string-literal",
          value: "android"
        }]
      }
    }, {
      name: "port",
      type: {
        kind: "nullable",
        type: {
          kind: "number"
        }
      }
    }])).then(value => {
      return _client.unmarshal(value, {
        kind: "void"
      });
    });
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
    MetroStartCommand: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 21
      },
      name: "MetroStartCommand",
      definition: {
        kind: "object",
        fields: [{
          name: "command",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "cwd",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "args",
          type: {
            kind: "array",
            type: {
              kind: "string"
            }
          },
          optional: true
        }]
      }
    },
    getStartCommand: {
      kind: "function",
      name: "getStartCommand",
      location: {
        type: "source",
        fileName: "MetroService.js",
        line: 38
      },
      type: {
        location: {
          type: "source",
          fileName: "MetroService.js",
          line: 38
        },
        kind: "function",
        argumentTypes: [{
          name: "projectRoot",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "nullable",
            type: {
              kind: "named",
              name: "MetroStartCommand"
            }
          }
        }
      }
    },
    ReadyEvent: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 18
      },
      name: "ReadyEvent",
      definition: {
        kind: "object",
        fields: [{
          name: "type",
          type: {
            kind: "string-literal",
            value: "ready"
          },
          optional: false
        }]
      }
    },
    Level: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "process.js",
        line: 696
      },
      name: "Level",
      definition: {
        kind: "union",
        types: [{
          kind: "string-literal",
          value: "info"
        }, {
          kind: "string-literal",
          value: "log"
        }, {
          kind: "string-literal",
          value: "warning"
        }, {
          kind: "string-literal",
          value: "error"
        }, {
          kind: "string-literal",
          value: "debug"
        }, {
          kind: "string-literal",
          value: "success"
        }]
      }
    },
    Message: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "process.js",
        line: 697
      },
      name: "Message",
      definition: {
        kind: "object",
        fields: [{
          name: "text",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "level",
          type: {
            kind: "named",
            name: "Level"
          },
          optional: false
        }]
      }
    },
    MessageEvent: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "process.js",
        line: 699
      },
      name: "MessageEvent",
      definition: {
        kind: "object",
        fields: [{
          name: "type",
          type: {
            kind: "string-literal",
            value: "message"
          },
          optional: false
        }, {
          name: "message",
          type: {
            kind: "named",
            name: "Message"
          },
          optional: false
        }]
      }
    },
    MetroEvent: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 19
      },
      name: "MetroEvent",
      definition: {
        kind: "union",
        types: [{
          kind: "object",
          fields: [{
            name: "type",
            type: {
              kind: "string-literal",
              value: "ready"
            },
            optional: false
          }]
        }, {
          kind: "object",
          fields: [{
            name: "type",
            type: {
              kind: "string-literal",
              value: "message"
            },
            optional: false
          }, {
            name: "message",
            type: {
              kind: "named",
              name: "Message"
            },
            optional: false
          }]
        }],
        discriminantField: "type"
      }
    },
    startMetro: {
      kind: "function",
      name: "startMetro",
      location: {
        type: "source",
        fileName: "MetroService.js",
        line: 52
      },
      type: {
        location: {
          type: "source",
          fileName: "MetroService.js",
          line: 52
        },
        kind: "function",
        argumentTypes: [{
          name: "projectRoot",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "editorArgs",
          type: {
            kind: "array",
            type: {
              kind: "string"
            }
          }
        }, {
          name: "port",
          type: {
            kind: "nullable",
            type: {
              kind: "number"
            }
          }
        }, {
          name: "extraArgs",
          type: {
            kind: "nullable",
            type: {
              kind: "array",
              type: {
                kind: "string"
              }
            }
          }
        }],
        returnType: {
          kind: "observable",
          type: {
            kind: "named",
            name: "MetroEvent"
          }
        }
      }
    },
    reloadApp: {
      kind: "function",
      name: "reloadApp",
      location: {
        type: "source",
        fileName: "MetroService.js",
        line: 109
      },
      type: {
        location: {
          type: "source",
          fileName: "MetroService.js",
          line: 109
        },
        kind: "function",
        argumentTypes: [{
          name: "port",
          type: {
            kind: "nullable",
            type: {
              kind: "number"
            }
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "void"
          }
        }
      }
    },
    buildBundle: {
      kind: "function",
      name: "buildBundle",
      location: {
        type: "source",
        fileName: "MetroService.js",
        line: 129
      },
      type: {
        location: {
          type: "source",
          fileName: "MetroService.js",
          line: 129
        },
        kind: "function",
        argumentTypes: [{
          name: "bundleName",
          type: {
            kind: "string"
          }
        }, {
          name: "platform",
          type: {
            kind: "union",
            types: [{
              kind: "string-literal",
              value: "ios"
            }, {
              kind: "string-literal",
              value: "android"
            }]
          }
        }, {
          name: "port",
          type: {
            kind: "nullable",
            type: {
              kind: "number"
            }
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "void"
          }
        }
      }
    },
    buildSourceMaps: {
      kind: "function",
      name: "buildSourceMaps",
      location: {
        type: "source",
        fileName: "MetroService.js",
        line: 138
      },
      type: {
        location: {
          type: "source",
          fileName: "MetroService.js",
          line: 138
        },
        kind: "function",
        argumentTypes: [{
          name: "bundleName",
          type: {
            kind: "string"
          }
        }, {
          name: "platform",
          type: {
            kind: "union",
            types: [{
              kind: "string-literal",
              value: "ios"
            }, {
              kind: "string-literal",
              value: "android"
            }]
          }
        }, {
          name: "port",
          type: {
            kind: "nullable",
            type: {
              kind: "number"
            }
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "void"
          }
        }
      }
    }
  }
});