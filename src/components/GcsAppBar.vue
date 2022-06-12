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

            <v-btn text @click.stop="mapAngleDialog=true" :disabled="!MOBIUS_CONNECTION_CONNECTED">
                <v-icon>mdi-format-rotate-90</v-icon>
            </v-btn>

            <v-btn text :disabled="!MOBIUS_CONNECTION_CONNECTED">
                <v-icon>mdi-crosshairs-gps</v-icon>
            </v-btn>

            <v-btn text @click.stop="dialogProfile">
    <!--            <v-icon>mdi-quadcopter</v-icon>-->
                <v-icon>mdi-cog-transfer</v-icon>
            </v-btn>


    <!--        <v-btn text @click.stop="openCam">-->
    <!--            <v-icon>mdi-video</v-icon>-->
    <!--        </v-btn>-->

            <v-btn text @click.stop="openCam2" :disabled="!MOBIUS_CONNECTION_CONNECTED">
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

            <v-btn text :disabled="!MOBIUS_CONNECTION_CONNECTED">
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

            <v-dialog v-model="dialog" persistent max-width="900px">
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
                                <v-btn disabled fab dark small color="red" @click.stop="delProfile">
                                    <v-icon>mdi-delete</v-icon>
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
                                        :disabled="MOBIUS_CONNECTION_CONNECTED"
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
                                        :disabled="MOBIUS_CONNECTION_CONNECTED"
                                    ></v-text-field>
                                </v-col>
                                <v-col cols="4">
                                    <v-btn
                                        class="mx-2 mt-1"
                                        tile @click="GcsAppBarCreated"
                                        elevation="5"
                                        color="primary"
                                        :disabled="MOBIUS_CONNECTION_CONNECTED"
                                    > {{ MOBIUS_CONNECTION_TEXT }}
                                    </v-btn>
                                    <!--            </v-col>-->
                                    <!--            <v-col cols="2">-->
                                    <v-btn
                                        class="mx-2 mt-1"
                                        tile @click="GcsAppBarReseted"
                                        elevation="2"
                                        color="primary"
                                        :disabled="!MOBIUS_CONNECTION_CONNECTED"
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
    <!--                        <v-col cols="3">-->
    <!--&lt;!&ndash;                            <v-text-field hide-details ref="host" v-model="host" :rules="host_rule" placeholder="203.253.128.177" label="Host*" required></v-text-field>&ndash;&gt;-->
    <!--                            <v-text-field-->
    <!--                                    class="mx-2"-->
    <!--                                    dense hide-details-->
    <!--                                    ref="host"-->
    <!--                                    v-model="host" :rules="host_rule"-->
    <!--                                    placeholder="203.253.128.177"-->
    <!--                                    label="HOST*"-->
    <!--                                    required-->
    <!--                                    :disabled="MOBIUS_CONNECTION_CONNECTED"-->
    <!--                            ></v-text-field>-->
    <!--                        </v-col>-->
    <!--                        <v-col cols="3">-->
    <!--                            <v-text-field-->
    <!--                                    class="mx-2"-->
    <!--                                    dense hide-details-->
    <!--                                    ref="gcs"-->
    <!--                                    v-model="gcs" :rules="gcs_rule"-->
    <!--                                    placeholder="KETI_GCS"-->
    <!--                                    label="GCS*"-->
    <!--                                    required-->
    <!--                                    :disabled="MOBIUS_CONNECTION_CONNECTED"-->
    <!--                            ></v-text-field>-->
    <!--                        </v-col>-->
    <!--                        <v-col cols="2">-->
    <!--                            <v-btn-->
    <!--                                    class="mx-2"-->
    <!--                                    tile @click="GcsAppBarCreated"-->
    <!--                                    elevation="5"-->
    <!--                                    color="primary"-->
    <!--                                    :disabled="MOBIUS_CONNECTION_CONNECTED"-->
    <!--                            > {{ MOBIUS_CONNECTION_TEXT }}-->
    <!--                            </v-btn>-->
    <!--                        </v-col>-->
    <!--                        <v-col cols="2">-->
    <!--                            <v-btn-->
    <!--                                    class="mx-0"-->
    <!--                                    tile @click="GcsAppBarReseted"-->
    <!--                                    elevation="2"-->
    <!--                                    color="primary"-->
    <!--                                    :disabled="!MOBIUS_CONNECTION_CONNECTED"-->
    <!--                            > {{ MOBIUS_DISCONNECTION_TEXT }}-->
    <!--                            </v-btn>-->
    <!--                        </v-col>-->

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
                        <v-btn text outlined @click.stop="confirmSelected(false)">
                            <v-icon left>mdi-ticket-confirmation-outline</v-icon> 확인
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
                                        <v-text-field ref="drone_name" v-model="drone_name" :rules="drone_name_rule" label="Drone Name*" required></v-text-field>
                                    </v-col>
                                    <v-col cols="12" sm="6">
                                        <v-text-field ref="drone_id" v-model="drone_id" :rules="drone_id_rule" label="Drone ID*" hint="Unique ID of Drone" persistent-hint required
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
                                        <v-text-field ref="bat_cell" v-model="bat_cell" :rules="bat_cell_rule" label="Battery Cell*" required></v-text-field>
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
                                        <v-text-field disabled ref="drone_name" v-model="drone_name" :rules="drone_name_update_rule" label="Drone Name*" required></v-text-field>
                                    </v-col>
                                    <v-col cols="12" sm="6">
                                        <v-text-field disabled ref="drone_id" v-model="drone_id" :rules="drone_id_rule" label="Drone ID*" hint="Unique ID of Drone" persistent-hint required
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
                                        <v-text-field ref="bat_cell" v-model="bat_cell" :rules="bat_cell_rule" label="Battery Cell*" required></v-text-field>
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
                //MOBIUS_CONNECTION_CONNECTED: this.$cookies.isKey('mobius_connected')?(this.$cookies.get('mobius_connected') === 'true'):false,
                MOBIUS_CONNECTION_CONNECTED: localStorage.getItem('mobius_connected')?(localStorage.getItem('mobius_connected') === 'true'):false,
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
                    v => (this.drone_infos_list.findIndex((element) => {return(element.name === v)}) === -1) || '드론 이름이 이미 존재합니다.'
                ],
                init_drone_name: null,
                drone_name_update_rule: [
                    v => !!v || '드론 이름은 필수 입력사항입니다.',
                    v => !/[~!@#$%^&*()+|<>?:{}]/.test(v) || '드론 이름에는 특수문자를 사용할 수 없습니다.',
                    v => (this.drone_infos_list.findIndex((element) => {return((element.name === v) && (this.init_drone_name !== v))}) === -1) || '드론 이름이 이미 존재합니다.'
                ],
                drone_id: null,
                drone_id_rule: [
                    v => !!v || '드론 아이디는 필수 입력사항입니다.',
                    v => /^[a-zA-Z0-9]*$/.test(v) || '드론 아이디는 영문+숫자만 입력 가능합니다.',
                    v => (this.drone_infos_list.findIndex((element) => {return(element.id === v)}) === -1) || '드론 아이디가 이미 존재합니다.'
                ],
                init_drone_id: null,
                drone_id_update_rule: [
                    v => !!v || '드론 아이디는 필수 입력사항입니다.',
                    v => /^[a-zA-Z0-9]*$/.test(v) || '드론 아이디는 영문+숫자만 입력 가능합니다.',
                    v => (this.drone_infos_list.findIndex((element) => {return((element.id === v) && (this.init_drone_id !== v))}) === -1) || '드론 이름이 이미 존재합니다.'
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
                host: localStorage.getItem('mobius_host')?(localStorage.getItem('mobius_host')):(this.$store.state.VUE_APP_MOBIUS_HOST),
                host_rule: [
                    v => !!v || '호스트 주소는 필수 입력사항입니다.',
                    v => /^[.0-9]*$/.test(v) || '호스트 주소는 숫자만 입력 가능합니다.'
                ],
                //gcs: this.$cookies.isKey('mobius_gcs')?(this.$cookies.get('mobius_gcs')):(this.$store.state.VUE_APP_MOBIUS_GCS),
                gcs: localStorage.getItem('mobius_gcs')?(localStorage.getItem('mobius_gcs')):(this.$store.state.VUE_APP_MOBIUS_GCS),
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
                items: [
                    {
                        src: 'backgrounds/bg.jpg',
                    },
                    {
                        src: 'backgrounds/md.jpg',
                    },
                    {
                        src: 'backgrounds/bg-2.jpg',
                    },
                    {
                        src: 'backgrounds/md2.jpg',
                    },
                ],
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
                desserts: [
                    {
                        name: 'Frozen Yogurt',
                        id: 159,
                        fat: 6.0,
                        carbs: 24,
                        protein: 4.0,
                        iron: '1%',
                    },
                    {
                        name: 'Ice cream sandwich',
                        id: 237,
                        fat: 9.0,
                        carbs: 37,
                        protein: 4.3,
                        iron: '1%',
                    },
                    {
                        name: 'Eclair',
                        id: 262,
                        fat: 16.0,
                        carbs: 23,
                        protein: 6.0,
                        iron: '7%',
                    },
                    {
                        name: 'Cupcake',
                        id: 305,
                        fat: 3.7,
                        carbs: 67,
                        protein: 4.3,
                        iron: '8%',
                    },
                    {
                        name: 'Gingerbread',
                        id: 356,
                        fat: 16.0,
                        carbs: 49,
                        protein: 3.9,
                        iron: '16%',
                    },
                    {
                        name: 'Jelly bean',
                        id: 375,
                        fat: 0.0,
                        carbs: 94,
                        protein: 0.0,
                        iron: '0%',
                    },
                    {
                        name: 'Lollipop',
                        id: 392,
                        fat: 0.2,
                        carbs: 98,
                        protein: 0,
                        iron: '2%',
                    },
                    {
                        name: 'Honeycomb',
                        id: 408,
                        fat: 3.2,
                        carbs: 87,
                        protein: 6.5,
                        iron: '45%',
                    },
                    {
                        name: 'Donut',
                        id: 452,
                        fat: 25.0,
                        carbs: 51,
                        protein: 4.9,
                        iron: '22%',
                    },
                    {
                        name: 'KitKat',
                        id: 518,
                        fat: 26.0,
                        carbs: 65,
                        protein: 7,
                        iron: '6%',
                    },
                ],
            }
        },

        computed: {
            // drone_infos: function () {
            //     let _drone_infos = [];
            //     for(let dName in this.$store.state.drone_infos) {
            //         if(Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos, dName)) {
            //             if(dName !== 'unknown') {
            //                 _drone_infos.push(this.$store.state.drone_infos[dName]);
            //             }
            //         }
            //     }
            //     return (_drone_infos);
            // },

            form () {
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
            setGCSHomePosition() {
                // EventBus.$emit('do-setGCSHomePosition');
            },

            postCntGcsToMobius(callback) {
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
                    (res) => {
                        console.log('------------------GCS ae created');

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

            postCinLossLTEInfoToMobius(callback) {
                axios({
                    validateStatus: function (status) {
                        // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                        return status < 500;
                    },
                    method: 'post',
                    url: 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/LossLTEInfos',
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
                    function (res) {
                        callback(res.status, '');
                    }
                ).catch(
                    function (err) {
                        console.log(err.message);
                    }
                );
            },

            createEachMarkerInfoToMobius(dName, callback) {
                axios({
                    validateStatus: function (status) {
                        // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                        return status < 500;
                    },
                    method: 'post',
                    url: 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/MarkerInfos',
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

            setEachDroneInfoToMobius(dName, con, callback) {
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
                    function (res) {
                        callback(res.status, '');
                    }
                ).catch(
                    function (err) {
                        console.log(err.message);
                    }
                );
            },

            getCinDroneInfoFromMobius(dName, callback) {
                let self = this;

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
                    function (res) {

                        console.log('getCinDroneInfoFromMobius', 'http://' + self.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + self.$store.state.VUE_APP_MOBIUS_GCS + '/DroneInfos/' + dName + '/la', res.data['m2m:cin'].con);

                        if (res.status === 200) {
                            callback(res.status, res.data['m2m:cin'].con);
                        }
                        else {
                            callback(res.status, '');
                        }
                    }
                ).catch(
                    function (err) {
                        console.log(err.message);
                    }
                );
            },

            getCntGcsFromMobius(callback) {
                axios({
                    validateStatus: function (status) {
                        // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                        return status < 500;
                    },
                    method: 'get',
                    url: 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS,
                    headers: {
                        'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                        'X-M2M-Origin': 'SVue',
                        'Content-Type': 'application/json'
                    }
                }).then(
                    function (res) {
                        if (res.status === 200) {
                            callback(res.status, res.data);
                        } else {
                            callback(res.status, '');
                        }
                    }
                ).catch(
                    function (err) {
                        console.log(err.message);
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
                    url: 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/LossLTEInfos/la',
                    headers: {
                        'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                        'X-M2M-Origin': 'SVue',
                        'Content-Type': 'application/json'
                    }
                }).then(
                    function (res) {
                        console.log('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', res)
                        if (res.status === 200) {
                            callback(res.status, res.data['m2m:cin'].con);
                        } else {
                            callback(res.status, '');
                        }
                    }
                ).catch(
                    function (err) {
                        console.log(err.message);
                    }
                );
            },

            getCntListDroneInfosFromMobius(callback) {
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
                    function (res) {
                        if (res.status === 200) {
                            callback(res.status, res.data['m2m:uril']);
                        } else {
                            callback(res.status, '');
                        }
                    }
                ).catch(
                    function (err) {
                        console.log(err.message);
                    }
                );
            },

            postCinDroneInfo(dName, con, callback) {
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
                    function (res) {
                        callback(res.status, '');
                    }
                ).catch(
                    function (err) {
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

                            this.$store.state.drone_infos[dName] = JSON.parse(JSON.stringify(con));

                            if(localStorage.getItem(dName+'_selected')) {
                                this.$store.state.drone_infos[dName].selected = (localStorage.getItem(dName + '_selected') === 'true');
                            }
                            else {
                                localStorage.setItem(dName+'_selected', String(this.$store.state.drone_infos[dName].selected));
                            }

                            if(dName !== 'unknown') {
                                this.drone_infos_list.push(this.$store.state.drone_infos[dName]);
                            }

                            if(this.$store.state.drone_infos[dName].selected) {
                                this.selected.push(this.$store.state.drone_infos[dName]);
                            }

                            if (!Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos[dName], 'targeted')) {
                                this.$store.state.drone_infos[dName].targeted = false;
                            }

                            if (!Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos[dName], 'home_position')) {
                                this.$store.state.drone_infos[dName].home_position = {lat: 37.4032072, lng: 127.1595933};
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

                            if (!Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos[dName], 'targeted')) {
                                this.$store.state.drone_infos[dName].targeted = false;
                            }

                            if (!Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos[dName], 'headingLine')) {
                                this.$store.state.drone_infos[dName].headingLine = [];
                            }

                            if (!Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos[dName], 'directionLine')) {
                                this.$store.state.drone_infos[dName].directionLine = [];
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

                            if(!Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos[dName], 'targetStayTime')) {
                                this.$store.state.drone_infos[dName].targetStayTime = 0;
                            }

                            if(!Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos[dName], 'yawBehavior')) {
                                this.$store.state.drone_infos[dName].yawBehavior = 'YAW고정';
                            }

                            if(!Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos[dName], 'flyShape')) {
                                this.$store.state.drone_infos[dName].flyShape = '직선비행';
                            }

                            if(!Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos[dName], 'startWay')) {
                                this.$store.state.drone_infos[dName].startWay = '처음부터';
                            }

                            if(!Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos[dName], 'curMissionItemReached')) {
                                this.$store.state.drone_infos[dName].curMissionItemReached = 0;
                            }

                            if(!Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos[dName], 'curTargetedTempMarkerIndex')) {
                                this.$store.state.drone_infos[dName].curTargetedTempMarkerIndex = -1;
                            }

                            if(!Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos[dName], 'curTargetedSurveyMarkerIndex')) {
                                this.$store.state.drone_infos[dName].curTargetedSurveyMarkerIndex = -1;
                            }

                            if(!Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos[dName], 'absolute_alt')) {
                                this.$store.state.drone_infos[dName].absolute_alt = 0;
                            }

                            if(!Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos[dName], 'rtlSpeed')) {
                                this.$store.state.drone_infos[dName].rtlSpeed = 5;
                            }

                            if(!Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos[dName], 'takeoffDelay')) {
                                this.$store.state.drone_infos[dName].takeoffDelay = 6;
                            }

                            this.$store.state.drone_infos[dName].targeted = false;

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

            createMarkerInfoToMobius(callback) {
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
                            function (res) {
                                callback(res.status, '');
                            }
                        ).catch(
                            function (err) {
                                console.log(err.message);
                            }
                        );
                    }
                ).catch(
                    function (err) {
                        console.log(err.message);
                    }
                );
            },

            createSurveyMarkerInfoToMobius(callback) {
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
                                    rn: 'SurveyMarkerInfos',
                                    lbl: ['SurveyMarkerInfos'],
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
                    }
                ).catch(
                    function (err) {
                        console.log(err.message);
                    }
                );
            },

            setEachMarkerInfoToMobius(dName, con, callback) {
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
                            con: con
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
                    function (res) {

                        console.log('getEachMarkerInfoFromMobius', 'http://' + self.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + self.$store.state.VUE_APP_MOBIUS_GCS + '/MarkerInfos/' + dName + '/la', res);

                        if (res.status === 200) {
                            callback(res.status, res.data['m2m:cin'].con);
                        } else {
                            callback(res.status, '');
                        }
                    }
                ).catch(
                    function (err) {
                        console.log(err.message);
                    }
                );
            },

            getEachSurveyMarkerInfoFromMobius(dName, callback) {
                let self = this;

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
                    function (res) {

                        console.log('getEachSurveyMarkerInfoFromMobius', 'http://' + self.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + self.$store.state.VUE_APP_MOBIUS_GCS + '/SurveyMarkerInfos/' + dName + '/la', res);

                        if (res.status === 200) {
                            callback(res.status, res.data['m2m:cin'].con);
                        } else {
                            callback(res.status, '');
                        }
                    }
                ).catch(
                    function (err) {
                        console.log(err.message);
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
                    function (res) {
                        if (res.status === 200) {
                            callback(res.status, res.data['m2m:uril']);
                        } else {
                            callback(res.status, '');
                        }
                    }
                ).catch(
                    function (err) {
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
                    function (res) {
                        if (res.status === 200) {
                            callback(res.status, res.data['m2m:uril']);
                        } else {
                            callback(res.status, '');
                        }
                    }
                ).catch(
                    function (err) {
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
                    function (res) {

                        console.log('postMarkerInfos-axios', dName, res.data);

                        callback(res.status, '');
                    }
                ).catch(
                    function (err) {
                        console.log(err.message);
                    }
                );
            },

            initTempMarkerInfos(markers, count, callback) {
                if(markers.length > count) {
                    let dName = markers[count].split('/')[3];
                    this.getEachMarkerInfoFromMobius(dName, (status, con) => {
                        if(status === 200) {
                            if(con === undefined) {
                                con = [];
                            }

                            console.log('getEachMarkerInfoFromMobius', count, dName, con);

                            if(con.length === 0) {
                                this.$store.state.tempMarkers[dName] = [];
                            }
                            else {
                                this.$store.state.tempMarkers[dName] = JSON.parse(JSON.stringify(con));

                                this.$store.state.drone_infos[dName].curTargetedTempMarkerIndex = -1;
                                this.$store.state.tempMarkers[dName].forEach((marker) => {
                                    if(!Object.hasOwnProperty.call(marker, 'elevation')) {
                                        marker.elevation = 0;
                                    }

                                    if(!Object.hasOwnProperty.call(marker, 'type')) {
                                        marker.type = 'Goto';
                                    }

                                    if(!Object.hasOwnProperty.call(marker, 'mavCmd')) {
                                        marker.targetMavCmd = 16;
                                    }

                                    if(!Object.hasOwnProperty.call(marker, 'targetStayTime')) {
                                        marker.targetStayTime = 1;
                                    }

                                    marker.targeted = false;
                                    marker.selected = false;
                                });

                                // let payload = {};
                                // payload.dName = dName;
                                // EventBus.$emit('draw-gotoLines', payload);

                                EventBus.$emit('do-positions-elevation-' + dName);
                            }

                            this.initTempMarkerInfos(markers, ++count, () => {
                                callback();
                            });
                        }
                    });
                }
                else {
                    callback();
                }
            },

            initSurveyMarkerInfos(markers, count, callback) {
                if(markers.length > count) {
                    let dName = markers[count].split('/')[3];
                    this.getEachSurveyMarkerInfoFromMobius(dName, (status, con) => {
                        if(status === 200 || status === 404 || con === '') {
                            if(con === undefined) {
                                con = [];
                            }

                            console.log(count, dName, con);

                            if(con.length === 0) {
                                this.$store.state.surveyMarkers[dName] = [];
                            }
                            else {
                                this.$store.state.surveyMarkers[dName] = JSON.parse(JSON.stringify(con));

                                this.$store.state.surveyMarkers[dName].forEach((marker) => {
                                    marker.targeted = false;
                                    marker.selected = false;
                                    marker.options.zIndex = 5;

                                    if(!Object.prototype.hasOwnProperty.call(marker, 'angleStart')) {
                                        marker.angleStart = 0;
                                    }

                                    if(!Object.prototype.hasOwnProperty.call(marker, 'dir')) {
                                        marker.dir = 'cw';
                                    }

                                    if(!Object.prototype.hasOwnProperty.call(marker, 'color')) {
                                        marker.color = 'orange';
                                    }

                                    if(!Object.prototype.hasOwnProperty.call(marker, 'gap')) {
                                        marker.gap = 10;
                                    }

                                    if(!Object.prototype.hasOwnProperty.call(marker, 'pathLines')) {
                                        marker.pathLines = [];
                                    }

                                    if(!Object.prototype.hasOwnProperty.call(marker, 'polygonDraggable')) {
                                        marker.polygonDraggable = false;
                                    }

                                    if(!Object.prototype.hasOwnProperty.call(marker, 'polygonEditable')) {
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

                                    if(!Object.prototype.hasOwnProperty.call(marker, 'area')) {
                                        marker.area = 0;
                                    }

                                    if(!Object.prototype.hasOwnProperty.call(marker, 'paramAlt')) {
                                        marker.paramAlt = 150;
                                    }

                                    if(!Object.prototype.hasOwnProperty.call(marker, 'paramOffsetAlt')) {
                                        marker.paramOffsetAlt = 0;
                                    }

                                    if(!Object.prototype.hasOwnProperty.call(marker, 'flyAlt')) {
                                        marker.flyAlt = Array(256).fill(150);
                                    }

                                    if(!Object.prototype.hasOwnProperty.call(marker, 'takeoffAlt')) {
                                        marker.takeoffAlt = Array(256).fill(0);
                                    }

                                    if(!Object.prototype.hasOwnProperty.call(marker, 'offsetAlt')) {
                                        marker.offsetAlt = Array(256).fill(0);
                                    }

                                    if(!Object.prototype.hasOwnProperty.call(marker, 'flyAltType')) {
                                        marker.flyAltType = '상대고도';
                                    }

                                    if(!Object.prototype.hasOwnProperty.call(marker, 'elevations')) {
                                        marker.elevations = [];
                                    }

                                    if(!Object.prototype.hasOwnProperty.call(marker, 'elevations_location')) {
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
                    });
                }
                else {
                    callback();
                }
            },

            readyDroneInfos() {
                // let payload = JSON.parse(JSON.stringify(this.$store.state.drone_infos));
                //
                // this.$store.commit('resetDroneInfos', payload);

                //EventBus.$emit('do-selected-drone-profiles');

                //console.log('GcsAppBar-created-drone_infos', this.$store.state.drone_infos);

                //this.$store.commit('updateDroneInfosSelected');

                //let unknown = JSON.parse(JSON.stringify(this.$store.state.drone_infos.unknown));

                //console.log('GcsAppBar-created-unknown', unknown);
                //this.$store.commit('initUnknownInfo', unknown);

                EventBus.$emit('gcs-map-ready', {});

                //unknown = null;

                this.MOBIUS_CONNECTION_CONNECTED = true;
                this.$store.state.MOBIUS_CONNECTION_CONNECTED = true;
                //self.$cookies.set('mobius_connected', self.MOBIUS_CONNECTION_CONNECTED);
                localStorage.setItem('mobius_connected', this.MOBIUS_CONNECTION_CONNECTED);
            },

            GcsAppBarCreated() {
                this.$store.state.VUE_APP_MOBIUS_HOST = this.host;
                this.$store.state.VUE_APP_MOBIUS_GCS = this.gcs;

                //this.$cookies.set('mobius_host', this.host);
                //this.$cookies.set('mobius_gcs', this.gcs);

                //console.log('localStorage-mobius_gcs', localStorage.getItem("mobius_gcs"));

                localStorage.setItem('mobius_host', this.host);
                localStorage.setItem('mobius_gcs', this.gcs);

                this.getCntGcsFromMobius((status) => {
                    console.log('------1---------------------------------GcsAppBarCreated-getCntGcsFromMobius', status);
                    if(status === 200) {
                        this.getCinLossLTEInfosFromMobius((status, lossLTEs) => {
                            if(status === 200) {
                                if(lossLTEs === undefined) {
                                    this.$store.state.loss_lte_infos = {};
                                }
                                else {
                                    this.$store.state.loss_lte_infos = lossLTEs;
                                }
                                console.log('------1---------------------------------GcsAppBarCreated-getCinLossLTEInfosFromMobius', status, this.$store.state.loss_lte_infos);
                            }
                            else {
                                this.postCntLossLTEInfosToMobius(() => {
                                    this.$store.state.loss_lte_infos = {};
                                     this.postCinLossLTEInfoToMobius(() => {
                                         console.log('this.$store.state.loss_lte_infos', this.$store.state.loss_lte_infos);
                                     });
                                });
                            }
                        });

                        this.getCntListDroneInfosFromMobius((status, drones) => {
                            console.log('------1---------------------------------GcsAppBarCreated-getCntListDroneInfosFromMobius', status, drones.length, drones);
                            if(status === 200) {
                                if(drones.length === 0) {
                                    this.postCntDroneInfoToMobius('unknown', () => {
                                         this.postCinDroneInfo('unknown', {goto_positions: [], color: "grey", selected: false}, (status) => {
                                             if (status === 201) {
                                                this.getCntListDroneInfosFromMobius((status, drones) => {
                                                    if(status === 200) {
                                                        this.$store.state.drone_infos = {};
                                                        this.initDroneInfos(drones, 0, () => {
                                                            console.log(this.$store.state.drone_infos);

                                                            setTimeout(() => {
                                                                this.readyDroneInfos();
                                                            }, 250);
                                                        });
                                                    }
                                                });
                                             }
                                         });
                                    });

                                    this.$store.state.drone_infos = {};
                                }
                                else {
                                    this.$store.state.drone_infos = {};
                                    this.initDroneInfos(drones, 0, (result) => {
                                        if(result === 0) {
                                            console.log('initDroneInfos-success', result, this.$store.state.drone_infos);

                                            setTimeout(() => {
                                                this.readyDroneInfos();
                                            }, 250);
                                        }
                                        else {
                                            console.log('initDroneInfos-error', result, this.$store.state.drone_infos);
                                        }
                                    });
                                }
                            }
                            else {
                                this.postCntDroneInfosToMobius(() => {
                                    this.postCntDroneInfoToMobius('unknown', () => {
                                        this.postCinDroneInfo('unknown', {goto_positions: [], color: "grey", selected: false}, (status) => {
                                            if(status === 201) {
                                                this.getCntListDroneInfosFromMobius((status, drones) => {
                                                    if(status === 200) {
                                                        if(drones.length === 0) {
                                                            this.$store.state.drone_infos = {};
                                                        }
                                                        else {
                                                            this.$store.state.drone_infos = {};
                                                            this.initDroneInfos(drones, 0, () => {
                                                                console.log(this.$store.state.drone_infos);

                                                                setTimeout(() => {
                                                                    this.readyDroneInfos();
                                                                }, 250);
                                                            });
                                                        }
                                                    }
                                                });
                                            }
                                        });
                                    });
                                });
                            }
                        });

                        setTimeout(() => {
                            this.getMarkerInfosFromMobius((status, markers) => {
                                console.log('GcsAppBarCreated-getMarkerInfosFromMobius', status, markers.length, markers);
                                if(status === 200) {
                                    if(markers.length === 0) {
                                        this.$store.state.tempMarkers = {};
                                    }
                                    else {
                                        this.$store.state.tempMarkers = {};
                                        this.initTempMarkerInfos(markers, 0, () => {
                                            console.log('GcsAppBarCreated()-2', this.$store.state.tempMarkers);
                                        });
                                    }
                                }
                                else {
                                    this.createMarkerInfoToMobius(() => {
                                    });

                                    this.createSurveyMarkerInfoToMobius(() => {
                                    });
                                }
                            });

                            this.getSurveyMarkerInfosFromMobius((status, markers) => {
                                console.log('GcsAppBarCreated-getSurveyMarkerInfosFromMobius', status, markers.length, markers);
                                if(status === 200) {
                                    if(markers.length === 0) {
                                        this.$store.state.surveyMarkers = {};
                                    }
                                    else {
                                        this.$store.state.surveyMarkers = {};
                                        this.initSurveyMarkerInfos(markers, 0, () => {
                                            console.log('GcsAppBarCreated()-2', 'initSurveyMarkerInfos', this.$store.state.surveyMarkers);
                                        });
                                    }
                                }
                                else {
                                    this.createSurveyMarkerInfoToMobius(() => {
                                    });
                                }
                            });
                        }, 250);
                    }
                    else {
                        this.postCntGcsToMobius(() => {
                            this.getCntListDroneInfosFromMobius((status, drones) => {
                                console.log('------1---------------------------------GcsAppBarCreated-getCntListDroneInfosFromMobius', status, drones.length, drones);
                                if(status === 200) {
                                    if(drones.length === 0) {
                                        this.postCntDroneInfoToMobius('unknown', () => {
                                            this.postCinDroneInfo('unknown', {goto_positions: [], color: "grey", selected: false}, (status) => {
                                                if (status === 201) {
                                                    this.getCntListDroneInfosFromMobius((status, drones) => {
                                                        if(status === 200) {
                                                            this.$store.state.drone_infos = {};
                                                            this.initDroneInfos(drones, 0, () => {
                                                                console.log(this.$store.state.drone_infos);

                                                                setTimeout(() => {
                                                                    this.readyDroneInfos();
                                                                }, 250);
                                                            });
                                                        }
                                                    });
                                                }
                                            });
                                        });
                                    }
                                    else {
                                        this.$store.state.drone_infos = {};
                                        this.initDroneInfos(drones, 0, () => {
                                            console.log(this.$store.state.drone_infos);

                                            setTimeout(() => {
                                                this.readyDroneInfos();
                                            }, 250);
                                        });
                                    }
                                }
                                else {
                                    this.postCntDroneInfosToMobius(() => {
                                        this.postCntDroneInfoToMobius('unknown', () => {
                                            this.postCinDroneInfo('unknown', {goto_positions: [], color: "grey", selected: false}, (status) => {
                                                if(status === 201) {
                                                    this.getCntListDroneInfosFromMobius((status, drones) => {
                                                        if(status === 200) {
                                                            this.$store.state.drone_infos = {};
                                                            this.initDroneInfos(drones, 0, () => {
                                                                console.log(this.$store.state.drone_infos);

                                                                setTimeout(() => {
                                                                    this.readyDroneInfos();
                                                                }, 250);
                                                            });
                                                        }
                                                    });
                                                }
                                            });
                                        });
                                    });
                                }
                            });
                        });
                    }
                });
            },

            GcsAppBarReseted() {
                this.selected = [];
                this.drone_infos_list = [];

                this.MOBIUS_CONNECTION_CONNECTED = false;
                this.$store.state.MOBIUS_CONNECTION_CONNECTED = false;

                //this.$cookies.set('mobius_connected', this.MOBIUS_CONNECTION_CONNECTED);
                localStorage.setItem('mobius_connected', this.MOBIUS_CONNECTION_CONNECTED);

                this.confirmSelected(true);
            },

            dialogProfile() {
                this.selected = null;
                this.selected = [];

                for(let dName in this.$store.state.drone_infos) {
                    if(Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos, dName)) {
                        if(this.$store.state.drone_infos[dName].selected) {
                            this.selected.push(this.$store.state.drone_infos[dName]);
                        }
                    }
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

            postDroneInfos(dName, callback) {
                axios({
                    validateStatus: function (status) {
                        // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                        return status < 500;
                    },
                    method: 'post',
                    url: 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/DroneInfos/' + dName,
                    headers: {
                        'X-M2M-RI': String(parseInt(Math.random()*10000)),
                        'X-M2M-Origin': 'SVue',
                        'Content-Type': 'application/json;ty=4'
                    },
                    data: {
                        'm2m:cin': {
                            con: this.$store.state.drone_infos[dName]
                        }
                    }
                }).then(
                    function (res) {
                        console.log('postDroneInfos-axios', dName, res.data);

                        callback(res);
                    }
                ).catch(
                    function (err) {
                        console.log(err.message);

                        callback(err)
                    }
                );
            },

            delDroneInfos(dName, callback) {
                axios({
                    validateStatus: function (status) {
                        // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                        return status < 500;
                    },
                    method: 'delete',
                    url: 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/DroneInfos/' + dName,
                    headers: {
                        'X-M2M-RI': String(parseInt(Math.random()*10000)),
                        'X-M2M-Origin': 'SVue',
                        'Content-Type': 'application/json'
                    }
                }).then(
                    function (res) {
                        console.log('delDroneInfos-axios', dName, res.data);

                        callback(res);
                    }
                ).catch(
                    function (err) {
                        console.log(err.message);

                        callback(err)
                    }
                );
            },

            delMarkerInfos(dName, callback) {
                axios({
                    validateStatus: function (status) {
                        // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                        return status < 500;
                    },
                    method: 'delete',
                    url: 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/MarkerInfos/' + dName,
                    headers: {
                        'X-M2M-RI': String(parseInt(Math.random()*10000)),
                        'X-M2M-Origin': 'SVue',
                        'Content-Type': 'application/json'
                    }
                }).then(
                    function (res) {
                        console.log('delMarkerInfos-axios', dName, res.data);

                        callback(res);
                    }
                ).catch(
                    function (err) {
                        console.log(err.message);

                        callback(err)
                    }
                );
            },

            confirmSelected(dialog) {
                console.log('confirmSelected', this.selected);

                if(Object.keys(this.$store.state.drone_infos).length <= 1) {
                    this.dialog = false;
                    return;
                }

                for (let dName in this.$store.state.drone_infos) {
                    if (Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos, dName)) {
                        this.$store.state.drone_infos[dName].selected = false;
                    }
                }

                for(let idx in this.selected) {
                    if (Object.prototype.hasOwnProperty.call(this.selected, idx)) {
                        this.$store.state.drone_infos[this.selected[idx].name].selected = true;
                    }
                }

                for(let name in this.$store.state.drone_infos) {
                    if(Object.hasOwnProperty.call(this.$store.state.drone_infos, name)) {
                        if(name !== 'unknown') {
                            localStorage.setItem(name+'_selected', String(this.$store.state.drone_infos[name].selected));
                        }
                    }
                }

                Object.keys(this.$store.state.drone_infos).forEach((dName) => {
                    this.postDroneInfos(dName, () => {
                        // this.postMarkerInfos(dName);
                    });
                });

                //this.$store.commit('updateDroneInfosSelected');
                this.dialog = dialog;

                EventBus.$emit('confirm_selected', JSON.parse(JSON.stringify(this.selected)));

                this.$forceUpdate();
            },

            resetForm () {
                this.errorMessages = [];
                this.formHasErrors = false;

                Object.keys(this.form).forEach(f => {
                    if(f === 'host') {
                        this.$refs[f].value = this.$store.state.VUE_APP_MOBIUS_HOST;
                    }
                    else if(f === 'gcs') {
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

            removeProfile(item) {
                for(let idx in this.selected) {
                    if(Object.prototype.hasOwnProperty.call(this.selected, idx)) {
                        if(this.selected[idx].name === item.name) {
                            this.selected.splice(idx, 1);
                        }
                    }
                }
                console.log('removeProfile', item);

                this.$store.commit('delDroneInfo', item.name);

                this.selected = null;
                this.selected = [];
                this.drone_infos_list = null;
                this.drone_infos_list = [];

                for(let dName in this.$store.state.drone_infos) {
                    if(Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos, dName)) {
                        if(dName !== 'unknown') {
                            this.drone_infos_list.push(this.$store.state.drone_infos[dName]);
                        }

                        if(this.$store.state.drone_infos[dName].selected) {
                            this.selected.push(this.$store.state.drone_infos[dName]);
                        }
                    }
                }

                this.delDroneInfos(item.name, () => {
                    this.fab = false;

                    this.delMarkerInfos(item.name, () => {
                        console.log('removeProfile');
                    });
                });

                // let self = this;
                // this.postDroneInfos(function () {
                //     self.fab = false;
                // });
            },

            delProfile () {
                console.log('delProfile', this.selected);

                for(let _el in this.selected) {
                    if(Object.prototype.hasOwnProperty.call(this.selected, _el)) {

                        this.removeProfile(this.selected[_el]);
                    }
                }
            },

            cancel() {
                this.resetForm();
                this.add_dialog = false;
            },

            submitAddProfile () {
                this.formHasErrors = false;

                for(let el in this.form) {
                    if(Object.prototype.hasOwnProperty.call(this.form, el)) {
                        // if (!this.form[el]) {
                        //     this.formHasErrors = true;
                        // }

                        // console.log(el);

                        this.$refs[el].validate(true);
                    }
                }

                if(this.formHasErrors === false) {
                    let payload = {};
                    payload.selected = false;
                    payload.lat = 37.404324133883605 + Math.random() * 0.001;
                    payload.lng = 127.16124484502097 + Math.random() * 0.001;
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

                    this.$store.commit('addDroneInfos', payload);

                    this.selected = null;
                    this.selected = [];
                    this.drone_infos_list = null;
                    this.drone_infos_list = [];

                    for(let dName in this.$store.state.drone_infos) {
                        if(Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos, dName)) {
                            if(dName !== 'unknown') {
                                this.drone_infos_list.push(this.$store.state.drone_infos[dName]);
                            }

                            if(this.$store.state.drone_infos[dName].selected) {
                                this.selected.push(this.$store.state.drone_infos[dName]);
                            }
                        }
                    }

                    this.postCntDroneInfoToMobius(this.drone_name, () => {
                        this.postDroneInfos(this.drone_name, () => {
                            this.createEachMarkerInfoToMobius(this.drone_name, () => {
                                this.$store.state.tempMarkers[this.drone_name] = [];
                                this.postMarkerInfos(this.drone_name, () => {
                                    this.add_dialog = false;
                                    this.fab = false;

                                    this.resetForm();
                                });
                            });
                        });
                    });
                }
            },

            update_cancel() {
                this.resetForm();
                this.update_dialog = false;
            },

            update_submit () {
                this.formHasErrors = false;

                for(let el in this.form) {
                    if(Object.prototype.hasOwnProperty.call(this.form, el)) {
                        // if (!this.form[el]) {
                        //     this.formHasErrors = true;
                        //
                        //     console.log(el);
                        // }
                        //
                        // console.log(el);

                        this.$refs[el].validate(true);
                    }
                }

                if(this.formHasErrors === false) {
                    console.log('update_submit', this.$store.state.drone_infos[this.drone_name]);

                    let payload = JSON.parse(JSON.stringify(this.$store.state.drone_infos[this.drone_name]));
                    payload.host = this.host;
                    payload.gcs = this.gcs;
                    payload.type = this.type_selected;
                    payload.color = this.$store.state.refColorValue[this.color_selected];
                    payload.name = this.drone_name;
                    payload.drone_host = this.drone_host;
                    payload.id = this.drone_id;
                    payload.bat_cell = this.bat_cell;
                    payload.system_id = this.system_id;

                    this.$store.commit('updateDroneInfos', payload);

                    this.selected = null;
                    this.selected = [];
                    this.drone_infos_list = null;
                    this.drone_infos_list = [];

                    for(let dName in this.$store.state.drone_infos) {
                        if(Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos, dName)) {
                            if(dName !== 'unknown') {
                                this.drone_infos_list.push(this.$store.state.drone_infos[dName]);
                            }

                            if(this.$store.state.drone_infos[dName].selected) {
                                this.selected.push(this.$store.state.drone_infos[dName]);
                            }
                        }
                    }

                    this.postDroneInfos(this.drone_name, () => {
                        this.update_dialog = false;
                        this.fab = false;

                        payload = null;

                        this.resetForm();
                    });

                    //
                    // axios({
                    //     validateStatus: function (status) {
                    //         // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                    //         return status < 500;
                    //     },
                    //     method: 'put',
                    //     url: 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':3000/info/'+this.drone_id,
                    //     headers: {
                    // 'X-M2M-RI': String(parseInt(Math.random()*10000)),
                    //         'X-M2M-Origin': 'SVue',
                    //         'Content-Type': 'application/json'
                    //     },
                    //     data: payload
                    // }).then(
                    //     function (res) {
                    //         console.log(res.data);
                    //
                    //         let update_profile = {};
                    //         update_profile.index = self.update_idx;
                    //         update_profile.profile = payload;
                    //
                    //         self.$store.commit('updateDroneInfos', update_profile);
                    //         self.update_dialog = false;
                    //         self.fab = false;
                    //
                    //         self.resetForm();
                    //     }
                    // ).catch(
                    //     function (err) {
                    //         console.log(err.message);
                    //         self.update_dialog = false;
                    //         self.fab = false;
                    //
                    //         self.resetForm();
                    //     }
                    // );
                }

            },
        },

        created() {
            // EventBus.$on('do-selected-drone-profiles', () => {
            //     console.log('do-selected-drone-profiles');
            //
            //     this.selected = null;
            //     this.selected = [];
            //     this.drone_infos = [];
            //
            //     for(let dName in this.$store.state.drone_infos) {
            //         if(Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos, dName)) {
            //             if(dName !== 'unknown') {
            //                 this.drone_infos.push(this.$store.state.drone_infos[dName]);
            //             }
            //
            //             if(this.$store.state.drone_infos[dName].selected) {
            //                 this.selected.push(this.$store.state.drone_infos[dName]);
            //             }
            //         }
            //     }
            //
            //     this.$forceUpdate();
            // });

            // let self = this;
            //
            // axios({
            //     validateStatus: function (status) {
            //         // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
            //         return status < 500;
            //     },
            //     method: 'get',
            //     url: 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/Info/la',
            //     headers: {
            // 'X-M2M-RI': String(parseInt(Math.random()*10000)),
            //         'X-M2M-Origin': 'SVue',
            //         'Content-Type': 'application/json'
            //     }
            // }).then(
            //     function (res) {
            //         let payload = res.data;
            //
            //         self.$store.commit('resetDroneInfos', payload['m2m:cin'].con);
            //
            //         // self.$store.state.drone_infos = [];
            //         // self.$store.state.drone_infos = self.$store.state.drone_infos.concat(res.data);
            //
            //         console.log('GcsAppBar-created-drone_infos', self.$store.state.drone_infos);
            //
            //         // axios({
            //         //     validateStatus: function (status) {
            //         //         // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
            //         //         return status < 500;
            //         //     },
            //         //     method: 'get',
            //         //     url: 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':3000/selected',
            //         //     headers: {
            // 'X-M2M-RI': String(parseInt(Math.random()*10000)),
            //         //         'X-M2M-Origin': 'SVue',
            //         //         'Content-Type': 'application/json'
            //         //     }
            //         // }).then(
            //         //     function (res) {
            //         //         let _selected = res.data;
            //
            //                 // let _selected = [];
            //                 // for(let dName in self.$store.state.drone_infos) {
            //                 //     if(Object.prototype.hasOwnProperty.call(self.$store.state.drone_infos, dName)) {
            //                 //         if(self.$store.state.drone_infos[dName].selected) {
            //                 //             _selected.push(self.$store.state.drone_infos[dName]);
            //                 //         }
            //                 //     }
            //                 // }
            //
            //                 self.$store.commit('updateDroneInfosSelected');
            //
            //                 // axios({
            //                 //     validateStatus: function (status) {
            //                 //         // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
            //                 //         return status < 500;
            //                 //     },
            //                 //     method: 'get',
            //                 //     url: 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':3000/unknown',
            //                 //     headers: {
            // 'X-M2M-RI': String(parseInt(Math.random()*10000)),
            //                 //         'X-M2M-Origin': 'SVue',
            //                 //         'Content-Type': 'application/json'
            //                 //     }
            //                 // }).then(
            //                 //     function (res) {
            //                 //         let unknown = res.data;
            //
            //                         let unknown = JSON.parse(JSON.stringify(self.$store.state.drone_infos.unknown));
            //
            //                         console.log('GcsAppBar-created-unknown', unknown);
            //                         self.$store.commit('initUnknownInfo', unknown);
            //
            //                         EventBus.$emit('gcs-map-ready', {});
            //
            //                         unknown = null;
            //
            //                         //_selected = null;
            //
            //
            //
            //                 //     }
            //                 // ).catch(
            //                 //     function (err) {
            //                 //         console.log(err.message);
            //                 //     }
            //                 // );
            //         //     }
            //         // ).catch(
            //         //     function (err) {
            //         //         console.log(err.message);
            //         //     }
            //         // );
            //     }
            // ).catch(
            //     function (err) {
            //         console.log(err.message);
            //     }
            // );
            //
            //
            //
            //
            //
            // // axios.get('http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':3000/tempMarkers').then(
            // //     function (res) {
            // //         let payload = res.data;
            // //
            // //         self.$store.commit('initTempMarkers', payload);
            // //
            // //         // self.$store.state.drone_infos = [];
            // //         // self.$store.state.drone_infos = self.$store.state.drone_infos.concat(res.data);
            // //
            // //         console.log('GcsAppBar-created-tempMarkers', res.data);
            // //     }
            // // ).catch(
            // //     function (err) {
            // //         console.log(err.message);
            // //     }
            // // );
        },

        mounted() {
            if(this.MOBIUS_CONNECTION_CONNECTED) {
                this.GcsAppBarCreated();
            }
        },

        beforeDestroy() {
            //EventBus.$off('do-selected-drone-profiles');
        }
    }
</script>

<style scoped>
    #create .v-speed-dial {
        position: absolute;
    }

    #create .v-btn--floating {
        position: relative;
    }
</style>
