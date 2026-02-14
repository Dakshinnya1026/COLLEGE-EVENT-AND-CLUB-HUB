// Data Storage
const storage = {
    users: JSON.parse(localStorage.getItem('users')) || [],
    clubs: JSON.parse(localStorage.getItem('clubs')) || [],
    events: JSON.parse(localStorage.getItem('events')) || [],
    registrations: JSON.parse(localStorage.getItem('registrations')) || [],
    currentUser: JSON.parse(localStorage.getItem('currentUser')) || null
};

// Initialize admin user
if (storage.users.length === 0) {
    storage.users.push({
        id: 1,
        email: 'admin@college.edu',
        password: 'admin123',
        name: 'Admin User',
        role: 'admin',
        studentId: 'ADMIN001'
    });
    saveData();
}

function saveData() {
    localStorage.setItem('users', JSON.stringify(storage.users));
    localStorage.setItem('clubs', JSON.stringify(storage.clubs));
    localStorage.setItem('events', JSON.stringify(storage.events));
    localStorage.setItem('registrations', JSON.stringify(storage.registrations));
    localStorage.setItem('currentUser', JSON.stringify(storage.currentUser));
}

// Router
const routes = {
    login: renderLogin,
    register: renderRegister,
    studentDashboard: renderStudentDashboard,
    adminDashboard: renderAdminDashboard,
    profile: renderProfile,
    clubs: renderClubs,
    clubDetails: renderClubDetails,
    events: renderEvents,
    eventDetails: renderEventDetails,
    myEvents: renderMyEvents,
    manageUsers: renderManageUsers,
    manageClubs: renderManageClubs,
    manageEvents: renderManageEvents
};

function navigate(route, params = {}) {
    if (!storage.currentUser && route !== 'login' && route !== 'register') {
        route = 'login';
    }
    
    const app = document.getElementById('app');
    app.innerHTML = '';
    
    if (routes[route]) {
        routes[route](params);
    }
}

function showAlert(message, type = 'success') {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    document.querySelector('.container').prepend(alert);
    setTimeout(() => alert.remove(), 3000);
}

// Authentication Module
function renderLogin() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="container">
            <div class="header">
                <h1>🎓 College Event Management</h1>
                <p>Login to your account</p>
            </div>
            <form id="loginForm">
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="email" required>
                </div>
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" id="password" required>
                </div>
                <button type="submit" class="btn btn-primary">Login</button>
                <button type="button" class="btn btn-secondary" onclick="navigate('register')">Register</button>
            </form>
        </div>
    `;
    
    document.getElementById('loginForm').onsubmit = (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        const user = storage.users.find(u => u.email === email && u.password === password);
        if (user) {
            storage.currentUser = user;
            saveData();
            navigate(user.role === 'admin' ? 'adminDashboard' : 'studentDashboard');
        } else {
            alert('Invalid credentials');
        }
    };
}

function renderRegister() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="container">
            <div class="header">
                <h1>Student Registration</h1>
            </div>
            <form id="registerForm">
                <div class="form-group">
                    <label>Name</label>
                    <input type="text" id="name" required>
                </div>
                <div class="form-group">
                    <label>Student ID</label>
                    <input type="text" id="studentId" required>
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="email" required>
                </div>
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" id="password" required>
                </div>
                <button type="submit" class="btn btn-primary">Register</button>
                <button type="button" class="btn btn-secondary" onclick="navigate('login')">Back to Login</button>
            </form>
        </div>
    `;
    
    document.getElementById('registerForm').onsubmit = (e) => {
        e.preventDefault();
        const newUser = {
            id: Date.now(),
            name: document.getElementById('name').value,
            studentId: document.getElementById('studentId').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            role: 'student',
            clubs: []
        };
        
        storage.users.push(newUser);
        saveData();
        alert('Registration successful! Please login.');
        navigate('login');
    };
}

function logout() {
    storage.currentUser = null;
    saveData();
    navigate('login');
}

// Dashboard Module
function renderStudentDashboard() {
    const myEvents = storage.registrations.filter(r => r.userId === storage.currentUser.id);
    const myClubs = storage.clubs.filter(c => c.members?.includes(storage.currentUser.id));
    
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="container">
            <div class="header">
                <h1>Welcome, ${storage.currentUser.name}!</h1>
            </div>
            <div class="nav">
                <button class="btn btn-primary" onclick="navigate('events')">📅 Events</button>
                <button class="btn btn-primary" onclick="navigate('clubs')">🏫 Clubs</button>
                <button class="btn btn-primary" onclick="navigate('myEvents')">📌 My Events</button>
                <button class="btn btn-primary" onclick="navigate('profile')">👤 Profile</button>
                <button class="btn btn-danger" onclick="logout()">Logout</button>
            </div>
            <div class="dashboard-stats">
                <div class="stat-card">
                    <h3>${myEvents.length}</h3>
                    <p>Registered Events</p>
                </div>
                <div class="stat-card">
                    <h3>${myClubs.length}</h3>
                    <p>Joined Clubs</p>
                </div>
                <div class="stat-card">
                    <h3>${storage.events.length}</h3>
                    <p>Total Events</p>
                </div>
            </div>
            <h2>Upcoming Events</h2>
            <div class="grid" id="upcomingEvents"></div>
        </div>
    `;
    
    const upcomingEvents = storage.events.slice(0, 6);
    const container = document.getElementById('upcomingEvents');
    upcomingEvents.forEach(event => {
        container.innerHTML += `
            <div class="card">
                <h3>${event.name}</h3>
                <p>📅 ${event.date}</p>
                <p>🏫 ${event.club}</p>
                <button class="btn btn-primary" onclick="navigate('eventDetails', {id: ${event.id}})">View Details</button>
            </div>
        `;
    });
}

function renderAdminDashboard() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="container">
            <div class="header">
                <h1>Admin Dashboard</h1>
            </div>
            <div class="nav">
                <button class="btn btn-primary" onclick="navigate('manageUsers')">👥 Manage Users</button>
                <button class="btn btn-primary" onclick="navigate('manageClubs')">🏫 Manage Clubs</button>
                <button class="btn btn-primary" onclick="navigate('manageEvents')">📅 Manage Events</button>
                <button class="btn btn-primary" onclick="navigate('profile')">👤 Profile</button>
                <button class="btn btn-danger" onclick="logout()">Logout</button>
            </div>
            <div class="dashboard-stats">
                <div class="stat-card">
                    <h3>${storage.users.length}</h3>
                    <p>Total Users</p>
                </div>
                <div class="stat-card">
                    <h3>${storage.clubs.length}</h3>
                    <p>Total Clubs</p>
                </div>
                <div class="stat-card">
                    <h3>${storage.events.length}</h3>
                    <p>Total Events</p>
                </div>
                <div class="stat-card">
                    <h3>${storage.registrations.length}</h3>
                    <p>Total Registrations</p>
                </div>
            </div>
        </div>
    `;
}

// User Module
function renderProfile() {
    const app = document.getElementById('app');
    const isAdmin = storage.currentUser.role === 'admin';
    
    app.innerHTML = `
        <div class="container">
            <div class="header">
                <h1>My Profile</h1>
            </div>
            <button class="btn btn-secondary" onclick="navigate('${isAdmin ? 'adminDashboard' : 'studentDashboard'}')">← Back</button>
            <form id="profileForm" style="margin-top: 20px;">
                <div class="form-group">
                    <label>Name</label>
                    <input type="text" id="name" value="${storage.currentUser.name}" required>
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="email" value="${storage.currentUser.email}" required>
                </div>
                <div class="form-group">
                    <label>Student ID</label>
                    <input type="text" value="${storage.currentUser.studentId}" disabled>
                </div>
                <button type="submit" class="btn btn-success">Update Profile</button>
            </form>
            <h3 style="margin-top: 30px;">Change Password</h3>
            <form id="passwordForm">
                <div class="form-group">
                    <label>New Password</label>
                    <input type="password" id="newPassword" required>
                </div>
                <button type="submit" class="btn btn-success">Change Password</button>
            </form>
        </div>
    `;
    
    document.getElementById('profileForm').onsubmit = (e) => {
        e.preventDefault();
        storage.currentUser.name = document.getElementById('name').value;
        storage.currentUser.email = document.getElementById('email').value;
        
        const userIndex = storage.users.findIndex(u => u.id === storage.currentUser.id);
        storage.users[userIndex] = storage.currentUser;
        saveData();
        showAlert('Profile updated successfully!');
    };
    
    document.getElementById('passwordForm').onsubmit = (e) => {
        e.preventDefault();
        storage.currentUser.password = document.getElementById('newPassword').value;
        
        const userIndex = storage.users.findIndex(u => u.id === storage.currentUser.id);
        storage.users[userIndex] = storage.currentUser;
        saveData();
        showAlert('Password changed successfully!');
        document.getElementById('newPassword').value = '';
    };
}

// Initialize
navigate('login');

// Club Module
function renderClubs() {
    const app = document.getElementById('app');
    const isAdmin = storage.currentUser.role === 'admin';
    
    app.innerHTML = `
        <div class="container">
            <div class="header">
                <h1>🏫 Clubs</h1>
            </div>
            <button class="btn btn-secondary" onclick="navigate('${isAdmin ? 'adminDashboard' : 'studentDashboard'}')">← Back</button>
            ${isAdmin ? '<button class="btn btn-success" onclick="showCreateClubForm()">+ Create Club</button>' : ''}
            <div id="createClubForm" class="hidden" style="margin-top: 20px;">
                <h3>Create New Club</h3>
                <form id="clubForm">
                    <div class="form-group">
                        <label>Club Name</label>
                        <input type="text" id="clubName" required>
                    </div>
                    <div class="form-group">
                        <label>Description</label>
                        <textarea id="clubDesc" rows="3" required></textarea>
                    </div>
                    <button type="submit" class="btn btn-success">Create</button>
                    <button type="button" class="btn btn-secondary" onclick="hideCreateClubForm()">Cancel</button>
                </form>
            </div>
            <div class="grid" id="clubsList" style="margin-top: 20px;"></div>
        </div>
    `;
    
    renderClubsList();
    
    if (isAdmin) {
        document.getElementById('clubForm').onsubmit = (e) => {
            e.preventDefault();
            const newClub = {
                id: Date.now(),
                name: document.getElementById('clubName').value,
                description: document.getElementById('clubDesc').value,
                members: [],
                createdBy: storage.currentUser.id
            };
            storage.clubs.push(newClub);
            saveData();
            showAlert('Club created successfully!');
            hideCreateClubForm();
            renderClubsList();
        };
    }
}

function renderClubsList() {
    const container = document.getElementById('clubsList');
    container.innerHTML = '';
    
    storage.clubs.forEach(club => {
        const isMember = club.members?.includes(storage.currentUser.id);
        const isAdmin = storage.currentUser.role === 'admin';
        
        container.innerHTML += `
            <div class="card">
                <h3>${club.name}</h3>
                <p>${club.description}</p>
                <p>👥 ${club.members?.length || 0} members</p>
                <button class="btn btn-primary" onclick="navigate('clubDetails', {id: ${club.id}})">View Details</button>
                ${!isAdmin && !isMember ? `<button class="btn btn-success" onclick="joinClub(${club.id})">Join</button>` : ''}
                ${!isAdmin && isMember ? `<button class="btn btn-danger" onclick="leaveClub(${club.id})">Leave</button>` : ''}
                ${isAdmin ? `<button class="btn btn-danger" onclick="deleteClub(${club.id})">Delete</button>` : ''}
            </div>
        `;
    });
}

function showCreateClubForm() {
    document.getElementById('createClubForm').classList.remove('hidden');
}

function hideCreateClubForm() {
    document.getElementById('createClubForm').classList.add('hidden');
    document.getElementById('clubForm').reset();
}

function renderClubDetails(params) {
    const club = storage.clubs.find(c => c.id === params.id);
    if (!club) return;
    
    const members = storage.users.filter(u => club.members?.includes(u.id));
    const clubEvents = storage.events.filter(e => e.clubId === club.id);
    
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="container">
            <div class="header">
                <h1>${club.name}</h1>
            </div>
            <button class="btn btn-secondary" onclick="navigate('clubs')">← Back to Clubs</button>
            <div style="margin-top: 20px;">
                <h3>About</h3>
                <p>${club.description}</p>
                <h3 style="margin-top: 20px;">Members (${members.length})</h3>
                <div id="membersList"></div>
                <h3 style="margin-top: 20px;">Events (${clubEvents.length})</h3>
                <div class="grid" id="clubEvents"></div>
            </div>
        </div>
    `;
    
    const membersList = document.getElementById('membersList');
    members.forEach(member => {
        membersList.innerHTML += `<p>• ${member.name} (${member.studentId})</p>`;
    });
    
    const eventsContainer = document.getElementById('clubEvents');
    clubEvents.forEach(event => {
        eventsContainer.innerHTML += `
            <div class="card">
                <h3>${event.name}</h3>
                <p>📅 ${event.date}</p>
                <button class="btn btn-primary" onclick="navigate('eventDetails', {id: ${event.id}})">View Details</button>
            </div>
        `;
    });
}

function joinClub(clubId) {
    const club = storage.clubs.find(c => c.id === clubId);
    if (!club.members) club.members = [];
    club.members.push(storage.currentUser.id);
    saveData();
    showAlert('Joined club successfully!');
    renderClubsList();
}

function leaveClub(clubId) {
    const club = storage.clubs.find(c => c.id === clubId);
    club.members = club.members.filter(id => id !== storage.currentUser.id);
    saveData();
    showAlert('Left club successfully!');
    renderClubsList();
}

function deleteClub(clubId) {
    if (confirm('Are you sure you want to delete this club?')) {
        storage.clubs = storage.clubs.filter(c => c.id !== clubId);
        saveData();
        showAlert('Club deleted successfully!');
        renderClubsList();
    }
}

// Event Module
function renderEvents() {
    const app = document.getElementById('app');
    const isAdmin = storage.currentUser.role === 'admin';
    
    app.innerHTML = `
        <div class="container">
            <div class="header">
                <h1>📅 Events</h1>
            </div>
            <button class="btn btn-secondary" onclick="navigate('${isAdmin ? 'adminDashboard' : 'studentDashboard'}')">← Back</button>
            ${isAdmin ? '<button class="btn btn-success" onclick="showCreateEventForm()">+ Create Event</button>' : ''}
            <div id="createEventForm" class="hidden" style="margin-top: 20px;">
                <h3>Create New Event</h3>
                <form id="eventForm">
                    <div class="form-group">
                        <label>Event Name</label>
                        <input type="text" id="eventName" required>
                    </div>
                    <div class="form-group">
                        <label>Description</label>
                        <textarea id="eventDesc" rows="3" required></textarea>
                    </div>
                    <div class="form-group">
                        <label>Date</label>
                        <input type="date" id="eventDate" required>
                    </div>
                    <div class="form-group">
                        <label>Club</label>
                        <select id="eventClub" required>
                            <option value="">Select Club</option>
                            ${storage.clubs.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Venue</label>
                        <input type="text" id="eventVenue" required>
                    </div>
                    <button type="submit" class="btn btn-success">Create</button>
                    <button type="button" class="btn btn-secondary" onclick="hideCreateEventForm()">Cancel</button>
                </form>
            </div>
            <div class="search-filter" style="margin-top: 20px;">
                <input type="text" id="searchEvent" placeholder="🔍 Search events..." onkeyup="filterEvents()">
                <select id="filterClub" onchange="filterEvents()">
                    <option value="">All Clubs</option>
                    ${storage.clubs.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                </select>
                <input type="date" id="filterDate" onchange="filterEvents()">
            </div>
            <div class="grid" id="eventsList"></div>
        </div>
    `;
    
    renderEventsList();
    
    if (isAdmin) {
        document.getElementById('eventForm').onsubmit = (e) => {
            e.preventDefault();
            const clubId = parseInt(document.getElementById('eventClub').value);
            const club = storage.clubs.find(c => c.id === clubId);
            
            const newEvent = {
                id: Date.now(),
                name: document.getElementById('eventName').value,
                description: document.getElementById('eventDesc').value,
                date: document.getElementById('eventDate').value,
                clubId: clubId,
                club: club.name,
                venue: document.getElementById('eventVenue').value,
                createdBy: storage.currentUser.id
            };
            storage.events.push(newEvent);
            saveData();
            showAlert('Event created successfully!');
            hideCreateEventForm();
            renderEventsList();
        };
    }
}

function renderEventsList(filteredEvents = null) {
    const container = document.getElementById('eventsList');
    container.innerHTML = '';
    
    const eventsToShow = filteredEvents || storage.events;
    
    eventsToShow.forEach(event => {
        const isRegistered = storage.registrations.some(r => r.eventId === event.id && r.userId === storage.currentUser.id);
        const isAdmin = storage.currentUser.role === 'admin';
        
        container.innerHTML += `
            <div class="card">
                <h3>${event.name}</h3>
                <p>${event.description}</p>
                <p>📅 ${event.date}</p>
                <p>🏫 ${event.club}</p>
                <p>📍 ${event.venue}</p>
                <button class="btn btn-primary" onclick="navigate('eventDetails', {id: ${event.id}})">View Details</button>
                ${!isAdmin && !isRegistered ? `<button class="btn btn-success" onclick="registerForEvent(${event.id})">Register</button>` : ''}
                ${!isAdmin && isRegistered ? `<button class="btn btn-danger" onclick="cancelRegistration(${event.id})">Cancel</button>` : ''}
            </div>
        `;
    });
}

function showCreateEventForm() {
    document.getElementById('createEventForm').classList.remove('hidden');
}

function hideCreateEventForm() {
    document.getElementById('createEventForm').classList.add('hidden');
    document.getElementById('eventForm').reset();
}

function filterEvents() {
    const searchTerm = document.getElementById('searchEvent').value.toLowerCase();
    const clubFilter = document.getElementById('filterClub').value;
    const dateFilter = document.getElementById('filterDate').value;
    
    let filtered = storage.events.filter(event => {
        const matchesSearch = event.name.toLowerCase().includes(searchTerm) || 
                            event.description.toLowerCase().includes(searchTerm);
        const matchesClub = !clubFilter || event.clubId === parseInt(clubFilter);
        const matchesDate = !dateFilter || event.date === dateFilter;
        
        return matchesSearch && matchesClub && matchesDate;
    });
    
    renderEventsList(filtered);
}

function renderEventDetails(params) {
    const event = storage.events.find(e => e.id === params.id);
    if (!event) return;
    
    const registrations = storage.registrations.filter(r => r.eventId === event.id);
    const registeredUsers = storage.users.filter(u => registrations.some(r => r.userId === u.id));
    const isRegistered = registrations.some(r => r.userId === storage.currentUser.id);
    const isAdmin = storage.currentUser.role === 'admin';
    
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="container">
            <div class="header">
                <h1>${event.name}</h1>
            </div>
            <button class="btn btn-secondary" onclick="navigate('events')">← Back to Events</button>
            ${isAdmin ? `<button class="btn btn-primary" onclick="showEditEventForm(${event.id})">Edit</button>` : ''}
            ${isAdmin ? `<button class="btn btn-danger" onclick="deleteEvent(${event.id})">Delete</button>` : ''}
            ${!isAdmin && !isRegistered ? `<button class="btn btn-success" onclick="registerForEvent(${event.id})">Register</button>` : ''}
            ${!isAdmin && isRegistered ? `<button class="btn btn-danger" onclick="cancelRegistration(${event.id})">Cancel Registration</button>` : ''}
            
            <div id="editEventForm" class="hidden" style="margin-top: 20px;">
                <h3>Edit Event</h3>
                <form id="updateEventForm">
                    <div class="form-group">
                        <label>Event Name</label>
                        <input type="text" id="editEventName" value="${event.name}" required>
                    </div>
                    <div class="form-group">
                        <label>Description</label>
                        <textarea id="editEventDesc" rows="3" required>${event.description}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Date</label>
                        <input type="date" id="editEventDate" value="${event.date}" required>
                    </div>
                    <div class="form-group">
                        <label>Venue</label>
                        <input type="text" id="editEventVenue" value="${event.venue}" required>
                    </div>
                    <button type="submit" class="btn btn-success">Update</button>
                    <button type="button" class="btn btn-secondary" onclick="hideEditEventForm()">Cancel</button>
                </form>
            </div>
            
            <div style="margin-top: 20px;">
                <h3>Event Details</h3>
                <p><strong>Description:</strong> ${event.description}</p>
                <p><strong>Date:</strong> ${event.date}</p>
                <p><strong>Club:</strong> ${event.club}</p>
                <p><strong>Venue:</strong> ${event.venue}</p>
                
                ${isAdmin ? `
                    <h3 style="margin-top: 20px;">Registered Students (${registeredUsers.length})</h3>
                    <div id="registeredUsers"></div>
                ` : ''}
            </div>
        </div>
    `;
    
    if (isAdmin) {
        const usersList = document.getElementById('registeredUsers');
        registeredUsers.forEach(user => {
            usersList.innerHTML += `<p>• ${user.name} (${user.studentId}) - ${user.email}</p>`;
        });
        
        document.getElementById('updateEventForm').onsubmit = (e) => {
            e.preventDefault();
            event.name = document.getElementById('editEventName').value;
            event.description = document.getElementById('editEventDesc').value;
            event.date = document.getElementById('editEventDate').value;
            event.venue = document.getElementById('editEventVenue').value;
            saveData();
            showAlert('Event updated successfully!');
            navigate('eventDetails', {id: event.id});
        };
    }
}

function showEditEventForm(eventId) {
    document.getElementById('editEventForm').classList.remove('hidden');
}

function hideEditEventForm() {
    document.getElementById('editEventForm').classList.add('hidden');
}

function deleteEvent(eventId) {
    if (confirm('Are you sure you want to delete this event?')) {
        storage.events = storage.events.filter(e => e.id !== eventId);
        storage.registrations = storage.registrations.filter(r => r.eventId !== eventId);
        saveData();
        showAlert('Event deleted successfully!');
        navigate('events');
    }
}

// Event Registration Module
function registerForEvent(eventId) {
    const registration = {
        id: Date.now(),
        eventId: eventId,
        userId: storage.currentUser.id,
        registeredAt: new Date().toISOString()
    };
    storage.registrations.push(registration);
    saveData();
    showAlert('Registered for event successfully!');
    
    if (window.location.hash.includes('eventDetails')) {
        navigate('eventDetails', {id: eventId});
    } else {
        renderEventsList();
    }
}

function cancelRegistration(eventId) {
    if (confirm('Are you sure you want to cancel your registration?')) {
        storage.registrations = storage.registrations.filter(r => 
            !(r.eventId === eventId && r.userId === storage.currentUser.id)
        );
        saveData();
        showAlert('Registration cancelled successfully!');
        
        if (window.location.hash.includes('eventDetails')) {
            navigate('eventDetails', {id: eventId});
        } else if (window.location.hash.includes('myEvents')) {
            renderMyEvents();
        } else {
            renderEventsList();
        }
    }
}

function renderMyEvents() {
    const myRegistrations = storage.registrations.filter(r => r.userId === storage.currentUser.id);
    const myEvents = storage.events.filter(e => myRegistrations.some(r => r.eventId === e.id));
    
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="container">
            <div class="header">
                <h1>📌 My Registered Events</h1>
            </div>
            <button class="btn btn-secondary" onclick="navigate('studentDashboard')">← Back</button>
            <div class="grid" id="myEventsList" style="margin-top: 20px;"></div>
        </div>
    `;
    
    const container = document.getElementById('myEventsList');
    if (myEvents.length === 0) {
        container.innerHTML = '<p>You have not registered for any events yet.</p>';
    } else {
        myEvents.forEach(event => {
            container.innerHTML += `
                <div class="card">
                    <h3>${event.name}</h3>
                    <p>${event.description}</p>
                    <p>📅 ${event.date}</p>
                    <p>🏫 ${event.club}</p>
                    <p>📍 ${event.venue}</p>
                    <button class="btn btn-primary" onclick="navigate('eventDetails', {id: ${event.id}})">View Details</button>
                    <button class="btn btn-danger" onclick="cancelRegistration(${event.id})">Cancel Registration</button>
                </div>
            `;
        });
    }
}

// Admin Module
function renderManageUsers() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="container">
            <div class="header">
                <h1>👥 Manage Users</h1>
            </div>
            <button class="btn btn-secondary" onclick="navigate('adminDashboard')">← Back</button>
            <div style="margin-top: 20px;">
                <h3>All Users (${storage.users.length})</h3>
                <div id="usersList"></div>
            </div>
        </div>
    `;
    
    const container = document.getElementById('usersList');
    storage.users.forEach(user => {
        container.innerHTML += `
            <div class="card">
                <h3>${user.name}</h3>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Student ID:</strong> ${user.studentId}</p>
                <p><strong>Role:</strong> ${user.role}</p>
                ${user.role !== 'admin' ? `<button class="btn btn-danger" onclick="deleteUser(${user.id})">Delete User</button>` : ''}
            </div>
        `;
    });
}

function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        storage.users = storage.users.filter(u => u.id !== userId);
        storage.registrations = storage.registrations.filter(r => r.userId !== userId);
        storage.clubs.forEach(club => {
            if (club.members) {
                club.members = club.members.filter(id => id !== userId);
            }
        });
        saveData();
        showAlert('User deleted successfully!');
        renderManageUsers();
    }
}

function renderManageClubs() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="container">
            <div class="header">
                <h1>🏫 Manage Clubs</h1>
            </div>
            <button class="btn btn-secondary" onclick="navigate('adminDashboard')">← Back</button>
            <button class="btn btn-success" onclick="navigate('clubs')">Go to Clubs Page</button>
            <div style="margin-top: 20px;">
                <h3>All Clubs (${storage.clubs.length})</h3>
                <div id="clubsList"></div>
            </div>
        </div>
    `;
    
    const container = document.getElementById('clubsList');
    storage.clubs.forEach(club => {
        container.innerHTML += `
            <div class="card">
                <h3>${club.name}</h3>
                <p>${club.description}</p>
                <p><strong>Members:</strong> ${club.members?.length || 0}</p>
                <button class="btn btn-primary" onclick="navigate('clubDetails', {id: ${club.id}})">View Details</button>
                <button class="btn btn-danger" onclick="deleteClub(${club.id}); renderManageClubs();">Delete</button>
            </div>
        `;
    });
}

function renderManageEvents() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="container">
            <div class="header">
                <h1>📅 Manage Events</h1>
            </div>
            <button class="btn btn-secondary" onclick="navigate('adminDashboard')">← Back</button>
            <button class="btn btn-success" onclick="navigate('events')">Go to Events Page</button>
            <div style="margin-top: 20px;">
                <h3>All Events (${storage.events.length})</h3>
                <div id="eventsList"></div>
            </div>
        </div>
    `;
    
    const container = document.getElementById('eventsList');
    storage.events.forEach(event => {
        const registrationCount = storage.registrations.filter(r => r.eventId === event.id).length;
        container.innerHTML += `
            <div class="card">
                <h3>${event.name}</h3>
                <p>${event.description}</p>
                <p><strong>Date:</strong> ${event.date}</p>
                <p><strong>Club:</strong> ${event.club}</p>
                <p><strong>Venue:</strong> ${event.venue}</p>
                <p><strong>Registrations:</strong> ${registrationCount}</p>
                <button class="btn btn-primary" onclick="navigate('eventDetails', {id: ${event.id}})">View Details</button>
                <button class="btn btn-danger" onclick="deleteEvent(${event.id}); navigate('manageEvents');">Delete</button>
            </div>
        `;
    });
}
