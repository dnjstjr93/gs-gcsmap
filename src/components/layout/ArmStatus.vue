<template>
    <v-container id="arm_status" fill-height class="pa-0 ma-n1">
        <v-row no-gutters align="center">
            <v-col cols="12" class="text-center">
                <span class="shadow_icon" :style="fontSize">
                    {{ (data.curArmStatus === 'DISARMED') ? 'DISARMED' : ''}}
                </span>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
export default {
    name: 'ArmStatus',
    props: [ 'data' ],
    computed: {
        fontSize() {
            if(this.data.fs) {
                return {'font-size': '400%', color: 'red'};
            }
            else {
                return {'font-size': '200%', color: 'red'};
            }
        },
    },
}
</script>

<style lang="scss">

#arm_status {
    position: absolute;
    left: 0;
    top: 35%;
    width: 100%;
    height: 10%;
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
    &.fsArmStatus {
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
