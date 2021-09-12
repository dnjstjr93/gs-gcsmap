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
}
</script>
