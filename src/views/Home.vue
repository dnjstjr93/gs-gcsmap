<template>
    <div>
        <GcsAppBar/>
        <DroneInfoList/>
        <GcsMap/>
    </div>
</template>

<script>

import GcsAppBar from "../components/GcsAppBar";
import GcsMap from "../components/GcsMap";
import DroneInfoList from "../components/DroneInfoList";

export default {
    name: 'Home',

    components: {
        GcsAppBar,
        GcsMap,
        DroneInfoList
    },

    created() {
        // console.log(document.cookie);
        // document.cookie.split(";").forEach((c) => {
        //     console.log(c);
        //     document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        // });
    }
}
</script>
