<template>
  <div class="min-box mangeAsset">
    <div class="form w-full">
      <div class="search-box">
        <IconSearch class="icon"></IconSearch>
        <input
          v-model="searchKeyword"
          type="text"
          class="si"
          placeholder="Search for name or ID of assets "
        />
      </div>
    </div>
    <div class="token">
      <div
        v-for="ass in showListData"
        :key="ass.asset_id"
        class="br token-item"
      >
        <div
          class="icon-img"
          v-if="ass.asset_type === 'base'"
        >
          <IconMdiBitcoin class="img text-orange-400"></IconMdiBitcoin>
        </div>
        <div
          class="icon-img"
          v-else
        >
          <IconAutoTokenName :name="ass.name"></IconAutoTokenName>
        </div>
        <div class="info">
          <div
            class="name"
            v-html="showKeywordsName(ass.name)"
          ></div>
          <div class="id">
            {{ ass.asset_type === 'base' ? '' : showAssetId(ass.asset_id) }}
          </div>
        </div>
        <div class="b">
          <button
            v-if="ass.asset_type !== 'base'"
            :class="['btn btn-primary',isAddState(ass) ? 'btn-accent' : '']"
            @click="toggleToken(ass)"
          >
            {{ isAddState(ass) ? 'Hide' : 'Show' }}
          </button>
          <button
            v-else
            disabled
            class="btn btn-primary bg-purple-600"
          >
            Not set
          </button>
        </div>
      </div>
      <div class="no-result" v-if="showListData.length<=0">
        <img
          src="@/assets/notrans.png"
          height="110"
          width="120"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
// @ts-ignore
import IconMdiBitcoin from '~icons/mdi/bitcoin'
// @ts-ignore
import { tokenInfo, useAppStore } from '@/stores/app.store'
// @ts-ignore
import IconSearch from '@/components/svgIcon/Search.vue'
// @ts-ignore
import IconAutoTokenName from '@/components/svgIcon/AutoTokenName.vue'

import { showAddressAndAssetId } from '@/popup/libs/tools'

export default {
  components: {
    IconSearch,
    IconMdiBitcoin,
    IconAutoTokenName,
  },
  setup() {
    const store = useAppStore()
    store.setGoBackUrl('/')
    store.isGoBack()
    return {
      store,
    }
  },
  data(): {
    searchKeyword: string
    assets: tokenInfo[]
    userAssets: tokenInfo[]
  } {
    return {
      searchKeyword: '',
      assets: [] as tokenInfo[],
      userAssets: [] as tokenInfo[],
    }
  },
  computed: {
    showListData() {
      const sk = this.searchKeyword.trim().toLowerCase()
      if (!sk) return this.assets
      // @ts-ignore
      return this.assets.filter((x) => x.name.toLowerCase().includes(sk.trim().toLowerCase()))
    },
  },
  created() {
    this.initData()
  },
  methods: {
    showKeywordsName(name: string) {
      return this.searchKeyword.trim().length > 0
        ? name.toUpperCase().replace(
            this.searchKeyword.trim().toUpperCase(),
            `
            <span class="text-primary p-0 m-0 inline">${this.searchKeyword.toUpperCase()}</span>
            `
          )
        : name
    },
    isAddState(tokenRow: tokenInfo) {
      if (this.userAssets.length <= 0) {
        return false
      }
      return this.userAssets.some(
        (x: tokenInfo) => x.asset_id === tokenRow.asset_id
      )
    },
    showAssetId(asset_id: string): string {
      return showAddressAndAssetId(asset_id, 8, 8)
    },
    initData() {
      // @ts-ignore
      this.$root.setTitle('Assets management')
      this.loadData()
    },
    async loadData() {
      this.assets = await this.store.getAssetsListForSelect()
      console.log('this.assets: ', this.assets)
      this.refreshTokenList()
      // @ts-ignore
      this.assets.push({
        asset_id: 'Base',
        name: 'BTC',
        asset_type: 'base',
      })
    },
    refreshTokenList() {
      // @ts-ignore
      this.userAssets = this.store.getTokens()
    },
    toggleToken(token: tokenInfo): void {
      const state = this.isAddState(token)
      console.log('state: ', state)
      if (state) {
        // @ts-ignore
        this.store.removeToken(token.asset_id)
      } else {
        // @ts-ignore
        this.store.addToken(token)
      }
      // @ts-ignore
      this.refreshTokenList()
    },
  },
}
</script>

<style lang="scss" scoped>
.mangeAsset {
  @apply w-full px-4;
  .search-box {
    background-color: #f5f5fa;
    @apply rounded-2xl flex flex-row flex-nowrap justify-start items-center px-3 py-2 my-4;
    .icon {
      width: 20px;
      height: 20px;
    }
    .si {
      @apply ring-0 outline-none border-none bg-transparent w-full;
    }
  }
  .token {
    @apply my-2;
    &-item {
      @apply mb-4 rounded-2xl shadow-lg px-3 py-4 flex flex-row justify-between items-center shadow-gray-200/90 border-t border-solid border-gray-50;
      .icon-img {
        @apply flex flex-col justify-center items-center w-[10%] h-10;
        .img {
          width: 36px;
          height: 36px;
        }
      }
      .info {
        @apply w-[60%];
        .name {
          @apply uppercase font-medium text-base flex flex-row justify-start items-center;
        }
      }
      .b {
        @apply w-[25%] flex flex-row justify-start items-center;
        .btn {
          @apply w-[72px] h-[28px] p-0 rounded-full min-h-max;
        }
      }
    }
  }
  .no-result{
    @apply w-full flex flex-row justify-center items-center min-h-[50vh];
  }
}
</style>
