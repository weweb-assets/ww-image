<template>
  <div class="ww-img-directive">
    <div class="ww-img-format">
      <div class="ww-img-container">
        <div class="ww-img-hover">
          <!-- Image goes here -->
          <!-- Background -->
          <div v-if="wwAttrs.wwCategory == 'background'" class="ww-img ww-img-bg ww-img-need-load" v-bind:style="{ backgroundImage:  'url(' + wwObject.content.data.url + ')'}" v-bind:alt="wwObject.alt"></div>
          <!-- Image -->
          <img v-if="wwAttrs.wwCategory != 'background'" class="ww-img ww-img-need-load" v-bind:src="wwObject.content.data.url" v-bind:alt="wwObject.alt" />
        </div>
      </div>
    </div>
  </div>
</template>
 

<script>
export default {
  name: "ww-image",
  props: {
    wwObjectRef: Object,
    wwAttrs: {
      type: Object,
      default: {}
    }
  },
  data() {
    return {
      wwImgElements: {},
      wwControlsElements: {}
    };
  },
  computed: {
    wwObject() {
      //return this.wwObjectRef.wwGet();
      return this.$store.state.wwObjects[this.wwObjectRef.uniqueId];
    },
  },
  watch: {
  },
  beforeDestroy: function () {
    console.log("DESTROY")
    window.removeEventListener('resize', this.wwOnResize)
  },
  methods: {
    wwOnResize: function () {
      this.wwApplyZoom(this.wwObject.content.data.zoom);
      this.wwApplyPosition(this.wwObject.content.data.position);
    },
    wwGetScale: function () {
      var classes = this.wwImgElements.wwImgDirective.classList;

      var hasScale = false;

      for (let i = 0; i < classes.length; i++) {
        if (classes[i].indexOf("ww-anim-") === 0) {
          hasScale = true;
        }
      }

      if (!hasScale) {
        return 1;
      }

      var matrixRegex = /matrix\((-?\d*\.?\d+),\s*0,\s*0,\s*(-?\d*\.?\d+),\s*0,\s*0\)/;

      var matrix = this.wwImgElements.wwImgDirective.style.transform;

      var matches = matrix.match(matrixRegex);

      if (!matches || matches.length < 1 || !matches[1]) {
        return 1;
      }

      return matches[1];
    },
    wwGetRatio: function () {
      //If ratio is fixed in ww-object directive, override it here
      if (this.wwAttrs.wwFixedRatio) {
        try {
          var ratio = parseFloat(this.wwAttrs.wwFixedRatio);
          if (ratio) {
            return ratio;
          }
        }
        catch (error) {
          console.log("wwRatio error", error);
        }
      }

      if (!this.wwObject.ratio || this.wwObject.ratio < 0) {
        if (this.wwAttrs.wwDefaultRatio) {
          return this.wwAttrs.wwDefaultRatio;
        }
        else {
          return 100 / 3 * 2;
        }
      }

      return this.wwObject.ratio;
    },
    wwApplyZoom: function (wwZoom) {


      if (this.wwAttrs.wwCategory == "background") {
        wwZoom = -1;
      }

      //Chercher class ww-anim
      //Chercher transform scale
      //Recupérer valeur scale
      //Diviser par scale pour la vraie valeur
      var scale = this.wwGetScale();

      var icon = "expand";
      var toReturn = null;
      var containerSize;
      var imgSize;
      var newSize;

      if (wwZoom === -1) {

        if (!this.wwObject.content.data || !this.wwObject.content.data.imgSize) {
          return;
        }

        containerSize = {
          w: this.wwImgElements.wwImgDirective.offsetWidth,
          h: this.wwImgElements.wwImgDirective.offsetHeight
        };

        imgSize = {
          w: this.wwObject.content.data.imgSize.w,
          h: this.wwObject.content.data.imgSize.h
        };

        newSize = {
          w: containerSize.w,
          h: containerSize.w * imgSize.h / imgSize.w
        };

        if (newSize.h < containerSize.h) {
          newSize = {
            w: containerSize.h * imgSize.w / imgSize.h,
            h: containerSize.h
          };
        }

        if (newSize.w == containerSize.w) {
          this.wwImgElements.wwImg.style.width = "100%";
          this.wwImgElements.wwImg.style.height = "";
        }
        else {
          this.wwImgElements.wwImg.style.width = "";
          this.wwImgElements.wwImg.style.height = "100%";
        }

        this.wwImgElements.wwImg.style.minWidth = "100%";
        this.wwImgElements.wwImg.style.minHeight = "100%";

      } else if (wwZoom === "switch") {

        containerSize = {
          w: this.wwImgElements.wwImgDirective.offsetWidth,
          h: this.wwImgElements.wwImgDirective.offsetHeight
        };

        imgSize = {
          w: this.wwImgElements.wwImg.offsetWidth,
          h: this.wwImgElements.wwImg.offsetHeight
        };

        newSize = {
          w: containerSize.w,
          h: containerSize.w * imgSize.h / imgSize.w
        };

        if (containerSize.w === imgSize.w) {
          newSize = {
            w: containerSize.h * imgSize.w / imgSize.h,
            h: containerSize.h
          };
        } else {
          icon = "compress";
        }

        this.wwImgElements.wwImg.style.width = newSize.w + "px";
        this.wwImgElements.wwImg.style.height = "";

        this.wwImgElements.wwImg.style.minWidth = "";
        this.wwImgElements.wwImg.style.minHeight = "";

        toReturn = newSize.w / containerSize.w;


        if (this.wwControlsElements.wwResetButtonDesktop && this.wwControlsElements.wwResetButtonMobile) {
          this.wwControlsElements.wwResetButtonDesktop.empty();
          this.wwControlsElements.wwResetButtonDesktop.append("<i class='fa fa-" + icon + "' aria-hidden='true'></i>");
          this.wwControlsElements.wwResetButtonMobile.empty();
          this.wwControlsElements.wwResetButtonMobile.append("<i class='fa fa-" + icon + "' aria-hidden='true'></i>");
        }
      } else {


        containerSize = {
          w: this.wwImgElements.wwImgDirective.offsetWidth,
          h: this.wwImgElements.wwImgDirective.offsetHeight
        };

        this.wwImgElements.wwImg.style.width = (containerSize.w * wwZoom) + "px";
        this.wwImgElements.wwImg.style.height = "";

        this.wwImgElements.wwImg.style.minWidth = "";
        this.wwImgElements.wwImg.style.minHeight = "";
      }


      return toReturn;
    },
    wwApplyPosition: function (position) {
      if (this.wwAttrs.wwCategory == "background" && this.wwImgElements) {
        this.wwImgElements.wwImg.style.left = "50%";
        this.wwImgElements.wwImg.style.top = "50%";
      }
      else if (position && this.wwImgElements) {
        this.wwImgElements.wwImg.style.left = (position.x + 50) + "%";
        this.wwImgElements.wwImg.style.top = (position.y + 50) + "%";
      }
    },
    wwApplyRatio: function (ratio) {
      if (this.wwAttrs.wwCategory != "background") {
        var _ratio = ratio || this.wwGetRatio();

        this.wwImgElements.wwImgFormat.style.paddingBottom = _ratio + "%";
      }
    }
  },
  mounted: function () {
    const self = this;

    //Get all needed elements
    this.wwImgElements = {};
    this.wwImgElements.wwImgDirective = this.$el;
    this.wwImgElements.wwImgFormat = this.wwImgElements.wwImgDirective.querySelector('.ww-img-format');
    this.wwImgElements.wwImgContainer = this.wwImgElements.wwImgFormat.querySelector('.ww-img-container');
    this.wwImgElements.wwImgHover = this.wwImgElements.wwImgContainer.querySelector('.ww-img-hover');
    this.wwImgElements.wwImg = this.wwImgElements.wwImgHover.querySelector('.ww-img');


    if (this.wwAttrs.wwCategory == 'background') {
      this.wwImgElements.wwImgDirective.style.height = "100%";
    }
    else {
      this.wwImgElements.wwImgDirective.style.height = "auto";
    }

    //Add resize event
    window.addEventListener('resize', this.wwOnResize);

    this.wwApplyRatio();

    wwLib.wwElementsStyle.applyAllStyles({
      wwObject: self.wwObject,
      lastWwObject: null,
      element: self.wwImgElements.wwImgFormat,
      noClass: false,
      noAnim: self.wwAttrs.wwNoAnim,
    });

    var wwHiddenLoadImg = new Image();
    wwHiddenLoadImg.onload = function () {

      self.wwObject.content.data.imgSize.w = wwHiddenLoadImg.width;
      self.wwObject.content.data.imgSize.h = wwHiddenLoadImg.height;

      self.wwImgElements.wwImg.classList.add("ww-img-loaded");

      self.wwApplyZoom(self.wwObject.content.data.zoom);
      self.wwApplyPosition(self.wwObject.content.data.position);

      self.$emit('ww-loaded', self);
    };
    wwHiddenLoadImg.src = this.wwObject.content.data.url;

  }
};
</script>


<style scoped>
.ww-img-directive {
  /*overflow: hidden;*/
  /*z-index: -1;*/
  position: relative;
  /*background-color: blue;*/
  -webkit-touch-callout: none;
  /* iOS Safari */
  -webkit-user-select: none;
  /* Safari */
  -khtml-user-select: none;
  /* Konqueror HTML */
  -moz-user-select: none;
  /* Firefox */
  -ms-user-select: none;
  /* Internet Explorer/Edge */
  user-select: none;
  /* Non-prefixed version, currently supported by Chrome and Opera */
}

.ww-img-loaded {
  opacity: 1 !important;
}

.ww-img-need-load {
  -webkit-transition: opacity 0.3s ease;
  -moz-transition: opacity 0.3s ease;
  transition: opacity 0.3s ease;
  opacity: 0;
}

.ww-img-format {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.ww-img-hover {
  width: 100%;
  height: 100%;
  position: relative;
}

.ww-img-container {
  /*z-index: -1;*/
  position: absolute;
  top: 50%;
  left: 50%;
  -webkit-transform: translate(-50%, -50%);
  -moz-transform: translate(-50%, -50%);
  -ms-transform: translate(-50%, -50%);
  -o-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
  overflow: hidden;
  /* +2px to avoid white borders */
  width: calc(100% + 2px);
  height: calc(100% + 2px);
  -webkit-transition: background-color 0.1s ease;
  -moz-transition: background-color 0.1s ease;
  transition: background-color 0.1s ease;
  /*border-radius: 100%;*/
}

.ww-img {
  position: absolute;
  -webkit-transform: translate(-50%, -50%);
  -moz-transform: translate(-50%, -50%);
  -ms-transform: translate(-50%, -50%);
  -o-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
}

.ww-img.ww-img-bg {
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
}
</style>

<!-- ww-class-img-filter -->
<style scoped>
.ww-class-img-filter {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.ww-class-img-filter-uni-small {
  opacity: 0.1;
  background-color: #000000;
}

.ww-class-img-filter-uni-medium {
  opacity: 0.2;
  background-color: #000000;
}

.ww-class-img-filter-uni-big {
  opacity: 0.3;
  background-color: #000000;
}

.ww-class-img-filter-gradient-bottom-small {
  background: -moz-linear-gradient(
    270deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(0, 0, 0, 0.1) 100%
  );
  /* ff3.6+ */
  background: -webkit-gradient(
    linear,
    left top,
    left bottom,
    color-stop(0%, rgba(255, 255, 255, 0)),
    color-stop(100%, rgba(0, 0, 0, 0.1))
  );
  /* safari4+,chrome */
  background: -webkit-linear-gradient(
    270deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(0, 0, 0, 0.1) 100%
  );
  /* safari5.1+,chrome10+ */
  background: -o-linear-gradient(
    270deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(0, 0, 0, 0.1) 100%
  );
  /* opera 11.10+ */
  background: -ms-linear-gradient(
    270deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(0, 0, 0, 0.1) 100%
  );
  /* ie10+ */
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(0, 0, 0, 0.1) 100%
  );
  /* w3c */
  filter: progid: DXImageTransform.Microsoft.gradient( startColorstr='#FFFFFF', endColorstr='#000000', GradientType=0);
  /* ie6-9 */
}

.ww-class-img-filter-gradient-bottom-medium {
  background: -moz-linear-gradient(
    270deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(0, 0, 0, 0.2) 100%
  );
  /* ff3.6+ */
  background: -webkit-gradient(
    linear,
    left top,
    left bottom,
    color-stop(0%, rgba(255, 255, 255, 0)),
    color-stop(100%, rgba(0, 0, 0, 0.2))
  );
  /* safari4+,chrome */
  background: -webkit-linear-gradient(
    270deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(0, 0, 0, 0.2) 100%
  );
  /* safari5.1+,chrome10+ */
  background: -o-linear-gradient(
    270deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(0, 0, 0, 0.2) 100%
  );
  /* opera 11.10+ */
  background: -ms-linear-gradient(
    270deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(0, 0, 0, 0.2) 100%
  );
  /* ie10+ */
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(0, 0, 0, 0.2) 100%
  );
  /* w3c */
  filter: progid: DXImageTransform.Microsoft.gradient( startColorstr='#FFFFFF', endColorstr='#000000', GradientType=0);
  /* ie6-9 */
}

.ww-class-img-filter-gradient-bottom-big {
  background: -moz-linear-gradient(
    270deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(0, 0, 0, 0.4) 100%
  );
  /* ff3.6+ */
  background: -webkit-gradient(
    linear,
    left top,
    left bottom,
    color-stop(0%, rgba(255, 255, 255, 0)),
    color-stop(100%, rgba(0, 0, 0, 0.4))
  );
  /* safari4+,chrome */
  background: -webkit-linear-gradient(
    270deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(0, 0, 0, 0.4) 100%
  );
  /* safari5.1+,chrome10+ */
  background: -o-linear-gradient(
    270deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(0, 0, 0, 0.4) 100%
  );
  /* opera 11.10+ */
  background: -ms-linear-gradient(
    270deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(0, 0, 0, 0.4) 100%
  );
  /* ie10+ */
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(0, 0, 0, 0.4) 100%
  );
  /* w3c */
  filter: progid: DXImageTransform.Microsoft.gradient( startColorstr='#FFFFFF', endColorstr='#000000', GradientType=0);
  /* ie6-9 */
}

.ww-class-img-filter-gradient-top-small {
  background: -moz-linear-gradient(
    270deg,
    rgba(0, 0, 0, 0.1) 0%,
    rgba(252, 252, 252, 0) 99%,
    rgba(255, 255, 255, 0) 100%
  );
  /* ff3.6+ */
  background: -webkit-gradient(
    linear,
    left top,
    left bottom,
    color-stop(0%, rgba(0, 0, 0, 0.1)),
    color-stop(99%, rgba(252, 252, 252, 0)),
    color-stop(100%, rgba(255, 255, 255, 0))
  );
  /* safari4+,chrome */
  background: -webkit-linear-gradient(
    270deg,
    rgba(0, 0, 0, 0.1) 0%,
    rgba(252, 252, 252, 0) 99%,
    rgba(255, 255, 255, 0) 100%
  );
  /* safari5.1+,chrome10+ */
  background: -o-linear-gradient(
    270deg,
    rgba(0, 0, 0, 0.1) 0%,
    rgba(252, 252, 252, 0) 99%,
    rgba(255, 255, 255, 0) 100%
  );
  /* opera 11.10+ */
  background: -ms-linear-gradient(
    270deg,
    rgba(0, 0, 0, 0.1) 0%,
    rgba(252, 252, 252, 0) 99%,
    rgba(255, 255, 255, 0) 100%
  );
  /* ie10+ */
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.1) 0%,
    rgba(252, 252, 252, 0) 99%,
    rgba(255, 255, 255, 0) 100%
  );
  /* w3c */
  filter: progid: DXImageTransform.Microsoft.gradient( startColorstr='#000000', endColorstr='#FFFFFF', GradientType=0);
  /* ie6-9 */
}

.ww-class-img-filter-gradient-top-medium {
  background: -moz-linear-gradient(
    270deg,
    rgba(0, 0, 0, 0.2) 0%,
    rgba(252, 252, 252, 0) 99%,
    rgba(255, 255, 255, 0) 100%
  );
  /* ff3.6+ */
  background: -webkit-gradient(
    linear,
    left top,
    left bottom,
    color-stop(0%, rgba(0, 0, 0, 0.2)),
    color-stop(99%, rgba(252, 252, 252, 0)),
    color-stop(100%, rgba(255, 255, 255, 0))
  );
  /* safari4+,chrome */
  background: -webkit-linear-gradient(
    270deg,
    rgba(0, 0, 0, 0.2) 0%,
    rgba(252, 252, 252, 0) 99%,
    rgba(255, 255, 255, 0) 100%
  );
  /* safari5.1+,chrome10+ */
  background: -o-linear-gradient(
    270deg,
    rgba(0, 0, 0, 0.2) 0%,
    rgba(252, 252, 252, 0) 99%,
    rgba(255, 255, 255, 0) 100%
  );
  /* opera 11.10+ */
  background: -ms-linear-gradient(
    270deg,
    rgba(0, 0, 0, 0.2) 0%,
    rgba(252, 252, 252, 0) 99%,
    rgba(255, 255, 255, 0) 100%
  );
  /* ie10+ */
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.2) 0%,
    rgba(252, 252, 252, 0) 99%,
    rgba(255, 255, 255, 0) 100%
  );
  /* w3c */
  filter: progid: DXImageTransform.Microsoft.gradient( startColorstr='#000000', endColorstr='#FFFFFF', GradientType=0);
  /* ie6-9 */
}

.ww-class-img-filter-gradient-top-big {
  background: -moz-linear-gradient(
    270deg,
    rgba(0, 0, 0, 0.4) 0%,
    rgba(252, 252, 252, 0) 99%,
    rgba(255, 255, 255, 0) 100%
  );
  /* ff3.6+ */
  background: -webkit-gradient(
    linear,
    left top,
    left bottom,
    color-stop(0%, rgba(0, 0, 0, 0.4)),
    color-stop(99%, rgba(252, 252, 252, 0)),
    color-stop(100%, rgba(255, 255, 255, 0))
  );
  /* safari4+,chrome */
  background: -webkit-linear-gradient(
    270deg,
    rgba(0, 0, 0, 0.4) 0%,
    rgba(252, 252, 252, 0) 99%,
    rgba(255, 255, 255, 0) 100%
  );
  /* safari5.1+,chrome10+ */
  background: -o-linear-gradient(
    270deg,
    rgba(0, 0, 0, 0.4) 0%,
    rgba(252, 252, 252, 0) 99%,
    rgba(255, 255, 255, 0) 100%
  );
  /* opera 11.10+ */
  background: -ms-linear-gradient(
    270deg,
    rgba(0, 0, 0, 0.4) 0%,
    rgba(252, 252, 252, 0) 99%,
    rgba(255, 255, 255, 0) 100%
  );
  /* ie10+ */
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.4) 0%,
    rgba(252, 252, 252, 0) 99%,
    rgba(255, 255, 255, 0) 100%
  );
  /* w3c */
  filter: progid: DXImageTransform.Microsoft.gradient( startColorstr='#000000', endColorstr='#FFFFFF', GradientType=0);
  /* ie6-9 */
}

.ww-class-img-filter-gradient-middle-small {
  background: -moz-linear-gradient(
    270deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(0, 0, 0, 0.1) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  /* ff3.6+ */
  background: -webkit-gradient(
    linear,
    left top,
    left bottom,
    color-stop(0%, rgba(255, 255, 255, 0)),
    color-stop(50%, rgba(0, 0, 0, 0.1)),
    color-stop(100%, rgba(255, 255, 255, 0))
  );
  /* safari4+,chrome */
  background: -webkit-linear-gradient(
    270deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(0, 0, 0, 0.1) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  /* safari5.1+,chrome10+ */
  background: -o-linear-gradient(
    270deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(0, 0, 0, 0.1) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  /* opera 11.10+ */
  background: -ms-linear-gradient(
    270deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(0, 0, 0, 0.1) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  /* ie10+ */
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(0, 0, 0, 0.1) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  /* w3c */
  filter: progid: DXImageTransform.Microsoft.gradient( startColorstr='#FFFFFF', endColorstr='#FFFFFF', GradientType=0);
  /* ie6-9 */
}

.ww-class-img-filter-gradient-middle-medium {
  background: -moz-linear-gradient(
    270deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(0, 0, 0, 0.2) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  /* ff3.6+ */
  background: -webkit-gradient(
    linear,
    left top,
    left bottom,
    color-stop(0%, rgba(255, 255, 255, 0)),
    color-stop(50%, rgba(0, 0, 0, 0.2)),
    color-stop(100%, rgba(255, 255, 255, 0))
  );
  /* safari4+,chrome */
  background: -webkit-linear-gradient(
    270deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(0, 0, 0, 0.2) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  /* safari5.1+,chrome10+ */
  background: -o-linear-gradient(
    270deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(0, 0, 0, 0.2) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  /* opera 11.10+ */
  background: -ms-linear-gradient(
    270deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(0, 0, 0, 0.2) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  /* ie10+ */
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(0, 0, 0, 0.2) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  /* w3c */
  filter: progid: DXImageTransform.Microsoft.gradient( startColorstr='#FFFFFF', endColorstr='#FFFFFF', GradientType=0);
  /* ie6-9 */
}

.ww-class-img-filter-gradient-middle-big {
  background: -moz-linear-gradient(
    270deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(0, 0, 0, 0.4) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  /* ff3.6+ */
  background: -webkit-gradient(
    linear,
    left top,
    left bottom,
    color-stop(0%, rgba(255, 255, 255, 0)),
    color-stop(50%, rgba(0, 0, 0, 0.4)),
    color-stop(100%, rgba(255, 255, 255, 0))
  );
  /* safari4+,chrome */
  background: -webkit-linear-gradient(
    270deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(0, 0, 0, 0.4) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  /* safari5.1+,chrome10+ */
  background: -o-linear-gradient(
    270deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(0, 0, 0, 0.4) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  /* opera 11.10+ */
  background: -ms-linear-gradient(
    270deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(0, 0, 0, 0.4) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  /* ie10+ */
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(0, 0, 0, 0.4) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  /* w3c */
  filter: progid: DXImageTransform.Microsoft.gradient( startColorstr='#FFFFFF', endColorstr='#FFFFFF', GradientType=0);
  /* ie6-9 */
}

.ww-class-img-filter-custom {
  background-color: #ff000030;
}
</style>

<!-- ww-class-img-format -->
<style scoped>
.ww-class-img-format-round-small {
  border-radius: 7px;
  overflow: hidden;
  /* WTF ?? Sometimes doesn't work without this */
  perspective: 1px;
}

.ww-class-img-format-round-big {
  border-radius: 20px;
  overflow: hidden;
  /* WTF ?? Sometimes doesn't work without this */
  perspective: 1px;
}

.ww-class-img-format-round {
  border-radius: 100%;
  overflow: hidden;
  /* WTF ?? Sometimes doesn't work without this */
  perspective: 1px;
}
</style>

<!-- ww-class-img-effect -->
<style scoped>
.ww-class-img-effect-grayscale {
  -webkit-filter: grayscale(1);
  filter: grayscale(1);
}

.ww-class-img-effect-sepia {
  -webkit-filter: sepia(1);
  filter: sepia(1);
}

.ww-class-img-effect-invert {
  -webkit-filter: invert(1);
  filter: invert(1);
}

.ww-class-img-effect-blur-small {
  -webkit-filter: blur(1px);
  filter: blur(1px);
}

.ww-class-img-effect-blur-medium {
  -webkit-filter: blur(3px);
  filter: blur(3px);
}

.ww-class-img-effect-blur-big {
  -webkit-filter: blur(5px);
  filter: blur(5px);
}
</style>

<!-- ww-class-img-border -->
<style scoped>
.ww-class-img-border-xsmall {
  border-style: solid !important;
  border-width: 1px !important;
}

.ww-class-img-border-small {
  border-style: solid !important;
  border-width: 2px !important;
}

.ww-class-img-border-medium {
  border-style: solid !important;
  border-width: 5px !important;
}

.ww-class-img-border-big {
  border: 5px solid;
  border-style: solid !important;
  border-width: 10px !important;
}

.ww-class-img-border-xbig {
  border: 5px solid;
  border-style: solid !important;
  border-width: 15px !important;
}

.ww-class-img-border-xxbig {
  border: 5px solid;
  border-style: solid !important;
  border-width: 20px !important;
}
</style>

<!-- ww-class-img-shadow -->
<style scoped>
.ww-class-img-shadow-box-small {
  -webkit-box-shadow: 0px 0px 5px 0px rgba(50, 50, 50, 0.75);
  -moz-box-shadow: 0px 0px 5px 0px rgba(50, 50, 50, 0.75);
  box-shadow: 0px 0px 5px 0px rgba(50, 50, 50, 0.75);
}

.ww-class-img-shadow-box-medium {
  -webkit-box-shadow: 0px 0px 10px 0px rgba(50, 50, 50, 0.75);
  -moz-box-shadow: 0px 0px 10px 0px rgba(50, 50, 50, 0.75);
  box-shadow: 0px 0px 10px 0px rgba(50, 50, 50, 0.75);
}

.ww-class-img-shadow-box-big {
  -webkit-box-shadow: 0px 0px 20px 0px rgba(50, 50, 50, 0.75);
  -moz-box-shadow: 0px 0px 20px 0px rgba(50, 50, 50, 0.75);
  box-shadow: 0px 0px 20px 0px rgba(50, 50, 50, 0.75);
}

.ww-class-img-shadow-bottom-small {
  -webkit-box-shadow: 0px 2px 5px 0px rgba(50, 50, 50, 0.75);
  -moz-box-shadow: 0px 2px 5px 0px rgba(50, 50, 50, 0.75);
  box-shadow: 0px 2px 5px 0px rgba(50, 50, 50, 0.75);
}

.ww-class-img-shadow-bottom-medium {
  -webkit-box-shadow: 0px 3px 10px 0px rgba(50, 50, 50, 0.75);
  -moz-box-shadow: 0px 3px 10px 0px rgba(50, 50, 50, 0.75);
  box-shadow: 0px 3px 10px 0px rgba(50, 50, 50, 0.75);
}

.ww-class-img-shadow-bottom-big {
  -webkit-box-shadow: 0px 7px 20px 0px rgba(50, 50, 50, 0.75);
  -moz-box-shadow: 0px 7px 20px 0px rgba(50, 50, 50, 0.75);
  box-shadow: 0px 7px 20px 0px rgba(50, 50, 50, 0.75);
}
</style>

<!-- ww-class-img-effect -->
<style scoped>
.ww-class-img-effect-grayscale {
  -webkit-filter: grayscale(1);
  filter: grayscale(1);
}

.ww-class-img-effect-sepia {
  -webkit-filter: sepia(1);
  filter: sepia(1);
}

.ww-class-img-effect-invert {
  -webkit-filter: invert(1);
  filter: invert(1);
}

.ww-class-img-effect-blur-small {
  -webkit-filter: blur(1px);
  filter: blur(1px);
}

.ww-class-img-effect-blur-medium {
  -webkit-filter: blur(3px);
  filter: blur(3px);
}

.ww-class-img-effect-blur-big {
  -webkit-filter: blur(5px);
  filter: blur(5px);
}
</style>