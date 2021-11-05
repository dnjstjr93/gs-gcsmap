<template>
    <div id="hd" :class="{ ruler: true, fsHdIndi: data.fs }">
        <div class="horizontal">
            <div class="mm"></div>
        </div>
        <div :id="`number_hd_${this.data.no}`" class="hdWrapper swiper-container">
      <span class="hdIndicator">
        {{ Math.floor(data.headingDirection) }}
      </span>

            <div class="swiper-wrapper hds">
                <div v-for="n in 360" :key="n" class="hds-item swiper-slide">
                    <span v-if="n === 360">N</span>
                    <span v-else-if="n === 90">E</span>
                    <span v-else-if="n === 180">S</span>
                    <span v-else-if="n === 270">W</span>
                    <span v-else>{{ n % 15 === 0 ? n : null }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Swiper from 'swiper'

export default {
    name: 'HeadingDirection',
    props: ['data'],
    data: () => ({
        swiper: undefined
    }),
    mounted() {
        this.newInit()
    },
    watch: {
        ['data.headingDirection']: function (newVal) {
            let newValue = Math.floor(newVal)
            this.swiper.slideToLoop(newValue, 100)
        }
    },
    computed: {},
    methods: {
        newInit() {
            let name = `#number_hd_${this.data.no}`
            this.swiper = new Swiper(name, {
                loop: true,
                initialSlide: this.data.headingDirection,
                speed: 100,
                grabCursor: false,
                centeredSlides: true,
                freeMode: {
                    enabled: true,
                    sticky: true,
                    momentumVelocityRatio: 0
                },
                breakpoints: {
                    400: {
                        slidesPerView: 100
                    }
                }
            });
        }
    },
}
</script>

<style lang="scss">

#hd {
    position: relative;
    width: 100%;
    height: 10%;
    background-color: rgba(0, 0, 0, 0.3);
    overflow: hidden;
    z-index: 1;
    transform: translateY(60%);

    .hdWrapper {
        position: relative;
        width: 100%;
        height: 100%;
        max-width: 1920px;

        .hdIndicator {
            position: absolute;
            left: 50%;
            top: 0;
            width: 10%;
            height: calc(100% - 2px);
            transform: translateX(-50%);
            pointer-events: none;
            background-color: rgba(0, 0, 0, 0.6);
            box-sizing: border-box;
            text-align: center;
            z-index: 11;
            font-size: 100%;
        }

        .hds {
            height: 100%;

            .hds-item {
                span {
                    display: block;
                    width: 100%;
                    transition: all 0.3s ease-out;
                    font-size: 80%;
                    white-space: nowrap;
                    color: rgba(255, 255, 255, 0.7);
                }
            }
        }
    }

    &.ruler {
        .horizontal {
            position: absolute;
            left: 0;
            bottom: 0;
            width: 100%;
            height: 30%;
            border-bottom: 2px solid #ffffff;

            .mm {
                width: 100%;
                height: 100%;
                background-repeat: repeat;
                background-size: 4.55% 100%;
                background-image: -webkit-linear-gradient(left, #ffffff 1px, transparent 0px);
            }
        }
    }

    // fullscreen css
    &.fsHdIndi {
        height: 8%;

        .horizontal {
            border-bottom: 4px solid #ffffff;
        }

        .hdWrapper {
            .hdIndicator {
                font-size: 180%;
            }

            .hds {
                .hds-item {
                    span {
                        font-size: 160%;
                    }
                }
            }
        }
    }
}

</style>
