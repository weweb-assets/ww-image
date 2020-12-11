<template>
    <!-- <Hydrate ssr-only class="ww-image"> -->
    <wwImage class="ww-image" v-bind="$attrs" v-on="$listeners" />
    <!-- </Hydrate> -->
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
        alt: '',
        url: wwLib.responsive('https://cdn.weweb.app/public/images/no_image_selected.png'),
        x: wwLib.responsive(0),
        y: wwLib.responsive(0),
        zoom: wwLib.responsive(100),
        style: {},
        focusPoint: wwLib.responsive([50, 50]),
    },
    components: {
        Hydrate,
        wwImage,
    },
    methods: {
        /* wwManager:start */
        resetZoomAndPosition() {
            this.$emit('update', {
                zoom: 1,
                x: 0,
                y: 0,
            });
        },
        async edit() {
            const update = await openPopup({
                isBackground: this.$attrs['ww-element-state'].isBackground,
                content: this.$attrs.content,
            });
            if (update) {
                this.$emit('update', update);
            }
        },
        /* wwManager:end */
    },
};
</script>
