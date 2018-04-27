App = {
  web3Provider: null,
  contracts: {},
  book: {},
  account: null,

  init: function() {
    return App.initWeb3();
  },
  
  initWeb3: function() {
	if (typeof web3 !== 'undefined') {
		App.web3Provider = web3.currentProvider;
	} else {
		// If no injected web3 instance is detected, fall back to Ganache
		App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
	}
	web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function() {
	$.getJSON('Library.json', function(data) {
		var LibraryArtifact = data;
		App.contracts.Library = TruffleContract(LibraryArtifact);

		// Set the provider for our contract
		App.contracts.Library.setProvider(App.web3Provider);
	});
    return App.bindEvents();
  },

  bindEvents: function() {
  	// 获取所有帐号
  	App.initAccount();
  	// 帐号切换后
  	App.switchAccount();
  	// 获取所有书本
	App.initBook();
	// 按钮事件
	setTimeout(function(){App.initBookClick();}, 1000);
	// 监听
	setTimeout(App.setWatch, 1000);
  },
  // 监听
  setWatch: function() {
  	App.contracts.Library.deployed().then(function(instance) {
		// 借出事件
		var e1 = instance.BorrowEvent({fromBlock: "latest"});
		e1.watch(function(error, result) {
		  if (error == null) {
			var borrower = result.args._from;
			var bookid = result.args._bookid;
			if ( borrower == App.account ) {
				$('#book-'+bookid).find('button').html('归还');
				$('#book-'+bookid).find('button').attr('disabled', false);
			} else {
				$('#book-'+bookid).find('button').html('已借出');
				$('#book-'+bookid).find('button').attr('disabled', true);
			}
			App.addRecord(bookid, borrower, 1);
		  }
		});
		// 归还事件
		var e2 = instance.RebackEvent({fromBlock: "latest"});
		e2.watch(function(error, result) {
		  if (error == null) {
			var borrower = result.args._from;
			var bookid = result.args._bookid;
			$('#book-'+bookid).find('button').html('申请借阅');
			$('#book-'+bookid).find('button').attr('disabled', false);
			App.addRecord(bookid, borrower, 2);
		  }
		});
	});
  },
  // 获取当前时间
  getNowTime: function() {
  	var time = new Date();  
	var m = time.getMonth() + 1;   
	var t = time.getFullYear() + "-" + m + "-"     
	+ time.getDate() + " " + time.getHours() + ":"     
	+ time.getMinutes();
	return t;
  },
  // 添加记录
  addRecord: function(bookid, user, type) {
  	var desc = '借阅';
  	if ( type != 1 ) {
  		desc = '归还';
  	}
  	var tr = $('<tr>');
  	$(tr).append('<td>'+user+'</td>');
  	$(tr).append('<td>'+desc+'</td>');
  	$(tr).append('<td>'+bookid+'</td>');
  	$(tr).append('<td>'+App.getNowTime()+'</td>');
  	$('#book-record tbody').append($(tr));
  },
  // 图书按钮点击事件
  initBookClick: function() {
  	$('.btn-book').on('click', function(){
  		var txt = $(this).text();
  		var id = $(this).attr('data-id');
  		if ( txt == '申请借阅' ) {
  			$('#book-'+id).find('button').html('<img src="static/images/loading.gif" alt="">');
  			App.contracts.Library.deployed().then(function(instance) {
  				instance.borrow(id, {from: App.account, gas: 2000000}).then(function(tx_id) {
				}).catch(function(e) {
					$('#book-'+id).find('button').html(txt);
					console.log(e);
				});
  			});
  		} else if( txt == '归还' ) {
  			$('#book-'+id).find('button').html('<img src="static/images/loading.gif" alt="">');
  			App.contracts.Library.deployed().then(function(instance) {
  				instance.reback(id, {from: App.account, gas: 2000000}).then(function(tx_id) {
				}).catch(function(e) {
					$('#book-'+id).find('button').html(txt);
					console.log(e);
				});
  			});
  		} else {
  			
  		}
  		return;
  	});
  },
  switchAccount: function() {
  	$('#account').on('change', function(){
  		var account = $(this).val();
  		if ( account ) {
  			App.account = account;
  			App.initBookStatus();
  		}
  	});
  },
  initAccount: function() {
  	// 列出所有帐号
  	web3.eth.getAccounts(function(error, accounts) {
		if (error) console.log(error);
		for(var i in accounts) {
			var op = $('<option>');
			$(op).text(accounts[i]);
			$(op).val(accounts[i]);
			$('#account').append($(op));
		}
	});
  },
  initBookStatus: function() {
  	// 初始化所有图书的状态
  	App.contracts.Library.deployed().then(function(instance) {
	  for(var i in App.book) {
	  	var id = App.book[i].id;
	  	(function(id){
	  		instance.getBookStatus.call(id, {from: App.account}).then(function(d){
		  		var bookCon = $('#book-'+id);
		  		var s = d.toNumber();
				if(s == 1) {
					// 已借出
					$(bookCon).find('button').html('已借出');
					$(bookCon).find('button').attr('disabled', true);
				} else if(s == 2) {
					// 归还
					$(bookCon).find('button').html('归还');
					$(bookCon).find('button').attr('disabled', false);
				} else {
					// 可借
					$(bookCon).find('button').html('申请借阅');
					$(bookCon).find('button').attr('disabled', false);
				}
			});
	  	})(id)
	  }
	}).catch(function(err) {
	  console.log(err.message);
	});
  },
  // 拉取图书
  initBook: function() {
  	$.getJSON('static/js/book.json', function(data){
  		App.book = data;
  		for(var i in data) {
  			var bookHtml = $('#book-tpl').clone();
  			$(bookHtml).find('h3').text(data[i].name);
  			$(bookHtml).find('.img-center').attr('src', data[i].img);
  			$(bookHtml).find('.isbn').text(data[i].isbn);
  			$(bookHtml).find('.author').text(data[i].author);
  			$(bookHtml).find('.pubtime').text(data[i].publish);
  			$(bookHtml).find('button').attr('data-id', data[i].id);
  			$(bookHtml).removeClass('hide');
  			$(bookHtml).attr('id', 'book-'+data[i].id);
  			$('#book-con').append($(bookHtml));
  		}
  	});
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
