"use strict";

let Observable;

module.exports = _client => {
  const remoteModule = {};

  remoteModule.registerAdbPath = function (arg0, arg1, arg2) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "id",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 24
        },
        kind: "string"
      }
    }, {
      name: "path",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 25
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "priority",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 26
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 26
          },
          kind: "number"
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("AdbService/registerAdbPath", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 27
        },
        kind: "void"
      });
    });
  };

  remoteModule.getDeviceInfo = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "device",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 31
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("AdbService/getDeviceInfo", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 31
        },
        kind: "map",
        keyType: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 31
          },
          kind: "string"
        },
        valueType: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 31
          },
          kind: "string"
        }
      });
    });
  };

  remoteModule.getDeviceList = function () {
    return _client.marshalArguments(Array.from(arguments), []).then(args => {
      return _client.callRemoteFunction("AdbService/getDeviceList", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 35
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 35
          },
          kind: "named",
          name: "DeviceDescription"
        }
      });
    });
  };

  remoteModule.startServer = function () {
    return _client.marshalArguments(Array.from(arguments), []).then(args => {
      return _client.callRemoteFunction("AdbService/startServer", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 39
        },
        kind: "boolean"
      });
    });
  };

  remoteModule.getPidFromPackageName = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "device",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 44
        },
        kind: "string"
      }
    }, {
      name: "packageName",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 45
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("AdbService/getPidFromPackageName", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 46
        },
        kind: "number"
      });
    });
  };

  remoteModule.installPackage = function (arg0, arg1) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "device",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 51
        },
        kind: "string"
      }
    }, {
      name: "packagePath",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 52
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("AdbService/installPackage", "observable", args);
    })).concatMap(id => id).concatMap(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 53
        },
        kind: "named",
        name: "LegacyProcessMessage"
      });
    }).publish();
  };

  remoteModule.uninstallPackage = function (arg0, arg1) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "device",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 60
        },
        kind: "string"
      }
    }, {
      name: "packageName",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 61
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("AdbService/uninstallPackage", "observable", args);
    })).concatMap(id => id).concatMap(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 62
        },
        kind: "named",
        name: "LegacyProcessMessage"
      });
    }).publish();
  };

  remoteModule.forwardJdwpPortToPid = function (arg0, arg1, arg2) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "device",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 69
        },
        kind: "string"
      }
    }, {
      name: "tcpPort",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 70
        },
        kind: "number"
      }
    }, {
      name: "pid",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 71
        },
        kind: "number"
      }
    }]).then(args => {
      return _client.callRemoteFunction("AdbService/forwardJdwpPortToPid", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 72
        },
        kind: "string"
      });
    });
  };

  remoteModule.launchActivity = function (arg0, arg1, arg2, arg3, arg4) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "device",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 77
        },
        kind: "string"
      }
    }, {
      name: "packageName",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 78
        },
        kind: "string"
      }
    }, {
      name: "activity",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 79
        },
        kind: "string"
      }
    }, {
      name: "debug",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 80
        },
        kind: "boolean"
      }
    }, {
      name: "action",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 81
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 81
          },
          kind: "string"
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("AdbService/launchActivity", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 82
        },
        kind: "string"
      });
    });
  };

  remoteModule.activityExists = function (arg0, arg1, arg2) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "device",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 93
        },
        kind: "string"
      }
    }, {
      name: "packageName",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 94
        },
        kind: "string"
      }
    }, {
      name: "activity",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 95
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("AdbService/activityExists", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 96
        },
        kind: "boolean"
      });
    });
  };

  remoteModule.getJavaProcesses = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "device",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 101
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("AdbService/getJavaProcesses", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 102
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 102
          },
          kind: "named",
          name: "AndroidJavaProcess"
        }
      });
    });
  };

  remoteModule.dumpsysPackage = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "device",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 107
        },
        kind: "string"
      }
    }, {
      name: "identifier",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 108
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("AdbService/dumpsysPackage", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 109
        },
        kind: "string"
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
    registerAdbPath: {
      kind: "function",
      name: "registerAdbPath",
      location: {
        type: "source",
        fileName: "AdbService.js",
        line: 23
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 23
        },
        kind: "function",
        argumentTypes: [{
          name: "id",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 24
            },
            kind: "string"
          }
        }, {
          name: "path",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 25
            },
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "priority",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 26
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "AdbService.js",
                line: 26
              },
              kind: "number"
            }
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 27
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 27
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
        fileName: "AdbService.js",
        line: 31
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 31
        },
        kind: "function",
        argumentTypes: [{
          name: "device",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 31
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 31
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 31
            },
            kind: "map",
            keyType: {
              location: {
                type: "source",
                fileName: "AdbService.js",
                line: 31
              },
              kind: "string"
            },
            valueType: {
              location: {
                type: "source",
                fileName: "AdbService.js",
                line: 31
              },
              kind: "string"
            }
          }
        }
      }
    },
    getDeviceList: {
      kind: "function",
      name: "getDeviceList",
      location: {
        type: "source",
        fileName: "AdbService.js",
        line: 35
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 35
        },
        kind: "function",
        argumentTypes: [],
        returnType: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 35
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 35
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "AdbService.js",
                line: 35
              },
              kind: "named",
              name: "DeviceDescription"
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
        fileName: "AdbService.js",
        line: 39
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 39
        },
        kind: "function",
        argumentTypes: [],
        returnType: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 39
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 39
            },
            kind: "boolean"
          }
        }
      }
    },
    getPidFromPackageName: {
      kind: "function",
      name: "getPidFromPackageName",
      location: {
        type: "source",
        fileName: "AdbService.js",
        line: 43
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 43
        },
        kind: "function",
        argumentTypes: [{
          name: "device",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 44
            },
            kind: "string"
          }
        }, {
          name: "packageName",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 45
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 46
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 46
            },
            kind: "number"
          }
        }
      }
    },
    installPackage: {
      kind: "function",
      name: "installPackage",
      location: {
        type: "source",
        fileName: "AdbService.js",
        line: 50
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 50
        },
        kind: "function",
        argumentTypes: [{
          name: "device",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 51
            },
            kind: "string"
          }
        }, {
          name: "packagePath",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 52
            },
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 53
          },
          kind: "observable",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 53
            },
            kind: "named",
            name: "LegacyProcessMessage"
          }
        }
      }
    },
    uninstallPackage: {
      kind: "function",
      name: "uninstallPackage",
      location: {
        type: "source",
        fileName: "AdbService.js",
        line: 59
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 59
        },
        kind: "function",
        argumentTypes: [{
          name: "device",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 60
            },
            kind: "string"
          }
        }, {
          name: "packageName",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 61
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 62
          },
          kind: "observable",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 62
            },
            kind: "named",
            name: "LegacyProcessMessage"
          }
        }
      }
    },
    forwardJdwpPortToPid: {
      kind: "function",
      name: "forwardJdwpPortToPid",
      location: {
        type: "source",
        fileName: "AdbService.js",
        line: 68
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 68
        },
        kind: "function",
        argumentTypes: [{
          name: "device",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 69
            },
            kind: "string"
          }
        }, {
          name: "tcpPort",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 70
            },
            kind: "number"
          }
        }, {
          name: "pid",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 71
            },
            kind: "number"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 72
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 72
            },
            kind: "string"
          }
        }
      }
    },
    launchActivity: {
      kind: "function",
      name: "launchActivity",
      location: {
        type: "source",
        fileName: "AdbService.js",
        line: 76
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 76
        },
        kind: "function",
        argumentTypes: [{
          name: "device",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 77
            },
            kind: "string"
          }
        }, {
          name: "packageName",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 78
            },
            kind: "string"
          }
        }, {
          name: "activity",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 79
            },
            kind: "string"
          }
        }, {
          name: "debug",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 80
            },
            kind: "boolean"
          }
        }, {
          name: "action",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 81
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "AdbService.js",
                line: 81
              },
              kind: "string"
            }
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 82
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 82
            },
            kind: "string"
          }
        }
      }
    },
    activityExists: {
      kind: "function",
      name: "activityExists",
      location: {
        type: "source",
        fileName: "AdbService.js",
        line: 92
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 92
        },
        kind: "function",
        argumentTypes: [{
          name: "device",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 93
            },
            kind: "string"
          }
        }, {
          name: "packageName",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 94
            },
            kind: "string"
          }
        }, {
          name: "activity",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 95
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 96
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 96
            },
            kind: "boolean"
          }
        }
      }
    },
    getJavaProcesses: {
      kind: "function",
      name: "getJavaProcesses",
      location: {
        type: "source",
        fileName: "AdbService.js",
        line: 100
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 100
        },
        kind: "function",
        argumentTypes: [{
          name: "device",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 101
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 102
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 102
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "AdbService.js",
                line: 102
              },
              kind: "named",
              name: "AndroidJavaProcess"
            }
          }
        }
      }
    },
    dumpsysPackage: {
      kind: "function",
      name: "dumpsysPackage",
      location: {
        type: "source",
        fileName: "AdbService.js",
        line: 106
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 106
        },
        kind: "function",
        argumentTypes: [{
          name: "device",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 107
            },
            kind: "string"
          }
        }, {
          name: "identifier",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 108
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 109
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 109
            },
            kind: "string"
          }
        }
      }
    },
    ProcessExitMessage: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "process-rpc-types.js",
        line: 13
      },
      name: "ProcessExitMessage",
      definition: {
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 13
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 14
          },
          name: "kind",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 14
            },
            kind: "string-literal",
            value: "exit"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 15
          },
          name: "exitCode",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 15
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 15
              },
              kind: "number"
            }
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 16
          },
          name: "signal",
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
        line: 20
      },
      name: "ProcessMessage",
      definition: {
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 21
        },
        kind: "union",
        types: [{
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 21
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 22
            },
            name: "kind",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 22
              },
              kind: "string-literal",
              value: "stdout"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 23
            },
            name: "data",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 23
              },
              kind: "string"
            },
            optional: false
          }]
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 25
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 26
            },
            name: "kind",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 26
              },
              kind: "string-literal",
              value: "stderr"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 27
            },
            name: "data",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 27
              },
              kind: "string"
            },
            optional: false
          }]
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 13
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 14
            },
            name: "kind",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 14
              },
              kind: "string-literal",
              value: "exit"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 15
            },
            name: "exitCode",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 15
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "process-rpc-types.js",
                  line: 15
                },
                kind: "number"
              }
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 16
            },
            name: "signal",
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
        line: 33
      },
      name: "LegacyProcessMessage",
      definition: {
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 33
        },
        kind: "union",
        types: [{
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 21
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 22
            },
            name: "kind",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 22
              },
              kind: "string-literal",
              value: "stdout"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 23
            },
            name: "data",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 23
              },
              kind: "string"
            },
            optional: false
          }]
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 25
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 26
            },
            name: "kind",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 26
              },
              kind: "string-literal",
              value: "stderr"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 27
            },
            name: "data",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 27
              },
              kind: "string"
            },
            optional: false
          }]
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 13
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 14
            },
            name: "kind",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 14
              },
              kind: "string-literal",
              value: "exit"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 15
            },
            name: "exitCode",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 15
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "process-rpc-types.js",
                  line: 15
                },
                kind: "number"
              }
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 16
            },
            name: "signal",
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
                kind: "string"
              }
            },
            optional: false
          }]
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 33
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 33
            },
            name: "kind",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 33
              },
              kind: "string-literal",
              value: "error"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 33
            },
            name: "error",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 33
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
        line: 35
      },
      name: "ProcessInfo",
      definition: {
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 35
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 36
          },
          name: "parentPid",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 36
            },
            kind: "number"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 37
          },
          name: "pid",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 37
            },
            kind: "number"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 38
          },
          name: "command",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 38
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
        line: 11
      },
      name: "AndroidJavaProcess",
      definition: {
        location: {
          type: "source",
          fileName: "types.js",
          line: 11
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "types.js",
            line: 12
          },
          name: "user",
          type: {
            location: {
              type: "source",
              fileName: "types.js",
              line: 12
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "types.js",
            line: 13
          },
          name: "pid",
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
          name: "name",
          type: {
            location: {
              type: "source",
              fileName: "types.js",
              line: 14
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