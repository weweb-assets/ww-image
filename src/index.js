import wwObject from './wwObject.vue'

const name = "ww-text";

const addComponent = function () {
    if (window.vm) {
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