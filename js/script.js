document.addEventListener('DOMContentLoaded', function () {
    // --- Element References ---
    const loginForm = document.getElementById('loginForm');
    const alertPlaceholderLogin = document.getElementById('alert-placeholder');
    const wrapper = document.getElementById('wrapper');
    const tablesArea = document.getElementById('tables-area');
    const alertPlaceholderDashboard = document.getElementById('dashboard-alert-placeholder');
    const kitchenOrdersDisplay = document.getElementById('kitchen-orders-display');
    const alertPlaceholderKitchen = document.getElementById('kitchen-alert-placeholder');
    const productCategoryFilters = document.getElementById('product-category-filters');
    const profileForm = document.getElementById('profileForm');
    const selectedTableTitleElement = document.getElementById('selected-table-title'); // Reference to the H5 title

    // --- Utility Functions ---
    function showAlert(message, type = 'info', placeholder) {
        const targetPlaceholder = placeholder || alertPlaceholderLogin || alertPlaceholderDashboard || alertPlaceholderKitchen || document.getElementById('profile-alert-placeholder');
        if (!targetPlaceholder) { console.error("Alert placeholder not found for:", placeholder); return; }
        // Clear previous alert
        targetPlaceholder.innerHTML = '';
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show m-0`;
        alertDiv.setAttribute('role', 'alert');
        // Use textContent for message to prevent potential XSS if message is dynamic
        alertDiv.appendChild(document.createTextNode(message));
        // Add close button manually
        const closeButton = document.createElement('button');
        closeButton.type = 'button';
        closeButton.className = 'btn-close';
        closeButton.setAttribute('data-bs-dismiss', 'alert');
        closeButton.setAttribute('aria-label', 'Close');
        alertDiv.appendChild(closeButton);
        // Append the new alert
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
        // References moved inside for scope clarity
        const orderDetails = document.getElementById('order-details');
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
        let tablesData = {}; // Holds the state of all tables
        let selectedTableId = null; // Which table ID is currently selected in the UI
        const allProducts = [ { id: 1, name: 'Coca-Cola Lata', price: 5.00, category: 'bebidas' }, { id: 2, name: 'Suco Laranja 300ml', price: 7.00, category: 'bebidas' }, { id: 3, name: 'Água Mineral c/ Gás', price: 4.00, category: 'bebidas' }, { id: 4, name: 'Cerveja Long Neck', price: 8.00, category: 'bebidas' }, { id: 10, name: 'PF Frango Grelhado', price: 25.00, category: 'pratos' }, { id: 11, name: 'Parmegiana de Carne', price: 35.00, category: 'pratos' }, { id: 12, name: 'Salada Caesar', price: 22.00, category: 'pratos' }, { id: 20, name: 'X-Burger Simples', price: 15.00, category: 'lanches' }, { id: 21, name: 'X-Salada Completo', price: 18.50, category: 'lanches' }, { id: 22, name: 'Misto Quente', price: 10.00, category: 'lanches' }, { id: 30, name: 'Batata Frita Média', price: 20.00, category: 'porcoes' }, { id: 31, name: 'Calabresa Acebolada', price: 28.00, category: 'porcoes' }, { id: 32, name: 'Frango a Passarinho', price: 32.00, category: 'porcoes' }, ];
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
        const loggedInUsername = localStorage.getItem('loggedInUsername'); // 'admin' or 'garcom'

        // Authentication Check
        if (!loggedInUser || !loggedInUsername) {
            window.location.href = 'index.html'; // Redirect if not logged in
        } else {
            initializeDashboard(); // Start the dashboard if logged in
        }

        // --- Initialization ---
        function initializeDashboard() {
            if (navbarUserName) navbarUserName.textContent = loggedInUser.name.split(' ')[0];
            if (navbarProfileImage && loggedInUsername) {
                const savedImage = localStorage.getItem(`userProfileImage_${loggedInUsername}_dataUrl`);
                navbarProfileImage.src = savedImage || 'assets/profile.png';
            }
            loadTablesData();
            renderTableButtons();
            setupAdminView(); // Adjust UI based on role
            renderCategoryFilters(); // Setup category buttons if needed
            // Render the product list for the default category if Garcom
            if (loggedInUser.role !== 'Admin') {
                 const firstCategoryButton = productCategoryFilters?.querySelector('.btn-filter');
                 renderProductList(firstCategoryButton?.dataset.category);
            } else {
                renderProductList(); // Admin doesn't see products here
            }
            setupEventListeners(); // Setup general button clicks
            updateActionButtonsVisibility(); // Set initial state for close/reopen/finalize buttons
            displayTableOrder(null); // Ensure initial state shows "Selecione Mesa"
        }

        // --- UI Setup based on Role ---
        function setupAdminView() {
             if (loggedInUser && loggedInUser.role === 'Admin') {
                 // Hide elements Garcom uses
                 if(addProductCard) addProductCard.style.display = 'none';
                 if(productCategoryFilters) productCategoryFilters.style.display = 'none';
                 // People count controls are handled dynamically by renderTableTitleWithPeopleCount
             }
         }

        // --- Category Filter Logic ---
        function renderCategoryFilters() {
            if (!productCategoryFilters || (loggedInUser && loggedInUser.role === 'Admin')) return; // Skip if no element or Admin
            productCategoryFilters.innerHTML = '';
            const categories = [ // No "Todos"
                { key: 'bebidas', title: 'Bebidas', icon: 'bi-cup-straw' }, { key: 'pratos', title: 'Pratos', icon: 'bi-egg-fried' },
                { key: 'lanches', title: 'Lanches', icon: 'bi-badge-sd-fill' }, { key: 'porcoes', title: 'Porções', icon: 'bi-basket-fill' }
            ];
            if (categories.length > 0) {
                categories.forEach((cat, index) => {
                    const button = document.createElement('button');
                    button.className = `btn btn-filter btn-sm ${index === 0 ? 'active' : ''}`; // Activate first
                    button.dataset.category = cat.key;
                    button.title = cat.title;
                    button.innerHTML = `<i class="bi ${cat.icon}"></i>`;
                    button.addEventListener('click', handleCategoryFilterClick);
                    productCategoryFilters.appendChild(button);
                });
            } else {
                 productCategoryFilters.innerHTML = '<p class="text-muted small">Nenhuma categoria definida.</p>';
            }
        }

        function handleCategoryFilterClick(e) {
            const button = e.currentTarget;
            if (!button || (loggedInUser && loggedInUser.role === 'Admin')) return;
            // Visually update active button
            productCategoryFilters.querySelectorAll('.btn-filter').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            // Re-render the product list based on the clicked category
            renderProductList(button.dataset.category);
        }

        // --- Event Listener Setup ---
        function setupEventListeners() {
             if (logoutButton) logoutButton.addEventListener('click', handleLogout);
             // Action buttons for Garcom only
             if (loggedInUser.role !== 'Admin') {
                 if (closeAccountBtn) closeAccountBtn.addEventListener('click', handleCloseAccount);
                 if (reopenTableBtn) reopenTableBtn.addEventListener('click', handleReopenTable);
                 if (finalizeTableBtn) finalizeTableBtn.addEventListener('click', handleFinalizeTable);
             }
             // Listeners for table buttons and people adjust are added when they are rendered
         }

        function handleLogout(e) {
            e.preventDefault();
            localStorage.removeItem('loggedInUser');
            localStorage.removeItem('loggedInUsername');
            window.location.href = 'index.html';
        }

        // --- Data Handling (localStorage) ---
        function loadTablesData() {
            const savedData = localStorage.getItem('restaurantTablesData');
            tablesData = {}; // Reset before loading
            if (savedData) {
                try {
                    const parsedData = JSON.parse(savedData);
                    if (typeof parsedData === 'object' && parsedData !== null) tablesData = parsedData;
                } catch (error) { console.error("Error parsing table data from localStorage:", error); }
            }
            // Initialize missing tables or properties
            for (let i = 1; i <= TOTAL_TABLES; i++) {
                if (!tablesData[i] || typeof tablesData[i] !== 'object') {
                    tablesData[i] = { items: [], total: 0.0, status: 'Livre', peopleCount: 0 }; // Default structure
                } else {
                    // Ensure all needed properties exist
                    if (!Array.isArray(tablesData[i].items)) tablesData[i].items = [];
                    if (!tablesData[i].status) tablesData[i].status = tablesData[i].items.length > 0 ? 'Ocupada' : 'Livre';
                    if (typeof tablesData[i].peopleCount !== 'number' || isNaN(tablesData[i].peopleCount)) tablesData[i].peopleCount = 0;
                    // Recalculate total on load for safety
                    tablesData[i].total = tablesData[i].items.reduce((sum, item) => sum + (item.price || 0), 0);
                }
            }
             // Optional: Log loaded data
            // console.log("Tables data loaded:", JSON.stringify(tablesData));
        }

        function saveTablesData() {
            try {
                localStorage.setItem('restaurantTablesData', JSON.stringify(tablesData));
                 // Optional: Log saved data
                // console.log("Tables data saved:", JSON.stringify(tablesData));
            }
            catch (error) { showAlert('Erro ao salvar dados das mesas.', 'danger', alertPlaceholderDashboard); console.error("Error saving table data:", error); }
        }

        // --- Table Area Rendering ---
        function renderTableButtons() {
            if (!tablesArea) return;
            tablesArea.innerHTML = ''; // Clear previous buttons
            if (Object.keys(tablesData).length === 0) { tablesArea.innerHTML = '<p class="text-muted p-3">Erro ao carregar mesas</p>'; return; }
            // Sort tables by ID for consistent order
            const sortedTableIds = Object.keys(tablesData).map(id => parseInt(id)).sort((a, b) => a - b);
            sortedTableIds.forEach(id => {
                 const table = tablesData[id];
                 if (!table) return; // Skip if data somehow invalid
                 const button = document.createElement('button');
                 button.className = `btn table-button shadow-sm status-${(table.status || 'livre').toLowerCase()}`;
                 if (id.toString() === selectedTableId) button.classList.add('selected'); // Mark selected if applicable
                 button.dataset.tableId = id;
                 updateTableButtonDisplay(button, id, table); // Set text and people count display
                 button.addEventListener('click', handleTableClick); // Add click listener
                 tablesArea.appendChild(button);
            });
            if (tablesArea.children.length === 0) tablesArea.innerHTML = '<p class="text-muted p-3">Nenhuma mesa configurada.</p>';
        }

        // Helper to set the text inside a table button
        function updateTableButtonDisplay(button, tableId, table) {
             let peopleText = table.peopleCount > 0 ? ` (${table.peopleCount} P)` : '';
             let statusText = table.status || '?';
             button.innerHTML = `
                 <span class="table-button-main-text">Mesa ${tableId}</span>
                 <span class="table-button-sub-text">${statusText}${peopleText}</span>
             `;
        }

        // --- Table Selection & Details Logic ---
        function handleTableClick(event) {
            const button = event.currentTarget;
            const tableId = button.dataset.tableId;
            const table = tablesData[tableId];

            // Admin clicks occupied table -> redirect to kitchen
            if (loggedInUser.role === 'Admin' && table && (table.status === 'Ocupada' || table.status === 'Fechamento')) {
                 window.location.href = 'kitchen.html';
                 return; // Prevent further dashboard interaction for this click
            }

            // Garcom interaction or Admin clicking a Livre table
            document.querySelectorAll('.table-button.selected').forEach(btn => btn.classList.remove('selected'));
            button.classList.add('selected'); // Visually mark as selected
            selectedTableId = tableId; // Update the global selected ID

            // Update the details pane (title, items, total, buttons)
            displayTableOrder(tableId);
            updateActionButtonsVisibility(tableId);
        }

        // Renders the title (H5 element) including people count/controls
        function renderTableTitleWithPeopleCount(tableId, table) {
            if (!selectedTableTitleElement) { console.error("Title element missing!"); return; }

            if (!tableId || !table) {
                 selectedTableTitleElement.innerHTML = 'Selecione Mesa';
                 return;
            }

            const peopleCount = table.peopleCount || 0;
            // Garcom can adjust unless table is Fechamento
            const canAdjustPeople = loggedInUser.role === 'Garcom' && table.status !== 'Fechamento';

            let titleHTML = `Mesa ${tableId} `; // Base text

            if (canAdjustPeople) {
                const decreaseDisabled = peopleCount <= 0 ? 'disabled' : ''; // Disable minus if 0
                titleHTML += `
                    <span class="people-controls-inline ms-2">
                        <button class="btn btn-people-adjust" data-table-id="${tableId}" data-action="decrease" title="Diminuir pessoas" ${decreaseDisabled}>
                            <i class="bi bi-dash"></i>
                        </button>
                        <span id="people-display-inline" class="mx-2">${peopleCount}</span>
                        <button class="btn btn-people-adjust" data-table-id="${tableId}" data-action="increase" title="Aumentar pessoas">
                           <i class="bi bi-plus"></i>
                        </button>
                        <span class="ms-1 small text-muted">Pessoas</span>
                    </span>`;
            } else if (peopleCount > 0) { // Just display count if Admin or Fechamento
                titleHTML += ` <span class="text-muted small">(${peopleCount} Pessoas)</span>`;
            }

            selectedTableTitleElement.innerHTML = titleHTML; // Update the DOM

            // Add listeners *only if* controls were just rendered
            if (canAdjustPeople) {
                 selectedTableTitleElement.querySelectorAll('.btn-people-adjust').forEach(btn => {
                    // Ensure no duplicate listeners
                    btn.removeEventListener('click', handlePeopleAdjust);
                    btn.addEventListener('click', handlePeopleAdjust);
                 });
             }
        }

        // Handles clicks on the inline +/- buttons
        function handlePeopleAdjust(event) {
            const button = event.currentTarget;
            const tableId = button.dataset.tableId; // Get ID from button
            const action = button.dataset.action; // 'increase' or 'decrease'

            if (!tableId || !tablesData[tableId]) { console.error("Invalid table data for adjustment."); return; }

            let currentCount = tablesData[tableId].peopleCount || 0;

            if (action === 'increase') {
                currentCount++;
            } else if (action === 'decrease' && currentCount > 0) { // Don't go below 0
                currentCount--;
            }

            tablesData[tableId].peopleCount = currentCount; // Update internal data

            // Refresh UI elements
            renderTableTitleWithPeopleCount(tableId, tablesData[tableId]); // Redraw title with updated count/disabled state
            updateTableButtonStatus(tableId); // Redraw the main table button

            saveTablesData(); // Persist the change
        }

        // Displays the order details (items list, total) for the selected table
        function displayTableOrder(tableId) {
            const table = tableId ? tablesData[tableId] : null;

            // 1. Update Title (this now handles people display/controls too)
            renderTableTitleWithPeopleCount(tableId, table);

            // 2. Update Items List
            if (!orderItemsList) return; // Safety check
            orderItemsList.innerHTML = ''; // Clear previous items
            if (table && table.items.length > 0) {
                table.items.forEach((item, index) => {
                    const li = document.createElement('li');
                    li.classList.add('list-group-item');
                    const isClosing = table.status === 'Fechamento';
                    const isGarcom = loggedInUser.role === 'Garcom';
                    const canRemove = isGarcom && !isClosing; // Only Garcom on non-closing tables

                    li.innerHTML = `
                        <span class="item-name">${item.name || '?'}</span>
                        <span class="item-price">${formatCurrency(item.price || 0)}</span>
                        <button class="btn btn-sm btn-outline-danger remove-item-btn"
                                data-item-index="${index}"
                                title="Remover" ${!canRemove ? 'disabled' : ''}>
                            <i class="bi bi-trash3"></i>
                        </button>`;

                    if (canRemove) {
                        li.querySelector('.remove-item-btn').addEventListener('click', handleRemoveItem);
                    }
                    orderItemsList.appendChild(li);
                });
            } else if (table) { // Table selected, but no items
                 orderItemsList.innerHTML = `<li class="list-group-item text-muted text-center p-3">Mesa ${table.status}...</li>`;
            } else { // No table selected
                orderItemsList.innerHTML = '<li class="list-group-item text-muted text-center p-3">...</li>';
            }

            // 3. Update Total Display
             if (orderTotalSpan) {
                 orderTotalSpan.textContent = formatCurrency(table?.total || 0);
             }
        }

        // Updates visibility of Close/Reopen/Finalize buttons (only for Garcom)
        function updateActionButtonsVisibility(tableId = selectedTableId) {
            const table = tableId ? tablesData[tableId] : null;
            // Ensure buttons exist before trying to modify them
            if (!closeAccountBtn || !reopenTableBtn || !finalizeTableBtn) return;

            // Default: hide all
            closeAccountBtn.classList.add('d-none');
            reopenTableBtn.classList.add('d-none');
            finalizeTableBtn.classList.add('d-none');

            // Show based on role and table status
            if (loggedInUser.role === 'Garcom' && table) {
                if (table.status === 'Ocupada' && table.items.length > 0) {
                    closeAccountBtn.classList.remove('d-none');
                } else if (table.status === 'Fechamento') {
                    reopenTableBtn.classList.remove('d-none');
                    finalizeTableBtn.classList.remove('d-none');
                }
            }
        }

        // --- Product List Logic ---
        function renderProductList(category = null) {
             if (loggedInUser && loggedInUser.role === 'Admin') {
                  if (productListBody) productListBody.innerHTML = ''; // Clear for Admin
                  if (productCategoryName) productCategoryName.textContent = 'N/A';
                  return;
             };
             // Find first active category if none passed (after removing "Todos")
              if (!category) {
                   const firstActiveButton = productCategoryFilters?.querySelector('.btn-filter.active');
                   category = firstActiveButton?.dataset.category || null;
              }

             const filteredProducts = category ? allProducts.filter(p => p.category === category) : allProducts;
             renderProductTable(filteredProducts); // Display products in the table
             // Update the category name display
             if(productCategoryName) {
                 const catInfo = [ { key: 'bebidas', title: 'Bebidas'}, { key: 'pratos', title: 'Pratos'}, { key: 'lanches', title: 'Lanches'}, { key: 'porcoes', title: 'Porções'} ].find(c => c.key === category);
                 productCategoryName.textContent = catInfo ? catInfo.title : 'Produtos';
             }
        }

        function renderProductTable(products) {
            if (!productListBody) return;
            productListBody.innerHTML = ''; // Clear previous items
            if (products.length === 0) {
                const catName = productCategoryName ? productCategoryName.textContent : 'selecionada';
                productListBody.innerHTML = `<tr><td colspan="3" class="text-muted text-center p-3 fst-italic">Nenhum produto (${catName}).</td></tr>`;
            } else {
                products.forEach(product => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `<td>${product.name}</td> <td class="text-end">${formatCurrency(product.price)}</td> <td class="text-center"><button class="btn btn-sm btn-success add-item-btn" data-product-id="${product.id}" data-product-name="${product.name}" data-product-price="${product.price}" title="Adicionar"><i class="bi bi-plus-lg"></i></button></td>`;
                    // Add listener to the '+' button for this product
                    tr.querySelector('.add-item-btn').addEventListener('click', handleAddItem);
                    productListBody.appendChild(tr);
                });
            }
        }

        // --- Item Adding/Removing Logic ---
        function handleAddItem(event) {
            // Admins cannot add items via dashboard
            if (loggedInUser.role === 'Admin') return;
            // Must select a table first
            if (!selectedTableId) { showAlert('Selecione uma mesa primeiro.', 'warning', alertPlaceholderDashboard); return; }
            const table = tablesData[selectedTableId];
            if (!table) { showAlert('Erro: Mesa selecionada inválida.', 'danger', alertPlaceholderDashboard); return; }
            // Cannot add if table is closing
            if (table.status === 'Fechamento') { showAlert(`Mesa ${selectedTableId} está em fechamento. Não pode adicionar itens.`, 'warning', alertPlaceholderDashboard); return; }

            // Get product details from the clicked button's data attributes
            const button = event.currentTarget;
            const productId = button.dataset.productId;
            const productName = button.dataset.productName;
            const productPrice = parseFloat(button.dataset.productPrice);
            if (isNaN(productPrice)) { showAlert('Erro: Preço do produto inválido.', 'danger', alertPlaceholderDashboard); return; }

            // Update table data
            table.items.push({ id: productId, name: productName, price: productPrice });
            table.total = (table.total || 0) + productPrice;
            table.status = 'Ocupada'; // Mark as occupied

             // Set people count to at least 1 if adding the first item
             if (table.peopleCount <= 0) {
                 table.peopleCount = 1;
             }

            // Refresh UI
            updateTableButtonStatus(selectedTableId); // Update main button state
            displayTableOrder(selectedTableId); // Redraw details pane (updates title, list, total)
            updateActionButtonsVisibility(selectedTableId); // Show 'Fechar' button if applicable

            saveTablesData(); // Persist changes
        }

        function handleRemoveItem(event) {
             // Admins cannot remove items via dashboard
             if (loggedInUser.role === 'Admin') return;
             if (!selectedTableId || !tablesData[selectedTableId]) return; // Need selected table

             const button = event.currentTarget;
             const itemIndex = parseInt(button.dataset.itemIndex); // Get index from data attribute
             const table = tablesData[selectedTableId];
             // Cannot remove if table is closing
            if (table.status === 'Fechamento') return;

            // Validate index and remove item
            if (!isNaN(itemIndex) && itemIndex >= 0 && itemIndex < table.items.length) {
                table.items.splice(itemIndex, 1); // Remove from array
                table.total = table.items.reduce((sum, item) => sum + (item.price || 0), 0); // Recalculate total

                // If last item was removed, reset table state
                if (table.items.length === 0) {
                    table.status = 'Livre';
                    table.total = 0;
                    table.peopleCount = 0; // Reset people when table becomes empty
                 }

                // Refresh UI
                updateTableButtonStatus(selectedTableId); // Update main button
                displayTableOrder(selectedTableId); // Redraw details (updates title, list, total)
                updateActionButtonsVisibility(selectedTableId); // Hide 'Fechar' if now empty

                saveTablesData(); // Persist changes
             }
        }

        // --- Table Status Change Logic (Garcom Only) ---
        function handleCloseAccount() {
            if (loggedInUser.role === 'Admin' || !selectedTableId || !tablesData[selectedTableId]) return;
            const table = tablesData[selectedTableId];
            // Can only close if 'Ocupada' and has items
            if (table.status === 'Ocupada' && table.items.length > 0) {
                table.status = 'Fechamento'; // Update status
                // Refresh UI
                updateTableButtonStatus(selectedTableId);
                displayTableOrder(selectedTableId); // Redraws title (disables people controls) and item list (disables remove)
                updateActionButtonsVisibility(selectedTableId); // Shows Reopen/Finalize, hides Close
                saveTablesData();
                showAlert(`Mesa ${selectedTableId} marcada para fechamento.`, 'info', alertPlaceholderDashboard);
            }
        }

        function handleReopenTable() {
             if (loggedInUser.role === 'Admin' || !selectedTableId || !tablesData[selectedTableId]) return;
            const table = tablesData[selectedTableId];
            // Can only reopen if 'Fechamento'
            if (table.status === 'Fechamento') {
                table.status = 'Ocupada'; // Change status back
                // Refresh UI
                updateTableButtonStatus(selectedTableId);
                displayTableOrder(selectedTableId); // Redraws title (enables people controls) and list (enables remove)
                updateActionButtonsVisibility(selectedTableId); // Shows Close, hides Reopen/Finalize
                saveTablesData();
                showAlert(`Mesa ${selectedTableId} foi reaberta.`, 'success', alertPlaceholderDashboard);
            }
        }

        function handleFinalizeTable() {
             if (loggedInUser.role === 'Admin' || !selectedTableId || !tablesData[selectedTableId]) return;
            const table = tablesData[selectedTableId];
             // Can only finalize if 'Fechamento'
            if (table.status === 'Fechamento') {
                generateReceipt(selectedTableId, table); // Generate receipt first

                // Reset table data
                table.items = [];
                table.total = 0.0;
                table.status = 'Livre';
                table.peopleCount = 0; // Reset people count

                // Refresh UI
                updateTableButtonStatus(selectedTableId);
                displayTableOrder(selectedTableId); // Show empty state, "Mesa Livre", update title
                updateActionButtonsVisibility(selectedTableId); // Hide all action buttons
                saveTablesData();
                showAlert(`Mesa ${selectedTableId} finalizada com sucesso. Recibo gerado.`, 'success', alertPlaceholderDashboard);

                // Optionally, de-select the table after finalizing
                // selectedTableId = null;
                // document.querySelectorAll('.table-button.selected').forEach(btn => btn.classList.remove('selected'));
                // displayTableOrder(null); // Show "Selecione Mesa"
                // updateActionButtonsVisibility(null);
            }
        }

        // --- Receipt Generation ---
        function generateReceipt(tableId, tableData) {
            const now = new Date(); const dateTimeString = now.toLocaleString('pt-BR');
            let receiptHTML = `<html><head><title>Recibo Mesa ${tableId}</title><style>body{font-family:monospace;margin:15px;font-size:10pt;}h2,p.center{text-align:center;margin:3px 0;}hr{border:none;border-top:1px dashed #000;margin:10px 0;}table{width:100%;border-collapse:collapse;margin-top:5px;}td{padding:2px 0;}td:last-child{text-align:right;}.total{font-weight:bold;margin-top:10px;text-align:right;}@media print{button{display:none;}}</style></head><body><h2>Bar Code</h2><p class="center">Rua Fictícia, 123</p><p class="center">CNPJ: 99.999.999/0001-99</p><hr><h2>Mesa ${tableId}</h2><p class="center">Data/Hora: ${dateTimeString}</p><p class="center">Pessoas: ${tableData.peopleCount || 'N/A'}</p><hr><table><thead><tr><th>Item</th><th>Valor</th></tr></thead><tbody>`;
            tableData.items.forEach(item => { receiptHTML += `<tr><td>${item.name || '?'}</td><td>${formatCurrency(item.price || 0)}</td></tr>`; });
            receiptHTML += `</tbody></table><hr><div class="total">TOTAL: ${formatCurrency(tableData.total || 0)}</div><hr><p class="center">Obrigado!</p><div style="text-align:center; margin-top:20px;"><button onclick="window.print()">Imprimir</button> <button onclick="window.close()">Fechar</button></div></body></html>`;
            const receiptWindow = window.open('', '_blank', 'width=300,height=550');
            if (receiptWindow) { receiptWindow.document.write(receiptHTML); receiptWindow.document.close(); }
            else { showAlert('Não foi possível abrir a janela do recibo. Verifique se pop-ups estão bloqueados.', 'warning', alertPlaceholderDashboard); }
        }

    } // End Dashboard Logic Check

    // --- Kitchen Page Logic ---
    if (kitchenOrdersDisplay) {
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
        if (!loggedInUser || loggedInUser.role !== 'Admin') {
             showAlert("Acesso não autorizado à Cozinha.", "danger", alertPlaceholderKitchen);
             setTimeout(() => { window.location.href = 'index.html'; }, 1500);
        }
        else { loadAndRenderKitchenOrders(); } // Only load if Admin

        function loadAndRenderKitchenOrders() {
            const kitchenData = JSON.parse(localStorage.getItem('restaurantTablesData') || '{}');
            if (!kitchenOrdersDisplay) return;
            kitchenOrdersDisplay.innerHTML = ''; // Clear previous
            let activeOrdersFound = false;
            const sortedTableIds = Object.keys(kitchenData).map(id => parseInt(id)).sort((a, b) => a - b);

            sortedTableIds.forEach(tableId => {
                const table = kitchenData[tableId];
                // Check if table has items and is not 'Livre'
                if (table && table.status !== 'Livre' && table.items && table.items.length > 0) {
                    activeOrdersFound = true;
                    const card = document.createElement('div');
                    card.className = 'col-md-6 col-lg-4'; // Bootstrap column classes

                    // Build list of items
                    let itemsHtml = '<ul class="list-unstyled kitchen-item-list">';
                    table.items.forEach(item => { itemsHtml += `<li><i class="bi bi-dot"></i> ${item.name || '?'}</li>`; });
                    itemsHtml += '</ul>';

                    // Add people count if available
                    let peopleText = table.peopleCount > 0 ? `<span class="badge bg-secondary ms-2">${table.peopleCount} P</span>` : '';

                    // Status badge class
                    const statusClass = table.status === 'Fechamento' ? 'bg-warning text-dark' : 'bg-light text-dark'; // Example: yellow for closing

                    // Card structure
                    card.innerHTML = `
                        <div class="card kitchen-order-card shadow-sm mb-3">
                            <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                                <h5 class="mb-0">Mesa ${tableId}${peopleText}</h5>
                                <span class="badge ${statusClass}">${table.status}</span>
                            </div>
                            <div class="card-body">
                                ${itemsHtml}
                            </div>
                        </div>`;
                    kitchenOrdersDisplay.appendChild(card);
                }
            });

            // Message if no active orders found
            if (!activeOrdersFound) {
                kitchenOrdersDisplay.innerHTML = '<div class="col-12"><div class="alert alert-info text-center">Nenhum pedido ativo encontrado nas mesas.</div></div>';
            }
        }
    } // End Kitchen Logic Check


    // --- Profile Page Logic ---
    if (profileForm) {
        // References inside profile logic scope
        const nameInput = document.getElementById('profileName');
        const roleInput = document.getElementById('profileRole');
        const passwordInput = document.getElementById('profilePassword');
        const confirmPasswordInput = document.getElementById('profileConfirmPassword');
        const imageInput = document.getElementById('profileImageInput');
        const currentImage = document.getElementById('current-profile-image');
        const alertPlaceholderProfile = document.getElementById('profile-alert-placeholder');
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
        const loggedInUsername = localStorage.getItem('loggedInUsername'); // Use stored username

        // Check if user data is available
        if (loggedInUser && loggedInUsername) {
            // Populate form fields
            if(nameInput) nameInput.value = loggedInUser.name || '';
            if(roleInput) roleInput.value = loggedInUser.role || '';

            // Load profile image specific to this username
            const imageKey = `userProfileImage_${loggedInUsername}_dataUrl`;
            const savedImage = localStorage.getItem(imageKey);
            if (savedImage && currentImage) { currentImage.src = savedImage; }
            else if (currentImage) { currentImage.src = 'assets/profile.png'; } // Default if no saved image

        } else {
            // If no user data, show error and redirect
            showAlert("Sessão de usuário não encontrada ou inválida. Por favor, faça login novamente.", "warning", alertPlaceholderProfile);
            setTimeout(() => { window.location.href = 'index.html'; }, 2000);
        }

        // Handle image file selection
         if (imageInput && currentImage) {
             imageInput.addEventListener('change', function(event) {
                 const file = event.target.files[0];
                 if (file && file.type.startsWith('image/')) { // Check if it's an image
                     const reader = new FileReader();
                     reader.onload = function(e) { currentImage.src = e.target.result; }; // Preview selected image
                     reader.onerror = function(e) { showAlert("Erro ao tentar ler a imagem selecionada.", "danger", alertPlaceholderProfile); };
                     reader.readAsDataURL(file); // Read file as Data URL
                 } else if (file) { // If a file was selected but wasn't an image
                     showAlert("Por favor, selecione um arquivo de imagem válido (PNG ou JPG).", "warning", alertPlaceholderProfile);
                     imageInput.value = ''; // Clear the invalid file input
                 }
             });
         }

        // Handle form submission
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Prevent default form submission
            // Need username to save profile picture correctly
            if (!loggedInUsername) { showAlert("Erro: Usuário não identificado para salvar perfil.", "danger", alertPlaceholderProfile); return; }

            // Clear previous alerts
            if(alertPlaceholderProfile) alertPlaceholderProfile.innerHTML = '';

            // Get values from form
            const newName = nameInput.value.trim();
            const newPassword = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;
            const newImageFile = imageInput.files[0]; // Check if a new file was selected
            const imageDataUrl = currentImage.src; // Get the src of the currently displayed image (might be new preview or old one)

            // Basic Validation
            if (!newName) { showAlert("O campo Nome Completo não pode estar em branco.", "warning", alertPlaceholderProfile); return; }
            if (newPassword && newPassword !== confirmPassword) { showAlert("As senhas digitadas não coincidem.", "warning", alertPlaceholderProfile); return; }
            if (newPassword && newPassword.length < 3) { showAlert("A nova senha deve ter pelo menos 3 caracteres.", "warning", alertPlaceholderProfile); return; }

            try {
                // --- Update User Data ---
                // Note: This updates the 'loggedInUser' object in localStorage.
                // Password change here doesn't affect the initial login check (which uses hardcoded values).
                loggedInUser.name = newName;
                if (newPassword) {
                    // In a real app: Send hash to backend. Don't store plain text.
                    loggedInUser.password_temp_for_demo = newPassword; // Just for demonstration if needed
                }
                 localStorage.setItem('loggedInUser', JSON.stringify(loggedInUser)); // Save updated name/pwd obj

                // --- Update Profile Image ---
                const imageKey = `userProfileImage_${loggedInUsername}_dataUrl`; // Key based on username
                if (newImageFile && imageDataUrl && imageDataUrl.startsWith('data:image')) {
                    // If a *new* file was selected AND the preview loaded successfully (is a data URL)
                    localStorage.setItem(imageKey, imageDataUrl);
                } else if (!newImageFile && currentImage.src.includes('assets/profile.png')) {
                    // If no new file was selected AND the current displayed image is the *default* placeholder
                    localStorage.removeItem(imageKey); // Remove any previously saved image for this user
                }
                // Case: No new file selected, and current image is *not* the default -> Do nothing, keep existing saved image.

                showAlert("Perfil atualizado com sucesso!", "success", alertPlaceholderProfile);

                // Clear password fields after successful save
                passwordInput.value = '';
                confirmPasswordInput.value = '';
                imageInput.value = ''; // Clear file input selection

                // --- Update Navbar Display (Delayed slightly) ---
                 setTimeout(() => {
                      // Find navbar elements again just in case
                     const navBarImage = document.getElementById('navbar-profile-image');
                     const finalImageSrc = localStorage.getItem(imageKey) || 'assets/profile.png'; // Get potentially updated src
                     if(navBarImage) navBarImage.src = finalImageSrc;

                     const navBarName = document.getElementById('navbar-user-name');
                     if(navBarName) navBarName.textContent = newName.split(' ')[0]; // Update welcome message name
                 }, 100);

            } catch (error) {
                showAlert("Ocorreu um erro ao salvar as alterações do perfil.", "danger", alertPlaceholderProfile);
                console.error("Error saving profile:", error);
            }
        });
    } // End Profile Logic Check

}); // End DOMContentLoaded