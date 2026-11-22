import { mount } from 'cypress/vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import { IonicVue } from '@ionic/vue'

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css'
import '@ionic/vue/css/normalize.css'
import '@ionic/vue/css/structure.css'
import '@ionic/vue/css/typography.css'
import '@ionic/vue/css/padding.css'
import '@ionic/vue/css/float-elements.css'
import '@ionic/vue/css/text-alignment.css'
import '@ionic/vue/css/text-transformation.css'
import '@ionic/vue/css/flex-utils.css'
import '@ionic/vue/css/display.css'

import '../../src/theme/variables.css'

type MountParams = Parameters<typeof mount>

declare global {
  namespace Cypress {
    interface Chainable {
      mount(component: MountParams[0], options?: MountParams[1]): Chainable
    }
  }
}

Cypress.Commands.add('mount', (component, options = {}) => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/:pathMatch(.*)*', component: { template: '<div />' } }],
  })
  options.global = options.global || {}
  options.global.plugins = [
    [IonicVue, { animated: false }],
    router,
    ...(options.global.plugins || []),
  ]
  return mount(component, options)
})