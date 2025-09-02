const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Store active meetings
const activeMeetings = new Map();
const meetingParticipants = new Map();

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join meeting room
    socket.on('join-meeting', (data) => {
        const { meetingCode, userName } = data;
        const meeting = activeMeetings.get(meetingCode);
        
        if (meeting) {
            if (meeting.participants.length >= meeting.teamSize) {
                socket.emit('join-error', 'Meeting is full!');
                return;
            }
            
            // Add participant to meeting
            meeting.participants.push(userName);
            meetingParticipants.set(socket.id, { meetingCode, userName });
            
            // Join socket room
            socket.join(meetingCode);
            
            // Notify all participants
            io.to(meetingCode).emit('participant-joined', {
                userName,
                participants: meeting.participants,
                participantCount: meeting.participants.length
            });
            
            socket.emit('join-success', {
                meeting,
                participants: meeting.participants
            });
        } else {
            socket.emit('join-error', 'Invalid meeting code!');
        }
    });

    // Create new meeting
    socket.on('create-meeting', (data) => {
        const { creatorName, projectType, teamSize } = data;
        const meetingCode = generateMeetingCode();
        
        const meeting = {
            code: meetingCode,
            creator: creatorName,
            projectType,
            teamSize: parseInt(teamSize),
            participants: [creatorName],
            createdAt: new Date().toISOString(),
            status: 'active'
        };
        
        activeMeetings.set(meetingCode, meeting);
        meetingParticipants.set(socket.id, { meetingCode, userName: creatorName });
        
        socket.join(meetingCode);
        
        socket.emit('meeting-created', {
            meeting,
            meetingLink: `${process.env.BASE_URL || 'http://localhost:3000'}/join?code=${meetingCode}`
        });
    });

    // Send chat message
    socket.on('send-message', (data) => {
        const { meetingCode, message, sender } = data;
        const meeting = activeMeetings.get(meetingCode);
        
        if (meeting) {
            const chatMessage = {
                sender,
                message,
                timestamp: new Date().toISOString()
            };
            
            // Store message in meeting
            if (!meeting.chat) meeting.chat = [];
            meeting.chat.push(chatMessage);
            
            // Broadcast to all participants
            io.to(meetingCode).emit('new-message', chatMessage);
        }
    });

    // Disconnect handling
    socket.on('disconnect', () => {
        const participant = meetingParticipants.get(socket.id);
        if (participant) {
            const { meetingCode, userName } = participant;
            const meeting = activeMeetings.get(meetingCode);
            
            if (meeting) {
                // Remove participant
                meeting.participants = meeting.participants.filter(p => p !== userName);
                meetingParticipants.delete(socket.id);
                
                // Notify remaining participants
                io.to(meetingCode).emit('participant-left', {
                    userName,
                    participants: meeting.participants,
                    participantCount: meeting.participants.length
                });
                
                // Remove meeting if no participants left
                if (meeting.participants.length === 0) {
                    activeMeetings.delete(meetingCode);
                }
            }
        }
        console.log('User disconnected:', socket.id);
    });
});

// API endpoints
app.get('/api/meetings/:code', (req, res) => {
    const { code } = req.params;
    const meeting = activeMeetings.get(code);
    
    if (meeting) {
        res.json({ success: true, meeting });
    } else {
        res.status(404).json({ success: false, error: 'Meeting not found' });
    }
});

app.get('/api/meetings/:code/participants', (req, res) => {
    const { code } = req.params;
    const meeting = activeMeetings.get(code);
    
    if (meeting) {
        res.json({ success: true, participants: meeting.participants });
    } else {
        res.status(404).json({ success: false, error: 'Meeting not found' });
    }
});

// Serve the join page
app.get('/join', (req, res) => {
    res.sendFile(path.join(__dirname, 'join.html'));
});

// Utility functions
function generateMeetingCode() {
    return Math.random().toString().substr(2, 6);
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Access your app at: http://localhost:${PORT}`);
    console.log(`Join meetings at: http://localhost:${PORT}/join?code=MEETING_CODE`);
});


