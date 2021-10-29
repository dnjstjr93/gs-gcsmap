<template>
  <div id="infos" class="d-flex flex-column" :class="{ fsInfos: $store.state.fs }">
    <div id="bat" class="text-right">
      <span >Bat {{ data.batState.volt }}v {{ data.batState.per }}%</span>
      <span class="flightTime ml-1">{{ data.flightTime }}</span>
    </div>
    <div :id="`info_1_${this.data.no}`" class="info_1 text-right">
      <span>
        <v-icon small color="white">mdi-poll</v-icon>
        {{ this.data.linkQuality }}%
      </span>
      <span class="mt-n1">{{ this.data.gpsTime }}</span>
    </div>
  </div>
</template>

<script>

export default {
  name: 'Infos',
  props: [ 'data' ],
  computed: {
  }
}
</script>

<style>

</style>