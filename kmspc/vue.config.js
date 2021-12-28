
module.exports = {
    productionSourceMap: false, // 生产打包时不输出map文件，增加打包速度
    configureWebpack: {
        devtool: 'source-map'
    },
    css: {
        // 是否使用css分离插件 ExtractTextPlugin
        extract: false,
        // 开启 CSS source maps?
        sourceMap: true,
        // css预设器配置项
        loaderOptions: {},
        // 启用 CSS modules for all css / pre-processor files.
        modules: false
    },
    runtimeCompiler: true,
    publicPath: './',
    devServer: {
        open: true,
        host: 'localhost',
        port: 8085,
        https: false,
        //以上的ip和端口是我们本机的;下面为需要跨域的
        proxy: {//配置跨域
            'kms': {
                target: 'http://localhost:8080/', //这里后台的地址模拟的;应该填写你们真实的后台接口
                ws: true,
                changOrigin: true, //允许跨域
                pathRewrite: {
                    '^/kms': '/kms'//请求的时候使用这个api就可以
                }
            },

        }
    }
}
