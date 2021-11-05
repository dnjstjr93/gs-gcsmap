<template>
<!--    <div id="infos" class="d-flex flex-column" :class="{ fsInfos: data.fs }">-->
<!--        <div id="bat" class="text-center">-->
<!--            <v-row no-gutters>-->
<!--                <v-col cols="3">-->
<!--                    <span>Bat {{ data.batState.volt }}v {{ data.batState.per }}%</span>-->
<!--                </v-col>-->
<!--                <v-spacer></v-spacer>-->
<!--                <v-col cols="3">-->
<!--                    <span class="flightTime ml-1">{{ data.flightTime }}</span>-->
<!--                </v-col>-->
<!--                <v-col cols="3">-->
<!--                    <span><v-icon small color="white">mdi-poll</v-icon>{{ this.data.linkQuality }}%</span>-->
<!--                </v-col>-->
<!--                <v-col cols="3">-->
<!--                    <span class="mt-n1">{{ this.data.gpsTime }}</span>-->
<!--                </v-col>-->
<!--            </v-row>-->
<!--        </div>-->
<!--    </div>-->

    <div id="infos" class="d-flex justify-end align-center" :class="{ fsInfos: data.fs }">
        <div :id="`info_1_${this.data.no}`" class="info_1 d-flex">
            <p class="px-2">{{ this.data.gpsTime }}</p>
            <p class="px-2">
                <v-icon small color="white">mdi-poll</v-icon>
                {{ this.data.linkQuality }}%
            </p>
        </div>
        <div id="bat" class="d-flex px-2">
            <p class="px-2">Bat {{ data.batState.volt }}v {{ data.batState.per }}%</p>
            <p class="flightTime">{{ data.flightTime }}</p>
        </div>
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

</style>