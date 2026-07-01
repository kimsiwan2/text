document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const userIdInput = document.getElementById('user_id');
    const passwordInput = document.getElementById('password');
    const rememberIdCheckbox = document.getElementById('remember_id');
    const toast = document.getElementById('login-toast');
    const toastMessage = document.getElementById('toast-message');

    // Toggle Password Visibility
    const togglePasswordBtn = document.querySelector('.toggle-password');
    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', () => {
            const icon = togglePasswordBtn.querySelector('i');
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.replace('fa-eye', 'fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                icon.classList.replace('fa-eye-slash', 'fa-eye');
            }
        });
    }

    // Load Remembered ID
    const rememberedId = localStorage.getItem('yju_remembered_id');
    if (rememberedId) {
        userIdInput.value = rememberedId;
        rememberIdCheckbox.checked = true;
    }

    // Toast Notification helper
    let toastTimeout;
    function showToast(message) {
        toastMessage.textContent = message;
        toast.classList.add('active');
        
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toast.classList.remove('active');
        }, 3500);
    }

    // Helper to display validation errors on inputs
    function setInputError(inputEl, groupEl, hasError) {
        if (hasError) {
            groupEl.classList.remove('success');
            groupEl.classList.add('error');
        } else {
            groupEl.classList.remove('error');
            groupEl.classList.add('success');
        }
    }

    // Mock Hash Function (Identical to script.js for match validation)
    function generateMockHash(password) {
        let hash1 = 0, hash2 = 0;
        const salt = "YJU_University_Security_Salt_Key";
        const combined = password + salt;
        
        for (let i = 0; i < combined.length; i++) {
            const ch = combined.charCodeAt(i);
            hash1 = (hash1 << 5) - hash1 + ch;
            hash1 |= 0;
            hash2 = (hash2 << 7) - hash2 + ch;
            hash2 |= 0;
        }
        
        const hashStr = Math.abs(hash1).toString(16).padStart(8, '0') + Math.abs(hash2).toString(16).padStart(8, '0');
        return `$bcrypt$2b$12$${hashStr.substring(0, 22)}...`;
    }

    // Form Submission
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const userId = userIdInput.value.trim();
        const password = passwordInput.value;
        const groupId = document.getElementById('group-id');
        const groupPassword = document.getElementById('group-password');

        // Basic client-side empty check
        let hasError = false;
        if (userId === '') {
            setInputError(userIdInput, groupId, true);
            hasError = true;
        } else {
            setInputError(userIdInput, groupId, false);
        }

        if (password === '') {
            setInputError(passwordInput, groupPassword, true);
            hasError = true;
        } else {
            setInputError(passwordInput, groupPassword, false);
        }

        if (hasError) {
            showToast('아이디와 비밀번호를 모두 입력해 주세요.');
            return;
        }

        // Authenticate credentials against local storage mock DB
        const users = JSON.parse(localStorage.getItem('yju_users')) || [];
        const inputHash = generateMockHash(password);

        // Find user by ID and matching password hash
        const matchedUser = users.find(u => u.user_id === userId && u.password === inputHash);

        if (matchedUser) {
            // Success! Save active user session
            localStorage.setItem('yju_active_user', JSON.stringify(matchedUser));

            // Remember ID handling
            if (rememberIdCheckbox.checked) {
                localStorage.setItem('yju_remembered_id', userId);
            } else {
                localStorage.removeItem('yju_remembered_id');
            }

            // Redirect to welcome screen
            window.location.href = 'welcome.html';
        } else {
            // Authentication Failure
            setInputError(userIdInput, groupId, true);
            setInputError(passwordInput, groupPassword, true);
            showToast('아이디 또는 비밀번호가 일치하지 않습니다.');
        }
    });

    // Remove error highlights on input typing
    userIdInput.addEventListener('input', () => {
        document.getElementById('group-id').classList.remove('error');
    });
    passwordInput.addEventListener('input', () => {
        document.getElementById('group-password').classList.remove('error');
    });
});
