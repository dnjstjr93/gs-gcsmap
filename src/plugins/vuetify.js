import '@mdi/font/css/materialdesignicons.css' // Ensure you are using css-loader
import Vue from 'vue';
import Vuetify from 'vuetify/lib/framework';
import Icons from './icons'

Vue.use(Vuetify);

export default new Vuetify({
    icons: Icons,
});
