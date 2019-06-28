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
                <div class="container">
                    <!-- Background -->
                    <div class="hover" v-if="wwAttrs.wwCategory == 'background'">
                        <div v-if="!wwAttrs.wwNoTwicPics" class="image bg twic" :data-background="'url(' + wwObject.content.data.url + ')'" data-background-step="400" :data-background-focus="focusPoint" data-background-transform="auto/quality=85" :style="_styles.image"></div>
                        <div v-if="wwAttrs.wwNoTwicPics" class="image bg" :style="_styles.image"></div>
                    </div>

                    <!-- Image Manager -->
                    <div class="hover" v-if="wwAttrs.wwCategory != 'background'">
                        <!-- wwManager:start -->
                        <span class="img-manager" v-show="editing">
                            <img draggable="false" class="image" :src="wwObject.content.data.url" :alt="wwObject.content.data.alt" :style="_styles.image">
                        </span>
                        <!-- wwManager:end -->
                        <span class="img-front" v-show="!editing">
                            <img v-if="!wwAttrs.wwNoTwicPics" class="image twic" :src="placeholderSrc" :data-src="wwObject.content.data.url" :data-src-transform="twicTransform" data-src-step="10" :alt="wwObject.content.data.alt" :style="_styles.image">
                            <img v-if="wwAttrs.wwNoTwicPics" class="image" :src="wwObject.content.data.url" :alt="wwObject.content.data.alt" :style="_styles.image">
                        </span>
                    </div>
                </div>
            </div>
            <div class="border" :style="_styles.border"></div>
        </div>
    </div>
</template>
 

<script>
/* wwManager:start */
import wwImagePopupFocusPoint from './wwImagePopupFocusPoint.vue'
wwLib.wwPopups.addPopup('wwImagePopupFocusPoint', wwImagePopupFocusPoint);
/* wwManager:end */

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
                    minHeight: 'none',
                    top: '50%',
                    left: '50%',
                },
                format: {
                    paddingBottom: '',
                    borderRadius: 0,
                    boxShadow: '',
                    filter: '',
                    minWidth: '20',
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
            moving: false,
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

            if (this.editing || this.wwAttrs.wwNoTwicPics) {
                this.styles.image.backgroundImage = this.wwAttrs.wwCategory == 'background' ? 'url(' + this.wwObject.content.data.url + ')' : '';
                this.styles.image.height = this.wwAttrs.wwCategory == 'background' ? '100%' : 'auto';
                this.styles.image.width = (this.wwObject.content.data.zoom > 0 ? this.wwObject.content.data.zoom : 1) * 100 + '%';
                if (this.wwAttrs.wwCategory != 'background') {
                    let position = this.wwObject.content.data.position || { x: 0, y: 0 }
                    this.styles.image.left = '50%';
                    this.styles.image.top = '50%';
                    this.styles.image['-webkit-transform'] = 'translate(' + (position.x - 50) + '%, ' + (position.y - 50) + '%)';
                    this.styles.image['-moz-transform'] = 'translate(' + (position.x - 50) + '%, ' + (position.y - 50) + '%)';
                    this.styles.image['-ms-transform'] = 'translate(' + (position.x - 50) + '%, ' + (position.y - 50) + '%)';
                    this.styles.image['-o-transform'] = 'translate(' + (position.x - 50) + '%, ' + (position.y - 50) + '%)';
                    this.styles.image.transform = 'translate(' + (position.x - 50) + '%, ' + (position.y - 50) + '%)';
                }
            }
            else {
                if (this.wwAttrs.wwCategory != 'background') {
                    let defaultPosition = { left: '0px', top: '0px', width: '100%', height: '100%' };
                    let position = this.wwObject.content.data.pos;

                    this.styles.image.left = position.left || defaultPosition.left;
                    this.styles.image.top = position.top || defaultPosition.top;
                    this.styles.image.width = position.width && position.width != "0%" ? position.width : defaultPosition.width;
                    this.styles.image.height = position.height && position.height != "0%" ? position.height : defaultPosition.height;
                    this.styles.image['-webkit-transform'] = 'none';
                    this.styles.image['-moz-transform'] = 'none';
                    this.styles.image['-ms-transform'] = 'none';
                    this.styles.image['-o-transform'] = 'none';
                    this.styles.image.transform = 'none';

                }
            }



            //FORMAT
            this.styles.format.boxShadow = this.getShadow();
            this.styles.format.minWidth = this.wwObject.content.data.style.minWidth ? this.wwObject.content.data.style.minWidth + 'px' : '20px';

            if (this.wwAttrs.wwCategory != 'background') {
                this.styles.format.paddingBottom = this.getRatio() + '%';
            }
            else {
                this.styles.format.paddingBottom = 0;
            }


            //BORDER
            const unit = this.wwObject.content.data.style.borderRadiusUnit || '%';
            const borderRadius = (this.wwObject.content.data.style.borderRadius / (unit == '%' ? 2 : 1) || 0) + unit;
            this.styles.border.borderRadius = borderRadius;
            this.styles.format.borderRadius = borderRadius;

            this.styles.border.borderWidth = (this.wwObject.content.data.style.borderWidth || 0) + 'px';

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
            //TODO: Correct crop when it's 99 instead of 100.
            return this.wwObject.content.data.crop && this.wwObject.content.data.crop.indexOf('NaN') === -1 ? 'crop=' + this.wwObject.content.data.crop.replace(/99/gi, '100') + '/quality=85/auto' : '';
        },
        loaderSrc() {
            return this.wwObject.content.data.dataUrl;
        },
        placeholderSrc() {
            return 'https://i.twic.pics/v1/placeholder:1x1:transparent';
            //return 'https://i.twic.pics/v1/crop=' + this.wwObject.content.data.crop + '/resize=10/quality=10/' + this.wwObject.content.data.url
        },
        focusPoint() {
            let focusPoint = this.wwObject.content.data.focusPoint || [50, 50];
            return focusPoint[0] + 'px' + focusPoint[1] + 'p';
        },
        editing() {
            return this.wwObjectCtrl.getSectionCtrl().getEditMode() == 'CONTENT';
        },
        /* wwManager:start */
        zoomPercentY() {
            return 100 - this.zoomFactor * Math.sqrt(Math.max(this.wwObject.content.data.zoom, 0) - this.zoomMin);
        },
        /* wwManager:end */
    },
    watch: {
        editing() {
            if (this.editing) {
                this.checkRecalcTwicPics();
            }
        }
    },
    beforeDestroy() {
        this.$el.querySelector('.container').removeEventListener('mousedown', this.startMove);
        this.$el.querySelector('.container').removeEventListener('touchstart', this.startMove);
    },
    methods: {
        init() {
            this.zoomFactor = Math.sqrt(100 * 100 / (10 - this.zoomMin));
            this.loadImage();
        },
        loadImage() {
            /* wwManager:start */
            var wwHiddenLoadImg = new Image();
            wwHiddenLoadImg.onload = this.checkRecalcTwicPics;
            wwHiddenLoadImg.src = this.wwObject.content.data.url;
            /* wwManager:end */
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
        getScale() {
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
        getRatio() {
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
            this.preventEvent(event);

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

            this.calcTwicPics();
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

            wwLib.wwObjectMenu.preventOpen();

            return false;
        },
        zoomDesktop(event) {

            let zoomPositionY = (event.clientY - this.zoomBarElement.getBoundingClientRect().top) * 100 / this.zoomBarElement.getBoundingClientRect().height;
            zoomPositionY = Math.min(Math.max(zoomPositionY, 0), 100);


            this.wwObject.content.data.zoom = Math.pow((100 - zoomPositionY) / this.zoomFactor, 2) + this.zoomMin;

            this.preventEvent(event);

            this.calcTwicPics();
            this.wwObjectCtrl.update(this.wwObject);

            return false;
        },
        stopZoomDesktop(event) {
            this.lockControls = false;

            wwLib.wwObjectHover.removeLock();

            window.removeEventListener("mousemove", this.zoomDesktop);
            window.removeEventListener("mouseup", this.stopZoomDesktop);

            this.calcTwicPics();
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

            this.moving = false;

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

            if (!this.moving && Math.abs(offsetXpx) + Math.abs(offsetYpx) < 4) {
                return;
            }

            this.moving = true;

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

            this.calcTwicPics();
            this.wwObjectCtrl.update(this.wwObject);

        },
        stopMove(event) {

            if (this.moving) {
                wwLib.wwObjectMenu.preventOpen();
            }

            this.lockControls = false;

            this.moving = false;

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

            this.calcTwicPics();
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
                    en: 'Select image',
                    fr: 'Choisir une image'
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

                this.calcTwicPics();
                this.wwObjectCtrl.update(this.wwObject);

                this.loadImage();
            } catch (error) {

            }

            wwLib.wwObjectHover.removeLock();
        },
        async edit() {
            wwLib.wwObjectHover.setLock(this);

            let editOptionsList = {
                EDIT_IMAGE_SELECT: {
                    separator: {
                        en: 'Image',
                        fr: 'Image'
                    },
                    title: {
                        en: 'Select image',
                        fr: 'Sélectionner une image'
                    },
                    desc: {
                        en: 'Accepted formats (Max 5Mb) : .png, .jpg, .gif',
                        fr: 'Formats acceptés (Max 5Mb) : .png, .jpg, .gif'
                    },
                    icon: 'wwi wwi-image',
                    shortcut: 'i',
                    next: 'WWIMAGE_SELECT'
                }
            }

            if (this.wwAttrs.wwCategory == 'background') {
                editOptionsList.WWIMAGE_FOCUSPOINT = {
                    title: {
                        en: 'Background focus point',
                        fr: 'Point focal pour font'
                    },
                    desc: {
                        en: 'Select a focus point that should always be visible.',
                        fr: 'Selectionner un point focal qui doit toujours être visible.'
                    },
                    icon: 'wwi wwi-show',
                    shortcut: 'f',
                    next: 'WWIMAGE_FOCUSPOINT'
                }
            }

            editOptionsList.EDIT_IMAGE_ALT = {
                title: {
                    en: '\'Alt\' text',
                    fr: 'Texte \'Alt\''
                },
                desc: {
                    en: 'Description to help blind people and Google SOE',
                    fr: 'Description pour aider les personnes mal voyantes et le référencement de Google'
                },
                icon: 'wwi wwi-text',
                shortcut: 'a',
                next: 'WWIMAGE_ALT'
            }
            editOptionsList.EDIT_IMAGE_STYLE = {
                separator: {
                    en: 'Style',
                    fr: 'Style'
                },
                title: {
                    en: 'Change image style',
                    fr: 'Changer l\'apparence de l\'image'
                },
                desc: {
                    en: 'Borders, shadow, ...',
                    fr: 'Bordures, ombres, ...'
                },
                icon: 'wwi wwi-edit-style',
                shortcut: 's',
                next: 'WWIMAGE_STYLE'
            }
            editOptionsList.EDIT_IMAGE_RATIO = {
                title: {
                    en: 'Change image ratio',
                    fr: 'Changer le ratio de l\'image'
                },
                desc: {
                    en: 'Portrait, square, landscape, ...',
                    fr: 'Portrait, carré, paysage, ...'
                },
                icon: 'wwi wwi-ratio',
                shortcut: 'r',
                next: 'WWIMAGE_RATIO'
            }
            editOptionsList.EDIT_IMAGE_MINWIDTH = {
                title: {
                    en: 'Set image minimum width',
                    fr: 'Changer la largeur minimale de l\'image'
                },
                desc: {
                    en: 'In pixels',
                    fr: 'En pixels'
                },
                icon: 'fas fa-arrows-alt-h',
                shortcut: 'm',
                next: 'WWIMAGE_MINWIDTH'
            }
            editOptionsList.EDIT_IMAGE_LINK = {
                separator: {
                    en: 'Link',
                    fr: 'Lien'
                },
                title: {
                    en: 'Change image link',
                    fr: 'Changer le lien de l\'image'
                },
                desc: {
                    en: 'External, internal, ...',
                    fr: 'Externe, interne, ...'
                },
                icon: 'wwi wwi-link-external',
                shortcut: 's',
                next: 'WWIMAGE_LINKS'
            }


            wwLib.wwPopups.addStory('WWIMAGE_EDIT', {
                title: {
                    en: 'Edit Image',
                    fr: 'Editer l\'image'
                },
                type: 'wwPopupEditWwObject',
                buttons: null,
                storyData: {
                    list: editOptionsList
                }
            })
            wwLib.wwPopups.addStory('WWIMAGE_SELECT', {
                title: {
                    en: 'Select image',
                    fr: 'Choisir une image'
                },
                type: 'wwPopupSelectImage',
                next: 'WWIMAGE_RATIO'
            })
            wwLib.wwPopups.addStory('WWIMAGE_RATIO', {
                title: {
                    en: 'Image Ratio',
                    fr: 'Ratio de l\'image'
                },
                type: 'wwPopupWwObjectRatio',
                buttons: {
                    NEXT: {
                        text: {
                            en: 'Next',
                            fr: 'Suivant'
                        },
                        next: 'WWIMAGE_STYLE'
                    }
                }
            })
            wwLib.wwPopups.addStory('WWIMAGE_STYLE', {
                title: {
                    en: 'Image style',
                    fr: 'Style de l\'image'
                },
                type: 'wwPopupWwObjectStyle',
                buttons: {
                    NEXT: {
                        text: {
                            en: 'Next',
                            fr: 'Suivant'
                        },
                        next: 'WWIMAGE_ALT'
                    }
                }
            })
            wwLib.wwPopups.addStory('WWIMAGE_LINKS', {
                title: {
                    en: 'Link',
                    fr: 'Lien'
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
            wwLib.wwPopups.addStory('WWIMAGE_ALT', {
                title: {
                    en: '\'Alt\' text',
                    fr: 'Text \'Alt\''
                },
                type: 'wwPopupForm',
                storyData: {
                    fields: [
                        {
                            label: {
                                en: '\'Alt\' text :',
                                fr: 'Texte \'Alt\' :'
                            },
                            type: 'text',
                            key: 'altText',
                            valueData: 'wwObject.content.data.alt',
                            desc: {
                                en: 'Short description of the image to help blind people and Google for SOE',
                                fr: 'Déscription courte de l\'image pour aider les personnes mal voyantes et Google (référencement)'
                            }
                        }
                    ]
                },
                buttons: {
                    OK: {
                        text: {
                            en: 'Ok',
                            fr: 'Valider'
                        },
                        next: false
                    }
                }
            })
            wwLib.wwPopups.addStory('WWIMAGE_MINWIDTH', {
                title: {
                    en: 'Minimum width',
                    fr: 'Largeur minimale'
                },
                type: 'wwPopupForm',
                storyData: {
                    fields: [
                        {
                            label: {
                                en: 'Min width (px) :',
                                fr: 'Largeur minimale (px) :'
                            },
                            type: 'text',
                            key: 'minWidth',
                            valueData: 'wwObject.content.data.style.minWidth'
                        }
                    ]
                },
                buttons: {
                    OK: {
                        text: {
                            en: 'Ok',
                            fr: 'Valider'
                        },
                        next: false
                    }
                }
            })
            wwLib.wwPopups.addStory('WWIMAGE_FOCUSPOINT', {
                title: {
                    en: 'Background focus point',
                    fr: 'Point focal pour le font'
                },
                type: 'wwImagePopupFocusPoint',
                storyData: {
                },
                buttons: {
                    OK: {
                        text: {
                            en: 'Ok',
                            fr: 'Valider'
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
                if (typeof (result.altText) != 'undefined') {
                    this.wwObject.content.data.alt = result.altText;
                }
                if (typeof (result.focusPoint) != 'undefined') {
                    this.wwObject.content.data.focusPoint = result.focusPoint;
                }

                /*
                this.resizeImage({
                    image: this.wwObject.content.data.url,
                    maxSize: 20,
                    ratio: this.getRatio(),
                    zoom: this.wwObject.content.data.zoom,
                    x: this.wwObject.content.data.position.x,
                    y: this.wwObject.content.data.position.y
                })
                */


                /*=============================================m_ÔÔ_m=============================================\
                  STYLE
                \================================================================================================*/
                if (typeof (result.borderColor) != 'undefined') {
                    this.wwObject.content.data.style.borderColor = result.borderColor;
                }
                if (typeof (result.borderRadius) != 'undefined') {
                    this.wwObject.content.data.style.borderRadius = result.borderRadius;
                }
                if (typeof (result.borderRadiusUnit) != 'undefined') {
                    this.wwObject.content.data.style.borderRadiusUnit = result.borderRadiusUnit;
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
                if (typeof (result.minWidth) != 'undefined') {
                    this.wwObject.content.data.style.minWidth = result.minWidth;
                }

                this.calcTwicPics();
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

                return resolve();

                /*
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
                */
            });


        },
        checkRecalcTwicPics() {
            if (!this.wwObject.content.data.crop || this.wwObject.content.data.crop == '100px100p@0px0p' || this.wwObject.content.data.crop.toLowerCase().indexOf('nan') !== -1) {
                this.$nextTick(() => {
                    this.calcTwicPics();
                    this.wwObjectCtrl.update(this.wwObject);
                });
            }
        },
        calcTwicPics() {
            if (!this.editing) {
                return;
            }
            const img = this.$el.querySelector('.image');

            //Set image size before calculating crop
            img.style.height = this.wwAttrs.wwCategory == 'background' ? '100%' : 'auto';
            img.style.width = (this.wwObject.content.data.zoom > 0 ? this.wwObject.content.data.zoom : 1) * 100 + '%';

            const rectCtn = this.$el.getBoundingClientRect();
            const rectImg = img.getBoundingClientRect();

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
            const _cx = Math.max(Math.min((0.5 * (1 - 1 / z) * 100) - px, 100), 0);
            const _cy = Math.max(Math.min((0.5 * (1 - 1 / zh) * 100) - py, 100), 0);
            const cx = Math.floor(_cx);
            const cy = Math.floor(_cy);

            const cw = Math.ceil(Math.max(Math.min(100 / z, 100 - _cx, w * rectCtn.width * 100 / rectImg.width), 0));
            const ch = Math.ceil(Math.max(Math.min(100 / zh, 100 - _cy, h * rectCtn.height * 100 / rectImg.height), 0));

            this.wwObject.content.data.crop = cw + 'px' + ch + 'p@' + Math.min(cx, cw - cx) + 'px' + Math.min(cy, ch - cy) + 'p';
            this.wwObject.content.data.pos = {
                left: (x * 100) + '%',
                top: (y * 100) + '%',
                width: (w * 100) + '%',
                height: (h * 100) + '%'
            }

            if (this.wwObject.uniqueId == 9285301786) {
                console.log(this.wwObject.content.data.pos);
            }


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
        let u = this.wwObject.content.data.url;
        this.wwObject.content.data.url = this.wwObject.content.data.url.replace('wewebapp.s3.eu-west-3.amazonaws.com', 'cdn.weweb.app');
        this.wwObject.content.data.url = this.wwObject.content.data.url.replace('wewebapp-preprod.s3.eu-west-3.amazonaws.com', 'cdn.weweb.dev');
        if (u != this.wwObject.content.data.url) {
            this.wwObjectCtrl.update(this.wwObject);
        }
    }
};
</script>


<style scoped lang="scss">
:not(.ww-editing) .ww-image {
    position: relative;
    user-select: none;
    display: flex;
    justify-content: center;

    .wrapper {
        width: 100%;
        position: relative;

        .border {
            position: absolute;
            top: -1px;
            left: -1px;
            right: -1px;
            bottom: -1px;
            pointer-events: none;
        }

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
                // overflow: hidden;
                /* +2px to avoid white borders */
                width: calc(100% + 1px);
                height: calc(100% + 1px);
                transition: background-color 0.1s ease;

                .hover {
                    width: 100%;
                    height: 100%;
                    position: relative;

                    .image {
                        position: absolute;
                        transition: opacity 0.3s ease;
                        /*opacity: 0;*/

                        width: 100%;
                        height: 100%;

                        &.bg {
                            top: 50%;
                            left: 50%;
                            transform: translate(-50%, -50%);

                            background-repeat: no-repeat;
                            background-position: center;
                            background-size: cover;
                        }

                        // &.twic {
                        //     filter: blur(5px);
                        //     // opacity: 0;
                        //     &.twic-background-done,
                        //     &.twic-done {
                        //         filter: blur(0);
                        //         // opacity: 1;
                        //     }
                        // }

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

.ww-editing .ww-image {
    position: relative;
    user-select: none;
    display: flex;
    justify-content: center;

    .wrapper {
        width: 100%;
        position: relative;

        .border {
            position: absolute;
            top: -1px;
            left: -1px;
            right: -1px;
            bottom: -1px;
            pointer-events: none;
        }

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
                // overflow: hidden;
                /* +2px to avoid white borders */
                width: calc(100% + 1px);
                height: calc(100% + 1px);
                transition: background-color 0.1s ease;

                .hover {
                    width: 100%;
                    height: 100%;
                    position: relative;

                    .image {
                        position: absolute;
                        transition: opacity 0.3s ease;
                        /*opacity: 0;*/

                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);

                        &.bg {
                            background-repeat: no-repeat;
                            background-position: center;
                            background-size: cover;
                        }

                        // &.twic {
                        //     filter: blur(5px);
                        //     // opacity: 0;
                        //     &.twic-background-done,
                        //     &.twic-done {
                        //         filter: blur(0);
                        //         // opacity: 1;
                        //     }
                        // }

                        &.loaded {
                            opacity: 1 !important;
                        }
                    }
                }
            }
        }
    }
}

.ww-edit-mode-content .container {
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

.ww-edit-mode-content .controls-desktop,
.ww-edit-mode-content .reset-zoom,
.controls-desktop.lock {
    display: block;
}

.ww-image:not(.bg):hover .controls-desktop,
.ww-image:not(.bg):hover .reset-zoom,
.controls-desktop.lock {
    opacity: 1;
}

/* wwManager:end */
</style>

<style>
.ww-image-dragging {
    cursor: move;
    cursor: grab;
    user-select: none;
}
</style>