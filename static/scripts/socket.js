const socket = io.connect("http://127.0.0.1:5000");

    socket.on('connect', function () {
        socket.emit('join_room', {
            username: "{{ username }}",
            room: "{{ room._id }}"
        });

        let message_input = document.getElementById('message_input');

        document.getElementById('message_input_form').onsubmit = function (e) {
            e.preventDefault();
            let message = message_input.value.trim();
            if (message.length) {
                socket.emit('send_message', {
                    username: "{{ username }}",
                    room: "{{ room._id }}",
                    message: message
                })
            }
            message_input.value = '';
            message_input.focus();
        }
    });

    let page = 0;

    document.getElementById("load_older_messages_btn").onclick = (e) => {
        page += 1;
        fetch("/rooms/{{ room._id }}/messages?page=" + page, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(response => {
            response.json().then(messages => {
                messages.reverse().forEach(message => prepend_message(message.text, message.sender, message.created_at));
            })
        })
    };

    function prepend_message(message, username, created_at) {
        const newNode = document.createElement('div');
        newNode.innerHTML = `<b>${username}&nbsp;[${created_at}]:&nbsp;</b> ${message}`;
        const messages_div = document.getElementById('messages');
        messages_div.insertBefore(newNode, messages_div.firstChild);
    }

    window.onbeforeunload = function () {
        socket.emit('leave_room', {
            username: "{{ username }}",
            room: "{{ room._id }}"
        })
    };

    socket.on('receive_message', function (data) {
        console.log(data);
        const newNode = document.createElement('div');
        newNode.innerHTML = `<b>${data.username}&nbsp;[${data.created_at}]:&nbsp;</b> ${data.message}`;
        document.getElementById('messages').appendChild(newNode);
    });

    socket.on('join_room_announcement', function (data) {
        console.log(data);
        if (data.username !== "{{ username }}") {
            const newNode = document.createElement('div');
            newNode.innerHTML = `<b>${data.username}</b> has joined the room`;
            document.getElementById('messages').appendChild(newNode);
        }
    });

    socket.on('leave_room_announcement', function (data) {
        console.log(data);
        const newNode = document.createElement('div');
        newNode.innerHTML = `<b>${data.username}</b> has left the room`;
        document.getElementById('messages').appendChild(newNode);
    });