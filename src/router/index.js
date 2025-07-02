import { createRouter, createWebHistory } from 'vue-router'
import BookshelfView from '../views/BookshelfView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'bookshelf',
      component: BookshelfView,
    },
    {
      path: '/book/:id',
      name: 'book-read',
      component: () => import('../views/BookReadView.vue'),
      props: true,
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/AdminView.vue'),
    },
    {
      path: '/admin/book/new',
      name: 'book-new',
      component: () => import('../views/BookEditView.vue'),
    },
    {
      path: '/admin/book/:id/edit',
      name: 'book-edit',
      component: () => import('../views/BookEditView.vue'),
      props: true,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
  ],
})

export default router
