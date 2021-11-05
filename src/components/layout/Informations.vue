<template>
    <div id="infos" class="d-flex flex-column" :class="{ fsInfos: data.fs }">
        <div id="bat" class="text-center">
            <v-row no-gutters>
                <v-col cols="3">
                    <span>Bat {{ data.batState.volt }}v {{ data.batState.per }}%</span>
                </v-col>
                <v-spacer></v-spacer>
                <v-col cols="3">
                    <span class="flightTime ml-1">{{ data.flightTime }}</span>
                </v-col>
                <v-col cols="3">
                    <span><v-icon small color="white">mdi-poll</v-icon>{{ this.data.linkQuality }}%</span>
                </v-col>
                <v-col cols="3">
                    <span class="mt-n1">{{ this.data.gpsTime }}</span>
                </v-col>
            </v-row>
        </div>
    <!--        <div :id="`info_1_${this.data.no}`" class="info_1 text-right">-->
<!--            <span><v-icon small color="white">mdi-poll</v-icon>{{ this.data.linkQuality }}%</span>-->
<!--            <span class="mt-n1">{{ this.data.gpsTime }}</span>-->
<!--        </div>-->
    </div>
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
    position: absolute;
    left: 1%;
    top: -1%;
    z-index: 1;
    width: 100%;

    span {
        font-size: 85%;

        &.flightTime {
            background-color: rgba(97, 65, 255, 0.8);
            padding: 0 1px;
        }
    }

    .info_1 {
        span {
            display: block;
        }
    }

    /* fullscreen css */
    &.fsInfos {
        span {
            font-size: 140%
        }
    }
}

</style>