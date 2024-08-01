<template>
  <div class="w-full px-3">
    <div class="history-list">
      <div
        v-for="row in store.receiveAddressList"
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
            <div class="key font-medium">
              {{ row.asset_name }}
            </div>
            <div class="value">Asset</div>
          </div>
          <div class="it amount">
            <div class="key font-medium">
              {{ Number(row.amount).toFixed(0) }}
            </div>
            <div class="value">≈$0</div>
          </div>
          <div class="it c">
            <button
              class=""
              @click="copyData(row.encoded)"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M5.40077 2.60309C5.25832 2.60309 5.14284 2.71858 5.14284 2.86103V4.32741C5.14284 4.67807 4.85857 4.96233 4.50792 4.96233C4.15726 4.96233 3.873 4.67807 3.873 4.32741V2.86103C3.873 2.01726 4.55701 1.33325 5.40077 1.33325H13.1389C13.9826 1.33325 14.6666 2.01726 14.6666 2.86103V10.5991C14.6666 11.4429 13.9826 12.1269 13.1389 12.1269H11.6559C11.3053 12.1269 11.021 11.8426 11.021 11.492C11.021 11.1413 11.3053 10.8571 11.6559 10.8571H13.1389C13.2813 10.8571 13.3968 10.7416 13.3968 10.5991V2.86103C13.3968 2.71858 13.2813 2.60309 13.1389 2.60309H5.40077Z"
                />
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M1.33331 5.40071C1.33331 4.55694 2.01732 3.87293 2.86109 3.87293H10.5992C11.443 3.87293 12.127 4.55694 12.127 5.40071V13.1388C12.127 13.9826 11.443 14.6666 10.5992 14.6666H2.86109C2.01732 14.6666 1.33331 13.9826 1.33331 13.1388V5.40071ZM2.86109 5.14278C2.71864 5.14278 2.60315 5.25826 2.60315 5.40071V13.1388C2.60315 13.2813 2.71864 13.3967 2.86109 13.3967H10.5992C10.7416 13.3967 10.8571 13.2813 10.8571 13.1388V5.40071C10.8571 5.25826 10.7416 5.14278 10.5992 5.14278H2.86109Z"
                />
              </svg>
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
// import { DecodeAssetsAddress } from '@/popup/api/btc/blockStream'

export default {
  name: 'ReceiveTaproot',
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
        console.log('res: ', res)
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
      @apply break-words leading-5 pt-1  w-full;
      // width: 95%;
      word-break: break-all;
      border-top: 1px dotted #9b96a0;
      &:first-child {
        border-top: none;
      }
    }
    .info {
      @apply w-full flex flex-row flex-nowrap justify-between items-center mt-2;
      .it {
        @apply mx-2;
        .key {
          @apply uppercase;
        }
        .value {
          @apply text-gray-500;
        }
      }
    }
  }
}
</style>
