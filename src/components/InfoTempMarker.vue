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
                    <v-col cols="2">
                        <v-combobox
                            v-model="targetSelectName"
                            :items="targets"
                            label="Target"
                            chips dense hide-details single-line
                            :disabled="disableTargetSelectName"
                            class="px-1"
                        >
                            <template v-slot:selection="data">
                                <v-chip class="ma-0"
                                        :key="JSON.stringify(data.item)"
                                        v-bind="data.attrs"
                                        :input-value="data.selected"
                                        :disabled="data.disabled"
                                        @click:close="data.parent.selectItem(data.item)"
                                >
                                    <v-avatar
                                        class="white--text"
                                        left
                                        v-text="data.item.slice(0, 1).toUpperCase()"
                                        :color="curDroneColorMap"
                                    ></v-avatar>
                                    {{ data.item }}
                                </v-chip>
                            </template>
                            <template v-slot:item="{ index, item }">
                                <v-chip
                                    :color="$store.state.drone_infos[`${item}`].color"
                                    label
                                >
                                    {{ item }}
                                </v-chip>
                            </template>
                        </v-combobox>
                    </v-col>
                    <v-col cols="1">
                        <v-select class="py-3 px-1"
                                  v-model="targetSelectIndex"
                                  :items="targetIndexList"
                                  color="black"
                                  label="Index"
                                  required outlined dense hide-details
                                  :disabled="disableTargetSelectIndex"
                        >
                        </v-select>
                    </v-col>
                    <v-col cols="1">
                        <v-text-field
                            label="stayTime"
                            v-model="targetStayTime"
                            class="mt-0 pt-0"
                            hide-details outlined dense
                            type="number"
                            color="amber"
                            min="0"
                        ></v-text-field>
                    </v-col>
                    <v-col cols="2">
                        <v-text-field
                            class="px-1"
                            v-model.number="targetLat"
                            color="purple darken-2"
                            label="Latitude"
                            readonly filled dense hide-details outlined
                        ></v-text-field>
                    </v-col>
                    <v-col cols="2">
                        <v-text-field
                            class="px-1"
                            v-model.number="targetLng"
                            color="blue darken-2"
                            label="Longitude"
                            readonly filled dense hide-details outlined
                        ></v-text-field>
                    </v-col>
                    <v-col cols="1">
                        <v-text-field
                            class="px-1"
                            v-model.number="elevation"
                            color="blue darken-2"
                            label="Elevation"
                            readonly filled dense hide-details outlined
                        ></v-text-field>
                    </v-col>
                    <v-col cols="1" class="text-center">
                        <v-text-field
                            label="비행고도(m)"
                            v-model="targetAlt"
                            class="mt-0 pt-0"
                            type="number"
                            outlined dense hide-details
                            color="amber"
                            min="3"
                            max="500"
                        ></v-text-field>
<!--                        <v-card flat tile>-->
<!--                            <span class="display-0 font-weight-bold">비행고도</span>-->
<!--                            <span class="pl-6 display-1 font-weight-light">{{targetAlt}}</span>-->
<!--                            <span class="subheading font-weight-light mx-1">m</span>-->
<!--                        </v-card>-->
<!--                        <v-card flat tile class="pl-2 pt-12">-->
<!--                            <v-row align="center" justify="center">-->
<!--                                <v-col cols="8">-->
<!--                                    <v-slider-->
<!--                                            v-model="targetAlt"-->
<!--                                            color="amber"-->
<!--                                            hint="Altitude"-->
<!--                                            min="3"-->
<!--                                            max="500"-->
<!--                                            thumb-label="always"-->
<!--                                            track-fill-color="orange"-->
<!--                                            dense-->
<!--                                            ticks-->
<!--                                            hide-details-->
<!--                                    >-->
<!--                                        <template v-slot:prepend>-->
<!--                                            <v-icon-->
<!--                                                    color="primary"-->
<!--                                                    @click="decrementAlt"-->
<!--                                            >-->
<!--                                                mdi-minus-->
<!--                                            </v-icon>-->
<!--                                        </template>-->

<!--                                        <template v-slot:append>-->
<!--                                            <v-icon-->
<!--                                                    color="secondary"-->
<!--                                                    @click="incrementAlt"-->
<!--                                            >-->
<!--                                                mdi-plus-->
<!--                                            </v-icon>-->
<!--                                        </template>-->
<!--                                    </v-slider>-->
<!--                                </v-col>-->
<!--                                <v-col cols="4">-->
<!--                                    <v-text-field-->
<!--                                        v-model="targetAlt"-->
<!--                                        class="mt-0 pt-0"-->
<!--                                        hide-details-->
<!--                                        single-line-->
<!--                                        type="number"-->
<!--                                        outlined dense-->
<!--                                        color="amber"-->
<!--                                    ></v-text-field>-->
<!--                                </v-col>-->
<!--                            </v-row>-->
<!--                        </v-card>-->
                    </v-col>
                    <v-col cols="1" class="text-center">
                        <v-text-field
                            label="비행속도(m/s)"
                            v-model="targetSpeed"
                            class="mt-0 pt-0"
                            type="number"
                            outlined dense hide-details
                            color="amber"
                            min="3"
                            max="500"
                        ></v-text-field>
<!--                        <v-card flat tile>-->
<!--                            <span class="display-0 font-weight-bold">비행속도</span>-->
<!--                            <span class="pl-6 display-1 font-weight-light">{{targetSpeed}}</span>-->
<!--                            <span class="subheading font-weight-light mx-1">m/s</span>-->
<!--                        </v-card>-->
<!--                        <v-card flat tile class="pl-2 pt-12">-->
<!--                            <v-row align="center" justify="center">-->
<!--                                <v-col cols="8">-->
<!--                                <v-slider-->
<!--                                        v-model="targetSpeed"-->
<!--                                        color="teal"-->
<!--                                        hint="Speed"-->
<!--                                        min="1"-->
<!--                                        max="20"-->
<!--                                        thumb-label="always"-->
<!--                                        track-fill-color="orange"-->
<!--                                        dense-->
<!--                                        ticks-->
<!--                                        hide-details-->
<!--                                >-->
<!--                                    <template v-slot:prepend>-->
<!--                                        <v-icon-->
<!--                                                color="primary"-->
<!--                                                @click="decrementSpeed"-->
<!--                                        >-->
<!--                                            mdi-minus-->
<!--                                        </v-icon>-->
<!--                                    </template>-->

<!--                                    <template v-slot:append>-->
<!--                                        <v-icon-->
<!--                                                color="secondary"-->
<!--                                                @click="incrementSpeed"-->
<!--                                        >-->
<!--                                            mdi-plus-->
<!--                                        </v-icon>-->
<!--                                    </template>-->
<!--                                </v-slider>-->
<!--                                </v-col>-->
<!--                                <v-col cols="4">-->
<!--                                    <v-text-field-->
<!--                                        v-model="targetSpeed"-->
<!--                                        class="mt-0 pt-0"-->
<!--                                        hide-details-->
<!--                                        single-line-->
<!--                                        type="number"-->
<!--                                        outlined dense-->
<!--                                        color="teal"-->
<!--                                    ></v-text-field>-->
<!--                                </v-col>-->
<!--                            </v-row>-->
<!--                        </v-card>-->
                    </v-col>
                </v-row>
            </v-card>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn text color="primary" type="submit" outlined :disabled="conditions">
                    Register
                </v-btn>
                <v-spacer></v-spacer>
                <v-btn text @click="resetForm('cancel')" outlined>
                    Cancel
                </v-btn>
                <v-spacer></v-spacer>
                <v-btn text color="warning" fab dark @click="deleteTempMarker" outlined>
                    <v-icon>$delete</v-icon>
                </v-btn>
                <v-spacer></v-spacer>
            </v-card-actions>
        </v-form>
    </v-card>
</template>

<script>
    import axios from "axios";
    import EventBus from "@/EventBus";

    export default {
        name: "InfoTempMarker",

        props: [
            'value',
            'marker',
            'markerName',
            'markerIndex',
        ],

        data() {
            return {
                targets: [],

                targetSelectName: '',
                targetSelectIndex: '0',
                targetLat: 0,
                targetLng: 0,
                targetAlt: 20,
                targetSpeed: 5,
                targetRadius: 10,
                targetTurningSpeed: 10,
                targetStayTime: 1,
                elevation: 0,

                snackbar: false,

                disableTargetSelectIndex: false,
                disableTargetSelectName: false,
            }
        },

        watch: {
            markerName: function (newVal) {
                this.targetSelectName = newVal;
            },

            marker: {
                deep: true,
                handler: function (newVal) {

                    this.targetSelectName = this.markerName;

                    this.targetSelectIndex = String(this.markerIndex);

                    console.log('this.targetSelectIndex', this.targetSelectIndex)

                    this.targetLat = newVal.lat;
                    this.targetLng = newVal.lng;
                    this.targetAlt = newVal.alt;
                    this.targetSpeed = newVal.speed;
                    this.targetRadius = newVal.radius;
                    this.targetTurningSpeed = newVal.turningSpeed;
                    this.targetMavCmd = newVal.targetMavCmd;
                    this.targetStayTime = newVal.targetStayTime;
                    this.elevation = newVal.elevation.toFixed(1);

                    this.$forceUpdate();
                }
            },

            targetSelectName: function (newVal) {
                this.disableTargetSelectIndex = (this.markerName !== newVal);
            },

            targetSelectIndex: function (newVal) {
                this.disableTargetSelectName = (String(this.markerIndex) !== newVal);
            },
        },

        computed: {
            targetIndexList() {
                console.log()
                let arrIndex = [];
                for(let idx in this.$store.state.tempMarkers[this.markerName]) {
                    if(Object.prototype.hasOwnProperty.call(this.$store.state.tempMarkers[this.markerName], idx)) {
                        arrIndex.push(idx);
                    }
                }

                return (arrIndex);
            },

            conditions() {
                return !((this.markerName !== this.targetSelectName) || (this.marker.alt !== this.targetAlt) ||
                    (this.marker.speed !== this.targetSpeed) || (this.marker.radius !== this.targetRadius) ||
                    (this.marker.turningSpeed !== this.targetTurningSpeed) ||
                    (this.marker.targetStayTime !== this.targetStayTime) ||
                    (String(this.markerIndex) !== this.targetSelectIndex));
            },

            curDroneColorMap() {
                return (this.$store.state.drone_infos[this.targetSelectName].color);
            },
        },

        methods: {
            deleteTempMarker() {
                let status = 'cancel';
                let oldName = this.markerName;
                let oldIndex = this.markerIndex;
                let newName = 'unknown';

                if(oldName === 'unknown') {
                    this.$store.state.tempMarkers[oldName].splice(oldIndex, 1);

                    let temp = JSON.parse(JSON.stringify(this.$store.state.tempMarkers[oldName]));
                    this.$store.state.tempMarkers[oldName] = null;
                    this.$store.state.tempMarkers[oldName] = JSON.parse(JSON.stringify(temp));

                    status = 'remove';

                    this.postCinTempMarkerInfoToMobius(oldName);

                    this.broadcast_gcsmap_topic = '/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/watchingMission/gcsmap';
                    let watchingPayload = {};
                    watchingPayload.broadcastMission = 'broadcastRegisterTempMarker';
                    watchingPayload.dName = oldName;

                    this.doPublish(this.broadcast_gcsmap_topic, JSON.stringify(watchingPayload));

                    this.$store.state.didIPublish = true;
                }
                else {
                    this.$store.state.tempMarkers[oldName][oldIndex].selected = false;
                    let targetTempMarker = this.$store.state.tempMarkers[oldName].splice(oldIndex, 1);
                    this.$store.state.tempMarkers[newName].push(targetTempMarker[0]);

                    let temp = JSON.parse(JSON.stringify(this.$store.state.tempMarkers[oldName]));
                    this.$store.state.tempMarkers[oldName] = null;
                    this.$store.state.tempMarkers[oldName] = JSON.parse(JSON.stringify(temp));

                    temp = JSON.parse(JSON.stringify(this.$store.state.tempMarkers[newName]));
                    this.$store.state.tempMarkers[newName] = null;
                    this.$store.state.tempMarkers[newName] = JSON.parse(JSON.stringify(temp));

                    status = 'delete';

                    this.broadcast_gcsmap_topic = '/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/watchingMission/gcsmap';
                    let watchingPayload = {};
                    watchingPayload.broadcastMission = 'broadcastRegisterTempMarker';

                    this.postCinTempMarkerInfoToMobius(oldName);
                    watchingPayload.dName = oldName;
                    this.doPublish(this.broadcast_gcsmap_topic, JSON.stringify(watchingPayload));
                    this.$store.state.didIPublish = true;

                    this.postCinTempMarkerInfoToMobius(newName);
                    watchingPayload.dName = newName;
                    this.doPublish(this.broadcast_gcsmap_topic, JSON.stringify(watchingPayload));
                    this.$store.state.didIPublish = true;
                }

                this.snackbar = true;

                setTimeout(() => {
                    this.resetForm(status, oldName, newName);
                }, 100);
            },

            doPublish(topic, payload) {
                if (this.$store.state.client.connected) {
                    this.$store.state.client.publish(topic, payload, 0, error => {
                        if (error) {
                            console.log('Publish error', error)
                        }
                    });
                }
            },

            resetForm(status, oldName, newName) {
                this.$emit('input', false);

                let payload = {};
                payload.status = status;
                payload.dNameOld = oldName;
                payload.dNameNew = newName;

                EventBus.$emit('do-unsetSelectedTempMarker', payload);
            },

            postCinTempMarkerInfoToMobius(dName) {
                axios({
                    validateStatus: function (status) {
                        // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                        return status < 500;
                    },
                    method: 'post',
                    url: 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/MarkerInfos/' + dName,
                    headers: {
                        'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                        'X-M2M-Origin': 'SVue',
                        'Content-Type': 'application/json;ty=4'
                    },
                    data: {
                        'm2m:cin': {
                            con: this.$store.state.tempMarkers[dName]
                        }
                    }
                }).then(
                    function (res) {
                        console.log('-------------------------------------------------------postCinTempMarkerInfoToMobius-axios', res.data);
                    }
                ).catch(
                    function (err) {
                        console.log(err.message);
                    }
                );
            },

            postCntToMobius(url, name, callback) {
                axios({
                    validateStatus: function (status) {
                        // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                        return status < 500;
                    },
                    method: 'post',
                    url: url,
                    headers: {
                        'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                        'X-M2M-Origin': 'S' + this.$store.state.VUE_APP_MOBIUS_GCS,
                        'Content-Type': 'application/json;ty=3'
                    },
                    data: {
                        'm2m:cnt': {
                            rn: name,
                            lbl: [name],
                        }
                    }
                }).then(
                    (res) => {
                        callback(res.status, '');
                    }
                ).catch(
                    (err) => {
                        console.log(err.message);
                    }
                );
            },

            postCinToMobius(url, con, callback) {
                axios({
                    validateStatus: function (status) {
                        // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                        return status < 500;
                    },
                    method: 'post',
                    url: url,
                    headers: {
                        'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                        'X-M2M-Origin': 'S' + this.$store.state.VUE_APP_MOBIUS_GCS,
                        'Content-Type': 'application/json;ty=4'
                    },
                    data: {
                        'm2m:cin': {
                            con: con
                        }
                    }
                }).then(
                    (res) => {
                        callback(res.status, '');
                    }
                ).catch(
                    (err) => {
                        console.log(err.message);
                    }
                );
            },

            registerTempMarker(oldName, oldIndex, newName, newIndex) {
                let status = 'cancel';

                if(oldName !== newName) {
                    this.$store.state.tempMarkers[oldName][oldIndex].selected = false;
                    let targetTempMarker = this.$store.state.tempMarkers[oldName].splice(oldIndex, 1);
                    this.$store.state.tempMarkers[newName].push(targetTempMarker[0]);

                    let temp = JSON.parse(JSON.stringify(this.$store.state.tempMarkers[oldName]));
                    this.$store.state.tempMarkers[oldName] = null;
                    this.$store.state.tempMarkers[oldName] = JSON.parse(JSON.stringify(temp));

                    temp = JSON.parse(JSON.stringify(this.$store.state.tempMarkers[newName]));
                    this.$store.state.tempMarkers[newName] = null;
                    this.$store.state.tempMarkers[newName] = JSON.parse(JSON.stringify(temp));

                    status = 'register-name';

                    this.postCinTempMarkerInfoToMobius(oldName);

                    this.broadcast_gcsmap_topic = '/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/watchingMission/gcsmap';
                    let watchingPayload = {};
                    watchingPayload.broadcastMission = 'broadcastRegisterTempMarker';
                    watchingPayload.dName = oldName;
                    this.doPublish(this.broadcast_gcsmap_topic, JSON.stringify(watchingPayload));
                    this.$store.state.didIPublish = true;

                    this.postCinTempMarkerInfoToMobius(newName);

                    watchingPayload.dName = newName;
                    this.doPublish(this.broadcast_gcsmap_topic, JSON.stringify(watchingPayload));
                    this.$store.state.didIPublish = true;
                }
                else if(oldIndex !== newIndex) {
                    this.$store.state.tempMarkers[oldName][oldIndex].selected = false;
                    let targetTempMarker = this.$store.state.tempMarkers[oldName].splice(oldIndex, 1);
                    this.$store.state.tempMarkers[oldName].splice(newIndex, 0, targetTempMarker[0]);

                    let temp = JSON.parse(JSON.stringify(this.$store.state.tempMarkers[oldName]));
                    this.$store.state.tempMarkers[oldName] = null;
                    this.$store.state.tempMarkers[oldName] = JSON.parse(JSON.stringify(temp));

                    temp = JSON.parse(JSON.stringify(this.$store.state.tempMarkers[newName]));
                    this.$store.state.tempMarkers[newName] = null;
                    this.$store.state.tempMarkers[newName] = JSON.parse(JSON.stringify(temp));

                    status = 'register-index';

                    this.postCinTempMarkerInfoToMobius(oldName);

                    this.broadcast_gcsmap_topic = '/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/watchingMission/gcsmap';
                    let watchingPayload = {};
                    watchingPayload.broadcastMission = 'broadcastRegisterTempMarker';
                    watchingPayload.dName = oldName;
                    this.doPublish(this.broadcast_gcsmap_topic, JSON.stringify(watchingPayload));
                    this.$store.state.didIPublish = true;
                }
                else {
                    this.$store.state.tempMarkers[oldName][oldIndex].selected = false;

                    status = 'register-extra';

                    this.postCinTempMarkerInfoToMobius(oldName);

                    this.broadcast_gcsmap_topic = '/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/watchingMission/gcsmap';
                    let watchingPayload = {};
                    watchingPayload.broadcastMission = 'broadcastRegisterTempMarker';
                    watchingPayload.dName = oldName;
                    this.doPublish(this.broadcast_gcsmap_topic, JSON.stringify(watchingPayload));
                    this.$store.state.didIPublish = true;
                }

                this.snackbar = true;

                setTimeout(() => {

                    this.resetForm(status, oldName, newName);
                }, 100);
            },

            submit() {
                this.$store.state.tempMarkers[this.markerName][this.markerIndex].alt = parseInt(this.targetAlt);
                this.$store.state.tempMarkers[this.markerName][this.markerIndex].targetAlt = parseInt(this.targetAlt);
                this.$store.state.tempMarkers[this.markerName][this.markerIndex].targetSpeed = parseInt(this.targetSpeed);

                console.log('submit', this.$store.state.tempMarkers);

                if(!Object.prototype.hasOwnProperty.call(this.$store.state.tempMarkers, this.targetSelectName)) {
                    this.$store.state.tempMarkers[this.targetSelectName] = [];

                    let url = 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/MarkerInfos';
                    this.postCntToMobius(url, this.targetSelectName, () => {
                        let url = 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/MarkerInfos/' + this.targetSelectName;
                        this.postCinToMobius(url, this.$store.state.tempMarkers[this.targetSelectName], () => {
                            this. registerTempMarker(this.markerName, this.markerIndex, this.targetSelectName, this.targetSelectIndex);
                        });
                    });
                }
                else {
                    this. registerTempMarker(this.markerName, this.markerIndex, this.targetSelectName, this.targetSelectIndex);
                }
            }
        },

        created() {
            this.targets = [];

            for (var dName in this.$store.state.drone_infos) {
                if (Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos, dName)) {
                    if (dName === 'unknown' || this.$store.state.drone_infos[dName].selected) {
                        this.targets.push(dName);
                    }
                }
            }
        },

        mounted() {
            this.targetSelectName = this.markerName;
            this.targetSelectIndex = String(this.markerIndex);
            this.targetLat = this.marker.lat;
            this.targetLng = this.marker.lng;
            this.targetAlt = this.marker.alt;
            this.targetSpeed = this.marker.speed;
            this.targetRadius = this.marker.radius;
            this.targetTurningSpeed = this.marker.turningSpeed;
            this.targetStayTime = this.marker.targetStayTime;
            this.elevation = this.marker.elevation.toFixed(1);

            console.log('InfoTempMarker', this.$store.state.tempMarkers[this.markerName]);
        },

        beforeDestroy() {
        }
    }
</script>

<style scoped>

</style>