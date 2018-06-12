<template>
  <div v-wwo>
    I AM WWOBJECT : {{wwObject.content.data.text}}
  </div>
</template>


<script>
export default {
  name: "ww-text",
  props: {
    wwObject: Object
  },
  data() {
    return {};
  },
  methods: {},
  computed: {},
  mounted: function() {}
};
</script>
