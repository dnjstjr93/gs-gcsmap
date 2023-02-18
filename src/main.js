import Vue from 'vue'
import App from './App.vue'
import store from './store'
import router from './router'
import vuetify from './plugins/vuetify'

import * as VueGoogleMaps from 'vue2-google-maps';
import VueCookies from "vue-cookies";

// import axios from "axios";
// import AxiosPlugin from 'vue-axios-cors';
//
// Vue.use(AxiosPlugin);
// axios.defaults.headers.common['Content-Type'] = 'application/x-www-form-urlencoded'
// axios.defaults.headers.common['Access-Control-Allow-Origin'] = '*';

//쿠키를 사용한다.
Vue.use(VueCookies);

//쿠키의 만료일은 7일이다. (글로벌 세팅)
Vue.$cookies.config("7d");

Vue.use(VueGoogleMaps, {
    load: {
        key: 'AIzaSyA7lKFAy2lRdfP2QFmaeqNN1ByDibrhg9U',
        //libraries: 'drawing', // This is required if you use the Autocomplete plugin
        // OR: libraries: 'places,drawing'
        // OR: libraries: 'places,drawing,visualization'
        // (as you require)

        //// If you want to set the version, you can do so:
        // v: '3.26',
        region: 'US',
        language: 'ko',
    },

    //// If you intend to programmatically custom event listener code
    //// (e.g. `this.$refs.gmap.$on('zoom_changed', someFunc)`)
    //// instead of going through Vue templates (e.g. `<GmapMap @zoom_changed="someFunc">`)
    //// you might need to turn this on.
    // autobindAllEvents: false,

    //// If you want to manually install components, e.g.
    //// import {GmapMarker} from 'vue2-google-maps/src/components/marker'
    //// Vue.component('GmapMarker', GmapMarker)
    //// then disable the following:
    installComponents: true,
    //autobindAllEvents: false
});

Vue.config.productionTip = false

new Vue({
    store,
    router,
    vuetify,
    render: h => h(App)
}).$mount('#app')
