<template>
  <div
    v-if="logs.length > 0 && !loading"
    class="tr-logs"
  >
    <a
      v-for="tr in logs"
      :key="tr.tx_id"
      :href="txUrl(tr.tx_id)"
      target="_blank"
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
            <IconPending v-if="tr.pending" class="ml-[11px]"></IconPending>
          </div>
          <div class="time">
            {{ tr.timestamp && tr.timestamp>0 ? $root.formatTime(tr.timestamp * 1000) : '' }}
          </div>
        </div>
      </div>
      <div v-if="!isNft" class="amount">
        <div class="b">
          {{
            $root.formatToken(
              tr.asset_id === '' ? Number(Number(tr.amount) / 10**8 ) : tr.amount,
              tr.asset_id === '' ? 8 : 0,
              tr.asset_id === '' ? 'BTC' : $root.showAssetName(tr.asset_id)
            )
          }}
        </div>
        <div
          v-if="tr.asset_id === ''"
          class="u"
        >≈${{ $root.formatToken($root.showUsdtBalance(Number(tr.amount) / 10**8 ), 2) }}
        </div>
        <div
          v-else
          class="u"
        >≈${{
            $root.formatToken($root.showTokenBalance(tr.asset_id, tr.amount), 2)
          }}
        </div>
      </div>
      <div v-else class="amount">
        <div class="b">{{ tr.amount }}</div>
      </div>
    </a>
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
// @ts-ignore
import IconPending from '@/components/svgIcon/Pending.vue'

import { getTxUrl } from '@/popup/libs/tools';

import { useAppStore, TransferRow } from '@/stores/app.store'
type T = TransferRow[]
export default {
  components: { IconReceive, IconSend, IconPending },
  props: {
    logs: {
      type: Array<T>,
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
    isNft: {
      type: Boolean,
      required: true,
      default: function () {
        return false
      },
    }
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
  methods: {
    txUrl(tx_id:string){
      return getTxUrl(tx_id,this.store.getNetWorkType() === 0 ? '': 'testnet')
    }
  }
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
          @apply text-base font-medium flex flex-row justify-center items-center;
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
