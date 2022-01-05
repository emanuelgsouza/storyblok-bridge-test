function ready(fn) {
  if (document.readyState !== 'loading') {
    fn()
  } else {
    document.addEventListener('DOMContentLoaded', fn)
  }
}

function setup() {
  const client = new window.StoryblokClient({
    accessToken: import.meta.env.VITE_STORYBLOK_ACCESS_TOKEN,
    cache: {
      clear: 'auto',
      type: 'memory',
    },
  })

  window.Vue.component('message', {
    props: ['payloadEvent'],
    computed: {
      actionEvent() {
        return this.payloadEvent && this.payloadEvent.action
      },
    },
    template: `
      <div data-testid="testing-events" class="message">
        <h3> Submiting an event in the editor to view here </h3>
        <template v-if="payloadEvent">
          <p data-testid="event-action-name"> Event name: {{ actionEvent }} </p>
          <code data-testid="event-action-payload">
            {{ payloadEvent }}
          </code>
        </template>
      </div>
    `,
  })

  window.Vue.component('teaser', {
    props: ['blok'],
    template: `
      <div v-editable="blok" data-testid="teaser">
        <h1 class="text-lg">{{ blok.headline }}</h1>
      </div>
    `,
  })

  window.Vue.component('grid', {
    props: ['blok'],
    template: `
      <ul v-editable="blok" class="grid" data-testid="grid">
        <li
          :key="column._uid"
          v-for="column in blok.columns"
          class="column">
          <component :blok="column" :is="column.component" />
        </li>
      </ul>
    `,
  })

  window.Vue.component('BridgePage', {
    props: ['blok'],
    template: `
      <div v-editable="blok" data-testid="page">
        <h2>{{ blok.title }}</h2>
        <component
          v-for="bodyBlok in blok.body"
          :key="bodyBlok._uid"
          :blok="bodyBlok"
          :is="bodyBlok.component"
        />
      </div>
    `,
  })

  window.Vue.component('feature', {
    props: ['blok'],
    template: `
      <div v-editable="blok" class="feature" data-testid="feature">
        <strong>{{ blok.name }}</strong>
      </div>
    `,
  })

  window.Vue.component('BridgeGlobal', {
    props: ['blok'],
    template: `
      <div v-editable="blok" class="global" data-testid="global">
        <h2>{{ blok.title }}</h2>
        <component
          v-for="bodyBlok in blok.body"
          :key="bodyBlok._uid"
          :blok="bodyBlok"
          :is="bodyBlok.component"
        />
      </div>
    `,
  })

  // eslint-disable-next-line
  new Vue({
    el: '#root',

    data: {
      payloadEvent: null,
      story: {
        content: {
          body: [],
          component: 'bridge_page',
        },
      },
      global: {
        content: {
          component: 'bridge_global',
          title: '',
        },
      },
    },

    mounted() {
      window.storyblok.init({
        accessToken: import.meta.env.VITE_STORYBLOK_ACCESS_TOKEN,
        // customParent: 'http://localhost:3300',
      })

      window.storyblok.on('input', (payload) => {
        console.log('Listening to input event', payload)
        this.payloadEvent = payload

        const { story } = payload
        const enriched = window.storyblok.addComments(payload.story.content, payload.story.id)

        if (story.content.component === 'BridgeGlobal') {
          this.global = {
            content: enriched
          }
        } else {
          this.story = {
            content: enriched
          }
        }
      })

      // on change reload the draft version
      window.storyblok.on('change', (payload) => {
        console.log('Listening to change event', payload)
        this.payloadEvent = payload
        this.getStory('draft')
      })

      // Call ping editor to see if
      // we are in the editor
      // if not load the published version
      this.$nextTick(() => {
        this.ping()
      })
    },

    methods: {
      ping() {
        window.storyblok.pingEditor(() => {
          if (window.storyblok.isInEditor()) {
            this.getStory('draft')
            this.getStoryGlobal('draft')
          } else {
            this.getStory('published')
            this.getStoryGlobal('published')
          }
        })
      },

      getStory(version = 'draft') {
        return client
          .getStory('storyblok-bridge-example', { version })
          .then((response) => {
            const story = response.data.story || {}
            this.story = story

            this.$nextTick(() => {
              window.storyblok.enterEditmode()
            })
          })
      },

      getStoryGlobal(version = 'draft') {
        return client
          .getStory('storyblok-bridge-global', { version })
          .then((response) => {
            const story = response.data.story || {}
            this.global = story
          })
      },
    },
  })
}

ready(setup)
