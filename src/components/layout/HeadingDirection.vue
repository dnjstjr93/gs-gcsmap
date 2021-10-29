<template>
    <div id="hd" :class="{ ruler: true, fsHdIndi: $store.state.fs }">
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