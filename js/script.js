function getUsers() {
    return JSON.parse(localStorage.getItem('donors')) || [];
}

function saveUsers(users) {
    localStorage.setItem('donors', JSON.stringify(users));
}

function showToast(message, type = 'error') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast ' + type;
    let icon = '❌';
    if (type === 'success') icon = '✅';
    else if (type === 'warning') icon = '⚠️';
    toast.innerHTML = '<i>' + icon + '</i> ' + message;
    container.appendChild(toast);
    setTimeout(function() {
        toast.remove();
    }, 3000);
}

function loginUser(email, password) {
    const users = getUsers();
    const user = users.find(function(u) {
        return u.email === email && u.password === password;
    });
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        return true;
    }
    return false;
}

function registerUser(name, email, phone, bloodType, address, password) {
    const users = getUsers();
    if (users.find(function(u) { return u.email === email; })) {
        return false;
    }
    const newUser = {
        name: name,
        email: email,
        phone: phone,
        bloodType: bloodType,
        address: address,
        password: password,
        available: false
    };
    users.push(newUser);
    saveUsers(users);
    return true;
}

function getCurrentUser() {
    const data = localStorage.getItem('currentUser');
    return data ? JSON.parse(data) : null;
}

function updateUser(updatedUser) {
    const users = getUsers();
    const index = users.findIndex(function(u) {
        return u.email === updatedUser.email;
    });
    if (index !== -1) {
        users[index] = updatedUser;
        saveUsers(users);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        return true;
    }
    return false;
}

function getAvailableDonors() {
    const users = getUsers();
    return users.filter(function(u) {
        return u.available === true;
    }).map(function(u) {
        var { password, ...rest } = u;
        return rest;
    });
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

function protectPage() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'index.html';
    }
}

if (document.getElementById('register-form')) {
    document.getElementById('register-form').addEventListener('submit', function(e) {
        e.preventDefault();
        var name = document.getElementById('reg-name').value.trim();
        var email = document.getElementById('reg-email').value.trim();
        var phone = document.getElementById('reg-phone').value.trim();
        var blood = document.getElementById('reg-blood').value;
        var address = document.getElementById('reg-address').value.trim();
        var password = document.getElementById('reg-password').value;
        var confirm = document.getElementById('reg-confirm').value;
        if (password !== confirm) {
            showToast('كلمة المرور غير متطابقة!', 'error');
            return;
        }
        if (!name || !email || !phone || !blood || !address) {
            showToast('يرجى ملء جميع الحقول.', 'error');
            return;
        }
        var success = registerUser(name, email, phone, blood, address, password);
        if (success) {
            showToast('تم إنشاء الحساب بنجاح!', 'success');
            setTimeout(function() {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            showToast('هذا البريد الإلكتروني مسجل مسبقاً.', 'error');
        }
    });
}

if (document.getElementById('login-form')) {
    document.getElementById('login-form').addEventListener('submit', function(e) {
        e.preventDefault();
        var email = document.getElementById('login-email').value.trim();
        var password = document.getElementById('login-password').value;
        var adminEmail = 'ahmedalhbib655@gmail.com';
        var adminPassword = 'Ah0115309500';
        if (email === adminEmail && password === adminPassword) {
            localStorage.setItem('currentUser', JSON.stringify({
                name: 'أدمن النظام',
                email: adminEmail,
                role: 'admin'
            }));
            showToast('مرحباً أيها الأدمن! تم تسجيل الدخول بنجاح.', 'success');
            setTimeout(function() {
                window.location.href = 'profile.html';
            }, 1000);
            return;
        }
        var users = getUsers();
        var user = users.find(function(u) {
            return u.email === email && u.password === password;
        });
        if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            showToast('مرحباً ' + user.name + '! تم تسجيل الدخول بنجاح.', 'success');
            setTimeout(function() {
                window.location.href = 'profile.html';
            }, 1000);
        } else {
            showToast('البريد الإلكتروني أو كلمة المرور غير صحيحة.', 'error');
        }
    });
}

if (document.getElementById('profile-form')) {
    protectPage();
    var user = getCurrentUser();
    document.getElementById('prof-name').value = user.name;
    document.getElementById('prof-email').value = user.email;
    document.getElementById('prof-phone').value = user.phone;
    document.getElementById('prof-blood').value = user.bloodType;
    document.getElementById('prof-address').value = user.address;
    document.getElementById('prof-available').checked = user.available;
    document.getElementById('profile-form').addEventListener('submit', function(e) {
        e.preventDefault();
        var updated = { ...user };
        updated.name = document.getElementById('prof-name').value.trim();
        updated.phone = document.getElementById('prof-phone').value.trim();
        updated.address = document.getElementById('prof-address').value.trim();
        updated.bloodType = document.getElementById('prof-blood').value;
        updated.available = document.getElementById('prof-available').checked;
        if (updateUser(updated)) {
            showToast('تم تحديث بياناتك بنجاح.', 'success');
        } else {
            showToast('حدث خطأ، حاول مجدداً.', 'error');
        }
    });
}

if (document.getElementById('donors-list')) {
    protectPage();
    var donors = getAvailableDonors();
    var container = document.getElementById('donors-list');
    if (donors.length === 0) {
        container.innerHTML = '<p style="text-align:center;">لا يوجد متبرعون متاحون حالياً.</p>';
    } else {
        donors.forEach(function(d) {
            var card = document.createElement('div');
            card.className = 'donor-card';
            card.innerHTML = '<h4>' + d.name + '</h4><p><strong>📞</strong> ' + d.phone + '</p><p><strong>🏠</strong> ' + d.address + '</p><p><strong>🩸</strong> فصيلة الدم: ' + d.bloodType + '</p>';
            container.appendChild(card);
        });
    }
}

function saveSupportTicket(name, email, message) {
    var tickets = JSON.parse(localStorage.getItem('supportTickets')) || [];
    var newTicket = {
        id: Date.now(),
        name: name,
        email: email,
        message: message,
        date: new Date().toLocaleString('ar-EG')
    };
    tickets.push(newTicket);
    localStorage.setItem('supportTickets', JSON.stringify(tickets));
    return true;
}

if (document.getElementById('support-form')) {
    protectPage();
    document.getElementById('support-form').addEventListener('submit', function(e) {
        e.preventDefault();
        var name = document.getElementById('support-name').value.trim();
        var email = document.getElementById('support-email').value.trim();
        var message = document.getElementById('support-message').value.trim();
        if (!name || !email || !message) {
            showToast('الرجاء ملء جميع الحقول.', 'error');
            return;
        }
        var success = saveSupportTicket(name, email, message);
        if (success) {
            showToast('تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.', 'success');
            this.reset();
        } else {
            showToast('حدث خطأ، حاول مجدداً.', 'error');
        }
    });
}

document.querySelectorAll('#logout-btn').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
        e.preventDefault();
        logout();
    });
});
