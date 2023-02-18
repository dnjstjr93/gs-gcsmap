import Vue from 'vue'
import VueRouter from 'vue-router'
import PureunAir from '../views/PureunAir.vue'

Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        name: 'PureunAir',
        component: PureunAir
    }
]

const router = new VueRouter({
    routes
})

export default router
