<template>
    <v-container id="bottomWrapper" fill-height class="pa-0 ma-n1">
        <v-row no-gutters align="center">
            <v-col cols="6" class="td-text-white text-left">
                <span class="shadow_icon pl-1 text--white" :style="fontSize">
                    <v-icon class="shadow_icon pr-0" :style="iconSize">mdi-map-marker-distance</v-icon>
                    {{ data.valueDistance }}
                </span>
            </v-col>
            <v-col cols="6" class="td-text-white text-right">
                <span class="shadow_icon pr-2 text--white" :style="modeFontSize">
                    {{ data.curMode }}
                </span>
            </v-col>
        </v-row>
    </v-container>
<!--    <div id="bottomWrapper" class="px-2" :class="{ 'px-4': data.fs, 'fsBottom': data.fs }">-->
<!--        <div id="speeds">-->
<!--            <span>{{ this.data.wayPoint.distance }} {{ this.compare }} {{ this.data.wayPoint.number }}</span>-->
<!--        </div>-->
<!--        <div id="mode">-->
<!--            <span>{{ this.data.flightMode }}</span>-->
<!--        </div>-->
<!--    </div>-->
</template>

<script>
export default {
    name: 'BottomData',
    props: [ 'data' ],
    computed: {
        compare () {
            return this.data.wayPoint.distance >= this.data.wayPoint.number ? '>' : '<'
        },

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

        modeFontSize() {
            if(this.data.fs) {
                return {'font-size': '270%', color: this.data.colorMode};
            }
            else {
                return {'font-size': '160%', color: this.data.colorMode};
            }
        },

    }
}
</script>

<style lang="scss">

#bottomWrapper {
    position: absolute;
    left: 5px;
    top: 86%;
    width: 100%;
    height: 5%;
    z-index: 1;
}
//
//#bottomWrapper {
//    position: absolute;
//    bottom: 3%;
//    width: 100%;
//    display: flex;
//    justify-content: space-between;
//    z-index: 1;
//
//    div {
//        span {
//            font-size: 80%;
//        }
//    }
//
//    &.fsBottom {
//        //bottom: 6%;
//
//        div {
//            span {
//                font-size: 160%;
//            }
//        }
//    }
//}

</style>