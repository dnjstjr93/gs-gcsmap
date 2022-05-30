<template>
    <v-app>
        <v-main>
            <router-view></router-view>
            <!--            <DroneInfoList/>-->
            <!--            <GcsMap/>-->
        </v-main>
    </v-app>
</template>

<script>

export default {
    name: 'App',

    components: {
//        GcsAppBar,
        // GcsMap,
        // DroneInfoList
    },

    data: () => ({
        //
    }),
};
</script>
