<template>
    <Hydrate ssr-only class="ww-image">
        <wwImage class="ww-image" v-bind="$attrs" v-on="$listeners" />
    </Hydrate>
</template>

<script>
import Hydrate from 'lazy-hydration';
import wwImage from './wwImage.vue';

/* wwManager:start */
import openPopup from './popups';
/* wwManager:end */

export default {
    name: '__COMPONENT_NAME__',
    inheritAttrs: false,
    wwDefaultContent: {
        url: 'https://cdn.weweb.app/public/images/no_image_selected.png',
        alt: '',
        position: {
            x: 0,
            y: 0,
        },
        zoom: 1,
        style: {
            minWidth: 300,
        },
        focusPoint: [50, 50],
        ratio: (100 / 3) * 2,
    },
    components: {
        Hydrate,
        wwImage,
    },
    methods: {
        /* wwManager:start */
        async edit() {
            const update = await openPopup({
                isBackground: this.$attrs['ww-element-state'].isBackground,
                content: this.$attrs.content,
            });
            this.$emit('update', update);
        },
        /* wwManager:end */
    },
};
</script>
