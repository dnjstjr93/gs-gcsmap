<template>
    <v-container style="width: 450px">
        <v-layout align-center row wrap>
            <v-flex xs12>
                <v-alert v-if="isError" type="error">
                    {{ errorMsg }}
                </v-alert>
                <v-card>
                    <v-toolbar flat color="indigo">
                        <v-toolbar-title>
                            <span class="white--text">로그인</span>
                        </v-toolbar-title>
                        <v-row justify="end">
                            <v-tooltip bottom>
                                <template v-slot:activator="{ on, attrs }">
                                    <v-btn text dark rounded
                                           @click="ContactUs=!ContactUs"
                                           v-bind="attrs"
                                           v-on="on"
                                    >
                                        <v-icon>mdi-account-box</v-icon>
                                    </v-btn>
                                </template>
                                <span>문의하기</span>
                            </v-tooltip>
                        </v-row>
                    </v-toolbar>
                    <div class="pa-5">
                        <v-form ref="form" v-model="valid" lazy-validation>
                            <v-text-field
                                v-model="formData.email"
                                :rules="emailRules"
                                label="E-mail 입력"
                                required
                                :readonly="!isFocused" @focus="isFocused=true" @blur="isFocused=false"
                            ></v-text-field>

                            <v-text-field
                                v-model="formData.password"
                                :append-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
                                :rules="rules"
                                :type="show ? 'text' : 'password'"
                                label="비밀번호 입력"
                                hint="최소 8자 이상, 대/소문자, 숫자, 특수문자를 포함하여 입력해주세요."
                                counter
                                v-on:keyup.enter="login(formData)"
                                @click:append="show = !show"
                            ></v-text-field>

                            <div class="mt-3 d-flex flex-row-reverse">
                                <v-btn color="error" class="mr-1" @click="reset"> 초기화</v-btn>
                                <v-btn
                                    color="primary"
                                    class="mr-4"
                                    link
                                    router
                                    :to="{ name: 'register' }"
                                >
                                    회원가입
                                </v-btn>

                                <v-btn
                                    :disabled="!valid"
                                    color="success"
                                    class="mr-4"
                                    @click="login(formData)"
                                >
                                    로그인
                                </v-btn>

                                <v-btn
                                    color="blue-grey"
                                    dark
                                    class="mr-10"
                                    @click="admin(formData)"
                                >
                                    관리자
                                </v-btn>
                            </div>
                        </v-form>
                    </div>
                    <v-dialog v-model="ContactUs" persistent max-width="450px">
                        <v-card>
                            <v-card-title style="background-color: #3F51B5">
                                <span class="headline white--text">문의하기</span>
                            </v-card-title>
                            <v-card-text>
                                <v-container class="mt-6">
                                    <v-row>
                                        <v-col cols="2">
                                            <v-btn text
                                                   @click="ContactUs=!ContactUs"
                                            >
                                                <v-icon>mdi-email</v-icon>
                                            </v-btn>
                                        </v-col>
                                        <v-col cols="10">
                                            <v-text-field
                                                v-model="$store.state.admin.email"
                                                dense readonly
                                                label="E-mail"
                                            ></v-text-field>
                                        </v-col>
                                    </v-row>
                                    <v-row>
                                        <v-col cols="2">
                                            <v-btn text
                                                   @click="ContactUs=!ContactUs"
                                            >
                                                <v-icon>mdi-phone</v-icon>
                                            </v-btn>
                                        </v-col>
                                        <v-col cols="10">
                                            <v-text-field
                                                v-model="$store.state.admin.tel"
                                                dense readonly
                                                label="TEL"
                                            ></v-text-field>
                                        </v-col>
                                    </v-row>
                                </v-container>
                            </v-card-text>
                            <v-card-actions class="mt-n8">
                                <v-spacer></v-spacer>
                                <v-btn
                                    color="blue darken-1"
                                    text
                                    @click="ContactUs=false"
                                >
                                    닫기
                                </v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>
                </v-card>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
import LoginObj from "../js/loginObj"
import axios from "axios"
import crypto from "crypto"

const setItemWithExpireTime = (keyName, keyValue, tts) => {
    // localStorage에 저장할 객체
    const obj = {
        value: keyValue,
        expire: Date.now() + tts
    }

    // 객체를 JSON 문자열로 변환
    const objString = JSON.stringify(obj);

    // setItem
    window.localStorage.setItem(keyName, objString);
}

export default {
    name: "account-login",
    data: () => ({
        ContactUs:false,
        formData: new LoginObj("", ""),
        valid: false,
        isError: false,
        errorMsg: "",
        isFocused: false,
        emailRules: [
            (v) => !!v || "E-mail을 입력해주세요.",
            (v) => /.+@.+\..+/.test(v) || "유효한 E-mail 형식이 아닙니다."
        ],
        show: false,
        rules: [
            (v) => (!!v) || "패스워드를 입력해주세요.",
            (v) => (v && v.length >= 8) || "최소 8자 이상 입력해주세요.",
            (v) => /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/.test(v) || "패스워드는 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다."
        ],
    }),
    methods: {
        login(LoginObj) {
            if (!this.formData.email || !this.formData.password) {
                this.isError = true
                this.errorMsg = "이메일과 비밀번호를 입력해주세요."
                return
            }

            const pwHash = crypto.createHash('md5').update(this.formData.password).digest('base64');

            axios({
                validateStatus: function (status) {
                    // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                    return status < 500;
                },
                method: 'get',
                url: 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/UserInfos/' + LoginObj.email.replace('@', '_').replace('.', '_'),
                headers: {
                    'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                    'X-M2M-Origin': 'SVue',
                    'Content-Type': 'application/json'
                },
            }).then(
                (res) => {
                    if (res.status === 200) {
                        console.log('UserInfos', res.data);

                        if (pwHash === res.data['m2m:cnt'].lbl[0]) {
                            console.log('login success');

                            // localStorage에 12시간 만료시간을 설정하고 데이터 저장
                            setItemWithExpireTime('loginEmail', LoginObj.email.replace('@', '_').replace('.', '_'), 12 * (60 * 60 * 1000))

                            this.$store.state.isLogin = true;
                            this.$store.state.userInfo = LoginObj;
                            this.$router.replace({name: "Home"});
                        } else {
                            console.log('password incorrect');
                        }
                    } else {
                        console.log('user do not exist');
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
        admin(LoginObj) {
            if (!this.formData.email || !this.formData.password) {
                this.isError = true;
                this.errorMsg = "관리자 계정을 입력해주세요.";
                return;
            }

            if (LoginObj.email === this.$store.state.admin.email) {
                console.log('success email validation')
                if (LoginObj.password === this.$store.state.admin.password) {
                    console.log('success password validation')
                    this.$store.state.isLogin = true;
                    this.$store.state.userInfo = LoginObj;
                    this.$router.push({name: "administrator"});
                } else {
                    this.isError = true;
                    this.errorMsg = "관리자 이메일이 정확하지 않습니다.";
                    return;
                }
            } else {
                this.isError = true;
                this.errorMsg = "관리자 이메일이 정확하지 않습니다.";
                return;
            }
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
