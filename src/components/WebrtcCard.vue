<template>
    <v-container>
        <v-row>
            <v-col cols="6">
                <div class="text-h6 mb-1">
                    Room
                </div>
                <v-text-field outlined v-model="roomId"></v-text-field>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12">
                <div class="">
                    <vue-webrtc ref="webrtc"
                                width="100%"
                                :roomId="roomId"
                                :device-id="null"
                                v-on:joined-room="logEvent"
                                v-on:left-room="logEvent"
                                v-on:opened-room="logEvent"
                                v-on:share-started="logEvent"
                                v-on:share-stopped="logEvent"
                                @error="onError" />
                </div>
                <v-row>
                    <v-col cols="12" class="my-3">
                        <v-btn color="primary mx-2" @click="onJoin">Join</v-btn>
                        <v-btn color="primary mx-2" @click="onLeave">Leave</v-btn>
                        <v-btn color="primary mx-2" @click="onCapture">Capture Photo</v-btn>
                        <v-btn color="primary mx-2" @click="onShareScreen">Share Screen</v-btn>
                    </v-col>
                </v-row>
            </v-col>
        </v-row>
        <v-row class="row">
            <v-col cols="12">
                <div class="text-h6 mb-1">
                    Captured Image
                </div>
                <v-img :src="img"></v-img>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
export default {
    name: "WebrtcCard",

    data() {
        return {
            img: null,
            roomId: "public-room-v2"
        };
    },

    methods: {
        onCapture() {
            this.img = this.$refs.webrtc.capture();
        },
        onJoin() {
            this.$refs.webrtc.join();
            console.log(this.$refs.webrtc);
        },
        onLeave() {
            this.$refs.webrtc.leave();
        },
        onShareScreen() {
            this.img = this.$refs.webrtc.shareScreen();
        },
        onError(error, stream) {
            console.log('On Error Event', error, stream);
        },
        logEvent(event) {
            console.log('Event : ', event);
        },
    }
}
</script>

<style scoped>

</style>