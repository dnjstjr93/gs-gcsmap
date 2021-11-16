<template>
    <div>
        <DroneInfoList/>
        <GcsMap/>
    </div>
</template>

<script>
import GcsMap from "../components/GcsMap";
import DroneInfoList from "../components/DroneInfoList";

export default {
    name: 'Home',

    components: {
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
