<template>
    <!--    <v-container style="width: 450px">-->
    <v-container class="mt-4" style="width: 500px">
        <v-layout align-center row wrap>
            <v-flex xs12>
                <v-alert v-if="isError" type="error">
                    {{ errorMsg }}
                </v-alert>
                <v-card>
                    <v-toolbar flat color="indigo">
                        <v-toolbar-title>
                            <span class="white--text">관리자 페이지</span>
                        </v-toolbar-title>
                        <v-row justify="end">
                            <v-btn
                                class="ma-2 mr-4"
                                color="orange darken-2"
                                dark
                                link
                                router
                                :to="{ name: 'login' }"
                            >
                                <v-icon
                                    dark
                                    left
                                >
                                    mdi-arrow-left
                                </v-icon>
                                뒤로가기
                            </v-btn>
                        </v-row>
                    </v-toolbar>
                    <div class="pa-5">
                        <v-data-table
                            v-model="selected"
                            :headers="headers"
                            :items="curUsers"
                            :single-select="false"
                            item-key="E-mail"
                            class="elevation-1"
                            hide-default-footer
                        >
<!--                            <template v-slot:item.editEmail="{ item }">-->
<!--                                <v-btn dark x-small color="green" @click.stop="editUser(item.email)">-->
<!--                                    <v-icon small>$pencil</v-icon>-->
<!--                                </v-btn>-->
<!--                            </template>-->
<!--                            <template v-slot:item.editPW="{ item }">-->
<!--                                <v-btn dark x-small color="green" @click.stop="editPassword(item.email)">-->
<!--                                    <v-icon small>$pencil</v-icon>-->
<!--                                </v-btn>-->
<!--                            </template>-->
                            <template v-slot:item.delete="{ item }">
                                <v-btn dark x-small color="red" @click.stop="removeUseremail(item.email)">
                                    <v-icon small>$delete</v-icon>
                                </v-btn>
                            </template>
                        </v-data-table>
                        <v-dialog v-model="editUserFlag" persistent max-width="450px">
                            <v-card ref="form">
                                <v-card-title>
                                    <span class="headline">사용자 E-mail 정보 수정</span>
                                </v-card-title>
                                <v-card-text>
                                    <v-container>
                                        <v-row>
                                            <v-col cols="12">
                                                <v-text-field
                                                    v-model="UserEmail"
                                                    :rules="UserEmail_rule" label="E-mail*"
                                                    required
                                                ></v-text-field>
                                            </v-col>
                                        </v-row>
                                    </v-container>
                                </v-card-text>
                                <v-card-actions>
                                    <v-spacer></v-spacer>
                                    <v-btn
                                        color="blue darken-1"
                                        text
                                        @click="editUserFlag=false"
                                    >
                                        취소
                                    </v-btn>
                                    <v-btn
                                        color="blue darken-1"
                                        text
                                        @click="update_email_submit"
                                    >
                                        업데이트
                                    </v-btn>
                                </v-card-actions>
                            </v-card>
                        </v-dialog>
                        <v-dialog v-model="editPWFlag" persistent max-width="450px">
                            <v-card ref="form">
                                <v-card-title>
                                    <span class="headline">사용자 비밀번호 수정</span>
                                </v-card-title>
                                <v-card-text>
                                    <v-container>
                                        <v-row>
                                            <v-col cols="12">
                                                <v-text-field
                                                    v-model="curPassword"
                                                    :rules="Password_rule" label="현재 비밀번호*"
                                                    hint="최소 8자 이상, 대/소문자, 숫자, 특수문자를 포함하여 입력해주세요."
                                                    :append-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
                                                    :type="show ? 'text' : 'password'"
                                                    @click:append="show = !show"
                                                    required
                                                ></v-text-field>
                                            </v-col>
                                        </v-row>
                                        <v-row>
                                            <v-col cols="12">
                                                <v-text-field
                                                    v-model="newPassword"
                                                    :rules="Password_rule" label="새 비밀번호*"
                                                    hint="최소 8자 이상, 대/소문자, 숫자, 특수문자를 포함하여 입력해주세요."
                                                    :append-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
                                                    :type="show ? 'text' : 'password'"
                                                    @click:append="show = !show"
                                                    required
                                                ></v-text-field>
                                            </v-col>
                                        </v-row>
                                        <v-row>
                                            <v-col cols="12">
                                                <v-text-field
                                                    v-model="newPassword_check"
                                                    :rules="Password_rule" label="새 비밀번호 확인*"
                                                    hint="최소 8자 이상, 대/소문자, 숫자, 특수문자를 포함하여 입력해주세요."
                                                    :append-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
                                                    :type="show ? 'text' : 'password'"
                                                    @click:append="show = !show"
                                                    required
                                                ></v-text-field>
                                            </v-col>
                                        </v-row>
                                        <v-row>
                                            <v-col>
                                                <h6 v-if="!sameChk(newPassword_check)" class="mb-5 red--text lighten-2">
                                                    새 비밀번호가 일치하지 않습니다.
                                                </h6>
                                            </v-col>
                                        </v-row>
                                    </v-container>
                                    <small>*필수 입력 항목</small>
                                </v-card-text>
                                <v-card-actions>
                                    <v-spacer></v-spacer>
                                    <v-btn
                                        color="blue darken-1"
                                        text
                                        @click="editPWFlag=false"
                                    >
                                        취소
                                    </v-btn>
                                    <v-btn
                                        color="blue darken-1"
                                        text
                                        @click="update_password_submit"
                                    >
                                        업데이트
                                    </v-btn>
                                </v-card-actions>
                            </v-card>
                        </v-dialog>
                    </div>
                </v-card>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
import axios from "axios"
import crypto from "crypto";

export default {
    name: "account-administrator",
    data: () => ({
        isError: false,
        errorMsg: "",
        curUsers: [],
        headers: [
            {text: 'E-mail', value: 'email'},
            // {text: 'E-mail 수정', value: 'editEmail', align: 'center'},
            // {text: '비밀번호 수정', value: 'editPW', align: 'center'},
            {text: '계정 삭제', value: 'delete', align: 'center'}
        ],
        selected: [],
        editUserFlag: false,
        editPWFlag: false,
        curUserEmail: '',
        UserEmail: '',
        UserEmail_rule: [
            (v) => !!v || "E-mail을 입력해주세요.",
            (v) => /.+@.+\..+/.test(v) || "유효한 E-mail 형식이 아닙니다."
        ],
        curPassword: '',
        curPasswordHash: '',
        Password_rule: [
            (v) => (!!v) || "패스워드를 입력해주세요.",
            (v) => (v && v.length >= 8) || "최소 8자 이상 입력해주세요.",
            (v) => /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/.test(v) || "패스워드는 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다."
        ],
        valid: false,
        newPassword: '',
        newPassword_check: '',
        show: false,
        enterNewPassword: false
    }),
    methods: {
        retrievedUsers() {
            axios({
                validateStatus: function (status) {
                    // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                    return status < 500;
                },
                method: 'get',
                url: 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/UserInfos?lvl=1&fu=1&ty=3',
                headers: {
                    'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                    'X-M2M-Origin': 'SVue',
                    'Content-Type': 'application/json;ty=3'
                }
            }).then(
                (res) => {
                    if (res.status === 200) {
                        console.log('Users retrieve success');
                        let Users = res.data["m2m:uril"];
                        Users.forEach((user) => {
                            let cur_user = user.split('/')[2].replace('_', '@').replace('_', '.');
                            this.curUsers.push({'email': cur_user, 'editEmail': '', 'editPW': '', 'delete': ''});
                        });
                    } else {
                        console.log('사용자 조회 오류');
                    }
                }
            ).catch(
                (err) => {
                    console.log(err)
                    if (err.response) {
                        this.isError = true;
                        this.errorMsg = err.response.data.message + '\n새로고침 하세요.';
                    }
                }
            );
        },
        sameChk(password) {
            if (this.newPassword === password) {
                this.valid = true;
                return true;
            } else {
                this.valid = false;
                return false;
            }
        },
        editUser(user) {
            console.log('editUseremail -', user);
            this.curUserEmail = user;
            this.UserEmail = user;
            this.editUserFlag = true;
        },
        editPassword(user) {
            this.editPWFlag = true;
            this.curUserEmail = user;

            axios({
                validateStatus: function (status) {
                    // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                    return status < 500;
                },
                method: 'get',
                url: 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/UserInfos/' + user.replace('@', '_').replace('.', '_'),
                headers: {
                    'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                    'X-M2M-Origin': 'SVue',
                    'Content-Type': 'application/json'
                }
            }).then(
                (res) => {
                    if (res.status === 200) {
                        // console.log(res);
                        this.curPasswordHash = res.data["m2m:cnt"].lbl[0];
                        console.log(this.curPasswordHash);
                    } else {
                        console.log('password incorrect');
                    }
                }
            ).catch(
                (err) => {
                    console.log(err);
                }
            );
        },
        removeUseremail(user) {
            console.log('removeUseremail -', user);
            if (confirm('( ' + user + ' ) 계정을 정말로 삭제하시겠습니까?')) {
                let cntName = user.replace('@', '_').replace('.', '_');

                for (var i = 0; i < this.curUsers.length; i++) {
                    if (this.curUsers[i].email === user) {
                        this.curUsers.splice(i, 1);
                        i--;
                    }
                }

                axios({
                    validateStatus: function (status) {
                        // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                        return status < 500;
                    },
                    method: 'delete',
                    url: 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/UserInfos/' + cntName,
                    headers: {
                        'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                        'X-M2M-Origin': 'SVue',
                        'Content-Type': 'application/json'
                    },
                }).then(
                    (res) => {
                        if (res.status === 200) {
                            console.log(res);
                        } else {
                            console.log('password incorrect');
                        }
                    }
                ).catch(
                    (err) => {
                        console.log(err);
                    }
                );
            } else {
                console.log(user + ' 계정 삭제 취소');
            }
        },
        update_email_submit() {
            if (this.curUserEmail !== this.UserEmail) {
                axios({
                    validateStatus: function (status) {
                        // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                        return status < 500;
                    },
                    method: 'get',
                    url: 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/UserInfos/' + this.curUserEmail.replace('@', '_').replace('.', '_'),
                    headers: {
                        'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                        'X-M2M-Origin': 'SVue',
                        'Content-Type': 'application/json'
                    },
                }).then(
                    (res) => {
                        if (res.status === 200) {
                            // console.log(res);
                            let pwHash = res.data['m2m:cnt'].lbl[0];
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
                                        rn: this.UserEmail.replace('@', '_').replace('.', '_'),
                                        lbl: [pwHash],
                                    }
                                }
                            }).then(
                                (res) => {
                                    console.log(res);
                                    if (res.status === 201) {
                                        console.log('retister success');
                                        axios({
                                            validateStatus: function (status) {
                                                // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                                                return status < 500;
                                            },
                                            method: 'delete',
                                            url: 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/UserInfos/' + this.curUserEmail.replace('@', '_').replace('.', '_'),
                                            headers: {
                                                'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                                                'X-M2M-Origin': 'SVue',
                                                'Content-Type': 'application/json'
                                            },
                                        }).then(
                                            (res) => {
                                                if (res.status === 200) {
                                                    console.log(res);
                                                    this.editUserFlag = false;
                                                    this.curUserEmail = '';
                                                    this.$router.go(0);
                                                } else {
                                                    console.log('password incorrect');
                                                }
                                            }
                                        ).catch(
                                            (err) => {
                                                console.log(err);
                                            }
                                        );
                                    } else if (res.status === 403) {
                                        alert('사용자가 이미 존재합니다.');
                                    } else {
                                        console.log('회원가입 오류');
                                    }
                                }
                            ).catch(
                                (err) => {
                                    console.log(err);
                                }
                            );
                        } else {
                            console.log('password incorrect');
                        }
                    }
                ).catch(
                    (err) => {
                        console.log(err);
                    }
                );

                let curEmail = this.curUserEmail.replace('@', '_').replace('.', '_');
                console.log(curEmail);
            }
            this.editUserFlag = false;
        },
        update_password_submit() {
            // console.log('update_password_submit');
            let pwHash = crypto.createHash('md5').update(this.curPassword).digest('base64');
            // console.log(this.curPasswordHash)
            if (pwHash !== this.curPasswordHash) {
                alert('현재 비밀번호가 틀렸습니다.');
            }

            let newpwHash = crypto.createHash('md5').update(this.newPassword_check).digest('base64');
            console.log(newpwHash)

            axios({
                validateStatus: function (status) {
                    // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                    return status < 500;
                },
                method: 'put',
                url: 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/UserInfos/' + this.curUserEmail.replace('@', '_').replace('.', '_'),
                headers: {
                    'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                    'X-M2M-Origin': 'SVue',
                    'Content-Type': 'application/json;ty=3'
                },
                data: {
                    'm2m:cnt': {
                        lbl: [newpwHash]
                    }
                }
            }).then(
                (res) => {
                    if (res.status === 200) {
                        console.log('패스워드 변경 성공');
                        this.editPWFlag = false;
                        this.curPassword = '';
                        this.newPassword = '';
                        this.newPassword_check = '';
                    } else {
                        console.log('사용자 조회 오류');
                    }
                }
            ).catch(
                (err) => {
                    console.log(err)
                }
            );
        }
    },
    mounted() {
        this.retrievedUsers();
    }
}
</script>

<style scoped>

</style>
