<template>
  <q-page class="flex flex-center">
      <div class="text-h2" style="opacity:.4">
        Nothing here yet...
      </div>
  </q-page>
</template>

<script>
import mixinSharedLoadCollectorsAndPipelines from 'src/mixins/mixin-Shared-LoadCollectorsAndPipelines'

export default {
  mixins: [
    mixinSharedLoadCollectorsAndPipelines // Shared functions to load the Collectors and Pipelines
  ]
}
</script>

<style>

</style>
