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
    <div v-if="searchIng" class="flex flex-row justify-start items-center gap-x-1"><span class="loading loading-dots loading-xs"></span>Loading...</div>
    <div class="token">
      
      <div
        v-for="ass in showListData"
        :key="ass.asset_id"
        class="br token-item"
      >
        <div
          v-if="ass.asset_type === 'base'"
          class="icon-img"
        >
          <IconMdiBitcoin class="img text-orange-400"></IconMdiBitcoin>
        </div>
        <div
          v-else
          class="icon-img"
        >
          <IconAutoTokenName :name="ass.name"></IconAutoTokenName>
        </div>
        <div class="info">
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div class="name" v-html="showKeywordsName(ass.name)"></div>
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
      <div v-if="showListData.length<=0" class="no-result">
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
import IconMdiBitcoin from '@/components/svgIcon/MdiBitcoin.vue'
// @ts-ignore
import { tokenInfo, useAppStore } from '@/stores/app.store'
// @ts-ignore
import IconSearch from '@/components/svgIcon/Search.vue'
// @ts-ignore
import IconAutoTokenName from '@/components/svgIcon/AutoTokenName.vue'

import { isAssetId, showAddressAndAssetId } from '@/popup/libs/tools'
import { ListAssetsQuery } from '@/popup/api/btc/blockStream'

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
    userAssets: tokenInfo[],
    timer: NodeJS.Timeout|null,
    searchIng: boolean,
  } {
    return {
      searchKeyword: '',
      assets: [] as tokenInfo[],
      userAssets: [] as tokenInfo[],
      timer: null,
      searchIng: false,
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
  watch: {
    'searchKeyword': function(k,v) {
      if(k!=v && this.searchKeyword) {
        if(this.timer) {
          clearTimeout(this.timer)
          this.timer = null
        }
        this.timer = setTimeout(() => {
          this.searchForApiData()
        },500)
      }
    }
  },
  created() {
    this.initData()
  },
  methods: {
    searchForApiData(){
      this.searchIng = true
      const assets_id = isAssetId(this.searchKeyword ) ? this.searchKeyword : undefined
      const assets_name = !isAssetId(this.searchKeyword ) ? this.searchKeyword : undefined
      const wallet_id = this.store.getCurrentWalletId()
      
      ListAssetsQuery(assets_name, assets_id, 1, 9999).then((res) => {
        this.searchIng = false
        if(res) {
          res.forEach(x => {
            const asset_id = x.asset.asset_id
            const isAdd = this.assets.some(x=> x.asset_id === asset_id)
            if(isAdd) {
              return 
            }
            this.assets.unshift({
              wallet_id,
              asset_id,
              amount: 0,
              asset_type: x.asset.asset_type || 0,
              name: x.asset.asset_name,
            })
          })
          this.assets = this.assets.sort((a,b) => {
              return b.amount - a.amount
            })
          // console.log('this.assets: ', this.assets)
        }
      }).finally(() => {
        this.searchIng = false
      })
    },
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
      this.$root.setTitle('Assets Manage')
      this.loadData()
    },
    async loadData() {
      this.assets = await this.store.getAssetsListForSelect()
      // console.log('this.assets: ', this.assets)
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
          @apply uppercase font-medium text-base break-all;
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
