import { withKnobs } from '@storybook/addon-knobs'
import camelCase from 'licia/camelCase'
import spaceCase from 'licia/spaceCase'
import map from 'licia/map'
import h from 'licia/h'
import waitUntil from 'licia/waitUntil'
import isArr from 'licia/isArr'
import contain from 'licia/contain'
import upperFirst from 'licia/upperFirst'
import extend from 'licia/extend'
import { addReadme } from 'storybook-readme/html'
import each from 'licia/each'
import addons from '@storybook/addons'
import now from 'licia/now'
import ReactDOM from 'react-dom'
import * as registerKnobs from '@storybook/addon-knobs/dist/registerKnobs'
import { optionsKnob } from '@storybook/addon-knobs'

export default function story(
  name,
  storyFn,
  {
    readme,
    changelog = '',
    source,
    layout = 'padded',
    themes = {},
    ReactComponent = false,
  } = {}
) {
  const container = h('div')

  if (changelog) {
    readme += `\n## Changelog\n${changelog.replace(/## /g, '### ')}`
  }

  const ret = {
    title: map(spaceCase(name).split(' '), upperFirst).join(' '),
    decorators: [withKnobs, addReadme],
    parameters: {
      knobs: {
        escapeHTML: false,
      },
      readme: {
        sidebar: readme,
      },
      storySource: {
        source,
      },
      layout,
    },
    [camelCase(name)]: () => {
      fixKnobs(name)

      waitUntil(() => container.parentElement).then(() => {
        const theme = optionsKnob(
          'Theme',
          extend(
            {
              Light: 'light',
              Dark: 'dark',
            },
            themes
          ),
          'light',
          {
            display: 'select',
          }
        )

        const story = storyFn(container)
        if (isArr(story)) {
          window.components = story
        } else {
          window.components = [story]
        }
        window.component = window.components[0]
        window.componentName = upperFirst(camelCase(name))

        document.documentElement.style.background = contain(theme, 'dark')
          ? '#000'
          : '#fff'
        each(window.components, (component) =>
          component.setOption('theme', theme)
        )
      })

      return container
    },
  }

  if (ReactComponent) {
    const container = h('div')

    ret.react = function () {
      fixKnobs(`react-${name}`)

      window.components = []
      delete window.component
      window.componentName = upperFirst(camelCase(`react-${name}`))

      ReactDOM.render(<ReactComponent />, container)

      return container
    }
  }

  return ret
}

function fixKnobs(name) {
  if (window.components) {
    const lastComponentName = window.componentName
    if (upperFirst(camelCase(name)) !== lastComponentName) {
      // Fix knobs not reset when story changed.
      const knobStore = registerKnobs.manager.knobStore
      knobStore.reset()
      addons.getChannel().emit('storybookjs/knobs/set', {
        knobs: knobStore.getAll(),
        timestamp: now(),
      })
    }
    each(window.components, (component) => component.destroy())
  }
}
