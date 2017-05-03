"use strict";

let Observable;

module.exports = _client => {
  const remoteModule = {};

  remoteModule.registerSdbPath = function (arg0, arg1, arg2) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "id",
      type: {
        location: {
          type: "source",
          fileName: "SdbService.js",
          line: 21
        },
        kind: "string"
      }
    }, {
      name: "path",
      type: {
        location: {
          type: "source",
          fileName: "SdbService.js",
          line: 22
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "priority",
      type: {
        location: {
          type: "source",
          fileName: "SdbService.js",
          line: 23
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "SdbService.js",
            line: 23
          },
          kind: "number"
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("SdbService/registerSdbPath", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "SdbService.js",
          line: 24
        },
        kind: "void"
      });
    });
  };

  remoteModule.getDeviceInfo = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "name",
      type: {
        location: {
          type: "source",
          fileName: "SdbService.js",
          line: 33
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("SdbService/getDeviceInfo", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "SdbService.js",
          line: 34
        },
        kind: "map",
        keyType: {
          location: {
            type: "source",
            fileName: "SdbService.js",
            line: 34
          },
          kind: "string"
        },
        valueType: {
          location: {
            type: "source",
            fileName: "SdbService.js",
            line: 34
          },
          kind: "string"
        }
      });
    });
  };

  remoteModule.startServer = function () {
    return _client.marshalArguments(Array.from(arguments), []).then(args => {
      return _client.callRemoteFunction("SdbService/startServer", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "SdbService.js",
          line: 38
        },
        kind: "boolean"
      });
    });
  };

  remoteModule.getDeviceList = function () {
    return _client.marshalArguments(Array.from(arguments), []).then(args => {
      return _client.callRemoteFunction("SdbService/getDeviceList", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "SdbService.js",
          line: 42
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "SdbService.js",
            line: 42
          },
          kind: "named",
          name: "DeviceDescription"
        }
      });
    });
  };

  remoteModule.getPidFromPackageName = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "device",
      type: {
        location: {
          type: "source",
          fileName: "SdbService.js",
          line: 47
        },
        kind: "string"
      }
    }, {
      name: "packageName",
      type: {
        location: {
          type: "source",
          fileName: "SdbService.js",
          line: 48
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("SdbService/getPidFromPackageName", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "SdbService.js",
          line: 49
        },
        kind: "number"
      });
    });
  };

  remoteModule.getFileContentsAtPath = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "device",
      type: {
        location: {
          type: "source",
          fileName: "SdbService.js",
          line: 54
        },
        kind: "string"
      }
    }, {
      name: "path",
      type: {
        location: {
          type: "source",
          fileName: "SdbService.js",
          line: 55
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("SdbService/getFileContentsAtPath", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "SdbService.js",
          line: 56
        },
        kind: "string"
      });
    });
  };

  remoteModule.installPackage = function (arg0, arg1) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "device",
      type: {
        location: {
          type: "source",
          fileName: "SdbService.js",
          line: 61
        },
        kind: "string"
      }
    }, {
      name: "packagePath",
      type: {
        location: {
          type: "source",
          fileName: "SdbService.js",
          line: 62
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("SdbService/installPackage", "observable", args);
    })).concatMap(id => id).concatMap(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "SdbService.js",
          line: 63
        },
        kind: "named",
        name: "LegacyProcessMessage"
      });
    }).publish();
  };

  remoteModule.launchApp = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "device",
      type: {
        location: {
          type: "source",
          fileName: "SdbService.js",
          line: 71
        },
        kind: "string"
      }
    }, {
      name: "identifier",
      type: {
        location: {
          type: "source",
          fileName: "SdbService.js",
          line: 72
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("SdbService/launchApp", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "SdbService.js",
          line: 73
        },
        kind: "string"
      });
    });
  };

  remoteModule.uninstallPackage = function (arg0, arg1) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "device",
      type: {
        location: {
          type: "source",
          fileName: "SdbService.js",
          line: 78
        },
        kind: "string"
      }
    }, {
      name: "packageName",
      type: {
        location: {
          type: "source",
          fileName: "SdbService.js",
          line: 79
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("SdbService/uninstallPackage", "observable", args);
    })).concatMap(id => id).concatMap(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "SdbService.js",
          line: 80
        },
        kind: "named",
        name: "LegacyProcessMessage"
      });
    }).publish();
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
    registerSdbPath: {
      kind: "function",
      name: "registerSdbPath",
      location: {
        type: "source",
        fileName: "SdbService.js",
        line: 20
      },
      type: {
        location: {
          type: "source",
          fileName: "SdbService.js",
          line: 20
        },
        kind: "function",
        argumentTypes: [{
          name: "id",
          type: {
            location: {
              type: "source",
              fileName: "SdbService.js",
              line: 21
            },
            kind: "string"
          }
        }, {
          name: "path",
          type: {
            location: {
              type: "source",
              fileName: "SdbService.js",
              line: 22
            },
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "priority",
          type: {
            location: {
              type: "source",
              fileName: "SdbService.js",
              line: 23
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "SdbService.js",
                line: 23
              },
              kind: "number"
            }
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "SdbService.js",
            line: 24
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "SdbService.js",
              line: 24
            },
            kind: "void"
          }
        }
      }
    },
    getDeviceInfo: {
      kind: "function",
      name: "getDeviceInfo",
      location: {
        type: "source",
        fileName: "SdbService.js",
        line: 32
      },
      type: {
        location: {
          type: "source",
          fileName: "SdbService.js",
          line: 32
        },
        kind: "function",
        argumentTypes: [{
          name: "name",
          type: {
            location: {
              type: "source",
              fileName: "SdbService.js",
              line: 33
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "SdbService.js",
            line: 34
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "SdbService.js",
              line: 34
            },
            kind: "map",
            keyType: {
              location: {
                type: "source",
                fileName: "SdbService.js",
                line: 34
              },
              kind: "string"
            },
            valueType: {
              location: {
                type: "source",
                fileName: "SdbService.js",
                line: 34
              },
              kind: "string"
            }
          }
        }
      }
    },
    startServer: {
      kind: "function",
      name: "startServer",
      location: {
        type: "source",
        fileName: "SdbService.js",
        line: 38
      },
      type: {
        location: {
          type: "source",
          fileName: "SdbService.js",
          line: 38
        },
        kind: "function",
        argumentTypes: [],
        returnType: {
          location: {
            type: "source",
            fileName: "SdbService.js",
            line: 38
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "SdbService.js",
              line: 38
            },
            kind: "boolean"
          }
        }
      }
    },
    getDeviceList: {
      kind: "function",
      name: "getDeviceList",
      location: {
        type: "source",
        fileName: "SdbService.js",
        line: 42
      },
      type: {
        location: {
          type: "source",
          fileName: "SdbService.js",
          line: 42
        },
        kind: "function",
        argumentTypes: [],
        returnType: {
          location: {
            type: "source",
            fileName: "SdbService.js",
            line: 42
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "SdbService.js",
              line: 42
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "SdbService.js",
                line: 42
              },
              kind: "named",
              name: "DeviceDescription"
            }
          }
        }
      }
    },
    getPidFromPackageName: {
      kind: "function",
      name: "getPidFromPackageName",
      location: {
        type: "source",
        fileName: "SdbService.js",
        line: 46
      },
      type: {
        location: {
          type: "source",
          fileName: "SdbService.js",
          line: 46
        },
        kind: "function",
        argumentTypes: [{
          name: "device",
          type: {
            location: {
              type: "source",
              fileName: "SdbService.js",
              line: 47
            },
            kind: "string"
          }
        }, {
          name: "packageName",
          type: {
            location: {
              type: "source",
              fileName: "SdbService.js",
              line: 48
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "SdbService.js",
            line: 49
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "SdbService.js",
              line: 49
            },
            kind: "number"
          }
        }
      }
    },
    getFileContentsAtPath: {
      kind: "function",
      name: "getFileContentsAtPath",
      location: {
        type: "source",
        fileName: "SdbService.js",
        line: 53
      },
      type: {
        location: {
          type: "source",
          fileName: "SdbService.js",
          line: 53
        },
        kind: "function",
        argumentTypes: [{
          name: "device",
          type: {
            location: {
              type: "source",
              fileName: "SdbService.js",
              line: 54
            },
            kind: "string"
          }
        }, {
          name: "path",
          type: {
            location: {
              type: "source",
              fileName: "SdbService.js",
              line: 55
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "SdbService.js",
            line: 56
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "SdbService.js",
              line: 56
            },
            kind: "string"
          }
        }
      }
    },
    installPackage: {
      kind: "function",
      name: "installPackage",
      location: {
        type: "source",
        fileName: "SdbService.js",
        line: 60
      },
      type: {
        location: {
          type: "source",
          fileName: "SdbService.js",
          line: 60
        },
        kind: "function",
        argumentTypes: [{
          name: "device",
          type: {
            location: {
              type: "source",
              fileName: "SdbService.js",
              line: 61
            },
            kind: "string"
          }
        }, {
          name: "packagePath",
          type: {
            location: {
              type: "source",
              fileName: "SdbService.js",
              line: 62
            },
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "SdbService.js",
            line: 63
          },
          kind: "observable",
          type: {
            location: {
              type: "source",
              fileName: "SdbService.js",
              line: 63
            },
            kind: "named",
            name: "LegacyProcessMessage"
          }
        }
      }
    },
    launchApp: {
      kind: "function",
      name: "launchApp",
      location: {
        type: "source",
        fileName: "SdbService.js",
        line: 70
      },
      type: {
        location: {
          type: "source",
          fileName: "SdbService.js",
          line: 70
        },
        kind: "function",
        argumentTypes: [{
          name: "device",
          type: {
            location: {
              type: "source",
              fileName: "SdbService.js",
              line: 71
            },
            kind: "string"
          }
        }, {
          name: "identifier",
          type: {
            location: {
              type: "source",
              fileName: "SdbService.js",
              line: 72
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "SdbService.js",
            line: 73
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "SdbService.js",
              line: 73
            },
            kind: "string"
          }
        }
      }
    },
    uninstallPackage: {
      kind: "function",
      name: "uninstallPackage",
      location: {
        type: "source",
        fileName: "SdbService.js",
        line: 77
      },
      type: {
        location: {
          type: "source",
          fileName: "SdbService.js",
          line: 77
        },
        kind: "function",
        argumentTypes: [{
          name: "device",
          type: {
            location: {
              type: "source",
              fileName: "SdbService.js",
              line: 78
            },
            kind: "string"
          }
        }, {
          name: "packageName",
          type: {
            location: {
              type: "source",
              fileName: "SdbService.js",
              line: 79
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "SdbService.js",
            line: 80
          },
          kind: "observable",
          type: {
            location: {
              type: "source",
              fileName: "SdbService.js",
              line: 80
            },
            kind: "named",
            name: "LegacyProcessMessage"
          }
        }
      }
    },
    ProcessExitMessage: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "process-rpc-types.js",
        line: 14
      },
      name: "ProcessExitMessage",
      definition: {
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 14
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 15
          },
          name: "kind",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 15
            },
            kind: "string-literal",
            value: "exit"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 16
          },
          name: "exitCode",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 16
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 16
              },
              kind: "number"
            }
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 17
          },
          name: "signal",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 17
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 17
              },
              kind: "string"
            }
          },
          optional: false
        }]
      }
    },
    ProcessMessage: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "process-rpc-types.js",
        line: 21
      },
      name: "ProcessMessage",
      definition: {
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 22
        },
        kind: "union",
        types: [{
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 22
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 23
            },
            name: "kind",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 23
              },
              kind: "string-literal",
              value: "stdout"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 24
            },
            name: "data",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 24
              },
              kind: "string"
            },
            optional: false
          }]
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 26
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 27
            },
            name: "kind",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 27
              },
              kind: "string-literal",
              value: "stderr"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 28
            },
            name: "data",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 28
              },
              kind: "string"
            },
            optional: false
          }]
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 14
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 15
            },
            name: "kind",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 15
              },
              kind: "string-literal",
              value: "exit"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 16
            },
            name: "exitCode",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 16
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "process-rpc-types.js",
                  line: 16
                },
                kind: "number"
              }
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 17
            },
            name: "signal",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 17
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "process-rpc-types.js",
                  line: 17
                },
                kind: "string"
              }
            },
            optional: false
          }]
        }],
        discriminantField: "kind"
      }
    },
    LegacyProcessMessage: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "process-rpc-types.js",
        line: 34
      },
      name: "LegacyProcessMessage",
      definition: {
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 35
        },
        kind: "union",
        types: [{
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 22
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 23
            },
            name: "kind",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 23
              },
              kind: "string-literal",
              value: "stdout"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 24
            },
            name: "data",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 24
              },
              kind: "string"
            },
            optional: false
          }]
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 26
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 27
            },
            name: "kind",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 27
              },
              kind: "string-literal",
              value: "stderr"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 28
            },
            name: "data",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 28
              },
              kind: "string"
            },
            optional: false
          }]
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 14
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 15
            },
            name: "kind",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 15
              },
              kind: "string-literal",
              value: "exit"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 16
            },
            name: "exitCode",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 16
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "process-rpc-types.js",
                  line: 16
                },
                kind: "number"
              }
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 17
            },
            name: "signal",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 17
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "process-rpc-types.js",
                  line: 17
                },
                kind: "string"
              }
            },
            optional: false
          }]
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 36
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 36
            },
            name: "kind",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 36
              },
              kind: "string-literal",
              value: "error"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 36
            },
            name: "error",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 36
              },
              kind: "named",
              name: "Object"
            },
            optional: false
          }]
        }],
        discriminantField: "kind"
      }
    },
    ProcessInfo: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "process-rpc-types.js",
        line: 38
      },
      name: "ProcessInfo",
      definition: {
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 38
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 39
          },
          name: "parentPid",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 39
            },
            kind: "number"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 40
          },
          name: "pid",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 40
            },
            kind: "number"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 41
          },
          name: "command",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 41
            },
            kind: "string"
          },
          optional: false
        }]
      }
    },
    AndroidJavaProcess: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 12
      },
      name: "AndroidJavaProcess",
      definition: {
        location: {
          type: "source",
          fileName: "types.js",
          line: 12
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "types.js",
            line: 13
          },
          name: "user",
          type: {
            location: {
              type: "source",
              fileName: "types.js",
              line: 13
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "types.js",
            line: 14
          },
          name: "pid",
          type: {
            location: {
              type: "source",
              fileName: "types.js",
              line: 14
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "types.js",
            line: 15
          },
          name: "name",
          type: {
            location: {
              type: "source",
              fileName: "types.js",
              line: 15
            },
            kind: "string"
          },
          optional: false
        }]
      }
    },
    DebugBridgeType: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 18
      },
      name: "DebugBridgeType",
      definition: {
        location: {
          type: "source",
          fileName: "types.js",
          line: 18
        },
        kind: "union",
        types: [{
          location: {
            type: "source",
            fileName: "types.js",
            line: 18
          },
          kind: "string-literal",
          value: "adb"
        }, {
          location: {
            type: "source",
            fileName: "types.js",
            line: 18
          },
          kind: "string-literal",
          value: "sdb"
        }]
      }
    },
    DeviceDescription: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 20
      },
      name: "DeviceDescription",
      definition: {
        location: {
          type: "source",
          fileName: "types.js",
          line: 20
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "types.js",
            line: 21
          },
          name: "name",
          type: {
            location: {
              type: "source",
              fileName: "types.js",
              line: 21
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "types.js",
            line: 22
          },
          name: "architecture",
          type: {
            location: {
              type: "source",
              fileName: "types.js",
              line: 22
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "types.js",
            line: 23
          },
          name: "apiVersion",
          type: {
            location: {
              type: "source",
              fileName: "types.js",
              line: 23
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "types.js",
            line: 24
          },
          name: "model",
          type: {
            location: {
              type: "source",
              fileName: "types.js",
              line: 24
            },
            kind: "string"
          },
          optional: false
        }]
      }
    }
  }
});