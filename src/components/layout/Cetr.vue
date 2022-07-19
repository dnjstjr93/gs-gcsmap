<template>
    <v-container id="cetr" fill-height class="pa-0 ma-n1">
        <v-row no-gutters align="center">
            <v-col cols="6" class="td-text-white text-left">
                <span class="shadow_icon pl-1 text--white" :style="fontSize">
                    <v-icon class="shadow_icon pr-0" :style="iconSize">mdi-speedometer</v-icon>
                    {{ data.airSpeed }} m/s
                </span>
            </v-col>
            <v-col cols="6" class="td-text-white text-right">
                <span class="shadow_icon pr-2 text--white" :style="fontSize">
                    <v-icon class="shadow_icon pr-0" :style="iconSize">mdi-altimeter</v-icon>
                    {{ data.altitude }} m ({{ data.absolute_altitude }})
                </span>
            </v-col>
        </v-row>
    </v-container>
<!--    <div id="cetr" :class="{ 'fsCetr': data.fs }">-->
<!--        <div class="ticks">-->
<!--            <div></div>-->
<!--            <div></div>-->
<!--            <div></div>-->
<!--            <div></div>-->
<!--            <div></div>-->
<!--        </div>-->
<!--        <div class="slider-container">-->
<!--            <input type="range" class="slider" min="1" max="5" :value="this.data.cetr">-->
<!--        </div>-->
<!--    </div>-->
</template>

<script>
export default {
    name: 'Cetr',
    props: [ 'data' ],
    computed: {
        fontSize() {
            if(this.data.fs) {
                return {'font-size': '270%', color: 'white'};
            }
            else {
                return {'font-size': '100%', color: 'white'};
            }
        },

        iconSize() {
            if(this.data.fs) {
                return {'font-size': '140%', color: 'white'};
            }
            else {
                return {'font-size': '130%', color: 'white'};
            }
        },
    },
}
</script>

<style lang="scss">

#cetr {
    position: absolute;
    left: 5px;
    top: 5%;
    width: 100%;
    height: 5%;
    z-index: 1;

    .ticks {
        display:flex;
        justify-content:space-between;
        width: 100%;
        height: 100%;
        counter-reset:count -1;

        div {
            width: 5%;
            height: 100%;
            background: #fff;
            counter-increment: count 1
        }
    }

    .slider-container {
        width:100%;
        margin-top: -10px;

        .slider {
            -webkit-appearance:none;
            -moz-appearance:none;
            width: 100%;
            height: .2vw;
            background:#fff;
            outline:none;
            -webkit-transition:0.2s;
            transition:opacity 0.2s;
            pointer-events: none;
        }

        input[type="range"],
        input[type="range"]::-moz-range-track {
            -webkit-appearance:none;
            -moz-appearance:none;
            width: 20px;
            background: #00e300;
            outline:none;
            transition:opacity 0.2s
        }
        input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance:none;
            appearance:none;
            width: 3px;
            height: 30px;
            background: #00e300;
            cursor:pointer;
            outline:none;
            margin-bottom: 15px;
        }
        input[type="range"]::-moz-range-thumb {
            -moz-appearance:none;
            appearance:none;
            width: 3px;
            height: 30px;
            background: #00e300;
            cursor:pointer;
            outline:none;
            z-index:10
        }
        input[type="range"]:focus { outline:none; }
    }

    // fullscreen css
    &.fsCetr {
        top: 12%;

        .slider-container {
            margin-top: 0;

            input[type="range"]::-webkit-slider-thumb {
                -webkit-appearance:none;
                appearance:none;
                width: 9px;
                height: 80px;
                background: #00e300;
                cursor:pointer;
                outline:none;
                margin-bottom: 50px;
            }
            input[type="range"]::-moz-range-thumb {
                -moz-appearance:none;
                appearance:none;
                width: 9px;
                height: 80px;
                background: #00e300;
                cursor: pointer;
                outline: none;
                z-index: 10
            }
        }
    }
}

</style>
