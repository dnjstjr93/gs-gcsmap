<template>
<!--    <v-container style="width: 450px">-->
    <v-container class="mt-4">
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
                                </v-icon>Back
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
                            show-select
                            class="elevation-1"
                            :footer-props="{
                                'items-per-page-text': '페이지 당 사용자 수',
                            }"
                        >
                            <template v-slot:item.edit="{ item }">
                                <v-btn dark x-small color="green" @click.stop="editUseremail(item.email)">
                                    <v-icon small>$pencil</v-icon>
                                </v-btn>
                            </template>
                            <template v-slot:item.delete="{ item }">
                                <v-btn dark x-small color="red" @click.stop="removeUseremail(item.email)">
                                    <v-icon small>$delete</v-icon>
                                </v-btn>
                            </template>
                        </v-data-table>
                    </div>
                </v-card>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
import axios from "axios"

export default {
    name: "account-administrator",
    data: () => ({
        isError: false,
        errorMsg: "",
        curUsers: [],
        headers: [
            {text: 'E-mail', value: 'email'},
            {text: '삭제', value: 'delete'}
        ],
        selected:[]
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
                    if(res.status === 200) {
                        console.log('Users retrieve success');
                        let Users = res.data["m2m:uril"];
                        Users.forEach((user)=>{
                            let cur_user = user.split('/')[2].replace('_','@').replace('_', '.');
                            this.curUsers.push({'email':cur_user, 'delete':''});
                        });
                    }
                    else {
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
        editUseremail(user) {
            console.log('editUseremail -', user);
            let cntName = user.replace('@','_').replace('.', '_');
            console.log(cntName);
            // TODO:
        },
        removeUseremail(user) {
            console.log('removeUseremail -', user);
            let cntName = user.replace('@', '_').replace('.', '_');

            for(var i = 0; i < this.curUsers.length; i++){
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
        }
    },
    mounted() {
        this.retrievedUsers();
    }
}
</script>

<style scoped>

</style>
