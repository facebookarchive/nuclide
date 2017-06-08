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
          line: 26
        },
        kind: "string"
      }
    }, {
      name: "path",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 27
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
          line: 28
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 28
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
          line: 29
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
          line: 34
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
          line: 35
        },
        kind: "map",
        keyType: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 35
          },
          kind: "string"
        },
        valueType: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 35
          },
          kind: "string"
        }
      });
    });
  };

  remoteModule.getProcesses = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "device",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 39
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("AdbService/getProcesses", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 39
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 39
          },
          kind: "named",
          name: "Process"
        }
      });
    });
  };

  remoteModule.stopPackage = function (arg0, arg1) {
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
      return _client.callRemoteFunction("AdbService/stopPackage", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 46
        },
        kind: "void"
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
          line: 50
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 50
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
          line: 54
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
          line: 63
        },
        kind: "string"
      }
    }, {
      name: "packageName",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 64
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
          line: 65
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
          line: 70
        },
        kind: "string"
      }
    }, {
      name: "packagePath",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 71
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
          line: 72
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
          line: 80
        },
        kind: "string"
      }
    }, {
      name: "packageName",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 81
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
          line: 82
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
          line: 90
        },
        kind: "string"
      }
    }, {
      name: "tcpPort",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 91
        },
        kind: "number"
      }
    }, {
      name: "pid",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 92
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
          line: 93
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
          line: 98
        },
        kind: "string"
      }
    }, {
      name: "packageName",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 99
        },
        kind: "string"
      }
    }, {
      name: "activity",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 100
        },
        kind: "string"
      }
    }, {
      name: "debug",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 101
        },
        kind: "boolean"
      }
    }, {
      name: "action",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 102
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 102
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
          line: 103
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
          line: 114
        },
        kind: "string"
      }
    }, {
      name: "packageName",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 115
        },
        kind: "string"
      }
    }, {
      name: "activity",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 116
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
          line: 117
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
          line: 122
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
          line: 123
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 123
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
          line: 128
        },
        kind: "string"
      }
    }, {
      name: "identifier",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 129
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
          line: 130
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 130
          },
          kind: "string"
        }
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
        line: 25
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 25
        },
        kind: "function",
        argumentTypes: [{
          name: "id",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 26
            },
            kind: "string"
          }
        }, {
          name: "path",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 27
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
              line: 28
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "AdbService.js",
                line: 28
              },
              kind: "number"
            }
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 29
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 29
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
        line: 33
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 33
        },
        kind: "function",
        argumentTypes: [{
          name: "device",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 34
            },
            kind: "string"
          }
        }],
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
            kind: "map",
            keyType: {
              location: {
                type: "source",
                fileName: "AdbService.js",
                line: 35
              },
              kind: "string"
            },
            valueType: {
              location: {
                type: "source",
                fileName: "AdbService.js",
                line: 35
              },
              kind: "string"
            }
          }
        }
      }
    },
    getProcesses: {
      kind: "function",
      name: "getProcesses",
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
        argumentTypes: [{
          name: "device",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 39
            },
            kind: "string"
          }
        }],
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
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "AdbService.js",
                line: 39
              },
              kind: "named",
              name: "Process"
            }
          }
        }
      }
    },
    stopPackage: {
      kind: "function",
      name: "stopPackage",
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
            kind: "void"
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
        line: 50
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 50
        },
        kind: "function",
        argumentTypes: [],
        returnType: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 50
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 50
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "AdbService.js",
                line: 50
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
        line: 54
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 54
        },
        kind: "function",
        argumentTypes: [],
        returnType: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 54
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 54
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
        line: 62
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 62
        },
        kind: "function",
        argumentTypes: [{
          name: "device",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 63
            },
            kind: "string"
          }
        }, {
          name: "packageName",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 64
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 65
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 65
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
        line: 69
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 69
        },
        kind: "function",
        argumentTypes: [{
          name: "device",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 70
            },
            kind: "string"
          }
        }, {
          name: "packagePath",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 71
            },
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 72
          },
          kind: "observable",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 72
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
        line: 79
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 79
        },
        kind: "function",
        argumentTypes: [{
          name: "device",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 80
            },
            kind: "string"
          }
        }, {
          name: "packageName",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 81
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 82
          },
          kind: "observable",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 82
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
        line: 89
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 89
        },
        kind: "function",
        argumentTypes: [{
          name: "device",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 90
            },
            kind: "string"
          }
        }, {
          name: "tcpPort",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 91
            },
            kind: "number"
          }
        }, {
          name: "pid",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 92
            },
            kind: "number"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 93
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 93
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
        line: 97
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 97
        },
        kind: "function",
        argumentTypes: [{
          name: "device",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 98
            },
            kind: "string"
          }
        }, {
          name: "packageName",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 99
            },
            kind: "string"
          }
        }, {
          name: "activity",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 100
            },
            kind: "string"
          }
        }, {
          name: "debug",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 101
            },
            kind: "boolean"
          }
        }, {
          name: "action",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 102
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "AdbService.js",
                line: 102
              },
              kind: "string"
            }
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 103
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 103
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
        line: 113
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 113
        },
        kind: "function",
        argumentTypes: [{
          name: "device",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 114
            },
            kind: "string"
          }
        }, {
          name: "packageName",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 115
            },
            kind: "string"
          }
        }, {
          name: "activity",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 116
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 117
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 117
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
        line: 121
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 121
        },
        kind: "function",
        argumentTypes: [{
          name: "device",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 122
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 123
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 123
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "AdbService.js",
                line: 123
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
        line: 127
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 127
        },
        kind: "function",
        argumentTypes: [{
          name: "device",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 128
            },
            kind: "string"
          }
        }, {
          name: "identifier",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 129
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 130
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 130
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "AdbService.js",
                line: 130
              },
              kind: "string"
            }
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
    Level: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "process-rpc-types.js",
        line: 44
      },
      name: "Level",
      definition: {
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 44
        },
        kind: "union",
        types: [{
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 44
          },
          kind: "string-literal",
          value: "info"
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 44
          },
          kind: "string-literal",
          value: "log"
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 44
          },
          kind: "string-literal",
          value: "warning"
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 44
          },
          kind: "string-literal",
          value: "error"
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 44
          },
          kind: "string-literal",
          value: "debug"
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 44
          },
          kind: "string-literal",
          value: "success"
        }]
      }
    },
    Message: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "process-rpc-types.js",
        line: 45
      },
      name: "Message",
      definition: {
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 45
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 45
          },
          name: "text",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 45
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 45
          },
          name: "level",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 45
            },
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
        fileName: "process-rpc-types.js",
        line: 47
      },
      name: "MessageEvent",
      definition: {
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 47
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 48
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 48
            },
            kind: "string-literal",
            value: "message"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 49
          },
          name: "message",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 49
            },
            kind: "named",
            name: "Message"
          },
          optional: false
        }]
      }
    },
    ProgressEvent: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "process-rpc-types.js",
        line: 52
      },
      name: "ProgressEvent",
      definition: {
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 52
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 53
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 53
            },
            kind: "string-literal",
            value: "progress"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 54
          },
          name: "progress",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 54
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 54
              },
              kind: "number"
            }
          },
          optional: false
        }]
      }
    },
    ResultEvent: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "process-rpc-types.js",
        line: 57
      },
      name: "ResultEvent",
      definition: {
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 57
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 58
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 58
            },
            kind: "string-literal",
            value: "result"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 59
          },
          name: "result",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 59
            },
            kind: "mixed"
          },
          optional: false
        }]
      }
    },
    StatusEvent: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "process-rpc-types.js",
        line: 62
      },
      name: "StatusEvent",
      definition: {
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 62
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 63
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 63
            },
            kind: "string-literal",
            value: "status"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 64
          },
          name: "status",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 64
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 64
              },
              kind: "string"
            }
          },
          optional: false
        }]
      }
    },
    TaskEvent: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "process-rpc-types.js",
        line: 67
      },
      name: "TaskEvent",
      definition: {
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 68
        },
        kind: "union",
        types: [{
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 47
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 48
            },
            name: "type",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 48
              },
              kind: "string-literal",
              value: "message"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 49
            },
            name: "message",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 49
              },
              kind: "named",
              name: "Message"
            },
            optional: false
          }]
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 52
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 53
            },
            name: "type",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 53
              },
              kind: "string-literal",
              value: "progress"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 54
            },
            name: "progress",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 54
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "process-rpc-types.js",
                  line: 54
                },
                kind: "number"
              }
            },
            optional: false
          }]
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 57
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 58
            },
            name: "type",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 58
              },
              kind: "string-literal",
              value: "result"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 59
            },
            name: "result",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 59
              },
              kind: "mixed"
            },
            optional: false
          }]
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 62
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 63
            },
            name: "type",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 63
              },
              kind: "string-literal",
              value: "status"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 64
            },
            name: "status",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 64
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "process-rpc-types.js",
                  line: 64
                },
                kind: "string"
              }
            },
            optional: false
          }]
        }],
        discriminantField: "type"
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
    },
    Process: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 27
      },
      name: "Process",
      definition: {
        location: {
          type: "source",
          fileName: "types.js",
          line: 27
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "types.js",
            line: 28
          },
          name: "user",
          type: {
            location: {
              type: "source",
              fileName: "types.js",
              line: 28
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "types.js",
            line: 29
          },
          name: "pid",
          type: {
            location: {
              type: "source",
              fileName: "types.js",
              line: 29
            },
            kind: "number"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "types.js",
            line: 30
          },
          name: "name",
          type: {
            location: {
              type: "source",
              fileName: "types.js",
              line: 30
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "types.js",
            line: 31
          },
          name: "cpuUsage",
          type: {
            location: {
              type: "source",
              fileName: "types.js",
              line: 31
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "types.js",
                line: 31
              },
              kind: "number"
            }
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "types.js",
            line: 32
          },
          name: "memUsage",
          type: {
            location: {
              type: "source",
              fileName: "types.js",
              line: 32
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "types.js",
                line: 32
              },
              kind: "number"
            }
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "types.js",
            line: 33
          },
          name: "isJava",
          type: {
            location: {
              type: "source",
              fileName: "types.js",
              line: 33
            },
            kind: "boolean"
          },
          optional: false
        }]
      }
    }
  }
});