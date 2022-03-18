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
                    <v-col cols="4">
                        <v-card flat tile>
                            <v-row align="center" justify="center">
                                <v-col cols="6">
                                    <v-combobox
                                            v-model="targetSelect"
                                            :items="targets"
                                            label="Target"
                                            chips
                                            :disabled="disableTargetSelect"
                                            dense
                                            hide-details
                                            single-line
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
                                    </v-combobox>
                                </v-col>
                                <v-col cols="3">
                                    <v-select
                                        class="py-3 pr-2"
                                        v-model="targetSelectIndex"
                                        :items="targetIndexList"
                                        color="black"
                                        label="Index"
                                        required
                                        outlined
                                        dense
                                        hide-details
                                        :disabled="disableTargetSelectIndex"
                                    >
                                    </v-select>
                                </v-col>
                                <v-col cols="3">
                                    <v-text-field
                                        label="angle"
                                        v-model="paramAngle"
                                        class="mt-0 pt-0"
                                        hide-details
                                        type="number"
                                        outlined dense
                                        color="amber"
                                        min="-360"
                                        max="360"
                                        @input="changeAngleSurveyPath($event)"
                                    ></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row align="center" justify="center">
                                <v-col cols="4">
                                    <v-text-field class="py-1 pl-4"
                                                  v-model.number="targetLat"
                                                  color="purple darken-2"
                                                  label="Latitude"
                                                  readonly
                                                  filled
                                                  dense
                                                  hide-details
                                                  outlined
                                    ></v-text-field>
                                </v-col>
                                <v-col cols="4">
                                    <v-text-field class="py-1 px-0"
                                                  v-model.number="targetLng"
                                                  color="blue darken-2"
                                                  label="Longitude"
                                                  readonly
                                                  filled
                                                  dense
                                                  hide-details
                                                  outlined
                                    ></v-text-field>
                                </v-col>
                                <v-col cols="4">
                                    <v-text-field class="py-1 pr-4"
                                                  v-model.number="elevation"
                                                  color="blue darken-2"
                                                  label="Elevation"
                                                  readonly
                                                  filled
                                                  dense
                                                  hide-details
                                                  outlined
                                    ></v-text-field>
                                </v-col>
                            </v-row>
                        </v-card>
                    </v-col>
                    <v-col cols="2" class="text-center">
                        <v-card flat tile>
                            <span class="display-0 font-weight-bold">비행고도</span>
                            <span class="pl-6 display-1 font-weight-light">{{targetAlt}}</span>
                            <span class="subheading font-weight-light mx-1">m</span>
                        </v-card>
                        <v-card flat tile class="pl-2 pt-12">
                            <v-row align="center" justify="center">
                                <v-col cols="8">
                                    <v-slider
                                            v-model="targetAlt"
                                            color="amber"
                                            hint="Altitude"
                                            min="3"
                                            max="500"
                                            thumb-label="always"
                                            track-fill-color="orange"
                                            dense
                                            ticks
                                            hide-details
                                    >
                                        <template v-slot:prepend>
                                            <v-icon
                                                    color="primary"
                                                    @click="decrementAlt"
                                            >
                                                mdi-minus
                                            </v-icon>
                                        </template>

                                        <template v-slot:append>
                                            <v-icon
                                                    color="secondary"
                                                    @click="incrementAlt"
                                            >
                                                mdi-plus
                                            </v-icon>
                                        </template>
                                    </v-slider>
                                </v-col>
                                <v-col cols="4">
                                    <v-text-field
                                        v-model="targetAlt"
                                        class="mt-0 pt-0"
                                        hide-details
                                        single-line
                                        type="number"
                                        outlined dense
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
            'value',
            'marker',
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

                idUpdateTimer: null,
                paramAngle: 0,
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
            // targetSelect: function (newVal, oldVal) {
            //     console.log('targetSelect - watch', oldVal, ' -> ', newVal);
            //     if(this.markerName !== newVal) {
            //
            //         this.oldTargetSelet = oldVal;
            //
            //         this.conditions = false;
            //     }
            //     else {
            //         this.conditions = true;
            //     }
            // },
            //
            // targetAlt: function (newVal, oldVal) {
            //     console.log('targetAlt - watch', oldVal, ' -> ', newVal);
            //     if(this.marker.alt !== newVal) {
            //         this.conditions = false;
            //     }
            //     else {
            //         this.conditions = true;
            //     }
            // },
            //
            // targetSpeed: function (newVal, oldVal) {
            //     console.log('targetSpeed - watch', oldVal, ' -> ', newVal);
            //     if(this.marker.speed !== newVal) {
            //         this.conditions = false;
            //     }
            //     else {
            //         this.conditions = true;
            //     }
            // },
            //
            // targetRadius: function (newVal, oldVal) {
            //     console.log('targetRadius - watch', oldVal, ' -> ', newVal);
            //     if(this.marker.radius !== newVal) {
            //         this.conditions = false;
            //     }
            //     else {
            //         this.conditions = true;
            //     }
            // },
            //
            // targetTurningSpeed: function (newVal, oldVal) {
            //     console.log('targetTurningSpeed - watch', oldVal, ' -> ', newVal);
            //     if(this.marker.turningSpeed !== newVal) {
            //         this.conditions = false;
            //     }
            //     else {
            //         this.conditions = true;
            //     }
            // },

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
                return !((this.markerName !== this.targetSelect) || (this.marker.alt !== this.targetAlt) ||
                    (this.marker.speed !== this.targetSpeed) || (this.marker.radius !== this.targetRadius) ||
                    (this.marker.turningSpeed !== this.targetTurningSpeed) ||
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
            changeAngleSurveyPath(angle) {
                if(this.idUpdateTimer !== null) {
                    clearTimeout(this.idUpdateTimer);
                }

                this.idUpdateTimer = setTimeout((dName, pIndex) => {
                    EventBus.$emit('do-update-survey-angle-GcsMap', {dName: dName, pIndex: pIndex, angle: parseInt(angle)});
                }, 500, this.markerName, this.markerIndex);
            },

            deleteMarker() {
                console.log(this.markerName, this.markerIndex, this.marker);

                let watchingPayload = {};
                watchingPayload.payload = {
                    dName: this.markerName,
                    pIndex: this.markerIndex,
                };

                if(this.markerName === 'unknown') {
                    this.$store.state.surveyMarkers[this.markerName].splice(this.markerIndex, 1);

                    watchingPayload.broadcastMission = 'removeSurveyMarker';

                    axios({
                        validateStatus: function (status) {
                            // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                            return status < 500;
                        },
                        method: 'post',
                        url: 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/SurveyMarkerInfos/' + this.markerName,
                        headers: {
                            'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                            'X-M2M-Origin': 'SVue',
                            'Content-Type': 'application/json;ty=4'
                        },
                        data: {
                            'm2m:cin': {
                                con: this.$store.state.surveyMarkers[this.markerName]
                            }
                        }
                    }).then(
                        function (res) {
                            console.log('removeMarkerDroneInfo-axios', res.data);
                        }
                    ).catch(
                        function (err) {
                            console.log(err.message);
                        }
                    );
                }
                else {
                    let oldObj = JSON.parse(JSON.stringify(this.$store.state.surveyMarkers[this.markerName][this.markerIndex]));
                    this.$store.state.surveyMarkers[this.markerName].splice(this.markerIndex, 1);
                    this.$store.state.surveyMarkers.unknown.push(oldObj);

                    watchingPayload.broadcastMission = 'deleteSurveyMarker';

                    axios({
                        validateStatus: function (status) {
                            // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                            return status < 500;
                        },
                        method: 'post',
                        url: 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/SurveyMarkerInfos/' + this.markerName,
                        headers: {
                            'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                            'X-M2M-Origin': 'SVue',
                            'Content-Type': 'application/json;ty=4'
                        },
                        data: {
                            'm2m:cin': {
                                con: this.$store.state.surveyMarkers[this.markerName]
                            }
                        }
                    }).then(
                        function (res) {
                            console.log('deleteMarkerDroneInfo-axios', res.data);
                        }
                    ).catch(
                        function (err) {
                            console.log(err.message);
                        }
                    );

                    axios({
                        validateStatus: function (status) {
                            // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                            return status < 500;
                        },
                        method: 'post',
                        url: 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/SurveyMarkerInfos/' + 'unknown',
                        headers: {
                            'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                            'X-M2M-Origin': 'SVue',
                            'Content-Type': 'application/json;ty=4'
                        },
                        data: {
                            'm2m:cin': {
                                con: this.$store.state.surveyMarkers.unknown
                            }
                        }
                    }).then(
                        function (res) {
                            console.log('deleteMarkerDroneInfo-axios', res.data);
                        }
                    ).catch(
                        function (err) {
                            console.log(err.message);
                        }
                    );

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

            resetForm() {
                // this.form = Object.assign({}, this.defaultForm)
                // this.$refs.form.reset()

                this.$emit('input', false);
            },

            submit() {
                let payload = {};
                payload.pOldName = this.markerName;
                payload.pName = this.targetSelect;
                payload.pIndex = parseInt(this.targetSelectIndex);
                payload.targetAlt = this.targetAlt;
                payload.targetSpeed = this.targetSpeed;
                payload.targetRadius = this.targetRadius;
                payload.targetTurningSpeed = this.targetTurningSpeed;
                payload.targetMavCmd = 16;
                payload.paramAngle = this.paramAngle;
                payload.pOldIndex = this.markerIndex;
                payload.targetColor = this.curDroneColorMap;

                this.$store.commit('registerMarker', payload);

                EventBus.$emit('doBroadcastRegisterMaker', payload);

                payload = null;

                this.snackbar = true;

                setTimeout(() => {
                    this.resetForm();
                }, 100);

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

                var m_icon = JSON.parse(JSON.stringify(this.$store.state.surveyMarkers[this.markerName][this.markerIndex].m_icon));

                if(this.$store.state.surveyMarkers[this.markerName][this.markerIndex].type === 'Goto') {
                    m_icon.path = this.$store.state.defaultGotoMarkerIcon.path;
                    m_icon.anchor = this.$store.state.defaultGotoMarkerIcon.anchor;
                    m_icon.labelOrigin = this.$store.state.defaultGotoMarkerIcon.labelOrigin;
                    this.$store.state.surveyMarkers[this.markerName][this.markerIndex].m_icon = JSON.parse(JSON.stringify(m_icon));
                }
                else if(this.$store.state.surveyMarkers[this.markerName][this.markerIndex].type === 'Circle') {
                    m_icon.path = this.$store.state.defaultCircleMarkerIcon.path;
                    m_icon.anchor = this.$store.state.defaultCircleMarkerIcon.anchor;
                    m_icon.labelOrigin = this.$store.state.defaultCircleMarkerIcon.labelOrigin;
                    this.$store.state.surveyMarkers[this.markerName][this.markerIndex].m_icon = JSON.parse(JSON.stringify(m_icon));
                }
                else {
                    m_icon.path = this.$store.state.defaultGotoMarkerIcon.path;
                    m_icon.anchor = this.$store.state.defaultGotoMarkerIcon.anchor;
                    m_icon.labelOrigin = this.$store.state.defaultGotoMarkerIcon.labelOrigin;
                    this.$store.state.surveyMarkers[this.markerName][this.markerIndex].m_icon = JSON.parse(JSON.stringify(m_icon));
                }

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
            this.targetLat = this.marker.lat;
            this.targetLng = this.marker.lng;
            this.targetAlt = this.marker.alt;
            this.targetSpeed = this.marker.speed;
            this.targetRadius = this.marker.radius;
            this.targetTurningSpeed = this.marker.turningSpeed;


            this.paramAngle = this.$store.state.surveyMarkers[this.markerName][this.markerIndex].angle;

            this.elevation = this.marker.elevation;

            this.targetType = this.marker.type;

            console.log('InfoSurveyMarker', this.$store.state.surveyMarkers[this.markerName]);

            EventBus.$on('on-update-infomarker', () => {
                this.targetLat = this.$store.state.surveyMarkers[this.markerName][this.markerIndex].lat;
                this.targetLng = this.$store.state.surveyMarkers[this.markerName][this.markerIndex].lng;
                this.targetAlt = this.$store.state.surveyMarkers[this.markerName][this.markerIndex].alt;
                this.elevation = this.$store.state.surveyMarkers[this.markerName][this.markerIndex].elevation;

                this.$forceUpdate();
            });
        },

        beforeDestroy() {
            EventBus.$off('on-update-infomarker');
        }
    }
</script>

<style scoped>

</style>