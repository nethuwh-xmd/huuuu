import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, setPersistence, browserLocalPersistence } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js';
import { getFirestore, doc, setDoc, getDoc } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js';
import Cookies from 'https://cdn.jsdelivr.net/npm/js-cookie@3.0.5/+esm';

const firebaseConfig = {
  apiKey: "AIzaSyAfzy1JynWCE9sGIlsfKoOmA3ySDOk8YPE",
  authDomain: "shagiya-c00d7.firebaseapp.com",
  projectId: "shagiya-c00d7",
  storageBucket: "shagiya-c00d7.firstorage.app",
  messagingSenderId: "824000254718",
  appId: "1:824000254718:web:bab205d4615b00dfdb0baf",
  measurementId: "G-4D6Y6KK4PN"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Set persistence to browser local
setPersistence(auth, browserLocalPersistence);

// Check login status on page load
function checkLoginStatus() {
    const userData = localStorage.getItem('userData') || Cookies.get('userData');
    if (userData) {
        const user = JSON.parse(userData);
        console.log('User data found in storage:', user);
        return user;
    }
    return null;
}

// Make checkLoginStatus global
window.checkLoginStatus = checkLoginStatus;

// DOM elements
const loginTab = document.getElementById('login-tab');
const registerTab = document.getElementById('register-tab');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginFormEl = document.getElementById('login');
const registerFormEl = document.getElementById('register');
const loginError = document.getElementById('login-error');
const registerError = document.getElementById('register-error');

// Tab switching
if (loginTab && registerTab) {
    loginTab.addEventListener('click', () => {
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        loginError.textContent = '';
        registerError.textContent = '';
    });

    registerTab.addEventListener('click', () => {
        registerTab.classList.add('active');
        loginTab.classList.remove('active');
        registerForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
        loginError.textContent = '';
        registerError.textContent = '';
    });
}

// Register function
async function registerUser(name, grade, email, phone, password) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Store additional user data in Firestore
        await setDoc(doc(db, 'users', user.uid), {
            name,
            grade,
            email,
            phone,
            role: 'user', // Default role
            createdAt: new Date()
        });

        // Store in localStorage and cookies
        const userData = { uid: user.uid, name, grade, email, phone };
        localStorage.setItem('userData', JSON.stringify(userData));
        Cookies.set('userData', JSON.stringify(userData), { expires: 7 }); // Expires in 7 days

        console.log('User registered successfully');
        return user;
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
}

// Login function
async function loginUser(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Get user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
            const userData = userDoc.data();
            const fullUserData = { uid: user.uid, ...userData };

            // Store in localStorage and cookies
            localStorage.setItem('userData', JSON.stringify(fullUserData));
            Cookies.set('userData', JSON.stringify(fullUserData), { expires: 7 });

            console.log('User logged in successfully');
            return user;
        } else {
            throw new Error('User data not found');
        }
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

// Logout function
async function logoutUser() {
    try {
        await signOut(auth);
        localStorage.removeItem('userData');
        Cookies.remove('userData');
        console.log('User logged out');
    } catch (error) {
        console.error('Logout error:', error);
        throw error;
    }
}

// Auth state listener with loop prevention
let authStateResolved = false;

onAuthStateChanged(auth, (user) => {
    if (!authStateResolved) {
        authStateResolved = true;
        console.log('Auth state resolved');
    }

    if (user) {
        console.log('User is signed in:', user.email);
        // Show logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.style.display = 'block';
        }
        // Redirect to main page if on login page
        if (window.location.pathname.includes('login.html')) {
            console.log('Redirecting to index.html');
            window.location.replace('index.html');
        }
    } else {
        console.log('User is signed out');
        // Hide logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.style.display = 'none';
        }
        // Redirect to login if not on login or admin page and no userData
        if (!window.location.pathname.includes('login.html') && !window.location.pathname.includes('addmin.html')) {
            const userData = checkLoginStatus();
            console.log('Checking userData in storage:', userData);
            if (!userData) {
                console.log('No userData found, redirecting to login.html');
                window.location.replace('login.html');
            } else {
                console.log('UserData found in storage, not redirecting');
            }
        }
    }
});

// Event listeners
if (registerFormEl) {
    registerFormEl.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('register-name').value;
        const grade = document.getElementById('register-grade').value;
        const email = document.getElementById('register-username').value;
        const phone = document.getElementById('register-phone').value;
        const password = document.getElementById('register-password').value;

        try {
            await registerUser(name, grade, email, phone, password);
            registerError.textContent = '';
            alert('Registration successful! You are now logged in.');
        } catch (error) {
            registerError.textContent = error.message;
        }
    });
}

if (loginFormEl) {
    loginFormEl.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        try {
            await loginUser(email, password);
            loginError.textContent = '';
            alert('Login successful!');
        } catch (error) {
            loginError.textContent = error.message;
        }
    });
}

// Export functions for use in other files
window.registerUser = registerUser;
window.loginUser = loginUser;
window.logoutUser = logoutUser;
