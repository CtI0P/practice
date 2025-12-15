import Vue from 'vue'
import VueRouter from 'vue-router'
import LoginPage from '../components/LoginPage.vue'
import ForgotPasswordPage from '../components/ForgotPasswordPage.vue'

Vue.use(VueRouter)

const routers=[
    {
        path:'/',
        name:'Login',
        component:LoginPage
    },
    {
        path:'/forgot-password',
        name:'ForgotPassword',
        component:ForgotPasswordPage
    }
]

const router=new VueRouter({
    mode:'history',
    base:process.env.BASE_URL,
    routers
})

export default router