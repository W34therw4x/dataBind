;(function(global){
    "use strict";

    var DataBindModule = function() {

        /** @param {Object} model - the data source */
        var model = {};

        /** @param {string} bindingPoint - name of binding point */
        var bindingPoint = "data-bind";

        /** @param {Array} dataBindElements - elements with binding points */
        var dataBindElements = [];

        /** @param {Object} DataBind - DataBind component */
        var DataBind = {};

        /**
         * observe the changes of all properties of the object
         * @private
         *
         * @param {Object} obj - object which properties will be watched
         * @param {(string|boolean)} path - lead to object value that will be watched
         * @returns {void}
         */
        var watch = function(obj, path) {
            if (typeof obj === "string" || !(obj instanceof Object)) {
                return;
            }

            var prop,
                props = [];
            for (prop in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, prop)) {
                    props.push(prop);
                }
            }
            watchProps(obj, props, path);
        };

        /**
         * observe the changes of many properties of the object
         * @private
         *
         * @param {Object} obj - object which properties will be watched
         * @param {Array} props - all elements in body
         * @param {(string|boolean)} path - lead to model value that will be watched
         * @returns {void}
         */
        var watchProps = function(obj, props, path) {
            for (var i = 0; i < props.length; i++) {
                var prop = props[i];
                watchOneProp(obj, prop, path);
            }
        };

        /**
         * observe the changes of one property of the object
         * @private
         *
         * @param {Object} obj - object which property will be watched
         * @param {string} prop - property name
         * @param {(string|boolean)} path - lead to model value that will be watched
         * @returns {void}
         */
        var watchOneProp = function(obj, prop, path) {
            var pathToProp = path ? path + "." + prop : prop;

            if (obj[prop] != null) {
                watch(obj[prop], pathToProp);
            }

            defineGetAndSet(obj, prop, pathToProp);
        };

        // todo: To Be Refactored...
        var defineGetAndSet = function(obj, propName, newPath) {
            var val = obj[propName];
            var getter = function() {
                return val;
            };

            var setter = function(newval) {
                var oldval = val;
                val = newval;
                if (oldval !== newval) {
                    dataBindElements.forEach(
                        function(newPath, element) {
                            var modifiedElementAttributes = getElementAttributes(element).filter(function(attribute) {
                                return attribute.value === newPath;
                            });

                            modifiedElementAttributes.forEach(function(attribute) {
                                if (attribute.name === bindingPoint) {
                                    element.innerText = newval;
                                } else {
                                    var attributeName = extractAttributeFromDataBind(attribute);
                                    element.setAttribute(attributeName, newval);
                                }
                            });
                        }.bind(null, newPath)
                    );
                }
            };

            Object.defineProperty(obj, propName, {
                get: getter,
                set: function(value) {
                    setter.call(this, value, true);
                },
                enumerable: true,
                configurable: true
            });
        };

        /**
         * get element attributes array
         * @private
         *
         * @param {Element} element - the element
         * @returns {Array}
         */
        var getElementAttributes = function(element) {
            return Array.prototype.slice.call(element.attributes);
        };
        /**
         * check if element have data-bind attributes
         * @private
         *
         * @param {Object} attribute - the data bind element attribute
         * @returns {boolean}
         */
        var isDataBindingPointAttribute = function(attribute) {
            return attribute.name.substring(0, bindingPoint.length) === bindingPoint;
        };

        /**
         * extract attribute name
         * @private
         *
         * @param {Object} attribute - the data bind element attribute
         * @returns {string}
         */
        var extractAttributeFromDataBind = function(attribute) {
            var regExp = new RegExp(bindingPoint + "-", "g");
            return attribute.name.replace(regExp, "");
        };

        /**
         * get data-bind attribute value from model
         * @private
         *
         * @param {string} path - lead to model value that will be binded
         * @returns {(string|undefined)}
         */
        var getDataBindValue = function(path) {
            return path.split(".").reduce(function(prev, curr) {
                return prev && prev[curr];
            }, model);
        };

        /**
         * sets element content based on it's data-bind attributes
         * @private
         *
         * @param {Element} element - the element
         * @returns {void}
         */
        var bindElementContent = function(element) {
            var dataBindValue = getDataBindValue(element.getAttribute(bindingPoint));
            if (dataBindValue !== undefined) {
                element.innerText = dataBindValue;
            }
        };

        /**
         * sets element attributes based on it's data-bind attributes
         * @private
         *
         * @param {Element} element - the element
         * @returns {void}
         */
        var bindElementAttributes = function(element) {
            var elementAttributes = getElementAttributes(element);
            var dataBindAttributes = elementAttributes.filter(function(attribute) {
                return attribute.name !== bindingPoint && isDataBindingPointAttribute(attribute);
            });
            dataBindAttributes.forEach(function(dataBindAttribute) {
                var attributeName = extractAttributeFromDataBind(dataBindAttribute);
                var dataBindValue = getDataBindValue(dataBindAttribute.value);
                if (dataBindValue !== undefined) {
                    element.setAttribute(attributeName, dataBindValue);
                }
            });
        };

        /**
         * sets element content and/or attribute based on it's data-bind attributes
         * @private
         *
         * @param {Element} element - the element
         * @returns {void}
         */
        var bindSingleElement = function(element) {
            if (element.hasAttribute(bindingPoint)) {
                bindElementContent(element);
            }
            bindElementAttributes(element);
        };

        /**
         * check if element have data-bind attributes
         * @private
         *
         * @param {Element} element - the element
         * @returns {boolean}
         */
        var isDataBindElement = function(element) {
            var elementAttributes = getElementAttributes(element);
            return elementAttributes.reduce(function(acc, attribute) {
                return acc || isDataBindingPointAttribute(attribute);
            }, false);
        };

        /**
         * filter data bind elements
         * @private
         *
         * @param {Array} elements - all elements in body
         * @returns {Array}
         */
        var getDataBindElements = function(elements) {
            return elements.filter(function(element) {
                return isDataBindElement(element);
            });
        };

        /**
         * sets model from given data source
         * @public
         *
         * @param {Object} data - the data source
         * @returns {void}
         */
        DataBind.setModel = function(data) {
            model = data;
            watch(model, false);
        };

        /**
         * binds data object to elements within body element
         * @public
         * @returns {void}
         */
        DataBind.init = function() {
            var allHTMLElements = Array.prototype.slice.call(document.body.getElementsByTagName("*"));
            dataBindElements = getDataBindElements(allHTMLElements);

            Array.prototype.forEach.call(dataBindElements, bindSingleElement);
        };

        return DataBind;
    };

    if (typeof module != 'undefined' && module.exports) {
        module.exports = DataBindModule;
    } else if (typeof define === 'function' && define.amd) {
        define('DataBind', [], DataBindModule);
    } else {
        global.DataBind = DataBindModule;
    }

})(this.window || global);