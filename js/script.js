document.addEventListener('DOMContentLoaded', function () {
    // --- Element References ---
    const loginForm = document.getElementById('loginForm');
    const alertPlaceholderLogin = document.getElementById('alert-placeholder');
    const wrapper = document.getElementById('wrapper');
    const tablesArea = document.getElementById('tables-area');
    const alertPlaceholderDashboard = document.getElementById('dashboard-alert-placeholder');
    // ** References for INLINE kitchen view **
    const adminKitchenViewContainer = document.getElementById('admin-kitchen-view-container');
    const kitchenOrdersDisplayInline = document.getElementById('kitchen-orders-display-inline');
    const kitchenAlertPlaceholderInline = document.getElementById('kitchen-alert-placeholder-inline');
    // ** References for right details column **
    const detailsColumn = document.getElementById('details-column'); // Column to hide for Admin
    const selectedTableTitleElement = document.getElementById('selected-table-title'); // Title within details column
    const productCategoryFilters = document.getElementById('product-category-filters');
    const profileForm = document.getElementById('profileForm'); // For profile page check


    // --- Utility Functions ---
    function showAlert(message, type = 'info', placeholder = alertPlaceholderDashboard) { // Default placeholder
        const targetPlaceholder = placeholder || alertPlaceholderLogin || alertPlaceholderDashboard || kitchenAlertPlaceholderInline || document.getElementById('profile-alert-placeholder');
        if (!targetPlaceholder) { console.error("Alert placeholder not found!"); return; }
        targetPlaceholder.innerHTML = ''; // Clear previous
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show m-0`;
        alertDiv.setAttribute('role', 'alert');
        alertDiv.appendChild(document.createTextNode(message)); // Safe text insertion
        const closeButton = document.createElement('button');
        closeButton.type = 'button'; closeButton.className = 'btn-close';
        closeButton.setAttribute('data-bs-dismiss', 'alert'); closeButton.setAttribute('aria-label', 'Close');
        alertDiv.appendChild(closeButton);
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
            const username = usernameInput.value.trim();
            const password = passwordInput.value;
            if (alertPlaceholderLogin) alertPlaceholderLogin.innerHTML = '';
            if (!username || !password) { showAlert('Preencha usuário e senha.', 'warning', alertPlaceholderLogin); return; }
            const validUsers = {
                'admin': { password: '123', data: { name: 'Administrador', role: 'Admin' } },
                'garcom': { password: '123', data: { name: 'Garçom Teste', role: 'Garçom' } }
            };
            let user = null;
            if (validUsers.hasOwnProperty(username) && validUsers[username].password === password) { user = validUsers[username].data; }
            if (user) {
                showAlert('Login OK! Redirecionando...', 'success', alertPlaceholderLogin);
                try { localStorage.setItem('loggedInUser', JSON.stringify(user)); localStorage.setItem('loggedInUsername', username); setTimeout(() => { window.location.href = 'dashboard.html'; }, 500); }
                catch (e) { showAlert('Erro ao salvar sessão local.', 'danger', alertPlaceholderLogin); console.error("LocalStorage error:", e); }
            } else { showAlert('Usuário ou senha inválidos.', 'danger', alertPlaceholderLogin); }
        }
    }


    // --- Dashboard Page Logic ---
    if (wrapper && tablesArea && selectedTableTitleElement) { // Check for essential elements

        // --- Element References (Dashboard Specific) ---
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

        // --- State ---
        const TOTAL_TABLES = 15;
        let tablesData = {};
        let selectedTableId = null;
        const allProducts = [ { id: 1, name: 'Coca-Cola Lata', price: 5.00, category: 'bebidas' }, { id: 2, name: 'Suco Laranja 300ml', price: 7.00, category: 'bebidas' }, { id: 3, name: 'Água Mineral c/ Gás', price: 4.00, category: 'bebidas' }, { id: 4, name: 'Cerveja Long Neck', price: 8.00, category: 'bebidas' }, { id: 10, name: 'PF Frango Grelhado', price: 25.00, category: 'pratos' }, { id: 11, name: 'Parmegiana de Carne', price: 35.00, category: 'pratos' }, { id: 12, name: 'Salada Caesar', price: 22.00, category: 'pratos' }, { id: 20, name: 'X-Burger Simples', price: 15.00, category: 'lanches' }, { id: 21, name: 'X-Salada Completo', price: 18.50, category: 'lanches' }, { id: 22, name: 'Misto Quente', price: 10.00, category: 'lanches' }, { id: 30, name: 'Batata Frita Média', price: 20.00, category: 'porcoes' }, { id: 31, name: 'Calabresa Acebolada', price: 28.00, category: 'porcoes' }, { id: 32, name: 'Frango a Passarinho', price: 32.00, category: 'porcoes' }, ];
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
        const loggedInUsername = localStorage.getItem('loggedInUsername');

        // --- Auth & Init ---
        if (!loggedInUser || !loggedInUsername) { window.location.href = 'index.html'; }
        else { initializeDashboard(); }

        function initializeDashboard() {
            if (navbarUserName) navbarUserName.textContent = loggedInUser.name.split(' ')[0];
            if (navbarProfileImage && loggedInUsername) { const img = localStorage.getItem(`userProfileImage_${loggedInUsername}_dataUrl`); navbarProfileImage.src = img || 'assets/profile.png'; }
            loadTablesData();
            renderTableButtons();
            setupAdminOrGarcomView(); // Critical: setup view *before* rendering details
            renderCategoryFilters();
            if (loggedInUser.role !== 'Admin' && productCategoryFilters) { const btn = productCategoryFilters.querySelector('.btn-filter.active'); renderProductList(btn?.dataset.category); }
            setupEventListeners(); // Setup base listeners
            updateActionButtonsVisibility(); // Init action button visibility
            if (loggedInUser.role !== 'Admin') displayTableOrder(null); // Init details pane for Garcom
        }

        function setupAdminOrGarcomView() {
            if (loggedInUser.role === 'Admin') {
                if(detailsColumn) detailsColumn.style.display = 'none';
                if(adminKitchenViewContainer) adminKitchenViewContainer.style.display = 'block';
                renderAdminKitchenView();
                document.body.classList.add('admin-view');
            } else { // Garcom view
                if(detailsColumn) detailsColumn.style.display = 'block'; // Ensure visible
                if(adminKitchenViewContainer) adminKitchenViewContainer.style.display = 'none'; // Ensure hidden
                document.body.classList.remove('admin-view');
            }
         }

        // --- Render UI Components ---
        function renderCategoryFilters() { /* ... unchanged ... */
            if (!productCategoryFilters || loggedInUser.role === 'Admin') return; productCategoryFilters.innerHTML = '';
            const categories = [ { key: 'bebidas', title: 'Bebidas', icon: 'bi-cup-straw' }, { key: 'pratos', title: 'Pratos', icon: 'bi-egg-fried' },{ key: 'lanches', title: 'Lanches', icon: 'bi-badge-sd-fill' }, { key: 'porcoes', title: 'Porções', icon: 'bi-basket-fill' }];
            if (categories.length > 0) { categories.forEach((cat, i) => { const btn = document.createElement('button'); btn.className = `btn btn-filter btn-sm ${i === 0 ? 'active' : ''}`; btn.dataset.category = cat.key; btn.title = cat.title; btn.innerHTML = `<i class="bi ${cat.icon}"></i>`; btn.addEventListener('click', handleCategoryFilterClick); productCategoryFilters.appendChild(btn); });} else { productCategoryFilters.innerHTML = '<p>No Cat.</p>'; }}
        function renderTableButtons() { /* ... unchanged ... */
             if (!tablesArea) return; tablesArea.innerHTML = ''; if (Object.keys(tablesData).length === 0) { tablesArea.innerHTML = '<p>Erro</p>'; return; } const ids = Object.keys(tablesData).map(id => parseInt(id)).sort((a, b) => a - b); ids.forEach(id => { const t = tablesData[id]; if (!t) return; const btn = document.createElement('button'); btn.className = `btn table-button shadow-sm status-${(t.status || 'livre').toLowerCase()}`; if (id.toString() === selectedTableId) btn.classList.add('selected'); btn.dataset.tableId = id; updateTableButtonDisplay(btn, id, t); btn.addEventListener('click', handleTableClick); tablesArea.appendChild(btn); }); if (tablesArea.children.length === 0) tablesArea.innerHTML = '<p>Vazio</p>';}
        function renderProductList(category = null) { /* ... unchanged ... */
             if (loggedInUser.role === 'Admin') { if (productListBody) productListBody.innerHTML = ''; if (productCategoryName) productCategoryName.textContent = 'N/A'; return; }; if (!category && productCategoryFilters) { const b = productCategoryFilters.querySelector('.btn-filter.active'); category = b?.dataset.category || null; } const prods = category ? allProducts.filter(p => p.category === category) : allProducts; renderProductTable(prods); if(productCategoryName) { const ci = [{key:'bebidas',title:'Bebidas'},{key:'pratos',title:'Pratos'},{key:'lanches',title:'Lanches'},{key:'porcoes',title:'Porções'}].find(c=>c.key===category); productCategoryName.textContent = ci ? ci.title : 'Produtos'; }}
        function renderProductTable(products) { /* ... unchanged ... */
              if (!productListBody) return; productListBody.innerHTML = ''; if (products.length === 0) { const cn = productCategoryName ? productCategoryName.textContent : ''; productListBody.innerHTML = `<tr><td colspan=3 class=text-muted text-center p-3 fst-italic>Nada (${cn}).</td></tr>`; } else { products.forEach(p => { const tr = document.createElement('tr'); tr.innerHTML = `<td>${p.name}</td> <td class=text-end>${formatCurrency(p.price)}</td> <td class=text-center><button class="btn btn-sm btn-success add-item-btn" data-product-id="${p.id}" data-product-name="${p.name}" data-product-price="${p.price}" title=Adicionar><i class="bi bi-plus-lg"></i></button></td>`; tr.querySelector('.add-item-btn').addEventListener('click', handleAddItem); productListBody.appendChild(tr); }); }}
        function renderTableTitleWithPeopleCount(tableId, table) { /* ... unchanged ... */
             if (!selectedTableTitleElement) return; if (!tableId || !table) { selectedTableTitleElement.innerHTML = 'Selecione Mesa'; return; } const count = table.peopleCount || 0; const canAdj = loggedInUser.role === 'Garcom' && table.status !== 'Fechamento'; let html = `Mesa ${tableId} `; if (canAdj) { const dis = count <= 0 ? 'disabled' : ''; html += `<span class="people-controls-inline ms-2"><button class="btn btn-people-adjust" data-table-id="${tableId}" data-action="decrease" ${dis}><i class="bi bi-dash"></i></button><span id="people-display-inline" class="mx-2">${count}</span><button class="btn btn-people-adjust" data-table-id="${tableId}" data-action="increase"><i class="bi bi-plus"></i></button><span class="ms-1 small text-muted">Pessoas</span></span>`; } else if (count > 0) { html += ` <span class=text-muted small>(${count} Pessoas)</span>`; } selectedTableTitleElement.innerHTML = html; /* Listeners handled by delegation */}
        function renderAdminKitchenView() { /* ... unchanged (renders kitchen cards inline) ... */
            if (loggedInUser.role !== 'Admin' || !kitchenOrdersDisplayInline) return; const data = tablesData; kitchenOrdersDisplayInline.innerHTML = ''; let found = false; const ids = Object.keys(data).map(id => parseInt(id)).sort((a, b) => a - b); ids.forEach(id => { const t = data[id]; if (t && t.status !== 'Livre' && t.items && t.items.length > 0) { found = true; const card = document.createElement('div'); card.className = 'col-md-6 col-lg-4'; let itemsHTML = '<ul class="list-unstyled kitchen-item-list">'; t.items.forEach(it => { itemsHTML += `<li><i class="bi bi-dot"></i> ${it.name || '?'}</li>`; }); itemsHTML += '</ul>'; let peopleTxt = t.peopleCount > 0 ? `<span class="badge bg-secondary ms-2">${t.peopleCount} P</span>` : ''; const statusCls = t.status === 'Fechamento' ? 'bg-warning text-dark' : 'bg-light text-dark'; card.innerHTML = `<div class="card kitchen-order-card shadow-sm mb-3"><div class="card-header bg-primary text-white d-flex justify-content-between align-items-center"><h5 class=mb-0>M ${id}${peopleTxt}</h5><span class="badge ${statusCls}">${t.status}</span></div><div class=card-body>${itemsHTML}</div></div>`; kitchenOrdersDisplayInline.appendChild(card); } }); if (!found) { kitchenOrdersDisplayInline.innerHTML = '<div class=col-12><div class="alert alert-info text-center">Nada ativo.</div></div>'; }}

        // --- Event Handlers ---
        function handleCategoryFilterClick(e) { /* ... unchanged ... */ const btn=e.currentTarget; if(!btn || loggedInUser.role === 'Admin') return; productCategoryFilters.querySelectorAll('.btn-filter').forEach(b=>b.classList.remove('active')); btn.classList.add('active'); renderProductList(btn.dataset.category); }
        function handleTableClick(event) { /* ... unchanged ... */ const btn=event.currentTarget; const id = btn.dataset.tableId; document.querySelectorAll('.table-button.selected').forEach(b => b.classList.remove('selected')); btn.classList.add('selected'); selectedTableId = id; if (loggedInUser.role !== 'Admin') { displayTableOrder(id); updateActionButtonsVisibility(id); } }
        function handlePeopleAdjust(button) { /* ... unchanged ... */ if (!button) return; const id = button.dataset.tableId; const action = button.dataset.action; if (!id || !tablesData[id]) return; let count = tablesData[id].peopleCount || 0; if (action === 'increase') { count++; } else if (action === 'decrease' && count > 0) { count--; } tablesData[id].peopleCount = count; renderTableTitleWithPeopleCount(id, tablesData[id]); updateTableButtonStatus(id); saveTablesData(); }
        function handleAddItem(event) { /* ... unchanged ... */ if (loggedInUser.role === 'Admin') return; if (!selectedTableId) { showAlert('Selecione mesa.', 'warning'); return; } const t=tablesData[selectedTableId]; if(!t){showAlert('Mesa inválida.','danger');return;} if (t.status==='Fechamento'){showAlert('Mesa fechando.','warning');return;} const btn=event.currentTarget; const id=btn.dataset.productId; const nm=btn.dataset.productName; const pr=parseFloat(btn.dataset.productPrice); if(isNaN(pr)){showAlert('Preço inválido.','danger');return;} t.items.push({id:id,name:nm,price:pr}); t.total=(t.total||0)+pr; t.status='Ocupada'; if(t.peopleCount<=0){t.peopleCount=1;} updateTableButtonStatus(selectedTableId); displayTableOrder(selectedTableId); updateActionButtonsVisibility(selectedTableId); saveTablesData(); }
        function handleRemoveItem(event) { /* ... unchanged ... */ if(loggedInUser.role==='Admin')return; if(!selectedTableId||!tablesData[selectedTableId])return; const btn=event.currentTarget; const idx=parseInt(btn.dataset.itemIndex); const t=tablesData[selectedTableId]; if(t.status==='Fechamento')return; if(!isNaN(idx)&&idx>=0&&idx<t.items.length){t.items.splice(idx,1);t.total=t.items.reduce((s,i)=>s+(i.price||0),0);if(t.items.length===0){t.status='Livre';t.total=0;t.peopleCount=0;}updateTableButtonStatus(selectedTableId); displayTableOrder(selectedTableId); updateActionButtonsVisibility(selectedTableId);saveTablesData();} }
        function handleCloseAccount() { /* ... unchanged ... */ if(loggedInUser.role !=='Garcom'||!selectedTableId||!tablesData[selectedTableId]) return; const t=tablesData[selectedTableId]; if(t.status==='Ocupada'&&t.items.length>0){t.status='Fechamento'; updateTableButtonStatus(selectedTableId); displayTableOrder(selectedTableId); updateActionButtonsVisibility(selectedTableId); saveTablesData(); showAlert(`Mesa ${selectedTableId} para fechar.`, 'info');}}
        function handleReopenTable() { /* ... unchanged ... */ if(loggedInUser.role !=='Garcom'||!selectedTableId||!tablesData[selectedTableId]) return; const t=tablesData[selectedTableId]; if(t.status==='Fechamento'){t.status='Ocupada'; updateTableButtonStatus(selectedTableId); displayTableOrder(selectedTableId); updateActionButtonsVisibility(selectedTableId); saveTablesData(); showAlert(`Mesa ${selectedTableId} reaberta.`, 'success');}}
        function handleFinalizeTable() { /* ... unchanged ... */ if(loggedInUser.role !=='Garcom'||!selectedTableId||!tablesData[selectedTableId]) return; const t=tablesData[selectedTableId]; if(t.status==='Fechamento'){generateReceipt(selectedTableId,t); t.items=[]; t.total=0.0; t.status='Livre'; t.peopleCount=0; updateTableButtonStatus(selectedTableId); displayTableOrder(selectedTableId); updateActionButtonsVisibility(selectedTableId); saveTablesData(); showAlert(`Mesa ${selectedTableId} finalizada.`, 'success');}}
        function handleLogout(e) { /* ... unchanged ... */ e.preventDefault(); localStorage.removeItem('loggedInUser');localStorage.removeItem('loggedInUsername'); window.location.href = 'index.html';}

        // --- UI Update Helpers ---
        function displayTableOrder(tableId) { /* ... unchanged ... */ if(loggedInUser.role==='Admin')return; const t=tableId?tablesData[tableId]:null; renderTableTitleWithPeopleCount(tableId,t); if(!orderItemsList||!orderTotalSpan)return; orderItemsList.innerHTML=''; if(t&&t.items.length>0){t.items.forEach((it,idx)=>{const li=document.createElement('li');li.classList.add('list-group-item');const cls=t.status==='Fechamento';const rm=!cls;li.innerHTML=`<span class=item-name>${it.name||'?'}</span><span class=item-price>${formatCurrency(it.price||0)}</span><button class="btn btn-sm btn-outline-danger remove-item-btn" data-item-index="${idx}" ${!rm?'disabled':''}><i class="bi bi-trash3"></i></button>`;if(rm){li.querySelector('.remove-item-btn').addEventListener('click',handleRemoveItem);}orderItemsList.appendChild(li);});} else if(t){orderItemsList.innerHTML=`<li class="list-group-item text-muted text-center p-3">M ${t.status}...</li>`;} else{orderItemsList.innerHTML='<li class="list-group-item text-muted text-center p-3">...</li>';} orderTotalSpan.textContent=formatCurrency(t?.total||0);}
        function updateTableButtonStatus(tableId) { /* ... unchanged ... */ const btn = tablesArea?.querySelector(`.table-button[data-table-id="${tableId}"]`); if(!btn||!tablesData[tableId]) return; const t = tablesData[tableId]; const cls=`status-${(t.status||'livre').toLowerCase()}`; updateTableButtonDisplay(btn, tableId, t); btn.classList.remove('status-livre','status-ocupada','status-fechamento'); btn.classList.add(cls); }
        function updateActionButtonsVisibility(tableId = selectedTableId) { /* ... unchanged - handles Fechar visibility correctly ... */ if(loggedInUser.role === 'Admin' || !closeAccountBtn || !reopenTableBtn || !finalizeTableBtn) { /* Hide all if admin or buttons missing */ if(closeAccountBtn) closeAccountBtn.classList.add('d-none'); if(reopenTableBtn) reopenTableBtn.classList.add('d-none'); if(finalizeTableBtn) finalizeTableBtn.classList.add('d-none'); return; } const t=tableId?tablesData[tableId]:null; closeAccountBtn.classList.add('d-none'); reopenTableBtn.classList.add('d-none'); finalizeTableBtn.classList.add('d-none'); if(t){ if(t.status==='Ocupada'&&t.items.length>0){ closeAccountBtn.classList.remove('d-none'); } else if(t.status==='Fechamento'){ reopenTableBtn.classList.remove('d-none'); finalizeTableBtn.classList.remove('d-none'); } } }

        // --- Data Persistence ---
        function loadTablesData() { /* ... unchanged ... */ const d=localStorage.getItem('restaurantTablesData'); tablesData={}; if(d){try{const p=JSON.parse(d);if(typeof p==='object'&&p!==null)tablesData=p;}catch(e){console.error(e);}} for(let i=1;i<=TOTAL_TABLES;i++){if(!tablesData[i]||typeof tablesData[i]!=='object'){tablesData[i]={items:[],total:0.0,status:'Livre',peopleCount:0};}else{if(!Array.isArray(tablesData[i].items))tablesData[i].items=[];if(!tablesData[i].status)tablesData[i].status=tablesData[i].items.length>0?'Ocupada':'Livre';if(typeof tablesData[i].peopleCount!=='number'||isNaN(tablesData[i].peopleCount))tablesData[i].peopleCount=0;tablesData[i].total=tablesData[i].items.reduce((s,it)=>s+(it.price||0),0);}}}
        function saveTablesData() { /* ... unchanged ... */ try {localStorage.setItem('restaurantTablesData', JSON.stringify(tablesData)); if (loggedInUser.role === 'Admin') renderAdminKitchenView(); /* Update kitchen on save */ } catch(e){showAlert('Erro salvando.', 'danger'); console.error(e);}}

        // --- Event Listener Setup ---
        function setupEventListeners() { /* ... unchanged ... */ if (logoutButton) logoutButton.addEventListener('click', handleLogout); if (selectedTableTitleElement && loggedInUser.role === 'Garcom') { selectedTableTitleElement.addEventListener('click', function(event) { const adjustButton = event.target.closest('.btn-people-adjust'); if (adjustButton) { handlePeopleAdjust(adjustButton); } }); } /* Action listeners added based on role */ if(loggedInUser.role === 'Garcom'){ if (closeAccountBtn) closeAccountBtn.addEventListener('click', handleCloseAccount); if (reopenTableBtn) reopenTableBtn.addEventListener('click', handleReopenTable); if (finalizeTableBtn) finalizeTableBtn.addEventListener('click', handleFinalizeTable); }}

        // --- Receipt ---
        function generateReceipt(tableId, tableData) { /* ... unchanged ... */ const n=new Date(); const dt=n.toLocaleString('pt-BR'); let r=`<html><head><title>R ${tableId}</title><style>/*...*/body{font-family:monospace;margin:15px;font-size:10pt}h2,p.center{text-align:center;margin:3px 0}hr{border:none;border-top:1px dashed #000;margin:10px 0}table{width:100%;border-collapse:collapse;margin-top:5px}td{padding:2px 0}td:last-child{text-align:right}.total{font-weight:bold;margin-top:10px;text-align:right}@media print{button{display:none}}</style></head><body><h2>BC</h2><p class=center>RF,123</p><p class=center>CNPJ:..</p><hr><h2>M ${tableId}</h2><p class=center>D/H:${dt}</p><p class=center>P:${tableData.peopleCount||'N/A'}</p><hr><table><thead><tr><th>I</th><th>V</th></tr></thead><tbody>`;tableData.items.forEach(i=>{r+=`<tr><td>${i.name||'?'}</td><td>${formatCurrency(i.price||0)}</td></tr>`;});r+=`</tbody></table><hr><div class=total>T:${formatCurrency(tableData.total||0)}</div><hr><p class=center>OK!</p><div style=text-align:center;margin-top:20px><button onclick=window.print()>Imp</button> <button onclick=window.close()>Fec</button></div></body></html>`;const rw=window.open('','_blank','width=300,height=550');if(rw){rw.document.write(r);rw.document.close();}else{showAlert('Popup?','warning');}}

    } // End Dashboard Logic

    // --- Profile Page Logic (Minimal, Unchanged) ---
    if (profileForm) { /* ... unchanged ... */
        const nameInput = document.getElementById('profileName'); const roleInput = document.getElementById('profileRole'); const passwordInput = document.getElementById('profilePassword'); const confirmPasswordInput = document.getElementById('profileConfirmPassword'); const imageInput = document.getElementById('profileImageInput'); const currentImage = document.getElementById('current-profile-image'); const alertPlaceholderProfile = document.getElementById('profile-alert-placeholder'); const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser')); const loggedInUsername = localStorage.getItem('loggedInUsername');
        if (loggedInUser && loggedInUsername) { if(nameInput) nameInput.value = loggedInUser.name || ''; if(roleInput) roleInput.value = loggedInUser.role || ''; const imgKey = `userProfileImage_${loggedInUsername}_dataUrl`; const savedImg = localStorage.getItem(imgKey); if (savedImg && currentImage) { currentImage.src = savedImg; } else if (currentImage) { currentImage.src = 'assets/profile.png'; } } else { showAlert("Sessão inválida.", "warning", alertPlaceholderProfile); setTimeout(() => { window.location.href = 'index.html'; }, 2000); }
        if (imageInput && currentImage) { imageInput.addEventListener('change', function(event) { const f=event.target.files[0]; if (f&&f.type.startsWith('image/')){ const r=new FileReader(); r.onload=function(e){currentImage.src=e.target.result;}; r.onerror=function(e){showAlert("Err img.", "danger", alertPlaceholderProfile);}; r.readAsDataURL(f); } else if (f) { showAlert("Use PNG/JPG.", "warning", alertPlaceholderProfile); imageInput.value='';}}); }
        profileForm.addEventListener('submit', (e) => { e.preventDefault(); if (!loggedInUsername) {showAlert("No user.", "danger", alertPlaceholderProfile); return;} if(alertPlaceholderProfile) alertPlaceholderProfile.innerHTML=''; const n=nameInput.value.trim(); const p=passwordInput.value; const cp=confirmPasswordInput.value; const imgF=imageInput.files[0]; const imgD=currentImage.src; if(!n){showAlert("Nome?","warning",alertPlaceholderProfile);return;} if(p&&p!==cp){showAlert("Pwd diff.","warning",alertPlaceholderProfile);return;} if(p&&p.length<3){showAlert("Pwd short.","warning",alertPlaceholderProfile);return;} try { loggedInUser.name=n; if(p){loggedInUser.pwd_demo=p;} localStorage.setItem('loggedInUser',JSON.stringify(loggedInUser)); const imgKey=`userProfileImage_${loggedInUsername}_dataUrl`; if(imgF&&imgD&&imgD.startsWith('data:image')){localStorage.setItem(imgKey,imgD);} else if(!imgF&&imgD.includes('assets/profile.png')){localStorage.removeItem(imgKey);} showAlert("OK!","success",alertPlaceholderProfile); passwordInput.value='';confirmPasswordInput.value='';imageInput.value=''; setTimeout(()=>{const navImg=document.getElementById('navbar-profile-image');const finalSrc=localStorage.getItem(imgKey)||'assets/profile.png';if(navImg)navImg.src=finalSrc; const navName=document.getElementById('navbar-user-name'); if(navName)navName.textContent=n.split(' ')[0];},100); } catch (error) { showAlert("Err save.","danger",alertPlaceholderProfile);console.error(error);}});
    }

}); // End DOMContentLoaded