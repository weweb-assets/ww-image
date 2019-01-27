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
        <div class="format" :style="_styles.format">
            <div class="border" :style="_styles.border"></div>
            <div class="container">
                <div class="hover">
                    <!-- Image goes here -->
                    <!-- Background -->
                    <div v-if="wwAttrs.wwCategory == 'background'" class="image bg" :alt="wwObject.alt" :class="{'loaded': imageLoaded}" :style="_styles.image"></div>
                    <!-- Image -->
                    <img v-if="wwAttrs.wwCategory != 'background'" class="image" :src="wwObject.content.data.url" :alt="wwObject.alt" :class="{'loaded': imageLoaded}" :style="_styles.image">
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
            el: null,

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
                    paddingBottom: '',
                    borderRadius: 0,
                    boxShadow: '',
                    filter: '',
                },
                border: {
                    borderRadius: 0,
                    borderWidth: 0,
                    borderColor: null,
                    borderStyle: null,
                    background: null,
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
        _styles() {
            if (!this.el) {
                return {}
            }

            this.wwObject.content.data.style = this.wwObject.content.data.style || {}

            //IMAGE
            this.styles.image.filter = this.wwObject.content.data.style.filter || null;
            this.styles.image.height = this.wwAttrs.wwCategory == 'background' ? '100%' : 'auto';
            this.styles.image.backgroundImage = this.wwAttrs.wwCategory == 'background' ? 'url(' + this.wwObject.content.data.url + ')' : '';


            //FORMAT
            this.styles.format.boxShadow = this.getShadow();

            if (this.wwAttrs.wwCategory != 'background') {
                const borderWidth = (this.wwObject.content.data.style.borderWidth ? this.wwObject.content.data.style.borderWidth : 0);
                this.styles.format.paddingBottom = this.getRatio() + '%'; //'calc(' + this.getRatio() + '% - ' + (borderWidth * 2) + 'px)';
            }
            else {
                this.styles.format.paddingBottom = 0;
            }


            //BORDER
            const w = this.$el.getBoundingClientRect().width;

            const borderRadius = w * (this.wwObject.content.data.style.borderRadius ? this.wwObject.content.data.style.borderRadius : 0) / 100;
            this.styles.border.borderRadius = borderRadius + 'px';
            this.styles.format.borderRadius = this.styles.border.borderRadius;

            const borderWidth = w * (this.wwObject.content.data.style.borderWidth ? this.wwObject.content.data.style.borderWidth : 0) / 100;
            this.styles.border.borderWidth = borderWidth + 'px';

            this.styles.border.borderColor = this.wwObject.content.data.style.borderColor || 'black';
            this.styles.border.borderStyle = this.wwObject.content.data.style.borderStyle || 'none';
            this.styles.border.background = this.wwObject.content.data.style.overlay || '';

            return this.styles;
        }
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

            //Add resize event
            window.addEventListener('resize', this.onResize);

            //this.applyRatio();

            wwLib.wwElementsStyle.applyAllStyles({
                wwObject: this.wwObject,
                lastWwObject: null,
                element: this.$el.querySelector('.format'),
                noClass: false,
                noAnim: this.wwAttrs.wwNoAnim,
            });

            this.loadImage();
        },
        loadImage() {
            this.imageLoaded = false;

            const self = this;

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
        getShadow() {
            const shadow = this.wwObject.content.data.style.boxShadow || {};
            if (shadow.x || shadow.y || shadow.b || shadow.s || shadow.c) {
                return shadow.x + 'px ' + shadow.y + 'px ' + shadow.b + 'px ' + shadow.s + 'px ' + shadow.c;
            }
            return '';
        },

        /*=============================================m_ÔÔ_m=============================================\
          APPLY
        \================================================================================================*/
        applyZoom: function (zoom) {

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

            this.wwObjectCtrl.update(this.wwObject);

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

            this.wwObjectCtrl.update(this.wwObject);

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

            wwLib.wwPopups.addStory('WWIMAGE_SELECT', {
                title: {
                    en_GB: 'Select image',
                    fr_FR: 'Choisir une image'
                },
                type: 'wwPopupSelectImage'
            },
            )

            let options = {
                firstPage: 'WWIMAGE_SELECT'
            }

            try {
                const result = await wwLib.wwPopups.open(options)
                this.wwObject.content.data.url = result.image;

                this.wwObject.content.data.zoom = -1;
                this.wwObject.content.data.position = { x: 0, y: 0 };

                this.wwObjectCtrl.update(this.wwObject);

                this.onResize();
                this.loadImage();
            } catch (error) {

            }

            wwLib.wwObjectHover.removeLock();
        },
        async edit() {
            wwLib.wwObjectHover.setLock(this);

            wwLib.wwPopups.addStory('WWIMAGE_EDIT', {
                title: {
                    en_GB: 'Edit Image',
                    fr_FR: 'Editer l\'image'
                },
                type: 'wwPopupList',
                buttons: null,
                storyData: {
                    list: {
                        EDIT_IMAGE_SELECT: {
                            separator: {
                                en_GB: 'Image',
                                fr_FR: 'Image'
                            },
                            title: {
                                en_GB: 'Select image',
                                fr_FR: 'Sélectionner une image'
                            },
                            desc: {
                                en_GB: 'Accepted formats (Max 5Mb) : .png, .jpg, .gif',
                                fr_FR: 'Formats acceptés (Max 5Mb) : .png, .jpg, .gif'
                            },
                            icon: 'wwi wwi-image',
                            shortcut: 'i',
                            next: 'WWIMAGE_SELECT'
                        },
                        EDIT_IMAGE_STYLE: {
                            separator: {
                                en_GB: 'Style',
                                fr_FR: 'Style'
                            },
                            title: {
                                en_GB: 'Change image style',
                                fr_FR: 'Changer l\'apparence de l\'image'
                            },
                            desc: {
                                en_GB: 'Borders, shadow, ...',
                                fr_FR: 'Bordures, ombres, ...'
                            },
                            icon: 'wwi wwi-edit-style',
                            shortcut: 's',
                            next: 'WWIMAGE_STYLE'
                        },
                        EDIT_IMAGE_RATIO: {
                            title: {
                                en_GB: 'Change image ratio',
                                fr_FR: 'Changer le ratio de l\'image'
                            },
                            desc: {
                                en_GB: 'Portrait, square, landscape, ...',
                                fr_FR: 'Portrait, carré, paysage, ...'
                            },
                            icon: 'wwi wwi-ratio',
                            shortcut: 'r',
                            next: 'WWIMAGE_RATIO'
                        },
                        EDIT_IMAGE_ANIM: {
                            separator: {
                                en_GB: 'Interaction',
                                fr_FR: 'Interaction'
                            },
                            title: {
                                en_GB: 'Animation',
                                fr_FR: 'Animation'
                            },
                            desc: {
                                en_GB: 'Change animation',
                                fr_FR: 'Choisir l\'animation à l\'apparition de l\'image'
                            },
                            icon: 'wwi wwi-anim',
                            shortcut: 'a',
                            next: 'ANIMATION'
                        },
                        /*
                            EDIT_IMAGE_HOVER: {
                                title: {
                                    en_GB: 'Hover effect',
                                    fr_FR: 'Effet au survol'
                                },
                                desc: {
                                    en_GB: 'Choose animation when cursor is above the image',
                                    fr_FR: 'Choisir l\'animation lors du survol de la souris'
                                },
                                icon: 'wwi wwi-hover',
                                shortcut: 'o',
                                next: 'IMAGE_HOVER'
                            },
                        */
                        EDIT_IMAGE_HIDE: {
                            separator: {
                                en_GB: 'More',
                                fr_FR: 'Plus'
                            },
                            title: {
                                en_GB: 'Show / Hide',
                                fr_FR: 'Montrer / Cacher'
                            },
                            icon: 'wwi wwi-hidden',
                            shortcut: 'h',
                            next: null,
                            result: {
                                hidden: true
                            }
                        },
                        EDIT_IMAGE_CHANGE: {
                            title: {
                                en_GB: 'Change object type',
                                fr_FR: 'Changer le type d\'objet'
                            },
                            icon: 'wwi wwi-switch',
                            shortcut: 't',
                            next: 'SELECT_WWOBJECT'
                        },
                    }
                }
            })
            wwLib.wwPopups.addStory('WWIMAGE_SELECT', {
                title: {
                    en_GB: 'Select image',
                    fr_FR: 'Choisir une image'
                },
                type: 'wwPopupSelectImage',
                next: 'WWIMAGE_RATIO'
            })
            wwLib.wwPopups.addStory('WWIMAGE_RATIO', {
                title: {
                    en_GB: 'Image Ratio',
                    fr_FR: 'Ratio de l\'image'
                },
                type: 'wwPopupImageRatio',
                buttons: {
                    NEXT: {
                        text: {
                            en_GB: 'Next',
                            fr_FR: 'Suivant'
                        },
                        next: 'WWIMAGE_STYLE'
                    }
                }
            })
            wwLib.wwPopups.addStory('WWIMAGE_STYLE', {
                title: {
                    en_GB: 'Image style',
                    fr_FR: 'Style de l\'image'
                },
                type: 'wwPopupImageStyle',
                buttons: {
                    OK: {
                        text: {
                            en_GB: 'Ok',
                            fr_FR: 'Valider'
                        },
                        next: false
                    }
                }
            })

            let options = {
                firstPage: 'WWIMAGE_EDIT',
                data: {
                    wwObject: this.wwObject
                }
            }

            try {
                const result = await wwLib.wwPopups.open(options);

                /*=============================================m_ÔÔ_m=============================================\
                  IMAGE
                \================================================================================================*/
                if (typeof (result.image) != 'undefined') {
                    this.wwObject.content.data.url = result.image;
                }

                /*=============================================m_ÔÔ_m=============================================\
                  STYLE
                \================================================================================================*/
                if (typeof (result.borderColor) != 'undefined') {
                    this.wwObject.content.data.style.borderColor = result.borderColor;
                }
                if (typeof (result.borderRadius) != 'undefined') {
                    this.wwObject.content.data.style.borderRadius = result.borderRadius;
                }
                if (typeof (result.borderStyle) != 'undefined') {
                    this.wwObject.content.data.style.borderStyle = result.borderStyle;
                }
                if (typeof (result.borderWidth) != 'undefined') {
                    this.wwObject.content.data.style.borderWidth = result.borderWidth;
                }
                if (typeof (result.boxShadow) != 'undefined') {
                    this.wwObject.content.data.style.boxShadow = result.boxShadow;
                }
                if (typeof (result.filter) != 'undefined') {
                    this.wwObject.content.data.style.filter = result.filter;
                }
                if (typeof (result.overlay) != 'undefined') {
                    this.wwObject.content.data.style.overlay = result.overlay;
                }
                if (typeof (result.ratio) != 'undefined') {
                    this.wwObject.ratio = result.ratio;
                }


                this.wwObjectCtrl.update(this.wwObject);

                this.wwObjectCtrl.globalEdit(result);

                this.onResize();
                this.loadImage();

            } catch (error) {
                console.log(error);
            }

            wwLib.wwObjectHover.removeLock();
        }

        /* wwManager:end */
    },
    mounted: function () {
        this.init();

        this.el = this.$el;

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

        .border {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 1;
            pointer-events: none;
        }

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
    z-index: 5;
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