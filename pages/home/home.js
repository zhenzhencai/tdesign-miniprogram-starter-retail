import { fetchHome } from '../../services/home/home';
import { fetchGoodsList } from '../../services/good/fetchGoods';

Page({
  data: {
    keyword: '',
    imgSrcs: [],
    activityImg: '',
    tabList: [],
    tabIndex: 0,
    goodsList: [],
    goodsListLoadStatus: 0,
    pageLoading: false,
    goodsRefreshing: false,
    current: 1,
    autoplay: true,
    duration: 500,
    interval: 5000,
  },

  goodListPagination: {
    index: 0,
    num: 20,
  },

  // 调用自定义tabbar的init函数，使页面与tabbar激活状态保持一致
  onShow() {
    this.getTabBar().init();
  },
  onLoad() {
    this.init();
  },
  onReachBottom() {
    if (this.data.goodsListLoadStatus === 0) {
      this.loadGoodsList();
    }
  },
  onPullDownRefresh() {
    this.init();
  },

  init() {
    this.loadHomePage();
  },

  loadHomePage() {
    // 关闭自带的loading效果
    wx.stopPullDownRefresh();

    this.setData({
      pageLoading: true,
    });
    fetchHome().then(({ swiper, tabList, keyword, activityImg }) => {
      this.setData({
        tabList,
        imgSrcs: swiper,
        activityImg,
        keyword,
        pageLoading: false,
      });
      this.loadGoodsList(true);
    });
  },

  tabChangeHandle(e) {
    this.setData({
      tabIndex: e.detail,
    });
    this.loadGoodsList(true);
  },

  onReTry() {
    this.loadGoodsList();
  },

  // fresh 代表重新加载
  loadGoodsList(fresh = false) {
    if (fresh) {
      wx.pageScrollTo({
        scrollTop: 0,
      });
      this.setData({
        goodsRefreshing: true,
      });
    }

    this.setData({ goodsListLoadStatus: 1 });

    let pageSize = this.goodListPagination.num;
    let pageIndex =
      this.data.tabIndex * pageSize + this.goodListPagination.index + 1;
    if (fresh) {
      pageIndex = 0;
    }

    return fetchGoodsList(pageIndex, pageSize)
      .then((nextList) => {
        this.setData({
          goodsList: fresh ? nextList : this.data.goodsList.concat(nextList),
          goodsListLoadStatus: 0,
          goodsRefreshing: false,
        });

        this.goodListPagination.index = pageIndex;
        this.goodListPagination.num = pageSize;
      })
      .catch((err) => {
        this.setData({ goodsListLoadStatus: 3 });
      });
  },

  goodlistClickHandle(e) {
    const { index } = e.detail;
    const spuId = this.data.goodsList[index].spuId;
    wx.navigateTo({
      url: `/pages/goods/details/index?spuId=${spuId}`,
    });
  },
  goodlistAddCartHandle() {
    // Toast({ text: '加入购物车成功' });
  },

  navToSearchPage() {
    wx.navigateTo({ url: '/pages/goods/search/index' });
  },

  navToActivityDetail({ detail }) {
    /** 活动肯定有一个活动ID，用来获取活动banner，活动商品列表等 */
    const { index: promotionID = 0 } = detail || {};
    wx.navigateTo({
      url: '/pages/promotion-detail/index?promotion_id=' + promotionID,
    });
  },
});
