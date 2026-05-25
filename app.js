// 全局数据管理
const globalData = {
    userInfo: null,
    users: [], // 用户数据从后端数据库获取
    activities: [
        {
            id: 1,
            name: '校园招聘会',
            date: '2026-05-15',
            location: '大学生活动中心',
            description: '多家企业现场招聘，提供实习和全职岗位'
        },
        {
            id: 2,
            name: '校园音乐节',
            date: '2026-05-20',
            location: '操场',
            description: '年度校园音乐节，众多乐队倾情演出'
        }
    ],
    products: [
        {
            id: 1,
            title: '二手笔记本电脑',
            price: 2500,
            description: '联想ThinkPad，使用一年，成色良好，性能稳定',
            images: [],
            category: '数码',
            seller: '张三',
            phone: '13800138000',
            createTime: '2026-03-20',
            status: 'approved',
            rejectReason: ''
        },
        {
            id: 2,
            title: '考研资料全套',
            price: 200,
            description: '包含数学、英语、政治全套复习资料，笔记详细',
            images: [],
            category: '书籍',
            seller: '李四',
            phone: '13900139000',
            createTime: '2026-03-21',
            status: 'approved',
            rejectReason: ''
        },
        {
            id: 3,
            title: '自行车',
            price: 300,
            description: '山地自行车，九成新，骑行舒适',
            images: [],
            category: '生活用品',
            seller: '王五',
            phone: '13700137000',
            createTime: '2026-03-22',
            status: 'approved',
            rejectReason: ''
        }
    ],
    favorites: {},
    cart: {},
    orders: {},
    reviews: {},
    addresses: {}
};

// 页面管理
const pages = {
    current: 'login',
    stack: [],
    switch(pageId) {
        // 隐藏所有页面
        document.querySelectorAll('.page').forEach(page => {
            page.style.display = 'none';
        });
        // 显示目标页面
        document.getElementById(`${pageId}-page`).style.display = 'block';
        this.current = pageId;
    },
    push(pageId) {
        this.stack.push(this.current);
        this.switch(pageId);
    },
    pop() {
        if (this.stack.length > 0) {
            const prevPage = this.stack.pop();
            this.switch(prevPage);
        }
    }
};

// 本地存储操作
function saveData(key) {
    try {
        localStorage.setItem(key, JSON.stringify(globalData[key]));
    } catch (error) {
        console.error('保存数据失败:', error);
    }
}

function loadData() {
    try {
        const keys = ['userInfo', 'users', 'activities', 'products', 'favorites', 'cart', 'orders', 'reviews', 'addresses'];
        keys.forEach(key => {
            const data = localStorage.getItem(key);
            if (data) {
                globalData[key] = JSON.parse(data);
            }
        });
    } catch (error) {
        console.error('加载数据失败:', error);
    }
}

// 初始化
function init() {
    loadData();
    // 检查登录状态
    if (globalData.userInfo) {
        pages.switch('index');
        updateWelcomeText();
        loadActivities();
        loadProducts();
    } else {
        pages.switch('login');
    }
    // 绑定事件
    bindEvents();
}

// 绑定事件
function bindEvents() {
    // 登录标签切换
    document.querySelectorAll('.login-tabs .tab-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.login-tabs .tab-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // 导航栏切换
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const page = this.dataset.page;
            pages.push(page);
            if (page === 'index') {
                loadActivities();
                loadProducts();
            } else if (page === 'cart') {
                loadCart();
            } else if (page === 'profile') {
                loadProfile();
            }
        });
    });

    // 分类按钮
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filterProducts();
        });
    });
}

// 邮箱格式校验
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// 密码复杂度校验：至少8位，包含大小写字母
function validatePassword(password) {
    if (password.length < 8) {
        return { valid: false, message: '密码长度至少8位' };
    }
    if (!/[a-z]/.test(password)) {
        return { valid: false, message: '密码必须包含小写字母' };
    }
    if (!/[A-Z]/.test(password)) {
        return { valid: false, message: '密码必须包含大写字母' };
    }
    return { valid: true, message: '' };
}

// 登录相关功能
const API_URL = 'http://f262a7ea.natappfree.cc/campus_community_backend_war_exploded/api';

async function handleLogin() {
    const email = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const loginType = document.querySelector('.login-tabs .tab-btn.active').dataset.type;

    if (!email || !password) {
        alert('请输入邮箱和密码');
        return;
    }

    if (!validateEmail(email)) {
        alert('请输入正确的邮箱格式');
        return;
    }

    if (loginType === 'admin') {
        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
            });

            const result = await response.json();

            if (result.success) {
                globalData.userInfo = {
                    id: result.data.id,
                    username: '管理员',
                    type: 'admin'
                };
                saveData('userInfo');
                alert('管理员登录成功');
                pages.switch('index');
                updateWelcomeText();
                loadProducts();
                loadActivities();
            } else {
                alert('管理员邮箱或密码错误');
            }
        } catch (error) {
            alert('管理员登录失败，请检查网络连接');
            console.error('Admin login error:', error);
        }
        return;
    }

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
        });

        const result = await response.json();

        if (result.success) {
            globalData.userInfo = {
                id: result.data.id,
                username: result.data.email.split('@')[0],
                type: 'user'
            };
            saveData('userInfo');
            alert('登录成功');
            pages.switch('index');
            updateWelcomeText();
            loadProducts();
            loadActivities();
        } else {
            alert(result.message);
        }
    } catch (error) {
        alert('登录失败，请检查网络连接');
        console.error('Login error:', error);
    }
}

function showRegisterForm() {
    document.querySelector('.login-form').style.display = 'none';
    document.querySelector('.register-form').style.display = 'block';
}

function showLoginForm() {
    document.querySelector('.register-form').style.display = 'none';
    document.querySelector('.login-form').style.display = 'block';
}

async function handleRegister() {
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm-password').value;

    if (!email || !password || !confirmPassword) {
        alert('请填写所有字段');
        return;
    }

    if (!validateEmail(email)) {
        alert('请输入正确的邮箱格式');
        return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
        alert(passwordValidation.message);
        return;
    }

    if (password !== confirmPassword) {
        alert('两次密码不一致');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
        });

        const result = await response.json();

        if (result.success) {
            alert('注册成功，请登录');
            showLoginForm();
        } else {
            alert(result.message);
        }
    } catch (error) {
        alert('注册失败，请检查网络连接');
        console.error('Register error:', error);
    }
}

function logout() {
    if (confirm('确定要退出登录吗？')) {
        globalData.userInfo = null;
        saveData('userInfo');
        pages.switch('login');
    }
}

// 页面导航
function goToPublish() {
    if (!globalData.userInfo) {
        alert('请先登录');
        pages.switch('login');
        return;
    }
    pages.push('publish');
    // 填充联系人信息
    document.getElementById('publish-seller').value = globalData.userInfo.username;
    document.getElementById('publish-phone').value = globalData.userInfo.phone || '';
}

function goToDetail(productId) {
    if (!globalData.userInfo) {
        alert('请先登录');
        pages.switch('login');
        return;
    }
    pages.push('detail');
    loadProductDetail(productId);
}

function goToMyProducts() {
    pages.push('myproducts');
    loadMyProducts();
}

function goToOrders() {
    pages.push('orders');
    loadOrders();
}

function goToFavorites() {
    pages.push('favorites');
    loadFavorites();
}

function goToAddress() {
    pages.push('address');
    loadAddress();
}

function goToAudit() {
    pages.push('audit');
    loadAudit();
}

function goToUsers() {
    pages.push('users');
    loadUsers();
}

function goToStatistics() {
    pages.push('statistics');
    loadStatistics();
}

function goBack() {
    pages.pop();
}

// 商品相关功能
function loadProducts() {
    const productList = document.getElementById('product-list');
    const approvedProducts = globalData.products.filter(p => p.status === 'approved');

    productList.innerHTML = '';
    approvedProducts.forEach(product => {
        const productItem = document.createElement('div');
        productItem.className = 'product-item';
        productItem.onclick = () => goToDetail(product.id);
        productItem.innerHTML = `
            <h3>${product.title}</h3>
            <div class="price">¥${product.price}</div>
            <div class="info">分类：${product.category}</div>
            <div class="info">发布者：${product.seller}</div>
            <div class="info">发布时间：${product.createTime}</div>
        `;
        productList.appendChild(productItem);
    });
}

function loadProductDetail(productId) {
    const product = globalData.products.find(p => p.id === parseInt(productId));
    const productDetail = document.getElementById('product-detail');

    if (product) {
        productDetail.innerHTML = `
            <h2>${product.title}</h2>
            <div class="price">¥${product.price}</div>
            <div class="info">分类：${product.category}</div>
            <div class="info">发布者：${product.seller}</div>
            <div class="info">联系电话：${product.phone}</div>
            <div class="info">发布时间：${product.createTime}</div>
            <div class="description">
                <strong>商品描述：</strong><br>
                ${product.description}
            </div>
            <div class="product-actions">
                <button class="action-btn secondary" onclick="toggleFavorite(${product.id})">收藏</button>
                <button class="action-btn secondary" onclick="addToCart(${product.id})">加入购物车</button>
                <button class="action-btn primary" onclick="buyProduct(${product.id})">立即购买</button>
            </div>
        `;
    }
}

function submitPublish() {
    const title = document.getElementById('publish-title').value;
    const price = document.getElementById('publish-price').value;
    const category = document.getElementById('publish-category').value;
    const description = document.getElementById('publish-description').value;
    const seller = document.getElementById('publish-seller').value;
    const phone = document.getElementById('publish-phone').value;

    if (!title || !price || !category || !description || !seller || !phone) {
        alert('请填写所有字段');
        return;
    }

    const newProduct = {
        id: Date.now(),
        title,
        price: parseFloat(price),
        category,
        description,
        seller: globalData.userInfo.username,
        phone,
        createTime: new Date().toISOString().split('T')[0],
        images: [],
        status: 'pending',
        rejectReason: ''
    };

    globalData.products.unshift(newProduct);
    saveData('products');
    alert('提交成功，等待审核');
    pages.pop();
    loadProducts();
}

function filterProducts(keyword) {
    const selectedCategory = document.querySelector('.category-btn.active').dataset.category;
    const searchKeyword = keyword || document.getElementById('search-input').value;

    let filtered = globalData.products.filter(p => p.status === 'approved');

    if (selectedCategory) {
        filtered = filtered.filter(p => p.category === selectedCategory);
    }

    if (searchKeyword) {
        filtered = filtered.filter(p =>
            p.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
            p.description.toLowerCase().includes(searchKeyword.toLowerCase())
        );
    }

    const productList = document.getElementById('product-list');
    productList.innerHTML = '';
    if (filtered.length === 0) {
        productList.innerHTML = '<p>未找到匹配的商品</p>';
        return;
    }
    filtered.forEach(product => {
        const productItem = document.createElement('div');
        productItem.className = 'product-item';
        productItem.onclick = () => goToDetail(product.id);
        productItem.innerHTML = `
            <h3>${product.title}</h3>
            <div class="price">¥${product.price}</div>
            <div class="info">分类：${product.category}</div>
            <div class="info">发布者：${product.seller}</div>
            <div class="info">发布时间：${product.createTime}</div>
        `;
        productList.appendChild(productItem);
    });
}

function onSearchInput() {
    filterProducts();
}

// 购物车相关功能
function loadCart() {
    const cartList = document.getElementById('cart-list');
    const cartTotal = document.getElementById('cart-total');

    if (!globalData.userInfo) {
        cartList.innerHTML = '<p>请先登录</p>';
        return;
    }

    const userId = globalData.userInfo.id;
    const userCart = globalData.cart[userId] || [];

    cartList.innerHTML = '';
    if (userCart.length === 0) {
        cartList.innerHTML = '<p>购物车为空</p>';
        cartTotal.innerHTML = '';
        return;
    }

    let total = 0;
    userCart.forEach(item => {
        total += item.price * item.quantity;
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="info">
                <h3>${item.title}</h3>
                <div class="price">¥${item.price}</div>
            </div>
            <div class="quantity">
                <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                <span>${item.quantity}</span>
                <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
            </div>
            <button class="action-btn secondary" onclick="removeFromCart(${item.id})")">删除</button>
        `;
        cartList.appendChild(cartItem);
    });

    cartTotal.innerHTML = `
        <div class="total-price">总计：¥${total.toFixed(2)}</div>
        <button class="action-btn primary" onclick="checkout()">结算</button>
    `;
}

function addToCart(productId) {
    if (!globalData.userInfo) {
        alert('请先登录');
        pages.switch('login');
        return;
    }

    const userId = globalData.userInfo.id;
    globalData.cart[userId] = globalData.cart[userId] || [];
    const userCart = globalData.cart[userId];
    const product = globalData.products.find(p => p.id === productId);

    if (product) {
        const existItem = userCart.find(item => item.id === productId);
        if (existItem) {
            existItem.quantity++;
        } else {
            userCart.push({
                ...product,
                quantity: 1
            });
        }
        saveData('cart');
        alert('已加入购物车');
    }
}

function updateQuantity(productId, change) {
    const userId = globalData.userInfo.id;
    const userCart = globalData.cart[userId] || [];
    const item = userCart.find(item => item.id === productId);

    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            const index = userCart.findIndex(item => item.id === productId);
            userCart.splice(index, 1);
        }
        saveData('cart');
        loadCart();
    }
}

function removeFromCart(productId) {
    const userId = globalData.userInfo.id;
    const userCart = globalData.cart[userId] || [];
    const index = userCart.findIndex(item => item.id === productId);

    if (index > -1) {
        userCart.splice(index, 1);
        saveData('cart');
        loadCart();
    }
}

function buyProduct(productId) {
    addToCart(productId);
    setTimeout(() => {
        pages.switch('cart');
        loadCart();
    }, 500);
}

function checkout() {
    alert('结算功能开发中');
}

// 个人中心相关功能
function loadProfile() {
    const userProfile = document.getElementById('user-profile');
    const adminMenu = document.getElementById('admin-menu');

    if (globalData.userInfo) {
        userProfile.innerHTML = `
            <h3>用户信息</h3>
            <p>用户名：${globalData.userInfo.username}</p>
            <p>用户类型：${globalData.userInfo.type === 'admin' ? '管理员' : '普通用户'}</p>
            ${globalData.userInfo.phone ? `<p>手机号：${globalData.userInfo.phone}</p>` : ''}
        `;

        if (globalData.userInfo.type === 'admin') {
            adminMenu.style.display = 'block';
        } else {
            adminMenu.style.display = 'none';
        }
    } else {
        userProfile.innerHTML = '<p>请先登录</p>';
        adminMenu.style.display = 'none';
    }
}

function loadMyProducts() {
    const myProductsList = document.getElementById('my-products-list');

    if (!globalData.userInfo) {
        myProductsList.innerHTML = '<p>请先登录</p>';
        return;
    }

    const myProducts = globalData.products.filter(p => p.seller === globalData.userInfo.username);

    myProductsList.innerHTML = '';
    if (myProducts.length === 0) {
        myProductsList.innerHTML = '<p>您还没有发布商品</p>';
        return;
    }

    myProducts.forEach(product => {
        const productItem = document.createElement('div');
        productItem.className = 'product-item';
        productItem.innerHTML = `
            <h3>${product.title}</h3>
            <div class="price">¥${product.price}</div>
            <div class="info">分类：${product.category}</div>
            <div class="info">发布时间：${product.createTime}</div>
            <div class="info">状态：${getStatusText(product.status)}</div>
            ${product.rejectReason ? `<div class="info">拒绝原因：${product.rejectReason}</div>` : ''}
        `;
        myProductsList.appendChild(productItem);
    });
}

function getStatusText(status) {
    switch (status) {
        case 'pending': return '待审核';
        case 'approved': return '已通过';
        case 'rejected': return '已拒绝';
        default: return '未知状态';
    }
}

function toggleFavorite(productId) {
    if (!globalData.userInfo) {
        alert('请先登录');
        pages.switch('login');
        return;
    }

    const userId = globalData.userInfo.id;
    globalData.favorites[userId] = globalData.favorites[userId] || [];
    const userFavorites = globalData.favorites[userId];
    const index = userFavorites.findIndex(item => item.id === productId);

    if (index > -1) {
        userFavorites.splice(index, 1);
        saveData('favorites');
        alert('已取消收藏');
    } else {
        const product = globalData.products.find(p => p.id === productId);
        if (product) {
            userFavorites.push(product);
            saveData('favorites');
            alert('收藏成功');
        }
    }
}

// 辅助函数
function updateWelcomeText() {
    if (globalData.userInfo) {
        document.getElementById('welcome-text').textContent = `欢迎，${globalData.userInfo.username}`;
    }
}

// 订单相关功能
function loadOrders() {
    const orderList = document.getElementById('order-list');

    if (!globalData.userInfo) {
        orderList.innerHTML = '<p>请先登录</p>';
        return;
    }

    const userId = globalData.userInfo.id;
    const userOrders = globalData.orders[userId] || [];

    orderList.innerHTML = '';
    if (userOrders.length === 0) {
        orderList.innerHTML = '<p>暂无订单</p>';
        return;
    }

    userOrders.forEach(order => {
        const orderItem = document.createElement('div');
        orderItem.className = 'order-item';
        orderItem.innerHTML = `
            <h3>订单号：${order.id}</h3>
            <div class="order-info">商品：${order.products.map(p => p.title).join(', ')}</div>
            <div class="order-info">总金额：¥${order.totalPrice}</div>
            <div class="order-info">下单时间：${order.createTime}</div>
            <div class="order-status">状态：${order.status}</div>
        `;
        orderList.appendChild(orderItem);
    });
}

// 收藏相关功能
function loadFavorites() {
    const favoritesList = document.getElementById('favorites-list');

    if (!globalData.userInfo) {
        favoritesList.innerHTML = '<p>请先登录</p>';
        return;
    }

    const userId = globalData.userInfo.id;
    const userFavorites = globalData.favorites[userId] || [];

    favoritesList.innerHTML = '';
    if (userFavorites.length === 0) {
        favoritesList.innerHTML = '<p>暂无收藏</p>';
        return;
    }

    userFavorites.forEach(product => {
        const productItem = document.createElement('div');
        productItem.className = 'product-item';
        productItem.onclick = () => goToDetail(product.id);
        productItem.innerHTML = `
            <h3>${product.title}</h3>
            <div class="price">¥${product.price}</div>
            <div class="info">分类：${product.category}</div>
            <div class="info">发布者：${product.seller}</div>
            <div class="info">发布时间：${product.createTime}</div>
            <button class="action-btn secondary" onclick="toggleFavorite(${product.id})">取消收藏</button>
        `;
        favoritesList.appendChild(productItem);
    });
}

// 收货地址相关功能
function loadAddress() {
    const addressList = document.getElementById('address-list');

    if (!globalData.userInfo) {
        addressList.innerHTML = '<p>请先登录</p>';
        return;
    }

    const userId = globalData.userInfo.id;
    const userAddresses = globalData.addresses[userId] || [];

    addressList.innerHTML = '';
    if (userAddresses.length === 0) {
        addressList.innerHTML = '<p>暂无收货地址</p>';
        return;
    }

    userAddresses.forEach(address => {
        const addressItem = document.createElement('div');
        addressItem.className = 'address-item';
        addressItem.innerHTML = `
            <div class="address-info">收货人：${address.name}</div>
            <div class="address-info">手机号：${address.phone}</div>
            <div class="address-info">地址：${address.detail}</div>
            <div class="address-info">邮编：${address.zip}</div>
            ${address.isDefault ? '<div class="address-default">默认</div>' : ''}
        `;
        addressList.appendChild(addressItem);
    });
}

function showAddAddressForm() {
    document.getElementById('add-address-form').style.display = 'block';
}

function hideAddAddressForm() {
    document.getElementById('add-address-form').style.display = 'none';
    // 清空表单
    document.getElementById('address-name').value = '';
    document.getElementById('address-phone').value = '';
    document.getElementById('address-detail').value = '';
    document.getElementById('address-zip').value = '';
    document.getElementById('address-default').checked = false;
}

function saveAddress() {
    const name = document.getElementById('address-name').value;
    const phone = document.getElementById('address-phone').value;
    const detail = document.getElementById('address-detail').value;
    const zip = document.getElementById('address-zip').value;
    const isDefault = document.getElementById('address-default').checked;

    if (!name || !phone || !detail) {
        alert('请填写必填字段');
        return;
    }

    const userId = globalData.userInfo.id;
    globalData.addresses[userId] = globalData.addresses[userId] || [];

    // 如果设为默认地址，将其他地址设为非默认
    if (isDefault) {
        globalData.addresses[userId].forEach(addr => {
            addr.isDefault = false;
        });
    }

    const newAddress = {
        id: Date.now(),
        name,
        phone,
        detail,
        zip,
        isDefault
    };

    globalData.addresses[userId].push(newAddress);
    saveData('addresses');
    alert('地址保存成功');
    hideAddAddressForm();
    loadAddress();
}

// 商品审核相关功能
function loadAudit() {
    const auditList = document.getElementById('audit-list');

    const pendingProducts = globalData.products.filter(p => p.status === 'pending');

    auditList.innerHTML = '';
    if (pendingProducts.length === 0) {
        auditList.innerHTML = '<p>暂无待审核商品</p>';
        return;
    }

    pendingProducts.forEach(product => {
        const auditItem = document.createElement('div');
        auditItem.className = 'audit-item';
        auditItem.innerHTML = `
            <h3>${product.title}</h3>
            <div class="info">价格：¥${product.price}</div>
            <div class="info">分类：${product.category}</div>
            <div class="info">发布者：${product.seller}</div>
            <div class="info">联系电话：${product.phone}</div>
            <div class="info">发布时间：${product.createTime}</div>
            <div class="description">
                <strong>商品描述：</strong><br>
                ${product.description}
            </div>
            <div class="audit-actions">
                <button class="action-btn primary" onclick="approveProduct(${product.id})">通过</button>
                <button class="action-btn secondary" onclick="rejectProduct(${product.id})">拒绝</button>
            </div>
        `;
        auditList.appendChild(auditItem);
    });
}

function approveProduct(productId) {
    const product = globalData.products.find(p => p.id === productId);
    if (product) {
        product.status = 'approved';
        saveData('products');
        alert('商品审核通过');
        loadAudit();
    }
}

function rejectProduct(productId) {
    const reason = prompt('请输入拒绝原因：');
    if (reason) {
        const product = globalData.products.find(p => p.id === productId);
        if (product) {
            product.status = 'rejected';
            product.rejectReason = reason;
            saveData('products');
            alert('商品已拒绝');
            loadAudit();
        }
    }
}

// 用户管理相关功能 - 从后端数据库获取
async function loadUsers() {
    const userList = document.getElementById('user-list');

    try {
        const response = await fetch(`${API_URL}/users`);
        const result = await response.json();

        if (result.success) {
            const users = result.data;

            userList.innerHTML = '';
            if (users.length === 0) {
                userList.innerHTML = '<p>暂无用户</p>';
                return;
            }

            users.forEach(user => {
                const userItem = document.createElement('div');
                userItem.className = 'user-item';
                userItem.innerHTML = `
                    <div class="user-info">
                        <h3>${user.email.split('@')[0]}</h3>
                        <div class="user-details">邮箱：${user.email}</div>
                        <div class="user-details">ID：${user.id}</div>
                    </div>
                `;
                userList.appendChild(userItem);
            });
        } else {
            userList.innerHTML = `<p>加载用户失败: ${result.message}</p>`;
        }
    } catch (error) {
        userList.innerHTML = '<p>加载用户失败: 网络连接错误</p>';
        console.error('Load users error:', error);
    }
}

// 数据统计相关功能 - 用户数从后端数据库获取
async function loadStatistics() {
    const statisticsContainer = document.getElementById('statistics-container');

    let totalUsers = 0;
    try {
        const response = await fetch(`${API_URL}/users`);
        const result = await response.json();
        if (result.success) {
            totalUsers = result.data.length;
        }
    } catch (error) {
        console.error('Load user count error:', error);
    }

    const totalProducts = globalData.products.length;
    const approvedProducts = globalData.products.filter(p => p.status === 'approved').length;
    const pendingProducts = globalData.products.filter(p => p.status === 'pending').length;

    // 计算总销售额
    let totalSales = 0;
    Object.values(globalData.orders).forEach(userOrders => {
        userOrders.forEach(order => {
            totalSales += parseFloat(order.totalPrice || 0);
        });
    });

    statisticsContainer.innerHTML = `
        <div class="statistics-card">
            <h3>总用户数</h3>
            <div class="stat-value">${totalUsers}</div>
        </div>
        <div class="statistics-card">
            <h3>总商品数</h3>
            <div class="stat-value">${totalProducts}</div>
        </div>
        <div class="statistics-card">
            <h3>已通过商品</h3>
            <div class="stat-value">${approvedProducts}</div>
        </div>
        <div class="statistics-card">
            <h3>待审核商品</h3>
            <div class="stat-value">${pendingProducts}</div>
        </div>
        <div class="statistics-card">
            <h3>总销售额</h3>
            <div class="stat-value">¥${totalSales.toFixed(2)}</div>
        </div>
    `;
}

// 活动相关功能
function loadActivities() {
    const activityList = document.getElementById('activity-list');
    const addActivityBtn = document.getElementById('add-activity-btn');

    // 控制添加活动按钮只对管理员显示
    if (globalData.userInfo && globalData.userInfo.type === 'admin') {
        addActivityBtn.style.display = 'inline-block';
    } else {
        addActivityBtn.style.display = 'none';
    }

    activityList.innerHTML = '';

    if (globalData.activities.length === 0) {
        activityList.innerHTML = '<p>暂无活动</p>';
        return;
    }

    globalData.activities.forEach(activity => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        activityItem.innerHTML = `
            <h3>${activity.name}</h3>
            <div class="activity-date">${activity.date}</div>
            <div class="activity-info">📍 ${activity.location}</div>
            <div class="activity-info">${activity.description}</div>
        `;
        activityList.appendChild(activityItem);
    });
}

function showAddActivityModal() {
    document.getElementById('add-activity-modal').style.display = 'flex';
}

function hideAddActivityModal() {
    document.getElementById('add-activity-modal').style.display = 'none';
    // 清空表单
    document.getElementById('activity-name').value = '';
    document.getElementById('activity-date').value = '';
    document.getElementById('activity-location').value = '';
    document.getElementById('activity-description').value = '';
}

function saveActivity() {
    const name = document.getElementById('activity-name').value;
    const date = document.getElementById('activity-date').value;
    const location = document.getElementById('activity-location').value;
    const description = document.getElementById('activity-description').value;

    if (!name || !date || !location || !description) {
        alert('请填写所有字段');
        return;
    }

    const newActivity = {
        id: Date.now(),
        name,
        date,
        location,
        description
    };

    globalData.activities.push(newActivity);
    saveData('activities');
    alert('活动添加成功');
    hideAddActivityModal();
    loadActivities();
}

function onSearch() {
    const keyword = document.getElementById('search-input').value.toLowerCase();

    // 搜索活动
    const activityList = document.getElementById('activity-list');
    activityList.innerHTML = '';

    const filteredActivities = globalData.activities.filter(activity =>
        activity.name.toLowerCase().includes(keyword) ||
        activity.location.toLowerCase().includes(keyword) ||
        activity.description.toLowerCase().includes(keyword)
    );

    if (filteredActivities.length === 0) {
        activityList.innerHTML = '<p>未找到匹配的活动</p>';
    } else {
        filteredActivities.forEach(activity => {
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';
            activityItem.innerHTML = `
                <h3>${activity.name}</h3>
                <div class="activity-date">${activity.date}</div>
                <div class="activity-info">📍 ${activity.location}</div>
                <div class="activity-info">${activity.description}</div>
            `;
            activityList.appendChild(activityItem);
        });
    }

    // 搜索商品
    filterProducts(keyword);
}

// 连接后端Servlet的用户查询功能
async function queryUser() {
    const idParam = document.getElementById('query-user-id').value;
    const resultDiv = document.getElementById('query-result');

    if (!idParam) {
        resultDiv.innerHTML = '<p class="error">请输入用户ID</p>';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/users?id=${idParam}`);
        const result = await response.json();

        if (result.success) {
            const jsonUser = JSON.stringify(result.data, null, 2);
            resultDiv.innerHTML = `
                <div class="json-result">
                    <h4>查询结果（JSON格式）：</h4>
                    <pre>${jsonUser}</pre>
                </div>
            `;
        } else {
            const errorResult = JSON.stringify({ message: result.message });
            resultDiv.innerHTML = `
                <div class="json-result error">
                    <h4>查询结果（JSON格式）：</h4>
                    <pre>${errorResult}</pre>
                </div>
            `;
        }
    } catch (error) {
        resultDiv.innerHTML = `
            <div class="json-result error">
                <h4>查询失败：</h4>
                <pre>${JSON.stringify({ message: '网络连接失败', error: error.message })}</pre>
            </div>
        `;
        console.error('Query error:', error);
    }
}

async function queryAllUsers() {
    const resultDiv = document.getElementById('query-result');

    try {
        const response = await fetch(`${API_URL}/users`);
        const result = await response.json();

        if (result.success) {
            const jsonUsers = JSON.stringify(result.data, null, 2);
            resultDiv.innerHTML = `
                <div class="json-result">
                    <h4>所有用户（JSON数组格式）：</h4>
                    <pre>${jsonUsers}</pre>
                </div>
            `;
        } else {
            resultDiv.innerHTML = `
                <div class="json-result error">
                    <h4>查询失败：</h4>
                    <pre>${JSON.stringify({ message: result.message })}</pre>
                </div>
            `;
        }
    } catch (error) {
        resultDiv.innerHTML = `
            <div class="json-result error">
                <h4>查询失败：</h4>
                <pre>${JSON.stringify({ message: '网络连接失败', error: error.message })}</pre>
            </div>
        `;
        console.error('Query all error:', error);
    }
}

// 初始化应用
window.onload = init;