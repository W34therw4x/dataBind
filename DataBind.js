;(function(global){
    "use strict";

    var DataBindModule = function() {

        /** @param {Object} model - the data source */
        var model = {};

        /** @param {string} bindingPoint - name of binding point */
        var bindingPoint = "data-bind";

        /** @param {Object} DataBind - DataBind component*/
        var DataBind = {};

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
         * extract data-bind attribute value from model
         * @private
         *
         * @param {Object} model - the data source
         * @param {string} path - lead to model value that will be binded
         * @returns {string}
         */
        var getDataBindValue = function (model, path) {
            var dataBindValue = path.split(".").reduce(function(prev, curr) {
                return prev && prev[curr];
            }, model);
            return dataBindValue || "";
        };

        /**
         * sets element content based on it's data-bind attributes
         * @private
         *
         * @param {Object} model - the data source
         * @param {Element} element - the element
         * @returns {void}
         */
        var bindElementContent = function(model, element) {
            if (element.hasAttribute(bindingPoint)) {
                element.innerText = getDataBindValue(model, element.getAttribute(bindingPoint));
            }
        };

        /**
         * sets element content and/or attribute based on it's data-bind attributes
         * @private
         *
         * @param {Object} model - the data source
         * @param {Element} element - the element
         * @returns {void}
         */
        var bindSingleElement = function(model, element) {
            bindElementContent(model, element);
        };

        /**
         * check if element have data-bind attributes
         * @private
         *
         * @param {Element} element - the element
         * @returns {boolean}
         */
        var isDataBindElement = function(element) {
            var elementAttributes = Array.prototype.slice.call(element.attributes);
            return elementAttributes.reduce(function(acc, attribute){
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
        };

        /**
         * binds data object to elements within body element
         * @public
         * @returns {void}
         */
        DataBind.init = function() {
            var allHTMLElements = Array.prototype.slice.call(document.body.getElementsByTagName("*"));
            var dataBindElements = getDataBindElements(allHTMLElements);

            Array.prototype.forEach.call(dataBindElements, bindSingleElement.bind(null, model));
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