<template>
    <div id="airspeed" class="ruler" :class="{ 'fsAirSpeed': data.fs }">
        <div class="vright">
            <div class="r0"></div>
        </div>
        <div :id="`number_as_${this.data.no}`" class="as-wrapper swiper-container">
      <span class="as-indicator d-flex justify-center align-center">
        {{ Math.floor(data.airSpeed) }}
      </span>
            <div class="swiper-wrapper airspd">
                <div v-for="n in 100" :key="n" class="as-item swiper-slide">
                    <span class="pl-1" :class="{ 'pl-4': data.fs }">{{ n % 5 === 0 ? n : null }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Swiper from 'swiper'

export default {
    name: 'AirSpeed',
    props: ['data'],
    data: () => ({
        swiper: undefined
    }),
    mounted() {
        this.newInit()
    },
    watch: {
        ['data.airSpeed']: function (newVal) {
            let newValue = Math.floor(newVal)
            let slides = this.swiper.$el[0].querySelectorAll('.as-item span')

            for (let i = 0; i < slides.length; i++) {
                let nextValue = newValue - i + 49
                if (nextValue % 5 === 0) {
                    slides[i].innerHTML = JSON.stringify(nextValue)
                }
                else {
                    slides[i].innerHTML = ''
                }
            }
        }
    },
    computed: {},
    methods: {
        newInit() {
            let name = `#number_as_${this.data.no}`
            this.swiper = new Swiper(name, {
                loop: false,
                direction: "vertical",
                initialSlide: 50 - 1,
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
                        slidesPerView: 20
                    },
                }
            });
        }
    },
}
</script>

<style lang="scss">

#airspeed {
    position: absolute;
    left: 5px;
    top: 28%;
    width: 8%;
    height: 60%;
    background-color: rgba(0, 0, 0, 0.3);
    overflow: hidden;
    z-index: 1;

    &.ruler {
        background-repeat: repeat;
        transition: all 0.3s ease-in;

        .vright {
            position: absolute;
            top: 0;
            right: 0;
            width: 20%;

            .r0 {
                width: 100%;
                max-height: 764px;
                height: 100vh;
                background-repeat: repeat;
                background-image: -webkit-linear-gradient(top, #ffffff 1px, transparent 0px);
                background-size: 100% 2.32%
            }
        }

        .as-wrapper {
            position: relative;
            width: 100%;
            margin: 0 auto;
            height: 100%;

            &:before {
                content: "";
                display: block;
                position: absolute;
                left: 0;
                width: 100%;
                height: 10%;
                z-index: 2
            }

            .as-indicator {
                position: absolute;
                left: 0;
                width: 100%;
                height: 15%;
                top: 50%;
                transform: translateY(-50%);
                pointer-events: none;
                background-color: rgba(0, 0, 0, 0.6);
                box-sizing: border-box;
                z-index: 3;
                font-size: 85%
            }

            .airspd {
                height: 100%;

                .as-item {
                    position: relative;
                    width: 100%;
                    display: flex;
                    align-items: center;
                    text-align: left;

                    span {
                        display: block;
                        width: 100%;
                        transition: all 0.3s ease-out;
                        font-size: 70%;
                    }
                }
            }
        }
    }

    /* fullscreen css */
    &.fsAirSpeed {
        top: 23%;
        height: 65%;

        .as-wrapper {
            .as-indicator {
                font-size: 180%
            }

            .airspd {
                .as-item {
                    span {
                        font-size: 160%;
                    }
                }
            }
        }
    }
}
</style>