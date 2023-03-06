<template>
    <v-card flat>
        <v-snackbar v-model="snackbar" absolute top right color="success">
            <span>Action successful!</span>
            <v-icon dark right>
                $checkboxMarkedCircle
            </v-icon>
        </v-snackbar>
        <v-form ref="form" @submit.prevent="submit">
            <v-card tile flat>
                <v-row align="center" justify="center">
                    <v-col cols="12">
                        <v-card flat tile>
                            <v-row align="center" justify="center">
                                <v-col cols="1">
                                    <v-text-field
                                        label="고도(m)"
                                        v-model="paramAlt"
                                        class="mt-3 pt-0"
                                        type="number"
                                        outlined dense hide-details readonly filled
                                        color="amber"
                                    ></v-text-field>
                                </v-col>
                                <v-col cols="1">
                                    <v-text-field
                                        label="위도"
                                        v-model="paramLat"
                                        class="mt-3 pt-0"
                                        type="number"
                                        outlined dense hide-details readonly filled
                                        color="amber"
                                    ></v-text-field>
                                </v-col>
                                <v-col cols="1">
                                    <v-text-field
                                        label="경도"
                                        v-model="paramLng"
                                        class="mt-3 pt-0"
                                        type="number"
                                        outlined dense hide-details readonly filled
                                        color="amber"
                                    ></v-text-field>
                                </v-col>
                            </v-row>
                        </v-card>
                    </v-col>
                </v-row>
            </v-card>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn text @click="resetForm" outlined>
                    Close
                </v-btn>
                <v-spacer></v-spacer>
                <v-btn text color="warning" fab dark @click="deleteMarker" outlined>
                    <v-icon>$delete</v-icon>
                </v-btn>
                <v-spacer></v-spacer>
            </v-card-actions>
        </v-form>
    </v-card>
</template>

<script>
    import axios from "axios";

    export default {
        name: "InfoLossMarker",

        props: [
            'value',
            'markerIndex',
        ],

        data() {
            return {
                paramLat: 10,
                paramAlt: 100,
                paramLng: 5,

                snackbar: false,
            }
        },

        watch: {
        },

        computed: {
        },

        methods: {
            deleteMarker() {
                delete this.$store.state.loss_lte_infos[this.markerIndex];

                this.postEachLossMarkerInfo();

                this.snackbar = true;

                setTimeout(() => {
                    this.resetForm();
                }, 100);
            },

            resetForm() {
                this.$emit('input', false);
            },

            postEachLossMarkerInfo() {
                axios({
                    validateStatus: function (status) {
                        // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                        return status < 500;
                    },
                    method: 'post',
                    url: 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/LossLteInfos',
                    headers: {
                        'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                        'X-M2M-Origin': 'SVue',
                        'Content-Type': 'application/json;ty=4'
                    },
                    data: {
                        'm2m:cin': {
                            con: this.$store.state.loss_lte_infos
                        }
                    }
                }).then(
                    function (res) {
                        console.log('++++++++ postEachLossMarkerInfo-axios', res.data);
                    }
                ).catch(
                    function (err) {
                        console.log(err.message);
                    }
                );
            },
        },

        created() {

        },

        mounted() {
            this.paramLat = this.$store.state.loss_lte_infos[this.markerIndex].lat;
            this.paramLng = this.$store.state.loss_lte_infos[this.markerIndex].lng;
            this.paramAlt = this.$store.state.loss_lte_infos[this.markerIndex].alt;
        },

        beforeDestroy() {
        }
    }
</script>

<style scoped>

</style>