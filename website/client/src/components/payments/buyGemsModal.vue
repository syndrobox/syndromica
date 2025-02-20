<template>
  <div v-if="user">
    <b-modal
      id="buy-gems"
      :hide-footer="true"
      size="md"
      :modal-class="eventInfo?.class"
    >
      <div
        slot="modal-header"
        class="header-wrap container"
      >
        <span
          v-once
          class="close-icon svg-icon inline icon-12"
          @click="close()"
          v-html="icons.close"
        ></span>
        <div class="row">
          <div
            class="col-12 text-center"
          >
            <img
              v-if="eventInfo?.name === 'fall_extra_gems'"
              :alt="$t('supportSyndromica')"
              srcset="
          ~@/assets/images/gems/fall-header.png,
          ~@/assets/images/gems/fall-header@2x.png 2x,
          ~@/assets/images/gems/fall-header@3x.png 3x"
              src="~@/assets/images/gems/fall-header.png"
            >
            <img
              v-else-if="eventInfo?.name === 'spooky_extra_gems'"
              :alt="$t('supportSyndromica')"
              srcset="
          ~@/assets/images/gems/spooky-header.png,
          ~@/assets/images/gems/spooky-header@2x.png 2x,
          ~@/assets/images/gems/spooky-header@3x.png 3x"
              src="~@/assets/images/gems/spooky-header.png"
            >
            <img
              v-else
              :alt="$t('supportSyndromica')"
              srcset="
          ~@/assets/images/gems/support-syndromica.png,
          ~@/assets/images/gems/support-syndromica@2x.png 2x,
          ~@/assets/images/gems/support-syndromica@3x.png 3x"
              src="~@/assets/images/gems/support-syndromica.png"
            >
          </div>
        </div>
      </div>
      <div
        v-if="eventInfo?.promo === 'g1g1'"
        class="gift-promo-banner d-flex justify-content-around align-items-center px-4"
        @click="showSelectUser"
      >
        <div
          v-once
          class="svg-icon svg-gifts left-gift"
          v-html="icons.gifts"
        >
        </div>
        <div
          class="d-flex flex-column announce-text text-center"
        >
          <strong> {{ $t('g1g1') }} </strong>
          <small
            class="px-1 mt-1"
          >
            {{ $t('g1g1Details') }}
          </small>
        </div>
        <div
          v-once
          class="svg-icon svg-gifts right-gift"
          v-html="icons.gifts"
        >
        </div>
      </div>
      <div class="container">
        <div class="row text-center">
          <h2
            v-once
            class="col-12 text-leadin"
          >
            {{ $t('gemBenefitLeadin') }}
          </h2>
        </div>
        <div
          v-once
          class="row gem-benefits pb-2"
        >
          <div
            v-for="benefit in [1,2,3,4]"
            :key="benefit"
            class="col-md-6 d-flex pl-4 pr-0 pb-3"
          >
            <div class="d-flex bubble justify-content-center align-items-center">
              <div
                class="svg-icon check mx-auto"
                v-html="icons.check"
              ></div>
            </div>
            <p class="small-text pl-2 mb-0">
              {{ $t(`gemBenefit${benefit}`) }}
            </p>
          </div>
        </div>
        <div class="row gem-deck">
          <div
            v-for="gemsBlock in gemsBlocks"
            :key="gemsBlock.key"
            class="text-center col-3"
            :class="{active: selectedGemsBlock === gemsBlock }"
          >
            <div
              class="gem-icon"
              v-html="icons[gemsBlock.key]"
            ></div>
            <div class="gem-count">
              {{ gemsBlock.gems }}
            </div>
            <div
              v-once
              class="gem-text"
            >
              {{ $t('gems') }}
            </div>
            <button
              v-if="!isSelected(gemsBlock)"
              class="btn btn-primary gem-btn"
              @click="selectGemsBlock(gemsBlock)"
            >
              {{ `$${gemsBlock.price / 100}` }}
            </button>
            <button
              v-else
              class="btn btn-success gem-btn"
              @click="selectGemsBlock(gemsBlock)"
            >
              <div
                v-once
                class="svg-icon check text-white mx-auto"
                v-html="icons.check"
              ></div>
            </button>
            <span
              v-if="gemsBlock.originalGems"
              class="small-text original-gems"
            >
              {{ $t('usuallyGems', {originalGems: gemsBlock.originalGems}) }}
            </span>
          </div>
        </div>
        <payments-buttons
          :disabled="!selectedGemsBlock"
          :stripe-fn="() => redirectToStripe({ gemsBlock: selectedGemsBlock })"
          :paypal-fn="() => openPaypal({
            url: paypalCheckoutLink, type: 'gems', gemsBlock: selectedGemsBlock
          })"
          :amazon-data="{type: 'single', gemsBlock: selectedGemsBlock}"
        />
        <div
          v-if="eventInfo?.name === 'fall_extra_gems' || eventInfo?.name === 'spooky_extra_gems'"
          class="d-flex flex-column justify-content-center"
        >
          <h4 class="mt-3 mx-auto">
            {{ $t('howItWorks') }}
          </h4>
          <small class="text-center">
            {{ $t('gemSaleHow', {
              eventStartMonth: eventInfo.startMonth,
              eventStartOrdinal: eventInfo.startOrdinal,
              eventEndOrdinal: eventInfo.endOrdinal,
            }) }}
          </small>
          <h4 class="mt-3 mx-auto">
            {{ $t('limitations') }}
          </h4>
          <small class="text-center">
            {{ $t('gemSaleLimitationsText', {
              eventStartMonth: eventInfo.startMonth,
              eventStartOrdinal: eventInfo.startOrdinal,
              eventStartTime: eventInfo.startTime,
              eventEndMonth: eventInfo.endMonth,
              eventEndOrdinal: eventInfo.endOrdinal,
              eventEndTime: eventInfo.endTime,
              timeZone: eventInfo.timeZoneAbbrev,
            }) }}
          </small>
        </div>
      </div>
    </b-modal>
  </div>
</template>

<style lang="scss">
  @import '~@/assets/scss/colors.scss';

  #buy-gems {
    small {
      font-size: 12px;
      margin-left: 20px;
      margin-right: 20px;
    }

    .close-icon svg path {
      stroke: $purple-400;
    }

    .close-icon:hover svg path {
      stroke: $purple-600;
    }

    .modal-dialog {
      max-width: 35.375rem;
    }

    .modal-body {
      padding: 0;
      padding-bottom: 2rem;
      background: $white;
      border-radius: 0px 0px 8px 8px;
    }

    .modal-content {
      border: none;
      background: transparent;
    }

    .modal-header {
      padding: 0;
      border-bottom: 0px;
    }
  }

  // Fall events styles
  #buy-gems.event-fall_extra_gems, #buy-gems.event-spooky_extra_gems {
    .header-wrap {
      padding-top: 4.5rem;
      padding-bottom: 1.5rem;
    }

    .gem-btn {
      background-image: linear-gradient(293deg, $red-100, $orange-50 51%, $yellow-50);
      border: none;

      &.btn-success {
        background: $green-50 !important;
      }
    }

    .gem-count {
      color: $orange-50;
    }

    .close-icon svg path {
      stroke: $gray-200;
    }

    .close-icon:hover svg path {
      stroke: $gray-400;
    }
  }

  #buy-gems.event-fall_extra_gems {
    .header-wrap {
      background-image: url('~@/assets/images/gems/fall-header-bg@2x.png');
      background-size: 100%;
    }
  }

  #buy-gems.event-spooky_extra_gems {
    .header-wrap {
      background-image: url('~@/assets/images/gems/spooky-header-bg@2x.png');
      background-size: 100%;
    }
  }
</style>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

  .gem-btn {
    min-width: 4.813rem;
    min-height: 2rem;
    margin-bottom: 0.5rem;
  }

  .bubble {
    width: 2rem;
    height: 2rem;
    border-radius: 1000px;
    border: 2px solid $gray-400;
  }

  .gem-benefits {
    p {
      font-style: normal;
      color: $gray-100;
      max-width: 200px;
    }
  }

  .gem-icon {
    margin: 0 auto;
    height: 55px;
    width: 47.5px;
    margin-top: 1.85em;
    margin-bottom: 0.625rem;
  }

  .original-gems {
    margin-top: 0.5rem;
    font-style: normal;
    color: $gray-300;
  }

  .gem-deck {
    background: $gray-700;
    color: $gray-100;
    padding-bottom: 1rem;
    margin-bottom: 1rem;
  }

  .gem-count {
    font-family: Roboto;
    font-size: 2rem;
    font-weight: bold;
    line-height: 1.25;
  }

  .gem-text {
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
    line-height: 1.71;
  }

  .gift-promo-banner {
    width: 100%;
    height: 5rem;
    background-image: linear-gradient(90deg, $teal-50 0%, $purple-400 100%);
    cursor: pointer;

    .announce-text {
      color: $white;
    }

    .left-gift {
      margin: auto 1rem auto auto;
    }

    .right-gift {
      margin: auto auto auto 1rem;
      filter: flipH;
      transform: scaleX(-1);
    }

    .svg-gifts {
      width: 4.6rem;
    }
  }

  .header-wrap {
    background-image: linear-gradient(75deg, $purple-300, $purple-200 100%);
    width: 100%;
    padding: 0;
    padding-top: 3rem;
    padding-bottom: 2.5rem;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
  }

  .svg-icon.check {
    color: $purple-400;
    width: 16px;
    height: 16px;
  }

  .text-leadin {
    margin: 1.5rem auto;
    font-weight: bold;
    color: $purple-200;
  }

  .text-payment {
    line-height: 1.71;
    color: $gray-50;
  }
</style>

<script>
import find from 'lodash/find';
import moment from 'moment';
import { mapState } from '@/libs/store';
import markdown from '@/directives/markdown';
import paymentsMixin from '@/mixins/payments';

import checkIcon from '@/assets/svg/check.svg';

import fourGems from '@/assets/svg/4-gems.svg';
import twentyOneGems from '@/assets/svg/21-gems.svg';
import fortyTwoGems from '@/assets/svg/42-gems.svg';
import eightyFourGems from '@/assets/svg/84-gems.svg';
import svgClose from '@/assets/svg/close.svg';
import gifts from '@/assets/svg/gifts.svg';

import paymentsButtons from '@/components/payments/buttons/list';
import { worldStateMixin } from '@/mixins/worldState';

export default {
  components: {
    paymentsButtons,
  },
  directives: {
    markdown,
  },
  mixins: [paymentsMixin, worldStateMixin],
  data () {
    return {
      icons: Object.freeze({
        close: svgClose,
        check: checkIcon,
        '4gems': fourGems,
        '21gems': twentyOneGems,
        '42gems': fortyTwoGems,
        '84gems': eightyFourGems,
        gifts,
      }),
      selectedGemsBlock: null,
      alreadyTracked: false,
    };
  },
  computed: {
    ...mapState({
      user: 'user.data',
      originalGemsBlocks: 'content.gems',
      currentEventList: 'worldState.data.currentEventList',
    }),
    eventInfo () {
      const currentEvent = find(
        this.currentEventList, event => Boolean(event.gemsPromo) || Boolean(event.promo),
      );
      if (!currentEvent) return null;

      // https://stackoverflow.com/questions/1954397/detect-timezone-abbreviation-using-javascript#answer-66180857
      const timeZoneAbbrev = new Intl.DateTimeFormat('en-us', { timeZoneName: 'short' })
        .formatToParts(new Date())
        .find(part => part.type === 'timeZoneName')
        .value;

      return {
        name: currentEvent.event,
        class: currentEvent.gemsPromo ? `event-${currentEvent.event}` : '',
        gemsPromo: currentEvent.gemsPromo,
        promo: currentEvent.promo,
        timeZoneAbbrev,
        startMonth: moment(currentEvent.start).format('MMMM'),
        startOrdinal: moment(currentEvent.start).format('Do'),
        startTime: moment(currentEvent.start).format('hh:mm A'),
        endMonth: moment(currentEvent.end).format('MMMM'),
        endOrdinal: moment(currentEvent.end).format('Do'),
        endTime: moment(currentEvent.end).format('hh:mm A'),
      };
    },
    isGemsPromoActive () {
      return Boolean(this.eventInfo);
    },
    gemsBlocks () {
      // We don't want to modify the original gems blocks when a promotion is running
      // Also the content data is frozen with Object.freeze and can't be changed
      // So we clone the blocks and adjust the number of gems if necessary
      const blocks = {};

      Object.keys(this.originalGemsBlocks).forEach(gemsBlockKey => {
        const originalBlock = this.originalGemsBlocks[gemsBlockKey];
        const newBlock = blocks[gemsBlockKey] = { ...originalBlock }; // eslint-disable-line no-multi-assign, max-len

        if (this.isGemsPromoActive) {
          newBlock.originalGems = originalBlock.gems;
          newBlock.gems = (
            this.eventInfo.gemsPromo[gemsBlockKey] || originalBlock.gems
          );
        }
      });

      return blocks;
    },
  },
  async mounted () {
    await this.triggerGetWorldState();

    this.$root.$on('bv::show::modal', modalId => {
      if (modalId === 'buy-gems') {
        // We force reloading the world state every time the modal is reopened
        // To make sure the promo status is always up to date
        this.triggerGetWorldState(true);
      }
    });
  },
  methods: {
    selectGemsBlock (gemsBlock) {
      if (gemsBlock === this.selectedGemsBlock) {
        this.selectedGemsBlock = null;
      } else {
        this.selectedGemsBlock = gemsBlock;
      }
    },
    isSelected (gemsBlock) {
      return this.selectedGemsBlock === gemsBlock;
    },
    close () {
      this.$root.$emit('bv::hide::modal', 'buy-gems');
    },
    showSelectUser () {
      this.$root.$emit('bv::show::modal', 'select-user-modal');
      this.close();
    },
  },
};
</script>
