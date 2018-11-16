import wwObject from './wwObjectImage.vue'

const name = "ww-image";
const wwEnableMetrics = true;

const addComponent = function () {
    if (window.vm) {

        wwLib.wwObject.register({
            content: {
                type: name,
                data: {
                    url: 'https://cdn.wewebapp.io/public/images/no_image_selected.png',
                    alt: {
                        fr_FR: "webeo",
                        en_GB: "webeo",
                    },
                    position: { x: 0, y: 0 },
                    zoom: -1,
                    ratio: -1,
                    imgSize: {
                        w: 1920,
                        h: 1080
                    },
                    borderColor: '',
                    classes: [],
                    filterGradient: null,
                    hover: {
                        name: '',
                        options: {}
                    }
                }
            },
            enableMetrics: wwEnableMetrics,
            /* wwManager:start */
            cmsOptions: {
            }
            /* wwManager:end */
        });


        window.vm.addComponent(name, wwObject);

        return true;
    }
    return false;
}

if (!addComponent()) {
    const iniInterval = setInterval(function () {
        if (addComponent()) {
            clearInterval(iniInterval);
        }
    }, 10);
}