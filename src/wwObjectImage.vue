<template>
    <div class="ww-image" :class="{'bg': wwAttrs.wwCategory == 'background'}">
        <div class="wrapper" :style="_styles.wrapper">
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
                        <!-- wwManager:start -->
                        <!-- Background -->
                        <div v-if="wwAttrs.wwCategory == 'background'" class="image bg" :style="_styles.image"></div>
                        <!-- Image -->
                        <img v-if="wwAttrs.wwCategory != 'background'" class="image" :src="wwObject.content.data.url" :alt="wwObject.alt" :style="_styles.image">
                        <!-- wwManager:end -->
                        <!-- wwFront:start -->
                        <!-- Background -->
                        <div v-if="wwAttrs.wwCategory == 'background'" class="image bg twic" :data-background="'url(' + wwObject.content.data.url + ')'" :style="_styles.image"></div>
                        <!-- Image -->
                        <img v-if="wwAttrs.wwCategory != 'background'" class="image twic" src="https://i.twic.pics/v1/placeholder:1x1:transparent" :data-src="wwObject.content.data.url" :data-src-transform="twicTransform" :alt="wwObject.alt" :style="_styles.image">
                        <!-- wwFront:end -->
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
 

<script>
export default {
    name: "__COMPONENT_NAME__",
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
            imageLoaded: true,
            zoomMin: 0.2,
            zoomFactor: 1,
            el: null,

            /*=============================================m_ÔÔ_m=============================================\
              STYLES
            \================================================================================================*/
            styles: {
                image: {
                    backgroundImage: '',
                    width: '100%',
                    height: '100%',
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
                },
                wrapper: {
                    width: null
                }
            },

            /* wwManager:start */
            lastMovePosition: { x: 0, y: 0 },
            lastTouchDist: 0,
            zoomBarElement: null,
            lockControls: false,
            moveDirection: null,
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

            const w = this.$el.getBoundingClientRect().width;

            this.wwObject.content.data.style = this.wwObject.content.data.style || {}

            //IMAGE
            this.styles.image.filter = this.wwObject.content.data.style.filter || null;

            /* wwManager:start */
            this.styles.image.backgroundImage = this.wwAttrs.wwCategory == 'background' ? 'url(' + this.wwObject.content.data.url + ')' : '';
            this.styles.image.height = this.wwAttrs.wwCategory == 'background' ? '100%' : 'auto';
            this.styles.image.width = (this.wwObject.content.data.zoom > 0 ? this.wwObject.content.data.zoom : 1) * 100 + '%';
            if (this.wwAttrs.wwCategory != 'background') {
                this.styles.image['-webkit-transform'] = 'translate(' + (this.wwObject.content.data.position.x - 50) + '%, ' + (this.wwObject.content.data.position.y - 50) + '%)';
                this.styles.image['-moz-transform'] = 'translate(' + (this.wwObject.content.data.position.x - 50) + '%, ' + (this.wwObject.content.data.position.y - 50) + '%)';
                this.styles.image['-ms-transform'] = 'translate(' + (this.wwObject.content.data.position.x - 50) + '%, ' + (this.wwObject.content.data.position.y - 50) + '%)';
                this.styles.image['-o-transform'] = 'translate(' + (this.wwObject.content.data.position.x - 50) + '%, ' + (this.wwObject.content.data.position.y - 50) + '%)';
                this.styles.image.transform = 'translate(' + (this.wwObject.content.data.position.x - 50) + '%, ' + (this.wwObject.content.data.position.y - 50) + '%)';
            }
            /* wwManager:end */

            /* wwFront:start */
            if (this.wwAttrs.wwCategory != 'background') {
                this.styles.image.left = this.wwObject.content.data.pos.left;
                this.styles.image.top = this.wwObject.content.data.pos.top;
                this.styles.image.width = this.wwObject.content.data.pos.width;
                this.styles.image.height = this.wwObject.content.data.pos.height;
            }
            /* wwFront:end */



            //FORMAT
            this.styles.format.boxShadow = this.getShadow();

            if (this.wwAttrs.wwCategory != 'background') {
                this.styles.format.paddingBottom = this.getRatio() + '%';
            }
            else {
                this.styles.format.paddingBottom = 0;
            }


            //BORDER
            const borderRadius = w * (this.wwObject.content.data.style.borderRadius ? this.wwObject.content.data.style.borderRadius : 0) / 100;
            this.styles.border.borderRadius = borderRadius + 'px';
            this.styles.format.borderRadius = this.styles.border.borderRadius;

            const borderWidth = w * (this.wwObject.content.data.style.borderWidth ? this.wwObject.content.data.style.borderWidth : 0) / 100;
            this.styles.border.borderWidth = borderWidth + 'px';

            this.styles.border.borderColor = this.wwObject.content.data.style.borderColor || 'black';
            this.styles.border.borderStyle = this.wwObject.content.data.style.borderStyle || 'none';
            this.styles.border.background = this.wwObject.content.data.style.overlay || '';

            //WRAPPER
            if (this.wwObject.content.data.style.maxHeight) {
                this.styles.wrapper.width = (parseInt(this.wwObject.content.data.style.maxHeight) / this.getRatio() * 100) + 'px';
            } else {
                this.styles.wrapper.width = null;
            }


            return this.styles;
        },
        twicTransform() {
            return 'crop=' + this.wwObject.content.data.crop + '/auto';
        },
        loaderSrc() {
            return this.wwObject.content.data.dataUrl;
        },
        /* wwManager:start */
        zoomPercentY() {
            return 100 - this.zoomFactor * Math.sqrt(Math.max(this.wwObject.content.data.zoom, 0) - this.zoomMin);
        },
        editing() {
            return this.wwObjectCtrl.getSectionCtrl().getEditMode() == 'CONTENT';
        }
        /* wwManager:end */
    },
    watch: {
        /* wwManager:start */
        editing() {
            //Preload canvas to avoid waiting on save !
            if (this.editing) {
                this.resizeImage({
                    image: this.wwObject.content.data.url,
                    maxSize: 20,
                    ratio: this.getRatio(),
                    zoom: this.wwObject.content.data.zoom,
                    x: this.wwObject.content.data.position.x,
                    y: this.wwObject.content.data.position.y
                })
            }
        }
        /* wwManager:end */
    },
    beforeDestroy: function () {
        this.$el.querySelector('.container').removeEventListener('mousedown', this.startMove);
        this.$el.querySelector('.container').removeEventListener('touchstart', this.startMove);
    },
    methods: {
        init() {
            this.zoomFactor = Math.sqrt(100 * 100 / (10 - this.zoomMin));
            this.loadImage();
        },
        loadImage() {
            /*
            this.imageLoaded = false;

            const self = this;

            var wwHiddenLoadImg = new Image();
            wwHiddenLoadImg.onload = function () {
                self.imageLoaded = true;
                self.$emit('ww-loaded', self);
            };
            wwHiddenLoadImg.src = this.wwObject.content.data.url;
            */
        },
        preventEvent(event) {

            if (!this.isTouch(event)) {
                event.preventDefault();
                event.stopPropagation();
            }

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

        /* wwManager:start */
        /*=============================================m_ÔÔ_m=============================================\
          IMAGE ZOOM
        \================================================================================================*/
        resetZoom(event) {
            //Reset position
            this.wwObject.content.data.position = { x: 0, y: 0 };

            //Reset zoom
            const imgSize = {
                w: this.$el.querySelector('.image').getBoundingClientRect().width,
                h: this.$el.querySelector('.image').getBoundingClientRect().height,
            }

            const ratio = imgSize.h / imgSize.w;

            if (this.wwObject.content.data.zoom !== 1) {
                this.wwObject.content.data.zoom = 1;
            }
            else {
                const rationContainer = this.$el.querySelector('.container').getBoundingClientRect().height / this.$el.querySelector('.container').getBoundingClientRect().width;

                this.wwObject.content.data.zoom = rationContainer / ratio;
            }


            this.wwObjectCtrl.update(this.wwObject);

            return false;
        },

        startZoomDesktop(event) {
            this.lockControls = true;

            wwLib.wwObjectHover.setLock(this);

            this.zoomBarElement = this.$el.querySelector('.zoom-bar');

            window.addEventListener("mousemove", this.zoomDesktop);
            window.addEventListener("mouseup", this.stopZoomDesktop);

            window.document.body.classList.add('ww-image-dragging');

            return false;
        },
        zoomDesktop(event) {

            let zoomPositionY = (event.clientY - this.zoomBarElement.getBoundingClientRect().top) * 100 / this.zoomBarElement.getBoundingClientRect().height;
            zoomPositionY = Math.min(Math.max(zoomPositionY, 0), 100);


            this.wwObject.content.data.zoom = Math.pow((100 - zoomPositionY) / this.zoomFactor, 2) + this.zoomMin;

            this.preventEvent(event);

            this.wwObjectCtrl.update(this.wwObject);

            return false;
        },
        stopZoomDesktop(event) {
            this.lockControls = false;

            wwLib.wwObjectHover.removeLock();

            window.removeEventListener("mousemove", this.zoomDesktop);
            window.removeEventListener("mouseup", this.stopZoomDesktop);

            this.wwObjectCtrl.update(this.wwObject);

            window.document.body.classList.remove('ww-image-dragging');

            return false;
        },

        /*=============================================m_ÔÔ_m=============================================\
          IMAGE MOVE
        \================================================================================================*/
        getEventPosition(event) {
            var position = { x: 0, y: 0 };

            if (this.isTouch(event)) {

                position.x = 0;
                position.y = 0;

                for (let touch of event.touches) {
                    position.x += touch.clientX
                    position.y += touch.clientY
                }

                position.x = position.x / event.touches.length;
                position.y = position.y / event.touches.length;

            } else {
                position.x = event.clientX;
                position.y = event.clientY;
            }

            return position;
        },
        getTouchDist(event) {
            if (event.touches && event.touches.length >= 2) {
                var touch0 = {
                    x: event.touches[0].clientX,
                    y: event.touches[0].clientY
                };

                var touch1 = {
                    x: event.touches[1].clientX,
                    y: event.touches[1].clientY
                };

                var dist = Math.sqrt((touch0.x - touch1.x) * (touch0.x - touch1.x) + (touch0.y - touch1.y) * (touch0.y - touch1.y));
                return dist;
            }
            return 0;
        },
        isTouch(event) {
            return event.touches && event.touches.length;
        },

        startMove(event) {

            if (this.wwObjectCtrl.getSectionCtrl().getEditMode() != 'CONTENT' || this.wwAttrs.wwCategory == 'background') {
                return;
            }

            if (event.ctrlKey || event.button == 2) {
                return;
            }

            this.lastMovePosition = this.getEventPosition(event);
            if (this.lastMovePosition) {

                wwLib.getFrontDocument().addEventListener("mousemove", this.move);
                wwLib.getManagerDocument().addEventListener("mousemove", this.move);
                wwLib.getFrontDocument().addEventListener("mouseup", this.stopMove);
                wwLib.getManagerDocument().addEventListener("mouseup", this.stopMove);

                wwLib.getFrontDocument().addEventListener("touchmove", this.move);
                wwLib.getManagerDocument().addEventListener("touchmove", this.move);
                wwLib.getFrontDocument().addEventListener("touchend", this.stopMove);
                wwLib.getManagerDocument().addEventListener("touchend", this.stopMove);


                document.body.classList.add('ww-image-dragging');

                return false;
            }

        },
        move(event) {
            if (wwLib.wwObjectMenu.list.length) {
                this.stopMove(event);
                return;
            }

            let position = this.getEventPosition(event);

            if (!position) {
                return;
            }

            var offsetXpx = position.x - this.lastMovePosition.x;
            var offsetYpx = position.y - this.lastMovePosition.y;

            if (this.moveDirection == 'x') {
                offsetYpx = 0;
            }
            else if (this.moveDirection == 'y') {
                offsetXpx = 0;
            }
            else if (wwLib.wwShortcuts.hasModifiers('SHIFT') && Math.abs(offsetXpx) > Math.abs(offsetYpx)) {
                offsetYpx = 0;
                this.moveDirection = 'x';
            }
            else if (wwLib.wwShortcuts.hasModifiers('SHIFT')) {
                offsetXpx = 0;
                this.moveDirection = 'y';
            }

            var offsetXpercent = offsetXpx * 100 / this.$el.querySelector('.container').getBoundingClientRect().width;
            var offsetYpercent = offsetYpx * 100 / this.$el.querySelector('.container').getBoundingClientRect().height;

            this.wwObject.content.data.position.x += offsetXpercent / this.wwObject.content.data.zoom;
            this.wwObject.content.data.position.y += offsetYpercent / this.wwObject.content.data.zoom * this.$el.querySelector('.image').getBoundingClientRect().width * this.$el.querySelector('.container').getBoundingClientRect().height / (this.$el.querySelector('.image').getBoundingClientRect().height * this.$el.querySelector('.container').getBoundingClientRect().width);

            if (this.isTouch(event)) {
                const touchDist = this.getTouchDist(event);

                this.wwObject.content.data.zoom += (touchDist - this.lastTouchDist) / 100 * (this.wwObject.content.data.zoom === 0 ? 1 : this.wwObject.content.data.zoom);

                if (this.wwObject.content.data.zoom < this.zoomMin) {
                    this.wwObject.content.data.zoom = this.zoomMin;
                }
                if (this.wwObject.content.data.zoom > 10) {
                    this.wwObject.content.data.zoom = 10;
                }

                this.lastTouchDist = touchDist;
            }

            this.lastMovePosition.x = position.x;
            this.lastMovePosition.y = position.y;

            this.preventEvent(event);

            this.wwObjectCtrl.update(this.wwObject);

        },
        stopMove(event) {
            this.lockControls = false;

            // wwLib.wwObjectHover.removeLock();

            wwLib.getFrontDocument().removeEventListener("mousemove", this.move);
            wwLib.getManagerDocument().removeEventListener("mousemove", this.move);
            wwLib.getFrontDocument().removeEventListener("mouseup", this.stopMove);
            wwLib.getManagerDocument().removeEventListener("mouseup", this.stopMove);

            wwLib.getFrontDocument().removeEventListener("touchmove", this.move);
            wwLib.getManagerDocument().removeEventListener("touchmove", this.move);
            wwLib.getFrontDocument().removeEventListener("touchend", this.stopMove);
            wwLib.getManagerDocument().removeEventListener("touchend", this.stopMove);

            this.moveDirection = null;

            this.wwObjectCtrl.update(this.wwObject);

            window.document.body.classList.remove('ww-image-dragging');

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

                this.wwObject.content.data.zoom = 1;
                this.wwObject.content.data.position = { x: 0, y: 0 };

                this.wwObjectCtrl.update(this.wwObject);

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
                type: 'wwPopupEditWwObject',
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
                        EDIT_IMAGE_LINK: {
                            separator: {
                                en_GB: 'Link',
                                fr_FR: 'Lien'
                            },
                            title: {
                                en_GB: 'Change image link',
                                fr_FR: 'Changer le lien de l\'image'
                            },
                            desc: {
                                en_GB: 'External, internal, ...',
                                fr_FR: 'Externe, interne, ...'
                            },
                            icon: 'wwi wwi-link-external',
                            shortcut: 's',
                            next: 'WWIMAGE_LINKS'
                        }
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
            wwLib.wwPopups.addStory('WWIMAGE_LINKS', {
                title: {
                    en_GB: 'Link',
                    fr_FR: 'Lien'
                },
                type: 'wwPopupLinks',
                storyData: {
                    links: [
                        'EXTERNAL',
                        'INTERNAL',
                        'SECTION',
                        'POPUP',
                        'DOWNLOAD',
                        'ZOOM',
                        'TOGGLE_NAVBAR',
                        'NO_LINK'
                    ]
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

                    this.resizeImage({
                        image: this.wwObject.content.data.url,
                        maxSize: 20,
                        ratio: this.getRatio(),
                        zoom: this.wwObject.content.data.zoom,
                        x: this.wwObject.content.data.position.x,
                        y: this.wwObject.content.data.position.y
                    })
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
                if (typeof (result.maxHeight) != 'undefined') {
                    this.wwObject.content.data.style.maxHeight = result.maxHeight;
                }


                this.wwObjectCtrl.update(this.wwObject);

                this.wwObjectCtrl.globalEdit(result);

                this.loadImage();

            } catch (error) {
                console.log(error);
            }

            wwLib.wwObjectHover.removeLock();
        },
        resizeImage(options) {

            if (!options.image || !options.maxSize) {
                return null;
            }

            options.zoom = options.zoom || 0;
            options.x = options.x || 0;
            options.y = options.y || 0;

            return new Promise(function (resolve, reject) {

                const canvas = document.createElement('canvas');
                const context = canvas.getContext("2d");
                const img = document.createElement('img');

                let canvasInfo = {
                    width: 0,
                    height: 0,
                    ratio: 0
                }

                img.onload = function () {

                    try {

                        canvasInfo.width = this.width;
                        canvasInfo.height = this.height;
                        canvasInfo.ratio = options.ratio / 100 || this.width / this.height;

                        if (canvasInfo.width > options.maxSize) {
                            canvasInfo.height = options.maxSize / canvasInfo.ratio;
                            canvasInfo.width = options.maxSize;
                        }
                        if (canvasInfo.height > options.maxSize) {
                            canvasInfo.width = canvasInfo.ratio * options.maxSize;
                            canvasInfo.height = options.maxSize;
                        }
                        canvas.width = canvasInfo.width;
                        canvas.height = canvasInfo.height;

                        context.save();

                        context.translate(canvas.width / 2, canvas.height / 2);

                        const imgSize = {
                            w: options.zoom * canvas.width,
                            h: (options.zoom * canvas.width) * this.height / this.width
                        }

                        const origin = {
                            x: (options.x - 50) / 100 * imgSize.w,
                            y: (options.y - 50) / 100 * imgSize.h
                        }

                        context.drawImage(img, origin.x, origin.y, imgSize.w, imgSize.h);

                        context.restore();
                        return resolve(canvas.toDataURL("image/bmp"));
                    } catch (error) {
                        console.log('ww-image preview error', error)
                        return resolve(null);
                    }
                }

                img.onerror = function () {
                    return resolve(null);
                }

                img.setAttribute('crossOrigin', 'anonymous');

                img.src = options.image
            });


        },
        async beforeSave() {

            if (this.wwAttrs.wwCategory != 'background') {
                const rectCtn = this.$el.getBoundingClientRect();
                const rectImg = this.$el.querySelector('.image').getBoundingClientRect();

                const z = Math.abs(this.wwObject.content.data.zoom);
                const px = this.wwObject.content.data.position.x;
                const py = this.wwObject.content.data.position.y;

                const r = rectCtn.height / rectCtn.width;
                const R = this.wwObject.content.data.imgSize.h / this.wwObject.content.data.imgSize.w;

                const zh = rectImg.height / rectCtn.height;

                //SIZE
                const x = Math.max(Math.min(0.5 - z * (1 / 2 - px / 100), 100), 0);
                const y = Math.max(Math.min(0.5 - zh * (1 / 2 - py / 100), 100), 0);

                const w = Math.max(Math.min(1, z, 1 - x), 0);
                const h = Math.max(Math.min(1, zh, 1 - y), 0);

                //CROP
                const cx = Math.max(Math.min((0.5 * (1 - 1 / z) * 100) - px, 100), 0);
                const cy = Math.max(Math.min((0.5 * (1 - 1 / zh) * 100) - py, 100), 0);

                const cw = Math.max(Math.min(100 / z, 100 - cx, w * rectCtn.width * 100 / rectImg.width), 0);
                const ch = Math.max(Math.min(100 / zh, 100 - cy, h * rectCtn.height * 100 / rectImg.height), 0);

                this.wwObject.content.data.crop = cw + 'px' + ch + 'p@' + cx + 'px' + cy + 'p';
                this.wwObject.content.data.pos = {
                    left: (x * 100) + '%',
                    top: (y * 100) + '%',
                    width: (w * 100) + '%',
                    height: (h * 100) + '%'
                }

                if (this.wwObject.uniqueId == 14826165634) {
                    console.log(this.wwObject.content.data.pos);
                }

                if (this.wwObject.uniqueId == 10007599688) {
                    console.log(this.wwObject.content.data.pos);
                }

                if (this.wwObject.uniqueId == 14752210978) {
                    console.log(this.wwObject.content.data.pos);
                }

                if (this.wwObject.uniqueId == 6016626787) {
                    console.log(this.wwObject.content.data.pos);
                }

                await this.wwObjectCtrl.update(this.wwObject);
            }



            // const dataUrl = await this.resizeImage({
            //     image: this.wwObject.content.data.url,
            //     maxSize: 20,
            //     ratio: this.getRatio(),
            //     zoom: this.wwObject.content.data.zoom,
            //     x: this.wwObject.content.data.position.x,
            //     y: this.wwObject.content.data.position.y
            // })

            // this.wwObject.content.data.dataUrl = dataUrl;

            // await this.wwObjectCtrl.update(this.wwObject);
        }

        /* wwManager:end */
    },
    mounted() {
        this.init();

        this.el = this.$el;

        /* wwManager:start */
        this.$el.querySelector('.container').addEventListener('touchstart', this.startMove);
        this.$el.querySelector('.container').addEventListener('mousedown', this.startMove);
        /* wwManager:end */
    },
    created() {
        this.wwObject.content.data.url = this.wwObject.content.data.url.replace('wewebapp.s3.eu-west-3.amazonaws.com', 'cdn.weweb.app');
    }
};
</script>


<style scoped lang="scss">
.ww-image {
    position: relative;
    user-select: none;
    display: flex;
    justify-content: center;

    .wrapper {
        width: 100%;

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
                        transition: opacity 0.3s ease;
                        /*opacity: 0;*/

                        /* wwFront:start */
                        width: 100%;
                        height: 100%;
                        /* wwFront:end */

                        /* wwManager:start */
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        /* wwManager:end */

                        &.bg {
                            /* wwFront:start */
                            top: 50%;
                            left: 50%;
                            transform: translate(-50%, -50%);
                            /* wwFront:end */

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