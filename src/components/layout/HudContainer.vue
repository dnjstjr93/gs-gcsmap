<template>
    <v-container fluid id="hud-container" class="d-flex flex-column pa-0" :class="{ fsContainer: data.fs }">
        <div :style="topStyle">
            <infos :data="data"/>
        </div>
        <div :style="headerStyle">
            <heading-direction :data="data" ref="hd"/>
        </div>
        <div class="contents">
            <cetr :data="data"/>
            <arm-status :data="data"/>
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
        Infos: () => import('./Informations'),
        HeadingDirection: () => import('./HeadingDirection'),
        Cetr: () => import('./Cetr'),
        ArmStatus: () => import('./ArmStatus'),
        AirSpeed: () => import('./AirSpeed'),
        Altitude: () => import('./Altitude'),
        BottomData: () => import('./BottomData'),
        FlightIndicator: () => import('./FlightIndicator')
    },
    computed: {
        topStyle() {
            if(this.data.isVideo) {
                return ({height: '8%'});
            }
            else {
                return ({height: '8%', background: '#40C4FF'});

            }
        },
        headerStyle() {
            if(this.data.isVideo) {
                return ({height: '10%'});
            }
            else {
                return ({height: '10%', background: '#40C4FF', 'border-top': '1px solid #ffffff'});
            }
        }
    }
}
</script>

<style lang="scss">
//@import '../../assets/index';
@import './node_modules/swiper/swiper.scss';

#hud-container {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    color: white;
    z-index: 0;
    overflow: hidden;
}

.top {
    height: 8%;
}

.header {
    height: 10%;
    border-top: 1px solid #ffffff;
}

.contents {
    position: relative;
    height: 82%;
    z-index: 10;
}

.fsContainer {
    width: 100%;
    left: 50% !important;
    transform: translateX(-50%) !important;
    color: yellow;
}

</style>
