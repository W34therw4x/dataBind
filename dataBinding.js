var model = {
    label: "Schibsted",
    subtitle: "Hooray!",
    x: {
        y: {
            z: "some nested property to bind",
            zet: "another nested property"
        }
    },
}

var dataBind = new DataBind();
dataBind.setModel(model);
dataBind.init();