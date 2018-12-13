<template>
    <div class="ww-image" :class="{'bg': wwAttrs.wwCategory == 'background'}">
        <!-- wwManager:start -->
        <div class="controls-desktop" :class="{'lock': lockControls}">
            <div class="zoom-bar">
                <div class="zoom-line"></div>
                <div class="zoom-handle" :style="{'top' : zoomPercentY + '%'}" @mousedown="startZoomDesktop($event)">
                    <div></div>
                </div>
            </div>
        </div>
        <div class="reset-zoom" @click="resetZoom($event)">
            <i class="fa fa-expand" aria-hidden="true"></i>
        </div>
        <!-- wwManager:end -->
        <div class="format" :style="styles.format">
            <div class="container">
                <div class="hover">
                    <!-- Image goes here -->
                    <!-- Background -->
                    <div v-if="wwAttrs.wwCategory == 'background'" class="image bg" :alt="wwObject.alt" :class="{'loaded': imageLoaded}" :style="styles.image"></div>
                    <!-- Image -->
                    <img v-if="wwAttrs.wwCategory != 'background'" class="image" :src="wwObject.content.data.url" :alt="wwObject.alt" :class="{'loaded': imageLoaded}" :style="styles.image">
                </div>
            </div>
        </div>
    </div>
</template>
 

<script>
export default {
    name: "ww-image",
    props: {
        wwObjectCtrl: Object,
        wwAttrs: {
            type: Object,
            default: {}
        }
    },
    data() {
        return {
            wwControlsElements: {},
            imageLoaded: false,
            zoomMin: 0.2,
            zoomFactor: 1,

            /*=============================================m_ÔÔ_m=============================================\
              STYLES
            \================================================================================================*/
            styles: {
                image: {
                    backgroundImage: '',
                    width: 'auto',
                    height: 'auto',
                    minWidth: 'none',
                    minHeight: 'none',
                    top: '50%',
                    left: '50%',
                },
                format: {
                    paddingBottom: ''
                }
            },

            /* wwManager:start */
            zoomPercentY: 50,
            lastMovePosition: { x: 0, y: 0 },
            lastTouchDist: 0,
            zoomBarElement: null,
            lockControls: false,
            /* wwManager:end */
        };
    },
    computed: {
        wwObject() {
            return this.wwObjectCtrl.get();
        },
        /* wwManager:start */

        /* wwManager:end */
    },
    watch: {
        wwObject() {
            this.onResize();
        }
    },
    beforeDestroy: function () {
        this.$el.querySelector('.container').removeEventListener('mousedown', this.startMove);
        window.removeEventListener('resize', this.onResize)
    },
    methods: {
        init() {

            this.zoomFactor = Math.sqrt(100 * 100 / (10 - this.zoomMin));

            const self = this;

            //Get all needed elements
            this.styles.image.height = this.wwAttrs.wwCategory == 'background' ? '100%' : 'auto';
            this.styles.image.backgroundImage = this.wwAttrs.wwCategory == 'background' ? 'url(' + this.wwObject.content.data.url + ')' : '';

            //Add resize event
            window.addEventListener('resize', this.onResize);

            this.applyRatio();

            wwLib.wwElementsStyle.applyAllStyles({
                wwObject: this.wwObject,
                lastWwObject: null,
                element: this.$el.querySelector('.format'),
                noClass: false,
                noAnim: this.wwAttrs.wwNoAnim,
            });

            this.imageLoaded = false;

            var wwHiddenLoadImg = new Image();
            wwHiddenLoadImg.onload = function () {

                self.wwObject.content.data.imgSize.w = wwHiddenLoadImg.width;
                self.wwObject.content.data.imgSize.h = wwHiddenLoadImg.height;

                self.imageLoaded = true;

                self.applyZoom(self.wwObject.content.data.zoom);
                self.applyPosition(self.wwObject.content.data.position);

                self.$emit('ww-loaded', self);
            };
            wwHiddenLoadImg.src = this.wwObject.content.data.url;
        },
        onResize: function () {
            this.applyZoom(this.wwObject.content.data.zoom);
            this.applyPosition(this.wwObject.content.data.position);
        },
        preventClick(event) {
            event.preventDefault();
            event.stopPropagation();

            return false;
        },

        /*=============================================m_ÔÔ_m=============================================\
          GET PARAMS
        \================================================================================================*/
        getScale: function () {
            var classes = this.$el.classList;

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

            var matrix = this.$el.style.transform;

            var matches = matrix.match(matrixRegex);

            if (!matches || matches.length < 1 || !matches[1]) {
                return 1;
            }

            return matches[1];
        },
        getRatio: function () {
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

        /*=============================================m_ÔÔ_m=============================================\
          APPLY
        \================================================================================================*/
        applyZoom: function (zoom) {

            //this.wwObject.content.data.zoom = (this.wwObject.content.data.zoom >= 0 ? this.wwObject.content.data.zoom : 1);


            if (this.wwAttrs.wwCategory == 'background') {
                zoom = -1;
            }

            //Chercher class ww-anim
            //Chercher transform scale
            //Recupérer valeur scale
            //Diviser par scale pour la vraie valeur
            var scale = this.getScale();

            var icon = 'expand';
            var toReturn = null;
            var containerSize;
            var imgSize;
            var newSize;

            if (zoom === -1) {

                if (!this.wwObject.content.data || !this.wwObject.content.data.imgSize) {
                    return;
                }

                containerSize = {
                    w: this.$el.offsetWidth,
                    h: this.$el.offsetHeight
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
                    this.styles.image.width = '100%';
                    this.styles.image.height = '';
                }
                else {
                    this.styles.image.width = '';
                    this.styles.image.height = '100%';
                }

                this.styles.image.minWidth = '100%';
                this.styles.image.minHeight = '100%';

            } else if (zoom === 'switch') {

                containerSize = {
                    w: this.$el.offsetWidth,
                    h: this.$el.offsetHeight
                };

                imgSize = {
                    w: this.$el.querySelector('.image').offsetWidth,
                    h: this.$el.querySelector('.image').offsetHeight
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
                    icon = 'compress';
                }

                this.styles.image.width = newSize.w + 'px';
                this.styles.image.height = '';

                this.styles.image.minWidth = 'unset';
                this.styles.image.minHeight = 'unset';

                toReturn = newSize.w / containerSize.w;

                this.zoomPercentY = 100 - this.zoomFactor * Math.sqrt(newSize.w / containerSize.w - this.zoomMin);

            } else {
                containerSize = {
                    w: this.$el.offsetWidth,
                    h: this.$el.offsetHeight
                };

                this.styles.image.width = (containerSize.w * zoom) + 'px';
                this.styles.image.height = '';

                this.styles.image.minWidth = 'unset';
                this.styles.image.minHeight = 'unset';

                this.zoomPercentY = 100 - this.zoomFactor * Math.sqrt(this.wwObject.content.data.zoom - this.zoomMin);

            }

            return toReturn;
        },
        applyPosition: function (position) {
            if (this.wwAttrs.wwCategory == 'background') {
                this.styles.image.left = '50%';
                this.styles.image.top = '50%';
            }
            else if (position) {
                this.styles.image.left = (position.x + 50) + '%';
                this.styles.image.top = (position.y + 50) + '%';
            }
        },
        applyRatio: function (ratio) {
            if (this.wwAttrs.wwCategory != 'background') {
                var _ratio = ratio || this.getRatio();

                this.styles.format.paddingBottom = _ratio + '%';
            }
        },

        /* wwManager:start */
        /*=============================================m_ÔÔ_m=============================================\
          IMAGE ZOOM
        \================================================================================================*/
        resetZoom(event) {
            //Reset position
            this.wwObject.content.data.position = { x: 0, y: 0 };
            this.applyPosition(this.wwObject.content.data.position);

            //Reset zoom
            this.wwObject.content.data.zoom = this.applyZoom("switch");

            this.wwObjectCtrl.update(this.wwObject);

            //Stop event propagation to prevent image click
            event.preventDefault();
            event.stopPropagation();

            return false;
        },

        startZoomDesktop(event) {
            this.lockControls = true;

            wwLib.wwObjectHover.setLock(this);

            this.zoomBarElement = this.$el.querySelector('.zoom-bar');

            window.addEventListener("mousemove", this.zoomDesktop);
            window.addEventListener("mouseup", this.stopZoomDesktop);

            document.addEventListener("click", this.preventClick, true);
            document.addEventListener("touch", this.preventClick, true);

            window.document.body.classList.add('ww-image-dragging');

            event.preventDefault();
            event.stopPropagation();

            return false;
        },
        zoomDesktop(event) {
            // wwImgElements.wwImgDirective.addClass("dragging");
            // wwImgElements.wwImgFormat.addClass("dragging");

            let zoomPositionY = (event.clientY - this.zoomBarElement.getBoundingClientRect().top) * 100 / this.zoomBarElement.getBoundingClientRect().height;
            zoomPositionY = Math.min(Math.max(zoomPositionY, 0), 100);

            //this.zoomPercentY = zoomPositionY;

            //this.wwObject.content.data.zoom = Math.exp((100 - zoomPositionY) * 7 / 100) / 100;
            this.wwObject.content.data.zoom = Math.pow((100 - zoomPositionY) / this.zoomFactor, 2) + this.zoomMin;

            this.applyZoom(this.wwObject.content.data.zoom);

            event.preventDefault();
            event.stopPropagation();

            return false;
        },
        stopZoomDesktop(event) {
            this.lockControls = false;

            wwLib.wwObjectHover.removeLock();

            window.removeEventListener("mousemove", this.zoomDesktop);
            window.removeEventListener("mouseup", this.stopZoomDesktop);

            //Remove click events with a small delay to be sure that click is ignored
            let self = this;
            setTimeout(function () {
                document.removeEventListener("click", self.preventClick, true);
                document.removeEventListener("touch", self.preventClick, true);
            }, 100);

            this.wwObjectCtrl.update(this.wwObject);

            window.document.body.classList.remove('ww-image-dragging');

            event.preventDefault();
            event.stopPropagation();

            return false;
        },

        /*=============================================m_ÔÔ_m=============================================\
          IMAGE MOVE
        \================================================================================================*/
        getEventPosition(event) {
            var position = { x: 0, y: 0 };

            if (this.isTouch(event)) {

                var touch0 = {
                    x: event.originalEvent.touches[0].clientX,
                    y: event.originalEvent.touches[0].clientY
                };

                var touch1 = {
                    x: event.originalEvent.touches[1].clientX,
                    y: event.originalEvent.touches[1].clientY
                };

                position.x = (touch0.x + touch1.x) / 2;
                position.y = (touch0.y + touch1.y) / 2;

            } else if (event.touches) {
                return null;
            } else {
                position.x = event.clientX;
                position.y = event.clientY;
            }

            return position;
        },
        getTouchDist(event) {
            var touch0 = {
                x: event.originalEvent.touches[0].clientX,
                y: event.originalEvent.touches[0].clientY
            };

            var touch1 = {
                x: event.originalEvent.touches[1].clientX,
                y: event.originalEvent.touches[1].clientY
            };

            var dist = Math.sqrt((touch0.x - touch1.x) * (touch0.x - touch1.x) + (touch0.y - touch1.y) * (touch0.y - touch1.y));
            return dist;
        },
        isTouch(event) {
            return event.touches && event.touches.length === 2;
        },

        startMove(event) {

            if (this.wwObjectCtrl.getSectionCtrl().getEditMode() != 'CONTENT' || this.wwAttrs.wwCategory == 'background') {
                return;
            }
            this.lastMovePosition = this.getEventPosition(event);
            if (this.lastMovePosition) {
                wwLib.wwObjectHover.setLock(this);

                window.addEventListener("mousemove", this.move);
                window.addEventListener("mouseup", this.stopMove);

                document.addEventListener("click", this.preventClick, true);
                document.addEventListener("touch", this.preventClick, true);

                window.document.body.classList.add('ww-image-dragging');

                event.preventDefault();
                event.stopPropagation();

                return false;
            }

        },
        move(event) {
            let position = this.getEventPosition(event);

            if (!position) {
                return;
            }

            var offsetXpx = position.x - this.lastMovePosition.x;
            var offsetYpx = position.y - this.lastMovePosition.y;

            var offsetXpercent = offsetXpx * 100 / this.$el.querySelector('.container').getBoundingClientRect().width;
            var offsetYpercent = offsetYpx * 100 / this.$el.querySelector('.container').getBoundingClientRect().height;

            this.wwObject.content.data.position.x += offsetXpercent;
            this.wwObject.content.data.position.y += offsetYpercent;

            this.applyPosition(this.wwObject.content.data.position);

            if (this.isTouch(event)) {
                const touchDist = this.getTouchDist(event);

                this.wwObject.content.data.zoom += (touchDist - this.lastTouchDist) / 100 * (this.wwObject.content.data.zoom === 0 ? 1 : this.wwObject.content.data.zoom);

                if (this.wwObject.content.data.zoom < this.zoomMin) {
                    this.wwObject.content.data.zoom = this.zoomMin;
                }
                if (this.wwObject.content.data.zoom > 10) {
                    this.wwObject.content.data.zoom = 10;
                }

                this.zoomPercentY = 100 - this.zoomFactor * Math.sqrt(this.wwObject.content.data.zoom - this.zoomMin);

                this.lastTouchDist = touchDist;
            }

            this.lastMovePosition.x = position.x;
            this.lastMovePosition.y = position.y;

            event.preventDefault();
            event.stopPropagation();

        },
        stopMove(event) {
            this.lockControls = false;

            wwLib.wwObjectHover.removeLock();

            window.removeEventListener("mousemove", this.move);
            window.removeEventListener("mouseup", this.stopMove);

            //Remove click events with a small delay to be sure that click is ignored
            let self = this;
            setTimeout(function () {
                document.removeEventListener("click", self.preventClick, true);
                document.removeEventListener("touch", self.preventClick, true);
            }, 100);

            this.wwObjectCtrl.update(this.wwObject);

            window.document.body.classList.remove('ww-image-dragging');

            event.preventDefault();
            event.stopPropagation();

            return false;
        },

        /*=============================================m_ÔÔ_m=============================================\
          CHANGE IMAGE
        \================================================================================================*/
        async changeImage() {
            wwLib.wwObjectHover.setLock(this);

            let options = {
                firstPage: 'SELECT_IMAGE',
                data: {

                }
            }

            const result = await wwLib.wwPopups.open(options)


            wwLib.wwObjectHover.removeLock();
        }

        /* wwManager:end */
    },
    mounted: function () {
        this.init();

        /* wwManager:start */
        this.$el.querySelector('.container').addEventListener('mousedown', this.startMove);
        /* wwManager:end */
    }
};
</script>


<style scoped lang="scss">
.ww-image {
    position: relative;
    user-select: none;

    .format {
        width: 100%;
        height: 100%;
        position: relative;
        overflow: hidden;

        .container {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            overflow: hidden;
            /* +2px to avoid white borders */
            width: calc(100% + 2px);
            height: calc(100% + 2px);
            transition: background-color 0.1s ease;

            .hover {
                width: 100%;
                height: 100%;
                position: relative;

                .image {
                    position: absolute;
                    transform: translate(-50%, -50%);
                    transition: opacity 0.3s ease;
                    opacity: 0;

                    &.bg {
                        background-repeat: no-repeat;
                        background-position: center;
                        background-size: cover;
                    }

                    &.loaded {
                        opacity: 1 !important;
                    }
                }
            }
        }
    }
}

/* wwManager:start */
.ww-editing .container {
    cursor: move;
    cursor: grab;
}

.bg {
    & .controls-desktop,
    & .controls-mobile {
        display: none;
    }
}

.controls-desktop {
    position: absolute;
    right: 4px;
    min-height: 20px;
    bottom: 5px;
    top: 5px;
    width: 20px;
    z-index: 1;
    opacity: 0;
    display: none;
    transition: opacity 0.15s ease;

    .zoom-bar {
        position: relative;
        width: 100%;
        height: 100%;

        .zoom-line {
            position: absolute;
            left: 50%;
            top: 0;
            bottom: 3px;
            background-color: white;
            width: 3px;
            border-radius: 50px;
            transform: translateX(-50%);
            box-shadow: 0px 0px 2px 0px rgba(0, 0, 0, 0.5);
        }

        .zoom-handle {
            position: absolute;
            left: 50%;
            transform: translate(-50%, -50%);
            top: 50%;
            background-color: #e73055;
            width: 20px;
            height: 20px;
            border-radius: 100%;
            cursor: move;
            cursor: grab;
            box-shadow: 0px 2px 2px 0px rgba(0, 0, 0, 0.5);
        }
    }
}

.reset-zoom {
    position: absolute;
    z-index: 1;
    left: 5px;
    bottom: 5px;
    width: 20px;
    height: 20px;
    background-color: white;
    line-height: 25px;
    font-size: 15px;
    text-align: center;
    cursor: pointer;
    color: #757575;
    box-shadow: 0px 1px 1px 0px rgba(0, 0, 0, 0.5);
    opacity: 0;
    display: none;
    transition: opacity 0.15s ease;
}

.ww-editing .controls-desktop,
.ww-editing .reset-zoom,
.controls-desktop.lock {
    display: block;
}

.ww-image:not(.bg):hover .controls-desktop,
.ww-image:not(.bg):hover .reset-zoom,
.controls-desktop.lock {
    opacity: 1;
}

/* wwManager:end */

@media (max-width: 768px) {
    .controls-desktop {
        display: none !important;
    }
}

@media (min-width: 769px) {
    .controls-mobile {
        display: none !important;
    }
    .container .ww-video-bg {
        display: block !important;
    }
}
</style>

<style >
.ww-image-dragging {
    cursor: move;
    cursor: grab;
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
    background: linear-gradient(
        180deg,
        rgba(255, 255, 255, 0) 0%,
        rgba(0, 0, 0, 0.1) 100%
    );
}

.ww-class-img-filter-gradient-bottom-medium {
    background: linear-gradient(
        180deg,
        rgba(255, 255, 255, 0) 0%,
        rgba(0, 0, 0, 0.2) 100%
    );
}

.ww-class-img-filter-gradient-bottom-big {
    background: linear-gradient(
        180deg,
        rgba(255, 255, 255, 0) 0%,
        rgba(0, 0, 0, 0.4) 100%
    );
}

.ww-class-img-filter-gradient-top-small {
    background: linear-gradient(
        180deg,
        rgba(0, 0, 0, 0.1) 0%,
        rgba(252, 252, 252, 0) 99%,
        rgba(255, 255, 255, 0) 100%
    );
}

.ww-class-img-filter-gradient-top-medium {
    background: linear-gradient(
        180deg,
        rgba(0, 0, 0, 0.2) 0%,
        rgba(252, 252, 252, 0) 99%,
        rgba(255, 255, 255, 0) 100%
    );
}

.ww-class-img-filter-gradient-top-big {
    background: linear-gradient(
        180deg,
        rgba(0, 0, 0, 0.4) 0%,
        rgba(252, 252, 252, 0) 99%,
        rgba(255, 255, 255, 0) 100%
    );
}

.ww-class-img-filter-gradient-middle-small {
    background: linear-gradient(
        180deg,
        rgba(255, 255, 255, 0) 0%,
        rgba(0, 0, 0, 0.1) 50%,
        rgba(255, 255, 255, 0) 100%
    );
}

.ww-class-img-filter-gradient-middle-medium {
    background: linear-gradient(
        180deg,
        rgba(255, 255, 255, 0) 0%,
        rgba(0, 0, 0, 0.2) 50%,
        rgba(255, 255, 255, 0) 100%
    );
}

.ww-class-img-filter-gradient-middle-big {
    background: linear-gradient(
        180deg,
        rgba(255, 255, 255, 0) 0%,
        rgba(0, 0, 0, 0.4) 50%,
        rgba(255, 255, 255, 0) 100%
    );
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
    filter: grayscale(1);
}

.ww-class-img-effect-sepia {
    filter: sepia(1);
}

.ww-class-img-effect-invert {
    filter: invert(1);
}

.ww-class-img-effect-blur-small {
    filter: blur(1px);
}

.ww-class-img-effect-blur-medium {
    filter: blur(3px);
}

.ww-class-img-effect-blur-big {
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
    box-shadow: 0px 0px 5px 0px rgba(50, 50, 50, 0.75);
}

.ww-class-img-shadow-box-medium {
    box-shadow: 0px 0px 10px 0px rgba(50, 50, 50, 0.75);
}

.ww-class-img-shadow-box-big {
    box-shadow: 0px 0px 20px 0px rgba(50, 50, 50, 0.75);
}

.ww-class-img-shadow-bottom-small {
    box-shadow: 0px 2px 5px 0px rgba(50, 50, 50, 0.75);
}

.ww-class-img-shadow-bottom-medium {
    box-shadow: 0px 3px 10px 0px rgba(50, 50, 50, 0.75);
}

.ww-class-img-shadow-bottom-big {
    box-shadow: 0px 7px 20px 0px rgba(50, 50, 50, 0.75);
}
</style>

<!-- ww-class-img-effect -->
<style scoped>
.ww-class-img-effect-grayscale {
    filter: grayscale(1);
}

.ww-class-img-effect-sepia {
    filter: sepia(1);
}

.ww-class-img-effect-invert {
    filter: invert(1);
}

.ww-class-img-effect-blur-small {
    filter: blur(1px);
}

.ww-class-img-effect-blur-medium {
    filter: blur(3px);
}

.ww-class-img-effect-blur-big {
    filter: blur(5px);
}
</style>