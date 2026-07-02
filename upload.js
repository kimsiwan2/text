const https = require('https');
const fs = require('fs');
const path = require('path');

const OWNER = 'kimsiwan2';
const REPO = 'text'; // Destination repository requested by the user
const TOKEN = process.argv[2];

if (!TOKEN) {
    console.error('오류: GitHub 개인 액세스 토큰(PAT)을 인자로 입력해야 합니다.');
    console.error('사용법: node upload.js <YOUR_GITHUB_TOKEN>');
    process.exit(1);
}

const filesToUpload = [
    { localPath: 'db_design.md', remotePath: 'db_design.md', message: 'docs: add database design schema' },
    { localPath: 'index.html', remotePath: 'index.html', message: 'feat: add signup page layout' },
    { localPath: 'styles.css', remotePath: 'styles.css', message: 'feat: add signup premium styling' },
    { localPath: 'script.js', remotePath: 'script.js', message: 'feat: add verification and mock db interactions' },
    { localPath: 'welcome.html', remotePath: 'welcome.html', message: 'feat: add welcome profile landing page' },
    { localPath: 'login.html', remotePath: 'login.html', message: 'feat: add login page layout' },
    { localPath: 'login.js', remotePath: 'login.js', message: 'feat: add login page interactions' },
    { localPath: 'supabase_schema.sql', remotePath: 'supabase_schema.sql', message: 'feat: add supabase sql schema script' }
];

// JSON Communication helper function
function request(options, body = null) {
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                let parsed = null;
                try {
                    if (data) parsed = JSON.parse(data);
                } catch (e) {
                    parsed = data;
                }
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body: parsed
                });
            });
        });
        
        req.on('error', (err) => reject(err));
        
        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

async function uploadFile(file) {
    const fullLocalPath = path.resolve(__dirname, file.localPath);
    if (!fs.existsSync(fullLocalPath)) {
        console.log(`건너뜀: ${file.localPath} (로컬 파일이 존재하지 않음)`);
        return;
    }

    const contentBuffer = fs.readFileSync(fullLocalPath);
    const contentBase64 = contentBuffer.toString('base64');

    const checkOptions = {
        hostname: 'api.github.com',
        path: `/repos/${OWNER}/${REPO}/contents/${file.remotePath}`,
        method: 'GET',
        headers: {
            'Authorization': `token ${TOKEN}`,
            'Accept': 'application/vnd.github+json',
            'User-Agent': 'Antigravity-IDE'
        }
    };

    console.log(`\n[${file.remotePath}] GitHub 원격 상태 확인 중...`);
    let sha = null;
    try {
        const res = await request(checkOptions);
        if (res.statusCode === 200) {
            sha = res.body.sha;
            console.log(`  원격에 기존 파일 확인됨. SHA: ${sha}`);
        } else if (res.statusCode === 404) {
            console.log(`  원격에 파일이 존재하지 않음. 신규 생성 예정.`);
        } else {
            console.error(`  파일 상태 확인 오류 (HTTP ${res.statusCode}):`, res.body);
            return;
        }
    } catch (err) {
        console.error(`  요청 전송 실패: ${err.message}`);
        return;
    }

    const uploadOptions = {
        hostname: 'api.github.com',
        path: `/repos/${OWNER}/${REPO}/contents/${file.remotePath}`,
        method: 'PUT',
        headers: {
            'Authorization': `token ${TOKEN}`,
            'Accept': 'application/vnd.github+json',
            'User-Agent': 'Antigravity-IDE',
            'Content-Type': 'application/json'
        }
    };

    const body = {
        message: file.message,
        content: contentBase64
    };
    if (sha) {
        body.sha = sha;
    }

    console.log(`  업로드 진행 중...`);
    try {
        const res = await request(uploadOptions, body);
        if (res.statusCode === 200 || res.statusCode === 201) {
            console.log(`  업로드 성공: ${file.remotePath}!`);
        } else {
            console.error(`  업로드 실패: ${file.remotePath} (HTTP ${res.statusCode}):`, res.body);
        }
    } catch (err) {
        console.error(`  업로드 중 오류 발생: ${err.message}`);
    }
}

async function run() {
    console.log(`=======================================================`);
    console.log(`GitHub 저장소 ${OWNER}/${REPO} 로 파일 업로드를 시작합니다.`);
    console.log(`=======================================================`);
    for (const file of filesToUpload) {
        await uploadFile(file);
    }
    console.log(`\n=======================================================`);
    console.log('모든 업로드 프로세스가 완료되었습니다!');
    console.log(`=======================================================`);
}

run();
