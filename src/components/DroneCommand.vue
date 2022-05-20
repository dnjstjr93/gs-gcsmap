<template>
    <v-sheet
        elevation="6"
        class="font-weight-bold tab_position"
        :style="{top:(context_top+2)+'px', left:(context_left+10)+'px', width: ($store.state.command_tab_max_width-41)+'px'}"
    >
        <v-tabs
            v-if="prepared"
            class="font-weight-medium"
            background-color="blue-grey darken-4"
            dark center-active show-arrows
            color="red"
            next-icon="mdi-arrow-right-bold-box-outline"
            prev-icon="mdi-arrow-left-bold-box-outline"
            v-model="$store.state.active_tab"
            active-class="text--accent-5"
        >
            <v-tabs-slider color="red"></v-tabs-slider>
            <v-tab class="pa-0 ma-0" style="min-width:0" href="virtual"></v-tab>
            <v-tab v-for="(command) in $store.state.commands" :key="command.title" :href="'#'+command.title" @click="tab_click(command.title)">
                {{command.title}}
            </v-tab>

            <v-tab-item value="virtual" class=""></v-tab-item>
            <v-tab-item v-for="(command) in $store.state.commands" :key="command.title" :value="command.title" class="">
                <v-card outlined color="grey lighten-4" style="opacity: 0.86" class="pa-0 overflow-y-auto" :max-height="$store.state.command_tab_max_height+'px'">
<!--                    <v-card-title primary-title class="headline">-->
<!--                        {{command.title}}-->
<!--                    </v-card-title>-->
                    <v-card-subtitle class="pl-1 pa-0">
                        {{command.text}}
                    </v-card-subtitle>
                    <v-card style="opacity: 0.86" class="pa-0">
                        <v-row class="mb-2" no-gutters align="center">
                            <v-col cols="10">
                                <v-card>
<!--                                        <v-toolbar flat dense-->
<!--                                            v-if="((command.title === $store.state.commands[0].title) || (command.title === $store.state.commands[2].title) || (command.title === $store.state.commands[3].title))"-->
<!--                                        >-->
<!--                                            <v-toolbar-title>-->
<!--                                                <span class="subheading" v-if="command.title === $store.state.commands[0].title">모드 설정</span>-->
<!--                                                <span class="subheading" v-else-if="command.title === $store.state.commands[2].title">이륙 고도 설정</span>-->
<!--                                                <span class="subheading" v-else-if="command.title === $store.state.commands[3].title">비행 고도 설정</span>-->
<!--                                            </v-toolbar-title>-->
<!--                                        </v-toolbar>-->
                                    <div v-for="(d, dIndex) in $store.state.drone_infos" :key="'mode'+dIndex">
                                        <div v-if="d.selected && d.targeted">
                                            <v-row no-gutters align="center">
                                                <v-col cols="2">
                                                    <v-card text outlined tile>
                                                        <v-chip
                                                            label outlined
                                                            v-if="d"
                                                            color="primary"
                                                            class="ml-1"
                                                        >
                                                            <v-icon left>
                                                                mdi-airplane
                                                            </v-icon> {{dIndex}}
                                                        </v-chip>
                                                    </v-card>
                                                </v-col>
                                                <v-col cols="10">
                                                    <v-card v-if="command.title === '모드'">
                                                        <v-chip-group
                                                            v-model="targetModeSelection[d.name]"
                                                            mandatory show-arrows
                                                            active-class="deep-purple--text text--accent-5"
                                                            :center-active="true"
                                                            class="ma-0 px-0 py-0"
                                                        >
                                                            <v-chip
                                                                v-for="(item, idx) in $store.state[d.type + '_mode_items']" :key="'mode_items_'+idx"
                                                                label outlined
                                                                :color="d.color"
                                                                :value="item"
                                                            >
                                                                {{ item }}
                                                            </v-chip>
                                                        </v-chip-group>
                                                    </v-card>
                                                    <v-card v-if="command.title === '이륙'">
                                                        <v-row no-gutters>
                                                            <v-col cols="6">
<!--                                                                    <v-slider-->
<!--                                                                        v-model="targetTakeoffAlt[d.name]"-->
<!--                                                                        class="mx-2 my-3 align-center"-->
<!--                                                                        :max="500"-->
<!--                                                                        :min="3"-->
<!--                                                                        hide-details-->
<!--                                                                    >-->
<!--                                                                        <template v-slot:append>-->
<!--                                                                            <v-text-field-->
<!--                                                                                v-model="targetTakeoffAlt[d.name]"-->
<!--                                                                                class="mt-0 pt-0"-->
<!--                                                                                hide-details-->
<!--                                                                                single-line-->
<!--                                                                                type="number"-->
<!--                                                                                style="width: 60px"-->
<!--                                                                            ></v-text-field>-->
<!--                                                                        </template>-->
<!--                                                                    </v-slider>-->
                                                                <v-text-field
                                                                    label="이륙고도"
                                                                    hide-details dense outlined
                                                                    v-model="targetTakeoffAlt[d.name]"
                                                                    type="number"
                                                                    class="pa-1"
                                                                ></v-text-field>
                                                            </v-col>
                                                            <v-col cols="6">
                                                                <v-text-field
                                                                    label="시동 후 지연 시간(초): "
                                                                    outlined dense hide-details
                                                                    v-model="takeoffDelay[d.name]"
                                                                    type="number"
                                                                    min="6" max="20"
                                                                    class="pa-1"
                                                                ></v-text-field>
                                                            </v-col>
                                                        </v-row>
                                                    </v-card>
                                                    <v-card v-if="command.title === '고도'">
                                                        <v-row no-gutters>
                                                            <v-col cols="12">
                                                                <v-text-field
                                                                    v-model="targetAlt[d.name]"
                                                                    dense outlined hide-details
                                                                    label="비행고도(m)"
                                                                    type="number"
                                                                    class="pa-1"
                                                                ></v-text-field>
<!--                                                                <v-slider-->
<!--                                                                    v-model="targetAlt[d.name]"-->
<!--                                                                    class="mx-2 my-3 align-center"-->
<!--                                                                    :max="500"-->
<!--                                                                    :min="3"-->
<!--                                                                    hide-details-->
<!--                                                                >-->
<!--                                                                    <template v-slot:append>-->
<!--                                                                        <v-text-field-->
<!--                                                                            v-model="targetAlt[d.name]"-->
<!--                                                                            class="mt-0 pt-0"-->
<!--                                                                            hide-details-->
<!--                                                                            label="고도(m)"-->
<!--                                                                            type="number"-->
<!--                                                                            style="width: 60px"-->
<!--                                                                        ></v-text-field>-->
<!--                                                                    </template>-->
<!--                                                                </v-slider>-->
                                                            </v-col>
                                                        </v-row>
                                                    </v-card>
                                                    <v-card tile flat v-if="(command.title === '이동')">
                                                        <v-row no-gutters>
                                                            <v-col cols="2">
                                                                <v-select
                                                                    @change="changeGotoType($event, d.name)"
                                                                    dense outlined hide-details
                                                                    :items="['고도먼저', '바로이동']"
                                                                    label="이동설정"
                                                                    v-model="gotoType[d.name]"
                                                                    class="pa-1"
                                                                ></v-select>
                                                            </v-col>
                                                            <v-col cols="2">
                                                                <v-select
                                                                    @change="changeYawBehavior($event, d.name)"
                                                                    dense outlined hide-details
                                                                    :items="['YAW고정', 'YAW회전']"
                                                                    label="YAW설정"
                                                                    v-model="yawBehavior[d.name]"
                                                                    class="pa-1"
                                                                ></v-select>
                                                            </v-col>
                                                            <v-col cols="2">
                                                                <v-text-field
                                                                    label="지형높이(m)"
                                                                    class="pa-1 text-right"
                                                                    outlined dense hide-details
                                                                    :value="parseFloat(position_selections_elevation[d.name]).toFixed(1)"
                                                                    readonly
                                                                ></v-text-field>
                                                            </v-col>
                                                            <v-col cols="2">
                                                                <v-text-field
                                                                    label="이동고도(m)"
                                                                    class="pa-1 text-right"
                                                                    outlined dense hide-details
                                                                    v-model="targetAlt[d.name]"
                                                                    type="number"
                                                                    :class="parseFloat(position_selections_elevation[d.name])>targetAlt[d.name] ? 'red' : ''"
                                                                ></v-text-field>
                                                            </v-col>
                                                            <v-col cols="2">
                                                                <v-text-field
                                                                    label="이동속도(m/s)"
                                                                    class="pa-1 text-right"
                                                                    outlined dense hide-details
                                                                    v-model="targetSpeed[d.name]"
                                                                    type="number"
                                                                ></v-text-field>
                                                            </v-col>
                                                            <v-col cols="2">
                                                                <v-text-field
                                                                    label="지점거리(m)"
                                                                    class="pa-1 text-right"
                                                                    outlined dense hide-details
                                                                    :value="isNaN(Math.ceil($store.state.distanceTarget[d.name]))?0:Math.ceil($store.state.distanceTarget[d.name])"
                                                                    type="number"
                                                                    readonly
                                                                ></v-text-field>
                                                            </v-col>
                                                        </v-row>
                                                    </v-card>
                                                    <v-card tile flat v-if="(command.title === '선회')">
                                                        <v-row no-gutters>
                                                            <v-col cols="4">
                                                                <v-select
                                                                    @change="changeCircleType($event, d.name)"
                                                                    dense outlined hide-details
                                                                    :items="['시계방향', '반시계방향']"
                                                                    label="선회방향"
                                                                    v-model="circleType[d.name]"
                                                                    class="pa-1"
                                                                ></v-select>
                                                            </v-col>
<!--                                                            <v-col cols="4">-->
<!--                                                                <v-select-->
<!--                                                                    dense outlined hide-details-->
<!--                                                                    :items="position_selections_items[d.name]" label="Center positions"-->
<!--                                                                    v-model="position_selections[d.name]"-->
<!--                                                                    @change="selectedPosition($event, d)"-->
<!--                                                                    class="px-1"-->
<!--                                                                ></v-select>-->
<!--                                                            </v-col>-->
                                                            <v-col cols="2">
                                                                <v-text-field
                                                                    label="지형높이(m)"
                                                                    class="pa-1 text-right"
                                                                    outlined dense hide-details
                                                                    :value="position_selections_elevation[d.name]"
                                                                    readonly
                                                                ></v-text-field>
                                                            </v-col>
                                                            <v-col cols="2">
                                                                <v-text-field
                                                                    label="선회고도(m)"
                                                                    class="pa-1 text-right"
                                                                    outlined dense hide-details
                                                                    v-model="targetAlt[d.name]"
                                                                    type="number"
                                                                    :class="parseFloat(position_selections_elevation[d.name])>targetAlt[d.name] ? 'red' : ''"
                                                                ></v-text-field>
                                                            </v-col>
                                                            <v-col cols="2">
                                                                <v-text-field
                                                                    label="반지름(m)"
                                                                    class="pa-1 text-right"
                                                                    outlined dense hide-details
                                                                    v-model="targetRadius[d.name]"
                                                                    type="number"
                                                                    min="10" max="255"
                                                                    hint="10 ~ 255"
                                                                    @input="drawRadius($event, d.name, position_selections_index[d.name])"
                                                                ></v-text-field>
                                                            </v-col>
                                                            <v-col cols="2">
                                                                <v-text-field
                                                                    label="선회속도(m/s)"
                                                                    class="pa-1 text-right"
                                                                    outlined dense hide-details
                                                                    v-model="targetTurningSpeed[d.name]"
                                                                    type="number"
                                                                ></v-text-field>
                                                            </v-col>
                                                        </v-row>
                                                    </v-card>
                                                    <v-card tile flat v-if="(command.title === '패턴')">
                                                        <v-row no-gutters>
                                                            <v-col cols="2">
                                                                <v-text-field
                                                                    label="Index"
                                                                    class="text-right pa-1"
                                                                    outlined dense hide-details
                                                                    v-model="targetSurveyMarkerIndex[d.name]"
                                                                    type="number"
                                                                    readonly
                                                                ></v-text-field>
                                                            </v-col>
                                                            <v-col cols="3">
                                                                <v-select
                                                                    @change="changeYawBehavior($event, d.name)"
                                                                    dense outlined hide-details
                                                                    :items="['YAW고정', 'YAW회전']"
                                                                    label="YAW설정"
                                                                    v-model="yawBehavior[d.name]"
                                                                    class="pa-1"
                                                                ></v-select>
                                                            </v-col>
<!--                                                            <v-col cols="2">-->
<!--                                                                <v-text-field-->
<!--                                                                    label="비행고도(m)"-->
<!--                                                                    class="text-right pa-1"-->
<!--                                                                    outlined dense hide-details-->
<!--                                                                    v-model="targetAlt[d.name]"-->
<!--                                                                    type="number"-->
<!--                                                                    hint="3 ~ 2000 m"-->
<!--                                                                ></v-text-field>-->
<!--                                                            </v-col>-->
<!--                                                            <v-col cols="2">-->
<!--                                                                <v-text-field-->
<!--                                                                    label="비행속도(m/s)"-->
<!--                                                                    class="text-right pa-1"-->
<!--                                                                    outlined dense hide-details-->
<!--                                                                    v-model="targetSpeed[d.name]"-->
<!--                                                                    type="number"-->
<!--                                                                    hint="1 ~ 30 m/s"-->
<!--                                                                ></v-text-field>-->
<!--                                                            </v-col>-->
                                                            <v-col cols="2">
                                                                <v-text-field
                                                                    label="지점대기(sec)"
                                                                    class="text-right pa-1"
                                                                    outlined dense hide-details
                                                                    v-model="targetStayTime[d.name]"
                                                                    type="number"
                                                                    min="0" max="60"
                                                                    hint="0 ~ 60초"
                                                                ></v-text-field>
                                                            </v-col>
                                                        </v-row>
                                                    </v-card>
                                                    <v-card tile flat v-if="(command.title === '속도')">
                                                        <v-row no-gutters>
                                                            <v-col cols="12">
                                                                <v-text-field
                                                                    v-model="targetSpeed[d.name]"
                                                                    dense outlined hide-details
                                                                    label="비행속도(m/s)"
                                                                    type="number"
                                                                    class="pa-1"
                                                                ></v-text-field>
                                                            </v-col>
                                                        </v-row>
<!--                                                        <v-slider-->
<!--                                                            v-model="targetSpeed[d.name]"-->
<!--                                                            class="align-center"-->
<!--                                                            :max="20"-->
<!--                                                            :min="1"-->
<!--                                                            hide-details :label="d.name+' 속도: '"-->
<!--                                                        >-->
<!--                                                            <template v-slot:append>-->
<!--                                                                <v-text-field-->
<!--                                                                    v-model="targetSpeed[d.name]"-->
<!--                                                                    class="mt-0 pt-0"-->
<!--                                                                    hide-details-->
<!--                                                                    label="m/s"-->
<!--                                                                    type="number"-->
<!--                                                                    style="width: 60px"-->
<!--                                                                ></v-text-field>-->
<!--                                                            </template>-->
<!--                                                        </v-slider>-->
                                                    </v-card>
                                                    <v-card tile flat v-if="(command.title === '관심')">
                                                        <v-row no-gutters>
                                                            <v-col cols="6">
                                                                <v-text-field
                                                                    label="지형높이(m)"
                                                                    class="pa-1 text-right"
                                                                    outlined dense hide-details
                                                                    :value="parseFloat(position_selections_elevation[d.name]).toFixed(1)"
                                                                    readonly
                                                                ></v-text-field>
                                                            </v-col>
                                                            <v-col cols="6">
                                                                <v-text-field
                                                                    label="지점거리(m)"
                                                                    class="pa-1 text-right"
                                                                    outlined dense hide-details
                                                                    :value="isNaN(Math.ceil($store.state.distanceTarget[d.name]))?0:Math.ceil($store.state.distanceTarget[d.name])"
                                                                    type="number"
                                                                    readonly
                                                                ></v-text-field>
                                                            </v-col>
                                                        </v-row>
                                                    </v-card>
                                                    <v-card tile flat v-if="(command.title === '귀환')">
                                                        <v-row no-gutters>
                                                            <v-col cols="12">
                                                                <v-text-field
                                                                    v-model="rtlSpeed[d.name]"
                                                                    dense outlined hide-details
                                                                    label="귀환속도(m/s)"
                                                                    type="number"
                                                                    class="pa-1"
                                                                ></v-text-field>
                                                            </v-col>
                                                        </v-row>
<!--                                                        <v-row no-gutters>-->
<!--                                                            <v-col cols="12">-->
<!--                                                                <v-subheader>-->
<!--                                                                    {{ d.name }} 귀환 속도-->
<!--                                                                </v-subheader>-->
<!--                                                            </v-col>-->
<!--                                                            <v-col cols="12">-->
<!--                                                                <v-slider-->
<!--                                                                    v-model="rtlSpeed[d.name]"-->
<!--                                                                    class="mx-2 my-3 align-center"-->
<!--                                                                    :max="20"-->
<!--                                                                    :min="5"-->
<!--                                                                    hide-details-->
<!--                                                                >-->
<!--                                                                    <template v-slot:append>-->
<!--                                                                        <v-text-field-->
<!--                                                                            v-model="rtlSpeed[d.name]"-->
<!--                                                                            class="mt-0 pt-0"-->
<!--                                                                            hide-details-->
<!--                                                                            type="number"-->
<!--                                                                            label="m/s"-->
<!--                                                                        ></v-text-field>-->
<!--                                                                    </template>-->
<!--                                                                </v-slider>-->
<!--                                                            </v-col>-->
<!--                                                        </v-row>-->
                                                    </v-card>
                                                    <v-card tile flat v-if="(command.title === '제어')">
                                                        <v-row no-gutters>
                                                            <v-col cols="12">
                                                                <v-subheader>{{ d.name }} 임무제어(PWM):</v-subheader>
                                                            </v-col>
                                                            <v-col cols="3">
                                                                <v-text-field
                                                                    label="CH9"
                                                                    class="mx-2 pt-0"
                                                                    outlined dense
                                                                    v-model="pwms.ch9[d.name]"
                                                                    type="number"
                                                                    min="1100" max="1900"
                                                                    hint="1100 ~ 1900"
                                                                ></v-text-field>
                                                            </v-col>
                                                            <v-col cols="3">
                                                                <v-text-field
                                                                    label="CH10"
                                                                    class="mx-2 pt-0"
                                                                    outlined dense
                                                                    v-model="pwms.ch10[d.name]"
                                                                    type="number"
                                                                    min="1100" max="1900"
                                                                    hint="1100 ~ 1900"
                                                                ></v-text-field>
                                                            </v-col>
                                                            <v-col cols="3">
                                                                <v-text-field
                                                                    label="CH11"
                                                                    class="mx-2 pt-0"
                                                                    outlined dense
                                                                    v-model="pwms.ch11[d.name]"
                                                                    type="number"
                                                                    min="1100" max="1900"
                                                                    hint="1100 ~ 1900"
                                                                ></v-text-field>
                                                            </v-col>
                                                            <v-col cols="3">
                                                                <v-text-field
                                                                    label="CH12"
                                                                    class="mx-2 pt-0"
                                                                    outlined dense
                                                                    v-model="pwms.ch12[d.name]"
                                                                    type="number"
                                                                    min="1100" max="1900"
                                                                    hint="1100 ~ 1900"
                                                                ></v-text-field>
                                                            </v-col>
                                                        </v-row>
                                                    </v-card>
                                                    <v-card tile flat v-if="(command.title === '자동')">
                                                        <v-row no-gutters>
                                                            <v-col cols="12">
                                                                <v-subheader>{{ d.name }} 자동:
                                                                    <v-spacer></v-spacer>
                                                                    <v-switch
                                                                        v-show="d.curArmStatus==='DISARMED'"
                                                                        v-model="takeoffInAuto"
                                                                        :label="`takeoffInAuto: ${takeoffInAuto.toString()}`"
                                                                    ></v-switch>
                                                                </v-subheader>
                                                            </v-col>
                                                            <v-col cols="3">
                                                                <v-select
                                                                    @change="changeYawBehavior($event, d.name)"
                                                                    dense outlined hide-details
                                                                    :items="['YAW고정', 'YAW회전']"
                                                                    label="YAW설정"
                                                                    v-model="yawBehavior[d.name]"
                                                                    class="pa-1"
                                                                ></v-select>
                                                            </v-col>
                                                            <v-col cols="2">
                                                                <v-select
                                                                    dense outlined :items="Object.keys(position_selections_items[d.name])"
                                                                    label="Start Index" v-model="autoStartIndex[d.name]"
                                                                    class="pa-1"
                                                                    hide-details
                                                                ></v-select>
                                                            </v-col>
                                                            <v-col cols="2">
                                                                <v-select
                                                                    dense outlined :items="Object.keys(position_selections_items[d.name])"
                                                                    label="End Index" v-model="autoEndIndex[d.name]"
                                                                    hide-details
                                                                    class="pa-1"
                                                                ></v-select>
                                                            </v-col>
                                                            <v-col cols="2">
                                                                <v-text-field
                                                                    label="Speed"
                                                                    class="pa-1"
                                                                    outlined dense hide-details
                                                                    v-model="autoSpeed[d.name]"
                                                                    type="number"
                                                                    min="1"
                                                                    max="15"
                                                                ></v-text-field>
                                                            </v-col>
                                                            <v-col cols="2">
                                                                <v-text-field
                                                                    label="Delay"
                                                                    class="pa-1"
                                                                    outlined dense hide-details
                                                                    v-model="autoDelay[d.name]"
                                                                    type="number"
                                                                ></v-text-field>
                                                            </v-col>
                                                        </v-row>
                                                    </v-card>
                                                    <v-card tile flat v-if="(command.title === '설정')">
                                                        <v-row no-gutters>
                                                            <v-col cols="3">
                                                                <v-select
                                                                    dense outlined hide-details
                                                                    :items="items_wp_yaw_behavior"
                                                                    label="YAW_BEHAVIOR"
                                                                    v-model="$store.state.params.wpYawBehavior[d.name]"
                                                                    class="pa-1"
                                                                ></v-select>
                                                            </v-col>
                                                            <v-col cols="3">
                                                                <v-text-field
                                                                    label="SLEW_YAW (meterdgrees/s), 5-180, 1"
                                                                    class="pa-1"
                                                                    outlined dense hide-details
                                                                    v-model="$store.state.params.atcSlewYaw[d.name]"
                                                                    placeholder="5"
                                                                    type="number"
                                                                    min="5"
                                                                    max="180"
                                                                    hint="Range:5~180, Increment:1"
                                                                ></v-text-field>
                                                            </v-col>
                                                            <v-col cols="2">
                                                                <v-text-field
                                                                    label="SPEED_UP (m/s), 0.1-10.0, 0.5"
                                                                    class="pa-1"
                                                                    outlined dense hide-details
                                                                    v-model="$store.state.params.wpnavSpeedUp[d.name]"
                                                                    placeholder="2.5"
                                                                    type="number"
                                                                    min="0.1"
                                                                    max="10.0"
                                                                    hint="Range:0.1~10.0, Increment:0.5"
                                                                ></v-text-field>
                                                            </v-col>
                                                            <v-col cols="2">
                                                                <v-text-field
                                                                    label="SPEED_DN (m/s), 0.1-5.0, 0.1"
                                                                    class="pa-1"
                                                                    outlined dense hide-details
                                                                    v-model="$store.state.params.wpnavSpeedDn[d.name]"
                                                                    placeholder="1.5"
                                                                    type="number"
                                                                    min="0.1"
                                                                    max="5.0"
                                                                    hint="Range:0.1~5.0, Increment:0.1"
                                                                ></v-text-field>
                                                            </v-col>
                                                            <v-col cols="2">
                                                                <v-text-field
                                                                    label="RTL_ALT (m), 2.0-80.0, 0.1"
                                                                    class="pa-1"
                                                                    outlined dense hide-details
                                                                    v-model="$store.state.params.rtlAlt[d.name]"
                                                                    placeholder="30.0"
                                                                    type="number"
                                                                    min="2.0"
                                                                    max="80.0"
                                                                    hint="The minimum alt above home"
                                                                ></v-text-field>
                                                            </v-col>
                                                        </v-row>
                                                    </v-card>
                                                    <v-card tile flat v-if="(command.title === '임무')">
                                                        <v-row no-gutters>
                                                            <v-col cols="12">
                                                                <v-subheader>{{ d.name }} 임무 장치 제어:</v-subheader>
                                                            </v-col>
                                                            <v-col cols="2">
                                                                <v-row no-gutters align="center" justify="center">
                                                                    <v-col cols="6" class="text-center">
                                                                        <v-icon small class="mb-1">mdi-arrow-left-right</v-icon>
                                                                        <v-select
                                                                            dense outlined hide-details
                                                                            :items="channels"
                                                                            label="CH01"
                                                                            v-model="target_mission_num.targetCh1[d.name]"
                                                                            class="ml-1"
                                                                        ></v-select>
                                                                    </v-col>
                                                                    <v-col cols="6" class="text-center">
                                                                        <v-icon small class="mb-1">mdi-arrow-up-down</v-icon>
                                                                        <v-select
                                                                            dense outlined hide-details
                                                                            :items="channels"
                                                                            label="CH02"
                                                                            v-model="target_mission_num.targetCh2[d.name]"
                                                                            class="ml-1"
                                                                            prepend-icon=""
                                                                        ></v-select>
                                                                    </v-col>
                                                                </v-row>
                                                                <v-row no-gutters align="center" justify="center">
                                                                    <v-col cols="12">
                                                                        <v-card flat tile class="text-center">
                                                                            <div>
                                                                                <JoyStick v-bind:joystick_size="128" @change="handleLeftChange(d.name, 'left', $event);" />
                                                                                <div style="display: inline-block; margin: 8px">
                                                                                    <div>
                                                                                        <span>X {{ leftStick.x[d.name] }} </span>
                                                                                        <span>Y {{ leftStick.y[d.name] }} </span>
                                                                                    </div>
                                                                                    <div>
                                                                                        <span>Angle {{ leftStick.angle[d.name] }} </span>
                                                                                        <span>Speed {{ leftStick.speed[d.name] }} </span>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </v-card>
                                                                    </v-col>
                                                                </v-row>
                                                            </v-col>
                                                            <v-col cols="2">
                                                                <v-row no-gutters align="center" justify="center">
                                                                    <v-col cols="6" class="text-center">
                                                                        <v-icon small class="mb-1">mdi-arrow-left-right</v-icon>
                                                                        <v-select
                                                                            dense outlined hide-details
                                                                            :items="channels"
                                                                            label="CH03"
                                                                            v-model="target_mission_num.targetCh3[d.name]"
                                                                            class="ml-1"
                                                                        ></v-select>
                                                                    </v-col>
                                                                    <v-col cols="6" class="text-center">
                                                                        <v-icon small class="mb-1">mdi-arrow-up-down</v-icon>
                                                                        <v-select
                                                                            dense outlined hide-details
                                                                            :items="channels"
                                                                            label="CH04"
                                                                            v-model="target_mission_num.targetCh4[d.name]"
                                                                            class="ml-1"
                                                                        ></v-select>
                                                                    </v-col>
                                                                </v-row>
                                                                <v-row no-gutters align="center" justify="center">
                                                                    <v-col cols="12">
                                                                        <v-card flat tile class="text-center">
                                                                            <div>
                                                                                <JoyStick v-bind:joystick_size="128" @change="handleRightChange(d.name, 'right', $event);" />
                                                                                <div style="display: inline-block; margin: 8px">
                                                                                    <div>
                                                                                        <span>X {{ rightStick.x[d.name] }} </span>
                                                                                        <span>Y {{ rightStick.y[d.name] }} </span>
                                                                                    </div>
                                                                                    <div>
                                                                                        <span>Angle {{ rightStick.angle[d.name] }} </span>
                                                                                        <span>Speed {{ rightStick.speed[d.name] }} </span>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </v-card>
                                                                    </v-col>
                                                                </v-row>
                                                            </v-col>
                                                            <v-col cols="8">
                                                                <v-card flat tile outlined>
                                                                    <v-row no-gutters align="center" justify="center">
                                                                        <v-col class="my-2" cols="6">
                                                                            <div v-for="(num) in channels" :key="num">
                                                                                <div v-if="5 <= num && num <= 8">
                                                                                    <v-row no-gutters align="center" justify="center" class="text-center">
                                                                                        <v-col cols="4">
                                                                                            <v-select
                                                                                                dense outlined hide-details
                                                                                                :items="channels"
                                                                                                :label="'CH'+num"
                                                                                                v-model="target_mission_num[`targetCh${num}`][d.name]"
                                                                                                class="ml-1 mx-1 mb-2"
                                                                                            ></v-select>
                                                                                        </v-col>
                                                                                        <v-col cols="8">
                                                                                            <v-btn-toggle
                                                                                                v-model="mission_value[`ch${num}`][d.name]"
                                                                                                mandatory
                                                                                                class="text-center align-center mx-0"
                                                                                            >
                                                                                                <v-btn small>
                                                                                                    <v-icon small>mdi-format-align-left</v-icon>
                                                                                                </v-btn>
                                                                                                <v-btn small>
                                                                                                    <v-icon small>mdi-format-align-center</v-icon>
                                                                                                </v-btn>
                                                                                                <v-btn small>
                                                                                                    <v-icon small>mdi-format-align-right</v-icon>
                                                                                                </v-btn>
                                                                                            </v-btn-toggle>

                                                                                            <v-btn small color="primary" class="mx-1 mb-1" @click="handlePwmClick(d.name, num, $event);"><v-icon>mdi-send</v-icon></v-btn>
                                                                                        </v-col>
                                                                                    </v-row>
                                                                                </div>
                                                                            </div>
                                                                        </v-col>
                                                                        <v-col class="my-2" cols="6">
                                                                            <div v-for="(num) in channels" :key="num">
                                                                                <div v-if="9 <= num && num <= 12">
                                                                                    <v-row no-gutters align="center" justify="center" class="text-center">
                                                                                        <v-col cols="4">
                                                                                            <v-select
                                                                                                dense outlined hide-details
                                                                                                :items="channels"
                                                                                                :label="'CH'+num" v-model="target_mission_num[`targetCh${num}`][d.name]"
                                                                                                class="ml-1 mx-1 mb-2"
                                                                                            ></v-select>
                                                                                        </v-col>
                                                                                        <v-col cols="8">
                                                                                            <v-btn-toggle
                                                                                                v-model="mission_value[`ch${num}`][d.name]"
                                                                                                mandatory
                                                                                                class="text-center align-center mx-0"
                                                                                            >
                                                                                                <v-btn small>
                                                                                                    <v-icon small>mdi-format-align-left</v-icon>
                                                                                                </v-btn>
                                                                                                <v-btn small>
                                                                                                    <v-icon small>mdi-format-align-center</v-icon>
                                                                                                </v-btn>
                                                                                                <v-btn small>
                                                                                                    <v-icon small>mdi-format-align-right</v-icon>
                                                                                                </v-btn>
                                                                                            </v-btn-toggle>

                                                                                            <v-btn small color="lime" class="mx-1 mb-1" @click="handlePwmClick(d.name, num, $event);"><v-icon>mdi-send</v-icon></v-btn>
                                                                                        </v-col>
                                                                                    </v-row>
                                                                                </div>
                                                                            </div>
                                                                        </v-col>
                                                                        <v-col class="my-2" cols="12">
                                                                            <div v-for="(num) in channels" :key="num">
                                                                                <div v-if="13 <= num && num <= 16">
                                                                                    <v-row no-gutters align="center" justify="center">
                                                                                        <v-col cols="3">
                                                                                            <v-select
                                                                                                dense outlined hide-details
                                                                                                :items="channels"
                                                                                                :label="'CH'+num" v-model="target_mission_num[`targetCh${num}`][d.name]"
                                                                                                class="mx-1"
                                                                                            ></v-select>
                                                                                        </v-col>
                                                                                        <v-col cols="7">
                                                                                            <v-slider
                                                                                                v-model="mission_value[`ch${num}`][d.name]"
                                                                                                class="mx-2 my-3 align-center"
                                                                                                :min="mission_ch_min"
                                                                                                :max="mission_ch_max"
                                                                                                hide-details
                                                                                                thumb-label="always"
                                                                                                step="1"
                                                                                                color="indigo"
                                                                                                track-color="orange"
                                                                                                @input ="handlePwmSlide(d.name, num, $event)"
                                                                                            >
                                                                                            </v-slider>
                                                                                        </v-col>
                                                                                        <v-col cols="2">
                                                                                            <v-text-field
                                                                                                v-model="mission_value[`ch${num}`][d.name]"
                                                                                                class="mt-0 pt-0"
                                                                                                hide-details
                                                                                                single-line
                                                                                                type="number"
                                                                                                style="width: 65px"
                                                                                            ></v-text-field>
                                                                                        </v-col>
                                                                                    </v-row>
                                                                                </div>
                                                                            </div>
                                                                        </v-col>
                                                                    </v-row>
                                                                </v-card>
                                                            </v-col>
                                                        </v-row>
                                                    </v-card>
                                                </v-col>
                                            </v-row>
                                        </div>
                                    </div>
                                </v-card>
                            </v-col>
                            <v-col cols="2">
                                <v-card class="pa-1 align-self-center text-center" outlined tile>
                                    <v-btn
                                        v-if="command.title !== '투하'" color="blue" @click="curTab = command.title; mode_sheet = !mode_sheet;"
                                        :disabled="(command.title === '임무')"
                                    >
                                        <span v-if="command.title === '모드'">모드확인</span>
                                        <span v-else-if="command.title === '시동'">시동확인</span>
                                        <span v-else-if="command.title === '이륙'">이륙확인</span>
                                        <span v-else-if="command.title === '고도'">고도확인</span>
                                        <span v-else-if="command.title === '이동'">이동확인</span>
                                        <span v-else-if="command.title === '패턴'">패턴확인</span>
                                        <span v-else-if="command.title === '선회'">선회확인</span>
                                        <span v-else-if="command.title === '속도'">속도확인</span>
                                        <span v-else-if="command.title === '관심'">관심확인</span>
                                        <span v-else-if="command.title === '정지'">정지확인</span>
                                        <span v-else-if="command.title === '착륙'">착륙확인</span>
                                        <span v-else-if="command.title === '귀환'">귀환확인</span>
                                        <span v-else-if="command.title === '제어'">제어확인</span>
                                        <span v-else-if="command.title === '자동'">자동확인</span>
                                        <span v-else-if="command.title === '종료'">종료확인</span>
                                        <span v-else-if="command.title === '설정'">설정확인</span>
                                    </v-btn>
                                    <v-btn
                                        v-else-if="command.title === '투하'" color="blue"
                                        @click="setDropCommand()"
                                    >
                                        <span>투하확인</span>
                                    </v-btn>
                                </v-card>
                            </v-col>
<!--                            <v-col cols="1">-->
<!--                                <v-card class="pa-2" outlined tile>-->
<!--                                    <v-progress-linear-->
<!--                                            color="red lighten-2"-->
<!--                                            buffer-value="0"-->
<!--                                            stream-->
<!--                                    ></v-progress-linear>-->
<!--                                </v-card>-->
<!--                            </v-col>-->
                        </v-row>
                    </v-card>
                </v-card>
            </v-tab-item>
        </v-tabs>
        <v-bottom-sheet v-model="mode_sheet" persistent>
            <v-sheet class="text-center" height="200px">
                <v-btn class="mt-6 mx-6 px-6" text color="error" @click="sendCommand" outlined :loading="loading">
                    실 행
                </v-btn>
                <v-btn
                        class="mt-6 mx-6 px-6"
                        text
                        color="error"
                        @click="mode_sheet = !mode_sheet"
                        outlined
                >
                    취 소
                </v-btn>
                <div class="my-3" >
                    <div v-for="(drone, i) in $store.state.drone_infos" :key="i">
                        <div v-if="drone.selected && drone.targeted">
                            <span  class="mr-2">
                                [ {{drone.name}} ]
                            </span>
                        </div>
                    </div>
                    <span v-if="curTab === '모드'">
                        비행체에 <span class="ml-2 mr-2" style="font-size: 20px">모드 변경</span> 명령 전송.
                    </span>
                    <span v-else-if="curTab === '시동'">
                        비행체에 <span class="ml-2 mr-2" style="font-size: 20px">시동</span> 명령 전송.
                    </span>
                    <div v-else-if="curTab === '이륙'">
                        <div v-for="(drone, i) in $store.state.drone_infos" :key="i">
                            <span v-if="drone.selected && drone.targeted">
                                {{i}} 비행체에 <span class="ml-2 mr-2" style="font-size: 20px">{{  targetTakeoffAlt[i] }}</span>미터로 <span class="ml-2 mr-2" style="font-size: 20px">이륙</span> 명령 전송.
                            </span>
                        </div>
                    </div>
                    <div v-else-if="curTab === '고도'">
                         <div v-for="(drone, i) in $store.state.drone_infos" :key="i">
                             <span v-if="drone.selected && drone.targeted">
                                 {{i}} 비행체에 <span class="ml-2 mr-2" style="font-size: 20px">{{ targetAlt[i] }}</span>미터로 <span class="ml-2 mr-2" style="font-size: 20px">고도 변경</span> 명령 전송.
                             </span>
                         </div>
                    </div>
                    <span v-else-if="curTab === '이동'">
                        비행체에 선택한 지점으로 <span class="ml-2 mr-2" style="font-size: 20px">이동</span> 명령 전송.
                    </span>
                    <span v-else-if="curTab === '선회'">
                        비행체에 선택한 지점으로 <span class="ml-2 mr-2" style="font-size: 20px">선회</span> 명령 전송.
                    </span>
                    <span v-else-if="curTab === '속도'">
                        비행체에 설정한 속도로 <span class="ml-2 mr-2" style="font-size: 20px">속도 변경</span> 명령 전송.
                    </span>
                    <span v-else-if="curTab === '관심'">
                        비행체에 지정된 위치로 <span class="ml-2 mr-2" style="font-size: 20px">관심 설정</span> 명령 전송.
                    </span>
                    <span v-else-if="curTab === '정지'">
                        비행체를 현재 위치에 <span class="ml-2 mr-2" style="font-size: 20px">정지</span> 명령 전송.
                    </span>
                    <span v-else-if="curTab === '착륙'">
                        비행체에 <span class="ml-2 mr-2" style="font-size: 20px">착륙</span> 명령 전송.
                    </span>
                    <span v-else-if="curTab === '귀환'">
                        비행체에 <span class="ml-2 mr-2" style="font-size: 20px">귀환</span> 명령 전송.
                    </span>
                    <span v-else-if="curTab === '제어'">
                        비행체에 각 채널로 <span class="ml-2 mr-2" style="font-size: 20px">PWM 제어</span> 명령 전송.
                    </span>
                    <span v-else-if="curTab === '자동'">
                        비행체에 비행경로 다운로드 후 <span class="ml-2 mr-2" style="font-size: 20px">자동 비행</span> 명령 전송.
                    </span>
                    <span v-else-if="curTab === '종료'">
                        비행체에 <span class="ml-2 mr-2" style="font-size: 20px">시동 끄기</span> 명령 전송.
                    </span>
                    <span v-else-if="curTab === '설정'">
                        비행체에 <span class="ml-2 mr-2" style="font-size: 20px">파라미터 설정</span> 명령 전송.
                    </span>
                </div>
            </v-sheet>
        </v-bottom-sheet>
    </v-sheet>
</template>

<script>
import EventBus from '../EventBus';
import JoyStick from './JoyStick';
import axios from "axios";

export default {
    name: "DroneCommand",

    components: {
        JoyStick
    },

    data() {
        return {
            drawRadiusUpdateTimer: null,

            point: '8,8',
            dropped_point: [],

            takeoffInAuto: true,
            mission_ch_min: 223,
            mission_ch_max: 1823,
            channels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],

            target_mission_num: {
                targetCh1: {},
                targetCh2: {},
                targetCh3: {},
                targetCh4: {},
                targetCh5: {},
                targetCh6: {},
                targetCh7: {},
                targetCh8: {},
                targetCh9: {},
                targetCh10: {},
                targetCh11: {},
                targetCh12: {},
                targetCh13: {},
                targetCh14: {},
                targetCh15: {},
                targetCh16: {},
            },
            mission_value: {
                ch1: {},
                ch2: {},
                ch3: {},
                ch4: {},
                ch5: {},
                ch6: {},
                ch7: {},
                ch8: {},
                ch9: {},
                ch10: {},
                ch11: {},
                ch12: {},
                ch13: {},
                ch14: {},
                ch15: {},
                ch16: {},
            },
            leftStick: {
                x: {},
                y: {},
                speed: {},
                angle: {}
            },
            rightStick: {
                x: {},
                y: {},
                speed: {},
                angle: {}
            },

            items_wp_yaw_behavior: [
                '0 = Never change Yaw.',
                '1 = Face Next Waypoint including facing home during RTL.',
                '2 = Face Next Waypoint except for RTL (i.e. during RTL vehicle will remain pointed at its last heading)'
            ],

            curTab: 'virtual',
            selection: [],
            //items: ['Foo', 'Bar', 'Fizz', 'Buzz'],
            prepared: false,
            mode_sheet: false,
            loading: false,

            context_top: 1,
            context_left: 1,
            context_max_height: 640,

            target_alt: 20,

            position_selections_items: {},
            position_selections: {},
            position_selections_index: {},
            position_selections_elevation: {},

            targetModeSelection: {},
            takeoffDelay: {},
            targetTakeoffAlt: {},
            targetAlt: {},
            targetSpeed: {},
            targetStayTime: {},
            targetSurveyMarkerIndex: {},
            targetTurningSpeed: {},
            targetRadius: {},
            autoStartIndex: {},
            autoEndIndex: {},
            autoSpeed: {},
            autoDelay: {},

            gotoType: {},
            yawBehavior: {},
            circleType: {},

            rtlSpeed: {},

            // params: {
            //     wpYawBehavior: {},
            //     atcSlewYaw: {},
            //     wpnavSpeedUp: {},
            //     wpnavSpeedDn: {},
            //     rtlAlt: {}
            // },

            pwms: {
                ch9: {},
                ch10: {},
                ch11: {},
                ch12: {}
            }
        }
    },
    watch: {
        ['$store.state.tempMarkers']: {
            deep: true,
            handler: function (newData) {
                for (let dName in newData) {
                    if (Object.prototype.hasOwnProperty.call(newData, dName)) {
                        this.position_selections_items[dName] = [];
                        for (let pIndex in newData[dName]) {
                            if (Object.prototype.hasOwnProperty.call(newData[dName], pIndex)) {
                                let strPos = newData[dName][pIndex].lat + ':' +
                                    newData[dName][pIndex].lng + ':' +
                                    newData[dName][pIndex].alt + ':' +
                                    newData[dName][pIndex].speed + ':' +
                                    newData[dName][pIndex].radius + ':' +
                                    newData[dName][pIndex].turningSpeed + ':' +
                                    newData[dName][pIndex].targetMavCmd + ':' +
                                    newData[dName][pIndex].targetStayTime + ':' +
                                    newData[dName][pIndex].elevation;
                                this.position_selections_items[dName].push(strPos);
                            }
                        }
                    }
                }
                this.$forceUpdate();
            }
        },
        // selectedDrone: {
        //     deep: true,
        //     handler: function (newVal) {
        //         console.log('DroneCommand-watch-selectedDrone', newVal);
        //
        //         this.takeoffDelay = null;
        //         this.takeoffDelay = {};
        //         this.targetTakeoffAlt = null;
        //         this.targetTakeoffAlt = {};
        //         this.targetAlt = null;
        //         this.targetAlt = {};
        //         this.targetSpeed = null;
        //         this.targetSpeed = {};
        //         this.autoStartIndex = null;
        //         this.autoStartIndex = {};
        //         this.autoEndIndex = null;
        //         this.autoEndIndex = {};
        //         this.autoSpeed = null;
        //         this.autoSpeed = {};
        //         this.autoDelay = null;
        //         this.autoDelay = {};
        //         for(let name in this.$store.state.drone_infos) {
        //             if(Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos, name)) {
        //                 if(this.$store.state.drone_infos[name].selected && this.$store.state.drone_infos[name].targeted) {
        //                     this.takeoffDelay[name] = this.$store.state.drone_infos[name].takeoffDelay;
        //                     this.targetTakeoffAlt[name] = this.$store.state.drone_infos[name].targetTakeoffAlt;
        //                     this.targetAlt[name] = this.$store.state.drone_infos[name].targetAlt;
        //                     this.targetSpeed[name] = this.$store.state.drone_infos[name].targetSpeed;
        //                     this.autoStartIndex[name] = this.$store.state.drone_infos[name].autoStartIndex;
        //                     this.autoEndIndex[name] = this.$store.state.drone_infos[name].autoEndIndex;
        //                     this.autoSpeed[name] = this.$store.state.drone_infos[name].autoSpeed;
        //                     this.autoDelay[name] = this.$store.state.drone_infos[name].autoDelay;
        //                 }
        //             }
        //         }
        //
        //         // console.log('DroneCommand-watch-takeoffDelay - ', this.takeoffDelay)
        //         // console.log('DroneCommand-watch-targetTakeoffAlt - ', this.targetTakeoffAlt)
        //         // console.log('DroneCommand-watch-targetAlt - ', this.targetAlt)
        //         // console.log('DroneCommand-watch-targetSpeed - ', this.targetSpeed)
        //
        //         for(let name in newVal) {
        //             if (Object.prototype.hasOwnProperty.call(newVal, name)) {
        //                 if(newVal[name]) {
        //                     this.prepared = true;
        //                     return;
        //                 }
        //             }
        //         }
        //
        //         this.prepared = false;
        //     }
        // },

        command_tab_left_x: function (newVal) {
            this.context_left = newVal;
        },

        command_tab_max_height: function (newVal) {
            console.log('DroneCommand-context_max_height', newVal)
            this.context_max_height = newVal;
        }
    },
    computed: {
        color() {
            if (this.target_alt < 25) return 'indigo'
            if (this.target_alt < 50) return 'teal'
            if (this.target_alt < 75) return 'green'
            if (this.target_alt < 100) return 'orange'
            return 'red'
        },

        // selectedDrone() {
        //     return (this.$store.state.selectedDrone);
        // },

        command_tab_left_x() {
            return (this.$store.state.command_tab_left_x);
        }
    },
    created() {
        this.context_left = this.$store.state.command_tab_left_x;

        for (let dName in this.$store.state.drone_infos) {
            if (Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos, dName)) {
                if (this.$store.state.drone_infos[dName].selected) {
                    this.targetSurveyMarkerIndex[dName] = -1;
                    for (let pIndex in this.$store.state.surveyMarkers[dName]) {
                        if (Object.prototype.hasOwnProperty.call(this.$store.state.surveyMarkers[dName], pIndex)) {
                            if (this.$store.state.surveyMarkers[dName][pIndex].targeted) {
                                this.targetSurveyMarkerIndex[dName] = pIndex;
                            }
                        }
                    }
                }
            }
        }


        EventBus.$on('gcs-map-ready', () => {
            setTimeout(() => {
                console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%DroneCommand', 'gcs-map-ready', this.$store.state.tempMarkers);
                for (let dName in this.$store.state.tempMarkers) {
                    if (Object.prototype.hasOwnProperty.call(this.$store.state.tempMarkers, dName)) {
                        this.position_selections_items[dName] = [];
                        for (let pIndex in this.$store.state.tempMarkers[dName]) {
                            if (Object.prototype.hasOwnProperty.call(this.$store.state.tempMarkers[dName], pIndex)) {
                                let strPos = this.$store.state.tempMarkers[dName][pIndex].lat + ':' +
                                    this.$store.state.tempMarkers[dName][pIndex].lng + ':' +
                                    this.$store.state.tempMarkers[dName][pIndex].alt + ':' +
                                    this.$store.state.tempMarkers[dName][pIndex].speed + ':' +
                                    this.$store.state.tempMarkers[dName][pIndex].radius + ':' +
                                    this.$store.state.tempMarkers[dName][pIndex].turningSpeed + ':' +
                                    this.$store.state.tempMarkers[dName][pIndex].targetMavCmd + ':' +
                                    this.$store.state.tempMarkers[dName][pIndex].targetStayTime + ':' +
                                    this.$store.state.tempMarkers[dName][pIndex].elevation;
                                this.position_selections_items[dName].push(strPos);
                            }
                        }
                    }
                }

                console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%DroneCommand', 'gcs-map-ready', this.position_selections_items);
            }, 2000);
        });

        EventBus.$on('do-targetDrone', () => {
            console.log('DroneCommand-do-targetDrone');

            this.prepared = false;

            this.tagetModeSelection = {};
            this.takeoffDelay = {};
            this.targetTakeoffAlt = {};
            this.targetAlt = {};
            this.targetSpeed = {};
            this.targetStayTime = {};
            this.targetTurningSpeed = {};
            this.targetRadius = {};
            this.autoStartIndex = {};
            this.autoEndIndex = {};
            this.autoSpeed = {};
            this.autoDelay = {};
            this.gotoType = {};
            this.yawBehavior = {};
            this.circleType = {};
            for (let name in this.$store.state.drone_infos) {
                if (Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos, name)) {
                    if (this.$store.state.drone_infos[name].selected && this.$store.state.drone_infos[name].targeted) {
                        this.tagetModeSelection[name] = this.$store.state.drone_infos[name].tagetModeSelection;
                        this.takeoffDelay[name] = this.$store.state.drone_infos[name].takeoffDelay;
                        this.targetTakeoffAlt[name] = this.$store.state.drone_infos[name].targetTakeoffAlt;
                        this.targetAlt[name] = this.$store.state.drone_infos[name].targetAlt;
                        this.targetSpeed[name] = this.$store.state.drone_infos[name].targetSpeed;
                        if(!Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos[name], 'targetStayTime')) {
                            this.$store.state.drone_infos[name].targetStayTime = 1;
                        }
                        if(!Object.prototype.hasOwnProperty.call(this.rtlSpeed, name)) {
                            this.rtlSpeed[name] = 5;
                        }
                        if(!Object.prototype.hasOwnProperty.call(this.takeoffDelay, name)) {
                            this.takeoffDelay[name] = 6;
                        }
                        this.targetStayTime[name] = this.$store.state.drone_infos[name].targetStayTime;
                        this.targetTurningSpeed[name] = this.$store.state.drone_infos[name].targetTurningSpeed;
                        this.targetRadius[name] = this.$store.state.drone_infos[name].targetRadius;
                        this.autoStartIndex[name] = this.$store.state.drone_infos[name].autoStartIndex;
                        this.autoEndIndex[name] = this.$store.state.drone_infos[name].autoEndIndex;
                        this.autoSpeed[name] = this.$store.state.drone_infos[name].autoSpeed;
                        this.autoDelay[name] = this.$store.state.drone_infos[name].autoDelay;
                        // if(!Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos[name], 'gotoType')) {
                        //     this.$store.state.drone_infos[name].gotoType = '바로이동';
                        // }
                        this.gotoType[name] = this.$store.state.drone_infos[name].gotoType;
                        this.yawBehavior[name] = 'YAW고정';
                        this.circleType[name] = (this.$store.state.drone_infos[name].circleType === 'cw')?'시계방향':'반시계방향';

                        this.prepared = true;

                        if (this.$cookies.isKey('target_mission_num')) {
                            this.target_mission_num = this.$cookies.get('target_mission_num');
                            this.mission_value = this.$cookies.get('mission_value');
                        }
                        else {
                            for (let i = 0; i < this.channels.length; i++) {
                                let num = this.channels[i];
                                this.mission_value[`ch${num}`][name] = (this.mission_ch_max + this.mission_ch_min) / 2;
                                this.target_mission_num[`targetCh${num}`][name] = num;
                            }

                            this.$cookies.set('target_mission_num', this.target_mission_num);
                            this.$cookies.set('mission_value', this.mission_value);
                        }
                    }
                }
            }
        });


        EventBus.$on('do-selected-position', (payload) => {
            console.log('do-selected-position', payload);

            if(payload.value) {
                let strPos = this.$store.state.tempMarkers[payload.pName][payload.pIndex].lat + ':' +
                    this.$store.state.tempMarkers[payload.pName][payload.pIndex].lng + ':' +
                    this.$store.state.tempMarkers[payload.pName][payload.pIndex].alt + ':' +
                    this.$store.state.tempMarkers[payload.pName][payload.pIndex].speed + ':' +
                    this.$store.state.tempMarkers[payload.pName][payload.pIndex].radius + ':' +
                    this.$store.state.tempMarkers[payload.pName][payload.pIndex].turningSpeed + ':' +
                    this.$store.state.tempMarkers[payload.pName][payload.pIndex].targetMavCmd + ':' +
                    this.$store.state.tempMarkers[payload.pName][payload.pIndex].targetStayTime + ':' +
                    this.$store.state.tempMarkers[payload.pName][payload.pIndex].elevation;

                this.position_selections_index[payload.pName] = payload.pIndex;
                this.position_selections[payload.pName] = strPos;
                this.position_selections_elevation[payload.pName] = parseFloat(this.$store.state.tempMarkers[payload.pName][payload.pIndex].elevation).toFixed(1);
            }
            else {
                this.position_selections_index[payload.pName] = 0;
                this.position_selections[payload.pName] = '';
                this.position_selections_elevation[payload.pName]= 0;
            }

            this.$forceUpdate();
        });

        EventBus.$on('update-goto-positions', (payload) => {
            console.log('update-goto-positions', payload);

            this.position_selections[payload.pName] = this.$store.state.tempMarkers[payload.pName][payload.pIndex].lat + ':' +
                this.$store.state.tempMarkers[payload.pName][payload.pIndex].lng + ':' +
                this.$store.state.tempMarkers[payload.pName][payload.pIndex].alt + ':' +
                this.$store.state.tempMarkers[payload.pName][payload.pIndex].speed + ':' +
                this.$store.state.tempMarkers[payload.pName][payload.pIndex].radius + ':' +
                this.$store.state.tempMarkers[payload.pName][payload.pIndex].turningSpeed + ':' +
                this.$store.state.tempMarkers[payload.pName][payload.pIndex].targetMavCmd + ':' +
                this.$store.state.tempMarkers[payload.pName][payload.pIndex].targetStayTime + ':' +
                this.$store.state.tempMarkers[payload.pName][payload.pIndex].elevation;

            this.$forceUpdate();
        });

        EventBus.$on('do-target-survey-marker', (payload) => {
            console.log('do-selected-position', payload);

            if(payload.targeted) {
                this.targetSurveyMarkerIndex[payload.dName] = payload.pIndex;
            }
            else {
                this.targetSurveyMarkerIndex[payload.dName] = -1;
            }

            this.$forceUpdate();
        });

        // eslint-disable-next-line no-unused-vars
        // EventBus.$on('selected-drone', (payload) => {
        //
        //     // console.log(this.$store.state.selectedDrone);
        //     //
        //     // this.selectedDrone = this.$store.state.selectedDrone;
        //     //
        //     for(let name in this.$store.state.selectedDrone) {
        //         if (Object.prototype.hasOwnProperty.call(this.$store.state.selectedDrone, name)) {
        //             if(this.$store.state.selectedDrone[name]) {
        //                 this.prepared = true;
        //                 this.$forceUpdate();
        //                 return;
        //             }
        //         }
        //     }
        //
        //     this.prepared = false;
        //     this.$forceUpdate();
        // });
    },
    methods: {
        changeGotoType(gotoType, dName) {
            this.gotoType[dName] = gotoType;
            this.$store.state.drone_infos[dName].gotoType = gotoType;
        },

        changeYawBehavior(yawBehavior, dName) {
            this.yawBehavior[dName] = yawBehavior;
            this.$store.state.drone_infos[dName].yawBehavior = yawBehavior;
        },

        changeCircleType(circleType, dName) {
            this.circleType[dName] = circleType;
            this.$store.state.drone_infos[dName].circleType = (circleType === '시계방향') ? 'cw' : 'ccw';
        },

        setPoint(point) {
            this.point = point
            console.log('setPoint', this.point);
            let td = document.querySelectorAll('td');
            let point_arr = this.point.split(',');
            let tar_point = parseInt(point_arr[1]) + (8 * parseInt(point_arr[0]));
            for (let idx = 0; idx < td.length; idx++) {
                if (parseInt(idx) === parseInt(tar_point)) {
                    td[tar_point].style.backgroundColor = '#8da4f7';
                    td[tar_point].style.color = '#0000FF';
                    td[tar_point].style['font-weight'] = 'bold';
                } else {
                    if (this.dropped_point.includes(idx)) {
                        console.log('setPoint', idx, this.dropped_point);
                        td[idx].style.backgroundColor = '#FF0000';
                        td[idx].style.color = '#FFFFFF';
                        td[idx].style['font-weight'] = 'bold';
                    } else {
                        td[idx].style.backgroundColor = '#FFFFFF';
                        td[idx].style.color = '#000000';
                        td[idx].style['font-weight'] = 'normal';
                    }
                }
            }
        },
        setDropCommand() {
            for (let name in this.$store.state.drone_infos) {
                if (Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos, name)) {
                    if (this.$store.state.drone_infos[name].selected && this.$store.state.drone_infos[name].targeted) {
                        var data = '{\n    "m2m:cin": {\n        "con": "' + this.point + '"\n    }\n}';

                        var config = {
                            method: 'post',
                            url: 'http://' + this.$store.state.drone_infos[name].host + ':7579/Mobius/' + this.$store.state.drone_infos[name].gcs + '/Mission_Data/' + this.$store.state.drone_infos[name].name + '/msw_sparrow_gun/MICRO',
                            headers: {
                                'Accept': 'application/json',
                                'X-M2M-RI': '12345',
                                'X-M2M-Origin': 'SVue',
                                'Content-Type': 'application/vnd.onem2m-res+json; ty=4'
                            },
                            data: data
                        };

                        axios(config)
                            .then(function (response) {
                                console.log(JSON.stringify(response.data));
                            })
                            .catch(function (error) {
                                console.log(error);
                            });

                        let td = document.querySelectorAll('td');
                        let point_arr = this.point.split(',');
                        let tar_point = parseInt(point_arr[1]) + (8 * parseInt(point_arr[0]));
                        td[tar_point].style.backgroundColor = '#FF0000';
                        td[tar_point].style.color = '#FFFFFF';
                        td[tar_point].style['font-weight'] = 'bold';

                        this.dropped_point.push(tar_point)
                        console.log('setDropCommand', this.dropped_point);

                    }
                }
            }
        },

        drawRadius(e, dName, pIndex) {
            console.log('radius: ', e);
            this.$store.state.drone_infos[dName].targetRadius = parseInt(this.targetRadius[dName]);

            if (this.$store.state.drone_infos[dName].targeted && this.$store.state.tempMarkers[dName][pIndex].targeted) {
                if(this.drawRadiusUpdateTimer !== null) {
                    clearTimeout(this.drawRadiusUpdateTimer);
                }

                this.drawRadiusUpdateTimer = setTimeout((radius, dName, pIndex) => {
                    this.$store.state.tempMarkers[dName][pIndex].radius = this.$store.state.drone_infos[dName].targetRadius;

                    //delete this.$store.state.targetCircles[dName];
                    this.$store.state.targetCircles[dName] = {
                        lat: this.$store.state.tempMarkers[dName][pIndex].lat,
                        lng: this.$store.state.tempMarkers[dName][pIndex].lng,
                        radius: this.$store.state.tempMarkers[dName][pIndex].radius,
                        options: {
                            strokeColor: this.$store.state.drone_infos[dName].color,
                            strokeOpacity: 0.9,
                            strokeWeight: 5
                        }
                    };
                }, 100, e, dName, pIndex);
            }
            else {
                delete this.$store.state.targetCircles[dName];
            }

            //EventBus.$emit('do-drawLineAllTarget');
        },
        handleLeftChange(dName, id, {x, y, speed, angle}) {
            const stick = this[`${id}Stick`];
            stick.x[dName] = x;
            stick.y[dName] = y;
            stick.speed[dName] = speed;
            stick.angle[dName] = angle;

            //console.log(dName, angle, stick.angle[dName]);

            let temp = JSON.parse(JSON.stringify(stick));
            this[`${id}Stick`] = null;
            this[`${id}Stick`] = JSON.parse(JSON.stringify(temp));

            let payload = {};
            payload.num = this.target_mission_num.targetCh1[dName];
            payload.value = parseInt(this.mission_ch_min + ((x + 47) / 94) * (this.mission_ch_max - this.mission_ch_min));

            EventBus.$emit('command-set-pwms-mission-' + dName, payload);

            let _payload = {};
            _payload.num = this.target_mission_num.targetCh2[dName];
            _payload.value = parseInt(this.mission_ch_min + ((y + 47) / 94) * (this.mission_ch_max - this.mission_ch_min));

            EventBus.$emit('command-set-pwms-mission-' + dName, _payload);

            this.$cookies.set('target_mission_num', this.target_mission_num);
            this.$cookies.set('mission_value', this.mission_value);
        },

        handleRightChange(dName, id, {x, y, speed, angle}) {
            const stick = this[`${id}Stick`];
            stick.x[dName] = x;
            stick.y[dName] = y;
            stick.speed[dName] = speed;
            stick.angle[dName] = angle;

            //console.log(dName, angle, stick.angle[dName]);

            let temp = JSON.parse(JSON.stringify(stick));
            this[`${id}Stick`] = null;
            this[`${id}Stick`] = JSON.parse(JSON.stringify(temp));

            let payload = {};
            payload.num = this.target_mission_num.targetCh3[dName];
            payload.value = parseInt(this.mission_ch_min + ((x + 47) / 94) * (this.mission_ch_max - this.mission_ch_min));

            EventBus.$emit('command-set-pwms-mission-' + dName, payload);

            let _payload = {};
            _payload.num = this.target_mission_num.targetCh4[dName];
            _payload.value = parseInt(this.mission_ch_min + ((y + 47) / 94) * (this.mission_ch_max - this.mission_ch_min));

            EventBus.$emit('command-set-pwms-mission-' + dName, _payload);

            this.$cookies.set('target_mission_num', this.target_mission_num);
            this.$cookies.set('mission_value', this.mission_value);
        },

        handlePwmClick(dName, num) {
            let payload = {};
            payload.num = this.target_mission_num[`targetCh${num}`][dName];
            payload.value = parseInt(this.mission_ch_min + (this.mission_value[`ch${num}`][dName] / 2) * (this.mission_ch_max - this.mission_ch_min));

            EventBus.$emit('command-set-pwms-mission-' + dName, payload);

            this.$cookies.set('target_mission_num', this.target_mission_num);
            this.$cookies.set('mission_value', this.mission_value);
        },

        handlePwmSlide(dName, num) {
            let payload = {};
            payload.num = this.target_mission_num[`targetCh${num}`][dName];
            payload.value = parseInt(this.mission_ch_max - ((this.mission_ch_max - this.mission_value[`ch${num}`][dName]) / (this.mission_ch_max - this.mission_ch_min)) * (this.mission_ch_max - this.mission_ch_min));

            EventBus.$emit('command-set-pwms-mission-' + dName, payload);

            this.$cookies.set('target_mission_num', this.target_mission_num);
            this.$cookies.set('mission_value', this.mission_value);
        },

        decrement() {
            this.target_alt--
        },
        increment() {
            this.target_alt++
        },

        selectedPosition: function(event, d) {
            this.position_selections_index[d.name] = this.position_selections_items[d.name].indexOf(event);

            let pIndex = this.position_selections_index[d.name];
            let pName = d.name;
            this.position_selections_elevation[pName] = parseFloat(this.$store.state.tempMarkers[pName][pIndex].elevation).toFixed(1);

            let payload = {};
            payload.pName = d.name;
            payload.pIndex = this.position_selections_index[d.name];
            payload.targeted = true;

            EventBus.$emit('do-targetTempMarker', payload);
        },

        tab_click(title) {
            this.$store.state.currentCommandTab = title;

            this.curTab = title;

            if (this.$store.state.active_tab === this.curTab) {
                this.$store.state.active_tab = 'virtual';

                this.$store.state.currentCommandTab = 'virtual';
            }

            EventBus.$emit('do-deleteLineAllTarget');

            if (this.$store.state.currentCommandTab === '이동') {
                //EventBus.$emit('do-drawLineAllTarget');


            }
            else if(this.$store.state.currentCommandTab === '선회') {
                for (let dName in this.$store.state.drone_infos) {
                    if (Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos, dName)) {
                        if (this.$store.state.drone_infos[dName].selected && this.$store.state.drone_infos[dName].targeted) {
                            let pIndex = this.position_selections_index[dName];
                            if(pIndex !== undefined) {
                                if (this.$store.state.tempMarkers[dName][pIndex].targeted) {
                                    console.log("*****************************************************************************", this.targetRadius[dName], pIndex);
                                    this.drawRadius(this.targetRadius[dName], dName, pIndex);
                                }
                            }
                        }
                    }
                }
            }
            else if(this.$store.state.currentCommandTab === '패턴') {
                for (let dName in this.$store.state.drone_infos) {
                    if (Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos, dName)) {
                        if (this.$store.state.drone_infos[dName].selected && this.$store.state.drone_infos[dName].targeted) {
                            if(Object.prototype.hasOwnProperty.call(this.$store.state.targetCircles, dName)) {
                                delete this.$store.state.targetCircles[dName];
                            }
                        }
                    }
                }
            }
            else if (this.$store.state.currentCommandTab === '모드') {
                for (let dName in this.$store.state.drone_infos) {
                    if (Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos, dName)) {
                        if (this.$store.state.drone_infos[dName].selected && this.$store.state.drone_infos[dName].targeted) {
                            console.log('targetModeSelection', dName, this.targetModeSelection[dName], this.$store.state.drone_infos[dName].curMode);
                            this.targetModeSelection[dName] = this.$store.state.drone_infos[dName].curMode;
                        }
                    }
                }
            }
        },

        sendCommand() {
            this.loading = true;
            console.log(this.curTab);
            if(this.curTab === '모드') {
                this.setMode();
            }
            else if(this.curTab === '시동') {
                this.setArm();
            }
            else if(this.curTab === '이륙') {
                this.setTakeoff();
            }
            else if(this.curTab === '고도') {
                this.setGotoAlt();
            }
            else if(this.curTab === '이동') {
                this.setGoto();
            }
            else if(this.curTab === '패턴') {
                this.setSurvey();
            }
            else if(this.curTab === '선회') {
                this.setGotoCircle();
            }
            else if(this.curTab === '속도') {
                this.setChangeSpeed();
            }
            else if(this.curTab === '관심') {
                this.setRoi();
            }
            else if(this.curTab === '정지') {
                this.setStop();
            }
            else if(this.curTab === '착륙') {
                this.setLand();
            }
            else if(this.curTab === '귀환') {
                this.setRtl();
            }
            else if(this.curTab === '제어') {
                this.setPwms();
            }
            else if(this.curTab === '자동') {
                this.setAutoGoto();
            }
            else if(this.curTab === '종료') {
                this.setDisarm();
            }
            else if(this.curTab === '설정') {
                this.setParams();
            }

            this.curTab = 'virtual';
            this.$store.state.active_tab = 'virtual';

            for(let name in this.$store.state.drone_infos) {
                if (Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos, name)) {
                    if(this.$store.state.drone_infos[name].selected && this.$store.state.drone_infos[name].targeted) {
                        this.$store.commit('saveCurrentDroneInfos', name);
                    }
                }
            }
        },

        setMode() {
            let self = this;
            for(let name in this.$store.state.drone_infos) {
                if (Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos, name)) {
                    if(this.$store.state.drone_infos[name].selected && this.$store.state.drone_infos[name].targeted) {
                        this.$store.state.drone_infos[name].tagetModeSelection = parseInt(this.tagetModeSelection[name]);
                        EventBus.$emit('command-set-mode-' + name, this.targetModeSelection[name]);
                    }
                }
            }

            setTimeout(function () {
                self.mode_sheet = !self.mode_sheet;
                self.loading = false;
                self.$forceUpdate();
            }, 100);
        },

        setArm() {
            for(let name in this.$store.state.drone_infos) {
                if (Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos, name)) {
                    if(this.$store.state.drone_infos[name].selected && this.$store.state.drone_infos[name].targeted) {
                        EventBus.$emit('command-set-arm-' + name, '');
                    }
                }
            }

            let self = this;
            setTimeout(function () {
                self.mode_sheet = !self.mode_sheet;
                self.loading = false;
                self.$forceUpdate();
            }, 100);
        },

        setTakeoff() {
            for(let name in this.$store.state.drone_infos) {
                if (Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos, name)) {
                    if(this.$store.state.drone_infos[name].selected && this.$store.state.drone_infos[name].targeted) {
                        if (this.takeoffDelay[name] < 6) {
                            this.takeoffDelay[name] = 6;
                        }
                        this.$store.state.drone_infos[name].takeoffDelay = parseInt(this.takeoffDelay[name]);

                        if (this.targetTakeoffAlt[name] < 3) {
                            this.targetTakeoffAlt[name] = 3;
                        }
                        this.$store.state.drone_infos[name].targetTakeoffAlt = parseInt(this.targetTakeoffAlt[name]);

                        EventBus.$emit('command-set-takeoff-' + name);
                    }
                }
            }

            let self = this;
            setTimeout(function () {
                self.mode_sheet = !self.mode_sheet;
                self.loading = false;
                self.$forceUpdate();
            }, 100);
        },

        setGotoAlt() {
            for(let name in this.$store.state.drone_infos) {
                if (Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos, name)) {
                    if(this.$store.state.drone_infos[name].selected && this.$store.state.drone_infos[name].targeted) {
                        if(this.targetAlt[name] < 3) {
                            this.targetAlt[name] = 3;
                        }
                        this.$store.state.drone_infos[name].targetAlt = parseInt(this.targetAlt[name]);
                        EventBus.$emit('command-set-goto-alt-' + name);
                    }
                }
            }

            let self = this;
            setTimeout(function () {
                self.mode_sheet = !self.mode_sheet;
                self.loading = false;
                self.$forceUpdate();
            }, 100);
        },

        setGoto() {
            for(let name in this.$store.state.drone_infos) {
                if (Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos, name)) {
                    if(this.$store.state.drone_infos[name].selected && this.$store.state.drone_infos[name].targeted) {
                        console.log('DroneCommand-setGoto', this.position_selections[name]);
                        if(this.position_selections[name] && this.position_selections[name] !== '' && this.position_selections[name] !== "") {
                            this.$store.state.drone_infos[name].gotoType = this.gotoType[name];
                            this.$store.state.drone_infos[name].yawBehavior = this.yawBehavior[name];
                            this.$store.state.drone_infos[name].targetSpeed = parseInt(this.targetSpeed[name]);
                            this.$store.state.drone_infos[name].targetAlt = parseInt(this.targetAlt[name]);

                            EventBus.$emit('command-set-goto-' + name, this.position_selections[name]);
                        }
                    }
                }
            }

            let self = this;
            setTimeout(function () {
                self.mode_sheet = !self.mode_sheet;
                self.loading = false;
                self.$forceUpdate();
            }, 100);
        },

        setGotoCircle() {
            // this.$store.state.missionCircles = null;
            // delete this.$store.state.missionCircles;
            // this.$store.state.missionCircles = JSON.parse(JSON.stringify({}));
            for(let name in this.$store.state.drone_infos) {
                if (Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos, name)) {
                    if(this.$store.state.drone_infos[name].selected && this.$store.state.drone_infos[name].targeted) {
                        console.log('DroneCommand-setGotoCircle', this.position_selections[name]);
                        if(this.position_selections[name] && this.position_selections[name] !== '' && this.position_selections[name] !== "") {
                            this.$store.state.drone_infos[name].circleType = this.circleType[name];
                            this.$store.state.drone_infos[name].targetTurningSpeed = parseInt(this.targetTurningSpeed[name]);
                            this.$store.state.drone_infos[name].targetRadius = parseInt(this.targetRadius[name]);
                            this.$store.state.drone_infos[name].targetAlt = parseInt(this.targetAlt[name]);

                            EventBus.$emit('command-set-goto-circle-' + name, this.position_selections[name]);
                        }
                    }
                }
            }

            let self = this;
            setTimeout(function () {
                self.mode_sheet = !self.mode_sheet;
                self.loading = false;
                self.$forceUpdate();
            }, 100);
        },

        setChangeSpeed() {
            for(let name in this.$store.state.drone_infos) {
                if (Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos, name)) {
                    if(this.$store.state.drone_infos[name].selected && this.$store.state.drone_infos[name].targeted) {
                        this.$store.state.drone_infos[name].targetSpeed = parseInt(this.targetSpeed[name]);
                        EventBus.$emit('command-set-change-speed-' + name, this.$store.state.drone_infos[name].targetSpeed);
                    }
                }
            }

            let self = this;
            setTimeout(function () {
                self.mode_sheet = !self.mode_sheet;
                self.loading = false;
                self.$forceUpdate();
            }, 100);
        },

        setRoi() {
            for(let name in this.$store.state.drone_infos) {
                if (Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos, name)) {
                    if(this.$store.state.drone_infos[name].selected && this.$store.state.drone_infos[name].targeted) {
                        console.log('DroneCommand-setRoi', this.position_selections[name]);
                        if(this.position_selections[name] && this.position_selections[name] !== '' && this.position_selections[name] !== "") {
                            this.$store.state.drone_infos[name].gotoType = this.gotoType[name];
                            this.$store.state.drone_infos[name].yawBehavior = this.yawBehavior[name];
                            this.$store.state.drone_infos[name].targetSpeed = parseInt(this.targetSpeed[name]);
                            this.$store.state.drone_infos[name].targetAlt = parseInt(this.targetAlt[name]);
                            EventBus.$emit('command-set-roi-' + name, this.position_selections[name]);
                        }
                    }
                }
            }

            setTimeout(() => {
                this.mode_sheet = !this.mode_sheet;
                this.loading = false;
                this.$forceUpdate();
            }, 100);
        },

        setStop() {
            for(let name in this.$store.state.drone_infos) {
                if (Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos, name)) {
                    if(this.$store.state.drone_infos[name].selected && this.$store.state.drone_infos[name].targeted) {
                        EventBus.$emit('command-set-stop-' + name);
                    }
                }
            }

            let self = this;
            setTimeout(function () {
                self.mode_sheet = !self.mode_sheet;
                self.loading = false;
                self.$forceUpdate();
            }, 100);
        },

        setLand() {
            for(let name in this.$store.state.drone_infos) {
                if (Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos, name)) {
                    if(this.$store.state.drone_infos[name].selected && this.$store.state.drone_infos[name].targeted) {
                        EventBus.$emit('command-set-land-' + name);
                    }
                }
            }

            let self = this;
            setTimeout(function () {
                self.mode_sheet = !self.mode_sheet;
                self.loading = false;
                self.$forceUpdate();
            }, 100);
        },

        setRtl() {
            for(let name in this.$store.state.drone_infos) {
                if (Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos, name)) {
                    if(this.$store.state.drone_infos[name].selected && this.$store.state.drone_infos[name].targeted) {
                        EventBus.$emit('command-set-rtl-' + name, this.rtlSpeed[name]);
                    }
                }
            }

            let self = this;
            setTimeout(function () {
                self.mode_sheet = !self.mode_sheet;
                self.loading = false;
                self.$forceUpdate();
            }, 100);
        },

        setPwms() {
            console.log(this.pwms);
            for(let name in this.$store.state.drone_infos) {
                if (Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos, name)) {
                    if(this.$store.state.drone_infos[name].selected && this.$store.state.drone_infos[name].targeted) {
                        EventBus.$emit('command-set-pwms-' + name, this.pwms);
                    }
                }
            }

            setTimeout(() => {
                this.mode_sheet = !this.mode_sheet;
                this.loading = false;
                this.$forceUpdate();

                this.pwms = {
                    ch9: {},
                    ch10: {},
                    ch11: {},
                    ch12: {}
                };

            }, 100);
        },

        setAutoGoto() {
            for(let name in this.$store.state.drone_infos) {
                if (Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos, name)) {
                    if(this.$store.state.drone_infos[name].selected && this.$store.state.drone_infos[name].targeted) {
                        this.$store.state.drone_infos[name].autoStartIndex = this.autoStartIndex[name];
                        this.$store.state.drone_infos[name].autoEndIndex = this.autoEndIndex[name];
                        this.$store.state.drone_infos[name].autoDelay = parseInt(this.autoDelay[name]);
                        this.$store.state.drone_infos[name].autoSpeed = parseInt(this.autoSpeed[name]);
                        console.log('setAutoGoto', parseInt(this.$store.state.drone_infos[name].autoStartIndex), parseInt(this.$store.state.drone_infos[name].autoEndIndex), this.$store.state.drone_infos[name].autoDelay);
                        if(parseInt(this.$store.state.drone_infos[name].autoStartIndex) <= parseInt(this.$store.state.drone_infos[name].autoEndIndex)) {
                            let payload = {};
                            payload.goto_positions = JSON.parse(JSON.stringify(this.position_selections_items[name]));
                            EventBus.$emit('command-set-auto_goto-' + name, payload);
                        }
                        else {
                            console.log('setAutoGoto-', name, 'auto index setting error!!!');
                        }
                    }
                }
            }

            setTimeout(() => {
                this.mode_sheet = !this.mode_sheet;
                this.loading = false;
                this.$forceUpdate();
            }, 100);
        },

        setSurvey() {
            for(let dName in this.$store.state.drone_infos) {
                if (Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos, dName)) {
                    if(this.$store.state.drone_infos[dName].selected && this.$store.state.drone_infos[dName].targeted) {
                        if(this.targetSurveyMarkerIndex[dName] !== -1) {
                            this.$store.state.drone_infos[dName].autoStartIndex = 0;
                            this.$store.state.drone_infos[dName].autoEndIndex = this.$store.state.surveyMarkers[dName][this.targetSurveyMarkerIndex[dName]].pathLines.length - 1;
                            this.$store.state.drone_infos[dName].autoDelay = parseInt(this.targetStayTime[dName]);
                            //this.$store.state.drone_infos[dName].autoSpeed = parseInt(this.targetSpeed[dName]);
                            this.$store.state.drone_infos[dName].autoSpeed = this.$store.state.surveyMarkers[dName][this.targetSurveyMarkerIndex[dName]].speed;

                            this.position_selections_items[dName] = [];
                            for (let idx in this.$store.state.surveyMarkers[dName][this.targetSurveyMarkerIndex[dName]].pathLines) {
                                if (Object.prototype.hasOwnProperty.call(this.$store.state.surveyMarkers[dName][this.targetSurveyMarkerIndex[dName]].pathLines, idx)) {
                                    let strPos = this.$store.state.surveyMarkers[dName][this.targetSurveyMarkerIndex[dName]].pathLines[idx].lat + ':' +
                                        this.$store.state.surveyMarkers[dName][this.targetSurveyMarkerIndex[dName]].pathLines[idx].lng + ':' +
                                        this.$store.state.surveyMarkers[dName][this.targetSurveyMarkerIndex[dName]].alt + ':' +
                                        this.$store.state.surveyMarkers[dName][this.targetSurveyMarkerIndex[dName]].speed + ':' +
                                        // this.targetAlt[dName] + ':' +
                                        // this.targetSpeed[dName] + ':' +
                                        '100:5:16:' +
                                        this.targetStayTime[dName] + ':0';
                                    this.position_selections_items[dName].push(strPos);
                                }
                            }

                            console.log('setSurvey', parseInt(this.$store.state.drone_infos[dName].autoStartIndex), parseInt(this.$store.state.drone_infos[dName].autoEndIndex), this.$store.state.drone_infos[dName].autoDelay);
                            if (parseInt(this.$store.state.drone_infos[dName].autoStartIndex) <= parseInt(this.$store.state.drone_infos[dName].autoEndIndex)) {
                                let payload = {};
                                payload.goto_positions = JSON.parse(JSON.stringify(this.position_selections_items[dName]));
                                EventBus.$emit('command-set-auto_goto-' + dName, payload);

                                payload.topic = '/Mobius/KETI_MUV/Mission_Data/' + dName + '/msw_lx_cam/Capture';
                                payload.payload = 'g ' + this.$store.state.surveyMarkers[dName][this.targetSurveyMarkerIndex[dName]].period + ' keti';
                                EventBus.$emit('do-publish-' + dName, payload);
                            } else {
                                console.log('setAutoGoto-', dName, 'auto index setting error!!!');
                            }
                        }
                        else {
                            console.error(dName, ' no targeting');
                        }
                    }
                }
            }

            setTimeout(() => {
                this.mode_sheet = !this.mode_sheet;
                this.loading = false;
                this.$forceUpdate();
            }, 100);
        },

        setDisarm() {
            for(let name in this.$store.state.drone_infos) {
                if (Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos, name)) {
                    if(this.$store.state.drone_infos[name].selected && this.$store.state.drone_infos[name].targeted) {
                        EventBus.$emit('command-set-disarm-' + name);
                    }
                }
            }

            let self = this;
            setTimeout(function () {
                self.mode_sheet = !self.mode_sheet;
                self.loading = false;
                self.$forceUpdate();
            }, 100);
        },

        setParams() {
            console.log(this.$store.state.params);
            for (let name in this.$store.state.drone_infos) {
                if (Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos, name)) {
                    if (this.$store.state.drone_infos[name].selected && this.$store.state.drone_infos[name].targeted) {
                        EventBus.$emit('command-set-params-' + name, this.$store.state.params);
                    }
                }
            }

            setTimeout(() => {
                this.mode_sheet = !this.mode_sheet;
                this.loading = false;
                this.$forceUpdate();

                // this.params = {
                //     wpYawBehavior: {},
                //     atcSlewYaw: {},
                //     wpnavSpeedUp: {},
                //     wpnavSpeedDn: {},
                //     rtlAlt: {}
                // };
            }, 100);
        },
    },
    beforeDestroy() {
        EventBus.$off('gcs-map-ready');
        EventBus.$off('do-targetDrone');
        EventBus.$off('do-selected-position');
        EventBus.$off('update-goto-positions');

        EventBus.$off('do-target-survey-marker');
    }
}
</script>

<style scoped>
    @keyframes metronome-example {
        from {
            transform: scale(.5);
        }

        to {
            transform: scale(1);
        }
    }

    /*.v-avatar--metronome {*/
    /*    animation-name: metronome-example;*/
    /*    animation-iteration-count: infinite;*/
    /*    animation-direction: alternate;*/
    /*}*/

    .tab_position {
        position: absolute;
        opacity: 1; /* for demo purpose  */
        z-index: 2;
    }

    td, th {
        font-weight: normal;
        padding: 10px;
        border: 1px solid #ccc;
    }

    body {
        padding: 1rem;
    }

</style>
