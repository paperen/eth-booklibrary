pragma solidity ^0.4.17;

contract Library {

	// 图书状态
	mapping (uint256 => address) bookStatus;
	
	// 借出事件
	event BorrowEvent(address indexed _from, uint256 _bookid, uint256 _cost);
	// 归还事件
	event RebackEvent(address indexed _from, uint256 _bookid);

	// 记录结构体
	struct Record {
        address user;
        uint256 time;
        int rtype;
    }

    // 记录
    mapping (uint256 => Record[]) record;

	// 借书
	function borrow(uint256 id) public payable returns(bool) {
		require(id > 0);
		require(bookStatus[id] == 0x0);

		record[id].push(Record({
			user: msg.sender,
			time: now,
			rtype: 1
		}));
		bookStatus[id] = msg.sender;

		BorrowEvent(msg.sender, id, msg.value);

		return true;
	}

	// 还书
	function reback(uint256 id) public returns(bool) {
		require(id > 0);
		require(bookStatus[id] == msg.sender);

		record[id].push(Record({
			user: msg.sender,
			time: now,
			rtype: 1
		}));
		bookStatus[id] = 0x0;

		RebackEvent(msg.sender, id);

		return true;
	}

	function getBookStatus(uint256 id) public view returns(int) {
		int status = 0;
		if ( bookStatus[id] == 0x0 ) {
			status = 0;
		} else {
			if ( bookStatus[id] == msg.sender ) {
				status = 2;
			} else {
				status = 1;
			}
		}
		return status;
	}

	function getBookBorrower(uint256 id) public view returns(address) {
		return bookStatus[id];
	}
}