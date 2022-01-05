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

  window.Vue.config.devtools = true

  // eslint-disable-next-line
  new Vue({
    el: '#root',

    data: {
      payloadEvent: null,
      story: {
        content: {
          body: [],
        },
      },
      global: {
        content: {
          title: '',
        },
      },
      storyblokInstance: null,
    },

    mounted() {
      /**
       * The main code is the same for each .js files 
       * Some things are little different because the differences between the
       * bridge versions.
       * 
       * Important note: The Storyblok App version 2 does not allow to use a
       * localhost env in production.
       */
      this.storyblokInstance = new window.StoryblokBridge({
        customParent: 'http://localhost:3300', // use this to start the bridge in the v2 application running in localhost
        // customParent: 'http://app.storyblok.com', // use this to start the bridge in the v1 application
        preventClicks: false,
      })

      this.storyblokInstance.on('input', (payload) => {
        console.log('Listening to input event', payload)
        this.payloadEvent = payload

        const storyData = payload.story

        
        if (storyData.content.component === 'BridgeGlobal') {
          console.log('storyData', storyData);
          this.global = storyData
        } else {
          this.story = storyData
        }
      })

      this.storyblokInstance.on('deselectBlok', (payload) => {
        console.log('Listening to deselect event', payload)
        this.payloadEvent = payload
      })

      // on change reload the draft version
      this.storyblokInstance.on('change', (payload) => {
        console.log('Listening to change event', payload)
        this.payloadEvent = payload
        this.getStory('draft')
      })

      this.storyblokInstance.on('customEvent', (payload) => {
        console.log('Listening to custom event', payload)
        this.payloadEvent = payload
        console.log(this)
      })

      this.storyblokInstance.on('unpublished', (payload) => {
        console.log('Listening to unpublished event', payload)
        this.payloadEvent = payload
      })

      // Call ping editor to see if
      // we are in the editor
      // if not load the published version
      this.storyblokInstance.pingEditor((payload) => {
        console.log('Listening to ping event', payload)
        this.payloadEvent = payload
        if (this.storyblokInstance.isInEditor()) {
          this.getStory('draft')
          this.getStoryGlobal('draft')
        } else {
          this.getStoryGlobal('published')
          this.getStory('published')
        }
      })
    },

    methods: {
      ping() {
        this.storyblokInstance.pingEditor(() => {
          if (this.storyblokInstance.isInEditor()) {
            this.getStory('draft')
            this.getStoryGlobal('draft')
          } else {
            this.getStoryGlobal('published')
            this.getStory('published')
          }
        })

        this.storyblokInstance.enterEditmode()
      },

      getStory(version = 'draft') {
        client
          .getStory('storyblok-bridge-example', { version })
          .then((response) => {
            const story = response.data.story || {}
            this.$nextTick(function () {
              this.story = story
            })
          })
      },

      getStoryGlobal(version = 'draft') {
        client
          .getStory('storyblok-bridge-global', { version })
          .then((response) => {
            const story = response.data.story || {}
            this.$nextTick(function () {
              this.global = story
            })
          })
      },
    },
  })
}

ready(setup)
