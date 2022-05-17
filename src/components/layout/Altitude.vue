<template>
    <div id="altitude" class="ruler" :class="{ 'fsAltitude': data.fs }">
        <div class="vertical">
            <div class="r0"></div>
        </div>
        <div :id="`number_alt_${this.data.no}`" class="alt-wrapper swiper-container">
        <span class="alt-indicator d-flex justify-center align-center">
            {{ Math.floor(this.data.altitude) }}
        </span>
        <div class="swiper-wrapper alt">
            <div v-for="n in 100" :key="n" class="alt-item swiper-slide">
                <span class="pr-1" :class="{ 'pr-4': data.fs }">{{ n % 5 === 0 ? n : null }}</span>
            </div>
        </div>
        </div>
    </div>
</template>

<script>
import Swiper from 'swiper'

export default {
    name: 'Altitude',
    props: [ 'data' ],
    data: () => ({
        swiper: undefined
    }),
    mounted () {
        this.newInit()
    },
    watch: {
        ['data.altitude']: function (newVal) {
            let newValue = Math.floor(newVal)

            this.setSlides(newValue)
        }
    },
    computed: {
    },
    methods: {
        newInit () {
            let name = `#number_alt_${this.data.no}`
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
                    400:{
                        slidesPerView: 20,
                    },
                }
            });

            this.setSlides(this.data.altitude)
        },

        setSlides (datas) {
            let slides = this.swiper.$el[0].querySelectorAll('.alt-item span')

            for (let i = 0; i < slides.length; i++) {
                let nextValue = datas - i + 49
                if (nextValue % 5 === 0) {
                    slides[i].innerHTML = JSON.stringify(nextValue)
                }
                else {
                    slides[i].innerHTML = ''
                }
            }
        }
    }
}
</script>

<style lang="scss">

#altitude {
    position: absolute;
    right: 5px;
    top: 50%;
    transform: translateY(-50%);
    width: 8%;
    height: 65%;
    background-color:rgba(0,0,0,0.3);
    overflow:hidden;
    z-index: 1;

    &.ruler {
        background-repeat:repeat;
        transition:all 0.3s ease-in;

        .vertical {
            position:absolute;
            top:0;
            left:0;
            width: 20%;

            .r0 {
                width: 100%;
                max-height: 764px;
                height: 100vh;
                background-repeat: repeat;
                background-image:-webkit-linear-gradient(top, #ffffff 1px, transparent 0px);
                background-size:100% 2.32%
            }
        }
    }

    .alt-wrapper {
        position:relative;
        width:100%;
        margin:0 auto;
        height:100%;

        &:before,
        &:after {
            content:"";
            display:block;
            position:absolute;
            left:0;
            width:100%;
            height:4%;
            z-index: 2
        }

        .alt-indicator {
            position: absolute;
            left: 0;
            width:100%;
            height:15%;
            top: 50%;
            transform:translateY(-50%);
            pointer-events:none;
            background-color:rgba(0,0,0,0.6);
            box-sizing:border-box;
            z-index: 3;
            font-size: 100%;
        }

        .alt {
            height: 100%;

            .alt-item {
                position:relative;
                width:100%;
                display:flex;
                align-items: center;
                text-align:right;

                span {
                    display: block;
                    width: 100%;
                    transition: all 0.3s ease-out;
                    font-size: 70%;
                    white-space: nowrap;
                }
            }
        }
    }

    /* fullscreen css */
    &.fsAltitude {
        .alt-wrapper {
            .alt-indicator {
                font-size: 180%;
            }

            .alt {
                .alt-item {
                    span {
                        font-size: 160%;
                    }
                }
            }
        }
    }
}

</style>