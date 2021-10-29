<template>
  <div :class="{ lineWrap: true, fsLineWrap: $store.state.fs }" :style="setRoll">
    <div v-for="n in 10" :key="n" class="lines d-flex justify-center align-center">
      <span class="number">{{ n % 2 !== 0 ? 20 - ((n - 1) * 5) : null }}</span>
      <div class="line"></div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'lines',
  props: [ 'data' ],
  data: () => ({
    spans: undefined
  }),
  watch: {
    ['data.anglePitch']: function (newVal) {
      let plus = 10 - Math.ceil(newVal) % 10
      this.spans.forEach((el, index) => {
        if (index % 2 === 0) {
          el.innerHTML = Math.ceil(newVal) - (index * 5) + 10 + plus
        } else {
          el.innerHTML = ''
        }
      })
    }
  },
  mounted() {
    this.getSpans()
  },
  computed: {

    setRoll () {
      let value = Math.floor(this.data.bankAngle)
      if (value < 0) {
        if (value >= -90) {
          return `transform: translate(-50%, -50%) rotate(${value / 3.5}deg)`
        } else {
          return 'transform: translate(-50%, -50%) rotate(-18deg)'
        }
      } else {
        if (value <= 90) {
          return `transform: translate(-50%, -50%) rotate(${value / 3.5}deg)`
        } else {
          return 'transform: translate(-50%, -50%) rotate(18deg)'
        }
      }
    }
  },
  methods: {
    getSpans () {
      this.spans = document.querySelectorAll('.number')
    }
  }
}
</script>

<style>
</style>