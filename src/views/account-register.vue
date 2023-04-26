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
                                label="Enter E-mail"
                                required
                            ></v-text-field>

                            <v-text-field
                                v-model="formData.name"
                                :counter="10"
                                :rules="nameRules"
                                label="Name"
                                required
                            ></v-text-field>

                            <v-text-field
                                v-model="formData.password"
                                :append-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
                                :rules="[rules.required, rules.min]"
                                :type="show ? 'text' : 'password'"
                                label="Enter Password"
                                hint="At least 8 characters"
                                counter
                                @click:append="show = !show"
                            ></v-text-field>

                            <v-text-field
                                v-model="chkPassword"
                                :append-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
                                :rules="[rules.required, rules.min]"
                                :type="show ? 'text' : 'password'"
                                label="Enter Password Again"
                                hint="At least 8 characters"
                                counter
                                @click:append="show = !show"
                            ></v-text-field>

                            <h6 v-if="sameChk(chkPassword)" class="mb-5 teal--text accent-3">
                                Please create the two passwords identical.
                            </h6>
                            <h6 v-else class="mb-5 red--text lighten-2">
                                Please create the two passwords identical.
                            </h6>

                            <div class="mt-3 d-flex flex-row-reverse">
                                <v-btn color="error" class="mr-4" @click="reset"> 리셋 </v-btn>

                                <v-btn
                                    :disabled="!valid"
                                    color="blue"
                                    class="mr-4"
                                    @click="register(formData)"
                                >
                                    회원가입
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
import RegisterObj from "../js/registerObj"
import axios from "axios"
import crypto from "crypto";

export default {
    name: "account-register",
    data: () => ({
        formData: new RegisterObj("", "", ""),
        valid: false,
        nameRules: [
            (v) => !!v || "Name is required",
            (v) => (v && v.length <= 10) || "Name must be less than 10 characters"
        ],
        isError: false,
        errorMsg: "",
        emailRules: [
            (v) => !!v || "E-mail is required",
            (v) => /.+@.+\..+/.test(v) || "E-mail must be valid"
        ],
        show: false,
        chkPassword: "",
        rules: {
            required: (value) => !!value || "Required.",
            min: (v) => (v === null) || v.length >= 8 || "Min 8 characters"
        }
    }),
    methods: {
        goToMain() {
            this.$router.push({
                name: "login"
            })
        },
        sameChk(password) {
            if (this.formData.password === password) return true
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