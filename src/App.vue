<template>
    <v-app>
        <GcsAppBar/>

        <v-main>
            <router-view></router-view>
            <!--            <DroneInfoList/>-->
            <!--            <GcsMap/>-->
        </v-main>
    </v-app>
</template>

<script>

import GcsAppBar from "./components/GcsAppBar";

export default {
    name: 'App',

    components: {
        GcsAppBar,
        // GcsMap,
        // DroneInfoList
    },

    data: () => ({
        //
    }),
};
</script>
