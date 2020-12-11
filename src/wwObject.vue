<template>
    <div class="ww-image" :class="{ bg: wwElementState.isBackground }">
        <!-- wwManager:start -->
        <div class="ww-image__wrapper" :style="formatStyle" ww-responsive="ww-img-wrap">
            <!-- Background -->
            <div v-if="wwElementState.isBackground" class="ww-image__img bg" :style="imageStyle"></div>

            <!-- Normal Image -->
            <img
                v-else
                draggable="false"
                class="ww-image__img"
                :src="content.url"
                :alt="content.alt"
                :style="imageStyle"
                ww-responsive="ww-img"
            />
        </div>
        <!-- wwManager:end -->

        <!-- wwFront:start -->
        <div class="format" :style="formatStyle">
            <!-- Background -->
            <template v-if="wwElementState.isBackground">
                <!-- No Twicpics -->
                <div v-if="content.disableTwicPics" class="image bg" :style="imageStyle"></div>

                <!-- Twicpics -->
                <div
                    v-else-if="!backgroundVStyle"
                    class="image bg twic"
                    :data-background="'url(' + content.url + ')'"
                    data-background-step="400"
                    :data-background-focus="focusPoint"
                    data-background-transform="auto/quality=85"
                    :style="imageStyle"
                ></div>

                <!-- SRCSET -->
                <div v-else class="image bg" :style="imageStyle" v-style="backgroundVStyle"></div>
            </template>

            <!-- Normal Image -->
            <template v-else>
                <!-- No Twicpics -->
                <img
                    v-if="content.disableTwicPics"
                    class="image"
                    :src="content.url"
                    :alt="content.alt"
                    :style="imageStyle"
                    loading="auto"
                />

                <!-- Twicpics -->
                <img
                    v-else-if="!imgSrcSet"
                    class="image twic"
                    :src="placeholder"
                    :data-src="content.url"
                    data-src-transform="quality=85/auto"
                    data-src-step="10"
                    :alt="content.alt"
                    :style="imageStyle"
                />

                <!-- SRCSET -->
                <img
                    v-else
                    class="image"
                    :style="imageStyle"
                    :srcset="imgSrcSet"
                    :src="twicPicsSrc"
                    :alt="content.alt"
                    loading="lazy"
                />
            </template>
        </div>
        <!-- wwFront:end -->
    </div>
</template>

<script>
const screenBreakpoints = {
    xs: 768,
    sm: 992,
    md: 1200,
    lg: 1920,
};
const minZoom = 0.2;

export default {
    name: '__COMPONENT_NAME__',
    wwDefaultContent: {
        alt: '',
        url: wwLib.responsive('https://cdn.weweb.app/public/images/no_image_selected.png'),
        x: wwLib.responsive(0),
        y: wwLib.responsive(0),
        zoom: wwLib.responsive(100),
        style: {},
        focusPoint: wwLib.responsive([50, 50]),
    },
    props: {
        uid: String,
        content: Object,
        wwElementState: Object,
        wwFrontState: Object,
        /* wwManager: start */
        wwEditorState: Object,
        /* wwManager: end */
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
        twicPicsSrc() {
            const hasParams = this.content.url.indexOf('?') !== -1;
            return `https://weweb.twic.pics/${content.url}${hasParams ? '&' : '?'}twic=v1/quality=85/resize=1024`;
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
        focusPoint() {
            return `${this.content.focusPoint[0]}px${this.content.focusPoint[1]}p`;
        },
        imgSrcSet() {
            /* wwFront:start */
            if (this.content.url.indexOf('.gif') !== -1) {
                return null;
            }
            if (this.wwElementState.isBackground) {
                return null;
            }

            const nonNullWidths = Object.keys(this.imageSizes).filter(
                breakpoint => this.imageSizes[breakpoint] && this.imageSizes[breakpoint][0]
            );
            if (nonNullWidths.length === 0) {
                return;
            }
            return Object.keys(screenBreakpoints)
                .filter(breakpoint => this.imageSizes[breakpoint])
                .map(breakpoint => {
                    let url = `https://weweb.twic.pics/${this.content.url}`;
                    const hasParams = this.content.url.indexOf('?') !== -1;
                    const resize = this.imageSizes[breakpoint][0];
                    return `${url}${hasParams ? '&' : '?'}twic=v1/quality=85/resize=${resize} ${
                        screenBreakpoints[breakpoint]
                    }w`;
                })
                .join(', ');
            /* wwFront:end */
            // eslint-disable-next-line no-unreachable
            return null;
        },
        backgroundVStyle() {
            if (this.content.url.indexOf('.gif') !== -1) {
                return null;
            }
            if (!this.wwElementState.isBackground) {
                return null;
            }
            const sources = {};
            return Object.keys(screenBreakpoints)
                .filter(
                    breakpoint =>
                        this.imageSizes[breakpoint] && this.imageSizes[breakpoint][0] && this.imageSizes[breakpoint][1]
                )
                .each(breakpoint => {
                    let url = `https://weweb.twic.pics/${this.content.url}`;
                    const hasParams = this.content.url.indexOf('?') !== -1;
                    const resize = this.imageSizes[breakpoint][0];
                    const cover = `${this.imageSizes[screen][0]}x${this.imageSizes[screen][1]}`;
                    const params = `twic=v1/quality=85/focus=${this.focusPoint}/cover=${cover}/resize=${resize}`;
                    sources[breakpoint] = `${url}${hasParams ? '&' : '?'}${params} ${screenBreakpoints[breakpoint]}w`;
                });
        },
    },
    watch: {
        /* wwFront:start */
        screenSize() {
            if (window.__WW_IS_PRERENDER__ && this.$el) {
                const isBackground = this.wwElementState.isBackground;
                const elemOk =
                    (!isBackground && this.$el.querySelector('.image')) ||
                    (isBackground && this.$el.querySelector('.format'));

                if (!elemOk) return null;

                if (!isBackground) {
                    let width = this.$el.querySelector('.image').getBoundingClientRect().width;
                    width += width * 0.2;
                    this.imageSizes[this.screenSize] = [Math.floor(width), 0];
                } else {
                    this.imageSizes[this.screenSize] = [
                        Math.floor(this.$el.querySelector('.format').getBoundingClientRect().width),
                        Math.floor(this.$el.querySelector('.format').getBoundingClientRect().height),
                    ];
                }

                let imgSizeElm = document.getElementById('ww-image-size');
                if (!imgSizeElm) {
                    imgSizeElm = document.createElement('script');
                    imgSizeElm.setAttribute('id', 'ww-image-size');
                    document.head.append(imgSizeElm);
                }
                imgSizeElm.innerText += `window.wwg_imageSize_${this.screenSize}_${this.uid} = ${JSON.stringify(
                    this.imageSizes[this.screenSize]
                )};`;
            }
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
            this.preventEvent(event);
            this.$emit('update', { positionX: 0, positionY: 0, zoom: 1 });

            return false;
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
        resetZoomAndPosition() {
            this.$emit('update', {
                zoom: 1,
                x: 0,
                y: 0,
            });
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
        const screens = ['lg', 'md', 'sm', 'xs'];
        for (const screen of screens) {
            if (window[`wwg_imageSize_${screen}_${this.uid}`]) {
                this.imageSizes[screen] = window[`wwg_imageSize_${screen}_${this.uid}`];
                this.imageSizes[screen][0] = this.imageSizes[screen][0] || 1024;
            }
        }
        /* wwFront:end */
    },
    mounted() {
        /* wwManager:start */
        if (!this.wwElementState.isBackground) {
            this.$el.addEventListener('mousedown', this.startMove);
        }
        /* wwManager:end */
    },
    beforeDestroy() {
        /* wwManager:start */
        if (!this.wwElementState.isBackground) {
            this.$el.removeEventListener('mousedown', this.startMove);
        }
        /* wwManager:end */
    },
};
</script>

<style scoped lang="scss">
.ww-image {
    display: flex;

    &__wrapper {
        cursor: move;
        cursor: grab;
        user-select: none;
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
