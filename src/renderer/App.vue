<template>
  <div id="app" class="flex flex-row h-full">
    <div class="inset-0 p-16 pt-5 h-full bg-gray-100 border-r-2 border-gray-200 lg:w-5 sm:w-auto flex-col flex relative">
      <a href="javascript:void">Home</a>
      <img src="@/assets/marmot.png" class='absolute bottom-0 left-0' />
    </div>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'mrmt'
}
</script>

<style>
  /* CSS */

</style>
