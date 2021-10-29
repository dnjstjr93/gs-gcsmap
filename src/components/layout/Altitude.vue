<template>
  <div id="altitude" class="ruler" :class="{ 'fsAltitude': $store.state.fs }">
    <div class="vertical">
      <div class="r0"></div>
    </div>
    <div :id="`number_alt_${this.data.no}`" class="alt-wrapper swiper-container">
      <span class="alt-indicator d-flex justify-center align-center">
        {{ Math.floor(this.data.altitude) }}
      </span>
      <div class="swiper-wrapper alt">
        <div v-for="n in 100" :key="n" class="alt-item swiper-slide">
          <span class="pr-1" :class="{ 'pr-4': $store.state.fs }">{{ n % 5 === 0 ? n : null }}</span>
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
      let slides = this.swiper.$el[0].querySelectorAll('.alt-item span')

      for (let i = 0; i < slides.length; i++) {
        let nextValue = newValue - i + 49
        if (nextValue % 5 === 0) {
          slides[i].innerHTML = JSON.stringify(nextValue)
        } else {
          slides[i].innerHTML = ''
        }
      }
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
    }
  }
}
</script>

<style>

</style>