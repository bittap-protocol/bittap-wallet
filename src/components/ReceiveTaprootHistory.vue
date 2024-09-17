<template>
  <div class="w-full px-3">
    <div class="history-list">
      <div
        v-for="row in store.receiveAddressList.reverse()"
        :key="row.taproot_output_key"
        class="item"
      >
        <div
          v-if="row.asset_id"
          class="line"
        >
          <span class="text-sm font-medium pr-2">AssetId:</span>
          {{ showAssetId(row.asset_id) }}
        </div>

        <div class="info">
          <div class="it asset">
            <div class="key">
              {{ row.asset_name }}
            </div>
            <div class="value">Asset</div>
          </div>
          <div class="it amount">
            <div class="key">
              {{ Number(row.amount).toFixed(0) }}
            </div>
            <div class="value">≈$0</div>
          </div>
          <div class="it c">
            <button
              class="mr-2"
              @click="copyData(row.encoded)"
            >
              <IconCopy></IconCopy>
            </button>
          </div>
        </div>
      </div>
      <div
        v-if="loading"
        class="my-6 w-full flex flex-row justify-center items-center"
      >
        <div class="loading loading-spinner text-primary my-16"></div>
      </div>
      <div
        v-if="!loading && store.receiveAddressList.length <= 0"
        class="no-result w-full"
      >
        <div class="flex flex-row justify-center items-center m-5">
          <img
            src="@/assets/notrans.png"
            height="110"
            width="120"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { showAddressAndAssetId } from '@/popup/libs/tools'
import { useAppStore } from '@/stores/app.store'
// @ts-ignore
import IconCopy from '@/components/svgIcon/Copy.vue'

export default {
  name: 'ReceiveTaproot',
  components:{ IconCopy },
  setup() {
    const store = useAppStore()
    return { store }
  },
  data() {
    return {
      historyList: [],
      loading: true,
    }
  },
  computed: {
    account() {
      const store = useAppStore()
      return store.getActiveAccount()
    },
  },
  mounted() {
    this.initData()
  },
  methods: {
    showAssetId(asset_id: string): string {
      return showAddressAndAssetId(asset_id, 12, 12)
    },
    async initData() {
      this.loading = true
      await this.store.getReceiveAddress().then((res) => {
        console.log('getReceiveAddress res: ', res)
        this.loading = false
        return res
      })
    },
    async copyData(text: string) {
      await navigator.clipboard.writeText(text)
      // @ts-ignore
      this.$root._toast('Copy successfully.', 'success')
    },
  },
}
</script>

<style lang="scss" scoped>
.history-list {
  .item {
    @apply flex flex-col justify-center items-center rounded-md my-3 shadow-lg ring-1 ring-gray-50 p-3;
    .line {
      @apply break-words leading-5 pt-1 pb-3 w-full;
      // width: 95%;
      word-break: break-all;
      border-bottom: 1px dashed #888f99;
    }
    .info {
      @apply w-full flex flex-row flex-nowrap justify-between items-center mt-2;
      .it {
        @apply my-1;
        .key {
          @apply uppercase font-normal text-sm leading-snug text-black;
        }
        .value {
          @apply text-[#888F99] font-normal text-xs leading-tight mt-1;
        }
      }
    }
  }
}
</style>
