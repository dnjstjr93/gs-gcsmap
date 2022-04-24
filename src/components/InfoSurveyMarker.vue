<template>
    <v-card flat>
        <v-snackbar v-model="snackbar" absolute top right color="success">
            <span>Action successful!</span>
            <v-icon dark right>
                mdi-checkbox-marked-circle
            </v-icon>
        </v-snackbar>
        <v-form ref="form" @submit.prevent="submit">
            <v-card tile flat>
                <v-row align="center" justify="center">
                    <v-col cols="12">
                        <v-card flat tile>
                            <v-row align="center" justify="center">
                                <v-col cols="2">
                                    <v-combobox
                                            v-model="targetSelect"
                                            :items="targets"
                                            label="Target"
                                            chips dense hide-details single-line
                                            :disabled="disableTargetSelect"
                                            class="pa-1"
                                    >
                                        <template v-slot:selection="data">
                                            <v-chip
                                                :key="JSON.stringify(data.item)"
                                                v-bind="data.attrs"
                                                :input-value="data.selected"
                                                :disabled="data.disabled"
                                                @click:close="data.parent.selectItem(data.item)"
                                                small
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
                                    </v-combobox>
                                </v-col>
                                <v-col cols="1">
                                    <v-select
                                        class="py-3 pr-2"
                                        v-model="targetSelectIndex"
                                        :items="targetIndexList"
                                        color="black"
                                        label="Index"
                                        required outlined dense hide-details readonly
                                        :disabled="disableTargetSelectIndex"
                                    >
                                    </v-select>
                                </v-col>
                                <v-col cols="2">
                                    <v-text-field
                                        label="면적(㎡)"
                                        :value="area"
                                        class="mt-0 pt-0"
                                        type="number"
                                        outlined dense hide-details readonly
                                        color="amber"
                                    ></v-text-field>
                                </v-col>
                                <v-col cols="1">
                                    <v-select
                                        label="direction"
                                        class="py-3 pr-2"
                                        :items="['cw', 'ccw']"
                                        v-model="paramDir"
                                        color="black"
                                        required outlined dense hide-details
                                        @change="changeDirSurveyPath($event)"
                                    >
                                    </v-select>
                                </v-col>
                                <v-col cols="1">
                                    <v-text-field
                                        label="angle(°)"
                                        v-model="paramAngle"
                                        class="mt-0 pt-0"
                                        type="number"
                                        outlined dense hide-details
                                        color="amber"
                                        min="-360"
                                        max="360"
                                        @input="changeAngleSurveyPath($event)"
                                    ></v-text-field>
                                </v-col>
                                <v-col cols="1">
                                    <v-text-field
                                        label="gap(m)"
                                        v-model="paramGap"
                                        class="mt-0 pt-0"
                                        type="number"
                                        outlined dense hide-details
                                        color="amber"
                                        min="1"
                                        max="500"
                                        @input="changeGapSurveyPath($event)"
                                    ></v-text-field>
                                </v-col>
                                <v-col cols="1">
                                    <v-text-field
                                        label="비행고도(m)"
                                        v-model="paramAlt"
                                        class="mt-0 pt-0"
                                        type="number"
                                        outlined dense hide-details
                                        color="amber"
                                        min="3"
                                        max="500"
                                        @input="changeAltSurveyPath($event)"
                                    ></v-text-field>
                                </v-col>
                            </v-row>
<!--                            <v-row align="center" justify="center">-->
<!--                                <v-col cols="4">-->
<!--                                    <v-text-field class="py-1 pl-4"-->
<!--                                                  v-model.number="targetLat"-->
<!--                                                  color="purple darken-2"-->
<!--                                                  label="Latitude"-->
<!--                                                  readonly-->
<!--                                                  filled-->
<!--                                                  dense-->
<!--                                                  hide-details-->
<!--                                                  outlined-->
<!--                                    ></v-text-field>-->
<!--                                </v-col>-->
<!--                                <v-col cols="4">-->
<!--                                    <v-text-field class="py-1 px-0"-->
<!--                                                  v-model.number="targetLng"-->
<!--                                                  color="blue darken-2"-->
<!--                                                  label="Longitude"-->
<!--                                                  readonly-->
<!--                                                  filled-->
<!--                                                  dense-->
<!--                                                  hide-details-->
<!--                                                  outlined-->
<!--                                    ></v-text-field>-->
<!--                                </v-col>-->
<!--                                <v-col cols="4">-->
<!--                                    <v-text-field class="py-1 pr-4"-->
<!--                                                  v-model.number="elevation"-->
<!--                                                  color="blue darken-2"-->
<!--                                                  label="Elevation"-->
<!--                                                  readonly-->
<!--                                                  filled-->
<!--                                                  dense-->
<!--                                                  hide-details-->
<!--                                                  outlined-->
<!--                                    ></v-text-field>-->
<!--                                </v-col>-->
<!--                            </v-row>-->
                        </v-card>
                    </v-col>
                </v-row>
            </v-card>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn text @click="resetForm" outlined>
                    Cancel
                </v-btn>
                <v-spacer></v-spacer>
                <v-btn text color="primary" type="submit" outlined :disabled="conditions">
                    Register
                </v-btn>
                <v-spacer></v-spacer>
                <v-btn text color="warning" fab dark @click="deleteMarker" outlined>
                    <v-icon>mdi-delete</v-icon>
                </v-btn>
                <v-spacer></v-spacer>
            </v-card-actions>
        </v-form>
    </v-card>
</template>

<script>
    import EventBus from "@/EventBus";
    import axios from "axios";

    export default {
        name: "InfoMarker",

        props: [
            'markerName',
            'markerIndex',
            'targets',
        ],

        data() {
            const defaultForm = Object.freeze({
                first: '',
                last: '',
                bio: '',
                favoriteAnimal: '',
                age: null,
                terms: false,
            });

            return {
                area: 0,
                select: 'Vuetify',
                items: [
                    'Programming',
                    'Design',
                    'Vue',
                    'Vuetify',
                ],

                targetTypes: ['Goto', 'Circle', 'Survey'],
                targetType: 'Goto',
                targetSelect: '',
                targetSelectIndex: '0',
                oldTargetSelect: '',
                targetLat: 0,
                targetLng: 0,
                targetAlt: 20,
                targetSpeed: 5,
                targetRadius: 10,
                targetTurningSpeed: 10,

                idAngleUpdateTimer: null,
                idDirUpdateTimer: null,
                idGapUpdateTimer: null,
                idAltUpdateTimer: null,

                paramAngle: 0,
                paramDir: 'cw',
                paramGap: 10,
                paramAlt: 20,

                elevation: 0,
                //form: Object.assign({}, defaultForm),
                rules: {
                    age: [
                        val => val < 10 || `I don't believe you!`,
                    ],
                    animal: [val => (val || '').length > 0 || 'This field is required'],
                    name: [val => (val || '').length > 0 || 'This field is required'],
                },
                animals: ['Dog', 'Cat', 'Rabbit', 'Turtle', 'Snake'],
                // conditions: true,
                content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Curabitur sodales ligula in libero. Sed dignissim lacinia nunc.',
                snackbar: false,
                terms: false,
                defaultForm,
                fruits: [
                    'Apples',
                    'Apricots',
                    'Avocado',
                    'Bananas',
                    'Blueberries',
                    'Blackberries',
                    'Boysenberries',
                    'Bread fruit',
                    'Cantaloupes (cantalope)',
                    'Cherries',
                    'Cranberries',
                    'Cucumbers',
                    'Currants',
                    'Dates',
                    'Eggplant',
                    'Figs',
                    'Grapes',
                    'Grapefruit',
                    'Guava',
                    'Honeydew melons',
                    'Huckleberries',
                    'Kiwis',
                    'Kumquat',
                    'Lemons',
                    'Limes',
                    'Mangos',
                    'Mulberries',
                    'Muskmelon',
                    'Nectarines',
                    'Olives',
                    'Oranges',
                    'Papaya',
                    'Peaches',
                    'Pears',
                    'Persimmon',
                    'Pineapple',
                    'Plums',
                    'Pomegranate',
                    'Raspberries',
                    'Rose Apple',
                    'Starfruit',
                    'Strawberries',
                    'Tangerines',
                    'Tomatoes',
                    'Watermelons',
                    'Zucchini',
                ],

                selectedFruits: [],

                disableTargetSelectIndex: false,
                disableTargetSelect: false,

            }
        },

        watch: {
            markerName: function (newVal) {

                console.log('InfoMaker - watch', newVal);

                this.targetSelect = newVal;
            },

            targetSelect: function (newVal) {
                this.disableTargetSelectIndex = (this.markerName !== newVal);
            },

            targetSelectIndex: function (newVal) {
                this.disableTargetSelect = (String(this.markerIndex) !== newVal);
            },
        },

        computed: {
            targetIndexList() {
                console.log()
                let arrIndex = [];
                for(let idx in this.$store.state.surveyMarkers[this.markerName]) {
                    if(Object.prototype.hasOwnProperty.call(this.$store.state.surveyMarkers[this.markerName], idx)) {
                        arrIndex.push(idx);
                    }
                }

                return (arrIndex);
            },
            likesAllFruit () {
                return this.selectedFruits.length === this.fruits.length
            },
            likesSomeFruit () {
                return this.selectedFruits.length > 0 && !this.likesAllFruit
            },
            icon () {
                return 'mdi-checkbox-blank-outline'
            },

            form() {
                return (this.$store.state.form);
            },

            conditions() {
                return !((this.markerName !== this.targetSelect) ||
                    (String(this.markerIndex) !== this.targetSelectIndex));
            },

            curDroneColorMap() {
                console.log('curDroneColorMap', this.targetSelect, this.$store.state.drone_infos[this.targetSelect])
                return (this.$store.state.drone_infos[this.targetSelect].color);
            },

            formIsValid() {
                return (
                    this.form.first &&
                    this.form.last &&
                    this.form.favoriteAnimal &&
                    this.form.terms
                );
            },
        },

        methods: {
            changeAltSurveyPath(alt) {
                if(this.idAltUpdateTimer !== null) {
                    clearTimeout(this.idAltUpdateTimer);
                }

                this.idAltUpdateTimer = setTimeout((dName, pIndex) => {
                    EventBus.$emit('do-update-survey-alt-GcsMap', {dName: dName, pIndex: pIndex, alt: parseInt(alt)});
                }, 500, this.markerName, this.markerIndex);
            },

            changeGapSurveyPath(gap) {
                if(this.idGapUpdateTimer !== null) {
                    clearTimeout(this.idGapUpdateTimer);
                }

                this.idGapUpdateTimer = setTimeout((dName, pIndex) => {
                    EventBus.$emit('do-update-survey-gap-GcsMap', {dName: dName, pIndex: pIndex, gap: parseInt(gap)});
                }, 500, this.markerName, this.markerIndex);
            },

            changeAngleSurveyPath(angle) {
                if(this.idAngleUpdateTimer !== null) {
                    clearTimeout(this.idAngleUpdateTimer);
                }

                this.idAngleUpdateTimer = setTimeout((dName, pIndex) => {
                    EventBus.$emit('do-update-survey-angle-GcsMap', {dName: dName, pIndex: pIndex, angle: parseInt(angle)});
                }, 500, this.markerName, this.markerIndex);
            },

            changeDirSurveyPath(strDir) {
                if(this.idDirUpdateTimer !== null) {
                    clearTimeout(this.idDirUpdateTimer);
                }

                let dir = 1;
                if(strDir === 'ccw') {
                    dir = -1;
                }

                this.idDirUpdateTimer = setTimeout((dName, pIndex) => {
                    EventBus.$emit('do-update-survey-dir-GcsMap', {dName: dName, pIndex: pIndex, dir: parseInt(dir)});
                }, 500, this.markerName, this.markerIndex);
            },

            deleteMarker() {
                let watchingPayload = {};
                watchingPayload.payload = {
                    dName: this.markerName,
                    pIndex: this.markerIndex,
                };

                if(this.markerName === 'unknown') {
                    this.$store.state.surveyMarkers[this.markerName].splice(this.markerIndex, 1);

                    watchingPayload.broadcastMission = 'removeSurveyMarker';

                    this.postEachSurveyMarkerInfo(this.markerName);
                }
                else {
                    this.$store.state.surveyMarkers.unknown.push(
                        JSON.parse(JSON.stringify(this.$store.state.surveyMarkers[this.markerName][this.markerIndex]))
                    );
                    this.$store.state.surveyMarkers[this.markerName].splice(this.markerIndex, 1);

                    watchingPayload.broadcastMission = 'deleteSurveyMarker';

                    this.postEachSurveyMarkerInfo(this.markerName);

                    this.postEachSurveyMarkerInfo('unknown');

                    // let temp = JSON.parse(JSON.stringify(state.tempMarkers));
                    // state.tempMarkers = null;
                    // state.tempMarkers = {};
                    // state.tempMarkers = JSON.parse(JSON.stringify(temp));
                    // temp = null;
                }

                this.broadcast_gcsmap_topic = '/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/watchingMission/gcsmap';
                this.doPublish(this.broadcast_gcsmap_topic, JSON.stringify(watchingPayload));

                this.$store.state.didIPublish = true;

                this.snackbar = true;

                setTimeout(() => {
                    this.resetForm();
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

            resetForm() {
                // this.form = Object.assign({}, this.defaultForm)
                // this.$refs.form.reset()

                this.$emit('input', false);

                this.$store.state.surveyMarkers[this.markerName].forEach((marker) => {
                    marker.selected = false;
                    marker.polygonDraggable = false;
                    marker.polygonEditable = false;
                });
            },

            createEachSurveyMarkerInfoToMobius(dName, callback) {
                axios({
                    validateStatus: function (status) {
                        // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                        return status < 500;
                    },
                    method: 'post',
                    url: 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/SurveyMarkerInfos',
                    headers: {
                        'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                        'X-M2M-Origin': 'SVue',
                        'Content-Type': 'application/json;ty=3'
                    },
                    data: {
                        'm2m:cnt': {
                            rn: dName,
                            lbl: ['dName'],
                        }
                    }
                }).then(
                    function (res) {
                        callback(res.status, '');
                    }
                ).catch(
                    function (err) {
                        console.log(err.message);
                    }
                );
            },

            postEachSurveyMarkerInfo(dName) {
                axios({
                    validateStatus: function (status) {
                        // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                        return status < 500;
                    },
                    method: 'post',
                    url: 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/SurveyMarkerInfos/' + dName,
                    headers: {
                        'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                        'X-M2M-Origin': 'SVue',
                        'Content-Type': 'application/json;ty=4'
                    },
                    data: {
                        'm2m:cin': {
                            con: this.$store.state.surveyMarkers[dName]
                        }
                    }
                }).then(
                    function (res) {
                        console.log('++++++++ confirmAddSurveyMarker-axios', res.data);
                    }
                ).catch(
                    function (err) {
                        console.log(err.message);
                    }
                );
            },

            registerSurveyMarker(oldName, oldIndex, newName) {

                this.$store.state.surveyMarkers[oldName][oldIndex].selected = false;

                this.$store.state.surveyMarkers[newName].push(
                    JSON.parse(JSON.stringify(this.$store.state.surveyMarkers[oldName][oldIndex]))
                );
                this.$store.state.surveyMarkers[oldName].splice(oldIndex, 1);

                this.postEachSurveyMarkerInfo(newName);

                this.postEachSurveyMarkerInfo(oldName);

                this.snackbar = true;

                setTimeout(() => {
                    this.resetForm();
                }, 100);
            },

            submit() {
                console.log("999999999999999999999999999999999999999999999999999", this.targetSelect, this.$store.state.surveyMarkers[this.targetSelect]);

                if(!Object.prototype.hasOwnProperty.call(this.$store.state.surveyMarkers, this.targetSelect)) {
                    this.$store.state.surveyMarkers[this.targetSelect] = [];

                    this.createEachSurveyMarkerInfoToMobius(this.targetSelect, (res) => {
                        console.log('InfoSurveyMarker', 'createEachSurveyMarkerInfoToMobius', res);

                        this.registerSurveyMarker(this.markerName, this.markerIndex, this.targetSelect);
                    });
                }
                else {
                    this.registerSurveyMarker(this.markerName, this.markerIndex, this.targetSelect);
                }
            },
            decrementAlt () {
                this.targetAlt--;
            },
            incrementAlt () {
                this.targetAlt++;
            },
            decrementSpeed () {
                this.targetSpeed--;
            },
            incrementSpeed () {
                this.targetSpeed++;
            },
            decrementRadius () {
                this.targetRadius--;
            },
            incrementRadius () {
                this.targetRadius++;
            },
            decrementTurningSpeed () {
                this.targetTurningSpeed--;
            },
            incrementTurningSpeed () {
                this.targetTurningSpeed++;
            },

            selectTargetType(event) {
                this.$store.state.surveyMarkers[this.markerName][this.markerIndex].type = event;

                console.log('InfoMarker:selectTargetType - ' + this.$store.state.surveyMarkers[this.markerName][this.markerIndex].type);

                let temp = JSON.parse(JSON.stringify(this.$store.state.surveyMarkers));
                this.$store.state.surveyMarkers = null;
                this.$store.state.surveyMarkers = JSON.parse(JSON.stringify(temp));
                temp = null;

                this.targetType = this.$store.state.surveyMarkers[this.markerName][this.markerIndex].type;
            },
        },

        created() {
        },

        mounted() {
            this.targetSelect = this.markerName;
            this.targetSelectIndex = String(this.markerIndex);

            this.paramAngle = this.$store.state.surveyMarkers[this.markerName][this.markerIndex].angle;
            this.paramDir = (this.$store.state.surveyMarkers[this.markerName][this.markerIndex].dir === 1) ? 'cw' : 'ccw';
            this.paramGap = this.$store.state.surveyMarkers[this.markerName][this.markerIndex].gap;
            this.paramAlt = this.$store.state.surveyMarkers[this.markerName][this.markerIndex].alt;

            if(!Object.prototype.hasOwnProperty.call(this.$store.state.surveyMarkers[this.markerName][this.markerIndex], 'area')) {
                this.$store.state.surveyMarkers[this.markerName][this.markerIndex].area = 0;
            }
            this.area = this.$store.state.surveyMarkers[this.markerName][this.markerIndex].area;

            console.log('InfoSurveyMarker', this.$store.state.surveyMarkers[this.markerName]);

            EventBus.$on('on-update-survey-infomarker', () => {
                this.area = this.$store.state.surveyMarkers[this.markerName][this.markerIndex].area;
                this.$forceUpdate();
            });
        },

        beforeDestroy() {
            EventBus.$off('on-update-survey-infomarker');
        }
    }
</script>

<style scoped>

</style>