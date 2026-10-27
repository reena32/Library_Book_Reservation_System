// ============================================================
// GitHub Pages & Static Hosting Demo Backend (Offline/Demo Mode)
// When hosted on GitHub Pages (or running without live backend),
// this intercepts /api requests and simulates the database locally.
// ============================================================
(function initStaticDemoMode() {
    const isGitHubPages = window.location.hostname.includes('github.io') || window.location.protocol === 'file:';
    if (!isGitHubPages) return;

    console.log('%c[GitHub Pages Live Demo Mode Active]', 'color: #00adb5; font-weight: bold; font-size: 14px;');

    if (!localStorage.getItem('demo_books')) {
        const initialBooks = [
            { id: 1, title: 'Clean Code', author: 'Robert C. Martin', category: 'Computer Science', isbn: '978-0132350884', totalCopies: 5, availableCopies: 5 },
            { id: 2, title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', category: 'Computer Science', isbn: '978-0262033848', totalCopies: 4, availableCopies: 4 },
            { id: 3, title: 'Database System Concepts', author: 'Abraham Silberschatz', category: 'Information Technology', isbn: '978-0073523323', totalCopies: 3, availableCopies: 3 },
            { id: 4, title: 'Computer Networking: A Top-Down Approach', author: 'James Kurose', category: 'Networking', isbn: '978-0133594140', totalCopies: 5, availableCopies: 5 },
            { id: 5, title: 'Operating System Principles', author: 'Peter B. Galvin', category: 'Computer Science', isbn: '978-0471417439', totalCopies: 4, availableCopies: 4 },
            { id: 6, title: 'Artificial Intelligence: A Modern Approach', author: 'Stuart Russell', category: 'AI & ML', isbn: '978-0136042594', totalCopies: 3, availableCopies: 3 }
        ];
        localStorage.setItem('demo_books', JSON.stringify(initialBooks));
    }

    if (!localStorage.getItem('demo_users')) {
        const initialUsers = [
            { id: 1, studentId: 'ADMIN01', name: 'Library Administrator', email: 'admin@library.com', department: 'Library Administration', password: 'admin123', role: 'ADMIN' },
            { id: 2, studentId: 'STU101', name: 'Demo Student', email: 'student@library.com', department: 'Computer Science', password: 'student123', role: 'STUDENT' }
        ];
        localStorage.setItem('demo_users', JSON.stringify(initialUsers));
    }

    if (!localStorage.getItem('demo_reservations')) {
        localStorage.setItem('demo_reservations', JSON.stringify([]));
    }

    if (!localStorage.getItem('demo_fine_rate')) {
        localStorage.setItem('demo_fine_rate', '1.0');
    }

    const nativeFetch = window.fetch;
    window.fetch = async function(url, options = {}) {
        const urlStr = typeof url === 'string' ? url : url.url;
        if (!urlStr.includes('/api')) {
            return nativeFetch.apply(this, arguments);
        }

        const method = (options.method || 'GET').toUpperCase();
        const body = options.body ? JSON.parse(options.body) : {};
        const parsedUrl = new URL(urlStr, window.location.origin);
        const path = parsedUrl.pathname.replace(/^\/.*?(?=\/api)/, '');

        const getBooks = () => JSON.parse(localStorage.getItem('demo_books') || '[]');
        const saveBooks = (b) => localStorage.setItem('demo_books', JSON.stringify(b));
        const getUsers = () => JSON.parse(localStorage.getItem('demo_users') || '[]');
        const saveUsers = (u) => localStorage.setItem('demo_users', JSON.stringify(u));
        const getReservations = () => JSON.parse(localStorage.getItem('demo_reservations') || '[]');
        const saveReservations = (r) => localStorage.setItem('demo_reservations', JSON.stringify(r));

        const jsonResponse = (data, status = 200) => new Response(JSON.stringify(data), {
            status: status,
            headers: { 'Content-Type': 'application/json' }
        });

        if (path === '/api/auth/login' && method === 'POST') {
            const { identifier, password } = body;
            const users = getUsers();
            const user = users.find(u => (u.email === identifier || u.studentId === identifier) && u.password === password);
            if (user) return jsonResponse(user);
            return jsonResponse({ message: 'Invalid credentials. Please check your ID and password.' }, 401);
        }

        if (path === '/api/auth/register' && method === 'POST') {
            const users = getUsers();
            if (users.some(u => u.studentId === body.studentId)) {
                return jsonResponse({ message: 'Student ID already exists' }, 400);
            }
            if (users.some(u => u.email === body.email)) {
                return jsonResponse({ message: 'Email already exists' }, 400);
            }
            const newUser = { ...body, id: Date.now(), role: 'STUDENT' };
            users.push(newUser);
            saveUsers(users);
            return jsonResponse(newUser);
        }

        if (path === '/api/auth/students' && method === 'GET') {
            const users = getUsers().filter(u => u.role === 'STUDENT');
            return jsonResponse(users);
        }

        if (path === '/api/books' && method === 'GET') {
            const search = parsedUrl.searchParams.get('search');
            let books = getBooks();
            if (search) {
                const s = search.toLowerCase();
                books = books.filter(b => 
                    b.title.toLowerCase().includes(s) || 
                    b.author.toLowerCase().includes(s) || 
                    (b.category && b.category.toLowerCase().includes(s)) ||
                    (b.isbn && b.isbn.toLowerCase().includes(s))
                );
            }
            return jsonResponse(books);
        }

        const bookIdMatch = path.match(/^\/api\/books\/(\d+)$/);
        if (bookIdMatch && method === 'GET') {
            const id = parseInt(bookIdMatch[1]);
            const book = getBooks().find(b => b.id === id);
            return book ? jsonResponse(book) : jsonResponse({ message: 'Book not found' }, 404);
        }

        if (path === '/api/books' && method === 'POST') {
            const books = getBooks();
            const newBook = { ...body, id: Date.now() };
            books.push(newBook);
            saveBooks(books);
            return jsonResponse(newBook);
        }

        if (bookIdMatch && method === 'PUT') {
            const id = parseInt(bookIdMatch[1]);
            const books = getBooks();
            const idx = books.findIndex(b => b.id === id);
            if (idx === -1) return jsonResponse({ message: 'Book not found' }, 404);
            books[idx] = { ...books[idx], ...body, id: id };
            saveBooks(books);
            return jsonResponse(books[idx]);
        }

        if (bookIdMatch && method === 'DELETE') {
            const id = parseInt(bookIdMatch[1]);
            let books = getBooks();
            books = books.filter(b => b.id !== id);
            saveBooks(books);
            return jsonResponse({ message: 'Book deleted successfully' });
        }

        if (path === '/api/reservations/reserve' && method === 'POST') {
            const { userId, bookId } = body;
            const books = getBooks();
            const users = getUsers();
            const reservations = getReservations();

            const book = books.find(b => b.id === bookId);
            const user = users.find(u => u.id === userId);

            if (!book) return jsonResponse({ message: 'Book not found' }, 400);
            if (!user) return jsonResponse({ message: 'User not found' }, 400);
            if (book.availableCopies <= 0) return jsonResponse({ message: 'Book is out of stock' }, 400);

            const active = reservations.filter(r => r.user.id === userId && r.status === 'RESERVED');
            if (active.some(r => r.book.id === bookId)) {
                return jsonResponse({ message: 'You already have an active reservation for this book' }, 400);
            }

            book.availableCopies -= 1;
            saveBooks(books);

            const now = new Date();
            const due = new Date();
            due.setDate(now.getDate() + 14);

            const newReservation = {
                id: Date.now(),
                user: user,
                book: book,
                reservationDate: now.toISOString().split('T')[0],
                dueDate: due.toISOString().split('T')[0],
                returnDate: null,
                status: 'RESERVED',
                fineAmount: 0.0
            };
            reservations.push(newReservation);
            saveReservations(reservations);
            return jsonResponse(newReservation);
        }

        const userResMatch = path.match(/^\/api\/reservations\/user\/(\d+)$/);
        if (userResMatch && method === 'GET') {
            const userId = parseInt(userResMatch[1]);
            const reservations = getReservations().filter(r => r.user.id === userId);
            return jsonResponse(reservations);
        }

        if (path === '/api/reservations' && method === 'GET') {
            return jsonResponse(getReservations());
        }

        const returnMatch = path.match(/^\/api\/reservations\/(\d+)\/return$/);
        if (returnMatch && method === 'POST') {
            const id = parseInt(returnMatch[1]);
            const reservations = getReservations();
            const res = reservations.find(r => r.id === id);
            if (!res) return jsonResponse({ message: 'Reservation not found' }, 404);

            res.status = 'RETURNED';
            res.returnDate = new Date().toISOString().split('T')[0];

            const books = getBooks();
            const book = books.find(b => b.id === res.book.id);
            if (book) {
                book.availableCopies += 1;
                saveBooks(books);
            }

            saveReservations(reservations);
            return jsonResponse(res);
        }

        const cancelMatch = path.match(/^\/api\/reservations\/(\d+)\/cancel$/);
        if (cancelMatch && method === 'POST') {
            const id = parseInt(cancelMatch[1]);
            const reservations = getReservations();
            const res = reservations.find(r => r.id === id);
            if (!res) return jsonResponse({ message: 'Reservation not found' }, 404);

            res.status = 'CANCELLED';

            const books = getBooks();
            const book = books.find(b => b.id === res.book.id);
            if (book) {
                book.availableCopies += 1;
                saveBooks(books);
            }

            saveReservations(reservations);
            return jsonResponse(res);
        }

        if (path === '/api/reservations/fine-rate' && method === 'GET') {
            const rate = parseFloat(localStorage.getItem('demo_fine_rate') || '1.0');
            return jsonResponse({ dailyFineRate: rate });
        }

        if (path === '/api/reservations/fine-rate' && method === 'POST') {
            const rate = body.dailyFineRate || 1.0;
            localStorage.setItem('demo_fine_rate', rate.toString());
            return jsonResponse({ message: 'Fine rate updated', dailyFineRate: rate });
        }

        return jsonResponse({ message: 'Not found in mock API' }, 404);
    };

    window.addEventListener('DOMContentLoaded', () => {
        const container = document.querySelector('nav .container');
        if (container) {
            const badge = document.createElement('span');
            badge.className = 'badge bg-info text-dark ms-2 d-none d-md-inline';
            badge.innerHTML = '<i class="bi bi-cloud-check me-1"></i>Live Demo (GitHub Pages)';
            container.querySelector('.navbar-brand')?.appendChild(badge);
        }
    });
})();

// API Base URL
const API_BASE = '/api';

// State Management
let currentUser = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    checkSavedUser();
    loadBooks();
});

// Check if user is saved in localStorage (session persistence)
function checkSavedUser() {
    const saved = localStorage.getItem('libraryUser');
    if (saved) {
        try {
            currentUser = JSON.parse(saved);
            updateUiForUser();
        } catch (e) {
            localStorage.removeItem('libraryUser');
        }
    }
}

// Update navbar and visible tabs based on authentication role
function updateUiForUser() {
    const authButtons = document.getElementById('authButtonsArea');
    const profileArea = document.getElementById('userProfileArea');
    const welcomeText = document.getElementById('welcomeUserText');
    const studentNav = document.querySelectorAll('.student-only');
    const adminNav = document.querySelectorAll('.admin-only');

    if (currentUser) {
        authButtons.classList.add('d-none');
        profileArea.classList.remove('d-none');
        welcomeText.innerHTML = `<strong>${currentUser.name}</strong> (${currentUser.role})`;

        if (currentUser.role === 'ADMIN') {
            studentNav.forEach(el => el.classList.add('d-none'));
            adminNav.forEach(el => el.classList.remove('d-none'));
        } else {
            studentNav.forEach(el => el.classList.remove('d-none'));
            adminNav.forEach(el => el.classList.add('d-none'));
        }
    } else {
        authButtons.classList.remove('d-none');
        profileArea.classList.add('d-none');
        studentNav.forEach(el => el.classList.add('d-none'));
        adminNav.forEach(el => el.classList.add('d-none'));
    }
}

// Navigation switcher
function showSection(sectionId) {
    document.getElementById('homeSection').classList.add('d-none');
    document.getElementById('studentSection').classList.add('d-none');
    document.getElementById('adminSection').classList.add('d-none');

    document.querySelectorAll('.navbar-nav .nav-link').forEach(link => link.classList.remove('active'));

    const target = document.getElementById(sectionId);
    if (target) target.classList.remove('d-none');

    const hero = document.getElementById('heroBanner');
    if (sectionId === 'homeSection') {
        hero.classList.remove('d-none');
        document.getElementById('navHome').classList.add('active');
        loadBooks();
    } else {
        hero.classList.add('d-none');
        if (sectionId === 'studentSection') {
            document.getElementById('navStudent').classList.add('active');
            loadStudentDashboard();
        } else if (sectionId === 'adminSection') {
            document.getElementById('navAdmin').classList.add('active');
            loadAdminDashboard();
        }
    }
}

// ==========================================
// 1. AUTHENTICATION (Login / Register / Logout)
// ==========================================

function openLoginModal() {
    document.getElementById('loginAlert').classList.add('d-none');
    document.getElementById('loginForm').reset();
    const modal = new bootstrap.Modal(document.getElementById('loginModal'));
    modal.show();
}

function openRegisterModal() {
    document.getElementById('registerAlert').classList.add('d-none');
    document.getElementById('registerForm').reset();
    const modal = new bootstrap.Modal(document.getElementById('registerModal'));
    modal.show();
}

function switchToRegister() {
    bootstrap.Modal.getInstance(document.getElementById('loginModal'))?.hide();
    openRegisterModal();
}

function switchToLogin() {
    bootstrap.Modal.getInstance(document.getElementById('registerModal'))?.hide();
    openLoginModal();
}

async function handleLogin(event) {
    event.preventDefault();
    const identifier = document.getElementById('loginIdentifier').value;
    const password = document.getElementById('loginPassword').value;
    const alertBox = document.getElementById('loginAlert');

    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier, password })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        currentUser = data;
        localStorage.setItem('libraryUser', JSON.stringify(currentUser));
        updateUiForUser();

        bootstrap.Modal.getInstance(document.getElementById('loginModal'))?.hide();

        if (currentUser.role === 'ADMIN') {
            showSection('adminSection');
        } else {
            showSection('studentSection');
        }
    } catch (err) {
        alertBox.textContent = err.message;
        alertBox.classList.remove('d-none');
    }
}

async function handleRegister(event) {
    event.preventDefault();
    const studentId = document.getElementById('regStudentId').value;
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const department = document.getElementById('regDepartment').value;
    const password = document.getElementById('regPassword').value;
    const alertBox = document.getElementById('registerAlert');

    try {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentId, name, email, department, password })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Registration failed');
        }

        alert('Registration successful! Please login with your credentials.');
        bootstrap.Modal.getInstance(document.getElementById('registerModal'))?.hide();
        openLoginModal();
    } catch (err) {
        alertBox.textContent = err.message;
        alertBox.classList.remove('d-none');
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('libraryUser');
    updateUiForUser();
    showSection('homeSection');
}

// ==========================================
// 2. BOOKS MANAGEMENT & RESERVATION
// ==========================================

function handleSearch(event) {
    if (event.key === 'Enter') {
        loadBooks();
    }
}

async function loadBooks() {
    const searchVal = document.getElementById('searchInput').value.trim();
    const url = searchVal ? `${API_BASE}/books?search=${encodeURIComponent(searchVal)}` : `${API_BASE}/books`;

    try {
        const res = await fetch(url);
        const books = await res.json();
        displayBooks(books);
    } catch (err) {
        console.error('Error loading books:', err);
        document.getElementById('booksContainer').innerHTML = `
            <div class="col-12 text-center py-5">
                <p class="text-danger">Failed to load books. Please ensure the backend server is running.</p>
            </div>`;
    }
}

function displayBooks(books) {
    const container = document.getElementById('booksContainer');
    document.getElementById('booksCountText').textContent = `Showing ${books.length} title(s)`;

    if (books.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="bi bi-journal-x fs-1 text-muted"></i>
                <p class="text-muted mt-2">No books found matching your criteria.</p>
            </div>`;
        return;
    }

    container.innerHTML = books.map(book => {
        const isAvailable = book.availableCopies > 0;
        const statusBadge = isAvailable
            ? `<span class="badge badge-available"><i class="bi bi-check-circle me-1"></i>${book.availableCopies} Copies Available</span>`
            : `<span class="badge badge-unavailable"><i class="bi bi-x-circle me-1"></i>Out of Stock</span>`;

        return `
        <div class="col-md-6 col-lg-4">
            <div class="card h-100 book-card shadow-sm">
                <div class="card-body d-flex flex-column">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <span class="badge bg-light text-dark border">${book.category || 'General'}</span>
                        ${statusBadge}
                    </div>
                    <h5 class="card-title fw-bold text-dark">${escapeHtml(book.title)}</h5>
                    <p class="card-subtitle text-muted mb-2"><i class="bi bi-person me-1"></i>${escapeHtml(book.author)}</p>
                    <small class="text-muted mb-3"><i class="bi bi-upc-scan me-1"></i>ISBN: ${book.isbn || 'N/A'}</small>

                    <div class="mt-auto pt-3 border-top d-flex justify-content-between align-items-center">
                        <small class="text-muted">Total: ${book.totalCopies} copies</small>
                        <button class="btn btn-sm ${isAvailable ? 'btn-primary' : 'btn-secondary'}" 
                                onclick="reserveBook(${book.id})" 
                                ${!isAvailable ? 'disabled' : ''}>
                            <i class="bi bi-bookmark-plus me-1"></i>Reserve
                        </button>
                    </div>
                </div>
            </div>
        </div>
        `;
    }).join('');
}

async function reserveBook(bookId) {
    if (!currentUser) {
        alert('Please login first to reserve a book!');
        openLoginModal();
        return;
    }

    if (currentUser.role === 'ADMIN') {
        alert('Administrators cannot reserve books for personal accounts.');
        return;
    }

    if (!confirm('Are you sure you want to reserve this book for 14 days?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/reservations/reserve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUser.id, bookId: bookId })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Could not complete reservation');
        }

        alert('Book reserved successfully! You can view it in your dashboard.');
        loadBooks(); // refresh availability counts
    } catch (err) {
        alert(err.message);
    }
}

// ==========================================
// 3. STUDENT DASHBOARD
// ==========================================

function loadStudentDashboard() {
    if (!currentUser) return;
    document.getElementById('dashStudentName').textContent = currentUser.name;
    document.getElementById('dashStudentId').textContent = currentUser.studentId;
    document.getElementById('dashStudentDept').textContent = currentUser.department || 'Student';
    loadMyReservations();
}

async function loadMyReservations() {
    if (!currentUser) return;

    try {
        const res = await fetch(`${API_BASE}/reservations/user/${currentUser.id}`);
        const list = await res.json();
        const tbody = document.getElementById('studentReservationsTableBody');

        if (list.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted py-4">No reservations yet. Browse books to make your first reservation!</td></tr>`;
            return;
        }

        tbody.innerHTML = list.map(item => {
            let statusBadge = '';
            if (item.status === 'RESERVED') statusBadge = '<span class="badge bg-primary">Active</span>';
            else if (item.status === 'RETURNED') statusBadge = '<span class="badge bg-success">Returned</span>';
            else statusBadge = '<span class="badge bg-secondary">Cancelled</span>';

            const fineBadge = item.fineAmount > 0 
                ? `<span class="badge bg-danger">$${item.fineAmount.toFixed(2)}</span>` 
                : `<span class="text-muted">$0.00</span>`;

            const cancelBtn = item.status === 'RESERVED'
                ? `<button class="btn btn-outline-danger btn-sm" onclick="cancelMyReservation(${item.id})"><i class="bi bi-x-circle me-1"></i>Cancel</button>`
                : `<span class="text-muted small">-</span>`;

            return `
                <tr>
                    <td>#${item.id}</td>
                    <td class="fw-semibold">${escapeHtml(item.book.title)}</td>
                    <td>${escapeHtml(item.book.author)}</td>
                    <td>${item.reservationDate}</td>
                    <td>${item.dueDate}</td>
                    <td>${statusBadge}</td>
                    <td>${fineBadge}</td>
                    <td>${cancelBtn}</td>
                </tr>
            `;
        }).join('');
    } catch (err) {
        console.error('Failed to load reservations:', err);
    }
}

async function cancelMyReservation(reservationId) {
    if (!confirm('Are you sure you want to cancel this reservation?')) return;

    try {
        const response = await fetch(`${API_BASE}/reservations/${reservationId}/cancel`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUser.id })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Cancellation failed');

        alert('Reservation cancelled.');
        loadMyReservations();
    } catch (err) {
        alert(err.message);
    }
}

// ==========================================
// 4. ADMIN DASHBOARD & BOOK MANAGEMENT
// ==========================================

async function loadAdminDashboard() {
    loadAdminStats();
    loadAdminBooks();
    loadAdminReservations();
    loadAdminStudents();
    loadFineRate();
}

async function loadAdminStats() {
    try {
        const [booksRes, studRes, resRes, rateRes] = await Promise.all([
            fetch(`${API_BASE}/books`),
            fetch(`${API_BASE}/auth/students`),
            fetch(`${API_BASE}/reservations`),
            fetch(`${API_BASE}/reservations/fine-rate`)
        ]);

        const books = await booksRes.json();
        const students = await studRes.json();
        const reservations = await resRes.json();
        const rate = await rateRes.json();

        document.getElementById('statTotalBooks').textContent = books.length;
        document.getElementById('statTotalStudents').textContent = students.length;
        document.getElementById('statActiveReservations').textContent = reservations.filter(r => r.status === 'RESERVED').length;
        document.getElementById('statFineRateDisplay').textContent = `$${rate.dailyFineRate.toFixed(2)}`;
        document.getElementById('adminFineRateInput').value = rate.dailyFineRate;
    } catch (err) {
        console.error('Failed to load stats:', err);
    }
}

async function loadAdminBooks() {
    try {
        const res = await fetch(`${API_BASE}/books`);
        const books = await res.json();
        const tbody = document.getElementById('adminBooksTableBody');

        tbody.innerHTML = books.map(b => `
            <tr>
                <td>${b.id}</td>
                <td class="fw-semibold">${escapeHtml(b.title)}</td>
                <td>${escapeHtml(b.author)}</td>
                <td>${escapeHtml(b.category || '-')}</td>
                <td>${b.isbn || '-'}</td>
                <td>${b.totalCopies}</td>
                <td><span class="badge ${b.availableCopies > 0 ? 'bg-success' : 'bg-danger'}">${b.availableCopies}</span></td>
                <td>
                    <button class="btn btn-outline-primary btn-sm me-1" onclick='openEditBookModal(${JSON.stringify(b)})'><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-outline-danger btn-sm" onclick="deleteBook(${b.id})"><i class="bi bi-trash"></i></button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error(err);
    }
}

function openAddBookModal() {
    document.getElementById('bookModalTitle').textContent = 'Add New Book';
    document.getElementById('bookForm').reset();
    document.getElementById('bookId').value = '';
    const modal = new bootstrap.Modal(document.getElementById('bookModal'));
    modal.show();
}

function openEditBookModal(book) {
    document.getElementById('bookModalTitle').textContent = 'Edit Book';
    document.getElementById('bookId').value = book.id;
    document.getElementById('bookTitle').value = book.title;
    document.getElementById('bookAuthor').value = book.author;
    document.getElementById('bookCategory').value = book.category || '';
    document.getElementById('bookIsbn').value = book.isbn || '';
    document.getElementById('bookTotalCopies').value = book.totalCopies;
    document.getElementById('bookAvailableCopies').value = book.availableCopies;
    const modal = new bootstrap.Modal(document.getElementById('bookModal'));
    modal.show();
}

async function handleSaveBook(event) {
    event.preventDefault();
    const id = document.getElementById('bookId').value;
    const bookData = {
        title: document.getElementById('bookTitle').value,
        author: document.getElementById('bookAuthor').value,
        category: document.getElementById('bookCategory').value,
        isbn: document.getElementById('bookIsbn').value,
        totalCopies: parseInt(document.getElementById('bookTotalCopies').value),
        availableCopies: document.getElementById('bookAvailableCopies').value 
            ? parseInt(document.getElementById('bookAvailableCopies').value) 
            : parseInt(document.getElementById('bookTotalCopies').value)
    };

    const url = id ? `${API_BASE}/books/${id}` : `${API_BASE}/books`;
    const method = id ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookData)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to save book');

        bootstrap.Modal.getInstance(document.getElementById('bookModal'))?.hide();
        loadAdminBooks();
        loadAdminStats();
    } catch (err) {
        alert(err.message);
    }
}

async function deleteBook(id) {
    if (!confirm('Are you sure you want to delete this book?')) return;

    try {
        const response = await fetch(`${API_BASE}/books/${id}`, { method: 'DELETE' });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to delete book');

        loadAdminBooks();
        loadAdminStats();
    } catch (err) {
        alert(err.message);
    }
}

async function loadAdminReservations() {
    try {
        const res = await fetch(`${API_BASE}/reservations`);
        const list = await res.json();
        const tbody = document.getElementById('adminReservationsTableBody');

        tbody.innerHTML = list.map(item => {
            const returnBtn = item.status === 'RESERVED'
                ? `<button class="btn btn-sm btn-success" onclick="returnBook(${item.id})"><i class="bi bi-box-arrow-in-left me-1"></i>Mark Returned</button>`
                : `<span class="text-muted small">Done</span>`;

            return `
                <tr>
                    <td>#${item.id}</td>
                    <td>${escapeHtml(item.user.name)}</td>
                    <td>${escapeHtml(item.user.studentId)}</td>
                    <td>${escapeHtml(item.book.title)}</td>
                    <td>${item.reservationDate}</td>
                    <td>${item.dueDate}</td>
                    <td><span class="badge ${item.status === 'RESERVED' ? 'bg-primary' : 'bg-secondary'}">${item.status}</span></td>
                    <td class="${item.fineAmount > 0 ? 'text-danger fw-bold' : 'text-muted'}">$${item.fineAmount.toFixed(2)}</td>
                    <td>${returnBtn}</td>
                </tr>
            `;
        }).join('');
    } catch (err) {
        console.error(err);
    }
}

async function returnBook(id) {
    if (!confirm('Mark this book as returned to inventory?')) return;

    try {
        const response = await fetch(`${API_BASE}/reservations/${id}/return`, { method: 'POST' });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to process return');

        alert('Book returned successfully!');
        loadAdminReservations();
        loadAdminStats();
    } catch (err) {
        alert(err.message);
    }
}

async function loadAdminStudents() {
    try {
        const res = await fetch(`${API_BASE}/auth/students`);
        const students = await res.json();
        const tbody = document.getElementById('adminStudentsTableBody');

        tbody.innerHTML = students.map(s => `
            <tr>
                <td><span class="badge bg-secondary">${s.studentId}</span></td>
                <td class="fw-semibold">${escapeHtml(s.name)}</td>
                <td>${escapeHtml(s.email)}</td>
                <td>${escapeHtml(s.department || '-')}</td>
            </tr>
        `).join('');
    } catch (err) {
        console.error(err);
    }
}

async function loadFineRate() {
    try {
        const res = await fetch(`${API_BASE}/reservations/fine-rate`);
        const data = await res.json();
        document.getElementById('adminFineRateInput').value = data.dailyFineRate;
    } catch (err) {
        console.error(err);
    }
}

async function updateFineRate() {
    const rate = parseFloat(document.getElementById('adminFineRateInput').value);
    if (isNaN(rate) || rate < 0) {
        alert('Please enter a valid non-negative number for the fine rate.');
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/reservations/fine-rate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dailyFineRate: rate })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to update rate');

        alert('Fine rate updated successfully!');
        loadAdminStats();
    } catch (err) {
        alert(err.message);
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
