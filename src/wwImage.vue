<template>
    <div class="ww-image" :class="{ bg: wwElementState.isBackground }" :style="wrapperStyle">
        <!-- wwManager:start -->
        <div class="controls-desktop" v-if="isControlsDisplayed">
            <div class="zoom-bar">
                <div class="zoom-line"></div>
                <div class="zoom-handle" :style="{ top: zoomPercentY + '%' }" @mousedown="startZoomDesktop($event)">
                    <div></div>
                </div>
            </div>
        </div>
        <div class="reset-zoom" @mousedown="resetZoom($event)" v-if="isControlsDisplayed">
            <i class="fa fa-expand" aria-hidden="true"></i>
        </div>
        <div class="format" :style="formatStyle">
            <!-- Background -->
            <div v-if="wwElementState.isBackground" class="image bg" :style="imageStyle"></div>

            <!-- Normal Image -->
            <img v-else draggable="false" class="image" :src="content.url" :alt="content.alt" :style="imageStyle" />
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
        zoomFactor() {
            return Math.sqrt((100 * 100) / (10 - minZoom));
        },
        twicPicsSrc() {
            const hasParams = this.content.url.indexOf('?') !== -1;
            return `https://weweb.twic.pics/${content.url}${hasParams ? '&' : '?'}twic=v1/quality=85/resize=1024`;
        },
        imageStyle() {
            let style = {
                width: `${this.content.zoom > 0 ? this.content.zoom * 100 : 100}%`,
                height: this.wwElementState.isBackground ? '100%' : 'auto',
                filter: this.content.style.filter || null,
                top: '50%',
                left: '50%',
                minHeight: 'none',
            };
            if (this.wwElementState.isBackground) {
                if (!this.backgroundVStyle) {
                    style.backgroundImage = `url(${
                        this.content.disableTwicPics ? this.content.url : this.placeholder
                    })`;
                }
                /* wwManager:start */
                style.backgroundImage = `url(${this.content.url})`;
                /* wwManager:end */

                return style;
            }

            const { x = 0, y = 0 } = this.content.position || {};
            const transform = `translate(${x - 50}%, ${y - 50}%)`;
            style = {
                ...style,
                '-webkit-transform': transform,
                '-moz-transform': transform,
                '-ms-transform': transform,
                '-o-transform': transform,
                transform,
            };

            return style;
        },
        formatStyle() {
            let minWidth = this.content && this.content.style && this.content.style.minWidth
            return {
                minWidth: `${minWidth || 20}px`,
                paddingBottom: this.wwElementState.isBackground ? 0 : `${this.content.ratio}%`,
            };
        },
        wrapperStyle() {
            if (!this.content || !this.content.style || !this.content.style.maxHeight) {
                return { height: '100%' };
            }

            const maxHeight = (parseInt(this.content.style.maxHeight) / this.content.ratio) * 100;
            return { maxHeight: `${maxHeight}px`, height: '100%' };
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
        screenSize() {
            return this.wwFrontState.screenSize;
        },

        /* wwManager:start */
        zoomPercentY() {
            return 100 - this.zoomFactor * Math.sqrt(Math.max(this.content.zoom, 0) - minZoom);
        },
        isControlsDisplayed() {
            return this.wwEditorState.isSelected && !this.wwElementState.isBackground;
        },
        /* wwManager:end */
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
            if (!this.isTouch(event)) {
                event.preventDefault();
                event.stopPropagation();
            }

            return false;
        },
        /* wwManager:start */
        /*=============================================m_ÔÔ_m=============================================\
          IMAGE ZOOM
        \================================================================================================*/
        resetZoom(event) {
            this.preventEvent(event);

            //Reset zoom
            const rectImg = this.$el.querySelector('.image').getBoundingClientRect();
            const imgSize = {
                w: rectImg.width,
                h: rectImg.height,
            };

            const ratio = imgSize.h / imgSize.w;
            let zoom;
            if (this.content.zoom !== 1) {
                zoom = 1;
            } else {
                const rectEl = this.$el.getBoundingClientRect();
                const ratioContainer = rectEl.height / rectEl.width;

                zoom = ratioContainer / ratio;
            }

            this.$emit('update', { position: { x: 0, y: 0 }, zoom });

            return false;
        },
        startZoomDesktop(event) {
            event.preventDefault();
            event.stopPropagation();

            wwLib.wwManagerUI.lockSelection();

            this.zoomBarElement = this.$el.querySelector('.zoom-bar');

            window.addEventListener('mousemove', this.zoomDesktop);
            window.addEventListener('mouseup', this.stopZoomDesktop);

            window.document.body.classList.add('ww-image-dragging');

            return false;
        },
        zoomDesktop(event) {
            let zoomPositionY =
                ((event.clientY - this.zoomBarElement.getBoundingClientRect().top) * 100) /
                this.zoomBarElement.getBoundingClientRect().height;
            zoomPositionY = Math.min(Math.max(zoomPositionY, 0), 100);

            const zoom = Math.pow((100 - zoomPositionY) / this.zoomFactor, 2) + minZoom;

            this.preventEvent(event);

            this.$emit('update', { zoom });

            return false;
        },
        stopZoomDesktop() {
            wwLib.wwManagerUI.unlockSelection();

            window.removeEventListener('mousemove', this.zoomDesktop);
            window.removeEventListener('mouseup', this.stopZoomDesktop);

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
                    position.x += touch.clientX;
                    position.y += touch.clientY;
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
                    y: event.touches[0].clientY,
                };

                var touch1 = {
                    x: event.touches[1].clientX,
                    y: event.touches[1].clientY,
                };

                var dist = Math.sqrt(
                    (touch0.x - touch1.x) * (touch0.x - touch1.x) + (touch0.y - touch1.y) * (touch0.y - touch1.y)
                );
                return dist;
            }
            return 0;
        },
        isTouch(event) {
            return event.touches && event.touches.length;
        },
        startMove(event) {
            if (!this.wwEditorState.isSelected) return;
            if (this.wwEditorState.editMode !== 'CONTENT' || this.wwElementState.isBackground) {
                return;
            }
            if (event.ctrlKey || event.button == 2) {
                return;
            }
            this.isMoving = false;
            wwLib.wwManagerUI.lockSelection();

            this.lastMovePosition = this.getEventPosition(event);
            this.initialPosition = { ...this.content.position };
            if (this.lastMovePosition) {
                wwLib.getFrontDocument().addEventListener('mousemove', this.move);
                wwLib.getManagerDocument().addEventListener('mousemove', this.move);
                wwLib.getFrontDocument().addEventListener('click', this.stopMove);
                wwLib.getManagerDocument().addEventListener('click', this.stopMove);

                wwLib.getFrontDocument().addEventListener('touchmove', this.move);
                wwLib.getManagerDocument().addEventListener('touchmove', this.move);
                wwLib.getFrontDocument().addEventListener('touchend', this.stopMove);
                wwLib.getManagerDocument().addEventListener('touchend', this.stopMove);

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

            const rectImg = this.$el.querySelector('.image').getBoundingClientRect();
            var offsetXpercent = (offsetXpx * 100) / rectImg.width;
            var offsetYpercent = (offsetYpx * 100) / rectImg.height;

            const update = {
                position: {
                    x: this.initialPosition.x + offsetXpercent,
                    y: this.initialPosition.y + offsetYpercent,
                },
            };
            if (this.isTouch(event)) {
                const touchDist = this.getTouchDist(event);
                let zoom = this.content.zoom;
                zoom += ((touchDist - this.lastTouchDist) / 100) * (zoom === 0 ? 1 : zoom);

                if (zoom < minZoom) {
                    zoom = minZoom;
                }
                if (zoom > 10) {
                    zoom = 10;
                }

                update.zoom = zoom;
                this.lastTouchDist = touchDist;
            }

            this.preventEvent(event);
            this.$emit('update', update);
        },
        stopMove() {
            this.isMoving = false;

            wwLib.getFrontDocument().removeEventListener('mousemove', this.move);
            wwLib.getManagerDocument().removeEventListener('mousemove', this.move);
            wwLib.getFrontDocument().removeEventListener('click', this.stopMove);
            wwLib.getManagerDocument().removeEventListener('click', this.stopMove);

            wwLib.getFrontDocument().removeEventListener('touchmove', this.move);
            wwLib.getManagerDocument().removeEventListener('touchmove', this.move);
            wwLib.getFrontDocument().removeEventListener('touchend', this.stopMove);
            wwLib.getManagerDocument().removeEventListener('touchend', this.stopMove);

            this.moveDirection = null;
            window.document.body.classList.remove('ww-image-dragging');

            wwLib.wwManagerUI.unlockSelection();

            return false;
        },
        /* wwManager:end */
    },
    created() {
        /* wwManager:start */
        let url = this.content.url;

        //Replace for prod
        url = url.replace('weweb.twic.pics', 'cdn.weweb.app');
        url = url.replace('wewebapp.s3.eu-west-3.amazonaws.com', 'cdn.weweb.app');

        //Replace for preprod
        url = url.replace('weweb.twic.pics/preprod', 'cdn.weweb.dev');
        url = url.replace('wewebapp-preprod.s3.eu-west-3.amazonaws.com', 'cdn.weweb.dev');

        //Replace for staging
        url = url.replace('weweb.twic.pics/staging', 'cdn.weweb.space');
        url = url.replace('wewebapp-dev.s3.eu-west-3.amazonaws.com', 'cdn.weweb.space');

        if (url != this.content.url) {
            this.$emit('update', { url });
        }
        /* wwManager:end */

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
            this.$el.addEventListener('touchstart', this.startMove);
            this.$el.addEventListener('mousedown', this.startMove);
        }
        /* wwManager:end */
    },
    beforeDestroy() {
        /* wwManager:start */
        if (!this.wwElementState.isBackground) {
            this.$el.removeEventListener('mousedown', this.startMove);
            this.$el.removeEventListener('touchstart', this.startMove);
        }
        /* wwManager:end */
    },
};
</script>

<style scoped lang="scss">
.ww-image {
    position: relative;
    user-select: none;
    display: flex;
    justify-content: center;

    .format {
        width: 100%;
        height: 100%;
        position: relative;
        overflow: hidden;
        min-width: 40px;

        .image {
            position: absolute;
            width: 100%;
            height: 100%;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);

            img {
                width: 100%;
                height: 100%;
            }

            &.bg {
                top: auto;
                left: auto;
                transform: 'none';
                background-repeat: no-repeat;
                background-position: center;
                background-size: cover;
            }
        }
    }
}

/* wwManager:start */

.ww-edit-mode-content {
    .ww-image:not(.bg) {
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
        display: block;
        transition: opacity 0.15s ease;
    }
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
