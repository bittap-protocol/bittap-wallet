<template>
  <div class="color-box">
      <div class="account">
        <div class="assets">
          <div v-if="info.asset_id!==''" class="detail">
            <div class="id">
                <span>Asset id：{{ $root._showMinMaxString(info.asset_id, 8, 8) }}</span>
                <button
                class="ml-1"
                @click="copyData(info.asset_id)"
                >
                <IconCopy class="fill-white"></IconCopy>
                </button>
            </div>
            <div class="arrow">
                <div v-if="info.asset_id !== 'Base'" class="dropdown dropdown-end">
                    <div tabindex="0" role="button" class="btn pr-0 pl-1 py-0 m-0 min-h-fit h-auto border-none border-0">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 7.5C12.8284 7.5 13.5 6.82843 13.5 6C13.5 5.17157 12.8284 4.5 12 4.5C11.1716 4.5 10.5 5.17157 10.5 6C10.5 6.82843 11.1716 7.5 12 7.5Z" fill="white"/>
                            <path d="M12 13.5C12.8284 13.5 13.5 12.8284 13.5 12C13.5 11.1716 12.8284 10.5 12 10.5C11.1716 10.5 10.5 11.1716 10.5 12C10.5 12.8284 11.1716 13.5 12 13.5Z" fill="white"/>
                            <path d="M12 19C12.8284 19 13.5 18.3284 13.5 17.5C13.5 16.6716 12.8284 16 12 16C11.1716 16 10.5 16.6716 10.5 17.5C10.5 18.3284 11.1716 19 12 19Z" fill="white"/>
                        </svg>
                    </div>
                    <ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-box z-[1] w-[140px] px-0 py-2 shadow font-normal text-sm">
                        <li><a :href="'https://explorer.royllo.org/search?query='+info.asset_id" target="_blank">Token Detail</a></li>
                        <li v-if="info.asset_type === 1"><a href="https://tna-btc.com/" target="_blank">Domain Settings</a></li>
                        <li v-if="info.asset_type === 0 || info.asset_type === 1" ><a @click="hideToken">Hide {{ info.asset_type === 0 ? info.asset_name : '' }}</a></li>
                    </ul>
                </div>
            </div>
          </div>
          <div v-if="info.asset_type !== 1" class="balance">
            {{ info.asset_type === 'base' ? 
            $root.formatAssets(info.balance, 8, 'BTC') :
            $root.formatAssets(info.balance, 0, info.asset_name)  }}  
          </div>
          <div v-if="info.asset_type === 1" class="balance">
            {{ info.asset_name.toUpperCase() }}
          </div>
          
        </div>

        
      </div>
      <div class="actions">
        <router-link
          :to="'/common/send?input=yes&asset_id='+info.asset_id+'&asset_type='+info.asset_type"
          class="send"
        >
          <svg
            width="56"
            height="56"
            viewBox="0 0 56 56"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="28"
              cy="28"
              r="28"
              fill="white"
            />
            <circle
              cx="28"
              cy="28"
              r="24"
              fill="url(#paint0_linear_25_6324)"
            />
            <path
              d="M28 19V37"
              stroke="white"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M22 25L28 19L34 25"
              stroke="white"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <defs>
              <linearGradient
                id="paint0_linear_25_6324"
                x1="28"
                y1="4"
                x2="28.2022"
                y2="51.1467"
                gradientUnits="userSpaceOnUse"
              >
                <stop
                  stop-color="#007BFF"
                  stop-opacity="0.7"
                />
                <stop
                  offset="1"
                  stop-color="#8000FF"
                />
              </linearGradient>
            </defs>
          </svg>
          <div class="font-bold">Send</div>
        </router-link>
        <router-link
          :to="'/common/receive?input=yes&asset_id='+info.asset_id+'&asset_type='+info.asset_type"
          class="receive"
        >
          <svg
            width="56"
            height="56"
            viewBox="0 0 56 56"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="28"
              cy="28"
              r="28"
              fill="white"
            />
            <circle
              cx="28"
              cy="28"
              r="24"
              fill="url(#paint0_linear_25_6316)"
            />
            <path
              d="M28 37V19"
              stroke="white"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M34 31L28 37L22 31"
              stroke="white"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <defs>
              <linearGradient
                id="paint0_linear_25_6316"
                x1="28"
                y1="4"
                x2="28.2022"
                y2="51.1467"
                gradientUnits="userSpaceOnUse"
              >
                <stop
                  stop-color="#007BFF"
                  stop-opacity="0.7"
                />
                <stop
                  offset="1"
                  stop-color="#8000FF"
                />
              </linearGradient>
            </defs>
          </svg>

          <div class="font-bold">Receive</div>
        </router-link>
      </div>
    </div>
</template>

<script lang="ts">
import { useAppStore } from '@/stores/app.store'
// @ts-ignore
import IconCopy from '@/components/svgIcon/Copy.vue'
export default {
    name: 'ColorBox',
    components:{
        IconCopy
    },
    props: {
        info: {
            type: Object,
            required: true,
            default: function () {
                return {
                    anchor_point: "",
                    asset_id: "",
                    asset_name: "",
                    genesis_height: "",
                    genesis_point: "",
                    genesis_timestamp: "",
                    total_supply:0,
                    balance: 0,
                    asset_type: ''
                }
            },
        },
    },
    setup() {
        const store = useAppStore()
        return {
            store
        }
    },
    methods: {
        async copyData(text:string) {
            await navigator.clipboard.writeText(text)
            // @ts-ignore
            this.$root._toast('Copy successfully.', 'success')
        },
        async hideToken(){
            // @ts-ignore
            this.$root._main_confirm(
                'Hide Token？',
                'You can re-add this token through the asset management on the homepage',
                [
                { name: 'Cancel' },
                {
                    name: 'Hide',
                    cls: ['btn-primary'],
                    // @ts-ignore
                    handle: (action, closeModal) => {
                        closeModal()
                         // @ts-ignore
                        this.store.removeToken(this.info.asset_id)
                        this.$router.push('/')
                    },
                },
                ],
                {
                // actionCls: ['flex-col', 'space-y-2']
                }
            )
        }
    }
}
</script>

<style lang="scss" scoped>
.color-box {
    @apply px-4 h-[148px] text-center;
    .account {
      @apply w-full border-0 rounded-2xl flex flex-col justify-between items-center px-3 pt-2 pb-10;
      background: radial-gradient(
        47.17% 129.97% at 51.3% 44.54%,
        rgba(0, 123, 255, 0.85) 0%,
        #8000ff 100%
      );
      .assets {
        @apply text-left w-full;
        .balance {
          @apply text-white text-2xl leading-9 font-bold text-center mt-4 mb-2;
        }
        .detail{
            @apply flex flex-row justify-between items-center;
            .id {
                @apply text-white text-base font-medium flex flex-row justify-start items-center;
                span{
                    @apply text-xs font-normal;
                }
            }
            .arrow{

            }
        }
      }
      .address {
        @apply flex flex-row justify-between items-center space-x-2 w-full rounded-xl py-[5px] px-2 text-white text-xs font-normal;
        background: rgba(255, 255, 255, 0.3);
      }
    }
    .actions {
      @apply w-full my-3 flex flex-row justify-around items-center space-x-2;
      margin-top: -30px;
    }
}
</style>