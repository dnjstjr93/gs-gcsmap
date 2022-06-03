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
<!--                <v-row align="center" justify="center">-->
<!--                    <v-col cols="12">-->
<!--                        <v-card flat tile class="px-5">-->
<!--                            <v-radio-group label="Marker Type:" v-model="targetType" row hide-details @change="selectTargetType($event)">-->
<!--                                <v-radio label="Goto" value="Goto"></v-radio>-->
<!--                                <v-radio label="Circle" value="Circle"></v-radio>-->
<!--                                <v-radio label="Survey" value="Survey"></v-radio>-->
<!--                            </v-radio-group>-->
<!--                        </v-card>-->
<!--                    </v-col>-->
<!--                </v-row>-->
                <v-row align="center" justify="center">
                    <v-col cols="2">
                        <v-combobox
                            v-model="targetSelectName"
                            :items="targets"
                            label="Target"
                            chips dense hide-details single-line
                            :disabled="disableTargetSelect"
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
<!--                    <v-col cols="2" v-if="targetType === 'Circle'" class="text-center">-->
<!--                        <v-card flat tile>-->
<!--                            <span class="display-0 font-weight-bold">선회반지름</span>-->
<!--                            <span class="pl-6 display-1 font-weight-light">{{targetRadius}}</span>-->
<!--                            <span class="subheading font-weight-light mx-1">m</span>-->
<!--                        </v-card>-->
<!--                        <v-card flat tile class="pl-2 pt-12">-->
<!--                            <v-row align="center" justify="center">-->
<!--                                <v-col cols="8">-->
<!--                                    <v-slider-->
<!--                                        v-model="targetRadius"-->
<!--                                        color="blue"-->
<!--                                        hint="Speed"-->
<!--                                        min="5"-->
<!--                                        max="255"-->
<!--                                        thumb-label="always"-->
<!--                                        track-fill-color="orange"-->
<!--                                        dense-->
<!--                                        ticks-->
<!--                                        hide-details-->
<!--                                    >-->
<!--                                        <template v-slot:prepend>-->
<!--                                            <v-icon-->
<!--                                                color="primary"-->
<!--                                                @click="decrementRadius"-->
<!--                                            >-->
<!--                                                mdi-minus-->
<!--                                            </v-icon>-->
<!--                                        </template>-->

<!--                                        <template v-slot:append>-->
<!--                                            <v-icon-->
<!--                                                color="secondary"-->
<!--                                                @click="incrementRadius"-->
<!--                                            >-->
<!--                                                mdi-plus-->
<!--                                            </v-icon>-->
<!--                                        </template>-->
<!--                                    </v-slider>-->
<!--                                </v-col>-->
<!--                                <v-col cols="4">-->
<!--                                    <v-text-field-->
<!--                                        v-model="targetRadius"-->
<!--                                        class="mt-0 pt-0"-->
<!--                                        hide-details-->
<!--                                        single-line-->
<!--                                        type="number"-->
<!--                                        outlined dense-->
<!--                                        color="blue"-->
<!--                                    ></v-text-field>-->
<!--                                </v-col>-->
<!--                            </v-row>-->
<!--                        </v-card>-->
<!--                    </v-col>-->
<!--                    <v-col cols="2" v-if="targetType === 'Circle'" class="text-center">-->
<!--                        <v-card flat tile>-->
<!--                            <span class="display-0 font-weight-bold">선회속도</span>-->
<!--                            <span class="pl-6 display-1 font-weight-light">{{targetTurningSpeed}}</span>-->
<!--                            <span class="subheading font-weight-light mx-1">m/rad</span>-->
<!--                        </v-card>-->
<!--                        <v-card flat tile class="pl-2 pt-12">-->
<!--                            <v-row align="center" justify="center">-->
<!--                                <v-col cols="8">-->
<!--                                    <v-slider-->
<!--                                            v-model="targetTurningSpeed"-->
<!--                                            color="purple"-->
<!--                                            hint="Speed"-->
<!--                                            min="5"-->
<!--                                            max="20"-->
<!--                                            thumb-label="always"-->
<!--                                            track-fill-color="orange"-->
<!--                                            dense-->
<!--                                            ticks-->
<!--                                            hide-details-->
<!--                                    >-->
<!--                                        <template v-slot:prepend>-->
<!--                                            <v-icon-->
<!--                                                    color="primary"-->
<!--                                                    @click="decrementTurningSpeed"-->
<!--                                            >-->
<!--                                                mdi-minus-->
<!--                                            </v-icon>-->
<!--                                        </template>-->

<!--                                        <template v-slot:append>-->
<!--                                            <v-icon-->
<!--                                                    color="secondary"-->
<!--                                                    @click="incrementTurningSpeed"-->
<!--                                            >-->
<!--                                                mdi-plus-->
<!--                                            </v-icon>-->
<!--                                        </template>-->
<!--                                    </v-slider>-->
<!--                                </v-col>-->
<!--                                <v-col cols="4">-->
<!--                                    <v-text-field-->
<!--                                        v-model="targetTurningSpeed"-->
<!--                                        class="mt-0 pr-2"-->
<!--                                        hide-details-->
<!--                                        single-line-->
<!--                                        type="number"-->
<!--                                        outlined dense-->
<!--                                        color="purple"-->
<!--                                    ></v-text-field>-->
<!--                                </v-col>-->
<!--                            </v-row>-->
<!--                        </v-card>-->
<!--                    </v-col>-->
<!--                    <v-col cols="12" sm="1" class="text-center">-->
<!--                        <v-card flat tile>-->
<!--                            <span class="display-0 font-weight-bold">대기시간</span>-->
<!--                            <span class="pl-6 display-1 font-weight-light">{{targetStayTime}}</span>-->
<!--                            <span class="subheading font-weight-light mx-1">sec</span>-->
<!--                        </v-card>-->
<!--                        <v-card flat tile class="px-2 pt-12">-->
<!--                            <v-text-field-->
<!--                                v-model="targetStayTime"-->
<!--                                class="mt-0 pt-0"-->
<!--                                hide-details-->
<!--                                single-line-->
<!--                                type="number"-->
<!--                                style="width: 80px"-->
<!--                                outlined dense-->
<!--                                color="amber"-->
<!--                            ></v-text-field>-->
<!--                        </v-card>-->
<!--                    </v-col>-->
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
                <v-btn text color="warning" fab dark @click="deleteTempMarker" outlined>
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
        name: "InfoTempMarker",

        props: [
            'value',
            'marker',
            'markerName',
            'markerIndex',
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
                targets: [],

                select: 'Vuetify',
                items: [
                    'Programming',
                    'Design',
                    'Vue',
                    'Vuetify',
                ],

                targetTypes: ['Goto', 'Circle', 'Survey'],
                targetType: 'Goto',
                targetSelectName: '',
                targetSelectIndex: '0',
                oldTargetSelect: '',
                targetLat: 0,
                targetLng: 0,
                targetAlt: 20,
                targetSpeed: 5,
                targetRadius: 10,
                targetTurningSpeed: 10,
                targetStayTime: 1,
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
            // targetSelectName: function (newVal, oldVal) {
            //     console.log('targetSelectName - watch', oldVal, ' -> ', newVal);
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

                    if(Object.hasOwnProperty.call(newVal, 'targetMavCmd')) {
                        this.targetMavCmd = newVal.targetMavCmd;
                    }
                    else {
                        this.targetMavCmd = 16;
                    }

                    if(Object.hasOwnProperty.call(newVal, 'targetStayTime')) {
                        this.targetStayTime = newVal.targetStayTime;
                    }
                    else {
                        this.targetStayTime = 1;
                    }

                    this.elevation = newVal.elevation.toFixed(1);
                }
            },

            targetSelectName: function (newVal) {
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
                for(let idx in this.$store.state.tempMarkers[this.markerName]) {
                    if(Object.prototype.hasOwnProperty.call(this.$store.state.tempMarkers[this.markerName], idx)) {
                        arrIndex.push(idx);
                    }
                }

                return (arrIndex);
            },
            icon () {
                return 'mdi-checkbox-blank-outline'
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
                if(this.markerName === 'unknown') {
                    this.$store.state.tempMarkers[this.markerName][this.markerIndex].selected = false;
                    this.$store.state.tempMarkers[this.markerName].splice(this.markerIndex, 1);

                    let temp = JSON.parse(JSON.stringify(this.$store.state.tempMarkers[this.markerName]));
                    this.$store.state.tempMarkers[this.markerName] = null;
                    this.$store.state.tempMarkers[this.markerName] = JSON.parse(JSON.stringify(temp));

                    let payload = {};

                    this.postCinTempMarkerInfoToMobius(this.markerName);
                    payload.dName = this.markerName;
                    EventBus.$emit('doBroadcastRegisterTempMaker', payload);
                }
                else {
                    this.$store.state.tempMarkers[this.markerName][this.markerIndex].selected = false;
                    let targetTempMarker = this.$store.state.tempMarkers[this.markerName].splice(this.markerIndex, 1);
                    this.$store.state.tempMarkers['unknown'].push(targetTempMarker[0]);

                    let temp = JSON.parse(JSON.stringify(this.$store.state.tempMarkers[this.markerName]));
                    this.$store.state.tempMarkers[this.markerName] = null;
                    this.$store.state.tempMarkers[this.markerName] = JSON.parse(JSON.stringify(temp));

                    let payload = {};

                    this.postCinTempMarkerInfoToMobius(this.markerName);
                    payload.dName = this.markerName;
                    EventBus.$emit('doBroadcastRegisterTempMaker', payload);

                    this.postCinTempMarkerInfoToMobius('unknown');
                    payload.dName = 'unknown';
                    EventBus.$emit('doBroadcastRegisterTempMaker', payload);
                }

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

            submit() {
                if(this.markerName !== this.targetSelectName) {
                    this.$store.state.tempMarkers[this.markerName][this.markerIndex].selected = false;
                    let targetTempMarker = this.$store.state.tempMarkers[this.markerName].splice(this.markerIndex, 1);
                    this.$store.state.tempMarkers[this.targetSelectName].push(targetTempMarker[0]);

                    let temp = JSON.parse(JSON.stringify(this.$store.state.tempMarkers[this.markerName]));
                    this.$store.state.tempMarkers[this.markerName] = null;
                    this.$store.state.tempMarkers[this.markerName] = JSON.parse(JSON.stringify(temp));

                    let payload = {};

                    this.postCinTempMarkerInfoToMobius(this.markerName);
                    payload.dName = this.markerName;
                    EventBus.$emit('doBroadcastRegisterTempMaker', payload);

                    this.postCinTempMarkerInfoToMobius(this.targetSelectName);
                    payload.dName = this.targetSelectName;
                    EventBus.$emit('doBroadcastRegisterTempMaker', payload);
                }
                else if(this.markerIndex !== this.targetSelectIndex) {
                    this.$store.state.tempMarkers[this.markerName][this.markerIndex].selected = false;
                    let targetTempMarker = this.$store.state.tempMarkers[this.markerName].splice(this.markerIndex, 1);
                    this.$store.state.tempMarkers[this.markerName].splice(this.targetSelectIndex, 0, targetTempMarker[0]);

                    let temp = JSON.parse(JSON.stringify(this.$store.state.tempMarkers[this.markerName]));
                    this.$store.state.tempMarkers[this.markerName] = null;
                    this.$store.state.tempMarkers[this.markerName] = JSON.parse(JSON.stringify(temp));

                    this.postCinTempMarkerInfoToMobius(this.markerName);

                    let payload = {};
                    payload.dName = this.markerName;
                    EventBus.$emit('doBroadcastRegisterTempMaker', payload);
                }

                this.snackbar = true;

                setTimeout(() => {
                    this.resetForm();
                }, 100);
            },

            selectTargetType(event) {
                this.$store.state.tempMarkers[this.markerName][this.markerIndex].type = event;

                console.log('InfoTempMarker:selectTargetType - ' + this.$store.state.tempMarkers[this.markerName][this.markerIndex].type);

                let temp = JSON.parse(JSON.stringify(this.$store.state.tempMarkers));
                this.$store.state.tempMarkers = null;
                this.$store.state.tempMarkers = JSON.parse(JSON.stringify(temp));
                temp = null;

                this.targetType = this.$store.state.tempMarkers[this.markerName][this.markerIndex].type;
            },
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

            if(Object.hasOwnProperty.call(this.marker, 'targetStayTime')) {
                this.targetStayTime = this.marker.targetStayTime;
            }
            else {
                this.targetStayTime = 1;
            }

            this.elevation = this.marker.elevation.toFixed(1);

            this.targetType = this.marker.type;

            console.log('InfoTempMarker', this.$store.state.tempMarkers[this.markerName]);
        },

        beforeDestroy() {
        }
    }
</script>

<style scoped>

</style>