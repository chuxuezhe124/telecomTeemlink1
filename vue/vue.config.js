const webpack=require("webpack");
module.exports = {
    publicPath: './',
    productionSourceMap: false, // 生产打包时不输出map文件，增加打包速度
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
    configureWebpack: {
        plugins: [
            new webpack.ProvidePlugin({
                $: "jquery",
                jQuery: "jquery",
                "window.jQuery": "jquery"
            })
        ],
    },
    devServer: {
        open: true,
        host: 'localhost',
        port: 8085,
        https: false,
        //以上的ip和端口是我们本机的;下面为需要跨域的
        proxy: {//配置跨域
            'static': {
                target: 'http://localhost:8080/',
                ws: true,          
                changOrigin: true, 
                pathRewrite: {  
                    '^/static': '/static'
                }
            },
            'signon': {
                target: 'http://localhost:8080/',
                ws: true,          
                changOrigin: true,
                pathRewrite: {  
                    '^/signon': '/signon'
                }
            },
            'obpm': {
                target: 'http://localhost:8080/',
                ws: true,          
                changOrigin: true,
                pathRewrite: {  
                    '^/obpm': '/obpm'
                }
            },
            'kms': {
                target: 'http://localhost:8080/', //这里后台的地址模拟的;应该填写你们真实的后台接口 
                ws: true,          
                changOrigin: true, //允许跨域
                pathRewrite: {
                    '^/kms': '/kms'//请求的时候使用这个api就可以
                }
            },
            'qms': {
                target: 'http://localhost:8080/', //这里后台的地址模拟的;应该填写你们真实的后台接口
                ws: true,          
                changOrigin: true, //允许跨域
                pathRewrite: {
                    '^/qms': '/qms'//请求的时候使用这个api就可以
                }
            },
            'message': {
                target: 'http://localhost:8080/', 
                ws: true,          
                changOrigin: true, //允许跨域
                pathRewrite: {
                    '^/message': '/message'//请求的时候使用这个api就可以
                }
            },
            'signon': {
                target: 'http://localhost:8080/', //这里后台的地址模拟的;应该填写你们真实的后台接口192.168.88.192
                ws: true,          
                changOrigin: true, //允许跨域
                pathRewrite: {  
                    '^/signon': '/signon' //请求的时候使用这个api就可以
                }
            },
        }
    }
}

