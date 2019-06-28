<template>
    <div class="ww-image" :class="{'bg': wwAttrs.wwCategory == 'background'}">
        <div class="wrapper" :style="c_styles.wrapper">
            <!-- wwManager:start -->
            <div class="controls-desktop" :class="{'lock': d_lockControls}">
                <div class="zoom-bar">
                    <div class="zoom-line"></div>
                    <div class="zoom-handle" :style="{'top' : c_zoomPercentY + '%'}" @mousedown="startZoomDesktop($event)">
                        <div></div>
                    </div>
                </div>
            </div>
            <div class="reset-zoom" @click="resetZoom($event)">
                <i class="fa fa-expand" aria-hidden="true"></i>
            </div>
            <!-- wwManager:end -->
            <div class="format" :style="c_styles.format">
                <!-- Background -->
                <div class="container" v-if="wwAttrs.wwCategory == 'background'">
                    <div v-if="!wwAttrs.wwNoTwicPics" class="image bg twic" :data-background="'url(' + wwObject.content.data.url + ')'" data-background-step="400" :data-background-focus="c_focusPoint" data-background-transform="auto/quality=85" :style="c_styles.image"></div>
                    <div v-if="wwAttrs.wwNoTwicPics" class="image bg" :style="c_styles.image"></div>
                </div>

                <!-- Image Manager -->
                <div class="container" v-if="wwAttrs.wwCategory != 'background'">
                    <!-- wwManager:start -->
                    <span class="img-manager">
                        <img draggable="false" class="image" :src="wwObject.content.data.url" :alt="wwObject.content.data.alt" :style="c_styles.image">
                    </span>
                    <!-- wwManager:end -->
                    <!-- wwFront:start -->
                    <span class="img-front">
                        <img v-if="!wwAttrs.wwNoTwicPics" class="image twic" :src="c_twicTransformPlaceholder" :data-src="wwObject.content.data.url" :data-src-transform="c_twicTransform" data-src-step="10" :alt="wwObject.content.data.alt" :style="c_styles.image">
                        <img v-if="wwAttrs.wwNoTwicPics" class="image" :src="wwObject.content.data.url" :alt="wwObject.content.data.alt" :style="c_styles.image">
                    </span>
                    <!-- wwFront:end -->
                </div>
            </div>
            <div class="border" :style="c_styles.border"></div>
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
            d_zoomMin: 0.2,
            d_zoomFactor: 1,
            d_el: null,

            /* wwManager:start */
            d_lastMovePosition: { x: 0, y: 0 },
            d_moving: false,
            d_lastTouchDist: 0,
            d_zoomBarElement: null,
            d_lockControls: false,
            d_moveDirection: null,
            /* wwManager:end */
        };
    },
    computed: {
        wwObject() {
            return this.wwObjectCtrl.get();
        },
        c_styles() {
            if (!this.d_el) {
                return {}
            }

            const styles = {
                image: {
                    backgroundImage: '',
                    width: '100%',
                    height: '100%',
                    minHeight: 'none',
                    top: '50%',
                    left: '50%',
                    filter: 'none'
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
            }

            this.wwObject.content.data.style = this.wwObject.content.data.style || {}

            //IMAGE
            styles.image.filter = this.wwObject.content.data.style.filter || null;

            if (wwLib.manager || this.wwAttrs.wwNoTwicPics) {
                styles.image.backgroundImage = this.wwAttrs.wwCategory == 'background' ? 'url(' + this.wwObject.content.data.url + ')' : '';
                styles.image.height = this.wwAttrs.wwCategory == 'background' ? '100%' : 'auto';
                styles.image.width = (this.wwObject.content.data.zoom > 0 ? this.wwObject.content.data.zoom : 1) * 100 + '%';
                if (this.wwAttrs.wwCategory != 'background') {
                    let position = this.wwObject.content.data.position || { x: 0, y: 0 }
                    styles.image.left = '50%';
                    styles.image.top = '50%';
                    styles.image['-webkit-transform'] = 'translate(' + (position.x - 50) + '%, ' + (position.y - 50) + '%)';
                    styles.image['-moz-transform'] = 'translate(' + (position.x - 50) + '%, ' + (position.y - 50) + '%)';
                    styles.image['-ms-transform'] = 'translate(' + (position.x - 50) + '%, ' + (position.y - 50) + '%)';
                    styles.image['-o-transform'] = 'translate(' + (position.x - 50) + '%, ' + (position.y - 50) + '%)';
                    styles.image.transform = 'translate(' + (position.x - 50) + '%, ' + (position.y - 50) + '%)';
                }
            }
            else if (this.wwAttrs.wwCategory != 'background') {
                let defaultPosition = { left: '0px', top: '0px', width: '100%', height: '100%' };
                let position = this.wwObject.content.data.pos;

                styles.image.left = position.left || defaultPosition.left;
                styles.image.top = position.top || defaultPosition.top;
                styles.image.width = position.width && position.width != "0%" ? position.width : defaultPosition.width;
                styles.image.height = position.height && position.height != "0%" ? position.height : defaultPosition.height;
                styles.image['-webkit-transform'] = 'none';
                styles.image['-moz-transform'] = 'none';
                styles.image['-ms-transform'] = 'none';
                styles.image['-o-transform'] = 'none';
                styles.image.transform = 'none';
            }

            //FORMAT
            styles.format.boxShadow = this.getShadow();
            styles.format.minWidth = this.wwObject.content.data.style.minWidth ? this.wwObject.content.data.style.minWidth + 'px' : '20px';

            if (this.wwAttrs.wwCategory != 'background') {
                styles.format.paddingBottom = this.getRatio() + '%';
            }
            else {
                styles.format.paddingBottom = 0;
            }


            //BORDER
            const unit = this.wwObject.content.data.style.borderRadiusUnit || '%';
            const borderRadius = (this.wwObject.content.data.style.borderRadius / (unit == '%' ? 2 : 1) || 0) + unit;
            styles.border.borderRadius = borderRadius;
            styles.format.borderRadius = borderRadius;

            styles.border.borderWidth = (this.wwObject.content.data.style.borderWidth || 0) + 'px';

            styles.border.borderColor = this.wwObject.content.data.style.borderColor || 'black';
            styles.border.borderStyle = this.wwObject.content.data.style.borderStyle || 'none';
            styles.border.background = this.wwObject.content.data.style.overlay || '';

            //WRAPPER
            if (this.wwObject.content.data.style.maxHeight) {
                styles.wrapper.width = (parseInt(this.wwObject.content.data.style.maxHeight) / this.getRatio() * 100) + 'px';
            } else {
                styles.wrapper.width = null;
            }


            return styles;
        },
        c_twicTransform() {
            if (typeof (this.wwObject.content.data.crop) == 'string') {
                if (!this.wwObject.content.data.crop || this.wwObject.content.data.crop.indexOf('NaN') !== -1) {
                    return 'cover/quality=85/auto';
                }
                return 'crop=' + this.wwObject.content.data.crop.replace(/99/gi, '100') + '/quality=85/auto';
            }
            else {
                const crop = this.wwObject.content.data.crop || {};
                crop.cw = Math.max(0, (crop.cw) || 100);
                crop.ch = Math.max(0, (crop.ch) || 100);
                crop.cx = Math.max(0, crop.cx || 0);
                crop.cy = Math.max(0, crop.cy || 0);

                return 'crop=' + crop.cw + 'px' + crop.ch + 'p@' + crop.cx + 'px' + crop.cy + 'p/quality=85/auto';
            }
        },
        c_twicTransformPlaceholder() {
            if (typeof (this.wwObject.content.data.crop) == 'string') {
                if (!this.wwObject.content.data.crop || this.wwObject.content.data.crop.indexOf('NaN') !== -1) {
                    return 'https://i.twic.pics/v1/cover/resize=20/' + this.wwObject.content.data.url;
                }
                return 'https://i.twic.pics/v1/crop=' + this.wwObject.content.data.crop.replace(/99/gi, '100') + '/resize=20/' + this.wwObject.content.data.url;
            }
            else {
                const crop = this.wwObject.content.data.crop || {};
                crop.cw = Math.max(0, (crop.cw) || 100);
                crop.ch = Math.max(0, (crop.ch) || 100);
                crop.cx = Math.max(0, crop.cx || 0);
                crop.cy = Math.max(0, crop.cy || 0);

                return 'https://i.twic.pics/v1/crop=' + crop.cw + 'px' + crop.ch + 'p@' + crop.cx + 'px' + crop.cy + 'p/resize=20/' + this.wwObject.content.data.url;
            }
        },
        c_focusPoint() {
            let focusPoint = this.wwObject.content.data.focusPoint || [50, 50];
            return focusPoint[0] + 'px' + focusPoint[1] + 'p';
        },
        c_editing() {
            return this.wwObjectCtrl.getSectionCtrl().getEditMode() == 'CONTENT';
        },

        /* wwManager:start */
        c_zoomPercentY() {
            return 100 - this.d_zoomFactor * Math.sqrt(Math.max(this.wwObject.content.data.zoom, 0) - this.d_zoomMin);
        },
        /* wwManager:end */
    },
    watch: {
        c_editing() {
            if (this.c_editing) {
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
            this.d_zoomFactor = Math.sqrt(100 * 100 / (10 - this.d_zoomMin));
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

            this.$nextTick(() => {
                this.calcTwicPics();
                this.wwObjectCtrl.update(this.wwObject);
            })

            return false;
        },
        startZoomDesktop(event) {
            this.d_lockControls = true;

            wwLib.wwObjectHover.setLock(this);

            this.d_zoomBarElement = this.$el.querySelector('.zoom-bar');

            window.addEventListener("mousemove", this.zoomDesktop);
            window.addEventListener("mouseup", this.stopZoomDesktop);

            window.document.body.classList.add('ww-image-dragging');

            wwLib.wwObjectMenu.preventOpen();

            return false;
        },
        zoomDesktop(event) {

            let zoomPositionY = (event.clientY - this.d_zoomBarElement.getBoundingClientRect().top) * 100 / this.d_zoomBarElement.getBoundingClientRect().height;
            zoomPositionY = Math.min(Math.max(zoomPositionY, 0), 100);


            this.wwObject.content.data.zoom = Math.pow((100 - zoomPositionY) / this.d_zoomFactor, 2) + this.d_zoomMin;

            this.preventEvent(event);

            this.calcTwicPics();
            this.wwObjectCtrl.update(this.wwObject);

            return false;
        },
        stopZoomDesktop(event) {
            this.d_lockControls = false;

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

            this.d_moving = false;

            this.d_lastMovePosition = this.getEventPosition(event);
            if (this.d_lastMovePosition) {

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

            var offsetXpx = position.x - this.d_lastMovePosition.x;
            var offsetYpx = position.y - this.d_lastMovePosition.y;

            if (!this.d_moving && Math.abs(offsetXpx) + Math.abs(offsetYpx) < 4) {
                return;
            }

            this.d_moving = true;

            if (this.d_moveDirection == 'x') {
                offsetYpx = 0;
            }
            else if (this.d_moveDirection == 'y') {
                offsetXpx = 0;
            }
            else if (wwLib.wwShortcuts.hasModifiers('SHIFT') && Math.abs(offsetXpx) > Math.abs(offsetYpx)) {
                offsetYpx = 0;
                this.d_moveDirection = 'x';
            }
            else if (wwLib.wwShortcuts.hasModifiers('SHIFT')) {
                offsetXpx = 0;
                this.d_moveDirection = 'y';
            }

            var offsetXpercent = offsetXpx * 100 / this.$el.querySelector('.container').getBoundingClientRect().width;
            var offsetYpercent = offsetYpx * 100 / this.$el.querySelector('.container').getBoundingClientRect().height;

            this.wwObject.content.data.position.x += offsetXpercent / this.wwObject.content.data.zoom;
            this.wwObject.content.data.position.y += offsetYpercent / this.wwObject.content.data.zoom * this.$el.querySelector('.image').getBoundingClientRect().width * this.$el.querySelector('.container').getBoundingClientRect().height / (this.$el.querySelector('.image').getBoundingClientRect().height * this.$el.querySelector('.container').getBoundingClientRect().width);

            if (this.isTouch(event)) {
                const touchDist = this.getTouchDist(event);

                this.wwObject.content.data.zoom += (touchDist - this.d_lastTouchDist) / 100 * (this.wwObject.content.data.zoom === 0 ? 1 : this.wwObject.content.data.zoom);

                if (this.wwObject.content.data.zoom < this.d_zoomMin) {
                    this.wwObject.content.data.zoom = this.d_zoomMin;
                }
                if (this.wwObject.content.data.zoom > 10) {
                    this.wwObject.content.data.zoom = 10;
                }

                this.d_lastTouchDist = touchDist;
            }

            this.d_lastMovePosition.x = position.x;
            this.d_lastMovePosition.y = position.y;

            this.preventEvent(event);
            this.calcTwicPics();
            this.wwObjectCtrl.update(this.wwObject);

        },
        stopMove(event) {

            if (this.d_moving) {
                wwLib.wwObjectMenu.preventOpen();
            }

            this.d_lockControls = false;

            this.d_moving = false;

            // wwLib.wwObjectHover.removeLock();

            wwLib.getFrontDocument().removeEventListener("mousemove", this.move);
            wwLib.getManagerDocument().removeEventListener("mousemove", this.move);
            wwLib.getFrontDocument().removeEventListener("mouseup", this.stopMove);
            wwLib.getManagerDocument().removeEventListener("mouseup", this.stopMove);

            wwLib.getFrontDocument().removeEventListener("touchmove", this.move);
            wwLib.getManagerDocument().removeEventListener("touchmove", this.move);
            wwLib.getFrontDocument().removeEventListener("touchend", this.stopMove);
            wwLib.getManagerDocument().removeEventListener("touchend", this.stopMove);

            this.d_moveDirection = null;

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

                this.$nextTick(() => {
                    this.calcTwicPics();
                    this.wwObjectCtrl.update(this.wwObject);

                    this.wwObjectCtrl.globalEdit(result);

                    this.loadImage();
                });

            } catch (error) {
                console.log(error);
            }

            wwLib.wwObjectHover.removeLock();
        },

        checkRecalcTwicPics() {
            if (typeof (this.wwObject.content.data.crop) == 'string') {
                if (!this.wwObject.content.data.crop || this.wwObject.content.data.crop == '100px100p@0px0p' || this.wwObject.content.data.crop.toLowerCase().indexOf('nan') !== -1) {
                    this.$nextTick(() => {
                        this.calcTwicPics();
                        this.wwObjectCtrl.update(this.wwObject);
                    });
                }
            }
        },
        calcTwicPics() {
            if (!this.c_editing) {
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

            const bx = Math.max(Math.min(0.5 - z * (1 / 2 + px / 100), 100), 0);
            const by = Math.max(Math.min(0.5 - zh * (1 / 2 + py / 100), 100), 0);

            const w = Math.max(Math.min(1, z, 1 - bx - x), 0);
            const h = Math.max(Math.min(1, zh, 1 - by - y), 0);

            //CROP
            const _cx = Math.max(Math.min((0.5 * (1 - 1 / z) * 100) - px, 100), 0);
            const _cy = Math.max(Math.min((0.5 * (1 - 1 / zh) * 100) - py, 100), 0);
            const cx = Math.floor(_cx);
            const cy = Math.floor(_cy);

            const _cw = Math.max(Math.min(100 / z, 100 - _cx, w * rectCtn.width * 100 / rectImg.width), 0);
            const _ch = Math.max(Math.min(100 / zh, 100 - _cy, h * rectCtn.height * 100 / rectImg.height), 0);
            const cw = Math.ceil(_cw);
            const ch = Math.ceil(_ch);

            this.wwObject.content.data.crop = {
                cw: Math.min(_cw, 100 - _cx),
                ch: Math.min(_ch, 100 - _cy),
                cx: _cx,
                cy: _cy
            }

            this.wwObject.content.data.pos = {
                left: (x * 100) + '%',
                top: (y * 100) + '%',
                width: (w * 100) + '%',
                height: (h * 100) + '%'
            }

        }
        /* wwManager:end */
    },
    mounted() {
        this.init();

        this.d_el = this.$el;

        /* wwManager:start */
        this.$el.querySelector('.container').addEventListener('touchstart', this.startMove);
        this.$el.querySelector('.container').addEventListener('mousedown', this.startMove);
        /* wwManager:end */
    },
    created() {
        /* wwManager:start */
        let u = this.wwObject.content.data.url;
        this.wwObject.content.data.url = this.wwObject.content.data.url.replace('wewebapp.s3.eu-west-3.amazonaws.com', 'cdn.weweb.app');
        this.wwObject.content.data.url = this.wwObject.content.data.url.replace('wewebapp-preprod.s3.eu-west-3.amazonaws.com', 'cdn.weweb.dev');
        if (u != this.wwObject.content.data.url) {
            this.wwObjectCtrl.update(this.wwObject);
        }
        /* wwManager:end */
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
                width: calc(100% + 1px);
                height: calc(100% + 1px);
                transition: background-color 0.1s ease;

                .image {
                    position: absolute;
                    transition: opacity 0.3s ease;
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

                    &.loaded {
                        opacity: 1 !important;
                    }
                }
            }
        }
    }
}

/* wwManager:start */
.controls-desktop {
    display: none;
}

.reset-zoom {
    display: none;
}

.ww-image {
    .image {
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);

        &.bg {
            top: auto;
            left: auto;
            transform: "none";

            & .controls-desktop,
            & .controls-mobile {
                display: none;
            }
        }
    }
}

.ww-edit-mode-content {
    .container {
        cursor: move;
        cursor: grab;
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
        display: block;
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
        display: block;
        transition: opacity 0.15s ease;
    }
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