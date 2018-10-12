var DataBind = require('../DataBind');
var model = require('../__fixtures__/model.js');

describe('when initialized with given model on given view', () => {
    it('sets elements content to value from model', () => {
        document.body.innerHTML = '<h1 id="1" data-bind="label" data-bind-title="x.y.z" title="to be overwritten"></h1>';
        DataBind.init(model);
        expect(document.getElementById('1').innerText).toEqual(model.label);
    });

    it('sets element content to empty string if such is provided from model', () => {
        document.body.innerHTML = '<a id="1" data-bind="linkLabel" data-bind-disabled="a.b.c"></a>';
        DataBind.init(model);
        expect(document.getElementById('1').innerText).toEqual('');
    });

    it('sets elements attribute to value from model', () => {
        document.body.innerHTML = '<h1 id="1" data-bind="label" data-bind-title="x.y.z" title="to be overwritten"></h1>';
        DataBind.init(model);
        const attribute = document.getElementById('1').getAttribute('title');
        expect(attribute).toEqual(model.x.y.z);
    });

    it('creates elements attribute if it did not exits and sets its value from model', () => {
        document.body.innerHTML = '<div id="1" data-bind="noSuchLabel" data-bind-class="x.y.zet"></div>';
        const nonExistingAttribute = document.getElementById('1').getAttribute('class');
        expect(nonExistingAttribute).toBeNull();
        DataBind.init(model);
        const attribute = document.getElementById('1').getAttribute('class');
        expect(attribute).toEqual(model.x.y.zet);
    });

    it('watch for model change regarding view element content and update that content', () => {
        document.body.innerHTML = '<h2 id="1" data-bind="subtitle"></h2>';
        DataBind.init(model);
        model.subtitle = 'new content value';
        expect(document.getElementById('1').innerText).toEqual('new content value');
    });

    it('watch for model change regarding view element attribute and update that attribute value', () => {
        document.body.innerHTML = '<h2 id="1" data-bind-class="x.y.zet"></h2>';
        DataBind.init(model);
        model.x.y.zet = 'new attribute value';
        expect(document.getElementById('1').getAttribute('class')).toEqual('new attribute value');
    });
});
