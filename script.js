document.addEventListener('DOMContentLoaded', () => {
    // Initialize Supabase Client
    const supabaseUrl = 'https://aefmfqxtujaclvhudnfy.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFlZm1mcXh0dWphY2x2aHVkbmZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4NjAyMDcsImV4cCI6MjA5ODQzNjIwN30.xEZ9PzkMAxMxfsj5cAWlw4SUmxEEJIzUNxuR-bAmQSc';
    const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

    const form = document.getElementById('signup-form');
    const userIdInput = document.getElementById('user_id');
    const passwordInput = document.getElementById('password');
    const passwordConfirmInput = document.getElementById('password_confirm');
    const nameInput = document.getElementById('name');
    const nicknameInput = document.getElementById('nickname');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const agreeTermsInput = document.getElementById('agree_terms');
    const strengthBar = document.getElementById('strength-bar');

    // Password Visibility Toggle
    const toggleButtons = document.querySelectorAll('.toggle-password');
    toggleButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const inputField = button.previousElementSibling;
            const icon = button.querySelector('i');
            
            if (inputField.type === 'password') {
                inputField.type = 'text';
                icon.classList.replace('fa-eye', 'fa-eye-slash');
            } else {
                inputField.type = 'password';
                icon.classList.replace('fa-eye-slash', 'fa-eye');
            }
        });
    });

    // Helper: Show validation state
    function setStatus(group, isValid, message = '') {
        const helperText = group.querySelector('.helper-text');
        if (isValid) {
            group.classList.remove('error');
            group.classList.add('success');
            if (helperText) helperText.style.display = 'none';
        } else {
            group.classList.remove('success');
            group.classList.add('error');
            if (helperText) {
                helperText.textContent = message;
                helperText.style.display = 'block';
            }
        }
        return isValid;
    }

    // Helper: Clear validation state
    function clearStatus(group) {
        group.classList.remove('success', 'error');
    }

    // ID Validation: 영문, 숫자 조합 4~20자
    function validateId() {
        const value = userIdInput.value.trim();
        const group = document.getElementById('group-id');
        
        if (value === '') {
            return setStatus(group, false, '아이디를 입력해 주세요.');
        }
        
        const idRegex = /^[a-zA-Z0-9]{4,20}$/;
        if (!idRegex.test(value)) {
            return setStatus(group, false, '아이디는 4~20자의 영문 대소문자 및 숫자만 사용 가능합니다.');
        }
        
        return setStatus(group, true);
    }

    // Password Validation & Strength check
    function validatePassword() {
        const value = passwordInput.value;
        const group = document.getElementById('group-password');
        
        if (value === '') {
            group.classList.remove('active-strength');
            return setStatus(group, false, '비밀번호를 입력해 주세요.');
        }
        
        group.classList.add('active-strength');
        
        // Strength Check Rules
        let score = 0;
        if (value.length >= 8) score++;
        if (/[a-zA-Z]/.test(value) && /[0-9]/.test(value)) score++;
        if (/[^a-zA-Z0-9]/.test(value)) score++;

        // Update UI based on strength score
        strengthBar.className = 'strength-bar';
        if (score === 1) {
            strengthBar.classList.add('weak');
        } else if (score === 2) {
            strengthBar.classList.add('medium');
        } else if (score === 3) {
            strengthBar.classList.add('strong');
        }

        // Rules check for display message
        if (value.length < 8) {
            return setStatus(group, false, '비밀번호는 최소 8자 이상이어야 합니다.');
        }
        if (!(/[a-zA-Z]/.test(value) && /[0-9]/.test(value))) {
            return setStatus(group, false, '비밀번호는 영문자와 숫자를 조합해야 합니다.');
        }
        if (!/[^a-zA-Z0-9]/.test(value)) {
            return setStatus(group, false, '비밀번호에는 최소 1개 이상의 특수문자가 포함되어야 합니다.');
        }

        return setStatus(group, true);
    }

    // Password Confirmation Validation
    function validatePasswordConfirm() {
        const value = passwordConfirmInput.value;
        const passwordValue = passwordInput.value;
        const group = document.getElementById('group-password-confirm');
        
        if (value === '') {
            return setStatus(group, false, '비밀번호 확인을 입력해 주세요.');
        }
        
        if (value !== passwordValue) {
            return setStatus(group, false, '비밀번호가 일치하지 않습니다.');
        }
        
        return setStatus(group, true);
    }

    // Email Validation
    function validateEmail() {
        const value = emailInput.value.trim();
        const group = document.getElementById('group-email');
        
        if (value === '') {
            return setStatus(group, false, '이메일 주소를 입력해 주세요.');
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            return setStatus(group, false, '올바른 이메일 형식이 아닙니다 (예: id@domain.com).');
        }
        
        return setStatus(group, true);
    }

    // Phone Auto-format & Validation
    phoneInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, ''); // Extract only digits
        
        if (value.length > 11) {
            value = value.slice(0, 11);
        }
        
        // Auto-hyphenation formatting logic
        if (value.length <= 3) {
            e.target.value = value;
        } else if (value.length <= 7) {
            e.target.value = value.replace(/(\d{3})(\d{1,4})/, '$1-$2');
        } else {
            e.target.value = value.replace(/(\d{3})(\d{3,4})(\d{1,4})/, '$1-$2-$3');
        }
        
        // Run validation on typing
        validatePhone();
    });

    function validatePhone() {
        const value = phoneInput.value.trim();
        const group = document.getElementById('group-phone');
        
        if (value === '') {
            return setStatus(group, false, '전화번호를 입력해 주세요.');
        }
        
        const phoneRegex = /^010-\d{3,4}-\d{4}$/;
        if (!phoneRegex.test(value)) {
            return setStatus(group, false, '올바른 전화번호 형식(010-XXXX-XXXX)이 아닙니다.');
        }
        
        return setStatus(group, true);
    }

    // Event Listeners for real-time validation feedback
    userIdInput.addEventListener('input', validateId);
    passwordInput.addEventListener('input', () => {
        validatePassword();
        if (passwordConfirmInput.value !== '') {
            validatePasswordConfirm();
        }
    });
    function validateName() {
        const value = nameInput.value.trim();
        const group = document.getElementById('group-name');
        
        if (value === '') {
            return setStatus(group, false, '이름을 입력해 주세요.');
        }
        return setStatus(group, true);
    }

    function validateNickname() {
        const value = nicknameInput.value.trim();
        const group = document.getElementById('group-nickname');
        
        if (value === '') {
            return setStatus(group, false, '닉네임을 입력해 주세요.');
        }
        return setStatus(group, true);
    }

    passwordConfirmInput.addEventListener('input', validatePasswordConfirm);
    nameInput.addEventListener('input', validateName);
    nicknameInput.addEventListener('input', validateNickname);
    emailInput.addEventListener('input', validateEmail);

    // Terms and Conditions checkbox event listener
    agreeTermsInput.addEventListener('change', () => {
        const checkboxLabel = document.querySelector('.custom-checkbox');
        if (agreeTermsInput.checked) {
            checkboxLabel.style.outline = 'none';
        }
    });

    // Mock Hash Function (simulating secure backend hashing)
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
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validate all fields
        const isIdValid = validateId();
        const isPwValid = validatePassword();
        const isPwConfirmValid = validatePasswordConfirm();
        const isNameValid = validateName();
        const isNicknameValid = validateNickname();
        const isEmailValid = validateEmail();
        const isPhoneValid = validatePhone();
        
        // Check terms checkbox
        let isTermsValid = true;
        if (!agreeTermsInput.checked) {
            isTermsValid = false;
            const checkboxLabel = document.querySelector('.custom-checkbox');
            checkboxLabel.style.outline = '2px solid var(--error)';
            checkboxLabel.style.outlineOffset = '4px';
            checkboxLabel.style.borderRadius = '4px';
        } else {
            const checkboxLabel = document.querySelector('.custom-checkbox');
            checkboxLabel.style.outline = 'none';
        }

        // If any field is invalid, cancel submit and focus the first invalid element
        if (!isIdValid) { userIdInput.focus(); return; }
        if (!isPwValid) { passwordInput.focus(); return; }
        if (!isPwConfirmValid) { passwordConfirmInput.focus(); return; }
        if (!isNameValid) { nameInput.focus(); return; }
        if (!isNicknameValid) { nicknameInput.focus(); return; }
        if (!isEmailValid) { emailInput.focus(); return; }
        if (!isPhoneValid) { phoneInput.focus(); return; }
        if (!isTermsValid) { agreeTermsInput.focus(); return; }

        const userId = userIdInput.value.trim();
        const plainPassword = passwordInput.value;
        const name = nameInput.value.trim();
        const nickname = nicknameInput.value.trim();
        const email = emailInput.value.trim();
        const phone = phoneInput.value.trim();
        const hashedPassword = generateMockHash(plainPassword);

        const submitBtn = document.getElementById('btn-submit');
        const originalBtnHTML = submitBtn.innerHTML;

        try {
            // Disable button and show loading state
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.7';
            submitBtn.innerHTML = '<span class="btn-text">가입 처리 중...</span><i class="fa-solid fa-spinner fa-spin"></i>';

            // Check if user_id already exists in Supabase
            const { data: existingUser, error: checkIdError } = await _supabase
                .from('members')
                .select('user_id')
                .eq('user_id', userId)
                .maybeSingle();

            if (checkIdError) throw checkIdError;
            if (existingUser) {
                setStatus(document.getElementById('group-id'), false, '이미 사용 중인 아이디입니다.');
                userIdInput.focus();
                return;
            }

            // Check if email already exists in Supabase
            const { data: existingEmail, error: checkEmailError } = await _supabase
                .from('members')
                .select('email')
                .eq('email', email)
                .maybeSingle();

            if (checkEmailError) throw checkEmailError;
            if (existingEmail) {
                setStatus(document.getElementById('group-email'), false, '이미 사용 중인 이메일입니다.');
                emailInput.focus();
                return;
            }

            // Insert new user into Supabase members table
            const { data: insertedUser, error: insertError } = await _supabase
                .from('members')
                .insert([{
                    user_id: userId,
                    password: hashedPassword,
                    name: name,
                    nickname: nickname,
                    email: email,
                    phone: phone
                }])
                .select()
                .single();

            if (insertError) throw insertError;

            // Save session to LocalStorage (so welcome.html can read it)
            localStorage.setItem('yju_active_user', JSON.stringify(insertedUser));

            // Populate Success Modal Fields with actual DB values
            document.getElementById('db-number').textContent = insertedUser.number;
            document.getElementById('db-userid').textContent = insertedUser.user_id;
            document.getElementById('db-password').textContent = insertedUser.password;
            document.getElementById('db-email').textContent = insertedUser.email;
            document.getElementById('db-phone').textContent = insertedUser.phone;

            // Also update the heading in the database display section (make it feel premium)
            const dbMockDisplay = document.querySelector('.db-mock-display h3');
            if (dbMockDisplay) {
                dbMockDisplay.innerHTML = '<i class="fa-solid fa-database"></i> Supabase Database INSERT';
            }
            const dbDesc = document.querySelector('.db-desc');
            if (dbDesc) {
                dbDesc.textContent = 'Supabase PostgreSQL 데이터베이스에 성공적으로 실시간 저장된 레코드입니다.';
            }

            // Open Modal
            const modal = document.getElementById('success-modal');
            modal.classList.add('active');

        } catch (error) {
            console.error('Registration failed:', error);
            alert('회원가입 처리 중 오류가 발생했습니다: ' + error.message);
        } finally {
            // Restore button state if not successful (though if successful it redirects or opens modal)
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
            submitBtn.innerHTML = originalBtnHTML;
        }
    });

    // Close Modal and Redirect to welcome page
    document.getElementById('btn-modal-close').addEventListener('click', () => {
        window.location.href = 'welcome.html';
    });
});
