<template>
    <v-container id="hud-container" class="d-flex flex-column pa-0" fluid>
        <heading-direction :data="data"/>
<!--        <cetr :data="data"/>-->
        <infos :data="data"/>
        <air-speed :data="data"/>
        <altitude :data="data"/>
        <bottom-data :data="data"/>
        <flight-indicator :data="data"/>
    </v-container>
</template>
<script>
export default {
    name: 'HudContainer',
    props: ['data', 'width', 'height'],
    components: {
        HeadingDirection: () => import('./HeadingDirection'),
        AirSpeed: () => import('./AirSpeed'),
        Altitude: () => import('./Altitude'),
        // Cetr: () => import('./Cetr'),
        Infos: () => import('./Informations'),
        BottomData: () => import('./BottomData'),
        FlightIndicator: () => import('./FlightIndicator')
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
</style>