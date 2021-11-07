<template>
    <div>
        <div class="py-0">
            <Heading :size="heading_size" :heading="heading"/>
            <v-fade-transition>
                <v-avatar
                    v-if="isPlaying"
                    :color="bpm_color"
                    :style="{animationDuration: animationDuration, top: '1px', left: (myWidth/2-12)+'px'}"
                    class="mt-1 ml-1 v-avatar--metronome"
                    size="14"
                ></v-avatar>
            </v-fade-transition>
            <Attitude :size="attitude_size" :roll="roll" :pitch="pitch"/>
        </div>

        <div class="info_position align-self-center" :style="{top: 0, left: 0}">
            <v-input :style="{'font-size': '26px'}" :class="colorMode" :color="$store.state.drone_infos[name].color"
                     class="shadow_icon px-1">{{ curMode }}</v-input>
        </div>

        <div class="info_position" :style="{top: (hud_gap*2)+'px', left: 0}">
            <v-icon class="shadow_icon pl-1" :style="{color: 'white'}">mdi-satellite-variant
            </v-icon>
            <span class="shadow_icon px-1 text--white"
                  :style="{color: 'white'}">{{ num_satellites }} </span>
        </div>

        <div class="info_position" :style="{top: (hud_gap*3)+'px', left: 0}">
            <v-icon :class="colorLteVal" :style="iconSize" class="shadow_icon pl-1">{{
                    iconLte
                }}
            </v-icon>
            <span :class="colorLteVal" :style="fontSize" class="shadow_icon px-1">{{
                    curLteVal
                }}</span>
        </div>

        <div class="info_position" :style="{top: (hud_gap*4)+'px', left: 0}">
            <v-icon class="shadow_icon pl-1" :style="{color: 'white'}">mdi-access-point</v-icon>
            <span class="shadow_icon px-1" :style="{color: 'white'}">{{ rssi }}</span>
        </div>

        <div class="info_position" :style="{top: (hud_gap*5)+'px', left: 0}">
            <v-icon class="shadow_icon pl-1" :style="{color: 'white'}">{{
                    iconFlightElapsed
                }}
            </v-icon>
            <span class="shadow_icon px-1" :style="{color: 'white'}">{{
                    flightElapsedTime
                }}</span>
        </div>

        <div class="info_position text-center" :style="{top: (hud_gap*6)+'px', left: 0}">
            <span class="shadow_icon px-2" :style="{color: 'white'}">{{curLat}}:{{curLng}}:<span style="font-size: 20px">{{curRelativeAlt}}</span> ({{ curAlt }})</span>
        </div>

        <div class="info_position"
             :style="{top: 0, left: ((curArmStatus==='ARMED')?(myWidth-110):(myWidth-138))+'px'}">
            <v-input :style="{'font-size': '26px'}" :class="colorArm" :color="$store.state.drone_infos[name].color"
                     class="shadow_icon px-1">{{ curArmStatus }}</v-input>
        </div>

        <div class="info_position" :style="{top: (hud_gap*2)+'px', left: (myWidth-110)+'px'}">
            <v-icon :class="colorBattery" :style="iconSize" class="shadow_icon pl-1">
                {{ iconBattery }}
            </v-icon>
            <span class="shadow_icon px-1" :class="colorBattery">{{
                    voltageBattery
                }} V</span>
        </div>

        <div class="info_position" :style="{top: (hud_gap*3)+'px', left: (myWidth-110)+'px'}">
            <v-icon class="shadow_icon pl-1" :style="{color: 'white'}">mdi-altimeter</v-icon>
            <span class="shadow_icon px-1" :style="{color: 'white'}">{{ curRelativeAlt }} m</span>
        </div>

        <div class="info_position" :style="{top: (hud_gap*4)+'px', left: (myWidth-110)+'px'}">
            <v-icon class="shadow_icon pl-1" :style="{color: 'white'}">mdi-speedometer</v-icon>
            <span class="shadow_icon px-1" :style="{color: 'white'}">{{ airspeed }} m/s</span>
        </div>

        <div class="info_position" :style="{top: (hud_gap*5)+'px', left: (myWidth-110)+'px'}">
            <v-icon class="shadow_icon pl-1" :style="{color: 'white'}">{{
                    iconDistance
                }}
            </v-icon>
            <span class="shadow_icon px-1" :style="{color: 'white'}">{{valueDistance}}</span>
        </div>
    </div>
</template>

<script>

import {Attitude, Heading} from 'vue-flight-indicators'

export default {
    name: "DroneInfoBox",

    components: {
        Attitude,
        Heading,
    },

    props: [
        'name',
        'heading',
        'heading_size',
        'myWidth',
        'attitude_size',
        'curMode',
        'colorMode',
        'num_satellites',
        'colorLteVal',
        'roll',
        'pitch',
        'iconLte',
        'curLteVal',
        'rssi',
        'iconFlightElapsed',
        'flightElapsedTime',
        'curLat',
        'curLng',
        'curAlt',
        'curRelativeAlt',
        'curArmStatus',
        'colorArm',
        'colorBattery',
        'iconBattery',
        'voltageBattery',
        'airspeed',
        'iconDistance',
        'valueDistance',
        'bpm_color',
        'animationDuration',
    ],

    data() {
        return {
            hud_gap: 31,
            isPlaying: true,
        }
    },

    computed: {
        iconSize() {
            console.log(this.$vuetify.breakpoint.name);
            switch (this.$vuetify.breakpoint.name) {
                case 'xs':
                    return ("font-size: 16px");
                case 'sm':
                    return ("font-size: 18px");
                case 'md':
                    return ("font-size: 20px");
                case 'lg':
                    return ("font-size: 22px");
                case 'xl':
                    return ("font-size: 24px");
                default:
                    return ("font-size: 16px");
            }
        },
        fontSize() {
            console.log(this.$vuetify.breakpoint.name);
            switch (this.$vuetify.breakpoint.name) {
                case 'xs':
                    return ("font-size: 14px");
                case 'sm':
                    return ("font-size: 15px");
                case 'md':
                    return ("font-size: 16px");
                case 'lg':
                    return ("font-size: 17px");
                case 'xl':
                    return ("font-size: 18px");
                default:
                    return ("font-size: 16px");
            }
        },
    },

    watch: {
    }
}
</script>

<style scoped>

.indicator-gray {
    background-color: lightgray;
}

.indicator-green {
    background-color: lightgreen;
}

.indicator-text-gray {
    color: grey;
}

.indicator-text-black {
    color: white;
}

.td-text-blue {
    color: #82B1FF;
}

.td-text-green {
    color: #CCFF90;
}

.td-text-yellow {
    color: #FFFF8D;
}

.td-text-red {
    color: #FF8A80;
}

.td-text-gray {
    color: lightgray;
}

.td-text-black {
    color: white;
}

.indicator-border-gray {
    border: 1px solid lightgray;
}

.indicator-border-green {
    border: 1px solid darkblue;
}

.container {
    width: 100%;
    height: 100%;
    position: relative;
    margin: 0;
}

.box {
    width: 100%;
    height: 100%;
}

.overlay_box {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    opacity: 0.8; /* for demo purpose  */
}

.stack-top {
    z-index: 9;
    margin: 0; /* for demo purpose  */
}

.arm-status-gray {
    color: lightgray;
    background-color: lightgrey;
}

.arm-status-green {
    color: greenyellow;
    background-color: #263238;
}

.wrapper-block {
    max-width: 700px;
    height: 200px;
    margin: 10px auto;
    padding: 10px;
    background-color: #fff;
    /*This prevents the margins to collapse.*/
    /*overflow:hidden;*/
    position: relative;
}

.center.block-unknown-height {
    padding: 30px;
    position: absolute;
    top: 50%;
    /*요소의 높이의 반 만큼 위로 이동*/
    transform: translateY(-50%);
}

#rounded-card {
    border-radius: 50%;
}

@keyframes metronome-example {
    from {
        transform: scale(.5);
    }

    to {
        transform: scale(1);
    }
}

.v-avatar--metronome {
    animation-name: metronome-example;
    animation-iteration-count: infinite;
    animation-direction: alternate;
    position: absolute;
    opacity: 0.9; /* for demo purpose  */
}

.info_position {
    position: absolute;
    opacity: 1; /* for demo purpose  */
}

.no-scroll {
    overflow: hidden;
}

.shadow {
    text-shadow: 1px 1px #000000;
}

.shadow_icon {
    text-shadow: 0.5px 0.5px 5px #000000;
}


</style>
