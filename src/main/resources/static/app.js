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
