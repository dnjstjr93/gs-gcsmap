<template>
    <div>
        <v-app-bar app color="primary" dark dense>
            <v-toolbar-title>
                <v-row no-gutters align="center">
                    <v-icon left>mdi-monitor-dashboard</v-icon>
                    KETI GCS
                </v-row>
            </v-toolbar-title>

            <v-spacer></v-spacer>

            <v-btn text @click.stop="mapDownload" :disabled="!$store.state.MOBIUS_CONNECTION.connected">
                <v-icon>mdi-monitor-arrow-down-variant</v-icon>
            </v-btn>

            <v-btn text @click.stop="mapAngleDialog=true" :disabled="!$store.state.MOBIUS_CONNECTION.connected">
                <v-icon>mdi-format-rotate-90</v-icon>
            </v-btn>

            <v-btn text @click.stop="setGCSHomePosition" :disabled="!$store.state.MOBIUS_CONNECTION.connected">
                <v-icon>mdi-crosshairs-gps</v-icon>
            </v-btn>

            <v-btn text @click.stop="dialogProfile">
                <!--            <v-icon>mdi-quadcopter</v-icon>-->
                <v-icon>mdi-cog-transfer</v-icon>
            </v-btn>


            <!--        <v-btn text @click.stop="openCam">-->
            <!--            <v-icon>mdi-video</v-icon>-->
            <!--        </v-btn>-->

            <v-btn text @click.stop="openCam2" :disabled="!$store.state.MOBIUS_CONNECTION.connected">
                <v-icon>mdi-video</v-icon>
            </v-btn>

            <!--        <router-link-->
            <!--                to="/cam"-->
            <!--                target="_blank"-->
            <!--        >-->
            <!--            <v-btn text>-->
            <!--                <v-icon>mdi-video</v-icon>-->
            <!--            </v-btn>-->
            <!--        </router-link>-->

            <v-btn text :disabled="!$store.state.MOBIUS_CONNECTION.connected">
                <v-icon>mdi-account</v-icon>
            </v-btn>

            <v-dialog
                v-model="mapAngleDialog"
                max-width="340"
            >
                <v-card class="pa-3 pt-5">
                    <v-row no-gutters align="center" justify="center">
                        <v-spacer/>
                        <v-col cols="2" class="text-center">
                            <v-icon>
                                mdi-format-rotate-90
                            </v-icon>
                        </v-col>
                        <v-spacer/>
                        <v-col cols="5">
                            <v-text-field
                                label="mapAngle(°)"
                                v-model="mapAngle"
                                class="ma-0 pa-0"
                                type="number"
                                outlined dense hide-details
                                color="amber"
                                min="-360"
                                max="360"
                            ></v-text-field>
                        </v-col>
                    </v-row>
                    <v-row no-gutters align="center" justify="center">
                        <v-col cols="6">
                            <v-card-actions>
                                <v-btn
                                    color="green darken-1"
                                    text outlined
                                    @click="rotateMapAngle"
                                >
                                    OK
                                </v-btn>
                                <v-btn
                                    color="red darken-1"
                                    text outlined
                                    @click="mapAngleDialog = false"
                                >
                                    Cancel
                                </v-btn>
                            </v-card-actions>
                        </v-col>
                    </v-row>
                </v-card>
            </v-dialog>

            <v-dialog v-model="dialog" persistent max-width="960px">
                <v-card id="create" class="mx-auto">
                    <v-toolbar color="teal" dark>
                        <v-icon left>mdi-quadcopter</v-icon>
                        <v-toolbar-title>Settings</v-toolbar-title>
                        <template v-slot:extension>
                            <v-speed-dial
                                v-model="fab"
                                :top="true"
                                :bottom="false"
                                :right="false"
                                :left="true"
                                direction="right"
                                :open-on-hover="true"
                                transition="Scale"
                            >
                                <template v-slot:activator>
                                    <v-btn v-model="fab" color="blue darken-2" dark fab>
                                        <v-icon v-if="fab">mdi-close</v-icon>
                                        <v-icon v-else>mdi-card-bulleted-settings-outline</v-icon>
                                    </v-btn>
                                </template>
                                <v-btn disabled fab dark small color="green">
                                    <v-icon>mdi-pencil</v-icon>
                                </v-btn>
                                <v-btn fab dark small color="indigo" @click.stop="add_dialog = true">
                                    <v-icon>mdi-plus</v-icon>
                                </v-btn>
                            </v-speed-dial>

                            <v-row no-gutters class="text-right justify-end mb-2">
                                <v-col cols="4">
                                    <!--                            <v-text-field hide-details ref="host" v-model="host" :rules="host_rule" placeholder="203.253.128.177" label="Host*" required></v-text-field>-->
                                    <v-text-field
                                        class="pl-16 mx-2 mt-1"
                                        dense hide-details outlined
                                        ref="host"
                                        v-model="host" :rules="host_rule"
                                        placeholder="203.253.128.177"
                                        label="HOST*"
                                        required
                                        :disabled="$store.state.MOBIUS_CONNECTION.connected"
                                    ></v-text-field>
                                </v-col>
                                <v-col cols="3">
                                    <v-text-field
                                        class="mt-1"
                                        dense hide-details outlined
                                        ref="gcs"
                                        v-model="gcs" :rules="gcs_rule"
                                        placeholder="KETI_GCS"
                                        label="GCS*"
                                        required
                                        :disabled="$store.state.MOBIUS_CONNECTION.connected"
                                    ></v-text-field>
                                </v-col>
                                <v-col cols="4">
                                    <v-btn
                                        class="mx-2 mt-1"
                                        tile @click="GcsAppBarConnected"
                                        elevation="5"
                                        color="primary"
                                        :disabled="$store.state.MOBIUS_CONNECTION.connected"
                                    > {{ MOBIUS_CONNECTION_TEXT }}
                                    </v-btn>
                                    <!--            </v-col>-->
                                    <!--            <v-col cols="2">-->
                                    <v-btn
                                        class="mx-2 mt-1"
                                        tile text outlined @click="GcsAppBarDisconnected"
                                        elevation="1"
                                        dark
                                        :disabled="!$store.state.MOBIUS_CONNECTION.connected"
                                    > {{ MOBIUS_DISCONNECTION_TEXT }}
                                    </v-btn>
                                </v-col>
                            </v-row>
                        </template>
                    </v-toolbar>

                    <v-container fluid>
                        <v-row class="mb-1">
                            <v-col cols="2">
                                <v-subheader>Drone List</v-subheader>
                            </v-col>
                        </v-row>
                        <v-data-table
                            v-model="selected"
                            :headers="headers"
                            :items="drone_infos_list"
                            :single-select="false"
                            item-key="name"
                            show-select
                            class="elevation-1"
                        >
                            <template v-slot:item.color="{item}">
                                <v-avatar
                                    size="32"
                                    class="white--text"
                                    v-text="String(item.color).slice(0,1).toUpperCase()"
                                    :color="item.color"
                                ></v-avatar>
                            </template>
                            <template v-slot:item.update="{ item }">
                                <v-btn fab dark x-small color="green" @click.stop="updateProfile(item)">
                                    <v-icon small>mdi-pencil</v-icon>
                                </v-btn>
                            </template>
                            <template v-slot:item.del="{ item }">
                                <v-btn fab dark x-small color="red" @click.stop="removeProfile(item)">
                                    <v-icon small>mdi-delete</v-icon>
                                </v-btn>
                            </template>
                        </v-data-table>
                    </v-container>
                    <v-row no-gutters class="justify-end pb-3 pr-3">
                        <v-btn tile dark color="warning" elevation="5" class="font-weight-bold"
                               @click.stop="confirmSelected(false)">
                            <v-icon left>mdi-ticket-confirmation-outline</v-icon>
                            확인
                        </v-btn>
                    </v-row>
                </v-card>

                <v-dialog v-model="add_dialog" persistent max-width="600px">
                    <v-card ref="form">
                        <v-card-title>
                            <span class="headline">Drone Profile</span>
                        </v-card-title>
                        <v-card-text>
                            <v-container>
                                <v-row>
<!--                                <v-col cols="12" sm="6">-->
<!--                                    <v-text-field ref="drone_host" v-model="drone_host" :rules="drone_host_rule" label="Drone Host*" required></v-text-field>-->
<!--                                </v-col>-->
                                    <v-col cols="12" sm="6">
                                        <v-text-field ref="drone_name" v-model="drone_name" :rules="drone_name_rule"
                                                      label="Drone Name*" required></v-text-field>
                                    </v-col>
                                    <v-col cols="12" sm="6">
                                        <v-text-field ref="drone_id" v-model="drone_id" :rules="drone_id_rule"
                                                      label="Drone ID*" hint="Unique ID of Drone" persistent-hint
                                                      required
                                        ></v-text-field>
                                    </v-col>
                                    <!--                                <v-col cols="12" sm="6">-->
                                    <!--                                    <v-text-field ref="gcs_name" v-model="gcs_name" :rules="gcs_name_rule" value="KETI_MUV" label="GCS Name*" hint="Name of Drone GCS" persistent-hint required></v-text-field>-->
                                    <!--                                </v-col>-->
                                    <v-col cols="12" sm="6">
                                        <v-select
                                            v-model="type_selected"
                                            :items="['ardupilot', 'px4', 'dji', 'etc']"
                                            label="Type*"
                                            hint="Type of FC"
                                            required
                                            hide-details
                                        ></v-select>
                                    </v-col>
                                    <v-col cols="12" sm="3">
                                        <v-text-field ref="bat_cell" v-model="bat_cell" :rules="bat_cell_rule"
                                                      label="Battery Cell*" required></v-text-field>
                                    </v-col>
                                    <v-col cols="12" sm="4">
                                        <v-text-field
                                            ref="system_id"
                                            v-model="system_id" :rules="system_id_rule"
                                            label="System ID*"
                                            hint="System id of Drone"
                                            persistent-hint
                                            required
                                        ></v-text-field>
                                    </v-col>
                                    <v-col cols="12" sm="5">
                                        <v-combobox
                                            v-model="color_selected"
                                            :items="['red', 'pink', 'deep-purple', 'purple', 'indigo', 'blue', 'light-blue', 'cyan', 'teal', 'green', 'light-green', 'lime', 'yellow', 'amber', 'orange', 'deep-orange', 'brown', 'blue-grey']"
                                            label="Color"
                                            chips
                                            dense
                                            hide-details
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
                                                        :color="data.item"
                                                    ></v-avatar>
                                                    {{ data.item }}
                                                </v-chip>
                                            </template>
                                        </v-combobox>
                                    </v-col>
                                </v-row>
                            </v-container>
                            <small>*indicates required field</small>
                        </v-card-text>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn
                                color="blue darken-1"
                                text
                                @click="cancel"
                            >
                                Close
                            </v-btn>
                            <v-btn
                                color="blue darken-1"
                                text
                                @click="submitAddProfile"
                            >
                                Add
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>
                <v-dialog v-model="update_dialog" persistent max-width="600px">
                    <v-card ref="form">
                        <v-card-title>
                            <span class="headline">Drone Profile</span>
                        </v-card-title>
                        <v-card-text>
                            <v-container>
                                <v-row>
<!--                                <v-col cols="12" sm="6">-->
<!--                                    <v-text-field ref="drone_host" v-model="drone_host" :rules="drone_host_update_rule" label="Drone Host*" required></v-text-field>-->
<!--                                </v-col>-->
                                    <v-col cols="12" sm="6">
                                        <v-text-field
                                            disabled ref="drone_name" v-model="drone_name"
                                            :rules="drone_name_update_rule" label="Drone Name*"
                                            required
                                        ></v-text-field>
                                    </v-col>
                                    <v-col cols="12" sm="6">
                                        <v-text-field
                                            disabled ref="drone_id" v-model="drone_id" :rules="drone_id_rule"
                                            label="Drone ID*" hint="Unique ID of Drone" persistent-hint
                                            required
                                        ></v-text-field>
                                    </v-col>
<!--                                <v-col cols="12" sm="6">-->
<!--                                    <v-text-field ref="gcs_name" v-model="gcs_name" :rules="gcs_name_rule" value="KETI_MUV" label="GCS Name*" hint="Name of Drone GCS" persistent-hint required></v-text-field>-->
<!--                                </v-col>-->
                                    <v-col cols="12" sm="6">
                                        <v-select
                                            v-model="type_selected"
                                            :items="['ardupilot', 'px4', 'dji', 'etc']"
                                            label="Type*"
                                            hint="Type of FC"
                                            required
                                            hide-details
                                        ></v-select>
                                    </v-col>
                                    <v-col cols="12" sm="3">
                                        <v-text-field
                                            ref="bat_cell" v-model="bat_cell" :rules="bat_cell_rule"
                                            label="Battery Cell*" required
                                        ></v-text-field>
                                    </v-col>
                                    <v-col cols="12" sm="4">
                                        <v-text-field
                                            ref="system_id"
                                            v-model="system_id" :rules="system_id_rule"
                                            label="System ID*"
                                            hint="System id of Drone"
                                            persistent-hint
                                            required
                                        ></v-text-field>
                                    </v-col>
                                    <v-col cols="12" sm="5">
                                        <v-combobox
                                            v-model="color_selected"
                                            :items="['red', 'pink', 'deep-purple', 'purple', 'indigo', 'blue', 'light-blue', 'cyan', 'teal', 'green', 'light-green', 'lime', 'yellow', 'amber', 'orange', 'deep-orange', 'brown', 'blue-grey']"
                                            label="Color"
                                            chips
                                            dense
                                            hide-details
                                        >
                                            <template v-slot:selection="data">
                                                <v-chip
                                                    class="ma-0"
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
                                                        :color="data.item"
                                                    ></v-avatar>
                                                    {{ data.item }}
                                                </v-chip>
                                            </template>
                                        </v-combobox>
                                    </v-col>
                                </v-row>
                            </v-container>
                            <small>*indicates required field</small>
                        </v-card-text>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn
                                color="blue darken-1"
                                text
                                @click="update_cancel"
                            >
                                Close
                            </v-btn>
                            <v-btn
                                color="blue darken-1"
                                text
                                @click="update_submit"
                            >
                                Update
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>
            </v-dialog>

        </v-app-bar>

        <!--    <WindowPortal v-model="open">-->
        <!--        <WebrtcCard></WebrtcCard>-->
        <!--    </WindowPortal>-->

    </div>
</template>

<script>
import axios from 'axios'
import EventBus from "@/EventBus";
// import WindowPortal from "./WindowPortal";
// import WebrtcCard from "./WebrtcCard";

export default {
    name: "GcsAppBar",

    components: {
        // WebrtcCard,
        // WindowPortal
    },

    data: function () {
        return {
            mapAngleDialog: false,
            mapAngle: 0,
            open: false,
            MOBIUS_DISCONNECTION_TEXT: 'Disconnect',
            MOBIUS_CONNECTION_TEXT: 'Connect',
            //MOBIUS_CONNECTION_CONNECTED: this.$cookies.isKey('MOBIUS_CONNECTION_CONNECTED')?(this.$cookies.get('mobius_connected') === 'true'):false,
            MOBIUS_CONNECTION_DISABLED: false,
            update_idx: 0,
            formHasErrors: false,
            errorMessages: [],
            drone_host: null,
            // drone_host_rule: [
            //     v => !!v || '드론 호스트는 필수 입력사항입니다.',
            //     v => !/[~!@#$%^&*()+|<>?:{}]/.test(v) || '드론 이름에는 특수문자를 사용할 수 없습니다.'
            // ],
            // drone_host_update_rule: [
            //     v => !!v || '드론 호스트은 필수 입력사항입니다.',
            //     v => !/[~!@#$%^&*()+|<>?:{}]/.test(v) || '드론 이름에는 특수문자를 사용할 수 없습니다.'
            // ],
            drone_name: null,
            drone_name_rule: [
                v => !!v || '드론 이름은 필수 입력사항입니다.',
                v => !/[~!@#$%^&*()+|<>?:{}]/.test(v) || '드론 이름에는 특수문자를 사용할 수 없습니다.',
                v => (this.drone_infos_list.findIndex((element) => {
                    return (element.name === v)
                }) === -1) || '드론 이름이 이미 존재합니다.'
            ],
            init_drone_name: null,
            drone_name_update_rule: [
                v => !!v || '드론 이름은 필수 입력사항입니다.',
                v => !/[~!@#$%^&*()+|<>?:{}]/.test(v) || '드론 이름에는 특수문자를 사용할 수 없습니다.',
                v => (this.drone_infos_list.findIndex((element) => {
                    return ((element.name === v) && (this.init_drone_name !== v))
                }) === -1) || '드론 이름이 이미 존재합니다.'
            ],
            drone_id: null,
            drone_id_rule: [
                v => !!v || '드론 아이디는 필수 입력사항입니다.',
                v => /^[a-zA-Z0-9]*$/.test(v) || '드론 아이디는 영문+숫자만 입력 가능합니다.',
                v => (this.drone_infos_list.findIndex((element) => {
                    return (element.id === v)
                }) === -1) || '드론 아이디가 이미 존재합니다.'
            ],
            init_drone_id: null,
            drone_id_update_rule: [
                v => !!v || '드론 아이디는 필수 입력사항입니다.',
                v => /^[a-zA-Z0-9]*$/.test(v) || '드론 아이디는 영문+숫자만 입력 가능합니다.',
                v => (this.drone_infos_list.findIndex((element) => {
                    return ((element.id === v) && (this.init_drone_id !== v))
                }) === -1) || '드론 이름이 이미 존재합니다.'
            ],
            bat_cell: null,
            bat_cell_rule: [
                v => !!v || '배터리 셀 수는 필수 입력사항입니다.',
                v => /^[0-9]*$/.test(v) || '배터리 셀 수는 숫자만 입력 가능합니다.'
            ],
            system_id: null,
            system_id_rule: [
                v => !!v || '드론 시스템 아이디는 필수 입력사항입니다.',
                v => /^[0-9]*$/.test(v) || '드론 시스템 아이디는 숫자만 입력 가능합니다.',
                v => !(v > 254) || '드론 시스템 아이디는 255를 넘을 수 없습니다.',
                v => !(v <= 0) || '드론 시스템 아이디는 1 이상의 수만 입력 가능합니다.'
            ],
            //host: this.$cookies.isKey('mobius_host')?(this.$cookies.get('mobius_host')):(this.$store.state.VUE_APP_MOBIUS_HOST),
            host: localStorage.getItem('mobius_host') ? (localStorage.getItem('mobius_host')) : (this.$store.state.VUE_APP_MOBIUS_HOST),
            host_rule: [
                v => !!v || '호스트 주소는 필수 입력사항입니다.',
                v => /^[.0-9]*$/.test(v) || '호스트 주소는 숫자만 입력 가능합니다.'
            ],
            //gcs: this.$cookies.isKey('mobius_gcs')?(this.$cookies.get('mobius_gcs')):(this.$store.state.VUE_APP_MOBIUS_GCS),
            gcs: localStorage.getItem('mobius_gcs') ? (localStorage.getItem('mobius_gcs')) : (this.$store.state.VUE_APP_MOBIUS_GCS),
            gcs_rule: [
                v => !!v || 'GCS 이름은 필수 입력사항입니다.',
                v => !/[~!@#$%^&*()+|<>?:{}]/.test(v) || 'GCS 이름에는 특수문자를 사용할 수 없습니다.'
            ],
            // gcs_name: null,
            // gcs_name_rule: [
            //     v => !!v || 'GCS 이름은 필수 입력사항입니다.',
            //     v => !/[~!@#$%^&*()+|<>?:{}]/.test(v) || 'GCS 이름에는 특수문자를 사용할 수 없습니다.'
            // ],
            type_selected: 'ardupilot',
            color_selected: 'teal',
            selected: [],
            drone_infos_list: [],
            dialog: false,
            add_dialog: false,
            update_dialog: false,
            settings: [],
            direction: 'top',
            fab: false,
            fling: false,
            hover: false,
            tabs: null,
            top: false,
            right: true,
            bottom: true,
            left: false,
            transition: 'slide-y-reverse-transition',
            headers: [
                {text: 'color', value: 'color'},
                {
                    text: 'Drone Name',
                    align: 'start',
                    sortable: false,
                    value: 'name',
                },
                {text: 'id', value: 'id'},
                {text: 'type', value: 'type'},
                {text: 'system_id', value: 'system_id'},
                {text: 'bat_cell', value: 'bat_cell'},
                {text: 'gcs', value: 'gcs'},
                {text: '...', value: 'update'},
                {text: '...', value: 'del'},
            ],
        }
    },

    computed: {
        form() {
            return {
                //drone_host: this.drone_host,
                drone_name: this.drone_name,
                drone_id: this.drone_id,
                bat_cell: this.bat_cell,
                system_id: this.system_id,
                host: this.host,
                gcs: this.gcs,
            }
        },
    },

    methods: {
        mapDownload() {
            EventBus.$emit('do-download-map');
            console.log('mapDownload');
        },

        setGCSHomePosition() {
            // EventBus.$emit('do-setGCSHomePosition');
            console.log('setGCSHomePosition');
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

        // async postAeToMobius (callback) {
        //     try {
        //         const response = await axios.post(url, {
        //             headers: {
        //                 'X-M2M-RI': String(parseInt(Math.random() * 10000)),
        //                 'X-M2M-Origin': 'S' + this.$store.state.VUE_APP_MOBIUS_GCS,
        //                 'Content-Type': 'application/json;ty=2'
        //             },
        //             data: {
        //                 'm2m:ae': {
        //                     rn: name,
        //                     api: '0.2.481.1.1111',
        //                     lbl: [name],
        //                     rr: true,
        //                     poa: ["http://localhost:8080"]
        //                 }
        //             }
        //         });
        //         console.log('postAeToMobius', response.data['m2m:ae']);
        //         callback(response.status, response.data['m2m:ae']);
        //     }
        //     catch(err) {
        //         console.log("Error >>", err);
        //     }
        // },

        postAeToMobius(url, name, callback) {
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
                    'Content-Type': 'application/json;ty=2'
                },
                data: {
                    'm2m:ae': {
                        rn: name,
                        api: '0.2.481.1.1111',
                        lbl: [name],
                        rr: true,
                        poa: ["http://localhost:8080"]
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

        postCntLossLTEInfosToMobius(callback) {
            axios({
                validateStatus: function (status) {
                    // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                    return status < 500;
                },
                method: 'post',
                url: 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS,
                headers: {
                    'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                    'X-M2M-Origin': 'SVue',
                    'Content-Type': 'application/json;ty=3'
                },
                data: {
                    'm2m:cnt': {
                        rn: 'LossLTEInfos',
                        lbl: ['LossLTEInfos'],
                    }
                }
            }).then(
                (res) => {
                    console.log('------------------LossLTEInfos created');
                    callback(res.status, '');
                }
            ).catch(
                (err) => {
                    console.log(err.message);
                }
            );
        },

        postCntDroneInfosToMobius(callback) {
            axios({
                validateStatus: function (status) {
                    // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                    return status < 500;
                },
                method: 'post',
                url: 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS,
                headers: {
                    'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                    'X-M2M-Origin': 'SVue',
                    'Content-Type': 'application/json;ty=3'
                },
                data: {
                    'm2m:cnt': {
                        rn: 'DroneInfos',
                        lbl: ['DroneInfos'],
                    }
                }
            }).then(
                (res) => {
                    console.log('------------------DroneInfos created');
                    callback(res.status, '');
                }
            ).catch(
                (err) => {
                    console.log(err.message);
                }
            );
        },

        postCntDroneInfoToMobius(dName, callback) {
            axios({
                validateStatus: function (status) {
                    // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                    return status < 500;
                },
                method: 'post',
                url: 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/DroneInfos',
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
                (res) => {
                    callback(res.status, '');
                }
            ).catch(
                (err) => {
                    console.log(err.message);
                }
            );
        },

        getCinDroneInfoFromMobius(dName, callback) {
            axios({
                validateStatus: function (status) {
                    // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                    return status < 500;
                },
                method: 'get',
                url: 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/DroneInfos/' + dName + '/la',
                headers: {
                    'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                    'X-M2M-Origin': 'SVue',
                    'Content-Type': 'application/json'
                }
            }).then(
                (res) => {
                    if (res.status === 200) {
                        console.log(res.data);
                        if (!Object.prototype.hasOwnProperty.call(res.data['m2m:cin'], 'con')) {
                            res.data['m2m:cin'].con = {};
                            res.data['m2m:cin'].con.selected = false;
                            res.data['m2m:cin'].con.lat = 37.404324133883605 + Math.random() * 0.001;
                            res.data['m2m:cin'].con.lng = 127.16124484502097 + Math.random() * 0.001;
                            res.data['m2m:cin'].con.heading = 0;
                            res.data['m2m:cin'].con.host = this.$store.state.VUE_APP_MOBIUS_HOST;
                            res.data['m2m:cin'].con.gcs = this.$store.state.VUE_APP_MOBIUS_GCS;
                            res.data['m2m:cin'].con.type = 'ardupilot';
                            res.data['m2m:cin'].con.color = '#9E9E9E';
                            res.data['m2m:cin'].con.name = 'unknown';
                            res.data['m2m:cin'].con.drone_host = this.$store.state.VUE_APP_MOBIUS_HOST;
                            res.data['m2m:cin'].con.id = 'unknown';
                            res.data['m2m:cin'].con.bat_cell = 12;
                            res.data['m2m:cin'].con.system_id = 1;
                            res.data['m2m:cin'].con.home_position = {lat: 37.4032072, lng: 127.1595933};
                            res.data['m2m:cin'].con.goto_positions = [];
                        }

                        callback(res.status, res.data['m2m:cin'].con);
                    }
                    else if (res.status === 404) {
                        let con = {};
                        con.selected = false;
                        con.lat = 37.404324133883605 + Math.random() * 0.001;
                        con.lng = 127.16124484502097 + Math.random() * 0.001;
                        con.heading = 0;
                        con.host = this.$store.state.VUE_APP_MOBIUS_HOST;
                        con.gcs = this.$store.state.VUE_APP_MOBIUS_GCS;
                        con.type = 'ardupilot';
                        con.color = '#9E9E9E';
                        con.name = 'unknown';
                        con.drone_host = this.$store.state.VUE_APP_MOBIUS_HOST;
                        con.id = 'unknown';
                        con.bat_cell = 12;
                        con.system_id = 1;
                        con.home_position = {lat: 37.4032072, lng: 127.1595933};
                        con.goto_positions = [];

                        callback(200, con);
                    }
                    else {
                        callback(res.status, {});
                    }
                }
            ).catch(
                (err) => {
                    console.log(err.message);

                    callback(200, {});
                }
            );
        },

        getCinLossLTEInfosFromMobius(callback) {
            axios({
                validateStatus: function (status) {
                    // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                    return status < 500;
                },
                method: 'get',
                url: 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/LossLteInfos/la',
                headers: {
                    'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                    'X-M2M-Origin': 'SVue',
                    'Content-Type': 'application/json'
                }
            }).then(
                (res) => {
                    console.log('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', res)
                    if (res.status === 200) {
                        callback(res.status, res.data['m2m:cin'].con);
                    }
                    else {
                        callback(res.status, '');
                    }
                }
            ).catch(
                (err) => {
                    console.log(err.message);
                }
            );
        },

        async TestApiCall () {
            try {
                const response = await axios.post('http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/LossLteInfos', {
                    headers: {
                        'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                        'X-M2M-Origin': 'SVue',
                        'Content-Type': 'application/json;ty=4'
                    },
                    data: {
                        'm2m:cin': {
                            con: this.$store.state.loss_lte_infos,
                        }
                    }
                });
                console.log('postLossLTEInfoToMobius', response.data);
                return response.data;
            } catch(err) {
                console.log("Error >>", err);
            }
        },

        async getCntListDroneInfosFromMobius (callback) {
            try {
                const response = await axios.get('http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/DroneInfos?fu=1&ty=3', {
                    headers: {
                        'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                        'X-M2M-Origin': 'SVue',
                        'Content-Type': 'application/json'
                    }
                });
                console.log('getCntListDroneInfosFromMobius', response.data['m2m:uril']);
                callback(response.status, response.data['m2m:uril']);
            }
            catch(err) {
                console.log("Error >>", err);
            }
        },

        getCntListDroneInfosFromMobius_old(callback) {
            axios({
                validateStatus: function (status) {
                    // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                    return status < 500;
                },
                method: 'get',
                url: 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/DroneInfos?fu=1&ty=3',
                headers: {
                    'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                    'X-M2M-Origin': 'SVue',
                    'Content-Type': 'application/json'
                }
            }).then(
                (res) => {
                    if (res.status === 200) {
                        callback(res.status, res.data['m2m:uril']);
                    }
                    else {
                        callback(res.status, '');
                    }
                }
            ).catch(
                (err) => {
                    console.log(err.message);
                }
            );
        },

        postCinDroneInfoToMobius(dName, con, callback) {
            axios({
                validateStatus: function (status) {
                    // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                    return status < 500;
                },
                method: 'post',
                url: 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/DroneInfos/' + dName,
                headers: {
                    'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                    'X-M2M-Origin': 'SVue',
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

        initDroneInfos(drones, count, callback) {
            if (drones.length > count) {
                let dName = drones[count].split('/')[3];
                this.getCinDroneInfoFromMobius(dName, (status, con) => {
                    if (status === 200) {
                        console.log(count, dName, con);

                        if (dName !== 'unknown') {
                            this.drone_infos_list.push(JSON.parse(JSON.stringify(con)));
                        }

                        if(dName === 'unknown' || con.selected) {
                            this.$store.state.drone_infos[dName] = JSON.parse(JSON.stringify(con));

                            if (dName !== 'unknown') {
                                this.selected.push(this.$store.state.drone_infos[dName]);
                            }

                            if (!Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos[dName], 'name')) {
                                this.$store.state.drone_infos[dName].name = dName;
                            }

                            if (!Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos[dName], 'targeted')) {
                                this.$store.state.drone_infos[dName].targeted = false;
                            }

                            if (!Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos[dName], 'home_position')) {
                                this.$store.state.drone_infos[dName].home_position = {lat: 37.4032072, lng: 127.1595933};
                            }

                            if (!Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos[dName], 'color')) {
                                this.$store.state.drone_infos[dName].color = '#9E9E9E';
                            }

                            if(this.$store.state.drone_infos[dName].color === 'grey') {
                                this.$store.state.drone_infos[dName].color = '#9E9E9E';
                            }

                            if (!Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos[dName], 'gotoType')) {
                                this.$store.state.drone_infos[dName].gotoType = '바로이동';
                            }

                            if (!Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos[dName], 'targetModeSelection')) {
                                this.$store.state.drone_infos[dName].targetModeSelection = 'ALT_HOLD';
                            }

                            if (!Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos[dName], 'targetSpeed')) {
                                this.$store.state.drone_infos[dName].targetSpeed = 5;
                            }

                            if (!Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos[dName], 'alt')) {
                                this.$store.state.drone_infos[dName].alt = 0;
                            }

                            if (!Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos[dName], 'targetTurningSpeed')) {
                                this.$store.state.drone_infos[dName].targetTurningSpeed = 5;
                            }

                            if (!Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos[dName], 'targetRadius')) {
                                this.$store.state.drone_infos[dName].targetRadius = 50;
                            }

                            if (!Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos[dName], 'targetTakeoffAlt')) {
                                this.$store.state.drone_infos[dName].targetTakeoffAlt = 20;
                            }

                            if (!Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos[dName], 'circleType')) {
                                this.$store.state.drone_infos[dName].circleType = '시계방향';
                            }

                            if (!Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos[dName], 'targetAlt')) {
                                this.$store.state.drone_infos[dName].targetAlt = 20;
                            }

                            if (!Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos[dName], 'sortie_name')) {
                                this.$store.state.drone_infos[dName].sortie_name = 'disarm';
                            }

                            if (!Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos[dName], 'lastFlightTime')) {
                                this.$store.state.drone_infos[dName].lastFlightTime = 0;
                            }

                            if (!Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos[dName], 'autoStartIndex')) {
                                this.$store.state.drone_infos[dName].autoStartIndex = '0';
                            }

                            if (!Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos[dName], 'autoEndIndex')) {
                                this.$store.state.drone_infos[dName].autoEndIndex = '0';
                            }

                            if (!Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos[dName], 'autoDelay')) {
                                this.$store.state.drone_infos[dName].autoDelay = 1;
                            }

                            if (!Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos[dName], 'autoSpeed')) {
                                this.$store.state.drone_infos[dName].autoSpeed = 5;
                            }

                            if (!Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos[dName], 'curArmStatus')) {
                                this.$store.state.drone_infos[dName].curArmStatus = 'DISARMED';
                            }

                            if (!Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos[dName], 'takeoffAbsoluteAlt')) {
                                this.$store.state.drone_infos[dName].takeoffAbsoluteAlt = 0;
                            }

                            this.$store.state.drone_infos[dName].targeted = false;

                            if (!Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos[dName], 'airSpeed')) {
                                this.$store.state.drone_infos[dName].airSpeed = 0;
                            }

                            if (!Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos[dName], 'headingLine')) {
                                this.$store.state.drone_infos[dName].headingLine = [];
                                this.$store.state.drone_infos[dName].headingLine.push({lat: 37.4032072, lng: 127.1595933});
                                this.$store.state.drone_infos[dName].headingLine.push({lat: 37.4032072, lng: 127.1595933});
                            }

                            if (!Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos[dName], 'directionLine')) {
                                this.$store.state.drone_infos[dName].directionLine = [];
                                this.$store.state.drone_infos[dName].directionLine.push({lat: 37.4032072, lng: 127.1595933});
                                this.$store.state.drone_infos[dName].directionLine.push({lat: 37.4032072, lng: 127.1595933});
                            }

                            if (!Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos[dName], 'client')) {
                                this.$store.state.drone_infos[dName].client = {
                                    connected: false,
                                    loading: false
                                };
                            }

                            if (!Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos[dName], 'pausePosition')) {
                                this.$store.state.drone_infos[dName].pausePosition = {
                                    lat: 0,
                                    lng: 0,
                                    alt: 0,
                                    heading: 0
                                };
                            }

                            if (!Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos[dName], 'targetStayTime')) {
                                this.$store.state.drone_infos[dName].targetStayTime = 0;
                            }

                            if (!Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos[dName], 'yawBehavior')) {
                                this.$store.state.drone_infos[dName].yawBehavior = 'YAW고정';
                            }

                            if (!Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos[dName], 'flyShape')) {
                                this.$store.state.drone_infos[dName].flyShape = '직선비행';
                            }

                            if (!Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos[dName], 'startWay')) {
                                this.$store.state.drone_infos[dName].startWay = '처음부터';
                            }

                            if (!Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos[dName], 'curMissionItemReached')) {
                                this.$store.state.drone_infos[dName].curMissionItemReached = 0;
                            }

                            this.$store.state.drone_infos[dName].curTargetedTempMarkerIndex = -1;
                            this.$store.state.drone_infos[dName].curTargetedSurveyMarkerIndex = -1;

                            if (!Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos[dName], 'absolute_alt')) {
                                this.$store.state.drone_infos[dName].absolute_alt = 0;
                            }

                            if (!Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos[dName], 'rtlSpeed')) {
                                this.$store.state.drone_infos[dName].rtlSpeed = 5;
                            }

                            if (!Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos[dName], 'takeoffDelay')) {
                                this.$store.state.drone_infos[dName].takeoffDelay = 6;
                            }
                        }

                        this.initDroneInfos(drones, ++count, () => {
                            callback(0);
                        });
                    }
                    else {
                        callback(1);
                    }
                });
            }
            else {
                callback(0);
            }
        },

        createMarkerInfosToMobius(callback) {
            axios({
                validateStatus: function (status) {
                    // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                    return status < 500;
                },
                method: 'post',
                url: 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius',
                headers: {
                    'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                    'X-M2M-Origin': 'S' + this.$store.state.VUE_APP_MOBIUS_GCS,
                    'Content-Type': 'application/json;ty=2'
                },
                data: {
                    'm2m:ae': {
                        rn: this.$store.state.VUE_APP_MOBIUS_GCS,
                        api: '0.2.481.1.1111',
                        lbl: [this.$store.state.VUE_APP_MOBIUS_GCS],
                        rr: true,
                        poa: ["http://localhost:8080"]
                    }
                }
            }).then(
                () => {
                    axios({
                        validateStatus: function (status) {
                            // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                            return status < 500;
                        },
                        method: 'post',
                        url: 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS,
                        headers: {
                            'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                            'X-M2M-Origin': 'SVue',
                            'Content-Type': 'application/json;ty=3'
                        },
                        data: {
                            'm2m:cnt': {
                                rn: 'MarkerInfos',
                                lbl: ['MarkerInfos'],
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
                }
            ).catch(
                (err) => {
                    console.log(err.message);
                }
            );
        },

        getEachMarkerInfoFromMobius(dName, callback) {
            let self = this;

            axios({
                validateStatus: function (status) {
                    // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                    return status < 500;
                },
                method: 'get',
                url: 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/MarkerInfos/' + dName + '/la',
                headers: {
                    'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                    'X-M2M-Origin': 'SVue',
                    'Content-Type': 'application/json'
                }
            }).then(
                (res) => {

                    console.log('getEachMarkerInfoFromMobius', 'http://' + self.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + self.$store.state.VUE_APP_MOBIUS_GCS + '/MarkerInfos/' + dName + '/la', res);

                    if (res.status === 200) {
                        callback(res.status, res.data['m2m:cin'].con);
                    }
                    else if (res.status === 404) {
                        callback(200, []);
                    }
                    else {
                        callback(res.status, '');
                    }
                }
            ).catch(
                (err) => {
                    console.log(err.message);
                }
            );
        },

        getEachSurveyMarkerInfoFromMobius(dName, callback) {
            axios({
                validateStatus: function (status) {
                    // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                    return status < 500;
                },
                method: 'get',
                url: 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/SurveyMarkerInfos/' + dName + '/la',
                headers: {
                    'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                    'X-M2M-Origin': 'SVue',
                    'Content-Type': 'application/json'
                }
            }).then(
                (res) => {

                    console.log('getEachSurveyMarkerInfoFromMobius', 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/SurveyMarkerInfos/' + dName + '/la', res);

                    if (res.status === 200) {
                        callback(res.status, res.data['m2m:cin'].con);
                    }
                    else if (res.status === 404) {
                        callback(200, []);
                    }
                    else {
                        callback(res.status, '');
                    }
                }
            ).catch(
                (err) => {
                    console.log(err.message);

                    callback(200, []);
                }
            );
        },

        getMarkerInfosFromMobius(callback) {
            axios({
                validateStatus: function (status) {
                    // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                    return status < 500;
                },
                method: 'get',
                url: 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/MarkerInfos?fu=1&ty=3',
                headers: {
                    'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                    'X-M2M-Origin': 'SVue',
                    'Content-Type': 'application/json'
                }
            }).then(
                (res) => {
                    if (res.status === 200) {
                        callback(res.status, res.data['m2m:uril']);
                    }
                    else {
                        callback(res.status, '');
                    }
                }
            ).catch(
                (err) => {
                    console.log(err.message);
                }
            );
        },

        getSurveyMarkerInfosFromMobius(callback) {
            axios({
                validateStatus: function (status) {
                    // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                    return status < 500;
                },
                method: 'get',
                url: 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/SurveyMarkerInfos?fu=1&ty=3',
                headers: {
                    'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                    'X-M2M-Origin': 'SVue',
                    'Content-Type': 'application/json'
                }
            }).then(
                (res) => {
                    if (res.status === 200) {
                        callback(res.status, res.data['m2m:uril']);
                    }
                    else {
                        callback(res.status, '');
                    }
                }
            ).catch(
                (err) => {
                    console.log(err.message);
                }
            );
        },

        postMarkerInfos(dName, callback) {
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
                (res) => {

                    console.log('postMarkerInfos-axios', dName, res.data);

                    callback(res.status, '');
                }
            ).catch(
                (err) => {
                    console.log(err.message);
                }
            );
        },

        initTempMarkerInfos(markers, count, callback) {
            if (markers.length > count) {
                let dName = markers[count].split('/')[3];

                if(Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos, dName)) {
                    if(dName === 'unknown' || this.$store.state.drone_infos[dName].selected) {
                        this.getEachMarkerInfoFromMobius(dName, (status, con) => {
                            if (status === 200) {
                                if (con === undefined) {
                                    con = [];
                                }

                                if (con.length === 0) {
                                    this.$store.state.tempMarkers[dName] = [];
                                }
                                else {
                                    this.$store.state.tempMarkers[dName] = JSON.parse(JSON.stringify(con));

                                    this.$store.state.tempMarkers[dName].forEach((marker) => {
                                        if (!Object.prototype.hasOwnProperty.call(marker, 'elevation')) {
                                            marker.elevation = 0;
                                        }

                                        //console.log('YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY', dName, marker, this.$store.state.drone_infos[dName].color)

                                        // if (!Object.prototype.hasOwnProperty.call(marker, 'color')) {
                                        //     marker.color = '#9E9E9E';
                                        // }
                                        // else {
                                        //     if (dName === 'unknown') {
                                        //         if (marker.color === 'grey') {
                                        //             marker.color = '#9E9E9E';
                                        //         }
                                        //     }
                                        //     else {
                                        //         marker.color = this.$store.state.drone_infos[dName].color;
                                        //     }
                                        // }

                                        if (!Object.prototype.hasOwnProperty.call(marker, 'type')) {
                                            marker.type = 'Goto';
                                        }

                                        if (!Object.prototype.hasOwnProperty.call(marker, 'mavCmd')) {
                                            marker.targetMavCmd = 16;
                                        }

                                        if (!Object.prototype.hasOwnProperty.call(marker, 'targetStayTime')) {
                                            marker.targetStayTime = 1;
                                        }

                                        marker.targeted = false;
                                        marker.selected = false;
                                    });

                                    // let payload = {};
                                    // payload.dName = dName;
                                    // EventBus.$emit('draw-gotoLines', payload);

                                    //EventBus.$emit('do-positions-elevation-' + dName);
                                }

                                console.log('getEachMarkerInfoFromMobius', count, '/', markers.length, dName, con, this.$store.state.tempMarkers[dName]);
                            }

                            this.initTempMarkerInfos(markers, ++count, () => {
                                callback();
                            });
                        });
                    }
                    else {
                        this.initTempMarkerInfos(markers, ++count, () => {
                            callback();
                        });
                    }
                }
                else {
                    this.initTempMarkerInfos(markers, ++count, () => {
                        callback();
                    });
                }
            }
            else {
                callback();
            }
        },

        initSurveyMarkerInfos(markers, count, callback) {
            if (markers.length > count) {
                let dName = markers[count].split('/')[3];
                //console.log(count, 'initSurveyMarkerInfos', dName, markers[count]);
                this.getEachSurveyMarkerInfoFromMobius(dName, (status, con) => {
                    if (status === 200 || status === 404 || con === '') {
                        if (con === undefined) {
                            con = [];
                        }

                        //console.log(count, 'initSurveyMarkerInfos', dName, con);

                        if (con.length === 0) {
                            this.$store.state.surveyMarkers[dName] = [];
                        }
                        else {
                            this.$store.state.surveyMarkers[dName] = JSON.parse(JSON.stringify(con));

                            this.$store.state.surveyMarkers[dName].forEach((marker) => {
                                marker.targeted = false;
                                marker.selected = false;
                                marker.options = {};
                                marker.options.zIndex = 5;

                                if (!Object.prototype.hasOwnProperty.call(marker, 'angleStart')) {
                                    marker.angleStart = 0;
                                }

                                if (!Object.prototype.hasOwnProperty.call(marker, 'dir')) {
                                    marker.dir = 'cw';
                                }

                                if (!Object.prototype.hasOwnProperty.call(marker, 'color')) {
                                    marker.color = 'orange';
                                }

                                if (!Object.prototype.hasOwnProperty.call(marker, 'gap')) {
                                    marker.gap = 10;
                                }

                                if (!Object.prototype.hasOwnProperty.call(marker, 'pathLines')) {
                                    marker.pathLines = [];
                                }

                                if (!Object.prototype.hasOwnProperty.call(marker, 'polygonDraggable')) {
                                    marker.polygonDraggable = false;
                                }

                                if (!Object.prototype.hasOwnProperty.call(marker, 'polygonEditable')) {
                                    marker.polygonEditable = false;
                                }

                                if (!Object.prototype.hasOwnProperty.call(marker, 'wayOfSurvey')) {
                                    marker.wayOfSurvey = 'forShooting';
                                }

                                if (!Object.prototype.hasOwnProperty.call(marker, 'angle')) {
                                    marker.angle = 0;
                                }

                                if (!Object.prototype.hasOwnProperty.call(marker, 'alt')) {
                                    marker.alt = 100;
                                }

                                if (!Object.prototype.hasOwnProperty.call(marker, 'focal')) {
                                    marker.focal = 16;
                                }

                                if (!Object.prototype.hasOwnProperty.call(marker, 'sensor_w')) {
                                    marker.sensor_w = 23.5;
                                }

                                if (!Object.prototype.hasOwnProperty.call(marker, 'sensor_h')) {
                                    marker.sensor_h = 15.6;
                                }

                                if (!Object.prototype.hasOwnProperty.call(marker, 'overlap')) {
                                    marker.overlap = 0.7;
                                }

                                if (!Object.prototype.hasOwnProperty.call(marker, 'speed')) {
                                    marker.speed = 5;
                                }

                                if (!Object.prototype.hasOwnProperty.call(marker, 'period')) {
                                    marker.period = 5;
                                }

                                if (!Object.prototype.hasOwnProperty.call(marker, 'total_dist')) {
                                    marker.total_dist = 400;
                                }

                                if (!Object.prototype.hasOwnProperty.call(marker, 'area')) {
                                    marker.area = 0;
                                }

                                if (!Object.prototype.hasOwnProperty.call(marker, 'paramAlt')) {
                                    marker.paramAlt = 150;
                                }

                                if (!Object.prototype.hasOwnProperty.call(marker, 'paramOffsetAlt')) {
                                    marker.paramOffsetAlt = 0;
                                }

                                if (!Object.prototype.hasOwnProperty.call(marker, 'flyAlt')) {
                                    marker.flyAlt = Array(256).fill(150);
                                }

                                if (!Object.prototype.hasOwnProperty.call(marker, 'takeoffAlt')) {
                                    marker.takeoffAlt = Array(256).fill(0);
                                }

                                if (!Object.prototype.hasOwnProperty.call(marker, 'offsetAlt')) {
                                    marker.offsetAlt = Array(256).fill(0);
                                }

                                if (!Object.prototype.hasOwnProperty.call(marker, 'flyAltType')) {
                                    marker.flyAltType = '상대고도';
                                }

                                if (!Object.prototype.hasOwnProperty.call(marker, 'elevations')) {
                                    marker.elevations = [];
                                }

                                if (!Object.prototype.hasOwnProperty.call(marker, 'elevations_location')) {
                                    marker.elevations_location = [];
                                }

                                marker.polygonDraggable = false;
                                marker.polygonEditable = false;
                            });
                        }

                        this.initSurveyMarkerInfos(markers, ++count, () => {
                            callback();
                        });
                    }
                    else {
                        callback();
                    }
                });
            }
            else {
                callback();
            }
        },

        async prepareDroneInfos(callback) {
            try {
                let url_base = 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS;

                let url = url_base + '/DroneInfos?fu=1&ty=3';
                let response = await axios.get(url,{
                    validateStatus: status => {
                        return status < 500;
                    }, // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                    headers: {
                        'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                        'X-M2M-Origin': 'S' + this.$store.state.VUE_APP_MOBIUS_GCS,
                        'Content-Type': 'application/json'
                    },
                });
                console.log('prepareDroneInfos-DroneInfosList', response.status, response.data['m2m:uril']);

                let drones = JSON.parse(JSON.stringify(response.data['m2m:uril']));

                this.$store.state.drone_infos = {};
                this.drone_infos_list = [];
                this.selected = [];

                for(let i = 0; i < drones.length; i++) {
                    let dName = drones[i].split('/')[3];

                    url = url_base + '/DroneInfos/' + dName + '/la';
                    response = await axios.get(url, {
                        validateStatus: status => {
                            return status < 500;
                        }, // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                        headers: {
                            'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                            'X-M2M-Origin': 'S' + this.$store.state.VUE_APP_MOBIUS_GCS,
                            'Content-Type': 'application/json'
                        },
                    });
                    console.log('prepareDroneInfos-DroneInfos-'+dName, response.status, response.data['m2m:cin']);

                    let drone_info = response.data['m2m:cin'].con;

                    if (!Object.prototype.hasOwnProperty.call(drone_info, 'name')) {
                        drone_info.name = dName;
                    }

                    if (!Object.prototype.hasOwnProperty.call(drone_info, 'targeted')) {
                        drone_info.targeted = false;
                    }

                    if (!Object.prototype.hasOwnProperty.call(drone_info, 'selected')) {
                        drone_info.selected = false;
                    }

                    if (!Object.prototype.hasOwnProperty.call(drone_info, 'home_position')) {
                        drone_info.home_position = {lat: 37.4032072, lng: 127.1595933};
                    }

                    if (!Object.prototype.hasOwnProperty.call(drone_info, 'color')) {
                        drone_info.color = '#9E9E9E';
                    }

                    if(drone_info.color === 'grey') {
                        drone_info.color = '#9E9E9E';
                    }

                    if (!Object.prototype.hasOwnProperty.call(drone_info, 'gotoType')) {
                        drone_info.gotoType = '바로이동';
                    }

                    if (!Object.prototype.hasOwnProperty.call(drone_info, 'targetModeSelection')) {
                        drone_info.targetModeSelection = 'ALT_HOLD';
                    }

                    if (!Object.prototype.hasOwnProperty.call(drone_info, 'targetSpeed')) {
                        drone_info.targetSpeed = 5;
                    }

                    if (!Object.prototype.hasOwnProperty.call(drone_info, 'alt')) {
                        drone_info.alt = 0;
                    }

                    if (!Object.prototype.hasOwnProperty.call(drone_info, 'targetTurningSpeed')) {
                        drone_info.targetTurningSpeed = 5;
                    }

                    if (!Object.prototype.hasOwnProperty.call(drone_info, 'targetRadius')) {
                        drone_info.targetRadius = 50;
                    }

                    if (!Object.prototype.hasOwnProperty.call(drone_info, 'targetTakeoffAlt')) {
                        drone_info.targetTakeoffAlt = 20;
                    }

                    if (!Object.prototype.hasOwnProperty.call(drone_info, 'circleType')) {
                        drone_info.circleType = '시계방향';
                    }

                    if (!Object.prototype.hasOwnProperty.call(drone_info, 'targetAlt')) {
                        drone_info.targetAlt = 20;
                    }

                    if (!Object.prototype.hasOwnProperty.call(drone_info, 'sortie_name')) {
                        drone_info.sortie_name = 'disarm';
                    }

                    if (!Object.prototype.hasOwnProperty.call(drone_info, 'lastFlightTime')) {
                        drone_info.lastFlightTime = 0;
                    }

                    if (!Object.prototype.hasOwnProperty.call(drone_info, 'autoStartIndex')) {
                        drone_info.autoStartIndex = '0';
                    }

                    if (!Object.prototype.hasOwnProperty.call(drone_info, 'autoEndIndex')) {
                        drone_info.autoEndIndex = '0';
                    }

                    if (!Object.prototype.hasOwnProperty.call(drone_info, 'autoDelay')) {
                        drone_info.autoDelay = 1;
                    }

                    if (!Object.prototype.hasOwnProperty.call(drone_info, 'autoSpeed')) {
                        drone_info.autoSpeed = 5;
                    }

                    if (!Object.prototype.hasOwnProperty.call(drone_info, 'curArmStatus')) {
                        drone_info.curArmStatus = 'DISARMED';
                    }

                    if (!Object.prototype.hasOwnProperty.call(drone_info, 'takeoffAbsoluteAlt')) {
                        drone_info.takeoffAbsoluteAlt = 0;
                    }

                    drone_info.targeted = false;

                    if (!Object.prototype.hasOwnProperty.call(drone_info, 'airSpeed')) {
                        drone_info.airSpeed = 0;
                    }

                    if (!Object.prototype.hasOwnProperty.call(drone_info, 'headingLine')) {
                        drone_info.headingLine = [];
                        drone_info.headingLine.push({lat: 37.4032072, lng: 127.1595933});
                        drone_info.headingLine.push({lat: 37.4032072, lng: 127.1595933});
                    }

                    if (!Object.prototype.hasOwnProperty.call(drone_info, 'directionLine')) {
                        drone_info.directionLine = [];
                        drone_info.directionLine.push({lat: 37.4032072, lng: 127.1595933});
                        drone_info.directionLine.push({lat: 37.4032072, lng: 127.1595933});
                    }

                    if (!Object.prototype.hasOwnProperty.call(drone_info, 'client')) {
                        drone_info.client = {
                            connected: false,
                            loading: false
                        };
                    }

                    if (!Object.prototype.hasOwnProperty.call(drone_info, 'pausePosition')) {
                        drone_info.pausePosition = {
                            lat: 0,
                            lng: 0,
                            alt: 0,
                            heading: 0
                        };
                    }

                    if (!Object.prototype.hasOwnProperty.call(drone_info, 'targetStayTime')) {
                        drone_info.targetStayTime = 0;
                    }

                    if (!Object.prototype.hasOwnProperty.call(drone_info, 'yawBehavior')) {
                        drone_info.yawBehavior = 'YAW고정';
                    }

                    if (!Object.prototype.hasOwnProperty.call(drone_info, 'flyShape')) {
                        drone_info.flyShape = '직선비행';
                    }

                    if (!Object.prototype.hasOwnProperty.call(drone_info, 'startWay')) {
                        drone_info.startWay = '처음부터';
                    }

                    if (!Object.prototype.hasOwnProperty.call(drone_info, 'curMissionItemReached')) {
                        drone_info.curMissionItemReached = 0;
                    }

                    drone_info.curTargetedTempMarkerIndex = -1;
                    drone_info.curTargetedSurveyMarkerIndex = -1;

                    if (!Object.prototype.hasOwnProperty.call(drone_info, 'absolute_alt')) {
                        drone_info.absolute_alt = 0;
                    }

                    if (!Object.prototype.hasOwnProperty.call(drone_info, 'rtlSpeed')) {
                        drone_info.rtlSpeed = 5;
                    }

                    if (!Object.prototype.hasOwnProperty.call(drone_info, 'takeoffDelay')) {
                        drone_info.takeoffDelay = 6;
                    }

                    if(dName === 'unknown' || drone_info.selected) {
                        this.$store.state.drone_infos[dName] = JSON.parse(JSON.stringify(drone_info));

                        if (dName !== 'unknown') {
                            this.selected.push(drone_info);
                        }
                    }

                    if (dName !== 'unknown') {
                        this.drone_infos_list.push(JSON.parse(JSON.stringify(drone_info)));
                    }
                }

                callback();

            } catch (err) {
                console.log("Error >>", err);
            }
        },

        async prepareMarkerInfos(callback) {
            try {
                this.$store.state.tempMarkers = {};

                let url_base = 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS;

                for(let dName in this.$store.state.drone_infos) {
                    if(Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos, dName)) {
                        let url = url_base + '/MarkerInfos/' + dName + '/la';
                        let response = await axios.get(url, {
                            validateStatus: status => {
                                return status < 500;
                            }, // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                            headers: {
                                'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                                'X-M2M-Origin': 'S' + this.$store.state.VUE_APP_MOBIUS_GCS,
                                'Content-Type': 'application/json'
                            },
                        });
                        console.log('postCntToMobius-MarkerInfos-'+dName, response.status, response.data['m2m:cin']);

                        if (response.status === 404) {
                            url = url_base + '/MarkerInfos';
                            response = await axios.post(url, {
                                'm2m:cnt': {
                                    rn: dName,
                                    lbl: [dName]
                                }
                            }, {
                                validateStatus: status => {
                                    return status < 500;
                                }, // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                                headers: {
                                    'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                                    'X-M2M-Origin': 'S' + this.$store.state.VUE_APP_MOBIUS_GCS,
                                    'Content-Type': 'application/json;ty=3'
                                },
                            });
                            console.log('addProfile-MarkerInfos', response.status, response.data['m2m:cnt']);

                            url = url_base + '/MarkerInfos/' + dName;
                            response = await axios.post(url, {
                                'm2m:cin': {
                                    con: []
                                }
                            }, {
                                validateStatus: status => {
                                    return status < 500;
                                }, // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                                headers: {
                                    'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                                    'X-M2M-Origin': 'S' + this.$store.state.VUE_APP_MOBIUS_GCS,
                                    'Content-Type': 'application/json;ty=4'
                                },
                            });
                            console.log('addProfile-MarkerInfos-' + dName, response.status, response.data['m2m:cin']);

                            if(!Object.prototype.hasOwnProperty.call(response.data['m2m:cin'], 'con')) {
                                response.data['m2m:cin'].con = [];
                            }
                        }
                        else {
                            if(!Object.prototype.hasOwnProperty.call(response.data['m2m:cin'], 'con')) {
                                response.data['m2m:cin'].con = [];
                            }
                        }

                        let temp_markers = response.data['m2m:cin'].con;

                        temp_markers.forEach((marker, pIndex) => {
                            if (!Object.prototype.hasOwnProperty.call(marker, 'elevation')) {
                                marker.elevation = 0;
                            }

                            if (!Object.prototype.hasOwnProperty.call(marker, 'name')) {
                                marker.name = dName;
                            }

                            if (!Object.prototype.hasOwnProperty.call(marker, 'color')) {
                                marker.color = this.$store.state.drone_infos[dName].color;
                            }

                            if (!Object.prototype.hasOwnProperty.call(marker, 'type')) {
                                marker.type = 'Goto';
                            }

                            if (!Object.prototype.hasOwnProperty.call(marker, 'mavCmd')) {
                                marker.targetMavCmd = 16;
                            }

                            if (!Object.prototype.hasOwnProperty.call(marker, 'targetStayTime')) {
                                marker.targetStayTime = 1;
                            }

                            marker.color = this.$store.state.drone_infos[dName].color;
                            marker.targeted = false;
                            marker.selected = false;

                            console.log('ppppppppppppppppppppppppp prepareMarkerInfos tempMarker-targeted', dName, pIndex, marker.targeted);
                        });

                        this.$store.state.tempMarkers[dName] = JSON.parse(JSON.stringify(temp_markers));
                    }
                }

                callback();

            } catch (err) {
                console.log("Error >>", err);
            }
        },

        async prepareSurveyMarkerInfos(callback) {
            try {
                this.$store.state.surveyMarkers = {};

                let url_base = 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS;

                for(let dName in this.$store.state.drone_infos) {
                    if(Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos, dName)) {
                        let url = url_base + '/SurveyMarkerInfos/' + dName + '/la';
                        let response = await axios.get(url, {
                            validateStatus: status => {
                                return status < 500;
                            }, // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                            headers: {
                                'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                                'X-M2M-Origin': 'S' + this.$store.state.VUE_APP_MOBIUS_GCS,
                                'Content-Type': 'application/json'
                            },
                        });
                        console.log('postCntToMobius-SurveyMarkerInfos-'+dName, response.status, response.data['m2m:cin']);

                        if (response.status === 404) {
                            url = url_base + '/SurveyMarkerInfos';
                            response = await axios.post(url, {
                                'm2m:cnt': {
                                    rn: dName,
                                    lbl: [dName]
                                }
                            }, {
                                validateStatus: status => {
                                    return status < 500;
                                }, // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                                headers: {
                                    'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                                    'X-M2M-Origin': 'S' + this.$store.state.VUE_APP_MOBIUS_GCS,
                                    'Content-Type': 'application/json;ty=3'
                                },
                            });
                            console.log('addProfile-SurveyMarkerInfos', response.status, response.data['m2m:cnt']);

                            url = url_base + '/SurveyMarkerInfos/' + dName;
                            response = await axios.post(url, {
                                'm2m:cin': {
                                    con: []
                                }
                            }, {
                                validateStatus: status => {
                                    return status < 500;
                                }, // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                                headers: {
                                    'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                                    'X-M2M-Origin': 'S' + this.$store.state.VUE_APP_MOBIUS_GCS,
                                    'Content-Type': 'application/json;ty=4'
                                },
                            });
                            console.log('addProfile-SurveyMarkerInfos-' + dName, response.status, response.data['m2m:cin']);

                            if(!Object.prototype.hasOwnProperty.call(response.data['m2m:cin'], 'con')) {
                                response.data['m2m:cin'].con = [];
                            }
                        }
                        else {
                            if(!Object.prototype.hasOwnProperty.call(response.data['m2m:cin'], 'con')) {
                                response.data['m2m:cin'].con = [];
                            }
                        }

                        let survey_markers = response.data['m2m:cin'].con;

                        survey_markers.forEach((marker, pIndex) => {
                            if (!Object.prototype.hasOwnProperty.call(marker, 'angleStart')) {
                                marker.angleStart = 0;
                            }

                            if (!Object.prototype.hasOwnProperty.call(marker, 'dir')) {
                                marker.dir = 'cw';
                            }

                            if (!Object.prototype.hasOwnProperty.call(marker, 'color')) {
                                marker.color = 'orange';
                            }

                            if (!Object.prototype.hasOwnProperty.call(marker, 'gap')) {
                                marker.gap = 10;
                            }

                            if (!Object.prototype.hasOwnProperty.call(marker, 'pathLines')) {
                                marker.pathLines = [];
                            }

                            if (!Object.prototype.hasOwnProperty.call(marker, 'polygonDraggable')) {
                                marker.polygonDraggable = false;
                            }

                            if (!Object.prototype.hasOwnProperty.call(marker, 'polygonEditable')) {
                                marker.polygonEditable = false;
                            }

                            if (!Object.prototype.hasOwnProperty.call(marker, 'wayOfSurvey')) {
                                marker.wayOfSurvey = 'forShooting';
                            }

                            if (!Object.prototype.hasOwnProperty.call(marker, 'angle')) {
                                marker.angle = 0;
                            }

                            if (!Object.prototype.hasOwnProperty.call(marker, 'alt')) {
                                marker.alt = 100;
                            }

                            if (!Object.prototype.hasOwnProperty.call(marker, 'focal')) {
                                marker.focal = 16;
                            }

                            if (!Object.prototype.hasOwnProperty.call(marker, 'sensor_w')) {
                                marker.sensor_w = 23.5;
                            }

                            if (!Object.prototype.hasOwnProperty.call(marker, 'sensor_h')) {
                                marker.sensor_h = 15.6;
                            }

                            if (!Object.prototype.hasOwnProperty.call(marker, 'overlap')) {
                                marker.overlap = 0.7;
                            }

                            if (!Object.prototype.hasOwnProperty.call(marker, 'speed')) {
                                marker.speed = 5;
                            }

                            if (!Object.prototype.hasOwnProperty.call(marker, 'period')) {
                                marker.period = 5;
                            }

                            if (!Object.prototype.hasOwnProperty.call(marker, 'total_dist')) {
                                marker.total_dist = 400;
                            }

                            if (!Object.prototype.hasOwnProperty.call(marker, 'area')) {
                                marker.area = 0;
                            }

                            if (!Object.prototype.hasOwnProperty.call(marker, 'paramAlt')) {
                                marker.paramAlt = 150;
                            }

                            if (!Object.prototype.hasOwnProperty.call(marker, 'paramOffsetAlt')) {
                                marker.paramOffsetAlt = 0;
                            }

                            if (!Object.prototype.hasOwnProperty.call(marker, 'flyAlt')) {
                                marker.flyAlt = Array(256).fill(150);
                            }

                            if (!Object.prototype.hasOwnProperty.call(marker, 'takeoffAlt')) {
                                marker.takeoffAlt = Array(256).fill(0);
                            }

                            if (!Object.prototype.hasOwnProperty.call(marker, 'offsetAlt')) {
                                marker.offsetAlt = Array(256).fill(0);
                            }

                            if (!Object.prototype.hasOwnProperty.call(marker, 'flyAltType')) {
                                marker.flyAltType = '상대고도';
                            }

                            if (!Object.prototype.hasOwnProperty.call(marker, 'elevations')) {
                                marker.elevations = [];
                            }

                            if (!Object.prototype.hasOwnProperty.call(marker, 'elevations_location')) {
                                marker.elevations_location = [];
                            }

                            marker.polygonDraggable = false;
                            marker.polygonEditable = false;

                            marker.options = {};
                            marker.options.zIndex = 5;
                            marker.color = this.$store.state.drone_infos[dName].color;
                            marker.targeted = false;
                            marker.selected = false;

                            console.log('ppppppppppppppppppppppppp prepareSurveyMarkerInfos-targeted', dName, pIndex, marker.targeted);
                        });

                        this.$store.state.surveyMarkers[dName] = JSON.parse(JSON.stringify(survey_markers));
                    }
                }

                callback();

            } catch (err) {
                console.log("Error >>", err);
            }

            // let url = 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/SurveyMarkerInfos';
            // this.postCntToMobius(url, 'unknown', () => {
            //     this.getSurveyMarkerInfosFromMobius((status, markers) => {
            //         console.log('GcsAppBarCreated-getSurveyMarkerInfosFromMobius', status, markers.length, markers);
            //         if (status === 200) {
            //             if (markers.length === 0) {
            //                 this.$store.state.surveyMarkers = {};
            //
            //                 callback();
            //             }
            //             else {
            //                 this.$store.state.surveyMarkers = {};
            //                 this.initSurveyMarkerInfos(markers, 0, () => {
            //                     console.log('GcsAppBarCreated()-2', 'initSurveyMarkerInfos', this.$store.state.surveyMarkers);
            //
            //                     callback();
            //                 });
            //             }
            //         }
            //         else {
            //             callback();
            //         }
            //     });
            // });
        },

        prepareLossLteInfos(callback) {
            this.getCinLossLTEInfosFromMobius((status, lossLTEs) => {
                if (status === 200) {
                    if (lossLTEs === undefined) {
                        this.$store.state.loss_lte_infos = {};
                    }
                    else {
                        this.$store.state.loss_lte_infos = lossLTEs;
                    }
                    console.log('------1---------------------------------GcsAppBarCreated-getCinLossLTEInfosFromMobius', status, this.$store.state.loss_lte_infos);
                }
                callback();
            });
        },

        GcsAppBarConnected() {
            this.$store.state.MOBIUS_CONNECTION.connected = true;

            this.GcsAppBarCreated();
        },

        async GcsAppBarCreated() {
            this.$store.state.VUE_APP_MOBIUS_HOST = this.host;
            this.$store.state.VUE_APP_MOBIUS_GCS = this.gcs;

            //this.$cookies.set('mobius_host', this.host);
            //this.$cookies.set('mobius_gcs', this.gcs);

            //console.log('localStorage-mobius_gcs', localStorage.getItem("mobius_gcs"));

            localStorage.setItem('mobius_host', this.host);
            localStorage.setItem('mobius_gcs', this.gcs);

            let url_root = 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius';
            try {
                let url = url_root;
                let response = await axios.post(url, {
                    'm2m:ae': {
                        rn: this.$store.state.VUE_APP_MOBIUS_GCS,
                        api: '0.2.481.1.1111',
                        lbl: [this.$store.state.VUE_APP_MOBIUS_GCS],
                        rr: true,
                        poa: ["http://localhost:8080"]
                    }
                }, {
                    validateStatus: status => {
                        return status < 500;
                    }, // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                    headers: {
                        'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                        'X-M2M-Origin': 'S' + this.$store.state.VUE_APP_MOBIUS_GCS,
                        'Content-Type': 'application/json;ty=2'
                    },
                });
                console.log('postAeToMobius', response.status, response.data['m2m:ae']);

                let url_base = 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS;

                url = url_base;
                response = await axios.post(url, {
                    'm2m:cnt': {
                        rn: 'DroneInfos',
                        lbl: ['DroneInfos'],
                    }
                }, {
                    validateStatus: status => {
                        return status < 500;
                    }, // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                    headers: {
                        'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                        'X-M2M-Origin': 'S' + this.$store.state.VUE_APP_MOBIUS_GCS,
                        'Content-Type': 'application/json;ty=3'
                    },
                });
                console.log('postCntToMobius-DroneInfos', response.status, response.data['m2m:cnt']);

                response = await axios.post(url, {
                    'm2m:cnt': {
                        rn: 'MarkerInfos',
                        lbl: ['MarkerInfos'],
                    }
                }, {
                    validateStatus: status => {
                        return status < 500;
                    }, // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                    headers: {
                        'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                        'X-M2M-Origin': 'S' + this.$store.state.VUE_APP_MOBIUS_GCS,
                        'Content-Type': 'application/json;ty=3'
                    },
                });
                console.log('postCntToMobius-MarkerInfos', response.status, response.data['m2m:cnt']);

                response = await axios.post(url, {
                    'm2m:cnt': {
                        rn: 'SurveyMarkerInfos',
                        lbl: ['SurveyMarkerInfos'],
                    }
                }, {
                    validateStatus: status => {
                        return status < 500;
                    }, // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                    headers: {
                        'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                        'X-M2M-Origin': 'S' + this.$store.state.VUE_APP_MOBIUS_GCS,
                        'Content-Type': 'application/json;ty=3'
                    },
                });
                console.log('postCntToMobius-SurveyMarkerInfos', response.status, response.data['m2m:cnt']);

                response = await axios.post(url, {
                    'm2m:cnt': {
                        rn: 'LossLteInfos',
                        lbl: ['LossLteInfos'],
                    }
                }, {
                    validateStatus: status => {
                        return status < 500;
                    }, // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                    headers: {
                        'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                        'X-M2M-Origin': 'S' + this.$store.state.VUE_APP_MOBIUS_GCS,
                        'Content-Type': 'application/json;ty=3'
                    },
                });
                console.log('postCntToMobius-LossLteInfos', response.status, response.data['m2m:cnt']);

                let dName = 'unknown';

                let payload = {};
                payload.selected = false;
                payload.lat = 37.404324133883605 + Math.random() * 0.001;
                payload.lng = 127.16124484502097 + Math.random() * 0.001;
                payload.alt = 0;
                payload.absolute_alt = 0
                payload.heading = 0;
                payload.host = this.$store.state.VUE_APP_MOBIUS_HOST;
                payload.gcs = this.$store.state.VUE_APP_MOBIUS_GCS;
                payload.type = 'ardupilot';
                payload.color = '#9E9E9E';
                payload.name = dName;
                payload.drone_host = this.$store.state.VUE_APP_MOBIUS_HOST;
                payload.id = dName;
                payload.bat_cell = 12;
                payload.system_id = 1;
                payload.home_position = {lat: 37.4032072, lng: 127.1595933};
                payload.goto_positions = [];
                payload.headingLine = [];
                payload.headingLine.push({lat: 0, lng: 0});
                payload.headingLine.push({lat: 0, lng: 0});
                payload.directionLine = [];
                payload.directionLine.push({lat: 0, lng: 0});
                payload.directionLine.push({lat: 0, lng: 0});
                payload.airSpeed = 0;

                url = url_base + '/DroneInfos';
                response = await axios.post(url, {
                    'm2m:cnt': {
                        rn: dName,
                        lbl: [dName],
                    }
                }, {
                    validateStatus: status => {
                        return status < 500;
                    }, // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                    headers: {
                        'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                        'X-M2M-Origin': 'S' + this.$store.state.VUE_APP_MOBIUS_GCS,
                        'Content-Type': 'application/json;ty=3'
                    },
                });
                console.log('addProfile-DroneInfos-' + dName, response.status, response.data['m2m:cnt']);

                if (response.status === 201) {
                    url = url_base + '/DroneInfos/' + dName;
                    response = await axios.post(url, {
                        'm2m:cin': {
                            con: payload
                        }
                    }, {
                        validateStatus: status => {
                            return status < 500;
                        }, // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                        headers: {
                            'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                            'X-M2M-Origin': 'S' + this.$store.state.VUE_APP_MOBIUS_GCS,
                            'Content-Type': 'application/json;ty=4'
                        },
                    });
                    console.log('addProfile-DroneInfos-' + dName, response.status, response.data['m2m:cin']);
                }

                url = url_base + '/MarkerInfos';
                response = await axios.post(url, {
                    'm2m:cnt': {
                        rn: dName,
                        lbl: [dName],
                    }
                }, {
                    validateStatus: status => {
                        return status < 500;
                    }, // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                    headers: {
                        'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                        'X-M2M-Origin': 'S' + this.$store.state.VUE_APP_MOBIUS_GCS,
                        'Content-Type': 'application/json;ty=3'
                    },
                });
                console.log('addProfile-MarkerInfos-' + dName, response.status, response.data['m2m:cnt']);

                if (response.status === 201) {
                    url = url_base + '/MarkerInfos/' + dName;
                    response = await axios.post(url, {
                        'm2m:cin': {
                            con: []
                        }
                    }, {
                        validateStatus: status => {
                            return status < 500;
                        }, // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                        headers: {
                            'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                            'X-M2M-Origin': 'S' + this.$store.state.VUE_APP_MOBIUS_GCS,
                            'Content-Type': 'application/json;ty=4'
                        },
                    });
                    console.log('addProfile-MarkerInfos-' + dName, response.status, response.data['m2m:cin']);
                }

                url = url_base + '/SurveyMarkerInfos';
                response = await axios.post(url, {
                    'm2m:cnt': {
                        rn: dName,
                        lbl: [dName],
                    }
                }, {
                    validateStatus: status => {
                        return status < 500;
                    }, // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                    headers: {
                        'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                        'X-M2M-Origin': 'S' + this.$store.state.VUE_APP_MOBIUS_GCS,
                        'Content-Type': 'application/json;ty=3'
                    },
                });
                console.log('addProfile-SurveyMarkerInfos-' + dName, response.status, response.data['m2m:cnt']);

                if (response.status === 201) {
                    url = url_base + '/SurveyMarkerInfos/' + dName;
                    response = await axios.post(url, {
                        'm2m:cin': {
                            con: []
                        }
                    }, {
                        validateStatus: status => {
                            return status < 500;
                        }, // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                        headers: {
                            'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                            'X-M2M-Origin': 'S' + this.$store.state.VUE_APP_MOBIUS_GCS,
                            'Content-Type': 'application/json;ty=4'
                        },
                    });
                    console.log('addProfile-SurveyMarkerInfos-' + dName, response.status, response.data['m2m:cin']);
                }
                this.prepareDroneInfos(() => {
                    this.prepareMarkerInfos(() => {
                        this.prepareSurveyMarkerInfos(() => {
                            this.prepareLossLteInfos(() => {
                                EventBus.$emit('ready-gcs_app_bar');
                                setTimeout(() => {
                                    EventBus.$emit('gcs-map-ready');
                                }, 500);
                            });
                        });
                    });
                });
            } catch (err) {
                console.log("Error >>", err);
            }
        },

        async GcsAppBarRecreated() {
            this.$store.state.VUE_APP_MOBIUS_HOST = this.host;
            this.$store.state.VUE_APP_MOBIUS_GCS = this.gcs;

            localStorage.setItem('mobius_host', this.host);
            localStorage.setItem('mobius_gcs', this.gcs);

            let url_base = 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS;
            try {
                this.$store.state.drone_infos = {};
                this.drone_infos_list = [];
                this.selected = [];

                let dName = 'unknown';
                let url = url_base + '/DroneInfos/' + dName + '/la';

                let response = await axios.get(url, {
                    validateStatus: status => {
                        return status < 500;
                    }, // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                    headers: {
                        'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                        'X-M2M-Origin': 'S' + this.$store.state.VUE_APP_MOBIUS_GCS,
                        'Content-Type': 'application/json'
                    },
                });
                console.log('postCntToMobius-DroneInfos-'+dName, response.status, response.data['m2m:cin']);

                this.$store.state.drone_infos[dName] = JSON.parse(JSON.stringify(response.data['m2m:cin'].con));

                for(let i = 0; i < this.$store.state.MOBIUS_CONNECTION.selected.length; i++) {
                    //console.log('this.$store.state.MOBIUS_CONNECTION.selected', this.$store.state.MOBIUS_CONNECTION.selected[i]);

                    dName = this.$store.state.MOBIUS_CONNECTION.selected[i].name;
                    url = url_base + '/DroneInfos/' + dName + '/la';

                    response = await axios.get(url, {
                        validateStatus: status => {
                            return status < 500;
                        }, // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                        headers: {
                            'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                            'X-M2M-Origin': 'S' + this.$store.state.VUE_APP_MOBIUS_GCS,
                            'Content-Type': 'application/json'
                        },
                    });
                    console.log('postCntToMobius-DroneInfos-'+dName, response.status, response.data['m2m:cin']);

                    let drone_info = response.data['m2m:cin'].con;

                    if (!Object.prototype.hasOwnProperty.call(drone_info, 'name')) {
                        drone_info.name = dName;
                    }

                    if (!Object.prototype.hasOwnProperty.call(drone_info, 'targeted')) {
                        drone_info.targeted = false;
                    }

                    if (!Object.prototype.hasOwnProperty.call(drone_info, 'selected')) {
                        drone_info.selected = false;
                    }

                    if (!Object.prototype.hasOwnProperty.call(drone_info, 'home_position')) {
                        drone_info.home_position = {lat: 37.4032072, lng: 127.1595933};
                    }

                    if (!Object.prototype.hasOwnProperty.call(drone_info, 'color')) {
                        drone_info.color = '#9E9E9E';
                    }

                    if(drone_info.color === 'grey') {
                        drone_info.color = '#9E9E9E';
                    }

                    if (!Object.prototype.hasOwnProperty.call(drone_info, 'gotoType')) {
                        drone_info.gotoType = '바로이동';
                    }

                    if (!Object.prototype.hasOwnProperty.call(drone_info, 'targetModeSelection')) {
                        drone_info.targetModeSelection = 'ALT_HOLD';
                    }

                    if (!Object.prototype.hasOwnProperty.call(drone_info, 'targetSpeed')) {
                        drone_info.targetSpeed = 5;
                    }

                    if (!Object.prototype.hasOwnProperty.call(drone_info, 'alt')) {
                        drone_info.alt = 0;
                    }

                    if (!Object.prototype.hasOwnProperty.call(drone_info, 'targetTurningSpeed')) {
                        drone_info.targetTurningSpeed = 5;
                    }

                    if (!Object.prototype.hasOwnProperty.call(drone_info, 'targetRadius')) {
                        drone_info.targetRadius = 50;
                    }

                    if (!Object.prototype.hasOwnProperty.call(drone_info, 'targetTakeoffAlt')) {
                        drone_info.targetTakeoffAlt = 20;
                    }

                    if (!Object.prototype.hasOwnProperty.call(drone_info, 'circleType')) {
                        drone_info.circleType = '시계방향';
                    }

                    if (!Object.prototype.hasOwnProperty.call(drone_info, 'targetAlt')) {
                        drone_info.targetAlt = 20;
                    }

                    if (!Object.prototype.hasOwnProperty.call(drone_info, 'sortie_name')) {
                        drone_info.sortie_name = 'disarm';
                    }

                    if (!Object.prototype.hasOwnProperty.call(drone_info, 'lastFlightTime')) {
                        drone_info.lastFlightTime = 0;
                    }

                    if (!Object.prototype.hasOwnProperty.call(drone_info, 'autoStartIndex')) {
                        drone_info.autoStartIndex = '0';
                    }

                    if (!Object.prototype.hasOwnProperty.call(drone_info, 'autoEndIndex')) {
                        drone_info.autoEndIndex = '0';
                    }

                    if (!Object.prototype.hasOwnProperty.call(drone_info, 'autoDelay')) {
                        drone_info.autoDelay = 1;
                    }

                    if (!Object.prototype.hasOwnProperty.call(drone_info, 'autoSpeed')) {
                        drone_info.autoSpeed = 5;
                    }

                    if (!Object.prototype.hasOwnProperty.call(drone_info, 'curArmStatus')) {
                        drone_info.curArmStatus = 'DISARMED';
                    }

                    if (!Object.prototype.hasOwnProperty.call(drone_info, 'takeoffAbsoluteAlt')) {
                        drone_info.takeoffAbsoluteAlt = 0;
                    }

                    drone_info.targeted = false;

                    if (!Object.prototype.hasOwnProperty.call(drone_info, 'airSpeed')) {
                        drone_info.airSpeed = 0;
                    }

                    if (!Object.prototype.hasOwnProperty.call(drone_info, 'headingLine')) {
                        drone_info.headingLine = [];
                        drone_info.headingLine.push({lat: 37.4032072, lng: 127.1595933});
                        drone_info.headingLine.push({lat: 37.4032072, lng: 127.1595933});
                    }

                    if (!Object.prototype.hasOwnProperty.call(drone_info, 'directionLine')) {
                        drone_info.directionLine = [];
                        drone_info.directionLine.push({lat: 37.4032072, lng: 127.1595933});
                        drone_info.directionLine.push({lat: 37.4032072, lng: 127.1595933});
                    }

                    if (!Object.prototype.hasOwnProperty.call(drone_info, 'client')) {
                        drone_info.client = {
                            connected: false,
                            loading: false
                        };
                    }

                    if (!Object.prototype.hasOwnProperty.call(drone_info, 'pausePosition')) {
                        drone_info.pausePosition = {
                            lat: 0,
                            lng: 0,
                            alt: 0,
                            heading: 0
                        };
                    }

                    if (!Object.prototype.hasOwnProperty.call(drone_info, 'targetStayTime')) {
                        drone_info.targetStayTime = 0;
                    }

                    if (!Object.prototype.hasOwnProperty.call(drone_info, 'yawBehavior')) {
                        drone_info.yawBehavior = 'YAW고정';
                    }

                    if (!Object.prototype.hasOwnProperty.call(drone_info, 'flyShape')) {
                        drone_info.flyShape = '직선비행';
                    }

                    if (!Object.prototype.hasOwnProperty.call(drone_info, 'startWay')) {
                        drone_info.startWay = '처음부터';
                    }

                    if (!Object.prototype.hasOwnProperty.call(drone_info, 'curMissionItemReached')) {
                        drone_info.curMissionItemReached = 0;
                    }

                    drone_info.curTargetedTempMarkerIndex = -1;
                    drone_info.curTargetedSurveyMarkerIndex = -1;

                    if (!Object.prototype.hasOwnProperty.call(drone_info, 'absolute_alt')) {
                        drone_info.absolute_alt = 0;
                    }

                    if (!Object.prototype.hasOwnProperty.call(drone_info, 'rtlSpeed')) {
                        drone_info.rtlSpeed = 5;
                    }

                    if (!Object.prototype.hasOwnProperty.call(drone_info, 'takeoffDelay')) {
                        drone_info.takeoffDelay = 6;
                    }

                    if(dName === 'unknown' || drone_info.selected) {
                        this.$store.state.drone_infos[dName] = JSON.parse(JSON.stringify(drone_info));

                        if (dName !== 'unknown') {
                            this.selected.push(drone_info);
                        }
                    }

                    if (dName !== 'unknown') {
                        this.drone_infos_list.push(JSON.parse(JSON.stringify(drone_info)));
                    }

                    this.$store.state.drone_infos[dName] = JSON.parse(JSON.stringify(drone_info));
                }

                for(let dName in this.$store.state.drone_infos) {
                    if(Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos, dName)) {
                        url = url_base + '/MarkerInfos/' + dName + '/la';
                        response = await axios.get(url, {
                            validateStatus: status => {
                                return status < 500;
                            }, // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                            headers: {
                                'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                                'X-M2M-Origin': 'S' + this.$store.state.VUE_APP_MOBIUS_GCS,
                                'Content-Type': 'application/json'
                            },
                        });
                        console.log('postCntToMobius-MarkerInfos-'+dName, response.status, response.data['m2m:cin']);

                        if (response.status === 404) {
                            url = url_base + '/MarkerInfos';
                            response = await axios.post(url, {
                                'm2m:cnt': {
                                    rn: dName,
                                    lbl: [dName]
                                }
                            }, {
                                validateStatus: status => {
                                    return status < 500;
                                }, // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                                headers: {
                                    'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                                    'X-M2M-Origin': 'S' + this.$store.state.VUE_APP_MOBIUS_GCS,
                                    'Content-Type': 'application/json;ty=3'
                                },
                            });
                            console.log('addProfile-MarkerInfos', response.status, response.data['m2m:cnt']);

                            url = url_base + '/MarkerInfos/' + dName;
                            response = await axios.post(url, {
                                'm2m:cin': {
                                    con: []
                                }
                            }, {
                                validateStatus: status => {
                                    return status < 500;
                                }, // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                                headers: {
                                    'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                                    'X-M2M-Origin': 'S' + this.$store.state.VUE_APP_MOBIUS_GCS,
                                    'Content-Type': 'application/json;ty=4'
                                },
                            });
                            console.log('addProfile-MarkerInfos-' + dName, response.status, response.data['m2m:cin']);

                            if(!Object.prototype.hasOwnProperty.call(response.data['m2m:cin'], 'con')) {
                                response.data['m2m:cin'].con = [];
                            }
                        }
                        else {
                            if(!Object.prototype.hasOwnProperty.call(response.data['m2m:cin'], 'con')) {
                                response.data['m2m:cin'].con = [];
                            }
                        }

                        let temp_markers = response.data['m2m:cin'].con;

                        temp_markers.forEach((marker, pIndex) => {
                            if (!Object.prototype.hasOwnProperty.call(marker, 'elevation')) {
                                marker.elevation = 0;
                            }

                            if (!Object.prototype.hasOwnProperty.call(marker, 'name')) {
                                marker.name = dName;
                            }

                            if (!Object.prototype.hasOwnProperty.call(marker, 'color')) {
                                marker.color = this.$store.state.drone_infos[dName].color;
                            }

                            if (!Object.prototype.hasOwnProperty.call(marker, 'type')) {
                                marker.type = 'Goto';
                            }

                            if (!Object.prototype.hasOwnProperty.call(marker, 'mavCmd')) {
                                marker.targetMavCmd = 16;
                            }

                            if (!Object.prototype.hasOwnProperty.call(marker, 'targetStayTime')) {
                                marker.targetStayTime = 1;
                            }

                            marker.color = this.$store.state.drone_infos[dName].color;
                            marker.targeted = false;
                            marker.selected = false;

                            console.log('ppppppppppppppppppppppppp recreated MarkerInfos tempMarker-targeted', dName, pIndex, marker.targeted);
                        });

                        this.$store.state.tempMarkers[dName] = JSON.parse(JSON.stringify(temp_markers));

                        url = url_base + '/SurveyMarkerInfos/' + dName + '/la';
                        response = await axios.get(url, {
                            validateStatus: status => {
                                return status < 500;
                            }, // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                            headers: {
                                'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                                'X-M2M-Origin': 'S' + this.$store.state.VUE_APP_MOBIUS_GCS,
                                'Content-Type': 'application/json'
                            },
                        });
                        console.log('postCntToMobius-SurveyMarkerInfos-'+dName, response.status, response.data['m2m:cin']);

                        if (response.status === 404) {
                            url = url_base + '/SurveyMarkerInfos';
                            response = await axios.post(url, {
                                'm2m:cnt': {
                                    rn: dName,
                                    lbl: [dName]
                                }
                            }, {
                                validateStatus: status => {
                                    return status < 500;
                                }, // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                                headers: {
                                    'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                                    'X-M2M-Origin': 'S' + this.$store.state.VUE_APP_MOBIUS_GCS,
                                    'Content-Type': 'application/json;ty=3'
                                },
                            });
                            console.log('addProfile-SurveyMarkerInfos', response.status, response.data['m2m:cnt']);

                            url = url_base + '/SurveyMarkerInfos/' + dName;
                            response = await axios.post(url, {
                                'm2m:cin': {
                                    con: []
                                }
                            }, {
                                validateStatus: status => {
                                    return status < 500;
                                }, // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                                headers: {
                                    'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                                    'X-M2M-Origin': 'S' + this.$store.state.VUE_APP_MOBIUS_GCS,
                                    'Content-Type': 'application/json;ty=4'
                                },
                            });
                            console.log('addProfile-SurveyMarkerInfos-' + dName, response.status, response.data['m2m:cin']);

                            if(!Object.prototype.hasOwnProperty.call(response.data['m2m:cin'], 'con')) {
                                response.data['m2m:cin'].con = [];
                            }
                        }
                        else {
                            if (!Object.prototype.hasOwnProperty.call(response.data['m2m:cin'], 'con')) {
                                response.data['m2m:cin'].con = [];
                            }
                        }

                        let survey_markers = response.data['m2m:cin'].con;

                        survey_markers.forEach((marker, pIndex) => {
                            if (!Object.prototype.hasOwnProperty.call(marker, 'elevation')) {
                                marker.elevation = 0;
                            }

                            if (!Object.prototype.hasOwnProperty.call(marker, 'name')) {
                                marker.name = dName;
                            }

                            if (!Object.prototype.hasOwnProperty.call(marker, 'color')) {
                                marker.color = this.$store.state.drone_infos[dName].color;
                            }

                            if (!Object.prototype.hasOwnProperty.call(marker, 'type')) {
                                marker.type = 'Goto';
                            }

                            if (!Object.prototype.hasOwnProperty.call(marker, 'mavCmd')) {
                                marker.targetMavCmd = 16;
                            }

                            if (!Object.prototype.hasOwnProperty.call(marker, 'targetStayTime')) {
                                marker.targetStayTime = 1;
                            }

                            marker.color = this.$store.state.drone_infos[dName].color;
                            marker.targeted = false;
                            marker.selected = false;

                            console.log('ppppppppppppppppppppppppp recreated surveyMarkerInfos-targeted', dName, pIndex, marker.targeted);
                        });

                        this.$store.state.surveyMarkers[dName] = JSON.parse(JSON.stringify(survey_markers));
                    }
                }

                EventBus.$emit('ready-gcs_app_bar');
                setTimeout(() => {
                    EventBus.$emit('gcs-map-ready');
                }, 500);

            } catch (err) {
                console.log("Error >>", err);
            }
        },

        GcsAppBarDisconnected() {
            this.selected = [];
            this.drone_infos_list = [];

            this.$store.state.MOBIUS_CONNECTION = {
                connected: false,
                selected: []
            };

            //this.$cookies.set('MOBIUS_CONNECTION_CONNECTED', this.$store.state.MOBIUS_CONNECTION_CONNECTED);
            localStorage.setItem('MOBIUS_CONNECTION', JSON.stringify(this.$store.state.MOBIUS_CONNECTION));

            //this.confirmSelected(true);
        },

        dialogProfile() {
            // this.selected = null;
            // this.selected = [];
            //
            // for (let dName in this.drone_infos) {
            //     if (Object.prototype.hasOwnProperty.call(this.drone_infos, dName)) {
            //         if (this.drone_infos[dName].selected) {
            //             this.selected.push(this.drone_infos[dName]);
            //         }
            //     }
            // }

            if (this.$store.state.MOBIUS_CONNECTION.connected) {
                this.GcsAppBarCreated();
            }

            this.dialog = true;
        },

        openCam() {
            this.open = !this.open;
            console.log(this.open);

            window.open("https://westonsoftware.github.io/vue-webrtc/", "_blank");
        },

        openCam2() {
            this.open = !this.open;
            console.log(this.open);

            window.open("http://webrtc.intellicode.info:8080/", "_blank");
        },

        rotateMapAngle() {
            EventBus.$emit('do-rotate-map', this.mapAngle);

            this.mapAngleDialog = false;
        },

        deleteCntDroneInfoToMobius(dName, callback) {
            axios({
                validateStatus: function (status) {
                    // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                    return status < 500;
                },
                method: 'delete',
                url: 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/DroneInfos/' + dName,
                headers: {
                    'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                    'X-M2M-Origin': 'Sponde',
                    'Content-Type': 'application/json'
                }
            }).then(
                (res) => {
                    console.log('deleteCntDroneInfoToMobius-axios', dName, res.data);

                    callback(res);
                }
            ).catch(
                (err) => {
                    console.log(err.message);

                    callback(err)
                }
            );
        },

        deleteCntMarkerInfoToMobius(dName, callback) {
            axios({
                validateStatus: function (status) {
                    // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                    return status < 500;
                },
                method: 'delete',
                url: 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/MarkerInfos/' + dName,
                headers: {
                    'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                    'X-M2M-Origin': 'Sponde',
                    'Content-Type': 'application/json'
                }
            }).then(
                (res) => {
                    console.log('deleteCntMarkerInfoToMobius-axios', dName, res.data);

                    callback(res);
                }
            ).catch(
                (err) => {
                    console.log(err.message);

                    callback(err)
                }
            );
        },

        deleteCntSurveyMarkerInfoToMobius(dName, callback) {
            axios({
                validateStatus: function (status) {
                    // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                    return status < 500;
                },
                method: 'delete',
                url: 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/SurveyMarkerInfos/' + dName,
                headers: {
                    'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                    'X-M2M-Origin': 'Sponde',
                    'Content-Type': 'application/json'
                }
            }).then(
                (res) => {
                    console.log('deleteCntSurveyMarkerInfoToMobius-axios', dName, res.data);

                    callback(res);
                }
            ).catch(
                (err) => {
                    console.log(err.message);

                    callback(err)
                }
            );
        },

        async confirmSelected(dialog) {
            console.log('vvvvvvvvvvvvvvvvvvvvvvvvvvv confirmSelected', this.selected, this.$store.state.drone_infos);

            // if (Object.keys(this.$store.state.drone_infos).length <= 1) {
            //     this.dialog = false;
            //     return;
            // }
            //
            try {
                for (let sel_idx = 0; sel_idx < this.drone_infos_list.length; sel_idx++) {
                    let drone_info = this.drone_infos_list[sel_idx];
                    let dName = this.drone_infos_list[sel_idx].name;
                    if (drone_info.selected) {
                        let resultCount = 0;
                        for (let idx in this.selected) {
                            if (Object.prototype.hasOwnProperty.call(this.selected, idx)) {
                                if (drone_info.name === this.selected[idx].name) {
                                    resultCount++;
                                }
                            }
                        }

                        if (resultCount === 0) {
                            drone_info.selected = false;

                            let url = 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/DroneInfos/' + dName;
                            let response = await axios.post(url, {
                                'm2m:cin': {
                                    con: this.drone_infos_list[sel_idx]
                                }
                            }, {
                                validateStatus: status => {
                                    return status < 500;
                                }, // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                                headers: {
                                    'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                                    'X-M2M-Origin': 'S' + this.$store.state.VUE_APP_MOBIUS_GCS,
                                    'Content-Type': 'application/json;ty=4'
                                },
                            });
                            console.log('vvvvvvvvvv confirmSelected-DroneInfos-' + dName, response.status, response.data['m2m:cin']);
                        }
                    } else {
                        let resultCount = 0;
                        for (let idx in this.selected) {
                            if (Object.prototype.hasOwnProperty.call(this.selected, idx)) {
                                if (drone_info.name === this.selected[idx].name) {
                                    resultCount++;
                                }
                            }
                        }

                        if (resultCount > 0) {
                            drone_info.selected = true;

                            let url = 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/DroneInfos/' + dName;
                            let response = await axios.post(url, {
                                'm2m:cin': {
                                    con: this.drone_infos_list[sel_idx]
                                }
                            }, {
                                validateStatus: status => {
                                    return status < 500;
                                }, // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                                headers: {
                                    'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                                    'X-M2M-Origin': 'S' + this.$store.state.VUE_APP_MOBIUS_GCS,
                                    'Content-Type': 'application/json;ty=4'
                                },
                            });
                            console.log('vvvvvvvv confirmSelected-DroneInfos-' + dName, response.status, response.data['m2m:cin']);
                        }
                    }
                }

                let temp = JSON.parse(JSON.stringify(this.$store.state.drone_infos['unknown']));
                this.$store.state.drone_infos = {};
                for (let idx in this.selected) {
                    if (Object.prototype.hasOwnProperty.call(this.selected, idx)) {
                        this.$store.state.drone_infos[this.selected[idx].name] = JSON.parse(JSON.stringify(this.selected[idx]));
                        this.$store.state.drone_infos[this.selected[idx].name].selected = true;
                    }
                }
                this.$store.state.drone_infos['unknown'] = JSON.parse(JSON.stringify(temp));

                let url_base = 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS;
                for (let dName in this.$store.state.drone_infos) {
                    if (Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos, dName)) {
                        let url = url_base + '/MarkerInfos/' + dName + '/la';
                        let response = await axios.get(url, {
                            validateStatus: status => {
                                return status < 500;
                            }, // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                            headers: {
                                'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                                'X-M2M-Origin': 'S' + this.$store.state.VUE_APP_MOBIUS_GCS,
                                'Content-Type': 'application/json'
                            },
                        });
                        console.log('postCntToMobius-MarkerInfos-' + dName, response.status, response.data['m2m:cin']);

                        if (response.status === 404) {
                            url = url_base + '/MarkerInfos';
                            response = await axios.post(url, {
                                'm2m:cnt': {
                                    rn: dName,
                                    lbl: [dName]
                                }
                            }, {
                                validateStatus: status => {
                                    return status < 500;
                                }, // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                                headers: {
                                    'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                                    'X-M2M-Origin': 'S' + this.$store.state.VUE_APP_MOBIUS_GCS,
                                    'Content-Type': 'application/json;ty=3'
                                },
                            });
                            console.log('addProfile-MarkerInfos', response.status, response.data['m2m:cnt']);

                            url = url_base + '/MarkerInfos/' + dName;
                            response = await axios.post(url, {
                                'm2m:cin': {
                                    con: []
                                }
                            }, {
                                validateStatus: status => {
                                    return status < 500;
                                }, // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                                headers: {
                                    'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                                    'X-M2M-Origin': 'S' + this.$store.state.VUE_APP_MOBIUS_GCS,
                                    'Content-Type': 'application/json;ty=4'
                                },
                            });
                            console.log('addProfile-MarkerInfos-' + dName, response.status, response.data['m2m:cin']);

                            if (!Object.prototype.hasOwnProperty.call(response.data['m2m:cin'], 'con')) {
                                response.data['m2m:cin'].con = [];
                            }
                        } else {
                            if (!Object.prototype.hasOwnProperty.call(response.data['m2m:cin'], 'con')) {
                                response.data['m2m:cin'].con = [];
                            }
                        }

                        let temp_markers = response.data['m2m:cin'].con;

                        temp_markers.forEach((marker, pIndex) => {
                            if (!Object.prototype.hasOwnProperty.call(marker, 'elevation')) {
                                marker.elevation = 0;
                            }

                            if (!Object.prototype.hasOwnProperty.call(marker, 'name')) {
                                marker.name = dName;
                            }

                            if (!Object.prototype.hasOwnProperty.call(marker, 'color')) {
                                marker.color = this.$store.state.drone_infos[dName].color;
                            }

                            if (!Object.prototype.hasOwnProperty.call(marker, 'type')) {
                                marker.type = 'Goto';
                            }

                            if (!Object.prototype.hasOwnProperty.call(marker, 'mavCmd')) {
                                marker.targetMavCmd = 16;
                            }

                            if (!Object.prototype.hasOwnProperty.call(marker, 'targetStayTime')) {
                                marker.targetStayTime = 1;
                            }

                            marker.color = this.$store.state.drone_infos[dName].color;
                            marker.targeted = false;
                            marker.selected = false;

                            console.log('ppppppppppppppppppppppppp confirmSelected MarkerInfos-targeted', dName, pIndex, marker.targeted);
                        });

                        this.$store.state.tempMarkers[dName] = JSON.parse(JSON.stringify(temp_markers));

                        url = url_base + '/SurveyMarkerInfos/' + dName + '/la';
                        response = await axios.get(url, {
                            validateStatus: status => {
                                return status < 500;
                            }, // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                            headers: {
                                'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                                'X-M2M-Origin': 'S' + this.$store.state.VUE_APP_MOBIUS_GCS,
                                'Content-Type': 'application/json'
                            },
                        });
                        console.log('postCntToMobius-SurveyMarkerInfos-' + dName, response.status, response.data['m2m:cin']);

                        if (response.status === 404) {
                            url = url_base + '/SurveyMarkerInfos';
                            response = await axios.post(url, {
                                'm2m:cnt': {
                                    rn: dName,
                                    lbl: [dName]
                                }
                            }, {
                                validateStatus: status => {
                                    return status < 500;
                                }, // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                                headers: {
                                    'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                                    'X-M2M-Origin': 'S' + this.$store.state.VUE_APP_MOBIUS_GCS,
                                    'Content-Type': 'application/json;ty=3'
                                },
                            });
                            console.log('addProfile-SurveyMarkerInfos', response.status, response.data['m2m:cnt']);

                            url = url_base + '/SurveyMarkerInfos/' + dName;
                            response = await axios.post(url, {
                                'm2m:cin': {
                                    con: []
                                }
                            }, {
                                validateStatus: status => {
                                    return status < 500;
                                }, // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                                headers: {
                                    'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                                    'X-M2M-Origin': 'S' + this.$store.state.VUE_APP_MOBIUS_GCS,
                                    'Content-Type': 'application/json;ty=4'
                                },
                            });
                            console.log('addProfile-SurveyMarkerInfos-' + dName, response.status, response.data['m2m:cin']);

                            if (!Object.prototype.hasOwnProperty.call(response.data['m2m:cin'], 'con')) {
                                response.data['m2m:cin'].con = [];
                            }
                        } else {
                            if (!Object.prototype.hasOwnProperty.call(response.data['m2m:cin'], 'con')) {
                                response.data['m2m:cin'].con = [];
                            }
                        }

                        let survey_markers = response.data['m2m:cin'].con;

                        survey_markers.forEach((marker, pIndex) => {
                            if (!Object.prototype.hasOwnProperty.call(marker, 'elevation')) {
                                marker.elevation = 0;
                            }

                            if (!Object.prototype.hasOwnProperty.call(marker, 'name')) {
                                marker.name = dName;
                            }

                            if (!Object.prototype.hasOwnProperty.call(marker, 'color')) {
                                marker.color = this.$store.state.drone_infos[dName].color;
                            }

                            if (!Object.prototype.hasOwnProperty.call(marker, 'type')) {
                                marker.type = 'Goto';
                            }

                            if (!Object.prototype.hasOwnProperty.call(marker, 'mavCmd')) {
                                marker.targetMavCmd = 16;
                            }

                            if (!Object.prototype.hasOwnProperty.call(marker, 'targetStayTime')) {
                                marker.targetStayTime = 1;
                            }

                            marker.color = this.$store.state.drone_infos[dName].color;
                            marker.targeted = false;
                            marker.selected = false;

                            console.log('ppppppppppppppppppppppppp confirmSelected surveyMarkerInfos-targeted', dName, pIndex, marker.targeted);
                        });

                        this.$store.state.surveyMarkers[dName] = JSON.parse(JSON.stringify(survey_markers));

                    }
                }
            } catch (err) {
                console.log("Error >>", err);
            }

            // for(let sel_idx = 0; sel_idx < this.drone_infos_list.length; sel_idx++) {
            //     let url = 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/DroneInfos/' + this.drone_infos_list[sel_idx].name;
            //     this.postCinToMobius(url, this.drone_infos_list[sel_idx], () => {
            //     });
            // }

            // this.$store.state.drone_infos = null;
            // this.$store.state.drone_infos = {};
            // Object.keys(this.drone_infos).forEach((dName) => {
            //     if (dName !== 'unknown') {
            //         localStorage.setItem(dName + '_selected', String(this.drone_infos[dName].selected));
            //     }
            //
            //     if(this.drone_infos[dName].selected) {
            //         this.$store.state.drone_infos[dName] = JSON.parse(JSON.stringify(this.drone_infos[dName]));
            //
            //         let url = 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/DroneInfos/' + dName;
            //         this.postCinToMobius(url, this.$store.state.drone_infos[dName], () => {
            //
            //         });
            //     }
            // });

            //this.$store.commit('updateDroneInfosSelected');
            this.dialog = dialog;

            EventBus.$emit('confirm_selected', JSON.parse(JSON.stringify(this.selected)));

            EventBus.$emit('gcs-map-ready');

            this.$forceUpdate();

            this.$store.state.MOBIUS_CONNECTION.selected = this.selected;

            localStorage.setItem('MOBIUS_CONNECTION', JSON.stringify(this.$store.state.MOBIUS_CONNECTION));
        },

        resetForm() {
            this.errorMessages = [];
            this.formHasErrors = false;

            Object.keys(this.form).forEach(f => {
                if (f === 'host') {
                    this.$refs[f].value = this.$store.state.VUE_APP_MOBIUS_HOST;
                }
                else if (f === 'gcs') {
                    this.$refs[f].value = this.$store.state.VUE_APP_MOBIUS_GCS;
                }
                else {
                    this.$refs[f].reset();
                }
            });
        },

        updateProfile(item) {
            console.log(item);

            this.drone_host = item.host;
            this.drone_name = item.name;
            this.drone_id = item.id;
            this.host = item.host;
            this.gcs = item.gcs;
            this.type_selected = item.type;
            this.bat_cell = item.bat_cell;
            this.system_id = item.system_id;
            this.color_selected = this.$store.state.refColorName[item.color];

            this.init_drone_name = item.name;
            this.init_drone_id = item.id;

            const isId = (element) => {
                return (element.id === item.id)
            };
            this.update_idx = this.drone_infos_list.findIndex(isId);

            this.update_dialog = true;
        },

        async removeProfile(item) {
            let dName = item.name;

            try {
                let url = 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/DroneInfos/' + dName;
                let response = await axios.delete(url, {
                    validateStatus: status => {
                        return status < 500;
                    }, // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                    headers: {
                        'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                        'X-M2M-Origin': 'Sponde',
                        'Content-Type': 'application/json'
                    },
                });
                console.log('removeProfile-DroneInfos-' + dName, response.status, response.data['m2m:cin']);

                url = 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/MarkerInfos/' + dName;
                response = await axios.delete(url, {
                    validateStatus: status => {
                        return status < 500;
                    }, // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                    headers: {
                        'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                        'X-M2M-Origin': 'Sponde',
                        'Content-Type': 'application/json'
                    },
                });
                console.log('removeProfile-MarkerInfos-' + dName, response.status, response.data['m2m:cin']);

                url = 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/SurveyMarkerInfos/' + dName;
                response = await axios.delete(url, {
                    validateStatus: status => {
                        return status < 500;
                    }, // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                    headers: {
                        'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                        'X-M2M-Origin': 'Sponde',
                        'Content-Type': 'application/json'
                    },
                });
                console.log('removeProfile-SurveyMarkerInfos-' + dName, response.status, response.data['m2m:cin']);

                for (let del_index = 0; del_index < this.drone_infos_list.length; del_index++) {
                    if (this.drone_infos_list[del_index].name === item.name) {
                        this.drone_infos_list.splice(del_index, 1);
                        break;
                    }
                }

                for (let del_index = 0; del_index < this.selected.length; del_index++) {
                    if (this.selected[del_index].name === item.name) {
                        this.selected.splice(del_index, 1);
                        break;
                    }
                }
            } catch (err) {
                console.log("Error >>", err);
            }

            // delete this.drone_infos[item.name];
            //
            // let temp = JSON.parse(JSON.stringify(this.drone_infos));
            // this.drone_infos = null;
            // this.drone_infos = JSON.parse(JSON.stringify(temp));
            // temp = null;

            // this.deleteCntDroneInfoToMobius(item.name, () => {
            //     this.selected = [];
            //     this.drone_infos_list = [];
            //
            //     for (let dName in this.drone_infos) {
            //         if (Object.prototype.hasOwnProperty.call(this.drone_infos, dName)) {
            //             if (dName !== 'unknown') {
            //                 this.drone_infos_list.push(this.drone_infos[dName]);
            //             }
            //
            //             if (this.drone_infos[dName].selected) {
            //                 this.selected.push(this.drone_infos[dName]);
            //             }
            //         }
            //     }
            //
            //     this.deleteCntMarkerInfoToMobius(item.name, () => {
            //         this.deleteCntSurveyMarkerInfoToMobius(item.name, () => {
            //             this.fab = false;
            //         });
            //     });
            // });
        },

        cancel() {
            this.resetForm();
            this.add_dialog = false;
        },

        async addUnknownProfile() {
            let dName = 'unknown';

            try {
                let payload = {};
                payload.selected = false;
                payload.lat = 37.404324133883605 + Math.random() * 0.001;
                payload.lng = 127.16124484502097 + Math.random() * 0.001;
                payload.alt = 0;
                payload.absolute_alt = 0;
                payload.heading = 0;
                payload.host = this.$store.state.VUE_APP_MOBIUS_HOST;
                payload.gcs = this.$store.state.VUE_APP_MOBIUS_GCS;
                payload.type = 'ardupilot';
                payload.color = '#9E9E9E';
                payload.name = dName;
                payload.drone_host = this.$store.state.VUE_APP_MOBIUS_HOST;
                payload.id = dName;
                payload.bat_cell = 12;
                payload.system_id = 1;
                payload.home_position = {lat: 37.4032072, lng: 127.1595933};
                payload.goto_positions = [];
                payload.headingLine = [];
                payload.headingLine.push({lat: 0, lng: 0});
                payload.headingLine.push({lat: 0, lng: 0});
                payload.directionLine = [];
                payload.directionLine.push({lat: 0, lng: 0});
                payload.directionLine.push({lat: 0, lng: 0});
                payload.airSpeed = 0;

                let url_base = 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS;

                let url = url_base + '/DroneInfos';
                let response = await axios.post(url, {
                    'm2m:cnt': {
                        rn: dName,
                        lbl: [dName],
                    }
                }, {
                    validateStatus: status => {
                        return status < 500;
                    }, // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                    headers: {
                        'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                        'X-M2M-Origin': 'S' + this.$store.state.VUE_APP_MOBIUS_GCS,
                        'Content-Type': 'application/json;ty=3'
                    },
                });
                console.log('addProfile-DroneInfos-' + dName, response.status, response.data['m2m:cnt']);

                url = url_base + '/DroneInfos/' + dName;
                response = await axios.post(url, {
                    'm2m:cin': {
                        con: payload
                    }
                }, {
                    validateStatus: status => {
                        return status < 500;
                    }, // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                    headers: {
                        'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                        'X-M2M-Origin': 'S' + this.$store.state.VUE_APP_MOBIUS_GCS,
                        'Content-Type': 'application/json;ty=4'
                    },
                });
                console.log('addProfile-DroneInfos-' + dName, response.status, response.data['m2m:cin']);

                url = url_base + '/MarkerInfos';
                response = await axios.post(url, {
                    'm2m:cnt': {
                        rn: dName,
                        lbl: [dName],
                    }
                }, {
                    validateStatus: status => {
                        return status < 500;
                    }, // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                    headers: {
                        'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                        'X-M2M-Origin': 'S' + this.$store.state.VUE_APP_MOBIUS_GCS,
                        'Content-Type': 'application/json;ty=3'
                    },
                });
                console.log('addProfile-MarkerInfos-' + dName, response.status, response.data['m2m:cnt']);

                url = url_base + '/MarkerInfos/' + dName;
                response = await axios.post(url, {
                    'm2m:cin': {
                        con: []
                    }
                }, {
                    validateStatus: status => {
                        return status < 500;
                    }, // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                    headers: {
                        'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                        'X-M2M-Origin': 'S' + this.$store.state.VUE_APP_MOBIUS_GCS,
                        'Content-Type': 'application/json;ty=4'
                    },
                });
                console.log('addProfile-MarkerInfos-' + dName, response.status, response.data['m2m:cin']);

                url = url_base + '/SurveyMarkerInfos';
                response = await axios.post(url, {
                    'm2m:cnt': {
                        rn: dName,
                        lbl: [dName],
                    }
                }, {
                    validateStatus: status => {
                        return status < 500;
                    }, // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                    headers: {
                        'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                        'X-M2M-Origin': 'S' + this.$store.state.VUE_APP_MOBIUS_GCS,
                        'Content-Type': 'application/json;ty=3'
                    },
                });
                console.log('addProfile-SurveyMarkerInfos-' + dName, response.status, response.data['m2m:cnt']);

                url = url_base + '/SurveyMarkerInfos/' + dName;
                response = await axios.post(url, {
                    'm2m:cin': {
                        con: []
                    }
                }, {
                    validateStatus: status => {
                        return status < 500;
                    }, // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                    headers: {
                        'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                        'X-M2M-Origin': 'S' + this.$store.state.VUE_APP_MOBIUS_GCS,
                        'Content-Type': 'application/json;ty=4'
                    },
                });
                console.log('addProfile-SurveyMarkerInfos-' + dName, response.status, response.data['m2m:cin']);
            } catch (err) {
                console.log("Error >>", err);
            }
        },

        async submitAddProfile() {
            this.formHasErrors = false;

            for (let el in this.form) {
                if (Object.prototype.hasOwnProperty.call(this.form, el)) {
                    this.$refs[el].validate(true);
                }
            }

            if (this.formHasErrors === false) {
                let payload = {};
                payload.selected = false;
                payload.lat = 37.404324133883605 + Math.random() * 0.001;
                payload.lng = 127.16124484502097 + Math.random() * 0.001;
                payload.alt = 0;
                payload.absolute_alt = 0;
                payload.heading = 0;
                payload.host = this.host;
                payload.gcs = this.gcs;
                payload.type = this.type_selected;
                payload.color = this.$store.state.refColorValue[this.color_selected];
                payload.name = this.drone_name;
                payload.drone_host = this.drone_host;
                payload.id = this.drone_id;
                payload.bat_cell = this.bat_cell;
                payload.system_id = this.system_id;
                payload.home_position = {lat: 37.4032072, lng: 127.1595933};
                payload.goto_positions = [];
                payload.headingLine = [];
                payload.headingLine.push({lat: 0, lng: 0});
                payload.headingLine.push({lat: 0, lng: 0});
                payload.directionLine = [];
                payload.directionLine.push({lat: 0, lng: 0});
                payload.directionLine.push({lat: 0, lng: 0});
                payload.airSpeed = 0;

                this.drone_infos_list.push(payload);

                // this.selected = null;
                // this.selected = [];
                // this.drone_infos_list = null;
                // this.drone_infos_list = [];
                //
                // for (let dName in this.drone_infos) {
                //     if (Object.prototype.hasOwnProperty.call(this.drone_infos, dName)) {
                //         if (dName !== 'unknown') {
                //             this.drone_infos_list.push(this.drone_infos[dName]);
                //         }
                //
                //         if (this.drone_infos[dName].selected) {
                //             this.selected.push(this.drone_infos[dName]);
                //         }
                //     }
                // }

                let dName = this.drone_name;
                let url_base = 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS;

                try {
                    let url = url_base + '/DroneInfos';
                    let response = await axios.post(url, {
                        'm2m:cnt': {
                            rn: dName,
                            lbl: [dName],
                        }
                    }, {
                        validateStatus: status => {
                            return status < 500;
                        }, // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                        headers: {
                            'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                            'X-M2M-Origin': 'S' + this.$store.state.VUE_APP_MOBIUS_GCS,
                            'Content-Type': 'application/json;ty=3'
                        },
                    });
                    console.log('addProfile-DroneInfos-' + dName, response.status, response.data['m2m:cnt']);

                    url = url_base + '/DroneInfos/' + dName;
                    response = await axios.post(url, {
                        'm2m:cin': {
                            con: payload
                        }
                    }, {
                        validateStatus: status => {
                            return status < 500;
                        }, // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                        headers: {
                            'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                            'X-M2M-Origin': 'S' + this.$store.state.VUE_APP_MOBIUS_GCS,
                            'Content-Type': 'application/json;ty=4'
                        },
                    });
                    console.log('addProfile-DroneInfos-' + dName, response.status, response.data['m2m:cin']);

                    url = url_base + '/MarkerInfos';
                    response = await axios.post(url, {
                        'm2m:cnt': {
                            rn: dName,
                            lbl: [dName],
                        }
                    }, {
                        validateStatus: status => {
                            return status < 500;
                        }, // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                        headers: {
                            'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                            'X-M2M-Origin': 'S' + this.$store.state.VUE_APP_MOBIUS_GCS,
                            'Content-Type': 'application/json;ty=3'
                        },
                    });
                    console.log('addProfile-MarkerInfos-' + dName, response.status, response.data['m2m:cnt']);

                    url = url_base + '/MarkerInfos/' + dName;
                    response = await axios.post(url, {
                        'm2m:cin': {
                            con: []
                        }
                    }, {
                        validateStatus: status => {
                            return status < 500;
                        }, // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                        headers: {
                            'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                            'X-M2M-Origin': 'S' + this.$store.state.VUE_APP_MOBIUS_GCS,
                            'Content-Type': 'application/json;ty=4'
                        },
                    });
                    console.log('addProfile-MarkerInfos-' + dName, response.status, response.data['m2m:cin']);

                    url = url_base + '/SurveyMarkerInfos';
                    response = await axios.post(url, {
                        'm2m:cnt': {
                            rn: dName,
                            lbl: [dName],
                        }
                    }, {
                        validateStatus: status => {
                            return status < 500;
                        }, // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                        headers: {
                            'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                            'X-M2M-Origin': 'S' + this.$store.state.VUE_APP_MOBIUS_GCS,
                            'Content-Type': 'application/json;ty=3'
                        },
                    });
                    console.log('addProfile-SurveyMarkerInfos-' + dName, response.status, response.data['m2m:cnt']);

                    url = url_base + '/SurveyMarkerInfos/' + dName;
                    response = await axios.post(url, {
                        'm2m:cin': {
                            con: []
                        }
                    }, {
                        validateStatus: status => {
                            return status < 500;
                        }, // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                        headers: {
                            'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                            'X-M2M-Origin': 'S' + this.$store.state.VUE_APP_MOBIUS_GCS,
                            'Content-Type': 'application/json;ty=4'
                        },
                    });
                    console.log('addProfile-SurveyMarkerInfos-' + dName, response.status, response.data['m2m:cin']);


                    this.add_dialog = false;
                    this.fab = false;

                    this.resetForm();
                } catch (err) {
                    console.log("Error >>", err);
                }
            }
        },

        update_cancel() {
            this.resetForm();
            this.update_dialog = false;
        },

        update_submit() {
            this.formHasErrors = false;

            for (let el in this.form) {
                if (Object.prototype.hasOwnProperty.call(this.form, el)) {
                    this.$refs[el].validate(true);
                }
            }

            if (this.formHasErrors === false) {
                for(let update_index = 0; update_index < this.drone_infos_list.length; update_index++) {
                    if(this.drone_infos_list[update_index].name === this.drone_name) {
                        this.drone_infos_list[update_index].host = this.host;
                        this.drone_infos_list[update_index].gcs = this.gcs;
                        this.drone_infos_list[update_index].type = this.type_selected;
                        this.drone_infos_list[update_index].color = this.$store.state.refColorValue[this.color_selected];
                        this.drone_infos_list[update_index].name = this.drone_name;
                        this.drone_infos_list[update_index].drone_host = this.drone_host;
                        this.drone_infos_list[update_index].id = this.drone_id;
                        this.drone_infos_list[update_index].bat_cell = this.bat_cell;
                        this.drone_infos_list[update_index].system_id = this.system_id;

                        // this.selected = null;
                        // this.selected = [];
                        // this.drone_infos_list = null;
                        // this.drone_infos_list = [];
                        //
                        // for (let dName in this.drone_infos) {
                        //     if (Object.prototype.hasOwnProperty.call(this.drone_infos, dName)) {
                        //         if (dName !== 'unknown') {
                        //             this.drone_infos_list.push(this.drone_infos[dName]);
                        //         }
                        //
                        //         if (this.drone_infos[dName].selected) {
                        //             this.selected.push(this.drone_infos[dName]);
                        //         }
                        //     }
                        // }

                        this.postCinDroneInfoToMobius(this.drone_name, this.drone_infos_list[update_index], () => {
                            this.update_dialog = false;
                            this.fab = false;

                            this.resetForm();
                        });

                        break;
                    }
                }
            }

        },
    },

    created() {
        if(localStorage.getItem('MOBIUS_CONNECTION')) {
            this.$store.state.MOBIUS_CONNECTION = JSON.parse(localStorage.getItem('MOBIUS_CONNECTION'));
        }
        else {
            this.$store.state.MOBIUS_CONNECTION = {
                connected: false,
                selected: []
            };
        }
    },

    mounted() {
        if (this.$store.state.MOBIUS_CONNECTION.connected) {
            this.GcsAppBarRecreated();
        }
        // else {
        //     this.GcsAppBarCreated();
        // }
    },

    beforeDestroy() {
        //EventBus.$off('do-selected-drone-profiles');
    }
}
</script>

<style scoped>
#create {
    position: absolute;
}

#create {
    position: relative;
}
</style>
