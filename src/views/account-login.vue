<template>
    <v-container style="width: 450px" >
        <v-layout align-center row wrap>
            <v-flex xs12>
                <v-alert v-if="isError" type="error">
                    {{ errorMsg }}
                </v-alert>
                <v-card>
                    <v-toolbar flat color="indigo">
                        <v-toolbar-title
                        ><span class="white--text">로그인</span></v-toolbar-title
                        >
                    </v-toolbar>
                    <div class="pa-5">
                        <v-form ref="form" v-model="valid" lazy-validation>
                            <v-text-field
                                v-model="formData.email"
                                :rules="emailRules"
                                label="E-mail 입력"
                                required
                            ></v-text-field>

                            <v-text-field
                                v-model="formData.password"
                                :append-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
                                :rules="[rules.required, rules.min]"
                                :type="show ? 'text' : 'password'"
                                label="비밀번호 입력"
                                hint="최소 8자 이상 입력해주세요."
                                counter
                                v-on:keyup.enter="login(formData)"
                                @click:append="show = !show"
                            ></v-text-field>

                            <div class="mt-3 d-flex flex-row-reverse">
                                <v-btn color="error" class="mr-4" @click="reset"> 리셋 </v-btn>
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
                            </div>
                        </v-form>
                    </div>
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
        value : keyValue,
        expire : Date.now() + tts
    }

    // 객체를 JSON 문자열로 변환
    const objString = JSON.stringify(obj);

    // setItem
    window.localStorage.setItem(keyName, objString);
}

export default {
    name: "account-login",
    data: () => ({
        formData: new LoginObj("", ""),
        valid: false,
        isError: false,
        errorMsg: "",
        emailRules: [
            (v) => !!v || "E-mail is required",
            (v) => /.+@.+\..+/.test(v) || "E-mail must be valid"
        ],
        show: false,
        rules: {
            required: (value) => !!value || "Required.",
            min: (v) => (v === null) || v.length >= 8 || "Min 8 characters"
        }
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
                url: 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/UserInfos/' + LoginObj.email.replace('@','_').replace('.', '_'),
                headers: {
                    'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                    'X-M2M-Origin': 'SVue',
                    'Content-Type': 'application/json'
                },
            }).then(
                (res) => {
                    if(res.status === 200) {
                        console.log('UserInfos', res.data);

                        if(pwHash === res.data['m2m:cnt'].lbl[0]) {
                            console.log('login success');

                            // localStorage에 12시간 만료시간을 설정하고 데이터 저장
                            setItemWithExpireTime('loginEmail', LoginObj.email.replace('@','_').replace('.', '_'), 12 * (60 * 60 * 1000))

                            this.$store.state.isLogin = true;
                            this.$store.state.userInfo = LoginObj;
                            this.$router.replace({ name: "Home" });
                        }
                        else {
                            console.log('password incorrect');
                        }
                    }
                    else {
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
            //
            // axios
            //     .post("http://signin", LoginObj)
            //     .then((res) => {
            //         let token = res.data.token
            //         localStorage.setItem("access_token", token)
            //         this.$store.dispatch("getAccountInfo")
            //         this.$router.push({ name: "Home" })
            //     })
            //     .catch((err) => {
            //         if (err.response) {
            //             this.isError = true
            //             this.errorMsg = err.response.data.message
            //         }
            //     })
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
