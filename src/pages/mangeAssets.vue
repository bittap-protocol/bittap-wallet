<template>
  <div class="min-box mangeAsset">
    <div class="form w-full">
      <div class="search-box">
        <IconSearch class="icon"></IconSearch>
        <input v-model="searchKeyword" type="text" class="si" placeholder="Search for name or ID of assets " />
      </div>
    </div>
    <div class="token">
      <div v-for="ass in showListData" :key="ass.asset_id" class="br token-item">
        <div class="icon-img" v-if="ass.asset_type === 'base'">
          <IconMdiBitcoin class="img text-orange-400"></IconMdiBitcoin>
        </div>
        <div class="icon-img" v-else>
          <svg class="img" width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- <path
                  d="M 18,0
                    A16,16 90 0 1 35,18
                    A16,16 90 0 1 16,35
                    A16,16 90 0 1 0,18
                    A16,16 90 0 1 18,0
                  "
                  fill="none"
                  stroke="#8000FF"
                  stroke-width="1"
            /> -->
            <circle cx="18" cy="18" r="15" fill="#8000FF" stroke="none" stroke-width="2" />
            <text x="18" y="22" fill="white" font-size="100%" text-anchor="middle">{{ ass.name }}</text>
          </svg>
        </div>
        <div class="info">
          <div class="name">{{ ass.name }}</div>
          <div class="id">{{ ass.asset_type === 'base' ? '' : showAssetId(ass.asset_id) }}</div>
        </div>
        <div class="b">
          <button v-if="ass.asset_type !== 'base'" class="btn btn-primary" @click="toggleToken(ass.asset_id)">Show</button>
          <button v-else disabled class="btn btn-primary bg-purple-600">Not set</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
// @ts-ignore
import IconMdiBitcoin from '~icons/mdi/bitcoin';
// @ts-ignore
import { useAppStore } from '@/stores/app.store'
// @ts-ignore
import IconSearch from '@/components/svgIcon/Search.vue'

import { showAddressAndAssetId } from '@/popup/libs/tools';

export default {
  components: { 
    IconSearch,IconMdiBitcoin
  },
  setup() {
    const store = useAppStore()
    store.setGoBackUrl('/')
    store.isGoBack()
    return {
      store
    }
  },
  data() {
    return {
      searchKeyword: '',
      assets: []
    }
  },
  computed: {
    showListData() { 
      const sk = this.searchKeyword.trim().toLowerCase()
      if (!sk) return this.assets;
      // @ts-ignore
      return this.assets.filter(x => x.name.toLowerCase().startsWith(sk) )
    }
  },
  created() {
    this.initData()
  },
  methods: {
    showAssetId(asset_id: string): string{
      return showAddressAndAssetId(asset_id, 8, 8)
    },
    initData() {
      // @ts-ignore
      this.$root.setTitle('Assets management')
      this.loadData()
    },
    async loadData() { 
      this.assets = await this.store.getAssetsBalances()
      // @ts-ignore
      this.assets.push({
        asset_id: 'Base',
        name: 'BTC',
        asset_type: 'base'
      })
    },
    toggleToken(asset_id: string): void { 
      console.log('asset_id: ', asset_id)
      // @ts-ignore
      this.$root._toast('Coming soon', 'info')
    }
  }
}


</script>

<style lang="scss" scoped>
.mangeAsset{
  @apply w-full px-4;
  .search-box{
    background-color: #F5F5FA;
    @apply rounded-2xl flex flex-row flex-nowrap justify-start items-center px-3 py-2 my-4;
    .icon{
      width: 20px;
      height: 20px;
    }
    .si{
      @apply ring-0 outline-none border-none bg-transparent w-full;
    }
  }
  .token{
    @apply my-2;
    &-item{
      @apply mb-4 rounded-2xl shadow-xl px-3 py-4 flex flex-row justify-between items-center;
      .icon-img{
        @apply flex flex-col justify-center items-center w-[10%] h-10;
        .img{
          width: 36px;
          height: 36px;
        }
      }
      .info{
        @apply w-[60%];
        .name{
          @apply uppercase font-medium text-base;
        }
      }
      .b{
        @apply w-[25%] flex flex-row justify-start items-center;
        .btn{
          @apply w-[72px] h-[28px] p-0 rounded-full min-h-max;
        }
      }
    }
  }
}
</style>