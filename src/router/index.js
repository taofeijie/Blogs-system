import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import Blogs from '@/components/Blogs'
import Register from '@/components/Register'
import Release from '@/components/Release'
import BlogDetail from '@/components/BlogDetail'
import Game from '@/components/Game'
import BlogsManager from '../components/BlogsManager'
import PersonInfo from '@/components/PersonInfo'
import PersonInfoInfo from '@/components/PersonInfo/PersonInfo_info'
import PersonInfoAccount from '@/components/PersonInfo/PersonInfo_account'
import PersonInfoPrivecy from '@/components/PersonInfo/PersonInfo_privecy'
import PersonInfoFavorite from '@/components/PersonInfo/PersonInfo_favorite'

// import App from '@/App'

Vue.use(Router)

export default new Router({
  routes: [
    {
      'path': '/helloWorld',
      name: 'helloWorld',
      components: {
        theme: HelloWorld
      }
    },
    {
      path: '/',
      name: 'home',
      redirect: '/blogs/all',
      components: {
        theme: Blogs
      }
    },
    {
      path: '/blogs/:title',
      name: 'blogsById',
      components: {
        theme: Blogs
      }
    },
    {
      path: '/release',
      name: 'release',
      components: {
        theme: Release
      }
    },
    {
      path: '/detail/:id',
      name: 'blogDetail',
      components: {
        theme: BlogDetail
      }
    },
    {
      path: '/game',
      name: 'game',
      components: {
        theme: Game
      }
    },
    {
      path: '/blogsManager',
      name: 'blogsManager',
      components: {
        theme: BlogsManager
      }
    },
    {
      path: '/register',
      name: 'register',
      components: {
        theme: Register
      }
    },
    {
      path: '/personInfo',
      name: 'personInfo',
      components: {
        theme: PersonInfo
      },
      children: [
        {
          path: 'info',
          name: 'personInfo_info',
          components:
            {
              personInfo: PersonInfoInfo
            }
        },
        {
          path: 'account',
          name: 'personInfo_account',
          components: {
            personInfo: PersonInfoAccount
          }
        },
        {
          path: 'privecy',
          name: 'personInfo_privecy',
          components: {
            personInfo: PersonInfoPrivecy
          }
        },
        {
          path: 'favorite',
          name: 'personInfo_favorite',
          components: {
            personInfo: PersonInfoFavorite
          }
        }
      ]
    }
  ]
})
