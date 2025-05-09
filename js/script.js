document.addEventListener('DOMContentLoaded', function () {
    console.log("DOM Carregado. Iniciando script.js (v. localStorage para Produtos/Categorias)...");

    // --- Element References ---
    const loginForm = document.getElementById('loginForm');
    const alertPlaceholderLogin = document.getElementById('alert-placeholder');
    const wrapper = document.getElementById('wrapper');
    const tablesArea = document.getElementById('tables-area');
    const alertPlaceholderDashboard = document.getElementById('dashboard-alert-placeholder');
    const adminKitchenViewContainer = document.getElementById('admin-kitchen-view-container');
    const adminKitchenViewTitle = document.getElementById('admin-kitchen-view-title');
    const kitchenOrdersDisplayInline = document.getElementById('kitchen-orders-display-inline');
    const kitchenAlertPlaceholderInline = document.getElementById('kitchen-alert-placeholder-inline');
    const detailsColumn = document.getElementById('details-column');
    const selectedTableTitleElement = document.getElementById('selected-table-title');
    const orderItemsList = document.getElementById('order-items');
    const orderTotalSpan = document.getElementById('order-total');
    const productCategoryFilters = document.getElementById('product-category-filters');
    const profileForm = document.getElementById('profileForm');
    const closeAccountBtn = document.getElementById('close-account-btn');
    const reopenTableBtn = document.getElementById('reopen-table-btn');
    const finalizeTableBtn = document.getElementById('finalize-table-btn');
    const logoutButton = document.getElementById('logout-button');
    const navbarUserName = document.getElementById('navbar-user-name');
    const navbarProfileImage = document.getElementById('navbar-profile-image');
    const addProductCard = document.getElementById('add-product-card');
    const productListBody = document.getElementById('product-list-body');
    const productCategoryName = document.getElementById('product-category-name');
    const garcomToolsDiv = document.getElementById('garcom-tools');

    // --- Default Data (será usado se não houver nada no localStorage) ---
    const defaultCategories = [
        { k: 'bebidas', t: 'Bebidas', i: 'bi-cup-straw' },
        { k: 'pratos', t: 'Pratos', i: 'bi-egg-fried' },
        { k: 'lanches', t: 'Lanches', i: 'bi-badge-sd-fill' },
        { k: 'porcoes', t: 'Porções', i: 'bi-basket-fill' }
    ];
    const defaultAllProducts = [
        {id:1,name:'Coca-Cola Lata',price:5.00,category:'bebidas'},{id:2,name:'Suco Laranja 300ml',price:7.00,category:'bebidas'},
        {id:3,name:'Água Mineral c/ Gás',price:4.00,category:'bebidas'},{id:4,name:'Cerveja Long Neck',price:8.00,category:'bebidas'},
        {id:5,name:'Refrigerante 2L', price:10.00, category:'bebidas'}, // Adicionando mais 1
        {id:10,name:'PF Frango Grelhado',price:25.00,category:'pratos'},{id:11,name:'Parmegiana de Carne',price:35.00,category:'pratos'},
        {id:12,name:'Salada Caesar',price:22.00,category:'pratos'}, {id:13,name:'Feijoada Completa (Individual)',price:30.00,category:'pratos'},
        {id:14,name:'Strogonoff de Frango',price:28.00,category:'pratos'}, // Adicionando mais 1
        {id:20,name:'X-Burger Simples',price:15.00,category:'lanches'},{id:21,name:'X-Salada Completo',price:18.50,category:'lanches'},
        {id:22,name:'Misto Quente',price:10.00,category:'lanches'},{id:23,name:'Bauru Clássico',price:16.00,category:'lanches'},
        {id:24,name:'Americano no Prato',price:20.00,category:'lanches'}, // Adicionando mais 1
        {id:30,name:'Batata Frita Média',price:20.00,category:'porcoes'},{id:31,name:'Calabresa Acebolada',price:28.00,category:'porcoes'},
        {id:32,name:'Frango a Passarinho',price:32.00,category:'porcoes'},{id:33,name:'Mandioca Frita',price:22.00,category:'porcoes'},
        {id:34,name:'Anéis de Cebola',price:18.00,category:'porcoes'} // Adicionando mais 1
    ];

    // --- Variáveis para os dados que virão do localStorage ou defaults ---
    let categories = [];
    let allProducts = [];


    // --- Utility Functions ---
    function showAlert(message, type = 'info', placeholder = alertPlaceholderDashboard) {
        const target = placeholder || (loginForm ? alertPlaceholderLogin : (profileForm ? document.getElementById('profile-alert-placeholder') : kitchenAlertPlaceholderInline)) || alertPlaceholderDashboard;
        if (!target) { console.error("Alerta: Placeholder não encontrado para:", message); return; }
        target.innerHTML = ''; const aD = document.createElement('div'); aD.className = `alert alert-${type} alert-dismissible fade show m-0`; aD.setAttribute('role', 'alert'); aD.appendChild(document.createTextNode(message)); const cB = document.createElement('button'); cB.type = 'button'; cB.className = 'btn-close'; cB.setAttribute('data-bs-dismiss', 'alert'); cB.setAttribute('aria-label', 'Close'); aD.appendChild(cB); target.appendChild(aD);
    }
    const formatCurrency = (value) => (typeof value === 'number' && !isNaN(value) ? value : 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    // --- Data Loading and Initialization from LocalStorage ---
    function loadMasterData() {
        console.log("loadMasterData: Carregando categorias e produtos...");
        const storedCategories = localStorage.getItem('restaurantCategories');
        if (storedCategories) {
            try {
                categories = JSON.parse(storedCategories);
                console.log("loadMasterData: Categorias carregadas do localStorage:", categories.length);
            } catch (e) {
                console.error("Erro ao parsear categorias do localStorage, usando defaults:", e);
                categories = [...defaultCategories];
                localStorage.setItem('restaurantCategories', JSON.stringify(categories));
            }
        } else {
            console.log("loadMasterData: Nenhuma categoria no localStorage, usando e salvando defaults.");
            categories = [...defaultCategories]; // Copia para não modificar o original
            localStorage.setItem('restaurantCategories', JSON.stringify(categories));
        }

        const storedProducts = localStorage.getItem('restaurantProducts');
        if (storedProducts) {
            try {
                allProducts = JSON.parse(storedProducts);
                console.log("loadMasterData: Produtos carregados do localStorage:", allProducts.length);
            } catch (e) {
                console.error("Erro ao parsear produtos do localStorage, usando defaults:", e);
                allProducts = [...defaultAllProducts];
                localStorage.setItem('restaurantProducts', JSON.stringify(allProducts));
            }
        } else {
            console.log("loadMasterData: Nenhum produto no localStorage, usando e salvando defaults.");
            allProducts = [...defaultAllProducts]; // Copia para não modificar o original
            localStorage.setItem('restaurantProducts', JSON.stringify(allProducts));
        }
    }


    // --- Login Logic ---
    if (loginForm) {
        loginForm.addEventListener('submit', function handleLoginSubmit(event) {
            event.preventDefault();
            const usernameInput = document.getElementById('username'); const passwordInput = document.getElementById('password');
            const username = usernameInput.value.trim(); const password = passwordInput.value;
            if (alertPlaceholderLogin) alertPlaceholderLogin.innerHTML = '';
            if (!username || !password) { showAlert('Preencha usuário e senha.', 'warning', alertPlaceholderLogin); return; }
            const validUsers = { 'admin': { password: '123', data: { name: 'Admin', role: 'Admin' } }, 'garcom': { password: '123', data: { name: 'Garçom', role: 'Garçom' } } };
            let user = null; if (validUsers.hasOwnProperty(username) && validUsers[username].password === password) user = validUsers[username].data;
            if (user) { showAlert('Login OK! Redirecionando...', 'success', alertPlaceholderLogin); try { localStorage.setItem('loggedInUser', JSON.stringify(user)); localStorage.setItem('loggedInUsername', username); setTimeout(() => { window.location.href = 'dashboard.html'; }, 500); } catch (e) { showAlert('Erro ao salvar sessão local.', 'danger', alertPlaceholderLogin); } } else { showAlert('Usuário ou senha inválidos.', 'danger', alertPlaceholderLogin); }
        });
    }

    // --- Dashboard Logic ---
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    const loggedInUsername = localStorage.getItem('loggedInUsername');

    if (document.getElementById('tables-area') && loggedInUser && loggedInUsername) {
        console.log("Dashboard: Usuário logado:", loggedInUsername, "Role:", loggedInUser.role);

        const TOTAL_TABLES=15;let tablesData={};let selectedTableId=null;
        // `allProducts` e `categories` agora são populados por `loadMasterData`
        
        function initializeDashboard(){
            console.log("initializeDashboard: Iniciando...");
            loadMasterData(); // ** CARREGA PRODUTOS E CATEGORIAS PRIMEIRO **

            if(navbarUserName)navbarUserName.textContent=loggedInUser.name.split(' ')[0];
            if(navbarProfileImage){const img=localStorage.getItem(`userProfileImage_${loggedInUsername}_dataUrl`);navbarProfileImage.src=img||'assets/profile.png';}
            loadTablesData();renderTableButtons();setupAdminOrGarcomView();
            if(loggedInUser.role==='Garcom'){
                console.log("initializeDashboard: Configurando Garçom UI.");
                renderCategoryFilters();
                const fAC=productCategoryFilters?.querySelector('.btn-filter.active');
                renderProductList(fAC?.dataset.category);
                updateActionButtonsVisibility();displayTableOrder(null);
            }
            setupEventListeners();
            console.log("initializeDashboard: Concluído.");
        }

        function setupAdminOrGarcomView(){
            console.log("setupAdminOrGarcomView: Role:", loggedInUser.role);
            if(loggedInUser.role==='Admin'){
                if(detailsColumn)detailsColumn.style.display='none';
                if(garcomToolsDiv)garcomToolsDiv.style.display='none';
                if(adminKitchenViewContainer)adminKitchenViewContainer.style.display='none';
                document.body.classList.add('admin-view');
            }else{ 
                if(detailsColumn)detailsColumn.style.display='block';
                if(garcomToolsDiv)garcomToolsDiv.style.display='block';
                if(adminKitchenViewContainer)adminKitchenViewContainer.style.display='none';
                document.body.classList.remove('admin-view');
            }
            console.log("setupAdminOrGarcomView: garcomToolsDiv display:", garcomToolsDiv ? window.getComputedStyle(garcomToolsDiv).display : "não encontrado");
        }

        function setupEventListeners(){
            if(logoutButton){logoutButton.removeEventListener('click',handleLogout);logoutButton.addEventListener('click',handleLogout);}
            if(selectedTableTitleElement&&loggedInUser.role==='Garcom'){if(!selectedTableTitleElement.hasAttribute('data-people-listener')){selectedTableTitleElement.addEventListener('click',function(e){const aB=e.target.closest('.btn-people-adjust');if(aB)handlePeopleAdjust(aB);});selectedTableTitleElement.setAttribute('data-people-listener','true');}}
            if(kitchenOrdersDisplayInline&&loggedInUser.role==='Admin'){if(!kitchenOrdersDisplayInline.hasAttribute('data-kitchen-listener')){kitchenOrdersDisplayInline.addEventListener('click',handleKitchenOrderStatusChangeDelegated);kitchenOrdersDisplayInline.setAttribute('data-kitchen-listener','true');}}
            if(loggedInUser.role==='Garcom'){
                if(closeAccountBtn){closeAccountBtn.removeEventListener('click',handleCloseAccount);closeAccountBtn.addEventListener('click',handleCloseAccount);}
                if(reopenTableBtn){reopenTableBtn.removeEventListener('click',handleReopenTable);reopenTableBtn.addEventListener('click',handleReopenTable);}
                if(finalizeTableBtn){finalizeTableBtn.removeEventListener('click',handleFinalizeTable);finalizeTableBtn.addEventListener('click',handleFinalizeTable);}
            }
        }

        function loadTablesData(){const d=localStorage.getItem('restaurantTablesData');tablesData={};if(d){try{const p=JSON.parse(d);if(typeof p==='object'&&p!==null)tablesData=p;}catch(e){console.error(e);}}for(let i=1;i<=TOTAL_TABLES;i++){if(!tablesData[i]||typeof tablesData[i]!=='object'){tablesData[i]={items:[],total:0.0,status:'Livre',peopleCount:0,orderKitchenStatus:'Em Espera'};}else{if(!Array.isArray(tablesData[i].items))tablesData[i].items=[];if(!tablesData[i].status)tablesData[i].status=tablesData[i].items.length>0?'Ocupada':'Livre';if(typeof tablesData[i].peopleCount!=='number'||isNaN(tablesData[i].peopleCount))tablesData[i].peopleCount=0;if(!tablesData[i].orderKitchenStatus)tablesData[i].orderKitchenStatus='Em Espera';tablesData[i].total=tablesData[i].items.reduce((s,it)=>s+(it.price||0),0);}}}
        function saveTablesData(){try{localStorage.setItem('restaurantTablesData',JSON.stringify(tablesData));if(loggedInUser.role==='Admin'&&adminKitchenViewContainer.style.display==='block'&&selectedTableId){renderSingleTableForAdminKitchen(selectedTableId);}}catch(e){showAlert('Erro salvando.','danger');console.error(e);}}
        function renderTableButtons(){if(!tablesArea)return;tablesArea.innerHTML='';if(Object.keys(tablesData).length===0){tablesArea.innerHTML='<p class="text-muted">Nenhuma mesa</p>';return;}const ids=Object.keys(tablesData).map(id=>parseInt(id)).sort((a,b)=>a-b);ids.forEach(id=>{const t=tablesData[id];if(!t)return;const b=document.createElement('button');b.className=`btn table-button shadow-sm status-${(t.status||'livre').toLowerCase()}`;if(id.toString()===selectedTableId)b.classList.add('selected');b.dataset.tableId=id;updateTableButtonDisplay(b,id,t);b.removeEventListener('click',handleTableClick);b.addEventListener('click',handleTableClick);tablesArea.appendChild(b);});}
        function updateTableButtonDisplay(b,id,t){let p=t.peopleCount>0?` (${t.peopleCount} P)`:'';let s=t.status||'?';b.innerHTML=`<span class="table-button-main-text">Mesa ${id}</span><span class="table-button-sub-text">${s}${p}</span>`;}
        
        function renderCategoryFilters(){
            if(!productCategoryFilters || loggedInUser.role === 'Admin') {if(productCategoryFilters && loggedInUser.role === 'Admin') productCategoryFilters.innerHTML = '';return;}
            productCategoryFilters.innerHTML = '';
            if(categories.length > 0){categories.forEach((cat, idx)=>{const b=document.createElement('button');b.className=`btn btn-filter btn-sm ${idx===0?'active':''}`;b.dataset.category=cat.k;b.title=cat.t;b.innerHTML=`<i class="bi ${cat.i}"></i>`;b.removeEventListener('click',handleCategoryFilterClick);b.addEventListener('click',handleCategoryFilterClick);productCategoryFilters.appendChild(b);});}
            else{productCategoryFilters.innerHTML='<p class="text-muted small">Nenhuma categoria.</p>';}
        }
        
        function renderProductList(selectedCategoryKey = null) {
            if(loggedInUser.role==='Admin'){if(productListBody)productListBody.innerHTML='';if(productCategoryName)productCategoryName.textContent='N/A';return;}
            if(!selectedCategoryKey&&productCategoryFilters){const fA=productCategoryFilters.querySelector('.btn-filter.active');selectedCategoryKey=fA?.dataset.category||(categories.length>0?categories[0].k:null);}
            else if(!selectedCategoryKey&&categories.length>0){selectedCategoryKey=categories[0].k;}
            const prodsToDisp=selectedCategoryKey?allProducts.filter(p=>p.category===selectedCategoryKey):allProducts;
            renderProductTable(prodsToDisp);
            if(productCategoryName){const catInfo=categories.find(c=>c.k===selectedCategoryKey);productCategoryName.textContent=catInfo?catInfo.t:'Todos';}
        }

        function renderProductTable(prods){
            if(!productListBody){console.error("productListBody não encontrado!");return;}
            productListBody.innerHTML='';
            if(prods.length===0){const c=productCategoryName?productCategoryName.textContent:'selecionada';productListBody.innerHTML=`<tr><td colspan=3 class="text-muted text-center p-3 fst-italic">Nenhum produto (${c}).</td></tr>`;}
            else{prods.forEach(p=>{const tr=document.createElement('tr');tr.innerHTML=`<td>${p.name}</td><td class=text-end>${formatCurrency(p.price)}</td><td class=text-center><button class="btn btn-sm btn-success add-item-btn" data-product-id="${p.id}" data-product-name="${p.name}" data-product-price="${p.price}" title="Adicionar"><i class="bi bi-plus-lg"></i></button></td>`;const addBtn=tr.querySelector('.add-item-btn');if(addBtn){addBtn.removeEventListener('click',handleAddItem);addBtn.addEventListener('click',handleAddItem);}productListBody.appendChild(tr);});}
        }
        function renderTableTitleWithPeopleCount(tId,tbl){if(!selectedTableTitleElement)return;if(!tId||!tbl){selectedTableTitleElement.innerHTML='Selecione Mesa';return;}const pC=tbl.peopleCount||0;const cA=loggedInUser.role==='Garcom'&&(tbl.status==='Livre'||tbl.status==='Ocupada');let tH=`Mesa ${tId} `;if(cA){const dD=pC<=0?'disabled':'';tH+=`<span class="people-controls-inline ms-2"><button class="btn btn-people-adjust" data-table-id="${tId}" data-action="decrease" title="Diminuir" ${dD}><i class="bi bi-dash"></i></button><span id="people-display-inline" class="mx-2">${pC}</span><button class="btn btn-people-adjust" data-table-id="${tId}" data-action="increase" title="Aumentar"><i class="bi bi-plus"></i></button><span class="ms-1 small text-muted">Pessoas</span></span>`;}else if(pC>0){tH+=` <span class="text-muted small">(${pC} Pessoas)</span>`;}selectedTableTitleElement.innerHTML=tH;}
        function handleLogout(e){e.preventDefault();localStorage.removeItem('loggedInUser');localStorage.removeItem('loggedInUsername');window.location.href='index.html';}
        function handleCategoryFilterClick(e){const b=e.currentTarget;if(!b||loggedInUser.role==='Admin')return;productCategoryFilters.querySelectorAll('.btn-filter').forEach(btn=>btn.classList.remove('active'));b.classList.add('active');renderProductList(b.dataset.category);}
        function handleTableClick(e){const b=e.currentTarget;const id=b.dataset.tableId;document.querySelectorAll('.table-button.selected').forEach(btn=>btn.classList.remove('selected'));b.classList.add('selected');selectedTableId=id;if(loggedInUser.role==='Admin'){renderSingleTableForAdminKitchen(id);if(adminKitchenViewContainer)adminKitchenViewContainer.style.display='block';}else{displayTableOrder(id);updateActionButtonsVisibility(id);}}
        function handlePeopleAdjust(button){if(!button)return;const id=button.dataset.tableId;const act=button.dataset.action;if(!id||!tablesData[id])return;let cnt=tablesData[id].peopleCount||0;if(act==='increase')cnt++;else if(act==='decrease'&&cnt>0)cnt--;tablesData[id].peopleCount=cnt;renderTableTitleWithPeopleCount(id,tablesData[id]);updateTableButtonStatus(id);saveTablesData();}
        function handleAddItem(e){if(loggedInUser.role==='Admin')return;if(!selectedTableId){showAlert('Selecione mesa.','warning');return;}const t=tablesData[selectedTableId];if(!t){showAlert('Mesa inválida.','danger');return;}if(t.status==='Fechamento'){showAlert('Mesa fechando.','warning');return;}const b=e.currentTarget;const id=b.dataset.productId;const nm=b.dataset.productName;const pr=parseFloat(b.dataset.productPrice);if(isNaN(pr)){showAlert('Preço?','danger');return;}t.items.push({id:id,name:nm,price:pr});t.total=(t.total||0)+pr;t.status='Ocupada';if(t.peopleCount<=0)t.peopleCount=1;updateTableButtonStatus(selectedTableId);displayTableOrder(selectedTableId);updateActionButtonsVisibility(selectedTableId);saveTablesData();}
        function handleRemoveItem(e){if(loggedInUser.role==='Admin')return;if(!selectedTableId||!tablesData[selectedTableId])return;const b=e.currentTarget;const i=parseInt(b.dataset.itemIndex);const t=tablesData[selectedTableId];if(t.status==='Fechamento')return;if(!isNaN(i)&&i>=0&&i<t.items.length){t.items.splice(i,1);t.total=t.items.reduce((s,it)=>s+(it.price||0),0);if(t.items.length===0){t.status='Livre';t.total=0;t.peopleCount=0;}updateTableButtonStatus(selectedTableId);displayTableOrder(selectedTableId);updateActionButtonsVisibility(selectedTableId);saveTablesData();}}
        function handleCloseAccount(){if(loggedInUser.role!=='Garcom'||!selectedTableId||!tablesData[selectedTableId])return;const t=tablesData[selectedTableId];if(t.status==='Ocupada'&&t.items.length>0){t.status='Fechamento';updateTableButtonStatus(selectedTableId);displayTableOrder(selectedTableId);updateActionButtonsVisibility(selectedTableId);saveTablesData();showAlert(`M ${selectedTableId} p/ fechar.`,'info');}}
        function handleReopenTable(){if(loggedInUser.role!=='Garcom'||!selectedTableId||!tablesData[selectedTableId])return;const t=tablesData[selectedTableId];if(t.status==='Fechamento'){t.status='Ocupada';updateTableButtonStatus(selectedTableId);displayTableOrder(selectedTableId);updateActionButtonsVisibility(selectedTableId);saveTablesData();showAlert(`M ${selectedTableId} reaberta.`,'success');}}
        function handleFinalizeTable(){if(loggedInUser.role!=='Garcom'||!selectedTableId||!tablesData[selectedTableId])return;const t=tablesData[selectedTableId];if(t.status==='Fechamento'){generateReceipt(selectedTableId,t);t.items=[];t.total=0.0;t.status='Livre';t.peopleCount=0;updateTableButtonStatus(selectedTableId);displayTableOrder(selectedTableId);updateActionButtonsVisibility(selectedTableId);saveTablesData();showAlert(`M ${selectedTableId} finalizada.`,'success');}}
        function updateTableButtonStatus(id){const b=tablesArea?.querySelector(`.table-button[data-table-id="${id}"]`);if(!b||!tablesData[id])return;const t=tablesData[id];const c=`status-${(t.status||'livre').toLowerCase()}`;updateTableButtonDisplay(b,id,t);b.classList.remove('status-livre','status-ocupada','status-fechamento');b.classList.add(c);}
        function updateActionButtonsVisibility(id=selectedTableId){if(loggedInUser.role==='Admin')return;const t=id?tablesData[id]:null;if(!closeAccountBtn||!reopenTableBtn||!finalizeTableBtn)return;closeAccountBtn.classList.add('d-none');reopenTableBtn.classList.add('d-none');finalizeTableBtn.classList.add('d-none');if(t){if(t.status==='Ocupada'&&t.items.length>0){closeAccountBtn.classList.remove('d-none');}else if(t.status==='Fechamento'){reopenTableBtn.classList.remove('d-none');finalizeTableBtn.classList.remove('d-none');}}}
        function displayTableOrder(id){if(loggedInUser.role==='Admin')return;const t=id?tablesData[id]:null;renderTableTitleWithPeopleCount(id,t);if(!orderItemsList||!orderTotalSpan)return;orderItemsList.innerHTML='';if(t&&t.items.length>0){t.items.forEach((it,idx)=>{const li=document.createElement('li');li.classList.add('list-group-item');const cls=t.status==='Fechamento';const rm=!cls;li.innerHTML=`<span class=item-name>${it.name||'?'}</span><span class=item-price>${formatCurrency(it.price||0)}</span><button class="btn btn-sm btn-outline-danger remove-item-btn" data-item-index="${idx}" ${!rm?'disabled':''}><i class="bi bi-trash3"></i></button>`;if(rm)li.querySelector('.remove-item-btn').addEventListener('click',handleRemoveItem);orderItemsList.appendChild(li);});}else if(t){orderItemsList.innerHTML=`<li class="list-group-item text-muted text-center p-3">Mesa ${t.status}...</li>`;}else{orderItemsList.innerHTML='<li class="list-group-item text-muted text-center p-3">...</li>';}orderTotalSpan.textContent=formatCurrency(t?.total||0);}
        function renderSingleTableForAdminKitchen(id){if(loggedInUser.role!=='Admin'||!kitchenOrdersDisplayInline||!adminKitchenViewTitle)return;const t=tablesData[id];adminKitchenViewTitle.textContent=`Detalhes Pedido (Mesa ${id})`;kitchenOrdersDisplayInline.innerHTML='';if(t&&t.status!=='Livre'&&t.items&&t.items.length>0){const cD=document.createElement('div');cD.className='col-12 kitchen-card-wrapper';cD.dataset.tableId=id;let iH='<ul class="list-unstyled kitchen-item-list">';t.items.forEach(it=>{iH+=`<li><i class="bi bi-dot"></i> ${it.name||'?'}</li>`;});iH+='</ul>';let pT=t.peopleCount>0?`<span class="badge bg-secondary ms-2">${t.peopleCount} P</span>`:'';const oKS=t.orderKitchenStatus||'Em Espera';const sBC=oKS==='Pronto'?'bg-success':(oKS==='Cancelado'?'bg-danger':'bg-info');cD.innerHTML=`<div class="card kitchen-order-card shadow-sm mb-3"><div class="card-header bg-primary text-white d-flex justify-content-between align-items-center"><h5 class="mb-0">Mesa ${id}${pT} - <span class="badge ${sBC} order-kitchen-status-display">${oKS}</span></h5><span class="badge ${t.status==='Fechamento'?'bg-warning text-dark':'bg-light text-dark'}">${t.status}</span></div><div class="card-body">${iH}</div><div class="card-footer"><button class="btn btn-sm btn-outline-secondary btn-kitchen-status" data-table-id="${id}" data-status="Em Espera" ${oKS==='Em Espera'?'disabled':''}><i class="bi bi-hourglass-split me-1"></i>Em Espera</button><button class="btn btn-sm btn-success btn-kitchen-status" data-table-id="${id}" data-status="Pronto" ${oKS==='Pronto'?'disabled':''}><i class="bi bi-check-lg me-1"></i>Pronto</button></div></div>`;kitchenOrdersDisplayInline.appendChild(cD);}else{kitchenOrdersDisplayInline.innerHTML=`<div class="col-12"><div class="alert alert-secondary text-center">Mesa ${id} Livre ou sem pedidos.</div></div>`;}if(adminKitchenViewContainer)adminKitchenViewContainer.style.display='block';}
        function handleKitchenOrderStatusChangeDelegated(e){const sB=e.target.closest('.btn-kitchen-status');if(sB){const tId=sB.dataset.tableId;const nS=sB.dataset.status;if(tablesData[tId]){tablesData[tId].orderKitchenStatus=nS;const cW=sB.closest('.kitchen-card-wrapper');if(cW){const d=cW.querySelector('.order-kitchen-status-display');if(d){d.textContent=nS;d.className=`badge ${nS==='Pronto'?'bg-success':(nS==='Cancelado'?'bg-danger':'bg-info')} order-kitchen-status-display`;}cW.querySelectorAll('.btn-kitchen-status').forEach(b=>{b.disabled=(b.dataset.status===nS);});}showAlert(`Mesa ${tId}: pedido ${nS.toLowerCase()}.`,'success',kitchenAlertPlaceholderInline);saveTablesData();}}}
        function generateReceipt(id,data){const n=new Date();const dt=n.toLocaleString('pt-BR');let r='<html><head><title>Recibo Mesa '+id+'</title><style>body{font-family:monospace;margin:15px;font-size:10pt}h2,p.center{text-align:center;margin:3px 0}hr{border:none;border-top:1px dashed #000;margin:10px 0}table{width:100%;border-collapse:collapse;margin-top:5px}td{padding:2px 0}td:last-child{text-align:right}.total{font-weight:bold;margin-top:10px;text-align:right}@media print{button{display:none}}</style></head><body><h2>Bar Code</h2><p class=center>Rua Fictícia, 123</p><p class=center>CNPJ: 99.999.999/0001-99</p><hr><h2>Mesa '+id+'</h2><p class=center>Data/Hora: '+dt+'</p><p class=center>Pessoas: '+(data.peopleCount||'N/A')+'</p><hr><table><thead><tr><th>Item</th><th>Valor</th></tr></thead><tbody>';data.items.forEach(i=>{r+=`<tr><td>${i.name||'?'}</td><td>${formatCurrency(i.price||0)}</td></tr>`;});r+='</tbody></table><hr><div class=total>TOTAL: '+formatCurrency(data.total||0)+'</div><hr><p class=center>Obrigado!</p><div style=text-align:center;margin-top:20px><button onclick=window.print()>Imprimir</button><button onclick=window.close()>Fechar</button></div></body></html>';const rw=window.open('','_blank','width=300,height=550');if(rw){rw.document.write(r);rw.document.close();}else{showAlert('Popup bloqueado?','warning');}}

        initializeDashboard();

    } else if (!loginForm && !(loggedInUser && loggedInUsername) && !profileForm) {
        window.location.href = 'index.html';
    } else if (loggedInUser && loggedInUsername && !document.getElementById('tables-area') && !profileForm) {
        console.warn("Logado, mas não na página do dashboard ou perfil.");
    }


    if (profileForm && loggedInUser && loggedInUsername) {
        const nameInput=document.getElementById('profileName');const roleInput=document.getElementById('profileRole');const pwdInput=document.getElementById('profilePassword');const confPwdInput=document.getElementById('profileConfirmPassword');const imgInput=document.getElementById('profileImageInput');const curImg=document.getElementById('current-profile-image');const alertProf=document.getElementById('profile-alert-placeholder');
        if(nameInput)nameInput.value=loggedInUser.name||'';if(roleInput)roleInput.value=loggedInUser.role||'';const imgKey=`userProfileImage_${loggedInUsername}_dataUrl`;const savedImg=localStorage.getItem(imgKey);if(savedImg&&curImg){curImg.src=savedImg;}else if(curImg){curImg.src='assets/profile.png';}
        if(imgInput&&curImg){imgInput.addEventListener('change',function(e){const f=e.target.files[0];if(f&&f.type.startsWith('image/')){const rdr=new FileReader();rdr.onload=function(e){curImg.src=e.target.result;};rdr.onerror=function(e){showAlert("Err img.","danger",alertProf);};rdr.readAsDataURL(f);}else if(f){showAlert("Use PNG/JPG.","warning",alertProf);imgInput.value='';}});}
        if (profileForm) { 
            profileForm.addEventListener('submit',(e)=>{e.preventDefault();const nI=document.getElementById('profileName');const pI=document.getElementById('profilePassword');const cpI=document.getElementById('profileConfirmPassword');const iI=document.getElementById('profileImageInput');const cI=document.getElementById('current-profile-image');const aP=document.getElementById('profile-alert-placeholder');if(!aP)return;aP.innerHTML='';const n=nI.value.trim();const p=pI.value;const cp=cpI.value;const iF=iI.files[0];const iD=cI.src;if(!n){showAlert("Nome?","warning",aP);return;}if(p&&p!==cp){showAlert("Pwd diff.","warning",aP);return;}if(p&&p.length<3){showAlert("Pwd short.","warning",aP);return;}try{loggedInUser.name=n;if(p)loggedInUser.pwd_demo=p;localStorage.setItem('loggedInUser',JSON.stringify(loggedInUser));const iK=`userProfileImage_${loggedInUsername}_dataUrl`;if(iF&&iD&&iD.startsWith('data:image')){localStorage.setItem(iK,iD);}else if(!iF&&iD.includes('assets/profile.png')){localStorage.removeItem(iK);}showAlert("OK!","success",aP);pI.value='';cpI.value='';iI.value='';setTimeout(()=>{const navImg=document.getElementById('navbar-profile-image');const finalSrc=localStorage.getItem(iK)||'assets/profile.png';if(navImg)navImg.src=finalSrc;const navName=document.getElementById('navbar-user-name');if(navName)navName.textContent=n.split(' ')[0];},100);}catch(err){showAlert("Err save.","danger",aP);console.error(err);}});
        }
    } else if (profileForm && (!loggedInUser || !loggedInUsername)) {
        const alertPlaceholderProfile = document.getElementById('profile-alert-placeholder');
        if(alertPlaceholderProfile) showAlert("Sessão inválida. Por favor, faça login.", "warning", alertPlaceholderProfile);
        setTimeout(() => { window.location.href = 'index.html'; }, 2500);
    }
});