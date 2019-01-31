(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
!function(e,t){if("function"==typeof define&&define.amd)define(["exports"],t);else if("undefined"!=typeof exports)t(exports);else{var o={};t(o),e.bodyScrollLock=o}}(this,function(exports){"use strict";function r(e){if(Array.isArray(e)){for(var t=0,o=Array(e.length);t<e.length;t++)o[t]=e[t];return o}return Array.from(e)}Object.defineProperty(exports,"__esModule",{value:!0});var l=!1;if("undefined"!=typeof window){var e={get passive(){l=!0}};window.addEventListener("testPassive",null,e),window.removeEventListener("testPassive",null,e)}var d="undefined"!=typeof window&&window.navigator&&window.navigator.platform&&/iP(ad|hone|od)/.test(window.navigator.platform),c=[],u=!1,a=-1,s=void 0,v=void 0,f=function(t){return c.some(function(e){return!(!e.options.allowTouchMove||!e.options.allowTouchMove(t))})},m=function(e){var t=e||window.event;return!!f(t.target)||(1<t.touches.length||(t.preventDefault&&t.preventDefault(),!1))},o=function(){setTimeout(function(){void 0!==v&&(document.body.style.paddingRight=v,v=void 0),void 0!==s&&(document.body.style.overflow=s,s=void 0)})};exports.disableBodyScroll=function(i,e){if(d){if(!i)return void console.error("disableBodyScroll unsuccessful - targetElement must be provided when calling disableBodyScroll on IOS devices.");if(i&&!c.some(function(e){return e.targetElement===i})){var t={targetElement:i,options:e||{}};c=[].concat(r(c),[t]),i.ontouchstart=function(e){1===e.targetTouches.length&&(a=e.targetTouches[0].clientY)},i.ontouchmove=function(e){var t,o,n,r;1===e.targetTouches.length&&(o=i,r=(t=e).targetTouches[0].clientY-a,!f(t.target)&&(o&&0===o.scrollTop&&0<r?m(t):(n=o)&&n.scrollHeight-n.scrollTop<=n.clientHeight&&r<0?m(t):t.stopPropagation()))},u||(document.addEventListener("touchmove",m,l?{passive:!1}:void 0),u=!0)}}else{n=e,setTimeout(function(){if(void 0===v){var e=!!n&&!0===n.reserveScrollBarGap,t=window.innerWidth-document.documentElement.clientWidth;e&&0<t&&(v=document.body.style.paddingRight,document.body.style.paddingRight=t+"px")}void 0===s&&(s=document.body.style.overflow,document.body.style.overflow="hidden")});var o={targetElement:i,options:e||{}};c=[].concat(r(c),[o])}var n},exports.clearAllBodyScrollLocks=function(){d?(c.forEach(function(e){e.targetElement.ontouchstart=null,e.targetElement.ontouchmove=null}),u&&(document.removeEventListener("touchmove",m,l?{passive:!1}:void 0),u=!1),c=[],a=-1):(o(),c=[])},exports.enableBodyScroll=function(t){if(d){if(!t)return void console.error("enableBodyScroll unsuccessful - targetElement must be provided when calling enableBodyScroll on IOS devices.");t.ontouchstart=null,t.ontouchmove=null,c=c.filter(function(e){return e.targetElement!==t}),u&&0===c.length&&(document.removeEventListener("touchmove",m,l?{passive:!1}:void 0),u=!1)}else 1===c.length&&c[0].targetElement===t?(o(),c=[]):c=c.filter(function(e){return e.targetElement!==t})}});

},{}],2:[function(require,module,exports){
var QueryHandler = require('./QueryHandler');
var each = require('./Util').each;

/**
 * Represents a single media query, manages it's state and registered handlers for this query
 *
 * @constructor
 * @param {string} query the media query string
 * @param {boolean} [isUnconditional=false] whether the media query should run regardless of whether the conditions are met. Primarily for helping older browsers deal with mobile-first design
 */
function MediaQuery(query, isUnconditional) {
    this.query = query;
    this.isUnconditional = isUnconditional;
    this.handlers = [];
    this.mql = window.matchMedia(query);

    var self = this;
    this.listener = function(mql) {
        // Chrome passes an MediaQueryListEvent object, while other browsers pass MediaQueryList directly
        self.mql = mql.currentTarget || mql;
        self.assess();
    };
    this.mql.addListener(this.listener);
}

MediaQuery.prototype = {

    constuctor : MediaQuery,

    /**
     * add a handler for this query, triggering if already active
     *
     * @param {object} handler
     * @param {function} handler.match callback for when query is activated
     * @param {function} [handler.unmatch] callback for when query is deactivated
     * @param {function} [handler.setup] callback for immediate execution when a query handler is registered
     * @param {boolean} [handler.deferSetup=false] should the setup callback be deferred until the first time the handler is matched?
     */
    addHandler : function(handler) {
        var qh = new QueryHandler(handler);
        this.handlers.push(qh);

        this.matches() && qh.on();
    },

    /**
     * removes the given handler from the collection, and calls it's destroy methods
     *
     * @param {object || function} handler the handler to remove
     */
    removeHandler : function(handler) {
        var handlers = this.handlers;
        each(handlers, function(h, i) {
            if(h.equals(handler)) {
                h.destroy();
                return !handlers.splice(i,1); //remove from array and exit each early
            }
        });
    },

    /**
     * Determine whether the media query should be considered a match
     *
     * @return {Boolean} true if media query can be considered a match, false otherwise
     */
    matches : function() {
        return this.mql.matches || this.isUnconditional;
    },

    /**
     * Clears all handlers and unbinds events
     */
    clear : function() {
        each(this.handlers, function(handler) {
            handler.destroy();
        });
        this.mql.removeListener(this.listener);
        this.handlers.length = 0; //clear array
    },

    /*
        * Assesses the query, turning on all handlers if it matches, turning them off if it doesn't match
        */
    assess : function() {
        var action = this.matches() ? 'on' : 'off';

        each(this.handlers, function(handler) {
            handler[action]();
        });
    }
};

module.exports = MediaQuery;

},{"./QueryHandler":4,"./Util":5}],3:[function(require,module,exports){
var MediaQuery = require('./MediaQuery');
var Util = require('./Util');
var each = Util.each;
var isFunction = Util.isFunction;
var isArray = Util.isArray;

/**
 * Allows for registration of query handlers.
 * Manages the query handler's state and is responsible for wiring up browser events
 *
 * @constructor
 */
function MediaQueryDispatch () {
    if(!window.matchMedia) {
        throw new Error('matchMedia not present, legacy browsers require a polyfill');
    }

    this.queries = {};
    this.browserIsIncapable = !window.matchMedia('only all').matches;
}

MediaQueryDispatch.prototype = {

    constructor : MediaQueryDispatch,

    /**
     * Registers a handler for the given media query
     *
     * @param {string} q the media query
     * @param {object || Array || Function} options either a single query handler object, a function, or an array of query handlers
     * @param {function} options.match fired when query matched
     * @param {function} [options.unmatch] fired when a query is no longer matched
     * @param {function} [options.setup] fired when handler first triggered
     * @param {boolean} [options.deferSetup=false] whether setup should be run immediately or deferred until query is first matched
     * @param {boolean} [shouldDegrade=false] whether this particular media query should always run on incapable browsers
     */
    register : function(q, options, shouldDegrade) {
        var queries         = this.queries,
            isUnconditional = shouldDegrade && this.browserIsIncapable;

        if(!queries[q]) {
            queries[q] = new MediaQuery(q, isUnconditional);
        }

        //normalise to object in an array
        if(isFunction(options)) {
            options = { match : options };
        }
        if(!isArray(options)) {
            options = [options];
        }
        each(options, function(handler) {
            if (isFunction(handler)) {
                handler = { match : handler };
            }
            queries[q].addHandler(handler);
        });

        return this;
    },

    /**
     * unregisters a query and all it's handlers, or a specific handler for a query
     *
     * @param {string} q the media query to target
     * @param {object || function} [handler] specific handler to unregister
     */
    unregister : function(q, handler) {
        var query = this.queries[q];

        if(query) {
            if(handler) {
                query.removeHandler(handler);
            }
            else {
                query.clear();
                delete this.queries[q];
            }
        }

        return this;
    }
};

module.exports = MediaQueryDispatch;

},{"./MediaQuery":2,"./Util":5}],4:[function(require,module,exports){
/**
 * Delegate to handle a media query being matched and unmatched.
 *
 * @param {object} options
 * @param {function} options.match callback for when the media query is matched
 * @param {function} [options.unmatch] callback for when the media query is unmatched
 * @param {function} [options.setup] one-time callback triggered the first time a query is matched
 * @param {boolean} [options.deferSetup=false] should the setup callback be run immediately, rather than first time query is matched?
 * @constructor
 */
function QueryHandler(options) {
    this.options = options;
    !options.deferSetup && this.setup();
}

QueryHandler.prototype = {

    constructor : QueryHandler,

    /**
     * coordinates setup of the handler
     *
     * @function
     */
    setup : function() {
        if(this.options.setup) {
            this.options.setup();
        }
        this.initialised = true;
    },

    /**
     * coordinates setup and triggering of the handler
     *
     * @function
     */
    on : function() {
        !this.initialised && this.setup();
        this.options.match && this.options.match();
    },

    /**
     * coordinates the unmatch event for the handler
     *
     * @function
     */
    off : function() {
        this.options.unmatch && this.options.unmatch();
    },

    /**
     * called when a handler is to be destroyed.
     * delegates to the destroy or unmatch callbacks, depending on availability.
     *
     * @function
     */
    destroy : function() {
        this.options.destroy ? this.options.destroy() : this.off();
    },

    /**
     * determines equality by reference.
     * if object is supplied compare options, if function, compare match callback
     *
     * @function
     * @param {object || function} [target] the target for comparison
     */
    equals : function(target) {
        return this.options === target || this.options.match === target;
    }

};

module.exports = QueryHandler;

},{}],5:[function(require,module,exports){
/**
 * Helper function for iterating over a collection
 *
 * @param collection
 * @param fn
 */
function each(collection, fn) {
    var i      = 0,
        length = collection.length,
        cont;

    for(i; i < length; i++) {
        cont = fn(collection[i], i);
        if(cont === false) {
            break; //allow early exit
        }
    }
}

/**
 * Helper function for determining whether target object is an array
 *
 * @param target the object under test
 * @return {Boolean} true if array, false otherwise
 */
function isArray(target) {
    return Object.prototype.toString.apply(target) === '[object Array]';
}

/**
 * Helper function for determining whether target object is a function
 *
 * @param target the object under test
 * @return {Boolean} true if function, false otherwise
 */
function isFunction(target) {
    return typeof target === 'function';
}

module.exports = {
    isFunction : isFunction,
    isArray : isArray,
    each : each
};

},{}],6:[function(require,module,exports){
var MediaQueryDispatch = require('./MediaQueryDispatch');
module.exports = new MediaQueryDispatch();

},{"./MediaQueryDispatch":3}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _bodyScrollLock = require('body-scroll-lock');

var _constants = require('./utils/constants');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Navigation = function () {
  function Navigation() {
    var _this = this;

    _classCallCheck(this, Navigation);

    this.state = {
      mode: _constants.MOBILE,
      level: 0,
      open: false,
      activeItems: []
    };

    this.openNavigation = function () {
      if (!_this.state.open) {
        _this.state.open = true;
        _this.root.classList.add(Navigation.cssClasses.open);
        _this.showNavigationButton.classList.add(Navigation.cssClasses.showNavigationButtonActive);
        _this.closeNavigationButton.classList.remove(Navigation.cssClasses.closeNavigationButtonActive);
        document.documentElement.classList.add(Navigation.cssClasses.disableScroll);
        (0, _bodyScrollLock.disableBodyScroll)(_this.state.scrollDiv);
      }
    };

    this.closeNavigation = function () {
      if (_this.state.open) {
        _this.state.open = false;
        _this.root.classList.remove(Navigation.cssClasses.open);
        _this.closeNavigationButton.classList.add(Navigation.cssClasses.closeNavigationButtonActive);
        _this.showNavigationButton.classList.remove(Navigation.cssClasses.showNavigationButtonActive);
        document.documentElement.classList.remove(Navigation.cssClasses.disableScroll);
        (0, _bodyScrollLock.enableBodyScroll)(_this.state.scrollDiv);
      }
    };

    this.root = document.querySelector('.js-navigation');

    if (this.root) {
      this.showNavigationButton = this.root.querySelector('.js-show-navigation');
      this.closeNavigationButton = this.root.querySelector('.js-close-navigation');
      this.slideArea = this.root.querySelector('.js-navigation-slide-area');
      this.wrapper = this.root.querySelector('.js-navigation-wrapper');
      this.inner = this.root.querySelector('.js-navigation-inner');

      this.setupShowNavigationButton();
      this.setupCloseNavigationButton();
      this.setupLevelSwitch();
    }
  }

  _createClass(Navigation, [{
    key: 'setupLevelSwitch',
    value: function setupLevelSwitch() {
      this.store = this.getStore();

      if (this.store) {
        this.setupParentButtons();
        this.setupLinks();
      }
    }
  }, {
    key: 'slideToLevel',
    value: function slideToLevel(level) {
      var slide = level * 100;

      this.slideArea.style.transform = 'translateX(' + -slide + '%)';
      this.state.level = level;
    }
  }, {
    key: 'previousLevel',
    value: function previousLevel() {
      this.slideToLevel(this.state.level - 1);
    }
  }, {
    key: 'nextLevel',
    value: function nextLevel() {
      this.slideToLevel(this.state.level + 1);
    }
  }, {
    key: 'resetMobileNavigation',
    value: function resetMobileNavigation() {
      this.slideArea.style.transform = '';
      this.state.level = 0;
      this.resetActiveNavigationItem();
      this.closeNavigation();
    }
  }, {
    key: 'resetActiveNavigationItem',
    value: function resetActiveNavigationItem() {
      this.state.activeItems.forEach(function (item) {
        item.classList.remove(Navigation.cssClasses.activeNavigationItem);
      });
    }
  }, {
    key: 'backToParent',
    value: function backToParent() {
      this.previousLevel();
      this.resetActiveNavigationItem();
    }
  }, {
    key: 'setupParentButtons',
    value: function setupParentButtons() {
      var _this2 = this;

      var parentButtons = this.store.map(function (item) {
        return item.parentButton;
      });

      parentButtons.forEach(function (item) {
        item.addEventListener('click', function (e) {
          _this2.backToParent();
          e.preventDefault();
        });
      });
    }
  }, {
    key: 'openLink',
    value: function openLink(link, item) {
      item.classList.add(Navigation.cssClasses.activeNavigationItem);
      this.nextLevel();
      this.state.activeItems = [].concat(_toConsumableArray(this.state.activeItems), [item]);
    }
  }, {
    key: 'setupLinks',
    value: function setupLinks() {
      var _this3 = this;

      this.store.forEach(function (_ref) {
        var item = _ref.item,
            link = _ref.link;

        link.addEventListener('click', function (e) {
          if (_this3.state.mode !== _constants.DESKTOP) {
            _this3.openLink(link, item);
            e.preventDefault();
          }
        });
      });
    }
  }, {
    key: 'getStore',
    value: function getStore() {
      var itemsWithChldren = this.root.querySelectorAll('.js-item-with-children');

      if (itemsWithChldren) {
        return [].concat(_toConsumableArray(itemsWithChldren)).map(function (item) {
          var link = item.querySelector('.js-navigation-link');
          var parentButton = item.querySelector('.js-parent-button');

          return {
            item: item,
            link: link,
            parentButton: parentButton
          };
        });
      }

      return false;
    }
  }, {
    key: 'setupShowNavigationButton',
    value: function setupShowNavigationButton() {
      var _this4 = this;

      this.showNavigationButton.addEventListener('click', function () {
        _this4.openNavigation();
      });
    }
  }, {
    key: 'setupCloseNavigationButton',
    value: function setupCloseNavigationButton() {
      var _this5 = this;

      this.closeNavigationButton.addEventListener('click', function () {
        _this5.closeNavigation();
      });
    }
  }, {
    key: 'setMode',
    value: function setMode(mode) {
      this.state.mode = mode;
    }
  }, {
    key: 'updateScrollArea',
    value: function updateScrollArea(mode) {
      if (this.state.open) {
        (0, _bodyScrollLock.enableBodyScroll)(this.state.scrollDiv);
      }

      if (mode === _constants.TABLET) {
        this.state.scrollDiv = this.inner;
      } else if (mode === _constants.MOBILE) {
        this.state.scrollDiv = this.wrapper;
      }

      if (this.state.open) {
        (0, _bodyScrollLock.disableBodyScroll)(this.state.scrollDiv);
      }
    }
  }]);

  return Navigation;
}();

Navigation.cssClasses = {
  open: 'header--nav-open',
  showNavigationButtonActive: 'header__show-navigation--active',
  closeNavigationButtonActive: 'header__close-navigation--active',
  activeNavigationItem: 'primary-nav__item--active'
};
exports.default = Navigation;

},{"./utils/constants":9,"body-scroll-lock":1}],8:[function(require,module,exports){
'use strict';

var _enquire = require('enquire.js');

var _enquire2 = _interopRequireDefault(_enquire);

var _navigation = require('./navigation');

var _navigation2 = _interopRequireDefault(_navigation);

var _constants = require('./utils/constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var App = function App() {
  var _this = this;

  _classCallCheck(this, App);

  this.navigation = new _navigation2.default();

  _enquire2.default.register(App.breakpoints.lg, {
    match: function match() {
      _this.navigation.resetMobileNavigation();
      _this.navigation.setMode(_constants.DESKTOP);
    }
  });

  _enquire2.default.register(App.breakpoints.md, {
    match: function match() {
      _this.navigation.setMode(_constants.TABLET);
      _this.navigation.updateScrollArea(_constants.TABLET);
    }
  });

  _enquire2.default.register(App.breakpoints.sm, {
    match: function match() {
      _this.navigation.setMode(_constants.MOBILE);
      _this.navigation.updateScrollArea(_constants.MOBILE);
    }
  });
};

App.breakpoints = {
  lg: 'screen and (min-width: 992px)',
  md: 'screen and (min-width: 768px) and (max-width: 991px)',
  sm: 'screen and (max-width: 767px)'
};


document.addEventListener('DOMContentLoaded', function () {
  return new App();
});

},{"./navigation":7,"./utils/constants":9,"enquire.js":6}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var MOBILE = exports.MOBILE = 'MOBILE';
var TABLET = exports.TABLET = 'TABLET';
var DESKTOP = exports.DESKTOP = 'DESKTOP';

},{}]},{},[8]);
