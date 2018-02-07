(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', 'lodash/fp', 'react'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('lodash/fp'), require('react'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.fp, global.react);
    global.reactFreshchat = mod.exports;
  }
})(this, function (exports, _fp, _react) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.widget = undefined;

  var _fp2 = _interopRequireDefault(_fp);

  var _react2 = _interopRequireDefault(_react);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  function _toConsumableArray(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
        arr2[i] = arr[i];
      }

      return arr2;
    } else {
      return Array.from(arr);
    }
  }

  function _objectWithoutProperties(obj, keys) {
    var target = {};

    for (var i in obj) {
      if (keys.indexOf(i) >= 0) continue;
      if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;
      target[i] = obj[i];
    }

    return target;
  }

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  var Queue = function () {
    function Queue() {
      _classCallCheck(this, Queue);

      this.data = [];
      this.index = 0;
    }

    _createClass(Queue, [{
      key: 'queue',
      value: function queue(value) {
        this.data.push(value);
      }
    }, {
      key: 'dequeue',
      value: function dequeue() {
        if (this.index > -1 && this.index < this.data.length) {
          var result = this.data[this.index++];

          if (this.isEmpty) {
            this.reset();
          }

          return result;
        }
      }
    }, {
      key: 'dequeueAll',
      value: function dequeueAll(cb) {
        if (!_fp2.default.isFunction(cb)) {
          throw new Error('Please provide a callback');
        }

        while (!this.isEmpty) {
          var _dequeue = this.dequeue(),
              method = _dequeue.method,
              args = _dequeue.args;

          cb(method, args);
        }
      }
    }, {
      key: 'reset',
      value: function reset() {
        this.data.length = 0;
        this.index = 0;
      }
    }, {
      key: 'isEmpty',
      get: function get() {
        return this.index >= this.data.length;
      }
    }]);

    return Queue;
  }();

  var fakeWidget = void 0;
  var earlyCalls = new Queue();

  var widget = exports.widget = function widget() {
    var fake = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : fakeWidget;

    if (window.fcWidget) return window.fcWidget;
    if (!fake) fake = mockMethods(availableMethods);
    return fake;
  };

  var mockMethods = function mockMethods(methods) {
    var obj = {};
    methods.forEach(function (method) {
      obj = _fp2.default.set(method, queueMethod(method), obj);
    });
    return obj;
  };

  var queueMethod = function queueMethod(method) {
    return function () {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      console.info('Queing', method);
      earlyCalls.queue({ method: method, args: args });
    };
  };

  var loadScript = function loadScript() {
    var id = 'freshchat-lib';
    if (document.getElementById(id) || window.fcWidget) return;
    console.info('Loading FreshChat Lib');
    var script = document.createElement('script');
    script.async = 'true';
    script.type = 'text/javascript';
    script.src = 'https://wchat.freshchat.com/js/widget.js';
    script.id = id;
    document.head.appendChild(script);
  };

  var FreshChat = function (_React$Component) {
    _inherits(FreshChat, _React$Component);

    function FreshChat(props) {
      _classCallCheck(this, FreshChat);

      var _this = _possibleConstructorReturn(this, (FreshChat.__proto__ || Object.getPrototypeOf(FreshChat)).call(this, props));

      console.info('FreshChat Component :)');

      var token = props.token,
          moreProps = _objectWithoutProperties(props, ['token']);

      if (!token) {
        throw new Error('token is required');
      }

      _this.init(Object.assign({
        host: 'https://wchat.freshchat.com',
        token: token
      }, moreProps));
      return _this;
    }

    _createClass(FreshChat, [{
      key: 'init',
      value: function init(settings) {
        if (settings.onInit) {
          var tmp = settings.onInit;
          settings.onInit = function () {
            return tmp(widget());
          };
        }

        if (window.fcWidget) {
          window.fcWidget.init(settings);
        } else {
          this.lazyInit(settings);
        }
      }
    }, {
      key: 'lazyInit',
      value: function lazyInit(settings) {
        widget().init(settings);

        loadScript();

        var interval = setInterval(function () {
          if (window.fcWidget) {
            clearInterval(interval);
            try {
              earlyCalls.dequeueAll(function (method, value) {
                var _window$fcWidget;

                (_window$fcWidget = window.fcWidget)[method].apply(_window$fcWidget, _toConsumableArray(value));
              });
            } catch (e) {
              console.error(e);
            }
          }
        }, 1000);
      }
    }, {
      key: 'render',
      value: function render() {
        return false;
      }
    }, {
      key: 'componentWillUnmount',
      value: function componentWillUnmount() {
        widget().close();
      }
    }, {
      key: 'componentWillReceiveProps',
      value: function componentWillReceiveProps(nextProps) {
        var token = nextProps.token,
            moreProps = _objectWithoutProperties(nextProps, ['token']);

        this.init(Object.assign({
          host: 'https://wchat.freshchat.com',
          token: token
        }, moreProps));
      }
    }]);

    return FreshChat;
  }(_react2.default.Component);

  var availableMethods = ['close', 'destroy', 'hide', 'init', 'isInitialized', 'isLoaded', 'isOpen', 'off', 'on', 'open', 'setConfig', 'setExternalId', 'setFaqTags', 'setTags', 'track', 'user.show', 'user.track', 'user.user', 'user.clear', 'user.create', 'user.get', 'user.isExists', 'user.setEmail', 'user.setFirstName', 'user.setLastName', 'user.setMeta', 'user.setPhone', 'user.setPhoneCountryCode', 'user.setProperties', 'user.update'];

  exports.default = FreshChat;
});