module.exports = {
    devServer: {
        // port: 8080, // 클라이언트 포트 번호
        // proxy: {
        //     '/api/': { // /api/로 시작하는 url은 아래의 전체 도메인을 추가하고, 옵션을 적용
        //         target: 'http://localhost:8080', // 클라이언트에서 api로 보내는 요청은 주소를 3095로 바꿔서 보내겠다 라는 뜻
        //         changeOrigin: true, // cross origin 허용 설정
        //     },
        // },
    },
    transpileDependencies: [
        'vuetify'
    ],
    pluginOptions: {
        electronBuilder: {
            // List native deps here if they don't work
            externals: [''],
            // If you are using Yarn Workspaces, you may have multiple node_modules folders
            // List them all here so that VCP Electron Builder can find them
            nodeModulesPath: ['../../node_modules', './node_modules'],
            builderOptions: {
                // options placed here will be merged with default configuration and passed to electron-builder
                appId: 'kr.re.keti.app',
                productName: "ve-gcsmap",
                win: {
                    icon: "./public/logo.png",
                    target: [
                        {
                            target: "nsis",
                            arch: ["x64", "ia32"]
                        }
                    ]
                },
                nsis:{
                    oneClick: false,
                    perMachine: true,
                    allowToChangeInstallationDirectory: true
                },
                // publish: [
                //     {
                //         provider: "github",
                //         owner: "IoTKETI",
                //         releaseType: "release",
                //         channel: "latest",
                //         url: "https://github.com/IoTKETI/ve-gcsmap.git",
                //         private: true,
                //         token: process.env.GH_TOKEN
                //     }
                // ]
            }
        }
    }
}
