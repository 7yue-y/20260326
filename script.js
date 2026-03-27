/**
 * 这是一个本地静态站点的相册密码配置文件。
 * 您可以在此处修改对应人物相册的密码。
 * 如果希望移除密码限制，可以将密码设置为空字符串 ""。
 * 如果您添加了新文件夹但没有在这里配置密码，默认是没有密码保护的！
 * 
 * 注意：添加相片或文件夹后，请直接双击运行 【一键同步相片.bat】！
 */
const albumPasswords = {
    "Me": "123",
    "周婷怡": "5103",
    "李嘉慧": "1322",
    "肖璠": "4546",
    "黄文晨": "732X"
};

document.addEventListener('DOMContentLoaded', () => {
    // 从 data.js 和 albumPasswords 合并配置
    // photoData 是在 data.js 中定义的全局变量
    const albumConfig = {};
    for (const albumName in photoData) {
        albumConfig[albumName] = {
            images: photoData[albumName],
            password: albumPasswords[albumName] !== undefined ? albumPasswords[albumName] : "" // 缺省木有密码
        };
    }

    // DOM 元素引用
    const albumGrid = document.getElementById('album-grid');
    const passwordModal = document.getElementById('password-modal');
    const modalAlbumName = document.getElementById('modal-album-name');
    const passwordInput = document.getElementById('album-password');
    const submitBtn = document.getElementById('submit-password');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const passwordError = document.getElementById('password-error');

    const mainContainer = document.getElementById('main-container');
    const galleryView = document.getElementById('gallery-view');
    const galleryTitle = document.getElementById('gallery-title');
    const galleryImages = document.getElementById('gallery-images');
    const backBtn = document.getElementById('back-to-albums');

    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeLightboxBtn = document.getElementById('close-lightbox');

    let currentSelectedAlbum = null;

    // 1. 渲染相册封面网格
    for (const albumName in albumConfig) {
        const card = document.createElement('div');
        card.className = 'album-card glass-effect';
        card.innerHTML = `
            <div class="folder-icon">📁</div>
            <div class="album-name">${albumName}</div>
        `;

        card.addEventListener('click', () => {
            openPasswordModal(albumName);
        });

        albumGrid.appendChild(card);
    }

    // 2. 模态框逻辑
    function openPasswordModal(albumName) {
        currentSelectedAlbum = albumName;
        modalAlbumName.textContent = `解锁 "${albumName}" 的相册`;
        passwordInput.value = '';
        passwordError.classList.remove('show');

        // 如果密码为空，直接进入
        if (albumConfig[albumName].password === "") {
            const albumToOpen = currentSelectedAlbum;
            currentSelectedAlbum = null;
            openGallery(albumToOpen);
            return;
        }

        passwordModal.classList.add('active');
        setTimeout(() => passwordInput.focus(), 100);
    }

    function closePasswordModal() {
        passwordModal.classList.remove('active');
        currentSelectedAlbum = null;
    }

    closeModalBtn.addEventListener('click', closePasswordModal);

    // 点击遮罩层也可以关闭模态框
    passwordModal.addEventListener('click', (e) => {
        if (e.target === passwordModal) {
            closePasswordModal();
        }
    });

    function verifyPassword() {
        if (!currentSelectedAlbum) return;

        const inputPassword = passwordInput.value;
        const correctPassword = albumConfig[currentSelectedAlbum].password;

        if (inputPassword === correctPassword) {
            const albumToOpen = currentSelectedAlbum; // 保存对当前相册的引用
            closePasswordModal(); // 此操作将 currentSelectedAlbum 置为空
            openGallery(albumToOpen); // 使用刚刚保存的引用打开画廊
        } else {
            passwordError.classList.add('show');
            // 抖动模态框动画效果
            const content = passwordModal.querySelector('.modal-content');
            content.style.transform = 'translate(-10px, 0)';
            setTimeout(() => content.style.transform = 'translate(10px, 0)', 100);
            setTimeout(() => content.style.transform = 'translate(-10px, 0)', 200);
            setTimeout(() => content.style.transform = 'translate(0, 0)', 300);
        }
    }

    submitBtn.addEventListener('click', verifyPassword);

    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            verifyPassword();
        }
    });

    // 3. 画廊渲染逻辑
    function openGallery(albumName) {
        // 隐藏主视图，显示画廊
        mainContainer.classList.add('hidden');
        galleryView.classList.add('active');
        window.scrollTo(0, 0);

        galleryTitle.textContent = `${albumName} 的成年礼相册`;
        galleryImages.innerHTML = '';

        const images = albumConfig[albumName].images;

        if (images.length === 0) {
            galleryImages.innerHTML = '<p style="color: var(--text-muted); text-align: center; grid-column: 1 / -1; width: 100%;">此相册暂无相片</p>';
            return;
        }

        images.forEach((imgFile, index) => {
            const item = document.createElement('div');
            item.className = 'gallery-item';

            // 为了更好的动画效果，我们为每个图片加载添加延迟动画
            item.style.animation = `fadeInUp 0.6s ease ${index * 0.05}s backwards`;

            const imgPath = `${albumName}/${imgFile}`;

            item.innerHTML = `<img src="${imgPath}" alt="${albumName} 的相片" loading="lazy">`;

            item.addEventListener('click', () => {
                openLightbox(imgPath);
            });

            galleryImages.appendChild(item);
        });
    }

    backBtn.addEventListener('click', () => {
        galleryView.classList.remove('active');
        // 等待淡出动画完成后再显示主页面
        setTimeout(() => {
            mainContainer.classList.remove('hidden');
            galleryImages.innerHTML = ''; // 清理 DOM，释放内存
        }, 400);
    });

    // 4. 全屏大图查看器 (Lightbox) 逻辑
    function openLightbox(src) {
        lightboxImg.src = src;
        lightbox.classList.add('active');
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        setTimeout(() => { lightboxImg.src = ''; }, 300); // 彻底关闭后清理 src
    }

    closeLightboxBtn.addEventListener('click', closeLightbox);

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // 支持 ESC 键关闭全屏
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (lightbox.classList.contains('active')) {
                closeLightbox();
            } else if (passwordModal.classList.contains('active')) {
                closePasswordModal();
            }
        }
    });
});

// 添加动态 keyframes 以供 js 定义的缩放动画使用
if (!document.getElementById("dynamic-keyframes")) {
    const styleSheet = document.createElement("style");
    styleSheet.id = "dynamic-keyframes";
    styleSheet.innerText = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
        }
        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }
    `;
    document.head.appendChild(styleSheet);
}
