<template>
  <div class="system">
    <div id="domainuser">
      <h3
        class="text-label"
        style="text-align: center;padding-top: 100px;margin-bottom: 50px;"
      >cn.myapps.core.main.my_domain</h3>
      <!-- <table style="width: 684px; height: 169px; background-repeat: no-repeat; background-image:url('/obpm/resource/imgnew/index_background.gif')"> -->
      <table style="width: 684px; height: 169px; background-repeat: no-repeat;margin: 0 auto;">
        <tbody>
          <tr>
            <td colspan="2">
              <ul class="list"></ul>
            </td>
          </tr>

          <tr>
            <td
              style="white-space:nowrap;word-break:keep-all;overflow:hidden;text-overflow:ellipsis;width:20%;text-align: center;"
            >
              <a
                class="forInitCurrentPosition"
                style="text-decoration: none;"
                topage="企业域信息(测试)"
                href="/obpm/core/domain/displayView.action?id=3CffNlgt9B9StIjIUPB&amp;domain=3CffNlgt9B9StIjIUPB"
              >
                <img
                  src="/obpm/resource/imgnew/index_domain.png"
                  onmouseover="src='/obpm/resource/imgnew/index_domain_c.png'"
                  onmouseout="src='/obpm/resource/imgnew/index_domain.png'"
                  alt="测试"
                  style="padding-bottom: 30px;"
                />
                <br />{{$t('btns.test')}}
              </a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script>
export default {};
</script>
<style lang="scss" scoped>
.system {
  width: 100%;
  height: 500px;
//   border: 1px solid red;
}
</style>


