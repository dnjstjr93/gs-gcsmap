<template>
    <v-container style="width: 450px">
        <v-layout align-center row wrap>
            <v-flex xs12>
                <v-alert v-if="isError" type="error">
                    {{ errorMsg }}
                </v-alert>
                <v-card>
                    <v-toolbar flat color="indigo">
                        <v-toolbar-title
                        ><span class="white--text">회원가입</span></v-toolbar-title
                        >
                    </v-toolbar>
                    <div class="pa-5">
                        <v-form ref="form" v-model="valid" lazy-validation>
                            <v-text-field
                                v-model="formData.email"
                                :rules="emailRules"
                                label="E-mail 입력"
                                :readonly="!isFocused" @focus="isFocused = true" @blur="isFocused = false"
                                required
                            ></v-text-field>

                            <v-text-field
                                v-model="formData.name"
                                :counter="10"
                                :rules="nameRules"
                                label="닉네임"
                                required
                            ></v-text-field>

                            <v-text-field
                                v-model="formData.password"
                                :append-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
                                :rules="[rules.required, rules.min]"
                                :type="show ? 'text' : 'password'"
                                label="비밀번호 입력"
                                :readonly="!isFocused" @focus="isFocused = true" @blur="isFocused = false"
                                hint="최소 8자 이상 입력해주세요."
                                counter
                                @click:append="show = !show"
                            ></v-text-field>

                            <v-text-field
                                v-model="chkPassword"
                                :append-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
                                :rules="[rules.required, rules.min]"
                                :type="show ? 'text' : 'password'"
                                label="비밀번호 재입력"
                                hint="최소 8자 이상 입력해주세요."
                                counter
                                @click:append="show = !show"
                            ></v-text-field>

<!--                            <h6 v-if="sameChk(chkPassword)" class="mb-5 teal&#45;&#45;text accent-3">-->
<!--                                Please create the two passwords identical.-->
<!--                            </h6>-->
<!--                            <h6 v-else class="mb-5 red&#45;&#45;text lighten-2">-->
                            <h6 v-if="!sameChk(chkPassword)" class="mb-5 red--text lighten-2">
                                비밀번호가 일치하지 않습니다.
                            </h6>

                            <v-row class="mt-3 d-flex" justify="end">
                                <v-col cols="4">
                                    <v-btn
                                        color="success"
                                        class="mr-4"
                                        link
                                        router
                                        :to="{ name: 'login' }"
                                    >
<!--                                        <v-icon>mdi-arrow-left</v-icon>-->
                                        뒤로가기
                                    </v-btn>
                                </v-col>
                                <v-spacer/>
                                <v-col cols="7">
                                    <v-btn
                                        :disabled="!valid"
                                        color="blue"
                                        class="ml-9"
                                        @click="register(formData)"
                                    >
                                        회원가입
                                    </v-btn>
                                    <v-btn color="error" class="ml-4" @click="reset"> 초기화</v-btn>
                                </v-col>
                            </v-row>
                        </v-form>
                    </div>
                </v-card>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
import RegisterObj from "../js/registerObj"
import axios from "axios"
import crypto from "crypto";

export default {
    name: "account-register",
    data: () => ({
        formData: new RegisterObj("", "", ""),
        valid: false,
        isFocused:false,
        nameRules: [
            (v) => !!v || "닉네임을 입력해주세요.",
            (v) => (v && v.length <= 10) || "닉네임은 10자 미만이어야 합니다."
        ],
        isError: false,
        errorMsg: "",
        emailRules: [
            (v) => !!v || "E-mail을 입력해주세요.",
            (v) => /.+@.+\..+/.test(v) || "유효한 E-mail 형식이 아닙니다."
        ],
        show: false,
        chkPassword: "",
        rules: {
            required: (value) => !!value || "패스워드를 입력해주세요.",
            min: (v) => (v === null) || v.length >= 8 || "최소 8자 이상 입력해주세요."
        }
    }),
    methods: {
        goToMain() {
            this.$router.push({
                name: "login"
            })
        },
        sameChk(password) {
            if (this.formData.password === password) {
                this.valid = true
                return true
            }
            else {
                this.valid = false
                return false
            }
        },
        register(RegisterObj) {
            if (
                !this.formData.email ||
                !this.formData.name ||
                !this.formData.password
            ) {
                this.isError = true
                this.errorMsg = "이메일과 닉네임과 비밀번호를 모두 입력해주세요."
                return
            }

            console.log(RegisterObj);
            const pwHash = crypto.createHash('md5').update(this.formData.password).digest('base64');

            axios({
                validateStatus: function (status) {
                    // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                    return status < 500;
                },
                method: 'post',
                url: 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/UserInfos',
                headers: {
                    'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                    'X-M2M-Origin': 'SVue',
                    'Content-Type': 'application/json;ty=3'
                },
                data: {
                    'm2m:cnt': {
                        rn: this.formData.email.replace('@','_').replace('.', '_'),
                        lbl: [pwHash],
                    }
                }
            }).then(
                (res) => {
                    if(res.status === 201) {
                        console.log('retister success');

                        this.goToMain();
                    }
                    else if(res.status === 403) {
                        alert('사용자가 이미 존재합니다.');
                    }
                    else {
                        console.log('회원가입 오류');
                    }
                }
            ).catch(
                (err) => {
                    if (err.response) {
                        this.isError = true
                        this.errorMsg = err.response.data.message
                    }
                }
            );
        },
        validate() {
            this.$refs.form.validate()
        },
        reset() {
            this.$refs.form.reset()
        },
        resetValidation() {
            this.$refs.form.resetValidation()
        }
    }
}
</script>

<style scoped>

</style>
