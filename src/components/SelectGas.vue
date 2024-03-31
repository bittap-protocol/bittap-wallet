<template>
    <div class="w-full py-2">
        <div class="w-full flex flex-row justify-start items-center">
            <div class="label pr-10">
                Gas: 
            </div>
            <div class="flex flex-row justify-center items-center my-2">
                <div v-for="(item, index) in categories" :key="index" class="flex flex-col justify-between items-center  px-2 text-center rounded border border-gray-300 mx-1 border-solid hover:border-sky-400 hover:cursor-pointer" 
                    @click="value = item.gas">
                    <div>{{ item.name }}</div>
                    <div>{{ item.gas }} sat</div>
                </div>
            </div>
            <div class="custom">

            </div>
        </div>
        <div class="join w-full">
            <label class="join-item input input-bordered flex items-center gap-2 border-0 outline-0 focus:border-0 focus:outline-0">
                <input :value="value" class="grow border-0 outline-0 focus:border-0 focus:outline-0 focus-within: border-0 focus-within: outline-0 focus-visible:border-0 focus-visible:outline-0" type="number" min="1" placeholder="Custom gas fee" @input="$emit('update:value', $event.target.value)" />
                <span class="badge badge-info">Sats</span>
            </label>
            <div class="join-item  flex flex-row justify-center items-center">
                0.22 USD
            </div>
        </div>
    </div>
    
</template>

<script lang="ts">
import { getGas } from '@/popup/api/btc/blockStream'

export default {
    name: 'SelectGas',
    props: {
      // eslint-disable-next-line vue/require-default-prop
      value: Number
    },
    // props: ['value'], 
    data() {
        return {
            categories: [
                { name: 'Low', key: 'economyFee', gas: 0 },
                { name: 'Eco', key: 'halfHourFee', gas: 0 },
                { name: 'Fast', key: 'fastestFee', gas: 0 },
            ],
            timer: null
        }
    },
    watch: {
        value: function(k, v) {
            // @ts-ignore
            if(k!=v && this.value > 0) {
                // @ts-ignore
                console.log('value on value:', this.value, k, v)
                this.$emit('update:value', this.value);
            }
        }
    },
    created(){
        console.log('SelectGas created', this.value)
        // @ts.ignore
        // this.value = this.value;
        this.initGasPrice()
        // @ts-ignore
        this.timer = setInterval(() => {
            this.initGasPrice()
        }, 1000*10)
    },
    beforeUnmount() {
        console.log('SelectGas beforeUnmount')
        if(this.timer) {
            clearInterval(this.timer)
            this.timer = null
        }
    },
    methods: {
        selectCate() {
            // @ts-ignore
            this.$emit('update:value', this.value);
            // this.value = item.gas
        },
        initGasPrice(){
            // @ts-ignore
            getGas().then(res => {
                if(!res) {
                    console.error('get gas data failed', res)
                    return 
                }
                
                const { economyFee, halfHourFee, fastestFee } = res
                console.log('getGas res: ', res, economyFee, halfHourFee, fastestFee)
                this.categories[0].gas = economyFee
                this.categories[1].gas = halfHourFee
                this.categories[2].gas = fastestFee
            })
        },
    }
}
  </script>