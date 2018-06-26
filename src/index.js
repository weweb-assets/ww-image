import wwObject from './wwObjectSrc.vue'

const name = "ww-image";
const wwEnableMetrics = true;

const addComponent = function () {
    if (window.vm) {
        window.vm.addComponent(name, wwObject);

        wwLib.wwObject.registerContentType(
            name,
            {
                type: name,
                data: {
                    url: '/img/no_image_selected.png',
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
            wwEnableMetrics
        );

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