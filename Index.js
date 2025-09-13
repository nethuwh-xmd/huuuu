const firebaseConfig = {
  apiKey: "AIzaSyAfzy1JynWCE9sGIlsfKoOmA3ySDOk8YPE",
  authDomain: "shagiya-c00d7.firebaseapp.com",
  projectId: "shagiya-c00d7",
  storageBucket: "shagiya-c00d7.firebasestorage.app",
  messagingSenderId: "824000254718",
  appId: "1:824000254718:web:bab205d4615b00dfdb0baf",
  measurementId: "G-4D6Y6KK4PN"
};

// Initialize Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js';
import { getAuth, onAuthStateChanged, signInWithPhoneNumber, RecaptchaVerifier, signOut } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Test Firebase connection
console.log('Firebase initialized:', app);
console.log('Firestore DB:', db);

// Test Firebase connectivity
async function testFirebaseConnection() {
    try {
        console.log('Testing Firebase connection...');
        const testCollection = collection(db, 'test');
        const testDoc = await addDoc(testCollection, {
            test: 'connection test',
            timestamp: new Date()
        });
        console.log('Firebase connection successful, test doc ID:', testDoc.id);
        return true;
    } catch (error) {
        console.error('Firebase connection failed:', error);
        return false;
    }
}

// Run connection test
testFirebaseConnection();

// Function to show loading state
function showLoading(container) {
    container.innerHTML = '<div class="loading">Loading videos...</div>';
}

// Function to show error state
function showError(container, message) {
    container.innerHTML = `<div class="error">${message}</div>`;
}

// Function to load videos from Firebase and localStorage with improved error handling
async function loadVideos() {
    const grades = ['grade-6', 'grade-7', 'grade-8', 'grade-9', 'grade-10', 'grade-11'];

    for (const grade of grades) {
        const videosContainer = document.getElementById(`videos-${grade}`);
        showLoading(videosContainer);

        let hasContent = false;

        // Load from Firebase
        try {
            const videosRef = collection(db, 'videos');
            const querySnapshot = await getDocs(videosRef);
            videosContainer.innerHTML = ''; // Clear loading state

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.grade === grade) {
                    const videoItem = createVideoItem(data);
                    videosContainer.appendChild(videoItem);
                    hasContent = true;
                }
            });
        } catch (firebaseError) {
            console.error('Error loading from Firebase:', firebaseError);
            videosContainer.innerHTML = ''; // Clear loading state
        }



        // Show no videos message if no content
        if (!hasContent) {
            videosContainer.innerHTML = '<div class="no-videos">No videos available for this grade yet.</div>';
        }
    }
}

// Function to create video item without thumbnail for YouTube videos
function createVideoItem(data) {
    const videoItem = document.createElement('div');
    videoItem.className = 'video-item';
    
    const title = document.createElement('h3');
    title.textContent = data.title;
    
    let media;
    if (data.url.includes('youtube.com') || data.url.includes('youtu.be')) {
        media = document.createElement('iframe');
        media.src = data.url.replace('watch?v=', 'embed/');
        media.width = '100%';
        media.height = '200';
        media.frameBorder = '0';
        media.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        media.allowFullscreen = true;
    } else {
        media = document.createElement('video');
        media.src = data.url;
        media.controls = true;
        
        const img = document.createElement('img');
        img.src = data.thumbnail;
        img.alt = data.title;
        videoItem.appendChild(img);
    }
    
    videoItem.appendChild(title);
    videoItem.appendChild(media);

    return videoItem;
}

// Function to create admin video item with delete button
function createAdminVideoItem(data, docId) {
    const videoItem = document.createElement('div');
    videoItem.className = 'admin-video-item';

    const title = document.createElement('h3');
    title.textContent = `${data.title} (${data.grade})`;

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.className = 'delete-btn';
    deleteBtn.onclick = () => deleteVideo(docId);

    videoItem.appendChild(title);
    videoItem.appendChild(deleteBtn);

    return videoItem;
}

// Function to load videos for admin
async function loadAdminVideos() {
    const container = document.getElementById('admin-videos-list');
    if (!container) return;

    showLoading(container);

    try {
        const videosRef = collection(db, 'videos');
        const querySnapshot = await getDocs(videosRef);
        container.innerHTML = ''; // Clear loading state

        if (querySnapshot.empty) {
            container.innerHTML = '<div class="no-videos">No videos found.</div>';
            return;
        }

        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const videoItem = createAdminVideoItem(data, docSnap.id);
            container.appendChild(videoItem);
        });
    } catch (error) {
        console.error('Error loading admin videos:', error);
        container.innerHTML = '<div class="error">Error loading videos.</div>';
    }
}

// Function to delete a video
async function deleteVideo(docId) {
    if (!confirm('Are you sure you want to delete this video?')) return;

    try {
        await deleteDoc(doc(db, 'videos', docId));
        alert('Video deleted successfully');
        loadAdminVideos(); // Refresh the list
    } catch (error) {
        console.error('Error deleting video:', error);
        alert('Error deleting video: ' + error.message);
    }
}

// Admin login functionality (hardcoded)
if (document.getElementById('login')) {
    document.getElementById('login').addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (username === 'kamal' && password === 'kamal0') {
            document.getElementById('login-form').style.display = 'none';
            document.getElementById('add-video-form').style.display = 'block';
            document.getElementById('admin-videos').style.display = 'block';
            document.getElementById('user-management').style.display = 'block';
            document.getElementById('logout-admin').style.display = 'block';
            loadAdminVideos();
        } else {
            alert('Invalid username or password');
        }
    });
}

// Admin logout functionality
if (document.getElementById('admin-logout-btn')) {
    document.getElementById('admin-logout-btn').addEventListener('click', () => {
        document.getElementById('login-form').style.display = 'block';
        document.getElementById('add-video-form').style.display = 'none';
        document.getElementById('admin-videos').style.display = 'none';
        document.getElementById('user-management').style.display = 'none';
        document.getElementById('logout-admin').style.display = 'none';
        alert('Admin logged out successfully');
    });
}

// Add video functionality without fallback to localStorage
if (document.getElementById('add-video')) {
    document.getElementById('add-video').addEventListener('submit', async (e) => {
        e.preventDefault();
        const grade = document.getElementById('grade').value;
        const title = document.getElementById('title').value;
        const videoUrl = document.getElementById('video-url').value;

        console.log('Adding video:', { grade, title, url: videoUrl });

        try {
            // Add video to Firebase only
            const docRef = await addDoc(collection(db, 'videos'), {
                grade,
                title,
                url: videoUrl
            });
            console.log('Video added to Firebase with ID:', docRef.id);
            alert('Video added successfully to Firebase');
        } catch (firebaseError) {
            console.error('Firebase error:', firebaseError);
            alert('Error adding video: ' + firebaseError.message);
            return;
        }

        // Clear form
        document.getElementById('title').value = '';
        document.getElementById('video-url').value = '';

        // Reload videos on main page if on index.html
        if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
            loadVideos();
        }
    });
}

// Load videos on page load for index.html
if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
    document.addEventListener('DOMContentLoaded', () => {
        loadVideos();
        // Initially hide all video sections
        const grades = ['grade-6', 'grade-7', 'grade-8', 'grade-9', 'grade-10', 'grade-11'];
        grades.forEach(grade => {
            const section = document.getElementById(grade);
            if (section) {
                section.style.display = 'none';
            }
        });
    });
}

// Function to add sample videos for testing
function addSampleVideos() {
    const existingVideos = JSON.parse(localStorage.getItem('videos') || '[]');
    if (existingVideos.length === 0) {
        const sampleVideos = [
            {
                id: 'sample-1',
                grade: 'grade-6',
                title: 'Introduction to Algebra',
                url: 'https://www.youtube.com/watch?v=NybHckSEQBI'
            },
            {
                id: 'sample-2',
                grade: 'grade-6',
                title: 'Basic Geometry Concepts',
                url: 'https://www.youtube.com/watch?v=6Lm9EHhbJAY'
            },
            {
                id: 'sample-3',
                grade: 'grade-7',
                title: 'Fractions and Decimals',
                url: 'https://www.youtube.com/watch?v=5juto2ze8Lg'
            },
            {
                id: 'sample-4',
                grade: 'grade-7',
                title: 'Understanding Ratios',
                url: 'https://www.youtube.com/watch?v=Zm0KaIw-35M'
            },
            {
                id: 'sample-5',
                grade: 'grade-8',
                title: 'Linear Equations',
                url: 'https://www.youtube.com/watch?v=7b7Fg9RqZRo'
            },
            {
                id: 'sample-6',
                grade: 'grade-9',
                title: 'Quadratic Functions',
                url: 'https://www.youtube.com/watch?v=JG5lLuJ5Y3A'
            },
            {
                id: 'sample-7',
                grade: 'grade-10',
                title: 'Trigonometry Basics',
                url: 'https://www.youtube.com/watch?v=1i7kA5RBHX8'
            },
            {
                id: 'sample-8',
                grade: 'grade-11',
                title: 'Calculus Introduction',
                url: 'https://www.youtube.com/watch?v=WUvTyaaNkzM'
            }
        ];
        localStorage.setItem('videos', JSON.stringify(sampleVideos));
        console.log('Added sample videos to localStorage');
    }
}

let loadedVideos = {}; // Cache loaded videos by grade

// Function to show videos for selected grade and hide others
function showGradeVideos(gradeId) {
    console.log(`Showing videos for grade: ${gradeId}`);

    const grades = ['grade-6', 'grade-7', 'grade-8', 'grade-9', 'grade-10', 'grade-11'];
    grades.forEach(grade => {
        const section = document.getElementById(grade);
        if (section) {
            if (grade === gradeId) {
                console.log(`Showing section: ${grade}`);
                section.style.display = 'block';
                // Always load videos for the selected grade
                loadVideosForGrade(gradeId);
            } else {
                console.log(`Hiding section: ${grade}`);
                section.style.display = 'none';
            }
        } else {
            console.error(`Section not found: ${grade}`);
        }
    });
    // Scroll to the selected grade section
    scrollToSection(gradeId);
}

// Load videos for a specific grade only
async function loadVideosForGrade(grade) {
    const videosContainer = document.getElementById(`videos-${grade}`);
    if (!videosContainer) {
        console.error(`Container videos-${grade} not found`);
        return;
    }

    console.log(`Loading videos for grade: ${grade}`);
    showLoading(videosContainer);

    let hasContent = false;

    try {
        const videosRef = collection(db, 'videos');
        const querySnapshot = await getDocs(videosRef);
        videosContainer.innerHTML = ''; // Clear loading state

        console.log(`Found ${querySnapshot.size} total videos in Firebase`);

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            console.log(`Video data:`, data);
            if (data.grade === grade) {
                console.log(`Adding video for grade ${grade}:`, data.title);
                const videoItem = createVideoItem(data);
                videosContainer.appendChild(videoItem);
                hasContent = true;
            }
        });
    } catch (firebaseError) {
        console.error('Error loading from Firebase:', firebaseError);
        videosContainer.innerHTML = ''; // Clear loading state
    }



    if (!hasContent) {
        videosContainer.innerHTML = '<div class="no-videos">No videos available for this grade yet.</div>';
        console.log(`No videos found for grade ${grade}`);
    } else {
        console.log(`Successfully loaded videos for grade ${grade}`);
    }

    loadedVideos[grade] = true;
}

// Function to scroll to section
function scrollToSection(id) {
    const element = document.getElementById(id);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
    // Close sidebar after navigation
    const sidebar = document.querySelector('.sidebar');
    const hamburger = document.getElementById('sidebar-toggle');
    if (sidebar && hamburger) {
        sidebar.classList.remove('active');
        hamburger.classList.remove('active');
    }
}

// Make functions global for onclick
window.showGradeVideos = showGradeVideos;
window.scrollToSection = scrollToSection;

// Sidebar toggle functionality with improved responsiveness and fix for button not working
document.addEventListener('DOMContentLoaded', () => {
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');

    function toggleSidebar() {
        if (!sidebar || !sidebarToggle) return;
        sidebar.classList.toggle('active');
        sidebarToggle.classList.toggle('active');
    }

    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }

    // Close sidebar when clicking outside on smaller screens
    document.addEventListener('click', (event) => {
        if (!sidebar || !sidebarToggle) return;
        const target = event.target;
        if (!sidebar.contains(target) && !sidebarToggle.contains(target)) {
            sidebar.classList.remove('active');
            sidebarToggle.classList.remove('active');
        }
    });

    // Adjust sidebar size based on window width
    function adjustSidebar() {
        if (!sidebar) return;
        if (window.innerWidth < 600) {
            sidebar.style.width = '200px';
        } else if (window.innerWidth < 900) {
            sidebar.style.width = '250px';
        } else {
            sidebar.style.width = '300px';
        }
    }

    window.addEventListener('resize', adjustSidebar);
    adjustSidebar();
});

// Logout functionality
if (document.getElementById('logout-btn')) {
    document.getElementById('logout-btn').addEventListener('click', async () => {
        try {
            await signOut(auth);
            // Clear userData from localStorage and cookies on logout
            localStorage.removeItem('userData');
            Cookies.remove('userData');

            // Redirect to login page after logout to prevent refresh loop
            window.location.href = 'login.html';

            alert('Logged out successfully');
        } catch (error) {
            console.error('Logout error:', error);
            alert('Logout failed: ' + error.message);
        }
    });
}

// Load users functionality
async function loadUsers() {
    console.log('loadUsers function called');
    const container = document.getElementById('users-list');
    if (!container) {
        console.error('users-list container not found');
        return;
    }

    console.log('Loading users...');
    showLoading(container);

    try {
        console.log('Fetching users from Firebase...');
        const usersRef = collection(db, 'users');
        const querySnapshot = await getDocs(usersRef);
        console.log('Query snapshot:', querySnapshot);
        console.log('Number of users found:', querySnapshot.size);

        container.innerHTML = ''; // Clear loading state

        if (querySnapshot.empty) {
            console.log('No users found in database');
            container.innerHTML = '<div class="no-users">No users found in the database. Users need to register first through the login system.</div>';
            return;
        }

        querySnapshot.forEach((docSnap) => {
            console.log('User data:', docSnap.data());
            const data = docSnap.data();
            const userItem = createUserItem(data, docSnap.id);
            container.appendChild(userItem);
        });

        console.log('Users loaded successfully');
    } catch (error) {
        console.error('Error loading users:', error);
        container.innerHTML = '<div class="error">Error loading users: ' + error.message + '</div>';
    }
}

// Function to create user item with delete button
function createUserItem(data, docId) {
    const userItem = document.createElement('div');
    userItem.className = 'user-item';

    const contact = data.phone || data.email || 'No contact';
    const info = document.createElement('div');
    info.innerHTML = `<strong>${data.name}</strong> (${contact}) - Grade: ${data.grade} - Role: ${data.role}`;

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.className = 'delete-btn';
    deleteBtn.onclick = () => deleteUser(docId);

    userItem.appendChild(info);
    userItem.appendChild(deleteBtn);

    return userItem;
}

// Function to delete a user
async function deleteUser(docId) {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
        await deleteDoc(doc(db, 'users', docId));
        alert('User deleted successfully');
        loadUsers(); // Refresh the list
    } catch (error) {
        console.error('Error deleting user:', error);
        alert('Error deleting user: ' + error.message);
    }
}

// Load users button
if (document.getElementById('load-users-btn')) {
    console.log('Load users button found, attaching event listener');
    document.getElementById('load-users-btn').addEventListener('click', loadUsers);
} else {
    console.log('Load users button not found');
}

// Also attach onclick handler directly
document.addEventListener('DOMContentLoaded', () => {
    const loadUsersBtn = document.getElementById('load-users-btn');
    if (loadUsersBtn) {
        console.log('Attaching onclick handler to load users button');
        loadUsersBtn.onclick = loadUsers;
    }
});

// Make functions global
window.loadUsers = loadUsers;
window.deleteUser = deleteUser;
