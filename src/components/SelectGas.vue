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
        @input="$emit('update:modelValue', Number($event.target.value))"
        type="number"
        min="1"
        placeholder="Custom gas fee"
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
          class="choose"
          v-if="tabActive === 'Recommend'"
        >
          <label
            v-for="(item, index) in categories"
            :key="index"
            :class="['item', formDataGas === item.gas ? 'active' : '']"
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
                :checked="formDataGas === item.gas"
                class="checkbox checkbox-primary"
              />
            </div>
          </label>
        </div>
        <div
          class="custom"
          v-if="tabActive === 'Custom'"
        >
          <div class="name">SATS</div>
          <input
            class="field"
            v-model="formDataGas"
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
import { getGas } from '@/popup/api/btc/blockStream'
import { randomInt, showLoading } from '@/popup/libs/tools'
// @ts-ignore
import Fast from './svgIcon/Fast.vue'
// @ts-ignore
import Slow from './svgIcon/Slow.vue'
// @ts-ignore
import Medium from './svgIcon/Medium.vue'

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
  data() {
    return {
      categories: [
        { name: 'Fast', key: 'fastestFee', gas: 0 },
        { name: 'Medium', key: 'halfHourFee', gas: 0 },
        { name: 'Slow', key: 'economyFee', gas: 0 },
      ],
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
    console.log('SelectGas created', this.modelValue, this.dialogId)
    // this.gasValue = this.value
    // @ts.ignore
    // this.value = this.value;
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
    // @ts-ignore
    showCateName() {
      // @ts-ignore
      const isCate = this.getCate()
      if (isCate) {
        return isCate.name
      } else {
        return 'Custom'
      }
    },
    // @ts-ignore
    getCate() {
      // @ts-ignore
      return this.categories.find((x) => x.gas === Number(this.modelValue))
    },
    // @ts-ignore
    setFormDataGas({ gas }) {
      // @ts-ignore
      this.formDataGas = gas
    },
    setGasConfirm() {
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
      // @ts-ignore
      getGas().then((res) => {
        if (!res) {
          console.error('get gas data failed', res)
          return
        }
        for (const [key, value] of Object.entries(res)) {
          console.log('key, value: ', key, value)
          const r = this.categories.find((x) => x.key === key)
          if (r) {
            // @ts-ignore
            r.gas = value
            if (Number(this.formDataGas) === 0 && key === 'halfHourFee') {
              // @ts-ignore
              this.formDataGas = value
              this.$emit('update:modelValue', this.formDataGas)
            }
          }
        }
        // const { economyFee, halfHourFee, fastestFee } = res
        // console.log('getGas res: ', res, economyFee, halfHourFee, fastestFee)
        // this.categories[0].gas = economyFee
        // this.categories[1].gas = halfHourFee
        // this.categories[2].gas = fastestFee
      })
    },
  },
}
</script>
<style lang="scss" scoped>
.select-gas {
  @apply w-full py-2;
  .box {
    @apply w-full flex flex-row justify-start items-center;
    .label {
      @apply pr-10;
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
