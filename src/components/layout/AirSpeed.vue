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
  props: [ 'data'],
  data: () => ({
    swiper: undefined
  }),
  mounted () {
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
          400:{
            slidesPerView: 20
          },
        }
      });
    }
  },
}
</script>

<style>
</style>