document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');
    const alertPlaceholderLogin = document.getElementById('alert-placeholder');
    const wrapper = document.getElementById('wrapper');
    const tablesArea = document.getElementById('tables-area');
    const alertPlaceholderDashboard = document.getElementById('dashboard-alert-placeholder');
    const kitchenOrdersDisplay = document.getElementById('kitchen-orders-display');
    const alertPlaceholderKitchen = document.getElementById('kitchen-alert-placeholder');
    const productCategoryFilters = document.getElementById('product-category-filters');
    const profileForm = document.getElementById('profileForm');

    function showAlert(message, type = 'info', placeholder) {
        const targetPlaceholder = placeholder || alertPlaceholderLogin || alertPlaceholderDashboard || alertPlaceholderKitchen || document.getElementById('profile-alert-placeholder');
        if (!targetPlaceholder) { return; }
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show m-0`;
        alertDiv.setAttribute('role', 'alert');
        alertDiv.innerHTML = `<div>${message}</div> <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>`;
        targetPlaceholder.innerHTML = '';
        targetPlaceholder.appendChild(alertDiv);
    }

    const formatCurrency = (value) => {
        if (typeof value !== 'number' || isNaN(value)) { value = 0; }
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');

        function handleLoginSubmit(event) {
            event.preventDefault();
            const username = usernameInput.value.trim();
            const password = passwordInput.value;
            if (alertPlaceholderLogin) alertPlaceholderLogin.innerHTML = '';
            if (!username || !password) { showAlert('Preencha usuário e senha.', 'warning', alertPlaceholderLogin); return; }
            const validUsers = { 'admin': { password: '123', data: { name: 'Administrador', role: 'Admin' } }, 'garcom': { password: '123', data: { name: 'Garçom Teste', role: 'Garçom' } } };
            let user = null;
            if (validUsers.hasOwnProperty(username) && validUsers[username].password === password) { user = validUsers[username].data; }
            if (user) {
                showAlert('Login OK! Redirecionando...', 'success', alertPlaceholderLogin);
                try {
                    localStorage.setItem('loggedInUser', JSON.stringify(user));
                    setTimeout(() => { window.location.href = 'dashboard.html'; }, 500);
                } catch (e) { showAlert('Erro ao salvar sessão.', 'danger', alertPlaceholderLogin); }
            } else { showAlert('Usuário ou senha inválidos.', 'danger', alertPlaceholderLogin); }
        }
    }

    if (wrapper && tablesArea) {
        const orderDetails = document.getElementById('order-details');
        const selectedTableTitle = document.getElementById('selected-table-title');
        const orderItemsList = document.getElementById('order-items');
        const orderTotalSpan = document.getElementById('order-total');
        const productListBody = document.getElementById('product-list-body');
        const productCategoryName = document.getElementById('product-category-name');
        const navbarUserName = document.getElementById('navbar-user-name');
        const navbarProfileImage = document.getElementById('navbar-profile-image');
        const logoutButton = document.getElementById('logout-button');
        const closeAccountBtn = document.getElementById('close-account-btn');
        const reopenTableBtn = document.getElementById('reopen-table-btn');
        const finalizeTableBtn = document.getElementById('finalize-table-btn');
        const addProductCard = document.getElementById('add-product-card');
        const adminKitchenLink = document.getElementById('admin-kitchen-link');

        const TOTAL_TABLES = 15;
        let tablesData = {};
        let selectedTableId = null;
        const allProducts = [ { id: 1, name: 'Coca-Cola Lata', price: 5.00, category: 'bebidas' }, { id: 2, name: 'Suco Laranja 300ml', price: 7.00, category: 'bebidas' }, { id: 3, name: 'Água Mineral c/ Gás', price: 4.00, category: 'bebidas' }, { id: 4, name: 'Cerveja Long Neck', price: 8.00, category: 'bebidas' }, { id: 10, name: 'PF Frango Grelhado', price: 25.00, category: 'pratos' }, { id: 11, name: 'Parmegiana de Carne', price: 35.00, category: 'pratos' }, { id: 12, name: 'Salada Caesar', price: 22.00, category: 'pratos' }, { id: 20, name: 'X-Burger Simples', price: 15.00, category: 'lanches' }, { id: 21, name: 'X-Salada Completo', price: 18.50, category: 'lanches' }, { id: 22, name: 'Misto Quente', price: 10.00, category: 'lanches' }, { id: 30, name: 'Batata Frita Média', price: 20.00, category: 'porcoes' }, { id: 31, name: 'Calabresa Acebolada', price: 28.00, category: 'porcoes' }, { id: 32, name: 'Frango a Passarinho', price: 32.00, category: 'porcoes' }, ];
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

        if (!loggedInUser) {
            window.location.href = 'index.html';
        } else {
            initializeDashboard();
        }

        function initializeDashboard() {
            if (navbarUserName) navbarUserName.textContent = loggedInUser.name.split(' ')[0];
            if (navbarProfileImage) {
                const savedImage = localStorage.getItem('userProfileImage_dataUrl');
                navbarProfileImage.src = savedImage || 'assets/profile.png';
            }

            loadTablesData();
            renderTableButtons();
            renderProductList();
            setupEventListeners();
            updateActionButtonsVisibility();
            setupAdminView();
            renderCategoryFilters();
        }

        function setupAdminView() {
             if (loggedInUser && loggedInUser.role === 'Admin') {
                 if(addProductCard) addProductCard.style.display = 'none';
                 if(productCategoryFilters) productCategoryFilters.style.display = 'none';
                 if(adminKitchenLink) adminKitchenLink.classList.remove('d-none');
                 else if(adminKitchenLink) adminKitchenLink.style.display = 'list-item'; // Fallback if d-none is not used
             } else {
                 if(adminKitchenLink) adminKitchenLink.style.display = 'none';
             }
         }

        function renderCategoryFilters() {
            if (!productCategoryFilters || (loggedInUser && loggedInUser.role === 'Admin')) return;

            productCategoryFilters.innerHTML = '';
            const categories = [
                { key: '', title: 'Todos Produtos', icon: 'bi-grid-fill' },
                { key: 'bebidas', title: 'Bebidas', icon: 'bi-cup-straw' },
                { key: 'pratos', title: 'Pratos', icon: 'bi-egg-fried' },
                { key: 'lanches', title: 'Lanches', icon: 'bi-badge-sd-fill' },
                { key: 'porcoes', title: 'Porções', icon: 'bi-basket-fill' }
            ];

            categories.forEach(cat => {
                const button = document.createElement('button');
                button.className = `btn btn-filter btn-sm ${cat.key === '' ? 'active' : ''}`;
                button.dataset.category = cat.key;
                button.title = cat.title;
                button.innerHTML = `<i class="bi ${cat.icon}"></i>`;
                button.addEventListener('click', handleCategoryFilterClick);
                productCategoryFilters.appendChild(button);
            });
        }

        function handleCategoryFilterClick(e) {
            const button = e.currentTarget;
            if (!button || (loggedInUser && loggedInUser.role === 'Admin')) return;

            const allButtons = productCategoryFilters.querySelectorAll('.btn-filter');
            allButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            renderProductList(button.dataset.category);
        }

        function setupEventListeners() {
             if (logoutButton) logoutButton.addEventListener('click', handleLogout);
             if (closeAccountBtn) closeAccountBtn.addEventListener('click', handleCloseAccount);
             if (reopenTableBtn) reopenTableBtn.addEventListener('click', handleReopenTable);
             if (finalizeTableBtn) finalizeTableBtn.addEventListener('click', handleFinalizeTable);
         }

        function handleLogout(e) {
            e.preventDefault();
            localStorage.removeItem('loggedInUser');
            localStorage.removeItem('userProfileImage_dataUrl');
            localStorage.removeItem('restaurantTablesData');
            window.location.href = 'index.html';
        }

        function loadTablesData() {
            const savedData = localStorage.getItem('restaurantTablesData');
            tablesData = {};
            if (savedData) { try { const parsedData = JSON.parse(savedData); if (typeof parsedData === 'object' && parsedData !== null) tablesData = parsedData; } catch (error) {} }
            for (let i = 1; i <= TOTAL_TABLES; i++) { if (!tablesData[i] || typeof tablesData[i] !== 'object') { tablesData[i] = { items: [], total: 0.0, status: 'Livre' }; } else { if (!Array.isArray(tablesData[i].items)) tablesData[i].items = []; if (!tablesData[i].status) tablesData[i].status = tablesData[i].items.length > 0 ? 'Ocupada' : 'Livre'; tablesData[i].total = tablesData[i].items.reduce((sum, item) => sum + (item.price || 0), 0); } }
        }

        function saveTablesData() {
            try { localStorage.setItem('restaurantTablesData', JSON.stringify(tablesData)); }
            catch (error) { showAlert('Erro ao salvar dados.', 'danger', alertPlaceholderDashboard); }
        }

        function renderTableButtons() {
            tablesArea.innerHTML = '';
            if (Object.keys(tablesData).length === 0) { tablesArea.innerHTML = '<p class="text-muted p-3">Erro ao carregar mesas</p>'; return; }
            const sortedTableIds = Object.keys(tablesData).map(id => parseInt(id)).sort((a, b) => a - b);

            sortedTableIds.forEach(i => {
                 if (!tablesData[i]) return;
                 const table = tablesData[i];
                 const button = document.createElement('button');
                 button.className = `btn table-button shadow-sm status-${(table.status || 'livre').toLowerCase()}`;
                 if (i.toString() === selectedTableId) button.classList.add('selected');
                 button.dataset.tableId = i;
                 button.innerHTML = `Mesa ${i}<span class="table-status">${table.status || '?'}</span>`;
                 button.addEventListener('click', handleTableClick);
                 tablesArea.appendChild(button);
            });
            if (tablesArea.children.length === 0) tablesArea.innerHTML = '<p class="text-muted p-3">Nenhuma mesa configurada.</p>';
        }

        function handleTableClick(event) {
            const button = event.currentTarget;
            const tableId = button.dataset.tableId;
            document.querySelectorAll('.table-button.selected').forEach(btn => btn.classList.remove('selected'));
            button.classList.add('selected');
            selectedTableId = tableId;
            displayTableOrder(tableId);
            updateActionButtonsVisibility(tableId);
        }

        function displayTableOrder(tableId) {
            if (!tableId || !tablesData[tableId]) {
                selectedTableTitle.textContent = 'Selecione Mesa';
                orderItemsList.innerHTML = '<li class="list-group-item text-muted text-center p-3">...</li>';
                orderTotalSpan.textContent = formatCurrency(0);
                updateActionButtonsVisibility(null);
                return;
            }
            const table = tablesData[tableId];
            selectedTableTitle.textContent = `Mesa ${tableId}`;
            orderItemsList.innerHTML = '';
            if (table.items.length === 0) {
                orderItemsList.innerHTML = `<li class="list-group-item text-muted text-center p-3">Mesa ${table.status}...</li>`;
            } else {
                table.items.forEach((item, index) => {
                    const li = document.createElement('li');
                    li.classList.add('list-group-item');
                    const isClosing = table.status === 'Fechamento';
                    li.innerHTML = `<span class="item-name">${item.name || '?'}</span> <span class="item-price">${formatCurrency(item.price || 0)}</span> <button class="btn btn-sm btn-outline-danger remove-item-btn ${isClosing ? 'disabled' : ''}" data-item-index="${index}" title="Remover" ${isClosing ? 'disabled' : ''}><i class="bi bi-trash3"></i></button>`;
                    if (!isClosing) {
                        li.querySelector('.remove-item-btn').addEventListener('click', handleRemoveItem);
                    }
                    orderItemsList.appendChild(li);
                });
            }
            orderTotalSpan.textContent = formatCurrency(table.total || 0);
        }

        function renderProductList(category = null) {
             if (loggedInUser && loggedInUser.role === 'Admin') { productListBody.innerHTML = ''; return; };
             const categoryFilter = category === "" ? null : category;
             const filteredProducts = categoryFilter ? allProducts.filter(p => p.category === categoryFilter) : allProducts;
             renderProductTable(filteredProducts);
             if(productCategoryName) productCategoryName.textContent = categoryFilter ? categoryFilter.charAt(0).toUpperCase() + categoryFilter.slice(1) : 'Todos';
        }

        function renderProductTable(products) {
            productListBody.innerHTML = '';
            if (products.length === 0) {
                const catName = productCategoryName ? productCategoryName.textContent : 'selecionada';
                productListBody.innerHTML = `<tr><td colspan="3" class="text-muted text-center p-3 fst-italic">Nenhum produto encontrado (${catName}).</td></tr>`;
            } else {
                products.forEach(product => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `<td>${product.name}</td> <td class="text-end">${formatCurrency(product.price)}</td> <td class="text-center"><button class="btn btn-sm btn-success add-item-btn" data-product-id="${product.id}" data-product-name="${product.name}" data-product-price="${product.price}" title="Adicionar"><i class="bi bi-plus-lg"></i></button></td>`;
                    tr.querySelector('.add-item-btn').addEventListener('click', handleAddItem);
                    productListBody.appendChild(tr);
                });
            }
        }

        function handleAddItem(event) {
            if (!selectedTableId) { showAlert('Selecione uma mesa primeiro.', 'warning', alertPlaceholderDashboard); return; }
            const table = tablesData[selectedTableId];
            if (!table) { showAlert('Erro: Mesa não encontrada.', 'danger', alertPlaceholderDashboard); return; }
            if (table.status === 'Fechamento') { showAlert(`Não é possível adicionar itens. Mesa ${selectedTableId} está em fechamento.`, 'warning', alertPlaceholderDashboard); return; }
            const button = event.currentTarget;
            const productId = button.dataset.productId;
            const productName = button.dataset.productName;
            const productPrice = parseFloat(button.dataset.productPrice);
            if (isNaN(productPrice)) { showAlert('Erro: Preço inválido para o produto.', 'danger', alertPlaceholderDashboard); return; }
            table.items.push({ id: productId, name: productName, price: productPrice });
            table.total = (table.total || 0) + productPrice;
            table.status = 'Ocupada';
            updateTableButtonStatus(selectedTableId);
            displayTableOrder(selectedTableId);
            updateActionButtonsVisibility(selectedTableId);
            saveTablesData();
        }

        function handleRemoveItem(event) {
            if (!selectedTableId || !tablesData[selectedTableId]) return;
            const button = event.currentTarget;
            const itemIndex = parseInt(button.dataset.itemIndex);
            const table = tablesData[selectedTableId];
            if (table.status === 'Fechamento') return;
            if (!isNaN(itemIndex) && itemIndex >= 0 && itemIndex < table.items.length) {
                table.items.splice(itemIndex, 1);
                table.total = table.items.reduce((sum, item) => sum + (item.price || 0), 0);
                if (table.items.length === 0) {
                    table.status = 'Livre';
                    table.total = 0;
                }
                updateTableButtonStatus(selectedTableId);
                displayTableOrder(selectedTableId);
                updateActionButtonsVisibility(selectedTableId);
                saveTablesData();
            }
        }

        function updateTableButtonStatus(tableId) {
            const button = tablesArea.querySelector(`.table-button[data-table-id="${tableId}"]`);
            if (!button || !tablesData[tableId]) return;
            const table = tablesData[tableId];
            const statusClass = `status-${(table.status || 'livre').toLowerCase()}`;
            const statusSpan = button.querySelector('.table-status');
            if (statusSpan) statusSpan.textContent = table.status || '?';
            button.classList.remove('status-livre', 'status-ocupada', 'status-fechamento');
            button.classList.add(statusClass);
        }

        function updateActionButtonsVisibility(tableId = selectedTableId) {
            const table = tableId ? tablesData[tableId] : null;
            if (!closeAccountBtn || !reopenTableBtn || !finalizeTableBtn) return;
            closeAccountBtn.classList.add('d-none');
            reopenTableBtn.classList.add('d-none');
            finalizeTableBtn.classList.add('d-none');
            if (table) {
                if (table.status === 'Ocupada' && table.items.length > 0) { closeAccountBtn.classList.remove('d-none'); }
                else if (table.status === 'Fechamento') { reopenTableBtn.classList.remove('d-none'); finalizeTableBtn.classList.remove('d-none'); }
            }
        }

        function handleCloseAccount() {
            if (!selectedTableId || !tablesData[selectedTableId]) return;
            const table = tablesData[selectedTableId];
            if (table.status === 'Ocupada' && table.items.length > 0) {
                table.status = 'Fechamento';
                updateTableButtonStatus(selectedTableId);
                displayTableOrder(selectedTableId);
                updateActionButtonsVisibility(selectedTableId);
                saveTablesData();
                showAlert(`Mesa ${selectedTableId} marcada para fechamento.`, 'info', alertPlaceholderDashboard);
            }
        }

        function handleReopenTable() {
            if (!selectedTableId || !tablesData[selectedTableId]) return;
            const table = tablesData[selectedTableId];
            if (table.status === 'Fechamento') {
                table.status = 'Ocupada';
                updateTableButtonStatus(selectedTableId);
                displayTableOrder(selectedTableId);
                updateActionButtonsVisibility(selectedTableId);
                saveTablesData();
                showAlert(`Mesa ${selectedTableId} foi reaberta.`, 'success', alertPlaceholderDashboard);
            }
        }

        function handleFinalizeTable() {
            if (!selectedTableId || !tablesData[selectedTableId]) return;
            const table = tablesData[selectedTableId];
            if (table.status === 'Fechamento') {
                generateReceipt(selectedTableId, table);
                table.items = [];
                table.total = 0.0;
                table.status = 'Livre';
                updateTableButtonStatus(selectedTableId);
                displayTableOrder(selectedTableId);
                updateActionButtonsVisibility(selectedTableId);
                saveTablesData();
                showAlert(`Mesa ${selectedTableId} finalizada com sucesso. Recibo gerado.`, 'success', alertPlaceholderDashboard);
            }
        }

        function generateReceipt(tableId, tableData) {
            const now = new Date(); const dateTimeString = now.toLocaleString('pt-BR');
            let receiptHTML = `<html><head><title>Recibo Mesa ${tableId}</title><style>body{font-family:monospace;margin:15px;font-size:10pt;}h2,p.center{text-align:center;margin:3px 0;}hr{border:none;border-top:1px dashed #000;margin:10px 0;}table{width:100%;border-collapse:collapse;margin-top:5px;}td{padding:2px 0;}td:last-child{text-align:right;}.total{font-weight:bold;margin-top:10px;text-align:right;}@media print{button{display:none;}}</style></head><body><h2>Bar Code</h2><p class="center">Rua Fictícia, 123</p><p class="center">CNPJ: 99.999.999/0001-99</p><hr><h2>Mesa ${tableId}</h2><p class="center">Data/Hora: ${dateTimeString}</p><hr><table><thead><tr><th>Item</th><th>Valor</th></tr></thead><tbody>`;
            tableData.items.forEach(item => { receiptHTML += `<tr><td>${item.name || '?'}</td><td>${formatCurrency(item.price || 0)}</td></tr>`; });
            receiptHTML += `</tbody></table><hr><div class="total">TOTAL: ${formatCurrency(tableData.total || 0)}</div><hr><p class="center">Obrigado!</p><div style="text-align:center; margin-top:20px;"><button onclick="window.print()">Imprimir</button> <button onclick="window.close()">Fechar</button></div></body></html>`;
            const receiptWindow = window.open('', '_blank', 'width=300,height=500');
            if (receiptWindow) { receiptWindow.document.write(receiptHTML); receiptWindow.document.close(); }
            else { showAlert('Não foi possível abrir a janela do recibo. Verifique se pop-ups estão bloqueados.', 'warning', alertPlaceholderDashboard); }
        }
    }

    if (kitchenOrdersDisplay) {
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
        if (!loggedInUser || loggedInUser.role !== 'Admin') {
             showAlert("Acesso não autorizado à Cozinha.", "danger", alertPlaceholderKitchen);
             setTimeout(() => { window.location.href = 'index.html'; }, 1500);
        }
        else { loadAndRenderKitchenOrders(); }

        function loadAndRenderKitchenOrders() {
            const kitchenData = JSON.parse(localStorage.getItem('restaurantTablesData') || '{}');
            kitchenOrdersDisplay.innerHTML = '';
            let activeOrdersFound = false;
            const sortedTableIds = Object.keys(kitchenData).map(id => parseInt(id)).sort((a, b) => a - b);
            sortedTableIds.forEach(tableId => {
                const table = kitchenData[tableId];
                if (table && (table.status === 'Ocupada' || table.status === 'Fechamento') && table.items && table.items.length > 0) {
                    activeOrdersFound = true;
                    const card = document.createElement('div');
                    card.className = 'col-md-6 col-lg-4';
                    let itemsHtml = '<ul class="list-unstyled kitchen-item-list">';
                    table.items.forEach(item => {
                        itemsHtml += `<li><i class="bi bi-dot"></i> ${item.name || '?'}</li>`;
                    });
                    itemsHtml += '</ul>';
                    card.innerHTML = `
                        <div class="card kitchen-order-card shadow-sm mb-3">
                            <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                                <h5 class="mb-0">Mesa ${tableId}</h5>
                                <span class="badge bg-${table.status === 'Fechamento' ? 'warning text-dark' : 'light text-dark'}">${table.status}</span>
                            </div>
                            <div class="card-body">
                                ${itemsHtml}
                            </div>
                        </div>`;
                    kitchenOrdersDisplay.appendChild(card);
                }
            });
            if (!activeOrdersFound) {
                kitchenOrdersDisplay.innerHTML = '<div class="col-12"><div class="alert alert-info text-center">Nenhum pedido ativo encontrado nas mesas.</div></div>';
            }
        }
    }

    if (profileForm) {
        const nameInput = document.getElementById('profileName');
        const roleInput = document.getElementById('profileRole');
        const passwordInput = document.getElementById('profilePassword');
        const confirmPasswordInput = document.getElementById('profileConfirmPassword');
        const imageInput = document.getElementById('profileImageInput');
        const currentImage = document.getElementById('current-profile-image');
        const alertPlaceholderProfile = document.getElementById('profile-alert-placeholder');
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

        if (loggedInUser) {
            if(nameInput) nameInput.value = loggedInUser.name || '';
            if(roleInput) roleInput.value = loggedInUser.role || '';
            const savedImage = localStorage.getItem('userProfileImage_dataUrl');
            if (savedImage && currentImage) { currentImage.src = savedImage; }
            else if (currentImage) { currentImage.src = 'assets/profile.png'; }
        } else {
             showAlert("Sessão de usuário não encontrada. Por favor, faça login novamente.", "warning", alertPlaceholderProfile);
             setTimeout(() => { window.location.href = 'index.html'; }, 2000);
        }

         if (imageInput && currentImage) {
             imageInput.addEventListener('change', function(event) {
                 const file = event.target.files[0];
                 if (file && file.type.startsWith('image/')) {
                     const reader = new FileReader();
                     reader.onload = function(e) { currentImage.src = e.target.result; };
                     reader.onerror = function(e) { showAlert("Erro ao tentar ler a imagem selecionada.", "danger", alertPlaceholderProfile); };
                     reader.readAsDataURL(file);
                 } else if (file) {
                     showAlert("Por favor, selecione um arquivo de imagem válido (PNG ou JPG).", "warning", alertPlaceholderProfile);
                     imageInput.value = '';
                 }
             });
         }

        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if(alertPlaceholderProfile) alertPlaceholderProfile.innerHTML = '';
            const newName = nameInput.value.trim();
            const newPassword = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;
            const newImageFile = imageInput.files[0];
            const imageDataUrl = currentImage.src;

            if (!newName) { showAlert("O campo Nome Completo não pode estar em branco.", "warning", alertPlaceholderProfile); return; }
            if (newPassword && newPassword !== confirmPassword) { showAlert("As senhas digitadas não coincidem.", "warning", alertPlaceholderProfile); return; }
            if (newPassword && newPassword.length < 3) { showAlert("A nova senha deve ter pelo menos 3 caracteres.", "warning", alertPlaceholderProfile); return; }

            try {
                loggedInUser.name = newName;
                if (newPassword) { loggedInUser.password = newPassword; }

                if (newImageFile && imageDataUrl && imageDataUrl.startsWith('data:image')) {
                    localStorage.setItem('userProfileImage_dataUrl', imageDataUrl);
                } else if (!newImageFile && currentImage.src.includes('assets/profile.png')) {
                     localStorage.removeItem('userProfileImage_dataUrl');
                }

                localStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));
                showAlert("Perfil atualizado com sucesso!", "success", alertPlaceholderProfile);
                passwordInput.value = '';
                confirmPasswordInput.value = '';
                imageInput.value = '';

                setTimeout(() => {
                     const navBarImage = document.getElementById('navbar-profile-image');
                     if(navBarImage) navBarImage.src = imageDataUrl.startsWith('data:image') ? imageDataUrl : 'assets/profile.png';
                     const navBarName = document.getElementById('navbar-user-name');
                     if(navBarName) navBarName.textContent = newName.split(' ')[0];
                 }, 100);

            } catch (error) {
                showAlert("Ocorreu um erro ao salvar as alterações do perfil.", "danger", alertPlaceholderProfile);
            }
        });
    }

});