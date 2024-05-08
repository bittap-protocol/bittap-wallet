<template>
    <div class="select-gas">
        <div class="box">
            <div class="label">
                Gas:
            </div>
            <div class="choose">
                <div v-for="(item, index) in categories" :key="index" class="item" @click="value = item.gas">
                    <div>{{ item.name }}</div>
                    <div>{{ item.gas }} sat</div>
                </div>
            </div>
            <div class="custom">

            </div>
        </div>
        <div class="sb">
            <input :value="value" class="input" type="number" min="1" placeholder="Custom gas fee"
                @input="$emit('update:value', $event.target.value)" />
            <div class="badge badge-primary sat">Sats</div>
            <div class="fee">

                <span>≈$0.00</span>
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
        }, 1000*30)
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
<style lang="scss" scoped>
.select-gas{
    @apply w-full py-2;
    .box{
        @apply w-full flex flex-row justify-start items-center;
        .label {
            @apply pr-10;
        }
        .choose {
            @apply flex flex-row justify-center items-center my-2;
            .item {
                @apply flex flex-col justify-between items-center px-2 text-center rounded border border-gray-300 mx-1 border-solid hover:border-primary;
                &:hover {
                    @apply cursor-pointer bg-primary text-white;
                }
            }
        }
        
    }
    .sb{
        @apply w-full flex flex-row flex-nowrap justify-between items-center rounded-sm bg-white border border-solid border-gray-100 px-2;
        .input{
            @apply w-2/5 rounded-md border-0 py-1.5 text-gray-900 outline-none ring-0 rating-hidden bg-transparent shadow-none placeholder:text-gray-400;
            &:hover, &:focus, &:focus-within {
                @apply ring-0 outline-none;
            }
        }
        .sat{
            @apply text-white;
        }
        .fee{
            @apply w-2/5 text-right;
        }
    }
}
</style>