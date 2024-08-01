<template>
    <div
        v-if="details.timestamp > 0"
        class="min-box details"
    >
        <div class="icon">
            <IconReceive v-if="details.op_type == '1'"></IconReceive>
            <IconSend v-if="details.op_type == '0'"></IconSend>
            <div class="type">
                {{ details.op_type == '0' ? 'Send' : 'Receive' }}
                {{
                    details.asset_id == ''
                        ? ' BTC'
                        : $root.showAssetName(details.asset_id)
                }}
            </div>
        </div>
        <div class="lines">
            <div class="item">
                <div class="n">Hash</div>
                <a
                    class="v"
                    target="_blank"
                    :href="$root._goToTxhash(details.hash)"
                >
                    {{ $root._showMinMaxString(details.tx_id) }}
                    <IconLinkOut></IconLinkOut>
                </a>
            </div>

            <div class="item">
                <div class="n">Status</div>
                <div class="v">Seccussful</div>
            </div>

            <div class="item">
                <div class="n">From</div>
                <div class="v">
                    {{ details.from }}
                </div>
            </div>

            <div class="item">
                <div class="n">To</div>
                <div class="v">
                    {{ details.to }}
                </div>
            </div>

            <div class="item">
                <div class="n">Quantity</div>
                <div class="v">
                    {{
                        $root.formatToken(
                            details.amount,
                            details.asset_id === '' ? 6 : 0,
                            details.asset_id === ''
                                ? 'BTC'
                                : $root.showAssetName(details.asset_id)
                        )
                    }}
                </div>
            </div>
            <div class="item">
                <div class="n">Gas</div>
                <div class="v">
                    {{ $root.formatToken(details.gas, 6, 'BTC') }}
                </div>
            </div>
            <div class="item">
                <div class="n">Time</div>
                <div class="v">
                    {{ $root.formatTime(details.timestamp * 1000) }}
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
// @ts-ignore
import IconReceive from '@/components/svgIcon/Receive.vue'
// @ts-ignore
import IconSend from '@/components/svgIcon/Send.vue'
// @ts-ignore
import IconLinkOut from '@/components/svgIcon/LinkOut.vue'
import { postToast } from '@/popup/libs/tools'
import { useAppStore } from '@/stores/app.store'

export default {
    components: { IconReceive, IconSend, IconLinkOut },
    props: {
        hash: { type: String, required: true },
    },
    setup() {
        const store = useAppStore()
        return { store }
    },
    data() {
        return {
            details: {
                timestamp: 0,
                tx_id: '',
                asset_id: '',
                amount: 0,
                op_type: '',
                wallet_id: '',
            },
        }
    },
    beforeCreate() {
        this.store.isGoBack()
        // @ts-ignore
        this.$root.setTitle('Record Details')
    },
    methods: {
        async getDataInfo(hash: string) {
            // @ts-ignore
            this.store
                .getTransactionDetails(hash)
                // @ts-ignore
                .then((info) => {
                    this.details = info
                })
                // @ts-ignore
                .catch((error) => {
                    postToast(error + '', 'error')
                })
        },
    },
}
</script>

<style lang="scss" scoped>
.details {
    @apply py-4;
    .icon {
        @apply flex flex-col justify-center items-center;
        .type {
            @apply mt-4 text-center text-[#3c454e] text-base font-medium  leading-normal;
        }
    }
    .lines {
        @apply flex flex-col justify-center items-center;
        .item {
            @apply flex flex-row justify-between items-center gap-x-2;
            .k {
                @apply text-[#5e5e66] text-sm font-normal leading-snug;
            }
            .v {
                @apply flex flex-row justify-center items-center gap-x-1;
            }
        }
    }
}
</style>
