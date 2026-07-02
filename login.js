document.addEventListener('DOMContentLoaded', () => {
    // Initialize Supabase Client
    const supabaseUrl = 'https://aefmfqxtujaclvhudnfy.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFlZm1mcXh0dWphY2x2aHVkbmZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4NjAyMDcsImV4cCI6MjA5ODQzNjIwN30.xEZ9PzkMAxMxfsj5cAWlw4SUmxEEJIzUNxuR-bAmQSc';
    const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

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
    loginForm.addEventListener('submit', async (e) => {
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

        const submitBtn = document.getElementById('btn-submit');
        const originalBtnHTML = submitBtn.innerHTML;

        try {
            // Disable button and show loading state
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.7';
            submitBtn.innerHTML = '<span class="btn-text">로그인 중...</span><i class="fa-solid fa-spinner fa-spin"></i>';

            // Authenticate credentials against Supabase
            const inputHash = generateMockHash(password);

            const { data: matchedUser, error: queryError } = await _supabase
                .from('members')
                .select('*')
                .eq('user_id', userId)
                .eq('password', inputHash)
                .maybeSingle();

            if (queryError) throw queryError;

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
        } catch (error) {
            console.error('Login error:', error);
            showToast('로그인 중 오류가 발생했습니다: ' + error.message);
        } finally {
            // Restore button state
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
            submitBtn.innerHTML = originalBtnHTML;
        }
    });

    // Remove error highlights on input typing
    userIdInput.addEventListener('input', () => {
        document.getElementById('group-id').classList.remove('error');
    });
    passwordInput.addEventListener('input', () => {
        document.getElementById('group-password').classList.remove('error');
    });

    // --- Find ID Modal Logic ---
    const linkFindId = document.getElementById('link-find-id');
    const findIdModal = document.getElementById('find-id-modal');
    const closeFindModalBtn = document.getElementById('close-find-modal');
    const btnFindId = document.getElementById('btn-find-id');
    const findNameInput = document.getElementById('find_name');
    const findEmailInput = document.getElementById('find_email');
    const findIdResult = document.getElementById('find-id-result');

    if (linkFindId && findIdModal && closeFindModalBtn) {
        // Open Modal
        linkFindId.addEventListener('click', (e) => {
            e.preventDefault();
            findIdModal.classList.add('active');
            findNameInput.value = '';
            findEmailInput.value = '';
            findIdResult.style.display = 'none';
            findIdResult.textContent = '';
        });

        // Close Modal
        closeFindModalBtn.addEventListener('click', () => {
            findIdModal.classList.remove('active');
        });

        // Close Modal when clicking outside
        findIdModal.addEventListener('click', (e) => {
            if (e.target === findIdModal) {
                findIdModal.classList.remove('active');
            }
        });

        // Find ID Query
        btnFindId.addEventListener('click', async () => {
            const name = findNameInput.value.trim();
            const email = findEmailInput.value.trim();

            if (!name || !email) {
                findIdResult.style.display = 'block';
                findIdResult.style.background = 'rgba(244, 63, 94, 0.1)';
                findIdResult.style.border = '1px solid rgba(244, 63, 94, 0.3)';
                findIdResult.style.color = 'var(--error)';
                findIdResult.textContent = '이름과 이메일을 모두 입력해 주세요.';
                return;
            }

            const originalBtnHTML = btnFindId.innerHTML;
            try {
                btnFindId.disabled = true;
                btnFindId.style.opacity = '0.7';
                btnFindId.innerHTML = '<span class="btn-text">조회 중...</span><i class="fa-solid fa-spinner fa-spin"></i>';

                const { data: matchedUser, error: queryError } = await _supabase
                    .from('members')
                    .select('user_id')
                    .eq('name', name)
                    .eq('email', email)
                    .maybeSingle();

                if (queryError) throw queryError;

                findIdResult.style.display = 'block';
                if (matchedUser) {
                    findIdResult.style.background = 'rgba(16, 185, 129, 0.1)';
                    findIdResult.style.border = '1px solid rgba(16, 185, 129, 0.3)';
                    findIdResult.style.color = 'var(--success)';
                    findIdResult.innerHTML = `조회 완료!<br>회원님의 아이디는 <strong style="color: var(--white); font-size: 16px;">${matchedUser.user_id}</strong> 입니다.`;
                } else {
                    findIdResult.style.background = 'rgba(244, 63, 94, 0.1)';
                    findIdResult.style.border = '1px solid rgba(244, 63, 94, 0.3)';
                    findIdResult.style.color = 'var(--error)';
                    findIdResult.textContent = '일치하는 회원 정보가 없습니다.';
                }
            } catch (error) {
                console.error('Find ID error:', error);
                findIdResult.style.display = 'block';
                findIdResult.style.background = 'rgba(244, 63, 94, 0.1)';
                findIdResult.style.border = '1px solid rgba(244, 63, 94, 0.3)';
                findIdResult.style.color = 'var(--error)';
                findIdResult.textContent = '조회 중 오류가 발생했습니다.';
            } finally {
                btnFindId.disabled = false;
                btnFindId.style.opacity = '1';
                btnFindId.innerHTML = originalBtnHTML;
            }
        });
    }
});
