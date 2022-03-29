<template>
  <q-page class="q-gutter-sm q-pa-xl">
    <q-card class="q-pa-md q-mx-none">
        <q-card-section horizontal>
          <q-card-section class="col q-ma-none q-pa-none">
            <q-card-section class="text-h4">
                Statistics
            </q-card-section>
            <q-card-section class="flex flex-center">
              <div class="text-h2" style="opacity:.4">
                Coming Soon
              </div>
            </q-card-section>
          </q-card-section>

          <q-separator vertical />

          <q-card-actions vertical class="q-px-md">
              <q-btn icon="refresh" color="primary" :loading="dataLoading" disabled >
                <q-tooltip content-style="font-size: 1rem;">
                  {{ $t('Reload') }}
                </q-tooltip>
              </q-btn>
          </q-card-actions>

        </q-card-section>
    </q-card>
    <q-card class="q-pa-md q-mx-none">
        <q-card-section horizontal>
          <q-card-section class="col q-ma-none q-pa-none">
            <div class="q-pa-md q-gutter-sm">
              <q-editor v-model="editor" min-height="5rem" />

              <q-card flat bordered>
                <q-card-section>
                  <pre style="white-space: pre-line">{{ editor }}</pre>
                </q-card-section>
              </q-card>

              <q-card flat bordered>
                <q-card-section v-html="editor" />
              </q-card>

              <q-card flat bordered>
                <q-card-section>
                  <pre style="white-space: pre-line">{{ editorAsMd }}</pre>
                </q-card-section>
              </q-card>

              <q-card flat bordered>
                <q-card-section>
                  <pre style="white-space: pre-line">{{ mdAsHtml }}</pre>
                </q-card-section>
              </q-card>

              <form
                autocorrect="off"
                autocapitalize="off"
                autocomplete="off"
                spellcheck="false"
              >
                <q-editor
                  v-model="editorTwo"
                  min-height="5rem"
                  @paste.native="evt => console.log(evt)"
                  @drop.native="evt => console.log(evt)"
                />
                  <!-- @paste.native="evt => pasteCapture(evt)"
                  @drop.native="evt => dropCapture(evt)" -->
              </form>

              <form
                autocorrect="off"
                autocapitalize="off"
                autocomplete="off"
                spellcheck="false"
              >
                <q-editor
                  ref="editor_ref"
                  @paste.native="evt => pasteCapture(evt)"
                  v-model="editor"
                ></q-editor>
              </form>
            </div>
          </q-card-section>

          <q-separator vertical />

          <q-card-actions vertical class="q-px-md">
              <q-btn icon="refresh" color="primary" :loading="dataLoading" disabled >
                <q-tooltip content-style="font-size: 1rem;">
                  {{ $t('Reload') }}
                </q-tooltip>
              </q-btn>
          </q-card-actions>

        </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import mixinSharedDarkMode from 'src/mixins/mixin-Shared-DarkMode'
// import { NodeHtmlMarkdown, NodeHtmlMarkdownOptions } from 'node-html-markdown'
import { NodeHtmlMarkdown } from 'node-html-markdown'
import { marked } from 'marked'

const nhm = new NodeHtmlMarkdown(
  /* options (optional) */ {
    keepDataImages: true
  },
  /* customTransformers (optional) */ undefined,
  /* customCodeBlockTranslators (optional) */ undefined
)

export default {
  name: 'PageStats',
  mixins: [
    mixinSharedDarkMode // Shared computed to access and update the DarkMode
  ],
  data () {
    return {
      dataLoading: false,
      editor: '<p>t<strong>on</strong>y</p><p><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADYAAAAwCAYAAABaHInAAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAQJSURBVGhD7ZnPi9NoGMe/yWGXUVlRUBRMZhiW3GbwHtow4yV41dOUOcjm0NkVL4IwRZARacSLIKI9VASH1D9AhF522LYU9uLJW5DZabsH2QV/LKvixfo+b95k0k5S+8NxzJAPvOR9n7cl+eZ9njftN9Lc3Oku9iGyOO47UmFJQ5qfn09rLEmkwpJGKixpJEiYhG5XDhqNB5EIYSTk4NSPvN94YPEjjT2B0SRAmIRDB37Ao+vnMPfzCR6ZPnmYj08d/6lnFcNNOn/vebe8pPAvcJpFZFerYrD30EUSJOrGr2dw9PAU/n39Dnce/4k/nv3F5+7fv8uPYaQ3b552i9lV+FJMu44Cvh9xJMxPPyLzS3nHOFLYFfaTqleChrxzDVjLoeSK0B7irxil3+3LZ3HsyEG8evsBV+/9jucvXvK5fkiovHNdXGy1FWQWNdY3Ydcd5KnL6RtreTj1Ouq82WyW8D5j2w6LOXCcOmxvwsO0UXfyYjAMXV5jJIrSjyBRlJaDiNw8Nlsd0RsEE1DOoGFlkc2yVgSWA8UK1NYai+eQW29CN7aVmYaO5npJjL6MxHb1/99/xKVbT4OaopX67eYT3o9j/F1Rm4HKBCyVxYoVdCjTs2Kyg8aGyONqDU3dCFbTUCt4OFL5drm4v//5j4+opgh/HIcczhIPDYsZ9rzwL2wgTRRptfwWueFU8bCi8tXU8stQGxss2UfF+2dFtRO1UUQhF1i+ByXEN44yltrrYuPYRKujIFgI04AuunC30Gaj7fSLx91osFt9AReGvmGTI1uNDMrBBsBEKR1UglxxUaIaKYh5g9bIp4pVqwKWi+K7rPXsEiHcEtbbOvTghu0+O/9B005XXmLVwwRaX2/Lp+ejUcti3Mcjbft+Gq6sXOTHOOhz38YaoJvFH42lMerLIyxsGHb5tyLVLEtReiysjS9qHBJj5vi/QIZll1fs6yFJn0ZqiRE2KqmwpJEKSxrp+7GkIS0sLOzLFUtfIyWNVFjSSIUljQiXqh8Tdo/h0w8ZpMLz6PE9hon7JquAzFQx5wxhEg1CLsQZMAwtT25uYduZisI0gKJvwVmoqMueUxwTN+1CELcqKoLzkyg+5c3lJjRb5I46E7sabimHrFVBjy/Mbe2QzV1dDRk0s5hW2tiia4qMmzD0JmoiTracf37TUFGxtl+OTIrcVqbZaSdFeBt1A7XQm5v4uIC8SX5+EhxylVkbkEhDMfrm4ZaQy/bbci5KOUqhGoyelxhx8ShCrjLLErXQV38jIqudFjbFYHKqqDVDznFATJz8/6jzuxtodFTMDLwRg5GV9pZni/HaGeIu9dWYlrdDK0Ep1UGLXWl0nATq8F++aIsZeOf34oFdri0i49fqWACfAVo34DeX8DcwAAAAAElFTkSuQmCC" alt=""> </p><p>wggrg</p>',
      editorTwo: ''
    }
  },
  computed: {
    editorAsMd () {
      return nhm.translate(this.editor)
    },
    mdAsHtml () {
      return marked.parse(this.editorAsMd)
    }
  },
  methods: {
    pasteCapture (evt) {
      console.log('pasteCapture')
      console.log(JSON.stringify(evt))

      // Let inputs do their thing, so we don't break pasting of links.
      if (evt.target.nodeName === 'INPUT') return
      let text, onPasteStripFormattingIEPaste
      evt.preventDefault()
      if (evt.originalEvent && evt.originalEvent.clipboardData.getData) {
        text = evt.originalEvent.clipboardData.getData('text/plain')
        this.$refs.editor_ref.runCmd('insertText', text)
      } else if (evt.clipboardData && evt.clipboardData.getData) {
        text = evt.clipboardData.getData('text/plain')
        const png = evt.clipboardData.getData('image/png')
        console.log('png')
        console.log(JSON.stringify(png))
        console.log(evt.clipboardData.types)
        const file = evt.clipboardData.getData('Files')
        console.log('file')
        console.log(JSON.stringify(file))
        console.log(file)
        this.$refs.editor_ref.runCmd('insertText', text)
      } else if (window.clipboardData && window.clipboardData.getData) {
        if (!onPasteStripFormattingIEPaste) {
          onPasteStripFormattingIEPaste = true
          this.$refs.editor_ref.runCmd('ms-pasteTextOnly', text)
        }
        onPasteStripFormattingIEPaste = false
      }
    },
    dropCapture (evt) {
      console.log('dropCapture')
      console.log(evt)
      //
    }
  },
  mounted () {
    this.editorTwo = marked.parse(this.editorAsMd)
  },
  watch: {
    editor: {
      handler () {
        this.editorTwo = marked.parse(this.editorAsMd)
      },
      deep: false
    }
  }
}
</script>
