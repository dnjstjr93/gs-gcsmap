<template>
    <v-container fluid id="hud-container" class="d-flex flex-column pa-0" :class="{ fsContainer: data.fs }">
        <div class="top">
            <infos :data="data"/>
        </div>
        <div class="header">
            <heading-direction :data="data" ref="hd"/>
        </div>
        <div class="contents">
            <cetr v-if="false" :data="data"/>
            <air-speed :data="data" ref="as"/>
            <altitude :data="data" ref="alt"/>
            <bottom-data :data="data"/>
            <flight-indicator :data="data"/>
        </div>
    </v-container>
</template>

<script>
export default {
    name: 'HudContainer',
    props: ['data'],
    components: {
        HeadingDirection: () => import('./HeadingDirection'),
        AirSpeed: () => import('./AirSpeed'),
        Altitude: () => import('./Altitude'),
        Cetr: () => import('./Cetr'),
        Infos: () => import('./Informations'),
        BottomData: () => import('./BottomData'),
        FlightIndicator: () => import('./FlightIndicator')
    },
    methods: {
        newInit() {
            this.$refs.hd.newInit()
            this.$refs.as.newInit()
            this.$refs.alt.newInit()
        }
    }
}
</script>

<style lang="scss">
@import '../../assets/index';
@import './node_modules/swiper/swiper.scss';

#hud-container {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    color: white;
}

.top {
    height: 8%;
    background: skyblue;
}

.header {
    height: 10%;
    border-top: 1px solid #ffffff;
    background: skyblue;
}

.contents {
    position: relative;
    height: 82%;
}

.fsContainer {
    left: 50% !important;
    transform: translateX(-50%) !important;
    width: 1536px !important;
    color: yellow;
}
</style>