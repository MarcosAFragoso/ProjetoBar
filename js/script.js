document.addEventListener('DOMContentLoaded', function () {
    // --- Element References (Common & Dashboard) ---
    const loginForm = document.getElementById('loginForm');
    const alertPlaceholderLogin = document.getElementById('alert-placeholder');
    const wrapper = document.getElementById('wrapper');
    const tablesArea = document.getElementById('tables-area');
    const alertPlaceholderDashboard = document.getElementById('dashboard-alert-placeholder');
    const adminKitchenViewContainer = document.getElementById('admin-kitchen-view-container');
    const kitchenOrdersDisplayInline = document.getElementById('kitchen-orders-display-inline');
    const kitchenAlertPlaceholderInline = document.getElementById('kitchen-alert-placeholder-inline');
    const detailsColumn = document.getElementById('details-column');
    const selectedTableTitleElement = document.getElementById('selected-table-title');
    const orderDetails = document.getElementById('order-details');
    const orderItemsList = document.getElementById('order-items');
    const orderTotalSpan = document.getElementById('order-total');
    const productCategoryFilters = document.getElementById('product-category-filters');
    const addProductCard = document.getElementById('add-product-card');
    const productListBody = document.getElementById('product-list-body');
    const productCategoryName = document.getElementById('product-category-name');
    const closeAccountBtn = document.getElementById('close-account-btn');
    const reopenTableBtn = document.getElementById('reopen-table-btn');
    const finalizeTableBtn = document.getElementById('finalize-table-btn');
    const logoutButton = document.getElementById('logout-button');
    const navbarUserName = document.getElementById('navbar-user-name');
    const navbarProfileImage = document.getElementById('navbar-profile-image');
    // Profile Page elements (checked later)
    const profileForm = document.getElementById('profileForm');

    // --- Utility Functions ---
    function showAlert(message, type = 'info', placeholder = alertPlaceholderDashboard) {
        const targetPlaceholder = placeholder || alertPlaceholderLogin || document.getElementById('profile-alert-placeholder') || kitchenAlertPlaceholderInline;
        if (!targetPlaceholder) { console.error("Target placeholder for alert not found."); return; }
        targetPlaceholder.innerHTML = '';
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show m-0`;
        alertDiv.setAttribute('role', 'alert');
        alertDiv.appendChild(document.createTextNode(message));
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

    // --- Login Logic ---
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
        function handleLoginSubmit(event) {
            event.preventDefault();
            const usernameInput = document.getElementById('username');
            const passwordInput = document.getElementById('password');
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
                    localStorage.setItem('loggedInUsername', username);
                    setTimeout(() => { window.location.href = 'dashboard.html'; }, 500);
                } catch (e) { showAlert('Erro ao salvar sessão local.', 'danger', alertPlaceholderLogin); console.error("LocalStorage error:", e); }
            } else { showAlert('Usuário ou senha inválidos.', 'danger', alertPlaceholderLogin); }
        }
    }

    // --- Dashboard Logic (Only run if essential elements and logged-in user exist) ---
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    const loggedInUsername = localStorage.getItem('loggedInUsername');

    if (wrapper && tablesArea && selectedTableTitleElement && loggedInUser && loggedInUsername) {

        // --- Dashboard State ---
        const TOTAL_TABLES = 15;
        let tablesData = {};
        let selectedTableId = null;
        const allProducts = [ { id: 1, name: 'Coca-Cola Lata', price: 5.00, category: 'bebidas' }, { id: 2, name: 'Suco Laranja 300ml', price: 7.00, category: 'bebidas' }, { id: 3, name: 'Água Mineral c/ Gás', price: 4.00, category: 'bebidas' }, { id: 4, name: 'Cerveja Long Neck', price: 8.00, category: 'bebidas' }, { id: 10, name: 'PF Frango Grelhado', price: 25.00, category: 'pratos' }, { id: 11, name: 'Parmegiana de Carne', price: 35.00, category: 'pratos' }, { id: 12, name: 'Salada Caesar', price: 22.00, category: 'pratos' }, { id: 20, name: 'X-Burger Simples', price: 15.00, category: 'lanches' }, { id: 21, name: 'X-Salada Completo', price: 18.50, category: 'lanches' }, { id: 22, name: 'Misto Quente', price: 10.00, category: 'lanches' }, { id: 30, name: 'Batata Frita Média', price: 20.00, category: 'porcoes' }, { id: 31, name: 'Calabresa Acebolada', price: 28.00, category: 'porcoes' }, { id: 32, name: 'Frango a Passarinho', price: 32.00, category: 'porcoes' }, ];

        // --- Initialization ---
        function initializeDashboard() {
            console.log('Initializing Dashboard for role:', loggedInUser.role); // Debug log
            if (navbarUserName) navbarUserName.textContent = loggedInUser.name.split(' ')[0];
            if (navbarProfileImage) { const img = localStorage.getItem(`userProfileImage_${loggedInUsername}_dataUrl`); navbarProfileImage.src = img || 'assets/profile.png'; }
            loadTablesData();
            renderTableButtons();           // Render tables for everyone
            setupAdminOrGarcomView();       // Adjust view based on role AFTER tables are rendered
            renderCategoryFilters();        // Render filters only if Garcom
            // Render initial product list ONLY if Garcom
            if (loggedInUser.role === 'Garcom' && productCategoryFilters) {
                 const firstActiveButton = productCategoryFilters.querySelector('.btn-filter.active');
                 renderProductList(firstActiveButton?.dataset.category);
            }
            setupEventListeners();          // Add listeners AFTER elements are potentially rendered/adjusted
            updateActionButtonsVisibility(); // Set initial visibility
             // Initialize right pane ONLY if Garcom (Admin pane is handled by setupAdminOrGarcomView)
            if (loggedInUser.role === 'Garcom') displayTableOrder(null);
        }

        // --- UI Adjustments based on Role ---
        function setupAdminOrGarcomView() {
             console.log('Setting up view for:', loggedInUser.role); // Debug
             if (loggedInUser.role === 'Admin') {
                 if(detailsColumn) detailsColumn.style.display = 'none';
                 if(adminKitchenViewContainer) adminKitchenViewContainer.style.display = 'block';
                 renderAdminKitchenView();
                 document.body.classList.add('admin-view');
             } else { // Garcom
                 if(detailsColumn) detailsColumn.style.display = 'block';
                 if(adminKitchenViewContainer) adminKitchenViewContainer.style.display = 'none';
                 document.body.classList.remove('admin-view');
             }
         }

        // --- Event Listener Setup ---
        function setupEventListeners() {
             console.log("Setting up event listeners..."); // Debug
             if (logoutButton) { // Check if button exists
                 console.log("Attaching logout listener"); // Debug
                 logoutButton.removeEventListener('click', handleLogout); // Prevent duplicates
                 logoutButton.addEventListener('click', handleLogout);
             } else {
                 console.error("Logout button not found!");
             }

            // Use delegation for people adjust buttons (safer)
             if (selectedTableTitleElement && loggedInUser.role === 'Garcom') {
                console.log("Attaching people adjust delegation listener"); // Debug
                // Check if listener already exists (simple check)
                if (!selectedTableTitleElement.hasAttribute('data-listener-attached')) {
                     selectedTableTitleElement.addEventListener('click', function(event) {
                         const adjustButton = event.target.closest('.btn-people-adjust');
                         if (adjustButton) {
                             console.log("People adjust button clicked:", adjustButton.dataset.action); // Debug
                             handlePeopleAdjust(adjustButton);
                         }
                     });
                     selectedTableTitleElement.setAttribute('data-listener-attached', 'true'); // Mark as attached
                }
             }

             // Attach listeners to static Garcom action buttons *only* if Garcom
             if (loggedInUser.role === 'Garcom') {
                console.log("Attaching Garcom action listeners"); // Debug
                if (closeAccountBtn) {
                    closeAccountBtn.removeEventListener('click', handleCloseAccount); // Prevent duplicates
                    closeAccountBtn.addEventListener('click', handleCloseAccount);
                }
                if (reopenTableBtn) {
                     reopenTableBtn.removeEventListener('click', handleReopenTable);
                     reopenTableBtn.addEventListener('click', handleReopenTable);
                 }
                if (finalizeTableBtn) {
                    finalizeTableBtn.removeEventListener('click', handleFinalizeTable);
                     finalizeTableBtn.addEventListener('click', handleFinalizeTable);
                 }
             }
        }


        // --- Logout Handler ---
        function handleLogout(e) {
            console.log("Logout action triggered"); // Debug
            e.preventDefault();
            localStorage.removeItem('loggedInUser');
            localStorage.removeItem('loggedInUsername');
             // Keep table data & profile pics by default
            window.location.href = 'index.html';
        }


        // --- Data Handling ---
        function loadTablesData() { /* Unchanged, see previous versions */
             const savedData = localStorage.getItem('restaurantTablesData'); tablesData = {};
             if (savedData) { try { const parsedData = JSON.parse(savedData); if (typeof parsedData === 'object' && parsedData !== null) tablesData = parsedData; } catch (error) { console.error("Error parsing table data:", error); } }
             for (let i = 1; i <= TOTAL_TABLES; i++) { if (!tablesData[i] || typeof tablesData[i] !== 'object') { tablesData[i] = { items: [], total: 0.0, status: 'Livre', peopleCount: 0 }; } else { if (!Array.isArray(tablesData[i].items)) tablesData[i].items = []; if (!tablesData[i].status) tablesData[i].status = tablesData[i].items.length > 0 ? 'Ocupada' : 'Livre'; if (typeof tablesData[i].peopleCount !== 'number' || isNaN(tablesData[i].peopleCount)) tablesData[i].peopleCount = 0; tablesData[i].total = tablesData[i].items.reduce((sum, item) => sum + (item.price || 0), 0); } }
         }
        function saveTablesData() { /* Unchanged, calls renderAdminKitchenView if Admin */
             try { localStorage.setItem('restaurantTablesData',JSON.stringify(tablesData)); if (loggedInUser.role === 'Admin' && adminKitchenViewContainer) renderAdminKitchenView(); } catch(e){showAlert('Erro salvando.','danger'); console.error(e);}
         }

        // --- UI Rendering Functions ---
        function renderTableButtons() {
             console.log("Rendering table buttons..."); // Debug
             if (!tablesArea) return;
             tablesArea.innerHTML = ''; // Clear existing buttons
             if (Object.keys(tablesData).length === 0) { tablesArea.innerHTML = '<p class="text-muted">Nenhuma mesa</p>'; return; }
             const sortedTableIds = Object.keys(tablesData).map(id => parseInt(id)).sort((a, b) => a - b);
             sortedTableIds.forEach(id => {
                 const table = tablesData[id];
                 if (!table) return;
                 const button = document.createElement('button');
                 button.className = `btn table-button shadow-sm status-${(table.status || 'livre').toLowerCase()}`;
                 if (id.toString() === selectedTableId) button.classList.add('selected');
                 button.dataset.tableId = id;
                 updateTableButtonDisplay(button, id, table);
                  // Add listener directly here for simplicity
                 button.removeEventListener('click', handleTableClick); // Avoid duplicates if re-rendering
                 button.addEventListener('click', handleTableClick);
                 tablesArea.appendChild(button);
             });
             console.log(`${tablesArea.children.length} table buttons rendered.`); // Debug
        }

        function updateTableButtonDisplay(button, tableId, table) { let p = table.peopleCount>0?` (${table.peopleCount} P)`:''; let s = table.status||'?'; button.innerHTML = `<span class="table-button-main-text">Mesa ${tableId}</span><span class="table-button-sub-text">${s}${p}</span>`;}
        function renderCategoryFilters() { if (!productCategoryFilters||loggedInUser.role==='Admin')return; productCategoryFilters.innerHTML = ''; const cats = [{k:'bebidas',t:'Bebidas',i:'bi-cup-straw'},{k:'pratos',t:'Pratos',i:'bi-egg-fried'},{k:'lanches',t:'Lanches',i:'bi-badge-sd-fill'},{k:'porcoes',t:'Porções',i:'bi-basket-fill'}]; if(cats.length>0){cats.forEach((cat,idx)=>{const b=document.createElement('button');b.className=`btn btn-filter btn-sm ${idx===0?'active':''}`;b.dataset.category=cat.k;b.title=cat.t;b.innerHTML=`<i class="bi ${cat.i}"></i>`;b.addEventListener('click',handleCategoryFilterClick);productCategoryFilters.appendChild(b);});}else{productCategoryFilters.innerHTML='<p>No Cat.</p>';} }
        function renderProductList(category=null) { if(loggedInUser.role==='Admin'){if(productListBody)productListBody.innerHTML='';if(productCategoryName)productCategoryName.textContent='N/A';return;}; if(!category&&productCategoryFilters){const b=productCategoryFilters.querySelector('.btn-filter.active');category=b?.dataset.category||null;} const p=category?allProducts.filter(f=>f.category===category):allProducts;renderProductTable(p);if(productCategoryName){const ci=cats.find(c=>c.k===category);productCategoryName.textContent=ci?ci.t:'Produtos';} /* Assume cats is accessible */}
        function renderProductTable(products) { if(!productListBody)return; productListBody.innerHTML=''; if(products.length===0){const cn=productCategoryName?productCategoryName.textContent:'';productListBody.innerHTML=`<tr><td colspan=3 class="text-muted text-center p-3 fst-italic">Nada (${cn}).</td></tr>`;} else {products.forEach(p=>{const tr=document.createElement('tr');tr.innerHTML=`<td>${p.name}</td> <td class=text-end>${formatCurrency(p.price)}</td> <td class=text-center><button class="btn btn-sm btn-success add-item-btn" data-product-id="${p.id}" data-product-name="${p.name}" data-product-price="${p.price}" title=Add><i class="bi bi-plus-lg"></i></button></td>`;tr.querySelector('.add-item-btn').addEventListener('click',handleAddItem);productListBody.appendChild(tr);});}}
        function renderTableTitleWithPeopleCount(tableId, table) { if (!selectedTableTitleElement)return; if(!tableId||!table){selectedTableTitleElement.innerHTML='Selecione Mesa';return;}const c=table.peopleCount||0;const adj=loggedInUser.role==='Garcom'&&table.status!=='Fechamento';let h=`Mesa ${tableId} `;if(adj){const d=c<=0?'disabled':'';h+=`<span class="people-controls-inline ms-2"><button class="btn btn-people-adjust" data-table-id="${tableId}" data-action=decrease ${d}><i class="bi bi-dash"></i></button><span id=people-display-inline class=mx-2>${c}</span><button class="btn btn-people-adjust" data-table-id="${tableId}" data-action=increase><i class="bi bi-plus"></i></button><span class="ms-1 small text-muted">Pessoas</span></span>`;}else if(c>0){h+=` <span class=text-muted small>(${c} P)</span>`;}selectedTableTitleElement.innerHTML=h;}

        // --- Event Handlers ---
        function handleCategoryFilterClick(e) { const b=e.currentTarget; if(!b||loggedInUser.role==='Admin') return; productCategoryFilters.querySelectorAll('.btn-filter').forEach(btn=>btn.classList.remove('active')); b.classList.add('active'); renderProductList(b.dataset.category); }
        function handleTableClick(event) { const b=event.currentTarget;const id=b.dataset.tableId;console.log(`Table ${id} clicked.`); document.querySelectorAll('.table-button.selected').forEach(btn=>btn.classList.remove('selected')); b.classList.add('selected'); selectedTableId=id; if(loggedInUser.role!=='Admin'){displayTableOrder(id);updateActionButtonsVisibility(id);} }
        function handlePeopleAdjust(button) { if (!button) return; const id = button.dataset.tableId; const act = button.dataset.action; if (!id || !tablesData[id]) return; let cnt = tablesData[id].peopleCount || 0; if (act === 'increase') cnt++; else if (act === 'decrease' && cnt > 0) cnt--; tablesData[id].peopleCount = cnt; renderTableTitleWithPeopleCount(id, tablesData[id]); updateTableButtonStatus(id); saveTablesData(); }
        function handleAddItem(event) { if(loggedInUser.role==='Admin')return;if(!selectedTableId){showAlert('Selecione mesa.','warning');return;} const t=tablesData[selectedTableId];if(!t){showAlert('Mesa inválida.','danger');return;}if(t.status==='Fechamento'){showAlert('Mesa fechando.','warning');return;}const b=event.currentTarget;const id=b.dataset.productId;const nm=b.dataset.productName;const pr=parseFloat(b.dataset.productPrice);if(isNaN(pr)){showAlert('Preço?','danger');return;} t.items.push({id:id,name:nm,price:pr}); t.total=(t.total||0)+pr; t.status='Ocupada';if(t.peopleCount<=0)t.peopleCount=1; updateTableButtonStatus(selectedTableId); displayTableOrder(selectedTableId); updateActionButtonsVisibility(selectedTableId); saveTablesData();}
        function handleRemoveItem(event){if(loggedInUser.role==='Admin')return;if(!selectedTableId||!tablesData[selectedTableId])return;const b=event.currentTarget;const i=parseInt(b.dataset.itemIndex);const t=tablesData[selectedTableId];if(t.status==='Fechamento')return;if(!isNaN(i)&&i>=0&&i<t.items.length){t.items.splice(i,1);t.total=t.items.reduce((s,it)=>s+(it.price||0),0);if(t.items.length===0){t.status='Livre';t.total=0;t.peopleCount=0;}updateTableButtonStatus(selectedTableId);displayTableOrder(selectedTableId);updateActionButtonsVisibility(selectedTableId);saveTablesData();}}
        function handleCloseAccount() {if(loggedInUser.role!=='Garcom'||!selectedTableId||!tablesData[selectedTableId])return;const t=tablesData[selectedTableId];if(t.status==='Ocupada'&&t.items.length>0){t.status='Fechamento';updateTableButtonStatus(selectedTableId);displayTableOrder(selectedTableId);updateActionButtonsVisibility(selectedTableId);saveTablesData();showAlert(`M ${selectedTableId} p/ fechar.`,'info');}}
        function handleReopenTable() {if(loggedInUser.role!=='Garcom'||!selectedTableId||!tablesData[selectedTableId])return;const t=tablesData[selectedTableId];if(t.status==='Fechamento'){t.status='Ocupada';updateTableButtonStatus(selectedTableId);displayTableOrder(selectedTableId);updateActionButtonsVisibility(selectedTableId);saveTablesData();showAlert(`M ${selectedTableId} reaberta.`,'success');}}
        function handleFinalizeTable(){if(loggedInUser.role!=='Garcom'||!selectedTableId||!tablesData[selectedTableId])return;const t=tablesData[selectedTableId];if(t.status==='Fechamento'){generateReceipt(selectedTableId,t); t.items=[]; t.total=0.0; t.status='Livre';t.peopleCount=0;updateTableButtonStatus(selectedTableId);displayTableOrder(selectedTableId);updateActionButtonsVisibility(selectedTableId);saveTablesData();showAlert(`M ${selectedTableId} finalizada.`,'success');}}

        // --- UI Update Helpers ---
        function displayTableOrder(tableId) { if(loggedInUser.role === 'Admin') return; const t = tableId ? tablesData[tableId] : null; renderTableTitleWithPeopleCount(tableId, t); if (!orderItemsList || !orderTotalSpan) return; orderItemsList.innerHTML = ''; if (t && t.items.length > 0) {t.items.forEach((it,idx)=>{const li=document.createElement('li');li.classList.add('list-group-item');const cls=t.status==='Fechamento';const rm=!cls;li.innerHTML=`<span class=item-name>${it.name||'?'}</span><span class=item-price>${formatCurrency(it.price||0)}</span><button class="btn btn-sm btn-outline-danger remove-item-btn" data-item-index="${idx}" ${!rm?'disabled':''}><i class="bi bi-trash3"></i></button>`;if(rm){li.querySelector('.remove-item-btn').addEventListener('click',handleRemoveItem);}orderItemsList.appendChild(li);});} else if (t) { orderItemsList.innerHTML = `<li class="list-group-item text-muted text-center p-3">M ${t.status}...</li>`; } else { orderItemsList.innerHTML = '<li class="list-group-item text-muted text-center p-3">...</li>'; } orderTotalSpan.textContent = formatCurrency(t?.total || 0); }
        function updateTableButtonStatus(tableId) { const btn=tablesArea?.querySelector(`.table-button[data-table-id="${tableId}"]`); if (!btn || !tablesData[tableId]) return; const t=tablesData[tableId]; const cls=`status-${(t.status||'livre').toLowerCase()}`; updateTableButtonDisplay(btn, tableId, t); btn.classList.remove('status-livre','status-ocupada','status-fechamento'); btn.classList.add(cls); }
        function updateActionButtonsVisibility(tableId = selectedTableId) { if (loggedInUser.role === 'Admin') return; /* Buttons don't exist for Admin */ const table = tableId ? tablesData[tableId] : null; if(!closeAccountBtn || !reopenTableBtn || !finalizeTableBtn) { console.error("Action buttons missing!"); return;} /* Safety check */ closeAccountBtn.classList.add('d-none'); reopenTableBtn.classList.add('d-none'); finalizeTableBtn.classList.add('d-none'); if (table) { if (table.status === 'Ocupada' && table.items.length > 0) { closeAccountBtn.classList.remove('d-none'); console.log("Showing close button"); /* Debug */ } else if (table.status === 'Fechamento') { reopenTableBtn.classList.remove('d-none'); finalizeTableBtn.classList.remove('d-none'); console.log("Showing reopen/finalize buttons"); /* Debug */ } else { console.log("Hiding all action buttons for state:", table.status); /* Debug */}}}

        // --- Admin Inline Kitchen View ---
        function renderAdminKitchenView() { if(loggedInUser.role !== 'Admin' || !kitchenOrdersDisplayInline) return; const d = tablesData; kitchenOrdersDisplayInline.innerHTML = ''; let f = false; const ids=Object.keys(d).map(id=>parseInt(id)).sort((a,b)=>a-b); ids.forEach(id => { const t=d[id]; if (t && t.status!=='Livre' && t.items && t.items.length>0) { f=true; const c=document.createElement('div'); c.className='col-md-6 col-lg-4'; let ih='<ul class="list-unstyled kitchen-item-list">'; t.items.forEach(it=>{ih+=`<li><i class="bi bi-dot"></i> ${it.name||'?'}</li>`;}); ih+='</ul>'; let pt=t.peopleCount>0?`<span class="badge bg-secondary ms-2">${t.peopleCount} P</span>`:''; const sc=t.status==='Fechamento'?'bg-warning text-dark':'bg-light text-dark'; c.innerHTML=`<div class="card kitchen-order-card shadow-sm mb-3"><div class="card-header bg-primary text-white d-flex justify-content-between align-items-center"><h5 class=mb-0>M ${id}${pt}</h5><span class="badge ${sc}">${t.status}</span></div><div class=card-body>${ih}</div></div>`; kitchenOrdersDisplayInline.appendChild(c);}}); if (!f) {kitchenOrdersDisplayInline.innerHTML = '<div class=col-12><div class="alert alert-info text-center">Nada ativo.</div></div>';}}

        // --- Receipt Generation ---
        function generateReceipt(tableId, tableData){const n=new Date();const dt=n.toLocaleString('pt-BR');let r=`<html><head><title>R ${tableId}</title><style>body{font-family:monospace;margin:15px;font-size:10pt}h2,p.center{text-align:center;margin:3px 0}hr{border:none;border-top:1px dashed #000;margin:10px 0}table{width:100%;border-collapse:collapse;margin-top:5px}td{padding:2px 0}td:last-child{text-align:right}.total{font-weight:bold;margin-top:10px;text-align:right}@media print{button{display:none}}</style></head><body><h2>BC</h2><p class=center>RF,123</p><p class=center>CNPJ:..</p><hr><h2>M ${tableId}</h2><p class=center>D/H:${dt}</p><p class=center>P:${tableData.peopleCount||'N/A'}</p><hr><table><thead><tr><th>I</th><th>V</th></tr></thead><tbody>`;tableData.items.forEach(i=>{r+=`<tr><td>${i.name||'?'}</td><td>${formatCurrency(i.price||0)}</td></tr>`;});r+=`</tbody></table><hr><div class=total>T:${formatCurrency(tableData.total||0)}</div><hr><p class=center>OK!</p><div style=text-align:center;margin-top:20px><button onclick=window.print()>Imp</button><button onclick=window.close()>Fec</button></div></body></html>`;const rw=window.open('','_blank','width=300,height=550');if(rw){rw.document.write(r);rw.document.close();}else{showAlert('Popup?','warning');}}

        // --- START DASHBOARD ---
        initializeDashboard(); // Call the main init function

    } // End Dashboard Logic Check


    // --- Profile Page Logic ---
    if (profileForm) { const nameInput=document.getElementById('profileName'); const roleInput=document.getElementById('profileRole'); const pwdInput=document.getElementById('profilePassword'); const confPwdInput=document.getElementById('profileConfirmPassword'); const imgInput=document.getElementById('profileImageInput'); const curImg=document.getElementById('current-profile-image'); const alertProf=document.getElementById('profile-alert-placeholder'); const usr=JSON.parse(localStorage.getItem('loggedInUser')); const usrName=localStorage.getItem('loggedInUsername'); if (usr && usrName) { if(nameInput)nameInput.value=usr.name||''; if(roleInput)roleInput.value=usr.role||''; const imgKey=`userProfileImage_${usrName}_dataUrl`; const savedImg=localStorage.getItem(imgKey); if (savedImg&&curImg){curImg.src=savedImg;}else if(curImg){curImg.src='assets/profile.png';} } else { showAlert("Sessão inválida.", "warning", alertProf); setTimeout(() => {window.location.href = 'index.html';}, 2000); } if (imgInput&&curImg){imgInput.addEventListener('change', function(e){const f=e.target.files[0]; if(f&&f.type.startsWith('image/')){const r=new FileReader();r.onload=function(e){curImg.src=e.target.result;};r.onerror=function(e){showAlert("Err img.","danger",alertProf);};r.readAsDataURL(f);} else if(f){showAlert("Use PNG/JPG.","warning",alertProf);imgInput.value='';}}); } profileForm.addEventListener('submit', (e)=>{ e.preventDefault(); if(!usrName){showAlert("No user.","danger",alertProf); return;} if(alertProf)alertProf.innerHTML=''; const n=nameInput.value.trim();const p=pwdInput.value; const cp=confPwdInput.value;const imgF=imgInput.files[0];const imgD=curImg.src; if(!n){showAlert("Nome?","warning",alertProf);return;}if(p&&p!==cp){showAlert("Pwd diff.","warning",alertProf);return;}if(p&&p.length<3){showAlert("Pwd short.","warning",alertProf);return;} try{usr.name=n;if(p){usr.pwd_demo=p;} localStorage.setItem('loggedInUser',JSON.stringify(usr));const imgKey=`userProfileImage_${usrName}_dataUrl`;if(imgF&&imgD&&imgD.startsWith('data:image')){localStorage.setItem(imgKey,imgD);} else if(!imgF&&imgD.includes('assets/profile.png')){localStorage.removeItem(imgKey);} showAlert("OK!","success",alertProf);pwdInput.value='';confPwdInput.value='';imgInput.value=''; setTimeout(()=>{const navImg=document.getElementById('navbar-profile-image');const finalSrc=localStorage.getItem(imgKey)||'assets/profile.png';if(navImg)navImg.src=finalSrc; const navName=document.getElementById('navbar-user-name');if(navName)navName.textContent=n.split(' ')[0];}, 100);} catch(err){showAlert("Err save.","danger",alertProf);console.error(err);}}); }


}); // End DOMContentLoaded