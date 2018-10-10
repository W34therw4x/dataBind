var model = {
    label: "Schibsted",
    subtitle: "Hooray!",
    linkLabel: "link disabled by data bind string",
    x: {
        y: {
            z: "some nested property to bind",
            zet: "super-duper-class-name"
        }
    },
    a: {
        b: {
            c: ""
        }
    }
};

var dataBind = new DataBind();
dataBind.setModel(model);
dataBind.init();