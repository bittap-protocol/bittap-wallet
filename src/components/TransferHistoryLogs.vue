<template>
  <div
    v-if="logs.length > 0 && !loading"
    class="tr-logs"
  >
    <div
      v-for="tr in logs"
      :key="tr.tx_id"
      class="tr-item"
    >
      <div class="asset">
        <div class="dir-icon">
          <IconReceive v-if="tr.op_type == '1'"></IconReceive>
          <IconSend v-if="tr.op_type == '0'"></IconSend>
        </div>
        <div class="info">
          <div class="dir">
            {{ tr.op_type == '0' ? 'Send' : 'Receive' }}
          </div>
          <div class="time">
            {{ $root.formatTime(tr.timestamp * 1000) }}
          </div>
        </div>
      </div>
      <div class="amount">
        <div class="b">
          {{
            $root.formatToken(
              tr.amount,
              tr.asset_id === '' ? 6 : 0,
              tr.asset_id === '' ? 'BTC' : $root.showAssetName(tr.asset_id)
            )
          }}
        </div>
        <div
          v-if="tr.asset_id === ''"
          class="u"
        >≈${{ $root.formatToken($root.showUsdtBalance(tr.amount), 2) }}
        </div>
        <div
          v-else
          class="u"
        >≈${{
            $root.formatToken($root.showTokenBalance(tr.asset_id, tr.amount), 2)
          }}
        </div>
      </div>
    </div>
  </div>
  <div
    v-else
    class="tr-no-data"
  >
    <div
      v-if="!loading"
      class="flex flex-row justify-center items-center m-5"
    >
      <img
        src="@/assets/notrans.png"
        height="110"
        width="120"
      />
    </div>
  </div>
</template>

<script lang="ts">
// @ts-ignore
import IconReceive from '@/components/svgIcon/Receive.vue'
// @ts-ignore
import IconSend from '@/components/svgIcon/Send.vue'

import { useAppStore } from '@/stores/app.store'
export default {
  components: { IconReceive, IconSend },
  props: {
    logs: {
      type: Array,
      required: true,
      default: function () {
        return []
      },
    },
    loading: {
      type: Boolean,
      required: true,
      default: function () {
        return false
      },
    },
  },
  setup() {
    const store = useAppStore()
    return { store }
  },
  computed: {
    btcPrice() {
      return this.store.btcPrice.USD
    },
  },
}
</script>

<style lang="scss" scoped>
.tr-logs {
  .tr-item {
    @apply flex flex-row justify-between items-stretch border-b border-gray-200 border-solid py-[18px] mx-[16px];
    .asset {
      @apply flex flex-row justify-start items-center;
      .dir-icon {
        @apply mr-2 h-[36px] w-[36px];
      }

      .info {
        @apply flex flex-col justify-center items-start;
        .dir {
          @apply text-base font-medium;
        }
        .time {
          @apply text-gray-400 text-sm font-normal;
        }
      }
    }
    .amount {
      @apply text-right flex-col justify-center items-end;
      .b {
        @apply text-base font-medium;
      }
      .u {
        @apply text-gray-400 text-sm font-normal;
      }
    }
  }
}
</style>
