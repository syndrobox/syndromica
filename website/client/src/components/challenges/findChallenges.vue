<template>
  <div class="row">
    <challenge-modal @createChallenge="challengeCreated" />
    <sidebar
      @search="updateSearch"
      @filter="updateFilters"
    />
    <div class="col-12 col-md-10 standard-page">
      <div class="row header-row">
        <div class="col-md-8 text-left">
          <h1 v-once>
            {{ $t('findChallenges') }}
          </h1>
        </div>
        <div class="col-md-4">
          <button
            class="btn btn-secondary create-challenge-button float-right"
            @click="createChallenge()"
          >
            <div
              class="svg svg-icon positive-icon color"
              v-html="icons.positiveIcon"
            ></div>
            <span v-once>{{ $t('createChallenge') }}</span>
          </button>
        </div>
      </div>
      <div class="row">
        <div
          v-if="!loading &&
            filteredChallenges.length === 0"
          class="no-challenges text-center col-md-6 offset-3"
        >
          <h2 v-once>
            {{ $t('noChallengeMatchFilters') }}
          </h2>
        </div>
      </div>
      <div class="row">
        <div
          v-for="challenge in filteredChallenges"
          :key="challenge._id"
          class="col-12 col-md-6"
        >
          <challenge-item :challenge="challenge" />
        </div>
        <mugen-scroll
          v-show="loading"
          :handler="infiniteScrollTrigger"
          :should-handle="!loading && canLoadMore"
          :threshold="1"
        >
          <h2
            v-once
            class="col-12 loading"
          >
            {{ $t('loading') }}
          </h2>
        </mugen-scroll>
      </div>
    </div>
  </div>
</template>

<style lang='scss' scoped>
  @import '~@/assets/scss/colors.scss';

  @media only screen and (max-width: 768px) {
    .header-row {
      margin-bottom: 1rem;
    }

    .col-10.standard-page {
      // full width on smaller devices
      max-width: 100%;
    }
  }

  .header-row {
    h1 {
      color: $purple-200;
    }

    .create-challenge-button {
      margin-left: 1em;

      &:not(.disabled) .svg {
        color: $green-10;
      }

      .positive-icon {
        width: 10px;
        display: inline-block;
        margin-right: .5em;
      }
    }
  }

  .no-challenges {
    color: $gray-200;
    margin-top: 10em;

    h2 {
      color: $gray-200;
    }
  }

  .loading {
    text-align: center;
    color: $purple-300;
  }
</style>

<script>
import MugenScroll from 'vue-mugen-scroll';
import debounce from 'lodash/debounce';
import { mapState } from '@/libs/store';

import Sidebar from './sidebar';
import ChallengeItem from './challengeItem';
import challengeModal from './challengeModal';
import externalLinks from '@/mixins/externalLinks';
import challengeUtilities from '@/mixins/challengeUtilities';

import positiveIcon from '@/assets/svg/positive.svg';

export default {
  components: {
    Sidebar,
    ChallengeItem,
    challengeModal,
    MugenScroll,
  },
  mixins: [challengeUtilities, externalLinks],
  data () {
    return {
      loading: true,
      canLoadMore: true,
      icons: Object.freeze({
        positiveIcon,
      }),
      challenges: [],
      sort: 'none',
      sortOptions: [
        {
          text: this.$t('none'),
          value: 'none',
        },
        {
          text: this.$t('participants'),
          value: 'participants',
        },
        {
          text: this.$t('name'),
          value: 'name',
        },
        {
          text: this.$t('end_date'),
          value: 'end_date',
        },
        {
          text: this.$t('start_date'),
          value: 'start_date',
        },
      ],
      search: '',
      filters: {},
      page: 0,
    };
  },
  computed: {
    ...mapState({ user: 'user.data' }),
  },
  mounted () {
    this.$store.dispatch('common:setTitle', {
      subSection: this.$t('findChallenges'),
      section: this.$t('challenges'),
    });
    this.loadChallenges();
    this.handleExternalLinks();
  },
  updated () {
    this.handleExternalLinks();
  },
  methods: {
    updateSearch (eventData) {
      this.search = eventData.searchTerm;
      this.page = 0;
      this.loadChallenges();
    },
    updateFilters (eventData) {
      this.filters = eventData;
      this.page = 0;
      this.loadChallenges();
    },
    createChallenge () {
      this.$root.$emit('syndromica:create-challenge');
    },
    async loadChallenges () {
      this.loading = true;

      let categories = '';
      if (this.filters.categories) {
        categories = this.filters.categories.join(',');
      }

      let owned = '';
      // @TODO: we skip ownership === 2 because it is the same as === 0 right now
      if (this.filters.ownership && this.filters.ownership.length === 1) {
        [owned] = this.filters.ownership;
      }

      const challenges = await this.$store.dispatch('challenges:getUserChallenges', {
        page: this.page,
        search: this.search,
        categories,
        owned,
      });

      if (this.page === 0) {
        this.challenges = challenges;
      } else {
        this.challenges = this.challenges.concat(challenges);
      }

      // only show the load more Button if the max count was returned
      this.canLoadMore = challenges.length === 10;

      this.loading = false;
    },
    challengeCreated (challenge) {
      this.challenges.push(challenge);
    },
    infiniteScrollTrigger () {
      // show loading and wait until the loadMore debounced
      // or else it would trigger on every scrolling-pixel (while not loading)
      if (this.canLoadMore) {
        this.loading = true;
      }

      this.loadMore();
    },
    loadMore: debounce(function loadMoreDebounce () {
      this.page += 1;
      this.loadChallenges();
    }, 1000),
  },
};
</script>
