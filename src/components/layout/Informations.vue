<template>
    <div id="infos" class="d-flex flex-column" :class="{ fsInfos: data.fs }">
        <div id="bat" class="text-center">
            <v-row no-gutters>
                <v-col cols="2" class="text-left">
                    <v-icon class="shadow_icon pl-1" :style="{color: 'white'}">mdi-satellite-variant</v-icon>
                    <span class="shadow_icon px-1 text--white" :style="{color: 'white'}">{{ data.num_satellites }} </span>                </v-col>
                <v-col cols="2" class="text-left">
                    <v-icon class="shadow_icon pl-1" :style="{color: 'white'}">mdi-access-point</v-icon>
                    <span class="shadow_icon px-1" :style="{color: 'white'}">{{ data.rssi }}</span>
                </v-col>
                <v-col cols="2" class="text-center">
                    <v-icon :class="data.colorLteVal" class="shadow_icon pl-1">{{ data.iconLte }}</v-icon>
                    <span :class="data.colorLteVal" class="shadow_icon px-1">{{ data.curLteVal }}</span>
                </v-col>
                <v-spacer></v-spacer>
                <v-col cols="3" class="text-right">
                    <v-icon :class="data.colorBattery" class="shadow_icon pl-1">{{ data.iconBattery }}</v-icon>
                    <span :class="data.colorBattery" class="shadow_icon px-1" >{{ data.voltageBattery }} V</span>
                </v-col>
                <v-col cols="3" class="text-right">
                    <v-icon class="shadow_icon pl-1" :style="{color: 'white'}">{{ data.iconFlightElapsed }}</v-icon>
                    <span class="shadow_icon px-1" :style="{color: 'white'}">{{ data.flightElapsedTime }}</span>                </v-col>
            </v-row>
        </div>
    </div>

<!--    <div id="infos" class="d-flex justify-end align-center" :class="{ fsInfos: data.fs }">-->
<!--        <div :id="`info_1_${this.data.no}`" class="info_1 d-flex">-->
<!--            <p class="px-2">{{ this.data.gpsTime }}</p>-->
<!--            <p class="px-2">-->
<!--                <v-icon small color="white">mdi-poll</v-icon>-->
<!--                {{ this.data.linkQuality }}%-->
<!--            </p>-->
<!--        </div>-->
<!--        <div id="bat" class="d-flex px-2">-->
<!--            <p class="px-2">Bat {{ data.batState.volt }}v {{ data.batState.per }}%</p>-->
<!--            <p class="flightTime">{{ data.flightTime }}</p>-->
<!--        </div>-->
<!--    </div>-->
</template>

<script>

export default {
    name: 'Infos',
    props: ['data'],
    computed: {}
}
</script>

<style lang="scss">

#infos {
    height: 100%;

    .info_1 {
        p {
            position: relative;

            &::after {
                content: '';
                position: absolute;
                right: 0;
                top: 50%;
                transform: translateY(-50%);
                width: 1px;
                height: 80%;
                background-color: #e8e8e8;
            }
        }
    }

    p {
        &.flightTime {
            background-color: rgba(97, 65, 255, 0.8);
        }
    }

    /* fullscreen css */
    &.fsInfos {
        p {
            font-size: 140%
        }
    }
}

.shadow_icon {
    text-shadow: 0.5px 0.5px 5px #000000;
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

</style>
