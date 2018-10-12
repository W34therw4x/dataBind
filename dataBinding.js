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
        },
        labelUsedForContentAndAttribute: "same for content as for title attribute"
    }
};

DataBind.init(model);