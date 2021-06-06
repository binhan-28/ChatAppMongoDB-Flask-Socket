document.addEventListener('DOMContentLoaded', () => {

    //Kết nối với websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
//      const socket = io.connect("http://127.0.0.1:5000");

    // truy xuất tên người dùng
    const username = document.querySelector('#get-username').innerHTML;

    //truy xuất phòng chat
    const room = document.querySelector('#room_name').innerHTML;
    // Set default room
//    let room = "Lounge"
//    joinRoom("Lounge");


    //Gửi tin nhắn

    document.querySelector('#send_message').onclick = () => {
        socket.emit('incoming-msg', {'message': document.querySelector('#user_message').value,
            'username': username, 'room': room});

        document.querySelector('#user_message').value = '';
    };

    // Hiển thị tất cả các tin nhắn đến
    socket.on('message', data => {

        // Hiển thị tin nhắn hiện tại
        if (data.message) {
            const p = document.createElement('p');
            const span_username = document.createElement('span');
            const span_timestamp = document.createElement('span');
            const br = document.createElement('br')
            // hiển thị thông điệp của chính người dùng
            if (data.username == username) {
                    p.setAttribute("class", "my-msg");

                    // Tên
                    span_username.setAttribute("class", "my-username");
                    span_username.innerText = data.username;

                    // thời gian
                    span_timestamp.setAttribute("class", "timestamp");
                    span_timestamp.innerText = data.time_stamp;

                    // HTML to append
                    p.innerHTML += span_username.outerHTML + br.outerHTML + data.message + br.outerHTML + span_timestamp.outerHTML

                    //Append
                    document.querySelector('#display-message-section').append(p);
            }
            // hiển thị tin nhắn của người khác
            else if (typeof data.username !== 'undefined') {
                p.setAttribute("class", "others-msg");

                // Username
                span_username.setAttribute("class", "other-username");
                span_username.innerText = data.username;

                // Timestamp
                span_timestamp.setAttribute("class", "timestamp");
                span_timestamp.innerText = data.time_stamp;

                // HTML to append
                p.innerHTML += span_username.outerHTML + br.outerHTML + data.message + br.outerHTML + span_timestamp.outerHTML;

                //Append
                document.querySelector('#display-message-section').append(p);
            }
            //hiển thị thông báo hệ thống
            else {
                printSysMsg(data.message);
            }


        }
        scrollDownChatWindow();
    });

    // Select a room
    document.querySelectorAll('.select-room').forEach(p => {
        p.onclick = () => {
            let newRoom = p.innerHTML
            // Check if user already in the room
            if (newRoom === room) {
                message = `You are already in ${room} room.`;
                printSysMsg(msg);
            } else {
                leaveRoom(room);
                joinRoom(newRoom);
                room = newRoom;
            }
        };
    });

    // Logout from chat
    document.querySelector("#logout-btn").onclick = () => {
        leaveRoom(room);
    };

    // Trigger 'leave' event if user was previously on a room
    function leaveRoom(room) {
        socket.emit('leave', {'username': username, 'room': room});

        document.querySelectorAll('.select-room').forEach(p => {
            p.style.color = "black";
        });
    }

    // Trigger 'join' event
    function joinRoom(room) {

        // Join room
        socket.emit('join', {'username': username, 'room': room});

        // Highlight selected room
        document.querySelector('#' + CSS.escape(room)).style.color = "#ffc107";
        document.querySelector('#' + CSS.escape(room)).style.backgroundColor = "white";

        // Clear message area
        document.querySelector('#display-message-section').innerHTML = '';

        // Autofocus on text box
        document.querySelector("#user_message").focus();
    }

    // Cuộn cửa sổ
    function scrollDownChatWindow() {
        const chatWindow = document.querySelector("#display-message-section");
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    // Print system messages
    function printSysMsg(message) {
        const p = document.createElement('p');
        p.setAttribute("class", "system-msg");
        p.innerHTML = messages;
        document.querySelector('#display-message-section').append(p);
        scrollDownChatWindow()

        // Autofocus on text box
        document.querySelector("#user_message").focus();
    }
});