<template>
    <v-container id="bottomWrapper" fill-height class="pa-0 ma-n1">
        <v-row no-gutters align="center">
            <v-col cols="3" class="justify-start td-text-white text-left pt-2">
                <span class="shadow_icon pl-1 text--white" :style="fontSize">
                    <v-icon class="shadow_icon pr-0" :style="iconSize">$mapMarkerDistance</v-icon>
                    {{ data.valueDistance }}
                </span>
            </v-col>
            <v-col cols="3" class="justify-start td-text-white text-left pt-2">
                <span class="shadow_icon pl-1 text--white" :style="fontSize">
                    {{ data.wpYawBehavior }}
                </span>
            </v-col>
            <v-spacer></v-spacer>
            <v-spacer></v-spacer>
            <v-col cols="4" class="justify-end td-text-white text-right">
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

#resp-table {
    width: 100%;
    display: table;
}

#resp-table-header{
    display: table-header-group;
    background-color: gray;
    font-weight: bold;
    font-size: 25px;
}

.table-header-cell{
    display: table-cell;
    padding: 5px;
    text-align: justify;
    border-bottom: 1px solid black;
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