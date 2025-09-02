# 🚀 RNG.AI Cross-Device Meeting System

## 📋 Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Server
```bash
npm start
```

### 3. Access Your App
- **Main App**: http://localhost:3000
- **Workspace**: http://localhost:3000/workspace.html
- **Join Page**: http://localhost:3000/join

## 🔗 How Cross-Device Works

### For Host (Meeting Creator):
1. Go to `workspace.html`
2. Fill in your name, project type, and team size
3. Click "Create Meeting"
4. Copy the generated **Meeting Link** and **Meeting Code**
5. Share with your team members

### For Team Members (Joiners):
1. Click the **Meeting Link** from host (or go to `/join`)
2. Enter your name and the **Meeting Code**
3. Join the meeting from any device (laptop, phone, tablet)

## 🌐 Cross-Device Features

✅ **Works on different laptops**  
✅ **Works on phones and tablets**  
✅ **Real-time chat** across all devices  
✅ **Live participant updates**  
✅ **Professional join interface**  

## 📱 Mobile Responsive

The system automatically adapts to:
- Desktop screens
- Tablet screens  
- Mobile phone screens
- Different orientations

## 🚨 Troubleshooting

### If meetings don't work:
1. Make sure server is running (`npm start`)
2. Check browser console for errors
3. Ensure all team members use the same meeting code
4. Verify network connectivity

### If join page doesn't load:
1. Check server is running on port 3000
2. Verify `/join` route is accessible
3. Check browser console for Socket.IO errors

## 🔧 Technical Details

- **Backend**: Node.js + Express + Socket.IO
- **Frontend**: HTML5 + CSS3 + JavaScript
- **Real-time**: WebSocket connections via Socket.IO
- **Storage**: In-memory meeting storage (resets on server restart)

## 📞 Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify the server is running and accessible
3. Ensure all dependencies are installed correctly
