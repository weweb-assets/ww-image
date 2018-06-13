<template>
	<div class="ww-img-directive">
		{{ wwObject.content.data.imgSize }}
		<div class="ww-img-format">
			<div class="ww-img-container">
				<div class="ww-img-hover">
					<!-- Image goes here -->
				</div>
			</div>
		</div>
	</div>
</template>
 

<script>
export default {
	name: "ww-image",
	props: {
		wwObject: Object,
		wwCategory: String
	},
	data() {
		return {};
	},
	methods: {},
	computed: {},
	mounted: function () {

		console.log(this.wwObject.content.data.url)

		const self = this;

		var wwHiddenLoadImg = new Image();
		wwHiddenLoadImg.onload = function () {

			console.log("ONLOAD")

			self.wwObject.content.data.imgSize.w = wwHiddenLoadImg.width;
			self.wwObject.content.data.imgSize.h = wwHiddenLoadImg.height;

			/*
			wwApplyZoom(scope.wwObject.content.data.zoom);
			wwApplyPosition(scope.wwObject.content.data.position);

			wwImgElements.wwImg.addClass("ww-img-loaded");

			scope.$apply();
			*/
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
</style>
