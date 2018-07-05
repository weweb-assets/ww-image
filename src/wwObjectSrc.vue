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
		wwObject: {
			type: Object,
			default: {}
		},
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

		var wwHiddenLoadImg = new Image();
		wwHiddenLoadImg.onload = function () {

			console.log("ONLOAD")

			self.wwObject.content.data.imgSize.w = wwHiddenLoadImg.width;
			self.wwObject.content.data.imgSize.h = wwHiddenLoadImg.height;

			self.wwApplyZoom(self.wwObject.content.data.zoom);
			self.wwApplyPosition(self.wwObject.content.data.position);
			self.wwApplyRatio();

			wwLib.wwElementsStyle.applyAllStyles({
				wwObject: self.wwObject,
				lastWwObject: null,
				element: self.wwImgElements.wwImgFormat,
				noClass: false,
				noAnim: self.wwAttrs.wwNoAnim,
			});

			self.wwImgElements.wwImg.classList.add("ww-img-loaded");
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
