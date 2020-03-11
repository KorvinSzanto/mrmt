<template>
<div class="page w-full mx-auto">
  <div class="flex flex-col w-full h-full">
    <div class="content px-4 py-4 h-full">
      <h2>Basic Start</h2>
      <ul class='list-disc list-inside'>
        <li>Rescue Key: <span class="font-bold font-mono">{{rescueKey.join('-')}}</span></li>
        <li>Password: <span class="font-bold font-mono">{{password}}</span>
        <li v-if="identity.length">IUK: <span class="font-bold font-mono">{{identity}}</span></li>
        <li v-if="access.length">IAK: <span class="font-bold font-mono">{{access}}</span></li>
        <li v-if="textual.length">Textual: <span class="font-bold font-mono">{{textual}}</span></li>
        <li v-if="salt.length">Salt: <span class="font-bold font-mono">{{salt}}</span></li>
        <li v-if="rawUnlock.length">Raw Unlock Key: <span class="font-bold font-mono">{{rawUnlock}}</span></li>
        <li v-if="generating">Generating Identity: <span class="font-bold font-mono">{{counter}}</span></li>
      </ul>
    </div>
    <div class="bottom-bar p-10 bg-gray-100 border-t-2 border-gray-200 w-full">
      <button :disable={generating} class="float-right bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded" v-on:click="generateIdentity()">
        {{!generating ? 'Generate Identity' : 'Generating Identity'}}
      </button>
    </div>
  </div>
</div>
</template>
<script>
import crypt from '../../../crypt/crypt'
import base64js from 'base64-js'

export default {
  data: () => ({
    rescueKey: [],
    identity: '',
    access: '',
    textual: '',
    rawUnlock: '',
    salt: '',
    counter: '0%',
    generating: false,
    password: 'Zingo-Bingo-Slingo-Dingo'
  }),
  methods: {
    async generateIdentity() {
      this.generating = true

      let salt, rawIdentity

      // Uncomment to lock to specific values
      // this.rescueKey = '1198-8748-7132-2838-8318-7570'.split('-')
      // salt = base64js.toByteArray('WmrhWiOj+vLK7P1oY+dihA==')
      // rawIdentity = base64js.toByteArray('RARINOWDRB3/9PbvDnAjh6zDUCna0eq0vxTlczDiwVw=')

      const identity = await crypt.generateIdentity(this.rescueKey, this.password, salt, rawIdentity, (steps, total) => {
        this.counter = `${Math.round(steps / total * 100, 2)}%`
      })

      this.identity = base64js.fromByteArray(identity.unlock)
      this.access = base64js.fromByteArray(identity.access)
      this.salt = base64js.fromByteArray(identity.salt)
      this.rawUnlock = base64js.fromByteArray(identity.rawUnlock)
      this.textual = identity.textual

      this.generating = false
      this.counter = '0%'
    }
  },
  async created() {
    this.rescueKey = await crypt.generateRescueCode()
  }
}
</script>
<style>