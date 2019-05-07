import wwObject from './wwObjectImage.vue'

const name = "__NAME__";
const version = '__VERSION__';

const addComponent = function () {
    if (window.vm) {

        wwLib.wwObject.register({
            content: {
                type: name,
                data: {
                    url: 'https://cdn.weweb.app/public/images/no_image_selected.png',
                    alt: '',
                    position: { x: 0, y: 0 },
                    pos: {},
                    zoom: 1,
                    style: {
                        borderRadius: 0,
                        borderWidth: 0,
                        borderColor: null,
                        borderStyle: null,
                        overlay: null,
                        filter: null,
                        boxShadow: {
                            x: 0,
                            y: 0,
                            b: 0,
                            s: 0,
                            c: ''
                        },
                    },
                    animation: {
                        duration: 0,
                        delay: 0,
                        fn: null,
                        opacity: 1,
                        scale: 1,
                        translateX: 0,
                        translateY: 0,
                        rotate: 0
                    },
                    imgSize: {
                        w: 1920,
                        h: 1080
                    },
                    hover: {
                        name: '',
                        options: {}
                    }
                }
            },
            upsales: {
                wwAnalytics: {
                    click: true
                }
            },
            /* wwManager:start */
            cmsOptions: {
                wwObjectMenu: {
                    items: [
                        {
                            name: 'OPTIONS',
                            main: true,
                            text: {
                                en: 'Options',
                                fr: 'Options'
                            },
                            icon: 'wwi wwi-edit-other',
                            action: 'edit'
                        },
                        {
                            name: 'SOURCE',
                            text: {
                                en: 'Image',
                                fr: 'Image'
                            },
                            icon: 'wwi wwi-image',
                            action: 'changeImage'
                        }
                    ]
                }
            }
            /* wwManager:end */
        });

        window.vm.addComponent({
            name: name,
            version: version,
            content: wwObject
        });

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