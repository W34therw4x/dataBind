
function getDataBindHolders(elements) {
    return elements.filter(function(element) {
        var elementAttributes = Array.prototype.slice.call(element.attributes);
        return elementAttributes.reduce(function(acc, attribute){
            return acc || attribute.name.substring(0, 9) === "data-bind"
        }, false);
    });
}

function DataBind() {
    var allHTMLElements = Array.prototype.slice.call(document.body.getElementsByTagName("*"));
    var dataBindHolders = getDataBindHolders(allHTMLElements);

    console.log(dataBindHolders);
}