# eth-booklibrary
以太坊图书馆


# 调试环境准备

- 安装`nodejs`
- truffle
- anache-cli
- lite-server

后三个都通过npm安装即可（切换到clone的目录下执行）

打开控制台

	ganache-cli -a 4 -b 10

再打开一个控制台，cd到clone的目录下执行以下命令

	npm init
	npm install
	truffle init
	truffle compile
	truffle migrate
	npm run dev
	
即可