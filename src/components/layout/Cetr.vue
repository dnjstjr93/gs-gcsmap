<template>
  <div id="cetr" :class="{ 'fsCetr': $store.state.fs }">
    <div class="ticks">
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
    <div class="slider-container">
      <input type="range" class="slider" min="1" max="5" :value="this.data.cetr">
    </div>
  </div>
</template>

<script>
export default {
  name: 'Cetr',
  props: [ 'data' ],
  computed: {
  },
}
</script>