(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        root.DataBind = factory();
    }
})(this, function() {
    /** @param {Object} model - the data source */
    var model = {};

    /** @param {string} bindingPoint - name of binding point */
    var bindingPoint = 'data-bind';

    /** @param {Array} dataBindElements - elements with binding points */
    var dataBindElements = [];

    /** @param {Object} DataBind - DataBind component */
    var DataBind = {};

    /**
     * binds data object to elements within body element
     * @public
     * 
     * @param {Object} data - the data source
     * @returns {void}
     */
    DataBind.init = function(data) {
        model = data;
        var allHTMLElements = Array.prototype.slice.call(document.body.getElementsByTagName('*'));
        setDataBindElements(allHTMLElements);
        Array.prototype.forEach.call(dataBindElements, bindSingleElement);
        watch(model, false);
    };

    /**
     * filter data bind elements
     * @private
     *
     * @param {Array} elements - all elements in body
     * @returns {void}
     */
    var setDataBindElements = function(elements) {
        dataBindElements = elements.filter(function(element) {
            return isDataBindElement(element);
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
     * sets element content based on it's data-bind attributes
     * @private
     *
     * @param {Element} element - the element
     * @returns {void}
     */
    var bindElementContent = function(element) {
        var dataBindValue = getDataBindValue(element.getAttribute(bindingPoint));
        if (dataBindValue !== undefined) {
            setElementContentOnView(element, dataBindValue);
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
            var dataBindValue = getDataBindValue(dataBindAttribute.value);
            if (dataBindValue !== undefined) {
                setElementAttributeOnView(element, dataBindAttribute, dataBindValue);
            }
        });
    };

    /**
     * observe the changes of all properties of the object
     * @private
     *
     * @param {Object} obj - which properties will be watched
     * @param {(string|boolean)} path - lead to object properties that will be watched
     * @returns {void}
     */
    var watch = function(obj, path) {
        if (typeof obj === 'string' || !(obj instanceof Object)) {
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
     * @param {Object} obj - which properties will be watched
     * @param {Array} props - properties that will be watched
     * @param {(string|boolean)} path - lead to model properties that will be watched
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
     * @param {string} prop - property that will be watched
     * @param {(string|boolean)} path - lead to model properties that will be watched
     * @returns {void}
     */
    var watchOneProp = function(obj, prop, path) {
        var pathToProp = path ? path + '.' + prop : prop;

        if (obj[prop] != null) {
            watch(obj[prop], pathToProp);
        }

        defineGetAndSet(obj, prop, pathToProp);
    };

    /**
     * set custom getters and setters on watched properties
     * @private
     *
     * @param {Object} obj - object which property will be watched
     * @param {string} prop - properties that will be watched
     * @param {string} pathToProp - lead to model property that will be watched
     * @returns {void}
     */
    var defineGetAndSet = function(obj, prop, pathToProp) {
        var value = obj[prop];
        var getter = function() {
            return value;
        };

        var setter = function(newValue) {
            var oldValue = value;
            value = newValue;
            if (oldValue !== newValue) {
                updateAllElementsWithBoundValue(newValue, pathToProp);
            }
        };

        Object.defineProperty(obj, prop, {
            get: getter,
            set: function(value) {
                setter.call(this, value, true);
            },
            enumerable: true,
            configurable: true
        });
    };

    /**
     * update elements attributes and/or content values
     * @private
     *
     * @param {string} newValue - of modified prop
     * @param {string} pathToProp - lead to model property
     * @returns {void}
     */
    var updateAllElementsWithBoundValue = function(newValue, pathToProp) {
        dataBindElements.forEach(
            function(pathToProp, element) {
                var modifiedDataBindAttributes = getDataBindAttributesToUpdate(element, pathToProp);
                updateBoundElement(element, modifiedDataBindAttributes, newValue);
            }.bind(null, pathToProp)
        );
    };

    /**
     * get attributes for which model value had changed
     * @private
     *
     * @param {Element} element - the element
     * @param {string} pathToProp - lead to model property
     * @returns {Array}
     */
    var getDataBindAttributesToUpdate = function(element, pathToProp) {
        return getElementAttributes(element).filter(function(attribute) {
            return attribute.value === pathToProp;
        });
    };

    /**
     * update view, changing bound element attributes and/or content values
     * @private
     *
     * @param {Element} element - whose attributes will be updated
     * @param {Array} dataBindAttributes - describe what have to be updated
     * @param {string} newValue - of modified prop
     * @returns {void}
     */
    var updateBoundElement = function(element, dataBindAttributes, newValue) {
        dataBindAttributes.forEach(function(dataBindAttribute) {
            if (dataBindAttribute.name === bindingPoint) {
                setElementContentOnView(element, newValue);
            } else {
                setElementAttributeOnView(element, dataBindAttribute, newValue);
            }
        });
    };

    /**
     * get data-bind attribute value from model
     * @private
     *
     * @param {string} path - lead to model value that will be bound
     * @returns {(string|undefined)}
     */
    var getDataBindValue = function(path) {
        return path.split('.').reduce(function(prev, curr) {
            return prev && prev[curr];
        }, model);
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
     * check if element have data-bind attributes
     * @private
     *
     * @param {Object} attribute - one of element attributes
     * @returns {boolean}
     */
    var isDataBindingPointAttribute = function(attribute) {
        return attribute.name.substring(0, bindingPoint.length) === bindingPoint;
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
     * update HTML view, setting or changing element content
     * @private
     *
     * @param {Element} element - whose content will be set
     * @param {string} value - of content
     * @returns {void}
     */
    var setElementContentOnView = function(element, value) {
        element.innerText = value;
    };

    /**
     * update HTML view, setting or changing element attribute
     * @private
     *
     * @param {Element} element - whose attribute will be set
     * @param {Object} dataBindAttribute - describe what have to be updated
     * @param {string} value - of attribute
     * @returns {void}
     */
    var setElementAttributeOnView = function(element, dataBindAttribute, value) {
        var attributeName = extractAttributeFromDataBind(dataBindAttribute);
        element.setAttribute(attributeName, value);
    };

    /**
     * extract attribute name
     * @private
     *
     * @param {Object} attribute - the data bind element attribute
     * @returns {string}
     */
    var extractAttributeFromDataBind = function(attribute) {
        var regExp = new RegExp(bindingPoint + '-', 'g');
        return attribute.name.replace(regExp, '');
    };

    return DataBind;
});
