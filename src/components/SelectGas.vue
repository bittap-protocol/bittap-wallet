<template>
  <div class="select-gas">
    <div class="box">
      <div class="label">Gas:</div>
    </div>
    <button
      class="checkBtn"
      @click="showGasDialog"
    >
      <div class="show">
        {{ showCate }}
      </div>
      <div class="arrow">
        <span>{{ modelValue }} SATS</span>
        <IconamoonArrowDown2Fill></IconamoonArrowDown2Fill>
      </div>
    </button>
    <div class="sb hidden">
      <input
        class="input"
        :value="modelValue"
        type="number"
        min="1"
        placeholder="Custom gas fee"
        @input="$emit('update:modelValue', Number($event.target.value))"
      />
      <div class="badge badge-primary sat">Sats</div>
    </div>
  </div>

  <dialog
    :id="dialogId"
    class="modal rounded-sm"
  >
    <div class="modal-box dialog">
      <form method="dialog">
        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
          ✕
        </button>
      </form>
      <h3 class="font-bold text-lg text-center">Select Gas</h3>

      <div class="cb">
        <div
          role="tablist"
          class="tabs tabs-bordered"
        >
          <a
            role="tab"
            :class="['tab', tabActive === 'Recommend' ? 'tab-active' : '']"
            @click="tabActive = 'Recommend'"
          >
            Recommend
          </a>
          <a
            role="tab"
            :class="['tab', tabActive === 'Custom' ? 'tab-active' : '']"
            @click="tabActive = 'Custom'"
          >
            Custom
          </a>
        </div>
        <div
          v-if="tabActive === 'Recommend'"
          class="choose"
        >
          <label
            v-for="(item, index) in categories"
            :key="index"
            :class="['item', selectedCate === item.name ? 'active' : '']"
            @click="setFormDataGas(item)"
          >
            <div class="iconInfo">
              <Fast v-if="item.name === 'Fast'"></Fast>
              <Slow v-if="item.name === 'Slow'"></Slow>
              <Medium v-if="item.name === 'Medium'"></Medium>
              <div class="info">
                <div class="name">{{ item.name }}</div>
                <div class="gas">{{ item.gas }} sat</div>
              </div>
            </div>

            <div class="ch">
              <input
                type="checkbox"
                :value="item.name"
                :checked="item.name === showCate"
                class="checkbox checkbox-primary"
                @change="onChangeHandle(item)"
              />
            </div>
          </label>
        </div>
        <div
          v-if="tabActive === 'Custom'"
          class="custom"
        >
          <div class="name">SATS</div>
          <input
            v-model="formDataGas"
            class="field"
            type="number"
            min="1"
            placeholder="Enter sats"
          />
        </div>
      </div>
      <div class="dialog-actions">
        <button
          class="btn btn-primary"
          @click="setGasConfirm"
        >
          Confirm
        </button>
      </div>
    </div>
  </dialog>
</template>

<script lang="ts">
// @ts-ignore
import IconamoonArrowDown2Fill from '~icons/iconamoon/arrow-down-2-fill'
import { randomInt } from '@/popup/libs/tools'
// @ts-ignore
import Fast from './svgIcon/Fast.vue'
// @ts-ignore
import Slow from './svgIcon/Slow.vue'
// @ts-ignore
import Medium from './svgIcon/Medium.vue'
import { useAppStore, Fees } from '@/stores/app.store'

export default {
  name: 'SelectGas',
  components: {
    IconamoonArrowDown2Fill,
    Fast,
    Slow,
    Medium,
  },
  props: {
    modelValue: Number,
  },
  emits: ['update:modelValue'],
  setup(){
    const store = useAppStore()
    return {
      store
    }
  },
  data() {
    return {
      categories: [
        { name: 'Fast', key: 'fastestFee', gas: 0 },
        { name: 'Medium', key: 'halfHourFee', gas: 0 },
        { name: 'Slow', key: 'economyFee', gas: 0 },
      ],
      selectedCate: '',
      timer: null,
      formDataGas: 0,
      tabActive: 'Recommend',
      dialogId: '',
    }
  },
  computed: {
    // @ts-ignore
    showCate() {
      // @ts-ignore
      return this.showCateName()
    },
  },
  watch: {
    modelValue: function (k, v) {
      // @ts-ignore
      if (k != v && this.modelValue > 0) {
        // @ts-ignore
        console.log('value on value:', this.value, k, v)
        // @ts-ignore
        this.$emit('update:modelValue', Number(this.modelValue))
      }
    },
  },
  created() {
    this.dialogId = ['modal_select_gas', Date.now(), randomInt(1, 1000)].join(
      '_'
    )
    this.initGasPrice()
    // @ts-ignore
    this.timer = setInterval(() => {
      this.initGasPrice()
    }, 1000 * 30)
  },
  beforeUnmount() {
    console.log('SelectGas beforeUnmount')
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  },
  methods: {
    showGasDialog() {
      // @ts-ignore
      document.getElementById(this.dialogId).showModal()
    },
    onChangeHandle(item: {name: string, gas: number}){
      this.selectedCate = item.name; 
      this.formDataGas = item.gas
    },
    // @ts-ignore
    showCateName() {
      if (this.tabActive === 'Recommend') {
        return this.selectedCate
      } else {
        return 'Custom'
      }
    },
    // @ts-ignore
    setFormDataGas({ gas }) {
      // @ts-ignore
      this.formDataGas = gas
    },
    setGasConfirm() {
      console.log('this.selectedCate: ', this.selectedCate)
      // @ts-ignore
      this.$emit('update:modelValue', this.formDataGas)
      // @ts-ignore
      document.getElementById(this.dialogId).close()
    },
    // @ts-ignore
    selectCate(item) {
      // this.modelValue = item.gas
      // @ts-ignore
      this.$emit('update:modelValue', item.gas)
    },
    initGasPrice() {
      this.store.getGasFees().then((res: Fees) => {
        if (!res) {
          console.error('get gas data failed', res)
          return
        }
        for (const [key, value] of Object.entries(res)) {
          const r = this.categories.find((x) => x.key === key)
          if (r) {
            // @ts-ignore
            r.gas = value
            if (Number(this.formDataGas) === 0 && key === 'halfHourFee' && this.selectedCate === '') {
              // @ts-ignore
              this.formDataGas = value
              this.selectedCate = 'Medium'
              this.$emit('update:modelValue', this.formDataGas)
            }
          }
        }
      })
    },
  },
}
</script>
<style lang="scss" scoped>
.select-gas {
  @apply w-full py-0;
  .box {
    @apply w-full flex flex-row justify-start items-center;
    .label {
      @apply pr-10 text-black text-sm leading-snug font-normal;
    }
  }
  .checkBtn {
    @apply w-full flex flex-row flex-nowrap justify-between items-center rounded-2xl border-0 p-4 mb-4 text-gray-900 shadow-sm ring-[1px] ring-inset ring-gray-100 placeholder:text-gray-400 focus:ring-[1px] focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6;
    .show {
      @apply font-normal;
    }
    .arrow {
      @apply flex flex-row flex-nowrap justify-center items-center;
    }
  }
}
.dialog {
  @apply w-11/12 rounded-xl bg-white px-4 py-2;
  height: 500px;
  .cb {
    @apply flex flex-col flex-nowrap justify-start items-center py-3 w-full overflow-y-auto overflow-x-hidden;
    height: 400px;
    .tabs {
      @apply mb-4 w-full;
      .tab-active {
        @apply border-primary;
      }
    }
    .choose {
      @apply w-full flex flex-col flex-nowrap justify-between items-center p-1;
      .item {
        @apply w-full flex flex-row flex-nowrap justify-between items-center rounded-2xl border-0 p-4 mb-4 text-gray-900 shadow-md ring-1 ring-inset ring-gray-100;
        &.active {
          box-shadow: 0px 2px 16px rgba(0, 0, 0, 0.06);
          border-radius: 16px;
        }
        .iconInfo {
          @apply flex flex-row justify-normal items-center space-x-2;
          .info {
            .name {
              @apply font-medium;
            }
            .gas {
              @apply text-gray-400;
            }
          }
        }
        .ch {
          .checkbox {
            @apply rounded-full;
          }
        }
      }
    }
    .custom {
      @apply w-full py-4 px-2;
      .name {
        @apply mb-4;
      }
      .field {
        @apply rounded-2xl border-0 p-4;
        filter: drop-shadow(0px 2px 16px rgba(0, 0, 0, 0.06));
      }
    }
  }
  .dialog-actions {
    @apply flex flex-col justify-between items-stretch space-y-1 w-full;
  }
}
</style>
