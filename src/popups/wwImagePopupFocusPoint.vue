<template>
    <div class="ww-popup-focuspoint">
        <div class="content">
            <div class="description">{{ description }}</div>
            <div class="image-container" @click="setFocusPoint">
                <img class="image" :src="imgSrc" />
                <div class="cursor" :style="cursorPosition">+</div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'wwImagePopupFocusPoint',
    props: {
        options: { type: Object },
    },
    data() {
        return {
            selectedPoint: {
                x: this.options.data.content.focusPoint[0],
                y: this.options.data.content.focusPoint[1],
            },
        };
    },
    computed: {
        imgSrc() {
            return this.options.data.content.url;
        },
        cursorPosition() {
            return {
                top: this.selectedPoint.y + '%',
                left: this.selectedPoint.x + '%',
            };
        },
        description() {
            return wwLib.wwManagerLang.getText({
                en: 'Select a focus point that should always be visible',
                fr: 'Selectionner un point focal qui devrait toujours être visible',
            });
        },
    },
    methods: {
        setFocusPoint(event) {
            const image = this.$el.querySelector('.image').getBoundingClientRect();
            const position = this.getEventPosition(event);
            const relativePosition = { x: position.x - image.left, y: position.y - image.top };

            this.selectedPoint = {
                x: (relativePosition.x * 100) / image.width,
                y: (relativePosition.y * 100) / image.height,
            };

            this.options.result.focusPoint = [this.selectedPoint.x, this.selectedPoint.y];
        },
        isTouch(event) {
            return event.touches && event.touches.length;
        },
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
    },
};
</script>

<style scoped lang="scss">
.ww-popup-focuspoint {
    display: flex;
    justify-content: center;
    .content {
        width: 100%;
        padding-top: 20px;

        @media (min-width: 768px) {
            width: 90%;
        }
        @media (min-width: 992px) {
            width: 60%;
        }
        @media (min-width: 1200px) {
            width: 600px;
        }

        .description {
            padding-bottom: 20px;
        }

        .image-container {
            width: 100%;
            position: relative;

            .image {
                width: 100%;
                cursor: pointer;
            }

            .cursor {
                position: absolute;
                color: white;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                cursor: pointer;
                font-size: 30px;
                text-shadow: 0 0 5px black;
            }
        }
    }
}
</style>
