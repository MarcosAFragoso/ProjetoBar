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
    const peopleCountSetterDiv = document.getElementById('people-count-setter');

    // --- Utility Functions ---
    function showAlert(message, type = 'info', placeholder) {
        const targetPlaceholder = placeholder || alertPlaceholderLogin || alertPlaceholderDashboard || alertPlaceholderKitchen || document.getElementById('profile-alert-placeholder');
        if (!targetPlaceholder) { console.error("Alert placeholder not found for:", placeholder); return; }
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

    // --- Login Page Logic ---
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');

        function handleLoginSubmit(event) {
            event.preventDefault();
            const username = usernameInput.value.trim(); // 'admin' or 'garcom'
            const password = passwordInput.value;
            if (alertPlaceholderLogin) alertPlaceholderLogin.innerHTML = '';
            if (!username || !password) { showAlert('Preencha usuário e senha.', 'warning', alertPlaceholderLogin); return; }

            // WARNING: Hardcoded credentials - use a secure backend in production!
            const validUsers = {
                'admin': { password: '123', data: { name: 'Administrador', role: 'Admin' } },
                'garcom': { password: '123', data: { name: 'Garçom Teste', role: 'Garçom' } }
            };

            let user = null;
            if (validUsers.hasOwnProperty(username) && validUsers[username].password === password) {
                user = validUsers[username].data;
            }

            if (user) {
                showAlert('Login OK! Redirecionando...', 'success', alertPlaceholderLogin);
                try {
                    localStorage.setItem('loggedInUser', JSON.stringify(user)); // Store user details (name, role)
                    localStorage.setItem('loggedInUsername', username); // Store the actual username key ('admin'/'garcom')
                    setTimeout(() => { window.location.href = 'dashboard.html'; }, 500);
                } catch (e) {
                    showAlert('Erro ao salvar sessão local. Verifique as permissões do navegador.', 'danger', alertPlaceholderLogin);
                    console.error("LocalStorage error:", e);
                }
            } else {
                showAlert('Usuário ou senha inválidos.', 'danger', alertPlaceholderLogin);
            }
        }
    }

    // --- Dashboard Page Logic ---
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

        const TOTAL_TABLES = 15;
        let tablesData = {};
        let selectedTableId = null;
        const allProducts = [ { id: 1, name: 'Coca-Cola Lata', price: 5.00, category: 'bebidas' }, { id: 2, name: 'Suco Laranja 300ml', price: 7.00, category: 'bebidas' }, { id: 3, name: 'Água Mineral c/ Gás', price: 4.00, category: 'bebidas' }, { id: 4, name: 'Cerveja Long Neck', price: 8.00, category: 'bebidas' }, { id: 10, name: 'PF Frango Grelhado', price: 25.00, category: 'pratos' }, { id: 11, name: 'Parmegiana de Carne', price: 35.00, category: 'pratos' }, { id: 12, name: 'Salada Caesar', price: 22.00, category: 'pratos' }, { id: 20, name: 'X-Burger Simples', price: 15.00, category: 'lanches' }, { id: 21, name: 'X-Salada Completo', price: 18.50, category: 'lanches' }, { id: 22, name: 'Misto Quente', price: 10.00, category: 'lanches' }, { id: 30, name: 'Batata Frita Média', price: 20.00, category: 'porcoes' }, { id: 31, name: 'Calabresa Acebolada', price: 28.00, category: 'porcoes' }, { id: 32, name: 'Frango a Passarinho', price: 32.00, category: 'porcoes' }, ];
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
        const loggedInUsername = localStorage.getItem('loggedInUsername'); // 'admin' or 'garcom'

        if (!loggedInUser || !loggedInUsername) {
            window.location.href = 'index.html';
        } else {
            initializeDashboard();
        }

        function initializeDashboard() {
            if (navbarUserName) navbarUserName.textContent = loggedInUser.name.split(' ')[0];

            // Load profile image specific to the logged-in username
            if (navbarProfileImage && loggedInUsername) {
                const savedImage = localStorage.getItem(`userProfileImage_${loggedInUsername}_dataUrl`);
                navbarProfileImage.src = savedImage || 'assets/profile.png';
            }

            loadTablesData();
            renderTableButtons();
            setupAdminView(); // Setup admin view before rendering product list/filters
            renderCategoryFilters();
            if (loggedInUser.role !== 'Admin') {
                 // Render first category by default for non-admins
                 const firstCategoryButton = productCategoryFilters?.querySelector('.btn-filter');
                 if(firstCategoryButton) {
                    renderProductList(firstCategoryButton.dataset.category);
                 } else {
                    renderProductList(); // Fallback if no categories rendered
                 }
            } else {
                renderProductList(); // Admins see empty list initially
            }
            setupEventListeners();
            updateActionButtonsVisibility(); // Initial state
            displayTableOrder(null); // Start with no table selected
        }

        function setupAdminView() {
             if (loggedInUser && loggedInUser.role === 'Admin') {
                 // Hide Garcom-specific elements
                 if(addProductCard) addProductCard.style.display = 'none';
                 if(productCategoryFilters) productCategoryFilters.style.display = 'none';
                 if(peopleCountSetterDiv) peopleCountSetterDiv.style.display = 'none';
             }
             // No explicit action needed for Garcom view, elements are visible by default
         }

        function renderCategoryFilters() {
            if (!productCategoryFilters || (loggedInUser && loggedInUser.role === 'Admin')) return;

            productCategoryFilters.innerHTML = '';
            const categories = [
                // "Todos" removed as requested
                { key: 'bebidas', title: 'Bebidas', icon: 'bi-cup-straw' },
                { key: 'pratos', title: 'Pratos', icon: 'bi-egg-fried' },
                { key: 'lanches', title: 'Lanches', icon: 'bi-badge-sd-fill' },
                { key: 'porcoes', title: 'Porções', icon: 'bi-basket-fill' }
            ];

            if (categories.length > 0) {
                categories.forEach((cat, index) => {
                    const button = document.createElement('button');
                    // Make the first actual category active by default
                    button.className = `btn btn-filter btn-sm ${index === 0 ? 'active' : ''}`;
                    button.dataset.category = cat.key;
                    button.title = cat.title;
                    button.innerHTML = `<i class="bi ${cat.icon}"></i>`;
                    button.addEventListener('click', handleCategoryFilterClick);
                    productCategoryFilters.appendChild(button);
                });
            } else {
                 productCategoryFilters.innerHTML = '<p class="text-muted small">Nenhuma categoria de produto definida.</p>';
            }
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
             // Event listener for people count input will be added dynamically in renderPeopleCountSetter
         }

        function handleLogout(e) {
            e.preventDefault();
            localStorage.removeItem('loggedInUser');
            localStorage.removeItem('loggedInUsername');
            // Keep table data and profile pics unless explicitly required to clear
            // localStorage.removeItem('restaurantTablesData');
            // Potentially loop and remove all userProfileImage_* keys if needed
            window.location.href = 'index.html';
        }

        function loadTablesData() {
            const savedData = localStorage.getItem('restaurantTablesData');
            console.log("Loading tables data:", savedData); // Debug log
            tablesData = {};
            if (savedData) { try { const parsedData = JSON.parse(savedData); if (typeof parsedData === 'object' && parsedData !== null) tablesData = parsedData; } catch (error) { console.error("Error parsing saved table data:", error); } }
            for (let i = 1; i <= TOTAL_TABLES; i++) {
                if (!tablesData[i] || typeof tablesData[i] !== 'object') {
                    tablesData[i] = { items: [], total: 0.0, status: 'Livre', peopleCount: 0 }; // Added peopleCount
                } else {
                    if (!Array.isArray(tablesData[i].items)) tablesData[i].items = [];
                    if (!tablesData[i].status) tablesData[i].status = tablesData[i].items.length > 0 ? 'Ocupada' : 'Livre';
                    // Ensure peopleCount exists, default to 0 if missing
                    if (typeof tablesData[i].peopleCount !== 'number' || isNaN(tablesData[i].peopleCount)) {
                         tablesData[i].peopleCount = 0;
                    }
                    // Recalculate total just in case
                    tablesData[i].total = tablesData[i].items.reduce((sum, item) => sum + (item.price || 0), 0);
                }
            }
             // Optional: Save data immediately after loading/initializing to fix any inconsistencies
             // saveTablesData();
        }

        function saveTablesData() {
            try {
                console.log("Saving tables data:", tablesData); // Debug log
                localStorage.setItem('restaurantTablesData', JSON.stringify(tablesData));
            }
            catch (error) { showAlert('Erro ao salvar dados das mesas.', 'danger', alertPlaceholderDashboard); console.error("Error saving table data:", error); }
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

                 // Display structure: Mesa # / Status (People)
                 let peopleText = table.peopleCount > 0 ? ` (${table.peopleCount} P)` : '';
                 let statusText = table.status || '?';
                 button.innerHTML = `
                     <span class="table-button-main-text">Mesa ${i}</span>
                     <span class="table-button-sub-text">${statusText}${peopleText}</span>
                 `;

                 button.addEventListener('click', handleTableClick);
                 tablesArea.appendChild(button);
            });
            if (tablesArea.children.length === 0) tablesArea.innerHTML = '<p class="text-muted p-3">Nenhuma mesa configurada.</p>';
        }

        function handleTableClick(event) {
            const button = event.currentTarget;
            const tableId = button.dataset.tableId;
            const table = tablesData[tableId];

            // Admin navigation override
            if (loggedInUser.role === 'Admin' && (table.status === 'Ocupada' || table.status === 'Fechamento')) {
                 window.location.href = 'kitchen.html'; // Navigate admin to kitchen view
                 return; // Stop further processing for admin clicks on occupied tables
            }

            // Standard selection logic for Garcom, or Admin on Livre tables
            document.querySelectorAll('.table-button.selected').forEach(btn => btn.classList.remove('selected'));
            button.classList.add('selected');
            selectedTableId = tableId;
            displayTableOrder(tableId);
            updateActionButtonsVisibility(tableId);

            // Show/Hide people count setter (only for Garcom on Livre tables)
            if (loggedInUser.role === 'Garcom' && table.status === 'Livre' && peopleCountSetterDiv) {
                renderPeopleCountSetter(tableId, table.peopleCount);
                peopleCountSetterDiv.style.display = 'block';
            } else if (peopleCountSetterDiv) {
                peopleCountSetterDiv.style.display = 'none';
            }
        }

        function renderPeopleCountSetter(tableId, currentCount) {
            if (!peopleCountSetterDiv) return;
            peopleCountSetterDiv.innerHTML = `
                <label for="people-input-${tableId}" class="form-label small mb-0">Pessoas:</label>
                <input type="number" id="people-input-${tableId}" class="form-control form-control-sm d-inline-block" min="0" value="${currentCount || 0}">
            `;
            const input = peopleCountSetterDiv.querySelector(`#people-input-${tableId}`);
            if (input) {
                input.addEventListener('change', handlePeopleCountChange);
                input.addEventListener('input', handlePeopleCountChange); // Capture changes more frequently
            }
        }

        function handlePeopleCountChange(event) {
            const input = event.target;
            const newCount = parseInt(input.value, 10);
            if (selectedTableId && tablesData[selectedTableId] && !isNaN(newCount) && newCount >= 0) {
                tablesData[selectedTableId].peopleCount = newCount;
                // Update the button display immediately
                updateTableButtonStatus(selectedTableId);
                // Save the change
                saveTablesData();
            } else {
                 // Optional: Reset input to previous valid value if input is invalid
                 input.value = tablesData[selectedTableId]?.peopleCount || 0;
            }
        }


        function displayTableOrder(tableId) {
             // Hide people setter by default, handleTableClick will show it if needed
             if (peopleCountSetterDiv) peopleCountSetterDiv.style.display = 'none';

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
                    li.innerHTML = `<span class="item-name">${item.name || '?'}</span> <span class="item-price">${formatCurrency(item.price || 0)}</span> <button class="btn btn-sm btn-outline-danger remove-item-btn ${isClosing || loggedInUser.role === 'Admin' ? 'disabled' : ''}" data-item-index="${index}" title="Remover" ${isClosing || loggedInUser.role === 'Admin' ? 'disabled' : ''}><i class="bi bi-trash3"></i></button>`;
                    // Add listener only if not closing and not Admin
                    if (!isClosing && loggedInUser.role !== 'Admin') {
                        li.querySelector('.remove-item-btn').addEventListener('click', handleRemoveItem);
                    }
                    orderItemsList.appendChild(li);
                });
            }
            orderTotalSpan.textContent = formatCurrency(table.total || 0);

             // Show people setter if Garcom selected a Livre table
             if (loggedInUser.role === 'Garcom' && table.status === 'Livre' && peopleCountSetterDiv) {
                 renderPeopleCountSetter(tableId, table.peopleCount);
                 peopleCountSetterDiv.style.display = 'block';
             }
        }

        function renderProductList(category = null) {
             // Admins don't see the product list/adding interface
             if (loggedInUser && loggedInUser.role === 'Admin') {
                  if (productListBody) productListBody.innerHTML = '';
                  if (productCategoryName) productCategoryName.textContent = 'N/A';
                  return;
             };

             const categoryFilter = category; // Use category directly (null if none passed)
             const filteredProducts = categoryFilter ? allProducts.filter(p => p.category === categoryFilter) : allProducts;

             renderProductTable(filteredProducts);
             if(productCategoryName) {
                 const catInfo = [
                     { key: 'bebidas', title: 'Bebidas'}, { key: 'pratos', title: 'Pratos'},
                     { key: 'lanches', title: 'Lanches'}, { key: 'porcoes', title: 'Porções'}
                 ].find(c => c.key === categoryFilter);
                 productCategoryName.textContent = catInfo ? catInfo.title : 'Produtos';
             }
        }

        function renderProductTable(products) {
            if (!productListBody) return;
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
            // Admins cannot add items from dashboard
            if (loggedInUser.role === 'Admin') return;

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
            table.status = 'Ocupada'; // Adding item occupies the table

            // Ensure people count is at least 1 if it was 0
            if(table.peopleCount <= 0) {
                 table.peopleCount = 1;
                 renderPeopleCountSetter(selectedTableId, table.peopleCount); // Update display if visible
            }

            updateTableButtonStatus(selectedTableId);
            displayTableOrder(selectedTableId);
            updateActionButtonsVisibility(selectedTableId);
            saveTablesData();
        }

        function handleRemoveItem(event) {
             // Admins cannot remove items from dashboard
            if (loggedInUser.role === 'Admin') return;
            if (!selectedTableId || !tablesData[selectedTableId]) return;

            const button = event.currentTarget;
            const itemIndex = parseInt(button.dataset.itemIndex);
            const table = tablesData[selectedTableId];
            if (table.status === 'Fechamento') return; // Cannot remove if closing

            if (!isNaN(itemIndex) && itemIndex >= 0 && itemIndex < table.items.length) {
                table.items.splice(itemIndex, 1);
                table.total = table.items.reduce((sum, item) => sum + (item.price || 0), 0);
                if (table.items.length === 0) {
                    table.status = 'Livre'; // Table becomes free if last item removed
                    table.total = 0;
                    // Reset people count when table becomes free? Optional, current keeps it.
                     // table.peopleCount = 0;
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

             // Regenerate innerHTML to include updated people count
             let peopleText = table.peopleCount > 0 ? ` (${table.peopleCount} P)` : '';
             let statusText = table.status || '?';
             button.innerHTML = `
                 <span class="table-button-main-text">Mesa ${tableId}</span>
                 <span class="table-button-sub-text">${statusText}${peopleText}</span>
             `;

            // Update status class
            button.classList.remove('status-livre', 'status-ocupada', 'status-fechamento');
            button.classList.add(statusClass);
        }

        function updateActionButtonsVisibility(tableId = selectedTableId) {
            const table = tableId ? tablesData[tableId] : null;
            if (!closeAccountBtn || !reopenTableBtn || !finalizeTableBtn) return;

            // Hide all by default
            closeAccountBtn.classList.add('d-none');
            reopenTableBtn.classList.add('d-none');
            finalizeTableBtn.classList.add('d-none');

            // Show only if not Admin and table has relevant status
            if (loggedInUser.role !== 'Admin' && table) {
                if (table.status === 'Ocupada' && table.items.length > 0) { closeAccountBtn.classList.remove('d-none'); }
                else if (table.status === 'Fechamento') { reopenTableBtn.classList.remove('d-none'); finalizeTableBtn.classList.remove('d-none'); }
            }
        }

        // Button handlers only relevant for Garcom
        function handleCloseAccount() {
            if (loggedInUser.role === 'Admin' || !selectedTableId || !tablesData[selectedTableId]) return;
            const table = tablesData[selectedTableId];
            if (table.status === 'Ocupada' && table.items.length > 0) {
                table.status = 'Fechamento';
                updateTableButtonStatus(selectedTableId);
                displayTableOrder(selectedTableId); // Will disable remove buttons
                updateActionButtonsVisibility(selectedTableId);
                saveTablesData();
                showAlert(`Mesa ${selectedTableId} marcada para fechamento.`, 'info', alertPlaceholderDashboard);
            }
        }

        function handleReopenTable() {
             if (loggedInUser.role === 'Admin' || !selectedTableId || !tablesData[selectedTableId]) return;
            const table = tablesData[selectedTableId];
            if (table.status === 'Fechamento') {
                table.status = 'Ocupada';
                updateTableButtonStatus(selectedTableId);
                displayTableOrder(selectedTableId); // Will re-enable remove buttons
                updateActionButtonsVisibility(selectedTableId);
                saveTablesData();
                showAlert(`Mesa ${selectedTableId} foi reaberta.`, 'success', alertPlaceholderDashboard);
            }
        }

        function handleFinalizeTable() {
             if (loggedInUser.role === 'Admin' || !selectedTableId || !tablesData[selectedTableId]) return;
            const table = tablesData[selectedTableId];
            if (table.status === 'Fechamento') {
                generateReceipt(selectedTableId, table);
                table.items = [];
                table.total = 0.0;
                table.status = 'Livre';
                table.peopleCount = 0; // Reset people count on finalize
                updateTableButtonStatus(selectedTableId);
                displayTableOrder(selectedTableId);
                updateActionButtonsVisibility(selectedTableId);
                saveTablesData();
                showAlert(`Mesa ${selectedTableId} finalizada com sucesso. Recibo gerado.`, 'success', alertPlaceholderDashboard);
            }
        }

        function generateReceipt(tableId, tableData) {
            const now = new Date(); const dateTimeString = now.toLocaleString('pt-BR');
            let receiptHTML = `<html><head><title>Recibo Mesa ${tableId}</title><style>body{font-family:monospace;margin:15px;font-size:10pt;}h2,p.center{text-align:center;margin:3px 0;}hr{border:none;border-top:1px dashed #000;margin:10px 0;}table{width:100%;border-collapse:collapse;margin-top:5px;}td{padding:2px 0;}td:last-child{text-align:right;}.total{font-weight:bold;margin-top:10px;text-align:right;}@media print{button{display:none;}}</style></head><body><h2>Bar Code</h2><p class="center">Rua Fictícia, 123</p><p class="center">CNPJ: 99.999.999/0001-99</p><hr><h2>Mesa ${tableId}</h2><p class="center">Data/Hora: ${dateTimeString}</p><p class="center">Pessoas: ${tableData.peopleCount || 'N/A'}</p><hr><table><thead><tr><th>Item</th><th>Valor</th></tr></thead><tbody>`;
            tableData.items.forEach(item => { receiptHTML += `<tr><td>${item.name || '?'}</td><td>${formatCurrency(item.price || 0)}</td></tr>`; });
            receiptHTML += `</tbody></table><hr><div class="total">TOTAL: ${formatCurrency(tableData.total || 0)}</div><hr><p class="center">Obrigado!</p><div style="text-align:center; margin-top:20px;"><button onclick="window.print()">Imprimir</button> <button onclick="window.close()">Fechar</button></div></body></html>`;
            const receiptWindow = window.open('', '_blank', 'width=300,height=550'); // Increased height slightly
            if (receiptWindow) { receiptWindow.document.write(receiptHTML); receiptWindow.document.close(); }
            else { showAlert('Não foi possível abrir a janela do recibo. Verifique se pop-ups estão bloqueados.', 'warning', alertPlaceholderDashboard); }
        }
    }

    // --- Kitchen Page Logic ---
    if (kitchenOrdersDisplay) {
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
        if (!loggedInUser || loggedInUser.role !== 'Admin') {
             showAlert("Acesso não autorizado à Cozinha.", "danger", alertPlaceholderKitchen);
             setTimeout(() => { window.location.href = 'index.html'; }, 1500);
        }
        else { loadAndRenderKitchenOrders(); }

        function loadAndRenderKitchenOrders() {
            // Read the *same* shared data
            const kitchenData = JSON.parse(localStorage.getItem('restaurantTablesData') || '{}');
            console.log("Kitchen loading data:", kitchenData); // Debug log
            kitchenOrdersDisplay.innerHTML = '';
            let activeOrdersFound = false;
            const sortedTableIds = Object.keys(kitchenData).map(id => parseInt(id)).sort((a, b) => a - b);
            sortedTableIds.forEach(tableId => {
                const table = kitchenData[tableId];
                // Display if Ocupada or Fechamento and has items
                if (table && (table.status === 'Ocupada' || table.status === 'Fechamento') && table.items && table.items.length > 0) {
                    activeOrdersFound = true;
                    const card = document.createElement('div');
                    card.className = 'col-md-6 col-lg-4';
                    let itemsHtml = '<ul class="list-unstyled kitchen-item-list">';
                    table.items.forEach(item => {
                        itemsHtml += `<li><i class="bi bi-dot"></i> ${item.name || '?'}</li>`;
                    });
                    itemsHtml += '</ul>';
                    let peopleText = table.peopleCount > 0 ? `<span class="badge bg-secondary ms-2">${table.peopleCount} P</span>` : '';

                    card.innerHTML = `
                        <div class="card kitchen-order-card shadow-sm mb-3">
                            <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                                <h5 class="mb-0">Mesa ${tableId}${peopleText}</h5>
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

    // --- Profile Page Logic ---
    if (profileForm) {
        const nameInput = document.getElementById('profileName');
        const roleInput = document.getElementById('profileRole');
        const passwordInput = document.getElementById('profilePassword');
        const confirmPasswordInput = document.getElementById('profileConfirmPassword');
        const imageInput = document.getElementById('profileImageInput');
        const currentImage = document.getElementById('current-profile-image');
        const alertPlaceholderProfile = document.getElementById('profile-alert-placeholder');
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
        const loggedInUsername = localStorage.getItem('loggedInUsername'); // 'admin' or 'garcom'

        if (loggedInUser && loggedInUsername) {
            if(nameInput) nameInput.value = loggedInUser.name || '';
            if(roleInput) roleInput.value = loggedInUser.role || '';
            // Load image specific to this user
            const savedImage = localStorage.getItem(`userProfileImage_${loggedInUsername}_dataUrl`);
            if (savedImage && currentImage) { currentImage.src = savedImage; }
            else if (currentImage) { currentImage.src = 'assets/profile.png'; }
        } else {
             showAlert("Sessão de usuário não encontrada ou inválida. Por favor, faça login novamente.", "warning", alertPlaceholderProfile);
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
            if (!loggedInUsername) { showAlert("Erro: Usuário não identificado para salvar perfil.", "danger", alertPlaceholderProfile); return; }
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
                // Update user details object (which might be re-read on next login/refresh)
                loggedInUser.name = newName;
                if (newPassword) {
                     // WARNING: In a real app, NEVER store plain passwords. Hash them server-side.
                     // Here, we're just updating the object in localStorage for demo purposes.
                     // Need to decide if we update the `validUsers` object simulated login or just the loggedInUser obj.
                     // Updating loggedInUser is simpler for now. Login check still uses original password.
                     // To make password change persistent *for login*, would need to update where `validUsers` is defined/stored.
                     loggedInUser.password = newPassword; // Note: This won't affect the login check itself in this setup
                 }
                 localStorage.setItem('loggedInUser', JSON.stringify(loggedInUser)); // Save updated user details

                // Save profile image using the unique key
                const imageKey = `userProfileImage_${loggedInUsername}_dataUrl`;
                if (newImageFile && imageDataUrl && imageDataUrl.startsWith('data:image')) {
                    localStorage.setItem(imageKey, imageDataUrl);
                } else if (!newImageFile && currentImage.src.includes('assets/profile.png')) {
                     // If no new file was selected AND the current image is the default, remove saved image
                     localStorage.removeItem(imageKey);
                } // Otherwise, if no new file, keep the existing saved image

                showAlert("Perfil atualizado com sucesso!", "success", alertPlaceholderProfile);
                passwordInput.value = '';
                confirmPasswordInput.value = '';
                imageInput.value = '';

                // Update navbar immediately
                setTimeout(() => {
                     const navBarImage = document.getElementById('navbar-profile-image');
                     const finalImageSrc = localStorage.getItem(imageKey) || 'assets/profile.png';
                     if(navBarImage) navBarImage.src = finalImageSrc;
                     const navBarName = document.getElementById('navbar-user-name');
                     if(navBarName) navBarName.textContent = newName.split(' ')[0];
                 }, 100);

            } catch (error) {
                showAlert("Ocorreu um erro ao salvar as alterações do perfil.", "danger", alertPlaceholderProfile);
                console.error("Error saving profile:", error);
            }
        });
    }

}); // End DOMContentLoaded