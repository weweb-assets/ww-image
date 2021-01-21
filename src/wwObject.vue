<template>
    <div class="ww-image">
        <div class="ww-image__wrapper" :style="formatStyle" ww-responsive="ww-img-wrap">
            <div class="ww-image__ratio" :style="ratioStyle" ww-responsive="ww-img-ratio"></div>
            <!-- wwManager:start -->
            <img
                draggable="false"
                class="ww-image__img"
                :src="source"
                :alt="content.alt"
                :style="imageStyle"
                ww-responsive="ww-img"
            />
            <!-- wwManager:end -->

            <!-- wwFront:start -->
            <!-- No Twicpics -->
            <img
                v-if="content.disableTwicPics"
                class="ww-image__img"
                :src="source"
                :alt="content.alt"
                :style="imageStyle"
                ww-responsive="ww-img"
                loading="auto"
            />

            <!-- Twicpics -->
            <img
                v-else-if="!hasSrcSet"
                class="ww-image__img twic"
                :src="placeholder"
                :data-twic-src="twicPicsDataSrc"
                data-src-transform="quality=85/auto"
                data-src-step="10"
                :alt="content.alt"
                :style="imageStyle"
                ww-responsive="ww-img"
            />

            <!-- SRCSET -->
            <img
                v-else
                class="ww-image__img"
                :style="imageStyle"
                :srcset="imgSrcSet"
                :src="twicPicsFallback"
                :alt="content.alt"
                loading="lazy"
                ww-responsive="ww-img"
            />
            <!-- wwFront:end -->
        </div>
    </div>
</template>

<script>
const screenBreakpoints = {
    xs: 768,
    sm: 992,
    md: 1200,
    lg: 1920,
};

export default {
    name: '__COMPONENT_NAME__',
    wwDefaultContent: {
        alt: '',
        url: wwLib.responsive('https://cdn.weweb.app/public/images/no_image_selected.png'),
        x: wwLib.responsive(0),
        y: wwLib.responsive(0),
        zoom: wwLib.responsive(1),
        style: {},
        focusPoint: wwLib.responsive([50, 50]),
        ratio: wwLib.responsive(0),
    },
    props: {
        uid: String,
        content: Object,
        wwElementState: Object,
        wwFrontState: Object,
        /* wwManager:start */
        wwEditorState: Object,
        /* wwManager:end */
    },
    data() {
        return {
            placeholder: 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
            imageSizes: {
                lg: 0,
                md: 0,
                sm: 0,
                xs: 0,
            },
            imgSrcSet: null,

            /* wwManager:start */
            lastMovePosition: { x: 0, y: 0 },
            initialPosition: { x: 0, y: 0 },
            lastTouchDist: 0,
            isMoving: false,
            zoomBarElement: null,
            moveDirection: null,
            /* wwManager:end */
        };
    },
    computed: {
        screenSize() {
            return this.$store.getters['front/getScreenSize'];
        },
        source() {
            return `${wwLib.wwUtils.getCdnPrefix()}${this.content.url}`;
        },
        twicPicsDataSrc() {
            return `image:${wwLib.wwUtils.getTwicPicsFolder()}${this.content.url}`;
        },
        twicPicsSrc() {
            return wwLib.wwUtils.transformToTwicPics(this.content.url);
        },
        twicPicsFallback() {
            return `${this.twicPicsSrc}/quality=85/resize=1024`;
        },
        imageStyle() {
            // --zoom: 1;
            // --left: 0;
            // --top: 0;

            let style = {
                filter:
                    this.content && this.content.style && this.content.style.filter ? this.content.style.filter : null,
                '--zoom': (this.content && this.content.zoom) || 1,
                '--left': (this.content && this.content.x) || 0,
                '--top': (this.content && this.content.y) || 0,
            };

            return style;
        },
        formatStyle() {
            let overlayBackground = 'none';
            if (this.content.style && this.content.style.overlay) {
                const overlay = this.content.style.overlay;
                if (overlay.type === 'color') {
                    overlayBackground = overlay.value;
                } else if (overlay.type === 'gradient' && overlay.value) {
                    overlayBackground = overlay.value.value;
                }
            }
            return {
                '--ww-image-overlay-background': overlayBackground,
            };
        },
        ratioStyle() {
            return {
                '--ww-image-ratio': `${this.content.ratio * 100}%`,
            };
        },
        focusPoint() {
            return `${this.content.focusPoint[0]}px${this.content.focusPoint[1]}p`;
        },
        hasSrcSet() {
            return window.__WW_IS_PRERENDER__ || window[`wwg_imgsrcset_${this.uid.split('-')[0]}`];
        },
    },
    watch: {
        'content.url': {
            handler(newUrl, oldUrl) {
                if (newUrl === oldUrl || !this.$el) return;

                const img = this.$el.querySelector('img');
                if (!img) return;

                img.onload = () => {
                    if (!img.naturalWidth || !img.naturalHeight) return;
                    const ratio = img.naturalHeight / img.naturalWidth;
                    this.$emit('update', { ratio });
                };
            },
        },
        /* wwFront:start */
        screenSize(oldValue, newValue) {
            if (window.__WW_IS_PRERENDER__ && this.$el && this.$el.querySelector('.ww-image__img')) {
                setTimeout(() => {
                    this.imgSrcSet = this.imgSrcSet || '';

                    const uid = this.uid.split('-')[0];

                    const img = this.$el.querySelector('.ww-image__img');
                    const width = Math.round(img.getBoundingClientRect().width);

                    if (width) {
                        this.imgSrcSet += `${this.imgSrcSet ? ', ' : ''}${
                            this.twicPicsSrc
                        }/quality=85/resize=${width} ${window.innerWidth}w`;

                        let imgSrcSetElm = document.getElementById(`ww-image-srcset-${uid}`);
                        if (!imgSrcSetElm) {
                            imgSrcSetElm = document.createElement('script');
                            imgSrcSetElm.setAttribute('id', `ww-image-srcset-${uid}`);
                            document.head.append(imgSrcSetElm);
                        }
                        imgSrcSetElm.innerText = `window.wwg_imgsrcset_${uid} = "${this.imgSrcSet}";`;
                    }
                }, 100);
            }
            // else if (oldValue && newValue && oldValue != newValue) {
            //     this.imgSrcSet = null;
            // }
        },
        /* wwFront:end */
    },
    methods: {
        preventEvent(event) {
            event.preventDefault();
            event.stopPropagation();

            return false;
        },
        /* wwManager:start */
        /*=============================================m_ÔÔ_m=============================================\
          IMAGE ZOOM
        \================================================================================================*/
        resetZoom(event) {
            if (event) this.preventEvent(event);
            this.$emit('update', { x: 0, y: 0, zoom: 1 });

            return false;
        },
        switchCoverContain() {
            if (this.$el && this.$el.querySelector('img')) {
                const wrapper = this.$el.querySelector('.ww-image__wrapper');
                const wrapperWidth = wrapper.getBoundingClientRect().width;
                const wrapperHeight = wrapper.getBoundingClientRect().height;

                const img = this.$el.querySelector('img');
                const imgWidth = img.getBoundingClientRect().width;
                const imgHeight = img.getBoundingClientRect().height;

                let targetHeight, targetWidth;

                if (wrapperWidth === imgWidth) {
                    targetHeight = wrapperHeight;
                    targetWidth = imgWidth / (imgHeight / wrapperHeight);
                } else {
                    targetWidth = wrapperWidth;
                    targetHeight = imgHeight / (imgWidth / wrapperWidth);
                }

                const zoom = targetWidth / wrapperWidth;

                this.$emit('update', { x: 0, y: 0, zoom });
            }
        },

        /*=============================================m_ÔÔ_m=============================================\
          IMAGE MOVE
        \================================================================================================*/
        getEventPosition(event) {
            var position = { x: 0, y: 0 };

            position.x = event.clientX;
            position.y = event.clientY;

            return position;
        },
        startMove(event) {
            if (!this.wwEditorState.isSelected) return;
            if (
                this.wwEditorState.editMode !== wwLib.wwEditorHelper.EDIT_MODES.EDITION ||
                this.wwElementState.isBackground
            ) {
                return;
            }
            if (event.ctrlKey || event.button == 2) {
                return;
            }
            this.isMoving = false;
            wwLib.wwManagerUI.lockSelection();

            this.lastMovePosition = this.getEventPosition(event);
            this.initialPosition = { x: this.content.x, y: this.content.y };
            if (this.lastMovePosition) {
                wwLib.getFrontDocument().addEventListener('mousemove', this.move);
                wwLib.getManagerDocument().addEventListener('mousemove', this.move);
                wwLib.getFrontDocument().addEventListener('click', this.stopMove);
                wwLib.getManagerDocument().addEventListener('click', this.stopMove);

                document.body.classList.add('ww-image-dragging');
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

            if (!this.isMoving && Math.abs(offsetXpx) + Math.abs(offsetYpx) < 4) {
                return;
            }

            this.isMoving = true;

            if (this.moveDirection == 'x') {
                offsetYpx = 0;
            } else if (this.moveDirection == 'y') {
                offsetXpx = 0;
            } else if (wwLib.wwShortcuts.hasModifiers('SHIFT') && Math.abs(offsetXpx) > Math.abs(offsetYpx)) {
                offsetYpx = 0;
                this.moveDirection = 'x';
            } else if (wwLib.wwShortcuts.hasModifiers('SHIFT')) {
                offsetXpx = 0;
                this.moveDirection = 'y';
            }

            const rectImg = this.$el.querySelector('.ww-image__wrapper').getBoundingClientRect();
            var offsetXpercent = (offsetXpx * 100) / rectImg.width;
            var offsetYpercent = (offsetYpx * 100) / rectImg.height;

            const update = {
                x:
                    this.initialPosition.x +
                    (offsetXpercent * this.content.zoom) /
                        (1 - this.content.zoom + this.content.zoom * this.content.zoom),
                y:
                    this.initialPosition.y +
                    (offsetYpercent * this.content.zoom) /
                        (1 - this.content.zoom + this.content.zoom * this.content.zoom),
            };

            this.preventEvent(event);
            this.$emit('update', update);
        },
        stopMove() {
            this.isMoving = false;

            wwLib.getFrontDocument().removeEventListener('mousemove', this.move);
            wwLib.getManagerDocument().removeEventListener('mousemove', this.move);
            wwLib.getFrontDocument().removeEventListener('click', this.stopMove);
            wwLib.getManagerDocument().removeEventListener('click', this.stopMove);

            this.moveDirection = null;
            window.document.body.classList.remove('ww-image-dragging');

            wwLib.wwManagerUI.unlockSelection();

            return false;
        },
        async edit() {
            const update = await openPopup({
                isBackground: this.$attrs['ww-element-state'].isBackground,
                content: this.$attrs.content,
            });
            if (update) {
                this.$emit('update', update);
            }
        },
        /* wwManager:end */
    },
    created() {
        /* wwFront:start */
        if (window[`wwg_imgsrcset_${this.uid.split('-')[0]}`]) {
            this.imgSrcSet = window[`wwg_imgsrcset_${this.uid.split('-')[0]}`];
        }
        /* wwFront:end */
    },
    /* wwManager:start */
    mounted() {
        if (!this.wwElementState.isBackground) {
            this.$el.addEventListener('mousedown', this.startMove);
        }

        if (!this.$el) return;

        const img = this.$el.querySelector('img');
        if (!img) return;

        img.onload = () => {
            if (!img.naturalWidth || !img.naturalHeight) return;
            const ratio = img.naturalHeight / img.naturalWidth;
            this.$emit('update', { ratio });
        };
    },
    beforeDestroy() {
        if (!this.wwElementState.isBackground) {
            this.$el.removeEventListener('mousedown', this.startMove);
        }
    },
    /* wwManager:end */
};
</script>

<style scoped lang="scss">
.ww-image {
    display: flex;

    &__wrapper {
        /* wwEditor:start */
        cursor: move;
        cursor: grab;
        user-select: none;
        /* wwEditor:start */

        width: 100%;
        position: relative;
        overflow: hidden;
        flex: 1;

        &:after {
            position: absolute;
            content: '';
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: var(--ww-image-overlay-background);
            pointer-events: none;
        }
    }

    &__ratio {
        visibility: none;
        position: relative;
        pointer-events: none;

        &:before {
            content: '';
            width: 1px;
            margin-left: -1px;
            float: left;
            height: 0;
            padding-top: var(--ww-image-ratio);
        }

        &:after {
            content: '';
            display: table;
            clear: both;
        }
    }

    &__img {
        position: absolute;
        --posX: calc(calc(1% * var(--left)) * calc(1 - calc(calc(1 - var(--zoom)) / 2)));
        --posY: calc(calc(1% * var(--top)) * calc(1 - calc(calc(1 - var(--zoom)) / 2)));
        top: calc(50% + var(--posY));
        left: calc(50% + var(--posX));
        width: calc(100% * var(--zoom));
        transform: translate(-50%, -50%);
    }
}
</style>

<style>
.ww-image-dragging {
    cursor: move;
    cursor: grab;
    user-select: none;
}
</style>
