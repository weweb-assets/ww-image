<template>
    <Hydrate ssr-only class="ww-image">
        <wwObjectImage class="ww-image" v-bind="$attrs" v-on="$listeners"></wwObjectImage>
    </Hydrate>
</template>

<script>
import Hydrate from "lazy-hydration";
import wwObjectImage from "./wwObjectImage.vue";

export default {
    name: "__COMPONENT_NAME__",
    inheritAttrs: false,
    wwDefaultContent: {
        url: "https://cdn.weweb.app/public/images/no_image_selected.png",
        alt: "",
        position: {
            x: 0,
            y: 0,
        },
        zoom: 1,
        style: {},
        focusPoint: [50, 50],
        ratio: (100 / 3) * 2,
    },
    components: {
        Hydrate,
        wwObjectImage,
    },
};
</script>
