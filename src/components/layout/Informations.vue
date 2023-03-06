<template>
    <v-container id="infos" fill-height class="pa-0 ma-0" :class="{ fsInfos: data.fs }">
<!--    <div id="infos" class="d-flex flex-column" :class="{ fsInfos: data.fs }">-->
<!--        <div id="bat" class="text-center">-->
            <v-row no-gutters align="center">
                <v-col cols="2" class="td-text-white text-left">
                    <span class="shadow_icon pl-1 text--white" :style="fontSize">
                        <v-icon class="shadow_icon pr-1" :style="iconSize">$satelliteVariant</v-icon>
                        {{ data.num_satellites }}
                    </span>
                </v-col>
                <v-col cols="2" class="text-left">
                    <span class="shadow_icon pl-1" :style="fontSize">
                        <v-icon class="shadow_icon pr-1" :style="iconSize">$accessPoint</v-icon>
                        {{ data.rssi }}
                    </span>
                </v-col>
                <v-spacer></v-spacer>
                <v-col cols="2" class="text-center">
                    <span class="shadow_icon px-1" :style="lteFontSize">
                        <v-icon class="shadow_icon pr-1" :style="lteIconSize">{{ data.iconLte }}</v-icon>
                        {{ data.curLteVal }}
                    </span>
                </v-col>
                <v-col cols="3" class="text-right">
                    <span class="shadow_icon pr-1" :style="batFontSize">
                        <v-icon class="shadow_icon pr-1" :style="batIconSize">{{ data.iconBattery }}</v-icon>
                        {{ data.voltageBattery }} V
                    </span>
                </v-col>
                <v-col cols="3" class="text-right">
                    <span class="shadow_icon pr-1" :style="fontSize">
                        <v-icon class="shadow_icon pr-1" :style="iconSize">{{ data.iconFlightElapsed }}</v-icon>
                        {{ data.flightElapsedTime }}
                    </span>
                </v-col>
            </v-row>
<!--        </div>-->
<!--    </div>-->
    </v-container>

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
    computed: {
        fontSize() {
            if(this.data.fs) {
                return {'font-size': '250%', color: 'white'};
            }
            else {
                return {'font-size': '100%', color: 'white'};
            }
        },

        lteFontSize() {
            if(this.data.fs) {
                return {'font-size': '250%', color: this.data.colorLteVal};
            }
            else {
                return {'font-size': '100%', color: this.data.colorLteVal};
            }
        },

        batFontSize() {
            if(this.data.fs) {
                return {'font-size': '250%', color: this.data.colorBattery};
            }
            else {
                return {'font-size': '100%', color: this.data.colorBattery};
            }
        },

        iconSize() {
            if(this.data.fs) {
                return {'font-size': '150%', color: 'white'};
            }
            else {
                return {'font-size': '130%', color: 'white'};
            }
        },

        lteIconSize() {
            if(this.data.fs) {
                return {'font-size': '150%', color: this.data.colorLteVal};
            }
            else {
                return {'font-size': '130%', color: this.data.colorLteVal};
            }
        },

        batIconSize() {
            if(this.data.fs) {
                return {'font-size': '150%', color: this.data.colorBattery};
            }
            else {
                return {'font-size': '130%', color: this.data.colorBattery};
            }
        },

    }
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
        p, span{
            font-size: 200%
        }
    }
}

.shadow_icon {
    text-shadow: 2px 2px 8px #000000;
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

.td-text-white {
    color: white;
}

</style>
